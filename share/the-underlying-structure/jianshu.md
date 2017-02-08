底层结构"

> 作者：Soroush Khanlou，[原文链接](http://khanlou.com/2017/01/the-underlying-structure/)，原文日期：2017-01-12
> 译者：[Cwift](http://weibo.com/277195544)；校对：[walkingway](http://chengway.in/)；定稿：[CMB](https://github.com/chenmingbiao)
  









我经常观察一个类型的实例变量，这样我就可以更深入地理解这个类型设计的初衷。一旦你知晓该类型的底层结构，它的用法也就随之浮出水面了。反之亦然：如果你没看过一个对象内部成员的布局情况，那么不可能准确把握该对象的功能。这种情况对于苹果的闭源类型尤其明显。



一个很好的例子是 `NSDate` 类型。当我开始编程时，就试着去了解如何使用 `NSDate` 以及它所有的兄弟对象，比如 `NSDateComponents`、`NSDateFormatter` 以及 `NSCalendar`，那真是一段艰难的岁月。为什么你需要使用 `NSCalendar` 在原本的日期上增加两天？这些类之间的边界划分让人捉摸不定，这使得当你想要寻找某些特定的功能时，无法准确定位到某个具体的对象中。

对我来说，关键的启示是理解 `NSDate` 在底层的真实面目，是什么原因使得部分功能散落到其他类中。`NSDate` 只是一个花哨的包装器。仅此而已，文档也揭示了这一事实：

> `NSDate` 对象封装了单个的时间点，独立于任何特定的日历系统或者时区。

所有的 `NSDate` 都存储了一个浮点数，这个浮点数代表了从 2001 年 1 月 1 日 00:00:00 UTC 起的秒数。这些秒数与时区、星期几、月份、夏令时、闰秒或者闰年一点关系都没有。如果所需的计算基于秒数就可以完成，那么它会在 `NSDate` 上进行。否则，就要借助其他的类型了。

列举一下单纯依靠这个浮点数能做的操作：比较（`earlierDate`，`laterDate`）、判断相等以及计算时间间隔（依旧返回一个浮点数）。`distantFuture` 和 `distantPast` 也是显而易见的，它们是以面向未来和过去两个维度来计算出期望的时间（浮点数表示）。

对于其他功能，你必须使用其他的类和对象。例如，要及时地向一个时刻中增加一天的时间，可以选择向一个 `NSDate` 中增加 `24*60*60` 秒的方式，不过最好的方式是通过 `NSCalendar` 来操作，避免遇到夏令时间、闰秒/天的问题 ，以及其他可能随时间出现的非标准问题。[这篇博客](http://atomicbird.com/blog/date-math-is-hard-lets-do-it-tomorrow)介绍了使用 `NSCalendar` 进行这些计算的情况。

因为 `NSDate` 不存储日期中与我们所期望的月份相关的任何信息，如果要更改该月份，则必须使用一个了解情况并且能够把日期拆分成各个“组件”的对象。为此，我们要用到 `NSDateComponents`，看看你能否弄懂它内部存储数据的方式。

当我在编写[我自己的 Promise 库](https://github.com/khanlou/Promise/)时，发现了另一个有趣的例子，通过研究一个对象存储属性的布局来了解该对象的性质。如果查看每个 Promise 对象的存储属性，你会看到三样东西：

    
    public final class Promise<Value> {
        
        private var state: State<Value>
        private let lockQueue = DispatchQueue(label: "promise_lock_queue", qos: .userInitiated)
        private var callbacks: [Callback<Value>] = []

每个 promise 都有它的当前状态（如 `.pending`，`.fulfilled` 或者 `.rejected`），一个确保线程安全的队列，以及当 promise 完成时或者被拒绝时调用的回调数组。

当我写完这个库时，看了一些 `Signal`/`Observable` 的实现，看看能否理解它们。我发现 [JensRavens/Interstellar](https://github.com/JensRavens/Interstellar) 的实现是最直接的。我查看了这个库中每个 `Signal` 对象的实例属性，发现了一个非常相似的结构：

    
    public final class Signal<T> {
        
        private var value: Result<T>?
        private var callbacks: [Result<T> -> Void] = []
        private let mutex = Mutex()

它包含了存储当前状态的部分，存储回调的部分以及存储线程安全原语的部分。顺序有些不同，他们使用了互斥体而不是队列，但原理是相同的。这两种类型之间的唯一区别是语义上的：promises 可以在完成时清除它们的回调（释放自己以及捕获的变量），而 signals 必须保持它们的回调。

我认为这个原则也可以帮助设计自己的类型。看看你正在处理的对象的属性。每一个属性都有目的性吗？它是否对该对象的整体特性有帮助？是否有些属性在该对象的一些实例中能够用到，而在另一些实例中用不到？如果是的话，这些属性可能属于其他对象。确保类型的实例变量被严格控制并且充分利用，确保我们的每一个对象在应用中都有着明确的定位。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。