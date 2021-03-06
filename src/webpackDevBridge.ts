import { IWebpackBridgeOptions, WebpackBridge } from './WebpackBridge';
const express = require('express');

/**
 * Set res.webpackBridge helper
 */
export function webpackBridge({
  webpackOutputFolder,
  handlePaths = ['/'],
}: IWebpackBridgeOptions) {
  return async function (req: any, res: any, next: any) {
    const options = { webpackOutputFolder, handlePaths };
    if (res.locals && res.locals.webpack && res.locals.webpack.devMiddleware) {
      webpackDevBridge(options)(req, res, next);
    } else {
      webpackStaticBridge(options)(req, res, next);
    }
  };
}

export function webpackDevBridge(options: IWebpackBridgeOptions) {
  return async function (req: any, res: any, next: any) {
    const { devMiddleware } = res.locals.webpack;
    res.webpackBridge = new WebpackBridge(options, devMiddleware);
    await next();
  };
}

export function webpackStaticBridge(options: IWebpackBridgeOptions) {
  return async function (req: any, res: any, next: any) {
    res.webpackBridge = new WebpackBridge(options, null);
    // Prevent render index.html with static middleware
    if (options.handlePaths.includes(req.path)) {
      await next();
    } else {
      express.static(options.webpackOutputFolder)(req, res, next);
    }
  };
}
