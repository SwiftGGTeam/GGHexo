title: "利用 CAGradientLayer 实现渐变色效果"
date: 2016-09-13
tags: [iOS 开发]
categories: [AppCoda]
permalink: cagradientlayer
keywords: 
custom_title: 
description: 

---
原文链接=http://www.appcoda.com/cagradientlayer/
作者=GABRIEL THEODOROPOULOS
原文日期=2016-07-16
译者=冬瓜
校对=saitjr
定稿=CMB

<!--此处开始正文-->

每个开发者在开发一个 app 时，为了优化用户体验，会使用多种颜色和多个图片。但纯色的表现力有一定的局限，有时候使用渐变色能够带来更棒的体验。我曾经做过一些渐变色，我觉得应该将我的经验和大家分享一下。有许多值得学习的技巧。

<!--more-->

如何简单而又轻松的做出一个渐变效果？有三种方法。第一种方法是最捷径的，直接使用渐变效果的图片。但是最大的缺点是你无法控制渐变的幅度，除非你对每一种状态制作一个图像。这个工程量十分巨大。第二种方法是使用 Core Graphics ，但是你需要掌握关于 CG 的知识（例如图形的上下文，色彩空间，等等）。另外 Core Graphics 框架是面向高级开发者的，很多新手不善于使用，从而无法做出渐变效果。所以我推荐的是下面这种方法，即便捷又简单的方法：利用 `CAGradientLayer` 对象。

 `CAGradientLayer` 是视图成员 `CALayer` 的子类。可以使用它来达到渐变效果。产生一个简单的颜色梯度仅需四行左右的代码，同时它还提供了一些属性用于调整效果。如果你多尝试下，会使效果更加生动，在文章后面部分将会讨论所有细节。有一点你要注意：需要在 view 的 `layer` 层上展示 `CAGradientLayer` 。所以你所有的编码都是在 `layer` 层上进行。 `CAGradientLayer` 美中不足的是，它不支持辐射渐变，但是如果你确实需要的话可以通过 `CAGradientLayer` 来扩展实现。

在下文中我将会说明使用渐变效果中的各处细节。而其中使用到的颜色以我自身审美为准，并且使用双色会使说明变得简单。当然这只是一个 demo，可能实际中你所需要的并不止两种颜色。

## 创建 Gradient Layer

使用 layer 创建一个渐变色十分简单，只有一些必要操作。需要设置一些属性值，然后做一些后期调整。可能在后期在微调渐变色颜色梯度会占用你绝大多数时间；不同的属性值会呈现不同的效果。

创建一个工程，我们会用其逐步学习每个细节。下面开始创建，选用 Sigle View Application 这个 template 。完成后，继续往下阅读。

假设选择有一个新的工程，打开 `ViewController.swift` 并定义一下属性：

```swift
var gradientLayer: CAGradientLayer!
```

这个 `gradientLayer` 将是我们的测试对象。对于渐变效果最简易的实现，我们需要按照一下步骤来设置一个渐变图层，从而使得目标视图得以实现想象中的效果：

1. 初始化 `CAGradientLayer` 对象（例子中的 `gradientLayer`）。
2. 设置 `gradientLayer` 的 `frame`。
3. 设置用于产生渐变效果的颜色。
4. 将 `gradientLayer` 作为 sublayer 添加至视图 layer 中。

除上述步骤之外，其实我们还可以设置其他的一些属性。下文将会介绍。现在我们只关注上述部分。为了简单起见，我们使用 `ViewController` 类来作为实验视图，并使用渐变色将其填充。

在 `ViewController` 中需要创建一个新方法，为 `gradientLayer` 初始化和设置一些默认值：

```swift
func createGradientLayer() {
    gradientLayer = CAGradientLayer()
    gradientLayer.frame = self.view.bounds
    gradientLayer.colors = [UIColor.redColor().CGColor, UIColor.yellowColor().CGColor]
    self.view.layer.addSublayer(gradientLayer)
}
```

我们来解释一下上面的代码：首先，我们初始化了一个 `CAGradientLayer` 对象。然后设置了它的 `frame` 等于 `ViewController.view` 的 `bounds` 属性。下一步，我们选用了一些颜色来作为渐变主颜色。最后，我们将 `gradientLayer` 作为 sublayer 添加到主 layer 中。

如果在 `viewWillAppear(_: )` 调用上述函数：

```swift
override func viewWillAppear(animated: Bool) {
    super.viewWillAppear(animated)
    createGradientLayer()
}
```

在运行工程后会看到以下效果：

