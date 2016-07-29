title: "在 iOS 10 中使用 Swift 3 和 UIViewPropertyAnimator 编写动画"
date: 2016-07-29 10:00:00
tags: [Swift 3]
categories: [JamesonQuave.com]
permalink: recursive-tail-calls-and-trampolines-in-swift
keywords: swift3.0教程,uiviewpropertyanimator
custom_title: 
description: UIViewPropertyAnimator 是 iOS 10 中的新增的执行 View 动画的类，本文就来说下如何使用Swift 3 和 UIViewPropertyAnimator 做动画。

---
原文链接=http://jamesonquave.com/blog/designing-animations-with-uiviewpropertyanimator-in-ios-10-and-swift-3/
作者=Jason Newell
原文日期=2016-06-28
译者=冬瓜
校对=numbbbbb
定稿=numbbbbb

<!--此处开始正文-->

这是一个 iOS 10 系列教程，会介绍 iOS 10、Swift 和 XCode 8 的新特性。

> UIKit in iOS 10 now has “new object-based, fully interactive and interruptible animation support that lets you retain control of your animations and link them with gesture-based interactions” through a family of new objects and protocols.

> iOS 10 的 **UIKit** 使用一系列新对象和 `protocol` 来控制用户交互和中断动画，支持用手势操作。

简言之，iOS 10 可以让开发者更加自由宽松地控制动画计时。你可以细粒度控制自己制作的动画，易于抹除、逆向、暂停和重启动画，并重构动画帧使之平滑流畅。这些功能也可以用于控制器的转场动画。

我希望通过此文介绍一些关于新特性的基本用法，并记录一些在文档中的关键点。

<!--more-->

## 构建基础应用

我们会使用一些 `UIViewPropertyAnimator` 的新特性。首先需要一些素材。

创建一个 **single-view application**，然后在 *ViewController.swift* 中添加如下代码：

```Objective-C
import UIKit

class ViewController: UIViewController {
    // 记录拖动时的圆形视图 center
    var circleCenter: CGPoint!
     
    override func viewDidLoad() {
        super.viewDidLoad()
         
        // 添加可拖动视图
        let circle = UIView(frame: CGRect(x: 0.0, y: 0.0, width: 100.0, height: 100.0))
        circle.center = self.view.center
        circle.layer.cornerRadius = 50.0
        circle.backgroundColor = UIColor.green()
         
        // 添加拖动手势
        circle.addGestureRecognizer(UIPanGestureRecognizer(target: self, action: #selector(self.dragCircle)))
         
        self.view.addSubview(circle)
    }
     
    func dragCircle(gesture: UIPanGestureRecognizer) {
        let target = gesture.view!
         
        switch gesture.state {
        case .began, .ended:
            circleCenter = target.center
        case .changed:
            let translation = gesture.translation(in: self.view)
            target.center = CGPoint(x: circleCenter!.x + translation.x, y: circleCenter!.y + translation.y)
        default: break
        }
    }
}
```

这并不复杂。在 `viewDidLoad` 方法中，创建一个绿色背景的圆形视图并放置在当前视图中央。然后添加 `UIPanGestureRecongnizer` 实例来感知拖动圆形视图的手势并调用 `dragCircle` 方法。你应该已经猜到执行效果了：

