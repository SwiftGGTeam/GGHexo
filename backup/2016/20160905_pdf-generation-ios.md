title: "在 iOS 中使用 HTML 模版和 UIPrintPageRenderer 生成 PDF"
date: 2016-09-05
tags: [iOS 开发]
categories: [AppCoda]
permalink: pdf-generation-ios
keywords: ios生成pdf文件,ios html,UIPrintPageRenderer
custom_title: iOS 开发 App 内生成 PDF 文件
description: iOS 如何生成 PDF 文件你知道要怎么做吗，不会的来看下本文教你在 iOS 中使用 HTML 模版和 UIPrintPageRenderer 生成 PDF 的步骤。

---
原文链接=http://www.appcoda.com/pdf-generation-ios/
作者=GABRIEL THEODOROPOULOS
原文日期=2016-7-10
译者=X140Yu
校对=saitjr
定稿=CMB

<!--此处开始正文-->

你是否曾经遇到过「使用 app 中的内容生成 PDF 文件」这样的需求？如果你之前没有做过，那你有想过该如何实现吗？

好吧，通过抛出问题来开篇有点不太好，但上述内容总结了我将要在这篇文章中讨论的事情。要在 iOS 应用内创建一个 PDF 文档，看起来像不是一个容易的需求，但事实并不是这样。作为开发人员，你必须要随机应变，为自己创造可供选择的方案，尽量达到目标。这是件很有挑战性的事情。确实，手动绘制 PDF 是一个非常痛苦的过程（取决于内容），最终可能会变得非常低效。计算坐标、加线、设置颜色、缩进、偏移等。这可能很有趣（或并不是），但如果你要绘制的内容非常复杂，那到最后可能会变得一团糟。

<!--more-->

本文会介绍另一种创建 PDF 文件的方式，这种方式比手动绘制要简单得多。它的思想是使用 HTML 模版，大致有以下几个步骤：

1. 为要生成 PDF 的表单创建 HTML 模版。
2. 使用这些 HTML 模版来渲染真正的内容（或者把它显示在 web view 中）。
3. 把 HTML 的内容转换为 PDF。

在最后一步，iOS 会替你做所有麻烦的事情。

说白了，我认为你也更加愿意处理 HTML，而不是直接绘制 PDF 文件吧。这种情况下，你需要的是将内容展现在 HTML 文件中，但手动去创建重复的内容，确实不太明智，也不太高效。举个例子，有一个 app 能把学生的信息打印或输出为 PDF。为每个学生创建一个 HTML 页面显然不可取，因为为了打印这些信息，一直在做重复的事情。你真正需要的是创建一个 HTML 模版。使用一种特殊的方式在关键位置用占位符占位，而不是直接使用实际的值，接着在 app 中，把这些占位符换成实际值。当然，最后一步的值替换是可以是重复且自动化的。

当 HTML 代码中包含实际值之后，就可以为所欲为了。你可以在 web view 中显示，保存为文件，分享，当然也可以输出为 PDF。

那么我们到底应该怎么做呢？

将内容输出为 PDF 是本文的最终目标，但我们是从如何用实际值替换占位符这一步开始的。Demo 的 app 是一个生成发票的小应用，非常符合本文的需求。再次说明我们不会从头来做这个应用，这不是最终目的。应用的默认功能已经实现好了，也提供了 HTML 模版，我们也会一步一步说明，所以你也有机会明白这到底是怎么一回事，占位符到底有什么意义。不管怎么样，我们会一起，一步一步地走通生成真正 HTML 内容的流程，然后将它输出为 PDF 文档。这还没完，我还会告诉你们如何给最终的 PDF 加上 header 和 footer。

如果你对以上的内容感兴趣，那就一起开始做吧！

## 上手项目

