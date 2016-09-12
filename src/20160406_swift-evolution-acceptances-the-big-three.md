title: "Swift 进化接受了三大提议"
date: 2016-04-06 09:00:00
tags: [Swift 进化]
categories: [Erica Sadun]
permalink: swift-evolution-acceptances-the-big-three
keywords: swift发展趋势,swift语言特点
custom_title: 
description: 
---

原文链接=http://ericasadun.com/2016/03/03/swift-evolution-acceptances-the-big-three/
作者=Erica Sadun  
原文日期=2016-03-03
译者=Crystal Sun
校对=shanks
定稿=Cee

<!--此处开始正文-->

今天，苹果接受了三大重要的内部驱动的提议（有些提议内容稍作了修改）：

* [SE-0005 将 Objective-C 的 API 更好地转换成 Swift](https://github.com/apple/swift-evolution/blob/master/proposals/0005-objective-c-name-translation.md)
* [SE-0006 将 API 指南添加到标准库里](https://github.com/apple/swift-evolution/blob/master/proposals/0006-apply-api-guidelines-to-the-standard-library.md)
* [SE-0023 API 设计指南](https://swift.org/documentation/api-design-guidelines/)

由 Swift 核心团队开发的，这三大提议彻底确定了 Swift 语言的特点，开发者如何使用 Swift 继续前进。

<!--more-->

API 设计指南（SE-0023）最引人注目，可以说是最棒的设计指南的典型范例，也是苹果公司的一贯风格。里面大部分内容都浅显易懂，很多建议非常有帮助，而有一部分内容我稍微有些个人的看法。作为开发者，你可以尽可能的提出欢迎或者批评。

自动转换的项目（SE-0005）已经放弃了去掉 API 名字前面的 NS 前缀的工作（暂时放弃了，修改后的提议会作为一个独单的提议提出来）。采用 API 指南将 Cocoa 的特色带进 Swift 的世界里。阅读[评论](https://github.com/apple/swift-3-api-guidelines-review)，可以获知这些 API 将会如何转换，也包括 Swift 2 到 Swift 3 的项目工程。

 > 提议的重要部分就是要去掉 Foundation API 里的 “NS” 前缀，这次改名被认为是有问题的，考虑到了好几个原因，最经常提及的原因就是 Swift 中很多 Foundation 的参考语义属性同 Swift 标准库中的值语义互相矛盾冲突。 去 “NS” 前缀提议苹果官方目前没有接受，修改后的提议将会作为一个单独的提议重新再次提出来，同时会考虑收到的反馈。
 
最后，标准库更新（SE-0006）确立了 Swift 看起来如何，标准库中的方法如何与最新的 API 指南协调一致。

 > 提议中的这些改变会造成 Swift 代码大规模的崩坏，需要一个迁移工具将 Swift 2 的代码顺利迁移成 Swift 3 代码。提议中不同的 API 将是迁移的首要信息来源。另外，在语言允许的情况下，库里仍然保留了旧的名字，同时用 `rename` 关键字作为弃用符号标注出来，帮助编译器能够生成正确的错误信息，弹出如何修改的信息。 

在接受提议时，苹果提到了两个重要的改变：

 > 提议中大部分修改都是与 Swift API 设计指南（SE-0023）有关的，特别是：
 
 > - 标准库中使用第一个参数的标签
 > - 小写枚举的名称，包括 .some(x) 和 .none

第一个参数的标签从 Swift 1 进化到 Swift 2 时更像是 Objective-C 语言风格，到了 Swift 3 则又更像是 Swift 语言风格了。目前已经处于纯 C 和纯 Objective-C 之间了，希望相对于两次这次能找到平衡。

例如：

```
-  func advancedBy(n: Distance, limit: Self) -> Self
+  func advanced(by n: Distance, limit: Self) -> Self

-  func distanceTo(end: Self) -> Distance
+  func distance(to end: Self) -> Distance
```

枚举将和其他静态成员一样，命名规则是小写字母开头，使用驼峰命名法。

更多扩充修改的列表可以[更新的提议](https://github.com/apple/swift-evolution/blob/master/proposals/0006-apply-api-guidelines-to-the-standard-library.md)中找到。