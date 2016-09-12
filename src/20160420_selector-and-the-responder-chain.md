title: "#selector() 和响应链"
date: 2016-04-20
tags: [Swift 进阶]
categories:[swiftandpainless]
permalink: selector-and-the-responder-chain
keywords: swift selector,swift响应链
custom_title: 
description: Swift 2.2 selector 用法你清楚么，本文就来说下 Swift #selector() 和响应链吧。

---
原文链接=http://swiftandpainless.com/selector-and-the-responder-chain/
作者=Dominik Hauser
原文日期=2016-04-10
译者=Lanford3_3
校对=Channe
定稿=Cee

<!--此处开始正文-->

因为 Swift 2.2 中 selector 的新语法，我用在「[在 Target-Action 中使用响应链](http://swift.gg/2016/01/06/utilize-the-responder-chain-for-target-action/)」中的方法产生了一个警告，让我们来修正它。

<!--more-->

### 总管协议

首先我们加入一个协议：

```swift
@objc protocol DetailShowable {
    @objc func showDetail()
}
```

之后，我们可以给 `Selector` 添加一个 extension，就像 [Andyy Hope](https://twitter.com/AndyyHope) 在他的[这篇🐂文](https://medium.com/swift-programming/swift-selector-syntax-sugar-81c8a8b10df3#.6gteb7p1s)中提到的那样，这个 extension 就长这样：

```swift
private extension Selector {
    static let showDetail = #selector(DetailShowable.showDetail)
}
```

现在把 action 添加到响应链中就变得 so easy 了，就像这样：

```swift
button.addTarget(nil, 
                 action: .showDetail,
                 forControlEvents: .TouchUpInside)
```

最后，我们需要让响应链中的一些响应者对象遵循 `DetailShowable` 协议。

你可以在 [github](https://github.com/dasdom/SelectorSyntaxSugar) 上找到这些代码。