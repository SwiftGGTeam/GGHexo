title: "Swift 中序列的实现方式"
date: 2015-09-08 20:00:00  
tags: [Big O Note-Taking]  
categories: [Swift 进阶]  
permalink: Sequence-Conformance  

---
原文链接=https://bigonotetaking.wordpress.com/2015/08/20/sequence-conformance/
作者=bigonotetaker
原文日期=2015/08/22
译者=Prayer
校对=shanksyang
定稿=numbbbbb


想要遵循 `SequenceType`协议？还想要遵循 `CollectionType`，`MutableSliceable`，`RangeReplaceableCollectionType`？——需要做些什么呢？

<!--more-->

## SequenceType

遵循 `SequenceType` 是序列类型最基本的要求，任何遵循 `SequenceType` 协议的类型，都可以用 `for...in` 的方式访问，并且同时获得像 `map`，`flatMap`，`reduce`等等很酷的方法。要遵循 `SequenceType` 协议，只有一个要求：实现 `generate()` 方法，该方法要求返回值遵循 `GeneratorType` 协议。

## GeneratorType

`Generator` 是代表循环的有状态的对象。`Generator` 必须提供一个 `next()` 方法——该方法返回一个可选值。这个可选值在序列遍历完之前应该能够正确返回序列中的连续元素，直到序列遍历完，最后返回 `nil`。（协议要求 generator 只返回一次 nil：不允许在返回 nil 之后再调用 `next()`）该类型不允许通过 `for...in`访问。下面我们通过遍历一个数组，看看它的工作方式：

```swift
let nums = [1, 2, 3]
 
// nums 是一个 Array，遵循 SequenceType 协议
 
var numGenerator = nums.generate()
 
// numGenerator 是 IndexingGenerator 类型
// IndexingGenerator 遵循 GeneratorType 协议
 
numGenerator.next() // 1?
numGenerator.next() // 2?
numGenerator.next() // 3?
numGenerator.next() // nil
 
for i in nums {
  // 这里，for 循环调用了 generate() 方法
}
 
// 上面的 for 循环和下面的实现方式一样：
 
var g = nums.generate()
while let i = g.next() {
 
}
```

难点在于，`IndexingGenerator` 在遵循 `GeneratorType` 协议的同时也遵循 `SequenceType` 协议，怎么做到的呢？使用如下方式：

```swift
extension IndexingGenerator : SequenceType {
  func generate() -> IndexingGenerator {
    return self
  }
}
```

很多标准库的 generator 都采用了这种实现方式。同时，因为协议类型可以提供默认的实现方式，遵循 `GeneratorType` 协议的任何类型，都可以使其在不增加任何实现代码的基础上，同时遵循 `SequenceType` 协议：

```swift
extension SomeGenerator : SequenceType {}
```

swift 将会为你提供默认的函数实现。

## AnyGenerator

为了声明遵循某协议的一个新类型，需要完成协议要求的一堆方法，Swift 提供了一些助手类，能让生成 generator 和 sequence 更加简单。

第一个助手类是 `AnyGenerator`，它的优点在于它是 class 类型，而非 struct：因为 generator 是有状态的，class 类型在语义上更适合。（然而标准库中的 generator 都是 struct 类型：这是因为 struct 类型在迭代的时候速度更快，在定义你自己的 sequence 时，如果性能非常重要的的话，这一点你需要考虑到）

使用 `AnyGenerator` 来生成 generator 非常容易。可以将其包装在其他 generator 内，甚至可以使用闭包来表示所需要的 `next()` 方法：

```swift
var i = 1
var upToThree = anyGenerator { i <= 3 ? i++ : nil }
upToThree.next() // 1
upToThree.next() // 2
upToThree.next() // 3
upToThree.next() // nil
```

请注意，小写开头的 `anyGenerator` 是一个生成 `AnyGenerator` 的函数。（`AnyGenerator` 也遵循 `SequenceType` 协议）

## 生成一个序列

为了定制所需的序列，可以在`generator()`方法中使用 `AnyGenerator` 帮助类：

```swift
struct UpTo : SequenceType {
  private let from, to: Int
  func generate() -> AnyGenerator<Int> {
    var i = from
    return anyGenerator { i <= self.to ? nil : i++ }
  }
}
```

在 beta 5 之后的版本 `SequenceType` 存在一个问题。通过下面的 `List` 来看一下：

```swift
enum List<Element> : GeneratorType, SequenceType {
  case Nil
  indirect case Cons(Element, List<Element>)
   
  mutating func next() -> Element? {
    guard case let .Cons(x, xs) = self else { return nil }
    self = xs
    return x
  }
}
```

通过上面短短的几行代码，我们其实获得了非常多的默认提供的方法。例如 `dropFirst()` 方法：

