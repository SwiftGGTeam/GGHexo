title: "Swift 工具类：处理临时文件"
date: 2018-06-04
tags: [Swift]
categories: [Ole Begemann]
permalink: temp-file-helper
keywords: 
custom_title: 
description: 

---
原文链接=https://oleb.net/blog/2018/03/temp-file-helper/
作者=Ole Begemann
原文日期=2018-03-22
译者=小袋子
校对=numbbbbb,Yousanflics
定稿=Forelax

<!--此处开始正文-->
我经常需要在某些操作中创建临时文件，每次都很繁琐：必须有合适的临时目录，确保文件名是唯一的，最后还不能忘记在操作完成之后删除文件。

实际上，“创建”是一个错误的说法，因为创建工作通常是由我使用的 API 负责的 — 而我只是提供了一个指向目的位置的 URL。举个例子，假设你的应用提供了一个分享 PDF 文件的功能。你需要创建一个 [`UIGraphicsPDFRenderer`](https://developer.apple.com/documentation/uikit/uigraphicspdfrenderer)对象来生成 PDF，然后调用 [`writePDF`](https://developer.apple.com/documentation/uikit/uigraphicspdfrenderer/1649119-writepdf) 方法并传入临时文件的 URL 生成 PDF 文件，最后在 iOS 分享列表（share sheet）中分享它。

为了使这个操作更加简便，我最近写了一个简单的 Swift 工具类。你可以这样使用：

<!--more-->

1、选择一个文件名来初始化 `TemporaryFile` ：
```
let tmp = try TemporaryFile(creatingTempDirectoryForFilename: "report.pdf")
```
这样就新建了一个唯一的临时目录。正如我前面提到的，这是个空目录，`TemporaryFile` 并不会创建任何文件。更确切地说，它只是提供了一个可以安全创建很多文件的目录，并且不用担心命名冲突。

2、`TemporaryFile`有两个属性，`directoryURL` 是创建的临时目录 URL。`fileURL` 是目录中的文件 URL，即初始化时指定的文件名：

```
print(tmp.directoryURL.path)
// → /var/folders/v8/tft1q…/T/…-8DC6DD131DC1
print(tmp.fileURL.path)
// → /var/folders/v8/tft1q…/T/…-8DC6DD131DC1/report.pdf
```

再次强调一下，该 URL 对应的文件暂时还不存在——你必须自己创建文件，通常来说可以把 URL 传入其他 API 来生成文件：

```
let renderer = UIGraphicsPDFRenderer(...)
try renderer.writePDF(to: tmp.fileURL) { context in
    // 编写代码
    // ...
}
```

你可以在目录中创建不同名字的文件，但是 `TemporaryFile` 类型目前只能用来存储单一的文件 URL。如果能够支持多文件 URL 的存储，那就会更好用了。

3、创建文件后，`TemporaryFile` 的值被应用中使用该文件的对象所持有（例如，创建文件函数的调用者）。当该对象完成后并且不再需要该文件时，可以调用`DeleTeDirectory`方法删除临时目录，包括其中的所有文件：

```
// 例如将 temp 文件传给 UIActivityController 用以分享
// ...
// 当你完成后, 调用 deleteDirectory
try tmp.deleteDirectory()
```

我曾考虑到让这个步骤自动化 — 你可以创建 `TemporaryFile` 类，然后在 `deinitializer` 中调用 `deleteDirectory`。最后我放弃了，因为这种行为可能让类型的使用者感到困惑。如果能够添加一个初始化标志位来配置删除行为就好了。

### 代码

以下是完整代码 (Swift 4.0):

```
import Foundation
/// 临时目录中临时文件的包装（Wrapper）。目录是为文件而特别创建的，因此不再需要文件时，可以安全地删除该文件。
///
/// 在你不再需要文件时，调用 `deleteDirectory`
struct TemporaryFile {
    let directoryURL: URL
    let fileURL: URL
    /// 删除临时目录和其中的所有文件。
    let deleteDirectory: () throws -> Void
	/// 使用唯一的名字来创建临时目录，并且使用 `fileURL` 目录中名为 `filename` 的文件来初始化接收者。
    ///
    /// - 注意: 这里不会创建文件！
    init(creatingTempDirectoryForFilename filename: String) throws {
        let (directory, deleteDirectory) = try FileManager.default
            .urlForUniqueTemporaryDirectory()
        self.directoryURL = directory
        self.fileURL = directory.appendingPathComponent(filename)
        self.deleteDirectory = deleteDirectory
    }
}

extension FileManager {
	/// 创建一个有唯一名字的临时目录并返回 URL。
    ///
    /// - 返回：目录 URL 的 tuple 以及删除函数。
    ///   完成后调用函数删除目录。
    ///
    /// - 注意: 在应用退出后，不应该存在依赖的临时目录。
    func urlForUniqueTemporaryDirectory(preferredName: String? = nil) throws
        -> (url: URL, deleteDirectory: () throws -> Void)
    {
        let basename = preferredName ?? UUID().uuidString

        var counter = 0
        var createdSubdirectory: URL? = nil
        repeat {
            do {
                let subdirName = counter == 0 ? basename : "\(basename)-\(counter)"
                let subdirectory = temporaryDirectory
                    .appendingPathComponent(subdirName, isDirectory: true)
                try createDirectory(at: subdirectory, withIntermediateDirectories: false)
                createdSubdirectory = subdirectory
            } catch CocoaError.fileWriteFileExists {
                // 捕捉到文件已存在的错误，并使用其他名字重试。
                // 其他错误传播到调用方。
                counter += 1
            }
        } while createdSubdirectory == nil

        let directory = createdSubdirectory!
        let deleteDirectory: () throws -> Void = {
            try self.removeItem(at: directory)
        }
        return (directory, deleteDirectory)
    }
}
```