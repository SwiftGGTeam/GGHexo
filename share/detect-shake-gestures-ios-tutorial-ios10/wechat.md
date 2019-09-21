如何检测摇一摇手势"

> 作者：Arthur Knopper，[原文链接](https://www.ioscreator.com/tutorials/detect-shake-gestures-ios-tutorial-ios10)，原文日期：2017-04-18
> 译者：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；校对：[way](undefined)；定稿：[shanks](http://codebuild.me/)
  









iOS 设备可以检测摇一摇手势，在本节教程中，我们将学习如何检测摇一摇手势，检测到该手势后，更新 label 的文案。本节教程使用的是 Xcode 8.3 和 iOS 10.3。


### 设置工程

打开 Xcode，创建一个 Single View Application。

![](https://swift.gg/img/articles/detect-shake-gestures-ios-tutorial-ios10/single-view-xcode-templateformat=1500w1500341429.27)

Product Name 使用 **IOS10ShakeGestureTutorial**，填写自己的 Organization Name 和 Organization Identifier，Language 一栏选择 Swift，Devices 一栏选择 iPhone。

![](https://swift.gg/img/articles/detect-shake-gestures-ios-tutorial-ios10/shake-gesture-projectformat=1500w1500341431.78)

打开 **Storyboard**，从 Object Library 中拖拽一个 Label 控件放到 View Controller 上，双击 Label 控件将文案修改为 *“Shake me”*。选中该 Label，点击 Auto Layout 的 Align 按钮。选中 “Horizontally in Container”，点击 “Add 1 Constraint”。

![](https://swift.gg/img/articles/detect-shake-gestures-ios-tutorial-ios10/auto-layout-horizontally-in-containerformat=750w1500341433.06)

选中 Label，点击 Auto Layout 的 Pin 按钮，选中上边距约束线，点击 “Add 1 Constraint”。

![](https://swift.gg/img/articles/detect-shake-gestures-ios-tutorial-ios10/auto-layout-pin-to-topformat=750w1500341433.89)

Storyboard 看起来应如下图所示。

![](https://swift.gg/img/articles/detect-shake-gestures-ios-tutorial-ios10/shake-gesture-storyboardformat=1000w1500341434.83)

打开 Assistant Editor，确保 **ViewController.swift** 可见。按住 Control 键，将 Label 拖拽到 ViewController 类下，创建下图的 Outlet。

![](https://swift.gg/img/articles/detect-shake-gestures-ios-tutorial-ios10/shake-label-outletformat=750w1500341435.62)

打开 ViewController.swift 文件，首先要让 View Controller 回应点击事件，可以通过 ViewController FirstResponder 实现，添加下列方法：

    
    override func becomeFirstResponder() -> Bool {
        return true
    }

接下来，要想检测摇一摇手势，添加 **motionEnded(_:with:)** 方法。

    
    override func motionEnded(_ motion: UIEventSubtype, with event: UIEvent?) {
        if motion == .motionShake {
            shakeLabel.text = "Shaken, not stirred"
        }
    }

如果确实是一个 Shake Gesture（摇一摇），那么 Label 的文案就会更新。运行工程，摇一摇测试机。可以点击 iOS 模拟器菜单栏 Hardware 选项下的 Shake Gesture 来摇一摇。

![](https://swift.gg/img/articles/detect-shake-gestures-ios-tutorial-ios10/shake-gesture-simulatorformat=750w1500341436.36)

可以从 [github](https://github.com/ioscreator/ioscreator) 上下载 **IOS10ShakeGestureTutorial** 教程的源代码。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。