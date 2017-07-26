title: "Swift 周报 #76"
date: 2017-07-26
tags: [Jesse Squires]
categories: [Swift 进阶]
permalink: swift-weekly-issue-76
keywords: [Swift 周报]
custom_title: Swift 周报
description: Swift 周报
---
原文链接=https://swiftweekly.github.io/issue-76/
作者=Jesse Squires
原文日期=2017-06-29
译者=四娘
校对=Cwift
定稿=shanks

<!--此处开始正文-->

*本期作者：[Garric Nahapetian](https://twitter.com/garricn)*

Swift 的 [git 仓库](https://github.com/apple/swift)这周特别忙，这里有一些 GitHub 的数据：

> 除了 Merge 之外，总共有 39 个作者 push 了 156 个 commit 到主分支，所有分支算起来有 284 个 commit。在主分支，401 个文件被修改，增 12589 删 9215 …

在 WWDC 结束不久就完成了这么多的事情实属不易，在 Swift 4 立项之后核心团队和别的贡献者完成了惊人的进展。

<!--more-->

iOS 11 beat 2，tvOS 11 beta 2 和 Swift Playgrounds 2 beta 2 都开放下载了，点击[此处下载](https://developer.apple.com/download/)，遇到 bug 记得要反馈哦！

> **赞助链接**
> 
> [提升你的技能 — 成就你的职业生涯](http://www2.bignerdranch.com/l/299472/2017-06-21/8rxl/?utm_campaign=Swift_Weekly_Brief&utm_medium=email_web&utm_source=Swift_Weekly_Brief_76)
> 
> 专家带你入门到精通只需一周时间。
> 
> [bignerdranch.com](http://www2.bignerdranch.com/l/299472/2017-06-21/8rxl/?utm_campaign=Swift_Weekly_Brief&utm_medium=email_web&utm_source=Swift_Weekly_Brief_76)

## Swift Unwrapped

在[第 17 集：Swift 里的测试](https://spec.fm/podcasts/swift-unwrapped/70319)，Jesse 和 JP 讨论了如何使用 Swift 和相应的工具进行测试，保证每一个上线版本都井然有序。

##  资讯及社区

Greg Heo [写了一篇文章](https://swiftunboxed.com/stdlib/json-encoder-encodable/)讲述 Swift 里 `Encoder` 和 `Encodable` 的原理，这个新功能会影响到很多开源的软件，了解它的原理更有助于你理解它们相关的 PR。

Matt Godbolt 的*探索编译器*现已[支持 Swift](https://twitter.com/Catfish_Man/status/877991651548975104)。（译者注：这是一个学习编译原理的网站，输入代码，就可以看到编译后在对应平台上的汇编码）

David Owens 放出了一个 [VSCode 的插件](https://owensd.io/2017/06/02/apous-early-preview/)，让 VSCode 也能支持 Swift。

Swift 支援团队[开源](https://twitter.com/swift_evolution/status/878322333471068160)了 Swift-Evolution 的 App — [Evo](https://itunes.apple.com/us/app/evolution-app/id1210898168?mt=8)。


Steven Hepting [讲述](https://twitter.com/stevenhepting/status/878339681485635585)了 Swift 的 `sort()` 方法是怎么优化的，这里可以找到相应的[源码](https://github.com/apple/swift/blob/02e2bd5380af69948d2324b936bfc61e1454d8ea/stdlib/public/core/Sort.swift.gyb#L232-L301)。

[Learn Swift 皇后区](https://www.meetup.com/Learn-Swift-Queens-Meetup/) & [Learn Swift 波兰](https://www.meetup.com/Learn-Swift-Portland/), 都落下了帷幕。 这是11期  [Learn Swift {城市}](https://wordpress.com/post/swiftcoders.org/178) 系列的合集！下次会是在哪座城市呢？

[Brisk，一个反馈 bug 的 macOS app](https://github.com/br1sk/brisk) 上线了 [1.0 版本](https://github.com/br1sk/brisk/releases/tag/1.0.0) ，并且快速迭代发布了 [1.0.1 版本](https://github.com/br1sk/brisk/releases/tag/1.0.1)，记得要帮忙反馈 bug 哦！

元组门又有了更多的[进展](https://twitter.com/s1ddok/status/879406585939984386)，这对我来说很有趣，因为[我个人也使用过类似的方式](https://github.com/garricn/GGNObservable/blob/master/GGNObservable/Classes/Observable.swift#L53)。就像 [Slava 指出](https://twitter.com/slava_pestov/status/879446070190800896)的那样，这件事情始终还有[优化的空间](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20160307/012299.html)。（译者注：元组门就是闭包里的元组不再自动展开的事情，[前两周](http://swift.gg/2017/07/16/swift_weekly_issue_74/)的[周报](http://swift.gg/2017/07/24/swift-weekly-issue-75/)都有提到，详情请看 [SE-0029](https://github.com/apple/swift-evolution/blob/master/proposals/0029-remove-implicit-tuple-splat.md)，[SE-0066](https://github.com/apple/swift-evolution/blob/master/proposals/0066-standardize-function-type-syntax.md) 和 [SE-0110](https://github.com/apple/swift-evolution/blob/master/proposals/0110-distingish-single-tuple-arg.md)）。

## 提交和合并的请求

Ben Cohen 发起一个新的[合并请求](https://github.com/apple/swift-evolution/pull/728)，让 `Substring` 可以添加到 `Hashable` 容器里（详情请看下面的邮件列表讨论）。

Itai Ferber [通过了一个合并请求](https://github.com/apple/swift/pull/10538)，修复了 [SR-5277](https://bugs.swift.org/browse/SR-5277)，让 class 可以与父类共用一个 Encoder/Decoder。更多详情请看这里的[讨论进程](https://twitter.com/garricn/status/878426105585127425)。

Philippe Hausler [通过了一个合并请求](https://github.com/apple/swift/pull/10584)，修复了 [SR-5292](https://bugs.swift.org/browse/SR-5292)。修复了 Foundation 里使用 slice 嵌套 slice 时产生的 bug。

Joe Groff  [通过了一个合并请求](https://github.com/apple/swift/pull/10556)，让 KeyPath 支持可选链（Optional Chainning）和强制解包（Force Unwrapping）。

Doug Gregor [通过了一个合并请求](https://github.com/apple/swift/pull/10565) ，优化了基本类型，类型别名和递归的处理逻辑，并且修复了 [SR-4295](https://bugs.swift.org/browse/SR-4295)，[SR-4757](https://bugs.swift.org/browse/SR-4757)，[SR-4786](https://bugs.swift.org/browse/SR-4786)，[SR-5014](https://bugs.swift.org/browse/SR-5014) 和 [SR-4737](https://bugs.swift.org/browse/SR-4737)。

Dave Abrahams [发起一个合并请求](https://github.com/apple/swift/pull/9806)，实现了 [SE-0180](https://github.com/apple/swift-evolution/blob/master/proposals/0180-string-index-overhaul.md) 字符串索引越界（后面有详细介绍）。

在命令行里运行 `man swift` 时展示的手册[已获得更新](https://github.com/apple/swift/pull/10241)。

Maxim Moiseev [通过了一个合并请求](https://github.com/apple/swift/pull/9466)，修复了 `[String]` 使用 `flatMap` 时的向后兼容性，有兴趣了解的话可以查看这里的 [Swift 迷思- by Robert Widmann](https://twitter.com/codafi_/status/878330155642396673)。

David Farler [通过了一个合并请求](https://github.com/apple/swift-clang/pull/95)，内容主要是 Xcode 9 里编译时索引功能（index-while-building）在这段时间里的改进。

如果你想知道某个修复了 `rdar://` 的 PR 的细节，[放心大胆地问就可以了](https://twitter.com/garricn/status/879551154316689408)。

## 审核中的提案

[SE-0180](https://github.com/apple/swift-evolution/blob/master/proposals/0180-string-index-overhaul.md): String Index Overhaul 在一些讨论之后重新退回[审核阶段](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20170619/037653.html)。

## 邮件列表

Erica Sadun [写了一篇文章](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20170626/037730.html)关于 `!!` 这个她称为“解包或崩溃”的操作符。你可以在[这个 Gist](https://gist.github.com/erica/423e4b1c63b95c4c90338cdff4939a9b) 里找到相应的草稿。

> 使用一个操作符，在解包失败时提供反馈信息，已经成为 Swift 开发者社区里普遍会实现的一个东西了，你对于把这个广泛使用的操作符加入到标准库有什么想法？
> 
> *译者注：使用了 `!!` 的代码会类似于这样 `let _ = optionalObject !! "空的对象"`，能够在强制解包失败的时候提供 debug 信息，思路很棒，建议大家看一下。*

Ben Cohen [发了一篇文章](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20170626/037776.html)，内容主要是关于 `Substring` 性能的讨论。

> 作为 [SE-0163](https://github.com/apple/swift-evolution/blob/master/proposals/0163-string-revision-1.md) 的要点之一，`Substring` 显式转换到 `String` 的问题都推迟到第一版实现之后讨论。直到现在，收到的反馈也都没有让我们觉得这样的显式转换很有必要 — 从 3.2 迁移到 4.0 的时候也不怎么需要用到   `Substring` 到 `String`的转换。即便不在开发目标里，只要是这方面的版本迁移问题，收到您的反馈我们都会很感谢。
>  
> […]

Itai Ferber [在 Swift-Evolution 发了一条信息](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20170619/037672.html) ，征求 [SE-0166](https://github.com/apple/swift-evolution/blob/master/proposals/0166-swift-archival-serialization.md) 和 [SE-0167](https://github.com/apple/swift-evolution/blob/master/proposals/0167-swift-encoders.md) 的反馈，希望社区了解到之前的很多建议已经被采纳并实现，继续提供建议和意见。

Robert Bennett 提了一个[有趣的建议](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20170619/037676.html)，希望 protocol 里可以声明 `let`。但我并不认为他提的算是一个问题。

> 我在处理协议的时候遇上了一个恼人的问题。在一个 `class` 或者 `struct` 里使用 `let` 去修饰一个属性并且在 `init` 方法里初始化是很常见的情况，但却没办法在一个 protocol extension 里实现一个这样的 `init` 方法。
> 
> […]

## 最后

“索取”[有时候](https://twitter.com/harlanhaskins/status/878499165663240192)比“给予”感觉更好


