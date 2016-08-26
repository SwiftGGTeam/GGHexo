title: "为 Swift 的协议实现 Equatable"
date: 2016-08-26 17:00:00
tags: [Natasha The Robot]
categories: [Swift 进阶]
permalink: implementing-equatable-for-protocols-swift
keywords: swift equatable，equatable协议
custom_title: 
description: 在 Swift 中 Equatable 协议主要应用于泛型编程，那么要怎么为 Swift 的协议实现 Equatable呢，本文就来实战下。

---
原文链接=https://www.natashatherobot.com/implementing-equatable-for-protocols-swift/
作者=Natasha The Robot
原文日期=2016-07-25
译者=Lanford3_3
校对=千叶知风
定稿=CMB

<!--此处开始正文-->

## 为 Swift 的协议实现 Equatable

上周我出席了 [iOSDevCampDC](http://iosdevcampdc.com/)，并有幸参加了 [@ayanonagon](https://twitter.com/ayanonagon) 关于测试的演讲，你们可以到[这儿](https://github.com/ayanonagon/talks/tree/master/2016-cmdu)获取样例代码。

<!--more-->

让我惊讶的是，出于测试的目的，她为一个协议（protocol）实现了默认的 Equatable，类似这样：

```swift
protocol Rectangle: Equatable {
    var width: Double { get }
    var height: Double { get }
}

// 所有遵循这个协议的对象
// 现在都有了基于协议属性的默认相等性判断
func ==<T: Rectangle>(lhs: T, rhs: T) -> Bool {
    return lhs.width == rhs.width &&
        rhs.height == lhs.height
}
```

之所以说让我感到惊讶，是因为我从未想过让遵循某个协议的所有对象都拥有一个像这样的默认实现。这确确实实地让我陷入了思考！当然，对于 Ayaka 的例子来说这样做很合理——她完全是出于测试的目的添加了这样的代码。

但是在我琢磨了这种做法，进行更深入的思考后，我看到了可能发生的 bug。如果遵循这个协议的值同时有着其他的属性会怎样呢？现在它的默认相等性判定将不会如预期那样工作。举个例子：

```swift
struct ColorfulRectangle: Rectangle {
    let width: Double
    let height: Double
    let color: UIColor
}

let blueRectangle = ColorfulRectangle(width: 10, height: 10, color: .blueColor())
let redRectangle = ColorfulRectangle(width: 10, height: 10, color: .redColor())

// 这两个矩形除了颜色不同外，其他都是一样的
blueRectangle == redRectangle // true
```

当然，如果 ColorfulRectangle 有着自己的 Equatable 实现，这个 bug 就被修复了：

```swift
func ==(lhs: ColorfulRectangle, rhs: ColorfulRectangle) -> Bool {
    return lhs.width == rhs.width &&
        rhs.height == lhs.height &&
        rhs.color == lhs.color
}

// 正如所料，输出为 false
blueRectangle == redRectangle // false
```

但是问题在于，这很容易遗漏，特别是就算这个 Equatable 没实现的话，编译器也不会发出警告。

所以，虽然在协议层面添加默认的 Equatable 实现相当的有用，但也有些危险。以负责任的态度去使用吧！

*[和我一起参加](http://www.tryswiftnyc.com)九月 1 日 - 2 日在纽约城举办的 Swift 社区庆典🎉吧！使用优惠码 NATASHATHEROBOT 来获得 $100 的折扣！*
