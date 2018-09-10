# Swift 中的设计模式 \#1 工厂方法与单例方法

title: "Design Patterns in Swift \#1: Factory Method and Singleton"
date: 
tags: [Design Patterns]
categories: [Swift]
permalink: design-pattern-creational

---
原文链接=https://www.appcoda.com/design-pattern-creational/
作者=Andrew Jaffee
原文日期=2018-07-24
译者=BigLuo
校对=colourful987,numbbbbb
定稿=Forelax

“Gang of Four” (“GoF”) Erich Gamma，Richard Helm，Ralph Johonson，和 John Vlissides 在他们“[设计模式：面向对象软件设计复用的基本原理](https://smile.amazon.com/Design-Patterns-Object-Oriented-Addison-Wesley-Professional-ebook/dp/B000SEIBB8/)” 的重要著作里整理了大概 23 种经典的设计模式 。本文会介绍 GoF 总结的两种创建型（creational）模式：*工厂方法*和*单例方法*。

软件开发一直在努力地模拟真实世界的场景，希望通过创建工具的方式来加强人类的场景体验。财富管理工具，例如：像亚马逊或者 eBay 这样的银行 App 和购物辅助工具，相比十年前确实给消费者带来了更大的生活便利。回顾我们的发展路程。当应用变的更加强大易用时，应用的开发也已变的[**更加复杂**](http://iosbrain.com/blog/2018/04/29/controlling-chaos-why-you-should-care-about-adding-error-checking-to-your-ios-apps/#chaos)。

所以开发者也开创出了一系列最佳实践。一些很流行的名字，像[**面向对象编程**](http://iosbrain.com/blog/2017/02/26/intro-to-object-oriented-principles-in-swift-3-via-a-message-box-class-hierarchy/)，[**面向协议编程**](https://www.appcoda.com/pop-vs-oop/)，[**值语义 （value semantics）**](http://iosbrain.com/blog/2018/03/28/protocol-oriented-programming-in-swift-is-it-better-than-object-oriented-programming/#value_semantics)，[**局部推断 （local reasoning）**](http://iosbrain.com/blog/2018/03/28/protocol-oriented-programming-in-swift-is-it-better-than-object-oriented-programming/#local_reasoning)将大块代码分解成具有良好接口定义的小段代码（比如使用 [**Swift 的扩展**](http://iosbrain.com/blog/2017/01/28/swift-extensions-managing-complexity-improving-readability-extensibility-protocols-delegates-uicollectionview/)），以及 [**语法糖**](http://iosbrain.com/blog/2018/01/27/writing-expressive-meaningful-and-readable-code-in-swift-4/)。还有我没提及，但却是最重要的、值得重视的实践之一，设计模式的使用。

## 设计模式

设计模式是开发者管理软件复杂性的重要工具。作为常见的模板技术，它很好地对软件中类似的、复现的、容易识别的问题进行了概念化抽象。将它当作一个最佳实践应用到你日常会遇到的那些编程场景中，例如，在不了解类簇实现细节的情况下创建一个类簇相关的对象。设计模式主要是用于经常发生的那些问题场景中。它们频繁被使用是因为这些问题很普遍，让我用一个具体的例子来帮助你们理解吧。

设计模式讨论的并不是某些具体的问题，比如”如何迭代包含 11 个整数（Int）的 Swift 数组“。针对这类问题，GoF 定义了迭代器模式（Iterator Pattern），这是一个通用的模式，描述如何在不确定数据类型的情况下遍历一个数据列表。设计模式不是语言编码。它是用于解决相同软件场景问题的一套实用的指导规则。

还记得吗，之前我在 AppCoda 介绍过 [“Model-View-ViewModel” or “MVVM”](https://www.appcoda.com/mvvm-vs-mvc/) 与非常著名的 [“Model-View-Controller” or “MVC”](https://www.appcoda.com/mvvm-vs-mvc/) 设计模式，这两个模式深受 Apple 和 iOS 开发者喜爱。

这两种模式一般用在*整个应用*中。MVVM 和 MVC 是*架构（architectural）*设计模式，用于将 UI 从应用数据代码和展示逻辑中分离出来（如：MVC），以及将应用的数据从核心数据流程或者业务逻辑中分离（如：MVVM）。 而 GoF 设计模式本质上更具体，旨在解决基于程序代码中的具体问题。在一个应用里面你也许会用到 3 种、7 种或者 12 种 GoF 设计模式。除了*迭代器*例子，代理模式也是设计模式中另一个很好的例子， 尽管它在 GoF 列出的 23 种设计模式中并未被具体介绍。

当 GoF 的这本书作为大量开发者的圣经而存在时，也不乏有它的诋毁者，我们在文章的结尾处讨论这个话题。

## 设计模式的类别

GoF 将 23 种设计模式整理分为 3 类，“创建型”、“结构型”和“行为型”。本教程讨论创建型模式类别中的两种（工厂模式与单例）。如同实例对象和类的实现，模式的作用是让复杂对象的创建变得简单、易于理解、易于维护，隐藏细节。

**隐藏复杂度（封装）**是聪明的程序员最主要的目标之一。例如，面向对象（OOP）类能提供非常复杂的，强大且成熟的函数而不需要知道任何关于类内部间的工作方式。在创建型模式中，开发者甚至不需要知道类的属性和方法，但如果需要，程序员可以看到其接口 - 在 Swift 中的协议中 - 或对那些感兴趣的类进行扩展。你会在我的第一个“工厂方法”的例子中明白我的意思。

## 工厂方法设计模式

如果你已经探索过 GoF 设计模式或在 OOP 的世界里花费了很多时间，你大概至少听说过“抽象工厂”、“工厂”，或者“工厂方法”模式。“确切”的命名可能有很多争议，不过下面我要介绍的这个例子最接近的命名是工厂模式。

在这个范例中，你通过工厂方法创建对象，而*不需要*知道类的构造器和关于类和类层次结构的任何信息。这带来了很大的方便。可以用少量的代码创建 UI 和它的相关功能。我的工厂方法项目案例，在 [**GitHub**](https://github.com/appcoda/FactoryMethodInSwift) 可下载，展示了在复杂类层次结构中，如何轻松的使用对象。
![](https://www.appcoda.com/wp-content/uploads/2018/07/Factory_Method.gif)

大多数成功的应用都有风格一致的主题 。为保证应用主题风格统一，假设应用中所有的 shapes 有着相同的颜色和尺寸，这样就可以和主题保持一致——也就是塑造品牌。这些图形用在自定义按钮上，或者作为登录流程的界面背景图都是不错的。

假设设计团队同意使用我的代码作为应用的主题背景图片。下面来看看我的具体代码，包括协议、类结构和（UI 开发人员不需要关心的）工厂方法。

 `ShapeFactory.swift` 文件是一个用于在视图控制器内绘制形状的协议。因为可用于各种目的，所以它的访问级别是 public：

```swift
// 这些值被图形设计团队预先选定
let defaultHeight = 200
let defaultColor = UIColor.blue
 
protocol HelperViewFactoryProtocol {
    
    func configure()
    func position()
    func display()
    var height: Int { get }
    var view: UIView { get }
    var parentView: UIView { get }
    
}
```
还记得吗？ `UIView` 类有一个默认的矩形属性 `frame`  ，所以我可以轻松的创建出形状基类 `Square`: 

```swift
fileprivate class Square: HelperViewFactoryProtocol {
    
    let height: Int
    let parentView: UIView
    var view: UIView
    
    init(height: Int = defaultHeight, parentView: UIView) {
        
        self.height = height
        self.parentView = parentView
        view = UIView()
        
    }
    
    func configure() {
        
        let frame = CGRect(x: 0, y: 0, width: height, height: height)
        view.frame = frame
        view.backgroundColor = defaultColor
        
    }
    
    func position() {
        
        view.center = parentView.center
        
    }
 
    func display() {
        
        configure()
        position()
        parentView.addSubview(view)
        
    }
    
} 
```
注意到我根据 OOP 的设计思想来构建复用代码，这样能让 shape 层级更加简化和可维护。`Circle` 和 `Rectangle` 类是 `Square` 类的特化 （另外你可以看到，从正方形出发绘制圆形是多么简单。）
```swift
fileprivate class Circle : Square {
    
    override func configure() {
        
        super.configure()
        
        view.layer.cornerRadius = view.frame.width / 2
        view.layer.masksToBounds = true
        
    }
    
} 
 
fileprivate class Rectangle : Square {
    
    override func configure() {
        
        let frame = CGRect(x: 0, y: 0, width: height + height/2, height: height)
        view.frame = frame
        view.backgroundColor = UIColor.blue
        
    }
    
} 
```
我使用 `fileprivate` 来强调工厂方法模式背后的一个目的：*封装*。你可以看到不用改变下面工厂方法的前提下，对 `shape` 类的层级结构进行修改和扩展是很容易的。这是工厂方法的代码，它们让对象的创建如此简单且抽象。
```swift
enum Shapes {
    
    case square
    case circle
    case rectangle
    
}

class ShapeFactory {
    
    let parentView: UIView
    
    init(parentView: UIView) {
        
        self.parentView = parentView
        
    }
    
    func create(as shape: Shapes) -> HelperViewFactoryProtocol {
        
        switch shape {
            
        case .square:
            
            let square = Square(parentView: parentView)
            return square
            
        case .circle:
            
            let circle = Circle(parentView: parentView)
            return circle
            
        case .rectangle:
            
            let rectangle = Rectangle(parentView: parentView)
            return rectangle
            
        }
        
    } 
    
} 

// 公共的工厂方法来展示形状
func createShape(_ shape: Shapes, on view: UIView) {
    
    let shapeFactory = ShapeFactory(parentView: view)
    shapeFactory.create(as: shape).display()
    
}

// 选择公共的工厂方法来展示形状
// 严格来说，工厂方法应该返回相关类中的一个。
func getShape(_ shape: Shapes, on view: UIView) -> HelperViewFactoryProtocol {
    
    let shapeFactory = ShapeFactory(parentView: view)
    return shapeFactory.create(as: shape)
    
}
```
注意到：我已经写下一个类工厂和两个工厂方法来让你思考。严格说，一个工厂方法应该返回对应类的对象，这些类有着共同的基类或者协议。我的目的是在视图上绘制一个形状，所以我更倾心使用 `createShape(_:view:)` 这个方法。提供这种可选方式（该方法），在需要时可用于试验和探索新的可能性。

最后，我展示了两个工厂方法绘制形状的使用方式。UI 开发者不用知道形状类是如何被编码出来的。尤其是他/她不必为形状类如何被初始化而担忧。`ViewController.swift` 文件中的代码很容易阅读。

```swift
import UIKit
 
class ViewController: UIViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        //在加载视图后进行添加设置，一般是从nib
        
    }
 
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // 废弃掉那些可以被重新创建的资源
    }
 
    @IBAction func drawCircle(_ sender: Any) {
        
	// 仅仅用于绘制形状
        createShape(.circle, on: view)
        
    }
    
    @IBAction func drawSquare(_ sender: Any) {

	// 绘制图形
        createShape(.square, on: view)
        
    }
    
    @IBAction func drawRectangle(_ sender: Any) {

	// 从工厂获取一个对象并使用它来绘制一个形状
        let rectangle = getShape(.rectangle, on: view)
        rectangle.display()
        
    }
    
} 
```
## 单例设计模式

大部分 iOS 开发者熟悉单例模式。回想一下 `UNUserNotificationCenter.current()`，`UIApplication.shared` 或 `FileManager.default` 如果你想要发送通知，或者在 Safari 里面打开一个 URL，或者操作 iOS 文件，你必须分别使用它们各自的单例。单例可以很好的用于保护共享资源，提供有且仅有一个对象实例进入一些系统，并且支持对象执行一些应用级类型的协作。正如我们将要看到的，单例也可以用来封装 iOS 内建的其它单例，添加一些值操作功能。

作为一个单例，我们需要确保这个类：

* 声明和初始化一个 static 的类的常量属性，然后命名那个属性为 `shared` 来表明这个类的实例是一个单例（默认是共有的）；
* 为我们想要控制和保护的一些资源声明一个*私有的*属性。且只能通过 `shared` 共享；
* 声明一个私有初始化方法，只有我们的单例类能够初始化它，在 `init` 的内部，初始化我们想要用于控制的共享资源；

通过定义一个 `shared` 静态常量来创建一个类的 `private` 初始化方法。我们要确保这个类只有一个实例，该类只能初始化一次，并且共享的实例在应用的任何地方都能获取。就这样我们创建了一个*单例*！

这个单例项目的代码，在 [**GitHub**](https://github.com/appcoda/SingletonInSwift) 可下载，展示了一个开发者如何安全的、高效的存储用户的偏好。这是个简单的 Demo，该 Demo 能够记录用户的密码文本，偏好设置可设置为可见或隐藏。不过事后发现，这个功能并不是个好想法，我只是需要一个例子来向你展示我代码的工作机制。这段代码*完全是*出于教学的目的。我建议你**永远不要**让你的密码暴露。你可以看到用户可以设置他们的的密码偏好 — 且密码偏好被存储在 `UserDefaults`:

![](https://www.appcoda.com/wp-content/uploads/2018/07/Show_Pwd.gif)

当用户关闭应用并且再次打开后，注意到他/她的密码偏好被记录了：

![](https://www.appcoda.com/wp-content/uploads/2018/07/Remember_Pwd_Setting.gif)

让我向你展示 `PreferencesSingleton.swift` 文件中的代码片段，在行内注释里，你将会看到我想准确表达的意思。

```swift
class UserPreferences {

	// 用类的初始化方法创建一个静态的，常量实例。
    static let shared = UserPreferences()
    
	// 这是一个私有的，收我们保护的资源共享的。
    private let userPreferences: UserDefaults
    
	// 一个私有的初始化方法只能被类本身调用。
    private init() {
        
	// 获取 iOS 共享单例。我们在这里包装了它。
        userPreferences = UserDefaults.standard
        
    }
 
} // end class UserPreferences
```
应用启动的时候需要初始化静态属性，但是全局变量默认是懒加载。你可能会担心上面这段代码在执行的时候出错，不过就我对 Swift 的了解来说，这段代码完全没问题。

你也许会问，“为什么要通过包装另一个`UserDefaults` 单例的方式来创建一个单例？” 首先，我主要目的是要向你展示在 Swift 中创建和使用单例的最佳做法。 用户偏好是一个资源类型，应该有一个单一的入口。所以在这个例子中，很明显我们应该使用 `UserDefaults`。其次，想一下你曾多少次看到在应用中 `UserDefaults` 被滥用。

在一些项目应用代码中，我看到 `UserDefaults`(或者之前的 `NSUserDefaults`)的使用缺乏条理和原由。用户偏好属性对应的每个键都是字符串引用。刚才，我在代码中发现了一个 bug。我把“switch”拼写成了“swithc”，由于我对代码进行了复制和粘贴，在发现问题前，我已经创建了不少“swithc”的实例。 如果其他开发者在这个应用开始或者继续使用“switch”作为一个键来存储对应的值呢？应用的当前状态是无法被正确保存的。 我们经常使用 `UserDefaults` 的 strings 以键值映射的方式保存应用的状态。这是一个好的写法。这可以让值的意思清晰明确、简单易懂，还便于记忆。但也不是说通过 strings 来描述是没有任何风险的。

在我讨论的“swithc”与“switch”中。大多数人可能已经明白了被称为“stringly-typed”的那些代码, 用 strings 作为唯一的标识符会产生细微的不同，最终会因为拼写错误带来灾难性的错误。Swift 编译器不能帮助我们避免“stringly-typed”这类的错误。

解决“stringly-typed”错误的方式在于把 Swift `enum` 设置成 string 类型。这么做不仅可以让我们标准化字符串的使用，而且可让我们对其进行分类管理。让我们再次回到 `PreferencesSingleton.swift`:
```swift
class UserPreferences {
    
    enum Preferences {
        
        enum UserCredentials: String {
            case passwordVisibile
            case password
            case username
        }
        
        enum AppState: String {
            case appFirstRun
            case dateLastRun
            case currentVersion
        }
 
    } // end enum Preferences
```
我们从单例模式的定义开始，向你介绍清楚在我的应用中，为什么使用一个单例来封装 `UserDefaults`。我们可以通过添加值的方式来增添新的功能，但通过简单的对 `UserDefaults` 的包装却能增强代码的健壮性。在获取和设置用户偏好时，你脑中应该要马上想到进行错误校验。在这里，我想实现一个关于用户偏好的功能，设置密码的可见性。看到下面的代码。内容都在 `PreferencesSingleton.swift` 文件：

```swift
import Foundation
 
class UserPreferences {
    
    enum Preferences {
        
        enum UserCredentials: String {
            case passwordVisibile
            case password
            case username
        }
        
        enum AppState: String {
            case appFirstRun
            case dateLastRun
            case currentVersion
        }
 
    } // end enum Preferences
    	
    // 创建一个静态、常量实例并初始化
    static let shared = UserPreferences()
    
    // 这是一个私有的，被保护的共享资源
    private let userPreferences: UserDefaults
    
    // 只有类本身能调用的一个私有初始化方法
    private init() {
        // 获取 iOS 共享单例。我们在这里包装它
        userPreferences = UserDefaults.standard
 
    }
    
    func setBooleanForKey(_ boolean:Bool, key:String) {
        
        if key != "" {
            userPreferences.set(boolean, forKey: key)
        }
        
    }
    
    func getBooleanForKey(_ key:String) -> Bool {
        
        if let isBooleanValue = userPreferences.value(forKey: key) as! Bool? {
            print("Key \(key) is \(isBooleanValue)")
            return true
        }
        else {
            print("Key \(key) is false")
            return false
        }
        
    }
    
    func isPasswordVisible() -> Bool {
        
        let isVisible = userPreferences.bool(forKey: Preferences.UserCredentials.passwordVisibile.rawValue)
        
        if isVisible {
            return true
        }
        else {
            return false
        }
        
    }
```
来到 `ViewController.swift` 文件，你将看到，访问并使用结构良好的单例是多么的容易：
```swift
import UIKit
 
class ViewController: UIViewController {
    
    @IBOutlet weak var passwordTextField: UITextField!
    @IBOutlet weak var passwordVisibleSwitch: UISwitch!
    
    override func viewDidLoad() {
        super.viewDidLoad()
	// 在加载视图后（一般通过 nib 来进行）进行其它的额外设置。
        
        if UserPreferences.shared.isPasswordVisible() {
            passwordVisibleSwitch.isOn = true
            passwordTextField.isSecureTextEntry = false
        }
        else {
            passwordVisibleSwitch.isOn = false
            passwordTextField.isSecureTextEntry = true
        }
        
    } 
 
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
	// 可以销毁那些能被重新创建的资源
    }
    
    @IBAction func passwordVisibleSwitched(_ sender: Any) {
        
        let pwdSwitch:UISwitch = sender as! UISwitch
        
        if pwdSwitch.isOn {
            passwordTextField.isSecureTextEntry = false
            UserPreferences.shared.setPasswordVisibity(true)
        }
        else {
            passwordTextField.isSecureTextEntry = true
            UserPreferences.shared.setPasswordVisibity(false)
        }
        
    } 
```

## 结论

有些评论家声称设计模式在一些编程语言中的使用缺乏证明，相同的设计模式在代码中反复出现是很槽糕的一件事情。我并不同意这个说法。期望一个编程语言对*每件事情*的处理都有其对应的特性是很愚蠢的。这很可能会导致一个臃肿的语言，像 C++ 一样正在变得更大、更复杂，以致很难被学习、使用与维护。认识并解决反复出现的问题是人的一种积极性格并且这确实值得我们强化。有一些事情，人们尝试却失败了很多次，通过学习总结前人经验，对一些相同的问题进行抽象和标准化，让这些好的解决方案散播出去的方面，设计模式成为了一个成功案例。

像 Swift 这样的简单紧凑的语言和设计模式这样一系列最佳实践的组合是一个理想中的、令人开心的方法。风格统一的代码一般来说都具有较好的可读性和易维护性。不过也要记住，在数以百万的开发者不断地讨论和分享下，设计模式也在不断的发展变化，这些美好事物被万维网联系在一起，这种开发人员的讨论持续的引领着集体智慧的自我调节。
