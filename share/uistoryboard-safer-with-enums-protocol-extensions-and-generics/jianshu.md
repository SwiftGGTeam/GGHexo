UIStoryboard：和枚举、协议扩展、泛型一起使用更安全"

> 作者：Andyy Hope，[原文链接](https://medium.com/swift-programming/uistoryboard-safer-with-enums-protocol-extensions-and-generics-7aad3883b44d#.78boguiqy)，原文日期：2016-01-24
> 译者：jseanj；校对：[saitjr](http://www.saitjr.com)；定稿：[CMB](https://github.com/chenmingbiao)
  









几周前，我无意发现 [Guille Gonzalez](https://medium.com/u/fbc540d399e7)  写的一篇[文章](https://medium.com/@gonzalezreal/ios-cell-registration-reusing-with-swift-protocol-extensions-and-generics-c5ac4fb5b75e#.d8iqbh6db)，介绍了如何用协议和扩展让 UITableViewCell 的注册和重用更安全。

看完这篇文章后我非常惊叹，因为不需要依赖继承，只需要协议扩展和泛型就可以非常容易的实现自定义的行为。自从 WWDC15，我们已经听到关于 Swift 如何是一门[面向协议的语言](https://developer.apple.com/videos/play/wwdc2015-408/)，而我只是一知半解，如果你懂我的意思的话。而就在此时我终于明白他们在讲的是什么了。

在我花费大量时间做的应用中有一个大的 storyboard，使用起来令人难以置信的繁琐，所以我最后决定将它分离开。将一个巨大的 UIStoryboard 分成众多小的 UIStoryboard，然后我只需要在我的代码中用不同的字符串去实例化 UIStoryboard，但是这样从来不安全。

<!-- more -->

## 字符串

### 你留在家中的无声杀手

    
    let name = "News"
    let storyboard = UIStoryboard(name: name, bundle: nil)
    let identifier = "ArticleViewController"
    let viewController = storyboard.instantiateViewControllerWithIdentifier(identifier) as! ArticleViewController

上面的代码中，我们创建了一个名称为 _“News”_ 的 UIStoryboard 实例，这会在工程资源目录下找名称为 _“News.storyboard”_ 的文件。但是，如果有一个更复杂的名称比如 _“Onomatopoeia”_，由于这个词非常奇怪并且不寻常，导致我为了文章的书写必须查查怎么拼写这个词。可以想象，在工程代码中如果我要不停的去猜如何拼写类似的词，这将是非常愚蠢的，但实际上人们就是在做着疯狂的事情。

不知道怎么拼写就算了，更糟的是由于它是一个字符串，Xcode 的语法检查器并不会检测出来拼写错误，因此你只能在运行时才可能发现这种错误。唉！

## 如何才能让 UIStoryboard 更安全

### 全局字符串常量

不，永远不。刚开始这听起来是一个好想法，因为你只需要定义一次常量就可以在任何地方使用。如果你想改变常量的值，只需要更改一处就可以让工程中所有使用该常量的地方发生变化。

但是这样你会少了一个变量名，你会对经常要重用一个变量名而感到惊讶。你曾经尝试过给一个 NSObject 的子类的属性命名为 “description” 吗？这时你就知道我的意思了。如果 storyboards 使用多个字符串常量标识符的话，就会丧失一致性，如果它们定义在工程中的不同地方，也会使查找和合并它们变得更困难。

定义一个全局字符串常量还有诸多坏处，但是为了继续讨论文章中要提到的精华，所以我们将会忽略这些坏处。

### 关联的 Storyboard 名称

首要原则是你的 storyboard 应该以它包含的模块命名。例如，如果一个 storyboard 包含的控制器是关于新闻的，那么就把 storyboard 文件命名为 “News.storyboard”。

![](https://miro.medium.com/max/912/1*RPGWe7qndb5kKEsPcvPF7Q.png)

### 统一 Storyboard 标识符

当你打算在你的控制器上使用 Storyboard 标识符时，通常的做法是使用类名作为标识符。比如 “ArticleViewController” 作为 ArticleViewController 的标识符。这将会减少你和同事们的负担，你和你的同事们不必再去想和记忆统一标识符或者命名规范。

![](https://miro.medium.com/max/1139/1*NG_YDV3--KHnzL56NIhGdQ.png)

### 枚举

可以考虑将枚举作为统一的、中心全局化的 UIStoryboard 字符串标识符。为了让 storyboard 实例化对象变得真正的安全，我们可以创建一个 UIStoryboard 类的扩展，其中定义了工程中不同的 storyboard 文件。

    
    extension UIStoryboard {
        enum Storyboard : String {
            case Main
            case News
            case Gallery
        }
    }

正如你所见，所有的内容在工程中都是统一并且中心化的。实例化也更加安全，当你敲击标识符时 Xcode 也会自动补全。

    
    let storyboard = UIStoryboard(name: UIStoryboard.Storyboard.News.rawValue, bundle: nil)

这段代码可以顺畅的编译并运行，但是语法却很丑陋。因此我们再深入地简化一下语法，在 UIStoryboard 扩展中创建一个便利构造方法：

    
    convenience init(storyboard: Storyboard, bundle: NSBundle? = nil) {
        self.init(name: storyboard.rawValue, bundle: bundle)
    }
    ...
    let storyboard = UIStoryboard(storyboard: .News)

你将会注意到，_bundle:_ 参数默认是 _nil_，因此在调用构造方法时可以忽略 _bundle:_ 参数。

这样做的原因是如果你传 _nil_ 给 bundle 参数，UIStroyboard 类会去 main bundle 中查找资源，所以给 _bundle_ 参数传 _nil_ 和传 _NSBundle.mainBundle()_ 是一样的，就像苹果文档中说的：

> bundle 中包含了 storyboard 文件和相关的资源文件，如果你传 nil，这个方法会去当前应用的 main bundle 中查找。
> —— [UIStoryboard Class Reference](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIStoryboard_Class/#//apple_ref/occ/clm/UIStoryboard/storyboardWithName:bundle:)

和创建便利构造方法等价的是创建一个 UIStoryboard 类方法，该类方法返回 UIStoryboard 实例。

    
    class func storyboard(storyboard: Storyboard, bundle: NSBundle? = nil) -> UIStoryboard {
        return UIStoryboard(name: storyboard.rawValue, bundle: bundle)
    }
    ...
    let storyboard = UIStoryboard.storyboard(.News)

无论是创建便利构造方法还是类方法，结果都是一样的。唯一的差别是语法形式上的个人喜好，我个人认为类方法更好一些，因此我会在自己的代码中使用它们。无论你选择哪种方式，确保在你的工程中保持一致就可以了。

好的，让我们加大马力来看看在文章开头中吸引你的那些东西。

## 协议扩展和泛型

通常工程中不会有那么多的 storyboard 文件，即使我们有 20 个 storyboard 文件，我们也可以使用上面的方法来很好的维护它们。另一方面，控制器完全就是另一回事了。在我工作的 Xcode 工程中快速的搜索一下，我发现目前使用了超过 100 个不同的 UIViewController 子类。这是一个难题。

    
    let storyboard = UIStoryboard.storyboard(.News)
    let identifier = "ArticleViewController"
    let viewController = storyboard.instantiateViewControllerWithIdentifier(identifier) as! ArticleViewController

现在我们不仅要管理代码中的 storyboard 标识符和 Interface Builder，还要处理各种各样的类型转换，因为这个方法只返回 UIViewController：

    
    func instantiateViewControllerWithIdentifier(_ identifier: String) -> UIViewController

由于我们有如此多的 UIViewController 子类，所以之前在 UIStoryboard 中使用的枚举方式会比字符串标识符更好一些，但是这种方式管理这么多控制器仍显笨拙。

### StoryboardIdentifiable 协议

    
    protocol StoryboardIdentifiable {
        static var storyboardIdentifier: String { get }
    }

我们创建一个任何类都可以遵循的协议，协议中有一个静态变量 storyboardIdentifier。这将会减少我们管理控制器标识符的工作量。

### StoryboardIdentifiable 协议扩展

    
    extension StoryboardIdentifiable where Self: UIViewController {
        static var storyboardIdentifier: String {
            return String(self)
        }
    }

在我们的协议扩展声明中，_where_ 子句表示该扩展只适用于 UIViewController 或者它的子类。像 NSDate 这样的类就不会获取到 _storyboardIdentifier_ 协议变量。

在协议扩展中，我们提供了一个在运行时动态获取 _storyboardIdentifier_ 字符串的方法。

我最近才发现 Swift 字符串有这样的功能，这要感谢 [NatashaTheRobot](https://twitter.com/NatashaTheRobot) 的 [文章](https://www.natashatherobot.com/nsstringfromclass-in-swift/)。这个比 Objective-C 的 NSStringFromClass() 更好，这里是[原因](http://stackoverflow.com/questions/24107658/get-a-user-readable-version-of-the-class-name-in-swift-in-objc-nsstringfromclas)。（译者注：同时，翻译组也翻译了 Natasha 的这篇文章，详见：[《优雅的 NSStringFromClass 替代方案》](http://swift.gg/2016/01/29/nsstringfromclass-in-swift/)）

    
    let classString = String(ArticleViewController)
    print(classString) 
    // prints: ArticleViewController

### StoryboardIdentifiable 全局一致性

    
    extension UIViewController : StoryboardIdentifiable { }

现在我们让工程中的每个 UIViewController 都遵循 StoryboardIdentifiable 协议。这种方式减轻了工作量，使得我们不用更新每个 UIViewController 来遵循该协议，同时也不需要记住在创建新的 UIViewController 类时让它遵循该协议。

    
    class ArticleViewController : UIViewController { }
    ...
    print(ArticleViewController.storyboardIdentifier)
    // prints: ArticleViewController

### 带有泛型的 UIStoryboard 扩展

    
    func instantiateViewController<T: UIViewController where T: StoryboardIdentifiable>() -> T

我们摆脱了使用 storyboard 字符串标识符从 storyboard 中创建控制器，取而代之的是一种更新更安全的方式：

    
    extension UIStoryboard {
        func instantiateViewController<T: UIViewController where T: StoryboardIdentifiable>() -> T {
            let optionalViewController = self.instantiateViewControllerWithIdentifier(T.storyboardIdentifier)
    
            guard let viewController = optionalViewController as? T  else {
                fatalError(“Couldn’t instantiate view controller with identifier \(T.storyboardIdentifier) “)
            }
    
            return viewController
        }
    }

这里我们使用泛型，它只允许我们传入的类是 UIViewController 或者是 UIViewController 的子类，而且在泛型声明中有一个 _where_ 子句，它限制了这些类也需要遵循 _StoryboardIdentifiable_ 协议。

如果我们尝试传入一个 NSObject 对象，Xcode 会编译不过。或者我们传入一个 UIViewController 但是不遵循 _StoryboardIdentifiable_ 协议的对象，Xcode 也不会编译通过。这已经足够安全。

    
    <T: UIViewController where T: StoryboardIdentifiable>() -> T

> Yo! 这些奇怪的语法是什么？

通常泛型使用 _“T”_ 作为参数名称，然而你可以在尖括号里的第一次声明时替换成任何你想要的名称。如果我们想换，我们可以将 _T_ 重命名为一个更易读的名称 “VC” 或者 “ViewController”：

    
    <VC: UIViewController where VC: StoryboardIdentifiable>() -> VC

无论你使用哪个名称，必须在声明和方法体中保持一致。但是对于这个例子，我们会坚持用 _T_，因为你会在其他的代码和例子中发现这是 Swift 的传统。

> 关于 Swift 泛型的更多内容可以到[官方文档](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Generics.html)中查看

回到刚刚打断的地方：

    
    let optionalViewController = self.instantiateViewControllerWithIdentifier(T.storyboardIdentifier)

我们调用原始的 UIStoryboard 的 instantiateViewControllerWithIdentifier 方法，并传递 storyboardIdentifier 变量作为参数，方法返回的是一个可选类型的 UIViewController。

    
    guard let 
        viewController = optionalViewController as? T 
    else {
        fatalError(“Couldn’t instantiate view controller with identifier \(T.storyboardIdentifier) “)
    }
    return viewController

我们尝试对可选类型的 UIViewController 对象进行解包，并转换成传入的类型。如果由于某种原因控制器不存在，_fatalError_ 方法会被调用，同时控制台会在调试模式时通知你，因此这些错误不会在发布版本中发生。

最后，我们返回类型是 _T_ 的解包过的 _viewController_。

## 实践

    
    class ArticleViewController : UIViewController
    { 
        func printHeadline() { }
    }
    ...
    let storyboard = UIStoryboard.storyboard(.News)
    let viewController: ArticleViewController = storyboard.instantiateViewController()
    viewController.printHeadline()
    presentViewController(viewController, animated: true, completion: nil)

这就是全部，我们摆脱了丑陋的，不安全的字符串标识符，取而代之的是枚举、协议扩展和泛型。

而且，我们可以通过 UIStoryboard 方法实例化一个特殊类型的控制器对象，并且不需要类型转换就可以执行特殊的操作。这难道不是你一天当中看到的最棒的事情吗？

## 更新

感谢 [Raifura Andrei](https://medium.com/u/f7e214e82b32) 和 [Kyle Davis](https://medium.com/u/c020125e0086) 的反馈，我已经更新了文章和示例代码，简化了语法同时提高了可读性。Github 和 Gists 也同步更新了。享受吧。

本文的[示例代码](https://github.com/andyyhope/Blog_UIStoryboardSafety)可以在 Github 上找到。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。