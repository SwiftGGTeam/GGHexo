回顾 Swift 多平台移植进度 #2"

> 作者：uraimo，[原文链接](https://www.uraimo.com/2016/03/11/recap-of-swift-porting-efforts-2/)，原文日期：2016-03-11
> 译者：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；校对：[星夜暮晨](http://www.jianshu.com/users/ef1058d2d851)；定稿：[Cee](https://github.com/Cee)
  









自[上个月](https://www.uraimo.com/2016/02/02/recap-of-swift-porting-efforts/)以来，已有一些 Swift 平台移植方面的代码迁移到了 master 分支上。现在就让我们回顾一下二月里都发生了哪些事情吧，并且看看当前还有哪些正处于开发状态中。



## Windows

由 [Han Sangjin](https://github.com/tinysun212) 主导的 Cygwin Windows 平台在两周前已完成合并，您可以查看 [PR #1108](https://github.com/apple/swift/pull/1108) 了解更多信息。

[PR #1466](https://github.com/apple/swift/pull/1466) 之后的开发仍在进行，这项功能对其他平台来说也非常有用。目前开发主要集中在 [PR #1516](https://github.com/apple/swift/pull/1516) 上，主要就是把 swiftc 二进制文件链接到 Windows MSVC 库当中。

## Android

由 [Zhuowei Zhang](https://github.com/zhuowei)、多产的 [Brian Gesiak](https://github.com/modocache) 以及其他人组建的安卓移植团队已经打开了 [PR #1442](https://github.com/apple/swift/pull/1442) ，用以收集过去两个月里所有已完成的工作成果，他们的扩展目前正处于审查状态。

这一系列巨大的变化很有可能会被分解成一堆小的 PR，如果你对 Android 下的 Swift 感兴趣，我建议你跟进这个 PR，或者只是直接去学习一下 toolchain 的内部结构，感谢代码中那些有趣的注释，阅读源码才不至于枯燥无味。

## ARM

[PR #1157](https://github.com/apple/swift/pull/1157) 中通过 [William Dillon](https://github.com/hpux735) 的一些新的贡献，现已能够支持 Google's Gold linker。另外，`thumb` 架构类型现在可以使用了，您可以在 thumb/thumb 2 扩展所支持的地方，完成编译二进制文件的工作。

至于 ARMv6 上的 Swift，[Swift 3.0 二进制文件](https://www.uraimo.com/2016/03/10/swift-3-available-on-armv6-raspberry-1-zero/)目前已经可以下载了，这个版本比之前发布的 2.2 版本有了显著改善（包含了 Foundation 和 XCTest），因此我推荐您推荐使用这个版本。这个版本在二月中旬的时候就从 Swift master 分支的一个快照中完成了编译。

## PowerPC64le

实际上上次我忘记介绍这个平台了，该平台在一月份的时候由 [Anton Blanchard](https://github.com/antonblanchard) 在 [PR #979](https://github.com/apple/swift/pull/979) 中引进。那时候，似乎还仅支持 PowerPC64 构架下的小端模式（little endian），系统是众望所归的 Linux。

## 交叉编译

对于从 OSX 到其他操作系统的交叉编译（Cross compilation）工作来说，在过去几个月里已由多个人完成了调研，[@froody](https://github.com/froody) 在 [PR #1398](https://github.com/apple/swift/pull/1398) 里提供了一个例子，演示了实现的过程。

增加对交叉编译的支持可以用很多种不同的方法实现，但是尽可能少的使用移动部件从而提供代码的简洁性将不是一件简单的事情。这项功能似乎是下次更新所要解决的首要问题。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。