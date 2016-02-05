playground 页面排序和共享"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2016/01/04/sorting-and-sharing-playground-pages/)，原文日期：2016/01/04
> 译者：[littledogboy](undefined)；校对：[千叶知风](http://weibo.com/xiaoxxiao)；定稿：[numbbbbb](https://github.com/numbbbbb)
  









## 排序 Playground 页面

如果在同一个文件中有多个 playground 页面（我就是这样），那么你会发现如果按照字母排序，查找起来会很方便。使用 Edit > Sort > ByName 来整理你的文件结构。


![](http://swift.gg/img/articles/sorting-and-sharing-playground-pages/Screen-Shot-2016-01-04-at-10.07.27-AM.png1454637017.2610323)

为了找起来更快，你最好给每一个页面起一个有意义的名字。

![](http://swift.gg/img/articles/sorting-and-sharing-playground-pages/Screen-Shot-2016-01-04-at-10.08.16-AM.png1454637018.4517174)

不幸的是，随着 playgrounds 中文件增多，Xcode 性能会受到很大影响（译者注：添加的新文件不会自动排列喵=w=）。虽然你可以通过拖动使文件重新有序，但是一旦打开很多 palygrounds 页面，拖动文件就变得很不现实。

## 拷贝 Playground 页面

拖拽一个页面就可以把它复制到新的工作区中，简单又高效。这张截图显示如何拖拽 “adding arrays” 页面到一个新的 playground 文件中。

![](http://swift.gg/img/articles/sorting-and-sharing-playground-pages/Screen-Shot-2016-01-04-at-10.18.15-AM.png1454637019.1361122)

只要你喜欢，也可以打开一个 playground 包（按着 Control 键点击/右击 > 显示包内容）并访问单个源文件。

![](http://swift.gg/img/articles/sorting-and-sharing-playground-pages/Screen-Shot-2016-01-04-at-10.22.04-AM.png1454637020.1251123)

不要在包之间拖放这些文件，除非你想要编辑这个 contents.xcplayground XML 文件。编辑 XML 文件并不困难，但它通常不值得你浪费时间。

相反，你可以考虑手动将文件添加到另一个 playground 中。在文本编辑器中打开该文件，把它复制/粘贴到一个新的页面。

## 查找 Playground

Xcode 提供了两个搜索域来帮助你搜索资源。底部的搜索条匹配的是文件名。

![](http://swift.gg/img/articles/sorting-and-sharing-playground-pages/Screen-Shot-2016-01-04-at-10.15.09-AM.png1454637020.6394622)

导航顶部的搜索匹配文本内容。

![](http://swift.gg/img/articles/sorting-and-sharing-playground-pages/Screen-Shot-2016-01-04-at-10.13.47-AM.png1454637021.0549808)

## 命令行搜索 Playgrounds

前一段时间，我写了一个 pgrep 命令来获取未能被 spotlight 索引到的 playground 文件。随着 playground 内容越来越多，pggrep 命令变成了一个更加有效的搜索工具，可以按照标题来搜索所有 playground 文件。

## 书籍

最后推荐一本关于 playground 的[书](https://itunes.apple.com/us/book/playground-secrets-power-tips/id982838034?mt=11)。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。