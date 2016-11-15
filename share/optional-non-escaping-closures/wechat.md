可选型的非逃逸闭包"

> 作者：Ole Begemann，[原文链接](https://oleb.net/blog/2016/10/optional-non-escaping-closures/)，原文日期：2016/10/10
> 译者：[Cwift](http://blog.csdn.net/cg1991130)；校对：[walkingway](http://chengway.in/)；定稿：[CMB](https://github.com/chenmingbiao)
  









Swift 的闭包分为 **逃逸** 与 **非逃逸** 两种。一个接受[逃逸闭包](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/Closures.html)作为参数的函数，逃逸闭包（可能）会在函数返回之后才被调用————也就是说，闭包逃离了函数的作用域。

逃逸闭包通常与异步控制流相关联，如下例所示：

* 一个函数开启了一个后台任务后立即返回，然后通过一个完成回调（completion handler）报告后台任务的结果。
* 一个视图类把『按钮点击事件执行的操作』封装成一个闭包，并存储为自身的属性。每次用户点击按钮时，都会调用该闭包。闭包会逃离属性的设置器（setter）。
* 你使用 [DispatchQueue.async]() 在派发队列（dispatch queue）上安排了一个异步执行的任务。这个闭包任务的生命周期会比 `async` 的作用域活得更长久。

与之对应的 [DispatchQueue.sync](https://developer.apple.com/reference/dispatch/dispatchqueue/2016081-sync)，它会一直等到任务闭包执行完毕后才返回——闭包永远不会逃逸。[map](https://developer.apple.com/reference/swift/sequence/1641748-map) 以及标准库中其他的序列和数组的算法也是非逃逸的。



## 为什么区分闭包的逃逸性与非逃逸性如此重要？

简单来说，是为了管理内存。一个闭包会强引用它捕获的所有对象————如果你在闭包中访问了当前对象中的任意属性或实例方法，闭包会持有当前对象，因为这些方法和属性都隐性地携带了一个 `self` 参数。

这种方式很容易导致[循环引用](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/AutomaticReferenceCounting.html#//apple_ref/doc/uid/TP40014097-CH20-ID56)，这解释了为什么编译器会要求你在闭包中显式地写出对 `self` 的引用。这迫使你考虑潜在的循环引用，并[使用捕获列表](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/AutomaticReferenceCounting.html#//apple_ref/doc/uid/TP40014097-CH20-ID56)手动处理。

然而，使用非逃逸的闭包不会产生循环引用————编译器可以保证在函数返回时闭包会释放它捕获的所有对象。因此，编译器只要求在逃逸闭包中明确对 `self` 的强引用。显然，使用非逃逸闭包是一个更加愉悦的方案。

使用非逃逸闭包的另一个好处是编译器可以应用更多强有力的性能优化。例如，当明确了一个闭包的生命周期的话，就可以省去一些保留（retain）和释放（release）的调用。此外，如果闭包是一个非逃逸闭包，它的上下文的内存可以保存在栈上而不是堆上————虽然我不确定当前的编译器是否执行了这个优化（[一篇公布于 2016 年 3 月的错误报告](https://bugs.swift.org/browse/SR-904)显示当时并没有执行）。

## 闭包默认是非逃逸的...

从 Swift 3.0 开始，非逃逸闭包变成了[闭包参数的默认形式](https://github.com/apple/swift-evolution/blob/master/proposals/0103-make-noescape-default.md)。如果你想允许一个闭包参数逃逸，需要给这个类型增加一个 `@escaping` 的标注。例如，` DispatchQueue.async `（逃逸）和 `DispatchQueue.sync`（非逃逸）的定义：

    
    class DispatchQueue {
        ...
        func async(/* other params omitted */, execute work: @escaping () -> Void)
        func sync<T>(execute work: () throws -> T) rethrows -> T
    }

在 Swift 3 之前，完全是另外一回事：逃逸是默认状态，你可以添加 `@noescape` 来覆盖此状态。新的行为更好，因为在默认状态下是安全的：遇到有潜在循环引用的情况时，一个方法调用必须显式地予以标注。因此，`@escaping` 标识符还有警示开发者的作用。

##...但是只能作为即时函数的参数

关于非逃逸的闭包有一个默认规则：它只能应用到*即时函数的参数列表位*，也就是说任何作为参数传入的闭包。所有其他类型的闭包都是逃逸的。

### 即时的参数位是什么意思？

让我们看一些示例。最简单的情况就像 map：这个函数接受一个立即执行的闭包参数。正如我们所看到的，这个闭包是一个非逃逸的（我从 map 的真实签名中省略了一些无关、不重要的细节）：

    
    func map<T>(_ transform: (Iterator.Element) -> T) -> [T]

#### 函数类型的变量总是逃逸的

与此相比。即使没有明确的标注，指向/保存函数类型（闭包）的变量或属性，都是自动逃逸的（实际上，如果你显式添加一个 @escaping 也会报错）。这其实很合理，因为赋值给一个变量隐性地允许该值逃逸到变量的作用域中，而非逃逸闭包不允许这种行为。这可能会让人困惑，但一个未做任何标注的闭包在参数列表中与其他任何情况都不同。

#### 可选型的闭包总是逃逸的

更令人惊讶的是，即便闭包被用作参数，但是当闭包被包裹在其他类型（例如元组、枚举的 case 以及可选型）中的时候，闭包仍旧是逃逸的。由于在这种情况下闭包不再是*即时*的参数，它会自动变成逃逸闭包。因此，在 Swift 3.0 中，当你编写一个接受函数类型参数的函数时，该参数不能同时是可选型和非逃逸的。思考下面这个精心设计的例子：函数 `transform` 接受一个整数 n 以及一个可选型的变换函数 f。正常情况下它返回 f(n)，而 f 为空值时返回 n。

    
    /// Applies `f` to `n` and returns the result.
    /// Returns `n` unchanged if `f` is nil.
    func transform(_ n: Int, with f: ((Int) -> Int)?) -> Int {
        guard let f = f else { return n }
        return f(n)
    }
这里函数 f 是逃逸的，因为 ` ((Int) -> Int)?` 是 `Optional<(Int) -> Int>` 的缩写，即函数类型不在一个即时参数位上。

#### 将可选参数替换为默认实现

Swift 团队已经[意识到了这个问题](https://bugs.swift.org/browse/SR-2444)，并且会在将来的版本中解决它。在那之前，对这个问题有一定了解是非常重要的。目前没有办法让一个可选型的闭包变成非逃逸的，但是在许多情况下，你可以通过为闭包提供一个默认值的方式来避免使用可选型参数。在我们的例子中，默认值是一个特定的函数，返回一个不可变的参数：

    
    /// Uses a default implementation for `f` if omitted
    func transform(_ n: Int, with f: (Int) -> Int = { $0 }) -> Int {
        return f(n)
    }

#### 使用重载提供一个可选型和一个非逃逸的变体

如果不能提供默认值，Michael Ilseman 建议使用[重载解决](https://lists.swift.org/pipermail/swift-users/Week-of-Mon-20160912/003300.html)————你可以编写两个版本的方法，一个带有可选型（逃逸）函数参数，另一个带有非可选型的非逃逸参数：

    
    // Overload 1: optional, escaping
    func transform(_ n: Int, with f: ((Int) -> Int)?) -> Int {
        print("Using optional overload")
        guard let f = f else { return n }
        return f(n)
    }
    
    // Overload 2: non-optional, non-escaping
    func transform(_ input: Int, with f: (Int) -> Int) -> Int {
        print("Using non-optional overload")
        return f(input)
    }
我添加了一些打印语句来演示哪个函数被调用。用不同的参数来测试一下。不出意外，当你传入 `nil`，类型检查器选择第一个重载的版本，因为只有它兼容输入的参数类型：

    swfit
    transform(10, with: nil) // → 10
    // Using optional overload

如果你传递一个可选函数类型的闭包，同样如此：

    
    let f: ((Int) -> Int)? = { $0 * 2 }
    transform(10, with: f) // → 20
    // Using optional overload
即便变量的值不是可选型的，Swift 依旧选择第一个版本的重载。这是因为存储在变量中的函数是自动逃逸的，因此与期望传入非逃逸参数的第二个重载版本不兼容：

    
    let g: (Int) -> Int = { $0 * 2 }
    transform(10, with: g) // → 20
    // Using optional overload

但是，当你传递一个闭包的表达式，即函数字面量到相应的位置时，情况会变得不一样。此时会选择第二个非逃逸的版本：

    
    transform(10) { $0 * 2 } // → 20
    // Using non-optional overload
现在使用字面量的闭包表达式来调用高阶函数的方式已经习以为常，所以在大多数情况下你都可以选用这个令人愉悦的方式（即非逃逸，不需要担心循环引用），同时仍然可以选择传入 `nil`。如果你决定这么做，一定要在文档中明确标注你需要两个重载的理由。

#### 类型别名总是逃逸的

最后要注意的是，在 Swift 3.0 中，你不能向 `typealiases` 中添加逃逸或者非逃逸的标注。如果你在函数声明中对一个函数类型的参数使用了类型别名（typealias），这个参数总会被视为逃逸的。这个 bug 已经在主分支上修复了，应该会出现在下一个 release 版本中。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。