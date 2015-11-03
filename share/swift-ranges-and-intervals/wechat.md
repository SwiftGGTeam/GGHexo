Swift 中的范围和区间

> 作者：Ole Begemann，[原文链接](http://oleb.net/blog/2015/09/swift-ranges-and-intervals/)，原文日期：2015-09-24
> 译者：[靛青K](http://www.dianqk.org/)；校对：[pmst](http://www.jianshu.com/users/596f2ba91ce9/latest_articles)；定稿：[小锅](http://www.swiftyper.com/)
  











本系列其它文章：

(1)[自定义模式匹配](http://oleb.net/blog/2015/09/swift-pattern-matching/)

(2)范围和区间(即本篇)

(3)[更多有关模式匹配的例子](http://oleb.net/blog/2015/09/more-pattern-matching-examples/)

> 下载本篇文章所需要的 [playground](http://oleb.net/media/swift-ranges-and-intervals.playground.zip) （Xcode7 运行环境）



在前一篇[有关模式匹配](http://oleb.net/blog/2015/09/swift-pattern-matching/)的文章中，我提及标准库中已经针对**范围和区间**使用`~=`模式匹配操作符进行了重载。

这两个数据类型是相关的，但也有一些重要的区别。对于如何在`switch`中进行不等式条件匹配的问题，它们不失为一个可选的解决方案，本文将对它们进行深入讨论。

## Ranges

范围是用[Range](http://swiftdoc.org/swift-2/type/Range/)类型表达的。一个范围就是一个*索引*集合。

> 注意：一个范围就是一个索引集合。

*Range*在标准库中被频繁使用，特别是处在集合的上下文当中时。当我们查看`Range`定义时，范围和集合之间的紧密关系一目了然：

    
    struct Range<Element : ForwardIndexType> : CollectionType, Indexable, ... { 
        ...
    }

在一个范围中的元素必需遵守`ForwardIndexType`协议，同时`CollecitonType`协议中的大量功能也是基于它实现的。有一个特殊的类型用来表示集合索引的范围，对于获取一个集合的子集是相当有意义的。例如，我们可以使用范围获取一个数组的部分:

    
    let numbers = [1,2,3,4,5,6,7,8,9]
    // 1..<5 等价于 Range(start: 1, end: 5)
    numbers[1..<5] // [2,3,4,5]

正如类型定义中所看到的，*Range*自身遵循`CollectionType`协议，所以几乎所有数组可以做的事情，范围也能够适用。比如用`for`循环遍历元素，或者使用`contains(_:)`检查一个值是否在这个范围内。

虽然范围主要适用于与其他集合配合使用，但谁也无法阻止你创建一个用于表示数字区间的`Range<Int>`。毕竟[Int](http://swiftdoc.org/swift-2/type/Int/)已经实现了`ForwardIndexType`协议。现在回到我们的模式匹配问题。

我们可以用一个范围`(Int.min..<0).contains(x)`表示 x < 0 的情况，这是完全等价的，不过执行速度巨慢。毕竟默认需要遍历整个集合，最糟糕的情况下，将执行[9,223,372,036,854,775,808次](https://en.wikipedia.org/wiki/9223372036854775807)，这相当耗费资源。我们可以为`Comparable`（比如`Int`）类型的索引提供一个更好实现：

    
    extension Range where Element : Comparable {
        func contains(element: Element) -> Bool {
            return element >= startIndex && element < endIndex
        }
    }
    
    (Int.min..<0).contains(-1) // true
    (Int.min..<0).contains(0) // false
    (Int.min..<0).contains(1) // false

这是一个非常好的练习，不过在我们案例中可有可无，因为`~=`操作符为`Range`实现的匹配足够高效（就像我们的`contains(_:)`，`Comparable`只是在索引中工作）。所以我们可以这样的做：

    
    Int.min..<0 ~= -1 // true
    Int.min..<0 ~= 0 // false
    Int.min..<0 ~= 1 // false

在这基础上，我们可以写一个`switch`语句，使用范围查询判断一个数字是否大于，小于还是等于 0，对吗？不幸地是，这并不适用。这段代码会崩溃：

    
    let x = 10
    switch x {
    case 1...Int.max: // EXC_BAD_INSTRUCTION
        print("positive")
    case Int.min..<0:
        print("negative")
    case 0:
        print("zero")
    default:
        fatalError("Should be unreachable")
    }

我们会在`case 1...Int.max`这一行中得到一个`EXC_BAD_INSTRUCTION` 错误信息表明“fatal error: Range end index has no valid successor”。导致错误的原因在于:`range`中的`endIndex`总是指向范围中最后一个元素的后面。这对于半开区间（用 ..< 操作符创建）和闭合区间（用 ... 操作符创建）都是一样的，因为二者的内部实现是一样的，`a...b`事实上就是`a..<b.successor()`。 

> 注意：一个`Range<Int>`永远都不能有`Int.max`

这意味着`Int.max`永远都不会成为一个`Range<Int>`的成员，这同样适用于其他有最大值的类型。这个限制使范围不能满足我们所要的需求。所以接下来让我们来看看区间能不能满足我们的要求。

## 区间

范围和区间是基本相同的概念构建的（一个连续元素的系列，有开始有结尾），但使用了不同的方法。范围基于索引，因此可以是个集合，他们的大多数功能都是基本这个特性的。区间*不是*集合，他们的实现是依赖`Comparable`协议的。我们只可以为服从`Comparable`协议的类型创建区间类型：

    
    protocol IntervalType {
        typealias Bound : Comparable
        ...
    }

有别于范围的定义，区间使用`IntervalType`协议呈现，这个协议有两个具体的实现，`HalfOpenInterval`和`ClosedInterval`。两个范围操作符也为区间提供了重载：..< 创建一个`HalfOpenInterval`和 ... 创建一个`ClosedInterval`。由于默认是重载了`Range`，所以你必须明确变量为区间类型(IntervalType)：

    
    let int1: HalfOpenInterval = 1..<5
    int1.contains(5) // false
    let int2: ClosedInterval = 1...5
    int2.contains(5) // true

另一件事情就是记得`ClosedInterval`不可以为空，x...x 总是会包含 x，而 x...(x-1) 会造成运行时错误。

然而闭合区间可以包含一个类型的最大值。这意味着我们现在可以写我们的`switch`语句了。重复一遍，一定要明确类型，告诉编译器我们想要的是区间而不是范围：

    
    let x = 10
    switch x {
    case 1...Int.max as ClosedInterval:
        print("positive")
    case Int.min..<0 as HalfOpenInterval:
        print("negative")
    case 0:
        print("zero")
    default:
        fatalError("Should be unreachable")
    }

## 为开区间定制操作符

非常好，但我想摆脱`Int.min`和`Int.max`。为了达到这个目的，我们需要为开区间和闭区间自定义前缀操作符和后缀操作符，用于表示所有小于一个上边界的值，或者大于一个下边界的值。这样不仅在语法上要更友善；理想情况下，这些操作符不仅适用于 `Int` 类型，也可以适合于其它拥有最小和最大值的类型。实现看起来应该是这个样子：

    
    switch x {
    case 1...: // an interval from 1 to Int.max (inclusive)
        print("positive")
    case ..<0: // an interval from Int.min to 0 (exclusive)
        print("negative")
    ...
    }

我们需要为 `..<` 和 `...` 分别定义前缀和后缀的实现方式 。下面这段代码基本是基于 [Nate Cook](http://natecook.com/) 写的 [gist片段](https://gist.github.com/natecook1000/3b15b8bd974c8c08b3df) ，他已经在 2014 年 11 月使用范围和区间混合实现了它。我把使用区间的部分放在这里。

首先我们必须声明需要解释的操作符：

    
    prefix operator ..< { }
    prefix operator ... { }
    postfix operator ..< { }
    postfix operator ... { }

紧接着为`Int`实现第一个运算符的方法：

    
    /// Forms a half-open interval from `Int.min` to `upperBound`
    prefix func ..< (upperBound: Int) -> HalfOpenInterval<Int> {
        return Int.min..<upperBound
    }

还可以，但我们应该让它更通用。区间要求它的底层类型都遵循`Comparable`协议，所以使用相同的条件约束是一个很自然的选择。但在这里我们会碰到一个问题：我们需要知道 T 类型的最小值来创建区间，但这并没有一个通用的方法：

    
    prefix func ..< <T : Comparable>(upperBound: T) -> HalfOpenInterval<T> {
        return T.min..<upperBound // error: type 'T' has no member 'min'
    }

甚至是在标准库中的其他协议都没有为数字（就比如`IntegerType`）提供这些--定义在数字类型中的`min`和`max`属性。

Nate 想出了一个很酷的解决方案：定义一个`MinMaxType`的自定义协议，这个协议定义了 `min` 和 `max` 两个属性。因为所有整数类型都有这两个属性，让他们遵守新的协议就不用额外写代码了：

    
    /// Conforming types provide static `max` and `min` constants.
    protocol MinMaxType {
        static var min: Self { get }
        static var max: Self { get }
    }
    
    // Extend relevant types
    extension Int : MinMaxType {}
    extension Int8 : MinMaxType {}
    extension Int16 : MinMaxType {}
    extension Int32 : MinMaxType {}
    extension Int64 : MinMaxType {}
    extension UInt : MinMaxType {}
    extension UInt8 : MinMaxType {}
    extension UInt16 : MinMaxType {}
    extension UInt32 : MinMaxType {}
    extension UInt64 : MinMaxType {}

这里有一个值得牢记的技巧。任何时候，当你有几个不相关的类型，但它们具有相同类型的一个或多个方法、属性，你都可以创建一个新的协议给他们提供一个通用接口。

> 注意：任何时候，当你有几个不相关的类型，但它们具有相同类型的一个或多个方法、属性，你都可以创建一个新的协议给他们提供一个通用接口。

告诉我们的通用类型 T 遵守`MinMaxType`协议以使这个实现可以正常运行：

    
    /// Forms a half-open interval from `T.min` to `upperBound`
    prefix func ..< <T : Comparable where T : MinMaxType>
        (upperBound: T) -> HalfOpenInterval<T> {
        return T.min..<upperBound
    }

这里是其他三个操作符的实现：

    
    /// Forms a closed interval from `T.min` to `upperBound`
    prefix func ... <T : Comparable where T : MinMaxType>
        (upperBound: T) -> ClosedInterval<T> {
        return T.min...upperBound
    }
    
    /// Forms a half-open interval from `lowerBound` to `T.max`
    postfix func ..< <T : Comparable where T : MinMaxType>
        (lowerBound: T) -> HalfOpenInterval<T> {
        return lowerBound..<T.max
    }
    
    /// Forms a closed interval from `lowerBound` to `T.max`
    postfix func ... <T : Comparable where T : MinMaxType>
        (lowerBound: T) -> ClosedInterval<T> {
        return lowerBound...T.max
    }

添加一些测试：

    
    (..<0).contains(Int.min) // true
    (..<0).contains(-1) // true
    (..<0).contains(0) // false
    
    (...0).contains(Int.min) // true
    (...0).contains(0) // true
    (...0).contains(1) // false
    
    (0..<).contains(-1) // false
    (0..<).contains(0) // true
    (0..<).contains(Int.max) // false
    (0..<).contains(Int.max - 1) // true
    
    (0...).contains(-1) // false
    (0...).contains(0) // true
    (0...).contains(Int.max) // true

回到我们的`switch`语句，现在很好地工作了：

    
    switch x {
    case 1...:
        print("positive")
    case ..<0:
        print("negative")
    case 0:
        print("zero")
    default:
        fatalError("Should be unreachable")
    }

## 结论

Swift 中范围和区间都有相似的目的，但有着不同的实现和泛型约束。范围基于索引并且经常用于集合上下文中。这意味着范围不能包含一个类型最大值，这就不适合用在数字的区间上。区间兼容所有的`Comparable`类型，并且没有最大值的限制。

虽然我们应该对自定义操作符持谨慎的态度，但我认为在这个特定的例子中，他们可以明显地提高可读性而没有降低可理解性--这个前缀和后缀操作符非常接近他们原本的意思，甚至是不熟悉这段代码的读者在理解它的时候也不会有多大的困难。

即便如此，我还是认为在这个特定的例子中，使用自定义操作符来替代标准的 Swift 句法（case _ where x > 0）所得到的好处是很小的，因此在实战代码中还是不值得使用。把这个方法暂时视为思考上的实践，而非推荐使用。

如果你喜欢这篇文章，你可能也会喜欢 Chris Eidhof 和 Airspeed Velocity 的即将出版的书，[Swift 进阶](https://www.objc.io/books/advanced-swift/)。他们对于相同的在区间下标上下文中的开闭区间主题讨论了很多其它的东西。我是这本书的技术审校，所以我的意见偏向的，但是如果你对 Swift 很感兴趣，我还是非常推荐这本书给你。这本书当前是 beta 状态，但是现在已经可以买到它的早期预览版了。