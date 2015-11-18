聊一聊单子（Monad）

> 作者：Olivier Halligon，[原文链接](http://alisoftware.github.io/swift/2015/10/17/lets-talk-about-monads/)，原文日期：2015-10-17
> 译者：[ray16897188](http://www.jianshu.com/users/97c49dfd1f9f/latest_articles)；校对：[小袋子](http://daizi.me)；定稿：[numbbbbb](https://github.com/numbbbbb)
  









[之前的一篇文章](http://alisoftware.github.io/swift/2015/10/11/thinking-in-swift-4/)中，我们用`map`、`flatMap`这两种基于`Optional`和`Array`类型的方法做了很多好玩儿的事情。但你可能并没有意识到，你已经在不自知的情况下使用了单子*(单子，即 Monad：一个函数式编程的术语 - 译者注)*。那么什么是单子？



### 什么是函子（Functors）和单子

我们在[之前的一篇文章](http://alisoftware.github.io/swift/2015/10/11/thinking-in-swift-4/)中得知了`map`和`flatMap`对于`Array`和`Optional`来说有着相似的作用，甚至连函数签名都十分相似。

实际上这并不是一个特例：很多类型都有类似`map`和`flatMap`的方法，而这些方法都有那种类型的签名。这是一种十分常见的模式，这种模式的名字叫做*单子*。

你可能之前在网上看过单子这个术语(也可能叫做函子)，还看过尝试解释该术语的各种比喻。但是大部分比喻都让它更加复杂难懂。

**事实上，单子和函子是非常简单的概念。**它可以最终归结为：

**一个函子**是一种表示为`Type<T>`的类型，它：

- 封装了另一种类型（类似于封装了某个`T`类型的`Array<T>`或`Optional<T>`）
- 有一个具有`(T->U) -> Type<U>`签名的`map`方法

**一个单子**是一种类型，它：

- 是一个函子（所以它封装了一个`T`类型，拥有一个`map`方法）
- 还有一个具有`(T->Type<U>) -> Type<U>`签名的`flatMap`方法

这就是对*单子*和*函子*所需要了解的一切！**一个*单子*就是一种带有`flatMap`方法的类型，一个*函子*就是一种带有一个`map`方法的类型。**很简单，不是么？

### 各种类型的单子

你已经学过两种既是*函子*又是*单子*的类型，它们是：`Array<T>`和`Optional<T>`。当然，这样的类型还有很多。

实际上这些类型的方法会有其他的名字，不限于`map`和`flatMap`。例如一个[Promise](http://promisekit.org/)也是一个单子，而它的相对应的`map`和`flatMap`方法叫做`then`。

仔细看一下`Promise<T>`的`then`方法签名，思考一下：它拿到未来返回的值`T`，进行处理，然后要么返回一个新类型`U`，要么返回一个封装了这个新类型的、新的`Promise<U>`... 没错，我们又一次得到了相同的方法签名，所以`Promise`实际上也是一个`单子`！

有很多类型都符合单子的定义。比如`Result`，`Signal`，... 你还可以想到更多（如果需要的话你甚至可以创建你自己的单子）。

看出相似性了吗？（为方便对比加了空格）

    
    // Array, Optional, Promise, Result 都是函子
       anArray     .map( transform: T ->          U  ) ->    Array<U>
    anOptional     .map( transform: T ->          U  ) -> Optional<U>
     aPromise     .then( transform: T ->          U  ) ->  Promise<U>
       aResult     .map( transform: T ->          U  ) ->   Result<U>
    
    // Array, Optional, Promise, Result 都是单子
       anArray .flatMap( transform: T ->    Array<U> ) ->    Array<U>
    anOptional .flatMap( transform: T -> Optional<U> ) -> Optional<U>
      aPromise    .then( transform: T ->  Promise<U> ) ->  Promise<U>
       aResult .flatMap( transform: T ->   Result<U> ) ->   Result<U>

### 把`map()`和`flatMap()`级联起来

通常你还可以把这两个方法级联，这会使它们更加强大。例如，最开始你有一个`Array<T>`，通过使用`map`来对它做`转换`操作，得到一个`Array<U>`，然后对这个`Array<U>`再级联上一个`map`，对它做另一个`转换`操作将其转换成一个`Array<Z>`，等等。这会让你的代码看起来就像是在生产线上一样：把一个初始值拿来，让他经过一系列的黑盒子处理，然后得到一个最终的结果。这时你就可以说你实际上是在做*函数式编程*了！

下面是一个示范如何将`map`和`flatMap`的调用级联起来去做多次转换的例子。我们从一个字符串开始，把它按单词分开，然后依次做如下转换：

1. 统计每个单词的字符个数，做计数
2. 把每个计数转换成一个相对应的单词
3. 给每个结果加个后缀
4. 对每个字符串结果做%转义
5. 把每个字符串结果转换成一个`NSURL`

    
    let formatter = NSNumberFormatter()
    formatter.numberStyle = .SpellOutStyle
    let string = "This is Functional Programming"
    let translateURLs = string
        // Split the characters into words
        .characters.split(" ")
        // Count the number of characters on each word
        .map { $0.count }
         // Spell out this number of chars (`stringFromNumber` can return nil)
        .flatMap { (n: Int) -> String? in formatter.stringFromNumber(n) }
         // add " letters" suffix
        .map { "\($0) letters" }
        // encode the string so it can be used in an NSURL framgment after the # (the stringByAdding… method can return nil)
        .flatMap { $0.stringByAddingPercentEncodingWithAllowedCharacters(.URLFragmentAllowedCharacterSet()) }
        // Build an NSURL using that string (`NSURL(string: …)` is failable: it can return nil)
        .flatMap { NSURL(string: "https://translate.google.com/#auto/fr/\($0)") }
    
    print(translateURLs)
    // [https://translate.google.com/#auto/fr/four%20letters, https://translate.google.com/#auto/fr/two%20letters, https://translate.google.com/#auto/fr/ten%20letters, https://translate.google.com/#auto/fr/eleven%20letters]
上面这段代码可能需要你研究一会儿，尝试去理解每一个中间阶段的`map`和`flatMap`的签名是什么，并搞清楚每一步都发生了什么事。

但无论如何，你能看出来对于描述一系列处理流程来说，这是一种很好的方式。这种方式可以被看做是一条生产线，从`原材料`开始，然后对它做多种`转换`，最终在生产线的尽头拿到`成品`。

### 结论

尽管看起来很吓人，但单子很简单。

但实际上，你怎么叫它们都没关系。只要你知道如果你想把一种封装类型转换成另一种，而某些类型的`map`和`flatMap`方法着实能帮到你，这就够了。

---

这篇文章是"Swift编程思想"系列的后记。别担心，我还会写很多文章，论述 Swift 在其他应用场景下的美妙之处，不过我不会再拿这些和 ObjC 比较了（因为 Swift 真的好太多了，你现在应该完全把 ObjC 忘掉了 😄）。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。