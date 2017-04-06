title: "Table View 上下文菜单教程"
date: 2017-04-06
tags: [iOS 开发]
categories: [IOSCREATOR]
permalink: use-context-menu-with-table-view-tutorial-ios10
keywords: 
custom_title: 
description: 

---
原文链接=https://www.ioscreator.com/tutorials/use-context-menu-with-table-view-tutorial-ios10
作者=Arthur Knopper
原文日期=2017-01-09
译者=钟颖Cyan
校对=Cwift
定稿=CMB

<!--此处开始正文-->

通过长按手势来展示上下文菜单，给了用户对选中对象进行 剪切/复制/粘贴 操作的能力。在默认情况下，Table View 的上下文菜单是禁止的。在本文中，使用上下文菜单复制 Table View Cell 上面的文字，随后可以将文字粘贴到 Text Field 里面。本教程基于 Xcode 8.1 和 iOS 10。

<!--more-->

打开 Xcode 并创建一个新的 Single View Application：

![image](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58728420414fb539f16738e6/1483899951269/?format=1500w)

点下一步，用 **IOS10ContextMenuTableViewTutorial** 作为项目的名字，然后根据你的习惯填写好 Organization Name 和 Organization Identifier。选择 Swift 作为开发语言，并且确保 Devices 为仅 iPhone。

![image](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/587284518419c2902d0b4038/1483899997903/?format=1500w)

打开 **Main.storyboard** 文件并从 Object Library 拖拽一个 Table View 到 main View 的顶部。打开 Attribute Inspector 在 Table View 区域将 Prototype Cells 设置成 1。

![image](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58728478414fb539f1673cc0/1483900034219/?format=500w)

选择 Table View Cell 后打开 Attribute Inspector，在 Table View Cell 区域将 Identifier 设置成 *"cell"*。

![image](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58728493bf629afa514967a5/1483900060894/?format=750w)

选择 Table View，点击 storyboard 右下角的固定按钮固定 Table View 的上边、左边和右边。同时选择高度属性给 Table View 设置一个固定的高度。在 Update Frames 的下拉菜单中选择 Items of New Constraints，然后点击 Add 4 Constraints。

![image](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/587284b5725e2549f7b0a58c/1483900094417/?format=750w)

从 Object Library 拖拽一个 Text Field 并放到 Table View 的正下方。按住 Ctrl 从 Text Field 内部连线到 Table View，保持按住 Ctrl 的状态并选择 "Vertical Spacing" 和 "Center Horizontally"。

![image](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/587285ead1758edd735361d8/1483900403738/Autolayout-Pinleftandright.png?format=500w)

选择 Text Field，点击 storyboard 右下角的固定按钮固定 Text Field 的左右边距。

![image](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/587286031e5b6c9fdaadb7b3/1483900432899/?format=750w)

需要 View Controller 作为 Table View 的代理，选择 TableView，按住 Ctrl 拖拽到 main View 顶部的 View Controller 图标，选择 dataSource，重复一遍并选择 delegate。

![image](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58728664bebafb08e6a84d26/1483900526787/?format=300w)

对 Text Field 进行同样的操作，让 View Controller 成为它的代理。打开 **ViewController.swift** 文件并将类声明改成：

```swift
class ViewController: UIViewController, UITableViewDelegate, UITableViewDataSource, UITextFieldDelegate {
```

添加下面的成员：

```swift
var pasteBoard = UIPasteboard.generalPasteboard()
var tableData: [String] = ["dog","cat","fish"]
```

`pasteBoard` 将用来进行复制粘贴操作，`tableData` 用来存储展示到 Table View Cells 上面的内容。下一步，修改 Table View 的代理方法：

```swift
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
```

Table View 将会显示 TableData 数组里面的三个内容。为了启用上下文菜单，必须实现下面三个方法：

```swift
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
```

为了长按 Table View Cell 的时候显示菜单，`tableView:shouldShowMenuForRowAt` 方法必须返回 `true`。在 `tableView:canPerformAction:forRowAt` 方法里仅仅显示`复制`这个菜单项。在 `tableView:performAction:forRowAt:withSender` 方法里面将选中的文字复制到剪贴板。

最后，实现 `textFieldShouldReturn` 方法，当用户编辑 Text Field 时按下回车后收起键盘：

```swift
func textFieldShouldReturn(_ textField: UITextField) -> Bool {
    self.view.endEditing(true)
    return false
}
```

**编译并运行**项目，长按列表项并选择复制，将文字粘贴到文本框。

![image](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58728d2c1b631b6a2299ad67/1483902262012/?format=750w)

你可以在 ioscreator 的 [GitHub](https://github.com/ioscreator/ioscreator) 仓库里面找到 **IOS10ContextMenuTableViewTutorial** 的源码。