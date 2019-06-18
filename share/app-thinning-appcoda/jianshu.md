如何使用 iOS 9 App 瘦身功能"

> 作者：gregg mojica，[原文链接](http://www.appcoda.com/app-thinning/)，原文日期：2015-10-11
> 译者：[JackAlan](http://alanmelody.com/)；校对：[lfb_CD](http://weibo.com/lfbWb)；定稿：[numbbbbb](http://numbbbbb.com/)
  









**更新**: iOS 9 有个 bug 影响 APP 瘦身功能，这个 bug 在 iOS 9.0.2 被修复。从 AppStore 下载 App 时请留意。

iOS 9 已经变成了一个大[热门](http://techcrunch.com/2015/09/21/apple-announces-50-ios-9-adoption-and-iphone-6s-launch-day-specifics/)。发布几周后，这个新的操作系统在 iOS 设备上的安装量就超过了一半。它的普及率打破了 iOS 7 在 2013 年的记录。

在写完上一篇文章之后 [Search APIs and SFSafariViewController in iOS 9](http://www.appcoda.com/search-api-sfsafariviewcontroller/)，我们继续学习如何使用 App 瘦身这个 iOS 9 中令人兴奋的特性。在此教程中，我们将探索为什么要使用 App 瘦身以及如何在自己的 App 中使用这个令人兴奋的新特性。



![](http://www.appcoda.com/wp-content/uploads/2015/09/app-thinning-1024x682.png)

在本次 WWDC 中公布的 App 瘦身是一个令人兴奋的新技术，这会改变整个下载的过程。由于蜂窝流量消费大、iOS 设备内存限制以及网络提速，App 瘦身是一个值得学习的至关重要的特性。进一步来说，因为 App 瘦身被推迟(稍后详述)，这也是一个绝好的时机去了解这个令人兴奋的技术。

## 预备知识

在这篇教程中，我假设你知道如何使用 Xcode 和 IDE。如果这对你来说很陌生，或者你根本不知道 IDE 是什么，你应该先看一下[excellent free course](http://www.appcoda.com/ios-programming-course/).

我还假设你已经知道如何在 AppStore 上或者 TestFlight (苹果 beta 版 App 测试服务)上发布 App。我不会具体到讲述如何用 TestFlight，所以如果你对 TestFlight 很陌生或者对 App 发布流程很陌生，我建议你先读阅读[AppCoda article](http://www.appcoda.com/testflight-beta-testing/)。这些就足够了，不需要其他预备知识，只要用心学习就好！

有了这样的想法，那就让我们开始吧。

## App 瘦身简介

![](http://www.appcoda.com/wp-content/uploads/2015/09/apple_app_slicing_illustration-516x300.jpg)

当前市场上存在大量的 iOS 设备，因此有多种屏幕尺寸和分辨率，要想保证一个 App 在多种屏幕下的展示效果需要大量的资源(比如 png、jpeg 以及二进制的 PDF)。不幸的是，这导致用户需要下载一个巨大的程序包(之前的 iOS 版本强制用户下载全部 App 文件，包括他们在用 iPhone 时永远也不会用到的 iPad 适配图片)。16G 的 iPhone 仍然有不少人在用(并且可能短时间内不会消失)，所以你要缩小 App 体积从而可以快速下载并且保证用户有足够的空间。App 瘦身特性让这一切成为可能。

除了代码和图片，现在的 App 还包括可执行代码以及32位、64位版本(针对各种架构进行优化，比如 arm64、arm7S 和 arm7)、3D 图形技术(例如 OpenGL、Metal 等)、声音和其他文件。总之，现在的 App 已经复杂到令人难以置信。这就是 App 瘦身需要解决的问题。

App 瘦身会自动检测用户设备类型(比如型号名称)，并为特定的设备下载相关内容。换句话来说，如果你使用 iPad Mini 1(没有视网膜屏，只有 1X 的分辨率)，那么只有 1X 的文件会被下载。更强大更清晰的资源(比如 iPad Mini 3 或 4)将不会下载。因为用户只需要下载他/她需要用到的内容，这加速了下载过程，并节省了设备上的空间。

虽然这起初可能听起来很复杂，我们将深入到具体的细节。幸运的是，Xcode 和 AppStore 会完成这项工作的绝大部分，开发者会轻松很多。因此，在本教程中不会有太多的代码，而是重点关注理解 App 瘦身的过程和它用到的技术。

App 瘦身有三个主要方面，应用程序切片(`App Slicing`)、中间代码(`Bitcode`)和按需加载资源(`On Demand Resources`)。在本教程中，我们将一一介绍。

![](http://www.appcoda.com/wp-content/uploads/2015/09/13196-7761-150609-Developer-2-l-545x300.jpg)

## 应用程序切片(App Slicing)

App瘦身第一个我们要讨论的就是切片(slicing)。根据苹果的文档，

> 切片是创建和提供不同的目标设备的应用程序包的变体(`variant`)的过程。

一个变体(`variant`)只包含可执行架构和目标设备所需要的资源。换句话来说，应用程序切片只提供给与每个设备相关的资源(取决于屏幕分辨率和架构等等)。实际上，应用程序切片完成了 App 瘦身的大部分工作。

假设你已准备好提交 App，和之前一样，你会上传 .IPA 或者 .App 文件到 iTunes Connect(但是必须使用 Xcode7，因为它包含支持 App 瘦身的 iOS 9 SDK)。然后 AppStore 会对 App 进行切片，创建特定的变体(`variant`)，这些变体将根据功能(`capabilities`)分发给每个设备，。

![](http://www.appcoda.com/wp-content/uploads/2015/09/slicing.png)

## 按需加载资源(On Demand Resources)

为了完全理解 App 瘦身，你需要了解什么是按需加载资源(`ODR`)。 按需加载的资源就是在 App 初次安装后需要下载的文件。例如，游戏的特定关卡(以及和这些关卡相关的内容)只有在玩家解锁时才可以下载。此外，超过设置时间之后，玩家不需要的早期关卡可以被移除，以节省设备的存储空间。

在 Xcode 的设置中(在 Build Setting 里)，开启按需加载资源需要把"Enable On Demand Resources"改为"YES".

![](http://www.appcoda.com/wp-content/uploads/2015/09/Screen-Shot-2015-09-28-at-3.53.20-PM.png)

## 中间代码(Bitcode)

App 瘦身的最后一个内容是中间代码。中间代码有点抽象，但在本质上，它是在 App 被下载前，苹果优化它的新途径。中间代码使得 App 可以在任何设备上尽可能快速和高效执行。中间代码可以为最近使用的编译器自动编译 App，并且对特定的架构做优化(例如 arm64 64 位处理器，如 iPhone6s 和 iPad Air 2)。

中间代码会和上文提到的其他瘦身技巧一起使用，去除针对其他架构的优化内容，只下载需要的优化内容，从而减少下载文件的大小。

在 iOS 中，中间代码是一种新特性，并且在新的工程中需要手动开启。这个过程可以在 Build Setting 下把 Enable bitcode 修改为 YES。

![](http://www.appcoda.com/wp-content/uploads/2015/09/Screen-Shot-2015-09-28-at-3.50.06-PM.png)

## 在你的项目中使用 App 瘦身

尽管 Xcode 和 App Store 处理了 App 瘦身的绝大多数流程，你仍然需要采取一定的预防措施以确保你的 App 真的使用了这种新的技术。首要的，你必须使用资源目录(`asset catalogs`).在这一点上，大多数的 App 默认使用资源目录(`asset catalogs`)。如果你还没有用采用资源目录(`asset catalogs`)，你现有的大部分内容可以被转移到一个目录下，只需要在 Xcode的项目设置中点击"Use Asset Catalog"按钮，如下所示。

![](http://www.appcoda.com/wp-content/uploads/2015/09/Screen-Shot-2015-09-28-at-7.59.13-PM1.png)

Xcode 的新特性之一就是`Sprite Atlases`。Sprite Atlases 基本上结合使用资源目录和 SpriteKit(Xcode 中开发 2D 游戏用到的技术)。同样的，如果你是用 SpriteKit，App 瘦身是必须的。

## 测试 App 瘦身

如你所见，Xcode 和苹果的 AppStore 已经处理了绝大多数 App 瘦身的过程，这样在你自己的 App 中使用这个技术会容易很多。但是如何测试你的 App 并且确保它已经应用了 App 瘦身？幸运的是苹果的 TestFlight 提供了完美的解决方案。除 AppStore 的应用瘦身技术外，TestFlight 的用户也可以体验这个特性。

在本篇教程的第二部分，我们会介绍如何在 TestFlight 中使用 App 瘦身。

首先，下载这个[基本空白的项目](https://github.com/AlanMelody/AppThinning)，解压，并且在 Xcode 中运行，你将会注意到这个项目基本没有什么除了在资源目录(`asset catalogs`)中的一系列的图片(以及少量的代码)。这个资源目录(`asset catalogs`) 也包含 1x、2x和3x 版本的 App 图标。

![](http://www.appcoda.com/wp-content/uploads/2015/09/Screen-Shot-2015-09-28-at-9.00.47-PM-1024x239.png)

首先，在模拟器或者真机上运行这个 App。打开设置应用，点击`存储和 iCloud 使用`这一项(如果不是 iOS 9 设备，点`存储`) 并选择管理存储空间。向下滑动到我们刚刚编译好的 App 并点击它。你会注意到它大概有 17.0 MB(当上传至 iTunes Connect 时这个大小可能略有不同)。

![](http://www.appcoda.com/wp-content/uploads/2015/09/IMG_0106-2.png)

当你使用 Xcode 构建并运行一个 App 时，Xcode 不会自动处理 App 变体(`variant`)并对 App 瘦身，因此整个 App 文件都在你的设备上。

下一步，在 Xcode 中单击`Product`标签，选择`Archive`.

![](http://www.appcoda.com/wp-content/uploads/2015/09/Screen-Shot-2015-09-28-at-8.36.26-PM-1024x345.png)

> 注意，你可能首先需要修改这个 App 的`Bundle Identifier`以匹配一个你自己创建的标识符。否则，这个 App 将不会被上传到 iTunes Connect.

![](http://www.appcoda.com/wp-content/uploads/2015/09/appthinnning-1024x390.png)

确保你在点击"Submit"前，选择了"Include bitcode"。如果一切顺利的话，你将会看到一个绿色对号通知你这次构建已经被上传。

现在登录到[iTunes Connect](https://itunesconnect.apple.com)，创建一个新的 App(包含合适的 bundle ID、App 名字等等)。如果你不确定如何做这项工作，请参阅[AppCoda TestFlight tutorial](http://www.appcoda.com/testflight-beta-testing/).

![](http://www.appcoda.com/wp-content/uploads/2015/09/iTunes-Connect-App-Thinning-1024x483.png)

把你自己添加为内部测试人员。注意，一次构建保持“正在处理中”这个状态几小时是很寻常的。一旦这个 App 处理完成，选择它并且按下开始测试按钮。

一封电子邮件将会被发送到你的地址。确保你正在使用想要测试的 iOS 设备，打开这封电子邮件。你将会进入 TestFlight 应用。

![](http://www.appcoda.com/wp-content/uploads/2015/09/Untitled.png)

安装此次构建，一旦完成安装，就回到设置应用中，找到存储，像此前一样找到这个 App。注意，这个 App 现在接近 5.4 MB。这就是 App 瘦身的意义。

![](http://www.appcoda.com/wp-content/uploads/2015/09/IMG_0108.png)

哇哦！你刚刚从你的 App 中剔除掉了 12.4 MB - 并且这只是一个非常简单的 App。那些包含多种不同的资源(`asset`)的 App 效果更好。

## 总结

在本篇教程，我们看到了 App 瘦身的强大。我们讨论了 App 瘦身的三个主要的方面：应用程序切片(`App Slicing`)、中间代码(`Bitcode`)和按需加载资源(`On Demand Resources`).

不幸的是，2015 年 9 月 24 日，苹果在它的开发者门户宣布 App 瘦身已经被延迟，并且不会包含在 iOS 9(或者 9.0.1)公开发行版中：

> 应用程序切片目前不可用于 iOS 9 应用，因为 iCloud 创建 iOS 9 备份有问题，AppStore 中的一些 App 只能还原到相同型号的 iOS 设备。

> 当用户下载你的 iOS 9 应用时，他们会获取通用版本，而不是针对他们的设备类型的特定变体(`vatiant`)。TestFlight 将会给内部测试用户继续分发变体(`vatiant`). 应用程序切片将会在未来的软件更新中可以使用。现在你什么都不用做。

然而，就像我在文章的一开始中提到的，App 瘦身已经被修复并且已经为所有运行 iOS 9.0.2 的设备准备就绪。App 瘦身是一个简直不可思议的工具，它将会持续加速 App 下载。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。