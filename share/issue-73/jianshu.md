Swift 周报 #73"

> 作者：Jesse Squires，[原文链接](https://swiftweekly.github.io/issue-73/)，原文日期：2017-06-09
> 译者：[四娘](https://kemchenj.github.io)；校对：[walkingway](http://chengway.in/)；定稿：[CMB](https://github.com/chenmingbiao)
  









这周的事情很多！今天是 [WWDC 2017](https://developer.apple.com/videos/wwdc2017/) 的最后一天，Swift 4 随着 [Xcode 9](https://developer.apple.com/xcode/)，一起放出了开发者公测版。Xcode 和 Swift 都有好几个重大的改进和新的功能 — 这个版本真的很棒。整个[社区](https://twitter.com/ericasadun/status/871819962888802304)的[反响](https://twitter.com/SmileyKeith/status/871852588844556288)[都](https://twitter.com/fpillet/status/871987276187828224)[很](https://twitter.com/chriseidhof/status/873066951739703296)[正](https://twitter.com/tonyarnold/status/873017116298846208)[面](https://twitter.com/ayanonagon/status/871850052498489344)。恭喜 Apple 的 Xcode, Swift 和开发工具组！


 
> 想要赞助 Swift Weekly Brief 吗？[点击此处了解更多](https://swiftweekly.github.io/sponsorship/)  

## Swift 解包

第 14 集：[Swift 更新内容，Part 1](https://spec.fm/podcasts/swift-unwrapped/70808)

我们讨论了 Swift 4 里的一些新功能和改进。

## 资讯及社区

Apple [宣布](https://www.apple.com/newsroom/2017/06/swift-playgrounds-expands-coding-education-to-robots-drones-and-musical-instruments/) Swift Playgrounds 已经支持对玩具机器人和无人机的编程了。他们正与多家公司合作，包括 Lego, Sphero 等一众公司。 这件事情很棒很好玩，你可以在这里查看[相关视频](https://www.youtube.com/watch?v=v7926MzvXOQ)。

Erica Sadun 的新书 [Swift Style](http://ericasadun.com/2017/06/01/swift-style-wwdc-sale/) 这周正式开始销售。

objc.io 已经放出了他们的新书，[Optimizing Collections](https://www.objc.io/blog/2017/06/02/optimizing-collections/)。作者 [Károly Lőrentey](https://twitter.com/lorentey) 在这本书里介绍了如何使用 Swift 编写高效的自定义集合类型。

[Xcode 9 beta 以及新的 SDK](https://developer.apple.com/news/?id=06052017d) 全都放出来啦！

## WWDC 里关于 Swift 的视频

- [What’s new in Swift](https://developer.apple.com/videos/play/wwdc2017/402/)
- [What’s new in Swift Playgrounds](https://developer.apple.com/videos/play/wwdc2017/408/)
- [Teaching with Swift Playgrounds](https://developer.apple.com/videos/play/wwdc2017/416/)
- [What’s new in Foundation](https://developer.apple.com/videos/play/wwdc2017/212/)
- [Understanding undefined behavior](https://developer.apple.com/videos/play/wwdc2017/407/)

## 提交和合并的请求

Rober Widmann [合并了修改](https://github.com/apple/swift/pull/10175)，使用了 Xcode 新的未定义行为检测器，来修复了一些未定义的行为。

Roman Levenstein [做了一些小调整](https://github.com/apple/swift/pull/10096)，让标准库的代码体积减少了 1.5% ！！！

Swift 服务端 API 工作组发布了一个[新的 repo](https://github.com/swift-server/http)，主要是关于跨平台 HTTP API 的开发。

Ben Cohen 向 `swift-4.0 分支`[发起了一个合并的请求](https://github.com/apple/swift/pull/10161)，用于提高 substring 比较的性能。Nate Cook [也发起了一个提高字典效率的合并请求](https://github.com/apple/swift/pull/10156)，现在已经有[好几个 Swift 4 的合并请求](https://github.com/apple/swift/pulls?utf8=✓&q=is%3Apr%20%5B4.0%5D%20in%3Atitle) 了，希望那些已经请求完成的合并请求可以尽快通过。我们应该可以在接下来的 beta 版里看到这些改进。

Slava Pestov [修复](https://github.com/apple/swift/pull/10162)了几个 Bug。👏

## 正在 review 的提案

[SE-0180](https://github.com/apple/swift-evolution/blob/master/proposals/0180-string-index-overhaul.md)：字符串索引类型统一，Dave Abrahams，[正在 review](https://lists.swift.org/pipermail/swift-evolution-announce/2017-June/000384.html)

> 现在 `String` 跟它的 `CharacterView` 共用一个 `Index` 类型，但 `UTF8View`，  `UTF16View` 以及 `UnicodeScalarView` 就不是了。这个提案重新定义了这几个类型的 `Index` 类型，让它们跟 `String` 保持一致。并且暴露一个公开的 `encodedOffset` 属性和构造器，用于序列化和反序列化 `String` 和 `Substring` 的索引值。  
>   
> […]
>   
> 这样的结果就是很多 API 都无法从原本的设计中获益，通常来说，一个 view 的索引如果可以在另一个 view 有对应的索引值的话，这些索引值的转换都应该在内部完成，而不是像现在这样需要写很多不必要的代码。 
>   
> […]  
>
>   
> 所有 String 的 view 都会使用同一种 Index 类型 (`String.Index`)，这样索引值就可以在内部进行转换，而不用显式地去完成。  
>   
> [查看原文…](https://github.com/apple/swift-evolution/blob/master/proposals/0180-string-index-overhaul.md)  

## 邮件列表

Ted Kremenek 发布了[一个公告](https://lists.swift.org/pipermail/swift-dev/Week-of-Mon-20170605/004751.html)，关于即将开源的重构工具，以及其它在 WWDC 公布的事情：
  
> 今天下午在 WWDC 上，我们发布了 Xcode 9 里新的重构功能(支持 Swift，C，Objective-C 和 C++)。我们同时宣布将会把这个引擎的核心代码开源出来，包括 Xcode 编译时才会索引的新功能。 
>   
> 大概会在接下来的几个星期里, 我们将会分阶段把这些代码发布出来： 
>
> - 关于 Swift 的重构功能，我们还需要做一些收尾工作，例如文档的编写，我们想在发布之前完成。 Argyrios Kyrtzidis 和他的团队负责处理这个计划。  
>  
> - 关于 C/C++/Objective-C 的重构功能，我们想和 LLVM 社区一起完成然后并入 LLVM。第一阶段应该会在 swift-clang 的 repo 里完成，但是他们想做的不只是这些。Duncan Exon Smith 和他的团队负责这个计划。  
> 
> - 我们也会开源编译器对于编译时索引的支持，包括了 Clang 和 Swift。Argyrios 和他的团队负责推进这件事。关于 Clang 的改变他们应该会在也会在 swift-clang 上完成，然后跟 LLVM 社区讨论如何将他们并入 Clang 里。  
>
> - 最后，我们将会把 Swift 迁移工具剩余的部分开源出来。Argyrios 和他的团队负责推进这件事情，这些修改只会在 Swift 仓库里完成。  
>
>   
> 和之前一样，我们还需要完成 Swift 与 Apple 最新的 SDK 的桥接工作。希望可以在下周之前完成，之后我们就会暂时关闭仓库的 commit 权限。相关的细节之后会通过邮件公布。在此之前， Swift.org 的可下载的工具链都可以跟 Xcode 8.3.2 交互。在这之后, 我们可下载的工具链就主要会面向 Xcode 9 beta。这件事情很必要，因为之后最上层的 API 会依赖于最新的 SDK。  

Rick Ballard 发了一个关于 Swift 4 包管理器的[公告](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20170605/037002.html):

>   
> Hello, Swift Pacakage Manager 的社区。  
>
>   
> 我想要汇报一下 Swift 4 里 SwiftPM 的开发进度。我们已经在这个春季实现了一系列的 evolution 提案： 
>   
> - [SE-0152](https://github.com/apple/swift-evolution/blob/master/proposals/0152-package-manager-tools-version.md) […]  
> - [SE-0158](https://github.com/apple/swift-evolution/blob/master/proposals/0158-package-manager-manifest-api-redesign.md) […]  
> - [SE-0151](https://github.com/apple/swift-evolution/blob/master/proposals/0151-package-manager-swift-language-compatibility-version.md) […]  
> - [SE-0146](https://github.com/apple/swift-evolution/blob/master/proposals/0146-package-manager-product-definitions.md) […]  
> - [SE-0175](https://github.com/apple/swift-evolution/blob/master/proposals/0175-package-manager-revised-dependency-resolution.md) […]  
> - [SE-0150](https://github.com/apple/swift-evolution/blob/master/proposals/0150-package-manager-branch-support.md) […]  
> - [SE-0162](https://github.com/apple/swift-evolution/blob/master/proposals/0162-package-manager-custom-target-layouts.md) […]  
> - [SE-0149](https://github.com/apple/swift-evolution/blob/master/proposals/0149-package-manager-top-of-tree.md) […]  
>  
>   
> 除了这些提案，我们还实现了一些重大的改进： 
>
> - 在 macOS 上，包的交互和包的编译现在都沙盒化了，能够减轻恶意软件带来的损耗。 
> 
> - 许多错误信息和诊断都加强了，包括依赖管理时出现的冲突。
>
> - Xcode 工程文件生成器也改进了，现在允许在重新生成工程文件时让 scheme 引用包里的 target。  
>  
> - 并且做了大量的小改进和 bug 修复。  
>
> Xcode 9 在新的编译系统里为 Swift 包管理提供了原生的支持。这个编译系统提供了灵活性和拓展性，让 Xcode 可以支持新的编译模型，例如 Swift 包管理。此外, SwiftPM 为 SwiftPM 的库做了大量的工作，让 Swift 包管理的工具可以轻松嵌入诸如 Xcode 的软件里。
>
>   
> 那 SwiftPM 4 还有什么？首先，我们将会实现 [SE-0179](https://github.com/apple/swift-evolution/blob/master/proposals/0179-swift-run-command.md)，支持 `swift package run` 命令。另外，我们还希望开始放下现在的版本，然后开始计划后面，虽然我们还是在接收建议和 evolution 的提案   
>   
> […]  
>
>   
> 其它功能我们应该会考虑在下个版本进行支持，例如包资源(例如图片)，许可证和元数据支持，用于处理源代码控制分支的显式支持，以及一个泛用的机制去处理编译工具不支持包管理的情况。最后, 我们确实考虑了之后建立一个中心化的包索引机制，我们也许会在接下来一年为这件事情做一些基础工作。 
>
>   
> [查看原文…](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20170605/037002.html)  

## 最后

最后 -- [self storage](https://twitter.com/NeoNacho/status/871143591258734594)


> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。