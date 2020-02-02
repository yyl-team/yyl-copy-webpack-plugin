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
  constructor(options : CopyOption[])
}
interface CopyOption {
  from: string
  to: string
  basePath?: string
  matcher?: string[]
  fileName?: string
  uglify?: boolean
}
export = YylCopyWebpackPlugin 