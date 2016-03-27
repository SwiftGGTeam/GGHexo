title: "如何组织 Auto Layout 代码"
date: 2015-09-10 09:30:00
tags: [Swift 入门]
categories: [Swift and Painless]
permalink: where-to-put-the-auto-layout-code

---
原文链接=http://swiftandpainless.com/where-to-put-the-auto-layout-code
作者=Dominik Hauser
原文日期=2015-08-12
译者=SergioChan
校对=shanks
定稿=小锅


Auto Layout是一件很神奇的事情。像一个巫师一样告诉元素应该去什么位置并且让他们守规矩。你并不需要亲自将元素放到那些位置去。感觉像是天地因为你的咒语而将他们移动了。

但是你应该在什么时候念“咒语”呢？换句话说，当你没有使用界面生成器（Interface Builder）的时候，你应当把Auto Layout的代码放在哪呢？

<!--more-->

从 `UIView` 的方法 `updateConstraints` 的文档我们可以看到：

> 设置自定义视图约束需要通过重载这个方法来完成。

因为有这句话，我总是认为苹果是在要求我把布局的代码放到这个方法里。那么问题就来了：这个方法会被 `UIKit` 调用至少两次，重复添加相同的约束就会导致错误。我在网上找到的最佳途径是在视图类中添加一个布尔值的属性，并且在  `updateConstraints()` 去赋值，这样就可以保证你只运行了一次布局的代码。

文档里还写到：

> 当你的自定义视图发现有一个属于它的约束忽然失效了，它会马上移除这个约束，然后调用 `setNeedsUpdateConstraints` 来告知视图它的约束需要被更新。

这就意味着 `updateConstraints()` 应该在视图中的约束因为某些事件而改变的情况下使用。而且这个方法的名字在这个场景下也更加的有意义。

在我的几乎所有的布局中约束都是固定的。当然，有些事情我也需要改变一个约束中的常量。我可以无需移除并重新添加这个约束。（`NSLayoutConstraint` 中的常量是它在被创建之后唯一能被修改的东西了。）

正因为此，我开始将布局代码都放到 `init(frame:)` 里去。但是有了上面文档提到的那些内容。我还是觉得不太适应。

后来在今年的 WWDC 上，有一个苹果的工程师就是建议这么做的。而且就在昨天，我收到了一个关于 `updateConstraints()` 没有被调用的问题的回复 —— 至少我称之为 bug。结果我发现它并不是一个bug。

苹果工程师这么写道：

> 总的来说，如果约束只会被创建一次，它就应该被放在初始化方法中完成，例如 `-init` 或者 `-viewDidLoad` 等等。留着 `updateConstraints` 给那些在程序运行时可能改变的布局。

不错。当我对于代码的感觉被苹果推荐的时候，我挺享受的。

[这里](http://swiftandpainless.com/dont-put-view-code-into-your-view-controller/)有一个示例，里面你能看到我把布局代码放在哪里了。

写布局的同志们加油吧！

对了，如果你喜欢这篇文章，请关注我的 [feed](http://swiftandpainless.com/feed)。

更新：Ole Begemann 在他的博客中写了一篇 [When should you implement updateConstraints](http://oleb.net/blog/2015/08/how-to-use-updateconstraints/)。
