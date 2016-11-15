title: "老司机带你深入浅出 Collection"
date: 2016-11-09
tags: [Swift]
categories: [Ole Begemann]
permalink: collection-associated-types
keywords: swift协议,swift集合,swift collection
custom_title: Swift 集合协议的关联类型
description: Swift 中的集合很强大也很复杂，本文就来讨论下 Swift 集合协议的关联类型作用。

---
原文链接=https://oleb.net/blog/2016/09/collection-associated-types/
作者=Ole Begemann
原文日期=2016-09-22
译者=BigbigChai
校对=walkingway
定稿=CMB

<!--此处开始正文-->

本文摘自即将出新版的 [Swift 进阶（Advanced Swift）](https://www.objc.io/books/advanced-swift/Swift)一书中的集合协议（Collection Protocols）章节（稍作修改以适合博客文章）。我和 [Chris Eidhof](http://chris.eidhof.nl/) 已经基本完成为本书更新到 Swift 3 的工作，很快可以面世。

Swift 中的集合非常强大，但也[很复杂](http://chris.eidhof.nl/post/protocols-in-swift/)。如果你想实现自定义的集合类型，首先需要了解[集合](https://developer.apple.com/reference/swift/collection)协议的原理。即使只是使用标准库中常见的集合类型，它的工作原理仍然十分值得学习，尤其是它可以帮助你理解编译器打印出来的错误信息。

在本文中，我们想探讨一下集合协议的[关联类型](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/Generics.html#//apple_ref/doc/uid/TP40014097-CH26-ID189)。这听起来像是一个晦涩的主题，但我认为想要掌握 Swift 中集合类型的关键：在于对理解关联类型的作用、以及为什么需要它们。

<!--more-->

### 概述

集合有五种关联类型。它们声明如下（实际的代码并不是这样，因为 Index 是在 IndexableBase 中声明的，但你明白我的意思就好）：

```swift
protocol Collection: Indexable, Sequence {
    associatedtype Iterator: IteratorProtocol = IndexingIterator<Self>
    associatedtype SubSequence: IndexableBase, Sequence = Slice<Self>
    associatedtype Index: Comparable // declared in IndexableBase
    associatedtype IndexDistance: SignedInteger = Int
    associatedtype Indices: IndexableBase, Sequence = DefaultIndices<Self>
    ...
}
```

前四个关联类型继承自基础协议 
[Sequence](https://developer.apple.com/reference/swift/sequence)，[Indexable](https://developer.apple.com/reference/swift/indexable) 和 [IndexableBase](https://developer.apple.com/reference/swift/indexablebase) [^1]；集合遵循了以上所有的协议，只是 Index 的约束更加严格、余下的协议赋予了不同的默认值。

注意，除了 Index 以外，集合类型的关联类型都有默认值 — 因此遵守集合协议的类型都只需指定 Index 的类型就可以了。虽然你不必过分在意其他的关联类型，但还是应该大致了解一下。

### [迭代器 Iterator](https://developer.apple.com/reference/swift/collection/iterator)

遵守 Sequence 协议。Sequence 通过创建迭代器来访问它们的元素。迭代器每次产生一个序列的值，并在遍历该序列时追踪它的迭代状态。

迭代器内部有一个称为 [Element](https://developer.apple.com/reference/swift/iteratorprotocol/element) 的关联类型。Element 类型指定了迭代器的生成值类型。例如，对于 [String.CharacterView](https://developer.apple.com/reference/swift/string.characterview) 的迭代器而言，Element 的类型是 [Character](https://developer.apple.com/reference/swift/character)。另外，迭代器也定义了它的 Sequence 的 Element 类型；事实上，我们经常能在方法签名、或者 Sequence 和集合的泛型约束中看到对 Iterator.Element 的引用，就是因为 Element 是 [IteratorProtocol](https://developer.apple.com/reference/swift/iteratorprotocol) 的关联类型。

集合的默认迭代器类型是 [IndexingIterator \<Self\>](https://developer.apple.com/reference/swift/indexingiterator)。这是一个非常简单的封装结构体，它使用集合自身的索引来遍历每个元素。标准库中的大多数集合都使用 IndexingIterator 作为迭代器。我们不需要为自定义的集合更改迭代器类型。

### [子序列 SubSequence](https://developer.apple.com/reference/swift/collection/subsequence)

子序列也遵守 Sequence 协议，但是集合约束更加严格：集合的子序列本身也应该是集合。（我们说“应该”而不是“必须”，因为这种约束在目前的类型系统中无法完全表示。）

在返回初始集合片段的操作中，子序列作为其返回类型：

+ [prefix](https://developer.apple.com/reference/swift/collection/1641469-prefix) 和 [suffix](https://developer.apple.com/reference/swift/collection/1641372-suffix) — 取开头或末尾的 n 个元素。
+ [dropFirst](https://developer.apple.com/reference/swift/collection/1641742-dropfirst) 和 [dropLast](https://developer.apple.com/reference/swift/collection/1641794-droplast)  — 返回删除开头或末尾 n 个元素后的子序列。
+ [拆分（split）](https://developer.apple.com/reference/swift/collection/1641547-split) —  以指定的分隔符元素拆分序列，并以数组形式返回。
+ 带有 Range \<Index\> 参数的 [subscript](https://developer.apple.com/reference/swift/collection/1641423-subscript)（下标）— 返回指定索引范围内的元素片段。

集合的默认子序列类型是 [Slice \<Self\>](https://developer.apple.com/reference/swift/slice)，它封装了初始的集合（类似于 IndexingIterator ），并存储该片段在初始集合中的起始索引（startIndex）和结束索引（endIndex）。

自定义集合的子序列类型非常有用，特别是当它定义为 Self（即集合的片段与集合本身类型相同）的时候。标准库类型中的例子有 String.CharacterView，这让字符串片段的使用[更为方便](https://oleb.net/blog/2016/08/swift-3-strings)。而一个反例是 [Array](https://developer.apple.com/reference/swift/array)，它以 [ArraySlice](https://developer.apple.com/reference/swift/arrayslice) 作为片段类型。

### [索引 Index](https://developer.apple.com/reference/swift/indexablebase/index)

索引表示集合中的位置。每个集合都有两个特殊的索引，[startIndex](https://developer.apple.com/reference/swift/indexablebase/1786423-startindex) 和 [endIndex](https://developer.apple.com/reference/swift/indexablebase/1782993-endindex)。 startIndex 指向集合的第一个元素，而 endIndex 是集合中最后一个元素*之后*的索引。索引应该是一个哑值，只存储表明元素位置所需的最少信息量。尤其，索引应该尽可能地减少对集合的引用。集合索引必须是[可比较的](https://developer.apple.com/reference/swift/comparable)，这是它唯一的要求。也就是说，索引需要有明确的顺序。

比如数组就是用整数作为索引的，但是整数索引不是对所有数据结构都起作用。我们再以 String.CharacterView 为例，Swift 中的字符是[大小可变的](https://oleb.net/blog/2016/08/swift-3-strings)；如果你想使用整数索引，你有两个选择：

1. **用索引表示字符串内部存储的偏移量。**这种做法十分有效率；访问一个给定索引的元素的复杂度是 O（1）。但是对于索引范围而言会有差别。例如，如果索引 0 处的字符是正常大小的两倍，则下一个字符的索引会是 2  - 访问索引 1 处的元素将触发致命错误或未定义行为。这会严重违反用户的期望。

2. **用索引 n 表示字符串中的第 n 个字符。**这与用户期望一致 — 对索引范围来说不会有任何差别。然而，访问给定索引的元素的复杂度变成了O（n）；必须从头遍历字符串内该索引之前的所有元素，才能确定字符的储存位置。这种行为非常不好，因为用户会期望通过索引下标访问元素的操作能瞬间完成。
  ​
因此，`String.CharacterView.Index` 是一个不可见的值，指向字符串的内部存储缓冲区中的位置。实际上，它只是封装了一个整型偏移量，集合的使用者并不会对这种实现细节感兴趣。
每个集合都需要分别选择正确的索引类型。因此，关联类型中索引是唯一没有默认值的。

### [索引距离 IndexDistance](https://developer.apple.com/reference/swift/collection/indexdistance)

索引距离是一个带符号的整型，表示两个索引之间的距离。默认值是[整型](https://developer.apple.com/reference/swift/int)，我们没必要自己修改。

### [索引范围 Indices](https://developer.apple.com/reference/swift/collection/indices)

这是集合的 [indices](https://developer.apple.com/reference/swift/collection/1641719-indices) 属性的返回类型。它是一个包含所有索引的集合，该集合中的索引以升序排列对应初始集合的下标。注意，[endIndex](https://developer.apple.com/reference/swift/indexablebase/1782993-endindex) 不包括在内，因为 endIndex 表示”结束之后”的位置，所以不是有效的下标参数。

在 Swift 2 中，indices 属性返回一个 [Range \<Index\>](http://swiftdoc.org/v2.2/type/Range/)，可以用来遍历集合中所有的有效索引。在 Swift 3 中，Range \<Index\> [不再可迭代](https://oleb.net/blog/2016/09/swift-3-ranges)，因为索引不能自我递进（现在[由集合来推进索引迭代](https://github.com/apple/swift-evolution/blob/master/proposals/0065-collections-move-indices.md)）。Indices 类型替代了 Range \<Index\> 来实现索引的迭代。

默认的 Indices 类型十分具有想象力地命名为 [DefaultIndices \<Self\>](https://developer.apple.com/reference/swift/defaultindices)（23333）。它跟 Slice 一样，是对初始集合、起始和结束索引的一个简单封装 — 它需要保留对初始集合的引用，以便能够推进索引。如果在集合迭代索引的过程中对集合进行修改，可能会导致意想不到的性能问题：假设集合的实现使用了[写时复制（copy-on-write）](http://chris.eidhof.nl/post/struct-semantics-in-swift/)（正如标准库中的所有集合类型），迭代开始之后对集合的额外引用可能触发不必要的复制。

我们在书中广泛说明了写时复制的内容。就现在来说，知道自定义集合可以使用一个不引用初始集合的 Indices 类型就足够了，这样做是一个非常有益的优化。所有索引不依赖于集合本身的集合都可以这样使用，例如数组。如果数组的索引是一个整数类型，你可以使用 [CountableRange \<Index\>](https://developer.apple.com/reference/swift/countablerange)。以下是对自定义队列类型的定义（我们在书中实现了此类型）：

```swift
extension Queue: Collection {
    ...
    
    typealias Indices = CountableRange<Int>
    
    var indices: CountableRange<Int> {
        return startIndex..<endIndex
    }
}
```

[^1]: 请将 Indexable 和 IndexableBase 视为实现细节。这些协议被引入来解决类型系统不支持递归协议的约束，例如引用了集合本身的集合，它的关联类型就会有这种限制。<br>考虑这是[更好地支持泛型](https://github.com/apple/swift/blob/master/docs/GenericsManifesto.md)的部分，希望明年当这个让人高度期待的特性出来时，Indexable 和 IndexableBase 会被去掉，而把它们的功能放在集合内部。
