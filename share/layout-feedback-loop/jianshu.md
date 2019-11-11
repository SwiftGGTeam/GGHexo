调试内存不足问题：使用运行时魔法捕获布局反馈循环"

> 作者：Ruslan Serebriakov，[原文链接](https://www.appcoda.com/layout-feedback-loop/)，原文日期：2019-01-10
> 译者：Sunset Wan；校对：[numbbbbb](http://numbbbbb.com/)，[Nemocdz](https://nemocdz.github.io/)；定稿：[Pancf](https://github.com/Pancf)
  








让我们想象这样一个场景：你有一个很成功的应用程序，这个应用程序有大量的日活用户并且崩溃率为 0。你很开心并且认为生活很美好。但是某天开始，你在应用商店上看到关于应用程序总是崩溃的负面评价。检查 Fabric 也没有起到任何帮助————没有出现新的崩溃记录。那么，这个现象可能是什么原因呢？

答案是内存不足（Out Of Memory），从而导致应用程序运行终止。


当你在终端用户的设备上使用 RAM 时，操作系统可以决定是否为其他进程而回收该内存，并终止你的应用程序。我们把它称作内存不足异常终止。
可能有各种原因：
*  循环引用;
*  竞争条件;
*  废弃的线程;
*  死锁;
*  布局反馈循环。

Apple 提供了很多方法来解决这类问题：
* Instruments 里的 Allocations 和 Leaks 工具用于解决循环引用和 [其他类型的泄漏](https://developer.apple.com/videos/play/wwdc2015/230/)
* 在 Xcode 8 中引入的 [Memory Debugger](https://developer.apple.com/videos/play/wwdc2016/410/) 代替了 Allocations 和 Leaks 的一部分功能
* [Thread Sanitizer](https://developer.apple.com/videos/play/wwdc2016/412/) 帮助你找到竞争条件、废弃的线程或者死锁

## 布局反馈循环
下面我们来讨论下布局反馈循环。它不是一个频繁出现的问题，一旦遇到了，可能让你很头痛。
> 当视图正在运行它们的布局代码，但某种方法导致它们再一次开始布局传递，此时布局反馈循环就会出现。这可能是因为某个视图正在改变某个父视图的大小，或者因为你有一个模棱两可的布局。无论哪种原因，这个问题的表现是你的 CPU 使用被占满和 RAM 使用量稳步上升，因为你的视图正在一次又一次地运行它们的布局代码，却没有返回。
> \- [来自 HackingWithSwift 的 Paul Hudson](https://www.hackingwithswift.com/articles/59/debugging-auto-layout-feedback-loops)

幸运的是，在 WWDC 16 中 Apple 花了整整 15 分钟（！）来介绍“布局反馈循环调试器”。这个调试器有助于识别在调试过程中发生循环的时间点。这就是一个符号断点，它的工作方式非常简单：它会计算在单个 run loop 迭代中调用每个视图上的 `layoutSubviews()` 方法的次数。一旦这个计数值超过某个临界值（比如，100），这个应用程序将会停在这个断点并打印出日志，来帮助你找到根本原因。[这篇文章](https://www.hackingwithswift.com/articles/59/debugging-auto-layout-feedback-loops) 快速地介绍如何使用这个调试器。



这个方法在你可以重现问题的情况下十分有效。但是如果你有几十个屏幕，几百个视图，但应用商店中你的应用程序的评价仅仅是：“这个应用程序糟透了，总是崩溃，再也不用了！”。你希望可以将这些人带到办公室并为他们设置布局反馈循环调试器。虽然因为通用数据保护条例（GDPR），这部分无法完全实现，但是你可以尝试把 `UIViewLayoutFeedbackLoopDebuggingThreshold` 的代码复制到生产代码中。

让我们回顾一下符号断点是如何工作的：它会计算 `layoutSubviews()` 的调用次数并在单个 run loop 迭代中超过某个临界值时发送一个事件。听起来很简单，对吧？

    class TrackableView: UIView {
        var counter: Int = 0
     
        override func layoutSubviews() {
            super.layoutSubviews()
     
            counter += 1;
            if (counter == 100) {
                YourAnalyticsFramework.event(name: "loop")
            }
        }
    }

对于一个视图，这段代码运行正常。但是现在你想要在另一个视图上实现它。当然，你可以创建一个 `UIView` 的子类，在这里实现它并使你项目中的所有视图都继承这个子类。然后为 `UITableView`，`UIScrollView`，`UIStackView` 等做同样的事情。

你希望可以将此逻辑注入你想要的任何类，而无需编写大量重复的代码。这时候就可以借助运行时编程了。

我们会做同样的事情——创建一个子类，重写 `layoutSubviews()` 方法并计算其调用次数。唯一的区别是所有这些都将在运行时完成，而不是在项目中创建重复的类。

让我们开始吧——我们将创建自定义子类，并将原始视图的类更改为新的子类：

    struct LayoutLoopHunter {
     
        struct RuntimeConstants {
            static let Prefix = “runtime”
        }
     
        static func setUp(for view: UIView, threshold: Int = 100, onLoop: @escaping () -> ()) {
            // 我们根据功能的前缀和原始类名为新类创建名称。
            let classFullName = “\(RuntimeConstants.Prefix)_\(String(describing: view.self))”
            let originalClass = type(of: view)
     
            if let trackableClass = objc_allocateClassPair(originalClass, classFullName, 0) {
                // 在当前运行时会话期间尚未创建此类。
                // 注册这个类，并且用原始视图的类来和它交换。
                objc_registerClassPair(trackableClass)
                object_setClass(view, trackableClass)
            } else if let trackableClass = NSClassFromString(classFullName) {
                // 我们之前在此运行时会话中分配了一个具有相同名称的类。
                // 我们可以从原始字符串中获取它，并以相同的方式与我们的视图交换。
                object_setClass(view, trackableClass)
            }
        }
    }

`objc_allocateClassPair()` 方法的文档告诉我们这个方法何时失败：
> 新类，或者如果无法创建类，则为 Nil （例如，所需名称已被使用）。

这就意味着不能拥有两个同名的类。我们的策略是为单个视图类创建一个单独的运行时类。这就是我们在原始类名前加上前缀来形成新类的名称的原因。

现在添加一个计数器到子类中。理论上，有两种方法可以做到这一点。
1. 添加一个保存计数器的属性。
2. 为这个类创建一个关联对象（Associated object）。

但是目前，**只有一个方法奏效**。你可以想象属性是存储在分配给类的内存里的东西，然而关联对象则储存在一个完全不同的地方。因为分配给已存在对象的内存是固定的，所以我们在自定义类上新添加的属性将会从其他资源里“窃取”内存。它可能导致意料之外的行为和难以调试的程序崩溃（点击 [这里](https://stackoverflow.com/questions/3346427/object-setclass-to-bigger-class) 查看更多信息）。但是在使用关联对象的情况下，它们将会存储在运行时创建的一个哈希表里，这是完全安全的。


    static var CounterKey = "_counter"
     
    ...
     
    objc_setAssociatedObject(trackableClass, &RuntimeConstants.CounterKey, 0, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)

当新的子类被创建时，计数器初值设置为 0。接下来，让我们实现这个新的`layoutSubviews()` 方法，并将它添加到我们的类中：

    let layoutSubviews: @convention(block) (Any?) -> () = { nullableSelf in
        guard let _self = nullableSelf else { return }
     
        if let counter = objc_getAssociatedObject(_self, &RuntimeConstants.CounterKey) as? Int {
            if counter == threshold {
                onLoop()
            }
     
            objc_setAssociatedObject(trackableClass, &RuntimeConstants.CounterKey, counter+1, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
        }
    }
    let implementation = imp_implementationWithBlock(layoutSubviews)
    class_addMethod(trackableClass, #selector(originalClass.layoutSubviews), implementation, "v@:")

为了理解上面这段代码实际上在干什么，让我们看一下这个来自 `<objc/runtime.h>` 的结构体：

    struct objc_method {
        SEL method_name;
        char *method_types;
        IMP method_imp;
    }

尽管我们再也不会在 Swift 中直接使用这个结构体，但它很清楚地解释了一个方法实际上是由什么组成的：
* 方法的实现，这是调用方法时要执行的实际函数。它的前两个形参总是方法接收者和消息选择器。
* 包含方法签名的方法类型字符串。你可以在 [这里](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtTypeEncodings.html) 详细了解其格式。但是在现在的情况下，需要明确说明的字符串是 `“v@:”`。作为返回类型，`v` 代表 `void`，而 `@` 和 `:` 分别代表接收者和消息选择器。
* 选择器作为键，用于在运行时查找方法的实现。

你可以把 Witness Table（在其他编程语言中，它也被称作方法派发表）想象成一个简单的字典数据结构。那么选择器为键，且实现部分则为对应的值。
在下面这行代码中:
    class_addMethod(trackableClass,#selector(originalClass.layoutSubviews), implementation, "v@:")
我们所做的是给 `layoutSubviews()` 方法对应的键分配新值。    

这个方法直截了当。我们获得这个计数器，使它的计数值加一。如果计数值超过临界值，我们会发送分析事件，其中包含类名和想要的任何数据体。

让我们回顾一下如何对关联对象实现和使用键：

    static var CounterKey = “_counter”
    ...
     
    objc_setAssociatedObject(trackableClass, &RuntimeConstants.CounterKey, counter+1, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)

为什么我们使用 `var` 来修饰计数器的键这个静态属性并在传递到其他地方时使用引用？答案隐藏在 Swift 语言基础——字符串之中。字符串像其他所有的值类型一样，是按值传递的。那么，当你把它传入这个闭包时，这个字符串将会被复制到一个不同的地址，这会导致在关联对象表中产生一个完全不同的键。`&` 符号总是保证将相同的地址作为键参数的值。你可以尝试以下代码：

    func printAddress(_ string: UnsafeRawPointer) {
        print("\(string)")
    }
    
    let str = "test"
    
    printAddress(str)
    printAddress(str)
    let closure = {
        printAddress(str)
        printAddress(str)
    }
    closure()
    // 最后两个函数调用的地址将始终不同

用引用的方式来传递键的主意总是好的，因为有时，即使你没有使用闭包，变量的地址仍可能因内存管理而更改。在我们例子中，如果你把上面的代码运行多次，即使是前两个 printAddress() 的调用也可能会输出不同的地址。

让我们回到运行时的魔法里来。在新 `layoutSubviews()` 的实现里，还有一件很重要的事情没有完成。这件事是每次重写父类的方法时通常都会做的事情——调用父类实现。`layoutSubviews()` 的文档里提到：
> 在 iOS 5.1 及更早版本中，这个方法的默认实现不执行任何操作。而之后的默认实现会使用你设置的任何约束来确定任何子视图的大小和位置。

为了避免发生一些难以预料的布局行为，我们得调用父类的实现，但这不像平常那样简单明了：

    let selector = #selector(originalClass.layoutSubviews)
    let originalImpl = class_getMethodImplementation(originalClass, selector)
     
    
    // @convention(c) 告知 Swift 这是一个裸函数指针（没有上下文对象）
    // 所有的 Obj-C 方法函数把接收者和消息当作前两个参数
    // 所以这意味着一个类型为 `() -> Void` 的方法，这与 `layoutSubview` 方法相符
    typealias ObjCVoidVoidFn = @convention(c) (Any, Selector) -> Void
    let originalLayoutSubviews = unsafeBitCast(originalImpl, to: ObjCVoidVoidFn.self)
    originalLayoutSubviews(view, selector)

这里实际发生的是：我们检索方法所需的实现部分，并直接从代码中调用它，而不是用常见的方式来调用方法（即执行一个会在 Witness Table 中寻找对应实现的选择器）。

目前为止，让我们看看实现部分：

    static func setUp(for view: UIView, threshold: Int = 100, onLoop: @escaping () -> ()) {
        // 我们根据功能的前缀和原始类名为新类创建名称
        let classFullName = “\(RuntimeConstants.Prefix)_\(String(describing: view.self))”
        let originalClass = type(of: view)
    
        if let trackableClass = objc_allocateClassPair(originalClass, classFullName, 0) {
            // 在当前运行时会话期间尚未创建此类
            // 注册这个类并将其与原始视图的类交换
            objc_registerClassPair(trackableClass)
            object_setClass(view, trackableClass)
    
            // 现在可以创建关联对象
            objc_setAssociatedObject(view, &RuntimeConstants.CounterKey, 0, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
    
            // 添加我们自己 layoutSubviews 的实现
            let layoutSubviews: @convention(block) (Any?) -> () = { nullableSelf in
                guard let _self = nullableSelf else { return }
    
                let selector = #selector(originalClass.layoutSubviews)
                let originalImpl = class_getMethodImplementation(originalClass, selector)
    
            
                // @convention(c) 告知 Swift 这是一个裸函数指针（没有上下文对象）
                // 所有的 Obj-C 方法函数把接收者和消息当作前两个参数
                // 所以这意味着一个类型为 `() -> Void` 的方法，这与 `layoutSubview` 方法相符
                typealias ObjCVoidVoidFn = @convention(c) (Any, Selector) -> Void
                let originalLayoutSubviews = unsafeBitCast(originalImpl, to: ObjCVoidVoidFn.self)
                originalLayoutSubviews(view, selector)
    
                if let counter = objc_getAssociatedObject(_self, &RuntimeConstants.CounterKey) as? Int {
                    if counter == threshold {
                        onLoop()
                    }
    
                    objc_setAssociatedObject(view, &RuntimeConstants.CounterKey, counter+1, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
                }
            }
            let implementation = imp_implementationWithBlock(layoutSubviews)
            class_addMethod(trackableClass, #selector(originalClass.layoutSubviews), implementation, “v@:“)
        } else if let trackableClass = NSClassFromString(classFullName) {
            // 我们之前在此运行时会话中分配了一个具有相同名称的类
            // 我们可以从原始字符串中获取它，并以相同的方式与我们的视图交换
            object_setClass(view, trackableClass)
        }
    }

让我们为视图创建模拟布局循环，并为其设置计数器来进行测试：
    class ViewController: UIViewController {
        override func viewDidLoad() {
            super.viewDidLoad()
     
            LayoutLoopHunter.setUp(for: view) {
                print("Hello, world")
            }
        }
     
        override func viewDidLayoutSubviews() {
            super.viewDidLayoutSubviews()
            view.setNeedsLayout() // loop creation
        }
    }
是不是忘记了什么事情？让我们再次回顾一下 `UIViewLayoutFeedbackLoopDebuggingThreshold` 断点的工作原理：
> 在确认为反馈循环之前，定义某个视图的子视图在单个 run loop 里必须布局的次数

我们从未把“单个 run loop ”这一条件考虑进来。如果视图在屏幕上停留了相当长的时间，并经常被反复布局，计数器迟早会超过临界值。但这可不是因为内存的问题。

我们该怎么解决这个问题呢？只需在每次 run loop 迭代时重置计数器。为了做到这一点，我们可以创建一个 [**DispatchWorkItem**](https://www.appcoda.com/grand-central-dispatch/)，它重置计数器，并在主队列上异步传递它。通过这种方式，它会在 run loop 下一次进入主线程时被调用：

    static var ResetWorkItemKey = “_resetWorkItem”
     
    ...
     
    if let previousResetWorkItem = objc_getAssociatedObject(view, &RuntimeConstants.ResetWorkItemKey) as? DispatchWorkItem {
        previousResetWorkItem.cancel()
    }
    let currentResetWorkItem = DispatchWorkItem { [weak view] in
        guard let strongView = view else { return }
        objc_setAssociatedObject(strongView, &RuntimeConstants.CounterKey, 0, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
    }
    DispatchQueue.main.async(execute: currentResetWorkItem)
    objc_setAssociatedObject(view, &RuntimeConstants.ResetWorkItemKey, currentResetWorkItem, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)

最终的代码：

    struct LayoutLoopHunter {
     
        struct RuntimeConstants {
            static let Prefix = “runtime”
     
            // Associated objects keys
            // 关联对象键
            static var CounterKey = “_counter”
            static var ResetWorkItemKey = “_resetWorkItem”
        }
     
        static func setUp(for view: UIView, threshold: Int = 100, onLoop: @escaping () -> ()) {
            // 我们根据功能的前缀和原始类名为新类创建名称。
            let classFullName = “\(RuntimeConstants.Prefix)_\(String(describing: view.self))”
            let originalClass = type(of: view)
     
            if let trackableClass = objc_allocateClassPair(originalClass, classFullName, 0) {
                // 在当前运行时会话期间尚未创建此类。
                // 注册这个类，并且用原始视图的类来和它交换。
                objc_registerClassPair(trackableClass)
                object_setClass(view, trackableClass)
     
                // 现在可以创建关联对象
                objc_setAssociatedObject(view, &RuntimeConstants.CounterKey, 0, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
     
                // 添加我们自己 layoutSubviews 的实现
                let layoutSubviews: @convention(block) (Any?) -> () = { nullableSelf in
                    guard let _self = nullableSelf else { return }
     
                    let selector = #selector(originalClass.layoutSubviews)
                    let originalImpl = class_getMethodImplementation(originalClass, selector)
     
                    // @convention(c) 告知 Swift 这是一个裸函数指针（没有上下文对象）
                    // 所有的 Obj-C 方法函数把接收者和消息当作前两个参数
                    // 所以这意味着一个类型为 `() -> Void` 的方法，这与 `layoutSubview` 方法相符
                    typealias ObjCVoidVoidFn = @convention(c) (Any, Selector) -> Void
                    let originalLayoutSubviews = unsafeBitCast(originalImpl, to: ObjCVoidVoidFn.self)
                    originalLayoutSubviews(view, selector)
     
                    if let counter = objc_getAssociatedObject(_self, &RuntimeConstants.CounterKey) as? Int {
                        if counter == threshold {
                            onLoop()
                        }
     
                        objc_setAssociatedObject(view, &RuntimeConstants.CounterKey, counter+1, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
                    }
     
                    // 为重置计数器，在每个新的 run loop 遍历中分发 work item
                    if let previousResetWorkItem = objc_getAssociatedObject(view, &RuntimeConstants.ResetWorkItemKey) as? DispatchWorkItem {
                        previousResetWorkItem.cancel()
                    }
                    let counterResetWorkItem = DispatchWorkItem { [weak view] in
                        guard let strongView = view else { return }
                        objc_setAssociatedObject(strongView, &RuntimeConstants.CounterKey, 0, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
                    }
                    DispatchQueue.main.async(execute: counterResetWorkItem)
                    objc_setAssociatedObject(view, &RuntimeConstants.ResetWorkItemKey, counterResetWorkItem, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
                }
                let implementation = imp_implementationWithBlock(layoutSubviews)
                class_addMethod(trackableClass, #selector(originalClass.layoutSubviews), implementation, “v@:“)
            } else if let trackableClass = NSClassFromString(classFullName) {
                // 我们之前在此运行时会话中分配了一个具有相同名称的类。
                // 我们可以从原始字符串中获取它，并以相同的方式与我们的视图交换。
                object_setClass(view, trackableClass)
            }
        }
    }

## 结论
是的！现在你可以为所有可疑的视图设置分析事件了，发布应用程序，并找到这个问题的确切出处。你可以把这个问题的范围缩小到某个特定的视图，并在用户不知情的情况下借助于他们来解决这个问题。

最后要提到的一件事是：能力越大责任越大。运行时编程非常容易出错，因此很容易在不知情的情况下为应用程序引入另一个严重的问题。这就是为什么总是建议将应用程序中的所有危险代码包装在某种可停止开关中，因为你可以在发现代码导致问题时从后端触发开关禁用该功能。这有一篇介绍 Firebase 的 Feature Flags 的 [好文章](https://medium.com/@rwbutler/feature-flags-a-b-testing-mvt-on-ios-718339ac7aa1)

完整代码可以从这个 [GitHub 仓库](https://github.com/rsrbk/LayoutLoopHunter) 里获取，并且也将会发布到 CocoPods 上，以跟踪项目中的布局循环。

附：我想特别感谢 [Aleksandr Gusev](https://github.com/sanekgusev) 帮助审阅并且为本文提供了很多意见。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。