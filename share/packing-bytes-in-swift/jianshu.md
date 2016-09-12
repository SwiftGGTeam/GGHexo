Swift 中动手封装字节"

> 作者：Russ Bishop，[原文链接](http://www.russbishop.net/packing-bytes-in-swift)，原文日期：2016-05-12
> 译者：[pmst](http://www.jianshu.com/users/596f2ba91ce9/latest_articles)；校对：[walkingway](http://chengway.in/)；定稿：[CMB](https://github.com/chenmingbiao)
  









今天，我想尝试封装 `Float32` 类型数据到 [SQLite](https://www.sqlite.org/) [二进制大对象⌈Binary Large Object (BLOB)⌋](https://www.sqlite.org/datatype3.html) 组中。当然，我可以使用 JSON，protobuf，或是其他一些编码方式。除此之外，`NSNumber`，`NSArray` ，`NSCoder` 和 plist 文件也是不错的选择。

不过，我希望以更加 Swift 的方式来实现，有点类似 C 语言风格，实现迅速且不会引入任何相关性，解码器（decoder）也非常简单，可以在任何平台上实现。



## PointerEncoder

我们将在 `PointEncoder` 结构体中实现最终的接口：

    
    struct PointEncoder {
      // 解码过程中，如果我们得到一个相当大的数值，可以假定为服务器拒绝或是损坏的数据
      static let MaxPoints = 1_310_719
    
      // 容量大小
      private static let _sizeOfCount = sizeof(Int64.self)
    
      // 一个点由两个 Float32 类型数据组成，所占内存大小如下
      private static let _sizeOfPair = 2 * sizeof(Float32.self)
    
      static func encodePoints(points: [CGPoint]) -> NSData? {
      static func decodePoints(data: NSData) -> [CGPoint]
    }

点数组的最大容量 `MaxPoints` 被限制在大约 10 MB，这已经远远满足示例中的限定值。试想在移动蜂窝网络或是信号不佳环境下的 WiFi，传递如此数量的点给服务器，会迫使服务器断开连接。当然你可以视根据自身情况选择合适的大小。

接下来，我们需要获取以上类型所占内存大小。计算公式非常简单，一旦明确了不同类型所占内存的大小，就能集中在一个地方定义它们，而不是分散在各地调用 `sizeof()` 函数。

## 编码（encoding）

下面让我们看看 `encodePoints` 的实现

    
    guard !points.isEmpty && points.count < MaxPoints else { return nil }
    
    // 缓存区的最大容量值
    let bufferLength = _sizeOfCount + (points.count * _sizeOfPair)
    precondition(bufferLength >= (_sizeOfCount + _sizeOfPair), "Empty buffer?")
    precondition(bufferLength < megabytes(10), "Buffer would exceed 10MB")

第一步确保编码内容不为空，且不超过容量最大值。

第二步计算缓存区的大小，不宜过大或过小。注意第一步中的 `isEmpty` 理论上来说排除了缓存区为空的可能，不过倘若之后有人重构了代码，那就不一定了。紧接着我们会检查缓存区分配过多内存的可能。

以上是我喜欢进行的额外安全检查之一，主要考虑到一些二把刀程序员的尿性。试想之后有人了重构代码，并意外引入一个错误，但优秀的程序员不太可能会删除 `precondition` 断言语句。`precondition` 语句之后紧跟着是分配内存，请时刻注意“这里可能发生危险，要格外小心！”。

    
    let rawMemory = UnsafeMutablePointer<Void>.alloc(bufferLength)
    
    // Failed to allocate memory
    guard rawMemory != nil else { return nil }

下一步开始真正创建缓存区，一旦创建失败就跳出。

控制程序应对内存不足的情况非常困难。如果是因为内存不足造成创建类实例失败，程序应该调用 `abort()` 方法，因为简单的日志输出或 `print` 语句依旧涉及一些内存分配操作，这就无法以日志的形式通知失败结果（会使得所有的构造方法失败）。

考虑另外一种情况，分配大的缓存区有会可能失败，但堆碎片（heap fragmentation）可能还存在额外可用的内存。因此，如何优雅地处理它是一门学问（尤其像在 iOS 这种受限的环境中）。

    
    UnsafeMutablePointer<Int64>(rawMemory).memory = Int64(points.count)
    
    let buffer = UnsafeMutablePointer<Float32>(rawMemory + sizeOfCount)

这里有一点要注意。等式右边将 `points.count` 类型转换成了 64 位类型的整数，因此不随平台变化而发生改变（Swift 的 `Int` 类型在编译时会自适应平台，32 位平台下为 32 位整数，同理 64 位平台下为 64 位整数）。我们可不希望用户在升级设备后，引发崩溃或数据损坏问题。

等式左侧将 `rawMemory` 强转成 `Int64` 指针类型，然后将其指向的内存内容赋值为 `Int64(points.count)`。64 位整数占 8 个字节，因此分配的前 8 个字节内存包含了点个数（`sizeOfCount`）信息。

最后，我们将指针偏移 8 个字节（正如前面所说的），指针指向缓存区首地址。

    
    for (index, point) in points.enumerate() {
      let ptr = buffer + (index * 2)
    
      // Store the point values.
      ptr.memory = Float32(point.x)
      ptr.advancedBy(1).memory = Float32(point.y)
    }

接下来进行遍历 `points` 点数组操作。我们对 `UnsafeMutablePointer` 指针进行简单偏移量计算，得到缓冲区中的相关位置。值得注意的是，swift 中的不安全指针仅知道当前所使用的类型大小，所有指针偏移量都是以当前类型为单位，而非字节！（不过 `Void` 类型指针无法确定类型的大小，所以这种情况是以字节为单位的）。

因此，通过对基址进行 `index * 2` 偏移累加，得到下一对点成员（注：即x，y点坐标）的地址。然后我们为当前指针指向的内存区域作赋值操作。

接着我使用了 `ptr.advancedBy()` 方法，并未保留指针的引用，同时也没有设置 `ptr` 为可变指针。这仅仅是我个人喜好。你可以使用 `+` 或 `advancedBy()`，这两者作用一致。

    
    return NSData(
      bytesNoCopy: rawMemory, 
      length: bufferLength, 
      deallocator: { (ptr, length) in
        ptr.destroy(length)
        ptr.dealloc(length)
    })

最后要注意的，我们将数据返回给调用者。此时已经分配了一个合适的缓存区，接着使用 `bytesNoCopy` 进行初始化操作，将适当的长度以及闭包作为参数传递给函数。

为什么要传递一个用作释放的闭包参数（deallocator）呢？从技术上讲，你或许可以使用 `NSData(bytesNoCopy:length:freeWhenDone:)` 侥幸实现，但无法保证没有意外发生。倘若 Swift runtime 没有使用系统默认的 `malloc/free` 方法，而是采用其他内存分配方式，那么你将得到一个报错。

如果我们的缓存区恰巧需要存储一些复杂的 Swift 类型，适时的释放操作是必须的：你必须调用 `ptr.destroy(count)` 来进行释放，需要借助引用类型，递归枚举用例等等，否则会造成内存泄露。在本例中，我们知道 `Float32` 和 `Int64` 类型所占位数，从技术正确角度来讲，调用 `destroy` 方法能够更好的保证这一点。

## 解码（decoding）

    
    guard
      data.bytes != nil &&
        data.length > (_sizeOfCount + _sizeOfPair)
      else { return [] }

首先，我们确保 `NSData` 中的指针不为 `nil`，并且足够容纳 `Int64` 数量的点数组。这为接下来的操作铺平了道路，不需要再进行一些额外的安全检查。

    
    let rawMemory = data.bytes
    let buffer = rawMemory + _sizeOfCount
    
    // 从内存中获取到 Int64 类型的点个数
    let pointCount64 = UnsafePointer<Int64>(rawMemory).memory
    
    precondition(
      Int64(MaxPoints) < Int64(Int32.max),
      "MaxPoints would overflow on 32-bit platforms")
    precondition(
      pointCount64 > 0 && pointCount64 < Int64(MaxPoints),
      "Invalid pointCount = \(pointCount64)")
    
    let pointCount = Int(pointCount64)

接下来设置我们的指针。再次将原始指针强制转换成 Int64 类型的指针，此时我们使用了非可变指针，这是出于只读操作的考虑。

注意到前面代码中我将点个数类型设置为 64 位，这样确保了 `Int32.max` 不会溢出或下溢；C 语言中经常使用 `if(value + x > INT_MAX)` 判断检查是否溢出，属于未定义行为之一。现在请放下手上工作思考一分钟：计算机是如何处理 `value + x` 超出整型最大值的情况呢？答案是：无法继续累加，转而变成一个负值。那么当我们使用一个超大的负值进行类似 `malloc` 或 `is_admin()` 操作时会发生什么情况呢？这是我留给读者的一个课后小作业。

末行代码将点个数转换成 `Int` 类型。 32 位平台上一旦值超过 `Int32.max` ，我们将会陷入“万劫不复”。Swift 相对于 C 语言要安全的多 —— 我们必须时刻警惕值溢出或下溢的情况发生。一旦此类情况发生，程序就会在运行时崩溃，值得庆幸的是，程序在挂掉之前会给出清晰的错误提示。

64 位平台上，绝对有可能超过 4GB 容量点数组的情况（数值超过大约42亿），代码需要进一步重构。不过对于我的需求来说无关紧要，所以这里采用了硬编码限制了容量。这也使得在 64 位系统上创建的值无法加载到 32 位系统当中（这只是理论上最大值的情况，实际我所使用的容量将会小得多）。

    
    var points: [CGPoint] = []
    points.reserveCapacity(pointCount)
    
    for ptr in (0..<pointCount).map({
      UnsafePointer<Float32>(buffer) + (2 * $0)
    }) {
      points.append(
        CGPoint(
          x: CGFloat(ptr.memory),
          y: CGFloat(ptr.advancedBy(1).memory))
      )
    }
    
    return points

代码也很简单。我们设定数组的备用容量，以避免重新分配。这不会对性能造成太大影响，毕竟我们已经知道了最大限制容量，所以这么做没什么问题。

另外，指针类型为 `Float32`，Swift 知道该类型所占内存大小。我们只需要将索引值乘以2（`2 * $0`）得到下一对坐标点的指针，然后从指针指向的内存区域读取数值。

## 关于测试

毫无疑问，类似这种类型都应该使用 `Address Sanitizer` 内存检测用具来帮助捕获任何滥用内存的问题，并且在产品发布前应该进行大量的代码审查（或借助 `AFL fuzzing` 同样能够方便揭露一些问题）。

我从来不敢 100% 保证代码中任何有关线程或内存的部分不会出现纰漏。我甚至无法 100% 确定本文用例没有 bug。不过我使用 `Addess Sanitizer` 工具并没有发现任何问题，但我坚信一个好的程序员应该有敬畏之心。时刻警惕那些可能出现的错误或失误（如果你发现本文有任何纰漏，请留言告知我！）

**包括你在内，没有人优秀到写代码可以完全避免缓冲区溢出。**

## 总结

Swift 编译器始终重视安全问题，但它有时也令人心寒。如果你保证不做一些调皮的事情，它会完全信任你。如果你有必要做一些字节或 `void` 指针操作，请重新创建一个 `.swift` 文件然后在里面使用。

## 最终实现

我已经在最终实现的用例 gist 中嵌入了要点和详细注释。如果对你有帮助的话，请尽情使用它。

    
    // Written by Russ Bishop
    // MIT licensed, use freely.
    // No warranty, not suitable for any purpose. Use at your own risk!
    
    struct PointEncoder {
      // When parsing if we get a wildly large value we can
      // assume denial of service or corrupt data.
      static let MaxPoints = 1_310_719
    
      // How big an Int64 is
      private static let _sizeOfCount = sizeof(Int64.self)
    
      // How big a point (two Float32s are)
      private static let _sizeOfPair = 2 * sizeof(Float32.self)
    
    
      static func encodePoints(points: [CGPoint]) -> NSData? {
        guard !points.isEmpty && points.count < MaxPoints else { return nil }
    
        // Total size of the buffer
        let bufferLength = _sizeOfCount + (points.count * _sizeOfPair)
        precondition(bufferLength >= (_sizeOfCount + _sizeOfPair), "Empty buffer?")
        precondition(bufferLength < megabytes(10), "Buffer would exceed 10MB")
        
        let rawMemory = UnsafeMutablePointer<Void>.alloc(bufferLength)
    
        // Failed to allocate memory
        guard rawMemory != nil else { return nil }
    
        // Store the point count in the first portion of the buffer
        UnsafeMutablePointer<Int64>(rawMemory).memory = Int64(points.count)
    
        // The remaining bytes are for the Float32 pairs
        let buffer = UnsafeMutablePointer<Float32>(rawMemory + _sizeOfCount)
    
        // Store the points
        for (index, point) in points.enumerate() {
          // Since buffer is UnsafeMutablePointer<Float32>, addition counts
          // the number of Float32s, *not* the number of bytes!
          let ptr = buffer + (index * 2)
    
          // Store the point values.
          ptr.memory = Float32(point.x)
          ptr.advancedBy(1).memory = Float32(point.y)
        }
    
        // We can tell NSData not to bother copying memory.
        // For consistency and since we can't guarantee the memory allocated
        // by UnsafeMutablePointer can just be freed, we provide a deallocator
        // block. 
        return NSData(
          bytesNoCopy: rawMemory,
          length: bufferLength,
          deallocator: { (ptr, length) in
            // If ptr held more complex types, failing to call
            // destroy will cause lots of leakage.
            // No one wants leakage.
            ptr.destroy(length)
            ptr.dealloc(length)
        })
      }
    
      static func decodePoints(data: NSData) -> [CGPoint] {
        // If we don't have at least one point pair
        // and a size byte, bail.
        guard
          data.bytes != nil &&
            data.length > (_sizeOfCount + _sizeOfPair)
          else { return [] }
    
        let rawMemory = data.bytes
        let buffer = rawMemory + _sizeOfCount
    
        // Extract the point count as an Int64
        let pointCount64 = UnsafePointer<Int64>(rawMemory).memory
    
        // Swift is safer than C here; you can't
        // accidentally overflow/underflow and not
        // trigger a trap, but I am still checking
        // to provide better error messages.
        // In all cases, better to kill the process
        // than corrupt memory.
        precondition(
          Int64(MaxPoints) < Int64(Int32.max),
          "MaxPoints would overflow on 32-bit platforms")
        precondition(
          pointCount64 > 0 && pointCount64 < Int64(MaxPoints),
          "Invalid pointCount = \(pointCount64)")
    
        // On 32-bit systems this would trap if
        // MaxPoints were too big and we didn't
        // check above.
        let pointCount = Int(pointCount64)
        precondition(
          _sizeOfPair + (_sizeOfCount * pointCount) <= data.length,
          "Size lied or buffer truncated")
    
        var points: [CGPoint] = []
        // Small optimization since
        // we know the array size
        points.reserveCapacity(pointCount)
    
        for ptr in (0..<pointCount).map({
          // buffer points past the size header
          // Again, since the pointer knows we are
          // counting Float32 values we want the
          // number of Float32s, *not* their size
          // in bytes!
          UnsafePointer<Float32>(buffer) + (2 * $0)
        }) {
          points.append(
            CGPoint(
              x: CGFloat(ptr.memory),
              y: CGFloat(ptr.advancedBy(1).memory))
          )
        }
    
        return points
      }
    }
    
    func kilobytes(value: Int) -> Int {
      return value * 1024
    }
    
    func megabytes(value: Int) -> Int {
      return kilobytes(value * 1024)
    }
    
    func gigabytes(value: Int) -> Int {
      return megabytes(value * 1024)
    }
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。