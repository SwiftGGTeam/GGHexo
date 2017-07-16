title: "泛型范围的用法"
date: 2016-12-23
tags: [Swift 入门]
categories: [Ole Begemann]
permalink: generic-range-algorithms
keywords: swift泛型
custom_title: 
description: 在 Swift 中对泛型参数做很多约束后，泛型代码可能更难阅读，那么泛型适用于哪些范围呢，本文就来探讨下。

---
原文链接=https://oleb.net/blog/2016/10/generic-range-algorithms/
作者=Ole Begemann
原文日期=2016-10-13
译者=Cwift
校对=walkingway
定稿=CMB

<!--此处开始正文-->

我在[前面的文章](https://oleb.net/blog/2016/09/swift-3-ranges/#converting-between-half-open-and-closed-ranges)中提到过，Swift 中有两个基础的区间（Range）类型：[Range](https://developer.apple.com/reference/swift/range) 和 [ClosedRange](https://developer.apple.com/reference/swift/closedrange)，并且这两个类型不能互相转换。这使得编写一个同时适用于两种区间类型的函数变得很困难。

昨天，swift-users 的邮件列表中有人问了一个具体的问题：假设你写了一个名为 `random` 的函数，它接受一个整数的区间，并返回一个该范围中的随机值：

```swift
import Darwin //在 Linux 上也可以用 Glibc

func random(from range: Range<Int>) -> Int {
    let distance = range.upperBound - range.lowerBound
    let rnd = arc4random_uniform(UInt32(distance))
    return range.lowerBound + Int(rnd)
}
```

你可以使用一个半开的区间调用这个函数：

```swift
let random1 = random(from: 1..<10)
```

但是你不能传入一个闭合的区间：

```swift
let random2 = random(from: 1...9) // error
```

太差劲了，什么是最好的解决方案？

<!--more-->

## 重载

一个方案是重载这个 `random` 随机函数，给 `random` 函数家族增加一个新成员，新的随机函数接受一个 `ClosedRange` 类型的参数。然后在内部通过调用原有的函数实现其功能：

```swift
func random(from range: ClosedRange<Int>) -> Int {
    return random(from: range.lowerBound ..< range.upperBound+1)
}
```

如果输入范围的上限为 `Int.max`，这个方法将失败，因为这样的范围无法生成一个对应的半开区间。然而，不过在我们的例子中这个问题无伤大雅，因为 `arc4random_uniform` 函数只能处理 32 位的整数，程序不会被边界问题所影响，因为早在转换成 `UInt32` 的时候就 crash 掉了。

## 可计数区间是能够转换的

由于这个特定的例子只涉及整数区间，因此我们还有另一个方案。基于整数的区间都是可以计数的，可计数的区间对应的半开区间 [CountableRange](https://developer.apple.com/reference/swift/countablerange) 和闭合区间 [CountableClosedRange](https://developer.apple.com/reference/swift/countableclosedrange) 可以互相转换。所以我们可以把参数改为 `CountableRange`：

```swift
func random(from range: CountableRange<Int>) -> Int {
    // 相同的实现
    ...
}
```

现在我们可以向函数中传入闭合的区间了，但是首先要把参数显式地转换成 `CountableRange`，这种方式不是很好（也不够直观）：

```swift
// 用法与之前相同
let random3 = random(from: 1..<10)
// 需要显式转换类型
let random4 = random(from: CountableRange(1...9))
```

现在你可能会想，没问题，让我们来重载闭合区间的运算符 `...` ，返回一个半开的区间，就像这样（我从当前版本的标准库中拷贝了这份声明，仅仅把返回类型从 `CountableClosedRange` 更改为 `CountableRange`）：

```swift
func ...<Bound>(minimum: Bound, maximum: Bound) -> CountableRange<Bound>
    where Bound: _Strideable & Comparable, Bound.Stride: SignedInteger {
    return CountableRange(uncheckedBounds: (lower: minimum, upper: maximum.advanced(by: 1)))
}
```

这样做可以解决我们之前的问题，不幸的是这种做法带来了新的问题，因为当没有显式地注明类型信息时，像 1...9 这样的表达式的类型是模棱两可的——编译器无法决定使用哪个重载。所以这也不是一个好方案。

## 通过识别基本接口编写通用代码

我写这篇文章是因为霍曼·梅尔在邮件列表上提出了一个[非常好的建议](https://lists.swift.org/pipermail/swift-users/Week-of-Mon-20161010/003654.html)：如果在这个算法中，区间不是最佳的抽象呢？我们是否可以考虑更高层的抽象？

让我们尝试从随机函数中筛选出基本接口，即所需实现的最小功能集合：

* 它需要一种有效的方法来计算输入序列的下限和上限之间的距离。
* 它需要一种有效的方式来检索输入序列的第 n 个元素以便将其返回，其中 n 是从其长度的下界计算得到的随机距离。

霍曼注意到两个可计数的区间类型都遵守协议 [RandomAccessCollection ](https://developer.apple.com/reference/swift/randomaccesscollection)，共享该公共协议的一致性。事实上，`RandomAccessCollection` 提供了我们想要的基本接口：可随机访问的集合保证了所需开销时间都是恒定的，而这些开销主要集中在测量索引间距离以及访问任意索引所指向的元素。

因此，把 `random` 函数定义成 `RandomAccessCollection` 中的方法（这里用到 [numericCasts](https://developer.apple.com/reference/swift/1641291-numericcast) 是因为不同集合类型的 [ IndexDistance](https://developer.apple.com/reference/swift/collection/indexdistance) 是不同的）：

```swift
extension RandomAccessCollection {
    func random() -> Iterator.Element? {
        guard count > 0 else { return nil }
        let offset = arc4random_uniform(numericCast(count))
        let i = index(startIndex, offsetBy: numericCast(offset))
        return self[i]
    }
}
```

现在两种区间类型都可以使用了：

```swift
(1..<10).random()
(1...9).random()
```

这个方案甚至比最初的立意更好，我们可以从任意可随机存取的数组中获取一个随机元素：

```swift
let people = ["David", "Chris", "Joe", "Jordan", "Tony"]
let winner = people.random()
```

## 结论

现在我们已经知道了在类型系统中区分半开区间和闭合区间很不直观。如果你被区间所困扰，解决问题的最好办法是接受现实然后提供两个重载，即便这意味着你必须写一些重复代码。

但代价是代码的通用性变差了。即使现在不需要你的算法来处理其他的数据类型，但当你在正确的抽象层次上实现算法时，也会迫使你考虑算法所需要的基本接口。反过来说，代码的读者通过基本接口的头文件类型，可以更方便地梳理算法所涉及的复杂类型关系——就声明来说，`RandomAccessCollection ` 协议比遵守协议的具体类型（例如 `CountableRange`）具有更少的方法和属性。

即便如此，不要过度地抽象。对泛型参数做很多约束后，泛型代码可能更难阅读，尤其是当你编写的应用程序不向第三方提供公共 API 的时候。花费太多时间来构建完美的抽象，而不去做真正的工作是我们很容易犯的错误。

