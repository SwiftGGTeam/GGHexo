title: "Swift 简洁之道(上)"
date: 2017-04-24
tags: [Swift]
categories: [alloc-init]
permalink: self-explained-swift
keywords:
custom_title:
description:

---
原文链接=https://www.alloc-init.com/blog/2016.12.28
作者=Weston Hanners
原文日期=2017-04-19
译者=CoderAFI
校对=Darren
定稿=CMB

<!--此处开始正文-->

```
// Swift 简洁之道(上)
// 用代码来进行自动布局

import UIKit // 导入 UIKit 为下面布局所用
import PlaygroundSupport // 导入 Playground 运行支持的库

// 我将会采用一种非常简洁的方式来添加界面元素、完成布局、配置界面属性但是不会用到 `Storybards`.

class OurAwesomeViewController: UIViewController {

		// 在这里的所有UI元素, 我都会用 懒加载 方式来初始化

		// 所谓懒加载也就说，只有在这些UI元素被添加到界面层级中去的时候，才会调用他们的内联构造函数进行初始化并且只会调用一次
		// 理想情况下，我在这里想采用 lazy let 来强制保证这些UI元素在显示之后不会改变，但是 Swift 3 并不支持

		// 那如果我们直接用 let 又如何呢,答案是也不行，因为如果这样的话是无法在一个方法中访问到 self 的，这个时候 self 还没有初始化完成
    lazy var titleLabel: UILabel = {

				// 初始化 label
        let label = UILabel()

				// 将下面的属性禁止掉，否则会有很多布局的错误日志输出.
				// 我也不清楚为什么默认值是 "true"，反正现在用不到它了.
        label.translatesAutoresizingMaskIntoConstraints = false

				// 给 label 设置字体
        label.font = UIFont(name: "Menlo", size: 14)

				// 设置字体颜色(注意，这里我们不会牵扯到设计的东西)
        label.textColor = .white

				// 当然也可以设置 label 的显示内容
        label.text = "Awesome"

        // 让文字内容居中
        label.textAlignment = .center

        return label
    }()

    // Button 设置也大同小异
    lazy var button: UIButton = {

        // 初始化
        let button = UIButton()

        // 禁用掉这个多余的属性
        button.translatesAutoresizingMaskIntoConstraints = false

        // 设置按钮的标题内容
        button.setTitle("Press Me", for: .normal)

        // 给按钮绑定事件函数
        button.addTarget(self,
                         action: #selector(OurAwesomeViewController.buttonTest),
                         for: .touchUpInside)

        return button
    }()

		// 在这里添加布局代码，当界面准备显示在屏幕上的时候这个方法就会在 UIKit 中被调用
    override func loadView() {

				// 如果要采用UIKit默认提供的view,请别忘了调用 super 的 loadView 方法,如果不用的话，也要给self.view赋值
        super.loadView()

				// 自定义 view 的背景色
        view.backgroundColor = .blue

				// StackView 控件会节省很多时间. 它会自动管理子界面的布局方式并且可以结合一些属性设置就可以避免臃余的界面约束
				// StackView 控件还可以嵌套甚至设置一些边距以满足各种复杂的布局情况.在我看来，这种布局方式要比设置约束简单有效的多.
        let verticalLayout = UIStackView(arrangedSubviews: [titleLabel, button])

        // 同样的禁用掉这个属性
        verticalLayout.translatesAutoresizingMaskIntoConstraints = false

				// 设置垂直方向布局，并且设置填充和对齐方式.
        // 这里不用记到底用了哪个属性，只要大体有个印象，用的时候查下也可以了.
        verticalLayout.axis = .vertical
        verticalLayout.alignment = .fill
        verticalLayout.distribution = .fill

				// 如果你要设置一些边距，可以像下面这样做
        verticalLayout.isLayoutMarginsRelativeArrangement = true
        verticalLayout.layoutMargins = UIEdgeInsets(top: 20, left: 20, bottom: 20, right: 20)

				// 我们给 StackView 控件设置一些布局约束来矫正它的位置
				// 这部分代码可以抽象一下写成一个类库来简化代码.在下面文章中我会展示出来
        let topConstraint = NSLayoutConstraint(item: verticalLayout,
                                               attribute: .top,
                                               relatedBy: .equal,
                                               toItem: view,
                                               attribute: .top,
                                               multiplier: 1,
                                               constant: 0)

        let bottomConstraint = NSLayoutConstraint(item: verticalLayout,
                                                  attribute: .bottom,
                                                  relatedBy: .equal,
                                                  toItem: view,
                                                  attribute: .bottom,
                                                  multiplier: 1,
                                                  constant: 0)

        let leftConstraint = NSLayoutConstraint(item: verticalLayout,
                                                attribute: .left,
                                                relatedBy: .equal,
                                                toItem: view,
                                                attribute: .left,
                                                multiplier: 1,
                                                constant: 0)

        let rightConstraint = NSLayoutConstraint(item: verticalLayout,
                                                 attribute: .right,
                                                 relatedBy: .equal,
                                                 toItem: view,
                                                 attribute: .right,
                                                 multiplier: 1,
                                                 constant: 0)

        // 现在添加到view中...
        view.addSubview(verticalLayout)

        // 添加上面的约束.
        view.addConstraints([topConstraint, bottomConstraint, leftConstraint, rightConstraint])
    }

		// 当按钮被点击时，这个测试方法会被调用.
    func buttonTest(sender: UIButton) {
				// 这里只是改变了界面的颜色
        view.backgroundColor = .red
    }

}

// 将上面的 view controller 绑定到 playground 上.
PlaygroundPage.current.liveView = OurAwesomeViewController()
PlaygroundPage.current.needsIndefiniteExecution = true

// 用纯手工的方式编写布局代码可能看起来有点费力，但这样做对于了解UI元素的布局原理，位置分布，属性设置是非常有用的.
// 采用这种方式更容易用 git 来跟踪历史变化, 所以在某些方面我个人认为要比 Interface Builder 更简单易用一些.

// 附加内容!!!

// 你可能会想把以上代码用到真是的 Xcode 工程中去，而不是仅仅在 Playgrounds 里面跑跑.

// First, in your project file, you might have a "Main Interface" configured, this is normally
// your first storyboard to load. Just open your project file and clear it out.

// 首先，当你创建完工程之后，在工程文件里一般会有一个 `Main Interface` 的配置，它通常是第一个要加载的 `Storyboard`.
// 现在我们不用它了，可以把它删掉.

// 下一步

// 在 AppDelegate 的 applicationDidFinishLaunchingWithOptions 中，只需要改变一行代码即可.
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication,
                     willFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey : Any]? = nil) -> Bool {

        // Let's create a new window. Every app needs one to start.
        // We will set its frame to be the same size of the screen.
        window = UIWindow(frame: UIScreen.main.bounds)

        // Set the window's rootViewController to be the
        // ViewController you want to start with.
        window?.rootViewController = OurAwesomeViewController()

        // This will push it on to the screen.
        window?.makeKeyAndVisible()

        // Unless you have some major failure during this function, you should
        // return true here to let your application know it's ready to go.
        return true
    }
}

// 如果你想看我的更多文章或者跟我交流可以在 twitter(@WestonHanners) 上找我.

// 在下片文章中，我会写一些扩展让上面的代码更简洁、易读,大家敬请期待

```

[下载示例代码](https://www.alloc-init.com/content/downloads/1-Layout.zip)

> 译者注：上面的这些翻译，个人认为只是作者为了阐述清楚代码的原理，也就是说为什么这样做能使代码简洁，而并非是每行代码都要加注释
