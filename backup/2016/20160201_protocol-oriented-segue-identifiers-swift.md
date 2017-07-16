title: "使用 Swift 的面向协议编程定义 Segue 标识"
date: 2016-02-01 09:00:00
tags: [Swift 进阶]
categories: [Natasha The Robot]
permalink: protocol-oriented-segue-identifiers-swift
keywords: ios面向协议,swift面向协议,surge标识
custom_title: 
description: 怎么使用Swift处理多个segue标识呢，不会的来看SwiftGG带来的使用Swift的面向协议编程定义Segue标识的教程吧。

---
原文链接=https://www.natashatherobot.com/protocol-oriented-segue-identifiers-swift/
作者=Natasha
原文日期=2015-12-17
译者=小锅
校对=&nbsp
定稿=千叶知风

<!--此处开始正文-->

回溯到八月份，我观看了 [Swift in Practice WWDC15](https://developer.apple.com/videos/play/wwdc2015-411/) 这个超赞的视频。视频的第一部分让我印象十分深刻，因此我针对这部分写了一篇博客—— [A Beautiful Solution to Non-Optional UIImage Named in Swift](http://natashatherobot.com/non-optional-uiimage-named-swift/) ——然后我最终开始准备写关于这个视频的第二部分，甚至其它更多令人激动的部分（毕竟，假期是最好的写博客的时机）（译者注：大神就是这样啊，假期不是用来玩的，反而是写博客的大好时机）。

<!--more-->

这次，我准备写的是：**处理多个 segue 标识的优雅解决方案**。你猜对了！就是使用协议。

今天就让我们开始针对你的选择展开旅程吧。你会选择：红色药丸还是蓝色药丸...（译者注：如果你看不懂这个梗的话，我建议你去补习一下黑客帝国）

![Matrix Red Pill Blue Pill App](/img/articles/protocol-oriented-segue-identifiers-swift/Simulator-Screen-Shot-Dec-18-2015-3.35.43-PM-768x432.png1454286916.1355195)

## 问题的出现

很不幸地，Segue 标识一般都是基于字符串的硬编码。当它们与 Storyboard 一起使用时，你必须在代码当中到处复制这些字符串 – 这确实很容易产生错误拼写的情况。

```swift
// ViewController.swift
    
    @IBAction func onRedPillButtonTap(sender: AnyObject) {
    	 // 我在这里硬编码了红色药丸的segue标识
        performSegueWithIdentifier("TheRedPillExperience", sender: self)
    }
 
    @IBAction func onBluePillButtonTap(sender: AnyObject) {
    	 // 我在这里硬编码了蓝色药丸的segue标识
        performSegueWithIdentifier("TheBluePillExperience", sender: self)
    }
```

当然，将来如果你决定要改变一个 segue 的标识，你就必须在硬编码这些字符串的全部地方去修改它们的名称。这当然就有可能导致更多潜在的错误，比如错误的复制/粘贴以及错误的拼写。

为了减少错误情况的发生，当一个 ViewController 中使用到了多个 segue 的标识时，我都使用枚举来处理。

```swift
// ViewController.swift
 
    enum SegueIdentifier: String {
        case TheRedPillExperience
        case TheBluePillExperience
    }
```

但是这又带来了别的问题。最主要的就是代码的丑陋和臃肿：

```swift
// ViewController.swift
    
    @IBAction func onRedPillButtonTap(sender: AnyObject) {
        // 这行代码有点长了
        performSegueWithIdentifier(SegueIdentifier.TheRedPillExperience.rawValue, sender: self)
    }
 
    @IBAction func onBluePillButtonTap(sender: AnyObject) {
        // 这个也很长
        performSegueWithIdentifier(SegueIdentifier.TheBluePillExperience.rawValue, sender: self)
    }
```

当我们处理 `prepareForSegue` 时，这个问题就更加明显了：

```swift
// ViewController.swift
 
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        
        // 解包所有东西！！！
        if let identifier = segue.identifier {
            if let segueIdentifier = SegueIdentifier(rawValue: identifier) {
                switch segueIdentifier {
                case .TheRedPillExperience:
                    print("😈")
                case .TheBluePillExperience:
                    print("👼")
                }
            }
        }
    }
```

这是我在 Swift 2.0 之前实际使用过的方式。现在我们至少可以使用 guard 关键字来避免所谓的“金字塔噩梦”，但是这依然还是不够好：

```swift
// ViewController.swift

    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        
        guard let identifier = segue.identifier,
            segueIdentifier = SegueIdentifier(rawValue: identifier) else {
            fatalError("Invalid segue identifier \(segue.identifier)."
        }
        
        switch segueIdentifier {
        case .TheRedPillExperience:
            print("😈")
        case .TheBluePillExperience:
            print("👼")
        }
    }
```

毕竟，在整个app中的每个视图控制器都会碰到这个问题。你会如何来让这些代码更加整洁呢？机智如你，应该已经猜到了，协议可以用来解决这个问题。

## 解决方案

这是一个靠我自己无法想出的优雅解决方案。感谢苹果在今年 WWDC 中关于架构的超赞演讲。我是认真的，真的超赞。

首先，创建一个 SegueHandlerType 来将 Segueidentifier 枚举标识为一个类型：

```swift
//  SegueHandlerType.swift
 
import UIKit
import Foundation
 
protocol SegueHandlerType {
    typealias SegueIdentifier: RawRepresentable
}
```

现在可以使用协议扩展的功能来为 UIViewController 创建基于字符串的 Segueidentifer 枚举：

```swift
//  SegueHandlerType.swift
 
// 注意这里我们使用了 where 来让这个方法只适用于特定的类 😍
extension SegueHandlerType where Self: UIViewController,
    SegueIdentifier.RawValue == String
{
    
    func performSegueWithIdentifier(segueIdentifier: SegueIdentifier,
        sender: AnyObject?) {
        
        performSegueWithIdentifier(segueIdentifier.rawValue, sender: sender)
    }
    
    func segueIdentifierForSegue(segue: UIStoryboardSegue) -> SegueIdentifier {
        
        // 这里还是需要使用 guard 语句，但是至少我们可以获取到变量的值  
        guard let identifier = segue.identifier,
            segueIdentifier = SegueIdentifier(rawValue: identifier) else { 
                fatalError("Invalid segue identifier \(segue.identifier).") }
        
        return segueIdentifier
    }
}
```

可以注意到，协议扩展中的方法并没有在协议中声明，它们不是用于被重写的。这是我见过的关于这个用例的最好的使用方法。

现在这样，使用起来就更加的简单和漂亮了：

```swift
// ViewController.swift
 
import UIKit
 
// 只需要让 UIViewController 遵守 SegueHandlerType，简直太 easy 了有没有 🎂
class ViewController: UIViewController, SegueHandlerType {
 
    // 现在你如果不实现这个方法，编译器就会报错
    // 遵守 SegueHandlerType 协议需要实现这个方法
    enum SegueIdentifier: String {
        case TheRedPillExperience
        case TheBluePillExperience
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        
        // 🎉 再见！金字塔噩梦！
        switch segueIdentifierForSegue(segue) {
        case .TheRedPillExperience:
            print("😈")
        case .TheBluePillExperience:
            print("👼")
        }
    }
    
    @IBAction func onRedPillButtonTap(sender: AnyObject) {
        // ✅ 这才是我想写的代码！太优雅了！
        performSegueWithIdentifier(.TheRedPillExperience, sender: self)
    }
 
    @IBAction func onBluePillButtonTap(sender: AnyObject) {
        performSegueWithIdentifier(.TheBluePillExperience, sender: self)
    }
}
```

## 总结

在视频中提到的关于使用 **SegueHandlerType** 的好处有：

* 如果使用了未定义的 segue 标识，就会有编译期错误
* 更好地支持重用
* 方便的语法

我们同时还见识到了协议的强大：

* 使用协议以及关联类型来让整个app的约束更紧密
* 使用特定的协议扩展来共享方法的实现

这里面最大的好处就是利用了编译器的优势。你如果使用了这种方法来构建你的代码，编译器将会与你同在，当你犯错时，它就会提醒你。

你可以在[Github 上下载到完整的示例程序](https://github.com/NatashaTheRobot/POSegueIdentifiers)。