title: "Swift 一周简讯 #7"
date: 2016-02-29 12:30:00
tags: [Swift 开源信息]
categories: [Open Source Swift]
permalink: open-source-swift-weekly-7
keywords: Swift开源
custom_title: 
description: 

---
原文链接=http://swiftweekly.github.io/issue-7/
作者=Jesse Squires
原文日期=2016/01/28
译者=pmst
校对=numbbbbb
定稿=numbbbbb
发布时间=2016-02-29T12:10:00

<!--此处开始正文-->



本周我们迎来了 [Xcode 7.3 beta2](https://twitter.com/SwiftLang/status/691805674079195136) —— 这是首次支持 Swift 2.2 语法的 Xcode 正式发布版，凝聚了 Swift 开源社区的力量！我从未想过会看到这样的[发布版本说明](http://adcdownload.apple.com/Developer_Tools/Xcode_7.3_beta_2/Xcode_7.3_beta_2_Reease_Notes.pdf)。更令人难以置信地是能够在 “What's New” 章节看到那些由社区驱使做出的改动，同时还附上了 GitHub 链接。显然，苹果下一步应该是要将 Xcode 开源出来。😉

<!--more-->


### Repositories

你是否[注意](https://twitter.com/modocache/status/690342486917668864)到 GitHub 新增了一个名为 [“swift-integration-test”](https://github.com/apple/swift-integration-tests) 的仓库？根据[改动记录](https://github.com/apple/swift-integration-tests/commit/db437d2fa1951a9190b2c4adafffc701965ea8c4)，该仓自首次公布开源消息时就已经存在，不过到目前为止还未完全公开。你可能已经猜到它应该和测试有关。具体来说，“对验证生成的 Swift 快照是否正确进行自动化测试”。

此外，你或许还[注意](https://twitter.com/simjp/status/692135037270134784)到 GitHub 上有一个名为 [swift-ci](https://github.com/swift-ci) 的用户。（[看起来是官方账号](http://cdn.meme.am/instances/60114268.jpg)）

意犹未尽？干货还有很多！

过去一周里，另外一个名为 [“swift-internals”](https://github.com/apple/swift-internals) 的仓库悄然出现。网站地址请点击[这里](http://apple.github.io/swift-internals/)。正如欢迎页面所说，网站“摘录了 Swift 编译器和标准库的内部文档，以及 Swift API 设计开发准则”。😦不幸地是，它也仅仅只是包含目前 API 设计准则而已。但是关于 Swift 编译器的文档听起来会对贡献者所有帮助。那么，这是否意味着 [Nate Cook](https://twitter.com/nnnnnnnn) 可以将 [SwiftDoc.org](http://swiftdoc.org/) 关闭了呢？

### Commites 和 Pull Requests

Doug Gregor [起草](https://github.com/apple/swift/commit/ecfde0e71c61184989fde0f93f8d6b7f5375b99a)并[实现](https://github.com/apple/swift/commit/c9c1d1390c621dc3932c0a77c8a191e6411b71f2)了提案 [SE-0021](https://github.com/apple/swift-evolution/blob/master/proposals/0021-generalized-naming.md)，"使用参数标签命名函数"。

Doug Gregor 同时还实现了 [SE-0022](https://github.com/apple/swift-evolution/blob/master/proposals/0022-objc-selectors.md)， "关于方法中的 Objective-C 选择器"。（是的，该提案已被[采纳](https://lists.swift.org/pipermail/swift-evolution-announce/2016-January/000026.html)。）从此世间将不存在字符串类型的 Objective-C 选择器！😂你可以通过以下地址查看相关提交历史：[ dccf315](https://github.com/apple/swift/commit/dccf3155f1fe5400df0c9b51f21a3b8f7fa09b9c)，[7c0e087](https://github.com/apple/swift/commit/7c0e087cd514c926d9eaa3082679edff626effc8)，[89834f8](https://github.com/apple/swift/commit/89834f8d5fcce652401ecaeec4addace48cb2fae)，[f7407f6](https://github.com/apple/swift/commit/f7407f6a4d2c9b20ef1d2aab6dbaff5f9419aa88)。

Greg Titus [改善](https://github.com/apple/swift/pull/1042)了诊断信息，并且提价了[大量的](https://github.com/apple/swift/pull/1069)[pull requests](https://github.com/apple/swift/pull/1089)。 👏

Brian Gesiak 提交了一个 [pull request](https://github.com/apple/swift-corelibs-xctest/pull/43)，为 corelibs-xctest 框架实现了异步测试 API 。它将 Objective-C XCTest API 映射到 Swift 中，增加了 `expectationWithDescription()` 和 `waitForExpectationsWithTimeout()` 等熟悉的方法。

Nate Cook 为标准库新增了[归并排序](https://github.com/apple/swift/pull/1063)。描述如下："该排序算法在兼顾稳定的同时，执行速度也有显著提升（1.5-10 倍 甚至更多）相比较其他传统的排序算法。"😎

William Dillon 新增对 ARMv6 的[支持](https://github.com/apple/swift/pull/901)，同时修复了一些 ARMv7 的 bug。

@tinysun212 开始增加对 cygwin 的[支持](https://github.com/apple/swift/pull/1108)。

Brian Croom 提交了一个有关 corelibs-xctests 的 [pull request](https://github.com/apple/swift-corelibs-xctest/pull/40) ，讨论了 Darwin XCTest 和 coerlibs-xctest 之间的兼容性问题。

### Proposals

Erica Sadun 提议：“消除 Swift 中的内置宏定义（Snake Case Identifier）”，这样就能对 C 残余语法说再见了。（[提案地址](https://github.com/erica/swift-evolution/blob/master/proposals/00xx-modernizing-debug-identifiers.md) ps:404...）

> 该提案旨在消除 Swift 中的内置宏定义，例如`__FILE__`和`__FUNCTION__`，同时以 # 号为前缀，驼峰写法命名变量替换早前实例，譬如`#sourceLocation`。

提案 [SE-0013](https://github.com/apple/swift-evolution/blob/master/proposals/0013-remove-partial-application-super.md)：“Remove Partial Application of Non-Final Super Methods” 已被[拒绝](https://lists.swift.org/pipermail/swift-evolution-announce/2016-January/000022.html)。

以下三个提案目前正在审核当中。由于这三者之间具有一定联系，因此它们集中进行审核。

* [SE-0023](https://github.com/apple/swift-evolution/blob/master/proposals/0023-api-guidelines.md)，API 设计准则
* [SE-0006](https://github.com/apple/swift-evolution/blob/master/proposals/0006-apply-api-guidelines-to-the-standard-library.md)，标准库中应用 API 准则
* [SE-0005](https://github.com/apple/swift-evolution/blob/master/proposals/0005-objective-c-name-translation.md)，有关 Objective-C API 更好地移植到 Swift 

### Mailing lists

Nicole Jacque [指出](https://lists.swift.org/pipermail/swift-dev/Week-of-Mon-20160125/000934.html)了新的快照命名格式。从现在起，开发版本快照将以 `swift-DEVELOPMENT-SANPSHOT` 开头，与发布版快照加以区分。

Dmitri Gribenko [研究并大大减少](https://lists.swift.org/pipermail/swift-dev/Week-of-Mon-20160125/000943.html)了 `StdlibUnittest` 的构建时间。`StdlibUnittest` 作为一个内部库，用于为 stdlib，runtime 部分以及编译器写测试。

> 但是还有个问题：目前，StdlibUnittest 占据太多的时间去进行构建项目了。[...]     
测量时间表明，该组合模块的构建时间是大于各自构建时间的总和，甚至当优化开启时尤为明显。我们可以推测，优化器并未根据模块大小做出较好的调整。


最后 - 倘若你感觉 Swift 的变化实在太快或者你想尝试一些新的东西，弱弱地推荐 [TrumpScript](https://github.com/samshadwell/TrumpScript) 😂。让我们再创造一门伟大的语言吧。™
