title: "快捷之道：轻松地使用 DispatchTime"
date: 2016-12-05
tags: [iOS 开发]
categories: [Russ Bishop]
permalink: quick-easy-dispatchtime
keywords: dispatchtime,dispatchtime.now
custom_title: Swift 中 DispatchTime
description: 如果想要以秒为单位的整数或者分数形式，那么使用 DispatchTime 可没有想象中那么方便哦，不过通过 Swift 的扩展可以来帮助实现成功。

---
原文链接=http://www.russbishop.net/quick-easy-dispatchtime
作者=Russ Bishop
原文日期=2016-11-10
译者=Cwift
校对=walkingway
定稿=CMB

<!--此处开始正文-->

这是篇拆开即食的福利小短文。我发现 `DispatchTime` 使用起来没有想象中便利。在一款 GUI 的应用中，我总是想要指定一个 `TimeInterval`，也就是以秒为单位的整数或者分数形式。

<!--more-->

值得庆幸的的是 Swift 的扩展可以帮助实现我们的愿望：

```swift
extension DispatchTime: ExpressibleByIntegerLiteral {
    public init(integerLiteral value: Int) {
        self = DispatchTime.now() + .seconds(value)
    }
}

extension DispatchTime: ExpressibleByFloatLiteral {
    public init(floatLiteral value: Double) {
        self = DispatchTime.now() + .milliseconds(Int(value * 1000))
    }
}
```

现在我可以按照上帝的旨意来使用异步派发了：

```swift
DispatchQueue.main.asyncAfter(deadline: 5) { /* ... */ }
``` 