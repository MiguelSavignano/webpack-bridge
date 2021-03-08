import { IWebpackBridgeOptions } from './WebpackBridge';
export interface IWebpackBridgeMiddlewareOptions {
    webpackOutputFolder: string;
    handlePaths?: string[];
}
/**
 * Set res.webpackBridge helper
 */
export declare function webpackBridge({ webpackOutputFolder, handlePaths }: IWebpackBridgeOptions, callback?: () => void): (req: any, res: any, next: any) => Promise<void>;
