Swift: 语法秘笈"

> 作者：Andyy Hope，[原文链接](https://medium.com/swift-programming/swift-syntax-cheat-codes-9ce4ab4bc82e#.tvz9bwxhk)，原文日期：2016/07/20
> 译者：[冬瓜](https://desgard.com/)；校对：[Darren](https://github.com/Harman-darrenchen)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  










![][image-1]

↑ ↑ ↓ ↓ ← → ← → B A

无论 Swift 是你的第一门开发语言，还是从 Objective-C 转来，Swift 这门强大的语言都值得我们去学习和使用，但是 Swift 语法的不断迭代更新可能会令你畏惧。本文将会列举一些常见的语法，来帮助你提高 Swift 语言能力，精炼代码。

## 闭包(Closure)

    
    () -> Void

有些文章中也会称作*匿名函数*（unnamed functions），类似于 C 或 Objective-C 中的 *block* ；闭包是一个很轻量但是功能十分强大的函数，常用于类间的值传递，闭包通常作为函数的参数来使用，当然也可以作为变量。



如果你有过 iOS 开发经验，你在使用 **UIView** animation 的 API 时肯定会用到闭包：

    
    class func animateWithDuration(_ duration: NSTimeInterval, animations: () -> Void)

**animation 参数** ：传入动画相关代码，例如：

    
    UIView.animateWithDuration(10.0, animations: {
        button.alpha = 0
    })

`animationWithDuration` 这个函数利用了闭包，最终我们看到的效果是 **button** 逐渐消失，直到 **alpha** 属性为**0**（不可见状态）。

## 尾部闭包（Trailing closures）

    
    UIView.animateWithDuration(10.0) { 
        button.alpha = 0
    }

Swift 的这个特点可以省去很多无用代码。我们再看上面的代码，仔细的同学已经发现在相同的 API 我们上面的写法节省了很多代码。

因为在 `animateWithDuration` 方法中最后一个参数是闭包，顾名思义，称之为*尾部闭包*。尾部闭包允许我们省略参数名，并且能放置在参数表括号以外，进一步简洁代码。以下两个代码实现功能相同，但是后者使用了尾部闭包：

    
    func say(message: String, completion: () -> Void) {
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

## 类型别名(Type Alias)

    
    typealias

当我们大量的使用某一种类型来定义时，类型别名是一种方便的手段。比如说我们有一个函数，它的参数是闭包：

    
    func dance(do: (Int, String, Double) -> (Int, String, Double)) { }

这看上去并不复杂，但是如果我们想在多个函数间相互传递这个闭包呢？我们不得不记住他的参数名，以确保它在函数中可传递。如果参数名不相同，就无法编译成功，错误日志会提示在这个传递过程中保证参数名相同。

    
    func dance(do: (Int, String, Double) -> (Int, String, Double)) { }
    func sing(do: (Int, String, Double) -> (Int, String, Double)) { }
    func act(do: (Int, String, Double) -> (Int, String, Double)) { }

倘若我们交换参数顺序、改变返回值类型，同样的会出现上述问题。所以，一旦我们更改需求，我们需要更新所有出现这个闭包的地方，这种问题的处理方法将会十分繁琐。所以，我们引入*类型别名*来解决这个问题。

    
    typealias TripleThreat = (Int, String, Double) -> (Int, String, Double)
    ...
    func dance(dance: TripleThreat) { }
    func act(act: TripleThreat) { }
    func sing(sing: TripleThreat) { }

现在我们重写之前的所有方法。如果再想更改参数闭包的话，我们所要做的仅仅是修改 `typealias` 即可。

### 类型别名代表性的用法（Famous Type Aliases）

    
    typealias Void = ()
    typealias NSTimeInterval = Double

## 参数名缩写（Shorthand argument names）

    
    $0, $1, $2...

如果一个闭包中有一个或多个参数，Swift 允许我们通过参数名来访问参数：

     
    func say(message: String, completion: (goodbye: String) -> Void) {
        print(message)
        completion(goodbye: "Goodbye")
    }
    ...
    say("Hi") { (goodbye: String) -> Void in
        print(goodbye)
    }
    // prints: "Hi"
    // prints: "Goodbye"

这个例子中，我们的尾部闭包中有一个名为 `goodbye` 的 `String` 型参数，Xcode 会将这个参数放到一个元祖中，然后紧跟着一个类型代表返回值，最后再加上 `in` 关键字来代表参数的结束。下一行则是我们闭包的具体实现。当我们的闭包短小，具有高可读性时，我们可以追求更加简洁的写法。我们现在开始减少代码，以达到极小：

    
    (goodbye: String) -> Void in

很多代码都不是必要的，因为我们可以使用**参数名缩写**。

    
    say("Hi") { print($0) }
    // prints: "Hi"
    // prints: "Goodbye"


正如所见，可以省略 `goodbye` 的参数名，以及 `Void` 返回值。并且 `in` 关键字也可省略，因为我们没有使用到参数名称。由于简单，每个参数都会依照在闭包中的声明的顺序。甚至，我们可以将闭包做缩行处理。


如果闭包中有多个参数，参数名缩写将会依照顺序排列，例如：

    
    (goodbye: String, name: String, age: Int) -> Void in
    // $0: goodbye
    // $1: name
    // $2: age

### Return Self

    
    -> Self

Swift 2.0 发布的时候，带来了一系列的新特性例如 `map`、`flatMap` 等等。更有趣的是，在这些方法中，我们同样的可以使用 *$* 符号来通过序号对其操作：

    
    [1, 2, 3, nil, 5]
        .flatMap { $0 }     // remove nils
        .filter { $0 < 3 }  // filter numbers that are greater than 2
        .map { $0 * 100 }   // multiply each value by 100
    // [100, 200]

很酷吧？这种写法比较优雅、可读，易于理解。我们应该在更多的地方使用它。

另外，我们可以通过闭包创建一个 `String` 的扩展，我们对 String 上执行一堆操作，并返回自己而不是使函数返回无效：

    
    // extension UIView
    func withBackgroundColor(color: UIColor) -> Self {
        backgroundColor = color
        return self
    }
    func withCornerRadius(radius: CGFloat) -> Self {
        layer.cornerRadius = 3
        return self
    }
    ...
    let view = UIView(frame: CGRect(x: 0, y: 0, width: 10, height: 10))
              .withBackgroundColor(.blackColor())
              .withCornerRadius(3)

### 总结

无论你是在写新的功能还是在读旧的代码，你会发现这种精炼代码的方式在任何地方都适用，并且你已经掌握了精炼方法。由于 Xcode 的自动补全现在还不完善，所以你应该不断地去质疑自己的代码，不要过度的依赖自动补全，而是自主完成代码。

--- 

另外，我在[github][1]上提供了一个playground文件以方便你来测试以上内容。

> 译者注：译者自己整理了原作者的示例代码，并加上中文注释，详见译者的[Github仓库][2]

如果你喜欢这篇文章，并且对你的Coding Style有所帮助，可以在[Twitter][3]联系并follow我。

我将会在九月与一群swift爱好者参与[*try! Swift NYC*][4]，到时候我们不见不散。

[1]:	https://github.com/andyyhope/Blog_SyntaxCheatCodes
[2]:	https://github.com/Desgard/SwiftGG-Translation-Demo/blob/master/Swift%20Syntax%20cheat%20codes/Blog_SyntaxCheatCodes.playground/Contents.swift
[3]:	https://twitter.com/AndyyHope
[4]:	http://www.tryswiftnyc.com/

[image-1]:	https://cdn-images-1.medium.com/max/2000/1*vjSHAgb-StGFzW3ryYFfvA.png
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。(+)添加一个子行。接着选中"Allows Arbitrary Loads"并将其设为`true`。都设好了之后我们就能用模拟器运行应用了。

### 添加按钮

在本例中你看到的实际上是一个被 Apple 称作`alertTemplate`的模板。你还能嵌入一些基本控件，比如在模板中添加文字和按钮。试着添加一些按钮吧：

    xml
    <document>
        <alertTemplate>
            <title>Hello tvOS!</title>
            <button>
                <text>A Button</text>
            </button>
            <button>
                <text>A Second Button</text>
            </button>
        </alertTemplate>
    </document>

这里我们只加了子按钮（child button）元素，每个子按钮都有它自己的子文本（child text）元素。这段代码在 tvOS 模拟器上全屏显示`alert`和两个按钮。如果你自学能力很强，[苹果的官方文档](https://developer.apple.com/library/prerelease/tvos/documentation/LanguagesUtilities/Conceptual/ATV_Template_Guide/TextboxTemplate.html#//apple_ref/doc/uid/TP40015064-CH2-SW8)中列出了你能使用的所有模板和控件。否则的话请跟紧我，订阅我的博客，之后我会教你开发一个完整的应用。

## 继续学习

学习本教程的[第二部分](http://jamesonquave.com/blog/developing-tvos-apps-for-apple-tv-part-2/)：为应用添加交互事件。

如果你想在新文章发布时收到通知，请[订阅我的 newsletter](http://eepurl.com/WKj4n)。

刚开始学习难免会遇到问题，如果你卡住了，别犹豫，在 twitter 上联系我[@jquave](http://twitter.com/jquave)。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。