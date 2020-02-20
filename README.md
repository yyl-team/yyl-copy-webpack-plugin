# yyl-copy-webpack-plugin

过滤规则使用 [https://www.npmjs.com/package/matcher](matcher) 插件

## USAGE
```javascript
const YylCopyWebpackPlugin = require('yyl-copy-webpack-plugin')

const wConfig = {
  plugins: [
    new YylCopyWebpackPlugin({
      /** 拷贝信息 */
      files: [{
        from: 'src/source',
        to: 'dist/assets/source',
        matcher: ['*.html', '!**/.*']
      }, {
        from: 'src/source',
        to: 'dist/assets/source',
        matcher: ['!*.html', '!**/.*']
      }],
      /** 文件名 默认为 [name]-[hash:8].[ext] */
      filename: '[name]-[hash:8].[ext]',
      /** 是否压缩 */
      minify: true,
      /** log 路径的 相对路径 */
      logBasePath: __dirname,
      /** 基本路径, 会用于 resolve files 里面的路径 */
      basePath: __dirname
    })
  ]
}
```

## hooks
```javascript
let YylCopyWebpackPlugin
try {
  YylCopyWebpackPlugin = require('yyl-copy-webpack-plugin')
} catch (e) {
  if (!(e instanceof Error) || e.code !== 'MODULE_NOT_FOUND') {
    throw e
  }
}

const PLUGIN_NAME = 'your_plugin'
class ExtPlugin {
  apply (compiler) {
    const IPlugin = YylCopyWebpackPlugin
    if (IPlugin) {
      compiler.hooks.compilation.tap(IPlugin.getName(), (compilation) => {
        IPlugin.getHooks(compilation).beforeCopy.tapAsync(PLUGIN_NAME, (obj, done) => {
          console.log('hooks.beforeConcat(obj, done)', 'obj:', obj)
          done(null, obj)
        })
        IPlugin.getHooks(compilation).afterCopy.tapAsync(PLUGIN_NAME, (obj, done) => {
          console.log('hooks.afterConcat(obj, done)', 'obj:', obj)
          done(null, obj)
        })
      })
    }
  }
}
```

## ts
```typescript
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
  /** 文件名 默认为 [name]-[hash:8].[ext] */
  filename?: string
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
}
export = YylCopyWebpackPlugin 
```
