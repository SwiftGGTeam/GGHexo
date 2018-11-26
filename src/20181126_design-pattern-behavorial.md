title: "Swift 设计模式 #2： 观察者模式与备忘录模式"
date:2018-11-26
tags: [Design Patterns]
categories:[Swift]
permalink: design-pattern-behavorial

---

原文链接=https://www.appcoda.com/design-pattern-behavorial/
作者=Andrew Jaffee
原文日期=2018-08-06
译者=jojotov
校对=Forelax,pmst
定稿=Forelax

<!--此处开始正文-->

本次教程是 AppCoda [上周开启](https://www.appcoda.com/design-pattern-creational/) 的设计模式系列的第二期。在软件设计领域的四位大师级人物（GoF，又称“四人帮”或“Gang of Four”） —— Erich Gamma, Richard Helm, Ralph Johnson 和 John Vlissides 所著的 《设计模式：可复用面向对象软件的基础》一书中，首次对软件设计中总共 23 种设计模式进行了定义和归类，并对它们作了专业阐述。今天，我们将聚焦于其中两个行为型设计模式 —— “观察者模式” 和 “备忘录模式”。

<!--more-->

软件开发领域致力于对真实世界的场景进行建模，并期望能创造出一系列工具来提高人类对这些场景的理解与体验。与 10 年前相比，一些类似银行应用和辅助购物应用（如亚马逊或 eBay 的 iOS 客户端应用）的财务类工具的出现，无疑让顾客们的生活变得更加简单。当我们回顾软件开发的发展历程，定会感叹我们在软件开发领域上走过了漫长而又成功的道路。如今，软件应用的功能普遍变得强大且易用，但对于开发者来说，开发这些软件却变得 [越来越复杂](http://iosbrain.com/blog/2018/04/29/controlling-chaos-why-you-should-care-about-adding-error-checking-to-your-ios-apps/#chaos)。

开发者们为了管理软件的复杂性，创造了一系列的最佳实践 —— 例如面向对象编程、面向协议编程、值语义、局部推理（Local Reasoning）、把大块的代码切分成一系列小块的代码并附上友好的接口（如 Swift 中的扩展）、语法糖等。但在众多的最佳实践之中，有一个非常重要且值得我们关注的最佳实践并没有在上文中提及 —— 那就是设计模式的使用。

## 设计模式

对于开发者来说，设计模式是管理代码复杂度问题的一个极其重要的工具。我们理解设计模式最好的办法，就是把设计模式概念化为 —— 有固定模版的通用技术，每个设计模式都旨在解决相应的一个反复出现且易于辨别的特定问题。你可以把设计模式看作是一系列最佳实践的集合，它们可以用于一些经常出现的编码场景：例如如何利用一系列有关联的对象创建出新的对象，并且不需要去理解原本那一系列对象中“又臭又长”的代码实现。设计模式最重要的意义是其可以应用于那些常见的场景。同时，由于设计模式都是已经创造出来的固定模式，拿来即用的特质令它具有很高的易用性。为了能更好的理解设计模式，我们来看一个例子：

设计模式并不能解决一些非常具体的问题。例如 “如何在 Swift 中遍历一个包含 11 个整型（`Int`）的 数组”之类的的问题。我们从一个例子来更好地理解为什么设计模式不能解决此类具体问题 —— GoF 定义了*迭代器*模式，为“便捷地遍历集合的所有元素，而不需要知道集合中元素的类型” 的问题提出通用的解决方案，。因此，我们不能单纯地把设计模式当作某种语言的代码，它只是用于解决通用软件开发场景的规则和指引。

我曾经在 AppCoda 中讨论过 [“Model-View-ViewModel” 或 “MVVM”](https://www.appcoda.com/mvvm-vs-mvc/)  设计模式 —— 当然也少不了那个 Apple 和 众多 iOS 开发者们长期喜爱着的经典设计模式 [“Model-View-Controller” 或 “MVC”](https://www.appcoda.com/mvvm-vs-mvc/) 

这两种设计模式通常来说会应用于*整个应用层面*。MVVM 和 MVC 可以看作是*架构层面上*的设计模式，它们主要的作用可以简单分成四个方面：隔离用户界面（UI）与应用的数据；隔离用户界面（UI）与负责展示逻辑的代码；隔离应用的数据与核心数据处理逻辑；隔离应用的数据与业务逻辑。GoF 的设计模式都具有特殊性，它们都旨在解决一些在应用的*代码库中*较为特别的问题。你可能会在开发一个应用的时候用到好几个 GoF 的设计模式。同时你需要记得设计模式并不只是一些具体的代码实例，它们解决的是一些更抽象层面上的问题（希望你没忘记上面的*迭代器*例子）。除此之外我还想提及一个没有在 GoF 列出的 23 个设计模式之中，但却是设计模式的 [典型例子](https://www.appcoda.com/swift-delegate/) —— 代理模式。

虽然 GoF 关于设计模式的书已经被众多开发者视为圣经般的存在，但仍存在一些对其批判的声音。我们会在本文结尾的部分讨论这个问题。

## 设计模式类别

GoF 把他们提出的 23 种设计模式整理到了 3 种大的类别中：“创建型模式”、“结构型模式”以及“行为型模式”。本次的教程会讨论*行为型模式*类别中的两种设计模式。行为型模式的主要作用是对类和结构体（参与者）的行为赋予安全性、合理性，以及定义一些统一的规则、统一的的形式和最佳实践。对于整个应用中的参与者，我们都希望有一个良好的、统一的、并且可预测的行为。同时，我们不仅希望参与者本身拥有良好的行为，也希望不同的参与者之间的交互/通信可以拥有良好的行为。对于参与者的行为评估，其时机应该在编译之前以及编译时 —— 我通常把这段时间称之为“设计时间”，以及在运行时 —— 此时我们会有大量的类和结构体的实例在各司其职或与其他实例交互/通信。由于实例间的通信会导致软件复杂度的增加，因此制定一系列关于一致性、高效率和安全通信的规则是极为重要的，但与此同时，在构建每个单独的参与者时，这个概念不应以任何方式降低设计的质量。由于需要非常着重于行为，我们必须牢记一点 —— 在赋予参与者职责时必须使用一致的模式。

在高谈阔论太多理论之前，让我先说明一下本次教程中你会有哪些收获，同时所有的相关实践代码我都会用 Swift 来实现。在本次教程中，我们会了解到如何能够通过一致地赋予职责来维持参与者的状态。我们会了解到如何一致地赋予职责给一个参与者，让他能够发送通知给其他观察者。与之对应，我们也会了解到如何一致地赋予职责给观察者们注册通知。

当你讨论设计模式时，你应该把一致性当成最显而易见的基本概念。在 [上周的推送](https://www.appcoda.com/design-pattern-creational/) 中，我们着重讨论了一个概念：[高复杂度（封装）](http://iosbrain.com/blog/2017/02/26/intro-to-object-oriented-principles-in-swift-3-via-a-message-box-class-hierarchy/#advantages)。你必须把这个概念当作中心思想牢记于心，因为它会随着我们更深入地讨论设计模式而出现地越发频繁。举个例子，面向对象（OOP）中的众多类，可以在不需要开发者知道任何其内部实现的前提下，提供非常复杂、成熟且强大的功能。同样， Swift 的 [面向协议编程](https://www.appcoda.com/pop-vs-oop/) 也是一项对于控制复杂度来说极为重要的新技术。对开发者来说，想要管理好 [复杂度](http://iosbrain.com/blog/2018/01/02/understanding-swift-4-generics-and-applying-them-to-your-code/#complexity) 是一件异常困难的事情，但我们现在即将把这头野兽驯服！

## 关于此教程的提醒

在这次的教程中，我决定把文字聚焦于对示例代码的解释。我将对今天所要介绍的设计模式概念进行一些简单明了的陈述，但同时为了能够让你更好地理解我所分享的技术，希望你可以认真看看代码和注释。毕竟作为一名程序员，如果你只能谈论代码而不能编写代码，那你可能会在很多面试中失利 —— 因为你还不够硬核。

你也许会留意到，我对与行为型设计模式的定义是遵循于苹果的 [文档规范](https://docs.swift.org/swift-book/LanguageGuide/ClassesAndStructures.html):

> 传统意义上来说，我们视一个类的实例为一个对象。虽然如此，但相对于其他语言而言，Swift 中的结构体和类在功能上非常相似，且本章节大部分内容描述了类或者结构体实例的功能。因此，我们使用更为通用的描述——实例。

在设计时，我把对类和结构体的任何引用都描述为“参与者”。

## 观察者模式

在使用苹果的移动设备时，观察者模式可能是贯穿整个应用使用过程的东西 —— 你应该在编写 iOS 应用时也发现了这一点。在我生活的地方，每当下雨天的时候，包括我在内的很大一部分人都会收到 iPhone 上的通知。不管是锁屏的状态还是解锁的状态，只要下起雨来，你都会收到一条类似下面这样的通知：

![PushNotification demo](https://www.appcoda.com/wp-content/uploads/2018/08/PushNotification.png)

作为所有通知的*源头*，苹果会代表国家气象局（National Weather Service）向*成千上万*的 iPhone 用户发送（广播）通知，提醒他们在其区域内是否有洪水灾害的风险。更具体一点地在 iOS 应用层级上说，当某一个实例（也就是被观察者）的状态发生改变时，它会通知其他（不止一个）的被称为*观察者*的实例，告诉他们自己的某个状态发生了变化。所有参与此次广播通信的实例都不需要知道除了自身以外的任何其他实例。这是一个关于 [松耦合](https://www.webopedia.com/TERM/L/loose_coupling.html) 的绝佳示例。

被观察的实例（通常是一个重要的资源）会广播关于自身状态改变的通知给其他众多观察者实例。对这些状态改变有兴趣的观察者必须通过订阅来获取关于状态改变通知。

这次我们不得不说苹果还是很靠谱的，iOS 已经内置了一个广为人知的用于观察者模式的特性：[NotificationCenter](https://developer.apple.com/documentation/foundation/notificationcenter)。在这里我不会对其作过多介绍，读者可自行在 [这里](http://iosbrain.com/blog/2018/02/09/nsnotificationcenter-in-swift-4-intra-app-communication-sending-receiving-listening-stop-listening-for-messages/) 学习相关内容。

### 观察者模式用例

我的观察者模式示例项目展示了这种广播类型的通信是如何工作的，你可以在 [Github 上找到它](https://github.com/appcoda/Observer-Pattern-Swift)。

假设我们有一个工具来监视网络连接状况，并对已连接或未连接的状态作出响应。这个工具我们可以称之为广播者。为了实现此工具，你需要一个参与者遵循我提供的 `ObservedProtocol` 协议。虽然我知道这么做并不太符合苹果的 iOS Human Interface Guideline 的建议，但我为了更好地演示观察者模式，我需要以网络状况作为仅有的一个关键资源。

假设现在有许多个不同的观察者实例全都向被观察的对象订阅了关于网络连接状况的通知，例如一个图片下载类，一个通过 REST API 验证用户资格的登录业务实例，以及一个应用内浏览器。为了实现这些，你需要创建多个继承于我提供的 `Observer` 抽象类（此基类同时遵循 `ObserverProtocol` 协议）的自定义子类。（我稍后会解释为何我会把我关于观察者的示例代码放在一个类中）。

为了实现我示例应用中的观察者们，我创建了一个 `NetworkConnectionHandler` 类。当这个类的具体实例接收到 `NetworkConnectionStatus.connected` 通知时，这些实例会把几个视图变成绿色；当接收到 `NetworkConnectionStatus.disconnected` 通知时，会把视图变成红色。

下面是我的代码在 iPhone 8 Plus 设备上运行的效果：

![img](https://www.appcoda.com/wp-content/uploads/2018/08/ObserverAppDemo.gif)

上面的运行过程中，Xcode 控制台的输出如下：

![img](https://www.appcoda.com/wp-content/uploads/2018/08/ObserverAppConsoleOutput.gif)

### 观察者模式应用的示例代码

关于我上面所说的代码，你可以在项目中的 `Observable.swift` 文件找到。每段代码我都加上了详细的注释。

```swift
import Foundation
 
import UIKit
 
// 定义通知名常量。
// 使用常量作为通知名，不要使用字符串或者数字。
extension Notification.Name {
    
    static let networkConnection = Notification.Name("networkConnection")
    static let batteryStatus = Notification.Name("batteryStatus")
    static let locationChange = Notification.Name("locationChange")
 
}
 
// 定义网络状态常量。
enum NetworkConnectionStatus: String {
    
    case connected
    case disconnected
    case connecting
    case disconnecting
    case error
    
}
 
// 定义 userInfo 中的 key 值。
enum StatusKey: String {
    case networkStatusKey
}
 
// 此协议定义了*观察者*的基本结构。
// 观察者即一些实体的集合，它们的操作严格依赖于其他实体的状态。
// 遵循此协议的实例会向某些重要的实体/资源*订阅*并*接收*通知。
protocol ObserverProtocol {
    
    var statusValue: String { get set }
    var statusKey: String { get }
    var notificationOfInterest: Notification.Name { get }
    func subscribe()
    func unsubscribe()
    func handleNotification()
    
}
 
// 此模版类抽象如何*订阅*和*接受*重要实体/资源的通知的所有必要细节。
// 此类提供了一个钩子方法（handleNotification()），
// 所有的子类可以通过此方法在接收到特定通知时进行各种需要的操作。
// 此类基为一个*抽象*类，并不会在编译时被检测，但这似乎是一个异常场景。
class Observer: ObserverProtocol {
    
    // 此变量与 notificationOfInterest 通知关联。
    // 使用字符串以尽可能满足需要。
    var statusValue: String
    // 通知的 userInfo 中的 key 值，
    // 通过此 key 值读取到特定的状态值并存储到 statusValue 变量。
    // 使用字符串以尽可能满足需要。
    let statusKey: String
    // 此类所注册的通知名。
    let notificationOfInterest: Notification.Name

    // 通过传入的通知名和需要观察的状态的 key 值进行初始化。
    // 初始化时会注册/订阅/监听特定的通知并观察特定的状态。
    init(statusKey: StatusKey, notification: Notification.Name) {
        
        self.statusValue = "N/A"
        self.statusKey = statusKey.rawValue
        self.notificationOfInterest = notification
        
        subscribe()
    }
    
    // 向 NotificationCenter 注册 self(this) 来接收所有存储在 notificationOfInterest 中的通知。
    // 当接收到任意一个注册的通知时，会调用 receiveNotification(_:) 方法。
    func subscribe() {
        NotificationCenter.default.addObserver(self, selector: #selector(receiveNotification(_:)), name: notificationOfInterest, object: nil)
    }
    
    // 在不需要监听时注销所有已注册的通知是一个不错的做法，
    // 但这主要是由于历史原因造成的，iOS 9.0 之后 OS 系统会自动做一些清理。
    func unsubscribe() {
        NotificationCenter.default.removeObserver(self, name: notificationOfInterest, object: nil)
    }
    
    // 在任意一个 notificationOfInterest 所定义的通知接收到时调用。
    // 在此方法中可以根据所观察的重要资源的改变进行任意操作。
    // 此方法**必须有且仅有一个参数（NSNotification 实例）。**
    @objc func receiveNotification(_ notification: Notification) {
        
        if let userInfo = notification.userInfo, let status = userInfo[statusKey] as? String {
            
            statusValue = status
            handleNotification()
            
            print("Notification \(notification.name) received; status: \(status)")
            
        }
        
    } // receiveNotification 方法结束
    
    // **必须重写此方法；且必须继承此类**
    // 我使用了些"技巧"来让此类达到抽象类的形式，因此你可以在子类中做其他任何事情而不需要关心关于 NotificationCenter 的细节。
    func handleNotification() {
        fatalError("ERROR: You must override the [handleNotification] method.")
    }
    
    // 析构时取消对 Notification 的关联，此时已经不需要进行观察了。
    deinit {
        print("Observer unsubscribing from notifications.")
        unsubscribe()
    }
    
} // Observer 类结束
 
// 一个具体观察者的例子。
// 通常来说，会有一系列（许多？）的观察者都会监听一些单独且重要的资源发出的通知。
// 需要注意此类已经简化了实现，并且可以作为所有通知的 handler 的模板。
class NetworkConnectionHandler: Observer {
    
    var view: UIView
    
    // 你可以创建任意类型的构造器，只需要调用 super.init 并传入合法且可以配合 NotificationCenter 使用的通知。
    init(view: UIView) {
        
        self.view = view
        
        super.init(statusKey: .networkStatusKey, notification: .networkConnection)
    }
    
    // **必须重写此方法**
    // 此方法中可以加入任何处理通知的逻辑。
    override func handleNotification() {
        
        if statusValue == NetworkConnectionStatus.connected.rawValue {
            view.backgroundColor = UIColor.green
        }
        else {
            view.backgroundColor = UIColor.red
        }
        
    } // handleNotification() 结束
    
} // NetworkConnectionHandler 结束
 
// 一个被观察者的模板。
// 通常被观察者都是一些重要资源，在其自身某些状态发生改变时会广播通知给所有订阅者。
protocol ObservedProtocol {
    var statusKey: StatusKey { get }
    var notification: Notification.Name { get }
    func notifyObservers(about changeTo: String) -> Void
}
 
// 在任意遵循 ObservedProtocol 示例的某些状态发生改变时，会通知*所有*已订阅的观察者。
// **向所有订阅者广播**
extension ObservedProtocol {
 
    func notifyObservers(about changeTo: String) -> Void {
       NotificationCenter.default.post(name: notification, object: self, userInfo: [statusKey.rawValue : changeTo])
    }
    
} // ObservedProtocol 扩展结束
```
我把大部分关于观察者的通知处理逻辑放在了 `ObserverProtocol` 的扩展当中，并且这段逻辑会在一个 `@objc` 修饰的方法中运行（此方法同时会设置为通知的 `#selector` 的方法）。作为抽象类中的方法，相较于使用基于 block 的 [`addObserver(forName:object:queue:using:)`](https://developer.apple.com/documentation/foundation/notificationcenter/1411723-addobserver) 并把处理通知的闭包传进去，使用 selector 可以让这段通知处理代码显得更加容易理解以及更加适合教学。

同时，我意识到 Swift 中并没有关于抽象类的官方概念。因此，为了完成我解释观察者模式的教学目的，我强制使用者重写 `Observer` 的 `handleNotification()` 方法，以此来达到 “抽象类” 的形态。如此以来，你可以注入任意的处理逻辑，让你的子类实例在接收到通知后有特定的行为。

下面我将展示示例项目中的 `ViewController.swift` 文件，在这里你可以看到刚刚讨论过的  `Obesever.swift` 中的核心代码是如何使用的：

```swift
import UIKit
 
// 此 view controller 遵循 ObservedProtocol 协议，因此在*整个应用期间*
// 其可以通过 NotificationCenter 向*任意*有意接收的实体广播通知。
// 可以看到这个类仅仅需要很少量的代码便可以实现通知的功能。
class ViewController: UIViewController, ObservedProtocol {
    
    @IBOutlet weak var topBox: UIView!
    @IBOutlet weak var middleBox: UIView!
    @IBOutlet weak var bottomBox: UIView!
    
    // Mock 一些负责观察网络状况的实体对象。
    var networkConnectionHandler0: NetworkConnectionHandler?
    var networkConnectionHandler1: NetworkConnectionHandler?
    var networkConnectionHandler2: NetworkConnectionHandler?
    
    // 遵循 ObservedProtocol 的两个属性。
    let statusKey: StatusKey = StatusKey.networkStatusKey
    let notification: Notification.Name = .networkConnection
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // 初始化负责监听的实体对象。
        networkConnectionHandler0 = NetworkConnectionHandler(view: topBox)
        networkConnectionHandler1 = NetworkConnectionHandler(view: middleBox)
        networkConnectionHandler2 = NetworkConnectionHandler(view: bottomBox)
    }
 
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    // Mock 一个可以改变状态的重要资源。
    // 此处模拟此 ViewController 可以检测网络连接状况，
    // 当网络可以连接或者网络连接丢失时，通知所有有兴趣的监听者。
    @IBAction func switchChanged(_ sender: Any) {
        
        let swtich:UISwitch = sender as! UISwitch
        
        if swtich.isOn {
            notifyObservers(about: NetworkConnectionStatus.connected.rawValue)
        }
        else {
            notifyObservers(about: NetworkConnectionStatus.disconnected.rawValue)
        }
        
    } // switchChanged 函数结束
    
} // ViewController 类结束
```

## 备忘录模式

大部分 iOS 开发者对备忘录模式都很熟悉。回忆一下 iOS 中十分便利的 [归档和序列化功能](https://developer.apple.com/documentation/foundation/archives_and_serialization)，让你能够 “在对象和基本数据类型在 plist、JSON 和其他二进制形式之间自由转换”。再回忆一下 iOS 中的 [状态保存和恢复功能](https://developer.apple.com/documentation/uikit/view_controllers/preserving_your_app_s_ui_across_launches)，它能够记住你的应用被系统强制杀死时的状态，并在之后恢复此状态。

备忘录模式可以理解为在某个时刻捕捉、展示以及储存任意实例的内部状态，同时允许你可以在随后的时间内查找这些保存下来的状态并恢复它。当你恢复一个实例的某个状态时，它应当完全反映出这个实例在被捕捉时的状态。显然，要达到此效果，你必须保证所有实例属性的访问权限在捕捉和恢复时都是一样的 —— 例如，`public` 的数据应恢复为 `public` 的属性，`private`  的数据应恢复为 `private` 的属性。

为了简单起见，我使用 iOS 系统提供的 `UserDefaults` 作为我存储和恢复实例状态的核心工具。

### 备忘录模式用例

在我知道了 iOS 本身已提供了便捷的归档和序列化的功能后，我随即编写了一些可以保存和恢复类的状态的示例代码。我的代码很出色地抽象出了归档和解档的功能，因此你可以利用这些抽象方法存储和恢复许多不同的实例和实例的属性。不过我的示例代码并非用于生产环境下的，它们只是为了解释备忘录模式而编写的教学性代码。

你可以在 Github 上找到我的 [示例项目](https://github.com/appcoda/Memento-Pattern-Swift)。这个项目展示了一个包含`firstName`、`lastName`  和 `age` 属性的 `User` 类实例保存在 `UserDefaults` 中，并随后从 `UserDefaults` 恢复的过程。如同下面的效果一样，一开始，并没有任何 `User` 实例提供给我进行恢复，随后我输入了一个并把它归档，然后再恢复它：

![MementoDemoApp](https://www.appcoda.com/wp-content/uploads/2018/08/MementoDemoApp.gif)

上面过程中控制台输出如下：

```
Empty entity.
 
lastName: Adams
age: 87
firstName: John
 
lastName: Adams
age: 87
firstName: John
```

### 备忘录模式示例代码

我所实现的备忘录模式非常直白。代码中包含了一个 `Memento` 协议，以及 `Memento` 协议的扩展，用于在成员属性中存在遵循 `Memento` 协议的属性时，处理和抽象关于归档与解档的逻辑。与此同时，这个协议扩展允许在任何时候打印实例的所有状态。我使用了一个 `Dictionary<String, String>` 来存储那些遵循协议的类中的属性 —— 属性名作为字典的 Key，属性值作为字典的 Value。我把属性的值以字符串的类型存储，以此达到代码较简洁且容易理解的目的，但我必须承认实际情况中有许多用例会要求你去操作非常复杂的属性类型。归根到底，这是一个关于设计模式的教程，因此没有任何代码是基于生产环境来编写的。

需要注意我为 `Memento` 协议加了一个 `persist()` 方法和一个 `recover()` 方法，任何遵循此协议的类都必须实现它们。这两个方法让开发者可以根据实际需要，通过名字来归档和解档某个遵循 `Memento` 协议的类中的特定属性。换句话说，`Memento` 中类型为 `Dictionary<String, String>` 的 `state` 属性可以一对一地对应到某个遵循此协议的类中的属性，这些属性的名称对应字典中元素的 key，属性的值对应字典中元素的 value。相信你在看完具体的代码后肯定能完全理解。

由于遵循 `Memento` 协议的类必须实现  `persist()` 和 `recover()` 方法，因此这两个方法必须可以访问所有可见的属性，无论它具有什么样的访问权限 ——  `public` 、`private`  还是  `fileprivate`。

你或许也想知道我为什么把 `Memento` 协议设置为类协议（class-only）。原因仅仅是因为 Swift 编译器那诡异的报错："Cannot use mutating member on immutable value: ‘self’ is immutable"。我们暂且不讨论这个问题，因为它远远超出了本次教程的范围。如果你对这个问题感兴趣，你可以看一下这个 [不错的解释](https://www.bignerdranch.com/blog/protocol-oriented-problems-and-the-immutable-self-error/)。

接下来就到了代码的部分。首先，你可以在我示例项目中的 `Memento.swift` 文件找到关于备忘录模式的核心实现：

```swift
import Foundation
 
// 由于"Cannot use mutating member on immutable value: ‘self’ is immutable"报错问题，
// 此协议定义为类协议，仅适用于引用类型。
protocol Memento : class {
    
    // 访问 UserDefaults 中 state 属性的 key 值。
    var stateName: String { get }
    
    // 存储遵循此协议的类当前状态下的所有属性名（key）和属性值。
    var state: Dictionary<String, String> { get set }
    
    // 以特定的 stateName 为 key 将 state 属性存入 UserDefaults 中。
    func save()
    
    // 以特定的 stateName 为 key 从 UserDefaults 中读取 state。
    func restore()
    
    // 可自定义，以特定方式把遵循此协议的类的属性存储到 state 字典。
    func persist()
    
   // 可自定义，以特定方式从 state 字典读取属性。
    func recover()
    
    // 遍历 state 字典并打印所有成员属性，格式如下：
    // 
    // 属性 1 名字（key）：属性 1 的值
    // 属性 2 名字（key）：属性 2 的值
    func show()
    
} // Memento 协议结束
 
extension Memento {
    
    // 保存 state 到磁盘中。
    func save() {
        UserDefaults.standard.set(state, forKey: stateName)
    }
    
    // 从磁盘中读取 state。
    func restore() {
        
        if let dictionary = UserDefaults.standard.object(forKey: stateName) as! Dictionary<String, String>? {
            state = dictionary
        }
        else {
            state.removeAll()
        }
        
    } // restore() 函数结束
    
    // 以字典的形式保存当前状态可以很方便地进行可视化输出。
    func show() {
        
        var line = ""
        
        if state.count > 0 {
            
            for (key, value) in state {
                line += key + ": " + value + "\n"
            }
            
            print(line)
            
        }
        
        else {
            print("Empty entity.\n")
        }
            
    } // show() 函数结束
    
} // Memento 扩展结束
 
// 通过遵循 Memento 协议，任何类都可以方便地在整个应有运行期间
// 保存其完整状态，并能随后任意时间进行读取。
class User: Memento {
    
    // Memento 必须遵循的属性。
    let stateName: String
    var state: Dictionary<String, String>
    
    // 此类独有的几个属性，用于保存系统用户账号。
    var firstName: String
    var lastName: String
    var age: String
    
    // 此构造器可用于保存新用户到磁盘，或者更新一个现有的用户。
    // 持久化储存所用的 key 值为 stateName 属性。
    init(firstName: String, lastName: String, age: String, stateName: String) {
        
        self.firstName = firstName
        self.lastName = lastName
        self.age = age
        
        self.stateName = stateName
        self.state = Dictionary<String, String>()
        
        persist()
        
    } // 构造器定义结束
    
    // 此构造器可以从磁盘中读取出一个已存在的用户信息。
    // 读取所使用的 key 值为 stateName 属性。
    init(stateName: String) {
        
        self.stateName = stateName
        self.state = Dictionary<String, String>()
        
        self.firstName = ""
        self.lastName = ""
        self.age = ""
        
        recover()
        
    } // 构造器定义结束
 
    // 持久化存储用户属性。
    // 此处很直观地将每个属性一对一地以"属性名-属性值"的形式存入字典中。
    func persist() {
        
        state["firstName"] = firstName
        state["lastName"] = lastName
        state["age"] = age
        
        save() // leverage protocol extension
        
    } // persist() 函数结束
    
    // 读取已存储的用户属性。
    // 从 UserDefaults 中读取了 state 字典后
    // 会简单地以属性名为 key 从字典中读取出属性值。
    func recover() {
        
        restore() // leverage protocol extension
            
        if state.count > 0 {
            firstName = state["firstName"]!
            lastName = state["lastName"]!
            age = state["age"]!
        }
        else {
            self.firstName = ""
            self.lastName = ""
            self.age = ""
        }
        
    } // recover() 函数结束
    
} // user 类结束
```

接下来，你可以在示例项目中的 `ViewController.swift`  文件中找到我上问所说的关于备忘录模式的使用用例（对 `User` 类的归档和解档）：

```swift
import UIKit
 
class ViewController: UIViewController {
    
    @IBOutlet weak var firstNameTextField: UITextField!
    @IBOutlet weak var lastNameTextField: UITextField!
    @IBOutlet weak var ageTextField: UITextField!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }
 
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
 
    // "保存用户" 按钮按下时调用此方法。
    // 以 "userKey" 作为 stateName 的值将 User 类实例的属性
    // 保存到 UserDefaults 中。
    @IBAction func saveUserTapped(_ sender: Any) {
        
        if firstNameTextField.text != "" &&
            lastNameTextField.text != "" &&
            ageTextField.text != "" {
            
            let user = User(firstName: firstNameTextField.text!,
                            lastName: lastNameTextField.text!,
                            age: ageTextField.text!,
                            stateName: "userKey")
            user.show()
            
        }
        
    } // saveUserTapped 函数结束
    
    // 在"恢复用户"按钮按下时调用此方法。
    // 以 "userKey" 作为 stateName 的值将 User 类实例的属性
    // 从 UserDefaults 中读取出来。
    @IBAction func restoreUserTapped(_ sender: Any) {
        
        let user = User(stateName: "userKey")
        firstNameTextField.text = user.firstName
        lastNameTextField.text = user.lastName
        ageTextField.text = user.age
        user.show()
 
    }
    
} // ViewController 类结束
```

## 结论

即便 GoF 的设计模式已经在多数开发者心中被视为圣经般的存在（我在文章开头提到的），但仍有某些对设计模式持有批评意见的人认为，设计模式的使用恰恰是我们对编程语言不够了解或使用不够巧妙的证明，而且在代码中频繁使用设计模式并不是一件好事。我个人并不认同此看法。对于一些拥有几乎所有能想象得到的特性的语言，例如 C++ 这种非常庞大的编程语言来说，这种意见或许会适用，但诸如此类的语言通常极其复杂以致于我们很难去学习、使用并掌握它。能够识别出并解决一些重复出现的问题是我们作为人类的优点之一，我们并不应该抗拒它。而设计模式恰巧是人类从历史错误中吸取教训，并加以改进的绝佳例子。同时，设计模式对一些通用的问题给出了抽象化且标准化的解决方案，提高了解决这些问题的可能性和可部署性。

把一门简洁的编程语言和一系列最佳实践结合起来是一件美妙的事情，例如 Swift 和设计模式的结合。高一致性的代码通常也有高可读性和高可维护性。同时你要记得一件事，设计模式是通过成千上万的开发者们不断地讨论和交流想法而持续完善的。通过万维网带来的便捷性，开发者们在虚拟世界相互连接，他们的讨论不断碰撞出天才的火花。