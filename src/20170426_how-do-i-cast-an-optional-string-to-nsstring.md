title: "如何将一个可选字符串转换为 NSString"
date: 2017-03-27
tags: [Swift 入门]
categories: [Erica Sadun]
permalink: how-do-i-cast-an-optional-string-to-nsstring
keywords: 
custom_title: 
description: 

---
原文链接=http://ericasadun.com/2016/10/08/how-do-i-cast-an-optional-string-to-nsstring/
作者=Erica Sadun
原文日期=2016-10-08
译者=粉红星云
校对=Crystal Sun
定稿=CMB

<!--此处开始正文-->

McFly 问到：我在这个地方一直报错：＂不能将 `·String?` 变量强制转换为 `NSString`＂，而且我在 `stackoverflow` 上也没有找到解决方法。

先回答这个问题，在转换成其他类型之前必须将可选类型解包。`String?` 指的是一个存储在可选类型枚举（Optional enumeration）中的值，可以是有值的也可以为空。这就是报错的原因了。

<!--more-->

你不想强制解包，所以使用可选绑定那个字符串，然后将其转化为 `NSString`。不过在执行之前，往回看看你是怎么拥有一个可选字符串的。你可能使用了一个可选类型的初始化器（optional initializer），或者调用了一个返回值为可选字符串类型的函数：

```swift
let test = "abcdef"
let optionalString = String(test)
```

更普遍的情况是可能读取字典里某个 key 对应的值，这个变量的类型实际上是 `Any?` 而不是 `String?` 了。

```swift
let optionalValue = dict["key"]
```

有一件事挺让我百思不得解的是，我们很少会遇到类型转换成 `NSString` 的可选类型的字符串。一开始我以为 McFly 是从 `JSON` 字典中或是其他像 [AnyHashable: Any] 这样的集合中读取的值，不过这样一来，报错信息应该是：“error: cannot convert value of type 'Any?' to expected argument type ‘NSString'（错误：不能将  `Any?` 类型的变量转换为 `NSString`）”。所以还是能够使用 `String?` 和 `NSString` 类型的变量。

我问了 McFly 这个 `String?` 类型的变量是怎么得到的？原来啊，他用的是这个 API：

```swift
//我之前的类有如下的声明
private var _imageURL: String?
```

无论怎样（忽略掉这里字符串类型的变量命名含有 “URL” 的罪孽），你有两个目标：
1. 安全的解包变量，获取 `String` 类型的变量
2. 类型转换 `String` 为 `NSString`，然后你可以把他传递到函数中

不要这样做：

```swift
functionCall(string! as NSString)
```

比起不愿意鼓掌的小朋友，强制解包能更快地杀死的奇妙仙子（Tinkerbell）。相反的，应先选择拆包，然后类型转换：

```swift
if let string = optionalString {
    myFunction(string as NSString)
}
```

（是的，通常使用和可选类型字符串变量一样的名字，来避免意外地与别的变量名重复的冲突。我这里想区分这新的绑定解包的变量和已经存在的可选类型字符串变量，就没有用一样的名字）

想一步得到一个可选绑定的 `NSString ` 类型的局部变量，可以将可选类型的字符串转换成 Optional<NSString> 类型，然后将其可选绑定:

```swift
if let string = (optionalString as Optional<NSString>) {
    myFunction(string)
}
```

对新手开发者来说这个解决方法挺简单的，因为可以解释成这样：“你想要一个 Optional<NSString> 的变量，然后手上的变量是 Optional<String>，用 `as` 进行转换，编译阶段还能进行检查，保证能够转换成功。”
有经验的开发者更倾向于用 optional 的 map：

```swift
if let string = optionalString.map({ $0 as NSString }) {
    myFunction(string)
}
```

对初学者来说这不是一个特别浅显的解决方法。假设你已经知道可选类型的基本概念，通过可选类型枚举器来储存值或者空值，但当你没有函数式语言经验的时候，第一直觉并不会是清晰地采用 optional 的 map，更不用提集合（collections）。

此方法的优势是容易拓展成消除类型（type-erased）转换，。用 `flatMap` 代替 `map` ，则无需绑定可选类型了

```swift
if let string = string.flatMap({ $0 as? NSString }) {
    myFunction(string)
}
```

不管怎样，我和 McFly 说过我会将其整理成文章。结果，发现在 Swift 中类型转换从字典中取出的 `Any?` 值，有一些特别有趣的方式，我删减了这部分，占了原来文章近一大半的内容，过几天发布。

我相信文章里面可能有哪里地方是我搞错了的，欢迎给我提供反馈和更正，非常感谢！