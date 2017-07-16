title: "Swift 3 中的 GCD 与 Dispatch Queue"
date: 2016-11-30
tags: [Swift 进阶]
categories: [AppCoda]
permalink: grand-central-dispatch
keywords: swift 3 gcd,dispatchqueue swift3
custom_title: 
description: GCD 是一个多核编程的解决方法，基本概念就是 Dispatch Queue，本文就来深入讲解下 Swift 3 中的 GCD 与 Dispatch Queue。

---
原文链接=http://www.appcoda.com/grand-central-dispatch
作者=GABRIEL THEODOROPOULOS
原文日期=2016-11-16
译者=小锅
校对=saitjr
定稿=CMB

<!--此处开始正文-->

自中央处理器（CPU）出现以来，最大的技术进步当属多核处理器，这意味着它可以同时运行多条线程，并且可以在任何时刻处理至少一个任务。

串行执行以及伪多线程都已经成为了历史，如果你经历过老式电脑的时代，又或者你接触过搭载着旧操作系统的旧电脑，你就能轻易明白我的话。但是，不管 CPU 拥有多少个核心，不管它有多么强大，开发者如果不好好利用这些优势 ，那就没有任何意义。这时就需要使用到多线程以及多任务编程了。开发者不仅可以，而且必须要好好利用设备上 CPU 的多线程能力，这就需要开发者将程序分解为多个部分，并让它们在多个线程中并发执行。

并发编程有很多好处，但是最明显的优势包括用更少的时间完成所需的任务，防止界面卡顿，展现更佳的用户体验，等等。想像一下，如果应用需要在主线程下载一堆图片，那种体验有多糟糕，界面会一直卡顿直到所有的下载任务完成；用户是绝对不接受这种应用的。

<!--more-->

在 iOS 当中，苹果提供了两种方式进行多任务编程：*Grand Central Dispatch (GCD)* 和 *NSOperationQueue*。当我们需要把任务分配到不同的线程中，或者是非主队列的其它队列中时，这两种方法都可以很好地满足需求。选择哪一种方法是很主观的行为，但是本教程只关注前一种，即 GCD。不管使用哪一种方法，有一条规则必须要牢记：任何操作都不能堵塞主线程，必须使其用于界面响应以及用户交互。所有的耗时操作或者对 CPU 需求大的任务都要在*并发*或者*后台*队列中执行。对于新手来说，理解和实践可能都会比较难，这也正是这篇文章的意义所在。

GCD 是在 iOS 4 中推出的，它为并发、性能以及并行任务提供了很大的灵活性和选择性。但是在 Swift 3 之前，它有一个很大的劣势：由于它的编程风格很接近底层的 C，与 Swift 的编程风格差别很大， API 很难记，即使是在 Objective-C 当中使用也很不方便。这就是很多开发都避免使用 GCD 而选择 NSOperationQueue 的主要原因。简单地百度一下，你就能了解 GCD 曾经的语法是怎么样的。

Swift 3 中，这些都有了很大的变化。Swift 3 采用了全新的 Swift 语法风格改写了 GCD，这让开发都可以很轻松地上手。而这些变化让我有了动力来写这篇文章，这里主要介绍了 Swift 3 当中 GCD 最基础也最重要的知识。如果你曾经使用过旧语法风格的 GCD（即使只用过一点），那么这里介绍的新风格对你来说就是小菜一碟；如果你之前没有使用过 GCD，那你就即将开启一段编程的新篇章。

在正式开始讨论今天的主题前，我们需要先了解一些更具体的概念。首先，GCD 中的核心词是 dispatch queue。一个队列实际上就是一系列的代码块，这些代码可以在主线程或后台线程中以同步或者异步的方式执行。一旦队列创建完成，操作系统就接管了这个队列，并将其分配到任意一个核心中进行处理。不管有多少个队列，它们都能被系统正确地管理，这些都不需要开发者进行手动管理。队列遵循 FIFO 模式（先进先出），这意味着先进队列的任务会先被执行（想像在柜台前排队的队伍，排在第一个的会首先被服务，排在最后的就会最后被服务）。我们会在后面的第一个例子中更清楚地理解这个概念。

