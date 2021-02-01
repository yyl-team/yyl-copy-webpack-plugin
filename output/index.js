/*!
 * yyl-copy-webpack-plugin cjs 1.0.0
 * (c) 2020 - 2021 
 * Released under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');
var fs = require('fs');
var CleanCss = require('clean-css');
var util = require('yyl-util');
var extFs = require('yyl-fs');
var matcher = require('matcher');
var crypto = require('crypto');
var Terser = require('terser');
var chalk = require('chalk');
var tapable = require('tapable');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var CleanCss__default = /*#__PURE__*/_interopDefaultLegacy(CleanCss);
var util__default = /*#__PURE__*/_interopDefaultLegacy(util);
var extFs__default = /*#__PURE__*/_interopDefaultLegacy(extFs);
var matcher__default = /*#__PURE__*/_interopDefaultLegacy(matcher);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const iWeakMap = new WeakMap();
function createHooks() {
    return {
        beforeCopy: new tapable.AsyncSeriesWaterfallHook(['pluginArgs']),
        afterCopy: new tapable.AsyncSeriesWaterfallHook(['pluginArgs'])
    };
}
function getHooks(compilation) {
    let hooks = iWeakMap.get(compilation);
    if (hooks === undefined) {
        hooks = createHooks();
        iWeakMap.set(compilation, hooks);
    }
    return hooks;
}

const LANG = {
    NOT_EXISTS: '复制失败，原文件不存在',
    COPY_INFO: '复制信息',
    MINIFY_INFO: '是否压缩',
    IE8_INFO: '兼容IE-8',
    NONE: '无配置信息'
};

