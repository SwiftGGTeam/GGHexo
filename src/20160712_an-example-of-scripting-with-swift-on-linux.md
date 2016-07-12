title: "Linux 上的一个 Swift 脚本示例"
date: 2016-07-12 09:30:00
tags: [Swift 跨平台]
categories: [iAchieved.it]
permalink: an-example-of-scripting-with-swift-on-linux
keywords: linux swift开发,swift脚本
custom_title: 
description: 在 Linux 上怎么用 Swift 来写脚本呢，本文就来举例实战下 Swift 在 Linux 上写个脚本。

------
原文链接=http://dev.iachieved.it/iachievedit/an-example-of-scripting-with-swift-on-linux/?utm_source=rss&utm_medium=rss
作者=Joe
原文日期=2016/06/27
译者=ahfepj
校对=saitjr
定稿=Cee

<!--此处开始正文-->

如果你在推特上关注了我们（[@iachievedit](https://twitter.com/iachievedit)）你就知道[我们不仅做了很多 Swift 开源项目](http://swift-arm.ddns.net/)，还有做了一些操作系统和架构。我们决定做这个项目没有特别的原因，但是看着各个版本的 git 仓库最终整合一个工具感觉真是太棒了。

我们很高兴最终 Swift 能够取代 Linux 上的其他脚本语言（比如名字读起来像 Bython 和 Buby 的两门语言），对我们来说是时候写脚本了（用 Swift）。

<!--more-->

这里有一些注意事项：

* 我们使用了一个 `String` 的 `subscript` 扩展，由于某些原因它可能不会是核心语言的一部分。
* 我们的版本里的 exec 在其他脚本语言里是反引号（`` output = `ls` ``），我们需要执行命令并读取输出。
* 当然还可以做更多优化和精简。

掌握了这些之后，下面就是 `swiftrevs.swift`：

```swift
import Glibc

extension String {
  subscript (r: CountableClosedRange<Int>) -> String {
    get {
      let startIndex = self.characters.index(self.characters.startIndex, offsetBy:r.lowerBound)
      let endIndex   = self.characters.index(self.characters.startIndex, offsetBy:r.upperBound)
      return self[startIndex..<endIndex]
    }
  }
}

func exec(_ command:String) -> String {
  let BUFSIZE = 128
  let pipe = popen(command, "r")
  var buf  = [CChar](repeating:CChar(0), count:BUFSIZE)
  var output:String = ""
  while fgets(&buf, Int32(BUFSIZE), pipe) != nil {
    output = String(cString:buf)
  }
  return output
}

func gitRevision() -> String {
  return exec("/usr/bin/git rev-parse HEAD")[0...9]
}

func gitFetchURL() -> String {
  return exec("/usr/bin/git remote show origin -n|grep Fetch| echo -n `cut --characters=14-`")
}

func gitBranch() -> String {
  return exec("/usr/bin/git branch | echo -n `cut --characters=2-`")
}

let dirs = ["swift", "llvm", "clang", "lldb", "compiler-rt", "cmark", "llbuild", "swiftpm", "swift-corelibs-xctest", "swift-corelibs-foundation", "swift-integration-tests", "swift-corelibs-libdispatch"]

for dir in dirs {
  let cwd     = String(cString:getcwd(nil, 0))
  let rc      = chdir(dir) // pushd
  guard rc == 0 else {
    continue
  }
  let fetch  = gitFetchURL()
  let rev    = gitRevision()
  let branch = gitBranch()
  print("\(dir),\(fetch),\(branch),\(rev)")
  chdir(cwd) // popd
}
```

我们按照如下方法来使用：

```bash
# swift swiftrevs.swift
swift,https://github.com/apple/swift.git,master,cf3fdff04
llvm,https://github.com/apple/swift-llvm.git,stable,8d0086ac3
clang,https://github.com/apple/swift-clang.git,stable,460d629e8
lldb,https://github.com/apple/swift-lldb.git,master,da120cf91
compiler-rt,https://github.com/apple/swift-compiler-rt.git,stable,9daa1b32c
cmark,https://github.com/apple/swift-cmark.git,master,5af77f3c1
llbuild,https://github.com/apple/swift-llbuild.git,master,7aadcf936
swiftpm,https://github.com/apple/swift-package-manager.git,master,423c2a1c8
swift-corelibs-xctest,https://github.com/apple/swift-corelibs-xctest.git,master,03905f564
swift-corelibs-foundation,https://github.com/apple/swift-corelibs-foundation.git,master,4c15543f8
swift-integration-tests,https://github.com/apple/swift-integration-tests.git,master,4eda8055a
swift-corelibs-libdispatch,https://github.com/apple/swift-corelibs-libdispatch.git,master,e922531c2
```

当然，这都是在满足构建 Swift 的仓库目录下运行的，如果你有兴趣学习为 X86 或者 ARM 设备构建 Swift ，请查阅我们的 package-swift 仓库。其中不仅包含 `swiftrevs.swift` ，还有几个能无痛构建 Swift（和 REPL、Foundation、Swift 包管理器）的脚本。