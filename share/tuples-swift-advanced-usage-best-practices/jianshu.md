Swift 元组高级用法和最佳实践

> 作者：terhechte，[原文链接](http://appventure.me/2015/07/19/tuples-swift-advanced-usage-best-practices/)，原文日期：2015/07/19
> 译者：[mmoaay](http://blog.csdn.net/mmoaay)；校对：[lfb_CD](http://weibo.com/lfbWb)；定稿：[numbbbbb](https://github.com/numbbbbb)
  










作为 Swift 中比较少见的语法特性，元组只是占据了结构体和数组之间很小的一个位置。此外，它在 Objective-C（或者很多其他语言）中没有相应的结构。最后，标准库以及 Apple 示例代码中对元组的使用也非常少。可能它在 Swift 中给人的印象就是用来做模式匹配，但我并不这么认为。

和元组相关的大部分教程都只关注三种使用场景（模式匹配、返回值和解构），且浅尝辄止。本文会详细介绍元组，并讲解元组使用的最佳实践，告诉你何时该用元组，何时不该用元组。同时我也会列出那些你不能用元组做的事情，免得你老是去 StackOverflow 提问。好了，进入正题。



# 绝对基础

因为这部分内容你可能已经知道得七七八八了，所以我就简单介绍下。

元组允许你把不同类型的数据结合到一起。它是可变的，尽管看起来像序列，但是它不是，因为不能直接遍历所有内容。我们首先通过一个简单的入门示例来学习如何创建和使用元组。

# 创建和访问元组

    
    // 创建一个简单的元组
    let tp1 = (2, 3)
    let tp2 = (2, 3, 4)
    
    //创建一个命名元组
    let tp3 = (x: 5, y: 3)
    
    // 不同的类型
    let tp4 = (name: "Carl", age: 78, pets: ["Bonny", "Houdon", "Miki"])
    
    // 访问元组元素
    let tp5 = (13, 21)
    tp5.0 // 13
    tp5.1 // 21
    
    let tp6 = (x: 21, y: 33)
    tp6.x // 21
    tp6.y // 33

# 使用元组做模式匹配

就像之前所说，这大概是元组最常见的使用场景。Swift 的 `switch` 语句提供了一种极强大的方法，可以在不搞乱源代码的情况下简单的定义复杂条件句。这样就可以在一个语句中匹配类型、实例以及多个变量的值：

    
    // 特意造出来的例子
    // 这些是多个方法的返回值
    let age = 23
    let job: String? = "Operator"
    let payload: AnyObject = NSDictionary()

在上面的代码中，我们想要找一个 30 岁以下的工作者和一个字典 `payload`。假设这个 `payload` 是 Objective-C 世界中的一些东西，它可能是字典、数组或者数字。现在你不得不和下面这段别人很多年前写的烂代码打交道：

    
    switch (age, job, payload) {
      case (let age, _?, _ as NSDictionary) where age < 30:
      print(age)
      default: ()
    }

把 `switch` 的参数构建为元组 `(age, job, payload)`，我们就可以用精心设计的约束条件来一次性访问元组中所有特定或不特定的属性。

# 把元组做为返回类型

这可能是元组第二多的应用场景。因为元组可以即时构建，它成了在方法中返回多个值的一种简单有效的方式。

    
    func abc() -> (Int, Int, String) {
        return (3, 5, "Carl")
    }

# 元组解构

Swift 从不同的编程语言汲取了很多灵感，这也是 Python 做了很多年的事情。之前的例子大多只展示了如何把东西塞到元组中，解构则是一种迅速把东西从元组中取出的方式，结合上面的 `abc` 例子，我们写出如下代码：

    
    let (a, b, c) = abc()
    print(a)

另外一个例子是把多个方法调用写在一行代码中：

    
    let (a, b, c) = (a(), b(), c())

或者，简单的交换两个值：

    
    var a = 5
    var b = 4
    (b, a) = (a, b)

# 进阶

## 元组做为匿名结构体

元组和结构体一样允许你把不同的类型结合到一个类型中：

    
    struct User {
      let name: String
      let age: Int
    }
    // vs.
    let user = (name: "Carl", age: 40)

正如你所见，这两个类型很像，只是结构体通过结构体描述声明，声明之后就可以用这个结构体来定义实例，而元组仅仅是一个实例。如果需要在一个方法或者函数中定义临时结构体，就可以利用这种相似性。就像 Swift 文档中所说：

> “需要临时组合一些相关值的时候，元组非常有用。（…）如果数据结构需要在临时范围之外仍然存在。那就把它抽象成类或者结构体（…）”

下面来看一个例子：需要收集多个方法的返回值，去重并插入到数据集中：

    
    func zipForUser(userid: String) -> String { return "12124" }
    func streetForUser(userid: String) -> String { return "Charles Street" }
    
    
    // 从数据集中找出所有不重复的街道
    var streets: [String: (zip: String, street: String, count: Int)] = [:]
    for userid in users {
        let zip = zipForUser(userid)
        let street = streetForUser(userid)
        let key = "\(zip)-\(street)"
        if let (_, _, count) = streets[key] {
    	streets[key] = (zip, street, count + 1)
        } else {
    	streets[key] = (zip, street, 1)
        }
    }
    
    drawStreetsOnMap(streets.values)

这里，我们在短暂的临时场景中使用结构简单的元组。当然也可以定义结构体，但是这并不是必须的。

再看另外一个例子：在处理算法数据的类中，你需要把某个方法返回的临时结果传入到另外一个方法中。定义一个只有两三个方法会用的结构体显然是不必要的。

    
    // 编造算法
    func calculateInterim(values: [Int]) -> (r: Int, alpha: CGFloat, chi: (CGFloat, CGFLoat)) {
       ...
    }
    func expandInterim(interim: (r: Int, alpha: CGFloat, chi: (CGFloat, CGFLoat))) -> CGFloat {
       ...
    }

显然，这行代码非常优雅。单独为一个实例定义结构体有时候过于复杂，而定义同一个元组 4 次却不使用结构体也同样不可取。所以选择哪种方式取决于各种各样的因素。

## 私有状态

除了之前的例子，元组还有一种非常实用的场景：在临时范围以外使用。Rich Hickey 说过：“如果树林中有一棵树倒了，会发出声音么？“因为作用域是私有的，元组只在当前的实现方法中有效。使用元组可以很好的存储内部状态。

来看一个简单的例子：保存一个静态的 `UITableView` 结构，这个结构用来展示用户简介中的各种信息以及信息对应值的 `keypath`，同时还用`editable`标识表示点击 `Cell` 时是否可以对这些值进行编辑。

    
    let tableViewValues = [(title: "Age", value: "user.age", editable: true),
    (title: "Name", value: "user.name.combinedName", editable: true),
    (title: "Username", value: "user.name.username", editable: false),
    (title: "ProfilePicture", value: "user.pictures.thumbnail", editable: false)]

另一种选择就是定义结构体，但是如果数据的实现细节是纯私有的，用元组就够了。

更酷的一个例子是：你定义了一个对象，并且想给这个对象添加多个变化监听器，每个监听器都包含它的名字以及发生变化时被调用的闭包：

    
    func addListener(name: String, action: (change: AnyObject?) -> ())
    func removeListener(name: String)

你会如何在对象中保存这些监听器呢？显而易见的解决方案是定义一个结构体，但是这些监听器只能在三种情况下用，也就是说它们使用范围极其有限，而结构体只能定义为 `internal` ，所以，使用元组可能会是更好的解决方案，因为它的解构能力会让事情变得很简单：

    
    var listeners: [(String, (AnyObject?) -> ())]
    
    func addListener(name: String, action: (change: AnyObject?) -> ()) {
       self.listeners.append((name, action))
    }
    
    func removeListener(name: String) {
        if let idx = listeners.indexOf({ e in return e.0 == name }) {
    	listeners.removeAtIndex(idx)
        }
    }
    
    func execute(change: Int) {
        for (_, listener) in listeners {
    	listener(change)
        }
    }

就像你在 `execute` 方法中看到的一样，元组的解构能力让它在这种情况下特别好用，因为内容都是在局部作用域中直接解构。

## 把元组作为固定大小的序列

元组的另外一个应用领域是：固定一个类型所包含元素的个数。假设需要用一个对象来计算一年中所有月份的各种统计值，你需要分开给每个月份存储一个确定的 `Integer` 值。首先能想到的解决方案会是这样：

    
    var monthValues: [Int]

然而，这样的话我们就不能确定这个属性刚好包含 12 个元素。使用这个对象的用户可能不小心插入了 13 个值，或者 11 个。我们没法告诉类型检查器这个对象是固定 12 个元素的数组（有意思的是，这是 C 都支持的事情）。但是如果使用元组，可以很简单地实现这种特殊的约束：

    
    var monthValues: (Int, Int, Int, Int, Int, Int, Int, Int, Int, Int, Int, Int)

还有一种选择就是在对象的功能中加入约束逻辑（即通过新的 `guard` 语句），然而这个是在运行时检查。元组的检查则是在编译期间；当你想给对象赋值 11 个月时，编译都通不过。

## 元组当做复杂的可变参数类型

可变参数（比如可变函数参数）是在函数参数的个数不定的情况下非常有用的一种技术。

    
    // 传统例子
    func sumOf(numbers: Int...) -> Int {
        // 使用 + 操作符把所有数字加起来
        return numbers.reduce(0, combine: +)
    }
    
    sumOf(1, 2, 5, 7, 9) // 24

如果你的需求不单单是 `integer`，元组就会变的很有用。下面这个函数做的事情就是批量更新数据库中的 `n` 个实体：

    
    func batchUpdate(updates: (String, Int)...) -> Bool {
        self.db.begin()
        for (key, value) in updates {
    	self.db.set(key, value)
        }
        self.db.end()
    }
    
    // 我们假想数据库是很复杂的
    batchUpdate(("tk1", 5), ("tk7", 9), ("tk21", 44), ("tk88", 12))

# 高级用法

## 元组迭代

在之前的内容中，我试图避免把元组叫做序列或者集合，因为它确实不是。因为元组中每个元素都可以是不同的类型，所以无法使用类型安全的方式对元组的内容进行遍历或者映射。或者说至少没有优雅的方式。

Swift 提供了有限的反射能力，这就允许我们检查元组的内容然后对它进行遍历。不好的地方就是类型检查器不知道如何确定遍历元素的类型，所以所有内容的类型都是 `Any`。你需要自己转换和匹配那些可能有用的类型并决定要对它们做什么。

    
    let t = (a: 5, b: "String", c: NSDate())
    
    let mirror = Mirror(reflecting: t)
    for (label, value) in mirror.children {
        switch value {
        case is Int:
    	print("int")
        case is String:
    	print("string")
        case is NSDate:
    	print("nsdate")
        default: ()
        }
    }

这当然没有数组迭代那么简单，但是如果确实需要，可以使用这段代码。

## 元组和泛型

Swift 中并没有 `Tuple` 这个类型。如果你不知道为什么，可以这样想：每个元组都是完全不同的类型，它的类型取决于它包含元素的类型。

所以，与其定义一个支持泛型的元组，还不如根据自己需求定义一个包含具体数据类型的元组。

    
    func wantsTuple<T1, T2>(tuple: (T1, T2)) -> T1 {
        return tuple.0
    }
    
    wantsTuple(("a", "b")) // "a"
    wantsTuple((1, 2)) // 1

你也可以通过 `typealiases` 使用元组，从而允许子类指定具体的类型。这看起来相当复杂而且无用，但是我已经碰到了需要特意这样做的使用场景。

    
    class BaseClass<A,B> {
        typealias Element = (A, B)
        func addElement(elm: Element) {
    	print(elm)
        }
    }
    class IntegerClass<B> : BaseClass<Int, B> {
    }
    let example = IntegerClass<String>()
    example.addElement((5, ""))
    // Prints (5, "")

## 定义具体的元组类型

在之前好几个例子中，我们多次重复一些已经确定的类型，比如 `(Int, Int, String)`。这当然不需要每次都写，你可以为它定义一个 `typealias`：

    
    typealias Example = (Int, Int, String)
    func add(elm: Example) {
    }

但是，如果需要如此频繁的使用一个确定的元组结构，以至于你想给它增加一个 `typealias`，那么最好的方式是定义一个结构体。

## 用元组做函数参数

就像 [Paul Robinson 的文章](http://www.paulrobinson.net/function-parameters-are-tuples-in-swift/) 中说到的一样，`(a: Int, b: Int, c: String) ->` 和 `(a: Int, b: Int, c:String)` 之间有一种奇妙的相似。确实，对于 Swift 的编译器而言，方法/函数的参数头无非就是一个元组：

    
    // 从 Paul Robinson 的博客拷贝来的, 你也应该去读读这篇文章:
    // http://www.paulrobinson.net/function-parameters-are-tuples-in-swift/
    
    func foo(a: Int, _ b: Int, _ name: String) -> Int     
        return a
    }
    
    let arguments = (4, 3, "hello")
    foo(arguments) // 返回 4

这看起来很酷是不是？但是等等…这里的函数签名有点特殊。当我们像元组一样增加或者移除标签的时候会发生什么呢？哦了，我们现在开始实验：

    
    // 让我们试一下带标签的:
    func foo2(a a: Int, b: Int, name: String) -> Int {
        return a
    }
    let arguments = (4, 3, "hello")
    foo2(arguments) // 不能用
    
    let arguments2 = (a: 4, b: 3, name: "hello")
    foo2(arguments2) // 可以用 (4)

所以如果函数签名带标签的话就可以支持带标签的元组。

但我们是否需要明确的把元组写入到变量中呢？

    
    foo2((a: 4, b: 3, name: "hello")) // 出错

好吧，比较倒霉，上面的代码是不行的，但是如果是通过调用函数返回的元组呢？

    
    func foo(a: Int, _ b: Int, _ name: String) -> Int     
        return a
    }
    
    func get_tuple() -> (Int, Int, String) {
        return (4, 4, "hello")
    }
    
    foo(get_tuple()) // 可以用! 返回 4!

太棒了！这种方式可以！

这种方式包含了很多有趣的含义和可能性。如果对类型进行很好的规划，你甚至可以不需要对数据进行解构，然后直接把它们当作参数在函数间传递。

更妙的是，对于函数式编程，你可以直接返回一个含多个参数的元组到一个函数中，而不需要对它进行解构。

# 元组做不到啊~

最后，我们把一些元组不能实现事情以列表的方式呈现给大家。

## 用元组做字典的 `Key`

如果你想做如下的事情：

    
    let p: [(Int, Int): String]

那是不可能的，因为元组不符合哈希协议。这真是一件令人伤心的事，因为这种写法有很多应用场景。可能会有疯狂的类型检查器黑客对元组进行扩展以使它符合哈希协议，但是我还真的没有研究过这个，所以如果你刚好发现这是可用的，请随时通过我的 [twitter](http://twitter.com/terhechte) 联系我。

## 元组的协议合规性

给定如下的协议：

    
    protocol PointProtocol {
      var x: Int { get }
      var y: Int { set }
    }

你没法告诉类型检查器这个 `(x: 10, y: 20)` 元组符合这个协议。

    
    func addPoint(point: PointProtocol)
    addPoint((x: 10, y: 20)) // 不可用。

# 附录

就这样了。如果我忘了说或者说错一些事情，如果你发现了确切的错误，或者有一些其他我忘了的事情，请随时[联系我](http://twitter.com/terhechte)

# 更新

**07/23/2015** 添加**用元组做函数参数**章节

**08/06/2015** 更新反射例子到最新的 Swift beta 4（移除了对 `reflect ` 的调用)

**08/12/2015** 更新**用元组做函数参数**章节，加入更多的例子和信息

