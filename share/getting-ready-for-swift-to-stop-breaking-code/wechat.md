Swift 3.0：你的代码即将崩坏"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2016/02/29/getting-ready-for-swift-to-stop-breaking-code/)，原文日期：2016-02-29
> 译者：[Crystal Sun](undefined)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[shanks](http://codebuild.me/)
  








当我们提到代码崩坏（code breaking）时，一般是指下面这两种情况。

1. 语音语义发生了变化。这时你需要重构代码，典型例子就是 Swift 从 `(..., $NSError) -> Result?` 格式改为错误抛出。

2. 语言语法发生了变化。这时只需进行迁移，然后大部分代码或多或少都能自动修复（还有一小部分需要微调）。

后者确实会带来一些麻烦，但更具破坏性的是前者。如果我猜的没错，Swift 3 的目标是进行最后一次内部调整，等到 Swift 4 时就不会再重新设计语言了，而是增加新的特性。



Chris Lattener [写道](http://comments.gmane.org/gmane.comp.lang.swift.evolution/7746)，

> 赞同 —— Swift 3 的源码调整已经完成了，所以我们会提供非常棒的迁移工具，帮助人们能够迅速完成迁移工作。除了 Swift 3 外，Swift 社区将会成为多元化社区，支持多个平台系统，创造出更多不同的工具和 IDE 供开发者使用。

> 正因如此，在 Swift 3 发布之后，源码崩坏修复（source breaking changes）会更加困难，我们倾向于尽可能地把改动放到 Swift 3 中。


[更多内容](http://article.gmane.org/gmane.comp.lang.swift.evolution/5055/match=understand+desires+but+don't+think+right+way+go+case+three+reasons)：

> 虽然 Swift 4 可能也有一些崩坏改动，不过我们更希望能够减少崩坏的情况

[时间框架](http://comments.gmane.org/gmane.comp.lang.swift.evolution/5287)

> 这也是为什么我们要努力完善 Swift 3 的原因，在目前的时间限制下，即使这意味着要推掉一些有趣的工作……
……

> 我认为现在没有必要讨论 Swift 3 之后的特性，也不会带来什么好处。没有足够的资源让核心团队成员参与讨论，我们更希望能够让社区和开源贡献者将主要的精力集中在 Swift 3 上，力争让 Swift 3 功能更加强悍。

> Swift 3 的特性能够预示 Swift 4 的走向。尽管有一些特性我们能够预知（例如并发会成为 Swift 的一个特性），仍然有很多完全不同的设计方向值得我们探讨和尝试。虽然现在不太可能来一场讨论，权衡决定哪种是最好的解决方案，不过大量的讨论必定会浪费时间。

>  现在需要所有相关的人等到合适的时间再来讨论，虽然这需要足够的耐心和克制，不过对每个人来说，这是最好的。今年秋天（北半球）很快就要到了，我们还有太多重要的工作需要完成。

将 Swift 3 的各种目标固定下来列出时间表这件事[可不太容易](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20160125/007737.html)，尤其是 Swift 开源之后。

> 预测 Swift 3 最终结果（比如：“Swift 3 会实现我们的目的吗？”），本身就是一件危险的事情，也不可能做到完美预测。在语言设计和增加特性上有太多的未知了（比如：我们连一个具体的设计稿都没有，你如何知道要花费多少时间来执行呢？），随着新的问题不断出现，我们的工作量又在不断增加，当然了，需要开源社区来确认有哪些新问题。更不可能预测开源的贡献者能提供多少时间和工作量。

> 我们对一些好的想法说“不”的部分原因就是我们设计和执行的受限。我们对 Swift 3 有较高的目标要求，但是我们也不能百分百确定我们能完全实现我们的目标（这也是“目标”的原因了，而不是“确定性”）。我觉得我们在 Swift 3 上要行动一致，集中解决语言里的核心缺陷，修复各种问题，设计影响 ABI 稳定性的 resilience 特性，同时呈现小范围的扩展。不同于之前讨论的大的扩展，小范围扩展不会影响核心模块（ 例如成员初始化改造 the menberwise init revamp ），我希望能在 Swift 3 里实现部分扩展。

> 总而言之，关于 Swift 3 是什么的问题，已经上升到更高的层次，Swift 3 能够让更多的人接受 Swift 语言，人们在 Linux 上运行 Corelibs + Swift 变成现实，无疑能够吸引更多的人来使用 Swift ，SwiftPM 已经逐渐完善，形成了自己的体系，Swift 语言和 stdlib 标准库函数更加成熟。

> 这意味着什么？恩，首先，从 Swift 2 过渡到 Swift 3 不可避免地将是悬崖式的过渡，大量的代码需要重写，Cocoa 的重命名工作也要落地了，我们将再次创建令人瞩目的科技成果。同样地，我们应该尝试将 “ 重新布局式的 ” 改变放到 Swift 3 中，如果可能的话，Swift 3 到 Swift 4 的过渡尽可能平缓一些。现在人们理解接受 Swift 的进化改变的种种不便，不过我们不能一直这样。我认为我们不能百分之百地保证从 Swift 3 到 Swift 4 的代码兼容性，我希望从 Swift 2 到 Swift 3 的代码升级能够简单一些。

最后一点，留意 Cocoa 的重命名工作，这将是一项令人瞩目的成就。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。