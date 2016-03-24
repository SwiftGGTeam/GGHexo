title: "使用 SwiftPM 创建新的包"
date: 2016-03-24
tags: [Swift 入门]
categories: [iAchieved.it]
permalink: creating-new-packages-with-swiftpm
keywords: swift教程
custom_title: 
description: 在 swift build 中 运行命令 swift build --init 就能创建 Swift 包 的目录和文件，是不是感觉很赞呢。
---
原文链接=http://dev.iachieved.it/iachievedit/creating-new-packages-with-swiftpm/
作者=Joe
原文日期=2016-01-31
译者=shanks
校对=numbbbbb
定稿=星夜暮晨

<!--此处开始正文-->


去年 11 月，我在 Swift 的 [JIRA](https://www.atlassian.com/software/jira) 中创建了一个 SwiftPM 的改进建议：[SR-353](https://bugs.swift.org/browse/SR-353)，在 `swift build` 中，添加一个类似于 `npm init` 的包初始化命令，用来创建 `Swift` 包需要的所有目录和文件。这个提议创建之后不久，[Bastian Rinsche](https://twitter.com/Memorion) 和 [Tobias Landsberg](https://github.com/tlandsberg) 就实现了这个特性，而且 [PR](https://github.com/apple/swift-package-manager/pull/117) 被合并。Bastian 还写了一篇非常棒的[文章](http://blog.bastianrinsche.de/2016/01/31/contributing-to-swift/)介绍他对于 Swift 开源的一些认识，并且介绍了他们实现的`swift build --init`命令。

<!--more-->


让我们看看具体应该怎么做。首先，使用 `mkdir` 创建一个新的目录，用来放置你的包或者应用。这里我们使用 `helloworld` 作为例子：`mkdir helloworld`。然后，使用 `cd` 命令进入 `helloworld` 目录，运行命令：`swift build --init`。

```bash
# cd helloworld
# swift build --init
Creating Package.swift
Creating .gitignore
Creating Sources/
Creating Sources/main.swift
Creating Tests/
```

我们看看 `swift build --init` 生成的内容：

* `Package.swift`：包的"配置信息"（manifest）。`swift build --init`使用你创建的目录名作为包名。
* `Sources`目录：按照 SwiftPM 的要求，所有的源代码文件都放到 `Sources` 目录下。
* `main.swift`：Swift 应用使用 `main.swift`（有且只有一个）作为程序执行的入口。
* `Tests` 目录：存放应用的测试用例。后面会详细介绍。
* `.gitignore`：一个便捷的 git [gitignore](https://git-scm.com/docs/gitignore) 文件，忽略一些本地编译时用到的配置目录和文件，比如:  `.build`  和  `Packages ` 目录（一些你不想加入到 `git` 库的东西）。

在这个 `helloword` 例子中，`Package.swift` 文件内容如下：

```swift
import PackageDescription

let package = Package(
    name: "helloworld"
)
```

运行 `swift build` 会创建可执行文件 `.build/debug/helloworld `，运行这个文件就会在终端输出 `Hello, world!`.

如果你想编译一个 Swift 库，只需要删除 `main.swift` 文件，然后替换成你的库代码。在没有 `main.swift` 的情况下，`SwiftPM` 会创建一个静态的库。

## Tests 目录

`swift build --init` 命令还添加了 `Tests` 目录，这个目录是为以后的自动化测试准备的。相关内容请阅读 [SR-592](https://bugs.swift.org/browse/SR-592) 和 [SE-0019](https://github.com/apple/swift-evolution/blob/master/proposals/0019-package-manager-testing.md)，未来 `SwiftPM` 会支持自动化测试。

## 获取 `Ubuntu` 下的 `Swift` 安装包

如果你想尝试一下 `swift build --init`, 需要获取 Ubuntu 上最新的 Swift 2.2 包（写本文时，版本号是：version 2.2-0ubuntu15）。请查看这篇[文章](http://dev.iachieved.it/iachievedit/ubuntu-packages-for-open-source-swift/)获取更多的信息。如果想了解更多关于 `SwiftPM` 的信息，请阅读本文[介绍](http://dev.iachieved.it/iachievedit/introducing-the-swift-package-manager/)。做一个快乐的 Swift 程序员吧！