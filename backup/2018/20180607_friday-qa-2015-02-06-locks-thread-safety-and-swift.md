title: "Swift 中的锁和线程安全"
date: 2018-06-07
tags: [Swift]
categories: [Mike Ash]
permalink: friday-qa-2015-02-06-locks-thread-safety-and-swift
keywords: 
custom_title: 
description: 

---
原文链接=https://www.mikeash.com/pyblog/friday-qa-2015-02-06-locks-thread-safety-and-swift.html
作者=Mike Ash
原文日期=2015-02-06
译者=Lefe_x
校对=numbbbbb,Yousanflics,liberalism
定稿=CMB

<!--此处开始正文-->

在 Swift 中有个有趣的现象：它没有与线程相关的语法，也没有明确的互斥锁/锁（`mutexes/locks`）概念，甚至 Objective-C 中有的 `@synchronized` 和原子属性它都没有。幸运的是，苹果系统的 API 可以非常容易地应用到 Swift 中。今天，我会介绍这些 API 的用法以及从 Objective-C 过渡的一些问题，这些灵感都来源于 Cameron Pulsford。

<!--more-->

## 快速回顾一下锁

锁（`lock`）或者互斥锁（`mutex`）是一种结构，用来保证一段代码在同一时刻只有一个线程执行。它们通常被用来保证多线程访问同一可变数据结构时的数据一致性。主要有下面几种锁：

- 阻塞锁（`Blocking locks`）：常见的表现形式是当前线程会进入休眠，直到被其他线程释放。
- 自旋锁（`Spinlocks`）：使用一个循环不断地检查锁是否被释放。如果等待情况很少话这种锁是非常高效的，相反，等待情况非常多的情况下会浪费 CPU 时间。
- 读写锁（`Reader/writer locks`）：允许多个读线程同时进入一段代码，但当写线程获取锁时，其他线程（包括读取器）只能等待。这是非常有用的，因为大多数数据结构读取时是线程安全的，但当其他线程边读边写时就不安全了。
- 递归锁（`Recursive locks`）：允许单个线程多次获取相同的锁。非递归锁被同一线程重复获取时可能会导致死锁、崩溃或其他错误行为。

## APIs

苹果提供了一系列不同的锁 API，下面列出了其中一些： 

- `pthread_mutex_t`
- `pthread_rwlock_t`
- `dispatch_queue_t`
- `NSOperationQueue` 当配置为 `serial` 时
- `NSLock`
- `OSSpinLock`

除此之外，Objective-C 提供了 `@synchronized` 语法结构，它其实就是封装了 `pthread_mutex_t` 。与其他 API 不同的是，`@synchronized` 并未使用专门的锁对象，它可以将任意 Objective-C 对象视为锁。`@synchronized(someObject)` 区域会阻止其他 `@synchronized(someObject)` 区域访问同一对象指针。不同的 API 有不同的行为和能力： 

- `pthread_mutex_t` 是一个可选择性地配置为递归锁的阻塞锁；
- `pthread_rwlock_t` 是一个阻塞读写锁；
- `dispatch_queue_t` 可以用作阻塞锁，也可以通过使用 barrier block 配置一个同步队列作为读写锁，还支持异步执行加锁代码；
- `NSOperationQueue` 可以用作阻塞锁。与 `dispatch_queue_t` 一样，支持异步执行加锁代码。
- `NSLock` 是 Objective-C 类的阻塞锁，它的同伴类 `NSRecursiveLock` 是递归锁。
- `OSSpinLock` 顾名思义，是一个自旋锁。

最后，`@synchronized` 是一个阻塞递归锁。

### 值类型

注意，`pthread_mutex_t`，`pthread_rwlock_t` 和 `OSSpinLock` 是值类型，而不是引用类型。这意味着如果你用 `=` 进行赋值操作，实际上会复制一个副本。这会造成严重的后果，因为这些类型无法复制！如果你不小心复制了它们中的任意一个，这个副本无法使用，如果使用可能会直接崩溃。这些类型的 `pthread` 函数会假定它们的内存地址与初始化时一样，因此如果将它们移动到其他地方就可能会出问题。`OSSpinLock ` 不会崩溃，但复制操作会生成一个完全独立的锁，这不是你想要的。

