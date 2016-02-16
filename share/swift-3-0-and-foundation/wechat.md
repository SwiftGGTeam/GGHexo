Swift 3.0 和 Foundation"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2015/12/03/swift-3-0-and-foundation/)，原文日期：2015-12-03
> 译者：[pmst](http://www.jianshu.com/users/596f2ba91ce9/latest_articles)；校对：[Cee](https://github.com/Cee)；定稿：[numbbbbb](http://numbbbbb.com/)
  










我将尽量避免那些看上去很尴尬的笑话，直接介绍 [Swift CoreLibs Foundation](https://github.com/apple/swift-corelibs-foundation)。

以下引自 Apple：

> 本项目提供了各个平台下 Foundation API 的具体实现，但并未使用 Objective-C runtime 机制。在 OS X、iOS 以及其他 Apple 平台下，应用程序都应该使用指定操作系统下的 Foundation 进行开发。我们希望尽可能地抽象出具体的底层平台...    
我们最主要的目标是在 Apple 平台下使用 Foundation implementation parity。这将有助于整个 Swift 3 完成**可移植性**的目标。



正如在上篇更新的文章所述，Foundation 将使用新的 API 指导方针、摒弃 NS 前缀、精简文本并避免整体过度冗余。

具体实现文章在[这里](https://github.com/apple/swift-corelibs-foundation/blob/master/Docs/Status.md)。显然*有很多*要做的事。苹果的主要目标是使用一套标准工具类来实现跨平台开发，能够在各个平台之间保持相对高的独立性和可移植性。

开发者们更关注核心语言功能（比如 Swift 中的数组和字典）在标准库、功能（比如正则表达式中）以及 Foundation 基础库中有哪些不同。NSArray/NSDictionary/NSSet/NSString 的更新版本将成为 Foundation 的一部分，与标准库中对应的类稍有不同。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。