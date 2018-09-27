title: "使用 C-Reduce 进行调试"
date: 2018-09-27
tags: [Debug, C-Reduce]
categories: [Mike Ash]
permalink: debugging-with-c-reduce

---
原文链接=https://www.mikeash.com/pyblog/friday-qa-2018-06-29-debugging-with-c-reduce.html
作者=Mike Ash
原文日期=2018-06-29
译者=BigNerdCoding
校对=pmst,numbbbbb
定稿=Forelax

<!--此处开始正文-->

调试复杂问题本身就并不轻松，如果还没有足够的上下文和大致方向的话那就是一件非常困难的事。所以对代码进行精简缩小调试范围也就变成了一种常见的行为。不过与繁杂的手动简化相比，执行自动化处理程序明显更容易发挥计算机自身的优势。C-Reduce 正是为此而生，它能自动对原始代码进行简化操作输出一个简化的调试友好版本。下面我们看看如何使用该自动化程序。

<!--more-->

## 概述

C-Reduce 代码基于两个主要思想。

首先，C-Reduce 通过删除相关代码行或者将 token 重命名为更短的版本等手段，将某些原始代码转化为一个简化版本。

其次，对简化结果进行检验测试。上面的代码简化操作是盲目的，因此经常产生不含待跟踪错误甚至是根本无法编译的简化版本。所以在使用 C-Reduce 时，除原始代码外还需要一个用来测试简化操作是否符合特定“预期”的脚本程序。而“预期”的标准则由我们根据实际情况进行设定。例如，如果你想定位到某个 bug 那么“预期”就意味着简化版本包含与原始代码一致的错误。你可以利用脚本程序写出任何你想要的“预期”标准，C-Reduce 会依据该脚本程序确保简化版本符合预先定义的行为。

## 安装

C-Reduce 程序的依赖项非常多，安装也很复杂。好在有 Homebrew 的加持，我们只需输入以下命令即可：

```bash
brew install creduce
```

