3D Touch介绍：电子秤App与快捷操作"

> 作者：Maxime Defauw，[原文链接](http://www.appcoda.com/3d-touch-tutorial/)，原文日期：2015-11-09
> 译者：[saitjr](http://www.saitjr.com)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[numbbbbb](http://numbbbbb.com/)
  









随着 iPhone6s 与 6s plus 的到来，苹果给我们展现了一种全新的交互方式：重按手势。你可能知道，这个特性已经在 Apple Watch 和 MacBook 上推出了，不过那时叫 Force Touch，就是字面上的意思，给用户的交互添加一种新的维度。

如果你很好奇 iPhone 的 Force Touch 为啥要更名为 3D Touch，那告诉你吧，you're not alone（译者注：请用 MJ 的调子唱出来…）。不久前，之前也对这名字纠结不已的 Craig Federighi（译者注：Apple 高级副总裁）介绍了这个新特性，第一条微博就这样产生了。也不知道 Force Touch 这名字有啥不好的，就因为有太多星球大战的梗？（译者注：其实我不知道这梗...）（校对注：译者是个妹子）（定稿注：还是单身）



但是，Force Touch 和 3d Touch 确实不一样！Force Touch 只能识别重按。这方面 3D Touch 要灵敏多了，它能够识别按压的力度。

虽然说，这点不同看起来无足轻重，但是这使开发者能开发更多精确计量方面的 App。比如这一款名为[Gravity](https://medium.com/swlh/turning-the-iphone-6s-into-a-digital-scale-f2197dc2b6e7)的应用，它利用 Force Touch 让你的 iPhone 成为了一个电子秤。虽然这款 App 被 Apple 拒了，但是这创意简直太棒了。为了展示 3D Touch 的工作流程，我们来做一个简单的 App。

先去下载这个[初始案例](https://www.dropbox.com/s/i3xwostpd87rqci/ScaleStarter.zip?dl=0)。初始案例中只有一个空的 Single View。我在里面创建了 App 必要的 UI 元素（`UILabel`和`UIImage`），并关联了`ViewController.swift`。

![](https://www.appcoda.com/wp-content/uploads/2015/11/3dtouch-storyboard.png)

这个 App 的设计很简单：ViewController 上有两个 Label：一个标题和一个显示按压百分比的文本。

那...开始写代码吧！在 iPhone6s 和 6s Plus 上，`UITouch`对象多了两个`CGFloat`类型的属性，分别是`force`和`maximumPossibleForce`。`force`表示按得有多重，`1.0`表示常规状态的值。`maximumPossibleForce`表示能承受的最大压力值。

无论什么情况，当用户触摸屏幕时，`touchesBegan`方法会被调用，接着就是`touchesMoved`（如果用户手指在屏幕上滑动，那么`touchedCancelled`与`TouchesEnded`也会被调用）。在这个App中，我们只需要关注`touchesMoved`方法。`touchesMoved`有两个参数：`touches`和`event`。`touches`是一个装着`UITouch`对象的`NSSet`类型集合（集合无序，并且无重复）。我们必须要确保在`touches`中只有一个`UITouch`对象，但也有考虑不完全的时候，所以强烈建议大家先利用可选绑定来判断`touches.first`（`touches`中的第一个`UITouch`对象）是否是空。在`ViewController.swift`中添加以下代码：

    
    override func touchesMoved(touches: Set<UITouch>, withEvent event: UIEvent?) {
        if let touch = touches.first {
            if #available(iOS 9.0, *) {
                if traitCollection.forceTouchCapability == UIForceTouchCapability.Available {
                    // 3D Touch capable
                }
            }
        }
    }

在这个`if`判断中，还需要添加判断当前设备是否支持 3D Touch 的代码。如果你只是做来玩，那就没必要验证。但是，如果是要上架的 App，那就必须要判断，毕竟像 iPhone6 这些旧设备不支持 3D Touch。

除此之外，我还使用了`#available`语句（Swift 2.0）对当前系统是否是 iOS9+ 做了判断。（如果你想学习更多 Swift 2.0 相关的知识，我就更加推荐你阅读这篇文章了。）同样，如果你的编译环境是 iOS9.0+，那么这个判断可以省略。

要得到按压百分比？那太简单了，只需要用`force`属性除以`maximumPossibleForce`就可以了（例如：`touch.maximumPossibleForce`），`maximumPossibleForce`表示能承受的最大压力值。然后，更新文本：

    
    override func touchesMoved(touches: Set<UITouch>, withEvent event: UIEvent?) {
        if let touch = touches.first {
            if #available(iOS 9.0, *) {
                if traitCollection.forceTouchCapability == UIForceTouchCapability.Available {
                    // 3D Touch capable
                    let force = touch.force/touch.maximumPossibleForce
                    forceLabel.text = "\(force)% force"
                }
            }
        }
    }

如果你在 iPhone6s/6s Plus 上跑这个程序，按屏幕时就能看到压力百分比了。但是，其实我们更想知道放在 iPhone 上物体的重量，而不是百分比。根据[Ryan McLeod](https://medium.com/swlh/turning-the-iphone-6s-into-a-digital-scale-f2197dc2b6e7)的 App 可以知道，传感器的计量范围的最大值是 385g。因此，`maximumPossibleForce`就相当于 385g（相当于3.8N）。通过简单的计算，就可以把压力百分比转为克。需要做的仅仅是用百分比*385。对于重于 385g 的物体，就把  label 改成类似于“385+ grams”这样的文本好了。

到此，`touchesMoved`方法中的代码更新为：

    
    override func touchesMoved(touches: Set<UITouch>, withEvent event: UIEvent?) {        
        if let touch = touches.first {
            if #available(iOS 9.0, *) {
                if traitCollection.forceTouchCapability == UIForceTouchCapability.Available {
                    if touch.force >= touch.maximumPossibleForce {
                        forceLabel.text = "385+ grams"
                    } else {
                        let force = touch.force/touch.maximumPossibleForce
                        let grams = force * 385
                        let roundGrams = Int(grams)
                        forceLabel.text = "\(roundGrams) grams"
                    }
                }
            }
        }
    }

然后...你就有了一个电子秤 App...

![](https://www.appcoda.com/wp-content/uploads/2015/11/3d-touch-scale-app-492x1024.png)

还有一个小问题：当物体或者触摸事件结束之后，文本没有重置。你可以实现`touchesEnded`方法来达到效果：

    
    override func touchesEnded(touches: Set<UITouch>, withEvent event: UIEvent?) {
        forceLabel.text = "0 gram"
    }

## 主屏幕上的快捷操作

另一个 3D Touch 的用法是主屏幕上的快捷操作。快捷操作可以让用户从快捷方式直接跳转到 App 的某个地方。按压 App icon 快捷方式就会出现。在介绍 3D Touch 的时候，Twitter、Instagram 等 App 就展示了这个新特性。

![](https://www.appcoda.com/wp-content/uploads/2015/11/3d-touch-quick-action.png)

让我们来给刚才的电子秤 App 添加一个快捷操作吧（把白色背景换成蓝色）。要添加快捷操作，先打开工程目录中的`info.plist`（在导航栏上点击工程名，在`TARTGET`中找到`info`选项卡）。在这个文件中，添加`UIApplicationShortcutItems`数组。数组中的元素是包含一个快捷操作配置的字典：

-   `UIApplicationShortcutItemType `(必填)：快捷操作的**唯一**标识符（String 类型）。建议将 bundle ID 或者其他唯一字符串作为标识符前缀。
-   `UIApplicationShortcutItemTitle`（必填）：相当于快捷操作的 title（String 类型），用户可以看到。例如“显示最近一张照片”之类的文本。
-   `UIApplicationShortcutItemSubtitle`（可选）：快捷操作的副标题（String 类型）。例如“昨天拍摄的照片”。如果你想要给快捷操作添加一个 icon，可以自定义，也可以使用系统自带的。
-   `UIApplicationShortcutItemIconType`（可选）：表示你要选择哪种系统图标作为快捷操作的 icon（String 类型）。
-   `UIApplicationShortcutItemIconFile`（可选）：表示给快捷操作添加自定义 icon（String 类型）。
-   `UIApplicationShortcutItemUserInfo`（可选）：在快捷操作交互时传递的额外信息（译者注：类似于通知的 UserInfo 参数）（Dictionary 类型）。

在这个数组中，我们将会给自定义的快捷操作添加 4 个配置。然后，你的`info.plist`文件看起来应该是这样滴：

![](https://www.appcoda.com/wp-content/uploads/2015/11/3d-touch-infoplist-600x102.png)

>       >   注意，我用到了`$(PRODUCT_BUNDLE_IDENTIFIER)`来代替`com.appcoda.Scale`（就是替代的 bundle ID）。这是出于安全考虑：无论在什么情况下，如果我在`General`中修改了 bundle ID，那整个工程的 bundle ID 就都变了，这势必会给项目带来不晓得影响。这样的话，我就需要手动去修改每个 bundle ID。在`info.plist`里面可以看到，其实每个 Bundle Identifier 配置项都是用的`$(PRODUCT_BUNDLE_IDENTIFIER)`来表示 bundle ID 在工程中的路径。
    >

最后一件事，就是实现用户触发快捷操作的处理流程。快捷方式需要在`AppDelegate.swift`的`performActionForShortcutItem`方法中处理。当使用快捷操作启动时，这个方法会被调用。所以，实现这个方法，并在方法中处理快捷操作：

    
    func application(application: UIApplication, performActionForShortcutItem shortcutItem: UIApplicationShortcutItem, completionHandler: (Bool) -> Void) {
    
        // Handle quick actions
        completionHandler(handleQuickAction(shortcutItem))
    
    }

这个方法需要调用`completionHandler`，并传入布尔值，这个布尔值取决于快捷操作成功与否。这里我们封装了一个`handleQuickAction`方法来处理快捷方式。如果有多个快捷操作，最好的方式是使用枚举，`UIApplicationShortcutItemType`作为枚举的`rawValue`（译者注：对枚举不熟悉可以参考[这篇文章](http://wiki.jikexueyuan.com/project/swift/chapter2/08_Enumerations.html)）。定义一个枚举，并实现`handleQuickAction`方法，在方法中修改背景色为蓝色。

    
    enum Shortcut: String {
        case openBlue = "OpenBlue"
    }
    
    func handleQuickAction(shortcutItem: UIApplicationShortcutItem) -> Bool {
    
        var quickActionHandled = false
        let type = shortcutItem.type.componentsSeparatedByString(".").last!
        if let shortcutType = Shortcut.init(rawValue: type) {
            switch shortcutType {
            case .openBlue:
                self.window?.backgroundColor = UIColor(red: 151.0/255.0, green: 187.0/255.0, blue: 255.0/255.0, alpha: 1.0)
                quickActionHandled = true
            }
        }
    
        return quickActionHandled
    }

一切都是这么简单。现在把程序跑起来，使用快捷操作来启动 App，就可以看到背景已经是蓝色了。

![](https://www.appcoda.com/wp-content/uploads/2015/11/3d-touch-scale-blue.png)

## 还有一件事

还有一个问题你别忘了...在程序启动顺序方面，**启动**程序和使用快捷操作**唤醒**是有区别的。我们都知道，程序启动会调用`willFinishLaunchingWithOptions`和`didFinishLaunchingWithOptions`方法。但是当使用快捷操作唤醒时，只会触发`performActionForShortcutItem`方法（译者注：这就意味着，使用快捷操作来**启动**会走三个方法，而使用快捷操作**唤醒**只会走一个，具体的方法列表如下图）。

![](https://www.appcoda.com/wp-content/uploads/2015/11/3d-touch-quickaction-methods.png)

如果你回头看`didFinishLaunchingWithOptions`方法，会发现里面我写了一行设置背景色为白色的代码。这个是在直接启动程序时用的。

    
    func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions:
        [NSObject: AnyObject]?) -> Bool {
        // Override point for customization after application launch.
        self.window?.backgroundColor = UIColor.whiteColor()
    
        return true
    }

问题来了：当使用快捷操作唤醒程序时，`willFinish`，`didFinish`和`performActionForShortcutItem`都会被调用。所以背景色会先设置成白色，接着又被设置成了蓝色。显然你不想在使用快捷操作启动时，背景色被设置成白色。

要解决这个问题，我们需要在`didFinishLaunchingWithOptions`方法的实现中添加条件判断：

    
    func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions:
        [NSObject: AnyObject]?) -> Bool {
        print("didFinishLaunchingWithOptions called")
        var isLaunchedFromQuickAction = false
    
        // Check if it's launched from Quick Action
        if let shortcutItem = launchOptions?[UIApplicationLaunchOptionsShortcutItemKey] as? UIApplicationShortcutItem {
    
            isLaunchedFromQuickAction = true
            // Handle the sortcutItem
            handleQuickAction(shortcutItem)
        } else {
            self.window?.backgroundColor = UIColor.whiteColor()
        }
    
        // Return false if the app was launched from a shortcut, so performAction... will not be called.
        return !isLaunchedFromQuickAction
    }

通过判断可选值的`UIApplicationLaunchOptionsShortcutItemKey`得到用户是否是通过快捷操作启动。`UIApplicationShortcutItem`可以作为可选值的类型。如果程序是通过快捷操作启动的，我们可以直接调用`handleQuickAction`方法将背景色改为蓝色。

因为我们已经在`didFinishLaunchingWithOption`方法中调用了`handleQuickAction`，所以没必要再在`performActionForShortcutItem`方法中调用一次。所以最后我们返回了一个`false`，告诉系统不要再去调用`performActionForShortcutItem`方法。

再次运行程序！完美！

## 最后

3D Touch 是给程序添加另一种交互方式的好方法。但是你还是不要忘了，目前还不是所有设备都支持 3D Touch。

通过这篇文章，你应该能给你的 App 添加快捷操作，也能计量按压力度了。

顺便，你可以在[这里](https://www.dropbox.com/s/yf8nkupi9yt01hk/ScaleFinal.zip?dl=0)下载程序的最终版。同样，欢迎大家留言。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。