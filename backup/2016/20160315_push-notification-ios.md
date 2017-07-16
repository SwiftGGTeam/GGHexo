title: "Swift 通知推送新手指南"
date: 2016-03-15
tags: [Swift 入门,推送通知]
categories: [AppCoda]
permalink: push-notification-ios
keywords: swift通知
custom_title: 
description: Swift推送通知要怎么实现呢，推送一条通知可是需要很多操作才能实现哦，下面本文就来好好说下吧。

---
原文链接=http://www.appcoda.com/push-notification-ios/
作者=Gabriel Theodoropoulos
原文日期=2016-01-27
译者=bestswifter
校对=Channe
定稿=numbbbbb

<!--此处开始正文-->

“推送通知？喔，不！”。是的，这就是我被叫去实现一个 iOS 应用中的推送通知功能时，脑海中闪过的第一念头，而且我相信你们也曾经有过这样的想法。这不是因为推送通知很难使用，而是在能够测试推送一条单独的通知前有很多步操作需要完成，这些操作步骤最终几乎把所有开发者弄得晕头转向。不过我们再坚持一会儿，从头开始把事情想明白。

在应用不在运行时，我们经常需要把用户的注意力吸引过来。正如我们所知道的那样，这可以通过 **通知** 实现。作为一名 iOS 开发者，你应该知道 iOS 支持两种类型的通知：**本地通知**和**推送通知**（或者叫**远程通知**）。在之前的例子中，通知由应用自己 **注册** 并 **管理**，这种通知很容易实现。事实上，你可以在[这里](http://www.appcoda.com/ios-programming-local-notification-tutorial/)和[这里](http://www.appcoda.com/local-notifications-ios8/)找到一些先前介绍本地通知的教程。

<!--more-->

推送通知不是由应用自己预先计划的。它们由另外一个服务（叫做 *Provider*）触发，通常情况下是 web 服务器，这些通知往往同时发往多个设备。有了推送通知，应用开发者可以在需要的时候给用户发送消息，消息既可以在随机的时间点被发送，也可以按计划时间发送，消息主体可以是默认的或自定义的。[维基百科页面](https://en.wikipedia.org/wiki/Apple_Push_Notification_Service)是一份很好的资源，它提供了一些关于苹果推送通知的基本信息。

每一个推送通知由 provider 经过一条强制指定的路径发往一个或多个目标设备。这条路径必须经过 **Apple Push Notification Servers**，或者简称 **APN servers**。实际上，这些服务器会为推送通知规划路径，从而发往正确的设备。通常情况下，消息在由 provider 发送给服务器的几秒钟内，被服务器投递给目标设备。简而言之，远程通知的生命周期可以总结如下：

**Provider >> APN servers >> 目标设备**

我建议你查阅[官方文档](https://developer.apple.com/library/ios/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Chapters/ApplePushService.html)，文档中有很多有用的细节，介绍了推送通知的工作原理。

在应用可以收到推送通知之前有几步配置工作，这些步骤总体上可以被分为两步：编程方面的准备和创建各种证书、描述文件（provisioning profile）等。编程部分很容易，它只是几段必须添加到项目中的标准代码。容易引起混淆的是第二步，这些操作需要在不同的地方被执行，比如 Mac 上的钥匙串访问程序，Xcode 项目和 *Apple Developer Member Center* 网站。

除此以外，远程通知可以被分为两种，一种是 **沙盒** 通知，这种通知可以在开发阶段使用，因此它可以用于调试。另一种是 **实时** 通知，这意味着它只能在产品发布阶段使用。如果你成功的在应用中接收到了沙盒通知，并且正确的执行了此前提到的各种操作，那么就可以放心的认为实时推送通知也可以正常使用了。毫无疑问，Apple 为发送沙盒通知提供了专门的测试服务器，这并不是由生产环境下的 APN 服务器负责的。

这篇教程的目的很简单：我们希望为一个 demo 应用实现推送通知功能，并发送一些沙盒通知以确保通知推送功能正常运行。希望下次你为应用添加推送通知功能时，这篇教程能帮上你。最重要的是，实现推送通知功能事先需要各种繁琐的配置，这篇教程可以指引你走出这种困境。

## 关于 Demo 应用

在正式开始一篇教程之前，我总是会给出一些信息，介绍将要实现的 demo 应用。我经常会提供一个初始项目，不过这次不会。

要想创建这篇教程的 demo，你只需要在 Xcode 中创建一个新的 iOS 项目就可以了。你不需要额外添加任何内容或控制，因为这个项目并非用来测试应用内的功能，它只是作为一个通知推送的目标。

你可以随便给项目起个名字，比如我把它命名为 *PNDemo*。

所以在这一步中，我们创建了一个新的 iOS 项目，我们继续接下来的步骤。

**重要提醒：**

在开始讲解这篇教程的细节概念之前，我必须说明清楚，基于某些会遇到的情况，我做了一些假设。我们约定：

1. 你有一个付费的开发者账户，或者至少能够获取一个这样的账户。
2. 在 Apple Developer Member Center 网站中已经至少有一个 iOS Development Certificate，否则你可以看一看[这篇文章](https://developer.apple.com/library/ios/documentation/IDEs/Conceptual/AppDistributionGuide/MaintainingCertificates/MaintainingCertificates.html#//apple_ref/doc/uid/TP40012582-CH31-SW32)，如果你需要使用 *Code Signing Request (CSR)* 文件，请阅读下一部分内容来学习如何创建它。
3. 你明白我在这篇文章中所说的推送消息仅仅是指 Apple 公司的推送消息。
4. 你明白当我说“苹果开发者网站”时，我其实指的是“Apple Developer Member Center”网站。
5. 你知道通知的载荷（payload）是什么（内容、角标、声音以及其他数据），并且知道如何处理它们。查看[这篇文章](https://developer.apple.com/library/ios/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Chapters/WhatAreRemoteNotif.html)可以复习关于通知的知识。

## 步骤一：证书签名请求文件

既然你已经创建好了 demo 项目，那么暂时先把它搁置一会儿，准备进行整个流程的第一步。我们的目标是创建一个 **Certificate Signing Request (CSR)** 文件，这个文件稍后将被用于创建推送通知的 SSL 证书。

在这一步中，你需要使用 Mac 上的 **钥匙串访问** 应用。你可以使用 Launchpad 或 Spotlight 来找到并打开这个应用。如果你不熟悉这个应用，不要无意中删除任何已有的文件。

打开 **钥匙串访问** 应用后，如下图所示，依次打开这些菜单 **钥匙串访问 > 证书助理 > 从证书颁发机构请求证书**，如下图所示：

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_1_certificate_assistant_menu.png)

在打开的窗口中，你必须填写 **User Email Address** 和 **Common Name**。除此以外，还需要选中 **Saved to disk** 选项，这样你可以把文件保存到磁盘中，这个文件稍后在苹果开发者网站上会用到。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_2_certificate_information.png)

点击 **Continue** ，你可以选择这个 CSR 文件的文件名和存储位置。我把这个教程中创建的所有文件都保存在一个新建的文件夹中(文件夹的名字是 *PNDemo Files*，我希望你也这么做)，CSR 文件名使用的是默认的文件名。

当你看到一条消息，提示你的证书请求文件已经被创建时，点击 **完成** 按钮，然后你就…完成了。我们刚刚申请并保存的这个证书将被用于在苹果开发者网站上为其他证书签名。

## 步骤二： 创建一个 App ID

我们的下一步操作是在苹果开发者网站上创建一个新的 App ID。这个 App ID 是将你的应用和其他应用区分开来的唯一标志，它可以帮助 APN 服务器正确的规划发送通知的路径。实际上，你将会看到我们会把这个 App ID 和其它几样东西关联起来：一个用于推送通知的新证书，一个允许我们在测试设备上运行应用的描述文件。

先完成最重要的事，我们前往 [Apple Developer Member Center](https://developer.apple.com/membercenter/)，输入用户名密码后登陆。然后点击 **Certificates, Identifiers & Profiles** 链接，于是你会跳转到合适的页面。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_3_member_center_options.png)

进入到新的页面后，点击 **iOS Apps** 那一节中的 **Identifiers** 链接。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_4_identifiers_link.png)

你会看到 **App IDs** 选项是事先就选中的(在左侧菜单的 *Identifiers* 目录中)，在主窗口中列出了所有已存在的 App ID 。我们新创建的 App ID 也会被添加到这个列表中，不过首先得点击右上角的加号按钮。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_5_create_app_id_button.png)

现在，我们要为 demo 创建一个新的 App ID，对新手来说，我们需要填写两部分内容：

1. 新 App ID 的描述介绍。在这个例子中，你输入的内容并不是很重要，不过最好还是要做到语言清晰，具有实际意义。
2. 应用的 Bundle ID，你可以直接从 Xcode 项目中复制并粘贴到这里。

你会发现，在这两个值之间还有一个需要设置的值，它叫做 *App ID Prefix*。通常情况下，你不需要修改这里的默认值，但是如果你确实需要选择一个不同的前缀，也别犹豫。在这篇教程中，我选择使用默认值。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_6_app_id_setup_1.png)

在这一步中，你要记住一个很重要的细节：实现通知推送功能需要选择 *explicit App ID*，因为这个 App ID 必须匹配某个具体的 Bundle ID。在这种情况下，苹果不允许我们使用通配的 App ID(以星号 * 结尾的 App ID)。无论应用具有怎样的特点，我个人总是认为使用 explicit App ID 比通配 App ID 更好。这样会让你在 App ID 列表中，很清楚的区分开每一个 App ID。

设置好以上内容后，向下滚动网页到 *App Services* 区域。在所有提供的服务的底部，勾选 *Push Notifications* 选项，在你开始下一个操作前务必反复检查，确保这个选项确实已经被选中。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_7_app_id_setup_2.png)

