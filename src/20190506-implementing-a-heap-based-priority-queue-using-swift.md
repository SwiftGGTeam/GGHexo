title: "使用 Swift 实现基于堆的优先级队列"
date: 2019-05-06
tags: [Swift, Algorithm, Data Structure, Priority Queue]
categories: [AppCoda, iOS]
permalink: implementing-a-heap-based-priority-queue-using-swift
keywords: [Swift, Swift Algorithm]
custom_title: "使用 Swift 实现基于堆的优先级队列"
description: "本文解释了优先级队列、堆等相关概念，并展示了如何使用 Swift 实现基于堆的优先级队列。"

---

原文链接=https://appcoda.com/swift-algorithm/
作者=APPCODA EDITORIAL TEAM
原文日期=2019-01-07
译者=Roc Zhang
校对=pmst,numbbbbb
定稿=Forelax

<!--此处开始正文-->

在计算机科学中，有很多问题可以通过将底层数据结构用优先级队列实现来改善算法的时间复杂度。其中 Dijkstra 的最短路径算法便是一个例子，该算法使用了优先级队列来在图中搜索两个顶点间的最短路径。

不幸的是，Swift 的标准库中并没有提供优先级队列的默认实现。所以我们将会研究如何自行实现基于堆的优先级队列。

<!--more-->

