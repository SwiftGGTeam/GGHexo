title: "如何处理 Swift 中的异步错误"
date: 2016-02-16
tags: [Swift 进阶]
categories: [Crunchy Development]
permalink: async-errors
keywords: Swift错误处理,RxSwift,RAC,Swift throw,Swift Promise
custom_title: 
description: 介绍了如何使用Promise来处理Swift中的异步错误，同时介绍了函数式编程和响应式编程

---
原文链接=http://alisoftware.github.io/swift/async/error/2016/02/06/async-errors/
作者=Olivier Halligon  
原文日期=2016-02-06
译者=ray16897188
校对=小锅
定稿=numbbbbb


在之前的一篇文章中，我介绍了如何在[Swift中使用`throw`做错误处理](http://alisoftware.github.io/2015/12/17/let-it-throw/)。但是如果你处理的是异步流程，`throw` 就无法胜任，该怎么办？

### `throw` 和异步有啥问题？

回顾下，我们可以像下面这样，在一个可能失败的函数中使用 `throw` 关键字：

```swift
// 定义错误类型和一个可抛出的函数
enum ComputationError: ErrorType { case DivisionByZero }
func inverse(x: Float) throws -> Float {
  guard x != 0 else { throw ComputationError.DivisionByZero }
  return 1.0/x
}
// 调用它
do {
  let y = try inverse(5.0)
} catch {
  print("Woops: \(error)")
}
```

但如果函数是异步的，需要等待一段时间才会返回结果，比如带着 completion block 的函数，这个时候怎么办？

<!--more-->

```swift
func fetchUser(completion: User? /* throws */ -> Void) /* throws */ {
  let url = …
  NSURLSession.sharedSession().dataTaskWithURL(url) { (data, response, error) -> Void in
//    if let error = error { throw error } // 我们不能这样做, fetchUser 不能“异步地抛出”
    let user = data.map { User(fromData: $0) }
    completion(user)
  }.resume()
}
// 调用
fetchUser() { (user: User?) in
  /* do something */
}
```

这种情况下如果请求失败的话，你怎么 `throw`？

- 让 `fetchUser` 函数 `throw` 是不合理的，因为这个函数（被调用后）会立即返回，而网络错误只会在这之后发生。所以当错误发生时再`throw` 一个错误就太晚了，`fetchUser` 函数调用已经返回。
- 你可能想把 `completion` 标成 `throws`？但是调用 `completion(user)` 的代码在 `fetchUser` 里，不是在调用 `fetchUser` 的代码里。所以接受并处理错误的代码必须是`fetchUser` 本身，而非 `fetchUser` 的调用点。所以这个方案也不行。😢

### 攻克这道难题

可以曲线救国：让 `completion` 不直接返回 `User?`，而是返回一个 `Void throws -> User` 的 throwing 函数，这个 throwing 函数会返回一个 `User`（我们把这个函数命名为 `UserBuilder`）。这样我们就又能 `throw` 了。

之后当 completion 返回这个 `userBuilder` 函数时，我们用 `try userBuilder()` 去访问里面的 `User`... 或者让它 `throw` 出错误。

```swift
enum UserError: ErrorType { case NoData, ParsingError }
struct User {
  init(fromData: NSData) throws { /* … */ }
  /* … */
}

typealias UserBuilder = Void throws -> User
func fetchUser(completion: UserBuilder -> Void) {
  let url = …
  NSURLSession.sharedSession().dataTaskWithURL(url) { (data, response, error) -> Void in
    completion({ UserBuilder in
      if let error = error { throw error }
      guard let data = data else { throw UserError.NoData }
      return try User(fromData: data)
    })
  }.resume()
}

fetchUser { (userBuilder: UserBuilder) in
  do {
    let user = try userBuilder()
  } catch {
    print("Async error while fetching User: \(error)")
  }
}
```

这样 completion 就不会直接返回一个 `User`，而是返回一个 `User`... 或抛出错误。之后你就又可以做错误处理了。

但说实话，用 `Void throws -> User` 来代替 `User?` 并不是最优雅、可读性最强的解决方案。还有其他办法吗？

### 介绍 Result

回到 Swift 1.0 的时代，那时还没有 `throw`，人们得用一种函数式的方法来处理错误。由于 Swift 从函数式编程的世界中借鉴过来很多特性，所以当时人们在 Swift 中用 `Result` 模式来做错误处理还是很合理的。`Result` 长这样<sup>1</sup>：

```Swift
enum Result<T> {
  case Success(T)
  case Failure(ErrorType)
}
```

`Result` 这个类型其实很简单：它要么指代一次成功 —— 附着一个关联值（associated value）代表着成功的结果 —— 要么指代一次失败 —— 有一个关联的错误。它是对可能会失败的操作的完美抽象。

那么我们怎么用它？创建一个 `Result.Success` 或者一个 `Result.Failure`，然后把作为结果的 `Result`<sup>2</sup> 传入 `completion`，最后调用 `completion`：

```swift
func fetchUser(completion: Result<User> -> Void) {
  let url = …
  NSURLSession.sharedSession().dataTaskWithURL(url) { (data, response, error) -> Void in
    if let error = error {
      return completion( Result.Failure(error) )
    }
    guard let data = data else {
      return completion( Result.Failure(UserError.NoData) )
    }
    do {
      let user = try User(fromData: data)
      completion( Result.Success(user) )
    } catch {
      completion( Result.Failure(error) )
    }
  }.resume()
}
```
### 还记得 monads 么？

`Result` 的好处就是它可以变成一个 Monad。记得[Monads](http://swift.gg/2015/10/30/lets-talk-about-monads/)么？这意味着我们可以给 `Result` 添加高阶的 `map` 和 `flatMap` 方法，后两者会接受一个 `f: T->U` 或者 `f: T->Result<U>` 类型的闭包，然后返回一个 `Result<U>`。

如果一开始的 `Result` 是一个 `.Success(let t)`，那就对这个 `t` 使用这个闭包，得到 `f(t)` 的结果。如果是一个 `.Failure`，那就把这个错误继续传下去：

```swift
extension Result {
  func map<U>(f: T->U) -> Result<U> {
    switch self {
    case .Success(let t): return .Success(f(t))
    case .Failure(let err): return .Failure(err)
    }
  }
  func flatMap<U>(f: T->Result<U>) -> Result<U> {
    switch self {
    case .Success(let t): return f(t)
    case .Failure(let err): return .Failure(err)
    }
  }
}
```

如果想要了解更多信息，我建议你去重读我写的[关于 Monads 的文章](http://swift.gg/2015/10/30/lets-talk-about-monads/)，但现在长话短说，我们来修改代码：

```swift
func readFile(file: String) -> Result<NSData> { … }
func toJSON(data: NSData) -> Result<NSDictionary> { … }
func extractUserDict(dict: NSDictionary) -> Result<NSDictionary> { … }
func buildUser(userDict: NSDictionary) -> Result<User> { … }

let userResult = readFile("me.json")
  .flatMap(toJSON)
  .flatMap(extractUserDict)
  .flatMap(buildUser)
```

上面代码中最酷的地方：如果其中一个方法（比如 `toJSON`）失败了，返回了一个 `.Failure`，那随后这个 failure 会一直被传递到最后，而且不会被传入到 `extractUserDict` 和 `buildUser` 方法里面去。

这就可以让错误“走一条捷径”：和 `do...catch` 一样，你可以在链条的结尾一并处理所有错误，而不是在每个中间阶段做处理，很酷，不是么？

### 从 `Result` 到 `throw`，再从 `throw` 到 `Result`

问题是，`Result` 不包含在 Swift 标准库中，而无论怎样，还是有很多函数使用 `throw` 来报告同步错误（译注：synchronous errors，与异步错误 asynchronous errors 相对）。比如，在实际应用场景中从一个 `NSDictionary` 建立一个 `User`，我们可能得用 `init(dict: NSDictionary) throws` 构造器，而不是 `NSDictionary -> Result<User>` 函数。

那怎么去融合这两个世界呢？简单，我们来扩展一下 `Result`<sup>3</sup>！

```swift
extension Result {
  // 如果是 .Success 就直接返回值，如果是 .Failure 抛出错误
  func resolve() throws -> T {
    switch self {
    case Result.Success(let value): return value
    case Result.Failure(let error): throw error
    }
  }

  // 如果表达式返回值则构建一个 .Success，否则就构建一个 .Failure
  init(@noescape _ throwingExpr: Void throws -> T) {
    do {
      let value = try throwingExpr()
      self = Result.Success(value)
    } catch {
      self = Result.Failure(error)
    }
  }
}
```

现在我们就可以很轻松地将 throwing 构造器转换成一个闭包，该闭包返回一个 `Result`：

```Swift
func buildUser(userDict: NSDictionary) -> Result<User> {
  // 这里我们调用了 `init` 并使用一个可抛出的尾闭包来构建 `Result`
  return Result { try User(dictionary: userDict) }
}
```

之后如果我们将 `NSURLSession` 封装到一个函数中，这个函数就会异步的返回一个 `Result`，我们可以按个人喜好来调整这两个世界的平衡，例如：

```swift
func fetch(url: NSURL, completion: Result<NSData> -> Void) {
  NSURLSession.sharedSession().dataTaskWithURL(url) { (data, response, error) -> Void in
    completion(Result {
      if let error = error { throw error }
      guard let data = data else { throw UserError.NoData }
      return data
    })
  }.resume()
}
```

上面的代码也调用了 completion block，往里面传了一个由 throwing closure<sup>4</sup> 创建的 `Result` 对象。

随后我们就可以用 `flatMap` 把这些都串起来，再根据实际需求决定是否进入 `do...catch` 的世界：

```swift
fetch(someURL) { (resultData: Result<NSData>) in
  let resultUser = resultData
    .flatMap(toJSON)
    .flatMap(extractUserDict)
    .flatMap(buildUser)

  // 如果我们想在剩下代码中回到 do/try/catch 的世界
  do {
    let user = try resultUser.resolve()
    updateUI(user: user)
  } catch {
    print("Error: \(error)")
  }
}
```

### 我承诺，这就是未来

（校对注：作者这里的标题使用了双关语，承诺的英文为 "Promise", 未来的单词为 "Future"。）（定稿注：这篇文章提到的这种模式术语就是 "Promise"，因此说是双关。）

`Result` 很炫酷，但是既然它们的主要用途是异步函数（因为同步函数我们已经有了 `throw`），那何不让它也实现对异步的管理呢？

实际上已经有一个这样的类型<sup>TM</sup>，它就是 `Promise`（有时候也叫 `Future`，这两个术语很像）。

`Promise` 类型结合了 `Result` 类型（能成功或者失败）和异步性。一个 `Promise<T>` 既可以在一段时间后（体现了异步方面的特性）被成功*赋*成 `T` 类型的值（译注：这里的*赋值*英文是 fulfill，原意是履行，而 Promise 本身也有*承诺*的意思。`Promise<T>`被成功赋值，等同于承诺被履行），又可能在错误发生时被*拒绝(reject)*。

一个 `Promise` 也是一个 monad。但和通常以 `map` 和 `flatMap` 的名字来调用它的 monadic 函数不同，按规定这两个函数都通过 `then` 来调用：

```swift
class Promise<T> {
  // 与 map 对应的 monad，在 Promise 通常被称为 then
  func then(f: T->U) -> Promise<U>
  // 与 flatMap 对应的 monad，在 Promise 中也被称为 then 
  func then(f: T->Promise<U>) -> Promise<U>
}
```

错误也通过 `.error` 和 `.recover` 解包。在代码中，它的使用方式和你使用一个 `Result` 基本相同，毕竟它俩都是 monad：

```swift
fetch(someURL) // returns a `Promise<NSData>`
  .then(toJSON) // assuming toJSON is now a `NSData -> Promise<NSDictionary>`
  .then(extractUserDict) // assuming extractUserDict is now a `NSDictionary -> Promise<NSDictionary>`
  .then(buildUser) // assuming buildUser is now a `NSDictionary -> Promise<User>`
  .then {
    updateUI(user: user)
  }
  .error { err in
    print("Error: \(err)")
  }
```

感受到了吗，这看起来多么流畅多么优雅！这就是把一些微处理步骤精密连接起来的流（stream），而且它还替你做了异步处理和错误处理这样的脏活儿累活儿。如果在处理流程中有错误发生，比如在 `extractUserDict` 中出错，那就直接跳到 `error` 回调中。就像用 `do...catch` 或者 `Result` 一样。

在 `fetch` 中使用 `Promise` —— 取代 completion block 或者 `Result` —— 看起来应该是这样的：

```swift
func fetch(url: NSURL) -> Promise<NSData> {
  // PromiseKit 有一个便利的 `init`，会返回一个 (T?, NSError?) 闭包到 `Promise` 中
  return Promise { resolve in
    NSURLSession.sharedSession().dataTaskWithURL(url) { (data, _, error) -> Void in
      resolve(data, error)
    })
  }.resume()
}
```

`fetch` 方法会立即返回，所以就没必要用 `completionBlock` 了。但它会返回一个 `Promise` 对象，这个对象只去执行 `then` 里面的闭包 - 在（异步）数据延时到达、`Promise`这个对象被成功赋值（译注：promise is *fulfilled*，也是承诺被*履行*的意思）之后。

### Observe 和 Reactive

`Promise` 很酷，但还有另外一个概念，可以在实现微处理步骤流的同时支持异步操作，并且支持处理这个流中任何时间任何地点发生的错误。

这个概念叫做 Reactive Programming（响应式编程）。你们之中可能有人知道 `ReactiveCocoa`（简写 RAC），或者`RxSwift`。即便它和`Promises`有部分相同的理念（异步、错误传递，...），它还是超越了 `Futures` 和 `Promises` 这个级别：`Rx` 允许某时刻有多个值被发送（不仅仅有一个返回值），而且还拥有其他繁多丰富的特性。

这就是另外一个全新话题了，之后我会对它一探究竟。

---

1. 这是对 `Result` 可能的实现方式中的一种。其他的实现也许就会有一个更明确的错误类型。[↩](http://alisoftware.github.io/swift/async/error/2016/02/06/async-errors/#fnref1)
2. 在这里我调用 `return completion(…)` 时用了一个小花招，并没有调用 `completion(...)` 然后再 `return` 来退出函数的作用域。这个花招能成功，是因为 `completion` 返回一个 `Void`，`fetchUser` 也返回一个 `Void`（什么都不返回），而且 `return Void` 和单个 `return` 一样。这完全是个人偏好，但我还是觉得能用一行写完更好。[↩](http://alisoftware.github.io/swift/async/error/2016/02/06/async-errors/#fnref1)
3. 这段代码中，`@noescape`关键字的意思是`throwingExpr`能被保证在`init`函数的作用域里是被直接拿来使用 - 相反则是把它存在某个属性中以后再用。用了这个关键字你的编译器不用强迫你在传进一个闭包时在调用点使用`self.`或者`[weak self]`了，还能避免引用循环的产生。[↩](http://alisoftware.github.io/swift/async/error/2016/02/06/async-errors/#fnref3)
4. 在这里暂停一下，看看这段代码多像在开篇的时候我们写的`UserBuilder`的那段，感觉我们开篇时就走在了正确的路上。😉 [↩](http://alisoftware.github.io/swift/async/error/2016/02/06/async-errors/#fnref4)