接下来，点击 **Continue** 按钮并等待确认页面出现。检查所有的信息是否都正确无误，然后点击 **Submit** 按钮提交信息。如果你检查到错误，可以回退到前面的页面，修改任何一个有错的值。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_8_confirm_app_id.png)

在最后一步中，你会看到 **Registration Complete** 页面，只要点击 **Done** 按钮即可，你会看到新的 App ID 已经被添加到 App ID 列表中。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_9_listed_app_id.png)

## 步骤三：配置推送通知的 App ID

注意到没有，尽管此前在创建 App ID 时我们勾选了 **Push Notifications** 服务，但是它在 Development 和 Distribution 模式下都被标记为 *Configurable* 而不是 *Enabled*。这说明我们还需要进行一些额外的操作，将通知推送服务切换到合适的状态。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_10_configurable_state.png)

在这个教程中，我们不会在生产环境中测试推送任何通知，也就是完全不涉及 Distribution 模式。出于这一点考虑，我们只会配置 Development 模式下的推送通知。不过接下来的操作对于 Distribution 模式下的配置完全适用。在一个实际的应用中，你显然需要配置 Distribution 模式，否则在应用上架 App Store 后，推送通知的功能就会失效。

现在，我们点击列表中刚刚创建的 App ID，在展开的服务列表中，点击 **Edit** 按钮进行下一步操作。

