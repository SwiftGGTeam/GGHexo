title: "请求行为"
date: 2017-02-16
tags: [Swift 进阶]
categories: [KHANLOU]
permalink: request-behaviors
keywords: 
custom_title: 
description: 

---
原文链接=http://khanlou.com/2017/01/request-behaviors/
作者=Soroush Khanlou
原文日期=2017-01-04
译者=Cwift
校对=walkingway
定稿=CMB

<!--此处开始正文-->

当触发网络请求时，通常会引发许多副作用。然而，副作用对于系统的可测试性来说就是一剂毒药，并且可能会因应用程序和请求的不同而出现差异性。如果我们创建一个系统用来容纳这些副作用的组合，就可以提高系统的可测试性和其他特性。

<!--more-->

想象一个非常简单的网络客户端：

```swift
final class NetworkClient {

    let session: URLSession
	
    init(session: URLSession = URLSession.shared) {
        self.session = session
    }

    func send<Output: JSONInitializable>(request: Request<Output>) -> Promise<Output> {
        let urlRequest = RequestBuilder(request: request).urlRequest
        return session.data(with: urlRequest)
            .then({ data, response in
                let json = try JSONSerialization.jsonObject(with: data)
                return Output(json: json)
            })
      }
}
```

这个类封装了一个 `URLSession`。它有一个 `send` 方法，该方法接受一个 `Request` 对象，`Request` 中有一个遵守 `JSONInitializable` 协议的抽象关联类型 `Output`。`send` 方法返回一个具有相同关联类型 `Output` 的 promise。在 `send` 方法的正文中，通过 `RequestBuilder` 类型构建 `URLRequest`，通过 URL 会话发送请求。从网络请求返回的数据将被解析为 JSON，然后组装成 Swift 原生的模型，该模型作为返回的 promise 内部的值。 

这个网络客户端被大大简化了（即我省略了一些与可选型相关的处理），但是我想要的代码基本齐全。

这个类现在很不错。它是个简单对象，不接触任何全局对象（省去了网络配置，通过一个 `URLSession` 来通信），并且很容易测试。我们可以把 `URLSession` 封装在协议中，然后注入到 `NetworkClient` 的构造器中，在测试中模拟它的行为，测试从 JSON 响应中构造对象的逻辑。一段可测试的网络请求代码！

这个类当前的问题是，虽然它可以胜任很多任务，但仍有很多任务无法完成。举个例子，我们可能想要它具备如下功能：

* 应用程序注册后台任务，使得网络请求可以在用户按下主页按钮之后保持工作。
* 显示和隐藏应用程序的网络活动指示器。
* 使用某些 API 添加与授权相关的特殊头字段。

我们可以把以上的所有东西都添加到 `NetworkClient` 类中，但是每一条都涉及到一些全局的状态或者单例。第一条需要访问 `UIApplication` 单例，第二条需要一个共享的计数器，第三条需要某种形式的持久化操作以实现对授权令牌（token）的跟踪。

如果我们添加了所有这些全局变量并满足各种特殊情况，测试这个对象会变得困难重重。因为我们必须分别模拟和注入这些全局变量，这会增加测试的复杂度。

以上的三种行为希望遍布在每个网络请求中，但是网络请求总会有某些特定的行为，并且理想状态下这些行为应该可重用。例如，许多（但不是全部）请求需要错误处理，以便让用户知道他们所做的一些操作没有成功。另一些请求需要将东西保存到 Core Data 中，并且我希望隔离网络客户端与 Core Data。虽然我不会专注于请求的特殊行为，不过我会为你展示如何集成它们的代码。

我想要一种方法来从网络客户端解耦这些行为的实现细节，以便可以分别测试客户端的单独行为。

用协议定义一个请求行为：

```swift
protocol RequestBehavior {
	
    var additionalHeaders: [String: String] { get }
			
    func beforeSend()
	
    func afterSuccess(result: Any)
	
    func afterFailure(error: Error)
    
}
```

该协议为每个方法提供了一个平淡无奇的默认实现：

