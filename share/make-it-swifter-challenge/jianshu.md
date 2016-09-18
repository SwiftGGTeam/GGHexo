代码 Swift 化的挑战"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2016/06/28/make-it-swifter-challenge/)，原文日期：2016-06-28
> 译者：[Martin_Joy](http://www.jianshu.com/users/9c51a213b02e/latest_articles)；校对：[bestswifter](http://bestswifter.com)；定稿：[CMB](https://github.com/chenmingbiao)
  









今天的挑战题出自 Swift Users 邮件组的 [Adriano Ferreira](http://ericasadun.com/2016/06/28/make-it-swifter-challenge/) 。他的出发点是想要简化链式调用，但是很多情况下，想要使代码更 Swifter ，仅仅依靠看起来漂亮的链式语法是不够的。



    
    func selectionSort(_ array: [Int]) -> [Int] {
    
        guard array.count > 1, let minElement = array.min() else {
            return array
        }
    
        let indexOfMinElement = array.index(of: minElement)!
    
        // All of this just to filter out the first smallest element and return the rest
        // Also tried ‘suffix(from:)' here, but couldn’t make it work properly
        let rest = array.enumerated()
                        .filter({ index, _ in index != indexOfMinElement })
                        .map({ _, element in element })
    
        return [minElement] + selectionSort(rest)
    }

###  如何使其更 Swifter

首先，实用性。即使对于零个或一个元素的数组，我不认为添加代码去测试这些条件是实用的。我认为让代码直接顺序执行是更好的选择，即使这样对于只有一个元素的情况不是特别完美。

其次，连贯性。我不喜欢先找到最小值，然后再去找它的索引的想法。而枚举是允许将这两个操作串联起来的。

第三，风格。数组的遍历应该返回元组类型 `(index: Index, value: Element)`。但是示例并没有这么做，所以我想要借此机会来扩展数组，使其支持这种类型的元组。同时，我的方案比他需要的答案更复杂一些，因为我想要使用 `$0.value` 与 `$1.index`，而不是使用 `$0.1` 和 `$1.0`。

我重新设计的代码[在这里](https://gist.github.com/erica/124b64b4e71372fe04b44e1e02d448ca)，请你也分享你的那一份吧！
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。