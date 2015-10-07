title: "如何在 iOS 9 中创建 Stack View"
date: 2015-10-08 09:00:00
tags: [IOSCREATOR]
categories: [iOS9, Swift 入门]
permalink: stack-view-tutorial

---
原文链接=http://www.ioscreator.com/tutorials/stack-view-tutorial/
作者=Arthur Knopper
原文日期=2015-09-14
译者=小铁匠Linus
校对=numbbbbb
定稿=小锅
发布时间=2015-10-08T09:00:00

<!--此处开始正文-->

在 iOS 9 之前，即使是创建相对简单的用户界面(User Interface)，也需要在使用自动布局(Auto Layout)时添加大量的约束(Constraint)。在 iOS 9 中，苹果官方引进了 Stack View，它会为每个新增的子视图自动添加自动布局的约束。在本教程中，我们会创建一个包含三个子视图的纵向 Stack View。本教程使用 Xcode 7 和 iOS 9 实现。

<!--more-->

打开 Xcode 并创建 Single View Application，product name 填写 **IO9StackViewTutorial**，然后填好 Organization Name 和 Organization Identifier，Language 选择 Swift，Devices 选择 iPhone，具体设置如下图。

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f32c90e4b01d6e90ff3fc8/1442000017883/?format=1500w)

进入 **Storyboard**，从界面右下角的 Object Library 里拖一个 Label 控件到主视图的上部。双击该 Label 并设置 title 为 "Swift"。从 Object Library 再拖一个 Image View，并放在 Label 下面。点击[下载](http://www.ioscreator.com/s/Apple_Swift_Logo2x.png)这张图片，把它添加到工程。选中 Image View 点击 Attribute Inspector。在 Image View 区域的 Image 字段选择 Apple\_Swift\_Logo.png，同时在 View 区域的 Mode 字段选择 Aspect Fit，具体如下图。

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f32dfae4b0d34cd54e9cc0/1442000379350/?format=750w)

最后，再拖一个 Button，并放在 Image View 下面。双击该 Button 并设置 title 为 "Start Coding"。Storyboard 如下图所示。

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f32ea6e4b01e51d6e3b372/1442000553314/?format=1500w)

按住 Ctrl 键并选择主视图里的三个控件，点击 Storyboard 右下角的 Stack View 按钮，如下图。

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f32ee8e4b01d6e90ff4e99/1442000618055/?format=300w)

此时，Stack View 已经创建好了，唯一要做的事情就是设置自动布局约束(Auto Layout Constraints)。点选 Stack View 后点击 Pin 按钮，并设置 top constraint 为 50，点击"Add 1 Constraint"，如下图。

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f5ce7ce4b04a24f171ba22/1442172541860/?format=750w)

点击 Align menu 按钮，并选择"Horizontally in Container"，点击"Add 1 Constraint"，如下图。

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f5d1bde4b0d81aa066c892/1442173374829/?format=750w)

按上面的步骤操作后，可能需要更新 frame，点击"Resolve Auto Layout Issues"按钮，然后再点击"Update Frames"，如下图。

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f5d1e8e4b0f6a0270d265d/1442173479161/?format=750w)

可以在 Stack View 里改变子视图之间的间距(spacing)。选择 Stack View 然后切换到 Attribute Inspector 选项卡，修改 Spacing 的值为 20，如下图。

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f5d433e4b0ee3005dcbcb3/1442174004791/?format=750w)

编译并运行工程。在模拟器里旋转设备，可以看到 Stack View 能很好地适应不同方向。

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f672d0e4b0864ffa13adac/1442214609622/?format=1500w)

你可以在 [Github](https://github.com/ioscreator/ioscreator) 下载 **IO9StackViewTutorial** 工程的源代码。