title: "转换流"
date: 2016-09-28 
tags: [Swift 进阶]
categories: [Erica Sadun]
permalink: transformative-streams
keywords: 转换流
custom_title: 
description: 在 Swift 中转换流可以从根本上改变流经它的文本，比如限制大小写或是拼写检查，本文就从一个翻译流来举例讲解下转换流。

---
原文链接=http://ericasadun.com/2016/08/29/transformative-streams/
作者=Erica Sadun
原文日期=2016-08-29
译者=Darren
校对=shanks
定稿=千叶知风

<!--此处开始正文-->

我在很多地方都表达了我对流的喜爱。我在 [Swift Cookbook ](http://www.informit.com/store/swift-developers-cookbook-includes-content-update-program-9780134395265)中介绍了一些。现在，我将通过 Pearson 的内容更新计划更新 Swift 3 的相关内容，正好我有一些要说的。我想在文章中添加一些有趣的新配方。

<!--more-->

今天，让我们谈谈『转换流』。你写 `print(..., to:)` 时传递的传统流，只是一个你传递给stdout、stderr或文件的一个目标而已。转换流会从根本上改变流经它的文本。你可以限制文本为全部小写，或者做拼写检查，甚至打印到你的平台的本地通知系统。

因此我决定创建一个翻译流。如截图所示，当你打印流的时候，会把英文文本转换成其他语言。

![](https://i1.wp.com/ericasadun.com/wp-content/uploads/2016/08/Screen-Shot-2016-08-29-at-4.12.58-PM.png?w=822&ssl=1)

如图所示，我的解决方案充分利用了 Swift 标准库内置的 print 函数。Swift 允许打印到流。当使用我的 `ItalianStream.shared` 流时， 打印到控制台的内容被自动翻译成了我在流中提供的语言。

在我的实现中，我希望能够做到几个关键点：
* 所有特定的翻译功能都需要从打印流中分离，这样我可以在不打乱实现的情况下交换不同 API 提供的输入和输出。
* 我希望能使用多种语言。
* 我需要提供一个可重用的 `var` 成员，用于需要打印的流。
为了实现这些目标，我决定大量使用泛型和面向协议。我希望能够用一个泛型化的流类型来跟踪任意的语言，这反过来将为打印提供一个共享的流实例。这可能听起来有点绕。

标准库内置的 `TextOutputStream` 协议刚好满足了一个需求，一个接收一个字符串并做一些处理的方法。下面的代码翻译了字符串并打印了出来。

```swift
/// A text output stream that performs translation in
/// the process of printing
public struct TranslationStream<Language: EnglishTranslationProvider>: TextOutputStream {
    /// Writes the contents of the string to stdout after
    /// passing the string through an automatic translator
    public func write(_ string: String) {
        guard let translation = Language.translate(string) else { return }
        print(translation)
    }
}
```

比较 tricky 的是我的 `TranslationStream` 结构是泛型。它需要一个遵循 `EnglishTraslationProvider` 协议的类型，允许其从 provider 请求翻译。这是协议的内容：

```swift
/// A provider of string translations from English
public protocol EnglishTranslationProvider {
    /// Returns a shared instance of the provider
    static var shared: TranslationStream<Self> { get }

    /// Returns a translated string
    static func translate(_ string: String) -> String?
}
```

每个语言翻译的 provider 提供一个 `shared` 翻译流给 `TranslationStream` 类型供 打印时使用（就像在 `ItalianStream.shared` 的截图中所看到的那样 ），以及一个 `translate` 方法来返回字符串翻译后的版本。例如，这是法语 provider 类型的实现：

```swift
/// A stream type that automatically translates from English to French
public struct FrenchStream: EnglishTranslationProvider {
    /// Returns a shared instance of the provider
    public static var shared = TranslationStream<FrenchStream>()
    
    /// Returns a translated string
    public static func translate(_ string: String) -> String? {
        return FrenchStream.translate(string, language: "fr")
    }
}
```

很简单吧？这真的不难。它实现了两个必要的成员，另一方面作为在协议扩展中声明的默认 `translate` 方法的代理。我的具体实现用了两个字符的语言代码，并通过 Google 翻译成英语。我在这里并没有包含实际的` translate(_ string:, language:) ` 方法，因为有很多易使用的 API可供选择，它们一般都需要 API key 和费用。

我试图让本文的重点是『哇，6666，你可以在打印流时转换文本。』，而不是『哦，翻译了。』。我认为翻译流是展示这个特定的 Swift 特性的好方式。

*在下面的截图中，我把（第20行）打印到了用户的通知栏。*

![](https://i0.wp.com/ericasadun.com/wp-content/uploads/2016/08/Screen-Shot-2016-08-29-at-9.06.29-PM.png?w=863&ssl=1)