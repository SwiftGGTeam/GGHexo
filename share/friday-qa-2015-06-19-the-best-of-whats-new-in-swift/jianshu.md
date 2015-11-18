Swift 中最棒的新特性

> 作者：Mike Ash，[原文链接](https://www.mikeash.com/pyblog/friday-qa-2015-06-19-the-best-of-whats-new-in-swift.html)，原文日期：2015/06/19
> 译者：[Yake](http://blog.csdn.net/yake_099)；校对：[numbbbbb](https://github.com/numbbbbb)；定稿：[shanks](http://codebuild.me/)
  







苹果公司在今年的 WWDC 大会上发布了 Swift 2 以及相关的新特性，相比之下其他的内容就无聊多了。除了宣布 Swift 将会开源并且这门语言由苹果独立开发完成之外，Swift 2 还包含很多新的特性，这将大幅改善这门语言。今天我将介绍最重要的几个新特性。



## 函数指针

这是目前为止我最喜欢的 Swift 新特性。这是一个比较小但是非常重要的特性，因为它填补了 Swift 桥接 C 语言的最后一个漏洞。

之前，Swift 将 C 语言中的函数指针类型作为不透明类型。如果拿到一个函数指针，你可以持有它。如果函数指针是一个参数，你可以传递它。但是你不能调用函数指针，更重要的是不能创建一个指向你的 Swift 代码的函数指针。你可以获取一个`CFunctionPointer`类型的指针但是你几乎什么都做不了。与这些 API 交互的最明智的方法就是把它们封装在 C 或者 OC 的 API 中。

Swift 2 中`CFunctionPointer`的神秘世界即将结束，Swift 中的函数类型已经有了许多变种。任何 Swift 函数类型都可以选择性地通过`@convention`标识符来进行注解，以此说明函数类型。默认的标注是`swift`，表示这是一个正常的 Swift 函数。标注为`block`则说明这是 OC 中的`block`类型。这些一直都是自动桥接的，但是现在书写方式更加明确。最后，`c`标注表明这是一个 C 语言函数指针。通过`@convention(c)`标注的函数类型在多数情况下表现正常，所以你可以像往常那样调用并传递他们。

上面之所以说“多数情况下”是因为 C 语言函数类型有很大的限制，而这必然会在 Swift 中体现出来。特别的，C 语言函数指针在编码中是纯粹的指针，没有相关联的数据。而 Swift 函数经常会有内含的相关数据，例如对象中的方法，或者是从某段封闭的代码中捕获值的闭包。由于这种不匹配，只有全局 Swift 函数、嵌套函数或者没有捕获值的匿名函数可以被作为`@convention(c)`标记类型的参数传递。

下面是这种新特性在实际中的例子：

    
    atexit({ print("Goodbye!") })

当程序退出的时候会打印“Goodbye!”

下面这段代码将不会起作用，这就体现了 C 函数指针的限制性（除非被放在全局范围内）：

    
    let x = 42
    atexit({ print("The answer is \(x)") })
    atexit({ print("Goodbye!") })

编译器解释：C 语言指针不能由捕获上下文内容的闭包形成。

这种限制很正常，但也是我们在跟 C 语言打交道时需要经常处理的问题。
尽管如此，这依然很有用，我们可以借此使用 C 语言 API 中的一些类。

## 协议扩展

这是目前为止我最喜欢的 Swift 新特性。协议扩展允许协议包含方法的实现，而不仅仅是方法的声明。这是我多年以来都希望在 OC 中出现的特性，我很开心地看到它出现在了一门新的语言中。

之前，在 OC 和 Swift 中，协议只包含方法的声明。这纯粹是定义接口，即列举了一些遵守协议的类需要实现的一些方法。而在 Swift 2 中，协议不仅包括方法的声明也包括方法实现。

通常会有一些方法适用于所有遵守了某个特定接口的类。例如，所有的集合都支持`map`操作，可以通过`map`来创建一个新集合。在旧版的协议中，有两种方式可以使集合具有这个功能：你可以把方法放在协议中，要求每一个遵守协议的类型都实现这些方法，也可以写一个全局函数，通过这个函数来处理每个遵守协议的类型。

Cocoa 大多数情况下使用前一种解决方案。可变的 Cocoa 集合类型也有相似的功能，虽然他们不是任何正式协议的一部分，如`enumerateObjectsUsingBlock:`，每一个集合类型的对象都会单独实现这个方法。

Swift 在以前采用后一种解决方案。全局函数如`map`作用于所有遵守`CollectionType`协议的类型。这很容易实现代码复用，但是语法很蹩脚，并且也不能根据某个特定的类型进行定制。

有了协议扩展，就有了第三种选择：可以在`CollectionType`协议的扩展中实现`superior.map`方法。所有遵守`CollectionType`协议的类就自动获得了`map`方法的实现。

下面简单实现了`map`函数：

    
    extension CollectionType {
        func myMap<U>(f: Self.Generator.Element -> U) -> [U] {
            var result: [U] = []
            for elt in self {
                result.append(f(elt))
            }
            return result
        }
    }
    
    [1, 2, 3, 4].myMap({ $0 * 2 })
    // This produces [2, 4, 6, 8]

之前在数组中可以通过扩展实现，但是只在`Array`类型中可用。有了协议扩展，就可以毫不费力地使其同样适用于任何遵守`CollectionType`协议的类，比如`Set`和`ArraySlice`。

对于`Swift`协议扩展来说，一个特别有趣的特性是它可以被赋予类型约束。例如，你可能想实现一个`max`属性。但是`max`属性在概念上并不适用于所有的集合，只有集合中的对象有某种顺序时max才起作用。那不是问题，只要给扩展加一条限制即集合中的元素必须是`可比较的(Comparable)`：

    
    extension CollectionType where Self.Generator.Element: Comparable {
        var max: Self.Generator.Element {
            var best = self[self.startIndex]
            for elt in self {
                if elt > best {
                    best = elt
                }
            }
            return best
        }
    }
    
    Set([5, 4, 3, 2, 1]).max
    // This produces 5
    
    [NSObject(), NSObject()].max
    // This produces an error, as NSObject is not Comparable

协议扩展有一个很小但是也很重要的特质，这个特性决定了协议扩展方法是否可以被动态调度。

协议扩展中实现的方法可能在协议本身中声明，也可能只存在于协议扩展中。只存在于协议扩展中的方法不能被动态调度且不能被重载。而同时也在协议本身中声明的方法可以被动态调度且可以被重载。这有点难解释，下面是一个例子：

    
    protocol P {
        func a()
    }
    
    extension P {
        func a() {
            print("default implementation of A")
        }
    
        func b() {
            print("default implementation of B")
        }
    }
    
    struct S: P {
        func a() {
            print("specialized implementation of A")
        }
    
        func b() {
            print("specialized implementation of B")
        }
    }
    
    let p: P = S()
    p.a()
    p.b()

打印结果是"specialized implementation of A"后面跟着"default implementation of B.”。虽然`Struct`包含了`b`的实现，但是它没有能够覆盖协议的`b`方法，因为协议没有包含方法`b`的声明。本质区别在于，协议中声明的方法是有默认实现的，而协议扩展中的方法实现是依附于协议的。

我相信协议扩展是苹果对于可选协议方法这个问题的答案。纯粹的 Swift 协议不包含可选协议方法。在 OC 中我们已经习惯了用类似代理的方式来实现可选协议方法：

    objectivec
    @protocol MyClassDelegate
    @optional
    
    - (BOOL)shouldDoThingOne;
    - (BOOL)shouldDoThingTwo
    
    @end

协议的遵守者在调用这些方法时将会检查`respondsToSelector:`，纯粹的 Swift 没有对应功能：

    
     protocol MyClassDelegate {
        func shouldDoThingOne() -> Bool
        func shouldDoThingTwo() -> Bool
    }

之前，所有遵守协议的类型都被要求实现这些方法。Cocoa 认为代理已经可以实现 Swift 2 中的协议扩展，它与 Objective-C 中的`@optional`基本相同，但是不要求运行时检查。

## 错误处理

这是目前为止我最喜欢的 Swift 新特性（原谅博主爱的太多）。Swift 刚出现时不支持异常处理，许多人对此很绝望。不过这种绝望毫无意义，因为 OC 也没有真正地支持异常处理。虽然有语法、编译器、运行时机制来处理异常，但是通过代码来处理异常是很麻烦的，许多人都不处理。当使用 ARC 时就更加证实了上述观点，因为 ARC 中默认形成的代码不是异常安全（exception safe）的。

考虑到这种情况，OC 实际上只用异常来标识编程错误。有不少这样的异常，不过 Cocoa 中一般只使用异常来标识断言失败（assertion failures）。第三方的代码通常也是这样。这有些奇怪，这也就是说你可以捕获异常然后继续运行，但是在断言失败之后还这么做就不是什么好主意了。

由于实际在 OC 中异常并不能真的被用于标识可恢复性错误，Cocoa 采用**NSError **惯例，这样一来所有可能产生错误的方法都有了一个额外的`NSError **`类型的参数，用那个参数来返回错误信息。这的确有用，但是`NSError **`接口设计得不好，用它反而会让你的代码变得更糟。

你也可以忽略错误，因为惯例中这些参数也可以接收`NULL`，那就意味着“我不关心错误，不用把它传给我”。但是我想告诉你，我见过很多次我的同事因为一段代码错误急的抓耳挠腮，因为他们给`error`参数传了`NULL`。如果你愿意倾听的话，程序会告诉你到底哪里出了问题。

Swift 2 中引进了一种错误处理方式，这种方式试图找到以上两种技术的平衡点。在语句构成上，它效法异常。在语义上，它更像是`NSError **`。最终的样子看起来有点奇怪，但是效果相当不错。

让我们来看一个例子。将一个文件夹写入磁盘是一个可能会失败的普通操作。在 Cocoa 中，它看起来是这样的：

    
    NSError *error;
    BOOL success = [data writeToFile: path options: options error: &error];
    if(!success) {
        // respond to the error somehow
        return;
    }
    // proceed normally


如果 Cocoa 使用异常来标记这类错误，代码看起来是这样的：


    
    @try {
        [data writeToFile: path options: options];
        // proceed normally
    } @catch(NSError *error) {
        // respond to the error somehow
    }

在 Swift 2 中，你会这么写：

    
    do {
        try data.writeToFile(path, options: options)
        // proceed normally
    } catch {
        // respond to the error somehow
    }

代码表面上看与异常相似，但是 Swift 中的方法与异常是有很大不同的。

Swift 的错误是由编译器检查的。这与一些语言（比如 Java）很像，在 Java 中抛出异常的可能性是方法类型签名的一部分。在 OC 以及其他一些语言中一切都可以潜在地抛出异常，而 Swift 在本质上与他们不同。

如果程序中的异常不能被完全监测到，那就意外着你要么在每一段代码中加入异常处理，要么你就需要去查阅资料（文档、源代码）确认哪些方法能够抛出异常哪些不能。在 Swift 的方法中，如果你忘了`writeToFile`抛出的异常，编译器就会告诉你。而 OC 的方法中，你的代码会编译、运行并且正常工作，直到有一天写入操作失败，你会突然发现自己就像伦敦东区的皮鞋匠，在维多利亚人闪闪发亮的鞋子中思考着“未定义行为”的意义。

我所了解的（目前为止）Swift 错误处理中比较特别的一点是 ，每一句可能抛出异常的代码前面都要有 try 关键字。而 Java 样式的异常检查，唯一的要求就是，要么把抛出异常的方法放在一个能够返回一个合适的异常类型的方法中，要么放在一个 try 代码块中。为了列举这个不同点，请看这两段假设的代码：

    
    // Java style
    try {
        String name = textField.value();
        Data nameBytes = name.getBytes("UTF-8");
        nameBytes.writeToFile(path);
        proceedWithName(name);
    } catch(IOException exception) {
        ...
    }
    
    // Swift style
    do {
        let name = textField.value
        let nameBytes = name.dataUsingEncoding(NSUTF8StringEncoding)!
        try nameBytes.writeToFile(path, options: [])
        proceedWithName(name)
    } catch {
        ...
    }

快看，第一个版本抛出了哪个调用？除非你查阅try代码段中每句调用的接口否则你无法知道。现在，第二个版本哪个调用会被抛出？那很简单：`writeToFile`这句。

你可能会说只从那些调用上看就很明显抛出了什么。但是或许`proceedWithName`也可以产生错误并且抛出异常。对比一下：

    
    // Java style
    try {
        String name = textField.value();
        Data nameBytes = name.getBytes("UTF-8");
        nameBytes.writeToFile(path);
        proceedWithName(name);
    } catch(IOException exception) {
        ...
    }
    
    // Swift style
    do {
        let name = textField.value
        let nameBytes = name.dataUsingEncoding(NSUTF8StringEncoding)!
        try nameBytes.writeToFile(path, options: [])
        try proceedWithName(name)
    } catch {
        ...
    }

Java 版本的没有变化，而 Swift 版则显示现在有两个调用可能会失败。

在 Java 中，你通常会尽量减少 try 代码块中的代码，就是为了能够明显辨别哪句调用能抛出异常而哪些只是附带的代码。在 Swift 中，你不需要担心这个，因为每一句抛出异常的代码都被明确做了标记。

当整个方法都被标记为`throws`时那就显得意义重大了。Java 类型的异常检查，一旦你将某个方法声明为`throws IOException`，那么方法中的一切都可以抛出那个类型。在 Swift 中，一个被标记为`throws`的方法里面每一句可能抛出异常的调用前面都需要用`try`关键字进行标注，所有异常的抛出还是很明显。

另外一个与 Java 不同的地方是，Swift 有一个内嵌的以`try!`形式存在的“不失败”机制。有时一个方法只会在某种情况下调用失败，并且你知道你所使用的那种情况下它是不会失败的。上述`getBytes`调用就是 Java 中的一个很好的例子：它抛出`UnsupportedEncodingException`但是它能保证传入“UTF-8”时一定不会抛出异常。即使你知道这不会失败但调用时需要用`try`来解包。在 Swift 中，你可以使用`try!`来完成这些，既清楚又简短。这与“!”后缀语法配合得很好，`!`后缀用来解包你知道肯定不会为`nil`的可选类型，就像上面的`dataUsingEncoding`，类似的还有`as!`操作符来转换类型并且你已知这个操作肯定会成功。

和 Java 相比，Swift 中的错误被检查时，只能检查一个错误能够抛出异常。但 Java 中的方法用`throws`标注时就指明了能被抛出的类型。调用者知道它只需要检查这些类型，而编译器对应地将一切进行类型检查。Swift 中用`throws`标注时没有类型信息。这种类型信息在 Java 中确实有用，但是嵌套`throws`标注的语句时就有局限性。这在 Swift 中会导致什么结果呢？应该会很有趣。

## `Guard`语句

这是目前为止我最喜欢的 Swift 特性（他到底最喜欢哪个啊……）。它很小也很简单你甚至会觉得它是多余的。但是它会让代码的读写性变得更好。

`Guard`语句实际上是一个反转的`if`语句。在`if`语句中你这么写：

    
    if condition {
        // true branch
    } else {
        // false branch
    }

有了`guard`，为真的那个分支从上面跑到了为假的那个分支的下面：

    
    guard condition else {
        // false branch
    }
    // true branch

注意为假的分支中的代码会在那个范围内以某种方式终止执行，比如返回一个值或者是抛出错误。你就能被保证为真的分支中的代码只在条件为真的情况下执行。

这使得`guard`成为一种能够排除错误条件的很自然的方式，有了这种方式，在多重if嵌套语句中就不需要一直走到“金字塔顶“，并且也不需要将条件反转。下面是一个典型的金字塔：

    
     let fd1 = open(...)
    if fd1 >= 0 {
        let fd2 = open(...)
        if fd2 >= 0 {
            // use fd1 and fd2 here
            close(fd2)
        } else {
            // handle fd2 error
        }
        close(fd1)
    } else {
        // handle fd1 error
    }

这实在是太丑了，并且随着你把它们一层层堆起来它会变得更糟。代码一直在缩进并且错误处理代码被堆到了老远的地方。为比避免这种情况发生我们可以反转条件：

    
    let fd1 = open(...)
    if fd1 == -1 {
        // handle fd1 error
        return
    }
    
    let fd2 = open(...)
    if fd2 == -1 {
        // handle fd2 error
        close(fd1)
        return
    }
    
    // use fd1 and fd2 here
    close(fd1)
    close(fd2)

这看起来好多了，但是烦人的是，条件现在被反转为检查错误情况而不是正确情况了。更糟的是如果你忘了`return`语句，编译器就不管了，你的代码会开开心心地在错误情况执行完之后继续执行。`guard`解决了所有这些问题：

    
    let fd1 = open(...)
    guard fd1 >= 0 else {
        // handle fd1 error
        return
    }
    
    let fd2 = open(...)
    guard fd2 >= 0 else {
        // handle fd2 error
        close(fd1)
        return
    }
    
    // use fd1 and fd2 here
    close(fd1)
    close(fd2)

这就更好了！这看起来更清晰了，并且从编译器那里获得了更多的帮助。但是这并没有什么特别的啊，那为什么这是我最喜欢的呢？那是因为，跟`if`语句一样，`guard`语句也可以包含变量声明并且检查是否为`nil`。但`guard`语句又不像`if`语句那样，声明的变量不仅仅是在`guard`语句范围内可用。为了帮助大家理解，我们先来看上面例子的一个可选类型版本，首先是那个金字塔：

    
    if let file1 = Open(...) {
        if let file2 = Open(...) {
            // use file1 and file2
            file2.close()
        } else {
            // handle file2 error
        }
        file1.close()
    } else {
        // handle file1 error
    }

我们像之前那样反转条件：

    
    if !let file1 =

哦！你不能反转`let`语句，我们再试试：

    
    let file1 = Open(...)
    if file1 == nil {
        // handle file1 error
        return
    }
    
    let file2 = Open(...)
    if file2 == nil {
        // handle file2 error
        file1.close()

哦！可选类型没有解包。我们必须单独处理。再试试：

    
    let file1Optional = Open(...)
    if file1Optional == nil {
        // handle file1 error
        return
    }
    let file1 = file1Optional!
    
    let file2Optional = Open(...)
    if file2Optional == nil {
        // handle file2 error
        file1.close()
        return
    }
    let file2 = file2Optional!
    
    // use file1 and file2 here
    file1.close()
    file2.close()

好了。但是一团乱。`guard`会让它变得更好：

    
    guard let file1 = Open(...) else {
        // handle file1 error
        return
    }
    guard let file2 = Open(...) else {
        // handle file2 error
        file1.close()
        return
    }
    
    // use file1 and file2 here
    file1.close()
    file2.close()

更好了！唯一不好的是`file1.close()`代码重复了，并且清除代码确实离初始化的代码太远了，这……

## `Defer`语句

这是目前为止我最爱的 Swift 新特性（又见最爱……）。`defer`语句与很多其他语言中的`finally`语句很像，不过它不需要与`try`语句绑定在一起，你可以把它放在任何你想放的位置。如果你写了`defer{…}`，那么那个代码块中的代码就会在控制离开当前函数的范围时执行，无论函数最后是运行到了结尾，还是遇到了`return`语句，或者是抛出了错误。

这就可以让你把清除代码放在要清除的那些东西的后面，而不是在最后。例如：


    
    let tmpMemory = malloc(...)
    defer { free(tmpMemory) }
    
    // use tmpMemory here

它与`guard`语句搭配得很好，这样一来，创建、错误处理以及清除都可以共存了。下面是上述例子使用了defer语句之后：

    
    guard let file1 = Open(...) else {
        // handle file1 error
        return
    }
    defer { file1.close() }
    
    guard let file2 = Open(...) else {
        // handle file2 error
        return
    }
    defer { file2.close() }
    
    // use file1 and file2 here
    // no need for cleanup at the end, it's already done

注意`file1`的`defer`语句不仅处理了正常情况还处理了`file2`失败时的情况。这个就清除了之前例子中的重复代码，并且帮助我们在任何分支中都不忘了清除操作。由于错误常常不能被测试，因此产生错误时不能正常执行清理操作是一个很常见的问题，而`defer`可以保证那种情况不会发生。

## 结论

这是目前为止我最喜欢的关于 Swift 新特性的文章。看起来 Swift 2 在 Swift 的基础上有了很大的提升，解决了许多不足之处并添加了很多重大改进。

今天就这样吧，欢迎下次再来学习一些新的并且激动人心的东西。Friday Q&A 是在读者的建议中产生的，所以如果你想看到哪些内容，请发给[我](mailto:mike@mikeash.com)。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。