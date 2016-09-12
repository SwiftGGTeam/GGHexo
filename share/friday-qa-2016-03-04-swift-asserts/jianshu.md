Friday Q&A 2016-03-04：Swift 断言"

> 作者：Mike Ash，[原文链接](https://www.mikeash.com/pyblog/friday-qa-2016-03-04-swift-asserts.html)，原文日期：2016-03-04
> 译者：[zltunes](http://zltunes.com)；校对：[Cee](https://github.com/Cee)；定稿：[shanks](http://codebuild.me/)
  









断言是一种非常有用的机制，它可以检查代码中的假设部分，确保错误能够被及时发现。今天我将探讨 Swift 中提供的断言调用以及它们的实现，这个话题是由读者 Matthew Young 提出的。

我不会花太多时间讨论一般意义上的断言是什么或者在哪里使用它们。本文将着眼于 Swift 中提供的断言机制以及一些实现的细节。如果你想要了解如何在代码中充分利用断言，可以阅读我以前的文章 [Proper Use of Asserts（断言的正确使用）](https://www.mikeash.com/pyblog/friday-qa-2013-05-03-proper-use-of-asserts.html)。



### API

在 Swift 标准库中有两个主要的断言函数。

第一个函数被创造性地命名为 `assert`。调用时需要一个真命题：

    
    assert(x >= 0) // x 不能为负

该函数提供一个可选参数，用于命题为假时打印错误信息：

    
    assert(x >= 0, "x can't be negative here")

`assert` 只有在非优化构建时有效。在开启优化的情况下这行代码不会被编译。当存在某些条件计算耗性能，从而拖慢构建速度，但这些条件又是有用的，调试时必须进行检查，那么断言的这一特性就显得很有用了。

有些人倾向仅在调试版本中使用断言，理论上调试的时候去做一些检查是个好习惯，但最好保证 app 不会在实际使用时崩溃。不管在断言检查中有没有出现过，一旦（在实际使用中）出现错误，就会导致非常严重的后果。更好的做法是，如果在实际使用时出现错误，应用能迅速退出。这就引出了下一个函数。

函数 `precondition` 与 `assert` 非常像，调用时二者看起来一样：

    
    precondition(x >= 0) // x 不能为负
    precondition(x >= 0, "x can't be negative here")

不同之处在于该函数在优化构建条件下也会执行检查。这使得它成为断言检查的一个更好的选择，并且检查速度足够快。

尽管 `precondition` 在优化构建中有效，在「非检查（unchecked）」的优化构建中仍是无效的。「非检查」的构建是通过在命令行指定 `-Ounchecked` 来实现的。该指令的执行不仅会移除 `precondition` 调用，还会进行数组边界检查。这是很危险的，除非你别无选择，不得不执行该命令外尽量不要用。

关于非检查构建有趣的一点是，尽管 `precondition` 检查被移除了，优化器仍会假设命题为真，并在此基础上优化下面的代码。在上述例子中，生成代码不会再检查 `x` 是否为负，但在接下来的编译中会默认 `x >= 0`。这一点对于 `assert` 也是成立的。

这些函数各自有一个不带条件的变体，用来标志失败的情况。上述两个函数的变体分别是 `assertionFailure` 和 `preconditionFailure`。当你要进行断言检查的条件与该函数的调用不太相符时，变体就显得很有用了。例如：

    
    guard case .Thingy(let value) = someEnum else {
      preconditionFailure("This code should only be called with a Thingy.")
    }

优化下的行为和带条件时类似，开启优化时 `assertionFailure` 不会被编译，`preconditionFailure` 则保留，但在「非检查」优化构建时仍会被移除。「非检查」构建时，优化器假设这些函数永远不会执行，并基于该假设生成代码。

最后还有个函数 `fatalError`。该函数表示出现异常并终止程序，而不管构建是否开启优化或检查。

### 记录调用者信息

当断言检查未通过，会得到这样一条信息：

> precondition failed: x must be greater than zero: file test.swift, line 6

程序是如何获知文件和代码行的信息的呢？

在 C 语言中，我们将 `assert` 当做宏指令来用，同时使用 `__FILE__` 和 `__LINE__` 这两个神奇的标识符来获取信息：

    c
    #define assert(condition) do { \
      if(!(condition)) { \
          fprintf(stderr, "Assertion failed %s in file %s line %d\n", #condition, __FILE__, __LINE__); \
          abort(); \
      } \
    }

这些函数最终以调用者的文件和代码行信息结尾，就是因为此处的宏定义。Swift 中没有宏的概念，那该怎么办？

Swift 中可以使用默认参数值达到同样效果。上述神奇的标识符可被当做参数的默认值使用。如果调用者没有提供一个确切的值，便可将调用者所处的文件及代码行作为默认值。目前，这两个神奇的标识符分别是 `__FILE__ ` 和 ` __LINE__`，但在 Swift 下一版本中会变成 `#file` 和 `#line`，更加符合 Swift 风格。

探讨实际中的使用前，我们先看看 `assert` 的定义：

    
    public func assert(
      @autoclosure condition: () -> Bool,
      @autoclosure _ message: () -> String = String(),
      file: StaticString = #file, line: UInt = #line
    )

通常情况下，调用 `assert` 仅传递一个或两个参数。`file` 和 `line` 参数则作为默认值，用来传递调用者的相关信息。

没有*强制要求*必须使用默认值，如果需要的话你可以传入其他的值。比如：

    
    assert(false, "Guess where!", file: "not here", line: 42)

最终输出：

> assertion failed: Guess where!: file not here, line 42

有种更加实用的用法，你可以写一个包装器来保留原始调用者的信息，例如：

    
    func assertWrapper(
      @autoclosure condition: () -> Bool,
      @autoclosure _ message: () -> String = String(),
      file: StaticString = #file, line: UInt = #line
    ) {
      if !condition() {
          print("Oh no!")
      }
      assert(condition, message, file: file, line: line)
    }

Swift 版的 `assert` 有个缺陷。上文提到的 C 版本的 `assert` 提供 `#condition`关键字，断言检查未通过时可以输出表达式。而在 Swift 中不可以。因此，尽管 Swift 可以打印断言失败时的文件和代码行信息，但用来检查的表达式是无从获知的。

### 自动闭包

上述函数都使用 `@autoclosure` 来修饰 `condition` 和 `message` 参数，为什么？

先快速回顾一下 `@autoclosure`。`@autoclosure` 修饰的无参闭包可作为某个函数的形参，调用该函数时，调用者提供一个表达式作为实参。这个表达式会被包装成闭包并传递给函数，例如：

    
    func f(@autoclosure value: () -> Int) {
      print(value())
    }
    
    f(42)

等价于：

    
    func f(value: () -> Int) {
      print(value())
    }
    
    f({ 42 })

为什么要把表达式包装成闭包传递？因为这样可以让调用的函数来决定表达式具体执行的时间。例如，对于实现两个布尔类型的 && 运算符时，我们可以通过传入两个 `Bool` 参数实现：

    
    func &&(a: Bool, b: Bool) -> Bool {
            if a {
                if b {
                    return true
                }
            }
            return false
        }

有些情况下我们直接调用就可以：

    
    x > 3 && x < 10

但如果右操作数计算复杂的话是很耗时的：

    
    x > 3 && expensiveFunction(x) < 10

假定左操作数为 `false` 时，右操作数不会被执行的话，还有可能直接崩溃掉：

    
    optional != nil && optional!.value > 3

跟 C 语言一样，Swift 中的 `&&` 也是短路操作符。左操作数为 `false` 时就不再计算右操作数了。因此该表达式在 Swift 中是安全的，但对我们的函数则不行。`@autoclosure` 使得函数可以控制表达式执行的时间，保证只有左操作数为 `true`的前提下才去执行该表达式：

    
    func &&(a: Bool, @autoclosure b: () -> Bool) -> Bool {
      if a {
        if b() {
          return true
        }
      }
      return false
    }

现在就符合 Swift 的语义了，当 a 为 false 时 b 永远不会执行。

对断言而言，则完全是考虑性能问题。因为断言消息有可能是很耗时的操作。例如：

    
    assert(widget.valid, "Widget wasn't valid: \(widget.dump())")

你肯定不想每次都去计算一长串字符串，即便 `widget` 是合法、什么都不必输出的时候。对消息参数使用 `@autoclosure` 修饰，`assert` 便可避免计算 `message` 表达式，除非当断言检查不通过的时候。

条件本身也是 `@autoclosure`，因为优化构建下 `assert` 不会去检查条件。既然不去检查，也就不涉及计算了。使用 `@autoclosure` 意味着不会拖慢优化构建的速度：

    
    assert(superExpensiveFunction())

本文提到的 API 中的函数都使用了 `@autoclosure` 来保证除非不得已情况下，尽量避免参数的计算。出于某种原因，连 `fatalError` 都使用了 `@autoclosure` 修饰，尽管它是无条件执行的。

### 代码移除

基于代码的编译情况，这些函数会在代码生成时被移除。它们位于 Swift 标准库，而不是你自己写的代码中，而 Swift 标准库的编译远早于你自己的代码。这一切是怎么协调的？

在 C 语言中，这一切都跟宏相关。宏仅存在于头部，因此会在执行代码行的时候编译，尽管原则上这些代码隶属于库，实际上它们直接被当做你自己的代码。这意味着它们可以检查是否设置了 `DEBUG` 宏（或者类似标识），如果未设置就不会生成代码。例如：

    c
    #if DEBUG
    #define assert(condition) do { \
            if(!(condition)) { \
                fprintf(stderr, "Assertion failed %s in file %s line %d\n", #condition, __FILE__, __LINE__); \
                abort(); \
            } \
        }
    #else
    #define assert(condition) (void)0
    #endif

又一次，在 Swift 中没有宏的概念，那是怎么做的呢？

如果你[看过这些函数在标准库中的定义](https://github.com/apple/swift/blob/0619e57a61f27f721e273ab6f808ac81011aeb2c/stdlib/public/core/Assert.swift)，会发现它们都用 `@_transparent` 进行了注释。该特性使得函数有点类似于宏。这些函数的调用都是内联的，而不是当做独立函数来调用。当你在 Swift 代码中写入 `precondition(...)` 语句的时候，标准库中 `precondition` 的函数体会被直接插入你的代码中，就好像你自己复制粘贴过去一样。这意味着这部分代码的编译情况跟其余代码一样，优化器完全可以看到函数体内的代码。可以看到，当优化开启的时候 `assert` 编译器没有做任何事，而是被移除掉了。

标准库是一个独立的库，独立库中的函数是怎么内联进你自己的代码中的呢？对 C 语言来讲，库中包括编译对象的代码，这个问题显得没有意义。

Swift 标准库是一个 `.swiftmodule` 文件，完全不同于 `.dylib` 或者 `.a` 文件。一个 `.swiftmodule` 文件包含模块中的所有对象的声明，也可以包括完整的实现。引用 [The module format documentation](https://github.com/apple/swift/blob/cf8baedee2b09c9dd2d9c5519bf61629d1f6ebc8/docs/Serialization.rst) 中的一句话：

> The SIL block contains SIL-level implementations that can be imported into a client's SILModule context.（一个 SIL 块包括可以被导入到用户定义的 SILModule 上下文中的 SIL 层实现。）

这意味着这些断言函数的函数体被以一种中间形式保存到标准库模块中。之后调用函数的时候函数体内的代码便可被内联。既然可以被内联，这些代码也就处于同一编译环境下，必要时优化器也可以将它们全部移除。

### 总结

Swift 提供了一系列好用的断言函数。`assert` 和 `assertionFailure` 函数仅在优化未开启时有效。这对于检查那些耗性能的条件是很有用的，但通常情况下应尽量避免使用。`precondition` 和 `preconditionFailure` 函数在优化开启时也有效。

这些函数对 `condition` 和 `message` 的参数使用了 `@autoclosure` 修饰，使得函数可以控制参数计算的时机。从而避免了每次断言检查都去计算自定义的 `message`，同时也避免了在优化开启，断言函数无效时去检查 `condition`。

断言函数是标准库的一部分，但它们使用了 `@_transparent` 修饰，使得生成的中间代码可以导入到模块中。当函数被调用时，整个函数体会被内联至调用处，因此优化器可以在需要的时候移除它们。

今天就讲到这里！希望这篇文章可以帮助你在自己的代码中更大胆地使用断言。断言是很有用的机制，它可以让问题一旦发生就及时明显地显现出来，而不是发生很久后才显示出一些“症状”。下次会带来一些更棒的想法。每周周五问答都是基于读者的一些想法建立的，如果你也有想在这里讨论的话题，[就快发过来吧](mailto:mike@mikeash.com)！
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。