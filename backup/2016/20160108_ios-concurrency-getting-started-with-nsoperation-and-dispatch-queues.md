title: "iOS 并发：从 NSOperation 和 Dispatch Queues 开始"
date: 2016-01-08
tags: [Swift 进阶]
categories: [AppCoda]
permalink: ios-concurrency-getting-started-with-nsoperation-and-dispatch-queues

---
原文链接=http://www.appcoda.com/ios-concurrency/
作者=hossam ghareeb
原文日期=2015-12-09
译者=ray16897188
校对=Channe
定稿=千叶知风

<!--此处开始正文-->

并发（Concurrency）在 iOS 开发中总是被看作是洪水猛兽一般。人们以为它是一个很危险的领域，很多开发者都尽量避免与其接触。更有传闻说你一定要竭尽所能的避免写任何关于多线程的代码。假如你对并发不是很了解却还去使用它的话，那么我同意：并发是很危险的。只是它的危险是因为你不了解它。试想一下常人一生中体验过的危险运动和行为有多少，很多对吧？但是当掌握了之后，就会统统变成小菜一碟。并发是把双刃剑，你应该掌握并学会如何去使用它。它能帮你写出效率高、执行快、反应灵敏的 App，而与此同时，对它的滥用会无情的毁掉你的 App。这就是为什么在开始写任何关于并发的代码之前，先要想一想你为什么要用到并发、需要用到哪个（与并发有关的）API 来解决这个问题。iOS 中我们有很多能用到的 API。在此教程里我会讲到最常用的两个：`NSOperation` 和 `Dispatch Queues`（派发队列）。

<!--more-->

![](/img/articles/ios-concurrency-getting-started-with-nsoperation-and-dispatch-queues/12401452214820.2549465)

## 我们为什么要用并发？

我知道你是一个有 iOS 背景的出色开发者。然而无论你要做一个什么样的 App，你都需要了解并发，让你的 App 更快，更灵敏。我总结了一下学习和使用并发所带来的优点：

- **能更有效的利用 iOS 设备的硬件：**现在所有的 iOS 设备都有一个多核处理器，可以让开发者并行执行多个任务。你应该好好利用这个特性，让硬件优势发挥出来。
- **更好的用户体验：**你可能写过一些呼叫网络服务、处理 IO，或者是其他任何执行繁重任务的代码。你也知道在 UI 所在的线程中做这些操作会把你的 App 冻结住，使它没任何反应。当用户遇到这种情况时，他/她会毫不犹豫的直接杀掉或是关闭你的 App。而用并发的话，这些繁重的任务就会被安排到后台去执行，不会占满主线程、干扰你用户的操作。他们依旧能够点击按钮，来回拖动屏幕并在你的 App 中的每个页面之间跳转，与此同时在后台还处理着繁重的装载任务。
- **NSOperation 和 Dispatch Queues 这样的 API 让使用并发变得容易：**创建并管理线程并不是简单的事情。这也是为什么很多的开发者一听到并发，还有多线程代码这样的术语时会感到害怕的原因。在 iOS 中我们有强大而易用的并发 API，让你的生活变得更来福。你无需再为创建线程或管理底层的东西操心，API 会为你搞定。这些 API 的另一个优点是它们能轻松帮你实现同步（synchronization），避免了竞态条件（race condition）的产生，而竞态条件产生在当多个线程试图访问相同的资源的时候，这会引起无法预计的后果。有了同步，你就保护了资源不会被多个线程同时访问。

## 关于并发你都需要知道些什么？

在本篇教程中，我会解释为理解并发你所需要了解的一切，消除你对它的所有恐惧心理。首先我推荐你去看一下 blocks（即 Swift 中的 closures），它们在并发中会被大量使用。之后我们会聊一下 `Dispatch Queues` 和 `NSOperationQueues`。我会带你了解每个并发中的概念，概念之间的不同，以及如何使用它们。

## 第一部分：GCD（Grand Central Dispatch）

