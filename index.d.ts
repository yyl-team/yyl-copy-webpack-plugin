import { AsyncSeriesWaterfallHook } from 'tapable'

interface Hooks {
  beforeCopy: AsyncSeriesWaterfallHook<{
    src: string,
    dist: string,
    source: string
  }>
  afterCopy: AsyncSeriesWaterfallHook<{
    src: string,
    dist: string,
    source: string
  }>
}

declare class YylCopyWebpackPlugin {
  static getName(): string
  static getHooks(): Hooks
  constructor(option: Option)
}
interface YylCopyWebpackOption {
  /** 拷贝信息 */
  files?: CopyInfo[]
  /** 基本路径, 会用于 resolve files 里面的路径 */
  basePath?: string
  /** 是否压缩 */
  minify?: boolean
  /** log 路径的 相对路径 */
  logBasePath?: string
}

interface CopyInfo {
  /** 原地址 */
  from: string
  /** 目标地址 */
  to: string
  /** 沿用 matcher 规则 */
  matcher?: string[]
  /** 文件名 默认为 [name]-[hash:8].[ext] */
  filename?: string
}
export = YylCopyWebpackPlugin 