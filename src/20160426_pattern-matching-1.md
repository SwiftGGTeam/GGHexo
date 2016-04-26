title: "模式匹配第一弹: switch, enums & where 子句"
date: 2016-04-26
tags: [Swift 进阶]
categories: [Crunchy Development]
permalink: pattern-matching-1
keywords: swift模式匹配,swift switch
custom_title: 
description: 在 Swift 中最简单常见的模式匹配就是 switch 了，那么本文就来说下 switch 的使用吧。

---
原文链接=http://alisoftware.github.io/swift/2016/03/27/pattern-matching-1/
作者= Olivier Halligon
原文日期=2016-03-27
译者= walkingway
校对=小锅
定稿=shanks

<!--此处开始正文-->

从简单的 switch 到复杂的表达式、Swift 中的模式匹配可以变得相当强大。今天开始我们来探索一下 switch 炫酷的使用技巧，稍后一系列文章会更进一步，为大家带来更高级的模式匹配技法。

本文作为模式匹配的第一篇介绍文章，旨在抛砖引玉。

<!--more-->

## Switch 基本用法

Swift 中最简单、最为常见的模式匹配就是 `switch` 语句，大家对下面的形式都比较熟悉了：

```swift
enum Direction {
  case North, South, East, West
}

// 可以很容易地切换枚举值
extension Direction: CustomStringConvertible {
  var description: String {
    switch self {
    case North: return "⬆️"
    case South: return "⬇️"
    case East: return "➡️"
    case West: return "⬅️"
    }
  }
}
```

但是 switch 可以更进一步，允许使用包含变量的匹配模式，并在匹配时绑定这些变量。这适用于带关联值的枚举对象：

```swift
enum Media {
  case Book(title: String, author: String, year: Int)
  case Movie(title: String, director: String, year: Int)
  case WebSite(url: NSURL, title: String)
}

extension Media {
  var mediaTitle: String {
    switch self {
    case .Book(title: let aTitle, author: _, year: _):
      return aTitle
    case .Movie(title: let aTitle, director: _, year: _):
      return aTitle
    case .WebSite(url: _, title: let aTitle):
      return aTitle
    }
  }
}

let book = Media.Book(title: "20,000 leagues under the sea", author: "Jules Verne", year: 1870)
book.mediaTitle
```

这种形式下的通用语法是 `case MyEnum.EnumValue(let variable)` ，表明『如果对应的值是 `MyEnum.EnumValue` 且附带一个关联值，就绑定变量 `variable` 到该关联值上』。

当 media 实例匹配其中一个条件，比如匹配第一个 case：`Media.Book`，紧接着一个新的变量 `let aTitle` 被创建，且相关联的值 title 也会绑定到这个变量中。这就是我们为什么这里需要一个 `let`，因为如果匹配的话会创建一个新的变量（或常量）

请注意，你可以将 let 写在整个表达式的前面，而不用再写在每个变量前，下面这两行代码是等价的：

```swift
case .Book(title: let aTitle, author: let anAuthor, year: let aYear): …
case let .Book(title: aTitle, author: anAuthor, year: aYear): …
```

上面的代码使用了通配符 `_`，意味着：『我期待这里有东西就好，但不关心是什么，所以在我不使用时，不要将其绑定到一个变量』，类似于我们为不使用的值放置一个占位符。

## 使用固定的值

记住 `case` 仍然是关于模式匹配的，与之相比较的他都会尝试去匹配一下。这意味着你可以使用一个常量值来判断是否匹配，例如：

```swift
extension Media {
  var isFromJulesVerne: Bool {
    switch self {
    case .Book(title: _, author: "Jules Verne", year: _): return true
    case .Movie(title: _, director: "Jules Verne", year: _): return true
    default: return false
    }
  }
}
book.isFromJulesVerne
```

这个例子或许并没有什么实际意义，但是至少向你展示了如何绑定常量。我提到它是因为我们已经学习过将一个值绑定到一个变量上，然后判断该变量是否等于一个常量，而不是直接和这个常量进行模式匹配。

一个更有帮助和通用的例子看起来应该是这样的：

```swift
extension Media {
  func checkAuthor(author: String) -> Bool {
    switch self {
    case .Book(title: _, author: author, year: _): return true
    case .Movie(title: _, director: author, year: _): return true
    default: return false
    }
  }
}
book.checkAuthor("Jules Verne")
```

