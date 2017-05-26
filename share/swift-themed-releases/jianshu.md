给每一个 Swift 版本设定开发主题"

> 作者：Ole Begemann，[原文链接](https://oleb.net/blog/2017/03/swift-themed-releases/)，原文日期：2017-03-20
> 译者：[四娘](https://kemchenj.github.io)；校对：[Cwift](http://weibo.com/277195544)；定稿：[CMB](https://github.com/chenmingbiao)
  









大概一个星期之前，[Swift 核心团队](https://swift.org/community/#core-team)成员 Ben Cohen 在 [Swift-Evolution](https://swift.org/community/#swift-evolution) 发了[一条的很值得思考的信息](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20170306/033699.html)，回答了一个[问题](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20170220/033092.html) — 再给 [Swift 4](https://github.com/apple/swift/blob/master/CHANGELOG.md#swift-40) 提一个新提案, 被通过的几率有多大。

Ben 阐述了核心团队决定提案是否要推迟的主要依据。主旨就是 Swift 每一个版本都应该专注于一小部分主题，符合主题的提案给予更高的优先级。



我认为 [这篇文章](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20170306/033699.html) 并没有引起足够的重视，这也是为什么我把它完全引用过来的原因(链接和注解是我自己加的)：

> [Swift 4 的主题](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20160725/025676.html)设定好之后，一些不符合主题的提案还是进入了我们的讨论，这显得一点意义也没有。例如一些关于 [String](https://developer.apple.com/reference/swift/string) ， [Dictionary](https://developer.apple.com/reference/swift/dictionary) 和 [Sequence](https://developer.apple.com/reference/swift/sequence) / [Collection](https://developer.apple.com/reference/swift/collection) 的提案被采纳。在 Swift 接下来的版本里，很可能这些与目标不符合的提案，例如 String 进一步的完善(原生的正则表达式)，move-only 类型，异步，反射，或者是泛型的加强，都会进入讨论。**我们觉得专注于特定的主题对于一门语言的演变特别重要，这些散乱的，与当前开发主题无关的提案，应该要设置更高的采纳门槛。**
>   

> 其中一个原因是核心团队和社区的精力有限。专注一部分目标进行讨论，可以让别的社区更容易参与到我们的讨论里(尽管[加入提案模板](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20170206/031657.html)也会有帮助)。而且如果保证每一个提案都能够为这个阶段的目标服务，我们就可以避免一些提案虽然被采纳，但从未有机会实现的情况出现。  
>   

> 此外，专注于某个目标进行讨论时，针对这个目标，我们可以有完成度更高，更加具有一致性的功能设计。可以探讨如何在 Swift 4 里把[所有新的泛型功能](https://github.com/apple/swift/blob/master/CHANGELOG.md#swift-40)合理地组合到一起，构建一个完善，高度一致的体系，让我们更容易使用和理解。或者是新的字符串功能如何[更加便捷地处理字符串](https://github.com/apple/swift/blob/master/docs/StringManifesto.md)。**一方面是向大家传递 Swift 4 想要完成的目标，一方面更利于我们去完成一个条理清晰，连贯的设计。**
>   

> 一个条理清晰的设计不止对于版本的迭代很重要 — 因为这可以让开发者更容易学习使用新功能，**而且对于语言的长期发展也是一样重要。**没有明确目标的提案，会让我们非常难理解单个提案怎么融入到 Swift 整体的发展方向里。我们想要避免进行了一些局部的改进过后，后续再次触及相关的部分时，却发现当时的改进并不符合整体设计。同时还有一种情况是，我们考虑了太多分开看起来很合理的功能，但将它们拼凑到一起时却并不合适。  

> 例如，最近的一些提案围绕着[重构 meta types](https://github.com/DevAndArtist/swift-evolution/blob/refactor_existential_metatypes/proposals/0126-refactor-metatypes.md) ，但这必须在反射这个大框架下讨论才可以，所以我们应该等到这个主题被提上议程再去讨论。另外一个例子: 最近的提案 [SE-154](https://github.com/apple/swift-evolution/blob/master/proposals/0154-dictionary-key-and-value-collections.md) 提议可以自定义存储字典键值对的集合，这种做法并没有降低耦合度，它只是提供了一种略微笨重的方式去解决问题 — 给字典提供一个初始值，然后去更新这个值。但它需要作为[ABI 稳定](https://github.com/apple/swift/blob/master/docs/ABIStabilityManifesto.md)的一部分去思考。这也是我们决定在 [第二阶段](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20170213/032116.html) [展开关于字典的讨论](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20170213/032118.html)的原因。  
>   

> 对于 [Swift 3](https://github.com/apple/swift-evolution/blob/master/releases/swift-3_0.md) 和 [Swift 4](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20160725/025676.html) ，核心团队给每一个版本都设定了主题。**核心团队想要在这个过程中，让社区更早加入到讨论中，帮助核心团队决定接下来的目标，但也会同时思考更好的方式。**

Swift 4.0 的开发周期已经过半，但还不能太早决定接下来 Swift 5 的目标。 [ABI 稳定](https://github.com/apple/swift/blob/master/docs/ABIStabilityManifesto.md) 肯定优先，但除此之外呢？字符串再进一步的改进？异步？反射?


> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。