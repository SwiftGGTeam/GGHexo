title: "使用 Swift 3 与 Xocde 8 创建条码与二维码扫描应用"
date: 2017-01-18
tags: [iOS 开发]
categories: [AppCoda]
permalink: barcode-reader-swift
keywords: 条码,二维码,扫描
custom_title: 
description: 本文详细描述如何创建条码与二维码扫描应

---
原文链接=http://appcoda.com/barcode-reader-swift/
作者=Simon Ng
原文日期=2016-11-02
译者=小锅
校对=saitjr
定稿=CMB

<!--此处开始正文-->

那么，什么是二维码呢？我相信读者中的大多数都知道什么是二维码（译者注：我觉得应该是全部都知道吧）。以防还有读者没有听说过二维码，可以看一下上面这张图片（译者注：原文如此，并且原文中也没有图片）——那就是二维码。

二维（QR 全称是 Quick Response 快速响应）码是一种二维的条形码，它是由 Deson 所发明的。它原本被设计用于跟踪工业生产中的零件，最近几年二维码被用于编码 URL，在消费市场上受来越来越多的欢迎。与你所熟悉的普通条形码不同的是，二维码在横向和纵向上都包含了信息。这赋予了它储存大量数字和字母信息的能力。我并不想在这里深入讨论二维码的技术细节。如果你对这些感兴趣的话，可以参考[二维码的官方网站](http://www.qrcode.com/)。

随着 iPhone 和 Android 手机的流行，二维码的使用率得到了惊人的发展。在某些国家里，二维码几乎无处不在。它们出现在杂志、报纸、广告牌、名片甚至是菜单上。作为一个 iOS 开发者，你可能对于如何使用应用支持二维码扫描感到很好奇。在 iOS 7 之前，为了实现二维码的扫描，我们必须利用第三方库。现在，我们可以直接利用内置的 AVFoundation 框架来实时读入和扫描二维码。

创建一个支持扫描以及翻译二维码的应用从来没这么容易过。

> 小贴士：可以使用 [http://www.qrcode-monkey.com](http://www.qrcode-monkey.com) 这个网站来生成属于你自己的二维码。

<!--more-->

## 创建一个二维码扫描应用

我们将要创建的 demo 应用非常简单和直观。在我们开始创建项目之前，我们需要了解一点很重要的知识，那就是在 iOS 上所有的条码扫描和二维码扫描都是基于视频捕获的。这就是为什么二维码扫描的特性会被添加到 AVFoundation 框架中的原因。始终牢记这一点，可以帮助你理解本篇文章。

那么，这个 demo 应用是如何工作的呢？

如下面的截图所示，这就是整个应用的 UI 展示。这个应用与视频捕捉类应用长得很像，只是它没有录像的功能。当应用启动的时候，它利用 iPhone 的后置摄像头来自动发现并扫描二维码。被解码的信息（比如说 URL）会在屏幕的正下方显示出来。

![](http://appcoda.com/wp-content/uploads/2016/11/qrcode-reader-1-1024x630.png)

就是如此地简单。

要创建这个应用，请先[下载](https://github.com/appcoda/QRCodeReader/raw/master/QRCodeReaderStarter.zip)我提供的项目模板。我已经预先创建好了 storyboard 以及一个信息 label，并且已经与控制器创建连接。主视图与 `QRCodeViewController` 类相关联，而扫描视图与 `QRScannerController` 类相关联。

![](http://appcoda.com/wp-content/uploads/2016/11/qrcode-reader-2-1024x565.png)

你现在可以运行程序，看一眼效果。在程序启动后，可以点击扫描按钮来创建扫描视图。后面我们会实现这个控制器的二维码扫描功能。

现在你已经知道起始项目是如何运作的，就让我们开始为应用开发二维码扫描功能了。

## 导入 AVFoundation 库

在起始项目中我已经创建好了用户界面。UI 中的 label 用于显示二维码解码后的信息，并且它已经与 `QRScannerController` 类中的 `messageLabel` 属性建立连接了。

正如我前面提到过的，我们需要依赖 AVFoundation 来实现二维码的扫描功能。首先，打开 `QRScannerController.swift` 文件，并导入该框架：

```swift
import AVFoundation
```

接着，我们需要实现 `AVCaptureMetadataOutputObjectsDelegate` 协议。稍候我们会讨论它。现在，先对代码作如下更新：

```swift
class ViewController: UIViewController, AVCaptureMetadataOutputObjectsDelegate
```

在继续前进之前，在 `QRScannerController` 类中声明如下的属性。后面我们会一个一个地对它们进行讨论。

```swift
var captureSession:AVCaptureSession?
var videoPreviewLayer:AVCaptureVideoPreviewLayer?
var qrCodeFrameView:UIView?
```

## 实现视频捕获

正如在前面小节中提到过的，二维码的扫描完全是基于视频捕获的。为了做到实时捕获，我们所需要做的就是创建一个 `AVCaptureSession` 对象，并且将它的输入设置到对应的 `AVCaptureDevice` 用于视频捕获。在 `QRScannerController` 类中的 `viewDidLoad` 方法插入如下代码：

```swift
// 获得 AVCaptureDevice 对象，用于初始化捕获视频的硬件设备，并配置硬件属性
let captureDevice = AVCaptureDevice.defaultDevice(withMediaType: AVMediaTypeVideo)
 
do {
    // 通过之前获得的硬件设备，获得 AVCaptureDeviceInput 对象
    let input = try AVCaptureDeviceInput(device: captureDevice)
    let input = try AVCaptureDeviceInput(device: captureDevice)
    
    // 初始化 captureSession 对象
    captureSession = AVCaptureSession()
    
    // 给 session 添加输入设备
    captureSession?.addInput(input)
    
} catch {
    // 如果出现任何错误，仅做输出处理，并返回
    print(error)
    return
}
``` 

一个 `AVCaptureDevice` 对象表示一个物理的捕获设备。我们使用捕获设备来配置底层硬件的属性。因为我们需要捕获视频的数据，需要调用 `defaultDevice(withMediaType:)` 方法，给它传递 `AVMediaTypeVideo` 类型来获取视频捕获设备。

为了执行实时捕获，我们实例化了一个 `AVCaptureSession` 对象，并为它添加了视频捕获设备。这个 `AVCaptureSession` 对象被用于定位输入的数据流并将其输出。

在这里，我们设置 `AVCaptureMetaDataOutput` 作为该 session 的输出。这个 `AVCaptureMetaDataOutput` 类是二维码扫描功能的核心。这个类与 `AVCaptureMetadataOutputObjectsDelegate` 协议配合，主要用于拦截在输入设置中发现的元数据（即在设备摄像头中捕获到的二维码）并且将其转化为人类可读的格式。

如果你对其中的一些概念感到不解，不用慌——等下你就会全部明白的。现在，继续往 `viewDidLoad` 中的 `do` 代码块中添加如下的代码：

```swift
// 初始化 AVCaptureMetadataOutput 对象，并将它作为输出
let captureMetadataOutput = AVCaptureMetadataOutput()
captureSession?.addOutput(captureMetadataOutput)
```

接下来，继续添加下面的代码。我们将 `captureMetadataOutput` 对象的代码设置为 `self`。这就是为什么 `QRReaderViewController` 类要遵守 `AVCaptureMetadataOutputObjectsDelegate` 协议的原因。

```swift
// 设置 delegate 并使用默认的 dispatch 队列来执行回调
captureMetadataOutput.setMetadataObjectsDelegate(self, queue: DispatchQueue.main)
captureMetadataOutput.metadataObjectTypes = [AVMetadataObjectTypeQRCode]
```

当有新的元数据被捕获到的时候，它们会被转发到代理对象中用于进一步的处理。在上面的代码中，我们指定了用于执行代理方法的 dispatch 队列。一个 dispatch 队列可以是串行或者并行的。根据苹果的官方文档，这里的队列必须是串行队列。因为我们使用 `DispatchQueue.main` 来获取默认的串行队列。

这里的 `metadataObjectTypes` 属性也相当重要；因为它是告诉应用我们对何种元数据类型感兴趣的关键点。而 `AVMetadataObjectTypeQRCode` 很明显地表明了我们的意图。我们需要的是二维码扫描。

现在我们已经创建并设置好 `AVCaptureMetadataOutput` 对象了，接下来需要将设备捕获到的视频显示在屏幕上。这个可以使用 `AVCaptureVideoPreviewLayer` 类来完成，它是 `CALayer` 的一个子类。我们使用这个预览的 layer 与 AV 捕获 session 进行配合来显示视频。这个预览的 layer 被添加到当前视频的子 layer 上。在 `do-catch` 代码块中添加如下代码：

```swift
// 初始化视频预览 layer，并将其作为 viewPreview 的 sublayer
videoPreviewLayer = AVCaptureVideoPreviewLayer(session: captureSession)
videoPreviewLayer?.videoGravity = AVLayerVideoGravityResizeAspectFill
videoPreviewLayer?.frame = view.layer.bounds
view.layer.addSublayer(videoPreviewLayer!)
```

最后，调用捕获 session 的 `startRunning` 方法来开始进行视频捕获：

```swift
// 开始视频捕获
captureSession?.startRunning()
```

如果现在编译并在真机上运行程序，应用会闪退，并在控制台显示如下错误：

```bash
This app has crashed because it attempted to access privacy-sensitive data without a usage description.  The app's Info.plist must contain an NSCameraUsageDescription key with a string value explaining to the user how the app uses this data.
```

与我们在音频录像文章中的类似的，iOS 要求开发者在使用摄像头之前需要先获取用户的权限。要获取权限，我们需要在 `Info.plist` 文件中添加 `NSCameraUsageDescription` 键。打开文件，并在任意空白处点击右键来添加行。设置键为 *Privacy – Camera Usage Description*，值为 *We need to access your camera for scanning QR code*。

![](http://appcoda.com/wp-content/uploads/2016/11/qrcode-reader-3-1024x211.png)

完成编辑后，部署应用并再次在真机上运行。点击扫描按钮会打开内置的摄像头并开始视频捕获。但是，现在信息 label 和顶部栏是隐藏的。可以使用如下的代码进行修复。这可以将信息 label 以及顶部栏显示到视频 layer 之上。

```swift
// 将显示信息的 label 与 top bar 提到最前面
view.bringSubview(toFront: messageLabel)
view.bringSubview(toFront: topbar)
```

在改动后重新运行程序。信息 label 会出现在屏幕上，并显示 *No QR code is detected*。

## 实现二维码扫描

到目前为止，这个应用看上去视频捕获应用很类似。如何让它支持二维码扫描并将其代码转化为有意义的信息呢？这个应用本身已经支持检测二维码的功能了。只是我们没有意识到而已。接下来我们要对应用进行如下的调整：

* 当一个二维码被检测到的时候，应用会使用绿框对该代码进行高亮显示
* 对二维码进行解码，并将解码后的信息显示到屏幕的底部

### 初始化绿色边框

为了高亮显示二维码，我们首先创建一个 `UIView` 对象，并将它的边框设置为绿色。在 `viewDidLoad` 方法中的 `do` 代码块中添加如下代码：

```swift
// 初始化二维码选框并高亮边框
qrCodeFrameView = UIView()
 
if let qrCodeFrameView = qrCodeFrameView {
    qrCodeFrameView.layer.borderColor = UIColor.green.cgColor
    qrCodeFrameView.layer.borderWidth = 2
    view.addSubview(qrCodeFrameView)
    view.bringSubview(toFront: qrCodeFrameView)
}
```

这个 `qrCodeFrameView` 对象目前在屏幕上是不可见的，因为`UIView` 的尺寸现在被默认设置为 0。接着，在检测到二维码的时候，我们需要改变它的尺寸，使其显示为一个绿色边框。

## 对二维码进行解码

正如前面提到过的，当 `AVCaptureMetadataOutput` 对象识别出二维码的时候，`AVCaptureMetadataOutputObjectsDelegate` 中的代码方法会被调用到：

```swift
optional func captureOutput(_ captureOutput: AVCaptureOutput!, didOutputMetadataObjects metadataObjects: [Any]!, from connection: AVCaptureConnection!)
```

我们还未实现这个方法；这就是我们的应用无法对二维码进行解码的原因。为了捕获二维码并对其进行解码，我们需要实现这个方法，并对元数据对象进行进一步的处理。代码如下：

```swift
func captureOutput(_ captureOutput: AVCaptureOutput!, didOutputMetadataObjects metadataObjects: [Any]!, from connection: AVCaptureConnection!) {
    
    // 检查：metadataObjects 对象不为空，并且至少包含一个元素
    if metadataObjects == nil || metadataObjects.count == 0 {
        qrCodeFrameView?.frame = CGRect.zero
        messageLabel.text = "No QR code is detected"
        return
    }
    
    // 获得元数据对象
    let metadataObj = metadataObjects[0] as! AVMetadataMachineReadableCodeObject
    
    if metadataObj.type == AVMetadataObjectTypeQRCode {
        // 如果元数据是二维码，则更新二维码选框大小与 label 的文本
        let barCodeObject = videoPreviewLayer?.transformedMetadataObject(for: metadataObj)
        qrCodeFrameView?.frame = barCodeObject!.bounds
        
        if metadataObj.stringValue != nil {
            messageLabel.text = metadataObj.stringValue
        }
    }
}
```

该方法的第二个参数（即 `metadataObjects`) 是一个数组对象，这个数组包含了被读取出来一组元数据对象。首先要做的事当然是确保这个数组不为 `nil`，并且包含至少一个对象。否则，我们就将 `qrCodeFrameView` 的尺寸重新设置为 0，并将 `messageLabel` 设置为显示默认的信息。

如果拿到了元数据，需要先确认它是否是二维码。如果是，我们需要进一步确定该二维码的边界。这几行代码就是用于使用绿框对二维码进行高亮。通过对 `viewPreviewLayer` 调用 `transformedMetadataObject(for:)` 方法，元数据的可视属性 (visual properties) 被转化为 layer 的坐标。至此，我们就能找到二维码的边界，并用于构建绿色边框。

最后，我们将二维码翻译成人类可读的信息。这一步是相当容易的。解码后的信息可以通过 `AVMetadataMachineReadableCode` 对象的 `stringValue` 属性来获取到。

现在一切准备就绪了！点击运行按钮来编译并将应用部署到真机上。

![](http://appcoda.com/wp-content/uploads/2016/11/qrcode-reader-4-1024x593.png)

应用启动后，点击扫描按钮，然后将设备对准上图的二维码。应用会立即检测出二维码并进行解码。

![](http://appcoda.com/wp-content/uploads/2016/11/qrcode-reader-5-1024x637.jpg)

## 你的练习 —— 条码扫描

这个 demo 应用，现在已经有扫描二维码的功能了。如果能将它做成一个通过的条码扫描应用，不是更加 amazing 吗。除了二维码之外，AVFoundation 框架还提供了如下的条码类型：

* UPC-E (AVMetadataObjectTypeUPCECode)
* Code 39 (AVMetadataObjectTypeCode39Code)
* Code 39 mod 43 (AVMetadataObjectTypeCode39Mod43Code)
* Code 93 (AVMetadataObjectTypeCode93Code)
* Code 128 (AVMetadataObjectTypeCode128Code)
* EAN-8 (AVMetadataObjectTypeEAN8Code)
* EAN-13 (AVMetadataObjectTypeEAN13Code)
* Aztec (AVMetadataObjectTypeAztecCode)
* PDF417 (AVMetadataObjectTypePDF417Code)

![](http://appcoda.com/wp-content/uploads/2016/11/qrcode-reader-6-1024x626.png)

你的任务是将对现在的项目工程进行调整，使 demo 应用支持其它类型条码的扫描。你需要使用 `captureMetadataOutput` 来识别一个条码类型的数据，而不仅仅是返回二维码类型。

```swift
captureMetadataOutput.metadataObjectTypes = [AVMetadataObjectTypeQRCode]
```

我准备将它留作你的练习。同时我也将解决方案添加到了下面的 Xcode 项目中，我强烈建议你先尝试自己去完成这个练习。这将会非常有趣，并且这是搞清楚代码是如何运行的最佳方式。

如果你尽了最大的努力进行尝试，但是还是无法完成练习，可以[从 Github 下载我的解决方案](https://github.com/appcoda/QRCodeReader)。
