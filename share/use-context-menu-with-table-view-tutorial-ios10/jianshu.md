Table View 中开启文本菜单功能"

> 作者：Arthur Knopper，[原文链接](https://www.ioscreator.com/tutorials/use-context-menu-with-table-view-tutorial-ios10)，原文日期：2017-01-09
> 译者：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；校对：[walkingway](http://chengway.in/)；定稿：[CMB](https://github.com/chenmingbiao)
  ---










长按所选的对象后，弹出文本菜单（Context Menu），允许用户进行剪切、复制、粘贴操作。默认情况下，文本菜单功能在 Table View 中是关闭状态。在本节教程中，将学习如何在 Table View Cell 中开启文本菜单功能，将所选的文本复制到 Text Filed（文本输入框）中。本节教程使用的是 Xcode 8.1 和 iOS 10。



### 设置工程

打开 Xcode，创建一个 Single View Application。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58ff88928419c2b2a27d0754/1493141675229/single-view-xcode-template?format=1500w)

点击 Next。Product Name 使用 **IOS10ContextMenuTableViewTutorial**，填写自己的 Organization Name 和 Organization Identifier，Language 一栏选择 Swift，Devices 一栏选择 iPhone。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/587284518419c2902d0b4038/1483899997903/?format=1500w)

打开 **Main.storyboard** 文件，从 Object Library 中拖拽一个 Table View 到主界面，然后选中 Table View，找到 Attribute Inspector，在 Table View 部分，将 Prototype Cells 的值改为1。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58728478414fb539f1673cc0/1483900034219/?format=500w)

选中 Table View Cell，找到 Attribute Inspector ，在 Table View Cell 区域，将 Indentifier 的值设置为 “cell”。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58728493bf629afa514967a5/1483900060894/?format=750w)

选中 Table View，点击右下角的 Pin 按钮，点击上方、左、右三条线，选择 Height，设置成固定高度。在 Update Frames 的下拉菜单中选择 Items of New Contraints，接下来点击 “Add 4 Constraints”。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/587284b5725e2549f7b0a58c/1483900094417/?format=750w)

从 Object Library 中拖拽一个 Text Field 控件，放到 Table View 的下方。按住 Control 键，将其拖拽到 Table View 上，松开 Control 键，选择 “Vertical Spacing” 和 “Center Horizontally”。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/587285ead1758edd735361d8/1483900403738/Autolayout-Pinleftandright.png?format=500w)

选中 Text Field，点击右下角的 Pin 按钮，选中左、右两条线。如下图添加约束。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/587286031e5b6c9fdaadb7b3/1483900432899/?format=750w)

View Controller 需要成为 Table View 的代理（delegate）。选中 TableView，按住 Control 键，将其拖拽到 View Controller 顶部的黄色图标上，点击 dataSource，重复上述步骤，点击 delegate。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58728664bebafb08e6a84d26/1483900526787/?format=300w)

对 Text Field 控件也重复上述步骤，使 View Controller 成为 Text Field 的代理（delegate）。然后打开 **ViewController.swift** 文件，将类的声明改成如下代码：

    
    class ViewController: UIViewController, UITableViewDelegate, UITableViewDataSource, UITextFieldDelegate {

接着添加下列属性：

    
    var pasteBoard = UIPasteboard.generalPasteboard()
    var tableData: [String] = ["dog","cat","fish"]

pasteBoard 属性将用于复制粘贴操作，tableData 存储展示在 Table View Cell 上的数据。接下来，如下所示修改 Table View 的 delegate 方法：

    
    func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }
        
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return tableData.count
    }
        
        
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "cell", for: indexPath)
            
        cell.textLabel?.text = tableData[indexPath.row]
            
        return cell
    }

Table View 现在会展示 tableData 数组中的值，想要开启文本菜单功能，需要实现以下三个 delegate 方法。

    
    func tableView(_ tableView: UITableView, shouldShowMenuForRowAt indexPath: IndexPath) -> Bool
    {
        return true
    }
        
    func tableView(_ tableView: UITableView, canPerformAction action: Selector, forRowAt indexPath: IndexPath, withSender sender: Any?) -> Bool {
        if (action == #selector(UIResponderStandardEditActions.copy(_:))) {
            return true
        }
        return false
    }
        
    func tableView(_ tableView: UITableView, performAction action: Selector, forRowAt indexPath: IndexPath, withSender sender: Any?) {
        let cell = tableView.cellForRow(at: indexPath)
        pasteBoard.string = cell!.textLabel?.text
    }

**tableView:shouldShowMenuForRowAt** 方法必须返回 true，才能长按显示文本菜单。**tableView:canPerformAction:forRowAt** 方法，让文本菜单只显示 copy（复制）一个选项。**tableView:performAction:forRowAt:withSender** 方法将选中的文本复制到 pasteBoard 变量中。

最后，通过 **textFieldShouldReturn** 方法，在点击 Text Field 后让键盘消失。

    
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        self.view.endEditing(true)
        return false
    }

**运行**工程，长按一行 Table View Cell，然后选择 copy（复制） 选项，粘贴到 Text Field（文本框）里。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58728d2c1b631b6a2299ad67/1483902262012/?format=750w)

可以从 [github](https://github.com/ioscreator/ioscreator) 上下载 **IOS10ContextMenuTableViewTutorial** 教程的源代码。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。