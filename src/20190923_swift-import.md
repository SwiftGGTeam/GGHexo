title: "Swift Import 声明"
date: 2019-09-23
tags: [Swift, NSHipster]
categories: [Swift, NSHipster]
permalink: swift-import
keywords: Swift, NSHipster, Import
custom_title: 
description: 作为软件开发人员，我们学到的第一课是如何将概念和功能组织成独立的单元。但是，当命名空间冲突和声明隐藏在阴影时，会发生什么呢？

---
原文链接=https://nshipster.com/import/
作者= Mattt
原文日期=2019-01-07
译者=雨谨
校对=numbbbbb,Yousanflics
定稿=Pancf

<!--此处开始正文-->

作为软件开发人员，我们学到的第一课是如何将概念和功能组织成独立的单元。在最小的层级上，这意味着思考类型、方法和属性。这些东西构成了模块（module）的基础，而模块又可以被打包成为 library 或者 framework。

在这种方式中，import 声明是将所有内容组合在一起的粘合剂。

<!--more-->

尽管 import 声明非常重要，但大部分 Swift 开发者都只熟悉它的最基本用法：

```swift
import <#module#>
```

本周的 NSHipster 中，我们将探索 Swift 这个最重要的功能的其他用法。

---

import 声明允许你的代码访问其他文件中声明的符号。但是，如果多个模块都声明了一个同名的函数或类型，那么编译器将无法判断你的代码到底想调用哪个。

