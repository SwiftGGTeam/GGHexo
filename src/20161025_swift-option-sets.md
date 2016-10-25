title: "Swift 中的选项集合"
date: 2016-10-25
tags: [Swift]
categories: [Ole Begemann]
permalink: swift-option-sets
keywords: 
custom_title: 
description: 

---
原文链接=https://oleb.net/blog/2016/09/swift-option-sets/
作者=Ole Begemann
原文日期=2016/09/28
译者=Lanford3_3
校对=saitjr
定稿=CMB

<!--此处开始正文-->

对于位掩码，Swift 给出的方案是：选项集合（option sets）。在 C 和 Objective-C 中，通常的做法是将一个布尔值选项集合表示为一系列值为 2 的整数次幂的枚举成员。之后就可以使用位掩码来选择想要的选项了。举例来说，[`NSString`](https://developer.apple.com/reference/foundation/nsstring?language=objc) 定义了一个名为 [`NSStringCompareOptions`](https://developer.apple.com/reference/foundation/nsstringcompareoptions?language=objc) 的枚举以表示字符串比较选项：

<!--more-->

```objective-c
typedef enum {
	NSCaseInsensitiveSearch = 1,
	NSLiteralSearch = 2,
	NSBackwardsSearch = 4,
	NSAnchoredSearch = 8,
	NSNumericSearch = 64,
	NSDiacriticInsensitiveSearch = 128,
	NSWidthInsensitiveSearch = 256,
	NSForcedOrderingSearch = 512,
	NSRegularExpressionSearch = 1024
} NSStringCompareOptions;
```

要同时使用 case-insensitive，backwark search，你可以使用*按位或*来组合对应的选项：

```objective-c
NSStringCompareOptions options = NSCaseInsensitiveSearch | NSBackwardsSearch;
// → 5 (= 1 + 4)
```

> 译者注：选择了第一个选项，可以用二进制表示为 001，也就是十进制的 1；选择了第三个选项，可以用二进制表示为 100，也就是十进制的 4；同时选择第一个和第三个选择，即 101，等于 001 | 100，同时也是十进制的 5。

### 使用选项集合

Swift 使用[结构体（`struct`）](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/ClassesAndStructures.html#//apple_ref/doc/uid/TP40014097-CH13-ID82)来遵从 [`OptionSet`](https://developer.apple.com/reference/swift/optionset) 协议，以引入选项集合，而非[枚举（`enum`）](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/Enumerations.html#//apple_ref/doc/uid/TP40014097-CH12-ID145)。为什么这样处理呢？当枚举成员互斥的时候，比如说，一次只有一个选项可以被选择的情况下，枚举是非常好的。但是和 C 不同，在 Swift 中，你无法把多个枚举成员组合成一个值，而 C 中的枚举对编译器来说就是整型，可以接受任意整数值。

和 C 中一样，Swift 中的选项集合结构体使用了高效的位域来表示，但是这个结构体本身表现为一个集合，它的成员则为被选择的选项。这允许你使用标准的[集合运算](https://en.wikipedia.org/wiki/Set_(mathematics)#Basic_operations)来维护位域，比如使用 [contains](https://developer.apple.com/reference/swift/optionset/1641006-contains) 来检验集合中是否有某个成员，或者是用 [union](https://developer.apple.com/reference/swift/optionset/1641498-union) 来组合两个位域。另外，由于 `OptionSet` 继承于 [`ExpressibleByArrayLiteral`](https://developer.apple.com/reference/swift/expressiblebyarrayliteral)，你可以使用数组字面量来生成一个选项集合。

```swift
let options: NSString.CompareOptions = [.caseInsensitive, .backwards]
options.contains(.backwards)          // → true
options.contains(.regularExpression)  // → false
options.union([.diacriticInsensitive]).rawValue  :// → 133 (= 1 + 4 + 128)
```

### 遵从 `OptionSet`

如何创建你自己的选项集合类型呢？仅有的要求是，一个类型为整型的原始值（`rawValue`）和一个初始化构造器。对于结构体来说，Swift 通常都会自动提供一个逐一成员构造器（memberwise initializer），所以你并不需要自己写一个。`rawValue` 是位域底层的存储单元。每个选项都应该是静态的常量，并使用适当的值初始化了其位域。

```swift
struct Sports: OptionSet {
    let rawValue: Int

    static let running = Sports(rawValue: 1)
    static let cycling = Sports(rawValue: 2)
    static let swimming = Sports(rawValue: 4)
    static let fencing = Sports(rawValue: 8)
    static let shooting = Sports(rawValue: 32)
    static let horseJumping = Sports(rawValue: 512)
}
```

现在，你可以创建选项集合了，就像这样：

```swift
let triathlon: Sports = [.swimming, .cycling, .running]
triathlon.contains(.swimming)  // → true
triathlon.contains(.fencing)   // → false
```
需要注意的是，编译器并没有自动把 2 的整数次幂按照升序赋给你的选项——这些工作应该由你来做，你需要正确地赋值，使得每个选项代表 `rawValue` 中的其中一个位。如果你给选项赋予了连续的整数（1，2，3，...），就会导致无法分辨出 `.swimming`（值为 3）和 `[.running, .cycling]`（值为 1 + 2）。

手动赋值的好处有两个：a. 更直观易懂；b. 能够完全掌控每个选项的值。这也允许你提供额外的属性来对常用的选项进行组合：

```swift
extension Sports {
    static let modernPentathlon: Sports =
        [.swimming, .fencing, .horseJumping, .shooting, .running]
}

let commonEvents = triathlon.intersection(.modernPentathlon)
commonEvents.contains(.swimming)    // → true
commonEvents.contains(.cycling)     // → false
```

### 选项集合并不是集合类型

遵从 `OptionSet` 并不意味着遵从 [`Sequence`](https://developer.apple.com/reference/swift/sequence) 和 [`Collection`](https://developer.apple.com/reference/swift/collection) 协议，所以你无法使用 `count` 来确定集合中有几个元素，也无法使用 `for` 循环来遍历选择的选项。从根本上说，一个选项集合仅仅是简单的整数值。
