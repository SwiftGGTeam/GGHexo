title: "Swift：如何优雅地使用 print()（三）"
date: 2016-08-25
tags: [Swift]
categories: [medium.com]
permalink: swift-pretty-in-print-pt-3
keywords: swift print
custom_title: 
description: 本文是对于在 Swift 中使用 print() 语句的问题进行一些讨论，主要是 log 枚举和函数重载的建议。

---
原文链接=https://medium.com/swift-programming/swift-pretty-in-print-pt-3-22dbc52c412c#
作者=Andyy Hope
原文日期=2016-04-21
译者=Darren
校对=Cee
定稿=CMB

<!--此处开始正文-->

#### 如果说 log 是一种时尚，那你就是时尚设计师。

我本来没打算写这个系列的第三部分的，但是在前两部分的读者的回复中我得到了一些反馈信息，我觉得看一看人们是怎么建议的是一个很好的阅读和练习的方式。

如果你还没看过前面的部分，你可以回头看看[第一部分](http://swift.gg/2016/08/03/swift-prettify-your-print-statements-pt-1/)和[第二部分](http://swift.gg/2016/08/23/swift-pretty-in-print-pt-2/)。

<!--more-->

### log 枚举

有读者提到，也许使用「log」这个词并不是最好的选择。原因很简单，「log」 会和计算算法复杂度会用到的对数相混淆。我完全同意。

### 函数重载

这一点我没想到我会忽视了。不要与*函数重写（Override）*相混淆，*函数重载（Overload）*是一个允许我们创建同名但不同参数的函数的语言特性。

```swift
print("Hello World")
```

这是一个普通的 `print()` 函数，可以通过[可变参数](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Functions.html#//apple_ref/doc/uid/TP40014097-CH10-ID158)的形式使用多个 `Any` 类型的参数。现在我们用第二部分的一个例子来重载它：

```swift
func print(ln: String) {
    print("✏️" + " " + ln
}
func print(url: NSURL) {
    print("🌏" + " " + url.absoluteString
}
```

我们没有在一个 struct 或 class 中声明，因为我们希望这是一个全局函数，这样我们就可以在我们项目中的任何一个 .swift 文件中访问和使用了。

---

感谢 [Neradoc](https://medium.com/u/5019d2d3b0ad) 对避免使用「log」术语的建议，[Jérôme Alves](https://medium.com/u/953da4a7dd9e) 对使用函数重载的建议，以及 [Wayne Bishop](https://medium.com/u/a3ef8a71c02c) 在他的 [Swift 算法](http://swiftalgorithms.curated.co/) 一文中提到了我。
