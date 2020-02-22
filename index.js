const path = require('path')
const util = require('yyl-util')
const extFs = require('yyl-fs')
const fs = require('fs')
const matcher = require('matcher')
const createHash = require('crypto').createHash
const { getHooks } = require('./lib/hooks')
const CleanCss = require('clean-css')
const Terser = require('terser')

const LANG = require('./lang/index')

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
  constructor(op) {
    const { files, minify, logBasePath, basePath, ie8 } = op
    this.option = {
      files: files ? files.map((info) => {
        info.filename = info.filename || '[name]-[hash:8].[ext]'
        return info
      }) : [],
      minify: minify || false,
      basePath,
      ie8,
      logBasePath: logBasePath || process.cwd()
    }
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
  getFileName(name, cnt, filename) {
    const REG_HASH = /\[hash:(\d+)\]/g
    const REG_NAME = /\[name\]/g
    const REG_EXT = /\[ext\]/g

    const dirname = path.dirname(name)
    const basename = path.basename(name)
    const ext = path.extname(basename).replace(/^\./, '')
    const iName = basename.slice(0, basename.length - (ext.length > 0 ? ext.length + 1 : 0))

    let hash = ''
    if (filename.match(REG_HASH)) {
      let hashLen = 0
      filename.replace(REG_HASH, (str, $1) => {
        hashLen = +$1
        hash = createHash('md5').update(cnt.toString()).digest('hex').slice(0, hashLen)
      })
    }
    const r = filename
      .replace(REG_HASH, hash)
      .replace(REG_NAME, iName)
      .replace(REG_EXT, ext)

    return util.path.join(dirname, r)
  }
  formatSource(fileInfo) {
    const { minify, ie8 } = this.option

    if (minify) {
      const r = Object.assign({}, fileInfo)
      let minifyResult
      switch (path.extname(fileInfo.src)) {
        case '.js':
          minifyResult = Terser.minify(r.source.toString(), {
            ie8
          })
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
    const { basePath, logBasePath, files, ie8, minify } = this.option

    if (!files || !files.length) {
      return
    }

    compiler.hooks.emit.tapAsync(PLUGIN_NAME, async (compilation, done) => {

      /** 文件写入操作 */
      const assetsFile = async (fileInfo, filename) => {
        // + hooks.beforeCopy
        fileInfo = await iHooks.beforeCopy.promise(fileInfo)
        // - hooks.beforeCopy

        fileInfo = this.formatSource(fileInfo)

        // + hooks.afterCopy
        fileInfo = await iHooks.afterCopy.promise(fileInfo)
        // - hooks.afterCopy

        const assetName = util.path.relative(output.path, fileInfo.dist)

        // add watch
        compilation.fileDependencies.add(fileInfo.src)


        const finalName = this.getFileName(assetName, fileInfo.source, filename)

        logger.info(`${finalName} <- [${path.relative(logBasePath, fileInfo.src)}]`)
        compilation.assets[finalName] = {
          source() {
            return fileInfo.source
          },
          size() {
            return fileInfo.source.length
          }
        }
        compilation.hooks.moduleAsset.call({
          userRequest: assetName
        }, finalName)
      }
      // + copy
      const iHooks = getHooks(compilation)
      const logger = compilation.getLogger(PLUGIN_NAME)
      logger.group(PLUGIN_NAME)
      logger.info(`${LANG.MINIFY_INFO}: ${minify || 'false'}`)
      logger.info(`${LANG.IE8_INFO}: ${ie8 || 'false'}`)
      logger.info(`${LANG.COPY_INFO}:`)
      await util.forEach(files, async (copyInfo) => {
        let fromPath = copyInfo.from
        let toPath = copyInfo.to
        if (basePath) {
          fromPath = path.resolve(basePath, fromPath)
          toPath = path.resolve(basePath, toPath)
        }
        fromPath = path.resolve(context, fromPath)
        toPath = path.resolve(context, toPath)

        // is file
        if (!fs.statSync(fromPath).isDirectory()) {
          await assetsFile({
            src: fromPath,
            dist: toPath,
            source: fs.readFileSync(fromPath)
          }, copyInfo.filename)
        } else { // is directory
          let iFiles = extFs.readFilesSync(fromPath)
          if (copyInfo.matcher) {
            iFiles = matcher(iFiles, copyInfo.matcher)
          }

          await util.forEach(iFiles, async (iFile) => {
            const outputPath = util.path.join(
              toPath,
              path.relative(fromPath, iFile)
            )
            await assetsFile({
              src: iFile,
              dist: outputPath,
              source: fs.readFileSync(iFile)
            }, copyInfo.filename)
          })
        }
      })
      // - copy

      logger.groupEnd()
      done()
    })
  }
}

module.exports = YylCopyWebpackPlugin