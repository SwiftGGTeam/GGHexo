title: "属性修饰器"
date: 2020-05-24
tags: [新特性]
categories: [Swift]
permalink: propertywrapper
keywords: 新特性,修饰器
custom_title: 属性修饰器
description: Swift 属性修饰器要让 SwiftUI 成为可能还有很长的路要走，但他们在塑造整个语言的未来方面可能发挥着更重要的作用。

---
原文链接=https://nshipster.com/propertywrapper/
作者=Mattt
原文日期=2019-06-24
译者=ericchuhong
校对=Desgard,numbbbbb,SketchK
定稿=Pancf

<!--此处开始正文-->

几年前，我们 [会说](https://nshipster.com/at-compiler-directives/) “at 符号”（`@`）——以及方括号和可笑的长方法名称——是 Objective-C 的特性，正如括号之于 [Lisp](https://en.wikipedia.org/wiki/Lisp_%28programming_language%29) 或者标点之于 [Perl](https://nshipster.com/assets/qbert-fe44c1a26bd163d2dfafa5334c7bfa7957c3c243cd0c19591f494a9cea9302dc.png)。

然后 Swift 来了，并用它来结束这些古怪小 🥨 图案一样的字形。或者说我们本以为会这样。

<!--more-->

一开始，Swift 中的 `@` 只用在和 Objective-C 的混编中：`@IBAction`、`@NSCopying`、`@UIApplicationMain`等等。但之后 Swift 扩展出了越来越多的带有 `@` 前缀的 [属性](https://docs.swift.org/swift-book/ReferenceManual/Attributes.html)。

我们在 [WWDC 2019](https://nshipster.com/wwdc-2019/) 上第一次看到了 Swift 5.1 和 SwiftUI 的同时公布。并且随着每一张“令人兴奋”的幻灯片出现了一个个前所未有的属性：`@State`、`@Binding`、`@EnvironmentObject`……

我们看到了Swift的未来，它充满了 `@` 符号。

---

等 SwiftUI 逐步成熟起来，我们才会深入介绍它。

本周，我们想仔细看看 SwiftUI 的一个关键语言特性——可能会对 Swift 5.1 之前版本产生最大影响的东西：*属性修饰器*

---

## 关于 属性 ~~代理~~ ++修饰器++

属性修饰器是在 2019 年 3 月第一次 [在 Swift 论坛首次出现](https://forums.swift.org/t/pitch-property-delegates/21895)——SwiftUI 公布的前一个月。

在开始的时候，Swift 核心团队成员 Douglas Gregor 将它作为用户常用功能特性的一个统称（当时称为 *“属性代理”*），像有 `lazy` 关键字之类的。

懒惰是程序员的美德，这种普遍适用的功能是周到设计决策的特征，这让 Swift 成为一种很好用的语言。当一个属性被声明为 `lazy` 时，它推迟初始化其默认值，直到第一次访问才进行初始化。例如，你可以自己尝试实现这样的功能，使用一个私有属性，它需通过计算后才行被访问。而单单一个 `lazy` 关键字就可以让所有这些都变得没有必要。

```swift
struct <#Structure#> {
    // 使用 lazy 关键字进行属性延迟初始化
    lazy var deferred = <#...#>

    // 没有 lazy 关键字的等效行为
    private var _deferred: <#Type#>?
    var deferred: <#Type#> {
        get {
            if let value = _deferred { return value }
            let initialValue = <#...#>
            _deferred = initialValue
            return initialValue
        }

        set {
            _deferred = newValue
        }
    }
}
```

[SE-0258: 属性修饰器](https://github.com/apple/swift-evolution/blob/master/proposals/0258-property-wrappers.md) 目前正在进行第三次审核（预定于昨天结束，就在发布的时候）, 并且承诺开放像 `lazy` 这样的功能，以便库作者可以自己实现类似的功能。

由于这个提案在其设计和实现上的阐述非常出色，我们这里就不做更多的解释了。我们不妨把重点放在别处，一起来看看这个功能为 Swift 带来了哪些新的可能——而且，在这个过程中，我们可以更好了解如何在项目使用这个新功能。

所以，供你参考，以下是新 `@propertyWrapper` 属性的四个潜在用例：

- [约束值](#constraining-values)
- [转换属性赋值时的值](#transforming-values-on-property-assignment)
- [改变生成的等式和比较语义](#changing-synthesized-equality-and-comparison-semantics)
- [审查属性访问](#auditing-property-access)

---

<a name="constraining-values"></a>
## 约束值

SE-0258 提供了大量实用案例，包括了 `@Lazy`，`@Atomic`，`@ThreadSpecific` 和 `@Box`。但最让我们兴奋的是那个关于 `@Constrained` 的属性修饰器。

Swift 标准库提供了 [精确](https://en.wikipedia.org/wiki/IEEE_754)、高性能的浮点数类型，并且你可以拥有任何想要的精度——只要它是 [32](https://developer.apple.com/documentation/swift/float) 或 [64](https://developer.apple.com/documentation/swift/double)（或 [80](https://developer.apple.com/documentation/swift/float80)）位长度。

如果你想要实现自定义浮点数类型，而且有强制要求有效值范围，这从 [Swift 3](https://github.com/apple/swift-evolution/blob/master/proposals/0067-floating-point-protocols.md) 开始已经成为可能。但是这样做需要遵循错综复杂的协议要求：

<svg xmlns="http://www.w3.org/2000/svg" font-size="14" viewBox="0 0 808 592" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <defs>
      <marker id="triangle" markerHeight="8" markerWidth="8" orient="auto" refX="4" refY="2" viewBox="0 0 8 4">
        <polygon fill="black" points="0,0 0,4 8,2 0,0"></polygon>
      </marker>
      <marker id="clear_triangle" markerHeight="10" markerWidth="10" orient="auto" refX="1" refY="7" viewBox="0 0 20 14">
        <polygon fill="none" points="2,2 2,12 18,7 2,2" stroke="black" stroke-width="2"></polygon>
      </marker>
      <marker id="circle" markerHeight="5" markerWidth="5" orient="auto" refX="10" refY="10" viewBox="0 0 20 20">
        <circle cx="10" cy="10" fill="black" r="8"></circle>
      </marker>
      <marker id="square" markerHeight="5" markerWidth="5" orient="auto" refX="10" refY="10" viewBox="0 0 20 20">
        <rect fill="black" width="20" height="20" viewBox="0 0 20 20" x="0" y="0"></rect>
      </marker>
      <marker id="open_circle" markerHeight="10" markerWidth="10" orient="auto" refX="10" refY="10" viewBox="0 0 20 20">
        <circle cx="10" cy="10" fill="white" r="4" stroke="black" stroke-width="2"></circle>
      </marker>
      <marker id="big_open_circle" markerHeight="20" markerWidth="20" orient="auto" refX="20" refY="20" viewBox="0 0 40 40">
        <circle cx="20" cy="20" fill="white" r="6" stroke="black" stroke-width="2"></circle>
      </marker>
    </defs>
    <style>
      text{stroke: none; fill: currentColor;}
      polygon{fill:currentColor;}
    </style>
    <g>
      <line x1="12" x2="12" y1="104" y2="520"></line>
      <line marker-end="url(#triangle)" x1="12" x2="60" y1="104" y2="104"></line>
      <line x1="12" x2="36" y1="520" y2="520"></line>
      <line x1="36" x2="36" y1="460" y2="520"></line>
      <line x1="36" x2="36" y1="520" y2="580"></line>
      <path d="M 36 580 A 4 4 0 0 0 40 584" fill="none"></path>
      <path d="M 40 456 A 4 4 0 0 0 36 460" fill="none"></path>
    </g>
    <g>
      <line x1="40" x2="56" y1="456" y2="456"></line>
    </g>
    <g>
      <line x1="40" x2="56" y1="584" y2="584"></line>
    </g>
    <g>
      <line x1="44" x2="44" y1="168" y2="312"></line>
      <line marker-end="url(#triangle)" x1="44" x2="60" y1="168" y2="168"></line>
      <line x1="44" x2="84" y1="312" y2="312"></line>
    </g>
    <g>
      <line x1="68" x2="68" y1="88" y2="120"></line>
      <line x1="68" x2="308" y1="88" y2="88"></line>
      <line x1="68" x2="308" y1="120" y2="120"></line>
      <line x1="308" x2="308" y1="88" y2="120"></line>
    </g>
    <g>
      <line x1="68" x2="68" y1="152" y2="184"></line>
      <line x1="68" x2="308" y1="152" y2="152"></line>
      <line x1="68" x2="308" y1="184" y2="184"></line>
      <line x1="308" x2="308" y1="152" y2="184"></line>
    </g>
    <g>
      <line x1="72" x2="74" y1="496" y2="500"></line>
      <path d="M 72 480 A 16 16 0 0 0 72 496" fill="none"></path>
      <path d="M 74 500 A 8 8 0 0 0 80 504" fill="none"></path>
    </g>
    <g>
      <line x1="74" x2="72" y1="476" y2="480"></line>
      <path d="M 80 472 A 8 8 0 0 0 74 476" fill="none"></path>
    </g>
    <g>
      <line x1="80" x2="136" y1="472" y2="472"></line>
      <path d="M 142 476 A 8 8 0 0 0 136 472" fill="none"></path>
    </g>
    <g>
      <line x1="80" x2="136" y1="504" y2="504"></line>
      <path d="M 136 504 A 8 8 0 0 0 142 500" fill="none"></path>
    </g>
    <g>
      <line x1="84" x2="84" y1="296" y2="328"></line>
      <line x1="84" x2="260" y1="296" y2="296"></line>
      <line x1="84" x2="260" y1="328" y2="328"></line>
      <line x1="260" x2="260" y1="296" y2="328"></line>
    </g>
    <g>
      <line x1="84" x2="84" y1="392" y2="424"></line>
      <line x1="84" x2="260" y1="392" y2="392"></line>
      <line x1="84" x2="260" y1="424" y2="424"></line>
      <line x1="260" x2="260" y1="392" y2="424"></line>
    </g>
    <g>
      <line x1="128" x2="130" y1="560" y2="564"></line>
      <path d="M 128 544 A 16 16 0 0 0 128 560" fill="none"></path>
      <path d="M 130 564 A 8 8 0 0 0 136 568" fill="none"></path>
    </g>
    <g>
      <line x1="130" x2="128" y1="540" y2="544"></line>
      <path d="M 136 536 A 8 8 0 0 0 130 540" fill="none"></path>
    </g>
    <g>
      <line x1="136" x2="208" y1="536" y2="536"></line>
      <path d="M 214 540 A 8 8 0 0 0 208 536" fill="none"></path>
    </g>
    <g>
      <line x1="136" x2="208" y1="568" y2="568"></line>
      <path d="M 208 568 A 8 8 0 0 0 214 564" fill="none"></path>
    </g>
    <g>
      <line x1="142" x2="144" y1="476" y2="480"></line>
      <path d="M 144 496 A 16 16 0 0 0 144 480" fill="none"></path>
    </g>
    <g>
      <line x1="142" x2="144" y1="500" y2="496"></line>
    </g>
    <g>
      <line x1="172" x2="172" y1="248" y2="288"></line>
      <line marker-end="url(#triangle)" x1="172" x2="244" y1="248" y2="248"></line>
    </g>
    <g>
      <line marker-end="url(#triangle)" x1="172" x2="172" y1="352" y2="340"></line>
      <line x1="172" x2="172" y1="352" y2="384"></line>
    </g>
    <g>
      <line x1="200" x2="202" y1="496" y2="500"></line>
      <path d="M 200 480 A 16 16 0 0 0 200 496" fill="none"></path>
      <path d="M 202 500 A 8 8 0 0 0 208 504" fill="none"></path>
    </g>
    <g>
      <line x1="202" x2="200" y1="476" y2="480"></line>
      <path d="M 208 472 A 8 8 0 0 0 202 476" fill="none"></path>
    </g>
    <g>
      <line x1="208" x2="272" y1="472" y2="472"></line>
      <path d="M 278 476 A 8 8 0 0 0 272 472" fill="none"></path>
    </g>
    <g>
      <line x1="208" x2="272" y1="504" y2="504"></line>
      <path d="M 272 504 A 8 8 0 0 0 278 500" fill="none"></path>
    </g>
    <g>
      <line x1="214" x2="216" y1="540" y2="544"></line>
      <path d="M 216 560 A 16 16 0 0 0 216 544" fill="none"></path>
    </g>
    <g>
      <line x1="214" x2="216" y1="564" y2="560"></line>
    </g>
    <g>
      <line x1="252" x2="252" y1="232" y2="264"></line>
      <line x1="252" x2="428" y1="232" y2="232"></line>
      <line x1="252" x2="428" y1="264" y2="264"></line>
      <line x1="428" x2="428" y1="232" y2="264"></line>
    </g>
    <g>
      <line x1="278" x2="280" y1="476" y2="480"></line>
      <path d="M 280 496 A 16 16 0 0 0 280 480" fill="none"></path>
    </g>
    <g>
      <line x1="278" x2="280" y1="500" y2="496"></line>
    </g>
    <g>
      <line x1="308" x2="308" y1="472" y2="504"></line>
      <line x1="308" x2="484" y1="472" y2="472"></line>
      <line x1="308" x2="484" y1="504" y2="504"></line>
      <line x1="484" x2="484" y1="472" y2="504"></line>
    </g>
    <g>
      <line marker-end="url(#triangle)" x1="320" x2="316" y1="104" y2="104"></line>
      <line x1="320" x2="428" y1="104" y2="104"></line>
      <line x1="428" x2="428" y1="104" y2="160"></line>
    </g>
    <g>
      <line x1="340" x2="340" y1="184" y2="224"></line>
      <line marker-end="url(#triangle)" x1="340" x2="396" y1="184" y2="184"></line>
    </g>
    <g>
      <line marker-end="url(#triangle)" x1="340" x2="340" y1="288" y2="276"></line>
      <line x1="340" x2="340" y1="288" y2="464"></line>
    </g>
    <g>
      <line x1="376" x2="378" y1="576" y2="580"></line>
      <path d="M 376 560 A 16 16 0 0 0 376 576" fill="none"></path>
      <path d="M 378 580 A 8 8 0 0 0 384 584" fill="none"></path>
    </g>
    <g>
      <line x1="378" x2="376" y1="556" y2="560"></line>
      <path d="M 384 552 A 8 8 0 0 0 378 556" fill="none"></path>
    </g>
    <g>
      <line x1="380" x2="380" y1="376" y2="464"></line>
      <line x1="380" x2="476" y1="376" y2="376"></line>
      <line x1="476" x2="476" y1="352" y2="376"></line>
    </g>
    <g>
      <line x1="384" x2="424" y1="552" y2="552"></line>
      <path d="M 430 556 A 8 8 0 0 0 424 552" fill="none"></path>
    </g>
    <g>
      <line x1="384" x2="424" y1="584" y2="584"></line>
      <path d="M 424 584 A 8 8 0 0 0 430 580" fill="none"></path>
    </g>
    <g>
      <line x1="404" x2="404" y1="168" y2="200"></line>
      <line x1="404" x2="580" y1="168" y2="168"></line>
      <line x1="404" x2="580" y1="200" y2="200"></line>
      <line x1="580" x2="580" y1="168" y2="200"></line>
    </g>
    <g>
      <line x1="412" x2="412" y1="24" y2="56"></line>
      <line x1="412" x2="580" y1="24" y2="24"></line>
      <line x1="412" x2="580" y1="56" y2="56"></line>
      <line x1="580" x2="580" y1="24" y2="56"></line>
    </g>
    <g>
      <line x1="430" x2="432" y1="556" y2="560"></line>
      <path d="M 432 576 A 16 16 0 0 0 432 560" fill="none"></path>
    </g>
    <g>
      <line x1="430" x2="432" y1="580" y2="576"></line>
    </g>
    <g>
      <line x1="440" x2="516" y1="568" y2="568"></line>
      <line marker-start="url(#open_circle)" x1="516" x2="516" y1="440" y2="568"></line>
    </g>
    <g>
      <line x1="452" x2="452" y1="296" y2="328"></line>
      <line x1="452" x2="628" y1="296" y2="296"></line>
      <line x1="452" x2="628" y1="328" y2="328"></line>
      <line x1="628" x2="628" y1="296" y2="328"></line>
    </g>
    <g>
      <line x1="452" x2="452" y1="392" y2="424"></line>
      <line x1="452" x2="628" y1="392" y2="392"></line>
      <line x1="452" x2="628" y1="424" y2="424"></line>
      <line x1="628" x2="628" y1="392" y2="424"></line>
    </g>
    <g>
      <line marker-end="url(#triangle)" x1="476" x2="476" y1="352" y2="340"></line>
    </g>
    <g>
      <line marker-end="url(#triangle)" x1="492" x2="492" y1="80" y2="68"></line>
      <line x1="492" x2="492" y1="80" y2="160"></line>
    </g>
    <g>
      <line marker-end="url(#triangle)" x1="492" x2="492" y1="224" y2="212"></line>
      <line x1="492" x2="492" y1="224" y2="288"></line>
    </g>
    <g>
      <line marker-end="url(#triangle)" x1="532" x2="532" y1="352" y2="340"></line>
      <line x1="532" x2="532" y1="352" y2="384"></line>
    </g>
    <g>
      <line x1="548" x2="616" y1="568" y2="568"></line>
      <line marker-start="url(#open_circle)" x1="548" x2="548" y1="440" y2="568"></line>
    </g>
    <g>
      <line x1="556" x2="556" y1="88" y2="120"></line>
      <line x1="556" x2="732" y1="88" y2="88"></line>
      <line x1="556" x2="732" y1="120" y2="120"></line>
      <line x1="732" x2="732" y1="88" y2="120"></line>
    </g>
    <g>
      <line x1="556" x2="556" y1="232" y2="264"></line>
      <line x1="556" x2="732" y1="232" y2="232"></line>
      <line x1="556" x2="732" y1="264" y2="264"></line>
      <line x1="732" x2="732" y1="232" y2="264"></line>
    </g>
    <g>
      <line x1="580" x2="620" y1="184" y2="184"></line>
      <line x1="620" x2="620" y1="144" y2="184"></line>
    </g>
    <g>
      <line x1="580" x2="580" y1="472" y2="504"></line>
      <line x1="580" x2="756" y1="472" y2="472"></line>
      <line x1="580" x2="756" y1="504" y2="504"></line>
      <line x1="756" x2="756" y1="472" y2="504"></line>
    </g>
    <g>
      <line marker-end="url(#triangle)" x1="588" x2="588" y1="352" y2="340"></line>
      <line x1="588" x2="588" y1="352" y2="376"></line>
      <line x1="588" x2="700" y1="376" y2="376"></line>
      <line x1="700" x2="700" y1="376" y2="464"></line>
    </g>
    <g>
      <line marker-end="url(#triangle)" x1="620" x2="620" y1="144" y2="132"></line>
    </g>
    <g>
      <line x1="624" x2="626" y1="576" y2="580"></line>
      <path d="M 624 560 A 16 16 0 0 0 624 576" fill="none"></path>
      <path d="M 626 580 A 8 8 0 0 0 632 584" fill="none"></path>
    </g>
    <g>
      <line x1="626" x2="624" y1="556" y2="560"></line>
      <path d="M 632 552 A 8 8 0 0 0 626 556" fill="none"></path>
    </g>
    <g>
      <line x1="628" x2="676" y1="312" y2="312"></line>
      <line x1="676" x2="676" y1="288" y2="312"></line>
    </g>
    <g>
      <line x1="632" x2="696" y1="552" y2="552"></line>
      <path d="M 702 556 A 8 8 0 0 0 696 552" fill="none"></path>
    </g>
    <g>
      <line x1="632" x2="696" y1="584" y2="584"></line>
      <path d="M 696 584 A 8 8 0 0 0 702 580" fill="none"></path>
    </g>
    <g>
      <line marker-end="url(#triangle)" x1="676" x2="676" y1="144" y2="132"></line>
      <line x1="676" x2="676" y1="144" y2="224"></line>
    </g>
    <g>
      <line marker-end="url(#triangle)" x1="676" x2="676" y1="288" y2="276"></line>
    </g>
    <g>
      <line x1="702" x2="704" y1="556" y2="560"></line>
      <path d="M 704 576 A 16 16 0 0 0 704 560" fill="none"></path>
    </g>
    <g>
      <line x1="702" x2="704" y1="580" y2="576"></line>
    </g>
    <g>
      <text x="81" y="108">ExpressibleByIntegerLiteral</text>
    </g>
    <g>
      <text x="81" y="492">Float</text>
    </g>
    <g>
      <text x="89" y="172">ExpressibleByFloatLiteral</text>
    </g>
    <g>
      <text x="97" y="316">BinaryFloatingPoint</text>
    </g>
    <g>
      <text x="121" y="412">FloatingPoint</text>
    </g>
    <g>
      <text x="137" y="556">Float80</text>
    </g>
    <g>
      <text x="209" y="492">Double</text>
    </g>
    <g>
      <text x="289" y="252">SignedNumeric</text>
    </g>
    <g>
      <text x="345" y="492">SignedInteger</text>
    </g>
    <g>
      <text x="385" y="572">Int</text>
    </g>
    <g>
      <text x="425" y="44">AdditiveArithmetic</text>
    </g>
    <g>
      <text x="465" y="188">Numeric</text>
    </g>
    <g>
      <text x="473" y="412">FixedWidthInteger</text>
    </g>
    <g>
      <text x="489" y="316">BinaryInteger</text>
    </g>
    <g>
      <text x="601" y="252">Comparable</text>
    </g>
    <g>
      <text x="609" y="108">Equatable</text>
    </g>
    <g>
      <text x="609" y="492">UnsignedInteger</text>
    </g>
    <g>
      <text x="641" y="572">UInt</text>
    </g>
    <g>
      <line marker-start="url(#open_circle)" x1="108" x2="108" y1="440" y2="464"></line>
    </g>
    <g>
      <line marker-start="url(#open_circle)" x1="172" x2="172" y1="440" y2="528"></line>
    </g>
    <g>
      <line marker-start="url(#open_circle)" x1="236" x2="236" y1="440" y2="464"></line>
    </g>
    <g>
      <line marker-start="url(#open_circle)" x1="404" x2="404" y1="520" y2="544"></line>
    </g>
    <g>
      <line marker-start="url(#open_circle)" x1="660" x2="660" y1="520" y2="544"></line>
    </g>
 </svg>

来自：[航空学院的 Swift 数字指引](https://flight.school/books/numbers/)
            
要把这么多协议实现下来工作量可不小，并且对于大多数用例，通常需要大量的工作来验证。

幸好，属性修饰器提供了一种将标准数字类型参数化的方式，同时又大大减少工作量。

### 实现一个限制值范围的属性修饰器

思考下面的 `Clamping` 结构。作为一个属性修饰器（由 `@propertyWrapper` 属性表示），它会自动在规定的范围内“限制”越界的值。

```swift
@propertyWrapper
struct Clamping<Value: Comparable> {
    var value: Value
    let range: ClosedRange<Value>

    init(initialValue value: Value, _ range: ClosedRange<Value>) {
        precondition(range.contains(value))
        self.value = value
        self.range = range
    }

    var wrappedValue: Value {
        get { value }
        set { value = min(max(range.lowerBound, newValue), range.upperBound) }
    }
}
```

你可以使用 `@Clamping` 保证属性在转成模型 [化学溶液中的酸度](https://en.wikipedia.org/wiki/PH) 的过程中，处于 0-14 的常规范围内。

```swift
struct Solution {
    @Clamping(0...14) var pH: Double = 7.0
}

let carbonicAcid = Solution(pH: 4.68) // 在标准情况下为 1 mM
```

如果尝试将 pH 值设定在限制的范围之外，将得到最接近的边界值（最小值或者最大值）来代替。

```swift
let superDuperAcid = Solution(pH: -1)
superDuperAcid.pH // 0
```

你可以在其他属性修饰器的实现中使用属性修饰器。例如，这个 `UnitInterval` 属性修饰起器委托给 `@Clamping`，把值约束在 0 和 1 之间，包括 0 和 1。

```swift
@propertyWrapper
struct UnitInterval<Value: FloatingPoint> {
    @Clamping(0...1)
    var wrappedValue: Value = .zero

    init(initialValue value: Value) {
        self.wrappedValue = value
    }
}
```

再比如，你可以使用 `@UnitInterval` 属性修饰器定义一个 `RGB` 的类型，用来表示红色、绿色、蓝色的百分比强度。

```swift
struct RGB {
    @UnitInterval var red: Double
    @UnitInterval var green: Double
    @UnitInterval var blue: Double
}

let cornflowerBlue = RGB(red: 0.392, green: 0.584, blue: 0.929)
```

#### 举一反三

- 实现一个 `@Positive`/`@NonNegative` 属性装饰器，将无符号整数赋值成有符号整数类型。
- 实现一个 `@NonZero` 属性装饰器，使得一个数值要么大于，要么小于 `0`。
- `@Validated` 或者 `@Whitelisted`/`@Blacklisted` 属性装饰器，约束了什么样的值可以被赋值。

<a name="transforming-values-on-property-assignment"></a>
## 转换属性赋值时的值

从用户接收文本输入是应用开发者经常头疼的问题。从无聊的字符串编码到恶意的文本字段注入攻击，开发者有太多事情需要注意。但在开发者面对的的问题中，最难以捉摸和令人困扰的是接收用户生成的内容，而且这些内容开头和结尾都带有空格。

在内容开头有一个单独的空格，可以让 URL 无效，也可以混淆日期解析器，还可能造成差一错误（off-by-one error）：

```swift
import Foundation

URL(string: " https://nshipster.com") // nil (!)

ISO8601DateFormatter().date(from: " 2019-06-24") // nil (!)

let words = " Hello, world!".components(separatedBy: .whitespaces)
words.count // 3 (!)
```

说到用户输入，客户端经常以没留意做理由，然后把所有东西 *原原本本* 发送给服务器。`¯\_(ツ)_/¯`。

当然我不是在倡导客户端应该为此负责更多处理工作，这种情况就涉及到了 Swift 属性修饰器另外一个引人注目的用例。

---

Foundation 框架将 `trimmingCharacters(in:)` 方法桥接到了 Swift 的字符串中，除了一些其他作用以外，它提供了便利的方式来裁剪掉 `String` 值首位两端的空格。虽然可以通过调用这个方法来保证数据健全，但是还不够便利。如果你也有过类似的经历，你肯定会想知道有没有更好的方案。

或许你找到了一种较为通用的方法，通过 `willSet` 属性回调来寻解脱……唯一让人不能满意的是，这个方法无法改变已经发生的事情。

```swift
struct Post {
    var title: String {
        willSet {
            title = newValue.trimmingCharacters(in: .whitespacesAndNewlines)
            /* ⚠️ 尝试在它自己的 willSet 中存储属性 'title'，该属性将会被新值覆盖*/
        }
    }
}
```

从上面看，你可能想到可以用 `didSet`，作为解决问题的康庄大道……不过我想你马上就会想起来 Swift 里的一条规定，即 `didSet` 在属性初始化赋值时是不会被调用的。

```swift
struct Post {
    var title: String {
        // 😓 初始化期间未调用
        didSet {
            self.title = title.trimmingCharacters(in: .whitespacesAndNewlines)
        }
    }
}
```
> 在属性自己的 `didSet` 回调方法里面，很幸运不会再次触发回调，所以你不必担心意料之外的递归调用。

在你的坚持不懈下，你很可能用尽了一切办法......但回过头来，你发现其实并没有什么方法能够既满足人因工程学的标准，又满足性能方面的要求

如果你对此深有体会，那么恭喜你，你在这方面的探索可以到此为止了，因为属性装饰器将是这个问题的终极解决方案。

### 实现为字符串值裁截空格的属性修饰器

看下下面的 `Trimmed` 结构体，它从输入的字符串裁截了空格和换行。

```swift
import Foundation

@propertyWrapper
struct Trimmed {
    private(set) var value: String = ""

    var wrappedValue: String {
        get { value }
        set { value = newValue.trimmingCharacters(in: .whitespacesAndNewlines) }
    }

    init(initialValue: String) {
        self.wrappedValue = initialValue
    }
}
```

下面的代码为 `Post` 结构中每个 `String` 属性标记了 `@Trimmed` ，通过这种方式，任何赋值给 `title` 或 `body` 的字符串值——无论是在初始化期间还是通过属性访问后——都将自动删除其开头或结尾的空格。

```swift
struct Post {
    @Trimmed var title: String
    @Trimmed var body: String
}

let quine = Post(title: "  Swift Property Wrappers  ", body: "<#...#>")
quine.title // "Swift Property Wrappers" (no leading or trailing spaces!)

quine.title = "      @propertyWrapper     "
quine.title // "@propertyWrapper" (still no leading or trailing spaces!)
```

#### 举一反三

- 实现一个 `@Transformed` 属性修饰器，它允许对输入的字符串进行 [ICU 转换](https://developer.apple.com/documentation/foundation/nsstring/1407787-applyingtransform)。
- 实现一个 `@Normalized` 属性修饰器，它允许一个 `String` 属性自定义它[正规形式](https://unicode.org/reports/tr15/#Norm_Forms)
- 实现一个 `@Quantized`/`@Rounded`/`@Truncated` 属性修饰器，它会把数值转换到一种特定的精度（例如：向上舍入到最近的 ½ 精度），但是内部要关注到精确过程的中间值，防止连锁的舍入错误。

<a name="changing-synthesized-equality-and-comparison-semantics"></a>
## 改变生成的等式和比较语义

> 这个方式取决于遵循 synthesized 协议的实现细节，并且可能会在这个功能完成之前发生改变（尽管我们希望这个方法仍然像下面所说一样继续可用）。

在 Swift 中，两个 `String` 值如果他们 [*标准等价*](https://unicode.org/reports/tr15/#Canon_Compat_Equivalence) 就会被人认为是相等。在大多数情况下，Swift 字符串的比较方式与我们的预期一致：即两个字符串包含有相同的字符就会相等，不管它是一个合成字符，还是将这个合成字符拆解成多个字符——举个例子来说，就是“é”（`U+00E9 带有锐音的拉丁小写字母 E`）等于“e”（`U+0065 拉丁小写字母 E`）+“◌́”（`U+0301T 和锐音组合`）。

但是，如果你在特殊的情况下需要不同的相等语义呢？例如字符串相等的时候 *不区分大小写*？

在今天，你可以使用许多方法，利用已有的语言特性解决这个问题：

- 要完成这个功能，你可以在 `==` 比较的时候用 `lowercased()` 做一次处理，但和其他手动处理方式一样，这种方式容易出现人为的错误。
- 你可以创建一个包含 `String` 值的自定义 `CaseInsensitive` 类型。但你必须要完成很多额外的工作，才能把它打磨的像标准的 `String` 类型一样即符合人因工程学的标准，又提供完全相同的功能。
- 虽然你可以定义一个[自定义操作符](https://nshipster.com/swift-operators/#defining-custom-operators) 但又有什么操作符能比 `==` 更贴近相等的含义呢。

上面的方法并没有哪个能让人完全信服，还好在 Swift 5.1 中，属性修饰器的特性让我们拥有了一个完美的解决方案。

> 和文章开头提到状况一样（即实现一个自定义浮点数类型），Swift 采用面向协议的方式，将完成字符串的职责代理给一系列的更细粒度的类型（narrowly-defined types）.

对于好奇心强的读者，这里是一张关系图，里面展示了在 Swift 标准库中所有字符串类型之间的关系。

<svg xmlns="http://www.w3.org/2000/svg" class="bob" font-size="14" viewBox="0 0 920 736" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="none">
  <defs>
    <marker id="triangle" markerHeight="8" markerWidth="8" orient="auto" refX="4" refY="2" viewBox="0 0 8 4">
      <polygon fill="black" points="0,0 0,4 8,2 0,0"></polygon>
    </marker>
    <marker id="clear_triangle" markerHeight="10" markerWidth="10" orient="auto" refX="1" refY="7" viewBox="0 0 20 14">
      <polygon fill="none" points="2,2 2,12 18,7 2,2" stroke="black" stroke-width="2"></polygon>
    </marker>
    <marker id="circle" markerHeight="5" markerWidth="5" orient="auto" refX="10" refY="10" viewBox="0 0 20 20">
      <circle cx="10" cy="10" fill="black" r="8"></circle>
    </marker>
    <marker id="square" markerHeight="5" markerWidth="5" orient="auto" refX="10" refY="10" viewBox="0 0 20 20">
      <rect fill="black" width="20" height="20" viewBox="0 0 20 20" x="0" y="0"></rect>
    </marker>
    <marker id="open_circle" markerHeight="10" markerWidth="10" orient="auto" refX="10" refY="10" viewBox="0 0 20 20">
      <circle cx="10" cy="10" fill="white" r="4" stroke="black" stroke-width="2"></circle>
    </marker>
    <marker id="big_open_circle" markerHeight="20" markerWidth="20" orient="auto" refX="20" refY="20" viewBox="0 0 40 40">
      <circle cx="20" cy="20" fill="white" r="6" stroke="black" stroke-width="2"></circle>
    </marker>
  </defs>
  <style>
    text{stroke: none; fill: currentColor;}
    polygon{fill:currentColor;}
  </style>
  <g>
    <line x1="4" x2="4" y1="232" y2="264"></line>
    <line x1="4" x2="252" y1="232" y2="232"></line>
    <line x1="4" x2="252" y1="264" y2="264"></line>
    <line x1="252" x2="252" y1="232" y2="264"></line>
  </g>
  <g>
    <line x1="132" x2="132" y1="200" y2="224"></line>
    <line x1="132" x2="236" y1="200" y2="200"></line>
    <line x1="236" x2="236" y1="176" y2="200"></line>
  </g>
  <g>
    <line x1="132" x2="272" y1="536" y2="536"></line>
    <line marker-start="url(#open_circle)" x1="132" x2="132" y1="280" y2="536"></line>
  </g>
  <g>
    <line x1="148" x2="148" y1="360" y2="392"></line>
    <line x1="148" x2="340" y1="360" y2="360"></line>
    <line x1="148" x2="340" y1="392" y2="392"></line>
    <line x1="340" x2="340" y1="360" y2="392"></line>
  </g>
  <g>
    <line x1="148" x2="148" y1="424" y2="456"></line>
    <line x1="148" x2="340" y1="424" y2="424"></line>
    <line x1="148" x2="340" y1="456" y2="456"></line>
    <line x1="340" x2="340" y1="424" y2="456"></line>
  </g>
  <g>
    <line x1="212" x2="212" y1="120" y2="152"></line>
    <line x1="212" x2="332" y1="120" y2="120"></line>
    <line x1="212" x2="332" y1="152" y2="152"></line>
    <line x1="332" x2="332" y1="120" y2="152"></line>
  </g>
  <g>
    <line x1="220" x2="220" y1="40" y2="72"></line>
    <line x1="220" x2="324" y1="40" y2="40"></line>
    <line x1="220" x2="324" y1="72" y2="72"></line>
    <line x1="324" x2="324" y1="40" y2="72"></line>
  </g>
  <g>
    <line marker-end="url(#triangle)" x1="236" x2="236" y1="176" y2="164"></line>
  </g>
  <g>
    <line marker-end="url(#triangle)" x1="276" x2="276" y1="96" y2="84"></line>
    <line x1="276" x2="276" y1="96" y2="112"></line>
  </g>
  <g>
    <line x1="276" x2="276" y1="232" y2="264"></line>
    <line x1="276" x2="500" y1="232" y2="232"></line>
    <line x1="276" x2="500" y1="264" y2="264"></line>
    <line x1="500" x2="500" y1="232" y2="264"></line>
  </g>
  <g>
    <line x1="280" x2="282" y1="544" y2="548"></line>
    <path d="M 280 528 A 16 16 0 0 0 280 544" fill="none"></path>
    <path d="M 282 548 A 8 8 0 0 0 288 552" fill="none"></path>
  </g>
  <g>
    <line x1="282" x2="280" y1="524" y2="528"></line>
    <path d="M 288 520 A 8 8 0 0 0 282 524" fill="none"></path>
  </g>
  <g>
    <line x1="288" x2="448" y1="520" y2="520"></line>
    <path d="M 454 524 A 8 8 0 0 0 448 520" fill="none"></path>
  </g>
  <g>
    <line x1="288" x2="448" y1="552" y2="552"></line>
    <path d="M 448 552 A 8 8 0 0 0 454 548" fill="none"></path>
  </g>
  <g>
    <line marker-end="url(#triangle)" x1="308" x2="308" y1="176" y2="164"></line>
    <line x1="308" x2="308" y1="176" y2="200"></line>
    <line x1="308" x2="412" y1="200" y2="200"></line>
    <line x1="412" x2="412" y1="200" y2="224"></line>
  </g>
  <g>
    <line marker-end="url(#triangle)" x1="352" x2="348" y1="376" y2="376"></line>
    <line x1="352" x2="364" y1="376" y2="376"></line>
    <line x1="364" x2="364" y1="376" y2="408"></line>
    <line x1="364" x2="364" y1="408" y2="440"></line>
    <line x1="364" x2="396" y1="408" y2="408"></line>
  </g>
  <g>
    <line marker-end="url(#triangle)" x1="352" x2="348" y1="440" y2="440"></line>
    <line x1="352" x2="364" y1="440" y2="440"></line>
  </g>
  <g>
    <line x1="372" x2="372" y1="472" y2="512"></line>
    <line x1="372" x2="420" y1="472" y2="472"></line>
    <line marker-start="url(#open_circle)" x1="420" x2="420" y1="440" y2="472"></line>
  </g>
  <g>
    <line x1="372" x2="372" y1="560" y2="696"></line>
    <line marker-end="url(#open_circle)" x1="372" x2="484" y1="696" y2="696"></line>
  </g>
  <g>
    <line x1="396" x2="396" y1="392" y2="424"></line>
    <line x1="396" x2="548" y1="392" y2="392"></line>
    <line x1="396" x2="548" y1="424" y2="424"></line>
    <line x1="548" x2="548" y1="392" y2="424"></line>
  </g>
  <g>
    <line x1="454" x2="456" y1="524" y2="528"></line>
    <path d="M 456 544 A 16 16 0 0 0 456 528" fill="none"></path>
  </g>
  <g>
    <line x1="454" x2="456" y1="548" y2="544"></line>
  </g>
  <g>
    <line marker-end="url(#triangle)" x1="468" x2="468" y1="288" y2="276"></line>
    <line x1="468" x2="468" y1="288" y2="384"></line>
  </g>
  <g>
    <line x1="492" x2="492" y1="520" y2="552"></line>
    <line x1="492" x2="756" y1="520" y2="520"></line>
    <line x1="492" x2="756" y1="552" y2="552"></line>
    <line x1="756" x2="756" y1="520" y2="552"></line>
  </g>
  <g>
    <line x1="492" x2="492" y1="600" y2="632"></line>
    <line x1="492" x2="756" y1="600" y2="600"></line>
    <line x1="492" x2="756" y1="632" y2="632"></line>
    <line x1="756" x2="756" y1="600" y2="632"></line>
  </g>
  <g>
    <line x1="492" x2="492" y1="680" y2="712"></line>
    <line x1="492" x2="756" y1="680" y2="680"></line>
    <line x1="492" x2="756" y1="712" y2="712"></line>
    <line x1="756" x2="756" y1="680" y2="712"></line>
  </g>
  <g>
    <line x1="508" x2="508" y1="120" y2="152"></line>
    <line x1="508" x2="908" y1="120" y2="120"></line>
    <line x1="508" x2="908" y1="152" y2="152"></line>
    <line x1="908" x2="908" y1="120" y2="152"></line>
  </g>
  <g>
    <line x1="524" x2="524" y1="296" y2="384"></line>
    <line marker-end="url(#triangle)" x1="524" x2="548" y1="296" y2="296"></line>
  </g>
  <g>
    <line x1="524" x2="524" y1="432" y2="472"></line>
    <line x1="524" x2="628" y1="472" y2="472"></line>
    <line marker-end="url(#triangle)" x1="628" x2="628" y1="472" y2="508"></line>
  </g>
  <g>
    <line x1="548" x2="596" y1="408" y2="408"></line>
    <line x1="596" x2="596" y1="376" y2="408"></line>
    <line marker-end="url(#triangle)" x1="596" x2="636" y1="376" y2="376"></line>
    <line x1="596" x2="596" y1="408" y2="440"></line>
    <line marker-end="url(#triangle)" x1="596" x2="636" y1="440" y2="440"></line>
  </g>
  <g>
    <line x1="556" x2="556" y1="40" y2="72"></line>
    <line x1="556" x2="860" y1="40" y2="40"></line>
    <line x1="556" x2="860" y1="72" y2="72"></line>
    <line x1="860" x2="860" y1="40" y2="72"></line>
  </g>
  <g>
    <line x1="556" x2="556" y1="280" y2="312"></line>
    <line x1="556" x2="868" y1="280" y2="280"></line>
    <line x1="556" x2="868" y1="312" y2="312"></line>
    <line x1="868" x2="868" y1="280" y2="312"></line>
  </g>
  <g>
    <line x1="580" x2="580" y1="200" y2="232"></line>
    <line x1="580" x2="844" y1="200" y2="200"></line>
    <line x1="580" x2="844" y1="232" y2="232"></line>
    <line x1="844" x2="844" y1="200" y2="232"></line>
  </g>
  <g>
    <line marker-end="url(#triangle)" x1="628" x2="628" y1="560" y2="588"></line>
  </g>
  <g>
    <line marker-end="url(#triangle)" x1="628" x2="628" y1="656" y2="644"></line>
    <line x1="628" x2="628" y1="656" y2="672"></line>
  </g>
  <g>
    <line x1="644" x2="644" y1="360" y2="392"></line>
    <line x1="644" x2="748" y1="360" y2="360"></line>
    <line x1="644" x2="748" y1="392" y2="392"></line>
    <line x1="748" x2="748" y1="360" y2="392"></line>
  </g>
  <g>
    <line x1="644" x2="644" y1="424" y2="456"></line>
    <line x1="644" x2="748" y1="424" y2="424"></line>
    <line x1="644" x2="748" y1="456" y2="456"></line>
    <line x1="748" x2="748" y1="424" y2="456"></line>
  </g>
  <g>
    <line marker-end="url(#triangle)" x1="708" x2="708" y1="96" y2="84"></line>
    <line x1="708" x2="708" y1="96" y2="112"></line>
  </g>
  <g>
    <line marker-end="url(#triangle)" x1="708" x2="708" y1="176" y2="164"></line>
    <line x1="708" x2="708" y1="176" y2="192"></line>
  </g>
  <g>
    <line marker-end="url(#triangle)" x1="708" x2="708" y1="256" y2="244"></line>
    <line x1="708" x2="708" y1="256" y2="272"></line>
  </g>
  <g>
    <line x1="748" x2="772" y1="376" y2="376"></line>
    <line x1="772" x2="772" y1="344" y2="376"></line>
    <line x1="772" x2="852" y1="344" y2="344"></line>
    <line marker-end="url(#triangle)" x1="852" x2="852" y1="344" y2="380"></line>
  </g>
  <g>
    <line x1="748" x2="772" y1="440" y2="440"></line>
    <line x1="772" x2="772" y1="440" y2="472"></line>
    <line x1="772" x2="852" y1="472" y2="472"></line>
    <line x1="852" x2="852" y1="448" y2="472"></line>
  </g>
  <g>
    <line x1="796" x2="796" y1="392" y2="424"></line>
    <line x1="796" x2="908" y1="392" y2="392"></line>
    <line x1="796" x2="908" y1="424" y2="424"></line>
    <line x1="908" x2="908" y1="392" y2="424"></line>
  </g>
  <g>
    <line marker-end="url(#triangle)" x1="852" x2="852" y1="448" y2="436"></line>
  </g>
  <g>
    <text x="17" y="252">RangeReplaceableCollection</text>
  </g>
  <g>
    <text x="161" y="444">TextOutputStreamable</text>
  </g>
  <g>
    <text x="177" y="380">TextOutputStream</text>
  </g>
  <g>
    <text x="225" y="140">Collection</text>
  </g>
  <g>
    <text x="233" y="60">Sequence</text>
  </g>
  <g>
    <text x="289" y="252">BidirectionalCollection</text>
  </g>
  <g>
    <text x="329" y="540">String</text>
  </g>
  <g>
    <text x="409" y="412">StringProtocol</text>
  </g>
  <g>
    <text x="505" y="700">CustomDebugStringConvertible</text>
  </g>
  <g>
    <text x="513" y="540">LosslessStringConvertible</text>
  </g>
  <g>
    <text x="521" y="620">CustomStringConvertible</text>
  </g>
  <g>
    <text x="529" y="140">
      ExpressibleByExtendedGraphemeClusterLiteral</text>
  </g>
  <g>
    <text x="569" y="60">ExpressibleByUnicodeScalarLiteral</text>
  </g>
  <g>
    <text x="577" y="300">ExpressibleByStringInterpolation</text>
  </g>
  <g>
    <text x="601" y="220">ExpressibleByStringLiteral</text>
  </g>
  <g>
    <text x="649" y="380">Comparable</text>
  </g>
  <g>
    <text x="657" y="444">Hashable</text>
  </g>
  <g>
    <text x="809" y="412">Equatable</text>
  </g>
</svg>
来自：[航空学院的 Swift 字符串指引](https://flight.school/books/strings/)

当你 *能够* 创建一个与 `String` 等价的自定义类型时，[文档](https://developer.apple.com/documentation/swift/stringprotocol) 却又强烈的建议不要这样做：

> 不应该再有别的类型遵循 StringProtocol 。在标准库中应当只有 `String` 和 `Substring` 遵循它。

### 实现一个不区分大小写的属性修饰器

下面的 `CaseInsensitive` 类型实现了一个修饰 `String`/`SubString` 的属性修饰器。通过桥接 `NSString` 的 API [`caseInsensitiveCompare(_:)`](https://developer.apple.com/documentation/foundation/nsstring/1414769-caseinsensitivecompare) ，`CaseInsensitive` 类型符合了 `Comparable` 协议（本质是通过扩展的方式实现了 `Equatable` 协议）：

```swift
import Foundation

@propertyWrapper
struct CaseInsensitive<Value: StringProtocol> {
    var wrappedValue: Value
}

extension CaseInsensitive: Comparable {
    private func compare(_ other: CaseInsensitive) -> ComparisonResult {
        wrappedValue.caseInsensitiveCompare(other.wrappedValue)
    }

    static func == (lhs: CaseInsensitive, rhs: CaseInsensitive) -> Bool {
        lhs.compare(rhs) == .orderedSame
    }

    static func < (lhs: CaseInsensitive, rhs: CaseInsensitive) -> Bool {
        lhs.compare(rhs) == .orderedAscending
    }

    static func > (lhs: CaseInsensitive, rhs: CaseInsensitive) -> Bool {
        lhs.compare(rhs) == .orderedDescending
    }
}
```

> 虽然大于运算符（`>`）[可以被自动派生](https://nshipster.com/equatable-and-comparable/#comparable)，我们为了优化性能应该在这里实现它，避免对底层方法 `caseInsensitiveCompare` 进行不必要的调用。

构造两个只是大小写不同的字符串，并且对于标准的相等检查他们会返回 `false`，但是在用 `CaseInsensitive` 对象修饰的时候返回 `true`。

```swift
let hello: String = "hello"
let HELLO: String = "HELLO"

hello == HELLO // false
CaseInsensitive(wrappedValue: hello) == CaseInsensitive(wrappedValue: HELLO) // true
```

到目前为止，这个方法看起来和前文提到的方案，即创建一个包含 `String` 值的自定义 `CaseInsensitive` 类型，没什么区别。不过想要让自定义的 `CaseInsensitive` 类型变得和 `String` 一样好用，我们还需要考虑实现诸如 `ExpressibleByStringLiteral` 在内的其他协议，所以这才是漫漫长路的开始。

不过属性修饰器允许我们抛开这些繁琐的工作：

```swift
struct Account: Equatable {
    @CaseInsensitive var name: String

    init(name: String) {
        $name = CaseInsensitive(wrappedValue: name)
    }
}

var johnny = Account(name: "johnny")
let JOHNNY = Account(name: "JOHNNY")
let Jane = Account(name: "Jane")

johnny == JOHNNY // true
johnny == Jane // false

johnny.name == JOHNNY.name // false

johnny.name = "Johnny"
johnny.name // "Johnny"
```

这里，`Account` 对象通过 `name` 属性进行了一次判等，且判等的过程中不区分字母的大小写。可是当我们去获取或设置 `name` 属性时，它又像一个 *真正的* `String` 值一样区分字母大小写了。

*这很整洁，但这里到底发生了什么？*

自 Swift 4 以后，如果某个类型里的存储属性都遵守了 `Equatable ` 协议的话，那么编译器将自动为这个类型增加 `Equatable` 的能力。因为这些实现是隐式的（至少目前看起来是这样），属性修饰器是通过被封装的值进行判等的，而不是对构成属性修饰器的值判等。

```swift
// 由 Swift 编译器生成
extension Account: Equatable {
    static func == (lhs: Account, rhs: Account) -> Bool {
        lhs.$name == rhs.$name
    }
}
```

#### 举一反三

- 定义 `@CompatibilityEquivalence` 属性修饰器，当修饰 `String` 类型的属性时，带有 `"①"` 和 `"1"` 时会被认为相等。
- 实现一个 `@Approximate` 属性修饰器，来重新定义浮点数类型的相等语义 （另见 [SE-0259](https://github.com/apple/swift-evolution/blob/master/proposals/0259-approximately-equal.md)）。
- 实现一个 `@Ranked` 属性修饰器，它会带有一个函数，函数中定义了枚举值的排序；而这个排序需要符合我们通常打牌时的规则，例如牌面为 A 时，它既有可能是最大值，也可能是最小值。

<a name="auditing-property-access"></a>
## 审查属性访问

业务要求可能会用某些控制措施，规定谁可以访问哪些记录，或者规定一些形式表格要随着时间变换。

重申一下，类似这样的功能通常不会在 iOS 端上完成；大多数业务逻辑都是在服务端完成的，许多客户端开发者并不想与这样的业务逻辑打交道。而下面的这个例子打开了一个新的视角来看待这个问题，当然这也归功于属性修饰器的功劳。

### 为属性值增加版本记录

下面的 `Versioned` 结构体函数用作一个属性修饰器，拦截了输入的值，并在设置每个值的时候创建带时间戳的记录。

```swift
import Foundation

@propertyWrapper
struct Versioned<Value> {
    private var value: Value
    private(set) var timestampedValues: [(Date, Value)] = []

    var wrappedValue: Value {
        get { value }

        set {
            defer { timestampedValues.append((Date(), value)) }
            value = newValue
        }
    }

    init(initialValue value: Value) {
        self.wrappedValue = value
    }
}
```

下面是 `ExpenseReport` 类，它带有一个名为 `state` 的属性并被 `@Versioned` 属性修饰期所修饰。通过这种方式，我们可以回溯每一次的操作记录。

```swift
class ExpenseReport {
    enum State { case submitted, received, approved, denied }

    @Versioned var state: State = .submitted
}
```

### 举一反三

- 实现一个 `@Audited` 属性修饰器，在每次读写属性的时候打印日志。
- 实现一个 `@Decaying` 属性修饰器，它在每次值被读取的时候都会去除以一个设定的值。

---

不可否认的是，这个特定的示例还是暴露了属性修饰器的一些局限性：**属性无法被标记为 `throws`。**当然这个问题的根源还是在 Swift 语言自身上。

由于在错误处理上的能力欠缺，属性修饰器并没有什么好办法让代码完全按照你的设想执行。例如我们想让 `@Versioned` 属性修饰器支持这样一个特性，即在设置 `state` 属性时 ，当属性被设置为 `.denied` 后，就不能再被设置为 `.approved`，针对这种场景，现有的最佳方案是 `fatalError()`，但在实际的生产环境中，这可就不一定了：

```swift
class ExpenseReport {
    @Versioned var state: State = .submitted {
        willSet {
            if newValue == .approved,
                $state.timestampedValues.map { $0.1 }.contains(.denied)
            {
                fatalError("J'Accuse!")
            }
        }
    }
}

var tripExpenses = ExpenseReport()
tripExpenses.state = .denied
tripExpenses.state = .approved // Fatal error: "J'Accuse!"
```

属性修饰器的局限性还有不少，这里提到的只是其中一点。所以为了更理性的看待这个特性，文章剩下的篇幅将会说说它的局限性都体现在哪里。

## 局限性

> 受我目前的理解能力和想象能力所限，下面给出的观点可能比较主观，有可能并不是属性修饰器这个提议本身造成的。
> 如果你有任何好的建议或者意见，欢迎 [联系我们](https://twitter.com/NSHipster/) 。

### 属性不能参与错误处理

属性不像函数，无法使用 `throws` 标记。

关于上面提到的问题，原本就是函数与属性之间为数不多的区别之一。由于属性同时拥有获取方法（getter）和设置方法（setter），所以在这里如何进行错误处理并没有明确的最佳实践。尤其是你需要在兼顾访问控制，自定义获取方法/设置方法和回调的状态下，还写出优雅的语句。

如上一节所示，可以通过下面两种方式来处理非法值问题：

1. 忽略它们（静默地）
2. 用 `fatalError()` 抛出崩溃。

不论哪一种方案都不够优雅，所以如果你对这个问题有更好的解决方案，欢迎分享。

### 属性修饰器无法起别名

这个提议的另外一个限制就是，你不能使用属性修饰器的实例作为属性修饰器。

还记得前面提到的 `UnitInterval` 么？我们可以用它来限制属性值的范围在 0 到 1 之间。所以我们是不是可以用写成下面的样子呢？：

```swift
typealias UnitInterval = Clamping(0...1) // ❌
```

可惜这样是不被允许的。同样你也不能使用属性修饰器的实例来修饰属性。

```swift
let UnitInterval = Clamping(0...1)
struct Solution { @UnitInterval var pH: Double } // ❌
```

上面的代码说明一个问题，在实际使用过程中，我们可能会写出比预期多的重复代码。但考虑到这个问题的本质是计算机编程语言中值与类型是两种完全不同的东西引起的。所以从避免错误抽象的角度来看，这一小点的重复是完全可以忍受的。

### 属性修饰器很难组合

属性修饰器的组合不是一个可交换的操作；你声明它们的顺序影响了它们的作用顺序。

属性在进行 [字符串字符串的 string inflection 操作](https://nshipster.com/valuetransformer/#thinking-forwards-and-backwards) 和 string transforms 操作会互相影响。例如下面的属性修饰器组合，它的功能是将博客文章中的 URL “slug” 属性自动格式化，但这里的问题在于将短划线替换成空格的操作和去除空格的操作会互相影响，进而导致最终的结果发生变化。

```swift
struct Post {
    <#...#>
    @Dasherized @Trimmed var slug: String
}
```

但是，要让它先发挥作用，说起来容易做起来难！尝试组合 `String` 值的两个属性修饰器方法失败，因为最外层修饰器影响了在最内层的修饰器类型的值。

```swift
@propertyWrapper
struct Dasherized {
    private(set) var value: String = ""

    var wrappedValue: String {
        get { value }
        set { value = newValue.replacingOccurrences(of: " ", with: "-") }
    }

    init(initialValue: String) {
        self.wrappedValue = initialValue
    }
}

struct Post {
    <#...#>
    @Dasherized @Trimmed var slug: String // ⚠️ 发生内部错误.
}
```

目前是有一个办法实现这个特性，但并不怎么优雅。关于这个问题是会在后续的版本中进行修复，还是通过文档正式说明都需要我们耐心的等待。

### 属性修饰器不是一等依赖类型

*依赖类型* 是由它的值定义的类型。例如，“一对后者比前者更大的整数”和“一个具有素数元素的数组”都是依赖类型，因为他们的类型定义取决与他们的值。

在 Swift 的类型系统里缺少对依赖类型的支持，如果想获得相关的特性需要在运行时完成。

好消息是，相比于其他语言，Swift 的属性修饰器算是第一个吃螃蟹的，不过即使这样，属性修饰器还不能算是一个完整的值依赖类型解决方案。

例如，你还是不能使用属性修饰器定义一个新类型，即使属性修饰器本身没什么毛病。

```swift
typealias pH = @Clamping(0...14) Double // ❌
func acidity(of: Chemical) -> pH {}
```

你也不能使用属性修饰器去注解集合中的键类型或值类型。

```swift
enum HTTP {
    struct Request {
        var headers: [@CaseInsensitive String: String] // ❌
    }
}
```

这些缺点还是可以忍受的。属性修饰器非常有用，并且弥补了语言中的重要空白。

不知道属性修饰器的诞生会不会重燃大家对依赖类型的关注，当然另外一种可能是大家觉得当前的状态“也不是不能用”，也就没必要将依赖类型这个概念进一步正式化。

### 属性修饰器难以被文档化

**突击测验：**SwiftUI 框架提供了哪些可用的属性修饰器？

去吧，看下 [SwiftUI 官方文档](https://developer.apple.com/documentation/swiftui)，然后试着回答。

😬

公平地讲，这种失败不是属性修饰器所特有的。

如果你的任务是明确标准库中某个 API 都需要哪些协议响应，或是在 `developer.apple.com` 文档中明确某个运算符都支持哪些类型时，你其实就可以考虑转行了。

随着 Swift 的复杂性不断增加，它的可理解性就会不断下降，我想没有比这更让人头疼了吧。

### 属性修饰器让 Swift 进一步复杂化

Swift 是一门比 Objective-C *更加* 复杂的语言。自 Swift 1.0 以来，这就是一条不变的真理。

在 Swift 中有大量的 `@` 前缀，从 Swift 4 提出的 [`@dynamicMemberLookup`](https://github.com/apple/swift-evolution/blob/master/proposals/0195-dynamic-member-lookup.md) 和 [`@dynamicCallable`](https://github.com/apple/swift-evolution/blob/master/proposals/0216-dynamic-callable.md) ，到 [Swift for Tensorflow](https://github.com/tensorflow/swift) 里的 [`@differentiable` 和 `@memberwise`](https://forums.swift.org/t/pre-pitch-swift-differentiable-programming-design-overview/25992)，即使有文档在手，这些东西也使得 Swift 的 API 越来越难理解。从这个角度来看，`@propertyWrapper` 无疑是加重了这个问题的严重性。

我们要如何理解这一切？（这是一个客观的真是问题，不是反问。）

---

好了，现在让我们总结一下这个新特性——

属性修饰器能够让开发者使用到更高层级的语言特性，而这在以前是不可能的。这个提议在提高代码安全性和降低代码复杂性上有巨大的潜力，现阶段我们只是看到了它的一些基本可能性而已。

然而，他们有所承诺，属性修饰器及其他语言特性与 SwiftUI 一起的首次亮相将给 Swift 带来了巨大的变化。果不其然，如他们之前承诺的一样，属性修饰器和其他的新特性随着 SwitUI 在这个夏天闪亮登场，而这一次亮相，为整个 Swift 生态环境带来了巨大的变化。

或者，正如 Nataliya Patsovska 在 [一篇推特](https://twitter.com/nataliya_bg/status/1140519869361926144) 中所提到的:

> iOS API 设计简史：
>
> - Objective C - 在名字中描述了所有语义，类型并不重要
> - Swift 1 到 5 - 名字侧重于清晰度，基础结构体，枚举，类和协议持有语义
> - Swift 5.1 - @wrapped \$path @yolo
> 
> ——[@nataliya_bg](https://twitter.com/nataliya_bg/)

也许我们后面回头看才能知道， Swift 5.1 是不是为我们热爱的语言树立了一个临界点或者转折点。
