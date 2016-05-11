title: "Swift 3.0 的自动默认（auto-defaulting）实参"
date: 2016-05-09
tags: [Swift 3.0]
categories: [Erica Sadun]
permalink: auto-defaulting-objc-arguments
keywords: swift3.0教程,swift objc
custom_title: 
description: Swift 3 中允许了导入 APIs 来定义很多实参，所以在 Swift 中调用时，你可以省略一些参数的定义。

---
原文链接=http://ericasadun.com/2016/04/11/auto-defaulting-objc-arguments/
作者=Erica Sadun
原文日期=2016-04-11
译者=CMB
校对=shanks
定稿=千叶知风

<!--此处开始正文-->

我最近发布的文章 [《准备好迎接 3.0 API 变化》](http://swift.gg/2016/05/03/preparing-for-3-0-api-pruning/) 得到了一些很有趣的反馈。最近发布了一些有关 Swift 3 提议的文章，特别是关于 [SE-0005](https://github.com/apple/swift-evolution/blob/master/proposals/0005-objective-c-name-translation.md) , 这些文章中解释了在 Swift 中 ObjC APIs 是如何自动转换的，也说明了这些转换在 Swift 中使用 Cocoa 的影响。

<!--more-->

在即将到来的变化中，自动默认（`auto-defaulting`）可能是我在 `SE-0005` 提议中最喜欢的。可以看到 `SE-0005` 中说明了允许导入 APIs 来定义很多实参，当你在 Swift 中调用时，你可以省略一些参数的定义。

现在如果遇到下列几种情况将会提供自动默认的值：

* 尾随闭包：可空的闭包参数，将默认为 nil

* NSZones：可空的空间，将默认为 nil（提案指出，当 `NSZones` 已经不在 Swift 中使用时，`NSZones` 应该要默认为 nil）

* 选项集(OptionSetType)：任何类型中名字包含 `Options` ，将默认为 []\(空选项集)

* 字典：当字典参数名字包含 `options`, `attributes` 和 `info` 的时候，将默认为[:]\(空字典) 

这个变化规则对单个参数的 setter 没任何作用(`setCompletionHandler: value` 和 `setOptions: value`)。话说回来，这个规则会导致函数调用的变化如下所示：

```
rootViewController.presentViewController(
    alert, 
    animated: true, 
    completion: nil)
UIView.animateWithDuration(
    0.2, delay: 0.0, options: [], 
    animations: { self.logo.alpha = 0.0 }) { 
        _ in self.logo.hidden = true 
}
```

在 Swift 3.0 中将简化为：

```
rootViewController.present(alert, animated: true)
UIView.animateWithDuration(0.2, delay: 0.0, 
    animations: { self.logo.alpha = 0.0 }) {
        _ in self.logo.hidden = true 
}
```

本文介绍的自动默认对完成后的回调, 用户信息字典, 属性字典(例如当要使用 `NSFileManager` 和 `NSAttributedString` 的时候) 和 选项组(像 AVFoundation 的 `AVMusicSequenceLoadOptions`, `AudioComponentInstantiationOptions` 和 `AVMovieWritingOptions`)影响最大。

这样设计的目的是让 Swift 显得更加简洁，也不需要为了达到一次填充而再去自定义函数来代替原本无意义输入的 “opt-out” 值(如 nil, `[]` 和 `[:]`)。[点击这个地址](https://github.com/apple/swift-3-api-guidelines-review/compare/swift-2...swift-3)可以查看一些例子，只要你搜索 “= nil”, “= []” 和 “= [:]” 就可以看到这些 APIs 的变化。