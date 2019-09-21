iOS 10 本地通知教程"

> 作者：Arthur Knopper，[原文链接](https://www.ioscreator.com/tutorials/local-notification-tutorial-ios10)，原文日期：2016-10-11
> 译者：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；校对：[星夜暮晨](http://www.jianshu.com/users/ef1058d2d851)；定稿：[CMB](https://github.com/chenmingbiao)
  









当用户没有在前台使用某 App 的时候，通过本地通知（Local Notification）可以将消息推送给用户。iOS 10 里苹果公司引入了多信息通知 (rich notifications)，其中可以包含不同类型的媒体内容。在本节教程中，我们将创建一个本地通知，其中包含了一个图片消息。本节教程使用的是 Xcode 8 和 iOS 10。



打开 Xcode，创建一个 Single View Application。

![](https://swift.gg/img/articles/local-notification-tutorial-ios10/format=750w1500172091.55)

点击 Next，product name 一栏填写 **IOS10LocalNotificationTutorial**，填写好 Organization Name 和 Organization Identifier，Language 选择 Swift，Devices 选择 iPhone。

![](https://swift.gg/img/articles/local-notification-tutorial-ios10/format=750w1500172092.76)

找到 **Storyboard**，拖一个 Button 控件到主视图中，将其 title 改为 “Send Local Notification”。选中此 Button 控件，随后点击 Auto Layout 的 Align 按钮，选中其中的 Horizontally in Container 选项，然后在 "Update Frame" 的下拉选项中选择 "Item of New Constraints"，最后点击 "Add 1 Constraint"。

![](https://swift.gg/img/articles/local-notification-tutorial-ios10/format=300w1500172093.68)

接下来，依然选中 Button 控件，点击 Auto Layout 的 Pin 按钮，然后点击向上的竖线，在 "Update Frame" 的下拉选项中选择 "Item of New Constraints"，最后点击 "Add 1 Constraint"。

![](https://swift.gg/img/articles/local-notification-tutorial-ios10/format=300w1500172094.22)

在这时候 Storyboard 会是下图这个样子：

![](https://swift.gg/img/articles/local-notification-tutorial-ios10/format=500w1500172096.79)

打开 Assistant Editor，确保 **ViewController.swift** 文件可见，按住 Ctrl 键并同时拖拽 Button 按钮到 ViewController 类里，创建如下图所示的 Action。

![](https://swift.gg/img/articles/local-notification-tutorial-ios10/format=300w1500172097.26) 

找到 **ViewController.swift** 文件，更改 **viewDidLoad** 方法为如下所示：

    
    override func viewDidLoad() {
        super.viewDidLoad()  
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert]) { (success, error) in
            if success {
                print("success")
            } else {
                print("error")
            }
        }
    }
`UNUserNotificationCenter` 用以管理与通知相关的行为。如果想要使用通知的话，必须先获取用户的授权，才可使用 `requestAuthorization` 方法。

我们将一张图片作为通知的附件。从[这里](https://www.ioscreator.com/s/applelogo-flg3.png)下载这张图片，然后将其引入工程。接下来实现 `sendNotification` 方法。

    
    @IBAction func sendNotification(_ sender: AnyObject) {
        // 1
        let content = UNMutableNotificationContent()
        content.title = "Notification Tutorial"
        content.subtitle = "from ioscreator.com"
        content.body = " Notification triggered"
        
        // 2
        let imageName = "applelogo"
        guard let imageURL = Bundle.main.url(forResource: imageName, withExtension: "png") else { return }
            
        let attachment = try! UNNotificationAttachment(identifier: imageName, url: imageURL, options: .none)
            
        content.attachments = [attachment]
        
        // 3
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 10, repeats: false)
        let request = UNNotificationRequest(identifier: "notification.id.01", content: content, trigger: trigger)
        
        // 4  
        UNUserNotificationCenter.current().add(request, withCompletionHandler: nil)
        }

1. `UNMutableNotificationContent` 对象包含有通知当中的数据。
2. `UNNotificationAttachment` 对象包含有通知当中的媒体内容。
3. `UNNotificationRequest` 被创建成功后，将会在 10 秒内被触发。
4. 系统将会安排通知的传递。

**编译并运行**工程。这个时候会申请用户的授权。

![](https://swift.gg/img/articles/local-notification-tutorial-ios10/format=500w1500172098.67)

点击 Allow，然后点击 “Send Local Notification”按钮来安排通知，接着点击模拟器 Home 键（Shift + Command + H）回到屏幕主页。十秒之后接收到了本地通知。

![](https://swift.gg/img/articles/local-notification-tutorial-ios10/format=500w1500172099.96)

在 ioscreator 的 [github](https://github.com/ioscreator/ioscreator) 上可以下载到本节课程 **IOS10LocalNotificaitonTutorial** 的源代码。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。