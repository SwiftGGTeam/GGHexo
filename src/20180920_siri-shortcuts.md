title: "iOS 12 中的 Siri Shortcuts 简介"
date: 2018-09-20
tags: [Swift]
categories: [AppCoda]
permalink: siri-shortcuts
keywords: Swift,Siri,Siri Shortcuts,Gregg Mojica
custom_title: iOS12 中的 Siri Shortcuts 简介
description: 本文介绍了基于 iOS12 和 XCode10 创建 NSUserActivity 将示例应用支持 Siri Shortcuts，并在设置中自定义 Siri 短语以唤起应用触发事件。

---
原文链接=https://appcoda.com/siri-shortcuts/
作者=AppCoda
原文日期=2018-07-11
译者=Hale
校对=liberalisman,numbbbbb
定稿=Forelax

<!--此处开始正文-->

在美国圣何塞举办的 2018 开发者大会上，苹果公布了 Siri Shortcuts，这是一个令人期待已久的功能，开发人员能够在自己的应用程序中扩展和增强 Siri 的功能。在这之前，SiriKit SDK 的功能非常有限。随着 Siri Shortcuts 的出现，开发人员可以扩展 Siri 的功能并通过构建自定义语音操作来唤起应用程序。

<!--more-->

## Siri Shortcuts 简史
Siri Shortcuts 的核心是自动化。Siri Shortcuts 是由前 WWDC 奖学金获得者开发的 iOS 自动化应用程序 Workflow 演变而来的。苹果在2017年收购了 Workflow，但出乎意料的是，即便在收购之后，该应用依然独立的在 App Store 上线。

