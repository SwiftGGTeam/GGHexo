Swift 2 中的新特性

> 作者：Greg Heo，[原文链接](http://www.raywenderlich.com/108522/whats-new-in-swift-2)，原文日期：2015/06/12
> 译者：[小锅](http://www.swiftyper.com/)；校对：[numbbbbb](https://github.com/numbbbbb)；定稿：[shanksyang](undefined)
  








![][3]

在 WWDC 大会上，我们发现 Swift 小组为 Swift 2 的发展做出了很大的努力。

我们最近将会更新大量关于 Swift 2 的文章和视频教程，不过在这之前，我想先将 Swift 2 中令人兴奋的更新变化先挑出来唠一唠，以让你能顺利地迁移到这个秋天将会发布的正式版 Swift 2 中。



## Error Handling(错误处理)

就像 Ray 在[WWDC 2015 Initial Impressions][4]这篇文章中提到的一样，错误处理在 Swift 2 当中有了很大的更新。对比以前使用的`NSError`对象，新版的错误处理看起来更像其它语言（吐槽：没错，说的就是你，JAVA）中的异常处理。

你可能已经很熟悉这样的代码：

```swift
if drinkWithError(nil) {
    print("Could not drink beer! :[")
    return
}
```

在`Cocoa`编程中，我们通常传入一个`NSError`对象的引用（在Swift中是一个inout类型的参数），如果出现了错误，则这个方法会对错误对象进行赋值。然而，问题的关键在于，你完全可以通过传入一个`nil`参数来忽略这个错误，或者你可以传一个`NSError`对象进去，但是不对这个错误对象进行任何处理。

Swift 2 更进一步加强了错误处理的安全性。我们可以使用`throws`关键字表示一个方法可能抛出错误。然后我们可以使用`do`、`try`和`catch`这些关键字来对可能抛出错误的方法进行处理：

```swift
// 1
enum DrinkError: ErrorType {
    case NoBeerRemainingError
}

// 2
func drinkWithError() throws {
    if beer.isAvailable() {
        // 嗨起来
    } else {
        // 3
        throw DrinkError.NoBeerRemainingError
    }
}

func tryToDrink() {
    // 4
    do {
        try drinkWithError()
    } catch {
        print("Could not drink beer! :[")
        return
    }
}
```

这里有几个要点：
1. 要创建一个可以抛出的错误，只要创建一个继承于`ErrorType`类型的枚举就行了。
2. 你需要使用`throws`关键字来标记出可能抛出错误的函数。
3. 这里抛出了错误，这个错误可以在4中被捕获到
4. 跟我们所熟悉的某语言（吐槽：还不是JAVA？）不同，这里不是使用`try`而是用`do`来包裹可能捕获到错误的代码块。然后，使用`try`关键字来对可能抛出错误的方法进行调用。

新的语法相当轻量，并且可读性很高。之前系统中所有使用`NSError`的方法，都会改用这个新的语法，所以在之后我们将会看到很多类似这样的代码。

![][5]

## Binding(绑定)

在 Swift 1.2 当中，我们可以在一行当中同时对多个可选值进行解绑，从而摆脱了所谓的"金字塔的厄运"：

```swift
if let pants = pants, frog = frog {
    // good stuff here!
}
```

这很好，但是对于某些强迫症患者来说可能有点难受，因为只要我们对可选值进行绑定就意味着对我们有用的代码都必须写在一个`if`代码块中，这实在太不爽了（译注：至少对我来说很不爽）。

如果能有种方法，能让我们能检测到某些可选类型是没有值的，这样我们就可以提前结束这个函数。当然有！这就是Swift 2中提供的`guard`声明的用处所在：

```swift
guard let pants = pants, frog = frog else {
    // sorry, no frog pants here :[
    return
}

// 在此后的作用域中，pants 和 frog 都是绑定过并且有值的
```

使用`guard`意味着你可以对可选类型进行绑定（或者其它操作，真的），然后在`else`中提供代码块以处理判断失败的状况。接着，你可以继续往下执行 - 在这种情况下，在整个作用域中，可选类型的`frog`和`pants`都已经进行过绑定，并且不再是可选类型了。

这可以让我们的代码更加清楚和简洁，因为`guard`可以让你在你所期望的状态下专心写代码，而不用再一直对错误进行判断。

> 附注：如果你还是对为什么使用`guard`声明比使用`if-else`更有用抱有疑惑的话，可以看下 Swift 开发组成员[Eric Cerney][6]的这篇文章[Swift guard statement][7]。
    
## Protocol Extensions（协议扩展）

面向对象编程？函数式编程？现在对 Swift 的描述中又要加上重要的一笔：面向协议的编程语言！

在 Swift 1 当中，协议就是一个定义了一些属性和方法的接口。类、结构体和枚举类型都能遵守这些协议，并实现相应的方法。

现在的 Swift 2 可以对协议进行扩展，然后为属性和方法提供默认实现。在之前我们就可以对类和结构体进行这样的操作 -- 比如为`String`和`Array`增加新方法。然而，可以对协议进行扩展有着更重要的意义。

```swift
extension CustomStringConvertible {
  var shoutyDescription: String {
    return "\(self.description.uppercaseString)!!!"
  }
}
 
let greetings = ["Hello", "Hi", "Yo yo yo"]
 
// prints ["Hello", "Hi", "Yo yo yo"]
print("\(greetings.description)")
 
// prints [HELLO, HI, YO YO YO]!!!
print("\(greetings.shoutyDescription)")
```

注意，被大部分`Foundation`对象所遵守的`Printable`协议，现在已经改名为`CustomStringConvertible`。使用协议扩展，我们可以为系统添加更多的自定义功能。并且相对于为各个不同的类、结构体以及枚举分别添加自定义代码，现在可以编写一个通用的实现，然后让不同的类型都遵守这个协议。

Swift 开发团队很早就在为这个功能作出各种努力了 -- 如果你曾经使用过 Swift 当中的`map`或者`filter`，你可能会觉得把他们作为方法使用会比作为全局函数方便很多。感谢协议扩展，Swift当中的集合类型现在拥有了一大波新的方法，比如`map`、`filter`、`indexOf`，等等！

```swift
let numbers = [1, 5, 6, 10, 16, 42, 45]

// Swift 1
find(filter(map(numbers { $0 * 2 }), { $0 % 3 == 0 }), 90)

// Swift 2
numbers.map { $0 * 2 }.filter { $0 % 3 == 0 }.indexOf(90) // return 2
```

使用了新的方法，Swift 2 的代码变得更加简洁和可读。阅读 Swift 1 代码时，为了理解它的作用，你得前前后后盯着看很久。而 Swift 2 的版本中的函数调用链让代码简单易懂。

要理解面向协议编程的强大之处，可以观看[WWDC中关于这个主题的视频][8]，同时请关注本站后续将会推出的新教程和文章。

## 其它变化

在整个大会过程中，苹果还公布了许许多多的新东西，所以下面列出了一些值得关注的亮点：

* Objective-C 泛型 - 苹果很早就在对 Objective-C 代码进行注释，以使我们在开发 Swift 的时候能使用正确的类型。这个工作作为 Objective-C 泛型继续在进行，这可以使 Swift 开发者获得更加直观的类型提示。如果你期望得到一组`UITouch`的对象，或者一个`String`的数组，那么你就可以直接获得，而不是像之前一样只能得到一个`AnyObject`的集合。
* 语法重命名 - `println`函数只陪伴了我们短短的一年。现在我们将使用`print`进行输出，现在这个方法添加了默认为`true`第二个参数，用来指定输出是否要进行换行。因为`do`关键字现在被用于错误处理，现在do-while循环将被替换为`repeat-while`。类似地，还有许多协议名称的变化，比如`Printable`变成了`CustomStringConvertible`。
* 迁移器 - 面对这么多的小变化，我们要怎么对我们的代码进行更新？就让 Swift 迁移器来拯救你吧，使用迁移器可以让我们的代码更新到最新的语法。迁移器甚至能自动将代码更新到新的错误处理语法格式，以及新的文档注释格式。
* 开源！- 对于那些技术宅来说，最重要的新闻当然中 Swift 将会在这个秋天开源。这意味着，Swift 以后将不会仅仅用于 iOS 开发，同时也说明 Swift 将会更加值得我们学习。当然，如果你够屌的话，你可以打开 Swift 的黑盒子，然后对 Swift 团队进行反馈和贡献，让你的名字留在Swift编译器的历史上。;]

## 如何深入学习？

这里只是苹果一大票更新中的一小部分。想要获得更加详细的信息，可以参考[WWDC大会的视频][9]，以及最新更新的[Swift Programming Language一书][10]。

如果有人还记得 Swift 刚推出时，从 beta 版到 1.0 版本中间进行的变化和修改，你就会明白，所有的一切才刚刚开始。本站的教程小组将会持续关注 Swift 最新的变化和更新，并且推出关于这些令人兴奋的更新的一系列文章，以及视频教程。

Swift 2 中哪些部分的更新最让你感到激动？你希望我们的教程从哪里开始？可以在下面留言，让我们知道你的需求！
  
  [1]: http://www.raywenderlich.com
  [3]: http://www.swiftyper.com/usr/uploads/2015/06/1201447177.jpg
  [4]: http://www.raywenderlich.com/108379/wwdc-2015-initial-impressions
  [5]: http://www.swiftyper.com/usr/uploads/2015/06/3611083208.jpg
  [6]: http://www.raywenderlich.com/u/ecerney
  [7]: http://ericcerney.com/swift-guard-statement/
  [8]: https://developer.apple.com/videos/wwdc/2015/?id=408
  [9]: https://developer.apple.com/videos/wwdc/2015/
  [10]: https://itunes.apple.com/us/book/swift-programming-language/id1002622538?mt=11


