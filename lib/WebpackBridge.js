"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebpackBridge = void 0;
const fs = require("fs");
const serialize = require("serialize-javascript");
const isObject = require("is-object");
const configStore_1 = require("./configStore");
function normalizeAssets(assets) {
    if (isObject(assets)) {
        return Object.values(assets);
    }
    return Array.isArray(assets) ? assets : [assets];
}
class NotFoundDevMiddlewareError extends Error {
}
class WebpackBridge {
    constructor() {
        this.webpackOutputFolder = configStore_1.config.options;
        this.devMiddleware = configStore_1.config.devMiddleware;
        this.mode = configStore_1.config.devMiddleware ? 'middleware' : 'static';
    }
    // json with all compiled files and uniq names
    // TODO read from mainText file
    get assetsByChunkName() {
        if (!this.devMiddleware)
            throw new NotFoundDevMiddlewareError();
        return this.jsonWebpackStats.assetsByChunkName;
    }
    get jsonWebpackStats() {
        if (!this.devMiddleware)
            throw new NotFoundDevMiddlewareError();
        return this.devMiddleware.stats.toJson();
    }
    get outputPath() {
        if (!this.devMiddleware)
            throw new NotFoundDevMiddlewareError();
        return this.jsonWebpackStats.outputPath;
    }
    get ejsSyntaxOptions() {
        return {
            delimiter: '%',
            openDelimiter: '{',
            closeDelimiter: '}',
        };
    }
    fetchAllTags({ entry = 'main', endsWith, template, }) {
        return normalizeAssets(this.assetsByChunkName[entry])
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
    html(name = 'index.html') {
        if (this.devMiddleware) {
            return this.htmlFromDevMiddleware(name);
        }
        else {
            return fs.readFileSync(`${this.webpackOutputFolder}/${name}`, 'utf8');
        }
    }
    renderHtml(ejs, options = {}) {
        return (name, data) => {
            const htmlTemplate = this.html(name);
            return ejs.render(htmlTemplate, data, {
                ...this.ejsSyntaxOptions,
                options,
            });
        };
    }
    htmlFromDevMiddleware(name) {
        if (!this.devMiddleware)
            throw new NotFoundDevMiddlewareError();
        if (!this.devMiddleware.outputFileSystem) {
            throw new Error('webpack outputFileSystem is not available. Make sure set { index: true, serverSideRender: true } in webpackDevMiddleware');
        }
        return this.devMiddleware.outputFileSystem.readFileSync(`${this.outputPath}/${name}`, 'utf8');
    }
    setGlobals(object) {
        return Object.entries(object)
            .map(([key, value]) => {
            const data = serialize(value, { isJSON: true });
            return `window.${key} = JSON.parse('${data}')`;
        })
            .join('\n');
    }
}
exports.WebpackBridge = WebpackBridge;
