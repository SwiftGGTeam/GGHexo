title: "Swift 3.0 介绍"
date: 2016-02-25 09:00:00
tags: [Swift 入门,Swift 3.0]
categories: [iAchieved.it] 
permalink: introducing-swift-3-0
keywords: Swift3.0的特点,Swift3.0变化
custom_title: Swift 3.0 的新变化
description: 现在Swift3.0已经到来了，那么Swift3.0的新变化是什么呢，下面就来好好说下Swift3.0吧。

---
原文链接=http://dev.iachieved.it/iachievedit/introducing-swift-3-0
作者=Joe
原文日期=2016-02-16
译者=Cee
校对=numbbbbb
定稿=小锅

<!--此处开始正文-->

![Swift 3.0](https://img.shields.io/badge/Swift-3.0-orange.svg?style=flat)

如果你在寻找 Swift 2.2 的 Ubuntu 包，可以参考我们的[这篇](http://dev.iachieved.it/iachievedit/ubuntu-packages-for-open-source-swift/)指南。

### Swift 3.0

Swift 2.2 已经从 `master` 分支移到了 `swift-2.2` 分支。现在，Swift 3.0 版本在仓库的 `master` 分支上开发。克隆编译完整的 Swift 3.0 源代码的方法已经和之前截然不同了。比起之前需要克隆逐个仓库，现在你只需要：

```bash
mkdir swift-build
cd swift-build
git clone https://github.com/apple/swift.git 
./swift/utils/update-checkout --clone
```

<!--more-->

`Swift` 仓库中的 `update-checkout` 脚本能够帮你克隆编译 Swift 源代码所需的所有仓库内容，并将其打包成 `.tar.gz` 压缩文件。

使用 "build and package" 预设不仅可以编译所有必要的目标文件，还能将它们打包成 `.tar.gz` 压缩文件。使用名为 `package.sh` 的脚本就能完成上述任务（在 `package-swift` 库中）：

```bash
#!/bin/bash
pushd `dirname $0` > /dev/null
WHERE_I_AM=`pwd`
popd > /dev/null
INSTALL_DIR=${WHERE_I_AM}/install
PACKAGE=${WHERE_I_AM}/swift.tar.gz
LSB_RELEASE=`lsb_release -rs  | tr -d .`
rm -rf $INSTALL_DIR $PACKAGE
./swift/utils/build-script --preset=buildbot_linux_${LSB_RELEASE} install_destdir=${INSTALL_DIR} installable_package=${PACKAGE}

```

脚本中最关键的一步就是检测 Ubuntu 的发行版本（`lsb_release -rs`，译者注：LSB，Linux Standard Base），并且使用 `buildbot_linux_${LSB_RELEASE}` 预设来编译并把所有内容打包到 `${PACKAGE} .tar.gz` 文件中。

### apt-get

从 Apple 库中下载一个 `.tar.gz` 是个不错的选择，但是更好的解决方案是在 Ubuntu 发行版中直接使用 `apt-get` 指令。为了让编译 Swift 在 Linux 中更加容易上手，我们为你准备了包含最新的 Swift 包的 Ubuntu 仓库。

目前我们同时提供 `swift-3.0` 和 `swift-2.2` 两个版本，但是它们并*不*兼容。举个例子，两个 `swift` 版本都会安装到 `/usr/bin` 下。我们计划把这两个包安装到不同的地方，不过可能要到 2016 年中我们才有时间来处理这个问题。

尽管这种方法有些约束和限制，不过没关系，下面我们看看如何安装 Swift 3.0！

**1. 添加 Repository key**

```bash
wget -qO- http://dev.iachieved.it/iachievedit.gpg.key | sudo apt-key add -
```

**2. 将特定的仓库添加到 `sources.list` 中**

**Ubuntu 14.04**

```bash
echo "deb http://iachievedit-repos.s3.amazonaws.com/ trusty main" | sudo tee --append /etc/apt/sources.list
```

**Ubuntu 15.10**

```bash
echo "deb http://iachievedit-repos.s3.amazonaws.com/ wily main" | sudo tee --append /etc/apt/sources.list
```

**3. 运行 `apt-get update`**

```bash
sudo apt-get update
```

**4. 安装 swift-3.0 吧！**

```bash
apt-get install swift-3.0
```

**5. 试一试**

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

运行起来！

```bash
.build/debug/Dealer
```

### FAQ

**Q.** Apple 官方会编译这些二进制文件吗？
**A.** 不会，这些都是我在我的个人服务器上编译的，可以参考这篇[指南](http://dev.iachieved.it/iachievedit/keeping-up-with-open-source-swift/)。

**Q.** 所编译项目的 git 版本如何查看？
**A.** 你可以使用 `apt-cache show swift-3.0 ` 来查看此信息。例如：

```bash
# apt-cache show swift-3.0
Package: swift-3.0
Status: install ok installed
Priority: optional
Section: development
Installed-Size: 281773
Maintainer: iachievedit (support@iachieved.it)
Architecture: amd64
Version: 1:3.0-0ubuntu2
Depends: clang (>= 3.6), libicu-dev
Conflicts: swift-2.2
Description: Open Source Swift
 This is a packaged version of Open Source Swift 3.0 built from
 the following git revisions of the Apple Github repositories:
       Clang:  c18bb21a04
        LLVM:  0d07a5d3d5
       Swift:  8aa4dadf92
  Foundation:  dc4fa2d80b
Description-md5: 08508c39657c159d064917af87d8d411
Homepage: http://dev.iachieved.it/iachievedit/swift
```

每次编译的源代码中的树形关系*不受影响*。

**Q.** 在上传二进制文件前你有做过测试吗？
**A.** Swift 编译的时候会对二进制文件进行测试，我在编译自己的应用之前也做了一些基本的测试。不过现在没有复杂的测试用例套件。

**Q.** 准备定期编译吗？
**A.** 不，并不准备。虽然我想和 Apple 保持同步，但是最初的想法只是为了做一下实验，让我能够在 Linux 上写 Swift 程序。

**Q.** 内容会安装到哪儿？
**A.** 都会安装到 `/usr/` 下，就和安装 `clang`、`gcc` 一样。

**Q.** 如何理解包版本号的意义？ 
**A.** 我一开始也考虑到了这个问题：我们需要一个合适的包版本号。把 `3.0-0ubuntu2~trusty1` 分解一下，各部分的含义：

+ 3.0 指所打包的 Swift 的版本  
+ -0ubuntu2 表示为 Ubuntu 打包的第二个版本，0 代表这个包在上游的 Debian 源上没有依赖的包
+ -trusty1 代表这个包是给 Trusty Tahr 准备的（译者注：Trusty Tahr 即 Ubuntu 14.04）

Wiley（译者注：Wiley Werewolf 即 Ubuntu 15.10）上的包版本号并不会包含类似于 `~wiley1` 这样的内容，因为从 Trusty 升级到 Wiley 后，它能够正确更新 `swift-3.0` 的包。

我*想*这应该没什么问题，不过你发现任何问题可以发邮件到 `support@iachieved.it`。

### 原理是什么？

我参考了[这个超棒的指南](http://xn.pinkhamster.net/blog/tech/host-a-debian-repository-on-s3.html)在 Amazon S3 上搭建了一个 Debian 包资源库。我试着搭建一个 Launchpad PPA（译者注：PPA，Personal Package Archives，参考[这里](https://launchpad.net/ubuntu/+ppas)），但是老实说，为了将所有元数据放入同一个包内实在是非常艰难。我敢肯定我需要托管所有必要的库的内容，但是这看上去又有些矫枉过正了。不过那些开发 [fpm](https://github.com/jordansissel/fpm) 的家伙们可能有一些解决办法吧。

那些用来打包编译并且上传到资源库的脚步可以在 [GitHub](https://github.com/iachievedit/package-swift) 上找到。安装 Swift 3.0 的话请参考 `swift-3.0` 分支。