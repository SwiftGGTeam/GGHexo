UIGestureRecognizer教程：创建自定义手势识别器

> 作者：Michael Katz，[原文链接](http://www.raywenderlich.com/104744/uigesturerecognizer-tutorial-creating-custom-recognizers)，原文日期：2015/08/06
> 译者：[mmoaay](http://blog.csdn.net/mmoaay)；校对：[千叶知风](http://weibo.com/xiaoxxiao)；定稿：[numbbbbb](https://github.com/numbbbbb)
  







> 如果是首次访问，可以订阅我的[RSS feed](http://www.raywenderlich.com/feed/)或者在[Twitter](http://twitter.com/rwenderlich)上粉我。热烈欢迎！

![*学习如何使用自定义的 `UIGestureRecognizer` 来识别圆*](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150808101752661)

*学习如何使用自定义的 `UIGestureRecognizer` 来识别圆*



---
 
自定义手势可以使 app 更独特，更有活力，从而取悦用户。如果把基本的点击、拖移和旋转手势比作 iOS 世界里的通用皮卡，自定义手势则是拥有个性喷漆和水动力且闪闪发光的 hot rods（一种改装车）。通过这篇自定义 `UIGestureRecognizer`  教程你可以掌握所有关于手势识别的知识!

在这篇教程中我们准备了一个有趣的“找茬”小游戏，并通过自定义圆形手势来选择不一致的图片。在这个过程中你会学到如下几点：

 - 怎样利用 `UIGestureRecognizer`  子类所提供的状态和回调机制来简化手势检测。
 - 怎样将一个触摸点集合拟合成一个圆。
 - 怎样“模糊”识别特殊的形状，因为用手指绘制出来的形状通常是不精确的。

> 注意：本教程假定你已经知道手势识别是如何工作的，且知道如何在 app 中使用系统定义的手势。如果你还不了解这些知识，请看本站的[UIGestureRecognizer](http://www.raywenderlich.com/76020/using-uigesturerecognizer-with-swift-tutorial)教程。

# 开始

MatchItUp 会向用户展示 4 张图片，3 张是一致的，另外1张和其他的略有不同。用户的任务就是用手指在上面画一个圆圈，找出不同的那张：

![MatchItUp! 游戏 ](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150808105828527)

*MatchItUp! 游戏 *

在这里下载[教程初始项目](http://cdn4.raywenderlich.com/wp-content/uploads/2015/05/MatchItUp-Starter1.zip)

构建并运行 app；你会看到 4张图片，但是目前还不能选出不同的那张。你的任务就是给这个游戏添加一个自定义手势识别器。当用户在一个图片周围画了一个圆，自定义手势识别器就会检测到。如果他们刚好在不同的那张上画了一个圆，就能获胜！

# 添加一个自定义手势识别器

打开**File\New\File… **然后选择**iOS\Source\Cocoa Touch Class**模板来创建一个名为**CircleGestureRecognizer**的**UIGestureRecognizer**子类。注意选择**Swift**。然后点击**Next**然后再点击**Create**。

为了让手势识别器生效，它必须连接到响应链中的某个视图。当用户点击屏幕时，触摸事件在视图堆栈中转发，每个视图上的手势识别器都可以处理这些触摸事件。打开**GameViewController.swift**然后为手势识别器添加一个实例变量：

    var circleRecognizer: CircleGestureRecognizer!

下一步，在 `viewDidLoad()` 中添加如下代码：

    circleRecognizer = CircleGestureRecognizer(target: self, action: "circled:")
    view.addGestureRecognizer(circleRecognizer)

这段代码创建手势识别器并把它添加到主视图上。

等等… 如果目标是让用户圈出不同的那张图片，为什么不直接把识别器添加每张图片上，而是添加到主视图呢？

好问题——很高兴能对其进行解答！:]

构建一个手势时，一定要对用户界面的不精确性进行补偿。如果你曾经尝试过在触摸屏上很小的一个框内签上你的名字，你就会明白我的意思！:]

把识别器放在整个 view 上时，它可以让用户在图片的框之外更轻松地开始和继续某个手势，最终，你的识别器也会减轻那些不能画出完美圆用户的压力。

构建并运行 app；尽管你已经创建了一个 `UIGestureRecognizer` 子类，但是还没有添加任何代码，所以很显然它将只能识别…零个手势！为了使其生效，需要为手势识别器实现一个**手势识别状态机**。

# 手势识别状态机

所有用户操作中最简单的是点击；用户放下手指然后抬起。对于这个时间手势识别器会调用两个方法： `touchesBegan(_:withEvent:)` 和 ` touchesEnded(_:withEvent:)` 。

在简单的点击手势中，这两个方法和手势识别器的两个状态 `.Began` 和 `.Ended` 对应：

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150808163412664)

# 基础的点击手势识别器

为了看到这个动作的效果，你需要在 `CircleGestureRecognizer` 类中实现这个状态机。

首先在 `CircleGestureRecognizer.swift` 的最上面添加如下的 `import`。

    import UIKit.UIGestureRecognizerSubclass

`UIGestureRecognizerSubclass ` 是 `UIKit` 中的一个公共头文件，但是没有包含在 `UIKit ` 头文件中。因为你需要更新 `state ` 属性，所以必须导入这个头文件，否则， 它就只是 `UIGestureRecognizer` 中的一个只读属性。

现在在同一个类中添加如下代码：

    override func touchesBegan(touches: Set<NSObject>!, withEvent event: UIEvent!) {
     super.touchesBegan(touches, withEvent: event)
     state = .Began
    }
    
    override func touchesEnded(touches: Set<NSObject>!, withEvent event: UIEvent!) {
     super.touchesEnded(touches, withEvent: event)
     state = .Ended
    }

如果此时运行 app 然后点击屏幕，app 会因为你没有对这个手势进行处理而崩溃。

为**GameViewController.swift**文件中的类添加如下代码：

    func circled(c: CircleGestureRecognizer) {
     if c.state == .Ended {
      let center = c.locationInView(view)
      findCircledView(center)
     }
    }

当手势识别器的状态改变时它的 `target-action` 会被触发。当手指触碰到屏幕时， `touchesBegan(_:withEvent)` 触发。手势识别器将其状态置为 `.Began` ，然后自动调用 `target-action`。当手指离开屏幕时， `touchesEnded(_:withEvent)` 将其状态置为 `.Ended`，然后再次调用 `target-action` 。

之前在对手势识别器进行设置时，你已经把 `circled(_:)` 方法指定为它的  `target-action` 。方法的实现中使用提供的 `findCircledView(_:)` 方法来检测点击的是哪一张图片。

构建并运行 app；点击某张图片然后选中它。游戏会检查你的选择是否正确，然后进入下一轮：

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150808170446674)

*点击选择某个图片*

# 处理多点触摸

现在你已经有一个可用的点击手势识别器，对吗？不要这么着急下结论，手指可多着呢！:] 注意方法的名字中包含的是 “touches”——复数。手势识别器可以检测多手指手势，但是游戏的圆形手势意味着我们只识别单手指手势。

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150808171558567)

