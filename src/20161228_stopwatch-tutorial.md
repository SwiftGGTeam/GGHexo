title: "计时器教程"
date: 2016-12-28
tags: [iOS 入门, Swift 入门]
categories: [IOSCREATOR]
permalink: stopwatch-tutorial
keywords: 计时器
custom_title: 使用Swift来制作计时器
description: 如何使用Swift来制作iOS计时器

---
原文链接=https://www.ioscreator.com/tutorials/stopwatch-tutorial
作者=Arthur Knopper
原文日期=2016-10-31
译者=Crystal Sun
校对=星夜暮晨
定稿=CMB

<!--此处开始正文-->

本节教程讲述如何创建一个简单的计时器，其功能有开始、暂停和重置归零。本节教程将使用 Xcode 8 和 iOS 10 来进行构建。

<!--more-->

打开 Xcode，创建一个 Single View Application。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5818680a2e69cfd82f6eb336/1477994519169/?format=750w)

点击 Next，product name 一栏填写 **IOS10StopwatchTutorial**，填写好 Organization Name 和 Organization Identifier，Language 选择 Swift，并确保 Devices 一栏中选择了 iPhone。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58111af003596ed12432a1e1/1477516030196/?format=750w)

前往 **Storyboard** 当中，拖一个 Vertical Stack View 放到主界面。随后再拖一个 Label 放到 Stack View  当中，将其 title 改为 “00:00”。接下来，拖三个 Button 放到 Stack View 当中，使其位于 Label 下方，title 分别改为"Start"，"Pause" 和 “Reset”。Storyboard 看起来如下图所示：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58132619cd0f68a2ef867be5/1477649960973/?format=500w)

选中这个 Vertical Stack View，点击 Storyboard 右下角的 Auto Layout 中的 Align 按钮，在弹出窗中输入下图中所示的值，随后点击 "Add 1 Constraint"。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58132a3137c581f8dfa83a05/1477651002792/?format=300w)

再次选中 Vertical Stack View，点击 Storyboard 右下角的 Auto Layout 中的 Pin 按钮，在弹出窗中输入下图中所示的值，随后点击 "Add 1 Constraint"。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5813291c20099ee15feb42c3/1477650727701/?format=300w)

然后点击 Assistant Editor，确保 **ViewController.swift** 文件可见。按住 Ctrl，把 Label 拖到 ViewController 类文件里，创建一个 Outlet 如下图所示：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58111b36f5e231f870d43617/1477516096940/?format=300w)

按住 Ctrl，把 Start 按钮拖到 ViewController 类文件里，创建一个 Outlet 如下图所示：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5817580115d5dbcebad10099/1477924878395/?format=300w)

按住 Ctrl，把 Pause 按钮拖到 ViewController 类文件里，创建一个 Outlet 如下图所示：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58111b77f5e231f870d43c71/1477516158454/?format=300w)

按住 Ctrl，把 Start 按钮拖到 ViewController 类文件里，创建一个 Action 如下图所示：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58111ba9f5e231f870d43f6a/1477516210527/?format=300w)

按住 Ctrl，把 Pause 按钮拖到 ViewController 类文件里，创建一个 Action 如下图所示：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58111bc0f5e231f870d440f3/1477516242256/?format=300w)

按住 Ctrl，把 Reset 按钮拖到 ViewController 类文件里，创建一个 Action 如下图所示：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/58111be9f5e231f870d4433f/1477516273240/?format=300w)

找到 **ViewController.swift** 文件，然后增加下列属性：

```swift
var counter = 0.0
var timer = Timer()
var isPlaying = false
```

将 **viewDidLoad** 方法更改为：

```swift
override func viewDidLoad() {
    super.viewDidLoad()
        
    timeLabel.text = String(counter)
    pauseButton.isEnabled = false
}
```

实现 IBAction 方法：

```swift
@IBAction func startTimer(_ sender: AnyObject) {
    if(isPlaying) {
        return
    }
    startButton.isEnabled = false
    pauseButton.isEnabled = true
        
    timer = Timer.scheduledTimer(timeInterval: 0.1, target: self, selector: #selector(UpdateTimer), userInfo: nil, repeats: true)
    isPlaying = true
}
    
@IBAction func pauseTimer(_ sender: AnyObject) {
    startButton.isEnabled = true
    pauseButton.isEnabled = false
        
    timer.invalidate()
    isPlaying = false
}

@IBAction func resetTimer(_ sender: AnyObject) {
    startButton.isEnabled = true
    pauseButton.isEnabled = false
        
    timer.invalidate()
    isPlaying = false
    counter = 0.0
    timeLabel.text = String(counter)
}
```

`isPlaying` 布尔值用于检查计时器的 timer 是否正在运行。`NSTimer` 类里的 `invalidate` 方法可以停止计时。计时器开始计时时调用此 **updateTimer** 方法。

```swift
func UpdateTimer() {
    counter = counter + 0.1
    timeLabel.text = String(format: "%.1f", counter)
}
```

**编译并运行**此工程，在模拟器中点击按钮使用计时器。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5817ac0eb3db2be38a2bda56/1477946395357/?format=500w)

在 ioscreator 的 [github](https://github.com/ioscreator/ioscreator) 上可以下载到本节课程 **IOS10StopWatchTutorial** 的源代码。