GCD 是在系统的Unix层级中用于管理并发代码并异步执行操作时最常用的 API。GCD 提供并且管理任务的队列（queues of tasks）。先来看看什么是队列。

### 什么是队列

队列是按照先进先出（FIFO）顺序管理对象的数据结构。队列类似于电影院的售票窗口前的长队。电影票是按先到先得的顺序卖出。长队前面的人先买到票，晚来的人后买到票。计算机科学中的队列概念和这个很像，因为第一个被加到队列中的对象也是第一个要从队列中被移除的。
![Photo credit: FreeImages.com/Sigurd Decroos](/img/articles/ios-concurrency-getting-started-with-nsoperation-and-dispatch-queues/12401452214821.022044)

### Dispatch Queues

`Dispatch Queues` 是一种能够轻松执行异步和并发任务的方式。它们是队列，其中的任务是由你的 App 以 blocks（代码块）的形式提交。`Dispatch Queues` 有两种：(1)串行队列（serial queues），和(2)并发队列（concurrent queues）。在讲述两者的不同之前，你需要知道派给这两种队列的任务是在另外的线程中被执行，而不是在创建它们的那个线程中被执行。换句话说，你是在主线程中创建block并将其提交到 `Dispatch Queues` 中去。但所有这些任务（block）会在其他的线程中运行，并非主线程。

### 串行队列

当你选择创建一个串行队列时，该队列在某一时刻只能执行一个任务。该队列中的所有任务都会彼此尊重，按序执行。然而你无需担心其他队列中的任务，意思是你依然可以通过使用多个串行队列来以并发的形式执行任务。例如你可以创建两个串行队列，每一个队列某一时刻只能执行一个任务，但是还是有最多两个任务被并发执行。

用串行队列来管理一个共享资源（shared resource）再合适不过。它提供的对共享资源的访问确保是串行化的，从而防止竞态条件的发生。想象一下有个售票小摊，还有一大堆人想买电影票，那小摊的售票员就是一个共享资源。如果这个售票员必须同时为这堆人服务时就会特别混乱。为避免这个情况，买票的人会被要求去排队（串行队列），这样售票员同一时刻就可以只对一人服务。

再说一遍，这里没有说电影院每时刻只能为一个顾客服务。如果电影院再开两个售票点，就可以同时服务三位客户了。这也是为什么我说过即使你使用串行队列还依然能并行执行多个任务的原因。

使用串行队列的优点：

1. 能确保对一个共享资源进行串行化的访问，避免了竞态条件；
2. 任务的执行顺序是可预知的；你向一个串行队列提交任务时，它们被执行的顺序与它们被提交的顺序相同；
3. 你可以创建任意数量的串行队列；

### 并发队列

正如其名，并发队列可以让你并行的执行多个任务。任务（block）按照它们被加入到队列中的顺序依次开始，但是它们都是并发的被执行，并不需要彼此等待才开始。并发队列能保证任务按同一顺序开始，但你不能知道执行的顺序、执行的时间以及在某一时刻正在被执行任务的数量。

比如你向一个并发队列提交了三个任务（任务#1，#2和#3）。任务被并发执行，按照加入队列的顺序依次开始。然而任务的执行时间和结束时间都不相同。即使任务#2和#3可能会迟一些开始，它们可能都会先于任务#1结束。对任务的执行是由系统本身决定。

### 使用队列

已经解释了串行队列和并发队列，现在来看看如何使用它们。系统会缺省为每个应用提供一个串行队列和四个并发队列。其中 main dispatch queue（主派发队列）是全局可用的串行队列，在应用的主线程中执行任务。这个队列被用来更新 App 的 UI，执行所有与更新 UIViews 相关的任务。该队列中同一时刻只执行一个任务，这就是为什么当你在主队列中运行一个繁重的任务时UI会被阻塞的原因。

