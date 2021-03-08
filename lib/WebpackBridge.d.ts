export interface IWebpackBridgeOptions {
    webpackOutputFolder: string;
    handlePaths?: string[];
}
export interface IWebpackBridgeOptions {
    webpackOutputFolder: string;
}
export interface IDevMiddleware {
    stats: {
        toJson: () => any;
    };
    outputFileSystem: {
        readFileSync: (arg0: string, arg1: string) => any;
    };
}
export declare class WebpackBridge {
    webpackOutputFolder: string;
    devMiddleware: IDevMiddleware | null;
    constructor({ options, devMiddleware, }: {
        options: IWebpackBridgeOptions;
        devMiddleware: IDevMiddleware | null;
    });
    private get assetsByChunkName();
    private get jsonWebpackStats();
    private get outputPath();
    get ejsSyntaxOptions(): {
        delimiter: string;
        openDelimiter: string;
        closeDelimiter: string;
    };
    fetchAllTags({ entry, endsWith, template, }: {
        entry: string;
        endsWith: string;
        template: (path: string) => string;
    }): string;
    allJsTags(entry?: string, template?: (path: string) => string): string;
    allCssTags(entry?: string, template?: (path: string) => string): string;
    html(name?: string): any;
    private htmlFromDevMiddleware;
    setGlobals(object: object): string;
}