> 注：图片中的意思是我也差点忘了…

你需要检查是否只有一个手指触摸了屏幕。

打开**CircleGestureRecognizer.swift**文件然后修改 `touchesBegan(_:)` 使 `touches` 参数只允许包含一个 `UITouch` 对象：

    override func touchesBegan(touches: Set<NSObject>!, withEvent event: UIEvent!) {
     super.touchesBegan(touches, withEvent: event)
     if touches.count != 1 {
      state = .Failed
     }
     state = .Began
    }

下面介绍手势识别器的第三种状态：`.Failed`。`.Ended` 表示手势成功完成，而`.Failed`表示用户的手势不是你想要的。

及时把状态机置为终止状态是非常重要的，比如`.Failed`，这样其他等待响应的手势识别器才有机会解读触摸事件。

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150808172341718)

再次构建并运行app；尝试多手指点击和单手指点击。这次只有单手指点击才能对图片进行选择。

# 检测圆

“等等，”你喊道。“点击跟圆根本不是一回事啊！”

当然，如果你想了解其全部技术细节的话，一个点就是一个半径为 0 的圆。但在这里并没有什么意义；用户必须圈住图片，选择才有效。

如果要检测圆，你需要收集用户移动手指时所经过的点，然后看它们是否组成了一个圆。

