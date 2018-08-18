title: "iOS 12 中的 Siri Shortcuts 简介"
date: 2018-08-18
tags: Swift
categories: Gregg Mojica
permalink: siri-shortcuts
keywords: Swift,Siri,Siri Shortcuts,Gregg Mojica,iOS12,Xcode10
custom_title: iOS12 中的 Siri Shortcuts 简介
description: 本文介绍了基于 iOS12 和 XCode10 创建 NSUserActivity 将示例应用支持 Siri Shortcuts，并在设置中自定义 Siri 短语以唤起应用触发事件。

---
原文链接=https://appcoda.com/siri-shortcuts/
作者=Gregg Mojica
原文日期=2018-07-11
译者=Hale
校对=
定稿=

在美国圣何塞举办的 2018 开发者大会上，苹果公布了 `Siri Shortcuts`，这是一个令人期待已久的功能，这使得开发人员能够在自己的应用程序中扩展和增强 `Siri` 的功能。在这之前，`SiriKit SDK` 的功能非常有限。随着 `Siri Shortcuts` 的出现，开发人员可以扩展 `Siri` 的功能并通过构建自定义语音操作来唤起应用程序。

# Siri Shortcuts 简史
`Siri Shortcuts` 的核心是自动化。`Siri Shortcuts` 是由前 WWDC 学者构建的 iOS 自动化应用程序 `Workflow` 演变而来的。苹果在2017年收购了 `Workflow`，正由于这不寻常的举动，在收购之后，该应用就一直在 App Store 上线。

