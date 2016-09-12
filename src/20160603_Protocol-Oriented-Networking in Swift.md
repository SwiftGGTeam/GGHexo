title: "用 Swift 编写面向协议的网络请求"
date: 2016-06-03
tags: [Swift 进阶]
categories: [Natasha The Robot]
permalink: protocol-oriented-networking-in-swift
permalink: protocol-oriented-networking-in-swift
keywords: swift面向协议,swift网络请求
custom_title: 
description: 在 Swift 中怎么编写面向协议的网络请求呢，本文就来举例实战下吧。

---
原文链接=https://www.natashatherobot.com/protocol-oriented-networking-in-swift/
作者=Natasha The Robot
原文日期=2016/05/12
译者=saitjr
校对=Channe
定稿=CMB

<!--此处开始正文-->

*[和我一起参加](http://www.tryswiftnyc.com)9 月 1 日 - 9月 2 日在纽约举办的 Swift 社区庆典🎉吧！使用优惠码 NATASHATHEROBOT 可以获得 $100 的折扣！*

我最近做了个 Swift [面向协议编程实践](http://www.slideshare.net/natashatherobot/practial-protocolorientedprogramming)（POP💥） 的演讲。视频还在处理中。另一方面，这是演讲中 POP 视图部分的文本记录，供我和其他任何人作参考！

<!--more-->

## 普通的配置方式

假设我们要做一款展示全球美食图片和信息的 App。这需要从 API 上拉取数据，那么，用一个对象来做网络请求也就是理所当然的了：

```swift
struct FoodService {
    
    func get(completionHandler: Result<[Food]> -> Void) {
        // 异步网络请求
        // 返回请求结果
    }
}
```

一旦我们创建了异步请求，就不能使用 Swift 內建的错误处理来同时返回成功响应和请求错误了。不过，倒是给练习 Result 枚举创造了机会（更多关于 Result 枚举的信息可以参考 [Error Handling in Swift: Might and Magic](https://nomothetis.svbtle.com/error-handling-in-swift)），下面是一个最基础的 Result 写法：

```swift
enum Result<T> {
    case Success(T)
    case Failure(ErrorType)
}
```

当 API 请求成功，回调便会获得 `Success` 状态与能正确解析的数据 —— 在当前 `FoodService` 例子中，成功的状态包含着美食信息数组。如果请求失败，会返回 `Failure` 状态，并包含错误信息（如 400）。

`FoodService` 的 `get` 方法（发起 API 请求）通常会在 ViewController 中调用，ViewController 来决定请求成功失败后具体的操作逻辑：

```swift
// FoodLaLaViewController
 
var dataSource = [Food]() {
    didSet {
        tableView.reloadData()
    }
}
 
override func viewDidLoad() {
    super.viewDidLoad()
    getFood()
}
 
private func getFood() {
    // 在这里调用 get() 方法
    FoodService().get() { [weak self] result in
        switch result {
        case .Success(let food):
            self?.dataSource = food
        case .Failure(let error):
            self?.showError(error)
        }
    }
}
```

但，这样处理有个问题...

## 有什么问题

关于 ViewController 中 `getFood()` 方法的问题是：ViewController 太过依赖这个方法了。如果没有正确的发起 API 请求或者请求结果（无论 `Success` 还是 `Failure`）没有正确的处理，那么界面上就没有任何数据显示。

为了确保这个方法没问题，给它写测试显得尤为重要（如果实习生或者你自己以后一不小心改了什么，那界面上就啥都显示不出来了）。是的，View Controller Tests 😱！

说实话，它没那么麻烦。这有一个[黑魔法](https://www.natashatherobot.com/ios-testing-view-controllers-swift/)来配置 View Controller 测试。

OK，现在已经准备好进行 View Controller 测试了，下一步要做什么？！

## 依赖注入

为了正确地测试 ViewController 中 `getFood()` 方法，我们需要注入 `FoodService`（依赖），而不是直接调用这个方法！

```swift
// FoodLaLaViewController
 
override func viewDidLoad() {
    super.viewDidLoad()
 
    // 传入默认的 food service
    getFood(fromService: FoodService())
}
 
// FoodService 被注入
func getFood(fromService service: FoodService) {
    service.get() { [weak self] result in
        switch result {
        case .Success(let food):
            self?.dataSource = food
        case .Failure(let error):
            self?.showError(error)
        }
    }
}
```

下面的方法便可开始测试：

```swift
// FoodLaLaViewControllerTests
 
func testFetchFood() {
    viewController.getFood(fromService: FoodService())
    
    // 🤔 接下来?
}
```

接下来，我们需要对 `FoodService` 返回值类型进行更多的约束。

## 绝杀 —— 协议

目前 `FoodService` 的结构体是这样：

```swift
struct FoodService {
    
    func get(completionHandler: Result<[Food]> -> Void) {
        // 发起异步请求
        // 返回请求结果
    }
}
```

为了方便测试，我们需要能够重写 `get` 方法，来控制哪个 Result（`Success` 或 `Failure`）传给 ViewController，之后就可以测试 ViewController 是如何处理这两种结果。

因为 `FoodService` 是结构体类型，所以不能对其子类化。但是，你猜怎样，我们可以使用协议来达到重写目的。

我们可以将功能性代码单独提到一个协议中：

```swift
protocol Gettable {
    associatedtype Data
    
    func get(completionHandler: Result<Data> -> Void)
}
```

注意这里标明了引用类型（associated type）。这个协议将会用在所有的 service 结构体上，现在我们只让 `FoodService` 去遵循，但是以后还会有 `CakeService` 或者 `DonutService` 去遵循。通过使用这个通用性的协议，就可以在 App 中非常完美的统一所有 service 了。

现在，唯一需要改变的就是 `FoodService` —— 让它遵循 `Gettable` 协议：

```swift
struct FoodService: Gettable {
    
    // [Food] 用于限制传入的引用类型
    func get(completionHandler: Result<[Food]> -> Void) {
        // 发起异步请求
        // 返回请求结果
    }
}
```

这样写还有一个好处 —— 良好的可读性。看到 `FoodService` 时，你会立刻注意到 `Gettable` 协议。你也可以创建类似的 `Creatable`，`Updatable`，`Delectable`，这样，service 能做的事情显而易见！

## 使用协议 💪

是时候重构一下了！在 ViewController 中，相比之前直接调用 `FoodService` 的 `getFood` 方法，我们现在可以将 `Gettable` 的引用类型限制为 `[Food]`。

```swift
// FoodLaLaViewController
 
override func viewDidLoad() {
    super.viewDidLoad()
    
    getFood(fromService: FoodService())
}
 
func getFood<Service: Gettable where Service.Data == [Food]>(fromService service: Service) {
    service.get() { [weak self] result in
        
        switch result {
        case .Success(let food):
            self?.dataSource = food
        case .Failure(let error):
            self?.showError(error)
        }
    }
}
```

现在，测试起来容易多了！

## 测试

要测试 ViewController 的 `getFood` 方法，我们需要注入遵循 `Gettable` 并且引用类型为 `[Food]` 的 service：

```swift
// FoodLaLaViewControllerTests
 
class Fake_FoodService: Gettable {
    
    var getWasCalled = false
    // 你也可以在这里定义一个失败结果变量，用来测试失败状态
    // food 变量是一个数组(在此仅为测试目的)
    var result = Result.Success(food)
    
    func get(completionHandler: Result<[Food]> -> Void) {
        getWasCalled = true
        completionHandler(result)
    }
}
```

所以，我们可以注入 `Fake_FoodService` 来测试 ViewController 的确发起了请求，并正确的返回了 `[Food]` 类型的结果（**定义为 `[Food]` 是因为 TableView 的 data source 所要用到的类型就是 `[Food]`**）：

```swift
// FoodLaLaViewControllerTests
 
func testFetchFood_Success() {
    let fakeFoodService = Fake_FoodService()
    viewController.getFood(fromService: fakeFoodService)
    
    XCTAssertTrue(fakeFoodService.getWasCalled)
    XCTAssertEqual(viewController.dataSource.count, food.count)
    XCTAssertEqual(viewController.dataSource, food)
}
```

现在你也可以仿照这个写法完成失败状态的测试（比如，根据收到的 `ErrorType` 显示对应的错误信息）。

## 总结

使用协议来封装网络层，可以使代码**统一**、 **可注入**、 **可测试**、**更可读**。

POP 万岁！
