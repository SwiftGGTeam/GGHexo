手把手教你解决 invalid inferred toolchain "

> 作者：iAchieved.it，[原文链接](http://dev.iachieved.it/iachievedit/error-invalid-inferred-toolchain/)，原文日期：2016-07-09
> 译者：[Joy](undefined)；校对：[冬瓜](http://www.desgard.com/)；定稿：[CMB](https://github.com/chenmingbiao)
  









![](http://dev.iachieved.it/iachievedit/wp-content/uploads/2016/06/swift-og-1.png)

当你遇到 `error:Invalid inferred toolchain` ，肯定是一脸懵逼，不知道发生了什么！



你已经在你新的 `Ubuntu` 系统上安装好了 [swiftenv](https://github.com/kylef/swiftenv)，并用它安装了一个 `Swift` 的版本。但是当你在机器上运行 `Swift` 的代码时，却得到这样的提示： `error: invalid inferred toolchain` 。看起来是令人不愉快的。

不过还好，这个问题解决起来很简单，你只需要安装 `clang` 编译器就可以了

    bash
    sudo apt-get install clang-3.6

    bash
    sudo update-alternatives --install /usr/bin/clang clang /usr/bin/clang-3.6 100

    bash
    sudo update-alternatives --install /usr/bin/clang++ clang++ /usr/bin/clang++-3.6 100

在这个例子中，我们使用的是 `clang-3.6` ，但是 3.6 及其以上的版本都应该是可用的。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。