接下来，另一个重要的概念就是 WorkItem（任务项）。一个任务项就是一个代码块，它可以随同队列的创建一起被创建，也可以被封装起来，然后在之后的代码中进行复用。正如你所想，任务项的代码就是 dispatch queue 将会执行的代码。队列中的任务项也是遵循 FIFO 模式。这些执行可以是同步的，也可以是异步的。对于同步的情况下，应用会一直堵塞当前线程，直到这段代码执行完成。而当异步执行的时候，应用先执行任务项，不等待执行结束，立即返回。我们会在后面的实例里看到它们的区别。

了解完这两个概念（队列和任务项）之后，我们需要知道一个队列可以是串行或并行的。在串行队列中，一个任务项只有在前一个任务项完成后才能执行（除非它是第一个任务项），而在并行队列中，所有的任务项都可以并行执行。

在为主队列添加任务时，无论何时都要加倍小心。这个队列要随时用于界面响应以及用户交互。并且记住一点，所有与用户界面相关的更新都必须在主线程执行。如果你尝试在后台线程更新 UI，系统并不保证这个更新何时会发生，大多数情况下，这会都用户带来不好的体验。但是，所有发生在界面更新前的任务都可以在后台线程执行。举例来说，我们可以在从队列，或者后台队列中下载图片数据，然后在主线程中更新对应的 image view。

我们不一定需要每次都创建自己的队列。系统维护的全局队列可以用来执行任何我们想执行的任务。至于队列在哪一个线程运行，iOS 维护了一个线程池，即一系列除主线程之外的线程，系统会从中挑选一至多条线程来使用（取决于你所创建的队列的数据，以及队列创建的方式）。哪一条线程会被使用，对于开发者来说是未知的，而是由系统根据当前的并发任务，处理器的负载等情况来进行“决定”。讲真，除了系统，谁又想去处理上述的这些工作呢。

## 我们的测试环境

