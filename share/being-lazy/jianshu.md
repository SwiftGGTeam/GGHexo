“懒”点儿好"

> 作者：Olivier Halligon，[原文链接](http://alisoftware.github.io/swift/2016/02/28/being-lazy/)，原文日期：2016-02-28
> 译者：[ray16897188](http://www.jianshu.com/users/97c49dfd1f9f/latest_articles)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[星夜暮晨](http://www.jianshu.com/users/ef1058d2d851)
  









今天我们来看看怎样通过变懒la💤y 😴...来提高效率⚡️。具体点儿说，我们要聊一聊 `lazy var`、`LazySequence` 和喵星人😸。

![](https://swift.gg/img/articles/being-lazy/12401458869117.3506308)



## 问题描述

假设你要做一个聊天应用，想用头像表示你的用户。针对每个头像你都要准备不同分辨率的版本，所以我们这样做：

    
    extension UIImage {
      func resizedTo(size: CGSize) -> UIImage {
        /* 这里是图片大小调整算法，涉及到大量计算 */
      }
    }
    
    class Avatar {
      static let defaultSmallSize = CGSize(width: 64, height: 64)
    
      var smallImage: UIImage
      var largeImage: UIImage
    
      init(largeImage: UIImage) {
        self.largeImage = largeImage
        self.smallImage = largeImage.resizedTo(Avatar.defaultSmallSize)
      }
    }

以上代码的弊端：我们需要在 `init` 中计算出 `smallImage` 的，因为编译器要求我们在 `init` 中初始化 `Avatar` 的所有属性。

但我们有可能会使用另一个小尺寸版本的用户头像，那么这个缺省值（`smallImage`）根本就不会被用到。也就是说，我们用计算量很大的图像缩放算法算出了这个缺省值，却没有~~任何卵用~~。

## 一种可能的解决方案

在 Objective-C 里，类似情况我们往往会使用一个中间私有变量（intermediate private variable），该用法翻译成 Swift 是这样：

    
    class Avatar {
      static let defaultSmallSize = CGSize(width: 64, height: 64)
    
      private var _smallImage: UIImage?
      var smallImage: UIImage {
        get {
          if _smallImage == nil {
            _smallImage = largeImage.resizedTo(Avatar.defaultSmallSize)
          }
          return _smallImage! // 🐴
        }
        set {
          _smallImage = newValue
        }
      }
      var largeImage: UIImage
    
      init(largeImage: UIImage) {
        self.largeImage = largeImage
      }
    }

用这种方式，我们就可以随时给 `smallImage` 赋一个新值。但是如果在使用它之前没有赋过值，它不会返回 `nil`，而是基于 `largeImage` 计算一个值并返回。

这恰好满足我们的需求。但是代码实在太多。想想看，如果每个头像需要准备更多分辨率的版本，而且对每种版本都有这种需求，那该多恐怖！

## Swift的惰性初始化（lazy initialization）

![](https://swift.gg/img/articles/being-lazy/12401458869118.9293513)

多亏了 Swift，我们可以省掉上面那些胶水代码（glue code），偷点儿懒... 只要简单的把 `smallImage` 变量声明成一个 `lazy` 存储属性即可！

    
    class Avatar {
      static let defaultSmallSize = CGSize(width: 64, height: 64)
    
      lazy var smallImage: UIImage = self.largeImage.resizedTo(Avatar.defaultSmallSize)
      var largeImage: UIImage
    
      init(largeImage: UIImage) {
        self.largeImage = largeImage
      }
    }

搞定了，使用 `lazy` 关键字，我们用更少代码实现了相同的行为！

- 如果我们在给 `smallImage` 惰性变量赋一个特定值之前使用了它，那么*当且仅当*此时该变量的缺省值才会被计算并返回。如果随后我们再次使用这个属性，它的值就已经被计算出来，会直接返回这个已存储的值。
- 如果我们在访问 `smallImage` 之前给它赋一个确切的值，那它就不会浪费时间计算那个缺省值，（随后访问它时）返回的是我们之前给它的那个确切的值。
- 如果我们永远不访问 `smallImage` 这个属性，那它的缺省值就永远不会被计算出来！

这就是一种可以避免无用初始化的有效且简单的方法，而且在没有使用中间私有变量的情况下提供缺省值。

## 用一个闭包做初始化

和其他属性一样，你可以用一个原地计算（in-place-evaluated）闭包来给 `lazy` 变量设定缺省值 - 使用`= { /* some code */ }()`替换掉`= some code`。当你需要多行代码去计算缺省值时，这么做更好。

    
    class Avatar {
      static let defaultSmallSize = CGSize(width: 64, height: 64)
    
      lazy var smallImage: UIImage = {
        let size = CGSize(
          width: min(Avatar.defaultSmallSize.width, self.largeImage.size.width),
          height: min(Avatar.defaultSmallSize.height, self.largeImage.size.height)
        )
        return self.largeImage.resizedTo(size)
      }()
      var largeImage: UIImage
    
      init(largeImage: UIImage) {
        self.largeImage = largeImage
      }
    }

但由于它是一个 `lazy` 属性，**所以你可以在闭包里引用`self`！**（注意，即使不用闭包你也可以引用 `self`，之前的例子就是。）

属性是 `lazy` 意味着它的缺省值暂时不会计算，当它需要计算的时候，`self` 已经完成初始化。这就是为什么你可以在那里使用 `self` ——这和非 `lazy` 属性正好相反：它的缺省值在初始化阶段就被计算出来了。

ℹ️*瞬发闭包（Immdiately-applied closures），比如上面给 `lazy` 变量做缺省值的那个闭包，它是[自动`@noescape`](https://twitter.com/jckarter/status/704100315587477504)的。这就意味着在这个闭包中无需加`[unowned self]`：这里不会产生引用循环。*

## lazy let？

在 Swift 里你**不能**创建 `lazy let` 实例属性，因此无法实现一个使用时才会被计算的常量😢。这是由 `lazy` 的具体实现细节决定的：它在没有值的情况下以某种方式被初始化，然后在被访问时改变自己的值，这就要求该属性是可变的<sup>1</sup>。

既然我们说到了 `let`，顺便说一条比较有意思的特性：**被声明在全局作用域下**、或者被声明为一个**类型属性**（声明为`static let`、而非声明为实例属性）的常量是自动具有惰性（lazy）的（还是线程安全的）<sup>2</sup>：

    
    // 全局变量，被以 lazy 形式（和一种线程安全的形式）创建
    let foo: Int = {
      print("Global constant initialized")
      return 42
    }()
    
    class Cat {
      static let defaultName: String = {
        print("Type constant initialized")
        return "Felix"
      }()
    }
    
    @UIApplicationMain
    class AppDelegate: UIResponder, UIApplicationDelegate {
      func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {
        print("Hello")
        print(foo)
        print(Cat.defaultName)
        print("Bye")
        return true
      }
    }

这段代码会先打印出 `Hello`，然后是 `Global constant initialized` 和 `42`，接下来是 `Type constant initialized` 和 `Felix`，最后是 `Bye`；证明了 `foo` 和 `Cat.defaultName` 这两个常量只在被访问时才被创建，而非初始化时创建<sup>3</sup>。

![](https://swift.gg/img/articles/being-lazy/lazy-cat-on-leash.gif1458869119.3902402)

*⚠️别把这个和class或结构体里面的实例属性的情况搞混了。如果你声明一个`struct Foo { let bar = Bar() }`，那 `bar` 这个实例属性会在一个 `Foo` 实例被创建的时候就被计算出来（作为其初始化的一部分），而不是以惰性的形式。*

## 另一个例子：Sequences

我们再举一个例子，这次是 sequence（序列）/ `Array`，以及一些高阶函数<sup>4</sup>，比如 `map`：
    
    func increment(x: Int) -> Int {
      print("Computing next value of \(x)")
      return x+1
    }
    
    let array = Array(0..<1000)
    let incArray = array.map(increment)
    print("Result:")
    print(incArray[0], incArray[4])

对这段代码来说，在我们访问 `incArray` 的值**之前**，**所有的输出值都被计算出来了**。所以在 `print("Result:")`被执行之前你会看到有 1000 行 `Computing next value of …`！即使我们只读了`[0]`和`[4]`这两个条目，根本就没关心其他剩下的... 想想假如我们用的函数计算量比 `increment` 更大会怎样！

## Lazy sequences（惰性序列）

![](https://swift.gg/img/articles/being-lazy/12401458869121.470778)

OK，我们来用另一种形式的 `lazy` 解决上面的问题。

在 Swift 标准库中，`SequenceType` 和 `CollectionType` 协议都有个叫 `lazy` 的计算属性，它能给我们返回一个特殊的 `LazySequence` 或者 `LazyCollection`。这些类型只能被用在 `map`，`flatMap`，`filter`这样的高阶函数中，而且是以一种**惰性**的方式。<sup>5</sup>

来看看如何使用：

    
    let array = Array(0..<1000)
    let incArray = array.lazy.map(increment)
    print("Result:")
    print(incArray[0], incArray[4])

现在这段代码只打印出来这些...

    
    Result:
    Computing next value of 0…
    Computing next value of 4…
    1 5

...证明了只是在那些值被使用时才调用 `increment` 函数，而不是调用 `map` 的时候。并且只对那些被访问到的值使用，而不是对整个数组里面一千个值都使用！🎉

这下效率提高了很多！对那些涉及到庞大的序列（比如这个有 1000 个元素的数组）、以及高计算度闭包的情景来说，使用这个技巧会带来质变。<sup>6</sup>

## 将惰性序列级联

有关惰性序列，最后一个小妙招就是你可以像 [monad](http://swift.gg/2015/10/30/lets-talk-about-monads/) 那样，把高阶函数的调用拼接起来。比如你可以让一个惰性序列以这种方式调用 `map`（或者 `flatMap`）：

    
    func double(x: Int) -> Int {
      print("Computing double value of \(x)…")
      return 2*x
    }
    let doubleArray = array.lazy.map(increment).map(double)
    print(doubleArray[3])

这样只有当 `array[3]` 被访问时，`double(increment(array[3]))` 才会被执行，被访问之前不会有这个计算，数组的其他元素也不会有这个计算！

与之相对，如果使用 `array.map(increment).map(double)[3]`（不带 `lazy`）会首先对整个 `array` 序列的所有元素进行计算，所有结果都计算出来之后再提取出第4个元素。更糟糕的是**对数组的迭代要进行两次**，每个 `map` 都会有一次。这对计算时间（computational time）来说是怎样的一种浪费！

## 结论

正如那句话所说的：`“懒惰是人类文明进步的真正动力”`。

![](https://swift.gg/img/articles/being-lazy/12401458869121.7200716)

---

1. Swift 的邮件列表中还在讨论如何解决相应问题并使 `lazy let` 成为可能，但是在 Swift 2 中还是无法使用。

2. 请注意，在 playground 或者 REPL 中代码的执行环境类似一个 `main()` 函数，因此最外层声明的 ` let foo: Int` 不会被看做是一个全局常量。因此（在 playground 或者 REPL 中）你看不到类似的结果。别被 playground 或者 REPL 骗了，实际项目中的那些 `let` 的全局常量确实是 lazy 的。

3. 顺便说下，在 `class` 中使用 `static let` 是 Swift 创建单例的最佳实践（即使你应该避免使用单例😉），原因在于 `static let` 是惰性的、线程安全的，而且只能被创建一次。

4. “高阶函数”是一种能把另外一个函数当做参数或者能返回一个函数（或者两者都能）的函数。常见的高阶函数有 `map`，`flatMap`，`filter`等等。

5. 实际上，这些类型其实就是保留了一个对“原序列”的引用，又保留了一个对“待调用闭”的引用，然后只在某个元素被访问时再对这个元素调用该闭包，做出实际的计算。

6. 但请知悉 - 至少以我自己实验的结果 - 计算出的返回值并没有被缓存（memoization）；所以如果你再次调用`incArray[0]`，结果就又被计算一次。鱼与熊掌不可兼得...（目前）

7. 对，我太懒了就没写结论。但是就像这篇文章说的那样，对懒的追求可以将你造就成一个好的程序员，对吧？😜
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。