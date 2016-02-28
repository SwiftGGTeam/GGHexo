title: "结构体中的 Lazy 属性探究"
date: 2016-01-26
tags: [Swift 进阶]
categories: [Ole Begemann]
permalink: lazy-properties-in-structs-swift
---

原文链接=http://oleb.net/blog/2015/12/lazy-properties-in-structs-swift/
作者=Ole Begemann
原文日期=2015-12-17
译者=pmst
校对=Cee
定稿=小锅

<!--此处开始正文-->

> 定稿注：原文没有提供源码，作为一个走心的翻译组，我们已经将本篇文章的最终版源码作成 Playground，可以到[这个地址](https://github.com/buginux/SwiftGGArticleCode)进行下载。

> 更新：
> 
> 2015-12-17 提到 Swift evolution 邮件列表中一个关于行为属性的新提案，如果这个提案被采取，则本篇文章中的大部分将成为过时的内容

Swift 中的 [lazy 关键字](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Properties.html#//apple_ref/doc/uid/TP40014097-CH14-ID257)允许你定义这么一个属性：它的初始值在当它被首次访问的时候才计算。举个例子，试想通过一个结构体来描述一副图像。该图像的元数据（metadata）字典创建操作所需要的开销代价也许很大，因此我们更倾向于推迟这个行为直至需要该数据的时候。我们可以像这样声明一个 `lazy var` 属性：

<!--more-->

```swift
struct Image {
    lazy var metadata: [String:AnyObject] = {
        // 加载图片和解析 metadata，相当占内存
        // ...
        return ...
    }()
}
```

注意我们必须使用 `var` 关键字声明属性。`let` 关键字声明的常量必须在实例初始化完成前拥有一个值，显然对于 `lazy` 变量无法保证初始化前有值。（译者注：实例指结构体实例）

访问 `lazy` 属性是一个 `mutating` 操作，因为属性的初始值只在第一次访问时才计算确定。当结构体（属于值类型）包含一个 `lazy` 属性时，任何该结构体的拥有者同样必须声明为一个变量（`var` 关键字声明），因为访问该属性意味着可能改变结构体内容。所以以下行为是不被允许的：

```swift
let image = Image()
print(image.metadata)
// error: Cannot use mutating getter on immutable value: 'image' is a 'let' constant.
```

你可以强制要求用户使用 `var` 关键字来声明 `Image` 类型，但是这可能有些不合适（比如，[函数中作为变量的情况](https://github.com/apple/swift-evolution/blob/master/proposals/0003-remove-var-parameters-patterns.md)）或容易混淆（因为 getter 方法通常并不是可变的）。

### 使用Box包装类型

另外一种选择是将 `lazy` 值封装到一个类中，有点类似经常使用的 [`Box type`](https://github.com/robrix/Box)。由于类是引用类型，结构体可以包含一个 `let` 常量指向一个类实例，如此结构体依旧是不可变的，但它指向的引用对象本身是可以改变的。

首先我们定义一个枚举类型，命名为 `LazyValue`，用于表示值类型 `T` 能够被懒加载（有时又称延迟加载）。它具有两个可能状态：要么还未执行计算操作，要么已经执行计算并得到结果值。在前一种情况中，它存储用于执行计算的函数（闭包）。后一种情况中，它存储计算值。

```swift
private enum LazyValue<T> {
    case NotYetComputed(() -> T)
    case Computed(T)
}
```

现在我们将封装该枚举到一个类中，命名为 `LazyBox`，这样我们就能够独立地在它内部做一些改变。而 `LazyBox`实例的拥有者依旧能够保持不可变状态。实现如下：

```swift
final class LazyBox<T> {
    init(computation: () -> T) {
        _value = .NotYetComputed(computation)
    }

    private var _value: LazyValue<T>

    var value: T {
        switch self._value {
        case .NotYetComputed(let computation):
            let result = computation()
            self._value = .Computed(result)
            return result
        case .Computed(let result):
            return result
        }
    }
}
```

`LazyBox` 类构造方法接收一个闭包作为变量，用于计算值。我们将该函数存储到一个私有的 `LazyValue` 属性中，等待需要时进行访问。该类的公有接口是一个只读属性 `value`。在 `value` 的 `getter` 方法中我们检查是否已经拥有一个计算属性，如果是则返回该值。否则我们执行一次计算函数并缓存结果值到 `_value` 等待之后的读取操作。

我们可以像这样使用 `LazyBox`，并且验证计算函数确实仅被执行了一次：


```swift
var counter = 0
let box = LazyBox<Int> {
    counter += 1;
    return counter * 10
}
assert(box.value == 10)
assert(box.value == 10)
assert(counter == 1)// 倘若你把 1 改成 2，就会报错
```

上面这种方式的优势在于它能够应用到常量结构体中。而在其他方面，它相比较 `lazy` 变量使用略逊一筹，因为用户需要通过 `value` 属性才能访问结果值。如果感觉这样不直观的话，我们可以隐藏具体的实现，而向用户提供另外一个计算属性返回 `LazyBox.value`，同时我们将 `LazyBox` 属性设置为私有。

```swift
struct Image {
    // 延迟存储
    private let _metadata = LazyBox<[String:AnyObject]> {
        // 加载图片和解析 metadata，相当占内存
        // ...
        return ...
    }

    var metadata: [String:AnyObject] {
        return _metadata.value
    }
}

let image = Image()
print(image.metadata) // 不报错
```

这样该结构体依旧保留了它的值语义。值类型内部使用引用类型是惯用伎俩，以这种方式实现能够保证值语义。标准库中许多集合类型都是以这种方式实现的。

### 并发性

这种实现方式还存在最后一个潜在问题，也就是未考虑并发性。倘若 `LazyBox.value` 还未完成值计算操作，同时被多个线程访问，那么计算函数就将被执行多次。这些都是你需要避免的情况，万一计算函数会产生副作用或相当耗内存呢，对吧？

我们可以将内部 `_value` 属性的所有读写操作都安排到一个私有串行队列中，这样就能够保证函数仅被执行一次。下面是新的实现方式：

```swift
final class LazyBox<T> {
    init(computation: () -> T) {
        _value = .NotYetComputed(computation)
    }

    private var _value: LazyValue<T>

    /// 所有对于 `_value` 的读写都在这个线程队列中。
    private let queue = dispatch_queue_create(
        "LazyBox._value", DISPATCH_QUEUE_SERIAL)

    var value: T {
        var returnValue: T? = nil
        dispatch_sync(queue) {
            switch self._value {
            case .NotYetComputed(let computation):
                let result = computation()
                self._value = .Computed(result)
                returnValue = result
            case .Computed(let result):
                returnValue = result
            }
        }
        assert(returnValue != nil)
        return returnValue!
    }
}
```

使用这种方式的缺点是每次访问 `value` 时都会造成一个小的性能影响，倘若多个线程同时读取该值时可能引起争用，毕竟它们都要经过同一个串行队列。鉴于每次缓存值被计算后队列中要执行的工作量相当少，在大多数情况中都可以忽略不计。

值得注意的是 Swift 并没有为 `lazy` 关键字提供上述保证。[官方文档](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Properties.html#//apple_ref/doc/uid/TP40014097-CH14-ID257)里是这么说的：

> 注意：倘若一个标记为 lazy 的属性同时被多个线程修改时，且该属性还未进行初始化操作，那么将无法保证该属性仅被初始化一次。

**最新更新：**就在我发布该文章之后的一个小时，[Joe Groff](https://twitter.com/jckarter) 在 Swift evolution 中为属性行为发布了一个影响深远的提议，邮件内容请点击[这里](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20151214/003148.html)，一旦被采纳，将实现我在本文中讨论的内容（且远远不止），并以一个更自然的方式来实现。我强烈建议你看一下。