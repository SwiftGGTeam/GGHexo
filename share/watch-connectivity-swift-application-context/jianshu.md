在 Swift 中使用 Watch Connectivity — Application Context"

> 作者：codingexplorer，[原文链接](http://www.codingexplorer.com/watch-connectivity-swift-application-context/)，原文日期：2018-07-18
> 译者：[Khala-wan](http://khala-wan.com)；校对：[Yousanflics](http://blog.yousanflics.com.cn)，[wongzigii](https://github.com/wongzigii)；定稿：[CMB](https://github.com/chenmingbiao)
  









![](http://swift.gg/img/articles/Watch Connectivity in Swift — Application Context/Watch-Connectivity-Application-Context.png1534304479.3475852)

在 watchOS 1 时代，`WatchKit Extension` 位于已配对的 iOS 设备上，这使得宿主 APP 和 watch 之间的数据共享变得简单。类似偏好设置这种最简单的数据，只需要通过 App Groups 功能来存取 `NSUserDefaults`。目前在手机上留存的其他扩展程序和主 app 之间共享数据仍然应该使用这种方式，例如 `Today View Extension`，但它已不再适用于 watchOS 的 app。
幸运的是，苹果为我们提供了新的 API 来做这件事。相比 App Groups，Watch Connectivity 拥有更强大的功能。它不仅提供了你的 Apple Watch 和与其配对 iPhone 之间连接状态的更多信息，还允许它们之间进行交互消息和 3 种方式的后台传输，这些方式分别是：

1. Application Context
2. User Info Transfer
3. File Transfer

我们今天先讨论第一种方式：Application Context。



## 什么是 Application Context

假设你有个 watch app，它有一些可以在 iOS app 端设置的设置项，比如温度的显示单位是摄氏度还是华氏度。对于这样的设置项，除非你希望在用户在设置完成之后立即使用 watch 上的 app，否则将设置项的信息通过后台传输发送到 watch 才会是比较合理的。

因为它可能不是立即需要的，所以系统可能会在节省电量最多的情况下将其发送出去。你也不需要任何历史记录，因为用户可能并不关心一小时之前的设置是摄氏度。

这就是 Application Context 的用武之地。它仅用于发送最新的数据。如果你将温度设置项从摄氏度改为华氏度，然后在 Application Context 发送到 watch 之前再将它（或者其他设置项）设置为不同的值，那么最新的值会覆盖之前等待发送的信息。

如果你确实希望它能保存先前信息的历史记录，而且是以最省电的方式传输。那么可以使用 `User Info` 方式进行传输。它的使用方式和 Application Context 很相似，但它会将更新操作加入到一个队列中并逐一发送（而不是仅仅覆盖某些内容只发送最新的信息）。具体 `User Info` 的使用将作为以后另一篇文章的主题来讲。

## 设置 iOS 应用程序

我们将从一个类似于上一篇文章 [watchOS Hello World App in Swift](http://www.codingexplorer.com/watchos-2-hello-world-app-in-swift/) 中的 app 说起。不过在本文中，我们将在这个 iPhone app 上加入一个 `UISwitch` 控件，并通过更新 watchOS app 上的 WKInterfaceLabel 来说明 `UISwitch` 的状态。

首先，在 iOS app 的 `viewController` 中，我们需要设置一些东西：

    
    import WatchConnectivity
     
    class ViewController: UIViewController, WCSessionDelegate {
        func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) { }
        func sessionDidBecomeInactive(_ session: WCSession) { }
        func sessionDidDeactivate(_ session: WCSession) { }
        
        var session: WCSession?
     
        override func viewDidLoad() {
            super.viewDidLoad()
            
            if WCSession.isSupported() {
                session = WCSession.default
                session?.delegate = self
                session?.activate()
            }
        }
    }

下面，我们最先需要导入 `WatchConnectivity` 框架。没有它，我们所做的都是无用功。接下来，为了响应来自 WCSession 的回调，我们需要将当前这个 `ViewController` 设置为 `WCSession` 的代理，为此我们需要让它遵守这个协议，所以在 `ViewController` 的父类声明后面添加 `WCSessionDelegate` 协议。

下一步，我们需要实现 `WCSessionDelegate` 中的一些方法。对于当前这个 app，它们不是特别必要，但是如果想要快速在 watch app 中切换，你就需要进一步实现它们。

之后，我们需要创建一个变量用于存储 `WCSession`。因为 `WCSession` 实际上是一个单例，技术上我们可以跳过这一步，但每次输入 `session?` 肯定要比 `WCSession.default` 更简短。

你应该在代码运行初期对 session 进行设置。在大多数情况下，这将在程序初始化的时候来做。但由于我们是在 `ViewController` 中执行此操作，所以最早能执行的地方大概就只有 `viewDidLoad` 方法中了。一般情况下来说，你不应该在 `viewController` 中执行这个操作，因为你的 app 希望在屏幕上未加载特定 `viewController` 时就可以更新它的数据模型。为了简单起见，我在 `viewController` 中做了这个操作，这仅仅是为了展示如何使用这些 API。如果这个 `ViewController` 是唯一关心使用 `WCSession` 的东西，那就没关系。但通常情况并非如此。

要设置 session，我们需要先根据 `WCSession` 的 `isSupport` 方法的返回值来检查是否支持。如果程序在 iPad 上运行的话，这一点尤为重要。目前，你无法将 iPad 与 Apple Watch 配对，因此它会返回 `false` 表示不支持在 iPad 上使用 `WCSession`。在 iPhone 上它会返回 `true`。

一旦我们完成检查，就可以将 WCSession 的 defaultSession 存储在那里，接着将这个 `ViewController` 设置为它的代理并激活 session。如果我们可以在初始化程序中执行 `isSupported` 来测试是否支持，就可以把 session 用作一个常量。而这里的 session 是一个可选值是因为我们不知道程序是否会运行在 `iPad` 上，所以当支持 `WCSession` 时，session 的值为 `WCSession.defualt`，反之则为 `nil`。这样，当我们在 `iPad` 上尝试访问 session 中的属性或方法时，它们甚至不会执行，因为 session 为 `nil`。

将一个 `UISwitch` 放在 Storyboard 上，并将其 `ValueChanged` 方法关联到 `ViewController` 中。
在方法中加入如下代码：

    
    @IBAction func switchValueChanged(_ sender: UISwitch) {
        if let validSession = session {
            let iPhoneAppContext = ["switchStatus": sender.isOn]
     
            do {
                try validSession.updateApplicationContext(iPhoneAppContext)
            } catch {
                print("Something went wrong")
            }
        }
    }

首先检查我们是否有一个有效的 session，如果是运行在 iPad 上，那么将跳过整个代码块。 `Application Context` 是一个 Swift 字典，它以 `String` 作为 `key`，`AnyObject` 作为 `value` (`Dictionary<String, AnyObject>`)。 value 必须遵循属性列表的规则，并且只包含某些类型。它和 `NSUserDefaults` 具有相同的限制，所以在上一篇文章 [NSUserDefaults — A Swift Introduction](http://www.codingexplorer.com/nsuserdefaults-a-swift-introduction/) 中已经介绍过了具体可以使用哪些类型。尽管如此，当我们发送一个 Swift `Bool` 类型时，其将会被转换为 `NSNumber boolean value`，所以没关系。

调用 `updateApplicationContext` 可能会抛出异常，所以我们需要将它包装在 `do-block` 中并通过 `try` 来调用。如果出现异常，我们只是在控制台上打印了一些信息，你还可以设置任何你需要的东西，比如你可能需要让用户知道发生了错误，那就可以显示一个 UIAlerController，同样，如果有必要可以加入异常的清理或恢复代码。这就是为了发送 `Application Context`，我们所需要的全部准备。

## 设置 watchOS 应用程序

因为我们使用的是之前 [watchOS Hello World App in Swift](http://www.codingexplorer.com/watchos-2-hello-world-app-in-swift/) 文中的 Hello World App，所以部分相同的设置已经替我们完成了。跟 iPhone 类似，我们还需要做一些设置才能使用 `WatchConnectivity`。

    
    import WatchConnectivity
    
    class InterfaceController: WKInterfaceController, WCSessionDelegate {
        func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) { }
    
        let session = WCSession.default
    
        override func awake(withContext context: Any?) {
            super.awake(withContext: context)
            
            session.delegate = self
            session.activate()
        }
    //...
    }

这里省略掉了之前 App 中的一些无关代码，只展示与 `WatchConnectivity` 设置相关的部分。同样，我们需要导入 `WatchConnectivity` 框架，并让我们的 InterfaceController 遵守 WCSessionDelegate 协议，紧接着，我们将 session 常量初始化为 `WCSession` 的单例 `defaultSession`。

与 iOS 端不同的是，这里我们将 session 声明为一个非可选值的常量。很显然，运行在不低于 `watchOS 2` 系统上的 Apple Watch 是支持 `Watch Connectivity` 的，所以我们不需要在 `watchOS` 端进行相同的测试。 并且我们在声明时就初始化了它，又没有其他平台（如iPad）需要担心，所以我们不需要它是可选的。

接下来，在代码的初期，我们需要设置 session。在 InterfaceController 中 awakeWithContext 方法是个很好的地方，所以我们在这里做相关设置。和 iOS App 一样，我们设置当前类作为 session 的代理，然后激活 session。

让我们写一个辅助方法来处理 Application Context 的回调，因为我们可能会多次调用它，而不是仅仅当我们收到一个新 `context` 时（你很快会看到）。

    
    func processApplicationContext() {
        if let iPhoneContext = session.receivedApplicationContext as? [String : Bool] {
    
            if iPhoneContext["switchStatus"] == true {
                displayLabel.setText("Switch On")
            } else {
                displayLabel.setText("Switch Off")
            }
        }
    }

`WCSession` 有 2 个与 `Application Context` 相关的属性，`applicationContext` 和 `receivedApplicationContext`。它们的不同之处是：

* applicationContext - 此设备最近一次**发送**的 `Application Context`。
* receivedApplicationContext - 此设备最近一次**接收**的 `Application Context`。

现在，把它俩放到一起来看，至少接收到的看起来很明显。但在我第一次涉及这个时（不记得 WWDC 中 Watch Connectivity的介绍视频的全部内容？），我认为 applicationContext 是从最近的发送或接收来更新的，因为我认为它们是一致的 `context`。然而我大错特错，我花了一段时间才意识到它们是分开的。我当然能看出来原因，因为我们可能每次都会发送不一样的数据，就像从 Watch 的角度来看，applicationContext 就是 iPhone 端需要的 Watch 相关 `context`，而 receivedApplicationContext 则是 Watch 端需要的 iPhone 相关 `context`。无论哪种方式，请记住它们是不同的两个东西，并根据实际情况选择你所需要的那个。

所以在这个方法中，我们首先尝试将 `receivedApplicationContext` 由 `[String: AnyObject]` 类型的字典转换为我们需要的 `[String: Bool]` 类型。如果转换成功，则再根据字典中布尔值的状态将 displayLabel 的 text 值设置为 “Switch On” 或 “Switch Off”。

当我们实际接收到一个新的  Application context 时，该 InterfaceController 将会收到我们 WCSession 对象的代理回调来通知我们这个信息，我们将在那里调用这个辅助方法。

    
    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String : Any]) {
        DispatchQueue.main.async() {
            self.processApplicationContext()
        }
    }

现在，你大概看到了 `didReceiveApplicationContext` 方法的入参带有它接收到的 `Application Context` 副本。它存储在上面提到的 `receivedApplicationContext` 属性中。所以我们并不需要它来调用辅助方法, 因此这个方法不需要传入任何行参。

> 译者注：
> 其实对于辅助方法 `processApplicationContext` 来说，增加行参 context 反而更 **函数式**，也更 **Swift**。 通过增加一个 context 的入参，可以让方法内部实现和外部依赖解耦，更加方便我们对它进行单元测试。

那么，调用 `dispatch_async` 是为了做什么呢？好吧，这些代理回调不在主线程上。你永远不应该在除主线程以外的任何线程更新 iOS 或 watchOS 中的 UI。而我们的辅助方法除了从 `receivedApplicationContext` 中读取信息之外，主要目的是用来更新 UI 元素。因此，我们要通过 `dispatch_async` 方法返回主线程来调用该方法。调用 `dispatch_async` 需要 2 个参数，首先是派发队列（对于主线程，我们通过 `dispatch_get_main_queue` 方法获取），其次是一个闭包来告诉它需要做什么操作，这里我们只是告诉它去调用辅助方法。

所以，为什么我们要在辅助方法里这样做，而不是直接在回调方法里面直接处理呢？好吧，当你实际接收到一个新的 `Application Context` 时，会回调 `didReceiveApplicationContext` 代理方法。当 `WCSession` 在关闭时接收到新的 `ApplicationContext` 会调用 activateSession 方法，在那不久之后也会回调到 `didReceiveApplicationContext` 方法。在这种情况下，我使用此 ApplicationContext 作为该信息的后备存储。我不确定这是不是一个好的主意，但是对于一个简单的 app 来说，这是合理的， 因为 `label` 的重点是显示 iPhone 上的 `UISwitch` 是开启还是关闭。

那么，当我们的 app 完成加载之后想使用最后一次接收到的值，但是 app 在关闭期间又没有收到新的 `context`，这种情况该怎么办？我们在视图生命周期的早期设置 label，所以现在 `awakeWithContext` 看起来应该是这样：

    
    override func awake(withContext context: Any?) {
        super.awake(withContext: context)
     
        processApplicationContext()
     
        session.delegate = self
        session.activate()
    }

由于 awakeWithContext 肯定在主线程上，我们不需要 `dispatch_async`。 因此这就是它仅用于在 didReceiveApplicationContext 回调中来调用辅助方法而不是在辅助方法内部使用的原因。

此时 iOS App 并没有保留该 `UISwitch` 的状态，所以在启动时保持它们的同步并不那么重要，对于一个有价值的 app 来说，我们应该将 UISwitch 的状态存储在某个地方。比如可以在 iPhone 端使用 WCSession 的 ApplicationContext 属性。（请记住，applicationContext 是从设备**发送**过来的最后一个 `context`），但如果是在iPad上运行呢？你可以将它存储在 `NSUserDefaults`，或者其他许多地方，但这些不在如何使用 WatchConnectivity 的讨论范畴内。具体你可以在早期的 [NSUserDefaults — A Swift Introduction](http://www.codingexplorer.com/nsuserdefaults-a-swift-introduction/) 文章中了解到。

## 代码

以下是该项目的完整代码：

### ViewController.swift

    
    import UIKit
    import WatchConnectivity
    
    class ViewController: UIViewController, WCSessionDelegate {
        func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) { }
        func sessionDidBecomeInactive(_ session: WCSession) { }
        func sessionDidDeactivate(_ session: WCSession) { }
        
        @IBOutlet var theSwitch: UISwitch!
        
        var session: WCSession?
    
        override func viewDidLoad() {
            super.viewDidLoad()
            
            if WCSession.isSupported() {
                session = WCSession.default
                session?.delegate = self
                session?.activate()
            }
        }
        
        func processApplicationContext() {
            if let iPhoneContext = session?.applicationContext as? [String : Bool] {
                if iPhoneContext["switchStatus"] == true {
                    theSwitch.isOn = true
                } else {
                    theSwitch.isOn = false
                }
            }
        }
        
        @IBAction func switchValueChanged(_ sender: UISwitch) {
            if let validSession = session {
                let iPhoneAppContext = ["switchStatus": sender.isOn]
    
                do {
                    try validSession.updateApplicationContext(iPhoneAppContext)
                } catch {
                    print("Something went wrong")
                }
            }
        }
    }

### InterfaceController.swift

    
    import WatchKit
    import WatchConnectivity
    
    class InterfaceController: WKInterfaceController, WCSessionDelegate {
        func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) { }
    
        
        @IBOutlet var displayLabel: WKInterfaceLabel!
        
        let session = WCSession.default
    
        override func awake(withContext context: Any?) {
            super.awake(withContext: context)
            
            processApplicationContext()
            
            session.delegate = self
            session.activate()
        }
        
        @IBAction func buttonTapped() {
            //displayLabel.setText("Hello World!")
        }
        
        func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String : Any]) {
            DispatchQueue.main.async() {
                self.processApplicationContext()
            }
        }
        
        func processApplicationContext() {
            if let iPhoneContext = session.receivedApplicationContext as? [String : Bool] {
                
                if iPhoneContext["switchStatus"] == true {
                    displayLabel.setText("Switch On")
                } else {
                    displayLabel.setText("Switch Off")
                }
            }
        }
    }

