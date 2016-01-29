title: "函数之趣"
date: 2015-9-11
tags: [Crunchy Development]
categories: [Swift 进阶]
permalink: fun_with_functions

---
原文链接=http://alisoftware.github.io/swift/function/operator/2015/08/28/fun-with-functions/
作者=Olivier Halligon
原文日期=2015/08/28
译者=小锅
校对=numbbbbb
定稿=shanks


今天我们要研究 Swift 函数中一些好玩的特性，比如返回函数的函数，柯里化以及运算符函数。

## 函数的基础

在这篇文章中，我们将使用一个返回 `Bool` 类型的函数来判断它的参数是否匹配某个条件，这个函数接收一个 `Int` 类型的参数。像这类功能可以使用`filter`方法对整型数组进行过滤。
<!--more-->

让我们从最简单的开始，下面是一个用来判断它的参数是否为正数的函数：

```swift
func isPositive(value: Int) -> Bool {
  return value > 0
}

[-4,-2,0,4,7,-8,3].filter(isPositive)
// returns: [4,7,3]
```

## 更通用的函数

如果某个数字能被 N 整除，我们希望该函数能返回`true`，如何实现呢？当然，我们可以写出类似 `isEven`， `isMultipleOf3` 和 `isMultipleOf4` 这样的函数，但是这样的函数是无穷无尽的。

另一种显而易见的解决方案是把整数 N 作为一个参数传入。以这种思路，我们可以写出如下的函数：

```swift
func isMultiple(multiple: Int, value: Int) -> Bool {
  return value % multiple == 0
}

[-4,-2,0,4,7,-8,3].filter(isMultiple)
//错误：filter 方法期望传入 Int->Bool ，但是我们给的是 (Int,Int)->Bool
[-4,-2,0,4,7,-8,3].filter(isMultiple(3))
//错误：不能只传入一个参数来调用 `isMultiple`，需要传入两个参数
```

但是如果这样编写代码的话，`filter`方法无法使用。

## 返回函数的函数

我们现在需要的是一种方法，通过这种方法，只要我们给定一个除数，就可以生成一个 `Int -> Bool` 类型的函数(这种类型的函数正是 `filter` 函数所需要的)。那就让我们开始动手构建：一个接收 `(multiplier: Int)` 的函数，同时它会返回... 另一个 `Int -> Bool` 类型的函数。

要构建这样的函数有很多种方法，第一种是在 `isMultiple` *里面* 声明一个 `Int -> Bool` 的函数，然后再将内部声明的函数返回：

```swift
func isMultiple(multiplier: Int) -> (Int -> Bool) {
  func multFunctionToReturn(value: Int) -> Bool {
    return value % multiplier == 0
  }
  return multFunctionToReturn
}
```

在这里，内部函数“捕获”了外部函数提供的 `multiplier` 参数，并生成一个特定的函数，然后将该函数返回。

不过一种更常见(也更紧凑)的方法是使用闭包。在 Swift 当中，函数和闭包是可以互换的，因此，我们可以直接在函数中返回一个 `Int -> Bool` 类型的闭包：

```swift
func isMultiple(multiplier: Int) -> (Int -> Bool) {
  return { (value: Int) -> Bool in
    value % multiplier == 0
  }
}
```

## 柯里化

