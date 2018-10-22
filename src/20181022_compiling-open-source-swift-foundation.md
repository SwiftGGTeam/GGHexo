title: "编译开源 Swift Foundation 库"
date: 2018-10-22
tags: [Swift, iOS]
categories: [iAchieved.it]
permalink: compiling-open-source-swift-foundation
keywords: Swift
custom_title: "编译开源 Swift Foundation 库"
description: 这是一篇关于编译 Swift 开源的 Foundation 库的文章

---

原文链接=http://dev.iachieved.it/iachievedit/compiling-open-source-swift-foundation/
作者=iAchieved.it 
原文日期=2016-06-30
译者=rsenjoyer
校对=numbbbbb,智多芯
定稿=Forelax


<!--此处开始正文-->

![](https://ws1.sinaimg.cn/large/006tNbRwgy1fuksdkfewij306o06omx6.jpg)

我最近在开源的 [Swift Foundation](https://github.com/apple/swift-corelibs-foundation) 中遇到了 `NSThread` 实现的问题。如果不是尝试在树莓派 3 上运行代码，我也许就发现不了这个问题：

```swift
import Foundation
import Glibc
 
var counter = 0
while true {
  sleep(2)
  counter = counter + 1
  let t = Thread(){
    print("STARTED:\(counter)")
    sleep(1)
    print("EXIT:\(counter)")
  }
  print("START:\(counter)")
  t.start()
}

```
我所期望的是每 2 秒都会创建并销毁一个线程。不幸的是在大约启动 230 个线程之后，系统资源已经耗尽，不再有新的线程被创建。解决的方式正如 [SR-1908](https://bugs.swift.org/browse/SR-1908) 所提到的，初始化具有系统范围的分离状态的线程

<!--more-->


```swift
public init(_ main: (Void) -> Void) {
  _main = main
  let _ = withUnsafeMutablePointer(&_attr) { attr in
    pthread_attr_init(attr)
    pthread_attr_setscope(attr，Int32(PTHREAD_SCOPE_SYSTEM))
    pthread_attr_setdetachstate(attr，Int32(PTHREAD_CREATE_DETACHED))
  }
}

```
[Philippe Hausler](https://github.com/phausler) 在 SR-1908 中提出了解决方案。正巧我有个树莓派 3 可以实现和测试该方案。

## 针对 Foundation 的构建

如果你阅读了 [开源库 Foundation](https://github.com/apple/swift-corelibs-foundation) 的 [新手入门文档](https://github.com/apple/swift-corelibs-foundation/blob/master/Docs/GettingStarted.md)，你就会知道，它建议在构建 Foundation 之前，首先需要构建 Swift，clang 和 llvm。如果可以在一个有大量的 CPU 和快速磁盘的服务器上工作，我丝毫不介意按照文档一步步构建。然而树莓派 3 与其他老式的设备一样，性能提升有点慢。我也可以考虑交叉编译 Swift，但我还没有足够时间来解决交叉编译带来的问题（如果你曾经使用过交叉编译环境，你一定知道它需要很长时间来做相关的配置）。

我们所需要的是充分利用已有的构建环境并自行编译 Foundation。事实证明是可以做到的，不然的话，我们也不会有这篇博客了。

下面是你所需要的准备操作（无论你是在 x86 服务器上还是在像 BeagleBone 或树莓派的 ARM 的计算机上）：

+ 全量构建 `swiftc`，通常位于 `build/buildbot_linux/swift-linux-armv7/bin` 目录
+ 全量构建 `swift`，同样位于 `build/buildbot_linux/swift-linux-armv7/bin` 目录
+ 全量构建 `clang`(从开源库中构建)，位于 `build/buildbot_linux/llvm-linux-armv7/bin` 目录中

我希望提供各种已经编译过的“工具链”，但是现在你必须首先构建自己的工具链。然后你就可以自己构建 Foundation 了。

现在，让我们来看看如何使用它来测试 Foundation 上的内容。请注意，我们克隆的是我们自己 fork 的 swift-corelibs-foundation 的分支。如果你打算给上游开源库（即 Apple 开源库）提交 PR，这一点非常的重要。

```shell
# git clone https://github.com/iachievedit/swift-corelibs-foundation
# export PREBUILT_ROOT=/root/workspace/Swift-3.0-Pi3-ARM-Incremental/build/buildbot_linux/
# SWIFTC=$PREBUILT_ROOT/swift-linux-armv7/bin/swiftc \
CLANG=$PREBUILT_ROOT/llvm-linux-armv7/bin/clang      \
SWIFT=$PREBUILT_ROOT/swift-linux-armv7/bin/swift     \
SDKROOT=$PREBUILT_ROOT/swift-linux-armv7             \
BUILD_DIR=build ./configure Debug
# /usr/bin/ninja
...
[290/290] Link: build/Foundation/libFoundation.so

```

首先，我们将环境变量 `PREBUILT_ROOT` 设置到预构建 Swift 及相关工具所在的位置，还可以在下一步操作前配置 `./configure` 为 `Debug` 模式（你也可以配置为 `Release`）。我们还需要将环境变量 `SWIFTC`，`CLANG`，`SWIFT` 和 `SDKROOT` 配置脚本指向我们的“工具链”。最后，环境变量 `BUILD_DIR` 设置为所有中间件和最终输出（libFoundation.so）的放置位置。

注意：也许有时你会惊讶于评论中的某些内容。你的 `PREBUILT_ROOT` 是你工具链的位置。不要期望在 `/root/workspace/Swift-3.0-Pi3-ARM-Incremental` 上找到你系统上的任何内容！

最后，执行 `/usr/bin/ninja` 来运行我们的构建。一旦构建结束后，在 `build/Foundation/` 目录中会有一个 `libFoundation.so` 共享库。
要使用已安装的 Swift 来测试它，只需将 `libFoundation.so` 复制到 `$YOUR_SWIFT_ROOT/usr/lib/swift/linux/ libFoundation.so`。

## 运行测试用例

你可以通过向 `./configure` 添加 `-DXCTEST_BUILD_DIR` 参数来运行 Foundation 测试套件。

```shell

# export PREBUILT_ROOT=/root/workspace/Swift-3.0-Pi3-ARM-Incremental/build/buildbot_linux/
# SWIFTC=$PREBUILT_ROOT/swift-linux-armv7/bin/swiftc \
CLANG=$PREBUILT_ROOT/llvm-linux-armv7/bin/clang      \
SWIFT=$PREBUILT_ROOT/swift-linux-armv7/bin/swift     \
SDKROOT=$PREBUILT_ROOT/swift-linux-armv7             \
BUILD_DIR=build ./configure Debug                    \
-DXCTEST_BUILD_DIR=$PREBUILT_ROOT/xctest-linux-armv7
# /usr/bin/ninja test
[4/4] Building Tests
**** RUNNING TESTS ****
execute:
LD_LIBRARY_PATH= build/TestFoundation/TestFoundation
**** DEBUGGING TESTS ****
execute:
LD_LIBRARY_PATH= lldb build/TestFoundation/TestFoundation

```

运行测试需要为 `LD_LIBRARY_PATH` 提供两个路径：`libXCTest.so` 共享库和“library under test”的路径。
如果我们按照上述步骤操作，`libFoundation.so` 就一定位于 `./build/Foundation` 目录中。

```shell
# LD_LIBRARY_PATH=./build/Foundation:$PREBUILT_ROOT/xctest-linux-armv7 ./build/TestFoundation/TestFoundation
...
Test Suite 'All tests' passed at 03:16:45.315
     Executed 483 tests, with 0 failures (0 unexpected) in 37.621 (37.621) seconds

```

### 结束语

需要强调的是使用这种技术，你需要一个“构建工具链”，它包含 Swift，clang 和 llvm。此外，您的工具链最后一次构建到您尝试自行构建 Foundation 的时间间隔越长，Foundation 所依赖的语言特性在构建工具链时不存在的风险就越高。但如果您决定开始使用 Foundation，请首先构建完整的 Swift 工具链并保存构建目录以使用上述技术。

祝你好运！
