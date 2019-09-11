title: "在 Swift 2.0 当中使用 C 语言回调"
date: 2015-11-11 09:00:00
tags: [Swift 进阶]
categories: [Ole Begemann]
permalink: c-callbacks-in-swift

---
原文链接=http://oleb.net/blog/2015/06/c-callbacks-in-swift/
作者=Ole Begemann  
原文日期=2015-06-22
译者=小锅
校对=shanks
定稿=shanks

<!--此处开始正文-->

> 更新:

* 2015-06-25
增加关于传递另一个（可以捕获外部变量的）闭包到 `userInfo` 参数的备注。

* 2015-07-01
针对 Xcode 7 beta 2 更新从 `CGPathElement` 创建一个 `PathElement` 类型的代码。

几年前，我曾经写过一篇关于如何获取 `CGPath` 和 `UIBezierPath` 中元素的[文章][1]。可以通过调用 [CGPathApply][2] 函数，并给这个函数传入一个回调的函数指针来达到这个目的。 随后 `CGPathApply` 会对 path(CGPath 或 UIBezierPath) 中的每一个元素调用这个回调函数。  

<!--more-->

很不幸，我们无法在 Swift 1.x 中做到这件事，因为我们没办法将 Swift 函数桥接到 C 语言函数。我们需要使用 C 或者 Objective-C 写一个小小的包装层来对这个回调函数进行封装。

而在 Swift 2 当中，可以直接使用原生的 Swift 来完成这件事。Swift 将 C 语言的函数指针[作为闭包来导入][3]。在任何需要传入 C 语言函数指针的地方，我们都可以传入与该函数指针参数相匹配的 Swift 闭包或者函数 —— 除了一个特殊情况：与闭包不同的是，C 语言的函数指针没有捕获状态(capturing state)的概念。因此，编译器只允许传入不捕获任何外部变量的 Swift 闭包来对C语言函数指针进行桥接。Swift 使用了新的 `@convention(c)` 注解来标识这一约定。

> 下载本篇文章的[playground][4]，要求 Swift 2/Xcode 7。

## 获取 UIBezierPath 中的元素

让我们使用迭代一个 path 中元素这个熟悉的任务来作为例子。

### 一个 Swift 化后的数据结构

首先，考虑一下我们必须处理的数据结构。`CGPathApply` 会将一个 [CGPathElement][5] 的指针传递给回调函数（或者闭包）。`CGPathElement` 是一个结构体，这个结构体包含了一个标识 path 元素类型的的常量，以及一个 `CGPoint` 类型的C语言数组。这个数组中的点(point)的个数将在 0 到 3 之间，取决于元素的类型。

在 Swift 当中直接使用 `CGPathElement` 很不方便。C语言数组在 Swift 中是被当作 `UnsafeMutablePointer<CGPoint>` 来导入的，并且它的生命周期被限制在该回调函数中，因此，如果想在别的地方使用这个数组，我们就得将它的内容复制并保存。更进一步地，如果有一个更安全的方式来获取每个元素中点(point)的个数就更好了。

一个关联了点(point)个数的 Swift 枚举，会是达到这个目的的理想类型。我们同时还要定义一个从 `CGPathElement` 转换的自定义构造器。

```swift
/// A Swiftified representation of a `CGPathElement`
///
/// Simpler and safer than `CGPathElement` because it doesn’t use a
/// C array for the associated points.
public enum PathElement {
    case MoveToPoint(CGPoint)
    case AddLineToPoint(CGPoint)
    case AddQuadCurveToPoint(CGPoint, CGPoint)
    case AddCurveToPoint(CGPoint, CGPoint, CGPoint)
    case CloseSubpath

    init(element: CGPathElement) {
        switch element.type {
        case .MoveToPoint:
            self = .MoveToPoint(element.points[0])
        case .AddLineToPoint:
            self = .AddLineToPoint(element.points[0])
        case .AddQuadCurveToPoint:
            self = .AddQuadCurveToPoint(element.points[0], element.points[1])
        case .AddCurveToPoint:
            self = .AddCurveToPoint(element.points[0], element.points[1], element.points[2])
        case .CloseSubpath:
            self = .CloseSubpath
        }
    }
}
```

接下来，为我们的新数据类型定义一个格式化的输出，这将使我们调试时更加方便：

