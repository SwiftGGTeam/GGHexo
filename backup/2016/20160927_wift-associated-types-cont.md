title: "Swift 关联类型(续)"
date: 2016-09-27
tags: [Swift 进阶]
categories: [Russ Bishop]
permalink: wift-associated-types-cont
keywords: swift关联类型,
custom_title: 
description: 对于 Swift 关联类型我们有太多的话题讨论，而本文主要是说下 existential 这个带有协议类型的值。

---
原文链接=http://www.russbishop.net/swift-associated-types-cont
作者=Russ Bishop
原文日期=2016-04-28
译者=靛青K
校对=shanks
定稿=CMB

<!--此处开始正文-->

*好了，让我们再次跳进兔子洞*

我并不觉得[之前的文章](http://swift.gg/2016/08/01/swift-associated-types/)覆盖了全部关于带关联类型协议的方面的内容：为什么使用它们如此不爽？

<!--more-->

# 为什么是关联类型

这个兔子洞只是在保持移动；[看我的关联类型系列的第三篇，这里有更好的解释了为什么 Swift 使用关联类型](http://www.russbishop.net/swift-why-associated-types)。

我删了之前的解释，因为它写了过多的编译优化方面的东西。而不是解释为什么在 Swift 中要使用关联类型，以及这个主题即使没有误导也很难理解。

# 关联类型的问题

主要原因是人们都懒得去问这个问题，事实上编译器不能处理一个 existential ，导致一个不爽的错误提示：“协议 X 只能被用于约束，因为它需要 Self 或者关联类型的确定（*Protocol 'X' can only be used as a generic constraint because it has Self or associated type requirements*）”。

> 译者注：*Protocol 'X' can only be used as a generic constraint because it has Self or associated type requirements* 是 Xcode 给出的错误提示，比如这段代码就会报如上错误。

```swift
protocol X {
    associatedtype Foo
}
let x: X
```

## 漫谈 Existential

你的下一个问题可能是“到底 existential 是什么”。问的好。

一个值定义为 `var x: protocol<SomeProtocol, OtherProtocol>` 是 existential ，因为我们无法在编译时确定 `x` 具体正确的类型。我们（以及编译器）都知道它会实现对应的协议。实际上 Swift 会在类型大小比较小的情况下，直接使用内联的实例来表示它，否则就把它在堆上打包起来，存储为一个指针。更重要的是，通过这个指针，可以找到所有具体的需要遵循的协议，满足`SomeProtocol`和 `OtherProtocol` 协议。间接法是个关键，因为服从该协议的类型是可以改变的（毕竟可以有多个类型服从这个协议）。你的局部变量 `var x: SomeProtocol` 可以被重新指定类型，以至于编译器甚至不需要在一个局部函数中缓存同样服从你这个协议的指针。

> 如果你曾经考虑 `typealias Any = protocol<>` 做了什么，那是因为 Swift 基本类型就是个 existential ，而这个基本类型不服从任何协议。

**所以什么是一个 existential ？他是一个带有协议类型的值。**这意味着我们只能知道它是一个服从这个协议的类型。

## 泛型专有化

带有泛型类型参数的泛型类型是不同的。泛型函数可以被专有化，因为编译器知道 `T` 会是哪些类型的实例。这时就不需要存储和传递协议遵循指针，也不用去处理跟进的任何间接的东西。编译器可以直接提交确定的偏移量和直接跳到特定的函数。

> 比较罕见的，使用类型，编译器可能会选择使用运行时泛型版本，而不是一个特定的限制大小的生成二进制可执行文件；这个等同于 C++ 的模板问题，在结合每个单独的类型参数时，模板都会*实例化*一个新的编译名称类型，并且所有的这些类型都会增加二进制文件的大小。

换句话说就是一个 `ContiguousArray<Int> ` 有一个静态已知布局。在编译器的概念中，可以指出 `myArray[15]` 真的就是 `*(myArrayBasePtr + (15 * sizeof(Int)))` 。不同的点是，更快指出 `IndexType = Int` ，对于定位到与 `Int` 一致的 `RandomAccessIndexType.advancedBy()` 方法，建立栈结构，调用方法实现，然后返回结果。

[当我们不知道静态类型是是什么时，发生了什么？](http://blog.benjamin-encz.de/post/compile-time-vs-runtime-type-checking-swift/)

```swift
func fancyFunction<T: protocol<SomeProtocol, OtherProtocol>>(thing: T) { }
	if let value = value as? protocol<SomeProtocol, OtherProtocol> {
	    fancyFunction(value)
	}
	// Compile Error: cannot invoke 'fancyFunction'
	// with an argument list of type '(protocol< SomeProtocol, OtherProtocol >)
```

如果你已经运行到这个位置，说明你遇到了泛型专有化和 existentials 的问题。编译器无法确定 `value` 的具体类型，所以它不能传入一个专有化的泛型调用这个方法。

即使我们满足了这个约束，这里也不能保证我们调用了正确的带泛型函数的版本。

> 译者注：在使用泛型时要求我们必须指定出具体的类型，如果需要编译过上面的代码，可以考虑将 `fancyFunction` 的泛型约束去掉，即：`func fancyFunction(thing: protocol<SomeProtocol, OtherProtocol>) { }` 。

记得编译器会考虑所有可能的泛型专有化，它会知道这些类型，以便它可以插入全部类型的快照到对象内部，获取任何想要的信息。

如果我们调用了错误的专有化的东西，我们的程序运行结果就不会和预期一样。

（我保证这些都是相关的！）

# 泛型的 Existentials

做一个简单的总结：

- 当前在协议上的限制是关联值，如果这个 existential 值包含关联类型，编译器就不能动态解包该 exitential 值。
- 即使我们可以提供一个满足所有约束的 existential ，我们也不能动态的得到泛型专用化类型。

[完全版的泛型声明](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20160229/011666.html) 提议是解决这个问题的第二部分：

首先 Doug 称之为 “泛型的 existentials”

```swift
protocol SqlColumn {
	associatedtype ValueType
	func read() -> ValueType
}
let x: SqlColumn = ...column.read() // returns Any
```

如果实现了这个协议，这个特性将会立即进抛出一个“协议 X 只能被当做一个约束”（"Protocol X can only be used as a constraint”）的错误信息；这个关联类型会被认为是 `Any` ，并且你需要动态的装换类型。

但这样一来就没有一个很炫的静态类型编译性能以及它还带来了潜在的运行时崩溃，但有时动态特性又是一个最好的工具，如果在工具箱中拥有它是很好的。

Doug 进一步指出，这里应当允许定义约束来允许类型自动转换，这样可以减少许多类型转换的代码：

```swift
let x: Any<SqlColumn where .ValueType == String> = ...column.read() // returns String
```

# Opening Existentials

一个技巧是当你使`Self`满足像`Equatable`这样的协议。只是因为两个类型实现了`Equatable`并不意味着可以检查他们是否相等。使用 `is`/`as` 检查两个值的 `dynamicType` ，判断是否服从 `Equatable` ，但即便是这样，我们仍然不能调用重载的 `==` ，这是泛型专有化的问题。

为了解决上述问题， Doug 建议提供给 existential 动态变换成一个确定的类型的能力，比如给出一个本地名称 `T` .之后你可以检查是否另一个值也是类型 `T` ，更重要的是你可以通过 `T` 调用这个泛型专有化的方法：

```swift
if let storedInE1 = e1 openas T {
	 // T is a the type of storedInE1, a copy of the value stored in e1
  if let storedInE2 = e2 as? T {
	  // is e2 also a T?
  if storedInE1 == storedInE2 { … } // okay: storedInT1 and storedInE2 are both of type T, which we know is Equatable
  }
}
```

在这个例子中，调用 `==` 依赖于 `e1` 和 `e2` 运行时的动态类型。这个之所以可以正常工作，是因为协议有 `Self` 的约束*并且*同时可以解决我们泛型约束的问题。

> 注意：所有的语法只是假象语法，并没有确定未来的 Swift 版本会有上面这些特性。

# 结论

我个人认为解决 existential 问题是一个高优先级的事情，因为它涉及一个很不爽的点。任何人使用协议和泛型的时候，都很容易遇到这个问题。但 Swift 3 的新特性清单中的内容已经非常多了，开发的时间又很短暂，所提我不确定这是否会出现在 Swift 3 的开发计划中。

如果 opening existentials 已经实现了使用关联类型，并没有强迫你静态派发和泛型约束；这将可以根据你是追求性能还是其他需求决定。

这时你就可以使用[类型擦除](http://www.russbishop.net/type-erasure)的方式处理带关联类型的协议的问题。

那么还有什么更通用的 existential 场景呢？[Benji 的新文章讲到了这个话题](http://blog.benjamin-encz.de/post/bridging-existentials-generics-swift-2/)

# 推荐阅读

对于更多关联类型的内容，[@alexisgallagher](https://www.twitter.com/alexisgallagher) [已经讨论了很多相关的话题](https://www.youtube.com/watch?v=XWoNjiSPqI8)（事实上，我们已经私下讨论很多次了）。

这里也有一篇[非常有趣的令人惊奇的痴迷的程序语言论文](http://www.osl.iu.edu/publications/prints/2005/garcia05:_extended_comparing05.pdf)，比较了泛型编程在多种语言中的场景，Alexis 指出 **Swift 符合所有的要求，部分的结果就成了关联类型**。