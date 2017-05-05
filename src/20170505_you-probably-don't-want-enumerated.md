title: "你需要的大概不是 enumerated"
date: 2017-05-05
tags: [Swift 进阶]
categories: [KHANLOU]
permalink: you-probably-don't-want-enumerated
keywords:
custom_title:
description:

---
原文链接=http://khanlou.com/2017/03/you-probably-don't-want-enumerated/
作者=KHANLOU
原文日期=2017-03-28
译者=四娘
校对=Cwift
定稿=CMB

<!--此处开始正文-->
 
Swift 标准库里最容易被滥用的就是 Sequence 的 `enumerated()` 函数。这个函数会返回一个新的序列，包含了初始序列里的所有元素，以及与元素相对应的编号。

`enumerated()` 很容易被误解。因为它给每一个元素都提供了一个编号，对于很多问题来说这是一个很简便的方案。然而，这些问题大多数都可以被另一种方式更好的解决，让我们来看一下其中的一些例子吧，要注意理解它们有什么问题，然后如何使用更好的抽象去解决它们。

<!--more-->

使用 `enumerated()` 最关键的问题在于大家都认为它返回的是每一个元素和元素的索引值，但实际上并不是这样的。因为它可以适用于所有序列，而序列是不能保证有索引的，由此可知它返回的并不是索引值。下面的代码里，这个变量的名字是 `offset`，而不是 `index`，这是接下来文章里会默认使用的命名方式。offset 总是一个整型，从 0 开始，间隔为 1，跟每一个元素逐一对应。对于 `Array`，这刚好跟它的索引值完全一致，但除此之外的其他所有类型，都不会有这种巧合发生。让我们来看一个例子：

```swift
let array = ["a", "b", "c", "d", "e"]
let arraySlice = array[2..<5]
arraySlice[2] // => "c"
arraySlice.enumerated().first // => (0, "c")
arraySlice[0] // fatalError
```

我们的变量 `arraySlice`，毫无疑问是 `ArraySlice` 类型。然而，它的`startIndex` 很明显是 2，而不是 0，但当我们调用 `enumerated()` 和 `first` 的时候, 它会返回一个元组，包含了一个offset，值为 0，以及它的第一个元素 “c”。


你以为，你会获得与下面等价的代码

```swift
zip(array.indices, array)
```

但实际上你获取到的是这个

```swift
zip((0..<array.count), array)
```

如果你不是在使用 `Array` 的话，随时可能会产生错误的行为。

而且实际上你获取到的是一个 offset，而不是 index，使用 `enumerated()` 也会有别的问题。很多时候你也许想用 `enumerated()`， 但有别的更好的抽象可以使用。让我们来看一些例子。

我见到  `enumerated()` 最常用的方式是对一个数组执行 enumerated，使用返回的 offset 来获取另一个数组对应的元素。

```swift
for (offset, model) in models.enumerated() {
	let viewController = viewControllers[offset]
	viewController.model = model
}
```

虽然这段代码可以正常运作，但前提是 `models` 和 `viewControllers` 都是 Array 类型，使用整型来作为索引值类型，从 0 开始。另一个前提是这两个数组拥有相同的长度。如果`models` 的数组长度比 `viewControllers` 短的话，就会崩溃。我们还多了一个没有实际意义的多余的变量 `offset`。一个简洁的 Swift 实现方式应该是：

```swift
for (model, viewController) in zip(models, viewControllers) {
	viewController.model = model
}
```

这段代码更加简洁，而且适用于所有 `Sequence` 类型，而且可以安全地处理不等长的数组。

让我们看看另一个例子，这段代码给第一个 `imageView` 和它的容器以及每个 `imageView` 之间添加了一段 autolayout 的约束

```swift
for (offset, imageView) in imageViews.enumerated() {
	if offset == 0 {
		imageView.leadingAnchor.constraint(equalTo: containerView.leadingAnchor).isActive = true
	} else {
		let imageToAnchor = imageView[offset - 1]
		imageView.leadingAnchor.constraint(equalTo: imageToAnchor.trailingAnchor).isActive = true
	}
}
```

这段示例代码也有同样的问题，我们想要成对的元素，但使用 `enumerated()` 去获取索引以便后续操作的时候，我们就需要手动去处理索引，这并没有必要。`zip` 在这种情况下也适用。

首先，处理容器和第一个元素的约束：

```swift
imageViews.first?.leadingAnchor.constraint(equalTo: containerView.leadingAnchor).isActive = true
```

接着，我们来把元素拼成一对：

```swift
for (left, right) in zip(imageViews, imageViews.dropFirst()) {
	left.trailingAnchor.constraint(equalTo: right.leadingAnchor).isActive = true
}
```

搞定，没有索引值，任何 Sequence 类型都适用，而且更加简洁。

（你也可以把这个拼对的操作封装进 [extension](https://gist.github.com/khanlou/f27b34f28b21b4834a758913e06a5f3b) 里，我会考虑命名为 `.eachPair()` ）

这里介绍一下 `enumerated()` 的使用姿势。因为你获取到的并非是索引值，而是一个整型，所以当你需要一个数字去对应到每一个元素的时候，就很适合使用 `enumerated()`。例如，你需要在垂直方向等距摆放多个 view，每一个 view 都需要一个 y，等于某个高度乘以 offset，`enumerated()` 就很适合。下面是一个例子：

```swift
for (offset, view) in views.enumerated() {
	view.frame.origin.y = offset * view.frame.height
}
```

因为这里的 offset 是作为一个数字去使用，`enumerated()`就可以正常运作。

使用的规则很简单：如果你是想用 `enumerated()` 去获取索引，那也许会有更好的方式去解决你的问题，如果你是想把它作为一个数字去使用，那就很适合👍。