```swift
let list = List.Cons(1, .Cons(2, .Cons(3, .Nil)))
list.dropFirst()
```

在之前，该方法只能作用于 `CollectionType` 类型。这里我们获得了一个返回 `AnySequence` 类型的默认提供的方法。在上面的 list 中，可以将 `dropFirst()` 方法优化得更加高效：

```swift
extension List {
  func dropFirst(n: Int = 1) -> List {
    switch (n, self) {
    case (0, _), (_, .Nil): return self
    case let (_, .Cons(_, xs)): return xs.dropFirst(n - 1)
    }
  }
}
```

但是现在我们会得到一个编译错误：`type 'List' does not conform to protocol 'SequenceType'`。因为我们重写了协议中的一个默认方法，所以不会获得其他默认提供的方法。Swift 为了实现切片(slicing)，期望提供一些方法，包括 `dropFirst`，`dropLast`，`prefix`等等。通过这些方法，Swift 将会自动推断出 `SubSequence` 别名(typealias)。当我们使用提供的默认实现时，类型推断出的是 `AnySequence`。而现在的情况则不同，现在是一个 `List`，所以当 Swift 去从其他的分片方法中寻找返回 list 类型的方法时，会找不到，并且告知我们，说我们没有遵循该协议。这意味着，如果你想要覆盖其中的一个方法，那么相关的其他所有方法，都需要被覆盖。

```swift
public protocol SequenceType {
    typealias Generator : GeneratorType
    typealias SubSequence
    public func generate() -> Self.Generator
    public func underestimateCount() -> Int
    public func map<T>(@noescape transform: (Self.Generator.Element) -> T) -> [T]
    public func filter(@noescape includeElement: (Self.Generator.Element) -> Bool) -> [Self.Generator.Element]
    public func forEach(@noescape body: (Self.Generator.Element) -> ())
    public func dropFirst(n: Int) -> Self.SubSequence
    public func dropLast(n: Int) -> Self.SubSequence
    public func prefix(maxLength: Int) -> Self.SubSequence
    public func suffix(maxLength: Int) -> Self.SubSequence
    public func split(maxSplit: Int, allowEmptySlices: Bool, @noescape isSeparator: (Self.Generator.Element) -> Bool) -> [Self.SubSequence]
}
```

任何返回 `Self.SubSequence` 类型的方法都需要被重新实现一次。最痛苦的是 `split`——我还没有找到该方法的特别好的实现方式。

## Indexable

这是 beta 5 版本引入的一个新协议：它实际上没有继承任何类型，下面是该协议的要求：

```swift
typealias Index : ForwardIndexType
public var startIndex: Self.Index { get }
public var endIndex: Self.Index { get }
public subscript (position: Self.Index) -> Self._Element { get }
```

`ForwardIndexType` 是所有可索引（index）类型需要遵循的基本协议——`BidirectionalIndexType` 和 `RandomAccessIndexType` 都遵循该协议。它所要求的只是提供 `Equatable`，和一个 `successor()` 方法。通过使用该类型的变量和使用下标可以让我们了解到 `IndexingGenerator` 的工作方式：

```swift
struct IndexingGenerator<Base : Indexable> : GeneratorType {
  private let base: Base
  private var i: Base.Index
  mutating func next() -> Base._Element? {
    return i == base.endIndex ? nil : base[i++]
  }
  init(_ base: Base) {
    self.base = base
    i = base.startIndex
  }
}
```

上面的代码也阐明了为什么 Swift 使用这种 "最末索引超一"(one-past-the-end)方式（`endIndex` 表示在最后的索引位置后一个，听上去有点别扭）因为索引不具有可比较性（comparable），不能够使用下面的代码来实现 `IndexingGenerator`：

```swift
mutating func next() -> Base._Element? {
  return i <= base.endIndex ? base[i++] : nil
} 
```

于是在比较的时候卡住了，因为你只能够使用 `==` 操作符。如果 `endIndex` 是最后的索引位置，那么你只能够识别出是否在索引最后一个元素，而无法得知是否已经索引超过最后一个元素。现在，可能的解决办法是使用一个标记位（一个 `finished` 布尔类型的值，或者其他变量来表示这种状态信息），但这种做法，并不高效。

关于 `IndexingGenerator` 还有一个有趣的地方：它的使用非常广泛。无论是 `Array`，`ContiguousArray`，还是 `ArraySlice`：它们都使用了 `IndexingGenerator`。有趣之处在于，你可能会认为因为 `SquenceType` 是最基本的协议，遍历要建立在该协议的基础之上。对于数组类型，确实另外一种情况：它的遍历是建立在索引（indexing）基础上的。这里面你会发现一些性能方面有趣的特性。