```swift
extension PathElement : CustomDebugStringConvertible {
    public var debugDescription: String {
        switch self {
        case let .MoveToPoint(point):
            return "\(point.x) \(point.y) moveto"
        case let .AddLineToPoint(point):
            return "\(point.x) \(point.y) lineto"
        case let .AddQuadCurveToPoint(point1, point2):
            return "\(point1.x) \(point1.y) \(point2.x) \(point2.y) quadcurveto"
        case let .AddCurveToPoint(point1, point2, point3):
            return "\(point1.x) \(point1.y) \(point2.x) \(point2.y) \(point3.x) \(point3.y) curveto"
        case .CloseSubpath:
            return "closepath"
        }
    }
}
```

再接再厉，来将 `PathElement` 实现为可比较的(Equatable)（因为我们[始终应该这样做][6]）

```swift
extension PathElement : Equatable { }

public func ==(lhs: PathElement, rhs: PathElement) -> Bool {
    switch(lhs, rhs) {
    case let (.MoveToPoint(l), .MoveToPoint(r)):
        return l == r
    case let (.AddLineToPoint(l), .AddLineToPoint(r)):
        return l == r
    case let (.AddQuadCurveToPoint(l1, l2), .AddQuadCurveToPoint(r1, r2)):
        return l1 == r1 && l2 == r2
    case let (.AddCurveToPoint(l1, l2, l3), .AddCurveToPoint(r1, r2, r3)):
        return l1 == r1 && l2 == r2 && l3 == r3
    case (.CloseSubpath, .CloseSubpath):
        return true
    case (_, _):
        return false
    }
}
```

### 枚举 Path 元素

现在到了有趣的部分了。我们要对 `UIBezierPath` 增加一个名为 `elements` 的计算属性，它会迭代 path 并且返回一个 `PathElement` 类型的数组。我们需要调用 `CGPathApply()` 并传递给它一个闭包参数，它会对每个元素都调用这个闭包。在这个闭包内部，我们需要将 `CGPathElement` 转化为 `PathElement` 并将它存储在一个数组当中。 最后一部分的实现并不像听起来的那么简单，因为 C 函数指针的调用约定不允许我们对外部上下文中的变量进行捕获。

这个 API 的纯 C 实现也面临着同样的问题，因此 `CGPathApply` 接收了一个额外的 `void *` 类型的参数并将这个指针传递给回调函数。这使得调用者可以传递一个任意类型的数据（比如一个指向数组的指针）给回调函数 —— 这正是我们所需要的。

`void *` 类型在 Swift 当中是被作为 [UnsafeMutablePointer<Void>][7] 引入的。我们先创建一个 Swift 数组用于存储 `PathElement` 的值，然后使用 [withUnsafeMutablePointer()][8] 来获得指向这个数组的指针，这个指针会作为参数传递到该函数的闭包中。在该闭包当中，我们就可以开始调用 `CGPathApply`。在 `CGPathApply` 的内部闭包中最后一步是要将 void 指针转型回 `UnsafeMutablePointer<[PathElement]>`，并通过 `memory` 属性来直接获取底层的数组。（注：我不是很确定这是不是将一个数组传递到闭包中的最好方法，如果你知道有更好的方法，请让我知道）

完整的实现看起来是这样子的：

```
extension UIBezierPath {
    var elements: [PathElement] {
        var pathElements = [PathElement]()
        withUnsafeMutablePointer(&pathElements) { elementsPointer in
            CGPathApply(CGPath, elementsPointer) { (userInfo, nextElementPointer) in
                let nextElement = PathElement(element: nextElementPointer.memory)
                let elementsPointer = UnsafeMutablePointer<[PathElement]>(userInfo)
                elementsPointer.memory.append(nextElement)
            }
        }
        return pathElements
    }
}
```

更新：在[苹果开发者论坛中的一个帖子][9]里，苹果员工 Quinn "The Eskimo!" 提出了一个稍微不同的方法：我们可以传递指向另一个闭包的指针给 `userInfo` 参数，而非我们想要操作的数组的指针。因为这个闭包没有被C调用约定所限制，因此它是可以捕获外部变量的。

创建一个闭包的指针会涉及到丑陋的 `@convention(block)` 注解和 `unsafeBitCast` 魔法（或者是将闭包包装到一个包装类型中），我不太确定我是否会喜欢这种形式。不过使用这种方法确实是相当方便的。

## 收尾

