title: "构建 iOS 界面：子类化 Views"
date: 2016-08-16
tags: [iOS 开发]
categories: [Thoughtbot]
permalink: building-ios-interfaces-subclassing-views
keywords:  子类Views,iOS界面
custom_title: 
description: 本文介绍如何更加优美地使用子类化 Views 来构建 iOS 界面。

---
原文链接=https://robots.thoughtbot.com/building-ios-interfaces-subclassing-views
作者=Reda Lemeden
原文日期=2016-04-28
译者= wiilen
校对=bestswifter
定稿=CMB

<!--此处开始正文-->

这篇文章是 **构建 iOS 界面** 系列的第四篇，本篇重点介绍：在没有原生系统编程经验的情况下，如何实现 iOS 的设计 —— 这对 Web 设计师及开发者们来说是极好的。这里也提供前面几篇文章：[第一部分](https://robots.thoughtbot.com/building-ios-interfaces-swift-primer) - [第二部分](https://robots.thoughtbot.com/building-ios-interfaces-views) - [第三部分](https://robots.thoughtbot.com/building-ios-interfaces-custom-button)。

在[上一篇](https://robots.thoughtbot.com/building-ios-interfaces-custom-button)文章中，我们交替使用 Interface Builder 和 Swift，实现了一个自定义的按钮 —— 如果你一遍又一遍重复这个过程，除非你开发的是一个手电筒 App，UI 上只有一个按钮，不然这项工作很快就会让人心累。即便不谈无聊的重复工作，如果只更新一点功能上的细节，也需要对每一个按钮的实例进行修改，这种做法也是不靠谱的。下面我们将介绍一种更好的方法。

![](https://images.thoughtbot.com/building-ios-interfaces-custom-button/ButtonOutcome.png)

<!--more-->

## 更恰当的方法

[我们之前也提过](https://robots.thoughtbot.com/building-ios-interfaces-views#uiview)，通过继承已有类的方法和属性，来创建一个新的类，这个过程被称为子类化。子类可以有选择地重写父类的行为，如果我们自定义 `UIButton` 的默认外观，子类化正是我们需要的方法。让我们看看具体应该怎么做。

如果你之前就下过 Swiftbot 工程项目，可以直接打开。你也可以[从 GitHub 上下载](https://github.com/thoughtbot/Swiftbot/archive/b4e140f1f23bc103a490949140dcc0b2f1deb2f8.zip)。

在 project navigator 右键点击父文件夹，选择 *New File...* 来添加一个新文件：

![](https://images.thoughtbot.com/building-ios-interfaces-subclassing-views/NewFile.jpg)

选择 *iOS* 下的 *Source*，然后从模版中选择 *Cocoa Touch Class*。

![](https://images.thoughtbot.com/building-ios-interfaces-subclassing-views/CocoaTouchClass.jpg)

把类的命名为 *RoundedCornerButton*，然后将 *Subclass of* 那一行设为 *UIButton*，其他部分不动。在 Swift 中一般使用驼峰式命名法。为这个类取一个可以描述具体用途的名字，是一种好习惯。

![](https://images.thoughtbot.com/building-ios-interfaces-subclassing-views/NameClass.jpg)

在刚生成的 Swift 文件中，删除所有的注释 —— 那些开头带有 `//` 的代码。最后代码看起来应该像下面这样：

```
import UIKit

class RoundedCornerButton: UIButton { }
```

上面这段代码几乎是在 Swift 中创建一个子类所需要的最少代码。[第一篇文章](https://robots.thoughtbot.com/building-ios-interfaces-swift-primer#languages)中也介绍过，`import UIKit` 可以让我们访问那些定义在 UIKit 中的 API，这个例子中指的是 `UIButton`。

只创建一个子类还不够，目前 Interface Builder 依然把我们的按钮当作 `UIButton`。在我们增加代码之前，子类还只相当于父类的一个副本。

## 类与实例

我们[之前](https://robots.thoughtbot.com/building-ios-interfaces-views#conceptual-overview)提到过，在 Swift 中，每个 control 都由 UIKit 中的某个类来表示。不过那时候我们还没有说明的是，这些类只定义了 view 对象最基础的外观和行为。换句话说，我们很少直接使用它们。

这也是实例发挥作用的地方。实例指的是遵循给定类的规范而构建的对象。在这个例子中，我们在 IB 中添加的按钮是 `RoundedCornerButton` 的实例。

![](https://images.thoughtbot.com/building-ios-interfaces-subclassing-views/ClassInstance.jpg)

请注意 `UIButton` 类是如何在不具体设定值的情况下，声明每个按钮都需要有个 `buttonType` 属性的。按钮的实例可以自己决定 `buttonType`。

现在，将我们的按钮改为这个新的子类的实例。

在 storyboard 中，选中这个按钮，点击右侧工具栏中的第三个（ID）图标。这会切换到 *Identity inspector*，你可以在这里修改这个按钮实例独有的属性，比如它的类和 identifier。

![](https://images.thoughtbot.com/building-ios-interfaces-subclassing-views/IdentityInspector.jpg)

在 *Class* 选项框中，输入之前创建的子类的名字。这会将这个按钮修改为 `RoundedCornerButton` 的实例，这样我们之前用代码创建的自定义行为，就都能应用到这个按钮上了。

![](https://images.thoughtbot.com/building-ios-interfaces-subclassing-views/ChangeClassIB.jpg)

对子类的处理先到这里，由于现在我们不需要从 view controller 中直接访问这个按钮实例，让我们先把[之前创建](https://robots.thoughtbot.com/building-ios-interfaces-custom-button#outlets)的 outlet connection 移除。有几种方式可以做到这点，最简单的方法是：点击右侧面板最后一个图标，切换到 *Connections inspector*，点击 *Referencing Outlets* 下 `roundedCornerButton` 旁边的 *x* 。

![](https://images.thoughtbot.com/building-ios-interfaces-subclassing-views/RemoveOutlet.gif)

删除了 outlet 之后，我们需要移除 `ViewController.swift` 中对这个按钮的所有引用。删除该类声明部分的所有代码，最后代码看起来应该是下面这样：

```
class ViewController: UIViewController { }
```

我们接下来没有什么需要用到 Interface Builder 的地方了。在我们回去继续处理子类之前，我们会给你一些启发，帮助你了解如何使用子类化来扩展 UIKit controls。

## 子类化的常用策略

当我们使用子类化时，最常见的任务 —— 同时也常是最有挑战性的任务 —— 是弄清楚哪些方法和属性需要重写，以及执行你自己添加的代码的顺序。如果什么地方出错了，一般是因为你对错误的方法进行了重写，或是代码执行顺序出了差错。

对 UIView 的子类来说，你常常想让 view 在加载完后立即应用自定义的样式。一般我们对下面这些方法进行重写：

* `awakeFromNib()`，在 view 从 IB 中加载时被调用。
* `drawRect(_:)`，在 view 需要将自己绘制到屏幕上时被调用。
* `layoutSubviews()`，在 view 需要确定 subview 的大小与位置时被调用。

当然还有更多其他方法，这篇文章中无法一一介绍。如果感到好奇，你可以通过阅读[官方的 UIView 文档](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIView_Class/index.html)来了解细节。

## 重写

为了在 Swift 中重写一个方法，我们在方法的开头添加 `override` 关键字，就像下面这样：

```
class RoundedCornerButton: UIButton {
  override func awakeFromNib() { }
}
```

我们重写了 `awakeFromNib()` 方法，在这个方法中加入我们的对图层的自定义，看上去这是一个不错的选择。如果你在做出这些改动之后运行你的 App，你会发现四个角依然是直角。这不出所料，因为我们移除了那些在 view controller 中设置实例图层的 `cornerRadius` 的代码。

在之前的代码中，为了设置圆角，我们是这样做的：

```
roundedCornerButton.layer.cornerRadius = 4
```

由于现在我们直接在按钮的子类中进行修改，我们不需要再引用 `roundedCornerButton`：

```
class RoundedCornerButton: UIButton {
  override func awakeFromNib() {
    layer.cornerRadius = 4
  }
}
```

在这个例子中，`layer` 等同于 `self.layer`，`self` 是一个对该实例的引用。这意味着在 Swift 中你很少需要写 `self`，除非编译器建议你这么做。

再次运行你的 App，现在我们的按钮上应该已经应用了圆角效果。

![](https://images.thoughtbot.com/building-ios-interfaces-subclassing-views/RoundedCornerButton.jpg)

接下来的部分比较有趣：如果你在 IB 中按住 alt 来拖动并复制按钮，新的按钮会与原来的按钮完全相同，你不需要在 view controller 中改动新按钮的属性来达到这个效果。

![](https://images.thoughtbot.com/building-ios-interfaces-subclassing-views/TwoRoundedCornerButtons.jpg)

不过这里也有个小问题。目前我们在 IB 中设置了按钮的背景颜色。这意味着如果以后需要修改所有按钮的颜色，我们需要在 IB 中手动修改每个按钮。

这个问题容易解决。我们只需要在子类中直接修改 `roundedCornerButton` 的背景颜色属性，这样所有的按钮的背景颜色都会被改为同一颜色：

```
class RoundedCornerButton: UIButton {
  override func awakeFromNib() {
    layer.cornerRadius = 4
    backgroundColor = UIColor(red: 0.75, green: 0.20, blue: 0.19, alpha: 1.0)
  }
}
```

如果你运行 App，你会发现两个按钮的颜色都变成了 *Tall Poppy* 色 —— 一种由 [Kromatic](https://kromatic.thoughtbot.com/) 命名的颜色。上面说的方法也可以用于修改字体、字体颜色，甚至可以用于添加新的行为，比如展示某种进行中的状态。

![](https://images.thoughtbot.com/building-ios-interfaces-subclassing-views/TwoRedButtons.jpg)

## 结语

子类化是一种构建自定义 iOS 界面的强大工具。你也可以不使用它，但如果你需要构建一个健全的、可扩展的、模块化的系统，它会为你提供许多帮助。
