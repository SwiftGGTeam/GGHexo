title: "通过 Core Graphics 绘制渐变颜色"
date: 2017-01-05
tags: [iOS 入门, Swift 入门]
categories: [IOSCREATOR]
permalink: draw-gradients-core-graphics-tutorial-ios10
keywords: Core Graphics, 渐变颜色
custom_title: 
description: 本文详细描述从创建工程到绘制渐变颜色

---
原文链接=https://www.ioscreator.com/tutorials/draw-gradients-core-graphics-tutorial-ios10
作者=Arthur Knopper
原文日期=2016-10-18
译者=冬瓜
校对=星夜暮晨
定稿=CMB

<!--此处开始正文-->

Core Graphics 是一套非常强大的底层 API 接口集合。在这篇教程中，我们将借助 Core Graphics 来创建渐变颜色。出于简便起见，我们将创建线性渐变 (linear gradients)。所谓线性渐变，是从一个点到另外一个点颜色过渡的描述。我们将会创建一个从左向右渐变的视图。该教程的实验环境是 Xcode 8 和 iOS 10。

<!--more-->

首先打开 Xcode 创建一个 *Single View Application*。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5804d3c1b3db2b01469b94c1/1476711380019/?format=1500w)

点击 *Next*。输入 *product name*，填写 **IOS10DrawGradientsTutorial** 然后将 *Organization Name* 和 *Organization Identifier* 这两项按照你的习惯来填写。将 *Language* 设置为 *Swift* ，并且确定 *Devices* 选项为 *iPhone*。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5804d422197aea7e4af070ec/1476711476087/?format=1500w)

在我们的工程中添加一个新文件。选择 **iOS->Source->Cocoa Touch Class**。将新的 Class 命名为 *GradientView* 并且确定其继承自 *UIView* 类。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5804d4bb893fc04c1969a8d7/1476711626406/?format=1500w)

转到 **storyboard** 中，在 *Document Outline* 选择要编辑的视图，然后点击 *Identity Inspector* 选项卡，在 *Custom Class* 一栏中将 *Class* 选择 *GradientView* 。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5804d53dcd0f6803b406290b/1476711750764/customClass.png?format=500w)

打开文件 `gradientView.swift` ，并修改 `drawRect` 方法：

```swift
override func draw(_ rect: CGRect) {
    // 1
    guard let currentContext = UIGraphicsGetCurrentContext() else { return }
       
    // 2
    currentContext.saveGState()
        
    // 3
    let colorSpace = CGColorSpaceCreateDeviceRGB()
        
    // 4
    let startColor = UIColor.red
    guard let startColorComponents = startColor.cgColor.components else { return }
        
    let endColor = UIColor.blue
    guard let endColorComponents = endColor.cgColor.components else { return }
        
    // 5
    let colorComponents: [CGFloat]
            = [startColorComponents[0], startColorComponents[1], startColorComponents[2], startColorComponents[3], endColorComponents[0], endColorComponents[1], endColorComponents[2], endColorComponents[3]]
        
    // 6
    let locations:[CGFloat] = [0.0, 1.0]
        
    // 7
    guard let gradient = CGGradient(colorSpace: colorSpace,colorComponents: colorComponents,locations: locations,count: 2) else { return }
        
    let startPoint = CGPoint(x: 0, y: self.bounds.height)
    let endPoint = CGPoint(x: self.bounds.width,y: self.bounds.height)
        
    // 8
    currentContext.drawLinearGradient(gradient, start: startPoint, end: endPoint, options: CGGradientDrawingOptions(rawValue: UInt32(0)))
        
    // 9
    currentContext.restoreGState()
}
```

1. `UIGraphicsGetCurrentContext` 得到了图形上下文 (graphical context)，这里可以当做一个新的画布。
2. 图形上下文将被存储，以便于之后的存储操作。
3. `CGColorSpace` 描述的是颜色的域值范围。大多情况下你会使用到 RGB 模式来描述颜色。
4. 这里我们定义一个渐变样式的起始颜色和结束颜色。`CGColor` 对象是底层颜色接口的定义。这个接口方法会从 `CGColor` 中获取指定颜色。
5. 在这个数组中，将 RGB 颜色分量和 alpha 值写入。
6. 在此处可以定义各种颜色的相对位置。
7. `CGGradient` 用来描述渐变信息。
8. 这里渐变将沿纵轴 (vertical axis) 方向绘制。
9. 存储图形上下文。

**编译并运行**我们的工程：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5804d734893fc04c1969c470/1476712254769/?format=750w)

可以从我的 [Github](https://github.com/ioscreator/ioscreator) 上下载本篇文章的示例代码。