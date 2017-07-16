title: "如何把字符串数组从 Swift 传递给 C"
date: 2016-12-20
tags: [Swift 进阶]
categories: [Ole Begemann]
permalink: swift-array-of-c-strings
keywords: swift字符串,c字符串传递
custom_title: 
description: Swift 是可以把字符串传递给 C 的，但具体怎么操作相信很多人不会吧，下面就来教你将 Swift 字符串数组转换为 C 字符串数组后传递指向 C 字符串的指针数组。

---
原文链接=https://oleb.net/blog/2016/10/swift-array-of-c-strings/
作者=Natasha The Robot
原文日期=2016-10-27
译者=BigbigChai
校对=walkingway
定稿=CMB

<!--此处开始正文-->

Swift 允许我们将原生的字符串直接传递给一个接受 C String（即 `char *`）的 C API。 比如说，你可以在 Swift 里调用 [strlen](https://linux.die.net/man/3/strlen) 函数，如下所示：

```swift
import Darwin // or Glibc on Linux
strlen("Hello 😃") // → 10
```

<!--more-->

虽然在 Swift 中，`const char *` 参数是作为 `UnsafePointer \<Int8>!` 导入的，但这的确可行。 Swift 导入的 strlen 函数的完整类型定义如下：

```swift
func strlen(_ __s: UnsafePointer<Int8>!) -> UInt
```

类型检查器能够 [将 String 值传递给一个 `UnsafePointer<Int8>` 或 `UnsafePointer<UInt8>` 参数](https://developer.apple.com/library/content/documentation/Swift/Conceptual/BuildingCocoaApps/InteractingWithCAPIs.html#//apple_ref/doc/uid/TP40014216-CH8-ID17) 。在此过程中，编译器隐式地创建了一个缓冲区，它包含一段以 UTF-8 编码、以 `null` 结束的字符串，并传回一个指向缓冲区的指针给函数。

## 对 C 字符串数组没有内置支持

Swift 处理单个 `char *` 参数的方式非常简便。但是，一些 C 函数接收字符串数组（一个 `char *` 或 `char * []`）作为参数，而 Swift 对将 `[String]` 传递给一个 `char *` 参数并没有内置支持。

一个实用的例子是子进程启动时的 [posix_spawn](https://linux.die.net/man/3/posix_spawn) 函数。 posix_spawn 的最后两个参数（`argv` 和 `envp`）是用于传递新进程的参数和环境变量的字符串数组。文档中是这么说明的：

> `argv`（和 `envp`）是指向以 `null` 结尾的字符串数组指针，数组元素指向以 `null` 结束的字符串。  

Swift 将这些参数中 C 类型的 `char *` `const` `argv []` 转换为难以处理的 `UnsafePointer` `<UnsafeMutablePointer<Int8>?>!`，感叹号表示 [对可选值隐式解包](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/TheBasics.html#//apple_ref/doc/uid/TP40014097-CH5-ID330) ，告诉我们 API 这里的参数不能为空，即 Swift 不知道函数是否接受传递 NULL（在这种情况下外层 `UnsafePointer` 将为可选值）。我们必须参考文档来回答这个问题。在本示例中，文档明确声明了 `argv` 必须至少包含一个元素（生成程序的文件名）。 `envp` 可以为 `NULL` ，表示它将继承其父进程的环境。

## 将 Swift 字符串数组转换为 C 字符串数组

假设我们想为 posix_spawn 提供一个优雅的 Swift 接口。 我们的封装函数应该接收以下参数，一是正在启动的程序的路径，二是字符串数组：

```swift
/// 产生一个子进程
///
/// - Returns: A pair containing the return value of `posix_spawn` and the pid of the spawned process.
func spawn(path: String, arguments: [String]) -> Int32
```

现在我们需要将参数数组转换为 posix_spawn 能够接收的格式。 这需要几个步骤：

* 以 UTF-8 编码字符串元素。
* 为每个 UTF-8 编码的字符串的末尾添加一个空字节。
* 将所有 UTF-8 编码的、以空字节结尾的字符串拷贝到一个缓冲区中。
* 在缓冲区的末尾添加另一个空字节，表明 C 数组的结尾。
* 确保缓冲区存在于 posix_spawn 被调用的整个生命周期内。

#### `withArrayOfCStrings` 在标准库中

Swift 团队也需要使用这个功能来运行标准库的单元测试，因此标准库的源也包括一个名为 [`withArrayOfCStrings`](https://github.com/apple/swift/blob/c3b7709a7c4789f1ad7249d357f69509fb8be731/stdlib/private/SwiftPrivate/SwiftPrivate.swift#L68-L90) 的函数。现在这是一个私有函数，不公开暴露给 stdlib 使用者（虽然它被声明为 `public`，大概因为不这么做的话单元测试无法看到它）。但这个函数依然对我们可见。这是该函数的接口：

```swift
public func withArrayOfCStrings<R>(
  _ args: [String],
  _ body: ([UnsafeMutablePointer<CChar>?]) -> R
) -> R
```

它具有与 [withUnsafePointer](https://developer.apple.com/reference/swift/2431879-withunsafepointer) 及其变体相同的形式：它的结果类型 R 是一个泛型，并且接收一个闭包作为参数。其思想是，在将字符串数组转换为 C 数组之后， `withArrayOfCStrings` 调用闭包，传递 C 数组，并将闭包的返回值转发给其调用者。这使得 `withArrayOfCStrings` 函数完全控制它自己创建缓冲区的生命周期。

我们现在可以这样实现 `spawn` 函数：

```swift
/// Spawns a child process.
///
/// - Returns: A pair containing the return value of `posix_spawn` and the pid of the spawned process.
func spawn(path: String, arguments: [String]) -> (retval: Int32, pid: pid_t) {
    // Add the program's path to the arguments
    let argsIncludingPath = [path] + arguments

    return withArrayOfCStrings(argsIncludingPath) { argv in
        var pid: pid_t = 0
        let retval = posix_spawn(&pid, path, nil, nil, argv, nil)
        return (retval, pid)
    }
}
```

为什么这是可行的呢？能注意到 `withArrayOfCStrings` 的闭包参数的类型为 `([UnsafeMutablePointer<CChar>?]) -> R` 。参数类型 `[UnsafeMutablePointer <CChar>?]` 看起来与 `posix_spawn` 要求的 `UnsafePointer <UnsafeMutablePointer<Int8>?>!` 并不兼容，但其实是兼容的。`CChar` 只是 `Int8` 的别名。再者，正如 Swift 对于传递给 C 的字符串会有特殊处理，编译器隐式地将原生 Swift 数组传递给接收 `UnsafePointer<Element>`  参数的 C 函数。因此我们可以将数组直接传递给 `posix_spawn`，只要它的元素类型与指针指向元素的类型相匹配。

这是使用 `spawn` 函数的样例：

```swift
let (retval, pid) = spawn(path: "/bin/ls", arguments: ["-l", "-a"])
```

这是执行程序的输出：

```
$ swift spawn.swift
posix_spawn result: 0
new process pid: 17477
total 24
drwxr-xr-x   4 elo  staff   136 Oct 27 17:04 .
drwx---r-x@ 41 elo  staff  1394 Oct 24 20:12 ..
-rw-r--r--@  1 elo  staff  6148 Oct 27 17:04 .DS_Store
-rw-r--r--@  1 elo  staff  2342 Oct 27 15:28 spawn.swift
```

（注意，如果你在 playground 中调用它，`posix_spawn` 会返回一个错误，可能是因为 playground 的沙盒不允许生成子进程。因此最好通过命令行创建，或在 Xcode 中创建一个新的命令项目）。

#### 工作原理

[`withArrayOfCStrings` 的完整实现](https://github.com/apple/swift/blob/c3b7709a7c4789f1ad7249d357f69509fb8be731/stdlib/private/SwiftPrivate/SwiftPrivate.swift#L68-L90) 如下所示：

``` swift
public func withArrayOfCStrings<R>(
_ args: [String], _ body: ([UnsafeMutablePointer<CChar>?]) -> R
) -> R {
  let argsCounts = Array(args.map { $0.utf8.count + 1 })
  let argsOffsets = [ 0 ] + scan(argsCounts, 0, +)
  let argsBufferSize = argsOffsets.last!

  var argsBuffer: [UInt8] = []
  argsBuffer.reserveCapacity(argsBufferSize)
  for arg in args {
    argsBuffer.append(contentsOf: arg.utf8)
    argsBuffer.append(0)
  }

  return argsBuffer.withUnsafeMutableBufferPointer {
    (argsBuffer) in
    let ptr = UnsafeMutableRawPointer(argsBuffer.baseAddress!).bindMemory(
      to: CChar.self, capacity: argsBuffer.count)
    var cStrings: [UnsafeMutablePointer<CChar>?] = argsOffsets.map { ptr + $0 }
    cStrings[cStrings.count - 1] = nil
    return body(cStrings)
  }
}
```

让我们逐行解说。第一行为输入的字符串创建一个 UTF-8 编码的字符计数（加上为空的终止标识的一字节）的数组：

```swift
  let argsCounts = Array(args.map { $0.utf8.count + 1 })
```

下一行读取这些字符计数，并计算每个输入字符串的字符偏移量，即每个字符串将在缓冲区中的开始位置。第一个字符串当然将被定位在偏移量为零的地方，并通过累积字符计数来计算后续偏移量：

```swift
  let argsOffsets = [ 0 ] + scan(argsCounts, 0, +)
```

代码使用一个名为 scan 的帮助函数，它[定义在同一个文件里](https://github.com/apple/swift/blob/c3b7709a7c4789f1ad7249d357f69509fb8be731/stdlib/private/SwiftPrivate/SwiftPrivate.swift#L27-L39)。注意，`argsOffsets` 包含的元素数量比 `argsCounts` 多一个。因为 `argsOffsets` 的最后一个元素是最后一个输入字符串之后的偏移量，即所需的缓冲区的大小。

下一步是创建一个字节数组（元素类型为 `UInt8`）用作缓冲区。由于缓冲区会自动增长，因此调用 `reserveCapacity` 不是必要的。但如果在开始时能事先知道的所需容量并保留的话，可以避免重复的分配行为：

```swift
  let argsBufferSize = argsOffsets.last!

  var argsBuffer: [UInt8] = []
  argsBuffer.reserveCapacity(argsBufferSize)
```

现在可以将 `UTF-8` 编码的字节写入缓冲区，并在每个输入的字符串后添加一个空字节：

```swift
  for arg in args {
    argsBuffer.append(contentsOf: arg.utf8)
    argsBuffer.append(0)
  }
```

此时，我们有一个正确格式的字节数组（`UInt8`）。我们仍然需要构造指向缓冲区中的元素的指针数组。这就是函数最后一部分的作用：

```swift
  return argsBuffer.withUnsafeMutableBufferPointer {
    (argsBuffer) in
    let ptr = UnsafeMutableRawPointer(argsBuffer.baseAddress!).bindMemory(
      to: CChar.self, capacity: argsBuffer.count)
    var cStrings: [UnsafeMutablePointer<CChar>?] = argsOffsets.map { ptr + $0 }
    cStrings[cStrings.count - 1] = nil
    return body(cStrings)
  }
```

我们利用 [withUnsafeMutableBufferPointer](https://developer.apple.com/reference/swift/array/1538652-withunsafemutablebufferpointer) 获得数组，其元素表示指向缓冲区的指针。内部闭包的第一行代码通过 `UnsafeMutableRawPointer` 将元素指针的类型从 `UnsafeMutablePointer<UInt8>` 转换为 `UnsafeMutablePointer <CChar>` 。 （从 Swift 3.0 开始，你不能直接在类型化的指针之间进行转换，[你必须首先转换成 `Unsafe[Mutable] RawPointer`](https://github.com/apple/swift-evolution/blob/master/proposals/0107-unsaferawpointer.md) 。）这段代码的可读性不是很好，但对我们来说这行之后的内容才是重要的。本地 `ptr` 变量是指向缓冲区中的第一个字节的 `UnsafeMutablePointer<CChar>`。

现在，为了构造指针数组，我们为第二行中创建的字符偏移数组做映射，并根据每个偏移量向后移动指针。最后将结果数组中的最后一个元素设置为 `nil`，用作表示数组结尾的空指针（记得我们之前说的 `argsOffset` 要比输入数组包含多一个元素吗？因此重写最后一个元素是正确的）。

最后，我们可以调用从调用者传递过来的闭包，传递指向 C 字符串的指针数组。

[^1]: 注意，由于上面的 emoji 是以 `UTF-8` 格式传递的，它在 `strlen` 函数里会占用四个“字符“。
[^2]: 在这里使用了 `posix_spawn` 作为简单的例子来讲解。但在生产代码中，应该使用 `Foundation` 框架里更高级的 `Process` 类（née `NSTask`）来实现。