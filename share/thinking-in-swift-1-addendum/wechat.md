Swift 编程思想，第一部分（补遗）：牺牲小马"

> 作者：Olivier Halligon，[原文链接](http://alisoftware.github.io/swift/2015/09/14/thinking-in-swift-1-addendum/)，原文日期：2015-12-14
> 译者：[Channe](undefined)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[小锅](http://www.swiftyper.com)
  








我的系列文章[《Swift 编程思想》第一部分](http://swift.gg/2015/09/29/thinking-in-swift-1/)发表后，在 Twitter 上收到一些不错的反馈。现在，我在这些评论的基础上谈一谈什么时候可以使用`!`来牺牲小马（译者注：本篇文章中的`!`表示隐式解析可选类型）。



> 校对注：本系列的其他文章可以在[这里](http://swift.gg/tags/Crunchy-Development/)看到。

## 绝不杀死小马？

在我的上篇文章里，我强烈建议不要使用`!`。有时候读起来好像是“永远不要使用它”。事实上我的意思是『每次添加`!`不能仅仅是为了取悦编译器（校对注：因为可选类型使用起来非常麻烦，编译器经常会报错和警告，所以有些人会为了让编译器闭嘴，强制取值），这样是在杀死小马 🐴』。可是呢，如果你明确的知道你的代码在做什么，那小马🐴依旧能活下来。不要仅仅为了取悦编译器就不加思索的这样做。

所以，在某些情况下，使用隐式解析可选类型仍然是有用的。但是，仅限于你认为合理的地方和你知道自己为什么这样做的时候。

## 什么时候牺牲小马？
这里有几个在 Swift 中可以使用`!`的例子。除此之外可能还有其他情况，但是下面这些是我觉得最常见的。

### 1. IBOutlets + 依赖注入

`IBOutlets` -- 和你做的那些依赖注入的属性一样 -- 是一个特殊的例子，因为它们在 init 方法结束前一直是 `nil` （因为它们不能马上被初始化），但是它们在实例初始化后将迅速获得一个值（不管是通过依赖注入还是加载 XIB ）。

所以即便它们不得声明为可选的类型（因为它们在 init 过程中不会被初始化，仅仅是在那一小会之后才会），在设计上，能十分确定，它们在代码的其他部分绝不会是 `nil` 。这是一个隐式解析很方便的例子，因为**在使用它们的时候它们绝不会是 `nil`** 。

### 2. UIImage，UIStoryboard，UITableViewCell

下面的方法都是使用名称和标识符这些常量来初始化的：

    
    UIImage(named:...)
    UIStoryboard(name:,bundle:)
    UIStoryboard.instantiateViewControllerWithIdentifier(_:)
    UITableView.dequeueReusableCellWithIdentifier(_:, forIndexPath:)
    // 还有一些其他类似的情况···

这里面的每个例子中，名称、标识符拼写错误都会导致代码崩溃，因为这是一个开发错误（bundle 中缺失图片，或者 target 中没有包含 storyboard 等情况导致的），你也许希望在开发阶段能尽早的发现并修复这些这些错误。

注意这些例子，有些情况你可能更愿意使用 `guard let else fatalError()` 模式，这能在开发时触发错误后提供更精确的异常消息：

    
    guard let cell = tableView.dequeueReusableCellWithIdentifier("foo", forIndexPath:indexPath) as? MyCustomCell else {
      fatalError("cell with identifier 'foo' and class 'MyCustomCell' not found. "
        + "Check that your XIB/Storyboard is configured properly.")
    }

这种小技巧非常有用，比如我在文章《[enums as constants](http://alisoftware.github.io/swift/enum/constants/2015/07/19/enums-as-constants/)》中讨论过的，使用[SwiftGen](https://github.com/AliSoftware/SwiftGen)来避免潜在的标识符拼写错误和崩溃😉。

例如，[`SwiftGen`的实现里实际上使用了`UIImage(named: asset.rawValue)!`](https://github.com/AliSoftware/SwiftGen#generated-code)，因为这里的枚举是通过 SwiftGen 工具生成的，因而它能保证图片的名字在 Assets Catalog 中一定存在 -- 所以在设计上不可能是 `nil` 。

## 我是否应该牺牲小马？

本系列文章的第一部分是面向那些 Swift 新手，因为他们倾向于所有情况下任何时候都强制解包，仅仅是因为 Xcode 告诉他们这样做，或者是因为他们真的不知道为什么可选类型更适合他们。因此我没有介绍更多高级的例子，只是介绍了最常见的例子。

所以，有的例子确实可以使用`!`。但是，我在第一部分中的建议依旧保留：仅仅在真的明白为什么使用`!`的情况下使用`!`，不能只是为了取悦编译器而这样做。特别地，如果你是一个 Swift 新手，同时你想添加一个`!`仅仅因为『这些可选类型的报错真是烦透了，我真希望编译器能够停止抱怨』，你就做错了，这是在开始杀死小马。

在本系列文章接下来的部分再见，那里探讨 `map`，`flatMap`，`??`，可选链以及避免数据不一致。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。