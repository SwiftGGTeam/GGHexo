Swift 一周简讯 #8"

> 作者：Jesse Squires，[原文链接](http://swiftweekly.github.io/issue-8/)，原文日期：2016-02-04
> 译者：[小锅](http://www.swiftyper.com)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[numbbbbb](http://numbbbbb.com/)
  









本周在 Swift.org 上面有一篇[官方博客](https://swift.org/blog/swift-ci/)宣布了我上周提到过的持续集成配置。关于这个，现在官网上有一个[专门的页面](https://swift.org/continuous-integration/)，你可以在[这里](https://ci.swift.org/)查看当前的状态。似乎它可以跟 GitHub 很好地[进行集成](https://twitter.com/modocache/status/693069527807041536)，并且现在基本上已经[正常运作](https://github.com/apple/swift/pull/1151#issuecomment-178211302)了。😄



## Commits 和 pull request

Erik Eckstein 的几个[提交](https://github.com/apple/swift/commit/aaaf36e83521f153ba4b0720795efe4980d9b124)让人[印象深刻](https://twitter.com/jckarter/status/693190676666675200)，它对整个模块的性能优化进行了提升。

David Farler 增加了对使用任何语言写代码块注释的[支持](https://github.com/apple/swift/commit/e87be804c9d8111012555263aa86021ab1735ccf)。

William Dillon 继续了[之前的 Linux/ARMv7]()的工作，这次他[提交的 pull request]()对 gold linker（译者注：gold linker是一个新型的链接器，比原本的 gnu ld 链接器速度更快）增加了支持。这个变化主要是针对解决 ARMv6/v7 以及 aarch64 的平台。

Harlan Haskins 合并了一个为 `fatalError` 增加回溯报告的 [pull request](https://github.com/apple/swift/pull/1122)。

C.W. Betts 在 corlibs-foundation 中[实现了](https://github.com/apple/swift-corelibs-foundation/pull/251) NSUserDefaults。

Slava Pestov 

Doug Gregor 改进了 `#selector` 的代码补全的[实现](https://github.com/apple/swift/pull/1185)。

## Proposals

Joe Groff 和 Erica Sadun [提交了一个提案](https://github.com/apple/swift-evolution/pull/128/files)，“为类型修饰符(Type Decoration)调整 `inout` 声明”。他们建议把在函数声明中把 `inout` 关键字从标签一侧移动到类型一侧以使这个类型修饰更加明确以及避免跟相似的全名参数标签相混淆。

Nate Cook [建议](https://github.com/apple/swift-evolution/pull/125) “为字典增加基本序列的构造器以及合并方法”。

> 字典类型应该允许从 `(Key, Value)` 类型的元组序列中进行初始化，并且应该增加一个可以将现存的字典与 `(key, Value)` 类型的元组进行合并的方法。

提案 “现代化 Swift 的调试标识符(Modernizing Swift's Debugging Identifiers”，([SE-0028](https://github.com/apple/swift-evolution/blob/master/proposals/0028-modernizing-debug-identifiers.md)) 已经被[接受](https://lists.swift.org/pipermail/swift-evolution-announce/2016-February/000030.html)！👏

对于提案 [SE-0005](https://github.com/apple/swift-evolution/blob/master/proposals/0005-objective-c-name-translation.md)，[SE-0006](https://github.com/apple/swift-evolution/blob/master/proposals/0006-apply-api-guidelines-to-the-standard-library.md)，[SE-0023](https://github.com/apple/swift-evolution/blob/master/proposals/0023-api-guidelines.md) 的审核已经[延迟结束到](https://lists.swift.org/pipermail/swift-evolution-announce/2016-January/000029.html)到二月5号。如果你对[很赞的 Swift API 转型](https://swift.org/blog/swift-api-transformation/)有想法的话，大声说出口吧！

## Mailing lists

Justin Kolb 开了一个[帖子](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20160125/007984.html)建议为连续变量(contiguous variable)增加支持。

> 为了更好地支持底层系统的接口，比如图形库，让 Swift 支持连续变量是极好的。

Ted Kremenek [宣布](https://lists.swift.org/pipermail/swift-lldb-dev/Week-of-Mon-20160201/000043.html) Swift 2.2 分支现在进入变化严格控制期，意味着对 `swift-2.2-branch` 分支的改变都要求得到发布管理员(release manager)的特殊许可。

Gwendal Roué 开了一个关于保证闭包执行的[帖子](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20160125/008167.html)。

正如预期的一样，因为上面提到的三个提案 (SE-0005, SE-0006, SE-0023)，[swift-evolution](https://lists.swift.org/pipermail/swift-evolution/) 这周的讨论倍加忙碌。显然我没办法在这里进行总结或者提供一个链接。你应该花几分钟去看一下那个归档，真的，你应该去看一下。

与这个审核相关的，Dave Abrahams 开了一个[探索性的帖子](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20160201/008838.html)，“何时使用参数标签(一个新的方法)”。

Chris Lattner 透露说 Swift 小组曾经简单地讨论过使用 ‽ 作为隐式可选解包的语法糖。

最后 - Bjarne 曾经犯过在 C++ 析构器中忘记 `~` 的[错误](https://github.com/apple/swift/pull/1183#commitcomment-15864521)么？Jacob Bandes-Storch 从这个大规模的 [pull request]() 当中[拯救了一天](https://twitter.com/dgregor79/status/694988732718448642)。😂


> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。