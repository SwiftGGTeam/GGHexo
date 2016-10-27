title: "在 ARMv7 的设备上编译 Swift 3.0"
date: 2016-10-27
tags: [Swift 跨平台]
categories: [iAchieved.it]
permalink: building-swift-3-0-on-an-armv7-system
keywords: 
custom_title: 
description: 

---
原文链接=http://dev.iachieved.it/iachievedit/building-swift-3-0-on-an-armv7-system/
作者=Joe
原文日期=2016/09/24
译者=X140Yu
校对=walkingway
定稿=CMB

<!--此处开始正文-->

**编者注：** 此文是我们上一篇在 BeagleBone Black 或 Raspberry Pi 3 上编译 Swift 3.0 的续篇，这篇文章使用了由 [Swift ARM](https://github.com/swift-arm) 组织搭建的仓库。

为了在一个 ARMv7 的系统上原生编译 Swift 3.0，你需要做以下准备工作：

* 一个性能强劲的 ARMv7 设备；我们使用 [BeagleBoard X15](http://dev.iachieved.it/iachievedit/a-look-at-the-beagleboard-x15/) 编译了大概 4 个小时，在 [Raspberry Pi 3](https://www.raspberrypi.org/products/raspberry-pi-3-model-b/) 上编译了大概六个小时。
* 使用 USB3 flash drive 或者 UHS-I/class 10 microSD 之类的高速 IO 存储设备，有 **16GB** 或以上存储空间（我比较喜欢 [Patriot EP Series](https://www.amazon.com/Patriot-Performance-MicroSDHC-Class-10-Compliant/dp/B00KXO0M3I) 这种价格合适，读写速度也不错的产品）
* 支持编译 Swift 的 Ubuntu 发行版，例如 [Ubuntu Xenial 16.04](https://wiki.ubuntu.com/XenialXerus/ReleaseNotes)
* 耐心

<!--more-->

## 安装编译的依赖

编译 Swift 需要很多依赖。你可以使用下面的一条命令把它们都安装上：

`sudo apt-get install -y git cmake ninja-build clang uuid-dev libicu-dev icu-devtools libbsd-dev libedit-dev libxml2-dev libsqlite3-dev swig libpython-dev libncurses5-dev pkg-config autoconf libtool systemtap-sdt-dev libcurl4-openssl-dev`

## 增大 swap 的空间

在 ARMv7 的设备上编译 Swift 至少需要 2G 的内存。如果你使用 Pi3 的话，可能就需要增大一些 swap 的空间，把内存从 1G 翻倍到 2G。

```bash
# cd /var/cache
# sudo mkdir swap
# cd swap
# sudo fallocate -l 1G 1G.swap
# sudo mkswap 1G.swap
Setting up swapspace version 1, size = 1024 MiB (1073737728 bytes)
no label, UUID=184d002a-2f15-4b23-8360-8e792badc6a2
# sudo chmod 600 1G.swap
# sudo swapon 1G.swap
```

## 使用 `build-swift`

`build-swift` 是我们的一个 Github 仓库，里面有几个 helper 脚本，使其在 ARM 下编译 Swift 更加轻松。

```bash
# git clone https://github.com/swift-arm/build-swift
# cd build-swift
```

默认 `build-swift` 会切换到 `swift-3.0` 分支。

在 `scripts` 文件夹中的脚本都比较简单：

* `get.sh` – 下载所有在编译 Swift 时需要的仓库；这些仓库都来自 [Swift ARM](https://github.com/swift-arm/) 组织，而且特别为 ARMv7 打了补丁。
* `update.sh` – 把本地的仓库都更新到与 Github 相同的最新版本。
* `package.sh` – 运行 Swift 的 `build-script`。
* `clean.sh` – 删除 build 中产生的临时文件。
* `distclean.sh` – 同时删除 build 中产生的临时文件还有已经被替换过的旧仓库。

## 开始动手吧！

在开始之前，确保你已经：

* 安装了所有的依赖包。
* 至少 2G 的可用 RAM。
* 从 Github 上 clone 了 `build-swift`。

现在，clone 所有需要依赖的仓库：

```bash
# cd build-swift
# ./scripts/get.sh
```

在高速的 SD 卡上，这一步需要大概 15 分钟。

现在可以编译了。Swift 的 ARM team 使用 [Jenkins](https://jenkins.io/) 来跑这个编译任务，在没有 CI 的情况下，你可以使用 `nohup` 命令来确保你的编译任务是持续工作的，即使 terminal 把你给踢掉线也没问题：

```bash
# nohup ./scripts/package.sh > swiftbuild.log &
```

想要看编译的输出可以使用 `tail -F swiftbuild.log` 命令。

现在耐心等待就可以了。在 Raspberry Pi 3 上，一次完整干净的 Swift 编译可能会花上 6 个小时。但是结果却是值得的，这是一个 `swift.tar.gz` 的包，可以把它安装在运行 Ubuntu Xenial 的 Raspberry Pi 2 或 Pi 3 上（不要把它安装在 Raspbian 机器上，你会失望的）。我会把 Swift 像下面一样安装在 `/opt/swift/` 中：

 ```bash
# cd /opt
# mkdir -p swift/swift-3.0
# cd swift/swift-3.0
# tar -xzvf /path/to/swift.tar.gz
```

你可以添加 `export PATH=/opt/swift/swift-3.0/usr/bin:$PATH` 来设置 `PATH`。 为了使用 `swiftc` 和 `swift build` 你还需要运行下面几条命令：

```bash
sudo apt-get install -y libicu-dev
sudo apt-get install -y clang-3.6
sudo update-alternatives --install /usr/bin/clang clang /usr/bin/clang-3.6 100
sudo update-alternatives --install /usr/bin/clang++ clang++ /usr/bin/clang++-3.6 100
```

## 获取帮助
如果你在编译中遇到了问题，就加入 [swift-arm Slack](http://dev.iachieved.it:9909/) channel 吧！ 
