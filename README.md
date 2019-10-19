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

## ts
[./index.d.ts](./index.d.ts)
