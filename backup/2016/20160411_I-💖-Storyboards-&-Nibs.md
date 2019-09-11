title: "I 💖 Storyboards & Nibs"
date: 2016-04-11
tags: [Swift 入门]
categories: [Natasha The Robot]
permalink: i-heart-storyboards-nibs
keywords: storyboards,nibs
custom_title: 
description: Interface Builder 真的很好用为啥很多人不喜呢，下面来说说我为啥爱 Storyboards 和 Nibs 吧。

---
原文链接=https://www.natashatherobot.com/i-heart-storyboards-nibs/
作者=Natasha
原文日期=2016/03/27
译者=saitjr
校对=小锅
定稿=千叶知风

<!--此处开始正文-->

[@helenvholmes](https://twitter.com/helenvholmes) 在 [@tryswiftconf](https://twitter.com/tryswiftconf) 中谈到了一个我很感兴趣的话题（其实每个话题我都很感兴趣）—— 设计师怎样入门开发。当然从 Storyboard 入手是显而易见的。但这一见解却在开发者之间引起了很大的争议。

事实上，我并没有参与整个争论的过程。Interface Builder 存在一些弊端吗？当然，但是以我的经验来看，利还是远大于弊的。而且这并不止关系到设计师怎样入门，而是所有人应该怎么入门。Interface Builder 可以使我们整个项目代码更易懂。

<!--more-->

在开发者拿到别人的项目时，从 Storyboard 开始梳理每个 ViewController 的关系是相当清晰的。

从这种角度上来说，Storyboard 是工具。和所有工具一样，如果你错误的使用它，那么它会毫无用处，甚至有反作用。所以我总结了几个如何高效使用 Interface Builder 的方式：

## 多个 Storyboard

使用 Storyboard 过程中，最大的问题就是：开发者从 Main.Storyboard 开始写，随之将所有的内容都加到了这个 Storyboard 中！很快，Storyboard 变得很重，界面关系错综复杂。如果项目中加入了其他开发者，那他们什么都不能做，因为任何操作都会在 merge 时，引起冲突。

我认为 Storyboard 就像是代码，所以尽量保持 Storyboard 的整洁。我倾向于程序的每个独立的模块都有对应的 Storyboard。就好比登录注册模块，或者设置模块，这完全可以和程序的其他逻辑独立开，那么就可以单独一个 Storyboard。如果 app 有 TabBar，那么每个 tab 对应的模块都可以创建单独的 Storyboard。

有时候，我的 Storyboard 中可能只有两个界面，但这没关系。因为随着项目的迭代，我可以很容易地往里面添加更多的界面。

通过这样整理 Storyboard，我完全不用担心 merge 时的冲突。在我开发设置模块的时候，其他开发者也可以同时的开发注册模块，因为 Storyboard 是独立的，所以不会有冲突。如果我们需要修改相同的模块（相同的 Storyboard），那么我们会进行沟通协作，防止冲突。

随着 [Storyboard References](https://developer.apple.com/library/ios/recipes/xcode_help-IB_Storyboard/Chapters/AddSBReference.html) 的引入，使用多个 Storyboard 就更加简单了。

## Nibs

我很喜欢用 Storyboard 来进行模块的开发，它能很好的表达出每个界面之间的关系，并且界面相关的配置也一目了然。它拥有很强的可读性，而这点纯代码是很难做到的。这便是 Storyboard 最大的优势，它主要作用并不是管理每个视图或设计图。

在项目中，有很多需要复用的 view 和 Table View Cell。如果你发现自己在一个或多个 Storyboard 中使用到了相同的 view，那就将这个 view 封装为 Nib。再次强调，应该保证你的 Storyboard 或者 Nib “代码”保持相对独立并可以被复用。

由于我喜欢尽可能的对 view 进行复用，所以我的 Storyboard 一般是这样的：

![](https://swift.gg/img/articles/i-heart-storyboards-nibs/Screen-Shot-2016-03-27-at-2.20.11-PM-1024x346.png1460334616.8747678)

即使保留着大量的使用 Nib （或者是纯代码）构造的 view 都是 ok 的。这样看起来很空旷的 Storyboard，对我来说也相当有用，它依然清晰的描述了界面的结构，我也能方便的查看 ViewController 内部细节。

## IBInspectable / IBDesignable

在使用 Storyboard 或 Nib 时，遇到的另一个问题就是我可能需要对 view 进行一些改动，而且这些改动不能再 Storyboard 中进行，这就意味着，程序运行出来的效果，和我在 Storyboard 中看到的效果不同。

不过现在有了 [IBInspectables / IBDesignables](http://nshipster.com/ibinspectable-ibdesignable/)，我们就可以在 Storyboard 中来进行改动，并且在当前画布的右边栏能看到改动的属性列表。

## Autolayout / Stack Views

在使用自动布局的时候，没有可视化界面简直寸步难行。我很喜欢 Storyboard 或 Nib 在我缺少约束的时候给出警告，然后我再逐个去解决。Stack View 也是这样的，可以看到 view 的即时反馈，并进行调整也是极好的。

## 最后

作为一名 iOS 开发者，我真的很喜欢 Interface Builder，真是不理解为什么有些开发者这么反感它。当然，如果你没有正确的使用它，那我无话可说。只要你模块化的管理 IB 文件，并保持简洁，那么无论谁在中途参与到项目中来，程序的可读性都没有问题。