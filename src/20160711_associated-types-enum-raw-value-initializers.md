title: "带有关联类型的枚举的原始值初始化构造器"
date: 2016-07-11
tags: [Swift 进阶]
categories: [APPVENTURE]
permalink: associated-types-enum-raw-value-initializers
keywords: 关联类型的初始化构造器,枚举
custom_title: 
description: Swift 常用到枚举，本文就说下如何使用关联类型的初始化构造器来优化枚举。

---
原文链接=http://appventure.me/2016/04/23/associated-types-enum-raw-value-initializers/
作者=Benedikt Terhechte
原文日期=2016/04/23
译者=Lanford3_3
校对=saitjr
定稿=CMB

<!--此处开始正文-->

在 Swift 中，枚举（[Enums](https://appventure.me/2015/10/17/advanced-practical-enum-examples/)）是一种优雅的结构化信息的方式。有时候你会发现自己需要通过原始值（raw values）来构造枚举，因为这些值可能零星地存储在某些地方，比如 `NSUserDefaults`：

```swift
enum Device: String {
  case Phone, Tablet, Watch
}
let aDevice = Device(rawValue: "Phone")
print(aDevice)

// 打印结果为： Optional(main.Device.Phone)
```

<!--more-->

### 问题

但只要你在枚举中用了关联值（associated values），这种方式就失效了。比如这样的枚举：

```swift
enum Example {
   case Factory(workers: Int)
   case House(street: String)
}
```

由于这个枚举的两个成员（`case`）*Factory* 和 *House* 有着不同的关联类型（`workers` 是整型而 `street` 是字符串），所以 Swift 无法构造出 `Example` 的实例。`Example` 各成员的调用需要不同类型的参数，所以这种方法无法通用。

然而，就算所有成员的关联类型都相同，这种方法也不管用：

```swift
enum Device {
    case Phone(name: String, screenSize: CGSize)
    case Watch(name: String, screenSize: CGSize)
    case Tablet(name: String, screenSize: CGSize)
}
```

在这个例子中，所有关联类型（associated types）都是一样的——事实上，有很多种方式都能说明问题，但是我发现用 `Device` 枚举更能简明扼要的阐述清楚——即使每个 `Device` 成员的关联类型都是一样的，你仍然无法使用原始值什么的来创建它并得到正确的类型。你需要进行[匹配](https://appventure.me/2015/08/20/swift-pattern-matching-in-detail/)以创建正确的实例：

```swift
import Foundation

enum Device {
    case Phone(name: String, screenSize: CGSize)
    case Watch(name: String, screenSize: CGSize)
    case Tablet(name: String, screenSize: CGSize)

    static func fromDefaults(rawValue: String, name: String, screenSize: CGSize) -> Device? {
        switch rawValue {
        case "Phone": return Device.Phone(name: name, screenSize: screenSize)
        case "Watch": return Device.Watch(name: name, screenSize: screenSize)
        case "Tablet": return Device.Tablet(name: name, screenSize: screenSize)
        default: return nil
        }
    }
}
let b = Device.fromDefaults("Phone", name: "iPhone SE", screenSize: CGSize(width: 640, height: 1136))
print(b)

// 打印结果为： Optional(main.Device.phone("iPhone SE", (640.0, 1136.0)))
```

这看起来还好，但这些代码**确实**有些冗余了。一旦你需要创建的枚举中有着三个以上的枚举成员或者两种以上的关联类型，事情就会很快失控。

```swift
enum Vehicle {
  case Car(wheels: Int, capacity: Int, weight: Int, length: Int, height: Int, width: Int, color: Int, name: Int, producer: Int, creation: NSDate, amountOfProducedUnits: Int)
  case Ship(wheels: Int, capacity: Int, weight: Int, length: Int, height: Int, width: Int, color: Int, name: Int, producer: Int, creation: NSDate, amountOfProducedUnits: Int)
  case Yacht(wheels: Int, capacity: Int, weight: Int, length: Int, height: Int, width: Int, color: Int, name: Int, producer: Int, creation: NSDate, amountOfProducedUnits: Int)
  case Truck(wheels: Int, capacity: Int, weight: Int, length: Int, height: Int, width: Int, color: Int, name: Int, producer: Int, creation: NSDate, amountOfProducedUnits: Int)
  case Motorbike(wheels: Int, capacity: Int, weight: Int, length: Int, height: Int, width: Int, color: Int, name: Int, producer: Int, creation: NSDate, amountOfProducedUnits: Int)
  case Helicopter(wheels: Int, capacity: Int, weight: Int, length: Int, height: Int, width: Int, color: Int, name: Int, producer: Int, creation: NSDate, amountOfProducedUnits: Int)
  case Train(wheels: Int, capacity: Int, weight: Int, length: Int, height: Int, width: Int, color: Int, name: Int, producer: Int, creation: NSDate, amountOfProducedUnits: Int)
  // ...
}
```

我想你明白我想表达的意思。

### 解决方法

所以……我们应该怎么处理这种情况呢？有趣的是，在关联类型的初始化构造器（initializer）和闭包间有种迷之相似性。看看下面的代码：

```swift
enum Example {
    case Test(x: Int)
}
let exampleClosure = Example.Test
```

代码中 `exampleClosure` 的类型是什么？答案是：`(Int) -> Example`。是的，不添加参数调用一个带有关联类型的枚举成员会生成一个闭包，若是使用正确类型的参数来调用这个闭包，就会返回一个枚举成员实例。

这说明了下面的代码是正确的，能够正常工作：

```swift
enum Fruit {
    case Apple(amount: Int)
    case Orange(amount: Int)
}

let appleMaker = Fruit.Apple
let firstApple = appleMaker(amount: 10)
let secondApple = appleMaker(amount: 12)
print(firstApple, secondApple)

// 打印结果为： Apple(10) Apple(12)
```

所以，这将如何帮助我们简化上面糟糕的代码重复问题呢？让我们来看看：

```swift
import Foundation

enum Device {
    case Phone(name: String, screenSize: CGSize)
    case Watch(name: String, screenSize: CGSize)
    case Tablet(name: String, screenSize: CGSize)

    private static var initializers: [String: (name: String, screenSize: CGSize) -> Device] = {
        return ["Phone": Device.Phone, "Watch": Device.Watch, "Tablet": Device.Tablet]
    }()

    static func fromDefaults(rawValue: String, name: String, screenSize: CGSize) -> Device? {
        return Device.initializers[rawValue]?(name: name, screenSize: screenSize)
    }
}

let iPhone = Device.fromDefaults("Phone", name: "iPhone SE", screenSize: CGSize(width: 640, height: 1134))
print(iPhone)

// 打印结果为：Optional(main.Device.Phone("iPhone SE", (640.0, 1134.0)))

```

让我们试着指出这段代码做了什么。我们给 `Device` 添加了一个新属性 `initializers`。这是一个类型为 `[String: (name: String, screenSize: CGSize) -> Device]` 的字典（`Dictionary`）。也就是从 `String` 类型的键（`key`）映射到和我们的 `Device` 的成员类型相同的闭包。简单地利用之前的小技巧，通过 `Phone: Device.Phone` 这样的方式返回闭包，这个字典就包含了我们所有枚举成员的初始化构造器。

之后的 `fromDefaults` 函数，只需要知道我们想要创建的设备的键值，就可以调用合适的闭包。这使得代码实现精简了许多，尤其是对于一些更大的枚举来说（就像我们上面 **Vehicle** 的例子）。正如你所看到的，现在创建一个 `Device` 实例变得非常简单：

```swift
Device.initializers["Phone"]?(name: "iPhone 5", screenSize: CGSize(width: 640, height: 1134))
```

就像直接用原始值那样，如果枚举中没有 **Phone** 这个成员，则会返回一个空值。

当然，这个解决方案并不完美，我们仍然不得不使用 `initializers` 这个字典，然而，相较于不得不手动匹配所有的枚举成员，这样做已经减少了大量的重复工作。

最后，我想，不用我多说的是，上面的代码忽视了一点——一个合格的最佳实践应该是简洁并能够让人专注于手上的工作的。然而，像是 `Device.initializers["phone"]` 这样字符串化的方式并不是最好的写法，这些键应该被合理的定义在别的什么地方。

如果你读到这儿了，我想你应该在 [Twitter](https://twitter.com/terhechte) 上粉我（[@terhechte](https://twitter.com/terhechte)）