看起来**集合**可以非常完美滴胜任这个工作。

在`CircleGestureRecognizer `类的顶部添加如下的实例变量：

    private var touchedPoints = [CGPoint]() // 记录历史点

用它来记录用户触摸的点。

现在在`CircleGestureRecognizer `类中添加如下方法：

    override func touchesMoved(touches: Set<NSObject>!, withEvent event: UIEvent!) {
     super.touchesMoved(touches, withEvent: event)
    
    // 1
    if state == .Failed {
     return
    }
    
    // 2
    let window = view?.window
    if let touches = touches as? Set<UITouch>, loc = touches.first?.locationInView(window) {
      // 3
      touchedPoints.append(loc)
      // 4
      state = .Changed
     }
    }

在初始的触摸事件之后用户每次移动手指都会触发 `touchesMoved(_:withEvent:)` 。每触发一次就顺序执行用数字标记的代码块：

 1. Apple 建议首先检查手势是否已经失效；如果已经失效，就不要继续处理其他的触摸事件了。触摸事件被缓存在事件队列中然后被串行处理。如果用户在触摸时移动足够快，手势失效后仍然会有触摸事件在等待处理。
 2. 为了方便后期的数学计算，把检测到的点转换为窗口坐标。因为这样可以更方便滴记录与任何具体视图无关的触摸事件，从而使用户可以在超出某张图片范围的地方画圆时仍然可以选择这张图片。
 3. 把点添加到数组中。
 4. 把状态更新为 `.Changed`。这会有调用 `target-action` 的副作用。

`.Changed` 是另外一个添加到状态机的状态。每当手势识别器的触摸事件发生变化时都会转换到`.Changed`状态；这些变化包括：手指移动、按下和抬起。

下面是添加了`.Changed`状态的状态机：

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150808180518393)

现在你已经获得了所有的点，如何去确定这些点是否组成一个圆呢？

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150808180622887)

# 验证这些点

首先，把如下的变量添加到 **CircleGestureRecognizer.swift**中类的顶部：

    var fitResult = CircleResult() // 有关于这条路径有多像圆的一些信息
    var tolerance: CGFloat = 0.2 // 圆的容错值
    var isCircle = false

这些变量会帮助你判断在可容忍范围内这些点是否组成一个圆。

修改 `touchesEnded(_:withEvent:)` 让它变成下面的样子:

    override func touchesEnded(touches: Set<NSObject>!, withEvent event: UIEvent!) {
     super.touchesEnded(touches, withEvent: event)
     
     // 现在用户已经完成了触控，确定这条路径是否是一个圆
     fitResult = fitCircle(touchedPoints)
     
     isCircle = fitResult.error <= tolerance
     state = isCircle ? .Ended : .Failed
    }

这里我们稍微作了点弊，使用了一个事先做好的圆形检测器。你可以看一看**CircleFit.swift**，但我只会对它的内部细节做一点点描述。检测器的主要目的是将记录的点拟合成一个圆。`error` 值代表了目前的路径和真正的圆形偏离了多少，而`tolerance `的存在则是因为你不能期望用户能画出一个完美的圆。如果`error`的值在`tolerance `的范围内，手势识别器将状态置为`.Ended`；否则将状态置为`.Failed`。

此时如果马上构建并运行 app，游戏不会正常工作，因为此时手势识别器仍然按点击来识别手势。

回到**GameViewController.swift**，然后将`circled(_:)`修改成如下的样子：

    func circled(c: CircleGestureRecognizer) {
     if c.state == .Ended {
      findCircledView(c.fitResult.center)
     }
    }

这里使用计算得到的圆的中心点来确定用户在哪个视图画圈，而不是使用最后触摸的那个点。

