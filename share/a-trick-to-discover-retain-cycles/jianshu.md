发现循环引用的方法"

> 作者：Thomas Hanning，[原文链接](http://www.thomashanning.com/a-trick-to-discover-retain-cycles/)，原文日期：2015-11-09
> 译者：[靛青K](http://www.dianqk.org/)；校对：[littltedogboy](undefined)；定稿：[shanks](http://codebuild.me/)
  







# 发现循环引用的技巧

尽管 ARC 已经为我们做了大部分内存管理的事情，但你的 App 仍然可能遇到循环引用的问题。因此发现这些潜在的循环引用是非常重要的。


## ARC 和 内存管理

随着在 iOS 5 中 介绍的自动引用计数（ARC）的使用，内存管理变得非常简单。但 ARC 不能处理所有情况，所以处理好 App(应用程序) 的内存管理还是非常重要的。例如，可能存在所谓的循环引用。就比如在应用程序中尽管没有任何可访问的引用指向视图控制器，但视图控制器也没有被销毁。如果存在这种循环引用，那么每次出现这个视图控制器，应用程序的内存都会增加。如果内存不停地增加，App 会被操作系统终止 —— App 崩溃。

## 循环引用

我们来创建一个循环引用的例子：首先，我们创建了一个 `RootViewController` 和一个 `SecondViewController`。当点击 `RootViewController` 的一个按钮后，就出现 (`present`)一个 `SecondViewController`。你可以在 storyboard 中通过 segue 轻松创建。 另外，再创建一个 `ModelObject` 类，该类中有一个类型为 `ModelObjectDelegate` 的 delegate 实例变量 。当 `SecondViewController` 加载完视图后，把 `ModelObject` 的代理设置为`self`。

    
    import Foundation
    
    protocol ModelObjectDelegate: class {
        
    }
    
    class ModelObject {
        
        var delegate: ModelObjectDelegate?
           
    }

    
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

好的，现在我们来检查一下内存管理：当我们移除`SecondViewController`时，内存并不会减少。但这是为什么呢？  
我们预期的结果是移除时，`SecondViewController`内存就会销毁。我们来看一下这些对象。当`SecondViewController`加载后，引用情况是下图这个样子：

![](http://swift.gg/img/articles/a-trick-to-discover-retain-cycles/retainc1.jpg1457485815.2839491)

现在，当移除`SecondViewController`时，引用情况是这个样子：

![](http://swift.gg/img/articles/a-trick-to-discover-retain-cycles/retain2c.jpg1457485816.052251)

`RootViewController` 取消了强引用 `SecondViewController`。然而 `SecondViewController` 和 `ModelObject` 互相强引用。因此它们都没有被销毁。

## 技巧
发现循环引用的技巧如下所示：  

如果一个对象被销毁，会执行对应的 `deinit` 方法。所以只需要在类中的 `deinit` 方法中添加一个打印信息：

    
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
        
        deinit {
            print("SecondViewController deinit")
        }
    }

    
    import Foundation
    
    protocol ModelObjectDelegate: class {
        
    }
    
    class ModelObject {
        
        var delegate: ModelObjectDelegate?
        
        deinit {
            print("ModelObject deinit")
        }
        
    }

当我们移除 `SecondViewController`，调试窗口并没有日志信息。也就是说他们并没有被销毁，说明出了些问题。

## 解决办法

我们已经知道这里多了一个强引用。所以我们可以声明`delegate`为`weak`属性。

    
    import Foundation
    
    protocol ModelObjectDelegate: class {
        
    }
    
    class ModelObject {
        
        weak var delegate: ModelObjectDelegate?
        
        deinit {
            print("ModelObject deinit")
        }
        
    }

现在的对象关系是这个样子：

![](http://swift.gg/img/articles/a-trick-to-discover-retain-cycles/retainc3.jpg1457485816.738923)

因为 `SecondViewController` 和 `ModelObject` 之间仅有一个强引用，这里应该不会再有什么问题了。

没错，现在当我们移除`SecondViewController`调试窗口会有日志信息了：

    SecondViewController deinit
    ModelObject deinit

现在和我们的预期情况一样了。

## 结论

尽管这是一点点的工作，为了发现循环引用应该在视图控制器的`deinit`方法中添加一条日志信息。你也可以使用 Instruments(Xcode自带的内存检测工具) 发现循环引用，但如果总是把日志信息放在`deinit`方法中，可以持续监测销毁行为了。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。