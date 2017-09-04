title: "Swift 中的并发编程(第一部分：现状）"
date: 2017-09-04
tags: [Swift 进阶，并发编程]
categories: [uraimo]
permalink: all-about-concurrency-in-swift-1-the-present
keywords: 并发编程
custom_title: 
description: 

---
原文链接=https://www.uraimo.com/2017/05/07/all-about-concurrency-in-swift-1-the-present/
作者=Umberto Raimondi
原文日期=2017-05-07
译者=shanks
校对=shanks
定稿=CMB

<!--此处开始正文-->

当前最新版本的 Swift 语言（译者注：当前最新稳定版本为 3.1.1）还没有包含任何原生并发特性，但是在其他现代编程语言中是带有这个特性的，比如 Go 和 Rust。
如果你想并发地执行任务，这时就需要处理与结果相关的竞态条件，目前唯一的选择就是使用第三方库，比如 libDispatch，或者 Foundation 和其他 OS 中提供的同步原语。
在这一系列文章的第一部分，看看 Swift 3 给出的处理方案，覆盖以下一些内容：Foundation 中的锁，线程和计时器提供语言层面的保证，最近不断增强的 GCD(Grand Central Dispatch) 和操作队列（Operation Queues）。

同时也会讨论到基础的并发原理和一些通用的并发模式。

<!--more-->

