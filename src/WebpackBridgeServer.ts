import * as isObject from 'is-object';
import { WebpackBridge } from './WebpackBridge';

function normalizeAssets(assets: any) {
  if (isObject(assets)) {
    return Object.values(assets);
  }

  return Array.isArray(assets) ? assets : [assets];
}

export class WebpackBridgeServer extends WebpackBridge {
  constructor() {
    super();
  }
  // TODO read from manifest file
  assetsByChunkName(): any {
    // return this.readMAnifest();
    return {};
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
    return normalizeAssets(this.assetsByChunkName()[entry])
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
}
