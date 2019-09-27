Swift中的强制编译时报错"

> 作者：Erica Sadun，[原文链接](https://ericasadun.com/2018/04/18/forcing-compiler-errors-in-swift/)，原文日期：2018-04-18
> 译者：[Hale](http://wuqiuhao.github.io)；校对：梁杰，[Yousanflics](http://blog.yousanflics.com.cn)；定稿：[Yousanflics](http://blog.yousanflics.com.cn)，[CMB](https://github.com/chenmingbiao)
  









得益于[SE-0196](https://github.com/apple/swift-evolution/blob/master/proposals/0196-diagnostic-directives.md)，Swift 4.2 将引进 `#warning()` 和 `#error()` 两个编译指令。这两个指令允许你在编译期间合并诊断消息和抛出错误。下面这个例子来自已被确定接受的提议并且已经被实施。



    
    #warning("this is incomplete")
    
    #if MY_BUILD_CONFIG && MY_OTHER_BUILD_CONFIG
      #error("MY_BUILD_CONFIG and MY_OTHER_BUILD_CONFIG cannot both be set")
    #endif

`#error` 指令的例子使用条件编译标志（用-D选项设置）来检察编译是否产生了配置冲突。

我(原文作者)已经写了很多关于我不喜欢在Swift中使用蛇形命名法（THINGS_LIKE_THIS）的文章。但不可避免的，开发者们都喜欢使用蛇形命名法则来定义条件编译标志。无论是 `MY_BUILD_CONFIG` 、 `MY_OTHER_BUILD_CONFIG` 还是 `DEBUG` 。虽然这是行业标准，但感觉这和Swift的美学存在冲突。

我也写过关于如何不显示使用 `DEBUG` 标志来[检测调试条件的提议](https://ericasadun.com/2018/04/15/writing-swift-adventures-in-compiler-mods/)。这边我附上了提议的链接，你们可以点击查看更多该提议的相关内容。

言归正传，Swift新近提出的 `#error` 和 `#warning` 指令，在当前的实践基础上有了很大进步。它们通常依赖于运行时的反馈而非编译时。

    
    #if !DEBUG
    fatalError("This code is incomplete. Please fix before release.")
    #endif

这个代码块中的缩进样式是 Swift 默认的，主要是为了避免条件编译块中出现轻微的[Pyramid of doom](https://en.wikipedia.org/wiki/Pyramid_of_doom_(programming))(金字塔厄运)。但如果把里面的代码缩进，在这个条件块的周围代码还是纵向增长的，主观上感觉有点丑。为了避免这种情况，一些编码人员采用内联方式，用最少的条件块和更简洁的方法强制编译时（而不是运行时）报错。

以下是我从 John Estropia 那发现的一个例子（他借鉴于他的同事）。他使用条件编译指令来设置 `TODO` 或 `FIXME` 等类型别名，然后在需要的地方使用它们。在 debug 环境时，编译能够通过而在 release 环境下编译就会报错：

    
    #if DEBUG 
    internal typealias TODO<T> = T
    #endif
    
    print("Remove this later") as TODO

这个主意很棒。`TODO` 类型别名将支持 debug 过程中在想要注释的行末尾使用 `as TODO` ，在 release 编译环境下就会抛出异常。这确保了所有用 `TODO` 标注的点能够实现编译时反馈。

    
    error: ManyWays.playground:5:31: error: use of undeclared type 'TODO'
    print("Remove this later") as TODO

虽然不是很美观，但这很有效。它包含了关于代码调用的位置信息和你要发送的信息。如果我正在使用这个方法，我可能会创建一个 `todo` 方法，而不是直接使用上面的方法。在下面的例子中，我使用驼峰式命名使调用看起来更具有指令性，而不像标准的全局函数。

    
    #if DEBUG
    internal enum IssueLevel {
        case
        mildImportance,
        moderateImportance,
        highImportance,
        criticalImportance
    }
    
    internal func ToDo(_ level: IssueLevel, _ string: String) {}
    #endif
    
    // 提供编译错误、描述信息和优先级
    ToDo(.highImportance, "Remove this later")
    
    // error: ManyWays.playground:13:1: error: use of unresolved identifier 'ToDo'
    // ToDo(.highImportance, "Remove this later")

这种方式最大的好处就是从 debug 环境到 release 环境，只需通过 `#if` 进行判断。这种做法很诱人，只要确保全局都在需要标注的地方使用，然后在切换到 release 之前解决或移除所有的标注即可。

目前，Swift 不支持用 `#message` 指令来执行类似的任务。很多开发者将警告视为错误，他们无法在两者之间进行细微的区分。如果 `#warning` 被发布了，你就可以使用 `#warning` 实现类似“fix me”的反馈了。进一步改良的话，`#messageOrDie` （或者其他叫法，命名真的很难）可以在 debug build 时发送警告消息，在 release build 时报出错误，通过 `断言` 来判断申明是否发生。

Dave DeLong 为结构性项目语义提供了另一种方法。他介绍了一个 `Fatal` 类型为开发中一些比较常见的结果判断例如 `noImplemented`、`unreachable` 和 `mustOverride` 等提供[运行时线索](https://forums.swift.org/t/introducing-namespacing-for-common-swift-error-scenarios/10773),它没有用“you need to remember to implement this”这样的提示，而是以运行时奔溃的形式，通过上报完整的位置和方法信息来解释。另一个检索被命名为 `silenceXcode()` 允许你添加你认为永远不会实现的一些方法，如果你使用了它也会报错。

Swift 仍有很大的空间来扩展这方面的支持。我不介意看到这两种方式都被添加到未来 Swift 的实现中。一种用于编译时（像 `#messageOrDie` ）另一种用于运行时（像 `Fatal` 命名空间的静态检索方法）

你们怎么看待这些？在 Swift 中还有哪些部分是元编程开发过程中（像宏）让你感到困惑的？我很想知道还有哪些已经确定发布的特性能够更好地支持开发。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。