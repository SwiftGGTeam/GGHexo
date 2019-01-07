title: "固定大小的数组"
date: 2018-12-24
tags: [Swift]
categories: [Swift]
permalink: fixed-sized-arrays
keywords: swift,array,null-terminate
description: 如何在 Swift 中处理从 C 语言引入的固定大小数组

---
原文链接=http://www.russbishop.net/fixed-sized-arrays
作者=Russ Bishop
原文日期=2018-10-30
译者=zhongWJ
校对=numbbbbb,Cee
定稿=Forelax

<!--此处开始正文-->

假设我们想要用 `statfs()` 方法来确定某个挂载点所对应的 `BSD` 设备名。例如挂载点 `/Volumes/MyDisk` 对应的 `BSD` 设备是 `/dev/disk6s2`。

```c
struct statfs fsinfo;
if (statfs(path, &fsinfo) != 0) {
    //错误
}
```

<!--more-->

同等的 Swift 代码如下，只不过多了个 `POSIX` 错误帮助方法：

```swift
func posix_expects_zero<R: BinaryInteger>(_ f: @autoclosure () throws -> R) throws {
    let returncode = try f()
    if returncode != 0 {
        // 如果需要，请在此处替换为自定义的错误类型。
        // NSError 会自动帮我们通过错误码得到对应的 C 字符串错误消息。
        throw NSError(
            domain: NSPOSIXErrorDomain,
            code: numericCast(returncode),
            userInfo: nil)
    }
}

// 采用默认的空初始化方法。Swift 能推断出结构体类型，
// 但为了表示得更清楚，这里显式指定类型
var fsinfo: statfs = statfs()
statfs(path, &fsinfo)

```

## C 的引入物

`statfs()` 函数在 C 语言的定义是 `int statfs(const char *path, struct statfs *info)`。`statfs` 结构体有多个字段，但我们只关注 `mount-from-name`：

```c
struct statfs {
    //...
    char f_mntfromname[MAXPATHLEN];
    //...
}
```

> 在苹果平台上 MAXPATHLEN == PATH_MAX == 1024。
>
> 如果你在代码里硬编码 1024 而不是用更合适的宏，小心我的鬼魂会缠着你和你的家族十二代哦。

噢哦。一个固定大小的数组。当被引入 Swift 中时，它会被当做一个有 1024 个元素的元组：

```swift
public var f_mntfromname: (Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8, Int8)
```

这个类型不是很实用。那我们能不能做点什么呢？由于这篇博客的存在，你可能已经猜到答案是「*是*」。

## C 字符串

这个固定大小的数组包含了 `char`。由于文档未曾提及，所以我们并不知道是否通过空字符来表示数组的终止。令人恼火的是，文档暗示在 64 位系统上，`f_fstypename` 字段是由空字符终止，但对于 mount to/from 两个字段却只字未提。这两个字段是根据被定义为 `PATH_MAX` 的 `MAXPATHLEN` 宏来定义的而不是直接根据 `PATH_MAX` 宏，而 `PATH_MAX` 宏通常暗示数组由空字符来表示终止。我们是不是应该从中得到一点启发呢？

对于固定大小的数组，有一些 C API 仍然采用空终止符（所以真实的字符串长度最长可以是 `sizeof(array) - 1`），而另一些则乐意填充整个缓冲区（所以不以空字符结尾的字符串长度最长可以是 `sizeof(array)`）。这就是那种有害的绊脚石，它让你的程序看起来运行正常并通过所有测试，然后碰到某些新的 FizzyWizz 硬盘系统会有的奇怪的边界情况时，当突然碰到一个刚好由 1024 个字符组成的名称特别长的 BSD 设备时，结果就是你的程序出现了「*可利用内存损坏*」错误。

这些值很有可能是空字符终止的（也可能不是），但我会告诉你如何来处理这个问题，以便在两种情况下都适用。这意味着我们再也不需要考虑这个问题，从而降低大脑负荷。在其他场景复用这个代码的人也不需要再考虑这个问题了。既然有这么大的好处，何不马上开始？

偏题了，让我们回到正题……

## 部分解决方案