其实，我们还有第三种方法：*柯里化*。[柯里化](https://en.wikipedia.org/wiki/Currying)可以将一个接收多个参数的函数转化一个只接收一个参数的函数，同时返回另一个函数（返回的函数将接收原函数的下一个参数，再返回一个函数... 直到所有的参数都被消耗掉，并返回一个最终的值）。这种技术可以让我们实现某个函数的部分功能，这在某些情况下是十分强大和有用的。

在 Swift 中，我们可以轻松地将一个接收多个参数的方法转化成柯里化的方法，只要将分隔参数的逗号替换成一个闭括号，紧接着再添加一个开括号。现在，让我们复用第一个 `isMultiple` 函数的实现，并将它转化成柯里化的函数：

```swift
func isMultiple(multiplier: Int)(value: Int) -> Bool {
  return value % multiplier == 0
}
```

这种语法会让人觉得有点困扰，所以就个人来讲，我还是偏向显式地使用返回函数的函数(就像在上一小节中的形式)，因此，柯里化的函数可以等价地转化为如下的形式(我觉得这种形式更易懂)：

```swift
func isMultiple(multiplier: Int) -> (value: Int) -> Bool {
  return { value in value % multiplier == 0 }
}
```

不过使用哪种方式的最终决定权还是在你自己手上。

## 组合函数

我们下一步要做的事，是将这些筛选函数进行组合，生成一个新的筛选函数。比如说，我们有一个 `isPositive` 函数和一个 `isMultiple`函数，如何筛选出即是正数同时也是偶数的数字呢？

当然我们可以进行两次筛选，就像这样：

```swift
[-4,-2,0,4,7,-8,3].filter(isPositive).filter(isMultiple(2))
```

但是这种方法效率并不高，因为它对数组进行了两次遍历。更进一步地，如果想筛选出数组中的正数*或者*偶数，我们就没有其它更好的语法来表达，只能这样做：

```swift
[-4,-2,0,4,7,-8,3].filter { value in isPositive(value) || isMultiple(2)(value) }
```

如果我们可以组合两个 `Int -> Bool` 函数并生成一个新的函数，不是更酸爽么？如果像下面这样来写代码，我们应该会觉得更自然：

```swift
[-4,-2,0,4,7,-8,3].filter(isPositive || isMultiple(2))
```

妥妥地，我们来让它实现吧！

`&&` 和 `||` 运算符已经存在了，我们只需要对他们进行重载，好让它们能够接收 `Int -> Bool` 类型作为参数：

```swift
func || (lhs: Int->Bool, rhs: Int->Bool) -> (Int->Bool) {
  return { (value: Int) -> Bool in
    return lhs(value) || rhs(value)
  }
}
```

我们也可以对 `&&` 运算符进行同样的操作。这次我们将使用 `$0` 隐式参数，这样可以使代码更紧凑：

```swift
func && (lhs: Int->Bool, rhs: Int->Bool) -> (Int->Bool) {
  return { lhs($0) && rhs($0) }
}
```

重写 `!` 运行符好让我们可以对一个函数进行取反，如何？

```swift
prefix func ! (f: Int->Bool) -> (Int->Bool) {
  return { value in !f(value) }
}
```

现在，我们可以这样来写代码：

```swift
[-4,-2,0,4,7,-8,3].filter( !isPositive || isMultiple(3) )
// return [-4,-2,0,-8,3] (non-positive numbers + multiples of 3)
```

有没有很优雅？

我们甚至可以使用它们来声明负数和奇数/偶数筛选器：

```swift
let isZero = { value in value == 0 }
let isPositiveOrZero = isPositive || isZero
let isNegative = !isPositive && !isZero
let isNegativeOrZero = !isPositive
let isEven = isMultiple(2)
let isOdd = !isEven
```

感谢重载的运算符，以上的代码运行正确无误！

## 总结

通过这些简单的例子，我们学习到了返回函数的函数的好用之处，同时还学习了如何对运算符进行重载以用来对返回 `Bool` 类型的函数进行组合，最后还介绍了柯里化的概念。

函数还有很多有乐趣值得我们去挖掘。我们可以使 `&&`, `||` 和 `!` 的重载更加泛型化，以使它们可以接受 `T -> Bool` 类型的函数，这里的 `T` 可以是任何类型。我甚至还可以全面地讲解柯里化的知识，解开它的封印，深入探索下函数式编程(不过目前已经有很多其它的博客对这些进行了讲解，因此我觉得不需要再增加我的一篇了)，不过我觉得今天这些知识已经足够你充实一整天了！

继续快乐地 Swift 吧！