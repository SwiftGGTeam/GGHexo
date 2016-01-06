title: "聚焦 Swift #3"
date: 2016-01-06 12:20:00
tags: [Open Source Swift]
categories: [Swift 开源信息]
permalink: open-source-swift-weekly-3

---
原文链接=http://www.jessesquires.com/open-source-swift-weekly-3/
作者=Jesse Squires
原文日期=2015.12.24
译者=小锅
校对=numbbbbb
定稿=numbbbbb


正如预期的一样，在圣诞放假期间 Swift.org 的[步伐](https://lists.swift.org/pipermail/swift-corelibs-dev/Week-of-Mon-20151214/000179.html)[慢了下来](https://lists.swift.org/pipermail/swift-dev/Week-of-Mon-20151221/000540.html)。我也在放假期间出去玩耍了一番，所以这篇文章会比较平常的来得短。如果你还没准备好，我强烈建议你从代码中抽身出去享受一下假期，[防止过劳](https://twitter.com/chriseidhof/status/679213894343200768)（译者注：然而我们并没有放假）。😄现在，让我们开始本周简讯！

<!--more-->

## Commits 以及 Pull requests

[@tienex](https://github.com/tienex) 针对 Linux/armv7 支持提交了一个[pull request](https://github.com/apple/swift/pull/608)。

[@practicalswift](https://github.com/practicalswift) 增加了大量的 [测试用例](https://github.com/apple/swift/pulls?utf8=%E2%9C%93&q=is%3Apr+author%3Apracticalswift+is%3Aclosed+test+case)。在写本篇文章的时候，这些改变应该还需要一段时间才会被合并。

[@masters3d](https://github.com/masters3d) 合并了一个 [pull request](https://github.com/apple/swift-evolution/pull/72/files)，这个 PR 将一些对于 Swift 的常见改变文档化了。这是一个很棒的主意，可以减少重复的建议。在为邮件列表提交建议时，记得要先[核对这个列表](https://github.com/apple/swift-evolution/blob/master/commonly_proposed.md) 。

Doug Gregor [实现了 SE-0001](https://github.com/apple/swift/commit/c8dd8d066132683aa32c2a5740b291d057937367)，“允许（基本上）所有的关键字作为参数标签”。这是一个很大的改变。当 Swift 首次发布的时候，我的一个 Objective-C 库使用了 `extension:` 作为一个[参数名称](https://github.com/jessesquires/JSQSystemSoundPlayer/issues/8)(作为一个文件的扩展名)并且桥接到了 Swift 当中，这导致了很多的问题，所以我只能将它重命名为 `fileExtension:`。我十分期待在 Swift 2.2 当中看到这个改变！注意 `var`，`let` 和 `inout` 关键字被排除在外。

## 建议

Oisin Kidney 的[建议 (SE-0008)](https://github.com/apple/swift-evolution/blob/master/proposals/0008-lazy-flatmap-for-optionals.md)，*为可选类型序列增加一个 Lazy flatMap*，已经被 Swift 2.2 [接受](https://lists.swift.org/pipermail/swift-evolution-announce/2015-December/000006.html)！🎉

Kevin Ballard 的[建议 (SE-0015)](https://github.com/apple/swift-evolution/blob/master/proposals/0015-tuple-comparison-operators.md)，Tuple 比较运算符已经[被接受](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20151221/004423.html)！在写作本篇文章的时候，这个建议的状态还未返回在 GitHub 上。因为这个建议不会影响到现在代码，我猜它应该会加入到 Swift 2.2 当中。🎉

Joe Groff 提交了[一个建议](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20151214/003148.html)，为 Swift 的属性增加属性行为。你可以在 GitHub 上找到[原型](https://gist.github.com/jckarter/f3d392cf183c6b2b2ac3)。如果你更喜欢在 twitter 中获取这些信息，[它在这里](https://twitter.com/jckarter/status/677554831003791360)。😄 简单来讲，这个建议提出了一个大纲，可以使用一个扩展的框架为属性增加不同的属性行为，类似 Objective-C 当中的 `atomic` 与 `copy`。目前，Swift 有些硬编码的针对特定用途的属性行为，比如 `lazy`，`@NSCopying`，和 `willSet` / `didSet`。这个建议主要目的是将这些概念规范和统一起来，使它们跟底层的框架实现方式一致，以使它们可以更方便地进行扩展。开发者甚至可以实现它们自己的属性行为。这听起来实在很酷。一些示例的属性行为包含：lazy, 记忆化(memoization), 延迟初始化(delayed initialization)。

## 邮件列表

Andyy Hope 开启了[一个讨论](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20151221/003819.html)，建议为枚举增加一个 `.allValues` 属性，通过这个属性可以将枚举中的所有 case 以数组的方式返回。看起来到目前为止有很多人支持这个观点。[Jacob Bandes-Storch](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20151207/001233.html) 在几周之前也提出过这个想法。我也是这个想法的拥簇者，在之前我就好几次试图写过几次这样的代码了。👍 

Kevin Ballard [建议](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20151221/004223.html) 为“一周Swift”建立一个更正式的 newsletter. 😁 也许我应该创建一个 swiftweekly.org?