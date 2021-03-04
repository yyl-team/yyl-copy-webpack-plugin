import path from 'path'
import fs from 'fs'
import CleanCss from 'clean-css'
import util from 'yyl-util'
import extFs from 'yyl-fs'
import matcher from 'matcher'
import * as Terser from 'terser'
import chalk from 'chalk'
import { getHooks } from './hooks'
import { LANG } from './lang'
import { Compilation, Compiler } from 'webpack'
import {
  AssetsInfo,
  YylWebpackPluginBaseOption,
  YylWebpackPluginBase
} from 'yyl-webpack-plugin-base'

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

export type FileInfo = Required<AssetsInfo>

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

export interface YylCopyWebpackPluginOption extends Pick<YylWebpackPluginBaseOption, 'context'> {
  /** 拷贝信息 */
  files?: CopyInfo[]
  /** 是否压缩 */
  minify?: boolean
  /** 压缩是否支持 ie8 默认 false */
  ie8?: boolean
  /** log 路径的 相对路径 */
  logContext?: string
}

export default class YylCopyWebpackPlugin extends YylWebpackPluginBase {
  static getHooks(compilation: Compilation) {
    return getHooks(compilation)
  }

  static getName() {
    return PLUGIN_NAME
  }

  option: Required<YylCopyWebpackPluginOption> = {
    files: [],
    context: process.cwd(),
    minify: false,
    ie8: false,
    logContext: process.cwd()
  }

  constructor(option?: YylCopyWebpackPluginOption) {
    super({
      ...option,
      name: PLUGIN_NAME
    })
    if (option?.files) {
      this.option.files = option.files.map((info) => {
        info.filename = info.filename || '[name]-[hash:8].[ext]'
        return info
      })
    }

    if (option?.minify !== undefined) {
      this.option.minify = option.minify
    }

    if (option?.context) {
      if (!option.logContext) {
        this.option.logContext = option.context
      }
    }

    if (option?.ie8 !== undefined) {
      this.option.ie8 = option.ie8
    }

    if (option?.logContext) {
      this.option.logContext = option.logContext
    }
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

  async apply(compiler: Compiler) {
    const { output, context } = compiler.options
    const { logContext, files, ie8, minify } = this.option

    if (!files || !files.length) {
      return
    }

    const { compilation, done } = await this.initCompilation(compiler)

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
        `${chalk.cyan(finalName)} <- [${chalk.green(path.relative(logContext, fileInfo.src))}]`
      )
      this.updateAssets({
        compilation,
        assetsInfo: {
          dist: finalName,
          src: assetName,
          source: fileInfo.source
        }
      })
    }

    logger.group(PLUGIN_NAME)
    logger.info(`${LANG.MINIFY_INFO}: ${minify || 'false'}`)
    logger.info(`${LANG.IE8_INFO}: ${ie8 || 'false'}`)
    logger.info(`${LANG.COPY_INFO}:`)

    await util.forEach<CopyInfo>(files, async (copyInfo) => {
      let fromPath = copyInfo.from
      let toPath = copyInfo.to
      if (this.option.context) {
        fromPath = path.resolve(this.option.context, fromPath)
        toPath = path.resolve(this.option.context, toPath)
      }
      if (context) {
        fromPath = path.resolve(context, fromPath)
        toPath = path.resolve(context, toPath)
      }

      if (!fs.existsSync(fromPath)) {
        // not exists
        logger.warn(
          chalk.yellow(
            `${path.relative(logContext, toPath)} <- [${path.relative(logContext, fromPath)}] ${
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
  }
}

module.exports = YylCopyWebpackPlugin
