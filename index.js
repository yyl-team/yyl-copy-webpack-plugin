const path = require('path')
const util = require('yyl-util')
const extFs = require('yyl-fs')
const fs = require('fs')
const matcher = require('matcher')
const createHash = require('crypto').createHash
const minify = require('minify')
const tryToCatch = require('try-to-catch')
// const UglifyJS = require('uglify-es')

const PLUGIN_NAME = 'yylCopy'
// const printError = function(msg) {
//   throw `yyl-copy-webpack-plugin error: ${msg}`
// }


class YylCopyWebpackPlugin {
  constructor(opts) {
    this.options = opts.map((opt) => Object.assign({
      fileMap: {},
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
  async formatSource(filePath, option) {
    if (option.minify) {
      const [err, data] = await tryToCatch(minify, filePath)
      if (err) {
        return fs.readFileSync(filePath)
      }
      return data
    } else {
      return fs.readFileSync(filePath)
    }
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
  apply(compiler) {
    const { output } = compiler.options

    compiler.hooks.emit.tapAsync(PLUGIN_NAME, async (compilation, done) => {
      // + copy
      await util.forEach(this.options, async (option) => {
        let iFiles = extFs.readFilesSync(option.from)
        if (option.matcher) {
          iFiles = matcher(iFiles, option.matcher)
        }

        const copyMap = {}
        await util.forEach(iFiles, async (iFile) => {
          const outputPath = util.path.join(option.to, path.relative(option.from, iFile))
          const assetName = util.path.relative(output.path, outputPath)
          const cnt = await this.formatSource(iFile, option)
          const finalName = this.getFileName(assetName, cnt, option)
          copyMap[finalName] = cnt

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

    // compiler.hooks.emit.tap(
    //   PLUGIN_NAME,
    //   (compilation) => {
    //     // + copy
    //     const copyMap = {}
    //     Object.keys(fileMap).forEach((oPath) => {
    //       const iFiles = extFs.readFilesSync(oPath)
    //       iFiles.forEach((iFile) => {
    //         const outputPath = util.path.join(fileMap[oPath], path.relative(oPath, iFile))
    //         const assetName = util.path.relative(output.path, outputPath)
    //         const cnt = this.formatSource(iFile)
    //         const finalName = this.getFileName(assetName, cnt)
    //         copyMap[finalName] = cnt

    //         compilation.assets[finalName] = {
    //           source() {
    //             return copyMap[finalName]
    //           },
    //           size() {
    //             return copyMap[finalName].length
    //           }
    //         }
    //         compilation.hooks.moduleAsset.call({
    //           userRequest: util.path.join(output.path, assetName)
    //         }, util.path.join(output.path, finalName))
    //       })
    //     })
    //     // - copy
    //   }
    // )
  }
}

module.exports = YylCopyWebpackPlugin