title: "在 Swift 中使用 Objective-C 风格的异步 API"
date: 2017-02-15
tags: [Swift 进阶]
categories: [Ole Begemann]
permalink: result-init-helper
keywords: 
custom_title: 
description: 

---
原文链接=https://oleb.net/blog/2017/01/result-init-helper/
作者=Ole Begemann
原文日期=2017-01-19
译者=Cwift
校对=walkingway
定稿=CMB

<!--此处开始正文-->

许多 Objective-C 风格的异步 API 会在它们的回调闭包中传入两个可选类型值：一个代表操作成功时方法的返回值，另一个代表操作失败时返回的错误值。

<!--more-->

一个例子是 Core Location 框架中的 [CLGeocoder.reverseGeocodeLocation](https://developer.apple.com/reference/corelocation/clgeocoder/1423621-reversegeocodelocation) 方法。它接受一个 [CLLocation]() 对象，然后将坐标信息发送到 Web 服务器，服务器会将坐标解析为[可读的地址](https://en.wikipedia.org/wiki/Reverse_geocoding)。当网络请求完成时，该方法会调用回调闭包，参数为一个存储 [CLPlacemark](https://developer.apple.com/reference/corelocation/clplacemark) 对象的可选数组以及一个可选型的 [Error](https://developer.apple.com/reference/corelocation/clerror.code) 对象：

```swift
class CLGeocoder {
    ...
    func reverseGeocodeLocation(_ location: CLLocation,
        completionHandler: @escaping ([CLPlacemark]?, Error?) -> Void)
    ...
}
```

在 Objective-C 风格的 API 中，返回一对可选型的成功值和错误的模式是处理这种情况时最实用的方案。

## 两个可能的结果，四个潜在的状态

当前 API 的问题是，操作实际上只有*两种*可能：请求成功并返回结果，或者失败并返回错误。然而，这段代码却允许*四种*不同的状态：

1. 结果非空，错误为空。
2. 错误非空，结果为空。
3. 二者都不为空。
4. 二者都为空。

API 的文档可以明确排除最后两种情况，但作为用户，你永远都不能真正确保文档是正确的。

## 使用 Result 实现更优的设计

在 Swift 中你可能像这样设计同样的 API：

```swift
class CLGeocoder {
    ...
    func reverseGeocode(location: CLLocation,
        completion: @escaping (Result<[CLPlacemark]>) -> Void)
    ...
}
```

现在回调闭包中只接受一个（非可选型）参数，它的类型为 `Result<...>`。`Result` 是一个枚举，与 Swift 中的 [Optional](https://developer.apple.com/reference/swift/optional) 类型非常相似。唯一的区别是：它可以在失败时保存错误值，而 `Optional` 只有成功时的关联值：

```swift
enum Result<T> {
    case success(T)
    case failure(Error)
}
```

`Result` 目前还不是 Swift 标准库中的成员，但它可能会在将来被引入。在此之前，自己定义它也很简单，或者可以使用当前流行的 [antitypical / Result](https://github.com/antitypical/Result) 库。(注：这个库中的 `Result` 与我这里使用的类型略有不同：它使用强类型的错误，即它有第二个泛型参数表示错误的类型。)

使用这个虚构的新 API，编译器可以保证传递给回调闭包的参数只能有两个状态，即成功或失败。你不必担心两个值都存在或都不存在的情形。

## 一个把 (T?, Error?) 转换成 Result<T> 的构造器

然而我们不能修改苹果的 API，所以对回调闭包中参数固有的模糊性无能为力。我们能做的是包含一个将可选的成功值和可选错误转换为单个 `Result` 值的逻辑。我在代码中为 `Result` 定义了一个便捷构造器：

```swift
import Foundation // needed for NSError

extension Result {
    ///通过一个可选型的成功值与一个可选型的错误值
    ///初始化一个 Result 对象。 
    /// 以便把苹果的异步 API 返回的值转换为一个 Result。
    init(value: T?, error: Error?) {
        switch (value, error) {
        case (let v?, _):
            // 如果值是非空的忽略错误
            self = .success(v)
        case (nil, let e?):
            self = .failure(e)
        case (nil, nil):
            let error = NSError(domain: "ResultErrorDomain", code: 1,
                userInfo: [NSLocalizedDescriptionKey:
                    "Invalid input: value and error were both nil."])
            self = .failure(error)
        }
    }
}
```

当两个输入都为 `nil`（通常不应该发生）的情况下，创建一个自定义错误放入结果中。此处我使用了 [NSError]()，不过你可以使用任何遵守了 `Error` 协议的类型。定义了这个构造器之后，我像下面这样使用地理编码器的 API：

```swift
let location = ...
let geocoder = CLGeocoder()
geocoder.reverseGeocodeLocation(location) { placemarks, error in
    // 把参数转换为 Result
    let result = Result(value: placemarks, error: error)
    // 只对这里的 result 做操作
    switch result {
    case .success(let p): ...
    case .failure(let e): ...
    }
}
```

使用了额外的一行代码，将参数转换为一个 `Result` 类型的值，从那时起，我就不必再担心未处理的情况了。

**2017 年 1 月 20 日的更新：**[Shawn Throop 建议](https://twitter.com/shawnthroop/status/822414872285679616)优化我之前所述的 `CLGeocoder` 扩展中的代码。你的代码将只调用基于 `Result` 的方法，这个方法会在内部调用原始的 API 并负责类型的转换：

```swift
extension CLGeocoder {
    func reverseGeocode(location: CLLocation,
        completion: @escaping (Result<[CLPlacemark]>) -> Void) {
        reverseGeocodeLocation(location) { placemarks, error in
            completion(Result(value: placemarks, error: error))
        }
    }
}
```