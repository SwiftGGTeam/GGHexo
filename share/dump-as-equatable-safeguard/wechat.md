保护 Equatable 的实现"

> 作者：Ole Begemann，[原文链接](https://oleb.net/blog/2017/03/dump-as-equatable-safeguard/)，原文日期：2017-03-08
> 译者：[Cwift](http://weibo.com/277195544)；校对：[walkingway](http://chengway.in/)；定稿：[CMB](https://github.com/chenmingbiao)
  









假设你有一个结构体：

    
    struct Person {
        var name: String
    }

并且让其遵守 [Equatable](https://developer.apple.com/reference/swift/equatable)：

    
    extension Person: Equatable {
        static func ==(lhs: Person, rhs: Person) -> Bool {
            return lhs.name == rhs.name
        }
    }

实际的效果满足预期：

    
    Person(name: "Lisa") == Person(name: "Lisa") // → true
    Person(name: "Lisa") == Person(name: "Bart") // → false



## Equatable 的一致性是脆弱的

不幸的是，同我在 [上一篇文章](https://oleb.net/blog/2017/03/enums-equatable-exhaustiveness/) 中讲到的枚举的例子一样，这种方式实现的 Equatable 的一致性是非常脆弱的：每次向结构体中添加属性时，你都必须记得去更新 [== 函数](https://developer.apple.com/reference/swift/equatable/1539854)的实现。如果忘记的话，Equatable 的一致性就会被打破，这个 bug 多久会被发现取决于测试的质量 —— 这里编译器无法提供任何帮助。

例如，向该结构体中增加另一个字段：

    
    struct Person {
        var name: String
        var city: String
    }

由于 Equatable 的实现没有改变，两个名字相同的人就会被判定为相等 —— 根本没有考虑 city 属性：

    
    let lisaSimpson = Person(name: "Lisa", city: "Springfield")
    let lisaStansfield = Person(name: "Lisa", city: "Dublin")
    lisaSimpson == lisaStansfield // → true!!!

更糟糕的是，[与枚举的示例不同](https://oleb.net/blog/2017/03/enums-equatable-exhaustiveness/)，没有简单的方法来确保 == 函数避免出现这样的错误。除了 switch 语句，编译器没有其他针对上下文的穷尽性检查。（假设对类型进行判等的一般性规则是检查类型的所有存储属性是否相等，那么可以设想一下在未来当 == 的实现中没用使用对象的所有存储属性时（如果实践证明这确实是一个重要的错误来源），编译器应该发出警告。不过现在还没有这种机制。）

## 使用 dump 声明相等性

目前我使用标准库中的 [dump](https://developer.apple.com/reference/swift/1641218-dump)（转储）函数实现保护。dump 非常有趣，因为它使用 Swift 的反射功能，用一个字符串类型存储值或者对象中的所有存储字段。通常由 dump 展示出的值或者对象的内部情况要比其自身的 description 或者 debugDescription 更详细。dump 的输出如下所示：

    
    dump(lisaSimpson)
    // ▿ Person
    //   - name: "Lisa"
    //   - city: "Springfield"

下面的函数断言它的两个参数具有相同的 dump 输出：

    
    /**
     断言两个表达式具有相同的 `dump` 输出。
    
     - 注意：与标准库中的 `assert` 类似，该断言只在 Playground 文件以及 `-Onone` 模式的 Build 中才有效果。
     在开启优化后的 Build 中不起作用。
     - 可参考：`dump(_:to:name:indent:maxDepth:maxItems)`
     */
    func assertDumpsEqual<T>(_ lhs: @autoclosure () -> T,
        _ rhs: @autoclosure () -> T,
        file: StaticString = #file, line: UInt = #line) {
        assert(String(dumping: lhs()) == String(dumping: rhs()),
               "Expected dumps to be equal.",
               file: file, line: line)
    }
    
    extension String {
        /**
         使用给定值的 `dump` 输出创建一个字符串
         */
        init<T>(dumping x: T) {
            self.init()
            dump(x, to: &self)
        }
    }

**更新于 2017 年 3 月 9 日：** 非常感谢 Tim Vermeulen 提供的这个[函数版本](https://twitter.com/tim_vermeulen/status/839651813884309505)。它比我的原始版本简单得多，旧版本我保存在了文章末尾的附录中。

## 保护 == 函数

现在你必须在 == 函数中调用 assertDumpsEqual：

    
    extension Person: Equatable {
        static func ==(lhs: Person, rhs: Person) -> Bool {
            // 错误！没有包含 city 属性。
            let areEqual = lhs.name == rhs.name
            //保护：相等的值必须有相同的 dump
            if areEqual {
                assertDumpsEqual(lhs, rhs)
            }
            return areEqual
        }
    }

从现在开始，如果你判断相等的两个值具有不同的 dump 输出，程序会陷入运行时陷阱：

    
    lisaSimpson == lisaStansfield
    // Crash: assertion failed: Expected dumps to be equal.

![](https://oleb.net/media/xcode-assertion-equatable-dump-1270px.png)

当你忘记在 == 函数中包含 city 属性时，这个方案可以让你立即注意到这个问题。当然它不是 100% 安全的：编译期检查明显是更优秀的方案，而且你依旧必须要记得在 == 函数中调用 assertDumpsEqual 函数 —— 不过在每个类型中你只需调用一次，而不用为每个属性都添加一次方法调用。

**2017年3月9日更新：**使用该模式的话，== 函数的样式始终相同：测试值是否相等，如果为 true 则执行基于 dump 的断言，最后返回测试的结果。Tim Vermeulen [建议](https://twitter.com/tim_vermeulen/status/839651813884309505)创建一个[实现了该模式的协议](https://gist.github.com/timvermeulen/afd4a6aa4eb1cfc39fa8496673dc24af)，并将实际的判等测试作为自定义的参数。这是一种有趣的替换，为你节省了一些样板代码，代价是隐藏了具体的实现。

## 缺点

这个方案的最大缺点可能是 dump 在判等时不是一个完全可靠的方案。它应该可以很好地避免[漏报](https://en.wikipedia.org/wiki/False_positives_and_false_negatives#False_negative_error)，但有时你可能会遇到一些[误报](https://en.wikipedia.org/wiki/False_positives_and_false_negatives#False_positive_error)，即实际上相等但是 dump 的输出不同的值。误报的主要对象是 NSObject 的子类，这类对象是否相等不基于对象的标识，而是基于包含内存地址的 description（这是默认设置）。

我查看了一些标准库中的 Swift 类型以及 Apple 原生框架中的类，这些类型都遵守了 Equatable 协议，它们与 dump 的用法配合的很好。但是你必须注意在使用自定义的 NSObject 子类时需要重写 description。

## 结论

或许你可以使用 linter、静态分析工具、像 [Sourcery](https://github.com/krzysztofzablocki/Sourcery) 这样的代码生成工具或者其他的什么方法来保护 Equatable 的实现，避免回顾代码。不过，我不认为目前有任何代码分析工具能深入到本文所讨论的问题。我提出的这个并不完美的方案可能会帮你捕获一些 bug，直到你遇到更好用的工具。

## 附录

### 典型的 Swift 和 Objective-C 类型的 dump 输出示例

    
    dump([1,2,3])
    // ▿ 3 elements
    //   - 1
    //   - 2
    //   - 3
    dump(1..<10)
    // ▿ CountableRange(1..<10)
    //   - lowerBound: 1
    //   - upperBound: 10
    dump(["key": "value"])
    // ▿ 1 key/value pair
    //   ▿ (2 elements)
    //     - .0: "key"
    //     - .1: "value"
    dump("Lisa" as String?)
    // ▿ Optional("Lisa")
    //   - some: "Lisa"
    dump(Date())
    // ▿ 2017-03-08 14:08:27 +0000
    //   - timeIntervalSinceReferenceDate: 510674907.82620001
    dump([1,2,3] as NSArray)
    // ▿ 3 elements #0
    //   - 1 #1
    //     - super: NSNumber
    //       - super: NSValue
    //         - super: NSObject
    //   - 2 #2
    //     - super: NSNumber
    //       - super: NSValue
    //         - super: NSObject
    //   - 3 #3
    //     - super: NSNumber
    //       - super: NSValue
    //         - super: NSObject
    dump("Hello" as NSString)
    // - Hello #0
    //   - super: NSMutableString
    //     - super: NSString
    //       - super: NSObject
    dump(UIColor.red)
    // - UIExtendedSRGBColorSpace 1 0 0 1 #0
    //   - super: UIDeviceRGBColor
    //     - super: UIColor
    //       - super: NSObject
    
    //  UIFont 对象的 dump 输出包含了内存地址，
    // 但是 UIFont 在内部共享这些对象，所以
    // 不会出问题。
    let f1 = UIFont(name: "Helvetica", size: 12)!
    let f2 = UIFont(name: "Helvetica", size: 12)!
    f1 == f2 // → true
    dump(f1)
    // - <UICTFont: 0x7ff5e6102e60> font-family: "Helvetica"; font-weight: normal; font-style: normal; font-size: 12.00pt #0
    //   - super: UIFont
    //     - super: NSObject
    dump(f2)
    // - <UICTFont: 0x7ff5e6102e60> font-family: "Helvetica"; font-weight: normal; font-style: normal; font-size: 12.00pt #0
    //   - super: UIFont
    //     - super: NSObject
    
    // Swift 中的类的 dump 输出不会包含内存地址：
    class A {
        let value: Int
        init(value: Int) { self.value = value }
    }
    dump(A(value: 42))
    // ▿ A #0
    //   - value: 42
    
    // NSObject 的子类会包含内存地址
    //因此会出问题：
    class B: NSObject {
        let value: Int
        init(value: Int) {
            self.value = value
            super.init()
        }
        static func ==(lhs: B, rhs: B) -> Bool {
            return lhs.value == rhs.value
        }
    }
    dump(B(value: 42))
    // ▿ <__lldb_expr_26.B: 0x101012160> #0
    //   - super: NSObject
    //   - value: 42
    
    // 修正: 重写 `description`:
    extension B {
        override open var description: String {
            return "B: \(value)"
        }
    }
    dump(B(value: 42))
    // ▿ B: 42 #0
    //   - super: NSObject
    //   - value: 42

### 发布版本中的零开销断言

在 Swift 中，assert 只应该用在 Debug 版本中（在 Release 版本中使用 [precondition](https://developer.apple.com/reference/swift/1540960-precondition) 一类的语句会造成 trap）。assertDumpsEqual 的功能实现依托于标准库中的 assert 函数。为了能正常使用该函数，在调用 assert 的前后都不应执行任何工作。assert 可以接受一个大开销的表达式：assert 使用了一个标记为 [@autoclosure](https://developer.apple.com/library/prerelease/content/documentation/Swift/Conceptual/Swift_Programming_Language/Closures.html#//apple_ref/doc/uid/TP40014097-CH11-ID543) 的属性作为参数，以确保在调用时不会立即执行大开销的表达式。

正文所示的 assertDumpsEqual 的版本（[由 Tim Vermeulen 编写](https://gist.github.com/timvermeulen/afd4a6aa4eb1cfc39fa8496673dc24af)）的优势是在自定义的 String 构造器中创建 dump （大开销的操作）。这是我的原始版本，在函数内创建 dump：

    
    /**
     断言两个表达式具有相同的 `dump` 输出。
    
     - 注意： 该断言只在定义了 `DEBUG`
      条件编译符时才有效。否则该函数不执行任何操作。注意 在 Playground 中和 -Onone
      模式下的 Build 不会自动设置 `DEBUG` 标志位。
     */
    func assertDumpsEqual<T>(_ lhs: @autoclosure () -> T,
        _ rhs: @autoclosure () -> T,
        file: StaticString = #file, line: UInt = #line) {
        #if DEBUG
            var left = "", right = ""
            dump(lhs(), to: &left)
            dump(rhs(), to: &right)
            assert(left == right,
                "Expected dumps to be equal.\nlhs: \(left)\nrhs:\(right)",
                file: file, line: line)
        #endif
    }

除非设置了 DEBUG 条件编译符，否则不能编译 [#if DEBUG](https://developer.apple.com/library/prerelease/content/documentation/Swift/Conceptual/Swift_Programming_Language/Statements.html#//apple_ref/doc/uid/TP40014097-CH33-ID538) 块中的整个函数体。DEBUG 标志位在进行未优化的 Build 时总是默认设置的，依靠它就可以满足上述目的了。不幸的是，Xcode 不会为 Playground 自动设置标志位，使用 Swift Package Manager 的 Debug Build 默认情况下也不会设置该标志位（在  SwiftPM 中你可以使用 swift build -Xswiftc "-D" -Xswiftc "DEBUG" 命令手动设置该标志位）。标准库中的 [assert](https://developer.apple.com/reference/swift/1541112-assert) 更加聪明。它将所有未优化的 Build 过程（包括 Playground）视作有价值的。不过，[assert 识别未优化的 Build 的功能](https://github.com/apple/swift/blob/master/stdlib/public/core/Assert.swift#L40-L53)在 stdlib 之外是不可用的，这就解释了为什么应该将整个大开销的计算过程都放在 assert 中执行。

在我看到 Tim 提出的简化方案之前，我自己的实现方法是将生成和比较 dump 信息的代码放到一个局部的闭包之中，之后在传递给 assert 的时候再“调用”该闭包。因为 assert 的参数也是一个 @autoclosure 类型的，所以闭包中的代码实际只在 assert 内部执行（也就意味着只会在未优化的 Build 中执行）。我的方案看起来像这样：

    
    func assertDumpsEqual<T>(_ lhs: @autoclosure () -> T,
        _ rhs: @autoclosure () -> T,
        file: StaticString = #file, line: UInt = #line) {
        func areDumpsEqual() -> Bool {
            var left = "", right = ""
            // Error: Declaration closing over non-escaping
            // parameter may allow it to escape
            dump(lhs(), to: &left)
            // Error: Declaration closing over non-escaping
            // parameter may allow it to escape
            dump(rhs(), to: &right)
            return left == right
        }
        assert(areDumpsEqual(), "Expected dumps to be equal.",
               file: file, line: line)
    }

然而，上面的代码会发生编译错误。编译器不允许我们捕获闭包中的 lhs 和 rhs 参数，因为它们是 [non-escaping](https://oleb.net/blog/2016/10/optional-non-escaping-closures/)（非逃逸）的。在我们的例子中，闭包实际上并不会从作用域中逃逸，但是编译器无法验证这一点。为了解决该问题，可以（1）使用 @escaping 标注 assertDumpsEqual 的参数，或者（2）使用 [withoutActuallyEscaping](https://developer.apple.com/reference/swift/2827967-withoutactuallyescaping) 函数（[Swift 3.1 的新特性](https://github.com/apple/swift/blob/master/CHANGELOG.md#swift-31)）来修改编译器的规则。现在该函数看起来像下面这样：

    
    /// - 注意： 使用 `withoutActuallyEscaping` 要求 Swift 3.1。
    func assertDumpsEqual<T>(_ lhs: @autoclosure () -> T,
        _ rhs: @autoclosure () -> T,
        file: StaticString = #file, line: UInt = #line) {
    
        // 嵌套函数是为了解决 Bug SR-4188: `withoutActuallyEscaping`
        // 不能接受 `@autoclosure` 参数。 https://bugs.swift.org/browse/SR-4188
        func assertDumpsEqualImpl(lhs: () -> T, rhs: () -> T) {
            withoutActuallyEscaping(lhs) { escapableL in
                withoutActuallyEscaping(rhs) { escapableR in
                    func areDumpsEqual() -> Bool {
                        var left = "", right = ""
                        dump(escapableL(), to: &left)
                        dump(escapableR(), to: &right)
                        return left == right
                    }
                    assert(areDumpsEqual(), "Expected dumps to be equal.",
                           file: file, line: line)
                }
            }
        }
        assertDumpsEqualImpl(lhs: lhs, rhs: rhs)
    }

（嵌套函数是[解决以下 Bug 的一种方案](https://bugs.swift.org/browse/SR-4188)：withoutActuallyEscaping 目前不支持 autoclosure 形式的参数。）
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。