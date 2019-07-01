title: "PhotoKit 的数据模型"
date: 2019-07-01
tags: [iOS 开发]
categories: [PhotoKit, Ole Begemann]
permalink: photos-data-model
keywords: PhotoKit
custom_title: PhotoKit 的数据模型
description: PhotoKit 的数据模型

---
原文链接=https://oleb.net/2018/photos-data-model/
作者=Ole Begemann
原文日期=2018-09-28
译者=张弛
校对=numbbbbb,Yousanflics
定稿=Forelax

<!--此处开始正文-->

在 iOS 系统中，[PhotoKit 框架](https://developer.apple.com/documentation/photokit) 不仅被系统的照片 App 所使用，同时它也为开发人员访问设备的照片库提供了接口支持。而它的底层则是 [Core Data](https://developer.apple.com/documentation/coredata) 实现的。

<!--more-->

至少从这两个地方，你就可以确认这一点：

1. 编写一个能够访问照片库的应用，并使用 [`-com.apple.CoreData.SQLDebug 1.`](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/CoreData/TroubleshootingCoreData.html#//apple_ref/doc/uid/TP40001075-CH26-SW21) 来启动这个应用程序。当你访问照片库时，从控制台就可以看到 Core Data 的调试信息。
2. 如果查看 PhotoKit 框架的 [class dump](http://stevenygard.com/projects/class-dump/)，你将会在主要的类中看到对 [`NSManagedObjectID`](https://developer.apple.com/documentation/coredata/nsmanagedobjectid) 和其他 Core Data 类型的引用，例如， [`PHObject` 有一个 `_objectID：NSManagedObjectID` 的 ivar](https://github.com/nst/iOS-Runtime-Headers/blob/fbb634c78269b0169efdead80955ba64eaaa2f21/Frameworks/Photos.framework/PHObject.h)。

## 寻找 PhotoKit 的核心数据模型

为了更好地理解 PhotoKit 框架（特别是它的性能特征），我检查了它的数据模型。我在 Xcode 10.0 应用程序的包内容中找到了一个名为 `PhotoLibraryServices.framework / photos.momd / photos-10.0.mom` 的文件：


```shell
/Applications/Xcode-10.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/CoreSimulator/Profiles/Runtimes/iOS.simruntime/Contents/Resources/RuntimeRoot/System/Library/PrivateFrameworks/PhotoLibraryServices.framework/photos.momd/photos-10.0.mom
```

> 你可以使用如下的命令来查找 Xcode 中模拟器运行时内的其他 Core Data 模型：
>
> ```shell
> find /Applications/Xcode-10.app -name '*.mom'
> ```

## 在 Xcode 中打开已编译的 Core Data 模型

`.mom` 文件是*已编译的* Core Data 数据模型。Xcode 无法直接打开它，但可以将它*导入*到另一个 Core Data 模型中。通过如下的步骤，我们就可以在 Xcode 中查看这个模型：

1. 创建一个新的空项目。因为使用 Xcode 10 在项目之外显示 Core Data 模型包并不是一个好的选择。
2. 在项目中创建一个全新的“Core Data 数据模型”文件。 这将创建一个 `.xcdatamodeld` 包。
3. 打开新数据模型，然后选择 编辑器 > 导入.... ，选择要导入的 `.mom` 文件。

不幸的是，编译的模型并不存储 Xcode 的模型编辑器的布局信息，因此你必须手动将编辑器中的实体拖出来一个漂亮的样式中。这花了我几个小时。

> 温馨提示：你可以使用箭头键（和 shift 键+箭头键）精确定位事物。
>
> 专家提示：请勿点击 ⌘Z 撤消移动操作。对图形的编辑不会被 Xcode 视作一个可撤销的操作，因此 Xcode 可能会撤消一开始的导入操作，这意味着你将丢失所有未保存的工作。

## 带有良好格式的 PhotoKit 的模型

这是与 Xcode 10.0（iOS 12.0）捆绑在一起的 `photos-10.0.mom`：

![iOS 12.0 中 PhotoLibraryServices.framework 的 Core Data 数据模型。请下载图片并在本地打开以获得最佳效果。](https://oleb.net/media/photos-10.0-core-data-model-5974px.png)


并非所有的内容都能在这张图片中被看到。你可以 [下载完整模型](https://github.com/ole/AppleCoreDataModels) 并在 Xcode 中查看它的一些属性。

请注意，这不一定是 iOS 上的照片的完整数据模型。更多的一些 Core Data 模型被放置在 `PrivateFrameworks/PhotoAnalysis.framework` 中。