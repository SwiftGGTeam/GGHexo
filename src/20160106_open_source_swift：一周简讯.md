title: "聚焦 Swift #1"
date: 2016-01-06 12:20:00
tags: [Swift 开源信息]
categories: [Open Source Swift]
permalink: open-source-swift-weekly-1

---
原文链接=http://www.jessesquires.com/open-source-swift-weekly-1/
作者=Jesse Squires
原文日期=2015-12-10
译者=pmst
校对=numbbbbb
定稿=numbbbbb

<!--此处开始正文-->

[上一篇文章](http://www.jessesquires.com/swift-open-source/)中我阐述了自己的想法以及时刻关注 [Swift open source](https://swift.org/) 项目的动向，看起来深得社区中许多开发者的喜欢。因此，我将竭尽所能维护该周刊——每周三更新哦，要知道 Swift 开源项目通告就在这一天发布。每周我都会提供高质量的汇总，细述本周发生的变动，更新一些有意思的统计信息，以及提供感兴趣的内容链接。如果你有任何建议，请告诉[我](https://twitter.com/jesse_squires)!。OK！是时候开始安利本周内容了！

<!--more-->

### This week on Swift.org 

* [Manav Gabhawala](https://twitter.com/ManavGabhawala) 提交了一个非常有趣的[建议](https://github.com/apple/swift-evolution/pull/37)：为 Swift 增加隐式构造方法（ implicit initializers）。特别指出这将解决数字类型（number types）转换时候冗长的问题。不管怎样，[邮件列表](https://lists.swift.org/pipermail/swift-evolution/2015-December/000352.html)中指出了相关安全和清晰的观点。
* [Alex Denisov](https://twitter.com/1101_debian) 提交了一个 [pull request](https://github.com/apple/swift/pull/295) 竟然修复了 323 个 crashes 。😲
* [使用 git ](https://github.com/apple/swift-evolution/pull/39)火候不够？别担心！许多[牛人](https://github.com/apple/swift-evolution/pull/34#issuecomment-162693826)同样不擅长那玩样。我想指出：别因为这个而成为你为 Swift 做贡献的绊脚石！
* 昨天晚上 Chris Lattner 修复了 [radars](https://github.com/apple/swift/commit/5dded3f3523e9bd6ea45d0b6ffe5068a59d03a3f) 问题。
* 倘若你注意到这条消息，柯里化函数将[从 Swift3.0 中被移除](https://github.com/apple/swift-evolution/blob/master/proposals/0002-remove-currying.md)了。（什么是[柯里化](https://robots.thoughtbot.com/introduction-to-function-currying-in-swift)?）ps：下一篇文章中作者已经纠正，暂不透剧。^.^
* [David Owens](https://twitter.com/owensd) 提交了一份[提案](https://github.com/apple/swift-evolution/pull/26)为 `throws` 关键字增添类型注释。当 Swift 的错误处理模型首次调用时，缺乏明确的错误类型受到开发者普遍的批评。邮件列表中对此进行了良好的[讨论](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20151207/001117.html)。这里给出了原始版本的 [Error Handling](https://github.com/apple/swift/blob/master/docs/ErrorHandlingRationale.rst) 以及 [Rationale 和 Proposal](https://github.com/apple/swift/blob/master/docs/ErrorHandlingRationale.rst) 供你参考。
* Swift 目前已经拥有将近 200 的贡献者以及超过 230 的 pull request 被合并进来。
* 上星期我提到了 [Foundation](https://github.com/apple/swift-corelibs-foundation) 还遗留大量[未实现的内容](https://github.com/apple/swift-corelibs-foundation/search?utf8=✓&q=NSUnimplemented)。同时还存在一些令人惊讶的 [bugs](https://github.com/apple/swift-corelibs-foundation/pull/89/files) 等待处理。
* [Andrew Naylor](https://github.com/argon) 雄心勃勃地实现了 [NSJSONSerialization](https://github.com/apple/swift-corelibs-foundation/pull/54)。👏
* [Jacob Bandes-Storch](https://twitter.com/jtbandes)提交了一份[提案](https://github.com/apple/swift-evolution/pull/44)致力于提高与 C API 的桥接。
* 邮件中列表中还讨论了一个很有意思的问题，默认为 class 以及 methods 标记为 `final` 。其实任何阻止或防止子类化（subclassing）对我来说都是没问题的（不妨看看作者的[观点](https://twitter.com/jesse_squires/status/664588682997964800)）。😊
* Swift Programming Language iBook(ePub) 官方文档目前可以直接从 Swift.org 官网上下载下来（不再局限于 iBook Store），此外目前书籍是基于[知识共享署名4.0国际(CC by 4.0)许可证](https://swift.org/documentation/)下开源的！对于翻译来说这是相当棒的！ps：原因请点[这里](https://twitter.com/clattner_llvm/status/674454905449373696)。
* 对于 Chris Lattner 来说，编程不过是“夜晚和周末”的爱好罢了。😂
