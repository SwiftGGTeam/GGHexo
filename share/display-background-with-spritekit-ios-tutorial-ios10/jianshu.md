SpriteKit 技巧之添加背景图片"

> 作者：Arthur Knopper，[原文链接](https://www.ioscreator.com/tutorials/display-background-with-spritekit-ios-tutorial-ios10)，原文日期：2017/01/17
> 译者：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；校对：[walkingway](http://chengway.in/)；定稿：[CMB](https://github.com/chenmingbiao)
  









Sprite Kit 是硬件加速的动画系统，为创建 2D 游戏进行了专门的优化。在本节教程中，将使用 Game 模板来添加一张背景图片。本节教程使用的是 Xcode 8.2.1 和 iOS 10.2。



打开 Xcode，选择 iOS -> Application -> Game 模板。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/587dfce23a04118eabdf7d95/1484651758293/?format=1500w)

Product Name 使用 **SpriteKitBackgroundTutorial**，填写自己的 Organization Name 和 Organization Identifier，Language 一栏选择 Swift，Game Technology 一栏选择 SpriteKit，Devices 一栏选择 iPhone。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58ff88c71b10e3c8c1dc6a0d/1493141718478/facebook-project?format=1500w)

本节教程需要一张图片作为背景图，从这里[下载](https://www.ioscreator.com/s/background.jpg)图片，添加到工程中，确保在添加时选择 “Copy items if needed” 选项。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/587dff5d46c3c46130f0a478/1484652392518/?format=1500w)

在 Xcode 的 Game 模板中，已经做了很多初始化的工作。在 Sprite Kit 框架中，每个场景（scene）控制 App 的一屏（screen）。找到 **GameViewController.swift** 文件，在 GameViewController 类里，已经定义好了 **viewDidLoad** 方法，在这个方法里创建场景，呈现 GameScene 对象。将 viewDidLoad 方法代码更改成如下所示：

    
    override func viewDidLoad() {
        super.viewDidLoad()
            
        let scene = GameScene(size:CGSize(width: 1080, height: 1920))
            
        let skView = self.view as! SKView
        scene.scaleMode = .aspectFill
        skView.presentScene(scene)
    }

找到 **GameScene.swift** 方法，已经定义好了 GameScene 类，在 **didMove** 方法中，实现自定义的代码。删除 GameScene 类里面所有的代码，然后添加 didMove 方法：

    
    class GameScene: SKScene {
        
        override func didMove(to view: SKView) {
            let background = SKSpriteNode(imageNamed: "background.jpg")
            background.position = CGPoint(x: size.width/2, y: size.height/2)
            addChild(background)
        }
    }

Sprite Kit 框架有个指定的类来创建控制 sprite（精灵）（译者注：sprite 是计算机图形学的专有名词，意为包含于场景中的二维图像或动画），就是 SKSpriteNode 类。在该节点（node）下，图片加载完成。接下来，将图片添加到场景中。最后，删除 GameScene.sks 和 Action.sks 文件，目前不需要这两个文件。

**运行**工程。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/587e00d546c3c46130f0ae45/1484652772003/?format=750w)

可以从 [github](https://github.com/ioscreator/ioscreator) 上下载 **SpriteKitBackgroundTutorial** 教程的源代码。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。