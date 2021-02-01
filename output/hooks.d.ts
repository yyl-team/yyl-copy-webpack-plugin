import { AsyncSeriesWaterfallHook } from 'tapable';
import { Compilation } from 'webpack';
export declare function createHooks(): {
    beforeCopy: AsyncSeriesWaterfallHook<unknown, import("tapable").UnsetAdditionalOptions>;
    afterCopy: AsyncSeriesWaterfallHook<unknown, import("tapable").UnsetAdditionalOptions>;
};
export declare function getHooks(compilation: Compilation): any;
