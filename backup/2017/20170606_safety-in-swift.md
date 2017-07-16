title: "Swift 中的安全性"
date: 2017-06-06
tags: [Swift 进阶]
categories: [khanlou.com]
permalink: safety-in-swift 
keywords: 
custom_title: 
description: 

---
原文链接=http://khanlou.com/2017/04/safety-in-swift/
作者=Soroush Khanlou
原文日期=2017-04-05
译者=Doye
校对=walkingway
定稿=CMB

<!--此处开始正文-->

Swift 是一门注重安全性的语言，如[Swift官网](https://Swift.org/)的[关于页面](https://Swift.org/about/)中所言

> Swift 是一门通用编程语言，采用现代化的方法来保证安全性与性能，套用软件设计模式。

<!--more-->

还有它的说明

- **安全性**：那些显而易见而又便捷的编程方法应该保证是安全的。未定义的行为会破坏软件的安全性。在软件发布之前就要把开发者的错误扼杀在萌芽之中。强调安全性有时会让你觉得 Swift 语法过于严苛，但是它带来的代码的明晰从长远来看还是利大于弊的。
 
- **高性能**: Swift旨在替代 C 系语言（C，C ++和Objective-C），因此 Swift 必须在绝大多数任务中与这些语言有着接近的性能指数，而且性能需要具有可预测性。而且这种指数需要是一种普遍的性能指数，而不是昙花一现的仅仅几种任务类型的高性能。具有各种特性的语言有很多，但仍保持着如此高性能却实属罕见。

- **表现力**:  Swift 受益于计算机科学的几十年发展，提供了开发人员期望的现代功能并具有有趣的语法。而且 Swift 并不止步于此，Swift 社群会关注编程语言的发展并取其精华，使得 Swift 一直保持进化，变得更好。

举例来说，类似 **Optional** 这种类型就是 Swift 考虑安全性的一个体现，在其他的编程语言当中，你并不能知道哪个变量可以为空(null)哪个不能，而 **Optional** 携带着改变量可能为空的信息，这就强制开发者去考虑可能为空的情况。对于”可空”（nullable）的类型，如果你用强解包符号（**!**）来处理该类型，有些时候它会直接 crash。Swift 的安全性相当于一条安全带，你可以自行解开它，但是风险也要自己来承担。

然而在某些情况下，安全性看起来并不足够。比如举例来说，如果我们有一个字典，我们需要通过一些 key 来提取到返回值类型为 optional 的 value

```swift
let person: [String: String] = //...
type(of: person["name"]) // => Optional<String>
```
但是如果我们对数组进行类似的操作，我们并不会得到一个 optional:

```swift
let users: [User] = //...
type(of: users[0]) // => User
```

原因是数组可能没有元素，如果 **users** 的数组为空的话，这段程序将会直接crash，从这方面来看，好像Swift并没有做到足够安全。

Swift仍然在开放的演进中，你可能就此问题提些建议到 [Swift evolution邮件组](http://khanlou.com/2017/04/safety-in-swift/)
不，那也不会有什么改变，在 **Swift evolution** 的 github 库里 [”常见驳回”提议页](https://github.com/apple/swift-evolution/blob/master/commonly_proposed.md) 当中描述了不会接受这项提议：
- Array< T > 的下标获取操作不返回一个 **T** 而是返回一个 **T?** 或者 **T!**，当前的数组的逻辑是[故意为之](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20151214/002446.html)，它准确反映了访问越界的数组下标是一个逻辑错误。如果改变目前的逻辑会降低数组的读取到一个无法接受的程度，这项提议[提出多次](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20151214/002425.html)并不会被社区采纳。

这里指出的原因是在这种特殊情况下，性能至关重要。但是如果我们回过头来看上面引用的关于页当中的信息，”安全性”的地位应该是高于”速度”的，难道安全性不应该比速度更为重要么？

这里存在着一个根本的争议点，在于”安全性”一词的定义。对于”安全性”一个普遍的理解是不 crash，而 Swift 核心成员的定义是”永远不会在无意中访问错误的内存”。

从这点来看，Swift 的下标操作是”安全的”，它永远都不会去访问在数组自身分配之外的内存，当你想访问数组越界的内存时它会立即 crash，如 Optional 类型避免了当前存在的各种空指针引用的 bug 一样，数组这里的考虑避免了缓冲区溢出的 bug。

Chris Lattner（Swift 作者）在[这段采访](https://overcast.fm/+CdTE-_oY/24:37)的24.39处有段说明

> 我们采用的安全性策略是在综合的一种妥协。我们想使Swift成为一门安全的编程语言，但这种安全并不是没有bug，而是我们保障内存安全的的基础上同时提供高性能而且采用一直前进的编程语言范式。

或许，内存安全相对于安全是一个更好的名词，有些开发者可能更偏向于得到一个 optional 的返回值，而不是在数组越界访问的问题里纠结，每个人都同意直接让程序crash会好过让程序携带着非法的数据继续运行下去，而这种情况还可能会被栈溢出的攻击所利用。

第二种权衡（直接 crash 而不是允许越界访问）的决定看起来显而易见，但是有些语言不会做这种保证，在 C 中，访问越界的数组将会导致未知的行为（具体取决于使用的编译器对这种行为的实现），在 Swift 中开发者会快速的意识到自己犯了类似数组越界的错误，Swift团队觉得这是一个合适的 crash 时机，所以并不会返回一个 optional 甚至是返回一段未知的数据。

使用这里”安全”的定义也明确了”不安全”的 API 的定义，因为它们直接访问内存进行编程，程序员们自己必须十分小心保证自己不会访问到无效的内存，这点尤为困难，即使专家在这种情景也会犯错，如果对这个主题感兴趣去查阅 [Matt Gallagher的博客](https://www.cocoawithlove.com/blog/2016/02/16/use_it_or_lose_it_why_safe_c_is_sometimes_unsafe_swift.html)中以安全的方式桥接 C 到 Swift 的相关讨论。

Swift 的团队对于安全的定义可能与你预想的并不完全一致，但是它们的种种策略确实可以避免大多数的程序员去考虑各种常见的 bug，将“安全”的定义细化为“内存安全”可以让我更好的理解 Swift 团队对于安全的定义。


