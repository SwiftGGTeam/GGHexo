基于 Swift 创建 CocoaPods 完全指南"

> 作者：AppCoda，[原文链接](https://www.appcoda.com/cocoapods-making-guide/)，原文日期：2016-09-16
> 译者：[ckitakishi](undefined)；校对：[mmoaay](http://www.jianshu.com/u/2d46948e84e3)；定稿：[CMB](https://github.com/chenmingbiao)
  









CocoaPods 是一个面向 Xcode 的项目依赖管理工具。当需要向项目添加库和框架时，它是一项极其有用且值得选择的服务。

试想一下，有人开发了一个足以改变游戏规则、且具有划时代意义的库，并想把它分享给这个世界。这时候该怎么办？长话短说，我要说的是你需要知道如何发布自己的 CocoaPod！



## 前提

本教程基于 Xcode 8 和 Swift 3。如果你想了解更多关于 Swift 3 的新特性，可以阅读这篇[很棒的教程](https://www.appcoda.com/swift3-changes/)。
> 译者注：[本站译作](http://swift.gg/2016/07/27/swift3-changes/)

目前，CocoaPods 有一个针对 Swift 3 和 Xcode 8 的预发布版本。为了编译基于 Swift 3 的项目，你应该使用这个版本。在终端执行下述命令即可完成安装：

    sudo gem install cocoapods --pre

同时你还需要一点 CocoaPods 的使用经验。不妨看看这篇 Gregg Mojica 写的[令人惊叹的教程](https://www.appcoda.com/cocoapods/)，我相信你会从中了解更多相关的内容。

好了，我们开始！

## 做一个值得用 Pod 管理的项目

从现在开始，让我们来做一个具有创造性，值得用 pod 管理的项目。我的想法是做一个会缓慢改变颜色的 UIView。我相信对于背景来说这会十分有用。

让我们先从最基础的地方开始。首先，在 Xcode 中创建一个新工程，选择使用 single view 模版。将工程命名为 FantasticView。项目创建之后，添加一个同名的 Swift 文件 `FantasticView.swift`。

![](https://www.appcoda.com/wp-content/uploads/2016/09/fantasticview-project.png)

现在你已经有了 `FantasticView.swift`，然后在其中定义一个名为 `FantasticView` 的类，它继承自 `UIView`：

    
    import UIKit
     
    class FantasticView : UIView {
     
    }

### 初始化

下一步，为上面定义的类添加两个初始化方法：

    
    override init(frame: CGRect) {
        super.init(frame: frame)
            
        // 核心部分 
    }
        
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
     
        // 你不需要实现这部分
    }

第一个初始化方法是 `init(frame: CGRect)` 。当一个 frame 被传给 `FantasticView` 的构造函数时该方法会被调用。我们将会在这里调用颜色更改函数。

### 酷炫的颜色

接下来，定义一个由 `UIColor` 对象组成的数组 `colors`。在我们的核心代码中，将会通过“遍历”这个数组来改变 `UIView` 的背景颜色。

    
    let colors : [UIColor] = [.red, .orange, .yellow, .green, .blue, .purple]

除此之外，你还需要添加一个计数器对象，在每次颜色改变时计数。

    
    var colorCounter = 0

但是为什么需要一个计数器呢？难道我们不是在遍历颜色数组吗？

注意我刚刚是怎么说“遍历”的

### 魔法调味剂

现在我要告诉你如何处理遍历颜色数组的问题。

你可能会认为在 `UIView` 的动画 block 中设置一系列颜色也是一种方法。然而遗憾的是，这无法正常工作，因为**最终**将只有一种颜色生效。

还有一种方法是创建一个 for 循环，然后在其中运行一个动画 block。这也将遇到先前的问题。要解决这个问题，你可以使用 GCD 来等待动画 block 执行完毕。

但是我坚信有更简单的方法。没错，你可以使用 `NSTimer`！

在你的 `init(frame: CGRect)` 方法中添加下述代码：

    
    let scheduledColorChanged = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { (timer) in  //1
        UIView.animate(withDuration: 2.0) {  //2
            self.layer.backgroundColor = self.colors[self.colorCounter % 6].cgColor  //3
            self.colorCounter+=1  //4
        }
    }
            
    scheduledColorChanged.fire()  //5

让我们逐行看一看上面的代码：

1. 创建一个 `Timer` 对象，也就是刚才说的的 `NSTimer`。为定时器设置一个时间间隔，让它重复执行某些动作。在设置时间间隔之后，我们的定时器将会运行一个代码块。

2. 调用 `animate(withDuration)` 函数。

3. 设置 `UIView.layer.backgroundColor`。注意，并不是 `UIView.backgroundColor`，因为 `layer` 属性可动，而 `UIView` 属性不可。

4. 计数器加 1。

5. 销毁计时器。

让我们看看第三步中我具体做了什么。通过下标可以从 `colors` 中取得一个 `UIColor`。`colorCounter` 应该是一个介于 0 到 5 之间的数字，因为这是 `colors` 数组的界限。我使用 `%` 或 `mod` 操作符来求得 `colorCounter` 除以 6 的余数。所以如果 `colorCounter` 是 10，则求余得 4，于是此时选择 `colors` 数组的第四项。

### 使用 Fantastic View

是时候在我们的主 View Controller 中使用 Fantastic View 了。我希望我的 View Controller 拥有一个酷炫的背景，所以让我们在 `ViewController.swift` 的 `viewDidLoad` 方法中插入下列代码：

    
    let fantasticView = FantasticView(frame: self.view.bounds)
            
    self.view.addSubview(fantasticView)

这里我们定义了一个 `FantasticView`，并使其边框等于 `ViewController` 的视图边界。然后将 `fantasticView` 作为子视图添加到主 `view`。

好了，在模拟器中运行应用吧！你将会看到随着时间推移，背景也随之改变。

![](http://www.appcoda.com/wp-content/uploads/2016/09/fantasticview-demo.gif)

## 推送到 GitHub

我知道你一定会问：“为什么不将 fantastic view 公布于众呢？人们有必要知道它！”

对，没错。让我们来创建一个 Pod，然后人们就可以使用它了！但是在此之前，需要先将其推送到 GitHub。

CocoaPods 要求 Pod 有一个源。大多数情况下，开发者使用 GitHub 来完成这一切。我们来快速过一遍提交项目到 GitHub 的必要步骤。如果你想知道更多 Git 的基础知识，不妨看一看这篇[优秀的教程](https://www.appcoda.com/git-source-control-in-xcode/)。

简单来说，下面这些就是你需要做的：

1. 在 Github 上创建一个名为 `FantasticView` 的仓库。

2. 复制仓库的 URL。

3. 打开终端，跳转到你的工程目录下。

4. 初始化 Git：`git init`

5. 将所有已修改文件添加到 Git 暂存区中：`git add .`

6. 提交这些已修改文件：`git commit -m "init"`

7. 添加一个远程库 ：`git remote add origin <paste your URL here>`

8. 推送到远程分支：`git push -u origin master`

现在你**必须**为你的仓库创建一个 release。一个 release 对应产品的一个新版本。你可以在 Github 的操作面板上尝试创建。首先进入你的仓库。

1. 点击 `releases` 按钮。

![](https://www.appcoda.com/wp-content/uploads/2016/09/github-cocoapods-1.png)

2. 点击 `Create a new release`

![](https://www.appcoda.com/wp-content/uploads/2016/09/github-cocoapods-2.png)

3. 将版本号设置为 `0.1.0`，然后输入标题和描述。

![](https://www.appcoda.com/wp-content/uploads/2016/09/github-cocoapods-3.png)

4. 点击 `Publish release`，然后你看所看到的应该与下图相似：
![](https://www.appcoda.com/wp-content/uploads/2016/09/github-cocoapods-4.png)

以上是关于 Github 的内容，让我们开始创建 Pod 本身吧！

## 创建 Pod

首先，我们需要确保已经安装 CocoaPods，并做好在终端使用它的准备。动手吧，打开终端，运行以下命令：

    sudo gem install cocoapods --pre

现在 CocoaPods 已经安装完成，下一步轮到创建 Pod 了。

### 创建 Podspec

所有 Pods 都拥有一个 podspec 文件。podspec，顾名思义，用于定义 Pod 规范！让我们动手创建一个：

1. 打开终端，进入项目根目录。

2. 运行 `touch FantasticView.podspec` 命令以创建文件。

3. 使用编辑器打开文件。

4. 将以下代码粘贴到 Podspec 文件中：

    pod
    Pod::Spec.new do |s|
      s.name             = 'FantasticView'
      s.version          = '0.1.0'
      s.summary          = 'By far the most fantastic view I have seen in my entire life. No joke.'
     
      s.description      = <<-DESC
    This fantastic view changes its color gradually makes your app look fantastic!
                           DESC
     
      s.homepage         = 'https://github.com/<YOUR GITHUB USERNAME>/FantasticView'
      s.license          = { :type => 'MIT', :file => 'LICENSE' }
      s.author           = { '<YOUR NAME HERE>' => '<YOUR EMAIL HERE>' }
      s.source           = { :git => 'https://github.com/<YOUR GITHUB USERNAME>/FantasticView.git', :tag => s.version.to_s }
     
      s.ios.deployment_target = '10.0'
      s.source_files = 'FantasticView/FantasticView.swift'
     
    end

`s` 后面的这些变量都是 CocoaPods 需要的，提供像是名字，版本，概要，描述，仓库，源代码文件等必要信息。

下面介绍几个需要注意的重要变量：

1.	`s.name` – 显而易见，他人使用时可以通过该名字将 Pod 添加到项目中。
	
2.	`s.version` – 这是你 Pod 的版本。务必注意，它得和 Github release 的版本号相同。如果两者不匹配，就会报错。
3.	`s.summary` 和 `s.description` – 这两个变量最终会显示在 Cocoapods 页面上。请确保 `description` 比 `summary` 更长，否则将会报错。
4.	`s.homepage` – 这是 Pod 源代码的 URL。注意将 `YOUR GITHUB USERNAME` 替换为你的用户名哟。
	
5.	`s.author` – 开发者信息，注意替换相应内容。
6.	`s.source_files` – 这是最重要的参数。它会告诉 CocoaPods 应该克隆哪些文件。我想要我的 `FantasticView.swift` 被克隆，它的目录是 `FantasticView/FantasticView.swift`。另外，有很多方法可以添加多个文件作为源代码文件。让我们来看一个例子：

    ├── FantasticView.xcodeproj
    └── FantasticView
        ├── ViewController.swift
        ├── Info.plist
        ├── FantasticView.swift
        └── FantasticerView.swift

在这个例子中，我希望包含所有 `.swift` 文件。为达到目的，我会将 `source_files` 变量设置为下面这样：

    'FantasticView/*.swift'

星号 `*` 表示包含**任意**文件。当星号位于文件类型前时，表明包括所有该类型的文件。
假设你想要在 Pod 下载时包含**所有**位于 `/FantasticView` 下的文件，只需要将文件名字和类型用星号代替即可：

    'FantasticView/*'

这样就涵盖了**所有**，甚至是其他目录。为了限制文件类型，你也可以使用如下语句：

    'FantasticView/*.{swift,plist}'

在这个例子中，将会涵盖所有的 `swift` 和 `plist` 文件。

### 用 Lint 验证项目

CocoaPods 需要验证项目有没有错误，这包含对错误甚至可疑代码的限制和要求。也就是说在发布项目之前 CocoaPods 要求你 **lint** 你的项目。

lint 一个项目十分简单，但是绝对是难以置信的麻烦！为了 lint 你的项目，请在项目目录下执行以下命令：

    pod lib lint

你*可能*会得到下述警告：

    -> FantasticView (0.1.0)
        - WARN  | description: The description is shorter than the summary.
        - WARN  | url: There was a problem validating the URL https://github.com/<YOUR GITHUB USERNAME>/FantasticView.

警告说的很直接。在这个例子中，你应该增加描述内容的长度，并提交一个合法的源代码 URL。一旦发生错误，甚至仅仅只是只是一个警告，CocoaPods 的 lint 就会失败。

再来让我们看看你*可能*会遭遇的错误：

    -> FantasticView (0.1.0)
        - ERROR | [iOS] xcodebuild: Returned an unsuccessful exit code. You can use --verbose for more information.
        - ERROR | [iOS] xcodebuild:  /Users/sahandedrisian/Desktop/FantasticView/FantasticView/FantasticView.swift:13:32: error: type 'UIColor' has no member 'red'
        - ERROR | [iOS] xcodebuild:  /Users/sahandedrisian/Desktop/FantasticView/FantasticView/FantasticView.swift:20:37: error: use of unresolved identifier 'Timer'

当真的遇到错误的时候，不要着急，尝试通读错误提示并分析为什么发生这个错误。在本例中，你会注意到下述信息：

    type UIColor has no member red.

但是为什么不能识别 `UIColor`，事实上存在一个名为 `red` 的成员呀？

一个合理的猜想是，在 Swift 3.0 中 `UIColor.redColor()` 已经变为了 `UIColor.red`。由此可以推测 CocoaPods，或者具体说是 xcodebuild 编译项目使用的是 swift 2.2 或 2.3。第二个错误也验证了我们的猜想，因为 `NSTimer` 已经转换为了 `Timer`。

那么究竟可以如何修复这个问题呢？CocoaPods 为此发布了一个修正版。在 lint 时你被要求必须指定 Swift 版本。为了这么做，你必须得创建一个名为 `.swift-version` 的新文件，并添加编译器版本。只需简单地输出以下命令：

    echo "3.0" >> .swift-version

现在再次运行 `pod lib lint`，你应该能够得到一条通过验证的消息：

    -> FantasticView (0.1.0)
     
    FantasticView passed validation.

Woohoo！你通过了整个流程中最富挑战的一部分。

>
注意：如果出现含义不明的错误或警告消息，请尝试键入此命令，pod lib lint -verbose，相比常规的 pod lint 命令，你将得到更详细的信息。

## 发布你的 Pod

噢，是时候将你的 Fantastic View 发布到 CocoaPods 了。每个开发者都应该拥有一个 CocoaPods 账户，以备发布之时用。

现在的你应该会觉得，CocoaPods 账号就是一个 CocoaPods 账号啊，然而并不是，它是一个 Trunk 账号。我并不是在评判 CocoaPods，但我觉得这是一个十分奇怪的决定，着实让我困惑了一段时间。我这么说了之后，你会不会想读一下他们所写的关于[为什么做 Trunk](https://blog.cocoapods.org/CocoaPods-Trunk/#trunk) 的博文。

### 创建 Trunk 账号

确切地说，Trunk 并不是一个账号；是一个会话。所以从根本上来说并不需要密码的存在，需要的仅仅是一个邮箱。

创建流程非常简单：

    pod trunk register <Your Email>

你应该很快就会受到一封来自 CocoaPods 的邮件以验证你发起的“会话”。点击邮件提供的链接，完成你的账号验证。之后 CocoaPods 将会给你发来友好的欢迎信息：好棒，设置完成！

### 推送你的 Pod

到这一步，就只剩下用 Trunk 将你的 podspec 推送到 CocoaPods 了：

    pod trunk push FantasticView.podspec

由于我已经抢先一步使用了 `FantasticView` 这个超级酷炫的名字，它就不再可用了。你应该在 podspec 文件中修改 `s.name`，同时不要忘记修改你的 podspec 文件的名字。

完成修改之后，像前一节所演示的一样 lint 你的 podspec，然后再一次推送你的 trunk。若成功推送了你的 Pod，应该会得到以下信息：

    Updating spec repo `master`
    Validating podspec
     -> FantasticView (0.1.0)
     
    Updating spec repo `master`
      - Data URL: https://raw.githubusercontent.com/CocoaPods/Specs/06dcdf13dd11b8c2eb4fd522b25a652fa654b180/Specs/FantasticView/0.1.0/FantasticView.podspec.json
      - Log messages:
        - September 24th, 11:08: Push for 'FantasticView 0.1.0' initiated.
        - September 24th, 11:08: Push for 'FantasticView 0.1.0' has been pushed (0.500379641 s).

恭喜！回顾所做的一切，并非那么难，对吧？现在可以将 Pod ‘FantasticView’ 添加到你的 podfile 了。

## 总结

事实上，有几种不同的方式来推送你的 Pod。你也可以使用 CocoaPods 模版来创建 Pod 工程，其中包含示例项目，readme，license 等等。不过我认为这稍有些复杂了，因为它包含了一些不必要的步骤，繁琐，还容易让人困惑。

在本教程中，我创建了一个工程，添加了一个 podspec，解释了 podspec 文件的不同选项，创建了一个 trunk 账号并推送了 Pod。如果遇到了问题，你可以在 CocoaPods 的 Github 仓库提交一个 issue。那是一个非常友好的社区，很酷，他们总是会在最短时间内给出答复。

诚挚地希望你喜欢这篇教程！你可以在[这里](https://github.com/SahandTheGreat/FantasticView)下载完整项目作为参考。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。