如果你想在自己的 IDE 中一起动手来操作，点击 [此链接](https://github.com/JimmyMAndersson/HeapPriorityQueue) 便可获取到源码。

## 什么是优先级队列？

优先级队列是一种可以对具有相对优先级的对象进行高效排序的数据结构。它会根据队列中每个对象的优先级，一个个将队列中的对象进行排序。

假设你创建了一系列任务并准备在将来的某个时间点运行它们，利用优先级队列就可以让这些任务按照你预期执行。

在接下来的文章中，我们将使用堆结构来实现我们的优先级队列。

## 什么是堆？

我们可以把堆看作是每个节点最多只有两个子节点的树，但与树不同的是，向堆中添加新节点时要尽可能往顶层左侧放置。如下图所示：

![](https://appcoda.com/wp-content/uploads/2019/01/Conceptual-sketch-of-a-new-node-being-inserted-into-a-heap.png)

同时，堆还具有着一些与节点间相对大小关系相关的特性。一个最小堆（就是我们即将要使用的）有着每一个节点比其子节点都要小的特性。最大堆则正好相反。

为了能够维持这种性质，我们需要通过一些操作来得到节点的正确位置顺序。当我们插入一个新节点时，先将它放在树的顶层左侧开始的第一个空余可用的位置上。如果在放置后最小堆的性质不成立，则将此节点与它的父节点交换，直到最小堆性质成立为止。下图展示了向一个已有的最小堆中插入数字 2 的情况。

![](https://appcoda.com/wp-content/uploads/2019/01/Maintaining-the-min-heap-property-on-insertion.png)

当要把一个对象移出队列时，需限制只从队列的某一端进行操作。在这里我们将通过限定只能删除根节点的方式来实现。当根节点被移除时，会被顶层最右边的节点替代。由于新节点成为根节点后有很大概率会过大，我们将把它向下移动，把它与最小的子节点交换，直到我们恢复最小堆。

## 关于实现本身的简短说明

我们将采用数组来实现一个既快速又节省空间的树结构。这里我不打算过于深入其中的数学运算，但如果你有兴趣的话，可以看一看这个 [链接](https://en.wikipedia.org/wiki/Heap_%28data_structure%29#Implementation)，它解释了数学在其中运用的方式与背后的原因。

准备好了吗？我们开始吧。

## 设计协议

同往常一样，我们先来定义对象要展示给外部用户怎样的功能。我们以定义协议的方式来完成这件事，稍后再让具体的类来遵循它。我为队列设计的协议如下：

```swift
protocol Queue {
  associatedtype DataType: Comparable

  /**
  将一个新元素插入到队列中。
  - 参数 item：要添加的元素。
  - 返回值：插入是否成功。
  */
  @discardableResult func add(_ item: DataType) -> Bool

  /**
  删除首个元素。
  - 返回值：被移除的元素。
  - 抛出值：QueueError 类型的错误。
  */
  @discardableResult func remove() throws -> DataType

  /**
  获取到队列中的首个元素，并将其移出队列。
  - 返回值：一个包含队列中首个元素的可选值。
  */
  func dequeue() -> DataType?

  /**
  获取队列中的首个元素，但不将它移出队列。
  - 返回值：一个包含队列中首个元素的可选值。
  */
  func peek() -> DataType?

  /**
  清空队列。
  */
  func clear() -> Void
}
```

该协议明确了我们需要实现的功能，供外部用户调用。协议同样还说明了其中的某一个方法可能会抛出错误，且根据文档我们能够了解到它会是一个 QueueError 类型的错误，因此我们同样也要实现它。

```swift
enum QueueError: Error {
  case noSuchItem(String)
}
```

这段代码非常简明扼要：当用户尝试从空队列中删除元素时，我们会抛出上面这样的错误。

现在所有的准备工作已经完成，让我们开始实现队列本身。

## 实现优先级队列

我们将首先从声明 PriorityQueue 类开始，然后再实现它的初始化方法与存储元素，同时完成一些“有则更好”的方法。代码看起来是这样的：

```swift
/**
 基于堆数据结构的 PriorityQueue 实现。
*/

class PriorityQueue<DataType: Comparable> {

  /**
   队列的存储。
  */
  private var queue: Array<DataType>
  
  /**
   当前队列的大小。
  */
  public var size: Int {
    return self.queue.count
  }
  
  public init() {
    self.queue = Array<DataType>()
  }
}
```

你也许注意到了，我们目前还没有实现队列的协议。当我们进行编码时，通常希望事物之间能保持相对分离。并且希望能创建出一个概览从而方便我们去进行查找。有些类可能会逐渐变得非常大，解决这种情况的方法之一是使用扩展作用域。这样，每一个扩展倾向于只做一个任务（比如去遵循一个协议，处理存储与初始化，又或是嵌套类的声明等），事后再去查找时就会容易很多。让我们在这里也尝试使用这种方式。首先，实现一个 Int 类型的私有扩展，这能够帮助我们执行一些预先定义好的索引计算:

```swift
private extension Int {
  var leftChild: Int {
    return (2 * self) + 1
  }
  
  var rightChild: Int {
    return (2 * self) + 2
  }
  
  var parent: Int {
    return (self - 1) / 2
  }
}
```

由于是私有的访问权限，这个扩展只在 PriorityQueue 文件中可用。这里聚集了我们将要使用的获取某个节点的子节点与父节点的计算。这样我们就可以通过调用 .leftChild 属性来方便的获取到左子节点的索引，而不必在实现中去进行一堆的数学运算了，以此类推。

下面是我们对 Queue 协议的遵循实现:

```swift
extension PriorityQueue: Queue {
  @discardableResult
  public func add(_ item: DataType) -> Bool {
    self.queue.append(item)
    self.heapifyUp(from: self.queue.count - 1)
    return true
  }
  
  @discardableResult
  public func remove() throws -> DataType {
    guard self.queue.count > 0 else {
      throw QueueError.noSuchItem("Attempt to remove item from an empty queue.")
    }
    return self.popAndHeapifyDown()
  }
  
  public func dequeue() -> DataType? {
    guard self.queue.count > 0 else {
      return nil
    }
    return self.popAndHeapifyDown()
  }
  
  public func peek() -> DataType? {
    return self.queue.first
  }
  
  public func clear() {
    self.queue.removeAll()
  }
  
  /**
  弹出队列中的第一个元素，并通过将根元素移向队尾的方式恢复最小堆排序。
  - 返回值: 队列中的第一个元素。
  */
  private func popAndHeapifyDown() -> DataType {
    let firstItem = self.queue[0]
    
    if self.queue.count == 1 {
      self.queue.remove(at: 0)
      return firstItem
    }
    
    self.queue[0] = self.queue.remove(at: self.queue.count - 1)
    
    self.heapifyDown()
    
    return firstItem
  }
  
  /**
   通过将元素移向队头的方式恢复最小堆排序。
   - 参数 index: 要移动的元素的索引值。
   */
  private func heapifyUp(from index: Int) {
    var child = index
    var parent = child.parent
    
    while parent >= 0 && self.queue[parent] > self.queue[child] {
      swap(parent, with: child)
      child = parent
      parent = child.parent
    }
  }
  
  /**
   通过将根元素移向队尾的方式恢复队列的最小堆排序。
   */
  private func heapifyDown() {
    var parent = 0
    
    while true {
      let leftChild = parent.leftChild
      if leftChild >= self.queue.count {
        break
      }
      
      let rightChild = parent.rightChild
      var minChild = leftChild
      if rightChild < self.queue.count && self.queue[minChild] > self.queue[rightChild] {
        minChild = rightChild
      }
      
      if self.queue[parent] > self.queue[minChild] {
        self.swap(parent, with: minChild)
        parent = minChild
      } else {
        break
      }
    }
  }
  
  /**
   交换存储中位于两处索引值位置的元素。
   - 参数 firstIndex：第一个要交换元素的索引。
   - 参数 secondIndex：第二个要交换元素的索引。
   */
  private func swap(_ firstIndex: Int, with secondIndex: Int) {
    let firstItem = self.queue[firstIndex]
    self.queue[firstIndex] = self.queue[secondIndex]
    self.queue[secondIndex] = firstItem
  }
}
```

这里的内容有点多，你也许会想多读上一两次。其中，最上面是我们先前在协议中所定义好的所有方法，下面则是一些私有的，仅在此类中可用的辅助方法。我已经为这些辅助方法加上了注释，以便你能快速的了解到它们是用来做什么的。此外，记得关注一下先前对 Int 的扩展在这里是如何被使用的。依我看来，这是非常简洁实用的设计。

## 总结

现在，我们已经完成了所有 PriorityQueue 所需要的功能。现在我们将添加对 CustomStringConvertible 协议的实现，以便在向 print 函数传入一个队列后能得到一些可阅读的内容:

```swift
extension PriorityQueue: CustomStringConvertible {
  public var description: String {
    return self.queue.description
  }
}
```

赞!

上述就是这次的全部内容了。现在你已经知道了如何去实现一个基于堆数据结构的优先级队列。如果有任何疑问，欢迎发表评论。

要了解 iOS 开发的更多信息，请查看我之前的文章:
[Introduction To Protocol Oriented Programming](https://medium.com/swlh/introduction-to-protocol-oriented-programming-1ff3862f9a3c)
[Using Swift Extensions To Clean Up Our Code](https://medium.com/@JimmyMAndersson/using-swift-extensions-to-clean-up-our-code-1aed32da24bc)