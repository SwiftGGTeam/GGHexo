title: "整型字面量的那些事"
date: 2016-08-18 10:00:00
tags: [Swift]
categories: [Erica Sadun]
permalink: that-integer-literal-thing
keywords: 整型字面量
custom_title: 
description: 在 Swift 中允许一个整型字面量被解释成该类型的实例，协议的遵守者可以像整型字面量那样来展示自己，本文就来解析下 Swift 整型字面量吧。

---
原文链接=http://ericasadun.com/2016/06/28/that-integer-literal-thing/
作者=Erica Sadun
原文日期=2016/06/28
译者=Cwift
校对=pmst
定稿=Cee

<!--此处开始正文-->

昨晚我发了一条[推特][1]邀请开发者们参与一个问题的调查。相当一部分人问我这个调查是怎么回事。

Swift 标准库中一些类型转换相关的协议，Matthew Johson 和我观点相同，认为命名[非常糟糕][2]。标准库中大约存在 80 个古怪的协议，其中大约 15% 都与类型转换相关。

因此我们递交了一份有关重命名的提案，不过最终被否决了。标准库团队倾向于使用新的 `Syntax` 命名空间，而我们的提案侧重于命名方面的指导。他们的答复是具体问题具体分析，在不违背哲学的前提下，Swift 的革新提案需要着眼真实世界进行设计，而不是单纯的理论指导。我和标准库团队没能达成共识，不过讨论还在持续，因为 WWDC 过后这些问题还是没能得到解决。最近 Matthew Johson 已经在起草一份新的提案了。

<!--more-->

当某个类型遵循 `IntegerLiteralConvertible` 协议后，意味着「允许一个整型字面量被解释成该类型的实例」。想要这样的行为发生，协议遵守者必须实现指定的构造器，该构造器接受一个 `Int` 类型的参数。

```swift
// 协议的遵守者可以使用整型字面量进行初始化
public protocol IntegerLiteralConvertible {

    associatedtype IntegerLiteralType

    // 创建一个实例，并用 `value` 进行初始化
    public init(integerLiteral value: Self.IntegerLiteralType)
}
```

我认为使用下面的表达方式来阐述这个协议会更清晰：

```swift
// 遵守该协议后，协议的遵守者可以使用整型字面量表示
//
//
// let instance: T = *integer literal*
//
// 
// 比如:
// 
//
// let myDouble: Double = 2 // 整型字面量 2 自动转型成了 Double
// let anotherDouble: Double = myDouble * 5 // 整型字面量 5 自动转型成了 Double
//
//
public protocol NAME_TO_BE_DETERMINED {

    //  约束整型字面量，字面量默认会被识别成Int类型
    associatedtype IntegerLiteralType

    //  创建一个实例，并用 `value` 进行初始化
    //  构造器内部的语法必须可以被替换
    public init(integerLiteral value: Self.IntegerLiteralType)
}
```

协议命名是一个棘手的问题。参与讨论的成员建议使用 `Syntax.IntegerLiteral` 和 `Syntax.IntegerLiteralExpressible`，我认为二者都有不足的地方。而且上述的命名方式也并不能够[表达使用协议的初衷][3]。

昨晚我向 Swift 开发者们发推询问了有关 `Syntax.IntegerLiteralExpressible` 的含义，这里是[回复结果][4]。大约九成的人认为它的含义是「协议的遵守者可以像整型字面量那样来展示自己」。在这个链接页面的顶部有一个标签，你可以在「问题摘要」和「个人回答」间进行切换，然后就可以看到参与调查者对选项的解释。

*更新：戴夫·亚伯拉罕的回复：*

> 你所提供的选项中，唯一看起来正确的答案不够优雅并且有一些错误——我曾说的是「协议遵守者的实例可以用整型字面量来表示」，你的答案大概匹配了原意的 90%，剩下的 10% 还差很多。
> 我只能告诉你，你的调查结果支持了我的意见。

虽然有关类型转换的协议的适用对象只是标准库中的类型，但是这些协议（和它们的同胞协议们一样）可以被职业的 Swift 开发者看到、阅读并使用。就这一点来说，我认为追求好的命名规则是有价值的。希望 Swift 能用更好的命名取代形如 `Syntax.AllowsIntegerLiteralToBeInterpretedAsExpressionOfConformingType` 这样的协议命名。

[1]:	https://twitter.com/ericasadun/status/747645402296496128
[2]:	https://github.com/apple/swift-evolution/blob/master/proposals/0041-conversion-protocol-conventions.md
[3]:	http://thread.gmane.org/gmane.comp.lang.swift.evolution/21290/focus=21869
[4]:	https://www.surveymonkey.com/results/SM-FGMC93JT