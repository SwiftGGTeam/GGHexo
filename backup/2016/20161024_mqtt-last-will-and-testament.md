title: "MQTT 的遗愿消息"
date: 2016-10-24
tags: [Swift 跨平台]
categories: [iAchieved.it]
permalink: mqtt-last-will-and-testament
keywords: 
custom_title: 
description: 

---
原文链接=http://dev.iachieved.it/iachievedit/mqtt-last-will-and-testament/
作者=Joe
原文日期=2016-07-04
译者=粉红星云
校对=shanks
定稿=CMB

<!--此处开始正文-->

> 原文图片链接全部失效，因此本文图片无法显示。

![](http://dev.iachieved.it/iachievedit/wp-content/uploads/2016/07/mqtt-e1467656045427.png)

这里是在 `Linux` 上使用 `Swift` 来编写[MQTT](https://en.wikipedia.org/wiki/MQTT)客户端系列的一篇文章。

在这篇文章里，我们将着眼在 `MQTT` 的[遗愿消息](http://www.hivemq.com/blog/mqtt-essentials-part-9-last-will-and-testament)。一般是连接着代理程序的客户端预定义好 `LWT`（Last Will and Testament）的。如果客户端异常地断开连接，代理程序(the broker)将会广播 `LWT` 消息到所有订阅者的客户端中。

<!--more-->

比如说，你正在搭建一个聊天应用，每个客户端与代理程序连接着并且订阅了`/chat/hottub`，被发布到`/chat/hottub`的消息被所有的订阅者接收。加入一个“聊天室”是一简单有效的方法（比如：`MQTT` 主题）。

在正常情况下，一个客户端主动退出的时候，我们一般会期待看见这样的消息：“Joe 离开了`/chat/hottub`”。这个实现起来很简单，在用户用户离开的时候，发布一个`/exit`的消息然后关闭客户端。但如果一个客户端非正常地中断连接（如网络异常、客户端闪退等等），谁来给代理程序发遗愿消息呢。

下面展示如何给 `MQTT` 客户端设置遗言：

```swift
class Client:MQTT, MQTTDelegate {
  init(clientId:String) {
    super.init(clientId:clientId)
    super.willMessage =  MQTTWill(topic:"/chat/hottub",
                                  message:"{\"client\":\"\(clientId)\",\"message\":\"Abnormal Disconnect\"}")
    super.delegate = self
  }
  ...
}
```

`willMessage` 是 `MQTT` 的一个 `MQTTWill` 类型的成员属性。 `MQTTWill` 由标题和消息构成。在我们这个例子中标题可以是我们的聊天频道`/chat/hottub`，消息则是由我们客户端 ID 和一个简单的异常连接中断的字符串组成的 JSON 字符串。

## 获取代码

我们搭建程序用的 `Swift 3.0` 是来自苹果最新的代码仓库的，并且有持续更新我们程序的代码。需要先按照我们的[apt-get仓库](http://dev.iachieved.it/iachievedit/introducing-swift-3-0/)安装 `Swift 3.0`。

我们 `MQTT` 聊天室的例子在[GitHub](https://github.com/iachievedit/MQTTHotTub)上。

```swift
# git clone https://github.com/iachievedit/MQTTHotTub
# cd MQTTHotTub
# swift build
```

出于测试的目的，需要运行 `MQTTHotTub` 两回，所以需要打开两个终端。

![](http://dev.iachieved.it/iachievedit/wp-content/uploads/2016/07/1__clear_____build_debug_MQTTHotTub__ssh__and_9__clear_____build_debug_MQTTHotTub__ssh_-1.png)

用这个命令运行客户端 `.build/debug/MQTTHotTub`。

## Prisencolinensinainciusol

我们的客户端 `MQTTHotTub` 模拟了一个[语无伦次](https://www.youtube.com/watch?v=Kj5TL1l9QYQ&t=1m37s)聊天对话。发布的每条消息都是以 `JSON` 格式的传递的。

```swift
{"client":"octxktfo", "message":"Gyxswhz nsoxfnj gz."}
{"client":"ajyhyjic", "message":"Cmr w bzwubzv mwfhtklz."}
```

当一个客户端接收到一条不是自己发布的消息，会有过滤消息的过程：

```swift
if cid != clientId {
  SLogInfo("Received \"\(msg)\" from \(cid)")
}
```

如果我们监听发送给一个特定主题的消息，并且我们也向那个主题发送消息。就像回声一样，客户端将也会接受到自己发布的消息。这就是用 `cid != clientId` 来过滤的目的了。

可以观察到每个客户端控制台打印记录，看看他们从别的客户端接收到的消息：

```
Received "Wlfu zrqyj tady obxnjl lupihobi nph oapplt nyidmja." from octxktfo
Received "Cmr w bzwubzv mwfhtklz." from ajyhyjic
```

现在， `CTRL-C` 其中一个客户端，注意到剩下的其他客户端接收到的消息：

```
Received "Abnormal Disconnect" from octxktfo
```

![连接异常中断](http://dev.iachieved.it/iachievedit/wp-content/uploads/2016/07/abnormalDisconnect.png)

以上就是 `MQTT` 的遗愿消息的实操啦。中断连接的客户端没有机会去广播自己要退出，所以代理程序代替它发布了客户端的死前遗言到对话/聊天室:

```swift
{"client":"\(clientId)","message":"Abnormal Disconnect"}
```

## 必须要有死前遗言吗

必须这个词太严肃了，这个问题的答案是 “不”，你的 `MQTT` 客户端不需要提供一个遗愿消息。如果你想要提供的话，这里有很多的[其他案例](http://stackoverflow.com/questions/17270863/mqtt-what-is-the-purpose-or-usage-of-last-will-testament/17385293#17385293)可以指导你。

## 接下来的计划

我们继续地很努力地研究在 `Linux` 上使用 `Swift` 来实现[MQTT](http://stackoverflow.com/questions/17270863/mqtt-what-is-the-purpose-or-usage-of-last-will-testament/17385293#17385293)。在这篇文章后，我们的将专注于实现 `MQTT` 的安全连接（`MQTT SSL`）上。