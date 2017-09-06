title: "如何用 UIKit Dynamics 进行碰撞检测"
date: 2017-09-06
tags: [iOS 开发]
categories: [IOSCREATOR]
permalink: collision-detection-uikit-dynamics-ios-tutorial-ios10
keywords: Dynamics,碰撞检测
custom_title: 
description: 

---
原文链接=https://www.ioscreator.com/tutorials/collision-detection-uikit-dynamics-ios-tutorial-ios10
作者=Arthur Knopper
原文日期=2017-04-20
译者=Crystal Sun
校对=walkingway
定稿=CMB

<!--此处开始正文-->

用 UIKit Dynamics 可以让指定对象具备碰撞行为。动态的项目能相互碰撞或者和任何指定的边界碰撞。在本节教程中，将学习创建自行一的边界，随机地让一些方块下落到边界上。本节教程使用的是 Xcode 8.3 和 iOS 10.3。

<!--more-->

### 设置工程

打开 Xcode，创建一个 Single View Application 工程。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58ff88928419c2b2a27d0754/1493141675229/single-view-xcode-template?format=1500w)

Product Name 使用 **IOS10CollisionDectectionTutorial**（译者注：这里的 Dectection 估计是错别字，应该是 Detection），填写自己的 Organization Name 和 Organization Identifier，Language 一栏选择 Swift，Devices 一栏选择 iPhone。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58f601fed2b857170ca0ce82/1492517402522/line-view-uiview?format=1500w)

用自定义的 UIView 画一些线，在 drawRect 方法中写点代码。选择 File -> New File -> iOS -> Source -> Cocoa Touch Class。Class 命名为 LineView，其父类为 UIView。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58f601fed2b857170ca0ce82/1492517402522/line-view-uiview?format=1500w)

打开 **LineView.swift** 文件，想要画线需要先创建一个帮手：**drawLineFromPoint(fromX:toPoint:pointY:)** 方法。

```swift
func drawLineFromPoint(fromX: CGFloat, toPoint toX: CGFloat, pointY y: CGFloat) {
    let currentContext = UIGraphicsGetCurrentContext()
        
    if let currentContext = currentContext {
        currentContext.setLineWidth(5.0)
        currentContext.move(to: CGPoint(x: fromX, y: y))
        currentContext.addLine(to: CGPoint(x: toX, y: y))
        currentContext.strokePath();
    }}
```

线的宽度为 5 points。接下来，改写 **drawRect** 方法：

```swift
override func draw(_ rect: CGRect) {
        
    drawLineFromPoint(fromX: 0, toPoint: bounds.size.width/3, pointY: bounds.size.height - 100.0)
    drawLineFromPoint(fromX: bounds.size.width/3, toPoint:bounds.size.width*0.67, pointY:bounds.size.height - 150.0)
    drawLineFromPoint(fromX: bounds.size.width*0.67, toPoint:bounds.size.width, pointY:bounds.size.height - 100.0)}
```

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58f61c37d1758e8294911b8f/1492524185945/custom-class-identity-inspector?format=500w)

**运行**工程，线已经出现在屏幕上了。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58f61d4cc534a5b618a2ccfb/1492589254073/?format=750w)

接下来，拖拽一个 Button 控件到 Storyboard 上，标题改为 “Next”。选中该 Button，点击 Auto Layout 的 Align 按钮，勾选 “Horizontally in Container”，点击 “Add 1 Constraint”。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58f7ab9db3db2b7177ee0892/1492626382150/auto-layout-horizontally-in-container?format=750w)

继续选中该 Button，点击 Auto Layout 的 Pin 按钮，选中上边距的约束线，点击 “Add 1 Constraint”。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58f7ac28f5e2316d60eb2495/1492626495002/button-pin-to-top?format=750w)

主界面看起来应如下图所示：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58f7a9f61b10e35a8888d485/1492625933682/collision-detection-storyboard?format=750w)

点击 Assistant Editor，确保 ViewController.swift 文件可见，按住 Control 键将该 Button 拖拽到 ViewController 类里，创建下列 Action 链接：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58f7a9c9579fb39af544e8a2/1492625895137/release%3Dsquare-action?format=750w)

在 **ViewController.swift** 文件中，需要声明一些变量，来跟踪记录 view，如下所示：

```swift
var squareViews:[UIView] = []
var animator:UIDynamicAnimator!
var colors:[UIColor] = []
var centerPoint:[CGPoint] = []
var sizeOfSquare:CGSize!
```

squareViews 将包含所需的 view，view 需要颜色数组、centerPin 数组和 sizeOfSquare（方块的大小）这些属性。animator 属性要用于动画动作。接下来继续添加下列属性：

