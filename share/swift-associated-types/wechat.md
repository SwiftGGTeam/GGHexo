Swift 关联类型"

> 作者：Russ Bishop，[原文链接](http://www.russbishop.net/swift-associated-types)，原文日期：2015-01-05
> 译者：[靛青K](http://blog.dianqk.org/)；校对：[shanks](http://codebuild.me/)；定稿：[CMB](https://github.com/chenmingbiao)
  









### *我想要一个关联类型的圣诞礼物*

### 关联类型系列文章

- Swift 关联类型
- [Swift 关联类型，续](http://www.russbishop.net/swift-associated-types-cont)
- [Swift ：为什么选择关联类型](http://www.russbishop.net/swift-why-associated-types)

有时候我认为类型理论是故意弄的很复杂，以及所有的那些函数式编程追随者都只是胡说八道，仿佛他们理解了其中的含义。真的吗？你有一篇 5000 字的博客是写关于**插入随机类型理论概念**的吗？毫无疑问的没有。a）为什么有人会关心这些以及b）通过这个高大上的概念能帮我们解决什么问题？我想把你装进麻布袋里，扔进河里，并且砸进一个**坑**里。

我们在讨论什么？当然，关联类型。

当我第一次看到 Swift 范型的实现时，**关联类型** 的用法的出现，让我感到很奇怪。

在这篇文章，我将通过类型概念和一些实践经验，这几乎都是我用自己的思考尝试解释这些概念（如果我犯了错误，请告诉我）。

### 范型

在 Swift 中，如果我想有一个抽象的类型（也就是创建一个范型的**东西**），在类中的语法是这个样子：

    
    class Wat<T> { ... }

类似的，带范型的结构体：

    
    struct WatWat<T> { ... }

或者带范型的枚举：

    
    enum GoodDaySir<T> { ... }

但如果我想有一个抽象的协议：

    
    protocol WellINever {
        typealias T
    }

嗯哼？

### 基本概念

protocol 和 class 、struct 以及 enum 不同，它不支持范型类型*参数*。代替支持[抽象类型成员](http://docs.scala-lang.org/tutorials/tour/abstract-types.html)；在 Swift 术语中称作*[关联类型](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Generics.html#//apple_ref/doc/uid/TP40014097-CH26-XID_289)*。尽管你可以用其它系统完成类似的事情，但这里有一些使用关联类型的好处（以及当前存在的一些缺点）。

协议中的一个关联类型表示：“我不知道具体类型是什么，一些服从我的类、结构体、枚举会帮我实现这个细节”。

你会很惊奇：*“非常棒，但和类型参数有什么不同呢？”*。一个很好的问题。类型参数强迫每个人知道相关的类型以及需要反复的指明该类型（当你在构建他们的时候，这会让你写很多的类型参数）。他们是公共接口的一部分。这些代码**使用**多种结构（类、结构体、枚举）的代码会确定具体选择什么类型。

通过对比关联类型实现细节的部分。它被隐藏了，就像是一个类可以隐藏内部的实例变量。使用抽象的类型成员的目的是推迟指明具体类型的时机。和泛型不同，**它不是在实例化一个类或者结构体时指明具体类型**，而且在服从该协议时，指明其具体类型。这让我们多了一种选择类型的方式。

### 有用的

Scala 的创建者 Mark Odersky [在一次交流时讨论了一个例子](http://www.artima.com/scalazine/articles/scalas_type_system.html)。在 Swift 术语中，如果没有关联类型的话，此时你有一个带有`eat(f:Food)` 的方法的基类或者协议 `Animal` ，之后的`Cow` 类的没有办法指定 `Food` 只能是 `Grass` 。你很清楚不能通过重载这个方法 - 协变参数类型（在子类中添加一个更明确的参数）在大多数的语言都是不支持的，并且是一种不安全的方式 ，当从基类进行类型转换的时候可能得到意料之外的值。

> 译者注：关于协变，您可以参考这篇文章[Friday Q&A 2015-11-20：协变与逆变](http://swift.gg/2015/12/24/friday-qa-2015-11-20-covariance-and-contravariance/) 。

如果 Swift 的协议已经支持类型参数，那代码大概是这个样子：

    
    protocol Food { }
    class Grass : Food { }
    protocol Animal<F:Food> {
       	func eat(f:F)
    }
    class Cow : Animal<Grass> {
        func eat(f:Grass) { ... }
    }

非常棒。那当我们需要再增加些东西呢？

    
    protocol Animal<F:Food, S:Supplement> {
        func eat(f:F)
        func supplement(s:S)
    }
    class Cow : Animal<Grass, Salt> {
        func eat(f:Grass) { ... }
        func supplement(s:Salt) { ... }
    }

增加了类型参数的数量是很不爽的，但这并不是我们的唯一问题。我们到处泄露实现的细节，需要我们去重新指明具体的类型。`var c = Cow()` 的类型就变成了 `Cow<Grass,Salt>` 。一个 **doCowThings** 方法将变成 `func doCowThings(c:Cow<Grass,Salt>)` 。那如果我们想让所有的动物都吃草呢？并且我们没有方式表明我们不关心 `Supplement` 类型参数。

当我们从 `Cow` 中获得了创建特别的品种，我们的类就会很白痴的定义成这样：`class Holstein<Food:Grass, Supplement:Salt> : Cow<Grass,Salt> `。

更糟糕的是，一个买食物来喂养这些动物的方法变成这个样子了：`func buyFoodAndFeed<T,F where T:Animal<Food,Supplement>>(a:T, s:Store<F>) ` 。这真的很丑很啰嗦，我们已经无法把 `F` 和 `Food` 关联起来了。如果我们重写这个方法，我们可以这样写`func buyFoodAndFeed<F:Food,S:Supplement>(a:Animal<Food,Supplement>, s:Store<Food>)`，但这并不会有作用 - 当我们尝试传入一个 `Cow<Grass, Salt>`  参数，Swift 会抱怨 `’Grass’ is not identical to ‘Food’`（’Grass’ 和 ‘Food’ 不相同）。再补充一点，注意到这个方法并不关心 `Supplement` ，但这里我们却不得不处理它。

现在让我们看看如何用关联类型帮我们解决问题：

    
    protocol Animal {
        typealias EdibleFood
        typealias SupplementKind
        func eat(f:EdibleFood)
        func supplement(s:SupplementKind)
    }
    class Cow : Animal {
        func eat(f: Grass) { ... }
        func supplement(s: Salt) { ... }
    }
    class Holstein : Cow { ... }
    func buyFoodAndFeed<T:Animal, S:Store where T.EdibleFood == S.FoodType>(a:T, s:S){ ... }

现在的类型签名清晰多了。Swift 指向这个关联类型，只是通过查找 `Cow` 的方法签名。我们的 `buyFoodAndFeed` 方法，可以清晰的表达商店卖的食物是动物吃的食物。事实上，Cow 需要一个特别的食物类型，而这个具体实现是在 Cow 类里面，但这些信息仍然要在在编译时确定。

### 真实的例子

讨论了一会关于动物的事情，让我们再来看看 Swift 中的 `CollectionType` 。

> **笔记：** 作为一个具体实现，许多 Swift 协议都有带前导下划线的嵌套协议；比如 `CollectionType -> _CollectionType` 或者 `SequenceType -> _Sequence_Type -> _SequenceType`。简单来说，当我们讨论这些协议时，我即将打平这些层级。所以当我说 `CollectionType` 有 `ItemType` 、`IndexType` 和 `GeneratorType` 关联类型时，你并不能在协议 `CollectionType` 本身中找到这些。

显然，我们需要元素 `T` 的类型，但我们也需要这个索引和生成器(generator)/计数器 (enumerator)的类型，这样我们才可以处理 `subscript(index:S) -> T { get }` 和 `func generate() -> G<T>` 。如果我们只是使用类型参数，唯一的方法就是提供一个带泛型的 `Collection` 协议，在一个假想的 `CollectionOf<T,S,G>` 中指明 `T` `S` `G` 。

其他语言是怎么处理的呢？C# 并没有抽象类型成员。他首先处理这些是通过不支持任何东西而不是一个开放式的索引，这里的类型系统不会表明索引是否只能单向移动，是否支持随机存取等等。数字的索引就只是个整型，以及类型系统也只会表明这一信息。

其次，对于生成器 `IEnumerable<T>` 会生成一个 `IEnumerator<T>` 。起初这个不同看起来非常的微妙，但 C# 的解决方案是用一个接口（协议）直接的抽象覆盖掉这个生成器，允许它避免必须去声明特别的生成器类型，作为一个参数，像 `IEnumerable<T>` 。

Swift 目的是做一个传统的编译系统（non-VM ， non-JIT）编程语言，考虑到性能的需求，需要动态行为类型并不是一个好主意。编译器真的倾向于知道你的索引和生成器的类型，以便于它可以做一些奇妙的事情，比如代码嵌入（inlining）以及知道需要分配多少内存这样奇妙的事情。
唯一的方法就是，通过*香肠研磨机*在编译时便利出所有的泛型。如果你强迫将它推迟到运行时，这也就意味着你需要一些间接的、装箱和其他的类似比较好的技巧，但这些都是有门槛的。

### 愚蠢的事实

**这里主要的带有抽象类型成员的 “gotcha” ：Swift 不会完全地让你确定他们是变量还是参数类型，毕竟这是不必要的事情。**只有在使用到泛型约束的时候，你才会用到带有关联类型的协议。

在我们的之前的 `Animal` 例子中，调用 `Animal().eat` 是不安全的，因为它只是一个抽象的 `EdibleFood` ，并且我们不知道这个具体的类型。

理论上，这些代码本应该可以工作的，只要泛型在这个方法上强迫动物吃商店销售的食物的约束，但实际上，当测试它的时候，我遇到了一些 `EXC_BAD_ACCESS` 的崩溃，我不确定这是情况是不是因为编译器的问题。

    
    func buyFoodAndFeed<T:Animal,S:StoreType where T.EdibleFood == S.FoodType>(a:T, s:S) {
        a.eat(s.buyFood()) //crash!
    }

我们没有办法使用这些协议作为参数或者变量类型。这只是需要考虑的更远一些。这是一个我希望在未来 Swift 会支持的一个特性。我希望声明变量或者类型时能够写成这样的代码：

    
    typealias GrassEatingAnimal = protocol<A:Animal where A.EdibleFood == Grass>
    
    var x:GrassEatingAnimal = ...

*注意：使用 `typealias` 只是创建一个类型别名，而不是在协议中的关联类型。我知道这可能有些让人感觉困惑。*

这个语法将会让我声明一个变量可以持有一些动物的一些类型，而这里的动物关联的 `EdiableFoof` 是 `Grass` 。它可能是很有用的，如果在协议中约束其关联类型，但这看起来你可能会进入一个不安全的位置，导致需要考虑的更多一些。如果你开始运行时，有一件事，你需要**约束**关联类型在这个编译器的定义的协议不能安全的约束任何带泛型的方法（见下文）。

当前情况下，为了获得一个类型参数，你必须通过创建一个封装的结构体”擦除“其关联类型。进一步的警告：这很丑陋。

    
    struct SpecificAnimal<F,S> : Animal {
        let _eat:(f:F)->()
        let _supplement:(s:S)->()
        init<A:Animal where A.EdibleFood == F, A.SupplementKind == S>(var _ selfie:A) {
            _eat = { selfie.eat($0) }
            _supplement = { selfie.supplement($0) }
        }
        func eat(f:F) {
            _eat(f:f)
        }
        func supplement(s:S) {
            _supplement(s:s)
        }
    }

如果你曾考虑过为什么 Swift 标准库会包括 `GeneratorOf<T>:Generator` 、`SequenceOf<T>:Sequence` 和 `SinkOf<T>:Sink` … 我想现在你知道了。

我上面提到的这个 bug ，如果 `Animal ` 指明了 `typealias EdibleFood:Food ` 之后，即使你给它定义了 `typealias EdibleFood:Food ` ，这个结构体仍然是无法编译的。即使是在结构体中进行了清晰的约束， Swift 将会抱怨 `F` 不是 `Food` 。详情可以见 rdar://19371678 。

### 总结

就像我们之前看到的，关联类型允许在编译时提供多个具体的类型，只要该类型服从对应的协议，从而不会用一堆类型参数污染类型定义。对于这个问题，它们是一个很有趣的解决方案，用泛型类型参数表达出不同类型的抽象成员。

更进一步考虑，我在想，如果采取 Scala 的方案，简单的为 class 、 struct 、enum 以及 protocol 提供类型参数和关联类型两个方法会是否更好一些。我还没有进行更深入的思考，所以还有一些想法就先不讨论了。对于一个新语言最让人兴奋的部分是 - 关注它的发展以及改进进度。

现在走的更远一些，并且向你的同事开始炫耀类似*抽象类型成员*的东西。之后你也可以称霸他们，讲一些很难理解的东西。

要远离麻袋。

还有河水。

没有坑，坑是令人惊奇的。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。��，最新文章请访问 [http://swift.gg](http://swift.gg)。