```swift
extension RequestBehavior {
	
    var additionalHeaders: [String: String] {
        return [:]
    }
	
    func beforeSend() {

    }
	
    func afterSuccess(result: Any) {

    }
	
    func afterFailure(error: Error) {

    }
    
}
```

基本思想是每个行为在特定的网络事件发生时获得回调函数，并且可以执行回调中的代码。当我们开发这个功能时，定义两个辅助对象：一个“空”的请求行为，不做任何事情，一个组合了许多请求行为的请求行为。“空”行为继承了协议扩展中的所有实现，“组合”行为存储一个行为数组，并对每个行为调用相关的方法：

```swift
struct EmptyRequestBehavior: RequestBehavior { }

struct CombinedRequestBehavior: RequestBehavior {

    let behaviors: [RequestBehavior]

    var additionalHeaders: [String : String] {
        return behaviors.reduce([String: String](), { sum, behavior in
            return sum.merged(with: behavior.additionalHeaders)
        })
    }
	
    func beforeSend() {
        behaviors.forEach({ $0.beforeSend() })
    }

    func afterSuccess(result: Any) {
        behaviors.forEach({ $0.afterSuccess(result: result) })
    }

    func afterFailure(error: Error) {
        behaviors.forEach({ $0.afterFailure(error: error) })
    }
}
```

这些代码看起来很抽象，不过我们很快就会用到了。

接下来，我们需要修改网络客户端，在正确的时间调用请求行为中的方法。

```swift
final class NetworkClient {

    let session: URLSession
    
    let defaultRequestBehavior: RequestBehavior
	
    init(session: URLSession = URLSession.shared, defaultRequestBehavior: RequestBehavior = EmptyRequestBehavior()) {
        self.session = session
        self.defaultRequestBehavior = defaultRequestBehavior
    }

    func send<Output: JSONInitializable>(request: Request<Output>, behavior: RequestBehavior = EmptyRequestBehavior()) -> Promise<Output> {
        let combinedBehavior = CombinedRequestBehavior(behaviors: [behavior, defaultRequestBehavior])
        let urlRequest = RequestBuilder(request: request, behavior: combinedBehavior).urlRequest
        combinedBehavior.beforeSend()
        return session.data(with: urlRequest)
            .then({ data, response in
                let json = try JSONSerialization.jsonObject(with: data)
                let result = try Output(json: json)
                combinedBehavior.afterSuccess(result: result)
                return result
            })
            .catch({ error in
                combinedBehavior.afterFailure(error: error)
            })
    }
}
```

客户端的 `defaultRequestBehavior` 属性以及代表特殊行为的 `client` 默认值都是一个新建的 `EmptyRequestBehavior` 对象，这样你可以选择性地添加它们。我们的网络客户端结合了单个请求的行为和整个客户端的行为。它把请求行为传递给了 `RequestBuilder`，所以可以使用 `additionalHeaders`，然后在合适的时机调用 `beforeSend`、`afterSuccess` 以及 `afterFailure`。

通过这种请求和副作用的简单分离，现在我们可以向客户端中添加单独的行为并进行测试。因为这些行为本身也是对象，所以很容易实例化以及测试。

让我们来看看上面提到的那几种行为。首先，为每个网络请求注册后台任务：

```swift
final class BackgroundTaskBehavior: RequestBehavior {

    private let application = UIApplication.shared

    private var identifier: UIBackgroundTaskIdentifier?

    func beforeSend() {
        identifier = application.beginBackgroundTask(expirationHandler: {
            self.endBackgroundTask()
        })
    }

    func afterSuccess(response: AnyResponse) {
        endBackgroundTask()
    }

    func afterFailure(error: Error) {
        endBackgroundTask()
    }

    private func endBackgroundTask() {
        if let identifier = identifier {
            application.endBackgroundTask(identifier)
            self.identifier = nil
        }
    }
}
```

