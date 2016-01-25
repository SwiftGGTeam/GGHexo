Friday Q&A 2015-11-06：为什么 Swift 中的 String API 如此难用？"

> 作者：Mike Ash，[原文链接](https://www.mikeash.com/pyblog/friday-qa-2015-11-06-why-is-swifts-string-api-so-hard.html)，原文日期：2015-11-06
> 译者：[Cee](https://github.com/Cee)；校对：[numbbbbb](https://github.com/numbbbbb)；定稿：[numbbbbb](https://github.com/numbbbbb)
  










> 译者注：可以结合 WWDC 2015 Session 227 - What's New in Internationalization 一起学习

欢迎来到本期因修改了很多次稿而推迟发布的周五问答。我发现很多人在使用 Swift 时，都会抱怨 `String` API 很难用。它很难学习并且设计得晦涩难懂，大多数人希望它能采用其他语言的字符串（String） API 设计风格。今天我就要来讲一下为什么 Swift 中的 `String` API 会被设计成现在这样（最起码要解释清楚我的看法），以及为什么我最终会认为，就其基础设计而言 Swift 中的 `String` API 是字符串 API 中设计得最好的。

<!-- more -->
### 什么是字符串？

在我们讨论这点之前，首先需要建立一个基本的概念。我们总是把字符串想得很肤浅，很少有人能够深入思考它的本质。深思熟虑才能有助于我们理解接下来的内容。

从概念上来说，什么*是*字符串呢？从表面上看，字符串就是一段文本。`"Hello, World"` 是字符串；`"/Users/mikeash"` 和 `"Robert'); DROP TABLE Students;--"` 也是字符串。

（顺道讲一下，我认为不应该把这些不同的文本表述概念看作是同样的字符串类型。人类可读的文本、文件路径、SQL 查询语句，以及其他所有在概念上讲并不相同的东西，在语言表示层面上都应该被表示成不同的类型。我觉得这些概念上不同的字符串应当有不同的类型，这也能大幅减少 bug 数量。尽管我并没有发现有哪个语言或者标准库做到了这点。）

那么在底层，这些常见的「文本」概念又是怎么被表示的呢？唔，得看情况。有很多不同的解决方法。

在很多语言中，字符串是用于存放字节（bytes）的数组（array）。程序所要做的就是为这些字节赋值。这种字符串的表示方法在 C++ 中是 `std::string` 类型，Python 2、Go 和其他语言也是这样。

C 语言对于字符串的表示就比较古怪和特殊。在 C 语言中，字符串是指向一串非零字节序列（sequence of non-zero bytes）的指针，以零字节位表示字符串的结束。基本的使其实和数组一样，但是 C 语言中的字符串不能包含零字节位，并且诸如查询字符串长度这样的操作需要扫描内存。

很多新语言把字符串定义成了一串 UCS-2 或者 UTF-16 码元（code unit）的集合。Java、C# 还有 JavaScript 是其中的代表。同样，在 Objective-C 中也使用了 Cocoa 和 `NSString`。这可能是一个历史遗留问题。Unicode 在 1991 年被提出时（译者注：1991 年 10 月发布 Unicode 1.0.0），当时的系统都是 16 位。很多流行的编程语言在那个时代被设计出来，并且将 Unicode 作为字符串的构成基础。在 1996 年，Unicode 在 16 位系统上经历了爆发性的增长（译者注：1996 年 7 月发布了 Unicode 2.0，字库从 7161 个字元变成了 38950 个），这些语言再要改变字符串的编码方式已为时已晚。这时，由于 UTF-16 的编码方式能够将更大的数字编码为一组 16 位码元的集合，因此将字符串视为 16 位码元序列的基本想法就这样延续了下来。

这种想法的一个变体就是将字符串定义成 UTF-8 码元序列，其中组成的码元是 8 位的。总体上来说和 UTF-16 的表示方法很接近，但是对于 ASCII 字符串来说，能够有更加紧凑的表示空间，而且避免了在传递字符串进入函数时，由于这些函数只接受 C 语言风格类型（也就是 UTF-8 字符串）而导致的转换。

也有些语言将字符串表示为 Unicode 码位（code point）指向的一段字符序列。Python 3 中就是这么实现的，在很多 C 语言实现中也提供了内置的 `wchar_t` 类型。

简短概括一下，一个字符串通常情况下会被当做某些特定*字符（character）*的序列，其中字符通常是一个字节，或者是一个 UTF-16 码元，又或者是一个 Unicode 码位。

### 问题

将字符串表示成一段连续「字符」的序列的确很方便。你可以把字符串看作是数组（array）（通常情况下就*是*个数组），这样就很容易获得字符串的子串、从字符串头部或者尾部取出部分元素、删除字符串的某部分、获取字符总数，等等。

问题是我们身边遍布着 Unicode，而 Unicode 会让事情变得很复杂。简单看一个字符串的例子，看一下它是怎么工作的：

    aé∞𝄞

每一个 Unicode 码位都有一串数字（写作 U+nnnn）和一个供我们看得懂的命名（某种原因使用全大写的英文字母表示），这样我们更容易讨论单个字符所表示的内容。对于上面这个特定的字符串，它包括了：

+ U+0061 LATIN SMALL LETTER A
+ U+0065 LATIN SMALL LETTER E
+ U+0301 COMBINING ACUTE ACCENT
+ U+221E INFINITY
+ U+1D11E MUSICAL SYMBOL G CLEF

让我们从字符串的中间移除一个「字符」。对于这个「字符」，我们尝试用 UTF-8、UTF-16 和 Unicode 三种不同的字符编码方式来讲解。

首先将这个「字符」看作是一个 UTF-8 字符单元。这个字符串在 UTF-8 下看上去长这样：

    61 65 cc 81 e2 88 9e f0 9d 84 9e
        -- -- ----- -------- -----------
        a  e    ´      ∞          𝄞

我们来移除第 3 个「字符」，即第三个字节（cc）。结果是：

    61 65 81 e2 88 9e f0 9d 84 9e

这个字符串已经不再是个合法的 UTF-8 字符串。UTF-8 的字符编码有三类。对于那些 `0xxxxxxx` 表示的，即由 0 开头的，会被表示为 ASCII 字符，单独归为第一类。那些看上去形如 `11xxxxxx` 的，表示一个多位序列，长度由第一个 0 的位置决定。第三类表示成 `10xxxxxx`，说明一个多位序列的剩余部分。`cc`（译者注：即 `11001100`，划分在第二类。其中第一个 0 出现在从 0 开始计数的第 2 位，故整个多位序列由两个字节组成）表示了一个多位序列的开始，长度是两个字节，`81`（译者注：即 `10000001`，划分在第三类）表示了这个多位序列的尾部。如果移除了 `cc`，那么剩下的 `81` 将会被留在字符串中。所有 UTF-8 校验器都会拒绝识别这个字符串（译者注：因为 `81` 并不是合法的 UTF-8 头部字符，只有第一类和第二类的字符是合法的）。如果我们移除了从第三位之后的任意一个字符，这个问题依旧会发生。

那么如果是第二位呢？如果我们移除了这个字符，我们会得到：

    61 cc 81 e2 88 9e f0 9d 84 9e
        -- ----- -------- -----------
        a    ´      ∞          𝄞

看上去这依然是个合法的 UTF-8 字符串，但是结果并不是我们所期待的那样：

    á∞𝄞

对于人类来说，在这个字符串中的「第二个字符」应该是「é」。但是第二位上的字符仅仅是不带语调标记的「e」。这个语调标记被看作是一个「连接字符（combining character）」，被单独添加到前面的字符上。移除第二个字符仅仅是移去了「e」，导致这个语调标记连接到了「a」字符上。

那么如果移去首个字符呢？最终结果是我们所想要的那样：

    65 cc 81 e2 88 9e f0 9d 84 9e
        -- ----- -------- -----------
        e    ´      ∞          𝄞

让我们再把这个字符串当做 UTF-16 编码来看。在 UTF-16 编码下，这个字符串看上去长这个样子：

    0061 0065 0301 221e d834 dd1e
        ---- ---- ---- ---- ---------
         a    e    ´    ∞       𝄞

我们尝试着移除第二个「字符」：

    0061 0301 221e d834 dd1e
        ---- ---- ---- ---------
         a    ´    ∞       𝄞

和上面在 UTF-8 中出现的问题一样，删除了「e」，但是没有删除语调标记，导致这个标记附在了「a」上面。

那么如果删除第五个字符呢？我们得到了如下的序列：

    0061 0065 0301 221e dd1e

和不合法的 UTF-8 编码是类似的问题，这个序列也不再是一个合法的 UTF-16 字符串。序列 `d834 dd1e` 形成了一组代理对（surrogate pair），指两个 16 位的单元用于表示一个超过 16 位的码位（译者注：具体计算参考 [Wiki](http://www.wikiwand.com/zh/UTF-16#.E4.BB.8EU.2B10000.E5.88.B0U.2B10FFFF.E7.9A.84.E7.A0.81.E4.BD.8D)）。而让代理对中的一部分单独出现在字符串中是非法的。在 UTF-8 中通常会出错，而在 UTF-16 中这种状态会被忽略。例如，Cocoa 会将这个字符串渲染成这样：

    aé∞�

（译者注：即平时出现的乱码现象。）

那么如果一个字符串被表示成一串 Unicode 码位序列呢？字符串看上去是这样的：

    00061 00065 00301 0221E 1D11E
        ----- ----- ----- ----- -----
          a     e     ´     ∞     𝄞

对于这种表示方式，我们可以移除任意一个「字符」而不会导致产生一个非法的字符串。但是连接语调标记的问题*依然*存在。移除第二个字符将会是这样：

    00061 00301 0221E 1D11E
        ----- ----- ----- -----
          a     ´     ∞     𝄞

即使使用这种表示方法，我们也无法确保结果的正确。

这些通常不是我们能够简单想到的问题。英语是鲜有的几种仅使用 ASCII 字符就能表示的语言。你肯定不想把求职时的简历（Résumé）改成「Resume」吧！一旦超出 ASCII 字符集，这些荒谬的错误就开始出现了。

### 字素簇（Grapheme Clusters）

Unicode 中有个概念叫做*字素簇（Grapheme Clusters）*，本质上就是阅读时会被考虑成单个「字符」的最小单元。在大多数表示方法中，一个字素簇就等价于一个单独的码位，但是也有可能会表示成包括语调标记的一部分内容。如果我们将上面的例子表示成字素簇的方式，那么很显然会是这样的：

    a é ∞ 𝄞

移除任意一个作为字素簇的单元，留下的内容都会被认为是合情合理的。

注意到在这个例子中，并没有任何的数字等值 (numeric equivalents) 存在。这是因为与 UTF-8、UTF-16 或者普通的 Unicode 码位不同，单个数字无法在一般情况下表示字素簇 (grapheme cluster) 。所谓字素簇，指的是一个或多个码位的序列集合。一个字素簇通常会包含一个或两个码位，但是某些情况下（比如 [Zalgo](http://www.eeemo.net/) 中）字素簇中也可能会包含大量的码位。例如下面这个字符串：

    e⃝⃞⃟⃠⃣⃤⃥⃦⃪⃧꙰꙲꙱

这一团乱七八糟的字符串包括了 14 个不同的码位：

    + U+0065
    + U+20DD
    + U+20DE
    + U+20DF
    + U+20E0
    + U+20E3
    + U+20E4
    + U+20E5
    + U+20E6
    + U+20E7
    + U+20EA
    + U+A670
    + U+A672
    + U+A671
    
所有的这些码位单元都表示一个单独的字素簇。

下面有个有趣的例子。有这样一个包含瑞士国旗的字符串：

    🇨🇭

这个标记实际上包括两个码位：`U+1F1E8 U+1F1ED`。这两个码位又表示什么意思呢？

    + U+1F1E8 REGIONAL INDICATOR SYMBOL LETTER C
    + U+1F1ED REGIONAL INDICATOR SYMBOL LETTER H
    
Unicode 包含了 26 个「Regional indicator symbol」而不是将地球上的所有国家的国旗作为单独的码位。将 C 和 H 的两个标识符合起来你就能得到瑞士的国旗。将 M 和 X 合起来会得到墨西哥国旗。每个国旗都是一个单独的字符簇，但是由两个码位组成，即四个 UTF-16 码元或者八个 UTF-8 字节。

### 字符串 API 实现方式

我们发现字符串有多种理解方法，也有多种表示「字符」的方式。将「字符」当做一个字素簇可能最接近人们对于「字符」的理解，但是在代码中操作字符串时，要依据语言环境来判断所谓「字符」的含义。当在文本中移动插入光标时，光标经过的字符就是指字素簇。当为了保证文本满足 140 字限制的推文时，这里的字符就是 Unicode 码位。当字符串想要保存在限定长度是 80 个字符的数据库表中时，这里的字符就是个 UTF-8 字节。

那么当你在实现字符串时，如何来平衡性能、内存使用和简洁代码三者呢？

通常的回答是选择一种标准化表示（canonical representation），之后在需要其他表示方法时进行转换。例如，`NSString` 使用 UTF-16 作为其标准化表示法。整个 API 基于 UTF-16 建立。如果你想要处理 UTF-8 或者 Unicode 码位，你需要将原始字符串转化成 UTF-8 或者 UTF-32 表示然后再对结果进行操作。这种处理方式更多是将字符串视为数据对象，而不是视为字符串本身，所以在转换时并不是很方便。如果你要对字符簇进行操作，还需要使用 `rangeOfComposedCharacterSequencesForRange:` 方法找到它们和其他字符的分界位置，这是一项非常枯燥的任务。

Swift 的 `String` 类型则采用了另外一种方法。在这里面没有标准化的表示，而是为字符串的不同表示方式提供了*视图（view）*。这样无论处理哪种表示方式，你都能够灵活自如地操作。

### 简述 Swift 中的 String API

在旧版本中的 Swift 中，`String` 类遵循了 `CollectionType` 接口，将自己看做是 `Character` 元素的集合。在 Swift 2 中，这种表示已经不复存在，`String` 类会根据使用的不同情况，展现出不同的表现方式。

这种表示方式还不是很完善，`String` 仍然有点倾向于 `Character` 集合的表示方式，它依旧提供了有点类似集合处理的接口：

    
        public typealias Index = String.CharacterView.Index
        public var startIndex: Index { get }
        public var endIndex: Index { get }
        public subscript (i: Index) -> Character { get }

你可以通过 `String` 的索引获得单独的 `Character`。注意，你并不能通过标准的 `for in` 语法遍历整个字符串。

在 Swift 看来，一个「字符」究竟是什么？正如我们所见，有太多的可能性。Swift 中 String API 的实现基础是将一个字素簇看作一个「字符」。这看上去是一个非常不错的选择，因为正如我们所见，这种方式符合人类在字符串中对于一个「字符」的定义。

不同的视图在 `String` 类中作为属性展现。例如，`characters` 属性：

    
        public var characters: String.CharacterView { get }

`CharacterView` 是 `Character` 的一个集合：

    
        extension String.CharacterView : CollectionType {
            public struct Index ...
            public var startIndex: String.CharacterView.Index { get }
            public var endIndex: String.CharacterView.Index { get }
            public subscript (i: String.CharacterView.Index) -> Character { get }
        }

这看上去有点像 `String` 接口本身，除了它遵循 `CollectionType` 协议并且拥有所有 `CollectionType` 提供的方法外，它实现了划分（slice）、遍历（iterate）、映射（map）或者计数（count）方法。所以尽管下面的方法是不被允许的：

    
        for x in "abc" {}

但是这是行得通的：

    
        for x in "abc".characters {}

你可以使用构造函数从 `CharacterView` 中获得一个字符串：

    
        public init(_ characters: String.CharacterView)

你甚至可以从随机序列中获取 `Character` 作为一个字符串：

    
        public init<S : SequenceType where S.Generator.Element == Character>(_ characters: S)
        // 译者注：现在是 public init(_ characters: String.CharacterView)

继续我们的旅程，下一个是 UTF-32 字符视图。Swift 把 UTF-32 码元叫做「Unicode 标量（unicode scalars）」（译者注：参看 [Unicode scalar values](http://www.unicode.org/glossary/#unicode_scalar_value)），因为 UTF-32 码元与 Unicode 码位是等同的。这个（简化的）接口看上去是这样的：

    
        public var unicodeScalars: String.UnicodeScalarView
    
        public struct UnicodeScalarView : CollectionType, _Reflectable, CustomStringConvertible, CustomDebugStringConvertible {
            public struct Index ...
            public var startIndex: String.UnicodeScalarView.Index { get }
            public var endIndex: String.UnicodeScalarView.Index { get }
            public subscript (position: String.UnicodeScalarView.Index) -> UnicodeScalar { get }
        }

类似于 `CharacterView`，在 `UnicodeScalarView` 内部也有个 `String` 的构造函数：

    
        public init(_ unicodeScalars: String.UnicodeScalarView)

不幸的是，`UnicodeScalar` 序列没有实例化方法，所以在操作时需要做一点额外工作，例如，需要将这些字符转换成数组，然后再将数组转化成字符串。同时，在 `UnicodeScalarView` 中也没有接受 `UnicodeScalar` 序列作为参数的实例化方法。然而，Swift 提供了一个在尾部添加元素的函数，所以你可以通过下面三步建立一个 `String`。

    
        var unicodeScalarsView = String.UnicodeScalarView()
        unicodeScalarsView.appendContentsOf(unicodeScalarsArray)
        let unicodeScalarsString = String(unicodeScalarsView)

接下来是 UTF-16 字符视图，看上去和其他的也很类似：

    
        public var utf16: String.UTF16View { get }
    
        public struct UTF16View : CollectionType {
            public struct Index ...
            public var startIndex: String.UTF16View.Index { get }
            public var endIndex: String.UTF16View.Index { get }
            public subscript (i: String.UTF16View.Index) -> CodeUnit { get }
        }

在这个视图中，`String` 的实例化方法又有细微的差别：

    
        public init?(_ utf16: String.UTF16View)

与其他的方法不同，这是一个可能会构造失败的构造方法（译者注：注意 `init?`）。任何 `Character` 或者 `UnicodeScalar` 的序列都是一个合法的 `String`，但是对于以 UTF-16 作为码元的序列，可能无法将其转化成一个合法的字符串。当内容非法时，构造方法将返回 `nil`。

将任意一个 UTF-16 码元序列转换成一个 `String` 类型的字符串非常困难。`UTF16View` 没有公共的构造方法，并且只有很少几个转换方法。这个问题的解决方法就是使用全局 `transcode` 函数，它已经遵循 `UnicodeCodecType` 协议。`UTF8`、`UTF16` 和 `UTF32` 这三个类中分别实现了这个协议，通过 `transcode` 函数可以实现三者的互相转化，虽然很不优雅。对于输入，函数接受一个 `GeneratorType` 类型的参数，中间通过一个用于产生输出结果每一位的函数进行转化。这可将一个 `UTF16` 字符串一点一点地转化成 `UTF32` 类型字符串，接着再将每个 `UTF-32` 码元转化成对应的 `UnicodeScalar`，拼接到 `String` 中：

    
        var utf16String = ""
        transcode(UTF16.self, UTF32.self, utf16Array.generate(), { utf16String.append(UnicodeScalar($0)) }, stopOnError: true)
        // 译者注：transcode 方法的几个参数：
        // 1. inputEncoding: InputEncoding.Type
        // 2. _ outputEncoding: OutputEncoding.Type
        // 3. _ input: Input
        // 4. _ output: (OutputEncoding.CodeUnit) -> ()
        // 5. stopOnError: Bool
        // 这里缺少 utf16Array，可以尝试在第二行代码前加入
        // let utf16Array = Array(String(count: 9999, repeatedValue: Character("X")).utf16)
        // 来测试结果

最后我们来看一下 UTF-8 字符视图。实现方式和我们之前介绍的一样：

    
        public var utf8: String.UTF8View { get }
    
        public struct UTF8View : CollectionType {
            /// A position in a `String.UTF8View`.
            public struct Index ...
            public var startIndex: String.UTF8View.Index { get }
            public var endIndex: String.UTF8View.Index { get }
            public subscript (position: String.UTF8View.Index) -> CodeUnit { get }
        }

另外在定义中也有一个构造函数。和 `UTF16View` 一样，这也是一个可能失败的构造方法，因为由 UTF-8 码元组成的序列也有可能是不合法的。

    
        public init?(_ utf8: String.UTF8View)

和前者类似，这儿也没有一种简便的方法将任意一个 UTF-8 码元组成的序列转换成 `String` 类型。仍然可以使用 transcode 方法：

    
        var utf8String = ""
        transcode(UTF8.self, UTF32.self, utf8Array.generate(), { utf8String.append(UnicodeScalar($0)) }, stopOnError: true)
        // 译者注：自行补充 utf8Array

因为每次调用 `transcode` 方法实在是太痛苦了，我将它们用在了这一对可能会构造失败的构造函数中：

    
        extension String {
            init?<Seq: SequenceType where Seq.Generator.Element == UInt16>(utf16: Seq) {
                self.init()
    
                guard transcode(UTF16.self,
                                UTF32.self,
                                utf16.generate(),
                                { self.append(UnicodeScalar($0)) },
                                stopOnError: true)
                                == false else { return nil }
            }
    
            init?<Seq: SequenceType where Seq.Generator.Element == UInt8>(utf8: Seq) {
                self.init()
    
                guard transcode(UTF8.self,
                                UTF32.self,
                                utf8.generate(),
                                { self.append(UnicodeScalar($0)) },
                                stopOnError: true)
                                == false else { return nil }
            }
        }

通过这个构造函数，我们能将任意一个 UTF-8 或 UTF-16 码元组成的序列转化成 `String` 类型的字符串：

    
        String(utf16: utf16Array)
        String(utf8: utf8Array)

### 索引

上面介绍的不同视图都可用于索引 （Indexes）集合，但是它们并*不*是数组。索引类型是一种非常诡异的自定义`结构体（struct）`。这意味着你不能通过数字来读取不同视图中的内容：

    
        // all errors
        string[2]
        string.characters[2]
        string.unicodeScalars[2]
        string.utf16[2]
        string.utf8[2]

不过你可以使用集合类型的 `startIndex` 或者是 `endIndex` 属性，并且使用 `successor()` 或者 `advancedBy()` 方法来移动到合适的位置：

    
        // these work
        string[string.startIndex.advancedBy(2)]
        string.characters[string.characters.startIndex.advancedBy(2)]
        string.unicodeScalars[string.unicodeScalars.startIndex.advancedBy(2)]
        string.utf16[string.utf16.startIndex.advancedBy(2)]
        string.utf8[string.utf8.startIndex.advancedBy(2)]

这并不是件有趣的事，我们想知道到底发生了什么？

还记得这些以标准化表示保存在字符串对象的视图吗？当你使用了一个不符合标准化表示形式的视图时，存储的数据并不能自动转化成你想要的形式。

回想一下上面所提到的，不同的编码方式有不同的大小和长度。这也意味着无法简单地判断字符在不同视图中对应的位置，因为所映射到的位置是根据保存的数据不同而不同的。考虑下面这个字符串：

    AƎ工🄞

这个 `String` 类型的字符串在 UTF-32 编码下的标准化表示是几个 32 位整型元素的集合：

    0x00041 0x0018e 0x05de5 0x1f11e

我们再站在 UTF-8 编码的视角上来看这些数据。理论上说，这些数据就是一组 8 位整型元素的序列：

    0x41 0xc6 0x8e 0xe5 0xb7 0xa5 0xf0 0x9f 0x84 0x9e

下面是两者的映射关系：

    | 0x00041 |  0x0018e  |     0x05de5    |       0x1f11e       |
        |         |           |                |                     |
        |  0x41   | 0xc6 0x8e | 0xe5 0xb7 0xa5 | 0xf0 0x9f 0x84 0x9e |

如果需要获取在 UTF-8 视图下索引为 6 的值，那么必须去从 UTF-32 的序列中从头开始去扫描，然后获取所在位置所对应的值。

显然，这是可以做到的。Swift 提供了这种底层方法，但是长得并不好看：`string.utf8[string.utf8.startIndex.advancedBy(6)]`。为什么不能简化这种表示，直接用一个整数来访问索引呢？实际上 Swift 为了加强这种表示牺牲了简洁性。在一个 `UTF8View` 能提供 `subscript(Int)（译者注：即下标索引）` 方法的世界里，我们希望下面两段代码是等价的：

    
        for c in string.utf8 {
            ...
        }
    
        for i in 0..<string.utf8.count {
            let c = string.utf8[i]
            ...
        }

这看上去很相似，但是第二个会意外地更慢一些。第一个循环是一个线性时间的扫描，然而第二个循环需要对每次迭代做一次线性扫描，即需要用二次方项的时间来做迭代遍历。对于一个长度为一百万的字符串，第一个循环只需要 0.1 秒，而第二个循环需要 3 个小时（在我的 2013 年 MacBook Pro 上进行的测试）。

我们再来看另外一个例子，从字符串中获得最后一个字符：

    
        let lastCharacter = string.characters[string.characters.endIndex.predecessor()]
    
        let lastCharacter = string.characters[string.characters.count - 1]

第一个版本会更快一些。因为它直接从字符串的最后开始，从最后一个 `Character` 开始的地方从后往前搜索，然后获取字符。第二个版本会扫描整个字符串……*两次！*它首先得扫描整个字符串来获取有多少个 `Character`，接着*再一次*扫描特定序号的字符是什么。

类似这样的 API 在 Swift 中只是有点不同、有点难写。这些不同之处让程序员们知道了视图并不是数组，它们也没有数组的行为。当我们使用下标索引时，我们事实上假设了这种操作是一种效率很高的行为。如果 `String` 的视图提供了这种索引，那其实和我们的主观假设相反，只能写出效率很低的代码。

### 使用 `String` 类来写代码吧

在应用层面上使用 `String` 类写代码意味着什么呢？

你可以使用顶层 API。举个例子，如果你需要判断一个字符串是否是以某个字符开头的，那不需要对字符串索引然后获取第一个字符并做比较。直接使用 `hasPrefix` 方法，它已经为你准备好了一切。不要害怕导入 Foundation 库和使用 `NSString` 中的方法。当你想移除 `String` 开头和结尾多余的空格时，不必手动遍历获取这些字符，可以直接使用 `stringByTrimmingCharactersInSet` 方法。

如果你需要做一些字符层面的事情，那么就要想象一下，对于特定情况一个「字符」意味着什么。通常，正确答案是指一个字素簇，这在 Swift 中表示成 `Character` 类型，展现在 `characters` 视图中。

无论你需要对文本做些什么事情，都要思考一下对文本从头到尾线性扫描的事情。诸如计算有多少个字符、查找中间的字符这类操作会消耗线性的时间，所以你最好整理一下代码，更加干净利落地做这些线性时间扫描的操作。对于特定的视图，取得开始和结束的下标索引，在必要的时候使用 `advancedBy()` 或者其他类似的方法来移动索引的位置。

### 总结

Swift 中的 `String` 类型采取了一种与众不同的方法来处理字符串。其他很多语言会选择一种标准化表示法，然后将转换等操作留给程序员自己去处理。通常它们在「到底什么才是字符？」这种重要的问题上做出了妥协，它们在处理字符串的时候，直接在编码中加入一些「语法糖」来让代码更加易写，然而这本质上就会导致各种困难的发生。Swift 语法可能没那么「甜」，相反则是在告诉你实际上会发生什么。对于程序员来说，这会比较困难，但其实也就只有这些困难。

`String` 的 API 中也有一些坑，但是我们可以使用一些其他的方法来让操作稍微简单一些。特别地，从 UTF-8 或 UTF-16 转换成一个 `String` 类型的数据是一件困难而又烦人的事。如果我们有一些能够将任意一串码元序列转换成字符串的 `UTF8View` 和 `UTF16View` 构造方法，以及另外一些直接建立在这些视图上的转换方法，那么 Swift 中的 `String` 类型将变得更加友好。

今天就到这里了。希望下次还能给大家带来更多惊喜。周五问答的主题是根据大家的想法产生的，所以记得[给我们写信来提出你想要听的话题](mailto:mike@mikeash.com)。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。