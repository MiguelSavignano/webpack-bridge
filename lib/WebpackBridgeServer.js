"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebpackBridgeServer = void 0;
const isObject = require("is-object");
const WebpackBridge_1 = require("./WebpackBridge");
function normalizeAssets(assets) {
    if (isObject(assets)) {
        return Object.values(assets);
    }
    return Array.isArray(assets) ? assets : [assets];
}
class WebpackBridgeServer extends WebpackBridge_1.WebpackBridge {
    constructor() {
        super();
    }
    // TODO read from manifest file
    assetsByChunkName() {
        // return this.readMAnifest();
        return {};
    }
    fetchAllTags({ entry = 'main', endsWith, template, }) {
        return normalizeAssets(this.assetsByChunkName()[entry])
            .filter((path) => path.endsWith(endsWith))
            .map(template)
            .join('\n');
    }
    allJsTags(entry = 'main', template = (path) => `<script src="${path}"></script>`) {
        return this.fetchAllTags({ entry, endsWith: '.js', template });
    }
    allCssTags(entry = 'main', template = (path) => `<link rel="stylesheet" href="${path}">`) {
        return this.fetchAllTags({ entry, endsWith: '.css', template });
    }
}
exports.WebpackBridgeServer = WebpackBridgeServer;
