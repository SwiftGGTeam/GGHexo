Block 形式的通知中心观察者是否需要手动注销"

> 作者：Ole Begemann，[原文链接](https://oleb.net/blog/2018/01/notificationcenter-removeobserver/)，原文日期：2018-01-05
> 译者：[BigNerdCoding](undefined)；校对：[pmst](http://www.jianshu.com/users/596f2ba91ce9/latest_articles)；定稿：[CMB](https://github.com/chenmingbiao)
  










简单回答：需要 （在 iOS 11.2 上验证过）

几周之前，我在 twitter 上提出了一个[问题](https://twitter.com/olebegemann/status/938085544780877824)：

> 在 iOS 11 中是否还需要手动移除基于 block 形式的通知观察者？苹果开发文档中比较模糊。[`addObserver(forName:object:queue:using:)`](https://developer.apple.com/documentation/foundation/notificationcenter/1411723-addobserver) 中说需要，而 [`removeObserver(_:)`](https://developer.apple.com/documentation/foundation/notificationcenter/1413994-removeobserver) 中又表明 iOS 9 之后都不在需要。

虽然我没有统计准确的数字，但是大致看来持不同意见的人差不多五五开。

所以下面我们就来具体测试验证一下。



## 问题

首先，我所说的基于 block 的接口声明是 [`NotificationCenter.addObserver(forName: object: queue: using:)`](https://developer.apple.com/documentation/foundation/notificationcenter/1411723-addobserver) 。使用该 API 我们在通知中心注册了一个函数用于处理对应的通知，并且得到一个表示观察者的返回值。

    
    class MyObserver {
        var observation: Any? = nil
    
        init() {
            observation = NotificationCenter.default.addObserver(
                forName: myNotification, object: nil, queue: nil) { notification in
                    print("Received \(notification.name.rawValue)")
                }
        }
    }

问题是：当代码中的返回值 *observation* 销毁时（例如，MyObserver 实例对象析构了），通知中心会不会自动忽略并停止调用处理函数呢？毕竟基于 [KeyPath](https://developer.apple.com/documentation/swift/key_path_expressions) 的 [KVO 新接口](http://skyefreeman.io/programming/2017/06/28/kvo-in-ios11.html)当观察者销毁后，响应处理不再被调用，所以通知可能也被理解成是这样进行的。

或者，我们依旧需要手动调用 [`NotificationCenter.removeObserver(_:)`](https://developer.apple.com/documentation/foundation/notificationcenter/1413994-removeobserver)（例如，在 MyObserver 的析构函数 **deinit** 手动注销）？

## 文档中的说明

基于 selector 形式的观察接口 [`addObserver(_:selector:name:object:)`](https://developer.apple.com/documentation/foundation/notificationcenter/1415360-addobserver) 的手动注销操作在 iOS 9 和 OSX 10.11 之后已经变成可选了。然而在 [Foundation 发布注意事项](https://developer.apple.com/library/archive/releasenotes/Foundation/RN-FoundationOlderNotes/index.html#10_11NotificationCenter)中明确表明 Block 形式的接口依然需要进行手动注销操作。

> 通过 `-[NSNotificationCenter addObserverForName:object:queue:usingBlock:_]` 形式添加的block类型观察者在无用时依然需要进行注销操作，因为系统会保留对该观察者的强引用。

该文档发布之后是否存在新变化呢？

在 [`addObserver(forName:object:queue:using:)`](https://developer.apple.com/documentation/foundation/notificationcenter/1411723-addobserver) 文档说明部分也明确指出了注销操作是必要的：

> 所有通过 `addObserver(forName:object:queue:using:)` 创建的观察者在析构之前都需要调用 [`removeObserver(_:)`](https://developer.apple.com/documentation/foundation/notificationcenter/1413994-removeobserver) 或者 [`removeObserver(_:name:object:)`](https://developer.apple.com/documentation/foundation/notificationcenter/1407263-removeobserver) 进行注销操作。

然而 [`removeObserver(_:)`](https://developer.apple.com/documentation/foundation/notificationcenter/1413994-removeobserver) 文档说明处似乎与之相反：

> 如果你的 APP 运行在 iOS 9 或者 macOS 10.11 及最新的版本上的话则不需要注销这个观察者在它的析构方法。

该文档中并没有对 selector 或者 block 进行区分说明，也就是说该操作同时适用于两者。

## 进行测试验证

通过我写的[测试应用](https://github.com/ole/NotificationUnregistering)，你可以得到验证上诉问题（通过 Xcode 的终端输出）。

下面是我发现的：

* 基于block 形式的观察者依然需要进行手动注销操作（即使在 iOS 11.2 上），所以 `removeObserver (_:)` 文档存在明显的误导。
* 如果没有进行注销操作的话，那么 block 就会被一直持有而且依然能够被相关通知触发执行。此时该行为对 APP 的潜在威胁取决于 block 内部持有的对象。
* 即使你在 *deinit* 中调用了注销操作，你依旧需要注意 block 中不能捕获 self 引用，否则会造成循环引用此时 *deinit* 也永远不会得到执行。

## 自动注销

处理这个问题最好的方式是什么呢？我的建议是：对观察对象进行一次封装。该封装类型的指责就是保持观察者对象并且在析构函数中自动将其注销。

    
    /// Wraps the observer token received from 
    /// NotificationCenter.addObserver(forName:object:queue:using:)
    /// and unregisters it in deinit.
    final class NotificationToken: NSObject {
        let notificationCenter: NotificationCenter
        let token: Any
    
        init(notificationCenter: NotificationCenter = .default, token: Any) {
            self.notificationCenter = notificationCenter
            self.token = token
        }
    
        deinit {
            notificationCenter.removeObserver(token)
        }
    }

通过封装处理，我们将观察者的生命周期和该类型实例进行了绑定。接下来我们只需要将该封装类型实例通过私有属性进行保存，那么其持有者就会 *deinit* 触发时销毁该封装实例紧接着销毁观察者实例对象。这样就不需要在代码中对其进行手动注销操作了。另外我们还可以将该实例声明为 `Optional <Notification​Token>` ，这样通过将其设置为 nil 也能进行手动注销操作。该模式被称为[ **资源获取即初始化** （RAII）](https://en.wikipedia.org/wiki/Resource_acquisition_is_initialization)。

接下来让我们为 `NotificationCenter` 编写一个便利点的方法，它为我们承担了包装观察接口的任务。 

    
    extension NotificationCenter {
        /// Convenience wrapper for addObserver(forName:object:queue:using:)
        /// that returns our custom NotificationToken.
        func observe(name: NSNotification.Name?, object obj: Any?, 
        queue: OperationQueue?, using block: @escaping (Notification) -> ())
        -> NotificationToken
        {
            let token = addObserver(forName: name, object: obj, queue: queue, using: block)
            return NotificationToken(notificationCenter: self, token: token)
        }
    }

如果此时将原有的 `addObserver(forName:​object:​queue:​using:)` 替换为新 API ，并将得到 *NotificationToken* 实例通过属性保存的话，你将不再需要手动注销操作了。

Chris 和 Florian 也在 [**Swift Talk episode 27: Typed Notifications**](https://talk.objc.io/episodes/S01E27-typed-notifications-part-1) 中提到过该技术，我向你强烈的推荐它。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。