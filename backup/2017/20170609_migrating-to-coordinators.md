title: "把代码迁移到协调器上"
date: 2017-06-09
tags: [iOS 开发]
categories: [KHANLOU]
permalink: migrating-to-coordinators 
keywords: 
custom_title: 
description: 

---
原文链接=http://khanlou.com/2017/04/migrating-to-coordinators/
作者=Soroush Khanlou
原文日期=2017-4-25
译者=Cwift
校对=Crystal Sun
定稿=CMB

<!--此处开始正文-->

这篇文章是 [Coordinators（协调器）进阶教程系列](http://khanlou.com/tag/advanced-coordinators/)的第一篇。如果你没有阅读过[原始的帖子](http://khanlou.com/2015/01/the-coordinator/)及其[后续](http://khanlou.com/2015/10/coordinators-redux/)，请务必首先查阅这些文章。该系列将涵盖几项进阶的 Coordinator 使用技巧、疑点、常见问题以及其他细碎的内容。让我们开始吧。

<!--more-->

常有人问我，如何把一个使用 Storyboard 构建或者是使用纯代码编写 ViewController 构建的应用重构成使用 Coordinators 的应用。只要方法正确，重构可以逐步完成。即使重构未完成，你的应用仍旧可以部署。

要实现这个目标，最好的做法是从根路径出发，在 Coordinators 中称之为 “AppCoordinator”。AppDelegate 持有该 AppCoordinator，AppCoordinator 调度 App 可以加载的所有 ViewController。

想要理解为什么从 App 的根路径开始，可以从反面来思考。如果从一些叶子流程开始（比如，一个 `CheckoutCoordinator`），那么需要保持对该 Coordinator 的强引用，以防它被释放。如果 Coordinator 被释放，它内部的代码就都不能执行了。所以，深入一个 App 中去，如果我们创建一个 Coordinator，必须让某个对象长久地持有它。

有两种方案可以防止对象被释放。第一种方案是使用静态引用。因为系统里可能只有一个 `CheckoutCoordinator`，所以很容易将其填充到一个全局变量中。虽然这种方案有效果，但是不是一个理想的选择，因为全局变量阻碍了可测试性和灵活性。第二种方案是让当前展示的 ViewController 持有 Coordinator。这将迫使当前的 ViewController 变得复杂一些，但是可以降低 Coordinator 所管理的所有 ViewController 的复杂性。然而，这种关系本质上是有缺陷的。ViewController 是 Coordinator 的“孩子”，编程时，孩子们不应该不知道他们的父母是谁。类似于一个 `UIView` 持有了一个 `UIViewController` 的引用：这种事是不该发生的。

如果你遇到了必须从子流程开始的情况，你可以使用上述两种方法之一。但是，如果可以选择，我的建议是从根路径开始。

从根路径开始的另一个好处是认证流程通常更靠近 App 的根路径。身份认证是一个很好的流程，可以抽象成单独的对象，很适合用来验证 App 中的 Coordinator。

将 App 的 RootViewController 交付给 `AppCoordinator` 之后，你可以对代码进行 Commit/Pull Request/Code Review。因为其他的 ViewController 仍在正常运转，所以 App 可以在这个未完工的状态下继续工作。基于这点，逐步改造，你可以将更多的 ViewController 交付给 Coordinator。将每个“流程”都交付给 Coordinator 之后，你可以提交代码或者创建一个 pr，不会影响 App 的正常工作。正如最佳重构一样，这些步骤只是移动代码，有时根据需要创建新的 Coordinator。

一旦所有的场景切换都转移到了 Coordinator 中，你就可以开始下一步的重构了，例如将 iPhone 和 iPad 的 Coordinator 封装到单独的对象（而不是一个切换状态的 Coordinator），让子流程可复用，更好地依赖注入，这些都可以应用到你的新架构中。