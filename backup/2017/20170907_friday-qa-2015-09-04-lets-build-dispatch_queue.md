title: 从零构建 Dispatch Queue
date: 2017-09-07
tags: [iOS 开发]
categories: [Mike Ash]
permalink: friday-qa-2015-09-04-lets-build-dispatch_queue
keywords: 
custom_title: 
description:  

---
原文链接=https://www.mikeash.com/pyblog/friday-qa-2015-09-04-lets-build-dispatch_queue.html
作者=Mike Ash
原文日期=2015-09-04
译者=智多芯
校对=Crystal Sun
定稿=CMB

<!--此处开始正文-->

Grand Central Dispatch 是 Apple 公司最近几年推出的重量级 API 之一。在本次“从零构建”系列文章中，我们将探索一个由 Rob Rix 建议的主题：从零构建一个具备基本功能的 Dispatch Queue。

<!--more-->

### 概述

分发队列（Dispatch Queue）是一个保存了多个基于全局线程池的任务（译者注：其实就是一系列的代码块）的队列。提交到队列的任务通常会被放到一个后台线程异步执行。为了使整个系统运作得更高效，所有的线程共享一个后台线程池。

这就是下面将要实现的 API 核心功能。为了简单起见，本文会略去很多 GCD 提供的额外功能。例如，全局线程池中的线程数量会随着任务总量和系统的 CPU 使用率进行动态调整。在已有一堆耗 CPU 的任务在运行的情形下，如果此时再提交一个任务，GCD 不会再为该任务创建新的线程。因为此时 CPU 已经满负荷运行了，再创建新的线程只会导致系统更低效。下面我会直接将线程数量硬编码在代码中。同样，其他的额外功能，如目标队列和并行队列屏障，也会一并略过。

本文会把重点放在实现分发队列的核心功能上：基于一个共享的全局线程池实现串行/并行及同步/异步派发任务。

### 代码

和往常一样，本文中的代码可在 GitHub 上获取：

https://github.com/mikeash/MADispatchQueue

可以边读本文边敲代码，也可以自己探索。

### 接口

GCD 提供的是一系列的 C 语言 API。虽然在最近发布的 OS 上 Apple 已经将 GCD 对象转成了 Objective-C 对象，但 API 还是保持着纯 C 语言接口（还新增了对 Block 支持）。这对底层 API 来说其实是好事，提供的接口也十分简洁。但本文将采用 Objective-C 语言来实现。

本文实现的 Objective-C 类叫做 `MADispatchQueue`，它只提供了四个方法：

1. 一个获取共享的全局队列的方法。GCD 有多个不同优先级的全局队列，但为了简单起见，我们只有一个全局队列。
2. 一个构造器，可通过它创建并行或串行队列。
3. 一个异步派发方法。
4. 一个同步派发方法。

接口的声明如下：

```objective-c
@interface MADispatchQueue : NSObject

+ (MADispatchQueue *)globalQueue;

- (id)initSerial: (BOOL)serial;

- (void)dispatchAsync: (dispatch_block_t)block;
- (void)dispatchSync: (dispatch_block_t)block;

@end
```

本文的目标就是实现这些方法的功能。

### 线程池接口

用来支撑分发队列的线程池有着相对简洁的接口，该线程池负责执行被提交的作业。分发队列负责在合适的时机将已入队的作业提交到线程池。

线程池只有一个简单的任务：提交作业并执行。因此，它就只有一个方法：

```objective-c
@interface MAThreadPool : NSObject

- (void)addBlock: (dispatch_block_t)block;

@end
```

因为这是整个线程池的核心，所以接下来先把它实现了。

### 线程池实现

首先看下实例变量。线程池可能会被外部或内部的多个线程同时访问，因此必须保证其线程安全。虽然 GCD 尽可能地使用了快速原子操作以保证线程安全，但本文还是采用古老的锁方案。除了保证读写操作互斥外，该锁还要支持 `wait` 和 `signal` 操作，因此使用了 `NSCondition`，而不是原生的 `NSLock`。如果你不熟悉 `NSCondition` 也没关系，实际上它只是把锁和一个条件变量封装在一起而已：

```objective-c
NSCondition *_lock;
```

为了确定何时启动新的线程，需要知道当前线程池中有多少线程，有多少线程正在运行，线程池最多支持多少线程：

```objective-c
NSUInteger _threadCount;
NSUInteger _activeThreadCount;
NSUInteger _threadCountLimit;
```

最后是一个保存了多个代码块的数组。这里使用了 `NSMutableArray` 来实现队列，通过追加新的代码块到末尾来实现入队操作，通过删除开头的代码块来实现出队操作。

```objective-c
NSMutableArray *_blocks;
```

初始化方法很简单，只是初始化锁、代码块数组，最后将线程数的最大值设置成 123（随机选择的数目）：

```objective-c
- (id)init {
    if((self = [super init])) {
        _lock = [[NSCondition alloc] init];
        _blocks = [[NSMutableArray alloc] init];
        _threadCountLimit = 128;
    }
    return self;
}
```

