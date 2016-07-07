《重构与模式》Swift 版之参数对象"

> 作者：Natasha The Robot，[原文链接](https://www.natashatherobot.com/parameter-objects/)，原文日期：2016-05-28
> 译者：[Channe](undefined)；校对：[Cee](https://github.com/Cee)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  










我最近在读[《重构与模式》](https://book.douban.com/subject/20393327/) 。昨天（译注：原文日期的昨天），在我写描述了一个拥有多个参数的对象的[《创建方法》](http://swift.gg/2016/06/27/refactoring-to-creation-method/)时，想到了[@modocache](https://twitter.com/modocache)关于[iOS API 设计中的 Swift 模式](https://youtu.be/yu6KND7dJBA?list=PLdr22uU_wISpW6XI1J0S7Lp-X8Km-HaQW)超棒的演讲，尤其是关于**参数对象**部分。我第一次看的时候获益匪浅，因此我希望记录下来。



### 问题

假设你在写一个 BananaUIKit 库，包含了一个简单的 BananaAlertView：

![](https://www.natashatherobot.com/wp-content/uploads/Screen-Shot-2016-05-28-at-5.16.54-AM-250x300.png)

最开始的代码可能想这样：

    
    public class BananaAlertView {
        
        public static func show(
            withTitle title: String,
            message: String,
            dismissButtonText: String)
        {
            // 具体实现
        }
    }

这个实现很好，直到一位使用这个框架的用户请求能够将 BananaAlertView 的颜色由棕色换为黄色...

为了确保更改这个框架不影响其他用户，我们使用 Swift 的默认参数：

    
    public class BananaAlertView {
        
        public static func show(
            withTitle title: String,
            message: String,
            dismissButtonText: String,
            // 新的无痛更改
            tintColor: UIColor = .yellowColor())
        {
            // 具体实现
        }
    }

只要我们给方法添加参数，它就能很好的工作。但是如果我们想要将参数添加到别的东西就不行了，比如 BananaAlertView 上一个按钮被点击后的闭包：

    
    public class BananaAlertView {
        
        // 按钮被点击后的动作
        public typealias ButtonCallback = (buttonIndex: Int) -> Void
        
        public static func show(
            withTitle title: String,
            message: String,
            dismissButtonText: String,
            // 回调参数
            dismissButtonCallback: ButtonCallback)
        {
            // 具体实现
        }
    }
    
    // 用法
    
    BananaAlertView.show(
        withTitle: "This is Bananas",
        message: "Someone has been monkeying around 🙈",
        dismissButtonText: "Banana",
        dismissButtonCallback: { buttonIndex in
            // 具体实现
        })

但是假如我们需要改变闭包的参数呢？假如客户端同样需要按钮的文本呢？

解决方式就是为 ButtonCallback 添加一个按钮文本的参数：

    
    public typealias ButtonCallback = (buttonIndex: Int, buttonTitle: String) -> Void

但是这破坏了一切...当调用 show 方法时，ButtonCallback 方法此时需要两个参数，而不是原来的一个了。

    
    // 用法
    
    BananaAlertView.show(
        withTitle: "This is Bananas",
        message: "Someone has been monkeying around 🙈",
        dismissButtonText: "Banana", 
        // 破坏了原来的调用
        // 闭包需要带有两个参数：buttonIndex 和 buttonText
        dismissButtonCallback: { buttonIndex in
            // 具体实现
        })

于是我们该怎么办？此时参数对象就该上场了！

### 解决方案

解决方案是为闭包创建一个参数对象：

    
    public class BananaAlertView {
        
        // 参数对象
        public struct ButtonCallbackParameters {
            let buttonIndex: Int
            let buttonTitle: String
        }
        
        // 现在只需要一个参数
        public typealias ButtonCallback = (parameters: ButtonCallbackParameters) -> Void
        
        public static func show(
            withTitle title: String,
            message: String,
            dismissButtonText: String,
            dismissButtonCallback: ButtonCallback)
        {
            // 具体实现
        }
    }
    
    BananaAlertView.show(
        withTitle: "This is Bananas",
        message: "Someone has been monkeying around 🙈",
        dismissButtonText: "Banana",
        // 参数对象包含所有调用者需要的参数
        dismissButtonCallback: { parameters in
            if parameters.buttonTitle == "Banana" {
                // 具体处理代码
            }
        })

现在需要添加额外的参数时，代码依旧能工作得非常好。`buttonCallback` 完全不需要变动。

    
     public struct ButtonCallbackParameters {
            let buttonIndex: Int
            let buttonTitle: String
            // 新参数
            let buttonCount: Int
    }

当然，你也可以轻松删除或移除参数：

    
    public struct ButtonCallbackParameters {
            let buttonIndex: Int
            // 下个版本中移除 buttonTitle
            @available(*, deprecated=2.0)
            let buttonTitle: String
            let buttonCount: Int
    }

### 其他用法

当然，可以重构方法时用更通用的方式来获得越来越多的参数：

    
    public class BananaAlertView {
        
        // 显示警告视图时，视图选项不是必须的
        // 这里能够提供默认值
        public struct AlertViewOptions {
            public let dismissButtonText = "Bananana"
            public let tintColor = UIColor.yellowColor()
            public let animationDuration: NSTimeInterval = 1
        }
        
        public static func show(
            withTitle title: String,
            message: String,
            options: AlertViewOptions)
        {
            // 具体实现
        }
    }

### 权衡

和其他设计模式一样，学会和用好完全是两件事，知道它们是好事，但是在使用前需要权衡一下。找到最佳的平衡点是我们码农的工作，需要不断努力才能找到最佳实践🙅。

对于参数对象来说，好处是能够为未来预留 API，但是这样的预留是有负担的。你不能为此给每个方法和闭包都新建一个新结构体。

所以，请明智的使用！

最后，我强烈推荐观看 [@modocache 演讲](https://youtu.be/yu6KND7dJBA?list=PLdr22uU_wISpW6XI1J0S7Lp-X8Km-HaQW)的完整视频。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。