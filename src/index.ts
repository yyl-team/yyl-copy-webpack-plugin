import path from 'path'
import fs from 'fs'
import CleanCss from 'clean-css'
import util from 'yyl-util'
import extFs from 'yyl-fs'
import matcher from 'matcher'
import { createHash } from 'crypto'
import * as Terser from 'terser'
import chalk from 'chalk'
import { getHooks } from './hooks'
import { LANG } from './lang'
import { Compilation, Compiler } from 'webpack'

const PLUGIN_NAME = 'yylCopy'
const printError = function (err: Error) {
  throw new Error(`yyl-copy-webpack-plugin error:', ${err.message}`)
}

export interface AssetsSource {
  size(): number
  map(options?: any): Object
  sourceAndMap(options?: any): { source: string | Buffer; map: Object }
  updateHash(hash: any): void
  source(): string | Buffer
  buffer(): Buffer
}

export interface FileInfo {
  src: string
  dist: string
  source: Buffer
}

export interface CopyInfo {
  /** 原地址 */
  from: string
  /** 目标地址 */
  to: string
  /** 沿用 matcher 规则 */
  matcher?: string[]
  /** 文件名 默认为 [name]-[hash:8].[ext] */
  filename?: string
}

export interface YylCopyWebpackPluginOption {
  /** 拷贝信息 */
  files?: CopyInfo[]
  /** 基本路径, 会用于 resolve files 里面的路径 */
  basePath?: string
  /** 是否压缩 */
  minify?: boolean
  /** 压缩是否支持 ie8 默认 false */
  ie8?: boolean
  /** log 路径的 相对路径 */
  logBasePath?: string
}

export default class YylCopyWebpackPlugin {
  static getHooks(compilation: Compilation) {
    return getHooks(compilation)
  }

  static getName() {
    return PLUGIN_NAME
  }

  option: Required<YylCopyWebpackPluginOption> = {
    files: [],
    basePath: process.cwd(),
    minify: false,
    ie8: false,
    logBasePath: process.cwd()
  }

  constructor(option?: YylCopyWebpackPluginOption) {
    if (option?.files) {
      this.option.files = option.files.map((info) => {
        info.filename = info.filename || '[name]-[hash:8].[ext]'
        return info
      })
    }

    if (option?.minify !== undefined) {
      this.option.minify = option.minify
    }

    if (option?.basePath) {
      this.option.basePath = option.basePath
      if (!option.logBasePath) {
        this.option.logBasePath = option.basePath
      }
    }

    if (option?.ie8 !== undefined) {
      this.option.ie8 = option.ie8
    }

    if (option?.logBasePath) {
      this.option.logBasePath = option.logBasePath
    }
  }

  getFileType(str: string) {
    const iStr = str.replace(/\?.*/, '')
    const split = str.split('.')
    let ext = split[split.length - 1]
    if (ext === 'map' && split.length > 2) {
      ext = `${split[split.length - 2]}.${split[split.length - 1]}`
    }

    return ext
  }

  getFileName(name: string, cnt: Buffer, filename: string) {
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
        return str
      })
    }
    const r = filename.replace(REG_HASH, hash).replace(REG_NAME, iName).replace(REG_EXT, ext)

    return util.path.join(dirname, r)
  }

  async formatSource(fileInfo: FileInfo): Promise<FileInfo> {
    const { minify, ie8 } = this.option

    if (minify) {
      const r = Object.assign({}, fileInfo)
      let minifyResult
      switch (path.extname(fileInfo.src)) {
        case '.js':
          try {
            minifyResult = await Terser.minify(r.source.toString(), {
              ie8
            })
            r.source = Buffer.from(minifyResult.code || '', 'utf-8')
          } catch (er) {
            printError(er)
          }
          break
        case '.css':
          minifyResult = new CleanCss({}).minify(r.source.toString())
          if (minifyResult.errors && minifyResult.errors.length) {
            minifyResult.errors.forEach((error) => {
              printError(new Error(error))
            })
            break
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

  apply(compiler: Compiler) {
    const { output, context } = compiler.options
    const { basePath, logBasePath, files, ie8, minify } = this.option

    if (!files || !files.length) {
      return
    }

    compiler.hooks.emit.tapAsync(PLUGIN_NAME, async (compilation, done) => {
      const iHooks = getHooks(compilation)
      const logger = compilation.getLogger(PLUGIN_NAME)
      /** 文件写入操作 */
      const assetsFile = async (fileInfo: FileInfo, filename: string) => {
        // + hooks.beforeCopy
        fileInfo = await iHooks.beforeCopy.promise(fileInfo)
        // - hooks.beforeCopy

        fileInfo = await this.formatSource(fileInfo)

        // + hooks.afterCopy
        fileInfo = await iHooks.afterCopy.promise(fileInfo)
        // - hooks.afterCopy

        const assetName = util.path.relative(output.path || '', fileInfo.dist)

        // add watch
        compilation.fileDependencies.add(fileInfo.src)

        const finalName = this.getFileName(assetName, fileInfo.source, filename)

        logger.info(
          `${chalk.cyan(finalName)} <- [${chalk.green(path.relative(logBasePath, fileInfo.src))}]`
        )
        compilation.assets[finalName] = {
          source() {
            return fileInfo.source
          },
          size() {
            return fileInfo.source.length
          }
        } as AssetsSource
        compilation.hooks.moduleAsset.call(
          {
            userRequest: assetName
          } as any,
          finalName
        )
      }

      logger.group(PLUGIN_NAME)
      logger.info(`${LANG.MINIFY_INFO}: ${minify || 'false'}`)
      logger.info(`${LANG.IE8_INFO}: ${ie8 || 'false'}`)
      logger.info(`${LANG.COPY_INFO}:`)

      await util.forEach<CopyInfo>(files, async (copyInfo) => {
        let fromPath = copyInfo.from
        let toPath = copyInfo.to
        if (basePath) {
          fromPath = path.resolve(basePath, fromPath)
          toPath = path.resolve(basePath, toPath)
        }
        if (context) {
          fromPath = path.resolve(context, fromPath)
          toPath = path.resolve(context, toPath)
        }

        if (!fs.existsSync(fromPath)) {
          // not exists
          logger.warn(
            chalk.yellow(
              `${path.relative(logBasePath, toPath)} <- [${path.relative(logBasePath, fromPath)}] ${
                LANG.NOT_EXISTS
              }`
            )
          )
        } else if (!fs.statSync(fromPath).isDirectory()) {
          // is file
          await assetsFile(
            {
              src: fromPath,
              dist: toPath,
              source: fs.readFileSync(fromPath)
            },
            copyInfo.filename || ''
          )
        } else {
          // is directory
          let iFiles = extFs.readFilesSync(fromPath)
          if (copyInfo.matcher) {
            iFiles = matcher(iFiles, copyInfo.matcher)
          }

          await util.forEach(iFiles, async (iFile) => {
            const outputPath = util.path.join(toPath, path.relative(fromPath, iFile))
            await assetsFile(
              {
                src: iFile,
                dist: outputPath,
                source: fs.readFileSync(iFile)
              },
              copyInfo.filename || ''
            )
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
