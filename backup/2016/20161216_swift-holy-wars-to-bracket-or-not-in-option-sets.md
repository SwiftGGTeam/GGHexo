title: "Swift 圣战：使用选项集时的中括号去留"
date: 2016-12-16
tags: [iOS 开发]
categories: [Erica Sadun]
permalink: swift-holy-wars-to-bracket-or-not-in-option-sets
keywords: 选项集
custom_title: 选项集
description: 在使用选项集的时候，加括号和不加括号的作用是一样的，但是 Erica 认为我们不应该将括号省略，来看一看她的想法吧！

---
原文链接=http://ericasadun.com/2016/12/06/swift-holy-wars-to-bracket-or-not-in-option-sets/
作者=Erica Sadun
原文日期=2016-12-06
译者=星夜暮晨
校对=Crystal Sun
定稿=CMB

<!--此处开始正文-->

通常情况下，我更倾向于将 `OptionSets` 视为一种类型，可惜它们并不是。

```swift
public protocol OptionSet : SetAlgebra, RawRepresentable
```

目前的 `OptionSets` 是通过协议的方式来实现的，从而使得未来相关 API 的持续演进成为可能。正如 Joe Groff 所指出：开发者可以将单个选项分解为多个精简的选项，与此同时仍然保留提供原始选项的能力。您可以在下面的例子当中看到相应的实现，其组合出了 `energyStar` 和 `gentleStar` 选项，而它们与那些使用移位标志 (bit-shifted flags) 生成的选项的地位是平等的。

<!--more-->

```swift
public struct LaundryOptions: OptionSet {
    public static let lowWater = LaundryOptions(rawValue: 1 << 0)
    public static let lowHeat = LaundryOptions(rawValue: 1 << 1)
    public static let gentleCycle = LaundryOptions(rawValue: 1 << 2)
    public static let tumbleDry = LaundryOptions(rawValue: 1 << 3)
    
    public static let energyStar: LaundryOptions = [.lowWater, .lowHeat]
    public static let gentleStar: LaundryOptions = [.energyStar, .gentleCycle]
    
    public init(rawValue: Int) {
        self.rawValue = rawValue
    }
    public var rawValue: Int
}
```

尽管这种设计方式*看起来*像是在使用集合，然而实际上并不是。这里的中括号语法有点迷惑人：

```swift
let options1: LaundryOptions = [.lowWater, .lowHeat]
let options2: LaundryOptions = .energyStar
let options3: LaundryOptions = [.energyStar, .lowHeat]

// prints 3 for each one
[options1, options2, options3].forEach {
    print($0.rawValue)
}
```

当您使用中括号将选项集 (option set) 括起来之后，您将得到的是一个新的选项集。这意味着在 Swift 当中，`[.foo]` 是等同于 `.foo` 的。

今天，我与 Soroush Khanlou 在关于选项集的问题上进行了一场激烈的讨论，特别是如果我们进行类似 `accessQueue.sync(flags: [.barrier])` 之类的调用时，保留和省略括号哪一个方法更优雅？

Soroush 认为，省略括号会产生较少的干扰。既然你可以不加括号就能完成编译，那么为什么还要加呢？

我的回答是"一定要加括号"。当你的参数需要传递标志位或者静态成员的时候，一定要让参数的类型来引导代码风格。当代码当中需要传递一个选项集的时候，那么就应该让该参数*看起来*像一个选项集。

括号可以清晰地表示这个参数的类型，并且可以产生一个提示，也就是一个特定的视觉指示：您可以通过引入更多的选项来扩展这个选项集。如果没有方括号的话，那么对于那些不熟悉选项集的人们来说，这可能就不够直观。

那么*您的想法*是什么呢？要括号？还是不要括号？您对哪个更情有独钟 (cuisine reigns supreme) 呢？