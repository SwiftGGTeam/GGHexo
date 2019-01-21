title: "抛弃视图控制器，做自己的控制器"
date: 2018-05-02
tags: [iOS 开发]
categories: [khanlou.com]
permalink: just-controllers
keywords: 
custom_title: 
description: 

---
原文链接=http://khanlou.com/2018/02/just-controllers/
作者=Soroush Khanlou
原文日期=2018-02-21
译者=东莞大唐和尚
校对=Lefex
定稿=CMB

<!--此处开始正文-->

苹果官方文档中提到过 MVC 的软件设计模式。不过，苹果介绍的并不是本质意义上的 MVC 。[关于这一点我之前也有写过一篇文章](http://khanlou.com/2014/03/model-view-whatever/)，MVC 是为 Smalltalk 语言设计的一种设计模式。在 Smalltalk 语言里，MVC 的三个组件：模型（model）、视图（view）和控制器（controller）之间都可以相互通信。这就意味着要么视图知道自己持有的模型是如何实现的，要么模型知道自己是如何在视图中被应用的。

我们写 iOS 软件的时候，通常会把可以直接通信的视图和模型称之为“反模式”（PS：不推荐这么做）。我们所谓的 MVC 更准确的说其实是“模型-视图-适配器（Model - View - Adapter）”。我们说的“视图控制器”其实只是模型和视图中间沟通的一个桥梁。笼统来讲，我觉得这是对正统MVC一个不错的改良——不是把视图和模型绑在一起，而是通过一个适配器把模型和视图联系起来，这个方法不错。然而，不得不说，在我工作中涉及到的大部分系统中，模型和视图都是分开的。

以上就是为什么 iOS 开发里会有视图控制器的原因：用来连接模型和视图。但是这种模式的编码会产生一些问题：有一些代码看起来既不属于模型，也不属于视图，所以我们就把这些代码放到了视图控制器里，最后视图控制器变得超级臃肿。关于这个问题，我在博客里面讨论过[很多次](http://khanlou.com/2015/10/coordinators-redux/)，但这次我想说的不是这个问题。

<!--more-->

---

我私下里听到过很多关于 `UIViewController` 的谈论。我认为 `UIViewController` 这个基本类写的不是很好，这一点你用 UIKit 用得越久就越能感觉到。听说 `UIViewController` 这个基本类型有 1 万到 2 万行代码（那是几年前了，现在可能已经超过两万行了）。

当我们需要把 `UIView` 和一个模型联系起来的时候，我们通常会把视图控制器分成一个个小的视图控制器组件，然后再组装到一起。

但是，这样做太小题大做了。一个小地方没处理好，就会出现很多 bug，而且这样的 bug 很难修复，也没有什么提示。然后，当你终于找到 bug 的时候，发现通常都是 `didMove` 或者 `willMove` 的调用顺序不对导致的。其实，出现 `didMove` 和 `willMove` 的时候就已经说明这些组件一些内部状态需要清理了。

这样的情况我自己就遇到过两次。第一次是我把视图控制器放在了 `tableView` 的 `cell` 里。出现的 bug 就是，table view 里面的一些内容总会莫名其妙地消失。然后过了好几个月，我才意识到我对 table view cells 的生命周期理解有误。

在我改正了一些对 `-addChildViewController` 的调用之后，程序就正常运行了。

这件事让我看到了一个很大的问题：视图控制器的视图并不是一个普普通通的视图，而是一个视图控制器的视图。它有自己一些特性。

回过头去看，一切都很明显。`UIViewController` 怎么知道什么时候该去调用 `viewDidLayoutSubviews`? 肯定是 `view` 向它发送了请求，这就意味着视图控制器对视图是有一些依赖的。

第二次是最近碰到的，这次的问题出现在我把一个视图控制器的视图作为 `text field` 的 `inputAccessoryView` 时。当时我在实现一个通信软件（类似  iMessage）里 `textField` 贴在屏幕底部的功能，整个过程十分挫败。我花了整整一天时间都没搞定，最后还是把这个视图转换成了一个普通的视图。

---

所以，我们通常想 `UIViewController` 应该做的是哪些事情呢？

- 承载视图
- 把模型和视图联系起来

那 `UIViewController` 还做了哪些我们并不十分在意的事呢？

- 为子视图控制器提供存储
- 把外观和过渡动画推送给子视图控制器
- 可以在类似 `UINavigationController` 的容器中显示
- 内存过低通知
- 处理状态栏
- 保存状态、恢复状态

知道了这些，在一些特殊情况下，需要我们做一个替代视图控制器的东西时，我们就知道了哪些东西是我们并不需要的。我喜欢这样，因为这样可以快速地解决问题，同时也符合我“自己的事情自己做”的性格。

还有一个问题，这个东西怎么命名呢？我觉得命名成一个视图控制器不太好，很容易被误解为一个 `UIViewController`的子类。或者，我们就叫它 `Controller`？我觉得可以（[尽管我之前可能有其他观点](http://khanlou.com/2014/11/a-controller-by-any-other-name/)），因为它的作用就是 iOS MVC 设计框架中控制器的作用（把视图和模型联系起来），但是还有其他一些备选：`Binder`（粘合）, `Binding`（捆绑）, `Pair`（配对）, `Mediator`（中介）, `Concierge`（前台）。

这个做法还有一个好处是，**特别好写**。

```swift
class DestinationTextFieldController {

    var destination: Destination?

    weak var delegate: DestinationTextFieldControllerDelegate?

    let textField = UITextField().configure({
        $0.autocorrectionType = .no
        $0.clearButtonMode = .always
    })
    
}
```

虽然可能不用 `UIViewController` 的子类，然后写这样一个东西，会有人喊，“异教徒！烧死他！”。但是，当 `UIViewController` 没有把自己该做的事情做好的时候，我们就应该抛弃它。

现在大家已经知道怎么给自己的新对象加新功能了。在我的这个例子中，控制器成了 `textField` 的代理，文字变化时发出事件（以及域元数据 domain metadta），同时提供更新视图（这个例子中是`textField`）的接口。

```swift
extension DestinationTextFieldController {
	var isActive: Bool {
		return self.textField.isFirstResponder
	}

	func update(with destination: Destination) {
		self.destination = destination
		configureView()
	}
	
	private func configureView() {
		textField.text = destination.descriptionForDisplay
	}
}
```

使用这种新的控制器你还需要做其他几件事：

- 你得新建一个实例变量来存储数据
- 你得负责一些触发事件——因为它不是一个视图控制器，没有 `-viewDidAppear`
- 因为新的控制器已经不在 `UIKit` 框架里面了，所以其他一些 `UIKit` 的特性（[UITraitCollection](https://developer.apple.com/documentation/uikit/uitraitcollection), [safe area insets](https://developer.apple.com/documentation/uikit/uiview/positioning_content_relative_to_the_safe_area)，或者[UIResponder](https://developer.apple.com/documentation/uikit/uiresponder)）都不能再使用了。而需要你自己实现。

使用这个对象不是很难，不过你还是需要写明它的数据存储方式， 防止它的内存被回收。

```swift
class MyViewController: UIViewController, DestinationTextFieldControllerDelegate {


	let destinationViewController = DestinationTextFieldController()
	
	override func viewDidLoad() {
		super.viewDidLoad()
		destinationViewController.delegate = self
		view.addSubview(destinationViewController.view)
	}
	
	//handle any delegate methods

}
```

话说回来，即使你使用我说的这个方法，其他大部分的视图应该还会是视图控制器和 `UIViewController` 的子类。不过，在某些特殊的情况下，整合一个视图控制器会耗费你过多的精力，这时候采用这种方法，就可以避免再次被 `UIKit` 折磨。
