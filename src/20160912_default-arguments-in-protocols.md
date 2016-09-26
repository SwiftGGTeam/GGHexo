title: "面向协议的日志：给 Swift 协议添加默认参数"
date: 2016-09-12
tags: [Swift 进阶]
categories: [Ole Begemann]
permalink: default-arguments-in-protocols
keywords: swift协议
custom_title: 
description: 在 Swift 中的协议不允许给方法参数指定默认值，那么要怎么做才能实现给 Swift 协议添加默认参数呢，本文就来讲解下吧。

---
原文链接=http://oleb.net/blog/2016/05/default-arguments-in-protocols/
作者=Natasha The Robot 
原文日期=2016-05-01
译者=Channe
校对=walkingway
定稿=CMB

<!--此处开始正文-->

**Swift 2.2 不允许在协议声明时提供默认参数。如果你想使用协议抽象出 App 中的日志代码，就会面临一个问题。因为默认参数通常用来将源代码位置传递给日志函数。不过，你可以在协议扩展中使用默认参数，这是一个变通方案。**

一个典型的[日志](https://en.wikipedia.org/wiki/Logfile)消息应该包括日志事件的源代码位置（文件名、行号和可能的函数名）。Swift 为此提供了 `#file`，`#line`，`#column` 和 `#function` [调试标识](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Expressions.html#//apple_ref/doc/uid/TP40014097-CH32-ID390)。在编译时，解析器将这些占位符展开为字符串或用来描述当前源代码位置的整数字面量。如果我们在每次调用日志函数时都包含这些参数，那重复的次数太多，所以它们通常都是作为默认参数传递。这里之所以可行是因为编译器足够聪明，能够在评估默认参数列表时将调试标识扩展到[函数调用处](https://en.wikipedia.org/wiki/Call_site)。标准库中的 [assert](http://swiftdoc.org/v2.2/func/assert/#func-assert_-bool_-string-file_-staticstring-line_-uint) 函数就是[一个例子](https://developer.apple.com/swift/blog/?id=15)，它这样声明：

```swift
func assert(
    @autoclosure condition: () -> Bool,
    @autoclosure _ message: () -> String = default,
    file: StaticString = #file,
    line: UInt = #line)
```

第三个和第四个参数默认扩展为调用者源代码的位置。（如果你对 `@autoclosure` 属性有疑问，它把一个表达式封装为一个闭包，有效地将表达式的执行从调用处延迟到函数体执行时，即闭包表达式在明确使用时才会执行。`assert` 只在调试构建时使用它来执行 condition 参数的计算（可能代价高昂或者有副作用），同时只在断言失败时才计算 message 参数。）

<!--more-->

## 一个简单、全局的日志函数

你可以使用同样的方法来写一个日志函数，该函数需要一个日志消息和一个日志级别作为参数。它的接口和实现类似于：

```swift
enum LogLevel: Int {
    case verbose = 1
    case debug = 2
    case info = 3
    case warning = 4
    case error = 5
}

func log(
    logLevel: LogLevel,
    @autoclosure _ message: () -> String,
    file: StaticString = #file,
    line: Int = #line,
    function: StaticString = #function)
{
    // 使用 `print` 打印日志
    // 此时不用考虑 `logLevel`
    print("\(logLevel) – \(file):\(line) – \(function) – \(message())")
}
```

你可能主张使用另一种方法，而不是像这里将 message 参数声明为 `@autoclosure`。这个属性并没有提供多少好处，因为 message 参数无论什么情况都会计算。既然如此，我们来修改一下。

## 具体类型

为了代替全局的日志函数，我们创建一种叫做 `PrintLogger` 的类型，它用最小日志级别初始化，只会记录最小日志级别的事件。`LogLevel` 因此需要 `Comparable` 协议，这是为什么我之前把它声明为 `Int` 型来存储原始数据的原因：

```swift
extension LogLevel: Comparable {}

func <(lhs: LogLevel, rhs: LogLevel) -> Bool {
    return lhs.rawValue < rhs.rawValue
}

struct PrintLogger {
    let minimumLogLevel: LogLevel

    func log(
        logLevel: LogLevel,
        @autoclosure _ message: () -> String,
        file: StaticString = #file,
        line: Int = #line,
        function: StaticString = #function)
    {
        if logLevel >= minimumLogLevel {
            print("\(logLevel) – \(file):\(line) – \(function) – \(message())")
        }
    }
}
```

你将会这样使用 `PrintLogger `：

```swift
let logger = PrintLogger(
    minimumLogLevel: .warning)
logger.log(.error, "This is an error log")
    // 获取日志
logger.log(.debug, "This is a debug log")
    // 啥也没做
```

## 带默认参数的协议

下一步，我将会创建一个 `Logger ` 协议作为 `PrintLogger ` 的抽象。它将允许我今后使用更高级的实现替换简单的 print 语句，比如记录日志到文件或者发送日志给服务器。但是，我在这里碰了壁，因为 Swift 不允许在协议声明时提供默认参数。下面的代码无法通过编译：

```swift
protocol Logger {
    func log(
        logLevel: LogLevel,
        @autoclosure _ message: () -> String,
        file: StaticString = #file,
        line: Int = #line,
        function: StaticString = #function)
    // 错误: 协议方法中不允许默认参数
}
```

因此，我不得不删掉默认参数，使协议编译能够通过。这似乎并不是一个问题。`PrintLogger` 可以使用带有空扩展的协议，它目前的实现基本上能满足要求。通过使用一个 `logger: PrintLogger` 类型的变量和之前的用法没有什么区别。

如果你尝试使用一个 `logger2: Logger` 协议类型的变量，问题马上就来了，因为你调用代码时是猜不到具体的实现的：

```swift
let logger2: Logger = PrintLogger(minimumLogLevel: .warning)
logger2.log(.error, "An error occurred")
    // 错误：调用时缺少参数
logger2.log(.error, "An error occurred", file: #file, line: #line, function: #function)
    // 可用但是 😱
```

`logger2 ` 只知道这个日志函数有五个必须的参数，所以你不得不每次都全部写上它们。讨厌！

## 把默认参数移到协议扩展里

解决方法是声明两个版本的日志函数：一，在协议声明时没有默认参数，我命名这个方法为 `writeLogEntry`。二，在 `Logger` 的协议扩展里包含默认参数（这是允许的），我保持这个方法名就为 `log`，因为该方法会是这个协议的公开接口。

现在，`log` 的实现只有一行代码：调用 `writeLogEntry`，传入所有参数，而调用者通过默认参数传入了源代码位置。`writeLogEntry` 从另一方面来说是协议必须实现的适配器方法，用来执行实际的日志操作。这里是完整的协议代码：

```swift
protocol Logger {
    /// 打印一条日志
    /// 类型必须遵循 Logger 协议的必选参数
    /// - 注意：Logger 的调用者永远不应该调用此方法
     /// 总是调用 log(_:,_:) 方法
    func writeLogEntry(
        logLevel: LogLevel,
        @autoclosure _ message: () -> String,
        file: StaticString,
        line: Int,
        function: StaticString)
}

extension Logger {
    /// Logger 协议的公开 API
    /// 只是调用 writeLogEntry(_:,_:,file:,line:,function:) 方法
    func log(
        logLevel: LogLevel,
        @autoclosure _ message: () -> String,
        file: StaticString = #file,
        line: Int = #line,
        function: StaticString = #function)
    {
        writeLogEntry(logLevel, message,
            file: file, line: line,
            function: function)
    }
}
```

按照 [session 408](https://developer.apple.com/videos/play/wwdc2015/408/) 的说法，`writeLogEntry` 是一个*协议要求*和协议的*用户自定义点*，但 `log` 并不是。这就是我们想要的。`log` 方法的唯一任务就是立刻转发给 `writeLogEntry`，`writeLogEntry` 包含了实际的逻辑。实现 `Logger` 协议时就没有理由重写`log`方法了。

下面是采用协议后的完整 `PrintLogger` 类型：

```swift
struct PrintLogger {
    let minimumLogLevel: LogLevel
}

extension PrintLogger: Logger {
    func writeLogEntry(
        logLevel: LogLevel,
        @autoclosure _ message: () -> String,
        file: StaticString,
        line: Int,
        function: StaticString)
    {
        if logLevel >= minimumLogLevel {
            print("\(logLevel) – \(file):\(line) – \(function) – \(message())")
        }
    }
}
```

现在你可以像期望中那样使用协议了：

```swift
let logger3: Logger = PrintLogger(
    minimumLogLevel: .verbose)
logger3.log(.error, "An error occurred") // 撒花🎉
```

## 调用者的 API 可见度

这个方法有一个弊端，不能简便清晰的通过[访问控制](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/AccessControl.html)给使用者指出协议中的 `log` 和 `writeLogEntry` 的作用。理想情况下，调用者使用协议时不会看到 `writeLogEntry` 方法，然而部署协议的对象可能同时看到 `log` 和 `writeLogEntry` 。如果你不想让调用者创建自己的 `Logger` 类型，只能使用 `public` 、 `internal` 和 `private`。当然，通过文档说明情况也是一个选择。
