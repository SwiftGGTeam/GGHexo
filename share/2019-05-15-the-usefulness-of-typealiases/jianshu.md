Swift 中类型别名的用途"

> 作者：Benedikt Terhechte，[原文链接](http://appventure.me/posts/2019-5-15-the-usefulness-of-typealiases-in-swift.html)，原文日期：2019-05-15
> 译者：[Ji4n1ng](https://github.com/Ji4n1ng)；校对：[WAMaker](https://github.com/WAMaker)，[Nemocdz](https://nemocdz.github.io/)；定稿：[Pancf](https://github.com/Pancf)
  










## 什么是 `typealias`？

当我们回忆那些 Swift 强大的语言特性时，很少有人会首先想到 `typealias`。然而，许多情况下类型别名会很有用。本文将简要介绍 `typealias` 是什么，如何定义它，并列出多个示例说明如何在自己的代码中使用它们。让我们开始深入了解吧！



顾名思义，`typealias` 是特定类型的别名。类型，例如 `Int`、`Double`、`UIViewController` 或一种自定义类型。`Int32` 和 `Int8` 是不同的类型。换句话说，类型别名在你的代码库里插入现有类型的另一个名称。例如：

    
    typealias Money = Int

为 `Int` 类型创建别名。这样就可以在代码中的任何地方使用 `Money`，就像是 `Int` 一样：

    
    struct Bank {
      typealias Money = Int
      private var credit: Money = 0
      mutating func deposit(amount: Money) {
        credit += amount
      }
      mutating func withdraw(amount: Money) {
        credit -= amount
      }
    }

上面有一个结构体 `Bank` 来管理钱。但是，没有使用 `Int` 作为金额，而是使用 `Money` 类型。可以看出 `+=` 和 `-=` 运算符仍然可以按预期工作。

还可以混合使用类型别名和原始类型，以及匹配二者。可以这么做是因为对于 Swift 编译器来说，它们都解析为同一个东西：

    
    struct Bank {
      typealias DepositMoney = Int
      typealias WithdrawMoney = Int
      private var credit: Int = 0
      mutating func deposit(amount: DepositMoney) {
        credit += amount
      }
      mutating func withdraw(amount: WithdrawMoney) {
        credit -= amount
      }
    }

在这里，我们混合使用了 `Int` 及其不同自定义类型别名 `DepositMoney` 和 `WithdrawMoney`。

### 泛型类型别名

除上述内容外，类型别名也可以具有泛型参数：

    
    typealias MyArray<T> = Array<T>
    let newArray: MyArray = MyArray(arrayLiteral: 1, 2, 3)

上面，为 `MyArray` 定义了一个类型别名，该别名与常规数组一样。最后，类型别名的泛型参数甚至可以具有约束。想象一下，我们希望新的 `MyArray` 只保留遵循 `StringProtocol` 的类型：

    
    typealias MyArray<T> = Array<T> where T: StringProtocol

这是一个不错的特性，你可以快速为特定类型定义数组，而不必将 `Array` 子类化。说到这里，让我们看一下类型别名的一些实践应用。

## 实践应用

### 更清晰的代码

第一个，同时也显而易见的用例，我们已经简要介绍过了。类型别名可以使代码更具含义。在 `typealias Money = Int` 示例中，我们引入了 `Money` 类型——一个清晰的概念。像 `let amount: Money = 0` 这样来使用它，比 `let amount: Int = 0` 更容易理解。在第一个示例中，你立刻就明白这是*金钱*的*数额*。而在第二个示例中，它可以是任何东西：自行车的数量、字符的数量、甜甜圈的数量——这谁知道！

这显然不是都必要的。如果函数签名已经清楚地说明了参数的类型（`func orderDonuts(amount: Int)`），那么包含其他的类型别名将是不必要的开销。另一方面，对于变量和常量来说，它通常可以提高可读性并极大地帮助编写文档。

### 更简单的可选闭包

Swift 中的可选闭包有点笨拙。接受一个 `Int` 参数并返回 `Int` 的闭包的常规定义如下所示：

    
    func handle(action: (Int) -> Int) { ... }

现在，如果要使此闭包为可选型，则不能仅添加问号：

    
    func handle(action: (Int) -> Int?) { ... }

毕竟，这不是一个可选型的闭包，而是*一个返回可选 `Int`* 的闭包。正确的方法是添加括号：

    
    func handle(action: ((Int) -> Int)?) { ... }

如果有多个这样的闭包，这将变得尤为难看。下面，有一个函数，它可以处理成功和失败情况，以及随着操作的进行调用一个附加的闭包。

    
    func handle(success: ((Int) -> Int)?,
                failure: ((Error) -> Void)?,
                progress: ((Double) -> Void)?) {
        
    }

这小段代码包含*很多*括号。由于我们不打算成为 lisper（译者注：lisp 语言使用者），因此想通过对不同的闭包使用类型别名来解决此问题：

    
    typealias Success = (Int) -> Int
    typealias Failure = (Error) -> Void
    typealias Progress = (Double) -> Void
    
    func handle2(success: Success?, failure: Failure?, progress: Progress?) { ... }

实际上，这个函数看起来确实更具可读性。虽然这很好，但我们确实通过使用三行 `typealias` 引入了其他语法。但是，从长远来看，这实际上可能对我们有帮助，就像我们将在接下来看到的。

### 集中定义

这些特定类型不仅仅可以用在前面示例的那些操作处理器中。下面是经过略微修改，更符合实际使用的操作处理器类：

    
    final class Dispatcher {
      private var successHandler: ((Int) -> Void)?
      private var errorHandler: ((Error) -> Void)?
      
      func handle(success: ((Int) -> Void)?, error: ((Error) -> Void)?) {
        self.successHandler = success
        self.errorHandler = error
        internalHandle()
      }
      
      func handle(success: ((Int) -> Void)?) {
       self.successHandler = success
        internalHandle()
      }
      
      func handle(error: ((Int)-> Void?)) {
        self.errorHandler = error
        internalHandle()
      }
      
      private func internalHandle() {
       ...
      }
    }

该结构体引入了两个闭包，一个用于成功情况，一个用于错误情况。但是，我们还希望提供更方便的函数，调用其中一个处理器即可。在上面的示例中，如果要向成功和错误处理器添加另一个参数（例如 `HTTPResponse`），那么需要更改很多代码。在三个地方，`((Int) -> Void)?` 需要变成 `((Int, HTTPResponse) -> Void)?`。错误处理器也是一样的。通过使用多个类型别名，可以避免这种情况，只需要在一个地方修改类型：

    
    final class Dispatcher {
      typealias Success = (Int, HTTPResponse) -> Void
      typealias Failure = (Error, HTTPResponse) -> Void
    
      private var successHandler: Success?
      private var errorHandler: Failure?
      
      func handle(success: Success?, error: Failure?) {
        self.successHandler = success
        self.errorHandler = error
        internalHandle()
      }
      
      func handle(success: Success?) {
       self.successHandler = success
        internalHandle()
      }
      
      func handle(error: Failure?) {
        self.errorHandler = error
        internalHandle()
      }
      
      private func internalHandle() {
       ...
      }
    }

这不仅易于阅读，而且随着在更多地方使用该类型，它也会继续发挥它的作用。

### 泛型别名

类型别名也可以是泛型的。一个简单的用例是强制执行具有特殊含义的容器。假设我们有一个处理图书的应用。一本书由章节组成，章节由页面组成。从根本上讲，这些只是数组。下面是 `typealias`：

    
    struct Page {}
    typealias Chapter = Array<Page>
    typealias Book = Array<Chapter>

与仅使用数组相比，这有两个好处。

1. 该代码更具解释性。
2. 包装页面的数组*只*能包含页面，而不能包含其它的。

回顾我们先前使用*成功*和*失败*处理程序的示例，我们可以通过使用泛型处理程序来进一步改进：

    
    typealias Handler<In> = (In, HTTPResponse?, Context) -> Void
    
    func handle(success: Handler<Int>?, 
                failure: Handler<Error>?,
               progress: Handler<Double>?,)

这样的组合确实非常棒。这使我们能够编写一个更简单的函数，并可以在一个地方编辑 `Handler`。

这种方法对于自定义的类型也非常有用。你可以创建一个泛型定义，然后定义详细的类型别名：

    
    struct ComputationResult<T> {
      private var result: T
    }
    
    typealias DataResult = ComputationResult<Data>
    typealias StringResult = ComputationResult<String>
    typealias IntResult = ComputationResult<Int>

再说一遍，类型别名允许我们编写更少的代码并简化代码中的定义。

### 像函数一样的元组

同样，可以使用泛型和元组来定义类型，而不是必须用结构体。下面，我们设想了一种遗传算法的数据类型，它可以在多代中修改其值 `T`。

    
    typealias Generation<T: Numeric> = (initial: T, seed: T, count: Int, current: T)

如果定义这样的类型别名，则实际上可以像初始化一个结构体那样对其进行初始化：

    
    let firstGeneration = Generation(initial: 10, seed: 42, count: 0, current: 10)

尽管它看起来确实像一个结构体，但它只是一个元组的类型别名。

### 组合协议

有时，你会遇到一种情况，你有多个协议，而且需要使用一个特定类型来把这些协议都实现。这种情况通常发生在当你定义了一个协议层来提高灵活性时。

    
    protocol CanRead {}
    protocol CanWrite {}
    protocol CanAuthorize {}
    protocol CanCreateUser {}
    
    typealias Administrator = CanRead & CanWrite & CanAuthorize & CanCreateUser
    
    typealias User = CanRead & CanWrite
    
    typealias Consumer = CanRead

在这里，我们定义了权限层。管理员可以做所有事情，用户可以读写，而消费者只能读。

### 关联类型

这超出了本文的范围，但是协议的关联类型也可以通过类型别名来定义：

    
    protocol Example {
     associatedtype Payload: Numeric
    }
    
    struct Implementation: Example {
      typealias Payload = Int
    }

## 缺点

尽管类型别名是一个非常有用的功能，但它们有一个小缺点：如果你不熟悉代码库，那么对下面这两个定义的理解会有很大区别。

    
    func first(action: (Int, Error?) -> Void) {}
    func second(action: Success) {}

第二个不是立即就能明白的。`Success` 是什么类型？如何构造它？你必须在 Xcode 中按住 Option 单击它，以了解它的功能和工作方式。这会带来额外的工作量。如果使用了许多类型别名，则将花费更多的时间。这没有很好的解决方案，（通常）只能依赖于用例。

## 最后

我希望你能喜欢这篇关于类型别名可能性的小总结。如果你有任何反馈意见，[可以在 Twitter 上找到我](https://twitter.com/terhechte)。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。