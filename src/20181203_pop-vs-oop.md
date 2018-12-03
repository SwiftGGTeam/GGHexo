title:"Swift 中的面向协议编程：是否优于面向对象编程？"
date:2018-12-03
tags:[Swift]
categories: [appcoda]
permalink: pop-vs-oop
keywords:Swift
description: 本文介绍了面向协议编程的优缺点，以及与面向对象编程的对比。

---

原文链接=https://www.appcoda.com/pop-vs-oop/
作者=Andrew Jaffee
原文日期=2018/03/28
译者=阳仔
校对=numbbbbb,Lision
定稿=Forelax

 <!--此处开始正文-->

在本文中，我们将深入讨论 Swift 4 中的面向协议编程。这是一个系列两篇文章中的第二篇。如果你还没有读过 [前一篇介绍文章](https://www.appcoda.com/protocol-oriented-programming/)，请在继续阅读本文之前先阅读前一篇。

<!--more-->

在本文中，我们将探讨为什么 Swift 被认为是一门“面向协议”的语言；对比面向协议编程（POP）和面向对象编程（OOP）；对比“值语义”和“引用语义”；讨论 local reasoning；用协议实现代理模式；用协议代替类型；使用协议多态性；重审我的面向协议的实际代码；最终讨论为什么我没有 100% 使用 POP 编程。

> 关于 WWDC 链接的一点说明
> 在这一系列关于 POP 的两篇文章中，我至少添加了三个 Apple Worldwide Developers Conference (WWDC) 视频的链接。在 Safari 中点击这些链接将直接跳转至视频中的具体小节（并往往会从该处开始播放视频）。如果你使用的不是 Safari，则需要浏览视频，手动跳转至某一小节，或者查看该视频的文字版本。

## Swift 为什么是“面向协议”的语言？

我在 [前一篇 POP 介绍文章](https://www.appcoda.com/protocol-oriented-programming/) 中，提到 Apple 声称”从核心上说，Swift 是面向协议的”。相信我，确实是这样的。为什么呢？在回答这个问题之前，让我们先来比较几种编程语言。

我们最好对其他语言也有所了解，因为在某些情况下这将会有用处，比如在需要将 C++ 库链接到 iOS 应用中的时候。我的很多 iOS 和 OSX 的应用链接了 C++ 的库，因为这些应用有 Windows 平台的版本。这些年，我支持了许多“平台无关”的应用。

OOP 语言早已支持了接口。接口和 Swift 中的协议很相似，但并不是完全一样。

这些语言中的接口指定了遵循该接口的类和（或）结构体必须实现哪些方法和（或）属性。我这里使用了“和（或）”，是因为比如 C++ 中没有接口的概念，而是使用抽象类。并且，一个 C++ `struct` 可以继承自一个类。C# 中的接口允许指定其中的属性和方法，`struct` 可以遵循接口。Objective-C 中称“协议”而不是“接口”，协议也可以指定要求实现的方法和属性，但只有类可以声明遵循接口，`struct` 不可以。

这些接口和 Objective-C 中的协议，并没有方法的具体实现。它们只是指定一些要求，作为遵循该协议的类/结构体实现时的“蓝图”。

协议构成了 [Swift 标准库](http://swiftdoc.org) 的基础。正如我在 [第一篇文章](https://www.appcoda.com/protocol-oriented-programming/) 中所展示，协议是 POP 方法论和范式的关键所在。

Swift 中的协议有其他语言都不支持的特点：[协议扩展](https://docs.swift.org/swift-book/LanguageGuide/Protocols.html#//apple_ref/doc/uid/TP40014097-CH25-ID521)。以下摘自 Apple 官方描述：

> 协议可以被扩展，来给遵循该协议的类型提供方法、初始化方法、下标、计算属性的具体实现。这就可以允许协议自身定义一些行为，而不是由各个类型自己去实现，或是由一个全局方法来实现。
> 通过扩展，我们可以为协议所要求的任何方法和计算属性提供一个默认的实现。如果一个遵循该协议的类型为某个方法或属性提供了其自己的实现，那么该实现将会替代协议扩展中的实现。

在上一篇文章中，你已经看到我是怎么使用协议扩展的，在本文中你会再次看到。它们是使得 Swift POP 如此强大的秘诀。

在 Swift 出现之前，协议在 iOS 中就已经十分重要。还记得我对 iOS 开发人员多年来采用的 UITableViewDataSource 和 UITableViewDelegate 等协议的 [讨论](https://appcoda.com/protocol-oriented-programming/) 吗？再想一想你每天写的 Swift 代码吧。

用 Swift 编程的时候，不可能不利用 [标准库](http://swiftdoc.org) 中的协议。例如，`Array` （一个继承了 [10 个协议](http://swiftdoc.org/v3.1/type/Array/hierarchy/) 的 `struct`），`Bool` （一个继承了 [7 个协议](http://swiftdoc.org/v3.1/type/Bool/hierarchy/) 的 `struct`），`Comparable` （一个 [继承自另一个协议的协议，并且是很多其他 Swift 类型的继承先祖](http://swiftdoc.org/v3.1/protocol/Comparable/hierarchy/)），以及 `Equatable` （一个 [很多 Swift 协议和类型的继承先祖](http://swiftdoc.org/v3.1/protocol/Equatable/hierarchy/)）。

花一些时间阅览 [Swift 标准库](http://swiftdoc.org)，跟随链接查看所有类型、协议、操作符、全局变量、函数。一定要看几乎所有页面都会有的 “Inheritance” 一节，并点击 “VIEW PROTOCOL HIERARCHY ->” 链接。你将会看到很多协议，协议的定义，以及协议继承关系的图表。

记住很重要的一点：大部分 iOS（以及 OSX）SDK 中的代码都是以类继承的层次结构实现的。我相信很多我们使用的核心框架仍然是用 [Objective-C](https://developer.apple.com/library/archive/documentation/General/Conceptual/DevPedia-CocoaCore/Cocoa.html)（以及一些 C++ 和 C）编写的，例如 `Fundation` 和 `UIKit`。拿 `UIKit` 中的 `UIbutton` 举例。利用 Apple 官方文档页面中的“继承自”链接，我们可以从叶节点 `UIButton` 一直沿着继承链向上查找到根节点 `NSObject`：`UIButton` 到 `UIControl` 到 `UIView` 到 `UIResponder` 到 `NSObject`。可以形象表示为：

![](https://www.appcoda.com/wp-content/uploads/2018/03/UIButton-Inheritance.png)

## POP 和 OOP

OOP 的优点已经被开发者们讨论得很多了，所以在这里我只想简单列举一下。如果想了解详尽的内容，可以参考 [我写的这篇有关 OOP 在 Swift 中的实现的具体介绍](http://iosbrain.com/blog/2017/02/26/intro-to-object-oriented-principles-in-swift-3-via-a-message-box-class-hierarchy/)。

> 注意：如果你读这篇文章的时候还不了解 OOP，我建议你在考虑学习 POP 之前，先学习 OOP。

OOP 的优点包括可重用性，继承，可维护性，对复杂性的隐藏（封装），抽象性，多态性，对一个类的属性和方法的访问权限控制。我这里可能还有所遗漏，因为开发者们已经总结出太多 OOP 的优点了。

简单地说，OOP 和 POP 都拥有大部分上述的特点，主要的一点不同在于：类只能继承自其它一个类，但协议可以继承自多个协议。

正是由于 OOP 的继承的特点，我们在开发中最好把继承关系限制为单继承。因为多继承会使代码很快变得一团乱。

然而，协议却可以继承自一个或多个不同的协议。

为什么需要推动面向协议编程呢？当我们建立起一个庞大的类层次结构的时候，许多的属性和方法会被继承。开发者更倾向于把一些通用功能增加到顶层的——主要是高层的父类中（并且会一直加下去）。中层和底层的类的职责会更加明确和具体。新的功能会被放到父类中，这经常会使得父类充满了许多额外的，无关的职责，变得“被污染”或是“臃肿”。中层和底层的类也因此继承了很多它们并不需要的功能。

这些有关 OOP 的担忧并非成文的规定。一个优秀的开发者可以躲避很多刚才提到的陷阱。这需要时间、实践和经验。例如，开发者可以这样解决父类功能臃肿的问题：将其他类的实例添加为当前类的成员变量，而非继承这些类（也就是使用组合代替继承）。

在 Swift 中使用 POP 还有一个好处：不仅仅是类，值类型也可以遵循协议，比如 `struct` 和 `enum`。我们在下面将会讨论使用值类型的一些优点。

但我的确对遵循多协议的做法有一些顾虑。我们是否只是将代码的复杂性和难度转移成另一种形式了呢？即，将 OOP 继承中的“垂直”的复杂性转移成了 POP 继承中的“水平”的复杂性了呢？

将之前展示的 `UIButton` 的类继承结构和 Swift 中的 `Array` 所遵循的协议进行对比：

![](https://www.appcoda.com/wp-content/uploads/2018/03/Array-Protocol-Tangle.png)

> 图像来源：http://swiftdoc.org/v3.1/type/Array/hierarchy/

Local reasoning 对这两种情况都不适用，因为个体和关系太多了。

## 值语义 vs. 引用语义

正如我上一篇文章所提到的，Apple 正在大力推广 POP 和值语义的相关概念（他们还正在推广另一个与 POP 相关的范式，下文会讲到）。上一次，我向你们展示了代码，这次依然会用代码来明确展示“引用语义”和“值语义”的不同意义。请参阅我 [上一周的文章](https://www.appcoda.com/protocol-oriented-programming/) 中的 `ObjectThatFlies` 协议，以及今天文章中的 `List`，`FIFO`，`LIFO` 以及相关协议。

Apple 工程师 Alex 说我们 [“应当使用值类型和协议来让应用变得更好”](https://developer.apple.com/videos/play/wwdc2016/419/?time=36)。Apple [sample playground](https://developer.apple.com/sample-code/swift/downloads/standard-library.zip) 中，一节题为“理解值类型”的代码文档这么说：

> 标准库中的序列和容器使用了值类型，这让写代码变得更加容易。每一个变量都有一个独立的值，对这个值的引用并非共享的。例如，当你向一个函数传递一个数组，这个函数并不会导致调用方对这个数组的拷贝突然被改变。

这当然对所有使用值语义的数据类型都是适用的。我强烈建议你下载并完整阅览整个 playground。

我并不是要抛弃类这个使用引用语义的概念。我做不到。我自己已经写了太多的基于类的代码。我帮助我的客户整理了数百万行基于类的代码。我同意值类型一般来说比引用类型安全。当我写新的代码，或是重构已有代码的时候，我会考虑在某些个案中积极尝试。

引用语义下，类实例（引用）会导致 [“意料之外的数据共享”](https://developer.apple.com/videos/play/wwdc2015-414/?time=112)。也有人称之为“意料之外的改变”。有一些 [方法](https://developer.apple.com/videos/play/wwdc2015-414/?time=210) 可以最小化引用语义的副作用，不过我还是会越来越多地使用值语义。

值语义能够使变量避免受到无法预计的更改，这实在很棒。因为“每个变量有一个独立的值，对这个值的引用是不共享的“，我们能够避免这种无法预计的更改导致的副作用。

因为 Swift 中的 `struct` 是一种值类型，并且能够遵循协议，苹果也在大力推进 POP 以取代 OOP，在 [面向协议和值编程](https://developer.apple.com/videos/play/wwdc2016/419/) 你可以找到这背后的原因。

## Local reasoning

让我们探讨一个很棒的主题，Apple 称之为 [“Local reasoning”](https://developer.apple.com/videos/play/wwdc2016-419/?time=41)。这是由 Apple 一位叫 Alex 的工程师在 WWDC 2016 - Session 419，“UIKit 应用中的面向协议和值编程”中提出的。这也是 Apple 与 POP 同时大力推动的概念。

我认为这不是个新鲜的概念。许多年以前，教授、同事、导师、开发者们都在讨论这些：永远不要写高度超过一个屏幕的函数（即不长于一页，或许更短）；将大的函数拆解成若干小的函数；将大的代码文件拆解成若干小的代码文件；使用有意义的变量名；在写代码之前花点时间去设计代码；保持空格和缩进风格的一致性；将相关的属性和行为整合成类和/或结构体；将相关的类和/或结构体整合进框架或库中。但 Apple 在解释 POP
的时候，正式提出了这个概念。Alex 告诉我们：

> Local reasoning 意味着，当你看你面前的代码的时候，你不需要去思考，剩下的代码怎样去和这个函数进行交互。也许你之前已经有过这种感觉。例如，当你刚加入一个新的团队，有大量的代码要去看，同时上下文的信息也非常匮乏，你能明白某一个函数的作用吗？做到 Local reasoning 的能力很重要，因为这能够使得维护代码、编写代码、测试代码变得更加容易。

哈哈，你曾经有过这种感觉吗？我曾经读过一些其他人写的真的很好的代码。我也曾经写过一些易读性非常好的代码。说实话，在 30 年的工作经验中，我要去支持和升级的绝大部分现存的代码都不会让我感受到 Alex 所描述的这种感觉。相反，我经常会变得非常困惑，因为当我看一段代码的时候，我往往对这段代码的作用毫无头绪。

Swift 语言的源代码是开源的。请快速浏览一遍 [下列函数](https://github.com/apple/swift/blob/master/stdlib/public/SDK/Foundation/NSFastEnumeration.swift)，也不要花上三个小时去试图理解它：

```swift
public mutating func next() -> Any? {
    if index + 1 > count {
        index = 0
	// 确保没有 self 的成员变量被捕获
        let enumeratedObject = enumerable
        var localState = state
        var localObjects = objects
        
        (count, useObjectsBuffer) = withUnsafeMutablePointer(to: &localObjects) {
            let buffer = AutoreleasingUnsafeMutablePointer<AnyObject?>($0)
            return withUnsafeMutablePointer(to: &localState) { (statePtr: UnsafeMutablePointer<NSFastEnumerationState>) -> (Int, Bool) in
                let result = enumeratedObject.countByEnumerating(with: statePtr, objects: buffer, count: 16)
                if statePtr.pointee.itemsPtr == buffer {
		    // 大多数 cocoa 类会返回它们自己的内部指针缓存，不使用默认的路径获取值。也有例外的情况，比如 NSDictionary 和 NSSet。
		    return (result, true)
                } else {
                    // 这里是通常情形，比如 NSArray。
		    return (result, false)
                }
            }
        }
        
        state = localState // 重置 state 的值
        objects = localObjects // 将对象指针拷贝回 self 
        
        if count == 0 { return nil }
    }
    defer { index += 1 }
    if !useObjectsBuffer {
        return state.itemsPtr![index]
    } else {
        switch index {
        case 0: return objects.0!.takeUnretainedValue()
        case 1: return objects.1!.takeUnretainedValue()
        case 2: return objects.2!.takeUnretainedValue()
        case 3: return objects.3!.takeUnretainedValue()
        case 4: return objects.4!.takeUnretainedValue()
        case 5: return objects.5!.takeUnretainedValue()
        case 6: return objects.6!.takeUnretainedValue()
        case 7: return objects.7!.takeUnretainedValue()
        case 8: return objects.8!.takeUnretainedValue()
        case 9: return objects.9!.takeUnretainedValue()
        case 10: return objects.10!.takeUnretainedValue()
        case 11: return objects.11!.takeUnretainedValue()
        case 12: return objects.12!.takeUnretainedValue()
        case 13: return objects.13!.takeUnretainedValue()
        case 14: return objects.14!.takeUnretainedValue()
        case 15: return objects.15!.takeUnretainedValue()
        default: fatalError("Access beyond storage buffer")
        }
    }
}
```

在你浏览过一遍之后，说实话，你能理解这段代码吗？我并没有。我不得不花些时间多读几遍，并查阅函数定义之类的代码。以我的经验，这种代码是普遍存在的，并且不可避免需要经常修补的。

现在，让我们考虑理解一种 Swift 类型（不是一个函数）。查看 Swift 中的 `Array` 的 [定义](http://swiftdoc.org/v3.1/type/Array/)。我的天，它继承了 10 个协议：

- `BidirectionalCollection`
- `Collection`
- `CustomDebugStringConvertible`
- `CustomReflectable`
- `CustomStringConvertible`
- `ExpressibleByArrayLiteral`
- `MutableCollection`
- `RandomAccessCollection`
- `RangeReplaceableCollection`
- `Sequence`

点击下方的“VIEW PROTOCOL HIERARCHY ->”链接按钮——天哪，[看这一坨面条一样的线条](http://swiftdoc.org/v3.1/type/Array/hierarchy/)！

如果你是在开发一个新项目，并且整个团队能够遵循一套最佳开发指导方案的话，要做到 Local reasoning 会容易很多。少量代码的重构也是做到 local reasoning 的较好的机会。对我来说，像其他大部分事情一样，代码的重构需要慎重和仔细，要做到适度。

牢记：你几乎一直要面对非常复杂的业务逻辑，这些逻辑如果写成代码，并且要让一个团队新人流畅读懂，需要他/她接收一些业务知识的训练和指导。他/她很可能需要查找一些函数、类、结构体、枚举值、变量的定义。

## 代理和协议

代理模式是 iOS 中广泛使用的模式，其中一个必需的组成部分就是协议。在这里我们不需要再去重复。你可以阅读我有关该主题的 AppCoda [博客](https://www.appcoda.com/swift-delegate/)。

## 协议类型以及协议多态性

在这些主题上我不准备花太多时间。我已经讲过很多有关协议的知识，并向你展示了大量代码。作为任务，我想让你自己研究一下，Swift 协议类型（就像在代理中一样）的重要性，它们能给我们带来的灵活性，以及它们所展示的多态性。

*协议类型*
在我 [关于代理的文章](https://www.appcoda.com/swift-delegate/) 中，我定义了一个属性：

```swift
var delegate: LogoDownloaderDelegate?
```

其中 `LogoDownloaderDelegate` 是一个协议。然后，我调用了这个协议的一个方法。

*协议多态性*
正如在面向对象中一样，我们可以通过遵循父协议的数据类型，来与多种遵循同一个协议族的子协议的数据类型进行交互。用代码举例来说明：

```swift
protocol Top {
    var protocolName: String { get }
}

protocol Middle: Top {

}

protocol Bottom: Middle {

}

struct TopStruct : Top {
    var protocolName: String = "TopStruct"
}

struct MiddleStruct : Middle {
    var protocolName: String = "MiddleStruct"
}

struct BottomStruct : Bottom {
    var protocolName: String = "BottomStruct"
}

let top = TopStruct()
let middle = MiddleStruct()
let bottom = BottomStruct()

var topStruct: Top
topStruct = bottom
print("\(topStruct)\n")
// 输出 "BottomStruct(protocolName: "BottomStruct")"

topStruct = middle
print("\(topStruct)\n")
// 输出 "MiddleStruct(protocolName: "MiddleStruct")"

topStruct = top
print("\(topStruct)\n")
// 输出 "TopStruct(protocolName: "TopStruct")"

let protocolStructs:[Top] = [top,middle,bottom]

for protocolStruct in protocolStructs {
    print("\(protocolStruct)\n")
}
```

如果你运行一下 Playground 中的代码，以下是终端的输出结果：

```
BottomStruct(protocolName: "BottomStruct")

MiddleStruct(protocolName: "MiddleStruct")

TopStruct(protocolName: "TopStruct")

TopStruct(protocolName: "TopStruct")

MiddleStruct(protocolName: "MiddleStruct")

BottomStruct(protocolName: "BottomStruct")
```

## 真实的 UIKit 应用中的协议

现在，让我们来看一些实质性的东西，写一些 Swift 4 的代码——这些代码是在我自己的应用中真实使用的。这些代码应当能使你开始思考用协议来构建和/或拓展你的代码。这也就是我在这两篇文章中一直在描述的，“面向协议编程”，或者 POP。

我选择向你展示如何去扩展或者说是延伸（随便哪种说法）`UIKit` 的类，因为 1) 你很可能非常习惯使用它们 2) 扩展 iOS SDK 中的类，比如 `UIView`，是比用你自己的类更加困难一些的。

所有 `UIView` 的扩展代码都是用 Xcode 9 工程中的 *Single View App* 模板写的。

我使用默认协议扩展来对 `UIView` 进行扩展——这么做的关键是一种 Apple 称之为 [“条件遵循”](https://swift.org/blog/conditional-conformance/) 的做法（也可以看 [这里](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/Protocols.html#//apple_ref/doc/uid/TP40014097-CH25-ID277)）。因为我只想对 `UIView` 这个类进行扩展，我们可以让编译器来把这个变成一项强制要求。

我经常使用 `UIView` 作为一个容器来组织屏幕上的其他 UI 元素。也有时候，我会用这些容器视图来更好地查看、感觉、排布我的 UI 视图。

这里是一张 GIF 图片，展示了使用下面创建的三个协议来自定义 `UIView` 的外观的结果：

![](https://www.appcoda.com/wp-content/uploads/2018/03/Extend-UIView.gif)

注意，这里我也遵守了 ”Local reasoning“ 的原则。我每一个基于协议的函数都控制在一屏幕之内。我希望你能阅读每一个函数，因为它们并没有太多代码量，但却很有效。

## 为 UIView 添加一个默认的边框

假设我希望获得很多拥有相同边框的 `UIView` 实例——例如在一个支持颜色主题的应用中那样。一个这样的例子就是上面那张图片中，最上面那个绿色的视图。

```swift
protocol SimpleViewWithBorder {}

// 安全的："addBorder" 方法只会被添加到 UIView 的实例。
extension SimpleViewWithBorder where Self : UIView {
    func addBorder() -> Void {
        layer.borderColor = UIColor.green.cgColor
        layer.borderWidth = 10.0
    }
}

class SimpleUIViewWithBorder : UIView, SimpleViewWithBorder {
}
```

要创建、配置、显示一个 `SimpleUIViewWithBorder` 的实例，我在我的 `ViewController` 子类中的 `IBAction` 中写了如下代码：

```swift
@IBAction func addViewButtonTapped(_ sender: Any) {
    let customFrame0 = CGRect(x: 110, y: 100, width: 100, height: 100)
    let customView0 = SimpleUIViewWithBorder(frame: customFrame0)
    customView0.addBorder()
    self.view.addSubview(customView0)
```

我不需要为这个 `UIView` 的子类去创建一个特殊的初始化方法。

## 为 UIView 添加一个默认的背景色

假设我希望很多 `UIView` 的实例都有相同的背景色。一个这样的例子是上图中，中间的蓝色视图。注意，我向可配置的 `UIView` 又更进了一步。

```swift
protocol ViewWithBackground {
    var customBackgroundColor: UIColor { get }
}

extension ViewWithBackground where Self : UIView {
    func addBackgroundColor() -> Void {
        backgroundColor = customBackgroundColor
    }
}

class UIViewWithBackground : UIView, ViewWithBackground {
    let customBackgroundColor: UIColor = .blue
}
```

要创建、配置、展示一个 `UIViewWithBackground` 的实例，我在我的 `ViewController` 子类中的 `IBAction` 中写了如下代码：

```swift
let customFrame1 = CGRect(x: 110, y: 210, width: 100, height: 100)
let customView1 = UIViewWithBackground(frame: customFrame1)
customView1.addBackgroundColor()
self.view.addSubview(customView1)
```

我不需要为这个 `UIView` 的子类去创建一个特殊的初始化方法。

## 为 UIView 添加一个可配置的边框颜色

现在，我希望能够配置 `UIView` 边框的颜色和宽度。用下列实现代码，我可以随意创建不同边框颜色、宽度的视图。这样的一个例子是上图中，最下面的红色视图。向我的协议中去添加可配置的属性有一点代价，我需要能够初始化这些属性，因此，我为我的协议添加了一个 `init` 方法。这意味着，我也可以调用 `UIView` 的初始化方法。读完代码，你就会明白：

```swift
protocol ViewWithBorder {
    var borderColor: UIColor { get }
    var borderThickness: CGFloat { get }
    init(borderColor: UIColor, borderThickness: CGFloat, frame: CGRect)
}

extension ViewWithBorder where Self : UIView {
    func addBorder() -> Void {
        layer.borderColor = borderColor.cgColor
        layer.borderWidth = borderThickness
    }
}

class UIViewWithBorder : UIView, ViewWithBorder {
    let borderColor: UIColor
    let borderThickness: CGFloat

    // UIView 的必要初始化方法
    required init(borderColor: UIColor, borderThickness: CGFloat, frame: CGRect) {
        self.borderColor = borderColor
        self.borderThickness = borderThickness
        super.init(frame: frame)
    }

    // UIView 的必要初始化方法
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
```

要创建、配置、显示一个 `UIViewWithBorder` 的实例，我在我的 `ViewController` 子类中的 `IBAction` 中写了如下代码：

```swift
    let customFrame2 = CGRect(x: 110, y: 320, width: 100, height: 100)
    let customView2 = UIViewWithBorder(borderColor: .red, borderThickness: 10.0, frame: customFrame2)
    customView2.addBorder()
    self.view.addSubview(customView2)
```

## 我不想做的事

我不想去创建像这样的代码：

```swift
extension UIView {
    func addBorder() {  ...  }
    func addBackgroundColor() {  ...  }
}
```

这样也许在一些情况下是有效的，但我感觉这种实现太粗泛了，容易丧失很多细颗粒度的控制。这种实现也容易使得这种构造方法变成 `UIView` 相关扩展方法的垃圾场，换句话说，代码容易变得臃肿。随着方法越来越多，代码也变得越来越难以阅读和维护。

在上述所有基于 `UIKit` 的协议中，我都使用了 `UIView` 的子类——引用类型。子类化能够让我能直接访问父类 `UIView` 中的任何内容，让我的代码清晰、简短、易读。如果我使用的是 `struct`，我的代码会变得更加冗长，至于为什么，留给你们当做练习。

## 我做的事情

时刻记住，所有这些默认协议 `extensions` 可以在类扩展中覆盖。用一个例子和图片来解释：

```swift
protocol SimpleViewWithBorder {}

extension SimpleViewWithBorder where Self : UIView {
    func addBorder() -> Void {
        layer.borderColor = UIColor.green.cgColor
        layer.borderWidth = 10.0
    }
}

class SimpleUIViewWithBorder : UIView, SimpleViewWithBorder {
    // 覆盖 extension 中的默认实现
    func addBorder() -> Void {
        layer.borderColor = UIColor.darkGray.cgColor
        layer.borderWidth = 20.0
    }
}
```

注意我在 `SimpleUIViewWithBorder` 中的注释。看下图中最上面的视图：

![](https://www.appcoda.com/wp-content/uploads/2018/03/Override-Extended-UIView.gif)

## 真实的，基于协议的泛型数据结构

我非常骄傲在我自己的应用中，我能够写尽量少的 POP 代码，来创建完整功能的泛型的栈和队列的数据结构。想了解有关 Swift 中的泛型，请阅读我 AppCoda 中的 [文章](https://appcoda.com/swift-generics/)。

请注意，我使用协议继承来帮助我利用抽象的 `List` 协议去创建更加具体的 `FIFO` 和 `LIFO` 协议。然后，我利用协议扩展来实现 `Queue` 和 `Stack` 值类型。你可以在下面的 Xcode 9 playground 中看到这些 `struct` 的实例。

我想向你展示的是如何像 Apple 建议的一样，通过其他协议来实现自己自定义的协议，因此，我创建了 `ListSubscript`，`ListPrintForwards`，`ListPrintBackwards`，`ListCount`协议。它们现在还很简单，但在一个实际的应用中将会展现出其作用。

这种继承多个其他协议的做法可以让开发者为现有代码增加新的功能，而且不会因为太多额外不相关的功能对代码造成”污染“或”臃肿“。这些协议中，每一个都是独立的。如果是作为类被添加到继承层级中叶级以上的话，根据它们所处的位置，这些功能将会至少自动被其他一些类继承。

关于 POP，我已经讲了足够多来帮助你阅读和理解代码。再给出一个我是如何让我的数据结构支持泛型的提示：[关联类型的定义](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/Generics.html#//apple_ref/doc/uid/TP40014097-CH26-ID189)。

> 当定义一个协议的时候，有时可以声明一个或多个关联类型，作为协议定义的一部分。一个关联类型提供了一个占位名，用来表示协议中的一种类型。这个关联类型真正的数据类型直到该协议被使用的时候才确定。使用 `associatedtype` 关键字来指明一个关联类型。

代码如下：

```swift
protocol ListSubscript {
    associatedtype AnyType
    
    var elements : [AnyType] { get }
}

extension ListSubscript {
    subscript(i: Int) -> Any {
        return elements[i]
    }
}

protocol ListPrintForwards {
    associatedtype AnyType

    var elements : [AnyType] { get }
}

extension ListPrintForwards {
    func showList() {
        if elements.count > 0 {
            var line = ""
            var index = 1

                        for element in elements {
                line += "\(element) "
                index += 1
            }
            print("\(line)\n")
        } else {
            print("EMPTY\n")
        }
    }
}

protocol ListPrintBackward {
    associatedtype AnyType

    var elements : [AnyType] { get }
}

extension ListPrintBackwards {
    func showList() {
        if elements.count > 0 {
            var line = ""
            var index = 1

            for element in elements.reversed() {
                line += "\(element) "
                index += 1
            }
            print("\(line)\n")
        } else {
            print("EMPTY\n")
        }
    }
}

protocol ListCount {
    associatedtype AnyType

    var elements : [AnyType] { get }
}

extension ListCount {
    func count() -> Int {
        return elements.count
    }
}

protocol List {
    associatedtype AnyType

    var elements : [AnyType] { get set }

    mutating func remove() -> AnyType

    mutating func add(_ element: AnyType)
}

extension List {
    mutating func add(_ element: AnyType) {
        elements.append(element)
    }
}

protocol FIFO : List, ListCount, ListPrintForwards, ListSubscript {

}

extension FIFO {
    mutating func remove() -> AnyType {
        if elements.count > 0 {
            return elements.removeFirst()
        } else {
            return "******EMPTY******" as! AnyType
        }
    }
}

struct Queue<AnyType>: FIFO {
    var elements: [AnyType] = []
}

var queue = Queue<Any>()
queue.add("Bob")
queue.showList()
queue.add(1)
queue.showList()
queue.add(3.0)
_ = queue[0] // 该下标输出 "Bob"
_ = queue.count()
queue.showList()
queue.remove()
queue.showList()
queue.remove()
queue.showList()
queue.remove()
queue.showList()
_ = queue.count()

protocol LIFO : List, ListCount, ListPrintBackwards, ListSubscript {
}

extension LIFO {
    mutating func remove() -> AnyType {
        if elements.count > 0 {
            return elements.removeLast()
        } else {
            return "******EMPTY******" as! AnyType
        }
    }    
}

struct Stack<AnyType>: LIFO {
    var elements: [AnyType] = []
}

var stack = Stack<Any>()
stack.add("Bob")
stack.showList()
stack.add(1)
stack.showList()
stack.add(3.0)
_ = stack[0] // 该下标输出 3
_ = stack.count()
stack.showList()
stack.remove()
stack.showList()
stack.remove()
stack.showList()
stack.remove()
stack.showList()
_ = stack.count()
```

这一段代码片段在控制台输出如下：

```
Bob

Bob 1

Bob 1 3.0

1 3.0

3.0

EMPTY

Bob

1 Bob

3.0 1 Bob

1 Bob

Bob

EMPTY
```

## 我没有 100% 使用 POP

在 WWDC 有关 POP 的视频之一中，一位工程师/讲师说 [”在 Swift 中我们有一种说法，不要从一个类开始写代码，从一个协议开始“](https://developer.apple.com/videos/play/wwdc2015-408/?time=882)。嘛~也许吧。这家伙开始了有关如何使用协议来写一个二分查找的冗长的讨论。我有点怀疑，这是不是我许多读者印象最深的部分。看完你失眠了吗？

这有点像是为了寻找一个 POP 解决方案而人为设计出的一个问题。也许问题是实际的，也许这种解决方案有优点，我也不知道。我的时间很宝贵，没有时间浪费在这种象牙塔理论上。如果读懂一段代码需要超过 5 分钟的时间，我就觉得这段代码违背了 Apple 的 ”local reasoning“ 原则。

如果你和我一样也是一个软件开发者，最好始终对新的方法论保持一个开放的心态，并且始终将控制复杂度作为你的主要工作重心。我绝不反对赚钱，但看得更高更远一点是有好处的。记住，Apple 是一家公司，一家大公司，主要使命是赚大钱，上周五的市值已经接近 8370 亿美元，拥有数千亿的现金和现金等价物。他们想让每个人都使用 Swift，而这些公司吸引人到自家生态系统的方法之一就是提供别人都提供不了的产品和服务。是的，[Swift 是开源的](https://developer.apple.com/swift/blog/?id=34)，但 Apple 从 App Store 赚了大钱，因此应用正是让所有 Apple 设备变得有用的关键，许许多多的开发者正在向 Swift 迁移。

我觉得没有任何理由只用 POP 进行编程。我认为 POP 和我使用的其他许多技术，甚至是 OOP 一样，都有一些问题。我们是在对现实建模，或者至少说，我们是在对现实进行拟合。没有完美的解决方案。所以，将 POP 作为你的开发工具箱中的一种吧，就像人们长年以来总结出的其他优秀的方案一样。

## 结论

30 年的开发经验，让我能够平心静气地说，**你应该了解协议和 POP。**开始设计并书写你自己的 POP 代码吧。

我已经花费了不少时间试用 POP，并且已经将这篇文章中的协议使用在了我自己的应用中，比如 `SimpleViewWithBorder`，`ViewWithBackground`，`ViewWithBorder`，`List`，`FIFO`，`LIFO`。POP 威力无穷。

正如我在前一篇文章中提到的，学习并接受一种新方法，比如 POP，并不是一个非对即错的事情。POP 和 OOP 不仅能并存，还能够互相补充。

所以，开始试验、练习、学习吧。最后，尽情享受生活和工作吧。

