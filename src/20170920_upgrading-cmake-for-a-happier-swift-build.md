title: "升级 CMake 使 Swift 的构建过程更加愉悦"
date: 2017-09-20
tags: [Swift]
categories: [iAchieved.it]
permalink: swift-option-sets
keywords: 
custom_title: 
description: 

---
原文链接=http://dev.iachieved.it/iachievedit/upgrading-cmake-for-a-happier-swift-build/
作者=Joe
原文日期=2016/06/30
译者=EyreFree
校对=walkingway
定稿=CMB

<!--此处开始正文-->

![](http://dev.iachieved.it/iachievedit/wp-content/uploads/2016/06/swift-og-1.png)

开源 Swift 已经有一些更新来利用新版本的 [CMake](https://cmake.org/) **在 Linux 上构建 Swift**。需要指出的是，Ubuntu 14.04 (2.8.12.2) 自带的默认版 cmake 不再胜任这项工作。

让我们把 Ubuntu 14.04 的 CMake 升级到 3.4.3，[开发者表示](https://lists.swift.org/pipermail/swift-dev/Week-of-Mon-20160627/002299.html)该版本可以满足需求。

当通过源代码安装软件时，通常会有一个构建区在 `/usr/local/src` 和一个存档区（所以可以跟踪我构建的版本）在 `/usr/local/archive`：

使用 root 账户或者用 sudo 方式执行：

```bash
# cd /usr/local/archive
# wget https://cmake.org/files/v3.4/cmake-3.4.3.tar.gz
# cd ../src/
# tar -xzvf ../archive/cmake-3.4.3.tar.gz
```

接下来，进行配置并且构建：

```bash
# cd cmake-3.4.3
# ./configure --prefix=/usr/local
...
CMake has bootstrapped.  Now run make.
# make
```

最后，`make install` 会将 cmake 和它的关联设置安装到 `/usr/local` 目录下。

```bash
# make install
# which cmake
# cmake --version
cmake version 3.4.3

CMake suite maintained and supported by Kitware (kitware.com/cmake).
```

以上就是全部过程。构建愉快！