![](http://www.appcoda.com/wp-content/uploads/2016/07/t53_1_first_gradient.png)

## 渐变色

尽管之前的代码十分简单，但其中一行包含着一个重要的属性：颜色属性。显而易见，如果不设置该属性，则不会看到渐变效果。其次，颜色数组（定义时候是一个 `AnyObject` 类型的数组）的元素不是 `UIColor` 类型；取而代之的是 `CGColor` 类型。在上述例子中我仅使用了两种颜色，其实你可以传入更多的颜色，如同下例：

```swift
gradientLayer.colors = [UIColor.redColor().CGColor, UIColor.orangeColor().CGColor, UIColor.blueColor().CGColor, UIColor.magentaColor().CGColor, UIColor.yellowColor().CGColor]
```

运行后将会看到如下效果：

![](http://www.appcoda.com/wp-content/uploads/2016/07/t53_2_second_gradient.png)

`colors` 属性是兼容动画的，也就是说如果我们可以通过动画来改变颜色渐变效果。来实验一下，先来构造一个颜色数组的集合。然后我们将会让每个颜色集（每个颜色数组）在我们点击的时候进行替换，并且通过动画方式。

首先，我们回到 `ViewController` ，在 `gradientLayer` 之后再来声明两个新属性：

```swift
var colorSets = [[CGColor]]()
var currentColorSet: Int!
```

`colorSets` 数组用来存储颜色集。 `currentColorSet` 将做为获取颜色集的索引下标。

下面来创建颜色集。所选用的颜色仅仅是个范例，你可以根据自身需求来修改：

```swift
func createColorSets() {
    colorSets.append([UIColor.redColor().CGColor, UIColor.yellowColor().CGColor])
    colorSets.append([UIColor.greenColor().CGColor, UIColor.magentaColor().CGColor])
    colorSets.append([UIColor.grayColor().CGColor, UIColor.lightGrayColor().CGColor])
 
    currentColorSet = 0
}
```

在上述方法中，除了刚刚定义的颜色集合矩阵，并附加到 `colorSets` ，我们还需要给 `currentColorSet` 属性赋初值。

然后在 `viewDidLoad()` 方法中调用，以便于我们的 app 执行这段代码：

```swift
override func viewDidLoad() {
    super.viewDidLoad()
 
    createColorSets()
}
```

也需要对 `createGradientLayer()` 方法小改。找到下面这行代码：

```swift
gradientLayer.colors = [UIColor.redColor().CGColor, UIColor.orangeColor().CGColor, UIColor.blueColor().CGColor, UIColor.magentaColor().CGColor, UIColor.yellowColor().CGColor]
```

并将其替换成：

```swift
gradientLayer.colors = colorSets[currentColorSet]
```

现在我们选用数组通过 `currentColorSet` 来指定选用颜色集，从而替换了之前的固定颜色集。

如我之前说的，我们将通过点击手势来触发视图来触发颜色过渡动画。这意味着我们需要添加一个点击手势，因此在 `viewDidLoad()` 中加入如下代码：

```swift
override func viewDidLoad() {
    ...
 
    let tapGestureRecognizer = UITapGestureRecognizer(target: self, action: #selector(ViewController.handleTapGesture(_:)))
    self.view.addGestureRecognizer(tapGestureRecognizer)
}
```

`handleTapGesture(_:)` 方法在点击手势触发后会被调用。我们需要显示创建。需要注意的是，`CABasicAnimation` 用于改变 layer 的 `colors` 属性。这里需要你对于 `CABasicAnimation` 有一定的了解以及对动画有一定的知识储备，如果没有，请迅速搜索相关知识补充一下。在下例中，我仅仅实现我们需求而不去添加其他拓展性知识。

```swift
func handleTapGesture(gestureRecognizer: UITapGestureRecognizer) {
    if currentColorSet < colorSets.count - 1 {
        currentColorSet! += 1
    }
    else {
        currentColorSet = 0
    }
 
    let colorChangeAnimation = CABasicAnimation(keyPath: "colors")
    colorChangeAnimation.duration = 2.0
    colorChangeAnimation.toValue = colorSets[currentColorSet]
    colorChangeAnimation.fillMode = kCAFillModeForwards
    colorChangeAnimation.removedOnCompletion = false
    gradientLayer.addAnimation(colorChangeAnimation, forKey: "colorChange")
}
```

首先我们需要确定下一个颜色集的下标是多少。如果使用的颜色集合是数组中的最后一个，我们需要重新计数下标（ `currentColorSet = 0` ），如果不是上述情况，让 `currentColorSet` 自加一即可。

接下来的代码是关于动画的。这里面最重要的属性是 `duration` ，它代表着动画的过渡时长；另外， `toValue`  属性用来设置终点状态的期望颜色集 （这些是在 `CABasicAnimation` 类初始化时需要指定的属性）。另外两个属性用来将动画的最终状态保留在 layer 中，而不还原回之前状态。但是这不是持续的，我们需要在动画结束后，显式设置渐变色。我们通过重写以下方法，可以在 `CABasicAnimation` 结束后执行需要的操作：

```swift
override func animationDidStop(anim: CAAnimation, finished flag: Bool) {
    if flag {
        gradientLayer.colors = colorSets[currentColorSet]
    }
}
```

并且还需要增加 `handleTapGesture(_:)` 方法，就能看到效果了：

```swift
func handleTapGesture(gestureRecognizer: UITapGestureRecognizer) {
    ...
 
    // 设置 colorChangeAnimation 的代理者为 ViewController
    colorChangeAnimation.delegate = self
 
    gradientLayer.addAnimation(colorChangeAnimation, forKey: &quot;colorChange&quot;)
}
```

如此，我们便可看见颜色渐变动画过度。我将其动画时长设置为2秒，以便大家看清变幻过程。

![](http://www.appcoda.com/wp-content/uploads/2016/07/t53_3_color_change_2.gif)

## 颜色相对坐标

至此，我们已经学习了如何设置和修改渐变颜色的基础知识，但是这远不足于去完全控制渐变效果。对于修改各个区域的覆盖色以及重写颜色布局也是十分重要的。

回顾一下上文用例中的效果，你会发现在默认情况下每一刻颜色域大小为整块均分而来的。

![](http://www.appcoda.com/wp-content/uploads/2016/07/t53_1_first_gradient.png)

其实，这个可以通过 `CAGradientLayer` 的 `locations` 属性来设置。该属性需要传入一个 `NSNumber` 对象数组，每个数字确定了每个颜色的*起始位置（starting location）*。另外，这些数字是浮点数，取值范围在 0.0 到 1.0 之间。

举个例子。在 `createGradientlayer()` 方法中，添加如下代码：

```swift
gradientLayer.locations = [0.0, 0.35]
```

再次运行工程会显示以下效果：

![](http://www.appcoda.com/wp-content/uploads/2016/07/t53_5_locations_1.png)

第二个颜色的起始位置是我们在 `locations` 数组中第二个值。可以计算出第二种颜色面积在整个 layer 面积中所占比例为 65% （1.0 - 0.35 = 0.65）。保险起见，要保证数组从左到右的递增性数学，否则将会发生颜色重叠现象：

![](http://www.appcoda.com/wp-content/uploads/2016/07/t53_6_locations_overlap.png)

如果你想得到上面的错误情况，只需要设置位置数组为 [0.5, 0.35] 即可。

下面，我们来做一个有些难度的例子，来对视图添加一个新的点击手势。这一次，需要双指操作。在 `viewDidLoad()` 中增加以下代码：

```objc
override func viewDidLoad() {
    ...
 
    let twoFingerTapGestureRecognizer = UITapGestureRecognizer(target: self, action: #selector(ViewController.handleTwoFingerTapGesture(_:)))
	twoFingerTapGestureRecognizer.numberOfTouchesRequired = 2
	self.view.addGestureRecognizer(twoFingerTapGestureRecognizer)
}
```

在 `handleTwoFingerTapGesture(_:)` 方法中，随机创建两个颜色的位置。并且，增加第一个位置总比第二个位置坐标相对值小的约束。另外，每次在控制台中输出新的位置。如下：

```objc
func handleTwoFingerTapGesture(gestureRecognizer: UITapGestureRecognizer) {
    let secondColorLocation = arc4random_uniform(100)
    let firstColorLocation = arc4random_uniform(secondColorLocation - 1)
    gradientLayer.locations = [NSNumber(double: Double(firstColorLocation)/100.0), NSNumber(double: Double(secondColorLocation)/100.0)]
    print(gradientLayer.locations!)
}
```

当你使用双指点击后，查看到以下效果：

![](http://www.appcoda.com/wp-content/uploads/2016/07/t53_7_change_locations.gif)

需要注意的是， `location` 成员的默认值为 nil，所以这里可能会造成 crash 。另外，为了简化用例，我在这里只用了两种颜色，当需求需要更多的颜色时，如上方式讨论每一种情况即可。

## 渐变方向

在学习属性 `colors` 操作的基础上，继续来看看如何解决颜色的渐变方向问题。首先，我们再次看以下截图：

![](http://www.appcoda.com/wp-content/uploads/2016/07/t53_1_first_gradient.png)

你会发现渐变效果方向是从上方开始竖着方向向下延伸。其实，这个是默认的渐变梯度方向，我们可以覆盖这个效果，从而得到我们需求的渐变方向。

`CAGradientLayer` 提供了两个属相可以让我们自由的设定渐变颜色梯度方向：

* `startPoint`
* `endPoint`

使用 `CGPoint` 变量可以设置以上两个属性，并且**其 x 和 y 的数值都必须在 0.0 到 1.0  的范围内**。实际上，属性 `startPoint` 描述的是第一颜色的起始坐标， `endPoint` 自然描述了最后一点的坐标，从而通过两个点的位置确定，确定了渐变梯度的方向。需要注意的细节是，**这两个坐标点用来描述操作系统中的空间位置**。

如何理解呢？

便于理解，我们来看以下示意图：

![](http://www.appcoda.com/wp-content/uploads/2016/07/t53_8_iPhone_image.png)

在 iOS 中，`zero` 点（起始点）位置为屏幕的左上角（x = 0.0, y = 0.0），而右下角自然就是终点位置（x = 1.0, y = 1.0）。在描述其他点的时候，对应的 x 和 y 都必须限制在 0.0 到 1.0 之间。

上述的坐标描述并不适用在其他操作系统中。例如在 macOS 中（这里用 TextEdit）举例：

![](http://www.appcoda.com/wp-content/uploads/2016/07/t53_9_mac_window.png)

起始点在左下角，而终点在右上角，这是完全不同于 iOS 的。

默认情况下，渐变梯度的 `startPoint` 为 (0.5, 0.0)，而 `endPoint` 为 (0.5, 1.0)。可以注意到 `x` 会保持相等，而 `y` 值范围在 0.0 （上端点） 到 1.0 （下端点） 之间，并从上到下保持竖直渐变。如果想看到一种不同于默认的渐变效果，只需要在 `createGradientLayer()` 方法中，增加下列代码：

```swift
func createGradientLayer() {
    ...
    gradientLayer.startPoint = CGPointMake(0.0, 0.5)
    gradientLayer.endPoint = CGPointMake(1.0, 0.5)
}
```

在该例中，`x` 方向坐标值将从 0.0 到 1.0，`y` 保持中心位置不变。这将会使得渐变梯度方向变为向右朝向：

![](http://www.appcoda.com/wp-content/uploads/2016/07/t53_10_gradient_right.png)

为了理解梯度方向，通多对 `x` 和 `y` 设定任意 0.0 到 1.0 间的数值，来查看一下效果。下例中，将加入有趣的新功能，来生动的演示渐变方向：对视图增加一个*拖动手势（pan gesture）*，并且依靠手势的触发位置，响应的改变渐变梯度方向。我们将会支持以下方向：

* 上朝向（Towards Top）
* 下朝向（Towards Bottom）
* 右朝向（Towards Right）
* 左朝向（Towards Left）
* 斜向右下（From Top-Left to Bottom-Right）
* 斜向左下（From Top-Right to Bottom-Left）
* 斜向右上（From Bottom-Left to Top-Right）
* 斜向左上（From Bottom-Right to Top-Left）

回到我们的示例中，创建一个枚举类型来描述梯度方向：

```swift
enum PanDirections: Int {
    case Right
    case Left
    case Bottom
    case Top
    case TopLeftToBottomRight
    case TopRightToBottomLeft
    case BottomLeftToTopRight
    case BottomRightToTopLeft
}
```

然后，在 `ViewController` 创建一个新的属性来描述渐变梯度方向：

```swift
var panDirection: PanDirections!
```

`panDirection` 属性根据手指的移动将会得到相应的值。我们需要解决的两个问题：首先，我们需要确定方向，并赋予该属性对应的数值。之后，需要检测手势方向，去确定 `startPoint` 和 `endPoint` 这两个属性的数值。

当然在这些工作之前，我们需要创建一个拖动手势的 recogniser 对象，添加到视图上。在 `viewDidLoad()` 方法中，加入以下代码：

```swift
override func viewDidLoad() {
    ...
 
    let panGestureRecognizer = UIPanGestureRecognizer(target: self, action: #selector(ViewController.handlePanGestureRecognizer(_:)))
    self.view.addGestureRecognizer(panGestureRecognizer)
}
```

在 `handlePanGestureRecognizer(_:)` 的接口中，我们将会使用 gesture recogniser 的 **velocity 速度**属性。如果速度在任意方向上（x 或 y）超过 300 个 point ，则会产生效果。逻辑很简单：为了检查在水平轴上的手势速度。然后在竖直方向上进行二次检测。参考下面代码：

```swift
func handlePanGestureRecognizer(gestureRecognizer: UIPanGestureRecognizer) {
    let velocity = gestureRecognizer.velocityInView(self.view)
 
    if gestureRecognizer.state == UIGestureRecognizerState.Changed {
        if velocity.x > 300.0 {
            // 水平向右的情况
            // 之后检测竖直方向上的速度
 
            if velocity.y > 300.0 {
                // 从左上到右下
                panDirection = PanDirections.TopLeftToBottomRight
            }
            else if velocity.y < -300.0 {
                // 从左下到右上
                panDirection = PanDirections.BottomLeftToTopRight
            }
            else {
                // 水平向右
                panDirection = PanDirections.Right
            }
        }
        else if velocity.x < -300.0 {
            // 水平方向想左的情况
            // 之后检测数值方向上的速度
 
            if velocity.y > 300.0 {
                // 从右上到左下
                panDirection = PanDirections.TopRightToBottomLeft
            }
            else if velocity.y < -300.0 {
                // 从右下到左上
                panDirection = PanDirections.BottomRightToTopLeft
            }
            else {
                // 水平向左
                panDirection = PanDirections.Left
            }
        }
        else {
            // 只有竖直方向上的状态（向上或向下）
 
            if velocity.y > 300.0 {
                // 竖直向下
                panDirection = PanDirections.Bottom
            }
            else if velocity.y < -300.0 {
                // 竖直向上
                panDirection = PanDirections.Top
            }
            else {
                // 无手势
                panDirection = nil
            }
        }
    }
    else if gestureRecognizer.state == UIGestureRecognizerState.Ended {
        changeGradientDirection()
    }
}
```

需要注意两点（除了确定手势方向以外）：

1. 如果不满足任何一个方向的情况，`panDirection` 应赋 nil
2. 如果方向是特殊的，并且手势处于 `Changed` 状态。当手势结束时，将会调用 `changeGradientDirection()` 方法，因此该 `panDirection` 属性也适用于方向变化。

下面的方法也很容易，正如之前设置 `startPoint` 和 `endPoint` 属性一样，通过观测 x 和 y 的坐标来确定手势方向：

```swift
func changeGradientDirection() {
    if panDirection != nil {
        switch panDirection.rawValue {
        case PanDirections.Right.rawValue:
            gradientLayer.startPoint = CGPointMake(0.0, 0.5)
            gradientLayer.endPoint = CGPointMake(1.0, 0.5)
 
        case PanDirections.Left.rawValue:
            gradientLayer.startPoint = CGPointMake(1.0, 0.5)
            gradientLayer.endPoint = CGPointMake(0.0, 0.5)
 
        case PanDirections.Bottom.rawValue:
            gradientLayer.startPoint = CGPointMake(0.5, 0.0)
            gradientLayer.endPoint = CGPointMake(0.5, 1.0)
 
        case PanDirections.Top.rawValue:
            gradientLayer.startPoint = CGPointMake(0.5, 1.0)
            gradientLayer.endPoint = CGPointMake(0.5, 0.0)
 
        case PanDirections.TopLeftToBottomRight.rawValue:
            gradientLayer.startPoint = CGPointMake(0.0, 0.0)
            gradientLayer.endPoint = CGPointMake(1.0, 1.0)
 
        case PanDirections.TopRightToBottomLeft.rawValue:
            gradientLayer.startPoint = CGPointMake(1.0, 0.0)
            gradientLayer.endPoint = CGPointMake(0.0, 1.0)
 
        case PanDirections.BottomLeftToTopRight.rawValue:
            gradientLayer.startPoint = CGPointMake(0.0, 1.0)
            gradientLayer.endPoint = CGPointMake(1.0, 0.0)
 
        default:
            gradientLayer.startPoint = CGPointMake(1.0, 1.0)
            gradientLayer.endPoint = CGPointMake(0.0, 0.0)
        }
    }
}
```

当 `panDirection` 为 nil 的时候，不做任何处理即可。

运行我们的工程，并且在我们支持的方向上滑动手指，渐变色的梯度方向将会随着我们手指滑动方向改变。

![](http://www.appcoda.com/wp-content/uploads/2016/07/t53_11_direction_change_2.gif)


## 总结

通过本文，你会发现 `CAGradientLayer` 产生渐变色效果是十分容易的，并且我也通过编程加以实现。通过多个属性赋以合适的数值并将其组合，你可以很容易地实现一个不错的渐变效果。支持动画也是它的优势之一。对于渐变效果的产生已经变得十分容易，接下来需要的是尝试更理想的配色。所以放手去做吧！
