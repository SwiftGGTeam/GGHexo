title: 在你的 Swift 应用中创建或修改 URL
date: 2018-10-15
tags: [Swift]
categories: [codingexplorer]
permalink: creating-and-modifying-nsurl-in-swift-4
keywords: Swift,URL,codingexplorer
custom_title: 在你的 Swift 应用中创建或修改 URL
description: 本文介绍了基于 Swift 4.1.2 和 Xcode 9.2 如何创建或者修改一个 URL 的常用 API 的描述。

---
原文链接=http://www.codingexplorer.com/creating-and-modifying-nsurl-in-swift/
作者=codingexplorer
原文日期=2018-07-18
译者=Damonwong
校对=numbbbbb,BigNerdCoding
定稿=Forelax

<!--此处开始正文-->

> 译者注：
> 此篇文章以前我们曾经[翻译过](https://swift.gg/2017/02/22/creating-and-modifying-nsurl-in-swift/)，原文作者在今年对这篇文章进行了更新，我们也对更新后的文章进行了翻译并再次发布。

对于大部分应用来说，都需要访问一些文件资源。这些文件资源可能在你的应用安装包中，或者在文件系统内，亦或者在某个网站服务器上。你需要用某种方法将它们体现在代码中。对于苹果平台而言，你主要有两种选择，用字符串或者 `URL`。

<!--more-->

如果你使用过浏览器的地址栏或者在终端中输入过地址，你可能会选择使用字符串，毕竟，在这些地方你只能输入字符串。虽然在 `Cocoa` 和 `Cocoa Touch` SDKs 中许多旧的 API 同时采用 `URL` 和字符串 (对于这些 API 来说，这些字符串通常被称为 "path") 作为参数，但是越来越多的 API 倾向于只能用 `URL` 对象。相比较于字符串路径来说，`URL` 对象有更多的优势，最明显的优势就是你可以直接通过属性访问 `URL` 的不同的部分，而不需要自己编写一个解析组件来解析路径字符串的不同部分。

紧跟我的步伐，接下来我们学习如何在 Swift 应用中创建和使用 `URL` 对象。

## 在 Swift 中创建一个 `URL` 对象

在 Swift 中有好几个构造器和工厂方法可用于创建 `URL` 对象，下面我要讲一些更有用的初始化方法。

### init?(string URLString: String)

这个是普通的，也是最常用的初始化方法。将一个用于表示 `URL` 的 Swift 字符串转变成一个 `URL` 对象。但并不是所有的字符串都可以有效的表示一个 `URL`，所以这是一个可失败构造器。由于有些字符不能在 `URL` 中使用，因此需要进行 URL 编码，将这些不能使用的字符转化为可以在 `URL` 中发送的编码。我个人见过最多的是 `%20`，也就是“空格”字符。这个构造器需要有效的字符，它不会为你进行 URL 编码转化。如果字符串中包含无法转换为有效 `URL` 的字符或者内容，构造器将会返回 `nil`。

```swift 
let NSHipster = URL(string: "http://nshipster.com/") //返回一个有效的 URL
let invalidURL = URL(string: "www.example.com/This is a sentence") //返回 nil
```

这个构造器其实是下面这个构造器的一个便利构造器。

### init?(string: String, relativeTo: URL?)

这是一个指定构造器。和上面的构造器一样，也是一个可失败的构造器，而且需要一个类似 `URL` 的 Swift 字符串和一个可选的 `baseURL` 对象，这个 `baseURL` 本身也是一个 `URL` 对象。如果 `baseURL` 为 `nil`，那么内部会像第一个构造器一样，根据提供的 `URL` 字符串生成一个 `URL` 对象。

```swift 
let NSHipsterTwo = URL(string: "http://nshipster.com/", relativeTo: nil) //返回一个有效的 NSHipster URL
let article = URL(string: "ios9/", relativeTo: NSHipster) //返回 "http://nshipster.com/ios9/" URL 
```

### init(fileURLWithPath: String, isDirectory: Bool)

该构造方法与上一个构造方法类似，但是他的字符串参数指向的是本地文件或者目录。我不太确定为什么会有一个本地文件的特殊版本，我猜有可能是做了一些优化（至少需要是文件 `scheme` 开头，而不应该是 `http` 之类的）。虽然有一个不需要传 `isDirectory` 参数的构造器，但如果你知道它是否是一个目录时，苹果建议你使用这个这个方法。在我看来，有可能另外一个构造器在内部自己判断了输入参数是否是一个目录，而这个方法通过传入参数避免了检查。

### init(fileURLWithPath: String, isDirectory: Bool, relativeTo: URL?)

这是在 iOS 9 中新加入的方法，这与前一个类似，但新增了 `relativeToURL` 参数。和之前的构造器一样，它将返回一个将路径附加到 `baseURL` 的 `URL` 对象。当你需要为了某个事情重复访问某个目录下的不同文件时，可以使用这个初始化方法。你可以将文件所在的目录作为 `baseURL`，然后只需要一个文件名作为 Swift 字符串路径来创建 `URL` 对象。

## 将 URL 转回 Swift 字符串

有时你需要将 `URL` 对象转回 Swift 字符串，特别是在处理旧的 API 或者向用户展示情形下。值得庆幸的是，`URL` 提供了一个简单的只读属性来解决这个问题: `absoluteString`。只需要在你的 `URL` 对象调用该属性即可：

```swift 
let articleString = article?.absoluteString
// articleString 现在包含 = 的值是 "http://nshipster.com/ios9/"
```

在这个例子中，我们使用了 `relativeToURL` 版本的构造器定义了一个 `article` 常量，将其解析为从 `scheme` 开始的完整 `URL` (在这种情况下是一个路径)。如果这个 `URL` 上有文件拓展名，query 或者 fragment，它依旧可以被解析。原来的 `article` 对象是由一个可失败构造器返回的，这就是为什么那儿有一个 Swift 可选访问。

## 修改一个 URL 对象

我们接下来所说的这些方法，每一个都会在请求修改完成时根据调用的 `URL` 对象返回一个新的 `URL` 对象。它们不会更改调用它们的 `URL` 对象。

### func appendingPathComponent(String, isDirectory: Bool) -> URL

这个方法可以为你的 `URL` 添加更多的路径组件，比如当你要添加一个文件到你所在的目录(存储在这个方法调用返回的 `URL`)时，这个方法就可以派上用处。像我们前面提到的那个初始化方法一样，这个方法也有一个没有 `isDirectory` 参数的版本，但是无论你是否知道它是不是一个目录，都更推荐你使用这个方法来确保元数据可以存储在正确的目录下。


### func deletingLastPathComponent() -> URL

这个方法将会返回删除了最后一个路径组件的新 `URL` 对象。这方法适用于 `URL` 的路径部分，`URL` 的其他部分不受影响，比如域名。所以我们可以这样子做:

```swift
let articleTwo = NSHipster?.appendingPathComponent("ios9", isDirectory: true)
//articleTwo 现在包含的 URL 字符是 "http://nshipster.com/ios9/"

let deletePathComp = articleTwo?.deletingLastPathComponent
//deletePathComp 现在包含的 URL 字符是 "http://nshipster.com/"
```

> 译者注：
> 在 Swift 4.2 之前，deletingLastPathComponent 是一个属性，因此在调用时不用加括号。在 4.2 版本中，deletingLastPathComponent 变成了方法
> 因此如果你在 4.2 上运行上面一段代码，需要在 articleTwo?.deletingLastPathComponent 最后加一个括号才能正确运行

如果没有路径信息，可能有点儿奇怪。为了好玩，我链式调用了几次 `URLByDeletingLastPathComponent`，最后只是添加了 “../”，类似于在命令行（cd ..）中上一个目录。

当然还有几种修改方法和属性，但这些可能是最常用的。

## 总结

如果你对 URL 格式规范感兴趣的话，可以去查看苹果的 URL 参考文档中，关于如何处理 `URL` 这部分提及到的 `RFC` 文档。用于初始化的字符串必须符合 [RFC 2396](https://tools.ietf.org/html/rfc2396)，并且 `URL` 将会根据 [RFC 1738](https://tools.ietf.org/html/rfc1738) 和 [RFC 1808](https://tools.ietf.org/html/rfc1808) 被解析。这些规范内容很多，但你能找到所有可能关于 URL，URI 等的信息。

如果你完整查阅 `URL` 的文档的话，还可以看到它拥有 `baseURL`，`host`，`query`，`fragment` 等等非常多的属性，所有这些属性都能在 Apple 文档中查询到。不过对我来说，日常使用最多的还是 `absoluteString`，偶尔也会用到 `pathExtension`

我希望你能觉得这篇文章对你有所帮助。如果你觉得有用，请不要犹豫，在 Twitter 或者其他社交媒体上分享这篇文章。当然，如果你有任何疑问，请随时通过 [联系页面](http://www.codingexplorer.com/contact/) 或者 [Twitter@CodingExplorer](https://twitter.com/CodingExplorer) 与我联系。我会尽可能的帮助你。谢谢。

## 参考

[URL Class Reference – Apple Inc.](https://developer.apple.com/documentation/foundation/url)
