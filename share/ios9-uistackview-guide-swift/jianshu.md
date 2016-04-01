iOS9 UIStackView 简介"

> 作者：Umberto Raimondi，[原文链接](https://www.uraimo.com/2015/09/08/ios9-uistackview-guide-swift/)，原文日期：2015-12-08
> 译者：[CoderAFI](http://coderafi.github.io/)；校对：[Channe](undefined)；定稿：[shanks](http://codebuild.me/)
  









> **示例程序采用 Swift2.0 编写，需要用 Xcode7 进行编译，可以访问 [Github](https://github.com/uraimo/uistackview-sample) 或者 [zipped](https://github.com/uraimo/uistackview-sample/archive/master.zip) 下载本文源代码**

iOS9 新加入了一个非常易用的布局控件 UIStackView，它可以将一组 UIView 视图进行垂直或水平方向的排列，用来替换手工使用 Auto Layout 对视图进行布局。



每个 UIStackView 控件都可以在垂直和水平方向上排列展示一组 subviews，并可以根据当前屏幕大小和方向的变化动态调整它的内容，感觉起来就像是一个隐形的容器。实际上 subviews 的位置是根据设置的对齐、间距和大小属性来决定的。

内部的原理是 UIStackView 类帮你管理了 Auto Layout 约束。想象一下 UIStackView 其实就是一个基于 Auto Layout 的抽象层从而使布局属性的创建简单化。你可以在一个主 UIStackView 中嵌套 UIStackView 从而让视图精确放置到相应的位置。

如果你做过 Android 开发，你会发现 UIStackView 概念跟 Android 中最常用的布局控件 LinearLayout 非常相似，这些布局的想法其实都是从早期的 Java Swing 开发中借鉴过来并加以完善的。

## 基础

UIStackView 既可以用代码编写也可以在 Interface Builder 中设计。

在 Interface Builder 中你可以从 Object Library 控件选择工具集里找到垂直或者水平对齐的 UIStackView 并添加到相应位置，然后就可以在 UIStackView 上添加新的视图了。

UIStackView 同样也可以对现有的一些视图进行包装，只需要选择他们并点击 Interface Builder 底部工具栏新加的![Stack icon](http://swift.gg/img/articles/ios9-uistackview-guide-swift/uistackview00.png1459387514.8102102)图标即可。

非常简单，但是我们的教程将用代码的方式实现一个简单的嵌套布局。

![](http://swift.gg/img/articles/ios9-uistackview-guide-swift/uistackview02.gif1459387515.8780005)

在这个简单的示例程序中，我们将会在状态栏下放置一个 UIStackView，里面包含四个控件：两个 UILabel，一个水平方向的 UIStackView 和 一个 UIButton。水平方向的 UIStackView 中包含了三个带有默认图标的按钮。

下面让我们创建一个 Single View Application，记住要将 Deployment Target 设置成 9.0+。

打开 `ViewController` 类并用下面的代码替换 `viewDidLoad` 方法：

    
    var stackView:UIStackView!
    var nestedStackView = UIStackView()
    
    override func viewDidLoad() {
        super.viewDidLoad()
    
        stackView.translatesAutoresizingMaskIntoConstraints=false
        self.view.addSubview(stackView)
        // Main UIStackView contraints, nearly fills its parent view
        self.view.addConstraints(NSLayoutConstraint.constraintsWithVisualFormat("V:|-30-[stackView]-30-|",options: NSLayoutFormatOptions.AlignAllLeading,metrics: nil, views: ["stackView":stackView]))
        self.view.addConstraints(NSLayoutConstraint.constraintsWithVisualFormat("H:|-10-[stackView]-10-|",options: NSLayoutFormatOptions.AlignAllLeading,metrics: nil, views: ["stackView":stackView]))
    
        stackView.axis = .Vertical
        stackView.alignment = .Fill
        stackView.spacing = 25
        stackView.distribution = .FillEqually
    
        var lbl = UILabel()
        lbl.text ="Label 1"
        lbl.backgroundColor = UIColor.redColor()
        stackView.addArrangedSubview(lbl)
    
        lbl = UILabel()
        lbl.text = "Label 2"
        lbl.backgroundColor = UIColor.greenColor()
        stackView.addArrangedSubview(lbl)
    
        nestedStackView.axis = .Horizontal
        nestedStackView.alignment = .Fill
        nestedStackView.spacing = 25
        nestedStackView.distribution = .FillEqually
        nestedStackView.addArrangedSubview(UIButton(type: .InfoDark))
        nestedStackView.addArrangedSubview(UIButton(type: .InfoLight))
        nestedStackView.addArrangedSubview(UIButton(type: .ContactAdd))
        stackView.addArrangedSubview(nestedStackView)
    
        let btn = UIButton(type: .System)
        btn.setTitle("Press Me", forState: .Normal)
        stackView.addArrangedSubview(btn)
    }

为了指定主 UIStackView 是垂直方向布局的我们把 `axis` 属性设置成 `.Vertical`，前三个控件将会等间距排列，剩下的UIButton会填充剩余的可用空间。在嵌套 UIStackView 中的三个默认按钮也是用同样的方式来排列。`alignment`、`distribution`、`spacing` 三个属性会在下面单独讲解，这里我们先忽略它们。

有时候你可能需要将部分视图隐藏起来或者显示出来，这对于 UIStackView 来说实现起来是非常容易的，你只需要设置相应视图的 `hidden` 属性就可以。

为了方便测试，我们给 UIButton 添加一个 `pressedMe` 的点击事件响应方法：

    
        ...
        btn.setTitle("Press Me", forState: .Normal)
        btn.addTarget(self, action: "pressedMe:", forControlEvents: UIControlEvents.TouchUpInside)
        stackView.addArrangedSubview(btn)
    
    }
    
    func pressedMe(sender: UIButton!){
        UIView.animateWithDuration(0.5) {
            self.nestedStackView.hidden = !self.nestedStackView.hidden
        }
    }

当点击这个按钮时，主 UISTackView 和 内部的 UISTackView 将会根据在 `viewDidLoad` 中设置的属性重新布局内部的子视图并带有短暂的显示或者隐藏动画效果。

如果需要，subviews 也可以完全从 UIStackView 中移除然后剩下的子视图也会根据各自的属性重新布局。

    
    func pressedMe(sender: UIButton!){
       stackView.removeArrangedSubview(nestedStackView)
       nestedStackView.removeFromSuperview()
    }

这个移除的操作需要两步，第一步是调用 `removeArrangedSubview` 方法用来从 UIStackView 删除视图并且重新布局剩余的 subviews 但是实际上**并没有从父视图上删除**。第二部就是调用 `removeFromSuperview` 方法以保证该视图从父视图中完全的被删除。

## UIStackView: Alignment, Distribution And Spacing 属性

下面让我们详细了解下  UIStackView 的布局属性：

![StackProperty](http://swift.gg/img/articles/ios9-uistackview-guide-swift/uistackview01.png1459387517.1515186)

### Axis 轴

定义子视图的布局方向，包含 Vertical（垂直） 和 Horizontal（水平）两个枚举值。

### Alignment 对齐

alignment 属性指定了子视图在布局方向上的对齐方式，如果值是 Fill 则会调整子视图以适应空间变化，其他的值不会改变视图的大小。有效的值包含：Fill、 Leading、 Top、 FirstBaseline、 Center、 Trailing、 Bottom、 LastBaseline。

### Distribution 分布

Distribution 属性定义了 subviews 的分布方式，可以赋值的5个枚举值可以分为两组： Fill 组 和 Spacing 组。

Fill 组用来调整 subviews 的大小，同时结合 spacing 属性来确定 subviews 之间的间距。

- Fill: subviews 将会根据自己内容的内容阻力（content resistance）或者内容吸附优先级（hugging priority）进行动态拉伸，如果没有设置该值，subviews 中的一个子视图将会用来填充剩余可用空间。

- FillEqually: 忽略其他的约束，subviews 将会在设置的布局方向上等宽或等高排列。

- FillProportionally: subviews 将会根据自己的原始大小做适当的布局调整。

Spacing 组指定了 subviews 在布局方向上的间距填充方式，当 subviews 不满足布局条件或有不明确的的 Auto Layout 设置时，该类型的值就会结合相应的压缩阻力（compression resistance） 来改变 subviews 的大小。

- EqualSpacing: subviews 等间距排列

- EqualCentering: 在布局方向上居中的 subviews 等间距排列

### Spacing 间距

spacing 属性根据当前 distribution 属性的值有不同方向的解释。

如果 UIStackView 的 distribution 属性设置的是 EqualSpacing、 EqualCentering，spacing 属性指的就是 subviews 之间的最小间距。相反如果设置的是 FillProportionally 属性，那么 spacing 的值就是严格的间距值。

## iOS7+ 兼容

官方的 UIStackView 只在 iOS9 以上系统可以使用，但是其他的开源组织在低版本的系统上也实现了相应的功能：

- [OAStackView](https://github.com/oarrabi/OAStackView)

- [TZStackView](https://github.com/tomvanzummeren/TZStackView)
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。