Swift 周报 #75"

> 作者：Jesse Squires，[原文链接](https://swiftweekly.github.io/issue-75/)，原文日期：2017-06-22
> 译者：[四娘](https://kemchenj.github.io)；校对：[Cwift](http://weibo.com/277195544)；定稿：[shanks](http://codebuild.me/)
  









*本期作者: [Greg Heo](https://twitter.com/gregheo)*

我不知道你怎么样，但我还沉浸在 WWDC 的余兴里没恢复过来。

回到实际生活中，苹果发布了 iOS 和 Xcode 的第二个 beta 版。查看[开发者网站](https://developer.apple.com/)，Xcode 9 Beta 2 的更新说明特别提到了 Swift 4 的更新和修复。



> **赞助**  
>   
> [Advanced Swift Workshops](https://www.eventbrite.com/o/plausible-labs-12068803363/?utm_campaign=Swift_Weekly_Brief&utm_medium=email_web&utm_source=Swift_Weekly_Brief_75)  
>   
> 磨炼你的 Swift 技能，在 workshop 里学习一些更深入的主题。诸如 Mike Ash 这样世界知名的开发者，Swift 的专家齐聚一堂，他们将会带领你探索协议，泛型，反射和 C 语言的桥接。7 月 13 日华盛顿场，以及 7 月 24 日纽约场。  
>   
> [eventbrite.com](https://www.eventbrite.com/o/plausible-labs-12068803363/?utm_campaign=Swift_Weekly_Brief&utm_medium=email_web&utm_source=Swift_Weekly_Brief_75)  

## 社区任务

写测试是一种探索标准库和语言特性的好方式，也能避免给项目留坑。

* [SR-4824](https://bugs.swift.org/browse/SR-4824)：编译期添加集合类型约束的检查
* [SR-5040](https://bugs.swift.org/browse/SR-5040)：将 “Exclude” 相关的功能性检查改为单元测试

可以通过 [pull request](https://github.com/SwiftWeekly/swiftweekly.github.io/compare) 或者 [tweet](https://twitter.com/swiftlybrief) 提交任务。

## Swift Unwrapped

在 [第 16 集：Swift 的错误处理 — 发展历史](https://spec.fm/podcasts/swift-unwrapped/72297) 里，主持人提到了 `rethrows` 和 “类型” 很多次，缅怀 Objective-C，畅谈 Swift 错误处理机制的发展史。

## 资讯及社区

Swift 团队的巨星 [Joe Groff](https://twitter.com/jckarter/status/875401073447419904) 要暂时离开 Twitter，Joe 在 Twitter 上一直对社区积极响应，我们希望他早日回归。

聊到 Joe，[他的前任](https://www.youtube.com/watch?v=Ntj8ab-5cvE) [Chris Lattner](https://twitter.com/clattner_llvm/status/877341760812232704) （你们应该都认识）要重新找工作，虽然他说自己有 [七年 Swift 开发经验](https://twitter.com/clattner_llvm/status/877353276676612102)，但我估计大部分公司还是想找一个有十年经验的 `¯\_(ツ)_/¯`

Xcode 9 和 Swift 4 现在还在测试阶段，现在是一个回顾所有提案的好机会，看一看 [Eric Cerney](https://twitter.com/ecerney) 总结出来的 [What’s New in Swift 4?](https://www.raywenderlich.com/163857/whats-new-swift-4)。

[Ankit Aggarwal](https://twitter.com/aciidb0mb3r/status/877653585844031493) 在 Swift 的博客里写了一篇 [重新设计 Swift Package Manager 的 API](https://swift.org/blog/swift-package-manager-manifest-api-redesign/)，讲述新的 API 设计。Swift 的 package 描述是使用 Swift 写的，新的 API / 格式现在已经更新到了最新的语言设计规范。

## 提交和合并的请求

Philippe Hausler 提了一些关于 [SE-0170: NSNumber 与数字类型的桥接](https://github.com/apple/swift-evolution/blob/master/proposals/0170-nsnumber_bridge.md) 的[反馈](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20170612/037499.html)，主要是与 Float 和 Double 有关。如果你之前被浮点数的精度问题困扰过的话，可以查看[“减少Double 和 Float 桥接的约束条件”的 commit](https://github.com/apple/swift/commit/c358afe6555e5e32633e879f96a3664dc7a5f3dc).

Swift 迁移工具已经 merge 到仓库里了！迁移工具的核心就是把一个文件作为输入，然后输出一份文件，包含了所有修改建议，具体细节请查看 [Swift migrator library](https://github.com/apple/swift/tree/master/lib/Migrator) 文件夹。

Swift 4 里大家最喜欢的 `Encodable` 协议，[添加了对于 non-strong（weak，unowned，unmanaged）属性的支持](https://github.com/apple/swift/pull/10321)。

Swift 问题追踪的第二个 bug 终于终于被修复了！🎉 [SR-2](https://bugs.swift.org/browse/SR-2) 和 [SR-4196](https://bugs.swift.org/browse/SR-4196) 描述了 switch 语法嵌入到 `#if` / `#endif` 里的时候不能很好地运行，[最近的一个 commit](https://github.com/apple/swift/pull/9457/commits/5d478bdb3b7638f5df6f0e1f4e574bececae9b80) 终于修复了这个问题.

Xcode 9 里你可以使用 [Undefined Behavior Sanitizer](https://developer.apple.com/documentation/code_diagnostics/undefined_behavior_sanitizer) 检测所有未定义行为，[Main Thread Checker](https://developer.apple.com/documentation/code_diagnostics/main_thread_checker) 利用现有的 Address Sanitizer 和 Thread Sanitizer 来检测在非主线程刷新 UI 的行为，而。这些新功能都已经 [merge 到 swift-lldb 里了](https://github.com/apple/swift-lldb/pull/211/commits)，如果你感兴趣的话可以去看源代码。

## 提案

作为[这篇去年发布的文章](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20160425/015920.html)的跟进，[Erica Sadun](https://github.com/erica)，[Olivier Halligon](https://github.com/AliSoftware)，[Caleb Davenport](https://github.com/calebd) 和 [Brian King](https://github.com/KingOfBrian) 提交了一个[关于 protocol extention 函数的 “role keywords” 的提案草稿](https://github.com/erica/swift-evolution/blob/2f2778797ceb9edc0b8acd3b68af5f81f9a95775/proposals/XXXX-role-keywords.md)。主要是讲了重写 protocol extension 里的函数时，需要加上一个关键字显式地声明这是一个 override 行为。


[SE-0110](https://github.com/apple/swift-evolution/blob/master/proposals/0110-distingish-single-tuple-arg.md) 想要让多个参数 `(String, Int)`  的函数和单个元组 `(String, Int)` 参数区分开来。他们看起来是不是一样？就像 Doug Gregor 在邮件列表里提到的，[这个修改会让编译过程变得有点复杂：](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20170619/037616.html)

> Swift 4 已经实现了超出 SE-0110 的内容了，特别对于闭包来说，使用体验差了很多。  
>   
> […]  
>   
> Swift 核心团队觉得这些使用体验的牺牲对于 Swift 4 来说是不可接受的。已经有好几个计划内的解决方案，给闭包提供一个更好的模型，解决用户体验的问题，但完整的设计和实现已经超出了 Swift 4 的开发目标了。所以，我们打算“回滚” SE-0110 在 Swift 4关于函数参数的修改。  

没人可以预知未来，很难了解这些提案对于 Swift 的影响，但这也是为什么我们有 snapshots builds 和 beta 版本。至于说 [SE-0110 带来的影响](http://ericasadun.com/2017/06/20/more-on-se-0110-important-fallout-please-read/) ，我觉得我们应该全部参与进社区里，去鼓励 [Austin Zheng](https://twitter.com/austinzheng/status/877054901620101120)（SE-0110 的作者）继续坚持下去。

没有新的提案，但照例，更多细节请查看 [Swift Evolution status page](https://apple.github.io/swift-evolution/)。

## 邮件列表

还记得 [SE-0104: Protocol-oriented integers](https://github.com/apple/swift-evolution/blob/master/proposals/0104-improved-integers.md) 吗？[Xiaodi Wu](https://github.com/xwu) 最近写了一些优化实现方式的[想法和建议](https://gist.github.com/xwu/d68baefaae9e9291d2e65bd12ad51be2)。

Halen Wooten 开了一个新的[讨论](https://lists.swift.org/pipermail/swift-dev/Week-of-Mon-20170619/004829.html)，讨论作为社区的成员该如何为社区贡献。我知道邮件列表的界面很粗糙，但查看[整个讨论](https://lists.swift.org/pipermail/swift-dev/Week-of-Mon-20170619/thread.html#4829)总能有一些收获。根据[文档](https://lists.swift.org/pipermail/swift-dev/Week-of-Mon-20170619/004833.html)[尽量使用增量编译节省时间](https://lists.swift.org/pipermail/swift-dev/Week-of-Mon-20170619/004835.html)，我希望类似的这些技巧可以收集起来做成一份入门指南。

## 最后

学完 Swift 之后，你会希望做出什么样的语言？[例如这个](https://twitter.com/slava_pestov/status/875150641269571584)，[可能直接把访问权限去掉](https://twitter.com/slava_pestov/status/875153089174446080)? 😱


> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。