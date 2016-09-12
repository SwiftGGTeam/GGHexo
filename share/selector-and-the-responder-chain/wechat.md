#selector() 和响应链"

> 作者：Dominik Hauser，[原文链接](http://swiftandpainless.com/selector-and-the-responder-chain/)，原文日期：2016-04-10
> 译者：[Lanford3_3](http://lanfordcai.github.io)；校对：[Channe](http://www.jianshu.com/users/7a07113a6597/latest_articles)；定稿：[Cee](https://github.com/Cee)
  









因为 Swift 2.2 中 selector 的新语法，我用在「[在 Target-Action 中使用响应链](http://swift.gg/2016/01/06/utilize-the-responder-chain-for-target-action/)」中的方法产生了一个警告，让我们来修正它。



### 总管协议

首先我们加入一个协议：

    
    @objc protocol DetailShowable {
        @objc func showDetail()
    }

之后，我们可以给 `Selector` 添加一个 extension，就像 [Andyy Hope](https://twitter.com/AndyyHope) 在他的[这篇🐂文](https://medium.com/swift-programming/swift-selector-syntax-sugar-81c8a8b10df3#.6gteb7p1s)中提到的那样，这个 extension 就长这样：

    
    private extension Selector {
        static let showDetail = #selector(DetailShowable.showDetail)
    }

现在把 action 添加到响应链中就变得 so easy 了，就像这样：

    
    button.addTarget(nil, 
                     action: .showDetail,
                     forControlEvents: .TouchUpInside)

最后，我们需要让响应链中的一些响应者对象遵循 `DetailShowable` 协议。

你可以在 [github](https://github.com/dasdom/SelectorSyntaxSugar) 上找到这些代码。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。