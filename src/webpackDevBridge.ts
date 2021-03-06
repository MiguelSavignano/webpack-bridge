import { IWebpackBridgeOptions, WebpackBridge } from './WebpackBridge';
const express = require('express');
/**
 * Set res.webpackBridge helper
 */
export function webpackDevBridge({
  webpackOutputFolder,
  handlePaths = ['/'],
}: IWebpackBridgeOptions) {
  return async function (req: any, res: any, next: any) {
    const options = { webpackOutputFolder, handlePaths };
    if (res.locals && res.locals.webpack && res.locals.webpack.devMiddleware) {
      const { devMiddleware } = res.locals.webpack;
      res.webpackBridge = new WebpackBridge(options, devMiddleware);
      await next();
    } else {
      res.webpackBridge = new WebpackBridge(options, null);
      // Prevent render index.html with static middleware
      if (options.handlePaths.includes(req.path)) {
        await next();
      } else {
        express.static(options.webpackOutputFolder)(req, res, next);
      }
    }
  };
}
