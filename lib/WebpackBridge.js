"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebpackBridge = exports.NotFoundDevMiddlewareError = void 0;
const fs = require("fs");
const serialize = require("serialize-javascript");
const configStore_1 = require("./configStore");
class NotFoundDevMiddlewareError extends Error {
}
exports.NotFoundDevMiddlewareError = NotFoundDevMiddlewareError;
class WebpackBridge {
    constructor() {
        this.webpackOutputFolder = configStore_1.config.options.webpackOutputFolder;
        this.devMiddleware = configStore_1.config.devMiddleware;
        this.mode = configStore_1.config.devMiddleware ? 'middleware' : 'static';
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
    html(name = 'index.html') {
        if (this.devMiddleware) {
            return this.htmlFromDevMiddleware(name);
        }
        else {
            return fs.readFileSync(`${this.webpackOutputFolder}/${name}`, 'utf8');
        }
    }
    renderHtml(ejs, options = {}) {
        return (name, data = {}) => {
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
