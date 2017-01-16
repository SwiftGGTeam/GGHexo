title: "Swift：UserDefaults 协议（ Swift 视角下的泛字符串类型 `API` ）"
date: 2017-01-16
tags: [iOS 开发]
categories: [medium.com]
permalink: swift-userdefaults-protocol
keywords: userDefaults,协议
custom_title: 
description: 

---
原文链接=https://medium.com/swift-programming/swift-userdefaults-protocol-4cae08abbf92#.nivsq4rph
作者=Andyy Hope
原文日期=2016-11-01
译者=Yake
校对=pmst
定稿=CMB

<!--此处开始正文-->

无论是从语言本身还是项目代码，`Swift3` 的革新无疑是一场“惊天海啸” ，一些读者可能正奋战在代码迁移的前线。但即使有如此之多的改动， `Swift` 中依旧存在许多基于 `Foundation` 框架，泛字符串类型的  `API` 。这些 `API` 完全没有问题，只是...

我们对这种 `API` 有一种既爱又恨的感情：偏爱它的灵活性；又恨一时粗心导致问题接踵而来。这简直是在刀尖上编程。

`Foundation` 框架的开发者们之所以提供泛字符串类型的接口，是考虑到无法准确预见我们未来会如何使用这个框架。这些开发者们极尽自己的智慧、能力和知识，最终决定在某些 `API` 中使用字符串，这为我们开发人员带来了无尽的可能性，也可以说是一种黑魔法。

<!--more-->

## UserDefaults

今天的主题是我学习 iOS 开发初期最先熟悉的 `API` 之一。对于那些不熟悉它的人来说，它不过是对一系列信息的持久化存储，例如一张图片，一些应用的设置等。部分开发者偏向于认为它是"轻量级的 `Core Data` 。尽管人们绞尽脑汁想要把它作为替代品楔入，但结果表明它还远远不够强大。

### Stringly typed API

```swift
UserDefaults.standard.set(true, forKey: “isUserLoggedIn”)
UserDefaults.standard.bool(forKey: "isUserLoggedIn")
```

这是 `UserDefaults` 在平常应用中的基础用法，它向我们提供了持久存储和取值的简单方法，在应用中随处可以覆盖或者删除数据。由于缺少一致性和上下文，我们一不小心就会犯错，但更有可能是拼写错误。在这篇文章当中，我们将会改变 `UserDefaults` 在通常意义上的特性，并根据我们的需要进行定制。

### 使用常量

```swift
let key = "isUserLoggedIn"
UserDefaults.standard.set(true, forKey: key)
UserDefaults.standard.bool(forKey: key)
```

如果你遵从这种奇妙的技巧，我保证你很快就能将代码写得更好。如果你需要多次重复使用一个字符串，那么将它转换成一个常量，并在你的余生一直遵守这种规则，然后记得下辈子谢谢我。

### 分组常量

```swift
struct Constants {
    let isUserLoggedIn = "isUserLoggedIn"
}
...
UserDefaults.standard
   .set(true, forKey: Constants().isUserLoggedIn)
UserDefaults.standard
   .bool(forKey: Constants().isUserLoggedIn)
```

一种可以帮我们维持一致性的模式就是将我们所有重要的默认常量分组写在同一个地方。这里我们创建了一个常量结构体来存储并指向我们的默认值。

还有一个建议是将你的属性名字设置成它对应的值，尤其是跟默认值打交道的时候。这样做可以简化你的代码并使属性在整体上有更好的一致性。拷贝属性名，将他们粘贴在字符串中，这样可以避免拼写错误。

```swift
let isUserLoggedIn = "isUserLoggedIn"
```

### 添加上下文

```swift
struct Constants {
    struct Account
        let isUserLoggedIn = "isUserLoggedIn"
    }
}
...
UserDefaults.standard
   .set(true, forKey: Constants.Account().isUserLoggedIn)
UserDefaults.standard
   .bool(forKey: Constants.Account().isUserLoggedIn)
```

创建一个常量结构体完全没有问题，但是在我们写代码的时候记得提供上下文。我们努力的目标是让自己的代码对任何人都具有较高的可读性，包括我们自己。

```swift
Constants().token // Huh?
```

`token` 是什么意思？当有人试图搞清楚这个 `token` 的意义是什么的时候，缺少命名空间上下文使得新人或者不熟悉代码的人很难搞清楚这意味着什么，甚至包括一年后的原作者。

```swift
Constants.Authentication().token // better
```

### 避免初始化

```swift
struct Constants {
    struct Account
        let isUserLoggedIn = "isUserLoggedIn"
    }
    private init() { }
}
```

