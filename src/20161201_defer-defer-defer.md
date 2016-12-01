title: "Defer; defer; defer"
date: 2016-12-01
tags: [Swift]
categories: [Erica Sadun]
permalink: defer-defer-defer
keywords: swift defer,swift defer after
custom_title: Swift defer 作用
description: defer 译为延缓、推迟之意，那么 defer 这个语法声明具体要怎么去用它呢，本文就来俗易懂的来举个例子吧。

---
原文链接=http://ericasadun.com/2016/11/14/defer-defer-defer/
作者=Erica Sadun
原文日期=2016-11-14
译者=Cyan
校对=小铁匠Linus
定稿=CMB

<!--此处开始正文-->

有人问到关于 defer 的用法，以及 defer 语句被添加到栈里面的顺序。这可以很简单的创建一个类似于[这样](https://swiftlang.ng.bluemix.net/#/repl/5824ab08fc088d265a7e02a7)的测试集，然后你就可以自己观察他们的行为。

<!--more-->

接下来，通过通俗易懂的方式说明了如何在某些场景使用 defer ：

**设置和清理工作成对出现的时候**。比如说，当你在为 iOS 10 预览版开发的时候，可能需要开始和结束 image contexts。当然， defer 也很适合 alloc/dealloc, fopen/fclose 等操作。

```swift
UIGraphicsBeginImageContext(size); defer { UIGraphicsEndImageContext() }
```

**前置或者后置增量操作的时候**。通过 defer 操作可以让变量在发生改变前返回：

```swift
defer { x = x - 1 }; return x // x--
```

**应用“下个状态”更新**。在 sequence 语句里面使用 defer，像下面这个例子一样，循环遍历一个色环：

```swift
return sequence(state: hue, next: {
     (state : inout CGFloat) -> Color? in
     defer { state = state + stepAngle }
     ...
     return value }
```

**优化分组布局的代码**。这个例子是将一组图片画在同一条直线上。实际绘制的代码做了很多繁琐的工作。将 `defer` 语句置于 `forEach` 顶部有助于追踪“下一步”，而无需搜寻整个实际布局的代码。

```swift
allImages.forEach { image in
    defer { px += image.size.width + spaceOffset }
    image.draw(at: CGPoint(x: px, y: py))
}
```

很方便，不是吗？