title: "初探 Swift Sequences 和 Generators"
date: 2016-03-10
tags: [Swift 进阶]
categories: [uraimo]
permalink: experimenting-with-swift-2-sequencetype-generatortype
keywords: swift sequencetype,swift generatortype
custom_title: 
description: 对于Swift自定义序列不明白的可以来看下本文，讲解了Swift Sequencestype和Swift Generatorstype。

---
原文链接=https://www.uraimo.com/2015/11/12/experimenting-with-swift-2-sequencetype-generatortype/
作者=uraimo
原文日期=2015-11-12
译者=CoderAFI
校对=Cee
定稿=numbbbbb

<!--此处开始正文-->

在这篇文章中我们将介绍 Swift 2 自定义序列，并举例说明有限序列和无限序列的区别，本文是 [Swift and the functional approach](https://www.uraimo.com/category/functional/) 系列其中一篇。

![sequences](https://swift.gg/img/articles/experimenting-with-swift-2-sequencetype-generatortype/sequences.png1457572217.60734)

> 你可以访问 [GitHub](https://github.com/uraimo/Swift-Playgrounds/) 或下载 [zip 文件](https://github.com/uraimo/Swift-Playgrounds/raw/master/archives/2015-11-12-SequenceTypeGeneratorTypePlayground.playground.zip)来获取本文示例程序的 playground。

<!--more-->

`SequenceType` 标准协议在官方文档中被定义为一种简单的数据类型，该类型可以用 `for...in` 来循环遍历。协议中最重要的定义是在上半部分：

```swift
public protocol SequenceType {
    typealias Generator : GeneratorType
	/// Return a *generator* over the elements of this *sequence*.
    ///
    /// - Complexity: O(1).
	public func generate() -> Self.Generator
	...
	...
}
```

上面的协议中关联了另一个 `GeneratorType` 协议类型（Swift 让协议泛型化的独特方式）。当我们要自定义序列的时候，我们同时也要自定义一个实现这个协议的生成器，保证我们自定义的 `SequenceType` 在调用 `generate()` 方法时能够返回指定元素类型的生成器。

序列协议中提供了许多有意思的方法，这些方法很多都已经在扩展中实现了，例如 **map**、**flatmap**（深入了解可以参看 [map and flatMap](http://www.uraimo.com/2015/10/08/Swift2-map-flatmap-demystified/)）、**filter**、**reduce**、**subsequence functions** 等。

这些方法让 `SequenceType` 协议的作用远远大于只进行 for each 遍历。

让我们来看下 `GeneratorType` 的定义：

```swift
public protocol GeneratorType {
    typealias Element
    /// Advance to the next element and return it, or `nil` if no next
    /// element exists.
    public mutating func next() -> Self.Element?
}
```

这个简单的协议只包含了一个 `next()` 方法，该方法用来返回生成器管理的下一个元素。至关重要的一点是，当序列遍历到最后时，生成器应该返回 *nil*。接下来当我们构造一个无限序列的时候，来看看为什么这里要返回 `nil`。

首先，我们来写一个简单的斐波那契数序列生成器：

```swift
class FibonacciGenerator : GeneratorType {
    var last = (0,1)
    var endAt:Int
    var lastIteration = 0

    init(end:Int){
        endAt = end
    }

    func next() -> Int?{
        guard lastIteration<endAt else {
            return nil
        }
        lastIteration++

        let next = last.0
        last = (last.1,last.0+last.1)
        return next
    }
}
```

为了定义一个有限序列，我们需要一个自定义构造函数来指定一个序列长度。当到达这个长度时 `next()` 方法就返回 *nil*。这里我们用元组（Tuple）实现起来会节省很多代码量，让我们看下如何使用这个生成器：

```swift
var fg = FibonacciGenerator(end:10)

while let fib = fg.next() {
    print(fib)
}
```

用这种方式我们就可以遍历生成器中的元素，直到生成器返回 *nil*。

根据这个生成器实现一个 `SequenceType` 轻而易举。

```swift
class FibonacciSequence : SequenceType {
    var endAt:Int

    init(end:Int){
        endAt = end
    }

    func generate() -> FibonacciGenerator{
        return FibonacciGenerator(end: endAt)
    }
}

let arr = Array(FibonacciSequence(end:10))

for f in FibonacciSequence(end: 10) {
    print(f)
}
```

上面的序列正如预期那样，可以在 foreach 遍历中使用，同样也可以用来生成其他类型的序列，比如数组。

其实我们没有必要单独定义一种生成器类型，我们可以用 `anyGenerator` 工具方法和 `AnyGenerator<T>` 类来降低序列定义的耦合性：

```swift
class CompactFibonacciSequence : SequenceType {
    var endAt:Int

    init(end:Int){
        endAt = end
    }

    func generate() -> AnyGenerator<Int> {
        var last = (0,1)
        var lastIteration = 0

        return anyGenerator({
            guard lastIteration<self.endAt else {
                return nil
            }
            lastIteration++

            let next = last.0
            last = (last.1,last.0+last.1)
            return next
        })
    }
}
```

这种定义方式跟上面序列的最终效果是一样的。唯一的区别就是 `generate` 方法返回了 `AnyGenerator<Int>` 类型。它已经不是我们开始的时候定义的简单*生成器类型*。

这种做法在这里看起来可能没太大用处，但是在很多情况下，相较于让一个生成器嵌入一个序列集合中，用一个简单 `anyGenerator()` 方法来生成的序列更具扩展性。

例如，我们用 [Lucas 序列](https://en.wikipedia.org/wiki/Lucas_number)的前 10 个数来创建一个序列。Lucas 序列与斐波那契序列非常相似，不同之处是斐波那契序列以 0，1 开头而 Lucas 序列以 2，1 开头，所以当然最终会生成截然不同的序列，例如：2，1，3，4，7，11，18，29...下面我们只定义一个生成器，并用它来初始化一个数组。

```swift
var last = (2,1)
var c = 0

let lucas = anyGenerator{
    ()->Int? in
    guard c<10 else {
        return nil
    }

    c++
    let next = last.0
    last = (last.1,last.0+last.1)
    return next
}

let a = Array(lucas) //[2, 1, 3, 4, 7, 11, 18, 29, 47, 76]
```

看起来不错，我们删除了一些无用的代码，我们也可以扩展我们的算法，让它返回一个[黄金分割比](http://www.wikiwand.com/en/Golden_ratio)，让我们试试：

```swift
import Darwin

let Phi = (sqrt(5)+1.0)/2
let phi = 1/Phi

func luc(n:Int)->Int {
    return Int(pow(Phi, Double(n))+pow(-phi,Double(n)))
}

c = 0
var compactLucas = anyGenerator{ c<10 ? luc(c++): nil }

let a2 = Array(compactLucas) //[2, 1, 3, 4, 7, 11, 18, 29, 47, 76]
```

这样确实行得通吗？当然，你可以下载 [playground](https://github.com/uraimo/Swift-Playgrounds/) 或[打包的 zip 文件](https://raw.githubusercontent.com/uraimo/Swift-Playgrounds/master/archives/2015-11-12-SequenceTypeGeneratorTypePlayground.playground.zip)来验证。

为了尝试 `SequenceType` 提供的一些特性方法。我们构建一个只返回偶数的 Lucas 数字序列：

```swift
c = 0
var evenCompactLucas = anyGenerator{ c<10 ? luc(c++): nil }.filter({$0 % 2 == 0})
let a3 = Array(evenCompactLucas) //[2, 4, 18, 76]
```

注意，这里我们其实是重新定义了 `AnyGenerator`，由于前面的序列是有限的，当遍历到最后时，就会产生另一个有限的序列。这从另一方面也可以说明，我们很容易就能改变原有序列，返回一组新的数据集。我们也可以用 map 方法来做一些更直接的转换。

### 无限序列

现在，我们移除 nil 的返回值限制，这样就能根据 Lucas 算法生成一个无限序列。

```swift
c = 0
var infiniteLucas = anyGenerator{luc(c++)}
```

可见，将一个有限序列转换成无限序列是非常容易的。现在我们生成了一个没有数量限制的新序列。但是我们需要另外一种方式来限制序列元素数，从而让无限序列元素数更可控。

幸运的是 `SequenceType` 协议提供了一个方法来解决这个问题：

```swift
let a4 = Array(infiniteLucas.prefix(10)) //[2, 1, 3, 4, 7, 11, 18, 29, 47, 76]

for var f in infiniteLucas.prefix(10){
    print(f)
}
```

这种方式将会从当前序列筛选出 10 个元素并添加到一个新的序列中，而且新序列使用起来跟前面的无限序列是一样的。

让我们进一步来看一下 *filter* 方法的用法，看看怎么样用它来获取 Lucas 偶数。

```swift
var onlyEvenLucas = infiniteLucas.filter({$0 % 2 == 0})
for var f in onlyEvenLucas.prefix(10){
    print(f)
}
```

*然而，上面的代码并不会像预期那样工作。*

如果是在 playground 运行，在声明 `onlyEventLucas` 时你会看到高亮报错。如果是在应用程序中写了这段代码，你的应用程序会崩溃。

要了解问题的原因，必须要了解 *filter* 函数的工作原理。 当对一个序列进行 filter 操作时，我们
必须要把序列的所有元素都获取到，但是如果没有 *nil* 限制，序列元素是无限的，就无法确认元素的遍历操作什么时候结束。

让我们在每次从生成器获取元素时都打印一段文本，来更形象的看下原因：

```swift
class InfiniteSequence :SequenceType {
    func generate() -> AnyGenerator<Int> {
        var i = 0
        return anyGenerator({
            print("# Returning "+String(i))
            return i++
        })
    }
}

var fs = InfiniteSequence().filter({$0 % 2 == 0}).generate()

for i in 1...5 {
    print(fs.next())
}
```

如果你运行这段代码，会发现在 `InfiniteSequence` 上的过滤处理一直在运行，*直到一段时间后处理器无法再继续运行，程序就崩溃了。*

幸运的是，解决上面的问题也很容易。我们只需要**延迟计算（Lazily evaluate)**这个无限的 Lucas 序列：

```swift
var onlyEvenLucas = infiniteLucas.lazy.filter({$0 % 2 == 0})
for var f in onlyEvenLucas.prefix(10){
    print(f)
}
```

使用无限序列的 `.lazy` 属性就能获取一个新的 `LazySequenceType` 类型，该类型会让 **map**、**flatmap**、**reduce** 或者 **filter** 这些方法延迟执行，也就是说真正的计算会等到例如 `next` 这样的终端操作（Terminal Operation）（其他语言是这么叫的）执行时才会被执行。

让无限序列支持延迟计算是一个必要步骤，默认情况下 Swift 的序列不能延迟计算（该特性是在 Swift 1.0 发布的）。具体你可以通过[官方文档](http://swiftdoc.org/v2.1/protocol/LazySequenceType/)来详细了解如何自定义一个 *LazySequence*（大多数情况可能是解决问题的最好办法），我也会就该内容进行讲解，敬请期待。
