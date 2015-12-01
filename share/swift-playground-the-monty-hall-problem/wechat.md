Swift Playground: 三门问题的解法"

> 作者：Thomas Hanning，[原文链接](http://www.thomashanning.com/swift-playground-the-monty-hall-problem/)，原文日期：2015-09-27
> 译者：[SergioChan](https://github.com/SergioChan)；校对：[numbbbbb](https://github.com/numbbbbb)；定稿：[numbbbbb](https://github.com/numbbbbb)
  








三门问题是一个超级让人摸不着头脑的概率问题。我们会在 Swift Playground 里来演示它的解法，而不是通过枯燥的数学解释。



## 三门问题

这个问题的核心很简单。在 1990 年的[Parade](https://en.wikipedia.org/wiki/Parade_(magazine))杂志中是这么解释的：

> 假设你正在参加一个游戏节目，需要在三扇门中选择一扇。其中一扇后面有一辆车，其余两扇后面则是羊。你选择了一扇门，假设是 1 号门，主持人知道门后面是什么，他开启了另一扇后面有羊的门，假设是3号门。然后他问你：“你想选择 2 号门吗？”这时候你改变决策是有利的吗？

实际上，结果是有利的。如果你选择另外一扇门，你就有2/3的概率赢得汽车。相反，如果你不改变你的选择，赢得汽车的概率就只有 1/3。当然你可以从数学的角度去证明，但是这里我们希望验证一下。

## 算法

算法很简单。首先，你选择一扇门。然后主持人打开一扇后面有羊的门。如果你的第一次选择就选中了有车的门，他就要在剩下两扇门中随机选择一扇开启。如果你的第一次选择选中的是有羊的门，他就要把剩下一扇也是羊的门打开。最后，你是否改变选择取决于你采取的策略。

## Playground

我们来编写一个简单的 Playground 程序。我们会对每种选择策略执行 100000 次测试来得出大致的概率。

    
    import UIKit
    
    enum Strategy {
        case Change
        case Stay
    }
    
    
    func play(strategy:Strategy,repeats:Int) -> Int {
        var wins = 0
        
        for _ in 0..<repeats {
            
            let car = Int(arc4random_uniform(3))
            
            var playerChoice = Int(arc4random_uniform(3))
            
            if strategy == Strategy.Change {
                
                if playerChoice == car {
                    var remainingDoors = [0,1,2]
                    remainingDoors.removeAtIndex(playerChoice)
                    playerChoice = remainingDoors[Int(arc4random_uniform(2))]
                } else {
                    playerChoice = car
                }
                
            }
            
            if car == playerChoice {
                wins++
            }
        }
        
        return wins
    }
    
    var repeats = 100000
    
    var winsStrategyChange = play(.Change, repeats: repeats)
    var winsStrategyStay = play(.Stay, repeats: repeats)
            
    var quoteStrategyChange = Double(winsStrategyChange) / Double(repeats)
    var quoteStrategyStay = Double(winsStrategyStay) / Double(repeats)

## 结果

每次运行这个 Playground 得到的结果都不完全相同，但是都很接近的。例如，其中一次结果是：

*     改变选择且赢得汽车的次数: 66,461
*     不改变选择且赢得汽车的次数: 33,509
*     改变选择且赢得汽车的概率: 0,66461
*     不改变选择且赢得汽车的概率: 0,33509

结果正如理论所预计的那样。如果你不改变你的选择，你就只有百分之 33 的概率赢得汽车。如果你改变了你的选择，这个概率就上升到了百分之 66。

## 结论

在 Playground 中做实验是十分有趣的。在这种情况下，我们可以验证那些乍一看摸不着头脑的理论。

## 引用

图片: @ Lim ChewHow / shutterstock.com

维基百科: [Monty Hall Problem](https://en.wikipedia.org/wiki/Monty_Hall_problem)


> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。