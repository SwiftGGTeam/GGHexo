title: "使用 Swift 创建简单的二维码扫描应用"
date: 2016-07-25
tags: [教程]
categories: [AppCoda]
permalink: simple-barcode-reader-app-swift
keywords: swift二维码,swift avfoundation
custom_title: Swift 二维码扫描教程
description: 本文详细讲解了怎么做一个 Swift avfoundation 二维码扫描的应用，想看 Swift 二维码扫描代码的来欣赏下吧。

---
原文链接=http://www.appcoda.com/simple-barcode-reader-app-swift/
作者=AppCoda
原文日期=2016-05-19
译者=Prayer
校对=numbbbbb
定稿=CMB

<!--此处开始正文-->

排着长队等待结账的商店，帮助旅客记录包裹和航班信息的机场，帮助大型零售商处理大量无聊的存货清单，这些场景非常适合使用条码扫描器。此外，条码扫描器也能帮消费者进行智能购物和产品分类。既然它这么棒，不如我们在 iPhone 上做一个吧！

幸运的是，对 Apple 开发者来说，实现条码扫描非常容易，苹果大法好！我们会使用 AV Foundation 来实现一个小巧的 iPhone app，能够扫描 CD 上的条码，获取专辑的一些重要信息，并将内容输出到 App 视图中。能够实现读取条码的功能，这非常的酷，但是我们的野心不止于此，我们会对识别的条码内容作进一步的操作。

我本不该再多啰嗦，不过还是友情提醒一下，这个条码扫描 app 只有在设备具有摄像头时才能正确工作。记住这一点，准备一台有摄像头的 iOS 设备，我们开始吧！

<!--more-->

## 关于 CDBarcodes

今天我们创建的应用叫做 CDBarcodes —— 它还是很智能的。当设备扫描到一个条码时，我们会将处理后的条码内容发送给 Discogs 数据库，然后获得专辑的名称、艺术家以及发布年份。Discogs 的数据库中有大量的音乐数据，所以我们基本上能查到所有数据。