请记住，这些代码来自 Hello World App，但是我们没有用到 watchOS App 上的 button。所以我只是注释了原始功能的代码。

## 结论

以上就是如何使用 Watch Connectivity 的 Application Context 方式进行后台传输的教程。向手机端回传数据也是完全相同的，因为它们具有同样的代理回调和属性。虽然在那种情况下，你可能还需要根据实际情况检查是否存在与该设备配对的 Apple Watch 或者 Watch 上是否安装了对应的 app。
 
正如我之前提到的，在 `ViewController / InterfaceController` 中执行所有代码可能不是最好的主意，但这只是为了简单地展示如何使用 API​​。我个人非常喜欢在自己的 `Watch Connectivity manager` 实例中执行这些操作。所以我强烈建议你阅读 Natasha The Robot 的文章 [WatchConnectivity: Say Hello to WCSession](https://www.natashatherobot.com/watchconnectivity-say-hello-to-wcsession/)，并关联他的 [GitHub Gist](https://gist.github.com/NatashaTheRobot/6bcbe79afd7e9572edf6)。这将对你使用 WatchConnectivity 很有帮助。

我希望本文能对你有所帮助。如果有帮到你，请不要犹豫，在 Twitter 或者你选择的社交媒体上分享这篇文章，每个分享对我都是帮助。当然，如果你有任何疑问，请随时通过[联系页面](http://www.codingexplorer.com/contact/)或 Twitter [@CodingExplorer](https://twitter.com/CodingExplorer) 与我联系，我会看看我能做些什么。谢谢！

## 来源

* [The Swift Programming Language – Apple Inc.](https://itunes.apple.com/us/book/swift-programming-language/id881256329?mt=11&uo=4&at=10lJ3x&ct=blog-SwiftOperatorOverloading)
* [Facets of Swift, Part 5: Custom Operators — Swift Programming — Medium](https://medium.com/swift-programming/facets-of-swift-part-5-custom-operators-1080bc78ccc)
* [watchOS 2 Tutorial: Using application context to transfer data (Watch    Connectivity #2)](http://www.kristinathai.com/watchos-2-tutorial-using-application-context-to-transfer-data-watch-connectivity-2/) by [Kristina Thai](https://twitter.com/kristinathai)
* [WatchConnectivity: Sharing The Latest Data via Application Context](https://www.natashatherobot.com/watchconnectivity-application-context/) by   [Natasha The Robot](https://twitter.com/natashatherobot)

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。