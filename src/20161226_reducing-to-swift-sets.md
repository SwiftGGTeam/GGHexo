title: "Swift 集合的 reduce 操作"
date: 2016-12-26
tags: [Swift]
categories: [Erica Sadun]
permalink: reducing-to-swift-sets
keywords: reduce, set
custom_title: 
description: 

---
原文链接=http://ericasadun.com/2016/12/21/reducing-to-swift-sets/
作者=Erica Sadun
原文日期=2016-12-21
译者=星夜暮晨
校对=Crystal Sun
定稿=CMB

<!--此处开始正文-->

一位朋友问我：「在对集合执行 `reduce` 操作的时候，是否有比 `.reduce(Set<String>()) { $0.union(CollectionOfOne($1)) }` 更好的方法？」。这位朋友需要从一个外部数据源中获取相关的数据结果，然后将其填充到集合里。

<!--more-->

我们就如何实现这一点提出了一些想法。在获取所有项目（item）之前，是否需要对集合进行检索呢？（答案是不需要）数据集是否会过于庞大，以至于不可能在创建集合之前将中间结果存储到数组当中？（答案是不会）。

我构建了一套测试，首先尝试他的 `reduce` 方法，此外也尝试了通常所使用的 `insert` 等多种操作。我事前以为使用 `Set` 的构造器来处理已预先计算 (pre-computed) 的数组可能是最好的方法，但是事实证明：`union` 和 `insert` 在重复测试中的表现更好。

```swift
timetest("initializer") { //  0.652348856034223
    var x: Set<String> = []
    (1 ... 5_000).forEach { _ in
        x = Set(letters)
    }
}

timetest("union") { // 0.524669112986885
    var x: Set<String> = []
    (1 ... 5_000).forEach { _ in
        x = x.union(letters)
    }
}

timetest("insert") { // 0.572339564969297
    var x: Set<String> = []
    (1 ... 5_000).forEach { _ in
        x = []
        letters.forEach ({ x.insert($0) })
    }
}

timetest("reduce") { //  0.762973523989785
    (1 ... 5_000).forEach { _ in
        var x = letters.reduce(Set<String>()) {
            $0.union(CollectionOfOne($1))
        }
    }
}
```

这结果令我感到惊讶，因为您可能会觉得 `init<Source : Sequence where Source.Iterator.Element == Element>(_ sequence: Source)` 以及 `func union<S : Sequence where S.Iterator.Element == Element>(_ other: S) -> Set<Element>` 拥有相同的性能。

不过我不感到惊讶的一点是：比起将中间数据存储在数组当中并籍此来直接构建集合，使用 `reduce` 来不停地构建集合的性能开销要大很多。只要数组的尺寸受到合理的限制（需要足够大，但是也不能太大，否则就会对应用内存造成负担），那么使用中间数组无疑是一个更好的办法。不过对于海量数据而言，`Set(collectedResults)` 的性能比 `insert`、`formUnion` 以及 `reduce/union` 更优异。