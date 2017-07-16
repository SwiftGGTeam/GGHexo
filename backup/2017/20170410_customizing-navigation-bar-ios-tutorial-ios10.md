title: "自定义 Navigation Bar 的属性"
date: 2017-04-10
tags: [IOSCREATOR]
categories: [IOSCREATOR]
permalink: customizing-navigation-bar-ios-tutorial-ios10
keywords: 
custom_title: 
description: 

---
原文链接=https://www.ioscreator.com/tutorials/customizing-navigation-bar-ios-tutorial-ios10
作者=Arthur Knopper
原文日期=2017-03-06
译者=Crystal Sun
校对=walkingway
定稿=CMB

<!--此处开始正文-->

众所周知，Navigation Bar 的外观可以进行自定义，在本节教程中，将介绍如何改变其背景颜色、tint 颜色，以及给 Navigation Bar 添加图片。本节教程使用 Xcode 8.2.1 和 iOS 10.2。

<!--more-->

打开 Xcode，创建一个 Single View Application。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58bc7cdd15d5db65360fdee8/1488747756481/?format=1500w)

Product Name 使用 **IOS10CustomizeNavBarTutorial**，填写自己的 Organization Name 和 Organization Identifier，Language 一栏选择 Swift，Devices 选择 iPhone。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58bc7d015016e1f82fb0294b/1488747787476/?format=1500w)

想在 Navigation Bar 上放一个图片，[下载](https://www.ioscreator.com/s/Apple_Swift_Logo.png)图片。打开 Assets Library，把图片拖拽到 Assets Library 里。找到 **Storyboard** ，选中 View Controller，在顶部的 Editor 菜单栏中选择 Embed in -> Navigation Controller。接下来，从 Object Library 上拖拽一个 Bar Button 放到 Navigation Bar 的左边，命名为 “Left Item”，重复相同的步骤，在 Navigation Bar 的右边放置一个 Bar Button，命名为 “Left Item”。Storyboard 应该如下图所示。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58bc815d1b10e3957ccdda2c/1488748903968/?format=2500w)

找到 ViewController.swift 文件，添加 **ViewDidAppear** 方法。

```swift
override func viewDidAppear(_ animated: Bool) {
    // 1
    let nav = self.navigationController?.navigationBar
  
    // 2
    nav?.barStyle = UIBarStyle.black
    nav?.tintColor = UIColor.yellow
  
    // 3
    let imageView = UIImageView(frame: CGRect(x: 0, y: 0, width: 40, height: 40))
    imageView.contentMode = .scaleAspectFit
      
    // 4
    let image = UIImage(named: "Apple_Swift_Logo")
    imageView.image = image
      
    // 5
    navigationItem.titleView = imageView
}
```

1. 创建一个 nav 变量，节省代码量。
2. Navigation Bar Style 设置成 black，tint color 设置成 yellow，也会导致 bar button item 变成黄色。
3. 创建一个宽和高为 40 point 的 Image View，contentMode 设置成 scaleAspectFit，来调整 Image View 的图片尺寸。
4. 将 Swift Logo 图片放置到 Image View 中。
5. 将 ImageView 设置成 Navigation Item 的 titleView。

**运行** 工程看一下自定义后的 Navigation Bar。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58bc804529687fdb65311f25/1488748624938/?format=750w)

可以从 [github](https://github.com/ioscreator/ioscreator) 上下载 **IOS10CustomizeNavBarTutorial** 教程的源码。