如果使用这些类型，就必须注意不要去复制它们，无论是显式的使用 `=` 操作符还是隐式地操作。
例如，将它们嵌入到结构中或在闭包中捕获它们。

另外，由于锁本质上是可变对象，需要用 `var` 来声明它们。

其他锁都是是引用类型，它们可以随意传递，并且可以用 `let` 声明。 

### 初始化

2015-02-10 更新：本节中所描述的问题已经以惊人的速度被淘汰。苹果昨天发布了 Xcode 6.3 beta 1，其中包括 Swift 1.2。在其他更改中，现在使用一个空的初始化器导入 C 结构，将所有字段设置为零。简而言之，你现在可以直接使用 `pthread_mutex_t()`，不需要下面提到的扩展。

pthread 类型很难在 swift 中使用。它们被定义为不透明的结构体中包含了一堆存储变量，例如：

```swift
struct _opaque_pthread_mutex_t {
    long __sig;
    char __opaque[__PTHREAD_MUTEX_SIZE__];
};
```

目的是声明它们，然后使用 init 函数对它们进行初始化，使用一个指针存储和填充。在 C 中，它看起来像： 

```c
pthread_mutex_t mutex;
pthread_mutex_init(&mutex, NULL);
```

这段代码可以正常的工作，只要你记得调用 `pthread_mutex_init`。然而，Swift 真的真的不喜欢未初始化的变量。与上面代码等效的 Swift 版本无法编译： 

```swift
var mutex: pthread_mutex_t
pthread_mutex_init(&mutex, nil)
// error: address of variable 'mutex' taken before it is initialized
```

Swift 需要变量在使用前初始化。`pthread_mutex_init` 不使用传入的变量的值，只是重写它，但是 Swift 不知道，因此它产生了一个错误。为了满足编译器，变量需要用某种东西初始化。在类型之后使用 `()`，但这样写仍然会报错：

```swift
var mutex = pthread_mutex_t()
// error: missing argument for parameter '__sig' in call
```

Swift 需要那些不透明字段的值。`__sig` 可以传入零，但是 `__opaque` 就有点烦人了。下面的结构体需要桥接到 swift 中：

```swift
struct _opaque_pthread_mutex_t {
   var __sig: Int
   var __opaque: (Int8, Int8, Int8, Int8,
               Int8, Int8, Int8, Int8,
               Int8, Int8, Int8, Int8,
               Int8, Int8, Int8, Int8,
               Int8, Int8, Int8, Int8,
               Int8, Int8, Int8, Int8,
               Int8, Int8, Int8, Int8,
               Int8, Int8, Int8, Int8,
               Int8, Int8, Int8, Int8,
               Int8, Int8, Int8, Int8,
               Int8, Int8, Int8, Int8,
               Int8, Int8, Int8, Int8,
               Int8, Int8, Int8, Int8,
               Int8, Int8, Int8, Int8)
}
```

目前没有简单的方法使用一堆 0 构建一个元组，只能像下面这样把所有的 0 都写出来：

```swift
var mutex = pthread_mutex_t(__sig: 0,
                             __opaque: (0, 0, 0, 0, 0, 0, 0, 0,
                                        0, 0, 0, 0, 0, 0, 0, 0,
                                        0, 0, 0, 0, 0, 0, 0, 0,
                                        0, 0, 0, 0, 0, 0, 0, 0,
                                        0, 0, 0, 0, 0, 0, 0, 0,
                                        0, 0, 0, 0, 0, 0, 0, 0,
                                        0, 0, 0, 0, 0, 0, 0, 0))
```

这么写太难看了，但我没找到好的方法。我能想到最好的做法就是把它写到一个扩展中，这样直接使用空的 `()` 就可以了。下面是我写的两个扩展： 

