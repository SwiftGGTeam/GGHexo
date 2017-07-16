title: "Swift：使用自定义初始化方法进行依赖注入"
date: 2016-03-07 09:00:00
tags: [Swift]
categories: [Natasha The Robot]
permalink: swift-dependency-injection-with-a-custom-initializer
keywords: swift自定义初始化方法,swift依赖注入
custom_title: 
description: Swift自定义初始化方法来依赖注入是很多人还不会吧，那么来学习本文就会让你知晓哦。

---
原文链接=https://www.natashatherobot.com/swift-dependency-injection-with-a-custom-initializer/
作者=Natasha The Robot
原文日期=2016-01-08
译者=littledogboy
校对=Cee
定稿=千叶知风

<!--此处开始正文-->

作为我今年的第一个项目，我正在做 [@catehstn’s iOS Unit Testing Workshop](http://www.catehuston.com/blog/2015/04/15/launching-ios-unit-testing-beyond-the-model/) 的 **Swift 版本**。如果感兴趣的话，可以在[这里注册](https://docs.google.com/forms/d/1IrOYxAMES34uXdJoCiqmzXtkDsHfVM3SUueZViHjstM/viewform?c=0&w=1)。

在我写代码和测试期间，我遇到了下面的问题...

<!--more-->

假设我使用 Swift 创建了一个简单的计数器：

```swift
// Counter.swift
 
struct Counter {
    // `count` 在这里为一个变量
    // 但是我不想把 `count` 设置为外部可访问的 
    // 因此我把 `count` 设置为私有的（这里有小提示！https://twitter.com/mipstian/status/685489964403003393）
    private(set) var count: Int
    
    init() {
        // 我想让计数器默认从 0 开始
        count = 0
    }
    
    // 我只想让 `count` 通过此函数被修改
	// 通过像这样的函数 
    mutating func increment() {
        count += 1
    }
}
```

这个结构体超级简单，我也很容易地编写了一个 increment 测试用例。

```swift
// CounterTests.swift
 
 
import XCTest
@testable import Counter
 
class CounterTests: XCTestCase {
 
   func testIncrement() {
       var counter = Counter()
       XCTAssertEqual(counter.count, 0)
       counter.increment()
       XCTAssertEqual(counter.count, 1)
   }
  
}
```

测试正确，但是下面这种情况呢！

```swift
// Counter.swift
 
struct Counter {
    private(set) var count: Int
   
    init() {
        count = 0
    }
 
    // 代码缩减 (见上面)
 
    // 当用户进行内购
    // 提升了他们的分数！

    mutating func scaleBy(multiplier: Int) {
        count = count * multiplier
    }
}
```

因为 Counter 的值初始化为 0，乘法测试没有效果。

```swift
// CounterTests.swift
 
class CounterTests: XCTestCase {
 
   func testScaleBy() {
      var counter = Counter()
      XCTAssertEqual(counter.count, 0)
      counter.scaleBy(5)
      // 正如我们所知，scaleBy 可以做多次乘法运算和除法运算
      // 要么只是返回 count ，要么只是返回 0
      XCTAssertEqual(counter.count, 0)
   }
}
```

为了进行有效的测试,我们需要在 count 不为 0 的情况下测试我们的 scaleBy 方法，所以我们需要控制计数器的初始值。我们可以使用默认值和正确的初始值注入 init 函数（译者注：作者这里的意思是，如果初始化的时候，不给 init 函数参数，则使用默认值；反之则使用给定的初始值。）：

```swift
// Counter.swift
 
struct Counter {
    private(set) var count: Int
    
    // 依赖注入
    // 计数器的初始值是注入的
    init(count: Int = 0) {
        self.count = count
    }
    
    mutating func scaleBy(multiplier: Int) {
        count = count * multiplier
    }
}
```

现在测试如下！

```swift
// CounterTests.swift

class CounterTests: XCTestCase {

   func testScaleBy() {
      // 这次计数器从一个不为零的值开始
      var counter = Counter(count: 5)
      XCTAssertEqual(counter.count, 5)
      counter.scaleBy(5)
      XCTAssertEqual(counter.count, 25)
   }
}
```

就是这样！通过添加一个初始值是我们想要的初始化函数，我们保持了计数器的完整性，该函数的作用是编写有效的测试！