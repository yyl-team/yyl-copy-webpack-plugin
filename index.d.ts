declare class IWebpackPlugin {
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