向下滑动到 **Push Notifications** 一节，你会发现两个按钮，分别用于创建开发环境和生产环境下的 **SSL 证书**。因为我们只关心 Development 模式，所以点击下图中的第一个按钮：

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_11_create_ssl_certificates.png)

“很久”以前通过钥匙串访问创建的 Certificate Signing Request 文件是时候登场亮相了。接下来，我们首先点击 **Continue** 按钮。如果你还没有创建 CSR 文件，这几条教程会教你如何创建它。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_12_upload_csr_1.png)

接下来，点击 **Choose File…** 按钮并找到你在第一步中创建的 CSR 文件。如果你没有修改文件的默认名字，那么你要找的文件的名字就是 `CertificateSigningRequest.certSigningRequest`。

最后，点击蓝色的 **Generate** 按钮，如下图所示：

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_13_upload_csr_2.png)

棒！你已经成功创建了一个新的证书，它可以在 development（sandbox）模式下推送通知。现在你需要把它下载下来，然后添加到钥匙串（Mac 上的钥匙串访问应用） 中，所以接下来你需要点击 **Download** 按钮。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_14_download_apn_certificate.png)

你刚刚下载的文件名是 `aps_development.cer`。在 Downloads 文件夹中找到它，双击打开这个证书并将它添加到 Keychain Access 的证书列表中。