注意这里尽管我们在 `case` 模式中使用了 `author`，但这里不需要使用 `let`（与之前的代码不同）。因为这种情况下，我们不会创建一个变量来绑定一个值。相反，我们使用一个已经被赋过值的常量（这个值由函数参数提供），而不会创建一个新值绑定到匹配的 `self` 上 

## 一次绑定多种模式

在 Swift 2.2 中，我们不能一次绑定多种模式，所以下面的例子是不能正常工作的，因为我们尝试声明了一些变量用做 `self` 匹配 `.Book` 或 `.Movie` 的情形，然后只要满足这两种情形任意一种就绑定一个变量：

```swift
extension Media {
  var mediaTitle2: String {
    switch self {
      // 错误: 'case' 标签中绑定多种模式是不能声明变量的
    case let .Book(title: aTitle, author: _, year: _), let .Movie(title: aTitle, director: _, year: _):
      return aTitle
    case let .WebSite(url: _, title: aTitle):
      return aTitle
    }
  }
}
```

这在大多数情形下是可以理解的；你期望下面这些代码做些什么：

```swift
case let .Book(title: aTitle, author: _, year: _), let .Movie(title: _, director: _, year: aYear)?
```

随后你该如何在代码中使用绑定的变量（`aTitle` 或 `aYear`）呢？如果 self 是 `.Book`，则只有 `aTitle` 将会被绑定，那么 `aYear` 怎么办？如果你在随后的 case 下的代码块中使用 `aYear` 变量，不可能有意义的。

但是可能需要考虑的一个特例是当你尝试绑定相同名字和类型的变量时，这仍然是有意义的工作，就像上面例子中我们尝试在 cases 是 `.Book` 和 `.Movie` 时绑定 `aTitle`。这样做可以避免重复代码，不是吗？所以为什么在那种情形下还不允许这么用？别担心，这个[提议](https://github.com/apple/swift-evolution/blob/master/proposals/0043-declare-variables-in-case-labels-with-multiple-patterns.md)已经被 Swift 3.0 接受了。

## 使用没有参数标签的元组

注意当处理 `enum` 的关联值时，我们可以考虑使用一个元组来做唯一的关联值，而元组则包含所有真正的关联值。下面有两个结果：

+ 第一个你可以省略参数标签，然后 case 仍然能够正常工作：

```swift
extension Media {
  var mediaTitle2: String {
    switch self {
    case let .Book(title, _, _): return title
    case let .Movie(title, _, _): return title
    case let .WebSite(_, title): return title
    }
  }
}
```

+ 第二个你可以将关联值看做是一个唯一的大元组，然后方法里面独立的元素。

```swift
extension Media {
  var mediaTitle3: String {
    switch self {
    case let .Book(tuple): return tuple.title
    case let .Movie(tuple): return tuple.title
    case let .WebSite(tuple): return tuple.title
    }
  }
}
```

作为附加的奖励，可以不用指定特定的元组来匹配任何关联值，所以下面三个表达式是相等的：

```swift
case .WebSite // not specifying the tuple at all
case .WebSite(_) // matching a single tuple of associated values that we don't care about
case .WebSite(_, _) // matching individual associated values that we don't care about either
```

## 使用 Where 语句

比起比较两个枚举，模式匹配允许更强大的方式，你可以在比较中添加条件，使用 where 从句，如下：

```swift
extension Media {
  var publishedAfter1930: Bool {
    switch self {
    case let .Book(_, _, year) where year > 1930: return true
    case let .Movie(_, _, year) where year > 1930: return true
    case .WebSite: return true // same as "case .WebSite(_)" but we ignore the associated tuple value
    default: return false
    }
  }
}
```

这样只有当左边的模式（`let .Book(_, _, year)`）成功匹配，并且 `where` 限定的条件为 `true` 时，整个匹配过程才算完成。在稍后的系列文章中我们将继续深挖更强大的模式匹配。

## 下一部分的计划

这篇文章很简单，带你回顾了 `swith` 中的一些基本的模式匹配，下一部分将探讨更高级的用法，包括：

+ 在 `enum` 之外的其他地方使用 `switch`（尤其指 `tuples`，`structs`，`is` 和 `as`）
+ 与其他语句一起配合使用模式匹配，包括 `if case`, `guard case`, `for case`, `=~`, …
+ 嵌套模式，包括包含可选值
+ 将上面这些结合起来创造一些魔法  