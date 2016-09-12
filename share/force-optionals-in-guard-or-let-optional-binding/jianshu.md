在 guard let 或 if let 多重解包中让元素强制可空"

> 作者：BENEDIKT TERHECHTE，[原文链接](http://appventure.me/2016/04/14/force-optionals-in-guard-or-let-optional-binding/#fn.1)，原文日期：2016-04-14
> 译者：[星夜暮晨](http://www.jianshu.com/users/ef1058d2d851)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  









我非常喜欢在 `guard`  或者 `let` 语句中对可空值进行多重解包 (multi-unwrapping)，并且也喜欢使用附加的 `where` 从句。[您可以在我之前的文章中看到相关介绍](https://appventure.me/2016/03/29/three-tips-for-clean-swift-code/)。然而，有些时候我会碰到这样一种情况，也就是在多重解包当中，当我调用的某个函数不返回可空值（或者使用数组下标语法获取数组元素）的时候，会出现问题。



    
    // 装作这个函数执行了某些复杂的操作
    func someArray() -> [Int]? {
        return [1, 2, 3, 4, 5, 6]
    }
    
    func example() {
        guard let array = someArray(),
    	numberThree = array[2]
    	where numberThree == 3
    	else { return }
        print(numberThree)
    }

这会出现问题。编译器会告诉您，这里需要是一个可空值：

> "Initializer for conditional binding must have Optional type, not 'Int'" 

因此，为了解决这个问题，最后往往是这样子结束的：

    
    func example() {
        guard let array = someArray() else { return }
        let numberThree = array[2]
        guard numberThree == 3 else { return }
        print(numberThree)
    }

这不仅看起来十分丑陋，并且您还必须要写两次失败处理闭包 (failure block) 代码。当然，因为这是一个简单的例子，我们只用写 `{return}` 即可，看起来也没啥大不了的。但是当您需要执行一些更复杂工作的时候，您就必须要重复粘贴这个代码块了；这实在是一个非常糟糕的选择（或者您也可以将其重构为单独的闭包或者函数，但是对于一个 guard 语句来说，这所做的工作实在是太多了）。

所以，有没有什么好的解决方案呢？好吧，由于 `guared` 和 `let` 需要可空值，那么我们就可以创建一个可空值，然后再对其解包：

    
    func example() {
        guard let array = someArray(),
    	numberThree = Optional.Some(array[2])
    	where numberThree == 3
    	else { return }
        print(numberThree)
    }

您可能记得，Swift 的可空值的内部是一个包含 `.Some` 和 `.None` 枚举值的枚举。因此，我们在这里所做的，就是创建一个新的 `.Some` 枚举值，然后再在同一行当中对其进行解包：`array[2]` 表达式会使用 `Optional.Some` 进行封装，然后再被解包到 `numberThree` 值当中。

这可能会带来一点小小的开销，但另一方面，它允许我们让 `guard` 或者 `let` 解包变得更为简洁。

很显然，这不仅能对诸如 `array[3]`  之类的数组下标有用，而且还对返回非可空值的函数有用：

    
    guard let aString = optionalString(),
        elements = Optional.Some(aString.characters.split("/")),
        last = elements.last,
        count = Optional.Some(last.characters.count),
        where count == 5 else { fatalError("Wrong Path") }
    print("We have \(count) items in \(last)")
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。