教程：使用手势来拖动视图"

> 作者：Arthur Knopper，[原文链接](https://www.ioscreator.com/tutorials/dragging-views-gestures-tutorial-ios10)，原文日期：2016-11-07
> 译者：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；校对：[星夜暮晨](http://www.jianshu.com/users/ef1058d2d851)；定稿：[CMB](https://github.com/chenmingbiao)
  









iOS 的优势在于可以触摸和手势交互。在本节教程中，我们会展示一些借助拖曳手势识别器 (pan gesture recognizer) 来进行拖拽的自定义视图 (views)，本节教程使用 Xcode 8 和 iOS 10。



打开 Xcode，创建一个 Single View Application。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5818680a2e69cfd82f6eb336/1477994519169/?format=750w)

点击 Next，product name 一栏填写 **IOS10DraggingViewsTutorial**，填写好 Organization Name 和 Organization Identifier，Language 选择 Swift，Devices 选择 iPhone。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/581868402e69cfd82f6eb457/1477994569950/?format=750w)

首先，先创建随机出现在屏幕上的视图，菜单栏选择 File->New->File->iOS->Cocoa Touch Class，创建类文件，命名为 **MyView**，Subclass 选择 UIView。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/581868752e69cfd82f6eb55a/1477994622410/?format=750w)

找到 **MyView.swift** 文件，添加下列属性：

    
    var lastLocation = CGPoint(x: 0, y: 0)

这个变量记录用户触摸点的最后位置。接下来实现 `init` 方法。

    
    override init(frame: CGRect) {
        super.init(frame: frame)
            
        // 初始化代码
        let panRecognizer = UIPanGestureRecognizer(target:self, action:#selector(MyView.detectPan(_:)))
        self.gestureRecognizers = [panRecognizer]
            
        // 视图的颜色随机显示
        let blueValue = CGFloat(Int(arc4random() % 255)) / 255.0
        let greenValue = CGFloat(Int(arc4random() % 255)) / 255.0
        let redValue = CGFloat(Int(arc4random() % 255)) / 255.0
            
        self.backgroundColor = UIColor(red:redValue, green: greenValue, blue: blueValue, alpha: 1.0)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

首先给视图添加一个拖曳手势识别器 (pan gesture recognizer)，这样就可以点击选中并拖拽视图到新的位置。接下来创建随机颜色，以作为视图的背景色。然后实现 `detectPan` 方法，这样在每次识别到手势后，都会调用 `detectPan` 方法。

    
    func detectPan(_ recognizer:UIPanGestureRecognizer) {
        let translation  = recognizer.translation(in: self.superview)
        self.center = CGPoint(x: lastLocation.x + translation.x, y: lastLocation.y + translation.y)
    }

`translation` 变量检测到新的坐标值之后，视图的中心将根据改变后的坐标值做出相应调整。当用户点击视图时，调用 **touchesBegan:event** 方法，下面就来实现此方法。

    
    override func touchesBegan(_ touches: (Set<UITouch>!), with event: UIEvent!) {
        // 把当前被选中的视图放到前面
        self.superview?.bringSubview(toFront: self)
          
        // 记住原来的位置
        lastLocation = self.center
    }

选中某个视图后，这个视图会出现在其他视图的前面，其中心位置的坐标值就是` lastlocation` 变量值。现在，自定义的视图差不多完成了，移植到视图控制器 (view controller) 上吧。在 **ViewController.swift** 文件中实现 **viewDidLoad** 方法

    
    override func viewDidLoad() {
        super.viewDidLoad()
            
        let halfSizeOfView = 25.0
        let maxViews = 25
        let insetSize = self.view.bounds.insetBy(dx: CGFloat(Int(2 * halfSizeOfView)), dy: CGFloat(Int(2 * halfSizeOfView))).size
            
        // 添加视图
        for _ in 0..<maxViews {
            let pointX = CGFloat(UInt(arc4random() % UInt32(UInt(insetSize.width))))
            let pointY = CGFloat(UInt(arc4random() % UInt32(UInt(insetSize.height))))
                
            let newView = MyView(frame: CGRect(x: pointX, y: pointY, width: 50, height: 50))
            self.view.addSubview(newView)
        }
    }

有 25 个 50x50 大小的视图随机地出现在主界面上，运行工程，点击并拖动一个视图，这个视图会一直在其他视图上面。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/581a6663197aea1a94d7f277/1478125165551/?format=500w)

在 ioscreator 的 [github](https://github.com/ioscreator/ioscreator) 上可以下载到本节课程 **IOS10DraggingViewsTutorial** 的源代码。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。