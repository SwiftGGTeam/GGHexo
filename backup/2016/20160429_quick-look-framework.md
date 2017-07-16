title: "使用 Quick Look Framework 快速预览文档"
date: 2016-04-29
tags: [Swift 进阶]
categories: [AppCoda]
permalink: quick-look-framework
keywords: quicklook框架,quicklook.framework
custom_title: 
description: 很多人都不知道在 iOS SDK 中有个叫 Quick Look Framework 的框架可以为应用提供文档预览吧，下面就来介绍下这个实用性很强的框架。

---
原文链接=http://www.appcoda.com/quick-look-framework/
作者=GABRIEL THEODOROPOULOS
原文日期=2016-04-12
译者=小铁匠Linus
校对=walkingway
定稿=shanks

<!--此处开始正文-->

在 iOS SDK 中可以发现很多不是很有名的框架或者库。这些框架或库大多数都可以为你节省很多时间，同时也证明它们自己的价值。其中，有一个叫 *Quick Look Framework* 的框架。即使你之前可能没有听说过它，但是你看到它的名字也就大概知道它的用途了；它可以为应用提供文档预览的功能。

<!--more-->

Quick Look Framework 使用起来很简单，它可以预览特定类型的文件。它支持的文件类型有：

* iWork 文档 (Pages，Numbers 和 Keynote)
* Microsoft Office 文档 (只要是 Office 97 或更新的版本都支持)
* PDF 文件
* 图片
* 文本文件
* 富文本格式文档
* CSV

正如你现在所想的那样，如果你的应用程序正在处理上述文件类型的文件，你希望用户能够预览他们的内容，这个框架就会变得非常方便。不仅如此，Quick Look Framework 也提供了分享功能。发送或者共享预览中的文档会呈现一个 activity controller(`UIActivityViewController`)。

开发者使用 Quick Look Framework 的主要任务是提供一个可以为 preview controller 打开特定文档进行预览的 `datasource`。该 datasource 实际上是一个 `NSURL` 对象的列表，它指定了每个文档的路径，该路径可以是本地存储的，也可以是网络地址。本地存储的文件包括存在 documents directory 或者 bundle 等。

Quick Look Framework 提供了一个叫 `QLPreviewController`(Quick Look Preview Controller) 的视图控制器，用来快速查看一个文档。该视图控制器可以以模态的形式呈现，如果应用有 navagation 也可以通过压入 navigation 栈来呈现。它是 Quick Look Framework 重要的一个组件，一旦它呈现出来，就会提供分享选项，也可以在不关闭预览控制器的情况下切换所有其它可以预览的文档。另外，Quick Look Framework 有两个 datasource 方法需要实现，这两个方法属于 `QLPreviewControllerDataSource` 协议。除此之外，还有个 `QLPreviewControllerDelegate` 协议是可选实现的，如果实现的话，能够丰富 Quick Look Framework 的其它功能。

我们会在接下来的部分讨论具体细节，也会像之前那样用一个具体的 demo 来演示。然而在开始前，我们先快速浏览一下用来演示的 demo。

## 关于 demo APP

为了教程的展示需要，我们会使用 navigation 和一个视图控制器。该视图控制器(FileListViewController)会在 tableview 中展示一些文件，这些文件保存在应用的 bundle 里。我们不会使用所有支持的文件类型；只是选用了其中的一部分来说明 Quick Look Framework 是如何使用的。

当点击 tableview 中对应于文件的那一行时，Quick Look Preview Controller 会打开对应的文档进行预览。Quick Look Preview Controller 会被压入 navigation 栈中，当然我也会展示如何以模态的形式呈现(实际上，与其它呈现模态的视图控制器方式是完全一样的)。最后，我们也会讲一下额外提供的功能(比如，分享和切换文档等功能)，以及讨论一下另外可选的代理方法。

接下来的截图展示的是初始的视图控制器(`FileListViewController`)。正如你看到的，每一行都会显示文件名以及其对应的文件类型。

