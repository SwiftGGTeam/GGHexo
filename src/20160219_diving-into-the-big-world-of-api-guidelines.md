title: "探索 API 指南的大世界"
date: 2016-02-19 09:00:00
tags: [Swift 入门]
categories: [Erica Sadun]
permalink: diving-into-the-big-world-of-api-guidelines
keywords: api设计规范,api设计原则,ios开发
custom_title: 
description: 在iOS开发中，对于API的设计是有规范和原则的，而本文就来说下API的设计指南。

---
原文链接=http://ericasadun.com/2016/01/28/diving-into-the-big-world-of-api-guidelines/
作者=Erica Sadun
原文日期=2016-1-28
译者=ahfepj
校对=numbbbbb
定稿=Cee

<!--此处开始正文-->

邮件列表中对 [SE-0023 API 设计指南（SE-0023 API Design Guidelines）](https://github.com/apple/swift-evolution/blob/master/proposals/0023-api-guidelines.md) 有大量讨论。你可以在 [swift.org](https://swift.org/documentation/api-design-guidelines/) 上找到原始的指南，我强烈推荐你阅读一下。这个指南的大部分内容我都很喜欢，不过我认为有些命名和标签规定过于严格。
<!--more-->

文档分为四章：基本原则、命名、惯例和特例。我完全同意**基本原则**这一章内容：要明确、清晰和简洁，注释一切。我已经写了 [Swift 文档标记（Swift Documentation Markup）](https://itunes.apple.com/us/book/swift-documentation-markup/id1049010423?mt=11)一书，这本书尊崇这些原则，另外还告诉你该如何实践。同样的原则适用于第四章：**特例**。

第二章重点介绍**命名**。第一节「提升使用的明确性」是这样说的：增加适量的词来避免歧义，去掉无用的词，给弱类型参数添加角色名词。对于这章我没有任何问题，我对这些原则深有体会。第三节「使用术语」也没什么问题。

然而，介绍命名的第二节不怎么样。我之前批判过这节内容，虽然它「合乎语法」。我认为苹果最好的做法是完全抛弃它，针对于这一部分，我已经写了很长、[很详尽的反馈](https://github.com/erica/SwiftStyle/blob/master/Grammatical.md)，但事情的发展已经不受我的控制。

问题出现在事物的命名上：用名词来命名一个东西，用动词来命名一个动作，这样做合适吗？说实话，在现有的指南中这或许是最好的办法，可以避免一些。

或许你应该思考方法是否改变了实例，或许你应该将所有的副作用考虑进来，将他们和纯函数区分开来。但是我们还没讨论「属性-vs-方法」这种命名形式（更不用说命名本身可能导致的复杂性）。

我真心认为苹果应该丢掉这一章，就像丢掉烫手的山芋那样，而不是强迫大家按照它来工作，否则他们就会（像现在这样）陷入麻烦。

我对**惯例**这一章也有一些看法，特别是关于参数标签的问题。同样，我在 GitHub 上写了一些[强有力的](https://github.com/erica/SwiftStyle/blob/master/ArgumentLabels.md)反馈，在反馈中我举了一个例子，说明为什么逻辑相关参数应该比「省略第一个参数」的规则权重更高，同时说明了为什么一组互相关联的函数调用应该用构造器式命名来强调它们的联系。

关于这类问题，我写了大量笔记，都快变成一本书了。不过，我确实计划自出版一本书来介绍 Swift 范式。几个月前我就已经开始了这项工作，只是碰巧看到了 SE-0023，现在我要继续去写书了。

下面是我写的一些文章：

- [几个 Swift 代码规范](http://ericasadun.com/2015/11/17/a-handful-of-swift-style-rules-swiftlang/)

- [从 If 转向 Guard](http://ericasadun.com/2015/12/29/migrating-ifs-to-guards-in-swift/)

- [关于 Guard 的另一种观点](http://ericasadun.com/2016/01/01/another-take-on-guard/)

- [清晰和可选映射](http://ericasadun.com/2015/12/27/clarity-and-optional-mapping-looking-for-opinions/)

- [告别局部套用](http://ericasadun.com/2015/12/18/bidding-farewell-to-currying/)（看文章结尾重构后的风格）

- [Swift 括号](http://ericasadun.com/2016/01/28/diving-into-the-big-world-of-api-guidelines/)

- [帮我重构](http://ericasadun.com/2015/12/18/dear-erica-help-me-refactor/)

- [更新 Linter](http://ericasadun.com/2015/12/17/updated-linter/)（只是一些规则，不是 lint 工具）

- [请给我一些反馈](http://ericasadun.com/2015/12/11/styling-feedback-needed-tell-me-what-you-think-of-this-code-layout/)

- [封装和缩进](http://ericasadun.com/2015/11/24/wrapping-and-indentation-opinions/)

- [和后缀递减说再见](http://ericasadun.com/2015/12/13/bidding-fairwell-to-postfix-decrement/)（与 [Swift 2.2 霸主](http://ericasadun.com/2016/01/26/welcoming-our-new-swift-2-2-overlords/) 一文略有重叠）

- [不只是 _](http://ericasadun.com/2015/12/04/marking-symbols-does-swift-need-more-than-_unpublished/)

- [符号](http://ericasadun.com/2016/01/13/a-few-thoughts-on-swift-symbologygist/)

- [让它更具 Swift 风格](http://ericasadun.com/2016/01/11/make-this-swift-er-coordinate-distances/)

- [接下来是 .None](http://ericasadun.com/2016/01/04/and-then-there-was-none-when-to-nil-and-when-to-not/)

等等。