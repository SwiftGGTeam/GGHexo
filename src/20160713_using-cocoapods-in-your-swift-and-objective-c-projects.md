title: "在 Swift 和 Objective-C 项目中使用 Cocoapods"
date: 2016-07-13 10:00:00
tags: [Swift]
categories: [AppCoda]
permalink: using-cocoapods-in-your-swift-and-objective-c-projects
keywords: cocoapods swift,cocoapods oc
custom_title: 
description: 怎么用 Cocoapods 管理 Swift 和 OC 呢，本文就来说下 Swift Cocoapods OC 的用法。

---
原文链接=http://www.appcoda.com/cocoapods/
作者=Gregg Mojica
原文日期=2016/06/24
译者=saitjr
校对=Cee
定稿=千叶知风

<!--此处开始正文-->

CocoaPods——Swift 与 Objective-C 项目的依赖管理工具，iOS 开发者的必备技能。如果你没有任何 CocoaPods 经历，那么这篇短文就是为你而写。我们将会学到什么是 CocoaPods，为什么我们要使用它，还有怎样开始使用它！

AppCoda 的绝大多数教程写得都很详细，本文要比其他传统教程短，仅作为 CocoaPods 的入门文章。

<!--more-->

### 什么是 CocoaPods

CocoaPods 是 Swift 与 Objective-C 项目的依赖管理工具。如果你曾使用过 Node.js、Ruby on Rails、Python 等，那么你可能对依赖管理工具并不陌生。如果没有了解过，那也没关系！依赖管理工具是用来帮助开发者管理库或包的工具。诸如 CocoaPods 这类依赖管理工具能帮你管理所有库，而不需要一点一点的手动导入。

设想有这样一个场景：*你正在开发的 app 需要依赖如 Firebase 这样的第三方库*。

与此同时，Firebase 又依赖着很多其他第三方库。为了能使用它，你不得不导入 Firebase 和它所依赖的库。手动去导入无疑是一个单调乏味的过程。

这时，CocoaPods 就有用武之地了。它会自动导入需要的库，并添加该库所必须的依赖。下一秒，你就能明白 CocoaPods 有多强大了。

### 在 Mac 上配置 CocoaPods

CocoaPods 的配置简单而直观，一路打怪升级。首先在终端中输入以下命令来安装 CocoaPods：

```bash
# 译者注：在此之前，天朝的朋友们最好先移除原有的 source：

gem sources --remove https://rubygems.org/

# 换成淘宝的：

gem sources -a https://ruby.taobao.org

#Hail GFW !
```

```bash
sudo gem install cocoapods
```

这句命令会在系统中安装 CocoaPods。CocoaPods 用的是 Ruby 编写，所以它要依赖 OS X 系统自带 Ruby 环境。如果你熟悉 Ruby，其实 Ruby 中的 gems 和 CocoaPods 中的 pods 很像。

这可能会提示你输入密码，输入完按 Enter 就好。注意，密码不会在终端中显示。

