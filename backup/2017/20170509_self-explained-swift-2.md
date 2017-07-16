title: "Swift 简洁之道(下)"
date: 2017-05-09
tags: [Swift]
categories: [alloc-init]
permalink: self-explained-swift-2
keywords:
custom_title:
description:

---
原文链接=https://www.alloc-init.com/blog/2017.01.19
作者=Weston Hanners
原文日期=2017-01-19
译者=CoderAFI
校对=Crystal Sun
定稿=CMB

<!--此处开始正文-->

工具让代码容易管理和阅读

<!--more-->

```
import UIKit
import PlaygroundSupport

// 欢迎阅读 Swift 简洁之道的第二篇文章. 这次的 playground 将会在上次的代码基础上做些修改并删除掉一些无用的注释.
// 如果你感觉很难理解,可以先去阅读[Swift 简洁之道(上)](http://swift.gg/2017/04/24/self-explained-swift/)

// 这篇文章我要传达的思想是 "工具封装". 你可以创建很多可以在多个 app 中复用的工具来帮你节省时间,比方说 view 的创建和界面布局都可以抽象成辅助工具.

// 这里所谓的 "工具" 就是一些 Swift extensions. 其实 extensions 能够在 Swift 已有的类型上添加新的函数.
// 下面的代码中的函数就可以帮助我们初始化一些公共UI控件并且能够生成一些共用的界面布局.

extension UIView { // 布局扩展

		// 这个函数能够缩短自动布局的代码行数，让代码更简洁
    func constrainTo(view: UIView) {

				// 打开 autolayout 配置
        view.translatesAutoresizingMaskIntoConstraints = false

				// 根据函数名称, 我们可以判断参数 view 是当前 view 的父视图
				// 在这里可能看起来有点奇怪, 但是当你看到如何使用时就会豁然开朗了
        view.addSubview(self)

				// 上篇文章之后，我发现了 NSLayoutAnchor 布局系统，它让自动布局的约束构建更加简洁明了，所以我们这里使用它
        view.topAnchor.constraint(equalTo: self.topAnchor).isActive = true
        view.bottomAnchor.constraint(equalTo: self.bottomAnchor).isActive = true
        view.leftAnchor.constraint(equalTo: self.leftAnchor).isActive = true
        view.rightAnchor.constraint(equalTo: self.rightAnchor).isActive = true

    }

}

extension UIStackView {

		// UIStackView 控件有很多经常修改的配置属性. 下面的便利构造函数，可以做到只用一行代码来完成这些事
    convenience init(arrangedSubviews: [UIView],
                     axis: UILayoutConstraintAxis,
                     distribution: UIStackViewDistribution,
                     alignment: UIStackViewAlignment) {

				// 调用原来的构造器
        self.init(arrangedSubviews: arrangedSubviews)

				// 给配置属性赋值
        self.axis = axis
        self.distribution = distribution
        self.alignment = alignment

				// 由于该属性经常设置，所以在这我们直接给隐蔽的封装进去
        self.translatesAutoresizingMaskIntoConstraints = false

    }

}

// 下面我们来创建一些类函数来帮助创建 app 的 "主题"

// 大部分情况下，这里都是把我上篇文章的代码重构到类函数里. 同时,提供不同的参数来保证每个实例的多态性

// 同样的 translatesAutoresizingMaskIntoConstraints 属性也要设置来保障 view controller 中的代码简洁

extension UIButton {

    class func standardAwesomeButton(title: String) -> UIButton {

        let button = UIButton()

        button.setTitle(title, for: .normal)
        button.translatesAutoresizingMaskIntoConstraints = false

        return button
    }

}

extension UILabel {

    class func standardAwesomeLabel(title: String) -> UILabel {

        let label = UILabel()

        label.font = UIFont(name: "Menlo", size: 14)
        label.textColor = .white
        label.text = title
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false

        return label
    }

}

class OurAwesomeViewController: UIViewController {

    lazy var titleLabel: UILabel = {
        return UILabel.standardAwesomeLabel(title: "Awesome")
    }()

    lazy var button: UIButton = {

        let button = UIButton.standardAwesomeButton(title: "Press Me")
        button.addTarget(self,
                         action: #selector(OurAwesomeViewController.buttonTest),
                         for: .touchUpInside)

        return button
    }()

    override func loadView() {

        super.loadView()

        view.backgroundColor = .blue

				// 这里用到了我们自定义的 UIStackView 的初始化函数, 这样不仅减少了重复的代码量而且让代码更易读.
        let verticalLayout = UIStackView(arrangedSubviews: [titleLabel, button],
                                         axis: .vertical,
                                         distribution: .fill,
                                         alignment: .fill)

        verticalLayout.isLayoutMarginsRelativeArrangement = true
        verticalLayout.layoutMargins = UIEdgeInsets(top: 20, left: 20, bottom: 20, right: 20)

				// 调用我们新的布局函数，这让添加界面和设置界面约束更加容易、简洁
        verticalLayout.constrainTo(view: view)

    }

    func buttonTest(sender: UIButton) {
        view.backgroundColor = .red
    }

}

// 将上面的 view controller 绑定到 playground 上.
PlaygroundPage.current.liveView = OurAwesomeViewController()
PlaygroundPage.current.needsIndefiniteExecution = true

// 正如你所见, 布局代码清晰而且易管理. 整个 View Controller 只有 43 行左右的代码量.
// 以往，很多时候由于忘记设置属性或者调用函数而导致界面不显示，有了上面这些封装工具之后，代码不仅可以共享而且很多奇怪的问题也可以做到迅速定位.

// 采用这些技巧，使得 view controllers 更加简单和主题化. 如果你愿意，当然可以为 button，label 或者其他 UI 控件创建很多不同的样式扩展.
// 一次创建,一处更改,整个 app 都会生效 !!!

// 这就是我们第二篇文章的全部内容，下篇文章，我将会介绍如何将业务逻辑从 ViewControllers 中剥离出来, 以保障架构的稳定性.
```

[下载示例代码](https://www.alloc-init.com/content/downloads/2-LayoutImproved.zip)

> 译者注：上面的这些翻译，个人认为只是作者为了阐述清楚代码的原理(也就是说为什么这样做能使代码简洁)，而并非是每行代码都要加注释.