构建并运行 app；尝试使用你的手玩这个游戏——*相当*蛋疼。让 app 识别出你画的圆不是那么简单是不是？剩下的就是如何在数学理论和不精确的现实世界之间搭建一座桥梁。

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150808201918964)

# 画轨迹

因为在画圆的过程中很难准确地知道接下来该怎么画，所以你需要把用户手指移动的路径绘制出来。iOS 已经在`Core Graphics`中包含了你需要的功能。

把下面的实例变量声明添加到**CircleGestureRecognizer.swift**中

    var path = CGPathCreateMutable() // 运行 CGPath - 辅助绘制

这个变量提供了一个可变的`CGPath `对象，用于绘制路径。

把下面的代码添加到`touchesBegan(_:withEvent:)`的底部：

    let window = view?.window
     if let touches = touches as? Set<UITouch>, loc = touches.first?.locationInView(window){
      CGPathMoveToPoint(path, nil, loc.x, loc.y) // 开始构建路径
    }

这段代码保证路径从触摸开始的位置开始。

现在把下面的代码添加到`touchesMoved(_:withEvent:)`底部`if let`代码块的`touchedPoints.append(loc)`下：

    CGPathAddLineToPoint(path, nil, loc.x, loc.y)

每当手指移动时，你通过画线的方式把新的点添加到路径中。不要担心直线的部分，因为点和点之间距离很近，所以在你画的路径最终看起来会相当流畅。

为了使路径可见，需要将它绘制到游戏视图中。在`CircleDrawView`视图层级中已经有这样一个视图了。

如果要将路径展示在这个视图中，需要把下面的代码添加到**GameViewController.swift**中`circled(_:)`方法的底部。

```
if c.state == .Began {
  circlerDrawer.clear()
}
if c.state == .Changed {
  circlerDrawer.updatePath(c.path)
}
```

这段代码当新的手势开始时会清除视图中的内容，然后跟踪用户的手指，使用黄色的线画出路径。

构建并运行 app；尝试在屏幕上画圆然后观察它是如何工作的：

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150808204008932)

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150808204022359)

酷毙了！但你是否有注意到画第二个或者第三个圆时出现的搞笑情况呢？

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150808204259244)

尽管在变成`.Began`状态时有调用`circlerDrawer.clear()`，但是每次做一个新手势时，之前的并没有被清除掉。这意味着：是时候为你手势识别器的状态机引入新的动作：`reset()` 了。

# 复位动作

你需要在`touchesEnded` 之后 `touchesBegan` 之前调用 `reset()` 。这可以让手势识别器清除它的状态然后重新开始。

把下面的方法添加到**CircleGestureRecognizer.swift**中：

    override func reset() {
      super.reset()
      touchedPoints.removeAll(keepCapacity: true)
      path = CGPathCreateMutable()
      isCircle = false
      state = .Possible
    }

在这个方法里清空触摸点集合，然后把 `path ` 设置为新的路径。同时，把状态设置为 `.Possible`，这个状态表示触摸事件没有被匹配到或者手势失效了。

新的状态机看起来会像下面这样：

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150808205108876)

再次构建并运行 app；这一次，每次触摸时视图内容（以及手势识别器的状态)都会被清除。

# 数学原理

在 `CircleFit` 内部到底发生了什么？然后为什么有的时候会把一些类似C、S的奇怪形状当作圆形？

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150808205421840)

*仅仅是一条很短的线就被当作一个圆*

大家应该记得在高中的时候就学过圆的方程：![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150811141042442)。如果用户画了个圆，那么所有的触摸点都应该完全符合这个方程式：

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150808205811031)

或者更准确滴说，因为识别器需要识别出所有的圆，而不是以起始点为中心的圆，方程就应该是![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150811141539348)。当手势结束时，你所拥有的只是一堆仅仅有 x 和 y 的点集合。剩下的就是确定中心点![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150811141628165)以及半径![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150811141741875)：

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150808211942117)

*以 xc，yc 为中心的圆*

---

