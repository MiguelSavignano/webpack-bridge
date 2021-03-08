"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webpackBridge = void 0;
const express = require('express');
function availableWebpackDevMiddleware(res) {
    return res.locals && res.locals.webpack && res.locals.webpack.devMiddleware;
}
/**
 * Set res.webpackBridge helper
 */
function webpackBridge({ webpackOutputFolder, handlePaths = ['/'] }, callback = () => { }) {
    return async function (req, res, next) {
        res.webpackBridge = { options: { webpackOutputFolder, handlePaths } };
        if (availableWebpackDevMiddleware(res)) {
            const { devMiddleware } = res.locals.webpack;
            res.webpackBridge.devMiddleware = devMiddleware;
            await next();
        }
        else {
            if (handlePaths.includes(req.path)) {
                await next();
            }
            else {
                callback();
            }
        }
    };
}
exports.webpackBridge = webpackBridge;