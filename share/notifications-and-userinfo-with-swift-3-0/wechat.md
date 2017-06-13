Swift 3.0 下 Notifications 与 userInfo 的使用"

> 作者：Joe，[原文链接](http://dev.iachieved.it/iachievedit/notifications-and-userinfo-with-swift-3-0/)，原文日期：2016-09-17
> 译者：[Tony Han](undefined)；校对：[walkingway](http://chengway.in/)；定稿：[CMB](https://github.com/chenmingbiao)
  









Swift 3.0 版本给 Swift 语言带来了相当多的改变，包括去掉 Foundation 框架中 NS 前缀的 [Great Renaming](https://developer.apple.com/videos/play/wwdc2016/403/)。`NSThread` 被简写作 `Thread`，`NSData` 被简写作 `Data`，就是这个意思。



这意味着，需要更新通过 `userInfo` 使用 `NSNotificationCenter`，哦不，`NotificationCenter` 的用法。这是 Swift 2 和 Swift 3 之间的巨大差别。

现在获取默认的 `NotificationCenter` 的方法已经变成 `let nc = NotificationCenter.default`。另外，当接收到通知时，使用选择器的模型已经改变为指定要执行的代码块或函数。

例如，在 Swift 2 中这么写：

    
    let nc = NSNotificationCenter.defaultCenter()
    nc.addObserver(self, 
                   selector: #selector(ViewController.catchNotification),
                   name: "MyNotification", 
                   object: nil)

而 Swift 3 中要这么写：

    
    let nc = NotificationCenter.default // 注意：default 是属性，不是方法调用
    nc.addObserver(forName:Notification.Name(rawValue:"MyNotification"),
                   object:nil, queue:nil,
                   using:catchNotification)

上面的例子设置了通知中心将 `MyNotification` 通知传递给具有 `(Notification) -> Void` 方法签名的 `catchNotification` 函数。或者也可以使用闭包调用：

    
    let nc = NotificationCenter.default // 注意：default 是属性，不是方法调用
    nc.addObserver(forName:Notification.Name(rawValue:"MyNotification"),
                   object:nil, queue:nil) {
      notification in
      // 处理通知
    }

#### 发送通知

下面看看如何发送通知。Swift 2.0 中的 `postNotificationName` 方法在 Swift 3.0 中已经被替换为 `post`。

    
    let nc = NotificationCenter.default
    nc.post(name:Notification.Name(rawValue:"MyNotification"),
            object: nil,
            userInfo: ["message":"Hello there!", "date":Date()])

`userInfo` 使用 `[AnyHashable：Any]?` 作为参数，这在 Swift 中被称作字典字面量。注意，`userInfo` 的值不需要统一类型（即 `Any` 所占位置）；这里发送了一个 `String` 类型和一个 `Date` 类型。

#### 处理通知

`guard` 语法用来从 `userInfo` 中解包并验证期望数据，这是一个很不错的方式。

    
      func catchNotification(notification:Notification) -> Void {
        print("Catch notification")
        
        guard let userInfo = notification.userInfo,
              let message  = userInfo["message"] as? String,
              let date     = userInfo["date"]    as? Date else {
          print("No userInfo found in notification")
          return
        }
        
        let alert = UIAlertController(title: "Notification!",
                                      message:"\(message) received at \(date)",
                                      preferredStyle: UIAlertControllerStyle.alert)
        alert.addAction(UIAlertAction(title: "OK", style: UIAlertActionStyle.default, handler: nil))
        self.present(alert, animated: true, completion: nil)
        
      }

要验证 `guard` 的作用，可以使用 `String` 类型或其他的对象类型代替 `Date()` 来调用 `post` 方法。可以在控制台的输出中看到 `No userInfo found in notification`。

#### 实例源码

可以在一个简单的 iOS 项目中尝试使用上面的代码。创建 **Single View Application** 项目，并且使用以下内容替换 `ViewController.swift` 中的内容：

    
    import UIKit
    
    class ViewController: UIViewController {
      
      let myNotification = Notification.Name(rawValue:"MyNotification")
    
      override func viewDidLoad() {
        super.viewDidLoad()
        
        let nc = NotificationCenter.default
        nc.addObserver(forName:myNotification, object:nil, queue:nil, using:catchNotification)
      }
      
      override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        let nc = NotificationCenter.default
        nc.post(name:myNotification,
                object: nil,
                userInfo:["message":"Hello there!", "date":Date()])
      }
      
      func catchNotification(notification:Notification) -> Void {
        print("Catch notification")
        
        guard let userInfo = notification.userInfo,
              let message  = userInfo["message"] as? String,
              let date     = userInfo["date"]    as? Date else {
            print("No userInfo found in notification")
            return
        }
        
        let alert = UIAlertController(title: "Notification!",
                                      message:"\(message) received at \(date)",
                                      preferredStyle: UIAlertControllerStyle.alert)
        alert.addAction(UIAlertAction(title: "OK", style: UIAlertActionStyle.default, handler: nil))
        self.present(alert, animated: true, completion: nil)
      }
    }

注意事项：

- `Notification` 的“名字”不再是字符串类型，而是 `Notification.Name` 类型，因此在声明通知的时候使用 `let myNotification = Notification.Name(rawValue:"MyNotification")`。这样可以允许我们在任何需要使用 `Notification.Name` 的地方来使用 `myNotification`，比如，`NotificationCenter.addObserver` 和 `NotificationCenter.post` 方法。
- 推荐使用分开的 `catchNotification` 方法而不是纠缠在一起的代码块。

就是这样，简洁而有效！

#### 评论内容

声明并使用通知的改进：

1) 首先声明通知名称：

    
    public extension Notification {
      public class MyApp {
         public static let MyNotification = Notification.Name("Notification.MyApp.MyNotification")
      }
    }

2) 使用通知名称发送通知：

    
    NotificationCenter.default.post(name: Notification.MyApp.MyNotification, object: self)

3) 监听通知：

    
    NotificationCenter.default.addObserver(forName: Notification.MyApp.MyNotification, object: nil, queue: OperationQueue.main) {
          pNotification in
     
      // Your code here
    }
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。