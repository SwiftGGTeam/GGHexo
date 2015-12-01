关于 Swift 的 5 个误区"

> 作者：Thomas Hanning，[原文链接](http://www.thomashanning.com/five-myths-about-swift/)，原文日期：2015-10-19
> 译者：[小铁匠Linus](http://weibo.com/linusling)；校对：[numbbbbb](https://github.com/numbbbbb)；定稿：[小锅](http://www.jianshu.com/users/3b40e55ec6d5/latest_articles)
  









Swift 虽然是一门比较新的技术语言，却已经有了很多关于 Swift 的误区。



## 误区 1 ：“Swift 是弱类型的语言”

很多人认为 Swift 是一种弱类型的语言。他们这么说的原因主要是可以隐式声明一个值，而不管类型是什么：

    
    var i = 5

这代码看上去好像`i`没有类型，其实并不是这样的。因为 5 是一个整型，所以编译器就会让`i`成为整型变量。之后，整型变量`i`不会再被改变，也就是说`i`永远是整型变量。

当然，我们也可以明确的指定变量的类型：

    
    var i: Int = 5

虽然这种方式不是必要的，但它可以提高代码的可读性。

## 误区 2 ：“Swift 和 Objective-C 协作性差”

很多人不想开始尝试使用 Swift，因为他们认为 Swift 不能兼容现存的 Objective-C 代码和类库。其实并不是这样的。在同一个工程中，同时使用 Swift 和 Objective-C 也是可行的。并且，在 Swift 代码中也可以使用 Objective-C 的第三方库。

可以在所谓的桥接文件中声明 Objective-C 的头文件，然后，所有头文件的内容都会被翻译成 Swfit 的语法，这样在调用 Objective-C 的 API 的时候就不会感觉到什么区别了。甚至 Objective-C 错误处理也被转换成 Swift 的`do-try-catch`语法了。

苹果的框架仍然是用 Objective-C 写的，如果Swift 和 Objective-C 协作性差的话事情就会变得很糟。

## 误区 3 ：“必须在新的项目中使用 Swift”

我觉得在新项目中使用 Swift 是个很好的想法，而且每个 iOS 开发者都应该学 Swift。

但是，你没必要一定要在新项目中开始使用 Swift。现在苹果官方还在支持 Objective-C，至少近几年不会改变。但是，我认为苹果未来对 Objective-C 的支持会越来越少。

可以去我发布的另一篇文章 [Should You Use Objective-C or Swift?](http://www.thomashanning.com/should-you-use-objective-c-or-swift/) 里看看关于本误区的其他详情。

## 误区 4 ：“只学 Swift 就够用了”

Swift 是门很棒的编程语言，它也可以用在生产环境，但是仅仅学 Swift 是不够的。原因大致如下：Swift 和 Objective-C 有很好的协作性，而且项目中也经常会有 Objective-C 的代码，同时，许多的示例代码和教程是用 Objective-C 写的。

因此，为了成为一个优秀的 iOS 开发者，最好能同时学会 Swift 和 Objective-C。

## 误区 5 ：“Swift 还不能用在生产环境”

很多人认为 Swift 还不能用在生产环境。其中一个原因就是，引进 Swift 到工程中时会有一些问题出现，尤其是 Xcode 会有一些 bug。如果知道一些变通方法的话，还是可以在生产环境使用 Swift 的。

Swift 1.2 和 Swift 2.0 的引进都有对语言的语法进行修改。因此，把现存的 Swift 代码迁移到新的语法上是必要的。当然，这也没什么可指责的，毕竟每个 iOS 版本都有代码在变更。而且，这也是 Swift 在尝试改善的重要标志，特别是在 Swift 发布不久的现阶段。

## 接下来做什么

如果你想学习更多有关 Swift 的知识，学习[苹果的Swift文档](https://itunes.apple.com/us/book/the-swift-programming-language/id881256329?mt=11)是一个非常好的开始。如果想了解其它的资源，可以关注一下我的博客[ “How To Stay Up-To-Date On iOS Development”](http://www.thomashanning.com/how-to-stay-up-to-date-on-ios-development/)。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。