捕获上下文信息"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2015/08/27/capturing-context-swiftlang/)，原文日期：2015-08-27
> 译者：[CMB](https://github.com/chenmingbiao)；校对：[numbbbbb](https://github.com/numbbbbb)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  









假设你正在使用一个类型，当有错误时发生时你想要输出异常发生时的上下文。通常你会使用一些内置的编译器关键字：`__FUNCTION__` ， `__LINE__` 和 `__FILE__` ，这些关键词提供了有关函数调用详细的文本插值：



    
    public struct Error: ErrorType {
        let source: String; let reason: String
        public init(_ reason: String, source: String = __FUNCTION__,
            file: String = __FILE__, line: Int = __LINE__) {
                self.reason = reason; self.source = "\(source):\(file):\(line)"
        }
    }

一行典型的 `Error` 输出如下所示:

    
    Error(source: "myFunction():<EXPR>:14", reason: "An important reason")

虽然这种结构能够让你捕获出现异常的函数、文件和行号，但你无法捕捉没有类型参数的原始父类型。为了捕获该类型，需要在 `Error` 结构体构造器中包含“原始类型”，并向构造器中传递 `self.dynamicType` 参数。

    
    public struct Error: ErrorType {
        let source: String; let reason: String
        public init(_ reason: String, type: Any = "", 
            source: String = __FUNCTION__,
            file: String = __FILE__, 
            line: Int = __LINE__) {
                self.reason = reason; self.source = "\(source):\(file):\(line):\(type)"
        }
    }

我很不喜欢这种额外添加类型参数的方式，它唯一的作用就是简化错误生成。

    
    public struct Parent {
        func myFunction() throws {
            throw Error("An important reason", type: self.dynamicType)}
    }
    
    do {try Parent().myFunction()} catch{print(error)}
    // Error(source: "myFunction():<EXPR>:14:Parent", reason: "An important reason")

我更喜欢扩展 `Contextualizable` 来实现自动捕获类型上下文。注意，默认实现的协议方法中用到了 `self.dynamicType`，它不能被用在方法签名中（译者注：也就是说不能当做函数参数或者返回值）。

    
    protocol Contextualizable {}
    extension Contextualizable {
        func currentContext(file : String = __FILE__, function : String = __FUNCTION__, line : Int = __LINE__) -> String {
            return "\(file):\(function):\(line):\(self.dynamicType)"
        }
    }

结合上述两种方法可以简化整个过程轻松实现我们的目标。共享 `Error` 类型之后就可以把变量改成常量，并且把上下文相关代码从 `Error` 构造器移动到遵循协议的类型中，这样就可以自动继承 `currentContext` 方法。

    
    public struct Error: ErrorType {
        let source: String; let reason: String
        public init(_ source: String = __FILE__, _ reason: String) {
            self.reason = reason; self.source = source
        }
    }
    public struct Parent: Contextualizable {
        func myFunction() throws {
            throw Error(currentContext(), "An important reason")}

更新之后，错误输出中会包含原始类型。

正如读者 `Kametrixom` 所指出的，你还可以扩展 `Contextualizable` 协议并创建你自己的错误。（他还写了一个[非常棒的错误类型](https://gist.github.com/Kametrixom/21da650bd7c7006a70e3)，可以选择是否添加上下文。）

本文的所有代码可以在 [这个 Gist](https://gist.github.com/erica/b6f4884ed5d70c269107) 中找到（译者注：Gist 已经被墙，需要翻墙查看）。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。