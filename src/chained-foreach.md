title:在序列的链式操作中注入副作用
date:
tags:[Swift]
categories: [Ole Begemann]
permalink: chained-foreach
keywords:Swift
description: 本文介绍了如何在 Swift 的链式调用中通过使用创建的自定义函数来实现调试的目的
---
原文链接=https://oleb.net/blog/2017/10/chained-foreach/
作者=Arthur Knopper
原文日期=2017/10/30
译者=jojotov
校对=Forelax
定稿=


几周前，一位读者指出了 [*Advanced Swift*](https://oleb.net/advanced-swift/) 中的[一处错误](https://twitter.com/jasonalexzurita/status/915972380685516800)。我们当时这样描述 Swift 中的 `forEach` 方法：

> `forEach` 作为一系列链式调用中的一部分时确实可以大放异彩。举个例子，试想一下你在一个语句中通过链式调用的方式调用了几次 `map` 和 `filter` 方法。在调试这段代码时，你希望能够打印出某几步操作中间的值。要达成这一目的，在你期望的位置插入一个 `forEach` 或许是最快速的解决方式。

当我写下这段描述时，众多美妙的想法涌现在我脑中，因为这听起来是个非常实用的特性[^1]（你并不能通过 `for-in` 循环达到这种效果）。可事实却如此的残酷 —— 你不能在一系列链式调用中间插入 `forEach`！



# 理想中的形式 

为了以代码的形式更好地阐述我的想法，先让我们设想有如下一系列的链式调用：

```swift
let numbers = 1...10
let sumOfSquaredEvenNumbers = numbers
    .filter { $0 % 2 == 0}
    .map { $0 * $0 }
    .reduce(0, +)
// → 220
```

现在假设我们希望确认一下每个链式操作是否达到了预期的效果 —— 例如 `filter` 和（或） `map` 操作后的返回值是否正确，最简洁的方式当然是在两个操作中间插入类似 `.forEach { print($0) }` 的调用。

但为什么 `forEach` 并不支持类似这样的使用方式呢？原因在于，在一系列链式调用中间的任何操作，都必须返回一个遵循 [`Sequence`](https://developer.apple.com/documentation/swift/sequence) 协议的对象，这样下一个链式操作才能正常执行。而 `forEach` 的返回值为 `()`，因此它只能在一系列链式操作的结尾处调用。



# 实现一个返回 `Self` 的 `forEach`

值得庆幸的一点是，实现这个功能并不困难。我们所需要做的事情只是实现一个方法 —— 它能够遍历序列，并对每个元素执行一次传入的函数（就像 `forEach` 一样），最后返回自己（这样链式操作就能够无感知地继续进行）。换句话来说，这个方法的返回值类型应为 `Self`。为了避免在类型检查的时候这个方法与原生的 `forEach` 发生混淆，我把它命名为 `forEachPerform`。

```swift
extension Sequence {
    /// Perform a side effect for each element in `self`.
    @discardableResult
    func forEachPerform(_ body: (Element) throws -> ())
        rethrows -> Self
    {
        try forEach(body)
        return self
    }
}
```

与 `forEach` 不同，我们可以插入这个方法到一系列链式操作中：

```swift
let sumOfSquaredEvenNumbers = numbers
    .filter { $0 % 2 == 0}
    .forEachPerform { print($0) }
    .map { $0 * $0 }
    .reduce(0, +)
/* Prints:
2
4
6
8
10
*/
```

除此之外，我还添加了另一个非常有用的方法。这个方法只会对整个序列调用传入参数中的函数一次，而不会遍历序列并对每一个元素都调用一次。

```swift
extension Sequence {
    /// Perform a side effect.
    @discardableResult
    func perform(_ body: (Self) throws -> ())
        rethrows -> Self
    {
        try body(self)
        return self
    }
}
```

通过这个方法可以完美地打印每一步链式操作的中间值：

```swift
let sumOfSquaredEvenNumbers = numbers
    .filter { $0 % 2 == 0}
    .perform { print("After filter: \($0)") }
    .map { $0 * $0 }
    .perform { print("After map: \($0)") }
    .reduce(0, +)
/* Prints:
After filter: [2, 4, 6, 8, 10]
After map: [4, 16, 36, 64, 100]
*/
```



# 自毁序列

我们新添加的方法返回了一个未修改过的 `self`，因此把它插入一系列链式调用中是完全没有影响的。但我们需要注意， `Sequence` 协议目前的代码实现中并没有保证多次的迭代返回完全相同的序列。

> 译者注:
>
> 苹果官方 `Sequence` 的文档中有一段关与 [Repeated Access](https://developer.apple.com/documentation/swift/sequence#Repeated%20Access) 的描述：
>
> The `Sequence` protocol makes no requirement on conforming types regarding whether they will be destructively consumed by iteration. As a consequence, don’t assume that multiple `for`-`in` loops on a sequence will either resume iteration or restart from the beginning:
>
> ```swift
> for element in sequence {
>     if ... some condition { break }
> }
> 
> for element in sequence {
>     // No defined behavior
> } 
> ```
> 

大多数遵循 `Sequence` 的类型会确保上面的这种情况不会发生（例如 [`Array`](https://developer.apple.com/documentation/swift/array)），但假设你有一个可以用于接收来自网络 socket 的字节流的 `Sequence` 类型——调用 `forEachPerform` 或者 `perform` 会打乱其顺序，导致随后操作中的数据不能被正确处理。

如果你的代码中存在上述问题，你可以选择让 `forEachPerform` 和 `perform` 方法返回一个 `Array<Element>` 类型（这样可以把可破坏的序列隐式转换为可重复的序列），或者可以把这些方法加到  [`Collection`](https://developer.apple.com/documentation/swift/collection) 中（`Collection` 类型保证了迭代不会破坏顺序）。



# 让它变“懒”

`forEachPerform` 有个不太容易发现的问题：如果我们把它放在 ***惰性队列 (lazy sequences)*** 的链式调用之间，惰性队列会失去其原本的惰性。

惰性队列的设计初衷是为了把所有需要对下一个元素所做的工作都尽可能地延迟进行 —— 也就是说，当一个惰性序列的链式调用的最终返回值需要被获取时，那些被 ”延迟“ 的工作才会真正执行。由于 `forEachPerform` 的实现中遍历了序列的每个元素，我们让这个队列的任何惰性都被破坏了。

为了保证序列的惰性，我们可以定义一个自己的惰性迭代器以及序列类型，分别命名为 `LazyForEachIterator` 和 `LazyForEachSequence`。它们的工作与标准库中类似的类型相差无几：它们会把传入的函数以及序列 *保存* 起来，而不是立即执行传入的函数。*直到* 某个操作访问到下个元素时，它们才会轮流尝试获取原本序列的下一个元素，并执行相应的操作。

实现代码大概如此：

```swift
struct LazyForEachIterator<Base: IteratorProtocol>
    : IteratorProtocol
{
    mutating func next() -> Base.Element? {
        guard let nextElement = base.next() else {
            return nil
        }
        perform(nextElement)
        return nextElement
    }
    var base: Base
    let perform: (Base.Element) -> ()
}

struct LazyForEachSequence<Base: Sequence>
    : LazySequenceProtocol
{
    func makeIterator()
        -> LazyForEachIterator<Base.Iterator>
    {
        return LazyForEachIterator(
            base: base.makeIterator(),
            perform: perform)
    }
    let base: Base
    let perform: (Base.Element) -> ()
}
```

需要注意的是，这个序列遵循 [`LazySequenceProtocol`](https://developer.apple.com/documentation/swift/lazysequenceprotocol) 协议。此协议继承于 `Sequence`。这个协议的职责是为一些即刻响应的操作（译者注：例如 `map` 和 `filter`）提供了惰性实现。

> 译者注:
>
> 关于“即刻响应的操作”（原文中为 *normally-eager operations*），`LazySequenceProtocol` 的[官方文档](https://developer.apple.com/documentation/swift/lazysequenceprotocol)中有这样一段解释：
>
> Sequence operations taking closure arguments, such as `map` and `filter`, are normally eager: they use the closure immediately and return a new array. 
>
> 同时，文档紧跟着解释了 `lazy` 是如何让这种 *normally-eager operations* 变成惰性操作的：
>
> Using the `lazy` property gives the standard library explicit permission to store the closure and the sequence in the result, and defer computation until it is needed.

Swift 的类型推断机制其中一条规则是：在给定的约束的前提下，Swift 编译器会自动选择一个最明确且可工作的重载（译者注：可查看官方文档 [Type Safety and Type Inference](https://docs.swift.org/swift-book/LanguageGuide/TheBasics.html#ID322) ）。因此，当你对一个遵循了 `LazySequenceProtocol` 协议的值调用诸如 `map` 的方法时，编译器会倾向于 `map` 方法的惰性变体而非默认版本实现。

为了在我们的方法中实现同样的效果，我们可以在 `LazySequenceProtocol` 的扩展中加入一个 `forEachPerform` 的变体，同时让它返回一个惰性序列：

```swift
extension LazySequenceProtocol {
    func forEachPerform(_ body: @escaping (Element) -> ())
        -> LazyForEachSequence<Self>
    {
        return LazyForEachSequence(base: self,
            perform: body)
    }
}
```

这个方法在以下几个方面上与与非惰性版本略有不同：

- 因为我们需要把传入的闭包暂存起来，所以它必须是 `@escaping`，也就是逃逸闭包。
- 由于其惰性性质，这个方法并不支持会抛出异常的方法。
- 一般来说，一个惰性操作完成后必定会有后续的操作，因此其返回值并没有标记为 `descardable`。

但这个方法最重要的特性是我们上面讨论过的：除了把原本的序列和传入的函数进行存储之外，它不会执行任何操作。

当这一切准备完成后，`forEachPerform` 便可以成功维持一个序列的惰性性质（注意 `.lazy` 的调用）：

```swift
let largeNumbersSquared = numbers
    .lazy
    .filter { $0 >= 5 }
    .forEachPerform { print("After filter: \($0)") }
    .map { $0 * $0 }
// Prints nothing
```

*注意：其实这段代码在 Swift 4.0 中会编译失败："ambiguous use of 'forEachPerform'"。只有当我把 Sequence.forEachPerform 的返回类型由 Self 改为 [Element] 后这段代码才能正常运行。说实话我也不太明白这是为什么。不过你也可以通过修改 LazySequenceProtocol.forEachPerform 方法的命名暂时解决这个问题。*

这样一来，只有当我们访问到惰性序列的元素时，这些元素的副作用才会被打印出来：

```Swift
// Access the first two elements
Array(largeNumbersSquared.prefix(2))
/* Prints:
After filter: 5
After filter: 6
*/
// → [25, 36]
```



# 结论

我真的很喜欢这种往链式操作中注入副作用的功能，即便我几乎没有在调试之外的时候使用过。插句题外话，虽然基于 `print` 的调试方法一直在被争论是否已经 “过时” 了，但我还是一直在用。



---

[^1]: RxSwift 中的有一个类似的操作符 [debug](https://github.com/ReactiveX/RxSwift/blob/master/RxSwift/Observables/Debug.swift) 
