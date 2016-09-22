title: "在 Foundation 框架中的度量值和单位"
date: 2016-09-22
tags: [iOS 开发]
categories: [Ole Begemann]
permalink: measurements-and-units
keywords: 
custom_title: 
description: 

---
原文链接=http://oleb.net/blog/2016/07/measurements-and-units/
作者=Ole Begemann
原文日期=2016-07-28
译者=粉红星云
校对=saitjr
定稿=CMB

<!--此处开始正文-->

文章更新日志:

- 2016/06/30 增加了一个“[不足之处](https://oleb.net/blog/2016/07/measurements-and-units/#what-i-dont-like)”小节，主要关于语法冗长。还有很少一部分内容的重写。
- 2016/08/02 把代码更新到 Xcode 8 beta 4 版本的。

这个系列的其他文章:

1. 在 Foundation 框架中的度量值和单位（本篇文章）
2. [乘法和除法](https://oleb.net/blog/2016/07/unitproduct/)
3. [改良](https://oleb.net/blog/2016/07/unitsquare/)
4. [幽灵类型 (Phantom Types) ](https://oleb.net/blog/2016/08/measurements-and-units-with-phantom-types/)

在 iOS 10 和 macOS 10.12 里的 Foundation 框架，新出了一系列将[度量单位](https://en.wikipedia.org/wiki/Units_of_measurement)模型化的类型，我们在现实中真实使用的度量单位，比如：1 千米，21 摄氏度。如果你还没了解过这个，看看 [WWDC session 238](https://developer.apple.com/videos/play/wwdc2016/238/) 吧，这里概述讲的挺好的。

<!-- more -->

## 介绍

这个例子向你展示了下用法。让我们从新建一个[我上次骑行](http://www.gpsies.com/map.do?fileId=jlrraxtktaxippup)的距离的常量开始。

```swift
let distance = Measurement(value: 106.4, unit: UnitLength.kilometers)
// → 106.4 km
```

这度量值（[Measurement](https://developer.apple.com/reference/foundation/nsmeasurement)，在 swift 中是一个[值类型](https://developer.apple.com/swift/blog/?id=10)）包含了数量（106.4）和度量单位（千米）。我们也可以自己定义一个单位，但是在 Foundation 框架中已经有了一堆常见的物理量（physical quantities）。目前已存在 [21 种已定义单位类型](https://developer.apple.com/reference/foundation/nsdimension)。他们都是抽象类（[Dimension](https://developer.apple.com/reference/foundation/nsdimension)）的子类，并且类名也是以 `Unit` 开头的。比如：[UnitAcceleration](https://developer.apple.com/reference/foundation/nsunitacceleration)，[UnitMass](https://developer.apple.com/reference/foundation/nsunitmass)，和 [UnitTemperature](https://developer.apple.com/reference/foundation/nsunittemperature) 等等。我们在这里用的是 [UnitLength](https://developer.apple.com/reference/foundation/nsunitlength) 。

每一个单位类提供了类属性来描述其相关的各种单位。比如有米，千米，英里和光年。我们可以这么写，来把我们原来在千米的度量值转换为其他单位：

```swift
let distanceInMeters = distance.converted(to: .meters)
// → 106400 m
let distanceInMiles = distance.converted(to: .miles)
// → 66.1140591795394 mi
let distanceInFurlongs = distance.converted(to: .furlongs)
// → 528.911158832419 fur
```

`UnitLength` 自带 [22 个预定义好的的单位属性](https://developer.apple.com/reference/foundation/nsunitlength)，从皮米到光年都有。如果没有你[需要的单位](https://www.youtube.com/watch?v=r7x-RGfd0Yk)，新建自定义的也十分简单。只要给这个类扩展一个静态的属性，属性包含描述新单位的标志和它转换为本类型的基本单位的换算因素就行了。后面这部分是使用 [UnitConverter](https://developer.apple.com/reference/foundation/unitconverter) 这个类搞定的。基本单位可以是其他同类型预定义的单位。它一定是已经在文档里的并且通常与（但不一定是）[国际单位制](https://en.wikipedia.org/wiki/International_System_of_Units)对应的基本单位。对于 `UnitLength` 来说，基本单位就是米（.meters）。

```swift
extension UnitLength {
    static var leagues: UnitLength {
        // 1 league = 5556 meters
        return UnitLength(symbol: "leagues", 
            converter: UnitConverterLinear(coefficient: 5556))
    }
}

let distanceInLeagues = distance.converted(to: .leagues)
// → 19.150467962563 leagues
```

(我更倾向使用静态存储常量而不是一个计算属性，但是在 `NSObject` 的子类扩展中，不怎么支持存储属性。了解更多详见 [ SR-993 ](https://bugs.swift.org/browse/SR-993) 。)


我们也可以使用标量值乘上度量值，或给度量值做加减。在需要时，单位的转换是自动处理的:

```swift
let doubleDistance = distance * 2
// → 212.8 km
let distance2 = distance + Measurement(value: 5, unit: UnitLength.kilometers)
// → 111.4 km
let distance3 = distance + Measurement(value: 10, unit: UnitLength.miles)
// → 122493.4 m
```

注意到上个例子，当我们添加一个千米和一个英里的度量值时，框架把他们全转换成米（ `UnitLength` 的基本单位）才相加的。原始单位的信息丢失了。而在先前的例子中都没有发生过，那是因为之前是两个相同单位的度量值（千米）。


## 优点

### 安全

目前为止运作良好。而且比我们通常的使用简单的浮点数字来做度量值、使用变量名来编码单位，像 `distanceInKilometers` 或 `temperatureInCelsius` 等要好多了。不仅预防了[沟通上的误解](https://www.wired.com/2010/11/1110mars-climate-observer-report/)，更严谨的类型也让编译器可以来帮忙检查我们的逻辑：错误的将长度单位添加到温度单位类中这样的事情不再可能，因为这样代码就编译不起来了。

### 更富有表现力的 API

在未来，采用新类型的 API（无论是苹果原生，还是第三方），会变得更加有表现力和自动文档化。

假设有一个旋转图片的方法。现在可能要用 `Double` 来接收 *angle* 参数，而且作者要写明这个方法是接收弧度制还是角度值的参数，调用 API 的开发者也需要注意不要传错参数。在有单位的新世界里，角度参数的类型一定会是 [UnitAngle](https://developer.apple.com/reference/foundation/nsunitangle)，同时解放了 API 的作者和调用者。不仅采用了最为明了的处理方式，并且排除了转换错误产生的 bug。

同样，一个动画 API 不再需要文档解释 *duration* 参数。参数的单位简单明了的是 [UnitDuration](https://developer.apple.com/reference/foundation/nsunitduration) 类型。

### `MeasurementFormatter`

最后，还附带了一个 [MeasurementFormatter](https://developer.apple.com/reference/foundation/nsmeasurementformatter) 类。它能将度量值换算为本地化的值，更加地域化（比如使用英里，而不是公里），数字格式和符号都参与换算。

```swift
let formatter = MeasurementFormatter()
let 🇩🇪 = Locale(identifier: "de_DE")
formatter.locale = 🇩🇪
formatter.string(from: distance) // "106,4 km"

let 🇺🇸 = Locale(identifier: "en_US")
formatter.locale = 🇺🇸
formatter.string(from: distance) // "66.114 mi"

let 🇨🇳 = Locale(identifier: "zh_Hans_CN")
formatter.locale = 🇨🇳
formatter.string(from: distance) // "106.4公里"
```

### 不足之处

新 API 有个不讨喜的点，太过冗长。 `Measurement(value: 5, unit: UnitLength.kilometers)` 这句代码的读写性都很差。虽然要找到既简洁，又能清晰表达的方法命名很难，但这个方法也有些太过冗长了。

有种较为极端的初始方式： `let d = 5.kilometers`。这个阅读性超好，但是还是有一个缺点——污染了通用的整型和浮点的命名空间。有点像这种表达：`5.measure.kilometers`。

去掉参数标志对初始化方法来说已经是一个很大的进步了。`let d = Measurement(5, UnitLength.kilometers)` 更好理解。现在很喜欢给每一个单位类型添加一个别名，从而摆脱掉 `UnitLength` 的前缀，像下面这样：

```swift
typealias Length = Measurement<UnitLength>
let d = Length(5, .kilometers)

typealias Duration = Measurement<UnitDuration>
let t = Duration(10, .seconds)
```

这些加到你自己的项目中还是挺容易的，只需要苹果出一个更加标准的语法。

### 单位类之间的关系

我们已经见过相同类型的度量值的相加了，如果我需要计算在单车骑行中的平均速度呢？速度等于距离除于时间，我们新建一个骑行时间的度量值然后可以做这个计算：

```swift
// 8h 6m 17s
let time = Measurement(value: 8, unit: UnitDuration.hours)
    + Measurement(value: 6, unit: UnitDuration.minutes)
    + Measurement(value: 17, unit: UnitDuration.seconds)
let speed = distance / time
// error: binary operator '/' cannot be applied to operands of type 'Measurement<UnitLength>' and 'Measurement<UnitDuration>'
```

这个除法运算会产生一个编译错误。发现苹果（可能在第一个版本的时候更明智些）断开了类型之间的关联。所以我们不能用 `UnitLength` 来除以 `UnitDuration`，最后得到一个 [UnitSpeed](https://developer.apple.com/reference/foundation/nsunitspeed) 类型。不过手动添加很简单。我们只需要提供一个对应的除法运算符 `/` 的重载方法：

```swift
func / (lhs: Measurement<UnitLength>, rhs: Measurement<UnitDuration>) -> Measurement<UnitSpeed> {
    let quantity = lhs.converted(to: .meters).value / rhs.converted(to: .seconds).value
    let resultUnit = UnitSpeed.metersPerSecond
    return Measurement(value: quantity, unit: resultUnit)
}
```

在执行运算的时候，我们把长度值转换为米的单位，持续时间用秒的单位，并且返回值的单位是米 / 秒。现在编译器可开心了：

```swift
 let speed = distance / time
 // → 3.64670802344312 m/s
 speed.converted(to: .kilometersPerHour)
 // → 13.1281383818845 km/h
```

## 能更加优雅一些吗？

这种做法挺好的，但是有点受限。我们需要给各种反向运算提供一个额外的重载方法，比如：距离 = 速度 × 时间、时间 = 距离 / 速度。如果我们还想表达其他的关系，比如：电阻 = 电压 / 电流，我们要全部再写一遍。如果可以一次性陈述表达各种关系，之后使用的时候自动就能用这个关系的话是不是超级厉害。我在[下一篇文章](https://oleb.net/blog/2016/07/unitproduct/)中将会向你介绍这个。
