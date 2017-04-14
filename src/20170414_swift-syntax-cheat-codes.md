title: "Swift 代码小抄"
date: 2017-04-14
tags: [Swift]
categories: [medium.com]
permalink: swift-syntax-cheat-codes-9ce4ab4bc82e#.qrmtczdec
keywords: 
custom_title: 
description: 

---
原文链接=https://medium.com/swift-programming/swift-syntax-cheat-codes-9ce4ab4bc82e#.qrmtczdec
作者=Andyy Hope
原文日期=2016-07-20
译者=X140yu
校对=walkingway
定稿=CMB

<!--此处开始正文-->

> ↑ ↑ ↓ ↓ ← → ← → B A

无论是你学习的第一门语言是 Swift 还是之前学过 Objective-C，在学习 Swift 的过程中，一定会感叹它*真的*是一门超赞的语言。但如果你不熟悉它的某些语法，就可能会被某些写法吓到。在这里我会介绍一些在写 Swift 过程中常见语法，希望你们能用 Swift 写出更简洁的代码。

<!--more-->

#### Closures（闭包）

```
() -> Void
```

Closure 在 C 或 Objective-C 中也被称为 "unnamed function"（匿名函数） 或者 "block"（代码块）。你可以把闭包当成一个值，传来传去，当然也可以把它当成函数的参数。

如果你之前有过 iOS 开发经验，那么很有可能调用过这个 UIView 的动画 API:

class func animate(withDuration duration: NSTimeInterval, animations: @escaping **() -> Void**)

可以在 `animations:` 参数中传入执行动画的代码，

```swift
UIView.animate(withDuration: 10.0, animations: {
    button.alpha = 0
})
```

这个`animationWithDuration:` 函数会使用我们闭包中的代码，悄悄地做一些神奇的事情，把 `button` 的透明调整到 0（不可见）。


#### Trailing closures（尾随闭包）

```swift
UIView.animate(withDuration: 10.0) {
    button.alpha = 0
}
```

Swift 使用这种方式来减少不必要的语法。如果你仔细看上面的代码就会发现，这和之前在 closure 中举的例子使用的是相同的 API，唯一的区别是它的语法被简化了。

因为 `animate` 函数的最后一个参数是闭包，所以它得名*尾随闭包*。尾随闭包可以省略最后一个参数的名字，并且可以完全把它移出函数参数列表圆括号的外面，这就带来了更优雅和准确的代码。下面的函数都是相同的，不过后面的使用了尾随闭包语法，

```swift
func say(_ message: String, completion: @escaping () -> Void) {
    print(message)
    completion()
}

...

say("Hello", completion: {
    // prints: "Hello"
    // Do some other stuff
})

say("Hello") {
    // prints: "Hello"
    // Do some other stuff
}
```

### Type Alias（类型别名）

```swift
typealias
```

Typealias 是一个能让我们的写代码的时候避免一直重复的实用小工具。有这样一个函数，参数是一个闭包，

```swift
func dance(do: (Int, String, Double) -> (Int, String, Double)) { }
```

起初这还挺直接容易理解的，但如果把这个闭包传到其它函数中去呢？我们还要记住这个闭包的签名，而且在每一个它出现的地方都要确保它的签名是正确的。如果有的地方写错了，编译器就会报错。

```swift
func dance(do: (Int, String, Double) -> (Int, String, Double)) { }

func sing(do: (Int, String, Double) -> (Int, String, Double)) { }

func act(do: (Int, String, Double) -> (Int, String, Double)) { }
```

如果我们修改了这个闭包的签名，问题就出现了。比如交换了其中参数或者返回值的顺序。我们就得把每一个用到的地方都改一下。这个时候 `typealias` 就会比较有帮助了。

```swift
typealias TripleThreat = (Int, String, Double) -> (Int, String, Double)

...

func dance(dance: TripleThreat) { }

func act(act: TripleThreat) { }

func sing(sing: TripleThreat) { }
```

这样就好多了，用 `typealias` 替代了很多重复的代码，而且如果想更改闭包定义的话，直接改 `typealias` 就可以了。

**比较「有名的」typealias**

```swift
typealias Void = ()

typealias NSTimeInterval = Double
```

### 简写参数名

```swift
$0, $1, $2...
```

如果一个闭包有一个或多个参数，Swift 允许我们给它们定义变量名，

```swift
func say(_ message: String, completion: (_ goodbye: String) -> Void) {
    print(message)
    completion("Goodbye")
}

...

say("Hi") { (goodbye: String) -> Void in
    print(goodbye)
}

// prints: "Hi"
// prints: "Goodbye"
```

在这个例子中，尾随闭包有一个名为 `goodbype` 类型是 `String` 的参数，Xcode 会自动把它放在一个元组里，接着是 `->` 、返回值、还有 `in`，我们的代码在下一行。但是这个闭包很小，写这么多代码是没有必要的。来分析一下，如何才能写更少的代码。

```swift
(goodbye: String) -> Void in
```

上面的其实都没有什么存在的必要性，因为可以使用简化的参数名，

```swift
say("Hi") { print($0) }

// prints: "Hi"
// prints: "Goodbye"
```

可以看到，省略了 `goodbye:` 参数名，`Void` 返回类型的定义，还有跟在后面的 `in`。每一个参数依据它们在闭包中定义的顺序而命名。因为语法太简略了，甚至能把所有的代码放到一行。

如果闭包的参数多于一个，对于每一个后面的参数，增加简写参数的数字就可以了。

```swift
(goodbye: String, name: String, age: Int) -> Void in

// $0: goodbye
// $1: name
// $2: age
```

#### 返回 `Self`

```swift
-> Self
```

Swift 2.0 发布的时候，新增了一些方法，比如 `map` 和 `flatMap`，更酷的是，可以通过点语法把这些方法串起来，

```swift
[1, 2, 3, nil, 5]
    .flatMap { $0 }     // 清除 nil
    .filter { $0 < 3 }  // 选出小于 3 的值
    .map { $0 * 100 }   // 每个值乘 100
// [100, 200]
```

是不是很酷！这种语法*非常*优雅，很容易阅读和理解，我们应该尽可能多地使用它们。

如果存在一个 `String` 的 extension，在此方法里面我们做了一些对于这个 `String` 本身的操作，这个时候函数不要返回 `Void`，而返回 `Self`，

```swift
// extension UIView

func with(backgroundColor: UIColor) -> Self {
    backgroundColor = color
    return self
}

func with(cornerRadius: CGFloat) -> Self {
    layer.cornerRadius = 3
    return self
}

...

let view = UIView(frame: CGRect(x: 0, y: 0, width: 10, height: 10))
          .with(backgroundColor: .black)
          .with(cornerRadius: 3)

```


#### 总结

不管你是在写新的代码还是在阅读旧的代码，你可能会发现在这里学习到的可以应用到你的部分代码里。Xcode 自动补全的代码和你自己写的代码不一定是正确的，所以应当一直保持质疑。

*示例代码可以在 GitHub 上找到* [*playground*](https://github.com/andyyhope/Blog_SyntaxCheatCodes)， [*Gist*](https://gist.github.com/andyyhope/7ed96045d3560e8050994662cb97db87)。

*欢迎阅读我的*[*全部文章*](https://medium.com/@AndyyHope)， *你也可以在* [*Twitter*](https://twitter.com/AndyyHope) *上找到我。我在澳大利亚创办了* [*Playgrounds Conference*](http://www.playgroundscon.com/) *期待在下次活动中看到你的身影。*
