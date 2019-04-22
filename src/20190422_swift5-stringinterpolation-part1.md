title: "Swift 5 字符串插值-简介"
date: 2019-04-22
tags: [Swift 进阶，Swift]
categories: [Crunchy Development]
permalink: swift5-stringinterpolation-part1
keywords: swift 5，string，interpolation
custom_title: "Swift 5 字符串插值-简介"

 ------

原文链接=http://alisoftware.github.io/swift/2018/12/15/swift5-stringinterpolation-part1/
作者=Olivier Halligon
原文日期=2018-12-15
译者=Nemocdz
校对=numbbbbb,Yousanflics
定稿=Forelax

 <!--此处开始正文-->

 `StringInterpolation` 协议最初的设计效率低下又不易扩展，为了在后续的版本中能够将其彻底重构，Swift 4 中将该协议标记为废弃。即将在 Swift 5 中亮相的 [SE-0228](https://github.com/apple/swift-evolution/blob/master/proposals/0228-fix-expressiblebystringinterpolation.md) 提案介绍了一种新的 `StringInterpolation` 设计，使得 String 有了更大的潜能。

 <!--more-->

 在 Swift 的 `master` 分支里实现之后，就可以下载一个 [快照](https://swift.org/download/#snapshots) 来安装最新的 Swift 5 工具链到 Xcode 中，来尝试全新的 `StringInterpolation`。让我们来把玩一下。

 ## 全新的 StringInterpolation 设计

 我强烈建议本篇文章的读者阅读一下 [SE-0228](https://github.com/apple/swift-evolution/blob/master/proposals/0228-fix-expressiblebystringinterpolation.md) 提案，感受一下新 API 的背后的设计思路和动机。

 要让一个类型遵循 `ExpressibleByStringInterpolation`，最基本的你需要：

* 让这个类型拥有一个类型为 `StringInterpolation` 的子类型，这个子类型遵循 `StringInterpolationProtocol` 并将负责解释插值
* 这个子类型仅需要实现 `appendLiteral(_ literal: String)` 方法，再选择一个或多个你自己想要支持的 `appendInterpolation(...)` 签名的方法
* 这个 `StringInterpolation` 子类型会作为“构造器”服务于你的主类型，然后编译器会调用那些 `append…` 方法一步一步地构造对象
* 然后你的主类型需要实现 `init(stringInterpolation: StringInterpolation)` ，它会用上一步的结果来实例化它自己。

你可以实现任何你喜欢的 `appenInterpolation(...)` 方法，这意味着你可以任意选择支持什么插值。这是一个带来巨大的可能性的超强功能。

举个例子，如果你实现了 `func appendInterpolation(_ string: String, pad: Int)`，那么意味着你将可以用类似这样的插值：`"Hello \(name, pad: 10), how are you?"` 来构造你的类型。插值只需要匹配你的 `StringInterpolation` 子类型其中一个支持的 `appendInterpolation` 方法签名。

## 一个简单的例子

让我用一个简单的例子来演示一下插值是如何运作的。一起来构造一个允许引用 issue 编号和用户的 `GitHubComment` 类型吧。

这个例子的目标是做到类似下面的写法：

 ```swift
let comment: GitHubComment = """
  See \(issue: 123) where \(user: "alisoftware") explains the steps to reproduce.
  """
```

所以我们该怎么实现它呢？

首先，让我们声明基本的结构体 `struct GitHubComment` 并让它遵循 `ExpressibleByStringLiteral`（因为 `ExpressibleByStringInterpolation` 继承自这个协议所以我们将它的实现抽离）和 `CustomStringConvertible`（为了 debug 时友好地在控制台中打印）。

```swift
struct GitHubComment {
  let markdown: String
}
extension GitHubComment: ExpressibleByStringLiteral {
  init(stringLiteral value: String) {
    self.markdown = value
  }
}
extension GitHubComment: CustomStringConvertible {
  var description: String {
    return self.markdown
  }
}
```

然后，我们让 `GitHubComment` 遵循 `ExpressibleByStringInterpolation`。这意味着在剩下需要实现的功能，将由一个 `StringInterpolation` 子类型来完成：

* 首先初始化它自己：`init(literalCapacity: Int, interpolationCount: Int)` 提供给你保留一部分数据到缓冲区的能力，在一步步构造类型时就会用到这个能力。在这个例子中，我们可以在构造实例的时候，简单用一个 `String` 并往它上面追加片段，不过这里我采用一个 `parts: [String]` 来代替，之后再将它组合起来

* 实现 `appendLiteral(_ string: String)` 逐个追加文本到 `parts` 里

* 实现 `appendInterpolation(user: String)` 在遇到 `\(user: xxx)` 时逐个追加 markdown 表示的用户配置链接

* 实现 `appendInterpolation(issue: Int)` 逐个追加用 markdown 表示的 issue 链接

* 然后在 `GitHubComment` 上实现 `init(stringInterpolation: StringInterpolation)` 将 `parts` 构造成一个评论

```swift
extension GitHubComment: ExpressibleByStringInterpolation {
  struct StringInterpolation: StringInterpolationProtocol {
    var parts: [String]
      init(literalCapacity: Int, interpolationCount: Int) {
      self.parts = []
      // - literalCapacity 文本片段的字符数 (L)
      // - interpolationCount 插值片段数 (I)
      // 我们预计通常结构会是像 "LILILIL"
      // — e.g. "Hello \(world, .color(.blue))!" — 因此是 2n+1
      self.parts.reserveCapacity(2*interpolationCount+1)
    }
      mutating func appendLiteral(_ literal: String) {
      self.parts.append(literal)
    }
    mutating func appendInterpolation(user name: String) {
      self.parts.append("[\(name)](https://github.com/\(name))")
    }
    mutating func appendInterpolation(issue number: Int) {
      self.parts.append("[#\(number)](issues/\(number))")
    }
  }
  init(stringInterpolation: StringInterpolation) {
    self.markdown = stringInterpolation.parts.joined()
  }
}
```

这就完事了！我们成功了！

注意，因为那些我们实现了的 `appendInterpolation` 方法签名，我们允许使用 `Hello \(user: "alisoftware")` 但不能使用 `Hello \(user: 123)`，因为 `appendInterpolation(user:)` 期望一个 `String` 作为形参。类似的是，在你的字符串中 `\(issue: 123)` 只能允许一个 `Int` 因为 `appendInterpolation(issue:)` 采用一个 `Int` 作为形参。

实际上，如果你尝试在你的 `StringInterpolation` 子类中用不支持的插值，编译器会给你提示报错：

```swift
let comment: GitHubComment = """
See \(issue: "bob") where \(username: "alisoftware") explains the steps to reproduce.
"""
//             ^~~~~         ^~~~~~~~~
// 错误: 无法转换 ‘String’ 类型的值到期望的形参类型 ‘Int’
// 错误: 调用 (have 'username:', expected 'user:')实参标签不正确
```

## 这仅仅只是个开始

这个新的设计打开了一大串脑洞让你去实现自己的 `ExpressibleByStringInterpolation` 类型。这些想法包括：

* 创建一个 `HTML` 类型并遵循，你就可以用插值写 HTML 
* 创建一个 `SQLStatement` 类型并遵循，你就可以写更简单的 SQL 语句
* 用字符串插值支持更多自定义格式，比如在你的插值字符串中用格式化 `Double` 或者 `Date` 值
* 创建一个 `RegEX` 类型并遵循，你就可以用花里胡哨的语法写正则表达式
* 创建一个 `AttributedString` 类型并遵循，就可以用字符串插值构建 `NSAttributedString` 

带来新的字符串插值设计的 [Brent Royal-Gordon](https://github.com/brentdax) 和 [Michael Ilseman](https://github.com/milseman)，提供了更多例子在这个 [要点列表](https://gist.github.com/brentdax/0b46ce25b7da1049e61b4669352094b6) 中。

我个人尝试了一下支持 `NSAttributedString` 的实现，并想 [在专门的一篇文章里分享它的初步实现](http://alisoftware.github.io/swift/2018/12/16/swift5-stringinterpolation-part2/)，因为我发现它非常优雅。我们下一篇文章再见！