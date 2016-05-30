title: "Swift 2.0 ：揭秘 Map 和 FlatMap"
date: 2016-05-30
tags: [Swift 进阶]
categories: [uriamo]
permalink: swift2-map-flatmap-demystified
keywords: swift2.0教程,swift map flatmap
custom_title: 
description: 在 Swift 2.0 中 flatmap 与 map 的区别很多人都还不大明白吧，那么看过本文你应该会有所了解。

---
原文链接=2015/10/08/Swift2-map-flatmap-demystified/
作者=uraimo
原文日期=2015-10-08
译者=靛青K
校对=Channe
定稿=shanks

<!--此处开始正文-->

> 这是一篇 Swift 2.0 的文章，本文源码在 [GitHub](https://github.com/uraimo/Swift-Playgrounds) ，你也可以直接下载 [zipped](https://github.com/uraimo/Swift-Playgrounds/raw/master/archives/2015-10-MapFlatMapPlayground.playground.zip)。

Swift 依然是一个有些不稳定的语言，每次发布新版本，都带来新的功能和特性。许多人都已经写了 Swift 的函数的相关内容以及如何用更“纯”的函数式的方法处理问题。

<!--more-->

<center>
![神秘但准确的描述了`单子`的装订(bind)](https://www.uraimo.com/imgs/bind.png)
</center>

考虑到 Swift 语言依然在初期状态，往往在尝试去理解一些特定的话题时，最后你会发现许多文章都是用 Swift 2.0 之前的语法，或者更糟糕的一些，内容混杂着多个版本语法。有时，搜索 `flatMap` 的文章，你发现不止一篇[好文章](http://khanlou.com/2015/09/what-the-heck-is-a-monad/)都会在 Swift 中解释 [Monads](http://codeplease.io/2015/08/05/monads/)。

相关概念缺乏全面介绍的新文章，现在的许多文章常常用一些不是通俗易懂的例子和生硬的隐喻，一些人甚至使用一些难以理解的方式思考问题。

在这篇简短的文章中（这是 [Swift与函数式](https://www.uraimo.com/category/functional/)系列文章中的一篇），我将通过引用当前库的头文件，试着对【如何在 Swift 2.0 中对不同的类型使用 `map` 和 `flatMap`】，给出一个清晰全面的解释。

## 目录

* [Map](#map)
  * [在 Optionals 上使用 Map](#在 Optionals 上使用 Map)
  * [在 SequenceTypes 上使用 Map](#在 SequenceTypes 上使用 Map)
* [FlatMap](#flatmap)
  * [在 Optionals 上使用 FlatMap](#在 Optionals 上使用 FlatMap)
  * [在 SequenceTypes 上使用 FlatMap](#在 SequenceTypes 上使用 FlatMap)

## Map

map 和 flatmap 方法中， map 有着更清晰的行为，它简单的对输入执行一个闭包，和 flatMap 一样，它可以用在 [Optionals](http://swiftdoc.org/v2.0/type/Optional/) 和 [SequenceTypes](http://swiftdoc.org/v2.0/protocol/SequenceType/) 上（如：数组、词典等）。

### 在 Optionals 上使用 Map

下面是 Optionals 上 map 方法的原型：

```swift
public enum Optional<Wrapped> : ... {
	...
    /*
		如果 `self == nil` ，直接返回 `nil` 。否则返回 `f(self!)` 。
	*/
    public func map<U>(f: (Wrapped) throws -> U) rethrows -> U?
	...
}
```

这个 map 方法期望一个签名为 `(Wrapped) -> U`的闭包 ，如果这个可选值有值，那就解包并执行这个函数，之后再用一个可选值包裹这个结果并返回这个可选值（言外之意是指这是一个隐式可选解包，但这并没有引入什么不同的行为，只需要知道 map 并没有真的返回一个可选值）。

注意到输出类型可以和输入类型不同，这就带来了大量有用的特性。

老实说，这里不需要多余的解释了，让我们直接看这篇文章 [Playground](https://github.com/uraimo/Swift-Playgrounds) 上的代码吧：

```swift
var o1:Int? = nil

var o1m = o1.map({$0 * 2})
o1m /* Int? 类型，结果为 nil */

o1 = 1

o1m = o1.map({$0 * 2})
o1m /* Int? 类型，结果为 2 */

var os1m = o1.map({ (value) -> String in
    String(value * 2)
})
os1m /* String? 类型，结果为 2 */

os1m = o1.map({ (value) -> String in
    String(value * 2)
}).map({"number "+$0})
os1m /* String? 类型，结果为 "number 2" */
```

如果我们总是需要修改原始的可选值，使用 map 就可以保留原始的值，（map 只是在可选值有值的时候才执行这个闭包，否则就只是返回 nil）。但最令人兴奋的特性是我们可以自由的连接多个 map 操作，他们会有序的执行，这多亏了调用 map 总是会返回一个可选值。这样，我们就能够进行可选值的链式调用了。

### 在 SequenceTypes 上使用 Map

但是在 SequenceTypes 上，比如数组和字典，使用 map 方法就很难跳过为空的可选值：

```swift

var a1 = [1,2,3,4,5,6]

var a1m = a1.map({$0 * 2})
a1m /* [Int] 类型，结果为 [2, 4, 6, 8, 10, 12] */

let ao1:[Int?] = [1,2,3,4,5,6]

var ao1m = ao1.map({$0! * 2})
ao1m /* [Int] 类型，结果为 [2, 4, 6, 8, 10, 12]  */

var a1ms = a1.map({ (value) -> String in
    String(value * 2)
}).map { (stringValue) -> Int? in
    Int(stringValue)
}
a1ms /* [Int?] 类型，结果为 [.Some(2),.Some(4),.Some(6),.Some(8),.Some(10),.Some(12)] */
```

这时我们调用的 map 方法在 SequenceTypes 下定义成这个样子：

```swift
/* 
   返回一个对 `self` 每个元素进行变换后的结果数组

   - 复杂度: O(N).
*/
func map<T>(@noescape transform: (Self.Generator.Element) throws -> T) rethrows -> [T]
```

这个变换的闭包类型 `(Self.Generator.Element) throws -> T` ，会应用到集合中的每个成员，之后用一个相同的类型打包进一个数组中。和上文可选值的例子一样，有序的操作可以像管道（pipeline）一样在上一个 map 操作返回的结果上调用 map。

这些基本就是你可以用 `map` 做的事情了，但在开始 `flatMap` 前，我们再看三个例子：

```swift
var s1:String? = "1"
var i1 = s1.map {
    Int($0)
}
i1 /* Int?? 类型，结果为 1 */

var ar1 = ["1","2","3","a"]
var ar1m = ar1.map {
    Int($0)
}
ar1m /* [Int?] 类型，结果为 [.Some(1),.Some(2),.Some(3),nil] */

ar1m = ar1.map {
    Int($0)
    }
    .filter({$0 != nil})
    .map {$0! * 2}
ar1m /* [Int?] 类型，结果为 [.Some(2),.Some(4),.Some(6)] */
```

并不是每个 String 都可以转成 Int ，所以我们的整数转换闭包总是返回一个 Int? 类型 。那在第一个例子中发生了什么？为什么返回的是 Int?? ，也就是结尾为什么是一个可选值的可选值，在执行 map 后多了一个可选包裹。解包两次才可以得到真正包含的值，虽然不是什么大问题。但当我们需要链式添加 map 操作符时就会显得很麻烦。我们即将看到， `flatMap` 会帮我们解决这个问题。

在这个数组的例子中，如果一个 String 不能转换成 Int ，就像 `ar1` 的第四个值返回的就是 nil 。但是再想一下，如果我们希望在第一个 map 操作再链式添加一个 map 操作，这个操作后能获得一个更短的、只有数字没有 nil 的数组，该怎么办呢？

好了，我们只需要在中间过滤出可用的元素，并且为下一个 map 操作准备好数据流。把这些行为嵌入到一个 `map` 中是不是很麻烦？我们来看看另一种使用 `flatMap` 的方法。

## FlatMap

`map` 和 `flatMap` 的差别看起来不大，但它们是有明显区别的。

虽然 `flatMap` 依然是一个类似 map 的操作，但它在 mapping 解析后额外调用了 `flatten` 。让我们用类似上一节的代码来分析 flatMap 的功能。

### 在 Optionals 上使用 FlatMap

这个方法的定义有一些不同，但功能是相似的，只是改写了一下注释的含义：

```swift
public enum Optional<Wrapped> : ... {
	...
    /*
		如果 `self` 是 nil ，直接返回 `nil` ，否则返回 `f(self!)` 。
	*/
    public func flatMap<U>(f: (Wrapped) throws -> U?) rethrows -> U?
	...
}
```

就闭包而言，这里有一个明显的不同，这次 `flatMap` 期望一个 `(Wrapped) -> U?)` 闭包。

对于可选值， flatMap 对于输入一个可选值时应用闭包返回一个可选值，之后这个结果会被压平，也就是返回一个解包后的结果。

本质上，相比 `map` ， `flatMap` 也就是在可选值层做了一个解包。

```swift
var fo1:Int? = nil

var fo1m = fo1.flatMap({$0 * 2})
fo1m /* Int? 类型，结果是 nil */

fo1 = 1

fo1m = fo1.flatMap({$0 * 2})
fo1m /* Int? 类型，结果是 2 */

var fos1m = fo1.flatMap({ (value) -> String? in
    String(value * 2)
})
fos1m /* String? 类型，结果是 "2" */

var fs1:String? = "1"

var fi1 = fs1.flatMap {
    Int($0)
}
fi1 /* Int? 类型，结果是 1 */

var fi2 = fs1.flatMap {
    Int($0)
    }.map {$0*2}

fi2 /* Int? 类型，结果是 2 */
```

最后一段代码包含了一个链式调用的例子，使用 `flatMap` 就不需要额外的解包。

接下来我们再来看一看在 SequenceType 下的操作，这是一个将结果压平的步骤。

`flatten` 操作只有一个对嵌套的容器进行 `(拆箱)unboxing` 功能。容器可以是一个数组，一个可选值或者是其他能包含一个的值的容器类型。考虑一个可选值包含另一个可选值，这和我们将在下一小节遇到的数组包含数组的情况类似。

这个行为附带着单子（Monad）上的 `(装订)bind` 操作，要了解更多可以阅读[这篇](http://khanlou.com/2015/09/what-the-heck-is-a-monad/)以及[这篇](http://robnapier.net/flatmap)。

### 在 SequenceType 上使用 FlatMap

SequenceType 提供了下面默认的 `flatMap` 实现：

```swift
    /// 返回一个将变换结果连接起来的数组
    ///
    ///     s.flatMap(transform)
    ///
    /// 等价于
    ///
    ///     Array(s.map(transform).flatten())
    ///
    /// - 复杂度: O(*M* + *N*), 这里的 *M* 是指 `self` 的长度
    ///    *N* 是变换结果的长度
    func flatMap<S : SequenceType>(transform: (Self.Generator.Element) throws -> S) rethrows -> [S.Generator.Element]

    /// 返回一个包含非空值的映射变换结果
    ///
    /// - 复杂度: O(*M* + *N*), 这里的 *M* 是指 `self` 的长度
    ///   *N* 是变换结果的长度
    func flatMap<T>(transform: (Self.Generator.Element) throws -> T?) rethrows -> [T]
```

`flatMap` 对序列中的每个值应用这些转换的闭包，然后将他们打包到一个和输入值类型相同新的数组。

这两个注释的闭包描述了两个 `flatMap` 功能：序列压平和可选过滤。

我们来看看是什么意思：

```swift
var fa1 = [1,2,3,4,5,6]

var fa1m = fa1.flatMap({$0 * 2})
fa1m /*[Int] 类型，结果是 [2, 4, 6, 8, 10, 12] */

var fao1:[Int?] = [1,2,3,4,nil,6]

var fao1m = fao1.flatMap({$0})
fao1m /*[Int] 类型，结果是 [1, 2, 3, 4, 6] */

var fa2 = [[1,2],[3],[4,5,6]]

var fa2m = fa2.flatMap({$0})
fa2m /*[Int] 类型，结果是 [1, 2, 3, 4, 6] */
```

虽然第一个例子和之前使用 `map` 没什么区别，但这很清晰的让后面两个代码片段表明出它的实用性，不需要再手动的使用压平或者过滤。

实际上，有许多使用 `flatMap` 的场景会提高你的代码可读性，并且出错更少。

对于上一个部分最后的代码片段的一个例子，我们现在可以使用`flatMap` 改进一下代码：

```swift
var far1 = ["1","2","3","a"]
var far1m = far1.flatMap {
    Int($0)
}
far1m /* [Int] 类型，结果是 [1, 2, 3] */

far1m = far1.flatMap {
        Int($0)
    }
    .map {$0 * 2}
far1m /* [Int] 类型，结果是 [2, 4, 6] */
```

在这个场景看起来只是一点点的改进，但随着更长的链式，使用 `flatMap` 会极大的提高可读性。

让我重申一遍，也是在这个情况下， Swift 中的 flatMap 行为与 Monads 的 `bind` 是一致的（并且通常 "flatMap" 和 "bind" 是一个意思），你可以从[这篇](http://khanlou.com/2015/09/what-the-heck-is-a-monad/)以及[这篇](http://robnapier.net/flatmap)中了解到更多。

在这个系列的[下篇文章](https://www.uraimo.com/2015/11/12/experimenting-with-swift-2-sequencetype-generatortype/) （[SwiftGG 译文](http://swift.gg/2016/03/10/experimenting-with-swift-2-sequencetype-generatortype/)）你可以学到更多关于 SequenceType 和 GeneratorType 协议的知识。

> 译者注：事实上从源码理解 `map` 和 `flatMap` 效果可能更好一些，推荐一篇文章：[Swift 烧脑体操（四） - map 和 flatMap](http://blog.devtang.com/2016/03/05/swift-gym-4-map-and-flatmap/) 。