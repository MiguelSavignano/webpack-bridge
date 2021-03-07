import { IWebpackBridgeOptions, WebpackBridge } from './WebpackBridge';
const express = require('express');

export interface IWebpackBridgeMiddlewareOptions {
  webpackOutputFolder: string;
  handlePaths?: string[];
}

/**
 * Set res.webpackBridge helper
 */
export function webpackBridge(options: IWebpackBridgeOptions) {
  return async function (req: any, res: any, next: any) {
    if (res.locals && res.locals.webpack && res.locals.webpack.devMiddleware) {
      webpackDevBridge(options)(req, res, next);
    } else {
      webpackStaticBridge(options)(req, res, next);
    }
  };
}

export function webpackDevBridge({
  webpackOutputFolder,
  handlePaths = ['/'],
}: IWebpackBridgeOptions) {
  return async function (req: any, res: any, next: any) {
    const { devMiddleware } = res.locals.webpack;
    res.webpackBridge = new WebpackBridge(
      { webpackOutputFolder, handlePaths },
      devMiddleware,
    );
    await next();
  };
}

export function webpackStaticBridge({
  webpackOutputFolder,
  handlePaths = ['/'],
}: IWebpackBridgeOptions) {
  return async function (req: any, res: any, next: any) {
    res.webpackBridge = new WebpackBridge(
      { webpackOutputFolder, handlePaths },
      null,
    );
    // Prevent render index.html with static middleware
    if (handlePaths.includes(req.path)) {
      await next();
    } else {
      express.static(webpackOutputFolder)(req, res, next);
    }
  };
}