![](http://i0.wp.com/jamesonquave.com/blog/wp-content/uploads/Rev-1.png?zoom=2&resize=432%2C702)

## UIViewPropertyAnimator 介绍

`UIViewPropertyAnimator` 是修改动画属性的核心类，它提供了中断动画、修改动画中间过程的功能。`UIViewpropertyAnimator` 维护了一个动画集合，可以无缝连接新动画和原有动画。

> 注意：`UIViewPropertyAnimator` 有些拗口，我在下文将使用`animator` 来代替。

如果两个或多个动画需要同时改变相同的属性，则会遵循“后者优先”原则。有趣的是，这将导致卡顿，因为需要组合新旧动画。在旧动画淡出的同时会隐约看见新动画。

> 后者优先：`UIViewPropertyAnimator` 实例中靠后添加的动画或者执行时间更晚的动画会覆盖之前的效果。

## 暂停和恢复动画

我们继续扩展上面的动画，增加一个动画效果：原型视图被拖动时会扩大到原尺寸的两倍，停止拖动时该视图会缩小到原尺寸。

首先给 animator 添加一个属性和一个持续时间。

```swift
// ...
class ViewController: UIViewController {
    // 我们将在拖拽响应事件上附加不同的动画
    var circleAnimator: UIViewPropertyAnimator!
    let animationDuration = 4.0
// ...

```

在 `viewDidLoad:` 中对 `animator` 初始化： 

```swift
// ...
// 可选动画参数
circleAnimator = UIViewPropertyAnimator(duration: animationDuration, curve: .easeInOut, animations: { 
[unowned circle] in
    // 放大凉别
    circle.transform = CGAffineTransform(scaleX: 2.0, y: 2.0)
})
// self.view.addSubview(circle) here
// ...
```

初始化 `circleAnimator` 时, 我们需要传入持续时间和动画曲线。 `curve` 参数可设定为四种简单的曲线之一。在本例中使用的是 `easeInOut`。其他三种是 `easeIn`、`easeOut` 和 `linear`。我们使用一个闭包来实现圆形视图变大动画。

现在需要一个方法来触发动画。修改一下 `dragCircle:`。在这段代码中，通过拖动视图来触发动画，通过 `circleAnimator.isReversed` 来判断动画缩放状态。

```Swift
func dragCircle(gesture: UIPanGestureRecognizer) {
    let target = gesture.view!
     
    switch gesture.state {
    case .began, .ended:
        circleCenter = target.center
         
        if (circleAnimator.isRunning) {
            circleAnimator.pauseAnimation()
            circleAnimator.isReversed = gesture.state == .ended
        }
        circleAnimator.startAnimation()
         
        // animator 三个重要属性
        print("Animator isRunning, isReversed, state: \(circleAnimator.isRunning), \(circleAnimator.isReversed), \(circleAnimator.state)")
    case .changed:
        let translation = gesture.translation(in: self.view)
        target.center = CGPoint(x: circleCenter!.x + translation.x, y: circleCenter!.y + translation.y)
    default: break
    }
}
```

运行代码，长按，感受一下新动画。

> 译者注：该部分完整代码详见[version_1.swift](https://github.com/dgytdhy/SwiftGG-Translation-Demo/blob/master/Designing%20Animations%20with%20UIViewPropertyAnimator%20in%20iOS%2010%20and%20Swift%203/version_1.swift)。

## 注意

动画结束时，如下图所示：

![](http://i0.wp.com/jamesonquave.com/blog/wp-content/uploads/Rev-2.png?zoom=2&resize=404%2C674)

圆形视图不再缩放，停止在放大后的尺寸。

到底发生了什么？简单来说，动画结束后，其引用自动释放了。

animator 有三种状态：

* inactive（休眠）：初始状态, 以及动画完成后的状态（可以过渡到 *active*）
* active（激活）：动画正在执行（可以过渡到 `stopped` 或者 `inactive`）
* stopped（停止）：调用 `animator` 的 `stopAnimation:` 方法（过渡到 *inactive*）

来看下图示：

![](http://static.zybuluo.com/numbbbbb/iku81lw1narjynpw485nq1c2/app-state.jpg)（译者注：为了方便大家阅读，附加了对应的中文翻译。）

（图片来源于[UIViewAnimating protocol reference](https://developer.apple.com/reference/uikit/uiviewanimating)）

只要过渡到 *inactive* 状态，就会导致 `animator` 清除所有动画（并执行 `animator` 的完成回调函数）

我们已经介绍了 `startAnimation` 方法，下面介绍另外两个状态。

要修复本节的问题，需要修改 `circleAnimator` 的初始化方法：

```swift
expansionAnimator = UIViewPropertyAnimator(duration: expansionDuration, curve: .easeInOut)
```

> 译者注：这里原作者写错了 duration 参数名称，expansionDuration 应该改成 animationDuration。

修改 `dragCircle` 方法：

```swift
// ...
// dragCircle:
case .began, .ended:
    circleCenter = target.center
         
    if circleAnimator.state == .active {
        // 使animator为inactive状态
        circleAnimator.stopAnimation(true)
    }
     
    if (gesture.state == .began) {
        circleAnimator.addAnimations({
            target.transform = CGAffineTransform(scaleX: 2.0, y: 2.0)
        })
    } else {
        circleAnimator.addAnimations({
            target.transform = CGAffineTransform.identity
        })
    }
 
case .changed:
// ...
```

无论用户开始还是停止拖拽，我们都让 `animator` 停止并完成（只要它处于*active*状态）。`animator` 会清除关联动画并返回到 *inactive* 状态。然后，我们添加一个新动画，让圆形视图回到正确状态。

使用 `transform` 的好处是，你可以直接把 `transform` 属性设置为 `CGAffineTransform.identity` 来还原视图，无需记录初值。

`circleAnimator.stopAnimation(true)` 相当于这两行代码：

```swift
circleAnimator.stopAnimation(false) // 不要结束（保持在 stop 状态）
circleAnimator.finishAnimation(at: .current) // 设置视图动画属性
```

`finishAnimationAt:` 方法接受一个 `UIViewAnimatingPosition` 参数。如果我们已经到达 *start* 和 *end*，原型视图的动画变形状态将会改变。

> 译者注：以上部分完整代码详见[version_2.swift](https://github.com/dgytdhy/SwiftGG-Translation-Demo/blob/master/Designing%20Animations%20with%20UIViewPropertyAnimator%20in%20iOS%2010%20and%20Swift%203/version_2.swift)。

## 动画时间

我们的代码还有一个小问题。每次终止并开始一个新动画时，**新动画都会持续4.0秒**，哪怕当前状态已经很接近终止状态。

修改一下代码：

```swift
// dragCircle:
// ...
case .began, .ended:
    circleCenter = target.center
     
    let durationFactor = circleAnimator.fractionComplete // 记录完成进度
    // 在原始进度上增加新动画
    circleAnimator.stopAnimation(false)
    circleAnimator.finishAnimation(at: .current)
     
    if (gesture.state == .began) {
        circleAnimator.addAnimations({
            target.backgroundColor = UIColor.green()
            target.transform = CGAffineTransform(scaleX: 2.0, y: 2.0)
        })
    } else {
        circleAnimator.addAnimations({
            target.backgroundColor = UIColor.green()
            target.transform = CGAffineTransform.identity
        })
    }
     
    circleAnimator.startAnimation()
    circleAnimator.pauseAnimation()
    // 剩余时间完成新动画
    circleAnimator.continueAnimation(withTimingParameters: nil, durationFactor: durationFactor)
case .changed:
// ...
```

我们主动停止动画，在原动画末尾加入新动画并启动，通过 `continueAnimationWithTimingParameters: durationFactor:` 来确定第一个动画的剩余时间。这样就解决了刚才的固定时间问题。 `continueAnimationWithTimingParameters: durationFactor:` 这个方法也能动态修改动画的持续时间。

> 译者注：**fractionComplete**: 这个属性在 `NSProgress` 中也有涉及，不过 `NSProgress` 的属性为 `fractionCompleted`。其含义与此处类似，都是使用 0.0-1.0 之间的浮点数来表示一段连续动作的完成比例。

\* 当你变化后的动画（相比于之前的动画）拥有不同的时间曲线函数，动画在过渡时会插入到旧时间继续执行。例如，从一个弹性时间曲线过渡到线性时间曲线，动画在线性变化之前会有一段弹性时间部分。

> 译者注：该部分完整代码详见[version_3.swift](https://github.com/dgytdhy/SwiftGG-Translation-Demo/blob/master/Designing%20Animations%20with%20UIViewPropertyAnimator%20in%20iOS%2010%20and%20Swift%203/version_3.swift)。

## 时间曲线函数

新的时间曲线函数时间曲线函数要比原来的更加合理。

Swift 3 兼容了旧的 `UIViewAnimationCurve`（例如在本文示例中使用的 `easeInOut` 这类静态曲线函数），还新增了两个新的时间曲线函数对象：`UISpringTimingParameters` 和`UICubicTimingParameters`。

### *UISpringTimingParameters*

`UISpringTimingParameters` 的实例需要设置*阻尼系数（damping）*、*质量参数（mass）*、*刚性系数（stiffness）*和*初始速度（initial velocity）*。这些参数会带入给定公式，让动画更加真实。虽然不需要使用，但是初始化动画时必须传入*持续时间*参数，`UISpringTimingParameters` 会忽略它。这个参数可以兼容旧的时间曲线函数。

下面来看一个实例，使用弹簧动画把圆形视图约束在屏幕中心：

#### *ViewController.swift*

```swift 
import UIKit
 
class ViewController: UIViewController {
    // 记录拖动时的圆形视图中心
    var circleCenter: CGPoint!
    // 后面会在拖拽响应事件上附加不同的动画
    var circleAnimator: UIViewPropertyAnimator?
     
    override func viewDidLoad() {
        super.viewDidLoad()
         
        // 添加一个可拖动视图
        let circle = UIView(frame: CGRect(x: 0.0, y: 0.0, width: 100.0, height: 100.0))
        circle.center = self.view.center
        circle.layer.cornerRadius = 50.0
        circle.backgroundColor = UIColor.green()
         
        // 添加拖动手势
        circle.addGestureRecognizer(UIPanGestureRecognizer(target: self, action: #selector(self.dragCircle)))
         
        self.view.addSubview(circle)
    }
     
    func dragCircle(gesture: UIPanGestureRecognizer) {
        let target = gesture.view!
         
        switch gesture.state {
        case .began:
             if circleAnimator != nil && circleAnimator!.isRunning {
                circleAnimator!.stopAnimation(false)
            }
            circleCenter = target.center
        case .changed:
            let translation = gesture.translation(in: self.view)
            target.center = CGPoint(x: circleCenter!.x + translation.x, y: circleCenter!.y + translation.y)
        case .ended:
            let v = gesture.velocity(in: target)
            // 500 这个随机值看起来比较合适，你也可以基于设备宽度动态设置
            // y 轴的速度分量通常被忽略，不过操作视图中心时需要使用
            let velocity = CGVector(dx: v.x / 500, dy: v.y / 500)
            let springParameters = UISpringTimingParameters(mass: 2.5, stiffness: 70, damping: 55, initialVelocity: velocity)
            circleAnimator = UIViewPropertyAnimator(duration: 0.0, timingParameters: springParameters)
             
            circleAnimator!.addAnimations({
                target.center = self.view.center
            })
            circleAnimator!.startAnimation()
        default: break
        }
    }
}
```

拖动圆形视图，让动画运行起来。这里我们把矢量速度（velocity）传入 `initialVelocity: ` 并用弹性时间曲线函数（Sprint Timing）作为 `parameters:` 参数，这样圆形视图不仅会返回起始点，释放时还会保持原有动量。

```swift
// dragCircle: .ended:
// ...
let velocity = CGVector(dx: v.x / 500, dy: v.y / 500)
let springParameters = UISpringTimingParameters(mass: 2.5, stiffness: 70, damping: 55, initialVelocity: velocity)
circleAnimator = UIViewPropertyAnimator(duration: 0.0, timingParameters: springParameters)
// ...
```

![](http://i2.wp.com/jamesonquave.com/blog/wp-content/uploads/Animations-2-1.png?zoom=2&resize=320%2C533)

>  为了跟踪动画路径，我绘制了一些圆点。原本笔直的路径稍显弯曲，因为释放圆形视图，中心点会以弹簧效果的形式向中心“拉拽”，到达终点后动量仍旧保留。   

<br \>  

> 译者注：该部分完整代码详见[version_4.swift](https://github.com/dgytdhy/SwiftGG-Translation-Demo/blob/master/Designing%20Animations%20with%20UIViewPropertyAnimator%20in%20iOS%2010%20and%20Swift%203/version_4.swift)。

### *UICubicTimingParameters*

`UICubicTimingParameters` 允许通过多个控制点（control point）来定义三阶贝塞尔曲线。需要注意的是，在 0.0~1.0 范围外的点会修正到范围内。

```swift
// 为 y 设置对应的值
let curveProvider = UICubicTimingParameters(controlPoint1: CGPoint(x: 0.2, y: -0.48), controlPoint2: CGPoint(x: 0.79, y: 1.41))
expansionAnimator = UIViewPropertyAnimator(duration: expansionDuration, timingParameters: curveProvider)
```

如果你仍不满足这些时间曲线函数，可以通过 `UITimingCurveProvider` 协议来实现更加合适的曲线函数。

### 动画抹除

你可以给 `animator` 的 `fractionComplete` 传入一个 0.0-1.0 的浮点数，使其在对应位置暂停。如果传入 0.5，无论时间曲线函数是什么，动画都会停止在一半状态的位置。需要注意的是，当动画重新开始时，其衔接位置将会映射到给定的时间曲线函数曲线上，所以 `fractionComplete = 0.5` 并不代表已经运行了一半时间。

我们来做个实验。首先在 `viewDidLoad` 尾部初始化 `animator` 并传入两个动画：

```swift
// viewDidLoad:
// ...
circleAnimator = UIViewPropertyAnimator(duration: 1.0, curve: .linear, animations: {
    circle.transform = CGAffineTransform(scaleX: 3.0, y: 3.0)
})
     
circleAnimator?.addAnimations({ 
    circle.backgroundColor = UIColor.blue()
}, delayFactor: 0.75)
// ...
```

这次不调用 `startAnimation` 方法。圆圈会随着动画而逐渐变大，视图背景在 75% 处开始变成蓝色。

重写一下 `dragCircle:` 方法：

```swift
func dragCircle(gesture: UIPanGestureRecognizer) {
    let target = gesture.view!
     
    switch gesture.state {
    case .began:
        circleCenter = target.center
    case .changed:
        let translation = gesture.translation(in: self.view)
        target.center = CGPoint(x: circleCenter!.x + translation.x, y: circleCenter!.y + translation.y)
         
        circleAnimator?.fractionComplete = target.center.y / self.view.frame.height
    default: break
    }
}
```

现在拖拽圆形视图时会更新 `animator` 的 `fractionComplete` 属性，从而达到不同的效果：

![](http://i2.wp.com/jamesonquave.com/blog/wp-content/uploads/Rev-3.png?zoom=2&resize=432%2C702)![](http://i2.wp.com/jamesonquave.com/blog/wp-content/uploads/Rev-4.png?zoom=2&resize=432%2C702)

这里我使用的是线性曲线函数，你也可以基于这个例子实现其他函数。这个改变颜色的动画遵循一个压缩过的时间曲线。

> 自定义 `animator` 的动画进程需要使用 0.0-1.0 范围内的浮点数表示，如果超出范围，则会取该数据临近的端界值（即 0 或 1）。

<br />
> 译者注：该部分完整代码详见[version_5.swift](https://github.com/dgytdhy/SwiftGG-Translation-Demo/blob/master/Designing%20Animations%20with%20UIViewPropertyAnimator%20in%20iOS%2010%20and%20Swift%203/version_5.swift)。

## 扩展性

最后我想强调一点：*Don't like something? Change it!* （译者注：“看着不爽？自己动手！”）你可以根据动画需要来实现各种时间曲线函数。

此外，这会进一步解耦协议和类，很多源码中的协议都能做到这一点。这会使开发更加便捷，我也希望能有更多开发者去深入探索。