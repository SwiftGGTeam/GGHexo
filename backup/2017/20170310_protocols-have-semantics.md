title: "语法的集合？协议可没那么简单"
date: 2017-03-10
tags: [Swift 进阶]
categories: [Ole Begemann]
permalink: protocols-have-semantics
keywords: 
custom_title: 
description: 

---
原文链接=https://oleb.net/blog/2016/12/protocols-have-semantics/
作者=Ole Begemann
原文日期=2016-12-30
译者=Cwift
校对=walkingway
定稿=CMB

<!--此处开始正文-->

本周在 [Swift 进化](https://lists.swift.org/mailman/listinfo/swift-evolution) 板块，有一个有趣的（且争论很久的）讨论。 有人建议在 Swift 标准库中[添加一个名为 DefaultConstructible 的协议](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20161219/029639.html)，其唯一的要求是提供一个无参数的构造器：

```swift
protocol DefaultConstructible {
    init()
}
```

换个说法，用协议的方式规范以下概念：你可以创建某种类型的“默认”值，或者说当没有附加信息时也能得到一个遵守协议的实例。

有一些人，比如 [Xiaodi Wu](https://github.com/xwu) 和 [Dave Abrahams](https://github.com/dabrahams)，提出了一些非常好的论据来反对这个观点。在这里我再次重复一次这些观点，因为我觉得相比这个具体的话题，他们所讨论的内容有着更加广泛的意义。

<!--more-->

## 语义是协议的重要部分

第一点是协议不仅仅只是语法的集合。协议的语义与其提供的接口一样重要。
[Xiaodi Wu](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20161219/029655.html)：
> 在 Swift 中，协议不仅仅确保特定的拼写，而且还确保特定的语义。

[Dave Abrahams](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20161219/029661.html)：
> 我应该补充一点，这是 [Stepanov](https://en.wikipedia.org/wiki/Alexander_Stepanov) 提出的编程通用的核心原则。

[以及](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20161219/029658.html)：
> 协议（也称概念）不仅仅是语法的集合；如果不能给操作增加语义，那你就不能为它们编写有价值的通用算法。因此不应该使用 DefaultConstructible，类比一下，你不应该使用 “Plusable” 来表示遵守者可以进行 x + x 格式的操作。

## Equatable 协议的语义

以 [Equatable](http://swiftdoc.org/v3.0/protocol/Equatable/) 协议为例。它的 API 是很轻量的 —— 只有一个单一的函数：

```swift
public protocol Equatable {
    /// Returns a Boolean value indicating whether two values are equal.
    ///
    /// Equality is the inverse of inequality. For any values `a` and `b`,
    /// `a == b` implies that `a != b` is `false`.
    static func == (lhs: Self, rhs: Self) -> Bool
}
```

不过，当你的类型遵守 Equatable 协议之后，你同时也确保了具体的实现会遵守该协议[在文档中](http://swiftdoc.org/v3.0/protocol/Equatable/)列出的语义。简单来说，这些语义为：

* 相等意味着可替换性 —— 任何两个相等的实例都可以在基于实例值的代码中替换使用。
* 为了保持可替换性，== 运算符应该考虑 Equatable 协议遵守者中所有*可见的成员*。这意味着，如果你编写了一个 Person 结构体，它包含 firstName 和 lastName 两个属性，那么在实现该结构体的 == 操作符时，如果你只使用 firstName 判断相等，你就违反了协议的语义。
* a == a 总是 true（反身性）; a == b 意味着 b == a（对称性）; a == b 和 b == c 意味着 a == c（传递性）。
* 不等与相等是互斥的，所以如果你自定义了一个 != 操作符（不是必须的），你必须保证 a != b 隐含 !(a == b)。

对类实例的恒等式（[===](http://swiftdoc.org/v3.0/operator/eqeqeq/#comment-func-eqeqeq_-anyobject-rhs_-anyobject)）来说，语义基本是同等的。实现上取决于具体类型的特点。来看看 [Jordan Rose 的评论](https://twitter.com/UINT_MIN/status/816691626613448708)。

## 协议应该使用有意义的语法

[Xiaodi Wu](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20161219/029667.html)：
> 再次强调，协议不只包含语法，还有语义。一层含义是**完全没有语法要求的协议也是完全符合语法规范的**，比如 MyProtocolWithSpecialSemantics {}。
“纯语义”协议的一个典型例子是 [Error](https://developer.apple.com/reference/swift/error)，当你给类型添加 Error 的一致性时意味着你告知他人你打算用这个类型进行错误报告。比如：extension String: Error { }
> 稍后
> throw "File not found"
>
> 而另一层含义是**类型满足了协议的所有要求之后，Swift 不能自动地使该类型遵守协议，因为编译器无法判断语义**。

协议的要求 —— 特别是能够进入标准库的协议的要求 —— 定义应该必要且完备，以便可以基于它们实现有价值且通用的算法。

回到 DefaultConstructible 协议的话题上来，我不认为一个只保证 T() 形式的构造器却没有任何语义的协议能实现什么有趣的算法。

## 一个通用的默认值这样的想法是否有意义呢？

或者你可以自问：什么语义可以归结到这样的协议上。有价值的算法来自于一组连贯性的语义组成的约束。

通用的 init() 存在的一个问题是，在没有附加上下文的情况下，不同的 T 对应的构造器 T() 的含义有着巨大的差别：
* 一些类型具有直观的“空值”表示；这些类型可以很好地匹配无参数的构造器：String() 创建一个空字符串；Array()、Dictionary() 和 Set() 创建一个空的集合。
* 数字和布尔类型的空值就没那么清晰了。为什么 Bool() 初始化为 false 而不是 true？看起来几乎是随意设定的。所有的数字类型的初始化值都是 0，直觉上你觉得是由于 0 满足了 a + 0 == a，直到你意识到其实 1 也是一个有效的选择，因为任意数字都满足 a * 1 == a。
* 此外还有一些不是数值的对象。例如，UIView() 和 Thread() 每次调用都会创建不同的对象 —— 尽管这些对象的属性被设置成了“默认”值，但是你无法阐述“默认”的 UIView 和 Thread 对象是何种含义。

[Xiaodi Wu](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20161219/029656.html)：
>  据我所知，nil 格式的默认值没有太多的用处，除非你能得到有关默认值的具体信息。 我希望遇到存在默认值的情况时，你可以得到一个比 nil 更有用的默认值，这就需要提供更多有关当前类型的知识，显然一个宽泛的 DefaultConstructible 是无法提供的。

所以，一些类型拥有有意义的默认值，而另一些则没有。你不能为 init() 的概念分配拥有一致性的语义 —— 除非你添加上下文。

## RangeReplaceableCollection 的语义

标准库中已经有一个协议要求实现 init()，它就是：[RangeReplaceableCollection](https://developer.apple.com/reference/swift/rangereplaceablecollection)。同 DefaultConstructible 不同的是，在该协议的上下文中，init() 是有含义的。我们可以得知协议的遵守者是一个集合，因此 T() 代表一个“空集合”。还可以断言 T() 等价于 someCollection.removeAll()。

RangeReplaceableCollection 的上下文对于语义的归属是必不可少的，上下文指示了这个要求必须在协议中定义，而不是分解成独立的协议（那些细化了 RangeReplaceableCollection 功能的新协议）。

[Dave Abrahams](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20161226/029706.html)：
> 使用 DefaultConstructible 的话你不知道关于 T 的值的任何信息。你无法可靠地使用它。如果默认的构造器是一些更大型的协议（比如 RangeReplaceableCollection）的一部分，那么你就可以说：“它创建了一个空的集合” 以及 “采用默认构造器初始化的实例相当于一个实例调用了 removeAll 方法。”这并不意味着将 init() 的含义与协议脱离。**正确的含义是在协议的遵守者中引入一个 init()，该无参构造器会在协议语义所影响的基础操作中担任重要的角色**。
> [...]
> 将有意义的协议分割成只有语法价值的块是有问题的。我怀疑这里有些事情搞错了。

[以及：](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20161226/029729.html)
> 分解实现部分是一回事，这个过程是思考 [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) 的好时机。只有当通用性可以抽象成某种类型的通用代码时才需要考虑分解需求。事实上，过程是反过来的 —— 需求聚合时需要创建概念（也就是协议）—— 这是[通用性编程过程的重要部分](https://stlab.adobe.com/wiki/index.php/Runtime_Concepts#Concept)。

## 协议的冲突（相同的语法，不同的语义）

另一层含义是，如果两个协议的要求具有（部分或完全）相同的语法但语义不同，那么一个类型不应该同时遵守这两个协议，因为没有办法同时满足两者的语义。
[Xiaodi Wu](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20161226/029686.html)：
> 事实上，我明白语义包含了大量的思考。协议应该携带语义这个概念正在被严格地遵守。所以我认为 DefaultConstructible 这个建议的确是有害的，因为它明显违背了这个重要的思想，它的语义只能由人去支持而不是由编译器去支持。

## 没有语义，协议就退化成了反射

> 如果它走起路来像鸭子，嘎嘎的叫声像鸭子，那它可能就是一只鸭子。
> —— [鸭子类型](https://en.wikipedia.org/wiki/Duck_typing)的经验法则

如我们所知，鸭子式的类型推断不是 Swift 中首选的思维方式，因为一个对象具有的功能（表现为实现了特定的 API）对表达语义没有任何作用。
[Xiaodi Wu](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20161219/029677.html) 认为通过增强 Swift 对反射机制的支持，将更好地满足 DefaultConstructible 协议的目的：
> 在底层，如果你想要一种方法来确定一个类型中是否有 init()。个人觉得这听起来像是反射，而不是协议的一致性。

（反驳的观点是：反射[不能给你编译期的安全性](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20161226/029687.html)。）

## Swift 避免将默认的初始值设置为“零”

反对 DefaultConstructible 协议的第四点是它与 Swift 的策略冲突，没有将值初始化为“零”或其他的默认值。与其他许多语言相反，Swift 不会清除变量的内存 —— 编译器强制开发者使用显式的值初始化每个变量。
依据这种设计哲学，Swift 在处理与 DefaultConstructible 协议类似的其他语言中同样存在的算法（比如[工厂方法](https://en.wikipedia.org/wiki/Factory_method_pattern)）时会将构造默认初始值的职责传递给具体的方法调用者。
[Tony Allevato 认为](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20161226/029773.html)，在 Swift 中，把构造器作为一个函数传入可以非常优雅地实现这个目的：
> 在编程时，有几次我需要提供泛型类型 T 的实例，每当这样的情况 —— 多亏了 Swift 中的函数是一级公民并且构造器可以作为函数使用 —— 我都发现让工厂方法接受一个 ()->T 类型的参数并传入 T.init 要比传入 T 本身的约束更加清晰。