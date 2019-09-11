title: "在实践中应用 RxSwift"
date: 2016-07-08
tags: [Swift]
categories: [原创文章]
permalink: using-rxswift-in-practice

---

<!--此处开始正文-->

## 摘要

本文上半部分将为您解释为什么在实际项目中为什么不要调用 `onError` 以及尽量不使用 `Driver` 。同时给出一种合理的解决方案，让我们仍然可以愉快的传递 Error ，并对 Value 进行处理。
下半部分将介绍用函数式来精简我们的代码。

> 注：本文基于 Swift 3 。

<!--more-->

## 忘记 `onError`

### `onError` 释放资源

可能这个标题有些吼人，不是说 Rx 中的 Error 处理是很好的方案吗？可以把 Error 归到一起处理。笔者在这里也觉得这是一个很好的方案，但有一个地方非常头疼，发射 Error 后是释放对应的事件链，也就是数据流。还是用网络请求举例，比如登录。我们打算做一个登录 －》 成功 －》保存 token －》 用 token 获取用户信息等等。
在登录的部分，点击登录，进行验证，很明显，如果密码有误，就会报错。

图片表达的很清晰，对应代码的代码是：

```swift
button
    .rx_tap // 点击登录
    .flatMap(provider.login) // 登录请求
    .map(saveToken) // 保存 token
    .flatMap(provider.requestInfo) // 获取用户信息
    .subscribe(handleResult) // 处理结果
```

代码和流程图是一个样子的，效果还不错。
运行一下，输入正确的账号密码，登录，登录成功，获取用户信息。一切正常。
但是我们来看下面这种场景，登录失败（不论是因为网络错误，还是因为密码错误之类的原因，我们都对这些错误调用了 `onError` 传递错误信息），直接将 error 传递到事件结尾，即显示登录错误的信息。此时再去点击登录就不会有任何提示了。
因为上面这一条点击登录事件链都被 dispose 了。

这是一个 bug 。我们不希望在第一次点击登录失败后，再次点击登录缺没什么反应。

