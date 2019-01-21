title: "在 Swift 中使用马尔可夫链生成文本"
date: 2018-07-23
tags: [Swift]
categories: [Mike Ash]
permalink: friday-qa-2018-04-27-generating-text-with-markov-chains-in-swift
keywords: Swift,Markov chains
custom_title: 在 Swift 中使用马尔可夫链生成文本
description: 本文介绍了使用 Swift 来构造马尔可夫链结构，并使用该结构指定输入数据源随机生成文本。

---
原文链接=https://www.mikeash.com/pyblog/friday-qa-2018-04-27-generating-text-with-markov-chains-in-swift.html
作者=Mike Ash
原文日期=2018-04-28
译者=Hale
校对=numbbbbb,mmoaay,Cee
定稿=CMB

<!--此处开始正文-->

马尔可夫链可用于快速生成真实但无意义的文本。今天，我将使用这种技术来创建一个基于这篇博客内容的文本生成器。这个灵感来源于读者 Jordan Pittman。

<!--more-->

## 马尔可夫链

理论上讲，马尔可夫链是一种状态机，每一个状态转换都有一个与之相关的概率。你可以选择一个起始状态，然后随机地转换成其他状态，通过转移概率来加权，直到到达一个终止状态。

马尔可夫链有着[广泛的应用](https://en.wikipedia.org/wiki/Markov_chain#Steady-state_analysis_and_limiting_distributions)，但最有趣的是用于文本生成。在本文生成领域，每个状态是文本的一部分，通常是一个单词。状态和转换是由一些语料库生成的，然后遍历整个链并为每个状态输出单词来生成文本。这样生成的文本通常没有实际意义，因为该链不包含足够的信息来保留语料库的任何潜在含义及语法结构，但是缺乏意义本身却给文本带来了意料之外的乐趣。

## 构建算法

链中的节点由 `Word` 类的实例表示，此类将会为它所表示的单词保存一个字符串，同时持有一组指向其他单词的链接。

我们如何表示这一组链接呢？最直接的方法是采用某种计数的集合，它将存储其他 `Word` 实例以及在输入语料库中转换次数的计数。不过，从这样一个集合中随机选择一个链接可能会非常棘手。一个简单的方法是生成一个范围从 0 到集合元素总计数之间的随机数，然后遍历该集合直到取到很多的链接，然后选中你想要的链接。虽然这个方式简单，但可能比较耗时。另一种方法是预先生成一个数组，用于存储数组中每个链接的累积总数，然后对 0 和总数之间的随机数进行二分搜索。这相对来说更繁琐一些，但执行效率更高。如果你追求更好的方案，你其实可以做更多的预处理，并最终得到一个可以在[常量时间内完成查询的紧凑结构](http://www.keithschwarz.com/darts-dice-coins/)。

最终，我决定偷懒使用一种在空间上极其浪费，但在时间上效率很高且易于实现的结构。该结构每个 `Word` 包含一个后续 `Words` 的数组。如果一个链接被指向多次，那么将会保存重复的 `Words` 数组。在数组中选择一个随机索引，根据索引返回具有适当权重的随机元素。

`Word` 类结构如下：

```swift
class Word {
   let str: String?
   var links: [Word] = []

   init(str: String?) {
       self.str = str
   }

   func randomNext() -> Word {
       let index = arc4random_uniform(UInt32(links.count))
       return links[Int(index)]
   }
}
```

请注意，`links` 数组可能会导致大量循环引用。为了避免内存泄漏，我们需要手动清理那些内存。

我们引入 `Chain` 类，它将管理链中所有的 `Words` 。

```swift
class Chain {
   var words: [String?: Word] = [:]
```

在 `deinit` 方法中，清除所有的 `links` 数组，以消除所有的循环引用。

```swift
  deinit {
      for word in words.values {
          word.links = []
      }
  }
```

如果没有这一步，许多单词实例的内存都会泄漏。

现在让我们看看如何将单词添加到链中。`add` 方法需要一个字符串数组，该数组中每一个元素都保存着一个单词（或调用者希望使用的其他任何字符串）:

```swift
  func add(_ words: [String]) {
```

如果链中没有单词，那么提前返回。

```swift
       if words.isEmpty { return }
```

我们想要遍历那些成对的单词，遍历规则是第二个元素的第一个单词紧随第一个元素后面的单词。例如，在句子 "Help, I'm being oppressed," 中，我们要迭代 `("Help", "I'm")` ， `("I'm", "being")` ， `("being", "oppressed")` 。

实际上，还需要多做一点事情，因为我们需要编码句子的开头和结尾。我们将句子的开头和结尾用 `nil` 表示，所以我们要迭代的实际序列是 `(nil, "Help")` ， `("Help", "I'm")` ， `("I'm", "being")` ， `("being", "oppressed")` ， `("oppressed", nil)` 。

为了允许值为 `nil` ， 我们的数组声明为 `String?` 类型，而不是 `String`  类型。

```swift
       let words = words as [String?]
```

接下来构造两个数组，一个头部添加 `nil`，另一个尾部添加 `nil`。把它们通过 `zip` 合并在一起生成我们想要的序列：

```swift
       let wordPairs = zip([nil] + words, words + [nil])
       for (first, second) in wordPairs {
```

对于这一对中的每个单词，我们使用一个辅助方法来获取相应的 `Word` 对象：

```swift
           let firstWord = word(first)
           let secondWord = word(second)
```

然后把第二个单词添加到第一个单词的链接中：

```swift
           firstWord.links.append(secondWord)
       }
   }
```

`Word` 辅助方法从 `words` 字典中提取实例，如果实例不存在就创建一个新实例并将其放入字典中。这样就不用担心字符串匹配不到单词：

```swift
   func word(_ str: String?) -> Word {
       if let word = words[str] {
           return word
       } else {
           let word = Word(str: str)
           words[str] = word
           return word
       }
   }
```

最后生成我们要的单词序列：

```swift
   func generate() -> [String] {
```

我们将逐个生成单词，并将他们存储在下面的数组中:

```swift
       var result: [String] = []
```

这是一个无限循环。因为退出条件没有清晰的映射到循环条件，代码如下：

```swift
       while true {
```

在 `result` 中获取最后一个字符串构成 `Word` 实例。这很好地处理了当 `result` 为空时的初始情况，因为一旦 `last` 取值为 `nil` 就表示第一个单词：

```swift
            let currentWord = word(result.last)
```

随机获取链接的词：

```swift
            let nextWord = currentWord.randomNext()
```

如果链接的单词不是结尾，将其追加到 `result` 中。如果是结束，则终止循环：

```swift
            if let str = nextWord.str {
                result.append(str)
            } else {
                break
            }
        }
```

返回包含所有单词的 `result`：

```swift
        return result
    }
}
```

最后一件事：我们正在使用 `String?` 作为 `words` 的键类型，但 `Optional` 不符合 `Hashable` 协议。下面是一个扩展，当它的封装类型遵循 `Hashable` 时添加 `Optional` 对 `Hashable` 的实现：

```swift
extension Optional: Hashable where Wrapped: Hashable {
    public var hashValue: Int {
        switch self {
        case let wrapped?: return wrapped.hashValue
        case .none: return 42
        }
    }
}
```

> 备注：Swift 4.2 中 `Optional` 类型已默认实现 `Hashable` 协议

## 生成输入数据

以上就是马尔可夫链的结构，下面我们输入一些真实文本试试看。

我决定从 `RSS` 提要中提取文本。还有什么比用我自己博客全文作为输入更好的选择呢？

`let feedURL = URL(string: "https://www.mikeash.com/pyblog/rss.py?mode=fulltext")!`

`RSS` 是一种 `XML` 格式，所以我们使用 `XMLDocument` 来解析它：

`let xmlDocument = try! XMLDocument(contentsOf: feedURL, options: [])`

文章主体被嵌套在 `item` 节点下的 `description` 节点。通过 `XPath` 查询检索：

`let descriptionNodes = try! xmlDocument.nodes(forXPath: "//item/description")`

我们需要 `XML` 节点中的字符串，所以我们从中提取并过滤掉为 `nil` 的内容。

`let descriptionHTMLs = descriptionNodes.compactMap({ $0.stringValue })`

我们根本不用关心标签。`NSAttributedString` 可以解析 `HTML` 并生成一个 `AttributedString`，然后我们可以过滤它：

```swift
let descriptionStrings = descriptionHTMLs.map({
   NSAttributedString(html: $0.data(using: .utf8)!, options: [:], documentAttributes: nil)!.string
})
```

我们需要一个将字符串分解成若干部分的函数。我们的目的是生成 String 数组，每个数组对应文本里的一句话。一段文本可能会有很多句话，所以 `wordSequences` 函数会返回一个 String 的二维数组：

`func wordSequences(in str: String) -> [[String]] {`

然后我们将处理结果存储在一个局部变量中：

`var result: [[String]] = []`

将字符串分解成句子并不简单。你可以直接搜索标点符号，但需要考虑到像 `“Mr. Jock, TV quiz Ph.D., bags few lynx.”` 这样的句子，按照标点符号会被分割成四段，但这是一个完整的句子。

`NSString` 提供了一些智能检查字符串部分的方法，前提是你需要 `import Foundation` 。我们会枚举 `str` 包含的句子，并让 `Foundation` 进行处理：

```swift
    str.enumerateSubstrings(in: str.startIndex..., options: .bySentences, { substring, substringRange, enclosingRange, stop in
```

在将句子拆分成单词的时候会遇到相似的问题。`NSString` 也提供了一种用于枚举词的方法，但是存在一些问题，例如丢失标点符号。我最终决定用一种愚蠢的方式来进行单词分割，只按空格进行分割。这意味着你最终将包含标点符号的单词作为字符串的一部分。与标点符号被删除相比，这更多地限制了马尔可夫链，但另一方面，输出会包含合理的标点符号。我觉得这个折中方案还不错。

一些换行符会进入数据集，我们首先将这些换行符移除：

```swift
        let words = substring!.split(separator: " ").map({
            $0.trimmingCharacters(in: CharacterSet.newlines)
        })
```

分割的句子最终被添加到 `result` 中：

```swift
        result.append(words)
    })
```

枚举完成后，根据输入的句子计算出 `result` ，然后将其返回给调用者：

```swift
    return result
}
```

回到主代码。现在已经有办法将字符串转换为句子列表，我们就可以继续构建自己的马尔可夫链。首先我们创建一个空的 `Chain` 对象：

`let chain = Chain()`

然后我们遍历所有的字符串，提取句子，并将它们添加到链中：

```swift
for str in descriptionStrings {
   for sentence in wordSequences(in: str) {
       chain.add(sentence)
   }
}
```

最后一步当然是生成一些新句子！我们调用 `generate()`，然后用空格连接结果。输出结果可能命中也可能不命中（考虑到该技术的随机性，这并不奇怪），所以我们会多生成一些：

```swift
for _ in 0 ..< 200 {
   print("\"" + chain.generate().joined(separator: " ") + "\"")
}
```

## 示例输出

为了演示，下面是这个程序的一些示例输出：

*  "We're ready to be small, weak references in New York City."
*  "It thus makes no values?"
*	"Simple JSON tasks, it's wasteful if you can be."
*	"Another problem, but it would make things more programming-related mystery goo."
*	"The escalating delays after excessive focus on Friday, September 29th."
*	"You may not set."
*	"Declare conformance to use = Self.init() to detect the requested values."
*	"The tagged pointer is inlined at this nature; even hundreds of software and writing out at 64 bits wide."
*	"We're ready to express that it works by reader ideas, so the decoding methods for great while, it's inaccessible to 0xa4, which takes care of increasing addresses as the timing."
*	"APIs which is mostly a one-sided use it yourself?"
*	"There's no surprise."
*	"I wasn't sure why I've been called 'zero-cost' in control both take serious effort to miss instead of ARC and games."
*	"For now, we can look at the filesystem."
*	"The intent is intended as reader-writer locks."
*	"For example, we can use of the code?"
*	"Swift's generics can all fields of Swift programming, with them is no parameters are static subscript, these instantiate self = cluster.reduce(0, +) / Double(cluster.count)"
*	"However, the common case, you to the left-hand side tables."

上面有很多无意义的句子，所以你必须深入挖掘才能找到有意义的句子，但不可否认马尔可夫链可以产生一些非常有趣的输出。

## 总结

马尔可夫链有许多实际用途，在用于生成文本时它可能显得比较有趣但不是很实用。除了展示了其娱乐性之外，该代码还说明了在没有明确引用关系的情况下如何处理循环引用，如何灵活地使用 `NSString` 提供的枚举方法从文本中提取特征，以及简要说明了条件一致性（[conditional conformances](https://github.com/apple/swift-evolution/blob/master/proposals/0143-conditional-conformances.md)）的优点。

今天就讲这些。期待下次一起分享更多的乐趣，在娱乐中进行学习。`Friday Q&A` 是由读者的想法驱动的，所以如果你有一些想在这里看到的话题，请给我[发送邮件](mailto:mike@mikeash.com)！

> 你喜欢这篇文章吗？我正在卖收录了这些文章的一本书！第二卷和第三卷现在也出来了！包括 ePub，PDF，实体版以及 iBook 和 Kindle。[点击这里查看更多信息](https://www.mikeash.com/book.html)。
