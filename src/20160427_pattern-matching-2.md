title: "模式匹配第二弹：元组，range 和类型"
date: 2016-04-27 08:30:00
tags: [Swift 进阶]
categories: [Crunchy Development]
permalink: pattern-matching-2
keywords: swift元组,swift range
custom_title: 
description: 在 Swift 中除开枚举外的其他类型使用 switch 进行模式匹配是怎样的呢，下面本文来介绍一番吧。

---
原文链接=http://alisoftware.github.io/swift/2016/03/30/pattern-matching-2/
作者=Olivier Halligon
原文日期=2015-03-30
译者=小锅
校对=saitjr
定稿=shanks

<!--此处开始正文-->

在[上一篇文章中](http://alisoftware.github.io/swift/2016/03/27/pattern-matching-1/)，我们已经看过了使用 `switch` 来对枚举进行基本的模式匹配。那如果对除枚举外的其它类型使用 `switch` 来进行模式匹配会怎样呢？

<!--more-->

## 对元组进行模式匹配

在 Swift 当中，`switch` 并不像 ObjC 一样只能对整型或枚举进行匹配。

事实上，我们可以使用 `switch` 对很多类型进行匹配，包括（但不仅限于）元组。

这意味着我们只要将多个数据组合在一个元组中，就可以一次性匹配多个数据。比如说，如果你有一个 `CGPoint`，并且你想确定这个点是否位于某个坐标轴上，则可以使用 `switch` 来匹配它的 `.x` 和 `.y` 属性！

```swift
let point = CGPoint(x: 7, y: 0)
switch (point.x, point.y) {
  case (0,0): print("On the origin!")
  case (0,_): print("x=0: on Y-axis!")
  case (_,0): print("y=0: on X-axis!")
  case (let x, let y) where x == y: print("On y=x")
  default: print("Quite a random point here.")
}
```

注意我们在上一篇文章中使用过的 `_` 通配符，以及第四个  `case` 使用到的 `(let x, let y)` 可以对变量进行绑定，然后使用 `where` 来检查它们是否相等。

## Case 是按顺序判断的

还有一点要注意的是，`switch` 是按 `case` 模式被指定的顺序来判断求值的，并且它会在匹配到第一个满足的 `case` 后跳出。与 C 和 Objective-C 不同，我们不需要使用 `break` 关键字[<sup>1</sup>](#fallthrough)。

这意味着在上面的代码中，如果坐标是 `(0, 0)`，则它会匹配第一个 `case` 打印出 `"On the origin!"`，并就此打住，就算 `(0, _)` 和 `(_, 0)` 也符合匹配的条件，它也不会再去进行匹配。因为它已经在第一个匹配之后跳出了。

## 字符串与字符

为什么要止步于元组呢？在 Swift 当中，我们也可以使用 `switch` 来对很多原生类型进行匹配，包括字符串和字符，比如：

```swift
let car: Character = "J"
switch car {
  case "A", "E", "I", "O", "U", "Y": print("Vowel")
  default: print("Consonant")
}
```

可以注意到，我们可以使用按逗号分隔的多个模式来进行匹配，使符合这些模式的匹配（这里是匹配所有的元音字母）都执行同一段代码。这可以避免我们写很多重复的代码。

## Range

Range 在模式匹配中也很有用。提醒一下，`Range<T>` 是一个泛型类型，它包含了 `T` 类型的 `start` 和 `end` 成员，同时 `T` 必须是一个 `ForwardIndexType`。这包括 `Int` 和 `Character` 在内的许多类型。

> 💡我们可以使用 `Range(start: 1900, end: 2000)` 来显式地声明一个 range，也可以使用语法糖操作符 `..<`（不包含最后一个数 `end`）或 `...`（包含最后一个数 `end`），所以我们也可以将上面的 range 写为 `1900..<2000`（更方便也更易读）

那么我们如何在 `switch` 当中使用它们呢？其实相当简单，在 `case` 模式中使用 range 来判断值是否落于这个范围内！

```swift
let count = 7
switch count {
  case Int.min..<0: print("Negative count, really?")
  case 0: print("Nothing")
  case 1: print("One")
  case 2..<5: print("A few")
  case 5..<10: print("Some")
  default: print("Many")
}
```

可以看到我们在 `case` 当中混用了 `Int` 整型值与 `Range<Int>` 的值。这样的使用并没有任何问题，只要我们保证覆盖了所有可能的情况。

虽说 `Int` 是最常用的 range 类型，我们也可以使用其它的 `ForwardIndexType` 类型，包括... `Character`！还记得上面写的代码么？它有一点问题，那就是对于标点符号以及其它不是 `A-Z` 的字符，它也会打印出 "Consonant"。让我们来解决这个问题[<sup>2</sup>](#only-for-demo)（同时也增加了小写字母）：

```swift
func charType(car: Character) -> String {
  switch car {
    case "A", "E", "I", "O", "U", "Y", "a", "e", "i", "o", "u", "y":
      return "Vowel"
    case "A"..."Z", "a"..."z":
      return "Consonant"
    default:
      return "Other"
  }
}
print("Jules Verne".characters.map(charType))
// ["Consonant", "Vowel", "Consonant", "Vowel", "Consonant", "Other", "Consonant", "Vowel", "Consonant", "Consonant", "Vowel"]
```

## 类型

至此一切顺利，但我们能不能更进一步呢？答案是当然没问题：让我们把模式匹配用在... 类型上！

在这里，我们定义了三个结构体，并遵守相同的协议：

```swift
protocol Medium {
  var title: String { get }
}
struct Book: Medium {
  let title: String
  let author: String
  let year: Int
}
struct Movie: Medium {
  let title: String
  let director: String
  let year: Int
}
struct WebSite: Medium {
  let url: NSURL
  let title: String
}

// And an array of Media to switch onto
let media: [Medium] = [
  Book(title: "20,000 leagues under the sea", author: "Jules Vernes", year: 1870),
  Movie(title: "20,000 leagues under the sea", director: "Richard Fleischer", year: 1955)
]
```

然后我们要如何对 `Medium` 使用 `switch` 的模式匹配，让它对 `Book` 和 `Movie` 做不同的事呢？简单，在模式匹配中使用 `as` 和 `is`！

```swift
for medium in media {
  // The title part of the protocol, so no need for a switch there
  print(medium.title)
  // But for the other properties, it depends on the type
  switch medium {
  case let b as Book:
    print("Book published in \(b.year)")
  case let m as Movie:
    print("Movie released in \(m.year)")
  case is WebSite:
    print("A WebSite with no date")
  default:
    print("No year info for \(medium)")
  }
}
```

注意到对 `Book` 和 `Movie` 使用的 `as`，我们需要确定它们是不是特定的类型，如果是，则将它们转换后的类型赋值给一个常量（`let b` 或 `let m`)，因为我们之后要使用到这个常量[<sup>3</sup>](#no-qmark)。

而另一方面，对 `WebSite` 我们只使用了 `is`，因为我们只需要检查 `medium` 是不是一个 `Website` 类型，如果是，我们并没有对它进行转换与存储在常量中（我们不需要在 `print` 语句中使用到它）。这与使用 `case let _as Website` 有点类似，因为我们只关心它是不是 `Website` 类型，而不需要它的对象的值。

> 💡注意：如果必须在 `swtich` 匹配中使用到 `as` 和 `is`，这里有可能存在[代码异味](https://zh.wikipedia.org/wiki/代码异味)，比如，在上面这个特定的例子中，在 `protocol Medium` 当中添加一个 `releaseInfo: String { get }` 属性就比使用 `switch` 来对不同的类型进行匹配要好。

## 下一步

在接下来的部分，我们会学习如何创建可以直接使用于模式匹配的自定义类型，探索更多的语法糖，并看到如何在 `switch` 语句之外使用模式匹配，以及更加复杂的匹配表达式... 迫不及待了吧！

1. <span id="fallthrough" />可以使用 `fallthrough` 关键字来让求值判断流向下一个 `case`。但是在实践上要使用到这个关键字的场景很少，并不经常会碰到。
2. <span id="only-for-demo"/>当然，这种字符串的分析方法并不是最好的，也不是值得推荐的 —— 因为 Unicode 字符以及本地化都比这复杂得多。所以类似这样的功能我们更应该使用 `NSCharacterSet`，考虑当前的 `NSLocale` 把哪些字母定义为元音（“y” 是元音吗？还有 “õ” or “ø” 呢？），等等。不要把这个例子看得太认真，我只是用它来展示 `switch` + `Range` 的强大而已。
3. <span id="no-qmark" />尽管与 `if let b = medium as? Book` 表达式很相似 —— 当 `medium` 可以被转换为特定类型的时候，它们都将其绑定到一个变量上 —— 但是在模式匹配中我们要使用 `as` 而非 `as?`。尽管它们的机制很相似，但是它们的语义是不同的（“尝试进行类型转换，如果失败就返回 `nil`” vs “判断这个模式是不是匹配这种类型”）。