> 重要提醒： 双击打开 .cer 文件并将它添加到钥匙串访问中时，请确保它被添加到**登录**而不是*系统*或其他钥匙串中。如果加入的钥匙串有错，你只需要把证书拖动到**登录**钥匙串中即可。这对下一步操作很重要。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_15_certificate_in_keychain.png)

把证书添加到 KeyChain 中后，右键点击这个证书，然后选择 **Export “…”** 选项

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_16_export_p12.png)

导出格式要选择成 **.p12** 文件，然后点击 **Save** 按钮。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_17_save_p12.png)

如果你不想设置密码，可以直接点击 **OK** 按钮跳过这一步。如果你设置了密码，那么就要记住它或者把它写在某个地方，否则一旦忘记了密码，这个文件也就没用了。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_18_blank_password.png)

在这个教程中，我们不会用到这个导出的文件。但如果你想在远程服务器上(比如 Parse)测试推送通知功能，你就需要在推送第一条通知以前提供 .p12 格式的文件。所以目前你把这个 .p12 文件和其他文件一起保存着就好。这一步的关键在于你能够意识到开发模式下创建 .p12 文件的方法同样适用于生产环境。

## 步骤四：注册设备

首先，我需要说明这一步仅对测试沙盒模式的推送通知有用，在实际的生产环境下不需要这一步。现在，我们去苹果开发者网站上注册用于测试的设备，如果你曾经注册过设备，也就是列表中可以找到这个设备，那么你可以跳过这一步。

假设你现在是第一次添加设备，首先你需要将物理设备与 Mac 连接，然后在 Xcode 中打开 **Window > Devices** 菜单，在打开的窗口中列出了所有的物理设备和模拟器。

在左侧选择你的设备，你会在主窗口中看到更多细节。注意到其中有一项是 Identifier，它的值是一长串数字和字母，双击选中这个值并复制。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_19_device_identifier.png)

现在，返回苹果开发者网站，点击 **Devices** 目录下的 **All** 选项，所有被注册过的设备都显示在主窗口中。要想新增一个设备，你需要点击右上角带有加号（+）图标的按钮。

在新打开的表格中，首先在 **Name** 文本框中输入设备名称（比如 *Gabriel’s iPhone 6S* 或 *My lovely iPad*）。然后把之前复制的设备的 identifier 填写在 UUID 文本框中，这一步就完成了。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_20_register_device.png)

点击 **Continue** 按钮，在下一步中需要确认所以填写的信息都准确无误。搞定以上这些后，点击 **Register** 按钮完成注册。

你可以验证是否成功的注册了设备，只要再次点击 **Devices** 目录下的 **All** 选项，然后逐条查找你刚刚输入的设备名即可。

## 步骤五：创建开发环境的描述文件

在苹果开发者网站上的最后一个任务是为开发环境创建一个描述文件。它将会用于为应用提供代码签名。注意，在把应用上传到 iTunes Connect 并使用 TestFlight 或上架 App Store 之前，你需要创建发布环境的描述文件（Distribution provisioning profile）。它的使用方法和你将要学到的开发环境的描述文件的使用方法类似。

在苹果开发者网页上，点击 **Provisioning Profiles** 目录下的 **Development** 链接，主窗口中会显示出所有已存在的描述文件。稍后，我们新建的描述文件也会添加到这里。

