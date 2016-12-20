title: "如何重用 watchOS 的 Paging Interface Controller"
date: 2016-12-19
tags: [WatchOS 2]
categories: [Natasha The Robot]
permalink: how-to-reuse-paging-interfacecontrollers-in-watchos
keywords: watchos开发
custom_title: 
description: 众所周知 watchOS 的复用性不是很好，但是如果你“不择手段”也是能解决的，本文就来介绍了怎么重用 watchOS 的 Paging Interface Controller。

---
原文链接=https://www.natashatherobot.com/how-to-reuse-paging-interfacecontrollers-in-watchos/
作者=Natasha The Robot
原文日期=2016-09-26
译者=saitjr
校对=小锅
定稿=CMB

<!--此处开始正文-->

目前为止，watchOS 的复用性都不是很好。即使每个界面都差不多，你也不得不在 storyboard 中把所有 Interface Controller 拖出来，就像下面这个 Italian Food 应用一样：

<center>
<video src="https://www.natashatherobot.com/wp-content/uploads/WatchOSPaging.mp4?_=1"  width="276" height="390" controls="controls">
</video>
</center>

每个 Interface Controller 简单到就只有一个 image 和 label：

![](https://www.natashatherobot.com/wp-content/uploads/Screen-Shot-2016-09-26-at-6.17.07-PM-1024x408.png)

即使它们的界面，甚至逻辑都完全一样，在此之前，我都没找到重用这些 Interface Controller 的方法！

所以我有三个不同的 controller，而它们的代码，除了 image 和 label 的数据模型外，其它的我都复制粘贴的。在我坚持不懈下，终于发现了个黑魔法，虽然有点恶心，不过能解决问题倒是真的。

<!--more-->

## 模型

首先，我创建了一个简单的 **FoodItem** 模型，它的数据主要是用于填充 Interface Controller ：

```swift
struct FoodItem {
    let title: String
    let imageName: String
}
 
extension FoodItem {
    
    static let foodItems = [
        FoodItem(title: "Camogliese al Rum", imageName: "comogli"),
        FoodItem(title: "Pesto alla Genovese", imageName: "pasta"),
        FoodItem(title: "Focaccia di Recco", imageName: "recco"),
    ]
}
```

## Storyboard

下一步则是创建用于重用的 Interface Controller，就叫 **FoodItemInterfaceController** 吧，然后将它设置为 Storyboard 中每个 Interface Controller 的类：

![](https://www.natashatherobot.com/wp-content/uploads/Screen-Shot-2016-09-26-at-6.26.41-PM-1024x293.png)

然后，将 image 和 label 与 FoodItemInterfaceController 中的 IBOutlet 进行关联：

![](https://www.natashatherobot.com/wp-content/uploads/FoodItemInterfaceController_swift_—_Edited-1024x206.png)

最后，在 storyboard 中，给每一个 Interface Controller 一个唯一标识：

![](https://www.natashatherobot.com/wp-content/uploads/Interface_storyboard_—_Edited-1-1024x362.png)

## Interface Controller

现在，就到了最恶心的部分了… 在加载第一个 Interface Controller 时，你需要用点小技巧，使其加载其他的 controller。

```swift
import WatchKit
 
class FoodItemInterfaceController: WKInterfaceController {
 
    @IBOutlet var image: WKInterfaceImage!
    @IBOutlet var label: WKInterfaceLabel!
    
    // 记录是否是第一次加载
    static var first = true
    
    override func awake(withContext context: Any?) {
        super.awake(withContext: context)
        
        // 如果是第一次加载
        if FoodItemInterfaceController.first {
            // 根据三个数据模型，重载三个 controller
            // Names 数组是 storyboard 中的 identifier
            // Context 即数据模型
            if FoodItemInterfaceController.first {
            WKInterfaceController.reloadRootControllers(
                withNames: ["FoodItem1", "FoodItem2", "FoodItem3"],
                contexts: FoodItem.foodItems)
            FoodItemInterfaceController.first = false
        }
        
        // 数据模型是通过 context 传到这个方法中的
        if let foodItem = context as? FoodItem {
            // 给 image 和 label 赋值
            image.setImage(UIImage(named: foodItem.imageName))
            label.setText(foodItem.title)
        }
    }
}
```

## 结论

首先，这种方式会比硬编码 Interface Controller 的方式要慢，因为在第一次加载 Interface Controller 时，它需要去重新载入所有东西。但至少，这样代码集中啊！

而且，在我能力范围以内，还没办法解决动态数据（比如，food item 是通过网络请求获得的）并将其展示到三个以上界面的问题。不过这种情况，你可以选择用 table 来展示数据，而不是 paging。

哦，对了，你还是需要在 Storyboard 中复制多个 Interface Controller，它们有相同尺寸的 image，以及相同布局和字体的 label，如果对其中一个进行了调整，记着对其他几个也要相应改动，这样才一致。我就经常忘记统一修改，连下面这个 demo 也是...

你可以在 [GitHub 上查看完整代码](https://github.com/NatashaTheRobot/WatchReusablePagingExample)。
