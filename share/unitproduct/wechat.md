将 Measurements 和 Units 应用到物理学"

> 作者：Ole Begemann，[原文链接](http://oleb.net/blog/2016/07/unitproduct/)，原文日期：2016-07-29
> 译者：[钟颖](undefined)；校对：[小铁匠Linus](http://linusling.com)；定稿：[CMB](https://github.com/chenmingbiao)
  







更新：
2016-08-02
为 Xcode 8 beta 4 更新代码

本系列其他文章：

(1) [Measurements 和 Units 概览](http://oleb.net/blog/2016/07/measurements-and-units/)

(2) 乘法和除法（本文） 

(3) [内容提炼](http://oleb.net/blog/2016/07/unitsquare/)

*感谢 [Chris Eidhof](http://chris.eidhof.nl/) 和 [Florian Kugler](http://floriankugler.com/) 帮助我想出这个解决方案。*



在[上篇文章](http://oleb.net/blog/2016/07/measurements-and-units/)结束时，我就计划实现一个通用的、声明式的方案来描述物理量间依赖关系的解决方案，例如 *速度 = 长度 / 时间*。现在，让我们来具体实现这个想法吧。



## 方程的通用形式

目前，不同的 `Unit` 类本身对其他类并没有什么关联。对类型系统而言，他们是独立存在的实体[^1]。然而，在现实生活中，这些物理量之间是有联系的，并且我们可以通过一些方程来描述他们之间的关系。上面已经提到了一个例子，这里还有很多：

| 物理量之间的关系 |
| ---------------- |
| *速度 = 长度 / 时间* |
| *加速度 = 速度 / 时间* |
| *面积 = 长度 × 长度* |
| *体积 = 长度 × 长度 × 长度 = 面积 × 长度* |
| *电阻 = 电压 / 电流* |
| *功 = 功率 × 时间* |
| *密度 = 质量 / 体积* |
| *力 = 质量 × 加速度* |
| *压强 = 力 / 面积* |
| *力矩 = 力 × 长度* |

首先要注意的是，我们可以把所有的方程都归纳成 *a = b × c* 的形式，而除法可以被重写成乘法的形式：*速度 = 长度 / 时间 ⇔ 长度 = 速度 × 时间*。

其次，虽然有些方程超过了两个因子，我们总是可以通过一个中间量将其归纳成只有两个因子的形式（见上述例子中的体积方程式）。

## UnitProduct 协议

因此，我们需要找到一个方式，可以在类型系统中通过三个 unit 类来描述 *a = b × c* 的关系，并且我们希望这个实现方式可以被任意类型所接受。所以我们定义一个叫做 `UnitProduct` 的协议，他有 `Factor1` 和 `Factor2` 两个关联类型。我们将其类型设定成 [`Dimension`](https://developer.apple.com/reference/foundation/nsdimension)，这是所有维度单位的父类：

    
    /// Describes the relation Self = Factor1 * Factor2.
    protocol UnitProduct {
        associatedtype Factor1: Dimension
        associatedtype Factor2: Dimension
    }

我们还需要什么呢？为了进行计算，我们需要在计算时指定这些值需要转换的实际 *单位*。换句话说，我们必须告诉类型系统，*米* 除以 *秒* 将会产生一个结果，他的单位是 *米每秒*，而不是 *千米每小时*。我们在协议里添加一个叫做 `defaultUnitMapping()` 的静态方法来实现这个目的。他会返回一个三元组，分别表示上述的 a，b 和 c。

在理想的情况下，我希望这个方法的返回值是 `(Factor1, Factor2, Self)`，但是当我们通过一个具体的类，例如 [`UnitLength`](https://developer.apple.com/reference/foundation/nsunitlength) 来实现这个协议的时候，使用 `Self` 会引起一些问题。Unit 类不是一个 final 类，意味着他可以被子类化。如果我们通过 `UnitLength` 来实现协议，并且使用 `UnitLength` 作为 `Self` 的返回值，这个实现会被其子类继承，[但这并不符合我们的协议](https://twitter.com/slava_pestov/status/755288757427838977)，因为 `Self` 指向了子类的类型。[出于此](http://stackoverflow.com/a/37555215/116862)，编译器不允许我们这样做。如果 `UnitLength` 是值类型或者 final 类的话，那结果是不同的。

作为一种可行的方案，我们可以引进第三个关联类型来表示乘法的结果。我不喜欢这个方案，因为它强制协议的实现者来指定关联类型。虽然这非常不直观，却是可行的，完整的协议将变成：

    
    protocol UnitProduct {
        associatedtype Factor1: Dimension
        associatedtype Factor2: Dimension
        associatedtype Product: Dimension // is always == Self
    
        static func defaultUnitMapping() -> (Factor1, Factor2, Product)
    }

这足够在类型系统中表示他们之间的数学关系，并且为计算提供了关于单位关系的足够信息。

接下来，我们来写一个具体的实现。请记住，我们想实现的关系是 *[UnitLength](https://developer.apple.com/reference/foundation/nsunitlength) = [UnitSpeed](https://developer.apple.com/reference/foundation/nsunitspeed) × [UnitDuration](https://developer.apple.com/reference/foundation/nsunitduration)*，所以我们让 `UnitLength` 实现了协议：

    
    /// UnitLength = UnitSpeed * UnitDuration
    /// ⇔ UnitSpeed = UnitLength / UnitDuration
    extension UnitLength: UnitProduct {
        typealias Factor1 = UnitSpeed
        typealias Factor2 = UnitDuration
        typealias Product = UnitLength
    
        static func defaultUnitMapping() -> (UnitSpeed, UnitDuration, UnitLength) {
            return (.metersPerSecond, .seconds, .meters)
        }
    }

我们通过 typealias 明确的指定了关联类型，但其实我们可以不用这么做。编译器可以通过 `defaultUnitMapping()` 方法推断其类型，我们返回的三元组 `(.metersPerSecond, .seconds, .meters)` 指出这些单位是有[相关性](https://en.wikipedia.org/wiki/Coherence_(units_of_measurement))的（将两个相乘或者相除可以得到第三个）。这些单位也恰好是它们各自类型中的基本单位，但并非一定要这么做。我们可以选择其他的值，类似 `(.kilometersPerHour, .hours, .kilometers)`，只要他们之间有相关性即可。

## 重载乘法操作符

在我们进行计算之前，还有一个步骤要做。我们需要实现协议的乘法操作符。这个方法是这样描述的，“这是一个 `UnitProduct` 的 * 运算符实现，他的左操作符是一个 `Measurement<Factor1>`，右操作符是一个 `Measurement<Factor2>`，返回值是 `Measurement<Product>`”：

    
    /// UnitProduct.Product = Factor1 * Factor2
    func * <UnitType: UnitProduct> (lhs: Measurement<UnitType.Factor1>, rhs: Measurement<UnitType.Factor2>)
        -> Measurement<UnitType> where UnitType: Dimension, UnitType == UnitType.Product {    
        let (leftUnit, rightUnit, resultUnit) = UnitType.defaultUnitMapping()
        let quantity = lhs.converted(to: leftUnit).value
            * rhs.converted(to: rightUnit).value
        return Measurement(value: quantity, unit: resultUnit)
    }

方法的实现有三个步骤。首先我们从协议中获得单位的映射。然后我们将操作数转换到各自的目标单位并且把他们相乘。最后，我们将结果包装成一个 `Measurement` 值并返回。让我们来试一下：

    
    let speed = Measurement(value: 20, unit: UnitSpeed.kilometersPerHour)
    // → 20.0 km/h
    let time = Measurement(value: 2, unit: UnitDuration.hours)
    // → 2.0 hr
    let distance: Measurement<UnitLength> = speed * time
    // → 40000.032 m

成功了，真棒！有三个值得注意的地方：

1. 目前，类型检查器还不能推断出返回值的类型，所以我们必须明确的指定其为 `Measurement<UnitLength>` 类型，我不能非常确定这是为什么。我尝试了 * 运算符泛型参数的各种约束，但还是不能让它正常工作。
2. 计算结果的单位是米，这虽然没什么大问题，但如果改成千米的话会更好，因为我们传进去的单位分别是千米每小时和小时，我们会在下篇文章中解决这个问题。
3. 计算结果会有一点舍入误差，主要是由千米每小时到米每秒的转换引起的。

## 让乘法可交换

我们需要添加三个新的方法来达到这个目的，两个除法重载和一个乘法重载。因为乘法是[可交换](https://en.wikipedia.org/wiki/Commutative_property)的，所以 *时间 × 速度* 与 *速度 × 时间* 应该完全一致。我们目前的方法不能满足这一点，但这也很好实现。只要再给 * 添加另一个重载方法，交换两个参数即可。直接返回之前重载过乘法的结果：

    
    /// UnitProduct.Product = Factor2 * Factor1
    func * <UnitType: UnitProduct>(lhs: Measurement<UnitType.Factor2>, rhs: Measurement<UnitType.Factor1>)
        -> Measurement<UnitType> where UnitType: Dimension, UnitType == UnitType.Product {
        return rhs * lhs
    }
    
    let distance2: Measurement<UnitLength> = time * speed
    // → 40000.032 m

## 除法

同样，对于除法而言我们需要重载 *Product / Factor1* 和 *Product / Factor2* 两种情况：

    
    /// UnitProduct / Factor1 = Factor2
    func / <UnitType: UnitProduct>(lhs: Measurement<UnitType>, rhs: Measurement<UnitType.Factor1>)
        -> Measurement<UnitType.Factor2> where UnitType: Dimension, UnitType == UnitType.Product {
        let (rightUnit, resultUnit, leftUnit) = UnitType.defaultUnitMapping()
        let quantity = lhs.converted(to: leftUnit).value / rhs.converted(to: rightUnit).value
        return Measurement(value: quantity, unit: resultUnit)
    }
    
    /// UnitProduct / Factor2 = Factor1
    func / <UnitType: UnitProduct>(lhs: Measurement<UnitType>, rhs: Measurement<UnitType.Factor2>)
        -> Measurement<UnitType.Factor1> where UnitType: Dimension, UnitType == UnitType.Product {
        let (resultUnit, rightUnit, leftUnit) = UnitType.defaultUnitMapping()
        let quantity = lhs.converted(to: leftUnit).value / rhs.converted(to: rightUnit).value
        return Measurement(value: quantity, unit: resultUnit)
    }
    
    let timeReversed = distance / speed
    // → 7200.0 s
    timeReversed.converted(to: .hours)
    // → 2.0 hr
    let speedReversed = distance / time
    // → 5.55556 m/s
    speedReversed.converted(to: .kilometersPerHour)
    // → 20.0 km/h

有趣的是，类型检查对除法运算是管用的。我猜测，除法运算时其中的参数能直接追溯到其泛型参数的 `UnitType`，而在乘法运算时其中的参数只是泛型参数的关联类型。我尝试在乘法运算中将参数 `Factor1` 和 `Factor2` 定义成完整的泛型参数，但这并不管用。如果你知道这是为什么的话请告诉我。

## 通过 5 行代码实现协议

现在，描述三个物理量之间的关系，我们需要做的仅仅是实现这个协议，并且实现一个只有一行代码的方法。这里拿电阻（[`UnitElectricResistance`](https://developer.apple.com/reference/foundation/nsunitelectricresistance)），电压（[`UnitElectricPotentialDifference`](https://developer.apple.com/reference/foundation/nsunitelectricpotentialdifference)）和电流（[`UnitElectricCurrent`](https://developer.apple.com/reference/foundation/nsunitelectriccurrent)）来举例：

    
    /// UnitElectricPotentialDifference = UnitElectricResistance * UnitElectricCurrent
    extension UnitElectricPotentialDifference: UnitProduct {
        static func defaultUnitMapping() -> (UnitElectricResistance, UnitElectricCurrent, UnitElectricPotentialDifference) {
            return (.ohms, .amperes, .volts)
        }
    }

这样使用：

    
    let voltage = Measurement(value: 5, unit: UnitElectricPotentialDifference.volts)
    // → 5.0 V
    let current = Measurement(value: 500, unit: UnitElectricCurrent.milliamperes)
    // → 500.0 mA
    let resistance = voltage / current
    // → 10.0 Ω

## 结语

我觉得这非常酷，而且向我们展示了强大的类型系统是如何帮助我们写出正确代码的。一旦定义好了关系，编译器就不允许我们进行无意义的计算了（比如将分子和分母搞混）。在类型推断的过程中，编译器甚至能告诉我们运算结果的类型（请注意上面最后一个例子中，我们并没有指定`电阻`的类型）。

我同样喜欢[声明式](https://en.wikipedia.org/wiki/Declarative_programming)来描述关系的方式。本质上我们只需要告诉编译器：“嘿，这就是这三个量之间的关系，剩下的事情你搞定”，然后所有的运算和类型检查都很完美地完成了。

## 展望

在[第三部分](http://oleb.net/blog/2016/07/unitsquare/)中，我会提出一个可能的解决方案，它能够在计算过程中保留单位（千米除以小时得到千米每小时，而不是米每秒），并讨论当前解决方案的另一个局限性。敬请关注！

[^1]: 他们有一个共同的父类，但在这个时候并不重要。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。