现在，我们有了一个包含 path 元素的数组，很自然地，我们会想要将 UIBezierPath 转化成一个序列。这使得用户可以使用 `for-in` 循环来对 path 进行迭代，或者直接对它调用 `map` 或 `filter` 方法。

```swift
extension UIBezierPath : SequenceType {
    public func generate() -> AnyGenerator<PathElement> {
        return anyGenerator(elements.generate())
    }
}
```

最后，这是一个便于 UIBezierPath 调试的格式化输出的实现，这个实现参考了 OS X 上的 NSBezierPath 的输出格式。

```swift
extension UIBezierPath : CustomDebugStringConvertible {
    public override var debugDescription: String {
        let cgPath = self.CGPath;
        let bounds = CGPathGetPathBoundingBox(cgPath);
        let controlPointBounds = CGPathGetBoundingBox(cgPath);

        let description = "\(self.dynamicType)\n"
            + "    Bounds: \(bounds)\n"
            + "    Control Point Bounds: \(controlPointBounds)"
            + elements.reduce("", combine: { (acc, element) in
                acc + "\n    \(String(reflecting: element))"
            })
        return description
    }
}
```

现在用一个示例 path 来进行一下试验：

```swift
let path = UIBezierPath()
path.moveToPoint(CGPoint(x: 0, y: 0))
path.addLineToPoint(CGPoint(x: 100, y: 0))
path.addLineToPoint(CGPoint(x: 50, y: 100))
path.closePath()
path.moveToPoint(CGPoint(x: 0, y: 100))
path.addQuadCurveToPoint(CGPoint(x: 100, y: 100),
    controlPoint: CGPoint(x: 50, y: 200))
path.closePath()
path.moveToPoint(CGPoint(x: 100, y: 0))
path.addCurveToPoint(CGPoint(x: 200, y: 0),
    controlPoint1: CGPoint(x: 125, y: 100),
    controlPoint2: CGPoint(x: 175, y: -100))
path.closePath()
```

![The example path](https://swift.gg/img/articles/c-callbacks-in-swift/uibezierpath-example.png1447203254.48282)

也可以迭代 path 中的每一个元素，然后打印出每个元素的描述(description)字符串：

```swift
for element in path {
    debugPrint(element)
}

/* Output:
0.0 0.0 moveto
100.0 0.0 lineto
50.0 100.0 lineto
closepath
0.0 100.0 moveto
50.0 200.0 100.0 100.0 quadcurveto
closepath
100.0 0.0 moveto
125.0 100.0 175.0 -100.0 200.0 0.0 curveto
closepath
*/
```

或者，我们也可以计算 path 中的闭合路径(closepath)的个数：

```swift
let closePathCount = path.filter {
        element in element == PathElement.CloseSubpath
    }.count
// -> 3
```

## 总结

Swift 2 中自动地将 C 语言函数指针桥接到为闭包。这使得对大量的接收函数指针的 C 语言API 进行操作成为可能（并且相当方便）。因为 C 语言的调用约定，这种类型的闭包无法捕获外部的状态，所以我们经常需要将回调闭包中需要用到的数据通过一个外部的 `void` 类型的指针传入，而这正是很多基于C语言的 API 的做法。在 Swift 当中进行这样的操作会有点绕，不过却是完全可能的。

[1]: http://oleb.net/blog/2012/12/accessing-pretty-printing-cgpath-elements/
[2]: https://developer.apple.com/library/ios/documentation/GraphicsImaging/Reference/CGPath/index.html#//apple_ref/c/func/CGPathApply
[3]: https://developer.apple.com/library/prerelease/ios/documentation/Swift/Conceptual/BuildingCocoaApps/InteractingWithCAPIs.html
[4]: http://oleb.net/media/c-callbacks-in-swift.playground.zip
[5]: https://developer.apple.com/library/ios/documentation/GraphicsImaging/Reference/CGPath/index.html#//apple_ref/c/tdef/CGPathElement
[6]: https://developer.apple.com/videos/wwdc/2015/?id=414
[7]: https://developer.apple.com/library/prerelease/ios/documentation/Swift/Reference/Swift_UnsafeMutablePointer_Structure/
[8]: https://developer.apple.com/library/prerelease/ios/documentation/Swift/Reference/Swift_StandardLibrary_Functions/index.html#//apple_ref/swift/func/s:FSs24withUnsafeMutablePointeru0_rFTRq_FGVSs20UnsafeMutablePointerq__q0__q0_
[9]: https://forums.developer.apple.com/message/15725#15725