模拟器和真机调试哪个更好？"

> 作者：Thomas Hanning，[原文链接](http://www.thomashanning.com/simulator-vs-real-device/)，原文日期：2015-08-31
> 译者：[靛青K](http://blog.dianqk.org/)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[shanks](http://codebuild.me/)
  






 

在开发时，你可以用模拟器或真机调试应用。不过哪个更好呢？ 



## 模拟器调试     

Xcode 6 包含 iOS 8 模拟器，你也可以手动安装 iOS 7 模拟器（`Preferences...>Downloads`）。你可以选择多种设备（iPhone 和 iPad），甚至可以选择“可自定义大小的 iPad”和“可自定义大小的 iPhone”，从而手动调整屏幕的分辨率。   

使用模拟器调试有以下几个优势：   

* 部署应用到模拟器比真机快很多，所以使用模拟器可以节约一些时间；
* 你通常不可能拥有全部分辨率和系统版本的设备，这在模拟器中只需要点点鼠标就能搞定；
* 访问应用所在的文件夹更容易，因为它就在你的 Mac 设备上。麻烦的是这个文件夹并不容易找到，不过可以使用黑科技：在你的应用中`delegate`的`applicationDidFinishLaunchingWithOptions`方法添加如下代码，这样应用启动完就会在控制台中打印路径：

`print(NSFileManager.defaultManager().URLsForDirectory(.DocumentDirectory, inDomains: .UserDomainMask))`

> 译者注：`applicationDidFinishLaunchingWithOptions`这个方法其实并不是`AppDelegate`的方法哦，是某个协议哦，有兴趣可以看看`AppDelegate.h`文件。    

## 真机调试     

尽管你可以在模拟器上做很多事，但模拟器还是无法完全替代真机。真机调试有以下几个优势：    

* 真机调试的结果会比模拟器准确很多。有一些地方在模拟器和真机上是不同的； 
* 像相机和蓝牙这样的硬件功能都是可用的；
* 你可以拿起你的设备，在真实情况中调试你的应用。例如，在很差的网络状况下进行调试；
* 如果你的应用有内存管理问题，在真机上更容易体现出来。在模拟器中可能不会遇到任何内存管理问题，但在手机上运行时，可能启动之后就立刻崩溃；
* 必须要在真机中调试应用性能，因为你的 Mac 性能太强。    

## 该用哪个  

答案很简单：根据你的调试目标决定。例如，你想去调试应用文件夹中的`sqlite`数据库，就应该选择模拟器，因为你可以很方便地访问它。但是，如果你想调试一款游戏的性能，那一定要用真机调试。    

## 结论    

模拟器和真机调试都非常有用，关键是找到合适的场景。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。