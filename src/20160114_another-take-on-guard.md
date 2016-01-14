title: "关于 guard 的另一种观点"
date: 2016-01-14
tags: [Erica Sadun]
categories: [Swift 进阶]
permalink: another-take-on-guard

---

原文链接=http://ericasadun.com/2016/01/01/another-take-on-guard/

作者=Erica Sadun
原文日期=2016-01-01
译者=walkingway
校对=saitjr
定稿=shanks

<!--此处开始正文-->

今天，[iOS Dev 周刊](https://iosdevweekly.com) 贴出一篇 Alexei Kuznetsov 的关于『从你的代码中删除 `guard` 』的[文章](https://medium.com/swift-programming/why-swift-guard-should-be-avoided-484cfc2603c5)。Kuznetsov 指出支持他这篇文章的理论依据主要来自于 Robert C. Martin，这位世界顶级软件开发大师提出：**代码必须精简**。即关于函数存在两条规则，第一条：函数应该保持精简；第二条：没有最精简，只有更精简。Alexei Kuznetsov 表示应将 Martin 的理论应用在今后的 Swift 开发中。

Kuznetsov 写到『使用 `guard` 语句能有效减少函数中的嵌套数量，但 `guard` 存在一些问题。使用 `guard` 语句会使我们在一个函数中做更多的事情，以及维护多个级别的抽象。如果我们坚持短小、功能单一的函数，就会发现根本不需要 `guard`』。

我写这篇文章的目的是为了反驳 Kuznetsov 提出的观点，接下来我要说说我的看法。

## 代码

下面的代码片段来自于苹果官方《Swift Programming Language》书中的示例，他设计了一个虚拟的自动贩卖机。 `vend` 函数实现了『顾客成功付款后，将商品分发到消费者手中』的功能。如果我没数错的话，官方提供的原始函数一共是 18 行代码（25 ~ 42 行），这个数量包括三条 `guard` 语句，四条执行语句，以及他们之间的换行符。

``` swift
struct Item {
	var price: Int
	var count: Int
}

enum VendingMachineError: ErrorType {
	case InvalidSelection
	case InsufficientFunds(coinsNeeded: Int)
	case OutOfStock
}

class VendingMachine {
	var inventory = [
		"Candy Bar": Item(price: 12, count: 7),
		"Chips": Item(price: 10, count: 4),
		"Pretzels": Item(price: 7, count: 11)
    ]

	var coinsDeposited = 0
	
	func dispense(snack: String) {
		print("Dispensing \(snack)")
    }

	func vend(itemNamed name: String) throws {
		guard var item = inventory[name] else {
			throw VendingMachineError.InvalidSelection
        }

		guard item.count > 0 else {
			throw VendingMachineError.OutOfStock
        }

		guard item.price <= coinsDeposited else {
			throw VendingMachineError.InsufficientFunds(coinsNeeded: item.price - coinsDeposited)
        }

        coinsDeposited -= item.price
        --item.count
        inventory[name] = item
        dispense(name)
    }
}
```

Kuznetsov 重构了官方自动贩卖机的代码，去掉 `guard` 语句，并尽量缩减了每个函数的语句数量。恕我直言，我不喜欢这种重构，看完他的代码来解释下原因。

``` swift
func vend(itemNamed name: String) throws {
    let item = try validatedItemNamed(name)
    reduceDepositedCoinsBy(item.price)
    removeFromInventory(item, name: name)
    dispense(name)
}

private func validatedItemNamed(name: String) throws -> Item {
    let item = try itemNamed(name)
    try validate(item)
    return item
}

private func reduceDepositedCoinsBy(price: Int) {
    coinsDeposited -= price
}

private func removeFromInventory(var item: Item, name: String) {
    --item.count
    inventory[name] = item
}

private func itemNamed(name: String) throws -> Item {
    if let item = inventory[name] {
        return item
    } else {
        throw VendingMachineError.InvalidSelection
    }
}

private func validate(item: Item) throws {
    try validateCount(item.count)
    try validatePrice(item.price)
}

private func validateCount(count: Int) throws {
    if count == 0 {
        throw VendingMachineError.OutOfStock
    }
}

private func validatePrice(price: Int) throws {
    if coinsDeposited < price {
        throw VendingMachineError.InsufficientFunds(coinsNeeded: price - coinsDeposited)
    }
}
```

## 重构的结果不但冗长，而且复杂

Kuznetsov 的主要目标是缩减函数的尺寸。但重构的结果却是『将之前 18 行代码骤增到 46 行』，并且将这些逻辑分散在至少八个函数中。这种形式的重构降低了代码的可读性，一个简单的线性故事变成了一个混乱的集合，没有清晰的业务逻辑。

重构之后，新的 `vend` 函数依赖七个方法调用。现在开始进入你的思维殿堂，想象当用户点击了贩卖按钮，此刻你将注意力放在这些新触发的方法调用上，为了理解整个流程，不得不分散你的注意力在这些方法上反复游走。

Kuznetsov 将一个统一的函数分割开来，这里我要引用一篇 George Miller 的论文：[神奇数字 7](https://en.wikipedia.org/wiki/The_Magical_Number_Seven,_Plus_or_Minus_Two)。不仅是因为 8 明显比 1 大，更是因为『能集中注意力』才是 Martin 简化函数的主要目的。针对这些问题 Kuznetsov 的重构显然是不及格的。

## 重构将『先决条件』视为一个单独的任务

下面的批评有点不客气，Kuznetsov 误解了 `guard` 的作用。在他的文章中，`guard` 的作用是减少嵌套。我觉得他根本就不懂 `guard`，正如我之前[文章](http://ericasadun.com/2015/12/29/migrating-ifs-to-guards-in-swift/)中的观点，`guard` 同样也是 `assert/precondition` 大家族中重要的一员：『一般意义上的 `guard` 语句定义了执行的先决条件，同样也提供在不满足条件时，引导大家撤退的安全路线。』

Kuznetsov’s 重新设计的断言被归为一个断言树。主功能函数 `validateItemNamed` 首先会调用 `validate`，接着，`validate` 分别去调用其内部的两个验证方法： `validateCount` 和 `validatePrice`。我认为这种基于树的布局很难阅读且不易维护，也增加了不必要的复杂性。

当错误发生时，你必须要从错误发生节点回溯到最初调用 `try vend` 地方。比如资金不足会导致 `validatePrice` 验证失败，然后退回到 `validate`，再退回到 `validatedItemNamed`，最后回到引发失败的始作俑者 `vend`。这只是一个简单的错误，但却走了很长一段路。我们可以认定：这种将『验证任务』从『使用任务』中分离出来的做法是不正确的。

在苹果的官方版本中，三条 `guard` 语句通过预先检查『输入』和『状态』，来限制对核心功能的访问。更重要的是，`guard` 说明了继续执行下面代码的先决条件。通过运用 `guard` 语句，Apple 在断言（assertions）和动作（actions）之间建立了一种直接联系，即：如果测试通过，就执行这些动作。

断言（assertions）和动作（actions）之间的协同定位至关重要。在将来做代码审查时，可以通过这些行为(actions)的上下文来检查这些测试，有必要的话，进行更新、修改、删除这些操作也很方便。他们与被守护代码之间，近似地建立起一条重要连接。

在代码中我推荐使用 `guard` 来做基本的安全检查，并坚持认为苹果官方（自动售货机）才是 `guard` 使用的正确姿势。最后总结一下：你或许有自己使用 `guard` 的方式，但是这样做并不会对你的代码带来好处。