你可以通过点击右上角的加号（+）按钮创建一个新的描述文件。在新打开的表格中，点击选择 **iOS App Development**选项（第一个选项）。注意，如果你创建的是用于发布应用的描述文件，就应该选择底下第二个区域中的选项（很大可能是 App Store）。

选择了合适的选项后，点击 **Continue** 按钮开始下一步操作。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_21_create_provisioning_1.png)

现在，我们要把这个描述文件与应用对应的 App ID 关联起来。你需要在下拉菜单中查找并选择正确的 App ID。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_22_create_provisioning_2.png)

接下来，你需要把你的 **iOS Development certificate** 导入到描述文件中（假设你至少有一个证书）。如果像下图所示那样，有多个证书并且不确定该选择哪一个，一种简单的方法是勾选 **Select All** 选项导入所有的证书，这一步就完成了。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_23_create_provisioning_3.png)

接下来是选择将要运行应用的设备，请确保没有漏选任何用于测试推送通知的设备。选择好后再次点击 **Continue** 按钮。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_24_create_provisioning_4.png)

最后一步是为描述文件文件命名，将它与其他文件区分开来。我把它叫做 **PNDemo Development Profile**，你可以根据自己的喜好随便起名。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_25_create_provisioning_5.png)

点击 **Generate** 按钮并等待下一个页面出现。当新的描述文件创建完成后，你就可以下载它了。如下图所示：

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_26_download_provisioning.png)

你只需要根据以上这些图片的指示去操作即可，然后双击打开并安装刚刚下载的文件。如果你按照我的方式命名，那么你的文件名会是 **PNDemo\_Development\_Profile.mobileprovision**。

## 步骤六：配置项目

从这一步开始，我们就和苹果开发者网站说再见了。把目光转移到我们的项目上来，这里我们需要完成两个任务：

1. 首先我们要在项目中开启推送通知功能，这样设备才能接收到通知。虽然这是很基础，很简单的一步，但是相信我，很多开发者都会忘记启用推送通知功能。

2. 我们需要正确设置应用的 **code signing** 和 **provisioning profiles**。注意，接下来的操作都会在 Development 模式下进行，我们完全不会涉及生产环境。但是这两者非常类似，所以在应用上线前你可以仿照这里的步骤完成生产环境下的配置。

在 Xcode 中打开应用，选择 Project 导航栏中的项目。请确保你处于 **General** 标签下，然后点击 **Team** 下拉控件，选择正确的 team。

如果你的 **Team** 列表空空如也，那么你得前往 **Xcode > Preferences…** 菜单，在 **Accounts** 标签下新增一个 *Apple ID*。你需要输入正确的用户名和密码并点击 **Add** 按钮完成添加。这一步的细节已经超出了本教程的探讨范围，因此如果你拿不准怎么做，[这个链接](https://developer.apple.com/library/ios/documentation/IDEs/Conceptual/AppStoreDistributionTutorial/AddingYourAccounttoXcode/AddingYourAccounttoXcode.html)中的文章会一步一步指导你。成功添加 Apple ID后，关闭偏好窗口并返回 General 标签，选择合适的 Team。

接下来，点击 **Capabilities** 标签，找到 **Push Notifications** 这一节，你只需要打开开关即可。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_29_enable_pn_xcode.png)

正如截图中的信息所示，一旦启用推送通知功能，在 *Info.plist* 文件中就会自动添加相应的权限。

现在打开 **Build Settings** 标签，找到 **Code Signing** 这一节。展开 **Provisioning Profile** 字段，然后点击 **Debug** 这一行中的 **Automatic**。在展开的列表中有你的开发者账户下所有的描述文件，你需要选择你上一步下载并安装的那一个。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_30_select_provisioning_profile.png)

因为我们没有创建发布应用时用到的描述文件，所以我们无需设置 **Release** 这一行中的值。不过当你在苹果开发者网站上创建并下载发布应用时用到的描述文件后，你需要采取与这里相同的操作。

