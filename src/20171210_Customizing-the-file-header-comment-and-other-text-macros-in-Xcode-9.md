
title: "在 Xcode9 中自定义文件头部注释和其他文本宏"
date: 2017-12-10
tags: Xcode
categories: [Ole Begemann]
permalink: Customizing-the-file-header-comment-and-other-text-macros-in-Xcode-9
keywords: 
custom_title: 
description: 

---
原文链接=https://oleb.net/blog/2017/07/xcode-9-text-macros/
作者=Ole Begemann
原文日期=2017/07/24
译者=Forelax
校对=Joy
定稿=Forelax

<!--此处开始正文-->

我一直[不喜欢 Xcode 默认给新文件头部添加的注释](https://twitter.com/olebegemann/status/845263246949011457)。在我看来，从注释里得到的绝大多数信息要么和文件本身没有关系，要么通过版本控制，你能得到更详尽的信息。此外，当文件和项目更名的时候，这些注释会立刻显得过时。

<!--more-->

![](/img/articles/Customizing-the-file-header-comment-and-other-text-macros-in-Xcode-9/11.png1512891714.217959)

因此，在我个人的项目里，我创建新文件后，第一件要做的事情就是删除这些注释。

这个习惯一直持续到不久前，直到 Xcode9 允许使用一个 plist 文件来自定义文件头部注释和其他被称作文本宏的东西。这部分内容在 Xcode 的[帮助文档](https://help.apple.com/xcode/mac/9.0/index.html)中的[自定义文本宏](https://help.apple.com/xcode/mac/9.0/index.html?localePath=en.lproj#/dev91a7a31fc)这一页中有详尽的描述：

![](/img/articles/Customizing-the-file-header-comment-and-other-text-macros-in-Xcode-9/xcode-help-customize-text-macros.png1512892169.760428)

1. **首先，创建一个叫做 `IDETemplateMacros.plist` 的 plist 文件**
2. **当你想自定义一个文本宏时，就向 plist 的字典中添加一个新的键。**例如，当你想修改默认的文件头部注释时，就给 plist 文件中添加一个新条目，条目的键为 `FILEHEADER`。

    ![在 Xcode 的 plist 编辑器中编辑`IDETemplateMacros.plist`文件](/img/articles/Customizing-the-file-header-comment-and-other-text-macros-in-Xcode-9/xcode-plist-editor-IDETemplateMacros-plist.png1512892705.4828758)

    > Xcode 的 plist 编辑器只会展示一行，不过你可以用 Option + Return 添加新行。

    如果你想知道都有哪些文本宏可以使用，你可以查看[下方的文本宏参考](#1)。你也可以在某个宏的值中使用其他宏，只要用下划线（译者注：三个下划线）包裹起来那个宏就可以了，比如：`___DATE___`。一些文本宏也可以用一种`:modifier`语法来进行进一步的自定义。通过查看[下方的文本宏格式参考](#2)你可以得知更多细节。

3. **然后你可以把 plist 文件放到这么几个地方。放置的位置决定了自定义的文本宏会在什么范围内生效**：
    - 使用该工程 (project) 的某个特定用户创建新文件时生效：`<ProjectName>.xcodeproj/xcuserdata/[username].xcuserdatad/IDETemplateMacros.plist`
    - 使用该工程的所有人创建新文件时生效：`<ProjectName>.xcodeproj/xcshareddata/IDETemplateMacros.plist`
    - 使用该工作空间 (workspace) 的某个特定用户创建新文件时生效：`<WorkspaceName>.xcworkspace/xcuserdata/[username].xcuserdatad/IDETemplateMacros.plist`
    - 使用该工作空间的所有人创建新文件时生效：`<WorkspaceName>.xcworkspace/xcshareddata/IDETemplateMacros.plist` 
    - 使用 Xcode 创建的所有新文件都生效：`~/Library/Developer/Xcode/UserData/IDETemplateMacros.plist`

当你创建一个新文件时，新文件的头部看起来像是这样：
​    
![在自定义了`FILEHEADRE`文本宏后创建爱你的新文件](/img/articles/Customizing-the-file-header-comment-and-other-text-macros-in-Xcode-9/xcode-new-file-after-customizing-text-macros.png1512892705.61613)
​    
> 注意，对于`FILEHEADER`宏，目前的 Xcode(Xcode9 beta3) 只会自动给第一行添加注释标记（一个不带空格的`//`），剩下的行并不会自动添加注释标记。你需要手动在带有宏的文本中添加注释标记。我不确定对 Xcode 来说这是一个 feature 还是一个 bug（对我来说现在看起来这是一个 bug）
>
> 因此，即便你在 plist 文件中把 `FILEHEADER` 设置成空字符串，也没法让文件头部的注释完全消失，新文件的开头会是一个空的注释行。我希望这个 bug 可以在未来的版本中解决掉。我已经给苹果官方提交了这个 bug（rdar://33451838）


> 译者注：
> rdar 指的苹果内部的 bug 追踪系统，一般开发者可以在 https://bugreport.apple.com/ 上提交 bug，当然你只能看到自己提交的 bug，高冷的苹果不会展示出来总共有多少人提交了 bug，所以有人建立了 https://openradar.appspot.com/ 这个网站呼吁大家在提交 bug 后也在这里提交一次，方便开发者们知道都有哪些问题被提交了。更多详情可以参见这个[论坛帖子](https://forums.developer.apple.com/thread/8796)

----

<h2 id="1">文本宏索引</h2>

这里是所有可以在 Xcode9 中使用的文本宏，我把他们从 [Xcode 的帮助页面](https://help.apple.com/xcode/mac/9.0/index.html?localePath=en.lproj#/dev7fe737ce0)中一字不差的复制过来了。

![](/img/articles/Customizing-the-file-header-comment-and-other-text-macros-in-Xcode-9/xcode-help-text-macros-reference.png1512892705.665681)

> ##### DATE
> 当前的日期。
> ##### DEFAULTTOOLCHAINSWIFTVERSION
> 当前工具链所使用的 Swift 的版本。
> ##### FILEBASENAME
> 不带扩展名的当前文件的名称。
> ##### FILEBASENAMEASIDENTIFIER
> 以 C 标识符编码的当前文件名称。（译者注：C 标识符只允许使用数字、字母和下划线，使用这个宏会把其他的字符自动替换成下划线）
> ##### FILEHEADER
> 每个文本文件头部的文本。
> ##### FILENAME
> 当前文件的完整名称。
> ##### FULLUSERNAME
> 当前系统用户的全名。
> ##### NSHUMANREADABLECOPYRIGHTPLIST
> macOS 应用类型的 target 中，Info.plist 文件设置的版权信息条目的值（译者注：也就是这个宏最终会被替换成在 Info.plist 中 NSHumanReadableCopyright 这一项保存的字符串）。这个条目对应的一个合法的示例值为：

> ```
> <key>NSHumanReadableCopyright</key>
> <string>Copyright © 2017 Apple, Inc. All rights reserved.</string>
> ```
> 注意值里头有一次换行
> **ORGANIZATIONNAME**
>  Provisioning profile 文件中使用的团队所在的公司名称。
> **PACKAGENAME**
> 当前 scheme 所设置的包名。
> **PACKAGENAMEASIDENTIFIER**
> 当前 scheme 所设置的包名，以 C 标识符的形式编码。
> **PRODUCTNAME**
> 当前 scheme 设置的应用名称。
> **PROJECTNAME**
> 当前工程的名称。
> **RUNNINGMACOSVERSION**
> macOS 系统的版本。
> **TARGETNAME**
> 当前 target 的名称。
> **TIME**
> 当前的时间
> **USERNAME**
> 当前 macOS 用户的登录名。
> **UUID**
> 使用这个宏的时候，会返回一个唯一 ID。当这个宏第一次被使用时，Xcode 会创建一个 ID。你可以通过使用修饰符来创建多个唯一的 ID。每个修饰符都会得到一个针对这个修饰符唯一的 ID。
>
> 例如，`UUID:firstPurpose`这个宏和修饰符的组合在第一次使用的时候，它会创建并返回一个唯一的 ID。接下来其他使用 `UUID:firstPurpose`的地方都会返回这个 ID。使用 `UUID:secondPurpose` 后会产生并返回一个新的 ID，这个 ID 对于`UUID:secondPurpose`来说是唯一的，并且这个 ID 不同于前一个 ID。
> **WORKSPACENAME**
> 当前 workspace 的名称。如果 workspace 中只有一个 project，那么这个宏的值便是当前打开的 project 的名称。
> **YEAR**
> 四位数字格式的当前年数。

----

<h2 id="2">文本宏格式索引</h2>

*以下内容都是从 Xcode 帮助页面中的[文本宏格式参考](https://help.apple.com/xcode/mac/9.0/index.html?localePath=en.lproj#/devc8a500cb9)拷贝过来的*

![](/img/articles/Customizing-the-file-header-comment-and-other-text-macros-in-Xcode-9/xcode-help-text-macro-format-reference.png1512892705.816728)

> 一个文本宏的值可以包含任何合法的 unicode 字符。同时一个文本宏的值也可以包含其他的文本宏。

> ##### 引入其他文本宏
> 要想引入其他文本宏，在想要添加的文本宏之前和之后添加下划线(\__):

> `___<MacroName>___`
> ##### 编辑文本宏表达式
> 通过添加一个或者多个修饰符，你可以修改文本宏的最终值。针对那些可以添加修饰符的文本宏，可以在宏的最后添加修饰符，宏和修饰符之间用分号(:)分隔。多个修饰符之间可以用逗号(,)分隔。

> `<MACRO>:<modifier>[,<modifier>]…`
>
> 例如，下面的这段宏会删除掉`FILENAME`宏中的扩展名：

> `FILENAME:deletingPathExtension`
>
> 为了使编辑后的宏符合 C 标识符的规范，可以在宏之后再添加一个 identifier 修饰符：
>
> `FILENAME:deletingPathExtension,identifier`
>
> #### 修饰符
> ##### bundleIdentifier
> 用一个连字符(-)替换所有不符合 bundle 标识的字符。
> ##### deletingLastPathComponent
> 从字符串中删除最后一个路径组件 (path component)。（译者注：根据[维基百科](https://en.wikipedia.org/wiki/Path_(computing))的解释，一个路径是由多个路径组件组成的，路径组件之间使用斜线"/"、反斜线"\\"或者句点"\."来分隔）
> ##### deletingPathExtension
> 从字符串中删除所有的扩展名。
> ##### deletingTrailingDot
> 删除所有句子末尾的句点 (.)。
> ##### identifier
> 用下划线(_)代替所有不符合 C 标识符编码的字符。
> ##### lastPathComponent
> 仅返回字符最后一个路径组件。
> ##### pathExtension
> 返回字符的扩展名。
> ##### rfc1034Identifier
> 用连字符(-)替换所有不符合 rfc1034 标识符规范的字符。（译者注：rfc1034 是定义域名的规范，详情参见[这里](https://www.ietf.org/rfc/rfc1034.txt)）
> ##### xml
> 将一些特殊的 xml 字符用其转义字符替换。比如，小于号 (<) 会被 &lt 替换;

---