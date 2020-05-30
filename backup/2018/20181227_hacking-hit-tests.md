title: "Hacking Hit Tests"
date: 2018-12-27
tags: [iOS开发]
categories: [KHANLOU]
permalink: hacking-hit-tests
keywords: hit test，uikit
custom_title: 
description: 

---
原文链接=http://khanlou.com/2018/09/hacking-hit-tests/
作者=Soroush Khanlou
原文日期=2018-09-07
译者=Nemocdz
校对=Yousanflics,pmst
定稿=Forelax

<!--此处开始正文-->

回想 [Crusty 教我们使用面向协议编程](https://developer.apple.com/videos/play/wwdc2015/408/)之前的日子，我们大多使用继承来共享代码的实现。通常在 UIKit 编程中，你可能会用 `UIView` 的子类去添加一些子视图，重写 `-layoutSubviews`，然后重复这些工作。也许你还会重写 `-drawRect`。但当你需要做一些特别的事情时，就需要看看 `UIView` 中其他可以被重写的方法。

<!--more-->

`UIKit` 有个十分古怪的地方，那是它的触摸事件处理系统。它主要包括两个方法，`-pointInside:withEvent:` 和 `-hitTest:withEvent:`。

`-pointInside:` 会告诉调用者给定点是否包含在指定的视图区域中。而 `-hitTest:` 用 `pointInside:` 这个方法来告诉调用者哪个子视图（如果有的话）是当前触摸在给定点的接收者。现在我比较感兴趣的是后面这个方法。

苹果的文档勉强能够让你理解怎么重新实现这个方法。在你学会怎么重新实现方法之前，你都不能改变它的功能。接下来让我们看一遍 [文档](https://developer.apple.com/documentation/uikit/uiview/1622469-hittest?language=objc)，并尝试重写这个函数。

```swift
override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
	// ...
}
```

首先，让我们从文档的第二段开始吧：

> 这个方法会忽略那些隐藏的视图，禁用用户交互视图和 alpha 等级小于 0.01 的视图。

让我们通过一些 `gurad` 语句来快速预处理这些前提条件。

```:bride_with_veil:
override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {

	guard isUserInteractionEnabled else { return nil }
	
	guard !isHidden else { return nil }
	
	guard alpha >= 0.01 else { return nil }
			
	// ...
```

相当简单吧。那接下来是？

> 这个方法调用 `pointInside:withEvent:` 方法来遍历接收视图层级中每一个子视图，来决定哪个子视图来接收该触摸事件。

逐字阅读文档后，感觉 `-pointInside:` 会在每一个子视图里被调用（用一个 for 循环），但这并不是完全正确的。

感谢这个 [读者](https://twitter.com/an0/status/1038254836016394240)。通过他在 `-hitTest:` 和 `-pointInside:` 中放置了断点的试验，我们知道 `-pointInside:` 会在 `self` 中调用（在有上面那些 guard 的情况下），而不是在每一个子视图中。 所以应该添加另外的 guard 语句，像下面这行代码一样：

```swift
guard self.point(inside: point, with: event) else { return nil }
```

`-pointInside:` 是 `UIView` 另一个需要重写的方法。它的默认实现会检查传入的某个点是否包含在视图的 `bounds` 中。如果调用 `-pointInside` 返回 true，那么意味着触摸事件发生在它的 bounds 中。

理解完这个小小的差别后，我们可以继续阅读文档了：

> 如果 `-pointInside:withEvnet:` 返回 YES，那么子视图的层级也会进行类似的遍历直到找到包含指定点的最前面的视图。

所以，从这里知道我们需要遍历视图树。这意味着循环遍历所有的视图，并调用 `-hitTest:` 在它们每一个上去找到合适的子视图。在这种情况下，这个方法是递归的。

为了遍历视图层级，我们需要一个循环。然而，这个方法其中一个更反人类的是需要反向遍历视图。子视图数组中尾部的视图反而会处在 Z 轴中*更高*的位置，所以它们应该被最先检验。（如果没有这篇 [文章](http://smnh.me/hit-testing-in-ios/)，我可记不起这个点。）

```swift
// ...
for subview in subviews.reversed() {

}
// ...
```

传入的坐标点会转换到*当前*视图的坐标系中，而非我们关心子视图中。幸运的是，UIKit 给了一个处理函数，去转换坐标点的参考系到其他任何的视图的 frame 的参考系中。

```swift
// ...
for subview in subviews.reversed() {
	let convertedPoint = subview.convert(point, from: self)
	// ...
}
// ...
```

一旦有了转换后的坐标点，我们就可以很简单地询问每一个子视图该点的目标视图。需要注意的是，如果点处于该视图外部（也就是说，`-pointInside:` 返回 *false*），`-hitTest` 会返回 nil。这时就应该检查层级里的下一个子视图。

```swift
// ...
let convertedPoint = subview.convert(point, from: self)
if let candidate = subview.hitTest(convertedPoint, with: event) {
	return candidate
}
//...
```

一旦我们有了合适的循环语句，最后一件需要做的事是 `return self`。如果视图是可被点击（被我们的 `guard` 语句断言过的情况），但却没有子视图想要处理这个触摸的话，意味着当前视图，也就是 `self`，是这个触摸正确的目标。

这是完整的算法：

```swift
override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
	
	guard isUserInteractionEnabled else { return nil }
	
	guard !isHidden else { return nil }
	
	guard alpha >= 0.01 else { return nil }
	
	guard self.point(inside: point, with: event) else { return nil }	
	
	for subview in subviews.reversed() {
		let convertedPoint = subview.convert(point, from: self)
		if let candidate = subview.hitTest(convertedPoint, with: event) {
			return candidate
		}
	}
	return self
}
```

现在我们有了一个参考的实现，可以开始修改它来实现具体的行为。

在之前的这篇播客[《Changing the size of a paging scroll view》](http://khanlou.com/2013/04/changing-the-size-of-a-paging-scroll-view/)中，我就已经讨论过其中一种行为。我谈到一种“落后并该被废弃”的方法来产生这种效果。本质上，你必须：

1. 关掉 `clipsToBounds`
2. 在滑动区域中放一个非隐藏视图
3. 在非隐藏视图上重写 `-hitTest:` 来传递所有触摸到 scrollview 中

`-hitTest:` 方法是这种技术的基石。因为在 UIKit 中，hitTest 方法会代理给每一个视图去实现，决定触摸事件传递给哪个视图接收。这可以让你去重写默认的实现（期望和普通的实现）并替换它为你想做的，甚至返回一个不是原始视图的子视图。多么疯狂。

让我们看一下另一个例子。如果你已经用过 [Beacon](http://beacon.party/) 今年的版本，你会注意到滑动删除事件行为的物理效果感觉上和其他用原生系统实现的效果有点不一样。这是因为用系统的途径不能完全获得我们想要的表现，所以需要自己重新实现这个功能。

如你所想，重写滑动和反弹物理效果不需要那么复杂，所以我们用一个 `UIScrollView` 和将 `pagingEnabled` 设为 true 来获得尽可能自由的反弹力。用和[这篇旧博客](http://khanlou.com/2013/04/changing-the-size-of-a-paging-scroll-view/)里说的类似的技术，将滑动的视图的 `bounds` 设置得更小一些并将 `panGestureRecognizer` 移到事件的 cell 顶层的一个覆盖视图中，来设置一个自定义页面大小。

然而，当覆盖视图正确的传递触摸事件到 scroll view 时，那里会有覆盖视图不能正确拦截的其他事件。cell 包含着按钮，像 “join event” 按钮和 “delete event” 按钮，都需要接收触摸。有几种自定义实现在 `-hitTest:` 中可以处理这种情况，其中一种实现就是直接检查这两个按钮的子视图：

```swift
override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {

	guard isUserInteractionEnabled else { return nil }
	
	guard !isHidden else { return nil }
	
	guard alpha >= 0.01 else { return nil }

	guard self.point(inside: point, with: event) else { return nil }

	if joinButton.point(inside: convert(point, to: joinButton), with: event) {
		return joinButton
	}
	
	if isDeleteButtonOpen && deleteButton.point(inside: convert(point, to: deleteButton), with: event) {
		return deleteButton
	}
	return super.hitTest(point, with: event)
}
```

这种方法会正确地传递正确的点击事件到正确的的按钮中，而且不用打断显示删除按钮的滑动表现。（你可以尝试只忽略 `deletionOverlay`，不过它不会正确的传递滑动事件。）

`-hitTest:` 是视图中一个很少重写的地方，但是在需要时，可以提供其他工具很难做到的行为。理解如何自己实现有助于随意替换它。你可以用这个技术去扩大点击的目标区域，去除触摸处理中的某些子视图，而不用把它们从可见的层级中去掉，又或是用一个视图作为另一个将响应触摸的视图的兜底。所有东西都是可能的。
