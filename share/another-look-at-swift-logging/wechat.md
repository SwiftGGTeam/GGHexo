也谈 Swift 日志"

> 作者：Joe，[原文链接](http://dev.iachieved.it/iachievedit/another-look-at-swift-logging/)，原文日期：2016-01-23
> 译者：[DianQK](undefined)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[Cee](https://github.com/Cee)
  









**2016 年 2 月 26 日更新**：`swiftlog` 的 `master` 分支已经更新至 Swift 3.0 版本。

![Swift 2.2](https://img.shields.io/badge/Swift-2.2-orange.svg?style=flat) ![Swift 3.0](https://img.shields.io/badge/Swift-3.0-orange.svg?style=flat) ![License ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=flat)

Apple 发布 Swift 不久，就有大量的开发者提供了日志静态库，但 [Lumberjack](https://github.com/CocoaLumberjack/CocoaLumberjack) 这样的好项目并不能在 Xcode 外执行。我们开发了 `swiftlog` ，这是一个简单的日志记录程序。


来看看 `swiftlog` 的更新内容，它主要为 Linux 系统上的 Swift 应用提供快捷添加日志信息的方法。它有以下新特性：

* Swift 包管理支持（SPM）
* 使用惊艳的 `Rainbow` 包输出彩色日志
* 支持写入文件

我们并不想把 `swiftlog` 变成一个复杂的框架，它只是一个非常简单实用的包。

### 使用 `swiftlog`

要使用 `swiftlog` 只需把以下代码添加到你的 `Package.swift` 依赖中：

    
    import PackageDescription
     
    let package = Package(
        name:"example",
        dependencies:[
          .Package(url:"https://github.com/iachievedit/swiftlog", majorVersion:1)
        ]
    )

你可以引入 `swiftlog` 来使用日志记录，通过全局变量 `sLogLevel`（默认是 `.None` 即不使用日志记录）调整你需要的日志等级。

    
    import swiftlog
    
    slogLevel = .Verbose
    
    SLogVerbose("A verbose log")
    SLogInfo("An info log")
    SLogWarning("A warning log")
    SLogError("An error log")

所有的日志等级按重要程度从低到高排列输出。日志是彩色的：

![Colored Logs!](http://swift.gg/img/articles/another-look-at-swift-logging/Untitled-window_011.png1456708215.5935338)

很容易就能确定你的 `slogLevel` 级别，不过为了完整起见，这里还是列出所有级别：

* `.None`
* `.Verbose`
* `.Info`
* `.Warning`
* `.Error`

此外，按照惯例还有两个方法： `ENTRY_LOG` 和 `EXIT_LOG` 。这些“宏指令”用于追踪函数进入和退出：

    
    import swiftlog
    
    func multiply(multiplicand:Int, multiplier:Int) -> Int {
      ENTRY_LOG()
      let result = multiplicand * multiplier
      EXIT_LOG()
      return result
    }
    
    slogLevel = .Verbose
    
    SLogVerbose("A verbose log")
    SLogInfo("An info log")
    SLogWarning("A warning log")
    SLogError("An error log")
    
    SLogVerbose("10 times 10 equals \(multiply(10, multiplier:10))")

这样就会有三条附加的日志信息：

<p><font color="green"></p><pre class="crayon:false">
<b>VERBOSE</b> - ENTRY multiply(_:multiplier:)
<b>VERBOSE</b> - EXIT  multiply(_:multiplier:)
<b>VERBOSE</b> - 10 times 10 equals 100
</pre><p></font></p>

最后，我们可以使用 `slogToFileAtPath` 方法将日志写入文件。

    
    import swiftlog
    
    func multiply(multiplicand:Int, multiplier:Int) -> Int {
      ENTRY_LOG()
      let result = multiplicand * multiplier
      EXIT_LOG()
      return result
    }
    
    slogLevel = .Verbose
    slogToFileAtPath("/tmp/log.txt", append:true)
    
    SLogVerbose("A verbose log")
    SLogInfo("An info log")
    SLogWarning("A warning log")
    SLogError("An error log")
    
    SLogVerbose("10 times 10 equals \(multiply(10, multiplier:10))")

`slogToFileAtPath` 的 `append` 参数可以设置为 `false`，这会覆盖文件之前的内容。

### 源代码

你可以在 [GitHub](https://github.com/iachievedit/swiftlog) 上获取源代码。如果你不喜欢我选择的这些日志等级的颜色，动手修改吧！我可能会在接下来新的修改中提供更多定制的选项；到目前为止，我在努力让这个包使用起来非常简单，并努力减少旋钮（可配置项）的数量。

这个仓库还有一个例子，在 `logexample` 目录中。进入 `logexample` 并输入 `swift build` 来编译运行一下吧！

--- 

译者注：

在 Linux 上使用 `swiftlog` 是一件非常简单实用的工具，事实上我们在 Xcode 开发中也可以实现类似的功能。
文章开头提到的 `Lumberjack` 就是不错的选择，此外我们还可以使用 `XCGLogger` ，这个更轻量简洁一些。

我曾写过一篇 [打造一个愉快的 Swift Debug 控制台](http://blog.dianqk.org/2016/01/26/打造一个愉快的 Swift Debug 控制台/)，如果你喜欢用彩色的日志来装逼，这一定是你的菜。此外我还写了一个非常简单轻量的 RxSwift 的日志扩展 [RxLogger](https://github.com/DianQK/RxLogger)。使用起来非常方便，当然你也可以参考这些来配置你喜欢或者符合你现在的业务需求的日志工具，比如日志白名单、过滤等功能。

> 多亏 [jasl123](https://github.com/jasl) 的提醒，我才意识到白名单是件很重要的事情，特别是在写入文件的时候，一定要记得过滤掉隐私信息。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。