原文链接：[All about Concurrency in Swift - Part 1: The Present](https://www.uraimo.com/2017/05/07/all-about-concurrency-in-swift-1-the-present/)

![](https://www.uraimo.com/imgs/concurr.png)

虽然在那些可以运行 Swift 的平台上，都可以使用 pthread 库来处理并发（译者注：pthread 库是跨平台的），但是在这里，不会讨论 pthread 库相关的函数和原语，对于这些底层一些库函数来说，有更高阶的替代者。NSTimer 类也不会在这里讨论，请查阅[这篇文章](https://www.uraimo.com/swiftbites/nstimer-in-swift-3/)，告诉你如何在 Swift 3中使用它。

正如已经被多次提到的一样，在 Swift 4.0 发布后的某个版本（应该不需要等到 Swift 5），Swift 语言将会定义一个牛逼的内存模型，包含支持原生并发特性，用于处理并发，和并行一样，不需要引入外部库，使用 Swift 的方式来处理并发。

在下一篇系列文章中，将会讨论其他语言中使用的一些替代方式和范式实现并发，并且探讨如何在 Swift 中实现它们，然后分析一些已经存在的开源实现，
并且使用了当前发布版本的 Swift  编写 Actors 模式，CSP 通道（Go 语言），STM（Software Transactional Memory）等并发实现。
在当前的 Swift 正式版本中允许使用行动者范式，Go 语言的 CSP 频道，软件事务内存。

在第二篇文章中，将会彻底预测下，主要预测方式，是把这些涉及的对象的情况做个介绍，这样可以让你可以身临其境，明白将会在未来的 Swift 版本如何定义处理并发。

> 此文章和本博客相关文章代码可以从 [GitHub](https://github.com/uraimo/Swift-Playgrounds)和 [Zipped](https://www.uraimo.com/archives/2017-05-07-ConcurrencyInSwift.playground.zip)上下载。

### 目录

* [多线程和并发启蒙](#multithreading_and_concurrency_primer)
* [语言支持](#language_guarantees)
* [线程类](#threads)
* [同步原语](#synchronization_primitives)
	* [NSLock](#nslock)
	* [NSRecursiveLock](#nsrecursivelock)
	* [NSConditionLock](#nsconditionlock)
	* [NSCondition](#nscondition)
	* [NSDistributedLock](#nsdistributedlock)
	* [OSAtomic 还能用吗？](#osatomic_where_art_thou)
	* [同步代码块](#on_synchronized_blocks)

* [GCD：Grand Central Dispatch](#grand_central_dispatch)
	* [调度队列](#dispatch_queues)
	* [使用队列](#using_quenes)
	* [屏障](#barriers)
	* [单例和 Dispatch_once](#singletons_and_dispatch_once)
	* [调度组](#dispatch_groups)
	* [调度工作项](#dispatch_work_items)
	* [调度信号量](#dispatch_semaphores)
	* [调度断言](#dispatch_assertions)
	* [调度资源](#dispatch_sources)

* [操作和操作队列](#operations_and_operationqueues)
* [后记](#closing_thoughts)

<a name="multithreading_and_concurrency_primer"></a>
## 多线程和并发启蒙

现如今，无论大家编写何种类型的应用，迟早大家会发现一个事实，应用都会运行在一个多线程的执行环境下面。

使用多处理器或者拥有多个硬件执行核心处理器的计算平台已经出现了几个时代了，并且像 *线程* 和 *进程* 等概念出现的甚至更早。

操作系统通过使用各种程序来利用硬件的能力，而应用或每一个现代的框架都在实现一些大家熟知的设计模式，用到了多线程来增强自身的灵活性和性能。

在我们开始深入讨论如何使用 Swift 处理多线程之前，先来解释一些需要了解的基本概念，这样才能考虑应该使用调度队列（`Dispatch Queues`）或者操作队列（`Operation Queues`）。
首先，你可能会问，苹果平台和框架已经使用了线程，为啥还需要在应用中单独介绍它们呢？
有少量通用的场景下，让使用多线程变得容易理解：

**任务组隔离**：线程可以从执行流程角度模块化应用，不同线程用可预测的方式执行同类的一组任务，隔离应用中其他执行流程，这样对应用当前的状态更加可控。

**数据独立并行计算**：多个软件线程，无论是基于硬件线程还是不基于软件线程(见下一个要点)，都通过并行处理同一个任务的多个拷贝，这个任务作用于原始输入数据结构的其中某个子集。

**更加清晰的方式等待竞争或I/O**：使用阻塞 I/O 或执行某种类型的阻塞操作时，后台线程会等待这些操作的完成。使用线程，可以增强应用的设计，并且让处理阻塞的调用更加常见。

但是在执行多线程代码时，从一个线程的角度去看代码会不再有效，需要做一些有意义的假设。

理想情况下，每一个执行线程都相互独立，没有共享数据，这样并发编程没想象中复杂，编写的代码将会在一个独立的线程中执行。但在大多数情况下，会使用多个线程操作相同的数据，需要找到一种管控访问这些数据的方式，保证每一个对数据的操作都符合预期，不被其他线程操作造成不可预期行为。

并发编程需要编程语言和操作系统额外的保证，当多线程尝试同时改变变量（更多时候被称作"资源"）的值时候，需要一个显式状态信息来提供作用。

编程语言需要定义一个*内存模型*，在多线程存在的情况下，定义显式状态一些规则，指定这些基础状态在并发线程中如何运作，定义内存如何进行共享，以及指定那种方式的内存访问是有效的。

正因为如此，开发者对于每种语言中线程行为都有一个基本认知，只需要了解每种语言的编译器是如何在这个线程内存模型下去优化性能。

定义一个内存模型也是语言演化中一个重要的步骤，一个严格的模型将会限制编译器的演化。以前在内存模型的设计有可能会让新的优化搁浅。

定义内存模型的一些考虑点：

* 语言表达式是否为*原子性*，在没有其他线程可以看到的情况下，操作将被整体执行。更有意义的场景是，一个变量是否被原子化操作。

* 多线程如何处理共享变量，变量被缓存是否是默认的，还有就是这个缓存行为是否受到特定的语言标识符所影响。

* 并发操作符通常被用作标记和管控共享资源的*临界区*和区域中的代码，允许有且只有一个线程同时执行指定的代码。

接下来言归正传讨论如何在程序中使用并发。

正确处理并发的方式是，识别程序中的*临界区*，使用并发原语或者并发相关数据结构，来管控不同线程中的共享数据。

临界区中代码和数据结果的强制访问规则会带来一系列的其它问题，这些问题来源于一个事实，每一个将要执行的线程都期望得到自己想要的结果，都有机会修改共享数据，在某些情况下，这些线程中的一些线程永远不会执行，数据的修改也可能不按预期进行。

并发编程将面临一些额外的挑战，不得不去处理一些共同的问题：

* **竞争条件**：当多线程操作同样的数据时，读和写数据同时进行，这一系列执行操作结果在不同的线程操作顺序下，变得不可预测。

* **资源冲突**：多线程会执行多个任务，需要安全的访问相同的资源时，将会增加额外的时间，这些延迟获取资源的时间，可能会导致不可预期的行为或者使得应用程序处理这些资源的数据结构变得复杂。

* **死锁**：多线程互相等待需要资源或锁的释放，然后永远阻塞这些线程的执行。

* **饥饿**：一个线程无法获取资源或者一个特定排序的资源，需要各种条件获取资源或者尝试获取资源永远失败。

* **优先级反转**：低优先级线程可能不断持有资源，需要这个资源的高优先级线程可能被其他不需要此资源的低优先级线程反转。

* 不可预期和公平：不能假设在什么时候或者什么顺序下，一个线程能获取到线程资源，延迟时间[不会被优先级所决定](https://en.wikipedia.org/wiki/Unbounded_nondeterminism)，但是会被冲突的数量所影响。一个线程不可能独立获得资源。但是并发原语用来保证临界区是*公平的*，或者说，为了*公平*，所有线程等待访问临界区的顺序都是依据等待顺序而来。

<a name="language_guarantees"></a>
## 语言支持

虽然当前 Swift 还没有提供原生的并发编程特性，但它仍然提供了属性访问的多线程保证。

举个例子，全局变量就是被原子性的初始化的，不需要担心多线程情况下对同一变量的初始化操作，也不需要担心会看到一个初始化还在进行当中的部分初始化变量。

以上行为在下面实现单例模式的时候会看到。

但是需要重点注意的是，延迟属性初始化没有保证原子性，目前 Swift 语言没有提供注释或者修饰符来修改这种行为。

访问类变量同样没有保证原子性，如果想保证原子性，那么就需要提供额外的锁或者类似的机制来保证。

<a name="threads"></a>
## 线程类

`Foudation` 库提供了一个 `Thread` 类，内部继承自 `pthread`，可以用来创建线程和执行闭包。

使用 `Thread` 类的 `detachNewThreadSelector:toTarget:withObject: ` 方法创建线程，或者自定义一个线程类，重写其中的 `main()` 方法：

```swift
class MyThread : Thread {
    override func main(){
        print("Thread started, sleep for 2 seconds...")
        sleep(2)
        print("Done sleeping, exiting thread")
    }
}
```

从 iOS 10 和 macOS Sierra 开始，所有平台都可以使用构造器来创建一个新的线程，运行编写的闭包来指定线程执行。这篇文章所有例子仍然使用扩展基本 Thread 类，所以不需要担心是否是正确的操作系统来运行这些代码。

```swift
var t = Thread {
    print("Started!")
}

t.stackSize = 1024 * 16
t.start()               //需要 100us 来生成一个线程
```

一旦线程实例建立，需要手动的启动它。一个可选的步骤是，可以自定义新线程的栈空间大小。

可以调用`exit()`来终止线程，但这不推荐使用，因为这样不能保证当前任务能清理完成，大多数情况下，需要自己编写停止逻辑，或者使用`cancel()`方法，在主闭包中使用`isCancelled`属性来判断线程是否需要在自然结束之前终止当前任务。

<a name="synchronization_primitives"></a>
## 同步原语

当有不同的线程同时想修改共享数据时，有必要使用某种方式来处理线程之间的同步问题，阻止数据混乱和不可预期的行为。
线程间同步基础的处理手段包括锁，信号量和监视器。
Foundation 库提供以上几种方式。

你会马上看到，在 Swift 3 中，这些类（是的，它们都是引用类型）并没有[马上去掉 NS 前缀](https://github.com/apple/swift-evolution/blob/master/proposals/0086-drop-foundation-ns.md#proposed-solution)，但是在未来的 Swift 版本中会去掉。

<a name="nslock"></a>
### NSLock

`NSLock` 是 `Foundation` 提供的最基本的锁类型。

当一个线程尝试对一个对象进行加锁时，可能会发生两件事情，线程会在这个锁没有被其他线程持有时，获得这个锁，或者线程将阻塞，等到锁的拥有者释放锁。从另外个角度讲，锁只能同时被一个线程所持有，这种机制非常适合作用于临界区的监控访问。

`NSLock` 和其它的 `Foundation` 中锁是不公平的，意味着当一些线程想获取锁时，不会按照它们访问锁的顺序来获取锁。

不能假设一个执行顺序，在一个高度线程冲突的环境中，当有许多线程尝试获取资源是，一些线程有可能会被置为饥饿，永远不能获取它们等待的锁（或者不能及时地获取资源）。

没有竞争的情况下，获取一个锁需要的时间是 100 纳秒，但是当超过一个线程尝试获取锁资源时，耗费的时间将迅速增长。所以从性能的角度来说，锁不是解决资源分配最好的方式。

来看看两个线程的例子，记住获取锁的顺序不是注定的，甚至有可能 t1 连续获得两次锁（但是这种情况比较少见）.

```swift
let lock = NSLock()

class LThread : Thread {
    var id:Int = 0
    
    convenience init(id:Int){
        self.init()
        self.id = id
    }
    
    override func main(){
        lock.lock()
        print(String(id)+" acquired lock.")
        lock.unlock()
        if lock.try() {
            print(String(id)+" acquired lock again.")
            lock.unlock()
        }else{  // If already locked move along.
            print(String(id)+" couldn't acquire lock.")
        }
        print(String(id)+" exiting.")
    }
}


var t1 = LThread(id:1)
var t2 = LThread(id:2)
t1.start()
t2.start()
```

当决定使用锁机制时，需要附加一些警告。迟早会对并发程序进行调试，这种情况下，记得限制对一些需要排序数据结构去使用锁，在代码中尽量不在多个地方直接引用一个锁。

当调试一个并发问题时，检查有少量入口的同步数据结构的状态，要比随时关注锁在代码中的具体位置，并且需要记住在不同函数中锁状态来讲，要愉快的多。需要额外的工作，使得并发代码的结构更加合理。

<a name="nsrecursivelock"></a>
### `NSRecursiveLock`

递归锁可以在一个线程已经持有这个锁的情况下，在后面的代码中获取多次，在递归函数和调用多个需要顺序检查同一个锁的函数时，需要用到这种锁。递归锁和基本锁**不能共用**。

```swift
let rlock = NSRecursiveLock()

class RThread : Thread {
    
    override func main(){
        rlock.lock()
        print("Thread acquired lock")
        callMe()
        rlock.unlock()
        print("Exiting main")
    }
    
    func callMe(){
        rlock.lock()
        print("Thread acquired lock")
        rlock.unlock()
        print("Exiting callMe")
    }
}


var tr = RThread()
tr.start()
```

<a name="nsconditionlock"></a>
### NSConditionLock

条件锁提供了附加的子锁，子锁可以独立地被加锁和被解锁，用来支持复杂的加锁步骤（比如：消费者-提供者场景）。

同时可以用一个全局锁（不管什么具体的场景都可以加锁），这种锁的行为和经典的 NSLock 一样。

下面的例子使用一个条件锁来保护共享整型，提供者每次更新整型，消费者都会在终端打印整型。

```swift
let NO_DATA = 1
let GOT_DATA = 2
let clock = NSConditionLock(condition: NO_DATA)
var SharedInt = 0

class ProducerThread : Thread {
    
    override func main(){
        for i in 0..<5 {
            clock.lock(whenCondition: NO_DATA) //当条件为 NO_DATA 获取该锁
			  // 如果不想等待消费者，直接调用 clock.lock() 即可
            SharedInt = i
            clock.unlock(withCondition: GOT_DATA) //解锁并设置条件为 GOT_DATA
        }
    }
}

class ConsumerThread : Thread {
    
    override func main(){
        for i in 0..<5 {
            clock.lock(whenCondition: GOT_DATA) // 当条件为 GOT_DATA 获取该锁
            print(i)
            clock.unlock(withCondition: NO_DATA) //解锁并设置条件为 NO_DATA
        }
    }
}

let pt = ProducerThread()
let ct = ConsumerThread()
ct.start()
pt.start()
```

当创建一个条件锁时，需要使用一个整型指定开始条件。

`lock(whenCondition:) `方法在条件成立的情况下获得一个锁，或者等待另外一个线程使用`unlock(withCondition:)`释放锁并且设置这个值。

条件锁对于基本锁的一些小的改进允许我们建模更加复杂的场景。

<a name="nscondition"></a>
### `NSCondition`

不要混淆了 NSCondition 和条件锁，一个条件提供了更加清晰的等待*条件*产生的方式。

当一个已经获得锁的线程需要验证额外的条件（一些需要的资源，一个处于特殊状态的对象等），满足条件才能继续运行的时候，需要一种方式挂起然后在条件成立的时候继续工作。

在没有 NSCondition 的时候，这种情况通常会被实现为连续地或者周期性地检查条件（繁忙的等待），但是这样的话，线程获取的锁将会怎样？当条件成立希望再次获取他们之前，是应该等待还是释放它们呢？

NSCondition 提供了一个此问题清晰的解决方案，拥有此锁的线程会将此条件加入了*等待*列表，当条件成立时，通过另外一个线程的信号唤醒此线程。

下面是一个例子：

```swift
let cond = NSCondition()
var available = false
var SharedString = ""

class WriterThread : Thread {
    
    override func main(){
        for _ in 0..<5 {
            cond.lock()
            SharedString = "😅"
            available = true
            cond.signal() // 通知并且唤醒等待的线程
            cond.unlock()
        }
    }
}

class PrinterThread : Thread {
    
    override func main(){
        for _ in 0..<5 { // 循环 5 次
            cond.lock()
            while(!available){   // 通过伪信号进行保护
                cond.wait()
            }
            print(SharedString)
            SharedString = ""
            available = false
            cond.unlock()
        }
    }
}

let writet = WriterThread()
let printt = PrinterThread()
printt.start()
writet.start()
```

<a name="nsdistributedlock"></a>
### `NSDistributedLock`

分布式锁和之前看到的锁机制完全不同，我不希望大家会频繁的使用它。

此锁的目标是在多个应用中共享数据，背后是是用一个文件系统的入口（比如一个简单的文件）。这意味着所有需要用到的应用都应该可以访问这个文件系统。
使用`try()`方法来获取锁，这是一个非阻塞的方法，立即会返回一个布尔值来表明是否获取到了锁。获取锁的尝试通常是多次，通常在尝试成功之前都会加上一个合理的延迟。
使用`unlock()`方法来释放一个分布式锁。
接下来是一个简单的例子：

```swift
var dlock = NSDistributedLock(path: "/tmp/MYAPP.lock")

if let dlock = dlock {
    var acquired = false

    while(!acquired){
        print("Trying to acquire the lock...")
        usleep(1000)
        acquired = dlock.try()
    }

    // Do something...

    dlock.unlock()
}
```

<a name="osatomic_where_art_thou"></a>
### `OSAtomic` 还能用吗？

[OSAtomic]([mikeash.com: Friday Q&A 2011-03-04: A Tour of OSAtomic](https://www.mikeash.com/pyblog/friday-qa-2011-03-04-a-tour-of-osatomic.html)) 提供的原子操作，都是一些简单的操作，没有使用经典锁逻辑，允许 set，get 或者 比较后 set 变量的操作，因为 OSAtomic 考虑到了具体的 CPU 功能（一些原生原子操作），比上面的锁机制提供更好的性能。

因为它处理并发的方式比较原始，所以不能说它们在构建并发数据结构时候非常有用。

从 macOS 10.12 开始，OSAtomic 被淘汰，并且它从来不能在 Linux 下使用，但是一些开源库，比如[这个库]([GitHub - glessard/swift-atomics: Atomic operations bridged from Clang to Swift](https://github.com/glessard/swift-atomics))提供了有用的 Swift 扩展，还有[这个库](https://github.com/bignerdranch/AtomicSwift)提供类似的功能，你也可以通过最新 [AtomicKit 库]([GitHub - macmade/AtomicKit: Concurrency made simple in Swift.](https://github.com/macmade/AtomicKit))得到类似的功能。

<a name="on_synchronized_blocks"></a>
### 同步代码块

在 Swift 中，不能像 Objective-C 创建一个 @synchronized 块那样去做并发操作，Swift 中没有对应可用的关键字。

在 Darwin 系统下，可以使用 `objc_sync_enter(OBJ)` 和 `objc_sync_exit(OBJ) `实现 @ synchronized 类似的功能，并且存在一个 @objc 的对象监控器。这种方式不推荐使用，还是使用更简单的锁机制来实现并发，更加有效。

正如接下来讨论 Dispatch Queues 时候会看到的那样，使用队列来实现类似的功能，在一个序列队列里面使用少量代码操作一个同步调用：

```
serialQueue.sync {
    // 同时只有一个线程执行 
    v += 1
    print("Current value \(v)")    
}
```

<a name="grand_central_dispatch"></a>
## `GCD: Grand Central Dispatch`

对于那些还对此 API 不熟悉的人来讲，Grand Central Dispatch (GCD) 其实就是一个基于队列的 API，允许你在工作池中执行闭包。

也就是说，闭包包含需要执行的任务，然后闭包将会被添加到队列中，队列将会使用一系列串行或者并行的线程执行它们，串行或并行执行取决于队列的配置选项。但是不管是那种类型的队列，任务的执行都遵从 FIFO 原则，意味着任务的执行顺序都会按照进入的顺序进行，完工时间取决于每个任务的持续时间。

这是一个通用的处理并发的模式，在每一个现代语言的运行时中都会看到。线程池是一种简单的方式，管理，查看和控制一系列的空闲或者未连接的线程。

GCD API 在 Swift 3 有少量的修改， [SE-0088]([swift-evolution/0088-libdispatch-for-swift3.md at master · apple/swift-evolution · GitHub](https://github.com/apple/swift-evolution/blob/master/proposals/0088-libdispatch-for-swift3.md)) 优化了设计，让 API 变得面向对象。

<a name="dispatch_queues"></a>
### 调度队列
GCD 允许创建自定义队列，同时也提供访问预先定义好的系统队列的方式。

创建一个基本的串行队列，只需要提供一个字符串标签参数来识别它，通常推荐使用一个反向排序的域名前缀，用于在栈序列中查找队列的主人。

```swift
let serialQueue = DispatchQueue(label: "com.uraimo.Serial1")  //attributes: .serial

let concurrentQueue = DispatchQueue(label: "com.uraimo.Concurrent1", attributes: .concurrent)
```

第二个队列是并行队列，意味着这个队列使用线程中的可用线程来执行它包含的任务。在这种情况下，执行的顺序不可预测，不要假设闭包的完成顺序和插入顺序有任何的联系。

默认的队列可以使用 `DispatchQueue` 来获取：

```swift
let mainQueue = DispatchQueue.main

let globalDefault = DispatchQueue.global()
```

主队列是一个顺序执行的队列，用于处理 iOS 和 macOS 可视化应用中的主事件循环，响应事件并且更新用户界面。众所周知，每一个对于用于界面的修改都将会在此队列中执行，每一个长时间的操作都会在此线程中绘制用户界面，这样用户界面会响应不及时。

运行时也提供了不同的优先级区分访问其他全局队列的方式，通过指定 `Quality of Service (Qos)`  参数来实现。

不同级别的优先级定义在 `DispatchQoS `类（译者注：DispatchQoS 是一个结构体，内含一个枚举类型表示优先级）中，从高到低如下：

* .userInteractive
* .userInitiated
* .default
* .utility
* .background
* .unspecified

需要重点注意的是，在手机设备上，提供低电量模式，在低电量情况下，[后台队列会被挂起](https://mjtsai.com/blog/2017/04/03/beware-default-qos/)。

为了获取一个特定优先级的全局队列，使用 `global(qos:) `指定需要的优先级：

```swift
let backgroundQueue = DispatchQueue.global(qos: .background)
```

同样的优先级指定符可以用来创建自定义队列：

```swift
let serialQueueHighPriority = DispatchQueue(label: "com.uraimo.SerialH", qos: .userInteractive)
```

<a name="using_queues"></a>
### 使用队列

任务以闭包的方式存在，可以使用两种方式将任务提交到队列中：
使用`sync`方法进行*同步操作*，或者使用`async`方法进行*异步操作*。

当使用前者时，`sync`调用将会被阻塞，换句话说，当闭包完成时，`sync`方法才会完成（当需要等待闭包完成情况下，这种方式是有效的，但是有更好的方法），而前者会将闭包加入到队列中，安排闭包延迟执行，并且允许当前的函数继续执行。

下面是一个简单的例子：

```swift
globalDefault.async {
    print("Async on MainQ, first?")
}

globalDefault.sync {
    print("Sync in MainQ, second?")
}
```

多个分发的调用可能会被嵌套，在一个设定好的队列上执行后台的，低优先级的操作，然后需要更新主队列的用户界面。

```swift
DispatchQueue.global(qos: .background).async {
    // 后台运行的代码放在这里

    DispatchQueue.main.async {
        // 更新主界面
        print("UI updated on main queue")
    }
}
```

闭包可以在指定延迟时间后执行，Swift 3 提供了简便的方式来指定需要的时间间隔，使用 `DispatchTimeInterval `枚举中的 4 个时间单位来组合不同的时间间隔：`.seconds(Int)`, `.milliseconds(Int),` `.microseconds(Int) `和 `.nanoseconds(Int)`.

使用 `asyncAfter(deadline:execute:) `带有一个时间间隔参数来计划一个未来执行的闭包：

```swift
globalDefault.asyncAfter(deadline: .now() + .seconds(5)) {
    print("After 5 seconds")
}
```

如果想同时执行一个相同的闭包多次（类似于使用 *dispatch_apply*的那样），可以使用`concurrentPerform(iterations:execute:)`来实现，需要注意的是，这些闭包可能会在当前的队列中并行执行，所以请记住把这个调用的方法包含在一个支持并发队列的同步和异步调用中。

```swift
globalDefault.sync {  
    DispatchQueue.concurrentPerform(iterations: 5) {
        print("\($0) times")
    }
}
```

While normally a queue is ready to process its closures upon creation, it can be configured to start in an idle state and to start processing jobs only when manually enabled.
通常一个队列在创建后就会执行它的闭包，但是也可以手动的启动任务：

```swift
let inactiveQueue = DispatchQueue(label: "com.uraimo.inactiveQueue", attributes: [.concurrent, .initiallyInactive])
inactiveQueue.async {
    print("Done!")
}

print("Not yet...")
inactiveQueue.activate()
print("Gone!")
```

这是第一次需要指定多个属性的情况，正如代码所示，可以使用数组来添加多个属性。

任务可以使用继承自 `DispatchObject` 的方法来挂起或者恢复任务的执行：

```swift
inactiveQueue.suspend()

inactiveQueue.resume()
```

`setTarget(queue:) ` 方法可以用来配置非活跃队列的优先级（使用它来设置活跃队列将导致崩溃），调用此方法，把队列的优先级设置为作为参数传入队列的优先级。

<a name="barriers"></a>
### 屏障

在添加一系列闭包到指定的队列中（在不同的间隔）之后，这时想在所有异步任务完成之后执行一个任务。就需要使用屏障(Barriers)来做事。

添加 20 个（译者注：代码里面是 5 个）任务（每个任务将休眠一秒钟再执行）到之前创建的并发队列中，使用屏障在所有任务完成时打印一些东西，在最后一个 async 调用时候指定一个 `DispatchWorkItemFlags.barrier` 标识：

```swift
let concurrentQueue = DispatchQueue(label: "com.uraimo.Concurrent", attributes: .concurrent)

concurrentQueue.async { 
    DispatchQueue.concurrentPerform(iterations: 5) { (id:Int) in
        sleep(1)
        print("Async on concurrentQueue, 5 times: "+String(id))
    }
}   

concurrentQueue.async (flags: .barrier) {
    print("All 5 concurrent tasks completed")
}
```

20 个任务将会并行乱序执行，可以看到打印消息会成组出现，打印数量是 Mac 系统的执行内核的个数，但是最后一个调用将会在最后执行。

屏障还被用于强制指定并发队列的执行顺序，不想让那些已经注册任务的执行按照一个重复的方式进行。

正如 Arthur Hammer 注明的那样，分发屏障不能作用与串行队列或者任何一种类型的[全局并行队列]([dispatch_barrier_async - Dispatch | Apple Developer Documentation](https://developer.apple.com/documentation/dispatch/1452797-dispatch_barrier_async?language=objc))，如果你想使用它，就必须自定义一个全新的并行队列。

<a name="singletons_and_dispatch_once"></a>
### 单例和 Dispatch_once

众所周知，Swift 3 中已经没有了`dispatch_once`, 这个函数常用于构建线程安全的单例。

幸运的是，Swift 确保使用原子化的方式进行全局变量初始化，如果你确认常量不会在初始化后改变它的值，这两个特征确保全局常量是一个很好的实现单例的方式：

```swift
final class Singleton {

    public static let sharedInstance: Singleton = Singleton()

    private init() { }

    ...
}
```

添加类的`final`修饰确保没有子类可以继承它，并且把指定构造器设置为私有，这样就没有可能通过其他方式手动创建这个类的实例了。全局静态常量将会是 Singleton 唯一访问入口，用于获取单独的，共享的实例。

类似的行为用在定义块中，以下代码将执行一次：

```swift
func runMe() {
    struct Inner {
        static let i: () = {
            print("Once!")
        }()
    }
    Inner.i
}

runMe()
runMe() // 常量已经被初始化了
runMe() // 常量已经被初始化了
```

看起来不是那么优雅，但是能够运行，这是一种可以接受的实现方式，如果只是想执行一次性代码的话。

But if we need to replicate exactly the functionality and API of dispatch_once we need to implement it from scratch, as described in the synchronized blocks section with an extension:
如果想重现 `dispatch_once` 所提供的功能，需要重新实现，使用一个扩展在[同步模块区域](#on_synchronized_blocks)添加代码：

```swift
import Foundation

public extension DispatchQueue {
    
    private static var onceTokens = [Int]()
    private static var internalQueue = DispatchQueue(label: "dispatchqueue.once")
    
    public class func once(token: Int, closure: (Void)->Void) {
        internalQueue.sync {
            if onceTokens.contains(token) {
                return
            }else{
                onceTokens.append(token)
            }
            closure()
        }
    }
}

let t = 1
DispatchQueue.once(token: t) {
    print("only once!")
}
DispatchQueue.once(token: t) {
    print("Two times!?")
}
DispatchQueue.once(token: t) {
    print("Three times!!?")
}
```

如你所愿，三个闭包中的第一个将会被真正的执行。

<a name="dispatch_groups"></a>
### 调度组

如果你有多个任务，想添加到多个不同的队列中，并且想等待它们的完工，你可以把它们进行分组，添加到一个调度组中。

Let’s see an example, a task can be added to a specific group directly with the sync or async call:
下面是一个例子，直接使用 `sync` 或者 `async` 调用将一个任务添加到一个指定的组中：

```swift
let mygroup = DispatchGroup()

for i in 0..<5 {
    globalDefault.async(group: mygroup){
        sleep(UInt32(i))
        print("Group async on globalDefault:"+String(i))
    }
}
```

任务将在 `globalDefault` 里面执行，但是可以注册一个 `mygroup` 的回调，一旦所有任务完成以后，将会在队列中执行一个闭包，`wait()`方法用于执行阻塞等待。

```swift
print("Waiting for completion...")
mygroup.notify(queue: globalDefault) {
    print("Notify received, done waiting.")
}
mygroup.wait()
print("Done waiting.")
```

另外一种跟踪组任务方式是，手动在运行队列代码调用中进入和离开一个组，替换指定的方式：

```swift
for i in 0..<5 {
    mygroup.enter()
    sleep(UInt32(i))
    print("Group sync on MAINQ:"+String(i))
    mygroup.leave()
}
```

<a name="dispatch_work_items"></a>
### 调度工作项

闭包不是队列中指定任务实现的唯一方式，有时可能需要一个容器类型来跟踪执行的状态，这个时候 `DispatchWorkItem` 就派上了用场，工作项的每一个方法，都包括一个闭包作为它的参数。

工作项封装了一个队列线程池执行的闭包，通过 perform()  来执行这个闭包：

```swift
let workItem = DispatchWorkItem {
    print("Done!")
}

workItem.perform()
```

`DispatchWorkItem` 同样提供其它有用的方法，比如: 和组的定义一样，`notify`方法将会在指定的队列执行完成以后执行一个闭包：

```swift
workItem.notify(queue: DispatchQueue.main) {
    print("Notify on Main Queue!")
}

defaultQueue.async(execute: workItem)
```

也可以等待闭包执行结束，或者在队列尝试调用`cancel()`方法（这不是取消执行中的闭包）之前标记它删除。

```swift
print("Waiting for work item...")
workItem.wait()
print("Done waiting.")
workItem.cancel()
```

需要重点注意的是，`wait()`方法不仅仅是阻塞当前线程，等待完成，也会抬高所有队列中早先的工作项，试图尽快完成指定的项目。

<a name="dispatch_semaphores"></a>
### 调度信号量

调度信号量是一种锁，根据当前计数的值，可以被多个线程获取。

线程会等待一个信号量，直到信号量减到 0 时，就可以获取它了。

访问信号量的槽将对等待线程释放，等待线程调用`signal`方法将会增加计数。

下面是一个简单的例子：

```swift
let sem = DispatchSemaphore(value: 2)

// 信号量将被两个线程池组持有
globalDefault.sync {
    DispatchQueue.concurrentPerform(iterations: 10) { (id:Int) in
        sem.wait(timeout: DispatchTime.distantFuture)
        sleep(1)
        print(String(id)+" acquired semaphore.")
        sem.signal()
    }
}
```
<a name="dispatch_assertions"></a>
### 调度断言

Swift 3 引入了一个新的函数，用于在当前执行上下文中进行断言，用于验证一个闭包是否在预期的队列中被执行了。使用 `DispatchPredicate` 枚举的是三个值来断言执行的情况：`.onQueue`, 验证闭包是否执行在一个指定队列中，`.notOnQueue`, 验证相反的情况，`.onQueueAsBarrier`，验证当前闭包或者工作项是否作为一个队列的屏障存在。

```swift
dispatchPrecondition(condition: .notOnQueue(mainQueue))
dispatchPrecondition(condition: .onQueue(queue))
```

> 此文章和本博客相关文章代码可以从 [GitHub](https://github.com/uraimo/Swift-Playgrounds)和 [Zipped](https://www.uraimo.com/archives/2017-05-07-ConcurrencyInSwift.playground.zip)上下载。  

<a name="dispatch_sources"></a>
## 调度资源

调度资源是一种处理系统级异步事件的方式，包括内核信号，系统，文件或者 socket 相关使用事件处理的事件。

有以下几种类型可用的调度资源，归类如下：

* **Timer Dispatch Sources** : 用作产生与时间或者周期相关的事件（DispatchSourceTimer）。
**Signal Dispatch Sources** : 用于处理 UNIX 信号（DispatchSourceSignal）。
**Memory Dispatch Sources**: 
用于注册与内存使用状态相关的通知（DispatchSourceMemoryPressure）。
**Descriptor Dispatch Sources**: 
用于注册文件和socket相关的不同事件（DispatchSourceFileSystemObject, DispatchSourceRead, DispatchSourceWrite）。
**Process dispatch sources**: 
用于监控外部进程相关执行状态的时间（DispatchSourceProcess）。
**Mach related dispatch sources**: 
用于处理 Mach 内核的 [IPC 工具](http://fdiv.net/2011/01/14/machportt-inter-process-communication)相关的事件（*DispatchSourceMachReceive*, *DispatchSourceMachSend*）。

也可以在需要的时候自定义调度资源。所有的调度资源都遵从`DispatchSourceProtocol` 协议，需要定义注册处理器的基本操作，修改调度资源的激活状态等。

举一个 `DispatchSourceTimer` 的例子来理解如何使用这些对象。

使用 `DispatchSource` 的工具函数来创建资源对象，在下面代码中使用 `makeTimerSource`， 指定需要执行处理的调度队列。

时间资源没有其它参数，只需要指定队列来创建资源，调度资源可以处理多个时间，通常需要指定处理事件的标识符。

```swift
let t = DispatchSource.makeTimerSource(queue: DispatchQueue.global())
t.setEventHandler{ print("!") }
t.scheduleOneshot(deadline: .now() + .seconds(5), leeway: .nanoseconds(0))
t.activate()
```

资源建立以后，使用`setEventHandler(closure:)`注册一个时间处理器，如果没有其它配置了，使用`activate() `开启调度资源（前一个版本的`libDispatch` 使用的是 `resume()`方法）。

调度资源初始是不激活的，意味着不会立刻执行事件。当一切准备情绪后，资源将使用`activate()`激活分发事件，也可以使用`suspend()`挂起和使用`resume()`恢复。

时间资源需要一个额外的步骤来配置哪种类型的时间事件会被对象调度。在下面的例子中，定义一个会在 5 秒后执行的调度事件。

也可以定义一个周期事件，和在 [Timer](https://www.uraimo.com/swiftbites/nstimer-in-swift-3/) 对象所做的一样：

```swift
t.scheduleRepeating(deadline: .now(), interval: .seconds(5), leeway: .seconds(1))
```

当完成一个调度资源时，想完全阻止调度事件，可以使用`cancel()`来完成，这样可以停止资源事件，取消已经设置的处理器，并且进行一些清理操作，比如注销处理器等。

```swift
t.cancel()
```

其它调度资源类型的 API 是类似的，看一个 [Kitura](https://github.com/IBM-Swift/Kitura-net/blob/master/Sources/KituraNet/IncomingSocketHandler.swift#L96) 初始化读取资源的例子，用于处理在一个建立连接的 socket 的异步写：

```swift
readerSource = DispatchSource.makeReadSource(fileDescriptor: socket.socketfd,
                                             queue: socketReaderQueue(fd: socket.socketfd))

readerSource.setEventHandler() {
    _ = self.handleRead()
}
readerSource.setCancelHandler(handler: self.handleCancel)
readerSource.resume()
```

当 socket 中接收数据缓存中有新的字节可用时， `handleRead() ` 将在一个专用的队列中调用。Kitura 同样使用 `WriteSource` 来操作一个缓存写，使用分发资源事件进行[高效的写操作](https://github.com/IBM-Swift/Kitura-net/blob/master/Sources/KituraNet/IncomingSocketHandler.swift#L328)，当 socket 管道可以发送字节时，就写入新的字节。在 *nix 平台下去进行 I/O 操作，调度资源是一个很好的高阶方案，替代那些底层的 API。

对于和文件相关的调度资源，另外一个有用的对象是 `DispatchSourceFileSystemObject`， 它允许监听指定文件的变化，从名字的变化到属性的变化都可以监听。使用调度资源，你也可以接受文件修改或者删除的通知，这是 Linux 中 inotify 内核子系统的一个子集。

剩余的资源类型操作是类似的，你可以从 [libDispatch 文档](https://developer.apple.com/reference/dispatch/dispatchsource)中获取更多的细节，但是请记住的是，像 `Mach` 资源和内存压力资源只能在 `Darwin` 平台中使用。

<a name="operations_and_operationqueues"></a>
### 操作和操作队列

简单来说说操作队列，这是建立在 GCD 顶层的附加 API，把并行队列和模型任务看作为操作，易于取消，依赖其它操作完成情况来执行任务。

操作可以有优先级，定义了执行的顺序，也可以添加到 `OperationQueues` 异步执行。

看看一个基本的例子：

```swift
var queue = OperationQueue()
queue.name = "My Custom Queue"
queue.maxConcurrentOperationCount = 2

var mainqueue = OperationQueue.main // 引用主线程中的队列

queue.addOperation{
    print("Op1")
}
queue.addOperation{
    print("Op2")
}
```

可以创建一个*阻塞操作*对象，在添加到队列之前进行配置，并且可以添加多个闭包到这个类型的操作中。

需要注意的是，在 Swift 中， `NSInvocationOperation`, 不再可用，这个类可以使用 
`target+selector` 来创建操作。

```swift
var op3 = BlockOperation(block: {
    print("Op3")
})
op3.queuePriority = .veryHigh
op3.completionBlock = {
    if op3.isCancelled {
        print("Someone cancelled me.")
    }
    print("Completed Op3")
}

var op4 = BlockOperation {
    print("Op4 always after Op3")
    OperationQueue.main.addOperation{
        print("I'm on main queue!")
    }
}
```

操作会有优先级，第二个完整的闭包将在主闭包完成后执行一次。

还可以添加 `op4` 对 `op3` 的依赖，这样 `op4` 将等待 `op3` 的完成。

```swift
op4.addDependency(op3)
queue.addOperation(op4)  // op3 会一直在 op4 之前执行
queue.addOperation(op3)
```

也可以使用 `removeDependency(operation:) ` 移除依赖，依赖是存储在一个公开访问的依赖数组中。

操作的状态可以使用指定的属性查看：

```swift
op3.isReady       // 是否准备好执行？
op3.isExecuting   // 是否执行中？
op3.isFinished    // 是否执行完成或被取消掉？
op3.isCancelled    // 是否被手动取消？
```

调用 `cancelAllOperations` 可以取消一个现存队列中所有的操作，在队列中存在的所有操作都会被设置 `isCancelled` 标识。调用 cancel 方法可以取消单个操作：

```swift
queue.cancelAllOperations() 
op3.cancel()
```

推荐执行时对 `isCancelled` 属性进行检查，当计划在队列中执行这个操作时，一旦操作被取消，可以检查`isCancelled`来跳过这个执行。

最后，可以在操作队列中停止新操作的执行（当前执行中的操作不会被影响）：

```swift
queue.isSuspended = true
```

> 此文章和本博客相关文章代码可以从 [GitHub](https://github.com/uraimo/Swift-Playgrounds)和 [Zipped](https://www.uraimo.com/archives/2017-05-07-ConcurrencyInSwift.playground.zip)上下载。  

<a name="closing_thoughts"></a>
### 后记

这篇文章很好的总结了 Swift 中目前可用的外部并发框架。

即将到来的此系列第二部分将聚焦在如何在不引入外部库的情况下，使用原生语言特性来处理并发。借助现有的一些开源实现，介绍一些有趣的范式。

我希望这两篇文章是一个打开并发编程之门的很好的介绍，这将有助于理解和参与在 swift-evolution 中的讨论，至于何时会引入原生的支持，希望是 Swift 5吧。

查看更多关于 Swift 和并发有趣的故事，可以查看博客：[Cocoa With Love](https://www.cocoawithlove.com/tags/asynchrony.html)。

喜欢这篇文章吗？给我 [twitter](https://www.twitter.com/uraimo) 留言吧！