title: "Picker View 教程"
date: 2017-04-12
tags: [iOS 开发]
categories: [IOSCREATOR]
permalink: picker-view-ios-tutorial-ios10
keywords: 
custom_title: 
description: 

---
原文链接=https://www.ioscreator.com/tutorials/picker-view-ios-tutorial-ios10
作者=Arthur Knopper
原文日期=2017/04/05
译者=Crystal Sun
校对=walkingway
定稿=CMB

<!--此处开始正文-->

picker view 看起来像是自动贩售机或者角子老虎机，用于展示一组或者多组数值。用户通过滚轮来选择数值，选中的值处在同一行中。Xcode 里的 User Interface 提供了 picker view 控件，展示可选的组件和行。组件就是滚轮，有很多行，每行都有固定的 index 值。本教程使用的是 Xcode 8.3 和 iOS 10.3。

<!--more-->

### 创建工程

打开 Xcode，创建一个 Single View Application。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58e2b312ff7c5012318e7c14/1491252025575/xcode-single-view-template?format=1500w)

Product Name 使用 **IOS10PickerViewTutorial**，填写自己的 Organization Name 和 Organization Identifier，Language 一栏选择 Swift，Devices 一栏选择 iPhone。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58e2b369bf629afc262efedc/1491252502556/picker-view-project?format=1500w)

### 设置 Storyboard

打开 **Storyboard**，添加一个 Picker View，然后选中，点击右下角的 Auto Layout 的 Pin 按钮，如下图所示，选中上、左、右三个方向，点击 “Add 3 Constants”。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58e2b59e5016e1f19b2d4930/1491252669192/auto-layout-pin-picker-view?format=750w)

点击 Assistant Editor，确保 **ViewController.swift** 文件可见。使用 Control 拖拽法将 Picker View 和 ViewController 类创建下列 Outlet：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58e2b5fed1758e2144367e8e/1491252761037/picker-view-outlet?format=750w)

Storyboard 看起来应如下图所示：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58e2b6ad17bffc2b3896d9ae/1491252934980/picker-view-storyboard?format=1000w)

### 写代码

打开 **ViewController.swift** 文件，Picker View 必须遵循 UIPickerViewDataSource 和 UIPickerViewDelegate 协议，在类的声明里，将代码改成如下所示：

```swift
class ViewController: UIViewController, UIPickerViewDelegate, UIPickerViewDataSource {
```

将 **viewDidLoad** 方法改成如下所示：

```swift
override func viewDidLoad() {
    super.viewDidLoad()
        
    pickerView.delegate = self
    pickerView.dataSource = self
}
```

还需要给 Picker View 提供数值，在 ViewController 类中添加下列数组：

```swift
let colors = ["Red","Yellow","Green","Blue"]
```

colors 数组就是 Picker View 的数据源（data source），UIPickerViewDataSource 协议需要特定的方法来定义 picker 的组件和行数。实现下列方法：

```swift
func numberOfComponents(in pickerView: UIPickerView) -> Int {
    return 1
}
    
func pickerView(_ pickerView: UIPickerView, numberOfRowsInComponent component: Int) -> Int {
    return colors.count
}
```

我们定义了 picker 的行数等于数组的元素数量。接下来，将数组对应的元素内容赋值给对应的行：

```swift
func pickerView(_ pickerView: UIPickerView, titleForRow row: Int, forComponent component: Int) -> String? {
    return colors[row]
}
```

### 运行工程

**运行**工程，现在可以在 Picker View 里选择不同的颜色了。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58e2b8b1bf629afc262f569d/1491253448549/picker-view-simulator?format=750w)

可以从 [github](https://github.com/ioscreator/ioscreator) 上下载 **IOS10PickerViewTutorial** 教程的源码。