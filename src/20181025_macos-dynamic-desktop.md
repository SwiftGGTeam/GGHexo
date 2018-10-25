title: "mac OS Dynamic Desktop"
date: 2018-10-25
tags: [Swift, NSHipster]
categories: [Swift, NSHipster]
permalink: macos-dynamic-desktop
keywords: Dynamic Desktop,Mojave,NSHipster
custom_title: "macOS 动态桌面"
description: Mojave 中 Dynamic Desktop 的奥义

---
原文链接=https://nshipster.com/macos-dynamic-desktop/
作者=Mattt
原文日期=2018-10-01
译者=saitjr
校对=冬瓜,Yousanflics
定稿=Forelax

<!--此处开始正文-->

Dark Mode（深色模式）可谓是 macOS 最受欢迎的特性之一了 —— 尤其是对于你我这样的开发者来说。我们不仅喜欢文本编辑器是暗色的主题，还很看中整个系统色调的一致性。

过去几年，和这个特性旗鼓相当的要数 Night Shift（夜览），它主要是在日夜更替的时候减少对眼睛的劳损。

纵观这两个功能，Dynamic Desktop（动态桌面）也就呼之欲出了，当然这也是 Mojave 的新特性之一。进入“系统偏好设置 > 桌面与屏幕保护程序” 并且选择“动态”，就能得到一个基于地理位置且全天候动态变化的壁纸。

<!--more-->

