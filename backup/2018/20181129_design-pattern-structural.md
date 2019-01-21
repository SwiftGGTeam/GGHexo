title: "Swift 中的设计模式 #3 外观模式与适配器模式"
date:2018-11-29
tags: [Design Patterns]
categories: [Swift]
permalink: design-pattern-structural

---

原文链接=https://www.appcoda.com/design-pattern-structural/
作者=Andrew Jaffee
原文日期=2018-09-04
译者=郑一一
校对=BigNerdCoding,pmst,Forelax
定稿=Forelax

<!--此处开始正文-->

本文是我的设计模式系列教程的第三篇。在第一篇文章中，我介绍了 [**创建型模式**中的*工厂模式*和*单例模式*](https://swift.gg/2018/09/10/design-pattern-creational/)。在第二篇文章中，又讨论了一下 [**行为型模式**中的*观察者模式*和*备忘录模式*](https://swift.gg/2018/11/26/design-pattern-behavorial/)。

<!--more-->

在本文中，我会就结构型模式中的**外观模式**和**适配器模式**分别举一个例子。首先，我建议你先去阅读前面提到的两篇文章，这会有助于你更熟悉软件设计模式的一些概念。除了简短地介绍一下设计模式的组成，我不会再重复介绍所有关于设计模式的概念了。如果需要了解，都可以在前面写的 [**第一篇**](https://swift.gg/2018/09/10/design-pattern-creational/)、 [**第二篇**](https://swift.gg/2018/11/26/design-pattern-behavorial/) 中找到。

接下来的几节，我们先来简单回顾一下设计模式的通用概念。“Gang of Four” (“GoF”) Erich Gamma，Richard Helm，Ralph Johonson，和 John Vlissides 在他们“[**设计模式：面向对象软件设计复用的基本原理**](https://smile.amazon.com/Design-Patterns-Object-Oriented-Addison-Wesley-Professional-ebook/dp/B000SEIBB8/)”的重要著作里整理了 23 种经典的设计模式。今天我们重点关注的是两种结构型设计模式：**外观模式**和**适配器模式**。

## 值语义的面向协议编程

你可能会发现世面上非常多设计模式教程的示例代码，仍然是基于面向对象编程原则（OOP）、引用语义和 [**引用类型**](http://iosbrain.com/blog/2018/06/07/swift-4-memory-management-via-arc-for-reference-types-classes/)（classes）编写的。所以，我决定编写一套基于 [**面向协议编程原则**](https://www.appcoda.com/pop-vs-oop/)（POP）、值语义和 [**值类型**](https://developer.apple.com/videos/play/wwdc2015/414/)（structs）的设计模式系列教程。如果你已经看过了我之前写的两篇文章，我希望你还能够熟悉一下 OOP 和 POP，引用语义和值语义这些概念。如果你还不是特别熟悉，我强烈建议赶紧去了解一下这些主题。本文所举的例子是全部基于 POP 和值语义的。

## 设计模式

设计模式是开发者用于管理软件复杂性极其重要的工具。作为常见的模板技术，它很好地对软件中类似的、重复出现的、容易识别的问题进行了概念化抽象。我们可以将它视作最佳实践，从而应用到日常中会遇到的那些编程场景中。举一个具体的例子，回想一下你在平常写代码过程中有多少次会使用或写了遵守 [**观察者设计模式**](https://www.appcoda.com/design-pattern-behavorial/) 的代码吧。

在观察者模式中，被观察者（一般来说是一个关键资源）会给所有依赖于自己的观察者，广播通知其内部状态的变化。观察者必须告知被观察者自己想接收通知，换句话说，观察者必须订阅通知。用户授权的 iOS 弹窗推送通知，就是一个典型的观察者模式的例子。

### 设计模式的分类

GoF 将 23 种设计模式归纳为三种类型，分别是“[**创建型**](https://www.appcoda.com/design-pattern-creational/)”、“[**行为型**](https://www.appcoda.com/design-pattern-behavorial/)”、“结构型”。本文会介绍两种**结构型**设计模式。先看一下结构这个词的定义：

> “以一种确定方式构建的事物以及实体中各部分元素之间不同关系的汇总。”
> \- https://www.merriam-webster.com/dictionary/structure

结构型设计模式的主要作用是明确一段代码的功能，并说明如何使用。大部分的结构型设计模式可以通过编写易读接口，来实现对一段代码的简化使用。因为一段代码势必要与其它代码联系，如果要为代码段编写出良好的接口，必须明确清晰地定义代码之间的各种关系。

## *外观*设计模式

> “外观可以定义为特殊结构化的建筑物表面或者错误的、表面上的、人为的外形或效果”。
> \- https://www.merriam-webster.com/dictionary/facade

大部分情况下，可以使用外观模式，为一组复杂接口创建一个简单接口。或许你已经写过“封装”代码。“封装”的意思就是对一段复杂代码的简化使用。

### *外观*设计模式的示例 app

外观设计模式示例的 playground 文件，可以在 [**GitHub**](https://github.com/appcoda/swift-design-patterns/tree/master/Facade) 找到。在这个例子里展示了，如何通过外观设计模式，来为沙盒文件系统创建一个简单的接口，供所有的 iOS app 使用。iOS 文件系统是一个庞大的操作系统子系统，功能包括创建、读取、删除、移动、重命名、拷贝文件和目录。允许获取和设置文件和目录的元数据，比如列出在指定目录下的所有文件。允许查看文件和目录的状态，比如某个指定文件是否可写。提供苹果推荐、预定义的目录名。实际上其包含的功能远远不止上面提到的这些。

由于 iOS 文件系统是一个拥有如此多特性和功能的宏大主题，因此也是一个非常好的例子，用来讲解如何通过外观设计模式来简化代码的使用。外观接口会废弃掉无关功能和杂乱代码的部分。另一方面，外观接口只会定义在某个具体 app 需要使用到的功能。或者在我的例子中，我将功能缩减到只有经常使用的那部分。这样做的好处是保证代码在不同 app 中都是可复用、可扩展，可维护的。

基于面向协议编程和值语义，我将 iOS 文件系统的主要特性进行了划分，从而将其变成可复用、可扩展的单元：协议和协议扩展。

我[**将四个协议组合成一个结构体，这个结构体代表了可以在所有 iOS 应用中使用的沙盒 iOS 目录**](http://iosbrain.com/blog/2018/04/22/ios-file-management-with-filemanager-in-protocol-oriented-swift-4/)（还可以看 [**这篇文章**](http://iosbrain.com/blog/2018/05/29/the-ios-file-system-in-depth/)）。因为未来你肯定会更多接触到更多面向协议编程和值语义相关的主题，要注意术语 **composed** 和 **composition** 在这里属于同义词。

除此之外，为了让你更专注于理解外观设计模式的使用，在后面的代码中，我省略了 Swift 错误处理和通用错误检查的代码。

### 外观设计模式的示例代码

接下来就看看我的代码吧。先确保已经下载了我在 [**GitHub**](https://github.com/appcoda/swift-design-patterns/tree/master/Facade) 上的 playground 文件。下面是苹果官方推荐的用于文件系统操作的预定义目录。

```swift
enum AppDirectories : String {
    case Documents = "Documents"
    case Inbox = "Inbox"
    case Library = "Library"
    case Temp = "tmp"
}
```

通过将文件操作限定在上述目录中，避免了复杂性，并遵循了人机界面指南的原则。

在探究文件操作的核心代码之前，先来看看使用外观设计模式所设计出来的接口吧。我创建了 `iOSAppFileSystemDirectory` 结构体，作为文件系统常用功能的简单可读接口。这个接口适用于 `AppDirectories` 枚举下的所有目录。事实上，我原本还可以加入诸如 [**符号化链接的创建**](https://developer.apple.com/documentation/foundation/filemanager/1414652-createsymboliclink)，或者使用 `FileHandle` 类实现对文件的精细控制。但是在实际情况中，我几乎不太使用到这些功能，更重要的一点是，我想要保持代码的简洁性。

我创建了由四个协议组成的外观。（我知道你看到下面的代码中只遵循了三个协议，这其实是因为其中有一个协议继承自另一个协议）：

```swift
struct iOSAppFileSystemDirectory : AppFileManipulation, AppFileStatusChecking, AppFileSystemMetaData {

    let workingDirectory: AppDirectories

    init(using directory: AppDirectories) {
        self.workingDirectory = directory
    }

    func writeFile(containing text: String, withName name: String) -> Bool {
        return writeFile(containing: text, to: workingDirectory, withName: name)
    }

    func readFile(withName name: String) -> String {
        return readFile(at: workingDirectory, withName: name)
    }

    func deleteFile(withName name: String) -> Bool {
        return deleteFile(at: workingDirectory, withName: name)
    }

    func showAttributes(forFile named: String) -> Void {
        let fullPath = buildFullPath(forFileName: named, inDirectory: workingDirectory)
        let fileAttributes = attributes(ofFile: fullPath)
        for attribute in fileAttributes {
            print(attribute)
        }
    }

    func list() {
        list(directory: getURL(for: workingDirectory))
    }

} // 完成结构体 iOSAppFileSystemDirectory 的定义
```

下面是一些用于测试 `iOSAppFileSystemDirectory` 结构体的代码： 

```swift
var iOSDocumentsDirectory = iOSAppFileSystemDirectory(using: .Documents)

iOSDocumentsDirectory.writeFile(containing: "New file created.", withName: "myFile3.txt")
iOSDocumentsDirectory.list()
iOSDocumentsDirectory.readFile(withName: "myFile3.txt")
iOSDocumentsDirectory.showAttributes(forFile: "myFile3.txt")
iOSDocumentsDirectory.deleteFile(withName: "myFile3.txt")
```

接下来的代码是在运行了 playground 文件中代码之后的控制台输出：

```
----------------------------
LISTING: /var/folders/5_/kd8__nv1139__dq_3nfvsmhh0000gp/T/com.apple.dt.Xcode.pg/containers/com.apple.dt.playground.stub.iOS_Simulator.Swift-Facade-Design-Pattern-1C4BD3E3-E23C-4991-A344-775D5585D1D7/Documents

File: "myFile3.txt"
File: "Shared Playground Data"

----------------------------

File created with contents: New file created.

(key: __C.FileAttributeKey(_rawValue: NSFileType), value: NSFileTypeRegular)
(key: __C.FileAttributeKey(_rawValue: NSFilePosixPermissions), value: 420)
(key: __C.FileAttributeKey(_rawValue: NSFileSystemNumber), value: 16777223)
(key: __C.FileAttributeKey(_rawValue: NSFileExtendedAttributes), value: {
    "com.apple.quarantine" = <30303836 3b356238 36656364 373b5377 69667420 46616361 64652044 65736967 6e205061 74746572 6e3b>;
})
(key: __C.FileAttributeKey(_rawValue: NSFileReferenceCount), value: 1)
(key: __C.FileAttributeKey(_rawValue: NSFileSystemFileNumber), value: 24946094)
(key: __C.FileAttributeKey(_rawValue: NSFileGroupOwnerAccountID), value: 20)
(key: __C.FileAttributeKey(_rawValue: NSFileModificationDate), value: 2018-08-29 18:58:31 +0000)
(key: __C.FileAttributeKey(_rawValue: NSFileCreationDate), value: 2018-08-29 18:58:31 +0000)
(key: __C.FileAttributeKey(_rawValue: NSFileSize), value: 17)
(key: __C.FileAttributeKey(_rawValue: NSFileExtensionHidden), value: 0)
(key: __C.FileAttributeKey(_rawValue: NSFileOwnerAccountID), value: 502)

File deleted.
```

我们来简单讨论下 `iOSAppFileSystemDirectory` 结构体所遵循的几个协议。`AppDirectoryNames` 协议和扩展定义和实现了以 `URL` 类型获取 `AppDirectories` 枚举中目录完整路径的方法。

```swift
protocol AppDirectoryNames {

    func documentsDirectoryURL() -> URL

    func inboxDirectoryURL() -> URL

    func libraryDirectoryURL() -> URL

    func tempDirectoryURL() -> URL

    func getURL(for directory: AppDirectories) -> URL

    func buildFullPath(forFileName name: String, inDirectory directory: AppDirectories) -> URL

} // end protocol AppDirectoryNames

extension AppDirectoryNames {

    func documentsDirectoryURL() -> URL {
        return FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
    }

    func inboxDirectoryURL() -> URL {
        return FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent(AppDirectories.Inbox.rawValue) // "Inbox")
    }
    
    func libraryDirectoryURL() -> URL {
        return FileManager.default.urls(for: FileManager.SearchPathDirectory.libraryDirectory, in: .userDomainMask).first!
    }
    
    func tempDirectoryURL() -> URL {
        return FileManager.default.temporaryDirectory
        //urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent(AppDirectories.Temp.rawValue) //"tmp")
    }
    
    func getURL(for directory: AppDirectories) -> URL {
        switch directory {
        case .Documents:
            return documentsDirectoryURL()
        case .Inbox:
            return inboxDirectoryURL()
        case .Library:
            return libraryDirectoryURL()
        case .Temp:
            return tempDirectoryURL()
        }
    }
    
    func buildFullPath(forFileName name: String, inDirectory directory: AppDirectories) -> URL {
        return getURL(for: directory).appendingPathComponent(name)
    }
} // end extension AppDirectoryNames
```

`AppFileStatusChecking` 协议和扩展封装了获取文件状态数据的方法。这些文件同样存储于 `AppDirectories` 枚举定义下的目录。通过“状态”，可以确定某个文件是否存在，是否可读等。

```swift
protocol AppFileStatusChecking {
    func isWritable(file at: URL) -> Bool
    
    func isReadable(file at: URL) -> Bool
    
    func exists(file at: URL) -> Bool
}

extension AppFileStatusChecking {
    func isWritable(file at: URL) -> Bool {
        if FileManager.default.isWritableFile(atPath: at.path) {
            print(at.path)
            return true
        }
        else {
            print(at.path)
            return false
        }
    }

    func isReadable(file at: URL) -> Bool {
        if FileManager.default.isReadableFile(atPath: at.path) {
            print(at.path)
            return true
        }
        else {
            print(at.path)
            return false
        }
    }

    func exists(file at: URL) -> Bool {
        if FileManager.default.fileExists(atPath: at.path) {
            return true
        }
        else {
            return false
        }
    }
} // end extension AppFileStatusChecking
```

`AppFileSystemMetaData` 协议和扩展实现了列出目录内容和获取扩展文件的功能。 其目录也是定义在 `AppDirectories` 枚举下。

```swift
protocol AppFileSystemMetaData {
    func list(directory at: URL) -> Bool

    func attributes(ofFile atFullPath: URL) -> [FileAttributeKey : Any]
}

extension AppFileSystemMetaData
{
    func list(directory at: URL) -> Bool {
        let listing = try! FileManager.default.contentsOfDirectory(atPath: at.path)

        if listing.count > 0 {
            print("\n----------------------------")
            print("LISTING: \(at.path)")
            print("")
            for file in listing {
                print("File: \(file.debugDescription)")
            }
            print("")
            print("----------------------------\n")

            return true
        }
        else {
            return false
        }
    }
    
    func attributes(ofFile atFullPath: URL) -> [FileAttributeKey : Any] {
        return try! FileManager.default.attributesOfItem(atPath: atFullPath.path)
    }
} //  end extension AppFileSystemMetaData
```

最后是 `AppFileManipulation` 协议和扩展，封装了 `AppDirectories` 枚举目录下的所有文件操作方法，包括了读、写、删除、重命名、移动、拷贝修改文件扩展名等。

```swift
protocol AppFileManipulation : AppDirectoryNames {
    func writeFile(containing: String, to path: AppDirectories, withName name: String) -> Bool
    
    func readFile(at path: AppDirectories, withName name: String) -> String
    
    func deleteFile(at path: AppDirectories, withName name: String) -> Bool
    
    func renameFile(at path: AppDirectories, with oldName: String, to newName: String) -> Bool
    
    func moveFile(withName name: String, inDirectory: AppDirectories, toDirectory directory: AppDirectories) -> Bool
    
    func copyFile(withName name: String, inDirectory: AppDirectories, toDirectory directory: AppDirectories) -> Bool
    
    func changeFileExtension(withName name: String, inDirectory: AppDirectories, toNewExtension newExtension: String) -> Bool
}
 
extension AppFileManipulation {
    func writeFile(containing: String, to path: AppDirectories, withName name: String) -> Bool {
        let filePath = getURL(for: path).path + "/" + name
        let rawData: Data? = containing.data(using: .utf8)
        return FileManager.default.createFile(atPath: filePath, contents: rawData, attributes: nil)
    }
    
    func readFile(at path: AppDirectories, withName name: String) -> String {
        let filePath = getURL(for: path).path + "/" + name
        let fileContents = FileManager.default.contents(atPath: filePath)
        let fileContentsAsString = String(bytes: fileContents!, encoding: .utf8)
        print("File created with contents: \(fileContentsAsString!)\n")
        return fileContentsAsString!
    }
    
    func deleteFile(at path: AppDirectories, withName name: String) -> Bool {
        let filePath = buildFullPath(forFileName: name, inDirectory: path)
        try! FileManager.default.removeItem(at: filePath)
        print("\nFile deleted.\n")
        return true
    }
    
    func renameFile(at path: AppDirectories, with oldName: String, to newName: String) -> Bool {
        let oldPath = getURL(for: path).appendingPathComponent(oldName)
        let newPath = getURL(for: path).appendingPathComponent(newName)
        try! FileManager.default.moveItem(at: oldPath, to: newPath)
        
        // highlights the limitations of using return values
        return true
    }
    
    func moveFile(withName name: String, inDirectory: AppDirectories, toDirectory directory: AppDirectories) -> Bool {
        let originURL = buildFullPath(forFileName: name, inDirectory: inDirectory)
        let destinationURL = buildFullPath(forFileName: name, inDirectory: directory)
        // warning: constant 'success' inferred to have type '()', which may be unexpected
        // *let success =*
        try! FileManager.default.moveItem(at: originURL, to: destinationURL)
        return true
    }
    
    func copyFile(withName name: String, inDirectory: AppDirectories, toDirectory directory: AppDirectories) -> Bool {
        let originURL = buildFullPath(forFileName: name, inDirectory: inDirectory)
        let destinationURL = buildFullPath(forFileName: name, inDirectory: directory)
        try! FileManager.default.copyItem(at: originURL, to: destinationURL)
        return true
    }
    
    func changeFileExtension(withName name: String, inDirectory: AppDirectories, toNewExtension newExtension: String) -> Bool {
        var newFileName = NSString(string:name)
        newFileName = newFileName.deletingPathExtension as NSString
        newFileName = (newFileName.appendingPathExtension(newExtension) as NSString?)!
        let finalFileName:String =  String(newFileName)
        
        let originURL = buildFullPath(forFileName: name, inDirectory: inDirectory)
        let destinationURL = buildFullPath(forFileName: finalFileName, inDirectory: inDirectory)
        
        try! FileManager.default.moveItem(at: originURL, to: destinationURL)
        
        return true
    }
} // end extension AppFileManipulation
```

## *适配器*设计模式

> “适配”的含义是“通过修改让一个事物更适合（用于新用途）。”
> \- https://www.merriam-webster.com/dictionary/adapts

> “适配器”的含义是“用于适配不在初始使用意图范围内设备的一种附加装置。”
> \- https://www.merriam-webster.com/dictionary/adapter

适配器设计模式的作用是在不修改已有代码库 "A" 的前提下，仍旧可以使用与代码库 "A" 不兼容的代码库 "B"，并保证 "A" 可以正常工作。我们可以创建适配器来保证 "A" 和 "B" 可以一起工作。其中一定要牢记的原则是代码库 "A" 是不能被修改的。（这是因为修改会破坏原有代码或者我们根本就没有这段源代码）

### *适配器*设计模式示例 app

适配器的 playground 文件，可以在 [**GitHub**](https://github.com/appcoda/swift-design-patterns/tree/master/Adapter) 上找到。在这部分代码中，我们基于 iOS 文件系统进行适配器模式的讨论，并基于 iOS 文件系统设计了一个适配器模式的例子。之前一章，我们已经实现了将 iOS 文件系统中所有目录和文件的路径表示为 `URL` 实例。想象一下下面的场景，在原有工程中已经存在了大量关于 iOS 文件系统的代码，但是所有目录和文件的路径都表示成了字符串形式。那我们就必须要让基于 URL 和基于 String 的代码可以协同工作。

#### *适配器*设计模式的示例代码

接下来就看看代码吧。先确保已经下载了在 [**GitHub**](https://github.com/appcoda/swift-design-patterns/tree/master/Adapter) 上的 playground 文件。为了在接下来的分析中更加专注于适配器模式的讨论，下面会使用简化版本的 `AppDirectories` 枚举和 `AppDirectoryNames` 协议和扩展。

```swift
enum AppDirectories : String {
    case Documents = "Documents"
    case Temp = "tmp"
}
 
protocol AppDirectoryNames {
    func documentsDirectoryURL() -> URL
    
    func tempDirectoryURL() -> URL
}
 
extension AppDirectoryNames {
    func documentsDirectoryURL() -> URL {
        return FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
    }
    
    func tempDirectoryURL() -> URL {
        return FileManager.default.temporaryDirectory
    }
}
```

一种方法是创建一个“专用”适配器。这个适配器会返回字符串路径，这些路径全部归属于在 `AppDirectories` 下的目录和文件。

```swift
// 专用适配器
struct iOSFile : AppDirectoryNames {
    let fileName: URL
    var fullPathInDocuments: String {
        return documentsDirectoryURL().appendingPathComponent(fileName.absoluteString).path
    }
    var fullPathInTemporary: String {
        return tempDirectoryURL().appendingPathComponent(fileName.absoluteString).path
    }
    var documentsStringPath: String {
        return documentsDirectoryURL().path
    }
    var temporaryStringPath: String {
        return tempDirectoryURL().path
    }
 
    init(fileName: String) {
        self.fileName = URL(string: fileName)!
    }
}
```

下一部分是用于测试 `iOSFile` “专用”适配器的代码，请注意代码中的注释。 

```swift
let iOSfile = iOSFile(fileName: "myFile.txt")
iOSfile.fullPathInDocuments
iOSfile.documentsStringPath
 
iOSfile.fullPathInTemporary
iOSfile.temporaryStringPath
 
// 通过 `AppDirectoryNames` 协议，仍然能够访问到 URL
iOSfile.documentsDirectoryURL()
iOSfile.tempDirectoryURL()
```

最后是 playground 文件中每一行代码对应的右侧输出，这些输出代表了运行时每一行代码的值。参照上一段代码，我们可以进行逐行对照。 

```
iOSFile
"/var/folders/5_/kd8__nv1139__dq_3nfvsmhh0000gp/T/com.apple.dt.Xcode.pg/containers/com.apple.dt.playground.stub.iOS_Simulator.Swift-Adapter-Design-Pattern-0A71F81A-9388-41F5-ACBE-52A1A61A9B99/Documents/myFile.txt"
"/var/folders/5_/kd8__nv1139__dq_3nfvsmhh0000gp/T/com.apple.dt.Xcode.pg/containers/com.apple.dt.playground.stub.iOS_Simulator.Swift-Adapter-Design-Pattern-0A71F81A-9388-41F5-ACBE-52A1A61A9B99/Documents"
 
"/Users/softwaretesting/Library/Developer/XCPGDevices/52E1A81A-98AF-42DE-ADCF-E69AC8FA2791/data/Containers/Data/Application/F08EFF4F-8C4F-4BB7-B220-980E16344F18/tmp/myFile.txt"
"/Users/softwaretesting/Library/Developer/XCPGDevices/52E1A81A-98AF-42DE-ADCF-E69AC8FA2791/data/Containers/Data/Application/F08EFF4F-8C4F-4BB7-B220-980E16344F18/tmp"
 
file:///var/folders/5_/kd8__nv1139__dq_3nfvsmhh0000gp/T/com.apple.dt.Xcode.pg/containers/com.apple.dt.playground.stub.iOS_Simulator.Swift-Adapter-Design-Pattern-0A71F81A-9388-41F5-ACBE-52A1A61A9B99/Documents/
file:///Users/softwaretesting/Library/Developer/XCPGDevices/52E1A81A-98AF-42DE-ADCF-E69AC8FA2791/data/Containers/Data/Application/F08EFF4F-8C4F-4BB7-B220-980E16344F18/tmp/
```

另外，我还倾向为字符串类型的路径设计一个适配器协议。这样就可以很方便地使用`字符串`路径来替代 `URL` 路径。

```swift
// Protocol-oriented approach
protocol AppDirectoryAndFileStringPathNamesAdpater : AppDirectoryNames {
    
    var fileName: String { get }
    var workingDirectory: AppDirectories { get }
 
    func documentsDirectoryStringPath() -> String
    
    func tempDirectoryStringPath() -> String
    
    func fullPath() -> String
    
} // end protocol AppDirectoryAndFileStringPathAdpaterNames
 
extension AppDirectoryAndFileStringPathNamesAdpater {
   
    func documentsDirectoryStringPath() -> String {
        return documentsDirectoryURL().path
    }
    
    func tempDirectoryStringPath() -> String {
        return tempDirectoryURL().path
    }
    
    func fullPath() -> String {
        switch workingDirectory {
        case .Documents:
            return documentsDirectoryStringPath() + "/" + fileName
        case .Temp:
            return tempDirectoryStringPath() + "/" + fileName
        }
    }
 
} // end extension AppDirectoryAndFileStringPathNamesAdpater
 
struct AppDirectoryAndFileStringPathNames : AppDirectoryAndFileStringPathNamesAdpater {
    
    let fileName: String
    let workingDirectory: AppDirectories
    
    init(fileName: String, workingDirectory: AppDirectories) {
        self.fileName = fileName
        self.workingDirectory = workingDirectory
    }
    
} // end struct AppDirectoryAndFileStringPathNames
```

接下来是用于测试 `AppDirectoryAndFileStringPathNames` 结构体的代码。这个结构体遵守了 `AppDirectoryAndFileStringPathNamesAdpater` 适配器协议。协议继承自 `AppDirectoryNames` 协议。注意在代码中的两段注释。 

```swift
let appFileDocumentsDirectoryPaths = AppDirectoryAndFileStringPathNames(fileName: "myFile.txt", workingDirectory: .Documents)
appFileDocumentsDirectoryPaths.fullPath()
appFileDocumentsDirectoryPaths.documentsDirectoryStringPath()
 
// 通过 `AppDirectoryNames` 协议仍然可以访问 URL
appFileDocumentsDirectoryPaths.documentsDirectoryURL()
 
let appFileTemporaryDirectoryPaths = AppDirectoryAndFileStringPathNames(fileName: "tempFile.txt", workingDirectory: .Temp)
appFileTemporaryDirectoryPaths.fullPath()
appFileTemporaryDirectoryPaths.tempDirectoryStringPath()
 
// 通过 `AppDirectoryNames` 协议仍然可以访问 URL
appFileTemporaryDirectoryPaths.tempDirectoryURL()
```

最后是在 playground 文件中右侧的输出。每一行代表了运行时的代码值，下面的输出同样和上一段代码是逐行对应的。

```
AppDirectoryAndFileStringPathNames
"/var/folders/5_/kd8__nv1139__dq_3nfvsmhh0000gp/T/com.apple.dt.Xcode.pg/containers/com.apple.dt.playground.stub.iOS_Simulator.Swift-Adapter-Design-Pattern-A3DE7CC8-D60F-4448-869F-2A19556C62B2/Documents/myFile.txt"
"/var/folders/5_/kd8__nv1139__dq_3nfvsmhh0000gp/T/com.apple.dt.Xcode.pg/containers/com.apple.dt.playground.stub.iOS_Simulator.Swift-Adapter-Design-Pattern-A3DE7CC8-D60F-4448-869F-2A19556C62B2/Documents"
 
file:///var/folders/5_/kd8__nv1139__dq_3nfvsmhh0000gp/T/com.apple.dt.Xcode.pg/containers/com.apple.dt.playground.stub.iOS_Simulator.Swift-Adapter-Design-Pattern-A3DE7CC8-D60F-4448-869F-2A19556C62B2/Documents/
 
AppDirectoryAndFileStringPathNames
"/Users/softwaretesting/Library/Developer/XCPGDevices/52E1A81A-98AF-42DE-ADCF-E69AC8FA2791/data/Containers/Data/Application/CF3D4156-E773-4BC4-B117-E7BDEFA3F34C/tmp/tempFile.txt"
"/Users/softwaretesting/Library/Developer/XCPGDevices/52E1A81A-98AF-42DE-ADCF-E69AC8FA2791/data/Containers/Data/Application/CF3D4156-E773-4BC4-B117-E7BDEFA3F34C/tmp"
 
file:///Users/softwaretesting/Library/Developer/XCPGDevices/52E1A81A-98AF-42DE-ADCF-E69AC8FA2791/data/Containers/Data/Application/CF3D4156-E773-4BC4-B117-E7BDEFA3F34C/tmp/
```

## 结论

设计模式不仅有利于代码复用，还能保证代码是不变、易读、松耦合的，从而提高了可维护性和拓展性。当重复出现并且能加以抽象的功能在你的 app 中出现的时候，我希望你能应用一下设计模式，并 [**封装进框架**](http://iosbrain.com/blog/2018/01/13/building-swift-4-frameworks-and-including-them-in-your-apps-xcode-9/) 中。这样子你只需要写一次代码，就可以一直复用啦。

再次感谢大家来 AppCoda 给我捧场。享受工作，坚持学习，下次再见吧！