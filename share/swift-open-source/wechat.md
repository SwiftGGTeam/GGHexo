聚焦 Swift #0"

> 作者：Jesse Squires，[原文链接](http://www.jessesquires.com/swift-open-source/)，原文日期：2015/12/06
> 译者：[pmst](http://www.jianshu.com/users/596f2ba91ce9/latest_articles)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[numbbbbb](http://numbbbbb.com/)
  







> 译者注：这个系列的关注重点是 Swift 开源项目本身的发展，作者会截取每周发生的大事（比如合并了一个大改动）并进行分析，还会写一些有趣的小发现，很有意思。我们已经拿到翻译授权，会每周进行更新，欢迎关注。

革命起源：**2015.12.06**

Apple 宣告 “[Swift即将开源](https://developer.apple.com/swift/blog/?id=34)” 的随后几天里，项目的活跃度让人瞠目结舌。回想今年早些时候的 [WWDC](https://developer.apple.com/wwdc/) 大会上 Apple 提及 Swift 不久会被开源，我可不认为任何人会像这样期待该发布版本。

![](http://swift.gg/img/articles/swift-open-source/swift-logo.png1451394012.0965536)



### Expectations（期望）

没人真正知道接下来会发生什么。譬如 Swift 项目将会被投放到 [opensource.apple.com](http://www.opensource.apple.com/) 上，变得和其他开源项目一样毫无新意？还是说它会像 [ResearchKit](https://github.com/ResearchKit) 一样放置到 GitHub 上？最终，Swift 不仅发布到 [GitHub](https://github.com/apple/) 上，而且 Swift 团队将会以一种彻底透明化的方式工作。Apple 为该发布版所做的工作是令人瞩目的。我们不但可以获得所有的源代码，同时还能浏览每个项目[完整的提交历史](https://github.com/apple/swift/commits/master)，提供非常详细的视图展示 Swift 团队的开发流程，以及 Swift 的[演变史](https://github.com/apple/swift-evolution)。 任何你想要获悉的东西都可以在 [Swift.org](http://swift.org/)上找到。


### Swift in the open

过去的几天里我浏览了 [GitHub](https://github.com/apple/) 的源码仓以及 Swift 的[邮件列表](https://swift.org/community/#mailing-lists)。真是太有意思了！很好奇 Swift 开发在之后的发展中会变成什么样子？下面分享到目前为止我觉得很有意思的一些东西。

* Chris Lattner 于 2010.7.17 提交了首个 [commit](https://github.com/apple/swift/commit/18844bc65229786b96b89a9fc7739c0fc897905e)。
* Swift 源代码发布到 GitHub 上的短短24小时里，[Swift repo](https://github.com/apple/swift) 星星数以超过 10,000 之多。到目前为止已经拥有 19,000 星星数 和超过 2,000次 fork。在写这篇文章时候，它依旧占据 GitHub 热门榜单第一位。（pmst注：翻译时 **24,724** stars，**3043** fork，遗憾的是不在热门榜单中。）
* 所有 repos 的 pull requests 加起来超过 400 之多。许多都已经被接收并合并了。
* [WWDC 2014](https://developer.apple.com/videos/play/wwdc2014-402/) 宣告发布 Swift 语言之后，我想 Swift 团队在 twitter 上的活跃度是有目共睹的：一边答疑解惑；一边是 [Chris Lattner](https://twitter.com/clattner_llvm)，[Joe Groff](https://twitter.com/jckarter) 以及 [Jordan Rose](https://twitter.com/UINT_MIN) 大神时不时地举例说明。正是因为这些推文加速了 bug 的修复！😄
* 还记得 [Apple 和 IBM](https://www.apple.com/pr/library/2014/07/15Apple-and-IBM-Forge-Global-Partnership-to-Transform-Enterprise-Mobility.html) 的[合作关系](http://www.apple.com/business/mobile-enterprise-apps/)吗？因此 IBM 对服务器端 Swift 开发的[投入](https://developer.ibm.com/swift/2015/12/03/introducing-the-ibm-swift-sandbox/)也就没什么令人吃惊的。就目前来看，Swift 应用到服务器端的趋势尤为明显。
* Chris Lattner 于星期六下午10点合并了 [pull requests](https://github.com/apple/swift/pull/166)。😆
* 我们已经确切获悉了 Swift3.0 即将做出的改变。没有啥让人惊喜的东东拉。
* Swift3.0 中 [++ 和 -- 运算符将被移除](https://github.com/apple/swift-evolution/blob/master/proposals/0004-remove-pre-post-inc-decrement.md)。感谢 [Erica Sadun](https://twitter.com/ericasadun)，以及 [C 风格的 for 循环](https://github.com/apple/swift-evolution/blob/master/proposals/0007-remove-c-style-for-loops.md)。她同一天中提交了2个建议！👏
* Chris lattner [提交](https://github.com/apple/swift/commit/22c3aa0588d2df1a207dcbad85946bab7976894c)了“Pull some ancient history off an internal wiki page for possible historical interest.” 什么？是的，没错！奇客们注意了。
* 自从2014年9月开始 [@practicalswift](https://twitter.com/practicalswift) 这个专门收集 [swift 编译崩溃信息的系列](https://github.com/practicalswift/swift-compiler-crashes)已经作为[仓库内容](https://github.com/apple/swift/commit/e5ca8be1a090335d401cd1d7dfcf9b2104674d5b)的一部分了。
* 使用 `associated` 类型声明取代 `typealias` 声明方式看起来是一个不错的[机会](https://github.com/apple/swift-evolution/pull/33/files)。
* [Jacob Bandes-Storch](https://twitter.com/jtbandes) 提交了两个 [pull request](https://github.com/apple/swift/pull/272) 修复了将近 400 个 crash 。😲
* Swift 团队似乎很热衷于让社区参与进来。无所谓贡献大小！
* [swift-corelibs-foundation](https://github.com/apple/swift-corelibs-foundation) 框架大部分都还[未实现](https://github.com/apple/swift-corelibs-foundation/search?utf8=✓&q=NSUnimplemented)。看起来还有很多低挂的“果实”能让你来采摘。我很好奇这是否是 Apple 故意而为之，鼓励开发者参与贡献，还是说真的是因为时间紧迫导致的？
* 自2010起的[initial checkin](https://github.com/apple/swift/commit/afc81c1855bf711315b8e5de02db138d3d487eeb) 实际上是版本4，从内部 SVN 仓库中导入的。“Swift SVN r4”。 你将注意到下面头文件中的注释说到：“该源文件是 Swift.org 开源项目中的一部分。Copyright(c)2014-2015 Apple Inc.” 我的看法有三点：    
    1 在将项目发布到 GitHub 之前，提交历史已经被重新编辑以及整理过了。     
    2 2010年时，Swift 团队指定的截止日期就是“2014-2015”，无关其他。这本就是 Apple 的一贯做法，反正 Swift 跌跌撞撞地已经到来。    
    3 Chris Lattner 是个“巫师”。

我想我们已经有了一个良好的开端。社区实在强大且狂热，仅仅**三天**,Swift 就有了极大地改进。正如 Lattner 所说，革命是属于 Swift 的！

以上就是我所获知的所有东西了。如果你喜欢该文章，[请让我知道](https://twitter.com/jesse_squires)。或许我会坚持下去，分享我的发现。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。