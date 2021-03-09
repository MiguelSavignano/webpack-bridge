"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebpackBridge = exports.NotFoundDevMiddlewareError = void 0;
const fs = require("fs");
const serialize = require("serialize-javascript");
class NotFoundDevMiddlewareError extends Error {
}
exports.NotFoundDevMiddlewareError = NotFoundDevMiddlewareError;
function availableWebpackDevMiddleware(res) {
    return res.locals && res.locals.webpack && res.locals.webpack.devMiddleware;
}
class WebpackBridge {
    constructor({ webpackOutputFolder = '' } = {}) {
        this.handlePaths = [];
        this.webpackOutputFolder = webpackOutputFolder;
    }
    handler(routePath) {
        this.handlePaths = [...new Set([...this.handlePaths, routePath])];
        return routePath;
    }
    get devMiddleware() {
        this.mode = 'devMiddleware';
        return async (req, res, next) => {
            if (availableWebpackDevMiddleware(res)) {
                this.webpackDevMiddleware = res.locals.webpack.devMiddleware;
                await next();
            }
        };
    }
    staticMiddleware(staticHandler = (req, res, next) => { }) {
        this.mode = 'static';
        return (req, res, next) => {
            if (this.handlePaths.includes(req.path)) {
                next();
            }
            else {
                staticHandler(req, res, next);
            }
        };
    }
    html(name = 'index.html') {
        if (this.webpackDevMiddleware) {
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
    setGlobals(object) {
        return Object.entries(object)
            .map(([key, value]) => {
            const data = serialize(value, { isJSON: true });
            return `window.${key} = JSON.parse('${data}')`;
        })
            .join('\n');
    }
    get jsonWebpackStats() {
        if (!this.webpackDevMiddleware)
            throw new NotFoundDevMiddlewareError();
        return this.webpackDevMiddleware.stats.toJson();
    }
    get outputPath() {
        if (!this.webpackDevMiddleware)
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
    htmlFromDevMiddleware(name) {
        if (!this.webpackDevMiddleware)
            throw new NotFoundDevMiddlewareError();
        if (!this.webpackDevMiddleware.outputFileSystem) {
            throw new Error('webpack outputFileSystem is not available. Make sure set { index: true, serverSideRender: true } in webpackDevMiddleware');
        }
        return this.webpackDevMiddleware.outputFileSystem.readFileSync(`${this.outputPath}/${name}`, 'utf8');
    }
}
exports.WebpackBridge = WebpackBridge;
