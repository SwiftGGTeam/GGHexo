Segmented Control 教程"

> 作者：Arthur Knopper，[原文链接](https://www.ioscreator.com/tutorials/segmented-control-tutorial-ios10)，原文日期：2016-10-18
> 译者：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；校对：[星夜暮晨](http://www.jianshu.com/users/ef1058d2d851)；定稿：[CMB](https://github.com/chenmingbiao)
  









Segmented Control 用于展示一些用户可以选择的选项。每个 Segment 看起来像是一个单选按钮 (radio button)，用户即便选中了某个选项，这个 Segment 仍保持“选中”状态。在本节教程里，我们会在 `UISegmentedController` 当中创建两个 Segment，每个 Segment 会让 Label 显示不同的文本内容。本节教程将使用 Xcode 8 和 iOS 10 来进行构建。



打开 Xcode，创建一个 Single View Application。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5818680a2e69cfd82f6eb336/1477994519169/?format=750w)

点击 Next，product name 一栏填写 **IOS10SegmentedControlTutorial**，填写好 Organization Name 和 Organization Identifier，Language 选择 Swift，Devices 选择 iPhone。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58068258ebbd1a790b70ebcd/1476821594250/Segmented-Project.png?format=750w)

前往 **Storyboard** 当中，拖一个 Segmented Control 放到主界面。随后再拖一个 Label，使其位于 Segmented Control 的下方并将其文本内容改为 *First Segment Selected*。Storyboard 看起来如下图所示：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58068292d2b8572148371b8f/1476821650959/Segmented-Storyboard.png?format=500w)

选中 Label，按住 Ctrl 并拖向 Segmented Control，在弹出窗中选择 Vertical Spacing 选项。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/580682acd2b8572148371ccf/1476821677035/AutoLayout-VerticalSpacing.png?format=300w)

选中 Segmented Control，点击 Storyboard 右下角的 Auto Layout 中的 Pin 按钮，在弹出窗中输入下图中的值，点击 Add 1 Constraint。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5813291c20099ee15feb42c3/1477650727701/?format=300w)

按住 Shift 键选中 Label 和 Segmented Control，点击 Storyboard 右下角的 Auto Layout 中的 Align 按钮，在弹出窗中输入下图中的值，点击 Add 2 Constraint。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5806833e3e00becea2c72323/1476821823593/Segmented-Align.png?format=300w)

点击 Assistant Editor，确保 **ViewController.swift** 文件可见。按住 Ctrl，把 Segmented Control 拖到 **ViewController.swift** 文件里，创建一个 Outlet 如下图所示：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58068385d2b857214837290e/1476821894686/segmentedControl-Outlet.png?format=300w)

按住 Ctrl，把 Label 拖到 **ViewController.swift** 文件里，创建一个 Outlet 如下图所示：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58068390d2b857214837299a/1476821905054/textLabel-Outlet.png?format=300w)

按住 Ctrl，把 Segmented Control 拖到 **ViewController.swift** 文件里，创建一个 Action 如下图所示：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58068398d2b8572148372a23/1476821912898/indexChanged-Action.png?format=300w)

当用户改变了 Segment 的索引 (index) 值的时候，都会调用这个 **indexChanged** 方法，下面来实现这个方法：

    
    @IBAction func indexChanged(_ sender: AnyObject) {
        switch segmentedControl.selectedSegmentIndex
        {
        case 0:
            textLabel.text = "First Segment Selected";
        case 1:
            textLabel.text = "Second Segment Selected";
        default:
            break
        }
    }

当 `selectedSegmentIndex` 值发生变化后，Label 的文本也会更新。第一个 Segment 的索引值是 0，第二个 Segment 的索引值是 1。**编译并运行**工程，您会发现文本内容会随着 Segment 的变化而发生变化。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/580683b2d2b8572148372bb5/1476821949502/Segmented-Storyboard.png?format=500w)

在 ioscreator 的 [github](https://github.com/ioscreator/ioscreator) 上可以下载到本节课程 **IOS10SegmentedControlTutorial** 的源代码。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。