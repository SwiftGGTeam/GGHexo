使用泛型与函数式思想高效解析 JSON

> 作者：Thought Bot，[原文链接](https://robots.thoughtbot.com/efficient-json-in-swift-with-functional-concepts-and-generics)，原文日期：2014/08/06
> 译者：[shanks](http://codebuild.me/)；校对：[numbbbbb](https://github.com/numbbbbb)；定稿：[numbbbbb](https://github.com/numbbbbb)
  







就在几个月前，苹果推出了一门全新的编程语言，其名为`Swift`, 这让我们对未来 iOS 和 OS X 开发充满了期待与兴奋。人们纷纷开始使用 Xcode Beta1 版本来进行 Swift 开发，但是很快就发现解析 JSON 这一常见的操作在 Swift 中并不如在 Objectitve-C 中那样快捷和方便。Swift 是一门[静态类型](http://en.wikipedia.org/wiki/Type_system)的语言，这意味我们不能简单地将对象赋值给一个特定类型的变量，并且让编译器相信这些对象就是我们所声明的那种类型。在 Swift 当中，编译器会进行检查，以确保我们不会意外地触发运行时错误。这使得我们可以依赖编译器来写出一些无 bug 的代码，同时我们必须做许多额外的工作来使编译器不报错。在这篇文章当中，我将使用函数式思想和[泛型](http://en.wikipedia.org/wiki/Generic_programming)来探讨如何编写易读高效的 JSON 解析代码。



## 请求用户(User)模型

我们要做的事就是将网络请求获得的数据解析成 JSON。之前我们一直使用的是 `NSJSONSerialization.JSONObjectWithData(NSData, Int, &NSError)`方法，这个方法返回一个可选的 JSON 数据类型，如果解析过程出错会得到 NSError 类型的数据。在 Objective-C 当中，JSON 的数据类型是一个可以包含任何其它数据类型的 `NSDictionary`类型。 而在 Swift 当中， 新的字典类型要求我们必须显式指定它所包含的数据的类型。JSON 数据被指定为`Dictionary<String, AnyObject>`类型。这里使用 `AnyObject`的原因是 JSON 的值有可能为 `String`、`Double`、 `Bool`、 `Array`、 `Dictionary` 或者 `null`。当我们使用 JSON 来生成模型数据时，必须对每一个从 JSON 字典中获取到的值进行判断，以确保这个值与我们模型中属性的类型一致。

下面我们来看一个用户(user)的模型：

```swift
struct User {
  let id: Int
  let name: String
  let email: String
}
```

然后，来看一下对当前用户的请求和响应代码：

```swift
func getUser(request: NSURLRequest, callback: (User) -> ()) {
  let task = NSURLSession.sharedSession().dataTaskWithRequest(request)
  { data, urlResponse, error in
    var jsonErrorOptional: NSError?
    let jsonOptional: AnyObject! = 
    NSJSONSerialization.JSONObjectWithData(data, 
    options: NSJSONReadingOptions(0), error: &jsonErrorOptional)
	if let json = jsonOptional as? Dictionary<String, AnyObject> {
      if let id = json["id"] as AnyObject? as? Int { 
      // 在 beta5 中，存在一个 bug，所以我们首先要强行转换成 AnyObject?
        if let name = json["name"] as AnyObject? as? String {
          if let email = json["email"] as AnyObject? as? String {
            let user = User(id: id, name: name, email: email)
            callback(user)
          }
        }
      }
    }
  }
  task.resume()
}
```

在一长串的`if-let`语句之后，我们终于拿到`User`对象。可以想象一下，如果一个模型的属性很多，这些代码会有多丑。并且，这里我们没有进行错误处理，这意味着，只要其中一步出错我们就获取不到任何数据。最后并且最重要的一点是，我们必须对每个需要从网络 API 中获取的模型写一遍类似上面这样的代码，这将会导致很多重复代码。

在对代码进行重构之前，让我们先对JSON的几种类型定义别名，以使之后的代码看起来更简洁。

```swift
typealias JSON = AnyObject
typealias JSONDictionary = Dictionary<String, JSON>
typealias JSONArray = Array<JSON>
```

## 重构：添加错误处理

首先，我们将通过学习第一个函数式编程的概念，[`Either<A, B>`类型](https://hackage.haskell.org/package/base-4.2.0.1/docs/Data-Either.html)，来对代码进行重构，以使其能进行错误处理。这可以使代码在正确的情况下返回用户对象，而在出错时返回一个错误对象。在 Swift 当中可以使用如下方法来实现 `Either<A, B>` ：

```swift
enum Either<A, B> {
  case Left(A)
  case Right(B)
}
```

我们可以使用 `Either<NSError, User>` 作为传入回调的参数，这样调用者便可以直接处理解析过的`User`对象或者错误。

```swift
func getUser(request: NSURLRequest, callback: 
				(Either<NSError, User>) -> ()) {
  let task = NSURLSession.sharedSession().dataTaskWithRequest(request) 
  { data, urlResponse, error in
    // 如果响应返回错误，我们将把错误发送给回调
    if let err = error {
      callback(.Left(err))
      return
    }
    
    var jsonErrorOptional: NSError?
    let jsonOptional: JSON! = 
    NSJSONSerialization.JSONObjectWithData(data, 
    options: NSJSONReadingOptions(0), error: &jsonErrorOptional)
    
    // 如果我们不能解析 JSON，就将发送回去一个错误
    if let err = jsonErrorOptional {
      callback(.Left(err))
      return
    }
    
    if let json = jsonOptional as? JSONDictionary {
      if let id = json["id"] as AnyObject? as? Int {
        if let name = json["name"] as AnyObject? as? String {
          if let email = json["email"] as AnyObject? as? String {
            let user = User(id: id, name: name, email: email)
            callback(.Right(user))
            return
          }
        }
      }
    }

    // 如果我们不能解析所有的属性，就将发送回去一个错误
    callback(.Left(NSError()))
  }
  task.resume()
}
```

现在调用`getUser`的地方可以直接使用`Either`，然后对接收到的用户对象进行处理，或者直接显示错误。

```swift
getUser(request) { either in
  switch either {
  case let .Left(error):
    //显示错误信息

  case let .Right(user):
    //对user进行操作
  }
}
```

我们假设`Left`一直是`NSError`，这可以进一步简化代码。我们可以使用一个不同的类型 `Result<A>` 来保存我们需要的类型数据和错误信息。它的实现方式如下：

```swift
enum Result<A> {
  case Error(NSError)
  case Value(A)
}
```

在当前的 Swift 版本(Beta 5)中，上面的 `Result`类型会造成[编译错误](https://devforums.apple.com/message/995261#995261)(译者注：事实上，在 Swift 1.2 中还是有错误)。 Swift 需要知道存储在`enum`当中数据的确切类型。可以通过创建一个静态类作为包装类型来解决这个问题：

```swift
final class Box<A> {
  let value: A

  init(_ value: A) {
    self.value = value
  }
}

enum Result<A> {
  case Error(NSError)
  case Value(Box<A>)
}
```

将 `Either` 替换为 `Result`，代码将变成这样：

```swift
func getUser(request: NSURLRequest, callback: (Result<User>) -> ()) {
  let task = NSURLSession.sharedSession().dataTaskWithRequest(request) 
  { data, urlResponse, error in
    // 如果响应返回错误，我们将把错误发送给回调
    if let err = error {
      callback(.Error(err))
      return
    }

    var jsonErrorOptional: NSError?
    let jsonOptional: JSON! =
     NSJSONSerialization.JSONObjectWithData(data, 
     options: NSJSONReadingOptions(0), error: &jsonErrorOptional)
    
    // 如果我们不能解析 JSON，就返回一个错误
    if let err = jsonErrorOptional {
      callback(.Error(err))
      return
    }

    if let json = jsonOptional as? JSONDictionary {
      if let id = json["id"] as AnyObject? as? Int {
        if let name = json["name"] as AnyObject? as? String {
          if let email = json["email"] as AnyObject? as? String {
            let user = User(id: id, name: name, email: email)
            callback(.Value(Box(user)))
            return
          }
        }
      }
    }

    // 如果我们不能解析所有的属性，就返回一个错误
    callback(.Error(NSError()))
  }
  task.resume()
}
```

```swift
getUser(request) { result in
  switch result {
  case let .Error(error):
    // 显示错误信息

  case let .Value(boxedUser):
    let user = boxedUser.value
    // 对 user 继续操作
  }
}
```

改变不是很大，我们继续努力。

## 重构: 消除多层嵌套

接下来，我们将为每个不同的类型创建一个 JSON 解析器来消灭掉那些丑陋的解析 JSON 的代码。在这个对象中我们只用到了 `String`, `Int` 和 `Dictionary` 三种类型，所以我们需要三个函数来对这三种类型进行解析。

```swift
func JSONString(object: JSON?) -> String? {
  return object as? String
}

func JSONInt(object: JSON?) -> Int? {
  return object as? Int
}

func JSONObject(object: JSON?) -> JSONDictionary? {
  return object as? JSONDictionary
}
```

现在，解析 JSON 的代码看起来应该是这样的：

```swift
if let json = JSONObject(jsonOptional) {
  if let id = JSONInt(json["id"]) {
    if let name = JSONString(json["name"]) {
      if let email = JSONString(json["email"]) {
        let user = User(id: id, name: name, email: email)
      }
    }
  }
}
```

即使使用了这些函数，还是需要用到一大堆的 `if-let` 语句。函数式编程中的 [Monads](http://www.haskell.org/haskellwiki/Monad)，[Applicative Functors](http://www.haskell.org/haskellwiki/Applicative_functor)，以及 [Currying](http://www.haskell.org/haskellwiki/Currying) 概念可以帮助我们来压缩这段代码。首先看看与 Swift 中的可选类型十分相似的 Monad。Monad 中有一个绑定(bind)运行符，这个运行符可以给一个可选类型绑定一个函数，这个函数接受一个非可选类型参数，并返回一个可选类型的返回值。如果第一个可选类型是 `.None`这个运行符会返回 `.None` ,否则它会对这个可选类型进行解包，并使用绑定的函数调用解包后的数据。

```swift
infix operator >>> { associativity left precedence 150 }

func >>><A, B>(a: A?, f: A -> B?) -> B? {
  if let x = a {
    return f(x)
  } else {
    return .None
  }
}
```

在其它的函数式语言中，都是使用 `>>=` 来作为绑定(bind)运算符，但是在 Swift 中这个运算符被用于二进制位的移位操作，所以我们使用了 `>>>` 来作为替代。在 JSON 代码中使用这个操作符可以得到如下代码：

```swift
if let json = jsonOptional >>> JSONObject {
  if let id = json["id"] >>> JSONInt {
    if let name = json["name"] >>> JSONString {
      if let email = json["email"] >>> JSONString {
        let user = User(id: id, name: name, email: email)
      }
    }
  }
}
```

接着就可以去掉解析函数里的可选参数：

```swift
func JSONString(object: JSON) -> String? {
  return object as? String
}

func JSONInt(object: JSON) -> Int? {
  return object as? Int
}

func JSONObject(object: JSON) -> JSONDictionary? {
  return object as? JSONDictionary
}
```

Functors 有一个`fmap`运算符，可以在某些上下文中通过函数应用到解包后的值上面。Applicative Functors 也有`apply`运算符，可以在某些上下文中通过解包后的函数应用到解包后的值上面。这里的上下文是一个包含了值的可选值。这就意味着我们可以使用一个能够带有多个非可选值的函数来连接多个可选值。如果所有的值都存在，`.Some`会得到可选值解包的结果。如果其中任何值是`.None`,我们将得到`.None`。可以在 Swift 中像下面这样定义这些运算符：


```swift
infix operator <^> { associativity left } // Functor's fmap (usually <$>)
infix operator <*> { associativity left } // Applicative's apply

func <^><A, B>(f: A -> B, a: A?) -> B? {
  if let x = a {
    return f(x)
  } else {
    return .None
  }
}

func <*><A, B>(f: (A -> B)?, a: A?) -> B? {
  if let x = a {
    if let fx = f {
      return fx(x)
    }
  }
  return .None
}
```

先别着急使用这些代码，由于 Swift 不支持自动柯里化(auto-currying), 我们需要手动柯里化(curry)结构体`User`中的`init`方法。柯里化的意思是当我们给定一个函数的参数比它原来的参数更少时，这个函数将返回一个包含剩余参数的函数。我们的`User`模型将看起来像这样：

```swift
struct User {
  let id: Int
  let name: String
  let email: String

  static func create(id: Int)(name: String)(email: String) -> User {
    return User(id: id, name: name, email: email)
  }
}
```

把以上代码合并到一起，我们的 JSON 解析现在看起来是这样的：

```swift

if let json = jsonOptional >>> JSONObject {
  let user = User.create <^>
              json["id"]    >>> JSONInt    <*>
              json["name"]  >>> JSONString <*>
              json["email"] >>> JSONString
}
```
如果我们解析器的任何部分返回`.None`,那么`user`就会是`.None`。这看起来已经好多了，但是我们还没有优化完毕。

到目前为止，我们的`getUser`函数看起来像这样：

```swift
func getUser(request: NSURLRequest, callback: (Result<User>) -> ()) {
  let task = NSURLSession.sharedSession().dataTaskWithRequest(request) { data, urlResponse, error in
    // 如果响应返回错误，返回错误
    if let err = error {
      callback(.Error(err))
      return
    }

    var jsonErrorOptional: NSError?
    let jsonOptional: JSON! = NSJSONSerialization.JSONObjectWithData(data, options: NSJSONReadingOptions(0), error: &jsonErrorOptional)

    // 如果我们不能解析 JSON，返回错误
    if let err = jsonErrorOptional {
      callback(.Error(err))
      return
    }

    if let json = jsonOptional >>> JSONObject {
      let user = User.create <^>
                  json["id"]    >>> JSONInt    <*>
                  json["name"]  >>> JSONString <*>
                  json["email"] >>> JSONString
      if let u = user {
        callback(.Value(Box(u)))
        return
      }
    }

    // 如果我们不能解析所有的属性，就返回错误
    callback(.Error(NSError()))
  }
  task.resume()
}

```

## 重构：通过绑定消除多个返回

观察到在上面的函数中，我们的调用了`callback`函数 4 次。漏掉任何一次都会制造 bug。我们可以把这个函数分解成 3 个互不相关的部分，从而消除潜在的 bug 并重构这个函数。这三个部分是：解析响应，解析数据为 JSON 和解析 JSON 为`User`对象。这些步骤中的每一步都带有一个输入和返回下一个步骤的输入或者错误。绑定我们的`Result`类型看起来是一个不错的方案。
`parseResponse`函数需要`Result`数据和响应的状态码。iOS API 只提供了`NSURLResponse`并保证数据独立。所以我们创建一个小结构体来辅助一下：

```swift
struct Response {
  let data: NSData
  let statusCode: Int = 500

  init(data: NSData, urlResponse: NSURLResponse) {
    self.data = data
    if let httpResponse = urlResponse as? NSHTTPURLResponse {
      statusCode = httpResponse.statusCode
    }
  }
}
```

现在我们可以把`Response`结构体传入`parseResponse `函数，然后在处理数据之前处理错误。

```swift
func parseResponse(response: Response) -> Result<NSData> {
  let successRange = 200..<300
  if !contains(successRange, response.statusCode) {
    return .Error(NSError()) // 自定义你想要的错误信息
  }
  return .Value(Box(response.data))
}
```

下一个函数需要我们将一个可选值转换成`Result`类型，我们先来抽象一下。

```swift
func resultFromOptional<A>(optional: A?, error: NSError) -> Result<A> {
  if let a = optional {
    return .Value(Box(a))
  } else {
    return .Error(error)
  }
}
```

接下来的函数需要解析数据为 JSON：

```swift
func decodeJSON(data: NSData) -> Result<JSON> {
  let jsonOptional: JSON! = 
  NSJSONSerialization.JSONObjectWithData(data, 
  options: NSJSONReadingOptions(0), error: &jsonErrorOptional)
  return resultFromOptional(jsonOptional, NSError()) 
  // 使用默认的错误或者自定义错误信息
}
```

然后，我们在`User`类型中添加 JSON 到`User`类型的转换：

```swift
struct User {
  let id: Int
  let name: String
  let email: String

  static func create(id: Int)(name: String)(email: String) -> User {
    return User(id: id, name: name, email: email)
  }

  static func decode(json: JSON) -> Result<User> {
    let user = JSONObject(json) >>> { dict in
      User.create <^>
          dict["id"]    >>> JSONInt    <*>
          dict["name"]  >>> JSONString <*>
          dict["email"] >>> JSONString
    }
    return resultFromOptional(user, NSError()) // 自定义错误消息
  }
}
```

合并代码之前，需要扩展一下绑定, 让`>>>`来配合`Result`类型：

```swift
func >>><A, B>(a: Result<A>, f: A -> Result<B>) -> Result<B> {
  switch a {
  case let .Value(x):     return f(x.value)
  case let .Error(error): return .Error(error)
  }
}
```

然后我们添加一个`Result`的自定义构造器：

```swift
enum Result<A> {
  case Error(NSError)
  case Value(Box<A>)

  init(_ error: NSError?, _ value: A) {
    if let err = error {
      self = .Error(err)
    } else {
      self = .Value(Box(value))
    }
  }
}
```

现在我们可以把所有的函数使用绑定运算符连接到一起了：

```swift
func getUser(request: NSURLRequest, callback: (Result<User>) -> ()) {
  let task = NSURLSession.sharedSession().dataTaskWithRequest(request) { data, urlResponse, error in
    let responseResult = Result(error, 
    Response(data: data, urlResponse: urlResponse))
    let result = responseResult >>> parseResponse
                                >>> decodeJSON
                                >>> User.decode
    callback(result)
  }
  task.resume()
}
```

Wow，即使再次书写这些代码，我都对这些结果感到兴奋。你可能会想，"这已经非常酷炫了，我们已经迫不及待的想用它了！"，但是这还不算完!

## 重构：使用泛型抽象类型

已经非常棒了，但是我们仍然想编写这个解析器适用于任何类型。我可以使用泛型(Generics)来使得解析器完全抽象。

我们引入`JSONDecodable`协议，让上面的类型遵守它。协议看起来是这样的：

```swift
protocol JSONDecodable {
  class func decode(json: JSON) -> Self?
}
```

然后，我们编写一个函数，解析任何遵守`JSONDecodable`协议的类型为`Result`类型：

```swift
func decodeObject<A: JSONDecodable>(json: JSON) -> Result<A> {
  return resultFromOptional(A.decode(json), NSError()) // 自定义错误
}
```

现在我们可以让`User`遵守协议：

```swift
struct User: JSONDecodable {
  let id: Int
  let name: String
  let email: String

  static func create(id: Int)(name: String)(email: String) -> User {
    return User(id: id, name: name, email: email)
  }

  static func decode(json: JSON) -> User? {
    return JSONObject(json) >>> { d in
      User.create <^>
        d["id"]    >>> JSONInt    <*>
        d["name"]  >>> JSONString <*>
        d["email"] >>> JSONString
  }
}
```

我们改变了`User`的解析函数，用可选的`User`替换掉`Result<User>`。这样我们就拥有了一个抽象的函数，可以在解码后调用`resultFromOptional`，替代之前模型中必须使用的`decode`函数。

最后，我们抽象`performRequest`函数中的解析和解码过程，让它们变得更加易读。下面是最终的`performRequest `和`parseResult`函数：

```swift
func performRequest<A: JSONDecodable>(request: NSURLRequest, callback: (Result<A>) -> ()) {
  let task = NSURLSession.sharedSession().dataTaskWithRequest(request) { data, urlResponse, error in
    callback(parseResult(data, urlResponse, error))
  }
  task.resume()
}

func parseResult<A: JSONDecodable>(data: NSData!, urlResponse: NSURLResponse!, error: NSError!) -> Result<A> {
  let responseResult = Result(error, Response(data: data, urlResponse: urlResponse))
  return responseResult >>> parseResponse
                        >>> decodeJSON
                        >>> decodeObject
}
```

## 继续学习

实例代码放在了[GitHub](https://github.com/thoughtbot/FunctionalJSON-swift/tree/d3fcf771c20813e57cb54472dd8c55ee33e87ae4)上供下载
如果你对函数式编程或者这篇文章讨论的任何概念感兴趣，请查阅[Haskell](http://www.haskell.org/haskellwiki/Haskell)编程语言和[Learn You a Haskell](http://learnyouahaskell.com/)书中的[一篇特定文章](http://learnyouahaskell.com/functors-applicative-functors-and-monoids)，同时，请查阅Pat Brisbin写的博客：[Applicative Options Parsing in Haskell](http://robots.thoughtbot.com/applicative-options-parsing-in-haskell)

