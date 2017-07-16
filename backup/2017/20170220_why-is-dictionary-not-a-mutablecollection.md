title: "不是所有可变的集合都叫做 MutableCollection"
date: 2017-02-20
tags: [Swift 进阶]
categories: [Ole Begemann]
permalink: why-is-dictionary-not-a-mutablecollection
keywords: 
custom_title: 
description: 

---
原文链接=https://oleb.net/blog/2017/02/why-is-dictionary-not-a-mutablecollection/
作者=Ole Begemann
原文日期=2017/02/06
译者=Cwift
校对=walkingway
定稿=CMB

<!--此处开始正文-->

[Collection](https://developer.apple.com/reference/swift/collection) 协议是 Swift 集合类型的根基。除了 Collection，标准库还提供了另外四个协议，用来扩展集合类型的功能。这些协议*改进*了 Collection —— 遵守任何一个协议的对象也必须遵守 Collection。

![](https://oleb.net/media/swift-3-collection-protocols-diagram-v2.png)

<!--more-->

它们分别是：

* [BidirectionalCollection](https://developer.apple.com/reference/swift/bidirectionalcollection)：可以向前和向后遍历的集合。比如 [String.CharacterView] (https://developer.apple.com/reference/swift/string.characterview)。（虽然在 [characters](https://developer.apple.com/reference/swift/string/1540072-characters) 集合上你不能高效地跳转到任意位置（因为[字形集群是变长的](https://oleb.net/blog/2016/08/swift-3-strings/)），但是指定下标依旧可以找到对应的 [Character](https://developer.apple.com/reference/swift/character)。）
* [RandomAccessCollection](https://developer.apple.com/reference/swift/randomaccesscollection)：可以在常量时间访问任何元素的集合。[Array](https://developer.apple.com/reference/swift/array) 就是一个规范的例子。
* [MutableCollection](https://developer.apple.com/reference/swift/mutablecollection)：支持集合通过下标的方式改变自身的元素，即 array[index] = newValue。
* [RangeReplaceableCollection](https://developer.apple.com/reference/swift/rangereplaceablecollection)：支持插入和删除任意区间的元素集合。

RandomAccessCollection 协议改进了 BidirectionalCollection 协议，因为前者是后者的严格超集 —— 任何可以有效地跳转到任意索引的集合都可以向后遍历。RandomAccessCollection 没有基于 BidirectionalCollection 提供新的 API；也就是说前者能做的事情，后者都可以做到。然而，RandomAccessCollection 严格的特性保证了遵守者中的算法只能通过随机元素访问来实现。

你可能认为 RangeReplaceableCollection 应该类似地改进于 MutableCollection，因为突变可以用插入和删除来建模，但事实并不是这样。这两个协议是在同一层的 —— 一些类型只符合 MutableCollection（例如 [UnsafeMutableBufferPointer](https://developer.apple.com/reference/swift/unsafemutablebufferpointer)），一些只适用于RangeReplaceableCollection（例如String.CharacterView），只有一部分同时遵守了两者（Array 和 [Data](https://developer.apple.com/reference/foundation/data)）。

稍后将通过一些示例来解释原因。

## Set
## MutableCollection

[MutableCollection](https://developer.apple.com/reference/swift/mutablecollection) 支持元素在原位置修改。该协议在 Collection 的基础上新增的 API 是[下标](https://developer.apple.com/reference/swift/mutablecollection/1640969-subscript)必须提供一个 setter。

[Set](https://developer.apple.com/reference/swift/set) 是一个 Collection，并且它当然是可变的。所以应该遵守 MutableCollection 协议，这看起来合情合理，但是事实并非如此。主要是因为协议的[语义](https://oleb.net/blog/2016/12/protocols-have-semantics/)。MutableCollection 允许更改集合元素的值，但是协议的文档规定：突变必须既不改变集合的长度，也不能改变元素的顺序。Set 不能满足任何一项。

首先来说保留长度的问题。Set 不能包含重复的元素，因此，如果你使用一个 Set 中已经存在的值来替换某个元素，则该 Set 会在变异后减少一个元素。

Set 也是一种无序的集合 —— 使用它的时候元素的顺序总是无序的。不过在其内部，Set 依据其构成的规则具有稳定的顺序。当你通过下标更改 MutableCollection 的遵守者时， 被更改元素的索引必须保持不变，即索引在集合中所指示的位置不能改变。Set 不能满足这个要求，因为一个 SetIndex 指向的是桶状（bucket）的内部存储结构，当内部元素变异时，该存储桶会发生变化。

## RangeReplaceableCollection

[RangeReplaceableCollection](https://developer.apple.com/reference/swift/rangereplaceablecollection) 向 Collection 中增加了两个要求：[一个空的构造器](https://developer.apple.com/reference/swift/rangereplaceablecollection/1641467-init)以便可以创建一个新的空集合，以及 [replaceSubrange(_:with:)](https://developer.apple.com/reference/swift/rangereplaceablecollection/1641256-replacesubrange) 方法，该方法用另一个集合替换当前集合指定范围中的元素。目标范围和用来替换的集合的长度可以不同，其中任何一个都可以为空。协议使用这一方法提供在任意位置移除和插入元素的默认实现。

Set 也不是一个 RangeReplaceableCollection。与它不能遵守 MutableCollection 协议的原因相同：不满足协议的[语义](https://oleb.net/blog/2016/12/protocols-have-semantics/)。

文档中对 [replaceSubrange(_:with:)](https://developer.apple.com/reference/swift/rangereplaceablecollection/1641256-replacesubrange) 方法的描述如下：从集合中删除指定范围的元素并在同一位置插入新元素。这与 “Set 在任意位置插入或移除元素都可以改变集合中元素的内部位置”的情况不兼容。然而，即便 Set 以某种方式维持内部元素顺序的稳定，RangeReplaceableCollection 协议的语义也不适合它，因为协议定义的大多数方法对 Set 都没有意义。例如，在 RangeReplaceableCollection 中 [append(_:)](https://developer.apple.com/reference/swift/rangereplaceablecollection/1641557-append) 方法的意义是在集合的尾部插入一个新元素。Set 中相关操作的正确称呼是 [insert(_:) ](https://developer.apple.com/reference/swift/set/1541375-insert)，因为你不能 append 任何元素到一个无序的集合中。

## Dictionary

[Dictionary](https://developer.apple.com/reference/swift/dictionary) 的故事与 Set 基本相同。两者都是基于哈希表实现的无序集合。（Dictionary 与 Set 是如此相似，它们在标准库中共享同一个实现，使用 [GYB 模板语言](https://lists.swift.org/pipermail/swift-users/Week-of-Mon-20151207/000226.html)生成代码。你可以在 [HashedCollections.swift.gyb](https://github.com/apple/swift/blob/master/stdlib/public/core/HashedCollections.swift.gyb) 中找到相关资料）因此，由于相同的原因 Dictionary 不能遵守 MutableCollection 和 RangeReplaceableCollection。

另外一个方面是 Dictionary 独有的。字典的元素类型 —— 即它把 Collection 指定的关联类型 [Iterator.Element](https://developer.apple.com/reference/swift/iteratorprotocol/element) 特化后的类型 —— 是一个 [(Key, Value) ](https://developer.apple.com/reference/swift/dictionary/element) 类型的元组：

```swift
struct Dictionary<Key: Hashable, Value>: Collection {
    typealias Element = (key: Key, value: Value)
    typealias Index = DictionaryIndex<Key, Value>

    subscript(position: Index) -> Element {
        ...
    }
    ...
}
```

这意味着在字典中所有从 Collection 和 Sequence 继承来的 API 都会将 (Key, Value) 作为字典的元素。所以当你在 for 循环中遍历一个 Dictionary 时，得到一个（Key，Value）。

[Index](https://developer.apple.com/reference/swift/dictionary.index) 是一个完全独立的类型，并且与 Key 的类型没有任何关联。因此，你所熟悉的接受一个 Key 并返回一个 Optional<Value> 的[下标](https://developer.apple.com/reference/swift/dictionary/1540848-subscript)并不是 Collection 协议所提供的下标。相反，它是直接在 Dictionary 上定义的，与 Collection 毫无关联。大多数情况下你会使用 Dictionary 特定的下标，但是 Collection 中的变体依旧存在：

```swift
let dict = ["Berlin": 1237, "New York": 1626]
dict["Berlin"] // returns Optional<Int>
for index in dict.indices {
    dict[index] // returns (key: String, value: Int) (not optional!)
}
```

如果字典从 MutableCollection 和/或RangeReplaceableCollection 中获取方法，方法需要同时操作 Index 的值以及 (Key, Value) ，即使从实现上来说可以做到兼容二者，但是这种一致性可能不值得投入精力。

## 结论

Sequence 和 Collection 组成了 Swift 中集合类型的根基。而专门性的集合类型 BidirectionalCollection、RandomAccessCollection、MutableCollection 和 RandomAccessCollection 对你自定义的类型和算法的功能和性能特性提供了非常细粒度的控制。[语义](https://oleb.net/blog/2016/12/protocols-have-semantics/)是决定类型是否应该遵守这些协议中的一个或多个的重要因素。

在[下一篇文章](https://oleb.net/blog/2017/02/why-is-string-characterview-not-a-mutablecollection/)中，我将讨论一个符合专门性集合协议上下文的有趣类型：[ String.CharacterView](https://developer.apple.com/reference/swift/string.characterview)。