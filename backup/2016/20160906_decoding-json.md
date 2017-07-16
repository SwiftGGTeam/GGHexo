title: "使用 Swift 进行 JSON 解析"
date: 2016-09-06
tags: [Swift 进阶]
categories: [KHANLOU]
permalink: decoding-json
keywords: swift json解析
custom_title: 
description: Swift 解析 JSON 不是一件轻松的活，本文就来说下 Swift JSON 解析的例子，帮助你更好的弄明白它。

---
原文链接=http://khanlou.com/2016/04/decoding-json/
作者=Soroush Khanlou
原文日期=2016-04-08
译者=Lanford3_3
校对=pmst
定稿=CMB

<!--此处开始正文-->

使用 Swift 解析 JSON 是件很痛苦的事。你必须考虑多个方面：可选类性、类型转换、基本类型（primitive types）、构造类型（constructed types）（其构造器返回结果也是可选类型）、字符串类型的键（key）以及其他一大堆问题。

对于强类型（well-typed）的 Swift 来说，其实更适合使用一种强类型的有线格式(wire format)。在我的下一个项目中，我将会选择使用 Google 的 [protocol buffers](https://developers.google.com/protocol-buffers/)（[这篇文章](http://blog.codeclimate.com/blog/2014/06/05/choose-protocol-buffers/)说明了它的好处）。我希望在得到更多经验后，写篇文章说说它和 Swift 配合起来有多么好用。但目前这篇文章主要是关于如何解析 JSON 数据 —— 一种被最广泛使用的有线格式。

<!--more-->

对于 JSON 的解析，已经有了许多优秀的解决方案。第一个方案，使用如 [Argo](https://github.com/thoughtbot/Argo) 这样的库，采用函数式操作符来柯里化一个初始化构造器：

```swift
extension User: Decodable {
  static func decode(j: JSON) -> Decoded<User> {
    return curry(User.init)
      <^> j <| "id"
      <*> j <| "name"
      <*> j <|? "email" // Use ? for parsing optional values
      <*> j <| "role" // Custom types that also conform to Decodable just work
      <*> j <| ["company", "name"] // Parse nested objects
  }
}
```

Argo 是一个非常好的解决方案。它简洁，灵活，表达力强，但柯里化以及奇怪的操作符都是些不太好理解的东西。(Thoughtbot 的人已经写了一篇[不错的文章](https://robots.thoughtbot.com/efficient-json-in-swift-with-functional-concepts-and-generics)来对这些加以解释)

另外一个常见的解决方案是，手动使用 `guard let` 进行处理以得到非可选值。这个方案需要手动做的事儿会多一些，对于每个属性的处理都需要两行代码：一行用来在 guard 语句中生成非可选的局部变量，另一行设置属性。若要得到上例中同样的结果，代码可能长这样：

```swift
class User {
  init?(dictionary: [String: AnyObject]?) {
    guard
      let dictionary = dictionary,
      let id = dictionary["id"] as? String,
      let name = dictionary["name"] as? String,
      let roleDict = dictionary["role"] as? [String: AnyObject],
      let role = Role(dictionary: roleDict)
      let company = dictionary["company"] as? [String: AnyObject],
      let companyName = company["name"] as? String,
        else {
          return nil
    }
    
    self.id = id
    self.name = name
    self.role = role
    self.email = dictionary["email"] as? String
    self.companyName = companyName
  }
}
```

这份代码的好处在于它是纯 Swift 的，不过看起来比较乱，可读性不佳，变量间的依赖链并不明显。举个例子，由于 `roleDict` 被用在 `role` 的定义中，所以它必须在 `role` 被定义前定义，但由于代码如此繁杂，很难清晰地找出这种依赖关系。

（我甚至都不想提在 Swift 1 中解析 JSON 时，大量 `if let` 嵌套而成的鞭尸金字塔（pyramid-of-doom），那可真是糟透了，很高兴现在我们有了多行的 `if let` 和 `guard let` 结构。）

---

在 [Swift 的错误处理](https://www.natashatherobot.com/swift-2-error-handling/)发布的时候，我觉得这东西糟透了。似乎不管从哪一个方面都不及 [`Result`](https://github.com/antitypical/Result) ：

* 你无法直接访问到错误：Swift 的错误处理机制在 `Result` 类型之上，添加了一些必须使用的语法（是的，事实如此），这让人们无法直接访问到错误。
* 你不能像使用 `Result` 一样进行链式处理。`Result` 是个 [monad](http://khanlou.com/2015/09/what-the-heck-is-a-monad/)，可以用 `flatMap` 链接起来进行有效的处理。
* Swift 错误模型无法异步使用（除非你进行一些 hack，比如说[提供一个内部函数来抛出](https://appventure.me/2015/06/19/swift-try-catch-asynchronous-closures/)结果)， 但 `Result` 可以。

尽管 Swift 的错误处理模型有着这些看起来相当明显的缺点，但[有篇文章](http://www.sunsetlakesoftware.com/2015/06/12/swift-2-error-handling-practice)讲述了一个使用 Swift 错误模型的例子，在该例子中 Swift 的错误模型明显比 Objective-C 的版本更加简洁，也比 `Result` 可读性更强。这是怎么回事呢？

这里的秘密在于，当你的代码中有许多 `try` 调用的时候，利用带有 `do`/`catch` 结构的 Swift 错误模型进行处理，效果会非常好。在 Swift 中对代码进行错误处理时需要写一些模板代码。在声明函数时，你需要加入 `throws`， 或使用 `do`/`catch` 结构显式地处理所有错误。对于单个 `try` 语句来说，做这些事让人觉得很麻烦。然而，就多个 `try` 语句而言，这些前期工作就变得物有所值了。

---

我曾试图寻找一种方法，能够在 JSON 缺失某个键时打印出某种警告。如果在访问缺失的键时，能够得到一个报错，那么这个问题就解决了。由于在键缺失的时候，原生的 `Dictionary` 类型并不会抛出错误，所以需要有个对象对字典进行封装。我想实现的代码大概长这样：

```swift
struct MyModel {
    let aString: String
    let anInt: Int
    
    init?(dictionary: [String: AnyObject]?) {
        let parser = Parser(dictionary: dictionary)
        do {
            self.aString = try parser.fetch("a_string")
            self.anInt = try parser.fetch("an_int")
        } catch let error {
            print(error)
            return nil 
        }
    }
}
```

理想的说来，由于类型推断的存在，在解析过程中我甚至不需要明确地写出类型。现在让我们丝分缕解，看看怎么实现这份代码。首先从 `ParserError` 开始：

```swift
struct ParserError: ErrorType {
    let message: String
}
```

接下来，我们开始搞定 `Parser`。它可以是一个 `struct` 或是一个 `class`。（由于它不会被用在别的地方，所以他的引用语义并不重要。）

```swift
struct Parser {
    let dictionary: [String: AnyObject]?
    
    init(dictionary: [String: AnyObject]?) {
        self.dictionary = dictionary
    }
}
```

我们的 parser 将会获取一个字典并持有它。

`fetch` 函数开始显得有点复杂了。我们来一行一行地进行解释。类中的每个方法都可以类型参数化，以充分利用类型推断带来的便利。此外，这个函数会抛出错误，以使我们能够获得处理失败的数据：

```swift
func fetch<T>(key: String) throws -> T {
```

下一步是获取键对应的对象，并保证它不是空的，否则抛出一个错误。

```swift
let fetchedOptional = dictionary?[key]
guard let fetched = fetchedOptional else {
    throw ParserError(message: "The key \"\(key)\" was not found.")
}
```

最后一步是，给获得的值加上类型信息。

```swift
guard let typed = fetched as? T else {
    throw ParserError(message: "The key \"\(key)\" was not the correct type. It had value \"\(fetched).\"")
}
```

最终，返回带类型的非空值。

```swift
    return typed
}
```

（我将会在文末附上包含所有代码的 gist 和 playground）

这份代码是可用的！类型参数化及类型推断为我们处理了一切。上面写的 “理想” 代码完美地工作了：

```swift
self.aString = try parser.fetch("a_string")
```

我还想添加一些东西。首先，添加一种方法来解析出那些确实可选的值（译者注：也就是我们允许这些值为空）。由于在这种情况下我们并不需要抛出错误，所以我们可以实现一个简单许多的方法。但很不幸，这个方法无法和上面的方法同名，否则编译器就无法知道应该使用哪个方法了，所以，我们把它命名为 `fetchOptional`。这个方法相当的简单。

```swift
func fetchOptional<T>(key: String) -> T? {
    return dictionary?[key] as? T
}
```

（如果键存在，但是并非你所期望的类型，则可以抛出一个错误。为了简略起见，我就不写了）

另外一件事就是，在字典中取出一个对象后，有时需要对它进行一些额外的转换。我们可能得到一个枚举的 `rawValue`，需要构建出对应的枚举，或者是一个嵌套的字典，需要处理它包含的对象。我们可以在 `fetch` 函数中接收一个闭包作为参数，作进一步地类型转换，并在转换失败的情况下抛出错误。泛型中 `U` 参数类型能够帮助我们明确 `transformation` 闭包转换得到的结果值类型和 `fetch` 方法得到的值类型一致。

```swift
func fetch<T, U>(key: String, transformation: (T) -> (U?)) throws -> U {
    let fetched: T = try fetch(key)
    guard let transformed = transformation(fetched) else {
        throw ParserError(message: "The value \"\(fetched)\" at key \"\(key)\" could not be transformed.")
    }
    return transformed
}
```

最后，我们希望 `fetchOptional` 也能接受一个转换闭包作为参数。

```swift
func fetchOptional<T, U>(key: String, transformation: (T) -> (U?)) -> U? {
    return (dictionary?[key] as? T).flatMap(transformation)
}
```

看啊！`flatMap` 的力量！注意，转换闭包 `transformation` 和 `flatMap` 接收的闭包有着一样的形式：`T -> U?`

现在我们可以解析带有嵌套项或者枚举的对象了。

```swift
class OuterType {
    let inner: InnerType
    
    init?(dictionary: [String: AnyObject]?) {
        let parser = Parser(dictionary: dictionary)
        do {
            self.inner = try parser.fetch("inner") { InnerType(dictionary: $0) }
        } catch let error {
            print(error)
            return nil 
        }
    }
}
```

再一次注意到，Swift 的类型推断魔法般地为我们处理了一切，而我们根本不需要写下任何 `as?` 逻辑！

用类似的方法，我们也可以处理数组。对于基本数据类型的数组，`fetch` 方法已经能很好地工作了：

```swift
let stringArray: [String]

//...
do {
    self.stringArray = try parser.fetch("string_array")
//...
```

对于我们想要构建的特定类型（Domain Types）的数组， Swift 的类型推断似乎无法那么深入地推断类型，所以我们必须加入另外的类型注解：

```swift
self.enums = try parser.fetch("enums") { (array: [String]) in array.flatMap(SomeEnum(rawValue: $0)) }
```

由于这行显得有些粗糙，让我们在 `Parser` 中创建一个新的方法来专门处理数组：

```swift
func fetchArray<T, U>(key: String, transformation: T -> U?) throws -> [U] {
    let fetched: [T] = try fetch(key)
    return fetched.flatMap(transformation)
}
```

这里使用 flatMap 来帮助我们移除空值，减少了代码量:

```swift
self.enums = try parser.fetchArray("enums") { SomeEnum(rawValue: $0) }
```

末尾的这个闭包应该被作用于 *每个* 元素，而不是整个数组（你也可以修改 `fetchArray` 方法，以在任意值无法被构建时抛出错误。）

我很喜欢泛型模式。它很简单，可读性强，而且也没有复杂的依赖（这只是个 50 行的 Parser 类型）。它使用了 Swift 风格的结构， 还会给你非常特定的错误提示，告诉你 *为何* 解析失败了，当你在从服务器返回的 JSON 沼泽中摸爬滚打时，这显得非常有用。最后，用这种方法解析的另外一个好处是，它在结构体和类上都能很好地工作，这使得从引用类型切换到值类型，或者反之，都变得很简单。

[这里](https://gist.github.com/khanlou/bc90b27155f5c7c137d9697c083cda89)是包含所有代码的一个 gist，而[这里](http://cl.ly/3d352D3Q1Z0A)是一个作为补充的 Playground.
