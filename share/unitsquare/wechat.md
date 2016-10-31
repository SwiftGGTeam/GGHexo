Measurements 和 Units，第三部分"

> 作者：Ole Begemann，[原文链接](http://oleb.net/blog/2016/07/unitsquare/)，原文日期：2016/07/29
> 译者：[钟颖](https://github.com/cyanzhong)；校对：[小铁匠Linus](http://linusling.com)；定稿：[CMB](https://github.com/chenmingbiao)
  









更新：
2016-08-02 已将代码更新至 Xcode 8 Beta 4

本系列其他文章：

(1) [Measurements 和 Units 概览](http://oleb.net/blog/2016/07/measurements-and-units/)

(2) [乘法和除法](http://oleb.net/blog/2016/07/unitproduct/)

(3) 内容提炼（本文） 

(4) [幽灵类型](http://oleb.net/blog/2016/08/measurements-and-units-with-phantom-types/)

Swift 中 Measurements 和 Units 的系列文章中，仍然有一些[收尾](http://movie-sounds.org/sci-fi-movie-samples/sound-clips-from-star-trek-insurrection-1998/you-re-not-finished-here-just-a-few-loose-ends-to-tie-up-dougherty-out)工作要做。如果你还没有看过之前的文章的话，可以在[第一部分](http://oleb.net/blog/2016/07/measurements-and-units/)中找到 Foundation 框架中 Measurements 和 Units 接口的大致介绍，并在[第二部分](http://swift.gg/2016/08/11/unitproduct/)中看到我如何扩展该系统用于类型安全的乘法和除法。



## 在计算过程中保持单位

在我们[之前的文章](http://swift.gg/2016/08/11/unitproduct/)里面，乘法和除法在计算之前总是会将单位转换到各自的*默认单位*，正如我们在 `UnitProduct` 协议的 `defaultUnitMapping()` 方法定义的那样。为了让结果在各种计算场景下都正确，无论传入参数的单位是什么。

到目前为止，我们仍然使用一个*默认的单位映射*作为计算结果的单位。比如说，[`UnitSpeed`](https://developer.apple.com/reference/foundation/nsunitspeed)，[`UnitDuration`](https://developer.apple.com/reference/foundation/nsunitduration) 和 [`UnitLength`](https://developer.apple.com/reference/foundation/nsunitlength) 的映射是 `(.metersPerSecond, .seconds, .meters)`。这意味着 *72 千米每 2 小时* 将会在计算前被转换成 *72000 米每 7200 秒*。然后我们会将计算结果封装成 `Measurement<UnitVelocity>` 并且返回，它的单位将会是米每秒。

从实现的角度来说这是一个最简单的方案，但是可以想象的是，方法的调用者会更希望在计算中尽可能保持单位一致。*如果我输入米和秒，则尽可能的返回米每秒，但是如果我输入千米和小时，则希望返回千米每小时。*

## 首选单位映射

我们可以在协议里面添加一个新的方法来实现这个目标，这个方法会通过优先级排序返回一个单位映射的集合。在计算的时候我们通过遍历这个集合，为当前的计算找出最合适的单位映射。如果没有匹配到，则回退到默认的单位映射。我把这个方法叫做 `preferredUnitMappings()`。完整的协议看起来像是这样：

    
    protocol UnitProduct {
        associatedtype Factor1: Dimension
        associatedtype Factor2: Dimension
        associatedtype Product: Dimension
    
        static func defaultUnitMapping() -> (Factor1, Factor2, Product)
        static func preferredUnitMappings() -> [(Factor1, Factor2, Product)]
    }

我们需要提供一个返回空数组的默认实现，这样的话如果协议的实现者不需要这个功能，他也可以选择忽略这个方法。

    
    extension UnitProduct {
        // 默认实现
        static func preferredUnitMappings() -> [(Factor1, Factor2, Product)] {
            return []
        }
    }

接下来，我们需要提供一系列的便捷方法，他们的功能是为乘法或者除法的参数匹配出合适的单位映射。这个方法需要三个重载的形式，取决于 `Factor1`，`Factor2` 和 `Product` 三个参数是哪两个组成一对。他们的工作原理是相同的：返回在 `preferredUnitMappings` 列表里面同时匹配两个参数的第一个结果。如果没有匹配的话，返回默认的单位映射。我们使用 Swift 3 里面 `Sequence` 的新方法 [`first(where:)`](http://swiftdoc.org/v3.0/protocol/Sequence/#comment-func--first-where_) 来实现这个功能：

    
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

## 在计算中使用首选单位映射

最后，我们可以修改乘法和除法来使用这个新功能。计算过程本身没有任何变化，我们还是通过默认的单位进行计算。但是在返回结果之前，我们将其转换到我们首选的单位映射。如下是除法的代码（实现另一个重载方法的实现是类似的）：

    
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

一切准备就绪，我们可以为 `UnitLength` 实现 `preferredUnitMappings()` 这个方法，他实现了 `UnitProduct` 这个协议：

    
    extension UnitLength {
        static func preferredUnitMappings() -> [(UnitSpeed, UnitDuration, UnitLength)] {
            return [
                (.kilometersPerHour, .hours, .kilometers),
                (.milesPerHour, .hours, .miles),
                (.knots, .hours, .nauticalMiles)
            ]
        }
    }

现在，计算过程中匹配到合适单位的将会得到保留（会带有一点舍入误差）：

    
    Measurement(value: 72, unit: UnitLength.kilometers) / Measurement(value: 2, unit: UnitDuration.hours)
    // → 35.999971200023 km/h
    Measurement(value: 10, unit: UnitLength.miles) / Measurement(value: 1, unit: UnitDuration.hours)
    // → 9.99997514515231 mph
    Measurement(value: 25, unit: UnitLength.nauticalMiles) / Measurement(value: 2, unit: UnitDuration.hours)
    // → 12.5000107991454 kn

## 这是一个好主意吗？

我不太确定这个方案是不是真的是一个好想法。他使代码变得相当的复杂，但是收益可以说是很小的。而且在每一次计算时，枚举首选单位列表会使代码变得慢一点点[^1]，这可能在循环中会是个问题。但像我们在这里做的这种简单的计算应该尽可能的快。

## 乘方的问题

如果你使用过 `UnitProduct` 这个协议的话，可能发现它并不能应用于物理量的乘方，也就是说，`Factor1` 和 `Factor2` 类型相同的情况。*面积 = 长度 × 长度* 是一个很好的例子：

    
    extension UnitArea: UnitProduct {
        typealias Factor1 = UnitLength
        typealias Factor2 = UnitLength
        typealias Product = UnitArea
    
        static func defaultUnitMapping() -> (UnitLength, UnitLength, UnitArea) {
            return (.meters, .meters, .squareMeters)
        }
    }

如果我们尝试执行两个长度的乘法时，编译器会因为 * 运算符的歧义而报错。

    
    let width = Measurement(value: 4, unit: UnitLength.meters)
    let height = Measurement(value: 6, unit: UnitLength.meters)
    let area: Measurement<UnitArea> = width * height
    // error: Ambiguous use of operator '*'

原因是我们有两个乘法重载运算符，一个是 `(Factor1, Factor2) -> Product` 另一个是 `(Factor2, Factor1) -> Product`。当 `Factor1` 和 `Factor2` 类型相同的时候，这两个重载方法的类型是一模一样的，编译器不知道应该调用哪个，所以就会报错。（在我们的场景中，两个方法都是对的，他们能算出同一个结果，但是编译器并不知道这一点）

最好的解决方案是，我们能够给其中一个方法添加一个通用的约束，类似于 `Factor1 != Factor2`，可以让类型检查在参数类型相同的时候将其区分开来。像这样：

    
    func * <UnitType: Dimension> (...) -> ...
        where UnitType: UnitProduct, UnitType == UnitType.Product, UnitType.Factor1 != UnitType.Factor2
    // error: Expected ':' or '==' to indicate a conformance or same-type requirement

遗憾的是，Swift 并不支持这样的语法，Swift 的 where 语句只能包含 `:` 和 `==`。

## 单独给乘方的协议

我们通过引入一个单独的协议，`UnitSquare` 协议，来解决这个问题，用于定义乘方关系。这个协议只需要两个 associated 类型，`Factor` 和 `Product`：

    
    protocol UnitSquare {
        associatedtype Factor: Dimension
        associatedtype Product: Dimension
    
        static func defaultUnitMapping() -> (Factor, Factor, Product)
        static func preferredUnitMappings() -> [(Factor, Factor, Product)]
    }

我们在这里就不展开其具体实现了，因为这个协议和 `UnitProduct` 很大程度上是相同的。（他的乘法和除法重载都只需要一个，相反的是 `UnitProduct` 需要两个。）

如果我们将 [`UnitArea`](https://developer.apple.com/reference/foundation/nsunitarea) 遵循 `UnitSquare`，那么这些计算就能符合我们的预期：

    
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

## 自身相除

谜题的最后一部分，我想应该是实现两个相同类型的除法，比如说 *6 米 / 4 米 = 1.5*。计算结果应该是一个[没有单位的量](https://en.wikipedia.org/wiki/Dimensionless_quantity)（换句话说是一个 `Double` 类型），并且对所有的 [`Dimension`](https://developer.apple.com/reference/foundation/nsdimension) 类型都是可以有效的。

支持这一特性十分简单，我们只需要再增加一个重载的除法。可以描述为：输入两个相同 `Dimension` 的量，返回一个 `Double` 值。我们通过将两个量都转换成基本类型来实现这个除法：

    
    func / <UnitType: Dimension> (lhs: Measurement<UnitType>, rhs: Measurement<UnitType>) -> Double {
        return lhs.converted(to: UnitType.baseUnit()).value / rhs.converted(to: UnitType.baseUnit()).value
    }
    
    let ratio = height / width
    // → 1.5

## 代码

我将在本系列文章中讨论到的所有代码放到了一个叫 [`Ampere`](https://github.com/ole/Ampere) 的库里面，你可以在 GitHub 上面找到。这个工作正在进展中，我还没有将其变成一个“真正的”库，类似于加入版本控制以及支持 CocoaPods，因为我不知道社区会不会对这些内容感兴趣。所以，让我知道你的想法吧！

[^1]: 在当前的实现中，单位映射的列表甚至没有被缓存下来，每次计算的时候都会重新创建一次。所以这毫无疑问是可以优化的，但不管怎样都会比不需要进行一次查询要慢。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。Time>， block: () -> ())
        where Time: MyUnit， Time.Family == Duration
    {
        // ...
    }

这种写法会有用，但会大大降低函数签名的可读性，即便是在[ Where 子句的位置被转移](https://github.com/apple/swift-evolution/blob/master/proposals/0081-move-where-expression.md)之后。

但就这一条理由来说，苹果将单位设为实例而不是类型的做法可能更为实用，更有意义。毕竟，米和公里只是同一东西的不同说法而已。但探索这个问题并不是很有意义，我们还是先继续。

## 加法和标量乘法

有时候我们需要把同样单位族的两个度量值作加法，即便他们有不同单位。通过使用泛型来重载 `+` 运算符方法就会容易，并且在习惯上我们会把右边的值转化为左边值得单位，并返回基于那个单位的结果。

    func + <Unit1， Unit2> (lhs: MyMeasurement<Unit1>， rhs: MyMeasurement<Unit2>) -> MyMeasurement<Unit1>
        where Unit1: MyUnit， Unit2: MyUnit， Unit1.Family == Unit2.Family
    {
        let rhsConverted = rhs.converted(to: Unit1.self)
        return MyMeasurement(lhs.value + rhsConverted.value)
    }
    
    fiveMeters + threeKilometers
    // → 3005.0 m
    threeKilometers + fiveMeters
    // → 3.005 km

我们再来注意一下这个约束 `Unit1.Family == Unit2.Family` ，它防止秒和米相加。

标量乘法就更容易实现了，因为没有单位转换参与。我们简单的把值相乘并创造一个新的度量值，两个重载方法被用于 `a * b` 和 `b * a` 两种情况。

    func * <UnitType> (measurement: MyMeasurement<UnitType>， scalar: Double) -> MyMeasurement<UnitType> {
        var result = measurement
        result.value *= scalar
        return result
    }
    
    func * <UnitType> (scalar: Double， measurement: MyMeasurement<UnitType>) -> MyMeasurement<UnitType> {
        return measurement * scalar
    }
    
    threeKilometers * 2
    // → 6.0 km
    let twoSeconds: MyMeasurement<Seconds> = 2
    60 * twoSeconds
    // → 120.0 s

如果你记得这个系列的[第二部分](https://oleb.net/blog/2016/07/unitproduct/)，我最初的目的是想让单位之间可以被设计得相互依赖，例如  速度 = 路程 / 时间  或者 能量 = 功率 × 时间 。为了做到这些，我要介绍一个协议叫做 `UnitProduct`，通过遵守该协议和命名作为关联类型的因子，这样单位族可以表示其因子。

我们又做同样的事，但这次展示不同单位的关系而不是单位族。

    /// Describes this relation between units:
    /// Product = Factor1 * Factor2
    protocol Product: MyUnit {
        associatedtype Factor1: MyUnit
        associatedtype Factor2: MyUnit
    }

注意一下这样一个简单的协议足以描述乘法性和除法性关系，因为 `a = b × c` 等价于 `b = a / c`。选择结果是随意的，这样无论怎么选都会让这个关系看上去不自然。举例来说，假如我们想表示 速度 = 路程 / 时间，我们就得也把它重写为 路程 = 速度 × 时间 。
下一步来实现实际计算，即重载作用于遵守协议的类型的乘法和除法运算符方法。我们需要四个变量：
`a = b × c`
泛型约束让它看起来更加复杂了，对于任意遵守 `Product` 协议的 `Result` 类型，这个重载方法定义两个度量值的乘法，这两个度量值的单位 `Unit1` 和 `Unit2` 有着和 `Result` 的 `Result.Factor1` 和 `Result.Factor2` 同样的单位族。而结果是通过将度量值各自转化为 `Result.Factor1` 和 `Result.Factor2` ，然后相乘。

    func * <Unit1， Unit2， Result> (lhs: MyMeasurement<Unit1>， rhs: MyMeasurement<Unit2>) -> MyMeasurement<Result>
        where Result: Product， Result.Factor1.Family == Unit1.Family， Result.Factor2.Family == Unit2.Family
    {
        let left = lhs.converted(to: Result.Factor1.self)
        let right = rhs.converted(to: Result.Factor2.self)
        return MyMeasurement(left.value * right.value)
    }

`a = c × b`

    func * <Unit1， Unit2， Result> (lhs: MyMeasurement<Unit2>， rhs: MyMeasurement<Unit1>) -> MyMeasurement<Result>
        where Result: Product， Result.Factor1.Family == Unit1.Family， Result.Factor2.Family == Unit2.Family
    {
        return rhs * lhs
    }

这和先前的函数不完全类似，它将 lhs和 rhs 置换了。实现方式仅仅是转发给其他重载方法。

`b = a / c and c = a / b`

    func / <Unit1， Unit2， Result> (lhs: MyMeasurement<Result>， rhs: MyMeasurement<Unit2>) -> MyMeasurement<Unit1>
        where Result: Product， Result.Factor1.Family == Unit1.Family， Result.Factor2.Family == Unit2.Family
    {
        let right = rhs.converted(to: Result.Factor2.self)
        return MyMeasurement(lhs.value / right.value)
    }
    
    func / <Unit1， Unit2， Result> (lhs: MyMeasurement<Result>， rhs: MyMeasurement<Unit1>) -> MyMeasurement<Unit2>
        where Result: Product， Result.Factor1.Family == Unit1.Family， Result.Factor2.Family == Unit2.Family
    {
        let right = rhs.converted(to: Result.Factor1.self)
        return MyMeasurement(lhs.value / right.value)
    }

同样的方式，不过泛型参数的位置发生了变化。

## 具体实现

现在它终于可以表示关系 路程 = 速度 × 时间（即 速度 = 路程 / 时间）

    extension Meters: Product {
        typealias Factor1 = MetersPerSecond
        typealias Factor2 = Seconds
    }

它可以这样用:

    let tenMeters: MyMeasurement<Meters> = 10
    let fourSeconds: MyMeasurement<Seconds> = 4
    let speed: MyMeasurement<MetersPerSecond> = tenMeters / fourSeconds
    // → 2.5 m/s
    
    let thirtyKilometersPerHour: MyMeasurement<KilometersPerHour> = 30
    let twoHours: MyMeasurement<Hours> = 2
    let tripLength: MyMeasurement<Meters> = thirtyKilometersPerHour * twoHours
    // → 60000.0 m
    tripLength.converted(to: Kilometers.self)
    // → 60.0 km

它的工作效果不错，但是有两个明显的缺点。第一个是目前的编译器无法推断出自动计算的返回类型，我不知道是否今后的编译器可以解决这个问题，也许我可以通过在函数中设置更好的泛型约束的方式提供一些帮助，但是尝试之后，依然没能解决问题。
第二点是参数的单位需要有正确的单位族，返回类型的单位会被使用 `Product` 协议的具体单位所限制。因此类似 `let tripLength: MyMeasurement<Kilometers> = ...` 并不会起作用，你必须先提供以米形式的结果，然后再把它转换。这是一个非常大的限制。

## 结论

忽略这个设计的缺陷（确实存在），你得注意不止一行可执行代码需要为类型系统增加数学关系！仅仅通过添加协议一致（即定义两个关联类型），我们就可以从字面上把任务 1 meter = 1 m/s × 1 s 添加给编译器的“真理”池。但如果你要添加其他数学关系（比如1 J = 1 W × 1 s），那么我们就必须再添加一个协议一致。
我觉得这种写法非常吸引我。但尽管如此，我不认为这个基于幽灵类型的 API 优于苹果基础库中的 API，基于单位族而不是单位的度量值其实只会更加有意义。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。