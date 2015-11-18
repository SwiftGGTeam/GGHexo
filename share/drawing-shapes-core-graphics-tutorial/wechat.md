使用 Core Graphics 绘制基本形状

> 作者：Arthur Knopper，[原文链接](http://www.ioscreator.com/tutorials/drawing-shapes-core-graphics-tutorial)，原文日期：2015/08/31
> 译者：[lfb_CD](http://weibo.com/lfbWb)；校对：[千叶知风](http://weibo.com/xiaoxxiao)；定稿：[shanks](http://codebuild.me/)
  










`Core Graphics`是`Cocoa`和`Cocoa Touch`所共有的API。它允许你在画布上绘制图形对象。在此篇教程中，我们会绘制一些标准的图形，比如三角形或者圆形。教程运行在 iOS 9 和 Xcode 7 下。



打开 Xcode 并创建一个`new Single View Application`项目。项目名称为**`IOS9DrawShapesTutorial`**，接着填上你的`Organization Name`和`Organization Identifier`，选择 Swift 语言，确保在设备一栏只选择了 IPhone。
![](http://swift.gg/img/articles/drawing-shapes-core-graphics-tutorial/format=750w1444269942.141822)

打开故事板，在主视图中拖入三个按钮，使他们水平对齐，并分别设置`title`为"Lines, Rectangle, Circle"。之后你的故事板内容应该像下面这样：
![](http://swift.gg/img/articles/drawing-shapes-core-graphics-tutorial/DrawShapes-Storyboard.pngformat=750w1444269942.392771)

选中所有按钮，打开`Attributes Inspector`(属性检测器)。在`View`部分给从左到右的按钮添上"0,1,2"的`tag`。`tag`是我们后面才需要的，我们可以通过`tag`的值得知哪个按钮被按下了。
![](http://swift.gg/img/articles/drawing-shapes-core-graphics-tutorial/format=300w1444269942.461758)

打开`Assistant Editor`(关联面板)，并确保**`ViewController.swift`**文件是打开着的。按住 `Ctrl`键，把`Lines`按钮拖出到`ViewController.swift`文件中，并创建下面的`Action`
![](http://swift.gg/img/articles/drawing-shapes-core-graphics-tutorial/format=300w1444269942.535743)

选中其它的按钮，按住`Ctrl`键并拖到`ViewController`类的`IBAction`方法里(刚刚创建的那个`Action`)。之后我们点击每一个按钮就会触发这里的`IBAction`方法。绘制的图形会呈现在一个自定义的视图中。接下来，我们为项目添加一个新文件。选中`File` ->`New File` ->`iOS` ->`Source` ->`Cocoa Touch Class`。类名称为"ShapeView",确保父类为`UIView`。
![](http://swift.gg/img/articles/drawing-shapes-core-graphics-tutorial/format=750w1444269942.609728)

打开`ShapeView.swift`文件，添加下面的属性。

    
    var currentShapeType: Int = 0
`currentShapeType`属性是用于选择正确的方法画出对应的对象。接着添加初始化方法：

    
    init(frame: CGRect, shape: Int) {
        super.init(frame: frame)
        self.currentShapeType = shape
    }
        
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
当自定义视图被初始化的时候，`tag`的值会决定绘制的图形类型。**`drawRect`**方法会在自定义视图绘制的过程中调用。

    
    override func drawRect(rect: CGRect) {
        switch currentShapeType {
        case 0: drawLines()
        case 1: drawRectangle()
        case 2: drawCircle()
        default: print("default")
        }        
    }

接下来，实现绘图的方法：

    
    func drawLines() {
        //1
        let ctx = UIGraphicsGetCurrentContext()
            
        //2
        CGContextBeginPath(ctx)
        CGContextMoveToPoint(ctx, 20.0, 20.0)
        CGContextAddLineToPoint(ctx, 250.0, 100.0)
        CGContextAddLineToPoint(ctx, 100.0, 200.0)
        CGContextSetLineWidth(ctx, 5)
            
        //3
        CGContextClosePath(ctx)
        CGContextStrokePath(ctx)
    }
        
    func drawRectangle() {
        let center = CGPointMake(self.frame.size.width / 2.0, self.frame.size.height / 2.0)
        let rectangleWidth:CGFloat = 100.0
        let rectangleHeight:CGFloat = 100.0
        let ctx = UIGraphicsGetCurrentContext()
            
        //4
        CGContextAddRect(ctx, CGRectMake(center.x - (0.5 * rectangleWidth), center.y - (0.5 * rectangleHeight), rectangleWidth, rectangleHeight))
        CGContextSetLineWidth(ctx, 10)
        CGContextSetStrokeColorWithColor(ctx, UIColor.grayColor().CGColor)
        CGContextStrokePath(ctx)
                
        //5
        CGContextSetFillColorWithColor(ctx, UIColor.greenColor().CGColor)
        CGContextAddRect(ctx, CGRectMake(center.x - (0.5 * rectangleWidth), center.y - (0.5 * rectangleHeight), rectangleWidth, rectangleHeight))
            
        CGContextFillPath(ctx)
    }
        
    func drawCircle() {
        let center = CGPointMake(self.frame.size.width / 2.0, self.frame.size.height / 2.0)
        let ctx = UIGraphicsGetCurrentContext()
        CGContextBeginPath(ctx)
            
        //6 
        CGContextSetLineWidth(ctx, 5)
            
        let x:CGFloat = center.x
        let y:CGFloat = center.y
        let radius: CGFloat = 100.0
        let endAngle: CGFloat = CGFloat(2 * M_PI)
            
        CGContextAddArc(ctx, x, y, radius, 0, endAngle, 0)
            
        CGContextStrokePath(ctx)
    }

 1. 这里的`Graphic Context`就是你绘图的画布。如果你想在一个视图上绘图，那么`view`就是你的画布。这里我们需要得到一个`Graphic Context`的引用。
 2. `path`就是一些线条,弧线和曲线的集合,你可以在当前画布使用它们来构建的复杂对象。这里我们绘制了一些线条并设置了线条的宽度为 5。
 3. 此处关闭`path`，并绘制图像到画布上。
 4. `CGContextAddRect`方法给我们绘制了一个长方形，并且外框的颜色为灰色。
 5. 这里定义了一个相同的长方形，并填充绿色到内部。
 6. `CGContextAddArc`绘制了一个圆形。

接着，在**`ViewController.swift`**文件中实现**`buttonPressed`**方法

    
    @IBAction func buttonPressed(sender: UIButton) {
        let myView = ShapeView(frame: CGRectMake(50, 200, 280, 250), shape: sender.tag)
        myView.backgroundColor = UIColor.cyanColor()
        view.addSubview(myView)
    }
编译并运行程序，点击不同的按钮来绘制不同的图形。
![](http://swift.gg/img/articles/drawing-shapes-core-graphics-tutorial/format=750w1444269942.683713)

你可以在[Github](https://github.com/ioscreator/ioscreator)上下载**`IOS9DrawShapesTutorial`**的代码。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。