title: "用 Core Graphic 绘制图形"
date: 2017-04-27
tags: [iOS 开发]
categories: [IOSCREATOR]
permalink: drawing-shapes-core-graphics-tutorial-ios10
keywords: 
custom_title: 
description: 

---
原文链接=https://www.ioscreator.com/tutorials/drawing-shapes-core-graphics-tutorial-ios10
作者=Arthur Knopper
原文日期=2016/10/06
译者=Crystal Sun
校对=Cwift
定稿=CMB

<!--此处开始正文-->

Core Graphics 这个 API 同时出现在 Cocoa 和 Cocoa Touch 中，用于绘制图形对象。在本节教程中，我们将画一些基本的图形，例如矩形或者圆形。本节教程使用的是 Xcode 8 和 iOS 10。

 <!--more-->

打开 Xcode，创建一个 Single View Application。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57f49232c534a5c6e2a4b1e8/1475646011278/?format=1500w)

点击 Next，Product Name 使用 **IOS10DrawShapesTutorial**，填写自己的 Organization Name 和 Organization Identifier，Language 一栏选择 Swift，Devices 一栏选择 iPhone。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57f493b620099ec6e23bc763/1475646402961/?format=1500w)

打开 **Storyboard**，从 Object Library （控件库）里拖拽一个 Horizontal Stack View，放到主界面的顶部。找到 Attributes Inspector，在 Stack View 部分，将 Distribution type 改为 Fill Equally。从控件库拖拽 3 个 button 控件放到 Stack View 里，修改为下列名字：Rectangle，Lines 和 Circle。选中 Stack View，点击右下角 Auto Layout 的 Pin 按钮，输入下图中的约束条件，点击 Add 3 Constants。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57f4940cbe65944d4a76b782/1475646514735/?format=750w)

Storyboard 现在看起来应该如下图所示：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57f49445be65944d4a76b86b/1475646542988/?format=1000w)

选中一个 button，到 Attribute Inspector 中，在 View 这个区域里，把 Tag 的值改成 0，其他的两个 button 的 Tag 值分别改成 1 和 2，我们会在后面用到这个值，这样就能知道哪个 button 被点击了。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57f4b00ecd0f6802f4e10afe/1475653654088/?format=500w)

打开 Assistant Editor，确保 **ViewController.swift** 文件可见。按住 Ctrol 键，选中 “Lines” 按钮，将其拖拽到 ViewController 类下面，创建下图所示的 Action：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57f4946bbe65944d4a76b920/1475646580411/?format=750w)

选中其他的按钮，进行同样的操作。每次按钮被点击，都会执行 IBAction 方法。

绘图行为在自定义的 View 里进行，给工程添加一个新文件，在菜单栏选择 File -> New File -> iOS -> Cocoa Touch Class。Class 的名字为：**ShapeView**，父类是 UIView。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57f494b5440243d357b10f23/1475646657351/?format=1500w)

找到 **ShapeView.swift**，添加下列属性：

```swift
var currentShapeType: Int = 0
```

这个 currentShapeType 属性用于筛选方法以便绘制对应的图形。接下来进行初始化：

```swift
init(frame:CGRect, shape: Int){
  super.init(frame:frame)
  self.currentShapeType = shape
}

required init?(coder aDecoder: NSCoder){
  fatalError("init(coder:) has not been implemented")
}
```

初始化之后，之前设置的 Tag 值决定了图形形状类型，drawRect 方法用于绘制自定义图形：

```swift
override func draw(_ rect: CGRect) {
    switch currentShapeType {
      case 0: drawRectangle()
      case 1: drawLines()
      case 2: drawCircle()
      default: print("default")
    }
}
```

接下来，实现每个绘图的方法。

```swift
func drawLines() {
    //1
    guard let ctx = UIGraphicsGetCurrentContext() else { return }
            
    //2
    ctx.beginPath()
    ctx.move(to: CGPoint(x: 20.0, y: 20.0))
    ctx.addLine(to: CGPoint(x: 250.0, y: 100.0))
    ctx.addLine(to: CGPoint(x: 100.0, y: 200.0))
    ctx.setLineWidth(5)
            
    //3
    ctx.closePath()
    ctx.strokePath()
}
        
func drawRectangle() {
    let center = CGPoint(x: self.frame.size.width / 2.0, y: self.frame.size.height / 2.0)
    let rectangleWidth:CGFloat = 100.0
    let rectangleHeight:CGFloat = 100.0
            
    guard let ctx = UIGraphicsGetCurrentContext() else { return }
            
    //4
    ctx.addRect(CGRect(x: center.x - (0.5 * rectangleWidth), y: center.y - (0.5 * rectangleHeight), width: rectangleWidth, height: rectangleHeight))
    ctx.setLineWidth(10)
    ctx.setStrokeColor(UIColor.gray.cgColor)
    ctx.strokePath()
            
    //5
    ctx.setFillColor(UIColor.green.cgColor)
            
    ctx.addRect(CGRect(x: center.x - (0.5 * rectangleWidth), y: center.y - (0.5 * rectangleHeight), width: rectangleWidth, height: rectangleHeight))
            
    ctx.fillPath()
}
        
func drawCircle() {
    let center = CGPoint(x: self.frame.size.width / 2.0, y: self.frame.size.height / 2.0);
            
    guard let ctx = UIGraphicsGetCurrentContext() else { return }
            ctx.beginPath()
            
    //6
    ctx.setLineWidth(5)
            
    let x:CGFloat = center.x
    let y:CGFloat = center.y
    let radius: CGFloat = 100.0
    let endAngle: CGFloat = CGFloat(2 * M_PI)
            
    ctx.addArc(center: CGPoint(x: x,y: y), radius: radius, startAngle: 0, endAngle: endAngle, clockwise: true)
            
    ctx.strokePath()
}
```

1. Graphic Context（图形上下文）仿佛是一块画布，如果想在一个 view 上绘制，view 就是你的 Graphic Context。你需要得到 Graphic Context 的引用。 
2. path 是一组直线、弧形、曲线的组合，可以绘制在当前的图形内容 Graphic Context 上，从而构成复杂的图形。这里就画了一些直线，线的粗细为 5。
3. path 的工作结束，把图形绘制到 Graphic Context 上。
4. 使用 CGContextAddRect 来画一个矩形，矩形的边框颜色为灰色。
5. 还是之前的矩形，填充色是绿色。
6. 使用 CGContextAddArc 来画一个圆。

下一步，在 ViewController.swift 文件中实现按钮点击方法。

```swift
@IBAction func buttonPressed(_ sender: AnyObject) {
    let myView = ShapeView(frame: CGRect(x: 25, y: 200, width: 280, height: 250), shape: sender.tag)
    myView.backgroundColor = UIColor.cyan
    view.addSubview(myView)
}
```

**运行**工程，点击每个按钮，绘制不同的图形。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57f556ef725e255f6d75c210/1475696387365/?format=750w)

可以从 [github](https://github.com/ioscreator/ioscreator) 上下载 **IOS10DrawShapesTutorial** 教程的源码。