> 事实上在 [Try! Swift](http://www.tryswiftconf.com/en "Try! Swift") 大会上有一场 POP 的分享，Demo 地址 [RxPagination](https://github.com/tryswift/RxPagination "RxPagination") 。试着把网络关了，拉取一下数据，再打开网络，再拉取一下数据看看？此时是没有什么反应的。补一句，这个项目是值得学习一下的。

### 用官方的方法处理 Error ？

在讨论用官方的方式处理 Error 前，我们先来确认一件事情，处理一个登录流程，如果出现了错误是否应该继续下去，答案是显然的，不继续，停止本次事件。

官方给出了一下几种操作：

- `retry`
- `catchError`
- `catchErrorJustReturn`
- `doOnError`

很可惜，前三种方法都是处理 error ，将 error 变换成正常的值继续下去，并没有停止本次事件。而 `doOnError` 只是在出现 error 的时候做点什么事情，并不能对事件流有什么影响。

## 使用 Result

```
enum Result<T> {
    case value(T)
    case error(ErrorProtocol)
}
```

Swift 中的枚举关联值是如此的强大，这可以帮我们解决 Error 的处理，如果 case 为 error ，那就不处理，将 error 传递下去即可。

相比原有的 `onError` 有如下优势：

- 不因为 error 释放资源
- 方便对 error 传递、**处理**

类似这样：

```swift
provider.request(GitHubAPI.Authorize)
    .map { result -> Result<String> in
        switch result {
        case .value(let value):
            return Result.value(value["token"].stringValue)
        case .error(let error):
            return Result.error(error)
        }
    }
    .flatMap { result -> Observable<Result<JSON>> in
        switch result {
        case .value(let token):
            return provider.request(GitHubAPI.AccessToken(code: token))
        case .error(let error):
            return Observable.just(Result.error(error))
        }
    }
    .subscribeNext { json in
        // ...
    }
```

catch 等系列方法也可以直接在这里替代，而且更灵活了一些，可以返回任何我们想要的类型。

### 过多的“无用”代码

比如我们要进行多个操作，在第一个或第二个操作就可能出现 error 时，我们的代码会变得很臃肿，也就是有很多的 `case .error(let error): ` 的代码。
这并不优雅。

## 摘要

在上一篇 在实践中应用 RxSwift 1 － 使用 Result 传递值中，我们解决了 error 的处理，但当我们处理一段很长的事件流时，会发现有很多不重要的代码，比如传递 Error 。本文将讨论一种优雅的方式处理该问题 － 函数式。本文结构分为两部分，第一部分讨论上一篇的 error 问题，第二部分再写一些其它的小函数，方便我们更好的写代码。

> 注：
> 本文不会为您解释过多关于函数式的内容，如果您需要了解，可以阅读 Chris 的 Functional Swift ，本书还有对应的中文版 函数式 Swift 。

```swift
enum Result<Value> {
	case value(Value)
	case error(ErrorProtocol)
}
```

## 为 Result 添加 map 和 flatMap

在上一节，我们用 `Result` 解决了 `onError` 的问题， 但缺带来了很多重复处理 `Error` 的代码。先来尝试下 `Monad` 的方案。先来写个 `map`。

```swift
func map<T>(_ transform: (Value) throws -> T) -> Result<T> {
	switch self {
	case .value(let object):
		do {
			let nextObject = try transform(object)
			return Result<T>.value(nextObject)
		} catch {
			return Result<T>.error(error)
		}
	case .error(let error):
		return Result<T>.error(error)
	}
}
```

可以看到我们这个 `map` 的实现还是很完善的：

- 支持对 `value` 的变换
- 支持抛出 `error`

笔者认为这基本满足了我们的需求，传递 Error ，对 value 进行变换，抛出错误。现在我们可以把上一篇的代码改成下面这个样子：

```swift
provider
	.request(GitHubAPI.Authorize)
	.map { result in
		result.map { json in
			return json["token"].stringValue
		}
	}
	.flatMap { result -> Observable<Result<JSON>> in
		switch result {
		case .value(let token):
			return provider.request(GitHubAPI.AccessToken(code: token))
		case .error(let error):
			return Observable.just(Result.error(error))
		}
	}
	.subscribeNext { json in
		// ...
	}
```

易读性仍然不够，我们继续。

在 Rx 中，`map` 和 `flatMap` 是最常用的，我们添加一些小工具。

## mapValue

```swift
func mapValue<T, K>(_ transform: (T) throws -> K) -> (Result<T>) -> Result<K> {
	return { result in
		result.map(transform)
	}
}
```


于是我们对 `Result` 的 `map` 操作可以变成这个样子：

```swift
	.map(mapValue { json in
		return json["token"].stringValue
	}
```

优雅了很多，不需要再处理 error 问题了。

## flatMapRequest

类似的，我们还可以对网络请求的 `flatMap` 下手。

```swift
func flatMapRequest<T>(_ transform: (T) -> Target) -> (Result<T>) -> Observable<Result<JSON>> {
	return { result in
		let api = result.map(transform)
		switch api {
		case .value(let value):
			return provider.request(value)
		case .error(let error):
			return Observable.just(Result.error(error))
		}
	}
}
```

完整的调用就变成了这个样子：

```swift
provider
	.request(GitHubAPI.Authorize)
	.map(mapValue { json in
		return json["token"].stringValue
		})
	.flatMap(flatMapRequest { token in
		return GitHubAPI.AccessToken(code: token)
	})
	.subscribeNext { result in
		// ...
	}
```

> 注：
> 这里的 flatMapRequest 的 flatMap 并非真正的 flatMap ，笔者只是方便对应 Rx 中的 flatMap 操作。以此表示这个方法是用在 flatMap 上的。

## 其他小工具

类似上面的方式，我们还可以写一些常用的方法：

```swift
func toTrue<T>() -> T -> Bool {
	return { _ in
		return true
	}
}
```

再比如调用 `rx_sendMessage` 时，我们可能不需要参数：

```swift
func toVoid<T>() -> T -> Void {
	return { _ in }
}
```

只需要 `Result`的 `value` 情况？同时获取 `value` ？

```swift
func filterValue<T>() -> Result<T> -> Observable<T> {
	return { result in
		switch result {
		case .value(let object):
			return Observable.just(object)
		case error(let error):
			return Observable.empty()
		}
	}
}
```

再比如只处理成功的情况：

```swift
func success<T>(_ action: (T) -> Void) -> Result<T> -> Void {
	return { result in
		result.success(action)
	}
}
```

甚至是带有默认错误处理方法的函数，当然这里笔者就不再赘述，有兴趣可以自行试试看～

可以看到，在实现每一个操作符（比如 `map`）中传入的闭包，尝试这样函数式的代码，会减少写很多重复代码，重要的是，代码变得更加清晰易读了。此外，您还可以这样组织代码：

```swift
class FlatMap<T> {

	private init() { }

	static func request(api: (T) -> Target) -> (T) -> Observable<Result<JSON>> {
		return { object in
			return provider.request(api(object))
		}
	}

	static func request(api: (T) -> Target) -> (Result<T>) -> Observable<Result<JSON>> {
		return { result in
			switch result {
			case .value(let object):
				return request(api: api)(object)
			case let .error(error):
				return Observable.just(Result.error(error))
			}
		}
	}
	/// 过滤出 Result 中的 value
	static var filterValue: (Result<T>) -> Observable<T> {
		return { result in
			switch result {
			case .value(let object):
				return Observable.just(object)
			case .error:
				return Observable.empty()
			}
		}
	}
	/// 过滤出 Result 中的 error
	static var filterError: (Result<T>) -> Observable<ErrorProtocol> {
		return { result in
			switch result {
			case .value:
				return Observable.empty()
			case let .error(error):
				return Observable.just(error)
			}
		}
	}
}
```

这里我表示所有的方法都是用给 Rx 中 `flatMap` 操作的。

> 关于为什么 `FlatMap` 中会有 `filter` ，您可以参考这篇文章 [ 用更 Swifty 的代码遍历数据 ](http://blog.dianqk.org/2016/04/07/%E7%94%A8%E6%9B%B4%20Swifty%20%E7%9A%84%E4%BB%A3%E7%A0%81%E9%81%8D%E5%8E%86%E6%95%B0%E6%8D%AE/ "用更 Swifty 的代码遍历数据")。

> 这里还有一篇美团的 FRP 实践 [ iOS开发下的函数响应式编程 ](http://williamzang.com/blog/2016/06/27/ios-kai-fa-xia-de-han-shu-xiang-ying-shi-bian-cheng/ "iOS开发下的函数响应式编程") ，不论您是用 RAC 还是 Rx ，都值得看一看。