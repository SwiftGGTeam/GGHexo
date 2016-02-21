使用 guard 的正确姿势

> 作者：Radek Pietruszewski，[原文链接](http://radex.io/swift/guard/)，原文日期：2015-12-14
> 译者：[Prayer](http://www.futantan.com)；校对：[Channe](undefined)；定稿：[numbbbbb](http://numbbbbb.com/)
  










`guard` 是 Swift 2 中我最喜爱的特性之一。虽然完全不使用 `guard` 也没有什么影响，它只是给我们提供了更微妙的句法表达，但是如果能够正确使用 `guard` 语句，无疑是一件令人愉快的事。它可以让我们的方法表意更加明确，更易于阅读，它能够表达『提前退出』的意图，同时提高了程序的健壮性。

因此，学习和理解如何正确使用 `guard` 表达式非常重要。`guard` 有它适用的场景，但是这并不意味着要将所有的 `if..else` 和 `if let` 语句都替换成 `guard` 语句。虽然 `guard` 语句很棒，但是很容易被滥用，并不是所有的代码结构中都适合使用 `guard` 语句。

下面是 `guard` 语句的使用原则。


## 可以用 `guard`：在验证入口条件时

这可能是最简单和最常用的情况。你写了一个方法来完成某个工作，但是只有在满足某些先决条件的情况下，方法才能够被继续执行。

例如：

    
    func updateWatchApplicationContext() {
        let session = WCSession.defaultSession()
        
        guard session.watchAppInstalled else { return }
        
        do {
            let context = ["token": api.token]
            try session.updateApplicationContext(context)
        } catch {
            print(error)
        }
    }

这样写有两个好处：

首先，在方法开头进行条件的检查，而不是将其包裹在整个的 `if` 语句之中。这样一眼就能看出，这个条件检查并不是函数本身的功用，而是函数执行的先决条件。

其次，使用 `guard` 语句时，读者和编译器就会知道如果条件为 `false`，方法将会直接 `return`。虽然这只是对编译器检查的一个细微的说明，但是从长远来看，代码的可维护性得到了加强——如果有人不小心将提前退出的语句从 `else` 表达式中移除了，编译器会及时告诉你这个错误。

## 可以用 `guard`：在成功路径上提前退出

使用场景：方法中存在非常长的执行路径，在最终结果得到之前，中间会有多个需要被满足的条件，这些条件都应该为真，否则应该直接 `return` 或者抛出异常。

    
    func vendAllNamed(itemName: String) throws {
        guard isEnabled else {
            throw VendingMachineError.Disabled
        }
        
        let items = getItemsNamed(itemName)
        
        guard items.count > 0 else {
            throw VendingMachineError.OutOfStock
        }
        
        let totalPrice = items.reduce(0, combine: +)
        
        guard coinsDeposited >= totalPrice else {
            throw VendingMachineError.InsufficientFunds
        }
        
        coinsDeposited -= totalPrice
        removeFromInventory(itemName)
        dispenseSnacks(items)
    }

## 可以用 `guard`：在可选值解包时（拍扁 `if let..else` 金字塔）

可能的场景：需要确保执行的先决条件，或者需要在很长的执行路径中，确保某些检查点的条件能够满足。但是和一些返回 `boolean` 类型的普通检查不同，你想要确保某些可选值非空且需要将它解包。

    
    func taskFromJSONResponse(jsonData: NSData) throws -> Task {
        guard let json = decodeJSON(jsonData) as? [String: AnyObject] else {
            throw ParsingError.InvalidJSON
        }
        
        guard let id = json["id"] as? Int,
              let name = json["name"] as? String,
              let userId = json["user_id"] as? Int,
              let position = json["pos"] as? Double
        else {
            throw ParsingError.MissingData
        }
        
        return Task(id: id, name: name, userId: userId, position: position)
    }

**进阶 Tip：**在 Swift 中更好的处理 JSON 方式可以[参考这里](https://github.com/LoganWright/Genome)

使用 `guard` 的方式来解包可选值是非常推荐的。`if let` 的方式需要在大括号内使用解包之后的值，而 `guard` 语句将解包之后的值添加到了之后的作用域之中——所以你可以在使用 `guard` 解包之后直接使用它，不用包裹在大括号内。

我们更推荐使用 `guard` 的方式，因为如果你有多个需要解包的可选值，使用 `guard` 的方式可以避免金字塔灾难（多个层级的 `if let` 嵌套）

对我们的大脑来说，在简单的情况下，理解一个扁平的代码路径相比于理解分析嵌套的分支结构更为容易。


## 可以用 `guard`：`return` 和 `throw` 中

提前退出，作为一种通用的适用规则，表示是以下三种情形之一：

**执行被终止**

当方法没有返回值，方法仅执行一个命令，但是该命令无法被完成时。

例子：一个用来更新 WatchKit 应用程序上下文的方法，但是这个应用没有被部署到 Apple Watch 上去。

推荐做法：直接返回

**计算的结果为空值**

方法会返回某些值，例如将输入的参数做某些转化，而转化没有被正确的执行。

例子：方法将反序列化缓存，返回一个对象数组，但是磁盘中的相应缓存不存在。

推荐的做法：

* `return nil`
* `return []`, `return ""` — 返回标准库容器的空值
* `return Account.guestAccount()` — 返回相应对象中，表示为默认或者为空的状态的值

**执行出现错误**

方法有可能因为多种原因执行失败，而同时想告知方法的调用者，这些失败的原因。

例子：方法从磁盘上读取文件内容，或者进行网络请求并解析获得的数据

推荐的做法：

* `throw FileError.NotFound`
* `return Result.Failure(.NotFound)` — 如果你要使用指定类型的返回值
* `onFailure(.NotFound); return` — 适用于异步调用
* `return Promise(error: FileError.NotFound)` — 在异步调用中使用 Promises 的情况

## 可以用 `guard`：日志、崩溃和断言中

**日志**

有时候，在方法返回之前有必要将日志信息输出到控制台，至少在开发阶段这种方式非常有用。即使在我们的代码能够很好地处理错误情况下，也能够帮助我们跟踪错误信息。然而，在 `guard` 的 `else` 语句中包含太多的处理代码是不太合适的。

**致命状态（Fatal conditions）**

程序的执行的条件不能够被满足，如果这是个非常严重的程序错误，那么故意让这种状况 crash 掉，这种处理方式将非常有意义。如果你的应用无论哪种方式都会 crash 掉，又或者程序最终会处于一种非法的状态的话，这种情形最好自己去处理。通过 `guard` 的方式，你可以确保程序在可知的情况下退出，在 crash 的时候能够显示相应的原因。

这种的使用场景通常是**precondition**：

    
    precondition(internet.kittenCount == Int.max, "Not enough kittens in the internet")

然而，如果判断的条件不仅是简单的布尔表达式而涉及到可选值的解包，可以使用 `guard`：

    
    guard let kittens = internet.kittens else {
        fatalError("OMG ran out of kittens!")
    }

**断言**

有时候，总是期望在某种条件能够被满足，然而即使条件不满足也不是什么大不了的程序错误。在这种情况下，可以考虑像下面这样使用 `assertionFailure`：

    
    guard let puppies = internet.puppies else {
        assertionFailure("Huh, no dogs")
        return nil
    }

通过这种 crash 的方式，可以在开发和内测期间很容易的找到 bug 位置，但是在正式发布的时候，应用不会 crash 掉（虽然可能 bug 满天飞）。

在提醒一次，如果判断的条件仅仅是个布尔类型，使用 `assert(condition)` 就可以胜任。

## 不要用 `guard`：替代琐碎的 `if..else` 语句


如果有一个简单的方法，只包含一个简单的 if..else 语句，不要使用 guard：

    
    // Don't:
    var projectName: String? {
        guard let project = task.project where project.isValid else {
            return nil
        }
        
        return project.name
    }

对这种简单的情况而言，使用两个分支的 `if..else` 语句比起没有分支的 `guard` 更加容易理解。虽然可能在其他的情形中使用 `guard` 也是一个很好的候选项。

    
    // Better!
    var projectName: String? {
        if let project = task.project where project.isValid {
            return project.name
        } else {
            return nil
        }
    }

**进阶 Tip：**请确保自己理解了[可选链](https://developer.apple.com/library/mac/documentation/Swift/Conceptual/Swift_Programming_Language/OptionalChaining.html#//apple_ref/doc/uid/TP40014097-CH21-ID245)：`Optional.map` 和 `Optional.flatMap`；通过使用这些工具，通常可以避免使用显式的 `if let` 来解包。

## 不要用 `guard`：作为 `if` 的相反情况

在一些语言中，例如 Ruby，有 `unless` 语句，本质上是 `if` 的相反情况（reverse if）——作用域内的代码只有在传递进来的条件被判断为 `false` 的时候执行。

Swift 中的 `guard`，虽然有一些类似，但是它们是不同的东西。`guard` 不是通常意义上的分支语义。它特别强调，在某些期望的条件不满足时，提前退出。

虽然在一些情况下，你可以将 `guard` 强行掰弯，当做 reverse if 来使用，但是，亲不要啊！使用 `if..else` 语句或者考虑将代码分割成多个函数。

    
    // Don't:
    guard let s = sequence as? Set<Element> else {
        for item in sequence {
            insert(item)
        }
        return
    }
    
    switch (s._variantStorage) {
    case .Native(let owner):
        _variantStorage = .Native(owner)
    case .Cocoa(let owner):
        _variantStorage = .Cocoa(owner)
    }

## 不要：在 `guard` 的 `else` 语句中放入复杂代码

这是上面这些原则的推论：

`guard` 的 `else` 语句中，除了一个简单的提前退出语句外，不应该有其他的代码逻辑。加入一些诊断日志的代码是可以的，但是其他的代码逻辑不应该有。当然也可以在 `else` 中加入一些对未完成工作的清理或者打开资源的释放，虽然大部分情况下，你应该使用 `defer` 来完成这些清理工作。

总之，如果你在 `else` 块做了任何实际功能，除了那些离开当前方法的必要操作，你就误用了 `guard`。

**经验之谈: **`guard` 的 `else` 代码块不要多于 2-3 行代码。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。