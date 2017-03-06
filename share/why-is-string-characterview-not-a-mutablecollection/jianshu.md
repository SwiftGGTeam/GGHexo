为何 String.CharacterView 不是 MutableCollection"

> 作者：Ole Begemann，[原文链接](https://oleb.net/blog/2017/02/why-is-string-characterview-not-a-mutablecollection/)，原文日期：2017-02-07
> 译者：[Cwift](http://weibo.com/277195544)；校对：[walkingway](http://chengway.in/)；定稿：[CMB](https://github.com/chenmingbiao)
  









本系列的其他文章：
（1）[Dictionary and Set](https://oleb.net/blog/2017/02/why-is-dictionary-not-a-mutablecollection/)
（2）String.CharacterView（本文）

在 [上一篇文章](https://oleb.net/blog/2017/02/why-is-dictionary-not-a-mutablecollection/) 中，我讨论了为什么 Set 和 Dictionary 不能遵守 MutableCollection 和 RangeReplaceableCollection。今天轮到 [String.CharacterView](https://developer.apple.com/reference/swift/string.characterview) 了。

CharacterView 遵守了 [RangeReplaceableCollection](https://developer.apple.com/reference/swift/rangereplaceablecollection)，但不能遵守 [MutableCollection](https://developer.apple.com/reference/swift/mutablecollection)。这是为什么呢？字符串明显是可变的; 从逻辑来看它应该遵守 MutableCollection 协议。我们需要再次回过头来考虑下协议的[语义](https://oleb.net/blog/2016/12/protocols-have-semantics/)。

[MutableCollection 的文档](https://developer.apple.com/reference/swift/mutablecollection)制定了以下要求：

> MutableCollection 协议允许更改集合中元素的值，但不允许更改集合本身的长度...
> 在 MutableCollection 实例的某个下标位置保存的值，之后必须可以在同一位置访问。也就是说，对于可变集合实例 a，索引 i 和值 x，以下代码示例中的两组赋值必须是等价的：

    
    a[i] = x
    let y = a[i]
    // 必须等同于
    a[i] = x
    let y = x



## 替换字符可能使索引失效

用 CharacterView 尝试一下。开始有一个初始字符串 a 和一个指向 “_” 字符的索引 i ，然后用一个表情符号（新值 x）来替换它：

    
    var a = "Grinning face: _".characters
    let i = a.index(of: "_")!
    // 校验 a[i]
    a[i] // → "_"
    
    let x: Character = "😀"

a[i] = x 不能理解成替换，因为缺少了 MutableCollection 协议中的一致性，但是可以用[ replaceSubrange(_:with:) ](https://developer.apple.com/reference/swift/string/1778790-replacesubrange)来实现该行为：

    
    //a[i] = x 的解决方案
    a.replaceSubrange(i...i, with: CollectionOfOne(x))
    
    // 替换的工作过程:
    String(a) // → "Grinning face: 😀"
    // 现在 a[i] 应该仍旧返回 "_":
    a[i] // → "�" 错误！

a[i] 返回了 � （[Unicode 的替换字符 U + FFFD](https://codepoints.net/U+FFFD)），这是错误的标志。replaceSubrange 方法执行了，但是索引 i 不再有效。用 [dump](https://developer.apple.com/reference/swift/1539127-dump) 函数来查看它的底层结构，就能知道上例的原因：

    
    let newIndex = a.index(of: "😀")!
    dump(newIndex)
    /* →
    ▿ Swift.String.CharacterView.Index
      ▿ _base: Swift.String.UnicodeScalarView.Index
        - _position: 15
      - _countUTF16: 2
    */

可以看到，单个字符的突变会导致该字符的索引无效。String.CharacterView 违反了 MutableCollection 协议的语义，所以不能遵守它。RangeReplaceableCollection 的语义不同，所以 CharacterView 可以遵守它。

## 字符具有可变长度的编码

观察一下 MutableCollection 的另一个准则，即突变不能影响集合的总长度。CharacterView 可以满足这个要求：一个字符的长度总是 1，所以字符间的替换可以保持字符串的总长度不变。但是，在底层存储中，对[每一个字符](https://oleb.net/blog/2016/12/emoji-4-0/)来说，字符本身的*尺寸*是[不同](https://oleb.net/blog/2016/08/swift-3-strings/)的。因此替换单个字符可能会使后续文本在内存中向前或向后移动几个字节，从而为本次替换操作留足空间。这使得简单的下标赋值操作是潜在的[ O(n) ](https://en.wikipedia.org/wiki/Big_O_notation) 复杂度操作，而下标取值为 O(1) 复杂度。以下引用来自 [Collection 的文档](https://developer.apple.com/reference/swift/collection)：

> 遵守 Collection 协议的类型应该提供 startIndex 和 endIndex 属性，并为元素提供 O(1) 复杂度的下标访问。不能保证预期性能的类型应做出标注，因为许多集合的高效操作依赖于 O(1) 复杂度的下标操作。

这里只谈到了下标的 getter 方法，并且 MutableCollection 的文档中没有提到任何有关 setter 方法的预期性能，不过假设它与 Collection 具有相同的特性应该是合理的。

## Unicode 的副作用

响应 CharacterView 遵守 MutableCollection 的最终潜在问题是 [Unicode](https://en.wikipedia.org/wiki/Unicode) 和它带来的复杂性。[组合字符](https://en.wikipedia.org/wiki/Combining_character)的存在意味着，替换单个字符时如果新字符与其之前的字符发生了组合，替换单个字符实际上可以改变字符串的长度（以字符度量）。

在以下示例中，我们将“1_”中的下划线替换为 [U + 20E3 COMBINING ENCLOSING KEYCAP](https://codepoints.net/U+20E3)，然后将其与之前的字符组合：

    
    var s = "1_".characters
    s.count // → 2，意料之中
    let idx = s.index(of: "_")!
    
    // U+20E3 COMBINING ENCLOSING KEYCAP
    let keycap: Character = "\u{20E3}"
    
    // 用 keycap 替换 _
    s.replaceSubrange(idx...idx, with: [keycap])
    
    // keycap 和它前面的字符组合起来了
    String(s) // → "1⃣"
    //长度变成 1 了
    s.count // → 1

结果字符串 “1⃣” 只有1个字符长，再次违反了 MutableCollection 的语义。 并且访问 s[idx] 将发生崩溃，因为索引指向了不再存在的位置。可以说，这个例子的主要观点并不在于 CharacterView 是否违反 MutableCollection 的语义，而是 Unicode 是复杂的并且容易被滥用 —— 你通常不应该把组合字符中的字符拆开来用。仅仅一些违背协议语义的晦涩的 Unicode 副作用，不足以为成为 CharacterView 违反该协议的理由。Unicode 是如此的复杂，以至于它的特性不可能完全满足泛型的集合协议的约束。

因此，[String 可能会在 Swift 4 中再次成为一个集合](https://github.com/apple/swift/blob/master/docs/StringManifesto.md#string-should-be-a-collection-of-characters-again)，同时承认一些操作可能会出现违背严格的集合语义的“退化”情况。

正如我们所看到的，Unicode 在这种情况下不是决定因素。 还有其他一些东西，使 CharacterView 与 MutableCollection 语义不兼容。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。