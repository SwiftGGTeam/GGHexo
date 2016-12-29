自定义 Tab Bar 教程"

> 作者：Arthur Knopper，[原文链接](https://www.ioscreator.com/tutorials/tab-bar-customisation-tutorial-ios10)，原文日期：2016-10-07
> 译者：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；校对：[星夜暮晨](http://www.jianshu.com/users/ef1058d2d851)；定稿：[CMB](https://github.com/chenmingbiao)
  









Tab Bar 用于快速切换不同模块之间的界面。在本节教程中，我们将来了解 Tab Bar 以及如何自定义 item。本节教程将使用 Xcode 8 和 iOS 10 来进行构建。



打开 Xcode，创建一个 Tabbed Application。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57f651c6e4fcb5154dc861dc/1475760593585/?format=750w)

点击 Next，product name 一栏填写 **IOS10TabBarCustomizationTutorial**，填写好 Organization Name 和 Organization Identifier，Language 选择 Swift，Devices 选择 iPhone。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57f651e3e4fcb5154dc86223/1475760624492/?format=750w)

找到 **ViewController.swift** 文件，更改 **viewDidLoad** 方法如下：

    swif
    override func viewDidLoad() {
        super.viewDidLoad()        
        guard let tabBar = self.tabBarController?.tabBar else { return }
            
        tabBar.tintColor = UIColor.white
        tabBar.barTintColor = UIColor.black
        tabBar.unselectedItemTintColor = UIColor.yellow
            
            
        guard let tabBarItem = self.tabBarItem else { return }
            
        tabBarItem.badgeValue = "123"
        tabBarItem.badgeColor = UIColor.blue
    }

`tintColor` 设置成白色，`barTintColor` 设置成黑色，选中某个 item 时，`tintColor` 将变成黄色。每个 item 可以有一个 supplementary badge，我们在这里创建了一个值为 “123” 的蓝色 badge。

**编译并运行**工程，从下图中可看到自定义的 Tab Bar。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57f65238e4fcb5154dc86364/1475760704128/?format=500w)

在 ioscreator 的 [github](https://github.com/ioscreator/ioscreator) 上可以下载到本节课程 **IOS10TabBarCustomizationTutorial** 的源代码。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。