```swift
    extension pthread_mutex_t {
        init() {
            __sig = 0
            __opaque = (0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0)
        }
    }

    extension pthread_rwlock_t {
        init() {
            __sig = 0
            __opaque = (0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0)
        }
    }
```

可以通过下面这种方式使用：

```swift
var mutex = pthread_mutex_t()
pthread_mutex_init(&mutex, nil)
```

## 锁的封装

为了使这些不同的 API 更易于使用，我编写了一系列小型函数。我决定把 `with` 作为一个方便、简短、看起来像语法的名字，灵感来自 python 的 `with` 声明。Swift 函数重载允许不同类型使用相同的名称。基本形式如下所示：

```swift
func with(lock: SomeLockType, f: Void -> Void) { ...
```

然后在锁定的情况下执行函数 f。下面我们来实现这些类型。

对于值类型，它需要一个指向锁的指针，以便 lock/unlock 函数可以修改它。这个实现`pthread_mutex_t` 只是调用相应的 lock 和 unlock 函数，f 函数在两者之间调用：

```swift
func with(mutex: UnsafeMutablePointer<pthread_mutex_t>, f: Void -> Void) {
    pthread_mutex_lock(mutex)
    f()
    pthread_mutex_unlock(mutex)
}
```

`pthread_rwlock_t` 的实现几乎完全相同：

```swift
func with(rwlock: UnsafeMutablePointer<pthread_rwlock_t>, f: Void -> Void) {
    pthread_rwlock_rdlock(rwlock)
    f()
    pthread_rwlock_unlock(rwlock)
}
```

与读写锁做个对比，它们看起来很像：

```swift
func with_write(rwlock: UnsafeMutablePointer<pthread_rwlock_t>, f: Void -> Void) {
    pthread_rwlock_wrlock(rwlock)
    f()
    pthread_rwlock_unlock(rwlock)
}
```

`dispatch_queue_t` 更简单。它只需要封装 `dispatch_sync：`：

```swift
func with(queue: dispatch_queue_t, f: Void -> Void) {
    dispatch_sync(queue, f)
}
```

如果一个人想显摆自己很聪明，那么可以充分利用 Swift 的函数式特性简单的写出这样的代码：

`let with = dispatch_sync`

这种写法存在一些问题，最大的问题是它会和我们这里使用的基于类型的重载混淆。

`NSOperationQueue` 在概念上是相似的，不过没有 `dispatch_sync` 可以用。我们需要创建一个操作（`operation`），将其添加到队列中，并显式等待它完成：

```swift
func with(opQ: NSOperationQueue, f: Void -> Void) {
    let op = NSBlockOperation(f)
    opQ.addOperation(op)
    op.waitUntilFinished()
}
```

实现 `NSLock` 看起来像 `pthread` 版本，只是锁定调用有些不同：

```swift
func with(lock: NSLock, f: Void -> Void) {
    lock.lock()
    f()
    lock.unlock()
}
```

最后，`OSSpinLock` 的实现同样也是如此：

```swift
func with(spinlock: UnsafeMutablePointer<OSSpinLock>, f: Void -> Void) {
    OSSpinLockLock(spinlock)
    f()
    OSSpinLockUnlock(spinlock)
}
```

### 模仿 `@synchronized`

有了上面的封装，模仿 `@synchronized` 的实现就变得很简单。给你的类添加一个属性，持有一个锁，然后使用 `with` 替代 `@synchronized` ：

```swift
let queue = dispatch_queue_create("com.example.myqueue", nil)

func setEntryForKey(key: Key, entry: Entry) {
    with(queue) {
        entries[key] = entry
    }
}
```

从 block 中获取数据比较麻烦。`@synchronized` 可以从内部 `return` ，但是 `with` 做不到。你必须使用一个 `var` 变量在 block 内部赋值给它：

```swift
func entryForKey(key: Key) -> Entry? {
    var result: Entry?
    with(queue) {
        result = entries[key]
    }
    return result
}
```

按理说可以将这段代码当做模板封装在一个通用函数中，但是它无法通过 Swift 编译器的类型推断，目前还没有找到解决方法。

