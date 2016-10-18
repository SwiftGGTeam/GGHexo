title: "使用幽灵类型的Measurements和Units ，第四部分"
date: 2016-10-18
tags: [Swift 进阶]
categories: [Ole Begemann]
permalink: unitsquare
keywords: 
custom_title: 
description: 

---
原文链接=https://oleb.net/blog/2016/08/measurements-and-units-with-phantom-types/
作者=Ole Begemann
原文日期=2016-08-29
译者=与狼同行
校对=Cwift
定稿=CMB

<!--此处开始正文-->

本系列其他文章：

(1) [Measurements 和 Units 概览](http://oleb.net/blog/2016/07/measurements-and-units/)
(2) [乘法和除法](http://oleb.net/blog/2016/07/unitproduct/)
(3) [内容提炼](http://swift.gg/2016/09/29/unitsquare/)
(4) 幽灵类型(本文)

我之前撰写了关于标准库里新的度量值的短系列，此文是该系列的额外之作。虽然我很喜欢苹果的 API ，但我觉得探索同一问题的不同解决方案也很有意思。特别是这个问题，纯 Swift 设计是否能优于苹果的接口呢，因为苹果的接口考虑了 Objective-C 的[兼容性问题](https://lists.swift.org/pipermail/swift-corelibs-dev/Week-of-Mon-20160808/000864.html)。

<!--more-->

## 苹果的设计

在苹果的 API 中，开发者主要使用的数据类型是[度量值 ```Measurement``` 类型](https://developer.apple.com/reference/foundation/nsmeasurement)，它包含一个浮点数  ```value``` 和用于测值的单位 ```unit``` ，并基于单位类型使用了泛型。

```
struct Measurement<UnitType: Unit> {
    let unit: UnitType
    var value: Double
}

let length = Measurement(value: 5， unit: UnitLength.meters)
// 长度表现为一个 Measurement<UnitLength>
```

Measurement 被视为[值类型](https://github.com/apple/swift-evolution/blob/master/proposals/0069-swift-mutability-for-foundation.md)——它在 Objective-C 中是类，在 Swift 中是结构体。
在单位族（Unit Family）中，比如说长度或时长，被建模为类层次结构中的类型:  [Unit](https://developer.apple.com/reference/foundation/nsunit) > [Dimension](https://developer.apple.com/reference/foundation/nsdimension) > [UnitLength](https://developer.apple.com/reference/foundation/nsunitlength) 、 [UnitDuration](https://developer.apple.com/reference/foundation/nsunitduration)等等。具体的类型如米、千克，分别是它们单位族类的实例。每一个单位都是由单位的符号（如「kg」）和一个 [单元转换](https://developer.apple.com/reference/foundation/unitconverter)对象组成，该对象通过编码指令来使单位转化为该单位族的基本单位。

## 幽灵类型

如果我们将具体的单位视为一个类型而不是实例呢？假设有一些类型名为米（Meters）、千米（Kilometers），或者英里（Miles），我们可以设计一个泛型的 ```Measurement``` 类型，它只有一个存储属性来存放量值，该量值的单位可以被完整编码在自身类型中。
```
struct MyMeasurement<UnitType: MyUnit> {
    var value: Double

    init(_ value: Double) {
        self.value = value
    }
}

let length = MyMeasurement<Meters>(5)
// length is a MyMeasurement<Meters>
```

现在我们再次审视两种方式的不同之处，苹果的设计是让单位族 ``` length```作为 ```Measurement``` 的参数，让具体的单位 米 作为该值的一部分。而我的设计是让具体的单位 米 成为泛型参数。
 ```MyMeasurement``` 也能被称为[幽灵类型](https://wiki.haskell.org/Phantom_type)，因为泛型参数 UnitType 没有在类型声明中出现。它的用途仅仅是用于相互区分类似 ```MyMeasurement <Meters>``` 和 ```MyMeasurement <Kilometers>``` 这样的类型，这样它们就无法互相替换。
我们之后将看看这样设计是否真的有用，因为你可能会争辩，用米的度量值应当能与用千米的度量值互相转换。想了解更多关于 Swift 中幽灵类型的例子，可以看 [objc.org](https://www.objc.io/blog/2014/12/29/functional-snippet-13-phantom-types/) 的文章或 [Johannes Weiß](https://realm.io/news/swift-summit-johannes-weiss-the-type-system-is-your-friend/) 的谈话。Swift标准库也在使用幽灵类型，例如 [UnsafePointer <Memory>](https://developer.apple.com/reference/swift/unsafepointer) 。

## 好处

我的方法最明显的好处是比使用度量值数据类型在大小上要小 50 % ，因为对单位实例的引用不是必要的。（单位实例自身是被所有那个单位的 Measurement 类所共用的，例如 5 米 和 10 米 两个度量值引用的是同一个单位实例。）但大小尺寸上的节省优势会被潜在更大的代码量所抵消，因为编译器会为泛型类型和使用该类型的函数产生更多的特化。

由于 Unit 在苹果的 API 中为引用类型，将测量值传给函数也会带来 retain 和 release 的开销。这两个因素对一个传统 App 来说都不是很重要，我也没有展开进一步的研究，在探索这些想法的时候，它们对我来说无关紧要。

## 具体的设计

我们现在具体说一下如何在这个系统中定义单位，所有的单位都被封装到不同的单位族中，比如长度、温度、时长。我们开始为单位族定义一个协议：

```
/// 表现为一种物理数值 或者 可以认为是 “ 单位之族 ”
/// 例如: 长度， 温度， 速率.
protocol UnitFamily {
    associatedtype BaseUnit
}
```

正如苹果API中，每个单位族都会定义一个基础单位，它用于同一单位族的不同类型间的相互转换，例如长度单位族的基础单位是米。我们在 ```UnitFamily``` 协议中，把该基础单位定义为一个关联类型，这会有一个好处，基础单位会在这个类型系统中被编码，在 Foundation 库中，基础单位必须被单独记录以使得其他人用自定义的单位来扩展这个系统。

下一步是定义 ```MyUnit``` 协议以塑造具体的单位，这些单位在苹果的设计中会被定义为单位族类型的一个实例。（这里我使用 My 作为前缀来避免和苹果类型的命名冲突）

```
/// 表现为度量值的单位
/// 例如: 米， 公里， 英里， 秒， 小时， 摄氏度.
protocol MyUnit {
    associatedtype Family: UnitFamily

    static var symbol: String { get }
    static var converter: UnitConverter { get }
}
```

单位通过关联类型的方式来进行声明其所属的单位族。用静态属性来保存它的符号（比如米的符号是 m ，磅的符号是 lbs ）和它的单位转化器，转化器描述了如何将该单位转化为该族的基础单位。假如说长度单位族的基础单位是米，那么公里单位的转化器应该就是 ```UnitConverterLinear(coefficient: 1000) ```。基础单位自身的转化器系数应该为1。我这里从 Foundation 库中借用了[UnitConverter](https://developer.apple.com/reference/foundation/unitconverter) 类型。 Foundation 库将没有维度单位的 Unit 和有维度单位的 Dimension 进行了区分。简单起见，我们就不做这些事了，我们所有的单位都是有维度的。
基础单位也必须是一个单位类型，这样想当然没错，理想来说在 UnitFamily 协议中的 BaseUnit 应当有一个对应的基础单位约束，那就是 MyUnit 。不过遗憾的是，这样会使得两个协议之间产生循环引用，这样在Swift中肯定是不被许可的。话虽如此说，但即便没有约束，一切也能工作顺利。

## 遵守协议

现在来为协议添加具体的实现。我这里展示一下长度、速度和时长的例子，每个都设置几个单位，再添加更多的单位和单位族也没什么意义。我选择用枚举来作为类型的结构，因为无例枚举不能被实例化，这对我们来说非常完美，因为我们只对类型感兴趣，而不是对类型的实例。

```
enum Length: UnitFamily {
    typealias BaseUnit = Meters
}

enum Meters: MyUnit {
    typealias Family = Length
    static let symbol = "m"
    static let converter: UnitConverter = UnitConverterLinear(coefficient: 1)
}

enum Kilometers: MyUnit {
    typealias Family = Length
    static let symbol = "km"
    static let converter: UnitConverter = UnitConverterLinear(coefficient: 1000)
}

// MARK: - Duration
enum Duration: UnitFamily {
    typealias BaseUnit = Seconds
}

enum Seconds: MyUnit {
    typealias Family = Duration
    static let symbol = "s"
    static let converter: UnitConverter = UnitConverterLinear(coefficient: 1)
}

enum Minutes: MyUnit {
    typealias Family = Duration
    static let symbol = "min"
    static let converter: UnitConverter = UnitConverterLinear(coefficient: 60)
}

enum Hours: MyUnit {
    typealias Family = Duration
    static let symbol = "hr"
    static let converter: UnitConverter = UnitConverterLinear(coefficient: 3600)
}

// MARK: - Speed
enum Speed: UnitFamily {
    typealias BaseUnit = MetersPerSecond
}

enum MetersPerSecond: MyUnit {
    typealias Family = Speed
    static let symbol = "m/s"
    static let converter: UnitConverter = UnitConverterLinear(coefficient: 1)
}

enum KilometersPerHour: MyUnit {
    typealias Family = Speed
    static let symbol = "km/h"
    static let converter: UnitConverter = UnitConverterLinear(coefficient: 1.0/3.6)
}

```

## 转换度量值

现在我们已经可以用不同的单位来表示度量值，接着我们需要让它们相互转换。```converted(to:)``` 方法传入一个目标单位类型的参数并通过单位转换器返回那个单位新的度量值。注意这句约束```TargetUnit.Family == UnitType.Family```，它限制了转换只能适用于同单位族，编译器不会让你把```Meters```转换为```Seconds```。

```
extension MyMeasurement {
    /// Converts `self` to a measurement that has another unit of the same family.
    func converted<TargetUnit>(to target: TargetUnit.Type) -> MyMeasurement<TargetUnit>
        where TargetUnit: MyUnit， TargetUnit.Family == UnitType.Family
    {
        let valueInBaseUnit = UnitType.converter.baseUnitValue(fromValue: value)
        let valueInTargetUnit = TargetUnit.converter.value(fromBaseUnitValue: valueInBaseUnit)
        return MyMeasurement<TargetUnit>(valueInTargetUnit)
    }
```

我们来为 ```MyMeasurement``` 添加一些方便的功能，遵守```CustomStringConvertible```是一个输出调试的良好方案，并通过遵守 ```ExpressibleByIntegerLiteral``` 和 ```ExpressibleByFloatLiteral``` 协议使得通过字面量创建新的度量值变得更加轻松愉快。

```
extension MyMeasurement: CustomStringConvertible {
    var description: String {
        return "\(value) \(UnitType.symbol)"
    }
}

extension MyMeasurement: ExpressibleByIntegerLiteral {
    init(integerLiteral value: IntegerLiteralType) {
        self.value = Double(value)
    }
}

extension MyMeasurement: ExpressibleByFloatLiteral {
    init(floatLiteral value: FloatLiteralType) {
        self.value = value
    }
}
```

## 用法

现在我们开始创造一些度量值并把它们转换为其他单位，应用字面量的语法来表达对象创建非常不错。

```
let fiveMeters: MyMeasurement<Meters> = 5
// → 5.0 m
let threeKilometers: MyMeasurement<Kilometers> = 3
// → 3.0 km
threeKilometers.converted(to: Meters.self)
// → 3000.0 m
threeKilometers.converted(to: Seconds.self)
// error: 'Family' (aka 'Length') is not convertible to 'Family' (aka 'Duration') (as expected)
```

我们再来看看把度量值作为函数参数会怎么样？看一下这个假想的```delay```函数，它以时长和一个闭包作为参数，并在具体时长后执行闭包:

```
func delay(after duration: MyMeasurement<Seconds>， block: () -> ()) {
    // ...
}
```

这个函数需要以秒为单位的度量值，如果你传入了毫秒作为参数，你必须负责转化值。以 ```TimeInterval``` 作为参数可以具有类型安全的优势，编译器不会允许你传入 ```MyMeasurement<Milliseconds>``` 作参数，但这样做会比我们使用 ```Measurement<UnitDuration>``` 要大大降低灵活性，使用后者将会允许我们传入任意的时长单位。

我们通过基于单位类型将函数泛型化实现它(并且附上约束，它的单位族必须为时长)

```
func delay<Time>(after duration: MyMeasurement<Time>， block: () -> ())
    where Time: MyUnit， Time.Family == Duration
{
    // ...
}
```

这种写法会有用，但会大大降低函数签名的可读性，即便是在[ Where 子句的位置被转移](https://github.com/apple/swift-evolution/blob/master/proposals/0081-move-where-expression.md)之后。

但就这一条理由来说，苹果将单位设为实例而不是类型的做法可能更为实用，更有意义。毕竟，米和公里只是同一东西的不同说法而已。但探索这个问题并不是很有意义，我们还是先继续。

## 加法和标量乘法

有时候我们需要把同样单位族的两个度量值作加法，即便他们有不同单位。通过使用泛型来重载 ```+``` 运算符方法就会容易，并且在习惯上我们会把右边的值转化为左边值得单位，并返回基于那个单位的结果。

```
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
```

我们再来注意一下这个约束 ```Unit1.Family == Unit2.Family``` ，它防止秒和米相加。

标量乘法就更容易实现了，因为没有单位转换参与。我们简单的把值相乘并创造一个新的度量值，两个重载方法被用于 ```a * b``` 和 ```b * a``` 两种情况。

```
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
```

如果你记得这个系列的[第二部分](https://oleb.net/blog/2016/07/unitproduct/)，我最初的目的是想让单位之间可以被设计得相互依赖，例如  速度 = 路程 / 时间  或者 能量 = 功率 × 时间 。为了做到这些，我要介绍一个协议叫做 ```UnitProduct```，通过遵守该协议和命名作为关联类型的因子，这样单位族可以表示其因子。

我们又做同样的事，但这次展示不同单位的关系而不是单位族。

```
/// Describes this relation between units:
/// Product = Factor1 * Factor2
protocol Product: MyUnit {
    associatedtype Factor1: MyUnit
    associatedtype Factor2: MyUnit
}
```

注意一下这样一个简单的协议足以描述乘法性和除法性关系，因为 ```a = b × c``` 等价于 ```b = a / c```。选择结果是随意的，这样无论怎么选都会让这个关系看上去不自然。举例来说，假如我们想表示 速度 = 路程 / 时间，我们就得也把它重写为 路程 = 速度 × 时间 。
下一步来实现实际计算，即重载作用于遵守协议的类型的乘法和除法运算符方法。我们需要四个变量：
```a = b × c```
泛型约束让它看起来更加复杂了，对于任意遵守 ```Product``` 协议的 ```Result``` 类型，这个重载方法定义两个度量值的乘法，这两个度量值的单位 ```Unit1``` 和 ```Unit2``` 有着和 ```Result ```的 ```Result.Factor1 ```和 ```Result.Factor2 ```同样的单位族。而结果是通过将度量值各自转化为 ```Result.Factor1 ``` 和 ```Result.Factor2``` ，然后相乘。

```
func * <Unit1， Unit2， Result> (lhs: MyMeasurement<Unit1>， rhs: MyMeasurement<Unit2>) -> MyMeasurement<Result>
    where Result: Product， Result.Factor1.Family == Unit1.Family， Result.Factor2.Family == Unit2.Family
{
    let left = lhs.converted(to: Result.Factor1.self)
    let right = rhs.converted(to: Result.Factor2.self)
    return MyMeasurement(left.value * right.value)
}
```

```a = c × b```

```
func * <Unit1， Unit2， Result> (lhs: MyMeasurement<Unit2>， rhs: MyMeasurement<Unit1>) -> MyMeasurement<Result>
    where Result: Product， Result.Factor1.Family == Unit1.Family， Result.Factor2.Family == Unit2.Family
{
    return rhs * lhs
}
```

这和先前的函数不完全类似，它将 lhs和 rhs 置换了。实现方式仅仅是转发给其他重载方法。

```b = a / c   and  c = a / b```

```
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
```

同样的方式，不过泛型参数的位置发生了变化。

## 具体实现

现在它终于可以表示关系 路程 = 速度 × 时间（即 速度 = 路程 / 时间）

```
extension Meters: Product {
    typealias Factor1 = MetersPerSecond
    typealias Factor2 = Seconds
}
```

它可以这样用:

```
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
```

它的工作效果不错，但是有两个明显的缺点。第一个是目前的编译器无法推断出自动计算的返回类型，我不知道是否今后的编译器可以解决这个问题，也许我可以通过在函数中设置更好的泛型约束的方式提供一些帮助，但是尝试之后，依然没能解决问题。
第二点是参数的单位需要有正确的单位族，返回类型的单位会被使用 ```Product``` 协议的具体单位所限制。因此类似 ```let tripLength: MyMeasurement<Kilometers> = ...``` 并不会起作用，你必须先提供以米形式的结果，然后再把它转换。这是一个非常大的限制。

## 结论

忽略这个设计的缺陷（确实存在），你得注意不止一行可执行代码需要为类型系统增加数学关系！仅仅通过添加协议一致（即定义两个关联类型），我们就可以从字面上把任务 1 meter = 1 m/s × 1 s 添加给编译器的“真理”池。但如果你要添加其他数学关系（比如1 J = 1 W × 1 s），那么我们就必须再添加一个协议一致。
我觉得这种写法非常吸引我。但尽管如此，我不认为这个基于幽灵类型的 API 优于苹果基础库中的 API，基于单位族而不是单位的度量值其实只会更加有意义。