![](https://nshipster.com/assets/desktop-and-screen-saver-preference-pane-b457c3a4bc26017c8d555506333d5b73244adaf8b7060f0cadd450f39b279c88.png)

效果不仅微妙，而且让人愉悦。桌面仿佛被赋予了生命，能随着时间的推移而变化；符合自然规律。（不出意外的话，结合 dark mode 的切换，还会有讨喜的特效）

*这到底是如何实现的呢？*<br/>
这便是本周 NSHipster 讨论的问题。

答案会深入探究图片格式，同时涉及一些逆向工程以及球面三角学相关的内容。

<br/>

------

<br/>

理解 Dynamic Desktop 第一步，就是要找到这些动态图片。

在 macOS Mojave 系统下，打开访达，选择“前往 > 前往文件夹...” （⇧⌘G），输入“/Library/Desktop Pictures/”。

![](https://nshipster.com/assets/go-to-library-desktop-pictures-3992f8efa1d14dd3bf092ec7eb298c6c1855dcc8e0cf57c0e494a840a8cb4713.png)

在这个目录下，可以找到名为“Mojave.heic”的文件。双击通过预览打开。

![](https://nshipster.com/assets/mojave-heic-abd6b67d8941ad50a9bcd7dd6657994174d4be713bb3c2cfbc9e24ffff7ad129.png)

在预览中，左边栏会显示从 1~16 的缩略图，每张都是不同状态的沙漠图。

![](https://nshipster.com/assets/mojave-dynamic-desktop-images-c8bc3aab78c049d74abd46240445f82c3d0cf0ad043bcc9da6f3fda066776034.png)

如果选择“工具 > 显示检查器”（⌘I），可以看到更为详细的信息，如下图所示：

![](https://nshipster.com/assets/mojave-heic-preview-info-b71c5e4084bd43f1e6b34852c4c757493627eb8b66ee44b282e2f53d274dda02.png)

不幸的是，这些就是预览所展示的全部信息了（截至发稿前）。即使点击旁边的“更多信息检查器”，我们也只是能得到下面这个表格，其余的无从得知：

| Color Model  | RGB        |
| ------------ | ---------- |
| Depth:       | 8          |
| Pixel Height | 2,880      |
| Pixel Width  | 5,120      |
| Profile Name | Display P3 |

> 后缀 `.heic` 表示图片容器采用 HFIF（High-Efficiency Image File Format）编码，即高效率图档格式（这种格式基于 __HEVC__（High-Efficiency Video Compression），即高效率视频压缩，也就是 H.265）。更多信息，可以参考 [WWDC 2017 Session 503 "Introducing HEIF and HEVC"](https://developer.apple.com/videos/play/wwdc2017/503/)

想要获得更多的数据，我们还需要脚踏实地，真真切切的深入底层 API。

## 利用 CoreGraphics 一探究竟

第一步先创建 Xcode Playground。简单起见，我们将“Mojave.heic”文件路径硬编码到代码中。

```swift
import Foundation
import CoreGraphics

// 系统版本要求 macOS 10.14 Mojave
let url = URL(fileURLWithPath: "/Library/Desktop Pictures/Mojave.heic")
```

然后，创建 `CGImageSource`，拷贝元数据并遍历全部标签：

```swift
let source = CGImageSourceCreateWithURL(url as CFURL, nil)!
let metadata = CGImageSourceCopyMetadataAtIndex(source, 0, nil)!
let tags = CGImageMetadataCopyTags(metadata) as! [CGImageMetadataTag]
for tag in tags {
    guard let name = CGImageMetadataTagCopyName(tag),
        let value = CGImageMetadataTagCopyValue(tag)
    else {
        continue
    }

    print(name, value)
}
```

运行这段代码，会得到两个值：一个是 `hasXMP`，值为 `"True"`，另一个是 `solar`，它的值是一串看不大懂的数据：

```
YnBsaXN0MDDRAQJSc2mvEBADDBAUGBwgJCgsMDQ4PEFF1AQFBgcICQoLUWlRelFh
UW8QACNAcO7vOubr3yO/1e+pmkOtXBAB1AQFBgcNDg8LEAEjQFRxqCKOFiAjwCR6
waUkDgHUBAUGBxESEwsQAiNAVZV4BI4c+CPAEP2uFrMcrdQEBQYHFRYXCxADI0BW
tALKmrjwIz/2ObLnx6l21AQFBgcZGhsLEAQjQFfTrJlEjnwjQByrLle1Q0rUBAUG
Bx0eHwsQBSNAWPrrmI0ISCNAKiwhpSRpc9QEBQYHISIjCxAGI0BgJff9KDpyI0BE
NTOsilht1AQFBgclJicLEAcjQGbHdYIVQKojQEq3fAg86lXUBAUGBykqKwsQCCNA
bTGmpC2YRiNAQ2WFOZGjntQEBQYHLS4vCxAJI0BwXfII2B+SI0AmLcjfuC7g1AQF
BgcxMjMLEAojQHCnF6YrsxcjQBS9AVBLTq3UBAUGBzU2NwsQCyNAcTcSnimmjCPA
GP5E0ASXJtQEBQYHOTo7CxAMI0BxgSADjxK2I8AoalieOTyE1AQFBgc9Pj9AEA0j
QHNWsnnMcWIjwEO+oq1pXr8QANQEBQYHQkNEQBAOI0ABZpkFpAcAI8BKYGg/VvMf
1AQFBgdGR0hAEA8jQErBKblRzPgjwEMGElBIUO0ACAALAA4AIQAqACwALgAwADIA
NAA9AEYASABRAFMAXABlAG4AcAB5AIIAiwCNAJYAnwCoAKoAswC8AMUAxwDQANkA
4gDkAO0A9gD/AQEBCgETARwBHgEnATABOQE7AUQBTQFWAVgBYQFqAXMBdQF+AYcB
kAGSAZsBpAGtAa8BuAHBAcMBzAHOAdcB4AHpAesB9AAAAAAAAAIBAAAAAAAAAEkA
AAAAAAAAAAAAAAAAAAH9
```

### 太阳之光

大多数人看到这串文字，就会默默合上 MacBook Pro，大呼告辞。但一定有人发现，这串文字非常像 [Base64 编码](https://en.wikipedia.org/wiki/Base64) 的杰作。

让我们来验证一下这个假设：

```swift
if name == "solar" {
    let data = Data(base64Encoded: value)!
    print(String(data: data, encoding: .ascii))
}
```
<br/>
<samp>              bplist00Ò\u{01}\u{02}\u{03}...</samp>
<br/>
这又是什么？`bplist` 后面接了一串乱码？

天哪，原来这是 [二进制属性列表](https://en.wikipedia.org/wiki/Property_list) 的 [文件签名](https://en.wikipedia.org/wiki/File_format#Magic_number)。

利用 `PropertyListSerialization` 来看看呢...

```swift
if name == "solar" {
    let data = Data(base64Encoded: value)!
    let propertyList = try PropertyListSerialization
                            .propertyList(from: data,
                                          options: [],
                                          format: nil)
    print(propertyList)
}
```

```swift
(
    ap = {
        d = 15;
        l = 0;
    };
    si = (
        {
            a = "-0.3427528387535028";
            i = 0;
            z = "270.9334057827345";
        },
        ...
        {
            a = "-38.04743388682423";
            i = 15;
            z = "53.50908581251309";
        }
    )
)
```

*清晰多了！*

首先有两个一级键：

`ap` 键对应的值是包含 `d` 和 `l` 两个键的字典，它们的值都是整型。

`si` 键对应的值是包含多个字典的数组，字典中有整型，也有浮点型的值。在嵌套的字典中，`i` 最容易理解：它从 0 一直递增到 15，这表示的是图片序列的下标。在没有更多信息的情况下，很难猜测 `a` 与 `z` 的含义，其实它们表示相应图片中太阳的高度（`a`）和方位角（`z`）。

### 计算太阳的位置

就在我落笔之时，身处北半球的人正在进入秋季，白昼变短，气温变低，而南半球的人却经历着白昼变长，气温变高。季节的变化告诉我们，日照的时长取决于你在星球上的位置，以及星球绕太阳的轨道。

可喜的是，天文学家能告诉你 —— 而且相当准确 —— 太阳在天空中的位置或时间。不可贺的是，这其中的计算十分 [复杂](https://en.wikipedia.org/wiki/Position_of_the_Sun)。

但老实讲，我们并不用过分深究它，在网上能找到相关的代码。经过不断的试错，[它们就能为我所用](https://github.com/NSHipster/DynamicDesktop/blob/master/SolarPosition.playground)（欢迎 PR！）：

```swift
import Foundation
import CoreLocation

// 位于加州库比蒂诺的 Apple Park
let location = CLLocation(latitude: 37.3327, longitude: -122.0053)
let time = Date()

let position = solarPosition(for: location, at: time)
let formattedDate = DateFormatter.localizedString(from: time,
                                                    dateStyle: .medium,
                                                    timeStyle: .short)
print("Solar Position on \(formattedDate)")
print("\(position.azimuth)° Az / \(position.elevation)° El")
```

<samp>Solar Position on Oct 1, 2018 at 12:00 180.73470025840783° Az / 49.27482549913847° El</samp>

2018 年 10 月 1 日中午，太阳从南面照射在 Apple Park，大约处于地平线中间，直射头顶。

如果绘制出太阳一天的位置，我们可以得到一个正弦曲线，这不禁让人联想到 Apple Watch 的“太阳表盘”。

![](https://nshipster.com/assets/solar-position-watch-faces-1815d6d3c84f42ff4588fa47cd59841f4de15be2b219f6f4ec9a83e13ea0f08b.jpg)

### 扩展对 XMP 的理解

好吧，天文学到此结束。接下来是一个乏味的过程：*摆在眼前*的 XML 元数据。

还记得之前的元数据键 `hasXMP` 吗？对，就是它没错。

XMP（Extensible Metadata Platform），即可扩展元数据平台，是一种使用元数据标记文件的标准格式。XMP 长什么样呢？请打起精神来：

```swift
let xmpData = CGImageMetadataCreateXMPData(metadata, nil)
let xmp = String(data: xmpData as! Data, encoding: .utf8)!
print(xmp)
```

```xml
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="XMP Core 5.4.0">
   <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <rdf:Description rdf:about=""
            xmlns:apple_desktop="http://ns.apple.com/namespace/1.0/">
         <apple_desktop:solar>
            <!-- (Base64-Encoded Metadata) -->
        </apple_desktop:solar>
      </rdf:Description>
   </rdf:RDF>
</x:xmpmeta>
```

*呕。*

不过也幸好我们检查了一下。之后想要成功自定义 Dynamic Desktop，还得仰仗 `apple_desktop` 命名空间。

既然如此，就开始吧。

## 创建自定义 Dynamic Desktop 

首先，创建一个数据模型来表示 Dynamic Desktop：

```swift
struct DynamicDesktop {
    let images: [Image]

    struct Image {
        let cgImage: CGImage
        let metadata: Metadata

        struct Metadata: Codable {
            let index: Int
            let altitude: Double
            let azimuth: Double

            private enum CodingKeys: String, CodingKey {
                case index = "i"
                case altitude = "a"
                case azimuth = "z"
            }
        }
    }
}
```

如前文所述，每个 Dynamic Desktop 都由一个有序的图片序列构成，每个图片又包含存储在 `CGImage` 对象中的图片数据和元数据。`Metadata` 采用 `Codable` 类型，是为了编译器自动合成相关函数。我们能在生成 Base64 编码的二进制属性列表时感受到它的优势。

### 写入图片目标

首先，创建一个指定输出 URL 的 `CGImageDestination`。文件类型为 `heic`，资源数量即需要包含的图片张数。

```swift
guard let imageDestination = CGImageDestinationCreateWithURL(
                                outputURL as CFURL,
                                AVFileType.heic as CFString,
                                dynamicDesktop.images.count,
                                nil
                             )
else {
    fatalError("Error creating image destination")
}
```

接着，遍历动态桌面对象中的全部图片。通过 `enumerated()` 方法，我们还能获取到当前 `index`，这样就可以在第一张图片上设置图片元数据：

```swift
for (index, image) in dynamicDesktop.images.enumerated() {
    if index == 0 {
        let imageMetadata = CGImageMetadataCreateMutable()
        guard let tag = CGImageMetadataTagCreate(
                            "http://ns.apple.com/namespace/1.0/" as CFString,
                            "apple_desktop" as CFString,
                            "solar" as CFString,
                            .string,
                            try! dynamicDesktop.base64EncodedMetadata() as CFString
                        ),
            CGImageMetadataSetTagWithPath(
                imageMetadata, nil, "xmp:solar" as CFString, tag
            )
        else {
            fatalError("Error creating image metadata")
        }

        CGImageDestinationAddImageAndMetadata(imageDestination,
                                              image.cgImage,
                                              imageMetadata,
                                              nil)
    } else {
        CGImageDestinationAddImage(imageDestination,
                                   image.cgImage,
                                   nil)
    }
}
```

除了较为繁杂的 Core Graphics API 以外，代码可以说非常直观了。唯一需要进一步解释的只有 `CGImageMetadataTagCreate(_:_:_:_:_:)`。

由于图片与元数据容器的结构、代码的表现形式均不同，所以我们不得不为 `DynamicDesktop` 实现 `Encodable` 协议：

```swift
extension DynamicDesktop: Encodable {
    private enum CodingKeys: String, CodingKey {
        case ap, si
    }

    private enum NestedCodingKeys: String, CodingKey {
        case d, l
    }

    func encode(to encoder: Encoder) throws {
        var keyedContainer =
            encoder.container(keyedBy: CodingKeys.self)

        var nestedKeyedContainer =
            keyedContainer.nestedContainer(keyedBy: NestedCodingKeys.self,
                                           forKey: .ap)

        // FIXME：不确定此处 `l` 与 `d` 的含义
        try nestedKeyedContainer.encode(0, forKey: .l)
        try nestedKeyedContainer.encode(self.images.count, forKey: .d)

        var unkeyedContainer =
            keyedContainer.nestedUnkeyedContainer(forKey: .si)
        for image in self.images {
            try unkeyedContainer.encode(image.metadata)
        }
    }
}
```

有了这个，就可以实现之前代码中提到的 `base64EncodedMetadata()` 方法了：

```swift
extension DynamicDesktop {
    func base64EncodedMetadata() throws -> String {
        let encoder = PropertyListEncoder()
        encoder.outputFormat = .binary

        let binaryPropertyListData = try encoder.encode(self)
        return binaryPropertyListData.base64EncodedString()
    }
}
```

当 for-in 循环执行完，也就表明所有图片和元数据均被写入，我们可以调用 `CGImageDestinationFinalize(_:)` 方法终止图片源，并将图片写入磁盘。

```swift
guard CGImageDestinationFinalize(imageDestination) else {
    fatalError("Error finalizing image")
}
```

如果一切顺利，就可以为重新定义 Dynamic Desktop 的自己而感到骄傲了。棒！

<br/>

------

<br/>

我们非常喜欢 Mojave 的 Dynamic Desktop 特性，并且也很欣慰看到它仿佛重现了 Windows 95 壁纸进入主流市场时的辉煌。

如果你也这样想，下面还有些想法可供参考：

### 照片自动生成 Dynamic Desktop

让人振奋的是，天体运动这样高不可攀的研究，竟然可以简化用二元方程来表达：时间与位置。

在之前的例子中，这部分信息都是硬编码的，但其实它们可以通过读取图片数据来自动获取。

默认情况下，绝大部分手机的相机都会捕获拍摄时的 [Exif 元数据](https://en.wikipedia.org/wiki/Exif)。元数据包含了照片拍摄的时间，以及当时设备的 GPS 坐标。

通过读取元数据中的时间与位置信息，能自动获取太阳的位置，那么从一系列图片中生成 Dynamic Desktop 也就顺理成章了。

### iPhone 上的延时摄影 

想要好好利用手上全新的 iPhone Xs 吗？（更确切的说，“在纠结卖不卖旧 iPhone 的时候，可以先用它来做些有创意的事？”）

将手机充上电，摆在窗前，打开相机的延时摄影模式，点击“拍摄”按钮。从最后的视频中选出一些关键帧，就可以制作专属 Dynamic Desktop 了。

当然，你可以看看 [Skyflow](https://itunes.apple.com/us/app/skyflow-time-lapse-shooting/id937208291?mt=8) 这类应用，它能设置时间间隔来拍摄静态图片。

### 通过 GIS 数据打造风景

如果你无法忍受手机一整天不在身边（伤心），又或者没什么标志性景象值得拍摄（依然伤心），你还可以创造一个属于自己的世界（这比现实本身还要令人伤心）。

可以选择用 [Terragen](https://planetside.co.uk/) 这类应用，它打造了一个逼真的 3D 世界，还能对太阳、地球、天空进行微调。

想要更加简化，还可以从美国地质调查局的 [国家地图网站](https://viewer.nationalmap.gov/basic/) 上下载高程地图，以用于 3D 渲染的模板。

### 下载预制的 Dynamic Desktops 

再或者，你每天都非常多的工作要做，抽不出时间捣腾好看的图片，也可以选择付费从别人那里购买。

我个人是 [24 Hour Wallpaper](https://www.jetsoncreative.com/24hourwallpaper) 这款应用的粉丝。如果你有别的推荐，欢迎 [联系我们](https://twitter.com/NSHipster/)。

<br/>

---

### NSMUTABLEHIPSTER

疑问？纠错？欢迎提 [issues](https://github.com/NSHipster/articles/issues) 和 [pull requests](https://github.com/NSHipster/articles/blob/master/2018-10-01-macos-dynamic-desktop.md) —— NSHipster 因你而变得更好。

*本文用的是 Swift 4.2*。关于站内文章的状态信息，可以查看 [状态汇总页面](https://nshipster.com/status/)。
