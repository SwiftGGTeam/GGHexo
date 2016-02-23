title: "在 Cocoa 中实现 ICU 文本变换"
date: 2016-02-23 09:00:00
tags: [iOS 开发]
categories: [Ole Begemann]
permalink: cocoa-icu-text-transforms
keywords: icu库,cocoa
custom_title: 
description: ICU库有一整套强大的文本变换功能，那么我们就在讲下在Cocoa中实现ICU文本变换吧。
---
原文链接=http://oleb.net/blog/2016/01/icu-text-transforms/
作者=Ole Begemann
原文日期=2016-01-03
译者=aaaron7
校对=numbbbbb
定稿=Cee

<!--此处开始正文-->


[ICU 的字符串变换](http://userguide.icu-project.org/transforms/general)很酷。[ICU 库](http://site.icu-project.org/)提供了一整套强大的文本变换功能，在处理用户输入、特别是当你的程序需要处理一些英语之外的语言或者非拉丁字符时非常有用。举个例子，你可以把一段简体中文转码成拉丁字符，同时清除音调符号、修饰符和隐藏字符，最后全部转换成小写，使其成为可以被你的数据库搜索 API 识别的字符串，而所有这些变换，只要一行代码就可完成。

在 Apple 的平台中，字符串变换一直以来都是通过 Core Foundation 的 [CFStringTranform](https://developer.apple.com/library/ios/documentation/CoreFoundation/Reference/CFMutableStringRef/index.html#//apple_ref/c/func/CFStringTransform) 函数来实现。Mattt Thompson 在 NSHipster 上对该 API 有[非常棒的介绍](http://nshipster.com/cfstringtransform/)，推荐阅读。
<!--more-->

随着 iOS 9 和 OS X 10.11 的发布，字符串变换被整合到了 Foundation 框架中。虽然在文档中还没有介绍 [NSString](https://developer.apple.com/library/ios/documentation/Cocoa/Reference/Foundation/Classes/NSString_Class/) 的新方法 `stringByApplyingTransform(_:reverse:)`，但是 `CFStringTransform` 文档已经对它进行了说明，而且 Nate Cook 在 [这篇 NSHipster 的文章中](http://nshipster.com/ios9/)也展示了一些具体的例子。下面的代码演示了如何实现中文到拉丁字符的转换：

```swift
import Foundation
let shanghai = "上海"
shanghai.stringByApplyingTransform(NSStringTransformToLatin,
    reverse: false) // 返回 "shàng hǎi"
```

看起来还不错。Apple 提供了 16 种固定的变换，绝大多数都是字符转码（译者注：Script Transliterations，指的是把其中一种语言的字符变换成另一种语言的字符。详情可参考[这里](http://userguide.icu-project.org/transforms/general)），其中一些方法允许你清除输入字符的组合标记符号和读音符号、转换为码点以及转换为标准的 Unicode 形式。另外，绝大多数变换都是可逆的，只要设置 `stringByApplyingTransform(_:reverse:)` 函数的第二个参数即可。特别是做链式调用变换操作的时候，这显得非常强大（比如首先转码，然后去除变音符号）。

### 自由变换

有一个牛逼功能，`CFStringTransform` 文档和 NSHipster 的文章中都有提到，但我之前一直没意识到，它就是自由变换。 ICU 自己定义了一套语法来表示变换，如果你把遵循这套语法的字符串作为参数传给 `stringByApplyingTransform(_:reverse:)` ，它就可以识别！比如这样：

```swift
// Convert non-ASCII characters to ASCII,
// convert to lowercase, delete spaces
"Café au lait".stringByApplyingTransform(
    "Latin-ASCII; Lower; [:Separator:] Remove;", reverse: false)
// returns "cafeaulait"
```

这篇 [ICU 用户手册](http://userguide.icu-project.org/transforms/general)写的非常好，并且包含很多例子。强烈推荐你学习一下。这里是几个我做的例子：

**转换成小写。**

| 输入 | 变换 | 结果 |
| ---- | ---- | ----- |
| HELLO WORLD | Lower | hello world |

**仅转换元音字母为小写。** 方括号定义了一个过滤器，表示只对满足过滤条件的字符应用变换规则。

| 输入 | 变换 | 结果 |
| ---- | ---- | ----- |
| HELLO WORLD | [AEIOU] Lower | HeLLo WoRLD |

**先转成拉丁，再转成 ASCII，最后转换成小写。** 用分号把不同的转换规则隔开。拉丁到 ASCII 这一步会移除变音符以及会把 ASCII 码范围之外的字符和标点符号转换成 ASCII 中与之最为接近的版本。

| 输入 | 变换 | 结果 |
| ---- | ---- | ----- |
| 上海 | Any-Latin; Latin-ASCII; Lower | shang hai |
| København |	Any-Latin; Latin-ASCII; | Lower	kobenhavn|
| กรุงเทพมหานคร |	Any-Latin; Latin-ASCII; | Lower	krungthephmhankhr|
| Αθήνα |	Any-Latin; Latin-ASCII; | Lower	athena|
| “Æ « © 1984” |	Any-Latin; Latin-ASCII; Lower |	"ae << (c) 1984"|

**删除标点。** 删除规则非常强大。上面的例子都是用方括号加一些字符串规则来表示过滤条件，但过滤器也可以像这个例子一样，由 [Unicode 字符类](https://en.wikipedia.org/wiki/Unicode_character_property#General_Category)给出。

| 输入 | 变换 | 结果 |
| ---- | ---- | ----- |
| “Make it so,” said Picard.	| [:Punctuation:] Remove | 	Make it so said Picard |

**删除所有非字母字符。**使用 ^ 来对字符串做过滤。

| 输入 | 变换 | 结果 |
| ---- | ---- | ----- |
| 5 plus 6 equals 11 👍! |[:^Letter:] Remove|plusequals|

**把标点符号转换成印刷体。**`Publishing` 规则可以直接把标点符号转换成对应的印刷版本。

| 输入 | 变换 | 结果 |
| ---- | ---- | ----- |
| "How's it going?" |	Publishing |	“How’s it going?”|


**转换为十六进制表示法。**支持很多种格式。默认是 `Java` 格式。需要注意的是，这里 `Java` 输出的是 UTF-16 字符单元（表情分为两部分编码），而其他格式则是输出码点。

| 输入 | 变换 | 结果 |
| ---- | ---- | ----- |
|😃! |	Hex |	`\uD83D\uDE03\u0021` |
|😃!|	Hex/Java|	`\uD83D\uDE03\u0021`
|😃!|	Hex/Unicode |	`U+1F603U+0021`
|😃!|	Hex/Perl |	`\x{1F603} \x{21}`
|😃!|	Hex/XML |	`&#x1F603;&#x21;`

**转换成多种标准化的形式。**

| 输入 | 变换 | 结果 |
| ---- | ---- | ----- |
|é |	NFD; Hex/Unicode |	U+0065U+0301 |
|é |	NFC; Hex/Unicode |	U+00E9 |
|2⁸ |	NFKD |	28 |
|2⁸ |	NFKC |	28 |

---

想象一下，自己实现上述转换方法多么蛋疼……

自由变换的知识我是从 Florian 和 Daniel 写的那本 [Core Data](http://oleb.net/blog/2015/12/core-data-book/) 里学来的。他们介绍了如何把用户输入的搜索词标准化后再提交到数据库。 这样既可以有效提升搜索性能，也能让搜索的结果更加准确。

