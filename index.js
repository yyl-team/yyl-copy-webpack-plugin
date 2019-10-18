const path = require('path')
const util = require('yyl-util')
const extFs = require('yyl-fs')
const fs = require('fs')
const createHash = require('crypto').createHash
// const UglifyJS = require('uglify-es')

const PLUGIN_NAME = 'yylCopy'
// const printError = function(msg) {
//   throw `yyl-copy-webpack-plugin error: ${msg}`
// }


class YylCopyWebpackPlugin {
  constructor(op) {
    this.option = Object.assign({
      fileMap: {},
      fileName: '[name]-[hash:8].[ext]',
      uglify: false
    }, op)
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
  formatSource(filePath) {
    return fs.readFileSync(filePath)
  }
  getFileName(name, cnt) {
    const { fileName } = this.option

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
    const { fileMap } = this.option

    compiler.hooks.emit.tap(
      PLUGIN_NAME,
      (compilation) => {
        // + copy
        const copyMap = {}
        Object.keys(fileMap).forEach((oPath) => {
          const iFiles = extFs.readFilesSync(oPath)
          iFiles.forEach((iFile) => {
            const outputPath = util.path.join(fileMap[oPath], path.relative(oPath, iFile))
            const assetName = util.path.relative(output.path, outputPath)
            const cnt = this.formatSource(iFile)
            const finalName = this.getFileName(assetName, cnt)
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
        })
        // - copy
      }
    )
  }
}

module.exports = YylCopyWebpackPlugin