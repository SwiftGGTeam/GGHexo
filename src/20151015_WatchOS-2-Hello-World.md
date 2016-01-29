title: "WatchOS 2: Hello, World"
date: 2015-10-15 09:00:00
tags: [Natasha The Robot]
categories: [WatchOS 2,Swift 入门]
permalink: watchos-2-hello-world

---
原文链接=http://natashatherobot.com/watchos-2-hello-world/
作者=Natasha The Robot
原文日期=2015-09-21
译者=小袋子
校对=小锅
定稿=numbbbbb
发布时间=2015-10-15T09:00:00

<!--此处开始正文-->


欢迎学习我的`WatchOS 2`系列教程。我会从最简单的部分开始带你学习`WatchOS 2`。一个 "Hello,World" app，没错，这个程序虽然非常简单，还是有一些要注意的地方。

<!--more-->

首先，创建一个新的`Single View Application`。我将假设你已经知道如何创建一个基本的`Xcode`项目。现在进入有趣的部分：

1. 在 `Xcode` 中, 打开 `File -> New -> Target`

![](/img/articles/watchos-2-hello-world/Screen_Shot_2015-09-21_at_7_23_42_AM.png1444874958.106001)

2. 选择`watchOS -> Application`。注意在`iOS`菜单下面有一个`Apple Watch`选项。不要选择这个选项！因为我曾经做过 `WatchKit apps`，所以系统自动选择了这个错误的选项 :( 。
 
![](/img/articles/watchos-2-hello-world/ItsAWatchWorld_xcodeproj.png1444874960.646429)

3. 选择`WatchKit App` 然后点击`Next`。注意**你的 Watch App 项目名称不能和 iOS 名称相同** - 因为这会创建两个名字相同的`target`！你可以随时在`Info.plist`中修改`Bundle Display Name`。同时还要注意，不要勾选`Include Complication`选项 :) 。

![](/img/articles/watchos-2-hello-world/Screenshot_9_21_15__7_35_AM.png1444874962.648526)

4. 点击`Finish`。就酱！来看一下你的新 `App` 和 `Extension` 吧。跟 `WatchKit` 一样，这里有一个用于 Watch 的 `target`，并且附带了一个 `Storyboard`，以及用于编写程序逻辑的 `Extension`。

![](/img/articles/watchos-2-hello-world/Menubar_and_ItsAWatchWorld_xcodeproj_and_MyPlayground_6_36_06_PM_playground.png1444874964.5578082)

开心地编程吧！！
