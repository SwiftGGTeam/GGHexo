title: "Swift 的变化：从 2.2 到 3.0 会带来什么"
date: 2015-12-18
tags: [Erica Sadun]
categories: [Swift 入门]
permalink: changing-swift-whats-coming-up-in-2-2-and-3-0

---
原文链接=http://ericasadun.com/2015/12/03/changing-swift-whats-coming-up-in-2-2-and-3-0/
作者=Erica Sadun
原文日期=2015-12-03
译者=Channe
校对=Cee
定稿=千叶知风

<!--此处开始正文-->

如果你还没看过 [Swift 发展路线图](https://github.com/apple/swift-evolution)，我建议你要好好看一看。目前为止，有四个针对 `Swift 3` 和一个针对 `Swift 2.2` 的提议已经被接受，也许其中的某些能让你会心一笑。

显然，这些提议中最令人振奋的是 API 翻译的改进，旨在[废除冗长的 `Objective-C` 式的风格](https://github.com/apple/swift-evolution/blob/master/proposals/0005-objective-c-name-translation.md)，形成调用简洁且易读的 `Swift` 风格。

<!--more-->

看上去显而易见我们将要和[函数柯里化声明](https://github.com/apple/swift-evolution/blob/master/proposals/0002-remove-currying.md)说再见了，虽然这是没有语法糖语言共有的特性。这是我能忍受的东西，但是这点改变并不会让我开心起来 — 除此之外似乎有迫切的原因去降低语言的复杂度。

`++` 和 `--`（**这是两个减号，不是破折号**）运算符也在[移除的部分](https://github.com/apple/swift-evolution/blob/master/proposals/0004-remove-pre-post-inc-decrement.md)中。它们最初是为了和 C 语言一致而引入的，但它们的结果值通常不会被检查。对大部分开发者来说，很容易可以用 `+=` 和 `-=` 替代它们。

最后，[var 形式的函数参数](https://github.com/apple/swift-evolution/blob/master/proposals/0003-remove-var-parameters-patterns.md)将会被移除，因为它们现在的实现是从复制和修改步骤中抽象出来，而这造成了困惑。我觉得这不是一个大损失，只是需要你声明一个函数内 var 变量赋值来替代它。

十分有趣是，除了 `++` 和 `--` 的改变，几乎所有的变更点我都在[新书](http://ericasadun.com/2015/11/19/swift-developers-cookbook-status-update-mark-december-17-on-your-calendars/)中提到了。

已经被接受的 `Swift 2.2` 提案允许你[用关键字作为参数标签](https://github.com/apple/swift-evolution/blob/master/proposals/0001-keywords-as-argument-labels.md)，这使得现在可以这样声明：

```swift
func touchesMatching(phase: NSTouchPhase, in view: NSView?) -> Set<NSTouch>
```

`Swift 3.0` 承诺会保持 `ABI（Application Binary Interface）`的稳定性：「成功保持 ABI 稳定性意味着，即便源代码语言发生了变化，用以后版本的 Swift 开发的应用程序和编译库能在二进制层次上和 Swift 3.0 版本的应用程序和编译库相互调用。」

开发团队利用这个机会做个类型系统清理，包括所有语言的小改良，同时「完整完成」基类系统。代码迁移者将把项目从 2.x 版迁到 3.x 版。基础代码或多或少能保证与这次大更新没关系。

最终的 API 设计指导原则发布在[这个网址](https://swift.org/documentation/api-design-guidelines.html)。