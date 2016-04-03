iOS：如何用 Swift 实现弱代理"

> 作者：Natasha，[原文链接](https://www.natashatherobot.com/ios-weak-delegates-swift/)，原文日期：2015-12-23
> 译者：[lfb_CD](http://weibo.com/lfbWb)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[Cee](https://github.com/Cee)
  










有一个常见的场景：一个 ViewController 控制多个 View ，并且想在 ViewController 中代理 View 的一些逻辑。

例如，你有一个 View，其中包含一个按钮（比如在表单中的「注册」），并且当用户点击这个注册按钮时，你希望代理其中的逻辑（比如注册验证和调用 API）。


你的代码应该会是这样的：

    
    // 代理点击的协议
    protocol ButtonDelegate {
        func onButtonTap(sender: UIButton)
    }
    
    class ViewWithTextAndButton: UIView {
    
        // 保存代理，后面使用
        var delegate: ButtonDelegate?
    
        func onButtonTap(sender: UIButton) {
            // 按钮被点击的时候调用代理
            delegate?.onButtonTap(sender)
        }
    }
    
    class MyViewController: UIViewController, ButtonDelegate {
    
        let viewWithTextAndButton = ViewWithTextAndButton(frame: CGRect(x: 0, y: 0, width: 100, height: 100))
    
        override func viewDidLoad() {
            super.viewDidLoad()
    
            // 给代理赋值
            viewWithTextAndButton.delegate = self
            view.addSubview(viewWithTextAndButton)
        }
    
        // MARK: ButtonDelegate
        // 实现代理逻辑
        func onButtonTap(sender: UIButton) {
            print("This button was clicked in the subview!")
        }
    
    }



但是这里还有一个很大的问题！因为 View 作为 delegate 对 ViewController 是强引用，同时 ViewController 对 View 也是强引用，这就出现了循环引用。ViewController 引用着 View，并且 View 引用着 ViewController，两者的引用计数都不会变成 0，所以它们都不会被销毁，从而造成内存泄露。

解决办法就是让其中一个对另一个保持弱引用！在 Swift 中怎么做呢？可以添加 **class** 关键字来约束协议，让它只能被引用类型的数据（也就是类）使用：

    
    // 协议只能被类使用！
    protocol ButtonDelegate: class {
        func onButtonTap(sender: UIButton)
    }

接下来，我们可以使得我们的代理被弱引用：

    
    class ViewWithTextAndButton: UIView {
    
        // 注意，现在我们可以使用 weak 关键字！
        // 这个变量只能指向引用类型（UIViewController）
        // 并且是弱引用
        weak var delegate: ButtonDelegate?
    
        func onButtonTap(sender: UIButton) {
            delegate?.onButtonTap(sender)
        }
    }

就是这样！

这个例子很好地说明了为什么应该使用值类型——值类型可以很好的避免循环引用。使用值类型时值会被拷贝，所以不会出现上述的内存泄露问题。不过呢，我们又不得不和包含大量子类（UIView 和 UIViewController 的关系）的 Cocoa 框架打交道，所以你需要约束协议。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。