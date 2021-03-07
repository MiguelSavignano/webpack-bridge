import * as fs from 'fs';
import * as serialize from 'serialize-javascript';
const isObject = require('is-object');

export interface IWebpackBridgeOptions {
  webpackOutputFolder: string;
  handlePaths: string[];
}
export interface IDevMiddleware {
  stats: { toJson: () => any };
  outputFileSystem: { readFileSync: (arg0: string, arg1: string) => any };
}

function normalizeAssets(assets: any) {
  if (isObject(assets)) {
    return Object.values(assets);
  }

  return Array.isArray(assets) ? assets : [assets];
}

class NotFoundDevMiddlewareError extends Error {}

export class WebpackBridge {
  webpackOutputFolder: string;
  constructor(
    options: IWebpackBridgeOptions,
    public devMiddleware?: IDevMiddleware | null,
  ) {
    this.webpackOutputFolder = options && options.webpackOutputFolder;
  }

  // json with all compiled files and uniq names
  private get assetsByChunkName() {
    if (!this.devMiddleware) throw new NotFoundDevMiddlewareError();
    return this.jsonWebpackStats.assetsByChunkName;
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

  fetchAllTags({
    entry = 'main',
    endsWith,
    template,
  }: {
    entry: string;
    endsWith: string;
    template: (path: string) => string;
  }) {
    return normalizeAssets(this.assetsByChunkName[entry])
      .filter((path) => path.endsWith(endsWith))
      .map(template)
      .join('\n');
  }

  allJsTags(
    entry = 'main',
    template = (path: string) => `<script src="${path}"></script>`,
  ) {
    return this.fetchAllTags({ entry, endsWith: '.js', template });
  }

  allCssTags(
    entry = 'main',
    template = (path: string) => `<link rel="stylesheet" href="${path}">`,
  ) {
    return this.fetchAllTags({ entry, endsWith: '.css', template });
  }

  html(name = 'index.html') {
    if (this.devMiddleware) {
      return this.htmlFromDevMiddleware(name);
    } else {
      return fs.readFileSync(`${this.webpackOutputFolder}/${name}`, 'utf8');
    }
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
