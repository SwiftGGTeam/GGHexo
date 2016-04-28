每周 Swift 社区问答：@noreturn"


今天我们来看看一个比较冷门的特性关键字：`@noreturn`。



## 用法

`@noreturn` 不是 Swift 的独创，在其他语言中有类似的语法。比如在 C 语言中，就有 `NORETURN ` 的宏。他们表达的功能是一样的：[一旦你调了这个函数，它永远不会返回](http://bbs.chinaunix.net/thread-4058052-1-1.html)。

苹果官方文档对`@noreturn`关键字只有2段文字介绍，让我们来看看我们翻译组的翻译后的文字：

> 该特性用于修饰函数或方法声明，表明该函数或方法的对应类型 T 是 @noreturn T。你可以用这个特性修饰函数或方法类型，以此表明函数或方法不会返回到它的调用者。

> 对于没有用 noreturn 特性标记的函数或方法，你可以将它重写为用该特性标记的。相反，对于已经用 noreturn 特性标记的函数或方法，你不可以将它重写为没使用该特性标记的。当你在一个某个采纳协议的类型中实现协议方法时，该规则同样适用。


在喵神的[文章](http://swifter.tips/fatalerror/)中, 系统方法`fatalError`用到了`@noreturn`：

    @noreturn func fatalError(@autoclosure message: () -> String = default,
                              file: StaticString = default,
                              line: UInt = default)

Swift 所有函数和方法都可以调用`fatalError`, 有了`@noreturn`的修饰以后，`fatalError`不关心调用者需要返回什么，因为到了`fatalError`以后，直接就终止了。

编译器遇到`@noreturn`的修饰的函数调用时，会做一些检查。写在这些函数调用之后的代码，不会运行到，编译器会给出一个警告: 

    func test() {
        fatalError("test")
        var a = 1 // 警告：Will never be executed
        a = a + 1
    }
    
    test()

## stackoverflow 相关问题整理

* [Convincing Swift that a function will never return, due to a thrown Exception](http://stackoverflow.com/questions/27829132/convincing-swift-that-a-function-will-never-return-due-to-a-thrown-exception)
	
	如何自定义带有`@noreturn`修饰的函数？这篇问答可以找到答案。

### 参考资料
* 喵神tips：[FATALERROR](http://swifter.tips/fatalerror/)