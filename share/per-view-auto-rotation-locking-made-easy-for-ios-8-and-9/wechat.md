在 iOS8 和 iOS9 中锁定视图自动旋转"

> 作者：Weston Hanners，[原文链接](http://www.alloc-init.com/2015/11/per-view-auto-rotation-locking-made-easy-for-ios-8-and-9/)，原文日期：2015-11-18
> 译者：littledogboy；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  









这周我在开发一个 App，客户想要此 App 在某些情况下锁定竖屏，某些情况下锁定横屏。幸运的是，我已经在自动布局下创建了所有的视图，因此它们已经支持所需的约束，我仅需要锁定视图旋转。



旋转 API 属于 UIKit 中经常被弃用的内容，因此当我开始旋转工作时，不得不查一下。我还想说，弃用和替换相关的 API 太麻烦了。经过一个小时左右的研究和两个小时的实践，我终于整出了两部分。（译者注：=W=，我当时也搞了好久）

* 选中 `Info.plist` 文件中所有你想要支持的旋转方向。

![](https://swift.gg/img/articles/per-view-auto-rotation-locking-made-easy-for-ios-8-and-9/InterfaceOrientation.png1450312516.562497)

* 然后我们仅需要实现一个方法。

Swift 1.2

    
    override func supportedInterfaceOrientations() -> Int {
      return Int(UIInterfaceOrientationMask.Portrait.rawValue)
    }

Swift 2.0

    
    override func supportedInterfaceOrientations() -> UIInterfaceOrientationMask {
      return UIInterfaceOrientationMask.Portrait
    }

确保选中你想要锁定的方向是横屏还是竖屏。

这可能是我最近看到过的最乱的接口改动，并且我花了好长时间才意识到我在 Swift 1.2 中犯下的错误。（那个 Int cast 太丑了）

[Sample Code](http://www.alloc-init.com/wp-content/uploads/2015/11/RotationTest.zip) (Swift 1.2 Project)

**Update 11/18/2015:**

我刚刚意识到,我标题有点词不达意。

**“使用一个小技巧锁定视图控制器”**

好吧，下不为例。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。