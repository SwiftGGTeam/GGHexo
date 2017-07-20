iOS 教程：属性字符串"

> 作者：Arthur Knopper，[原文链接](https://www.ioscreator.com/tutorials/attributed-strings-ios-tutorial-ios10)，原文日期：2017-04-04
> 译者：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；校对：[way](undefined)；定稿：[shanks](http://codebuild.me/)
  










> 译者注：本文是之前一篇文章的更新版本，[旧文链接](https://www.ioscreator.com/tutorials/attributed-strings-tutorial-ios8-swift)，旧文使用的 Swift 版本不是 3.0，本文更新了代码，升级到了 Swift 3.0。

属性字符串（Attributed Strings）可以为文本赋予各种各样的属性，还能一次给（部分）文本赋值多个属性。在本节教程中，将学会给 label 文本里的每个单词各设置不一样的样式。本节教程使用的是 Xcode 8 和 iOS 10。


打开 Xcode，创建一个 Single View Application。

![](http://swift.gg/img/articles/attributed-strings-ios-tutorial-ios10/single-view-xcode-templateformat=1500w1500254455.03)

Product Name 使用 **IOS10AttributedStringsTutorial**，填写自己的 Organization Name 和 Organization Identifier，Language 一栏选择 Swift，Devices 一栏选择 iPhone。

![](http://swift.gg/img/articles/attributed-strings-ios-tutorial-ios10/attributed-strings-projectformat=1500w1500254455.98)

打开 **Storyboard**，从 Object-Library（控件库）中拖拽一个 Label 控件到主界面，点击 Storyboard 右下角 Auto Layout 的 Align 按钮，添加下图所示约束，点击 “Add 1 Constraint”。。

![](http://swift.gg/img/articles/attributed-strings-ios-tutorial-ios10/auto-layout-horizontally-in-containerformat=750w1500254456.86)

点击 Auto Layout 的 Pin 按钮，添加如下图所示约束，点击 “Add 1 Constraint”。

![](http://swift.gg/img/articles/attributed-strings-ios-tutorial-ios10/auto-layout-pin--to-topformat=750w1500254457.69)

点击 Assistant Editor，确保 **ViewController.swift** 文件可见。按住 Control 键，将 Label 控件拖拽到 ViewController 类下面，创建下列 Outlet 连接。

![](http://swift.gg/img/articles/attributed-strings-ios-tutorial-ios10/attributes-label-outletformat=750w1500254459.19)

打开 **ViewController.swift** 文件，如下所示对 **viewDidLoad** 方法进行修改。

    
    override func viewDidLoad() {
        super.viewDidLoad()
            
        // 1
        let string = "Testing Attributed Strings"
        let attributedString = NSMutableAttributedString(string: string)
            
        // 2
        let firstAttributes:[String:Any] = [NSForegroundColorAttributeName: UIColor.blue, NSBackgroundColorAttributeName: UIColor.yellow, NSUnderlineStyleAttributeName: 1]
        let secondAttributes:[String:Any] = [NSForegroundColorAttributeName: UIColor.red, NSBackgroundColorAttributeName: UIColor.blue, NSStrikethroughStyleAttributeName: 1]
        let thirdAttributes:[String:Any] = [NSForegroundColorAttributeName: UIColor.green, NSBackgroundColorAttributeName: UIColor.black, NSFontAttributeName: UIFont.systemFont(ofSize: 40)]
            
        // 3
        attributedString.addAttributes(firstAttributes, range: NSRange(location: 0, length: 8))
        attributedString.addAttributes(secondAttributes, range: NSRange(location: 8, length: 11))
        attributedString.addAttributes(thirdAttributes, range: NSRange(location: 19, length: 7))
            
        // 4
        attributedLabel.attributedText = attributedString
    }

1. 创建一个普通的字符串，将会转换成多种属性字符串。
2. 创建见 3 个字典，存储属性的键和值。
3. 将属性添加到 `attributedString` 对象中。
4. 最后，将属性字符串赋值给 Label。

**运行**程序，属性字符串的实现效果如下。

![](http://swift.gg/img/articles/attributed-strings-ios-tutorial-ios10/attributed-strings-simulatorformat=750w1500254459.94)

可以从 [github](https://github.com/ioscreator/ioscreator) 上下载 **IOS10AttributedStringsTutorial** 教程的源代码。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。