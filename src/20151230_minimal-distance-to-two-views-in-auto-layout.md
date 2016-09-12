title: "教你如何在 Auto Layout 下设置两个视图之间的最小间距"
date: 2015-12-30
tags: [Swift 入门]
categories: [Swift and Painless]
permalink: minimal-distance-to-two-views-in-auto-layout

---
原文链接=http://swiftandpainless.com/minimal-distance-to-two-views-in-auto-layout/
作者=Dominik Hauser
原文日期=2015-12-08
译者=pmst
校对=星夜暮晨
定稿=Cee

<!--此处开始正文-->

假设现在要在某个视图（view）中放置三个子视图（subviews）。其中两个子视图放置在上方，第三个视图紧挨着它们放到下方。不过上方的两个视图高度不定，并且你不知道哪个更高一些。现在要求我们使用自动布局（Auto Layout）来控制下方视图和上方视图之间间距至少 10 单位像素。

<!--more-->

我们该如何实现呢？实现技巧是使用不等式约束条件 (inequality) 以及设置约束优先级 (priority)。相关约束如下：

```swift
// 注意约束使用不等式 >=，以及设置优先级
leftViewConstraints += NSLayoutConstraint.constraintsWithVisualFormat("V:[red(50)]-(>=10)-[green]", options: [], metrics: nil, views: leftViews)
leftViewConstraints += NSLayoutConstraint.constraintsWithVisualFormat("V:[blue(100)]-(>=10)-[green]", options: [], metrics: nil, views: leftViews)
leftViewConstraints += NSLayoutConstraint.constraintsWithVisualFormat("V:[blue(100)]-(<=10@999)-[green]", options: [], metrics: nil, views: leftViews)
```

上方两个视图与底部视图的最小间距不能小于 10（译者注：这里约束优先级默认是 1000）。此外蓝色视图与底部视图的最大间距不得大于 10 ，其优先级为 999。

就是这样！你可以看到如下方截图所示的结果。左侧图片中，蓝色视图的高度为 100 单位像素，红色视图高度为 50 单位像素。 右侧图片则刚刚相反。


![](/img/articles/minimal-distance-to-two-views-in-auto-layout/Screen-Shot-2015-12-08-at-21.52.25-300x155.png1451437944.9187686)

这里向你提供完整代码的 [playground](http://swift.eltanin.uberspace.de/wp-content/uploads/2015/12/MinimalDistanceAutoLayoutPlayground.playground.zip) 下载。



> 译者注：你可以在下载的 playground 下方键入 view 属性，然后在右侧栏点击 Quick Look，也就是那个眼睛，就能看到如上所示的截图了！






[1]:	http://swift.eltanin.uberspace.de/wp-content/uploads/2015/12/MinimalDistanceAutoLayoutPlayground.playground.zip

[image-1]:	http://swift.eltanin.uberspace.de/wp-content/uploads/2015/12/Screen-Shot-2015-12-08-at-21.52.25-300x155.png