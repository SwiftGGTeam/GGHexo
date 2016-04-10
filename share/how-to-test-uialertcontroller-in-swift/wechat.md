如何在 Swift 中测试 UIAlertController

> 作者：Dominik Hauser，[原文链接](http://swiftandpainless.com/how-to-test-uialertcontroller-in-swift/)，原文日期：2015-09-18
> 译者：[DianQK](undefined)；校对：[小铁匠Linus](http://linusling.com)；定稿：[小锅](http://www.swiftyper.com)
  










最近我读了一篇在 Objective-C 中使用 control swizzling 测试`UIAlertController`的[文章](http://qualitycoding.org/testing-uialertcontrollers/)。这样的文章总是促使我寻找一种不使用 control swizzling 也可以测试同样东西的方法。虽然，我知道 swizzling 是开发者的一个非常有力的工具，但我个人是尽可能去避免去使用它的。事实上，在最近的六年时间里，我只在一个应用上用了 swizzling。所以我相信我们现在可以不使用 swizzling 来实现测试。

那么问题来了，如何在 Swift 中不使用 swizzling 来对`UIAlertController` 进行测试？



我们先从我们要测试的代码开始吧。我已经添加一个按钮到 Storyboard 中。（我之所以使用 Storyboard 为了让那些不想用代码写界面的小伙伴有个更直观的感受）当按下这个按钮就会出现一个弹窗(alert)，它有标题、消息内容，还有两个按钮，分别是 OK 和取消(Cancel)。下面是这段代码：   

    
    import UIKit
    
    class ViewController: UIViewController {
      
      var actionString: String?
      
      @IBAction func showAlert(sender: UIButton) {
        let alertViewController = UIAlertController(title: "Test Title", message: "Message", preferredStyle: .Alert)
        
        let okAction = UIAlertAction(title: "OK", style: .Default) { (action) -> Void in
          self.actionString = "OK"
        }
        
        let cancelAction = UIAlertAction(title: "Cancel", style: .Cancel) { (action) -> Void in
          self.actionString = "Cancel"
        }
        
        alertViewController.addAction(cancelAction)
        alertViewController.addAction(okAction)
        
        presentViewController(alertViewController, animated: true, completion: nil)
      }
    }

注意，在这个例子中弹窗动作没有做什么具体的操作，他们只表示能验证单元测试。

让我们开始一个简单的测试：测试这个弹窗控制器的标题和消息内容。

测试的代码如下：

    
    import XCTest
    @testable import TestingAlertExperiment
    
    class TestingAlertExperimentTests: XCTestCase {
      
      var sut: ViewController!
      
      override func setUp() {
        super.setUp()
      
        sut = UIStoryboard(name: "Main", bundle: nil).instantiateInitialViewController() as! ViewController
        
        UIApplication.sharedApplication().keyWindow?.rootViewController = sut
      }
      
      override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
        super.tearDown()
      }
    }
我们需要设置 sut 为根视图控制器，否则视图控制器不能弹出这个弹窗视图控制器。

添加 UIAlertController 测试标题的代码如下：

    
    func testAlert_HasTitle() {
      sut.showAlert(UIButton())
        
      XCTAssertTrue(sut.presentedViewController is UIAlertController)
      XCTAssertEqual(sut.presentedViewController?.title, "Test Title")
    }

这很简单。现在让我们测试 UIAlertController 的取消按钮。这里有一个问题：无法获取弹窗动作的闭包。因此我们需要模拟弹窗动作，为了存储这个 handler 并在测试中调用它，看弹窗动作是否和我们预期的一样。在测试用例中添加这样一个类：

    
    class MockAlertAction : UIAlertAction {
      
      typealias Handler = ((UIAlertAction) -> Void)
      var handler: Handler?
      var mockTitle: String?
      var mockStyle: UIAlertActionStyle
      
      convenience init(title: String?, style: UIAlertActionStyle, handler: ((UIAlertAction) -> Void)?) {
        self.init()
        
        mockTitle = title
        mockStyle = style
        self.handler = handler
      }
      
      override init() {
        mockStyle = .Default
        
        super.init()
      }
    }

这个模拟类的主要工作是捕获 handler 块，以备后用。现在我们需要将这个模拟的类插入到实现代码中。将视图控制器中的代码换成下面这个：   

    
    import UIKit
    
    class ViewController: UIViewController {
      
      var Action = UIAlertAction.self
      var actionString: String?
      
      @IBAction func showAlert(sender: UIButton) {
        let alertViewController = UIAlertController(title: "Test Title", message: "Message", preferredStyle: .Alert)
        
        let okAction = Action.init(title: "OK", style: .Default) { (action) -> Void in
          self.actionString = "OK"
        }
        
        let cancelAction = Action.init(title: "Cancel", style: .Cancel) { (action) -> Void in
          self.actionString = "Cancel"
        }
        
        alertViewController.addAction(cancelAction)
        alertViewController.addAction(okAction)
        
        presentViewController(alertViewController, animated: true, completion: nil)
      }
    }

我们添加了一个类变量`Action`，并设置为`UIAlertAction.self`。这个变量我们会在初始化弹窗动作时使用。这就能让我们在测试时可以重写它。像这样：

    
    func testAlert_FirstActionStoresCancel() {
      sut.Action = MockAlertAction.self
      
      sut.showAlert(UIButton())
      let alertController = sut.presentedViewController as! UIAlertController
      let action = alertController.actions.first as! MockAlertAction
      action.handler!(action)
      
      XCTAssertEqual(sut.actionString, "Cancel")
    }

首先我们插入了这个弹窗动作。之后我们调用代码弹出弹窗视图控制器。我们从呈现的视图控制器中获取了取消动作，并且成功调用了捕获的 handler 块。最后一步就是去断言当前的动作是否和我们预期的一样。

就是这样，一种很简单的又不使用 swizzling 来测试 UIAlertViewController 的方式。

文章中的代码已经放到 [github](https://github.com/dasdom/TestingAlertExperiment) 。 
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。