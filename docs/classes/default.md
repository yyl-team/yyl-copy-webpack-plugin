[yyl-copy-webpack-plugin](../README.md) / [Exports](../modules.md) / default

# Class: default

## Hierarchy

* *YylWebpackPluginBase*

  ↳ **default**

## Table of contents

### Constructors

- [constructor](default.md#constructor)

### Properties

- [assetMap](default.md#assetmap)
- [context](default.md#context)
- [filename](default.md#filename)
- [name](default.md#name)
- [option](default.md#option)

### Methods

- [addDependencies](default.md#adddependencies)
- [apply](default.md#apply)
- [formatSource](default.md#formatsource)
- [getFileName](default.md#getfilename)
- [getFileType](default.md#getfiletype)
- [initCompilation](default.md#initcompilation)
- [updateAssets](default.md#updateassets)
- [getHooks](default.md#gethooks)
- [getName](default.md#getname)

## Constructors

### constructor

\+ **new default**(`option?`: [*YylCopyWebpackPluginOption*](../interfaces/yylcopywebpackpluginoption.md)): [*default*](default.md)

#### Parameters:

Name | Type |
------ | ------ |
`option?` | [*YylCopyWebpackPluginOption*](../interfaces/yylcopywebpackpluginoption.md) |

**Returns:** [*default*](default.md)

Defined in: [src/index.ts:71](https://github.com/jackness1208/yyl-copy-webpack-plugin/blob/18ccb5f/src/index.ts#L71)

## Properties

### assetMap

• **assetMap**: ModuleAssets

assetsMap

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:55

___

### context

• **context**: *string*

相对路径

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:49

___

### filename

• **filename**: *string*

输出文件格式

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:53

___

### name

• **name**: *string*

组件名称

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:51

___

### option

• **option**: *Required*<[*YylCopyWebpackPluginOption*](../interfaces/yylcopywebpackpluginoption.md)\>

Defined in: [src/index.ts:65](https://github.com/jackness1208/yyl-copy-webpack-plugin/blob/18ccb5f/src/index.ts#L65)

## Methods

### addDependencies

▸ **addDependencies**(`op`: AddDependenciesOption): *void*

添加监听文件

#### Parameters:

Name | Type |
------ | ------ |
`op` | AddDependenciesOption |

**Returns:** *void*

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:68

___

### apply

▸ **apply**(`compiler`: *Compiler*): *Promise*<*void*\>

#### Parameters:

Name | Type |
------ | ------ |
`compiler` | *Compiler* |

**Returns:** *Promise*<*void*\>

Defined in: [src/index.ts:140](https://github.com/jackness1208/yyl-copy-webpack-plugin/blob/18ccb5f/src/index.ts#L140)

___

### formatSource

▸ **formatSource**(`fileInfo`: *Required*<AssetsInfo\>): *Promise*<*Required*<AssetsInfo\>\>

#### Parameters:

Name | Type |
------ | ------ |
`fileInfo` | *Required*<AssetsInfo\> |

**Returns:** *Promise*<*Required*<AssetsInfo\>\>

Defined in: [src/index.ts:104](https://github.com/jackness1208/yyl-copy-webpack-plugin/blob/18ccb5f/src/index.ts#L104)

___

### getFileName

▸ **getFileName**(`name`: *string*, `cnt`: *Buffer*, `fname?`: *string*): *string*

获取文件名称

#### Parameters:

Name | Type |
------ | ------ |
`name` | *string* |
`cnt` | *Buffer* |
`fname?` | *string* |

**Returns:** *string*

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:60

___

### getFileType

▸ **getFileType**(`str`: *string*): *string*

获取文件类型

#### Parameters:

Name | Type |
------ | ------ |
`str` | *string* |

**Returns:** *string*

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:58

___

### initCompilation

▸ **initCompilation**(`op`: YylWebpackPluginBaseInitCompilationOption): *void*

初始化 compilation

#### Parameters:

Name | Type |
------ | ------ |
`op` | YylWebpackPluginBaseInitCompilationOption |

**Returns:** *void*

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:62

___

### updateAssets

▸ **updateAssets**(`op`: UpdateAssetsOption): *void*

更新 assets

#### Parameters:

Name | Type |
------ | ------ |
`op` | UpdateAssetsOption |

**Returns:** *void*

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:66

___

### getHooks

▸ `Static`**getHooks**(`compilation`: *Compilation*): *any*

#### Parameters:

Name | Type |
------ | ------ |
`compilation` | *Compilation* |

**Returns:** *any*

Defined in: [src/index.ts:57](https://github.com/jackness1208/yyl-copy-webpack-plugin/blob/18ccb5f/src/index.ts#L57)

___

### getName

▸ `Static`**getName**(): *string*

**Returns:** *string*

Defined in: [src/index.ts:61](https://github.com/jackness1208/yyl-copy-webpack-plugin/blob/18ccb5f/src/index.ts#L61)
