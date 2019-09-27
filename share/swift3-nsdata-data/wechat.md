Data 解析 Doom 的 WAD 文件"

> 作者：Terhechte，[原文链接](http://appventure.me/2016/07/15/swift3-nsdata-data/)，原文日期：2016/07/15
> 译者：[BigbigChai](https://github.com/chaiyixiao)；校对：way；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  









### Swift 3 ： 从 NSData 到 Data 的转变

Swift 3 带来了许多大大小小的变化。其中一个是为常见的 Foundation 引用类型（例如将 NSData 封装成 `Data` ，将 NSDate 封装成 `Date`）添加值类型的封装。这些新类型除了改变了内存行为和名字以外，在方法上也与对应的引用类型有所区别 <sup><a id="fnr.1" name="fnr.1" class="footref" href="#fn.1">1</a></sup>。 从更换新方法名这类小改动，到完全去掉某一功能这种大改动，我们需要一些时间去适应这些新的值类型。本文会重点介绍作为值类型的 `Data` 是如何封装 `NSData` 的。



不仅如此，在学习完基础知识之后，我们还会写一个简单的示例应用。这个应用会读取和解析一个 Doom 毁灭战士的 WAD 文件 <sup><a id="fnr.2" name="fnr.2" class="footref" href="#fn.2">2</a></sup>。

![](http://appventure.me/img-content/doom.png)

### 基本区别

对于 `NSData`，其中一个最常见的使用场景就是调用以下方法加载和写入数据：

    
    func writeToURL(_ url: NSURL, atomically atomically: Bool) -> Bool
    func writeToURL(_ url: NSURL, options writeOptionsMask: NSDataWritingOptions) throws
    // ... (implementations for file: String instead of NSURL)
    init?(contentsOfURL url: NSURL)
    init(contentsOfURL url: NSURL, options readOptionsMask: NSDataReadingOptions) throws
    // ... (implementations for file: String instead of NSURL)

基本的使用方法并没有什么改动。新的 `Data` 类型提供了以下方法：

    
    init(contentsOf: URL, options: ReadingOptions)
    func write(to: URL, options: WritingOptions)

留意到 `Data` 简化了从文件读写数据的方法，原本 `NSData` 提供了多种不同的方法，现在只精简到两个方法。

比较一下 `NSData` 和 `Data` 的方法，可以发现另一个变化。`NSData` 提供了三十个方法和属性，而 `Data` 提供了一百三十个。Swift 强大的协议扩展可以轻易地解释这个巨大的差异。`Data` 从以下协议里获得了许多方法：

- CustomStringConvertible
- Equatable
- Hashable
- MutableCollection
- RandomAccessCollection
- RangeReplaceableCollection
- ReferenceConvertible

这给 `Data` 提供了许多 `NSData` 不具备的功能。这里列出部分例子：

    
    func distance(from: Int, to: Int)
    func dropFirst(Int)
    func dropLast(Int)
    func filter((UInt8) -> Bool)
    func flatMap<ElementOfResult>((UInt8) -> ElementOfResult?)
    func forEach((UInt8) -> Void)
    func index(Int, offsetBy: Int, limitedBy: Int)
    func map<T>((UInt8) -> T)
    func max()
    func min()
    func partition()
    func prefix(Int)
    func reversed()
    func sort()
    func sorted()
    func split(separator: UInt8, maxSplits: Int, omittingEmptySubsequences: Bool)
    func reduce<Result>(Result, (partialResult: Result, UInt8) -> Result)

如你所见，许多函数式方法，例如 mapping 和 filtering 现在都可以操作 `Data` 类型的字节内容了。我认为这是相对 `NSData` 的一大进步。优势在于，现在可以轻松地使用下标以及对数据内容进行比较了。

    
    var data = Data(bytes: [0x00, 0x01, 0x02, 0x03])  
    print(data[2]) // 2
    data[2] = 0x09
    print (data == Data(bytes: [0x00, 0x01, 0x09, 0x03])) // true

`Data` 还提供了一些新的初始化方法专门用于处理 Swift 里常见的数据类型：

    
    init(bytes: Array<UInt8>)
    init<SourceType>(buffer: UnsafeMutableBufferPointer<SourceType>)
    init(repeating: UInt8, count: Int)

### 获取字节

如果你使用 `Data` 与底层代码（例如 `C`库）交互，你会发现另一个明显的区别：`Data` 缺少了 `NSData` 的 `getBytes` 方法：

    
    // NSData
    func getBytes(_ buffer: UnsafeMutablePointer<Void>, length length: Int)

`getBytes` 方法有许多不同的应用场景。其中最常见的是，当你需要解析一个文件并按字节读取并存储到数据类型/变量里。例如说，你想读取一个包含项目列表的二进制文件。这个文件经过编码，而编码方式如下：

| 数据类型 | 大小 | 功能 |
| ------- |:---:| ---:|
| Char | 4 | 头部 (ABCD) |
| UInt32| 4 | 数据开始 |
| UInt32 | 4 | 数量 |

该文件包含了一个四字节字符串 *ABCD* 标签，用来表示正确的文件类型（做校验）。接着的四字节定义了实际数据（例如头部的结束和项目的开始），头部最后的四字节定义了该文件存储项目的数量。

用 `NSData` 解析这段数据非常简单：

    
    let data = ...
    var length: UInt32 = 0
    var start: UInt32 = 0
    data.getBytes(&start, range: NSRange(location: 4, length: 4))
    data.getBytes(&length, range: NSRange(location: 8, length: 4))

如此将返回正确结果<sup><a id="fnr.3" name="fnr.3" class="footref" href="#fn.3">3</a></sup>。如果数据不包含 C 字符串，方法会更简单。你可以直接用正确的字段定义一个 `结构体`，然后把字节读到结构体里：

| 数据类型 | 大小 | 功能 |
| ------- |:---:| ---:|
| UInt32 | 4 | 数据开始 |
| UInt32 | 4 | 数量 |


    
    let data = ...
    struct Header { 
        let start: UInt32
        let length: UInt32
    }
    var header = Header(start: 0, length: 0)
    data.getBytes(&header, range: NSRange(location: 0, length: 8))

### Data 中 getBytes 的替代方案

不过 `Data` 里 getBytes 这个功能不再可用，转而提供了一个新方法作替代：

    
    // 从数据里获得字节
    func withUnsafeBytes<ResultType, ContentType>((UnsafePointer<ContentType>) -> ResultType)

通过这个方法，我们可以从闭包中直接读取数据的字节内容。来看一个简单的例子：

    
    let data = Data(bytes: [0x01, 0x02, 0x03])
    data.withUnsafeBytes { (pointer: UnsafePointer<UInt8>) -> Void in
        print(pointer)
        print(pointer.pointee)
    }
    // 打印
    // : 0x00007f8dcb77cc50
    // : 1

好了，现在有一个指向数据的 unsafe UInt8 指针，那要怎样利用起来呢？首先，我们需要一个不同的数据类型，然后一定要确定该数据的类型。我们知道这段数据包含一个 Int32 类型，那该如何正确地解码呢？

既然已经有了一个 unsafe pointer（UInt8 类型），那么就能够轻松地转换成目标类型 unsafe pointer。`UnsafePointer` 有一个 `pointee` 属性，可以返回指针所指向数据的正确类型：

    
    let data = Data(bytes: [0x00, 0x01, 0x00, 0x00])
    let result = data.withUnsafeBytes { (pointer: UnsafePointer<Int32>) -> Int32 in
        return pointer.pointee
    }
    print(result)
    //: 256

如你所见，我们创建了一个字节的 `Data` 实例，通过在闭包里定义 `UnsafePointer<Int32>`，返回 `Int32` 类型的数据。可以把代码写得再精简一点，因为编译器能够根据上下文推断结果类型：

    
    let result: Int32 = data.withUnsafeBytes { $0.pointee }

### 数据的生命周期

使用 `withUnsafeBytes` 时，指针（你所访问的）的生命周期是一个很重要的考虑因素（除了整个操作都是不安全的之外）。指针的生命周期受制于闭包的生命周期。正如文档所说：

> 留意：字节指针参数不应该被存储，或者在所调用闭包的生命周期以外被使用。

### 泛型解决方案

现在，我们已经可以读取原始字节数据，并把它们转换成正确的类型了。接下来创建一个通用的方法来更轻松地执行操作，而不用额外地关心语法。 另外，我们暂时还无法针对数据的子序列执行操作，而只能对整个 `Data` 实例执行操作。 泛型的解决方法大概是这个样子的：

    
    extension Data {
        func scanValue<T>(start: Int, length: Int) -> T {
    	    return self.subdata(in: start..<start+length).withUnsafeBytes { $0.pointee }
        }
    }
    let data = Data(bytes: [0x01, 0x02, 0x01, 0x02])
    let a: Int16 = data.scanValue(start: 0, length: 1)
    print(a)
    // : 1

与之前的代码相比，存在两个显著的不同点：

- 我们使用了 `subdata` 把扫描的字节限定于所需的特定区域。
- 我们使用了泛型来支持提取不同的数据类型。

### 数据转换

另一方面，从现有的变量内容里得到 `Data` 缓冲， 虽然与下面的 Doom 的例子不相关，但是非常容易实现，（因此也写在这里啦）

    
    var variable = 256
    let data = Data(buffer: UnsafeBufferPointer(start: &variable, count: 1))
    print(data) // : <00010000 00000000>

### 解析 Doom WAD 文件

我小时候非常热爱 Doom（毁灭战士）这个游戏。也玩到了很高的等级，并修改  WAD 文件加入了新的精灵，纹理等。因此当我想给解析二进制文件找一个合适（和简单）的例子时，就想起了 WAD 文件的设计。因为它十分直观且容易实现。于是我写了一个简单的小程序，用于读取 WAD 文件，然后列出所有存储地板的纹理名称 <sup><a id="fnr.4" name="fnr.4" class="footref" href="#fn.4">4</a></sup>。

我把源代码[ 放在了 GitHub ][1]。
以下两个文件解释了Doom WAD 文件的设计。

- [http://doom.wikia.com/wiki/WAD][2]
- [http://doomlegacy.sourceforge.net/hosted/doomspec1666.txt][3]

但是对于这个简单的示例，只需要了解部分的文件格式就够了。
首先，每个 WAD 文件都有头文件：

| 数据类型 | 大小 | 功能 |
| ------- |:---:| ---:|
| Char | 4| 字符串 IWAD 或者 PWAD |
| Int32 | 4 | WAD 中区块的数目 |
| Int32 | 4 | 指向目录位置的指针 |

开头的 4 字节用来确定文件格式。 `IWAD` 表明是官方的 Doom WAD 文件，`PWAD` 表明是在运行时补充内容到主要 WAD 文件的补丁文件。我们的应用只会读取 `IWAD` 文件。接着的 4 字节确定了 WAD 文件中 *区块（lump）* 的数目。 区块（Lump）是与 Doom 引擎合作的个体项目，例如纹理材质、精灵帧（Sprite-Frames），文字内容，模型，等等。每个纹理都是不同类的区块。最后的 4 字节定义了*目录*的位置。我们开始解析目录的时候，会给出相关解释。首先，让我们来解析头文件。

### 解析头文件

读取 WAD 文件的方法非常简单：

    
    let data = try Data(contentsOf: wadFileURL, options: .alwaysMapped)

我们获取到数据之后，首先需要解析头文件。这里多次使用了之前创建的 ``scanValue``data`` 扩展。

    
    public func validateWadFile() throws {
        // 一些 Wad 文件定义
        let wadMaxSize = 12, wadLumpsStart = 4, wadDirectoryStart = 8, wadDefSize = 4
        // WAD 文件永远以 12 字节的头文件开始。
        guard data.count >= wadMaxSize else { throw WadReaderError.invalidWadFile(reason: "File is too small") }
    
        // 它包含了三个值:
    
        // ASCII 字符 "IWAD" 或 "PWAD" 定义了 WAD 是 IWAD 还是 PWAD。
        let validStart = "IWAD".data(using: String.Encoding.ascii)!
        guard data.subdata(in: 0..<wadDefSize) == validStart else
        { throw WadReaderError.invalidWadFile(reason: "Not an IWAD") }
    
        // 一个声明了 WAD 中区块数目的整数。
        let lumpsInteger: Int32 = data.scanValue(start: wadLumpsStart, length: wadDefSize)
    
        // 一个整数，含有指向目录地址的指针。
        let directoryInteger: Int32 = data.scanValue(start: wadDirectoryStart, length: wadDefSize)
    
        guard lumpsInteger > 0 && directoryInteger > Int32(wadMaxSize)
    	else {
    	    throw WadReaderError.invalidWadFile(reason: "Empty Wad File")
        }
    }

你可以在 [GitHub][4] 找到其他的类型（例如 `WadReaderError` `enum`）。下一步就是解析目录来获取每个区块的地址和大小。

### 解析目录

目录与区块的名字、包含的数据相关联。它包括了一系列的项目，每个项目的长度为 16 字节。目录的长度取决于 WAD 头文件里给出的数字。

每个 16 字节的项目按照以下的格式：

| 数据类型 | 大小 | 功能 |
| ------- |:---:| ---:|
| Int32 | 4 | 区块数据在文件中的开始 |
| Int32 | 4 | 区块的字节大小 |
| Char | 4 | 定义了区块名字的 ASCII 字符串 |

名字的字符定义得比较复杂。文档是这么说的：

> 使用 ASCII 字符串定义区块的名字。区块的名字只能使用 A-Z（大写），0-9，[ ] - \_（Arch-Vile 精灵除外，它们使用 \\）。如果这串字符小于 8 字节长度，那么余下字节要被 null 填满。

留意最后一句话。在 C 语言里，字符串由空字符（`\0`）结束。这向系统表明了该字符串的内存到这里结束。Doom 用可选的空字符来节约存储空间。当字符串小于 8 字节，它会包含一个空字符。如果它达到最大允许长度（ 8 字节），那么字符串以最后一个字节结束，而非由空字符结束。

| &nbsp; | 0 | 1 |  2 | 3 |     4 | 5 | 6 | 7 | &nbsp; |
| ------- |:---:| ---:| ---:| ---:| ---:| ---:|---:|---:|---:|
| 短 | I | M | P | **\0**|**\0**|**\0**|**\0**|**\0**|#|
| 长 | F | L | O | O | R | 4 | \_ | 5 | # |

看看上面的表格， 短名字会在字符串最后补空字符（位置 3）。长名字则没有空字符，而是以 **FLOOR4\_5** 的最后一个字符 **5** 作为结束。`#`表明了下一个项目/片段在内存中的开始。

在我们尝试支持区块的名字字符格式之前，首先处理一下简单的部分。那就是读取开头和大小。

在开始之前，我们应该定义一个数据结构，用于保存从目录里读取的内容：

    
    public struct Lump {
        public let filepos: Int32
        public let size: Int32
        public let name: String
    }

然后，从完整的数据实例里取出数据片段，这是这些数据构成我们的目录。

    
    // 定义一个目录项的默认大小。
    let wadDirectoryEntrySize = 16
    // 从完整数据里提取目录片段。
    let directory = data.subdata(in: Int(directoryLocation)..<(Int(directoryLocation) + Int(numberOfLumps) * wadDirectoryEntrySize))

接着，我们以每段 16 字节的长度在 `Data` 中迭代。 Swift 的 `stride` 方法能够很好地实现这个功能：

    
    for currentIndex in stride(from: 0, to: directory.count, by: wadDirectoryEntrySize) {
        let currentDirectoryEntry = directory.subdata(in: currentIndex..<currentIndex+wadDirectoryEntrySize)
    
        // 一个整数表明区块数据的起始在文件中的位置。
        let lumpStart: Int32 = currentDirectoryEntry.scanValue(start: 0, length: 4)
    
        // 一个表示了区块字节大小的整数。
        let lumpSize: Int32 = currentDirectoryEntry.scanValue(start: 4, length: 4)
        ...
    }
简单的部分到此结束，下面我们要开始进入秋名山飙车了。

### 解析 C 字符串

要知道对于每个区块的名字，每当遇到空的结束字符**或者**达到 8 字节的时候，我们都要停止向 Swift 字符串的写入。首要任务是利用相关数据创建一个数据片段。

    
    let nameData = currentDirectoryEntry.subdata(in: 8..<16)

Swift 给 C 字符串提供了很好的互操作性。这意味着需要创建一个字符串的时候，我们只需要把数据交给 `String` 的初始化方法就行了：

    
    let lumpName = String(data: nameData, encoding: String.Encoding.ascii)

这个方法可以执行，但是结果并不正确。因为它忽略了空结束符，所以即使是短名字，也会跟长名字一样转换成 8 字节的字符串。例如，名字为 **IMP** 的区块会变成 **IMP00000**。但是由于 `String(data:encoding:)` 并不知道 Doom 把剩下的 5 字节都用空字符填满了，而是根据 ` nameData` 创建了一个完整 8 字节的字符串。

如果我们想要支持空字符， Swift 提供了一个 `cString` 初始化方法，用来读取包含空结束符的有效 cString：

    
    // 根据所给的 C 数组创建字符串
    // 根据所给的编码方式编码
    init?(cString: UnsafePointer<CChar>, encoding enc: String.Encoding)

留意这里的参数不需要传入 `data` 实例，而是要求一个指向 `CChars` 的 unsafePointer。我们已经熟悉这个方法了，来写一下：

    
    let lumpName2 = nameData.withUnsafeBytes({ (pointer: UnsafePointer<UInt8>) -> String? in
        return String(cString: UnsafePointer<CChar>(pointer), encoding: String.Encoding.ascii)
    })

以上方法依然不能得到我们想要的结果。在 Doom 的名字长度小于 8 字符的情况下，这段代码都能完美运行。但是只要某个名字长度达到 8 字节而没有一个空结束符时，这会继续读取（变成一个 16 字节片段），直到找到下一个有效的空结束符。 这就带来一些不确定长度的长字符串。

这个逻辑是 Doom 自定义的，因此我们需要自己来实现相应的代码。`Data` 支持 Swift 的集合和序列操作，因此我们可以直接用 reduce 来解决。

    
    let lumpName3Bytes = try nameData.reduce([UInt8](), { (a: [UInt8], b: UInt8) throws -> [UInt8] in
        guard b > 0 else { return a }
        guard a.count <= 8 else { return a }
        return a + [b]
    })
    guard let lumpName3 = String(bytes: lumpName3Bytes, encoding: String.Encoding.ascii)
        else {
    	throw WadReaderError.invalidLup(reason: "Could not decode lump name for bytes \(lumpName3Bytes)")
    }

这段代码把数据以 `UInt8` 字节 reduce，并检查数据是否含有提前的空结束符。一切工作正常，虽然数据需要进行几次抽象，执行速度并不是很快。

不过如果我们能以 Doom 引擎类似的方法来解决的话，效果会更好。Doom 仅移动了 `char*` 的指针，并根据字符是否为空结束符判断是否需要提前跳出。Doom 是用 C 语言写的，因此它能在裸指针层面上迭代。

那么我们要怎样在 Swift 里实现这个逻辑呢？事实上，可以再次借助 `withUnsafeBytes` 实现类似的效果。来看看代码：

    
    let finalLumpName = nameData.withUnsafeBytes({ (pointer: UnsafePointer<CChar>) -> String? in
        var localPointer = pointer
        for _ in 0..<8 {
    	guard localPointer.pointee != CChar(0) else { break }
    	localPointer = localPointer.successor()
        }
        let position = pointer.distance(to: localPointer)
        return String(data: nameData.subdata(in: 0..<position),
    		  encoding: String.Encoding.ascii)
    })
    guard let lumpName4 = finalLumpName else {
        throw WadReaderError.invalidLup(reason: "Could not decode lump name for bytes \(lumpName3Bytes)")
    }

`withUnsafeBytes` 的用法与之前相似，我们接受一个指向原始内存的指针。 `指针` 是一个 `let` 常数，但是由于我们需要对它做修改，因此我们在第一行创建了一个可变的拷贝<sup><a id="fnr.5" name="fnr.5" class="footref" href="#fn.5">5</a></sup>。

接着，开始我们的主要工作。从 0 到 8 循环，每次循环都检测指针指向的字符（`pointee`）是否为空结束符（`CChar(0)`）。是空结束符的话就表明提前找到了空结束符，需要跳出循环。否则将 `localPointer` 重载为下一位，即就是，当前指针内存中的下一个位置。这样，我们就能逐字节地读取内存中的所有内容了。

完成之后 ，就计算一下我们原始`指针`和`本地指针`的距离。如果在找到空结束符之前我们仅前移了三次，那么两个指针之前的距离为 3。最后，这个距离能让我们通过实际 C 字符串的子数据创建一个新的 String 实例。

最后用得到的数据创建新的 `区块` 结构体：

    
    lumps.append(Lump(filepos: lumpStart, size: lumpSize, name: lumpName4))

如果你观察源代码，会发现 `F_START` 和 `F_END` 这种显著的引用。对于特殊的 _区块区域_ ，Doom 使用特殊名称的空区块标记了区域的开头和结尾。`F_START / F_END` 围起了所有地板纹理的区块。在本教程中，我们将忽略这额外的一步。

应用最终的截图：

![](http://appventure.me/img-content/doom-shot.png)

我知道这看起来并不酷炫。之后可能会计划在博客里写写如何展示那些纹理。

### 桥接 NSData

我发现新的 `Data` 比 `NSData` 使用起来更加方便。然而，如果你需要 `NSData` 或者 `getBytes` 方法的话，这有一个简单的方法能把 `Data` 转换成 `NSData`。Swift 文档是这么写的：

> Data 具有“写时拷贝”能力，也能与 Objective-C 的 NSData 类型桥接。 对于 NSData 的自定义子类，你可以使用 `myData as Data` 把它的一个实例转换成结构体 Data 。

    
    // 创建一个 Data 结构体
    let aDataStruct = Data()
    // 获得底层的引用类型 NSData
    let aDataReference = aDataStruct as NSData

无论何时，如果你觉得 `Data` 类型难以满足你的需求，都能轻松地回到 `NSData` 类型使用你熟悉的方法。不过总而言之你还是应该尽可能地使用新的 `Data` 类型（除非你需要引用类型的语法）。

<sup><a id="fn.1" name="fn.1" class="footnum" href="#fnr.1">1:	有些类型（例如 `Date`） 并不是包裹类型，而是全新的实现。</a></sup>

<sup><a id="fn.2" name="fn.2" class="footnum" href="#fnr.2">2:	Doom1，Doom2，Hexen，Heretic，还有 Ultimate Doom。虽然我只在 Doom1 Shareware 验证过。</a></sup

<sup><a id="fn.3" name="fn.3" class="footnum" href="#fnr.3">3:	留意，我们并没有验证最开头的 4 个字节，确保这的确是 ABCD 文件。但是要添加这个验证也很简单。</a></sup

<sup><a id="fn.4" name="fn.4" class="footnum" href="#fnr.4">4:	其实我也想展示 texture 但是不够时间去实现。</a></sup

<sup><a id="fn.5" name="fn.5" class="footnum" href="#fnr.5">5:	Swift 3 不再在闭包和函数体里支持有用的 `var` 标注。</a></sup

[1]:	https://github.com/terhechte/SwiftWadReader
[2]:	http://doom.wikia.com/wiki/WAD
[3]:	http://doomlegacy.sourceforge.net/hosted/doomspec1666.txt
[4]:	https://github.com/terhechte/SwiftWadReader

[image-1]:	http://appventure.me/img-content/doom.png
[image-2]:	https://appventure.me/img-content/doom-shot@2x.png
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。