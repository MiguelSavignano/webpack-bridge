import { IWebpackBridgeOptions, WebpackBridge } from './WebpackBridge';
const express = require('express');

export interface IWebpackBridgeMiddlewareOptions {
  webpackOutputFolder: string;
  handlePaths?: string[];
}

function availableWebpackDevMiddleware(res: any) {
  return res.locals && res.locals.webpack && res.locals.webpack.devMiddleware;
}

/**
 * Set res.webpackBridge helper
 */
export function webpackBridge(
  { webpackOutputFolder, handlePaths = ['/'] }: IWebpackBridgeOptions,
  callback = () => {},
) {
  return async function (req: any, res: any, next: any) {
    res.webpackBridge = { options: { webpackOutputFolder, handlePaths } };

    if (availableWebpackDevMiddleware(res)) {
      const { devMiddleware } = res.locals.webpack;
      res.webpackBridge.devMiddleware = devMiddleware;
      await next();
    } else {
      if (handlePaths.includes(req.path)) {
        await next();
      } else {
        callback();
      }
    }
  };
}
