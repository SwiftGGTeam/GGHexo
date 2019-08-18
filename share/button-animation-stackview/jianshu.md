这样的 StackView 动画，你想到了吗？"

> 作者：Natasha The Robot，[原文链接](https://www.natashatherobot.com/button-animation-stackview/)，原文日期：2016-07-24
> 译者：[Joy](http://www.jianshu.com/users/9c51a213b02e/latest_articles)；校对：[saitjr](http://www.saitjr.com)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  









上周，我作为嘉宾参加了 [iOSDevCampDC](http://iosdevcampdc.com/)，有幸听到 [@atomicbird](https://twitter.com/atomicbird) 关于 `StackView` 的精彩演讲。我了解 `StackView` 的基本原理，但它居然还可以如此简单地制作出炫酷的动画，真是毫无防备。



下面是 `@atomicbird` 演示的例子，我在博客中模仿了这种效果。这个 app 中有一个设置按钮，用户可以通过它来选择一个表情表示当前状态。

<video class="wp-video-shortcode" id="video-6424-1" width="320" height="590" preload="metadata" controls="controls"><source type="video/mp4" src="https://www.natashatherobot.com/wp-content/uploads/StackViewAnimationDemo.mp4?_=1" /><a href="https://www.natashatherobot.com/wp-content/uploads/StackViewAnimationDemo.mp4">https://www.natashatherobot.com/wp-content/uploads/StackViewAnimationDemo.mp4</a></video>

### 初始设置

初始设置很简单，把 `StackView` 加到 `View` 上，添加相关约束，然后用按钮来组成这个可爱的表情菜单。

![](https://www.natashatherobot.com/wp-content/uploads/Main_storyboard_%E2%80%94_Edited_and_MyPlayground_playground-1024x444.png)

`Stackview` 非常简单，而且容易上手，所以即使你没接触过，这部分也会很有趣。🙂

下一步是对表情按钮进行操作（除设置按钮外），给这些需要做动画的按钮创建一个 **Outlet Collection**。

![](https://www.natashatherobot.com/wp-content/uploads/Screen_Shot_2016-07-24_at_6_10_36_AM-1024x331.png)
￼

正如你所看到的那样，创建一个 Outlet Collection 与创建一个 Outlet 的方式是一样的，只不过 Outlet Collection 是子控件组成的数组。所以按住 Control 键，并拖动鼠标去创建一个新的 Outlet Collection 即可。

### 动画 🎉

我们将通过控制表情按钮的 `hidden` 属性来达到动画的效果。首先，需要确认这些表情按钮默认是被隐藏的。遍历所有的表情按钮，使之隐藏。

    
    @IBOutlet var emojiButtons: [UIButton]! {
    didSet {
        emojiButtons.forEach {
            $0.isHidden = true
        }
    }
    }

下面将进行有“难度”的操作，你准备好了吗？

当设置按钮被点击时，执行一个动画去遍历所有的表情按钮，并切换它们的 `hidden` 状态。

    
    @IBAction func onSettingsButtonTap(_ sender: AnyObject) {
        UIView.animate(withDuration: 0.3) {
            self.emojiButtons.forEach {
                $0.isHidden = !$0.isHidden
            }
        }
    }

### 总结

这些精练的技巧，使得 `StackView` 超乎想象的强大。我也因此受到了很大的鼓舞，相信可以通过 `StackView` 做出更有创意的东西。非常感谢 `@atomicbird`！

你可以在[这里](https://github.com/NatashaTheRobot/StackViewAnimationExample)看到我的示例代码，同时可以与使用 Autolayout 的情况做个比较。

有兴趣学习更多技巧吗？那就来[参加](http://www.tryswiftnyc.com) 9 月 1，2 日在纽约举行的 Swift 社区狂欢吧。你可以通过 *NATASHATHEROBOT* 获得 $100 的折扣。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。