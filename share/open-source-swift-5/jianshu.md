Swift 一周简讯 #5"

> 作者：Jesse Squires，[原文链接](http://swiftweekly.github.io/issue-5/)，原文日期：2016/1/14
> 译者：[pmst](http://www.jianshu.com/users/596f2ba91ce9/latest_articles)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[numbbbbb](http://numbbbbb.com/)
  













正如你所看到，Swift 一周简讯有[新家](http://swiftweekly.github.io)啦！有一个专用的网站发布内容感觉棒极了，比我的[个人博客](http://www.jessesquires.com/new-weekly-brief/)强多了。当然新网站还有一些小瑕疵，如果你发现或者有什么好的建议提升网站质量，请在 GitHub 上提交 issue，提问[入口](https://github.com/SwiftWeekly/swiftweekly.github.io/issues/new)。



### Commits 和 Pull Requests

Erik Little，Jesse Rusak 以及 Mike Ash 发现了一个相当有趣的 [Bug](https://bugs.swift.org/browse/SR-510)。如下：

    
    enum Testing: String {
        case Thing = "thing"
        case Bob = {!@#$!@#%!@} // lolwut 具体请点击 Bug 链接
    }

[Daniel Duan](https://github.com/apple/swift/pull/931) 和 [Jesse Rusak](https://github.com/apple/swift/pull/934) 同时尝试了修复。或许 Daniel 目前的 [pull request](https://github.com/apple/swift/pull/955) 会被合并进来吧。（译者注：目前已经合并了！）

Jacob Bandes-Storch 修复了 4 个[编译错误](https://github.com/apple/swift/pull/910)，这要归功于 [@practicalswift](https://github.com/practicalswift)（译者注：它是一个专门收集 swift 编译崩溃信息的系列，已经作为仓库内容的一部分了）。除此之外，还有8 个崩溃问题以及一个 IDE 崩溃被修复，请点击[这里](https://github.com/apple/swift/pull/926)😂。

[@Atrick](https://github.com/atrick) 修复了当插入一个可选引用时的[泄露（leak）问题](https://github.com/apple/swift/commit/9cf84c24ca860c64b6858d61d271476d5575592a)。（[SR-459](https://bugs.swift.org/browse/SR-459)）

Brian Gesiak 的 “testing the tests” [pull request](https://github.com/apple/swift-corelibs-xctest/pull/20) 最终合并了！。他是迄今为止 GitHub 上第一位 `corelibs-xctest` 的[贡献者](https://github.com/apple/swift-corelibs-xctest/graphs/contributors)😦。



### Proposals

Loïc Lecrenier [提议](https://github.com/apple/swift-evolution/blob/master/proposals/0011-replace-typealias-associated.md)，“在关联类型声明时，用 `associatedtype` 关键字取代早前的 `typealias` 关键字”，Swift 2.2 中已被[采纳](https://lists.swift.org/pipermail/swift-evolution-announce/2016-January/000014.html)！这意味着在 2.2 版本中使用 `typealias` 会显示警告信息，3.0 版本将完全移除。当然这对于迁徙现有代码来说是小菜一碟（pmst：其实是对protocol中的类型关联声明做了关键字修改，并未移除`typealias`）。

Doug Gregor 给出了一个“有关使用 Objective-C 方法选择器（selector of a method）”的建议。等的花儿都谢了，此刻梦想成真。从一开始起，swift 和 Objective-C 的互操作性一直都是开发者津津乐道的话题。目前看来这个特性有望在 Swift 2.2 中被添加进来，不用再使用字符串常量（原因见下）， Swift 3.0 版本中最终会完全移除这个旧语法。

> 在 Swift 2 中，Objective-C 选择器通过向一个 Selector 传入字符串常量进行初始化（例如：`Selector("insertSubview:aboveSubview:")`）。该提案希望替换掉 Selector 这种易于出错的构造方法（即传入一个字符串常量来初始化），而是通过 Swift 中的方法名来指定特定方法。（译者注：就像这样：Selector(UIView.insertSubview(_:at:))）👏



Divid Farler 的[提案](https://github.com/apple/swift-evolution/blob/master/proposals/0020-if-swift-version.md)“Swift 语言版本构建配置” 目前正在审核中。“每经过一段时间，Swift 语法可能会进行变动，但是 库（library）和包（package）的作者总是希望他们的代码适用于不同语言版本”。这个提案允许以可编程化的方式来检查 Swift 的版本号，例如`#if swift(>=2.2)`。 作为一个库作者，我相当喜欢这个特性。

### Mailing lists

经过邮件列表中大量的[讨论](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20160111/006466.html)（当然还有 [GitHub](https://github.com/apple/swift-evolution/pull/51) 😳），有关对 Swift 包管理器的测试支持[提案](https://github.com/apple/swift-evolution/blob/master/proposals/0019-package-manager-testing.md)又移回了“审查”状态，希望收集更多社区对该提案的反馈。

Chris Hanson 开启了一个[话题](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20160104/006091.html)讨论为 XCTest 模块添加对 Swift 错误处理的支持。这意味着将 `throws` 作为头等公民添加到 XCTest 中，不过目前看来有点繁琐且难于使用。还记得吗，[那时候](https://www.natashatherobot.com/unit-testing-optionals-in-swift-xctassertnotnil/) XCTest 并不支持处理可选类型。 😄

Drew Crawford 开启了一个[话题](https://lists.swift.org/pipermail/swift-build-dev/Week-of-Mon-20151228/000125.html)讨论如何让 Swift 包管理器支持第三方测试框架。我知道社区中有一大批开发者会喜欢这个提议的，因为可以使用除 XCTest 以外的框架进行测试啦。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。