如果你想手动安装的话，可以参照该安装 [指南](https://github.com/csmith-project/creduce/blob/master/INSTALL)。

## 简易示例

想出一个小的示例代码解释 C-Reduce 是很困难的，因为它的主要目的是从一个大的程序简化出一个小型示例。下面是我竭尽全力想出来的一个简单 C 程序代码，它会产生一些难以理解的编译警告。

```bash
$ cat test.c
#include <stdio.h>

struct Stuff {
    char *name;
    int age;
}

main(int argc, char **argv) {
    printf("Hello, world!\n");
}

$ clang test.c
test.c:3:1: warning: return type of 'main' is not 'int' [-Wmain-return-type]
struct Stuff {
^
test.c:3:1: note: change return type to 'int'
struct Stuff {
^~~~~~~~~~~~
int
test.c:10:1: warning: control reaches end of non-void function [-Wreturn-type]
}
^
2 warnings generated.
```

从警告中我们知道 `struct` 和 `main` 代码存在某种问题！至于具体问题是什么，我们可以在简化版本中仔细分析。

C-Reduce 能轻松的将程序精简到远超我们想象的程度。所以为了控制 C-Reduce 的精简行为确保简化操作符合特定预期，我们将编写一个小的 shell 脚本，编译该段代码并检查警告信息。在该脚本中我们需要匹配编译警告并拒绝任何形式编译错误，同时我们还需要确保输出文件包含 `struct Stuff`，详细脚本代码如下：

```bash
#!/bin/bash

clang test.c &> output.txt
grep error output.txt && exit 1
grep "warning: return type of 'main' is not 'int'" output.txt &&
grep "struct Stuff" output.txt
```

首先，我们对简化代码进行编译并将输出重定向到 `output.txt`。如果输出文件包含任何 "error" 字眼则立即退出并返回状态码 1。否则脚本将会继续检查输出文本是否包含特定警告信息和文本 `struct Stuff`。当 `grep` 同时成功匹配上述两个条件时，会返回状态码 0；否则就退出并返回状态码 1。状态码 0 表示符合预期而状态码 1 则表示简化的代码不符合预期需要重新简化。

接下来我们运行 C-Reduce 看看效果：

```bash
$ creduce interestingness.sh test.c 
===< 4907 >===
running 3 interestingness tests in parallel
===< pass_includes :: 0 >===
(14.6 %, 111 bytes)

...lots of output...

===< pass_clex :: rename-toks >===
===< pass_clex :: delete-string >===
===< pass_indent :: final >===
(78.5 %, 28 bytes)
===================== done ====================

pass statistics:
  method pass_balanced :: parens-inside worked 1 times and failed 0 times
  method pass_includes :: 0 worked 1 times and failed 0 times
  method pass_blank :: 0 worked 1 times and failed 0 times
  method pass_indent :: final worked 1 times and failed 0 times
  method pass_indent :: regular worked 2 times and failed 0 times
  method pass_lines :: 3 worked 3 times and failed 30 times
  method pass_lines :: 8 worked 3 times and failed 30 times
  method pass_lines :: 10 worked 3 times and failed 30 times
  method pass_lines :: 6 worked 3 times and failed 30 times
  method pass_lines :: 2 worked 3 times and failed 30 times
  method pass_lines :: 4 worked 3 times and failed 30 times
  method pass_lines :: 0 worked 4 times and failed 20 times
  method pass_balanced :: curly-inside worked 4 times and failed 0 times
  method pass_lines :: 1 worked 6 times and failed 33 times

		 ******** .../test.c ********

struct Stuff {
} main() {
}
```

最终我们得到一个符合预期的简化版本，并且会覆盖原始代码文件。所以在使用 C-Reduce 时需要注意这一点！一定要在代码的副本中运行 C-Reduce 进行简化操作，否则可能对原始代码造成不可逆更改。

该简化版本使代码问题成功暴露了出来：在 `struct Stuff` 类型声明末尾忘记加分号，另外 `main` 函数没有明确返回类型。这导致编译器将 `struct Stuff` 错误的当作了返回类型。而 `main` 函数必须返回 `int` 类型，所以编译器发出了警告。

## Xcode 工程

对于单个文件的简化来说 C-Reduce 非常棒，但是更复杂场景下效果如何呢？我们大多数人都有多个 Xcode 工程，那么如何简化某个 Xcode 工程呢？

考虑到 C-Reduce 的工作方式，简化 Xcode 工程并不简单。它会将需要简化的文件拷贝到一个目录中，然后运行脚本。这样虽然能够同时运行多个简化任务，但如果需要其他依赖才能让它工作，那么就可能无法简化。好在可以在脚本中运行各种命令，所以可以将项目的其余部分复制到临时目录来解决这个问题。

我使用 Xcode 创建了一个标准的 Objective-C 语言的 Cocoa 应用，然后对 `AppDelegate.m` 进行如下修改：

```objc
#import "AppDelegate.h"

@interface AppDelegate () {
    NSWindow *win;
}

@property (weak) IBOutlet NSWindow *window;
@end

@implementation AppDelegate

- (void)applicationDidFinishLaunching: (NSRect)visibleRect {
    NSLog(@"Starting up");
    visibleRect = NSInsetRect(visibleRect, 10, 10);
    visibleRect.size.height *= 2.0/3.0;
    win = [[NSWindow alloc] initWithContentRect: NSMakeRect(0, 0, 100, 100) styleMask:NSWindowStyleMaskTitled backing:NSBackingStoreBuffered defer:NO];
	
    [win makeKeyAndOrderFront: nil];
    NSLog(@"Off we go");
}

@end
```

这段代码会让应用在启动时崩溃：

```
* thread #1, queue = 'com.apple.main-thread', stop reason = EXC_BAD_ACCESS (code=EXC_I386_GPFLT)
	  * frame #0: 0x00007fff3ab3bf2d CoreFoundation`__CFNOTIFICATIONCENTER_IS_CALLING_OUT_TO_AN_OBSERVER__ + 13
```

上面的内容并不是一个非常有用的调用栈信息。虽然我们可以通过调试追溯问题，但是这里我们尝试使用 C-Reduce 来进行问题定位。

这里的 C-Reduce 预期定义将包含更多的内容。首先我们需要给应用设置运行的超时时间。我们会在运行时进行崩溃捕获操作，如果没有发生崩溃则保持应用正常运行直到触发超时处理而退出。下面是一段网上随处可见的 `perl` 脚本代码：

```perl
function timeout() { perl -e 'alarm shift; exec @ARGV' "$@"; }
```

紧接着我们需要拷贝该工程文件：

```bash
cp -a ~/Development/creduce-examples/Crasher .
```

然后将修改后的 `AppDelegate.m` 文件拷贝到合适的路径下。（注意：如果文件发现合适简化版本，C-Reduce 会将文件复制回来，所以一定要在这里使用 `cp` 而不是 `mv`。使用 `mv` 会导致一个奇怪的致命错误。）

```bash
cp AppDelegate.m Crasher/Crasher
```

接下来我们切换到 `Crasher` 目录执行编译命令，并在发生错误时退出。

```bash
cd Crasher
xcodebuild || exit 1
```

如果编译成功，则运行应用并且设置超时时间。我的系统对编译项进行了设置，所以 `xcodebuild` 命令会将编译结果存放着本地 `build` 目录下。因为配置可能存在差异，所以你首先需要自行检查。如果你将配置设为共享构建目录的话，那么需要在命令行中增加 `—n 1` 来禁用 C-Reduce 的并发构建操作。

```bash
timeout 5 ./build/Release/Crasher.app/Contents/MacOS/Crasher
```

如果应用发生崩溃的话，那么会返回特定状态码 139 。此时我们需要将其转化为状态码 0 ，其它情形统统返回状态码 1。

```bash
if [ $? -eq 139 ]; then
    exit 0
else
    exit 1
fi
```

紧接着，我们运行 C-Reduce：

```bash
$ creduce interestingness.sh Crasher/AppDelegate.m
...
(78.1 %, 151 bytes)
===================== done ====================

pass statistics:
  method pass_ints :: a worked 1 times and failed 2 times
  method pass_balanced :: curly worked 1 times and failed 3 times
  method pass_clex :: rm-toks-7 worked 1 times and failed 74 times
  method pass_clex :: rename-toks worked 1 times and failed 24 times
  method pass_clex :: delete-string worked 1 times and failed 3 times
  method pass_blank :: 0 worked 1 times and failed 1 times
  method pass_comments :: 0 worked 1 times and failed 0 times
  method pass_indent :: final worked 1 times and failed 0 times
  method pass_indent :: regular worked 2 times and failed 0 times
  method pass_lines :: 8 worked 3 times and failed 43 times
  method pass_lines :: 2 worked 3 times and failed 43 times
  method pass_lines :: 6 worked 3 times and failed 43 times
  method pass_lines :: 10 worked 3 times and failed 43 times
  method pass_lines :: 4 worked 3 times and failed 43 times
  method pass_lines :: 3 worked 3 times and failed 43 times
  method pass_lines :: 0 worked 4 times and failed 23 times
  method pass_lines :: 1 worked 6 times and failed 45 times

******** /Users/mikeash/Development/creduce-examples/Crasher/Crasher/AppDelegate.m ********

#import "AppDelegate.h"
@implementation AppDelegate
- (void)applicationDidFinishLaunching:(NSRect)a {
    a = NSInsetRect(a, 0, 10);
    NSLog(@"");
}
@end
```

我们得到一个极其精简的代码。虽然 C-Reduce 没有移除 `NSLog` 那行代码，但是崩溃看起来并不是它引起的。所以此处导致崩溃的代码只能是 `a = NSInsetRect(a, 0, 10);` 这行代码。通过检查该行代码的功能和使用到的变量，我们能发现它使用了一个 `NSRect` 类型的变量而 `applicationDidFinishLaunching` 函数的入参实际上并不是该类型。

```objc
- (void)applicationDidFinishLaunching:(NSNotification *)notification;
```

因此该崩溃应该是由于类型不匹配导致的错误引起的。

因为编译工程的耗时远超过单文件而且很多测试示例都会触发超时处理，所以此例中的 C-Reduce 运行时间会比较长。C-Reduce 会在每次运行成功后将精简的文件写回原始文件，所以你可以使用文本编辑器保持文件的打开状态并查看更改结果。另外你可以在合适时时机运行 `^C` 命令结束 C-Reduce 执行，此时会得到部分精简过的文件。如果有必要你后续可以在此基础上继续进行精简工作。

## Swift

如果您使用 Swift 并且也有精简需求时该怎么办呢？从名字上来看，我原本以为 C-Reduce 只适用于 C（也许还包括 C++，因为很多工具都是如此）。

不过好在，这次我的直觉错了。C-Reduce 确实有一些与 C 相关的特定验证测试，但大部分还是和语言无关的。无论你使用何种语言只要你能写出相关的验证测试，C-Reduce 都能派上用场，虽然效率可能不是很理想。

下面我们就来试一试。我在 bugs.swift.org 上面找到了一个很好的测试 [用例](https://bugs.swift.org/browse/SR-7354)。不过该崩溃只出现在 Xcode9.3 版本上，而我正好就安装了该版本。下面是该 bug 示例的简易修改版：

```swift
import Foundation

func crash() {
    let blah = ProblematicEnum.problematicCase.problematicMethod()
    NSLog("\(blah)")
}

enum ProblematicEnum {
    case first, second, problematicCase

    func problematicMethod() -> SomeClass {
    	let someVariable: SomeClass

    	switch self {
    	case .first:
    	    someVariable = SomeClass()
    	case .second:
    	    someVariable = SomeClass()
    	case .problematicCase:
    	    someVariable = SomeClass(someParameter: NSObject())
    	    _ = NSObject().description
    	    return someVariable // EXC_BAD_ACCESS (simulator: EXC_I386_GPFLT, device: code=1)
    	}

    	let _ = [someVariable]
    	return SomeClass(someParameter: NSObject())
    }

}

class SomeClass: NSObject {
    override init() {}
    init(someParameter: NSObject) {}
}

crash()
```

当我们尝试在启用优化的情况下运行代码时，会出现如下结果：

```bash
$ swift -O test.swift 
<unknown>:0: error: fatal error encountered during compilation; please file a bug report with your project and the crash log
<unknown>:0: note: Program used external function '__T04test15ProblematicEnumON' which could not be resolved!
...
```

与之对应的验证脚本为：

```bash
swift -O test.swift
if [ $? -eq 134 ]; then
    exit 0
else
    exit 1
fi
```

运行 C-Reduce 程序我们可以达到如下的简化版本：

```swift
enum a {
    case b, c, d
    func e() -> f {
    	switch self {
    	case .b:
    	    0
    	case .c:
    	    0
    	case .d:
    	    0
    	}
    	return f()
    }
}

class f{}
```

深入解析该编译错误超出了本文的范围，但如果我们需要对其进行修复时，该简化版本显然更方便。我们得到了一个相当简单的测试用例。 我们还可以推断出 Swift 语句和类的实例化之间存在一些交互，否则 C-Reduce 可能会删除其中一个。这为编译器导致该崩溃的原因提供了一些非常好的提示。

## 总结

测试示例的盲约精简并不是一种多复杂的调试技术，但是自动化让其变的更为有用高效。C-Reduce 可以作为你调试工具箱的一个很好补充。它并不适用所有场景，但是它在面对有些问题时能够带来不小的帮助。虽然在需要与多文件测试用例一起工作时可能存在一些困难，但检验脚本能够解决了该问题。另外，对于 Swift 这类其他语言来说 C-Reduce 也是开箱即用的，而不仅仅只能在 C 语言中发挥功效，所以不要因为你使用的语言不是 C 而放弃它。

今天内容到此为止。下次我还会带来与编程和代码相关的新内容。当然你也可以将你感兴趣的话题 [发送给我](mailto:mike@mikeash.com)。
