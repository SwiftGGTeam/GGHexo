为什么 NSLog 不支持 Swift 对象"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2016/05/02/dear-erica-why-doesnt-nslog-support-swift-objects/)，原文日期：2016/05/02
> 译者：[saitjr](http://www.saitjr.com)；校对：[Channe](undefined)；定稿：[Cee](https://github.com/Cee)
  









> Erica，你好，在我想在 Playground 运行以下代码时，编译未通过。错误原因：“error: ‘NSLog’ is unavailable: Variadic function is unavailable NSLog(“%@”, Foo()) Foundation.NSLog:2:13: note: ‘NSLog’ has been explicitly marked unavailable here（错误：'NSLog' 不可用：可变参数函数不支持 NSLog(“%@”, Foo())。'NSLog' 在此已被标记为不可用）”。这是为什么呢？

    
    import Foundation
    class Foo {}
    NSLog("%@", Foo())



首先，`Foo` 不是 `NSObject`，如果 `Foo` 是 `NSObject` 的子类，那么控制台会直接输出 “\<__lldb_expr_24.Foo: 0x7fc9d2920210\>”，不过，你的问题不是这个原因。

回到之前讨论的问题上来，我发现你遵循了 `CustomDebugStringConvertible` 协议，并用 `NSLog` 输出转义的字符串。

    
    class Foo: CustomDebugStringConvertible {
        var debugDescription: String {return "Superfoo!"}
    }
    
    NSLog("\(Foo())")

其实，Swift 中的 `NSLog` 并不支持转义输出，如果你一定要这样做的话，应该像这样写：

    
    class Bar: NSObject {
        override var description: String {return "Superbar!"}
    }
    
    NSLog("%@", Bar())

上面这个例子中，我选择了直接重写 `NSObject` 的 `description` 属性的 getter 方法，而不是遵循 `CustomDebugStringConvertible` 协议。实现 `description` 的getter 方法（OS X 10.10 以上），可以直接返回一个能描述内容的字符串。这样 `NSLog` 就能将对象转为文本方式进行显示了，即可以使用字符串格式化输出。

    2016-05-02 14:12:43.106 Untitled Page 3[5161:524832] Superfoo!
    2016-05-02 14:12:43.107 Untitled Page 3[5161:524832] Superbar!

如果是 Swift 原生类，`NSLog` 同样支持调试变量 `debugDescription` （OS X 10.8 以上），这是调试输出最为推荐的方式。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。