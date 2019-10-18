declare class IWebpackPlugin {
  constructor(op: IWebpackPluginOptions)
}
interface IWebpackPluginOptions {
  fileMap: {[oPath: string]: string}
  fileName?: string
  uglify?: boolean
}
export =IWebpackPlugin 