![](https://appcoda.com/wp-content/uploads/2018/07/workflow-app.jpg)

> Shortcuts 让你可以将应用程序的功能暴露给 Siri。

Apple 全新的 Siri Shortcuts 大量借鉴了 Workflow。但是区分语音 Shortcuts 短句与 Shortcuts 应用本身还是很重要的。Shortcuts 应用允许用户基于语音短句创建常见的日常任务，Siri Shortcuts 使开发人员能够在自己的原生应用程序中扩展 Siri 的功能。

在撰写本文时，Shortcuts 应用程序 无法在 iOS 12 Beta 2 Build 中进行测试。那么，我们将在自己构建的自定义应用程序中探索 Siri Shortcuts 的实用功能。

## 我们的示例工程
> 注意：本教程假定你基本熟悉 NSUserActivity API。如果你不熟悉，请参阅我们关于此主题的 [优秀教程](https://www.appcoda.com/core-spotlight-framework/)。

在本教程中，我们将探究如何在一个简单的项目中利用 Siri Shortcuts，在用户说出 “Say Hi” 之类的短语时启动我们的应用程序并展示出一个 UIAlertView。

此应用程序简单概述了如何在一个大型项目中不增加复杂代码的前提下集成 Siri Shortcuts。在本教程结束时，你应该扎实掌握 Siri Shortcuts 背后的用例和技术，并了解如何将它们与你的应用程序集成！

## 在新项目中定义你的 Shortcuts

当我们在创建任意新项目时，花一些时间来建立基本的项目结构是很重要的。首先我们需要有 iOS 12，macOS Mojave 和 Xcode 10 的最新开发人员预览版。如果你还没有安装这些，你可以从 [开发者网站](https://developer.apple.com/) 下载安装。

在 Xcode 创建一个名为 *SiriShortcuts* 的应用程序。将组织 ID 设置为 `com.appcoda`，这些后期可以按需修改。

![](https://appcoda.com/wp-content/uploads/2018/07/2-1240x793.png)

如下所示，在项目的 *Project Settings* 中选择 *Capabilities*，启用 Siri。接下来我们就可以在应用程序中使用 Siri SDK，并将 .entitlements 文件添加到项目中。

![](https://appcoda.com/wp-content/uploads/2018/07/4-1240x793.png)

启用 S​​iri 后，Xcode 会将 `.entitlements` 文件添加到项目里。然后将 `Intents.framework` 这个全新的框架加入到项目中。

![](https://appcoda.com/wp-content/uploads/2018/07/7-1240x793.png)

最后，在 `Info.plist` 中添加 `NSUserActivityTypes`。该项的值应该包含你的 Bundle ID 以及唤醒 Siri 的行为 ，例如 “sayHi”。

![](https://appcoda.com/wp-content/uploads/2018/07/8-1240x775.png)

## 集成 Shortcut
> 要创建一个 Shortcut 应用，我们首先配置 Shortcut，然后将 Shortcut 集成到项目中

现在我们的项目已经完成了所有 Shortcut 的配置工作，是时候将 Shortcut 集成到项目中了。

根据 Apple 开发者文档，

> 每次用户在你的应用中执行操作时，你都应该进行一次 Shortcut 集成。例如，用户可以使用你的应用从餐厅订购汤，请在用户下订单后为支付操作进行 Shortcut 集成。如果用户未在你的应用中执行操作，则不需要进行集成操作。

显然，只有在提供有意义的用例时我们才需要集成 Shortcut，从而增强应用程序的整体功能。

回到代码中，首先我们前往 `ViewController.swift` 文件。在 `viewDidLoad` 方法之后，创建一个名为 `setupIntents` 的新方法。在此方法中，实现我们的 Siri Shortcuts 代码。

```swift
func setupIntents() {
        let activity = NSUserActivity(activityType: "com.AppCoda.SiriSortcuts.sayHi") // 1
        activity.title = "Say Hi" // 2
        activity.userInfo = ["speech" : "hi"] // 3
        activity.isEligibleForSearch = true // 4
        activity.isEligibleForPrediction = true // 5
        activity.persistentIdentifier = NSUserActivityPersistentIdentifier(rawValue: "com.AppCoda.SiriSortcuts.sayHi") // 6
        view.userActivity = activity // 7
        activity.becomeCurrent() // 8
    }
```

让我们来看看这段代码做了什么。

* 第一行，我们创建了 NSUserActivity 实例并将我们在 `Info.plist` 文件中定义的标识符赋值给 activityType。

* 第二行，我们定义了 Activity 的标题。（会应用在设置中心和 Spotlight 的搜索中。如果你对 NSUserActivity 以及 spotlight 搜索索引的工作方式不是很熟悉，我建议你阅读我们关于这个主题的其他教程。）

* 第三行，我们添加了一个 `userInfo` 字典。根据 Apple 的说法， userInfo 字典包含了在另一台设备上继续活动所需的与应用程序相关的状态信息。

* 下一步，我们设置 `.isEligibleForSearch` 参数为 `true` 然后在下一行启用 `isEligibleForPrediction`。这两个属性允许 iOS 在设备上为我们的 NSUserActivity 提供搜索和建议。

* 接下来，我们将 `persistentIdentifier` 属性设置为 NSUserActivityPersistentIdentifier 的实例，此实例用与第一行相同的标识符进行构造。

* 最后，我们将上面创建的 activity 实例赋值给视图的 `userActivity` 属性，并调用 `becomeCurrent()` 方法来激活我们的 Activity。


我们再创建另一个名为 `sayHi()` 的方法并粘贴以下代码。此代码创建一个 UIAlertController 以显示消息。

```swift
public func sayHi() {
        let alert = UIAlertController(title: "Hi There!", message: "Hey there! Glad to see you got this working!", preferredStyle: UIAlertController.Style.alert)
        alert.addAction(UIAlertAction(title: "OK", style: UIAlertAction.Style.default, handler: nil))
        self.present(alert, animated: true, completion: nil)
    }
```

上述方法很简单，主要用于说明 Siri Shortcuts 是如何工作的。另外需要注意这是一个 **public** 函数，因为我们需要在视图控制器的作用域之外使用它。

## 公开 Activity

现在，你已经在 `ViewController.swift` 设置了基本功能，切换到 `AppDelegate.swift` 文件并添加 `application(_:continueUserActivity:restorationHandler)` 方法，如下所示。

```swift
func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    let viewController = window?.rootViewController as! ViewController
  viewController.sayHi()
  return true
}
```

上述代码将我们新创建的 Activity 公开在应用委托方法中并允许 Siri 对此 Activity 进行操作唤起应用。

现在让我们试试看！导航到“设置”应用并选择 Siri。你应该看到一个名为 ”Say Hi” 的新快捷方式。单击 `+` 按钮添加它，然后按照屏幕上的提示创建自定义语音短语以创建此快捷方式。

现在你可以唤起 Siri 并说出你的短语，体验 Shortcut！

![](https://appcoda.com/wp-content/uploads/2018/07/i-1.png)

![](https://appcoda.com/wp-content/uploads/2018/07/i-2.png)

![](https://appcoda.com/wp-content/uploads/2018/07/i-3.png)

![](https://appcoda.com/wp-content/uploads/2018/07/i-4.png)

![](https://appcoda.com/wp-content/uploads/2018/07/i-5.png)

## 总结

正如你所见，在项目中使用 NSUserActivity 可以很容易地实现 Siri Shortcuts 的强大功能。在本教程中,我创建了一个基础的应用，同样的你也可以将这些技术应用到你自己的应用中。Siri Shortcuts 的使用场景还有很多，相信开发者们会以更创新和独特的方式来使用这项新技术。
