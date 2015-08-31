RayWenderlich 官方 Swift 风格指南

https://github.com/raywenderlich/swift-style-guide
> 原文日期：2015/07/01

> 译者：[shanks](http://codebuild.me)
> 校对：[小锅](http://www.swiftyper.com)
> 定稿：[小锅](http://www.swiftyper.com)

这篇Swift风格指南与你看到的其他的指南有所不同，此篇指南主要焦点集中在打印和web展示的可读写上。我们创建此篇风格指南的目的，是为了让我们的图书，教程以及初学者套件中的代码保持优美和一致，即使我们有很多不同的作者共同编写这些图书。

我们的首要目标是一致性，可读性和简洁性。

还在使用Objective-C?也可以参考我们的[Objective-C风格指南](https://github.com/raywenderlich/objective-c-style-guide)。




## 命名(Naming)
使用驼峰式的描述性命名方式，为类，方法，变量等命名。类名的首字母应该大写，而方法和变量的首字母使用小写字符。

推荐做法：

```swift
private let maximumWidgetCount = 100

class WidgetContainer {
  var widgetButton: UIButton
  let widgetHeightPercentage = 0.85
}
```

不推荐做法：

```swift
let MAX_WIDGET_COUNT = 100

class app_widgetContainer {
  var wBut: UIButton
  let wHeightPct = 0.85
}
```

对于函数和初始化方法，推荐对所有的参数进行有意义的命名，除非上下文已经非常清楚。如果外部参数命名可以使得函数调用更加可读，也应该把外部参数命名包含在内。

```swift
func dateFromString(dateString: String) -> NSDate
func convertPointAt(#column: Int, #row: Int) -> CGPoint
func timedAction(#delay: NSTimeInterval, perform action: SKAction) -> SKAction!

// 调用方式如下：
dateFromString("2014-03-14")
convertPointAt(column: 42, row: 13)
timedAction(delay: 1.0, perform: someOtherAction)
```

对于方法来说，参照标准的苹果惯例，方法命名含义要引用到第一个参数：

```swift
class Guideline {
  func combineWithString(incoming: String, options: Dictionary?) { ... }
  func upvoteBy(amount: Int) { ... }
}
```

### 枚举(Enumerations)
使用首字母大写的驼峰命名规则来命名枚举值：

```swift
enum Shape {
  case Rectangle
  case Square
  case Triangle
  case Circle
}
```

### 文章（Prose）

当我们在文章中（教程，图书，注释等）需要引用到函数时，需要从调用者的视角考虑，包含必要的参数命名，或者使用`_`表示不需要命名的参数。

>从你自身实现的`init`中调用`convertPointAt(column:row:) `。

>如果你调用`dateFromString(_:) `,需要保证你提供的输入字符串格式是"yyyy-MM-dd"。

>如果你需要在`viewDidLoad()`中调用`timedAction(delay:perform:)`，记得提供调整后的延迟值和需要处理的动作。

>你不能直接调用数据源方法`tableView(_:cellForRowAtIndexPath:)`

当你遇到疑问时，可以看看Xcode在`jump bar`中是如何列出方法名的 —— 我们的风格与此匹配。

![Methods in Xcode jump bar](http://swift.gg/img/articles/raywenderlich-swift-style-guide/xcode-jump-bar.png)

### 类的前缀(Class Prefixes)

Swift类型自动被模块名设置了名称空间，所以你不需要加一个类的前缀。如果两个来自不同模块的命名冲突了，你可以附加一个模块名到类型命名的前面来消除冲突。

```swift
import SomeModule

let myClass = MyModule.UsefulClass()
```

## 空格（Spacing）

* 使用2个空格的缩进比使用tabs更好，可以减少占用空间和帮助防止多次换行。确保在Xcode进行了下图的偏好设置：

![Xcode indent settings](http://swift.gg/img/articles/raywenderlich-swift-style-guide/indentation.png)

* 方法定义的大括号或者其他大括号（if/else/switch/while等）—— 般都放在定义名称的同一行，并且使用一个新的行来结束。

* 提示：你可以通过以下方法重新进行缩进：选择一些代码（或者使用⌘A选择所有），然后按Control-I(或者点击菜单栏 Editor\Structure\Re-Indent）。一些Xcode模板代码使用的缩进是4个空格，所以这种方法可以很好的修复缩进。

推荐做法：

```swift
if user.isHappy {
  // Do something
} else {
  // Do something else
}
```

不推荐做法：

```swift
if user.isHappy
{
    // Do something
}
else {
    // Do something else
}
```

* 应该在方法之间空出一行，从视觉上有更好的区分和组织。方法内的空白行隔开不同的功能，但是当一个方法中有很多段落时，也意味着你应该将该方法重构成几个方法。

## 注释（Comments）

当你需要时，使用注释来解释一段特定的代码段的作用。注释必须保证更新或者及时删除。

避免在代码中使用块注释，代码尽可能自己能表达含义。以下情况除外：当使用注释来生成文档时。

## 类和结构体（Classes and Structures）

### 选择使用谁？（Which one to use?）

请记住，结构体是[值类型](https://developer.apple.com/library/mac/documentation/Swift/Conceptual/Swift_Programming_Language/ClassesAndStructures.html#//apple_ref/doc/uid/TP40014097-CH13-XID_144)。使用结构体并没有一个标识。一个数组包含`[a, b, c]`和另外一个数组同样包含`[a, b, c]`是完全一样的，它们完全可以交换使用。使用第一个还是使用第二个无关紧要，因为它们代表的是同一个东西。这就是为什么数组是结构体。

类是[引用类型](https://developer.apple.com/library/mac/documentation/Swift/Conceptual/Swift_Programming_Language/ClassesAndStructures.html#//apple_ref/doc/uid/TP40014097-CH13-XID_145)。使用类是有一个标识或者有一个特定的生命周期。你需要对一个人类建模为一个类，因为两个不同的人的实例，是两个不同的东西。只是因为两个人有同样的名字和生日，也不能断定这两个人是一样的。但是人的生日是一个结构体，因为日期1950-3-3和另外一个日期1950-3-3是相同的。日期不需要一个标识。

有时，一些事物应该定义为结构体，但是需要兼容AnyObject或者已经在以前的历史版本中定义为类（`NSDate`，`NSSet`）。尽可能的尝试遵守这些规则。

### 定义的案例（Example definition）

以下是一个风格很好的类定义:

```swift
class Circle: Shape {
  var x: Int, y: Int
  var radius: Double
  var diameter: Double {
    get {
      return radius * 2
    }
    set {
      radius = newValue / 2
    }
  }

  init(x: Int, y: Int, radius: Double) {
    self.x = x
    self.y = y
    self.radius = radius
  }

  convenience init(x: Int, y: Int, diameter: Double) {
    self.init(x: x, y: y, radius: diameter / 2)
  }

  func describe() -> String {
    return "I am a circle at \(centerString()) with an area of \(computeArea())"
  }

  override func computeArea() -> Double {
    return M_PI * radius * radius
  }

  private func centerString() -> String {
    return "(\(x),\(y))"
  }
}
```

以上例子遵循了以下风格规范：

* 指定属性，变量，常量，参数定义或者其他定义的类型，在冒号后面，紧跟着一个空格，而不是把空格放在冒号前面。比如：`x: Int`和`Circle: Shape`。
* 如果能表示相同的目的和上下文，可以在同一行定义多个变量和结构体。
* 缩进getter，setter的定义和属性观察器的定义。
* 不需要添加`internal`这样的默认的修饰符。同样的，不需要在重写一个方法时添加访问修饰符。

### Self的使用（Use of Self）

为了保持简洁，避免使用 self 关键词，Swift  不需要使用 `self` 来访问对象属性和调用对象方法。

必须使用 `self` 来区分构造器中属性命名和参数命名，还有在闭包表达式中引用属性值(编译器需要区分):

```swift
class BoardLocation {
  let row: Int, column: Int

  init(row: Int, column: Int) {
    self.row = row
    self.column = column

    let closure = {
      println(self.row)
    }
  }
}
```

### 协议遵守（Protocol Conformance）

当我们对一个类添加协议时，推荐使用一个单独的类扩展来实现协议的方法。这可以保持协议相关的方法聚合在一起，同时也可以简单的标识出一个协议对应类中需要实现哪些对应的方法。

同时，别忘了添加// MARK:，注释可以使得代码组织的更好！

推荐做法：

```swift
class MyViewcontroller: UIViewController {
  // class stuff here
}

// MARK: - UITableViewDataSource
extension MyViewcontroller: UITableViewDataSource {
  // table view data source methods
}

// MARK: - UIScrollViewDelegate
extension MyViewcontroller: UIScrollViewDelegate {
  // scroll view delegate methods
}
```

不推荐做法：

```swift
class MyViewcontroller: UIViewController, UITableViewDataSource, UIScrollViewDelegate {
  // all methods
}
```

### 计算属性（Computed Properties）

为了保持简洁，如果一个计算属性是只读的，请忽略掉get语句。只有在需要定义set语句的时候，才提供get语句。

推荐做法：

```swift
var diameter: Double {
  return radius * 2
}
```

不推荐做法：

```swift
var diameter: Double {
  get {
    return radius * 2
  }
}
```

## 函数声明（Function Declarations）

保证短的函数定义在同一行中，并且包含左大括号：

```swift
func reticulateSplines(spline: [Double]) -> Bool {
  // reticulate code goes here
}
```

在一个长的函数定义时，在适当的地方进行换行，同时在下一行中添加一个额外的缩进：

```swift
func reticulateSplines(spline: [Double], adjustmentFactor: Double,
    translateConstant: Int, comment: String) -> Bool {
  // reticulate code goes here
}
```

## 闭包表达式（Closure Expressions）

如果闭包表达式参数在参数列表中的最后一个时，使用尾部闭包表达式。给定闭包参数一个描述性的命名。

推荐做法：

```swift
UIView.animateWithDuration(1.0) {
  self.myView.alpha = 0
}

UIView.animateWithDuration(1.0,
  animations: {
    self.myView.alpha = 0
  },
  completion: { finished in
    self.myView.removeFromSuperview()
  }
)
```

不推荐做法：

```swift
UIView.animateWithDuration(1.0, animations: {
  self.myView.alpha = 0
})

UIView.animateWithDuration(1.0,
  animations: {
    self.myView.alpha = 0
  }) { f in
    self.myView.removeFromSuperview()
}
```

当单个闭包表达式上下文清晰时，使用隐式的返回值：

```swift
attendeeList.sort { a, b in
  a > b
}
```

## 类型（Types）

尽可能使用 Swift 原生类型。Swift 提供到 Objective-C 类型的桥接，所以你仍然可以使用许多需要的方法。

推荐做法：

```swift
let width = 120.0                                    // Double
let widthString = (width as NSNumber).stringValue    // String
```
不推荐做法：

```swift
let width: NSNumber = 120.0                          // NSNumber
let widthString: NSString = width.stringValue        // NSString
```

在 Sprite Kit 代码中，使用 CGFloat 可以使得代码更加简明，避免很多转换。

### 常量（Constants）

常量定义使用 `let` 关键字，变量定义使用 `var` 关键字，如果变量的值不需要改变，请尽量使用 `let` 关键字。

提示：一个好的技巧是，使用 `let` 定义任何东西，只有在编译器告诉我们值需要改变的时候才改成 `var` 定义。

### 可选类型（Optionals）

当nil值是可以接受的时候时，定义变量和函数返回值为可选类型(?)。

当你确认变量在使用前已经被初始化时，使用!来显式的拆包类型，比如在`viewDidLoad`中会初始化`subviews`。

当你访问一个可选值时，如果只需要访问一次或者在可选值链中有多个可选值时，请使用可选值链：

```swift
self.textContainer?.textLabel?.setNeedsDisplay()
```

当需要很方便的一次性拆包或者添加附加的操作时，请使用可选值绑定：

```swift
if let textContainer = self.textContainer {
  // do many things with textContainer
}
```

当我们命名一个可选变量和属性时，避免使用诸如`optionalString `和`maybeView`这样的命名，因为可选值的表达已经在类型定义中了。

在可选值绑定中，直接映射原始的命名比使用诸如`unwrappedView `和`actualLabel `要好。

推荐做法：

```swift
var subview: UIView?
var volume: Double?

// later on...
if let subview = subview, volume = volume {
  // do something with unwrapped subview and volume
}
```

不推荐做法：

```swift
var optionalSubview: UIView?
var volume: Double?

if let unwrappedSubview = optionalSubview {
  if let realVolume = volume {
    // do something with unwrappedSubview and realVolume
  }
}
```

### 结构体构造器（Struct Initializers）

使用原生的 Swift 结构体构造器，比老式的几何类（CGGeometry）的构造器要好。

推荐做法：

```swift
let bounds = CGRect(x: 40, y: 20, width: 120, height: 80)
let centerPoint = CGPoint(x: 96, y: 42)

```
不推荐做法：

```swift
let bounds = CGRectMake(40, 20, 120, 80)
let centerPoint = CGPointMake(96, 42)
```
推荐使用结构体限定的常量`CGRect.infiniteRect`,`CGRect.nullRect`等，来替代全局常量`CGRectInfinite`,`CGRectNull `等。对于已经存在的变量，可以直接简写成 `.zeroRect`。

### 类型推断（Type Inference）

推荐使用更加紧凑的代码，让编译器能够推断出常量和变量的类型。除非你需要定义一个特定的类型(比如`CGFloat`和`Int16`)，而不是默认的类型。

推荐做法：

```swift
let message = "Click the button"
let currentBounds = computeViewBounds()
var names = [String]()
let maximumWidth: CGFloat = 106.5
```

不推荐做法：

```swift
let message: String = "Click the button"
let currentBounds: CGRect = computeViewBounds()
var names: [String] = []
```

注意：遵守这条规则意味选择描述性命名比之前变得更加重要。


### 语法糖（Syntactic Sugar）

推荐使用类型定义简洁的版本，而不是全称通用语法。

推荐做法：

```swift
var deviceModels: [String]
var employees: [Int: String]
var faxNumber: Int?
```

不推荐做法：

```swift
var deviceModels: Array<String>
var employees: Dictionary<Int, String>
var faxNumber: Optional<Int>
```

## 控制流（Control Flow）

推荐循环使用`for-in`表达式，而不使用`for-condition-increment`表达式。

推荐做法：

```swift
for _ in 0..<3 {
  println("Hello three times")
}

for (index, person) in enumerate(attendeeList) {
  println("\(person) is at position #\(index)")
}
```

不推荐做法：

```swift
for var i = 0; i < 3; i++ {
  println("Hello three times")
}

for var i = 0; i < attendeeList.count; i++ {
  let person = attendeeList[i]
  println("\(person) is at position #\(i)")
}
```

## 分号（Semicolons）

Swift 不需要在你代码中的每一句表达式之后添加分号。只有在你需要在一行中连接多个表达式中，使用分号来区隔。

不要在同一行编写多个使用分号区隔的表达式。

唯一的例外是在使用 `for-conditional-increment` 架构。然而，尽可能使用 `for-in` 架构来替代它。

推荐做法：

```swift
let swift = "not a scripting language"
```
不推荐做法：

```swift
let swift = "not a scripting language";
```

注意：Swift与JavaScript有很大的不同，JavaScript认为忽略分号通常认为是[不安全](http://stackoverflow.com/questions/444080/do-you-recommend-using-semicolons-after-every-statement-in-javascript)的。

## 语言（Language）

使用美式英语拼音符合Apple API的标准。

推荐做法：

```swift
let color = "red"
```
不推荐做法：

```swift
let colour = "red"
```

## 版权声明（Copyright Statement）

以下的版权声明应该被包含在所有源文件的顶部：

/*
 * Copyright (c) 2015 Razeware LLC
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

## 笑脸（Smiley Face）

笑脸是raywenderlich.com网站非常重要的风格特性!拥有一个正确的笑脸，表达代码文章中开心和激动，是非常重要的。使用`]`来代表笑脸，因为这代表ASCII中最大的笑脸。`)`只能创建半个心型笑脸，所以不推荐使用。


推荐做法：

```swift
:]
```
不推荐做法：

```swift
:)
```

## 作者（Credits）

这篇风格指南是所有raywenderlich.com团队成员共同的努力：


* [Jawwad Ahmad](https://github.com/jawwad)
* [Soheil Moayedi Azarpour](https://github.com/moayes)
* [Scott Berrevoets](https://github.com/Scott90)
* [Eric Cerney](https://github.com/ecerney)
* [Sam Davies](https://github.com/sammyd)
* [Evan Dekhayser](https://github.com/edekhayser)
* [Jean-Pierre Distler](https://github.com/pdistler)
* [Colin Eberhardt](https://github.com/ColinEberhardt)
* [Greg Heo](https://github.com/gregheo)
* [Matthijs Hollemans](https://github.com/hollance)
* [Erik Kerber](https://github.com/eskerber)
* [Christopher LaPollo](https://github.com/elephantronic)
* [Ben Morrow](https://github.com/benmorrow)
* [Andy Pereira](https://github.com/macandyp)
* [Ryan Nystrom](https://github.com/rnystrom)
* [Cesare Rocchi](https://github.com/funkyboy)
* [Ellen Shapiro](https://github.com/designatednerd)
* [Marin Todorov](https://github.com/icanzilb)
* [Chris Wagner](https://github.com/cwagdev)
* [Ray Wenderlich](https://github.com/rwenderlich)
* [Jack Wu](https://github.com/jackwu95)

向[Nicholas Waynik](https://github.com/ndubbs)和[Objective-C Style Guide](https://github.com/raywenderlich/objective-c-style-guide)团队脱帽致敬。

我们同时也从苹果的官方Swift资料中寻找灵感：

* [The Swift Programming Language](https://developer.apple.com/library/prerelease/ios/documentation/swift/conceptual/swift_programming_language/index.html)
* [Using Swift with Cocoa and Objective-C](https://developer.apple.com/library/prerelease/ios/documentation/Swift/Conceptual/BuildingCocoaApps/index.html)
* [Swift Standard Library Reference](https://developer.apple.com/library/prerelease/ios/documentation/General/Reference/SwiftStandardLibraryReference/index.html)



