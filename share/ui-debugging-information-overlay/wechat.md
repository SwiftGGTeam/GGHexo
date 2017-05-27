[Jinkey 原创]震惊！iOS 系统居然自带悬浮窗口调试工具"


>* 原文链接 : [震惊！iOS 系统居然自带悬浮窗口调试工具 —— Jinkey 原创](http://www.jianshu.com/p/736353b5cfaf?utm_campaign=hugo&utm_medium=reader_share&utm_content=note&utm_source=weixin-friends&from=singlemessage&isappinstalled=1)
* 原文作者 : [Jinkey](http://www.jianshu.com/u/8354f5625fe4)



### 1 背景

> 英文原文：
[http://ryanipete.com/blog/ios/swift/objective-c/uidebugginginformationoverlay/](http://ryanipete.com/blog/ios/swift/objective-c/uidebugginginformationoverlay/)
>
> 我写得这个并不是翻译而是用自己的理解重新表述这个功能，和原文内容有出入，有能力的可以查看英文原文。

我们经常使用各种调试工具，或者开源库来支持悬浮窗调试信息，但苹果的私有方法就提供了 `UIDebuggingInformationOverlay` 。



![](http://upload-images.jianshu.io/upload_images/854231-2ef0080f4eea8935.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 2 如何使用

在 `AppDelegate` 的 `didFinishLaunchingWithOptions` 方法中加入两行代码即可。

    
    let overlayClass = NSClassFromString("UIDebuggingInformationOverlay") as? UIWindow.Type
    _ = overlayClass?.perform(NSSelectorFromString("prepareDebuggingOverlay"))

运行程序后，两根手指点击状态栏即可调起这个调试的悬浮层。

### 3 能做什么

#### 3.1 查看整个 window 的 View嵌套关系

> View Hierarchy

这个功能可以查看页面层级的结构树，点击感叹号进入详情页（点 `cell`  是没反应的），会展示那个 `view` 的 `frame` 、 `bounds` 和其他一些实例变量。

![](http://upload-images.jianshu.io/upload_images/854231-66b7d3e56dd27cff.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 3.2 查看当前 ViewController 的属性

> VC Hierarchy

查看激活的 `ViewController` 的 `childrenViewCotroller` 的结构树和相关属性：

![](http://upload-images.jianshu.io/upload_images/854231-bbae2392b4a80173.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 3.3 查看 UIApplication 的成员属性

> Ivar Explorer

![](http://upload-images.jianshu.io/upload_images/854231-04044fb28c7d6910.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 3.4 测量组件大小

> Measure

一开始还挺懵逼不知道要怎么用，后来发现手指是直接在悬浮窗的外部进行进行拖动就可以了，如果你的组件被悬浮窗挡住了好像就没办法了。<br>
选择 Vertical ，手指在屏幕拖动即可显示某个组件的高度；<br>
选择 Horizontal ，手指在屏幕拖动即可显示某个组件的 宽度；

![](http://upload-images.jianshu.io/upload_images/854231-7f0f0d183cc50196.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 3.5 效果对比

> Spec Compare

从相册读取一个图片（你必须在info.plist 先配置相册权限NSPhotoLibraryUsageDescription）和当前界面对比。

点击 Add -> 从相册选择一个界面截图 -> 点击刚添加的截图 -> 手指在屏幕（悬浮窗外部）上下滑动 -> 即可动态改变截图的透明度来对比截图和当前界面的差异 -> 双击退出。

![](http://upload-images.jianshu.io/upload_images/854231-d8eae18f88927c88.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我的微信公众号 `jinkey-love` 欢迎交流
