title: "Swift 中集合与字典的角逐"
date: 2016-01-20
tags: [Erica Sadun]
categories: [Swift 进阶]
permalink: sets-vs-dictionaries-smackdown-in-swiftlang

---
原文链接=http://ericasadun.com/2015/10/19/sets-vs-dictionaries-smackdown-in-swiftlang/
作者=Erica Sadun
原文日期=2015-10-19
译者=CMB
校对=Cee
定稿=千叶知风

<!--此处开始正文-->

传统的 `Cocoa` 在使用字典时有个不好的习惯。无论是用户信息还是字体选项亦或是视频流（AVFundation）设置，`NSDictionary` 一直担任 `Cocoa` 传递数据的角色。字典是灵活的、易用的，但它也存在诸多潜在的危险。

在这篇文章中，我将讨论另一种更加 Swift 化的方法。这并不是一个能够彻底解决问题的方法，但我认为它是一个在后 Swift 时代中能够更好展示 API 是如何工作的观念模式。

<!--more-->

### 基于字典的设置工作

下面的代码是从我自己的一个项目中抽取出来的（如果你熟悉我其他的文章或许会有印象，这是我写的 Movie Maker 类）。这几行 Objective-C 代码创建了一个名为 options 的字典，用来构建一个视频流像素缓冲区：

```Objective-C
 NSDictionary *options = @{
    (id) kCVPixelBufferCGImageCompatibilityKey : 
        @YES,
    (id) kCVPixelBufferCGBitmapContextCompatibilityKey : 
        @YES,
 };
```

这个例子中键（key）默认为 `(id)` 类型， 并且使用 Objective-C 字面量的方式将布尔类型的值转换为 `NSNumber` 类型。Swift 版本的方式将会更加得简便。而且编译器已经足够智能去把字典中值和类型关联起来（译者注：类似脚本语言，赋予值后就会自动声明为该值的类型）。

```swift
let myOptions: [NSString: NSObject] = [
    kCVPixelBufferCGImageCompatibilityKey: true,
    kCVPixelBufferCGBitmapContextCompatibilityKey: true
]
```

即使在 Swift 中，像这样将值传递给 API 也不是一种很理想的方式。

### 配置字典的特征

下面的例子展示了配置字典（Setting dictionary）的共同特征，这都是值得仔细研究的。

  * 它们有一组固定的键（key），大概有 12 个这样的像素缓冲区属性键在 AVFoundation 库里。这个集合里面的键很少会被改变，并且和一个已经确立的功能有关。

  * 实例中所对应键的值（value）均是特定的已知类型。这些类型相比 `NSObject` 类型来说显得更加细致，例如描述「图像右侧内边距的像素大小（`CFNumber` 类型）」。

  * 类型的安全*关系*着值的传递，我们无法通过一个 `NSDictionary` 保证值类型的正确传递。前面的例子因为考虑了*兼容性*，所以键的类型应该是 `Boolean` 类型，而不是 `Int` 或 `String` 或 `Array`，甚至 `NSNumber` 类型。

  * 有效的条目在字典中只会出现一次，因为键通过哈希散列存储，新条目将会覆盖旧条目。

在 Swift 中，上述列出的特性在集合和枚举中显得比字典更加典型。理由如下：

  * 枚举列出了所有给定类型的可能选项。就类似于这个例子一样，大多数 Cocoa API 都有固定、不变的键。

  * 在个别情况下，枚举可以关联类型值。Cocoa API 文档记录下了每个键可以传递的值类型。

  * 像字典一样，集合中有成员的限制以避免多个实例的产生。

基于这些原因，我觉得在 Swift 中设置集合时使用枚举会比一个 `[NSString: NSObject]` 的字典表达效果更好。

### 键的转换

停下来思考一下我们现在碰到的这个状态。AVFundation 定义了接下来所表示的一系列的键（顺便，这不是一个完整的包含所有像素缓冲键值的集合）。

```swift
const CFStringRef kCVPixelBufferPixelFormatTypeKey;
const CFStringRef kCVPixelBufferExtendedPixelsTopKey;
const CFStringRef kCVPixelBufferExtendedPixelsRightKey;
const CFStringRef kCVPixelBufferCGBitmapContextCompatibilityKey;
const CFStringRef kCVPixelBufferCGImageCompatibilityKey;
const CFStringRef
```

上面都是一些常量字符串，这些字符串都被用于作为字典的索引。调用者通过使用这些键来创建字典，通过传递任意对象作为键的值。

在 Swift 中，你可以将这个基于键值对存放的数据类型改造成一个简单的枚举：对于不同键所表示的情况，指定特定的值类型。下面例子就是用来表示上面的五种情况。所关联的类型来自现有的像素缓冲键值属性文档。

```swift
enum CVPixelBufferOptions {
 case CGImageCompatibility(Bool)
 case CGBitmapContextCompatibility(Bool)
 case ExtendedPixelsRight(Int)
 case ExtendedPixelsBottom(Int)
 case PixelFormatTypes([PixelFormatType])
 // ... etc ...
}
```

