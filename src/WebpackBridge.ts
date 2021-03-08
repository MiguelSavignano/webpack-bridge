import * as fs from 'fs';
import * as serialize from 'serialize-javascript';
import { config } from './configStore';

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

export class WebpackBridge {
  webpackOutputFolder: string;
  devMiddleware: IDevMiddleware | null;
  mode: string;

  constructor() {
    this.webpackOutputFolder = config.options.webpackOutputFolder;
    this.devMiddleware = config.devMiddleware;
    this.mode = config.devMiddleware ? 'middleware' : 'static';
  }

  private get jsonWebpackStats() {
    if (!this.devMiddleware) throw new NotFoundDevMiddlewareError();
    return this.devMiddleware.stats.toJson();
  }

  private get outputPath() {
    if (!this.devMiddleware) throw new NotFoundDevMiddlewareError();
    return this.jsonWebpackStats.outputPath;
  }

  get ejsSyntaxOptions() {
    return {
      delimiter: '%',
      openDelimiter: '{',
      closeDelimiter: '}',
    };
  }

  html(name = 'index.html') {
    if (this.devMiddleware) {
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

  private htmlFromDevMiddleware(name: string) {
    if (!this.devMiddleware) throw new NotFoundDevMiddlewareError();

    if (!this.devMiddleware.outputFileSystem) {
      throw new Error(
        'webpack outputFileSystem is not available. Make sure set { index: true, serverSideRender: true } in webpackDevMiddleware',
      );
    }
    return this.devMiddleware.outputFileSystem.readFileSync(
      `${this.outputPath}/${name}`,
      'utf8',
    );
  }

  setGlobals(object: object) {
    return Object.entries(object)
      .map(([key, value]) => {
        const data = serialize(value, { isJSON: true });
        return `window.${key} = JSON.parse('${data}')`;
      })
      .join('\n');
  }
}
