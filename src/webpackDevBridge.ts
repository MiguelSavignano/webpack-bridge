import { WebpackBridge } from './WebpackBridge';

/**
 * Set res.webpackBridge helper
 */
export function webpackDevBridge() {
  return async function (req: any, res: any, next: any) {
    const { devMiddleware } = res.locals.webpack;

    res.webpackBridge = new WebpackBridge(devMiddleware);
    await next();
  };
}
