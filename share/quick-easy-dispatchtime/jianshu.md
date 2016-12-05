快捷之道：轻松地使用 DispatchTime"

> 作者：Russ Bishop，[原文链接](http://www.russbishop.net/quick-easy-dispatchtime)，原文日期：2016-11-10
> 译者：[Cwift](http://weibo.com/277195544)；校对：[walkingway](http://chengway.in/)；定稿：[CMB](https://github.com/chenmingbiao)
  









这是篇拆开即食的福利小短文。我发现 `DispatchTime` 使用起来没有想象中便利。在一款 GUI 的应用中，我总是想要指定一个 `TimeInterval`，也就是以秒为单位的整数或者分数形式。



值得庆幸的的是 Swift 的扩展可以帮助实现我们的愿望：

    
    extension DispatchTime: ExpressibleByIntegerLiteral {
        public init(integerLiteral value: Int) {
            self = DispatchTime.now() + .seconds(value)
        }
    }
    
    extension DispatchTime: ExpressibleByFloatLiteral {
        public init(floatLiteral value: Double) {
            self = DispatchTime.now() + .milliseconds(Int(value * 1000))
        }
    }

现在我可以按照上帝的旨意来使用异步派发了：

    
    DispatchQueue.main.asyncAfter(deadline: 5) { /* ... */ } 
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。