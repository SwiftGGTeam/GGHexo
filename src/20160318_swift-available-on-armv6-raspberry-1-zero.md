title: "Swift 现在可用于所有的 ARMv6 树莓派 （1,Zero）"
date: 2016-03-18
tags: [Swift 开源]
categories: [uraimo]
permalink: swift-available-on-armv6-raspberry-1-zero
keywords: armv6设备,armv6手机
custom_title: 
description: Swift 可以在 ARMv6 处理器上实现初步编译了哦，版本是Swift 2.2基于Raspbian，感兴趣的来看下吧。

---
原文链接=https://www.uraimo.com/2016/02/10/swift-available-on-armv6-raspberry-1-zero/
作者=Umberto Raimondi
原文日期=2016-02-10
译者=zltunes
校对=numbbbbb
定稿=千叶知风

<!--此处开始正文-->

经过上百小时的编译、各种各样的尝试，甚至弄坏几支 USB 后，我终于能够跟大家分享一下如何在 ARMv6 处理器上实现 Swift 2.2 的初步编译(基于 Raspbian)。

[从 DropBox 获取](https://www.dropbox.com/s/he47c47bywm10nv/swift-armv6.tgz)

这个包适用于 树莓派1 (A,B,A+,B+) 和 Zero 系列，基于与 ARMv7 相同的资源包，但是缺少 Foundation, XCTest, LLDB 和 REPL。

<!--more-->

大多数情况下应该没什么问题，最近我正在编译 Swift master 分支上一个新的构建版本（因为[ William Dillon](https://github.com/apple/swift/pull/901)上传的 ARM 接口已经被合并进去了，关于其他接口可以看[这里](https://www.uraimo.com/2016/02/02/recap-of-swift-porting-efforts/)
），新版本应该会更加完善。

如果你安装了 *clang*（唯一需要的依赖包），用 Swift 编译器，直接下载解压即可：

```bash
sudo apt-get update
sudo apt-get install clang

wget https://www.dropbox.com/s/he47c47bywm10nv/swift-armv6.tgz
tar xzf swift-armv6.tgz
```

编译 *helloworld.swift* :

```swift
./usr/bin/swiftc helloworld.swift
```

[SwiftyGPIO](https://github.com/uraimo/SwiftyGPIO) 已经在 树莓派 A 上测试过，可以完美运行。同时也感谢[Dan Leonard](https://twitter.com/MacmeDan) 在树莓派 Zero  上进行的测试！

如果你有一个树莓派 2 或其它 ARMv7 处理器，你可以在[这里](http://dev.iachieved.it/iachievedit/open-source-swift-on-raspberry-pi-2/)找到预编译的 Swift 二进制文件。

如果你有好的想法，欢迎来[Twitter](http://www.twitter.com/uraimo)与我交流。