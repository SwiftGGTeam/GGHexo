有序数组的一种实现"

> 作者：Ole Begemann，[原文链接](https://oleb.net/blog/2017/02/sorted-array/)，原文日期：2017-02-08
> 译者：[四娘](https://kemchenj.github.io)；校对：[Cwift](http://weibo.com/277195544)；定稿：[CMB](https://github.com/chenmingbiao)
  









在[上周的 Swift Talk](https://talk.objc.io/episodes/S01E35-sorted-arrays-collections-3) 里，Florian 和 Chris 编写了一个有序数组类型 `SortedArray`：一个总是按照指定规则排序的数组。这很赞，因为它将多个[不变性](https://en.wikipedia.org/wiki/Invariant_(computer_science)编码到了类型系统里。用户可以使用这个类型去取代普通的[数组](https://developer.apple.com/reference/swift/array)，而且不用担心忘记手动排序数组。

为了保持视频简短，Florian 和 Chris 省略掉了一些很实用的功能。我想给你展示一下这部分实用功能的实现。这些实现都不难编写，我的主要目的是让你明白借助标准库去实现一个紧贴需求的自定义集合类型是多么简单。

你可以去 [GitHub 上查看全部代码](https://github.com/ole/SortedArray)，但下面会有更多讲解。



## 指定集合的协议

如视频所示，SortedArray 遵守了 [RandomAccessCollection](https://developer.apple.com/reference/swift/randomaccesscollection)，它可以让随机访问数组元素的操作变得更快，稍后实现一个高效的 Binary Search 的时候会用到它。

实现部分很直观，因为把所有东西都桥接到用来实际存储的数组那里。由于 Index 是 Int 类型，你甚至不用自己实现 `index(_:offsetBy:)` 和 `distance(from:to:)` 函数，标准库已经提供了默认的实现。

SortedArray 不能遵守 [MutableCollection](https://developer.apple.com/reference/swift/mutablecollection) 或者 [RangeReplaceableCollection](https://developer.apple.com/reference/swift/rangereplaceablecollection)，因为他们的[语义](https://oleb.net/blog/2017/02/why-is-dictionary-not-a-mutablecollection/) -- 插入/替换特定位置的元素，跟我们保持元素有序的原则冲突。

## 字面量表达

SortedArray 也不遵守 [ExpressibleByArrayLiteral](https://developer.apple.com/reference/swift/expressiblebyarrayliteral)，即你不能像下面这么做：

    
    let sorted: SortedArray = [3,1,2]

这个功能很好，但是你没办法给一个字面数组传递排序算法，并且 SortedArray 的元素必须遵守 [Comparable](https://developer.apple.com/reference/swift/comparable)。因为 Swift 3 还不支持 [conditional protocol conformance](https://github.com/apple/swift-evolution/blob/master/proposals/0143-conditional-conformances.md)，所以需要写成下面这样：

    
    extension SortedArray: ExpressibleByArrayLiteral where Element: Comparable {
        ...
    }

也许 Swift 4 中可以实现 conditional protocol conformance。

## Binary search

使用有序数组的好处之一就是可以通过 [Binary Search](https://en.wikipedia.org/wiki/Binary_search_algorithm) 快速找到某一个数组元素。在这里 Binary Search 的时间复杂度[是 log n 而不是线性的](https://en.wikipedia.org/wiki/Time_complexity#Logarithmic_time)。

为了实现该算法，我首先写了一个辅助函数 `search(for:)`。你可以去 [GitHub 上查看完整代码](https://github.com/ole/SortedArray/blob/master/Sources/SortedArray.swift#L176-L198)；这里我想讨论一下返回的类型：

    
    fileprivate enum Match<Index: Comparable> {
        case found(at: Index)
        case notFound(insertAt: Index)
    }
    
    extension SortedArray {
         
        /// 使用 Binary Search 找到 `newElement`
        ///
        /// - Returns: 如果 `newElement` 在数组里，就返回 `.found(at: index)`，
        ///   这里的 `index` 是数组里元素的位置
        ///   如果 `newElement` 不在这个数组里，就会返回 `.notfound(insertAt: index)`
        ///   这里的 `index` 是根据排序算法得出元素应该插入的位置
        ///   如果数组包含了多个元素，且都等于 `newElement`，那就无法保证哪一个会被找到
        ///   
        /// - Complexity: O(_log(n)_)，这里的 _n_ 是数组的大小.
        fileprivate func search(for newElement: Element) -> Match<Index> {
            ...
        }
    }

标准库里的 [index(of:)](https://developer.apple.com/reference/swift/collection/1641318-index) 返回的是一个 `Optional<Index>`，没有找到的情况就会返回 nil。而 `search(for:)` 方法也类似，但它的返回值是一个自定义的枚举，无论是 `.found` 或者 `.notFound` 都会带上一个序号作为附加信息。这可以让我们在搜索和插入时使用一致的算法：返回的序号就是我们需要维持有序数组时插入元素的位置。

算法准备就绪之后，就可以开始实现 `index(of:)` 和 [`contains(_:)`](https://developer.apple.com/reference/swift/sequence/1641180-contains)了：

    
    extension SortedArray {
    
        /// 返回特定值在集合里第一次出现的位置
        ///
        /// - Complexity: O(_log(n)_)，这里的 _n_ 是数组的大小
        public func index(of element: Element) -> Index? {
            switch search(for: element) {
            case let .found(at: index): return index
            case .notFound(insertAt: _): return nil
            }
        }
    
        /// 返回一个布尔值，表示这个序列是否包含给定的元素
        ///
        /// - Complexity: O(_log(n)_)，_n_ 是数组的大小
        public func contains(_ element: Element) -> Bool {
            return index(of: element) != nil
        }
    }

需要注意的是，这里的实现不止比标准库里的实现更高效，而且通用性更强. 标准库里这个方法还要求 `where Iterator.Element: Comparable` 的约束，而 SortedArray 总是拥有一个排序算法,所以不需要这样的约束。

## 插入元素

下一个任务是利用 binary search 的优势去提高插入元素的效率。我决定提供两个插入函数: 第一个会在正确的位置去插入单个元素，保持数组有序。它利用 binary search 去找到正确的插入位置，复杂度为 O(log n)。插入新元素到非空数组里，最糟糕的时间复杂度是 O(n)，因为全部已有元素不得不移动位置去提供空间。

第二个函数可以插入一组序列。这里我选择先把所有元素都插入到数组最后，然后进行一次重新排序. 这比重复寻找正确的插入位置更快(如果插入的数组元素个数大于 log n)。

    
    extension SortedArray {
        
        /// 插入一个新元素到数组里，并保持数组有序
        ///
        /// - Returns: 新元素插入的位置
        /// - Complexity: O(_n_)     这里的 _n_ 是数组大小
        ///    如果新元素插入到数组最后，时间复杂度下降到 O(_log n_)
        @discardableResult
        public mutating func insert(_ newElement: Element) -> Index {
            let index = insertionIndex(for: newElement)
            // 如果元素可以被插入到数组最后，则复杂度为 O(1)
            // 最糟糕的情况是 O(_n) (插入到最前面时)
            _elements.insert(newElement, at: index)
            return index
        }
    
        /// 插入 `elements` 里的所有元素到 `self` 里，保持数组有序
        /// 这会比每个元素都单独插入一遍更快
        /// 因为我们只需要重新排序一次
        ///
        /// - Complexity: O(_n * log(n)_)，_n_ 是插入后数组的大小
        public mutating func insert<S: Sequence>(contentsOf newElements: S) where S.Iterator.Element == Element {
            _elements.append(contentsOf: newElements)
            _elements.sort(by: areInIncreasingOrder)
        }
    }

## 其它优势

Chris 和 Florian 已经在这一集里做过展示，我们可以得到一个更高效的 [min() ](https://developer.apple.com/reference/swift/sequence/1641174-min) 和 [max() ](https://developer.apple.com/reference/swift/sequence/1641492-max)。因为最小值最大值分别是有序集合的第一个和最后一个元素：

    
    extension SortedArray {
         /// 返回集合里的最小值
        ///
        /// - Complexity: O(1).
        @warn_unqualified_access
        public func min() -> Element? {
            return first
        }
    
        /// 返回集合里的最大值
        ///
        /// - Complexity: O(1).
    
        @warn_unqualified_access
        public func max() -> Element? {
            return last
        }
    }

当你在类型的内部实现中调用这些函数，却没有显式地写明 `self.` 的前缀时，`@warn_unqualified_access` [会告诉编译器抛出一个警告](http://stackoverflow.com/a/36110284/116862)。这样可以帮助你避免混淆了这些函数与全局函数 [min(_:_:) ](https://developer.apple.com/reference/swift/1538339-min) 和 [max(_:_:) ](https://developer.apple.com/reference/swift/1538951-max)。

如同 `index(of:)` 和 `contains(_:)` 一样，我们的 `min()` 和 `max()` 更加通用，因为它们不需要元素是 Comparable 的. 我们获得了更高的效率，更少的约束。

> ### 只有协议要求的才可以自定义
> 这四个方法都不是 Sequence 和 Collection 协议里要求必须实现的，他们不在协议的定义里。他们只是拓展里的默认实现。结果就是，调用这些方法的时候都会是静态派发，因为他们不是[可自定义的](https://developer.apple.com/videos/play/wwdc2015-408/?time=1767)。
>
> SortedArray 里的实现并不会重写默认实现(因为只要协议里定义的方法才可以被重写)，他们只是附属品。当你直接使用 SortedArray 的时候，更加高效的实现会让你收益。但当它们作为泛型时将永远不会被调用。例如：

>     
    > let numbers = SortedArray(unsorted: [3,2,1])
    > // 这会直接调用 SortedArray.max()
    > let a = numbers.max()
    
    > func myMax<S: Sequence>(_ sequence: S ) -> S.Iterator.Element?
    >     where S.Iterator.Element: Comparable {
    >     return sequence.max()
    > }
    
    > // 这种写法调用的是 Sequence.max() 了(更低效的版本)
    > let b = myMax(numbers)
    >
> 我们没办法改变这个 "bug"，[swift-evolution](https://swift.org/community/#mailing-lists) 有讨论过让这些方法变成协议的一部分(我不确定这是不是一个好的做法)。

> *2017.02.09 更新: 我忘了 `index(of:)` 和 `contains(_:)` 这些方法，现在还不是 Sequence 和 Collection 的一部分，因为他们需要 Iterator.Element 是 Equatable 的。而现在还没有方法去定义一个泛型协议。[Brent Royal-Gordon 在 swift-evolution 里进行了相关的讨论](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20170206/031667.html)并且提问泛型协议是否应该加入 Swift 里。*

## 切片

我尝试着把 SortedArray 保存在一个 [ArraySlice](https://developer.apple.com/reference/swift/arrayslice) 而不是 Array 里，这么做的优势就是可以非常简单地把 SortedArray.SubSequence 定义为 ArraySlice。这会让切片操作变得非常简单，因为 sortedArray.prefix(5) 会直接返回另一个 SortedArray，而不是默认的 [RandomAccessSlice](https://developer.apple.com/reference/swift/randomaccessslice)。

最后我还是决定放弃这种做法，因为长时间持有一个 ArraySlice 的实例不是一件好事. 就算只持有一个非常大的数组的切片，也会一直间接持有那个大的数组，这会导致非常高的内存占用，这是使用者不想看到的，就算基底 Array 的内存不会泄露，但切片还是会让它无法及时释放。

## 外部 Modules 引入的泛型类型的性能表现

如果你想在你的代码里使用 SortedArray (或者别的性能要求比较高的泛型)，我建议你不要直接把它作为第三方 module 引入，而是 [直接把源代码文件加入到你的 module 里](https://github.com/apple/swift/blob/master/docs/OptimizationTips.rst#advice-put-generic-declarations-in-the-same-module-where-they-are-used)。

就 Swift 3 而言，Swift 无法在跨 Module 的情况下表现出泛型类型的优势。换而言之，如果你在代码里使用了 `SortedArray<Int>`，并且 SortedArray 是定义在另一个 Module 的时候，编译器无法为元素为 Int 的 Array 优化生成代码，只能按照常规的方式，将每一个泛型值打包到一个容器里，然后通过 witness table 进行方法派发。这很容易造成你的代码在执行时被拖慢[一到两个数量级](https://github.com/lorentey/BTree#remark-on-performance-of-imported-generics)。

> 当前版本的 Swift 编译器无法约束从外部 Module 引入的泛型(标准库除外)。…这个限制会让外部 Module 引入的集合类型性能大幅下降。特别当集合中的元素是简单的，被极度优化的值类型，例如 Int，甚至是 String。 依赖引入的 Module，你的集合装填基础数据类型时性能会有 10-200 倍的下降。

标准库是唯一一个例外，标准库里的类型对于任何 Module 都是可见的。

我希望 Swift 编译器团队可以找到一个方法解决这个问题。虽然我不知道该怎么做。编译器现在加入了一个
[非正式的修饰符 @_specialize](https://oleb.net/blog/2017/02/sorted-array/attribute) (可能在[之后会加入一个新的语法](https://github.com/apple/swift/pull/6486))。给一个方法添加这个修饰符时，相关的类型就告诉编译器为自己生成特殊的代码。目前正在开发的版本里，这个修饰符好像支持使用 `_Trivial64` 去把所有不那么重要的值类型都封装成相同的大小。

## 总结

[完整的实现](https://github.com/ole/SortedArray) 总共两百多行，包括注释。

就像你看到的，自定义集合类型有很多需要考量的东西。而且我们都只考虑了接口的设计，我们甚至还没接触底层的实现。但我觉得这些付出都是有回报的。我们获得了一个行为和内建集合类型完全一致的类型，兼容序列和集合操作的同时还会根据算法自我变化。

虽然跨 Module 使用泛型类型确实对于性能有很大的影响。


> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。