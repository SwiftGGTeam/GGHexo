title: "浅谈 Swift 2 中的 Objective-C 指针"
date: 2015-09-07
tags: [Swift]
categories: [Jameson Quave]
permalink: objective-c-pointers-and-swift

---
原文链接=http://jamesonquave.com/blog/objective-c-pointers-and-swift
作者=Jameson Quave
原文日期=2015/08/23
译者=mmoaay
校对=numbbbbb
定稿=shanks

> 本文写于 2015 年 8 月 23 日，与 Xcode7 Beta 版和 Swift 2 兼容


## 在 Swift 中读 C 指针

下面这个 Objective-C 方法会返回一个 `int` 指针，或者说 C 术语里面的 `(int *)`：

```objectivec
@interface PointerBridge : NSObject {
    int count;
}
- (int *) getCountPtr;
@end
 
@implementation PointerBridge
- (instancetype) init {
    self = [super init];
    if(self) {
        count = 23;
    }
    return self;
}
- (int *) getCountPtr {
    return &count;
}
@end
```

<!--more-->

上面的代码定义了一个 `PointerBridge` 类，它包含 `getCountPtr` 方法，这个方法返回一个值为 23 的 `int` 型*内存地址*。 这个 `Int` 其实是 `count` 的实例，它在构造方法 `init` 中被赋值为 23 。

我把这段代码放在一个 Objective-C 的头文件中，然后把这个头文件 import 到我的桥接头文件（XXX-bridging-header.h）中，这样就可以在 Swift 中使用。然后我在 Swift 中创建一个名为 `bridge` 的 `PointerBridge` 实例，然后获得 `getCountPtr()` 方法的返回值…

```swift
let bridge = PointerBridge()
let theInt = bridge.getCountPtr()
print(theInt)
print(theInt.memory)
```

在 Xcode 中按住 Option 键点击 `theInt` 检查它的类型，你会发现他的 Swift 类型是  `UnsafeMutablePointer<Int32>`。这是指向 `Int` 型的指针，和 `Int` 型不一样，它仅仅是指向它的*指针*。

如果运行这个程序然后执行这段 Swift 代码，我们会发现 `theInt` 在命令行中输出类似 *0x00007f8bdb508ef8* 这样的内存地址，然后，然后我们会看到 `memory` 成员变量输出的值 23 。访问指针指向的内存通常返回其底层指向的对象，在这个例子中就是原来的 32 位 `int`（在 Swift 中就是 `Int32`）

现在让 Objective-C 类支持设置 `count` 的值。

```objectivec
@interface PointerBridge : NSObject {
    int count;
}
- (int *) getCountPtr;
- (void) setCount:(int)newCount;
@end
 
@implementation PointerBridge
- (instancetype) init {
    self = [super init];
    if(self) {
        count = 23;
    }
    return self;
}
- (int *) getCountPtr {
    return &count;
}
- (void) setCount:(int)newCount {
    count = newCount;
}
@end
```

我们可以调用 `setCount()` 方法来修改 `count` 的值。因为 `theInt` 是一个指针，所以通过 `setCount` 修改 `count` 也会更新 `theInt.memory`。别忘了内存地址是不会变的，变的是值。

也就是说，下面的代码会在命令行中打印数字 23， 然后打印数字 1000。

```swift
let bridge = PointerBridge()
let theInt = bridge.getCountPtr()
print(theInt.memory) // 23
bridge.setCount(1000)
print(theInt.memory) // 1000
```

如果想避免每次都写 `.memory`，有一条捷径就是把`.memory` 赋值给一个变量：

```swift
let bridge = PointerBridge()
let theInt = bridge.getCountPtr()
let countVal = theInt.memory
print(countVal) // 23
```

就像之前一样， 命令行会输出 23。然而，如果我们像之前那样调用 `setCount()` 方法修改 `count` 的值，问题出现了：

```swift
let bridge = PointerBridge()
let theInt = bridge.getCountPtr()
let countVal = theInt.memory
print(countVal) // 23
 
bridge.setCount(1000)
print(countVal) // 23
```

