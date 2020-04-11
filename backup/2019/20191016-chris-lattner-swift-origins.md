title: "Chris Lattner 讲述 Swift 起源故事"
date: 2019-10-16
tags: [Ole Begemann, Swift]
categories: [Ole Begemann, Swift]
permalink: chris-lattner-swift-origins
keywords: Chris Lattner, Swift, Swift 历史
custom_title: 
description: 

---
原文链接=https://oleb.net/2019/chris-lattner-swift-origins/
作者=Ole Begemann
原文日期=2019-02-18
译者=jojotov
校对=numbbbbb,WAMaker
定稿=Pancf

<!--此处开始正文-->


在 [新推出的 Swift 社区播客第一集](https://www.swiftcommunitypodcast.org/episodes/1) 中，[Chris Lattner](http://nondot.org/sabre/), [Garric Nahapetian](https://garricn.com/), 和 [John Sundell](https://www.swiftbysundell.com/) 讲述了关于 Swift 起源的故事和 Swift 社区的现状。

本文是我整理出的一些比较有趣的东西（为了能更好地阅读而做了部分修改）。你可以看到我主要引用了 Chris Lattner 的讲话，因为我认为他对于 Swift 是如何被创造出来的描述是最值得保留下去的。但这并不代表 John 和 Garric 所说的东西没那么有趣。你真的应该去完整地收听整集播客——反正所花的时间和阅读本文相差无几。

<!--more-->

[Swift 社区播客](https://www.swiftcommunitypodcast.org/) 本身也非常值得关注。作为一个让你可以通过各种方式进行贡献的项目，它非常符合我们的预期（上面提到的三位嘉宾在第一集中谈到了更多细节）。在本文的完成过程中，我的工作主要在 [creating the transcript](https://github.com/SwiftCommunityPodcast/podcast/issues/15) 这个 Issue 上进行，甚至在代码格式部分和编辑机器生成的文本部分收到了许多来自于社区的帮助。在此对所有提供过帮助的人表示感谢！

你可以在 GitHub 上找到 [完整的记录副本](https://github.com/SwiftCommunityPodcast/podcast/blob/master/Shownotes/Episode1-Transcript.vtt)（[WebVTT 格式](https://en.wikipedia.org/wiki/WebVTT)）。所有的播客都是由 [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权。

------

## Swift 的起源

*（开始于 16:59）*

> **Crhis Lattner:** 关于这件事，我必须从 [WWDC](https://en.wikipedia.org/wiki/Apple_Worldwide_Developers_Conference) 2010 开始讲起。当时我们刚刚上线了 [Clang](https://en.wikipedia.org/wiki/Clang) 对 [C++](https://en.wikipedia.org/wiki/C%2B%2B) 的支持，非常多的人在这件事上面花费了极其巨大的精力。我对这件事感到非常开心的同时，也有一些烦躁，因为我们做了太多的细节工作。而且你很难不经过思考直接编写 C++ 代码，“天呐，应该有比现在更好的实现方法吧！”
>
> 因此，我与一个叫 [Bertrand Serlet](https://en.wikipedia.org/wiki/Bertrand_Serlet) 的哥们儿进行了许多次讨论。Bertrand 当时是软件团队的老大，同时也是一位出类拔萃的工程师。他是一个令人惊叹的人，并且在语言方面有点极客范。当时他正在推进对 [Objective-C](https://en.wikipedia.org/wiki/Objective-C) 的优化工作。我和他进行了许多次一对一的白板会议。
>
> > At the time, Swift was called ‘Shiny’.
> > 在那时，Swift 还叫 ‘Shiny’
> 
> Bertrand 负责苹果公司所有的软件项目，因此他基本没什么时间。但他总是会让我在工作结束时顺便拜访一下他，看他是不是有空。他经常会呆到很晚，然后我们会在白板上进行非常认真的讨论。我们会谈论非常非常多的东西：新语言要达成的目标、一些奇怪的细节如类型系统，并且我们最终都会把这些讨论变成一份计划书。因此我为他做了这份计划书并演变成构建一个新语言的想法。那时这个新语言还叫做 "Shiny"，寓意着你正在建造一个 [很酷的](https://www.youtube.com/watch?v=8q_lsRLJhcA) 新东西。[^1] 当然我也是 Firefly 电视节目的粉丝之一。（译者注："Shiny" 的梗源自 2002 年美国电视节目 [Firefly](https://en.wikipedia.org/wiki/Firefly_(TV_series))，意思相当于真实世界中的 "cool"。）
> 
> **John Sundell:** 当时的文件后缀是 `.shiny` 吗？
>
> **Chris Lattner:** 确实如此。你知道在那个时候，这还是个很小型的项目。真的就只有我和 Bertrand 在讨论这件事。另外就只有一个同样非常出色的工程师 [Dave Zarzycki](https://github.com/davezarzycki) 参与了早期的一些概念上的讨论。
>
> 一开始，我们就自然而然地展开了关于内存管理的讨论。当时，我们都确信一点就是：必须要有一个好的方法来解决或改善内存管理，并且我们需要确保 [内存安全](https://docs.swift.org/swift-book/LanguageGuide/MemorySafety.html)。因而，你必须有一个自动内存管理功能。
>
> > 为了达到自动内存管理的目标，我们有史以来第一次以 Swift 的内部设计讨论为起点，并最终在 Objective-C 中实现了此特性。
>
> 首先想到的一个关键功能就是 [ARC](https://clang.llvm.org/docs/AutomaticReferenceCounting.html)，同时我们需要让编译器自身支持这个功能，而不是通过运行时来实现。Objective-C 当时使用 [libauto](https://opensource.apple.com/source/libauto/libauto-77.1/README.html) 垃圾回收系统，但它有着一大堆问题。因此为了达到自动内存管理的目标，我们有史以来第一次以 Swift 的内部设计讨论为起点，并最终在 Objective-C 中实现了此特性。随后有许多的东西都是这样产生的，包括 ARC 和 [modules](https://clang.llvm.org/docs/Modules.html) 甚至 [literals](https://clang.llvm.org/docs/ObjectiveCLiterals.html) 及更多类似的功能，它们的确都是由 Swift 的幕后开发主导的。[^2]
>
> **John Sundell:** 所以在当时，你脑海里已经有许多关于 Shiny 的特性，最后它们都在 Swift 中实现了。但你曾经说过，“我们并不想一直等待新语言开发完成。我们应该把这些非常吸引人的特性加入到 Objective-C 中。”
>
> > 在构建一个新的语言时，你必须一直问自己，‘为什么不直接优化现有的语言’，这是幕后构思过程的一部分。
>
> **Chris Lattner:** 或许现在看来，Swift 的出现是必然的，但如果你从另一个角度思考这个问题，在当时并不是所有人都能认识到这一点，甚至连我也不能确定。Bertrand 从过去到现在都一直非常的棒，他一直给予我们极大的鼓励。而且他总是能在质疑中前进。Bertrand 有点类似科学家，他仅仅只是想通过各种途径寻找真相。的确，当时我们有许多疑虑，但同时也有许多好的想法。包括 Bertrand 在内的很多人一直在推进这项工作。在构建一个新的语言时，你必须一直问自己，‘为什么不直接优化现有的语言’，这是幕后构思过程的一部分。而这个问题的答案是，“很显然，我们应该把现有的优化好”。这也是为什么诸如 ARC 的功能会出现。
>
> 但是，在 Swift 中，最需要解决的问题是内存安全。在 Objective-C 中，除非去除 C 相关的东西，不然是不可能达到绝对的内存安全。但去除了 C 的 Objective-C 会失去太多的东西， 而它也不再是 Objective-C 了。
>
> **Garric Nahapetian:** 没错。因此，把一些 Swift 的特性添加到 Objective-C 中就像是 [特洛伊木马](https://zh.wikipedia.org/zh/特洛伊木馬) 一样，可以让大家更容易地信任 Swift ，因为你已经完成了 Objective-C 方面的工作，是这样吗？
> 
> **Chris Lattner:** （这里面）其实有许多有趣的内部动力。我觉得我们非常专注地优化 Objective-C 及其相关的平台。对于开发 Swift 而言，这是一种降低风险的办法。如果说，“我们要把所有东西都一次性推到重做”，而且不经过任何测试的话，肯定会有巨大的风险。但如果你只把“少部分”的东西单独推倒重做，比如一个全新的内存管理系统，然后对它进行迭代、调试并结合社区的力量进行开发的话，就只会产生有限的风险。不过有一点我要说的是，不管是外部的社区还是苹果内部的社区，貌似都在对我们说，“为什么你要优先考虑这个？我们就好像是概率论中的 [随机漫步](https://zh.wikipedia.org/wiki/隨機漫步) 一样。为什么你要做这个而不是其他的？”因此，这也成为了一个有趣的动力。

------

## 初始团队的成长

*（开始于 22:49）*

> **Chris Lattner:** 苹果拥有着一支非常强大的工程师队伍。那时有非常多的人一起维护 Objective-C，这其实是有点固执的一件事，但同时这也让我们在动态库、应用和其他类似的东西上拥有了十足的深度和背景。正因如此，那时有许多关于优化 Objective-C 的想法涌现。自从乔布斯离开并创立 [NeXT](https://en.wikipedia.org/wiki/NeXT) 之后，许多杰出的人物都一直参与这项工作并写下了大量相关的白皮书。因此，Objective-C 背后有一个极其庞大的社区在推动着。
>
> 当时，我和 Bertrand 以及 Dave 讨论过一些想法，我也开始着手编写一个编译器的原型。不过结果很显然，我很难靠自己去构建出所有的东西。所以最后的事情也理所当然地发生了——大约在 2011 年四月的时候我们与管理层讨论了关于 Swift 的事情，然后也获得批准去调动一小部分人员。[Ted Kremenek](https://twitter.com/tkremenek)、[Doug Gregor](https://twitter.com/dgregor79)、[John McCall](https://twitter.com/pathofshrines) 以及一些其他的杰出工程师都是在那时调入 Swift 项目的。现在回头看看，其实挺有意思的，因为当时是第一次有一些语言和设计专家对 Swift 做了批判性的评价。他们反馈了很多严厉的批判。虽然他们的本意并不是打击我们，但他们的确说的很对——这个语言当时实在是糟透了。
>
> 能让这一切顺利进行有一个关键原因，就是我们有机会拉拢一位泛型领域的世界级专家，以及一支构建过 Clang 编译器的团队。同时这支团队也参与过许多不同的有意思的项目，并能够尽可能地发挥他们的工程天赋。虽然他们只是帮助推进和开发构建的一部分人员，但却至关重要。
>
> **John Sundell:** 在那时 Swift 语言的状况是怎样的？比如，语言的语法是什么样子？编译器的哪部分基础设施已经搭建完成了？它是不是已经接近于原型的阶段甚至更进一步呢？
>
> **Chris Lattner:** 那时 Swift 已经非常接近原型阶段了。这些资料都是完全公开的，因为在 GitHub 上，[变更历史是完全公开](https://github.com/apple/swift/commits/master) 的。[变更日志](https://github.com/apple/swift/blob/master/CHANGELOG.md) 虽然不能完全追溯所有的历史变更，但已经足够了。
>
> 在 Doug 加入之前，Swift 并没有泛型系统。当时我们很想做一个泛型系统，但我不是很有自信能独自设计出来，Doug 却做到了。我记得在很早的时候，John 曾经接手过一个项目，让一个类似语法分析器的东西变得可以真正生成代码。Doug 所做的事情大概就是这样。
>
> 有很多零碎的事情我不太记得了，但有些东西我却一直记忆犹新。我记得 `var` 和 `func` 就是从最初就制定好的。早期的 Swift 中很多基本语法都和现在的 Swift 语法非常接近。
>
> > 当你构建一样新东西的时候，通常想法是领先于文档的，而文档又先于代码。我们当时情况也非常类似。到现在，想法已经领先于代码非常之多了，这都是无可避免的。
>
> 当时的 Swift 已经十分接近于一个原型了。但仍有许许多多的想法未实现。当你构建一样新东西的时候，通常想法是先于文档的，而文档又是先于代码。我们当时情况也非常类似。到现在，想法已经领先于代码非常之多了，这都是无可避免的。

------

## 关于 Craig Federighi

*（开始于 26:10）*

> **Chris Lattner:** 对于社区非常重要的另一位伙伴名叫 [Craig Federighi](https://en.wikipedia.org/wiki/Craig_Federighi)。Craig 在苹果社区中非常出名。在 2011 年早些时候，他加入了这个项目。那时正好 Bertrand 从苹果退休，Craig 便接手了他的工作。
>
> 说到 Craig，他是一个非常、非常有趣的人。无论在台上还是台下，他都着非凡的个人魅力。大多数人们都不了解他到底有多么的聪明。他还在许多方面都有着极其深入的研究。我完全没想到，他在语言方面懂得很多。他曾为 [Groovy](http://groovy-lang.org/) 和许多其他类型的语言作为正式参与者工作过，有些语言我甚至还没接触过。而且，他并不像是一位只会谈论策略的高层人员。他同样关心许多细节的事情，例如闭包语法、关键字和其他东西。
>
> Craig 真的是一位非常严格的任务推动者，同时他也推动着 Swift 的实现以及 Swift 与 Objective-C 的联动。不仅如此，他还关心着 Objective-C 本身的维护；关心着 API；关心着 Objective-C 的 API [导入到 Swift](https://github.com/apple/swift-evolution/blob/master/proposals/0005-objective-c-name-translation.md) 后的形态，还有相关的一切。Craig 在积极给予反馈的同时，一直保持着在团队和项目上出乎意料的卓越态度。他的帮助对 Swift 的现状影响很大。
>
> **Garric Nahapetian:** 这真的很酷，因为他刚好是在 WWDC 2014 的讲台上第一位发表演讲的人。
>
> **Chris Lattner:** 没错。
>
> **John Sundell:** 然后他就介绍你出场了，对吧？我还记得那句经典的标语：“没有 C 的 Objective-C”。
>
> > 我对那句“没有 C 的 Objective-C”标语有着复杂的感觉，因为其实我想表达的并不是这样。
>
> **Chris Lattner:** 说实话，我对那句标语有着复杂的感觉，因为其实我想表达的并不是这样。
>
> **John Sundell:** 那是句很棒的标语。
>
> **Chris Lattner:** 在那个时候，以这种方式向社区宣传是很正确的选择。
>
> （……）
>
> > 在项目的一开始，我的目标其实是构建一个全栈系统。
>
> **Chris Lattner:** 至于说为什么我当时很矛盾，因为在项目的一开始，我的目标其实是构建一个全栈系统——分析市面上现有的系统，取其精华，弃其糟粕。而且当时的目标是构建一个可以编写固件、编写脚本、编写移动应用和服务端应用甚至是更底层系统代码的语言，同时在语言层面上并非只是通过随意堆砌来实现，我要让它在上面说的所有方面都能表现出色。
> 
> 所以在当时而言，这个方向绝对是正确的。虽然目前 Swift 还没能达到预期，但欣慰的是它的发展将会使它能够在未来拥有这些的能力。

------

## 文档的重要性

*（开始于 30:32）*

> **Chris Lattner:** （在这里）我还要最后提到一支团队。你目前所看到的 Swift，它是一个[编译器](https://en.wikipedia.org/wiki/Compiler)，是一门语言，是[一系列 API 的集合](https://developer.apple.com/documentation/swift/swift_standard_library)，也是一个 IDE。但让这些事情能够成真，并让 Swift 走向大众，离不开开发者发布团队的工作。他们是 Apple 的科技编辑，负责编写如 [Swift 编程语言书籍](https://developer.apple.com/documentation/swift/swift_standard_library) 之类的东西。Swift 的成功和快速适应市场离不开当时第一时间发布的高质量文档和书籍。直到今天，他们仍在维护这些文档，真的非常不可思议。
>
> > 我们直接把这些科技编辑拉入了设计讨论会
>
> 我记得当时我们直接把这些科技编辑拉入了设计讨论会。像 [Tim Isted](https://twitter.com/timisted)、Brian Lanier 和 Alex Martini 这些人，他们在周会上花了大量的时间争论着一些细节问题——“我们是否应该使用点语法？”“我们应该使用这个关键字还是那个关键字？”或者是“我们是应该把 `func` 改为 `def` 吗？”同时还讨论着——类型系统的深度以及 [代码生成](https://en.wikipedia.org/wiki/Code_generation_(compiler)) 算法应如何工作；我们如何达到较好的性能？[字符串](https://developer.apple.com/documentation/swift/string) 应如何运作？还有各种各样的问题。
> 
> > 如果你能在设计阶段就考虑到如何像大家解释这门语言的话，工作会进行得更顺利。
>
> 我见过很多次这种事情，当你构建完一个系统后你还要尝试着解释它。然后当你开始解释这个系统时，真的会陷入一个尴尬的处境，比如：“天啊，我竟然还要去解释这个东西是如何工作的”。如果你可以在设计阶段就处理好反馈信息，并引入文档，引入这些关于如何向大家解释的工作，你会进行得更顺利。

------

## Swift 的开发工作是一个团队效应

*（开始于 34:58）*

> **Chris Lattner:** 我想说的是，很多人会说“Chris 发明了 Swift”。虽然我的确在很多年的时间里一直用不同的方法推动着 Swift 的开发，也算是带领着整个项目，但事实上其实他们都忽略了一点，有数以百计的人为 Swift 的许多关键问题作出了贡献。例如构建调试器、构建 [IDE](https://developer.apple.com/xcode/)、构建 [Playgrounds](https://help.apple.com/xcode/mac/current/#/dev188e45167)、构建教育相关的内容、构建各种东西以及相关的社区。
>
> 我在许多地方都不如他们优秀。他们几乎组成了一个不仅是在 Apple 内部，同时活跃于 Apple 之外的社区，并一起推动着 Swift 相关功能的构建，并以他们自己的方式做着贡献。这就是为什么 Swift 能发展的如今的规模，我认为这也是 Swift 能一直成长下去的原因。
>
> **Garric Nahapetian:** 这也是我们录制这集播客的原因之一——让这些在幕后做过贡献的人可以站在聚光灯下。

------

## 不要像编译器开发者一样写 Swift

*（开始于 42:15）*

> **Chris Lattner:** 有件事我觉得很神奇，你们两个写的 Swift 代码比我写的还多。我可能对 Swift 的内部实现、它为什么会是这样的、它是如何做到某些事的，以及它是如何运作的比较了解，但你们却拥有着真正以 Swift 来构建产品的经验
>
> **John Sundell:** 是的，这很有趣。有许多许多人在为 Swift 项目工作，为它的编译器工作，而且他们大部分时间都在写 C++。我想顺便问一下，这种感觉是怎样的？你设计了这门非常酷的语言，大家也逐渐开始使用它了，但你却还在使用 C++。
>
> **Chris Lattner:** （大笑） 这让我痛不欲生。这真的太可怕了。就像老天开的玩笑一样，强制我一直在写 C++。

------

## 关于社区反馈

*（开始于 43:11）*

> **Chris Lattner:** 为什么 Swift 现在能发展得这么好，拥有一个庞大的的社区，而且大家都习惯于在上面写博客，这肯定是都主要原因之一对吧？社区的反馈的确影响了 Swift 1 和 2 。那些抱怨就像是提醒我们的信号一样，“这根本不合理”，“我在这上面遇到了问题，还有那个和另外的都遇到了问题”。这些的确帮了我们很多，特别是在优化、排期和推动最终的 Swift 版本方面。
>
> > 早期的社区反馈的确影响了 Swift 1 和 2。
>
> 比较意外，也可以说是我们有意为之的是，在 Swift 1 中没有加入错误处理机制。同时我们也没有加入协议扩展，这些能力我们绝对是希望 Swift 能够拥有的，但只是错过了发布日程。因此我们很清楚必须要去构建这些功能，但在第一两年间这些东西却是直接由社区最终推动完成的。然后[当 Swift 开源](https://developer.apple.com/swift/blog/?id=34)，[Swift Evolution](https://github.com/apple/swift-evolution) 变成了一个伟大的项目。这个项目可能在人们的时间效率优化方面表现并不理想，但它却是让 Swift 非比寻常的重要因素。我想这项荣誉属于所有在社区中花时间为 Swift 的功能优化和工作推进提供帮助的人。
> 
> **John Sundell:** 我所想到的就是，不仅是那些文章和内容，同时包括开源在内的所有东西，都是如何大量反哺了 Swift 自身。例如，类似 [`Codable`](https://developer.apple.com/documentation/swift/swift_standard_library/encoding_decoding_and_serialization) 功能，在它未完成之前人们会开发数以千计的 JSON 映射库。我也是其中之一。我曾经构建了 [Unbox](https://github.com/JohnSundell/Unbox) ，因为在 Objective-C 中你不需要在这方面花费许多时间和精力。你只需要说，这是个字典，那我们就访问它的某个 Key 然后假设返回结果永远是字符串。但一旦你坐下来把同样的代码以 Swift 实现的话，你就会发现需要用到大量的 `if let`。因此我能想象到这些大家都尝试解决的东西，绝对会以不同的方式反哺 Swift 自身的设计进程。
>
> **Chris Lattner:** 是的，这无可厚非。而且 `Codable` 的设计来自于 Apple 的一支非 Swift 核心开发团队的动态库团队。他们对这个工作真的很有耐心，他们实现并推动着它，并且一直支持着它上线。
>
> > 很难想象到底社区影响了 Swift 多少。
>
> 社区呈现了各种各样的东西对吧？比如 [`Result`](https://developer.apple.com/documentation/swift/result)。为什么 [`Result` 要加入到 Swift 5 中](https://github.com/apple/swift-evolution/blob/master/proposals/0235-add-result.md)？因为我们一次又一次地构造了它。即使 [核心团队](https://swift.org/community/#core-team) 不希望有一个 `Result` 类型，因为这仿佛是语言的失败体现；即使我们一致认为 `Result` 类型不是必要的。但社区中却一直有清晰且强烈的声音，“你们看，我们需要它。不管在长期看来它是否理想，但我们现在的确需要。”因此社区真的影响了很多东西。而且你可能难以想象到底社区影响了 Swift 多少。

------

## 关于初始预期

*（开始于 46:07）*

> **John Sundell:** 对于 Swift 的现状，以及你发布 Swift 后它的改变，这些是否都符合你的预期呢？经过了这些年，对于你在最初阶段的想法，Swift 现在有多少是符合的？
>
> > 当 Swift 1 发布时，我们也有一些疑问，我们是否可以在 Objective-C 的社区中获得一席之地？我们是否能在 iOS 的生态系统中获得一席之地，或者是将会分成几派？
>
> **Chris Lattner:** 这么说吧，我觉得预期也会随时间改变。如果回到 2010-2011 年，我并没有预想着它会有多成功。我承认当时我只是觉得这是个有趣的业余项目。这原本就是个填补夜晚和周末时间的东西。你知道，在整日的工作后再去做一个业余项目是很有趣也很具挑战性的。当它越来越接近完成，并直到 Swift 1 发布时，我们都一些疑问——我们是否可以在 Objective-C 的社区中获得一席之地？我们是否能在 iOS 的生态系统中获得一席之地，或者是将会分成几派？我们当时的确有这样的疑虑。现在我可以说我会感到很欣慰，因为我觉得社区中绝大多数人都对 Swift 持乐观态度。
> 
> **Chris Lattner:** 不过现在依然有新的领域等待探索。Swift 在服务端的表现一直越来越好，但仍有大量的工作需要完成。在外部，也有许多不同的社区活跃着。我对数字和 [机器学习的社区](https://github.com/tensorflow/swift) 特别感兴趣，这些对全世界都有重要的意义。在这些社区中，有着许多有趣的人，我觉得 Swift 在这里可以发展得很好。
>
> > Swift 的全球制霸只是一个开玩笑的目标，但它来源于使用和热爱 Swift 的人们的信念。
>
> 我有时会开玩笑地说，我们的目标是 [Swift 全球制霸](https://oleb.net/blog/2017/06/chris-lattner-wwdc-swift-panel/#in-which-fields-would-you-like-to-see-swift-in-the-future)。这只是一个玩笑目标，但它来源于使用和热爱 Swift 的人们的信念。如果真是这样的话，我会非常愿意把这份愉悦带给人们，并帮助改善整个世界。现实中仍有许多让人头痛的系统对吧？仍有许多人还在写着 C 语言代码。就那些 [bug 和安全脆弱性](https://oleb.net/blog/2017/06/chris-lattner-wwdc-swift-panel/#in-which-fields-would-you-like-to-see-swift-in-the-future) 来说，真是让人感觉十分不幸。同时，我们还要面对生态系统的问题，以及许多其他的挑战要征服，这都是我们作为一个社区可以完成的。在这方面，我认为有着无限的可能。

------

## 在 Apple 社区以外推广 Swift

*（开始于 50:18）*

> **Chris Lattner:** 尽管人们现在都是以积极、乐观的态度来讨论 Swift，可 Swift 仍有许多问题。我觉得我们必须保持开放的态度来讨论这个，并把它看作一个解决问题的练习。主要的问题集中在 Linux 生态系统上面，与之相比，[Windows 生态系统](https://dev.azure.com/compnerd/windows-swift) 的问题简直不值一提。为了让 Swift 的受众更广泛，我们真的还有许多工作要做。
>
> > Swift 仍有许多问题。主要的问题集中在  Linux 生态系统上面。Swift 在 [Windows 生态系统](https://dev.azure.com/compnerd/windows-swift) 的问题简直不值一提。
>
> **Chris Lattner:** 我们的目标是打造一个不排外的社区。可事与愿违的是，如果你不是一名 Apple 开发者，你可能会在搜索 Swift 相关的东西时感到融入不了社区，因为搜索结果都是一些 iOS 相关的讨论。
> 
> > 如果你不是一名 Apple 开发者，你可能会在搜索 Swift 相关的东西时感到融入不了社区，因为搜索结果都是一些 iOS 相关的讨论。
>
> **John Sundell:** 完全正确。比如“这是如何在 `UIViewController` 中完成它的方法。”
>
> **Chris Lattner:** 没错。这会让你觉得自己是个外来者，但这并不是我们的初衷。我认为这不是有意为之的，但它却是真实存在的。这正是我们社区所面对的一大挑战。我目前还不知道有没有比较完美解决方案，不过我想我们总会找到的。

------

## 关于 Swift 的演进

*（开始于 55:12）*

> **Chris Lattner:** （关于 Swift 的演进）这是个非常复杂的事情，我大概要好几个小时才能全部讲完。如果简短地说一下我的想法——开放要好于封闭。如果你能让更多人参与，那么你肯定能得到一个更好的结果。我想 [Swift Evolution]((https://github.com/apple/swift-evolution)) 的项目进展有很多问题，Garric 也列举了一些。但这不妨碍它是一个很好的东西。同时有一点我认为是有益的，就是它很好地减缓了语言的演进。因为小心谨慎地发展一个语言总比过快地发展好。
>
> 我觉得强制地推动一系列文档进展也是一件很好的事情，因为文档是十分重要的。Swift Evolution 项目引领了苹果与社区在某种规范下，以不同的方式进行合作，这不仅有趣，也是非常棒的一件事。
>
> 我不认为 Swift Evolution 项目是一成不变的。在这几年的时间里，它在不同方面都发生了改变。同时，我们一直在艰难地权衡着它的目的——到底是为社区输出设计规范还是帮助社区确定优先级？对我们来说，这是个具有挑战性的问题，因为当你把它完全交给社区去执行时，你可能会失去一些细节的东西。但在一些大方向上，整个 Swift 的世界都是认同的——比如 [并发性](https://forums.swift.org/t/concurrency-async-await-actors/6499)。
>
> 这是我们的一次非常大的尝试，而且通过一个自底向上的社区流程来实现它不是一件容易的事。因此很多事对我来说都是未知的。我觉得 Swift Evolution 是一个很棒的项目。我也很开心我们现在拥有这个项目。尽管我同意它不是我们所唯一拥有的，也不应该是唯一的，但我仍觉得它绝对是业界标杆之一。
>
> （……）
>
> > 我一直在寻找 Swift 包管理生态系统的催化剂，到底应该以服务端 Swift 的社区为起点，还是以机器学习社区为起点。
>
> 从某种意义上来说，Swift 的每一个变动，都需要一段时间来消化。当一个大的新能力出现时，社区都需要一段时间来弄明白它、应用它、找出它的使用场景和它如何与其他功能兼容。因此，花费的这些时间都是值得的。我从 Swift Evolution 所认识到的最重要的事，就是社区的合理推动所带来的力量。Swift Evolution 真的为我们聚集了许多来自社区的语言极客，让他们同时关注 Swift 项目一个特定方面。我一直在寻找 Swift 包管理生态系统发展的催化剂，到底应该以服务端 Swift 的社区为起点，还是把机器学习社区聚集起来干点大事。
>
> 我们如何去寻找这种催化剂——让大家在合适的地方聚在一起，通过他们自己的力量构建一个项目，发挥他们的能力和天赋，让大家协作工作？
> 

[^1]:  [Jordan Rose 分享了一则与 Shiny 这个名字相关的佚事](https://twitter.com/uint_min/status/1098628355539124224) ：.swiftmodule 文件中的“魔法数字”是 E2 9C A8 0E。它的前三个字节是 ✨ 的 UTF-8 字符（U+2728 SPARKLES）。

[^2]:  [Greg Parker 声称](https://twitter.com/gparker/status/1099251522422992896) ARC 只是间接地从 Swift 的开发过程中产生：ARC 的实现早于 Swift 的实现。但在幕后的工作中，Swift 早期的设想的确推进了管理层提供必要的资源去构建和部署 ObjC 的 ARC。
