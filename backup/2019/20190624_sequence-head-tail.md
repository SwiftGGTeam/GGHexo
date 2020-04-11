title: "将 Swift 序列切分为头部和尾部"
date: 2019-06-24
tags: [Swift]
categories: [Ole Begemann]
permalink: sequence-head-tail
keywords: Sequence
custom_title: "将 Swift 序列切分为头部和尾部"

---

原文链接=https://oleb.net/2018/sequence-head-tail/
作者=Ole Begemann
原文日期=2018-11-29
译者=WAMaker
校对=numbbbbb,BigNerdCoding
定稿=Forelax

<!--此处开始正文-->

函数式编程语言的一个常用范式是把一个列表切分为头部（第一个元素）和尾部（其余元素）。在 Haskell 中，[x:xs](https://en.wikibooks.org/wiki/Haskell/Pattern_matching) 会匹配非空列表，将头部绑定给变量 x，尾部绑定给 xs。

[Swift 不是一门函数式编程语言](https://academy.realm.io/posts/tryswift-rob-napier-swift-legacy-functional-programming/)。既没有内置的 `List` 类型，也没有集合的特定匹配语法。<a href="#foot1" id="1"><sup>[1]</sup></a>

<!--more-->

## 集合（Collections）
尽管如此，将 `Sequence` 或 `Collection` 切分成头部和尾部偶尔很有用。对于集合来说这很容易：
```swift
extension Collection {
    var headAndTail: (head: Element, tail: SubSequence)? {
        guard let head = first else { return nil }
        return (head, dropFirst())
    }
}

if let (firstLetter, remainder) = "Hello".headAndTail {
    // firstLetter: Character == "H"
    // remainder: Substring == "ello"
}
```

## 序列（Sequence）
对于序列来说却很困难，因为它们可以是单向（single-pass）的：一些序列只能被迭代一次，迭代器会消耗其中的元素。以网络流为例，一旦你从缓冲区里读取了一个字节，操作系统便将它抛弃了。你无法让它重新来一遍。

一个可能的解决方案是 [创建一个迭代器](https://developer.apple.com/documentation/swift/sequence/2885155-makeiterator) 读取第一个元素，并把当前的迭代器状态包裹进一个新的 [AnySequence](https://developer.apple.com/documentation/swift/anysequence) 实例：
```swift
extension Sequence {
var headAndTail: (head: Element, tail: AnySequence<Element>)? {
    var iterator = makeIterator()
    guard let head = iterator.next() else { return nil }
    let tail = AnySequence { iterator }
    return (head, tail)
}
}
```

以上代码能够实现功能，但不是一个好的通用解决方案，尤其是对满足 `Collection` 的类型而言。将尾部包进 `AnySequence` 会是一个 [性能杀手](https://github.com/apple/swift-evolution/blob/master/proposals/0234-remove-sequence-subsequence.md#type-erasure-performance)，也不可以使用合适的集合类型 [SubSequence](https://developer.apple.com/documentation/swift/sequence/1641117-subsequence#)。

为了保护集合的 `SubSequence` 类型，最好给 `Collection` 和 `Sequence` 分别写扩展。（我们也将会看到，这是 Swift 5 所推崇的方案，这点会在后面谈到。）

## 保护 SubSequence 类型
我没有找到一个通用的方案，能够让尾部的 `SubSequence` 类型完好，也同时能让单向序列正常工作。很感谢 [Dennis Vennink](https://twitter.com/dennisvennink) 能够找出一个解决方案并 [分享给我](https://twitter.com/dennisvennink/status/1060158576679882753)。下面是 [他的代码](https://gist.github.com/dennisvennink/e8b1921916d3c2f90ab52f47291145ef)（我略微对格式进行了修改）：
```swift
extension Sequence {
var headAndTail: (head: Element, tail: SubSequence)? {
    var first: Element? = nil
    let tail = drop(while: { element in
        if first == nil {
            first = element
            return true
        } else {
            return false
        }
    })
    guard let head = first else {
        return nil
    }
    return (head, tail)
}
}
```

Dennis 的窍门是调用 [Sequence.drop(while:)](https://developer.apple.com/documentation/swift/sequence/2965501-drop)，为尾部保留了 `SubSequence` 类型，同时在 `drop(while:)` 内部“捕获”了第一个元素。干得漂亮！

## Swift 5
上面的代码使用 Swift 4.2。在 Swift 5 中由于序列不再会有关联 `SubSequence` 类型，只存在于集合中（[Swift Evolution proposal SE-0234](https://github.com/apple/swift-evolution/blob/master/proposals/0234-remove-sequence-subsequence.md)），以上代码会崩溃。<a href="#foot2" id="2"><sup>[2]</sup></a>

这个改变有很多优势，但同样意味着不可能有一种通用的方法能够让 `SubSequence` 同时对 `Sequence` 和 `Collection` 有效。

相对的，我们把那个简单的解决方案添加给 `Collection`：
```swift
extension Collection {
var headAndTail: (head: Element, tail: SubSequence)? {
    guard let head = first else { return nil }
    return (head, dropFirst())
}
}
```

如果我们需要让 `Sequence` 拥有同样的功能，就需要添加一个独立的扩展，使用新的 `DropWhileSequence` 作为返回类型的尾部：
```swift
extension Sequence {
var headAndTail: (head: Element, tail: DropWhileSequence<Self>)? {
    var first: Element? = nil
    let tail = drop(while: { element in
        if first == nil {
            first = element
            return true
        } else {
            return false
        }
    })
    guard let head = first else {
        return nil
    }
    return (head, tail)
}
}
```

（实现和之前的代码一样，仅仅改变了返回的类型。）

---

<a id="foot1" href="#1"><sup>[1]</sup></a>为集合添加一种模式匹配结构作为一个 [可行](https://forums.swift.org/t/review-se-0074-implementation-of-binary-search-functions/2438/9) 的特性已经在论坛多次被 [提及](https://forums.swift.org/t/pattern-matching-with-arrays/4735/3)。有了它，你可以像下面这样将一个有序集合解构成头部和尾部：

```swift
let numbers = 1...10
let [head, tail...] = numbers
// head == 1
// tail == 2...10
```

在 `switch` 表达式中会很有用。

<a id="foot2" href="#2"><sup>[2]</sup></a>很遗憾我们被误导性的名字 `Sequence` 给束缚住了。要将 `Collection.SubSequence` 重命名成更合适的 `Slice` 会造成 [严重的代码破坏](https://forums.swift.org/t/rationalizing-sequence-subsequence/17586/13)。