何时用 struct？何时用 class？"

> 作者：Mike Ash，[原文链接](https://www.mikeash.com/pyblog/friday-qa-2015-07-17-when-to-use-swift-structs-and-classes.html)，原文日期：2015-07-17
> 译者：[muhlenXi](http://muhlenxi.com/)；校对：[Firecrest](undefined)，[numbbbbb](http://numbbbbb.com/)，[Cee](https://github.com/Cee)；定稿：[CMB](https://github.com/chenmingbiao)
  









在 Swift 的世界中，有一个热议很久的主题，何时使用 `class` 和何时使用 `struct` ，今天，我想发表一下我自己的观点。



## 值类型 VS 引用类型

事实上，这个问题的答案很简单：当你需要值语义的时候用 `struct` ，当你需要引用语义的时候就用 `class` 。

好了，下周同一时间请再次访问我的博客……

**等等**

怎么了？

**这没有回答上述中的问题**

你什么意思？答案就在那儿。

**是的，但是……**

但是什么？

**那什么是值语义，什么是引用语义呢？**

昂，你提醒了我。我确实应该讲解一下。

**还有它们和 struct、class 的关系**

好吧。

这些问题的核心就是数据和数据的存储位置。我们用局部变量、参数、属性和全局变量来存储数据。存储数据有两种最基本的方式。

对于值语义，数据是直接保存在变量中。对于引用语义，数据保存在其他地方，变量存储的是该数据的引用地址。当我们访问数据时，这种差异不一定很明显。但是拷贝数据时就完全不一样了。对于值语义，你得到的是该数据的拷贝。对于引用语义，你得到的是该数据的引用地址拷贝。

这有些抽象，我们通过一个示例来了解一下。先暂时跳过 Swift 的示例，一起来看一个 Objective-C 的示例：

    objc
        @interface SomeClass : NSObject 
        @property int number;
        @end
        @implementation SomeClass
        @end
        
        struct SomeStruct {
            int number;
        };
        
        SomeClass *reference = [[SomeClass alloc] init];
        reference.number = 42;
        SomeClass *reference2 = reference;
        reference.number = 43;
        NSLog(@"The number in reference2 is %d", reference2.number);
        
        struct SomeStruct value = {};
        value.number = 42;
        struct SomeStruct value2 = value;
        value.number = 43;
        NSLog(@"The number in value2 is %d", value2.number);

打印的结果如下：

    objc
        The number in reference2 is 43
        The number in value2 is 42

为什么打印结果会不一样?

代码 `SomeClass *reference = [[SomeClass alloc] init]` 在内存中创建了 SomeClass 类的一个新实例，然后将该实例的引用放到 reference 变量中。代码 `reference2 = reference` 将 reference 变量的值（实例的引用）赋值给新的 reference2 变量。然后 `reference.number = 43` 将两个变量指向的对象（同一个对象）的 number 属性修改为 43。 这就导致打印的 reference2 的值也是 43。

代码 `struct SomeStruct value = {}` 创建  SomeStruct 结构体的一个新实例并赋值给变量 value。代码 `value2 = value` 拷贝 value 的值到 变量 value2 中。每个变量包含各自的数据块。而代码 `value.number = 43` 仅仅修改 value 变量的值。所以，value2 变量的值仍然是 42。



用 Swift 实现这个例子：

    
        class SomeClass {
            var number: Int = 0
        }
        
        struct SomeStruct {
            var number: Int = 0
        }
        
        var reference = SomeClass()
        reference.number = 42
        var reference2 = reference
        reference.number = 43
        print("The number in reference2 is \(reference2.number)")
        
        var value = SomeStruct()
        value.number = 42
        var value2 = value
        value.number = 43
        print("The number in value2 is \(value2.number)")

和之前一样，打印如下：

    
        The number in reference2 is 43
        The number in value2 is 42

## 使用值类型的经验

值类型不是新出的类型。但是对于很多人来说，他们*感觉上*很新。这是怎么回事？

大部分 Objective-C 代码不会用到 struct。我们通常操作的是 CGRect 、 CGPoint 和友元，很少自己定义结构体。一方面，结构体不实用，无法做函数式的引用赋值。在 Objective-C 中，正确保存对象的引用到 struct 中是很困难的，尤其是使用 ARC 的时候。

大部分语言没有类似 struct 结构体的东西。像 Python 和 JavaScript 这样“一切皆对象”的语言都只有引用类型。如果你是从这样的语言转到 Swift，值类型这个概念可能对你来说更加陌生。

不过等一下！有一个地方几乎所有的语言都会使用值类型：数值（number）！只要你写过一段时间代码，无论是什么语言，肯定能理解下面这段代码的行为：

    
        var x = 42
        var x2 = x
        x++
        print("x=\(x) x2=\(x2)")
        // prints: x=43 x2=42

这对我们来说是非常明显和自然的，我们甚至没有意识到它的行为与众不同。但是它确确实实是值类型。从你编程的第一天开始就一直在使用值类型，即使你没有意识到这一点。

由于许多语言的核心是“一切皆对象”，number 其实是用引用类型来实现的。然而，它们是不可变引用类型，不可变引用类型和值类型的差异是很难察觉的。它们的行为和值类型一样，即使它们不是以这种方式实现。

这是理解值类型和引用类型的重要部分。就语言语义方面，区别是很重要的。当修改数据时，如果你的数据是不可变的，那么值类型/引用类型之间的区别就消失了，或者至少变成纯粹的性能问题而不是语义问题。

Objective-C 中也有类似的东西，就是标记指针（tagged pointers）。标记指针把对象直接存储在指针值中，因此它实际上是值类型，拷贝指针相当于拷贝对象。Objective-C 的库只会把不可变类型存储到标记指针中，所以使用的时候感受不到区别。有些 NSNumber 是引用类型，有些是值类型，但是使用上没有区别。

## 做出选择

既然我们已经知道值类型是如何工作的，那么你自己的数据类型该用什么呢？

这两者之间的根本区别在于，当你使用 `=` 时会发生什么。值类型会得到该对象的副本，引用类型仅仅得到该对象的引用。

因此，决定使用哪一个的基本问题是：是否需要拷贝？是否需要经常拷贝？

首先来看一些毫无争议的例子。Integer 显然是可拷贝的，它应该是值类型。网络套接字（Network sockets）明显是不可拷贝的，它应该是引用类型。再比如使用 (x, y) 实数对表示的坐标（Points）是可拷贝的，它应该是值类型。代表磁盘的控制器是明显不可拷贝的，它应该是引用类型。

有些类型理论上*可以*拷贝，但是这种拷贝可能不是你想要的。这种情况下，它们应该是引用类型。举个例子，屏幕上的按钮在代码层面可以拷贝，但是拷贝的按钮和原始按钮并不一样。点击拷贝的按钮并不会触发原始按钮，拷贝的按钮在屏幕上的位置也和原始按钮不一样。如果你需要把按钮当成参数传递，或者将它赋值给一个新变量，那你需要的是原始按钮的引用，只有明确声明的时候才进行拷贝。因此，按钮应该是引用类型。

视图和窗口控制器也类似。它们可以支持拷贝，但一般来说这不是你期望的行为，它们应该是引用类型。

接着谈谈模型（model）类型。假设你有一个 User 类型，用来表示系统中的用户，然后用 Crime 类型来表示 User 的操作。这两个类型看起来都可以拷贝，可以设置成值类型。但是，如果你的程序需要更新 User 的 Crime 并且能把改动同步到其他代码，那最好用一个用户控制器（User Controller）来管理 User，显然这个用户控制器应该是引用类型。

集合是个有趣的例子。集合包括数组、字典、字符串等类型。它们是可拷贝的吗？显然是。是否需要经常拷贝？这就不好说了

大部分语言的回答是“No”，它们的集合是引用类型。比如 Objective-C、Java、Python、JavaScript 以及一些我能想到的语言。（一个例外是 C++ 的 STL 集合，但是 C++ 是语言中的疯子，它做的每件事都很奇怪。）

Swift 是可拷贝的。这意味着 `Array` 、 `Dictionary` 和 `String` 是结构体而不是类。可以将他们的拷贝作为参数来使用。如果拷贝付出的代价很小，这么做就完全合理。Swift 为了实现这个功能花了很大功夫。。

## 嵌套类型

嵌套值类型和引用类型有四种方式。哪怕只用到了其中一种，你的生活都会变得更加有趣。

1. 包含其他引用类型的引用类型，这没什么特别的。如果持有内部或外部值的引用，就可以修改这个值。改动会同步到所有持有者。
2. 包含其他值类型的值类型，这样做的结果是一个更庞大的值类型。当内部值是外部值的一部分时，如果你将外部值存储到某个新地方，整个值类型都会被拷贝，包括内部值。如果你将内部值储存到新地方，那就只拷贝内部值。
3. 包含值类型的引用类型，被引用的值会变大。外部值的引用可以操作整个对象，包括内部值。修改内部值时，外部值引用的持有者都会同步改动。如果你将内部值储存到新地方，它会被拷贝。
4. 包含引用类型的值类型，这就有点复杂了。你可能会遇到意料之外的行为。这有利有弊，取决于你的使用方式。如果你将一个引用类型放到值类型中，然后拷贝这个值类型到一个新地方，拷贝中的内部对象的引用值是相同的，它们都指向相同的地方。下面是一个示例：

    
        class Inner {
            var value = 42
        }
    
        struct Outer {
            var value = 42
            var inner = Inner()
        }
    
        var outer = Outer()
        var outer2 = outer
        outer.value = 43
        outer.inner.value = 43
        print("outer2.value=\(outer2.value) outer2.inner.value=\(outer2.inner.value)")

打印如下：

    
        outer2.value=42 outer2.inner.value=43

`outer2` 是 `outer` 的拷贝，它仅仅拷贝了 `inner` 的引用，因此两个结构体的 `inner` 共享一个存储空间。因此更新 `outer.inner.value` 的值会影响 `outer2.inner.value` 的值。神奇！

如果使用得当，上面的这种行为使编程变得很方便，它允许你创建一个支持写时复制的 `struct` ，允许你不需要拷贝大量的数据就可以实现值语义。这就是 Swift 的集合工作机制，你也可以创建自己的集合。如果想了解更多，可以阅读 [一起来构建 Swift Array](https://www.mikeash.com/pyblog/friday-qa-2015-04-17-lets-build-swiftarray.html)。

这种行为也相当危险。举个例子，你有一个可拷贝的 Person 类，所以它可以是 `struct` 类型，为了怀旧，你决定用 `NSString` 类型来保存姓名：

    
        struct Person {
             var name: NSString
        }

然后生成一对夫妇的实例，分别给每个实例的姓名赋值：

    
        let name = NSMutableString()
        name.appendString("Bob")
        name.appendString(" ")
        name.appendString("Josephsonson")
        let bob = Person(name: name)
        
        name.appendString(", Jr.")
        let bobjr = Person(name: name)

打印他们的姓名：

    
        print(bob.name)
        print(bobjr.name)

结果如下：

    
        Bob Josephsonson, Jr.
        Bob Josephsonson, Jr.

喔！

发生了什么？与 Swift 中的 `String` 类型不同，`NSString` 是一个引用类型，是不可变的，但是它有一个可变的子类 `NSMutableString` 。构建 bob 时，生成了一个被 name 中字符串所持有的引用。随后改变 这个字符串时，改动被同步到了 bob 中。虽然 bob 是用 `let` 声明值类型，但是此处的赋值操作显然改变了 bob。事实上，这没有覆写 bob，只不过是改变了 bob 持有的引用的数据。因为 name 是 bob 的一部分数据，从语义上看，就好像覆写了 bob。

这种行为在 Objective-C 中一直存在。每个有经验的 Objective-C 开发者都能避免这种行为。因为一个 `NSString` 实际上可能是一个 `NSMutableString` 。为了防止这种行为，可以声明一个 `copy` 的属性或者在初始化的时候显式的调用 `copy` 方法。在许多 Cocoa 的集合中可以发现这种做法。

Swift 的解决方法很简单：用值类型而不是引用类型。在这种情况下，声明 name 为 `String` 类型即可。这样就不用担心无意中出现存储共享的问题。

有些情况下，解决方法可能没有这么简单。举个例子，你可能会创建一个 包含引用类型变量 view 的 `struct` ，并且它不能改变为值类型。这*也许*表示你的类型不应该是 `struct` ，因为你无论如何也不能实现值语义。

## 结论

移动值语义类型的数据时，新数据是原数据的拷贝。然而，引用语义类型的数据得到的是原数据的引用拷贝。这意味着你可以在任何地方通过引用覆写原数据。而值语义只能通过改变原数据来改变原数据的值。选择类型时，要考虑该类型是否适合拷贝和倾向于拷贝的固有类型。最后，注意值类型中嵌套的引用类型，如果你不留心将会发生一些糟糕的事情。

今天的内容到此结束，这次是真的结束了，下次再见。你们的建议对 Friday Q&A  是最好的鼓励，所以如果你关于这个主题有什么好的想法，请[发邮件到这里](mailto:mike@mikeash.com)。

> 你喜欢这篇文章么？我的书里还有更多有意思的内容！第二卷 和 第三卷正在出售中！包括 ePub，PDF，纸质版，iBooks 和 Kindle，[点击查看更多信息](https://www.mikeash.com/book.html)。


> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。�在值类型中嵌入引用类型，不小心的话就会出错！
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。