新手教程：如何改变应用名称"

> 作者：Arthur Knopper，[原文链接](https://www.ioscreator.com/tutorials/change-display-name-tutorial)，原文日期：2016-05-26
> 译者：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；校对：[星夜暮晨](http://www.jianshu.com/users/ef1058d2d851)；定稿：[CMB](https://github.com/chenmingbiao)
  









通常情况下，iPhone 屏幕首页上会展示 App 的默认名称。但有时候，我们需更改此名称。在本节教程中，我们会借助属性列表项（property list item）来改变 App 的展示名称。本节教程使用的是 Xcode 7.3.1 和 iOS 9.3。



打开 Xcode，创建一个 Single View Application。点击 Next，product name 一栏填写 **IOS9ChangeDisplayNameTutorial**，填写好 Organization Name 和 Organization Identifier，Language 选择 Swift，Devices 选择 iPhone。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5744a989b654f9296242ead7/1464117654024/?format=750w)

默认情况下，在首屏上展示的名称就是 App 的默认名称。点击 info.plist 文件，检索 Bundle name item。可以看到其 value 值为 '$(PRODUCT_NAME)'，也就是工程的名字。

**编译并运行**工程启动模拟器，点击菜单栏的 Hardware 菜单，选择 Home。这个时候会发现，当前 App 的名字太长了以至于无法显示完全。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5744aaf620c647d51f31d1ee/1464118017542/?format=750w)

找到 info.plist 文件，右键单击任意的 item，点击 "Add Row"，选择或输入 Bundle Display Name，value 值设置为 NewName，如下图：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5744b4853c44d831afc28fa8/1464120462846/?format=750w)

再次**编译并运行**工程，回到 iPhone 首页，App 名称变成下图所示的名称。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5744b82d5559866f426c89b8/1464121404798/?format=750w)

在 ioscreator 的 [github](https://github.com/ioscreator/ioscreator) 上可以下载到本节课程 **IOS9ChangeDisplayNameTutorial** 的源代码。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。