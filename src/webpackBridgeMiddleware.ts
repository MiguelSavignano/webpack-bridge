import { IWebpackBridgeOptions, WebpackBridge } from './WebpackBridge';
import { config } from './configStore';

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
    config.options = { webpackOutputFolder, handlePaths };
    if (availableWebpackDevMiddleware(res)) {
      const { devMiddleware } = res.locals.webpack;
      config.devMiddleware = devMiddleware;
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
