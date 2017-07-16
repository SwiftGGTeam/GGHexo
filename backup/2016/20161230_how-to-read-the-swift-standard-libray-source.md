title: "如何阅读 Swift 标准库中的源码"
date: 2016-12-30
tags: [Swift]
categories: [Ole Begemann]
permalink: how-to-read-the-swift-standard-libray-source
keywords: 标准库 源码
custom_title: 
description: 本文描述如何阅读Swift标准库中的源码

---
原文链接=https://oleb.net/blog/2016/10/swift-stdlib-source/
作者=Ole Begemann
原文日期=2016-10-28
译者=X140Yu
校对=walkingway
定稿=CMB

<!--此处开始正文-->

**在进行完 GYP 预处理后，阅读 Swift 标准库源码的~~最简单的~~一种方式是执行一次完整的 Swift 编译。（另一种是写一小段 shell 脚本。可以看下面的更新）**

如果你想要开始阅读 Swift 源码，那它的标准库应该是首先开始阅读的地方。标准库中的代码是和每一个使用 Swift 的开发者都息息相关的，如果你也曾经对某个 API 的表现和性能有过怀疑，那么直接阅读对应的源码会是解决问题最快的方式。

标准库也是 Swift 项目中最容易接触的地方。其中一点理由是，它由 Swift 写的，而不是 C++。因为你每天都用它，所以对它的 API 也非常熟悉。这就意味着，在源码中找到你想要的那段代码不是特别困难。如果你只是没有目标随便看看，那么在源码中你可能会发现[一](https://oleb.net/blog/2016/09/playground-print-hook/ "_playgroundPrintHook")或者这[两](https://oleb.net/blog/2016/10/swift-array-of-c-strings/ "Passing an Array of Strings from Swift to C")块金子。

<!--more-->

## 在哪里能找到标准库的源码？

标准库的代码在 [`stdlib/public/core`](https://github.com/apple/swift/tree/master/stdlib/public/core)，GitHub 上的 [Swift 仓库中](https://github.com/apple/swift)。你可以在里面找到所有 public types，protocols 和 functions。你可以在线或者把代码 clone 到本地阅读。但是，一个比较复杂的地方在于，大约 1/3 的文件都是 `.swift.gyb` 的后缀，如果你打开其中一个文件，例如：[`FixedPoint.swift.gyb`](https://github.com/apple/swift/blob/master/stdlib/public/core/FixedPoint.swift.gyb)（Int 类型被定义的地方），你会发现一种和 Swift 混合在一起的模版语言：GYB。

> gyb 代表 Generate Your Boilerplate（生成你的样板文件）。 它是由 Swift 团队开发的预处理的一个玩意。如果需要编译十个非常相似的 `Int`，那就得把相同的代码复制粘贴十次。如果你打开某个 gyb 文件，你会发现其中大部分都是 Swift 的代码，但是也有一些是 Python 代码。这个预处理器在 Swift 的代码仓库中的 [`utils/gyb`](https://github.com/apple/swift/blob/master/utils/gyb)，虽然大部分的代码在 [`utils/gyb.py`](https://github.com/apple/swift/blob/master/utils/gyb.py)。
> 
> — [Brent Royal-Gordon](https://lists.swift.org/pipermail/swift-users/Week-of-Mon-20151207/000226.html)

我们不希望看到 [太多的 GYB](https://twitter.com/gottesmang/status/787493623533215745)，而更想要 Swift 代码，因为它[更具有表达性](https://twitter.com/gottesmang/status/787493919072235520)，但是现在，我们不得不面对它们的混和。

## 处理 GYB

如果你只想要阅读源码（而不是向 Swift 贡献代码），GYB 则弊大于利。那么怎么来预处理这些文件呢？你可以直接运行 `gyb` 脚本，但是它依赖于一个被 build 脚本创建的特殊环境。最好的方式是执行一次完整的 Swift build。也许对于阅读源码来说，build 一次可能会有点过了，但是我发现 build 以后，源码阅读起来会更容易一些。

**更新：** [Toni Suter 指出](https://twitter.com/tonisuter/status/792325666591088668) `gyb` 的脚本只依赖于一个你可以更改的变量（64-bit 和 32-bit 差别），如果你只想要处理 gyb, [这个小脚本](https://gist.github.com/tonisuter/e47267a25b3dcc90fe75a24d3ed2063a)比完整编译一次 Swift 要好很多。

```bash
#!/bin/bash
for f in `ls *.gyb`
do
    echo "Processing $f"
    name=${f%.gyb}
    ../../../utils/gyb -D CMAKE_SIZEOF_VOID_P=8 -o $name $f --line-directive ""
done
```

它会把所有的 `.gyb` 文件处理完毕后放到相同的位置并去掉 `.gyb` 后缀。去除 `--line-directive ""` 在处理完毕的文件中添加 source location 的注释（就像 Swift build 中处理的一样）。

## 从源码编译 Swift

环境的搭建可以阅读 Swift 仓库中的 [readme](https://github.com/apple/swift/blob/master/README.md)。 如果在 Mac 机器上，按照下面的步骤进行操作（使用 Homebrew 安装各种依赖），但是别忘记检查这些步骤的正确性：

```bash
# Install build tools
brew install cmake ninja
# Create base directory
mkdir swift-source
cd swift-source
# Clone Swift
git clone https://github.com/apple/swift.git
# Clone dependencies (LLVM, Clang, etc.)
./swift/utils/update-checkout --clone
```

最后一句命令会把 build Swift 需要的其它部分的 repo 给 clone 下来，比如 LLVM，Clang，LLDB 等等。就像对于 Linux 的 Foundation 和 libdispatch 模块一样。在这一步过后，你的 `swift-source` 文件夹看起来是这样：

```bash
du -h -d 1
250M	./clang
4,7M	./cmark
 47M	./compiler-rt
 15M	./llbuild
197M	./lldb
523M	./llvm
221M	./swift
 26M	./swift-corelibs-foundation
7,8M	./swift-corelibs-libdispatch
1,1M	./swift-corelibs-xctest
316K	./swift-integration-tests
960K	./swift-xcode-playground-support
7,0M	./swiftpm
1,3G	.
```

现在就可以开始运行 build 脚本了，它会先开始 build LLVM，然后构建 Swift：

```bash
./swift/utils/build-script -x -R
```

参数是很重要的：

* `-x` 会生成一个 Xcode project，你就可以在这个 project 中使用 Xcode 阅读源码了。
* `-R` 代表 release 模式的编译。它会比 debug 模式更快，在我 2.6 GHz 的 core i7 2013 电脑上，25 分 vs 70 分。占用的空间也更少，2GB vs 24GB。

## Orienting yourself

当 build 构建完成后，你可以在 `./build/Xcode-ReleaseAssert/swift-macosx-x86_64/` 的子文件夹中 `swift-source` 找到结果。其中会有一个 `Swift.xcodeproj` Xcode 项目，已经处理好的标准库代码在 `./stdlib/public/code/8/` 中。注意，这个文件夹中只有从 .gyb 文件处理过来的文件，之前以 `.swift` 结尾的文件还在原来的位置。

不幸的是, 在 Xcode 中使用 *Open Quickly* (⇧⌘O) [打不开特定的 API](https://twitter.com/UINT_MIN/status/792101106495008768). 我通常使用 *Find in Project* (⇧⌘F) 来进行导航。如果你使用只出现在函数定义时的字符串来搜索，那就很容易搜索到了。比如要搜索 `print` 函数的定义，搜索 “func print(“ 而不是 “print”。

你也可以运行 `swift` REPL 或者 `swiftc` 编译器了。它们都在 `./Release/bin/` 中。如果还想测试一些之前在 release 中出现，但是在 master 中已经被修复的 bug，就会很方便。

# 更新

如果你想在以后更新本地的 clone，重新运行 `update-checkout` 脚本，并且 rebuild:

```bash
./swift/utils/update-checkout
./swift/utils/build-script -x -R

```
这些都是增量编译，比第一次要快得多。

# 切换到指定的版本

如果你想要验证一个在生产环境中已经使用的 Swift 特定版本 API 的表现，你就需要查看那个版本的 Swift 代码，而不是当前 *master* 分支。但是简单地切换分支并不能解决问题，因为如果一些依赖的版本对不上的话，编译是会失败的。

`update-checkout` 脚本能够让你指定一个特定的 tag 或者 branch。它会帮你切换所有依赖的版本：

```bash
# Either
./swift/utils/update-checkout --tag swift-3.0-RELEASE
# or
./swift/utils/update-checkout --scheme swift-3.0-branch
```

*swift-3.0-RELEASE* tag 和 *swift-3.0-branch* branch 的区别是，tag 相当于一个 mailstone，代表 Swift 的某个特定的 release 分支。然而分支是会伴随着 bug 修复和功能改进不断更新的。现在来看，在官方 release Xcode 8.1 的 Swift 3.0.1 时，*swift-3.0-branch* 分支已经包含了一些 Swift 3.0.2 中的修复。

不幸的是，我发现 `update-checkout --scheme` 的命令非常脆弱（`--tag` 在我看来能好一些）。这个脚本会对代码进行 [rebase](https://git-scm.com/docs/git-rebase)  操作，并且切换到指定的分支，这会在子项目中带来合并冲突，然而我并没有对代码作出任何更改。我不明白为什么这个脚本会这样。