我们绝对不打算，也不想让常量结构体被初始化，所以我们把初始化方法声明为私有方法。这只是一个预防性措施，但我仍然推荐这么做。至少这样做可以避免我们在只想要静态变量时却不小心声明了实例变量。说到静态变量...

### 静态变量

```swift
struct Constants {
    struct Account
        static let isUserLoggedIn = "isUserLoggedIn"
    }
    ...
}
...
UserDefaults.standard
   .set(true, forKey: Constants.Account.isUserLoggedIn)
UserDefaults.standard
   .bool(forKey: Constants.Account.isUserLoggedIn)
```

你可能已经注意到了，我们每次获取 `key` ，都需要初始化它所属的结构体。与其每次都这么做，我们不如把它声明为静态变量。

我们使用 `static` 而非 `class` 关键字，是因为结构体作为存储类型时只允许使用前者。依据 `Swift` 的编译规则，结构体不能使用 `class` 声明属性。但如果你在一个类中使用 `static` 声明属性，这跟使用 `final class` 声明属性是一样的。

```swift
final class name: String
static name: String
// final class == static
```

### 使用枚举类型避免拼写错误

```swift
enum Constants {
    enum Account : String {
        case isUserLoggedIn
    }
    ...
}
...
UserDefaults.standard
    .set(true, forKey: Constants.Keys.isUserLoggedIn.rawValue)
UserDefaults.standard
    .bool(forKey: Constants.Keys.isUserLoggedIn.rawValue)
```

文章中我们提到了，为了一致性我们需要使属性能反映出他们的值。这里我们会将这种一致性更进一步，采用 `enum case` 来代替 `static let` 来将这个过程自动化。

你可能已经注意到了，我们已经创建了 `Account` 并让其遵守 `String` 协议，而 `Stirng` 遵守了 `RawRepresentable` 协议。这么做是因为，如果我们不给每个 `case` 提供一个 `RawValue` ，这个值将和声明的 `case` 保持一致。这么做会减少很多手动的输入或者复制粘贴字符串，减少错误的发生。

```swift
// Constants.Account.isUserLoggedIn.rawValue == "isUserLoggedIn"
```

到目前为止我们已经使用 `UserDefaults` 做了一些很酷的事情，但其实我们做的还不够。最大的问题是我们仍然在使用泛字符串类型 `API` ，即使我们已经对字符串做了一些修饰，但对于项目来说还不够好。

在我们的认知中，语言提供给我们什么，我们就只能干什么。然而 `Swift ` 是一门如此棒的语言，我们已经在挑战过去写 `Objective-C` 时学习到和了解的知识。接下来，让我们回到厨房给这些 `API` 加些语法糖作料。

### `API` 目标

```swift
UserDefaults.standard.set(true, forKey: .isUserLoggedIn) 
// #APIGoals
```

下面，我们会力争创建一些在与 `UserDefaults` 打交道时更好用的 `API` ，以此满足我们的需要。而比较好的做法莫过于使用协议扩展。

### `BoolUserDefaultable`

```swift
protocol BoolUserDefaultable {
    associatedType BoolDefaultKey : RawRepresentable
}
```

首先我们来为布尔类型的 `UserDefalts` 创建一个协议，这个协议很简单，没有任何变量和需要实现的方法。然而，我们提供了一个叫做 `BoolDefaultKey` 的关联类型，这个类型遵守 `RawRepresentable` 协议，接下来你会明白为什么这么做。

### 扩展

```swift
extension BoolUserDefaultable 
    where BoolDefaultKey.RawValue == String { ... }
```

如果我们准备遵守协议的 `Crusty` 定律，首先声明一个协议扩展。并且使用一个 `where` 句法，限制扩展只适用于关联类型的 `RawValue` 是字符串的情况。

> 每一个协议，都有一个相当且相符合的协议扩展- `Crusty` 第三定律。

### `UserDefault` 的 `Setter` 方法

```swift
// BoolUserDefaultable extension
static func set(_ value: Bool, forKey key: BoolDefaultKey) {
    let key = key.rawValue
    UserDefaults.standard.set(value, forKey: key)
}
static func bool(forKey key: BoolDefaultKey) -> Bool {
    let key = key.rawValue
    return UserDefaults.standard.bool(forKey: key)
}
```

是的，这是对标准 `UserDefaults` 的 `API` 的简单封装。我们这么做是因为这样代码的可读性会更高，因为你只需传入简单的枚举值而不需要传入冗长的字符串(校对者注：摒弃类似下面 `Aint.Nobody.Got.Time.For.this.rawValue` 这种路径式字符串)。

```swift
UserDefaults.set(false, 
    forKey: Aint.Nobody.Got.Time.For.this.rawValue)
```

### 一致性

```swift
extension UserDefaults : BoolUserDefaultSettable {
    enum BoolDefaultKey : String {
        case isUserLoggedIn
    }
}
```

