title: "Swift 中的 weak 和 unowned"
date: 2015-12-02
tags: [Thomas Hanning]
categories: [Swift 入门]
permalink: swift-weak-and-unowned

---
原文链接=http://www.thomashanning.com/swift-weak-and-unowned/
作者=Thomas Hanning
原文日期=2015-11-30
译者=pmst
校对=Cee
定稿=Cee

<!--此处开始正文-->

使用 weak 和 unowned 关键字，我们可以避免所谓的循环引用。在这篇文章中，我们将讨论两者之间的差异。

<!--more--> 

### 何为循环引用？

我曾在 [“A Trick To Discover Retain Cycles”](http://www.thomashanning.com/a-trick-to-discover-retain-cycles/) 博客一文中强调了内存管理的重要性，即使 ARC  已经为你分忧解难了：

首先，我们创建两个视图控制器：`RootViewController` 和 `SecondViewController`。如果点击了 `RootViewController` 视图中的按钮，就呈现 `SecondViewController`。我们可以通过在 storyboard 使用 segue 来简单实现这个目的。另外，我们还创建了一个名为 `ModelObject` 的类，内含一个类型为 `ModelObjectDelegate` 的委托对象（译者注：你也可以说这个对象遵循 ModelObjectDelegate 协议）。如果 `SecondViewController` 的视图加载完毕，当前视图控制器就将自己任命（译者注：即 self）为 `ModelObject` 的代理。


```swift
// ModelObject 类内容
import Foundation
 
protocol ModelObjectDelegate: class {
    
}
 
class ModelObject {
    
    var delegate: ModelObjectDelegate?
       
}
```

```swift
// SecondViewController 类内容
import UIKit
 
class SecondViewController: UIViewController, ModelObjectDelegate {
    
    var modelObject: ModelObject?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        modelObject = ModelObject()
        modelObject!.delegate = self
    }
        
    @IBAction func closeButtonPressed(sender: UIButton) {
        dismissViewControllerAnimated(true, completion: nil)
    }
    
}
```

准备工作完毕，现在来测试下内存管理：首先我们释放掉（dismiss）`SecondViewController` 视图控制器，你会发现使用内存并未有所下降。这是为什么呢？按照期望应该是释放掉 `SecondViewController` 对象,内存被释放才对。让我们首先来了解下对象之间的关系。假设 `SecondViewController` 加载完毕，对象之间关系应该看起来这样：

![](http://thomashanningcom.c.presscdn.com/wp-content/uploads/2015/11/retainc1.jpg)

现在，释放掉 `SecondViewController`，看起来应该这样：

![](http://thomashanningcom.c.presscdn.com/wp-content/uploads/2015/11/retain2c.jpg)

如图所示：`RootViewController` 不再对 `SecondViewController` 拥有强引用关系。但是 `SecondViewController` 和 `ModelObject` 对象之间始终保持相互强引用。所以它们不会被释放掉。

### Weak

为了避免这种情况发生，我们可以将引用关系声明为 `weak` ，它不会阻止 ARC 释放内存。

```swift
import Foundation
 
protocol ModelObjectDelegate: class {
    
}
 
class ModelObject {
    
    weak var delegate: ModelObjectDelegate?
    
}
```

现在对象关系图应该看起来这样：

![](http://thomashanningcom.c.presscdn.com/wp-content/uploads/2015/11/retainc3.jpg)

由于 `SecondViewController` 和 `ModelObject` 对象之间仅存一个强引用关系，毫无疑问可以成功释放内存。

### Unowned

此外你还可以使用 `unowned` 关键字替换掉 `weak`,那么两者的区别在哪里？倘若你使用 `weak`,属性可以是可选类型，即允许有 `nil` 值的情况。另一方面，倘若你使用 `unowned`，它不允许设为可选类型。因为一个 unowned 属性不能为可选类型，那么它必须在 init 方法中初始化值：

```swift
import Foundation
 
protocol ModelObjectDelegate: class {
    
}
 
class ModelObject {
    //译者注：swift 要求变量一定要有初始值
    //        可选类型默认初始值为 nil
    unowned var delegate: ModelObjectDelegate
    
    init(delegate:ModelObjectDelegate) {
        self.delegate = delegate
    }
        
}
```

根据属性是否为可选类型，你可以在 `weak` 和 `unowned` 之间进行选择。


### 参考

[A Trick To Discover Retain Cycles](http://www.thomashanning.com/a-trick-to-discover-retain-cycles/)    
[Optionals In Swift](http://www.thomashanning.com/optionals-in-swift/)    
[Swift Programming Series (iBook Store)](https://itunes.apple.com/us/book-series/swift-programming-series/id888896989?mt=11)