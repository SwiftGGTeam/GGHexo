要不要来点 Swift

> 作者：Jacob Bandes-Storch，[原文链接](http://bandes-stor.ch/blog/2015/11/28/help-yourself-to-some-swift/)，原文日期：2015-11-28
> 译者：[mmoaay](http://blog.csdn.net/mmoaay)；校对：[千叶知风](http://weibo.com/xiaoxxiao)；定稿：[shanks](http://codebuild.me/)
  









做程序员有一点优势：如果工具不好用，你自己就可以对它进行优化。而 Swift 让这一点变得尤其简单，它包含的几个特性可以让你以一种自然的方式对这门语言进行扩展和自定义。

在本文中，我将分享 Swift 给我编程体验带来提升的几个例子。我希望在读了本文之后，你可以认识到使用这门语言时你自己的痛点在哪，并付诸实践。（当然需要先思考！）



# 存在争议的重复标识符

下面是你在 `Objective-C` 中很熟悉的一种情况：枚举值和字符串常量会有很长的描述详细的名字：

    label.textAlignment = NSTextAlignmentCenter;

（这让我想起了中学科学课的格言：在作答时重复一下问题，或者 RQIA，*文字是怎么对齐的？文字是居中对齐的。* 这在作答方式在超出上下文环境的时候很有用，但是其他情况下就显得比较冗余了。）

Swift 减少了这种冗余，因为枚举值可以通过类型名＋点符号来访问，而且如果你省略了类型名，它仍然可以被自动推断出来：

    
    label.textAlignment = NSTextAlignment.Center
    
    // 更简明的:
    label.textAlignment = .Center

但有时候你用的不是枚举，而是被一个又臭又长的构造器给困住了。

    animation.timingFunction = CAMediaTimingFunction(name: kCAMediaTimingFunctionEaseInEaseOut)

有多少 “timingFunction” 呢？太多了好嘛。

一个不那么为人所知的事实是，缩写点符号对任何类型的*任何* `static` 成员都有效。结合在 `extension` 中添加自定义 `property` 的能力，我们得到如下代码…

    extension CAMediaTimingFunction
    {
        // 这个属性会在第一次被访问时初始化。
        // (需要添加 @nonobjc 来防止编译器
        //  给 static（或者 final）属性生成动态存取器。)
        @nonobjc static let EaseInEaseOut = CAMediaTimingFunction(name: kCAMediaTimingFunctionEaseInEaseOut)
    
        // 另外一个选择就是使用计算属性, 它同样很有效,
        // 但 *每次* 被访问时都会重新求值：
        static var EaseInEaseOut: CAMediaTimingFunction {
            // .init 是 self.init 的简写
            return .init(name: kCAMediaTimingFunctionEaseInEaseOut)
        }
    }

现在我们得到了一个优雅的简写：

    
    animation.timingFunction = .EaseInEaseOut

## `Context` 中的重复标识符

用来处理 `Core Graphics Context`、颜色空间等的代码往往也是冗长的。

    CGContextSetFillColorWithColor(UIGraphicsGetCurrentContext(),
        CGColorCreate(CGColorSpaceCreateWithName(kCGColorSpaceGenericRGB), [0.792, 0.792, 0.816, 1]))

再次使用棒棒的 `extension`：

    
    extension CGContext
    {
        static func currentContext() -> CGContext? {
            return UIGraphicsGetCurrentContext()
        }
    }
    
    extension CGColorSpace
    {
        static let GenericRGB = CGColorSpaceCreateWithName(kCGColorSpaceGenericRGB)
    }
    
    CGContextSetFillColorWithColor(.currentContext(),
        CGColorCreate(.GenericRGB, [0.792, 0.792, 0.816, 1]))

更简单了是不？而且显然会有[更多的方式](https://developer.apple.com/videos/play/wwdc2015-408/)对 `Core Graphics` 类型进行扩展，以使其适应你的需求。

## Auto Layout 中的重复标识符

下面的代码看起来熟悉么？

    spaceConstraint = NSLayoutConstraint(
        item: label,
        attribute: .Leading,
        relatedBy: .Equal,
        toItem: button,
        attribute: .Trailing,
        multiplier: 1, constant: 20)
    widthConstraint = NSLayoutConstraint(
        item: label,
        attribute: .Width,
        relatedBy: .LessThanOrEqual,
        toItem: nil,
        attribute: .NotAnAttribute,
        multiplier: 0, constant: 200)
    
    spaceConstraint.active = true
    widthConstraint.active = true

理解起来相当困难，是么？Apple 认识到这是个普遍存在的问题，所以重新设计了新的 `NSLayoutAnchor` API（在 iOS9 和 OS X 10.11 上适用）来处理这个问题：

    
    spaceConstraint = label.leadingAnchor.constraintEqualToAnchor(button.trailingAnchor, constant: 20)
    widthConstraint = label.widthAnchor.constraintLessThanOrEqualToConstant(200)
    spaceConstraint.active = true
    widthConstraint.active = true

然而，我认为还可以做的更好。在我看来，下面的代码比内置的接口更容易阅读和使用：

    
    spaceConstraint = label.constrain(.Leading, .Equal, to: button, .Trailing, plus: 20)
    widthConstraint = label.constrain(.Width, .LessThanOrEqual, to: 200)
    
    // "设置 label 的 leading edge 和 button 的 trailing edge 相距 20"
    // "设置 label 的 width 小于等于 200。"

上面的代码是通过给 `UIView` 或者 `NSView` 添加一些 `extension` 来实现的。这些辅助函数看起来可能会有些拙劣，但是用起来会特别方便，而且很容易维护。（这里我已经提供了另外一些包含默认值的参数——一个 `multiplier`，`priority` 和 `identifier` ——所以你可以选择更进一步滴进行自定义约束。）

    
    extension UIView
    {
        func constrain(
            attribute: NSLayoutAttribute,
            _ relation: NSLayoutRelation,
            to otherView: UIView,
            _ otherAttribute: NSLayoutAttribute,
            times multiplier: CGFloat = 1,
            plus constant: CGFloat = 0,
            atPriority priority: UILayoutPriority = UILayoutPriorityRequired,
            identifier: String? = nil)
            -> NSLayoutConstraint
        {
            let constraint = NSLayoutConstraint(
                item: self,
                attribute: attribute,
                relatedBy: relation,
                toItem: otherView,
                attribute: otherAttribute,
                multiplier: multiplier,
                constant: constant)
            constraint.priority = priority
            constraint.identifier = identifier
            constraint.active = true
            return constraint
        }
        
        func constrain(
            attribute: NSLayoutAttribute,
            _ relation: NSLayoutRelation,
            to constant: CGFloat,
            atPriority priority: UILayoutPriority = UILayoutPriorityRequired,
            identifier: String? = nil)
            -> NSLayoutConstraint
        {
            let constraint = NSLayoutConstraint(
                item: self,
                attribute: attribute,
                relatedBy: relation,
                toItem: nil,
                attribute: .NotAnAttribute,
                multiplier: 0,
                constant: constant)
            constraint.priority = priority
            constraint.identifier = identifier
            constraint.active = true
            return constraint
        }
    }

# 你好～操作符

首先我必须提醒一下：如果要使用自定义操作符，一定要**三思而后行**。使用它们很简单，但最终可能会得到一堆像屎一样的代码。一定要对代码的健康性持怀疑态度，然后你会发现在某些场景下，自定义操作符确实是很有用的。

## 重载它们

如果你有开发过拖动手势相关的功能，你可能会写过类似下面的代码：

    
    // 触摸开始 / 鼠标按下:
    
    let touchPos = touch.locationInView(container)
    objectOffset = CGPoint(x: object.center.x - touchPos.x, y: object.center.y - touchPos.y)
    
    // 触摸移动 / 鼠标拖动:
    
    let touchPos = touch.locationInView(container)
    object.center = CGPoint(x: touchPos.x + objectOffset.x, y: touchPos.y + objectOffset.y)

在这段代码里面我们只做了简单的加法和减法，但因为 `CGPoint` [包含](https://en.wikipedia.org/wiki/User:Giraffedata/comprised_of) `x` 和 `y`，所以每个表达式我们都要写两次。所以我们需要一些简化操作的函数。

`objectOffset` 代表触摸位置和对象位置的距离。描述这种距离最好的方式并不是 `CGPoint`，而是不那么为人所知的 [CGVector](https://developer.apple.com/library/ios/documentation/GraphicsImaging/Reference/CGGeometry/#//apple_ref/c/tdef/CGVector)， 它不使用 `x` 和 `y`，而是用 `dx` 和 `dy` 来表示距离或者 “deltas“。

![这里写图片描述](http://swift.gg/img/articles/help-yourself-to-some-swift/201512151428497511452821418.99237)

所以两个点相减得到一个向量就比较符合逻辑了，这样一来我们就得到了 `-` 操作符的一个重载：

    
    /// - 返回: 从 `rhs` 到 `lhs`的向量。
    func -(lhs: CGPoint, rhs: CGPoint) -> CGVector
    {
        return CGVector(dx: lhs.x - rhs.x, dy: lhs.y - rhs.y)
    }

然后，相反滴，把一个向量和一个点相加得到另外一个点：

    
    // - 返回: `lhs` 偏移`rhs` 之后得到的一个点
    func +(lhs: CGPoint, rhs: CGVector) -> CGPoint
    {
        return CGPoint(x: lhs.x + rhs.dx, y: lhs.y + rhs.dy)
    }

现在下面的代码看起来就感觉很好了！

    
    // 触摸开始:
    objectOffset = object.center - touch.locationInView(container)
    
    // 触摸移动:
    object.center = touch.locationInView(container) + objectOffset

> 练习：想一想其它可以用在点和向量上的操作符，并对它们进行重载。
> 建议：`-(CGPoint, CGVector)`、`*(CGVector, CGFloat)` 和 `-(CGVector)`。

## 独门绝技

下面是一些更有创造性的内容。Swift 提供了一些*复合赋值操作符*，这些操作符在执行某个操作的同时进行赋值：

    
    a += b   // 等价于 "a = a + b"
    a %= b   // 等价于 "a = a % b"

但是仍然存在其它不包含内置复合赋值形式的操作符。最常见的例子就是 `??`，空合并运算符。也就是 [Ruby 中的 `||=`](http://ruby-doc.org/docs/ruby-doc-bundle/Manual/man-1.4/syntax.html#assign)，例如，首先实现只有在变量是 `nil` （或者不是）的情况下才赋值的版本。这对 Swift 中的可选值意义非凡，而且实现起来也很简单：

    
    infix operator ??= { associativity right precedence 90 assignment } // 匹配其它的赋值操作符
    
    /// 如果 `lhs` 为 `nil`, 把 `rhs` 的值赋给它
    func ??=<T>(inout lhs: T?, @autoclosure rhs: () -> T)
    {
        lhs = lhs ?? rhs()
    }

这段代码看起来可能很复杂——这里我们做了下面几件事情。

 - `infix operator` 声明用来告诉 Swift 把 `??=` 当作一个操作符。
 - 使用 `<T>` 将函数泛型化，从而使其可以支持任何类型的值。
 - `inout` 表示允许修改左侧的运算数
 - `@autoclosure` 用来支持[短路赋值](https://en.wikipedia.org/wiki/Short-circuit_evaluation)，有需要的话可以只对右侧做赋值操作。（着也依赖于 `??` 本身对短路的支持。）

但在我看来，上述代码实现的功能是非常清晰而且易用的：

    
    a ??= b   // 等价于 "a = a ?? b"

# 调度

> 关于如何在 Swift 中使用 GCD，最好的方式是阅读官方文档，但在本文中我仍然会介绍一些基础知识点。如果想了解更多，请参照[这份概要](https://gist.github.com/jtbandes/a5ce62019585dd4f998e)。

Swift 2 引入了[协议扩展](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Protocols.html#//apple_ref/doc/uid/TP40014097-CH25-ID521)，因此，很多之前的全局标准库函数变成了准成员函数：如 `map(seq, transform)`  变成了现在的 `seq.map(transform)`，`join(separator, seq)` 变成了现在的 `seq.joinWithSeparator(separator)`  等等。这样的话，那些*严格说来*不属于类实例方法的函数仍然可以用 `.` 符号访问，而且还减少了逗号（PS：原文为parentheses，可能是作者笔误）的数目，从而不会把代码弄得[太乱](https://xkcd.com/297/)。

然而这种变化并没有应用到 Swift 标准库外的自由函数，比如 `dispatch_async()` 和 `UIImageJPEGRepresentation()`。这些函数仍然很难用，如果你经常使用它们，还是很值得思考一下如何利用 Swift 来帮你改造一下它们。下面是一些入门的 GCD 例子。

## `sync` 或者非 `sync`

这些都很简单；我们马上开始：

    
    extension dispatch_queue_t
    {
        final func async(block: dispatch_block_t) {
            dispatch_async(self, block)
        }
        
        // 这里的 `block` 需要是 @noescape 的, 但不能是链接中这样的： <http://openradar.me/19770770>
        final func sync(block: dispatch_block_t) {
            dispatch_sync(self, block)
        }
    }

上面简化的两个函数直接调用了普通的调度函数，但可以让我们通过 `.` 符号调用它们，这是我们之前做不到的。

> 注：GCD 对象是以一种古怪的方式导出到 Swift 的，尽管以类的方式也可以实现，但实际上 `dispatch_queue_t` 只是一个协议而已。在这里我把两个函数都标注了 `final` 来表明我们的意图：我们不希望在这里使用动态调度，尽管在我看来这种情况下使用协议扩展是很好的，[但是不要在哪都用。](http://nomothetis.svbtle.com/the-ghost-of-swift-bugs-future)

    
    mySerialQueue.sync {
        print("I’m on the queue!")
        threadsafeNum++
    }
    
    dispatch_get_global_queue(QOS_CLASS_BACKGROUND, 0).async {
        expensivelyReticulateSplines()
        print("Done!")
        
        dispatch_get_main_queue().async {
            print("Back on the main queue.")
        }
    }

更进一步的 `sync` 的版本是从 Swift 标准库函数中的 `with*` 家族获取到的灵感，我们要做的事情是返回一个在闭包中计算得到的结果：

    
    extension dispatch_queue_t
    {
        final func sync<Result>(block: () -> Result) -> Result {
            var result: Result?
            dispatch_sync(self) {
                result = block()
            }
            return result!
        }
    }
    
    // 在串行队列上抓取一些数据
    let currentItems = mySerialQueue.sync {
        print("I’m on the queue!")
        return mutableItems.copy()
    }

## 群体思维

另外两个简单的扩展可以让我们很好的使用 [`dispatch group`](https://developer.apple.com/library/ios/documentation/General/Conceptual/ConcurrencyProgrammingGuide/OperationQueues/OperationQueues.html#//apple_ref/doc/uid/TP40008091-CH102-SW30)：

    
    extension dispatch_queue_t
    {
        final func async(group: dispatch_group_t, _ block: dispatch_block_t) {
            dispatch_group_async(group, self, block)
        }
    }
    
    extension dispatch_group_t
    {
        final func waitForever() {
            dispatch_group_wait(self, DISPATCH_TIME_FOREVER)
        }
    }

现在调用 `async` 的时候就可以包含一个额外的 `group` 参数了。

    
    let group = dispatch_group_create()
    
    concurrentQueue.async(group) {
        print("I’m part of the group")
    }
    
    concurrentQueue.async(group) {
        print("I’m independent, but part of the same group")
    }
    
    group.waitForever()
    print("Everything in the group has now executed")

> 注：我们可以很简单滴选择 `group.async(queue)` 或者 `queue.async(group)`。具体用哪个全看你自己——或者你甚至可以两个都实现。

# 优雅的重定义

如果你的项目同时包含 Objective-C 和 Swift，你可能会碰到这种让人头大的情况：Obj-C 的 API 看起来不是那么 Swift 化。需要 `NS_REFINED_FOR_SWIFT` 来拯救我们了。

在 Obj-C 中使用标记了 [(new in Xcode 7) ](https://developer.apple.com/library/ios/releasenotes/DeveloperTools/RN-Xcode/Chapters/xc7_release_notes.html) 宏的函数、方法和变量是正常的，但是导出到 Swift 之后，它们会包含一个 “`__`“前缀。

    @interface MyClass : NSObject
    
    /// @返回 @c 东西的下标, 如果没有提供就返回 NSNotFound。
    - (NSUInteger)indexOfThing:(id)thing NS_REFINED_FOR_SWIFT;
    
    @end
    
    // 当导出到 Swift 时, 它就变成了:
    
    public class MyClass: NSObject
    {
        public func __indexOfThing(thing: AnyObject) -> UInt
    }

现在把 Obj-C 的方法放到一边，你可以重用同样的名字来提供一个更友好的 Swift 版本 API（实现方式通常是调用带“`__`“前缀的原始版本）：

    
    extension MyClass
    {
        /// - 返回: 给定 `thing` 的下标, 如果没有就返回 `nil`。
        func indexOfThing(thing: AnyObject) -> Int?
        {
            let idx = Int(__indexOfThing(thing)) // 调用原始方法
            if idx == NSNotFound { return nil }
            return idx
        }
    }

现在你可以心满意足滴 “`if let`“了！

# 更进一步

Swift 还很年轻，它各个代码库的风格也都是不同的。而大量的第三方微型库也涌现出来，这些库的代码体现了作者在操作符，辅助函数和命名规范上所持的不同观点。这种情况也就需要在处理依赖关系以及在团队中建立规范时更挑剔。

使用本文中技术最重要的原因不是写最新潮和最酷炫的 Swift 代码。当然，负责维护你代码的人——也许是未来的你——可能会持不同的观点。为了他们，亲爱的读者，你需要在为了让代码变的清晰合理的情况下扩展 Swift，而不是为了让代码变的简单而去扩展它。

译者：[Playground已经上传到github！](https://github.com/mmoaay/MBPlayGroundForSwiftGG/tree/master/HelpYourselfToSomeSwiftPlayground.playground)
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。