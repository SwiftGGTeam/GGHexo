在树莓派 3 上构建 Swift 3.0"

> 作者：iAchieved.it，[原文链接](http://dev.iachieved.it/iachievedit/building-swift-3-0-on-a-raspberry-pi-3)，原文日期：2016-06-2
> 译者：[pucca601](http://weibo.com/601pucca)；校对：[靛青K](http://blog.dianqk.org/)；定稿：[CMB](https://github.com/chenmingbiao)
  









> 原文图片链接全部失效，因此本文图片无法显示。

![](http://swiftgg-main.b0.upaiyun.com/img/building-swift-3-0-on-a-raspberry-pi-3-1.png)

有许多小伙伴对在他们的树莓派 3 上构建 Swift 3.0 感兴趣，这篇教程献给那些勇敢的灵魂！

在开始之前你需要准备好以下东西：

- 一个[树莓派 3](https://www.raspberrypi.org/products/raspberry-pi-3-model-b/)
- 一个容量至少 **16GB** 的 UHS-I/class 10 microSD 卡（我喜欢性价比高的 [Patriot EP Series](https://www.amazon.com/Patriot-Performance-MicroSDHC-Class-10-Compliant/dp/B00KXO0M3I)）
- [Ubuntu Xenial 16.04](https://wiki.ubuntu.com/XenialXerus/ReleaseNotes)
- 耐心

显然这是可以做到的；[而且我们已经做到了](http://dev.iachieved.it/iachievedit/swift-3-0-on-raspberry-pi-2-and-3/)，并且还有其他小伙伴也对基于 ARM 的设备上构建 Swift 程序作出了贡献。所以别放弃。不过就算你放弃了我们也不会说什么，直接下载我们的 [prebuilt Swift 3.0 package for the Raspberry Pi 2 and 3](http://dev.iachieved.it/iachievedit/swift-3-0-on-raspberry-pi-2-and-3/) 吧。



## 安装 Xenial

我们用 [Ubuntu Xenial](https://wiki.ubuntu.com/ARM/RaspberryPi) 代替 Raspbian 。用 `curl` 或 `wget` 获取 Xenial，然后用 dd 将文件系统写入 microSD 卡。

**注意**：请确保阅读此警告。你必须替换下文提到的 `YOUR_DEVICE` 为正确的设备名。如果不替换成正确的名字，你的数据可能会毁坏（它们调用 [dd](http://cloudnull.io/2011/12/dd-and-the-mighty-disk-destroyer-or-duplicator/) 清除你的文件）。

## 使用 Linux

    # wget http://www.finnie.org/software/raspberrypi/ubuntu-rpi3/ubuntu-16.04-preinstalled-server-armhf+raspi3.img.xz
    # xzcat ubuntu-16.04-preinstalled-server-armhf+raspi3.img.xz | sudo dd of=/dev/YOUR_DEVICE bs=8M

想知道你的 `YOUR_DEVICE`，你需要将 microSD 卡插入一台装载 Linux 的机器，运行 `dmesg|tai` 查看类似下面的内容

    [1255451.544316] usb-storage 4-2:1.0: USB Mass Storage device detected
    [1255451.544466] scsi host25: usb-storage 4-2:1.0
    [1255452.545332] scsi 25:0:0:0: Direct-Access     Generic  STORAGE DEVICE   0817 PQ: 0 ANSI: 6
    [1255452.545670] sd 25:0:0:0: Attached scsi generic sg8 type 0
    [1255452.828405] sd 25:0:0:0: [sdh] 15523840 512-byte logical blocks: (7.94 GB/7.40 GiB)
    [1255452.829402] sd 25:0:0:0: [sdh] Write Protect is off
    [1255452.829409] sd 25:0:0:0: [sdh] Mode Sense: 23 00 00 00
    [1255452.830400] sd 25:0:0:0: [sdh] Write cache: disabled, read cache: enabled, doesn't support DPO or FUA
    [1255452.835967]  sdh: sdh1
    [1255452.840401] sd 25:0:0:0: [sdh] Attached SCSI removable disk

在这个例子中，你的设备是 `/dev/sdh`。

## 使用 OS X (macOS)

我个人喜欢用一个单独的 Linux 服务器进行这些操作，但你也可以在一台 Mac 上使用 [homebrew](http://brew.sh/) 完成这些操作:

    # brew install wget xz
    # wget http://www.finnie.org/software/raspberrypi/ubuntu-rpi3/ubuntu-16.04-preinstalled-server-armhf+raspi3.img.xz
    # xzcat ubuntu-16.04-preinstalled-server-armhf+raspi3.img.xz|sudo dd of=/dev/rdisk3 bs=8m

注意到当在 Mac 上操作 dd，使用  `/dev/rYOUR_DEVICE` 会更明智。使用 `/dev/YOUR_DEVICE` 的速度很慢，详细解释见[这里](http://daoyuan.li/solution-dd-too-slow-on-mac-os-x/)。

要在 Mac 上找到 `YOUR_DEVICE`，插入 microSD 卡并且在终端运行 `diskutil list` 。寻找匹配你 SD 卡大小的磁盘（如果你有其他相同大小可匹配的磁盘，记得查看其他属性保证你找到的磁盘是对的）。

    # diskutil list
    ...
    /dev/disk5 (external, physical):
       #:                       TYPE NAME                    SIZE       IDENTIFIER
       0:     FDisk_partition_scheme                        *16.0 GB    disk5
       1:             Windows_FAT_32 system-boot             134.2 MB   disk5s1
       2:                      Linux                         15.9 GB    disk5s2

如果你对使用 `diskutil` 和 `dd` 命令感到困惑，建议阅读[这篇文章](http://www.cyberciti.biz/faq/how-to-create-disk-image-on-mac-os-x-with-dd-command/)。顺便说一句，如果你经常摆弄 Raspberry Pi 并且形成了习惯，`wget` 、 `xzcat` 和 `dd` 命令都是很重要的工具。要熟练操作它们。

## 更新 Xenial

好啦，既然你有一个装着 Xenial 的 microSD 卡，就可以直接塞进树莓派 3 启动它！没错就是这样，然后我们假设你有一个以太网接口或者 miniUSB 接口连接网络。你可以先尝试用 `ssh ubuntu@ubuntu.local` 远程登录你的树莓派，如果失败了，你可以打开路由器的 LAN 页面确认一下 IP 地址。默认密码是 `ubuntu` 。

    # ssh ubuntu@192.168.1.115
    The authenticity of host '192.168.1.115 (192.168.1.115)' can't be established.
    ECDSA key fingerprint is 62:e9:f9:09:d0:30:3c:c9:0e:47:a3:42:f5:2c:e2:ae.
    Are you sure you want to continue connecting (yes/no)? yes
    Warning: Permanently added '192.168.1.115' (ECDSA) to the list of known hosts.
    ubuntu@192.168.1.115's password:
    You are required to change your password immediately (root enforced)
    Welcome to Ubuntu 16.04 LTS (GNU/Linux 4.4.0-1009-raspi2 armv7l)
    ...
    WARNING: Your password has expired.
    You must change your password now and login again!
    Changing password for ubuntu.
    (current) UNIX password:

一旦你修改了密码，你需要用 `ubuntu` 用户重新登录并且更新系统：

    # sudo apt-get update && sudo apt-get upgrade -y
    # reboot

## 安装构建所需的依赖

编译 Swift 需要很多依赖。可以用如下命令一次性搞定：

    # sudo apt-get install -y git cmake ninja-build clang uuid-dev libicu-dev icu-devtools libbsd-dev libedit-dev libxml2-dev libsqlite3-dev swig libpython-dev libncurses5-dev pkg-config

幸运地是我们不用自己一个个去寻找依赖（你知道的，那些一次又一次下载一个目录尝试构建它后才发现缺少的依赖），因为这些依赖全都列在了 Open Source Swift [README](https://github.com/apple/swift) 里。

我也喜欢包含 htop 这样我就可以看看树莓派编译出的进程信息：

![](http://swiftgg-main.b0.upaiyun.com/img/building-swift-3-0-on-a-raspberry-pi-3-2.png)

## 添加一些 Swap 分区

尽管派 3 自带 1GB 的高容量 RAM，依然不够完整的构建 Swift（通常在链接步骤发生问题）。让我们手动添加 1G Swap 分区。

    # fallocate -l 1G 1G.swap
    # sudo mkswap 1G.swap
    Setting up swapspace version 1, size = 1024 MiB (1073737728 bytes)
    no label, UUID=184d002a-2f15-4b23-8360-8e792badc6a2
    # sudo swapon 1G.swap

以下是你在构建过程中出现 Swap 分区不可用的问题。

    cd /root/workspace/Swift-3.0-Pi3-ARM-Incremental/build/buildbot_linux/swift-linux-armv7/bin && /usr/bin/cmake -E create_symlink swift swiftc && cd /root/workspace/Swift-3.0-Pi3-ARM-Incremental/build/buildbot_linux/swift-linux-armv7/bin && /usr/bin/cmake -E create_symlink swift swift-autolink-extract
    clang: error: unable to execute command: Killed
    clang: error: linker command failed due to signal (use -v to see invocation)
    ninja: build stopped: subcommand failed.
    ./swift/utils/build-script: fatal error: command terminated with a non-zero exit status 1, aborting

在一个 microSD 卡上利用 Swap 分区双倍扩容 RAM 并不是通用的办法。一旦我们进入到构建阶段需要我们染指 Swap 分区时，构建过程会变慢。但是不使用分区程序，其代价是以内存不足为错误提示崩溃。

## 使用 package-swift

`package-swift` 是我们的 Github 目录，内含一些辅助脚本使得构建 Swift 更便捷。

    # git clone https://github.com/iachievedit/package-swift
    # cd package-swift

默认情况下 package-swift 会迁出一个 swift-3.0 的分支。脚本都非常简单：

- `get.sh` – 下载所有构建 Swift 需要的目录
- `update.sh` – 从 Github 上更新所有的本地目录
- `patch.sh` – 应用 Swift on ARM 团队推出的最新补丁；我们必须时不时的更新保证可运行。一旦补丁不再需要我们就移除它，所以在实际的构建之前需要先 `git pull` 保证所有补丁包最新。
- `package.sh` – 运行 Swift 的构建脚本，预设脚本名为 buildbot_linux_armv7

我建议你看看每个 shell 脚本，在执行前弄清它们的逻辑。脚本看上去很简单，但是花时间去弄懂它们还是相当值得的。请注意在 get.sh 和 update.sh 中会检到我们的构建是在 ARMv7 处理器上，所以我们需要 [William Dillon 的 swift-llvm fork](https://github.com/hpux735/swift-llvm)。

## 开始构建

请确保你有：

- 安装所有依赖包
- 激活 1 GB Swap 分区
- 已经从 Github 克隆的 `package-swift`

现在，克隆所有需要的目录：

    # cd package-swift
    # ./get.sh

这个步骤我在我的 SD 卡上用了 15 分钟下载和写入所有东西。

紧接着，打补丁。获取 Swift on ARM 团队开发测试过的最新的补丁是非常重要的一步。这些补丁时不时就会改变，所以请保证实时更新它们。

    # ./patch.sh

现在开始编译。Swift on ARM 团队使用 [Jenkins](https://jenkins.io/) 运行这个脚本，在这之上的构建工作是没有日志的。但是如果你使用 nohup 来确保你的编译正在进行，即使你的终端断线了也能知道。

    # nohup ./package.sh > swiftbuild.log&

现在，只需要等待！整个构建过程至少 6 个小时。然而等待的成果是值得的，最后奖励是 swift.tar.gz bundle，可以在跑着 Ubuntu Xenial 的树莓派 2 或 3 上安装（不要尝试在装了 Raspbian 的机器上安装，不然你会失望的）。我选择像这样在 /opt/swift/ 安装 Swift：

    # cd /opt
    # mkdir -p swift/swift-3.0
    # cd swift/swift-3.0
    # tar -xzvf /path/to/swift.tar.gz

然后你可以用 export PATH=/opt/swift/swift-3.0/usr/bin:$PATH 设置 PATH。要正确的使用 `swiftc` 和 `swift build` 还需要运行以下命令：

    sudo apt-get install -y libicu-dev
    sudo apt-get install -y clang-3.6
    sudo update-alternatives --install /usr/bin/clang clang /usr/bin/clang-3.6 100
    sudo update-alternatives --install /usr/bin/clang++ clang++ /usr/bin/clang++-3.6 100

## 需要帮助

你的第一次构建往往会失败的。事实上，在 ARM 设备上例如树莓派 2 和 3 上构建可能会持续很长时间一团糟一直到有人能够修理它们。如果你有什么编译问题，请大胆的发邮件到 admin@iachieved.it，我们会邀请你到 Swift for ARM Slack 社区来讨论你的问题。

## 致谢

我应该单独为此写一页；许多小伙伴在推动在 ARM 设备上运行 Swift 作出了很多贡献。像 [PJ](http://saygoodnight.com/2016/05/08/building-swift-for-armv6.html) 开创了 树莓派 1 上构建 Swift 的先河，以及任何一篇文章都离不开的 [William Dillon’s](http://www.housedillon.com/) 贡献，感谢小伙伴们所做的这一切。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。