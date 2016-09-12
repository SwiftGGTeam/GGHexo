SE-0005，一个你可能想知道的 Swift 改进提案"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2016/02/02/se-0005-the-one-swift-evolution-proposal-youll-want-to-know-about/)，原文日期：2016-02-02
> 译者：[bestswifter](http://bestswifter.com)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[Cee](https://github.com/Cee)
  









截止 2016 年 2 月 5 日，[SE-0005](https://github.com/apple/swift-evolution/blob/master/proposals/0005-objective-c-name-translation.md) 提案正在接受公开的审核。它提议在 Swift 中导入 Objective-C 代码时自动转换名称。



> 这个提案描述了如何改进 Swift 的「Clang Importer」，它负责将 C 和 Objective-C 的 API 导入到 Swift 中。通过这样的改进，Objective-C 的函数、类型、方法、属性等的名称可以被翻译成更加符合 [Swift API 设计准则](https://swift.org/documentation/api-design-guidelines/)的名称。这份准则是 Swift 3 的一部分。我们的解决方案专注在 Objective-C 的 [Cocoa 编码规范](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/CodingGuidelines/CodingGuidelines.html) 和 Swift API 设计准则之间的区别，同时使用一些简单的语言分析来把 Objective-C 的名称自动转换成更加 Swift 化的名称。


做 Apple 开发时，Cocoa 是底层工具，相关知识很难学习。我不认为开发者们会愿意接受大规模的 API 调整，这会给代码审查、错误检测、后期维护以及编写新代码带来更高成本。这里是 [Nate Cook 的看法](http://article.gmane.org/gmane.comp.lang.swift.evolution/5503/match=nate+cook)。如果你在 Cocoa 部门工作，我希望你能花一些时间仔细阅读他写的内容。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。