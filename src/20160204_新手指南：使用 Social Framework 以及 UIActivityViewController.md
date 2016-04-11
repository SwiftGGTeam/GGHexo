title: "新手指南：使用 Social Framework 以及 UIActivityViewController"
date: 2016-02-04
tags: [iOS 开发]
categories: [AppCoda]
permalink: social-framework-introduction
keywords: social framework,uiactivityviewcontroller
custom_title: 
description: 在iOS的SDK开发中怎么使用Social Framework和UIActivityViewController呢，不会的来看本教材吧。

---
原文链接=http://www.appcoda.com/social-framework-introduction/
作者=GABRIEL THEODOROPOULOS
原文日期=2015-09-14
译者=&nbsp
校对=Cee
定稿=Channe

<!--此处开始正文-->

在你即将完成一个大型应用时，或者老板、用户找到你时，你才意识到这个应用还缺少一个重要功能：将内容发布到 Facebook 或 Twitter。面临死线，深呼一口气，你花费了无数的小时坐在电脑前去集成 Facebook 或 Twitter 的 SDK，但是最后发现要实现这个功能实在是太难了，或者几乎是不可能实现。这时，你该怎么办呢？可能是时候考虑找一些借口告诉老板或者客户并不准备递交这个 App 了。着急的满头大汗或者不知所措？或者，是否有一种能够简单快捷的方法能让你的应用在短时间内集成分享功能呢？

<!--more-->

亲爱的读者，上面我说的这种糟糕的情况希望你们没有遇到过。不过确实存在一种完美快捷的方法来解决这个问题。事实上，这种解决方法被称为 **Social** framework，它被内置于 iOS 的 SDK 中。也许你们好多人已经使用过这个框架；但是，我猜现在依然有一大部分的开发人员还没有注意到这个框架，更不知道使用这个框架能够在几分钟内就可以把分享功能集成到你的 App 中。

正如我们所了解的，Apple 很久之前就提供了这个内置的分享到 FaceBook 和 Twitter 的方法。很显然，集成基本分享功能非常简单，但是想要集成一些高级功能则需要使用其他合适的 SDK。在本教程中，我们关注的是使用最基本的方法，更确切的说，我们关注的是如何在我们的应用中使用默认的内置发送功能去进行分享。下面的 demo 里，我们仅仅使用了 Social framework 默认的发送控制器，剩下的 iOS 系统会帮我们处理。我们也不会去处理类似于登录、获取权限、自定义视图等这些细节问题。简单来说，我们将使用系统提供的「黑盒」，并且在它上面添加一些代码。

接下来，我们将讨论一个特殊的视图控制器：**UIActivityViewController**。你也许没听说过，但是一定看到过：

