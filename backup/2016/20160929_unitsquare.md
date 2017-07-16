title: "Measurements 和 Units，第三部分"
date: 2016-09-29
tags: [Swift 进阶]
categories: [Ole Begemann]
permalink: unitsquare
keywords: measurements,units
custom_title: 
description: Swift 中 Measurements 和 Units 的系列文章第三章，本文主要讲解了在计算中使用首选单位映射保持单位。

---
原文链接=http://oleb.net/blog/2016/07/unitsquare/
作者=Ole Begemann
原文日期=2016/07/29
译者=钟颖
校对=小铁匠Linus
定稿=CMB

<!--此处开始正文-->

更新：
2016-08-02 已将代码更新至 Xcode 8 Beta 4

本系列其他文章：

(1) [Measurements 和 Units 概览](http://oleb.net/blog/2016/07/measurements-and-units/)

(2) [乘法和除法](http://oleb.net/blog/2016/07/unitproduct/)

(3) 内容提炼（本文） 

(4) [幽灵类型](http://oleb.net/blog/2016/08/measurements-and-units-with-phantom-types/)

Swift 中 Measurements 和 Units 的系列文章中，仍然有一些[收尾](http://movie-sounds.org/sci-fi-movie-samples/sound-clips-from-star-trek-insurrection-1998/you-re-not-finished-here-just-a-few-loose-ends-to-tie-up-dougherty-out)工作要做。如果你还没有看过之前的文章的话，可以在[第一部分](http://oleb.net/blog/2016/07/measurements-and-units/)中找到 Foundation 框架中 Measurements 和 Units 接口的大致介绍，并在[第二部分](http://swift.gg/2016/08/11/unitproduct/)中看到我如何扩展该系统用于类型安全的乘法和除法。

<!--more-->

## 在计算过程中保持单位

在我们[之前的文章](http://swift.gg/2016/08/11/unitproduct/)里面，乘法和除法在计算之前总是会将单位转换到各自的*默认单位*，正如我们在 `UnitProduct` 协议的 `defaultUnitMapping()` 方法定义的那样。为了让结果在各种计算场景下都正确，无论传入参数的单位是什么。

到目前为止，我们仍然使用一个*默认的单位映射*作为计算结果的单位。比如说，[`UnitSpeed`](https://developer.apple.com/reference/foundation/nsunitspeed)，[`UnitDuration`](https://developer.apple.com/reference/foundation/nsunitduration) 和 [`UnitLength`](https://developer.apple.com/reference/foundation/nsunitlength) 的映射是 `(.metersPerSecond, .seconds, .meters)`。这意味着 *72 千米每 2 小时* 将会在计算前被转换成 *72000 米每 7200 秒*。然后我们会将计算结果封装成 `Measurement<UnitVelocity>` 并且返回，它的单位将会是米每秒。

从实现的角度来说这是一个最简单的方案，但是可以想象的是，方法的调用者会更希望在计算中尽可能保持单位一致。*如果我输入米和秒，则尽可能的返回米每秒，但是如果我输入千米和小时，则希望返回千米每小时。*

## 首选单位映射

我们可以在协议里面添加一个新的方法来实现这个目标，这个方法会通过优先级排序返回一个单位映射的集合。在计算的时候我们通过遍历这个集合，为当前的计算找出最合适的单位映射。如果没有匹配到，则回退到默认的单位映射。我把这个方法叫做 `preferredUnitMappings()`。完整的协议看起来像是这样：

```swift
protocol UnitProduct {
    associatedtype Factor1: Dimension
    associatedtype Factor2: Dimension
    associatedtype Product: Dimension

    static func defaultUnitMapping() -> (Factor1, Factor2, Product)
    static func preferredUnitMappings() -> [(Factor1, Factor2, Product)]
}
```

我们需要提供一个返回空数组的默认实现，这样的话如果协议的实现者不需要这个功能，他也可以选择忽略这个方法。

```swift
extension UnitProduct {
    // 默认实现
    static func preferredUnitMappings() -> [(Factor1, Factor2, Product)] {
        return []
    }
}
```

接下来，我们需要提供一系列的便捷方法，他们的功能是为乘法或者除法的参数匹配出合适的单位映射。这个方法需要三个重载的形式，取决于 `Factor1`，`Factor2` 和 `Product` 三个参数是哪两个组成一对。他们的工作原理是相同的：返回在 `preferredUnitMappings` 列表里面同时匹配两个参数的第一个结果。如果没有匹配的话，返回默认的单位映射。我们使用 Swift 3 里面 `Sequence` 的新方法 [`first(where:)`](http://swiftdoc.org/v3.0/protocol/Sequence/#comment-func--first-where_) 来实现这个功能：

```swift
extension UnitProduct {
    static func unitMapping(factor1: Factor1, factor2: Factor2) -> (Factor1, Factor2, Product) {
        let match = preferredUnitMappings().first { (f1, f2, _) in
            f1 == factor1 && f2 == factor2
        }
        return match ?? defaultUnitMapping()
    }

    static func unitMapping(product: Product, factor2: Factor2) -> (Factor1, Factor2, Product) {
        let match = preferredUnitMappings().first { (_, f2, p) in
            p == product && f2 == factor2
        }
        return match ?? defaultUnitMapping()
    }

    static func unitMapping(product: Product, factor1: Factor1) -> (Factor1, Factor2, Product) {
        let match = preferredUnitMappings().first { (f1, _, p) in
            p == product && f1 == factor1
        }
        return match ?? defaultUnitMapping()
    }
}
```

## 在计算中使用首选单位映射

最后，我们可以修改乘法和除法来使用这个新功能。计算过程本身没有任何变化，我们还是通过默认的单位进行计算。但是在返回结果之前，我们将其转换到我们首选的单位映射。如下是除法的代码（实现另一个重载方法的实现是类似的）：

```swift
/// UnitProduct / Factor2 = Factor1
public func / <UnitType: Dimension> (lhs: Measurement<UnitType>, rhs: Measurement<UnitType.Factor2>)
    -> Measurement<UnitType.Factor1> where UnitType: UnitProduct, UnitType == UnitType.Product {

    // 使用默认单位进行计算
    let (resultUnit, rightUnit, leftUnit) = UnitType.defaultUnitMapping()
    let value = lhs.converted(to: leftUnit).value / rhs.converted(to: rightUnit).value
    let result = Measurement(value: value, unit: resultUnit)

    // 转换到首选的单位
    let (desiredUnit, _, _) = UnitType.unitMapping(product: lhs.unit, factor2: rhs.unit)
    return result.converted(to: desiredUnit)
}
```

一切准备就绪，我们可以为 `UnitLength` 实现 `preferredUnitMappings()` 这个方法，他实现了 `UnitProduct` 这个协议：

```swift
extension UnitLength {
    static func preferredUnitMappings() -> [(UnitSpeed, UnitDuration, UnitLength)] {
        return [
            (.kilometersPerHour, .hours, .kilometers),
            (.milesPerHour, .hours, .miles),
            (.knots, .hours, .nauticalMiles)
        ]
    }
}
```

现在，计算过程中匹配到合适单位的将会得到保留（会带有一点舍入误差）：

```swift
Measurement(value: 72, unit: UnitLength.kilometers) / Measurement(value: 2, unit: UnitDuration.hours)
// → 35.999971200023 km/h
Measurement(value: 10, unit: UnitLength.miles) / Measurement(value: 1, unit: UnitDuration.hours)
// → 9.99997514515231 mph
Measurement(value: 25, unit: UnitLength.nauticalMiles) / Measurement(value: 2, unit: UnitDuration.hours)
// → 12.5000107991454 kn
```

## 这是一个好主意吗？

我不太确定这个方案是不是真的是一个好想法。他使代码变得相当的复杂，但是收益可以说是很小的。而且在每一次计算时，枚举首选单位列表会使代码变得慢一点点[^1]，这可能在循环中会是个问题。但像我们在这里做的这种简单的计算应该尽可能的快。

## 乘方的问题

如果你使用过 `UnitProduct` 这个协议的话，可能发现它并不能应用于物理量的乘方，也就是说，`Factor1` 和 `Factor2` 类型相同的情况。*面积 = 长度 × 长度* 是一个很好的例子：

```swift
extension UnitArea: UnitProduct {
    typealias Factor1 = UnitLength
    typealias Factor2 = UnitLength
    typealias Product = UnitArea

    static func defaultUnitMapping() -> (UnitLength, UnitLength, UnitArea) {
        return (.meters, .meters, .squareMeters)
    }
}
```

如果我们尝试执行两个长度的乘法时，编译器会因为 * 运算符的歧义而报错。

```swift
let width = Measurement(value: 4, unit: UnitLength.meters)
let height = Measurement(value: 6, unit: UnitLength.meters)
let area: Measurement<UnitArea> = width * height
// error: Ambiguous use of operator '*'
```

原因是我们有两个乘法重载运算符，一个是 `(Factor1, Factor2) -> Product` 另一个是 `(Factor2, Factor1) -> Product`。当 `Factor1` 和 `Factor2` 类型相同的时候，这两个重载方法的类型是一模一样的，编译器不知道应该调用哪个，所以就会报错。（在我们的场景中，两个方法都是对的，他们能算出同一个结果，但是编译器并不知道这一点）

最好的解决方案是，我们能够给其中一个方法添加一个通用的约束，类似于 `Factor1 != Factor2`，可以让类型检查在参数类型相同的时候将其区分开来。像这样：

```swift
func * <UnitType: Dimension> (...) -> ...
    where UnitType: UnitProduct, UnitType == UnitType.Product, UnitType.Factor1 != UnitType.Factor2
// error: Expected ':' or '==' to indicate a conformance or same-type requirement
```

遗憾的是，Swift 并不支持这样的语法，Swift 的 where 语句只能包含 `:` 和 `==`。

## 单独给乘方的协议

我们通过引入一个单独的协议，`UnitSquare` 协议，来解决这个问题，用于定义乘方关系。这个协议只需要两个 associated 类型，`Factor` 和 `Product`：

```swift
protocol UnitSquare {
    associatedtype Factor: Dimension
    associatedtype Product: Dimension

    static func defaultUnitMapping() -> (Factor, Factor, Product)
    static func preferredUnitMappings() -> [(Factor, Factor, Product)]
}
```

我们在这里就不展开其具体实现了，因为这个协议和 `UnitProduct` 很大程度上是相同的。（他的乘法和除法重载都只需要一个，相反的是 `UnitProduct` 需要两个。）

如果我们将 [`UnitArea`](https://developer.apple.com/reference/foundation/nsunitarea) 遵循 `UnitSquare`，那么这些计算就能符合我们的预期：

```swift
extension UnitArea: UnitSquare {
    typealias Factor = UnitLength
    typealias Product = UnitArea

    static func defaultUnitMapping() -> (UnitLength, UnitLength, UnitArea) {
        return (.meters, .meters, .squareMeters)
    }
}

let width = Measurement(value: 4, unit: UnitLength.meters)
let height = Measurement(value: 6, unit: UnitLength.meters)
let area: Measurement<UnitArea> = width * height
// → 24.0 m²
area / width
// → 6.0 m
area / height
// → 4.0 m
```

## 自身相除

谜题的最后一部分，我想应该是实现两个相同类型的除法，比如说 *6 米 / 4 米 = 1.5*。计算结果应该是一个[没有单位的量](https://en.wikipedia.org/wiki/Dimensionless_quantity)（换句话说是一个 `Double` 类型），并且对所有的 [`Dimension`](https://developer.apple.com/reference/foundation/nsdimension) 类型都是可以有效的。

支持这一特性十分简单，我们只需要再增加一个重载的除法。可以描述为：输入两个相同 `Dimension` 的量，返回一个 `Double` 值。我们通过将两个量都转换成基本类型来实现这个除法：

```swift
func / <UnitType: Dimension> (lhs: Measurement<UnitType>, rhs: Measurement<UnitType>) -> Double {
    return lhs.converted(to: UnitType.baseUnit()).value / rhs.converted(to: UnitType.baseUnit()).value
}

let ratio = height / width
// → 1.5
```

## 代码

我将在本系列文章中讨论到的所有代码放到了一个叫 [`Ampere`](https://github.com/ole/Ampere) 的库里面，你可以在 GitHub 上面找到。这个工作正在进展中，我还没有将其变成一个“真正的”库，类似于加入版本控制以及支持 CocoaPods，因为我不知道社区会不会对这些内容感兴趣。所以，让我知道你的想法吧！

[^1]: 在当前的实现中，单位映射的列表甚至没有被缓存下来，每次计算的时候都会重新创建一次。所以这毫无疑问是可以优化的，但不管怎样都会比不需要进行一次查询要慢。