除主队列之外，系统还提供了4个并发队列。我们管它们叫 Global Dispatch queues（全局派发队列）。这些队列对整个应用来说是全局可用的，彼此只有优先级高低的区别。要使用其中一个全局并发队列的话，你得使用 **dispatch_get_global_queue** 函数获得一个你想要的队列的引用，该函数的第一个参数取如下值：

- DISPATCH\_QUEUE\_PRIORITY\_HIGH
- DISPATCH\_QUEUE\_PRIORITY\_DEFAULT
- DISPATCH\_QUEUE\_PRIORITY\_LOW
- DISPATCH\_QUEUE\_PRIORITY\_BACKGROUND

这些队列类型代表着执行优先级。带有 HIGH 的队列有最高优先级，BACKGROUND 则是最低的优先级。这样你就能基于任务的优先级来决定要用哪一个队列。还要注意这些队列也被 Apple 的 API 所使用，所以这些队列中并不只有你自己的任务。

最后，你可以创建任何数量的串行或并发队列。使用并发队列的情况下，即使你可以自己创建，我还是强烈建议你使用上面那四个全局队列。

## GCD 小抄

现在你应该有了一个对 `Dispatch Queues` 的基本了解。我会给你一个简单的小抄做参考。里面很简单，包含了对 GCD 你需要了解的所有信息。

![](/img/articles/ios-concurrency-getting-started-with-nsoperation-and-dispatch-queues/12401452214821.2764683)

还不错吧？现在我们来研究一个简单的示范，看看如何使用 `Dispatch Queues`。我会告诉你如何使用 `Dispatch Queues` 来优化 App 的性能，让它有更快的响应速度。

## 示例项目

