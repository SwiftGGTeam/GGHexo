title: "(Swift之路) 从这里开始"
date: 2017-04-21
tags: [Swift 入门]
categories: [Swift and Painless]
permalink: what-to-learn-first
keywords: 
custom_title: 
description: 

---
原文链接=http://swiftandpainless.com/what-to-learn-first/
作者=Dominik Hauser
原文日期=2016-04-19
译者=Darren
校对=Crystal Sun
定稿=CMB

<!--此处开始正文-->

昨天有人问我， Swift 初学者应该先学什么。 问题是这样的：
> 我有个问题想咨询一下你,  是应该花时间学习 TDD (测试驱动开发) , 还是应该学习 Swift 和函数式编程，哪样更值得学习?

当然，我的观点会有一些偏见，因为我写了一本[关于 Swift TDD 的书](http://swiftandpainless.com/book/)。在看我的回答时，切记这一点。

<!--more-->

##### 建议＃1：阅读苹果官方的 [Swift Book](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/)。
在我看来，应该先学习Swift。这是一切的基础。如果你连 Swift 函数能实现什么都不懂，何来函数式编程的概念？此外，Swift 还是编写 iOS 和 OS X 应用主要的语言。这意味着大多数时候你需要和面向对象的 API 进行交互（至少在写代码的时候需要）。所以你也需要理解面向对象的 Swift, 以便在写 Swift 时充分利用 Swift 的潜力。
就算你不相信我，Chris Eidhof，Florian Kugler和Wouter Swierstra在[《Functional Swift》](https://www.objc.io/books/functional-swift/)中也这样说过：
> “你应该能很顺利地阅读 Swift 程序，并熟悉常见的编程概念，例如类、方法和变量。如果你只是一名初学者，这本书可能不太适合你。”

##### 建议＃2：阅读大量博客文章。 有很多伟大的Swift 博客。
苹果的官方文档非常好。但是，如果想了解社区中有创造力的想法，需要阅读很多博客。

##### 建议＃3：学习并为你的代码编写测试。
在我看来，测试至关重要。每个开发者都需要测试他们的代码。一套好的测试用例会带来很多好处。[Michael Feathers](https://twitter.com/mfeathers) 在 [《Working Effectively with Legacy Code》](http://www.goodreads.com/book/show/44919.Working_Effectively_with_Legacy_Code?from_search=true) 一书中这样写道：
> 对我来说，旧代码就是未经测试的代码。

对我来说，测试驱动开发对测试来说是一个比较好的开端，因为要测试什么是次要的。你（某种意义上说）为（几乎）一切编写测试。TDD 的一个规则是，只在测试失败时编写代码。

##### 建议＃4：学习函数式编程。
Swift 还有函数式的一面。你不需要使用它们，但是如果你正好（或者愿意）积极参与社区，可能会很快沉迷于函数式编程的魔法之中。在我看来，学习函数式编程会让你成为一个更好的开发者。函数式的代码一开始看起来就像魔法一样。（只要你能通过测试验证，）它就能工作。

以上是我的观点。我相信许多开发者有不同的意见。去吧，问问别人怎么看。

以及，请购买我的书。  ;)