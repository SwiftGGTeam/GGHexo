在 iOS8（Swift）中使用 Cocoapods

> 作者：Arthur Knopper，[原文链接](http://www.ioscreator.com/tutorials/cocoapods-tutorial-ios8-swift)，原文日期：2015/07/07
> 译者：[Prayer](http://www.futantan.com)；校对：[shanks](http://codebuild.me/)；定稿：[shanks](http://codebuild.me/)
  







<!--此处开始正文-->

Cocoapods 是 iOS 应用的包管理工具。它简化了第三方库的导入并且将帮你处理库之间的依赖关系。在这个教程中，我们将会使用 cocoa pods 导入 `FontBlaster` 这个第三方库。使用 `FontBlaster` 这个库可以在项目中更加方便地使用第三方的字体。本教程的环境基于 iOS8 和 Xcode6.4。



打开 Xcode 使用 `Single View Application` 创建一个项目。项目名称可以使用 `IOS8SwiftCocoapodsTutorial`，其他配置项（比如：Organization Name 和 Organization Identifier）可以自定义。选择 Swift 作为开发语言，并且在设备选项选中 `iPhone`。 

![新建项目](http://swift.gg/img/articles/Cocoapods-Tutorial-in-iOS8-with-Swift/IOS8SwiftCocoapodsTutorial_1.png)

咱们的这个教程中会用到一个自定义字体，可以从[这里](http://www.ioscreator.com/s/OpenSans-Bold.ttf)下载，并加入到项目中。接下来，关闭 Xcode 项目并打开终端。首先我们需要安装 cocoa pods。这个过程将会用到 ruby 环境，而 Mac OS X 系统已经自带了 ruby。在终端中输入如下命令：

> sudo gem install cocoapods

---

> 译者注：因某些原因不能安装成功的同学，可以参考唐巧的这篇[博客](http://blog.devtang.com/blog/2014/05/25/use-cocoapod-to-manage-ios-lib-dependency/)

接下来使用以下命令克隆 Cocoapods 的 master 分支到本地。

> pod setup --verbose

然后进入 Xcode 项目文件目录，生成 `Podfile` 文件

> pod init

之后需要编辑 `Podfile` 文件，让它包含 FontBlaster 这个第三方库。使用如下命令打开它

> open -a Xcode Podfile

编辑后的 Podfile 文件如下

```
# Uncomment this line to define a global platform for your project
platform :ios, '8.0'
use_frameworks!

target 'IOS8SwiftCocoapodsTutorial' do
pod 'FontBlaster', '1.0.8'
end

target 'IOS8SwiftCocoapodsTutorialTests' do

end
```

> 译者注：这里的版本号 1.0.8 为译者加上，FontBlaster 已经支持 Swift 2.0，如果不指定为该版本号，会下载最新的 FontBlaster，这要求 Xcode 7.x版本。如果你使用的是 Xcode6.x 版本，需要指定该版本号。

项目的 target 是 iOS8.0，`use_frameworks!` 这句是必须的，因为 Swift 使用的是框架而不是静态库。`pod 'FontBlaster'` 告诉 Cocoapods 你想在项目中使用 FontBlaster 。保存对文件的修改，并在终端中输入以下命令

> pod install 

FontBlaster 和相关依赖都会被自动安装。同时会新建一个 `IOS8SwiftCocoapodTutorial.xcworkspace` 文件。打开这个 workspace，找到 Storyboard。向其中拖入一个 `Label`，并放在视图的中间偏上位置。

![放入Label](http://swift.gg/img/articles/Cocoapods-Tutorial-in-iOS8-with-Swift/IOS8SwiftCocoapodsTutorial_2.png)

点击 `Assistant Editor`，确保 `ViewController.swift` 和 Storyboard 可以同时显示，按住 `Ctrl` 同时从 Label 向 swift 文件中拖拽，随后创建如下 Outlet：

![创建 Outlet](http://swift.gg/img/articles/Cocoapods-Tutorial-in-iOS8-with-Swift/IOS8SwiftCocoapodsTutorial_3.png)

在 `ViewController.swift` 文件的开始，导入 `FontBlaster` 库。

> import FontBlaster

修改 `viewDidLoad` 代码：

```swift
  override func viewDidLoad() {
    super.viewDidLoad()
    
    FontBlaster.debugEnabled = true
    FontBlaster.blast()
    label.font = UIFont(name: "OpenSans-Bold", size: 30.0)
    label.text = "Testing Cocoapods"
  }
```

`debugEnabled` 属性被设置为 `true`，用来观察从 `bundle` 中加载字体的日志信息，通过调用 `blast()` 方法，`bundle` 中的所有字体都会被加载。编译运行程序，查看运行效果。

> 译者注：如果遇到 `No fonts were found in the bundle path` 提示，可以到 `'Targets' -> 'Build Phases' -> 'Copy Bundle Resources'` 中手动添加字体文件。

![运行效果](http://swift.gg/img/articles/Cocoapods-Tutorial-in-iOS8-with-Swift/IOS8SwiftCocoapodsTutorial_4.png)

你可以从 [Github](https://github.com/ioscreator/ioscreator) 上下载本教程的代码。



