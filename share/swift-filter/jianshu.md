Swift 中的过滤器

> 作者：Thomas Hanning，[原文链接](http://www.thomashanning.com/swift-filter/)，原文日期：2016-04-25
> 译者：[way](undefined)；校对：[星夜暮晨](http://www.jianshu.com/users/ef1058d2d851)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  









# Swift 中的过滤器

Swift 提供了很多方便的函数来操作数组，比如 `filter` 和 `map`。在这篇文章里，我将带大家熟悉一下 filter，以及学习如何使用 map 来组合出新的数组。



假设你有一个数组，接着你想要创建一个新的数组，这个数组包含原数组中所有大于 10 的元素，你可以使用下面的 for 循环：

    
    let anArray = Array(1...20)
     
    var anotherArray = [Int]()
     
    for i in anArray {
        if i > 10 {
            anotherArray.append(i)
        }
    }
     
    print(anotherArray) // [11,12,13,14,15,16,17,18,19,20]

除了代码多点，也没什么问题。

## Filter

但是你可以尝试使用一下 `filter` 函数，这是 Swift 为每个数组提供的一个新式武器，可以大大缩减枚举的代码量：

    
    let anotherArray = anArray.filter({ (a:Int) -> Bool in
        return a > 10
    })
     
    print(anotherArray)

该函数带一个闭包做为参数，这个闭包将数组中的元素作为参数，并返回一个 `bool` 结果。数组中的每一个元素都会执行该闭包，根据返回的结果来决定是否应存在于新的数组中。

通过 Swift 提供的闭包简化写法，我们可以进一步精简：

    
    let anotherArray = anArray.filter ({$0 > 10})
     
    print(anotherArray) // [11,12,13,14,15,16,17,18,19,20]

和最初的版本对比一下，是不是精简了许多呢：）。

## 使用 map 来组合

数组还提供了一个有趣的函数 `map`，该函数同样是带一个闭包作为参数并且在内部返回一个经过转换的元素。所以我们先筛选出数组中所有大于 10 的元素，然后让它们的值翻一倍：

    
    let anArray = Array(1...20)
     
    let anotherArray = anArray.filter({$0 > 10}).map({$0 * 2})
     
    print(anotherArray) // [22, 24, 26, 28, 30, 32, 34, 36, 38, 40]

关于 map 更多的细节，可以查看我[此前写的一篇文章](http://swift.gg/2015/11/26/swift-map-and-flatmap/)

当然你只能在条件不太复杂时这么做，如果情况比较复杂，这种写法将使代码变得更加难读。大体来说就是，如果为了可读性，那么多写点代码还是值得的。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。