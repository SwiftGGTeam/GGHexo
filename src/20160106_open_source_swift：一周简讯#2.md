title: "聚焦 Swift #2"
date: 2016-01-06 12:30:00
tags: [Swift 开源信息]
categories: [Open Source Swift]
permalink: open-source-swift-weekly-2

---
原文链接=http://www.jessesquires.com/open-source-swift-weekly-2/
作者=Jesse Squires
原文日期=2015.12.17
译者=pmst
校对=numbbbbb
定稿=numbbbbb

<!--此处开始正文-->

>本周 Swift.org 又有哪些新鲜事呢？ **2015.12.17**

Swift.org 社区已经度过其源码开发的第二个星期。倘若你期望过个安静的周末，最好打消这个念头。要知道项目中仍旧还有一大堆事情需要处理，压根就没有减缓的迹象。Swift 团队继续以公开的方式[运作](https://twitter.com/uint_min/status/675022507527684096)，鼓励开发者们加入到贡献的行列中。本周主要修复了一些 crashs 以及更多的 Swift 变革提案。闲话少说，开始本周简讯！

<!--more-->

### 社区

Craig Federighi 在 John Gruber 的[脱口秀节目](http://daringfireball.net/thetalkshow/2015/12/07/ep-139)中回顾了 Swift 的第一周开源情况。我真的非常喜欢这一期节目，继续被苹果的开源所深深折服！采访仅仅只持续了 30 分钟左右。Daring Fireball 还提供了完整的[采访对话记录](http://daringfireball.net/thetalkshow/139/federighi-gruber-transcript)。

[@zhuowei](https://github.com/zhuowei) 看起来已经在为 [Android](https://github.com/SwiftAndroid) 提供 Swift 支持了。我真心希望这个项目能火起来。用 Swift 开发 Andriud 应用对于移动开发者来说无疑是一个巨大的胜利！

这里需要澄清上星期的一个纰漏 —— 柯里化函数将不会被完全移除，仅仅只是[语法](https://github.com/apple/swift-evolution/pull/43#issuecomment-163849233)而已。

### Commits 和 pull requests

* [Slava Pestov](https://github.com/slavapestov) 推送了一个 [commit](https://github.com/apple/swift/commit/c258f991f64a431da57fc79b66e879e5062fba3b) 修复了编译器中 91% 的报错。😲（pmst注：本来编译时有783个错误，现在只有74个了！）
* [Dominique d'Argent](https://github.com/nubbel) 在他自己实现的 `NSAffineTransform` 中首次介绍了 [unicode 变量名称](https://github.com/apple/swift-corelibs-foundation/pull/93#discussion_r47160608)。这也是迄今为止我所看到的唯一一个。谁要是能把使用 💩 的 pull request 合并到项目中，我非常乐意请他喝杯☕或🍺。
* [Bill Abt](https://github.com/apple/swift/pull/413) 和 [David Grove](https://github.com/apple/swift-corelibs-libdispatch/pull/15) 这两位来自 IBM 的大神为 Swift 和核心标准库（core libraries）做出了巨大的贡献！正如 Federighi 在脱口秀所说， IBM 非常乐意将 Swift 应用到服务器端。
* Chris Lattner 修复了少量的 [radars](https://github.com/apple/swift/commit/0bfacde2420937bfb6e0e1be6567b0e90ee2fb67) 问题。
* [Daninel Duan](https://github.com/dduan) 提交了一个 [pull request](https://github.com/apple/swift/pull/419) 用于优化 `Set` 集合类型。这将提升大约 42% 的执行效率。咳！[@PracticalSwift](https://twitter.com/practicalswift) 还修正了[一堆](https://github.com/apple/swift/pull/561)[错别字](https://github.com/apple/swift/pull/526)。😂
* William Dillon 开始为 ARMv7 主机提供[支持](https://github.com/apple/swift/pull/439)，譬如 Raspberry Pi,，BeagleBone 以及 Nvidia Tegras.
* Brian Gesiak 一如既往地从事[测试 XCTest 框架的工作](https://github.com/apple/swift-corelibs-xctest/pull/14)，他在 corelibs-xctest 项目的提交数量贡献榜中位居[第三](https://github.com/apple/swift-corelibs-xctest/graphs/contributors)。👏



### 提案


第一个独立的 Swift 语言的变革提案已经被[采纳](https://twitter.com/clattner_llvm/status/676472122437271552)啦！你必须感谢下 [Erica Sadun](https://twitter.com/ericasadun) ，是她让你告别了 [C 语言风格的 for 循环](https://github.com/apple/swift-evolution/blob/master/proposals/0007-remove-c-style-for-loops.md)。从 Swift2.2 开始，如果使用 C 语言风格的 for-loop ，你将收到警告信息，直至 Swift3.0 正式发布版本中将被彻底移除。“在大多数情况下，我们一致认同在 Swift 代码中极少会使用 C 语言风格的 for-loop ”，大多数情况下会选择使用`for-in`语句。同时注意到[通知](https://lists.swift.org/pipermail/swift-evolution-announce/2015-December/000001.html)中描述了改变将可能导致的两个潜在问题。 

[Max Howell](https://github.com/ddunbar)，[Daniel Dunbar](https://github.com/ddunbar)，和 [Mattt Thompson](https://github.com/mattt) 已经准备提交一份[提案](https://github.com/apple/swift-evolution/pull/51)，为 [Swift 包管理器](https://github.com/apple/swift-package-manager)（Swift package manager）增加测试支持！“测试是现代软件开发中的一个重要组成部分。紧密耦合的测试集成到 Swift 包管理器中有助于确保一个稳定可靠的打包机制。我们建议扩展我们的常规包目录布局以适应测试模块。”🎉


Max Moiseev 建议给 `AnySequence.init` 增添约束条件，应该会在本周审核。我想不出任何理由为什么这个建议不被采纳。“事实上，这些约束应该被应用到 `SequenceType` 协议自身上（尽管就目前来看是不太可能了），同我们预期的那样每个 `SequenceType` 实现都已经满足自身。”

Divid Hart [建议](https://github.com/apple/swift-evolution/blob/master/proposals/0009-require-self-for-accessing-instance-members.md)：要求使用 `self` 来访问实例成员，目前正在审核当中。如果你现在还未遵守的话，`self` 关键字总是必须的，即使它可以进行隐式地推断。譬如， `self.view` 与简化的 `view`。 有关这个的讨论非常多，你可以前往[邮件列表](http://www.jessesquires.com/open-source-swift-weekly-2/(https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20151214/002407.html))和 [twitter](https://twitter.com/ashfurrow/status/676881928168017921) 看看。我并不是这个建议的拥护者，但是这样有助于我理解一些参数。

Erica Sadun 同时发表了一篇精彩的文章细述了最近的一些提议。

### Mailing lists

这里有个非常有意思的[话题](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20151207/001948.html)，有关动态方法与静态方法的调度。Chris Lattner 亲述：“简而言之：我真正所要表达的意思是旧的静态与动态比喻至少只是故事的一半。你真正需要的是将编译模型包含进来，从而由此产生的程序设计模式加入到故事中，要知道程序设计模式才是真正所要关心的。”

Fabian Ehrentraud 发起了一个[话题](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20151207/001054.html)，讨论了当导入无 `nullability` 属性的 Objective-C 代码时如何改善崩溃安全性（crash-safety）。目前，出自 Objective-C 的成员采用隐式可选类型桥接到 Swift 上（例如 view!）。这个提议中建议在导入这些成员时用显示可选类型替换（view?），这样可以促使开发者安全地处理可能的 `nil` 值。对我来说，这听起来很不错。老实讲，我不太理解为什么一开始会有隐式解包可选（implicitly unwrapped optionals）存在，这看起来和 Swift 的安全宗旨相悖嘛。

Colin Cornaby [建议](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20151214/002324.html)将分号（;）完全从 Swift 中移除来顺应摒弃所有 C-style 语言特性的大势。正如邮件列表中有人提到，分号在语法上通常可以忽略，但是它们能将类似的语句组合到一行代码中，提高代码可读性。我觉得两者都有道理，不过目前来看这个讨论还没有引起足够的重视，短期不太可能修改。
送大家一句话：

> Stare long enough into the language design, and the language design stares back into you.     
> —— [Joe Groff](https://twitter.com/jckarter/status/676939142790569986)
