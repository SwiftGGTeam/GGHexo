title: "快速入门指南：使用 UIViewPropertyAnimator 做动画"
date: 2017-04-20
tags: [iOS 开发]
categories: [Think and Build]
permalink: quick-guide-animations-with-uiviewpropertyanimator
keywords: 
custom_title: 
description: 

---
原文链接=http://www.thinkandbuild.it/quick-guide-animations-with-uiviewpropertyanimator/
作者=Yari D'areglia
原文日期=2016-11-20
译者=SketchK
校对=Cee
定稿=CMB

<!--此处开始正文-->

iOS 10 带来了一堆非常有意思的新特性，例如 `UIViewPropertyAnimator`。这是一个能够改善动画处理方式的新类。

它彻底改变了我们所习惯的工作流，为动画逻辑添加了一个更为精细的控制手段。

<!--more-->

## 一个简单例子

让我们看看如何创建一个改变视图中心的动画。

```swift
let animator = UIViewPropertyAnimator(duration: 1.0, curve: .easeOut){
    AView.center = finalPoint
}
animator.startAnimation()
```

![](http://www.thinkandbuild.it/wp-content/uploads/2016/11/propertyanim_simple.gif)

这里至少有 3 点值得去关注：

1. 动画是通过一个闭包来定义的，这与 UIView 的动画方法 “UIView.animation(duration:…)” 十分相似。
2. 方法返回了一个对象——animator。
3. 动画并不是立即执行，而是通过 `startAnimation()` 方法来触发执行。

## 动画状态

使用这种新方式来处理动画的不同之处就是 animator 有完整的状态机逻辑。通过 `UIViewAnimation` 协议，控件可以用一种简单明了的方式实现动画**状态**的管理，例如调用 `startAnimation`、 `pauseAnimation` 和 `stopAnimation` 函数。通过调用这些函数，我们可以更新控件的状态，使得控件在 `active`、`inactive` 和 `stopped` 状态之间转换。

![](http://www.thinkandbuild.it/wp-content/uploads/2016/11/states.png)

当动画开始或者暂停的时候，动画状态为 `active`， 当控件被创建出来且没有开始执行动画或者已经执行完动画的时候，它的状态是 `inactive`。这里还是要声明下 `inactive` 和 `stopped` 之间还是有一点区别的。当动画执行完毕或者使用 stop 命令暂停动画后，控件的状态变为 `stopped`，而在 animator 内部会调用 `finishAnimation(at:)` 来表明当前动画完毕， 然后会设置当前状态为 `inactive`，最后会调用 completion block (稍后会详细说明)

## 动画选项

在之前的例子中应该注意到了，在动画的 block 中，我们定义了两个参数：动画的 `duration` 和动画的 `curve`， 一个 `UIViewAnimationCurve` 能够表示大部分的常见动画曲线类型（ easeIn, easeOut, liner 或者 easeInOut ）。

当你需要对动画曲线做更多的设置时，你可以通过两个控制点来定义一个贝塞尔曲线

```swift
let animator = UIViewPropertyAnimator(
               duration: 1.0, 
               point1: CGPoint(0.1,0.5), 
               point2: CGPoint(0.5, 0.2){
 
        AView.alpha = 0.0
} 
```

(如果贝塞尔曲线也不能满足需求的话，可以使用 `UITimingCurveProvider` 创建一个完全自定义的曲线)

另外一个有趣的动画选项是你可以向函数传递 `dampingRatio` 参数。这与 UIView 的动画方法相似，可以通过使用一个 0 到 1 的 damping 值来实现弹跳效果。

```swift
let animator = UIViewPropertyAnimator(
               duration: 1.0,
               dampingRatio:0.4){
 
        AView.center = CGPoint(x:0, y:0)
}
```

![](http://www.thinkandbuild.it/wp-content/uploads/2016/11/damping.gif)

让动画延后执行的操作也非常简单，只需要在 startAnimation 函数中传入 `afterDelay` 参数。

```swift
animator.startAnimation(afterDelay:2.5)
```

## 动画 Block

UIViewPropertyAnimator 遵守了 `UIViewImplicitlyAnimating` 协议，这个协议赋予 UIViewPropertyAnimator 许多有趣的特性。举个例子，除了在初始化期间指定的第一个动画 block 外，还可以指定多个动画 block。


```swift
// Initialization
let animator = UIViewPropertyAnimator(duration: 2.0, curve: .easeOut){
    AView.alpha = 0.0
}
// Another animation block
animator.addAnimation{ 
    Aview.center = aNewPosition
}
animator.startAnimation()
```

![](http://www.thinkandbuild.it/wp-content/uploads/2016/11/propertyanim_alpha.gif)

你也可以在已经执行动画的代码里添加动画 block， 这个 block 会立即执行并使用剩下的时间作为其动画时长。


## 与动画的交互

在前面的内容里已经说明了我们可以通过调用 startAnimation、stopAnimation 和 pauseAnimation 等方法实现动画的循环。默认的动画循环可以通过 `fractionComplete` 属性进行修改。这个值表明了动画的完成百分比，它的取值范围在 0.0 到 1.0 之间。这样就可以通过修改 `fractionComplete` 来让循环达到预期效果（例如：用户可能会通过 slider 或者 pan 手势来实时改变参数值）

```swift
animator.fractionComplete = slider.value
```

在一些场景下，你可能想在动画执行完毕后做一些操作，`addCompletion` 允许你添加一个在动画执行完毕后才会被触发的 block。

```
animator.addCompletion { (position) in
    print("Animation completed")
}
```

position 参数是 UIViewAnimatingPosition 类型，它用于表明动画结束的位置，这个值本身是一个枚举，包含了 starting、end 和 current。通常得到的值是 end。

这就是快速入门指南的全部内容了。
我已经迫不及待地想使用这个新的动画系统来实现一些酷炫的 UI 效果了！我会在 [Twitter](https://twitter.com/bitwaker) 上分享作品 😉 Ciao！