title: "创建多个 Outlet 教程"
date: 2017-05-10
tags: [iOS 开发]
categories: [IOSCREATOR]
permalink: multiple-outlets-tutorial
keywords:
custom_title:
description:

---
原文链接=https://www.ioscreator.com/tutorials/multiple-outlets-tutorial
作者=IOSCREATER
原文日期=2016/02/08
译者=EyreFree
校对=DianQK
定稿=CMB

<!--此处开始正文-->

为多个对象创建多个 Outlet 是比较费时费力的一件事情。而且多个对象也可能共享同一个的 Outlet。在本教程中，我们将会根据按钮的 tag 值来创建多个 Outlet。本教程使用 Xcode 7.2 作为开发工具，使用 Swift 2.1 和 iOS 9 进行构建。

<!--more-->

打开 Xcode 并新建一个 Single View Application。Product Name 项填写 **IOS9MultipleOutletsTutorial**，然后填写你的 Organization Name 和 Organization Identifier。Language 项选择 Swift，并且确保 Devices 项只选择了 iPhone。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/56962b56a12f44ae28276e6e/1452682071748/?format=750w)

打开 __StoryBoard__ 并从 Object Library 拖一个按钮到主视图的左上方。打开 Attribute Inspector（属性检查器）并将 View 的 Tag 设为 10。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/56967c4fb204d5edf92596e3/1452702801210/?format=300w)

复制此按钮，并将该按钮放置于和第一个按钮相同一行的主视图右上角位置，该按钮和第一个按钮具有相同的 Tag。
接下来，从 Object Library 中拖出另一个按钮到主视图中，将该按钮放在左上角按钮的下面。选中这个按钮并且打开 Attribute Inspector，将 View 中的 Tag 设为 20。然后再次复制刚添加的这个按钮并将复制的按钮放在刚添加的按钮的右方。到这里 Storyboard 应该是如下图所示的样子：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/56b3af28746fb99c72839226/1454616374964/?format=750w)

选中主视图然后点击 Interface Builder 右下角的 Resolve Auto Layout Issues 按钮。选择 All Views 中的 Reset to Suggested Constraint 这一选项。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/56b50962746fb9a53ff4610c/1454705005083/?format=500w)

打开文件 __ViewController.swift__ 并将方法 __viewDidLoad__ 改为如下代码块所示：

```swift
override func viewDidLoad() {
    super.viewDidLoad()
    // Do any additional setup after loading the view, typically from a nib.

    for subview in view.subviews where subview.tag == 10 {
        let button = subview as! UIButton
        button.addTarget(self, action: "changeColorRed:", forControlEvents: .TouchUpInside)
    }
        
    for subview in view.subviews where subview.tag == 20 {
        let button = subview as! UIButton
        button.addTarget(self, action: "changeColorGreen:", forControlEvents: .TouchUpInside)
    }
}
```

这里的 subview 属性可以用于遍历主视图的子视图。每个按钮都根据 tag 值的不同添加了一个相应的 target。接下来，我们需要实现 target 方法：

```swift
func changeColorRed(sender: AnyObject) {
    let button: UIButton = sender as! UIButton
    button.tintColor = UIColor.redColor()
}
    
func changeColorGreen(sender: AnyObject) {
    let button: UIButton = sender as! UIButton
    button.tintColor = UIColor.greenColor()
}
```

当选中按钮时，按钮的颜色会随之改变。__构建并运行__项目，接下来我们就点击按钮来更改这些按钮的颜色了。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/56b3afc662cd945febf7cbf7/1454616530586/?format=750w)

你可以从 ioscreator 的 [GitHub](https://github.com/ioscreator/ioscreator) 下载 __IOS9MultipleOutletsTutorial__ 的源码。


