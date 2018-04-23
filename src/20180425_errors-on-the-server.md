title: "Swift 服务端错误处理"
date: 
tags: 
categories: 
permalink: 
keywords: 
custom_title: 
description: 

---
原文链接=http://khanlou.com/2017/07/errors-on-the-server/
作者=Soroush Khanlou
原文日期=2017/7/6
译者=Cwift
校对=numbbbbb

<!--此处开始正文-->
Swift 的 Promise 可以让代码变得简单、正确并具有良好的语义。Swift 的错误处理系统也不例外，正确使用它可以大大提高服务器端代码质量。我们的应用 [Beacon](https://beacon.party) 使用 [Vapor](https://vapor.codes) 构建 API。Vapor 提供了许多构建 API 的基本组件，但更重要的是，它提供了扩展功能，你可以自己添加错误处理。

错误处理的核心是给每个函数基本都标上 `throws`。你随时可以抛出错误，这个错误会一路冒泡传递上去，一路通过你的路由处理函数和所有中间件。

Vapor 通常会加载一个 HTML 错误页来显示错误。因为 Beacon 的服务端组件是 JSON API，所以我们需要用中间件将 `AbortError`（Vapor 的错误类型，包括消息内容和一个状态码）转换为可用的 JSON。这个中间件的模板非常简单，所以我没怎么写注释：

```swift
public final class JSONErrorMiddleware: Middleware {
    	    
    public func respond(to request: Request, chainingTo next: Responder) throws -> Response {
        do {
            return try next.respond(to: request)
        } catch let error as AbortError {
            let response = Response(status: error.status)
            response.json = try JSON(node: [
                "error": true,
                "message": error.message,
                "code": error.code,
                "metadata": error.metadata,
            ])
            return response
        }
    }
}
```
在 Vapor 1.5 中，你可以把中间件添加到 droplet 中来激活它，droplet 对象就是你的应用。

```swift
droplet.middleware.append(JSONErrorMiddleware())
```

现在我们已经可以显示错误，接下来我们看看如何优化错误信息。大多数时候，当服务器发生错误时，会使用 nil 作为失败时的返回值，表示没取到想要获取的值。所以我们首先来添加一个 `unwrap()` 方法：

```swift
struct NilError: Error { }

extension Optional {
    func unwrap() throws -> Wrapped {
        guard let result = self else { throw NilError() }
        return result
    }
}
```

如果一个请求的返回值为 nil 但是你不想直接返回它，就可以用这个函数让请求直接失败。假设你想使用 `id` 查找某个 `Event`：

```swift
let event = Event.find(id)
```

不出所料，`event` 的类型是 `Optional<Event>`。因为调用 find 方法时给定的 ID 在数据库中可能不存在，所以它返回了一个可选值。有时候我们不需要空值。例如，在 Beacon 中，如果你尝试参加某个活动，该活动为空并不是正常流程。为了应对这种情况，我用 unwrap() 处理返回值：

```swift
let event = Event.find(id).unwrap()
```

现在 `event` 的类型是 `Event`，如果活动不存在，函数会直接结束并把错误传递到上面提到的 `JSONErrorMiddleware`，返回给用户会看到 JSON 格式的错误信息。

`unwrap()` 的问题是丢失了上下文。到底什么类型获取失败了？如果是在 Ruby 或者 Java 中，我们至少有一个堆栈跟踪器，可以了解到是哪些函数调用报错。可惜在 Swift 里我们没有这种东西。我们最多只能捕获这个错误解包发生的文件和行数。我已经在 [这个版本的 `NilError`](https://github.com/login/oauth/authorize?client_id=7e0a3cd836d3e544dbd9&redirect_uri=https%3A%2F%2Fgist.github.com%2Fauth%2Fgithub%2Fcallback%3Freturn_to%3Dhttps%253A%252F%252Fgist.github.com%252Fkhanlou%252Fe4b5db71a6a18903d8a78edd04068780&response_type=code&state=7847690730bf2d71212c928a94096750c72943aa61610c1614398d52b9a1d383) 中实现了这个功能。

此外，由于没有上下文，Vapor 没法判断状态代码。你应该注意到了 `JSONErrorMiddleware` 仅仅遵守了 `AbortError` 协议。那么其他类型的错误呢？它们被封装在符合 `AbortError` 协议的对象中，但是状态码被预设为 500，这不是我们想要的。虽然 `unwrap()` 非常适合快速获取内容。但是一旦你的客户端需要返回正确的状态码以及有用的错误信息，这个方法就不再适用了。为此，我们将探讨如何为该项目构建自定义错误类型。

## 缺少资源

先来解决对象丢失的问题。如果我们的 ID 来自一个 URL 中的参数，这个请求应该返回 404。在 Swift 中构建一个错误信息很简单：

```swift
struct ModelNotFoundError: AbortError {
    
    let status = Status.notFound
    	    
    var code: Int {
        return status.statusCode
    }
    	    
    let message: String
    
    public init<T>(type: T) {
        self.message = "\(typeName) could not be found."
    }
}
```

在后续的示例中，我会省略 `code` 这个计算属性，因为它的作用仅仅是转发 `status` 的 `statusCode`。

定义好 `ModelNotFoundError` 之后，我们可以加上 `guard` 和 `throw`。

```swift
guard let event = Event.find(id) else {
	throw ModelNotFoundError(type: Event)
}
```

但是每次获取对象都需要写这些的代码，真的很烦。为了解决这个问题，我在 `Entity` 的扩展中封装了这段代码：

```swift
extension Entity {
	static func findOr404(_ id: Node) throws -> Self {
		guard let result = self.find(id) else {
			throw ModelNotFoundError(type: Self.self)
		}
		return result
	}
}
```

现在的代码好多了：

```swift
let event = try Event.findOr404(id)
```

在服务端使用原生的错误，可以提升正确性（基于状态码和准确的消息）以及更严密的表达性。

## 认证

我们的 API 和其他类型的访问需要验证用户身份，以便他们可以执行某些操作。为了简洁地执行该过程，我们使用中间件从用户请求中获取认证的 token，并且把该信息保存在请求对象中。（Vapor 在每个 `Request` 中包含了一个名为 `storage` 的便捷字典，你可以把自定义的信息保存在其中。）（此外，Vapor 包含了一些身份验证和 session 处理的组件。相比弄清楚 Vapor 的源码，自己实现一个更简单。）

```swift
final class CurrentSession {

	init(user: User? = nil) {
		self.user = user
	}
    
	var user: User?
    
	@discardableResult
	public func ensureUser() throws -> User {
		return user.unwrap()
	}
}
```

每个请求都需要提供如上所示的 `Session` 对象。如果你想确保用户已通过身份验证（并且希望与该用户通信），可以调用：

```swift
let currentUser = try request.session.ensureUser()
```

这段代码和之前的代码有相同的问题。如果用户没有正确的授权，用户会看到 500 的错误和一个有关 nil 对象的没有任何意义的错误描述，而不是 401 未授权的状态码和可读的错误信息。我们需要自定义另一个错误。

```swift
struct AuthorizationError: AbortError {
	let status = Status.unauthorized

	var message = "Invalid credentials."
}
```

实际上 Vapor 已经实现了对这种错误的处理：

```swift
Abort.custom(status: .unauthorized, message: "Invalid credentials.")
 ``` 

我使用了自定义的错误类型，原因后面会解释。

现在 `ensureUser` 函数变成了这样：

```swift
@discardableResult
public func ensureUser() throws -> User {
	guard let user = user else {
		throw AuthorizationError()
	}
	return user
}
```

## 错误的 JSON 格式

Vapor 对 JSON 的处理难以令人满意。假设你想从一个 JSON 中取出 “title” 键所保存的字符串内容。看看这些问号：

```swift
let title = request.json?["title"]?.string
```
当然，在调用链的末尾，`title` 是一个 `Optional<String>`。即便在末尾添加一个 `unwrap()` 也不能解决问题：因为根据 Swift 的可选链优先级规则，它只会解包可选链的最后一个元素：`.string`。我们可以通过两种方式解决这个问题。第一种是将整个表达式包裹在括号中：

```swift
let title = try (request.json?["title"]?.string).unwrap()
```

或者在每一步解包：

```swift
let title = try request.json.unwrap()["title"].unwrap().string.unwrap()
```

不必多言，这很可怕。每个展开都代表了不同的错误：第一个解包表示 Content-Type 中缺失了`application/json`（或者格式不正确），第二个表示 key 不存在，第三个表示 key 对应的类型不符合期望。所有的这些信息都被 `unwrap()` 丢弃了。理想情况下，我们的 API 会为每种错误提供不同的错误信息。

```swift
enum JSONError: AbortError {

	var status: Status {
		return .badRequest
	}
	
	case jsonMissing
	case missingKey(keyName: String)
	case typeMismatch(keyName: String, expectedType: String, actualType: String)
}
```
这些 case 代表了上述的三种错误。我们需要根据情况添加一个函数来生成消息，这就是我们需要的全部功能。更完善的错误信息有助于客户端调试常见的错误（比如缺少 `Content-Type` ）。

这些错误，和 `NiceJSON` 组合起来（希望把这个对象作为一个单独的文章），就是下面的代码：

```swift
let title: String = try request.niceJSON.fetch("title")
```

可读性高了许多。`title` 通常也是一个具有预设类型的实例变量（[这篇文章](http://khanlou.com/2017/06/server-side-commands/)中有提到），所以类型推断所需的 `: String` 也可以省略。

编写代码的“正确方式”应该同时是编写代码的“最佳实践”，你不必在有价值的错误消息或者类型安全性以及简单的易于阅读的代码之间做出痛苦的折衷。

## 外部可见的错误

默认情况下，Vapor 包含一个指向 `AbortError` 的错误。然而，许多（绝大多数！）情况下用户不应该从错误中看到实现的细节。例如，PostgreSQL 适配器的错误显示你所连接的数据库以及表结构的详细信息。甚至 `NilError`包含了错误的文件和行数，它显示了服务器是基于 Swift 搭建的，因此容易受到针对 Swift 的攻击。

为了隐藏一些错误信息，我创建了一个新的协议。

```swift
public protocol ExternallyVisibleError: Error {
    
    var status: Status { get }
    
    var externalMessage: String { get }
}
```

注意，`ExternallyVisibleError` 没有遵守 `AbortError`。一旦你让 `AbortError` 对象遵守该协议，就必须提供额外的属性：`externalMessage`，它是用户看到的内容。

我们需要对 `JSONErrorMiddleware` 进行快速地修改，以便在非 `ExternallyVisibleError` 类型的错误中隐藏错误信息：

```swift
public func respond(to request: Request, chainingTo next: Responder) throws -> Response {
    do {
        return try next.respond(to: request)
    } catch let error as ExternallyVisibleError {
        let response = Response(status: error.status)
        response.json = try JSON(node: [
            "error": true,
            "message": error.externalMessage,
            "code": error.status.statusCode,
        ])
        return response
    } catch let error as AbortError {
        let response = Response(status: error.status)
        response.json = try JSON(node: [
            "error": true,
            "message": "There was an error processing this request.",
            "code": error.code,
        ])
        return response
    }
}
```

我还添加了一些代码，只要不是 `.production` 环境，就把 `AbortError` 传递下去。

Swift 的错误类型是一个强大的工具，可以存储附加的数据、元数据和类型。Vapor 内置类型的一些简单扩展能帮助你写出更好的代码。对于我来说，Swift 的亮点就是简洁、表现力和错误处理能力，客户端和服务端应该达成这种默契。
