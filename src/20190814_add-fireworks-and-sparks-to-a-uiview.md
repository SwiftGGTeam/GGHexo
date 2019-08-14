title: "给 UIView 来点烟花"
date: 2019-08-14
tags: [Swift, 教程]
categories: [Tomasz Szulc]
permalink: add-fireworks-and-sparks-to-a-uiview

---
原文链接=http://szulctomasz.com/programming-blog/2018/09/add-fireworks-and-sparks-to-a-uiview/
作者=Tomasz Szulc
原文日期=2018-09
译者=Joeytat
校对=
定稿=

<!--此处开始正文-->

<!--more-->

你也很喜欢常用 app 里的那些小细节吧？当我从 [dribbble](https://dribbble.com/) 中寻找灵感时，就发现了这个漂亮的设计：当用户在某个重要的视图中修改设置或者进行了什么操作时，会有烟花在周围绽放。于是我就在想这个东西有多难实现，然后过了一段时间，我完成了 :)

![hero](http://szulctomasz.com/uploads/programming-blog/post-54/hero.gif)

## _烟花的细节_
下面是对于这个效果的详细描述。烟花应该在视图周围的某个特殊的位置爆开，可能是按钮在点击事件响应时。当点击发生时，烟花应该在按钮的四角爆开，并且爆炸产生的火花应该按照自身的轨迹移动。

![final](http://szulctomasz.com/uploads/programming-blog/post-54/final.jpg)

*超喜欢这个效果! 不仅让我感受到视觉上的愉悦，还让我想要不停地戳这个按钮！ :) 🎉*

现在让我们再看一眼这个动画。每次生成的烟花，其整体行为是大致相似的。但还是在火花的轨迹和大小上有一些区别。让我们拆开来说。

- 每一次点击都会产生*两处烟花*，
- 每一处烟花会产生 *8 个火花*，
- 每个火花都遵循着自己的*轨迹*，
- 轨迹看起来*相似*，但其实*不完全一样*。从爆炸*开始*的位置来看，有部分朝*右*，有部分朝*左*，剩余的朝*上*或*下*。

## _火花的分布_
这个烟花特效有着简单的火花分布规则。将爆炸点分为四块「视线区域」来看：上左，上右，下左，下右，每个区域都有两个火花。

![sparks distribution](http://szulctomasz.com/uploads/programming-blog/post-54/sparks-distribution.jpg)

## _火花的轨迹_
火花的移动有着自己的轨迹。在一处烟花中有 8 个火花，那至少需要 8 道轨迹。理想状态下应该有更多的轨迹，可以增加一些随机性，这样连续爆发烟花的时候，不会看起来和前一个完全一样。

![spark-trajectories](http://szulctomasz.com/uploads/programming-blog/post-54/spark-trajectories.jpg)

我为每一个区域创建了 4 条轨迹，这样就赋予了两倍于火花数量的随机性。为了方便计算，我统一了每条轨迹的初始点。因为我用了不同的工具来可视化这些轨迹，所以图上的轨迹和我完成的效果略有不同 - 但你能明白我的想法就行 :)

## _实现_
理论足够了。接下来让我们把各个模块拼凑起来。

```swift
protocol SparkTrajectory {

    /// 存储着定义轨迹所需要的所有的点
    var points: [CGPoint] { get set }

    /// 用 path 来表现轨迹
    var path: UIBezierPath { get }
}
```

这是一个用于表示火花轨迹的协议。为了能够更简单地创建各式各样的轨迹，我定义了这个通用接口协议，并且选择基于三阶 [贝塞尔曲线](https://en.wikipedia.org/wiki/B%C3%A9zier_curve) 来实现轨迹；还添加了一个 `init` 方法，这样我就可以通过一行代码来创建轨迹了。三阶贝塞尔曲线必须包含四个点。第一个和最后一个点定义了轨迹的开始和结束的位置，中间的两个点用于控制曲线的弯曲度。你可以用在线数学工具 [desmos](https://www.desmos.com/calculator/epunzldltu) 来调整自己的贝塞尔曲线。

```swift
/// 拥有两个控制点的贝塞尔曲线
struct CubicBezierTrajectory: SparkTrajectory {

    var points = [CGPoint]()

    init(_ x0: CGFloat, _ y0: CGFloat,
         _ x1: CGFloat, _ y1: CGFloat,
         _ x2: CGFloat, _ y2: CGFloat,
         _ x3: CGFloat, _ y3: CGFloat) {
        self.points.append(CGPoint(x: x0, y: y0))
        self.points.append(CGPoint(x: x1, y: y1))
        self.points.append(CGPoint(x: x2, y: y2))
        self.points.append(CGPoint(x: x3, y: y3))
    }

    var path: UIBezierPath {
        guard self.points.count == 4 else { fatalError("4 points required") }

        let path = UIBezierPath()
        path.move(to: self.points[0])
        path.addCurve(to: self.points[3], controlPoint1: self.points[1], controlPoint2: self.points[2])
        return path
    }
}
```

![desmos-tool](http://szulctomasz.com/uploads/programming-blog/post-54/desmos-tool.png)

接下来要实现的是一个能够创建随机轨迹的工厂。前面的图中你可以看到轨迹是根据颜色来分组的。我只创建了上右和下右两块位置的轨迹，然后进行了镜像复制。这对于我们将要发射的烟花来说已经足够了🚀

```swift
protocol SparkTrajectoryFactory {}

protocol ClassicSparkTrajectoryFactoryProtocol: SparkTrajectoryFactory {

    func randomTopRight() -> SparkTrajectory
    func randomBottomRight() -> SparkTrajectory
}

final class ClassicSparkTrajectoryFactory: ClassicSparkTrajectoryFactoryProtocol {

    private lazy var topRight: [SparkTrajectory] = {
        return [
            CubicBezierTrajectory(0.00, 0.00, 0.31, -0.46, 0.74, -0.29, 0.99, 0.12),
            CubicBezierTrajectory(0.00, 0.00, 0.31, -0.46, 0.62, -0.49, 0.88, -0.19),
            CubicBezierTrajectory(0.00, 0.00, 0.10, -0.54, 0.44, -0.53, 0.66, -0.30),
            CubicBezierTrajectory(0.00, 0.00, 0.19, -0.46, 0.41, -0.53, 0.65, -0.45),
        ]
    }()

    private lazy var bottomRight: [SparkTrajectory] = {
        return [
            CubicBezierTrajectory(0.00, 0.00, 0.42, -0.01, 0.68, 0.11, 0.87, 0.44),
            CubicBezierTrajectory(0.00, 0.00, 0.35, 0.00, 0.55, 0.12, 0.62, 0.45),
            CubicBezierTrajectory(0.00, 0.00, 0.21, 0.05, 0.31, 0.19, 0.32, 0.45),
            CubicBezierTrajectory(0.00, 0.00, 0.18, 0.00, 0.31, 0.11, 0.35, 0.25),
        ]
    }()

    func randomTopRight() -> SparkTrajectory {
        return self.topRight[Int(arc4random_uniform(UInt32(self.topRight.count)))]
    }

    func randomBottomRight() -> SparkTrajectory {
        return self.bottomRight[Int(arc4random_uniform(UInt32(self.bottomRight.count)))]
    }
}
```

这里先创建了用来表示火花轨迹工厂的抽象协议，还有一个我将其命名为*经典烟花*的火花轨迹的抽象协议，这样的抽象可以方便后续将其替换成其他的轨迹协议。

如同我前面提到的，我通过 [desmos](https://www.desmos.com/calculator/epunzldltu) 创建了两组轨迹，对应着右上，和右下两块区域。

**重要提醒**：如果在 desmos 上 y 轴所显示的是正数，那么你应该将其转换成负数。因为在 iOS 系统中，越接近屏幕顶部 y 轴的值越小，所以 y 轴的值需要翻转一下。

并且值得一提的是，为了后面好计算，所有的轨迹初始点都是 (0,0)。

我们现在创建好了轨迹。接下来创建一些视图来表示火花。对于经典烟花来说，只需要有颜色的圆圈就行。通过抽象可以让我们在未来以更低的成本，创建不同的火花视图。比如小鸭子图片，或者是胖吉猫 :)

```swift
class SparkView: UIView {}

final class CircleColorSparkView: SparkView {

    init(color: UIColor, size: CGSize) {
        super.init(frame: CGRect(origin: .zero, size: size))
        self.backgroundColor = color
        self.layer.cornerRadius = self.frame.width / 2.0
    }

    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
}

extension UIColor {

    static var sparkColorSet1: [UIColor] = {
        return [
            UIColor(red:0.89, green:0.58, blue:0.70, alpha:1.00),
            UIColor(red:0.96, green:0.87, blue:0.62, alpha:1.00),
            UIColor(red:0.67, green:0.82, blue:0.94, alpha:1.00),
            UIColor(red:0.54, green:0.56, blue:0.94, alpha:1.00),
        ]
    }()
}
```

为了创建火花视图，我们还需要一个工厂数据以填充，需要的数据是火花的大小，以及用来决定火花在哪个烟花的索引（用于增加随机性）。

```swift
protocol SparkViewFactoryData {

    var size: CGSize { get }
    var index: Int { get }
}

protocol SparkViewFactory {

    func create(with data: SparkViewFactoryData) -> SparkView
}

class CircleColorSparkViewFactory: SparkViewFactory {

    var colors: [UIColor] {
        return UIColor.sparkColorSet1
    }

    func create(with data: SparkViewFactoryData) -> SparkView {
        let color = self.colors[data.index % self.colors.count]
        return CircleColorSparkView(color: color, size: data.size)
    }
}
```

你看这样抽象了之后，就算再实现一个像胖吉猫的火花也会很简单。接下来让我们来创建*经典烟花*。

```swift
typealias FireworkSpark = (sparkView: SparkView, trajectory: SparkTrajectory)

protocol Firework {

    /// 烟花的初始位置
    var origin: CGPoint { get set }

    /// 定义了轨迹的大小. 轨迹都是统一大小
    /// 所以需要在展示到屏幕上前将其放大
    var scale: CGFloat { get set }

    /// 火花的大小
    var sparkSize: CGSize { get set }

    /// 获取轨迹
    var trajectoryFactory: SparkTrajectoryFactory { get }

    /// 获取火花视图
    var sparkViewFactory: SparkViewFactory { get }

    func sparkViewFactoryData(at index: Int) -> SparkViewFactoryData
    func sparkView(at index: Int) -> SparkView
    func trajectory(at index: Int) -> SparkTrajectory
}

extension Firework {

    /// 帮助方法，用于返回火花视图及对应的轨迹
    func spark(at index: Int) -> FireworkSpark {
        return FireworkSpark(self.sparkView(at: index), self.trajectory(at: index))
    }
}
```

这就是烟花的抽象。为了表示一个烟花需要这些东西:

- *origin*
- *scale*
- *sparkSize*
- *trajectoryFactory*
- *sparkViewFactory*

在我们实现协议之前，还有一个我之前没有提到过的叫做*按轨迹缩放*的概念。当火花处于轨迹 <-1, 1> 或相似的位置时，我们希望它的大小会跟随轨迹变化。我们还需要放大路径以覆盖更大的屏幕显示效果。此外，我们还需要支持水平翻转路径，以方便我们实现经典烟花左侧部分的轨迹，并且还要让轨迹能朝某个指定方向偏移一点（增加随机性）。下面是两个能够帮助我们达到目的的方法，我相信这段代码已经不需要更多描述了。

```swift
extension SparkTrajectory {

    /// 缩放轨迹使其符合各种 UI 的要求
    /// 在各种形变和 shift: 之前使用
    func scale(by value: CGFloat) -> SparkTrajectory {
        var copy = self
        (0..<self.points.count).forEach { copy.points[$0].multiply(by: value) }
        return copy
    }

    /// 水平翻转轨迹
    func flip() -> SparkTrajectory {
        var copy = self
        (0..<self.points.count).forEach { copy.points[$0].x *= -1 }
        return copy
    }

    /// 偏移轨迹，在每个点上生效
    /// 在各种形变和 scale: 和之后使用
    func shift(to point: CGPoint) -> SparkTrajectory {
        var copy = self
        let vector = CGVector(dx: point.x, dy: point.y)
        (0..<self.points.count).forEach { copy.points[$0].add(vector: vector) }
        return copy
    }
}
```

好了，接下来就是实现经典烟花。

```swift
class ClassicFirework: Firework {

    /**
     x     |     x
        x  |   x
           |
     ---------------
         x |  x
       x   |
           |     x
     **/

    private struct FlipOptions: OptionSet {

        let rawValue: Int

        static let horizontally = FlipOptions(rawValue: 1 << 0)
        static let vertically = FlipOptions(rawValue: 1 << 1)
    }

    private enum Quarter {

        case topRight
        case bottomRight
        case bottomLeft
        case topLeft
    }

    var origin: CGPoint
    var scale: CGFloat
    var sparkSize: CGSize

    var maxChangeValue: Int {
        return 10
    }

    var trajectoryFactory: SparkTrajectoryFactory {
        return ClassicSparkTrajectoryFactory()
    }

    var classicTrajectoryFactory: ClassicSparkTrajectoryFactoryProtocol {
        return self.trajectoryFactory as! ClassicSparkTrajectoryFactoryProtocol
    }

    var sparkViewFactory: SparkViewFactory {
        return CircleColorSparkViewFactory()
    }

    private var quarters = [Quarter]()

    init(origin: CGPoint, sparkSize: CGSize, scale: CGFloat) {
        self.origin = origin
        self.scale = scale
        self.sparkSize = sparkSize
        self.quarters = self.shuffledQuarters()
    }

    func sparkViewFactoryData(at index: Int) -> SparkViewFactoryData {
        return DefaultSparkViewFactoryData(size: self.sparkSize, index: index)
    }

    func sparkView(at index: Int) -> SparkView {
        return self.sparkViewFactory.create(with: self.sparkViewFactoryData(at: index))
    }

    func trajectory(at index: Int) -> SparkTrajectory {
        let quarter = self.quarters[index]
        let flipOptions = self.flipOptions(for: quarter)
        let changeVector = self.randomChangeVector(flipOptions: flipOptions, maxValue: self.maxChangeValue)
        let sparkOrigin = self.origin.adding(vector: changeVector)
        return self.randomTrajectory(flipOptions: flipOptions).scale(by: self.scale).shift(to: sparkOrigin)
    }

    private func flipOptions(`for` quarter: Quarter) -> FlipOptions {
        var flipOptions: FlipOptions = []
        if quarter == .bottomLeft || quarter == .topLeft {
            flipOptions.insert(.horizontally)
        }

        if quarter == .bottomLeft || quarter == .bottomRight {
            flipOptions.insert(.vertically)
        }

        return flipOptions
    }

    private func shuffledQuarters() -> [Quarter] {
        var quarters: [Quarter] = [
            .topRight, .topRight,
            .bottomRight, .bottomRight,
            .bottomLeft, .bottomLeft,
            .topLeft, .topLeft
        ]

        var shuffled = [Quarter]()
        for _ in 0..<quarters.count {
            let idx = Int(arc4random_uniform(UInt32(quarters.count)))
            shuffled.append(quarters[idx])
            quarters.remove(at: idx)
        }

        return shuffled
    }

    private func randomTrajectory(flipOptions: FlipOptions) -> SparkTrajectory {
        var trajectory: SparkTrajectory

        if flipOptions.contains(.vertically) {
            trajectory = self.classicTrajectoryFactory.randomBottomRight()
        } else {
            trajectory = self.classicTrajectoryFactory.randomTopRight()
        }

        return flipOptions.contains(.horizontally) ? trajectory.flip() : trajectory
    }

    private func randomChangeVector(flipOptions: FlipOptions, maxValue: Int) -> CGVector {
        let values = (self.randomChange(maxValue), self.randomChange(maxValue))
        let changeX = flipOptions.contains(.horizontally) ? -values.0 : values.0
        let changeY = flipOptions.contains(.vertically) ? values.1 : -values.0
        return CGVector(dx: changeX, dy: changeY)
    }

    private func randomChange(_ maxValue: Int) -> CGFloat {
        return CGFloat(arc4random_uniform(UInt32(maxValue)))
    }
}
```

大多数代码都是 `Firework` 协议的实现，所以应该很容易理解。我们在各处传递了需要的工厂类，还添加了一个额外的枚举类型来随机地为每个火花指定轨迹。

有少数几个方法用来为烟花和火花增加随机性。

还引入了一个 `quarters` 属性，其中包含了火花的所有的方位。我们通过  `shuffledQuarters:` 来重新排列，以确保我们不会总是在相同的方位创建相同数量的火花。

好了，我们创建好了烟花，接下来怎么让火花动起来呢？这就引入了火花动画启动器的概念。

```swift
protocol SparkViewAnimator {

    func animate(spark: FireworkSpark, duration: TimeInterval)
}
```

这个方法接受一个包含火花视图和其对应轨迹的元组 `FireworkSpark`，以及动画的持续时间。方法的实现取决于我们。我自己的实现蛮多的，但主要做了三件事情：让火花视图跟随轨迹，同时缩放火花（带有随机性），修改其不透明度。简单吧。同时得益于 `SparkViewAnimator` 的抽象度，我们还可以很简单地将其替换成任何我们想要的动画效果。

```swift
struct ClassicFireworkAnimator: SparkViewAnimator {

    func animate(spark: FireworkSpark, duration: TimeInterval) {
        spark.sparkView.isHidden = false // show previously hidden spark view

        CATransaction.begin()

        // 火花的位置
        let positionAnim = CAKeyframeAnimation(keyPath: "position")
        positionAnim.path = spark.trajectory.path.cgPath
        positionAnim.calculationMode = kCAAnimationLinear
        positionAnim.rotationMode = kCAAnimationRotateAuto
        positionAnim.duration = duration

        // 火花的缩放
        let randomMaxScale = 1.0 + CGFloat(arc4random_uniform(7)) / 10.0
        let randomMinScale = 0.5 + CGFloat(arc4random_uniform(3)) / 10.0

        let fromTransform = CATransform3DIdentity
        let byTransform = CATransform3DScale(fromTransform, randomMaxScale, randomMaxScale, randomMaxScale)
        let toTransform = CATransform3DScale(CATransform3DIdentity, randomMinScale, randomMinScale, randomMinScale)
        let transformAnim = CAKeyframeAnimation(keyPath: "transform")

        transformAnim.values = [
            NSValue(caTransform3D: fromTransform),
            NSValue(caTransform3D: byTransform),
            NSValue(caTransform3D: toTransform)
        ]

        transformAnim.duration = duration
        transformAnim.timingFunction = CAMediaTimingFunction(name: kCAMediaTimingFunctionEaseOut)
        spark.sparkView.layer.transform = toTransform

        // 火花的不透明度
        let opacityAnim = CAKeyframeAnimation(keyPath: "opacity")
        opacityAnim.values = [1.0, 0.0]
        opacityAnim.keyTimes = [0.95, 0.98]
        opacityAnim.duration = duration
        spark.sparkView.layer.opacity = 0.0

        // 组合动画
        let groupAnimation = CAAnimationGroup()
        groupAnimation.animations = [positionAnim, transformAnim, opacityAnim]
        groupAnimation.duration = duration

        CATransaction.setCompletionBlock({
            spark.sparkView.removeFromSuperview()
        })

        spark.sparkView.layer.add(groupAnimation, forKey: "spark-animation")

        CATransaction.commit()
    }
}
```

现在的代码已经足够让我们在特定的视图上展示烟花了。我又更进了一步，创建了一个 `ClassicFireworkController` 来处理所有的工作，这样用一行代码就能启动烟花。

这个烟花控制器还做了另一件事。它可以修改烟花的 `zPosition`，这样我们可以让烟花一前一后地展示，效果更好看一些。

```swift
class ClassicFireworkController {

    var sparkAnimator: SparkViewAnimator {
        return ClassicFireworkAnimator()
    }

    func createFirework(at origin: CGPoint, sparkSize: CGSize, scale: CGFloat) -> Firework {
        return ClassicFirework(origin: origin, sparkSize: sparkSize, scale: scale)
    }

    /// 让烟花在其源视图的角落附近爆开
    func addFireworks(count fireworksCount: Int = 1,
                      sparks sparksCount: Int,
                      around sourceView: UIView,
                      sparkSize: CGSize = CGSize(width: 7, height: 7),
                      scale: CGFloat = 45.0,
                      maxVectorChange: CGFloat = 15.0,
                      animationDuration: TimeInterval = 0.4,
                      canChangeZIndex: Bool = true) {
        guard let superview = sourceView.superview else { fatalError() }

        let origins = [
            CGPoint(x: sourceView.frame.minX, y: sourceView.frame.minY),
            CGPoint(x: sourceView.frame.maxX, y: sourceView.frame.minY),
            CGPoint(x: sourceView.frame.minX, y: sourceView.frame.maxY),
            CGPoint(x: sourceView.frame.maxX, y: sourceView.frame.maxY),
            ]

        for _ in 0..<fireworksCount {
            let idx = Int(arc4random_uniform(UInt32(origins.count)))
            let origin = origins[idx].adding(vector: self.randomChangeVector(max: maxVectorChange))

            let firework = self.createFirework(at: origin, sparkSize: sparkSize, scale: scale)

            for sparkIndex in 0..<sparksCount {
                let spark = firework.spark(at: sparkIndex)
                spark.sparkView.isHidden = true
                superview.addSubview(spark.sparkView)

                if canChangeZIndex {
                    let zIndexChange: CGFloat = arc4random_uniform(2) == 0 ? -1 : +1
                    spark.sparkView.layer.zPosition = sourceView.layer.zPosition + zIndexChange
                } else {
                    spark.sparkView.layer.zPosition = sourceView.layer.zPosition
                }

                self.sparkAnimator.animate(spark: spark, duration: animationDuration)
            }
        }
    }

    private func randomChangeVector(max: CGFloat) -> CGVector {
        return CGVector(dx: self.randomChange(max: max), dy: self.randomChange(max: max))
    }

    private func randomChange(max: CGFloat) -> CGFloat {
        return CGFloat(arc4random_uniform(UInt32(max))) - (max / 2.0)
    }
}
```

这个控制器只做了几件事情。随机选择了一个角落展示烟花。在烟花出现的位置，烟花和火花的数量上增加了一些随机性。然后将火花添加到目标视图上，如果需要的话还会调整 `zIndex`，最后启动了动画。

几乎所有的参数都设置了默认参数，所以你可以不管他们。直接通过你的控制器调用这个：

```swift
self.fireworkController.addFireworks(count: 2, sparks: 8, around: button)
```

然后，哇!

![classic](http://szulctomasz.com/uploads/programming-blog/post-54/classic.gif)

从这一步起，新添加一个像下面这样的烟花就变得非常简单了。你只需要定义新的轨迹，创建一个新的烟花，并且按照你希望的样子来实现即可。将这些代码放入一个控制器可以让你想在哪里启动烟花都很简单 :) 或者你也可以直接使用这个*喷泉烟花*，我已经把它放在了我的 github 项目 [tomkowz/fireworks](https://github.com/tomkowz/fireworks) 中。

![fountain](http://szulctomasz.com/uploads/programming-blog/post-54/fountain.gif)

## _总结_
这个动画效果的实现并不简单但也不算很难。通过对问题（在我们的情况下是动画效果）的正确分析，我们可以将其分解成多个小问题，逐个解决然后将其组合在一起。真希望我有机会能够在未来的的项目中使用这个效果🎉

好啦这就是今天的内容。感谢阅读！
