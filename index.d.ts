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

declare class IWebpackPlugin {
  static getName(): string
  static getHooks(): iHooks
  constructor(options : ICopyOption[])
}
interface ICopyOption {
  from: string
  to: string
  matcher?: string[]
  fileName?: string
  uglify?: boolean
}
export =IWebpackPlugin 