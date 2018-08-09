title: "Swift 4 中的字符串"
date: 2018-08-09
tags: [Swift 进阶]
categories: [Ole Begemannh]
permalink: swift-4-strings
keywords: Strings,Swift 4
custom_title:
description: 

---
原文链接=https://oleb.net/blog/2017/11/swift-4-strings
作者=Ole Begemann
原文日期=2017-11-27
译者=东莞大唐和尚
校对=pmst,Firecrest
定稿=CMB

<!--此处开始正文-->

这个系列中其他文章：

1. [Swift 1 中的字符串](https://oleb.net/blog/2014/07/swift-strings/)
2. [Swift 3 中的字符串](https://oleb.net/blog/2016/08/swift-3-strings/)
3. Swift 4 中的字符串（本文）

本文节选自我们的新书《高级 Swift 编程》「字符串」这一章。《高级 Swift 编程》新版本已根据 Swift 4 的新特性修订补充，新版现已上市。

<!--more-->

所有的现代编程语言都有对 Unicode 编码字符串的支持，但这通常只意味着它们的原生字符串类型可以存储 Unicode 编码的数据——并不意味着所有像获取字符串长度这样简单的操作都会得到「合情合理」的输出结果。

实际上，大多数语言，以及用这些语言编写的大多数字符串操作代码，都表现出对Unicode固有复杂性的某种程度的否定。这可能会导致一些令人不开心的错误

Swift 为了字符串的实现支持 Unicode 做出了巨大的努力。Swift 中的 [`String`](https://developer.apple.com/documentation/swift/string)（字符串）是一系列 [`Character`](https://developer.apple.com/documentation/swift/character) 值（字符）的集合。这里的 `Character` 指的是人们视为单个字母的可读文本，无论这个字母是由多少个 Unicode 编码字符组成。因此，所有对于 `Collection`（集合）的操作（比如 `count` 或者 `prefix(5)`）也同样是按照用户所理解的字母来操作的。

这样的设计在正确性上无可挑剔，但这是有代价的，主要是人们对它不熟悉。如果你习惯了熟练操作其他编程语言里字符串的整数索引，Swift 的设计会让你觉得笨重不堪，让你感觉到奇怪。为什么 `str[999]` 不能获得字符串第一千个字符？为什么 `str[idx+1]` 不能获得下一个字符？为什么不能用类似 `"a"..."z"` 的方式遍历一个范围的 `Character`（字符）？

同时，这样的设计对代码性能也有一定的影响：`String` 不支持随意获取。换句话说，获得一个任意字符不是 O(1) 的操作——当字符宽度是个变量的时候，字符串只有查看过前面所有字符之后，才会知道第 n 个字符储存在哪里。

在本章中，我们一起来详细讨论一下 Swift 中字符串的设计，以及一些获得功能和性能最优的技巧。不过，首先我们要先来学习一下 Unicode 编码的专业知识。

## Unicode：抛弃固定宽度

本来事情很简单。[ASCII编码](https://en.wikipedia.org/wiki/ASCII) 的字符串用 0 到 127 之间的一系列整数表示。如果使用 8 比特的二进制数组合表示字符，甚至还多余一个比特！由于每个字符的长度固定，所以 ASCII 编码的字符串是可以随机获取的。

但是，如果不是英语而是其他国家的语言的话，其中的一些字符 ASCII 编码是不够的（其实即使是说英语的英国也有一个"£"符号）。这些语言中的特殊字符大多数都需要超过 7 比特的编码。在 [ISO 8859](https://en.wikipedia.org/wiki/ISO/IEC_8859) 标准中，就用多出来的那个比特定义了 16 种超出 ASCII 编码范围的编码，比如第一部分（ISO8859-1）包括了几种西欧语言的编码，第五部分包括了对西里尔字母语言的编码。

但这样的做法其实还有局限。如果你想根据 ISO8859 标准，用土耳其语写古希腊语的话，你就不走运了，因为你要么得选择第七部分（拉丁语/希腊语）或者第九部分（土耳其语）。而且，总的来说 8 个比特的编码空间无法涵盖多种语言。例如，第六部分（拉丁语/阿拉伯语）就不包含同样使用阿拉伯字母的乌尔都语和波斯语中的很多字符。同时，越南语虽然使用的也是拉丁字母，但是有很多变音组合，这种情况只有替换掉一些原有 ASCII 编码的字母才可能存储到 8 个比特的空间里。而且，这种方法不适用其他很多东亚语言。

当固定长度编码空间不足以容纳更多字符时，你要做一个选择：要么提高存储空间，要么采用变长编码。起先，[Unicode](https://en.wikipedia.org/wiki/Unicode) 被定义为 2 字节固定宽度的格式，现在我们称之为 [UCS-2](https://en.wikipedia.org/wiki/Universal_Coded_Character_Set)。彼时梦想尚未照进现实，后来人们发现，要实现大部分的功能，不仅 2 字节不够，甚至4个字节都远远不够。

所以到了今天，Unicode 编码的宽度是可变的，这种可变有两个不同的含义：一是说 Unicode 标量可能由若干个代码块组成；一是说字符可能由若干个标量组成。

Unicode 编码的数据可以用多种不同宽度的 [代码单元（*code unit*）](https://www.unicode.org/glossary/#code_unit) 来表示，最常见的是 8 比特（[UTF-8](https://en.wikipedia.org/wiki/UTF-8)）和 16（[UTF-16](https://en.wikipedia.org/wiki/UTF-16)）比特。UTF-8 编码的一大优势是它向后兼容 8 比特的 ACSCII 编码，这也是它取代 ASCII 成为互联网上最受欢迎的编码的一大原因。在 Swift 里面用 `UInt16` 和 `UInt8` 的数值代表UTC-16和UTF-8的代码单元（别名分别是 [`Unicode.UTF16.CodeUnit`](https://developer.apple.com/documentation/swift/unicode.utf8/codeunit) 和 [`Unicode.UTF8.CodeUnit`](https://developer.apple.com/documentation/swift/unicode.utf16/codeunit)）。

一个 [*代码点（code point）*](https://www.unicode.org/glossary/#code_point) 指的是 Unicode 编码空间中一个单一的值，可能的范围是 `0` 到 `0x10FFFF` (换算成十进制就是 1114111)。现在已使用的代码点大约只有 137000 个，所以还有很多空间可以存储各种 emoji。如果你使用的是 [UTF-32](https://en.wikipedia.org/wiki/UTF-32) 编码，那么一个代码点就是一个代码块；如果使用的是 UTF-8 编码，一个代码点可能有 1 到 4 个代码块组成。最初的 256 个 Unicode 编码的代码点对应着 Latin-1 中的字母。

[Unicode 标量](https://www.unicode.org/glossary/#unicode_scalar_value) 跟代码点基本一样，但是也有一点不一样。除开 `0xD800-0xDFFF` 中间的 2048 个代理代码点（[*surrogate code points*](https://en.wikipedia.org/wiki/UTF-16#U.2BD800_to_U.2BDFFF)）之外，他们都是一样的。这 2048 个代理代码点是 UTF-16 中用作表示配对的前缀或尾缀编码。标量在 Swift 中用 `\u{xxxx}` 表示，xxxx 代表十进制的数字。所以欧元符号在Swift里可以表示为 `"€"` 或 `"\u{20AC}"`。与之对应的 Swift 类型是 [`Unicode.Scalar`](https://developer.apple.com/documentation/swift/unicode.scalar)，一个 [`UInt32`](https://developer.apple.com/documentation/swift/uint32) 数值的封装。

为了用一个代码单元代表一个 Unicode scalar，你需要一个 21 比特的编码机制（通常会达到 32 比特，比如 UTF-32），但是即便这样你也无法得到一个固定宽度的编码：最终表示字符的时候，Unicode 仍然是一个宽度可变的编码格式。屏幕上显示的一个字符，也就是用户通常认为的一个字符，可能需要多个 scalar 组合而成。Unicode 编码里把这种用户理解的字符称之为 [（扩展）字位集](https://www.unicode.org/glossary/#extended_grapheme_cluster)(extended grapheme cluster)。

标量组成字位集的规则决定了如何分词。例如，如果你按了一下键盘上的退格键，你觉得你的文本编辑器就应该删除掉一个字位集，即使那个“字符”是由多个 Unicode scalars 组成，且每个 scalar 在计算机内存上还由数量不等的代码块组成的。Swift中用 `Character` 类型代表字位集。`Character` 类型可以由任意数量的 Scalars 组成，只要它们形成一个用户看到的字符。在下一部分，我们会看到几个这样的例子。

## 字位集和规范对等（Canonical Equivalence）

### 组合符号

这里有一个快速了解 `String` 类型如何处理 Unicode 编码数据的方法：写 “é” 的两种不同方法。Unicode 编码中定义为 [U+00E9](https://codepoints.net/U+00E9)，*Latin small letter e with acute*（拉丁字母小写 e 加重音符号），单一值。但是你也可以写一个正常的 [小写 e](https://codepoints.net/U+0065)，再跟上一个 [U+0301](https://codepoints.net/U+0301)，*combining acute accent*（重音符号）。在这两种情况中，显示的都是 é，用户当然会认为这两个 “résumé” 无论使用什么方式打出来的，肯定是相等的，长度也都是 6 个字符。这就是 Unicode 编码规范中所说的 [规范对等（Canonically Equivalent）](https://www.unicode.org/glossary/#canonical_equivalent)。

而且，在 Swift 语言里，代码行为和用户预期是一致的：

```swift
let single = "Pok\u{00E9}mon"
let double = "Poke\u{0301}mon"
```

它们显示也是完全一致的：

```swift
(single, double) // → ("Pokémon", "Pokémon")
```

它们的字符数也是一样的：

```swift
single.count // → 7
double.count // → 7
```

因此，比较起来，它们也是相等的：

```swift
single == double // → true
```

只有当你通过底层的显示方式查看的时候，才能看到它们的不同之处：

```swift
single.utf16.count // → 7
double.utf16.count // → 8
```

这一点和 Foundation 中的 [`NSString`](https://developer.apple.com/documentation/foundation/nsstring) 对比一下：在 `NSString` 中，两个字符串是不相等的，它们的 `length` （很多程序员都用这个方法来确定字符串显示在屏幕上的长度）也是不同的。

```swift
import Foundation

let nssingle = single as NSString
nssingle.length // → 7
let nsdouble = double as NSString
nsdouble.length // → 8
nssingle == nsdouble // → false
```

这里，`==` 是定义为比较两个 `NSObject` ：

```objc
extension NSObject: Equatable {
    static func ==(lhs: NSObject, rhs: NSObject) -> Bool {
        return lhs.isEqual(rhs)
    }
}
```

在 `NSString` 中，这个操作会比较两个 UTF-16 代码块。很多其他语言里面的字符串 API 也是这样的。如果你想做的是一个规范比较（cannonical comparison），你必须用 `NSString.compare(_:)` 。没听说过这个方法？将来遇到一些找不出来的 bug ，以及一些怒气冲冲的国外用户的时候，够你受的。

当然，只比较代码单元有一个很大的优点是：速度快！在 Swift 里，你也可以通过 `utf16` 视图来实现这一点：

```swift
single.utf16.elementsEqual(double.utf16) // → false
```

为什么 Unicode 编码要支持同一字符的多种展现方式呢？因为 Latin-1 中已经有了类似é和ñ这样的字母，只有灵活的组合方式才能让长度可变的 Unicode 代码点兼容 Latin-1。

虽然使用起来会有一些麻烦，但是它使得两种编码之间的转换变得简单快速。

而且抛弃变音形式也没有什么用，因为这种组合不仅仅只是两个两个的，有时候甚至是多种变音符号组合。例如，约鲁巴语中有一个字符是 ọ́ ，可以用三种不同方式写出来：一个 ó 加一点，一个 ọ 加一个重音，或者一个 o  加一个重音和一点。而且，对最后一种方式来说，两个变音符号的顺序无关紧要！所以，下面几种形式的写法都是相等的：

```swift
let chars: [Character] = [
    "\u{1ECD}\u{300}",      // ọ́
    "\u{F2}\u{323}",        // ọ́
    "\u{6F}\u{323}\u{300}", // ọ́
    "\u{6F}\u{300}\u{323}"  // ọ́
]
let allEqual = chars.dropFirst()
    .all(matching: { $0 == chars.first }) // → true
```

`all(matching:)` 方法用来检测条件是否对序列中的所有元素都为真：

```swift
extension Sequence {
    func all(matching predicate: (Element) throws -> Bool) rethrows -> Bool {
        for element in self {
            if try !predicate(element) {
                return false
            }
        }
        return true
    }
}
```

其实，一些变音符号可以加无穷个。这一点，[网上流传很广](http://knowyourmeme.com/memes/zalgo) 的一个颜文字表现得很好：

```swift
let zalgo = "s̼̐͗͜o̠̦̤ͯͥ̒ͫ́ͅo̺̪͖̗̽ͩ̃͟ͅn̢͔͖͇͇͉̫̰ͪ͑"

zalgo.count // → 4
zalgo.utf16.count // → 36
```

上面的例子中，`zalgo.count` 返回值是4（正确的），而 `zalgo.utf16.count` 返回值是 36。如果你的代码连网上的颜文字都无法正确处理，那它有什么好的？

Unicode 编码的字位分割规则甚至在你处理纯 ASCII 编码的字符的时候也有影响，回车 [CR](https://codepoints.net/U+000D) 和 换行[LF](https://codepoints.net/U+000A) 这一个字符对在 Windows 系统上通常表示新开一行，但它们其实只是一个字位：

```swift
// CR+LF is a single Character
let crlf = "\r\n"
crlf.count // → 1
```

### Emoji

许多其他编程语言处理包含 emoji 的字符串的时候会让人意外。许多 emoji 的 Unicode 标量无法存储在一个 UTF-16 的代码单元里面。有些语言（例如 Java 或者 C#）把字符串当做 UTF-16 代码块的集合，这些语言定义["😂"](https://emojipedia.org/face-with-tears-of-joy/)为两个 “字符” 的长度。Swift 处理上述情况更为合理：

```swift
let oneEmoji = "😂" // U+1F602
oneEmoji.count // → 1
```

> 注意，重要的是字符串如何展现给程序的，**不是**字符串在内存中是如何存储的。对于非 ASCII 的字符串，Swift 内部用的是 UTF-16 的编码，这只是内部的实现细节。公共 API 还是基于字位集（grapheme cluster）的。

有些 emoji 由多个标量组成。emoji 中的国旗是由两个对应 ISO 国家代码的[地区标识符号（reginal indicator symbols）](https://en.wikipedia.org/wiki/Regional_Indicator_Symbol)组成的。Swift 里将一个国旗视为一个 `Character` ：

```swift
let flags = "🇧🇷🇳🇿"
flags.count // → 2
```

要检查一个字符串由几个 Unicode 标量组成，需要使用 [`unicodeScalars`](https://developer.apple.com/documentation/swift/string/1539070-unicodescalars) 视图。这里，我们将 scalar 的值格式化为十进制的数字，这是代码点的普遍格式：

```swift
flags.unicodeScalars.map {
    "U+\(String($0.value, radix: 16, uppercase: true))"
}
// → ["U+1F1E7", "U+1F1F7", "U+1F1F3", "U+1F1FF"]
```

肤色是由一个基础的角色符号（例如👧）加上一个肤色修饰符（例如🏽）组成的，Swift 里是这么处理的：

```swift
let skinTone = "👧🏽" // 👧 + 🏽
skinTone.count // → 1
```

这次我们用 Foundation API 里面的 [ICU string transform](https://oleb.net/blog/2016/01/icu-text-transforms/) 把 Unicode 标量转换成官方的 Unicode 名称：

```Swift
extension StringTransform {
    static let toUnicodeName = StringTransform(rawValue: "Any-Name")
}

extension Unicode.Scalar {
    /// The scalar’s Unicode name, e.g. "LATIN CAPITAL LETTER A".
    var unicodeName: String {
        // Force-unwrapping is safe because this transform always succeeds
        let name = String(self).applyingTransform(.toUnicodeName,
            reverse: false)!

        // The string transform returns the name wrapped in "\\N{...}". Remove those.
        let prefixPattern = "\\N{"
        let suffixPattern = "}"
        let prefixLength = name.hasPrefix(prefixPattern) ? prefixPattern.count : 0
        let suffixLength = name.hasSuffix(suffixPattern) ? suffixPattern.count : 0
        return String(name.dropFirst(prefixLength).dropLast(suffixLength))
    }
}

skinTone.unicodeScalars.map { $0.unicodeName }
// → ["GIRL", "EMOJI MODIFIER FITZPATRICK TYPE-4"]
```

这段代码里面最重要的是对 `applyingTransform(.toUnicodeName,...)` 的调用。其他的代码只是把转换方法返回的名字清理了一下，移除了括号。这段代码很保守：先是检查了字符串是否符合期望的格式，然后计算了从头到尾的字符数。如果将来转换方法返回的名字格式发生了变化，最好输出原字符串，而不是移除多余字符后的字符串。

注意我们是如何使用标准的集合（`Collection`）方法 `dropFirst` 和 `droplast` 进行移除操作的。如果你想对字符串进行操作，但是又不想对字符串进行手动索引，这就是一个很好的例子。这个方法同样也很高效，因为 `dropFisrt` 和 `dropLast` 方法返回的是 `Substring` 值，它们只是原字符串的一部分。在我们最后一步创建一个新的 `String` 字符串，赋值为这个 substring 之前，它是不占用新的内存的。关于这一点，我们在这一章的后面还有很多东西会涉及到。

Emoji 里面对家庭和夫妻的表示（例如 [👨‍👩‍👧‍👦](https://emojipedia.org/family-man-woman-girl-boy/) 和 [👩‍❤️‍👩](https://emojipedia.org/couple-with-heart-woman-woman/)）是 Unicode 编码标准面临的又一个挑战。由于性别以及人数的可能组合太多，为每种可能的组合都做一个代码点肯定会有问题。再加上每个人物角色的肤色的问题，这样做几乎不可行。Unicode编码是这样解决这个问题的，它将这种 emoji 定义为一系列由零宽度连接符（[*zero-width joiner*](https://codepoints.net/U+200D)）联系起来的 emoji 。这样下来，这个家庭👨‍👩‍👧‍👦 emoji 其实就是 [*man* 👨](https://emojipedia.org/man/) + ZWJ + [*woman* 👩](https://emojipedia.org/woman/) + ZWJ + [*girl*👧](https://emojipedia.org/girl/) + ZWJ + [*boy* 👦](https://emojipedia.org/boy/)。而零宽度连接符的作用就是让操作系统知道这个 emoji 应该只是一个字素。

我们可以验证一下到底是不是这样：

```swift
let family1 = "👨‍👩‍👧‍👦"
let family2 = "👨\u{200D}👩\u{200D}👧\u{200D}👦"
family1 == family2 // → true
```

在 Swift 里，这样一个 emoji 也同样被认为是一个字符 `Character` ：

```swift
family1.count // → 1
family2.count // → 1
```

2016年新引入的职业类型 emoji 也是这种情况。例如女性消防队员 [👩‍🚒](https://emojipedia.org/female-firefighter/) 就是 [*woman* 👩](https://emojipedia.org/woman/) + ZWJ + [*fire engine* 🚒](https://emojipedia.org/fire-engine/)。男性医生就是 [*man* 👨](https://emojipedia.org/man/) + ZWJ + [*staff of aesculapius* ⚕](https://emojipedia.org/staff-of-aesculapius/)（译者注：阿斯克勒庇厄斯，是古希腊神话中的医神，一条蛇绕着一个柱子指医疗相关职业）。

将这些一系列零宽度连接符连接起来的 emoji 渲染为一个字素是操作系统的工作。2017年，Apple 的操作系统表示支持 Unicode 编码标准下的 RGI 系列（“[recommended for general interchange](https://unicode.org/emoji/charts/emoji-zwj-sequences.html)”）。如果没有字位可以正确表示这个序列，那文本渲染系统会回退，显示为每个单个的字素。

注意这里又可能会导致一个理解偏差，即用户所认为的字符和 Swift 所认为的字位集之间的偏差。我们上面所有的例子都是担心编程语言会把字符**数多了**，但这里正好相反。举例来说，上面那个家庭的 emoji 里面涉及到的肤色 emoji 还未被收录到 RGI 集合里面。但尽管大多数操作系统都把这系列 emoji 渲染成多个字素，但 Swift 仍旧只把它们看做一个字符，因为 Unicode 编码的分词规则和渲染无关：

```swift
// Family with skin tones is rendered as multiple glyphs
// on most platforms in 2017
let family3 = "👱🏾\u{200D}👩🏽\u{200D}👧🏿\u{200D}👦🏻" // → "👱🏾‍👩🏽‍👧🏿‍👦🏻"
// But Swift still counts it as a single Character
family3.count // → 1
```

[Windows 系统已经可以](https://blog.emojipedia.org/diverse-emoji-families-come-to-windows/)把这些 emoji 渲染为一个字素了，其他操作系统厂家肯定也会尽快支持。但是，有一点是不变的：无论一个字符串的 API 如何精心设计，都无法完美支持每一个细小的案例，因为文本太复杂了。

> 过去 Swift 很难跟得上 Unicode 编码标准改变的步伐。Swift 3 渲染肤色和零宽度连接符系列 emoji 是错误的，因为当时的分词算法是根据上一个版本的 Unicode 编码标准。自 Swift 4 起，Swift 开始启用操作系统的 [ICU](http://site.icu-project.org)库。因此，只要用户更新他们的操作系统，你的程序就会采用最新的 Unicode 编码标准。硬币的另一面是，你开发中看到的和用户看到的东西可能是不一样的。

编程语言如果全面考虑 Unicode 编码复杂性的话，在处理文本的时候会引发很多问题。上面这么多例子我们只是谈及其中的一个问题：字符串的长度。如果一个编程语言不是按字素集处理字符串，而这个字符串又包含很多字符序列的话，这时候一个简简单单的反序输出字符串的操作会变得多么复杂。

这不是个新问题，但是 emoji 的流行使得糟糕的文本处理方法造成的问题更容易浮出表面，即使你的用户群大部分是说英语的。而且，错误的级别也大大提升：十年前，弄错一个变音符号的字母可能只会造成 1 个字符数的误差，现在如果弄错了 emoji 的话很可能就是 10 个字符数的误差。例如，一个四人家庭的 emoji在 UTF-16 编码下是 11 个字符，在 UTF-8 编码下就是 25 个字符了：

```swift
family1.count // → 1
family1.utf16.count // → 11
family1.utf8.count // → 25
```

也不是说其他编程语言就完全没有符合 Unicode 编码标准的 API，大部分还是有的。例如，`NSString` 就有一个 [`enumerateSubstrings`](https://developer.apple.com/documentation/foundation/nsstring/1416774-enumeratesubstrings) 的方法可以按照字位集遍历一个字符串。但是缺省设置很重要，而 Swift 的原则就是缺省情况下，就按正确的方式来做。而且如果你需要低一个抽象级别去看，`String` 也提供不同的视图，然你可以直接从 Unicode 标量或者代码块的级别操作。下面的内容里我们还会涉及到这一点。

## 字符串和集合

我们已经看到，`String` 是一个 `Character` 值的集合。在 Swift 语言发展的前三年里，`String` 这个类在遵守还是不遵守 `Collection` 集合协议这个问题上左右摇摆了几次。坚持不要遵守集合协议的人认为，如果遵守的话，程序员会认为所有通用的集合处理算法用在字符串上是绝对安全的，也绝对符合 Unicode 编码标准的，但是显然有一些特例存在。

举一个简单的例子，两个集合相加，得到的新的集合的长度肯定是两个子集合长度的和。但是在字符串中，如果第一个字符串的后缀和第二个字符串的前缀形成了一个字位集，长度就会有变化了：

```swift
let flagLetterJ = "🇯"
let flagLetterP = "🇵"
let flag = flagLetterJ + flagLetterP // → "🇯🇵"
flag.count // → 1
flag.count == flagLetterJ.count + flagLetterP.count // → false
```

出于这种考虑，在 Swift 2 和 Swift 3 中，`String` 并没有被算作一个集合。这个特性是作为 `String` 的一个 [`characters`](https://developer.apple.com/documentation/swift/string/1540072-characters) 视图存在的，和其他几个集合视图一样：[`unicodeScalars`](https://developer.apple.com/documentation/swift/string/1539070-unicodescalars)，[`utf8`](https://developer.apple.com/documentation/swift/string/1539703-utf8) 和 [`utf16`](https://developer.apple.com/documentation/swift/string/1541301-utf16)。选择一个特定的视图，就相当于让程序员转换到另一种“处理集合”的模式，相应的，程序员就必须考虑到这种模式下可能产生的问题。

但是，在实际应用中，这个改变提升了学习成本，降低了可用性；单单为了保证在那些极端个例中的正确性（其实在真实应用中很少遇到，除非你写的是个文本编辑器的应用）做出这样的改变太不值得了。因此，在 Swift 4 中，`String` 再次成了一个集合。`characters` 视图还在，但是只是为了向后兼容 Swift 3。

### 双向获取，而非任意获取

然而，`String` 并**不是**一个可以任意获取的集合，原因的话，上一部分的几个例子已经展现的很清楚。一个字符到底是第几个字符取决于它前面有多少个 Unicode scalar，这样的情况下，根本不可能实现任意获取。由于这个原因，Swift 里面的字符串遵守双向获取（[`BidirectionalCollection`](https://developer.apple.com/documentation/swift/bidirectionalcollection)）规则。可以从字符串的两头数，代码会根据相邻字符的组成，跳过正确数量的字节。但是，每次访问只能上移或者下移一个字符。

在写处理字符串的代码的时候，要考虑到这种方式的操作对代码性能的影响。那些依靠任意获取来保证代码性能的算法对 Unicode 编码的字符串并不合适。我们看一个例子，我们要获取一个字符串所有 prefix 的列表。我们只需要得到一个从零到字符串长度的一系列整数，然后根据每个长度的整数在字符串中找到对应长度的 prefix：

```swift
extension String {
    var allPrefixes1: [Substring] {
        return (0...self.count).map(self.prefix)
    }
}

let hello = "Hello"
hello.allPrefixes1 // → ["", "H", "He", "Hel", "Hell", "Hello"]
```

尽管这段代码看起来很简单，但是运行性能很低。它先是遍历了字符串一次，计算出字符串的长度，这还 OK。但是每次对 [`prefix`](https://developer.apple.com/documentation/swift/substring/2893985-prefix) 进行 n+1 的调用都是一次 *O(n)* 操作，因为 `prefix` 方法需要从字符串的开头往后找出所需数量的字符。而在一个线性运算里进行另一个线性运算就意味着算法已经成了 *O(n2)* ——随着字符串长度的增加，算法所需的时间是呈指数级增长的。

如果可能的话，一个高性能的算法应该是遍历字符串一次，然后通过对字符串索引的操作得到想要的子字符串。下面是相同算法的另一个版本：

```swift
extension String {
    var allPrefixes2: [Substring] {
        return [""] + self.indices.map { index in self[...index] }
    }
}

hello.allPrefixes2 // → ["", "H", "He", "Hel", "Hell", "Hello"]
```

这段代码只需要遍历字符串一次，得到字符串的索引（[`indices`](https://developer.apple.com/documentation/swift/bidirectionalcollection/1785188-indices)）集合。一旦完成之后，之后再 `map` 内的操作就只是 *O(1)*。整个算法也只是 *O(n)*。

### 范围可替换，不可变

`String` 还遵从于 [`RangeReplaceableCollection`](https://developer.apple.com/documentation/swift/rangereplaceablecollection) （范围可替换）的集合操作。也就是说，你可以先按字符串索引的形式定义出一个范围，然后通过调用 [`replaceSubrange`](https://developer.apple.com/documentation/swift/string/1641462-replacesubrange) （替换子范围）方法，替换掉字符串中的一些字符。这里有一个例子。替换的字符串可以有不同的长度，甚至还可以是空的（这时候就相当于调用 [`removeSubrange`](https://developer.apple.com/documentation/swift/string/2893740-removesubrange) 方法了）：

```swift
var greeting = "Hello, world!"
if let comma = greeting.index(of: ",") {
    greeting[..<comma] // → "Hello"
    greeting.replaceSubrange(comma..., with: " again.")
}
greeting // → "Hello again."
```

同样，这里也要注意一个问题，如果替换的字符串和原字符串中相邻的字符形成了新的字位集，那结果可能就会有点出人意料了。

字符串无法提供的一个类集合特性是：[`MutableCollection`](https://developer.apple.com/documentation/swift/mutablecollection)。该协议给集合除 `get` 之外，添加了一个通过下标进行单一元素 `set` 的特性。这并不是说字符串是不可变的——我们上面已经看到了，有好几种变化的方法。你无法完成的是使用下标操作符替换其中的一个字符。许多人直觉认为用下标操作符替换一个字符是即时发生的，就像数组 [`Array`](https://developer.apple.com/documentation/swift/array) 里面的替换一样。但是，因为字符串里的字符长度是不定的，所以替换一个字符的时间和字符串的长度呈线性关系：替换一个元素的宽度会把其他所有元素在内存中的位置重新洗牌。而且，替换元素索引后面的元素索引在洗牌之后都变了，这也是跟人们的直觉相违背的。出于这些原因，你必须使用 `replaceSubrange` 进行替换，即使你变化只是一个元素。

## 字符串索引

大多数编程语言都是用整数作为字符串的下标，例如 `str[5]` 就会返回 `str` 的第六个“字符”（无论这个语言定义的“字符”是什么）。Swift 却不允许这样。为什么呢？原因可能你已经听了很多遍了：下标应该是使用固定时间的(无论是直觉上，还是根据集合协议)，但是查询第 n 个“字符”的操作必须查询它前面所有的字节。

[字符串索引（`String.Index`）](https://developer.apple.com/documentation/swift/string.index) 是字符串及其视图使用的索引类型。它是个不透明值（opaque value，内部使用的值，开发者一般不直接使用），本质上存储的是从字符串开头算起的字节偏移量。如果你想计算第 n 个字符的索引，它还是一个 *O(n)* 的操作，而且你还是必须从字符串的开头开始算起，但是一旦你有了一个正确的索引之后，对这个字符串进行下标操作就只需要 *O(1)* 次了。关键是，找到现有索引后面的元素的索引的操作也会变得很快，因为你只需要从已有索引字节后面开始算起了——没有必要从字符串开头开始了。这也是为什么有序（向前或是向后）访问字符串里的字符效率很高的原因。

字符串索引操作的依据跟你在其他集合里使用的所有 API 一样。因为我们最常用的集合——数组——使用的是整数索引，我们通常使用简单的算术来操作，所以有一点很容易忘记： [`index(after:)`](https://developer.apple.com/documentation/swift/string/1782583-index) 方法返回的是下一个字符的索引：

```swift
let s = "abcdef"
let second = s.index(after: s.startIndex)
s[second] // → "b"
```

使用 [`index(_:offsetBy:)`](https://developer.apple.com/documentation/swift/string/1786175-index)方法，你可以通过一次操作，自动地访问多个字符，

```swift
// Advance 4 more characters
let sixth = s.index(second, offsetBy: 4)
s[sixth] // → "f"
```

如果可能超出字符串末尾，你可以加一个 [`limitedBy:`](https://developer.apple.com/documentation/swift/anybidirectionalcollection/1781464-index) 参数。如果在访问到目标索引之前到达了字符串的末尾，这个方法会返回一个 `nil` 值。

```swift
let safeIdx = s.index(s.startIndex, offsetBy: 400, limitedBy: s.endIndex)
safeIdx // → nil
```

比起简单的整数索引，这无疑使用了更多的代码。**这是 Swift 故意的。**如果 Swift 允许对字符串进行整数索引，那不小心写出性能烂到爆的代码（比如在一个循环中使用整数的下标操作）的诱惑太大了。

然而，对一个习惯于处理固定宽度字符的人来说，刚开始使用 Swift 处理字符串会有些挑战——没有了整数索引怎么搞？而且确实，一些看起来简单的任务处理起来还得大动干戈，比如提取字符串的前四个字符：

```swift
s[..<s.index(s.startIndex, offsetBy: 4)] // → "abcd"
```

不过谢天谢地，你可以使用集合的接口来获取字符串，这意味着许多适用于数组的方法同样也适用于字符串。比如上面那个例子，如果使用 `prefix` 方法就简单得多了：

```swift
s.prefix(4) // → "abcd"
```

（注意，上面的几个方法返回的都是子字符串 [`Substring`](https://developer.apple.com/documentation/swift/substring)，你可以使用一个 `String.init` 把它转换为字符串。关于这一部分，我们下一部分会讲更多。）

没有整数索引，循环访问字符串里的字符也很简单，用 `for` 循环。如果你想按顺序排列，使用 [`enumerated()`](https://developer.apple.com/documentation/swift/sequence/1641222-enumerated)：

```swift
for (i, c) in s.enumerated() {
    print("\(i): \(c)")
}
```

或者如果你想找到一个特定的字符，你可以使用 [`index(of:)`](https://developer.apple.com/documentation/swift/string/2893264-index):

```swift
var hello = "Hello!"
if let idx = hello.index(of: "!") {
    hello.insert(contentsOf: ", world", at: idx)
}
hello // → "Hello, world!"
```

[`insert(contentsOf:at:)`](https://developer.apple.com/documentation/swift/string/2893571-insert) 方法可以在指定索引前插入相同类型的另一个集合（比如说字符串里的字符）。并不一定是另一个字符串，你可以很容易地把一个字符的数组插入到一个字符串里。

## 子字符串

和其他的集合一样，字符串有一个特定的切片类型或者说子序列类型（[`SubSequence`](https://developer.apple.com/documentation/swift/collection/1641276-subsequence)）：子字符串（[`Substring`](https://developer.apple.com/documentation/swift/substring)）。子字符串就像是一个数组切片（[`ArraySlice`](https://developer.apple.com/documentation/swift/arrayslice)）：它是原字符串的一个视图，起始索引和结束索引不同。子字符串共享原字符串的文本存储空间。这是一个很大的优势，对一个字符串进行切片操作不占用内存空间。在下面的例子中，创建`firstWord`变量不占用内存：

```swift
let sentence = "The quick brown fox jumped over the lazy dog."
let firstSpace = sentence.index(of: " ") ?? sentence.endIndex
let firstWord = sentence[..<firstSpace] // → "The"
type(of: firstWord) // → Substring.Type
```

切片操作不占用内存意义重大，特别是在一个循环中，比如你要通过循环访问整个字符串（可能会很长）来提取其中的字符。比如在文本中找到一个单词使用的次数，比如解析一个 CSV 文件。这里有一个非常有用的字符串处理操作：split。`split` 是 `Collection` 集合中定义的一个方法，它会返回一个子序列的数组（即 `[Substring]` ）。它最常见的变种就像是这样：

```swift
extension Collection where Element: Equatable {
    public func split(separator: Element, maxSplits: Int = Int.max,
        omittingEmptySubsequences: Bool = true) -> [SubSequence]
}
```

你可以这样使用：

```swift
let poem = """
    Over the wintry
    forest, winds howl in rage
    with no leaves to blow.
    """
let lines = poem.split(separator: "\n")
// → ["Over the wintry", "forest, winds howl in rage", "with no leaves to blow."]
type(of: lines) // → Array<Substring>.Type
```

这个跟 `String` 继承自 `NSString` 的 [`components(separatedBy:)`](https://developer.apple.com/documentation/swift/stringprotocol/2923413-components) 方法的功能类似，你还可以用一些额外设置比如是否抛弃空的组件。而且在这个操作中，所有输入字符串都没有创建新的复制。因为还有其他`split`方法的变种可以完成操作，除了比较字符以外，`split` 还可以完成更多的事情。下面这个例子是文本换行算法的一个原始的实现，最后的代码计算了行的长度：

```Swift
extension String {
    func wrapped(after: Int = 70) -> String {
        var i = 0
        let lines = self.split(omittingEmptySubsequences: false) {
            character in
            switch character {
            case "\n", " " where i >= after:
                i = 0
                return true
            default:
                i += 1
                return false
            }
        }
        return lines.joined(separator: "\n")
    }
}

sentence.wrapped(after: 15)
// → "The quick brown\nfox jumped over\nthe lazy dog."
```

或者，考虑写另外一个版本，可以拿到一个包含多个分隔符的序列：

```Swift
extension Collection where Element: Equatable {
    func split<S: Sequence>(separators: S) -> [SubSequence]
        where Element == S.Element
    {
        return split { separators.contains($0) }
    }
}
```

这样的话，你还可以这么写：

```swift
"Hello, world!".split(separators: ",! ") // → ["Hello", "world"]
```

### 字符串协议 `StringProtocol`

`Substring` 和 `String` 几乎有着相同的接口，因为两种类型都遵守一个共同的字符串协议（[`StringProtocol`](https://developer.apple.com/documentation/swift/stringprotocol)）。因为几乎所有的字符串API 都是在 [`StringProtocol`](https://developer.apple.com/documentation/swift/stringprotocol) 中定义的，所以操作 `Substring` 跟操作 `String` 没有什么大的区别。但是，在有些情况下，你还必须把子字符串转换为字符串的类型；就像所有的切片（slice）一样，子字符串只是为了短时间内的存储，为了防止一次操作定义太多个复制。如果操作结束之后，你还想保留结果，将数据传到另一个子系统里，你应该创建一个新的字符串。你可以用一个 `Substring` 的值初始化一个 `String`，就像我们在这个例子中做的：

```swift
func lastWord(in input: String) -> String? {
    // Process the input, working on substrings
    let words = input.split(separators: [",", " "])
    guard let lastWord = words.last else { return nil }
    // Convert to String for return
    return String(lastWord)
}

lastWord(in: "one, two, three, four, five") // → "five"
```

不建议子字符串长期存储背后的原因是子字符串一直关联着原字符串。即使一个超长字符串的子字符串只有一个字符，只要子字符串还在使用，那原先的字符串就还会在内存里，即使原字符串的生命周期已经结束。因此，长期存储子字符串可能导致内存泄漏，因为有时候原字符串已经无法访问了，但是还在占用内存。

操作过程中使用子字符串，操作结束的时候才创建新的字符串，通过这种方式，我们把占用内存的动作推迟到了最后一刻，而且保证了我们只会创建必要的字符串。在上面的例子当中，我们把整个字符串（可能会很长）分成了一个个的子字符串，但是在最后只是创建了一个很短的字符串。（例子中的算法可能效率不是那么高，暂时忽略一下；从后先前找到第一个分隔符可能是个更好的方法。）

遇到只接受 `Substring` 类型的方法，但是你想传递一个 `String` 的类型，这种情况很少见（大部分的方法都接受 `String` 类型或者接受所有符合字符串协议的类型），但是如果你确实需要传递一个 `String` 的类型，最便捷的方法是使用范围操作符（range operator）`...`，不限定范围：

```swift
// 子字符串和原字符串的起始和结束的索引完全一致 
let substring = sentence[...]
```

---

`Substring` 类型是 Swift 4 中的新特性。在 Swift 3 中，`String.CharacterView` 是自己独有的切片类型（slice type）。这么做的优势是用户只需要了解一种类型，但这也意味这如果存储一个子字符串，整个原字符串也会占据内存，即使它正常情况下应该已经被释放了。Swift 4 损失了一点便捷，换来的是的方便的切片操作和可预测的内存使用。

要求 `Substring` 到 `String` 的转换必须明确写出，Swift 团队认为这没那么烦人。如果实际应用中大家都觉得问题很大，他们也会考虑直接在编译器中写一个 `Substring` 和 `String` 之间的[模糊子类型关系（implicit subtype relationship）](https://github.com/apple/swift/blob/master/docs/StringManifesto.md#substrings)，就像 `Int ` 是 `Optional<Int>` 的子类型一样。这样你就可以随意传递 `Substring` 类型，编译器会帮你完成类型转换。

---

你可能会倾向于充分利用字符串协议，把你所有的 API 写成接受所有遵守字符串协议的实例，而不是仅仅接受 `String` 字符串。但 Swift 团队的建议是，[别这样](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20170626/037828.html)：

> 总的来说，我们建议继续使用字符串变量。 使用字符串变量，大多数的 API 都会比把它们写成通用类型（这个操作本身就有一些代价）更加简洁清晰，用户在必要的时候进行一些转换并不需要花费很大的精力。

一些 API 极有可能和子字符串一起使用，同时无法泛化到适用于整个序列 `Sequence` 或集合 `Collection` 的级别，这些 API 可以不受这条规则的限制。一个例子就是标准库中的 [`joined`](https://developer.apple.com/documentation/swift/sequence/1641243-joined) 方法。Swift 4 中，针对遵守字符串协议的元素组成的序列（`Sequence`）添加了一个重载（`overload`）：

```swift
extension Sequence where Element: StringProtocol {
    /// 两个元素中间加上一个特定分隔符后
    /// 合并序列中所有元素，返回一个新的字符串
    /// Returns a new string by concatenating the elements of the sequence,
    /// adding the given separator between each element.
    public func joined(separator: String = "") -> String
}
```

这样，你就可以直接对一个子字符串的数组调用 `joined` 方法了，没必要遍历一次数组并且把每个子字符串转换为新的字符串。这样，一切都很方便快速。

数值类型初始器（number type initializer）可以将字符串转换为一个数字。在 Swift 4 中，它也接受遵守字符串协议的值。如果你要处理一个子字符串的数组的话，这个方法很顺手：

```swift
let commaSeparatedNumbers = "1,2,3,4,5"
let numbers = commaSeparatedNumbers
    .split(separator: ",").flatMap { Int($0) }
// → [1, 2, 3, 4, 5]
```

由于子字符串的生命周期很短，所以不建议方法的返回值是子字符串，除非是序列 `Sequence` 或集合 `Collection` 的一些返回切片的 API。如果你写了一个类似的方法，只对字符串有意义，那让它的返回值是子字符串，好让读者明白这个方法并不会产生复制，不会占用内存。创建新字符串的方法需要占用内存，比如 [`uppercased()`](https://developer.apple.com/documentation/swift/stringprotocol/2908613-uppercased)，这类的方法应该返回 `String` 字符串类型的值。

如果你想为字符串类型扩展新的功能， 好的办法是将扩展放在字符串协议 `StringProtocol` 上，保证 API 在字符串和子字符串层面的一致性。字符权协议的设计初衷就是替换原先在字符串基础上做的扩展功能。如果你想把现有的扩展从字符串转移到字符串协议上，你要做的唯一改变就是，把传递 `Self` 给只接受具体 `String` 值的 API替换为 `String(Self)`。

需要记住的一点是，从 Swift 4开始，如果你有一些自定义的字符串类型，不建议遵守字符串协议`StringProtocol`。官方文档明确警告：

> 不要做任何新的遵守字符串协议 `StringProtocol` 的声明。只有标准库里的 `String` 和 `Substring` 是有效的遵守类型。

允许开发者写自己的字符串类型（比如有特殊的存储优化或性能优化）是终极目标，但是现阶段协议的设计还没有最终确定，所以现在就启用它可能会导致你的代码在 Swift 5里无法正常运行。

`… <SNIP>  <内容有删减>…`

## 总结

Swift 语言里的字符串跟其他所有的主流编程语言里的字符串差异很大。当你习惯于把字符串当做代码块的数组后，你得花点时间转化思维，习惯 Swift 的处理方法：它把遵守 Unicode 编码标准放在**简洁**前面。

总的来讲，我们认为 Swift 的选择是正确的。Unicode 编码文本比其他编程语言所认为的要复杂得多。长远来看，处理你可能写出来的 bug 的时间肯定比学习新的索引方式（忘记整数索引）所需的时间多。

我们已经习惯于任意获取“字符”，以至于我们都忘了其实这个特性在真正的字符串处理的代码里很少用到。我们希望通过这一章里的例子可以说服大家，对于大多数常规的操作，简单的按序遍历也完全 OK。强迫你清楚地写出你想在哪个层面（字位集，Unicode scalar，UTF-16 代码块，UTF-8 代码块）处理字符串是另一项安全措施；读你代码的人会对你心存感激的。

2016年7月，Chris Lattner 谈到了 [Swift 语言字符串处理的目标](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20160725/025676.html)，他最后是这么说的：

> 我们的目标是在字符串处理上超越 Perl。

当然 Swift 4 还没有实现这个目标——很多想要的特性还没实现，包括把 Foundation 库中的诸多字符串 API 转移到标准库，正则表达式的自然语言支持，字符串格式化和解析 API，更强大的字符串插入功能。好消息是 Swift 团队已经表示 [会在将来解决所有这些问题](https://github.com/apple/swift/blob/master/docs/StringManifesto.md)。

------

如果喜欢本文的话，请考虑[购买全书](https://gumroad.com/a/507458675)。谢谢！

全书中第一张是本文的两本。讨论了其他的一些问题，包括如何使用以及什么时候使用字符串的代码块视图，如何和 Foundation里的处理字符串的 API（例如 [`NSRegularExpression`](https://developer.apple.com/documentation/foundation/nsregularexpression) 或者 [`NSAttributedString`](https://developer.apple.com/documentation/foundation/nsattributedstring)） 配合处理。贴别是后面这个问题很难，而且很容易犯错。除此之外还讨论了其他标准库里面机遇字符串的 API，例如文本输出流（[`TextOutputStream`](https://developer.apple.com/documentation/swift/textoutputstream)）或自定义字符串转换（[`CustomStringConvertible`](https://developer.apple.com/documentation/swift/customstringconvertible)）。
