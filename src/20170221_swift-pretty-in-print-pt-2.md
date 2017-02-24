title: "Swift：漂亮的 print() Pt.2"  
date: 2017-02-21
tags: [Swift]
categories: [medium.com]
permalink: swift-pretty-in-print-pt-2
keywords: 
custom_title: 
description: 

---  
原文链接=https://medium.com/swift-programming/swift-pretty-in-print-pt-2-640cea920653#.ou9umlt2f  
作者=Andyy Hope
原文日期=2016-04-14
译者=SketchK
校对=Crystal Sun
定稿=CMB

<!--此处开始正文-->

时尚日志，由你做主

在[之前的文章](https://medium.com/swift-programming/swift-prettify-your-print-statements-pt-1-64832bb7fafa#.9xqf9fmez)中，我们讨论了在输出日志中使用 emojis 的好处，它可以帮助我们更好的去消化和吸收海量的信息。不过我提供的实现方式并不怎么样，估计你也不会想把这些东技术用到自己的代码中去。

不管怎么样，我还是会遵守之前的约定继续讨论这个话题，向你展示如何使用 emojis 来实现输出日志的功能，而你只需在 `print` 函数上再多花费*一点儿*工夫。

<!--more-->

## 控制预算

在接下来的文章中，我会打破 Swift 的命名规范，不过这么做是有理由的；为了降低替代 print 的成本，我们需要减少敲击键盘的次数；此外使用大写字母的必要性也需要讨论。不管怎么样，如果看到文章的最后，你还在为一些细节而纠结, 你绝对应该把它们改成你想要的样子。

## 介绍 log

```swift
enum log { }
```

这里使用 enum 代替 class 或 struct 的原因有很多。原因之一是，我们*永远*不需要实例化一个日志。选择枚举而不是函数是想确保实现一个安全的日志输出方案。不用着急，一会你就会明白*安全*的含义了. 

## 枚举成员与值关联

```swift
enum log {
    case ln(_ line: String)
    case url(_ url: String)
    case obj(_ any: AnyObject)
}
```

可能有些人还不知道 `ln`(line) 曾经在 swift 语言中出现过。 `print()` 在 Swift 2.0 之后替代了 `println()` , 且主要用于日志输出。我还写了一些其他的例子来证明 log 的扩展性。

在 case 的条件中我们包含了不同的关联值来应对不同输入所对应的输出的 log 值。请注意，这里忽略了参数标签，因为已经使用参数名称来描述函数的参数了。

看一下目前的情况吧：

```swift
print(log.ln(“Hello World”))
// ln("Hello World")

print("Hello World")
// "Hello World"
```

嗯，看样子似乎是完成了。但这看起来并不是一个可以替代 `print` 的方案。主要原因有这些：

* 还是要敲击很多次键盘
* 除了原始信息外还有许多不必要的内容
* 外表不怎么样
* 没有一个 emojis
* 千言万语，就一句：“这方案太糟糕了”

现在需要完善上面的五个问题, 以便实现之前定下的目标.

## 自定义运算符

```swift
postfix operator / { }
```

先假定你们大多数人在这之前都没有遇到过自定义运算符的需求。没关系，我也是最近才用上这个功能, 不过用的也不是太多. 

我们自定义的操作符将会是 `后缀操作符（postfix）` ，因为我们希望它在 log 的代码后面，而且同时希望在它的左边仅有一个输入。

选择 `/` 符号是因为它最接近注释符号但不会真正产生注释，另外它也是少数几个不用 shift 键来就可以直接打出来字符。

...感觉自己就像是政客，在不停的想办法减少实现预算。

## 实现

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

这段代码看起来像声明，但是我们提供了一个函数体，增加了要求传入的参数为 log 枚举类型的限制，这在一定程度上符合我所说的的"安全代码"。"安全代码"这个概念还体现在使用枚举替代类或结构体，因为枚举中的 switch 一定会把所有情况都检查一遍。这样，每次想在输出日志中添加一个新的 emoji 时, 也必须将其添加到操作符中的 switch 语句里。

```swift
private func log<T>(emoji: String, _ object: T) {
    print(emoji + “ “ + String(object))
}
```

终于得到了这个看似非常简单 `log` 函数。首先它是一个私有函数，不会被 `.swift` 文件之外的任何东西访问到，另外它的第二个参数是一个泛型，这个参数能够接受任意类型的值。

正如你所看到的一样，它只是简单的把 emoji 表情和对象用空格连起来的 print 语句而已。

## 用起来

```swift
log.ln(“Pretty”)/
✏️ Pretty
log.url(url)/
🌏 http://www.andyyhope.com
log.obj(date)/
🔹 2016–04–02 23:23:05 +0000
Maybe i should use a screenshot here instead?
```

现在我们有一个可以替代系统原有输出日志的方案了, 新方案只需要进行两次敲击，相比其他的日志输出工具，这个方案输出的内容脱颖而出、而且敲击的感觉畅快淋漓。不过这还没完呢...

## 性能提升

大多数的程序员都会有这么一个共识，就是调用 print 方法会降低 app 的性能。如果含有 print 的代码散落在程序的不同地方, 在 debug 的时候还是可以接受, 可是要把 app 上传到 AppStore 时，最好还是移除这些内容。 


> "你是在说，每一次我都必须在提交 App Store 前注释掉所有的 print 语句, 然后再在 debug 的时候把它们恢复回来么?" —— 你


## 预编译标识符

可以用 Xcode 给工程创建配置文件, 在默认情况下 Xcode 会为每个工程提供两个配置文件 : Debug 和 Release.
 
在使用模拟器或用 USB 连接真机时，默认模式是 debug，用手机打开从 AppStore 下载的 app 时，默认模式是 relsase。

把刚才写好的代码放入到用于标识 debug 状态的预编译标识符里, 这样就不用在每次打包的时候对这些代码进行注释/恢复/增加/删除等操作。相当于告诉编译器：“Hi，哥们，除了 release 模式下， 你都得运行这段代码！”


## Build Settings

![](https://cdn-images-1.medium.com/max/1600/1*wExNt9uLhE8ewadbCzTQCQ.png)

1. 点击 Project Navigator 图标
2. 点击 Project 名称
3. 点击 Build Settings 按钮
4. 搜索 “Compiler Flag”
5. 展开 “Other C Flags”
6. 点击 “+” 按钮
7. 输入 “-D DEBUG”

最终把整个 print 函数放到预编译的标识符中。

```swift
private func log<T>(emoji: String, _ object: T) {
    #if DEBUG
        print(emoji + “ “ + String(object))
    #endif
}
```

哦了！现在只有在开发状态下 print 才会生效。把 [build configuration scheme](http://help.apple.com/xcode/mac/8.0/) 设置改为 Release，运行 app，这样就可以检测之前的操作是否成功，当然别忘了检测完把状态切回到 Debug 模式。


## Framework、Carthage 和 Cocoapods 

读到这, 也许会想：“这些个点子太好了, 如果 Andyy 将这些功能弄成一个...”，但事实是这样做并不好。

原因就是, 假如我提供了上面三种方式中的任意一种, 那么每当你想利用它做日志输出的时候，你就必须在 Swift 文件里引入这个库, 这样做实在太傻了, 还需要做一些额外的操作来管理它们。这也是为什么许多 NSLog 的替代品在 Objective-C 中表现不好的原因。

```swift
import Log // 这看起来像坨 💩
```

## 探索和使用

我专门提供了一个 playground 文件，能够让你测试一下今天所读到的全部内容，如果想使用这个文件，只需要将 `log.swift` 文件拖入到工程中即可。另外在示例代码中会有一些额外的枚举值, 或许你会发现这些额外的例子对你的日常工作很有用, 如果是这样的话，拿走不谢!

---
*[示例代码](https://github.com/andyyhope/Blog_PrettyPrint)可以在 Github 上下载到.*

*就像之前一样, 如果你喜欢今天读到的内容或者亲手实现了它，请[发推给我](https://twitter.com/AndyyHope)。很渴望听到你们的声音, 让我很受用.*
