title: "GCD 使用指南"
date: 2016-05-05
tags: [Swift 进阶]
categories: [Soroush Khanlou]
permalink: the-gcd-handbook
keywords: grand central dispatch
custom_title: 
description: GCD 是一个具备底层特性的框架，在 Swift 中使用可以构建高层级的抽象行为，不会的来看下本指南上手吧。

---
原文链接=http://khanlou.com/2016/04/the-GCD-handbook/
作者=Soroush Khanlou
原文日期=2016-04-25
译者=walkingway
校对=numbbbbb
定稿=numbbbbb

<!--此处开始正文-->

**Grand Central Dispatch** 大中枢派发😂 或俗称 GCD 是一件极其强大的武器。它为你提供了很多底层工具（比如队列和信号量），你可以组合这些工具来实现自己想要的多线程效果。不幸的是，这些基于 C 的 API 晦涩难懂，此外将低级工具组合起来实现高抽象层级 API（译者注：类似于 `NSOperation`）也不是一件容易的事。在这篇文章中，我会教大家如何利用 GCD 提供的工具来实现高抽象层级的行为。[英文原文](http://khanlou.com/2016/04/the-GCD-handbook/)

<!--more-->

## 后台执行

这或许是 GCD 提供的最简单的工具了，你可以在后台线程中处理一些工作，处理完毕后返回主线程继续执行（因为 UIKit 相关的操作只能在主线程中进行）。

在本指南中，我将使用 `doSomeExpensiveWork()` 函数来表示一个长时间执行的任务，它会返回一个值。

这种模式的代码如下所示：

```
let defaultPriority = DISPATCH_QUEUE_PRIORITY_DEFAULT
let backgroundQueue = dispatch_get_global_queue(defaultPriority, 0)
dispatch_async(backgroundQueue, {
	let result = doSomeExpensiveWork()
	dispatch_async(dispatch_get_main_queue(), {
		//使用 `result` 做各种事
	})
})
```

在实际项目中，除了 `DISPATCH_QUEUE_PRIORITY_DEFAULT`，我们几乎用不到其他的优先级选项。`dispatch_get_global_queue()` 将返回一个队列，其中可能有数百个线程在并发执行。如果你经常需要在后台队列执行开销庞大的操作，那可以用 `dispatch_queue_create` 创建自己的队列，`dispatch_queue_create` 带两个参数，第一个是需要指定的队列名，第二个说明是串行队列还是并发队列。

注意，每次调用使用的是 `dispatch_async` 而不是 `dispatch_sync`。`dispatch_async` 将在 block 执行前立即返回，而 `dispatch_sync` 则会等到 block 执行完毕后才返回。内部的调用可以使用 `dispatch_sync`（因为不在乎什么时候返回），但是外部的调用必须是 `dispatch_async`（否则主线程会被阻塞）。

## 创建单例

`dispatch_once` 这个 API 可以用来创建单例。不过这种方式在 Swift 中已不再重要，Swift 有更简单的方法来创建单例。我这里就只贴 OC 的实现：

```
+ (instancetype) sharedInstance {  
	static dispatch_once_t onceToken;  
	static id sharedInstance;  
	dispatch_once(&onceToken, ^{  
		sharedInstance = [[self alloc] init];  
	});  
	return sharedInstance;  
}  
``` 

## 摊平 completion block

至此我们的 GCD 之旅开始变得有趣起来。我们可以使用*信号量*来阻塞一个线程任意时间，直到一个信号从另一个线程发出。信号量和 GCD 的其他部分一样是线程安全的，并且能够从任意位置被触发。

如果你想同步执行一个异步 API，那你可以使用信号量，但是你不能修改它。

```
// 在后台队列
dispatch_semaphore_t semaphore = dispatch_semaphore_create(0)
doSomeExpensiveWorkAsynchronously(completionBlock: {
    dispatch_semaphore_signal(semaphore)
})
dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER)
// 现在开销很大的异步工作已经完成
```

调用 `dispatch_semaphore_wait` 会阻塞线程，直到 `dispatch_semaphore_signal` 被调用。这就意味着 `signal` **必须**从不同的线程被调用，因为当前线程已经被阻塞。你永远都不应该在主线程中调用 `wait`，只能在后台线程中调用它。

你可以在调用 `dispatch_semaphore_wait` 时设置一个超时时间，但是我一般会使用 `DISPATCH_TIME_FOREVER`。

为什么在已有 completion block 的情况下还要摊平代码？因为方便呀，我能想到的一种场景是串行执行一组异步程序（即只有前一个任务执行完成，才会继续执行下一个任务）。下面把上述想法简单地抽象成一个 `AsyncSerialWorker` 类：

```
typealias DoneBlock = () -> ()
typealias WorkBlock = (DoneBlock) -> ()

class AsyncSerialWorker {
    private let serialQueue = dispatch_queue_create("com.khanlou.serial.queue", DISPATCH_QUEUE_SERIAL)

    func enqueueWork(work: WorkBlock) {
        dispatch_async(serialQueue) {
            let semaphore = dispatch_semaphore_create(0)
            work({
                dispatch_semaphore_signal(semaphore)
            })
            dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER)
        }
    }
}
```

上面这个简短的类创建了一个串行队列，允许你将 work 的入队列操作放进 block 中。`WorkBlock` 需要一个 `DoneBlock` 作为参数，而 `DoneBlock` 会在当前工作结束时被执行，我们通过将 `DoneBlock` 设置为 `{dispatch_semaphore_signal(semaphore)}` 来调整信号量，从而让串行队列继续执行下去。

> 译者注：既然已经使用了 DISPATCH_QUEUE_SERIAL，那么队列中 work 的执行顺序不应该是先进先出的吗？确实是这样，但如果我们把 work 看成是一个耗时的网络操作，其内部是提交到其他线程并发去执行（`dispatch_async`），也就是每次执行到 work 就立刻返回了，即使最终结果可能还未返回。那么我们想要保证队列中的 work 等到前一个 work 执行返回结果后才执行，就需要 `semaphore`。说了这么多还是举个例子吧，打开 Playground：

```
import UIKit
import XCPlayground

typealias DoneBlock = () -> ()
typealias WorkBlock = (DoneBlock) -> ()

class AsyncSerialWorker {
    private let serialQueue = dispatch_queue_create("com.khanlou.serial.queue", DISPATCH_QUEUE_SERIAL)
    
    func enqueueWork(work: WorkBlock) {
        dispatch_async(serialQueue) {
            let semaphore = dispatch_semaphore_create(0)
            work({
                dispatch_semaphore_signal(semaphore)
            })
            dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER)
        }
    }
}

let a = AsyncSerialWorker()

for i in 1...5 {
    a.enqueueWork { doneBlock in
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0)) {
            sleep(arc4random_uniform(4)+1)
            print(i)
            doneBlock()
        }
    }
}

XCPlaygroundPage.currentPage.needsIndefiniteExecution = true
```

> 此时的输出结果为：`1，2，3，4，5`，如果将关于 `semaphore` 的代码都注释掉，结果就不会是按顺序输出了。

> `dispatch_semaphore_create(0)` 当两个线程需要协调处理某个事件时，我们在这里传入 0；内部其实是维护了一个计数器，下面会说到。

## 限制并发的数量

在上面的例子中，信号量被用作一个简单的标志，但它也可以当成一个有限资源的计数器。如果你想针对某些特定的资源限制连接数，可以这样做：

```
class LimitedWorker {
    private let concurrentQueue = dispatch_queue_create("com.khanlou.concurrent.queue", DISPATCH_QUEUE_CONCURRENT)
    private let semaphore: dispatch_semaphore_t
    
    init(limit: Int) {
    	semaphore = dispatch_semaphore_create(limit)
    }

    func enqueueWork(work: () -> ()) {
        dispatch_async(concurrentQueue) {
            dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER)
            work()
            dispatch_semaphore_signal(semaphore)
        }
    }
}
```

这个例子来自于苹果官方的[多线程编程指南](https://developer.apple.com/library/ios/documentation/General/Conceptual/ConcurrencyProgrammingGuide/OperationQueues/OperationQueues.html#//apple_ref/doc/uid/TP40008091-CH102-SW24)，官方给出的解释如下：

> 在创建信号量时，可以限定资源的可用数。这个可用数（long 类型）会在信号量初始化时作为参数传入。每次等待信号量时，`dispatch_semaphore_wait` 都会消耗一次可用数，如果结果为负，函数会告诉内核阻断你的线程。另一方面，`dispatch_semaphore_signal` 函数每次执行都会将该可用计数 `+ 1`，以此来表明已经释放了资源。如果此刻有因为等待可用资源而被阻隔的任务，系统会从等待的队列中解锁一个任务来执行。

这个效果类似 `NSOperationQueue` 的 `maxConcurrentOperationCount`。如果你使用原生的 GCD 队列而不是 `NSOperationQueue`，你就能使用信号量来限制并发任务的数量。

值得注意是：每次调用 `enqueueWork` 都会将 work 提交到一个`并发队列`，而该`并发队列`收到任务就会丢出去执行，直到触碰到信号量数量耗尽的天花板（work 入队列的速度太快，`dispatch_semaphore_wait` 已经消耗完了所有的数量，而之前的 work 还未执行完毕，`dispatch_semaphore_signal` 不能增加信号量的可用数量）

## 等待许多并发任务完成

如果你有许多 blocks 任务要去执行，你需要在它们全部完成时得到通知，那可以使用 group。`dispatch_group_async` 允许你在队列中添加任务（这些任务应该是同步执行的），而且你会追踪有多少被添加的任务。注意：同一个 `dispatch group` 能够添加不同队列上的任务，并且能保持对所有组内任务的追踪。当所有被追踪的任务完成时，一个传递给 `dispatch_group_notify` 的 `block` 会被触发执行，有点类似于 `completion block`

```swift
dispatch_group_t group = dispatch_group_create()
for item in someArray {
	dispatch_group_async(group, backgroundQueue, {
		performExpensiveWork(item: item)
	})
}
dispatch_group_notify(group, dispatch_get_main_queue(), {
	// 所有任务都已完成
}
```

这个例子很好地展示了如何摊平 completion block。Dispatch group 会在 block 返回时调用 completion block，所以你需要在 block 中等待所有任务完成。

下面这个例子更加详细地展示了 dispatch group 的用法，如果你的任务已经是异步，可以这样使用：

```
// 必须在后台队列使用
dispatch_group_t group = dispatch_group_create()
for item in someArray {
	dispatch_group_enter(group)
	performExpensiveAsyncWork(item: item, completionBlock: {
		dispatch_group_leave(group)
	})
}

dispatch_group_wait(group, DISPATCH_TIME_FOREVER)

// 所有任务都已完成
```

这段代码更加复杂，不过认真阅读还是能看懂的。和信号量一样，groups 同样保持着一个线程安全的、可以操控的内部计数器。你可以使用这个计数器来确保在 completion block 执行前，多个大开销任务都已执行完毕。使用 `enter` 来增加计数器，使用 `leave` 来减少计数器。`dispatch_group_async` 已为你处理了这些细节，所以尽情地享受即可。

代码片段的最后一行是 `wait` 调用：它会阻断当前线程并且等计数器到 0 时继续执行。注意，虽然你使用了 `enter/leave` API，但你还是能够通过 `dispatch_group_notify` 将 block 提交到队列中。反过来也成立：如果你用了 `dispatch_group_async` API，也能使用 `dispatch_group_wait`。

`dispatch_group_wait` 和 `dispatch_semaphore_wait` 一样接收一个超时参数。再次重申，我更喜欢 `DISPATCH_TIME_FOREVER`。另外，不要在主线程中调用 `dispatch_group_wait`。

上面两段代码最大的区别是，`notify` 可以在主线程中调用，而 `wait` 只能在后台线程中调用（至少 `wait` 部分要在后台线程中调用，因为它会完全阻塞当前线程）。

## 隔离队列

Swift 中的字典（和数组）都是值类型，当它们被修改时，它们的引用会被一个新的副本所替代。但是，因为更新 Swift 对象的实例变量操作并不是原子性的，所以这些操作不是线程安全的。如果两个线程同一时间更新一个字典（比如都添加一个值），而且这两个操作都尝试写同一块内存，这就会导致内存崩坏。我们可以使用隔离队列来实现线程安全。

先构建一个**标识映射** [Identity Map](http://martinfowler.com/eaaCatalog/identityMap.html)，一个标识映射是一个字典，表示从 `ID` 到 model 对象的映射。

> 标识映射（Identity Map）模式将所有已加载对象放在一个映射中，确保所有对象只被加载一次，并且在引用这些对象时使用该映射来查找对象。在处理数据并发访问时，需要一种策略让多个用户共同操作同一个业务实体，这个很重要。同样重要的是，单个用户在一个长运行事务或复杂事务中始终使用业务实体的一致版本。标识映射模式会为事务中使用所有的业务对象保存一个版本，如果一个实体被请求两次，会得到同一个实体。

```
class IdentityMap<T: Identifiable> {
	var dictionary = Dictionary<String, T>()
	
	func object(forID ID: String) -> T? {
		return dictionary[ID] as T?
	}
	
	func addObject(object: T) {
		dictionary[object.ID] = object
	}
}
```

这个对象基本就是一个字典封装器，如果有多个线程在同一时刻调用函数 `addObject`，内存将会崩坏，因为线程会操作相同的引用。这也是操作系统中的经典的[读者-写者问题](https://en.wikipedia.org/wiki/Readers–writers_problem)，简而言之，我们可以在同一时刻有多个读者，但同一时刻只能有一个线程可以写入。

幸运的是 GCD 针对在该场景下同样拥有强力武器，我们可以使用如下四个 API：

- `dispatch_sync`
- `dispatch_async`
- `dispatch_barrier_sync`
- `dispatch_barrier_async`

理想的情况是，读操作并发执行，写操作异步执行并且必须确保没有其他操作同时执行。GCD 的 `barrier` 集合 API 提供了解决方案：它们会在队列中的任务清空后执行 block。使用 `barrier` API 可以限制我们对字典对象的写入，并且确保我们不会在同一时刻执行多个写操作，或者在执行写操作同时执行读操作。

```
class IdentityMap<T: Identifiable> {
	var dictionary = Dictionary<String, T>()
	let accessQueue = dispatch_queue_create("com.khanlou.isolation.queue", DISPATCH_QUEUE_CONCURRENT)
	    
	func object(withID ID: String) -> T? {
		var result: T? = nil
		dispatch_sync(accessQueue, {
			result = dictionary[ID] as T?
		})
		return result
	}
	    
	func addObject(object: T) {
		dispatch_barrier_async(accessQueue, {
			dictionary[object.ID] = object
		})
	}
}
```

`dispatch_sync` 将会分发 block 到我们的隔离队列上，然后等待其执行完毕。通过这种方式，我们就实现了同步读操作（如果我们想异步读取，getter 方法就需要一个 completion block）。因为 `accessQueue` 是并发队列，这些同步读取操作可以并发执行，也就是允许同时读。

`dispatch_barrier_async` 将分发 block 到隔离队列上，`async` 异步部分意味着会立即返回，并不会等待 block 执行完毕。这对性能有好处，但是在一个写操作后立即执行一个读操作会导致读到一个半成品的数据（因为可能写操作还未完成就开始读了）。

`dispatch_barrier_async` 中 `barrier` 部分的逻辑是：barrier block 进入队列后不会立即执行，而是会等待该队列其他 block 执行完毕后再执行。这就保证了我们的 `barrier block` 每次都只有它自己在执行。而所有在它之后提交的 block 也会一直等待这个 barrier block 执行完再执行。

> 传入 `dispatch_barrier_async()` 函数的 **queue**，必须是 `dispatch_queue_create` 创建的并发 **queue**。如果是串行 **queue** 或者是 **global concurrent queues**，这个函数就变成 `dispatch_async()` 了

## 总结

GCD 是一个具备底层特性的框架，通过它，我们可以构建高层级的抽象行为。如果还有一些我没提到的可以用 GCD 构建的高层行为，请告诉我。