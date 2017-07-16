title: "Xcode 扩展"
date: 2016-06-23 11:00:00
tags: [Xcode]
categories: [Russ Bishop]
permalink: xcode-extensions
keywords: xcode扩展,xcode源码编辑器
custom_title: 
description: Xcode 现在支持扩展 API 了，本文就来介绍下第一个源码编辑器的扩展。

---
原文链接=http://www.russbishop.net/xcode-extensions
作者=Russ Bishop
原文日期=2016-06-14
译者=小袋子
校对=saitjr
定稿=CMB

<!--此处开始正文-->

Xcode 8 现在开始支持一套官方的扩展 API。第一个支持的扩展类型就是源码编辑器的扩展（虽然很可能不是最后一个）。另一方面， Xcode 8 采用了系统完整性保护功能（即 SIP，System Integrity Protection）。 这意味着想要将代码注入到 Xcode 进程已经不可能了，并且 [Alcatraz](http://alcatraz.io/) 的业务也关闭了。

<!--more-->

## XcodeKit 源码编辑器扩展的基础

源码编辑器扩展有很多功能，并且能通过命令组织起来。每一个扩展能够在它的 plist 文件或者通过重写 `XCSourceEditorExtension` 提供一个命令清单。每一个命令都具体描述了 `XCSourceEditorCommand` 子类所实现的命令、菜单栏的名字以及唯一标识。同一个类能够通过切换不同的标识符被多个命令继承。

一旦用户激活一个命令，Xcode 将会调用 `perform(with:completionHandler:)` 方法，这样就允许你的命令可以异步地完成工作。

第一个参数是一个 `XCSourceEditorCommandInvocation` 。 这个 `invocation` 携有编辑器文本缓存的内容（一个字符串或一个包含多行文本的数组）。它还可以选中文本，并且选中部分都有一个 `start` 和 `end` 可以告诉你行和列（这可以被用于索引文本缓存区的 `lines` 数组）。如果没有文本被选中，那么数组中只包含一个 `XCSourceTextRange`，这个 range 会用相同的 `start` 和 `end` 来表现插入的点。

## 更多细节

我本可以上传截图，但是 NDA （注：Non Disclosure Agreement，不公开保密协议） 禁止对预发行版本的软件截屏，因此你只能跟着我通过文字来学习啦（注：作者估计是在 WWDC 之前写的，因此有保密协议，不过现在应该是允许了，因此我会截几个关键的操作）。

首先，创建一个新的 Cocoa （Mac）程序，这只是一个容器程序。然后选择 Editor -> add a new Target。选择  Xcode Source Editor Extension 并创建，然后你会得到一个询问是否切换到扩展 scheme 的提示，选择切换。

![](http://img.blog.csdn.net/20160621095215813)

编辑新的 scheme，然后在 Executable 选项里面选择 Xcode-beta.app 为可执行（注：选择 8.0 以上的 Xcode 即可，现在为 beta 版）。

![](http://img.blog.csdn.net/20160621104506975)

一旦你运行扩展，就会打开一个新的 Xcode 。这个 Xcode 有一个灰白的图标，是为了让你知道有一个另外的进程在运行着你的扩展。

![](http://img.blog.csdn.net/20160621115727975)

默认的模板包括了一个命令（在 plist 中预设了）和扩展。你可以编辑 plist 中命令的名称，使得在 Editor 菜单中可以看到更好的名称。如果你选择在代码中提供命令，你必须支持所有的命令。因为 Xcode 不会自动把出现在 plist 中的命令合并起来的。

现在，在命令中你可以添加如下的代码：

```swift
func perform(with invocation: XCSourceEditorCommandInvocation, 
completionHandler: (NSError?) -> Void ) -> Void {
    let buffer = invocation.buffer
    if let insertionPoint = buffer.selections[0] as? XCSourceTextRange {
        let currentLine = insertionPoint.start.line
        buffer.lines.insert("// More Awesome!", at: currentLine)
    }

    completionHandler(nil)
}
```

这个代码是建立在没有文本被选中的情况下，所以 `selections` 属性中唯一的 range 表示着插入点。我通过修改 `lines` 的数组来做改变，但是你也可以访问 `var completeBuffer: String`。任何对 `completeBuffer` 或者 `line` 的修改都会马上映射到另外的属性上。你可以通过检查 `buffer.contentUTI` 来决定 buffer 包含的文本类型，对于 Swift 来说就是 `public.swift-source`。

当你完成时，请确保调用 `completionHandler`  ，使得 Xcode 知道命令已结束。

如果你想要支持取消功能，使用 `invocation.cancellationHandler = { ... }`，确保你是用线程安全的方式处理（可以通过使用 `OSAtomic` 方法去设置一个取消的标志）。这可以让扩展知道应该马上遗弃正在处理的操作，尽管你还是必须调用 `completionHandler`。

## 小提示

如果你像我一样在 OS X 10.11 上运行，你需要运行 `sudo /usr/libexec/xpccachectl` 并且在 Xcode 尝试加载扩展之前重启。这是因为安装新的 SDK 以及 El Capitan 的 XPC 服务不允许这样的操作。 

在 Xcode 的第一个测试版中，扩展有些不稳定（注：在调试时，有很大的概率在 Editor 菜单栏中不会出现 Extension 选项，后面的版本应该会改进和修复的吧）。Xcode 经常在启动时拷贝了两份扩展，并且当你在  Xcode Heart of Darkness Edition 中打开源码，你的编辑器命令选项就会不明所以地变灰了。有时候打开再关闭源文件就可以正常工作，有时候停止扩展后再运行也可以让它恢复。我已经与苹果工程师反馈过了，他们意识到问题并且准备尽快修复。

站在一个更基础的层面，现在的 XcodeKit 接口没有提供任何有关工程的信息、编译的上下文、SourceKit/Clang 等。如果你想要在当前已选择的文本上实现诸如重构工具或者限定 token 的类型等功能，你必须亲自和 SourceKit 交互。理论上这是可行的，但是现在的接口没有提供文件的路径，所以需要在编译器协助下做的事情，基本上都是没办法完成的。而没有任何上下文信息的 SourceKit 也仅能给你一个相当基础的文本转换功能。这是一个我希望未来能够改进的地方。

## 结论

XcodeKit 以及源码编辑器的扩展都是非常受人欢迎的东西。我非常欣喜 Xcode 团队能够开始做这件事，并且我非常期待 Xcode 未来推出其他类型的扩展。