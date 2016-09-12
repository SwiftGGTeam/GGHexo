title: "模式匹配第三弹: 自定义的模式匹配和语法糖"
date: 2016-04-28 09:30:00
tags: [Swift 进阶]
categories: [Crunchy Development]
permalink: pattern-matching-3
keywords: swift模式匹配,swift switch
custom_title: 
description: 这次我们来学习 Swift Switch 使用自定义的类型和模式匹配的时候是怎样的。

---
原文链接=http://alisoftware.github.io/swift/2016/04/24/pattern-matching-3/
作者=Olivier Halligon
原文日期=2015-04-24
译者=walkingway
校对=小锅
定稿=numbbbbb

<!--此处开始正文-->

在模式匹配系列文章的[第一弹](http://swift.gg/2016/04/26/pattern-matching-1/)和[第二弹](http://swift.gg/2016/04/27/pattern-matching-2/)中，我们已经看到关于 switch 搭配很多类型的用法，包括元组（`tuples`），范围（`Range`），字符串（`String`），符号（`Character`）和一些其他类型。但是假如我们使用自定义的类型和模式匹配，又能擦出怎样的火花呢？

<!--more-->

## Switch 和模式匹配操作符

如果你在 `switch` 实例中这样写 `case 1900..<2000`，那么 Swift 如何比较 switch 入口的单值与下面的范围？   

答案非常简单：Swift 使用了 `~=` 操作符。当你在 case 中使用 `Range<I> `时，switch 可以对 `I` 进行匹配，这是因为 `Range<I>` 与 `I` 二者之间定义了 `~=` 操作符：

```swift
func ~=<I : ForwardIndexType where I : Comparable>(pattern: Range<I>, value: I) -> Bool
```

事实上，如果你写 `switch someI` 并加上 `case aRangeOfI` 语句时，Swift 会尝试调用 `aRangeOfI ~= someI` 来做匹配操作（该表达式会返回一个 Bool 来通知是否匹配成功）

这就意味着你可以为自己的类型定义相同的操作符 `~=`，这样就能保证这些自定义类型可以在 `switch/case` 语句中使用，我们也可以用相同的方式使用 `Range`！

## 让你的自定义类型响应模式匹配

我们构造一个自定义的结构体：

```swift
struct Affine {
  var a: Int
  var b: Int
}

func ~= (lhs: Affine, rhs: Int) -> Bool {
  return rhs % lhs.a == lhs.b
}

switch 5 {
case Affine(a: 2, b: 0): print("Even number")
case Affine(a: 3, b: 1): print("3x+1")
case Affine(a: 3, b: 2): print("3x+2")
default: print("Other")
}
```

最终打印的结果是 `3x+2`！

值得注意的一点是：在使用自定义类型时，Swift 不知道 switch 是否穷尽了所有可能。例如，即使我们添加了 `case Affine(a: 2, b: 1)` 和 `case Affine(a: 2, b: -1)` 这两个子句，来覆盖到每一个正整数和负整数的情况，Swift 还是会强迫我们使用 `default:` 语句。

此外需要注意，不要搞混了参数的顺序：`~=` 的第一个参数（通常称为 `lhs`，译指左手边）是你将要在 `case` 子句中使用的对象，第二个参数（通常称为 `rhs`，译指右手边）是你使用 switch 传入的对象。

## ~= 的一些其他用途

`~=` 还有很多其他用途。

例如，我们可以在[第二弹](http://swift.gg/2016/04/27/pattern-matching-2/)中登场的 `Book` 结构体中添加如下代码：

```swift
func ~= (lhs: Range<Int>, rhs: Book) -> Bool {
  return lhs ~= rhs.year
}
```

现在测试一下：

```swift
let aBook = Book(title: "20,000 leagues under the sea", author: "Jules Vernes", year: 1870)
switch aBook {
case 1800..<1900: print("19th century book")
case 1900..<2000: print("20th century book")
default: print("Other century")
}
```

当然我不鼓励这样使用，将 Book 直接与一段整数范围比较并不能很清晰地展现我们的意图：『其实是想与 book 的出版年份进行比较』。更好的方式是在 switch 中直接传入 `aBook.year`。但我们举这个例子只是为了展示 `~=` 操作符的强大(另一个原因是我暂时想不到更好的例子了🙃)。

另一个使用 ~= 的例子是判定一个字符串是否『足够接近』另一个。例如，你正在创作一个测试游戏，并且期望玩家通过键盘来输入答案，对于玩家的答案，你希望大小写不敏感，变音符号不敏感，甚至容忍一些小错误，可以像下面这样写：

```swift
struct Answer {
  let text: String
  let compareOptions: NSStringCompareOptions = [.CaseInsensitiveSearch, .DiacriticInsensitiveSearch, .WidthInsensitiveSearch]
}

func ~= (lhs: Answer, rhs: String) -> Bool {
  return lhs.text.compare(rhs, options: lhs.compareOptions, range: nil, locale: nil) == NSComparisonResult.OrderedSame
}

let question = "What's the French word for a face-to-face meeting?"
let userAnswer = "Tete a Tete"

switch userAnswer {
case Answer(text: "tête-à-tête"): print("Good answer!")
case Answer(text: "tête à tête"): print("Almost… don't forget dashes!")
default: print("Sorry, wrong answer!")
}
// 输出 "Almost… don't forget dashes!"
```

观察一下，这种比较是如何在一个区分大小写，变音符合不敏感，宽度不敏感的比较中得到一个最接近的答案的。

## Optionals 的语法糖

如果你认为 `switch` 和匹配模式的语法糖就是在 `switch/case` 语句中透明地使用 `~=`，那只能说你们呐 **too young too simple，sometimes naive**。

你需要了解的另一个有用的语法糖就是：当 switch 处理一个可选值 `x?` 时，你可以识别问号标记的可选值。

在这种特殊的环境下，使用 `x?` 作为语法糖来表示 `.Some(x)`，这就意味着你可以这样写：

```swift
let anOptional: Int? = 2
switch anOptional {
case 0?: print("Zero")
case 1?: print("One")
case 2?: print("Two")
case nil: print("None")
default: print("Other")
}
```

事实上，如果你不使用 ? 而是用 `case 2:` 来替代 `case 2?:`，那么编译器会报错：`expression pattern of type 'Int' cannot match values of type 'Int?'` 因为你尝试将 `Int(2)` 和一个 `Int?`(可选值)进行匹配。

使用 case 2?: 其实就精准地等同于写 case Optional.Some(2)，这一过程将产生一个可选
值 `Int?` 包含整数 `2`，这样我们就能开心地匹配另一个可选值 `Int?` 了。就像 `anOptional. case 2?:` 其实是 `.Some(2)` 的一种更紧凑的形式。

## 游走在枚举对象 rawValue 上的 Switch

提起这个，我最近构建一个 `UITableView` 作为菜单时，偶然发现一些代码可以使用枚举 `enum`（配合 `Int` 原始值 rawValue） 来组织。我们随后可以直接操作 enum MenuItem（枚举子菜单）而不是 `indexPath.row`，这个想法是不是棒极了呢！

```swift
enum MenuItem: Int {
  case Home
  case Account
  case Settings
}
```

随后基于 `MenuItem` 来实现每一行 tableView row，代码如下：

```swift
switch indexPath.row {
case MenuItem.Home.rawValue: …
case MenuItem.Account.rawValue: …
case MenuItem.Settings.rawValue: …
default: ()
```

首先，注意 `switch` 是如何处理 `Int (indexPath.row)` 并且每一行 case 如何使用 `rawValue` 的。这样做是错误的，原因有如下几个：

+ 首先这种写法不会阻止你使用其他任意值，比如一个复制粘贴能使你写出 `case FooBar.Baz.rawValue` 然后编译器也不会抱怨。但是你是在处理 `MenuItems`，所以还是希望编译器能够确保我们处理的是 `MenuItems`，而不是其他东东。
+ 另一个问题是 `switch` 自身没有穷尽所有可能，这就是为什么 `default` 语句是必要的。我强烈推荐你尽量不使用 `default` 语句，而是在 `switch` 中穷尽所有可能，按照这种方式如果你新添加一个值到枚举对象中，你不由自主地会强迫自己去思考如何去做而不是什么都不去想，更不会都依赖 `default` 来处理那些因为你懒而没有意识的情形。

为了替代 `switch` 中的 `indexPath` 和 `case ….rawValue`，你应该一开始就依赖 rawValue 构建枚举对象 enmu，通过这种方式，你在 switch 中使用枚举对象的 cases 就足够了，即使用 `MenuItem` 枚举对象的 cases，而不是像 `FooBar.Baz` 之类的东东。

这样做，因为 `MenuItem(rawValue:)` 是一个允许失败的初始化程序，事实上该方法返回的也是一个可选值 `MenuItem?`，可以用到我们上面提到过的语法糖耶！

```swift
switch MenuItem(rawValue: indexPath.row) {
case .Home?: …
case .Account?: …
case .Settings?: …
case nil: fatalError("Invalid indexPath!")
}
```

老实说，对于那种情形我更习惯使用 `guard let`，而且我发现这种方式比在每个 `case` 中使用 `?` 更具可读性：

```swift
guard let menuItem = MenuItem(rawValue: indexPath.row) else { fatalError("Invalid indexPath!") }
switch menuItem {
case .Home: …
case .Account: …
case .Settings: …
}
```

是不是有点灵活，了解一下所有可能的选择总归不是一件坏事。

## 总结

这就是今天我要说的，在这一系列文章的下一篇（或许是最后一篇）中，我会说说如何在其他场景下使用模式匹配。我们不会局限在 `switch` 上，会讲讲在 `if`, `guard` 和 `for` 循环中如何使用模式匹配，并将大家对模式匹配的认识提升到一个新的高度，让我们拭目以待吧。