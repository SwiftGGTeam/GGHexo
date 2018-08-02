构建一个 @synchronized"

> 作者：Mike Ash，[原文链接](https://www.mikeash.com/pyblog/friday-qa-2015-02-20-lets-build-synchronized.html)，原文日期：2015-02-20
> 译者：[Sunnyyoung](undefined)；校对：[智多芯](http://hulizhen.me)；定稿：[numbbbbb](http://numbbbbb.com/)，[CMB](https://github.com/chenmingbiao)
  









上一篇文章讲了线程安全，今天这篇最新一期的 Let's Build 我会探讨一下如何实现 Objective-C 中的 `@synchronized`。本文基于 Swift 实现，Objective-C 版本大体上也差不多。



## 回顾

`@synchronized` 在 Objective-C 中是一种控制结构。它接受一个对象指针作为参数，后面跟着一段代码块。对象指针充当锁，在任何时候 `@synchronized` 代码块中只允许有一个线程使用该对象指针。

这是一种使用锁进行多线程编程的简单方法。举个例子，你可以使用 `NSLock` 来保护对 NSMutableArray 的操作：

    objc
    NSMutableArray *array;
    NSLock *arrayLock;
    
    [arrayLock lock];
    [array addObject: obj];
    [arrayLock unlock];

也可以使用 `@synchronized` 来将数组本身加锁：

    objc
    @synchronized(array) {
        [array addObject: obj];
    }

我个人更喜欢显式的锁，这样做既可以使事情更清楚，`@synchronized` 的性能没那么好，原因如下图所示。但它（`@synchronized`）使用很方便，不管怎样，实现起来都很有意思。

## 原理

Swift 版本的 `@synchronized` 是一个函数。它接受一个对象和一个闭包，并使用持有的锁调用闭包：

    
    func synchronized(obj: AnyObject, f: Void -> Void) {
        ...
    }

问题是，如何将任意对象变成锁？

在一个理想的世界里（从实现这个函数的角度来看），每个对象都会为锁留出一些额外空间。在这个额外的小空间里 `synchronized` 可以使用适当的 `lock` 和 `unlock` 方法。然而实际上并没有这种额外空间。这可能是件好事，因为这会增大对象占用的内存空间，但是大多数对象永远都不会用到这个特性。

另一种方法是用一张表来记录对象到锁的映射。`synchronized` 可以查找表中的锁，然后执行 `lock` 和 `unlock` 操作。这种方法的问题是表本身需要保证线程安全，它要么需要自己的锁，要么需要某种特殊的无锁数据结构。为表单独设置一个锁要容易得多。

为了防止锁不断累积常驻，表需要跟踪锁的使用情况，并在不再需要锁的时候销毁或者复用。

## 实现

要实现将对象映射到锁的表，`NSMapTable` 非常合适。它可以把原始对象的地址设置成键（key），并且可以保存对键（key）和值（value）的弱引用，从而允许系统自动回收未被使用的锁。

    
    let locksTable = NSMapTable.weakToWeakObjectsMapTable()

表中存储的对象是 `NSRecursiveLock` 实例。因为它是一个类，所以可以直接用在 `NSMapTable` 中，这点 `pthread_mutex_t` 就做不到。`@synchronized` 支持递归语义，我们的实现一样支持。

表本身也需要一个锁。自旋锁（spinlock）在这种情况下很适合使用，因为对表的访问是短暂的：

    
    var locksTableLock = OS_SPINLOCK_INIT

有了这个表，我们就可以实现以下方法：

    
    func synchronized(obj: AnyObject, f: Void -> Void) {

它所做的第一件事就是在 `locksTable` 中找出与 `obj` 对应的锁，执行操作之前必须持有 `locksTableLock` 锁：

    
    OSSpinLockLock(&locksTableLock)
    var lock = locksTable.objectForKey(obj) as! NSRecursiveLock?

如果表中没有找到对应锁，则创建一个新锁并保存到表中：

    
    if lock == nil {
        lock = NSRecursiveLock()
        locksTable.setObject(lock!, forKey: obj)
    }

有了锁之后主表锁就可以释放了。为了避免死锁这必须要在调用 `f` 之前完成：

    
    OSSpinLockUnlock(&locksTableLock)

现在我们可以调用 `f` 了，在调用前后分别进行加锁和解锁操作：

    
        lock!.lock()
        f()
        lock!.unlock()
    }

## 对比苹果的方案

苹果实现 `@synchronized` 的方案可以在 Objective-C runtime 源码中找到:

http://www.opensource.apple.com/source/objc4/objc4-646/runtime/objc-sync.mm

它的主要目标是性能，因此不像上面那个玩具般的例子那么简单。对比它们之间有什么异同是一件非常有趣的事。

基本概念是相同的。存在一个全局表，它将对象指针映射到锁，然后该锁在 `@synchronized` 代码块前后进行加锁解锁操作。

对于底层的锁对象，Apple 使用配置为递归锁的 `pthread_mutex_t`。`NSRecursiveLock` 内部很可能也使用了 `pthread_mutex_t`，直接使用就省去了中间环节，并避免了运行时对 Foundation 的依赖。

表本身的实现是一个链表而不是一个哈希表。常见的情况是在任何给定的时间里只存在少数几个锁，所以链表的性能表现很不错，可能比哈希表性能更好。每个线程缓存了最近在当前线程查找的锁，从而进一步提高性能。

苹果的实现并不是只有一个全局表，而是在一个数组里保存了 16 个表。对象根据地址映射到不同的表，这减少了不同对象 `@synchronized` 操作导致的不必要的资源竞争，因为它们很可能使用的是两个不同的全局表。

苹果的实现没有使用弱指针引用（这会大量增加额外开销），而是为每个锁保留一个内部的引用计数。当引用计数达到零时，该锁可以给新对象重新使用。未使用的锁不会被销毁，但复用意味着在任何时间锁的总数都不能超过激活锁的数量，也就是说锁的数量不随着新对象的创建无限制增长。

苹果的实现方案非常巧妙，性能也不错。但与使用单独的显式锁相比，它仍然会带来一些不可避免的额外开销。尤其是：

1. 如果不相关的对象刚好被分配到同一个全局表中，那么它们仍然可能存在资源竞争。
2. 通常情况下在线程缓存中查找一个不存在的锁时，必须获取并释放一个自旋锁。
3. 必须做更多的工作来查找全局表中对象的锁。
4. 即使不需要，每个加锁/解锁周期都会产生递归语义方面的开销。

## 结论

`@synchronized` 是一个有趣的语言结构，实现起来并不简单。它的作用是实现线程安全，但它的实现本身也需要同步操作来保证线程安全。我们使用全局锁来保护对锁表的访问，苹果的实现中则使用不同的技巧来提高性能。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。