[从这里下载 CDBarcodes 的 starter project](https://github.com/appcoda/Simple-Barcode-Reader/raw/master/SimpleBarcodeStarter.zip)

![](http://swiftgg-main.b0.upaiyun.com/img/simple-barcode-reader-app-swift-1.png)

## Discogs

先从 [Discogs](http://www.discogs.com/) 开始。首先，我们需要登录或者注册一个 Discogs 账户。登录之后，拉到网站的最底端，在 footer 的最左边边栏，点击 API。

![](http://swiftgg-main.b0.upaiyun.com/img/simple-barcode-reader-app-swift-2.png)

在 Discogs API 页面，点击左边栏 Database 中的 Search。

![](http://swiftgg-main.b0.upaiyun.com/img/simple-barcode-reader-app-swift-3.png)

这个就是我们将会用到的 API。我们使用 “title” 和 “year” 参数来获取专辑信息。

现在我们需要将查询的 URL 保存到我们的 CDBarcodes 中。在 `Constants.swift` 文件中，将 `https://api.discogs.com/database/search?q=` 添加到常量 `DISCOGS_AUTH_URL` 中。

```swift
let DISCOGS_AUTH_URL = "https://api.discogs.com/database/search?q="
```

现在我们可以很方便地在应用中使用 `DISCOGS_AUTH_URL` 获取查询 URL。

回到刚才的 Discogs API 网站。我们需要创建一个新应用，取得 API 的使用资格。在导航栏中，网页的最顶部，点击 Create an App。之后点击 Create an Application 按钮。

![](http://swiftgg-main.b0.upaiyun.com/img/simple-barcode-reader-app-swift-4.png)

应用名称的话，输入 “CDBarcodes + 你的名字”，或者其他你喜欢的名字。description 字段可以写：

“This is an iOS app that reads barcodes from CDs and displays information about the albums.”

> 译注：“这个 iOS 应用会读取 CD 的条形码并显示唱片信息。”

最后，点击 Create Application 按钮。

在最后的结果页面，我们能够得到使用条码来做一些操作的资格信息。

拷贝 Consumer Key，粘贴到 `Constants.swift` 文件的 `DISCOGS_KEY` 中。再拷贝 Consumer Secret，粘贴到 `Constants.swift` 文件的 `DISCOGS_SECRET` 中。

同 URL 一样，现在我们可以在应用中很方便地使用这些变量了。

![](http://swiftgg-main.b0.upaiyun.com/img/simple-barcode-reader-app-swift-5.png)

## CocoaPods

为了能够和 Discogs API 通信，我们使用一个优秀的第三方库管理工具：CocoaPods。如果想要了解更多关于 CocoaPods 的信息，或者想学习如何安装它，可以到[它的官网](https://cocoapods.org/)查询。

有了 CocoaPods 就可以安装第三方库，我们会使用 Alamofire 来请求网络，使用 SwiftyJSON 来处理从 Discogs 返回的 JSON 数据。

下面我们把这两个库引入到 CDBarcodes 工程中！

CocoaPods 安装好之后，打开终端，进入 CDBarcodes 目录，初始化 CocoaPods，命令如下：

```bash
cd <your-xcode-project-directory>
pod init
```

使用 Xcode 打开 Podfile：

```bash
open -a Xcode Podfile
```

将下面内容拷贝到 Podfile 中：

```ruby
source 'https://github.com/CocoaPods/Specs.git'
platform :ios, '8.0'
use_frameworks!

pod 'Alamofire', '~> 3.0'

target ‘CDBarcodes’ do
pod 'SwiftyJSON', :git => 'https://github.com/SwiftyJSON/SwiftyJSON.git'
end
```

最后，使用下面的命令来下载 Alamofire 和 SwiftyJSON：

```bash
pod install
```

现在让我们回到 Xcode 中！切记要打开的是 `CDBarcodes.xcworkspace`

## 识别条码

AV Foundation 框架提供了识别条码的工具。我们来大概描述一下工作原理。

* AVCaptureSession 会管理从摄像头获取的数据——将输入的数据转为可以使用的输出
* AVCaptureDevice 表示物理设备和其他属性。AVCaptureSession 会从 AVCaptureDevice 获取输入数据
* AVCaptureDeviceInput 从设备中捕获数据
* AVCaptureMetadataOutput 会向处理数据的 delegate 转发获得的元数据

在 `BarcodeReaderViewController.swift` 文件中，首先导入 AVFoundation

```swift
import UIKit
import AVFoundation
```

同时，我们需要遵循 `AVCaptureMetadataOutputObjectsDelegate` 协议。

在 `viewDidLoad()` 中，我们要发动条码扫描引擎。

首先，创建一个 `AVCaptureSession` 对象，然后设置 `AVCaptureDevice`。之后我们将创建一个输入对象（input object），然后将其加入到 `AVCaptureSession` 中。

```swift
class BarcodeReaderViewController: UIViewController, AVCaptureMetadataOutputObjectsDelegate {

var session: AVCaptureSession!
var previewLayer: AVCaptureVideoPreviewLayer!

override func viewDidLoad() {
    super.viewDidLoad()
    
    // 创建一个 session 对象
    session = AVCaptureSession()
    
    // 设置 captureDevice.
    let videoCaptureDevice = AVCaptureDevice.defaultDeviceWithMediaType(AVMediaTypeVideo)
    
    // 创建 input object.
    let videoInput: AVCaptureDeviceInput?
    
    do {
        videoInput = try AVCaptureDeviceInput(device: videoCaptureDevice)
    } catch {
        return
    }
    
    // 将 input 加入到 session 中
    if (session.canAddInput(videoInput)) {
        session.addInput(videoInput)
    } else {
        scanningNotPossible()
    }
```

如果你的设备没有摄像头，那就无法扫描条码。我们添加了一个处理失败场景的方法。如果没有摄像头，会弹出一个提示框来提示用户，换一个有摄像头的设备来扫描 CD 的条码。

```swift
func scanningNotPossible() {
    // 告知用户该设备无法进行条码扫描
    let alert = UIAlertController(title: "Can't Scan.", message: "Let's try a device equipped with a camera.", preferredStyle: .Alert)
    alert.addAction(UIAlertAction(title: "OK", style: .Default, handler: nil))
    presentViewController(alert, animated: true, completion: nil)
    session = nil
}
```

回到 `viewDidLoad()` 方法中，将 input 添加到 session 之后，我们需要创建 `AVCaptureMetadataOutput` 并把它也添加到 session 中。我们会将捕获到的数据通过串行队列发送给 delegate 对象。

下一步需要声明我们将要扫描的条码类型。对我们而言，我们需要使用 EAN-13 条码。有意思的是，我们扫描的条码并非都是 EAN-13 类型的；一些有可能是 UPC-A 类型，这可能会造成识别的问题。

Apple 通过在前面加上 0 来将 UPC-A 条码转换为 EAN-13 条码。UPC-A 条码只有 12 位，EAN-13 条码，和你猜测的一样，是 13 位。这个自动转化特性的好处是，我们在设置 `metadataObjectTypes` 时，只要设置为 `AVMetadataObjectTypeEAN13Code`，EAN-13 和 UPC-A 条码都将会被识别。不过这会修改条码，因此有可能会在查询 Discogs 时出问题，后面我们会处理这个问题。

如果摄像头有问题，我们需要使用 `scanningNotPossible()` 来告知用户。

```swift
// 创建 output 对象
let metadataOutput = AVCaptureMetadataOutput()

// 将 output 对象添加到 session 上
if (session.canAddOutput(metadataOutput)) {
   session.addOutput(metadataOutput)
   
   // 通过串行队列，将捕获到的数据发送给相应的代理
   metadataOutput.setMetadataObjectsDelegate(self, queue: dispatch_get_main_queue())
   
   // 设置可扫描的条码类型
   metadataOutput.metadataObjectTypes = [AVMetadataObjectTypeEAN13Code]
   
} else {
   scanningNotPossible()
}
```

我们已经拥有了扫描条码的强大能力，现在需要做的是预览扫描画面。使用 `AVCaptureVideoPreviewLayer` 在整个屏幕上显示拍摄到的画面。

然后，我们就可以开始扫描了。

```swift
// 添加 previewLayer 让其显示摄像头拍到的画面
​        
previewLayer = AVCaptureVideoPreviewLayer(session: session);
previewLayer.frame = view.layer.bounds;
previewLayer.videoGravity = AVLayerVideoGravityResizeAspectFill;
view.layer.addSublayer(previewLayer);
    
// 开始运行 session
    
session.startRunning()
```

在 `captureOutput:didOutputMetadataObjects:fromConnection` 方法中，我们可以庆祝一下，因为执行到该方法就说明已经识别了一些信息。

首先，我们需要从 `metadataObjects` 数组中取出第一个对象，然后将其转化为机器可以识别的格式。然后将转换后的 `readableCode` 作为一个 string 值传入 `barcodeDetected()` 方法中。

在看 `barcodeDetected()` 方法之前，我们需要以震动的形式给用户一些扫描成功的反馈并且关闭 session（stop the session）。万一你忘记关闭了 session，没关系，你的设备会一直震动，直到你关闭为止。

```swift
func captureOutput(captureOutput: AVCaptureOutput!, didOutputMetadataObjects metadataObjects: [AnyObject]!, fromConnection connection: AVCaptureConnection!) {
 
    // 从 metadataObjects 数组中取得第一个对象
    if let barcodeData = metadataObjects.first {
        // 将其转化为机器可以识别的格式
        let barcodeReadable = barcodeData as? AVMetadataMachineReadableCodeObject;
        if let readableCode = barcodeReadable {
            // 将 readableCode 作为一个 string 值，传入 barcodeDetected() 方法中
            barcodeDetected(readableCode.stringValue);
        }
        
        // 以震动的形式告知用户，识别成功        AudioServicesPlaySystemSound(SystemSoundID(kSystemSoundID_Vibrate))
        
        // 关闭 session （避免你的设备一直嗡嗡震动）
        session.stopRunning()
    }
}
```

我们需要在 `barcodeDetected()` 中做一些操作。第一个任务是弹出一个提示框告知用户，我们扫描到了一个条码。然后将扫描到的信息转化为我们需要的内容。

必须去掉扫描内容中的空格。去掉空格之后，我们需要判断条码是 EAN-13 还是 UPC-A 类型。如果是 EAN-13 类型，不需要额外的操作。如果是 UPC-A 条码，它被转化为了 EAN-13 类型，我们需要把它还原成原有的格式。

就像我们之前讨论的那样，苹果在 UPC-A 条码的前头加上一个 0 来将其转换为 EAN-13，所以我们需要判断其是否以 0 开头，如果是的话，删掉它。如果没有这一步，Discogs 无法识别这个数字，我们也没有办法得到正确的数据。

拿到处理后的条码数据之后，我们将它传给 `DataService.searchAPI()` 然后显示 `BarcodeReaderViewController`

```swift
func barcodeDetected(code: String) {
 
    // 让用户知道，我们扫描到了
    let alert = UIAlertController(title: "Found a Barcode!", message: code, preferredStyle: UIAlertControllerStyle.Alert)
    alert.addAction(UIAlertAction(title: "Search", style: UIAlertActionStyle.Destructive, handler: { action in
        
        // 去除空格
        let trimmedCode = code.stringByTrimmingCharactersInSet(NSCharacterSet.whitespaceCharacterSet())
        
        // 判断是 EAN 还是 UPC?
        
        let trimmedCodeString = "\(trimmedCode)"
        var trimmedCodeNoZero: String
        
        if trimmedCodeString.hasPrefix("0") && trimmedCodeString.characters.count > 1 {
            trimmedCodeNoZero = String(trimmedCodeString.characters.dropFirst())
            
            // Send the doctored UPC to DataService.searchAPI()
            DataService.searchAPI(trimmedCodeNoZero)
        } else {
            
            // Send the doctored EAN to DataService.searchAPI()
            DataService.searchAPI(trimmedCodeString)
        }
        
        self.navigationController?.popViewControllerAnimated(true)
    }))
    
    self.presentViewController(alert, animated: true, completion: nil)
}
```

查看 `BarcodeReaderViewController.swift` 之前，我们在 `viewDidLoad()` 后面添加 `viewWillAppear()` 和 `viewWillDisappear()`。在 `viewWillAppear()` 方法中，我们让 session 开始运行。相应的，在 `viewWillDisappear()` 方法中，让 session 停止运行。

```swift
override func viewWillAppear(animated: Bool) {
 
    super.viewWillAppear(animated)
    if (session?.running == false) {
        session.startRunning()
    }
}
 
override func viewWillDisappear(animated: Bool) {
    super.viewWillDisappear(animated)
    
    if (session?.running == true) {
        session.stopRunning()
    }
}
```

## 数据服务

在 `DataService.swift` 中，我们将引入 Alamofire 和 SwiftyJSON。

接下来，声明一些变量来存储我们从 Discogs 获得的原始数据。根据 Bionik6 的建议，我们将使用 `private(set)` 来实现只读属性。

然后创建 Alamofire GET 请求。这里通过解析 JSON 得到专辑的名称和年份。我们分别把得到的名称和年份原始数据赋值给 `ALBUM_FROM_DISCOGS` 和 `YEAR_FROM_DISCOGS`，之后会使用这些变量来创建专辑对象。

现在，我们从 Discogs 上获得了数据，下面要做的就是展示给全世界！好吧，展示给 `AlbumDetailsViewController.swift` 就够了。使用通知的方式来实现。

```swift
import Foundation
import Alamofire
import SwiftyJSON
 
class DataService {
 
	static let dataService = DataService()
	 
	private(set) var ALBUM_FROM_DISCOGS = ""
	private(set) var YEAR_FROM_DISCOGS = ""
	 
	static func searchAPI(codeNumber: String) {
	    
	    // 从 Discogs 上获取专辑数据的 URL
	    let discogsURL = "\(DISCOGS_AUTH_URL)\(codeNumber)&?barcode&key=\(DISCOGS_KEY)&secret=\(DISCOGS_SECRET)"
	    
	    Alamofire.request(.GET, discogsURL)
	        .responseJSON { response in
	            
	            var json = JSON(response.result.value!)
	            
	            let albumArtistTitle = "\(json["results"][0]["title"])"
	            let albumYear = "\(json["results"][0]["year"])"
	            
	            self.dataService.ALBUM_FROM_DISCOGS = albumArtistTitle
	            self.dataService.YEAR_FROM_DISCOGS = albumYear
	            
	            // 发送通知，让 AlbumDetailsViewController 知道我们得到了数据
	            NSNotificationCenter.defaultCenter().postNotificationName("AlbumNotification", object: nil)
	    }
	}

}
```

## Album 模型

在专辑的数据模型 `Album.swift` 中，需要将专辑模型转化为我们想要的数据。这个模型接受原始的 `artistAlbum` 和 `albumYear` 数据，把它们转换为更加易读的数据。

```swift
import Foundation
 
class Album {        
 
private(set) var album: String!
private(set) var year: String!
 
init(artistAlbum: String, albumYear: String) {
    
    // 为专辑信息添加一些额外的数据
    self.album = "Album: \n\(artistAlbum)"
    self.year = "Released in: \(albumYear)"
}
 
}
```

## 是时候秀一波专辑数据了！

在 `viewDidLoad()` 方法中，设置 labels 的内容，提示用户开始扫描。我们需要添加 observer 来监听 `NSNotification` 从而接收通知。同时需要在 `deinit` 中移除监听者。

```swift
deinit {
    NSNotificationCenter.defaultCenter().removeObserver(self)
}

override func viewDidLoad() {
    super.viewDidLoad()
    
    artistAlbumLabel.text = "Let's scan an album!"
    yearLabel.text = ""
    
    NSNotificationCenter.defaultCenter().addObserver(self, selector: #selector(setLabels(_:)), name: "AlbumNotification", object: nil)
}
```

当监听到通知的时候，`setLabels()` 方法将会被调用。这里我们将使用 `DataService.swift` 中的原始字符串来初始化 `Album` 对象。然后将 label 中的内容设置为我们想要的 `Album` 内容。


```swift
func setLabels(notification: NSNotification){

    // 使用 DataService.swift 中的数据初始化 Album 对象
    let albumInfo = Album(artistAlbum: DataService.dataService.ALBUM_FROM_DISCOGS, albumYear: DataService.dataService.YEAR_FROM_DISCOGS)
    artistAlbumLabel.text = "\(albumInfo.album)"
    yearLabel.text = "\(albumInfo.year)"
}
```

## 测试 CDBarcodes

我们的 app 完成啦！当然，我们可以直接从 CD 封面看到专辑名称、艺术家和发行年份，但是用我们的 app 要有趣得多！为了更好地测试 CDBarcodes 应用，我们需要找一些 CD 和唱片。这样就有可能同时遇到 EAN-13 和 UPC-A 条码，真正发挥 app 的威力。

在 `BarcodeReaderViewController` 中，注意将相机对焦到条码上。

这里是完成之后的 [CDBarcodes](https://github.com/appcoda/Simple-Barcode-Reader) 代码。

## 总结

无论是商务人士、购物者还是普通人，条码扫描器都一个特别有用的工具。因此，能够开发条码扫描也非常有用。

扫描那部分比较有趣。在获得扫描的数据之后，我们需要对数据做进一步操作，例如判断是 EAN-13 还是 UPC-A 类型。我们需要找到转化数据的正确方式，然后老司机就上路了。

如果想了解更多内容，可以读取其他的 `metadataObjectTypes` 和一些新 API。唯一的限制就是你的想象力。