下面是一个例子。`enumerate()`的工作方式可能与你想象的大相径庭：它并不会返回一个 `(index, value)` 类型的元组，相反，返回的类型为 `(Int, value)`：这意味着如果你在一个 `String` 类型上使用 emuerate 方法，事实上你是不能够使用返回的元组的第一个参数来索引这个字符串的：

```swift
let word = "hello".characters
 
for (index, value) in word.enumerate() {
  print(value)
  word[index] // error
}
```

于是你可能想要定制属于你自己的 `enumerate` 函数，能够使用返回值索引你的字符串。这个问题在Twitter上引起了[广泛的讨论](https://twitter.com/publicfarley/status/630091086971699202)，尤其是关于创建一个 `forEachIndex` 函数：

```swift
extension CollectionType {
  func forEachIndex(@noescape body: (Index, Generator.Element) -> ()) {
    for (i, v) in zip(indices, self) {
      body(i, v)
    }
  }
}
```

和下面的这个方法相比：

```swift
extension CollectionType {
  func forEachIndex(@noescape body: (Index, Generator.Element) -> ()) {
    for i in indices {
      body(i, self[i])
    }
  }
}
```

第一个的性能一定更好，对吗？第二个需要一个索引查找，这个做起来应该会慢一些。第一个只是递增索引，然后取出元素。

但是事实并非如此。第二个的速度是第一个的两倍。为什么？当你通过 `self` 迭代的时候，使用的是 `IndexingGenerator`。它也并非简单的数组类型，而是 `String`。结果非常让人意外：`String` 类型的索引非常慢，因为需要确保 unicode 编码正确性。

索引 `String` 类型的时候，需要包含字符内存分配的信息（或者说需要每个字符自身的信息）。所以索引 `String` 远远没有返回多少个字符数那么简单——它与字符串本身的内容信息密切相关。

这种情况在标准库的算法中尤为要考虑到。`CollectionTypes` 类型的方法和函数*期望*索引（index）是获取元素最快的方式。这意味着以下面的做法，让 `List` 可索引，不是一个明智的选择：

```swift
extension List : Indexable {
  var startIndex: Int { return 0 }
  var endIndex: Int {
    guard case let .Cons(_, xs) = self else { return 0 }
    return xs.endIndex + 1
  }
  subscript(i: Int) -> Element {
    switch (i, self) {
    case (0, .Cons(let v, _)): return v
    case (_, .Cons(_, let x)): return x[i - 1]
    default: fatalError()
    }
  }
}
```
[Airspeed Velocity 发表了一个使 List 在 O(1) 事件复杂度索引的算法](http://airspeedvelocity.net/2015/07/26/linked-lists-enums-value-types-and-identity/)

## CollectionType

这才是序列这一类协议展现实力的地方。通过这个协议，你可以在很少的代码量基础上，获得一系列强大的方法。

```swift
public protocol CollectionType : Indexable, SequenceType {
    typealias Generator : GeneratorType = IndexingGenerator<Self>
    public func generate() -> Self.Generator
    typealias SubSequence : Indexable, SequenceType = Slice<Self>
    public subscript (position: Self.Index) -> Self.Generator.Element { get }
    public subscript (bounds: Range<Self.Index>) -> Self.SubSequence { get }
    public func prefixUpTo(end: Self.Index) -> Self.SubSequence
    public func suffixFrom(start: Self.Index) -> Self.SubSequence
    public func prefixThrough(position: Self.Index) -> Self.SubSequence
    public var isEmpty: Bool { get }
    public var count: Self.Index.Distance { get }
    public var first: Self.Generator.Element? { get }
}
```

还有两个额外的要求并没有在上述协议中得到体现：集合类要求是 `multi-pass`，`SubSequence` 应该为 `CollectionType` 类型。你可以使用一下三行代码，晚上上述要求：

```swift
struct UpTo: CollectionType {
  let startIndex = 0
  let endIndex: Int
  subscript(i: Int) -> Int { return i }
}
```

这样你就获得了一系列提供的默认方法。例如，切片（slicing）可以返回一个包装器结构体：

```swift
UpTo(endIndex: 10)[3...7] // Slice<UpTo>
```

顺便提一下，这个例子同时也说明了为什么不应该假设 `startIndex` 为0。

```swift
UpTo(endIndex: 10)[3...7].startIndex // 3
```

随着 beta 5 版本的发布，提供了更多的非常给力的方法，像 `popFirst()`，`popLast()`还有一些其他的切片方法。

## RangeReplaceableCollectionType

```swift
public protocol RangeReplaceableCollectionType : CollectionType {
    public init()
    public mutating func replaceRange<C : CollectionType where C.Generator.Element == Generator.Element>(subRange: Range<Self.Index>, with newElements: C)
    public mutating func reserveCapacity(n: Self.Index.Distance)
    public mutating func append(x: Self.Generator.Element)
    public mutating func extend<S : SequenceType where S.Generator.Element == Generator.Element>(newElements: S)
    public mutating func insert(newElement: Self.Generator.Element, atIndex i: Self.Index)
    public mutating func splice<S : CollectionType where S.Generator.Element == Generator.Element>(newElements: S, atIndex i: Self.Index)
    public mutating func removeAtIndex(i: Self.Index) -> Self.Generator.Element
    public mutating func removeFirst() -> Self.Generator.Element
    public mutating func removeFirst(n: Int)
    public mutating func removeRange(subRange: Range<Self.Index>)
    public mutating func removeAll(keepCapacity keepCapacity: Bool)
}
```

这里提供了很多的方法，但是你只需要实现最基本的三个：`replaceRange`，`init()` 和 `reserveCapacity`：该方法可以将任意一个范围内的元素替换为另一任意大小范围的元素，可以用来替换，也可以用来初始化。

## reserveCapacity

这个方法非常有趣。数组类型的元素并不一定需要是连续的（除非你使用 ContiguousArray），但是它们大部分都是连续的。正因如此，我们常常分配一段内存空间，用来存储我们的数组——特别是当我们知道数组的大致大小时。例如，`map()` 方法总是会返回和调用该方法的序列一样大小的一个数组。所以，`map()` 方法在填充数组之前，应该会使用 `reserveCapacity`。这一点可能不容易理解。`map()` 作用于 `SequenceType` 类型，不仅仅是 `CollectionType` 类型。`Sequence` 类型并没有 `count` 属性——那么如何才能得到序列的长度呢？即使它有 `count` 属性，`CollectionType` 类型的该属性，应该返回 `Index.Distance`，而对于 `reserveCapacity` 来说，需要一个 `Int` 类型。

## underestimateCount()

该方法可以作用于所有 `SequenceType` 类型。都中意义上来说，可以当作 `count` 的替身。它有一个要求：它必须是非破坏性的。它默认返回0。然而，一些标准库中的 `SequenceType` 类型能够返回它们包含的真实元素个数：如果你在为 `SequenceType` 类型创建方法的话，或者遵循 `SequenceType` 协议的话，把这点牢牢记住。

## 延迟加载

在标准库中，使用这个技巧的地方会比你想象的多得多。标准库中有一些 `SequenceType` 类型，像 Array, Set 和 Dictionary，这些都是严格求值的，同时还有名字中含有 lazy 的：`LazySequence`，`LazyForwardCollection`，`LazyBidirectionalCollection` 和 `LazyRandomAccessCollection`。这些显然都是延迟加载类型。但是还有第三类：序列类型是延迟加载的，但是把它们*当作*严格求值一样：`AnySequence`，`Zip2Sequence` 和 `EnumerateSequence`等等。（这里“当作”的意思是它们有严格求值的 `map` 和 `filter` 版本）。

> 译者注：严格求值（[strict evaluation](https://en.wikipedia.org/wiki/Evaluation_strategy#Strict_evaluation)）

为什么会有严格求值，显式延迟加载和隐式延迟加载呢？隐式延迟加载类型其实是由一些底层的序列构成的，它们只是一个包装器。为了性能的缘故，它们不会强制对底层的序列进行求值：但是为了简单方法，它们又拥有标准的 `map` 和 `filter` 方法。

为什么使用延迟加载技术呢？如果你想要一起使用序列的方法，严格求值的方式会大大降低性能。每个方法都要重新分配数组，填充数组，回收数组。然后，如果这些方法使用延迟加载技术，它们不会立即创建数组，你可以决定什么时候去创建和赋值。（[David Owens 有一篇关于这个话题的文章](http://owensd.io/2015/08/09/filter-performance.html)）

太棒了！那么我们如何充分利用延迟加载呢？对于大多数的标准库函数而言，只需要调用它们的 `lazy` 方法，随后 `map` 和 `filter` 方法都会使用管道技术。然而，`LazySequence` 是结构体类型，还不是协议类型，所以如果你想要使得自己的序列拥有延迟加载技术，你需要将它封装在 `LazySequence` 中。

如果想要写一个延迟加载方法，你有两个选择：

1. 你可以为你的方法写4个版本，每个版本对应标准库中延迟加载序列的方法。
2. 定义一个新的协议类型 `LazySequenceType`，让标准库的结构体遵循该协议：

```swift
public protocol LazySequenceType : SequenceType {}
 
extension LazySequence                : LazySequenceType {}
extension LazyForwardCollection       : LazySequenceType {}
extension LazyBidirectionalCollection : LazySequenceType {}
extension LazyRandomAccessCollection  : LazySequenceType {}
```

然后在 `LazySequenceType` 中定义一次方法就可以了。
