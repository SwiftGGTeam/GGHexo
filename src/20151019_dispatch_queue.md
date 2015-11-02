title: "Friday Q&A 2015-09-04:让我们来自定义 dispatch_queue"
date: 2015-10-19 09:00:00
tags: [Mike Ash]
categories: [Swift 进阶]
permalink: friday-qa-2015-09-04-lets-build-dispatch_queue

---
原文链接=https://www.mikeash.com/pyblog/friday-qa-2015-09-04-lets-build-dispatch_queue.html
作者=Mike Ash
原文日期=2015-09-04
译者=Yake
校对=shanks
定稿=小锅
发布时间=2015-10-19T09:00:00

> 译者注：这篇文章的代码是用 Objective-C 完成的，不过不妨碍大家学习多线程编码的知识。

`Grand Central Dispatch` 是过去几年中苹果推出过的许多很棒的 API 中的一员。在最新一期的 “Let's Build” 系列中，我准备去探索 dispatch_queue 一些最基本特性的重新实现，这个主题的建议来自 Rob Rix。
<!--more-->

# 概述

一个调度队列（Dispatch Queue）是存储在全局线程池中的队列任务。通常，提交到队列中的任务会在后台线程中异步地执行。所有的线程共用一个后台线程池，这使得系统更加地高效。

我将重新实现 GCD 中那些必要的 API。为了简单起见，我会忽略掉 GCD 提供的许多有趣的特性。举个例子，全局线程池中的线程数量随着需要处理的任务的数量增大或者减少，这样可以提高 CPU 的使用效率。如果你有一堆任务让 CPU 负载很高，而你又提交了另外一个任务，这时 GCD 将不会为这个任务再创建一个线程。因为 CPU 已经满载运行了，更多的线程只会让性能下降。我会忽略这些实现并且使用硬编码的固定线程数。我也会跳过另外一些有趣的特性比如目标队列（target queues）以及并发队列中的屏障（barriers on concurrent queues）等等。

我们的目标是重写调度队列的核心特性：他们可以是串行的或者并发的，他们可以同步地或者异步地调度任务，并且他们由一个共享的全局线程池提供支持。

# 代码