是的，我们准备扩展 `UserDefaults` ，让它遵守 `BoolDefaultSettable` 并提供一个名叫 `BoolDefaultKey` 的关联类型，这个关联类型遵守协议 `RawRepresentable`。

```swift
// Setter
UserDefaults.set(true, forKey: .isUserLoggedIn)
// Getter
UserDefaults.bool(forKey: .isUserLoggedIn)
```

我们再一次挑战了只能使用已有 `API` 的规范，而定义了我们自己的 `API` 。这是因为，当我们扩展了 `UserDefaults` ，使用我们自己的 `API` 却丢失了上下文。如果这个 `key` 不是 `.isUserLoggedIn` ，我们还会理解它到底和什么关联么？

```swift
UserDefaults.set(true, forKey: .isAccepted) 
// Huh? isAccepted for what?
```

这个 `key` 的含义很模糊，它可能代表任何东西。即使看起来没什么，但提供上下文总是有好处的。

> “有但是不需要”，比“不需要也没有”要好。

不用担心，添加上下文很简单。我们只需要给这个 `key` 添加一个命名空间。在这个例子中，我们创建了一个 `Account` 的命名空间，它包含了 `isUserLoggedIn` 这个 `key` 。

```swift
struct Account : BoolUserDefaultSettable {
    enum BoolDefaultKey : String {
        case isUserLoggedIn
    }
    ...
}
...
Account.set(true, forKey: .isUserLoggedIn)
```

### 冲突

```swift
ley account = Account.BoolDefaultKey.isUserLoggedIn.rawValue
let default = UserDefaults.BoolDefaultKey.isUserLoggedIn.rawValue
// account == default
// "isUserLoggedIn" == "isUserLoggedIn"
```

拥有两种分别遵守同一协议并提供了相同的 `key` 的类型绝对是有可能的，作为编程人员，如果我们不能在项目落地之前解决这个问题，那我们绝对要熬夜了。绝对不能冒着拿某个 `key` 改变另外一个 `key` 的值的风险。所以我们应该为我们自己的 `key` 创建命名空间。

###命名空间

```swift
protocol KeyNamespaceable { }
```

我们肯定要为此创建一个协议了，谁叫咱们是 `Swift` 开发人员。协议通常是解决任何当前面临问题的首要尝试。如果协议是巧克力酱，我们就在所有的食物上面都抹上它，即使是牛排。知道我们有多爱协议了吗？

```swift
extension KeyNamespaceable { 
  func namespace<T>(_ key: T) -> String where T: RawRepresentable {
        return "\(Self.self).\(key.rawValue)"
  }
}
```

这是一个简单的方法，它将传入的字符串做了合并，并用"."来将这两个对象分开，一个是类的名字，一个是 `key` 的 `RawValue` 。我们也利用泛型来允许我们的方法接收一个遵守 `RawRepresentable` 协议的泛型参数 `key` 。

```swift
protocol BoolUserDefaultSettable : KeyNamespaceable
```

创建了命名空间协议之后，我们再来看之前的 `BoolUserDefaultSettable` 协议并让他遵守 `KeyNamespaceable` 协议，修改之前的扩展来让他发挥新功能的优势。

```swift
// BoolUserDefaultable extension
static func set(_ value: Bool, forKey key: BoolDefaultKey) {
    let key = namespace(key)
    UserDefaults.standard.set(value, forKey: key)
}
static func bool(forKey key: BoolDefaultKey) -> Bool {
    let key = namespace(key)
    return UserDefaults.standard.bool(forKey: key)
}
...
ley account = namespace(Account.BoolDefaultKey.isUserLoggedIn)
let default = namespace(UserDefaults.BoolDefaultKey.isUserLoggedIn)
// account != default
// "Account.isUserLoggedIn" != "UserDefaults.isUserLoggedIn"
```

### 上下文

由于创建了这个协议，我们可能会感觉从 `UserDefaults` 的 `API` 中解放了，也许会因此陶醉在协议的魅力之中。在这个过程中，我们通过将 `key` 移入有意义的命名空间来创建上下文。

```swift
Account.set(true, forKey: .isUserLoggedIn)
```

但由于这个 `API` 没有完整的意义我们还是一定程度上丢失了上下文。一眼看上去，代码中没有任何信息告诉我们这个布尔值会被持久存储。为了让一切圆满，我们准备扩展 `UserDefaults` 并把我们的默认类型放进去。

```swift
extension UserDefaults {
    struct Account : BoolUserDefaultSettable { ... }
}
...
UserDefaults.Account.set(true, forKey: .isUserLoggedIn)
UserDefaults.Account.bool(forKey: .isUserLoggedIn)
```

