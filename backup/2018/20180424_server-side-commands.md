title: "Swift 服务端开发指南"
date: 2018-04-24
tags: [Swift 跨平台]
categories: [KHANLOU]
permalink: server-side-commands
keywords: 服务端
custom_title: 
description: 

---
原文链接=http://khanlou.com/2017/06/server-side-commands
作者=Soroush Khanlou
原文日期=2017/6/21
译者=Cwift
校对=Yousanflics
定稿=CMB

<!--此处开始正文-->

在服务端使用 Swift 时，大多数路由框架都会把路由同一个指定的闭包关联起来。比如我们在编写 [Beacon](http://beacon.party)  时使用的 [Vapor](https://vapor.codes) 框架。你可以在该框架主页的测试示例中看到如下的代码：

<!--more-->

```swift
import Vapor

let droplet = try Droplet()

droplet.get("hello") { req in
    return "Hello, world."
}

try droplet.run()
```

当你运行这段代码时，访问 `localhost:8080/hello` 会展示文本 `Hello, world.` 。

有时候，你想要向 `API` 的调用者返回一个特殊的 `HTTP` 代码，提示执行了一个特殊的操作。示例如下：

```swift
droplet.post("devices", handler: { request in
	let apnsToken: String = try request.niceJSON.fetch("apnsToken")
	let user = try request.session.ensureUser()
    
	var device = try Device(apnsToken: apnsToken, userID: user.id.unwrap())
	try device.save()
	return try device.makeJSON()
})
```

（我打算在之后的博客中详细介绍 `niceJSON` 的用法，不过现在请忽略它。）

这是个非常好的请求，和 `Beacon` 中的代码很像。不过有一个问题：当你返回类似字符串的对象（本文的第一个示例）或者 `JSON`（本文的第二个示例）时，Vapor 会返回 `200` 的状态码。但是这是一个 `POST` 请求并且创建了一个新的 `Device` 资源，所以应该返回 `201 Created` 的 `HTTP` 状态码。所以你需要创建一个完整的 `Response` 对象：

```swift
let response = Response(status: .created)
response.json = try device.makeJSON()
return response
```

对每个创建型的请求重复执行这样的操作很烦人。

最后一点，端点（endpoints）通常会有副作用。特别是使用 Rails 编写的应用，管理和测试这些端点是非常困难的，在 Rails 社区中已经出现了许多有关的讨论了。如果注册需要发送注册邮件，那么如何布置 “桩代码” （stub）以便测试剩余的代码？这是很难做到的，如果所有逻辑都在一个复杂的函数中执行，更是难上加难。在 `Beacon` 中没有任何发送邮件的功能，但是我们的确有很多推送通知。监管这些推送的副作用是很重要的。

一般来说，在每个路由中使用一个闭包的风格，已经应用在 `Flask`、`Sinatra` 和 `Express` 之类的框架中了。它们都是非常好的示例，不过真实的项目往往具有复杂的端点，依旧是把所有逻辑放在一个复杂的方法中。

进一步说，Rails 风格的控制器模块很庞大，而与每个端点匹配的相关方法都使用控制器作为命名空间，这使得控制器彼此之间具有边界攻击性。我觉得我们可以做的比以上两种模式（使用闭包的风格和 Rails 风格）更好。（如果你想了解 Ruby 服务器架构，我已经从 [Trailblazer](https://github.com/trailblazer/trailblazer) 项目中总结了一些经验。）

最基本的一点是我想要一个更好的抽象来响应传入的请求。为此，我使用了一个称之为 `Command` 的对象来封装端点需要做的工作。

`Command` 模式的起始部分是一个协议：

```swift
public protocol Command {

	init(request: Request, droplet: Droplet) throws
    
	var status: Status { get }

	func execute() throws -> JSON
	
}

extension Command: ResponseRepresentable {
    
	public func makeResponse() throws -> Response {
		let response = Response(status: self.status)
		response.json = try execute()
		return response
	}
    
}
```

上面的代码是 `Command` 协议的基础外壳，后面会向其中添加更多的代码。从协议的基础部分可以了解如何使用这种模式。下面来使用新模式重写“注册设备”这个端点。

```swift
droplet.post("devices", handler: { request in
	return RegisterDeviceCommand(request: request, droplet: droplet)
})
```

因为该命令遵守了 `ResponseRepresentable`，所以 Vapor 接受它作为路由的 `handler` 闭包的有效返回值。 它将自动调用 `Command` 的 `makeResponse()` 方法并且为 API 的调用者返回一个 `Response`。

```swift
public final class RegisterDeviceCommand: Command {

	let apnsToken: String
	let user: User

	public init(request: Request, droplet: Droplet) throws {
		self.apnsToken = try request.niceJSON.fetch("apnsToken")
		self.user = try request.session.ensureUser()
	}

	public let status = Status.created

	public func execute() throws -> JSON {
		var device = try Device(apnsToken: apnsToken, userID: user.id.unwrap())
		try device.save()
		return try device.makeJSON()
	}
}
```

以下是该模式的一些优点：

1. 在服务端使用诸如 Swift 这样的新语言的主要吸引力是可以使用新的特性，比如用可选型（更针对性地说，是为了解决以前的缺陷）来保障一个请求成功完成。因为 `apnsToken` 和 `user` 的类型是非可选型的，所以如果 `init` 方法在结束时没有初始化所有的属性，则文件无法通过编译。
2. 状态码的使用方式很友好。
3. 初始化与执行分离。你可以编写一个测试，检查对象的初始化过程（例如，从请求中提取属性），该测试与检查实际的 `save()` 方法的测试是分离的。
4. 至于副作用，该模式可以轻松地把不同的 `Command` 放置到自己的文件中。

可以向 `Command` 中添加两个更重要的组件。首先是验证。添加 `func validate() throws` 到 `Command` 协议中，编写一个默认的空实现。他也会被添加到 `makeResponse()` 方法中，在 `execute()` 方法之前执行：

```swift
public func makeResponse() throws -> Response {
	let response = Response(status: self.status)
	try validate()
	response.json = try execute()
	return response
}
```

`validate()` 方法的典型样式可能如下所示（来自 Beacon 的 `AttendEventCommand`）：

```swift
public func validate() throws {
	if attendees.contains(where: { $0.userID == user.id }) {
		throw ValidationError(message: "You can't join an event you've already joined.")
	}
	if attendees.count >= event.attendanceLimit {
		throw ValidationError(message: "This event is at capacity.")
	}
	if user.id == event.organizer.id {
		throw ValidationError(message: "You can't join an event you're organizing.")
	}
}
```

这样的代码易于阅读，保持所有验证本地化并且非常易于测试。虽然你可以构造你自己的 `Request` 和 `Droplet` 对象，然后把它们传入 `Command` 的指定构造器，但是你完全没必要这么做。因为每个 `Command` 都是你自己的对象，所以你可以编写一个接受完备的诸如 `User` 和 `Event` 这类对象的构造器，你不需要手动构造 `Request` 对象进行测试，除非你有测试 `Command` 构造过程的特殊需求。

Command 需要的最后一个组件是执行副作用的功能。副作用很简单：

```swift
public protocol SideEffect {
	func perform() throws
}
```

我在 `Command` 协议中增加了一个属性，该属性列出了 Command 执行之后需要执行的 `SideEffect` 对象。

```swift
var sideEffects: [SideEffect] { get }
```

最后，副作用被添加到了 `makeResponse()` 方法中：

```swift
public func makeResponse() throws -> Response {
	let response = Response(status: self.status)
	try validate()
	response.json = try execute()
	try sideEffects.forEach({ try $0.perform() })
	return response
}
```

（在代码的未来版本中，副作用可能会以异步的方式执行，即不会阻止向用户发送响应的过程，不过目前只能同步执行。）将副作用与 `Command` 的其余部分分离的主要原因是便于测试。你可以创建 `Command` 并且执行，而不必隔离副作用，因为副作用永远不会被执行。

`Command` 模式是一个简单的抽象，但它是可测试且正确的，坦白地说，它使用起来令人很愉悦。你可以在这个 [gist](https://gist.github.com/khanlou/133c3cf65d434ec2e66a28a519df3372) 中找到协议的完整定义。我不会因为 Vapor 没有包含这类的抽象而打击它：和其他服务端的框架一样，Vapor 设计简单，你可以根据个人喜好对它进行抽象。 