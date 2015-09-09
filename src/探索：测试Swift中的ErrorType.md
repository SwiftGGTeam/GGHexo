title: "深入研究 Swift 中的 ErrorType"
date: 2015-9-9
tags: [Swift]
categories: [Realm]
permalink: testing-swifts-errortype

---
原文链接=https://realm.io/news/testing-swift-error-type/
作者=Marius Rackwitz
原文日期=2015/08/02
译者=mmoaay
校对=shanks
定稿=numbbbbb

*在本篇中，我们对 Swift 新错误类型的本质进行深入研究并分析如何实现错误处理及其限制。最后我们以一个说明样例和一些有用的资源结尾*


## 如何实现 `ErrorType` 协议

如果跳转到 Swift 标准库中 `ErrorType` 定义的位置，我们就会发现它并没有包含明显的要求。

```swift
protocol ErrorType {
}
```

然而，当我们试着去实现 `ErrorType` 时，很快就会发现为了满足这个协议至少有*一些东西*是必须的。比如，如果以枚举的方式实现它，一切 OK。

```swift
enum MyErrorEnum : ErrorType {
}
```

但是如果以结构体的方式实现它，问题来了。

```swift
struct MyErrorStruct : ErrorType {
}
```

![](https://realm.io/assets/news/swift-error-handling-errortype-struct.png)

我们最初的想法是，也许 `ErrorType` 是一种特殊类型，编译器以特殊的方式来对它进行支持，而且只能用 Swift 原生的枚举来实现。但随后你又会想起 `NSError` 也满足这个协议，所以它不可能有那么特殊。所以我们下一步的尝试就是：通过一个 `NSObject` 的派生类实现这个协议

```swift
@objc class MyErrorClass: ErrorType {
}
```

不幸的是，仍然不行。

![](https://realm.io/assets/news/swift-error-handling-errortype-class.png)

**更新**：从 Xcode 7 beta 5 版本开始，我们可能不需要花费其他精力就可以为结构体和类实现 `ErrorType` 协议。所以下面的解决方法也不再需要了，但是仍然留作参考。

> 允许结构体和类实现  `ErrorType`  协议。（21867608）

## 怎么会这样？

---

通过 `LLDB` 进一步分析发现这个协议有一些隐藏的要求。

```
(lldb) type lookup ErrorType
protocol ErrorType {
  var _domain: Swift.String { get }
  var _code: Swift.Int { get }
}
```

这样一来 `NSError` 满足这个定义的原因就很明显了：它有这些属性，在 `ivars` 的支持下，不用动态查找就可以被 Swift 访问。还有一点不明白的是为什么 Swift 的一等公民（first class）枚举可以自动满足这个协议。也许其内部仍然存在一些魔法？

如果我们用我们新获得的知识再去实现结构体和类，一切就OK了。

```swift
struct MyErrorStruct : ErrorType {
  let _domain: String
  let _code: Int
}

class MyErrorClass : ErrorType {
  let _domain: String
  let _code: Int

  init(domain: String, code: Int) {
    _domain = domain
    _code = code
  }
}
```

## 捕获其他被抛出的错误

---

历史上，Apple 的框架中的 `NSErrorPointer` 模式在错误处理中起到了重要作用。在 Objective-C 的 API 与 Swift 完美衔接的情况下，这些已经变得更加简单。确定域的错误会以枚举的方式暴露出来，这样就可以简单的在不使用“魔法数字“的情况下捕获它们。但是如果你需要捕获一个没有暴露出来的错误，该怎么办呢？

假设我们需要反序列化一个 JSON 串，但是不确定它是不是有效。我们将使用 `Foundation` 的 `NSJSONSerialization` 来做这件事情。当我们传给它一个异常的 JSON 串时，它会抛出一个错误码为 **3840** 的错误。

当然，你可以用通用的错误来捕获它，然后手动检查 `_domain` 和 `_code` 域，但是我们有更优雅的替代方案。

```swift
let json : NSString = "{"
let data = json.dataUsingEncoding(NSUTF8StringEncoding)
do {
    let object : AnyObject = try NSJSONSerialization.JSONObjectWithData(data!, options: [])
    print(object)
} catch let error {
    if  error._domain == NSCocoaErrorDomain && error._code == 3840 {
        print("Invalid format")
    } else {
        throw error
    }
}
```

另外一个替代方案就是我们引入一个通用的错误结构体，这个结构体通过我们之前发现的方法满足 `ErrorType` 协议。当我们为它实现模式匹配操作符 `~=` 时，我们就可以在 `do … catch` 分支中使用它。

```swift
struct Error : ErrorType {
    let domain: String
    let code: Int
    
    var _domain: String {
        return domain
    }
    var _code: Int {
        return code
    }
}

func ~=(lhs: Error, rhs: ErrorType) -> Bool {
    return lhs._domain == rhs._domain
        && rhs._code == rhs._code
}

let json : NSString = "{"
let data = json.dataUsingEncoding(NSUTF8StringEncoding)
do {
    let object : AnyObject = try
     NSJSONSerialization.JSONObjectWithData(data!, options: [])
    print(object)
} catch Error(domain: NSCocoaErrorDomain, code: 3840) {
    print("Invalid format")
}
```

但在当前情况下，还可以用 `NSCocoaError`，这个辅助类包含大量定义了各种错误的静态方法。

这里所产生的叫做 `NSCocoaError.PropertyListReadCorruptError` 错误，虽然不是那么明显，但是它确实有我们需要的错误码。不管你是通过标准库还是第三方框架捕获错误，如果有像这样的东西，你就应该使用已有常数而不是自己再去定义一次。

```swift
let json : NSString = "{"
let data = json.dataUsingEncoding(NSUTF8StringEncoding)
do {
    let object : AnyObject = try NSJSONSerialization.JSONObjectWithData(data!, options: [])
    print(object)
} catch NSCocoaErrorDomain {
    print("Invalid format")
}
```

## 自定义错误处理的编写规范

---

所以下一步做什么呢？在用 Swift 的错误处理给我们的代码加料之后，不管我们是替换所有那些让人分心的 `NSError` 指针赋值，还是退一步到功能范式中的 `Result` 类型， 我们都需要确保我们所预期的错误会被正确抛出。边界值永远是测试时最有趣的场景，我们想要确认所有的保护措施都是到位的，而且在适当的时候会抛出相应的错误。

现在我们对这个错误类型在底层的工作方式有了一些基本的认识，同时对如何在测试时让它遵循我们的意愿也有了一些想法。所以我们来展示一个小的测试用例：我们有一个银行 App，然后我们想在业务逻辑里面为现实活动建模型。我们创建了代表银行帐号的结构体`Account`，它包含一个接口，这个接口暴露了一个方法用来在预算范围内进行交易。

```swift
public enum Error : ErrorType {
    case TransactionExceedsFunds
    case NonPositiveTransactionNotAllowed(amount: Int)
}

public struct Account {
    var fund: Int
    
    public mutating func withdraw(amount: Int) throws {
        guard amount < fund else {
            throw Error.TransactionExceedsFunds
        }
        guard amount > 0 else {
            throw Error.NonPositiveTransactionNotAllowed(amount: amount)
        }
        fund -= amount
    }
}

class AccountTests {
    func testPreventNegativeWithdrawals() {
        var account = Account(fund: 100)
        do {
            try account.withdraw(-10)
            XCTFail("Withdrawal of negative amount succeeded, 
            but was expected to fail.")
        } catch Error.NonPositiveTransactionNotAllowed(let amount) {
            XCTAssertEqual(amount, -10)
        } catch {
            XCTFail("Catched error \"\(error)\", 
            but not the expected: \"\(Error.NonPositiveTransactionNotAllowed)\"")
        }
    }
    
    func testPreventExceedingTransactions() {
        var account = Account(fund: 100)
        do {
            try account.withdraw(101)
            XCTFail("Withdrawal of amount exceeding funds succeeded, 
            but was expected to fail.")
        } catch Error.TransactionExceedsFunds {
            // 预期结果
        } catch {
            XCTFail("Catched error \"\(error)\", 
            but not the expected: \"\(Error.TransactionExceedsFunds)\"")
        }
    }
}
```

现在假想我们有更多的方法和更多的错误场景。在以测试为导向的开发方式下，我们想对它们都进行测试，从而保证所有的错误都被正确的抛出来——我们当然不想把钱转到错误的地方去！理想情况下，我们不想在所有的测试代码中都重复这个 `do-catch` 。实现一个抽象，我们可以把它放到一个高阶函数中。

```swift
/// 为 ErrorType 实现模式匹配
public func ~=(lhs: ErrorType, rhs: ErrorType) -> Bool {
    return lhs._domain == rhs._domain
        && lhs._code   == rhs._code
}

func AssertThrow<R>(expectedError: ErrorType, @autoclosure _ closure: () throws -> R) -> () {
    do {
        try closure()
        XCTFail("Expected error \"\(expectedError)\", "
            + "but closure succeeded.")
    } catch expectedError {
        // 预期结果.
    } catch {
        XCTFail("Catched error \"\(error)\", "
            + "but not from the expected type "
            + "\"\(expectedError)\".")
    }
}
```

这段代码可以这样使用：

```swift
class AccountTests : XCTestCase {
    func testPreventExceedingTransactions() {
        var account = Account(fund: 100)
        AssertThrow(Error.TransactionExceedsFunds, try account.withdraw(101))
    }
    
    func testPreventNegativeWithdrawals() {
        var account = Account(fund: 100)
        AssertThrow(Error.NonPositiveTransactionNotAllowed(amount: -10), try account.withdraw(-20))
    }
}
```

但你可能会发现， 预期出现的参数化错误 `NonPositiveTransactionNotAllowed` 比这里所用到的参数要多个 `amount`。我们该如何对错误场景和它们相关的值做出强有力的假设呢？ 首先，我们可以为错误类型实现 `Equatable` 协议, 然后在相等操作符的实现中添加对相关场景的参数个数的检查。

```swift
/// 对我们的错误类型进行扩展然后实现 `Equatable`。
/// 这必须是对每一个具体的类型来做的，
/// 而不是为 `ErrorType` 统一实现。
extension Error : Equatable {}

/// 为协议 `Equatable` 以 required 的方式实现 `==` 操作符。
public func ==(lhs: Error, rhs: Error) -> Bool {
    switch (lhs, rhs) {
    case (.NonPositiveTransactionNotAllowed(let l), .NonPositiveTransactionNotAllowed(let r)):
        return l == r
    default:
        // 我们需要在默认场景，为各种组合场景返回 false。
        // 通过根据 domain 和 code 进行比较的方式，我们可以保证
        // 一旦我们添加了其他的错误场景，如果这个场景有相应的值
        // 我只需要回来修改 Equatable 的实现即可
        return lhs._domain == rhs._domain
            && lhs._code   == rhs._code
    }
}
```

下一步就是让 `AssertThrow` 知道有合理的错误。你可能会想，我们可以扩展已存在的 `AssertThrow` 实现，只是简单检查一下预期的错误是否合理。但是不幸的是根本没用：

> “Equatable” 协议只能被当作泛型约束，因为它需要满足 Self 或者关联类型的必要条件

相反，我们可以通过多一个泛型参数做首参的方式重载 `AssertThrow` 。

```swift
func AssertThrow<R, E where E: ErrorType, E: Equatable>(expectedError: E, @autoclosure _ closure: () throws -> R) -> () {
    do {
        try closure()
        XCTFail("Expected error \"\(expectedError)\", "
            + "but closure succeeded.")
    } catch let error as E {
        XCTAssertEqual(error, expectedError,
            "Catched error is from expected type, "
                + "but not the expected case.")
    } catch {
        XCTFail("Catched error \"\(error)\", "
            + "but not the expected error "
            + "\"\(expectedError)\".")
    }
}
```

然后跟预期一样我们的测试最终返回了失败。

注意后者的断言实现就对错误的类型进行了强有力的假设。

不要使用“捕获其他被抛出的错误”下面的方法，因为跟目前的方法相比，它不能匹配类型。很有可能这种错误超出了我们的控制了。

## 一些有用的资源

---

在 Realm，我们使用 XCTest 和我们自产的 `XCTestCase` 子类并结合一些 预测器，这样刚好可以满足我们的特殊需求。值得高兴的是，如果要使用这些代码，你不需要拷贝-粘帖，也不需要重新造轮子。错误预测器在 GitHub 的 [CatchingFire](https://github.com/mrackwitz/CatchingFire) 项目中都有，如果你不是 `XCTest` 预测器风格的大粉丝，那么你可能会更喜欢类似 [Nimble](https://github.com/Quick/Nimble/issues/136) 的测试框架，它们也可以提供测试支持。

要开心的测试哦~
