重新实现可选类型的隐式解包"

> 作者：Mark Lacey，[原文链接](https://swift.org/blog/iuo/)，原文日期：2018-04-26
> 译者：[灰s](https://github.com/dzyding)；校对：[numbbbbb](http://numbbbbb.com/)， mmoaay；定稿：[CMB](https://github.com/chenmingbiao)
  









今年早些时候，Swift 编译器实现了一种新的可选类型隐式解包 (IUOs)，在最近的 Swift [测试版本](https://swift.org/download/#snapshots) 中开放使用。它实现了 [ SE-0054 - Abolish ImplicitlyUnwrappedOptional Type](https://github.com/apple/swift-evolution/blob/master/proposals/0054-abolish-iuo.md)。对于 Swift 来说，这是一次重大的改变，消除了类型检测中的一些矛盾，并且阐明了处理这些值的规则，使语义保持一致且易于推理。更多信息可以阅读这条提案的 [动机](https://github.com/apple/swift-evolution/blob/master/proposals/0054-abolish-iuo.md#motivation)。

主要变化是，当引用一个被声明为隐式解包可选的基础类型 `T` 时，在诊断信息中会打印 `T?`，而不是之前的 `T!`。你可能会遇到源代码兼容性问题，需要修改代码之后才能编译成功。



## 隐式解包是声明的一部分

*可选类型的隐式解包* 在编译时会根据需要自动解包。要声明一个可选类型的隐式解包，需要将类型后面的 `?` 改成 `!`。  

在很多人的认知中，隐式解包的可选类型与常规可选类型并不属于同一个类别。在 Swift 3 中，它们也确实不一样：像 `var a: Int?`  这样的声明，会创建一个拥有 `Optional<Int>` 类型的 `a`；像 `var b: String!`  这样的声明，会创建一个拥有 `ImplicitlyUnwrappedOptional<String>` 类型的 `b` 。  

在 IUOs 的新模型中，你需要将 `!` 视为 `?` 的同义词，它只是在声明中添加一个标志让编译器知道被声明的值可以进行隐式解包。  

换句话说，对于 `String!` 的理解你可以认为是 "这个值拥有 `Optional<String>` 类型并且携带了信息说在需要的时候它可以被隐式的解包。"  

这种思维模型与新的实现相匹配。现在，任何地方你申明了 `T!` ，编译器都会将它看做 `T?` 类型，然后在申明的内部表示中添加一个标签使得类型检测器知道当需要的时候可以对它进行隐式解包。  

这一变化最明显的结果就是对于申明为 `T!` 的变量，你将看到关于 `T?` 的诊断而不是 `T!`。 在诊断中看到 `T?` 而不是 `T!` 可能需要一点时间去适应它，但是拥抱这一新的思维模型将会一直帮助你。

**为了便于理解，译者自己做了配图，展示新旧 Swift 的区别：**  

![old](https://swift.gg/img/articles/swift-org-blog-iuo/40166397-082f067e-59f1-11e8-931a-3d3d0cb892eb.png1529377151.6054707)
![new](https://swift.gg/img/articles/swift-org-blog-iuo/40166527-52d1029a-59f1-11e8-94f2-44d9dc1660ce.png1529377151.9917665)

## 源代码兼容性

### 强制转换为 `T!`

按照 SE-0054 提案，`as T!` 这样的强制转换已经不再被允许。

在 Swift 4.1 中，这种形式的强制转换会显示一个弃用警告。多数情况下，使用 `as T?` 来替代 `as T!` 或者直接移除该强制转换即可编译成功。

如果这两种方法都不管用，新的实现中也有对应的特殊处理。具体来说，如果遇到 `x as T!`，编辑器首先会尝试 `x as T?`。如果失败，编辑器会用 `(x as T?)!` 来进行强制解包。

但是，这种形式的强制转换仍然不推荐使用，在将来的 Swift 版本中有可能会移除这种特殊处理。

### 在类型中使用 `!`

强制转换为 `T!` 作为一个特例存在于一个更普遍的问题中：使用 `!` 作为类型的一部分。  

可以在下面三个地方使用 `!` 作为类型中的一部分：

    1. 属性声明
    2. 方法的参数类型声明
    3. 方法的返回值类型声明

在其它地方使用 `!` 将被标记成一个错误。Swift 4.1 之前的版本就已经实现了这个检测，但是遗漏了一些情况：

    
    let fn: (Int!) -> Int! = ...   // error: not a function declaration!

这里 Swift 4.1 显示了弃用警告，但是仍然默认了隐式解包的行为。在近期测试版本的新实现中，编译器会将 `!` 视为 `?`，同时在诊断信息中告诉你发生了什么，以及这种用法会被废弃。  

**译者配图：**  

![old-2](https://swift.gg/img/articles/swift-org-blog-iuo/40213466-2dd070ba-5a88-11e8-888a-0ca5066f4d36.png1529377152.1436236)
![new-2](https://swift.gg/img/articles/swift-org-blog-iuo/40213471-336db9ba-5a88-11e8-9b8e-11287e1bfccd.png1529377152.292037)

### 隐式解包可选类型的 map 方法

以前的代码是这样的：

    
    class C {}
    let values: [Any]! = [C()]
    let transformed = values.map { $0 as! C }

上面的代码会对 `values` 强制解包，然后对数组调用 `map(_:)` 方法。即使你在 `ImplicitlyUnwrappedOptional` 的扩展中定义了 `map(_:)` 方法也无法覆盖默认方法，因为它并不会像你想的那样，在 `ImplicitlyUnwrappedOptional` 中执行方法查找。  

在新的实现中，因为 `!` 和 `?` 是同义词，编译器会尝试使用 `Optional<T>` 中的 `map(_:)` 方法：

    
    let transformed = values.map { $0 as! C } // calls Optional.map; $0 has type [Any]

并且显示： `warning: cast from '[Any]' to unrelated type 'C' always fails`。  

这样从语义上就通过了类型检测，我们不需要对 `values` 进行强制解包。  

你可以使用可选链制造一个可选的数组来解决这个问题：

    
    let transformed = values?.map { $0 as! C } // transformed 的类型是 Optional<[C]>

或者对 `values` 进行强制解包来得到一个数组：

    
    let transformed = values!.map { $0 as! C } // transformed has type [C]

注意，大部分情况下你不需要修改代码：

    
    let values: [Int]! = [1]
    let transformed = values.map { $0 + 1 }

它将继续按照老版本的方式工作，因为在这里将表达式看作 `Optional` 执行 `map(_:)` 方法无法进行类型检测。取而代之，我们会对 `values` 进行强制解包，并对返回的数组执行 `map(_:)` 方法。

### 无法推断类型

因为隐式解包可选不再是一个类型，所以不能被推断成一种类型或者类型的任何部分。

在下面的例子中，尽管右边的赋值包含一个被声明为隐式解包的值，左边类型推断仅表示这个值（或者返回值）是一个可选类型。

    
    var x: Int!
    let y = x   // y has type Int?
    
    func forcedResult() -> Int! { ... }
    let getValue = forcedResult    // getValue 的类型是 () -> Int?
    
    func id<T>(_ value: T) -> T { return value }
    let z = id(x)   // z 的类型是 Int?
    
    func apply<T>(_ fn: () -> T) -> T { return fn() }
    let w: Int = apply(forcedResult)    // 报错，因为 apply() 返回的是 Int?

还有一些特殊的实例会遇到这个问题，比如 `AnyObject` 的查找操作，`try?` 和 `switch`。

#### AnyObject 的查找操作

`AnyObject` 的查找结果会被当作一个隐式解包的可选类型。如果你查找一个本身就被声明成隐式解包的属性，那么表达式现在就有两层隐式解包 ( `property` 被声明为 `UILabel!`)：

    
    func getLabel(object: AnyObject) -> UILabel {
      return object.property // forces both optionals, resulting in a UILabel
    }

`if let` 和 `guard let` 仅能解包一层可选属性。  

在下面的例子中，之前的 Swift 版本在经过 `if let` 进行一层解包之后，推测出 `label` 的属性为 `UILabel!`。在测试版本中 Swift 将推测出 `UILabel?` ：

    
    // label is inferred to be UILabel?
    if let label = object.property { 
       // Error due to passing a UILabel? where a UILabel is expected
      functionTakingLabel(label)
    }

我们可以使用一个明确的类型来修复这个问题：

    
    // Implicitly unwrap object.property due to explicit type.
    if let label: UILabel = object.property {
      functionTakingLabel(label) // okay
    }

#### `try?`

类似的，`try?` 会添加一层可选性，所以当对一个返回值为隐式可选类型的方法使用 `try?` 时，你可能会发现现在需要更改代码来显式对两层可选性进行解包。

    
    func test() throws -> Int! { ... }
    
    if let x = try? test() {
      let y: Int = x    // error: x is an Int?
    }
    
    if let x: Int = try? test() { // explicitly typed as Int
      let y: Int = x    // okay, x is an Int
    }
    
    if let x = try? test(), let y = x { // okay, x is Int?, y is Int
     ...
    }

#### `switch`

Swift 4.1 可以编译下面这样的代码，因为它将 `output` 作为隐式解包对待：

    
    func switchExample(input: String!) -> String {
      switch input {
      case "okay":
        return "fine"
      case let output:
        return output  // 隐式解包可选值，返回 String
      }
    }

请注意，如果用下面这种方法实现这个例子，无法编译成功：

    
    func switchExample(input: String!) -> String {
      let output = input  // output is inferred to be String?
      switch input {
      case "okay":
        return "fine"
      default:
        return output  // error: value of optional type 'String?' not unwrapped;
                       // did you mean to use '!' or '?'?
      }
    }

在新的实现中，第一个例子中的 `output` 将被推断成没有隐式解包的 `String?` 类型。  

下面是一种修复方法，对值进行强制解包：

    
     case let output:
        return output!

另一种修复方法是对 non-nil 和 nil 进行显式的模式匹配：

    
    func switchExample(input: String!) -> String {
      switch input {
      case "okay":
        return "fine"
      case let output?: // non-nil case
        return output   // okay; output is a String
      case nil:
        return "<empty>"
      }
    }

### 使用可选类型和隐式解包可选类型重载输入输出参数

如果在 Swift 4.1 中尝试去重载一个函数并且 in-out 参数是隐式解包可选类型，会显示一个弃用警告

    
      func someKindOfOptional(_: inout Int?) { ... }
    
      // Warning in Swift 4.1.  Error in new implementation.
      func someKindOfOptional(_: inout Int!) { ... }

Swift 4.1 中，如果 in-out 参数是可选的，那可以直接传入一个隐式解包可选类型的值，反之亦然。这样就可以删除上面的第二个重载（假设两个函数实现完全一致）：

    
      func someKindOfOptional(_: inout Int?) { ... }
    
      var i: Int! = 1
      someKindOfOptional(&i)   // 完全没问题，i 的类型是 Optional<Int>

在之后的新版本中，由于 `Int!` 与 `Int?` 是同义词，重载的可选性不再有意义。因此，和上面例子中类似的重载都会报错，并且第二个重载（声明为 `Int!`）必须被删除。

### ImplicitlyUnwrappedOptional 扩展

现在 `ImplicitlyUnwrappedOptional<T>` 只是 `Optional<T>` 的别名，而且不能直接使用，所以尝试给它创建 `extension` 会编译失败：

    
     // 1:11: error: 'ImplicitlyUnwrappedOptional' has been renamed to 'Optional'
     extension ImplicitlyUnwrappedOptional {

### nil 桥接

对 `nil` 类型的值进行桥接时不会报运行时错误，而是把 `nil` 桥接为 `NSNull` 。

    
    import Foundation
    
    class C: NSObject {}
    
    let iuoElement: C! = nil
    let array: [Any] = [iuoElement as Any]
    let ns = array as NSArray
    let element = ns[0] // Swift 4.1: Fatal error: Attempt to bridge
                        // an implicitly unwrapped optional containing nil
    
    if let value = element as? NSNull, value == NSNull() {
      print("pass")     // 新版本中会执行到这里
    } else {
      print("fail")
    }

### 结论

隐式解包的可选类型已经被重新实现，它们不再是 `Optional<T>` 的特殊形式。因此，类型检测的一致性将会更好，编译器的特殊情况也会更少。删除这些特殊情况会减少处理声明时的错误数量。  

导入的 Object-C API 可能会返回隐式解包的值。你可能会发现在声明 `@IBOutlet` 属性（或者任何初始化之前不会使用的值）时使用隐式解包会更加方便。不过总体来说，隐式解包能不用最好别用，改用 `if let` 和 `guard let` 来显式解包。如果确定有值，就用 `!` 来显式强制解包。

### 反馈

如果你对这篇文章有疑问或者想法，可以在 Swift 论坛中参与[相关讨论](https://forums.swift.org/t/swift-org-blog-reimplementation-of-implicitly-unwrapped-optionals/12175)。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。