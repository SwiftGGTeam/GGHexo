title: "Swift 新进展（2016年1月份）"
date: 2016-03-11
tags: [Swift发展]
categories: [Erica Sadun]
permalink: whats-up-in-swift-evolution
keywords: swift新特性
custom_title: 
description: Swift有什么新进展了呢，本文就介绍下到2016年1月份为止Swift的一些新提议。

---
原文链接=http://ericasadun.com/2016/01/12/whats-up-in-swift-evolution/
作者=Erica Sadun
原文日期=2016-01-12
译者=天才175
校对=Cee
定稿=Channe

<!--此处开始正文-->

> 译者注：有些内容已经过期，有些提议的状态已经发生了改变。

### 撤回的

为了进一步的改进，[SE-0018](https://github.com/apple/swift-evolution/blob/master/proposals/0018-flexible-memberwise-initialization.md)，这个灵活的逐个成员初始化提案，没有被接受，也没有被拒绝，回到了进展清单。它提议将逐个成员初始化从结构体扩展到类，以避免过度的模板代码。虽然开始时具体的实现细节并不清楚，但很多开发者喜欢它的核心理念。苹果承诺很快就会反馈具体意见。（校者注：已被驳回）

### 积极审查的

[SE-0010](https://github.com/apple/swift-evolution/blob/master/proposals/0010-add-staticstring-unicodescalarview.md) 提议增加一种不可变的 `StaticString.UnicodeScalarView`（我喜欢这个）。（校者注：已被驳回）

<!--more-->

[SE-0013](https://github.com/apple/swift-evolution/blob/master/proposals/0013-remove-partial-application-super.md) 提议移除在调用时使用无 final 限制的 super 方法（校者注：即使用子类方法）。我对这个持怀疑态度，也没花多少时间去研究它。（校者注：已被驳回）

[SE-0020](https://github.com/apple/swift-evolution/blob/master/proposals/0020-if-swift-version.md) 旨在扩展构建配置以区分基于现在的 Swift 语言发布版本的代码（这个我也蛮喜欢的！）。（校者注：Swift 2.2 中已接受）

### 即将到来的

Doug Gregor 的 [SE-0021](https://github.com/apple/swift-evolution/blob/master/proposals/0021-generalized-naming.md)，提供了在模块中引用可能要重载的函数的更具体的方法。（校者注：Swift 2.2 中已接受）

还有他的 [SE-0022](https://github.com/apple/swift-evolution/blob/master/proposals/0022-objc-selectors.md)，创建了与目前字符串方法相比更合理的参数标签敏感选择器。（给这两个都点一个赞）（校者注：已接受）

### 已接受的

[SE-0011](https://github.com/apple/swift-evolution/blob/master/proposals/0011-replace-typealias-associated.md) 在 Swift 2.2 
被接受了，在协议上将 `typealias` 的实现与 `associatedtype` 的要求区分开来。

### 讨论的

每当我觉得自己在阅读列表上这些东西取得进展时，我的未读信息数又回到了 500 以上，压力真挺大的。我正关注着一些可能并不是大多数开发者感兴趣的话题。

目前也有一些与改进序列和集合，从其他语言那里增加更多的标准库特性，完善协议等相关的话题。

有两个我认为非常酷的讨论提议：一个是给 `nil` 增加一个「完全未初始化」的可选项，叫 `none`；另一个是为变量声明添加命名变量。它们被关注得很少。我建议你们去看看，这两个提议都来自 Amir Michail。

曾经有一个关于闭包返回可推断值的提议，不过好像已经挂了，还挺惨的。在现版本的 Swift 中，可推断返回值被限定为一行闭包。这似乎可以排除分支场景——因为它必须是一个明确的终点——不过这已经被讨论过了。

我模糊地记得看过一些关于消除尾闭包多参数调用的东西，但在写这篇文章的时候却找不到了。无论如何，我赞成这种做法，因为把处理成功失败的一个分支作为一个参数时，再把另一个参数作为尾闭包是没有意义的。

还有哪些东西吸引了**你**的眼球？给我留言或者发个推吧！