当这些选项像这样设计时，我们就得到了一个可扩展性很强而又对每种可能情况严格规定值类型的枚举类型。为一个可扩展的枚举在每个可能的情况下，严格规定值的类型。和弱字典类型相比，这种方法能够保证类型安全。

此外，在个别枚举案例也会更清晰，更简洁，使用作为数据交互也比名字很长很详细的 Cocoa 形式的常量更好。例如 `kCVPixelBufferCGBitmapContextCompatibilityKey` 这个常量名字就显得非常啰嗦。Cocoa 形式的常量通常会用 `k` 开头表示这是一个常数，使用 `CVPixelBuffer` 表示相关联的类，以及使用 `key` 表示其职责，所有的内容都在这里表示了。

### 创建配置集

通过重新设计，你可以建立一个看上去*应该*就像下面例子一样的集合。说「*应该*」是因为这段代码不能通过编译。

```swift
// This does not compile yet
let bufferOptions: Set<CVPixelBufferOptions> = 
    [.CGImageCompatibility(true), 
     .CGBitmapContextCompatibility(true)]
```

`Swift` 不能编译以上的代码，因为 `CVPixelBufferOptions` 中的配置内容（即 option）还未遵循 `Hashable` 协议。为了解决这个问题，你可以建立一个数组，但是需要注意的是这个数组无法保证只有唯一成员属性的条件：

```swift
// This compiles
let bufferOptions: [CVPixelBufferOptions] =
    [.CGImageCompatibility(true),
     .CGBitmapContextCompatibility(true)]
```

数组使用起来是十分友好的，但它无法保证配置元素的单一独立特性。字典能够提供这一点，与此同时也正在推动重新设计数组。

### 区分值

`Hashable` 协议使 `Swift` 可以区分不同的实例。集合和字典都使用了哈希来确保成员和键都是唯一的。如果没有哈希，他们不能提供这些保证。

当创建配置集合时，你希望创建并不像下面例子这样的集合，因为在这个例子中同时存在多个带有冲突的配置成员：

```swift
[.CGImageCompatibility(true),
 .CGImageCompatibility(false)] // which one?!
```

由于有不同的关联值，这显然是两个不同的枚举实例。在这个例子中，你会想让集合丢弃除了第一个被添加到集合的元素的内容，即仅仅留下 `true` 值。（字典遵循相反的规则。字典是替换现有成员，而不是丢弃。）

通过实现哈希，使你能够比较枚举类型。

### 实现哈希值

对于这个特定的用例，你需要创建一个哈希函数，该函数只考虑唯一的情况，而不是考虑关联值。目前在 Swift 中没有提供此功能的构造函数，所以你需要自己创建这个构造函数。

Swift 中 `Hashable` 要遵从 `Equatable` 协议，因此，你的实现必须解决两组的要求。对于 `Hashable` 协议，你必须返回一个哈希值。对于 `Equatable` 协议 ，必须实现 `==` 函数。

```swift
public var hashValue: Int { get } // hashable
public func ==(lhs: Self, rhs: Self) -> Bool // equatable
```

基本的枚举，例如 `MyEnum {case A, B, C}` 提供了原始值，这个原始值告诉你哪些项你正在使用。这些值都是从零开始，并都使用起来十分方便。不幸的是，枚举的关联值不提供原始值的支持，使这项工作变得更加困难。所以，你必须亲手建立哈希值。

下面是 `CVPixelBufferOptions` 的扩展 ，它手动为每一种情况增加哈希值。

```swift
extension CVPixelBufferOptions: 
    Hashable, Equatable {
    public var hashValue: Int {
        switch self {
          case .CGImageCompatibility: return 1
          case .CGBitmapContextCompatibility: return 2
          case .ExtendedPixelsRight: return 3
          case .ExtendedPixelsBottom: return 4
          case .PixelFormatTypes: return 5
       }
    }
}

public func ==(lhs: CVPixelBufferOptions,
    rhs: CVPixelBufferOptions) -> Bool {
    return lhs.hashValue == rhs.hashValue
}
```

从最直观的一面可以看出这些哈希值绝对没有任何意义而且也不会暴露给 API 的使用者，所以如果你需要添加额外的值，你也可以这样做。这种做法是有些丑陋以及不那么的 Swift 化，但是很有技巧性。

一旦你添加这些功能，一切都将开始工作。你可以创建配置集合，来保证每一个配置只出现一次以及保证它们的值关联的是正确的类型。

### 最终的思考

在这篇文章中所描述的稍些笨重的哈希方法在使用上远胜于 Cocoa 提供的 `NSDictionary` 方法。类型安全、枚举和集合为那些古老过时的 API 提供了更好的解决方案。

Swift *真正*所需要的，我想是配置集合与关联值能更好的关联在一起。至少，在所有的枚举项中添加原始值的支持（不只是基本的那些缺乏相关的或内在价值）将是向前迈进一大步。

感谢 Erik Little。