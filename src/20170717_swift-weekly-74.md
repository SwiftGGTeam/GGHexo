title: "Swift 周报 #74"
date: 2017-07-16
tags: [Jesse Squires]
categories: [Swift 进阶]
permalink: swift_weekly_issue_74
keywords: Swift Weekly
custom_title:
description: Swift 周报
---
原文链接=https://swiftweekly.github.io/issue-74/
作者=Jesse Squires
原文日期=2017-06-15
译者=四娘
校对=Cwift
定稿=shanks

<!--此处开始正文-->

WWDC 已经过去一周了，你有大概了解你的代码要怎么迁移到 Swift 4 吗？我最先接触到的是一堆警告，提示有多余的协议遵守，查证得知[这是个 bug](https://bugs.swift.org/browse/SR-5153)。但说回来，比起去年我花了两个星期迁移到 Swift 3 来说，这次的升级已经好很多了。

而且，牢记 Swift 3.2 版本实际是在 Swift 3 兼容模式下运行 Swift 4 的编译器（`-swift-version 3`，通过这届 WWDC，我理解了很多东西）。当你在浏览  [bugs.swift.org](https://bugs.swift.org/)  时记住这一点也会很有帮助。
<!--more-->

> 想要赞助 Swift Weekly Brief 吗? [点击此处了解更多](https://swiftweekly.github.io/sponsorship/)  

## 社区任务

- SR-4866：Stack overflow: 空括号表达式语法分析错误
- SR-4830：编译器的 log 加上颜色区分

可以通过 [pull request](https://github.com/SwiftWeekly/swiftweekly.github.io/compare) 或者 [tweet](https://twitter.com/swiftlybrief) 提交任务。

## Swift 扩展

第 15 集： [Swift 更新内容， Part 2](https://spec.fm/podcasts/swift-unwrapped/70809)

JP Simard 和 Jesse Squires 继续讨论 Swift 的更新内容

## 资讯及社区

John Sundell 写了篇[关于 Swift 4 新的字符串 API 的文章](https://www.swiftbysundell.com/posts/exploring-the-new-string-api-in-swift-4)，这篇文章包括了很多实用的例子，展示了如何在 Swift 日常开发中使用新的字符串 API。

Slava Pestov 在 Twitter [提了一个谜题](https://twitter.com/slava_pestov/status/873751462630760449)：`print(type{ })`会输出什么？为什么？（[答案在这里](https://twitter.com/nicklockwood/status/873796388768841728)）

Slava 也[强调了](https://twitter.com/slava_pestov/status/873744097353256961) Swift 编译器团队，自从 2014 年的[这一个 commit](https://github.com/apple/swift/commit/d8ce0b80cbb7732cb32b245f9fadd47c11a4b163) 开始已经修复了**超过 5500 个 bug 了**。


## 提交和合并的请求

Slava Pestove [修复了一个 Swift 3.1 和 Swift 4 的 bug](https://github.com/apple/swift/pull/10195)， 当一个类的父类初始化方法是一个 Objective-C 里定义的类工厂方法时，Swift 可能会报错提示 `self.init` 会让 self 逃逸，所以不能通过编译。

Devin Coughlin [加入了对于 inout 的静态分析](https://github.com/apple/swift/pull/10191)，加强 Swift 4 的内存安全特性。

Nate Cook 给新的 Swift 4 的 stdlib [补充和修改了一大堆文档内容](https://github.com/apple/swift/pull/10229)。

Dave Abrahams 开了一个新的 PR 以便[改进 String 的性能](https://github.com/apple/swift/pull/10223)。

Roman Levenstein 减少了标准库的代码体积，大概 5-6% 左右，然后从主分支 [cherry-pick 了一个 patch](https://github.com/apple/swift/pull/10263) 到 Swift 4 分支。

## 提案


这周没有提案的更新！具体的可以到[这里]([Swift Evolution]https://apple.github.io/swift-evolution/)查看。

## 邮件列表

本周的讨论围绕 Swift-Evolution 邮件列表应该扮演什么角色的话题展开，因为邮件列表的责任是展示一些有帮助的讨论内容以及提案的审核结果，鉴于邮件主题是由 Swift 发布周期/阶段引导的，什么时候才应该把一个想法带入严肃的讨论中（也许这个想法跟当前开发阶段的主题毫无联系）很值得讨论。

Ted Kremenek 这么[写到](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20170612/037339.html)：

> 各位：这是一个很好的讨论，很感谢大家对于这件事情的思考。这其实是 Ben Cohen 和我私下聊完之后，我们打算带着核心团队一起讨论这件事。  
>   
> […]  
>   
> 根据 Xiaodi 的观察，evolution 的列表对于推进当前开发目标内的提案的作用是最大的。有很多不同的主题大家想讨论，而且很明显所有人都有点焦虑，想要都参与但人的精力是有限的，很难每一个主题都深入地参与进去。也许把这些移到一个讨论版（我们一直想做，但一直没有精力做的一个东西），提供一个非正式的讨论社区，就像 Xiaodi 提到的 Swift.org 论坛那样的东西，但要把开发目标内外主题明确分开，让大家可以去讨论他们感兴趣的主题。  
>   
> […]  

如果你对于 Swift Evolution 的发展感兴趣的话，那可以考虑深入阅读，看看这个过程是如何围绕着“开发目标内”呈现有建设性的讨论，以及该如何处理那些不在“当前开发目标内”的想法。

Chris Lattner 在回顾 [SE-0110](https://lists.swift.org/pipermail/swift-evolution//Week-of-Mon-20170612/037514.html) 的一个[长期讨论](https://lists.swift.org/pipermail/swift-evolution//Week-of-Mon-20170612/037514.html)里做了回应：

> 核心团队今天讨论了这件事情，大家一致认为需要为了重新获得语法的便捷性而做出改变。 讨论之后大家更倾向于（至少）保留闭包里使用括号展开元组的形式，但这件事情还需要更多的讨论。  
>   

> 说一个题外话，给元组里面的元素命名的形式以后某个时间点应该会被取消掉。不仔细看的话，你能分清下面声明了哪个变量吗？：  
>   
> `let (a : Int, b : Float) = foo()`  
>   
> ?  

我们在这里回顾一下[第 72 期的周报](https://swiftweekly.github.io/issue-72/)。在 Swift 4 里，n 个元素的元组已经不会在闭包里拓展为 n 个参数了（元组展平行为）。这意味着闭包将会接收一个元组类型的参数，而你需要手动去把它们展开。这很明显就不符合直觉，开发体验也很差。很高兴看到核心团队重新考虑这个决定！谁说 Swift-Evolution 不好的？😉

## 最后

有关 Swift 2 的[一些感想](https://twitter.com/jckarter/status/874397984712163331)🍺。