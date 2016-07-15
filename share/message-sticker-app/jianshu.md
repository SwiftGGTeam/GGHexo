使用 Xcode 8 为 iMessage 创建表情包插件"

> 作者：SIMON NG，[原文链接](http://www.appcoda.com/message-sticker-app/)，原文日期：2016-06-20
> 译者：[小袋子](http://daizi.me)；校对：[Cee](https://github.com/Cee)；定稿：[Channe](http://www.jianshu.com/users/7a07113a6597/latest_articles)
  









WWDC 2016 上最重磅的消息之一就是在 iOS 10 中引入了 Message 框架。开发者现在可以为苹果内置的 Messages 应用开发扩展啦。通过开发一个应用扩展，你可以让用户跟应用在 Messages 应用中交互。例如，你可以开发一个 Message Sticker Extension 允许用户跟朋友交流时发送表情贴纸。如果你已经开发了一个图片编辑的应用，那么你可以开发一个扩展，这样用户就可以在 Messages 应用内部编辑图片了。扩展的支持为很多应用开发者提供了大量的机会。苹果甚至为 iMessage 引入了 App Store，所以你可以在商店内售卖专门为 iMessage 开发的应用扩展。



为 Messages 开发一个应用扩展，你需要使用新的 Message 框架。这个框架支持以下两种类型的扩展：

- Sticker packs（注：表情包）
- iMessage apps
 
在这个教程里，我将会教你如何通过这个框架开发一个 sticker pack。而之后，我们将会稍微深入地了解下如何开发一个 iMessage app。

无论你要开发什么样类型的扩展，首先你需要使用 Xcode 8。在我写这篇文章的时候，Xcode 8 还是测试版。如果你还没安装工具，可以从 [这里下载](https://developer.apple.com/xcode/) 并安装到你的电脑上。即使你已经安装了 Xcode 7，你仍然可以保留当前的版本并且安装新的 Xcode。

在继续下一步之前，我必须夸一下苹果，因为他让 sticker pack 的开发非常简单。即使你不会任何 Swift 编程经验，你也能够创建你自己的 sticker pack，因为你不需要写一行代码。跟着这篇教程学会如何创建一个 Sticker Extension。

### 创建一个 Sticker Pack 项目

首先，打开 Xcode 8 然后创建一个新的项目。Xcode 8 已经为 Message Extension 准备了几个项目模板。如果是 sticker pack，选择 iOS > Application > Sticker Pack Application.

![](http://swiftgg-main.b0.upaiyun.com/img/message-sticker-app-1.png)

然后，输入项目名称。在这个项目里，我使用 CuteSticker ，但是你可以使用任何你喜欢的名称。

![](http://swiftgg-main.b0.upaiyun.com/img/message-sticker-app-2.png)

### 为 Sticker Pack 添加图片

一旦你创建了项目，你将会在 project navigator 里看到两个文件。点击 Stickers.xcstickers 然后选择 Sticker Pack 文件夹，这是存放图片文件的地方。如果你想做 demo 你可以下载这个图片包，或者使用你自己的图片。但是请注意图片必须是 PNG（首选）、APNG、GIF 或者 JPG 格式，并且大小不超过 500KB。

假设你已经下载了[我们的图片包](https://github.com/appcoda/iMessageSticker/blob/master/Resources/StickerPack.zip?raw=true)，在 Finder 里面解压。然后选择所有的图片，并将他们拖到 Sticker Pack 文件夹。

![](http://swiftgg-main.b0.upaiyun.com/img/message-sticker-app-3.png)

> 声明：这个图片表是由 [pixeden.com](http://www.pixeden.com/conceptual-vectors/halloween-vector-art-pack-vol2) 提供的。

此外，你还可以随意地选择 sticker 的尺寸。选择 Sticker Pack 文件夹，然后选择 Attributes inspector。sticker 的默认尺寸为 `Medium`，你可以改为 `Small` 或 `Large`。在这个 demo 里面，我只是用了默认设置。

![](http://swiftgg-main.b0.upaiyun.com/img/message-sticker-app-4.png)

### 添加应用图标

最后，你的表情包必须有一个应用图片。同样滴，由于是 demo，我已经准备了样例应用图标，你可以在这里下载。如果你想要创建自己的图片，确保你准备好了不同尺寸的图标：

 - Messages App Store：1024×768 points (@1x)
 - Messages：27×20 points (@1x, @2x, @3x)
 - Messages：32×24 points (@1x, @2x, @3x)
 - iPhone/iPad 设定：29×29 points (@1x, @2x, @3x)
 - Messages（iPhone）：60×45 points (@2x, @3x)
 - Messages（iPad）：67×50 points (@1x, @2x)
 - Message（iPad Pro）：74×55 points (@2x)

为了简化图片准备工作，你可以从苹果官网下载 [iMessage App Icon 模板](https://developer.apple.com/ios/human-interface-guidelines/resources/) 。

在你下载完我们的 [演示应用图标包](https://github.com/appcoda/iMessageSticker/blob/master/Resources/cutesticker-appicon.zip?raw=true) 后，解压并将所有图标拖到 iMessage App Icon 下。

![](http://swiftgg-main.b0.upaiyun.com/img/message-sticker-app-5.png)

### 测试 Sticker Pack

好了！现在你已经为 Message 创建了一个表情包了，是时候来测试了。你不需要一台 iOS 10 设备去测试，Xcode 提供了内置的模拟器来测试 iMessage 应用扩展。选择一个模拟器设备（如：iPhone 6）然后点击 Run 按钮开始测试。

由于 Sticker pack 是一个应用扩展，所以你可以把它当做一个独立的应用，并且必须运行在 Message 应用里面。所以当 Xcode 询问你选择哪个应用来运行时，选择 Message 应用。然后点击 Run。

当模拟器登录完了， Message 将会直接打开。点击扩展按钮，你可以找到你的 sticker pack。如果你点击左下菜单，将会显示你的 Sticker pack，当然这也是内置的。

![](http://swiftgg-main.b0.upaiyun.com/img/message-sticker-app-6.png)

在模拟器里，Message 有两个模拟用户，选择一个表情发送，然后回到 messageuser2，你可以看到 messageuser1 发送的表情。

![](http://swiftgg-main.b0.upaiyun.com/img/message-sticker-app-7.png)

### 使用动画图片来自增强 Sticker Pack

你不仅仅可以在 Sticker Pack 里面绑定静态图片，并且可以让你简单地添加动态图片到表情包里。如果你已经有一些 [像这样的](http://giphy.com/gifs/transparent-dancing-happy-A9rJJcBbu1ah2) GIF 或者 APNG 图，简单地添加图片到表情包里。Xcode 将会识别并展示动画。

![](http://swiftgg-main.b0.upaiyun.com/img/message-sticker-app-8.gif)

创建动图的另外一个替代方案是创建一个 sticker 序列。回到你的 sticker pack，在任意空白处右击，选择 Add Assets > New Sticker Sequence。这个将会创建一个让你添加图片队列的 sticker 序列。

作为示例，你可以下载 [这个图片包](https://github.com/appcoda/iMessageSticker/blob/master/Resources/animation_images.zip?raw=true)。解压并添加到 sticker 序列。Xcode 允许你在 sticker pack 的右边预览动画。

![](http://swiftgg-main.b0.upaiyun.com/img/message-sticker-app-9.gif)

### 总结

你已经学会了如何在 Message 应用内使用 Xcode 8 创建一个应用扩展。正如你所见，你不需要写哪怕一行代码去创建一个 sticker pack。你仅需要做的就是准备好图片（动态或者静态），然后就可以开始制作表情包啦。

同时，Xcode 8 和 iOS 10 仍然是测试版。你还不能将你的 sticker pack 上传到 Message App Store。但是这是你开始创建属于你自己的表情包的绝佳时机。当 iOS 10 正式发布好了，你就掌握了先机。

Sticker pack 只是 iMessage 应用的一种扩展。在下一篇的教程里，我们将会学习如何去创建一种更复杂的 Message 扩展。敬请关注。

作为参考，你可以从这里下载 [完整的 Xcode 项目](https://github.com/appcoda/iMessageSticker)。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。