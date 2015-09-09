从 OC 到 Swift

> 作者：Greg Heo，[原文链接](http://gregheo.com/blog/switching-your-brain-to-swift/)，原文日期：2015/08/17
> 译者：[ray16897188](undefined)；校对：[shanks](http://codebuild.me/)；定稿：[numbbbbb](https://github.com/numbbbbb)
  







## OC 代码 + 你的头脑 + Swift = 完美

本文源于[360iDev 2015](http://360idev.com/)的一次演讲。[视频地址](https://vimeopro.com/360conferences/360idev-2015/video/137530879)

最完美的当然是从零开始的一个 100% Swift 的项目。如果你能这么做，那自然很棒！但如果手里有现成代码库并且想试试 Swift ，该怎么办？



## 为什么要用 Swift？

原因很多：Swift 是新星；Swift 有更好的语法（口水战开始了）；Swift 是 Apple 指给我们的新方向。

将来 Swift 的牛逼程度还会继续增加，一定会成为大众首选的、有最完善的技术支持的、写 OSX 和 iOS 代码最方便的一种语言。

![Swift awesomeness over time](http://swift.gg/img/articles/switching-your-brain-to-swift/objs-swift-awesomeness.png)

Swift 代表着未来，就这么简单。那怎么做才能开始用 Swift 的方式去思考呢？

## Swift 的方式

有太多要考虑的事情了，但我们从两个大的方面说起：安全性和值语义（value semantics）。

### 安全性

Objective-C 里的`nil`棒极了。你可以用它来标注一个不存在的东西，运行时（runtime）会自动处理。

然而 Swift 中的`nil`却是一个完全不同的东西。通常来讲类型系统（type system）会阻止你调用空函数或者访问空属性。但你能绕过类型系统，而这么做和在 C 语言中解引用一个空指针一样糟糕：代码执行时会出错，然后你的 app 会崩溃。

Swift 中类型安全是头等要事。一个`String`就是一个`String`，根本就没`nil`什么事儿。这更像 C++ 中的引用而非 C 中的指针，因为引用永远不会是`nil`。

### 可选类型

有了可选类型，`nil`又回来了。一个可选类型的`String`可以是一个`String`或者是`nil`。你必须手动检查，每一次都要检查。

你也可以不做检查：强制将这个可选类型变量拆包。或者将它换成一个隐式解析可选类型（implicitly unwrapped optional），这意味着它更难理解，但可以像非可选类型一样使用 - 如果它是`nil`，app 就崩溃了。

![(所有的都拆包!)](http://swift.gg/img/articles/switching-your-brain-to-swift/objs-unwrap.png)

Cocoa 里有太多可选类型，这意味着你每次使用它们，都需要检查里面是什么。

这里就需要转变思维。Swift 的思路是：无论如何都不能向`nil`发送消息。你应该知道，在强类型系统中，某种东西要么是`nil`要么有值。

如果在运行时有不确定性，必须进行检查。不要强制拆包。

把可选类型想成是一个盒子：这个盒子要么没有值（nil），要么就有值。但是你在强制拆包它之前总要先去检查一下。

![(你得问：可选类型的盒子里面是啥?)](http://swift.gg/img/articles/switching-your-brain-to-swift/objs-box.jpg)

还有很多展示 Swift 安全性的例子：构造器、更少的未定义行为（less undefined behavior）、内存安全。`nil`安全性是最常见的一种。

### 值类型

值类型在 Swift 中随处可见。没什么新东西 - Objective-C 也有`NSInteger`和类似`CGRect`的结构体字面量（primitives）。但绝大多数实体 - 比如`NSString`、`NSArray`等等 - 都是类（classes），因此是引用类型。

Swift 中则完全相反，如果你扫一眼头文件的话会发现标准库中有 80 多个结构体，只有 4 个类。

字符串、数字和集合类型在 Swift 中都是值类型。这意味着如果你有一个可变的 Swift String（结构体）并把它传给一个函数，你会拿到一个拷贝（copy）。重复一遍，这不是什么吓人的新概念：我们在 Objective-C 中已经用了很长时间`copy`和`mutableCopy`。这里的新思路是对于多数常见类型来说值类型是缺省行为。

不幸的是，如果你在 Swift 中用结构体写了牛逼代码，在 Objective-C 中不能使用它们。这就要提到下一个话题：桥接。

## 桥接

Swift 理所当然能与 Objective-C 协同工作。这基本上是一个无需争论的事实，因为 Cocoa 是为 Objective-C 开发的。Cocoa 的所有 API 必须能被 Swift 调用，这意味着你自己的 Objective-C 类也可以桥接到 Swift 中。

下面是我们的目标：在 Swift 中加入 Objective-C 代码，然后在 Objective-C 中调用你的 Swift 代码。

### 从 Swift 到 Objective-C

许多 Swift 特性不能桥接到 Objective-C，比如 Swift 自己的结构体和增强的枚举类型。这意味着如果你用 Swift 里最酷的特性写了一个最新最强的 framework，其中绝大多数功能无法在 Objective-C 中使用。

即使你只使用 Swift 中可以兼容 Objective-C 的特性，也不能从 Objective-C 的类中派生出一个 Swift 子类。你可以使用表格视图或者集合视图，并用`delegate`和布局对象（layout objects）来规避这个问题，但是如果你的 API 需要派生子类，那就无法桥接。

Swift 中任何东西在 Objective-C 中默认都是不可见的。
如果你给`class`和`protocol`标记`@objc`，那它们就可以在 Objective-C 中使用。动态调节器（dynamic modifier）也使用了`@objc`标注，让被标记的东西在 Objective-C 中可用。此外，那些标记了`dynamic`的属性或者方法会应用 Objective-C 的动态分发（dynamic dispatch）。

![(Swift&Objective-C)](http://swift.gg/img/articles/switching-your-brain-to-swift/objs-objc-dynamic.png)

如果你想应用动态特性，就需要`dynamic`；仅仅标识`@objc`还不足以保证`objc_msgSend()`能被使用，因为方法有可能被去虚拟化（devirtualized）或者被内联。

重复一下，这仅仅对那些可兼容的特性有效。并不适用你自己写的 Swift 枚举类型中的方法。如果你的枚举类型不是`Int`类型，那就兼容不了。

### 从 Objective-C 到 Swift：可空性（Nullability）

从 Objective-C 转到 Swift 有很多好处。为了促进这个过程，在 Objective-C 中你要给你的属性，参数和返回值类型加上标注（annotation）。

- `_Null_unspecified (default)`：桥接到一个 Swift 隐式解析可选类型（implicitly-unwrapped optional）。
- `_Nonnull` – 该值不可以是`nil`：桥接到一个常规的引用。
- `_Nullable` – 该值可以是`nil`：桥接到一个可选类型。

如果你给 Objective-C 代码加了标注，就可以顺利地将类型桥接到 Swift 中。即使你没写过 Swift，用 Objective-C 的时候这些标注也会在代码补全中出现。如果你告诉编译器一个方法的参数是`_Nonnull`的，然后传入一个`nil`，编译器会显示对应的警告。

从现在开始就为代码添加标注。这会帮你更好地使用现有 API，也会帮你更快地切换到 Swift。

### Objective-C 到 Swift: 轻量泛型（Lightweight Generics）

轻量泛型是 Swift 2 的新特性。集合类型`NSArray`、`NSDictionary（字典类型）`和`NSSet`可以包含任何`NSObject`类型。

这意味着大量的类型转换（casting）。Objective-C 中没有这个问题，但是记住：Swift 非常关注安全性。正确的转换涉及到大量的检查。你不应该强制进行类型转换，应该先进行测试。

现在有了泛型，你可以在 Objective-C 中这样写：

```objectivec
NSArray<NSString *> * _Nonnull
```

这是包含`NSString`对象的`NSArray`。有了可空性（nullability）注释，就能知道这个数组不会是`nil`，它肯定会是一个数组。熟悉 Java 或者 C++ 的话，对泛型语法一定不会陌生。

桥接到 Swift 中会是这样：

```swift
[String]
```

一个非常清晰的 Swift `String`数组。

说明：轻量泛型只能应用于基本集合类：数组、字典和集合。

## 在浑水上架桥

我建议从零开始新建一个 Swift 的项目 - 100% 纯度的 Swift。无论第三方框架用什么写成，都可以直接使用。

如果你想向现有的代码库中引入 Swift，那最好从 Objective-C 桥接到 Swift。举个例子，视图控制器和视图实例在 Swift 中就可以正常工作。它们继承自`NSObject`，如果需要的话你可以从 Objective-C 中访问它们。

![(金门大桥)](http://swift.gg/img/articles/switching-your-brain-to-swift/objs-bridge.jpg)

但是反过来则不同：如果要使用纯 Swift 泛型、非整型类型的枚举、嵌套类型、结构体等等新内容，就必须身处纯 Swift 世界。别掉队，这一天会比你想的来得更快。

在那之前，请继续写能够兼容 Swift 的 Objective-C 代码并时刻关注 Swift。下面这些资源可以帮你更好地进行过渡。

## 资源

- [What's New in Swift 2](http://www.raywenderlich.com/108522/whats-new-in-swift-2) – 跟上Swift 2的最新特性
- [Swift Guard Statement](http://ericcerney.com/swift-guard-statement/) – 有人问过一个关于让代码保持"happy path（没有异常或错误代码，保证一切都按照所期望的情况运行 - 译者注）"的问题，Swift 2 中的 guard 语句能帮你实现这点！
- [Introducing Protocol-Oriented Programming in Swift 2](http://www.raywenderlich.com/109156/introducing-protocol-oriented-programming-in-swift-2) – 面向协议编程（Protocol-oriented programming）是时下 Swift 的新热点。
- [Using Swift with Cocoa and Objective-C (Swift 2 Prerelease)](https://geo.itunes.apple.com/ca/book/using-swift-cocoa-objective/id1002624212?mt=11&at=11l4G6) – Apple 关于 Swift + Objective-C + Cocoa 的教程

