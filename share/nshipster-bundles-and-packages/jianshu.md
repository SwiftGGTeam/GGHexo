Bundles and Packages"

> 作者：Mattt，[原文链接](https://nshipster.com/bundles-and-packages/)，原文日期：2018-12-17
> 译者：[WAMaker](https://github.com/WAMaker)；校对：[numbbbbb](http://numbbbbb.com/)，[BigNerdCoding](https://bignerdcoding.com/)；定稿：[Forelax](http://forelax.space)
  










在这个给予的季节，让我们停下脚步，思考一个现代计算机系统赐予我们的最棒的礼物：抽象。

在数百万 CPU 晶体管、SSD 扇区和 LCD 像素共同协作下，全球数十亿人能够日常使用计算机和移动设备而对此全然不知。这一切都应归功于像文件，目录，应用和文档这样的抽象。

这周的 NSHipster，我们将讨论苹果平台上两个重要的抽象：包与包裹。🎁



---

尽管是不同的概念，包与包裹这两个术语经常会被替换使用。毫无疑问，造成困惑的部分原因出自它们相似的名称，但或许主要原因是许多包恰好也是包裹（反之亦然）。

在我们深入之前，先定义一下这两个术语：
* 包是指具有已知结构的，包含可执行代码，以及代码所需的资源的目录。
* 包裹是指在访达中看起来像是文件的目录。

下图展示了包与包裹之间的关系，将应用、框架包、插件包和文档分别放入一个或多个分类之中：
![diagram](http://swift.gg/img/articles/nshipster-bundles-and-packages/packages-and-bundles-diagram-a604d818c7decc7430fffc8642f0743728d2f6be4dfae15b274a599655cd3e40.svg1563524952.9887984)

> 如果对两者的区别你依然感到困惑，这个类比或许能帮助你理解：
> 把包裹想象成是一个内容被隐藏的盒子（📦），作为一个独立的实体而存在。这点与包不同，包更像是一个背包（🎒） —— 每一款都有特殊的口袋和隔层用来携带你需要的东西，不同的配置用以决定是带去学校，去工作，还是去健身房。如果某样东西既是包也是包裹，恰似行李（🧳）一般：像盒子一样浑然一体，像背包一样分隔自如。

## 包（Bundles）
包为代码和资源的组织提供了特定结构，意在**提升开发者的体验**。这个结构不仅允许预测性的加载代码和资源，同时也支持类似于本地化这样的系统性特性。

包分属于以下三个类别，每一种都有它自己特殊的结构和要求：
- **应用包（App Bundles）**：包含一个能被启动的可执行文件，一个描述可执行文件的 `Info.plist` 文件，应用图标，启动图片，能被可执行文件调用的接口文件，字符串文件，以及数据文件。
- **框架包（Framework Bundles）**：包含动态分享库所需要的代码和资源。
- **可加载包（Loadable Bundles）**：类似于插件，包含扩展应用功能的可执行代码和资源。

### 访问包内容
对于应用，playgrounds，以及其它你感兴趣的包来说，都能通过 `Bundle.main` 进行访问。大多数情况，可以使用 `url(forResource:withExtension:)`（或它的一种变体）来获取特定资源的路径。

举例来说，如果应用中包含了一个名叫 `Photo.jpg` 的文件，用下面的方法能获得访问它的 URL：
    
    Bundle.main.url(forResource: "Photo", withExtension: "jpg")

> 如果使用 Asset Catalog，你可以从媒体库（<kbd>⇧</kbd><kbd>⌘</kbd><kbd>M</kbd>）拖拽到编辑器来创建图像。

除此之外，`Bundle` 提供了一些实例方法和变量来获取标准包内容的位置，返回 URL 或 String 类型的路径：

|URL|Path|描述|
|----|----|----|----|
|executableURL|executablePath|可执行文件|
|url(forAuxiliaryExecutable:)|path(forAuxiliaryExecutable:)|辅助的可执行文件|
|resourceURL|resourcePath|包含资源的子目录|
|sharedFrameworksURL|sharedFrameworksPath|包含共享框架的子目录|
|privateFrameworksURL|privateFrameworksPath|包含私有框架的子目录|
|builtInPlugInsURL|builtInPlugInsPath|包含插件的子目录|
|sharedSupportURL|sharedSupportPath|包含共享支援文件的子目录|
|appStoreReceiptURL||App Store 的收据|

### 获取应用信息
所有的应用包都必须有一个包含应用信息的 `Info.plist` 文件。

`bundleURL` 和 `bundleIdentifier` 这样的原数据能够通过 bundle 实例被直接访问。
    
    import Foundation
    
    let bundle = Bundle.main
    
    bundle.bundleURL        // "/path/to/Example.app"
    bundle.bundleIdentifier // "com.nshipster.example"

通过下标能从 `infoDictionary` 变量获得其他信息（如果信息要展示给用户，请使用 `localizedInfoDictionary`）。
    
    bundle.infoDictionary["CFBundleName"] // "Example"
    bundle.localizedInfoDictionary["CFBundleName"] // "Esempio" (`it_IT` locale)

### 获取本地化字符串
包的存在让本地化变得容易。强制本地化资源的存放位置后，系统便能将加载哪个版本的文件的逻辑从开发者层面抽象出来。

举个例子，包负责加载应用的本地化字符串。使用 `localizedString(forKey:value:table:)` 方法就可以获取到这些值。
    
    import Foundation
    
    let bundle = Bundle.main
    bundle.localizedString(forKey: "Hello, %@",
                           value: "Hello, ${username}",
                           table: nil)


然而，通常来说用 `NSLocalizedString` 会更好，像 `genstrings` 这样的工具能够自动取出键和注释到 `.strings` 文件中便于翻译。
    // Terminal
    $ find . \( -name "*.swift" !           \ # 找出所有 swift 文件
                ! -path "./Carthage/*"      \ # 无视 Carthage 与 CocoaPods 的依赖
                ! -path "./Pods/*"
             \)    |                        \
      tr '\n' '\0' |                        \ # 替换分隔符
      xargs -0 genstrings -o .              \ # 处理带空格的路径
    
    NSLocalizedString("Hello, %@", comment: "Hello, ${username}")

## 包裹（Packages）
包裹把相关资源封装和加固成一个独立单元，意在**提升用户体验**。

满足以下任意一个条件，目录就会被访达认为是包裹：
- 目录有类似于 `.app`，`.playground` 或 `.plugin` 等特殊扩展。
- 目录有一个被一个应用注册作为文档类型的扩展。
- 目录具有有扩展属性，将其指定为包裹。

### 访问包裹中的内容
在访达中，右键展示选中项目的可操作目录。如果选中项目是包裹，“打开”操作下会出现“显示包内容”选项。
![](http://swift.gg/img/articles/nshipster-bundles-and-packages/show-package-contents-c7cc72f58a573cb2fbe349e6f76a4ef29d14fbada3cd9b8376fc37979da16bf3.png1563524953.1915808)

点击这个选项会从包裹目录打开一个新的访达窗口。

当然，也可以通过代码访问包裹中的内容。包裹的类型决定了获取内容的最佳方式：
- 如果包裹有包的结构，前文所说的 `Bundle` 就能轻松胜任。
- 如果包裹是一个文档，在 macOS 上使用 `NSDocument` 或在 iOS 上使用 `UIDocument` 来访问。
- 其他情况下，用 `FileWrapper` 导航目录，文件和符号链接，用 `FileHandler` 来读写文件描述。

### 判断一个目录是否是包裹
虽说是由访达决定如何展示文件和目录，大多数的判断会被代理给操作系统以及管理统一类型标识（UTI）的服务。

如果想要确定一个文件扩展是一个内置系统包裹类型，还是一个被已安装的应用使用的文档类型，调用 Core Services 方法 `UTTypeCreatePreferredIdentifierForTag(_:_:_:)` 与 `UTTypeConformsTo(_:_:)` 能满足你的需求：
    
    import Foundation
    import CoreServices
    
    func directoryIsPackage(_ url: URL) -> Bool {
        let filenameExtension: CFString = url.pathExtension as NSString
        guard let uti = UTTypeCreatePreferredIdentifierForTag(
                            kUTTagClassFilenameExtension,
                            filenameExtension, nil
                        )?.takeRetainedValue()
        else {
            return false
        }
    
        return UTTypeConformsTo(uti, kUTTypePackage)
    }
    
    let xcode = URL(fileURLWithPath: "/Applications/Xcode.app")
    directoryIsPackage(xcode) // true

> 我们找不到任何描述如何设置所谓的包裹比特（package bit）的文档，但根据 [CarbonCore/Finder.h](https://opensource.apple.com/source/CarbonHeaders/CarbonHeaders-8A428/Finder.h)，在 `com.apple.FindlerInfo` 扩展参数中设置 `kHasBundle（0x2000）` 标示能够实现：
>     > $ xattr -wx com.apple.FinderInfo /path/to/package \
    >  00 00 00 00 00 00 00 00 20 00 00 00 00 00 00 00 \
    >  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
    >

---

正如我们看到的那样，并非只有终端用户从抽象中获益 —— 无论是像 Swift 这样的高级编程语言的安全性和表现力，还是像 Foundation 这样的 API 的便利性，作为开发者也可以利用抽象开发出优秀的软件。

或许我们会抱怨 [抽象泄漏](https://en.wikipedia.org/wiki/Leaky_abstraction) 与 [抽象反转](https://en.wikipedia.org/wiki/Abstraction_inversion) 带来的问题，但重要的是退一步，了解我们每天处理多少有用的抽象，以及它们带给了我们多少可能性。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。