你可以在描述文件字段上面找到 **Code Signing Identity** 字段。如果它没有展开，你可以点击左侧的箭头展开它。这一步的操作和刚才类似，点击 **Debug** 栏中的默认值 **iOS Developer (或 iPhone Developer)**，然后在弹出的列表中选择合适的身份证明。如下图所示：

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_31_set_identity.png)

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_32_selected_identity.png)

在实际应用中，别忘了在 **Release** 栏中设置 Distribution 模式下的身份证明。

现在，点击 **General** 标签左侧的 *Target* 选项，选择 *Project*：

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_33_select_project.png)

找到 **Code Signing** 这一节，重复之前的步骤。首先选择 **Debug** 模式下的描述文件，然后设置好正确的 **Code Signing Identity**。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_34_code_signing_project.png)

## 步骤七：注册推送通知

到目前为止，项目中的配置都结束了，现在我们需要写几行代码了。首先，我们让应用自身向 iOS 系统注册接收推送通知，并指定我们希望接受的通知的类型（比如**角标**，声音或警告信息）。

事实上，我们会用到上述所有类型的通知，这也是我们的在这一步的切入点。打开 `AppDelegate.swift` 文件，在 `application(_:didFinishLaunchingWithOptions:)` 方法的 `return true` 前面添加下面两行代码：

```swift
func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {
    // Override point for customization after application launch.
 
    let notificationTypes: UIUserNotificationType = [UIUserNotificationType.Alert, UIUserNotificationType.Badge, UIUserNotificationType.Sound]
    let pushNotificationSettings = UIUserNotificationSettings(forTypes: notificationTypes, categories: nil)
 
    return true
}
```

我们首先指定应用中会用到的通知类型，然后创建一个 `UIUserNotificationSettings ` 类型的对象。我们使用这个对象向系统注册推送通知。如果出于某些原因，你不想使用上面这个数组中所有种类的通知，只要删除掉不想要的即可。

现在，我们将这些可能用到的推送通知的类型告知系统，并且注册接收推送通知：

```swift
func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {
    ...
 
    application.registerUserNotificationSettings(pushNotificationSettings)
    application.registerForRemoteNotifications()
 
    return true
}
```

尽管以上几行代码都很重要，但最后一行才是设备能够接收推送通知的关键。这一部分中添加的四行代码是一段标准代码，所以你几乎可以把它们用在你的所有项目中。我是说几乎，因为总会有需要修改通知类型的时候。

## 步骤八：代理方法

注册推送通知是很关键的一步，但这只是我们要做的编程工作的一半。另外一些与编程有关的任务是实现一些代理方法，这样你的应用才能在接收到通知时做出正确响应。我们一个个看这些方法：

首先，我们要实现 `application(_: didRegisterForRemoteNotificationsWithDeviceToken:)` 方法。它在应用成功注册推送通知后调用。通常情况下，第二个参数至关重要，它包含了每个设备独有的一个 key，我们把这个 key 称为 *device token*。在实际使用中，你需要把 *device token* 发送给服务器。这里的服务器是推送消息的最初发起方，它把 *device token* 和其他必要信息发送给 APN 服务器。这就是为什么 APN 服务器能够知道通知的接收者是哪台设备。

Device token 的格式是这样的：< XXXX XXXX XXXX XXXX XXXX >。通常情况下，在发送给服务器之前，你需要对它进行一些格式转换，比如移除 “<" 和 ">”字符或者移除字符串中间的空格。不过最终始终何种格式还是取决于服务器如何处理 device token。一些服务提供商会为你提供框架，以便你集成并处理推送消息（如 Parse），如果你打算使用他们的解决方案，那么框架的使用指南会告诉你如何实现格式转换。

不管怎么说，由于我们在本篇教程中不会使用真正的服务器，你只需要了解以上知识并在实际的应用中进行正确操作即可。目前我们只打算把 device token 输出到控制台中。我们需要知道它的值，这样待会儿才能测试推送通知。下面是我们的实现代码：