确定中心点和半径的方法有好几种，本教程采用的方法改编自 Nikolai Chernov 用 C++ 实现的 Taubin 拟合方法。流程如下：

 

 1. 首先，同时计算所有点的平均值来猜测圆的质心（也就是所有点的x和y坐标）。如果是标准的圆，所有点的质心就会是圆的圆心。如果这些点没有组成标准的圆，那么计算出来的圆心就会有所偏离：
	
	![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150809151117593)
	
	*圆心的猜测从一开始就是以所有点为基础的*
 2. 下一步计算**力矩**。假定圆心是有质量的。力矩就是用来计算触摸路径上的每个点对这个质量产生的力。
 3. 然后你把这个力矩值代入一个特征多项式，它是用来寻找“真正中心点”的根本。力矩同时用来计算半径。这个数学理论不在本教程的范围之内，而其核心思想就是用来保证所有点在![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150811141539348)方程式中![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150811141628165)和![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150811141741875)的值都相同数学方法。
 4. 最后，你计算出一个均方根误差来做拟合。这是用来衡量实际的点和圆轨迹偏离多少的方法：
	
	![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150809152626102)
	
	*蓝杠表示误差，或者和红色拟合圆和点的差距*

---

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150809152825053)

*所以他们说数学很难！哼！*

脑袋疼么？其实这个又臭又长的算法只是在所有点的中心拟合一个圆，然后根据每个点和计算得到的圆心的距离得到半径。然后再计算每个点和计算得到的圆之间的误差值。如果误差很小，就假定用户画了一个圆。

但是这个算法在路径组成对称圆形，比如 C 和 S 这种计算得到的误差值很小的情况，或者路径组成很短的弧或线，而这些点被当作一个大得多的圆上的一小段的情况时就会出错。

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150809155506445)

*大部分的点都在圆上，其他的点足够对称从而使它们能“互相抵消”*

---

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150809155634423)

*这张图展示了一条线是如何被拟合成一个圆的，因为这些点看起来像圆上的一条弧*

# 调试绘制

所以为了弄清楚这个奇怪的手势里都发生了什么，你可以把拟合圆在屏幕上绘制出来。

把**CircleDrawView.swift** 中 `drawDebug ` 的值设置为 `true`：

    var drawDebug = true // 设置成 true 将展示拟合相关的其他信息

这段代码会把拟合圆的一些其他信息绘制到屏幕上。

如果要将拟合细节更新到视图上，把如下代码分支添加到 **GameViewController.swift** 中的 ` circled(_:)` 方法：

    if c.state == .Ended || c.state == .Failed || c.state == .Cancelled {
     circlerDrawer.updateFit(c.fitResult, madeCircle: c.isCircle)
    }

再次构建并运行 app；画一个圆形路径，当你抬起手指时，拟合圆就被绘制到屏幕上，如果拟合成功就是绿色，拟合失败就是红色：

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150809161331009)

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150809161403958)

接下来会讲一点点其他方面的事情。

# 识别手势，而不是路径

回到被标记错的形状，为什么这些非圆形手势会被处理？拟合在两种情况下显然会出错：当绘制的形状在圆内部有点，以及绘制的形状不是一个完整的圆时。

## 检查圆内部

对于像类似 S，漩涡，数字 8 等等对称的形状。拟合得到的误差非常小，但是很显然它们都不是圆。这就是数学近似法和一个可用手势之间的差距。一个明显的修复方式就是排除所有在圆内部存在点的路径。

你可以通过检查所有的触摸点，看是否有点是在拟合圆内部的方式来解决这个问题。

把下面的辅助方法加到 **CircleGestureRecognizer.swift**中：

    private func anyPointsInTheMiddle() -> Bool {
      // 1
      let fitInnerRadius = fitResult.radius / sqrt(2) * tolerance
      // 2
      let innerBox = CGRect(
        x: fitResult.center.x - fitInnerRadius,
        y: fitResult.center.y - fitInnerRadius,
        width: 2 * fitInnerRadius,
        height: 2 * fitInnerRadius)
     
      // 3
      var hasInside = false
      for point in touchedPoints {
        if innerBox.contains(point) {
          hasInside = true
          break
        }
      }
     
      return hasInside
    }

