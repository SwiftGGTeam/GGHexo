实现可打印内容的 try? 和 try!"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2015/11/05/implementing-printing-versions-of-try-and-try-on-steroids-in-swiftlang/)，原文日期：2015-11-5
> 译者：[pmst](http://www.jianshu.com/users/596f2ba91ce9/latest_articles)；校对：[千叶知风](http://weibo.com/xiaoxxiao)；定稿：[numbbbbb](http://numbbbbb.com/)
  









Swift 2 中的`try?`运算符在可选类型(optionals)和错误处理机制中抛出 error 转换为输出 nil 结果值之间建立了桥接。这样你就可以使用 guard 语句和条件绑定，只关注处理成功的用例(case)。


    
    /// try? 没有错误输出正确结果值
    ///      有错误发生，输出nil值
    guard let foo = try? somethingThatMayThrow else {
        //处理错误情况并退出作用域
    }

倘若你使用这种方式进行错误处理，需要注意，它并不会返回 error 信息。本文想说的是：抛弃错误信息是一件让人郁闷的事情！为什么不有选择地使用`try?`和`try!`来自动建立上下文并打印错误信息呢？

前阵子，我分享了一个模仿`try?`语句的基础实现，可以保留错误信息。下面的实现首先打印返回的错误，接着继续返回你想要得到的`try?`的处理结果：结果是一个值或 nil。

    
    func attempt<T>(block: () throws -> T) -> Optional<T>{ 
        do { return try block() } 
        catch { print(error); return nil } 
    }

这很有效，尤其是当你想要进一步使用返回值却发现 guard 语句在失败时无法返回错误信息。使用 attemp 函数就可以打印错误信息。举个例子，如果我们要使用 NSFileManager 来删除文件。

    
    NSFileManager.defaultManager().removeItemAtURL(someURL)

你应该这样做：将上述代码包裹到`do-catch`的 block 中(略显冗长)，在 attempt 函数中使用`try?`，接着处理返回 nil 值的情况，或者使用`try!`忽视所有错误信息(译者注:倘若实际有错误发生，程序会直接崩溃，使用它之前你必须确保不会有错误产生)。

当然这里还有另外一种方式。在文章的最后，我构建了一个 attemptFailable 函数，它把 throwing 声明封装到 guard/try 的迷你打印系统中，后者会返回一个布尔类型值。下面是使用方法：

    
    if NSFileManager.defaultManager().fileExistsAtPath(myPath) {
        guard (attemptFailable{try NSFileManager.defaultManager()
             .removeItemAtURL(myURL)}) else {abort()}
    }

显然不是很理想，但是在 playground 中写一些小东西时相当方便，最近我经常使用。(Playground 相当不错，作者书籍[购买链接](https://itunes.apple.com/us/book/playground-secrets-power-tips/id982838034?mt=11))。

你可以使用类似的方式增强`try!`。相比 Swift 的可选值，`doOrDie`函数提供了更多信息。就像`attemp`和`attemptFailable`函数一样，它能够捕获上下文，在继续使用标准`try!`终止执行前抛出并打印错误。

以下是完整代码：

    
    import Foundation
    
    // 错误泛型
    public struct Error: ErrorType {let reason: String}
    
    /**
     Printing version of try? Call either with standard or autoclosure approach
     
     let contents = attempt{try NSFileManager.defaultManager().contentsOfDirectoryAtPath(fakePath)}
     let contents = attempt{try NSFileManager.defaultManager().contentsOfDirectoryAtPath(XCPlaygroundSharedDataDirectoryURL.path!)}
     
     
     - Returns: Optional that is nil when the called closure throws
     */
    
    public func attempt<T>(source source: String = __FUNCTION__, file: String = __FILE__, line: Int = __LINE__, closure: () throws -> T) -> Optional<T>{
        do {
            return try closure()
        } catch {
            let fileName = (file as NSString).lastPathComponent
            let report = "Error \(fileName):\(source):\(line):\n    \(error)"
            print(report)
            return nil
        }
    }
    
    /**
     可以打印内容并返回布尔值的 try? 可选实现
     
     
     let success = attemptFailable{try "Test".writeToFile(fakePath, atomically: true, encoding: NSUTF8StringEncoding)}
     
     
     - Returns: Boolean 值，如果被调用的闭包抛出错误返回 false，否则返回 true
     */
    public func attemptFailable(source source: String = __FUNCTION__, file: String = __FILE__, line: Int = __LINE__, closure: () throws -> Void) -> Bool {
        do {
            try closure()
            return true
        } catch {
            let fileName = (file as NSString).lastPathComponent
            let report = "Error \(fileName):\(source):\(line):\n    \(error)"
            print(report)
            return false
        }
    }
    
    /**
     另外一个包含更多信息的 try! 版本。shouldCrash 是 false 时，即使有错误抛出，也会继续执行
     
     
     doOrDie(shouldCrash: false, closure: {try "Test".writeToFile(fakePath, atomically: true, encoding: NSUTF8StringEncoding)})
     // 或
     doOrDie(shouldCrash:false){try NSFileManager.defaultManager().removeItemAtURL(fakeURL)}
     // 或
     doOrDie{try "Test".writeToFile(fakePath, atomically: true, encoding: NSUTF8StringEncoding)}
     
     */
    public func doOrDie(source: String = __FUNCTION__,
        file: String = __FILE__, line: Int = __LINE__, shouldCrash: Bool = true, closure: () throws -> Void) {
            let success = attemptFailable(source: source, file: file, line: line, closure: closure)
            if shouldCrash && !success {fatalError("Goodbye cruel world")}
    }
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。