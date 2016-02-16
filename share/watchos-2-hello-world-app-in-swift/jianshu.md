在 Swift 中编写 watchOS 2 Hello World 程序

> 作者：codingexplorer，[原文链接](http://www.codingexplorer.com/watchos-2-hello-world-app-in-swift/)，原文日期：2015-12-08
> 译者：[mmoaay](http://blog.csdn.net/mmoaay)；校对：[千叶知风](http://weibo.com/xiaoxxiao)；定稿：[numbbbbb](http://numbbbbb.com/)
  









过去的几个月我一直保持着写博客的习惯，但是现在我得专心工作了。最近在做一些 watchOS 2 相关的更新工作，我觉得如果出个系列教程会对大家很有帮助。首先我们需要学会开发第一个 watchOS 2 应用，所以下面来开发一个 watchOS 2 风格的 “Hello World!”吧！

在教程开始前，我准备介绍如何使用 Swift 在 iOS、watchOS、tvOS 和 OS X 上编程。此外，如果你想在本博客中学到其他知识，请给 Twitter [@CodingExplorer](https://twitter.com/CodingExplorer) 或者 [Contact Page](http://www.codingexplorer.com/contact/) 来提出建议。


# 创建你的 watchOS 2 应用

打开 Xcode，创建一个新项目。可以使用初始界面，也可以通过菜单（File → New → Project…）。然后，定位到 watchOS 部分并选择 Application，现在界面看起来是这样的：

![](http://swift.gg/img/articles/watchos-2-hello-world-app-in-swift/01-Template.png1453340116.4521918)

因为只有 “iOS App with WatchKit App“ 这一个选项，所以选中并点击 next。接着你需要给应用起个名字然后做几个选择来初始化项目。我们把应用命名为 “HelloWatch“。简单起见，你可以把下方的 the Notification Scene、Glance Scene 等选项关闭。虽然它们很有用，但是在这个项目中我们只需要生成一个简单的 “Hello World“ 应用。当然，你需要确保将 Language 选项设置为 “Swift“。

![](http://swift.gg/img/articles/watchos-2-hello-world-app-in-swift/02-NameProject.png1453340117.843736)

这个项目是不会生成 iOS 应用的。如果你想知道如何在 iOS 上写一个 Hello World 应用，请阅读 [Hello World! Your first iOS App in Swift](http://www.codingexplorer.com/hello-world-first-ios-app-swift/)。
选择好项目的保存位置，我们就可以开始编程了。选中导航面板中 “HelloWatch WatchKit App“ 分组中的 Interface.storyboard。

![](http://swift.gg/img/articles/watchos-2-hello-world-app-in-swift/03-SelectWatchKitAppStoryboard.png1453340118.3020916)

这个文件就是 watchOS 应用的界面文件。和 iOS “Hello World“ 应用类似，我们在应用中放置一个 label 和一个 button，点击 button 会改变 label 的文本内容。

我们从 Object Library 拖一个 label 和 button 到 storyboard 上，然后把 label 放置在 button 的上方：

![](http://swift.gg/img/articles/watchos-2-hello-world-app-in-swift/04-ObjectLibrary.png1453340118.7593)

这时 label 看起来会比较拥挤，我们设置 width 为 “Relative to Container“ ，并将其值设置为 1，从而把 label 的宽度设置为屏幕的宽度。这个值代表了和屏幕宽高的百分比，所以 1 就是 100%，0.5 就是 50％，以此类推。我们在垂直方向上也给它更多的空间，把 Height 设置为“Relative to Container“  然后将其值设置为 0.25 （即屏幕高度的 25%）。最后我们把 Text 设置为 “App Loaded…“，如果你喜欢还可以将其设置为居中显示。

![](http://swift.gg/img/articles/watchos-2-hello-world-app-in-swift/05-LabelAttributes.png1453340119.1029499)

# 给 watchOS UI 添加一些 Swift 代码

UI 已经 OK 了。现在我们把它和代码连接起来，然后让 button 去做一些事情。最简单的方式就是打开辅助编辑器。点击右上方的斜 venn 图标即可：

![](http://swift.gg/img/articles/watchos-2-hello-world-app-in-swift/08r-AssistantEditor.png1453340119.4616616)

如果需要更大的操作空间，可以点击最右边的按钮（图标是右侧包含长条的方框）关闭工具面板。

然后，从 label 开始用 Ctrl＋拖动或者右击拖动的方式拉一条线到代码中（根据惯例，一般是在类的顶部）。然后就会弹出对话框让你给 label 的 outlet 命名。我们把它叫做 “displayLabel“。按照惯例我仍然建议采用骆驼命名法来给它们（也包括所有的变量）命名，以小写字母开始，接下来每个单词的首字母大写（因为我们不能在变量名中加空格，所以我们以这样的方式来表明这是一个新的单词）。

![](http://swift.gg/img/articles/watchos-2-hello-world-app-in-swift/06-LabelOutlet.png1453340119.9126153)

接下来，我们对 button 做同样的操作。从 button 开始用 Ctrl + 拖动的方式拉一条线到代码中（可以是类范围内的任意位置，据我所知，除了放在 outlet 下方，没有其它特殊的惯例）然后创建一个 action。一定要确保连接的方式是 “action“。如果你创建的是 outlet，它可以让你改变 button 本身的状态，比如它的文本，但这不是我们在这里想做的事情：

![](http://swift.gg/img/articles/watchos-2-hello-world-app-in-swift/07-buttonAction.png1453340120.3702822)

再次确认这是一个 “Action“。它会创建一个叫 “buttonTapped“ 的方法，我们在这个方法里面写我们的代码。改变 WKInterfaceLabel 文本的代码非常简单，如下：

    
    @IBAction func buttonTapped() {
        displayLabel.setText("Hello World!")
    }

我们的方法中间只有 1 行代码。我们调用了 WKInterfaceLabel 的 “setText“ 方法，然后把新的文本做为参数传递给它。在 iOS 中，我们通过一个叫“text“的属性就可以轻松的改变 label 的显示内容。但是在目前来说，watchOS 并没有这样一个属性，我们甚至无法在程序中读取文本内容，预计下一版本的 watchOS 会加入这个属性，但是现在我们只能用 “setText“ 方法设置文本内容。

大功告成。如果你有 Apple Watch，可以把手机连接到 Mac，然后把这个应用安装到手机上。你也可以使用模拟器。在左上角选择 “HelloWatch WatchKit App“ 这个 target，然后选择任意一个 iPhone 和 Watch 模拟器（或者选择具体的 iPhone，如果你想在真机上测试），然后点击 play 按钮。你可能需要多点击几次 “play“ 按钮（如果你的电脑没有 SSD ，这可以减少加载模拟器的时间），最终你会见到下面的画面：

![](http://swift.gg/img/articles/watchos-2-hello-world-app-in-swift/09-AppLoadedScreen.png1453340120.721585)

点击 button 之后就会看到：

![](http://swift.gg/img/articles/watchos-2-hello-world-app-in-swift/10-HelloWorldScreen.png1453340121.0732856)

完整起见，InterfaceController.swift 文件的所有代码如下：

    
    import WatchKit
    import Foundation
    
    
    class InterfaceController: WKInterfaceController {
        
        @IBOutlet var displayLabel: WKInterfaceLabel!
    
        override func awakeWithContext(context: AnyObject?) {
            super.awakeWithContext(context)
            
            // Configure interface objects here.
        }
        
        @IBAction func buttonTapped() {
            displayLabel.setText("Hello World!")
        }
    
        override func willActivate() {
            // This method is called when watch view controller is about to be visible to user
            super.willActivate()
        }
    
        override func didDeactivate() {
            // This method is called when watch view controller is no longer visible
            super.didDeactivate()
        }
    
    }

上面的大部分代码都是模版自动生成的。

# 总结

**文章中的代码都是在 Xcode 7.1.1 中进行测试的。**

这就是 watchOS 2 中 “Hello World!“ 应用。你会发现这篇教程非常简单，其实这是有意为之。接下来的教程会经常引用这篇教程，这样就可以避免重复 watchOS 应用的设置步骤。这个系列接下来的文章会更有趣，包括使用 WatchConnectivity 在 iOS 和 watchOS 2 应用之间传递数据以及并发实现。敬请期待更多的 watchOS 和 Swift 教程！

希望这篇文章对你有用。如果你觉得有用，请不要犹豫，把它分享到你的 Twitter 或者你喜欢的社交媒体，每次分享对我来说都很有用。当然，如果你有任何问题，请马上通过  [Contact Page](http://www.codingexplorer.com/contact/) 或者 Twitter [@CodingExplorer](https://twitter.com/CodingExplorer) 联系我，我会尽我所能帮助你。谢谢！
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。