```swift
func application(application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: NSData) {
    print("DEVICE TOKEN = \(deviceToken)")
}
```

我们不能确保注册推送通知一定是成功的，这个过程可能因为多种原因而失败。所以，实现下面这个方法也很重要，在这个方法中我们可以处理注册失败的情况：

```swift
func application(application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: NSError) {
    print(error)
}
```

当然，你需要根据应用的逻辑或需求来进行适当的错误处理。

正如你所知，当应用不在前台运行时，推送通知会出现在设备上。但很多时候，应用会在运行时收到推送通知。在这种情况下，作为一名开发者，你需要用适当的方法处理接收到的通知。在 demo 中，我们只是把收到的信息输出到控制台里。但在实际的应用中，你绝对不应该这么做。

下面是对应的代理方法的实现：

```swift
func application(application: UIApplication, didReceiveRemoteNotification userInfo: [NSObject : AnyObject]) {
    print(userInfo)
}
```

你还可以根据应用的具体需求，使用更多的代理方法，不过这就不是本文所讨论的内容了。*UIApplicationDelegate* 协议的文档可以参考[这个链接](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIApplicationDelegate_Protocol/index.html?hl=ar)，你可以从中找到更多有关远程通知的方法。考虑到这篇教程的目的是指导你实现推送通知的功能，了解以上三个代理方法就足够了。

## 步骤九：沙盒模式下推送通知

测试推送通知曾经是一件很麻烦的事，因为这只有一种解决方案。要么从头开始写一个命令行脚本，要么找一份已有的脚本并根据自己的应用和设备进行修改。时至今日，这个方案依然行得通，但在 Mac App Store 上已经出现了一些专门用于测试推送通知的应用。没错，这就是我们将要使用的方案。

使用 Mac 上的应用来测试推送通知的好处在于，它提供了用户界面（GUI）给我们填写必要的数据（比如 device token 或推送通知的证书）。而且这些应用隐藏了“无聊”的编程部分，比如连接到 APN 服务器。实际上，在大多数此类应用中，你只需要指定以下三样东西：

1. 用于接收测试通知的目标设备的 device token；
2. 推送通知证书的保存路径；
3. 推送通知的载荷（消息、角标数字和声音）。

在这个部分中，我会向大家展示两款应用。不过首先要澄清的是：此举完全不是为了推广这些应用。你即将看到的这两款应用，以及 Mac App Store 上其他同类的应用，在我看来是都是可以简化工作、节省时间的简单的工具。基于以上逻辑，我们继续这篇教程，来看看如何成功的推送第一条通知。

第一个要推荐的应用叫 *APN Tester Free*，你可以在[这里](https://itunes.apple.com/us/app/apn-tester-free/id626590577?mt=12)找到它。这是一个免费下载的应用，借助这个应用你可以快速的测试推送通知。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_35_apn_tester_free.png)

如上图所示，你需要把 device token 复制到 **Device Token** 文本框中（不带“<"和">”字符）。你只要运行一次 demo 就可以很容易地在控制台中看到 device token。你应该会看到如下图所示的结果：

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_36_device_token_console.png)

首次运行应用时，系统会询问你是否允许接收远程通知。显然，如果你想要测试接收通知就必须选择允许。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_37_permissions.png)

在 **Payload** 文本框中，你需要填写推送通知的细节内容。比如你希望接收一条消息，显示角标数字并播放默认的声音，你应该这样写：

```swift
{"aps":{"alert":"Hello from AppCoda!","badge":1, "sound": "default"}}
```

