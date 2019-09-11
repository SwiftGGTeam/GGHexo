title: "Xcode 8：如何创建 iMessage 动图"
date: 2016-07-14
tags: [Xcode]
categories: [Natasha The Robot]
permalink: xcode-8-create-an-animated-imessage-sticker
keywords: Xcode8,iMessage,动画
custom_title: 
description: 本文介绍如何使用 Xcode 8 来创建 iMessage 动图。

---
原文链接=https://www.natashatherobot.com/xcode-8-create-an-animated-imessage-sticker/
作者=Natasha The Robot 
原文日期=2016-07-01
译者=haolloyin
校对=Cee
定稿=numbbbbb

<!--此处开始正文-->

这周末我终于有点空余时间来捣鼓一个有趣的业余项目了。我看到好友 [@chiuki](https://twitter.com/chiuki) 做了一个叫做 [Fit Cat](https://play.google.com/store/apps/details?id=com.sqisland.fitcat&hl=en) 的 Android Watch 应用，我也想在我的 Apple Watch 上搞一个，@chiuki 同意了。

Fit Cat 会依据你的步数显示可爱的小猫咪，设计师是很有才的 [@VPoltrack](https://twitter.com/VPoltrack)。你偷懒时小猫就会睡觉，你健身时它就会玩毛线球。它还会唱 K、爬山，真的很可爱。

当我在新项目中打开素材库时，立马来了兴致。为什么不创建一些 Fit Cat 的表情然后分享给朋友呢？

<!--more-->

制作静态表情很容易，但我需要给 Fit Cat 制作不同的动图。我记得在 WWDC 的 [iMessage Apps and Stickers, Part 1](https://developer.apple.com/videos/play/wwdc2016/204/) 中有提到动图表情。演讲比较简单，但在 Xcode 上通过 UI 创建表情很不直观，所以这里我详细记录了动图表情的制作过程，这样你就不用看演讲了。

### 创建表情包

首先创建一个表情包，右键你的素材库文件或者点击底部的 `+` 号，然后选择 `New Sticker Pack`：

![](https://www.natashatherobot.com/wp-content/uploads/Screen_Shot_2016-07-01_at_11_20_15_AM-768x930.png)

### 创建表情序列

这一部分有点不太直观。表情包默认是静态表情。我尝试在 `Attributes Inspector` 中把它改成动图表情，但没有可用的选项。

这里的小技巧是，你必须右击表情包目录，然后选择 `New Sticker Sequence`。但如果你在表情区域内右击，必须先选择 `Add Assets` 再选择 `New Sticker Sequence` （这就是我掉坑的原因）。

![](https://www.natashatherobot.com/wp-content/uploads/Screen-Shot-2016-07-01-at-11.31.21-AM-246x300.png)

### 添加表情

最后一步就是添加表情。我在这一步卡住了，因为只有**第一帧**外面有个轮廓。我不知道如何为表情添加其他几帧。

![](https://www.natashatherobot.com/wp-content/uploads/Screen_Shot_2016-07-01_at_11_37_06_AM-768x610.png)

如果要添加额外的帧，只需要将下一帧图片拖动到第一帧之后即可。喏！这是一个典型的反人类 UI！

最后终于做出来一个击剑猫咪。

![](https://www.natashatherobot.com/wp-content/uploads/Screen-Shot-2016-07-01-at-11.40.35-AM-768x655.png)

我最喜欢的就是点表情的播放按钮（译者注：仔细看上图，猫嘴那里有个播放按钮），看着这只猫在做击剑动作真有意思！

### 自定义动画

这个动画有点太快了，你可以在 `Sticker Sequence` 的 `Attributes Inspector` 进行自定义：

![](https://www.natashatherobot.com/wp-content/uploads/Assets_xcassets-768x496.png)

在 Xcode 上可以实时看到所有改动。

我 ❤ iMessage 表情包！