这段代码对根据圆拟合出来的一个较小矩形**禁区**进行检查。如果有某个点出现在这个矩形中那么这个手势就失效了。上述代码做了如下的事情：

 1. 计算出一个较小的禁区。变量`tolerance` 将为散乱，但合理的圆提供足够的空间，但是也有足够的控件来排除那些正中间有点的非圆形状。
 2. 为了简化代码，这段代码只是在圆心构建了一个小方块。
 3. 这段代码会遍历所有的点，然后检查是否有点在 `innerBox` 内。

下一步，修改 `touchesEnded(_:withEvent:)` ，把如下代码添加到 `isCircle` 的判断中：

    override func touchesEnded(touches: Set<NSObject>!, withEvent event: UIEvent!) {
      super.touchesEnded(touches, withEvent: event)
     
      // 用户停止触摸，判断路径是否组成了一个圆
      fitResult = fitCircle(touchedPoints)
     
      // 保证没有点在圆的中间
      let hasInside = anyPointsInTheMiddle()
     
      isCircle = fitResult.error <= tolerance && !hasInside
     
      state = isCircle ? .Ended : .Failed
    }

这段代码使用这个检测方法来判断圆中间是否有点，如果有，那么就检测不到圆。

构建并运行。尝试画一个‘S’形状，你会发现它将不能被识别。太赞了！:]

## 处理小圆弧

现在你已经对非圆的弧形进行了处理，那些被当作超大圆一部分的讨厌短弧怎么办？如果你在调试绘制时观察过，路径（黑框内）和拟合圆的尺寸差距是非常巨大的：

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150809164720518)

被识别成圆的路径至少要和圆本上的尺寸差不太多：

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150809164847340)

修复这个问题只需要简单滴把路径的大小和拟合圆的大小做比较就可以了。

把下面的辅助方法添加到 **CircleGestureRecognizer.swift**中：

    private func calculateBoundingOverlap() -> CGFloat {
      // 1
      let fitBoundingBox = CGRect(
        x: fitResult.center.x - fitResult.radius,
        y: fitResult.center.y - fitResult.radius,
        width: 2 * fitResult.radius,
        height: 2 * fitResult.radius)
      let pathBoundingBox = CGPathGetBoundingBox(path)
     
      // 2
      let overlapRect = fitBoundingBox.rectByIntersecting(pathBoundingBox)
     
      // 3
      let overlapRectArea = overlapRect.width * overlapRect.height
      let circleBoxArea = fitBoundingBox.height * fitBoundingBox.width
     
      let percentOverlap = overlapRectArea / circleBoxArea
      return percentOverlap
    }

这个方法计算出用户的路径和拟合圆有多少是重叠的：

 1. 找出拟合圆和用户路径的包围盒。因为所有的触摸点都被做为 `CGMutablePath ` 路径变量的一部分，所以可以使用 `CGPathGetBoundingBox ` 方法来处理棘手的数学问题。
 2. 使用 `CGRect` 的 `rectByIntersecting` 方法来计算出两个矩形路径的重叠部分。
 3. 找出两个包围盒面积重叠部分的百分比。如果是一个良好的圆形手势，那么这个百分比会在80%-100%的范围内。在短弧的情况下，这个百分比会非常非常小！

下一步，修改 `touchesEnded(_:withEvent:)` 中对 `isCircle ` 的判断，如下：

    let percentOverlap = calculateBoundingOverlap()
    isCircle = fitResult.error <= tolerance && !hasInside && percentOverlap > (1-tolerance)

构建并运行 app；只有合理的圆形才能通过测试。你可以想尽办法愚弄它！:]

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150809170024013)

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150809170055566)

# 处理 Cancelled 状态

你是否有注意到之前**测试绘制**这节对 `.Cancelled` 的检查？触摸会在有系统告警、在手势识别器被某个代理明确取消、在触摸中途被置为不可用时被取消掉。除了更新状态机，不需要为圆形识别器做更多的事情。把下面的代码片段添加到**CircleGestureRecognizer.swift**：

    override func touchesCancelled(touches: Set<NSObject>!, withEvent event: UIEvent!) {
      super.touchesCancelled(touches, withEvent: event)
      state = .Cancelled // 提前设置为取消状态
    }

