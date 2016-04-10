回顾 Swift 多平台移植进度 #1"

> 作者：uraimo，[原文链接](https://www.uraimo.com/2016/02/02/recap-of-swift-porting-efforts)，原文日期：2016-02-02
> 译者：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；校对：[Cee](https://github.com/Cee)；定稿：[星夜暮晨](http://www.jianshu.com/users/ef1058d2d851)
  









明天（本文发表日期是 2016 年 2 月 2 日）就是 Swift 开源后的第二个月了。

这么短的时间当中发生了很多事情。开源社区已经在全面发展这项语言了，他们为 Swift 的每个分支项目都贡献了[大量的代码](https://github.com/apple/swift/graphs/contributors)，他们甚至讨论了 [Swift 的将来](https://lists.swift.org/pipermail/swift-evolution/)，并为之提出意见和建议。苹果公司非常欢迎开源社区的加入，而开源社区则积极回应了许多贡献和想法。

在我看来这两个月里，开源社区中真正出彩的项目是：把 Swift 语言移植到新的平台当中。一些类似的社区驱动项目让 Swift 在新平台（Android，Linux ARM，FreeBSD，Windows）上运行成为了可能。

现在让我们回顾一下每个项目的状态，从现在起，我会每月会更新两次这些项目的进度，如果你感兴趣，可以点击下方的订阅按钮来关注我的文章。



## ARMv7 和 ARMv6

移植到 Linux ARM 系统主要是靠 [Willian Dillon](https://github.com/hpux735), [@tienex](https://github.com/tienex) 等人的努力，该项目目前处于高度完成状态，用户面临的唯一问题就是目前在 [REPL](https://bugs.swift.org/browse/SR-501)（仍有一些问题）和 [SwiftPM](https://bugs.swift.org/browse/SR-387) 上无法使用。

关于 JIRA 的问题，可以跟踪 [SR-40](https://bugs.swift.org/browse/SR-40) 的开发进度，在几天前已经并入到 master 了，关于这个平台的移植可以看 [William的博客](http://www.housedillon.com/?p=2267) 和 GitHub 上 issues [#439](https://github.com/apple/swift/pull/439) 和 [#901](https://github.com/apple/swift/pull/901) 。恭喜所有相关的开发者，这个移植项目花了他们大量的努力和时间。

正在我们说这件事的时候，开发项目组成员正努力用更便捷的方案来代替连接器 swift.ld，详见 [#1157](https://github.com/apple/swift/pull/1157)。

你想在树莓派二代、BeagleBone Black 或者其他 ARMv7 板子上尝试这个移植项目吗？

正好 [achiveved.it](http://dev.iachieved.it/iachievedit/) 的 [Joe Bell](https://twitter.com/iachievedit) 给你提供了解决方案。他提供了一个[ARM debian packages](http://dev.iachieved.it/iachievedit/debian-packages-for-swift-on-arm/)，有了这个，只需几分钟时间就能搞定安装。他网站上也提供了很多[有趣的 Glibc 教程和指南](http://dev.iachieved.it/iachievedit/category/linux/)，正是这些资料使我们能够轻松地在 Linux ARM 平台上开始使用。

那树莓派 1/Zero 的二进制预编译文件呢？可以从[这里](https://www.uraimo.com/2016/02/10/swift-available-on-armv6-raspberry-1-zero/)获得。

如果你富有冒险精神，时间宽裕，这里也有一些指南让你在树莓派 2 上使用 Swift : [1](http://morimori.tokyo/2016/01/05/how-to-compile-swift-on-a-raspberry-pi-2/) & [2](http://blog.andrewmadsen.com/post/136137396480/swift-on-raspberry-pi)

## Android

其实在 Swift 开源之前，我们就开始考虑要在安卓平台上运行 Swift 的代码了，第一个尝试成功的是 [Romain Goyet](https://twitter.com/lck)，在他的[一篇博客](http://romain.goyet.com/articles/running_swift_code_on_android/)中有详细的记录，利用 LLVM 的功能，加上在 NDK 中手动操作几步，能用 Swift 编写的代码来运行一个简单的小安卓应用了。

现在，在 GitHub 上的 [SwiftAndroid 团队](https://github.com/SwiftAndroid)中的 [Zhouwei Zhang](https://github.com/zhuowei), [Brian Gesiak](https://github.com/modocache), [@ephemer](https://github.com/ephemer) 等人的协调努力下，他们正在努力建立一个真正的 Swift 安卓平台。在他们的项目中，能找到创建 Linux toolchain 所需的一切代码，按照 [Zhuowei's 示例代码](https://github.com/SwiftAndroid/swift-android-samples)可以建立你的第一个应用。

此外还在进行着一个额外的活动（[#13](https://github.com/SwiftAndroid/swift/issues/13)），目标是建立一个 OSX/Android 交叉编译的 toolchain，这样不用使用 intermediate Linux hosts 就可以编译 Swift，从 [issues package](https://github.com/SwiftAndroid/swift/issues) 里能追踪每个人的工作内容。

除了上面提到的[主要项目](https://github.com/SwiftAndroid/swift)，我们还有一些其他的小项目， 这个是建立工具的集合：

- [swift-android-extras](https://github.com/SwiftAndroid/swift-android-extras) - 创建 toolchain 的脚本。
- [swift-jni](https://github.com/SwiftAndroid/swift-jni) - JNT 包装器，将 Swift 代码编译成Java代码，生产 Android 应用。
- [swift-android-gradle](https://github.com/SwiftAndroid/swift-android-gradle) - Gradle 插件
- [swift-android-samples](https://github.com/SwiftAndroid/swift-android-samples) - 测试 toolchain 的一些示例代码

## FreeBSD
移植到 FreeBSD 平台的工作主要由 [Davide Italiano](https://github.com/dcci) 管理，在开发了一段时间后，两周前，他在 [mailing list](https://lists.swift.org/pipermail/swift-dev/Week-of-Mon-20160118/000911.html) 上正式宣布此移植项目。

如果你想试用一下，注意还需修复 FreeBSD 运行时的一个 bug，也就是 linker 只在 FreeBSD-CURRENT 可用。

这个移植项目刚刚开发完成，还需要更多反馈来才能完善，如果你想做出贡献，最好的办法就是加入 [swift-dev mailing list](https://www.google.it/#q=freebsd+swift+site:lists.swift.org) 来进行讨论，发布新代码后查看Davide的评论。

## Windows
Windows 平台的移植是由 [Han Sangjin](https://github.com/tinysun212) 来完成的，即使作为最年轻的移植平台，该项目也已经能够进行编译，开发一个简单的 Hello World 应用了。不过类似 REPL 的组件还没不能使用。

在 GitHub 上一开始是 issue [#1010](https://github.com/apple/swift/pull/1010)，在重建了 Swift master 后，成为 issue [#1108](https://github.com/apple/swift/pull/1108)，目前还没有并入 master。

Han 在[这里](https://github.com/tinysun212/swift-cygwin-bin)也提供了便捷的提前创建的二进制文件，在[这里](https://github.com/tinysun212/swift-cygwin/tree/cygwin)你可以追踪到最新的开发状态。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。