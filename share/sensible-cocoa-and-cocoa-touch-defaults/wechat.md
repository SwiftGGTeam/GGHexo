合理的 Cocoa 和 Cocoa Touch 默认值"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2016/04/12/sensible-cocoa-and-cocoa-touch-defaults)，原文日期：2016-04-12
> 译者：赵磊；校对：[Channe](http://www.jianshu.com/users/7a07113a6597/latest_articles)；定稿：[Cee](https://github.com/Cee)
  









许多 Cocoa 和 Cocoa Touch 的函数调用都是很死板的。几乎每个调用都采用普遍的参数值。为什么不利用 Swift 默认方法来代替？我们可以对这种函数进行简化：

    
    dismissViewControllerAnimated(flag: true, completion: nil)

可以这么调用：

    
    dismiss()



### 默认值

[SE-0005](https://github.com/apple/swift-evolution/blob/master/proposals/0005-objective-c-name-translation.md) 中介绍了一系列 ObjC API 通过自动翻译获取默认值的方法。在这一提议下，任何符合某种模式的方法都可以提供默认值。

Daniel Steinberg 和我都喜欢这种默认行为，我们还通过 Swift 演化列表来看是否能多增加 Cocoa 和 Cocoa Touch API 的默认值。David Abrahams 回复说最好是将具体请求放在一起，并通过[苹果雷达系统](https://developer.apple.com/bug-reporting/)将它们提交给 UIKit/AppKit 团队，他们也许能提供传递默认值的扩展。

以下是我们列出的一个更新的初步列表。我们希望大家加入进来帮助扩展这一列表，这样当我们向苹果提交 bug 时一定是深思熟虑过的，并且这种变化能被优先考虑。

我提了一个[纲要](https://gist.github.com/erica/3987ec54b8f4a580ae5fc18f4e9e7ca5)，你如果有兴趣做些贡献的话可以通过评论、twitter 或者邮件联系我们。

### Controls

我们认为 `UIControl` 的状态应该默认为 `.Normal`。比较一下这两种调用：`button.setTitle("Hello")` 和 `button.setTitle("Hello", forState: .Normal)`。因为这些仅仅是默认值，你随时可以通过补全具体的参数来重写控件状态（比如改为高亮）。

控制型元素的动作同时是很好预测的。`Button` 通常由 `.TouchUpInside` 触发，`slider` 和 `switch` 则是`.ValueChanged`。通过提供默认值，只有开发者打算使用非标准模版方法时再补全，这样可以极大简化代码量。

### Core Graphics

我们想将所有 CG 构造器都初始化为 `0.0`，即对 `x`、`y`、`dX`、`dY`、`width` 和 `height` 这些属性。这个没有什么限制，你既可以明确所有参数，也可以基于某些默认值，比如仅用 `CGRect(.width: 200, .height: 100)` 就能初始化一个矩形。

### Views

我们打算将大部分 `UIKit` 函数中的 `animated` 初始化为 `true`。不是说 `super.viewWillAppear()` —— 它应该继续传入传递给你的动画参数。我们是说代替类似 `dismissViewControllerAnimated` 的函数，大多数的 `UIKit`（也可能是 `Cocoa`）场景都使用动画效果。在此处添加一个默认值能够以一种容易理解的“常用实践”方法简化调用。

### Auto Layout

`NSLayoutConstraint` 有个想当大的历史包袱。不过几乎每个人都同意将 `multiplier` 默认设置为 1.0，将 `constant` 默认设置为0.0。

然而，我最初的建议会让 —— 默认关系（`relatedBy:`，`.Equal`）、第二项内容（`toItem:`，`nil`）、第二项属性（`attribute:`，`.NotAnAttribute`）出现默认值隐藏参数，引发可读性降低的问题。尤其是通常情况下，总是多个视图相对彼此进行布局，而非单一的视图属性（`NSLayoutConstraint(item: view, attribute: .Width, constant: 400.0)`），对这种默认模式的第二部分我们还没达成统一意见。

### 其他常用模式

苹果的 [UIKit Framework Reference](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIKit_Framework/) 进一步概述了 `UIKit` 类、扩展、函数、常数和数据类型。我确定 `Cocoa` 和该参考库中一定有相对应的东西。如果你想做些补充的话，可以帮我们找这样的例子：开发者常用的 API，有很明显的默认值，但不得不在每一次调用时都补全，并且这些 API 还没有被收录到[SE-0005](http://ericasadun.com/2016/04/11/auto-defaulting-objc-arguments/)。

如果你找到这样的例子，联系我们任何一个人，我们将把你的反馈更新到列表中。我们的目标是努力扩展这一列表，并在严格审核后提交给苹果。

提前感谢！
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。