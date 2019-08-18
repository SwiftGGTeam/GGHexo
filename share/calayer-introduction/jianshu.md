CALayer 新手指南"

> 作者：Pranjal Satija，[原文链接](http://www.appcoda.com/calayer-introduction/)，原文日期：2016-08-16
> 译者：[Cwift](http://weibo.com/277195544)；校对：[Cee](https://github.com/Cee)；定稿：[CMB](https://github.com/chenmingbiao)
  









欢迎！这篇文章将教你一项 iOS 中的关键技术：*图层（layer）*。你可能已经知道了 iOS 中的视图，但你可能不知道每一个独立的视图背后都有称为图层的东西。图层是 Core Animation  框架中的内容。

你也许很好奇，「我从来没有用过一个图层，所以它可能没那么重要吧？」无论你知道与否，你的应用程序都会大量使用图层。不管是什么视图，iOS 上的视图都会包含一个图层。正是因为图层的存在，iOS 可以在你的应用中轻松检测到视图的位图信息，然后提供给设备的 GPU。请参照下面的图片（来自苹果公司），清晰地展示了 Core Animation 在 iOS 层次结构中的位置。

![](http://www.appcoda.com/wp-content/uploads/2016/08/calayer-intro.png)



### 为什么使用图层？

在智能手机等设备上，用户希望他们的一切操作都很快。保持连贯的帧速率很关键，这样用户才会觉得「丝滑流畅」。在 iOS 中，帧速率是每秒 60 帧。为了保持系统能在这个速率下运作，一个直接运行在 GPU 上、非常基础但是功能强大的图形功能层诞生了，它就是 *OpenGL*。

OpenGL 提供了大部分底层的（而且是最快的）访问权限，直达 iOS 设备的图像硬件。然而你需要做出权衡：OpenGL 太靠近底层了，即便是为了完成最简单的任务，都需要大量的代码。

为了能够缓解这个问题，苹果创建了 Core Graphics，它提供了更高级一些的方法，代码量也随之更少。使用 Core Graphics 的初衷是应用到一些比较底层的功能上。为了使 Core Graphics 的使用更简单，苹果创建了 Core Animation。它提供了 `CALayer` 类，并且允许一些基本的底层图像操作。

当苹果认为 Core Animation 中的很多高级高级功能在常规应用中并不总是需要的时候，UIKit 就诞生了，它提供了 iOS 中最顶层的图像访问权限。此设计方案的优点是，在你的应用中，你可以选择你需要的图像访问级别并且应用它，允许你挑选并精准地选择所需要的功能量级，使你不必编写无用的代码。
缺点是较高级别的图形 API 提供的功能比较少。讲这个故事是为了说明：因为 `CALayer` 的存在，iOS 系统可以洞悉你的应用中的视图层次结构，快速生成层次结构的位图信息，然后将其传递到 Core Graphics 中去，最终到达 OpenGL，这样通过设备的 GPU 处理后图像就呈现在屏幕上了。尽管在大多数情况下都不需要直接使用 `CALayer`，但是较为底层的 API 为用户提供了一些更灵活的自定义方案，我们将在本文中讨论。

### 访问 CALayer

关于图层的存在缘由已经讨论的够多了。让我们动起手来！正如我上面提到的一样，每一个视图都有一个图层来支持，可以通过 `UIView` 的 `layer` 属性访问。假设你有一个 `myView` 对象，你可以像下面这样访问它的 layer：

    
    myView.layer

好了，我们能够访问图层了，可以用它做些什么呢？你会惊讶地发现有非常多可以做的事情。我会在本教程的剩余部分展示其中的一部分技巧和效果。

### 示例工程

首先，打开[模板工程](https://github.com/appcoda/CALayerDemo/raw/master/layers-starter.zip)，让我们正式开始吧！学习的最佳途径是动手，所以我们将向这个应用中的视图添加自定义的效果。打开工程，你会发现它相当简单。它是一个空白的白色视图，中心有一个正方形的黑色子视图。让我们把它修饰得美观一点。打开示例工程，跳转到 `ViewController.swift`，正式开始。

![](http://www.appcoda.com/wp-content/uploads/2016/08/calayer-ib.png)

### 创建圆角

你可以使用 `CALayer` 的 `cornerRadius` 属性来设定图层边缘的圆角。让我们试试看。在 `viewDidLoad()` 中添加以下代码：

    
    box.layer.cornerRadius = 5

如预期的一样，这行代码将会给 `box` 的图层增加一个半径为 5 的圆角。看起来像这样：

![](http://www.appcoda.com/wp-content/uploads/2016/08/calayer-corner-radius-1-1240x802.png)

不算太坏，对吧？对于拐角大的图形需要增加圆角的半径，对于拐角小的图形减小圆角的半径。默认的，所有图层的圆角半径都是 0。

![](http://www.appcoda.com/wp-content/uploads/2016/08/calayer-corner-radius-1240x688.png)

### 添加阴影效果

阴影可以帮助我们在我们的应用中创建出深度的感觉，在界面设计中非常实用。使用阴影效果，可以使视图「浮动」在屏幕上。让我们来看看如何使用 `CALayer` 创建一个阴影效果。把下面的代码加到 `ViewController` 的 `viewDidLoad` 方法中：

    
    box.layer.shadowOffset = CGSizeMake(5, 5)
    box.layer.shadowOpacity = 0.7
    box.layer.shadowRadius = 5
    box.layer.shadowColor = UIColor(red: 44.0/255.0, green: 62.0/255.0, blue: 80.0/255.0, alpha: 1.0).CGColor

**第一行：**这一行设置图层阴影的偏移量为（5，5）。 `layer.shadowOffset` 中接受一个 `CGSize` 类型的参数。向 `layer.shadowOffset` 中传入（5，5）意味着图层的阴影出现在 `box.layer` 右侧 5 个点以及下方 5 个点连成的区域上。

**第二行：**这一行将图层阴影的不透明度设为 0.7。这意味着阴影应该是 70% 不透明的。

**第三行：**这一行将图层阴影的范围设为 5。阴影的范围代表了 `box.layer` 所创建的阴影的模糊范围。更高的范围值意味着阴影会更加扩散，但是可视度会降低。较低的范围值使得阴影更加显眼和集中。阴影范围为0会导致根本不会有模糊。换句话说，这使得阴影与图层保持完全相同的尺寸和形状。

**第四行：**这一行设置图层阴影的颜色为午夜蓝。注意这个属性是 `CGColor` 类型的，而不是一个 `UIColor`。在两种类型之间转换非常容易。你只要写 `myUIColor.CGColor`就可以啦。

---

让我们来看一下效果！

![](http://www.appcoda.com/wp-content/uploads/2016/08/calayer-shadow-1240x849.png)

### 应用边框

`CALayer` 还允许我们轻松地使用边框。让我们给 `box` 增加一个边框。

    
    box.layer.borderColor = UIColor.blueColor().CGColor
    box.layer.borderWidth = 3

**第一行：**这一行把边框的颜色设置为午夜蓝。这会使得 `box` 上的任何边框都呈现出蓝色。

**第二行：**这一行设置边框的宽度为 3。这意味着 `box` 周围绘制的边框将有 3 个点的厚度。

让我们看看增加了边框的 `box` 是什么样子。

![](http://www.appcoda.com/wp-content/uploads/2016/08/calayer-border-1240x776.png)

### 显示图像

你还可以把一个图片分配给图层，以便在图层上展示图片。在示例工程中有一个可爱的树的图片，感谢这个[网站](http://www.thelensflare.com/imgs/april-snow-on-an-old-oak-tree_50053.html)。让我们用图层来展示这张图片。在 `viewDidLoad` 中加入以下代码：

    
    box.layer.contents = UIImage(named: "tree.jpg")?.CGImage
    box.layer.contentsGravity = kCAGravityResize
    box.layer.masksToBounds = true

**第一行：**这一行使用文件名 `tree.jpg` 创建了一个 `UIImage` 对象，然后把它传给了图层的 `contents` 属性。

**第二行：**这一行设置图层的内容重心来调整大小，这意味着图层中的所有内容将被调整大小以便完美地适应图层的尺寸。

**第三行：**我们设置 `masksToBounds` 为 `true`，以便图层中任何延伸到边界外的子图层都会在边界处被剪裁。如果你不明白这句话的含义，你可以把这个值设置为 `false`，然后查看效果。

下面是效果。

![](http://www.appcoda.com/wp-content/uploads/2016/08/calayer-images-masktobounds.jpg)

### 背景色和不透明度

我们已经讨论过了如何向 `CALayer` 中添加那些在 `UIKit`中无法实现的特殊效果，但我们还应该讨论一下如何通过 `CALayer` 修改 `UIKit` 暴露给 `UIView` 的大部分属性。例如你可以改变视图的背景颜色和不透明度：

    
    box.layer.backgroundColor = UIColor.blueColor().CGColor
    box.layer.opacity = 0.5

### CALayer 的性能

向图层添加大量自定义效果可能会对性能产生影响。现在，我们将讨论 `CALayer` 的两个属性，它们可以帮助我们大幅度提高应用程序的性能。

首先，让我们来讨论下 `drawsAsynchronously`。这是属性在 `CALayer` 上指定了在绘制图层时 CPU 必须执行的那些操作是否需要在后台线程中执行的作用。如果这个属性被设置为 `true`，图层看起来与往常一样，但是绘制它所需的 CPU 计算将在后台线程中执行。如果你的应用中有一个需要大量重新绘制的视图（例如地图视图或表格视图），请将此项设为 `true`。

另一个属性是 `shouldRasterize`。这是 `CALayer` 上的另一个属性。它指定了是否应该对图层进行光栅化。当这个属性被设置为 `true` 的时候，图层只被绘制一次。每当图层被动画化的时候，图层不会被重绘，而是不断复用第一次绘制时的位图信息。如果你的应用中有一个视图不需要频繁重绘，则应将这个属性设置为 `true`。注意，当设置 `shouldRasterize` 时，图层的外观可能会在 Retina 屏幕的设备上有所不同。这是因为图层存在所谓的光栅化比例，这个比例用在图层发生光栅化的时候。要防止这种情况发生，把图层的 `rasterizationScale` 设置为 `UIScreen.mainScreen().scale`，这样在图层进行光栅化的时候会与屏幕绘制的比例保持一致。

注意，99% 的情况下你都不需要自己去设置这些属性。手动设置它们可能导致性能低下。如果你能确定视图或图层的绘制正在影响应用程序的性能，你也只能自行设置这两个属性中的一个。

### 结论

现在你知道 `CALayer` 是什么了！了解一些比较底层的图像知识可以帮助你在你的应用中创建一些很酷的效果。希望你喜欢这个新手指南。

作为参考，你可以在 GitHub 上下载这个[示例工程](https://github.com/appcoda/CALayerDemo)。如果你有任何问题或者反馈，请在下面给我留言。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。