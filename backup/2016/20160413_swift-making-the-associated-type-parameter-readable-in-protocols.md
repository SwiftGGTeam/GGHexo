title: "Swift：使协议中的关联类型参数可读"
date: 2016-04-13 09:00:00
tags: [Swift 入门]
categories: [Natasha The Robot]
permalink: swift-making-the-associated-type-parameter-readable-in-protocols
keywords: swift协议编程,swift关联类型
custom_title: 
description: 本文主要是讲解在 Swift 里面让协议中的关联类型参数可读，感兴趣的网友来看下吧。

---
原文链接=https://www.natashatherobot.com/swift-making-the-associated-type-parameter-readable-in-protocols/
作者=Natasha
原文日期=2016-04-09
译者=Crystal Sun
校对=小锅
定稿=shanks

<!--此处开始正文-->

我还在习惯 Swift 中的关联类型(Associated Type)，尽管它们已经出现好一阵子了，我最初是从[这篇文章 @alexisgallagher](https://www.youtube.com/watch?v=XWoNjiSPqI8)里开始[理解它们](https://www.natashatherobot.com/swift-protocols-with-associated-types/)的。 

我很开心昨天能在 iOS 开发中用它们解决 iOS 开发中的一个常见问题：[在 Swift 中对使用 Storyboard 和 Segue 的 View Controller 进行依赖注入](https://www.natashatherobot.com/update-view-controller-data-injection-with-storyboards-and-segues-in-swift/)。

<!-- more -->

昨天我更新了博客，但是我的协议一开始看起来是这样的：

```swift
protocol Injectable {
	
	associatedType T
	func inject(thing: T)
	func assertDependencies()
}
```

注意 **thing** 这个参数！因为每个 View Controller 都会被注入一些特别具体的东西 —— 有可能是基于文本的、基于数值的、基于数组的，或者其他任何类型！我不知道如何更好地对参数命名。所以 **thing** 看起来是最合适的参数名字了。

实现看起来是这样子的： 

```swift
func inject(thing: T) {
	textDependency = thing
}
``` 

我实在不喜欢 **thing** 这个名字 —— 完全没有可读性。所以今天早上，我想到了一个疯狂的解决方案，不用 thing 了，结果这方法竟然走得通！

```swift
protocol Injectable {
	associatedType T
	
	// 用 _ 替换掉 thing
	func inject(_: T)
	
}
```

替换掉 **thing**，我在协议里把参数名字留空（即改成 `_`）！
很明显，现在实现此协议时，我可以把参数命名成任何名字了。

```swift
class MyStringDependencyViewController: UIViewController, Injectable {
    
    private var textDependency: String!
    
    // 在这个地方，thing 是 text
    func inject(text: String) {
        textDependency = text
    }
}

class MyIntDependencyViewController: UIViewController, Injectable {
    
    private var numberDependency: Int!
    
    // 在这个地方，thing 是 number
    func inject(number: Int) {
        numberDependency = number
    }
}
```

现在，实现过程非常清晰，随着使用关联类型的次数增多，我越来越喜欢它了。