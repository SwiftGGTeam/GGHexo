title: "对比 attempt、try? 和 try!"
date: 2016-04-15
tags: [Swift 进阶]
categories: [Erica Sadun]
permalink: swift-my-attempt-code-vs-try-and-try
keywords: swift try,attempt try
custom_title: 
description: 如何使用 attempt 来重现 try? 和其 try! 的所有行为，下面我们就来讨论一番吧。

---
原文链接=http://ericasadun.com/2016/03/15/swift-my-attempt-code-vs-try-and-try/
作者=Erica Sadun
原文日期=2016-03-15
译者=星夜暮晨
校对=numbbbbb
定稿=CMB

<!--此处开始正文-->

在 Swift 中，`try?` 关键字将一个可能会抛出错误的调用转变为一个可选值。它会返回成功值 (`.some(T)`)或 nil (`.none`)。使用 `try?` 允许您在 `guard` 语句中使用会抛出错误的代码，还允许您中断错误处理链并离开当前作用域，然后进入专门用于处理成功状态闭包的条件绑定当中。

`try?` 有其优缺点。它允许您创建行为可预见的代码，尤其是在结束闭包和 `Playground` 当中，但是忽视错误对于开发者来说往往是不可取的。

<!--more-->

前一阵子，我写了 [实现可打印内容的 try? 和 try!](http://swift.gg/2015/11/27/implementing-printing-versions-of-try-and-try-on-steroids-in-swiftlang/)。它在保存错误信息和使用基于可选值的控制语句之间提供了一个平衡点。

随着时间的推移，我开始逐步调整我的这个做法，尝试去完善和精简我的想法。我的目的是：重现 `try?` 和其 `fatal-error` 版本（`try!`） 的所有行为，并保留错误处理功能。我将这个想法称之为“多用途的替换尝试”。

我的 `attempt` 函数会被动接收抛出语句运行时候的上下文状态，然后提供一个默认可打印的错误处理器。如果您将 `crashOnError` 设为 `true`，这个 `attempt` 语句就会表现得和 `try!` 一样，但是只有在造成程序崩溃的错误以及问题发生的源代码位置打印之后，才会中止程序的执行。

最新的 `attempt` 组件是自定义错误处理器，默认会进行打印。这可能有点小题大做，不过我很喜欢这个想法，因为我可以按需修改错误处理器的行为。如果您只希望添加错误清理功能，然后再打印错误的话，那么您可以从自定义的错误处理器中调用默认的处理器。

单独使用的 `attempt` 如下所示，它带有一个尾闭包：

```swift
attempt {
   let mgr = NSFileManager.defaultManager()
   try mgr.createDirectoryAtPath(
       "/Users/notarealuser",
       withIntermediateDirectories: true,
       attributes: nil)
}
```

但是，需要结合 `guard` 调用时，由于不能够在尾随闭包中将 `guard` 所需要的 `else` 闭包和 `attempt` 闭包区分开来，因此需要使用一个更为传统的参数方法。

```swift
guard let fileContents = attempt(closure: {
    _ -> [NSURL] in
    let url = NSURL(fileURLWithPath: "/Users/notarealuser")
    let mgr = NSFileManager.defaultManager()
    return try mgr.contentsOfDirectoryAtURL(
            url, includingPropertiesForKeys: nil, 
            options: [])
}) else { fatalError("failed") }
```

`attempt` 的相关代码如下所示，您也可以在 `GitHub` 上访问内容更丰富的 `CoreError.swift` 代码实现，它当中还增加（更新）了语境化的实用工具 (`Contextualization Utilities`)。因为 `Swift` 将会采用更现代化的调试标识符，因此这种尖叫蛇式大写 (SCREAMING\_SNAKE\_CASE，译者注：如您所见，就是在大写单词之间加上下划线) 的常量将很快被移除。

```swift
/// 由文件路径 (File Path)、行数 (Line Number) 和错误元组 (Error Tuple) 组成
public typealias CommonErrorHandlerType = (String, Int, ErrorType) -> Void

/// 可以打印上下文和错误的默认错误处理器
public let defaultCommonErrorHandler: CommonErrorHandlerType = {
    filePath, lineNumber, error in
    let trimmedFileName: String = (filePath as NSString).lastPathComponent
    print("Error \(trimmedFileName):\(lineNumber) \(error)")
}

/// 引入错误处理器来替代 `try?`
/// 默认的错误处理器将会在返回 nil 之前打印错误信息
public func attempt<T>(
file fileName: String = __FILE__,
line lineNumber: Int = __LINE__,
    crashOnError: Bool = false,
    errorHandler: CommonErrorHandlerType = defaultCommonErrorHandler,
// 感谢 http://twitter.com/Kametrixom/status/709809975447707648
@noescape closure: () throws -> T) -> T? { 

do {
// 只有当闭包成功的时候，才会返回执行，这会返回 T
return try closure()
        } catch {
// 通过崩溃来模仿 try!
if crashOnError {
print("Fatal error \(fileName):\(lineNumber): \(error)")
                fatalError()
            }
// 运行错误处理器，并返回 nil
            errorHandler(fileName, lineNumber, error)
return nil
        }
}
```

一如既往，如果您发现了任何问题，或者有任何建议的话，请联系我，让我知晓。