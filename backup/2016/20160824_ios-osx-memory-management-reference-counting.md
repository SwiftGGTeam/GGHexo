title: "iOS 与 OSX 内存管理：引用计数"
date: 2016-08-24
tags: [iOS 开发]
categories: [medium.com]
permalink: ios-osx-memory-management-reference-counting
keywords: ios引用计数,ios内存管理,os x 内存管理
custom_title: 
description: iOS 和 OSX 的内存管理都采用了引用计数机制，那么具体是怎么实现的呢，本文就来研究一番吧。

---
原文链接=https://medium.com/swift-programming/ios-osx-memory-management-reference-counting-7bf60c3fbb8a#.6q2r41nkv
作者=Andyy Hope
原文日期=2016-02-23
译者=wiilen
校对=小锅
定稿=CMB

<!--此处开始正文-->

在 2009 年，我第一次下定决心要学习如何开发 App。那时候 iOS 3 才刚刚发布，之后，App Store 就成了那些开发 to-do 列表、笔记记录以及其它无聊应用的开发者们的金矿。

Objective-C 是我决定要全身心投入学习的第一门面向对象的语言，那时候这门语言与现在有很多区别。过去几年我们见证了它的发展，与此同时苹果还发布了令人印象深刻的 Swift 语言。

如今开发者们认为 ARC（自动引用计数）是理所应当的存在，特别是那些在 iOS 5 发布（2011年）之后学习 Objective-C 的人，或是学习 Swift 的人。

<!--more-->

## 什么是引用计数？

引用计数是计算机科学中的一种技术，通过这种技术，每个对象在实例化时都被分配了一个计数值，因此应用程序可以知道哪些对象仍在使用。在对象的生命周期中，其它对象如果需要使用该对象，就声明对该它的所有权，然后增加计数值；当该对象完成了任务之后释放（release）所有权，然后减少计数值。一个对象的计数值减为 0 时，就会从内存中销毁（deallocate）。举个例子：

```objc
- (void)demonstration {
    MyClass *foo = [[MyClass alloc] init];
    [foo performSomeMethod];
    [foo release];
}
```

在上面的代码中，我们做了三件事：初始化一个对象，调用它的某个方法，最后释放它。在 iOS 5 发布之前，开发者们在开发应用时都需要这么做。这种内存管理的方式被称为手动引用计数，即 MRC（Manual Reference Counting） 或 MRM（Manual Reference Management）。

在看了上面的代码之后，你的第一印象可能觉得这么做并没有什么大不了，因为它很简单。然而当代码量持续增加，并且更多开发者参与到项目中时，开发者更有可能在这里出错。

## 手动引用计数

所以 MRC 中具体包含了哪些内容呢？

### alloc

```objc
MyClass *foo = [[MyClass alloc] init];
```

这段代码是 Objective-C 中最最基础的。要创建一个对象，首先需要初始化它。当调用 `alloc` 来创建一个对象时，系统会为该对象分配内存空间，并将它的引用计数设为 1。

### release

```objective-c
[foo release];
```

对象调用 `release` 会使它的引用计数减 1。当对象的引用计数减为 0 时，系统会将该对象从内存移除，并释放内存空间以供其它对象使用。

### retain

```objc
[foo retain];
```

对象调用 `retain` 时，会通知系统为它的引用计数加 1。调用 `retain` 意味着其它对象想要持有 `foo`。

我们假设两个不同的对象都持有 `foo`，当第一个对象对 `foo` 调用 `release` 时，`foo` 的引用计数会从 2 减为 1。第二个对象仍然可以使用 `foo`，而无需担心 carsh 或产生一个悬空指针。

### copy 

```objc
MyClass *bar = [foo copy];
```

`copy` 与 `retain` 的原理很相似，它可以复制一份原来的对象，不同之处在于引用计数。如果复制 `foo` 时它的引用计数为 4，复制得到的对象 `bar` 的引用计数只会为 1。

### autorelease

```objc
[foo autorelease];
```

当一个对象的作用域超出了它所声明的范围，就需要对其调用 `autorelease`。它会告诉系统，我们并不希望立即销毁这个对象，而是在 `autoreleasepool` 被清空的时候再去销毁这个对象。

