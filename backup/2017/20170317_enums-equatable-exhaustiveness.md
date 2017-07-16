title: "为什么不要在枚举和 Equatable 中使用 default case？"
date: 2017-03-17
tags: [Swift 进阶]
categories: [Ole Begemann]
permalink: enums-equatable-exhaustiveness
keywords: 
custom_title: 
description: 

---
原文链接=https://oleb.net/blog/2017/03/enums-equatable-exhaustiveness/
作者=Ole Begemann
原文日期=2017-03-06
译者=Cwift
校对=numbbbbb
定稿=CMB

<!--此处开始正文-->

假设你有一个 Swift 的枚举：

```swift
enum Expression {
    case number(Double)
    case string(String)
}
```

你希望它遵守 [Equatable](https://developer.apple.com/reference/swift/equatable) 协议。由于该枚举具有关联值，必须手动添加，所以需要实现 [== 函数](https://developer.apple.com/reference/swift/equatable/1539854)：

```swift
extension Expression: Equatable {
    static func ==(lhs: Expression, rhs: Expression)
        -> Bool {
        switch (lhs, rhs) {
        case let (.number(l), .number(r)): return l == r
        case let (.string(l), .string(r)): return l == r
        default: return false
        }
    }
}
```

这里处理了参数类型相同的两种情况，比较类型不同时会执行 default case 并返回 false。这种做法简单直接，也没错：

```swift
Expression.number(1) == .number(1) // → true
Expression.number(1) == .string("a") // → false
```

<!--more-->

## Default case 会使得枚举对穷尽的检查无效

然而这段代码有一个严重的缺陷：如果你在枚举中添加另一个 case，编译器不会警告你当前枚举的实现是不完整的。现在给枚举添加第三种 case：

```swift
enum Expression {
    case number(Double)
    case string(String)
    case bool(Bool)
}
```

只要能通过编译器的检查，那么这种行为就是合理的。但执行以下操作时代码会返回错误的结果：

```swift
Expression.bool(true) == .bool(true) // → false!
```

switch 语句中的 default case 会使编译器对枚举的检查无效。所以，通常来说尽可能避免在 switch 语句中使用 default。

<center><font  size=4>**如果可能，尽量不要在 switch 语句中使用 default**</font></center>

## 模式匹配大爆炸

没有 default case 的缺点也很明显：你需要写更多的模式匹配代码。下面是完全覆盖三种 case 的写法：

```swift
extension Expression: Equatable {
    static func ==(lhs: Expression, rhs: Expression)
        -> Bool {
        switch (lhs, rhs) {
        case let (.number(l), .number(r)): return l == r
        case let (.string(l), .string(r)): return l == r
        case let (.bool(l), .bool(r)): return l == r
        case (.number, .string),
             (.number, .bool),
             (.string, .number),
             (.string, .bool),
             (.bool, .number),
             (.bool, .string): return false
        }
    }
}
```

o(>﹏<)o！写起来一点都不愉快，而且当枚举的 case 增加时会变得更糟。switch 语句必须区分的状态数会随着枚举中 case 的数量呈平方增长。

## 从平方增长到线性增长

_ 占位符可以简化你的 switch 语句。虽然不能使用 default 语句，但是我们可以把上一段代码最后的六行简化成三行：

```swift
extension Expression: Equatable {
    static func ==(lhs: Expression, rhs: Expression)
        -> Bool {
        switch (lhs, rhs) {
        case let (.number(l), .number(r)): return l == r
        case let (.string(l), .string(r)): return l == r
        case let (.bool(l), .bool(r)): return l == r
        case (.number, _),
             (.string, _),
             (.bool, _): return false
        }
    }
}
```

这个方案更好，枚举中每增加一个 case，switch 语句只会增加两行，不再是平方级的增加。而且你保留了编译器穷尽检查的优势：添加一个新 case，编译器会报 == 的错误。

## Sourcery

如果你觉得重复代码还是太多，可以看看 [Krzysztof Zabłocki](http://merowing.info) 开发的代码生成工具 [Sourcery](https://github.com/krzysztofzablocki/Sourcery)。在类似的应用场景中，它可以自动为枚举以及其他类型生成 Equatable 协议所需的代码（并且不断更新生成代码）。