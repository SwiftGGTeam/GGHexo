Swift 中的面向协议编程：引言"

> 作者：Andrew Jaffee，[原文链接](https://www.appcoda.com/protocol-oriented-programming/)，原文日期：2018-03-20
> 译者：[灰s](https://github.com/dzyding)；校对：[numbbbbb](http://numbbbbb.com/)，[WAMaker](https://github.com/WAMaker)；定稿：[Pancf](https://github.com/Pancf)
  









对于开发者来说，复杂性是最大的敌人，因此我会去了解那些可以帮助我管理混乱的新技术。Swift 中的“面向协议编程”（POP）是最近（至少自2015年以来）引起广泛关注的“热门”方法之一。在这里我们将使用 Swift 4。在我自己编写代码时，发现 POP 很有前途。更吸引人的是，Apple 宣称 [**“Swift 的核心是面对协议的”**](https://developer.apple.com/videos/play/wwdc2015/408/?time=868)。我想在一个正式的报告中分享关于 POP 的经验，一篇关于这个新兴技术清晰而简洁的教程。  

我将解释关键概念，提供大量代码示例，无法避免的将 POP 和 OOP （面向对象编程）进行比较，并对面向流行编程（FOP?）的人群所声称的 POP 是解决所有问题的灵丹妙药这一说法进行泼冷水。  

面向协议编程是一个很棒的新工具，值得*添加到你现有的编程工具库中*，但是**没有什么**可以代替那些经久不衰的基本功，就像将大的函数拆分成若干个小函数，将大的代码文件拆分成若干个小的文件，使用有意义的变量名，在敲代码之前花时间设计架构，合理而一致的使用间距和缩进，将相关的属性和行为分配到类和结构体中 - 遵循这些常识可以让世界变得不同。如果你编写的代码无法被同事理解，那它就是无用的代码。  

学习和采用像 POP 这样的新技术并不需要绝对的唯一。POP 和 OOP 不仅可以共存，还可以互相协助。对于大多数开发者包括我自己，掌握 POP 需要时间和耐心。因为 POP 真的很重要，所以我将教程分成两篇文章。本文将主要介绍和解释 Swift 的协议和 POP。第二篇文章将深入研究 POP 的高级应用方式（比如从协议开始构建应用程序的功能），范型协议，从引用类型到值类型转变背后的动机，列举 POP 的利弊，列举 OOP 的利弊，比较 OOP 和 POP，阐述为什么“Swift 是面向协议的”，并且深入研究一个被称为 [**“局部推理”**](https://developer.apple.com/videos/play/wwdc2016/419/?time=41) 的概念，它被认为是通过使用 POP 增强的。这次我们只会粗略涉及一些高级主题。  
 

## 引言
作为软件开发者，**管理复杂性**本质上是我们最应该关注的问题。当我们尝试学习 POP 这项新技术时，你可能无法从时间的投资中看到即时回报。但是，就像你对我的认识有个过程一样，你将会了解 [**POP 处理复杂性的方法**](https://developer.apple.com/videos/play/wwdc2015/408/)，同时为你提供另一种工具来控制软件系统中固有的混乱。  

我听到越来越多关于 POP 的*讨论*，但是却很少看到使用这种方式编写的产品代码，换句话说，我还没有看到有很多人从协议而不是类开始创建应用程序的功能。这不仅仅是因为人类有抗拒改变的倾向。学习一种全新的范式并将其付诸实践，说起来容易做起来难。在我编写新应用程序时，逐渐发现自己开始使用 POP 来设计和实现功能 — 有组织的且自然而然的。  

伴随着新潮流带来的刺激，很多人都在谈论用 POP *取代* OOP。我认为除非像 Swift 这样的 POP 语言被广泛改进，否则这是不可能发生的 — 也或许根本就不会发生。我是个实用主义者，而不是追求时髦的人。在开发新的 Swift 项目时，我发现自己的行为是一种折衷的方法。我在合理的地方利用 OOP，而用 POP 更合适的地方也不会死脑筋的一定要使用 OOP，这样反而了解到这两种模式**并不**相互排斥。我把这两种技术结合在一起。在本期由两部分组成的 POP 教程中，你将了解我在说什么。  

我投入到 OOP 中已经有很久了。1990 年，我买了一个零售版本的 Turbo Pascal。在使用了 OOP 大约一年后，我开始设计、开发和发布面向对象的应用程序产品。我成了一个忠粉。当我发现可以**扩展**和**增强**自己的类，简直兴奋的飞起。随着时间的推移，Microsoft 和 Apple 等公司开始开发基于 OOP 的大型代码库，如 Microsoft Foundation Classes（MFC）和 .NET，以及 iOS 和 OS X SDK。现在，开发人员在开发新应用程序时很少需要重新造轮子。没有完美的方法，OOP 也有一些缺点，但是优点仍然大于缺点。我们将花一些时间来比较 OOP 和 POP。  

## 理解协议
当开发人员设计一个新的 iOS 应用程序的基本结构时，他们几乎总是从 `Foundation` 和 `UIKit` 等框架中的现有 `类` 开始。我能想到的几乎所有应用程序都需要某种用户界面导航系统。用户需要一些进入应用程序的入口点和引导他们使用应用程序功能的路标。可以浏览一下你的 iPhone 或 iPad 上的应用程序。  

当这些应用程序打开时，你看到了什么？我打赌你看到的是 `UITableViewController`，`UICollectionViewController` 和 `UIPageViewController` 的子类。  

当你第一次创建新的 iOS 项目时，所有人都必须认识下面的代码片段，例如，一个新的 iOS 项目基于 Xcode 中的 `Single View App（单视图应用）` 模板：  

    
    ...
    import UIKit
    
    class ViewController: UIViewController
    {
    ...  

部分开发人员将在这里停下来，创建完全定制的接口，但大多数人将采取另一个步骤。  

当 iOS 开发者开发新的应用程序时，最常见的特征就是 OOP，那么 POP 在这里扮演什么角色呢？  

你知道我将怎样继续么？想象大多数开发人员的下一个主要步骤是什么。那就是**遵循协议**（并实现 [**委托，但我们已经讨论过了**](https://appcoda.com/swift-delegate/)）。  

让我给你们看一个例子使其便于理解。我相信你们很多人都用过 `UITableView`。虽然这不是一个关于 `UITableView` 的教程，但是你应该知道在 `UIViewController` 中将其实现时，协议扮演着重要的角色。在向 `UIViewController` 中添加 `UITableView`时，`UIViewController` 必须**遵循** `UITableViewDataSource` 和 `UITableViewDelegate` 协议，就像这样：  

    
    class ViewController: UIViewController, UITableViewDataSource, UITableViewDelegate  

简而言之，遵循 `UITableViewDataSource` 允许你用数据填充所有的 `UITableViewCell`，比如给用户提供导航的菜单项名称。采用 `UITableViewDelegate`，你可以对用户与 `UITableView` 的交互进行更细粒度的控制，比如在用户点击特定的 `UITableViewCell` 时执行适当的操作。  

### 定义
我发现，在进行技术性定义和讨论之前，理解常用的术语定义可以帮助读者更好地理解某个主题。首先，让我们 考虑 [**“协议”一词的通俗定义**](https://en.oxforddictionaries.com/definition/protocol)：  
> ……管理国家事务或外交领域的正式程序或规则体系。……  
> 在任何团体、组织或形势下，公认或已制定的程序或行为准则。……  
> 进行科学实验时的程序……

Apple 的“Swift 编程语言（Swift 4.0.3）” [文档中的声明](https://docs.swift.org/swift-book/LanguageGuide/Protocols.html#//apple_ref/doc/uid/TP40014097-CH25-ID267)：  

> 协议定义了适合特定任务或功能的方法、属性和其他需求的蓝图。然后，类、结构体或枚举可以遵循该协议来提供这些需求的实际实现。任何满足协议要求的类型都被称为遵循该协议。

协议是最重要的工具之一，我们必须给软件固有的混乱带来一些秩序。协议使我们能够要求一个或多个类和结构体包含特定的最小且必需的属性，和/或提供特定的最小且必需的实现/方法。通过 [**协议扩展**](https://docs.swift.org/swift-book/LanguageGuide/Protocols.html#//apple_ref/doc/uid/TP40014097-CH25-ID521)，我们可以为一些或所有协议的方法提供默认实现。  

### 遵循协议
下面，我们将使自定义的 `Person` 类**遵循**（**采用**）Apple 自带 [`Equatable`](https://developer.apple.com/documentation/swift/equatable) 协议。  

> 遵循 Equatable 协议以后可以使用等于运算符（==）来判断是否相等，使用不等于运算符（!=）来判断是否不等。Swift 标准库中的大部分基础类型都遵循了 Equatable 协议……  

    
    class Person : Equatable
    {
        var name:String
        var weight:Int
        var sex:String
        
        init(weight:Int, name:String, sex:String)
        {
            self.name = name
            self.weight = weight
            self.sex = sex
        }
        
        static func == (lhs: Person, rhs: Person) -> Bool
        {
            if lhs.weight == rhs.weight &&
                lhs.name == rhs.name &&
                lhs.sex == rhs.sex
            {
                return true
            }
            else
            {
                return false
            }
        }
    }

Apple [规定](https://docs.swift.org/swift-book/LanguageGuide/Protocols.html#//apple_ref/doc/uid/TP40014097-CH25-ID267)，“自定义类型声明它们采用特定的协议，需要将协议的名称放在类型名称之后，以冒号分隔，作为其定义的一部分。”这也正是我所做的：  

    
    class Person : Equatable

你可以将协议理解为专门针对 `class`、`struct` 或 `enum` 的**约定**或**承诺**。我通过 `Equatable` 协议使自定义的 `Person` 类遵守了一个约定，`Person` 类***承诺***通过现实 `Equatable` 协议需要的方法或成员变量来履行该约定，即将其实现。  

`Equatable` 协议***并没有实现任何东西***。它只是指明了***采用（遵循）*** `Equatable` 协议的 `class`，`struct`，或者 `enum` ***必须实现***的方法和/或成员变量。有一些协议通过 `extensions` 实现了功能，稍后我们会进行讨论。我不会花太多时间来讲述关于 `enum` 的 POP 用法。我将它作为练习留给你。  

### 定义协议
理解协议最好的方式是通过例子。我将自己构建一个 `Equatable` 来向你展示协议的用法：  

    
    protocol IsEqual
    {
        static func == (lhs: Self, rhs: Self) -> Bool
        
        static func != (lhs: Self, rhs: Self) -> Bool
    }
请记住，我的“IsEqual”协议并没有对 `==` 和 `!=` 运算符进行实现。“IsEqual”需要协议的遵循者***实现他们自己的*** `==` 和 `!=` 运算符。  

所有定义协议属性和方法的规则都在 [**Apple 的 Swift 文档**](https://docs.swift.org/swift-book/LanguageGuide/Protocols.html#//apple_ref/doc/uid/TP40014097-CH25-ID267) 中进行了总结。比如，在协议中定义属性永远不要用 `let` 关键字。只读属性规定使用 `var` 关键字，并在后面单独跟上 `{ get }`。如果有一个方法改变了一个或多个属性，你需要标记它为 `mutating`。你需要知道为什么我重写的 `==` 和 `!=` 操作符被定义为 `static`。如果你不知道，找出原因将会是一个很好的练习。  

为了向你展示我的 `IsEqual`（或者 `Equatable`）这样的协议具有广泛的适用性，我们将使用它在下面构建一个类。但是在我们开始之前，让我们先讨论一下“引用类型”与“值类型”。  

## 引用类型与值类型
在继续之前，您应该阅读 Apple 关于 [**“值和引用类型”**](https://developer.apple.com/swift/blog/?id=10) 的文章。它将让你思考引用*类型*和值*类型*。我**故意**不在这里讲太多细节，因为我想让你们思考并理解这个非常重要的概念。它太过重要，以至于针对 POP **和** 引用/值类型的讨论**同时**出现在这些地方：  

1. WWDC 2015 展示的 [**“Protocol-Oriented Programming in Swift”**](https://developer.apple.com/videos/play/wwdc2015/408/?time=2558)  
2. WWDC 2015 展示的 [**“Building Better Apps with Value Types in Swift”**](https://developer.apple.com/videos/play/wwdc2015-414/?time=48)  
3. WWDC 2016 展示的 [**“Protocol and Value Oriented Programming in UIKit Apps”**](https://developer.apple.com/videos/play/wwdc2016-419/?time=340)  

我会给你一个提示和作业……假设你有多个指向同一个类实例的引用，用于修改或“改变”属性。这些引用指向相同的数据块，因此将其称为“共享”数据并不夸张。在某些情况下，共享数据可能会导致问题，如下面的示例所示。这是否表示我们要将所有的代码改成值类型？**并不是！**就像 Apple 的一个工程师指出：[**“例如，以 Window 为例。复制一个 Window 是什么意思？”**](https://developer.apple.com/videos/play/wwdc2015-408/?time=2566) 查看下面的代码，并思考这个问题。

### 引用类型

下面的代码片段来自 Xcode playground，在创建对象副本然后更改属性时，会遇到一个有趣的难题。你能找到问题么？我们将在下一篇文章中讨论这个问题。  

这段代码同时也演示了协议的定义和 `extension`。

    
    // 引用类型：每个人都使用类很长时间了 
    // -- 想想 COCOA 中进行的所有隐式复制。
    
    protocol ObjectThatFlies
    {
        var flightTerminology: String { get }
        func fly() // 不需要提供实现，除非我想
    }
    
    extension ObjectThatFlies
    {
        func fly() -> Void
        {
            let myType = String(describing: type(of: self))
            let flightTerminologyForType = myType + " " + flightTerminology + "\n"
            print(flightTerminologyForType)
        }
    }
    
    class Bird : ObjectThatFlies
    {
        var flightTerminology: String = "flies WITH feathers, and flaps wings differently than bats"
    }
    
    class Bat : ObjectThatFlies
    {
        var flightTerminology: String = "flies WITHOUT feathers, and flaps wings differently than birds"
    }
    
    // 引用类型
    
    let bat = Bat()
    bat.fly()
    // "Bat flies WITHOUT feathers, and flaps wings differently than birds"
    
    let bird = Bird()
    bird.fly()
    // "Bird flies WITH feathers, and flaps wings differently than bats"
    
    var batCopy = bat
    batCopy.fly()
    // "Bird flies WITH feathers, and flaps wings differently than bats"
    
    batCopy.flightTerminology = ""
    batCopy.fly()
    // 控制台输出 "Bat"
    
    bat.fly()
    // 控制台输出 "Bat"

***来自前面代码片段的控制台输出***  

    Bat flies WITHOUT feathers, and flaps wings differently than birds
    
    Bird flies WITH feathers, and flaps wings differently than bats
    
    Bird flies WITH feathers, and flaps wings differently than bats
    
    Bat
    
    Bat

### 值类型  

在接下来的 Swift 代码片段中，我们使用 `struct` 替代 `class`。在这里，代码看起来更安全，而 Apple 似乎在推广值类型和 POP。注意，[**他们目前还没有放弃 `class`**](https://developer.apple.com/videos/play/wwdc2015/408/?time=2677)。  

    
    // 这是范式转变的起点，不仅仅是协议，还有值类型
    
    protocol ObjectThatFlies
    {
        var flightTerminology: String { get }
        func fly() // 不需要提供实现，除非我想
    }
    
    extension ObjectThatFlies
    {
        func fly() -> Void
        {
            let myType = String(describing: type(of: self))
            let flightTerminologyForType = myType + " " + flightTerminology + "\n"
            print(flightTerminologyForType)
        }
    }
    
    struct Bird : ObjectThatFlies
    {
        var flightTerminology: String = "flies WITH feathers, and flaps wings differently than bats"
    }
    
    struct Bat : ObjectThatFlies
    {
        var flightTerminology: String = "flies WITHOUT feathers, and flaps wings differently than birds"
    }
    
    // 值类型
    
    let bat = Bat()
    bat.fly()
    // "Bat flies WITHOUT feathers, and flaps wings differently than birds"
    
    let bird = Bird()
    bird.fly()
    // "Bird flies WITH feathers, and flaps wings differently than bats"
    
    var batCopy = bat
    batCopy.fly()
    // "Bird flies WITH feathers, and flaps wings differently than bats"
    
    // 我在这里对 Bat 实例所做的事情是显而易见的
    batCopy.flightTerminology = ""
    batCopy.fly()
    // 控制台输出 "Bat"
    
    // 但是，因为我们使用的是值类型，所以 Bat 实例的原始数据并没有因为之前的操作而被篡改。
    bat.fly()
    // "Bat flies WITHOUT feathers, and flaps wings differently than birds"

***来自前面代码片段的控制台输出***  

    Bat flies WITHOUT feathers, and flaps wings differently than birds
    
    Bird flies WITH feathers, and flaps wings differently than bats
    
    Bat flies WITHOUT feathers, and flaps wings differently than birds
    
    Bat 
    
    Bat flies WITHOUT feathers, and flaps wings differently than birds

## 示例代码

我写了一些面向协议的代码。请通读代码，阅读内联注释，阅读附带的文章，跟随我的超链接，并充分理解我在做什么。你将在下一篇关于 POP 的文章中用到它。  

### 采用多种协议

刚开始写这篇文章的时候，我很贪心，想要自定义一个协议，使它能***同时***体现 Apple 的内置协议 `Equatable` 和 `Comparable`：  

    
    protocol IsEqualAndComparable
    {
    
        static func == (lhs: Self, rhs: Self) -> Bool
    
        static func != (lhs: Self, rhs: Self) -> Bool
        
        static func > (lhs: Self, rhs: Self) -> Bool
        
        static func < (lhs: Self, rhs: Self) -> Bool
        
        static func >= (lhs: Self, rhs: Self) -> Bool
        
        static func <= (lhs: Self, rhs: Self) -> Bool
    
    }

我意识到应该将它们分开，使我的代码尽可能灵活。为什么不呢？Apple 声明同一个类，结构体，枚举可以遵循多个协议，就像接下来我们将看到的一样。下面是我提出的两个协议：  

    
    protocol IsEqual
    {
        static func == (lhs: Self, rhs: Self) -> Bool
        
        static func != (lhs: Self, rhs: Self) -> Bool
    }
    
    protocol Comparable
    {
        static func > (lhs: Self, rhs: Self) -> Bool
        
        static func < (lhs: Self, rhs: Self) -> Bool
        
        static func >= (lhs: Self, rhs: Self) -> Bool
        
        static func <= (lhs: Self, rhs: Self) -> Bool
    }

### 记住你的算法

你需要磨练的一项重要技能是编程的算法，并将它们转换为代码。我保证在将来的某一天，会有人给你一个复杂过程的口头描述并要求你对它进行编码。用人类语言描述某些步骤，之后用软件将其实现，它们之间一般都会有很大的差距。当我想要将 `IsEqual` 和 `Comparable` 应用于表示直线（向量）的类时，我意识到了这一点。我记得计算一个直线的长度是基于勾股定理的（参考 [**这里**](https://orion.math.iastate.edu/dept/links/formulas/form2.pdf)和 [**这里**](https://www.mathwarehouse.com/algebra/distance_formula/index.php)），并且对向量使用 `==`，`!=`，`<`，`>`，`<=`，和 `>=` 这些运算符进行比较时，直线的长度是必须的。我的 `Line` 类迟早会派上用场，例如，在一个绘图应用程序或游戏中，用户点击屏幕上的两个位置，在两点之间创建一条线。

### 自定义类采用多个协议

这是我的 `Line` 类，它采用了两个协议，`IsEqual` 和 `Comparable`（如下）。这是多继承的一种形式！  

    
    class Line : IsEqual, Comparable
    {
        var beginPoint:CGPoint
        var endPoint:CGPoint
        
        init()
        {
            beginPoint = CGPoint(x: 0, y: 0);
            endPoint = CGPoint(x: 0, y: 0);
        }
    
        init(beginPoint:CGPoint, endPoint:CGPoint)
        {
            self.beginPoint = CGPoint( x: beginPoint.x, y: beginPoint.y )
            self.endPoint = CGPoint( x: endPoint.x, y: endPoint.y )
        }
        
        // 线长的计算基于勾股定理。
        func length () -> CGFloat
        {
            let length = sqrt( pow(endPoint.x - beginPoint.x, 2) + pow(endPoint.y - beginPoint.y, 2) )
            return length
        }
    
        static func == (leftHandSideLine: Line, rightHandSideLine: Line) -> Bool
        {
            return (leftHandSideLine.length() == rightHandSideLine.length())
        }
    
        static func != (leftHandSideLine: Line, rightHandSideLine: Line) -> Bool
        {
            return (leftHandSideLine.length() != rightHandSideLine.length())
        }
        
        static func > (leftHandSideLine: Line, rightHandSideLine: Line) -> Bool
        {
            return (leftHandSideLine.length() > rightHandSideLine.length())
        }
        
        static func < (leftHandSideLine: Line, rightHandSideLine: Line) -> Bool
        {
            return (leftHandSideLine.length() < rightHandSideLine.length())
        }
        
        static func >= (leftHandSideLine: Line, rightHandSideLine: Line) -> Bool
        {
            return (leftHandSideLine.length() >= rightHandSideLine.length())
        }
        
        static func <= (leftHandSideLine: Line, rightHandSideLine: Line) -> Bool
        {
            return (leftHandSideLine.length() <= rightHandSideLine.length())
        }
    
    } // 类的结束行：IsEqual, Comparable

### 验证你的算法
我使用电子制表软件 Apple Numbers，并准备了两个向量的可视化表示，对 `Line` 类的 `length()` 方法做了一些基本测试：  

![](https://www.appcoda.com/wp-content/uploads/2018/03/swift-pop-1.png)  

这里是我根据上面图表中的点，写的测试代码：  

    
    let x1 = CGPoint(x: 0, y: 0)
    let y1 = CGPoint(x: 2, y: 2)
    let line1 = Line(beginPoint: x1, endPoint: y1)
    line1.length()
    // returns 2.82842712474619
    
    let x2 = CGPoint(x: 3, y: 2)
    let y2 = CGPoint(x: 5, y: 4)
    let line2 = Line(beginPoint: x2, endPoint: y2)
    line2.length()
    // returns 2.82842712474619
    
    line1 == line2
    // returns true
    line1 != line2
    // returns false
    line1 > line2
    // returns false
    line1 <= line2
    // returns true

### 使用 Xcode “Single View” playground 模版测试/原型化 UI

你是否知道可以使用 Xcode 9 `Single View` playground 模板来原型化和测试用户界面（UI）？它非常棒 - 可以节省大量时间并快速原型化的工具。为了更好的测试我的 `Line` 类，我创建了这样一个 playground。**作业：在我解释之前，我想让你自己试一下。**我**将**向你展示我的 playground 代码、模拟器输出和我的 Swift 测试语句。  

这里是我的 playground 代码：  

    
    import UIKit
    import PlaygroundSupport
    
    class LineDrawingView: UIView
    {
        override func draw(_ rect: CGRect)
        {
            let currGraphicsContext = UIGraphicsGetCurrentContext()
            currGraphicsContext?.setLineWidth(2.0)
            currGraphicsContext?.setStrokeColor(UIColor.blue.cgColor)
            currGraphicsContext?.move(to: CGPoint(x: 40, y: 400))
            currGraphicsContext?.addLine(to: CGPoint(x: 320, y: 40))
            currGraphicsContext?.strokePath()
            
            currGraphicsContext?.setLineWidth(4.0)
            currGraphicsContext?.setStrokeColor(UIColor.red.cgColor)
            currGraphicsContext?.move(to: CGPoint(x: 40, y: 400))
            currGraphicsContext?.addLine(to: CGPoint(x: 320, y: 60))
            currGraphicsContext?.strokePath()
            
            currGraphicsContext?.setLineWidth(6.0)
            currGraphicsContext?.setStrokeColor(UIColor.green.cgColor)
            currGraphicsContext?.move(to: CGPoint(x: 40, y: 400))
            currGraphicsContext?.addLine(to: CGPoint(x: 250, y: 80))
            currGraphicsContext?.strokePath()
        }
    }
    
    class MyViewController : UIViewController
    {
        override func loadView()
        {
            let view = LineDrawingView()
            view.backgroundColor = .white
    
            self.view = view
        }
    }
    
    // 在实时视图窗口中显示视图控制器
    PlaygroundPage.current.liveView = MyViewController()

这是我在 playground 模拟器上的视图输出：  

![](https://www.appcoda.com/wp-content/uploads/2018/03/swift-pop-2.png)  

下面是测试我的 `Line` 类型实例与我在 playground 上所画向量匹配的 Swift 代码：  

    
    let xxBlue = CGPoint(x: 40, y: 400)
    let yyBlue = CGPoint(x: 320, y: 40)
    let lineBlue = Line(beginPoint: xxBlue, endPoint: yyBlue)
    
    let xxRed = CGPoint(x: 40, y: 400)
    let yyRed = CGPoint(x: 320, y: 60)
    let lineRed = Line(beginPoint: xxRed, endPoint: yyRed)
    lineRed.length()
    // returns 440.454310910905
    
    lineBlue != lineRed
    // returns true
    lineBlue > lineRed
    // returns true
    lineBlue >= lineRed
    // returns true
    
    let xxGreen = CGPoint(x: 40, y: 400)
    let yyGreen = CGPoint(x: 250, y: 80)
    let lineGreen = Line(beginPoint: xxGreen, endPoint: yyGreen)
    lineGreen.length()
    // returns 382.753184180093
    lineGreen < lineBlue
    // returns true
    lineGreen <= lineRed
    // returns true
    lineGreen > lineBlue
    // returns false
    lineGreen >= lineBlue
    // returns false
    lineGreen == lineGreen
    // returns true

## 总结

我希望你喜欢今天的文章，并且非常期待阅读本文的“第二部分”。记住，我们将深入研究使用 POP 的先进应用程序，范型协议，从引用类型到值类型背后的动机，列举 POP 的优缺点，列举 OOP 的优缺点，比较 OOP 和 POP，确定为什么“Swift 是面向协议的”，并深入研究称为“局部推理”的概念。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。