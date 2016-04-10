title: "在 Swift 2 beta 6中使用 try? 抛出可选异常"
date: 2015-09-11 20:00:01
tags: [Swift 入门]
categories: [APPVENTURE]
permalink: optional-throw-swift

---
原文链接=http://appventure.me/2015/08/25/optional-throw-swift/
作者=Benedikt Terhechte
原文日期=2015/08/25
译者=lfb_CD
校对=小锅
定稿=shanks

<!--此处开始正文-->

Swift 2.0 beta 6 新增了一个关键字 `try?`，这为我们处理异常又增加一个新的途径。这篇简短的文章阐述了这个关键字的基础知识，同时说明为何这个新关键字很酷。

在 Swift 1.x 中，我们只能通过可选数据类型和 `NSError` 来处理异常。我们可以在[其他编程语言中](https://hackage.haskell.org/package/base-4.8.1.0/docs/Data-Either.html)看到 [`Either`/`Result`](https://github.com/antitypical/Result)这样的形式，于是很多人将这种形式移植到 Swift 当中：

<!--more-->

```swift
let success = Result<String, NSError>.Success("success")
```

在 Swift 2.0 中， 苹果引进了 `try`/`catch` 的异常处理方式。在底层实现中，Swift 并没有像其他编程语言(比如 Objective-C 或者 Java) 一样使用代价昂贵的堆栈处理。相反地，它们返回了类似 `Either` 或者 `Result` 的东西 。从语法上隐藏了这些东西，就是为了使异常处理使用起来更加简单<sup>1</sup>。

## Swift 2.0 beta 5 或之前版本
然而，随着代码中使用 `do/try/catch` 的增多，你会发现代码嵌套得越来越混乱，因为 `do` 与处理可选值（optionals）的语句看起来不兼容。这儿有一段丑陋的代码，注意观察我们是怎么用 `let` `do` `let` 嵌入到 `if let` 中的<sup>2</sup>。

```swift
import Foundation
// get the currently logged in user
func loggedInUser() -> Int? { return 0 }
// get his name
func getUserName (userId: Int) throws -> String { return "Claus" }
// create a new image post with this username. Returns the post data
func imagePostForUserName(name: String, imageURL: NSURL?) -> NSData? { return NSData() }
// post the data to a server
func postImage(data: NSData) throws -> Bool { return true }

if let uid = loggedInUser() {
    do {
	let username = try getUserName(uid)
	if let data = imagePostForUserName(username, imageURL: nil) {
	    do {
		let success = try postImage(data)
		if success {
		    print ("Submitted")
		}  
	    } catch {
		// more error handling
	    }
	}
    } catch {
	// todo: error handling
    }
}
```
很难对这段代码进行简化的一个原因是, `do` 会打破我们使用多重 `guard` 或 `let` 的连续性<sup>3</sup>。

## Swift 2.0 beta 6
在 beta6 中，我们有了一个新的关键字 `try?` ,它在代码执行失败时会抛出错误并返回可选值 `None`,而在执行成功的情况下，会直接返回可选值 `Some`。
以下直接引用[官方的更新日志](http://adcdownload.apple.com/Developer_Tools/Xcode_7_beta_6/Xcode_7_beta_6_Release_Notes.pdf):

> Swift 新添加了一个关键字`try?`。`try?`会试图执行一个可能会抛出异常的操作。如果操作执行成功，执行的结果就会包裹在可选值(optional)里；如果操作执行失败(比如某个错误被抛出了)，那么执行的结果就是 `nil`，而且`error`变量会被丢弃。`try?` 在和 `if let` 与 `guard`一起使用时的效果特别明显。

这使得从一个潜在可能抛出错误的操作中获取到一个以可选形式表示的值成为可能。如果我们把这个应用到上面的代码，我们可以把它简化不少：

```swift
if let uid = loggedInUser(),
   username = try? getUserName(uid),
   data = imagePostForUserName(username, imageURL: nil),
   success = try? postImage(data)
   where success == true {
      print ("Submitted")
}
```
当然,这是一个有点做作的例子,专门为解释 `try?` 而设计。但是,这绝对是可以缩减不少代码的。当然,我们也可能会丢失很多有用的错误信息,而这些信息原本是可以用 `catch` 来获取到的。

## 选择哪一个？
`try?` 可以帮助你不用深入挖掘便写出简洁的代码。使用 `try?` 只会返回一个可选值，不会含有更多的造成特定的错误或者异常原因的信息。好处当然就是可以和大量 Swift 的语法进行完美的组合，比如, `map`, `flatmap`, `switch`, `guard`, `if let`, `for case`，以及其他。

非可选的 `try` 非常适合独立的任务, 这些任务不需要获取之前或者之后可能存在的可选结果。

而上面提到的 `Result` 数据类型，则两方面的信息都可以提供，不管是被请求的值或是可能的错误。你可以继续使用 `Result`，它也提供了对抛出的数据包装和其他更多的支持，然而，你需要记住这似乎并不是 Swift 打算发展的方向<sup>4</sup>。否则,我们就应该在 Swift 2 中看到完整的 `Result` 或者 `Either` 实现了。

`try?` 关键字的引进使我感到十分高兴，因为这将使得很多代码段的编写更加容易，特别是在与 Cocoa API 交互时。

1. 就像 Swift 中通过`?`语句声明的可选数据类型一样`try?`也封装了很多和可选相关的操作
2. 也有不用`try?`的方法来改进这里的代码，但这段代码是一个很好的例子
3. 值得一提的是，我这里使用的是原生的 `NSRegularExpression` 而非第三方库
4. 此外，你总是需要将相关依赖添加到工程中。