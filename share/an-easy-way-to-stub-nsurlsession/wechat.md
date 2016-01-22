如何简单地模拟 NSURLSeesion 的返回数据"

> 作者：dom，[原文链接](http://swiftandpainless.com/an-easy-way-to-stub-nsurlsession/)，原文日期：2016/01/09
> 译者：[小袋子](http://daizi.me)；校对：[千叶知风](http://weibo.com/xiaoxxiao)；定稿：[numbbbbb](https://github.com/numbbbbb)
  









如果你经常看我的博客，那应该知道，我在调试时最喜欢的方法是模拟 `NSURLSeesion` 返回的数据。

那么我们到底要做什么呢？其实就是模拟方法的回调数据。而这里的 `NSURLSession` 指的是伪造 web API 的响应。这样做有一些好处，例如：

1. 我们不需要可用的 web API 就能开发应用程序的网络请求。
2. 瞬时响应，反馈周期更短。
3. 测试程序能在没有连接网络的电脑上运行。



一般来说会使用 `NSURLProtocol` 来模拟 `NSURLSession` 的请求返回数据。具体的用例请查看 [OHHTTPStubs](https://github.com/AliSoftware/OHHTTPStubs) 和 [Mockingjay](https://github.com/kylef/Mockingjay)。使用 `NSURLProtocol` 的优势在于，当你使用诸如 [Alamofire](https://github.com/Alamofire/Alamofire) 这样的网络请求库时，也能正常模拟数据回调。这种方法很棒，但是对我来说有点复杂，为了实现目标，我不得不学习和理解这些代码。

### 一个简单的解决方案

我准备用 `NSURLSession` 实现网络请求。下面介绍如何伪造请求返回数据。

为了让它看起来更简单，我已经写了一个 `NSURLSession` 的替换类和一个协议。完整代码如下所示：

    import Foundation
    
    public protocol DHURLSession {
      func dataTaskWithURL(url: NSURL,
        completionHandler: (NSData?, NSURLResponse?, NSError?) -> Void) -> NSURLSessionDataTask
      func dataTaskWithRequest(request: NSURLRequest,
        completionHandler: (NSData?, NSURLResponse?, NSError?) -> Void) -> NSURLSessionDataTask
    }
    
    extension NSURLSession: DHURLSession { }
    
    public final class URLSessionMock : DHURLSession {
      
      var url: NSURL?
      var request: NSURLRequest?
      private let dataTaskMock: URLSessionDataTaskMock
      
      public init(data: NSData?, response: NSURLResponse?, error: NSError?) {
        dataTaskMock = URLSessionDataTaskMock()
        dataTaskMock.taskResponse = (data, response, error)
      }
      
      public func dataTaskWithURL(url: NSURL,
        completionHandler: (NSData?, NSURLResponse?, NSError?) -> Void) -> NSURLSessionDataTask {
          self.url = url
          self.dataTaskMock.completionHandler = completionHandler
          return self.dataTaskMock
      }
      
      public func dataTaskWithRequest(request: NSURLRequest,
        completionHandler: (NSData?, NSURLResponse?, NSError?) -> Void) -> NSURLSessionDataTask {
          self.request = request
          self.dataTaskMock.completionHandler = completionHandler
          return self.dataTaskMock
      }
      
      final private class URLSessionDataTaskMock : NSURLSessionDataTask {
        
        typealias CompletionHandler = (NSData!, NSURLResponse!, NSError!) -> Void
        var completionHandler: CompletionHandler?
        var taskResponse: (NSData?, NSURLResponse?, NSError?)?
        
        override func resume() {
          completionHandler?(taskResponse?.0, taskResponse?.1, taskResponse?.2)
        }
      }
    }

如上，用来伪造数据的完整代码只有 47 行，并且清晰易懂。既没有 swizzling，也没有复杂的方法。是不是很棒!

### 使用

为了能够在测试中使用 `NSURLSession` 替换类，我们需要在代码中注入依赖。一种可能的方式是使用一个延迟加载属性：

    lazy var session: DHURLSession = NSURLSession.sharedSession()

测试代码如下：

    func testFetchingProfile_ReturnsPopulatedUser() {
      // Arrage
      let responseString = "{\"login\": \"dasdom\", \"id\": 1234567}"
      let responseData = responseString.dataUsingEncoding(NSUTF8StringEncoding)!
      let sessionMock = URLSessionMock(data: responseData, response: nil, error: nil)
      let apiClient = APIClient()
      apiClient.session = sessionMock
      
      // Act
      apiClient.fetchProfileWithName("dasdom")
      
      // Assert
      let user = apiClient.user
      let expectedUser = User(name: "dasdom", id: 1234567)
      XCTAssertEqual(user, expectedUser)
    }

我很喜欢这个解决方案，只要花几分钟时间阅读五十多行代码就能理解替换类，并且没有涉及到 `NSURLProtocol` 和 `swizzling`。

这个 `NSURLSession` 的替换类在 [github](https://github.com/dasdom/DHURLSessionStub) 上，并且也可以通过 CocoaPods 下载。

欢迎提出你的看法！
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。