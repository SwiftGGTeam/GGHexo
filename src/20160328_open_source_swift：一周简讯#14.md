title: "Swift 一周简讯 #14"
date: 2016-03-28 11:30:00
tags: [Swift 开源信息]
categories: [Open Source Swift]
permalink: open-source-swift-weekly-14
keywords: Swift开源
custom_title: 
description: 

---
原文链接=http://swiftweekly.github.io/issue-14/
作者=Jesse Squires
原文日期=2015.03.17
译者=pmst
校对=numbbbbb
定稿=numbbbbb

<!--此处开始正文-->

欢迎来到开源周刊14期！效仿 [Dave Verwer](https://iosdevweekly.com/issues/241#start)，我也对 Xcode7.3 最后发布版本进行了预测 —— 包括 iOS9.3，OS X10.11.4 以及 watchOS2.2 三个版本。Xcode7.3 将包含最终版本的 Swift2.2 语法。核心团队可能会在下周一解开谜底。ps：Apple 将于 3.21 举办 [“Let Us Loop You In”](http://www.macrumors.com/2016/03/10/apple-invites-march-21-event/) 的发布会。

<!--more-->

# 启动任务

来自 [Ehsan Hahromi](https://github.com/SwiftWeekly/swiftweekly.github.io/pull/26) 的建议：

* [SR-306](https://bugs.swift.org/browse/SR-306) —— 新增稳定排序算法
* [SR-587](https://bugs.swift.org/browse/SR-587) —— 将`Array(count:repeatedValue:)` 构造方法移至 `RangeReplaceableCollection`协议的扩展当中。

来自 [Daniel Eggert](https://twitter.com/danielboedewadt) 的建议：

* 实现 [NSURLCredential](https://github.com/apple/swift-corelibs-foundation/blob/e35f9732ccda2a5f293dbaf70d9a42a8d7aadc86/Foundation/NSURLCredential.swift)
* 实现 [NSCachedURLResponse](https://github.com/apple/swift-corelibs-foundation/blob/e35f9732ccda2a5f293dbaf70d9a42a8d7aadc86/Foundation/NSURLCache.swift)
* 实现 [NSURLProtectionSpace](https://github.com/apple/swift-corelibs-foundation/blob/3579f1f306182e4de48a35dfd9067eff22cee27a/Foundation/NSURLProtectionSpace.swift)

此外，上周周报中 Brian Gesiak 提出的[问题](http://swiftweekly.github.io/issue-13/)依然悬而未决：

* [SR-906](https://bugs.swift.org/browse/SR-906) —— 允许 XCTestCase.continueAfterFailure 进行可写
* [SR-875](https://bugs.swift.org/browse/SR-875) —— 促使 swift-corelibs-xctest 的功能测试正则匹配，使得用起来更像 FileCheck

> 提交任务啦！倘若你想要提交任务，请新建一个 [issue](https://github.com/SwiftWeekly/swiftweekly.github.io/issues/new) 或 [pull request](https://github.com/SwiftWeekly/swiftweekly.github.io/compare)。同样你还可以在 tweet 上 [@swiftlybrief](https://twitter.com/swiftlybrief)。任务可以有不同的难度，但通常要求适合初学者。😄

# 仓库

本周新增了 [apple/cups](https://github.com/apple/cups) 仓库，这是来自官方版本的 [CUPS](http://www.cups.org/) 资源。如若你对此不是很熟悉，简单来说CUPS是基于标准的，为Apple OS X和其他类 UNIX 操作系统开发的开源打印系统。此代码已经存在了十几年（自1999年开始），所以看着它“与时俱进”，将项目迁移到GitHub真的很不可思议。“应大众的要求，CUPS 现已托管于 GitHub 上。所有 bugs 都一并迁移到了 GitHub 的 issue 追踪器上，同时更新了 git 仓库，包括自1.7.0版本开始丢失的发布标签。在未来几周里，我们还将把 cups.org 网站搬迁到 GitHub 上进行托管。” 我想知道我们是否会见证更多来自 Apple 的开源项目搬迁到 GitHub 上呢？希望如此吧。😎


# Commits 和 PR

来自 [objc.io](https://www.objc.io/) 的 Daniel Eggert 提交了在 corelibs-foundation 中实现 `NSHTTPURLRepsonse` 的 [pr](https://github.com/apple/swift-corelibs-foundation/pull/287)。👏

Max Howell 将 Swift Package Manager [移植](https://github.com/apple/swift-package-manager/pull/171)到 Swift3 版本上了。

Nate Cook 为基于新索引模型的集合打上 `.flatten` [补丁](https://github.com/apple/swift/pull/1670)。

John Regner 递交了一个 [PR](https://github.com/apple/swift/pull/1686)，关于将 SourceKit 中的代码格式化逻辑部分移动到 libIDE中，作为 [SR-146](https://bugs.swift.org/browse/SR-146) 提案的一部分（该提案旨在创建一个 `swift-format` 工具）。

John Holdsworth 修复了 Xcode7.3b5 版本中关于 SourceKit 使用 “Quick Help” 崩溃的问题。😎 我从未听说过SourceKit 会崩溃。 😉

@practicalswift 新增了一些编译崩溃的[测试案例](https://github.com/apple/swift/pull/1625)。

Janek Spaderna 修复了 AST/sema 中的崩溃问题：当你在 where 从句中引用枚举用例（enum case）会导致 crash。目前解决方案为打印错误信息而非直接崩溃。[该问题](https://github.com/apple/swift/pull/1554#issuecomment-192969283)看起来最初是由 @practicalswift 发现的。

# 提案

Erica Sadun 的 [SE-0039](https://github.com/apple/swift-evolution/blob/master/proposals/0039-playgroundliterals.md) 提案：Modernizing Playground Literals 已经正式被 Swift3.0 采纳了。“社区和核心团队一致认为该项提案增加了 swift 编程语言的一致性。” Chris Lattner 将该任务归档到 [SR-917](https://bugs.swift.org/browse/SR-917) 用于追踪进度。“对于那些致力参与编译器开发的小伙伴，这将是一个意义非凡的启动任务。”👍

Jesse Rusak 的 [SE-0037](https://github.com/apple/swift-evolution/blob/master/proposals/0037-clarify-comments-and-operators.md) 提案：关于理清注释和运算符之间的交互问题已经正式被采纳了。“社区中几乎没有相关讨论，但核心团队和社区参与者都表示赞同，认为这将解决语言中的一个角落问题。”你可以在 [SR-960](https://bugs.swift.org/browse/SR-960) 关注工作的进度。

Jake Carter 和 Erica Sadun 的 [SE-0046](https://github.com/apple/swift-evolution/blob/master/proposals/0046-first-label.md) 提案：为包括首标签（first label）在内的所有参数建立一致的标签行为建议，已正式被 Swift 3 采纳了。“社区和核心团队一致认为该提案有助于产生积极的影响，不但增加了语言的可预测性和一致性，而且移除了一个常见的混淆问题。”🎉，该项任务可在[SR-961](https://bugs.swift.org/browse/SR-961)追踪查看。

llya Benlenkiy 的 [SE-0025](https://github.com/apple/swift-evolution/blob/master/proposals/0025-scoped-access-level.md) 提案：Scoped Access Level 被返回做进一步的修订，这看起来核心团队还是对此很感兴趣的。虽然他们认为这符合 Swift 的开发方法，但是他们还是担心`local`和`private`之间造成混淆。

>所要求的修订包含提及的 `local` 关键字。核心团队认为目前 `private` 关键字能够很恰当地描述提及的功能性。其他具有私有访问说明符的编程语言密切结合提出的局部性行为。所以这样的改变将有助于减少开发者语言使用的切换，同时正如核心团队所认为的，`private`关键字所要描述的内容更合适。

>具体而言，核心团队提出了一个修订版本的提案，旨在将现有的`private`关键字语义更改成提及的`local`关键字，并为现有的私有语义引入一个新的名称，更明确地表述文件的私有访问。正因为改动影响面太广，因此核心团队认为还需做进一步的公开审查。

Michael IISeman 的 [SE-0044](https://github.com/apple/swift-evolution/blob/master/proposals/0044-import-as-member.md) 提案：“作为成员导入”提案目前处于[审核状态](https://lists.swift.org/pipermail/swift-evolution-announce/2016-March/000065.html)。“该提案旨在为 C API 作者提供一种机制，在导入 Swift 类型时指定导入函数和参数成员的功能。同时它还为那些遵循一致性，且具有严格命名约定的 API 提供一个自动推断选项。”

Joe Groff 的 [SE-0042](https://github.com/apple/swift-evolution/blob/master/proposals/0042-flatten-method-types.md) 提案：“ Flattening the function type of unapplied method references” 目前处于[审核状态](https://lists.swift.org/pipermail/swift-evolution-announce/2016-March/000068.html)。“我们应该对一个未应用的（unapplied）方法引用进行类型调整，通过平整化（flatten）函数传入值方式替换掉原先的 curried 类型。这将大大使得 未应用的（unapplied）方法在实际 Swift 库中更具可读性和实用性，同时还应支持突变函数。”当前我们可以通过往`reduce`方法传入全局运算符`+`来实现，譬如：`arrayOfInts.reduce(0,combine:+)`。但是你却无法通过传入类似`Set.Union`二进制方法来做同样的事，譬如：`arrayOfSets.reduce([], combine: Set.union)`。这项提案将将使得后者成功可能。

Andrew Benett 的 [SE-0043](https://github.com/apple/swift-evolution/blob/master/proposals/0043-declare-variables-in-case-labels-with-multiple-patterns.md) 提案：“在多个匹配 `case` 标签中声明变量”目前正在审核中。“ Swift2 已经实现了 `case`选项中多条件匹配。但是不适用`case`用例中声明变量的情况。提案的改动不但可以减少重复的代码，同时还将减少错误发生。当未定义变量时，它和多模式匹配保持一致。”

Adrian Kashivskyy 和 Erica Sadun 的 [SE-0047](https://github.com/apple/swift-evolution/blob/master/proposals/0047-nonvoid-warn.md) 提案：“Defaulting non-Void functions so they warn on unused results”目前正在[审核中](https://lists.swift.org/pipermail/swift-evolution-announce/2016-March/000070.html)。“就 Swift 目前情况，通过为方法和函数标注 `@warn_unused_result` 来告知编译器对于返回类型为 non-void 的方法或函数，其返回值应该被使用（译者注：也就是函数返回值也应该被利用，丢弃会产生警告）。这是一个肯定的声明。在它的情况下，忽略的结果不产生警告或错误。[...]未使用的结果更能够向编程者说明错误，而不会在 mutating 和 non-mutating 函数对之间产生混淆。该提案使得 'warn on unused result' 作为 Swift 方法和函数的默认行为。

# 邮件列表

Max Howell 发邮件称，想要恢复此前SPM中的一个第三方测试框架协议[提案](https://lists.swift.org/pipermail/swift-build-dev/Week-of-Mon-20160314/000335.html)。

Daniel Eggert 开启一个有关使用封装`libcurl`来实现 `NSURLSession` 的[话题](https://lists.swift.org/pipermail/swift-corelibs-dev/Week-of-Mon-20160314/000484.html)。Philippe Hausler 回复了一些关于 corelibs-foundation 和 移植 API 到 Linux 的一些趣闻。

由 [David Hart](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20160314/012642.html) 开启的话题仍在继续，关于“Referencing Objective-C key-paths”[草案](https://github.com/apple/swift-evolution/pull/210)。这将消除另一个 KVC/KVO 中使用 stringly-typed 的代码。“这项提案旨在使用 key-paths 进行代码修改时，能够提高安全性和韧性，通过引入一个编译器来检查表达式实现。”社区反馈一片好评。

Yuta Koshizawa 建议为 `Result<T>` 增加 `throws` 语法糖，“将抛出（throws）和 结果（result）统一成单个特性，以保持语言简洁性。”Joe Groff 通过深思熟虑之后，回应核心团队关于 Swift 中错误处理模型决定的更多细节，并附上了原因。

>我们广泛讨论了在内部添加一个 Result 类型，但是最终无法自圆其说。唯一我们可以预见的使用案例是通过 CPS-inversion-style 抽象概念进行线程错误，譬如异步保证，其他一些我们希望能够提供合适语言支持的东西。一般来说，expressing effects 作为一元值是一个相当糟糕的抽象；除了通过没完没了的无用教程污染互联网环境，他们也不做清洁，而是强加在想要的地方 - 你不得不在 `Result<Async<T>>` 和`Async<Result<T>>`抉择，亦或是为`ResultT<AsyncT<Identity>><T>`建立一个单子转换器 - 同时当和其他高阶的抽象一起使用时，它们不做自然的事情 - 倘若你正在映射一个`throws` 函数到一个集合中，你可能更倾向于通过 `rethrows` 来进行错误抛出，而不是以 `Result<T>` 集合告终。我宁愿看到我们采用一个可扩展的代数效应系统，譬如 [http://www.eff-lang.org](http://www.eff-lang.org/) 为`throws`、`aync`和其他一些控制流效应提供了框架，以达到干净地组合和抽象的目的。我认为 `throws` 将作为第一个“种子”。

当然总是有那么几个[原型 Result 库](https://github.com/antitypical/Result)不能使你满意。

Joe Groff 恢复了早前关于编译器指令的话题，同时 Erica Sadun 为此起草了一份新提案，旨在为模拟器和设备目标扩展构建配置测试。“该提案新增`#if target(simulator)` 和 `#if target(device)`用于区分应用代码是否运行在模拟器上，亦或是真机设备上。”

# 写在最后

最后 —— 还在为使用面向协议编程犹豫不觉？何不尝试下 面向 side-effect 编程，前提是必须使用值类型。[一旦进行了值拷贝，就不再是你的问题喽。](https://twitter.com/jckarter/status/707999869831491584)😂 