![](http://www.appcoda.com/wp-content/uploads/2015/08/t42_1_activityVCSimulator.png)

使用这个控制器，不仅可以使用内置的分享选项，也可以使用一些其他的功能，如发邮件、短信、打印等。事实上，所弹出的选项会基于你所要分享的内容，但是这个控制器却又非常容易掌握。相信我，毫不夸张的说，把它集成到你的 App 中不会超过两行代码，一会你就会见证这个过程。

如果你很想看看上述工作是如何实现的，并且想在你的下一个 App 中使用，那么，继续往下读，跟着我们去发现这是一个简单而实用的功能。在这里我并不是想突出 iOS 8 中功能「新」的特点，而是为了告诉所有开发人员值得关注这些新功能所带来的巨大的灵活性。那么，让我们开始吧。

### 小觑 Demo

教程中创建的示例程序非常简单。仅包含一个视图控制器（我们保留了 Xcode 默认自动创建的那个），并且这个控制器包含了两部分：包含了一个 bar button item 的 toolBar，以及其正下方的 textView。我们假想这是一个记笔记的应用的其中一部分：提供了一个 textView 去编写文本，然后发布到 FaceBook 和 Twitter。整个视图控制器如下图所示：

![](http://www.appcoda.com/wp-content/uploads/2015/08/t42_2_demo_app_sample.png)

点击 toolBar 上的 bar button item 后会弹出一个 *action sheet*，并给我们显示三个选项：

1. Share on Facebook
2. Share on Twitter
3. More

对于上面的前两项我们将使用 Social framework 实现：弹出 iOS 内置的 *Compose view controller* 去写一些文字，然后发送出去。第三个选项，我们会显示一个 `UIActivityViewController`，上边的两项也能在这里找到。

![](http://www.appcoda.com/wp-content/uploads/2015/08/t42_3_demo_app_sample_2.png)

下一个截图展示了分享文字到 Twitter 时，iOS 内置默认的 Compose view controller 的样子：

![](http://www.appcoda.com/wp-content/uploads/2015/08/t42_4_twitter_post.png)

还有一点我必须要提到的就是：在运行程序之前，必须在你的设备的设置选项中登录 Facebook 或者 Twitter。接下来，我会展示如何操作，但是现在你得有个印象。当然，在我们的代码中我会考虑到用户没有登录的情况，并且显示恰当的信息。过一会儿所有的一切都会实现。

你也意识到了这不是一个复杂的程序，所以这次我也不会提供一个初始项目。我们将在五分钟内使用 Social framework 做好准备工作并且添加分享选项。对于那些想直接阅读如何实现并且测试示例程序的读者，你可以选择跳到教程的最后直接去下载示例代码。

### 创建 App 和 UI

让我们运行 Xcode 来创建一个工程。创建的时候，确保设置或者选中了以下选项：

+ 创建一个 Single-View Application
+ 命名为 *EasyShare*（也可以选择其他的名称）
+ 选择 Swift 作为项目开发语言
+ 选择 iPhone 作为 App 的目标设备

一旦在 Xcode 中准备好了项目启动的部分，直接打开 Interface Builder 来设置我们仅有的一个场景。首先在顶部、紧贴着状态栏的正下方的地方（Y = 20）添加一个 `toolBar`。你也可以为 toolBar 设置一个颜色。在 demo 中使用的颜色是 `#F39C12`。然后，在 toolBar 右侧一个 `bar button item`，在 Attributes Inspector 中可以把 button item 的样式设置为 `Action`，并且设置其颜色为白色。

下一步，在对象库（控件选择栏）中选择一个 `textview` 添加到视图中。设置如下的 frame：

+ X = 10
+ Y = 74
+ Width = 580
+ Height = 300

下面我们会添加为 textview 添加边框和圆角效果，不过现在做到这已经可以了。不要忘记删除了 textview 中默认提供的「Lorem ipsum」文字。

现在我们来添加**约束（constraints）**。由于我们添加的子视图足够的简单，因此添加约束也是相当容易。直接添加就可以了，不过有时可能会遇到约束冲突的情况，下面的截图展示了我添加的约束。对于 toolbar 的约束：

![](http://www.appcoda.com/wp-content/uploads/2015/08/t42_5_constraints_toolbar.png)

对于 textview 的约束：

![](http://www.appcoda.com/wp-content/uploads/2015/08/t42_6_constraints_textview.png)

最终看上去应该像这样：

![](http://www.appcoda.com/wp-content/uploads/2015/08/t42_7_scene_ib.png)

现在是时候创建并且连接 `IBOutlet` 属性到 textview 上了，同时在 bar button item 上绑定 `IBAction` 方法。在 `ViewController.swift` 这个文件中的最上面添加如下代码：

```swift
@IBOutlet weak var noteTextview: UITextView!
```

然后将其连接到 textview 上。同样地将 IBAction 方法连接到 bar button item 上：

```swift
@IBAction func showShareOptions(sender: AnyObject) {
}
```

之后我们的很多的工作都会在这个方法中完成，但是目前我们先做到这。

我们已经完成了一些最基本的代码，现在我们在 `ViewController` 中添加一个自定义方法为 textview 添加边框和圆角效果：

```swift
func configureNoteTextView() {
    noteTextview.layer.cornerRadius = 8.0
    noteTextview.layer.borderColor = UIColor(white: 0.75, alpha: 0.5).CGColor
    noteTextview.layer.borderWidth = 1.2
}
```

第一行代码是产生圆角效果，下面两行分别是设置边框的颜色和边框的宽度。

在 `viewDidLoad()` 方法中进行调用：

```swift
override func viewDidLoad() {
    super.viewDidLoad()

    configureNoteTextView()
}
```

最后，我们在工程中添加即将要使用到的框架（Social framework）。在工程导航栏中单击工程，然后选择 General 选项，滚动到 **Linked Frameworks and Libraries**，点击加号按钮（+），在弹出的窗口中输入「social」进行搜索，选中添加：

![](http://www.appcoda.com/wp-content/uploads/2015/08/t42_8_select_framework.png)

添加成功后，Linked Frameworks and Libraries 中会显示 `Social.framework`，结果如下图：

![](http://www.appcoda.com/wp-content/uploads/2015/08/t42_9_linked_framework.png)

最后一步，在 `ViewController.swift` 的最上面添加：

```swift
import Social
```

现在我们的准备工作已经完成了，等下会添加具体的分享功能。你可以先运行一下程序，运行的结果应该如下所示：

![](http://www.appcoda.com/wp-content/uploads/2015/08/t42_2_demo_app_sample.png)

### 显示分享选项

在示例程序中，当点击 bar button item 后，我们所提供的所有分享的选项会在一个 `action sheet` 中显示。所以我们先来实现 `showShareOptions(_:)` 的 IBAction 方法。下面的截图展示了完成后的效果：

![](http://www.appcoda.com/wp-content/uploads/2015/08/t42_3_demo_app_sample_2.png)

让我们开始吧。首先，我们需要考虑到键盘。当 textview 处于编辑状态的时候，如果点击 bar button item，在弹出 action sheet 之前需要隐藏键盘：

```swift
@IBAction func showShareOptions(sender: AnyObject) {
    // Dismiss the keyboard if it's visible.
    if noteTextview.isFirstResponder() {
        noteTextview.resignFirstResponder()
    }
}
```

现在我们需要初始化一个新的 `alert controller` 并且将它设置为 action sheet：

```swift
@IBAction func showShareOptions(sender: AnyObject) {
    ...
 
    let actionSheet = UIAlertController(title: "", message: "Share your Note", preferredStyle: UIAlertControllerStyle.ActionSheet)
}
```

正如你所看到的截屏一样，在我们的 action sheet 中我们需要显示三个样式相同的选项。然而，不要忘记为用户提供一个可以取消 action sheet 的选项。所以，我们一共需要四个选项，代码如下：

```swift
@IBAction func showShareOptions(sender: AnyObject) {
    ...
 
    // Configure a new action for sharing the note in Twitter.
    let tweetAction = UIAlertAction(title: "Share on Twitter", style: UIAlertActionStyle.Default) { (action) -> Void in
 
    }
 
    // Configure a new action to share on Facebook.
    let facebookPostAction = UIAlertAction(title: "Share on Facebook", style: UIAlertActionStyle.Default) { (action) -> Void in
 
    }
 
    // Configure a new action to show the UIActivityViewController
    let moreAction = UIAlertAction(title: "More", style: UIAlertActionStyle.Default) { (action) -> Void in
 
    }
 
    let dismissAction = UIAlertAction(title: "Close", style: UIAlertActionStyle.Cancel) { (action) -> Void in
 
    }
 
    actionSheet.addAction(tweetAction)
    actionSheet.addAction(facebookPostAction)
    actionSheet.addAction(moreAction)
    actionSheet.addAction(dismissAction)
 
    presentViewController(actionSheet, animated: true, completion: nil)
}
```

这就是全部的代码内容了。最后我们已经成功的显示了 action sheet。现在你可以运行程序然后点击 bar button item 去显示 action sheet。但是现在没有实现业务逻辑，所以无法正常工作。在下一部分，我们会逐渐完成缺失的代码让我们的程序可以分享到 Twitter，然后是 Facebook。

### Tweet，Tweet

上面我已经提到了，如果用户想要发送推文到社交网络上的话，需要先登录对应的账号。对于代码的逻辑来说，这就意味着在弹出发送视图之前，我们首先要检查用户是否已经登录了对应的账号。如果登录了就去正常显示；反之就要展示一个自定义的警告视图去提醒用户。

我们首先实现发送到 Twitter 这个功能。我们需要检查用户是否已经登录的 Twitter 的账号。下面的是实现 `tweetAction` 弹出警告视图的代码：

```swift
let tweetAction = UIAlertAction(title: "Share on Twitter", style: UIAlertActionStyle.Default) { (action) -> Void in
    // Check if sharing to Twitter is possible.
    if SLComposeViewController.isAvailableForServiceType(SLServiceTypeTwitter) {
 
    }
    else {
        self.showAlertMessage("You are not logged in to your Twitter account.")
    }
}
```

正如你在上面代码片段中看到的那样，`SLComposeViewController` 中的 `isAvailableForServiceType(_:)` 这个类方法可以检查用户是否登录的对应的账号，相对应返回的结果为 `true` 或 `false`。这个方法需要传入一个和我们需要关心的社交平台所相关的 string 值。Apple 已经为不同的分享方式提供了指定的 string 值，你可以输入 `SLServiceTyp` 就会有自动提示：

![](http://www.appcoda.com/wp-content/uploads/2015/08/t42_10_service_types.png)

在条件判断的 `else` 部分会注意到我们调用了一个叫做 `showAlertMessage(_:)` 的函数去提醒用户他还未登录。但是这个方法现在没有写完，在这一部分的最后我们会实现这个方法。我必须要指出的是尽管这个 alert controller 使用了我们所传递的信息作为其显示的内容，但是为了我们代码的逻辑更加得清晰，我们最好避免编写完全一样的代码。换言之，检查用户是否登录了 Facebook 也会复用这段逻辑。

让我们继续，现在我们需要初始化一个 `SLComposeViewController` 的实例。这个默认的控制器能让我们编辑需要分享的内容以及提供我们想要的「Post」按钮。

```swift
let tweetAction = UIAlertAction(title: "Share on Twitter", style: UIAlertActionStyle.Default) { (action) -> Void in
    // Check if sharing to Twitter is possible.
    if SLComposeViewController.isAvailableForServiceType(SLServiceTypeTwitter) {
        // Initialize the default view controller for sharing the post.
        let twitterComposeVC = SLComposeViewController(forServiceType: SLServiceTypeTwitter)
 
    }
    else {
        self.showAlertMessage("You are not logged in to your Twitter account.")
    }
}
```

再一次，我们必须要传入所对应的分享的类型去初始化 `SLComposeViewController`。

上面的类中有个叫做 `setInitialText(_:)` 的方法。通过调用这个方法，我们可以直接把 textview 中的内容设置到发送视图中。当你明白如何使用这个方法后，你会变得更加得心应手，但是请不要忽略一个问题：文字的最大的长度是 140 个字符。这是 Twitter 在发推时的一个限制。

所以下一步我们要做什么？非常简单：首先我们要检查 textview 中的字符长度。如果小于或等于 140 个字符，我们就直接调用之前提到的初始化方法；反之，我们要「压缩」这一段文字，只将前 140 个字符作为我们要发送的文本。

把我所说的翻译成代码吧：

```swift
let tweetAction = UIAlertAction(title: "Share on Twitter", style: UIAlertActionStyle.Default) { (action) -> Void in
    // Check if sharing to Twitter is possible.
    if SLComposeViewController.isAvailableForServiceType(SLServiceTypeTwitter) {
        // Initialize the default view controller for sharing the post.
        let twitterComposeVC = SLComposeViewController(forServiceType: SLServiceTypeTwitter)
 
        // Set the note text as the default post message.
        if count(self.noteTextview.text) <= 140 {	// 译者注：Swift 2.0 后使用 self.noteTextview.text.characters.count
            twitterComposeVC.setInitialText("\(self.noteTextview.text)")
        }
        else {
            let index = advance(self.noteTextview.text.startIndex, 140) // 译者注：Swift 2.0 后使用 self.noteTextview.text.startIndex.advancedBy(140)
            let subText = self.noteTextview.text.substringToIndex(index)
            twitterComposeVC.setInitialText("\(subText)")
        }
 
    }
    else {
        self.showAlertMessage("You are not logged in to your Twitter account.")
    }
}
```

不过上面缺少了弹出视图的方法：

```swift
let tweetAction = UIAlertAction(title: "Share on Twitter", style: UIAlertActionStyle.Default) { (action) -> Void in
    // Check if sharing to Twitter is possible.
    if SLComposeViewController.isAvailableForServiceType(SLServiceTypeTwitter) {
        ...
 
        // Display the compose view controller.
        self.presentViewController(twitterComposeVC, animated: true, completion: nil)
    }
    else {
        self.showAlertMessage("You are not logged in to your Twitter account.")
    }
}
```

上面我们已经完成了发送到 Twitter 的工作。

嗯，就快完成了，不过我们还要添加缺少的 `showAlertMessage(_:)` 方法：

```swift
func showAlertMessage(message: String!) {
    let alertController = UIAlertController(title: "EasyShare", message: message, preferredStyle: UIAlertControllerStyle.Alert)
    alertController.addAction(UIAlertAction(title: "Okay", style: UIAlertActionStyle.Default, handler: nil))
    presentViewController(alertController, animated: true, completion: nil)
}
```

最后再说一句，用很少的代码去实现了发送文本到 Twitter（Facebook 要做的步骤类似）其实并不是一件难事，并且这个过程是如此得容易和迅速！接下来让我们的程序也能够分享到 Facebook，在这之前可以运行一下我们的程序。

### 分享到 Facebook

这部分我们需要把 textview 中的内容分享到 Facebook，实现步骤类似于分享到 Twitter。实际上所做的会更加简单一点，因为 Facebook 没有对发送的文字长度做限制，我们可以跳过检查长度这个步骤。

现在我们需要关注的是 `facebookPostAction`。接下来我直接给出了它的实现，因为并没有什么新的内容或者需要特别注意的地方：

```swift
let facebookPostAction = UIAlertAction(title: "Share on Facebook", style: UIAlertActionStyle.Default) { (action) -> Void in
    if SLComposeViewController.isAvailableForServiceType(SLServiceTypeFacebook) {
        let facebookComposeVC = SLComposeViewController(forServiceType: SLServiceTypeFacebook)
 
        facebookComposeVC.setInitialText("\(self.noteTextview.text)")
 
        self.presentViewController(facebookComposeVC, animated: true, completion: nil)
    }
    else {
        self.showAlertMessage("You are not connected to your Facebook account.")
    }
}
```

再一次，我们需要通过特定的 string 来检查用户是否连接了 Facebook 账号。这和 `SLComposeViewController` 实例初始化所需要的值是相同的。把 textview 中的文字作为发送视图的初始值，然后发送！这就结束了！最后，记得当用户没有登录 Facebook 时，显示一条提示信息。

### 测试前的准备
我们的示例程序既可以在模拟器又可以在真机上进行测试。然而，在测试之前，你需要成功的登录对应的账号，否则，你看到的会如下图所示：

![](http://www.appcoda.com/wp-content/uploads/2015/08/t42_11_twitter_no_connection.png)

为了连接 Twitter 或者 Facebook（或者两者），你需要打开设备的设置（Settings）界面进行账号登录。在设置中你能发现它们的上层入口：

![](http://www.appcoda.com/wp-content/uploads/2015/08/t42_13_settings_both.png)

如果想登录 Twitter，可以选择 `Twitter` 这个选项，然后输入账号和密码。最后点击登录按钮：

![](http://www.appcoda.com/wp-content/uploads/2015/08/t42_14_twitter_filled_in.png)

一旦登录后，界面中会增加一行用于显示用户名：

![](http://www.appcoda.com/wp-content/uploads/2015/08/t42_15_twitter_logged_in.png)

可以点进修改密码，或者将账号移出系统。

![](http://www.appcoda.com/wp-content/uploads/2015/08/t42_16_facebook_logged_in.png)

你也可以使用类似的方法登录 Facebook。将邮箱地址作为用户名并且提供密码就可以了登录了。你也可以通过显示账号的那一行来取消关联 Facebook。

确保你已经登录这两个账号。登录成功后，就可以尽情地测试你的程序了。

### 使用 UIActivityViewController

如果想要同时添加多个分享选项，或者集成一些额外的分享功能，`UIActivityViewController` 为我们提供了一个很好的解决方案。每次所显示的选项会基于所显示的内容，也可能是依赖于运行的应用，又或者是根据是否已经连接到特定的社交账号来展示不同的选项。下面是一些常用的选项：

+ Send an email
+ Send a SMS
+ Share on Twitter and Facebook
+ Add to Reading List
+ Copy
+ Print
+ Send using AirDrop

下面你要看到的，是仅仅通过两行代码去初始化和使用 `UIActivityViewController`。初始化需要传入两个参数，其中第二个是可选的（optional），你可以将其设置为 `nil`。

第一个参数是一个数组，里面包含了我们想要发送的内容。在我们的示例程序中，我们在数组中添加了 textview 中的文字。当然了，我们也可以把图片添加到数组中。数组中的内容决定了系统显示的样式。具体来说，如果我们只有一张图片，那么就不会显示「Add to reading list」。

第二个参数也是一个数组。通过这个数组你可以明确地告诉系统你想显示的 `activity 的类型`。如果设置为 `nil`，那么系统会显示所有的可以使用的 activity。

在这儿你也可以选择哪些 activity 不显示在分享视图中，不过我们一会儿再来探讨。现在我们要关注的是第三个选项：`moreAction`。下面的代码我们会初始化 `UIActivityViewController` 的一个实例并且弹出：

```swift
let moreAction = UIAlertAction(title: "More", style: UIAlertActionStyle.Default) { (action) -> Void in
    let activityViewController = UIActivityViewController(activityItems: [self.noteTextview.text], applicationActivities: nil)
 
    self.presentViewController(activityViewController, animated: true, completion: nil)
}

```

如果运行程序，现在 `More` 选项已经可以使用了。不过模拟器上的选项可能会没有真机上多。例如，模拟器上就没有发送到 SMS 的选项：

![](http://www.appcoda.com/wp-content/uploads/2015/08/t42_1_activityVCSimulator.png)

上面我已经提到，有的开发者需要移除一些并不想显示在分享视图中选项。你所需要做的是声明 `excludedActivityTypes` 这个属性并且将特定的类型传入数组。作为例子，我已经更新了代码，你可以看到，现在代码片段中多了一行，这行代码可以移除发送邮件这个选项：

```swift
let moreAction = UIAlertAction(title: "More", style: UIAlertActionStyle.Default) { (action) -> Void in
    let activityViewController = UIActivityViewController(activityItems: [self.noteTextview.text], applicationActivities: nil)
 
    activityViewController.excludedActivityTypes = [UIActivityTypeMail]
 
    self.presentViewController(activityViewController, animated: true, completion: nil)
}
```

再次运行程序，注意到发送邮件选项已经不见了。

![](http://www.appcoda.com/wp-content/uploads/2015/08/t42_18_missing_email_button.png)

### 小结

作为一个开发者，我必须承认的是，当我第一次使用示例程序中的分享功能的时候，我被其集成的简洁性所震惊了。毫无疑问，我们今天解决的只是一些简单的编程任务，不过我还是希望通过例子能够将实现这些功能的步骤阐释得足够明白。显然，无论是 iOS 内置的 Social framework，还是 `UIActivityViewController` 并不是适用于所有的情况。因为这些系统控件可能和我们的自定义的 UI 不匹配。但是如果不存在界面上的情况，那么就可以考虑下使用系统提供方案。如果你已经准备使用了，那么现在你已经知道如何在几分钟内集成这些功能了。无论你是否决定使用今天我所讲的内容，我都希望今天的内容可以为你以后的开发中带来方便。

作为参考，你可以[在这里下载整个 Xcode project 文件](https://www.dropbox.com/s/o4drd8d5u0ojg9j/EasyShare.zip?dl=0)。
