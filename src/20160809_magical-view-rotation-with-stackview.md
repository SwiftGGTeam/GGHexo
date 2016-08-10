title: "使用 StackView 实现魔术般的视图旋转适配"
date: 2016-08-09
tags: [iOS 开发]
categories: [Natasha The Robot]
permalink: magical-view-rotation-with-stackview
keywords: stackView ios
custom_title: 
description: 使用 StackView 可以让图片实现自动切换横竖屏来展示图片，本文就来说下具体的实现过程。

---
原文链接=https://www.natashatherobot.com/magical-view-rotation-with-stackview/
作者=Natasha
原文日期=2016-07-24
译者=粉红星云
校对=aaaron7
定稿=CMB

<!--此处开始正文-->

上周,我参加了 [iOSDevCampDC](http://iosdevcampdc.com/) 并发表了演讲，在这里很荣幸的听到了 [@atomicbird](https://twitter.com/atomicbird) 关于 StackViews 的演讲。我之前写过一篇文章,向大家介绍了[使用 StackViews 来做简易动画的有多方便](https://www.natashatherobot.com/button-animation-stackview/)，更被使用 StackViews 能够非常简单地完成横竖屏的切换所震惊。

例如，下面这个简单的有着一张图片和一些文本的视图。它在竖屏下看起来挺好的，但是一旦屏幕旋转了，就不那么好看了...

<!--more-->

<iframe height=498 width=510 src="https://www.natashatherobot.com/wp-content/uploads/StackViewRotationBad.mp4?_=1" allowfullscreen></iframe>

可是呢,仅仅改为在Storyboard中使用一个简单的` StackView `(不需要写额外的代码)，你就可以拥有一个好用的旋转适配效果了。

<iframe height=498 width=510 src="https://www.natashatherobot.com/wp-content/uploads/StackViewRotationDemo.mp4?_=2" allowfullscreen></iframe>


### 步骤

第一个步骤是一个垂直排列的 StackView，里面放一个 `ImageView` 和一个 `TextView`：

![](https://www.natashatherobot.com/wp-content/uploads/Main_storyboard_%E2%80%94_Edited_and_Glass-768x399.png)

### 奇诡一招

这里的关键就是当屏幕方向从竖屏变为横屏的时候，我们需要同时把 `StackViews` 从垂直切换为水平。

为了实际看看这个过程，我推荐在 Storyboard 中改变到水平方向模式(超爱 Xcode8 的这个表单)。

![](https://www.natashatherobot.com/wp-content/uploads/Main_storyboard_%E2%80%94_Edited-768x686.png)

注意到 Xcode 8 的 Storyboard 中告诉你在水平方向上高度被压缩了这点十分便利。因为这点爱死 Xcode 8 了。

这招就是在高度为紧凑 (Compact) 的时候把 `StackView` 设为水平方向的。要做到这个，选中 StackView，然后来到属性视图。你会发现在 `StackView` 轴向属性下面的一个小小的+ -- 点击它!

![](https://www.natashatherobot.com/wp-content/uploads/Main_storyboard_%E2%80%94_Edited-1-300x201.png)

现在选择 Any Width -> Compact Height -> Any Gamut:

![](https://www.natashatherobot.com/wp-content/uploads/Screen-Shot-2016-07-24-at-12.36.47-PM-768x236.png)

这里的关键当然是紧凑高度。现在你可以在紧凑高度模式下 (Compact Height mode) 改变 `StackView` 的布局到水平方向了！

![](https://www.natashatherobot.com/wp-content/uploads/Main_storyboard_%E2%80%94_Edited-2-300x231.png)

这样就完成了！你可以立刻看到在 Storyboard 中改变方向的后的效果，甚至都不用运行这个应用。

![](https://www.natashatherobot.com/wp-content/uploads/Main_storyboard_%E2%80%94_Edited-3-768x315.png)

有一个值得注意的是，在 Storyboard 中有一个 bug -- 在你改变屏幕方向的时候，可能会出现一个关于你的布局的警告。要解决这个警告,只要在变化前后的 `StackView` 的AutoLayout属性中，改变 hugging 或 compression 的优先级(哪个都行)就好。¯\_(ツ)_/¯

### 结论

我没有在为屏幕旋转方向适配布局这方面研究太多，所以这个技巧绝对是一个值得记住的好东西。手动的为不同的压缩尺寸改变 AutoLayout 属性听起来就不让人开心，特别是产品经理叫你多加“就一个小小的东西啦”进去的时候...再次感谢 [@atomicbird](https://twitter.com/atomicbird) 和我们分享这个小但是超有用的小技巧。