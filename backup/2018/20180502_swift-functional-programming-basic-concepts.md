title: "函数式编程：基本概念"
date: 2018-05-02
tags: [Swift 进阶]
categories: [medium.com]
permalink: swift-functional-programming-basic-concepts 
keywords: 
custom_title: 
description: 

---
原文链接=https://medium.com/swift-programming/swift-functional-programming-basic-concepts-a6b0c3937d56
作者=Andyy Hope
原文日期=2016-05-18
译者=muhlenXi
校对=Yousanflics,Lision
定稿=CMB

<!--此处开始正文-->

通常情况下，人们在学习了函数式编程（Function Programming 即 FP）之后就根本停不下来对它的修改，甚至到了一种如果 FP 不是特别酷的话就会烦躁的地步。回忆一下 1999 年经典非主流电影 Fight Club 最著名的情景，完全颠覆了人们的头脑。

> **函数式编程俱乐部的条例：**
> 1.永远不要停止函数式编程。
> 2.永远不要停止函数式编程！

<!--more-->

一些人对函数式编程很热心，就像对 Crossfit 一样热情，但是与 Crossfit不一样的是，函数式编程没有 73.5% 的机会去损害并且影响到你的工作，事实上它提高了你编写的代码的安全性，可读性和价值。

Swift 绝不是类似 Haskell 这种纯粹的函数式编程语言，而是一种把其他语言的部分精华紧密结合起来的多范式编程语言。

在第一部分，我们将会了解函数式编程的比较简单的概念和阐述如何用 Swift 编写函数式代码。

## 基本概念

### 不变性

``` swift
	let foo = 1
```

这是很容易理解的，不变性的意思就是一个值只要被设定，以后就不能再被改变。在 Swift 中，我们通过 `let` 关键字来创建一个不可变的值。

不变性的原因是因为它允许开发者编写线程安全的代码。在我们使用的过程中，我们可以完全确定应用中的其他线程是不能改变它的值的。

### 值的类型

``` swift
	struct CGRect {}
```

当我们用值代替引用来传递变量的值时，我们创建的代码是安全的。`struct` 类型在 Swift 标准库中使用得最多，比如：`Array`, `Dictionary`, `Int`, `Bool` 等等都是 `struct` 。

这些数据结构比引用安全的原因是因为当我们通过传递值来设置对象时，实际传递的是值的拷贝。我们可以通过下面的代码来理解这个概念：

``` swift
var box = CGRect.zero
var square = box.size

box.size.height = 10

// square: width: 0,height: 0
// box.size: width: 0,height: 10
```

如果将 `CGRect` 和 `CGSize` 的值类型改为引用类型，当我们改变 `box` 的 `height` 时候，`square` 的 `height` 也将会发生改变。

``` swift
box.size.height = 10

// square: width: 0,height: 10
// box.size: width: 0,height: 10

```

### 纯函数

``` swift
func sum(_ a: Int, _ b: Int) -> Int {
	return a + b
}
```

这个函数的返回值取仅决于输入值，没有任何可见副作用。它只做了一件事就是对输入的值进行计算并返回，没有其他的。

即使我们在 `sum()` 函数中放入一个 `log` 语句，这也会把该函数变成非纯函数，这在编写代码时非常具有传染性。

所以基本上编写纯函数的思想消除了副作用代码产生的全部机会，这些副作用代码可能会增加我们的 `bug` ，当然，也包括上文提到的 `log` 。

### 一等函数

``` swift
func sayHello() {
	print("Hi!")
}

let greeting = sayHello

greeting()

// prints: Hi!
```

在 Swift 的创作过程中，Swift 作者们决定将所有他们能想到的每件东西都视为一等公民，当函数是一等公民时，这个意思就是我们可以把一个函数赋值给一个变量，就跟我们使用 `Int` 或者 `String` 一样。

这就允许我们编写的函数可以被别的函数当做参数传递或者作为结果来返回，所以我们可以在代码中进行函数的传递。

### 高阶函数

因为把函数视为一等公民，那也就意味着我们能够创建高阶函数，一个函数被认定为高阶函数，它必须至少满足以下提到的两个特征的一种：

* 使用函数作为参数
* 返回值是函数

举个例子来说明一下，我们创建一个接受函数作为参数的高阶函数：

```swift
func inside() -> Void {
	print("Yo!")
}

// inside's structure
// () -> Void
```
我们创建一个叫 `inside` 的无参返回值为空的函数，即返回值的类型为 `Void` ，在函数的下面，我描述了函数的结构，这对我们理解高阶函数将会很重要。当我们将一个函数作为参数来传递时，编译器将会分析和验证该函数的兼容性。现在，让我们来看一个函数接受另一个函数作为参数的例子：

```swift
func outside(inner:() -> Void) {
	inner()
}
```

如你所见，`outside` 函数接受一个参数，并且这个参数是一个函数，如果你查看 `inner` 这个参数的类型，你将会发现，这和上面的 `inside` 函数的返回类型是一致的。因为这两个函数的参数类型是一样的，所以我们能够将 `inside` 赋值给 `inner` 且编译器不会发出警告或报错。

最后，我们在 `outside` 函数的内部调用参数 `inner` ，它会转而去调用 `inside` 函数内部的 `print()` 函数:

```swift
outside(inside)
// prints: Yo!
```

## 高级概念

### 响应链、合成和柯里化

我们仅仅接触到了 Swift 函数式编程的表面，在我后续的发表文章中，将会包含许多新的内容，包括一些更高级的概念，比如上面小标题提到的第三个部分(即高级概念)，它们有些复杂，在稍后的文章中将会有详细介绍，希望现在你能对 Swift 是如何进行函数式编程的基础部分能有深入理解，然后用来使你的代码更加健壮、安全和多功能。

我想要正式的欢迎你加入函数式编程的俱乐部。在等待后续文章期间希望你能熟记练习规则 `1` 和 `2` 。

本文中的[示例代码](https://github.com/andyyhope/Blog_FunctionalProgramming_BasicConcepts)在 GitHub 上可以下载。
