Emoji 上的 Swift：换一种视角来理解 Swift 高阶函数"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2016/11/08/swift-by-emoji-a-considered-approach/)，原文日期：2016-11-08
> 译者：[星夜暮晨](http://www.jianshu.com/users/ef1058d2d851)；校对：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；定稿：[CMB](https://github.com/chenmingbiao)
  









不久之前，[Iain Delaney](https://twitter.com/IainDelaney) 给我发了这一幅图：

![](http://ericasadun.com/wp-content/uploads/2016/11/CwNiUkIUkAAYDTJ-300x226.jpg)

这幅由 [Steve Luscher](https://twitter.com/steveluscher) 设计的图，其内容来源于 Joey Devilla 的博客 Global Nerdy 中的[一篇文章](http://www.globalnerdy.com/2016/06/23/map-filter-and-reduce-explained-using-emoji/)。我觉得这种做法相当有才，让人眼前一亮。

然而，这幅图不是用 Swift 编写的，显然没办法在 Swift 中运行。我决定娱乐一番：我建立了一个 Playground，将大量的 Emoji 字符分配到对应的 Emoji 变量当中，由此构建了一个庞大的列表，然后使用 Swift 的语法让这些例子能够正确运行。



![](http://ericasadun.com/wp-content/uploads/2016/11/mapfilterreduce2-1.png)

我决定听从  Jaden Geller 在 Twitter 上的所提出的建议，我没有使用便便💩来表示 `reduce` 操作，因为这原先会让人理解为：在每个 `reduce` 操作执行的时候，都是将便便和一个新的食物合起来一同「吃下」。在 Swift 的版本当中，`reduce` 将从一个悲伤的表情😪开始，最后变得高兴和满足😋。

我尝试加了更多的食物种类，看看是否值得扩展一下图片上的内容，但是我发现一旦示例数量超过了原先的 4 种食物，就不够干净和优雅了：

![](http://ericasadun.com/wp-content/uploads/2016/11/mapfilterreduce1.png)

我决定不再使用奶牛🐮、土豆🍠、小鸡🐔和玉米🌽，我想看一看是否存在一个比 `isVegetarian` 更好的 `filter` 选项。比如说孩子们将会选择自己爱吃的食物（往往并不营养）：

![](http://ericasadun.com/wp-content/uploads/2016/11/filter.png)

然后我又想到，那么为什么不再多加一些 Swift 语言的特性呢？于是我决定描述一下可变和不可变项目操作的概念：

![](http://ericasadun.com/wp-content/uploads/2016/11/mutating.png)

以及重复操作：

![](http://ericasadun.com/wp-content/uploads/2016/11/repeating.png)

还有排序操作（虽然我觉得这里可能换用别的食物会更好一些）：

![](http://ericasadun.com/wp-content/uploads/2016/11/sorted.png)

当然了，`zip` 操作同样很赞：

![](http://ericasadun.com/wp-content/uploads/2016/11/zip.png)

然后还有 `map` 与 `flatMap` 的对比：

![](http://ericasadun.com/wp-content/uploads/2016/11/flatMap.png)

很遗憾的是，足球并不是一个合法的字符标识符，所以我无法在足球和橄榄球之间执行 `bitcast` 操作。这种不一致的 Emoji 字符集让我很不开心。Swift 需要对操作符和标识符进行基于标准的改造。

![](http://ericasadun.com/wp-content/uploads/2016/11/unsafeBitcast.png)

当我在鼓捣 `fatalError` 的时候，我发现我的时间都耗费在这里了：

![](http://ericasadun.com/wp-content/uploads/2016/11/fatalError.png)

不知道您是否有喜爱的 Swift 功能，想用 Emoji 将其表示出来吗？我已经向大家展示了我的想法。现在，是时候展示您的想法了。

*更新：Phil Aaronson 建议还可以[使用 emoji 函数](https://twitter.com/phildrone/status/796000782684299268)。*

> [@ericasadun](https://twitter.com/ericasadun) functions too! [pic.twitter.com/IDwDBps2WD](https://t.co/IDwDBps2WD)
>
> — Phil Aaronson (@phildrone) [November 8, 2016](https://twitter.com/phildrone/status/796000782684299268)

理想情况下，这些示例应当都可以在 Swift Playground 当中编译运行，我同样赞同使用其他 Emoji 来阐述这些功能，即使实现起来相当棘手。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。