为了演示这个问题，考虑 [铁人三项（Triathlon）](https://zh.wikipedia.org/wiki/三项全能) 和 [铁人五项（Pentathlon）](https://zh.wikipedia.org/wiki/现代五项) 这两个代表多运动比赛的模块:

<dfn>铁人三项</dfn> 包括三个项目：游泳、自行车和跑步。

```swift
// 铁人三项模块
func swim() {
    print("🏊‍ Swim 1.5 km")
}

func bike() {
    print("🚴 Cycle 40 km")
}

func run() {
    print("🏃‍ Run 10 km")
}
```

<dfn>铁人五项</dfn> 模块由五个项目组成：击剑、游泳、马术、射击和跑步。

```swift
// 铁人五项模块
func fence() {
    print("🤺 Bout with épées")
}

func swim() {
    print("🏊‍ Swim 200 m")
}

func ride() {
    print("🏇 Complete a show jumping course")
}

func shoot() {
    print("🎯 Shoot 5 targets")
}

func run() {
    print("🏃‍ Run 3 km cross-country")
}
```

如果我们单独 import 其中一个模块，我们可以通过它们的 <dfn>非限定（unqualified）</dfn>名称引用它们的每个函数，而不会出现问题。

```swift
import Triathlon

swim() // 正确，调用 Triathlon.swim
bike() // 正确，调用 Triathlon.bike
run() // 正确，调用 Triathlon.run
```

但是如果同时 import 两个模块，我们不能全部使用非限定函数名。铁人三项和五项都包括游泳和跑步，所以对 `swim()` 的引用是模糊的。

```swift
import Triathlon
import Pentathlon

bike() // 正确，调用 Triathlon.bike
fence() // 正确，调用 Pentathlon.fence
swim() // 错误，模糊不清
```

如何解决这个问题？一种策略是使用 <dfn>全限定名称（fully-qualified name）</dfn> 来处理任何不明确的引用。通过包含模块名称，程序是要在游泳池中游几圈，还是在开放水域中游一英里，就不存在混淆了。

```swift
import Triathlon
import Pentathlon

Triathlon.swim() // 正确，指向 Triathlon.swim 的全限定引用
Pentathlon.swim() // 正确，指向 Pentathlon.swim 的全限定引用
```

解决 API 名称冲突的另一种方法是更改 import 声明，使其更加严格地挑选需要包含每个模块哪些的内容。

## import 单个声明

import 声明提供了一种样式，可以指定引入定义在顶层（top-level）的单个结构体、类、枚举、协议和类型别名，以及函数、常量和变量。

```swift
import <#kind#> <#module.symbol#>
```

这里，`<#kind#>` 可以为如下的任何关键字：

| Kind        | Description |
| ----------- | ----------- |
| `struct`    | 结构体       |
| `class`     | 类          |
| `enum`      | 枚举        |
| `protocol`  | 协议        |
| `typealias` | 类型别名     |
| `func`      | 函数        |
| `let`       | 常量        |
| `var`       | 变量        |

例如，下面的 import 声明只添加了 `Pentathlon` 模块的 `swim()` 函数:

```swift
import func Pentathlon.swim

swim() // 正确，调用 Pentathlon.swim
fence() // 错误，无法解析的标识
```

### 解决符号名称冲突

当代码中多个符号被同一个名字被引用时，Swift 编译器参考以下信息，按优先级顺序解析该引用:

1. 本地的声明
2. 单个导入（import）的声明
3. 整体导入的模块

如果任何一个优先级有多个候选项，Swift 将无法解决歧义，进而引发编译错误。

例如，整体导入的 `Triathlon` 模块会提供 `swim()`、`bike()` 和 `run()` 方法，但从 `Pentathlon` 中单个导入的 `swim()` 函数声明会覆盖 `Triathlon` 模块中的对应函数。同样，本地声明的 `run()` 函数会覆盖 `Triathlon` 中的同名符号，也会覆盖任何单个导入的函数声明。

```swift
import Triathlon
import func Pentathlon.swim

// 本地的函数会遮住整体导入的 Triathlon 模块
func run() {
    print("🏃‍ Run 42.195 km")
}

swim() // 正确，调用 Pentathlon.swim
bike() // 正确，调用 Triathlon.bike
run() //  正确，调用本地的 run
```

那这个代码的运行结果是？一个古怪的多运动比赛，包括在一个泳池里游几圈的游泳，一个适度的自行车骑行，和一个马拉松跑。_(@ 我们, 钢铁侠)_

> 如果本地或者导入的声明，与模块的名字发生冲突，编译器首先查找声明，然后在模块中进行限定查找。

> ```swift
> import Triathlon
> 
> enum Triathlon {
>     case sprint, olympic, ironman
> }
> 
> Triathlon.olympic // 引用本地的枚举 case
> Triathlon.swim() // 引用模块的函数
> ```
> 
> Swift编译器不会通知开发者，也无法协调模块和本地声明之间的命名冲突，因此使用依赖项时，你应该了解这种可能性。

### 澄清和缩小范围

除了解决命名冲突之外，import 声明还可以作为澄清程序员意图的一种方法。

例如，如果只使用 AppKit 这样大型框架中的一个函数，那么你可以在 import 声明中单独指定这个函数。

```swift
import func AppKit.NSUserName

NSUserName() // "jappleseed"
```

顶层常量和变量的来源通常比其他的导入符号更难识别，在导入它们时，这个技术尤其有用。

例如，Darwin framework 提供的众多功能中，包含一个顶层的 `stderr` 变量。这里的一个显式 import 声明可以在代码评审时，提前避免该变量来源的任何疑问。

```swift
import func Darwin.fputs
import var Darwin.stderr

struct StderrOutputStream: TextOutputStream {
    mutating func write(_ string: String) {
        fputs(string, stderr)
    }
}

var standardError = StderrOutputStream()
print("Error!", to: &standardError)
```

## import 子模块

最后一种 import 声明样式，提供了另一种限制 API 暴露的方式。

```swift
import <#module.submodule#>
```

你很可能在 AppKit 和 Accelerate 等大型的系统 framework 中遇到子模块。虽然这种 <dfn>[伞架构（umbrella framework）](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPFrameworks/Concepts/FrameworkAnatomy.html#//apple_ref/doc/uid/20002253-97623-BAJJHAJC)</dfn> 不再是一种最佳实践，但它们在 20 世纪初苹果向 Cocoa 过渡的过程中发挥了重要作用。

例如，你可以仅 import [Core Services framework](developer.apple.com/documentation/coreservices) 的 [DictionaryServices](/dictionary-services/) 子模块，从而将你的代码与无数已废弃的 API（如 Carbon Core）隔离开来。

```swift
import Foundation
import CoreServices.DictionaryServices

func define(_ word: String) -> String? {
    let nsstring = word as NSString
    let cfrange = CFRange(location: 0, length: nsstring.length)

    guard let definition = DCSCopyTextDefinition(nil, nsstring, cfrange) else {
        return nil
    }

    return String(definition.takeUnretainedValue())
}

define("apple") // "apple | ˈapəl | noun 1 the round fruit of a tree..."
```

事实上，单独导入的声明和子模块，除了澄清程序员的意图，并不能带来任何真正的好处。这种方式并不会让你的代码编译地更快。由于大部分的子模块似乎都会重新导入它们的伞头文件（umbrella header），因此这种方式也没法减少自动补全列表上的噪音。

---

与许多晦涩难懂的高级主题一样，你之所以没有听说过这些 import 声明样式，很可能的是因为你不需要了解它们。如果你已经在没有它们的情况下开发了很多 APP，那么你完全有理由可以相信，你不需要开始使用它们。

相反，这里比较有价值的收获是理解 Swift 编译器如何解决命名冲突。为此，理解 import 声明是非常重要的。
