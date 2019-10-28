# yyl-copy-webpack-plugin

过滤规则使用 [https://www.npmjs.com/package/matcher](matcher) 插件

## USAGE
```javascript
const YylCopyWebpackPlugin = require('yyl-copy-webpack-plugin')

const wConfig = {
  plugins: [
    new YylCopyWebpackPlugin([{
      from: 'src/source',
      to: 'dist/assets/source',
      fileName: '[name].[ext]',
      matcher: ['*.html', '!**/.*']
    }, {
      from: 'src/source',
      to: 'dist/assets/source',
      fileName: '[name]-[hash:8].[ext]',
      minify: true,
      matcher: ['!*.html', '!**/.*']
    }])
  ]
}
```

## hooks
```javascript
let YylCopyWebpackPlugin
try {
  YylCopyWebpackPlugin = require('yyl-copy-webpack-plugin')
} catch (er) {
  if (!(e instanceof Error) || e.code !== 'MODULE_NOT_FOUND') {
    throw e;
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
[./index.d.ts](./index.d.ts)
