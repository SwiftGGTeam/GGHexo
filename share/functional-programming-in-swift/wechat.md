Swift 中的函数式编程"

> 作者：Natasha The Robot，[原文链接](http://natashatherobot.com/functional-programming-in-swift/)，原文日期：2015/11/13
> 译者：[小袋子](http://daizi.me)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[numbbbbb](http://numbbbbb.com/)
  








Swift 一个强有力的语言特性就是能够用多样的函数式风格去编写代码。这在社区看来非常激动人心。

我在去年年底花费了一些时间学习函数式编程，所以我可以写更好的 Swift 代码。因此，我非常推荐你们也花时间去学习一下！

另外，我非常推荐推荐你们去看 [Functional Swift conference](http://2014.funswiftconf.com/)上的每一个视频。

所以在花了这么多时间后，我想要总结一下个人有关于函数式编程在 Swift 应用的一些思考。



跟着概念走
-----

函数式编程是令人生畏的，这要归咎于单子（monads）和 函数子（functors）！然而，一旦你领悟了它的核心概念，那么函数式编程的思想会超级简单：

> “函数式编程是一个编程范例…它把计算作为数学函数的评估，并避免改变状态和可变数据。”— [维基百科](https://en.wikipedia.org/wiki/Functional_programming)


所以核心就是你应该用数学的方式去编写代码。你的函数应该有清晰的输入和输出，并且不会像可变对象一样有全局副作用。这就是了！

避免可变状态
------

这和上述的注意点类似。函数式编程要编写的是没有副作用的数学代码。

在 Swift 中使用结构体和协议帮助你避免可变状态。

我极度推荐观看 [@andy_matuschak](https://twitter.com/andy_matuschak)的  [Controlling Complexity in Swift](https://realm.io/news/andy-matuschak-controlling-complexity/)，这可以让你理解如何去实现以及最终的代码会如何地强大。

可读性第一
-----

我发现很多高级的函数式代码，通常由于五个以上的习惯性编程而变得特别难以阅读。如果你遵从函数式编程的概念，有很多方法让你的代码变得更清楚。

但是在今天结束之前，还要多说一句，如果你在一个团队中工作，最重要的事就是让代码可读性更强。如果一个内部或者一个新的开发者加入你们的团队，他们会不会完全迷失了？如果你专注于编写易读的代码（取代好玩和花哨的写法），他们可能会很快就有产出。

记住一点，可读性的优先级永远比花哨的代码高（除非你的目标就是用一个好玩的副作用去实现好玩和花哨的程序）。


不要和 framework 作对
----------------

当然，在 iOS 编程中，由于 Cocoa framework 的建立和用户的输入输出，没有副作用显然是不可能的（在纯粹的数学世界，确实存在完全没有外部副作用，但那不是我们生活的世界！）。

例如，如果你创建了一个通用的转换器（formatter）（例如货币转换器），并用在代码中的一些地方，用单例是一个很好的方法。你还必须为UI Layer 使用 `UIViewControllers` 以及 `UIViews`。总有办法去脱离你的逻辑，进而让很好的不可变组件去帮助你可变化这些东西，但是不要过火地把 freamwork 改变为面目全非（可读，不可读）的状态。


深入学习函数式编程
----------

再次强调，你不应该执着于在你的 Swift 代码中使用花哨的技巧（除非你只是为了试验、或者好玩）。我非常推荐深入学习函数式编程的思想，从而理解那些高级概念，并且更好地应用在你的代码中。

推荐阅读 [Functional Programming in Swift](https://www.objc.io/books/fpinswift/) ！这里有[更多的资源](http://natashatherobot.com/reading-functional-programming/)去帮助你开始学习！

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。