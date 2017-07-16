title: "Swift 3 新变化"
date: 2016-07-27
tags: [Swift 3]
categories: [AppCoda]
permalink: swift3-changes
keywords: swift3.0新变化,swift3.0变化
custom_title: swift 3.0 新变化
description: 在 Swift 3 中带来了很多的新变化，那么到底 Swift 3 有哪些不一样的改动呢，本文就详细介绍了 Swift 3 的那些新特性。

---
原文链接=http://www.appcoda.com/swift3-changes/
作者=COSMIN PUPĂZĂ
原文日期=2016/06/29
译者=saitjr
校对=Cee
定稿=CMB

<!--此处开始正文-->

Apple 在 WWDC 上已将 Swift 3 整合进了 Xcode 8 beta 中，并会在今年晚些时候发布 Swift 3 的正式版。这是 Swift 在开源和支持 Mac OS X 与 Linux 之后的首个版本。如果你在去年 11 月关注了 [Swift 进化史](https://github.com/apple/swift-evolution) 和已经启动的 [IBM 沙盒](https://swiftlang.ng.bluemix.net/#/repl) 项目，那你应该知道 Swift 确实改动很多。甚至可以确定你在 Xcode 8 上根本无法编译既有项目。

<!--more-->

Swift 3 的改动归结下来主要有两点：

- 移除了在 Swift 2.2 就已经弃用的特性
- 语言现代化问题

让我们从移除特性讲起，毕竟这点能容易理解，而且在 Xcode 7.3 的时候我们遇到了相关警告。

### `++` 与 `--` 操作符

自增自减是来源于 C 的操作符，作用是对变量直接进行 `+1` 或 `-1` 的操作：

```swift
var i = 0
i++
++i
i--
--i
```

然而，在我们要选择使用哪一种操作符进行运算的时候，事情就变得复杂起来。无论是自增还是自减，都对应着两种写法：写在在变量之前，还是在变量之后。它们的底层实现其实都是有返回值的函数，是否使用返回值取决于对运算符的重载。

这可能会吓跑初学者，所以苹果移除了该特性——取而代之的是复合加法运算（`+=`）与减法运算（`-=`）：

```swift
var i = 0
i += 1
i -= 1
```

当然，你也可以使用普通的加法运算（`+`）与减法运算（`-`），虽然复合式运算符写起来要短一点：

```swift
i = i + 1
i = i - 1
```

> 延伸阅读：如果你想要了解更多该变更背后的故事，请阅读 [Chris Lattner 对移除 `++` 与 `--` 的看法](https://github.com/apple/swift-evolution/blob/master/proposals/0004-remove-pre-post-inc-decrement.md)。

### C 风格的 for 循环已成历史

其实自增自减运算符用得最多的地方，还是在 for 循环部分。移除该运算符意味着 for 循环的特性也随之远去了，因为在 for-in 的世界中，循环控制语句与范围限制用不上该操作符。

如果你有一定编程背景，那么输出 1 到 100 的数，你可能会这样写：

```swift
for (i = 1; i <= 10; i++) {
  print(i)
}
```

在 Swift 3 中，已经不允许这种写法了，而应该写为（注意闭区间范围的写法）：

```swift
for i in 1...10 {
  print(i)
}
```

或者，你也可以使用 for-each 加闭包的写法（更多循环相关信息请看[这](https://cosminpupaza.wordpress.com/2015/12/04/for-vs-while-a-beginners-approach/)）:

```swift
(1...10).forEach {
  print($0)
}
```

>  延伸阅读：如果你想要了解更多该变更背后的故事，请阅读 [Erica Sadun 对移除 C 风格循环的看法](https://github.com/apple/swift-evolution/blob/master/proposals/0007-remove-c-style-for-loops.md)。

### 移除函数参数的 `var` 标记

如果不需要在函数内部对参数进行修改的话，函数参数通常都定义为常量。然而，在某些情况下，定义成变量会更加合适。在 Swift 2 中，你可以用 `var` 关键字来将函数参数标记为变量。一旦参数用 `var` 来标记，就会生成一份变量的拷贝，如此便能在方法内部对变量进行修改了。

下面是一个求两个数的最大公约数的例子（如果想到回到高中数学课堂再学习一遍，[请移步](https://en.wikipedia.org/wiki/Greatest_common_divisor)）：

```swift
func gcd(var a: Int, var b: Int) -> Int {
 
  if (a == b) {
    return a
  }
 
  repeat {
    if (a > b) {
      a = a - b
    } else {
      b = b - a
    }
  } while (a != b)
 
  return a
}
```

这个算法的逻辑很简单：如果两个数相等，则返回其中一个的值。否则，做大小比较，大的数减去小的数之后，将差值赋值给大的数，然后再将两个数作比较，为止它们相等为止，最终返回其中一个的值。正如你所看到的，通过将 `a` 和 `b` 标记为变量，才能在函数体里对两个数进行修改。

Swift 3 不在允许开发者这样来将参数标记为变量了，因为开发者可能会在 `var` 和 `inout` 纠结不已。所以最新的 Swift 版本中，就干脆移除了函数参数标记 `var` 的特性。

如此，想要用 Swift 3 来写上面的 `gcd` 函数，就要另辟蹊径了。你需要在函数内部创建临时变量来存储参数：

```swift
func gcd(a: Int, b: Int) -> Int {
 
  if (a == b) {
    return a
  }
 
  var c = a
  var d = b
 
  repeat {
    if (c > d) {
      c = c - d
    } else {
      d = d - c
    }
  } while (c != d)
 
  return c
}
```

> 延伸阅读：如果你想要了解更多该变更背后的故事，请阅读[决定移除 `var` 的想法](https://github.com/apple/swift-evolution/blob/master/proposals/0003-remove-var-parameters.md)。

### 函数参数标签的一致性

函数的参数列表底层实现其实是元组，所以只要元组结构和函数参数列表相同，你可以直接用元组来代替参数列表。就拿刚才的 `gcd()` 函数来说，你可以这样调用：

```swift
gcd(8, b: 12)
```

你也可以这样调用：

```swift
let number = (8, b: 12)
gcd(number)
```

正如你所看到的，在 Swift 2 中，第一个参数无需带标签，而从第二个参数开始，就必须要带标签了。

这个语法对初学者来说可能会造成困惑，所以，要进行统一标签设计。在 Swift 3 中，函数的调用要像下面这样：

```swift
gcd(a: 8, b: 12)
```

即使是第一个参数，也必须带上标签。如果不带，Xcode 8 会直接报错。

你对这修改的第一个反应可能是：「我哔！那我代码改动得多大啊！」是的，这简直是成吨的伤害。所以苹果又给出了一种不用给第一个参数带标签的解决方案。在第一个参数前面加上一个下划线：

```swift
func gcd(_ a: Int, b: Int) -> Int {
 
...
 
}
```

但是这样做，事情又仿佛回到了原点——第一个参数不用带标签了。使用这种方式，应该能一定程度上降低 Swift 2 迁移到 Swift 3 上的痛苦。

> 延伸阅读：如果你想要了解更多该变更背后的故事，请阅读[函数标签一致性的一些想法](https://github.com/apple/swift-evolution/blob/master/proposals/0046-first-label.md)。

### Selector 不再允许使用 String

让我们来创建一个按钮，并给它添加一个点击事件（不需要界面支持，直接使用 playground 就行）：

```swift
// 1
import UIKit
import XCPlayground
 
// 2
class Responder: NSObject {
 
  func tap() {
    print("Button pressed")
  }
}

let responder = Responder()
 
// 3
let button = UIButton(type: .System)
button.setTitle("Button", forState: .Normal)
button.addTarget(responder, action: "tap", forControlEvents: .TouchUpInside)
button.sizeToFit()
button.center = CGPoint(x: 50, y: 25)
 
// 4
let frame = CGRect(x: 0, y: 0, width: 100, height: 50)
let view = UIView(frame: frame)
view.addSubview(button)
XCPlaygroundPage.currentPage.liveView = view
```

让我们一步一步分析下上面的代码：

1.  导入 `UIKit` 与 `XCPlayground` 框架——需要创建一个按钮，并在 playground 的 assistant editor 中进行显示。

    **注意**：你需要在 Xcode 菜单栏上的 View -> Assistant Editor -> Show Assistant Editor 来开启 assistant editor。

2.  创建点击的触发事件，能在用户点击按钮时，触发绑定的事件——这需要基类为 `NSObject`，因为 selector 仅对 Objective-C 的方法有效。

3.  声明按钮，并配置相关属性。

4.  声明视图，给定合适的大小，将按钮添加到视图上，最后显示在 playground 的 assistant editor 中。

让我们来看下给按钮添加事件的代码：

```swift
button.addTarget(responder, action: "tap", forControlEvents: .TouchUpInside)
```

这里按钮的 selector 还是写的字符串。如果字符串拼写错了，那程序会在运行时因找不到相关方法而崩溃。

为了解决编译期间的潜在问题，Swift 3 将字符串 selector 的写法改为了 `#selecor()`。这将允许编译器提前检查方法名的拼写问题，而不用等到运行时。

```swift
button.addTarget(responder, action: #selector(Responder.tap), for: .touchUpInside)
```

> 延伸阅读：如果你想要了解更多该变更背后的故事，请阅读 [Doug Gregor 的观点](https://github.com/apple/swift-evolution/blob/master/proposals/0022-objc-selectors.md)。

以上就是关于移除特性的全部内容。接下来，让我们来看看语言现代化的一些亮点。

### 不再是 String 的 key-path 写法

这个特性和上一个很相似，但是这是用在键值编码（KVC）与键值观察（KVO）上的：

```swift
class Person: NSObject {
  var name: String = ""
 
  init(name: String) {
    self.name = name
  }
}
let me = Person(name: "Cosmin")
me.valueForKeyPath("name")
```

首先创建了 `Person` 类，这是 KVC 的首要条件。然后用指定的构造器初始化一个 `me`，最后通过 KVC 来修改 `name`。同样，如果 KVC 中的键拼写错误，这一切就白瞎了 🙁。

幸运的是，Swift 3 中就不会再出现这个情况了。字符串的 key-path 写法被替换为了 `#keyPath()`：

```swift
class Person: NSObject {
  var name: String = ""
 
  init(name: String) {
    self.name = name
  }
}
let me = Person(name: "Cosmin")
me.value(forKeyPath: #keyPath(Person.name))
```

> 延伸阅读：如果你想要了解更多该变更背后的故事，请阅读 [David Hart 的观点](https://github.com/apple/swift-evolution/blob/master/proposals/0062-objc-keypaths.md)。

### Foundation 去掉 `NS` 前缀

我们先来看看有 `NS` 前缀时的写法，下面是一个典型的 JSON 解析例子（如果对 `NS` 前缀的前世今生感兴趣，[请移步](http://stackoverflow.com/questions/473758/what-does-the-ns-prefix-mean)）：

```swift
let file = NSBundle.mainBundle().pathForResource("tutorials", ofType: "json")
let url = NSURL(fileURLWithPath: file!)
let data = NSData(contentsOfURL: url)
let json = try! NSJSONSerialization.JSONObjectWithData(data!, options: [])
print(json)
```

以上代码使用了 Foundation 相关类来对文件中的 JSON 数据进行解析：NSBundle -> NSURL -> NSData -> NSJSONSerialization。

在 Swift 3 中，将移除 `NS` 前缀，所以，解析流程变成了：Bundle -> URL -> Data -> JSONSerialization。

```swift
let file = Bundle.main().pathForResource("tutorials", ofType: "json")
let url = URL(fileURLWithPath: file!)
let data = try! Data(contentsOf: url)
let json = try! JSONSerialization.jsonObject(with: data)
print(json)
```

> 延伸阅读：关于命名约定的变化，你可以查看 [Tony Parker 与 Philippe Hausler 的观点](https://github.com/apple/swift-evolution/blob/master/proposals/0086-drop-foundation-ns.md)。

### `M_PI` 还是 `.pi`

下面是一个已知半径求圆周长的例子：

```swift
let r =  3.0
let circumference = 2 * M_PI * r
let area = M_PI * r * r
```

在旧版本的 Swift 中，我们使用 `M_PI` 常量来表示 π。而在 Swift 3 中，π 整合为了 Float，Double 与 CGFloat 三种形式：

```swift
Float.pi
Double.pi
CGFloat.pi
```

所以上面求圆周长的例子，在 Swift 3 中应该写为：

```swift
let r = 3.0
let circumference = 2 * Double.pi * r
let area = Double.pi * r * r
```

根据类型推断，我们可以将类型前缀移除。更为精简的版本如下：

```swift
let r = 3.0
let circumference = 2 * .pi * r
let area = .pi * r * r
```

### GCD

Grand Central Dispatch（GCD）多用于解决网络请求时，阻塞主线程的 UI 刷新问题。这是用 C 写的，并且 API 对初学者也并不友好，甚至想要创建个基本的异步线程也不得不这样写：

```swift
let queue = dispatch_queue_create("Swift 2.2", nil)
dispatch_async(queue) {
  print("Swift 2.2 queue")
}
```

Swift 3 取消了这种冗余的写法，而采用了更为面向对象的方式：

```swift
let queue = DispatchQueue(label: "Swift 3")
queue.async {
  print("Swift 3 queue")
}
```

> 延伸阅读：更多相关信息，请查看 [Matt Wright 的观点](https://github.com/apple/swift-evolution/blob/master/proposals/0088-libdispatch-for-swift3.md)。

### 更 Swift 范的 Core Graphics

Core Graphics 是一个相当强大的绘图框架，但是和 GCD 一样，它依然是 C 风格的 API：

```swift
let frame = CGRect(x: 0, y: 0, width: 100, height: 50)
 
class View: UIView {
 
  override func drawRect(rect: CGRect) {
    let context = UIGraphicsGetCurrentContext()
    let blue = UIColor.blueColor().CGColor
    CGContextSetFillColorWithColor(context, blue)
    let red = UIColor.redColor().CGColor
    CGContextSetStrokeColorWithColor(context, red)
    CGContextSetLineWidth(context, 10)
    CGContextAddRect(context, frame)
    CGContextDrawPath(context, .FillStroke)
  }
}
let aView = View(frame: frame)
```

上面代码，首先创建了 view 的 frame，然后创建一个继承自 `UIView` 的 `View` 类，重写 `drawRect()` 方法来重绘 view 的内容。

在 Swift 3 中，有不同的实现方式——对当前画布上下文解包，之后的所有绘制操作就都基于解包对象了：

```swift
let frame = CGRect(x: 0, y: 0, width: 100, height: 50)
 
class View: UIView {
 
  override func draw(_ rect: CGRect) {
    guard let context = UIGraphicsGetCurrentContext() else {
      return
    }
    
    let blue = UIColor.blue().cgColor
    context.setFillColor(blue)
    let red = UIColor.red().cgColor
    context.setStrokeColor(red)
    context.setLineWidth(10)
    context.addRect(frame)
    context.drawPath(using: .fillStroke)
  }
}
let aView = View(frame: frame)
```

**注意**：在 view 调 `drawRect()` 方法之前，上下文均为 `nil`，所以使用 `guard` 关键字来处理（更多关于上下文的介绍，[请移步](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIKitFunctionReference/index.html#//apple_ref/c/func/UIGraphicsGetCurrentContext)）。

### 动词与名词的命名约定

是时候介绍些英语语法相关的更改了🙂！Swift 3 将方法分为了两大类：一类是返回一个确切的值的方法，就像是名词；一类是处理一些事件的，就像是动词。

来看看这个输出 10 到 1 的例子：

```swift
for i in (1...10).reverse() {
  print(i)
}
```

我们使用了 `reverse()` 方法来反向数组。Swift 3 中，改为用名词来做方法名——为它加上了 `ed` 后缀：

```swift
for i in (1...10).reversed() {
  print(i)
}
```

在元组中，最常见的输出数组内容的方式是：

```swift
var array = [1, 5, 3, 2, 4]
for (index, value) in array.enumerate() {
  print("\(index + 1) \(value)")
}
```

Swift 3 中，同样对相关的 `enumerate()` 方法名做出了名词性的修改——同样加上了 `ed` 后缀：

```swift
var array = [1, 5, 3, 2, 4]
for (index, value) in array.enumerated() {
  print("\(index + 1) \(value)")
}
```

另外一个例子是数组排序。下面是将数组升序排列的例子：

```swift
var array = [1, 5, 3, 2, 4]
let sortedArray = array.sort()
print(sortedArray)
```

Swift 3 中将 `sort()` 方法修改为了 `sorted()`：

```swift
var array = [1, 5, 3, 2, 4]
let sortedArray = array.sorted()
print(sortedArray)
```

再让我们来看看直接对数组进行排序，而不是用中间量来接收是怎样的。在 Swift 2 中，你会像下面这样写：

```swift
var array = [1, 5, 3, 2, 4]
array.sortInPlace()
print(array)
```

我们使用了 `sortInPlace()` 方法来对可变数组进行排序。Swift 3 中，认为这种没有返回值，仅仅是处理排序的操作应该是动词行为。所以，应该使用了一个很基本的动词来描述这种操作——将 `sortInPlace()` 重命名为了 `sort()`：

```swift
var array = [1, 5, 3, 2, 4]
array.sort()
print(array)
```

> 延伸阅读：更多关于命名约定的信息，请查看 [API 设计手册](https://swift.org/documentation/api-design-guidelines/)。

### 更 Swift 范的 API

Swift 3 采用了更具有哲理性 API 设计方式——移除不必要的单词。所以，如果某些词是多余的，或者是能根据上下文推断出来的，那就直接移除：

- `XCPlaygroundPage.currentPage` 改为 `PlaygroundPage.current`
- `button.setTitle(forState)` 改为 `button.setTitle(for)`
- `button.addTarget(action, forControlEvents)` 改为 `button.addTarget(action, for)`
- `NSBundle.mainBundle()` 改为 `Bundle.main()`
- `NSData(contentsOfURL)` 改为 `URL(contentsOf)`
- `NSJSONSerialization.JSONObjectWithData()` 改为 `JSONSerialization.jsonObject(with)`
- `UIColor.blueColor()` 改为 `UIColor.blue()`
- `UIColor.redColor()` 改为 `UIColor.red()`

### 枚举成员

Swift 3 将枚举成员当做属性来看，所以使用小写字母开头而不是以前的大写字母：

- `.System` 改为 `.system`
- `.TouchUpInside` 改为 `.touchUpInside`
- `.FillStroke` 改为 `.fillStroke`
- `.CGColor` 改为 `.cgColor`

### @discardableResult

在 Swift 3 中，如果没有接收某方法的返回值，Xcode 会报出警告。如下：

![](http://swiftgg-main.b0.upaiyun.com/img/swift3-changes-1.png)

在上面的代码中，`printMessage` 方法返回了一条信息给调用者。但是，这个返回值并没有被接收。这可能会存在潜在问题，所以编译器在 Swift 3 中会给你报警告。

这种情况下，并不一定要接收返回值来消除警告。还可以通过给方法声明 `@discardableResult` 来达到消除目的：

```swift
override func viewDidLoad() {
    super.viewDidLoad()
 
    printMessage(message: "Hello Swift 3!")
}
 
@discardableResult
func printMessage(message: String) -> String {
    let outputMessage = "Output : \(message)"
    print(outputMessage)
    
    return outputMessage
}
```

### 总结

以上便是 Swift 3 做出的所有更改。新版本另这门语言变得越来越优雅。当然同时也包含了很多会对你既有代码造成影响的修改。希望这篇文章能更好的帮助你理解这些变更，同时也希望能在 Swift 项目版本迁移方面能帮到你。

文章的所有代码我都放在了[这个 Playground](https://github.com/appcoda/Swift3Playgrounds/blob/master/Swift%203.playground.zip?raw=true) 中，我已经在 Xcode 8 beta 版本中进行了测试。所以，请确保使用 Xcode 8 来进行编译。

有任何问题，欢迎告知。Happy coding！🙂