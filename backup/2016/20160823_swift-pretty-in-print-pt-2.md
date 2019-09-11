title: "Swift：如何优雅地使用 print()（二）"
date: 2016-08-23
tags: [Swift]
categories: [medium.com]
permalink: swift-pretty-in-print-pt-2
keywords: swift print
custom_title: 
description: 本文继续讲解在 Swift 中使用 print() 语句，教你怎么轻量地实现带 emoji 表情的日志。

---
原文链接=https://medium.com/swift-programming/swift-pretty-in-print-pt-2-640cea920653#.jfchib95j
作者=Anddy Hope
原文日期=2016-04-14
译者=Darren
校对=Cee
定稿=CMB

<!--此处开始正文-->

#### 如果说 Log 是一种时尚，那你就是时尚设计师。

在[上一篇文章](http://swift.gg/2016/08/03/swift-prettify-your-print-statements-pt-1/)中，我聊到了如何通过在打印的日志中使用 emoji 表情来帮助你从冗杂的信息中减少认知负荷。然而，我给的糟糕的实现并不会让你对在自己的代码中使用 emoji 产生强烈的意愿。

这篇文章我将会实现承诺，告诉你如何使用比 `print` 函数 *稍微* 复杂的方法轻量地实现带 emoji 表情的日志。

<!--more-->

### 预算限制

在本文接下来的部分，你会看到：我们会打破 Swift 的命名约定，不过这么做是有理由的；为了降低替代 print 的成本，我们需要减少敲击键盘的次数；此外使用大写字母的必要性也需要讨论。不过如果看完后你的认知负荷还是存在的话，那就换成你喜欢的命名吧。

### 介绍 log

```swift
enum log { }
```

我们使用 enum 而不是 class 和 struct 是有一些理由的。其中一个原因是我们*永远*不需要实例化一个 log。我们使用 case 判断条件而不是通过函数判断，是因为我们想实现一个*安全*的 log。你很快就会知道我为什么这么说。

### Case 的关联值

```swift
enum log {
    case ln(_ line: String)
    case url(_ url: String)
    case obj(_ any: AnyObject)
}
```

有些朋友可能不知道吧，`ln`（line）曾经在 Swift 中出现过，在 Swift 2.0 出现前，`println()` 曾是替代 `print()` 打印 log 的主要方式。我也写了一些其他的例子来证明 log 的扩展性。

在 case 的条件中我们包含了不同的关联值来应对不同输入所对应输出的 log 值。同时你也应该注意到了我们省略了声明中的外部参数的名称，因为我们使用了 case 的名称来描述参数的作用。

看看我们现在可以做些什么：

```swift
print(log.ln(“Hello World”))
// ln("Hello World")

print("Hello World")
// "Hello World"
```

呃，的确是可以用的，但是它绝不是一个合适的补充或*替代* print 语句的选择。原因如下：

* 想要使用它时需要敲多次键盘；
* 在原始数据外面有多余的内容；
* 而且看起来一点都不受人喜欢；
* 甚至都没有用到任何表情符号；
* 总而言之它这货简直就弱爆了！

所以我们现在需要用一个方法来解决这五件事。快上车，带你到达我之前许诺的终点——日志岛。

### 自定义操作符

```swift
postfix operator / { }
```

我会假定你们中的大部分人都没有过实现自定义操作符。很正常，我也是最近才开始用的，但其实这并不难。

我们自定义的操作符将会是`后缀操作符（postfix）`，因为我们希望它在 log 的代码后面，而且同时希望在它的左边仅有一个输入。

我选择使用「/」这个符号，因为它是最接近注释语法而又不会实际创建注释的，还因为它是为数不多的不需要按 shift 键进行输入的操作符。

...我真的开始感觉我就像一个收到预算限制的政客。

#### 实现

```swift
postfix func / (target: log) {
    switch target {
    case ln(let line):
        log("✏️", line)
    case url(let url):
        log("🌏", url)
    case obj(let object):
        log("🔹", object)
}
```

这个实现很像是声明，但是我们提供了一个函数体，增加了要求传入的参数为 `log` 枚举类型的限制，这就是我所说的写「更安全的代码」。此外还有一点也能够证明「更安全的代码」，就是 `log` 声明时是一个枚举类型而不是类或者结构体，因为枚举类型的 switch 语句一定是完全覆盖所有判断条件的。每当我们添加一个新的 emoji 日志类型，我们必须同时在操作符的 switch 语句中包含它。

```swift
private func log<T>(emoji: String, _ object: T) {
    print(emoji + “ “ + String(object))
}
```

最后，我们实现了 `log` 函数，这简单得难以置信。它是`私有函数`，因为我们不希望它在我们正在写的 `.swift` 文件外部被访问。它的第二个参数是一个泛型，因为我们可能会传任何类型进去。

如你所见，它只是一个简单地把 emoji 表情和对象用一个空格连接起来的 print 语句。

### 用起来

```swift
log.ln(“Pretty”)/
✏️ Pretty

log.url(url)/
🌏 http://www.andyyhope.com

log.obj(date)/
🔹 2016–04–02 23:23:05 +0000

Maybe i should use a screenshot here instead?
```

这样就做好了！只需要额外敲两下键盘（字母），我们已经可以成功地从被应用和第三方日志塞满的控制台中找到特定类型的日志。但事情还没做完...

### 性能提升

很多开发者都忽略了的一个事实是调用 print 实际上会降低你的应用的性能。在调试过程中代码中遍布大量的 print 是完全没有问题的，但是在上架 App Store 之前，你真的应该删掉它们。

> 你的意思是我必须每次在提交前要注释掉所有的 print，然后再取消注释吗？——你

#### 预编译指令

Xcode 允许我们在每个工程中创建额外的配置。默认情况下 Xcode 为新工程提供了两种配置，Debug 和 Release。

在模拟器或通过 USB 连接的设备上运行你的 app 时，Debug 是默认配置；当你打包 app 准备上架时，使用的是 Release 配置。

我们将把我们的 print 代码用 Debug 预编译指令包起来，这样我们就不用每次打包时都注释/取消注释/添加/删除所有的 print 了。相反，我们会告诉编译器「哟，请注意，只在非 release 模式下运行这段代码！」

#### 编译设置

![](https://miro.medium.com/max/1743/1*wExNt9uLhE8ewadbCzTQCQ.png)

1. 点击项目导航图标；
2. 选择你的项目名称；
3. 选择编译设置；
4. 搜索 Compiler Flag；
5. 展开 Other C Flags；
6. 点击 +；
7. 输入 `-D DEBUG`。

最后，我们将把我们实际的 print 函数打包进我们刚才设置的预编译指令中。

```swift
private func log<T>(emoji: String, _ object: T) {
    #if DEBUG
        print(emoji + “ “ + String(object))
    #endif
}
```

瞧！现在你的 print 语句只会在调试时运行。你可以通过[改变你的编译配置方案](https://developer.apple.com/library/mac/recipes/xcode_help-scheme_editor/Articles/SchemeDialog.html)为 Release 再测试运行你的 app，不过不要忘了把它重新改回 Debug！

### Framework、Carthage 和 Cocoapods 支持

或许你可能对上面的内容很喜欢，而且会想：「如果 Andyy 再提供 Framework、Carthage 或者 CocoaPods 的支持就更好了」，但是实际上这对 log 的功能性来说没有好处。

原因是，如果我提供这三者之一，每次你想打 log 的时候，在你使用前，你都需要将框架导入你的 Swift 文件，这样做很傻，因为你在每次使用这个愚蠢的 log 把戏前都需要做一些额外的管理工作。这也是为什么那么多 NSLog 的替代品在 Objective-C 下面工作地并不好。

```swift
import Log // 看上去就是一坨💩
```

### 探索与使用

我为你们提供了一个 playground 用来测试文章中写到的内容，同时还提供了一个 `log.swift` 文件方便你添加到自己的项目中。示例代码中有一些额外的案例可以用在日常的开发中。尽情享受吧！

---

[示例代码](https://github.com/andyyhope/Blog_PrettyPrint)已上传 GitHub.

像往常一样，如果你喜欢你今天看到的内容，或者已经实现了它，请  [发推给我](https://twitter.com/AndyyHope)。我喜欢读者的反馈，这会让我很高兴！