![](http://www.appcoda.com/wp-content/uploads/2016/06/cocoapods-install-1240x701.png)

这一步会花点时间。耐心点，去喝杯咖啡，等着这一步完成吧。

### 在 Xcode 项目中使用 CocoaPods

装好 CocoaPods 以后，来看看怎么用吧。我们会创建一个简单的工程，然后示范如何用 CocoaPods 安装 Firebase 库。

首先，创建一个名为 `CocoapodsTest` 的工程。创建好后，关闭工程，回到终端。使用 `cd` 命令（修改目录）进入到刚创建的工程中。假设工程保存在桌面上，那命令应该是这样的：

```bash
cd ~/Desktop/CocoapodsTest
```

接下来，我们需要创建一个叫 Podfile 的文件。Podfile 是存在于项目根目录下的一个文件，它负责监控所有你想要安装的 pods 的动向。如果你想要安装或更新 pods，CocoaPods 就会检查一遍 Podfile。

仅需一行代码，就能创建 Podfile：

```bash
pod init
```

CocoaPods 生成 Podfile 像这样：

```ruby
# Uncomment this line to define a global platform for your project
# platform :ios, '9.0'
 
target 'CocoapodsTest' do
  # Comment this line if you're not using Swift and don't want to use dynamic frameworks
  use_frameworks!
 
  # Pods for CocoapodsTest
 
end
```

这是 Podfile 最基本的结构。你需要做的，就是在里面添加你需要依赖的 pods。我将用 Vim 来编辑这个文件。Vim 是 Mac 內建的文本编辑器，开发者能直接用终端来编辑内容。当然，你也可以用其他文本编辑器，如 Atom。

键入下面的命令，在 Vim 中打开 Podfile 文件：

```bash
vim Podfile
```

假设你项目中需要使用 Firebase 库。那么就像下面这样配置：

```ruby
# Uncomment this line to define a global platform for your project
# platform :ios, '9.0'
 
target 'CocoapodsTest' do
  # Comment this line if you're not using Swift and don't want to use dynamic frameworks
  use_frameworks!
 
  # Pods for CocoapodsTest
  pod 'Firebase'
end
```

好了，然后退出 Vim。键入一下内容：

```bash
:wq
```

这命令表示：写入并退出。Vim 会保存文件做出的修改。

在介绍最后一步之前，我们先来了解下 Podfile 中其他配置的含义：

-   Podfile 描述了 Xcode 项目某个 Target 所需的依赖。因此，我们需要指定 Target，在这个 demo 中，是 `CocoapodsTest`。
-   `use_frameworks` 选项是告诉 CocoaPods 使用 framework 而不是静态库。这在 Swift 项目中是必选。
-   我们添加的那行（`pod 'Firebase'`）是让 CocoaPods 知道我们要用 Firebase。或许你会好奇，我们怎么知道某个库的 pod 名称的。一般情况下，你可以查看文档，或者在 [cocoapods.org](cocoapods.org) 搜索。

![](http://www.appcoda.com/wp-content/uploads/2016/06/pod-cocoapods-org.jpg)

现在你应该对 Podfile 有更深入的了解了吧。键入下面命令，来完成整个流程吧：

```bash
pod install
```

CocoaPods 现在会安装 Firebase 了！在 Firebase 下载完成后，它会创建一个名为 `CocoapodsTest.xcworkspace` 的文件。这个 workspace 目录包含了原始 Xcode 工程、Firebase 库与它所需要的依赖。

![](http://www.appcoda.com/wp-content/uploads/2016/06/pod-install.jpg)

从现在起，工程入口变成了 `CocoapodsTest.xcworkspace`，而不是 `CocoapodsTest.xcodeproj`。

### 打开 Xcode Workspace

如果你通过 `CocoapodsTest.xcworkspace` 打开工程，你会看到名为 `CocoapodsTest` 和 `Pod` 的两个项目，其中 `Pod` 中包含了 `Firebase` 库。

![](http://www.appcoda.com/wp-content/uploads/2016/06/pod-xcode-workspace-1240x722.png)

现在，唯一需要做的，就是引用 Firebase 了。在 Xcode 中找到 `ViewController.swift` 文件，然后在最上面引入：

```swift
import Firebase
```

瞧瞧！你已经成功用上了 CocoaPods。

### 最后

CocoaPods 这么棒的工具值得每个 iOS 开发者珍藏。希望这篇教程能帮到你，如果有想法或疑问，欢迎评论。

>   另外，Apple 正准备发布 [Swift 包管理器](https://swift.org/package-manager/)（Swift Package Manager），它和 CocoaPods 非常像，而且它直接内置在了 Swift 环境中，自动进行依赖管理。Swift 包管理器将在这个版本中发布。等官方发布后，我们再来讨论讨论。[敬请关注](https://www.facebook.com/appcodamobile)。

（译者注：翻译组其他文章推荐： 《[在团队开发中使用 CocoaPods 的小技巧](http://swift.gg/2015/12/31/cocoapods-on-a-team/)》）