title: "可选型以及字符串插值"
date: 2017-02-07
tags: [Swift 入门]
categories: [Ole Begemann]
permalink: optionals-string-interpolation
keywords: 可选型,字符串插值
custom_title: 
description: 本文介绍如何更好的使用可选型以及字符串插值

---
原文链接=https://oleb.net/blog/2016/12/optionals-string-interpolation/
作者=Ole Begemann
原文日期=2016-12-07
译者=Cwift
校对=walkingway
定稿=CMB

<!--此处开始正文-->

你遇到过这个问题吗？想要在 UI 中显示一个可选值或将其打印到控制台以便调试，但是你不喜欢可选值转成字符串的默认格式：`Optional(…)` 或 `nil`。比如：

```swift
var someValue: Int? = 5
print("The value is \(someValue)")
// → "The value is Optional(5)"
someValue = nil
print("The value is \(someValue)")
// → "The value is nil"
```

<!--more-->

## 在字符串插值中使用可选值可能会导致意想不到的结果

当你 [在字符串插值中使用可选值](https://github.com/apple/swift/pull/5110) 的时候，实际上 Swift 3.1 会发出一个警告，因为这种行为会产生意外的结果。这是 Julio Carrettoni、Harlan Haskins 和 Robert Widmann 提出有关 Swift 演化的论点：

> 鉴于可选值永远不适合显示给最终的用户，并且通常打印到控制台中的可选值会出现令人惊讶的内容，我们建议使用明确的方式来请求一个可选的调试描述。即：当你在字符串插值段中使用可选值时编译器会发出警告。

该警告已经在最新的 Swift 开发快照（2016-12-01）中实现：

![](https://oleb.net/media/xcode-warning-string-interpolation-optional-as-any.png)

你有几种方式来消除这个警告：

1. 添加一个显式地转型，把 `someValue` 转换成 `Int?` 类型。
2. 使用 `String(describing: someValue)`。
3. 提供一个默认值，使得表达式不包含可选型，例如 `someValue ?? defaultValue`。

多数情况下我真的不喜欢任何一种，但这已经是编译器可以提供的最好的方案了。第三种方案的问题是使用 [空值合并操作符](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/BasicOperators.html#//apple_ref/doc/uid/TP40014097-CH6-ID72) `??` 需要类型匹配——如果左边的操作数是 `T?`，那么右边的操作数必须是 `T` 类型的。应用到上面的例子中，这意味着我可以提供另一个 `Int` 作为默认值，但不是一个字符串——而这种情形中字符串才是我真正想要的。

## 自定义一个可选型的字符串合并运算符

为了解决这个问题，我自定义了一个可选型的字符串合并操作符。我觉得给它取名为 `???` ，因为很明显它与空值合并操作符有关联。（最初我认为重载 `??` 操作符是一个好主意，即定义一个 `(T?, String) -> String` 类型的 `??` 版本。我喜欢这种写法，因为我的实现很好地捕捉到了空值合并操作符的意义，但这意味着放弃一些其他上下文中的类型安全性，因为现在形如 `someOptional ?? "someString` 的表达式总是可以通过编译的。）`???` 操作符的左侧可以接受任意可选型，而右侧接受一个默认的字符串，返回值也是字符串。如果可选值不为空，操作符将解包并返回其字符串描述，否则返回默认值。这里是具体实现：

```swift
infix operator ???: NilCoalescingPrecedence

public func ???<T>(optional: T?, defaultValue: @autoclosure () -> String) -> String {
    switch optional {
    case let value?: return String(describing: value)
    case nil: return defaultValue()
    }
}
```

[`@autoclosure` 结构](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/Closures.html#//apple_ref/doc/uid/TP40014097-CH11-ID543) 确保仅当需要的时候（即当可选型为 `nil` 时）才计算右操作数。这个关键字允许你传递开销大的或具有副作用的表达式，只在极少数情况下才需要承担性能成本。我认为在此用例中这种机制不是很重要，`???` 的定义镜像了 [标准库中 `??` 操作符的定义](http://swiftdoc.org/v3.0/operator/qmqm/#func-qmqm-t_-t-defaultvalue_-autoclosure-throws-t)。（虽然我决定舍弃当前标准库版本中的 throw /[rethrows](http://robnapier.net/re-throws) 格式。）

或者，使用 [`Optional.map`]() 你可以通过一行代码实现该操作符，就像这样：

```swift
public func ???<T>(optional: T?, defaultValue: @autoclosure () -> String) -> String {
    return optional.map { String(describing: $0) } ?? defaultValue()
}
```

两种实现完全相等。你喜欢哪一种版本取决于个人口味以及你的代码风格。我不认为哪一个会显得更清晰。

还有最后一件事我认为需要提醒一下，你必须在 [`String(describing:)`](https://developer.apple.com/reference/swift/string/2427941-init)（即你更喜欢基于值的描述）以及 [`String(reflecting:)`](https://developer.apple.com/reference/swift/string/1541282-init)（更喜欢基于调试的描述）二者之间做出选择，以便完成值的转换。前者更适合用于格式化需要在 UI 显示的值，而后者可能更适合用于打印日志。通常基于调试的描述的输出格式长度更长，或许你可以为它定义另一个运算符（例如，????）。

## 应用

让我们使用 `???` 操作符重写本文开头的示例：

```swift
var someValue: Int? = 5
print("The value is \(someValue ??? "unknown")")
// → "The value is 5"
someValue = nil
print("The value is \(someValue ??? "unknown")")
// → "The value is unknown"
```

这只是个小玩意，但我真的很喜欢它。