```swift
var leftBoundaryHeight:CGFloat!
var middleBoundaryHeight:CGFloat!
var rightBoundaryHeight:CGFloat!
var leftBoundaryWidth:CGFloat!
var middleBoundaryWidth:CGFloat!
var leftSquareCenterPointX:CGFloat!
var middleSquareCenterPointX:CGFloat!
var rightSquareCenterPointX:CGFloat!
var squareCenterPointY:CGFloat!
```

需要上述属性来设置自定义的边界，给所有的方块添加一个起始点。首先，创建 setBoundaryValues 方法来设置上述属性。

```swift
func setBoundaryValues() {
    leftBoundaryHeight = view.bounds.size.height - 100.0
    middleBoundaryHeight = view.bounds.size.height - 150.0
    rightBoundaryHeight = view.bounds.size.height - 100.0
    leftBoundaryWidth = view.bounds.size.width/3
    middleBoundaryWidth = view.bounds.size.width * 0.67
    leftSquareCenterPointX = view.bounds.size.width/6
    middleSquareCenterPointX = view.bounds.size.width/2
    rightSquareCenterPointX = view.bounds.size.width * 0.84
    squareCenterPointY = view.bounds.size.height - 400
}
```

在 **viewDidLoad** 里，调用上述方法。然后设置剩下的属性。

```swift
override func viewDidLoad() {
    super.viewDidLoad()
        
    setBoundaryValues()
            
    // 创建颜色数组
    colors = [UIColor.red, UIColor.blue, UIColor.green, UIColor.purple, UIColor.gray]
            
    // 创建方块的中心点（centerpoint）
    let leftCenterPoint = CGPoint(x: leftSquareCenterPointX, y: squareCenterPointY)
    let middleCenterPoint = CGPoint(x: middleSquareCenterPointX, y: squareCenterPointY)
    let rightCenterPoint = CGPoint(x:rightSquareCenterPointX, y: squareCenterPointY)
    centerPoint = [leftCenterPoint,middleCenterPoint,rightCenterPoint]
            
    // 设置方块的大小
    sizeOfSquare = CGSize(width: 50.0, height: 50.0) 
}
```

好了，现在每个 view 的尺寸是 50，有 5 种不同的颜色。接下来的事情都会在 **releaseNextSquare(sender:)** 方法中发生。

```swift
@IBAction func releaseSquare(_ sender: Any) {
    let newView = UIView(frame: CGRect(x: 0.0, y: 0.0, width: sizeOfSquare.width, height: sizeOfSquare.height))
        
    let randomColorIndex = Int(arc4random()%5)
    newView.backgroundColor = colors[randomColorIndex]
        
    let randomCenterPoint = Int(arc4random()%3)
    newView.center = centerPoint[randomCenterPoint]
        
    squareViews.append(newView)
    view.addSubview(newView)
}
```

创建了 view，centerPoint 的值是随机数，也赋值了颜色，该 view 被添加到了主界面上，也被添加到了数组中。在 **releaseSquare(sender:)** Action 方法的最后，添加剩下的代码。

```swift
animator = UIDynamicAnimator(referenceView: view)

// 创建重力
let gravity = UIGravityBehavior(items: squareViews)
animator.addBehavior(gravity)

// 创建碰撞检测
let collision = UICollisionBehavior(items: squareViews)
        
// 设置碰撞的边界
collision.addBoundary(withIdentifier: "leftBoundary" as NSCopying, from: CGPoint(x: 0.0,y: leftBoundaryHeight), to: CGPoint(x: leftBoundaryWidth, y: leftBoundaryHeight))
collision.addBoundary(withIdentifier: "middleBoundary" as NSCopying, from: CGPoint(x: view.bounds.size.width/3,y: middleBoundaryHeight), to: CGPoint(x: middleBoundaryWidth, y: middleBoundaryHeight))
collision.addBoundary(withIdentifier: "rightBoundary" as NSCopying, from: CGPoint(x: middleBoundaryWidth,y: rightBoundaryHeight), to: CGPoint(x: view.bounds.size.width, y: rightBoundaryHeight))
        
collision.collisionMode = .everything
animator.addBehavior(collision)
```

首先，给方块下落的动作增加了重力，接下来，在自定义边界的基础上添加了碰撞行为。默认的碰撞模式是 UICollisionBehaviour 里的 UICollisionBehaviourMode.everything，也就是说，所有的元素都可以互相碰撞。**运行**工程，不停地按 Next 按钮，方块下落。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58f7c5009de4bbbb2002c691/1492632856143/collision-detection-simulator?format=750w)

可以从 [github](https://github.com/ioscreator/ioscreator) 上下载 **IOS10CollisionDectectionTutorial** 教程的源代码。