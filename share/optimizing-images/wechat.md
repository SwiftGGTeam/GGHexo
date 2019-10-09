图像优化"

> 作者：Jordan Morgan，[原文链接](https://www.swiftjectivec.com/optimizing-images/)，原文日期：2018-12-11
> 译者：[Nemocdz](https://nemocdz.github.io/)；校对：[numbbbbb](http://numbbbbb.com/)，[WAMaker](https://github.com/WAMaker)；定稿：[Pancf](https://github.com/Pancf)
  ---










俗话说得好，最好的相机是你身边的那个。那么毫无疑问 - iPhone 可以说是这个星球最重要的的相机。而这在业界也已经达成共识。

在度假？不偷偷拍几张记录在你的 Instagram 故事里？不存在的。

出现爆炸新闻？查看 Twitter，就可以知道是哪些媒体正在报道，通过他们揭露事件的实时照片。

等等……

正因为图像在平台上无处不在，如果管理不当，很容易出现性能和内存问题。稍微了解下 UIKit，搞清楚它处理图像的机制，可以节省大量时间，避免做无用功。



### 理论知识

快问快答 - 这是一张我漂亮（且时髦）女儿的照片，大小为 266KB，在一个 iOS 应用中展示它需要多少内存？

![](https://www.swiftjectivec.com/assets/images/baylor.jpg)

剧透警告 - 答案不是 266KB，也不是 2.66MB，而是接近 14MB。

为啥呢？

iOS 实际上是从一幅图像的*尺寸*计算它占用的内存 - 实际的文件大小会比这小很多。这张照片的尺寸是 1718 像素宽和 2048 像素高。假设每个像素会消耗我们 4 个比特：

    1718 * 2048 * 4 / 1000000 = 14.07 MB 占用

假设你有一个用户列表 table view，并且在每一行左边使用常见的圆角头像来展示他们的照片。如果你认为这些图像会像洁食（犹太人的食品，比喻事情完美无瑕）一样，每个都被类似 ImageOptim 的工具压缩过，那可就大错特错了。即使每个头像的大小只有 256x256，也会占用相当一部分内存。

### 渲染流程

综上所述 - 了解幕后原理是值得的。当你加载一张图片时，会执行以下三个步骤：

1）**加载** - iOS 获取压缩的图像并加载到 266KB 的内存（在我们这个例子中）。这一步没啥问题。

2）**解码** - 这时，iOS 获取图像并转换成 GPU 能读取和理解的方式。这里会解压图片，像上面提到那样占用 14MB。

3）**渲染** - 顾名思义，图像数据已经准备好以任意方式渲染。即使只是在一个 60x60pt 的 image view 中。

解码阶段是消耗最大的。在这个阶段，iOS 会创建一块缓冲区 - 具体来说是一块图像缓冲区，也就是图像在内存中的表示。这解释了为啥内存占用大小和图像尺寸有关，而不是文件大小。因此也可以理解，为什么在处理图片时，尺寸如此重要。

具体到 `UIImage`，当我们传入从网络或者其它来源读取的图像数据时，它会将数据解码到缓冲区，但不会考虑数据的编码方式（比如 PNG 或者 JPG）。然而，缓冲区实际上会保存到 `UIImage` 中。由于渲染不是一瞬间的操作，`UIImage` 会执行一次解码操作，然后一直保留图像缓冲区。

接着往下说 - 任何 iOS 应用中都有一整块的帧缓冲区。它会保存内容的渲染结果，也就是你在屏幕上看到的东西。每个 iOS 设备负责显示的硬件都用这里面单个像素信息逐个点亮物理屏幕上合适的像素点。

处理速度非常重要。为了达到黄油般顺滑的每秒 60 帧滑动，在信息发生变化时（比如给一个 image view 赋值一幅图像），帧缓冲区需要让 UIKit 渲染 app 的 window 以及它里面所有层级的子视图。一旦延迟，就会丢帧。

> *觉得 1/60 秒太短不够用？Pro Motion 设备已经将上限拉到了 1/120 秒。*

### 尺寸正是问题所在

我们可以很简单地将这个过程和内存的消耗可视化。我创建了一个简单的应用，可以在一个 image view 上展示需要的图像，这里用的是我女儿的照片：

    
    let filePath = Bundle.main.path(forResource:"baylor", ofType: "jpg")!
    let url = NSURL(fileURLWithPath: filePath)
    let fileImage = UIImage(contentsOfFile: filePath)
    
    // Image view
    let imageView = UIImageView(image: fileImage)
    imageView.translatesAutoresizingMaskIntoConstraints = false
    imageView.contentMode = .scaleAspectFit
    imageView.widthAnchor.constraint(equalToConstant: 300).isActive = true
    imageView.heightAnchor.constraint(equalToConstant: 400).isActive = true
    
    view.addSubview(imageView)
    imageView.centerXAnchor.constraint(equalTo: view.centerXAnchor).isActive = true
    imageView.centerYAnchor.constraint(equalTo: view.centerYAnchor).isActive = true

> *实践中请注意强制解包。这里只是一个简单的场景。*

完成之后就会是这个样子：

![](https://www.swiftjectivec.com/assets/images/baylorPhone.jpg)

虽然展示图片的 image view 尺寸很小，但是用 LLDB 就可以看到图像的真正尺寸。

    <UIImage: 0x600003d41a40>, {1718, 2048}

需要注意的是 - 这里的单位是*点*。所以当我在 3x 或 2x 设备时，可能还需要额外乘上这个数字。我们可以用 vmmap 来确认这张图像是否占用了 14 MB：

    shell
    vmmap --summary baylor.memgraph

一部分输出（省略一些内容以便展示）：

    shell
    Physical footprint:         69.5M
    Physical footprint (peak):  69.7M

我们看到这个数字接近 70MB，这可以作为基准来确认针对性优化的成果。如果我们用 grep 命令查找 Image IO，或许会看到一部分图像消耗:

    shell
    vmmap --summary baylor.memgraph | grep "Image IO"
    
    Image IO  13.4M   13.4M   13.4M    0K  0K  0K   0K  2

啊哈 - 这里有大约 14MB 的脏内存，和我们前面的估算一致。如果你不清楚每一列表示什么，可以看下面这个截图：

![](https://www.swiftjectivec.com/assets/images/vmmap.jpg)

通过这个例子可以清楚地看到，哪怕展示在 300x400 image view 中，图像也需要完整的内存消耗。图像尺寸很重要，但是尺寸并不是唯一的问题。

### 色彩空间

能确定的是，有一部分内存消耗来源于另一个重要因素 - 色彩空间。在上面的例子中，我们的计算基于以下假设 - 图像使用 sRGB 格式，但大部分 iPhone 不符合这种情况。sRGB 每个像素有 4 个字节，分别表示红、蓝、绿、透明度。

如果你用支持宽色域的设备进行拍摄（比如 iPhone 8+ 或 iPhone X），那么内存消耗将变成两倍，反之亦然。Metal 会用仅有一个 8 位透明通道的 Alpha 8 格式。

这里有很多可以把控和值得思考的地方。这也是为什么你应该用 [UIGraphicsImageRenderer](https://www.swiftjectivec.com/uigraphicsimagerenderer/) 代替 `UIGraphicsBeginImageContextWithOptions` 的原因之一。后者*总是*会使用 sRGB，因此无法使用宽色域，也无法在不需要的时候节省空间。在 iOS 12 中，`UIGraphicsImageRenderer` 会为你做正确的选择。

不要忘了，很多图像并不是真正的摄影作品，只是一些绘图操作。如果你错过了我最近的文章，可以再阅读一遍下面的内容：

    
    let circleSize = CGSize(width: 60, height: 60)
    
    UIGraphicsBeginImageContextWithOptions(circleSize, true, 0)
    
    // Draw a circle
    let ctx = UIGraphicsGetCurrentContext()!
    UIColor.red.setFill()
    ctx.setFillColor(UIColor.red.cgColor)
    ctx.addEllipse(in: CGRect(x: 0, y: 0, width: circleSize.width, height: circleSize.height))
    ctx.drawPath(using: .fill)
    
    let circleImage = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()

上面的圆形图像用的是每个像素 4 个字节的格式。如果换用 `UIGraphicsImageRenderer`，通过渲染器自动选择正确的格式，让每个像素使用 1 个字节，可以节省高达 75％ 的内存：

    
    let circleSize = CGSize(width: 60, height: 60)
    let renderer = UIGraphicsImageRenderer(bounds: CGRect(x: 0, y: 0, width: circleSize.width, height: circleSize.height))
    
    let circleImage = renderer.image{ ctx in
        UIColor.red.setFill()
        ctx.cgContext.setFillColor(UIColor.red.cgColor)
        ctx.cgContext.addEllipse(in: CGRect(x: 0, y: 0, width: circleSize.width, height: circleSize.height))
        ctx.cgContext.drawPath(using: .fill)
    }

### 缩小图片 vs 向下采样

现在我们从简单的绘图场景回到现实世界 - 许多图片其实并不是艺术作品，只是自拍或者风景照。

因此有些人可能会假设（并且确实相信）通过 `UIImage` 简单地缩小图片就够了。但我们前面已经解释过，缩小尺寸并不管用。而且根据 Apple 工程师 kyle Howarth 的说法，由于内部坐标转换的原因，缩小图片的优化效果并不太好。

`UIImage` 导致性能问题的根本原因，我们在渲染流程里已经讲过，它会解压*原始图像*到内存中。理想情况下，我们需要一个方法来减少图像缓冲区的尺寸。

庆幸的是，我们可以修改图像尺寸，来减少内存占用。很多人以为图像会自动执行这类优化，但实际上并没有。

让我们尝试用底层的 API 来对它进行向下采样：

    
    let imageSource = CGImageSourceCreateWithURL(url, nil)!
    let options: [NSString:Any] = [kCGImageSourceThumbnailMaxPixelSize:400,
                                   kCGImageSourceCreateThumbnailFromImageAlways:true]
    
    if let scaledImage = CGImageSourceCreateThumbnailAtIndex(imageSource, 0, options as CFDictionary) {
        let imageView = UIImageView(image: UIImage(cgImage: scaledImage))
        
        imageView.translatesAutoresizingMaskIntoConstraints = false
        imageView.contentMode = .scaleAspectFit
        imageView.widthAnchor.constraint(equalToConstant: 300).isActive = true
        imageView.heightAnchor.constraint(equalToConstant: 400).isActive = true
        
        view.addSubview(imageView)
        imageView.centerXAnchor.constraint(equalTo: view.centerXAnchor).isActive = true
        imageView.centerYAnchor.constraint(equalTo: view.centerYAnchor).isActive = true
    }

通过这种取巧的展示方法，会获得和以前完全相同的结果。不过在这里，我们使用了 `CGImageSourceCreateThumbnailAtIndex()`，而不是直接将原始图片放进 image view。再次使用 vmmap 来确认优化是否有回报（同样，省略部分内容以便展示）：

    shell
    vmmap -summary baylorOptimized.memgraph
    
    Physical footprint:         56.3M
    Physical footprint (peak):  56.7M

效果很明显。之前是 69.5M，现在是 56.3M，节省了 13.2M。这个节省*相当大*，几乎和图片本身一样大。

更进一步，你可以在自己的案例中尝试更多可能的选项来进行优化。在 WWDC 18 的 Session 219，“Images and Graphics Best Practices“中，苹果工程师 Kyle Sluder 展示了一种有趣的方式，通过 `kCGImageSourceShouldCacheImmediately` 标志位来控制解码时机，：

    
    func downsampleImage(at URL:NSURL, maxSize:Float) -> UIImage
    {
        let sourceOptions = [kCGImageSourceShouldCache:false] as CFDictionary
        let source = CGImageSourceCreateWithURL(URL as CFURL, sourceOptions)!
        let downsampleOptions = [kCGImageSourceCreateThumbnailFromImageAlways:true,
                                 kCGImageSourceThumbnailMaxPixelSize:maxSize
                                 kCGImageSourceShouldCacheImmediately:true,
                                 kCGImageSourceCreateThumbnailWithTransform:true,
                                 ] as CFDictionary
        
        let downsampledImage = CGImageSourceCreateThumbnailAtIndex(source, 0, downsampleOptions)!
        
        return UIImage(cgImage: downsampledImage)
    }

这里 Core Graphics 不会开始图片解码，直到你请求缩略图。另外要注意的是，两个例子都传入了 `kCGImageSourceCreateThumbnailMaxPixelSize`，如果不这样做，就会获得和原图同样尺寸的缩略图。根据文档所示：

> “...如果没指定最大尺寸，返回的缩略图将会是完整图像的尺寸，这可能并不是你想要的。”

所以上面发生了什么？简而言之，我们将缩放的结果放入缩略图中，从而创建的是比之前小很多的图像解码缓冲区。回顾之前提到的渲染流程，在第一个环节（加载）中，我们给 UIImage 传入的缓冲区是需要绘制的图片尺寸，不是图片的真实尺寸。

如何用一句话总结本文？想办法对图像进行向下采样，而不是使用 UIImage 去缩小尺寸。

### 附赠内容

除了向下采样，我自己还经常使用 iOS 11 引入的 [预加载 API](https://developer.apple.com/documentation/uikit/uitableviewdatasourceprefetching?language=swift)。请记住，我们是在解码图像，哪怕是放在 Cell 展示之前执行，也会消耗大量 CPU 资源。

如果应用持续耗电，iOS 可以优化电量消耗。但是我们做的向下采样一般不会持续执行，所以最好在一个队列中执行采样操作。与此同时，你的解码过程也实现了后台执行，一石多鸟。

做好准备，下面即将为您呈现的是——我自己业余项目里的 Objective-C 代码示例：

    objective-c
    // 不要用全局异步队列，使用你自己的队列，从而避免潜在的线程爆炸问题
    - (void)tableView:(UITableView *)tableView prefetchRowsAtIndexPaths:(NSArray<NSIndexPath *> *)indexPaths
    {
        if (self.downsampledImage != nil || 
            self.listItem.mediaAssetData == nil) return;
        
        NSIndexPath *mediaIndexPath = [NSIndexPath indexPathForRow:0
                                                         inSection:SECTION_MEDIA];
        if ([indexPaths containsObject:mediaIndexPath])
        {
            CGFloat scale = tableView.traitCollection.displayScale;
            CGFloat maxPixelSize = (tableView.width - SSSpacingJumboMargin) * scale;
            
            dispatch_async(self.downsampleQueue, ^{
                // Downsample
                self.downsampledImage = [UIImage downsampledImageFromData:self.listItem.mediaAssetData
                                   scale:scale
                            maxPixelSize:maxPixelSize];
                
                dispatch_async(dispatch_get_main_queue(), ^ {
                    self.listItem.downsampledMediaImage = self.downsampledImage;
                });
            });
        }
    }

> 建议使用 asset catalog 来管理原始图像资源，它已经实现了缓冲区优化（以及更多功能）。

想成为内存和图像处理专家？不要错过 WWDC 18 这些信息量巨大的 session：

* [iOS Memory Deep Dive](https://developer.apple.com/videos/play/wwdc2018/416/?time=1074)
* [Images and Graphics Best Practices](https://developer.apple.com/videos/play/wwdc2018/219/)

### 总结

学无止境。如果选择了编程，你就必须每小时跑一万英里才能跟得上这个领域创新和变化的步伐……换句话说，一定会有很多你根本不知道的 API、框架、模式或者优化技巧。

在图像领域也是如此。大多数时候，你初始化一个了大小合适的 UIImageView 就不管了。我当然知道摩尔定律。现在手机确实很快，内存也很大，但是你要知道 - 将人类送上月球的计算机只有不到 100KB 内存。

长期和魔鬼共舞（译者注：比喻不管内存问题），它总有露出獠牙的那天。等到一张自拍就占掉 1G 内存的时候，后悔也来不及了。希望上述的知识和技术能帮你节省一些 debug 时间。

下次再见 ✌️。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。