首先我们需要计算字段的偏移量。用新的 `MemoryLayout.offset` 方法可以得到结果：`MemoryLayout<statfs>.offset(of: \Darwin.statfs.f_mntfromname)!`。由于结构体和函数名字相同，当我们构造关键路径时，需要提供完整的路径名（fully-qualified name），否则会得到「*无法确定有歧义的引用路径*」的错误。我们可以强制解包返回值因为我们知道关键路径有效并且字段有偏移量。

将字段的内存布局偏移量加上 `withUnsafePointer` 指针就可以得到一个指向结构体字段起始内存的指针。我们可以通过这种方式创建一个字符串对象：

```swift
return withUnsafePointer(to: fsinfo, { (ptr) -> String? in
    let offset = MemoryLayout<statfs>.offset(of: \Darwin.statfs.f_mntfromname)!
    let fieldPtr = (UnsafeRawPointer(ptr) + offset).assumingMemoryBound(to: UInt8.self)
    if fieldPtr[count - 1] != 0 {
        let data = Data(bytes: UnsafeRawPointer(fieldPtr), count: count)
        return String(data: data, encoding: .utf8)
    } else {
        return String(cString: fieldPtr)
    }
})
```

我们首先快速检查了缓冲区是否是空字符结尾。如果是，就采用 C 字符串这条捷径。反之，为了便于使用 String 的长度限制构造方法，我们创建了一个 Data 实例。看起来用 `Data(bytesNoCopy:count:deallocator:)` 也行，但 `String(data:encoding:)` 初始化方法并不保证拷贝 Data 底层的缓冲区，`Data` 的构造过程也同样如此。虽然这种情况极少见，我们还是谨慎为好。（假如目前的方法会导致性能问题，我可能会花时间调研其他方案。）

有一种可能情况是，先写入由空字符终止的较短的字符串到缓冲区，剩余的部分则是被垃圾数据填充。由于 Swift 在初始化结构体时会强制清除内存，所以只有当内核拷贝垃圾数据到这块地址时，上述情况才可能发生。我们可以忽略这种情况，因为内核会尽量避免泄漏内核内存到用户空间，否则我们就只能用更耗时的方式了。（将这些字节转换为字符串的方式数不胜数，我这里就不一一列举了。）

现在我们来实现 `statfs` 的扩展：

```swift
extension statfs {
    var mntfromname: String? {
        mutating get {
            return withUnsafePointer(to: fsinfo, { (ptr) -> String? in
                let offset = MemoryLayout<statfs>.offset(of: \Darwin.statfs.f_mntfromname)!
                let fieldPtr = (UnsafeRawPointer(ptr) + offset).assumingMemoryBound(to: UInt8.self)
                let count = Int(MAXPATHLEN)
                if fieldPtr[count - 1] != 0 {
                    let data = Data(bytes: UnsafeRawPointer(fieldPtr), count: count)
                    return String(data: data, encoding: .utf8)
                } else {
                    return String(cString: fieldPtr)
                }
            })
        }
    }
}
```

这段代码很管用，但假如我们也想处理别的字段，例如 `f_mntoname` 呢？复制代码似乎不怎么好，所以让这段代码支持泛型，使之更加通用才对；我们只需要接受 key path 和 count 作为参数，再稍作修改就可以了：

```swift
func fixedArrayToString<T>(t: T, keyPath: PartialKeyPath<T>, count: Int) -> String? {
    return withUnsafePointer(to: t) { (ptr) -> String? in
        let offset = MemoryLayout<T>.offset(of: keyPath)!
        let fieldPtr = (UnsafeRawPointer(ptr) + offset).assumingMemoryBound(to: UInt8.self)
        if fieldPtr[count - 1] != 0 {
            let data = Data(bytes: UnsafeRawPointer(fieldPtr), count: count)
            return String(data: data, encoding: .utf8)
        } else {
            return String(cString: fieldPtr)
        }
    }
}

extension statfs {
    var mntfromname: String? {
        get {
            return fixedArrayToString(
                t: self,
                keyPath: \Darwin.statfs.f_mntfromname,
                count: Int(MAXPATHLEN))
        }
    }

    var mntonname: String? {
        get {
            return fixedArrayToString(
                t: self,
                keyPath: \Darwin.statfs.f_mntonname,
                count: Int(MAXPATHLEN))
        }
    }
}
```

## 结语

现在你知道怎么把有 N 个元素的元组变成更实用的东西了吧。