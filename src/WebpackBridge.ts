import * as serialize from 'serialize-javascript';

export interface IDevMiddleware {
  stats: { toJson: () => any };
  outputFileSystem: { readFileSync: (arg0: string, arg1: string) => any };
}

export class WebpackBridge {
  constructor(public devMiddleware: IDevMiddleware) {}

  // json with all compiled files and uniq names
  get assetsByChunkName() {
    return this.devMiddleware.stats.toJson().assetsByChunkName;
  }

  get jsonWebpackStats() {
    return this.devMiddleware.stats.toJson();
  }

  get outputPath() {
    return this.jsonWebpackStats.outputPath;
  }

  html(name = 'index.html') {
    if (!this.devMiddleware.outputFileSystem)
      throw new Error(
        'webpack outputFileSystem is not available. Make sure set { index: true, serverSideRender: true } in webpackDevMiddleware',
      );
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
