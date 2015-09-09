Swift 2：面向协议编程

> 作者：Erik Kerber，[原文链接](http://www.raywenderlich.com/109156/introducing-protocol-oriented-programming-in-swift-2)，原文日期：2015/06/25
> 译者：[小锅](http://www.swiftyper.com/)；校对：[numbbbbb](https://github.com/numbbbbb)；定稿：[mmoaay](http://blog.csdn.net/mmoaay)
  







![swift-new.jpg][3]

> 说明：本教程使用了最新的 beta 版 Xcode 7 与 Swift 2.0，它们的正式版将会在今年的秋季发布。目前可以到[苹果的开发者官网](https://developer.apple.com/xcode/downloads/)下载最新的 beta 版 Xcode。
	
在 WWDC 2015上，苹果发布了 Swift 2.0 版本，这是自 Swift 发布以来进行的第二次重大改版，这次改版推出了[很多新特性](http://www.raywenderlich.com/108522/whats-new-in-swift-2)来帮助我等程序员写出更优雅的代码。



在这些新特性里面，最让人兴奋的莫过于 **协议扩展(protocol extensions)** 了。在第一版的 Swift 当中，我们可以使用扩展来为 **类(class)**、**结构体(struct)** 以及 **枚举(enum)** 增加新功能。在新版的 Swift 2.0 当中，我们也可以对 **协议(protocol)** 进行扩展了。

这乍看起来好像只是一个很小的改变，事实上，协议扩展的功能是相当强大的，它甚至能改变我们编写代码的方式。在本教程中，你不仅可以学习到创建和使用协议扩展的方法，还可以体会到这项新技术和面向协议编程范式给你带来的新视野。

同时你还能看到 Swift 开发小组是如何使用协议扩展来对 Swift 的标准库进行改进，以及它将会给你代码的编写带来怎样的影响。

## 从这里开始（Getting Started）

我们先从新建一个 `playground`开始。打开 Xcode 7 选择 **File\New\Playground...** 并命名为 **SwiftProtocols**。可以选择任意的平台，因为本教程中的代码是与平台无关的。选择保存的位置后点击 **Next**，最后点击 **Create**。

打开 `playground` 后，添加如下代码：

```swift
protocol Bird {
	var name: String { get }
	var canFly: Bool { get }
}

protocol Flyable {
	var airspeedVelocity: Double { get }
}
```

这里定义了一个简单的 `Bird` 协议，它拥有 `name` 和 `canFly` 两个属性，同时还定义了一个拥有 `airspeedVelocity` 属性的 `Flyable` 协议。

在没有协议的远古时期，我们可能会将 `Flyable` 定义为一个基类，然后使用继承的方式来定义 `Bird` 以及其它会飞的东西，比如飞机之类的。然而这里并不用这么做，*所有一切*都是从协议开始的。

当我们接下来开始定义具体类型的时候，你将会看到这种方法是如何使我们的整个系统更加灵活的。

## 定义遵守协议的类型

在代码区底部增加如下的 **结构体** 定义：

```
struct FlappyBird: Bird, Flyable {
  let name: String
  let flappyAmplitude: Double
  let flappyFrequency: Double
  let canFly = true
  var airspeedVelocity: Double {
    return 3 * flappyFrequency * flappyAmplitude
  } 
}
```

这里定义了一个新的结构体 `Flappybird`，这个结构体遵守了 `Bird` 和 `Flyable` 协议。它的 `airspeedVelocity` 属性的值是通过 `flappyFrequency` 和 `flappyAmplitue` 计算出来的。作为一只愤怒的小鸟，它的 `canFly` 当然是返回 `true`的 :]。

接着，再定义两个结构体：

```swift
struct Penguin: Bird {
	let name: String
	let canFly = false
}

struct SwiftBird: Bird, Flyable {
   var name: String { return "Swift \(version)" }
   let version: Double
   let canFly = true

   // Swift 速度超群!
   var airspeedVelocity: Double { return 2000.0 }
}
```

企鹅(`Penguin`)是一种鸟(`Bird`)，不过它是不能飞的。啊哈，应该庆幸我们没有采用继承的方法，使用继承会让所有的子类都拥有飞的能力。雨燕(`SwiftBird`)不仅能飞，它还拥有超快的速度！

我们可以发现，上面的代码里面有一些冗余。尽管我们已经有了 `Flyable` 的信息，但是我们还是得为每个 `Bird` 类型指定 `canFly` 属性来表明它是否可以飞行。

## 拥有默认实现的扩展协议

对于协议扩展，我们可以为它指定默认的实现。在定义 `Bird` 协议的下方增加如下代码：

```swift
extension Bird where Self: Flyable {
	// Flyable birds can fly!
	var canFly: Bool { return true }
}
```

这里通过对 `Bird` 协议进行扩展，为它增加了默认行为。当一个类同时遵守 `Bird` 和 `Flyable` 协议时，它的 `canFly` 属性就默认返回 `true`。即是说，所有遵守 `Flyable` 协议的鸟类都不必再显式指定它是否可以飞行了。

![protocols-extend-480x280.png][4]

Swift 1.2 将 `where` 判断语法增加到了 if-let 绑定中，而 Swift 2.0 更进一步地将这个语法带到了协议扩展中。

将 `FlappyBird` 和 `SwiftBird` 结构体定义中的 `let canFly = true` 语句删除。可以看到，`playground` 可以顺利通过编译，因为扩展协议的默认实现已经帮你处理了这些琐事。

## 为何不使用基类？

或许你会发现，使用协议扩展和它的默认实现与使用基类、甚至其它语言中的[抽象类](https://en.wikipedia.org/wiki/Abstract_type)很相似，但是 Swift 有它几个关键的优势：  

* 因为一个类型可以遵守多个协议，所以它可以从各个协议中接收到不同的默认实现。与其它语言中所支持的多重继承不同（吐槽：说的就是C++吧）（吐槽吐槽：噗，C++躺枪），协议扩展不会为遵守它的类型增加额外的状态。
* 所有的类、结构体和枚举都可以遵守协议，而基类只能被类所继承。

换句说就是，协议拥有为值类型(value types)增加默认实现的能力，而不仅仅是类。

我们已经体验过了结构体的实战，接下来在 `playground` 底部增加如下的枚举的定义：

```swift
enum UnladenSwallow: Bird, Flyable {
  case African
  case European
  case Unknown
  var name: String {
    switch self {
      case .African:
        return "African"
      case .European:
        return "European"
      case .Unknown:
        return "What do you mean? African or European?"
	}
  }
 
  var airspeedVelocity: Double {
    switch self {
      case .African:
        return 10.0
      case .European:
        return 9.9
      case .Unknown:
        fatalError("You are thrown from the bridge of death!")
    } 
  }
}
```

与其它值类型一样，你所需要做的就是定义一些属性，好让 `UnladenSwallow` 能够遵守这两个协议。因为这个枚举同时遵守了 `Bird` 和 `Flyable` 所以它也得到了 `canFly` 的默认实现。

你不会真的以为这篇教程只是为了演示一些小鸟的飞行把戏吧？
接下来，让我们看一些更有实战意义的代码。

## 扩展协议(Extending Protocols)

协议扩展最常用的估计就是扩展外部协议了，不管这些协议来自 Swift 标准库还是来自第三方框架。

在 `playground` 的底部再增加如下代码：

```swift
extension CollectionType {
   func skip(skip: Int) -> [Generator.Element] {
     guard skip != 0 else { return [] }
     
     var index = self.startIndex
     var result: [Generator.Element] = []
     var i = 0
     repeat {
       if i % skip == 0 {
         result.append(self[index])
       }
       index = index.successor()
       i++
     } while (index != self.endIndex)

     return result
   }
}
```

这里对标准库中的 `CollectionType` 进行了扩展，定义了一个新的 `skip(_:)` 方法。这个方法会对一个集合类型中的元素以 `skip` 步进行“跳跃”，然后返回集合中没有被跳过的元素。

在 Swift 中，`CollectionType` 协议被类似数组以及字典这样的集合类型所遵守。这意味着，现在你的整个 app 中，所有遵守 `CollectionType` 的类型都拥有这个方法了。接着在底部增加下面的代码：

```swift
let bunchaBirds: [Bird] =
  [UnladenSwallow.African,
   UnladenSwallow.European,
   UnladenSwallow.Unknown,
   Penguin(name: "King Penguin"),
   SwiftBird(version: 2.0),
   FlappyBird(name: "Felipe", flappyAmplitude: 3.0, flappyFrequency: 20.0)]

bunchaBirds.skip(3)
```

到这我们就定义了一个数组，这个数组包含了大部分之前定义过的鸟类。因为数组类型遵守了 `CollectionType` 协议，所以，我们可以直接对这个数组使用 `skip(_:)` 方法。

## 扩展自己的协议（Extending Your Own Protocols）

令人兴奋的是，与为标准库增加方法一样，我们也可以为它增加*默认*行为。

修改鸟类的协议，使其遵守 `BooleanType` 协议：

```swift
protocol Bird: BooleanType {
```

遵守 `BooleanType` 协议意味着所有 `Bird` 类型都要有一个 `boolValue` 属性，使得它能够像布尔值一样被使用。这是不是意味着我们得为所有已经定义的，还有将来要定义的 `Bird` 类型添加这个属性？

当然不是，协议扩展为我们提供了更简便的方法。在 `Bird` 的定义下面添加如下代码：

```swift
extension BooleanType where Self: Bird {
  var boolValue: Bool {
    return self.canFly
  }
}
```

这个扩展可以让 `canFly` 属性代表每个 `Bird` 类型的布尔值。

通过下面的代码来试验一下：

```swift
if UnladenSwallow.African {
  print("I can fly!")
} else {
  print("Guess I’ll just sit here :[")
}
```

可以看到控制台打印出了 **"I can fly!"**。然而更值得注意的是，我们这里直接把 `UnladenSwallow.African` 丢到了 if 判断里面！

## 对 Swift 标准库的影响

我们已经看到了，使用协议扩展极大地方便了我们对代码功能的定制和扩展。你可能不知道的是，Swift 开发小组甚至使用了协议扩展对 Swift 标准库的写法进行了改进。

Swift 通过在标准库中增加 `map`、`reduce` 和 `filter` 等方法，使它自身的函数式编程属性得到了大大的提升。

这些方法存在于不同的 `CollectionType` 成员中，比如 `Array`：

```swift
// Counts the number of characters in the array
["frog", "pants"].map { $0.length }.reduce(0) { $0 + $1 } // returns 9
```

对数组调用 `map` 方法返回了另一个数组，再对这个数组调用 `reduce` 方法，使其计算出整个数组中的字符数为 **9**。

在这里，`map` 和 `reduce` 是做为 Swift 标准库的一部分包含在 `Array` 当中的。如果我们按住 `command` 键点击 `map`，就可以看到它的定义。

在 Swift 1.2 里，我们可以看到类似下面的定义：

```swift
// Swift 1.2
extension Array : _ArrayType {
	/// Return an `Array` containing the results of calling 
	/// `transform(x)` on each element `x` of `self`
	func map<U>(transform: (T) -> U) -> [U]
}
```

在这里 `map` 函数是作为 `Array` 的扩展被定义的。但是 Swift 的函数式函数不止是对 `Array` ，而是对所有的 `CollectionType` 都起作用，那么 Swift 1.2 是如何处理的呢？

如果对一个 `Range` 类型调用 `map` 函数，并且从那里跳到它的实现，我们可以看到如下的定义：

```swift
// Swift 1.2
extension Range {
	/// Return an array containing the results of calling 
	/// `transform(x)` on each element `x` of `self`. 
	func map<U>(transform: (T) -> U) -> [U]
}
```

可以发现，对于 Swift 1.2 来说，标准库中不同的 `CollectionType` 都需要重新实现 `map` 函数。
这是因为虽然 `Array` 与 `Range` 都遵守了 `CollectionType` 协议，但是由于结构体不能被继承，因此也就无法定义通用的实现。

这不仅仅是标准库实现上的一点细微差别，这实际上限制对 Swift 类型的使用。

下面这个范型函数接受一个 `Flyable` 类型的 `CollectionType`，然后返回拥有最快速度(`airspeedVelocity`)的元素：

```swift
func topSpeed<T: CollectionType where T.GeneratorType: Flyable>(collection: T) -> Double {
  collection.map { $0.airspeedVelocity }.reduce { max($0, $1)}
}
```

在 Swift 1.2 当中没有协议扩展，因此这段代码会报错。`map` 和 `reduce` 函数只存在预定义的一些类型中，并不能对任意的 `CollectionType` 起作用。

然而在 Swift 2.0 中使用了协议扩展，对于 `Array` 和 `Range` 的 `map` 函数都是这样定义的：

```swift
// Swift 2.0
extension CollectionType {
  /// Return an `Array` containing the results of mapping `transform`
  /// over `self`.
  ///
  /// - Complexity: O(N).
  func map<T>(@noescape transform: (Self.Generator.Element) -> T) -> [T]
}
```

虽然无法看到 `map` 方法的实现 -- 至少在 Swift 2.0 开源之前，但是我们可以知道所有的 `CollectionType` 都有一个 `map` 方法的默认实现。即是说，所有遵守 `CollectionType` 的类型，都会附赠一个 `map` 方法。

在 `playground` 的最底部增加如下的泛型函数：

```swift
func topSpeed<T: CollectionType where T.Generator.Element == Flyable>(c: T) -> Double {
  return c.map { $0.airspeedVelocity }.reduce(0) { max($0, $1) }
}
```

可以对保存 `Flyable` 类型的集合调用 `map` 和 `reduce` 方法了。如果，你还对上面定义的鸟类中哪个速度最快持有疑惑的话，就可以使用这个函数来得到最终的答案了：

```swift
let flyingBirds: [Flyable] = 
  [UnladenSwallow.African,
  UnladenSwallow.European,
  SwiftBird(version: 2.0)]
 
topSpeed(flyingBirds) // 2000.0
```

## 接下来做什么（Where To Go From Here）

你可以在[这里][5]下载到完整的 `playground`。

通过定义自己的简单协议，并对它们使用协议扩展，我们已经见识到了面向协议编程的强大了。通过默认实现，我们可以给已经存在的协议增加通用和默认的行为，类似使用基类，但是更灵活，因为它也适用于结构体和枚举。

更进一步，协议扩展不仅可以用来扩展自定义的协议，还可以对 Swift 标准库：Cocoa 和 CocoaTouch 的协议进行扩展，并提供默认行为。

如果想知道 Swift 2 还更新了哪些其它新特性，可以参考我们的另一篇文章[Swift 2 新特性][6]，或者 Swift 2 公布的[官方博客][7]。

可以观看 WWDC 的[Protocol Oriented Programming][8]来进行更加深入的学习，以及获得更底层的理论知识。

  [1]: http://www.raywenderlich.com
  [3]: http://www.swiftyper.com/usr/uploads/2015/06/955131448.jpg
  [4]: http://www.swiftyper.com/usr/uploads/2015/06/1238146152.png
  [5]: http://cdn1.raywenderlich.com/wp-content/uploads/2015/06/SwiftProtocols.playground.zip
  [6]: http://www.swiftyper.com/Swift/what_new_in_swift_2.html
  [7]: https://developer.apple.com/swift/blog/?id=29
  [8]: https://developer.apple.com/videos/wwdc/2015/?id=408	