在本文中，接下来我们会使用几个小的，具体的示例来介绍 GCD 的概念。正常情况下，我们使用 Playground 来演示就可以了，并不需要创建一个 demo 应用，但是我们没办法使用 Playground 来演示 GCD 的示例。因为在 Playground 当中无法使用不同的线程来调用函数，尽管我们的一些示例是可以在上面运行的，但并不是全部。因此，我们使用一个正常的工程来进行演示，以克服所有可能碰到的潜在问题，你可以[在这里](https://github.com/appcoda/GCDSamples/raw/master/Starter_Project.zip)下载项目并打开。

这个工程几乎是空的，除了下述额外的两点：

1. 在 `ViewController.swift` 文件中，我们可以看到一系列未实现的方法。每一个方法中，我们都将演示一个 GCD 的特性，你要做的事情就是在在 `viewDidAppear(_:)` 中去除相应方法调用的注释，让对应的方法被调用 。
2. 在 `Main.storyboard` 中，`ViewController` 控制器添加了一个 `imageView`，并且它的 IBOutlet 属性已经被正确地连接到 `ViewController` 类当中。稍后我们将会使用这个 `imageView` 来演示一个真实的案例。

现在让我们开始吧。

## 认识 Dispatch Queue

在 Swift 3 当中，创建一个 dispatch queue 的最简单方式如下：

```swift
let queue = DispatchQueue(label: "com.appcoda.myqueue")
```

你唯一要做的事就是为你的队列提供一个*独一无二*的标签（label）。使用一个反向的 DNS 符号（"com.appcoda.myqueue"）就很好，因为用它很容易创造一个独一无二的标签，甚至连苹果公司都是这样建议的。尽管如此，这并不是强制性的，你可以使用你喜欢的任何字符串，只要这个字符串是唯一的。除此之外，上面的构造方法并不是创建队列的唯一方式。在初始化队列的时候可以提供更多的参数，我们会在后面的篇幅中谈论到它。

一旦队列被创建后，我们就可以使用它来执行代码了，可以使用 `sync` 方法来进行同步执行，或者使用 `async` 方法来进行异步执行。因为我们刚开始，所以先使用代码块（一个闭包）来作为被执行的代码。在后面的篇幅中，我们会初始化并使用 dispatch 任务项（DispatchWorkItem）来取代代码块（需要注意的是，对于队列来说代码块也算是一个任务项）。我们先从同步执行开始，下面要做的就是打印出数字 0~9 ：

![](http://appcoda.com/wp-content/uploads/2016/11/code-snippet-1.png)

*使用红点可以让我们更容易在控制台输出中识别出打印的内容，特别是当我们后面添加更多的队列执行的时候*

将上述代码段复制粘贴到 `ViewController.swift` 文件中的 `simpleQueues()` 方法内。确保这个方法在 `ViewDidAppear(_:)` 里没有被注释掉，然后执行。观察 Xcode 控制台，你会看到输出并没有什么特别的。我们看到控制台输出了一些数字，但是这些数字没有办法帮我们做出关于 GCD 特性的任何结论。接下来，更新 `simpleQueues()` 方法内的代码，在为队列添加闭包的代码后面增加另一段代码。这段代码用于输出数字 100 ~ 109（仅用于区别数字不同）：

```swift
for i in 100..<110 {
    print("Ⓜ️", i)
}
```

上面的这个 for 循环会在主队列运行，而第一个会在后台线程运行。程序的运行会在队列的 block 中止，并且直到队列的任务结束前，它都不会执行主线程，也不会打印数字 100 ~ 109。程序会有这样的行为，是因为我们使用了同步执行。你也可以在控制台中看到输出结果：

![](http://appcoda.com/wp-content/uploads/2016/11/t57_1_sample1_queue_sync.png)

但是如果我们使用 `async` 方法运行代码块会发生什么事呢？在这种情况下，程序不需要等待队列任务完成才往下执行，它会立马返回主线程，然后第二个 for 循环会与队列里的循环同时运行。在我们看到会发生什么事之前，将队列的执行改用 `async` 方法：

![](http://appcoda.com/wp-content/uploads/2016/11/code-snippet-async.png)

现在，执行代码，并查看 Xcode 的控制台：

![](http://appcoda.com/wp-content/uploads/2016/11/t57_2_sample2_queue_async.png)

对比同步执行，这次的结果有趣多了。我们看到主队列中的代码（第二个 for 循环）和 dispatch queue 里面的代码并行运行了。在这里，这个自定义队列在一开始的时候获得了更多的执行时间，但是这只是跟优先级有关（这我们将在文章后面学习到）。这里想要强调的是，当另外一个任务在后台执行的时候，主队列是处于空闲状态的，随时可以执行别的任务，而同步执行的队列是不会出现这种情况的。

尽管上面的示例很简单，但已经清楚地展示了一个程序在同步队列与异步队列中行为的差异。我们将在接下来的示例中继续使用这种彩色的控制台输出，请记住，特定颜色代码特定队列的运行结果，不同的颜色代表不同的队列。

## Quality Of Service（QoS）和优先级

在使用 GCD 与 dispatch queue 时，我们经常需要告诉系统，应用程序中的哪些任务比较重要，需要更高的优先级去执行。当然，由于主队列总是用来处理 UI 以及界面的响应，所以在主线程执行的任务永远都有最高的优先级。不管在哪种情况下，只要告诉系统必要的信息，iOS 就会根据你的需求安排好队列的优先级以及它们所需要的资源（比如说所需的 CPU 执行时间）。虽然所有的任务最终都会完成，但是，重要的区别在于哪些任务更快完成，哪些任务完成得更晚。

用于指定任务重要程度以及优先级的信息，在 GCD 中被称为 Quality of Service（QoS）。事实上，QoS 是有几个特定值的枚举类型，我们可以根据需要的优先级，使用合适的 QoS 值来初始化队列。如果没有指定 QoS，则队列会使用默认优先级进行初始化。要详细了解  QoS 可用的值，可以[参考这个文档](https://developer.apple.com/library/content/documentation/Performance/Conceptual/EnergyGuide-iOS/PrioritizeWorkWithQoS.html)，请确保你仔细看过这个文档。下面的列表总结了 Qos 可用的值，它们也被称为 QoS classes。第一个 class 代码了最高的优先级，最后一个代表了最低的优先级：

* userInteractive
* userInitiated
* default
* utility
* background
* unspecified

现在回到我们的项目中，这次我们要使用 `queueWithQos()` 方法。先声明和初始化下面两个 dispatch queue:

```swift
let queue1 = DispatchQueue(label: "com.appcoda.queue1", qos: DispatchQoS.userInitiated)
let queue2 = DispatchQueue(label: "com.appcoda.queue2", qos: DispatchQoS.userInitiated)
```

注意，这里我们使用了相同的 QoS class，所以这两个队列拥有相同的运行优先级。就像我们之前所做的一样，第一个队列会执行一个循环并打印出 0 ~ 9（加上前面的红点）。第二个队列会执行另一个打印出 100 ~ 109 的循环（使用蓝点）。

![](http://appcoda.com/wp-content/uploads/2016/11/code-snippet-2.png)

看到运行结果，我们可以确认这两个队列确实拥有相同的优先级（相同的 QoS class）—— 不要忘记在 `viewDidAppear(_:)` 中关闭 `queueWithQos()` 方法的注释：

![](http://appcoda.com/wp-content/uploads/2016/11/t57_3_sample3_qos_same.png)

从上面的截图当中可以轻易看出这两个任务被“均匀”地执行，而这也是我们预期的结果。现在让我们把 `queue2` 的 QoS class 设置为 `utility`（低优先级），如下所示：

```swift
let queue2 = DispatchQueue(label: "com.appcoda.queue2", qos: DispatchQoS.utility)
```

现在看看会发生什么：

![](http://appcoda.com/wp-content/uploads/2016/11/t57_4_sample4_qos_utility.png)

毫无疑问地，第一个 dispatch queue（queue1）比第二个执行得更快，因为它的优先级比较高。即使 `queue2` 在第一个队列执行的时候也获得了执行的机会，但由于第一个队列的优先级比较高，所以系统把多数的资源都分配给了它，只有当它结束后，系统才会去关心第二个队列。

现在让我们再做另外一个试验，这次将第一个 queue 的  QoS class 设置为 `background`：

```swift
let queue1 = DispatchQueue(label: "com.appcoda.queue1", qos: DispatchQoS.background)
```

这个优先级几乎是最低的，现在运行代码，看看会发生什么：

![](http://www.appcoda.com/wp-content/uploads/2016/11/t57_5_sample5_qos_background.png)

这次第二个队列完成得比较早，因为 `utility` 的优先级比较 `background` 来得高。

通过上述的例子，我们已经清楚了 QoS 是如何运行的，但是如果我们在同时在主队列执行任务的话会怎么样呢？现在在方法的末尾加入下列的代码：

```swift
for i in 1000..<1010 {
    print("Ⓜ️", i)
}
```

同时，将第一个队列的 QoS class 设置为更高的优先级：

```swift
let queue1 = DispatchQueue(label: "com.appcoda.queue1", qos: DispatchQoS.userInitiated)
```

下面是运行结果：

![](http://appcoda.com/wp-content/uploads/2016/11/t57_6_sample6_qos_mainqueue.png)

我们再次看到了主队列默认拥有更高的优先级，`queue1` 与主列队是并行执行的。而 `queue2` 是最后完成的，并且妆其它两个队列在执行的时候，它没有得到太多执行的机会，因为它的优先级是最低的。

## 并行队列

到目前为止，我们已经看到了 dispatch queue 分别在同步与异步下的运行情况，以及操作系统如何根据 QoS class 来影响队列的优先级的。但是在前面的例子当中，我们都是将队列设置为串行（serial）的。这意味着，如果我们向队列中加入超过一个的任务，这些任务将会被一个接一个地依次执行，而非同时执行。接下来，我们将学习如何使多个任务同时执行，换句话说，我们将学习如何使用并行（concurrent）队列。

在项目中，这次我们会使用 `concurrentQueue()` 方法（请在 `viewDidAppear(_:)` 方法中将对应的代码取消注释）。在这个新方法中，创建如下的新队列：

```swift
let anotherQueue = DispatchQueue(label: "com.appcoda.anotherQueue", qos: .utility)
```

现在，将如下的任务（或者对应的任务项）添加到队列中：

![](http://appcoda.com/wp-content/uploads/2016/11/code-snippet-3.png)

当这段代码执行的时候，这些任务会被以串行的方式执行。这可以在下面的截图上看得很清楚：

![](http://appcoda.com/wp-content/uploads/2016/11/t57_7_sample7_serial_queue.png)

接下来，我们修改下 `anotherQueue` 队列的初始化方式：

```swift
let anotherQueue = DispatchQueue(label: "com.appcoda.anotherQueue", qos: .utility, attributes: .concurrent)
```

在上面的初始化当中，有一个新的参数：`attributes`。当这个参数被指定为 `concurrent` 时，该特定队列中的所有任务都会被同时执行。如果没有指定这个参数，则队列会被设置为串行队列。事实上，QoS 参数也不是必须的，在上面的初始化中，即使我们将这些参数去掉也不会有任何问题。

现在重新运行代码，可以看到任务都被并行地执行了：

![](http://appcoda.com/wp-content/uploads/2016/11/t57_8_sample8_concurrent_queue.png)

注意，改变 QoS class 也会影响程序的运行。但是，只要在初始化队列的时候指定了 `concurrent`，这些任务就会以并行的方式运行，并且它们各自都会拥有运行时间。

这个 `attributes` 参数也可以接受另一个名为 `initiallyInactive`  的值。如果使用这个值，任务不会被自动执行，而是需要开发者手动去触发。我们接下来会进行说明，但是在这之前，需要对代码进行一些改动。首先，声明一个名为 `inactiveQueue` 的成员属性，如下所示：

```swift
var inactiveQueue: DispatchQueue!
```

现在，初始化队列，并将其赋值给 `inactiveQueue`：

```swift
let anotherQueue = DispatchQueue(label: "com.appcoda.anotherQueue", qos: .utility, attributes: .initiallyInactive)
inactiveQueue = anotherQueue
```

使用成员属性是有必要的，因为 `anotherQueue`  是在 `concurrentQueues()` 方法中定义的，只在该方法中可用。当它退出这个方法的时候，应用程序将无法使用这个变量，我们也无法激活这个队列，最重要的是，可能会造成运行时崩溃。

现在重新运行程序，可以看到控制台没有任何的输出，这正是我们预期的。现在可以在 `viewDidAppear(_:)` 方法中添加如下的代码：

```swift
if let queue = inactiveQueue {
    queue.activate()
}
```

`DispatchQueue` 类的 `activate()` 方法会让任务开始执行。注意，这个队列并没有被指定为并行队列，因此它们会以串行的方式执行：

![](http://appcoda.com/wp-content/uploads/2016/11/t57_9_sample9_inactive_serial.png)

现在的问题是，我们如何在指定 `initiallyInactive` 的同时将队列指定为并行队列？其实很简单，我们可以将两个值放入一个数组当中，作为 `attributes` 的参数，替代原本指定的单一数值：

```swift
let anotherQueue = DispatchQueue(label: "com.appcoda.anotherQueue", qos: .userInitiated, attributes: [.concurrent, .initiallyInactive])
```

![](http://www.appcoda.com/wp-content/uploads/2016/11/t57_10_sample10_inactive_concurrent.png)

## 延迟执行

有时候，程序需要对代码块里面的任务项进行延时操作。GCD 允许开发者通过调用一个方法来指定某个任务在延迟特定的时间后再执行。

这次我们将代码写在 `queueWithDelay()` 方法内，这个方法也在初始项目中定义好了。我们会从添加如下代码开始：

```swift
let delayQueue = DispatchQueue(label: "com.appcoda.delayqueue", qos: .userInitiated)

print(Date())

let additionalTime: DispatchTimeInterval = .seconds(2)
```

一开始，我们像通常一样创建了一个 `DispatchQueue`，这个队列会在下一步中被使用到。接着，我们打印了当前时间，之后这个时间将会被用来验证执行任务的延迟时间，最后我们指定了延迟时间。延迟时间通常是一个 `DispatchTimeInterval` 类型的枚举值（在内部它被表示为整型值），这个值会被添加到 `DispatchTime` 中用于指定延迟时间。在这个示例中，设定的等待执行时间是两秒。这里我们使用的是 `seconds` 方法，除此之外，还有以下的方法可以使用：

* microseconds
* milliseconds
* nanoseconds

现在开始使用这个队列：

```swift
delayQueue.asyncAfter(deadline: .now() + additionalTime) {
    print(Date())
}
```

`now()` 方法返回当前的时间，然后我们额外把需要延迟的时间添加进来。现在运行程序，控制台将会打印出如下的输出：

![](http://www.appcoda.com/wp-content/uploads/2016/11/t57_11_sample11_delay-1024x464.png)

的确，dispatch queue 中的任务在两秒后被执行了。除此之外，我们还有别的方法可以用来指定执行时间。如果不想使用任务预定义的方法，你可以直接使用一个 `Double` 类型的值添加到当前时间上：

```swift
delayQueue.asyncAfter(deadline: .now() + 0.75) {
    print(Date())
}
```

在这个情况下，任务会被延迟 0.75 秒后执行。也可以不使用 `now()` 方法，这样一来，我们就必须手动指定一个值作为 `DispatchTime` 的参数。上面演示的只是一个延迟执行的最简单方法，但实际上你也不大需要别的方法了。

## 访问主队列和全局队列

在前面的所有例子当中，我们都手动创建了要使用的 dispatch queue。实际上，我们并不总是需要自己手动创建，特别是当我们不需要改变队列的优先级的时候。就像我在文章一开头讲过的，操作系统会创建一个后台队列的集合，也被称为全局队列（global queue）。你可以像使用自己创建的队列一样来使用它们，只是要注意不能滥用。

访问全局队列十分简单：

```swift
let globalQueue = DispatchQueue.global()
```

可以像我们之前使用过的队列一样来使用它：

![](http://www.appcoda.com/wp-content/uploads/2016/11/code-snippet-4-1024x232.png)

当使用全局队列的时候，并没有太多的属性可供我们进行修改。但是，你仍然可以指定你想要使用队列的 Quality of Service：
```swift
let globalQueue = DispatchQueue.global(qos: .userInitiated)
```
如果没有指定 QoS class（就像本节的第一个示例），就会默认以 `default` 作为默认值。

无论你使不使用全局队列，你都不可避免地要经常访问主队列，大多数情况下是作为更新 UI 而使用。在其它队列中访问主队列的方法也非常简单，就如下面的代码片段所示，并且需要在调用的同时指定同步还是异步执行：

```swift
DispatchQueue.main.async {
    // Do something
}
```

事实上，你可以输入 `DispatchQueue.main.` 来查看主队列的所有可用选项，Xcode 会通过自动补全来显示主队列所有可用的方法，不过上面代码展示的就是我们绝大多数时间会用到的（事实上，这个方法是通用的，对于所有队列，都可以通过输入 . 之后让 Xcode 来进行自动补全）。就像上一节所做的一样，你也可以为代码的执行增加延时。

现在让我们来看一个真实的案例，演示如何通过主队列来更新 UI。在初始工程的 `Main.storyboard` 文件中有一个 `ViewController` 场景（sence），这个 `ViewController` 场景包含了一个 `imageView`，并且这个 imageView 已经通过 `IBOutlet` 连接到对应的 `ViewController` 类文件中。在这里，我们通过 `fetchImage()` 方法（目前是空的）来下载一个 Appcoda 的 logo 并将其展示到 `imageView` 当中。下面的代码完成了上述动作（我不会在这里针对 URLSession 做相关的讨论，以及介绍它如何使用）：

```swift
func fetchImage() {
    let imageURL: URL = URL(string: "http://www.appcoda.com/wp-content/uploads/2015/12/blog-logo-dark-400.png")!

    (URLSession(configuration: URLSessionConfiguration.default)).dataTask(with: imageURL, completionHandler: { (imageData, response, error) in
        if let data = imageData {
            print("Did download image data")
            self.imageView.image = UIImage(data: data)
        }
    }).resume()
}
```

注意，我们并没有在主队列更新 UI 界面，而是试图在 `dataTask(...)` 方法的 completion handler 里运行的后台线程来更新界面。编译、运行程序，看看会发生什么（不要忘记调用 `fetchImage()` 方法）：

![](http://www.appcoda.com.tw/wp-content/uploads/2016/11/t57_12_update_UI_bg.png)

即使我们得到了图片下载完成的信息，但是没有看到图片被显示到 `imageView` 上面，这是因为 UI 并没有更新。大多数情况下，这个图片会在信息出现的一小会后显示出来（但是如果其他任务也在应用程序中执行，上述情况不保证会发生），不仅如此，你还会在控制台看到关于在后台线程更新 UI 的一大串出错信息。

现在，让我们改正这段有问题的行为，使用主队列来更新用户界面。在编辑上述方法的时候，只需要改动底下所示部分，并注意我们是如何使用主队列的：

```swift
if let data = imageData {
    print("Did download image data")

    DispatchQueue.main.async {
        self.imageView.image = UIImage(data: data)
    }
}
```

再次运行程序，会看到图片在下载完成后被正确地显示出来。主队列确实被调用并更新了 UI。

## 使用 DispatchWorkItem 对象

`DispatchWorkItem` 是一个代码块，它可以在任意一个队列上被调用，因此它里面的代码可以在后台运行，也可以在主线程运行。它的使用真的很简单，就是一堆可以直接调用的代码，而不用像之前一样每次都写一个代码块。

下面展示了使用任务项最简单的方法：

```swift
let workItem = DispatchWorkItem {
    // Do something
}
```

现在让我们通过一个小例子来看看 `DispatchWorkItem` 如何使用。前往 `useWorkItem()` 方法，并添加如下代码：

```swift
func useWorkItem() {
    var value = 10

    let workItem = DispatchWorkItem {
        value += 5
    }
}
```

这个任务项的目的是将变量 `value` 的值增加 5。我们使用任务项对象去调用 `perform()` 方法，如下所示：

```swift
workItem.perform()
```

这行代码会在主线程上面调用任务项，但是你也可以使用其它队列来执行它。参考下面的示例：

```swift
let queue = DispatchQueue.global()
queue.async {
    workItem.perform()
}
```

这段代码也可以正常运行。但是，有一个更快地方法可以达到同样的效果。`DispatchQueue` 类为此目的提供了一个便利的方法：

```swift
queue.async(execute: workItem)
```

当一个任务项被调用后，你可以通知主队列（或者任何其它你想要的队列），如下所示：

```swift
workItem.notify(queue: DispatchQueue.main) {
    print("value = ", value)
}
```

上面的代码会在控制台打印出 `value` 变量的值，并且它是在任务项被执行的时候打印的。现在将所有代码放到一起，`userWorkItem()` 方法内的代码如下所示：

```swift
func useWorkItem() {
    var value = 10

    let workItem = DispatchWorkItem {
        value += 5
    }

    workItem.perform()

    let queue = DispatchQueue.global(qos: .utility)

    queue.async(execute: workItem)

    workItem.notify(queue: DispatchQueue.main) {
        print("value = ", value)
    }
}
```

下面是你运行程序后会看到的输出（记得在 `viewDidAppear(_:)` 方法中调用上面的方法）：

![](http://www.appcoda.com/wp-content/uploads/2016/11/t57_13_dispatch_work_item.png)

## 总结

这篇文章中提到的知识足够你应付大多数情况下的多任务和并发编程了。但是，请记住，还有其它我们没有提到的 GCD 概念，或者文章有提到但是没有深入讨论的概念。目的是想让本篇文章对所有层次的开发者都简单易读。如果你之前没有使用过 GCD，请认真考虑并尝试一下，让主队列从繁重的任务中解脱出来。如果有可以在后台线程执行的任务，让将其移到后台运行。在任何情况下，使用 GCD 都不困难，并且它能获得的正面结果就是让应用响应更快。开始享受 GCD 的乐趣吧！

可以在这个 [Github](https://github.com/appcoda/GCDSamples) 里找到本文使用的完整项目。
