title: "iOS 10 本地通知教程"
date: 2017-01-04
tags: [iOS 入门, Swift 入门]
categories: [IOSCREATOR]
permalink: local-notification-tutorial-ios10
keywords: 本地通知
custom_title: 
description: 

---
原文链接=https://www.ioscreator.com/tutorials/local-notification-tutorial-ios10
作者=Arthur Knopper
原文日期=2016-10-11
译者=Crystal Sun
校对=星夜暮晨
定稿=CMB

<!--此处开始正文-->

当用户没有在前台使用某 App 的时候，通过本地通知（Local Notification）可以将消息推送给用户。iOS 10 里苹果公司引入了多信息通知 (rich notifications)，其中可以包含不同类型的媒体内容。在本节教程中，我们将创建一个本地通知，其中包含了一个图片消息。本节教程使用的是 Xcode 8 和 iOS 10。

<!--more-->

打开 Xcode，创建一个 Single View Application。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57f9545115d5dbb87f6fc4a5/1475957853618/?format=750w)

点击 Next，product name 一栏填写 **IOS10LocalNotificationTutorial**，填写好 Organization Name 和 Organization Identifier，Language 选择 Swift，Devices 选择 iPhone。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57f9548e15d5dbb87f6fc6fc/1475957914544/?format=750w)

找到 **Storyboard**，拖一个 Button 控件到主视图中，将其 title 改为 “Send Local Notification”。选中此 Button 控件，随后点击 Auto Layout 的 Align 按钮，选中其中的 Horizontally in Container 选项，然后在 "Update Frame" 的下拉选项中选择 "Item of New Constraints"，最后点击 "Add 1 Constraint"。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57f954d3893fc0a155a434dc/1475957982088/?format=300w)

接下来，依然选中 Button 控件，点击 Auto Layout 的 Pin 按钮，然后点击向上的竖线，在 "Update Frame" 的下拉选项中选择 "Item of New Constraints"，最后点击 "Add 1 Constraint"。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57f954ee893fc0a155a435bd/1475958007199/?format=300w)

在这时候 Storyboard 会是下图这个样子：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57f95607414fb528b40cf21d/1475958290955/?format=500w)

打开 Assistant Editor，确保 **ViewController.swift** 文件可见，按住 Ctrl 键并同时拖拽 Button 按钮到 ViewController 类里，创建如下图所示的 Action。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57f9565303596eb277bb66a8/1475958364882/?format=300w) 

找到 **ViewController.swift** 文件，更改 **viewDidLoad** 方法为如下所示：

```swift
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
```
`UNUserNotificationCenter` 用以管理与通知相关的行为。如果想要使用通知的话，必须先获取用户的授权，才可使用 `requestAuthorization` 方法。

我们将一张图片作为通知的附件。从[这里](https://www.ioscreator.com/s/applelogo-flg3.png)下载这张图片，然后将其引入工程。接下来实现 `sendNotification` 方法。

```swift
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
```

1. `UNMutableNotificationContent` 对象包含有通知当中的数据。
2. `UNNotificationAttachment` 对象包含有通知当中的媒体内容。
3. `UNNotificationRequest` 被创建成功后，将会在 10 秒内被触发。
4. 系统将会安排通知的传递。

**编译并运行**工程。这个时候会申请用户的授权。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57f9596937c581448910d121/1475960097101/?format=500w)

点击 Allow，然后点击 “Send Local Notification”按钮来安排通知，接着点击模拟器 Home 键（Shift + Command + H）回到屏幕主页。十秒之后接收到了本地通知。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57f95d3329687f4dc6d5d5cd/1475960128717/?format=500w)

在 ioscreator 的 [github](https://github.com/ioscreator/ioscreator) 上可以下载到本节课程 **IOS10LocalNotificaitonTutorial** 的源代码。