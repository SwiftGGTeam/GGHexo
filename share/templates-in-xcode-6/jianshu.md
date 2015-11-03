Xcode6 中模版的介绍

> 作者：Thomas Hanning，[原文链接](http://www.thomashanning.com/templates-in-xcode-6/)，原文日期：2015-08-27
> 译者：[CMB](https://github.com/chenmingbiao)；校对：[shanks](http://codebuild.me/)；定稿：[小锅](http://www.swiftyper.com/)
  









`Xcode` 为我们提供一整套的项目模板。在这篇文章中，我们将对这些模版进行讨论。



### 主-从视图应用程序(Master-Detail Application)
	
>这种模版提供了主-从视图应用程序的入口。它提供一个由导航控制器控制的用户界面，用于显示一组项目，在 iPad 中，则显示为分割视图（split view）。

> -Apple

这是一个对学习分割视图控制器(`split view controllers`)和列表视图控制器(`table view controllers`)基础知识很有帮助的模版。如果你只在 `iPhone` 设备中使用，该模版中的分割视图控制器将不起作用，只能使用导航控制器来导航的主-从视图控制器。这种视图对于新手开发者来说这是一个好的开始。

![icon](http://swift.gg/img/articles/templates-in-xcode-6/Bildschirmfoto-2015-08-25-um-18.28.35.png1444784411.7165086)

### Page Based 应用程序
    
> 这种模板提供了一个 page-based 应用程序的入口，该模版使用一个页面视图控制器（`page base viewcontroller`）
    
> -Apple

这个模版有点特别，它会创建一个有12个页面的页面视图控制器。同样的，这种模板对于学习基本的 iOS 开发也是很有帮助的。

![icon](http://swift.gg/img/articles/templates-in-xcode-6/Bildschirmfoto-2015-08-25-um-18.40.16.png1444784413.1235225)

### 单视图应用程序（Single View Application）

这是最基础的模版。
    
> 这个模版提供了使用单视图应用的入口，并且提供了一个视图控制器去管理视图和包含这个视图的 storyboard 或 nib。
    
> -Apple

它不仅仅是只用在单视图应用程序，而且还是复杂应用程序最好的解决方案。如果你想一切尽在你的掌握中，这种模板是最好的选择。 很多应用程序都会选择这种模版。

# Tabbed 应用程序
	
> 这种模版提供选项卡(tab bar)应用程序的入口。它提供了用户界面，用来配置选项卡控制器和对应项的视图控制器。

这是非常基础的模版，它会创建一个含有两个视图控制器的选项卡(`tab bar`)控制器。

![icon](http://swift.gg/img/articles/templates-in-xcode-6/Bildschirmfoto-2015-08-25-um-18.42.57.png1444784413.9353302)

# Game
    
> 这种模版提供了游戏开发的入口。
    
> -Apple

这是一个非常复杂的模版。你可以选择 `SceneKit`, `SpriteKit`, `Open GL ES` 或 `Metal` 的模版。如果你想了解游戏开发，这种模版可以让你有一个好的开始。

![icon](http://swift.gg/img/articles/templates-in-xcode-6/Bildschirmfoto-2015-08-25-um-18.45.48.png1444784414.774583)

# 总结

模版是学习关于 iOS 开发基础知识最好的一种方式。然而对于实际的项目你应该更多的使用 “单视图应用程序(`Single View Application`)” 模版，因为使用这种模版最容易搭建你的项目架构。