这段代码在触摸事件被取消时将 `state` 置为 `.Cancelled`。

# 处理其他触摸事件

当程序运行时，点击**New Set**。发现什么了么？对，按钮不能用了！这是因为手势识别器吃掉了所有的点击事件！

![这里写图片描述](http://swift.gg/img/articles/uigesturerecognizer-tutorial-creating-custom-recognizers/20150809192509536)

使手势识别器与其他控件正常交互的方式有几种。首选的方式是使用 `UIGestureRecognizerDelegate` 来重写默认行为。

打开 **GameViewController.swift**，在 `viewDidLoad(_:)` 中把手势识别器的 `delegate ` 设置为 `self`：

    circleRecognizer.delegate = self

现在在文件的底部添加如下的扩展来实现代理方法：

    extension GameViewController: UIGestureRecognizerDelegate {
      func gestureRecognizer(gestureRecognizer: UIGestureRecognizer, shouldReceiveTouch touch:UITouch) -> Bool {
        // 允许点击按钮
        return !(touch.view is UIButton)
      }
    }

这段代码阻止手势识别器去识别按钮上的触摸事件；而继续让按钮本身去处理触摸。代理方法还有好几个，这些代理方法可以用来自定义手势识别器在视图层级中的行为方式。再次构建并运行 app，点击按钮就可以正常使用了。

# 细心打磨这个游戏

剩下的就是处理交互细节，让游戏看起来是精心打磨过的。

首先，在某个图片被圈中之后你要阻止用户继续和视图交互。否则，在等待新一组图片出现时路径仍然会继续更新。

打开**GameViewController.swift**，把如下代码添加到 `selectImageViewAtIndex(_:)` 的底部：

    circleRecognizer.enabled = false

现在在 `startNewSet(_:)` 方法的底部让手势识别器重新生效，从而继续处理下一轮：

    circleRecognizer.enabled = true

下一步，把如下代码加到 `circled(_:)` 的 `.Began` 分支中：

    if c.state == .Began {
      circlerDrawer.clear()
      goToNextTimer?.invalidate()
    }

这段代码添加了一个计时器，这个计时器会在短暂的延迟后清除掉路径，从而使用户在延迟时间内还能重新尝试。

同时把如下代码添加在 `circled(_:)` 方法的最终状态检测中：

    if c.state == .Ended || c.state == .Failed || c.state == .Cancelled {
      circlerDrawer.updateFit(c.fitResult, madeCircle: c.isCircle)
      goToNextTimer = NSTimer.scheduledTimerWithTimeInterval(afterGuessTimeout, target: self, selector: "timerFired:", userInfo: nil, repeats: false)
    }

这段代码在手势识别器的状态变成结束、失败或者取消时设置一个短时间内启动的计时器。

最后，在 **GameViewController** 中添加如下方法：

    func timerFired(timer: NSTimer) {
      circlerDrawer.clear()
    }

这段代码在计时器启动时清除圆形，这样用户就知道画另外一个圆形来再次尝试。

构建并运行 app；如果手势不是近似的一个圆，你会发现路径在短暂的延迟后就会自动被清除掉。

# 现在该去哪？

你可以在这里下载[教程的完整项目](http://cdn5.raywenderlich.com/wp-content/uploads/2015/05/MatchItUp-Complete1.zip)。

现在你已经为你的游戏做了一个简单但功能强大的圆形手势识别器。你可以把这个概念进行延伸来识别其他形状，甚至可以自定义圆拟合算法来适应其他需求。

如果想要了解更多，可以查阅苹果官方文档中关于[Gesture Recognizers](https://developer.apple.com/library/ios/documentation/EventHandling/Conceptual/EventHandlingiPhoneOS/GestureRecognizer_basics/GestureRecognizer_basics.html)的章节。

如果你对本教程有任何疑问和评论，请在论坛下方的评论区自由发言！


