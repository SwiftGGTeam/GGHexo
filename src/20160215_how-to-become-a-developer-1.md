title: "如何成为一名入门级 iOS 开发者"
date: 2016-02-15
tags: [alloc-init]
categories: [Swift 入门]
permalink: how-to-become-a-developer-1
keywords:ios开发
custom_title:
description:想成为一名iOS开发者吗，要么首先要如何入门呢，下面就来说下怎么入门iOS开发吧。

---
原文链接=http://www.alloc-init.com/2016/01/how-to-become-a-developer-1/
作者=Weston Hanners
原文日期=2016-01-26
译者=ray16897188
校对=&nbsp
定稿=小锅

最近我一直在帮我的几个朋友开始学习 iOS 开发，然后被问到一个开始学习需要的清单。听起来很适合为此写一篇博客。闲话少说，我给你列出来要成为一名入门级的 iOS 开发者必须掌握的知识清单（不分先后顺序）。
<!--more-->

### 基本的 CS 知识
我不觉得投身开发移动应用必须得有一个计算机科学的博士学位，我认为这应该归为“加分项”那一栏，但是对数据结构和算法有一定基本的了解肯定会防止开发新手们写代码把自己写到死胡同里去。所以对新手来说，我推荐你们去看[Youtube上的哈佛CS50课程](https://www.youtube.com/playlist?list=PLhQjrBD2T383Xfn0zECHrOTpfOSlptPAB)，把它看做是你入门的开始，这些课程浅显易懂，还十分有意思。

### Swift 还是 Objective-C
还是那个观点，你无需到达能够写这两种语言的技术性博客的水平，或者是到能够教课的程度，但是你还是至少得能用这两种中其一来编程，不用过于频繁的查看语法。API是另外一码事儿，尤其是在 iOS 中，框架每年更新，很多方法也经常被弃用。对我来说大多数工作时间开一个 Safari 页面去看 Apple 的文档并不是偶然的事情。尝试着记着所有的太让人厌烦了。要让你自己达到在没有帮助的情况下可以写类、结构体、循环、函数（类和实例）、分配变量、表达式求值的水平。

目前我们正处于一个比较奇怪的时段，这个时候招只会 Objective-C 的人还是能被接受的。Swift 还是很新，除非你进的公司里有频繁的项目更替，否则你就得基本上用 Objective-C。也就是说，有很多的公司正决定转向 Swift（我的公司就是），如果你就会 Swift 的话，找一个工作也不会特别难。重要的是要对你所选择的那个语言足够熟练，然后至少对另外一个也要熟悉到能读懂代码的程度。

### 框架和 API

还是和我之前说过的道理类似，我不认为你必须能对所有的 iOS API 倒背如流，但是你需要清晰的知道到哪里找起。

- UIKit (UITableView, UIButton, UINavigationController, GestureRecognizers)
- Interface Builder (Storyboards, Segues, and the odd .xib)
- Foundation 类型 (NSArray, NSDictionary, NSString) 以及它们的 Swift 对应 (Array, Dictionary 和 String)HTTP API (NSURLSession, 基本的 REST API 概念, 用 NSJSONSerializatio n 做 JSON 解析)
- Grand Central Dispatch (GCD, NSOperationQueue)
- 数据持久化 (NSCoding, NSUserDefaults, CoreData)
- 内存管理 (什么是循环引用，以及 ARC 的基本原理)

### 开发中的设计模式

模式很重要，它让你的开发变得容易、代码变得清晰。要确保你了解基本的设计模式，这些模式在 iOS 的框架中被广泛使用，你在不知道它们的情况下不大可能做出来很多东西（还有很多其他模式，但是你可以随做随学）。

- 代理模式（大多数iOS API的主要模式，你**必须**理解掌握它）
- 模型-视图-控制器模式（MVC，我并不觉得 Apple 在鼓励使用最佳 MVC 分离上做的很好，但是它也是个很重要的设计模式，如果你花时间将其合理实现的话它能帮你改进你的代码。还有，可以十分肯定的是：关于 MVC 的问题肯定会出现在任何一个 iOS 工作的面试题里。）
- 继承（几乎所有用户界面的代码都会是某个类的子类。）
- 单例模式（绝对会被滥用的模式...保守点儿用吧。）

### 熟悉开发环境

这似乎是显而易见的，但如果你还没有一台 Mac 的话，弄一台！如果你没有任何一个 iOS 设备，弄一个！如果你没有使用过或者不熟悉设备的话，为它做开发会很难。类似的是，如果你没 Mac 写代码的话也很难。我是在2009年从一台 MacBook 13'' 和第一代 iPod Touch 开始的 。用低配置的设备也是能凑合的。当时是接近$1500的投资，但是长远来看绝对值得的。

## UX/UI
通常来说 UX（用户体验）和 UI（交互界面）是由设计师负责的，但是你也应该了解[ Apple 的人机交互指南](https://developer.apple.com/library/ios/documentation/UserExperience/Conceptual/MobileHIG/)。你应该要了解 mockups（译者注：原型设计工具）和 wireframes（译者注：线上原型设计工具）的区别，以及在开发的过程中如何使用它们。

### 工具

你应该熟悉一些常见的开发工具。

- Xcode（废话）
- Git 版本控制（一些公司可能会用 Subversion 或者 Mercurial，但是 git 把你领进门应该是足够的。）
- JIRA 或者 Bugzilla（基本就是 JIRA，你也是不需要成为使用它的专家，但是你应该至少把它玩个大概，第一次看见它界面的时候别怕）
- CocoaPods（这是管理依赖性和第三方代码的工具，我还没听过哪个公司不用它）

### 见解
对 iOS，Swift 或甚至对某个 API 有你自己的见解能特别有效的让面试官知道你对某个知识点的了解到底有多深。这还会让我们能看到你的热情。如果你参加一个面试被问到“你觉得 Swift 如何？”，回答“我觉得，还行吧”可不是正确的答案，你可以告诉他们你对 optionals 的看法，你有多喜欢某个 feature。这里不会有太多错误的答案，重要的是你得有东西可说。

### 作品集
事实胜于雄辩。如果你想在面试中表现优异的话，可以把一些简单 app 合在一起（或者更好的是把它们发布在 AppStore 上）。展示出你能够独立完成一个项目的能力。我怎么推荐这点都不嫌多。GitHub 也很好，但是如果你选择这条路，面试官想测试一下你的代码的话，要尽可能让它能够轻松通过编译。

我写了篇文章介绍怎样做一个应用程序，可以点击[这里](http://www.alloc-init.com/2016/01/how-to-start-an-ios-app-portfolio/)看看。

### 结论

如果你还需要更多的入门资源，请查看我的[iOS Developer Resources](http://www.alloc-init.com/programming-resources/)页面，里面我附了我开始做开发的时候觉得有用的博客和网页。

我想我要说的最后一件事就是JUST DO IT！现阶段对 iOS 开发者的需求量还是很大的，如果你想达到一个不错的技术水准，努力工作一点时间是必不可少的。这是一份有回报性的工作，能够锻炼你的工程技能和创造力。

<iframe height=498 width=510 src="http://player.youku.com/embed/XMTM0NjQ3MjkwOA==" frameborder=0 allowfullscreen></iframe>

**我漏掉了什么了吗？请在[Twitter (@WestonHanners)](https://twitter.com/westonhanners)上告诉我。我想把这篇文章做成新手开启他们事业所需的百科全书**

另外说一下我所在的公司现在招所有技术水平的 iOS 开发者，如果你感兴趣的话点击下面的链接。

[Y Media Labs Careers](http://www.ymedialabs.com/careers/)

告诉他们你是从我这里知道他们的。

* 2016-01-26 更新：添加内存管理，UI/UX，MVC。添加工具小节。
* 2016-01-27 更新：布局调整。