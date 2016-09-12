在 Target-Action 中使用响应链"

> 作者：Dominik Hauser，[原文链接](http://swiftandpainless.com/utilize-the-responder-chain-for-target-action/)，原文日期：2016-1-1
> 译者：[小铁匠Linus](http://linusling.com)；校对：[saitjr](http://www.saitjr.com)；定稿：[numbbbbb](http://numbbbbb.com/)
  









本文会介绍 iOS 的响应链以及如何在 Target-Action 中使用它。

## 响应链（The Responder Chain）

在 iOS 中，事件（比如，触摸事件（touch event））都使用响应链来传递。响应链由响应者对象（Responder Objects，[苹果官方术语](https://developer.apple.com/library/ios/documentation/EventHandling/Conceptual/EventHandlingiPhoneOS/event_delivery_responder_chain/event_delivery_responder_chain.html#//apple_ref/doc/uid/TP40009541-CH4-SW1)）构成。如果你看过官方文档，可能会注意到 `UIView` 和 `UIViewController` 都是响应者对象。这就意味着， `UIView` 和 `UIViewController` 都继承自 `UIResponder` ，如下图：

![](http://swift.gg/img/articles/utilize-the-responder-chain-for-target-action/UIViewDocumentation.png1452047417.154566)



当用户点击了视图层级（view hierarchy）中的一个 view 时，iOS 会通过点击测试（hit test）来判定哪个响应者对象优先响应触摸事件。这个过程从最底层的 window 开始，沿着视图层级向上寻找并检查这个 touch 是不是发生在当前 view 边界内。该过程中被点击的最后一个 view 会先收到触摸事件。如果该 view 没有对触摸事件做出反应，触摸事件就会沿着响应链传递到下一个响应者。苹果的官方[示例](https://developer.apple.com/library/ios/documentation/EventHandling/Conceptual/EventHandlingiPhoneOS/event_delivery_responder_chain/event_delivery_responder_chain.html#//apple_ref/doc/uid/TP40009541-CH4-SW4)很好的解释了这个过程。如果 view 告诉 iOS 它没有被点击，那它的子视图就不会被检查。

这就会产生一个有趣的事情。当一个正常显示（父视图的 `clipsToBounds` 被设置为 `false` 时）的按钮位于父视图边界外时，该按钮不会接收到任何的触摸事件。因此，当一个按钮不能响应事件时，记得检查一下该按钮是否有在父视图的边界内。

## Target-Action

Target-Action 机制通过设置 `target` 为 `nil`来使用响应链。事件触发时，iOS 会询问第一响应者是否要处理传递过来的 action。如果不处理的话，第一响应者就会把该 action 传递给下一个响应者（[苹果官方文档 `nextResponder` ](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIResponder_Class/index.html#//apple_ref/occ/instm/UIResponder/nextResponder)）。

## 举个例子

让我们来举个例子吧。我们的 view controller 中有一个 view ，里面有一个 button 和一个 label 。我们可以在 `viewDidLoad` 中把 view controller 设置为 `target` 来相应按钮的点击事件，像这样 `subview.button.addTarget(self, action: "onButtonTap:", forControlEvents: .TouchUpInside)` 。但是，我们也可以把 `target` 设置为 `nil`，然后就可以使用响应链了。以下是初始化并添加 button 和 label 的代码：

    
    class ViewWithButtonAndLabel: UIView {
    
        let button: UIButton
        let label: UILabel
    
        override init(frame: CGRect) {
            label = UILabel()
            label.textAlignment = .Center
            label.text = "Touch the button"
    
            button = UIButton(type: .System)
            button.setTitle("The Button", forState: .Normal)
            button.addTarget(nil, action: "onButtonTap:", forControlEvents: .TouchUpInside)
    
            let stackView = UIStackView(arrangedSubviews: [label, button])
            stackView.translatesAutoresizingMaskIntoConstraints = false
            stackView.axis = .Vertical
    
            super.init(frame: frame)
    
            backgroundColor = .yellowColor()
    
            addSubview(stackView)
    
            stackView.centerXAnchor.constraintEqualToAnchor(centerXAnchor).active = true
            stackView.centerYAnchor.constraintEqualToAnchor(centerYAnchor).active = true
        }
    
        required init?(coder aDecoder: NSCoder) {
            fatalError("init(coder:) has not been implemented")
        }
    
    }

`button.addTarget(nil, action: "onButtonTap:", forControlEvents: .TouchUpInside)` 这行代码中，将按钮的 `target` 设置为 `nil` 。如之前描述的那样，这就意味着 action 会沿着响应链向下传递，直到一个响应者对象处理该 action 为止。

以下是 view controller 的部分代码：

    
    class ViewController: UIViewController {
    
        let viewWithButtonAndLabel = ViewWithButtonAndLabel()
    
        override func viewDidLoad() {
            super.viewDidLoad()
    
            view.backgroundColor = .whiteColor()
    
            view.addSubview(viewWithButtonAndLabel)
    
            viewWithButtonAndLabel.translatesAutoresizingMaskIntoConstraints = false
    
            let views = ["subView": viewWithButtonAndLabel]
            var layoutConstraints = [NSLayoutConstraint]()
            layoutConstraints += NSLayoutConstraint.constraintsWithVisualFormat("|-20-[subView]-20-|", options: [], metrics: nil, views: views)
            layoutConstraints += NSLayoutConstraint.constraintsWithVisualFormat("V:|-20-[subView]-20-|", options: [], metrics: nil, views: views)
            NSLayoutConstraint.activateConstraints(layoutConstraints)
    
        }
    
        func onButtonTap(sender: UIButton) {
            viewWithButtonAndLabel.label.text = viewWithButtonAndLabel.label.text == "Yeah!" ? "Touch the button" : "Yeah!"
        }
    }

即使我们没有明确的设置 `target` ，当点击按钮的时候，view controller 里的 `onButtonTap(_:)` 也会被调用，因为它是第一响应者，且实现了相应的处理。

你可以去 GitHub 上查看本文的[示例代码](https://github.com/dasdom/ResponderChainDemo)。

## 结论

响应链是你的好朋友，试着去了解它。还要多读文档，学习如何使用响应链，让你的代码更牛。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。