title: "UIAlertController 测试的修正"
date: 2015-12-11
tags: [Swift and Painless]
categories: [Swift 入门]
permalink: correction-on-testing-uialertcontroller

---
原文链接=http://swiftandpainless.com/correction-on-testing-uialertcontroller/
作者=dom
原文日期=2015-11-25
译者=小袋子
校对=lfb_CD
定稿=千叶知风
发布时间=2015-12-11T09:00:00

<!--此处开始正文-->

两个月前，我曾发布了一篇[如何测试 UIAlertController](http://swiftandpainless.com/how-to-test-uialertcontroller-in-swift/)的文章。一个读者发现测试没有如期地起作用：

<!--more-->

> [@dasdom](https://twitter.com/dasdom) 你的测试是正常的，但是在 `MockUIAction` 中的简便 `init` 方法没有被调用。你不能重写 `init` 方法，看起来像是 iOS 的bug。
>  — Larhythimx (@Larhythmix) [25. November 2015](https://twitter.com/Larhythmix/status/669456137041915905)

Larhythimx 说的完全正确。模拟程序的初始化方法从来没有调用。为什么我在写这个测试用例的时候没有发觉呢？那是因为 handler 确实被调用了，看起来就像 `UIAlertAction` 真的把 handler 作为内部变量去存储动作的 handler 闭包。这是非常脆弱的，并且 Larhythimx 在另一个 tweet 指出在他的测试程序中 handler 是 `nil`。

所以作为黄金通道（即编写不需要改变实现的测试）走不通，那就退而求其次用别的方法。

首先，我们在 `UIAlertAction` 中添加一个类方法去创建 action 。在 `ViewController.swift` 中增加如下扩展：

```swift
extension UIAlertAction {
  class func makeActionWithTitle(title: String?, style: UIAlertActionStyle, handler: ((UIAlertAction) -> Void)?) -> UIAlertAction {
    return UIAlertAction(title: title, style: style, handler: handler)
  }
}
```

在 `MockAlertAction` 中增加这个重写方法：

```swift
override class func makeActionWithTitle(title: String?, style: UIAlertActionStyle, handler: ((UIAlertAction) -> Void)?) -> MockAlertAction {
  return MockAlertAction(title: title, style: style, handler: handler)
}
```

在实现代码中，我们现在可以使用类方法去创建 alert 动作：

```swift
let okAction = Action.makeActionWithTitle("OK", style: .Default) { (action) -> Void in
    self.actionString = "OK"
}
let cancelAction = Action.makeActionWithTitle("Cancel", style: .Default) { (action) -> Void in
    self.actionString = "Cancel"
}
alertViewController.addAction(cancelAction)
```

为了确保我们的测试用例正常，如我们预期地工作，将 `MockAlertAction` 的 `handler` 属性重命名为 `mockHandler`： 

```swift
var mockHandler: Handler?
```

此外，我们为动作的模拟标题添加测试。取消动作的测试应该像这样： 

```swift
func testAlert_FirstActionStoresCancel() {
  sut.Action = MockAlertAction.self
  
  sut.showAlert(UIButton())
  
  let alertController = sut.presentedViewController as! UIAlertController
  let action = alertController.actions.first as! MockAlertAction
  action.mockHandler!(action)
  
  XCTAssertEqual(sut.actionString, "Cancel")
  XCTAssertEqual(action.mockTitle, "Cancel")
}
```

这个测试在此前的版本将会失败，因为初始化方法没有被调用，因此模拟标题也没有得到设置。

你可以在 [github](https://github.com/dasdom/TestingAlertExperiment) 上找到修正的版本。

再次感谢 Larhythimx 的推特！