<center>
![](http://www.appcoda.com/wp-content/uploads/2016/04/t51_1_file_list.png)
</center>

当一个文档被选中，预览如下：

<center>
![](http://www.appcoda.com/wp-content/uploads/2016/04/t51_2_document_preview.png)
</center>

你可以从[这里](https://github.com/simonng/QuickLookDemo/blob/master/QuickLookDemoStarter.zip)下载工程的初始代码。下载之后，你可以打开快速预览一下，接下去我们会一步步地引导你走下去。

## 文件以及文件的 URL

在初始工程中，你会发现一组我们在 demo 中展示的示例文件。这些文件已经添加到了应用的 bundle 中了，但是要显示预览还远远不够。我们的职责就是来告诉应用，到底哪个文件是需要通过 Quick Look framework 预览的。

目标已经很明确了，我们创建一个数组，用来保存示例文件的文件名。这些文件名主要有两个用处：

1. 在 tableview 中正确显示文件名和相关说明
2. 最重要的是，可以根据这个数组来创建 `NSURL` 对象的列表，该列表可以作为 Quick Look framework 需要的 datasource，这样它就能够检索和预览每一个文件了。

在熟悉每个文件名的用处之后，是时候让我们来码代码了。第一件事情就是创建一个保存文件名的数组(包含文件的扩展名)。打开 Xcode 中的 `FileListViewController.swift` 文件，添加以下代码到文件开头：

```swift
let fileNames = ["AppCoda-PDF.pdf", "AppCoda-Pages.pages", "AppCoda-Word.docx", "AppCoda-Keynote.key", "AppCoda-Text.txt", "AppCoda-Image.jpeg"]
```

在我们的例子中，我们已经知道了需要预览文件的文件名，因此声明和使用 `fileNames` 数组都很容易。但是，真实应用中不可能事先就让你保存有所有需要预览的文件的(文件可能需要下载等)。在这种情况下，你必须动态地添加数据到这个数组中，再从数组中获取相应的文件名。

现在，让我们先声明：

```swift
var fileURLs = [NSURL]()
```

该数组不仅会作为 Quick Look framework 的 datasource，也会作为 tableview 的 datasource。

现在让我们创建一个新的方法，将值添加到以上的数组中去。在该新方法中，我们会逐个获取 `fileNames` 数组中的文件名，并相应地创建一个 NSURL 对象。一旦遍历完所有的文件，我们就将所有新建的 NSURL 对象添加到 `fileURLs` 数组中，这部分的工作就算完成了。

```swift
func prepareFileURLs() {
    for file in fileNames {
        let fileParts = file.componentsSeparatedByString(".")
        if let fileURL = NSBundle.mainBundle().URLForResource(fileParts[0], withExtension: fileParts[1]) {
            if NSFileManager.defaultManager().fileExistsAtPath(fileURL.path!) {
                fileURLs.append(fileURL)
            }
        }
    }
}
```

值得注意的是，我们使用了 `String` 类中的 `componentsSeparatedByString(...)` 方法来分割文件名，获取对应的文件名和扩展名。接下来的过程很简单了：使用 `NSBundle` 类的  `URLForResource(...)`方法创建一个 `NSURL` 对象，如果新创建的 NSURL 对象存在对应文件的话，就添加到 `fileURLs` 数组中。

现在再到 `viewDidLoad()` 方法中调用以上的方法：

```swift
override func viewDidLoad() {
    ...
 
    prepareFileURLs()
}
```

## 展示文件

我们已经将 datasource 准备好了，接着会展示需要预览的文件，以及关于它们类型的说明。值得注意的是，这一部分的内容与我们要使用的 Quick Look framework 并没有什么关系，之所以放在文章里是为了让你对自己的工程有点想法。

我们需要实现的效果如下：

<center>
![](http://www.appcoda.com/wp-content/uploads/2016/04/t51_1_file_list.png)
</center>

我们将从每个 `NSURL` 对象入手，最终获取到对应文件的文件名和扩展名。为了实现这个功能，我们需要将 `NSURL` 分割。分割的最后一个部分应该是完整的文件名，继续分割就可以得到文件名和扩展名了。

我上面讲的过程都会在一个新方法中实现。即便下一段代码中并没有什么难度，我还是为每行代码添加了注释。值得注意的是，该方法返回的不是简单的一个值，而是一个 `tuple`。tuple 中第一个值为文件名，第二个值为文件的扩展名。

```swift
func extractAndBreakFilenameInComponents(fileURL: NSURL) -> (fileName: String, fileExtension: String) {
    
    // 将 NSURL 路径分割成零组件，然后创建一个数组将其放置其中
    let fileURLParts = fileURL.path!.componentsSeparatedByString("/")

    // 从上面数组的最后一个元素中得到文件名
    let fileName = fileURLParts.last
 
    // 将文件名基于符号 . 分割成不同的零组件，并放置在数组中返回
    let filenameParts = fileName?.componentsSeparatedByString(".")
 
    // 返回最终的元组
    return (filenameParts![0], filenameParts![1])
}
```

上面这个方法是一个有用的工具，它主要有两个功能：

1. 我们会将 tuple 的第一个值显示在 tableview 中。
2. 我们会针对文件扩展名展示简短的说明。

让我们一个个来，先来看看 tableview 中的 `tableView(tableView:cellForRowAtIndexPath)` 方法。将它改成下面的代码(在 cell 重用和返回之间添加相应的代码)，这样你就可以在 cell 中显示文件名了。

```swift
func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
    let cell = tableView.dequeueReusableCellWithIdentifier("idCellFile", forIndexPath: indexPath)
 
    let currentFileParts = extractAndBreakFilenameInComponents(fileURLs[indexPath.row])
 
    cell.textLabel?.text = currentFileParts.fileName
 
    return cell
}
```

现在让我们来创建另一个自定义的方法。该方法会根据文件返回描述文件类型的字符串。你看，下面的代码一点难度都没有，只有一个 `switch` 语句决定具体的文件类型。值得注意的是，我只添加了 demo 中需要用到的文件类型，你可以根据你自己的需求来修改并添加删除相应的文件类型。

```swift
func getFileTypeFromFileExtension(fileExtension: String) -> String {
    var fileType = ""
 
    switch fileExtension {
    case "docx":
        fileType = "Microsoft Word document"
 
    case "pages":
        fileType = "Pages document"
 
    case "jpeg":
        fileType = "Image document"
 
    case "key":
        fileType = "Keynote document"
 
    case "pdf":
        fileType = "PDF document"
 
 
    default:
        fileType = "Text document"
 
    }
 
    return fileType
}
```

回到 `tableView(tableView:cellForRowAtIndexPath)` 方法，让我们来添加一行代码来调用上面的方法吧，这样我们就可以在每个 cell 里展示文件类型的描述了。

```swift
func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
    let cell = tableView.dequeueReusableCellWithIdentifier("idCellFile", forIndexPath: indexPath)
 
    ...
 
    cell.detailTextLabel?.text = getFileTypeFromFileExtension(currentFileParts.fileExtension)
 
    return cell
}
```

还有一件事要做，就是为 tableview 设置正确的行数。如果你仔细看的话，可能注意到了初始工程中对应代码中是返回 0 行的，所以需要修改成我们需要的行数。具体方法如下：

```swift
func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return fileURLs.count
}
```

如果你已经跟进到这里了，那就尝试着运行一下这个应用吧。没什么大问题的话，你的应用也会和文章开头的截图一样。

## Quick Look Preview Controller Datasource

使用 Quick Look framework 的第一件事情就是在类中导入头文件。因此，我们需要在 `FileListViewController.swift` 文件中，最上面的位置添加如下代码：

```swift
import QuickLook
```

现在我们要声明并初始化一个使用 Quick Look framework 重要的对象。在 `FileListViewController` 类的最上面添加如下代码：

```swift
let quickLookController = QLPreviewController()
```

正如你所见，我更倾向于声明一个全局的 `QLPreviewController` 对象，当然这不是强制的，你也可以不这么做。另一种方法就是使用局部对象来触发并显示 Quick Look Preview Controller。

在我们使用 `quickLookController` 对象之前，我们需要接受 `QLPreviewControllerDataSource` 协议。这是必须要做的，因为之前提到的一大串方法都需要有 datasource 才行。然而，我们要先在类名之后追加这个协议：

```swift
class FileListViewController: UIViewController, UITableViewDelegate, UITableViewDataSource, QLPreviewControllerDataSource
```
 
现在让我们将注意力集中在必须要实现的两个方法上吧。正如我之前提到的，这两个方法会将对应文档的预览在特定情况下展现出来。显然，我们很早前创建的 `fileURLs` 数组就要派上用场了。

第一个方法指定了有多少个文件需要在 Quick Look Preview Controller 中预览。在我们的 demo 中这个数字就等于 `fileURLs` 中文件的总数，因此，我们需要做的就是返回数组的元素总数：

```swift
func numberOfPreviewItemsInPreviewController(controller: QLPreviewController) -> Int {
    return fileURLs.count
}
```

第二个方法指定了存在于 `fileURLs` 数组里的哪个文件会被预览：

```swift
func previewController(controller: QLPreviewController, previewItemAtIndex index: Int) -> QLPreviewItem {
    return fileURLs[index]
}
```

根据官方文档，上面这个方法返回的 `QLPreviewItem` 类型(实际上是协议)将这个方法定义为了 NSURL 类的 category 了，因此，我们才可以返回数组中的 NSURL 对象(简单起见，将 NSURL 和 QLPreviewItem 视为是相同的)。你可能觉得 `QLPreviewItem` 协议中支持的方法很有用，那你也可以在[这里](https://developer.apple.com/library/ios/documentation/Quartz/Reference/QLPreviewItem_Protocol/index.html)看看如何自定义 `QLPreviewItem` 对象。

以上两个方法在你每次使用 `QLPreviewControllerDataSource` 时候都是必须的。请一定要确保 Quick Look Preview Controller 需要预览的文件总数与作为 datasource 的数组元素总数相同，否则你回遇到访问数组越界的问题的。

我们还有最后一步不能忘记：那就是必须将该类设置为 `quickLookController` 对象的 datasource。在 `viewDidLoad()` 方法中，添加如下代码：

```swift
override func viewDidLoad() {
    ...
 
    quickLookController.dataSource = self
}
```

## 预览文档

我们已经设置好了 Quick Look Preview Controller 的 datasource 并实现了两个相关的方法，是时候让我们的 demo 应用响应点击并预览选中的文档了。因此，我们需要实现如下的 tableview 的方法：

```swift
func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
 
}
```

你需要一直记着一个基本且简单的规则，就是确保你想预览的文档能被 Quick Look framework 打开。`QLPreviewController` 类提供了一个叫 `canPreviewItem(:)` 的类方法来解决这个问题。该方法返回一个 `Bool` 值，且当返回 `true` 时，该文档的类型是可以被预览的，否则文档是不能打开的。毫无疑问，你应该在该方法返回 `true` 时，才继续执行接下来的预览操作。

如果你按照我之前说的将数组下标做了对应的话，`quickLookController` 对象有一个叫 `currentPreviewItemIndex` 的属性可以实现这个用途。虽然在逻辑上很难在这里出错，但是为了确保下标不越界(例子中的是 `fileURLs` 数组)也值得了，否则你可能会看到你的应用奔溃。我可以说这是最重要的部分，告诉 Quick Look Preview Controller 应该打开哪个文档。

最后，肯定要将 Quick Look Preview Controller 显示出来的。有两个方案可以实现：一种是以模态的形式，另一种是以 navigation 压栈的形式(前提是要有 navigation controller)。两种方式都会在下面展示。

原理已经在上面讲清楚了，接下来让我们来码代码吧。下面有三行代码：

```swift
func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
    if QLPreviewController.canPreviewItem(fileURLs[indexPath.row]) {
        quickLookController.currentPreviewItemIndex = indexPath.row
        navigationController?.pushViewController(quickLookController, animated: true)
    }    
}
```

正如你看到，我们首先要确保点击的文档是可以被打开的(在这个 demo 应用中我们事先是知道所有的文档都能被打开，但是这个判断的操作还是必要的，尤其从服务器获取一个文件而不确定它的类型时)。接着，我们指定了需要打开的文档在数组中对应的下标，最后我们将 `quickLookController` 压入 navigation 的栈里。换种方式，我们也可以通过下面的代码来以模态的形式显示：

```swift
presentViewController(quickLookController, animated: true, completion: nil)
```

如果你现在运行 demo 的话，你点击某行就会看到对应文档的预览效果了。

<center>
![](http://www.appcoda.com/wp-content/uploads/2016/04/t51_2_document_preview.png)
</center>

## Quick Look Preview Controller 提供的其他特性

可能你已经注意到了，Quick Look Preview Controller 底部有个 *toolbar*，其中有两个按钮。左边的按钮允许你通过 `UIActivityViewController` 发送并分享当前预览的文档。

<center>
![](http://www.appcoda.com/wp-content/uploads/2016/04/t51_3_activity_view.png)
</center>


活动控制器中可用的共享选项的数量和种类是不定的，它取决于设备上运行的应用程序（一般模拟器上提供的选项比真机要少）和登录的社交网络，但是不管是什么，你都可以使用左侧导航按钮无延迟地立即发送或共享要被预览的文档。

右侧第二个 bar button item 呈现了一个模态 view controller，用来展示 datasource 中所有可用的 documents 列表。

<center>
![](http://www.appcoda.com/wp-content/uploads/2016/04/t51_4_switch_document.png)
</center>


该按钮可看做是一个快捷键，这样切换不同的文档时就可以不用退出预览界面了。此功能可以方便用户直接的查看所有文档的预览，而没必要退回到原来的视图控制器。

## Quick Look Preview Controller Delegate

除了强制地接受了 `QLPreviewControllerDataSource` 协议并实现了其中的两个必须实现的方法，你也可以遵守 `QLPreviewControllerDelegate` 协议并实现该协议来更好地控制 Quick Look Preview Controller。值得注意的是，这里协议里的方法都是可选实现的，也就是说不实现，应用也能正常运行。然而，我们可以在本教程中做一些扩展。

第一步当然是接受 `QLPreviewControllerDelegate` 协议，所以你需要修改 `FileListViewController.swift` 文件中的相应部分如下：

```swift
class FileListViewController: UIViewController, UITableViewDelegate, UITableViewDataSource, QLPreviewControllerDataSource, QLPreviewControllerDelegate
```

具体需要的方法可以根据你的需求来添加。该代理中提供的方法可以在[官方文档](https://developer.apple.com/library/ios/documentation/NetworkingInternet/Reference/QLPreviewControllerDelegate_Protocol/index.html)里查到。我们会介绍其中的一部分。

在我们接受这个协议后，很重要的一步就是将类和代理链接起来，因此我们在 `viewDidLoad()` 方法中添加如下代码：

```swift
override func viewDidLoad() {
    ...
 
    quickLookController.delegate = self
}
```

我们会用两个其中的方法来展示，这两个方法是在 preview controller 将要退出时被 Quick Look framework 调用的。实际上，一个是在退出前调用的，另一个在退出后调用的。我们会在 demo 中实现这两个方法，并在控制台中简单地打印一些语句表示应用执行到了这里。先从第一个开始吧：

```swift
func previewControllerWillDismiss(controller: QLPreviewController) {
    print("The Preview Controller will be dismissed.")
}
```

第二个代理方法中会将之前选中的单元行进行取消选中，另外还会在控制台打印一条消息。该方法会在 preview controller 退出后触发。

```swift
func previewControllerDidDismiss(controller: QLPreviewController) {
    tblFileList.deselectRowAtIndexPath(tblFileList.indexPathForSelectedRow!, animated: true)
    print("The Preview Controller has been dismissed.")
}
```

现在运行这个应用，你可以验证刚才写的那些功能是否有实现。

对于 Quick Look Preview Controller 来说，提供文件的链接也使很正常的。当这种情况发生的时候，你可能需要链接能有效地打开，也可能并不想打开对应链接的文件。接下来的代理方法就用在这里，在这个方法里可以很好地避免某些 URL 打开。

```swift
func previewController(controller: QLPreviewController, shouldOpenURL url: NSURL, forPreviewItem item: QLPreviewItem) -> Bool {
    if item as! NSURL == fileURLs[0] {
        return true
    }
    else {
        print("Will not open URL \(url.absoluteString)")
    }
 
    return false
}
```

以上这个方法中，我们除了第一种 URL 外，其他都不允许打开(`return false`)。如果链接指向的 URL 是 PDF 文档(第一种 URL)的话，就允许打开并返回 true。再次运行应用，首先点击 PDF 文档，再点击 Word  文档。观察一下有什么区别。你会发现 Word 文档的链接是不能打开的，而 PDF 文档是可以在 Safari 中打开的。

## 总结

终于到文章的最后，我想我们应该都能赞同 Quick Look framework 是 iOS SDK 中最简单的框架之一了。通过它可以很简单地实现文档预览的功能，如果有其他特殊的需求还可以利用可选的代理方法来实现。依我看来，Quick Look framework 和 Quick Look Preview Controller 针对需要处理文档的应用来说是一个很好的工具。如果你打算将 Quick Look framework 运用到你的应用中的话，那本文希望可以让你下定决心使用它。如果你没这个打算的话，那本文也会让你考虑一下。

你可以在 Github 上下载[完整的工程](https://github.com/appcoda/QuickLookDemo)作为参考。