如何在 watchOS 中复用分页界面控制器"

> 作者：Natasha The Robot，[原文链接](https://www.natashatherobot.com/how-to-reuse-paging-interfacecontrollers-in-watchos/)，原文日期：2016/09/26
> 译者：pucca；校对：[walkingway](http://chengway.in/)；定稿：[CMB](https://github.com/chenmingbiao)
  









WatchOS 目前并不是很支持动态代码。当你用一个 storyboard 来构建它的界面，即使所有的这些界面元素非常相似，还是必须把所有的界面控制器都放进去。比如下面这个关于意大利食物的 Apple Watch 的应用。



<center>
<video src="http://swiftgg-main.b0.upaiyun.com/video/how-to-reuse-paging-interfacecontrollers-in-watchos.mp4"  width="276" height="390" controls="controls">
Your browser does not support the video tag.
</video>
</center>

每个界面控制器仅有一张图片和一个标签：

![](https://www.natashatherobot.com/wp-content/uploads/Screen-Shot-2016-09-26-at-6.17.07-PM-768x306.png)

尽管这些界面和逻辑在界面控制器中看起来一模一样，但在过去一年里，我还是没有找到重用界面控制器的解决方案。

所以我复制粘贴三次代码，稍微修改模态层图片和标签的数据详情后，得到三个不同的控制器。但是哎，又一次搜索解决方案以后，我勉强得出了一个可用的解决方法。

## 数据模型

首先，下面是一个简单的 FoodItem 模型，用来向界面控制器填充数据：

    
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

## 故事板

下一个步骤是创建一个可重用界面控制器，我们将它命名为 FoodItemInterfaceController，并且将它指定为故事板里每个界面控制器的类：

![](https://www.natashatherobot.com/wp-content/uploads/Screen-Shot-2016-09-26-at-6.26.41-PM-768x220.png)

然后是为图片和标签创建并关联 IBOutlets：

![](https://www.natashatherobot.com/wp-content/uploads/FoodItemInterfaceController_swift_%E2%80%94_Edited-768x154.png)

最后，你必须在故事板中为你的每个界面控制器添加一个独一无二的标识符：

![](https://www.natashatherobot.com/wp-content/uploads/Interface_storyboard_%E2%80%94_Edited-1-768x272.png)

## 界面控制器

现在到了最不堪的部分... 当第一个界面控制器加载的时候，你必须做些修改使它加载所有剩余的界面控制器...

    
    import WatchKit
     
    class FoodItemInterfaceController: WKInterfaceController {
     
        @IBOutlet var image: WKInterfaceImage!
        @IBOutlet var label: WKInterfaceLabel!
        
        // 你必须跟踪这是否是第一次加载...
        static var first = true
        
        override func awake(withContext context: Any?) {
            super.awake(withContext: context)
            
            // 如果是第一次加载... 
            if FoodItemInterfaceController.first {
                // then reload with the data for all 3 controllers... 
                // the Names are the storyboard identifiers 
                // the Context is the data
                if FoodItemInterfaceController.first {
                WKInterfaceController.reloadRootControllers(
                    withNames: ["FoodItem1", "FoodItem2", "FoodItem3"],
                    contexts: FoodItem.foodItems)
                FoodItemInterfaceController.first = false
            }
            
            // context 中的数据传递给这个方法
            if let foodItem = context as? FoodItem {
                // 为图片和文本设置合适的数据
                image.setImage(UIImage(named: foodItem.imageName))
                label.setText(foodItem.title)
            }
        }
    }

## 结论

首先，这个实现比硬编出所有界面控制器来的慢，因为第一次加载界面控制器，它需要重加载所有的东西。但是至少这段代码只出现一个地方，对吧？

并且，我认为没办法拥有一个动态的数据集合（例如，你从服务器获取了一组可用的食物项数组，并且想用至少 3 页来显示它们。虽然本例中，你可以使用表格代替分页界面）。

喔，当然，你还是必须在故事板中复制这些界面控制器，尽管它们都有一样大小的图片和标签，且有相同结构和字体。如果你对其中一个做了调整改变，要记得手动给其他几个也做同样的调整，以保证它们最终看起来一样。我已经多次忘记了，包括这次的 demo...

你可以[在此](https://github.com/NatashaTheRobot/WatchReusablePagingExample)浏览完整的代码。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。