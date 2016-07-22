title: "Swift: 把 Struct 作为数据模型的注意事项"
date: 2016-07-22
tags: [Swift]
categories: [Andyy Hope]
permalink: swift-caveats-for-structs-as-data-models
keywords: swift struct
custom_title: 
description: 在 Swift 中使用 Struct 代替 Class 作为数据模型会遇到哪些问题呢，本文就是来探讨数据模型转换为 Struct 值得注意的地方。

---
原文链接=https://medium.com/swift-programming/swift-caveats-for-structs-as-data-models-8299d84b49dc
作者=Andyy Hope
原文日期=2016-03-18
译者=BigbigChai
校对=shanks
定稿=CMB

<!--此处开始正文-->

*并不是室外桃园，但也很不错！*

很高兴见到 Objective-C 的老司机对于 Swift 的新鲜语法结构和新思维方式感到如此兴奋。作为开发者，我们应该永远努力拓展我们的技能，并在新的范式出现的时候乐于改变我们的心态。

一个类似的例子就是处理数据结构的时候，拥抱不可变性，尽量使用常量，这是一个很好的建议而且完全应该被采用。另一个例子是把我们的数据模型转换为 Struct（结构体）。这是听起来很美好，但在实际运用中，彻底地使用 Struct 来代替 Class（类），还是给开发者带来很多困难。

不要误会我的意思，用 Struct 作为数据模型确实带来了非常大的好处。 只是这并不是完美的办法。在这篇文章中，我会详细说明一下当你把数据模型从 Class 转换成 Struct 时会遇到的麻烦。

<!--more-->

## Objective-C

当你的项目的代码是 Swift 和 Objective-C 混合开发时，你会发现在 Objective-C 的代码里无法调用 Swift 的 Struct。因为要在 Objective-C 里调用 Swift 代码的话，对象需要继承于 NSObject。

*Struct 不是 Objective-C 的好朋友。*

## 继承

继承是面向对象编程的四大支柱之一，这深深地植入了我们的思维方式。当我们可以使用继承时，为什么还要重复地写某一段代码？我很喜欢把我的数据模型设为可继承的，这让我不用给共享一个抽象的类重复 JSON 解析代码，这能让我的模型保持统一。

*Struct 不能相互继承。*

## NSUserDefaults

我敢打包票大家都会在某些时候对把数据存在 NSUserDefaults 里面感到有罪恶感。这种想法很正常，因为不是每个人都喜欢跟 CoreData 打交道，特别是仅仅要存很少的对象的时候。 技术上这是可行的，但是要用 Struct 实现的话，这还有几个小坑要踩。因此你可能最好还是用 Class 来实现。

*Struct 不能被序列化成 NSData 对象。*

## struct 的优点

我不希望你们认为我不喜欢使用 Struct 是因为结构体伤了我的感情。使用 Struct 来代替 Class 作为数据模型有很多好处。值类型（value type）是非常有优势的：

* 安全性
	
	因为 Struct 是用值类型传递的，它们没有引用计数。

* 内存

	由于他们没有引用数，他们不会因为循环引用导致内存泄漏。

* 速度

	值类型通常来说是以栈的形式分配的，而不是用堆。因此他们比 Class 要快很多，真的*很多*！在 [StackOverflow](http://stackoverflow.com/a/24243626/596821) 给 struct 和 class 进行相同操作的表现做了基准测试，Struct 比 Class 要快九百倍。（注：在 2016-05-07 的测试中，Struct 的速度为 Class 的三千七百万倍，详见 [StackOverflow](http://stackoverflow.com/a/24243626/596821)）

* 拷贝

	你有在 Objective-C 里试图过拷贝一个对象吗？你必须选用正确的拷贝类型（深拷贝、浅拷贝），这是非常烦人的，因为每次尝试你都不记得自己上次是怎么写的。 值类型的拷贝则非常轻松！

* 线程安全

	值类型是自动线程安全的。无论你从哪个线程去访问你的 Struct ，都非常简单。

## 结论

大概就是那么多，我已经点出了 Struct 的不足，同时也列出了一些 Struct 的优点去帮助你判断是否使用 Struct 类型作为数据模型。

然而，你们完全可以搭配使用两者。在我自己的项目里，如果模型较小，并且无需继承、无需储存到 NSUserDefault 或者无需 Objective-C 使用时，我会使用 Struct。