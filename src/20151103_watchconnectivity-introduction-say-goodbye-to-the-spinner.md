title: "WatchConnectivity 介绍：告别加载等待"
date: 2015-11-03 09:00:00
tags: [Natasha The Robot]
categories: [Swift 入门, WatchOS 2]
permalink: watchconnectivity-introduction-say-goodbye-to-the-spinner

---
原文链接=http://natashatherobot.com/watchconnectivity-introduction-say-goodbye-to-the-spinner/
作者=Natasha The Robot
原文日期=2015-09-21
译者=小袋子
校对=numbbbbb
定稿=numbbbbb

在 WatchOS 2 上最有价值的新特性就是`WatchConnectivity`，虽然用户可能看不到，但是这个特性能让你的 WatchOS 应用更加好用。

<!--more-->

`WatchConnectivity`是 WatchOS 2 框架中用于 Watch 应用和 iOS 设备传输数据的。`WatchConnectivity` 关键的部分是，它使你的应用程序在用户**查看之前**就拿到必要的数据。这意味着用户想要看你的应用时，他们希望马上看到想要的数据，而不是愚蠢的加载等待。

毕竟， Apple Watch 是一个移动中使用的设备。用户们可能想要看一两眼在 iOS 应用上超级可爱的刷新动画，但显然他们不会忍受在手表上看到这样的动画。设想一下，如果用户每次在他们常规的手表上查看时间，引入眼帘的是一个加载等待界面，那将会非常愚蠢，同理，你的应用如果这么做也一样愚蠢。

现在你不必再担心了，`WatchConnectivity`完全可以解决这个难题，它可以毫无压力地传输你应用上的数据到 Watch 应用上。整个过程都是无缝透明的，以至于你的用户都察觉不到发生了什么。

让我们开始深入吧！`WatchConnectivity`有两个部分-后台传输（`background transfers`）和交互式消息（`interactive messaging`）。我将会在未来的教程里探究它的每一个部分的更多细节，但是这里只是一个概述，思考传输时应该使用哪一种传输模型：

## 后台传输

在你的 iOS 或者 Watch 应用不需要马上获得信息时使用后台传输。当然，在你的用户抬起他们的手腕时查看应用里面的最新数据时，它会显示数据，但是此前他们不需要任何数据。

因为后台传输用于传输不是立刻使用数据， Apple 认为使用后台传输的最佳时机是当你需要根据电池容量、网络连接、使用模式传输数据时。

在你的 iOS 和 Watch 应用之间的后台传输数据有三种方式：

### 应用上下文

当你的 Watch 应用只需要展示最新的信息时，使用应用上下文。例如，当你的`Glance`显示比分时，用户不会在意两分钟以前的 4-2 比分，他们只在乎现在的比分是 4-4 。另一个例子是交通运输应用，你不需要关心五分钟以前最后的一辆公交车在公交站的左边，他们只关心下一辆公交车什么时候到。

所以应用上下文的工作方式是把数据块排成队列，并且如果在传输之前有一个新的可用数据块，原始的数据将会被新数据取代，然后再传输这个数据，除非它又被其它更新的数据块代替。

[Tutorial: Sharing The Latest Data via Application Context](http://natashatherobot.com/watchconnectivity-application-context/) 

### 用户信息

用户信息是用于当你需要确认你的所有数据是被传输过的（不像应用上下文）。用户信息的数据是在一个先进先出（`FIFO (first-in-first-out)`） 队列中顺序传输，所以没有东西被覆盖。

一个例子是你可能想要在一个文本消息的应用中使用它-对于一个完整的会话和上下文环境来说，最后一条信息和第一条信息是同等重要的。如果用户更新了他们简介信息中的一小部分，Watch 简介中也应该同步这些更新。

### 文件传输

顾名思义，在你的 iOS 和 Watch 应用之间使用文件传输去传输文件，例如图片或者`plists`。文件传输一个很棒的特性是你可以包含一个`meta-data`字典，其中包含你的文件名和数据，比如说这样你就可以排序你的图片。

## 交互式消息

使用交互式消息能够实时地在你的 iOS 和 Watch 应用之间传输数据！一个绝佳的示例就是愤怒的小鸟应用的 Watch 版本和 iPhone 版本-用户点击 Watch，但是小鸟在手机上飞。按钮点击通过交互式消息被传输到手机上了。

![这里写图片描述](http://natashatherobot.com/wp-content/uploads/flappybirdwatch.gif)

一个需要注意的地方是，交互式消息需要 iPhone 开启`"reachable"`状态。Apple 文档解释道：

> Watch 应用的可达性需要配对的 iOS 设备在重启之后至少解锁一次。

## 总结

我爱死[Kristina Thai’s WatchConnectivity post](http://www.kristinathai.com/watchos-2-how-to-communicate-between-devices-using-watch-connectivity/) 里面区别传输的图解了：

![这里写图片描述](http://natashatherobot.com/wp-content/uploads/Screen-Shot-2015-09-21-at-8.17.29-AM.png)

同时，本文参考了 Curtis Herbert 的文章 [Getting Data to Your WatchOS 2 App](http://blog.curtisherbert.com/data-synchronization-with-watchos/) 中最后的 Watch OS 2 observations 部分。
