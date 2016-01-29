Swift 3 及展望"

> 作者：Thomas Hanning，[原文链接](http://www.thomashanning.com/swift-3/)，原文日期：2015/12/10
> 译者：[小铁匠Linus](http://weibo.com/linusling)；校对：[Cee](https://github.com/Cee)；定稿：[](undefined)
  









2015 年 12 月 3 日，Swift 正式开源。同时，官方也公布了 Swift 3 的最新消息，即 Swift 3 将会在 2016 年秋天发布。



## API 设计指南与 Swift 中 Objective-C 的导入

Swift 3 的 API 设计指南将与 Objective-C 中 Cocoa 的完全不同。这就意味着 Objective-C 中的 API 映射到 Swift 时会与以往不同。[这里](https://github.com/apple/swift-evolution/blob/master/proposals/0005-objective-c-name-translation.md)有一个相关的例子可以研究一下。以下这行代码的方法调用是从现有的 Objective-C 中「翻译」成 Swift 的：

    
    let contentString = listItemView.stringValue.stringByTrimmingCharactersInSet(
       NSCharacterSet.whitespaceAndNewlineCharacterSet())

而在 Swift 3 中同样的方法调用将会是下面这个样子的：

    
    let content = listItem.stringValue.trimming(.whitespaceAndNewlines)

这样让语法看上去更「Swift 化」。然而，这也意味着已经导入的 Objective-C API 将会有很大变动，因此，现有的这些代码将会报错。

## 彻底的泛型

Swift 有泛型，但是这次是为了引进新的特性，就像递归协议约束（使得受限的扩展遵循新协议的能力），比如遵循 `Equatable` 的数组的元素也是遵循 `Equatable` 的。

## 精简的语言

对于那些「和 Swift 语法不是很配」的语言特性仍然会有一些小改动。同样的，这也会使得现有的这些代码报错。

## 展望 Swift 3

* Swift 目前还没有在语言层面支持并发操作。取而代之的是使用 NSOpertion 或 dispatch queues 来处理。这种状况在 Swift 3 中仍然不会改变。但是，在未来（Swift 4？）可能会有一个语言层面上并发操作的支持。

* Swift 和 C，特别是 Objective-C，现在已经有了很好的兼容。但是，却缺乏与 C++ 的兼容。虽然，这也不会在 Swift 3 上有所改变，但是这需要一个比较长期的目标来引进它。

## 小结

首先，Swift 将会在未来大规模的改善和提升，这是一个非常好的消息。另一方面，Swift 3 的发布会使得现有的 Swift 2 代码报错，因此，需要做一些代码迁移的工作才行。

## 参考

[Swift.org](http://swift.org/)
[Swift Programming Language Evolution](https://github.com/apple/swift-evolution)
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。