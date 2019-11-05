title: "分析复杂度"
date: 2019-11-06
tags: [Swift, Algorithm, Complexity]
categories: [khanlou, iOS]
permalink: analyzing-complexity
keywords: [Swift, Swift Algorithm]
custom_title: "分析复杂度"
description: "本文介绍了在 Swift 中如何对一些集合类型的操作进行性能分析与优化。"

---

原文链接=http://khanlou.com/2018/12/analyzing-complexity/
作者=Soroush Khanlou
原文日期=2018-12-17
译者=Roc Zhang
校对=numbbbbb,WAMaker
定稿=Pancf

<!--此处开始正文-->

在 Dave Abraham 的 WWDC 演讲 [Embracing Algorithms（拥抱算法）](https://developer.apple.com/videos/play/wwdc2018/223/#)中，谈到了要发现通用的算法，并将其提取到通用且可测试的函数中。在这个方向上，我发现一些对集合类型的多次操作可以被聚齐起来，合并成单次操作。并且通常情况下，这些操作被合并之后还能带来性能上的收获。

<!--more-->

第一个例子是 Swift 3 添加的一个方法:

```swift
// 当你看到:
myArray.filter({ /* some test */ }).first

// 你应该把它改成:
myArray.first(where: { /* some test */ })
```

这里两种写法的断言描述闭包和操作结果都完全相同，但下面的写法更简短，语义更清晰，而且性能更好。因为它不会进行新数组的分配，也不需要对数组中每一个元素是否能够通过测试都进行判断，只需要找出第一个就好了。

另一个例子是 [我帮助添加到 Swift 5](https://github.com/apple/swift-evolution/blob/master/proposals/0220-count-where.md) 中的 `count(where:)` 函数:

```swift
// 当你看到:
myArray.filter({ /* some test */ }).count

// 你应该把它改成:
myArray.count(where: { /* some test */ })
```

这又是一个更短、更清晰而且更快的例子。没有额外要被分配的数组，也没有多余的操作。

在我们的一个项目中，有一个通用的范式，需要先将集合进行 `sort`，随后再进行 `prefix` 操作。例如下述的示例代码，需要找出前 20 张最新创建的图像：

```swift
return images
    .sorted(by: { $0.createdAt > $1.createdAt })
    .prefix(20)
```

同样，也可以想象成在排行榜中找到前 5 位得分最高的用户，也需要使用这类范式。

我盯着这段代码直到我的眼睛开始流血，感到这段代码可能存在问题。我首先想到的是分析它的时间复杂度。如果把原始数组的长度用 n 表示，再把最后想要得到的元素的数目用 m 表示，在分析代码之后可以得出，排序的复杂度是 O(nlogn)，取前子集合的操作则更快，时间复杂度为 O(1)（取前子集合操作本身最慢时可能会达到 O(m)，但对这里我们要处理的数组而言，由于它是可随机访问的集合，因此取前子集合操作能在常数时间中完成）。

这正是让我感到困惑的地方：获取一个序列的最小元素（使用 `min()` 函数）只需要单次遍历所有元素，或者说时间复杂度为 O(n)。将其所有元素进行完整排序需要的时间复杂度是 O(nlogn)。而从集合中获取 m 个数，当 m 比 n 小时，时间复杂度应该位于它们之间。且当 m 比 n 小非常多时，时间复杂度应该更接近 O(n)。

在我们的例子里，图片的数量会非常大（n 约为 55000），而我们想得到的元素数量却很小（m 为 20）。因此，这里应该存在有优化的空间。我们是否能够优化排序，使其仅排序出前 m 个元素？

答案是肯定的，我们能够在这个方向上进行一些优化。我将此函数命名为 `smallest(_:by:)`，它接收 `sort` 和 `prefix` 函数的所有参数，也就是上面提到的 m 和用于排序做比较的闭包：

```swift
func smallest(_ m: Int, by areInIncreasingOrder: (Element, Element) -> Bool) -> [Element] {
```

首先从排序前 m 个元素开始（因为 m 比序列的总长度要小很多，所以此操作会进行的很快）：

```swift
var result = self.prefix(m).sorted(by: areInIncreasingOrder)
```

然后我们再遍历所有剩下的元素：

```swift
for element in self.dropFirst(m) {
```

对集合中剩下的每一个元素，我们需要找到 `result` 中第一个比它大的项的索引。通过 `areInIncreasingOrder` 函数，我们把 `element` 作为第一个参数传入，再把 `result` 中的元素作为第二个参数传入。

```swift
if let insertionIndex = result.index(where: { areInIncreasingOrder(element, $0) }) { // 译者注：此方法在 Swift 4.2 后已更名为 `firstIndex(where:)`
```

如果能够找到符合条件的索引值，这就表示存在有比我们 `result` 数组中的元素更小的值。我们把新的值插入到计算出的索引的位置，它便会被正确的排序：

```swift
result.insert(element, at: insertionIndex)
```

再将最后一个元素移除（因为我们只需要 m 个元素）：

```swift
result.removeLast()
```

如果没有找到满足条件的索引，我们就可以忽略这个值。最后，当 `for` 循环完成，便可将 `result` 返回。

完整的函数如下所示：

```swift
extension Sequence {
    func smallest(_ m: Int, by areInIncreasingOrder: (Element, Element) -> Bool) -> [Element] {
        var result = self.prefix(m).sorted(by: areInIncreasingOrder)
        	
        for e in self.dropFirst(n) {
            if let insertionIndex = result.index(where: { areInIncreasingOrder(e, $0) }) {
                result.insert(e, at: insertionIndex)
                result.removeLast()
            }
        }
        
        return result
    }
}
```

如果这让你想起了之前在计算机科学中学过的课程，那就再好不过了。实际上这里的算法就类似于选择排序的过程（但它们并非完全相同，因为这里会预先排序一部分元素，而选择排序则不同，是可变序列算法（mutating algorithm））。

这里的时间复杂度分析起来可能会有些困难，但是我们还是可以尝试进行分析。初始部分的排序是 O(mlogm)，外层的循环是 O(n)。每次的循环中，会分别调用时间复杂度都为 O(m) 的 `index(where:)` 和 `insert(_:at:)`（插入操作的时间复杂度是 O(m) 的原因在于，它可能需要将所有的元素后移，为新元素腾出空间）。因此，总时间复杂度应为 O(mlogm + n * (m + m))，或者说 O(mlogm + 2nm)。常数项被移除后，留下的则是 O(mlogm + nm)。

当 m 比 n 小得多时，m 项会接近于常数，最终我们得到的会是 O(n)。相较于之前的 O(nlogn) 而言，这是一个巨大的改进。对应到之前提到的 55000 张图片的例子，这可能会是多达 5 倍的性能提升。

大体上来说，这里的函数是对 `prefix` + `sort` 函数的优化。但我还想要再讨论两处更细小一些的优化。

一处唾手可得的优化是：我们是在 55000 个元素的数组中查找 20 个最小的元素，其中我们检查的大部分（几乎是全部）元素不会落入到最后的 `result` 数组中。因此我们可以去检查元素是否比 `result` 数组中的最后一个元素要大，如果是，它就完全可以被跳过。因为当元素比 `result` 中的最后一个还要大时，再去查找插入的索引就没有任何意义了。

```swift
if let last = result.last, areInIncreasingOrder(last, e) { continue }
```

在测试中，此处增加的判断可以减少线性搜索 `result` 数组 99.5% 的时间，算法整体上又会加快十倍左右。感谢 [Greg Titus](https://twitter.com/gregtitus) 告诉我此处可以优化──之前我完全没有想到这一点。

如果想更近一步的话，还可以做另一处（稍微难实现一些）的优化。此优化基于两处事实：第一，我们使用 `index(where:)` 来找出应在 `result` 数组中进行插入的位置；第二，`result` 数组总是保持有序的。`index(where:)` 通常情况下是一项线性操作，但如果是在一个已经排好序的数组中进行搜索，我们可以将线性搜索替换成二分搜索。我对此进行了尝试。

为了能够更好的理解这些优化会如何影响算法的性能，Nate Cook 帮助我了解了 Karoy Lorentey 的 [Attabench 工具](https://github.com/attaswift/Attabench)，它能够对这些解决方案进行基准测试。因为截止目前，我们对复杂度的分析都是停留在理论层面的，在真正对代码进行实际测试之前（最理想的情况应该是在真实的设备上），所有的结论都只是有根据的推测。例如，通常来说排序的复杂度为 O(nlogn)，但不同的算法处理不同类型的数据时，其表现也会有所不同。具体来说，已经排好序的数据在特定的算法中可能会变得更快或更慢。

Attabench 的执行结果如下：

![](http://khanlou.com/images/SmallestNProfile.png)

（我还添加了一个 [由 Time Vermuelen 所写的优先队列/堆解决方案](https://gist.github.com/timvermeulen/2174f84ade2d1f97c4d994b7a3156454)，因为有些人好奇它与其他方案比较起来表现如何。）

首先，我对在数组中进行单次搜索比对数组进行完整排序要快的猜测是正确的。尤其是在实际问题中序列可能会很长，排序的性能则会变得更差，但我们的“简单优化”（图中的 “Naive Optimization”）却能保持在常数水平上（Y 轴表示的是单个元素上所花的时间，而不是总时间。这意味着 O(n) 的算法在图中会是一条直线）。

第二，对最后一个元素的检查（图中的 “Last Check”）和二分搜索优化在独立运行时具有几乎完全相同的性能表现（实际上你可能没法看到橘色和黄色的线，因为它们被绿线挡住了），把它们放在一起使用时也是一样。但是由于二分搜索难以编写，[甚至更难把它写对](https://ai.googleblog.com/2006/06/extra-extra-read-all-about-it-nearly.html)，你也可以说把它加上是不值得的。

对我而言，这里传递出的关键信息是测量和优化很难。虽然分析复杂度这件事听起来有些学术：“我什么时候会在自己的职业生涯上用到这个？” 有人会问。但理解你的算法的时间和空间复杂度能够帮助你决定向哪个方向进行探索。在这个例子中，理解排序的时间复杂度引导我们对问题产生了概括性的认知，得到成果。最后，通过使用各种数据进行的进一步的基准测试与分析，能告诉我们代码在生产环境下将如何运作的最准确的信息。

下一次再看到 `sort` 后面紧跟着一个 `prefix` 时，不妨考虑将它替换成 `smallest(_: by:)`？ 
