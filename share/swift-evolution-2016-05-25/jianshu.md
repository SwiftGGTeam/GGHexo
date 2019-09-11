Swift Evolution 系列开篇：简介"


作者：[shanks](http://codebuild.me)

Swift 的列车已经缓缓驶向了 3.0 版本了。自从 Swift 开源以来，Swift 的语法点变更速度加快，苹果制定了一个很好的 Swift 全民参与策略，保证热心的贡献者都能参与到 Swift 的建设当中，同时苹果作为判官，也会把大家的意见在社区里面进行充分的讨论。并形成结论，然后把讨论后靠谱语法特性点，安排到合适的版本中实现。这个项目的名字叫： Swift Evolution。



作为苹果开源的重要组成部分，Swift Evolution 除了作为官方宣布 Swift 新的特性点的地方以外，Swift Evolution 还制定了一个合理的特性点引入审核机制，引导贡献者按照统一的要求去提交自己的提议。目前在[github](https://github.com/apple/swift-evolution/tree/master/proposals)上，已经有将近100个的提议了。其中有一些已经在发布过的 Swift 2.2中实现了。见下图：

不过大部分的靠谱的提议都将会在年底到来的 Swift 3.0 中实现。大家可以到[项目主页](https://github.com/apple/swift-evolution)去围观具体的细节。

一个提议（Proposal） 在 Swift Evolution 中的[生命周期](https://github.com/apple/swift-evolution/blob/master/process.md)如下：

-  查看已经存在的提议：苹果建议大家首先查看已经提交过的提议，目前有100个左右。看有没有与自己提议类似的。如果有就不用重复提交了。
- 提交草稿：在 swift-evolution 邮件组里面发起自己的提议草稿，并且进行充分的讨论。
- 实现提议：按照苹果的提议模板，填写提议的更加细节的内容。并且还是放到邮件组里面进行讨论。
- 请求审核：向[ swift-evolution repository](https://github.com/apple/swift-evolution)提交一个请求，表示自己的提议已经经过讨论，希望苹果 Swift 核心团队能开始审核自己的提议。当自己的提议被认为已经就行了充分的讨论，已经很成熟了。这个时候，Swift 核心团队会接受这个提议。然后就进入 Swift 核心团队审核环节。
- 审核提议：Swift 核心团队会接管你的提议，并且进行编号，指定一个审核经理（Chris也是其中的一员，所以作为粉丝，能够跟偶像打交道的你，赶紧行动吧）。并且发起审核流程，一般来讲，会在[这里](https://github.com/apple/swift-evolution/blob/master/schedule.md)公示目前审核中的提议。
- 审核完成：审核完成后，会给出审核结果-通过或者拒绝。通过的情况下， 会告知在那个版本实现。拒绝也有一个展示的列表。

这篇文章就写到这里，接下来的系列文章，会把所有提议都过一遍，无论靠谱还是不靠谱的。在 Swift 3.0 发布之前，希望通过对这些提议的学习和理解，提前让大家了解 Swift 3.0 的一些新的特性。并且知道提议背后的前因后果。