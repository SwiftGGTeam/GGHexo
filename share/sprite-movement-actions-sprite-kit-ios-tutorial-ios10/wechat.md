Sprite Kit 教程：二维图形动画"

> 作者：Arthur Knopper，[原文链接](https://www.ioscreator.com/tutorials/sprite-movement-actions-sprite-kit-ios-tutorial-ios10)，原文日期：2017-04-18
> 译者：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；校对：[way](undefined)；定稿：[shanks](http://codebuild.me/)
  









Sprite Kit 里，精灵（译者注：精灵的英文单词为 Sprite，计算机图形学，指包含于场景中的二维图像或动画）运动的机制是使用动作（actions）。将某种类型的动作添加到一个节点（node）上，Sprite Kit 自动更新位置直到动作完成。更棒的是，可以将多个动作（actions）组合起来。在本节教程中，我们将学习如何给精灵添加动作。本节教程使用 Xcode 8.3 和 iOS 10.3。


### 设置工程

打开 Xcode，使用 Game 模板创建工程。

![](http://swift.gg/img/articles/sprite-movement-actions-sprite-kit-ios-tutorial-ios10/xcode-game-templateformat=1500w1500530564.45)

Product Name 使用 **SpriteKitActionsTutorial**，填写自己的 Organization Name 和 Organization Identifier，Language 一栏选择 Swift，Devices 一栏选择 iPhone。

![](http://swift.gg/img/articles/sprite-movement-actions-sprite-kit-ios-tutorial-ios10/spritekit-actions-projectformat=1500w1500530565.94)

本节教程需要一个精灵，所以[下载](https://www.ioscreator.com/s/Apple.png)图片，将图片放到 Assets 目录中。

打开 **GameViewController.swift** 文件，按如下所示修改 **viewDidLoad** 方法：

    
    override func viewDidLoad() {
        super.viewDidLoad()
            
        let scene = GameScene(size: CGSize(width:750, height: 1334))
        scene.scaleMode = .aspectFill
            
        let skView = self.view as! SKView
        skView.presentScene(scene)
    }

gameScene 场景创建好了。打开 **GameScene** 文件，已经定义好了 GameScene 类，删除所有的代码，然后如下所示添加 **didMove(to:)** 方法。

    
    override func didMove(to view: SKView) {
        let apple = SKSpriteNode(imageNamed: "Apple.png")
        apple.position = CGPoint(x: size.width/2, y: size.height/2)
            
        self.addChild(apple)
    }

将 Apple.png 图片赋给变量 apple，将其居中添加到当前场景。**运行**工程，可以看到苹果已经居中出现在屏幕上了。

![](http://swift.gg/img/articles/sprite-movement-actions-sprite-kit-ios-tutorial-ios10/center-spritekit-simulatorformat=750w1500530566.73)

为了让该精灵运动，需要创建一个运动动作（move action），让该精灵运行此运动动作。将下列代码添加到 **didMove(to:)** 方法的尾部：

    
    let moveBottomLeft = SKAction.move(to: CGPoint(x: 100,y: 100), duration:2.0)
    apple.run(moveBottomLeft)

**运行**工程，精灵会从中间移动到左下角，耗时 2 秒。

![](http://swift.gg/img/articles/sprite-movement-actions-sprite-kit-ios-tutorial-ios10/bottomleft-spritekit-simulatorformat=750w1500530567.46)

**moveTo:duration** 方法使用的是绝对位置，想让精灵移动到相对的位置，只需要使用 moveBy 变量（To move the sprite relative of the current position you can use the moveBy variant，这句翻译不确定）。只需改变一下两行代码：

    
    let moveRight = SKAction.moveBy(x: 50, y:0, duration:1.0)
    apple.run(moveRight)

这会让精灵向右移动 50 points。使用 sequence（连贯） 可以将将动作连起来。删除 run 这行代码，添加下面的代码：

    
    let moveBottom = SKAction.moveBy(x: 0, y:-100, duration:3.0)
    let sequence = SKAction.sequence([moveRight, moveBottom])
            
    apple.run(sequence)

**运行**，可以看到连贯的动作。

![](http://swift.gg/img/articles/sprite-movement-actions-sprite-kit-ios-tutorial-ios10/sequence-spritekit-simulatorformat=750w1500530568.15)

通过调用 **reversedAction**，有些动作可以做反向处理，也就是说，新动作是之前旧动作的相反方向。删除 sequence 这行代码然后填写下列代码：

    
    let reversedMoveBottom = moveBottom.reversed()
    let sequence = SKAction.sequence([moveRight, moveBottom, reversedMoveBottom])

**运行**工程，这时可以看到 moveBottom 动作后面跟着一个相反的动作。还可以让动作重复多次或者无限循环，删除 run 这行代码添加下列代码：

    
    let endlessAction = SKAction.repeatForever(sequence)
    apple.run(endlessAction)

**运行**工程，这些动作会无限循环。

![](http://swift.gg/img/articles/sprite-movement-actions-sprite-kit-ios-tutorial-ios10/repeat-forever-spritekit-simulatorformat=750w1500530569.94)

可以从 [github](https://github.com/ioscreator/ioscreator) 上下载 **SpriteKitActionsTutorial** 教程的源代码。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。