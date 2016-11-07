构建一个 iOS 和 watchOS 均可用的跨平台框架"

> 作者：Natasha The Robot，[原文链接](https://www.natashatherobot.com/creating-a-framework-for-both-ios-and-watchos/)，原文日期：2016-09-26
> 译者：[Joy](undefined)；校对：[bestswifter](http://bestswifter.com)；定稿：[CMB](https://github.com/chenmingbiao)
  









这个 [try! Swift app](https://github.com/tryswift/trySwiftNYC) 可以在 iOS 和 watchOS 上运行，我打算拓展它，从而支持 extension，并且可能增加一些与 iMessage 相关的功能。也许我最重的目标是打造一个 tvOS 应用，可以在我的会议室操控电视显示器。



起初虽然我可以直接复制两个平台之间的模型层（Model）代码，但是当我需要快速的开发更多 extension 并适配其他平台时，我就需要把代码移到一个框架（Framework）中去了

我以前没有做过框架，但它其实非常容易。难点在于，我发现系统并没有提供一个选项让我们去创建一个跨平台的框架。我被迫只能在 iOS，macOS，tvOS 和 watchOS 之间进行选择。这就意味着，如果一个苹果框架可以在 iOS 上使用，那就没有办法在 watchOS 上使用，其余同理。

但对于我来说，我的模型层的代码超级简单，所以我想要在我的 iOS 和 WatchOS 平台中共享这些代码。经过一番搜索，我终于找到了一个简单有效的解决方案。

我仅仅创建了一个 Models 文件夹，存放所有需要共享的文件，并把它放在两个框架之外的文件夹中：

![](https://www.natashatherobot.com/wp-content/uploads/Screen-Shot-2016-09-26-at-11.07.29-AM.png)

然后把文件拖到正确的`framework targets `中（不用选择 Copy as needed）

![](http://p1.bqimg.com/4851/979b1015f6c04a2d.jpg)
 
这里的关键是，如果你想添加一些东西到模型层，并且这些东西只涉及到特定的框架，你必须创建一个新的文件来拓展这个模型。哦，当然，这些文件具有完全相同的引用关系，所以你对一个框架做出任何改变，也会改变其他的框架。

因此，这毫无疑问有点危险，并且不是一个伟大的解决方案，但不幸的是，我只发现了这一个解决方案。现在，我终于可以快速开发其他的 app extension 了。

如果有人有更好的解决方案，欢迎在评论区留言。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。