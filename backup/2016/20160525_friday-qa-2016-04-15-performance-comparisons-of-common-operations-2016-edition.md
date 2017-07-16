title: "[2016 版] 常见操作性能对比"
date: 2016-05-25
tags: [Swift 入门]
categories: [Mike Ash]
permalink: friday-qa-2016-04-15-performance-comparisons-of-common-operations-2016-edition
keywords: 性能测试,mac测试,ios测试
custom_title: 
description: 关于代码性能测试你了解多少呢，本文介绍的就是在 Mac 和 iOS 下的性能测试。

---
原文链接=https://www.mikeash.com/pyblog/friday-qa-2016-04-15-performance-comparisons-of-common-operations-2016-edition.html
作者=Mike Ash
原文日期=2016-04-15
译者=Yake
校对=numbbbbb
定稿=shanks

<!--此处开始正文-->

在我开始做 Friday Q&A 之前，我曾发表过一些关于常见操作性能测试的文章，并对结果进行了讨论。最近的一篇是在 2008 年 10 月 5 日，在 10.5 的 Mac 系统和最早的 iPhone 操作系统上。已经好长一段时间没有更新了。

<!--more-->

## 之前的文章

如果你想和之前的文章做对比，可以阅读下述内容：

* [Mac(10.5)](https://www.mikeash.com/pyblog/performance-comparisons-of-common-operations-leopard-edition.html)
* [Mac(10.4)](https://www.mikeash.com/pyblog/performance-comparisons-of-common-operations.html)
* [iPhone OS 1](https://www.mikeash.com/pyblog/performance-comparisons-of-common-operations-iphone-edition.html)

（注意苹果的手机操作系统直到 2010 年才被称为`iOS`）

## 概述

性能测试可能会很危险。测试报告看起来通常很不自然，除非你有特定的可以模仿真实应用场景的应用。这些特殊的测试肯定不真实，并且测试结果可能无法真实地反应项目的实际性能。虽然不能对所有的事都给出确切的结果，但它能让你了解大概的数量级。

测量高速操作是很难的一件事，比如 `Objective-C` 的消息发送或者是数学运算。由于现在 CPU 有复杂的设置与并行机制，一个操作独立花费的时间可能与它在复杂的真实项目中花费的时间并不相符。如果操作足够独立，将这类操作的代码添加到代码中时，CPU 可以并行处理，那可能根本不会增加那个操作本身执行需要的时间。另一方面，如果它占用了重要资源，就可能会让运行时间大大增加。
 
性能也可能依赖于一些外部因素。许多现代 CPU 在低温环境下运行很快，但是变热后就会慢下来。文件系统的性能将会依赖于硬件以及文件系统的状态。即使是相关的性能也会有所不同。

当性能特别重要时，你总是希望能测量并做图表分析，以便确切地知道在你的代码中哪里花费了时间，这样就直到应该把注意力集中在哪里。如果能找到代码中降低性能的地方，你一定会很开心。

总之，对各种操作的速度有个大致的概念将会十分有用。也许这能避免你在文件系统中存一大堆数据。为之付出一些努力是值得的，不过最终可能只是少发了一条消息，这么算又不太值。总之，谁也说不准结果如何。

## 方法

你可以在`GitHub`中获取这些测试的[代码](https://github.com/mikeash/PerformanceTest
)。

代码是用`Objective-C++`写的，核心的性能测试是用 C 语言写的。目前我对 Swift 的了解还不够深入，因此无法测试 Swift 的性能。

基础的技术很简单：把目标操作放入一个循环中持续几秒钟。用总的运行时间除以循环次数得到操作每次执行的时间。循环时间是硬编码的，我会尽量延长测试时间，从而减少环境因素的影响。

我试图将循环本身的开支考虑在内。这种开支对于较慢操作的影响完全不重要，但是对于较快操作的影响却相当大。因此，我会对一个空的循环进行计时，然后从其他测试的时间中减去每次循环的时间。

在有些测试中，测试代码可能会被流水线机制（校对注：CPU 的一种优化机制）优化，从而和被测试的代码并行。这使得那些测试时间惊人地短，从而导致完全错误的结果。考虑到这些因素，一些高速操作会被手动展开，每次循环会执行十次测试，我希望通过这种方式让结果变得更真实。

测试的编译与运行没有经过优化。这与我们通常的做法相反，但是我觉得对测试来说这样做更好。对于那些几乎完全依赖于外部代码的操作，例如与文件相关的操作或者 JSON 解析，结果没什么变化。但对于简单的操作例如数学计算或者方法调用，编译器很可能会直接把毫无意义的测试代码优化掉。此外，优化也会改变循环的编译方式，这会使得计算循环本身执行时间变得很复杂。

 Mac 测试用的是我的 2013 年的 Mac Pro：3.5GHz，Xeon E5 处理器，系统是 10.11.4。`iOS` 测试用的是我的 iPhone 6s ，系统是`iOS` 9.3.1.

## Mac 测试

下面是 Mac 测试的数据。每一个测试都会列出测试内容、测试循环次数、测试需要的总时间以及每一次操作花费的时间。所有的时间都减掉了循环本身的消耗。

```
Name	Iterations	Total time (sec)	Time per (ns)
16 byte memcpy	1000000000	0.7	0.7
C++ virtual method call	1000000000	1.5	1.5
IMP-cached message send	1000000000	1.6	1.6
Objective-C message send	1000000000	2.6	2.6
Floating-point division with integer conversion	1000000000	3.7	3.7
Floating-point division	1000000000	3.7	3.7
Integer division	1000000000	6.2	6.2
ObjC retain and release	100000000	2.3	23.2
Autorelease pool push/pop	100000000	2.5	25.2
Dispatch_sync	100000000	2.9	29.0
16-byte malloc/free	100000000	5.5	55.4
Object creation	10000000	1.0	101.0
NSInvocation message send	10000000	1.7	174.3
16MB malloc/free	10000000	3.2	317.1
Dispatch queue create/destroy	10000000	4.1	411.2
Simple JSON encode	1000000	1.4	1421.0
Simple JSON decode	1000000	2.7	2659.5
Simple binary plist decode	1000000	2.7	2666.1
NSView create/destroy	1000000	3.3	3272.1
Simple XML plist decode	1000000	5.5	5481.6
Read 16 byte file	1000000	6.4	6449.0
Simple binary plist encode	1000000	8.8	8813.2
Dispatch_async and wait	1000000	9.3	9343.5
Simple XML plist encode	1000000	9.5	9480.9
Zero-zecond delayed perform	100000	2.0	19615.0
pthread create/join	100000	2.8	27755.3
1MB memcpy	100000	5.6	56310.6
Write 16 byte file	10000	1.7	165444.3
Write 16 byte file (atomic)	10000	2.4	237907.9
Read 16MB file	1000	3.4	3355650.0
NSWindow create/destroy	1000	10.6	10590507.9
NSTask process spawn	100	6.7	66679149.2
Write 16MB file (atomic)	30	2.8	94322686.1
Write 16MB file	30	3.1	104137671.1
```

这个表中最突出的是第一条。`16-byte memcpy`测试每次用时不到一纳秒。请看生成代码，虽然我们关闭了优化，但是编译器很聪明地将`memcpy`调用转换成了一系列的`mov`指令。这点很有趣：你写的方法调用不一定真的会调用这个方法。

一个真正的 C++ 方法调用和拥有`IMP`缓存的`ObjC`消息发送消耗相同的时间。它们真正做的操作一模一样：一个通过函数指针实现的非直接方法调用。

一个普通的`Objective-C`消息发送，和我们想的一样，相对较慢。然而，`objc-msgSend`的速度依然震惊到我了。它先是执行了一个完整的哈希表查询，然后又间接跳向了结果，一共只花了 2.6 纳秒！这差不多是 9 个 CPU 周期。同样的操作在 10.5 系统中需要超过 12 个周期，这么看性能确实有不小的提升。如果你只是做`Objective-C`的消息发送操作，这台电脑每秒钟可以执行四亿次。

使用`NSInvocation`来调用方法相对较慢。`NSInvacation`需要在运行时创建消息，和编译器在编译时做的事一样。幸运的是，`NSInvocation`在实际项目中一般不会成为性能瓶颈。不过和 10.5 对比，它的速度有所下降，一个`NSInvocation`调用大约花了之前两倍的时间，即使这次测试是在更快的硬件环境下进行的。

一对`retain`和`release`操作一共消耗 23 纳秒。修改一个对象的引用计数必须是线程安全的，必须使用原子操作，这在纳秒级 CPU 中代价很高。

`autoreleasepool`比之前快了很多。在之前的测试中，创建并销毁一个自动释放池花费了超过 300 纳秒的时间。这次测试中，只用了 25 纳秒，自动释放池的实现已经完全改写了，新的实现快的多，所以这没什么好惊讶的。释放池曾经是`NSAutoReleasePool`类型的实例，但现在使用运行时方法来完成，只需要做一些指针操作。25 纳秒，你可以放心地把`@autoreleasepool`放在任何需要自动释放的地方。

分配和释放 16 字节花费的时间没有多大变化，但是较大空间的分配速度显著提升。过去分类和释放 16MB 大约需要 4.5 微秒的时间，但现在只需要 300 纳秒。一般应用都会做很多的内存分配工作，所以这是个很大的提升。

`Objective-C`对象的创建速度也提升了很多，从过去的 300 纳秒到现在的 100 纳秒。显然，一个典型的应用会创建并销毁*很多* Objective-C 对象，所以这个提升效果显著。另一方面，创建并销毁一个对象的时间，相当于发送 40 个消息，所以这还是一个代价很高的操作。另外，大多数对象创建和销毁需要的时间都远大于一个简单的`NSObject`实例。

`dispatch_queue`的测试在不同的操作中表现出了有趣的差异。`dispatch_sync`在一个非竞争队列中特别快，时间在 30 纳秒以下。GCD 很高效，在本例中不做任何跨线程的调用，所以一共只需要执行一次加锁和释放操作。`dispatch_async`花费的时间就长得多，它需要先找到一条工作线程来使用，唤醒线程，然后在线程中执行任务。和 Objective-C 对象相比，创建并销毁一个`diapatch_queue`对象要快很多。GCD 能够共享很多内容，所以创建队列成本很低。

我这次增加了`JSON`以及`plist`的编码和解码测试，这个测试之前没有做过。由于 iPhone 的普及，这类操作受到越来越多的关注。这个测试编码并解码了一个包含三个元素的字典。正如预期的那样，它比消息发送这种简单并且低级的事务要慢，但仍在微妙的范围内。有趣的是，`JSON`比属性列表表现更好，哪怕是二进制的属性列表也比`JSON`慢，出乎意料。这可能是因为`JSON`用途更广，因此获得更多关注；也可能是因为`JSON`格式解析起来更快；或者是因为用一个只包含三个元素的字典测试不太合适，数据量更大时它们之间的速度差别可能会改变。

同步任务所需时间很多，大概是`dispatch_async`时间的两倍。看起来，运行时循环还有很多有待提升的地方。

创建一个`pthread`并等它终止，是另外一个相对较为重量级的操作，时间大概在将近 30 纳秒。因此我们理解了为什么`GCD`只使用一个线程池，并且只在必要时才创建新的线程。然而，这个测试已经比过去的测试快多了，同样的测试，过去需要花超过 100 微秒的时间。

创建一个`NSView`实例很快，大约 3 微秒。不同的是，创建一个`NSWindow`就慢得多，耗费大约 10 微秒时间。`NSView`是较为轻量的一种结构，它代表了界面中的一片区域， 而`NSWindow`则代表了窗口服务器中的一块像素缓存。创建一个`NSWindow`类型的对象需要让窗口服务创建必要的结构，还需要很多设置工作，给`NSWindow`类型的对象添加所需的各种内部对象，例如标题栏上的视图。这样说来，相比`NSWindow`，我更推荐使用`NSView`。

文件存取肯定很慢。`SSD`已经提升了很多性能，但还是有很多的耗时的操作。所以只在必要的时候存取文件，能不用就别用。

## iOS 测试

下面是 iOS 的测试结果

```
Name	Iterations	Total time (sec)	Time per (ns)
C++ virtual method call	1000000000	0.8	0.8
IMP-cached message send	1000000000	1.2	1.2
Floating-point division with integer conversion	1000000000	1.5	1.5
Integer division	1000000000	2.1	2.1
Objective-C message send	1000000000	2.7	2.7
Floating-point division	1000000000	3.5	3.5
16 byte memcpy	1000000000	5.3	5.3
Autorelease pool push/pop	100000000	1.5	14.7
ObjC retain and release	100000000	3.7	36.9
Dispatch_sync	100000000	7.9	79.0
16-byte malloc/free	100000000	8.6	86.2
Object creation	10000000	1.2	119.8
NSInvocation message send	10000000	2.7	268.3
Dispatch queue create/destroy	10000000	6.4	636.0
Simple JSON encode	1000000	1.5	1464.5
16MB malloc/free	10000000	15.2	1524.7
Simple binary plist decode	1000000	2.4	2430.0
Simple JSON decode	1000000	2.5	2515.9
UIView create/destroy	1000000	3.8	3800.7
Simple XML plist decode	1000000	5.5	5519.2
Simple binary plist encode	1000000	7.6	7617.7
Simple XML plist encode	1000000	10.5	10457.4
Dispatch_async and wait	1000000	18.1	18096.2
Zero-zecond delayed perform	100000	2.4	24229.2
Read 16 byte file	1000000	27.2	27156.1
pthread create/join	100000	3.7	37232.0
1MB memcpy	100000	11.7	116557.3
Write 16 byte file	10000	20.2	2022447.6
Write 16 byte file (atomic)	10000	30.6	3055743.8
Read 16MB file	1000	6.2	6169527.5
Write 16MB file (atomic)	30	1.6	52226907.3
Write 16MB file	30	2.3	78285962.9
```

最明显的是，它和 Mac 测试的结果很相似。看看过去的测试结果，iPhone 上的结果都相对较慢。一个 Objective-C 消息发送在 Mac 大约为 4.9 纳秒，在 iPhone 上要花很长时间，约为 200 纳秒。一个 C++ 的虚函数调用在 Mac 上花费大约 1 纳秒的时间，iphone上需要 80 纳秒。malloc/free 一段小的内存在 Mac 上约为 50 纳秒，但是在 iPhone 上需要大约 2 微秒的时间。

对比新旧测试，在如今的移动设备时代，很多事情都发生了变化。大多数情况下 iPhone 的数据只比 Mac 差一点，有些操作甚至更快。例如，自动释放池在 iPhone 上是相当快的。我猜`ARM64`更擅长执行自动释放池的代码。

读写小文件是 iPhone 的一大弱点。16MB 的文件测试与 Mac 的测试结果差不多，但是 16 字节的文件测试 iPhone 花了 Mac 10 倍的时间。相比 Mac，iPhone 的存储设备吞吐量很高，但是有一些额外的延迟。

## 结论

关注性能可以让你写出高质量的代码，不过你只需要记住项目中常见操作的大致性能。性能会随着软件和硬件的提升发生变化。在过去的几年中 Mac 已经有了不错的提升，不过 iPhone 的进步更大。只用了 8 年时间，iPhone 就从比 Mac 慢一百倍进化到了同等性能。

今天就到此为止吧，下次再来讨论一些更有趣的东西。Friday Q&A 是由读者的建议驱动的，所以如果你想在某次的讨论中看到某个主题，请把它发送到[这里](mike@mikeash.com)