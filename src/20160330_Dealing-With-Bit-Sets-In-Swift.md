title: "Swift 中的位操作"
date: 2016-03-30 09:00:00
tags: [Swift 入门]
categories: [uraimo]
permalink: Dealing-With-Bit-Sets-In-Swift
keywords: swift位操作符
custom_title: 
description: 在 Swift 里面有定长整型和位运算符，那么进行位操作就是很直接的事情了，本文就来说下 Swift 中的位操作。

---
原文链接=https://www.uraimo.com/2016/02/05/Dealing-With-Bit-Sets-In-Swift/
作者=uraimo
原文日期=2016-02-05
译者=Lanford3_3
校对=numbbbbb
定稿=千叶知风

<!--此处开始正文-->

如你所知，Swift 提供了便利的定长整型以及常用的位运算符，所以使用 Swift 进行位操作似乎相当直接。

但你很快就会发现这门语言及它的标准库总是奉行“安全第一”的原则，所以，相较于你过去的习惯，使用 Swift 对位以及不同的整型的处理需要更多的类型转换。这篇文章介绍了一些必须掌握的内容。

在我做进一步阐释之前，首先快速过一遍整型的基础和位运算。

<!--more-->

> 你可以通过 [GitHub](https://github.com/uraimo/Swift-Playgrounds) 或 [zipped](https://github.com/uraimo/Swift-Playgrounds/raw/master/archives/2016-02-5-Bitwise-Playground.playground.zip) 来获取本文的 Playground 文件

### 整型和位运算符

Swift 提供了一个包含不同定长和符号类型整型的集合：**Int/UInt**， **Int8/UInt8**(8 位)，**Int16/UInt16**(16 位)，**Int32/UInt32**(32 位)，**Int64/UInt64**(64 位)。

Int 和 UInt 这两种类型是有平台依赖的：在 32 位平台上等于 **Int32/UInt32**，而在 64 位平台上等于 **Int64/UInt64**。其他整型的长度是特定的，与你编译的目标平台无关。

定长类型与位运算符结合使用起来威力十足，他们能让你所处理的数据的尺寸变得清晰明了，在对单个位进行操作时，你几乎不会用到依赖于平台的 Int 或者 UInt。

类型为定长整型的变量能够使用二进制、八进制或者十六进制值进行初始化，就像这样：

```swift
var int1:UInt8 = 0b10101010
var int2:UInt8 = 0o55
var int3:UInt8 = 0xA7
```

至于位运算，如你所愿，Swift 提供了：**NOT**(\~(单目运算符)), **AND**(运算符为 &), **OR**(运算符为\|), **XOR**(运算符为 ^)以及**左移和右移**(运算符分别为 << 和 \>>)。

这里有个要牢记的重点，对于无符号整型，左移或者右移一定的位数会在移动留下的空白位补 0。而有符号整型在右移时，使用符号位而非 0 来填充空白位。

对于长度超过一个字节的整型，Swift 也提供了一些有用的属性来进行字节序转换：`littleEndian`，`bigEndian`，`byteSwapped`，分别表示将当前整数转换为小字节序或大字节序或转换到相反的字节序。最后一点，有没有一种方法来判断我们是在 32 位平台还是 64 位平台呢？

答案是肯定的，但是考虑到[内建模块](http://ankit.im/swift/2016/01/12/swift-mysterious-builtin-module/)无法访问，我们只好在两种平台对应的定长整型(Int32 与 Int64)中任选其一，通过它与 *Int* 的长度的比较来进行判断了：

```swift
strideof(Int) == strideof(Int32) // 当前平台为 32 位平台？不是的。
```

在这里我用了 `strideof`，但在本例中，也可以用 `sizeof`。

### 整型转换

Swift 不进行隐式类型转换。你应该也已经注意到了，在进行混合类型运算时，你需要对表达式中的变量进行显式的类型转换，令其足以装下你的结果。

对于同一表达式中出现多个整数的情况，只有当其他整数的类型已经确定，且都是同一种整型的时候，Swift 才能推断出未指定类型的整数的类型，和之前一样，Swift 并不会把变量类型隐式转换到尺寸更大的整型。

下面这个例子说明了哪些操作是允许的，而哪些是不允许的：

```swift
var u8: UInt8 = 1
u8 << 2              //4: 数字 2 被认为是 UInt8 类型，u8 
                     //   被左移了两位

var by2: Int16 = 1
u8 << by2            //Error: 数据类型不一致，无法编译
u8 << UInt8(by2)     //2: 这是可行的，我们手动转换了整型的类型，
                     //   但这是不安全的！
```

也许你会问，为什么这是不安全的？

因为在把一个大尺寸的整型转换为较小的整型或者把一个无符号整型转换为一个有符号整型时，Swift 不会对变量内的值进行任何截短操作，所以如若转换后的整型无法装下赋给它的值，就会导致溢出并引发运行时错误。

当你对来自用户输入或者其他外部组件的数据进行整型的类型转换时，这点至关重要，必须铭记于心。

幸运的是，Swift 可以通过使用 `init(truncatingBitPattern:)` 构造器来进行位的截短。当你进行**不需要关心整数的实际十进制值**的位操作时这相当有用。

```swift
var u8: UInt8 = UInt8(truncatingBitPattern: 1000)
u8  // 232
```

在这个例子中，我们把 *Int* 类型的 1000(二进制表示为 `0b1111101000`)转换为 *UInt8* 类型的变量，我们只保留了 8 个最低有效位，舍弃了其他位。通过这种方式，我们得到了 232， 二进制表示为 `0b11101000`。

这也同样作用于所有 Int*n* 或 UInt*n* 整型的组合，对于带符号的 *Int* ，其符号会被忽略，位序列只被用来初始化新的整数值。对于相同长度的有符号与无符号整型，`init(bitPattern:)` 也可用，但是结果和一般的截短转换是一样的。

这种“安全第一”的方法的唯一缺点就是，当你需要进行很多类型转换时，这些截短转换会让你的代码变得臃肿。

但幸运的是，在 Swift 中，我们可以给基本类型添加新方法，通过这种方式我们可以给所有整型加入一些实用方法将他们截短为特定的尺寸，举个例子：

```swift
extension Int {
    public var toU8: UInt8{ get{return UInt8(truncatingBitPattern:self)} }
    public var to8: Int8{ get{return Int8(truncatingBitPattern:self)} }
    public var toU16: UInt16{get{return UInt16(truncatingBitPattern:self)}}
    public var to16: Int16{get{return Int16(truncatingBitPattern:self)}}
    public var toU32: UInt32{get{return UInt32(truncatingBitPattern:self)}}
    public var to32: Int32{get{return Int32(truncatingBitPattern:self)}}
    public var toU64: UInt64{get{
            return UInt64(self) //No difference if the platform is 32 or 64
        }}
    public var to64: Int64{get{
            return Int64(self) //No difference if the platform is 32 or 64
        }}
}

extension Int32 {
    public var toU8: UInt8{ get{return UInt8(truncatingBitPattern:self)} }
    public var to8: Int8{ get{return Int8(truncatingBitPattern:self)} }
    public var toU16: UInt16{get{return UInt16(truncatingBitPattern:self)}}
    public var to16: Int16{get{return Int16(truncatingBitPattern:self)}}
    public var toU32: UInt32{get{return UInt32(self)}}
    public var to32: Int32{get{return self}}
    public var toU64: UInt64{get{
        return UInt64(self) //No difference if the platform is 32 or 64
        }}
    public var to64: Int64{get{
        return Int64(self) //No difference if the platform is 32 or 64
        }}
}

var h1 = 0xFFFF04
h1
h1.toU8   // 替代 UInt8(truncatingBitPattern:h1)

var h2:Int32 = 0x6F00FF05
h2.toU16  // 替代 UInt16(truncatingBitPattern:h2)
```

### 常见按位运算模式

现在，让我们通过实践来了解些常见的按位运算模式，就把这当成谈论一些真的很有用但是在 Swift 中又没法用的东西的借口吧。

#### 字节抽取

AND 和右移（>>）的组合通常用于从较长的序列中截取位或者字节。让我们看个例子，在这个例子中，我们要从表示颜色的 RGB 值中取出单个颜色元素的值：

```swift
let swiftOrange = 0xED903B
let red = (swiftOrange & 0xFF0000) >> 16    //0xED
let green = (swiftOrange & 0x00FF00) >> 8   //0x90
let blue = swiftOrange & 0x0000FF           //0x3B
```

在这个例子中，我们通过给数据 *AND* 上一个位掩码来分离出我们感兴趣的位。我们感兴趣的位在结果中都是1，其他的都是0。为了得到我们所需要的部分并用8位去表示他，我们需要对 AND 运算的结果进行右移，移动16位得到红色部分(右移两个字节)，移动8位获得绿色部分（右移一个字节）。就是这样，这种掩码+移位的模式具有广泛的应用，但是用在子表达式中会使你的表达式很快变得难以阅读，那么为什么不把它写成所有整型的下标脚本呢？换言之，为什么不像数组一样，为整型添加上通过索引(index)来访问单个字节的功能呢？

举个例子，让我们给 Int32 添加下标脚本:

```swift
extension UInt32 {
    public subscript(index: Int) -> UInt32 {
        get {
            precondition(index<4,"Byte set index out of range")
            return (self & (0xFF << (index.toU32*8))) >> (index.toU32*8)
        }
        set(newValue) {
            precondition(index<4,"Byte set index out of range")
            self = (self & ~(0xFF << (index.toU32*8))) | (newValue << (index.toU32*8))
        }
    }
}

var i32:UInt32=982245678                        //HEX: 3A8BE12E

print(String(i32,radix:16,uppercase:true))      // Printing the hex value

i32[3] = i32[0]
i32[1] = 0xFF
i32[0] = i32[2]

print(String(i32,radix:16,uppercase:true))      //HEX: 2E8BFF8B
```

#### 神奇的 XOR

你们中的部分人可能通过简单而无用的 XOR 密码对 XOR 有了一些了解。XOR 密码通过对位流 XOR 上一个 key 进行加密，然后通过再次 XOR 那个 key 来获取原始数据。为了简单起见，我们以相同长度的信息和 key 为例:

```swift
let secretMessage = 0b10101000111110010010101100001111000 // 0x547C95878
let secretKey =  0b10101010101010000000001111111111010    // 0x555401FFA
let result = secretMessage ^ secretKey                    // 0x12894782

let original = result ^ secretKey                         // 0x547C95878
print(String(original,radix:16,uppercase:true))           // 打印16进制值
```

XOR 的这个性质还能够用来做其他事，最简单的例子是 [XOR swap](https://en.wikipedia.org/wiki/XOR_swap_algorithm), 即不使用临时变量来交换两个整型变量的值：

```swift
var x = 1
var y = 2
x = x ^ y
y = y ^ x   // y 现在为 1
x = x ^ y   // x 现在为 2
```

在 Swift 中你可以用 tuple 来做同样的事儿(看看[这儿](https://www.uraimo.com/2016/01/06/10-Swift-One-Liners-To-Impress-Your-Friends/)的第 11 项)，所以这并没什么用=，=

另外还有件你能用 XOR 来做的事儿，但是我在这儿不细说，简而言之就是构建一个传统双向链表的变种: XOR 链表。这是 XOR 的一种更有趣的使用方法，可以在 [wikipedia](https://en.wikipedia.org/wiki/XOR_linked_list) 查看更多详情.

#### 双重否定：是我们想要的那个集合吗？

类似于上面的用法的另一种常见模式，是将位掩码与双重否定结合使用，以查找输入的位序列中是否出现了特定的位或者位组合。

```swift
let input: UInt8 = 0b10101101
let mask: UInt8 = 0b00001000
let isSet = !!(input & mask)  // 如果输入序列的第四位为 1，那么 isSet 等于 1
                              // 但这代码在 Swift 中是错的 
```

双重否定是基于 C/C++(及其他一些语言)中逻辑否定的特殊表现的，事实上，在 C/C++ 中布尔型是用整型实现的（0 表示 false, 1 表示 true), 以下引用自 C99 标准：

> 如果逻辑否运算符 ! 的操作数不为 0，则运算结果为 0，否则其运算结果为 1。运算结果为整型，表达式 !E 等同于 (0==E)。

考虑到这个，双重否定的作用就变得更加清晰了。如果我们加过掩码的输入大于 0 或者等于 0， 第一个逻辑否(NOT)运算就会分别把它转为 0 或 1(实际上把这个值取反就得到我们想要的布尔值了)。而第二个逻辑否(NOT)则把输入转回原始的布尔值，（这里只有 0 或 1 这两个选择）。也许这个解释有点混乱，但是你应该能看懂。

不过 Swift 已经有了一个特有的布尔类型，而逻辑否定只能用于这些逻辑类型，所以，我们该怎么做呢？

让我们来自定义一个运算符(通常来说，我并不喜欢它们，但在此让我们破下例)，来为 `UInt8` 类型加上双重否定！

```swift
prefix operator ~~ {}

prefix func ~~(value: UInt8) -> UInt8 {
    return (value > 0) ? 1 : 0
}

~~7  // 1
~~0  // 0

let isSet = ~~(input & mask)   // 正如所料，结果是 1
``` 
作为改进，我们可以返回一个 `Bool` 而非 `UInt8`, 这样就可以在条件语句中直接使用了，但是我们会失去把它嵌套到其他整数表达式的能力。

#### Bitter: 一个用于位操作的库

![Bitter's logo](/img/articles/Dealing-With-Bit-Sets-In-Swift/logo.png1459300516.8592954)

本文所列出的所有用来进行位操作的替代方法都是[Bitter](https://github.com/uraimo/Bitter)的一部分，这是一个试图为位操作提供更加 "Swifty" 的接口的库。

总结下你能在 Bitter 中得到些什么(Bitter 可以通过 CocoaPods, Carthage, SwiftPM 获取)：

* 用来进行位截短转换的便利性质
* 给每个整型都添加字节索引的下标脚本
* 双重否定运算符
* 以及更多……

这个库还不完善，非常欢迎反馈！请[尽管尝试一下](https://github.com/uraimo/Bitter)，如果有些功能没法用或者你想添加别的特性，尽管开 issues。

想说些什么？来[推特](https://www.twitter.com/uraimo)找我吧。  

[上 Hacker News 投票](https://news.ycombinator.com/submit)