初学者应该先学什么：TDD、Swift 还是函数式？"

> 作者：Dominik Hauser，[原文链接](http://swiftandpainless.com/what-to-learn-first/)，原文日期：2015/04/19
> 译者：[小锅](http://www.swiftyper.com)；校对：[Channe](http://www.jianshu.com/users/7a07113a6597/latest_articles)；定稿：[numbbbbb](http://numbbbbb.com/)
  









昨天我收到一个问题，作为一个 Swift 初学者应该先学什么。下面是原问题：

> 我有一些疑惑，TDD（测试驱动开发）是否值得花时间学习，或者我应该把时间花在学习 Swift 以及函数式编程上？

当然，我的观点会有所倾向，因为我写过[一本关于 TDD 的书](http://swiftandpainless.com/book/)。所以，当你阅读我的答案的时候，要记住这一点。



## 建议 1：阅读苹果的 [Swift 官方文档](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/)

我的建议是应该先学习 Swift 语法。这是所有一切的基础。如果你不明白 Swift 中的函数有什么功能，那么你也无法理解 Swift 的函数式编程。并且，Swift 目前的主要作用还是为 iOS、macOS 编写应用程序。这意味着，你的大部分时间还是会花在与面向对象 API 的交互上（至少在写本篇文章的时候还是如此 ;)）。所以你必须先理解面向对象的 Swift，这样才能最大化挖掘 Swift 的潜力。

如果你对我说的这一点还有所怀疑的话，下面这段话是 Chris Eidhof、Florian Kugler 和 Wouter Swierstra 在 [《函数式 Swift》](https://store.objccn.io/products/functional-swift) 这本书当中说的：

> “你必须能熟练地阅读 Swift 程序，并且熟悉常见的编程概念，比如类，方法，和变量。如果你才刚开始学习编程，这本书可能不太适合你。”

## 建议 2：阅读大量的博客文章。现在网上有很多的很好的 Swift 博客。

官方文档很好。但是如果你想看到社区内的各种有创意的思想火花，你需要阅读大量的博客文章（校对注：比如多看看 SwiftGG🤔，我们会跟进 Swift 最新动态和最佳实践）。

## 建议 3：开始学习写测试，并且使用学到的知识为你自己的代码写测试

我觉得测试是必不可少的。每个开发者都应该对他们的代码进行测试。一个好的测试工具有非常多的好处。[Michael Feathers](https://twitter.com/mfeathers) 在 [Working Effectively with Legacy Code](http://www.goodreads.com/book/show/44919.Working_Effectively_with_Legacy_Code?from_search=true) 当中写过：

> 对我而言，遗留代码就是那些没有写测试的代码。

我的看法是，测试驱动开发就应该从测试开始，而需要测试什么这个问题是次要的。你要为（几乎）所有的代码写测试。TDD 的一个法则就是只有当测试失败的时候才需要写代码。

## 建议 4：学习函数式编程

Swift 也拥有函数式的特性。你可以不使用它们，但如果你是（或者想成为）社区中积极的一分子，你很快就会碰到函数式魔法。我的看法是，学习函数式编程会让你成为一个更好的开发者。通常情况下，函数式的代码第一眼看上去就像魔法一样，但它就是能完成功能（这可以通过测试来验证）。

这就是我的建议，肯定有很多开发者跟我持不同的意见，这很正常，同样去问问他们的想法吧。

最后，记得买我的书。 ;)
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。