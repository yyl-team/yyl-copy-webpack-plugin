const path = require('path')
const util = require('yyl-util')
const extFs = require('yyl-fs')
const fs = require('fs')
const matcher = require('matcher')
const createHash = require('crypto').createHash
const { getHooks } = require('./lib/hooks')
const CleanCss = require('clean-css')
const UglifyJs = require('uglify-js')



const PLUGIN_NAME = 'yylCopy'

const printError = function(err) {
  throw new Error(['yyl-copy-webpack-plugin error:', err])
}


class YylCopyWebpackPlugin {
  static getHooks(compilation) {
    return getHooks(compilation)
  }
  static getName() {
    return PLUGIN_NAME
  }
  constructor(opts) {
    this.options = opts.map((opt) => Object.assign({
      fileName: '[name]-[hash:8].[ext]',
      uglify: false
    }, opt))
  }
  getFileType(str) {
    str = str.replace(/\?.*/, '')
    const split = str.split('.')
    let ext = split[split.length - 1]
    if (ext === 'map' && split.length > 2) {
      ext = `${split[split.length - 2]}.${split[split.length - 1]}`
    }
    return ext
  }
  getFileName(name, cnt, option) {
    const { fileName } = option

    const REG_HASH = /\[hash:(\d+)\]/g
    const REG_NAME = /\[name\]/g
    const REG_EXT = /\[ext\]/g

    const dirname = path.dirname(name)
    const basename = path.basename(name)
    const ext = path.extname(basename).replace(/^\./, '')
    const iName = basename.slice(0, basename.length - (ext.length > 0 ? ext.length + 1 : 0))

    let hash = ''
    if (fileName.match(REG_HASH)) {
      let hashLen = 0
      fileName.replace(REG_HASH, (str, $1) => {
        hashLen = +$1
        hash = createHash('md5').update(cnt.toString()).digest('hex').slice(0, hashLen)
      })
    }
    const r = fileName
      .replace(REG_HASH, hash)
      .replace(REG_NAME, iName)
      .replace(REG_EXT, ext)

    return util.path.join(dirname, r)
  }
  formatSource(fileInfo, option) {
    if (option.minify) {
      const r = Object.assign({}, fileInfo)
      let minifyResult
      switch (path.extname(fileInfo.src)) {
        case '.js':
          minifyResult = UglifyJs.minify(r.source.toString())
          if (minifyResult.error) {
            return printError(minifyResult.error)
          }
          r.source = Buffer.from(minifyResult.code, 'utf-8')
          break
        case '.css':
          minifyResult = new CleanCss({}).minify(r.source.toString())
          if (minifyResult.errors && minifyResult.errors.length) {
            minifyResult.errors.forEach((error) => {
              printError(error)
            })
            return
          }
          r.source = Buffer.from(minifyResult.styles, 'utf-8')
          break
        default:
          break
      }
      return r
    } else {
      return fileInfo
    }
  }
  apply(compiler) {
    const { output, context } = compiler.options

    compiler.hooks.emit.tapAsync(PLUGIN_NAME, async (compilation, done) => {
      // + copy
      const iHooks = getHooks(compilation)
      await util.forEach(this.options, async (option) => {
        let fromPath = option.from
        let toPath = option.to
        if (option.basePath) {
          fromPath = path.resolve(option.basePath, fromPath)
          toPath = path.resolve(option.basePath, toPath)
        }
        fromPath = path.resolve(context, fromPath)
        toPath = path.resolve(context, toPath)

        let iFiles = extFs.readFilesSync(fromPath)
        if (option.matcher) {
          iFiles = matcher(iFiles, option.matcher)
        }

        const copyMap = {}
        await util.forEach(iFiles, async (iFile) => {
          const outputPath = util.path.join(
            toPath,
            path.relative(fromPath, iFile)
          )
          const assetName = util.path.relative(output.path, outputPath)

          let fileInfo = {
            src: iFile,
            dist: outputPath,
            source: fs.readFileSync(iFile)
          }

          // + hooks.beforeCopy
          fileInfo = await iHooks.beforeCopy.promise(fileInfo)
          // - hooks.beforeCopy

          fileInfo = this.formatSource(fileInfo, option)

          // + hooks.afterCopy
          fileInfo = await iHooks.afterCopy.promise(fileInfo)
          // - hooks.afterCopy


          const finalName = this.getFileName(assetName, fileInfo.source, option)
          copyMap[finalName] = fileInfo.source


          compilation.assets[finalName] = {
            source() {
              return copyMap[finalName]
            },
            size() {
              return copyMap[finalName].length
            }
          }
          compilation.hooks.moduleAsset.call({
            userRequest: util.path.join(output.path, assetName)
          }, util.path.join(output.path, finalName))
        })
        // const { fileMap } = option
      })
      // - copy
      done()
    })
  }
}

module.exports = YylCopyWebpackPlugin