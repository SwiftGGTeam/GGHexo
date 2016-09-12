Swift 一周简讯 #6"

> 作者：Jesse Squires，[原文链接](http://swiftweekly.github.io/issue-6/)，原文日期：2016/1/21
> 译者：[pmst](http://www.jianshu.com/users/596f2ba91ce9/latest_articles)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[numbbbbb](http://numbbbbb.com/)
  










自 Apple 宣布 Swift 开源已过去一个月，我仍然在坚持探索新事物，乐此不疲，见证着 Swift 的成长与蜕变。欢迎来到新一期的每周开源简讯 #6！

### Commits 和 Pull requests

[Anton Blanchard](https://github.com/antonblanchard) 关于增加 PowerPC64le Linux 支持的[提案](https://github.com/apple/swift/pull/979)已经被合并了。不得不说，这确实令人[印象深刻](https://github.com/apple/swift/pull/979#issuecomment-171833623)，当然也非常[酷](https://github.com/apple/swift/pull/979#issuecomment-171876376)。😎

@Iplarson 提交了一个 [pull request](https://github.com/apple/swift/pull/997)，目的是为了支持代码覆盖分析。很高兴看到这一点。如果能在 pr 中自动显示分析报告就更好了。



Chris Lattner 继续做[夜猫子](https://twitter.com/clattner_llvm/status/674254974629502976) —— 修复了大量 radars 问题。（[链接1](https://github.com/apple/swift/commit/20263bf46658dccafced86955fbf33ad72853c6d)|[链接2](https://github.com/apple/swift/commit/ce94e0af538f9f7e47dc1979e4db60549ffb9010)|[链接3](https://github.com/apple/swift/commit/9c9ddf9e6cba3ea199bcfd59e039c404b68bb1ac)）

对于 `associatedtype` 的“奇幻之旅”（[提案地址](https://github.com/apple/swift-evolution/blob/master/proposals/0011-replace-typealias-associated.md)）：Greg Titus [实现](https://github.com/apple/swift/pull/964)了 `associatedtype`。👏接着由于测试未能通过，@eeckstain [撤销](https://github.com/apple/swift/commit/ce7b2bcf094a17fec1a3f3cfa713995f3ced1ef3)了该改动。随后 Doug Gregor 通过固定的测试[撤销](https://github.com/apple/swift/commit/38c1de69e4b4c27ac1916d1e6fe601beb5d3a5f4)了前一个撤销。（[哟，老兄，听说你很喜欢撤销嘛](http://cdn.meme.am/instances/500x/58010858.jpg)）这是一个曲折的故事，不管怎么说 `associatetype` 目前已在 Swift2.2 中实现了。

另外 Greg Titus 为 `associatedtype` 更新了[标准库](https://github.com/apple/swift/pull/976)。同时 [Luke Howard](https://github.com/lhoward) 合并了一个有关更新 corelibs-foundation 的 [pull request](https://github.com/apple/swift-corelibs-foundation/pull/230)。🎉

Stephen Celis 好好整理了下 `NSDateFormatter` 类。其实这并不是一个什么大的改动，但是我所感兴趣的是 `NSDateFormatter` 起初居然是用 `Objective-C` 风格实现的：实例变量 `ivars` 配合 getters/setters 方法实现。这种类型的模板显然撞到 Swift 精简代码的“枪口”之上。😂另外一处值得注意的地方是不对外的属性都被标记为 `internal` 关键字，而非 `private`，这意味着整个 Foundation 模块都可以绕过 公用的 getters/setters 方法进行实例变量的读写访问。示例如下：

    
    // Before this commit
     2 internal var _dateStyle: NSDateFormatterStyle = .NoStyle
     3 public var dateStyle: NSDateFormatterStyle {
     4    get {
     5        return _dateStyle
     6    }
     7    set {
     8        _reset()
     9        _dateStyle = newValue
    10    }
    11 }
    12 
    13 // After this commit
    14 public var dateStyle: NSDateFormatterStyle = .NoStyle {
    15     willSet {
    16         _reset()
    17     }
    18 }

记得 Swift 的 `willSet/didSet` 属性观察者特性自 1.0 版本就已实现，这就难免让人觉得有些匪夷所思了（译者注：为毛一开始不这么干呢）。不过，这看起来有可能是 `Objective-C` 某个接口[自动生成](https://twitter.com/jckarter/status/689157377149415424)的。在本例中，我确信还有大量内容值得改进。继续深挖吧！

Ted Kremenek 修复了两个 Swift2.1 中参数解析的[问题](https://github.com/apple/swift/pull/1007)。

### Proposals

swift-evolution 的 [README](https://github.com/apple/swift-evolution#development-minor-version--swift-22) 已更新至最新进度，同时开始接受有关 Swift2.2 的建议。这种方式可以很好的推动发展。当然，我会对你“不离不弃”，告诉你最新的动态。😉

Jacob Bandes-Storch 已经准备了一个[提案](https://github.com/jtbandes/swift-evolution/blob/977a9923fd551491623b6bfd398d5859488fe1ae/proposals/0000-derived-collection-of-enum-cases.md)：“使用枚举用例派生出集合（Derived Collection of Enum Cases）”。该提案为 `enum` 提供了一系列必须的反射 API。同时， Jacob 建议在 `enum` 类型中添加一个 `Array` 属性：`.cases` ，用于返回 `enum` 中所有用例的一个集合。当前，我们都是通过自定义来实现。

上周 Doug Gregor 提交有关“Referencing the Objective-C selector of a method” 的[提案](https://github.com/apple/swift-evolution/blob/master/proposals/0022-objc-selectors.md)目前仍在[审核中](https://lists.swift.org/pipermail/swift-evolution-announce/2016-January/000020.html)。

[Jeff Kelley](https://github.com/SlaunchaMan) 递交了一个“Import Objective-C constants as Swift enums”的[提案](https://github.com/apple/swift-evolution/pull/110/files)。其目的是想将 `Objective-C` 中的字符串常量组以 `enum` 的形式提供给 Swift 使用。当然这也适用于其他类型，比如一个整数常量组。👍

Doug Gregor 关于 “Naming Functions with Argument Labels” 的[提议](https://github.com/apple/swift-evolution/blob/master/proposals/0021-generalized-naming.md)正式被Swift2.2 和 Swift3.0 [采纳](https://lists.swift.org/pipermail/swift-evolution-announce/2016-January/000021.html)拉。

### Mailing lists

上周，我遗漏了 John Lin 对 Swift.org（地址：[swiftlang.tw](https://swiftlang.tw)）网站的[中文翻译工作](https://lists.swift.org/pipermail/swift-dev/Week-of-Mon-20160111/000777.html)。本周，Ted Kremenek 新增一个话题指出 Swift.org 是一个 Jekyll 网站，以私有仓的形式托管于 GitHub 上，同时团队计划最终将它开源出来！🎉

还是上周的事情（😁），Matthew Johnson 的“Flexible Memberwise Initialization” [提案](https://github.com/apple/swift-evolution/blob/master/proposals/0018-flexible-memberwise-initialization.md)最终被“否决”掉了，尽管看起来是想推迟到 Swift 3.0 再做决定。正如 Chris Lattner 解释到，“核心开发团队真的不想在此刻谈论这个问题，鉴于这纯粹是一个语法糖的提议，而我们需要专注的主要目标是 Swift 3.0 的发展。”

Swift 目前没有任何方法能够在子类重写父类方法时指明要求调用 `super`。我开启了一个[讨论](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20160111/006878.html)，提出一些解决思路：譬如通过扩展 class 方法中（除 `init`的 method）的 `required` 使用来实现。（严格来说，这始于 [Twitter](https://twitter.com/jesse_squires/status/686960179435323392)上讨论，[Nate Birkholz](https://twitter.com/nbirkholz) 也在邮件列表中新建了一个[话题](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20160111/006667.html)。）Matthew Johnson 曾经指出了这一领域的不足。当然，你总是可以将所有方法都声明为构造方法（initailizers） —— [问题解决](https://twitter.com/jckarter/status/686958750335279108)。😂

Davide Italiano [宣布](https://lists.swift.org/pipermail/swift-dev/Week-of-Mon-20160118/000911.html) Swift 可适用于 FreeBSD 。

“Swift Testing (Package Manager)”的提案第二次审核[已经开始](https://lists.swift.org/pipermail/swift-build-dev/Week-of-Mon-20160111/000243.html)！(修订提案请点击[这里](https://github.com/apple/swift-evolution/blob/master/proposals/0019-package-manager-testing.md))。🎉

最后，来个段子：

> Q:作为一个 Objective-C 编程者，我不是很擅长节食。为啥呢？

A：[weak self...](https://twitter.com/modocache/status/689669646497255424)

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。