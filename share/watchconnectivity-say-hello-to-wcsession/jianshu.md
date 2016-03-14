WatchConnectivity：学习 WCSession"

> 作者：Natasha，[原文链接](http://natashatherobot.com/watchconnectivity-say-hello-to-wcsession/)，原文日期：2015-09-21
> 译者：[小袋子](http://daizi.me)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  









在读这篇文章之前，请检查一下你是否已经学习了之前两篇关于`WatchOS 2`的文章：

-   [WatchOS 2: Hello, World](http://natashatherobot.com/watchos-2-hello-world/)
-   [WatchConnectivity Introduction: Say Goodbye To The Spinner](http://natashatherobot.com/watchconnectivity-introduction-say-goodbye-to-the-spinner/)

`WCSession`就是`WatchConnectivity`的魔力源泉，所以让我们赶紧深挖它吧！



`WCSession.defaultSession()`会返回`WCSession`的单例，用于在 iOS 和 Watch 应用之间传输数据。但是，在使用`WCSession`时仍有一些值得注意的地方。

首先，你必须给`session`设置一个`delegate`并启动它。

> “默认的`session`用于两个对应应用的通信（例如 iOS 应用和它的原生 WatchKit 扩展）。这个`session`提供发送、接收和追踪状态的方法。
> 
> 启动一个应用时，应该在默认的`session`上设置一个`delegate`并启动它。这将允许系统填充状态属性和提供任何优秀的背景传输。”—— Apple 文档说明。

所以你的代码应该写成这样：

    
    let session = WCSession.defaultSession()
    session.delegate = self
    session.activateSession()

在这里，我推荐将你的`WCSession`作为一个单例，这样就可以在应用中随意使用它：

    
    import WatchConnectivity
    
    // Note that the WCSessionDelegate must be an NSObject 
    // So no, you cannot use the nice Swift struct here!
    class WatchSessionManager: NSObject, WCSessionDelegate {
        
        // Instantiate the Singleton
        static let sharedManager = WatchSessionManager()
        private override init() {
            super.init()
        }
        
        // Keep a reference for the session, 
        // which will be used later for sending / receiving data
        private let session = WCSession.defaultSession()
        
        // Activate Session
        // This needs to be called to activate the session before first use!
        func startSession() {
            session.delegate = self
            session.activateSession()
        }
    }

现在你可以在`AppDelegate`的`application:didFinishLaunchingWithOptions`方法中启动你的`session`，并且可以在应用的任意位置使用：

    
    @UIApplicationMain
    class AppDelegate: UIResponder, UIApplicationDelegate {
        
        // truncated...
    
        func application(application: UIApplication,
            didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool
        {
            
            // Set up and activate your session early here!
            WatchSessionManager.sharedManager.startSession()
            
            return true
        }
        
        // truncated...
            
    }

但是启动`session`是远远不够的。你需要通过`WCSession`的多重检查，这样你的应用就不需要做额外的格式化传输数据工作。

# 检查设备是否支持

> 检查 iOS 设备是否支持 session，WatchOS 也是支持 session 的。

如果你有一个通用应用，那就需要注意，例如iPad 不支持`WCSession`（因为 iPad 不能和 Watch 配对）。因此确保在 iOS 项目中做`isSupported()`检查：

    
    if WCSession.isSupported() {
        let session = WCSession.defaultSession()
        session.delegate = self
        session.activateSession()
    }

这意味着你的`WatchSessionManager`单例需要适应不支持`WCSession`的场景（使用可选值）：

    
    // Modification to the WatchSessionManager in the iOS app only
    class WatchSessionManager: NSObject, WCSessionDelegate {
        
        // truncated ... see above section
        
        // the session is now an optional, since it might not be supported
        private let session: WCSession? = WCSession.isSupported() ? WCSession.defaultSession() : nil
        
        // starting a session has to now deal with it being an optional
        func startSession() {
            session?.delegate = self
            session?.activateSession()
        }

# Watch 相关的 iOS App 状态

如果你从 iOS 应用发送数据到 Watch，你需要做一些额外的检查，这样当 Watch 处于无法接受数据的状态时，你就不会浪费 CPU 资源去处理用于传输的数据。

**是否配对**

显然，为了从 iOS 设备传输数据到 Watch，用户必须有一个 Watch 并且和 iOS 设备配对。


**是否安装 Watch 应用**

一个用户可能有一对设备，当然可以选择删除手表中的应用，所以为了数据传输，你需要检查你的应用确实有安装在所配对的 Apple Watch 上面。

如果用户有一对设备但是没有对应的应用，那你就可以在合适的时机向用户推荐你的应用，他很可能会安装你的应用。

为了让这些检查更加简单，并且能够在应用中随意使用，我喜欢在 iOS 应用中创建一个`validSession`变量：

    
    // Modification to the WatchSessionManager in the iOS app only
    class WatchSessionManager: NSObject, WCSessionDelegate {
        
        // truncated... see above
        
        private let session: WCSession? = WCSession.isSupported() ? WCSession.defaultSession() : nil
        
        // Add a validSession variable to check that the Watch is paired
        // and the Watch App installed to prevent extra computation 
        // if these conditions are not met.
         
        // This is a computed property, since the user can pair their device and / or
        // install your app while using your iOS app, so this can become valid  
        
        private var validSession: WCSession? {
           
            // paired - the user has to have their device paired to the watch
            // watchAppInstalled - the user must have your watch app installed
            
            // Note: if the device is paired, but your watch app is not installed
            // consider prompting the user to install it for a better experience
            
            if let session = session where session.paired && session.watchAppInstalled {
                return session
            }
            return nil
        }
    
        // truncated... see above
    }

**并发是否可用**

最后，如果你在应用中有使用并发，你必须检查并发是否可用。我不会在`WatchConnectivity`教程中介绍过多并发的细节，但是如果你想要知道更多，可以观看超级有用和全面的 [WWDC 2015 Creating Complications with ClockKit session](https://developer.apple.com/videos/wwdc/2015/?id=209)。


**sessionWatchStateDidChange**

注意，如果你的 iOS 应用需要`WCSession`状态变化的信息，这里有一个 delegate 方法，专门用于通知`WCSession`的状态变化：


    
    /** Called when any of the Watch state properties change */
        func sessionWatchStateDidChange(session: WCSession) {
            // handle state change here
        }

例如，如果你的应用需要安装 Watch 应用，可以实现这个`delegate`方法，然后去检测你的 Watch 应用是否真正安装了，并且让用户在 iOS 应用中进行设置。


# 检查设备可达状态

为了正确在 iOS 和 Watch 中使用`Interactive Messaging`传输数据，你需要做一些额外的工作以确保两个应用处于可达状态：

> Watch 应用的可达状态需要所配对的 iOS 设备在重启后至少解锁一次。这个属性能够用于决定 iOS 设备是否需要被解锁。如果`reachable`设为`NO`，可能是由于设备重启过，需要解锁。如果处于这种状态，Watch 将会展示一个提示框建议用户去解锁他们配对的 iOS 设备。

在使用`Interactive Messaging`时，我喜欢给我的单例增加一个额外的`valideReachableSession`变量：

    
    // MARK: Interactive Messaging
    extension WatchSessionManager {
        
        // Live messaging! App has to be reachable
        private var validReachableSession: WCSession? {
            // check for validSession on iOS only (see above)
            // in your Watch App, you can just do an if session.reachable check
            if let session = validSession where session.reachable {
                return session
            }
            return nil
        }

如果`session`是不可达的，你可以如 Apple 所建议的那样，提示用户去解锁他们的 iOS 设备。为了获知用户解锁设备，实现`sessionReachabilityDidChange`的`delegate`方法：


    
    func sessionReachabilityDidChange(session: WCSession) {
        // handle session reachability change
        if session.reachable {
            // great! continue on with Interactive Messaging
        } else {
            // 😥 prompt the user to unlock their iOS device
        }
    }

以上！现在你应该已经知道了`WCSession`的一些要领，所以我们将会学习更加好玩的部分 —— 真正使用它在 iOS 和 Watch 之间接收和发送收据！

你可以在 GitHub 查看完整的[WatchSessionManager单例](https://gist.github.com/NatashaTheRobot/6bcbe79afd7e9572edf6)。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。