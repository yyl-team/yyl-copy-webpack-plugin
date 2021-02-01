/// <reference types="node" />
import { Compilation, Compiler } from 'webpack';
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
export interface FileInfo {
    src: string;
    dist: string;
    source: Buffer;
}
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
export interface YylCopyWebpackPluginOption {
    /** 拷贝信息 */
    files?: CopyInfo[];
    /** 基本路径, 会用于 resolve files 里面的路径 */
    basePath?: string;
    /** 是否压缩 */
    minify?: boolean;
    /** 压缩是否支持 ie8 默认 false */
    ie8?: boolean;
    /** log 路径的 相对路径 */
    logBasePath?: string;
}
export default class YylCopyWebpackPlugin {
    static getHooks(compilation: Compilation): any;
    static getName(): string;
    option: Required<YylCopyWebpackPluginOption>;
    constructor(option?: YylCopyWebpackPluginOption);
    getFileType(str: string): string;
    getFileName(name: string, cnt: Buffer, filename: string): string;
    formatSource(fileInfo: FileInfo): Promise<FileInfo>;
    apply(compiler: Compiler): void;
}
