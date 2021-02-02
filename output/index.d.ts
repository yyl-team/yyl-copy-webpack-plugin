/// <reference types="node" />
import { Compilation, Compiler } from 'webpack';
import { AssetsInfo, YylWebpackPluginBaseOption, YylWebpackPluginBase } from 'yyl-webpack-plugin-base';
export interface AssetsSource {
    size(): number;
    map(options?: any): Object;
    sourceAndMap(options?: any): {
        source: string | Buffer;
        map: Object;
    };
    updateHash(hash: any): void;
    source(): string | Buffer;
    buffer(): Buffer;
}
export declare type FileInfo = Required<AssetsInfo>;
export interface CopyInfo {
    /** 原地址 */
    from: string;
    /** 目标地址 */
    to: string;
    /** 沿用 matcher 规则 */
    matcher?: string[];
    /** 文件名 默认为 [name]-[hash:8].[ext] */
    filename?: string;
}
export interface YylCopyWebpackPluginOption extends Pick<YylWebpackPluginBaseOption, 'context'> {
    /** 拷贝信息 */
    files?: CopyInfo[];
    /** 是否压缩 */
    minify?: boolean;
    /** 压缩是否支持 ie8 默认 false */
    ie8?: boolean;
    /** log 路径的 相对路径 */
    logContext?: string;
}
export default class YylCopyWebpackPlugin extends YylWebpackPluginBase {
    static getHooks(compilation: Compilation): any;
    static getName(): string;
    option: Required<YylCopyWebpackPluginOption>;
    constructor(option?: YylCopyWebpackPluginOption);
    formatSource(fileInfo: FileInfo): Promise<FileInfo>;
    apply(compiler: Compiler): Promise<void>;
}
