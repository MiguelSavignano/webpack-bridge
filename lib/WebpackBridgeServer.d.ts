import { WebpackBridge } from './WebpackBridge';
export declare class WebpackBridgeServer extends WebpackBridge {
    constructor();
    assetsByChunkName(): any;
    fetchAllTags({ entry, endsWith, template, }: {
        entry: string;
        endsWith: string;
        template: (path: string) => string;
    }): string;
    allJsTags(entry?: string, template?: (path: string) => string): string;
    allCssTags(entry?: string, template?: (path: string) => string): string;
}
