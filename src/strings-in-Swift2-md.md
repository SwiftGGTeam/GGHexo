title: "苹果官方博客：Swift 2.0 中的字符串"
date: 2015-08-24 07:04:02
tags: [Swift]
categories: [Official Blog]
permalink: strings-in-Swift2

---
原文链接=https://developer.apple.com/swift/blog/?id=30
作者=Apple
原文日期=2015/07/23
译者=小锅
校对=千叶知风
定稿=numbbbbb

Swift 在它的标准库中提供了高效、Unicode 兼容的字符串实现。在 Swift 2.0 中，字符串不再遵守 `CollectionType` 协议，而在此之前，字符串被视为是一系列 `Character` 类型值的集合，行为与数组十分类似。现在，字符串提供了一个 `characters` 属性，可以获得这个字符串所包含的 `Character` 集合。

<!--more-->

为何要有这样的改变呢？尽管把字符串当作一系列字符的集合是十分自然的想法，然而字符串的行为与普通的集合类型，比如 `Array`、 `Set` 或 `Dictionary` 很不一样。虽然过去也存在差异，但是 Swift 2.0 推出了协议扩展，因此我们有必要针对这些差异做出一些根本性的改变。

## 与字序列的总合不同

向一个集合中添加元素时，我们期望这个集合将会包含这个元素。也就是说，向一个数组添加一个值时，这个数组将会包含这个值。这对集合(set)和字典也适用。但是，当我们向字符串添加一个组合标记字符(combing mark character)时，字符串的内容将会发生改变。

比如 `cafe` 这个字符串，它包含了 `c`、 `a`、 `f` 和 `e` 四个字符：

```swift
var letters: [Character] = ["c", "a", "f", "e"]
var string: String = String(letters)

print(letters.count) // 4
print(string) // cafe
print(string.characters.count) // 4
```

如果向字符串中添加一个组合重音字符 `U+0301` `´`，这个字符串还是包含四个字符，但是最后一个字符将会变为 `é`：

```swift
let acuteAccent: Character = "\u{0301}" // ´ COMBINING ACUTE ACCENT' (U+0301)

string.append(acuteAccent)
print(string.characters.count) // 4
print(string.characters.last!) // é
```

该字符串的 `characters` 属性将不包含原来的小写字母 `e`，也不会包含刚刚添加的重音符号 `´`。 它会给小写字母 “e”  添加重音符号，使其变成 `é`：

```swift
string.characters.contains("e") // false
string.characters.contains("´") // false
string.characters.contains("é") // true
```

如果我们将字符串与其它的集合类型等同视之，那么向集合(set)中添加 `UIColor.redColor()` 和 `UIColor.greenColor()` 就可能会得到 `UIColor.yellowColor()` 这样的奇怪结果。

## 根据字符内容进行判断

字符串与其它集合类型的另一个差异就是如何判断两个值是否相等。

- 两个数组只有在他们包含的元素个数完全一致并且每个位置上的元素都相等时，才被视为相等。
- 两个集合(set)只有在他们包含的元素个数完全一致，并且每个包含在第一个集合中的元素也被第二个集合所包含时，才被视为相等。
- 两个字典只有在他们包含相同的键值对时，才被视为相等。

然而，字符串是根据 *规范等价(canonically equivalent)* 来进行相等判断的。即使两个字符串的底层 Unicode 标量不一样，只要他们的语义跟表现形式是一致的，他们就被认为是相等的。

以韩语为例, 它们的手写形式包含了 24 个字母，或者称为 *Jamo*, 用以表达不同的元音和辅音。书写时，这些字母可以组合来代表音节。比如，“가” ([ga]) 这个字符是由字母 “ᄀ” ([g]) 和 “ᅡ” [a] 组合而成的。在 Swift 中判断字符串是否相等时，不会判断它们是否由其它字符组合而成，只会判断他们的语义与表达形式是否一致：

```swift
let decomposed = "\u{1100}\u{1161}" // ᄀ + ᅡ
let precomposed = "\u{AC00}" // 가

decomposed == precomposed // true
```

这个行为与 Swift 中其它的集合类型差别很大。试想，如果向一个数组当中添加 ![](/img/articles/strings-in-Swift2/20150812124230927) 和 ![](/img/articles/strings-in-Swift2/20150812124254804) 两个元素，最后却得到一个 ![](/img/articles/strings-in-Swift2/20150812124307442)，想必写这段代码的程序员也会很惊讶吧。

## 取决于你的视角

字符串虽然不是集合类型。但是它提供了多个遵守 `CollectionType` 协议的属性，以提供不同的*视角(views)*：

- `characters` 是 `Character` 类型的字符集合, 或者 [扩展字形集群(extended grapheme clusters)](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/Strings/Articles/stringsClusters.html)。
- `unicodeScalars` 是[Unicode 标量值( Unicode scalar values)](http://www.unicode.org/glossary/#unicode_scalar_value)的集合。
- `utf8` 是 [UTF–8](http://www.unicode.org/glossary/#UTF_8) 编码单元的集合。
- `utf16` 是 [UTF-16](http://www.unicode.org/glossary/#UTF_16) 编码单元的集合。

如果以前面示例中的单词 “café” 为例，将它分解成 [c, a, f, e] 和 [ ´ ] 的字符序列，下面以不同的视角来对这些字符序列进行表示：

![café字符序列视角](/img/articles/strings-in-Swift2/20150812123950088)

- `characters` 属性将文本分割为 *扩展字形集群(extended grapheme clusters)*，即与用户所直接看到相一致的字符序列(在此处即为 c, a, f 和 é)。取得这个属性的时间复杂度是线性的 `O(n)`, 因为字符串必须对整个字符串文本中的每一个位置(这里的位置被称为码位(code point))进行迭代以确定字符的边界。只要涉及到对人类可读(human-readable)文本，或者本地化(locale-sensitive)有关的 Unicode 算法时，比如 `localizedStandardCompare(_:)` 处理的字符串，或者 `localizedLowercaseString` 属性，都需要对字符串中的字符进行逐字的处理。 
- `unicodeScalars` 属性表示出了字符串底层所保存的标量值。如果原本的字符串是由预组合字符 `é` 而非分解的字符 `e` + `´` 所组成，则 `é` 会被以 Unicode标量的形式表示出来。当需要对字符串底层的字符数据进行处理的时候，我们可以使用这个 API。
- `utf8` 和 `utf16` 属性分别以 UTF-8 和 UTF-16 来对码位(code points)进行表示。这些数值与我们对一个特定的编码进行转换时，要真实写入文件的字节相对应。UTF-8 编码单元(code units)被许多 POSIX 的字符串处理 API 所使用，而 UTF-16 编码单元(code units)则被用于表示 Cocoa 和 Cocoa Touch中的字符串长度和偏移。

如果想了解更多 Swift 中关于的字符和字符串的信息，可以阅读[The Swift Programming Language](https://developer.apple.com/library/prerelease/ios/documentation/Swift/Conceptual/Swift_Programming_Language/StringsAndCharacters.html#//apple_ref/doc/uid/TP40014097-CH7-ID285) 和 [the Swift Standard Library Reference](https://developer.apple.com/library/prerelease/ios//documentation/Swift/Reference/Swift_String_Structure/index.html#//apple_ref/swift/struct/s:SS).

<center>![给译者打赏](/img/QRCode/buginux.jpg)</center>