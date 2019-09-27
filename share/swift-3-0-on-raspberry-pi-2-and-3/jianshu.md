树莓派 2 和 3 上的 Swift 3.0"

> 作者：JOE，[原文链接](http://dev.iachieved.it/iachievedit/swift-3-0-on-raspberry-pi-2-and-3/?utm_source=rss&utm_medium=rss)，原文日期：2016-05-01
> 译者：ckitakishi；校对：[mmoaay](http://www.jianshu.com/u/2d46948e84e3)；定稿：[CMB](https://github.com/chenmingbiao)
  









> 原文图片链接全部失效，因此本文图片无法显示。

![](http://dev.iachieved.it/iachievedit/wp-content/uploads/2016/06/raspberry-pi-logo-2.png)

当前，有许多人[正在努力](http://dev.iachieved.it/iachievedit/swift-for-arm-systems/)将 Swift 3.0 引入到基于 ARM 的系统中。通过本文你将了解如何在运行 Ubuntu 16 ([Xenial Xerus](https://wiki.ubuntu.com/XenialXerus)) 的树莓派 2 或树莓派 3 上构建并使用 Swift 3.0。不过，我们暂时还没有对它在 Raspbian 系统上的可用性进行测试 (看起来并不可以)。

**一个善意的提醒**：树莓派 (以及所有 ARM 设备) 所支持的 Swift 3.0 仍然是测试版。 因此，尽管你可以在原型制作以及概念验证时尽情使用，但利用它来构筑产品还需三思。另外，我们有一个团队，正以在 ARM 设备上使用 Swift 3.0 为目标而不懈努力，如果你有兴趣加入，请发邮件到：admin@iachieved.it，我们将会邀请你加入 Slack 群组。



## 在树莓派上部署 Xenial

也许你还不知道支持树莓派的 Xenial 是存在的。不过没关系，因为我以前也是！首先你可以通读 [Ubuntu Wiki](https://wiki.ubuntu.com/ARM/RaspberryPi) 来了解它的核心内容，然后在树莓派上部署它。建议使用至少 8G 的 SD 卡。

## 安装 Swift 3.0

我们的团队致力于在 ARM 设备上使用 Swift，最近大家正在一台[树莓派 3](https://www.raspberrypi.org/products/raspberry-pi-3-model-b/) 上通过 [Jenkins](https://jenkins.io/) 来构建树莓派专用的二进制文件。看，下图就是构建设备！

![](http://dev.iachieved.it/iachievedit/wp-content/uploads/2016/06/fullsizerender_960-1.jpg)

*Swift 3.0 构建设备*

如果你好奇这一切是如何进行的，可以查看 [Jenkins 构建项目](http://swift-arm.ddns.net/job/Swift-3.0-Pi3-ARM-Incremental/)。坦率地说，我十分惊讶，因为它只花了 6 个小时就完成了 Swift 的编译。

现在可以开始折腾了。首先，在你的树莓派上下载 Swift 3.0 的构建包 (build artifact) ，并将其解压放置在某个目录中，然后像下面这样设置你的 `PATH` 值：

    shell
    cd $HOME
    wget http://swift-arm.ddns.net/job/Swift-3.0-Pi3-ARM-Incremental/16/artifact/swift-3.0-2016-07-19-RPi23-ubuntu16.04.tar.gz
    mkdir swift-3.0
    cd swift-3.0 && tar -xzf ../swift-3.0.tgz
    export PATH=$HOME/swift-3.0/usr/bin:$PATH

**注意：**把 Swift 3.0 放在 `$HOME` 并不是强制性的，我通常使用的路径是：`/opt/swift/swift-3.0`。

一切就绪，让我们马上来体验一下吧！

创建一个名为 `helloWorld.swift` 的文件：

    
    print("Hello, world!")

然后你可以使用 `swift helloWorld.swift` 语句来执行该文件，就像执行脚本一样：

    shell
    # swift helloWorld.swift
    Hello, world!

如果你下载了 `clang` 并对它进行了正确配置的话，也可以另辟蹊径，使用 `swiftc` 将上述文件编译为可执行文件：

    shell
    # swiftc helloWorld.swift
    # ./helloWorld
    Hello world!

倘若执行 `swiftc` 时失败并抛出` error: link command failed with exit code 127` 错误，则极有可能是因为你没有正确下载或配置 `clang`：

    shell
    sudo apt-get update
    sudo apt-get install -y libicu-dev
    sudo apt-get install -y clang-3.6
    sudo update-alternatives --install /usr/bin/clang clang /usr/bin/clang-3.6 100
    sudo update-alternatives --install /usr/bin/clang++ clang++ /usr/bin/clang++-3.6 100

接下来让我们再来看一些有趣的小花絮吧：

## 导入 Glibc!

swiftcat.swift:

    
    import Glibc
    
    guard Process.arguments.count == 2 else {
      print("Usage:  swiftcat FILENAME")
      exit(-1)
    }
    
    let filename = Process.arguments[1]
    
    let BUFSIZE = 1024
    var pp      = popen("cat " + filename, "r")
    var buf     = [CChar](repeating:0, count:BUFSIZE)
    
    while fgets(&buf, Int32(BUFSIZE), pp) != nil {
      print(String(cString:buf), terminator:"")
    }
    
    exit(0)

编译 (`swiftc swiftcat.swift`) 并执行 (`swiftcat`)！

## 桥接 C 程序

链接已编译对象文件也可以了！示例如下：

escapetext.c:

    c
    #include <string.h>
    #include <stdlib.h>
    #include <curl/curl.h>
    int escapeText(const char* text, char** output) {
      int rc = -1;
      CURL* curl = curl_easy_init();
      if (curl) {
        char* escaped = curl_easy_escape(curl, text, strlen(text));
        if (escaped) {
          *output = (char*)malloc(strlen(escaped) + 1);
          strcpy(*output, escaped);
          curl_free(escaped);
          rc = strlen(*output);
        }
      }
      return rc;
    }

escapetext.h:

    c
    int escapeText(const char* text, char** output);

    
    import Glibc
    
    guard Process.arguments.count == 2 else {
      print("Usage:  escapeswift STRING")
      exit(-1)
    }
    
    let string = Process.arguments[1]
    var buffer:UnsafeMutablePointer<Int8>? = nil
    
    let rc = escapeText(string, &buffer)
    
    guard rc > 0 else {
      print("Error escaping text")
      exit(-1)
    }
    
    if let escaped = buffer {
      let escapedString = String(cString:escaped)
      print("Escaped text:  " + escapedString)
    }
    
    exit(0)

编译并将所有文件链接在一起：

    shell
    # clang -c escapetext.c
    # swiftc -c escapeswift.swift -import-objc-header escapetext.h
    # swiftc escapeswift.o escapetext.o -o escapeswift -lcurl

然后运行：

    shell
    # ./escapeswift "foo > bar"
    Escaped text:  foo%20%3E%20bar

## Swift 包管理

除非你很享受写 makefile 和构建脚本 (相信我，的确有人是这样的)，不然你可以在这里使用 Swift Package Manager 来协助管理软件的包依赖。对于 Swift 3.0 引入的 SwiftPM，后面我们会写更多与其相关的内容，说起来，SwiftPM 提供了一个能够在 armv 7 设备上工作的版本，这实在是一件令人很振奋的事情。不妨试一试下面的代码：

    shell
    # mkdir finalCountdown && cd finalCountdown
    # swift package init --type executable
    Creating executable package: finalCountdown
    Creating Package.swift
    Creating .gitignore
    Creating Sources/
    Creating Sources/main.swift
    Creating Tests/

然后再将 `Sources/main.swift` 的内容替换为下面的代码：

    
    import Foundation
    import Glibc
    let thread = NSThread(){
      print("Entering thread")
      for i in (1...10).reversed() {
        print("\(i)...", terminator:"")
        fflush(stdout)
        sleep(1)
      }
      print("\nExiting thread")
      print("Done")
      exit(0)
    }
    thread.start()
    select(0, nil, nil, nil, nil)

现在，执行 `swift build` 来构建你的 finalCountdown 应用：

    shell
    # swift build
    Compile Swift Module 'finalCountdown' (1 sources)
    Linking .build/debug/finalCountdown
    # .build/debug/finalCountdown
    Entering thread
    10...9...8...7...6...5...4...3...2...1...
    Exiting thread
    Done

### moreswift

如果你对在 x86 与 armv 7 系统上运行 Swift 3.0 编写的应用还是一知半解的话，可以看一看 [moreswift](https://github.com/iachievedit/moreswift/tree/swift-3.0) 项目的 swift-3.0 分支。

## 这是什么版本？

当前的构建并非是针对 Swift 3.0 预览版进行的。如果需要验证与 swift 二进制文件相关联的 Git 哈希值，输入 `swift --version` 即可：

    shell
    # swift --version
    Swift version 3.0-dev (LLVM eb140647a6, Clang a9f2183da4, Swift bb43874ba1)

之后，你就可以直接在 Swift 仓库里类似 [https://github.com/apple/swift/tree/bb43874ba1](https://github.com/apple/swift/tree/bb43874ba1) 的 commit 记录中，查看以最后一份合并到该版本的 commit 开始的历史记录。

## 致谢

很多人都一直在努力将 Swift 引入到 Linux ARM 设备中。下面这份名单只提到了他们中很少的几个人。推荐你去访问他们的博客；这些博客蕴藏着很多宝贵的信息和学习经验。

- William Dillon ([@hpux735](https://twitter.com/hpux735)) [http://www.housedillon.com](http://www.housedillon.com)
- Ryan Lovelett ([@rlovelett](https://twitter.com/rlovelett)) [http://stackoverflow.com/users/247730/ryan](http://stackoverflow.com/users/247730/ryan)
- Brian Gesiak ([@modocache](https://twitter.com/rlovelett)) [http://modocache.io](http://modocache.io)
- [Karl Wagner](https://github.com/karwa) [http://www.springsup.com/](http://www.springsup.com/)
- [@tienex](https://twitter.com/tienex) [tienex](https://github.com/tienex)
- PJ Gray ([@pj4533](https://twitter.com/pj4533)) [Say Goodnight Software](http://saygoodnight.com/)
- Cameron Perry ([@mistercameron](@mistercameron)) [http://mistercameron.com](http://mistercameron.com)

请允许我再说一次，如果你有兴趣加入由一群 Swift 爱好者组成的 Slack 小组，务必发邮件到 **admin@iachieved.it**，我会邀请你加入！

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。