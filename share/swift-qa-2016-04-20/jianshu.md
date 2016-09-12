每周 Swift 社区问答：@objc"


Swift 和 Objective-C 的互调这个话题很大，今天我们重点看看其中一个小的知识点：`@objc`的使用。



## 用法

在 Swift 代码中，使用`@objc`修饰后的类型，可以直接供 Objective-C 调用。可以使用`@objc`修饰的类型包括：

* 未嵌套的类
* 协议
* 非泛型枚举（仅限于原始值为整形的类型）
* 类和协议中的属性和方法
* 构造器和析构器
* 下标

我们逐个来看看实际的使用：

### 类

    @objc class MyHelper:NSObject {
        // class code
    }

Objective-C 中所有的类都需要继承自`NSObject`，Swift 中的类需要供 Objective-C 调用的时候，自然也需要继承自`NSObject `(谢谢网友潇小溅纠错：Swift 中声明继承`NSObject` 的类，不需要显式使用 `@objc` 修饰， Swift 编译器会默认加上）。当然，你也可以继承所有 Objective-C 中的类，因为他们本身也继承自`NSObject`:

    @objc class MyViewController : UIViewController {
        
    }

另外一个细节是，Swift 中的类名，可以使用中文命名，而 Objective-C 中的却只能使用 ASCII 码，在使用`@objc`时，需要指定 Objective-C 中使用的 ASCII 名称。这个知识点请参见喵神的 [tips](http://swifter.tips/objc-dynamic/)：

    @objc(MyClass)
    class 我的类: NSObject {
        @objc(greeting:)
        func 打招呼(名字: String) {
            print("哈喽，\(名字)")
        }
    }

### 协议

`@objc`修饰协议与修饰类一样，需要注意的是，如果协议中有`optional`修饰的方法，就必须使用`@objc`来修饰：

    @objc protocol CounterDataSource {
        optional func incrementForCount(count: Int) -> Int
        optional var fixedIncrement: Int { get }
    }

关于可选协议的描述，可以参见[官方教程](http://wiki.jikexueyuan.com/project/swift/chapter2/22_Protocols.html#optional_protocol_requirements)

### 枚举
Swift 中的枚举类型，功能增强了不少。Objective-C 中还是传统的枚举类型，必须使用整型作为原始值。这样看来，Swift 中的枚举类型如果要被`@objc`修饰，则需要满足原始值是整型的限制条件。不然就会报编译错误。
关于如何在 Objective-C 中使用 Swift 枚举类型，可以见这个[帖子](http://stackoverflow.com/questions/24139320/is-it-possible-to-use-swifts-enum-in-obj-c/24139544#24139544):

    // Swift
    @objc enum Bear: Int {
        case Black, Grizzly, Polar
    }
    
    // OC 
    Bear type = BearBlack;
    switch (type) {
        case BearBlack:
        case BearGrizzly:
        case BearPolar:
           [self runLikeHell];
    }

### 其他
在类和协议中的属性和方法，构造器和析构器，下标中使用`@objc`修饰的用法与上面的用法一样。这里举一个官网的例子说明：

    @objc class ExampleClass: NSObject {
        var enabled: Bool {
            @objc(isEnabled) get {
                // Return the appropriate value
            }
        }
    }
需要注意的是，如果类中方法或者属性被`@objc`修饰，那么类就必须被`@objc`修饰。


## stackoverflow 相关问题整理

* [Swift 2 Syntax Converter @objc being removed](http://stackoverflow.com/questions/32570744/swift-2-syntax-converter-objc-being-removed)

	以下代码是错的：

	    @objc class test {
        
    	}
	使用`@objc`修饰的类，必须继承自`NSObject`。
	
* [Swift class add “@objc” for why](http://stackoverflow.com/questions/27558694/swift-class-add-objc-for-why)

	`@objc`修饰协议的用法已经在前面介绍过了。楼主也从官方文档中看到了相关介绍，他的问题是如何使用`@objc`修饰类，正确的用法姿势是神马？
	
* [when to use @objc in swift code?](http://stackoverflow.com/questions/30795117/when-to-use-objc-in-swift-code)

	新人问题，什么时候使用`@objc`。
	
* [@objc protocol crashes the swift compiler](http://stackoverflow.com/questions/24564830/objc-protocol-crashes-the-swift-compiler)

	协议中方法可选实现的问题。

* [Need clarification on “@objc class” in Swift](http://stackoverflow.com/questions/32020741/need-clarification-on-objc-class-in-swift)

	又一个`@objc`修饰类的问题。不同的视角。
	
* [@objc error when migrated to Swift 2](http://stackoverflow.com/questions/32626706/objc-error-when-migrated-to-swift-2)

	Swift 2以后，必须显式声明类是`NSObject`的子类，不然使用`@objc`修饰Swift类就会报错。苹果官方论坛中有篇[帖子](https://forums.developer.apple.com/thread/11867)也对此进行了解答。

* [Extend @objc protocol with Comparable in Swift](http://stackoverflow.com/questions/34787721/extend-objc-protocol-with-comparable-in-swift)
	
	如何定义一个带有`@objc`修饰的协议，遵从`Equatable `协议？

### 参考资料
* 喵神tips：[@OBJC 和 DYNAMIC](http://swifter.tips/objc-dynamic/)