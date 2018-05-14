使非法状态不可表示"

> 作者：Ole Begemann，[原文链接](https://oleb.net/blog/2018/03/making-illegal-states-unrepresentable/)，原文日期：2018-03-27
> 译者：[小袋子](http://daizi.me)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[CMB](https://github.com/chenmingbiao)
  









> 你知道 `URLSession` 能同时返回响应和错误吗？

[我之前介绍过](https://oleb.net/blog/2015/07/swift-type-system/)，Swift 强类型系统的一个主要优点是天生具备编译器强制遵循的文档规范。

## 类型是编译器强制遵循的文档规范

类型为函数的行为设立了一种“界限”，因此一个易用的 API 应该精心选择输入输出类型。



仔细思考以下 Swift 函数声明：

    
    func / (dividend: Int, divisor: Int) -> Int

在不阅读任何函数实现的情况下，你就可以推断出这应该是[整型除法](http://mathworld.wolfram.com/IntegerDivision.html)，因为返回的类型不可能是小数。相较之下，如果函数的返回类型是既可以表示整型，也可以表示浮点型数值的 [`NSNumber`](https://developer.apple.com/documentation/foundation/nsnumber)，那你就只能祈祷开发者自觉遵循文档只返回整数。

随着类型系统的表现越来越好，这种使用类型来记录函数行为的技巧变得越来越有用。如果 `Swift` 有一个[`NonZeroInt` 类型](#quote1)代表 “除了 `0` 之外的整型” ，那么除法函数可能就会变成下面这样：

    
    func / (dividend: Int, divisor: NonZeroInt) -> Int

类型检查不允许传入的除数为 `0` ，因此你不用关心函数如何处理除数为 `0` 的错误。函数会中断吗？会返回一个没有意义的值吗？如果你用的是上一种定义，就必须在文档里单独说明特殊情况的处理方式。

## 使非法状态成为不可能

我们可以把这个观点转换为一条通用规则：**使用类型让你的程序无法表现非法状态**。

如果你想学习更多相关知识，可以看看 Brandon Williams 和 Stephen Celis 的最新视频系列 [Point-Free](https://www.pointfree.co/)。他们讲了很多这方面的知识和相关话题，前八集真的特别棒，我强烈推荐大家去订阅，你会学到很多东西。

在[第四集](https://www.pointfree.co/episodes/ep4-algebraic-data-types)关于代数数据类型（[algebraic data types](https://en.wikipedia.org/wiki/Algebraic_data_type)）的视频中，Brandon 和 Stephen 讨论了如何组合 `enums` 和 `structs`（或者 `tuples`）来精确表示期望状态的类型，并且让所有非法状态无法表示。在视频的最后，他们用 Apple 的 [URLSession](https://developer.apple.com/documentation/foundation/urlsession) API 作为反面教材进行介绍，因为这个 API 没有使用最合适的类型，这就引出了本文的子标题——“你知道 URLSession 能同时返回响应和错误吗？”。

## URLSession

Swift 的类型系统比 Objective-C 更富有表现力。然而，很多 Apple 自己的 API 也没有利用这个优势，可能是因为没空更新老旧的 API，或者是为了维持 Objective-C 的兼容性。

在 iOS 中发起一个[网络请求](https://developer.apple.com/documentation/foundation/urlsession/1410330-datatask)的通用方法：

    
    class URLSession {
        func dataTask(with url: URL,
            completionHandler: @escaping (Data?, URLResponse?, Error?) -> Void)
            -> URLSessionDataTask
    }

回调函数的参数是三个可选值：[`Data?`](https://developer.apple.com/documentation/foundation/data)，[`URLResponse?`](https://developer.apple.com/documentation/foundation/urlresponse) 和 [`Error?`](https://developer.apple.com/documentation/swift/error)。这将产生 `2 × 2 × 2 = 8` 种[可能的状态](#quote2)，但是其中有多少种是合法的呢？

引述 [Brandon 和 Stephen](https://www.pointfree.co/episodes/ep4-algebraic-data-types) 的观点：“这里有很多状态毫无意义”。有些组合很明显没有意义，另外我们基本可以确定，这三个值不可能全为 `nil` 或全为非 `nil`。

## 响应和错误能够同时非 `nil`

其他状态就很棘手了，在这里 Brandon 和 Stephen 犯了一点小错误：他们认为 API 要么返回一个有效的 `Data` 和 `URLResponse`，要么返回一个 `Error`。毕竟接口不可能同时返回一个非 `nil` 的响应和错误。看起来很有道理，对不对？

但事实上这是错误的。`URLResponse` 封装了服务器的 [HTTP 响应头部](https://www.w3.org/Protocols/rfc2616/rfc2616-sec6.html)，只要接收到一个有效的响应头部， `URLSession` API 就会一直给你提供这个值，无论后续的阶段请求是否出错（例如取消和超时)。因而 API 的完成处理中有可能包含一个有效的 `URLResponse` 和非 `nil` 的错误值（但是没有 `Data`）。

如果你对 `URLSession` 代理（delegate）API 比较熟悉的话，应该不会太惊讶，因为代理方法就是分成 [`didReceiveResponse`](https://developer.apple.com/documentation/foundation/urlsessiondatadelegate/1410027-urlsession) 和 [`didReceiveData`](https://developer.apple.com/documentation/foundation/urlsessiondatadelegate/1411528-urlsession)。实际上，[`dataTask​(with:​completionHandler:)`的文档](https://developer.apple.com/documentation/foundation/urlsession/1410330-datatask)也提到了这个问题：

> 如果收到服务器的响应，那么**无论请求成功或失败**，响应参数都会有值。

不过，我敢打赌 Cocoa 开发人员普遍对此抱有误解。仅仅在过去的四周，我就看到[两](https://davedelong.com/blog/2018/03/02/apple-networking-feedback/)篇[文章](https://ruiper.es/2018/03/03/ras-s2e1/)的作者犯了同样的错误（至少没有领悟其中的真谛）。

说真的，我很喜欢这个充满讽刺意味的事实：Brandon 和 Stephen 试图指出由于类型问题导致的 API 缺陷，但在指出错误的同时，这个类型问题又让他们犯了另一个错误。如果原始 API 使用了更好的类型，那么这两个错误就都能避免，这反而证明了他们的观点：一个有更加严格类型的 API 能够避免错误使用。

## 示例代码

如果你想自己体验一下 `URLSession` 的功能，你可以复制以下代码到 Swift playground：

    
    import Foundation
    import PlaygroundSupport
    
    // 如果返回 404，把 URL 换成随便一个大文件
    let bigFile = URL(string: "https://speed.hetzner.de/1GB.bin")!
    
    let task = URLSession.shared.dataTask(with: bigFile) { (data, response, error) in
        print("data:", data as Any)
        print("response:", response as Any)
        print("error:", error as Any)
    }
    
    task.resume()
    
    // 过几秒之后取消下载
    DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
        task.cancel()
    }
    
    PlaygroundPage.current.needsIndefiniteExecution = true

这段代码首先下载一个大文件，然后在几秒后取消。最后，完成的处理中返回了一个非 `nil` 的响应和错误。

（这里假设指定的时间间隔内，能够获取到服务器响应的头部，但不能完成下载。如果你的网速非常慢或者非常变态，请自行调整这个时间参数）

## 正确的类型应该是什么？

Brandon 和 Stephen 随后在 [Point-Free 的第九集视频](https://www.pointfree.co/episodes/ep9-algebraic-data-types-exponents)中发布了他们对问题的跟进。他们认为“正确”的参数类型应该是：

    
    (URLResponse?, Result<Data, Error>)

我不同意，因为如果有数据，就一定有响应，不可能只有数据没有响应。我认为应该是这样的：

    
    Result<(Data, URLResponse), (Error, URLResponse?)>

解读：你将要么得到数据和响应（后者肯定不是 `nil`），要么得到一个错误和一个可选类型的响应。不可否认，我的建议与一般的 `Result` 类型定义相悖，因为它将失败参数约束为不能符合 `Error` 的 [Error](https://developer.apple.com/documentation/swift/error) 协议—`(Error, URLResponse?) `。目前 [Swift 论坛正在讨论](https://forums.swift.org/t/adding-result-to-the-standard-library/6932/58) `Error` 约束是否有必要。

## `Result` 类型
 
由于 `URLResponse` 参数的非直观行为，`URLSession` 的API 显得特别棘手。但是 Apple 几乎所有的基于回调的异步 API 都有相同的问题，它们所提供的类型使得非法状态可以表示。

如何解决这个问题呢？

Swift 的通用方案是定义一个 [Result 类型](https://github.com/antitypical/Result/blob/03fba33a0a8b75492480b9b2e458e88651525a2a/Result/Result.swift)—一个可以代表通用成功值或错误的枚举。最近，又有人试图将 [Result 添加到标准库](https://forums.swift.org/t/adding-result-to-the-standard-library/6932/20)。


如果 Swift 5 添加了 `Result`（大胆假设），Apple 可能（更大胆的假设）会自动导入类似这样 `completionHandler: (A?, Error?) -> Void as (Result<A>) -> Void` 的 Cocoa API，将四个可表现的状态转为两个。在那之前（如果真的会发生的话），我建议你还是先自己[实现转换](https://oleb.net/blog/2017/01/result-init-helper/)。

长远来看，Swift 终有一天能从语言层面正确支持异步 API。社区和 Swift 团队可能会提出新的解决方案，[把现有的 Cocoa API 移植到新系统中](https://gist.github.com/lattner/429b9070918248274f25b714dcfc7619#conversion-of-imported-objective-c-apis)，就像把 Objective-C 的 `NSError **` 参数作为抛出（throwing）函数引入 Swift 一样。不过不要太过期待，Swift 6 之前肯定实现不了。

----------

<span id="quote1">
1、你可以自己定义一个 `NonZeroInt` 类型，但是没有办法告诉编译器“如果有人尝试用零去初始化这个类型，就引发一个错误”。你必须依赖运行时检查。

不过，引入这样的类型通常是个不错的想法，因为类型的用户可以在初始化之后依赖于所声明的不变性。我还没有在其他地方看到一个 `NonZeroInt` 类型，保证类型为非空集合的自定义类型更受欢迎。
</span>

<span id="quote2">
2、我只是把“`nil`”或“非`nil`”作为可能的状态。显然，非 `nil` 数据值可以具有无数种可能的状态，并且对于其他两个参数也是如此。但是这些状态对我们来说并不好玩。
</span>
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。