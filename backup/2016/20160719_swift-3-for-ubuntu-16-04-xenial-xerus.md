title: "在 Ubuntu 16.04 Xenial Xerus 上安装 Swift 3.0"
date: 2016-07-19
tags: [Swift 跨平台]
categories: [iAchieved.it]
permalink: swift-3-0-for-ubuntu-16-04-xenial-xerus
keywords: ubuntu swift 安装,ubuntu swift环境
custom_title: Ubuntu 16.04 Swift 3.0 开发环境搭建
description: Ubuntu Swift 开发环境搭建是很多人不会的，那么本文就来教你在 Ubuntu 16.04 上安装 Swift 3.0的步骤。

---
原文链接=http://dev.iachieved.it/iachievedit/swift-3-0-for-ubuntu-16-04-xenial-xerus/?utm_source=rss&utm_medium=rss
作者=Joe
原文日期=2016-06-25
译者=小锅
校对=saitjr
定稿=CMB

<!--此处开始正文-->

我们对“让 Swift 3.0 在更多的 Linux 系统上运行”这件事充满了热情，因此我们开始在 **Ubuntu 16.04**，即 [Xenial Xerus](http://releases.ubuntu.com/16.04/)，X86 系统上构建 Swift 3.0。安装过程十分简单，只需要添加我们的 APT 仓库，并使用 `apt-get` 就可以了。二进制文件会被安装到 `/opt/swift/swift-3.0` 目录下，所以在安装 3.0 版本后需要更新 path 路径。**编辑手记：**对于我们为什么使用 `/opt/swift` 而不是 `/usr/bin/` 目录，可以在 swift-dev 邮件列表上的[这个帖子](https://lists.swift.org/pipermail/swift-dev/Week-of-Mon-20160425/001838.html)里面找到原因。

<!-- more -->

### 1. 添加仓库密钥

```bash
wget -qO- http://dev.iachieved.it/iachievedit.gpg.key | sudo apt-key add -
```

### 2. 添加 Xenial 仓库到 source.list 中

```bash
echo "deb http://iachievedit-repos.s3.amazonaws.com/ xenial main" | sudo tee --append /etc/apt/sources.list
```

### 3. 执行 apt-get update

```bash
sudo apt-get update
```

### 4. 安装 swift-3.0!

```bash
sudo apt-get install swift-3.0
```

### 5. 更新 PATH 路径!

```bash
export PATH=/opt/swift/swift-3.0/usr/bin:$PATH
```

### 6. 测试

```bash
git clone https://github.com/apple/example-package-dealer
cd example-packager-dealer
swift build
Compiling Swift Module 'FisherYates' (1 sources)
Linking Library:  .build/debug/FisherYates.a
Compiling Swift Module 'PlayingCard' (3 sources)
Linking Library:  .build/debug/PlayingCard.a
Compiling Swift Module 'DeckOfPlayingCards' (1 sources)
Linking Library:  .build/debug/DeckOfPlayingCards.a
Compiling Swift Module 'Dealer' (1 sources)
Linking Executable:  .build/debug/Dealer
```

开始执行！

```bash
.build/debug/Dealer
```

## FAQ

**Q**. 这些二进制版本是苹果官方构建的吗？
**A**. 并不是，我是在自己的个人服务器上构建的，构建过程请参考我[之前的文章](http://dev.iachieved.it/iachievedit/keeping-up-with-open-source-swift/)。

**Q**. 此版本的构建包含了哪些 git 的历史版本？
**A**. 可以使用 `apt-cache show swift-3.0` 来查看这些信息。例如：

```bash
# apt-cache show swift-3.0
Package: swift-3.0
Conflicts: swift-2.2
Version: 1:3.0-0ubuntu10+xenial1
Architecture: amd64
Installed-Size: 370463
Maintainer: iachievedit (support@iachieved.it)
Depends: clang (>= 3.6), libicu-dev
Homepage: http://dev.iachieved.it/iachievedit/swift
Priority: optional
Section: development
Filename: pool/main/s/swift-3.0/swift-3.0_3.0-0ubuntu10+xenial1_amd64.deb
Size: 72513864
SHA256: b1bf548f353466ea72696089a8b666956a2603edb467eb0517e858eb1ba86511
SHA1: 5dd02b14d21f2e821040de3bb1052561653fcfcd
MD5sum: f2c3d3b9517a303cc86558b6c560a8d6
Description: Open Source Swift
 This is a packaged version of Open Source Swift 3.0 built from
 the following git revisions of the Apple Github repositories:
       Clang:  460d629e85
        LLVM:  8d0086ac3e
       Swift:  1abe85ab41
  Foundation:  4c15543f82
Description-md5: a6b1dd247c7584b61692a101d9d0e5fa
```

每个构建版本的源码树 (source tree) 都是*未经变动*的。

**Q**. 你在上传这些二进制之前有进行过测试吗？
**A**. Swift 的构建过程就是对二进制文件的测试，之后我会进行一些基本的测试，并且用它来编译我自己的应用，但是我目前并没有单独全面的测试用具。

**Q**. 你是按一定的日程计划来发布新的构建版本吗？
**A**. 并不是，不过我是尽量与苹果官方的发布保持同步的。我的目的就是发布这些东西，然后使用大家能够体验并开始在 Linux 上面进行 Swift 开发。

**Q**. 安装后的文件都在哪里？
**A**. 所有的文件都放在 `/opt/swift/swift-3.0/usr` 目录下。

**Q**. 如何理解包的版本号？
**A**. 将版本号进行分解，3.0-0ubuntu10+xenial1 可以理解为：

* 3.0 是 Swift 打包的版本号
* -0ubuntu10 说明这是 Ubuntu 的第二个包，而开头的 0 代表当前的包不是基于上游的 Debain 包进行改造的。
* +xenial1 表示这个包是用于 Xenial Xerus 的。

我觉得我的理解是对的，但如果你有别的看法，可以发邮件到 `support@iachieved.it` 进行探讨。

## 我们是如何做这些事的

关于如何在 Amazon S3 上面部署 Debain 包仓库，我使用的[这份超赞的教程](http://xn.pinkhamster.net/blog/tech/host-a-debian-repository-on-s3.html)。我曾经试过配置 Launchpad PPA，但是坦白讲，我对部署一个简单的包而需要进行麻烦复杂的元数据整合感到十分厌倦。我能确定对于发行版仓库的部署，这些步骤是必要的，但是对于我需要部署的东西，这显然是杀鸡用牛刀了。对于那些开发 [fpm](https://github.com/jordansissel/fpm) 人们，他们也有一些自己的看法。

我们用来构建代码并且将其上传到仓库的打包脚本可以在 [Github](https://github.com/iachievedit/package-swift) 上找到。对于 Swift 3.0，记得切换到 swift-3.0 分支。