我们的初始项目很简单，它展示4个 image views，每个 image view 显示一张来自远端站点的图片。图片的请求是在主线程中完成。为了给你展示这么做对UI响应会有何影响，我还在图片下面加了一个简单的 slider。[下载并运行这个初始项目](https://www.dropbox.com/s/lkiasutevec5vx0/ConcurrencyDemoStarter.zip?dl=0)。点击 **Start** 按钮开始图片的下载，然后在图片下载的过程中拖动 slider，你会发现根本就拖不动。

![](/img/articles/ios-concurrency-getting-started-with-nsoperation-and-dispatch-queues/12401452214821.4513347)
你点了 Start 按钮之后，图片就会在主线程中开始下载。显然这种方式糟糕至极，让 UI 无法响应。不幸的是时至今日还有很对的 App 依旧在主线程中执行繁重的装载任务。现在我们使用 `Dispatch Queues` 来解决这个问题。

首先我们使用并发队列的解决方案，随后再使用串行队列的解决方案。

### 使用 Concurrent Dispatch Queues

现在回到 Xcode 项目的 ViewController.swift 文件中。如果你细看一下代码，就会看到点击事件的方法 **didClickOnStart**。这个方法负责处理图片的下载。我们现在是这样来完成该任务的：

```swift
@IBAction func didClickOnStart(sender: AnyObject) {
    let img1 = Downloader.downloadImageWithURL(imageURLs[0])
    self.imageView1.image = img1
    
    let img2 = Downloader.downloadImageWithURL(imageURLs[1])
    self.imageView2.image = img2
    
    let img3 = Downloader.downloadImageWithURL(imageURLs[2])
    self.imageView3.image = img3
    
    let img4 = Downloader.downloadImageWithURL(imageURLs[3])
    self.imageView4.image = img4
    
}
```

每一个 downloader 都被看作是一个任务，而所有的任务都在主队列中被执行。现在我们来获得一个全局并发队列的引用，该队列是默认优先级的那个。

```swift
let queue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0)
        dispatch_async(queue) { () -> Void in
            
            let img1 = Downloader.downloadImageWithURL(imageURLs[0])
            dispatch_async(dispatch_get_main_queue(), {
                
                self.imageView1.image = img1
            })
            
        }
```

先用 *dispatch\_get\_global\_queue* 获得到默认并发队列的引用，然后在 block 中提交一个任务，下载第一张图片。当图片下载完成后，我们再向主队列提交另外一个任务，这个任务用拿下载好了的图片去更新 image view。换句话说，我们就是将图片下载任务放到了后台线程中执行，而 UI 相关的任务则是在主线程中执行。

对剩下的图片做同样改动，代码如下：

```swift
@IBAction func didClickOnStart(sender: AnyObject) {
    
    let queue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0)
    dispatch_async(queue) { () -> Void in
        
        let img1 = Downloader.downloadImageWithURL(imageURLs[0])
        dispatch_async(dispatch_get_main_queue(), {
            
            self.imageView1.image = img1
        })
        
    }
    dispatch_async(queue) { () -> Void in
        
        let img2 = Downloader.downloadImageWithURL(imageURLs[1])
        
        dispatch_async(dispatch_get_main_queue(), {
            
            self.imageView2.image = img2
        })
        
    }
    dispatch_async(queue) { () -> Void in
        
        let img3 = Downloader.downloadImageWithURL(imageURLs[2])
        
        dispatch_async(dispatch_get_main_queue(), {
            
            self.imageView3.image = img3
        })
        
    }
    dispatch_async(queue) { () -> Void in
        
        let img4 = Downloader.downloadImageWithURL(imageURLs[3])
        
        dispatch_async(dispatch_get_main_queue(), {
            
            self.imageView4.image = img4
        })
    }
    
}
```

你向默认队列以并发任务的形式提交了四个图片的下载任务。现在创建项目然后运行 App ，运行起来应该更快了（如果你收到任何错误告警，在把你的代码和上面的比较一下）。注意到下载图片的过程中你应该可以拖动那个 slider，没有任何延迟。

### 使用 Serial Dispatch Queues

另一种解决延迟问题的方法是使用串行队列。现在还是回到 ViewController.swift 中的 didClickOnStart() 方法。这回我们用一个串行队列来下载图片。使用串行队列时你一定要留意你所引用的到底是哪一个串行队列。每一个 App 都有一个默认的串行队列，实际上它也是UI任务相关的主队列。所以切记用串行队列的时候，你一定要创建一个新的，否则就会在 App 尝试执行更新UI相关任务的同时又执行你的任务。这就会产生错误，引起延时，毁掉用户体验。你可以使用 dispatch_queue_create 函数创建一个新的队列，然后将所有任务按相同方式提交给它，和我们之前做的一样。更改之后，代码如下：

```swift
@IBAction func didClickOnStart(sender: AnyObject) {
    
    let serialQueue = dispatch_queue_create("com.appcoda.imagesQueue", DISPATCH_QUEUE_SERIAL)
    
    
    dispatch_async(serialQueue) { () -> Void in
        
        let img1 = Downloader .downloadImageWithURL(imageURLs[0])
        dispatch_async(dispatch_get_main_queue(), {
            
            self.imageView1.image = img1
        })
        
    }
    dispatch_async(serialQueue) { () -> Void in
        
        let img2 = Downloader.downloadImageWithURL(imageURLs[1])
        
        dispatch_async(dispatch_get_main_queue(), {
            
            self.imageView2.image = img2
        })
        
    }
    dispatch_async(serialQueue) { () -> Void in
        
        let img3 = Downloader.downloadImageWithURL(imageURLs[2])
        
        dispatch_async(dispatch_get_main_queue(), {
            
            self.imageView3.image = img3
        })
        
    }
    dispatch_async(serialQueue) { () -> Void in
        
        let img4 = Downloader.downloadImageWithURL(imageURLs[3])
        
        dispatch_async(dispatch_get_main_queue(), {
            
            self.imageView4.image = img4
        })
    }
    
}
```

正如我们所见，与并行队列解决方案唯一的不同就是需要创建一个串行队列。再次点击 build 然后运行 App ，你又会看见图片在后台进行下载，所以可以和UI进行交互。

但是你会注意到两点：

1. 与使用并发队列的情况相比，下载图片的时间有些长。原因是我们在同一时刻只下载一张图片。每个任务必须等到前一个任务执行完成后才会被执行。
2. 图片的下载是按照 image1，image2，image3，和 image4 的顺序。因为使用的是每次只能执行一个任务的串行队列。

## 第二部分：Operation Queues

GCD 是一个底层的 C API，能让开发者并行执行任务。与之相对比，Operation queues 是对队列模型的高层级抽象，而且是基于GCD创建的。这意味着你可以像GCD那样执行并发任务，只不过是以一种面性对象的风格。简而言之，Operation Queues 让开发者的“来福”更进一步。

与 GCD 不同的是，Operation Queues 不遵循先进先出的顺序。以下是 Operation Queues 和 `Dispatch Queues` 的不同：

1. 不遵循 FIFO（先进先出）：在 Operation Queues 中，你可以设置 operation（操作）的执行优先级，并且可以在 operation 之间添加依赖，这意味着你可以定义某些 operation，使得它们可以在另外一些 operation 执行完毕之后再被执行。这就是为什么它们不遵循先进先出的顺序。
2. 默认情况下 Operation Queues 是并发执行：虽然你不能将其改成串行队列，但还是有一种方法，通过在 operation 之间添加相依性来让 Operation Queues 中的任务按序执行。
3. Operation Queues 是 *NSOperationQueue* 类的实例，任务被封装在 *NSOperation* 的实例中。

### NSOperation

任务是以 *NSOperation* 实例的形式被提交到 Operation Queues 中去的。之前说过 GCD 中任务是以 block 的形式被提交。在这里也是类似，只不过是需要被绑到 [NSOperation](https://developer.apple.com/library/mac/documentation/Cocoa/Reference/NSOperation_class/) 实例中。你可以简单的将 `NSOperation` 看作是一套工作任务的整体。

`NSOperation` 是一个抽象的类，不可以被直接拿来用，所以你只能使用 `NSOperation` 的子类。在 iOS 的 SDK 中有两个 `NSOperation` 的具体子类。这两个类可以直接用，但是你也可以用 `NSOperation` 的子类，创建你自己的类来完成特定 operation。这两个可以直接使用的类是：

1. **NSBlockOperation** - 用这个类来初始化包含一个或多个 blocks 的 operation。该 operation 本身可包含的 block 超过一个，当所有的block 执行完毕后这个 operation 就被视为已完成。
2. **NSInvocationOperation**  - 用这个类来初始化一个 operation，能用来调用某指定对象的选择器（selector）。

那么 `NSOperation` 的优势在哪里？

1. 首先它可以通过 `NSOperation` 类的 addDependency（op: NSOperation）方法获得对相依性的支持。如果你有这样的需求：即某 operation 的启动需取决于另一个 operation 的执行，那么就得用 `NSOperation`。
![](/img/articles/ios-concurrency-getting-started-with-nsoperation-and-dispatch-queues/12401452214821.6419117)
2. 其次，你可将 *queuePriority* 属性设为以下值来改变执行优先级：

```swift
public enum NSOperationQueuePriority : Int {
    case VeryLow
    case Low
    case Normal
    case High
    case VeryHigh
}
```
拥有最高优先级的 operation 会被第一个执行。

3. 你可以取消掉某特定队列中的某个 operation，或者是取消队列中所有的 operation。
通过调用 `NSOperation` 类的 cancel() 方法来实现对 operation 的取消。你取消任何 operation 的时候，会是下面三种场景之一：
  + 你的 operation 已经完成了，这种情况下 cancel 方法没有任何效果。
  + 你的 operation 正在被执行的过程中，这种情况下系统不会强制停止你的 operation 代码，而是将 cancelled 属性置为 true。
  + 你的 operation 还在队列中等待被执行，这种情况下你的 operation 就不会被执行。

4. `NSOperation` 有3个有用的布尔型属性：`finished`，`cancelled` 和 `ready`。`finished` 在 operation 执行完毕后被置为 true。`cancelled` 在 operation 被取消后被置为 true。`ready` 在 operation 即将被执行时被置为 true。

5. 所有的 `NSOperation` 在任务被完成后都可以选择去设置一段 completion block。`NSOperation` 的 `finished` 属性变为 true 后这段 block 就会被执行。

现在来重写一下我们的示例项目，这次使用 NSOperationQueues。首先在 ViewController 类中声明如下变量：

```swift
var queue = NSOperationQueue()
```
然后将 didClickOnStart 方法中的代码替换成下面的，再看看在 NSOperationQueue 中怎样去执行 operation：

```swift
@IBAction func didClickOnStart(sender: AnyObject) {
    queue = NSOperationQueue()
 
    queue.addOperationWithBlock { () -> Void in
        
        let img1 = Downloader.downloadImageWithURL(imageURLs[0])
 
        NSOperationQueue.mainQueue().addOperationWithBlock({
            self.imageView1.image = img1
        })
    }
    
    queue.addOperationWithBlock { () -> Void in
        let img2 = Downloader.downloadImageWithURL(imageURLs[1])
        
        NSOperationQueue.mainQueue().addOperationWithBlock({
            self.imageView2.image = img2
        })
 
    }
    
    queue.addOperationWithBlock { () -> Void in
        let img3 = Downloader.downloadImageWithURL(imageURLs[2])
        
        NSOperationQueue.mainQueue().addOperationWithBlock({
            self.imageView3.image = img3
        })
 
    }
    
    queue.addOperationWithBlock { () -> Void in
        let img4 = Downloader.downloadImageWithURL(imageURLs[3])
        
        NSOperationQueue.mainQueue().addOperationWithBlock({
            self.imageView4.image = img4
        })
 
    }
}
```
如上所见，你使用了 *addOperationWithBlock* 方法来创建一个新的、带有某给定 block（或者它在 Swift 中的名字：闭包）的 operation。很简单，对吧？为在主队列中完成某个任务，与使用 GCD 时调用 dispatch_async() 不同，我们用 NSOperationQueue（NSOperationQueue.mainQueue()）也可以达到相同结果，将你想要在主队列中执行的 operation 提交过去。

可以运行一下这个 App 做个快速测试。如果代码输入正确的话， App 应该能够在后台下载图片，不会阻塞UI。

之前的例子中我们使用了 addOperationWithBlock 方法把 operation 添加到队列中。再让我们来看看如何使用 NSBlockOperation：在达到相同的效果的同时，还会给我们提供更多的功能和选项，比如设置 completion handler。改后的 didClickOnStart 方法如下：

```swift
@IBAction func didClickOnStart(sender: AnyObject) {
    
    queue = NSOperationQueue()
    let operation1 = NSBlockOperation(block: {
        let img1 = Downloader.downloadImageWithURL(imageURLs[0])
        NSOperationQueue.mainQueue().addOperationWithBlock({
            self.imageView1.image = img1
        })
    })
    
    operation1.completionBlock = {
        print("Operation 1 completed")
    }
    queue.addOperation(operation1)
    
    let operation2 = NSBlockOperation(block: {
        let img2 = Downloader.downloadImageWithURL(imageURLs[1])
        NSOperationQueue.mainQueue().addOperationWithBlock({
            self.imageView2.image = img2
        })
    })
    
    operation2.completionBlock = {
        print("Operation 2 completed")
    }
    queue.addOperation(operation2)
    
    
    let operation3 = NSBlockOperation(block: {
        let img3 = Downloader.downloadImageWithURL(imageURLs[2])
        NSOperationQueue.mainQueue().addOperationWithBlock({
            self.imageView3.image = img3
        })
    })
    
    operation3.completionBlock = {
        print("Operation 3 completed")
    }
    queue.addOperation(operation3)
    
    let operation4 = NSBlockOperation(block: {
        let img4 = Downloader.downloadImageWithURL(imageURLs[3])
        NSOperationQueue.mainQueue().addOperationWithBlock({
            self.imageView4.image = img4
        })
    })
    
    operation4.completionBlock = {
        print("Operation 4 completed")
    }
    queue.addOperation(operation4)
}
```

对每个 operation，我们都为其创建了一个新的 NSBlockOperation 实例并将任务封装在一个 block 中。而使用了 NSBlockOperation，你还可以设置 completion handler。当 operation 完成后，completion handler 就会被调用。将示例运行一下，就会在控制台看见这样的输出：

```swift
Operation 1 completed
Operation 3 completed
Operation 2 completed
Operation 4 completed
```

### 取消 operation

之前提过，NSBlockOperation 能够让你管理 operation。那么现在来看看如何取消一个 operation。首先给 navigation bar 加一个 bar button item，将其命名为 Cancel。为展示取消 operation，我们在 Operation #2 和 Operation #1 之间添加一个相依性，Operation #3 和 Operation #2 之间添加另一个相依性。也就是说 Operation #2 会在 Operation #1 完成后开始执行，而 Operation #3 会在 Operation #2 完成后执行。Operation #4 并没有相依性，它会被并发执行。要取消 operation 的话，你只需调用 NSOperationQueue 的 cancelAllOperations() 方法。在ViewController 类中插入下面的方法：

```swift
@IBAction func didClickOnCancel(sender: AnyObject) {
        self.queue.cancelAllOperations()
}
```

记住需要把你在 navigation bar 上添加的 Cancel 按钮与 didClickOnCancel 方法关联起来。你可以这么做：返回 Main.storyboard 文件，打开Connections Inspector，这里你会在Received Actions区域中看见unlink didSelectCancel()。点击 + 并将其从空圆圈拖拽到 Cancel bar button 上。然后在 didClickOnStart 方法中添加相依性：

```swift
operation2.addDependency(operation1)
operation3.addDependency(operation2)
```

接下来把 operation #1 的 completion block 改一下，让它在控制台打印出 cancel 的状态：

```swift
operation1.completionBlock = {
    print("Operation 1 completed, cancelled:\(operation1.cancelled) ")
}
```

你可以自己改一下 operation #2，#3 和 #4 的打印语句，这样可以更好的理解这一过程。然后创建并运行项目。你点击了 Start 按钮之后，再按 Cancel 按钮，这就会在 operation #1 执行完毕后取消所有的 operation。下面告诉了我们都发生了些什么：

- 由于 operation #1 已经开始执行，取消对它没有任何效果。这就是为什么 `cancelled` 会被记录成 false，并且 App 还是会显示第一张图片。
- 如果你点击 Cancel 按钮足够快的话，operation #2 会被取消。对 cancelAllOperations() 的调用会停止对该 operation 的执行，所以第二张图片没有被下载。
- operation #3 已经排在队列中，等待 operation #2 的完成。因为 operation #3 是否开始取决于 operation #2 的完成与否，而 operation #2 已经被取消，operation #3 就不会被执行，从队列中被立即踢出了。
- 没有对 operation #4 做任何相依性的设置，所以它被并发的执行了，下载了第四张图片。

![](/img/articles/ios-concurrency-getting-started-with-nsoperation-and-dispatch-queues/12401452214821.7265584)

## 接下来看什么？

本篇教程中我为你讲解了 iOS 中并发的概念，以及你在 iOS 中该如何去使用它。我给了你一个还不错的并发入门简介，解释了 GCD，并示范了怎样去创建串行和并发队列。除此之外，我们还看了一下 NSOperationQueues。你现在应该对 GCD 和 NSOperationQueues 之间的不同有所了解了。

如果想进一步了解 iOS 的并发，建议你去看一下 [Apple 的并发指南](https://developer.apple.com/library/ios/documentation/General/Conceptual/ConcurrencyProgrammingGuide/Introduction/Introduction.html)。

你可以从 [iOS Concurrency repository on Github](https://github.com/appcoda/NSOperation-Demo) 这里找到此教程提到的全套源代码以作参考。

随便问任何问题，我真心喜欢你的评论。