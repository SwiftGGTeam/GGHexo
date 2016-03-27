title: "Swift中的模式匹配"
date: 2015-10-16 09:00:00
tags: [Swift 进阶]
ctegories: [Ole Begemann]
permalink: swift-pattern-matching

---
原文链接=http://oleb.net/blog/2015/09/swift-pattern-matching/
作者=Ole Begemann
原文日期=2015-09-18
译者=lfb_CD
校对=pmst
定稿=千叶知风
发布时间=2015-10-16T09:00:00

<!--此处开始正文-->

# Swift中的模式匹配

更新:
2015.9.19: 添加了一些关于Swift语法问题的笔记。把自定义操作符的符号改为了一个我认为更加适合的。在总结中添加了一些对函数式编程的想法。
2015.9.25: 添加了关于标准库中已经存在的`~>`操作符的笔记
<!--more-->
这个系列的其他文章：
(1)Custom Pattern Matching (就是这篇)
(2)[Ranges and Intervals](http://oleb.net/blog/2015/09/swift-ranges-and-intervals/)
(3)[More Pattern Matching Examples](http://oleb.net/blog/2015/09/more-pattern-matching-examples/)

>[Download this article as a playground](http://oleb.net/media/swift-pattern-matching.playground.zip) for Xcode 7.

Swift有一个很好的特性，你可以对模式匹配系统进行扩展。[Patterns(模式)](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Patterns.html)是规则值在switch语句中的一个case选项，`do-catch`语句中的一个*`catch`*分句，或者是一个*`if`*，*`while`*，*`guard`*，*`for-in`*语句中的一个选项。

举个例子，假设你想判断一个整数是否大于,小于或等于零。你可以使用 `if-else`的结构，但是我认为这段代码并不漂亮：

```Swift
let x = 10
if x > 0 {
    print("positive")
} else if x < 0 {
    print("negative")
} else {
    print("zero")
}
```

采用`switch`语句的话会更加好，我更加喜欢这样写代码:

```Swift
// 伪代码 
switch x {
case > 0:
    print("positive")
case < 0:
    print("negative")
case 0:
    print("zero")
}
```

但是使用不等式条件的匹配模式，`switch`语句中默认是不支持的(注:即不支持`case >0`这种写法)。看看咱们是否可以解决这个问题。为了方便之后的理解，我将使用`case greaterThen(0):print("positive")`的匹配写法替换之前的`case > 0`在内的所有条件。不过，我将稍后回过头来自定义这个操作符。

## 扩展模式匹配

Swift中的模式匹配是基于`~=`操作符。如果表达模式`~=`返回值为`true`则匹配成功。

[标准库中对`~=`有四个重载](http://swiftdoc.org/operator/tildeeq/)：一个是`Equatable`类型，一个是`optionals`，一个是`range`，最后一个是`interval`。虽然`range`和`interval`挺接近的，但在这篇文章中我们不用，你也可以在这篇文章中了解下[Ranges and Intervals](http://oleb.net/blog/2015/09/swift-ranges-and-intervals/)。

所以我们需要实现属于我们自己的`~=`，函数的形式是这样:

```Swift
func ~=(pattern: ???, value: ???) -> Bool
```

我们知道函数必须返回一个布尔类型(`Bool`)的结果值，因为我们需要告知传入值是否满足模式匹配条件。接下来还留有一个问题:函数的传入参数类型是什么?

对于*value*(传入值)来讲，我们只需使用`Int`类型即可满足上文例程中的需求。但是这里我们使用泛型，使其能接受任何类型的数据。`pattern`在实例中将以`greaterThan(0)`或者是`lessThan(0)`的形式出现。一般来讲，`pattern`应该是一个函数，将*value*做为参数传入，如果匹配成功则返回true，其他则返回false。*value*的类型为T，所以pattern的类型也应该为`T -> Bool`:

```Swift
func ~=<T>(pattern: T -> Bool, value: T) -> Bool {
    return pattern(value)
}
```

现在我们需要定义`greaterThan`和`lessThan`函数，用于返回匹配结果。注意:不要将`greaterThan(0)`中的`0`值和传入进行比较的值value混淆了。greaterThan的参数是`pattern`的一部分，应用于等会第二步要用到的值。比如，`greaterThan(0) ~= x`和`greaterThan(0)(x)`是一样的。

我们知道`greaterThen(0)`函数必须生成一个类型`T->Bool`函数作为结果值返回。所以反之，`greaterThen`必须是一个函数需要另一个值并返回第一个函数。此外，我们对传入参数进行条件约束:必须遵循`Comparable`协议，这样就能使用`Swift`中的`> 和 <`操作符符了。

```Swift
func greaterThan<T : Comparable>(a: T) -> (T -> Bool) {
    return { (b: T) -> Bool in b > a }
}
```

对于这类接受一个参数，并且又返回一个可以接受余下参数的函数(以此类推)叫做[curried functions(柯里化函数)](https://en.wikipedia.org/wiki/Currying)。(这是我去年写的关于柯里化函数的文章:[instance methods in Swift are a form of (partially) curried functions](http://oleb.net/blog/2014/07/swift-instance-methods-curried-functions/))。Swift为声明柯里化函数提供了[特殊的语法](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Declarations.html#//apple_ref/doc/uid/TP40014097-CH34-ID363)。使用这样的语句，我们的函数就会像这样：

```Swift
func greaterThan<T : Comparable>(a: T)(_ b: T) -> Bool {
    return b > a
}
func lessThan<T : Comparable>(a: T)(_ b: T) -> Bool {
    return b < a
}
```

这是在我们第一个版本的switch语句中需要写的:

```Swift
switch x {
case greaterThan(0):
    print("positive")
case lessThan(0):
    print("negative")
case 0:
    print("zero")
default:
    fatalError("Should be unreachable")
}
```

相当不错吧，除了`default`那项语句还不完美。如果让编译器检查完所有的情况是不可能的，所以，编译器总是会让我们提供一个`default`的情况。当然，如果你确定你的选项能覆盖所有的可能，把fatalError()调用在`default`情况下也是一个好主意，可以用来记录你预料的这段不会被执行的代码。

## 自定义操作符

滑动到顶部，看一会儿我们之前的伪代码。理想情况下，我们想把`greaterThan(0)`和`lessThan(0)`分别换成`> 0`和`< 0`。

自定义操作符是一个有争议的话题，倘若读者不熟悉某个特定的操作符时，大大降低了可读性。回到我们的例子中，类似于`greaterThan(0)`这样的语句可读性是非常好的，所以可以这样认为，自定义操作符是不需要的。但另一方面，每个人都知道`> 0`是什么意思，所以我们可以尝试着自定义一个类似于这样的操作符。正如我们将会看到的，它不会是完美的。

我们自定义的运算符是一元的 — 它们仅有一个操作数，并且是前缀运算符(与之相对的是后缀运算符，紧跟操作数之后)。一元操作符与其操作数中间是没有空格的，原因在于Swift用空格来消除一元运算符和二元运算符之间的歧义。此外，`<`[不允许作为前缀运算作符](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/LexicalStructure.html#//apple_ref/doc/uid/TP40014097-CH30-ID418)，所以我们必须退而求其次用其他符号替代之。(`>`允许作为前缀运算符，但是不能作为后缀运算符。)

我建议使用`~>`和`~<`。虽然不太理想，`~>`看起来很像一个箭头，但是波浪号形象地表示了约等于(`~=`)这样的关系。另外，我能想到的其他操作符(`>>`和`<<`)与移位操作符很容易混淆在一起，所以不建议使用这两个。

>**更新9.25.2015**：我从[Nate Cook的这篇文章中得知](http://natecook.com/blog/2014/11/swifts-elusive-tilde-gt-operator/)操作符`~>`已经存在于[标准库](http://swiftdoc.org/swift-2/operator/tildegt/)中了。它并没有任何公开的实现，但是Nate发现它是用来增加集合的索引值的。鉴于有这种用法，完成不同的目的却使用相同的操作符似乎不太合适。我感觉可以随意用其他符号替代。

实现起来也是比较麻烦的。我们需要做的就是声明运算符以及具体函数的实现，这里仅仅只是委托先前定义的`greaterThan`和`lessThan`函数来完成运算符的实现。

```Swift
prefix operator ~> { }
prefix operator ~< { }

prefix func ~> <T : Comparable>(a: T)(_ b: T) -> Bool {
    return greaterThan(a)(b)
}

prefix func ~< <T : Comparable>(a: T)(_ b: T) -> Bool {
    return lessThan(a)(b)
}
```

有了这个，我们的`switch`语句就变成了：

```Swift
switch x {
case ~>0:
    print("positive")
case ~<0:
    print("negative")
case 0:
    print("zero")
default:
    fatalError("Should be unreachable")
}
```

再次提醒，注意运算符和操作数之间是没有空格的。

这是我们能写得最好的了，非常接近我们之前想要实现的了，但这段代码也并不是完美的了。

>**2015.9.19更新**：[Joseph Lord](https://twitter.com/jl_hfl/status/644992487346581504)提醒我，Swift已经有类似语法用于实现先前的的匹配模式：

```Swift
switch x {
case _ where x > 0:
    print("positive")
case _ where x < 0:
    print("negative")
case 0:
    print("zero")
default:
    fatalError("Should be unreachable")
}
```

(*`default`选项仍然是用来确保编译器能安全工作，我已经提交了这个bug，rdar://22765436*)

*这种语法，尽管没有我们自定义解决方案显得简明，但是它却不需要额外自定义一个运算符，看起来还是不错的。不管怎样，该设计方式非常通用，应用范围广。请继续阅读。*

## 其他方面的应用

顺便说一句，这里提出的解决方案是非常通用的。我们重载的操作符`~=`适用于任何类型的`T`和任何接受一个参数`T`并且返回一个`Bool`类型的函数。也就是说,我们使`pattern(value)`变成了`pattern ~=`这样的语法糖。同时，通过扩展，把`if pattern(value) { ... }`变成了`switch value { case pattern: ... }`这样的语法糖。

## 检查一个数字是偶数还是奇数

下面是一些使用范例。第一个简单示例用于说明知识点，但实际应用意义不大。假设你有一个`isEven`函数用来检查一个数是否是偶数：

```Swift
func isEven<T : IntegerType>(a: T) -> Bool {
    return a % 2 == 0
}
```

现在这样:

```Swift
switch isEven(x) {
	case true: print("even")
	case false: print("odd")
}
```

可以写成这样:

```Swift
switch x {
case isEven: print("even")
default: print("odd")
}
```

再次注意`default`选项。以下代码无法正常工作：

```Swift
switch x {
case isEven: print("even")
case isOdd: print("odd")
}
// error: Switch must be exhaustive, consider adding a default clause
```

# 字符串匹配

这儿有一个更实际的例子，假设你想检查一个字符串是否包含前缀或者是后缀。我们先写两个函数，`hasPrefix`和`hasSuffix`，将两个字符串作为它们的参数，检查第一个参数是否是第二个参数的前缀或者后缀。这些只是改变了一下标准库中已经存在的[`String.hasPrefix`](https://developer.apple.com/library/ios/documentation/Swift/Reference/Swift_String_Structure/index.html#//apple_ref/swift/structm/String/s:FSS9hasPrefixFSSFSSSb)和[`String.hasSuffix`](https://developer.apple.com/library/ios/documentation/Swift/Reference/Swift_String_Structure/index.html#//apple_ref/swift/structm/String/s:FSS9hasSuffixFSSFSSSb)方法——把参数排了下顺序（前缀/后缀为第一个参数，全字符串为第二个参数）。如果你使用`Partial Applied Function`（偏应用函数，可以缺少部分参数的函数）传递给其他的函数的情况很多，你会发现你经常得去适配被调用的接口。这可能让人觉得很烦，但这也不会很难。

```Swift
func hasPrefix(prefix: String)(value: String) -> Bool {
    return value.hasPrefix(prefix)
}

func hasSuffix(suffix: String)(value: String) -> Bool {
    return value.hasSuffix(suffix)
}
```

在我看来，以下实现方式大大提高了代码可读性:

```Swift
let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
switch str {
case hasPrefix("B"), hasPrefix("C"):
    print("Starts with B or C")
case hasPrefix("D"):
    print("Starts with D")
case hasSuffix("Z"):
    print("Ends with Z")
default:
    print("Something else")
}
```

## 总结

针对我们最初问题的一个通用的解决方案，我们提出了可以应用于很多不同的问题的解决方案。我发现这种情况很普遍：当你将函数作为值时可以到处传递并且通常用于你不想使用它们的地方。函数式编程提高了代码的可组合性，这是在参数使用的一个核心理念。

在内置的数据类型或者是你自定义的数据类型的基础上，可以给Swift的模式匹配系统扩展出可以非常强大的新功能。但是，请不要过度地去扩展。虽然它看起来比原始的解决方案更加清晰，但是对那些不熟悉它的人来说，自定义的语法会使你的代码可读性变差。