### 模拟原子属性

原子属性（`atomic`）并不常用。与其他代码属性不同，原子属性并不支持组合率。如果函数 f 不存在内存泄漏，函数 g 不存在内存泄漏，那么函数 h 只是调用 f 和 g 也不会存在内存泄漏。但是原子属性并不满足这个条件。举一个例子，假设你有一个定义成原子属性并且线程安全的 Account 类：

```swift
let checkingAccount = Account(amount: 100)
let savingsAccount = Account(amount: 0)
```

现在要把钱转到储蓄账户中：

```swift
checkingAccount.withDraw(100)
savingsAccount.deposit(100)
```

在另一个线程中，统计并显示余额：

```swift
println("Your total balance is: \(checkingAccount.amount + savingsAccount.amount)")
```

在某些情况下，这段代码会打印 0，而不是 100，尽管事实上这些 Account 对象本身是原子属性，并且用户确实有 100 的余额。所以，最好让整个子系统都满足原子性，而不是单个属性。

在极少数情况下，原子属性是有用的，因为它并不依赖其他特性，只需要线程安全即可。要在 Swift 中实现这一点，需要一个计算属性来完成锁定，用另一个常规属性保存值：

```swift
private let queue = dispatch_queue_create("...", nil)
private var _myPropertyStorage: SomeType

var myProperty: SomeType {
    get {
        var result: SomeType?
        with(queue) {
            result = _myPropertyStorage
        }
        return result!
    }
    set {
        with(queue) {
            _myPropertyStorage = newValue
        }
    }
}
```

### 如何选择锁 API

`pthread` API 在 Swift 中不太好用，而且功能并不比其它 API 多。一般我比较喜欢在 C 和 Objective-C 中使用它们，因为它们又好用又高效。但是在 Swift 中，除非必要，我一般不会用。

一般来说不需要用读写锁，大多数情况下读写速度都非常快。读写锁带来的额外开销超过了并发读取带来的效率提升。

递归锁会发生死锁。多数情况下它们是有用的，但如果你发现自己需要获取一个已经在当前线程被锁住的锁，那最好重新设计代码，通常来说不会出现这种需求。

我的建议是，如果不知道该用什么，那就默认选择 `dispatch_queue_t` 。虽然用起来相对麻烦，但是不会产生太多问题。该 API 非常方便，并且确保你永远不会忘记调用 lock 和 unlock。它提供了许多有用的 API，如使用单个 `dispatch_async` 在后台执行被锁定的代码，或者设置定时器或其他作用于 queue 的事件源，以便它们自动执行锁定。你甚至可以用它作为 `NSNotificationCenter` 观察者，或者使用 `NSOperationQueue` 的属性 `underlyingQueue` 作为 `NSURLSession` 代理。

`NSOperationQueue` 可能认为自己和 `dispatch_queue_t` 一样牛👃，但是实际上很少有场景需要使用它。这个 API 使用起来更麻烦，而且和其他 API 比没有什么优势，无非在某些情况下，它能自动进行操作的依赖关系管理，也就这点比较有用。

`NSLock` 是一个简单的锁定类，易于使用且效率很高。如果需要显式锁定和解锁，那可以用它替代 `dispatch_queue_t` 。但在大多数情况下不需要使用它。

`OSSpinLock` 对于经常使用锁定、竞争较少且锁定代码运行速度快的用户来说，是一个很好的选择。它的开销非常少，有助于提升性能。如果代码可能会在很长一段时间内保持锁定或竞争很多，那最好不要用这个 API，因为这会浪费 CPU 时间。通常来说，你可以先使用 `dispatch_queue_t` ，如果这块出现了性能问题，再考虑换成 `OSSpinLock` 。

### 总结

Swift 语言层面并不支持线程同步，但是 Apple 的系统框架有很多好用的 API。`GCD` 和 `dispatch_queue_t` 非常好用，并且Swift 中的 API 也是如此。虽然 Swift 里没有 `@synchronized` 和原子属性，但我们有其他更好的选择。