像往常一样，这篇文章中的代码可以在 Github 上获取：[代码](https://github.com/mikeash/MADispatchQueue)

如果你想边读边跟进，或者是自己进行探索，你都可以在这里找到你想要的。


# 接口
GCD 是一个基于 C 语言的 API。虽然在最近的 OS 发布版本中 GCD 对象被转换成了 Objective-C 对象，API 仍然是纯 C 实现的（加上苹果的 block 扩展）。这种实现对于一个底层 API 来说非常棒，并且 GCD 展示了一种非常简洁的接口，但对我的研究来说，我想用 Objective-C 重写这些接口。

重新实现的 Objective-C 类叫做 “MADispatchQueue”，它只有四个方法：

1. 获取一个共享的全局队列的方法。GCD 有许多不同优先级的全局队列，但是简单起见我们只用一个。
2. 一个可以创建并发或者串行队列的初始化方法
3. 异步调度的方法
4. 同步调度的方法

下面是接口声明：

```objective-c
@interface MADispatchQueue : NSObject

    + (MADispatchQueue *)globalQueue;

    - (id)initSerial: (BOOL)serial;

    - (void)dispatchAsync: (dispatch_block_t)block;
    - (void)dispatchSync: (dispatch_block_t)block;

    @end
```
接下来，我们的目标就是要实现这些方法。

# 线程池接口

存储队列的线程池有一个很简洁的接口。这个接口的实现能够实际执行已经提交的任务。队列则负责在合适的时间把那些已经在队列中的任务提交给 CPU 。

线程池只有一项工作：提交将要被运行的任务。对应的，它的接口也只有一个方法：
```objectivec
  @interface MAThreadPool : NSObject

    - (void)addBlock: (dispatch_block_t)block;

    @end
```

既然这个是核心，让我们首先来实现它。

# 线程池的实现

首先让我们来看实例变量。线程池将会被多个线程访问，不管是内部的还是外部的。因此它应该是线程安全的。尽管 GCD 一直使用的都是较为快速的原子性操作（atomic operations），但是我将会在我的重新实现中使用一种较好的老式的锁。我需要这个锁等待（wait）以及发信号(signal)的功能，而不仅仅是强制互斥的功能，所以我会使用 `NSConditon`而不是简单的`NSLock`。你可能对它不是很熟悉，`NSCondition` 是一种基本锁，并且包含了一个条件变量：

```objectivec
NSCondition *_lock;
```

为了知道什么时候该启用新的工作线程，我需要知道当前线程池中有多少线程，有多少线程正在执行任务，以及可以使用的最大线程数：

```objectivec
    NSUInteger _threadCount;
    NSUInteger _activeThreadCount;
    NSUInteger _threadCountLimit;
```

最后，还有一些要被执行的 block 。这是一个 `NSMutableArray`，它被当作一个队列，你可以从它的末位添加 block，也可以从它的开头移除 block:

```objectivec
 NSMutableArray *_blocks;
```

初始化很简单。先初始化锁，接着初始化 block 数组，然后将线程数的限制设置为 128：

```objectivec
  - (id)init {
        if((self = [super init])) {
            _lock = [[NSCondition alloc] init];
            _blocks = [[NSMutableArray alloc] init];
            _threadCountLimit = 128;
        }
        return self;
    }
```

工作线程是一个简单的无限循环。只要 block 数组为空，它就会进入等待状态。一旦有一个 block 可用，它就会让 block 从数组中出列并且执行 它。当做这些事的时候，线程池会增加活跃线程的数量，等完成之后会再让其减少。现在让我们开始吧：

```objectivec
 - (void)workerThreadLoop: (id)ignore {
```

它做的第一件事就是获取锁。注意这个动作在循环开始*之前*。在循环结束后我会解释这样做的原因：

```objectivec
 [_lock lock];
```

接下来进入一个死循环：

```objectivec
while(1) {
```

如果队列是空的，让锁进入等待状态：

```objectivec
while([_blocks count] == 0) {
	[_lock wait];
}
```
注意这里使用了循环来处理的，而不是一个简单的 `if` 语句。这样做的原因是为了防止[虚假唤醒](https://en.wikipedia.org/wiki/Spurious_wakeup)。简单来说，即使没有信号发出，wait 函数也可能会返回，为了保证正确性，当 wait 返回时，需要再次对条件进行检查。

一旦 block 可用，就让它出列：

```objectivec
dispatch_block_t block = [_blocks firstObject];
[_blocks removeObjectAtIndex: 0];
```

通过增加活跃线程数量来标识该线程正在执行任务：

```objectivec
 _activeThreadCount++;
```
现在是时候执行 block 了，但是我们首先需要将锁释放，否则我们不会获得任何并发性，而且会产生各种各样的死锁。

```objectivec
  [_lock unlock];
```

当锁被安全释放之后，就可以执行 block 了:

```objectivec
 block();
```
block 执行完之后，需要减少活跃线程数的数量。这个操作需要在加锁的情况下进行，防止竞争条件的产生，这里就是循环的结尾了：

```objectivec
      [_lock lock];
      _activeThreadCount--;
        }
    }
```

现在你已经看到了为什么进入循环之前需要加锁。循环中的最后一步是减少活跃线程数量，这就需要我们在这时就持有锁。进入循环的第一件事就是要检查 block 队列。通过在循环的外部运行了第一把锁，后续的循环就可以针对所有的操作使用这把锁，而不需要加锁，解锁，然后突然又加锁了。

现在来看 `addBlock` :

```objectivec
- (void)addBlock: (dispatch_block_t)block {
```

这里所做的所有事情都需要先加锁：

```objectivec
[_lock lock];
```
首要的任务是要把新的 block 添加到 block 队列中：

```objectivec
        [_blocks addObject: block];
```

如果正好有一个空闲的工作线程准备接手这个 block，就没有什么可做的。但是如果没有足够的空闲工作线程来处理这个 block，并且工作线程的数量还没有达到限制，那么就应该再创建一个新的线程：

```objectivec
        NSUInteger idleThreads = _threadCount - _activeThreadCount;
        if([_blocks count] > idleThreads && _threadCount < _threadCountLimit) {
            [NSThread detachNewThreadSelector: @selector(workerThreadLoop:)
                                     toTarget: self
                                   withObject: nil];
            _threadCount++;
        }
```
现在一切准备就绪，线程可以开始执行 block 了。为了防止它们都在休眠，唤醒一个：

```objectivec
        [_lock signal];
```
然后解锁就可以了：

```objectivec
        [_lock unlock];
    }
```
这样我们就有了一个线程池，这个线程池可以大量生产线程至预设的数量限制，然后在 block 进入的时候执行 block。现在以这个为基础来实现队列。

# 队列实现
与线程池一样，队列需要一把锁保护里面的内容。但与线程池不一样的地方是，它不需要任何等待和信号，只是基本的互斥锁，所以它使用`NSLock`类就行了：

```objectivec
   NSLock *_lock;
```

与线程池一样，这里使用了`NSMutableArray`来维护一个待分配 block 的队列：

```objectivec
    NSMutableArray *_pendingBlocks;
```
队列需要知道任务是串行的还是并行的：

```objectivec
    BOOL _serial;
```
如果是串行的，它同时需要记录现在是否有 block 正在线程池中被执行：

```objectivec
    BOOL _serialRunning;
```

而并发队列无论是否有 block 在执行它的行为都是一样的，因此它们不需要记录这些。
全局队列被存储在一个全局变量中，就像下面的共享线程池那样。他们都是在`+initialize:`中创建的：

```objectivec
    static MADispatchQueue *gGlobalQueue;
    static MAThreadPool *gThreadPool;

    + (void)initialize {
        if(self == [MADispatchQueue class]) {
            gGlobalQueue = [[MADispatchQueue alloc] initSerial: NO];
            gThreadPool = [[MAThreadPool alloc] init];
        }
    }
```
既然 `+initialize` 已经保证创建了 `gGlobalQueue`，`+globalQueue` 方法只需要直接返回这个变量即可：

```objectivec
    + (MADispatchQueue *)globalQueue {
        return gGlobalQueue;
    }
```

以上代码与调用 `dispatch_once` 类似，但是如果在我实现 GCD API 的时候又使用了另一个 GCD 的 API，这会让人感觉是在作弊，即使这两个 API 并不是一样的。

初始化队列包含了创建锁和待分配 block 队列，还需要设置`_serial`变量：

```objectivec
    - (id)initSerial: (BOOL)serial {
        if ((self = [super init])) {
            _lock = [[NSLock alloc] init];
            _pendingBlocks = [[NSMutableArray alloc] init];
            _serial = serial;
        }
        return self;
    }
```

在我们着手实现其它的公共 API 之前，有一个潜在的方法需要被实现，这个方法需要在线程池中调度一个 block，然后再隐式地调用自身去执行另外一个 block：

```objectivec
    - (void)dispatchOneBlock {
```

它存在的所有的目的都是为了运行线程池中的任务，所以它就要在这里进行调度：

```objectivec
        [gThreadPool addBlock: ^{
```

接下来它获取到了队列中的第一个 block。当然，这需要在加锁的情况下执行以避免灾难性的崩溃：

```objectivec
            [_lock lock];
            dispatch_block_t block = [_pendingBlocks firstObject];
            [_pendingBlocks removeObjectAtIndex: 0];
            [_lock unlock];
```
在获取到了 block 并且锁也释放的时候，block 就可以安全地在后台线程中执行了：

```objectivec
            block();
```
如果队列是并发队列，那么这就是它所有需要处理的所有内容。如果是串行队列，还要再进行一些操作：

```objectivec
            if(_serial) {
```
在一个串行队列中，添加的 block 会被创建，但是得等到正在处理的 block 完成才会被激活。当一个 block 执行完毕以后，`dispatchOneBlock` 将会检查是否还有 block 在队列中等待。如果有，它会调用自己执行下一个 block。如果没有，它会把队列的运行状态置为`NO`:

```objectivec
                [_lock lock];
                if([_pendingBlocks count] > 0) {
                    [self dispatchOneBlock];
                } else {
                    _serialRunning = NO;
                }
                [_lock unlock];
            }
        }];
    }
```

有了这个方法，想要实现`dispatchAsync: `就相对简单了。将 block 添加到队列中作为等待任务，然后设置状态并在合适的时候激活`dispatchOneBlock`：

```objectivec
    - (void)dispatchAsync: (dispatch_block_t)block {
        [_lock lock];
        [_pendingBlocks addObject: block];
```
如果一个串行队列是*空闲*的，把它的状态设置为正在运行并调用`dispatchOneBlock`使一切开始运转：

```objectivec
        if(_serial && !_serialRunning) {
            _serialRunning = YES;
            [self dispatchOneBlock];
```
如果队列是并发的，那么无条件地调用`dispatchOneBlock`。即使另外一个 block 正在运行，新的 block 也可以被马上执行，因为多个 block 被允许并发地执行：

```objectivec
        } else if (!_serial) {
            [self dispatchOneBlock];
        }
```
如果一个串行队列已经在运行了，那么没有别的什么需要去处理了。已经在执行的 `dispatchOneBlock` 终将会执行到刚刚被添加到队列中的的 block。现在释放锁：

```objectivec
        [_lock unlock];
    }
```
接下来就是 `dispatchSync` 了。针对这个，GCD 是相当智能的，它可以在调用线程中直接执行 block ，而让队列中的其他 block 停止执行（如果是串行队列）。但是我们不用实现到如此智能。我们只需要对`dispatchAsync:` 进行包装，让它等一个任务完成之后才开始执行下一个任务。

这里使用了一个局部的 `NSCondition` 对象，加上一个`done`变量来表示 block 什么时候执行完毕：

```objectivec
    - (void)dispatchSync: (dispatch_block_t)block {
        NSCondition *condition = [[NSCondition alloc] init];
        __block BOOL done = NO;
```
然后它就异步的调度一个 block。这个 block 调用了被传入的那个 block，然后设置 done 变量并用 condition 发出信号：

```objectivec
        [self dispatchAsync: ^{
            block();
            [condition lock];
            done = YES;
            [condition signal];
            [condition unlock];
        }];
```
而在外面的原始的调用线程中，它通过 `condition` 在等待 `done` 变量被设置，然后返回：

```objectivec
        [condition lock];
        while (!done) {
            [condition wait];
        }
        [condition unlock];
    }
```
到这里，block 的执行已经完成了。大功告成！那就是`MADispatchQueue` API 中的所需要的最后一点儿内容。

# 结论
一个全局线程池可以通过一个拥有任务 block 以及能大量生产线程的队列来实现。使用一个共享的线程池，一个基本的调度队列的 API 就可以被创建，它提供了基本的串行/并行队列下同步/异步任务的调度。这次的重新实现缺少了 GCD 中许多优秀的特征，并且肯定没有 GCD 那么高效，但即便如此它让我们能够看到像这样一种机制的内部原理是怎样的，并且让我们看到那并不是什么魔法（除了`dispatch_once`，那是绝对的魔法！）。

这就是今天的内容。下次回来看更多有趣的内容。"Friday Q&A"是由用户的想法驱动的，所以如果你希望下次或者将来我可以在这里讨论某些内容，请[告诉我](mailto:mike@mikeash.com)！




