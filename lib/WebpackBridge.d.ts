export interface IWebpackBridgeOptions {
    webpackOutputFolder: string;
    handlePaths?: string[];
}
export interface IDevMiddleware {
    stats: {
        toJson: () => any;
    };
    outputFileSystem: {
        readFileSync: (arg0: string, arg1: string) => any;
    };
}
export interface IRenderModule {
    render(string: string, data: any, options?: any): string;
}
export declare class NotFoundDevMiddlewareError extends Error {
}
export declare class WebpackBridge {
    webpackOutputFolder: string;
    devMiddleware: IDevMiddleware | null;
    mode: string;
    constructor();
    private get jsonWebpackStats();
    private get outputPath();
    get ejsSyntaxOptions(): {
        delimiter: string;
        openDelimiter: string;
        closeDelimiter: string;
    };
    html(name?: string): any;
    renderHtml(ejs: IRenderModule, options?: {}): (name: string, data?: any) => string;
    private htmlFromDevMiddleware;
    setGlobals(object: object): string;
}
