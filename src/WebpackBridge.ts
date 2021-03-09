import express from 'express';
import * as fs from 'fs';
import * as serialize from 'serialize-javascript';

export interface IWebpackBridgeOptions {
  webpackOutputFolder: string;
  handlePaths?: string[];
}

export interface IDevMiddleware {
  stats: { toJson: () => any };
  outputFileSystem: { readFileSync: (arg0: string, arg1: string) => any };
}

export interface IRenderModule {
  render(string: string, data: any, options?: any): string;
}

export class NotFoundDevMiddlewareError extends Error {}

function availableWebpackDevMiddleware(res: any) {
  return res.locals && res.locals.webpack && res.locals.webpack.devMiddleware;
}
export class WebpackBridge {
  public handlePaths: string[];
  public webpackOutputFolder: string;
  public webpackDevMiddleware: IDevMiddleware | null;
  public mode: string;

  constructor({ webpackOutputFolder = '' } = {}) {
    this.handlePaths = [];
    this.webpackOutputFolder = webpackOutputFolder;
  }

  public handler(routePath: string) {
    this.handlePaths = [...new Set([...this.handlePaths, routePath])];
    return routePath;
  }

  public get devMiddleware() {
    this.mode = 'devMiddleware';
    return async (req: any, res: any, next: any) => {
      if (availableWebpackDevMiddleware(res)) {
        this.webpackDevMiddleware = res.locals.webpack.devMiddleware;
        await next();
      }
    };
  }

  public staticMiddleware(
    staticHandler = (req: any, res: any, next: any) => {},
  ) {
    this.mode = 'static';
    return (req: any, res: any, next: any) => {
      if (this.handlePaths.includes(req.path)) {
        next();
      } else {
        staticHandler(req, res, next);
      }
    };
  }

  html(name = 'index.html') {
    if (this.webpackDevMiddleware) {
      return this.htmlFromDevMiddleware(name);
    } else {
      return fs.readFileSync(`${this.webpackOutputFolder}/${name}`, 'utf8');
    }
  }

  renderHtml(ejs: IRenderModule, options = {}) {
    return (name: string, data: any = {}) => {
      const htmlTemplate = this.html(name);

      return ejs.render(htmlTemplate, data, {
        ...this.ejsSyntaxOptions,
        options,
      });
    };
  }

  setGlobals(object: object) {
    return Object.entries(object)
      .map(([key, value]) => {
        const data = serialize(value, { isJSON: true });
        return `window.${key} = JSON.parse('${data}')`;
      })
      .join('\n');
  }

  private get jsonWebpackStats() {
    if (!this.webpackDevMiddleware) throw new NotFoundDevMiddlewareError();
    return this.webpackDevMiddleware.stats.toJson();
  }

  private get outputPath() {
    if (!this.webpackDevMiddleware) throw new NotFoundDevMiddlewareError();
    return this.jsonWebpackStats.outputPath;
  }

  get ejsSyntaxOptions() {
    return {
      delimiter: '%',
      openDelimiter: '{',
      closeDelimiter: '}',
    };
  }

  private htmlFromDevMiddleware(name: string) {
    if (!this.webpackDevMiddleware) throw new NotFoundDevMiddlewareError();

    if (!this.webpackDevMiddleware.outputFileSystem) {
      throw new Error(
        'webpack outputFileSystem is not available. Make sure set { index: true, serverSideRender: true } in webpackDevMiddleware',
      );
    }
    return this.webpackDevMiddleware.outputFileSystem.readFileSync(
      `${this.outputPath}/${name}`,
      'utf8',
    );
  }
}
