title: "Core ML入门：构建一个简单的图像识别应用"
date: 2018-05-28
tags: [机器学习]
categories: [AppCoda]
permalink: coreml-introduction
keywords: Core ML
custom_title: 
description:  

---
原文链接=http://www.appcoda.com/coreml-introduction/
作者=Sai Kambampati
原文日期=2017-06-14
译者=智多芯
校对=liberalisman,Lision
定稿=CMB

<!--此处开始正文-->

Apple 公司在 WWDC 2017 发布了几个令开发者感到兴奋的框架和 API，而在这些新框架中最受欢迎的绝对非 [Core ML](https://developer.apple.com/documentation/coreml) 莫属了。开发者可以通过 Core ML 框架将机器学习模型集成到应用程序中，该框架最大的优点是使用它并不需要开发者具备额外的神经网络或机器学习知识。Core ML 框架的另一个特点是，只要开发者将已经训练好的数据模型转换成了 Core ML 模型即可使用。为了演示，本文将直接使用 Apple 开发者网站上提供的一个 Core ML 模型。闲话少说，下面开始学习 Core ML。

> 注：本文要求使用 Xcode 9 beta 编写代码，还需要一个安装了 iOS 11 beta 的设备（译者注：也可使用 iOS 模拟器）用于测试文中实现的功能。虽然 Xcode 9 beta 同时支持 Swift 3.2 和 4.0，但文中所有的代码都使用了 Swift 4.0 编写。

<!--more-->

## 什么是 Core ML

> Core ML 使得开发者能够将各种各样的机器学习模型集成到应用程序中。它除了支持超过 30 层类型的广泛深度学习，还支持如树集成、[SVMs](https://en.wikipedia.org/wiki/Support_vector_machine) 和广义线性模型等标准模型。Core ML 建立在像 Metal 和 Accelerate 这样的底层技术之上，因此它能够无缝地充分利用 CPU 和 GPU 以实现性能最大化。机器学习模型可直接运行在设备上，以至于数据被分析时不需要脱离设备。
>
> \- [关于 Core ML 的 Apple 官方文档](https://developer.apple.com/machine-learning/)

Core ML 是今年在 WWDC 上随着 iOS 11 发布的一个全新的机器学习框架。通过 Core ML，开发者可以直接将机器学习模型集成到应用程序中。那么什么是机器学习呢？简单地说，机器学习是赋予计算机学习能力的应用，而不需要明确地对它编程。一个训练好的模型就是结合机器学习算法对一些数据集进行训练的结果。

![](http://www.appcoda.com/wp-content/uploads/2017/06/trained-model.png)

作为一个应用程序开发者，我们主要关心的是如何将机器学习模型应用到应用程序中以实现更有意思的功能。幸运的是，Apple 提供的 Core ML 框架大大简化了将不同的机器学习模型集成到应用程序中的过程。这为开发者开发如图像识别、自然语言处理、文本预测等功能提供了非常多的可能性。

现在你可能想知道将这种类型的人工智能加入到应用程序中会不会很困难，这就是最有意思的部分了，实际上 Core ML 非常易用。在本文中，你将会看到只要 10 行代码就可以将 Core ML 集成到应用程序中。

很酷吧？下面开始吧！

## 演示程序概览

本文将要实现的程序十分简单。该程序让用户拍摄或者从相册中选择一张照片，然后机器学习算法将会尝试预测照片中的物体。虽然预测结果可能并不完美，但你将借此了解到如何将 Core ML 应用到应用程序上。

![](http://www.appcoda.com/wp-content/uploads/2017/06/coreml-app-demo.png)

## 开始

首先，打开 Xcode 9 beta 并创建一个新项目。为该项目选择单视图应用程序（`Single View App`）模板，并确保使用的语言设置为 Swift。

![](http://www.appcoda.com/wp-content/uploads/2017/06/xcode9-new-proj.png)

## 创建用户界面

> 如果你不想从头开始搭建 UI 界面，可以从[这里下载起始项目](https://github.com/appcoda/CoreMLDemo/raw/master/CoreMLDemoStarter.zip)并直接跳到 Core ML 部分。

下面就开始吧！首先打开 `Main.storyboard`，并添加一些 UI 元素到视图中。选择 storyboard 中的视图控制器，然后依次点击 Xcode 菜单栏：`Editor-> Embed In-> Navigation Controller`。随后即可看到一个导航栏出现在视图上方。将该导航栏命名为 Core ML（或者任何你觉得合适的名字）。

![](http://www.appcoda.com/wp-content/uploads/2017/06/pic3.png)

 放到视图底端并对其缩放，使其两端刚好与视图两端重合。这样就搭建好了该应用的界面。

虽然本文没涉及到自动布局，但还是强烈建议使用。如果你没法做到自动布局，那就直接在 storyboard 中选择你将要运行的设备类型。

![](http://www.appcoda.com/wp-content/uploads/2017/06/coreml-storyboard.png)

## 实现拍照和相册功能

既然已经搭好了界面，接着就开始实现功能吧。本节将实现相册和拍照按钮的功能。在 `ViewController.swift` 中，先遵从 `UIImagePickerController` 所要求的 `UINavigationControllerDelegate` 协议。

```swift
class ViewController: UIViewController, UINavigationControllerDelegate
```

然后为之前的 `UILabel` 和 `UIImageView` 新增两个 IBOutlet。为了简单起见，本文分别将 `UIImageView` 和 `UILabel` 命名为 `imageView` 和 `classifier`。代码如下所示：

```swift
import UIKit
 
class ViewController: UIViewController, UINavigationControllerDelegate {
    @IBOutlet weak var imageView: UIImageView!
    @IBOutlet weak var classifier: UILabel!
    
     override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
```

接着还需要实现对应按钮被点击的响应动作，在 `ViewController` 中添加如下代码：

```swift
@IBAction func camera(_ sender: Any) {
    if !UIImagePickerController.isSourceTypeAvailable(.camera) {
        return
    }
    
    let cameraPicker = UIImagePickerController()
    cameraPicker.delegate = self
    cameraPicker.sourceType = .camera
    cameraPicker.allowsEditing = false
    
    present(cameraPicker, animated: true)
}
 
@IBAction func openLibrary(_ sender: Any) {
    let picker = UIImagePickerController()
    picker.allowsEditing = false
    picker.delegate = self
    picker.sourceType = .photoLibrary
    present(picker, animated: true)
}
```

以上代码创建了一个 `UIImagePickerController` 类型的常量并确保用户无法修改已拍摄的照片（无论该照片是刚拍摄的或者从相册中选择的）。然后将 `delegate` 设置为 `self`，最后将 `UIImagePickerController` 展示给用户。

至此还未添加 `UIImagePickerControllerDelegate` 对应的方法到 `ViewController.swift` 中，因此 Xcode 将会有错误提示。这里通过 `extension` 的形式来实现该协议：

```swift
extension ViewController: UIImagePickerControllerDelegate {
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        dismiss(animated: true, completion: nil)
    }
}
```

上面的代码对用户取消选择照片的动作做了相应处理。到目前为止代码大致如下：

```swift
import UIKit
 
class ViewController: UIViewController, UINavigationControllerDelegate {
    @IBOutlet weak var imageView: UIImageView!
    @IBOutlet weak var classifier: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }
 
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func camera(_ sender: Any) {
        if !UIImagePickerController.isSourceTypeAvailable(.camera) {
            return
        }
        
        let cameraPicker = UIImagePickerController()
        cameraPicker.delegate = self
        cameraPicker.sourceType = .camera
        cameraPicker.allowsEditing = false
        
        present(cameraPicker, animated: true)
    }
    
    @IBAction func openLibrary(_ sender: Any) {
        let picker = UIImagePickerController()
        picker.allowsEditing = false
        picker.delegate = self
        picker.sourceType = .photoLibrary
        present(picker, animated: true)
    }
 
}
 
extension ViewController: UIImagePickerControllerDelegate {
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        dismiss(animated: true, completion: nil)
    }
}
```

确保你有回到 storyboard 并为所有的 IBOutlet 和 IBAction 都建立好了连接。

为了访问摄像头和相册，还有做一件事。打开 `Info.plist` 并添加两项：*Privacy - Camera Usage Description* 和 *Privacy – Photo Library Usage Description*。这是因为从 iOS 10 开始，访问摄像头和相册需要指明访问原因。

![](http://www.appcoda.com/wp-content/uploads/2017/06/coreml-plist-privacy.png)

接下来将开始本文的核心部分了。再声明一次，如果你不想从头搭建界面，你可以[从这里下载起始项目](https://github.com/appcoda/CoreMLDemo/raw/master/CoreMLDemoStarter.zip)。

## 集成 Core ML 数据模型

现在开始将 Core ML 数据模型集成到应用程序中。正如前文所提到的，要使 Core ML 能正常工作还需要提供一个训练好的模型。你可以使用自己训练的模型，但本文将使用 Apple 开发者网站上提供的已经训练好的模型。

在 Apple 开发者网站的 [Machine Learning](https://developer.apple.com/machine-learning/) 页面向下滚动到底部就可以看到 4 个已经训练好的 Core ML 模型。

![](http://www.appcoda.com/wp-content/uploads/2017/06/coreml-pretrained-model.png)

本教程将使用 *Inception v3* 模型，但你也可以尝试下其他三个。在下载了 *Inception v3* 模型后，将其添加到 Xcode 项目中，然后看看 Xcode 都显示了哪些信息。

![](http://www.appcoda.com/wp-content/uploads/2017/06/coreml-model-desc.png)

> 备注：请确保该项目的 `Target Membersip` 被选中了，否则应用将无法访问到该文件。

在上面的截图中，可以看出该数据模型的类型为神经网络分类器。其他需要注意的信息还有模型评估参数，它表示该模型的输入和输出参数。本文使用的模型需要输入一张 `299x299` 的图像，并输出最为可能的类型及其对应每个类型的概率。

该截图中的另一个重要信息是模型类（model class），它是机器学习模型（`Inceptionv3`）自动生成的可以直接在代码中使用的类。点击 `Inceptionv3` 右边的箭头就可以看到该类的源码。

![](http://www.appcoda.com/wp-content/uploads/2017/06/inceptionv3-class.png)

现在将该模型添加到代码中。打开 `ViewController.swift` 文件，在开头导入 Core ML 框架：

```swift
import CoreML
```

接着，为 `Inceptionv3` 模型声明一个 `model` 变量，并在 `viewWillAppear()` 方法中初始化：

```swift
var model: Inceptionv3!
 
override func viewWillAppear(_ animated: Bool) {
    model = Inceptionv3()
}
```

我知道你现在在想什么。

“为什么不早点对这个模型进行初始化？”

“在 `viewWillAppear` 方法中定义它的意义何在？”

亲爱的朋友，它的意义在于，当应用程序尝试识别图像中的物体时，速度会快得多。（译者注：直接在声明 `model` 变量时直接初始化似乎也没什么影响，读者可自行测试。）

现在回到 `Inceptionv3.mlmodel` ，该模型接受的唯一输入参数是一张尺寸为 `299x299` 的图像，所以接下来要处理的就是如何将一张图像转换成这种尺寸。

## 转换图片

在 `ViewController.swift` 的 extension 中，将代码更新成如下代码。它实现了 `imagePickerController(_:didFinishPickingMediaWithInfo)` 方法用于处理选中的图像：

```swift
extension ViewController: UIImagePickerControllerDelegate {
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        dismiss(animated: true, completion: nil)
    }
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
        picker.dismiss(animated: true)
        classifier.text = "Analyzing Image..."
        guard let image = info["UIImagePickerControllerOriginalImage"] as? UIImage else {
            return
        } 
        
        UIGraphicsBeginImageContextWithOptions(CGSize(width: 299, height: 299), true, 2.0)
        image.draw(in: CGRect(x: 0, y: 0, width: 299, height: 299))
        let newImage = UIGraphicsGetImageFromCurrentImageContext()!
        UIGraphicsEndImageContext()
        
        let attrs = [kCVPixelBufferCGImageCompatibilityKey: kCFBooleanTrue, kCVPixelBufferCGBitmapContextCompatibilityKey: kCFBooleanTrue] as CFDictionary
        var pixelBuffer : CVPixelBuffer?
        let status = CVPixelBufferCreate(kCFAllocatorDefault, Int(newImage.size.width), Int(newImage.size.height), kCVPixelFormatType_32ARGB, attrs, &pixelBuffer)
        guard (status == kCVReturnSuccess) else {
            return
        } 
        
        CVPixelBufferLockBaseAddress(pixelBuffer!, CVPixelBufferLockFlags(rawValue: 0))
        let pixelData = CVPixelBufferGetBaseAddress(pixelBuffer!)
        
        let rgbColorSpace = CGColorSpaceCreateDeviceRGB()
        let context = CGContext(data: pixelData, width: Int(newImage.size.width), height: Int(newImage.size.height), bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(pixelBuffer!), space: rgbColorSpace, bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue) //3
        
        context?.translateBy(x: 0, y: newImage.size.height)
        context?.scaleBy(x: 1.0, y: -1.0)
        
        UIGraphicsPushContext(context!)
        newImage.draw(in: CGRect(x: 0, y: 0, width: newImage.size.width, height: newImage.size.height))
        UIGraphicsPopContext()
        CVPixelBufferUnlockBaseAddress(pixelBuffer!, CVPixelBufferLockFlags(rawValue: 0))
        imageView.image = newImage
    }
}
```

`imagePickerController(_:didFinishPickingMediaWithInfo)` 函数中的代码解释如下：

1. \#7-11 行：该方法的前几行将选中的图像从 `info` 字典中（使用 `UIImagePickerControllerOriginalImage`键）取出。另外，一旦有图像被选中就 Dismiss `UIImagePickerController`。
2. \#13-16 行：因为本文使用的模型只接受尺寸为 `299x299` 的图像，因此我们将选中的图像转换为一个正方形，然后将其赋值给另一个常量 `newImage`。
3. \#18-23 行：将 `newImage` 转换为 `CVPixelBuffer`。对于不熟悉 `CVPixelBuffer` 的读者来说，它就是一个用来在内存中存放像素的图像缓冲区，详情可查阅[这里](https://developer.apple.com/documentation/corevideo/cvpixelbuffer-q2e)。
4. \#31-32 行：将该图像的所有像素转换到独立于设备的 RGB 颜色空间。接着创建一个容纳所有像素数据的 `CGContext`，当需要渲染（或者改变）该上下文的一些基本属性时就可以很轻松的调用它。这也是我们这两行所做的事情——对图像进行平移和缩放。
5. \#34-38 行：最后，将该图形上下文放入当前上下文中，渲染图像，从栈顶删除该上下文，再将 `imageView.image` 设置成 `newImage`。

如果你现在无法理解以上的大部分代码也没关系，这只是一些超出本文范围的 `Core Image` 的高级代码片段而已。你只需要知道上面的代码将选中的图像转换成了数据模型能够接受的形式。我建议你能改动下代码中的数字并留意对应的结果，以更好地理解上面的代码。

## 使用 Core ML

现在我们把注意力重新放回到 Core ML 上来。我们使用了 Inceptionv3 模型来实现对象识别。借助 Core ML，我们所需要做的只是添加几行代码。将以下代码段粘贴到 `imageView.image = newImage`  之后。

```swift
guard let prediction = try? model.prediction(image: pixelBuffer!) else {
    return
}
 
classifier.text = "I think this is a \(prediction.classLabel)."
```

这就完了！`Inceptionv3` 类自动生成了一个名为 `prediction(image:)` 的方法，可以用来预测给定图像中出现的物体。这里我们将调整后的图像以 `pixelBuffer` 作为参数传给了该方法。一旦 `String` 类型的预测结果返回了，就将 `classifier` 标签更新为识别出的物体名称。

是时候测试一下这个应用了。编译并在模拟器或者你的 iPhone（安装了 iOS 11 beta）上运行该应用，从相册选择或使用摄像头拍摄一张照片，该应用将识别出图像中有什么物体。

![](http://www.appcoda.com/wp-content/uploads/2017/06/coreml-successful-case.jpg)

在测试该应用的过程中，你可能会注意到它并不总能准确地做出预测。其实这并不是代码的问题，问题出在被训练过的模型上。

![](http://www.appcoda.com/wp-content/uploads/2017/06/coreml-failed-case.jpg)

## 总结

希望你已经懂得了如何将 Core ML 集成到你的应用中，本文仅仅是一篇入门教程而已。如果你对将训练好的 Caffe、Keras 或者 SciKit 模型转换成 Core ML 模型感兴趣的话，请 [继续关注](http://facebook.com/appcodamobile) 我们的下一篇 Core ML 系列教程。我将教你如何将一个模型转换为 Core ML 模型。

如果想参考本文的演示应用程序，请 [查看 GitHub 上的完整项目](https://github.com/appcoda/CoreMLDemo)。

关于 Core ML 框架的更详细信息，请参考 [官方 Core ML 文档](https://developer.apple.com/documentation/coreml)。也可以参考 Apple 的 WWDC 2017 视频：

* [Introducing Core ML](https://developer.apple.com/videos/play/wwdc2017/703/)
* [Core ML in Depth](https://developer.apple.com/videos/play/wwdc2017/710/)

关于 Core ML 如果你还有什么想说的，记得给我们留言哦！