![](https://appcoda.com/wp-content/uploads/2018/07/workflow-app.jpg)

> Shortcuts 让你可以将你应用程序的功能暴露给 Siri。

今天，Apple 的新 `Siri Shortcuts` 应用程序大量借鉴了 `Workflow` 应用程序。但是，区分 `Siri Shortcuts` 与 `Shortcuts 应用程序`非常重要。虽然 `Shortcuts 应用程序`允许用户为常见的日常任务创建基于语音的短语，但 `Siri Shortcuts` 使开发人员能够在自己的原生应用程序中扩展 `Siri` 的功能。

在撰写本文时，`Shortcuts 应用程序`无法在 iOS 12 Beta 2 Build 中进行测试。那么，我们将在自己构建的自定义应用程序中探索 `Siri Shortcuts` 的实用功能。

# 我们的示例工程
> 注意：本教程假定你基本熟悉 `NSUserActivity API`。如果你不熟悉，请参阅我们关于此主题的[优秀教程](https://www.appcoda.com/core-spotlight-framework/)。

在本教程中，我们将探讨如何在一个简单的基本项目中利用 `Siri Shortcuts`，让用户说出 “Say Hi” 之类的短语时启动我们的应用程序并呈现出一个 `UIAlertView`。

此应用程序的目的是提供如何在应用程序中集成 `Siri Shortcuts` 的简单概述，而不会增加大型项目的复杂代码。在本教程结束时，你应该扎实掌握 `Siri Shortcuts` 背后的用例和技术，并了解如何将它们与你的应用程序集成！

# 在新项目中定义你的 Shortcuts

创建任意新项目时，首先花一点时间来建立基本的项目结构是很重要的。首先，请确保你拥有 `iOS 12`，`macOS Mojave`  和 `Xcode 10` 的最新开发人员预览版。如果你没有这些工具，则无法运行本教程中的代码，因为 `Siri Shortcuts` 是 `Xcode 10` 和 `iOS 12 beta` 中引入的新 API。如果你是注册的苹果开发者，你可以从[开发者网站](https://developer.apple.com/)下载这些内容。

启动 Xcode 并创建一个新的单一视图应用程序，键入名称 SiriShortcuts（或你想要的任何名称）。我们将 `com.appcoda` 作为组织标识符，你也可以随意将其更改为你自己的组织标识符。完成后，单击“创建”以加载 Xcode 项目。

![](https://appcoda.com/wp-content/uploads/2018/07/2-1240x793.png)

首先，导航到 Xcode 项目的 `Project Settings` 部分，选择 `Capabilities`，并向下滚动，确保启用 Siri，如下所示。这将允许我们在应用程序中使用 Siri SDK，并将 `.entitlements` 文件添加到项目中。

![](https://appcoda.com/wp-content/uploads/2018/07/4-1240x793.png)

启用 `S​​iri` 后，Xcode 会将 `.entitlements` 文件添加到你的项目中。接下来，我们将导航到项目构建设置的 General 选项卡，滚动到底部，然后选择 `Linked Frameworks` 和 `Libraries`。确保单击此处的 + 按钮添加框架。搜索 `Intents.framework`，选择后，按“添加”按钮。这将允许我们在应用程序中使用新的 `Intents` 框架。

![](https://appcoda.com/wp-content/uploads/2018/07/7-1240x793.png)

最后，导航到 `Info.plist` 文件并添加带有键值对的 `NSUserActivityTypes` 字典。该项的首选值应包括你的包标识符以及 “sayHi” 之类的附加值。

![](https://appcoda.com/wp-content/uploads/2018/07/8-1240x775.png)

# 捐献 Shortcut
> 要创建 `Shortcut`，首先要定义 `Shortcut` 然后再捐献 `Shortcut`

现在我们的项目都已经定义了 `Shortcut`，现在是时候开始编码了！为了通过 `Siri` 向我们的用户提供我们的 `Shortcut`，我们利用了一个名为`“捐献 Shortcut”`的流程。

根据 Apple 官方开发者文档，

> 每次用户在你的应用中执行操作时，你都应该捐献一个 `Shortcut`。例如，如果用户可以使用你的应用从餐厅订购汤，请在用户下订单后为订单汤操作捐献 `Shortcut`。不要为用户未在你的应用中完成的操作捐献；如果用户从未下过汤的订单，则不应该为订单汤操作捐献 `Shortcut`。

显然，捐赠只应在提供有意义的用例时使用，并且可以增强应用程序的整体功能。

好的，回到编码！

前往 `ViewController.swift` 文件。在 `viewDidLoad` 方法之后，创建一个名为 `setupIntents` 的新方法。在此方法中，我们将包含我们的 `Siri Shortcuts` 代码。

```
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

好的，让我们来看看这段代码中发生了什么。

* 在第一行，我们创建了 `NSUserActivity` 实例并将 `activityType` 参数分配给我们在 `Info.plist` 文件中定义的标识符。

* 在第二行，我们定义了 `Activity` 的标题（会显示在设置和 `Spotlight` 搜索中。如果你对 `NSUserActivity` 以及 `spotlight` 搜索索引的工作方式不是很熟悉，我建议你阅读我们关于这个主题的其他教程。）

* 在第三行，我们添加了一个 `userInfo` 字典。根据 Apple 的说法， userInfo 字典包含了在另一台设备上继续活动所需的特定于应用程序的状态信息。

* 下一步，我们设置 `.isEligibleForSearch` 参数为 `true` 然后在下一行启用 `isEligibleForPrediction`。这两个属性允许 iOS 在设备上搜索和建议我们的 `NSUserActivity`。

* 接下来，我们将 `persistentIdentifier` 属性设置为 `NSUserActivityPersistentIdentifier` 的实例，并将`rawValue` 属性分配给之前的标识符。

* 最后，我们将此视图的 `userActivity` 属性分配给我们刚刚创建的 `Activity`，并调用 `becomeCurrent()` 方法来激活我们的 `Activity`。


创建另一个名为 `sayHi()` 的方法并粘贴以下代码。此代码设置一个 `UIAlertController` 以显示消息。

```
public func sayHi() {
        let alert = UIAlertController(title: "Hi There!", message: "Hey there! Glad to see you got this working!", preferredStyle: UIAlertController.Style.alert)
        alert.addAction(UIAlertAction(title: "OK", style: UIAlertAction.Style.default, handler: nil))
        self.present(alert, animated: true, completion: nil)
    }
```

虽然上述方法非常基础，但它足以说明 `Siri Shortcuts` 的使用方法。重要的是要注意这是一个公共函数，因为我们需要在视图控制器的范围之外使用它。

# 公开 Activity

现在你已经在 `ViewController.swift` 设置了基本功能，切换到 `AppDelegate.swift` 文件并添加 `application(_:continueUserActivity:restorationHandler) ` 方法，如下所示。

```
func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    let viewController = window?.rootViewController as! ViewController
  viewController.sayHi()
  return true
}
```

上述代码将我们新创建的 `Activity` 公开在应用委托方法中并允许 `Siri` 对此 `Activity` 进行操作以启动应用（如果未启动）。 

好的，现在让我们试试看！导航到“设置”应用并选择 `Siri`。你应该看到一个名为“Say Hi”的新快捷方式。单击 + 按钮添加它，然后按照屏幕上的提示创建自定义语音短语以调用此快捷方式。

一旦你完成，唤起 `Siri` 并说出你的短语！

![](https://appcoda.com/wp-content/uploads/2018/07/i-1.png)

![](https://appcoda.com/wp-content/uploads/2018/07/i-2.png)

![](https://appcoda.com/wp-content/uploads/2018/07/i-3.png)

![](https://appcoda.com/wp-content/uploads/2018/07/i-4.png)

![](https://appcoda.com/wp-content/uploads/2018/07/i-5.png)

# 完结

正如你所见，在项目中使用 `NSUserActivity` 可以很容易地发挥 `Siri Shortcuts` 的强大功能。在本教程中,我创建了一个基础的应用你可以将这些技术应用到你自己的应用中。正如你所见，这里的可能性是无穷无尽的，之后开发者们会不断以创造性和独特的方式利用这项新技术。
