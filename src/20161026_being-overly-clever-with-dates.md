title: "睿智的日期扩展"
date: 2016-10-26
tags: [Swift]
categories: [Erica Sadun]
permalink: being-overly-clever-with-dates
keywords: 
custom_title: 
description: 

---
原文链接=http://ericasadun.com/2016/08/10/being-overly-clever-with-dates/
作者=Erica Sadun
原文日期=2016-08-10
译者=冬瓜
校对=CMB
定稿=CMB

<!--此处开始正文-->

为了找到两个日期之间的时间间隔，需要调用 `dateComponents(_:, from: , to:)` 方法，并传入你要使用的单位。这个方法将会返回一个 `DateComponents` 实例，通过 `.day` 这个成员(property)，你可以得知传入的两个日期之间相差的天数。

如果想写一个返回多计量单位的方法来描述两个日前间的间隔时间，无论天数、分钟数、秒数还是年份，应该怎么做呢？

<!--more-->

或者你可以直接编写一个非常复杂的 `switch` 语句，或者来创建一个 `DateComponents` 的 extension 来允许你使用 `Calendar.Component` 这种写法（其原理是复用一个 `switch` 语句，作为功能的内部实现）这就是我今天需要做的事情。

这是用来计算时间差值的函数，它可以使用下标写法来访问对应的成员信息：

```swift
static public func distance(_ date1: Date, 
    to date2: Date, 
    component: Calendar.Component) -> Int {
    return Date.sharedCalendar
        .dateComponents([component], from: date1, to: date2)[component] ?? 0
}

public func distance(to date: Date, 
    component: Calendar.Component) -> Int {
    return Date.sharedCalendar
        .dateComponents([component], from: self, to: date)[component] ?? 0
}
```

这种下标的写法实现以及 `NSDate` （现在修改成 `Date`） 的 Category 可以从我的 [github repo](https://github.com/erica/NSDate-Extensions) 中获取到。这是一个很受欢迎的 repo （非个人），并且已经有 10 年之久。我在其基础上做了很多的清理工作，并同时更新了 Swift 版本。

我通过日期创建一个泛型，并对比泛型的版本，从而解决 “时间重合” 问题（例如，同一天或者同一周）。对于日期来说，午夜 12 时为一天的开始。对于一周来说，午夜 12 时作为一周的开始。（**update**: [Sebastian Celis](http://sebastiancelis.com/) 指出 `compare(_ date1: Date, to date2: Date, toGranularity component: Component)` 这个函数是 [swift-corelibs-foundation](https://github.com/apple/swift-corelibs-foundation/blob/master/Foundation/Calendar.swift) 中的代码片段。）

并且我也添加了很多字符串格式化的选项，以友好 Swift 的开发者。（ playgound 不支持 GYB 引擎，造成了很多代码冗余。）

现在所有的日期偏移更加清晰，并且时间类下标扩展已经支持（这个功能本应支持）。

一如既往，如果你有任何的需求以及改动提议，可以在下方评论我。我关注的方向主要是对于 Swift 的迁移问题，而不在日期类本身。提前感谢所有人的反馈。