工作线程中主要是一个无限循环。当代码块数组为空时，线程进入休眠并等待。一旦数组不为空，该代码块立即出队并开始执行。代码块执行开始后，当前活跃线程数加一；代码块执行完成后，当前活跃线程数减一：

```objective-c
- (void)workerThreadLoop: (id)ignore {
```

在进入循环之前先加锁，至于为什么这么做，请继续往下看：

```objective-c
	[_lock lock];
```

接着进入无限循环：

```objective-c
	while (1) {
```

如果队列为空，则等待：

```objective-c
    	while ([_blocks count] == 0) {
        	[_lock wait];
    	}
```

这里要注意的是，上面代码是在一个循环中，而不仅仅只是一个 `if` 语句。这么做是因为[假性唤醒](https://en.wikipedia.org/wiki/Spurious_wakeup)。简单地说，即使没有发送`signal`信号，`wait` 也可能提前返回。为了让代码产生预期的行为，`wait` 返回时每次都要检查代码块的数量。

一旦有了可用代码块，立即出队：

```objective-c
    	dispatch_block_t block = [_blocks firstObject];
    	[_blocks removeObjectAtIndex: 0];
```

将当前活跃线程数加一，表明当前线程正忙：

```objective-c
		_activeThreadCount++;
```

现在是时候开始执行代码块了。但在此之前需要先解锁，否则就无法并发执行代码，并且所有试图对该锁加锁的线程都会导致死锁：

```objective-c
        [_lock unlock];
```

安全地解锁并立即执行代码块：

```objective-c
		block();
```

当该代码块执行完后，将当前活跃线程数减一。在这样做之前需要先加锁以避免竞争条件。到这里循环也就结束了：

```objective-c
        [_lock lock];
        _activeThreadCount--;
    }
}
```

现在应该明白为什么进入上面这个循环之前先加锁了。循环中的最后一步是将当前活跃线程数减一，进入循环的第一步是检查队列中的代码块数量，而这两个操作都需要先加锁。通过在循环外加锁，后续的迭代只需要加一次锁即可。而不需要加锁、解锁，又马上加锁。

现在来看看 `addBlock`：

```objective-c
- (void)addBlock: (dispatch_block_t)block {
```

这个方法中的所有操作都需要加锁：

```objective-c
	[_lock lock];
```

第一件事就是将传入的代码块添加到队列中：

```objective-c
    [_blocks addObject: block];
```

如果目前有空闲的工作线程可以执行该代码块，那么就没什么需要做的了。如果没有空闲线程去处理这个还未被执行的代码块，并且工作线程总数还没超出限制，那就新建一个线程：

```objective-c
	NSUInteger idleThreads = _threadCount - _activeThreadCount;
    if([_blocks count] > idleThreads && _threadCount < _threadCountLimit) {
    	[NSThread detachNewThreadSelector: @selector(workerThreadLoop:)
                                 toTarget: self
                               withObject: nil];
        _threadCount++;
    }
```

现在有了空闲的工作线程可以执行代码块了。但 `workerThreadLoop` 中的循环可能由于 `wait` 操作而处于休眠状态，因此执行一下 `signal` 操作唤醒它：

```objective-c
	[_lock signal];
```

最后解锁：

```objective-c
    [_lock unlock];
}
```

上面实现的线程池能够创建预定数目的工作线程以便执行新入队的代码块。接下来就利用这个线程池去实现分发队列 `Dispatch Queue`。

### 分发队列的实现

和线程池相同的是，分发队列同样需要一个锁。而不同的是，它并不需要 `wait` 和 `signal`操作，只需要最基本的互斥锁 `NSLock`：

```objective-c
NSLock *_lock;
```

类似线程池，分发队列使用 `NSMutableArray` 维护了一个队列用于保存还未被执行的代码块：

```objective-c
NSMutableArray *_pendingBlocks;
```

`Dispatch Queue` 需要知道自己是串行还是并行队列。

```objective-c
BOOL _serial;
```

如果是串行队列，它还需要跟踪线程池中是否有代码块正在执行：

```objective-c
BOOL _serialRunning;
```

并行队列则不管是否有代码块正在运行都不影响，因此不需要跟踪该状态。

和共享的线程池一样，将全局队列保存在一个全局变量中，二者都在 `+initialize` 方法中创建：

```objective-c
static MADispatchQueue *gGlobalQueue;
static MAThreadPool *gThreadPool;

+ (void)initialize {
    if(self == [MADispatchQueue class]) {
        gGlobalQueue = [[MADispatchQueue alloc] initSerial: NO];
        gThreadPool = [[MAThreadPool alloc] init];
    }
}
```

`+initialize` 方法已经确保了全局队列会被创建，因此 `+globalQueue` 方法可直接返回 `gGlobalQueue`：

```objective-c
+ (MADispatchQueue *)globalQueue {
    return gGlobalQueue;
}
```

这里本来是可以直接用 `dispatch_once` 方法的，但这么做会有种使用了 GCD API 来作弊的感觉，说好的要从零构建的，虽然这并不是我们要实现的 API。

初始化方法包括分配锁、创建代码块队列（译者注：还未被执行的代码块），还要设置 `_serial` 变量：

```objective-c
- (id)initSerial: (BOOL)serial {
    if ((self = [super init])) {
        _lock = [[NSLock alloc] init];
        _pendingBlocks = [[NSMutableArray alloc] init];
        _serial = serial;
    }
    return self;
}
```

在讲其余的公开 API 之前，还有一个底层方法需要实现。这个方法会在线程池中将 `_pendingBlocks` 队列中的一个代码块取出并执行，接着还很有可能（串行队列的情况下）会调用自身在线程池中执行另一个代码块：

```objective-c
- (void)dispatchOneBlock {
```

该方法唯一的职责就是在线程池中执行代码块，所以把自身的功能代码块添加到线程池中：

```objective-c
	[gThreadPool addBlock: ^{
```

接着从队列中取出队列头部的代码块。当然了，这个操作也需要加锁：

```objective-c
		[_lock lock];
        dispatch_block_t block = [_pendingBlocks firstObject];
        [_pendingBlocks removeObjectAtIndex: 0];
        [_lock unlock];
```

在解锁后，上面取出的代码块就可以安全地在后台线程执行（译者注：在前文线程池的实现中可以看出，每个添加到线程池中的代码块都会在独立的后台线程中执行）：

```objective-c
		block();
```

如果队列是并行的，那么到这里就结束了。如果是串行的话，还需要下面的代码：

```objective-c
        if(_serial) {
```

在串行队列上，新增的代码块需要等到前一个代码块执行完后才能执行。每当一个代码块执行完后，`dispatchOneBlock` 会检查当前队列是否还有代码块未执行。如果有的话，它会调用自身以便最后可以执行到该代码块。如果没有，将队列的运行状态设置回 `NO`：

```objective-c
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

有了上面这个方法之后，实现 `dispatchAsync` 就相对简单了。将代码块添加到队列中，然后根据情况（是否为串行队列）设置队列的运行状态并调用 `dispatchOneBlock`：

```objective-c
- (void)dispatchAsync: (dispatch_block_t)block {
    [_lock lock];
    [_pendingBlocks addObject: block];
```

如果是串行队列且当前空闲，就将队列运行状态设置为 `YES` 并调用 `dispatchOneBlock`：

```objective-c
    if(_serial && !_serialRunning) {
        _serialRunning = YES;
        [self dispatchOneBlock];
```

如果是并行队列，就无条件直接执行。这样保证了即使其他代码块正在执行，新增的代码块也能尽快执行，毕竟并行队列是允许多个代码块同时运行的：

```objective-c
	} else if (!_serial) {
        [self dispatchOneBlock];
    }
```

如果串行队列已经在执行代码块了，就没什么需要做的了，已经在执行的 `dispatchOneBlock`最后会执行到新增的代码块的。最后解锁：

```objective-c
    [_lock unlock];
}
```

接下来轮到 `dispatchSync` 了。与 GCD 的实现不同，本文直接使用 `dispatchAsync` 派发代码块，并等到代码执行完后再返回（译者注：这就是同步的效果）。

为了实现这个目的，这里使用到了一个本地条件变量 `NSCondition`，还有一个 `done` 变量用于表示代码块是否执行完毕：

```objective-c
 - (void)dispatchSync: (dispatch_block_t)block {
    NSCondition *condition = [[NSCondition alloc] init];
    __block BOOL done = NO;
```

接着异步派发代码块。这里执行了通过函数参数传进来的代码块，然后设置 `done` 为 `YES`并唤醒 `condition`：

```objective-c
    [self dispatchAsync: ^{
        block();
        [condition lock];
        done = YES;
        [condition signal];
        [condition unlock];
    }];
```

在条件变量 `condition` 上等待 `done` 被设置成 `YES`，然后返回：

```objective-c
    [condition lock];
    while (!done) {
        [condition wait];
    }
    [condition unlock];
}
```

到这里就成功地运行了代码块，这也是 `MADispatchQueue` 所需要的最后一个 API 。

### 结论

可以通过一个保存代码块的队列和动态创建和销毁线程的方法来实现一个全局的线程池。通过使用一个共享的全局线程池，可以构建基本的 `Dispatch Queue` API，支持串行/并行及同步/异步派发任务。本文的实现少了许多 GCD 中很赞的功能，而且也确实比 GCD 低效得多。但即便如此，本文还是可以让你窥视到 GCD 内部的运作原理，让你明白这其实也不是什么神奇的事。（除了 `dispatch_once`，着简直就是个魔法。）

这就是今天所有的内容了，记得不要错过下一次更多有趣的内容哦。另外，周五的 Q&A 是由读者驱动的，所以如果你有什么想在这里讨论的，给我[发个邮件](mailto:mike@mikeash.com)吧！