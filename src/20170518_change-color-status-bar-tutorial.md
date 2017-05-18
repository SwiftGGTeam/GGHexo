title: "改变状态栏的颜色"
date: 2017-05-18
tags: [iOS 入门]
categories: [IOSCREATOR]
permalink: change-color-status-bar-tutorial
keywords: 状态栏 颜色
custom_title: 修改状态栏颜色
description: iOS 开发中如何改变状态栏的颜色

---
原文链接=https://www.ioscreator.com/tutorials/change-color-status-bar-tutorial
作者=Arthur Knopper
原文日期=2016/12/29
译者=Crystal Sun
校对=walkingway
定稿=CMB

<!--此处开始正文-->

状态栏可以有两种外观：dark（黑色） 和 light（白色）。在本章教程中，将学习如何改变状态栏的外观。本节教程使用的是 Xcode 8.0 和 iOS 10。

<!--more-->

打开 Xcode，创建一个 Single View Application。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58ff88928419c2b2a27d0754/1493141675229/single-view-xcode-template?format=1500w)

Product Name 使用 **IOS10StatusBarColorTutorial**，填写自己的 Organization Name 和 Organization Identifier，Language 一栏选择 Swift，Devices 一栏选择 iPhone。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57ea5a84e58c62718aa3048b/1474976400272/?format=1500w)

打开 Storyboard，选中 View，在 Attributes Inspetor 里将 Background Color 改成 Light Gray。运行工程，默认的状态栏颜色是黑色（dark）。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57ea5aa5e58c62718aa30530/1474976432868/?format=750w)

而我们想要实现的效果是白色的状态栏。打开 ViewController.swift 文件，添加下列代码：

```swift
override var preferredStatusBarStyle: UIStatusBarStyle {
    return .lightContent
}
```

上述代码将 UIStatusBarStyle 枚举项设为 lightContent。运行工程，这时状态栏的颜色变成了白色（light）。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57ea5ad8e58c62718aa3063d/1474976482842/?format=750w)

接下来回到 Storyboard，选中 View Controller，在 Editor 菜单中选择 Embed in Navigation Controller。选中 Navigation Bar，在 Attribute Inspector 里将 Bar Tint color 设置为 red。storyboard 应该如下图所示。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57eaaf88893fc08c39f02235/1474998157337/?format=1500w)

运行工程，状态栏又变成了黑色，也就是默认状态。产生这个问题的原因是，iOS 请求的是 navigation controller 状态栏风格，不是 navigation controller 所包含的 controller 风格。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57eab046bebafbd7890070a9/1474998347300/?format=750w)

为了改变 Navigation controller 的风格（style），需要在 **AppDelegate.swift** 文件里如下修改代码：

```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
    // Override point for customization after application launch.
        
    UINavigationBar.appearance().barStyle = .blackOpaque
    return true
}
```

运行工程，这时状态栏的颜色变成了白色。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57eab0ce37c581c584f0a3a9/1474998487766/?format=750w)

可以从 [github](https://github.com/ioscreator/ioscreator) 上下载 **IOS10StatusBarColorTutorial** 教程的源代码。