const PLUGIN_NAME = 'yylCopy';
const printError = function (err) {
    throw new Error(`yyl-copy-webpack-plugin error:', ${err.message}`);
};
class YylCopyWebpackPlugin {
    constructor(option) {
        this.option = {
            files: [],
            basePath: process.cwd(),
            minify: false,
            ie8: false,
            logBasePath: process.cwd()
        };
        if (option === null || option === void 0 ? void 0 : option.files) {
            this.option.files = option.files.map((info) => {
                info.filename = info.filename || '[name]-[hash:8].[ext]';
                return info;
            });
        }
        if ((option === null || option === void 0 ? void 0 : option.minify) !== undefined) {
            this.option.minify = option.minify;
        }
        if (option === null || option === void 0 ? void 0 : option.basePath) {
            this.option.basePath = option.basePath;
            if (!option.logBasePath) {
                this.option.logBasePath = option.basePath;
            }
        }
        if ((option === null || option === void 0 ? void 0 : option.ie8) !== undefined) {
            this.option.ie8 = option.ie8;
        }
        if (option === null || option === void 0 ? void 0 : option.logBasePath) {
            this.option.logBasePath = option.logBasePath;
        }
    }
    static getHooks(compilation) {
        return getHooks(compilation);
    }
    static getName() {
        return PLUGIN_NAME;
    }
    getFileType(str) {
        str.replace(/\?.*/, '');
        const split = str.split('.');
        let ext = split[split.length - 1];
        if (ext === 'map' && split.length > 2) {
            ext = `${split[split.length - 2]}.${split[split.length - 1]}`;
        }
        return ext;
    }
    getFileName(name, cnt, filename) {
        const REG_HASH = /\[hash:(\d+)\]/g;
        const REG_NAME = /\[name\]/g;
        const REG_EXT = /\[ext\]/g;
        const dirname = path__default['default'].dirname(name);
        const basename = path__default['default'].basename(name);
        const ext = path__default['default'].extname(basename).replace(/^\./, '');
        const iName = basename.slice(0, basename.length - (ext.length > 0 ? ext.length + 1 : 0));
        let hash = '';
        if (filename.match(REG_HASH)) {
            let hashLen = 0;
            filename.replace(REG_HASH, (str, $1) => {
                hashLen = +$1;
                hash = crypto.createHash('md5').update(cnt.toString()).digest('hex').slice(0, hashLen);
                return str;
            });
        }
        const r = filename.replace(REG_HASH, hash).replace(REG_NAME, iName).replace(REG_EXT, ext);
        return util__default['default'].path.join(dirname, r);
    }
    formatSource(fileInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const { minify, ie8 } = this.option;
            if (minify) {
                const r = Object.assign({}, fileInfo);
                let minifyResult;
                switch (path__default['default'].extname(fileInfo.src)) {
                    case '.js':
                        try {
                            minifyResult = yield Terser.minify(r.source.toString(), {
                                ie8
                            });
                            r.source = Buffer.from(minifyResult.code || '', 'utf-8');
                        }
                        catch (er) {
                            printError(er);
                        }
                        break;
                    case '.css':
                        minifyResult = new CleanCss__default['default']({}).minify(r.source.toString());
                        if (minifyResult.errors && minifyResult.errors.length) {
                            minifyResult.errors.forEach((error) => {
                                printError(new Error(error));
                            });
                            break;
                        }
                        r.source = Buffer.from(minifyResult.styles, 'utf-8');
                        break;
                }
                return r;
            }
            else {
                return fileInfo;
            }
        });
    }
    apply(compiler) {
        const { output, context } = compiler.options;
        const { basePath, logBasePath, files, ie8, minify } = this.option;
        if (!files || !files.length) {
            return;
        }
        compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, done) => __awaiter(this, void 0, void 0, function* () {
            const iHooks = getHooks(compilation);
            const logger = compilation.getLogger(PLUGIN_NAME);
            /** 文件写入操作 */
            const assetsFile = (fileInfo, filename) => __awaiter(this, void 0, void 0, function* () {
                // + hooks.beforeCopy
                fileInfo = yield iHooks.beforeCopy.promise(fileInfo);
                // - hooks.beforeCopy
                fileInfo = yield this.formatSource(fileInfo);
                // + hooks.afterCopy
                fileInfo = yield iHooks.afterCopy.promise(fileInfo);
                // - hooks.afterCopy
                const assetName = util__default['default'].path.relative(output.path || '', fileInfo.dist);
                // add watch
                compilation.fileDependencies.add(fileInfo.src);
                const finalName = this.getFileName(assetName, fileInfo.source, filename);
                logger.info(`${chalk__default['default'].cyan(finalName)} <- [${chalk__default['default'].green(path__default['default'].relative(logBasePath, fileInfo.src))}]`);
                compilation.assets[finalName] = {
                    source() {
                        return fileInfo.source;
                    },
                    size() {
                        return fileInfo.source.length;
                    }
                };
                compilation.hooks.moduleAsset.call({
                    userRequest: assetName
                }, finalName);
            });
            logger.group(PLUGIN_NAME);
            logger.info(`${LANG.MINIFY_INFO}: ${minify || 'false'}`);
            logger.info(`${LANG.IE8_INFO}: ${ie8 || 'false'}`);
            logger.info(`${LANG.COPY_INFO}:`);
            yield util__default['default'].forEach(files, (copyInfo) => __awaiter(this, void 0, void 0, function* () {
                let fromPath = copyInfo.from;
                let toPath = copyInfo.to;
                if (basePath) {
                    fromPath = path__default['default'].resolve(basePath, fromPath);
                    toPath = path__default['default'].resolve(basePath, toPath);
                }
                if (context) {
                    fromPath = path__default['default'].resolve(context, fromPath);
                    toPath = path__default['default'].resolve(context, toPath);
                }
                if (!fs__default['default'].existsSync(fromPath)) {
                    // not exists
                    logger.warn(chalk__default['default'].yellow(`${path__default['default'].relative(logBasePath, toPath)} <- [${path__default['default'].relative(logBasePath, fromPath)}] ${LANG.NOT_EXISTS}`));
                }
                else if (!fs__default['default'].statSync(fromPath).isDirectory()) {
                    // is file
                    yield assetsFile({
                        src: fromPath,
                        dist: toPath,
                        source: fs__default['default'].readFileSync(fromPath)
                    }, copyInfo.filename || '');
                }
                else {
                    // is directory
                    let iFiles = extFs__default['default'].readFilesSync(fromPath);
                    if (copyInfo.matcher) {
                        iFiles = matcher__default['default'](iFiles, copyInfo.matcher);
                    }
                    yield util__default['default'].forEach(iFiles, (iFile) => __awaiter(this, void 0, void 0, function* () {
                        const outputPath = util__default['default'].path.join(toPath, path__default['default'].relative(fromPath, iFile));
                        yield assetsFile({
                            src: iFile,
                            dist: outputPath,
                            source: fs__default['default'].readFileSync(iFile)
                        }, copyInfo.filename || '');
                    }));
                }
            }));
            // - copy
            logger.groupEnd();
            done();
        }));
    }
}
module.exports = YylCopyWebpackPlugin;

exports.default = YylCopyWebpackPlugin;
