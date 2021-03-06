'use strict'
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const extOs = require('yyl-os')
const IPlugin = require('../../../')

console.log(IPlugin)

// + plugin options
const iPluginOption = {
  files: [
    {
      from: 'src/source/html/demo.html',
      to: 'dist/assets/source/html/demo.html',
      matcher: ['*.html', '!**/.*'],
      filename: '[name].[ext]'
    },
    {
      from: 'src/anypath',
      to: 'dist/assets/anypath',
      matcher: ['!*.html', '!**/.*'],
      filename: '[name].[ext]'
    },
    {
      from: 'src/anyfile.js',
      to: 'dist/assets/anyfile.js',
      matcher: ['!*.html', '!**/.*'],
      filename: '[name].[ext]'
    },
    {
      from: 'src/source',
      to: 'dist/assets/source',
      matcher: ['!*.html', '!**/.*'],
      filename: '[name]-[hash:8].[ext]'
    }
  ],
  minify: true,
  logBasePath: __dirname,
  basePath: __dirname
}
// - plugin options

const wConfig = {
  mode: 'development',
  context: __dirname,
  entry: {
    main: ['./src/entry/index/index.js']
  },
  output: {
    path: path.join(__dirname, './dist/js'),
    filename: '[name]-[chunkhash:8].js',
    chunkFilename: 'async_component/[name]-[chunkhash:8].js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader'
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    alias: {}
  },
  devtool: 'source-map',
  plugins: [
    new IPlugin(iPluginOption),
    new HtmlWebpackPlugin({
      template: './src/entry/index/index.html',
      filename: '../html/index.html',
      chunks: 'all'
    })
  ],
  watchOptions: {
    aggregateTimeout: 300,
    poll: true
  },
  devServer: {
    static: './dist',
    liveReload: true,
    port: 5000,
    open: true,
    openPage: 'http://127.0.0.1:5000/html/'
  }
}

module.exports = wConfig
