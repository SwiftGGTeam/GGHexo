title: "在 Swift 中截取 C 字符串"
date: 2016-02-26 09:00:00
tags: [Swift 入门]
categories: [iachieved]
permalink: swift-substring-on-a-c-string
keywords: c字符串截取,swift字符串
custom_title: 
description: 在Swift中c字符串截取字符串是很多人想体验的吧，下文就是篇优美的Swift C语言风格字符串中截取子串文章。

---
原文链接=http://dev.iachieved.it/iachievedit/swift-substring-on-a-c-string/?utm_source=rss&utm_medium=rss
作者=Joe
原文日期=2016-01-01
译者=星夜暮晨
校对=numbbbbb
定稿=Cee

<!--此处开始正文-->

Swift 中的字符串处理一直都在变化，一直不断发展。在研究 Swift 中某些字符串执行操作的演变过程中，我注意到了 Joel Spolsky 十几年前写的[这篇文章](http://local.joelonsoftware.com/wiki/Talk:Chinese_(Simplified))，他告诫我们所有人一定要顺应潮流，从一开始就要让我们的应用程序支持 [Unicode](https://zh.wikipedia.org/wiki/Unicode)。Swift 1.0 没有忽视这种请求，它确实让我们可以简单地使用范围 (Range) 这种「自然」的表达方式来提取子字符串。但是 Swift 2.0 却将其摒弃了，这使得 Stackoverflow 上赞数最高的[这个回答](http://stackoverflow.com/questions/24044851/how-do-you-use-string-substringwithrange-or-how-do-ranges-work-in-swift)变得毫无用处。

下面的代码无法正常工作，但是如果可以，那真是极好的：

```swift
var helloWorld = "Hello, world!"
let hello      = helloWorld[0...4]
print(hello)
```
<!--more-->

我的意思是，既然 Python 可以这样用：`hello = helloWorld[0:5]`，为什么在 Swift 中不可以这样用呢？

就像我们说的，Swift 2 很认真地听取了 Joel 在 2003 年提出的那些建议，我们所有人都（痛苦地）发现字符串完全变样了。[mikeash.com](https://www.mikeash.com/pyblog/friday-qa-2015-11-06-why-is-swifts-string-api-so-hard.html) 很好地总结了这些变化，因此对我来说，没有必要再去比较字符 (Character) 和字母 (Grapheme) 的区别。而当我「了解」到这点后，毫无疑问加重了我的记忆量。为了从一个（我已经知道）ASCII 编码的 `const char*`  C 语言风格字符串中截取子串，我需要努力记住那些需要调用的黑科技代码。因此，我不会费心费力地去记这些东西，而是把它们写在这里，不仅是为了我，也是为了大家。

### 简单的子串示例

我一直在寻找一种方法，能够在我的 Day-to-day Linux 任务中加入更多的 Swift 编程机会。我认为这是使用快速脚本 (quick script) 和面向 DevOps 的任务来替代 [其他](https://www.perl.org/) [编程](https://www.python.org/) [语言](https://www.ruby-lang.org/en/) 的绝佳机会。在这种情况下，我希望有一个快捷的方法能够打印出一个 Swift 开源项目的所有 git 修订版本 (revision)，下面是我的代码：

```swift
import Glibc
 
func getGitRevision(dirname:String) -> String {
  let BUFSIZE = 128
  let cwd     = String.fromCString(getcwd(nil, 0))!
  var rc      = chdir(dirname)
  
  guard rc == 0 else {
    return "ERROR"
  }
  
  var rev  = ""
  let pipe = popen("/usr/bin/git rev-parse HEAD", "r")
  var buf  = [CChar](count:BUFSIZE, repeatedValue:CChar(0))
  while fgets(&buf, Int32(BUFSIZE), pipe) != nil {
    rev = String.fromCString(buf)!
  }
  rev = rev[rev.startIndex...rev.startIndex.advancedBy(9)]
 
  chdir(cwd)
 
  return rev
}
 
let dirs = ["swift", "llvm", "clang", "lldb", "cmark", "llbuild", "swiftpm", "swift-corelibs-xctest", "swift-corelibs-foundation", "swift-integration-tests"]
 
for dir in dirs {
  let rev = getGitRevision(dir)
  print("\(dir):\(rev)")
}
```

我用 `rev = rev[rev.startIndex...rev.startIndex.advancedBy(9)]` 来获取 Git 修订版本哈希值的前 10 个字符，这实在是太啰嗦了，但是如果你正在处理的是 C 语言风格的字符串，那它可以很好地完成任务。

### 扩展

幸运的是，Swift 支持扩展，这个绝佳的特性允许你向不是你写的、并且无法访问源代码的类中添加一些方法。很多人在 Gist 上发布了类似的扩展代码，给访问子字符串添加一个小小的语法糖：

``` swift
extension String {
  subscript (r: Range<Int>) -> String {
    get {
      let startIndex = self.startIndex.advancedBy(r.startIndex)
      let endIndex   = self.startIndex.advancedBy(r.endIndex)
            
      return self[Range(start: startIndex, end: endIndex)]
    }
  }
}
```

通过我们的扩展，我们就可以这样写：

``` swift
let helloWorld = "Hello, world!"
var hello      = helloWorld[0...4]
 
print(hello)
```

生活变得无比美好，不是么？