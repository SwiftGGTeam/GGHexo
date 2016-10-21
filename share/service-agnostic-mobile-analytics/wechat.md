与服务器无关的移动端分析"

> 作者：Joe，[原文链接](http://dev.iachieved.it/iachievedit/service-agnostic-mobile-analytics/)，原文日期：2016/04/12
> 译者：[Cwift](http://blog.csdn.net/cg1991130)；校对：[walkingway](http://chengway.in/)；定稿：[CMB](https://github.com/chenmingbiao)
  









移动应用分析是指捕获并分析用户在使用应用时产生的用户行为。当然，完整的应用分析包括了操作系统、桌面应用、web应用等等，移动应用分析只是其中的一个分支。直到今年早些时候，[Parse](http://blog.parse.com/announcements/moving-on/) 还是一个流行的云平台，用于捕获和显示移动应用程序的使用数据。

从 Prase 的突然离开给我们上了一课。首先，对于从事软件开发超过一年的人来说，不应该感到奇怪，*没有什么是永恒的*。所以，事情发生了改变。第二个教训可能是，你曾经经历过因为平台不断改动引发的愤怒（或者疼痛），那么为什么不抽象出一些底层的操作，并且让这些操作在将来更容易被更改呢？我们已经从前人的经验中学习，准备应用到移动分析上，让应用更加的“面向未来”。



## 协议

关于何为协议，苹果的[官方文档](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Protocols.html)给出了一个简洁定义：*为适配某些特定任务或功能，规划出的由方法、属性和其他要求组成的蓝图*。下面是一些所有记录器都应该提供的基础方法：

* 记录后台的打印信息
* 记录事件
* 用数据字典记录事件

当然，在不同的分析平台上你可以发现各式各样的特性，不过我们希望至少有以上三类关键数据。一个完美的协议定义如下：

    
    import Foundation
     
    protocol AnalyticsEventLogger {
      
      func initialize()
      func logEvent(name:String)
      func logEvent(name:String, data:AnyObject)
      
    }

就协议 AnalyticsEventLogger 本身而言不做任何事情，它只是一个蓝图。我们需要一个具体的分析框架来完成工作。

## Amplitude

当我们思考如何从 Parse 上迁移 Bondi 时，[Amplitude](https://amplitude.com/home-2)是我们遇到的第一个移动分析服务。它通过『一个记录事件的简单 API』实现了直截了当（并且免费）的注册流程。AnalyticsEventLogger 协议的实现起来也非常简单：

    
    class AmplitudeEventLogger : AnalyticsEventLogger {
      
      func initialize() {
        Amplitude.instance().initializeApiKey(AmplitudeApplicationKey)
      }
      
      func logEvent(name:String) {
        Amplitude.instance().logEvent(name)
      }
      
      func logEvent(name:String, data:AnyObject) {
        Amplitude.instance().logEvent(name, withEventProperties: data as! [NSObject : AnyObject])
      }
     
    }

## CleverTap

CleverTap 是另一个移动分析平台，提供快捷的注册和记录服务。不过说实话在应用中集成 CleverTap SDK 的步骤有些繁琐。我们很快就意识到了问题所在，但为了完整起见，依旧列出这个基于 CleverTap 实现的事件日志工具样式：

    
    import Foundation
    
    class CleverTapEventLogger : AnalyticsEventLogger {
      
      func initialize() {
        CleverTap.changeCredentials(withAccountID: accountID, andToken: accountToken)
      }
      
      func logEvent(name:String) {
        CleverTap.sharedInstance().recordEvent(name)
      }
      
      func logEvent(name:String, data:AnyObject) {
        CleverTap.sharedInstance().recordEvent(name, withProps: data as! [NSObject:AnyObject])
      }
    
    }

需要注意的关键点是，*协议* 掌控着方法：

* initialize()
* logEvent(name:String)
* logEvent(name:String, data:AnyObject)

基于 Amplitude 的事件日志工具在底层实现中使用了 Amplitude SDK 中的方法。基于 CleverTap 的协议实现将使用 CleverTap SDK 提供的方法。

**注意：**许多移动分析平台提供了更丰富的方法。比如，其中一些平台提供了用户在屏幕上触摸的热图分析。我们的目标不是构建一个能涵盖所有移动分析功能的协议，而是着力于筛选出那些最有用的功能。

# 示例应用

我们已经快速搭建了一个示例应用，允许你使用 Amplitude 或者 CleverTap 来实现事件日志工具的功能。下面的部分将通过演示引导你在程序的适当地方插入 API 密钥。不过，为了让程序跑起来，你需要在网上注册这些服务。

事件记录器本身是 AppDelegate 中的 eventLogger 实例。

    
    class AppDelegate: UIResponder, UIApplicationDelegate {
      var window: UIWindow?
      var eventLogger:AnalyticsEventLogger = AmplitudeEventLogger()
    
      func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {
    
        eventLogger.initialize()
        eventLogger.logEvent(AnalyticsStartEvent)
        
        return true
      }
    
      // Additional routines
    }

上面的代码中声明了一个名为 eventLogger 的类实例，该实例的上下文是协议 AnalyticsEventLogger。实际的实例将会是一个 AmplitudeEventLogger，这个类被声明在 AmplitudeEventLogger.swift 文件中。如果你想要使用 CleverTap，只需要简单地替换声明部分即可。

    
    var eventLogger:AnalyticsEventLogger = CleverTapEventLogger()

实际上，你甚至不需要声明变量的类型（AnalyticsEventLogger）。Swift 的编译器能够推断出来。

## 获取代码

在终端上输入 `git clone git@bitbucket.org:iachievedit/mobileanalytics.git` 可以从 BitBucket 上得到示例应用的源代码。在 Xcode 中打开 appname.xcodeproj。

![](http://dev.iachieved.it/iachievedit/wp-content/uploads/2016/04/appname_xcodeproj.png)
appname Project

## 项目的基础

示例项目中需要回顾的关键性文件如下：

* AnalyticsEventLogger.swift – 这个文件中包含了我们的 AnalyticsEventLogger 协议，所有的事件日志工具都需要遵守这个协议。
* AmplitudeEventLogger.swift – 使用 Amplitude 服务实现的 AnalyticsEventLogger 协议
* CleverTapEventLogger.swift – 使用 CleverTap 服务实现的 AnalyticsEventLogger 协议
* ViewController.swift – 在示例应用中，当我们按下屏幕上的那些按钮时，会打印对应的事件的分析。这些点击事件对应的 IBAction 被定义在控制器当中
* ApiKeys.swift - 这个文件中包含了一个实例，用来从一个 .plist 文件中提取 API 密钥。具体的实现细节将在将会在接下来的章节 **API 密钥** 中详细讲解。

## API 密钥

大多数情况下，不代表全部，分析平台会让你使用一个单独的应用密钥或者使用用户账号标识符和应用密钥的组合。这方面 Amplitude 和 CleverTap 没有什么不同。示例应用使用了[属性列表](https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/PropertyLists/Introduction/Introduction.html)来[管理 API 密钥](http://dev.iachieved.it/iachievedit/using-property-lists-for-api-keys-in-swift-applications/)。如果你*还没有*注册任何一个服务，请跳到专门讲解 Amplitude 或者 CleverTap 注册流程的章节为你的应用进行注册。

注意上面的 ApiKeys.plist 文件是红色的。这意味着这个文件不存在，所以你需要创建一个这样的文件，然后向其中添加你所选择的移动分析服务商密钥。为了能在 Amplitude 和 CleverTap 之间切换，你还需要同时保存二者的账户和 API 密钥。可以通过下面的说明来了解，或者使用最初的模板工程尝试一下其他的服务，比如 [Flurry](https://login.flurry.com) 或者 [AppAnalytics](http://appanalytics.io)。

使用 Xcode 的  **File – New – File** 来创建一个 ApiKeys.plist 文件，然后选中 **iOS Resource**，选择 **Property List** 模板。点击 **Next** 并且把文件命名为 ApiKeys.plist，确定对话框中勾选了将其添加到应用的 Target 中的选项。

为你想要在工程中引用的每一个 API 创建密钥，比如 AmplitudeDevelopmentApplicationKey。如果你一直在使用这个示例工程并且使用了 Amplitude 和 CleverTap，你的 ApiKeys.plist 看上去应该是下面这样：

![](http://dev.iachieved.it/iachievedit/wp-content/uploads/2016/04/ApiKeys_plist.png)

ApiKeys.plist

一旦 API 密钥就位，更新 AppDelegate 文件，选择你需要的日志工具，然后在真机或者模拟器上运行程序。

![](http://dev.iachieved.it/iachievedit/wp-content/uploads/2016/04/appname.png)

Logging Events

点击 **Like**，**DisLike** 等，按钮会调用移动分析的日志方法（见 ViewController.swift 文件）。在 Donate（捐赠） 按钮的情境中，日志方法将包含捐赠的数量。

## Amplitude 入门

**注意：**这是一个有关如何注册 Amplitude 的简单介绍，并不涵盖所有的功能。
首先，你需要在 Amplitude 的[注册页](https://amplitude.com/signup)上注册。填写所有需要的信息（姓名、电子邮件等），然后你会看到 **欢迎来到 Amplitude** 的对话框。

![](http://dev.iachieved.it/iachievedit/wp-content/uploads/2016/04/AmplitudeAnalytics.png)

点击 **Let's Go** 按钮，创建你的第一个应用。我们在组织一栏填写 iAchieved.it LLC  ，应用名一栏填写 **Appname Development***。开发版本和应用版本的应用会有不同的密钥。

![](http://dev.iachieved.it/iachievedit/wp-content/uploads/2016/04/SetupOrganizationAndApp.png)

点击 **Continue**并且选择 iOS SDK，然后点击 **I’m Ready to Install**。Amplitude 将会展示一个 Amplitude SDK 的安装页面，该页面提供了诸如如何下载 iOS SDK 、向工程中导入 SQLite 时应如何更新 build settings 的一系列说明，然后还展示了一个调用服务的 Objective C 示例。我们热衷于在应用中使用 Swift 语言，所以在这一步时点击 [Download the source code](https://github.com/amplitude/Amplitude-iOS/archive/master.zip) 链接下载 Amplitude 源码。解压下载得到的文件夹。

示例应用已经包含了 Amplitude SDK，但是如果你在使用一个新建的项目，把 Amplitude 子文件夹拖拽到工程目录中。确定你勾选了 **Copy items if needed** 和 **Create groups**，当然还要确定 application target 也是选中的。

![](http://dev.iachieved.it/iachievedit/wp-content/uploads/2016/04/AddingAmplitude.png)

AddingAmplitude

回到 Amplitude 的门户页，你可以点击 **Install Amplitude SDK** 页面的 **Continue** 按钮，然后点击 **Done**，当提示邀请成员加入你的团队时，选择 **Skip**。

## 添加附加框架

向你的 Xcode 工程中添加以下框架：

* libsqlite.tbd

可以通过下面的步骤轻松地增加框架：进入工程的 target 目录下，选择 Build Phases，来到  Link Binary With Libraries 功能区，然后点击 + 按钮选择框架。

## 添加桥接头文件

在 iAchieved.it，自 Swift 诞生之日起我们就在使用这门语言，并且从未放弃。如果你也正在使用 Swift 构建你的工程，为了访问 Amplitude 的 API 你需要在工程中添加一个桥接头文件。桥接头文件很容易添加。首先，使用 **File – New – File**，选择 **iOS Source**，然后找到 **Header file** 图标。把文件命名为 bridgingHeader.h。

接下来，在应用的 target 中点击 **Build Settings**，在搜索框中输入 bridging，你将看到下面的页面：

![](http://dev.iachieved.it/iachievedit/wp-content/uploads/2016/04/bridgingheader.png)

双击 **Objective-C Bridging Header** 一栏，在对话框中输入 $(SRCROOT)/bridgingHeader.h。$(SRCROOT) 会被映射到你程序的根目录。

现在，在 bridgingHeader.h 文件中输入一行代码：`#import "Amplitude.h"`。

## API 证书

应用需要的 API 证书可以从 Amplitude 轻松获得。在网站门户页，点击右上角的 account e-mail，然后在下拉菜单中选择 **Account Settings**。

![](http://dev.iachieved.it/iachievedit/wp-content/uploads/2016/04/AmplitudeApiKeys.png)

Amplitude API Keys

在我们的示例应用中，我们使用 .plist 方法保存 API 的密钥，所以拿到对应的密钥并加入到 ApiKeys.plist 文件中。或者你可以打开 AmplitudeEventLogger.swift 文件，把 API 密钥直接增加到 Amplitude.instance.initializeApiKey 方法中。

## CleverTap 入门

**注意：**这是一个有关如何注册 CleverTap 的简单介绍，并不涵盖所有的功能。
我们发现 CleverTap 使用起来不像 Amplitude 那样直观。然而，它不需要信用卡就可以上手，这样你可以在考虑购买之前先试用一段时间。

按照标题找到 CleverTap 的[注册页面](https://clevertap.com/sign-up/)，填写所需的信息。你将收到一封激活的邮件，其中会包含一个完成注册的链接。产看电子邮件并点击 **Complete your signup** 按钮。

![](http://dev.iachieved.it/iachievedit/wp-content/uploads/2016/04/WelcomeToCleverTap.png)
点击 **Add my first app** 按钮你会看到下面的页面：

![](http://dev.iachieved.it/iachievedit/wp-content/uploads/2016/04/AddYourApp2.png)

Add Your App

请注意， CleverTap 自动为你的应用创建了一个 **TEST** 环境。坦白说，我不太喜欢这个特性，因为它在猜测你的环境命名。使用 Amplitude 的时候，可以自己管理应用的开发、升级以及发布版本，而 CleverTap 则简单地假设你有一个 **TEST** 的应用版本。

点击 **Add My App**。你需要在屏幕上选择你所要进行开发的平台（Android版，iOS版，Windows等），并且提交你的应用在应用商店中的 URL。选择 iOS，然后点击 **Skip URL**。

这里遇到的 CleverTap 的整合命令并不像想象中的那么简单。建议跳过整合的步骤，然后按照下面的操作步骤整合：

## 获取 CleverTap 的 iOS SDK

CleverTap iOS SDK 的下载链接可以从 [iOS SDK 的集成页面](https://support.clevertap.com/integration/ios-sdk/)中找到。选择下载 Xcode 7 或者 Xcode 6 的版本，在你下载得到的文件夹中你将看到一个 CleverTapSDK-v2.0.10-20160405.framework.zip 文件。解压该文件，将得到一个单独的 framework 文件 CleverTapSDK.framework。拖拽 CleverTapSDK.framework 到你的工程中，确保选中了Copy items if necessary 和 Create groups 选项。当然你也会把它添加到你应用的 target 中。

## 添加附加的框架

添加如下所示的框架到你的 Xcode 工程中：

* SystemConfiguration
* CoreTelephony
* Security
* UIKit
* CoreLocation

## 添加一个桥接头文件（如果你在使用Swift的话）

和 Amplitude一样，如果你在使用 Swift 语言，你需要添加一个桥接头文件。详情请参考添加头文件的快速指南。在 bridgingHeader.h 文件中增加一行：`#import <CleverTapSDK/CleverTap.h>`。

## API 证书

CleverTap 尽力让自己的 API 密钥足够简单。可以调用一个名为 autoIntegrate 的方法，该方法会通过 CleverTap 的后台“注册一切”。autoIntegrate 方法没有参数，它与下面的步骤紧密关联：

![](http://dev.iachieved.it/iachievedit/wp-content/uploads/2016/04/cleverTapCredentials.png)

CleverTap Autointegrate

它明确提示要向“你的 .plist 文件”中增加两个密钥 CleverTapAccountID 和 CleverTapToken。一个针对 Info.plist 文件的假设是，如果你在管理一个测试版的应用和一个常规版本的应用，根据条件切换 .plist 文件是令人烦恼的。所以，相比于使用 autoIntegrate 方法，你应该使用 `changeCredentials(withAccountID:andToken)` 方法。这个方法会跳过原本的自动集成以及使用 .plist 文件管理 API 密钥的方式。因此你可以使用下面的方法：

    
    let accountID    = valueForAPIKey(named:"CleverTapDevelopmentAccountID")
    let accountToken = valueForAPIKey(named:"CleverTapDevelopmentAccountToken")
    CleverTap.changeCredentials(withAccountID: accountID, andToken: accountToken)

**注意：** valueForAPIKey 示例来自于我们使用属性列表管理 API 密钥的方式，不过使用 valueForAPIKey 的方式你可以决定密钥的名字。

## 结束前的思考

软件开发者是一群有趣的生物。当可以使用一门新的语言或者框架时，我们经常重写一些东西，但是当这种改变是强制性的时候却不一定会关心这些变化。对于所开发的“系统”，期望它可扩展并且能够适应未来的需求。我们开发的与服务端无关的事件日志系统遵循了这种方法的精神，但是即使如此仍须明白，未来的移动分析平台会提供新的特性与功能，如果要使用这些功能，你必须适配这些功能。换言之，这里使用的方法绝不是故事的结尾，每当有新的服务需要评估的时候，我们必须时刻准备着对不再适应需求的代码区域进行返工。即使如此，当你因为这样或那样的原因（特别喜欢的 API 被[弃用](https://allseeing-i.com/asihttprequest/)了，[代码对你来说不够 Swifty](https://github.com/AFNetworking/AFNetworking)，要么就像 Parse 那样走到了生命尽头）而体会到了修改 API 的痛苦时，你可能会考虑使用一个基于协议的方法，在当前所使用的服务和其他服务之间充当一个填充的中间层。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。