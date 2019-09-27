Never"

> 作者：Mattt，[原文链接](https://nshipster.com/never/)，原文日期：2018-07-30
> 译者：[雨谨](https://github.com/mobilefellow)；校对：[numbbbbb](http://numbbbbb.com/)，[wongzigii](https://github.com/wongzigii)，Firecrest；定稿：[CMB](https://github.com/chenmingbiao)
  









`Never` 是一个约定，表示一件事在过去或未来的任何时段都不会发生。它是时间轴上的一种逻辑上的不可能，在任何方向延展开去都没有可能。这就是为什么在代码中看到 [这样的注释](https://github.com/search?q=%22this+will+never+happen%22&type=Code) 会特别让人不安。



    
    // 这个不会发生

所有编译器的教科书都会告诉你，这样一句注释不能也不会对编译出的代码产生任何影响。[墨菲定理](https://en.wikipedia.org/wiki/Murphy%27s_law) 告诉你并非如此，注释以下的代码一定会被触发。

那 Swift 是如何在这种无法预测的、混乱的开发过程中保证安全呢？答案难以置信：“**什么都不做**”，以及“**崩溃**”。

---

使用 `Never` 替换 `@noreturn` 修饰符，是由 [Joe Groff](https://github.com/jckarter) 在 [SE-0102: “Remove @noreturn attribute and introduce an empty Never type”](https://github.com/apple/swift-evolution/blob/master/proposals/0102-noreturn-bottom-type.md) 中提出的。

在 Swift 3 之前，那些要中断执行的函数，比如 `fatalError(_:file:line:)`，`abort()` 和 `exit(_:)`，需要使用 `@noreturn` 修饰符来声明，这会告诉编译器，执行完成后不用返回调用这个函数的位置。

    
    // Swift < 3.0
    @noreturn func fatalError(_ message: () -> String = String(),
                                   file: StaticString = #file,
                                   line: UInt = #line)

从 Swift 3 开始，`fatalError` 和它的相关函数都被声明为返回 `Never` 类型。

    
    // Swift >= 3.0
    func fatalError(_ message: @autoclosure () -> String = String(),
                         file: StaticString = #file,
                         line: UInt = #line) -> Never

作为一个注释的替代品，它肯定是很复杂的，对吗？NO！事实上，恰恰相反，`Never` 可以说是整个 Swift 标准库中最简单的一个类型：

    
    enum Never {}

## 无实例类型（`Uninhabited Types`）

`Never` 是一个_无实例_（_Uninhabited_）类型，也就是说它没有任何值。或者换句话说，无实例类型是无法被构建的。

在 Swift 中，没有定义任何 `case` 的枚举是最常见的一种无实例类型。跟结构体和类不同，枚举没有初始化方法。跟协议也不同，枚举是一个具体的类型，可以包含属性、方法、泛型约束和嵌套类型。正因如此，Swift 标准库广泛使用无实例的枚举类型来做诸如 [定义命名空间](https://github.com/apple/swift/blob/a4230ab2ad37e37edc9ed86cd1510b7c016a769d/stdlib/public/core/Unicode.swift#L918) 以及 [标识类型的含义](https://github.com/apple/swift/blob/a6952decab6f918a9df3c6fa342153a9f9204f8e/stdlib/public/core/MemoryLayout.swift#L43) 之类的事情。

但 `Never` 并不这样。它没有什么花哨的东西，它的特别之处就在于，它就是它自己（或者说，它什么都不是）。

试想一个返回值为无实例类型的函数：因为无实例类型没有任何值，所以这个函数无法正常的返回。（它要如何生成这个返回值呢？）所以，这个函数要么停止运行，要么无休止的一直运行下去。

## 消除泛型中的不可能状态

从理论角度上说，`Never` 确实很有意思，但它在实际应用中又能帮我们做什么呢？

做不了什么，或者说在 [SE-0215: Conform Never to Equatable and Hashable](https://github.com/apple/swift-evolution/blob/master/proposals/0215-conform-never-to-hashable-and-equatable.md#conform-never-to-equatable-and-hashable) 推出以前，做不了什么。

[Matt Diephouse](https://github.com/mdiep) 在提案中解释了为什么让这个令人费解的类型去遵守 `Equatable` 和其他协议：

> `Never` 在表示不可能执行的代码方面非常有用。大部分人熟悉它，是因为它是 `fatalError` 等方法的返回值，但 `Never` 在泛型方面也非常有用。比如说，一个 `Result` 类型可能使用 `Never` 作为它的 `Value`，表示某种东西一直是错误的，或者使用 `Never` 作为它的 `Error`，表示某种东西一直不是错误的。

Swift 没有标准的 `Result` 类型，大部分情况下它们是这个样子的：

    
    enum Result<Value, Error: Swift.Error> {
        case success(Value)
        case failure(Error)
    }

`Result` 类型被用来封装异步操作生成的返回值和异常（同步操作可以使用 `throw` 来返回异常）。

比如说，一个发送异步 HTTP 请求的函数可能使用 `Result` 类型来存储响应或错误：

    
    func fetch(_ request: Request, completion: (Result<Response, Error>) -> Void) {
        // ...
    }

调用这个方法后，你可以使用 `switch` 来分别处理它的 `.success` 和 `.failure`：

    
    fetch(request) { result in
        switch result {
        case .success(let value):
            print("Success: \(value)")
        case .failure(let error):
            print("Failure: \(error)")
        }
    }

现在假设有一个函数会在它的 `completion` 中永远返回成功结果：

    
    func alwaysSucceeds(_ completion: (Result<String, Never>) -> Void) {
        completion(.success("yes!"))
    }

将 `Result` 的 `Error` 类型指定为 `Never` 后，我们可以使用类型检测体系来表明失败是永远不可能发生的。这样做的好处在于，你不需要处理 `.failure`，Swift 可以推断出这个 `switch` 语句已经处理了所有情况。

    
    alwaysSucceeds { (result) in
        switch result {
        case .success(let string):
            print(string)
        }
    }

下面这个例子是让 `Never` 遵循 `Comparable` 协议，这段代码把 `Never` 用到了极致：

    
    extension Never: Comparable {
      public static func < (lhs: Never, rhs: Never) -> Bool {
        switch (lhs, rhs) {}
      }
    }

因为 `Never` 是一个无实例类型，所以它没有任何可能的值。所以当我们使用 `switch` 遍历它的 `lhs` 和 `rhs` 时，Swift 可以确定所有的可能性都遍历了。既然所有的可能性 — 实际上这里不存在任何值 — 都返回了 `Bool`，那么这个方法就可以正常编译。

_工整！_

## 使用 `Never` 作为兜底类型

**实际上，关于 `Never` 的 Swift Evolution 提案中已经暗示了这个类型在未来可能有更多用处：**

> 一个无实例类型可以作为其他任意类型的子类型 — 如果某个表达式根本不可能产生任何结果，那么我们就不需要关心这个表达式的类型到底是什么。如果编译器支持这一特性，就可以实现很多有用的功能……

### 解包或者死亡

强制解包操作（`!`）是 Swift 中最具争议的部分之一。（在代码中使用这个操作符）往好了说，是有意为之（在异常时故意让程序崩溃）；往坏了说，可能表示使用者没有认真思考。在缺乏其他信息的情况下，很难看出这两者的区别。

比如，下面的代码假定数组一定不为空，

    
    let array: [Int]
    let firstIem = array.first!

为了避免强制解包，你可以使用带条件赋值的 `guard` 语句：

    
    let array: [Int]
    guard let firstItem = array.first else {
        fatalError("array cannot be empty")
    }

未来，如果 `Never` 成为兜底类型，它就可以用在 `nil-coalescing operator` 表达式的右边。

    
    // 未来的 Swift 写法? 🔮
    let firstItem = array.first ?? fatalError("array cannot be empty")

如果你想现在就使用这种模式，可以手动重载 `??` 运算符（但是……）：

    
    func ?? <T>(lhs: T?, rhs: @autoclosure () -> Never) -> T {
        switch lhs {
        case let value?:
            return value
        case nil:
            rhs()
        }
    }

> 在拒绝 [SE-0217: Introducing the !! “Unwrap or Die” operator to the Swift Standard Library](https://github.com/apple/swift-evolution/blob/master/proposals/0217-bangbang.md#on-forced-unwraps) 的[原因说明](https://forums.swift.org/t/se-0217-the-unwrap-or-die-operator/14107/222)中, [Joe Groff](https://github.com/jckarter) 提到，“我们发现重载 [?? for Never] 会对类型检测的性能产生难以接受的影响”。所以，不建议你在自己的代码中添加上面的代码。

### 表达式风格的 Throw

类似的，如果 `throw` 可以从语句变成一个返回 `Never`的表达式，你就可以在 `??` 右边使用 `throw`。

    
    // 未来的 Swift 写法? 🔮
    let firstItem = array.first ?? throw Error.empty

### 带类型的 `Throw`

继续研究下去：如果函数声明的 `throw` 关键字支持类型约束，那么 `Never` 可以用来表明某个函数绝对不会抛出异常（类似于在上面的 `Result` 例子）：

    
    // 未来的 Swift 写法? 🔮
    func neverThrows() throws<Never> {
        // ...
    }
    
    neverThrows() // 无需使用 `try` ，因为编译器保证它一定成功（可能）

---

声称某个事情永远不可能发生，就像是向整个宇宙发出邀请，来证明它是错的一样。情态逻辑（modal logic）或者信念逻辑（doxastic logic）允许保面子式的妥协（“_它当时是对的，或者我是这么认为的！_”），但时态逻辑（temporal logic）似乎将这个约定提到了更高的一个标准。

幸运的是，得益于最不像类型的 `Never`，Swift 到达了这个高标准。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。