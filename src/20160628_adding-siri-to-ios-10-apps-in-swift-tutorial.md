title: "使用 Swift 在 iOS 10 中集成 Siri —— SiriKit 教程（Part 1）"
date: 2016-06-28 10:00:00
tags: [Swift 进阶]
categories: [JamesonQuave.com]
permalink: adding-siri-to-ios-10-apps-in-swift-tutorial
keywords: ios sirikit,siri开发
custom_title:  
description: 这次的教程是使用 SiriKit 在 Swift 2.0 开发的工程引入 Siri 功能，感兴趣的来看下吧。

---
原文链接=http://jamesonquave.com/blog/adding-siri-to-ios-10-apps-in-swift-tutorial/
作者=Jameson Quave 
原文日期=2016-06-14
译者=Crystal Sun
校对=Cee
定稿=Channe

<!--此处开始正文-->

**这篇教程写于 2016 年 6 月 13 日，使用 Xcode 8 Beta 1 和 Swift 3.0 toolchain（工具链）。**

### 下载 Xcode 8，配置 iOS 10 和 Swift 3

如果你还没有下载 Xcode 8 Beta 1，请到[这里](https://developer.apple.com/download/)下载。

###（可选）通过命令行编译

除非你想使用命令行编译，使用 Swift 3.0 的工具链并不需要对项目做任何改变。如果你想的话，打开 Xcode-beta，然后从顶部菜单栏中选择 **Xcode > Preferences**，接着选择 **Location**，在页面的底部，你会看到「Command Line Tool」这行设置，请在这里选择 Xcode 8.0。

<!--more-->

现在，在 Terminal 使用命令行找到工程所在的文件夹，调用 `xcodebuild` 命令就可以编译工程了。

###（可选）移植现有的 Swift 2 应用

如果你想对一个已使用 Swift 2.0 开发的工程引入 Siri 功能，需要点击工程，选择 **Build Settings**，在 **Swift Compiler - Version** 下面，找到 **Use Legacy Swift Language Version** 选项，设置成 **No**。这会造成编译器报错，然后你可以根据这些报错信息来修改代码，推荐你使用这个设置来更新代码，以适应 Swift 不断进化的语义。

### 开始使用 SiriKit

首先，在你的 App（或者是新建一个单视图的 Swift 模板工程），点击顶部的工程，然后点击左侧下方的 + 按钮，在这里（译者注：我在这里添加了一张图片，能够说的更明白）点击。

![](http://upload-images.jianshu.io/upload_images/178769-87cdb8568a80e376.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

弹出的窗口中，选择 **iOS > Application Extension**，接着选择 **Intents Extension**。

![](http://jamesonquave.com/blog/wp-content/uploads/siri-1-1.png)

这样就给工程添加了一个新的 intent，用于监听 Siri 的命令。其中的 Product Name 应该和你的工程文件名字相似，比如，你的 App 名为 **MusicMatcher**，你可以把这个 intent 的名字命名为 **MusicMatcherSiriIntent**。一定要选中 **Include UI Extension** 选项，我们之后会用到，这也是添加额外扩展的最简单的方法。

![](http://jamesonquave.com/blog/wp-content/uploads/siri-1-2.png)

我刚刚创建的两个新 target 可以从项目的文件层级上找到。找到 Intent 文件夹下的 **IntentHandler.swift** 文件，看一下这里面的样本代码。默认会提供一些示例代码，允许用户说一下诸如「用 MusicMatcher 开始锻炼」的命令，MusicMatcher 是 App 的名字。

![](http://jamesonquave.com/blog/wp-content/uploads/siri-1-3.png)

### 像这样运行示例应用

这个时候最好编译一下代码，然后在 iOS 真机上试一下命令。继续，编译应用的 target，从 Scheme 下拉菜单里选择 **MusicMatcher**，然后选择真机，点击 Run。

![](http://jamesonquave.com/blog/wp-content/uploads/siri-1-4.png)

你看你会看到一个空白的应用出现，你使用的扩展这时会在后台加载到设备的系统文件里，现在点击 Stop 按钮来关闭应用。

接下来，找到你的 scheme，选择 Intent target，点击 Run。

![](http://jamesonquave.com/blog/wp-content/uploads/siri-1-5.png)

这时会出现一个弹出框，问你需要连接哪个应用，选择你刚刚运行的应用：MusicMatcher。这会让真机上再次出现这个应用（还是一个空白的应用），不过这次调试台（debugger）中会出现连接的 Intent 扩展。

![](http://jamesonquave.com/blog/wp-content/uploads/siri-1-6.png)

现在点击 home 按钮回到首屏，或者应用可能自己就退出了，因为你正在运行的是 Intent，不是应用本身（这不是崩溃！！！）。

### 启用扩展
扩展都已安装就位了，但是作为一个 iOS 用户，仍然需要进行 Siri 设置才能使用扩展。点击测试设备里的 **Settings**，选择 **Siri** 菜单，你会看到 **MusicMatcher** 出现在清单里，激活允许使用 Siri。

### 测试我们第一个 Siri 命令

尝试一下 Siri 命令，长按 Home 键或者说出「Hey Siri」来激活 Siri（当然需要你已经激活「Hey Siri」功能）。

试一下命令，比如「使用 MusicMatcher 开始锻炼」。

#### 「对不起，你需要在应用里继续。」

如果你像我一样遇到了这样的错误信息：「Sorry, you'll need to continue in the app.」（不知道什么原因，偶尔会出现这么一个问题，什么鬼？）

在控制台中你可能会看到类似的信息：

```bash
dyld: Library not loaded: @rpath/libswiftCoreLocation.dylib
  Referenced from: /private/var/containers/Bundle/Application/CC815FA3-EB04-4322-B2BB-8E3F960681A0/LockScreenWidgets.app/PlugIns/JQIntentWithUI.appex/JQIntentWithUI
  Reason: image not found
Program ended with exit code: 1
```

我们还需要在工程里添加 CoreLocation 库，确保能添加到我们编译过的 Swift 工程中。

再次选择工程根目录，选择 **MusicMatcher target**。在 **General** 底下找到 **Linked Frameworks and Libraries**。点击 + 按钮，添加 CoreLocation.framework。现在可以再次编译在真机上运行，接着照着上面相同的步骤再次编译运行 intent target。

最后，从手机桌面激活 Siri。

「Hey Siri！」
「Start my workout using MusicMatcher（使用 MusicMatcher 开始锻炼）」

Siri 这时候应该会回应：「OK. exercise started on MusicMatcher（OK，开始用 MusicMatcher 锻炼身体）」，然后会出现一个 UI 界面写着「Workout Started（锻炼开始）」。

![](http://jamesonquave.com/blog/wp-content/uploads/siri-1-7.png)

### 它是如何工作的呢？

模板中的 IntentHandler 类使用了一长串的协议：

首先最主要的就是 `INExtension`，允许我们一开始就把类当作一个 intent extension 来用。剩下的协议都是 intent handler 类型，在类里能够回调：

```swift
INStartWorkoutIntentHandling
INPauseWorkoutIntentHandling
INResumeWorkoutIntentHandling
INCancelWorkoutIntentHandling
INEndWorkoutIntentHandling
```

第一个就是我们刚刚测试过的，`INStartWorkoutIntentHandling`。

按住 Command 键点击这些协议的名字，会看到苹果提供的文档：

```swift
/*!
 @brief Protocol to declare support for handling an INStartWorkoutIntent 
 @abstract By implementing this protocol, a class can provide logic for resolving, confirming and handling the intent.
 @discussion The minimum requirement for an implementing class is that it should be able to handle the intent. The resolution and confirmation methods are optional. The handling method is always called last, after resolving and confirming the intent.
 */
```

换句话说，这协议告诉 SiriKit 我们准备处理英文句子「Start my workout with *AppName* Here.」

这会根据用户使用语言的不同而不同，不过最终的目的都是开始一次锻炼。`INStartWorkoutIntentHandling` 协议调用的几个方法都在示例代码里实现了。如果你想创建一个锻炼应用，你可以自行了解其他的内容。不过在这篇教程的剩余部分，我会添加一个新的 intent handler，来处理发送消息。

### 添加一个新的消息 Intent

确认应用可以完美运行后，让我们继续，添加一个新的 intent 类型，用于发送消息，[这里](https://developer.apple.com/library/prerelease/content/documentation/Intents/Conceptual/SiriIntegrationGuide/SiriDomains.html)的文档说明了下列信息：

```
Send a message
Handler:INSendMessageIntentHandling protocol
Intent:INSendMessageIntent
Response:INSendMessageIntentResponse
```

在类里添加 `INSendMessageIntentHandling` 协议。首先要明确，我们把它添加到类协议清单里，也就是在 IntentHandler.swift 文件里。由于实际上我不想使用这些 intent，所以我会删除它们，只留下这一个：

```swift
class IntentHandler: INExtension, INSendMessageIntentHandling {
    ...
```

如果这时候编译，是不会通过编译的，因为我们还需要实现一些遵守 `INSendMessageIntentHandling` 协议所必需的方法。

另外，如果你需要核对具体是哪些方法，只需要按住 Command 键然后鼠标点击 `INSendMessageIntentHandling`，然后看一下哪些方法前面没有 `optional` 关键词即可。

在这里，我们发现只有一个必须实现的方法：

```swift
/*!
 @brief handling method
 
 @abstract Execute the task represented by the INSendMessageIntent that's passed in
 @discussion This method is called to actually execute the intent. The app must return a response for this intent.
 
 @param  sendMessageIntent The input intent
 @param  completion The response handling block takes a INSendMessageIntentResponse containing the details of the result of having executed the intent
 
 @see  INSendMessageIntentResponse
 */
public func handle(sendMessage intent: INSendMessageIntent, completion: (INSendMessageIntentResponse) -> Swift.Void)
```

#### 遵守新消息意图协议

回到 IntentHandler.swift 文件，添加一行分隔符（借助 jump bar，在导航查找代码时这个分隔符会非常有用）

```swift
// MARK: - INSendMessageIntentHandling
```

在 MARK 底下，我们来实现方法。我发现 Xcode 8 非常有用，通过敲击方法名字的开始部分，剩下的都能交给自动补全来完成了，然后选择对应的方法。

![](http://jamesonquave.com/blog/wp-content/uploads/siri-1-8.png)

在 handler 里，我们需要创建一个 `INSendMessageIntentResponse`，来回调闭包。先假设所有的信息发送都很成功，在 `INSendMessageIntentResponse` 里返回一个用户活动的成功值，和默认模板中的实现非常类似。还需要添加一个 print 方法，当 handler 方法被 Siri 事件触发后我们就能知晓啦：

```swift
func handle(sendMessage intent: INSendMessageIntent, completion: (INSendMessageIntentResponse) -> Void) {
    print("Message intent is being handled.")
    let userActivity = NSUserActivity(activityType: NSStringFromClass(INSendMessageIntent))
    let response = INSendMessageIntentResponse(code: .success, userActivity: userActivity)
    completion(response)
}
```

#### 把这个 intent 类型添加到 Info.plist

在具备处理 `INSendMessageIntent` 方法之前，我们需要在 Info.plist 文件里添加一些值，就当作是应用的授权吧。

在 **intent** 的 Info.plist 文件里，找到并点开 `NSExtension` 键。接着点开 `NSExtensionAttributes`，然后是 `IntentsSupported`，我们需要给 `INSendMessageIntent` 新添加一行，允许应用处理信息 intents。

![](http://jamesonquave.com/blog/wp-content/uploads/siri-1-9.png)

#### 测试新的 intent

现在我们已经设置好了新的 intent，来测试一下。记住，你必须先编译 App，在真机上运行，接着运行扩展进行调试，如果你不这样做，扩展要么不会工作，要么不会在 Xcode 的控制台中打印日志。

调用 Siri 的 intent，你现在可以看到会出现一个新的信息窗口，这个窗口目前还是空的，毕竟我们还没有给应用编写什么逻辑，我们需要实现剩下的调用，还要添加一些信息的逻辑，实现更好的用户体验。我们会在 [已经发布的 Part 2](http://jamesonquave.com/blog/sirikit-swift-3-resolutions-sirikit-tutorial-part-2/) 里解决这些事情。