我们先快速浏览一下这个教程的 demo app，其实就是一个制作发票的工具。在开始之前，你应该先下载这个[上手项目](https://github.com/appcoda/Print2PDF/blob/master/Starter_Project.zip?raw=true)，然后在 Xcode 中打开。

在上手项目中，你会发现已经有好多工作已经做完了。`InvoiceListViewController` 这个 view controller 是用来显示创建和保存的发票信息列表。在这个 VC 里，你也可以通过点击右上角的加号来新建发票信息。点击列表中的任何一列都可以去到对应的预览界面，在那个界面可以看到发票的详细信息。注意，还有一部分的功能在上手项目中没有实现，我们会在这篇教程中实现它。新建的发票信息可以通过向左滑动对应 cell 来删除。下面的截图就是这个 VC 的界面。

![](http://www.appcoda.com/wp-content/uploads/2016/07/t54_1_invoice_list_viewcontroller.png)

就像我说过的一样，可以通过右上角的加号按钮来新建发票。这个动作会带我们去到一个新的 VC —— `CreatorViewController `，它长这个样子：

![](http://www.appcoda.com/wp-content/uploads/2016/07/t54_2_creator_viewcontroller.png)

在发票可以被打印出来之前，需要填一些必要的信息。其中的一部分可以在上个 VC 中设置，还有一些可以被自动计算出来，另一些会硬编码在代码中。为了详细一些，应用中可以被手动添加的值有：

- 接收者的信息，其实就是接收人的地址。上图中的灰色区域。
- 需要打发票的条目，每个条目都由两部分组成：提供服务的描述，这项服务的价格。为了简单起见，这里没有增值税。可以通过底部 toolbar 的加号来添加新的条目。

自动生成的值有：

- 发票的号码（显示在 navigation bar 中的号码）
- 这张发票的总价格（显示在底部 toolbar 的左边）

之后我们要硬编码的值有：

- 发送者的信息，也就是发行人的信息。
- 发票的截止日期（如果你想用也可以用，但在这里用不到，所以设为空）。
- 付款的方式。
- 发票的图标。

项目中已有一个 `AddItemViewController` 作为创建发票条目的入口。这个界面很简单，只有两个 textfield，还有一个保存按钮，点击完成后会跳到之前的 VC 中。

![](http://www.appcoda.com/wp-content/uploads/2016/07/t54_3_add_item_viewcontroller.png)

所有的发票条目都在一个有字典元素的数组中，每个字典有两个值分别为描述和价格。这个数组作为 `CreatorViewController` 中 tableview 的数据源。当一个条目被创建出来的时候，手动和自动添加的数据都会被加入到字典中，返回给 `InvoiceListViewController `。下面是它返回的数据：

- 发票号码（string）。
- 接收人的信息（string）。
- 全部金额（string）。
- 发票的条目（装字典的数组）。

在保存发票的发票号码的时候，下一个号码已经计算出来并且存储在 `NSUserDefaults` 中了。装着发票数据的字典被加在 `InvoiceListViewController` 的数组中，而数组的每一次有新值的时候，存储到 user defaults 中。当 VC 将要出现时，发票数据从 user defaults 被加载。记住，demo 是因为演示方便，才把应用主要数据保存到 user defaults 的，对于真正的应用程序，不建议这么做。肯定还有更好的方法来存储你的数据。

对于现有的代码，我没有什么好说的。你所要做的就是到每个 VC 中或按照应用程序的流程看代码的细节实现。还有一点我想提一下，那就是 `AppDelegate.swift` 文件。在这个文件中有三个便捷的方法：一个用于获取 appdelegate，一个用于获取沙盒的 documents 路径，一个用于将表示为字符串的金额转换成货币字符串（连同适当的货币符号）。除了上手项目，这些方法我们之后也还会用到。在 `AppDelegate` 中，还有个 `currencyCode` 属性被默认设置为了「eur」（欧元）。可以通过改变它来设置你自己的货币单位。

最后，让我告诉你，上手项目在哪结束，还有我们将从哪里开始。点击 `InvoiceListViewController` tableview 的发票数据，一个包含匹配发票数据的字典会被传递到 `PreviewViewController` 中。在这其中，有一个已渲染完成，可供预览的 HTML 文件，和一个导出到 PDF 的按钮。这些功能都不在上手项目中，我们将要实现它们，我们需要的所有数据都已经存在于 `PreviewViewController` 中，所以可以直接使用它。


## HTML 模版文件

正如我在引言中阐述的，我们将使用 HTML 模板来产生相应发票内容的 HTML，然后将真正的 HTML 内容渲染成一个 PDF 文件。这里的基本逻辑是把占位符放在 HTML 文件中占位，然后用真实的数据替换这些占位符。这样的话，我们就必须找到或创建自定义 HTML 表单。对于这篇教程来说，我们不会创建任何自定义的 HTML 模板。相反，我们将使用一个在[这里](https://github.com/NextStepWebs/simple-html-invoice-template)找到的模版（特别感谢作者）。该模板已被修改了一点，所以它没有阴影的边框，而且在 logo 处添加的灰色的背景颜色。

在你下载的上手项目里，有三个 HTML 文件：

1. invoice.html
2. last_item.html
3. single_item.html

第一个包含了将产生整个发票样式的代码，除了项目的单元行。我们有专门的两个模板来应对行：single_item.html 将用来显示一个项目除了最后一行的任意一行，last_item.html 将被用来显示最后一行。这是因为最后一行的底部边框线是不同的。

所有的占位符将会被 # 号给包起来。举个例子，下面的这个就显示了发票号码，发行日期和截止日期的占位符：

```html
<td> Invoice #: #INVOICE_NUMBER<br>
#INVOICE_DATE#<br>
#DUE_DATE# </td>
```

> 备注：即使截止日期是以占位符的形式存在的，但是我们不会真正使用它，只会用空的字符来替换它。但如果你需要使用的话，可以任意使用。

你可以在三个 HTML 文件中找到所有的占位符，和它们适合的位置：

- \#LOGO_IMAGE\#
- \#INVOICE_NUMBER\#
- \#INVOICE_DATE\#
- \#DUE_DATE\#
- \#SENDER_INFO\#
- \#RECIPIENT_INFO\#
- \#PAYMENT_METHOD\#
- \#ITEMS\#
- \#TOTAL_AMOUNT\#
- \#ITEM_DESC\#
- \#PRICE\#

最后两个占位符只存在于 single_item.html 和 last_item.html 文件中。同时，\#ITEMS\# 占位符会被替换为用那两个 HTML 模版文件创建完成的发票条目（细节会在后文描述）。

正如你所看到的，准备一个或多个 HTML 模板来创建一个表单自定义输出（在发票这个案例中）不是什么难事。而经历了这整个过程后，你会意识到，基于这些模板内容，来生成并输出到 PDF 文件并不难。

## 搭建内容

已经了解了 demo app 和发票模版，我们现在应该开始实现应用没有实现的关键部分。首先，根据  `InvoiceListViewController` 选中的发票信息，使用模板，创建含有实际发票内容的 HTML。然后，在 `PreviewViewController` 中使用 web view 显示生成的 HTML 代码，我们可以通过这种方式验证正确性。

这部分最重要的一项任务是把 HTML 模板文件的占位符替换为真正的内容。那些值实际上是从 `InvoiceListViewController` 传到 `PreviewViewController` 中的。正如你将看到的，更换占位符是一项简单的工作。在我们开始之前，让我们创建一个新的类用于生成真正的 HTML 内容，然后它就可以生成 PDF。在 Xcode 中，选择 **File > New > File…** 菜单，创建一个新的 Cocoa Touch 类。让它继承自 `NSObject`。并将其命名为 **InvoiceComposer**。一路跟随向导完成新文件的创建。

![](http://www.appcoda.com/wp-content/uploads/2016/07/t54_4_create_invoice_composer.png)

打开 `Invoicecomposer.swift` 文件。我们先声明一些属性（常量和变量）：

```swift
class InvoiceComposer: NSObject {

    let pathToInvoiceHTMLTemplate = NSBundle.mainBundle().pathForResource("invoice", ofType: "html")

    let pathToSingleItemHTMLTemplate = NSBundle.mainBundle().pathForResource("single_item", ofType: "html")

    let pathToLastItemHTMLTemplate = NSBundle.mainBundle().pathForResource("last_item", ofType: "html")

    let senderInfo = "Gabriel Theodoropoulos<br>123 Somewhere Str.<br>10000 - MyCity<br>MyCountry"

    let dueDate = ""

    let paymentMethod = "Wire Transfer"

    let logoImageURL = "http://www.appcoda.com/wp-content/uploads/2015/12/blog-logo-dark-400.png"

    var invoiceNumber: String!

    var pdfFilename: String!
}
```

前三个属性（`pathToInvoiceHTMLTemplate`, `pathToSingleItemHTMLTemplate`, `pathToLastItemHTMLTemplate`），我们指定了三个 HTML 模版的文件路径，方便之后的使用。因为我们会打开它们，获取模版并修改代码。

之前提到过，我们的 demo 不提供选项来设置所有的参数（`senderInfo`, `dueDate`, `paymentMethod`,`logoImageURL`），所以这些在这里直接被硬编码了。在真正的应用程序中，这些值，都应该能让用户自定义。最后一个是作为发票的标志的图像的地址。你可以改变上面的属性，设置成自己喜欢的值（例如，把 `senderInfo` 改成你自己的信息）。

最后，`invoiceNumber` 属性存储的是随时都能展示的发票号码，`pdfFilename` 将包含展示 PDF 的路径。这是我们需要的东西，虽然现在还不必要，但是我们最好先把它们声明出来。以后要用的时候就方便了。

除了以上这些属性，给这个类加上默认的 `init()` 方法。

```swift
class InvoiceComposer: NSObject{
    ...

    override init() {
        super.init()
    }
}
```

我们现在创建一个新的方法，处理在 HTML 模板文件替换占位符的重要工作。我们将它命名为 `renderInvoice`，方法如下：

```swift
func renderInvoice(invoiceNumber: String, invoiceDate: String, recipientInfo: String, items: [[String:String]], totalAmount: String) -> String! {

}
```

参数实际上是新建发票信息手动输入的值，它们都是生成 PDF 需要的（还有硬编码的值）。这个方法的返回值是包含最终的 HTML 内容的字符串。

让我们实现该方法，先执行第一个重要的任务。在下面的代码片段中，主要处理了两件事：首先 `invoice.html` 模板内容被加载到一个字符串变量中，方便我们修改。然后将除了发票条目外，所有的占位符都替换成真实的值。下面这些注释能够帮助你理解这个过程：

```swift
func renderInvoice(invoiceNumber: String, invoiceDate: String, recipientInfo: String, items: [[String:String]], totalAmount: String) -> String! {
 	// 为了将来的使用，把发票号码先存起来
    self.invoiceNumber = invoiceNumber

    do {
        // 把 发票模版的 HTML 文件内容载入到一个字符串变量中
        var HTMLContent = try String(contentsOfFile: pathToInvoiceHTMLTemplate!)

        // 除了发票条目的所有占位符都替换成真实的值

        // 图标。
        HTMLContent = HTMLContent.stringByReplacingOccurrencesOfString("#LOGO_IMAGE#", withString:logoImageURL)

        // 发票号码。
        HTMLContent = HTMLContent.stringByReplacingOccurrencesOfString("#INVOICE_NUMBER#", withString:invoiceNumber)

        // 开票时间。
        HTMLContent = HTMLContent.stringByReplacingOccurrencesOfString("#INVOICE_DATE#", withString:invoiceDate)

        // 截止日期（默认为空）。
        HTMLContent = HTMLContent.stringByReplacingOccurrencesOfString("#DUE_DATE#", withString:dueDate)

        // 发行人信息。
        HTMLContent = HTMLContent.stringByReplacingOccurrencesOfString("#SENDER_INFO#", withString:senderInfo)

        // 接收人信息。
        HTMLContent = HTMLContent.stringByReplacingOccurrencesOfString("#RECIPIENT_INFO#", withString:recipientInfo.stringByReplacingOccurrencesOfString("\n", withString:""))

        // 支付方法。
        HTMLContent = HTMLContent.stringByReplacingOccurrencesOfString("#PAYMENT_METHOD#", withString:paymentMethod)

        // 总计金额。
        HTMLContent = HTMLContent.stringByReplacingOccurrencesOfString("#TOTAL_AMOUNT#", withString:totalAmount)

    }
    catch {
        print("Unable to open and use HTML template files.")
    }

    return nil
}
```

上面替换占位符的实现看起来很简单，实际上...就这么简单。利用 `stringbyreplacingoccurrencesofstring（...）` 方法，把第一个参数（占位符）替换为第二个参数（真实的值）。完全没难度...好无聊。

再进一步，注意到所有的代码都包含在 `do-catch` 语句中了吗？因为把一个文件的内容加载为 `HTMLContent` 字符串可能会抛出异常。同时，如果有异常抛出，它就会返回 *nil*，而现在没有真正的返回值与实际的 HTML 内容，这是下面要讲到的内容。

让我们现在把重点放在设置发票条目上。由于他们的号码可能会有所不同，所以使用循环来处理。除了最后一个，其余条目，我们都将打开 `single_item.html` 模板，替换占位符。因为最后一条的底部线是不同的，所以使用` last_item.html` 模板操作。产生的 HTML 代码将被加到另一个字符串中（`allItems` 变量），该字符串包含所有的条目信息，它将在 `HTMLContent` 字符串中，替换 \#ITEMS\# 占位符。函数的返回值是该字符串。

在 `do` 中加入以下代码段:

```swift
func renderInvoice(invoiceNumber: String, invoiceDate: String,recipientInfo: String, items: [[String:String]], totalAmount: String) -> String! {

 ...

    do{

        ...

        // 通过循环来添加发票条目。
        var allItems = ""
        // 除了最后一个，都使用 "single_item.html" 模版。
        // 对于最后一个，使用 "last_item.html" 模版。
        for i in 0..<items.count {
            var itemHTMLContent:String!

            // 判断该使用哪个模版文件
            if i != items.count - 1 {
                itemHTMLContent = try String(contentsOfFile: pathToSingleItemHTMLTemplate!)
            }
            else{
                itemHTMLContent = try String(contentsOfFile: pathToLastItemHTMLTemplate!)
            }

            // 把描述和价格替换为真正的值。
            itemHTMLContent = itemHTMLContent.stringByReplacingOccurrencesOfString("#ITEM_DESC#", withString: items[i]["item"]!)

            // 把每个价格格式化为货币值。
            let formattedPrice = AppDelegate.getAppDelegate().getStringValueFormattedAsCurrency(items[i]["price"]!)
            itemHTMLContent = itemHTMLContent.stringByReplacingOccurrencesOfString("#PRICE#", withString: formattedPrice)

            // 把当前条目的内容加到整体的条目字符串中
            allItems += itemHTMLContent
        }

        // 替换条目。
        HTMLContent = HTMLContent.stringByReplacingOccurrencesOfString("#ITEMS#", withString:allItems)

        // HTML 代码已经 ready。
        return HTMLContent
    }

    catch {
        print("Unable to open and use HTML template files.")
    }
    return nil
}
```

> 备注：你可以在 AppDelegate.swift 文件中找到 `getAppDelegate()` 和 `getStringValueFormattedAsCurrency()` 方法的实现。

目前就是这些内容。模板代码已被修改成我们真正需要的发票的内容。下一步，我们将利用上述方法的返回结果。

## 预览 HTML 内容

在创建了真正的 HTML 内容后，是时候验证结果了。我们在这一部分的目标是加载刚刚构建的 HTML 字符串，把它加载到 *PreviewViewController* 中已有的 web view 中，然后就可以看到我们之前努力的结果了。请注意，这是一个可选的步骤，在实际应用中不必在输出 PDF 之前使用 web view 。我们在这里做的，为了 demo 的完整性。

切换到 _PreviewViewController.swift_ 文件，去到类的顶部，先声明几个属性：

```swift
class PreviewViewController: UIViewController {

    ...

    var invoiceComposer: InvoiceComposer!

    var HTMLContent: String!
}
```

第一个是我们在之前新建的生成 HTML 内容类的对象。`HTMLContent` 字符串是用来存放将来要用到的真正的 HTML 内容。

接下来，新建一个方法，做下面几件事情：

1. 初始化 `invoiceComposer` 对象。
2. 调用 `renderInvoice(...)` 方法，产生发票内容的 HTML 代码。
3. 把 HTML 加载到 web view 中。
4. 把返回的 HTML 字符串存入 `HTMLContent` 属性中。

下面来看看这个方法：

```swift
func createInvoiceAsHTML() {
	invoiceComposer = InvoiceComposer()
	if let invoiceHTML = invoiceComposer.renderInvoice(invoiceInfo["invoiceNumber"] as! String, invoiceDate: invoiceInfo["invoiceDate"] as! String, recipientInfo: invoiceInfo["recipientInfo"] as! String, items: invoiceInfo["items"] as! [[String:String]], totalAmount: invoiceInfo["totalAmount"] as! String) {
			webPreview.loadHTMLString(invoiceHTML,baseURL:NSURL(string:invoiceComposer.pathToInvoiceHTMLTemplate!)!)
		HTMLContent = invoiceHTML
	} 
}
```

上面的代码没什么特别的，关注一下传入 `renderInvoice(...)` 方法的参数就可以了。一旦我们从那个方法中获得了真正的 HTML 字符串（而不是 nil），就把它加载进 web view 中。

是时候调用我们的新方法了：

```swift
override func viewWillAppear(animated:Bool) {
	super.viewWillAppear(animated)
	createInvoiceAsHTML()
}
```

如果你想看到的结果，运行应用程序，并创建一个新的发票信息（如果你还没这样做过）。然后从列表中选中它，就能看到类似下图的效果：

![](http://www.appcoda.com/wp-content/uploads/2016/07/t54_5_invoice_webview.png)

## 准备输出

任务已经完成一半了，我们现在可以进行把发票信息输出为 PDF 的工作了。接下来会使用一个特殊的类，`UIPrintPageRenderer`。如果你之前从来没有听说，也没有使用过，那我可以先简单地告诉你，这个类是是把内容输出来打印用的（输出为文件或者使用 AirPrint 的打印机）。[这里](https://developer.apple.com/library/ios/documentation/iPhone/Reference/UIPrintPageRenderer_Class/)是官方的文档，可以看到更多信息。

`UIPrintPageRenderer` 类提供了多种绘制方法，但是对于我们这种简单的情况，其实不需要重写这些方法。这些绘制方法只能被 `UIPrintPageRenderer` 的子类重写，虽然略为麻烦，但是多做一些工作就可以把输出内容控制地更好，比如在本例中的 header 和 footer，那我们为什么不去做呢？

再次回到 Xcode，按照下面的步骤创建一个新的类：

1. 让它继承自 `UIPrintPageRenderer`。
2. 把它命名为 `CustomPrintPageRenderer`。

一旦你完成了上面的工作（当看到 `CustomPrintPageRenderer.swift` 出现在工程目录中时），还需要为后面的工作做一些准备。先让我们指定一下 _A4 纸_ 的宽和高（以像素为单位）。记住，我们要把发票输出成 PDF，PDF 文件也是能够打印的，所以限制一下纸的尺寸还是有必要的。


```swift
class CustomPrintPageRenderer: UIPrintPageRenderer {

    let A4PageWidth: CGFloat = 595.2

    let A4PageHeight: CGFloat = 841.8
}
```

上面的值描述了在全世界通用的 A4 纸的准确宽高。

在 `CustomPrintPageRenderer` 类生成的对象中，指定纸的尺寸是很有必要的。我们将在 `init()` 方法中使用上面声明的两个属性。

```swift
override init() {

    super.init()

	// 指定 A4 纸的尺寸
    let pageFrame = CGRect(x: 0.0, y: 0.0, width: A4PageWidth, height: A4PageHeight)

	// 设定页面的尺寸
    self.setValue(NSValue(CGRect:pageFrame), forKey:"paperRect")

	// 设定水平和垂直的缩进（这一步是可选的）
    self.setValue(NSValue(CGRect:pageFrame), forKey:"printableRect")
}
```

以上代码包含了一种直接而标准的，设置纸张尺寸与打印区域的技巧。`paperRect` 和 `printableRect` 属性都是只读的，这也就是为什么我们需要在这里给它们赋值。

在上面的代码中可以发现，我们把纸张的大小和打印的区域设置为一样大的。但是到后面你会发现，周围留出一些边距，打印出来的效果会更好。为了达到这种效果，可以把上面代码的最后一行，换成下面的代码：

```swift
self.setValue(NSValue(CGRect:CGRectInset(pageFrame,10.0,10.0)),forKey:"printableRect")
```

上面的代码给水平和垂直都加了 10 边距。即使你没有子类化 `UIPrintPageRenderer`，对于这部分的设置也已经生效了。换句话来说，你永远不会忘记设置你要打印内容的纸张尺寸和打印区域的大小。

## 输出为 PDF

说是「输出为 PDF」，其实是把内容绘制到一个 PDF 图形的上下文。一旦绘制完成，完成好的内容可以发送到打印机打印，也可以被保存成一个文件。我们对第二种情况比较感兴趣，所以我们会把绘制好的 PDF 上下文转换成 `NSData` 对象，然后把这个对象保存到文件中（最终的 .pdf 文件）。让我们来一步一步进行。

先打开 `InvoiceComposer.swift` 文件，在这里我们要实现一个新的方法 `exportHTMLContentToPDF(...)`。它只接受一个参数，我们想要输出到 PDF 的 HTML 内容。在看这个方法的实现之前，我们先来看看另一个跟打印相关的概念，也就是 **print formatter (`UIPrintFormatter` class)**。下面是 Apple 文档对它的介绍：

> UIPrintFormatter is an abstract base class for print formatters: objects that lay out custom printable content that can cross page boundaries. Given a print formatter, the printing system can automate the printing of the type of content associated with the print formatter.

这意味着我们只需把 HTML 内容作为打印的 formatter 添加到打印的 renderer，iOS 打印系统将接管页面布局和实际的打印页面。我建议你看一看[这里](https://developer.apple.com/reference/uikit/uiprintformatter?language=objc)，有详细的解释。简单来说，就是把 print formatter 想要打印的内容传递给 iOS 打印系统的一种中介。此外，虽然 `UIPrintFormatter` 是一个抽象类，但 iOS 的 SDK 提供了有实现的子类来给我们使用。其中之一是 `UIMarkupTextPrintFormatter`，我们可以用它把 HTML 内容转换成 page renderer 对象。还有一些其它的子类信息可以在上面的链接中找到。

光说还是有些不清楚，看看代码吧：

```swift
func exportHTMLContentToPDF(HTMLContent: String) {

    let printPageRenderer = CustomPrintPageRenderer()

    let printFormatter = UIMarkupTextPrintFormatter(markupText: HTMLContent)    

    printPageRenderer.addPrintFormatter(printFormatter, startingAtPageAtIndex: 0)

    let pdfData = drawPDFUsingPrintPageRenderer(printPageRenderer)

    pdfFilename="\(AppDelegate.getAppDelegate().getDocDir())/Invoice\(invoiceNumber).pdf"

    pdfData.writeToFile(pdfFilename, atomically:true)

    print(pdfFilename)
}
```

来一起看看上面的几行代码做了什么事情：

* 首先初始化了一个 `CustomPrintPageRenderer` 对象来执行绘制工作。
* 接着初始化了一个 `UIMarkupTextPrintFormatter` 对象，在初始化的时候，我们把 HTML content 作为参数传了进去。
* 第三行，把 printFormatter 加到了 printPageRenderer 对象中。`addPrintFormatter(...)` 方法的第二个参数是指定 printFormatter 起始生效的页面。我们在这里设置为 0，因为打印的内容只有一页。
* 真正的绘制即将发生。`drawPDFUsingPrintPageRenderer(...)` 是一个我们在后面才会创建的自定义方法。绘制完成的 PDF 会被存放在 `pdfData` 对象中，它实际上是一个 `NSData` 类型的对象。 
* 接下来就是把 PDF 数据存入文件。首先我们声明了文件路径，以发票的号码来指定文件名。然后把 PDF 数据写入这个文件中。
* 最后一步显然不是必要的，但是我们可以通过在 Finder 中找到这个新创建的文件，来验证我们绘制的结果。

在一个更复杂的应用中，你可以使用多个 print formatter 对象，当然也可以对不同的 print formatter 指定不同的起始页面。但是对于我们来说，创建一个对象能够说明问题就足够了。

现在我们来把上面没有实现的，也就是真正绘制的方法给实现了。在这里我们使用了 Core Graphics，下面的方法也很直白，一起来看看吧：

```swift
func drawPDFUsingPrintPageRenderer(printPageRenderer:UIPrintPageRenderer) -> NSData! {
    let data = NSMutableData()

    UIGraphicsBeginPDFContextToData(data, CGRectZero, nil)

    UIGraphicsBeginPDFPage()

    printPageRenderer.drawPageAtIndex(0, inRect: UIGraphicsGetPDFContextBounds())

    UIGraphicsEndPDFContext()

    return data
}
```

首先我们初始化了一个 `NSMutableData` 对象，是用来写入 PDF 数据的。然后我们创建了 PDF 图形上下文来开始 PDF 绘制。接下来才是绘制的代码：

```swift
printPageRenderer.drawPageAtIndex(0,inRect:UIGraphicsGetPDFContextBounds())
```

作为参数的 printPageRenderer 对象在这一行开始了绘制工作，它会把内容绘制在 PDF 上下文的区域中。注意，在这里自定义的 header 和 footer 也会被自动绘制，因为 `drawPageAtIndex(...)` 调用了 printPageRenderer 对象中所有的绘制方法。

最后我们关闭了 PDF 图形上下文，然后返回了 data 对象。

上面的方法只能打印一个单页面，如果你想要打印多个页面，或者你想要扩展这个 demo 应用，可以把上面的操作放到一个循环中。 

到此为止，所有关于 PDF 输出的部分就已经结束了，但是我们的工作还没有结束，在下一部分我们会绘制 header 和 footer。不过在那之前，我们先把上面的工作串联起来。

打开 `PreviewViewController.swift` 文件，定位到 `exportToPDF(...)` IBAction 方法。把下面几行加进去。点击按钮的时候就可以把发票导出为 PDF 文件了。

```swift
@IBAction func exportToPDF(sender: AnyObject){
    invoiceComposer.exportHTMLContentToPDF(HTMLContent)
}
```

你现在就可以测试应用了，但是为了快速看到结果，我建议你在模拟器中进行下面的操作。在预览发票界面，点击 _PDF_ 按钮：

![](http://www.appcoda.com/wp-content/uploads/2016/07/t54_6_pdf_button.png)

之后，输出 PDF 这个过程就已经发生了，当一切都结束的时候，你将会在控制台看到 PDF 文件的路径。把路径复制一下（不要带上文件名），打开一个 Finder 窗口，使用 **Shift-Command-G** 快捷键，粘贴上路径，在打开的文件夹中你就可以看到以发票号码为名字的新创建的 PDF 文件。

![](http://www.appcoda.com/wp-content/uploads/2016/07/t54_7_pdf_in_finder.png)

双击打开它，用你喜欢的 PDF 程序就好。

![](http://www.appcoda.com/wp-content/uploads/2016/07/t54_8_pdf_preview.png)

## 绘制自定义的 Header 和 Footer

现在扩展一下我们的 demo，往打印页面添加自定义的 header 和 footer。毕竟这也是我们最初子类化 `UIPrintPageRenderer` 的原因。自定义的意思是，不是 HTML 模板中的一部分，不是和其它的 HTML 内容一起渲染的内容。我们想要实现的是把 「Invoice」放在页面的顶部，作为 header，把「Thank you!」放在页面的底部，作为页面的 footer，在它上面还有一条水平线。下面的这张图就是我们要达到的效果：

![](http://www.appcoda.com/wp-content/uploads/2016/07/t54_9_pdf_with_header_footer.png)

在开始之前，我们先声明一下 header 和 footer 的高度。打开 `CustomPrintPageRenderer.swift` 文件，添加下面两行（这两个属性都是继承自 `UIPrintPageRenderer` 的）。

```swift
override init() {
    ...

    self.headerHeight = 50.0
    self.footerHeight = 50.0
}
```

我们先从 header 做起。先重写一下父类中的下面这个方法：

```swift
override func drawHeaderForPageAtIndex(pageIndex: Int, inRect headerRect: CGRect) {

}
```

在这个方法中我们要做的事情步骤如下所示：

1. 首先指定我们要绘制的 header 文字（也就是「Invoice」单词）。
2. 指定 header 文字的一些属性，比如字体、颜色、字间距等。
3. 计算字在加上上述属性后占据的空间，然后指定文字到页面右侧页面的边距。
4. 设置文字起始绘制的点。
5. 绘制文字（终于到这一步了）。

下面就是我上面文字转化为代码的实现。每句都有注释，方便大家理解：

```swift
override func drawHeaderForPageAtIndex(pageIndex: Int, inRect headerRect: CGRect) {

    // 声明 header 文字。
    let headerText: NSString = "Invoice"

    // 设置字体。
    let font = UIFont(name: "AmericanTypewriter-Bold", size: 30.0)

    // 设置字的属性。
    let textAttributes = [NSFontAttributeName: font!, NSForegroundColorAttributeName: UIColor(red: 243.0/255, green: 82.0/255.0, blue: 30.0/255.0, alpha: 1.0), NSKernAttributeName: 7.5]

    // 计算字的大小。
    let textSize = getTextSize(headerText as String, font: nil, textAttributes: textAttributes)

    // 右边的空距。
    let offsetX: CGFloat = 20.0

    // 指定字应该从哪里开始绘制。
    let pointX = headerRect.size.width - textSize.width - offsetX
    let pointY = headerRect.size.height/2 - textSize.height/2

    // 绘制 header 的文字。
    headerText.drawAtPoint(CGPointMake(pointX, pointY), withAttributes: textAttributes)
}
```

还有一件事我没有在上面的代码里说明的就是 `getTextSize(...)` 方法。跟你猜的一样，这又是另一个自定义方法，用于计算并返回文字的 frame。计算发生在另一个方法中，因为在绘制 footer 的时候也会用到这个方法。

下面就是 `getTextSize(...)` 方法：

```swift
func getTextSize(text: String, font: UIFont!, textAttributes: [String: AnyObject]! = nil) -> CGSize {

    let testLabel = UILabel(frame: CGRectMake(0.0, 0.0, self.paperRect.size.width, footerHeight))

    if let attributes = textAttributes {
        testLabel.attributedText = NSAttributedString(string: text, attributes: attributes)
    } else {
        testLabel.text = text
        testLabel.font = font!
    }

    testLabel.sizeToFit()
    return testLabel.frame.size
}
```

上面的方法对于计算文字占据的 frame 尺寸是一个通用的策略。我们把 textAttributes 设置到这个临时的 label 上。通过对其调用 `sizeToFit()` 方法，让系统帮助我们计算这个 label 的尺寸。

现在我们开始绘制 footer。下面的步骤跟上面绘制 header 的步骤十分相似，所以我也就没注释下面的代码。注意，footer 中的文字是水平居中的，文字颜色也和之前的不一样，字母之间也没有间距：

```swift
override func drawFooterForPageAtIndex(pageIndex: Int, inRect footerRect: CGRect) {

    let footerText: NSString = "Thank you!"

    let font = UIFont(name: "Noteworthy-Bold", size: 14.0)

    let textSize = getTextSize(footerText as String, font: font!)

    let centerX = footerRect.size.width/2 - textSize.width/2

    let centerY = footerRect.origin.y + self.footerHeight/2 - textSize.height/2

    let attributes = [NSFontAttributeName: font!, NSForegroundColorAttributeName: UIColor(red: 205.0/255.0, green: 205.0/255.0, blue: 205.0/255, alpha: 1.0)]

    footerText.drawAtPoint(CGPointMake(centerX, centerY), withAttributes: attributes)

}
```

上述代码创建了「Thank you!」的 footer，但是在它上面还没有一条分隔线。因此，我们再把上面的方法补充一下：

```swift
override func drawFooterForPageAtIndex(pageIndex: Int, inRect footerRect: CGRect) {
    ...

    // 绘制水平线

    let lineOffsetX: CGFloat = 20.0

    let context = UIGraphicsGetCurrentContext()

    CGContextSetRGBStrokeColor(context, 205.0/255.0, 205.0/255.0, 205.0/255, 1.0)

    CGContextMoveToPoint(context, lineOffsetX, footerRect.origin.y)

    CGContextAddLineToPoint(context, footerRect.size.width - lineOffsetX, footerRect.origin.y)

    CGContextStrokePath(context)

}
```

现在我们已经有了一条水平线！

在这部分结束之前，关于 header 和 footer 还有几句话想说。不知你注意到了没有，header 和 footer 中的文字都是 `NSString` 对象而不是 `String` 对象，这是因为执行真正绘制的 `drawAtPoint(...)` 方法属于 `NSString` 类。如果你使用了 `String` 对象，那通过下面的方式把它转换成 `NSString` 的对象：

```swift
(text as! NSString).drawAtPoint(...)
```

运行应用然后检查一下结果，这一次已经包含了 header 和 footer。

## Bonus Part：预览并使用 Email 发送 PDF 文件

到此为止，我们已经完成了这篇教程的主要目的。然而，当你在真机上运行时，没办法直接看到导出的 PDF 文件（你可以用 Xcode 查看，但是每次创建 PDF 都这么做就太麻烦了），所以我要给这个 app 增加两个额外的功能：在 web view 中预览 PDF 的功能（已在 `PreviewViewController` 中实现），还有通过 Email 发送 PDF 文件的功能。我们可以显示一个有各种选项的 _alert controller_ 来让用户做出最终选择。这里不会讲得太细，因为下面的代码已经超出了这篇教程的范围。

我们会把代码写在 `PreviewViewController.swift` 文件中，所以在 Project Navigator 找到并打开它。加入以下显示 alert controller 的方法：

```swift
func showOptionsAlert() {

    let alertController = UIAlertController(title: "Yeah!", message: "Your invoice has been successfully printed to a PDF file.\n\nWhat do you want to do now?", preferredStyle: UIAlertControllerStyle.Alert)

    let actionPreview = UIAlertAction(title: "Preview it", style: UIAlertActionStyle.Default) { (action) in

    }

    let actionEmail = UIAlertAction(title: "Send by Email", style: UIAlertActionStyle.Default) { (action) in

    }

    let actionNothing = UIAlertAction(title: "Nothing", style: UIAlertActionStyle.Default) { (action) in

    }

    alertController.addAction(actionPreview)

    alertController.addAction(actionEmail)

    alertController.addAction(actionNothing)

    presentViewController(alertController, animated: true, completion: nil)

}
```

每个选项的 action 还没有被实现，所以我们现在开始实现。对于预览动作，我们通过 `NSURLRequest` 对象把 PDF 文件载入到 web view 中：

```swift
let actionPreview = UIAlertAction(title: "Preview it", style: UIAlertActionStyle.Default) { (action) in

    let request = NSURLRequest(URL: NSURL(string: self.invoiceComposer.pdfFilename)!)

    self.webPreview.loadRequest(request)

}
```

对于发送邮件，可以按照下面的方法来实现：

```swift
func sendEmail() {

    if MFMailComposeViewController.canSendMail() {

        let mailComposeViewController = MFMailComposeViewController()

        mailComposeViewController.setSubject("Invoice")

        mailComposeViewController.addAttachmentData(NSData(contentsOfFile: invoiceComposer.pdfFilename)!, mimeType: "application/pdf", fileName: "Invoice")

        presentViewController(mailComposeViewController, animated: true, completion: nil)

    }

}
```

为了使用 `MFMailComposeViewController`，你还需要引入 `MessageUI`

```swift
import MessageUI
```

回到 `showOptionsAlert()` 方法，按下面的代码段完成 `actionPreview` action：

```swift
let actionEmail = UIAlertAction(title: "Send by Email", style: UIAlertActionStyle.Default) { (action) in

    dispatch_async(dispatch_get_main_queue(), {

        self.sendEmail()

    })
}
```

还差一点就完成了，别忘了我们还得调用 `showOptionsAlert()` 方法。Alert controller 会在发票被输出为 PDF 文件之后出现，回到 `exportToPDF(...)` IBAction 方法，加上下面的一句话：

```swift
@IBAction func exportToPDF(sender: AnyObject) {

    ...

    showOptionsAlert()
}
```

完成！现在你可以在真机上运行这个应用并且使用导出的 PDF 文件了。

![](http://www.appcoda.com/wp-content/uploads/2016/07/t54_10_after_export_alert.png)

## 总结

不管现在还是以后在创建 PDF 文档方面出现了什么新的技术，本文展现的这个方法在创建 PDF 文件方面永远会是基本的、高灵活性的，且安全的。它适用于几乎所有的情形，但只有一个缺点：要用到 HTML 模板来渲染真正的内容 。但我认为，创建它的成本真得很低。相比于写 HTML、创建 placeholder、替换字符串来说，手动绘制 PDF 文件真得是太麻烦了。除此之外，真正绘制 PDF 部分的代码是很基本的，并且通过 demo 应用的代码，你可以获得很理想的结果。不管怎样，我希望你能喜欢本文中介绍的这种方法。感谢阅读！希望你能开心地处理输出 PDF 文档的问题！

你可以在 Github.com 获取本文的 [Xcode 项目](https://github.com/appcoda/Print2PDF) 作为参考。