出现问题的原因是 `countVal` 是通过*值（value）*来赋值的。赋值的时候*值（value）*就是23，所以 `countVal` 有它自己的内存地址，这个地址永久地保存了 23 这个值，所以已经失去了指针的特性。 `countVal` 现在只是一个普通的 `Int32` 型。

## 在 Swift 中创建 C 指针

如果我们想要做和上面相反的事情呢？不是用 `Int` 型来给 `count` 赋值，而是传入一个指针呢？

我们假设在 Objective-C 的代码中有如下的一个方法：

```objectivec
- (void) setCountPtr:(int *)newCountPtr {
    count = *newCountPtr;
}
```

这个方法很作，其实就是把 `newCountPtr` 重新赋值给 count，但在 Swift 开发中你确实会碰到这样一些需要传入指针的场景。用这么作的方式只是为了向你展示如何在 Swift 中创建指针类型，然后传入到 Objective-C 的方法中。

你可能会简单的认为只要使用一个类似 & 的引用操作符就可以传入 `Int` 值，就像你在 C 中所做的那样。在 Objective-C 中你可以这样写：

```objectivec
int mcount = 500;
[self setCountPtr:&mcount];
```

这段代码可以成功地把 `count` 的值更新为 500。然而在 Swift 中，通过自动补全你会发现它更复杂（而且更冗长）。它需要传入一个`UnsafeMutablePointer<Int32>` 类型的 `newCountPtr` 变量。

我知道这个类型很恶心，而且它看起来确实很复杂。但是，事实上它相当简单，特别是在你了解 Obj-C 中的指针的情况下。如果要创建一个`UnsafeMutablePointer<Int32>` 类型的对象，我们只需要调用构造方法，这个构造方法唯一需要传入的参数就是指针的大小（你应该知道 C 的指针是不存储类型的，所以它也不会存储大小的信息）

```swift
let bridge = PointerBridge()
let theInt = bridge.getCountPtr()
print(theInt.memory) // 23
 
let newIntPtr = UnsafeMutablePointer<Int32>.alloc(1)
newIntPtr.memory = 100
bridge.setCountPtr(newIntPtr)
 
print(theInt.memory) // 100
```

唯一需要给 `UnsafeMutablePointer<Int32>` 构造方法传入的参数就是需要分配空间的对象的个数，所以我们传入 1 即可，因为我们只需要一个`Int32` 对象 。然后，只需要把我们之前对 `memory` 所做的事情反过来，我们就可以为我们新建的指针赋值。最终，我们只需要简单滴把 `newIntPtr` 传入到 `setCountrPtr` 方法中，再把之前 `theInt` 指针的值打印出来，我们就会发现它的值已经被更新为 100。

## 总结

`UnsafeMutablePointer<T>` 类型的兄弟类型 `UnsafePointer<T>` 从根本上说只是 C 指针的一个抽象。你可以把它们看作 Swift 的可选类型，这样更容易理解。它们不是直接等于一个确切的值，而是在一个确切的值上面做了一层抽象。它们的类型是泛型，这样就可以允许其使用其他的值，而不单单是 `Int32`。比如你需要传入一个 `Float` 对象那么你可能需要 `UnsafeMutablePointer<Float>`。

重点是：你不是把一个 `Int` *强转* 为 `UnsafeMutablePointer<Int>`，因为指针不是简单地一个 `Int` 值。所以，如果需要创建一个新的对象，你需要调用构造方法 `UnsafeMutablePointer<Int>(count: Int)`。

在本文之后我们会继续深入研究函数指针的一些细节，然后学习如何利用这些特性的优势去更好地与 C 和 Objective-C 的 API 进行交互。一定要注册我们的 [Newsletter](http://jamesonquave.us6.list-manage1.com/subscribe?u=1d2576bf288fe2fd7fa71bd20&id=6c787ed58a) ，这样你才不会错过这些精彩的内容！

<center>![给译者打赏](/img/QRCode/mmoaay.jpg)</center>