虽然这些后台任务通常只在应用关闭的时候注册并且只注册一个，不过你也可以在任意时间注册任意数量的后台任务。因为这种行为需要维护状态，所以特别适合单独整合成一个对象，是主要的候选请求行为之一。测试这个行为的时候要把 `UIApplication` 包装在协议中，将其注入到构造器中，并且通过模拟的手段保证在正确的时间进行正确的方法调用。

接下来，让我们来看看网络活动指示器：

```swift
class ActivityIndicatorState {

    static let shared = ActivityIndicatorState()
    
    let application = UIApplication.shared
    
    var counter = 0 {
        didSet {
            application.isNetworkActivityIndicatorVisible = NetworkActivityBehavior.counter == 0
        }
    }
}

class NetworkActivityIndicatorBehavior: RequestBehavior {
    
    let state = ActivityIndicatorState.shared

    func beforeSend() {
        state.counter += 1
    }

    func afterFailure(error: Error) {
        state.counter -= 1
    }

    func afterSuccess(response: AnyResponse) {
        state.counter -= 1
    }

}
```

这种行为是另一种通常来说不可测试的行为。现在它不再被嵌入到 `NetworkClient` 中，而是被分成了两个对象，这使得它变得可以被测试。将应用程序的单例注入到 `ActivityIndicatorState` 中，你可以更改计数值来测试网络活动指示器的显示是否正常。注入一个 `ActivityIndicatorState`（依旧包裹在一个协议中，传递给构造器），你可以测试 `counter` 的增减是否正常。

最后，来看看如何把授权令牌的全局状态加入到请求行为中。

```swift
struct AuthTokenHeaderBehavior: RequestBehavior {

    let userDefaults = UserDefaults.standard

    var additionalHeaders: [String : String] {
        if let token = userDefaults.string(forKey: "authToken") {
	        return ["X-Auth-Token": token]
	     }
        return [:]
    }
    
}
```

这个行为很简单，我不打算测试它了，不过还是要说一句：以前很难测试的东西现在变得很容易测试了。注入了基础的 `UserDefaults` 对象（惊喜连连，它再一次被封装进了协议中），可以测试返回的头字典是否正确。另外还可以测试字典的简直不存在的情况，你已经在代码中处理过了。

想要在一个 iOS 应用中访问网络客户端，通常需要一个全局的访问器。因为这个客户端需要执行很多初始化操作，我可能把它放在一个立即执行的闭包中：

```swift
enum SharedNetworkClient {
    static let main: NetworkClient = {
        let behavior = CombinationRequestBehavior(behaviors: [
            AuthTokenHeaderBehavior(),
            NetworkActivityBehavior(),
            BackgroundTaskBehavior(),
            ])
        return NetworkClient(behavior: behavior)
    }()
}
```

我开始把单例定义在它自己的命名空间（称做 SharedX），而不像之前那样定义在类型中，这样可以提示我单例仅仅是对象，必须像其他对象一样成为可测试的对象和良好的公民。

最后几点：网络库 [`Moya`](https://github.com/Moya/Moya) 有一个类似这样的功能称为[“插件”](https://github.com/Moya/Moya/blob/master/docs/Plugins.md)。虽然我的实现不同，但是想法是类似的。Moya 的插件仅仅基于每个客户端操作，为每一个请求添加行为对于执行一些副作用也是很有用的，例如使用持久化或缓存保存信息，或者展示错误信息。

你会发现你随时都有可能要添加其他的方法到请求行为中。这里我简写如下：

```swift
func modify(request: URLRequest) -> URLRequest
```

此函数允许你以任何想要的方式修改 `URLRequest`，甚至返回完全不同的 URLRequest（如果需要）。这显然是一个强大和危险的行为，但是对于一些要求，它是有用的，甚至必要的。

网络的代码通常很难以维护，因为它触及到一些固有的全局资源，这些资源本就是难以测试的单例。请求行为有效地分离了发送网络请求的行为以及需要在请求中处理的副作用。这个小小的抽象简化了网络代码，增加了每个请求行为的复用性，并大大提高了可测试性。