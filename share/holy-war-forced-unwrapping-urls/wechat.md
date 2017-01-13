URL 强制解包带来的问题"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2017/01/06/holy-war-forced-unwrapping-urls/)，原文日期：2017-01-06
> 译者：[星夜暮晨](http://www.jianshu.com/users/ef1058d2d851)；校对：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；定稿：[CMB](https://github.com/chenmingbiao)
  









让我先阐述一下撰写这篇文章的背景。[Laptopmini](https://github.com/Laptopmini) 想要知道为什么下面这段代码无法完成编译。诚然，Swift 的错误提示尚存有改进的余地。简而言之：他需要将第二行和第三行代码进行互换，才能够完成编译。这就需要让这两个属性在引用 `self` 之前，完成初始化操作。



![](http://ericasadun.com/wp-content/uploads/2017/01/rq6ZVbB.png)

我很快将目光放在了这些感叹号上。「是否存在会导致 URL 构建失败的情况呢？如果有，为什么不去阻止这些潜在的崩溃发生呢？」Laptop 指出：他的 URL 在任何情况下都不会发生异常，因此在这里使用感叹号进行强制解包是非常安全的。

除此之外，他的这种做法也让我的代码洁癖发作了。无论如何，URL 都不应该在这个构造器当中创建。我在想应该有更好的方法来进行处理，也就是将 URL 的构造从构造器当中移出，并且辅以完好的错误处理，以便获得更佳的错误消息提示。

首先，对 `URL` 进行扩展，以提供一个更为安全的非空构造器 (non-optional initializer)。以下代码片段提供了「安全着陆」的功效，当某个字符串无法构造成 URL 的时候，提供有用的反馈信息。

    
    extension URL {
        /// 非空构造器能够提供更好的错误输出
        public init(safeString string: String) {
            guard let instance = URL(string: string) else {
                fatalError("Unconstructable URL: \(string)")
            }
            self = instance
        }
    }

不过对这个问题而言，似乎有点小题大做。因此，我推荐使用这种方案：在 `SocketEndPoint` 类型当中添加相同的方法。

    
    // 返回 `URL`，同时也可以明确指出错误
    public enum SocketEndPoint: String {
        case events = "http://nowhere.com/events"
        case live = "http://nowhere.com/live"
        
        public var url: URL {
            guard let url = URL(string: self.rawValue) else {
                fatalError("Unconstructable URL: \(self.rawValue)")
            }
            return url
        }
    }

这种方法使得他的初始化方法更加简洁明了。基于这种新的设计，我们在构造器当中使用标准化的 URL，不再使用强制解包。

    
    // 改造过的构造器
    fileprivate init() {
        self.eventSocket = WebSocket(url: SocketEndPoint.events.url))
        self.liveSocket = WebSocket(url: SocketEndPoint.live.url))
        self.eventSocket.delegate = self
        self.liveSocket.delegate = self
    }

总而言之：

* 字符串枚举的确很方便，但是 `SocketEndPoint` 却没有做好它自己的职责。它的工作应该是提供合法的 URL。无论类型实现的方式如何，它都应该提供这样的功能。物尽其用，既然在语言内部存在一个「差不多」的解决方案，何乐而不为呢？
* 让构造器保持干净和整洁；
* 在权衡通用的全局解决方案和简单的本地解决方案的时候，有些时候最好从简单的方案着手，尽量在紧邻的上下文之间就解决好相关的问题。
* 我觉得使用正常的 URL 构造器（返回有可空值），然后再创建一个带有隐式可空值解包（`public init(url: URL!)`）的 `WebSocket` 构造器并没有带来任何好处，当字符串的结构出现异常的时候，就没有办法报告这个错误。此外，还十分地丑陋。

您可以在[这个 gist](https://gist.github.com/erica/d300f8dac3baa7d40aadd18bd1902172) 当中看到我所提及的这几种方法。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。