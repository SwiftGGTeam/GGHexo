Swift 中的 Error Handling"

> 作者：Nick Hanan，[原文链接](http://www.codingexplorer.com/error-handling-swift/)，原文日期：2016/05/05
> 译者：[TonyHan](undefined)；校对：[Yousanflics](http://blog.yousanflics.com.cn)；定稿：[Forelax](http://forelax.space)
  









![](https://swift.gg/img/articles/error-handling-swift/ErrorHandlingInSwiftTitle.png1527734952.362786)

理想情况下，错误永远不会出现。我们所需的文件永远可以访问，网络永远可用并且稳定。不幸的是，现实并不理想，我们需要处理这种不理想的结果。幸运的是，Swift 团队在 Swift 2 中包含了一种很好的方式来处理与理想情况的偏差。Swift Error Handling 能够让我们快速而简便的告知编译器一个函数能否抛出错误，并且在抛出后以合适的方式去处理错误。



Objective-C 处理错误的方式与新的 Swift Error Handling 有一个主要区别。如果你之前在 Objective-C 中处理过 NSError，说实话，在处理可能抛出错误的方法时，你有没有过为其赋值为 "nil" 而不是 NSError 指针？是的，我也是这么认为。在 Objective-C 中，要正确的处理错误，你需要这样做：

    Objective-C
    NSError *err = nil;
    NSString *fileStuff = [[NSString alloc] initWithContentsOfFile:@"someFile.txt" encoding:NSUTF8StringEncoding error:&err];

上述代码所做的，是创建一个空的 NSError 对象，然后你可以用 ＆ 符号传入构造方法，＆ 符号用于辨识出传入的是变量地址。然后，如果有错误，方法或构造函数可以通过此地址找到对应的内存，将 NSError 赋值过去，然后退出函数。将可赋值的地址作为参数传入，是一种实现函数多返回值的手段。在 Swift 中这被转变成了方法原型中的 "inout" 关键字。

现在，如果有错误，你可以查看 "err" 变量，从而确认是什么错误，然后正确的处理错误。但是，如果不关心错误，可以不传错误指针（即 &err）而直接传入 "nil"，然后任何 NSError 都会被忽略掉。

Swift 中新的错误处理的语法，使错误处理更加明确。函数会明确的标识出它们会抛出错误，你的程序需要对此很明确，同时要正确处理这些错误（或明确地忽略）。

#### 创建 Swift 错误

这可真是个奇怪的标题，什么是创建一个错误？事实上，我们是要创建一个能够表示程序中真实错误的实例。如果一切运行正常，或者文件甚至不存在，这当然没问题。如果存在，用户可能没有访问权限，或者文件因为未知原因损坏。我们需要为要访问这个文件的函数创建 Swift Error 并列出以下选项：

    
    enum FileReadingError: ErrorType {
        case FileNotFound
        case InsufficientPermission
        case FileCorrupted
    }

如上所示，创建 Swift Error 的最简单方法是创建符合 ErrorType 协议的枚举。然后列出代表不同错误情况的选项。从技术来讲，任何对象都可以符合 ErrorType 协议，所以你可以使用一个结构体或一个类，但我觉得不应该这样做。枚举是更完美的方案，它能够列举出有限数目的错误名称。关联值的功能会让枚举更强大，比如说，你可以使用 InsufficientPermission，来显示出当前用户的权限等级。如果想了解更多关于枚举的内容，请查看这篇文章 [Enumerations in Swift](http://www.codingexplorer.com/enumerations-swift/)。

现在我们来创建一个能抛出错误的函数：

    
    func pretendToReadTestFile() throws -> NSData {
        throw FileReadingError.FileNotFound
    }

好吧，上述代码实际上什么也不会返回，只会自动抛出错误，但我们只是想了解如何实现抛出错误的机制，而并非真正实现一个访问文件并返回文件内容的函数。

首先，你必须将方法标记为能够抛出错误。要实现这个，只需要在在参数之后、用于表示返回类型的箭头 " -> " 之前使用 "throws" 关键字即可。接下来要在函数内部实现抛出错误，只需要输入 "throw" 然后列出想要作为错误的选项。就是这么简单！

只需要在调用函数之前使用 "try" 关键字，便可以捕获函数的错误：

    
    let data = try pretendToReadTestFile()

#### 处理 Swift Errors

主要有四种处理 Swift Errors 的方式：

##### 让其他人处理

第一种方法就是不做处理，让其他人来处理。要实现这个特性，需要将函数标记为会抛出错误的函数。之后再调用此函数时则必须进行处理。最终需要有地方来正确处理错误，但不一定是调用抛出错误方法的地方。例如，如果有一个负责读写或其他文件管理操作的文件管理器对象，我们可能只想将错误抛给调用者而不是在其里面处理。

要实现上述特性，只需要用 "throws" 关键字标记函数即可。这仍然需要用 "try" 将调用功能函数的函数标记为可能抛出错误。如果需要存储抛出错误函数的返回值，只需要正常调用函数然后保存数据即可，但需要在等号和函数调用之间使用 "try" 关键字。

    
    func getDataFromSomething() throws -> NSData {
        
        let data = try pretendToReadTestFile()
        
        return data
    }

##### 处理特定的 Swift Errors

在其他语言中，这可能是最熟悉的用来处理异常的方法了。Swift Error 的处理方式与异常的处理有显著的不同，会更高效。抛出 Swift Error 更像是替代了返回语句，至少在使用方式上是这样：函数会返回相应的 Swift Error，而不是返回某个预期的返回值。

首先使用 "do" 语句将抛出错误的函数包裹起来，然后使用 "catch" 语句，有点像 Switch 的 "case" 语句，或者 if 语句的 else-if，来得到需要的 Swift Errors，如下：

    
    do {
        let someData = try pretendToReadTestFile()
    } catch FileReadingError.FileNotFound {
        print("The file was not found.")
    }

代码块 "do" 包含了调用抛出错误的函数的代码。如果出现错误，将会跳转到对应的 catch 语句，很像 switch case 语句。同时，如果考虑不到所有可能的错误情况，则需要类似 Switch 语句中 "default" 或 if 语句中 "else" 的选项，只用 "catch" 来处理其余所有的 Swift Error：

    
    do {
        let someData = try pretendToReadTestFile()
    } catch {
        print("Something weird happened.")
    }

##### 抛出错误的函数返回可选类型

如果只需要返回值或是否有返回值，而不关心是什么错误，听起来这有点像 Swift 的可选类型。这样的话，即便返回值不是可选的，也可以告诉编译器“如果有错误，我也并不关心，只需要将返回值设置为 nil”。可以在 "try" 关键字后面使用问号，如下：

    
    let possibleData = try? pretendToReadTestFile()
    //possibleData now contains "nil"

根据实际需要来决定使用 do-catch 语句还是使用上述方式来处理指定的错误。如果的确不需要明确错误原因，或者错误原因很明显，那么使用 "try?" 将更合适。如果是网络调用，错误是由于无效的 URL、连接失败还是无法找到主机对于你的 App 的用户有意义么？对于有的 App 或许有意义，但也有的没有意义，上面那三种情况都意味着没有拿到数据。既然没有请求到数据，那么 "nil" 已经可以告知你的代码如何处理此种情况。

##### 确保编译器不会抛出 Error

如果有使用问号的版本，那么你可以猜到这个地方可能会有感叹号的版本（译者注：可选类型和强制解包）。如果使用 "try!"，更像是强制解包可选类型。你可以调用抛出错误的函数，但如果真的抛出错误，App 将会崩溃。如果你确认调用不会出问题，可以使用这种方式。Apple 的 iBook 解释了一种原因，即使用抛出错误的函数来访问 App 的 bundle 中的文件。既然资源来自 App，那它就应该存在，所以不会出现 "File Not Found" 或其他类似错误。如果真出现了错误，那么应该考虑下是不是有更严重的问题。

如果我们的函数总会抛出错误，那这种方式肯定会引发崩溃，以下仅仅展示了如何使用（顺便看下崩溃是什么样）：

    
    let definitelyNoData = try! pretendToReadTestFile()
    //Execution was interrupted, reason:  EXC_BAD_INSTRUCTION
    //error: 'try!' expression unexpectedly raised an error: FileReadingError.FileNotFound

#### 结论

> 译者注:所有贴出的代码都在 Xcode 7.3.1 进行了测试。

Swift Team 在 Swift 中实现了错误的处理，这点我感到很满意。表面上看这是一种相当常见的处理方式，但实际上，这更高效，并且与其表亲 "Exception Handling" 相比危害更小。不用使用调用栈，仅仅通过不同的返回值来告诉我们错误的性质。

我希望这篇文章对读者有所帮助。如果真的是这样，请毫不犹豫地在 Twitter 或其他社交媒体上分享这片文章，任何分享都可以。当然，如果有任何疑问，也请毫不犹豫地到联系[页面联系](http://www.codingexplorer.com/contact/)我，或者在 Twitter 上 [@CodingExplorer](https://twitter.com/CodingExplorer)，我会尽量提供帮助的。谢谢！

#### 参考

- [The Swift Programming Language – Apple Inc.](https://itunes.apple.com/us/book/swift-programming-language/id881256329?mt=11&uo=4&at=10lJ3x&ct=blog-SwiftErrorHandling)

> 译者注：目前在中国大陆 iBooks 不可用。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。