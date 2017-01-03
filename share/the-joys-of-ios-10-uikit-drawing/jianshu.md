趣谈 iOS 10 UIKit 绘图"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2016/10/16/the-joys-of-ios-10-uikit-drawing/)，原文日期：2016-11-16
> 译者：[冬瓜](http://www.desgard.com/)；校对：[Joy](undefined)；定稿：[CMB](https://github.com/chenmingbiao)
  









我花费了几天时间用来尝试 iOS 10 中 `UIGraphics` 类中对于图片和 PDF 中的渲染功能。感觉很有意思。这次我来分享一下这个功能，并且将其与旧的版本对比一下。



## 旧版本

是否还记得这个？

    objc
    // 创建一个色域(color space)
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB(); 
    if (colorSpace == NULL) {
        NSLog(@"Error allocating color space");
        return nil; 
    }
    
    // 创建位图上下文(Context Reference)
    CGContextRef context = CGBitmapContextCreate(
        NULL, width, height,
        BITS_PER_COMPONENT, // 每个通道的位数是 8 bit （BPC） 
        width * ARGB_COUNT, // 4 byte ARGB 值
        colorSpace,
        (CGBitmapInfo) kCGImageAlphaPremultipliedFirst); 
    
    if (context == NULL) {
        NSLog(@"Error: Context not created!"); 
        CGColorSpaceRelease(colorSpace ); 
        return nil;
    }
    
    // 加入上下文
    UIGraphicsPushContext(context);
    
    // 绘图操作
    UIGraphicsPopContext();
    
    // 转换为图片对象
    CGImageRef imageRef = CGBitmapContextCreateImage(context); 
    UIImage *image = [UIImage imageWithCGImage:imageRef];
    
    // 	清除
    CGColorSpaceRelease(colorSpace ); 
    CGContextRelease(context); 
    CFRelease(imageRef);

## 新版本

    
    let image = renderer.image { context in
        let bounds = context.format.bounds
        for amount in stride(from: 1.0 as CGFloat, to: 0.0, by: -0.1) {
            let color = UIColor(hue: amount, saturation: 1.0, 
                brightness: 1.0, alpha: 1.0)
            let rects = bounds.divided(
                atDistance: amount * bounds.size.width, from: .maxXEdge)
            color.set(); UIRectFill(rects.0)
        }
    }

以及

    
    public func imageExample(size: CGSize) -> UIImage? {
        let bounds = CGRect(origin: .zero, size: size)
        let colorSpace = CGColorSpaceCreateDeviceRGB()
        let (width, height) = (Int(size.width), Int(size.height))
        
        // 创建 CG ARGB 上下文
        guard let context = CGContext(data: nil, width: width, 
            height: height, bitsPerComponent: 8, 
            bytesPerRow: width * 4, space: colorSpace, 
            bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue) 
            else { return nil }
        
        // 为 UIKit 准备 CG 上下文 
        UIGraphicsPushContext(context); defer { UIGraphicsPopContext() }
        
        // 使用 UIKit 调用绘制上下文
        UIColor.blue.set(); UIRectFill(bounds)
        let oval = UIBezierPath(ovalIn: bounds)
        UIColor.red.set(); oval.fill()
        
        // 从上下文中提取图像
        guard let imageRef = context.makeImage() else { return nil }
        return UIImage(cgImage: imageRef)
    }

以及

    
    extension UIImage {
        public func grayscaled() -> UIImage? {
            guard let cgImage = cgImage else { return nil }
            let colorSpace = CGColorSpaceCreateDeviceGray()
            let (width, height) = (Int(size.width), Int(size.height))
            
            // 构建上下文：每个像素一个字节，无alpha
            guard let context = CGContext(data: nil, width: width, 
                height: height, bitsPerComponent: 8, 
                bytesPerRow: width, space: colorSpace, 
                bitmapInfo: CGImageAlphaInfo.none.rawValue) 
                else { return nil }
            
            // 绘制上下文
            let destination = CGRect(origin: .zero, size: size)
            context.draw(cgImage, in: destination)
            
            // 返回灰度图片
            guard let imageRef = context.makeImage() 
                else { return nil }
            return UIImage(cgImage: imageRef)
        }
    }

好吧，我承认` bitmapInfo` 还是有些别扭，但是其他还是很不错的，不是吗？

* 取消了 `UIGraphicsBeginImageContext()` `UIGraphicsEndImageContext()` 这些成员，与上下文引用对象实现脱离。为什么之前不这样做呢？
* 我十分喜欢 Swift 的构造函数。现在在创建尺寸对象 `CGRect` 的时候，更加简洁。
* 如果你想用 `Core Graphics`，Swift 也是可以的：在很多时候也需要原先的上下文操作（例如设备灰色空间）并且仍然支持一些低耗能、`Core Image `和其他一些强劲的框架。
* 在绘图时，push context 和 pop context 操作要对应出现。我一般喜欢用 `defer` 关键字来让清除和配置部分的逻辑在同一时刻。（我需要扩展 Swift 的引用类型来引入 `deinit` ！）
* Swift 可以进行内存管理操作。
* Swift 的可选关键字和错误处理可以在异常处理中变的更加优雅。
* 如你期望的，PDF 绘图与图像绘制一样简单。
* CG 中的一些冷门的方法（例如对于 CGRect 的划分方法 `divided(atDistance:, from:) ` 以及上下文的 `draw` 和 `makeImage` 方法）也显得好用一些。

当然，我只是在完成了 Swift 风格的初步探索。你们是否也对 iOS 的绘图部分感兴趣呢？或者让我们一起讨论其他有趣的话题。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。