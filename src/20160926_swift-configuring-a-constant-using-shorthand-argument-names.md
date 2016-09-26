title: "Swift：让人眼前一亮的初始化方式"
date: 2016-09-26
tags: [Swift]
categories: [Natasha The Robot]
permalink: swift-configuring-a-constant-using-shorthand-argument-names
keywords: swift初始化方法
custom_title: 
description: Swift 有着超级严格的初始化方法，而本文眼前一亮的介绍了一种不错的 Swift 初始化方法哦，非常值得一看。

---
原文链接=https://www.natashatherobot.com/swift-configuring-a-constant-using-shorthand-argument-names/
作者=Natasha The Robot
原文日期=2016/05/25
译者=haolloyin
校对=saitjr
定稿=千叶知风

<!--此处开始正文-->

有条传播得很广的 [tweet](https://twitter.com/nick_skmbo/status/735109452827877377) 讲到用位置参数（positional references）来初始化 Swift 常量：

![tweet](https://img1.doubanio.com/view/photo/large/public/p2367204967.jpg)

原始代码见这个 [gist](https://gist.github.com/erica/4fa60524d9b71bfa9819)（译注：原 gist 代码缩进太乱，搬运过来整理如下）：

```swift
import UIKit
import XCPlayground

class ViewController: UIViewController {
    func action() { print("Bing!") }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .whiteColor()
        
        let mySwitch : UISwitch = {
            view.addSubview($0)
            CenterViewInSuperview($0, horizontal: true, vertical: true)
            $0.addTarget(self, action: "action", forControlEvents: .TouchUpInside)
            return $0
        }(UISwitch())
        
        let _ : UILabel = {
            view.addSubview($0)
            CenterViewInSuperview($0, horizontal: true, vertical: false)
            $0.text = "Toggle me"
            $0.font = UIFont.boldSystemFontOfSize(36)
            ConstrainViews("V:[view1]-30-[view2]", views: $0, mySwitch)
            return $0
        }(UILabel())
    }
}

ViewController()
XCPlaygroundPage.currentPage.liveView = ViewController()
XCPlaygroundPage.currentPage.needsIndefiniteExecution = true
```

由于这条 tweet 太简短，而且没有像我预期的那样运作，这让我很困惑。因此我想在这儿写一篇关于这个问题更详细的文章。

## 问题

声明常量后，在一个紧接着的闭包中进行初始化，而不是之后在 `viewDidLoad` 或其他类似的方法中进行设置，这在 Swift 中是很常见的写法（也确实是一种不错的写法！）。

```swift
let purpleView: UIView = {
    // 在此初始化 view
    // 直接叫 "view" 真的好吗？
    let view = UIView()
    view.backgroundColor = .purpleColor()
    return view
}()
```

我总是觉得在闭包中多命名一个 `UIView` 很难看（译注：注意看上面代码中原作者的注释），上面代码中有 `purpleView` 和 `view` 两个 `UIView` 实例，那么 `view` 是不是应该命名成 `purpleView`？我至今还没找到关于这种命名问题的好办法。

## 解决方案

因此当我看到 tweet 中使用 `$0` 而不是很繁琐地命名变量时感到很兴奋，我立马尝试了一下：

```swift
// 声明：以下代码无法运行...
let yellowView: UIView = {
    $0.backgroundColor = .yellowColor()
    return $0
}()
```

但这没法运行...再仔细查看 @ericasadun 的代码，我意识到必须在闭包执行时，传入一个初始化好的 `UIView` 实例：

```swift
let yellowView: UIView = {
    $0.backgroundColor = .yellowColor()
    return $0
 // 确保下一行的括号内要传入 UIView()
}(UIView())
```

当然这一次就能运行了！

## 结论

我确实很喜欢在这里用 `$0` 的写法，而不是显式地再命名一个变量。为啥我没想到这种方法呢，好气哦。然而现在我知道必须在那里传入一个初始化好的 `UIView()`，这从逻辑上的确说得通。大概我以后都会用这种写法。在这里用 `$0` 这么优雅的写法，为啥不呢！

加入我们 9 月 1 ~ 2 日在纽约市举办的 *Swift 社区庆祝会🎉`（Swift Community Celebration）*吧，用这个优惠码 *NATASHATHEROBOT* 减 $100！

## 更新

[@khanlou 指出](https://twitter.com/khanlou/status/735500301487198210)有个叫 [Then](https://github.com/devxoul/Then) 的库更赞，能够写出可读性更好的代码：

```swift
let label = UILabel().then {
    $0.textAlignment = .Center
    $0.textColor = .blackColor()
    $0.text = "Hello, World!"
}
```

但我并不是很乐意把这个库导入到我的项目中，[@khanlou 再次指出](https://twitter.com/khanlou/status/735508166746775552)这个库只有 15 行代码，于是我的最终想法是把这 15 行代码复制到我的项目中！（译注：既然只有 15 行代码，下面搬运过来方便阅读）

```swift
import Foundation

public protocol Then {}

extension Then where Self: Any {
    /// Makes it available to set properties with closures just after initializing.
    ///
    ///     let label = UILabel().then {
    ///         $0.textAlignment = .Center
    ///         $0.textColor = UIColor.blackColor()
    ///         $0.text = "Hello, World!"
    ///     }
    public func then(@noescape block: inout Self -> Void) -> Self {
        var copy = self
        block(&copy)
        return copy
    }
}

extension Then where Self: AnyObject {
    /// Makes it available to set properties with closures just after initializing.
    ///
    ///     let label = UILabel().then {
    ///         $0.textAlignment = .Center
    ///         $0.textColor = UIColor.blackColor()
    ///         $0.text = "Hello, World!"
    ///     }
    public func then(@noescape block: Self -> Void) -> Self {
        block(self)
        return self
    }
}

extension NSObject: Then {}
```

你也可以看看 [@ericasadun 这个不错的解决方案](https://twitter.com/ericasadun/status/735520147549487104)！（译注：即这个 [gist](https://gist.github.com/erica/72be2ffe76a569376469c2f2110aee9c)，代码搬运如下）

```swift
// @discardableResult to be added
// @noescape needs to move to type annotation
// needs to add _ for item
public func with<T>(item: T, @noescape update: (inout T) throws -> Void) rethrows -> T {
    var this = item; try update(&this); return this
}
```