若想获取更多有关通知载荷和所有可设置的值的信息，请访问[**官方文档**](https://developer.apple.com/library/mac/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Chapters/TheNotificationPayload.html#//apple_ref/doc/uid/TP40008194-CH107-SW1)。

在填写正确的 **Certificate** 信息时，你需要点击 **Browse** 按钮，在磁盘中查找开发模式下的推送通知证书（这显然是在 **Gateway** 的值被设置为 **Development** 时的操作）。提醒你一下，这个证书的名字应该是 **aps_development.cer**（除非你修改了文件名）。找到证书并导入到应用中后，你会在控制台中看到一条消息，告诉你 .cer 文件已经被成功的加载了。

设置完以上内容后，你就已经准备就绪，可以推送通知了，你要做的仅仅是点击 **Push** 按钮。这时你会在应用的控制台中看到推送通知被发送的消息，如果推送失败，控制台中同样会有红色的文字提示。

如果你按照教程，一步一步的进行操作并且没有漏掉任何步骤，那么你将会收到第一条推送通知

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_38_push_notification_test.png)

你完全可以反复发送通知，这样你可以看到在设备锁屏时、打开通知中心时、甚至是应用运行时等不同情况下，通知是如何出现的。如果在应用运行时收到通知，你会在 Xcode 的控制台中看到如下输出：

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_39_pn_details_xcode.png)

除此以外，你还可以自己修改角标数字，开启或关闭通知的声音。通过这些尝试，你可以确保所有的配置都正确无误。

另一个我打算向你展示的应用是一个叫做 *Easy APNs Provider* 的程序，你可以在[这里](https://itunes.apple.com/us/app/easy-apns-provider-push-notification/id989622350?mt=12)找到它。这是一个免费应用，它有一些额外的选项可供设置，因此你可以尝试设置推送通知更加高级的功能（比如额外的数据）。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_40_easy_apns_provider.png)

使用这个应用时，首先点击 **Add tokens…** 按钮并把 device token 添加到应用中。在弹出的模态视图中，把 token 复制到第一个文本框中，同时务必确保你已经删掉了“<"、">”字符和空格。如果格式有误，token 就无法被添加到应用中。完成这一步后点击 **Add** 按钮，你会看到 device token 已经被添加到窗口的底部。你还可以选择点击 token 的左侧，为它起一个名字，然后点击 **Confirm** 按钮完成。

接下来，点击 **2. Choose Certificate file**按钮，再次找到 **aps_development.cer** 文件并把它导入到应用中。成功导入后你会在按钮的旁边看到证书文件的名字。

确保右下方的下拉控件中被选中的值是：*gateway.sandbox.push.apple.com*，然后点击 **3. Connect to：**按钮。在显示状态的文本框中，你会看到应用已经成功的连接上了 APN 服务器。

现在是时候准备推送通知的载荷了，我们把目光转移到应用窗口的右上角，选择你想测试的选项。为了最好的演示通知效果，你可以选择 *Content*，*badge* 和 *sound* 选项。然后在下面的表格中填写 title，content 和 badge 的值，这里的值可以随意设置。如果你想看到载荷的原始模式（JSON 模式），可以点击 **Raw** 标签，否则就使用当前这种更容易处理的模式。

最后，点击 **5. Send APN** 按钮来发送通知，几秒钟内你的设备就会接收到这个通知。

![](http://www.appcoda.com/wp-content/uploads/2016/01/t48_41_receive_pn_2.png)

正如我在这一步开始的时候所说，你并非只能选择以上这两个工具。你可以去 Mac App Store 中找找其他的软件，它们或许能够更好的实现你的需求。

## 总结

在这篇教程中，我们经历了很多步骤，执行了许多不同的操作。如果你读到了这里，并且成功的在沙盒模式下推送了通知，那么你完全有理由相信在实际应用中，实时通知推送也会正常工作。你只需要遵循文中列出的操作指南，将它们应用于 Distribution 模式并且补上文中没有处理的部分即可。举个例子吧，你需要编辑你的 App ID 并创建发布应用时用到的 SSL 证书，还需要创建 Distribution 模式下的描述文件，当然还得在项目的 Build Settings 中使用合适的代码签名。无论如何，我都希望本文能够帮助你理清思路，弄清楚配置通知推送的步骤，最终帮助你更快的完成任务。下回再见！