`autorelase` 通常当我们在一个方法内部声明一个对象并将其返回给其调用者时使用。另一个情景是对象在 for 循环中实例化，并且该循环中有一个 `autoreleasepool` 时，也可以使用 `autorelease`。

```objc
- (MyClass *)foo {
    MyClass *foo = [[MyClass alloc] init];
    [foo autorelease];
}
```

### autoreleasepool

```objc
- (void)example {
    for (int i = 0, i < 10, i++) {
        @autoreleasepool {
            MyClass *foo = [[MyClass alloc] init];
            [foo autorelease];
        }
    }
}
```

上面的代码中，我们实例化了 `foo` 对象，并对其调用了 `autorelease`。这些操作被包裹在 `autoreleasepool` 中，外层还有一个 for 循环。

这么做的好处在于，for 循环中实例化的所有对象，可以在每一轮循环结束时自动被释放。当这一切发生时 `autoreleasepool` 会自己进行销毁，并释放所有对象，恢复到原来干净整洁的状态。

### dealloc

```objc
- (void)dealloc {
    [foo release];
    [bar release];
    [fubar release];
    [super dealloc];
}
```

`dealloc` 是所有继承自 `NSObject` 的对象最后会调用的方法。你可以把 `dealloc` 想象成清理那些引用计数大于 0 的遗留对象的地方。

## 手动引用计数的缺点

现在你应该能更好的理解手动管理引用计数所需要做的工作。下面介绍两个常见场景，关于微小的人为失误可能导致运行时 crash 的情况。

### 悬空指针

```objc
MyClass *foo = [[MyClass alloc] init];
[foo release];
[foo doSomething];
```

之前提到过，如果对象的引用计数减为 0，系统会将该对象从内存移除。该地址的内存空间清空之后，可能保留着仍为空的状态，也可能有其它对象占据了这块空间。

但是要记住一点， `foo` 指针仍然指向这块内存。所以当 `doSomething` 方法被调用时，实际上会让 nil 或其它占据这块内存的对象去调用这个方法，这样做常常会引起 crash。

### 内存泄漏

```objc
MyClass *foo = [[MyClass alloc] init];
[foo retain];
[foo retain];
[foo release];
```

这有点像悬空指针的反面情况，当对象调用 `release` 的次数少于调用 `retain` 的次数时，就会发生内存泄漏。如果对象的引用计数一直不减为 0，系统就无法把该对象的资源分配给其它对象。

你的应用中有些对象永远没有被释放，看上去好像没有多大的问题，不过如果这样的对象太多，就会导致应用的内存被耗光，产生一些奇怪的问题，并最终导致 crash。这也是我们在 `dealloc` 中执行清空操作的原因。

## 关于自动引用计数

### Session 323 － iOS，OS X

2011 年，旧金山六月的一个令人愉快的早晨，大家在 Hall－H 参加了每年一度的 WWDC。Phil Schiller 展示了新的 Mail app，Scott Forstall 展示了 Game Center 的漂亮 UI，不幸的是那也是 Steve Jobs 的最后一场 keynote😔。那场 Keynote 中展示了大量新内容，但没有 ARC 这个对开发者而言的大惊喜。这周晚些时候，开发者们也参加了关于 iOS 与 OS X 的 Session 323，他们的生活从此发生了巨大的变化。

### 自动化的魔法

直到今天，所有 iOS 与 OS X 应用仍然使用引用计数，唯一不同在于我们不再需要进行手动管理，因为编译器都帮我们做好了。

这里严肃声明一点，所有我之前提到的语句，编译器在编译时会帮我们自动插入，包括 `retain`、`release`、`copy`、`autorelease`、`autoreleasepool`。如果你回去看看我提供的演示代码，想象上面五种调用都被注释了，简而言之 ARC 都帮我们处理好了。继续前进吧，初学者们，自由地写 app，不用再担心内存管理！除了循环引用之外你不需要再担心什么，不过那是下一节的内容了。

---

我已经在 [GitHub](https://github.com/andyyhope/MemoryManagement) 中上传了一些样例，你可以下载看看其中内存管理的语法。这只是一个简单的 OS X 控制台程序，其中 ARC 已经关闭了。示例函数的调用已经都被注释了，如果你想要看看它们的运行效果，只需要取消注释，编译并运行。尽情体验吧！