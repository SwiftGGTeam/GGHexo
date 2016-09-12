title: "我是否应该使用生成器(Generator)？"
date: 2016-04-14 09:00:00
tags: [Swift 进阶]
categories: [Erica Sadun]
permalink: should-i-be-using-a-generator-or-not
keywords: swift generatortype
custom_title: 
description: 很多人在需要生成无限序列的时候想必会考虑要不要弄个 Generator 生成器呢，下面就来讨论下该不该用吧。

---
原文链接=http://ericasadun.com/2016/03/17/should-i-be-using-a-generator-or-not/
作者=Erica Sadun
原文日期=2016-03-17
译者=Lanford3_3
校对=shanks
定稿=小锅

<!--此处开始正文-->

我面临着这样的情况：我要实现一个无限的序列，它不断地来回生成区间 [min, max] 中的整数，所以最初我想的是，“让我弄个生成器（Generator）来搞定它吧”。（我并不是想讨论这个生成器写得好不好，我只想知道在这里我是不是应该使用生成器。）

<!-- more -->

```swift
public struct UpAndDownIntGenerator: GeneratorType {
    public typealias Element = Int
    let (magnitude, period): (Int, Int)
    let minValue: Int
    var currentOffset: Int = 0

    public init(minValue: Int = 0, maxValue: Int) {
        assert(minValue < maxValue, "minValue must be less than maxValue")
        self.minValue = minValue
        magnitude = maxValue - minValue
        period = magnitude * 2
    }

    public mutating func next() -> Int? {
        let value = currentOffset % period
        let adjustedValue = value % magnitude
        let isAscending = value < magnitude
        defer { currentOffset += 1 }
        return minValue + (isAscending
            ? adjustedValue
            : magnitude - adjustedValue)
    }
}
```

但这个生成器永远不会停止，而且我们知道它的返回值总是非空值。所以我加了这段：

```swift
    // 这不会被输入到一个序列中
    // 所以获取下一个值并检测是否为 nil
    public mutating func fetchNextValue() -> Element {
        guard let value = next() else {
            fatalError("unable to generate next value")
        }
        return value
    }
```

> 译者注: `GeneratorType` 的 `next()` 方法返回的是可选值，而在本文的情境中，返回值不可能是空的，所以作者加了上面的方法来使得得到的返回值不是可选值。

然后我就想啊：为什么要为这带有额外开销的生成器所烦扰？为什么我要创造带有生成器特质但是并不适用于序列的东西？（举个例子，对一个无限序列做 map 或 filter 操作，或者只是想办法每次取出序列中的一个值）。 所以我又写了这个：

```swift
public struct UpAndDownProducer {
    let (magnitude, period): (Int, Int)
    let minValue: Int
    var currentOffset: Int = 0

    public init(minValue: Int = 0, maxValue: Int) {
        assert(minValue < maxValue, 
            "minValue must be less than maxValue") 
        self.minValue = minValue 
        magnitude = maxValue - minValue 
        period = magnitude * 2 
    }

    public mutating func next() -> Int {
        let value = currentOffset % period
        let adjustedValue = value % magnitude
        let isAscending = value < magnitude
        defer { currentOffset += 1 }
        return minValue + (isAscending 
            ? adjustedValue 
            : magnitude - adjustedValue)
    } 
}
```

所以我到底应该怎么做？非常感谢你们的建议。

p.s. 下面是一个更简单的方法：

```swift
public struct UpAndDownProducer {
    let minValue, maxValue: Int
    var currentValue: Int
    var direction = -1
    
    public init(minValue: Int = 0, maxValue: Int) {
        assert(minValue != maxValue,
            "No point going up and down between two equal values")

       // Since it starts at minValue, it's
       // going to flip immediately.
       if maxValue < minValue { direction = 1 }
       currentValue = minValue 
       (self.minValue, self.maxValue) = (minValue, maxValue) 
    } 

    public mutating func next() -> Int {
        defer {
            if currentValue == minValue || currentValue == maxValue {
                direction *= -1
            }
            currentValue += direction
        }
        return currentValue
    }
}
```

p.p.s Davide De Franceschi 给出了他的建议，见下面的代码：

```swift
protocol EndlessGeneratorType: GeneratorType {}
extension EndlessGeneratorType {
    public mutating func someNext() -> Element {
        guard let element = next() else { 
            fatalError("EndlessGeneratorType must always have a next() element") 
        }
        return element
    }
}
```

他是这样说的：

[Davide De Franceschi](https://twitter.com/DeFrenZ?ref_src=twsrc%5Etfw): 以我浅见，最好遵从相关协议：为了现在 + 未来 + 第三方自由拓展着想

[Joe Groff](https://twitter.com/jckarter?ref_src=twsrc%5Etfw) 的跟帖: 如果你要做的事和 SequenceType 无关，那么使用 GeneratorType 本身并不有趣


> 译者的总结：本文主要是作者希望讨论下什么时候该使用 `GeneratorType`。因为文中作者的需求虽然第一感觉就是用 `GeneratorType` 来实现，但是实际上 `GeneratorType` 的 `next()` 方法返回的是可选值，要得到作者需要的非可选的返回值需要自己对 `next()` 返回的值进行处理才行，由此作者认为使用 `GeneratorType` 是多此一举，还不如写一个能直接返回非可选值的实现。作者最后的 p.p.s 中展示的意见是在协议中对 `next()` 返回值做处理，这样也便于未来的拓展和维护。有些跟帖和评论的意见是，脱离 `SequencyType` 使用 `GeneratorType` 没什么意义，`GeneratorType` 应该用在确实有必要使用的地方。