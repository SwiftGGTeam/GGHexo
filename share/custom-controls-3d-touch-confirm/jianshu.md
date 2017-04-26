自定义控件：利用 3D Touch 确认 Button 操作"

> 作者：Yari D'areglia，[原文链接](http://www.thinkandbuild.it/custom-controls-3d-touch-confirm/)，原文日期：2017-01-03
> 译者：[SketchK](http://www.sketchk.xyz)；校对：[Cee](https://github.com/Cee)；定稿：[CMB](https://github.com/chenmingbiao)
  









在我看来，3D Touch 是能够追踪用户按压屏幕力度、并且是 iOS 的触碰处理中最有意思且未被充分挖掘的一个能力特性。

通过这个教程，我们会创建一个自定义的按钮，并且要求用户通过 3D Touch 操作进行确认。如果用户的设备不支持 3D Touch，控件对用户的处理也会回退到备选方案。下面是预览视频，它能够让你快速了解这个自定义控件是如何工作的：

<center>
<div style="width:500px; background:#fff; margin:0 auto;">
<iframe src="http://player.vimeo.com/video/196205629?title=0&amp;byline=0&amp;portrait=0&amp;color=f2cb5f" width="500" height="400" frameborder="0" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen=""></iframe>
</div>
</center>

1. 当用户开始点击屏幕时，一个圆形的进度条就会跟踪用户按压屏幕的力度。用户按压屏幕的力度会影响圆形视图填充进度，按得越用力，圆就被填充得越多（稍后我会展示在不支持 3D Touch 的设备上模拟该行为）。

2. 当圆形被填充满的时候，它会变成一个处于激活状态的按钮，圆形进度条里的标签内容会变成 “OK” 且颜色变成绿色，这暗示着当前操作可以被确认。此时用户可以通过向上滑动手指并在圆圈上松开手指的方式来确认此操作。

通常，我们会通过弹窗的方式来询问用户是否想进行一个删除操作。我很乐意做一些 UX 交互方面的尝试，而且我认为 3D Touch 这种新的交互方式可以很好的替代原有的 “标准” 交互流程。你真的应该在一个实体机上体验一下 3D Touch，马上你就会了解到交互的便利性。😀



## 代码撸起来

如果你还不知道自定义控件的工作原理，我强烈建议你阅读一下之前我写的一篇关于**[创建自定义控件](http://www.thinkandbuild.it/building-a-custom-and-designabl-control-in-swift/)**的教程，下载配套的工程文件。这样你就能轻松 hold 住接下来的内容了。

## UI 画起来

当用户与按钮控件进行交互的时候会绘制圆形控件和标签控件，实现这个需求的代码很简单，让我们一起看下：

    
    private let circle = CAShapeLayer()
    private let msgLabel = CATextLayer()
    private let container = CALayer()
    .
    .
    .
     
    private func drawControl(){
         
        // Circle
        var transform = CGAffineTransform.identity
        circle.frame = CGRect(x: 0, y: 0, width: size.width, height: size.height)
        circle.path = CGPath(ellipseIn: CGRect(x: 0,y: 0,width: size.width, height: size.height),
                             transform: &transform)
         
        circle.strokeColor = UIColor.white.cgColor
        circle.fillColor = UIColor.clear.cgColor
        circle.lineWidth = 1
        circle.lineCap = kCALineCapRound
        circle.strokeEnd = 0 // initially set to 0
        circle.shadowColor = UIColor.white.cgColor
        circle.shadowRadius = 2.0
        circle.shadowOpacity = 1.0
        circle.shadowOffset = CGSize.zero
        circle.contentsScale = UIScreen.main.scale
     
        // Label
        msgLabel.font = UIFont.systemFont(ofSize: 3.0)
        msgLabel.fontSize = 12
        msgLabel.foregroundColor = UIColor.white.cgColor
        msgLabel.string = ""
        msgLabel.alignmentMode = "center"
        msgLabel.frame = CGRect(x: 0, y: (size.height / 2) - 8.0, width: size.width, height: 12)
        msgLabel.contentsScale = UIScreen.main.scale
         
        // Put it all together
        container.frame = CGRect(x: 0, y: 0, width: size.width, height: size.height)
        container.addSublayer(msgLabel)
        container.addSublayer(circle)
         
        layer.addSublayer(container)
    }

`圆形`和`标签`的 layer 在这段代码中初始化后，被添加到了`容器`的 layer 中。这段代码没有需要特别关注的地方，仅需要注意的是圆形的 `strokeEnd` 属性值是 0。

对于任意一个图形的 layer，可以使用这个属性来对其进行动画操作。简单地说，系统会在 `strokeStart` 和 `strokeEnd` 之间渲染图形 layer 的路径，而这两个属性的默认值是 0 和 1，所以利用这个值区间是可以玩出许多漂亮的动画效果。但对于当前这个控件，我们设置 `strokeEnd` 的值为 0 ，因为我们要使用用户按压屏幕的力度来做动画。

## 控件的状态

使用 `ConfirmActionButtonState` 枚举类型来定义当前控制器的 UI 和行为状态。

    
    enum ConfirmActionButtonState {
        case idle
        case updating
        case selected
        case confirmed
    }

当该控件上没有任何操作时，它的状态是 `idle`；当用户开始进行交互时，它的状态会变成 `updating`；当圆形控件被填充完毕的时候，它的状态会变成 `selected`；如果此时用户将手指移动到绿色的圆圈中，它的状态又会继续变成 `confirmed`。

如果用户手指离开了屏幕，且控件的状态已经是 `confirmed` 的时候，我们会继续传递这个按键操作。因为这时按钮已处于确认状态；反之，按钮又会回到 `idle` 态。

![](http://www.thinkandbuild.it/wp-content/uploads/2017/01/States-266x300.png)

## 处理用户的点击

我们重写了 `beginTracking`、`continueTracking` 和 `endTracking` 三个方法来响应用户的点击并为自定义控件提供所有的信息。

通过这些方法我们会跟踪三个元素：

1. **触摸点位置（touch Location）**。用于决定应该在哪里绘制容器视图的 layer 层（它包含了圆形视图和信息标签）。
2. **按压屏幕的力度（touch force）** 值。需要根据这个值来设置圆形控件的动画并且通过它来决定自定义控件的状态是否应该设置成 `updating`、`selected` 或者 `confirmed`。
3. **更新后的触摸点的位置（updated touch location）**。我们必须跟踪用户的触摸点来验证它是否在容器视图 layer 层的 bounds 内，如果满足这个条件，我们就需要更新状态为 `confirmed` 或者 `updating`。

首先看看 `begingTracking` 方法的代码。

    
      override func beginTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
          super.beginTracking(touch, with: event)
           
          if traitCollection.forceTouchCapability != UIForceTouchCapability.available{
    // fallback code ….
          }
           
          let initialLocation = touch.location(in: self)
           
          CATransaction.begin()
          CATransaction.setDisableActions(true)
          container.position = initialLocation ++ CGPoint(x: 0, y: -size.height)
          CATransaction.commit()
           
          return true
      }

首先我们检查设备是否可以使用 3D Touch，如果不支持这个特性的话，我们会执行一个备选代码（在后面会具体讨论备选代码的事情）。然后通过触摸点的位置减去自定义控件高度的方式来计算容器视图 layer 的位置。 ++ 操作符的定义在文件的最下面，它的作用就是允许 CGPoint 类型的元素进行加法计算。

为了避免系统的隐式动画，需要在 `setDisableActions` 方法后设置容器视图的位置。（关于这个问题的详细信息可以参考：[CALayer: CATransaction in Depth](http://calayer.com/core-animation/2016/05/17/catransaction-in-depth.html#preventing-animations-from-occurring)）

在 `continueTracking` 这个函数中，我们执行所有必要的操作来确认控件的状态。

    
    override func continueTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
        super.continueTracking(touch, with: event)
        lastTouchPosition = touch
        updateSelection(with:touch)
         
        return true
    }

当 `updateSelection` 方法中的 touch 更新后，不支持 3D Touch 的设备会使用到 `lastTouchPosition`做一些处理，具体的内容后面会详细介绍。

`updateSelection` 的代码如下所示：

    
    private func updateSelection(with touch: UITouch) {
         
        if self.traitCollection.forceTouchCapability == UIForceTouchCapability.available{
            intention = 1.0 * (min(touch.force, 3.0) / min(touch.maximumPossibleForce, 3.0))
        }
         
        if intention > 0.97 {
            if container.frame.contains(touch.location(in:self)){
                selectionState = .confirmed
            }else{
                selectionState = .selected
            }
            updateUI(with: 1.0)
        }
        else{
            if !container.frame.contains(touch.location(in:self)){
                selectionState = .updating
                updateUI(with: intention)
            }
        }
    }

同样，首先要检查设备是否支持 3D Touch 特性，如果支持这个特性，我们会计算当前的“用户意向”，这个 `intention` 属性的值区间在 0（没有触摸事件被检测到）到 1（按压屏幕的力度达到了所需的最大值）之间。获取这个属性值的方法很简单：用当前压力除以最大压力的值作为 `intention` 的值即可。经过真机调试后，我发现如果使用这种方式实现的话，用户需要用很大的力量来按压屏幕才能达到最大值，出于节省力气的考虑，我对压力值做了一个 3.0 的上限。
（事实上，我不太确定使用 “intention” 作为命名是不是一个好的选择...使用英语做母语的朋友们，请让我知道这个命名是否明确的表达了这个属性的作用😝）

现在通过这个触摸循环可以计算出 intention 的具体值，从而就可以利用它来更新 UI 和控件的状态。如果 intention 的值大于 0.97 且用户的触摸点已经在绿色圆形区域内，这个控件的状态就会变为 `confirmed`，否则，即使用户一直按压删除按钮，控件的状态也只是停留在 `selected`。如果 intention 的值小于 0.97，控件的状态会处于 `updating` 的状态。

`updateUI` 方法会拿到当前的 `intention` 值，并把它赋值给圆形视图 layer 的 `endStroke` 属性。任何与 `intention` 相关的 UI 操作都可以放在这个方法中进行。

    
    private func updateUI(with value:CGFloat){
        circle.strokeEnd = value
    }

最后，我们重写了 `endTracking` 方法。当控件状态为 `confirmed` 的时候，该方法可以触发 `valueChanged` 事件。

    
    override func endTracking(_ touch: UITouch?, with event: UIEvent?) {
        super.endTracking(touch, with: event)
        intention = 0
         
        if selectionState == .confirmed{
            self.sendActions(for: UIControlEvents.valueChanged)
        }else{
            selectionState = .idle
            circle.strokeEnd = 0
        }
    }

如果你仔细查看了 Main.storyboard 文件，你就会发现删除按钮的 valueChanged 动作已经与 ViewController 的 `confirmDelete` 方法相关联了。并且比较容易发现这个删除按钮的 class 属性已经设置成 `ConfirmActionButton` 了。

## 控件状态和 UI

这个控件的 UI 是与与其自身状态息息相关的。为了简化，我们将更新 UI 的代码直接放在了 `selectionState` 属性的 `didSet` 方法中。

这段代码很简单，它包含了根据状态来更新圆形视图颜色和标签文字内容的操作，以及对圆形视图调用 `setNeedLayout` 方法进行重绘的操作。

    
    private var selectionState:ConfirmActionButtonState = .idle {
        didSet{
            switch self.selectionState {
            case .idle, .updating:
                if oldValue != .updating || oldValue != .idle {
                    circle.strokeColor = UIColor.white.cgColor
                    circle.shadowColor = UIColor.white.cgColor
                    circle.transform = CATransform3DIdentity
                    msgLabel.string = ""
                }
                 
            case .selected:
                if oldValue != .selected{
                    circle.strokeColor = UIColor.red.cgColor
                    circle.shadowColor = UIColor.red.cgColor
                    circle.transform = CATransform3DMakeScale(1.1, 1.1, 1)
                    msgLabel.string = "CONFIRM"
                }
                 
            case .confirmed:
                if oldValue != .confirmed{
                    circle.strokeColor = UIColor.green.cgColor
                    circle.shadowColor = UIColor.green.cgColor
                    circle.transform = CATransform3DMakeScale(1.3, 1.3, 1)
                    msgLabel.string = "OK"
                }
            }
            circle.setNeedsLayout()
        }
    }

## 备选代码

我们快速浏览一下为不支持 3D Touch 特性的设备而提供的备选代码。由于我想在所有的设备上保持相同的设计效果，所以在不支持 3D Touch 特性的设备中，我让 `intention` 属性与时间关联在了一起，而不再是按压屏幕的力度值。其他方面的逻辑与我们之前所说的保持一致，但是当用户按压 delete 按钮时，`intention` 属性会以 0.1 秒的速度更新。下面就是在 `beginTracking` 中如何定义计时器的了：

    
    if traitCollection.forceTouchCapability != UIForceTouchCapability.available{
        timer = Timer.scheduledTimer(timeInterval: 0.1,
                                     target: self,
                                     selector: #selector(ConfirmActionButton.updateTimedIntention),
                                     userInfo: nil,
                                     repeats: true)
        timer?.fire()
    }

`updateTimedIntention` 方法能在两秒内将 `intention` 的值更新到最大值（1.0）：

    
    func updateTimedIntention(){
        intention += CGFloat(0.1 / 2.0)
        updateSelection(with: lastTouchPosition)
    }

## 小结

我十分享受写这段代码的过程，而且在后面的日子里我还会讨论其他自定义控件。在我看来，利用设备的新特性来改进自定义 UI 和提升用户体验的工作还有很大的进步空间...我希望这个教程能对你有所启发😀。

[下载源代码](https://github.com/ariok/TB_ForceTouchSelector)
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。