title: "Friday Q&A 2015-12-11：Swift 中的弱引用"
date: 2015-12-28
tags: [Mike Ash]
categories: [Swift 进阶]
permalink: friday-qa-2015-12-11-swift-weak-references

---
原文链接=https://www.mikeash.com/pyblog/friday-qa-2015-12-11-swift-weak-references.html
作者=Mike Ash
原文日期=2015-12-11
译者=riven
校对=Cee
定稿=千叶知风

<!--此处开始正文-->

即便你已经在火星的一个洞穴里，紧闭着你的双眼并且捂住你的耳朵，[也避免不了 Swift 已经开源的事实](https://swift.org/)。正因为开源，我们能够更加方便地去探索 Swift 中的很多有趣的特性，其中之一便是 Swift 中弱引用是如何工作的问题。

<!--more-->

### 弱引用

在采用垃圾回收器或者引用计数进行内存管理的语言中，强引用可以使得特定的对象一直存活，但弱引用就无法保证。当一个对象被强引用时，它是不能够被销毁的；但是如果它是个弱引用，就可以。

当我们所提到「弱引用」时，通常的意思是指一个*归零*弱引用（Zeroing Weak Reference）。也就是说，当弱引用的目标对象被销毁时，弱引用就会变成 `nil`（校者注：[看这篇文章了解更多](https://www.mikeash.com/pyblog/friday-qa-2010-07-16-zeroing-weak-references-in-objective-c.html)）。非归零弱引用也是存在的，它会导致一些陷阱（Trap）、崩溃（Crash）或者未定义行为的调用。比如你在 Objective-C 中使用 unsafe_unretained，或者在 Swift 中使用 unowned（Objective-C 未定义行为处理方式，而 Swift 却很可靠地处理这些崩溃）。

归零弱引用很方便使用，在基于引用计数进行内存管理的语言中他们是非常有用的。它们允许循环引用存在却不会产生死循环，并且不需要手动打破逆向引用。他们非常的有用，在苹果引入 ARC 和让弱引用在垃圾收集代码之外的语言层面上可用之前，[我就已经实现了我自己的弱引用版本](https://www.mikeash.com/pyblog/introducing-mazeroingweakref.html)。

### 它是如何工作的呢？

归零弱引用比较典型的实现方式是保持一个对每个对象的所有弱引用列表。当对一个对象创建了弱引用，这个引用就会被添加到这个列表中。当这个引用被重新赋值或者超出了其作用域，它就会从列表中被移除。当一个对象被销毁，这个列表中的所有引用都会被归零。在多线程的情况下，其实现必须是同步获取一个弱引用并销毁一个对象，以避免竞态条件的出现：比如当一个线程释放某个对象的最后一个强引用而同时另一个线程却试图加载一个它的一个弱引用。

在我的实现中，每一个弱引用都是一个完整的对象。弱引用列表是一个弱引用对象的集合。虽然由于额外的转换和内存使用让效率变低了，但这种方式可以很方便的让这些引用变成完整的对象。

苹果公司的 Objective-C 的实现是这样的，每一个弱引用是一个指向目标对象的普通指针。编译器并不直接读写指针，而是使用一些帮助函数。当存储一个弱指针时，存储函数会将指针的位置注册为目标对象的一个弱引用。由于读取函数被集成进了引用计数系统，这就确保了在读取一个弱指针时，不会返回一个已经被释放了的对象的指针。

### 归零操作

让我们创建一些代码来研究一下它们究竟是怎么运行的。

我们希望写一个函数能够 dump 一个对象的内存内容。这个函数接受一块内存区域，将其按指针大小进行分块，并且将最终的结果转换成一个易于查看的十六进制字符串：

```swift
func contents(ptr: UnsafePointer<Void>, _ length: Int) -> String {
    let wordPtr = UnsafePointer<UInt>(ptr)
    let words = length / sizeof(UInt.self)
    let wordChars = sizeof(UInt.self) * 2

    let buffer = UnsafeBufferPointer<UInt>(start: wordPtr, count: words)
    let wordStrings = buffer.map({ word -> String in
        var wordString = String(word, radix: 16)
        while wordString.characters.count < wordChars {
            wordString = "0" + wordString
        }
        return wordString
    })
    return wordStrings.joinWithSeparator(" ")
}
```

下一个函数会为一个对象创建一个 dump 函数。调用时传入一个对象，它会返回一个 dump 这个对象内容的函数。在函数内部，我们给对象保存了一个 `UnsafePointer`，而不是普通的引用。这样可以确保它不会和语言的引用计数系统发生交互。它允许我们可以在这个对象被销毁之后 dump 出它的内存，后面我们会介绍。

```swift
func dumperFunc(obj: AnyObject) -> (Void -> String) {
    let objString = String(obj)
    let ptr = unsafeBitCast(obj, UnsafePointer<Void>.self)
    let length = class_getInstanceSize(obj.dynamicType)
    return {
        let bytes = contents(ptr, length)
        return "\(objString) \(ptr): \(bytes)"
    }
}
```

下面是一个包含弱引用变量的类，后面我会观察这个弱引用。我在弱引用变量的前后分别添加了一个 dummy 变量，以便于我们区分弱引用在 dump 出来的内存结构中的位置：

```swift
class WeakReferer {
    var dummy1 = 0x1234321012343210
    weak var target: WeakTarget?
    var dummy2: UInt = 0xabcdefabcdefabcd
}
```

让我们试一下! 我们先创建一个引用，然后 dump 它：

```swift
let referer = WeakReferer()
let refererDump = dumperFunc(referer)
print(refererDump())
```

打印结果：

``` 
WeakReferer 0x00007f8a3861b920: 0000000107ab24a0 0000000200000004 1234321012343210 0000000000000000 abcdefabcdefabcd
```

我们看到 `isa` 指针位于最开始的位置，紧随其后的是其它一些内部字段。`dummy1` 变量占据了第四块，`dummy2` 变量占据了第六块。正如我们所期望的那样，在他们之间的弱引用正好是零。

现在我们让这个弱引用指向一个目标对象，看看会变成什么样。我将这段代码放入一个 `do`语句中，以便于当目标对象超出作用域和被销毁时我们可以进行控制：

```swift
do {
    let target = NSObject()
    referer.target = target
    print(target)
    print(refererDump())
}
```

打印结果：

``` 
<NSObject: 0x7fda6a21c6a0>
WeakReferer 0x00007fda6a000ad0: 00000001050a44a0 0000000200000004 1234321012343210 00007fda6a21c6a0 abcdefabcdefabcd
```

正如我们期望的那样，目标对象的指针直接存储在弱引用中。在目标对象被销毁之后，我们在 `do` 代码块之后再次调用 dump 函数：

```swift
print(refererDump())

WeakReferer 0x00007ffe32300060: 000000010cfb44a0 0000000200000004 1234321012343210 0000000000000000 abcdefabcdefabcd
```

它被归零了。点个赞!

仅仅为了好玩，我们用一个纯 Swift 对象作为对象来重复这个实验。不必要时，我并不是很想使用 Objective-C 中的东西。下面是一个纯 Swift 对象：

```swift
class WeakTarget {}
```

让我们试一下：

```swift
let referer = WeakReferer()
let refererDump = dumperFunc(referer)
print(refererDump())
do {
    class WeakTarget {}
    let target = WeakTarget()
    referer.target = target
    print(refererDump())
}
print(refererDump())
```

目标对象像我们期望的那样被归零了，然后被重新赋值：

``` 
WeakReferer 0x00007fbe95000270: 00000001071d24a0 0000000200000004 1234321012343210 0000000000000000 abcdefabcdefabcd
WeakReferer 0x00007fbe95000270: 00000001071d24a0 0000000200000004 1234321012343210 00007fbe95121ce0 abcdefabcdefabcd
```

然后当目标对象被销毁，引用应该被归零：

``` 
WeakReferer 0x00007fbe95000270: 00000001071d24a0 0000000200000004 1234321012343210 00007fbe95121ce0 abcdefabcdefabcd
```

不幸的是它并没有被归零。可能是目标对象没有被销毁。一定是有某些东西让它继续活着！让我们再检查一下：

```swift
class WeakTarget {
    deinit { print("WeakTarget deinit") }
}
```

再次运行代码，结果如下：

``` 
WeakReferer 0x00007fd29a61fa10: 0000000107ae44a0 0000000200000004 1234321012343210 0000000000000000 abcdefabcdefabcd
WeakReferer 0x00007fd29a61fa10: 0000000107ae44a0 0000000200000004 1234321012343210 00007fd29a42a920 abcdefabcdefabcd
WeakTarget deinit
WeakReferer 0x00007fd29a61fa10: 0000000107ae44a0 0000000200000004 1234321012343210 00007fd29a42a920 abcdefabcdefabcd
```

它消失了，但是弱引用并没有归零。怎么回事呢，我们发现了 Swift 的一个 bug！很神奇，这个 bug 一直没有被解决。你会想之前肯定已经有人已经注意到了这个问题。接下来，我们通过访问弱引用来产生一个崩溃，然后我们可以用这个 Swift 工程提交这个 bug ：

```swift
let referer = WeakReferer()
let refererDump = dumperFunc(referer)
print(refererDump())
do {
    class WeakTarget {
        deinit { print("WeakTarget deinit") }
    }
    let target = WeakTarget()
    referer.target = target
    print(refererDump())
}
print(refererDump())
print(referer.target)
```

下面就是崩溃信息：

``` 
WeakReferer 0x00007ff7aa20d060: 00000001047a04a0 0000000200000004 1234321012343210 0000000000000000 abcdefabcdefabcd
WeakReferer 0x00007ff7aa20d060: 00000001047a04a0 0000000200000004 1234321012343210 00007ff7aa2157f0 abcdefabcdefabcd
WeakTarget deinit
WeakReferer 0x00007ff7aa20d060: 00000001047a04a0 0000000200000004 1234321012343210 00007ff7aa2157f0 abcdefabcdefabcd
nil
```

哦，我的天呐！大爆炸在哪呢？应该有一个惊天动地的大爆炸呀！输出的内容表明一切工作正常，但我们可以清楚地从 dump 内容看到它并没有正常工作。

让我们再仔细检查一下。下面是一个经过修改的 `WeakTarget` 类，我们添加了一个 dummy 变量以便于区分 dump 的内容：

```swift
class WeakTarget {
    var dummy = 0x0123456789abcdef

    deinit {
        print("Weak target deinit")
    }
}
```

下面是一段新的代码，运行的程序和之前的基本相同，只不过每次 dump 都会输出两个对象（校者注：Target 和 Referer）：

```swift
let referer = WeakReferer()
let refererDump = dumperFunc(referer)
print(refererDump())
let targetDump: Void -> String
do {
    let target = WeakTarget()
    targetDump = dumperFunc(target)
    print(targetDump())

    referer.target = target

    print(refererDump())
    print(targetDump())
}
print(refererDump())
print(targetDump())
print(referer.target)
print(refererDump())
print(targetDump())
```

让我们检查一下输出内容。referer 对象的生命周期和之前一样，它的 `target` 字段被顺利的归零了：

```
WeakReferer 0x00007fe174802520: 000000010faa64a0 0000000200000004 1234321012343210 0000000000000000 abcdefabcdefabcd
```

`target` 首先作为一个普通对象，在各种头字段之后紧跟着我们的 `dummy` 字段：

```
WeakTarget 0x00007fe17341d270: 000000010faa63e0 0000000200000004 0123456789abcdef
```

在给 `target` 字段赋值后，我们可以看到被填充的指针的值：

```
WeakReferer 0x00007fe174802520: 000000010faa64a0 0000000200000004 1234321012343210 00007fe17341d270 abcdefabcdefabcd
```

`target` 对象还是和之前一样，但是它其中一个头字段增加了 2：

```
WeakTarget 0x00007fe17341d270: 000000010faa63e0 0000000400000004 0123456789abcdef
```

目标对象像我们期望的那样被销毁了：

```
Weak target deinit
```

我们看到引用对象一直都有一个指针指向目标对象：

```
WeakReferer 0x00007fe174802520: 000000010faa64a0 0000000200000004 1234321012343210 00007fe17341d270 abcdefabcdefabcd
```

并且目标对象本身一直存活着。和上次我们看到的相比，它的头字段减少了 2：

```
WeakTarget 0x00007fe17341d270: 000000010faa63e0 0000000200000002 0123456789abcdef
```

访问 `target` 字段会产生 `nil` ，即便它没有被归零：

```
nil
```

再次 dump referer 对象的内容，从中我们看出仅仅访问 `target` 字段的行为已经改变了它。现在它被归零了：

```
WeakReferer 0x00007fe174802520: 000000010faa64a0 0000000200000004 1234321012343210 0000000000000000 abcdefabcdefabcd
```

目标对象现在被完全抹掉了：

```
WeakTarget 0x00007fe17341d270: 200007fe17342a04 300007fe17342811 ffffffffffff0002
```

现在变的越来越有趣了。我们看到头字段会一会儿增加，一会儿减少；让我们看看是否能有重现出更多的信息：

```swift
let target = WeakTarget()
let targetDump = dumperFunc(target)
do {
    print(targetDump())
    weak var a = target
    print(targetDump())
    weak var b = target
    print(targetDump())
    weak var c = target
    print(targetDump())
    weak var d = target
    print(targetDump())
    weak var e = target
    print(targetDump())

    var f = target
    print(targetDump())
    var g = target
    print(targetDump())
    var h = target
    print(targetDump())
    var i = target
    print(targetDump())
    var j = target
    print(targetDump())
    var k = target
    print(targetDump())
}
print(targetDump())
```

打印结果：

```
WeakTarget 0x00007fd883205df0: 00000001093a4840 0000000200000004 0123456789abcdef
WeakTarget 0x00007fd883205df0: 00000001093a4840 0000000400000004 0123456789abcdef
WeakTarget 0x00007fd883205df0: 00000001093a4840 0000000600000004 0123456789abcdef
WeakTarget 0x00007fd883205df0: 00000001093a4840 0000000800000004 0123456789abcdef
WeakTarget 0x00007fd883205df0: 00000001093a4840 0000000a00000004 0123456789abcdef
WeakTarget 0x00007fd883205df0: 00000001093a4840 0000000c00000004 0123456789abcdef
WeakTarget 0x00007fd883205df0: 00000001093a4840 0000000c00000008 0123456789abcdef
WeakTarget 0x00007fd883205df0: 00000001093a4840 0000000c0000000c 0123456789abcdef
WeakTarget 0x00007fd883205df0: 00000001093a4840 0000000c00000010 0123456789abcdef
WeakTarget 0x00007fd883205df0: 00000001093a4840 0000000c00000014 0123456789abcdef
WeakTarget 0x00007fd883205df0: 00000001093a4840 0000000c00000018 0123456789abcdef
WeakTarget 0x00007fd883205df0: 00000001093a4840 0000000c0000001c 0123456789abcdef
WeakTarget 0x00007fd883205df0: 00000001093a4840 0000000200000004 0123456789abcdef
```

我们看到每一个新的弱引用会让头字段中的第一个数增加 2。每一个新的强引用会让头字段中的第二个数增加 4。

回顾一下，下面这些就是目前我们所发现的：

* 在内存中弱指针和普通指针是一样的.
* 当一个弱目标对象（WeakTarget）的 `deinit` 方法调用时，目标对象是*不会*被释放的，并且弱指针也*不会*被归零。
* 当目标对象的 `deinit` 方法执行之后，访问弱指针，它就会被归零并且弱目标对象也会被释放。
* 弱目标对象包含一个弱引用的引用计数，与强引用计数分离开。

### Swift 代码

既然 Swift 已经开源，我们可以通过查看源代码来继续我们的观察。

在 Swift 标准库中用 `HeapObject` 类型来表示一个分配在堆上的对象，其实现可参考 [stdlib/public/SwiftShims/HeapObject.h](https://github.com/apple/swift/blob/swift-2.2-SNAPSHOT-2015-12-01-b/stdlib/public/SwiftShims/HeapObject.h#L33)。看起来是这样的：

```cpp
struct HeapObject {
/// 这始终是一个有效的元数据对象的指针。
struct HeapMetadata const *metadata;

SWIFT_HEAPOBJECT_NON_OBJC_MEMBERS;
// FIXME: 在 32 位的平台上分配了两个字大小的元数据。

#ifdef __cplusplus
HeapObject() = default;

// 给新分配的堆内存初始化空间（对象alloc，是分配的堆内存）。
constexpr HeapObject(HeapMetadata const *newMetadata) 
    : metadata(newMetadata)
    , refCount(StrongRefCount::Initialized)
    , weakRefCount(WeakRefCount::Initialized)
{ }
#endif
};
```

Swift 的 `metadata` 字段就相当于 Objective-C 的 `isa` 字段，并且它们是兼容的。还有一些像 `NON_OBJC_MEMBERS` 这样的宏定义：

```cpp
#define SWIFT_HEAPOBJECT_NON_OBJC_MEMBERS       \
  StrongRefCount refCount;                      \
  WeakRefCount weakRefCount
```

噢，快看！这就是我们的两个引用计数。

(附加问题：为什么这里强引用在前面，而在 dump 时确是弱引用在前面？)

引用计数是通过位于 [stdlib/public/runtime/HeapObject.cpp](https://github.com/apple/swift/blob/swift-2.2-SNAPSHOT-2015-12-01-b/stdlib/public/runtime/HeapObject.cpp) 文件中的一系列函数来进行管理的。比如，下面的 `swift_retain`：

```cpp
void swift::swift_retain(HeapObject *object) {
SWIFT_RETAIN();
    _swift_retain(object);
}
static void _swift_retain_(HeapObject *object) {
    _swift_retain_inlined(object);
}
auto swift::_swift_retain = _swift_retain_;
```

这里面拐了几个弯，但它最终是调用头文件中的内联函数：

```cpp
static inline void _swift_retain_inlined(HeapObject *object) {
  if (object) {
    object->refCount.increment();
  }
}
```

如你所见，它会增加引用计数。下面是 increment 函数的实现：

```cpp
void increment() {
  __atomic_fetch_add(&refCount, RC_ONE, __ATOMIC_RELAXED);
}
```

`RC_ONE` 来自于一个枚举类型：

```cpp
enum : uint32_t {
  RC_PINNED_FLAG = 0x1,
  RC_DEALLOCATING_FLAG = 0x2,

  RC_FLAGS_COUNT = 2,
  RC_FLAGS_MASK = 3,
  RC_COUNT_MASK = ~RC_FLAGS_MASK,

  RC_ONE = RC_FLAGS_MASK + 1
};
```

相信你已经明白为什么每一个新的强引用会让头字段增加 4 了吧。这个枚举类型的前两位用来作为标志位。回想一下之前的 dump 结果，我们可以看到这些标志位。下面是一个弱目标对象在最后一个强引用消失之前和之后的结果：

``` 
WeakTarget 0x00007fe17341d270: 000000010faa63e0 0000000400000004 0123456789abcdef
Weak target deinit
WeakTarget 0x00007fe17341d270: 000000010faa63e0 0000000200000002 0123456789abcdef
```

其中第二个字段开始是 4，表示引用计数为 1 并且没有标志位，之后变成了 2，表示引用计数为 0 和 `RC_DEALLOCATING_FLAG` 标志位被设定了。这个被析构的对象被放在了处于 `DEALLOCATING` 状态的位置。

（顺便说一句，`RC_PINNED_FLAG` 到底是用来干什么的呢？我查找了相关代码，除了能够表明一个「固定的对象（pinned object）」外，其它对于这个标记一无所知。如果你弄清楚了或者有一些相关的猜测，请给我留言。）

现在让我们看一看弱引用计数的实现。它有同样的枚举结构：

```cpp
enum : uint32_t {
  // There isn't really a flag here.
  // Making weak RC_ONE == strong RC_ONE saves an
  // instruction in allocation on arm64.
  RC_UNUSED_FLAG = 1,

  RC_FLAGS_COUNT = 1,
  RC_FLAGS_MASK = 1,
  RC_COUNT_MASK = ~RC_FLAGS_MASK,

  RC_ONE = RC_FLAGS_MASK + 1
};
```

这就是 2 的来源：其中有一个保留的标志位，目前尚未被使用。奇怪的是，关于这段代码的注释似乎是不正确的，这的 `RC_ONE` 等于 2，而强引用的 `RC_ONE` 等于 4。我猜它们曾经是相等的，但后来它被修改了而注释却没有更新。我只是想表明如果注释是无用的，那你为什么还要写它呢。

所有这些是如何和加载弱引用相关联的呢？它是由 [swift_weakLoadStrong](https://github.com/apple/swift/blob/swift-2.2-SNAPSHOT-2015-12-01-b/stdlib/public/runtime/HeapObject.cpp#L636) 函数来处理的：

```cpp
HeapObject *swift::swift_weakLoadStrong(WeakReference *ref) {
  auto object = ref->Value;
  if (object == nullptr) return nullptr;
  if (object->refCount.isDeallocating()) {
    swift_weakRelease(object);
    ref->Value = nullptr;
    return nullptr;
  }
  return swift_tryRetain(object);
}
```

从上面的代码，惰性归零是如何工作的已经一目了然了。当加载一个弱引用时，如果目标对象正在被销毁，就会对这个引用进行归零。反之，会保留目标对象并返回它。进一步深挖一点，我们可以看到 `swift_weakRelease` 如何释放对象的内存，前提是它是最后一个引用：

```cpp
void swift::swift_weakRelease(HeapObject *object) {
  if (!object) return;

  if (object->weakRefCount.decrementShouldDeallocate()) {
    // 只有对象可以 weak-retained 和 weak-released
    auto metadata = object->metadata;
    assert(metadata->isClassObject());
    auto classMetadata = static_cast<const ClassMetadata*>(metadata);
    assert(classMetadata->isTypeMetadata());
    swift_slowDealloc(object, classMetadata->getInstanceSize(),
                      classMetadata->getInstanceAlignMask());
  }
}
```

（注意：如果你正在查看版本库中的代码，使用「weak」命名的地方大多数都改成了「unowned」。上面的命名是截至撰写本文时最新的快照，但开发仍在继续。你可以查看和我这对应的版本库中的 2.2 版本的快照，或者获取最新的版本但是要注意命名的变化，并且实现也有可能发生了改变。)

### 整合

我们已经在层级上自上往下地看到了 Swift 中的弱引用是如何实现的。那么在高层观察 Swift 的弱引用又是如何工作的呢？

1. 弱引用只是指向目标对象的指针。
2. 在 Objective-C 中是*没有*办法单独追踪弱引用的。
3. 相反，每一个 Swift 对象都有一个弱引用计数，和它的强引用计数相邻。
4. Swift 将对象的析构过程（deinit）和对象的释放（dealloc）解耦。一个对象可以被析构并释放它的外部资源，但不必释放对象本身所占用的内存。
5. 当一个 Swift 对象的强引用计数变成零而弱引用计数仍大于零时，那么这个对象会被析构，但是不会被释放。
6. 这意味着一个被释放对象的弱指针*仍然是一个有效的指针*，它可以被反向引用而不会崩溃或者加载垃圾数据。它们只是指向一个处于僵尸状态的对象。
7. 当一个弱引用被加载时，运行时会检查目标对象的状态。如果目标对象是一个僵尸对象，然后它会对弱引用进行归零，也就是减少弱引用计数并返回 `nil`。
8. 当僵尸对象的所有弱引用都被归零，那么这个僵尸对象就会被释放。

比起 Objective-C 中的实现，这种设计会带来一些有趣的结果：

* 不需要维护一个弱引用列表。这样既简化代码也提高了性能。
* 在一个线程归零一个弱引用和另外一个线程加载一个弱引用之间就不会存在竞态条件了。这也意味着加载一个弱引用和销毁一个弱引用对象不需要加锁。这也提高了性能。
* 一个对象即便没有了强引用，但是弱引用任然会导致该对象被分配的内存被占用，直到所有弱引用被加载或者被丢弃。这种做法临时增加了内存使用。但是要注意的是这个影响很小，当目标对象没有被释放时，它所占的内存大小只是实例本身。当最后一个强引用变成零时，所有的外部资源（包括用于存储的 `Array` 或 `Dictionary` 属性）都会被释放。弱引用会导致被分配的单个实例不会被释放，而不是整个对象树。
* 每一个对象都需要额外的内存来存储弱引用计数。但在实际的 64 位系统中，这似乎是无关紧要的。头字段要占据所有指针大小的块的数量，并且强和弱引用计数共享一个头字段。如果没有弱引用计数，强引用计数就会占据整个 64 位。通过使用[非指针（non-pointer）](http://www.sealiesoftware.com/blog/archive/2013/09/24/objc_explain_Non-pointer_isa.html) `isa` 可以将强引用移到 `isa` 中，但我不确定那是不是很重要或者它未来会如何发展。 对于 32 位系统，弱引用计数会将对象的大小增加四个字节。然而，32 位系统如今已经没有那么重要了.
* 因为访问一个弱指针是如此的方便，所以 `unowned` 的语义也采用了相同的机制来实现。`unowned` 和 `weak` 工作方式是一样的，只是当目标对象被释放，`unowned` 会给你一个大大的失败，而不是给你返回一个 `nil` 。在 Objective-C 中，`__unsafe_unretained` 是作为一个带有未定义行为的原始指针来实现的，你可以快速的访问它，毕竟加载一个弱指针还是有点慢。

### 总结

Swift 的弱指针通过一种有趣的方式，既保证了速度和正确性，也保证较低的内存开销。通过追踪每个对象的弱引用计数，将对象的销毁和对象的析构过程分离开来，弱引用问题被安全而又快速的得到解决。正是由于可以查看标准库的源代码，这让我们可以在源代码级别看到究竟发生了什么，而不是像我们之前通过反编译和 dump 内存来进行研究。当然，正如你上面看到的那样，我们很难完全打破这个习惯。

今天就这样了。下次回来会带来更多的干货。由于假期的缘故，可能需要几周，但是我会在之前发布一篇稍微短一点的文章。不管怎样，给接下来的话题提更多的建议吧。周五问答是由读者们的想法驱动的，如果你有一个你希望了解的想法，[请告知我](mailto:mike@mikeash.com)!