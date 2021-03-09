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
    handlePaths: string[];
    webpackOutputFolder: string;
    webpackDevMiddleware: IDevMiddleware | null;
    mode: string;
    constructor({ webpackOutputFolder }?: {
        webpackOutputFolder?: string | undefined;
    });
    handler(routePath: string): string;
    get devMiddleware(): (req: any, res: any, next: any) => Promise<void>;
    staticMiddleware(staticHandler?: (req: any, res: any, next: any) => void): (req: any, res: any, next: any) => void;
    html(name?: string): any;
    renderHtml(ejs: IRenderModule, options?: {}): (name: string, data?: any) => string;
    setGlobals(object: object): string;
    private get jsonWebpackStats();
    private get outputPath();
    get ejsSyntaxOptions(): {
        delimiter: string;
        openDelimiter: string;
        closeDelimiter: string;
    };
    private htmlFromDevMiddleware;
}
