title: "Swift 一周简讯 #4"
date: 2016-01-16 10:00:00
tags: [Swift 开源信息]
categories: [Open Source Swift]
permalink: open-source-swift-weekly-4

---
原文链接=http://www.jessesquires.com/open-source-swift-weekly-4/
作者=Jesse Squires
原文日期=2016.1.7
译者=pmst
校对=numbbbbb
定稿=numbbbbb

假期一晃而过，Swift.org 又重新开始更新东西啦。倘若你也是 Apple GitHub 开源项目的跟随者之一，你可能已经注意到了。早前不知为何我错过了一些重要的东西，直到本周我才发现 [`SwiftExperimental.swift`](https://github.com/apple/swift/blob/master/stdlib/internal/SwiftExperimental/SwiftExperimental.swift) 这货。目前，它为 `Set` 集合自定义了大量 unicode 操作（译者注：有 ∈ 、∉、⊂、⊄、⊆ 等等！）。这真是棒极了！我迫不及待想要在标准库中看到更多诸如此类的 API 接口。不管怎样，先来看看本周有哪些好玩的东西吧。

<!--more-->


### Commits 和 Pull requests

* [Austin Zheng](https://github.com/austinzheng) 提交了一个 [pull request](https://github.com/apple/swift/pull/838) 用于移除旧的 mirror API。
* [Andrew Naylor](https://github.com/argon) 合并了一些[改动](https://github.com/apple/swift-corelibs-foundation/pull/181)用于加速 corelibs-foundation 框架中的 JSON 解析。我们知道 Swift 社区里的家伙都热衷于 JSON 解析。
* [Keith Smiley](https://github.com/keith) 提交了一个 [pull request](https://github.com/apple/swift-corelibs-xctest/pull/25)，添加对 Swift 包管理器中的 corelibs-xctest 的支持。
* Chris Lattner 重新设计了[参数的 AST 表示方式](https://github.com/apple/swift/commit/7daaa22d936393f37176ba03975a0eec7277e1fb)。

### Proposals

Matthew Johns 给出了一个[提议](https://github.com/apple/swift-evolution/blob/master/proposals/0018-flexible-memberwise-initialization.md)旨在改进**成员构造器**(Memberwise Initializers ，这样翻译会不会有打我的冲动~)，目前正在[审核中](https://lists.swift.org/pipermail/swift-evolution-announce/2016-January/000010.html)中。正如 Lattner 所说，Swift 当前的 Memberwise Initializers 行为尚存在大量不足之处。所以我感觉这个提议很有可能被接受。

有关于“必须使用 self 来存取实例变量”的提议不出意外被咔嚓，[拒绝](https://lists.swift.org/pipermail/swift-evolution-announce/2016-January/000009.html)掉了。拒绝的主要原因有以下三点：

1. 表达有点啰嗦，意图不够清晰
2. 减少 `self.` 的使用能够预防可能的循环引用（retain-cycle）
3. 以及开发团队希望采用这种用法可以简单地通过链接器（linter）来执行它。


Doug Gregor 提交了一个函数命名的建议（译者：很奇怪，页面 404）。原文如下：“Swift 支持一等函数，因此任何函数（或者方法）都可以存储为函数类型的值。然而，Swift 程序中并不是所有函数都能命名 —— 你不能在命名同时提供参数列表。”  缺失这个特性绝对是 Swift 中的一个痛点，尤其是在使用 Cocoa 和 Objective-C selectors 时。以上就是提议的概述。


### Mailing lists

Doug Gregor 注意到扩展 `@objc` 协议时发生了一些[令人惊讶的行为](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20160104/005312.html) —— `extension` 中的成员在 Objective-C runtime 时居然无法对外使用。😳幸运地是，我在运行时并没有遇到这种情况。

最后要说的是，`?.`运算符在 Swift 中是 [“call-me-maybe” 运算符](https://twitter.com/uint_min/status/683532142677114880)？以上是本周开源周报内容