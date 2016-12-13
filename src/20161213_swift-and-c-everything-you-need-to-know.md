title: "Swift 和 C 不得不说的故事"
date: TBD
tags: [Swift 进阶]
categories: [uraimo]
permalink: swift-and-c-everything-you-need-to-know
keywords: Swift C
custom_title: Swift和C编程
description: 本文描述如何混合使用Swift和C进行编程

---
原文链接=https://www.uraimo.com/2016/04/07/swift-and-c-everything-you-need-to-know/
作者=Umberto Raimondi
原文日期=2016-04-07
译者=shanks
校对=pmst
定稿=CMB

<!--此处开始正文-->

从 Swift 开源到现在，只有短短的几个月时间，Swift 却已经被[移植](http://uraimo.com/category/swiftporting/)到了许多新的平台上，还有一些新的项目已经使用了 Swift。这类移植，每个月都在发生着。

在不同平台下混合使用 Swift 和 C 的可行性，看起来是一件非常难的实践，只有非常有限的实践资源，当然这是和你去封装一个原生库对比起来看的，你可以在你代码运行的平台上轻松地封装一个原生库。

<!--more-->

官方文档 [Using Swift with Cocoa and Objective-C ](https://developer.apple.com/library/prerelease/ios/documentation/Swift/Conceptual/BuildingCocoaApps/InteractingWithCAPIs.html#//apple_ref/doc/uid/TP40014216-CH8-ID17) 已经系统地讲解了有关与 C 语言互调的基本知识。但仅限于此，尤其是在实际的场景中如何去使用这些桥接函数，感觉仍然是一脸懵逼的。仅有少数博客文章会有此文档笔记和使用讲解。

这篇文章将在一些不是那么明显的细节地方给你一些启发，同时给出一些实际的例子，讲解如何与 C 语言的 API 互调。这篇文章主要是面向那些计划在 Linux 下进行 Swift 开发的同学，另外文中的一些解释，同样适用于基于 Darwin 的操作系统。

首先简要介绍如何把 C 类型导入 Swift 中，随后我们将深入研究有关指针，字符串和函数的使用细节，通过一个简单的教程学习使用 LLVM 模块创建 Swift 和 C 混编的项目。

> 从 [GitHub](https://github.com/uraimo/Swift-Playgrounds/tree/swift2)或者[zipped](https://www.uraimo.com/archives/2016-04-07-Swift-And-C.zip)获取 Swift/C 混合编码的 playground。

### 内容介绍

* [C 类型](#c_type)
  * [数组和结构体](#arrays_and_structs)
  * [枚举](#enums)
  * [联合体](#unions)
  * [关于长度的那些事](#the_size_of_things)
  * [Null,nill, 0](#null_nil_0) 
* [宏定义](#macros)
* [指针操作](#working_with_pointers)
  * [内存分配](#allocating_memory)
  * [指针计算](#pointer_arithmetic)
* [字符串操作](#working_with_strings)
* [函数操作](#working_with_functions)
  * [Unmanaged](#unmamanged) 
* [文件操作](#working_with_files)
* [位操作](#bitwise_operations)
* [Swift 和 C 的混合项目](#swift_and_c_mixed_projects)
* [结束语](#closing_thoughts)

<a name="c_type"></a>
## C 类型

每一个 C 语言基本类型， Swift 都提供了与之对应的类型。在 Swift 中调用 C 方法的时候，会用到这些类型：

| C 类型                          |          Swift 对应类型          |                  别名                  |
| ----------------------------- | :--------------------------: | :----------------------------------: |
| bool                          |            CBool             |                 Bool                 |
| char,unsigned char            |     CChar, CUnsignedChar     |             Int8, UInt8              |
| short, unsigned short         |    CShort, CUnsignedShort    |            Int16, UInt16             |
| int, unsigned int             |      CInt, CUnsignedInt      |            Int32, UInt32             |
| long, unsigned long           |     CLong, CUnsignedLong     |              Int, UInt               |
| long long, unsigned long long | CLongLong, CUnsignedLongLong |            Int64, UInt64             |
| wchar_t, char16_t, char32_t   | CWideChar, CChar16, CChar32  | UnicodeScalar, UInt16, UnicodeScalar |
| float, double                 |       CFloat, CDouble        |            Float, Double             |

官方文档中对上面表格也有介绍，展示了 Swift 类型和对应的 C 别名。

即使在你写一些需要调用 C APIs 的代码时，你都应该尽可能地使用 Swift 的 C 类型。你会注意到，大多数从 C 转换到 Swift 的类型，都是简单地使用了常用的 Swift 固定大小的类型，而这些类型，你应该已经相当熟悉了。

<a name="arrays_and_structs"></a>
### 数组和结构体

让我们接下来聊聊复合数据结构：数组和结构体。

理想的情况下，你希望定义一个如下全局数组：

```c
//header.h

char name[] = "IAmAString";
```

在 Swift 中，有可能会被转换成一个 Swift 字符串，或者至少是某种字符类型的数组。当然，当我们真正在 Swift 中使用这个导入的 name 数组，将会出现以下结果：


```swift
print(name) // (97, 115, 100, 100, 97, 115, 100, 0)
```

这个事实告诉我们，当你在做一个 Swift/C 混合的应用下时，在 C 语言层面，推荐使用指针表示一个对象的序列，而不是使用一个普通的数组。这样能避免在 Swift 语言层面下痛苦的转换。

但是等一下，如果我们使用一段复杂的代码转换数字元组，恢复成之前定义为数组的全局字符串，是否更加好呢？答案是否定的，我们将会在讨论指针的时候，介绍如何使用一小段代码如何复原数组元组。

幸运的是，以上的情况不会在处理结构体时候发生，将会如预期的转换为 Swift 的结构体，结构体的成员也将会按照预期的方式转换，每一个成员都会转换成对应的 Swift 类型。

比如，有以下的结构体：

```c
typedef struct {
    char name[5];
    int value;
    int anotherValue;
} MyStruct;
```

这个结构体将会转换成一个 `MyStruct`的 Swift 结构体。结构体的构造函数的转换也很简单，跟我们想象中的一样：

```swift
let ms = MyStruct(name: (0, 0, 0, 0, 0), value: 1, anotherValue:2)
print(ms)
```

下文某个章节，我们将看到这并非是唯一方法去构造和初始化一个结构体实例，尤其是在我们只需要一个指向空对象的指针时，更简单的方式应该是手动分配一个新的空结构体指针实例。

<a name="enums"></a>
### 枚举

如果你需要使用 Swift 访问 C 的枚举，首先在 C 中定义一个常见的枚举类型：

```c
typedef enum ConnectionError{
    ConnectionErrorCouldNotConnect = 0,
    ConnectionErrorDisconnected = 1,
    ConnectionErrorResetByPeer = 2
}
```

当转换到 Swift 中时候，会与你期望的情况完全不同， Swift 中的枚举是一个结构体，并且会有一些全局变量：

```swift
struct ConnectionError : RawRapresentable, Equatable{ }

var ConnectionErrorCouldNotConnect: ConnectionError {get}
var ConnectionErrorDisconnected: ConnectionError {get}
var ConnectionErrorResetByPeer: ConnectionError {get}
```
显然这样做的话，我们将丧失 Swift 原生枚举提供的所有功能点。但是如果在 C 中使用一个特定的宏定义的话，我们将得到我们想要的结果：

```c
typedef NS_ENUM(NSInteger,ConnectionError) {
    ConnectionErrorCouldNotConnect,
    ConnectionErrorDisconnected,
    ConnectionErrorResetByPeer   
}
```

使用`NS_ENUM`宏定义的枚举(关于这个宏定义如何对应到一个经典的 C 枚举的知识，请参看[这里](http://nshipster.com/ns_enum-ns_options/))，以下代码展示在 Swift 如何导入这个枚举：

```swift
enum ConnectionError: Int {
    case CouldNotConnect
    case Disconnected
    case ResetByPeer
}
```

需要注意的是，枚举值的转换是去掉了枚举名的前缀了的，这是 Swift 其中一个转换的规则，你也会在使用标准的基于 Swift iOS/OSX 框架时候看到这种规则。

另外， Swift 提供了`NS_OPTIONS` 宏定义，用于定义一个可选项集合，遵从 `OptionSetType` 协议(目前为`OpertionType`)。关于此宏定义的更多介绍，请参看[官方文档](https://developer.apple.com/library/prerelease/ios/documentation/Swift/Conceptual/BuildingCocoaApps/InteractingWithCAPIs.html#//apple_ref/doc/uid/TP40014216-CH8-ID17)。

<a name="unions"></a>
### 联合体

接下来让我们看看联合体，一个有趣的 C 类型，在 Swift 中没有对应的数据结构。

Swift 仅部分支持联合体，意思是当一个联合体被导入时，不是每一个字段都会被支持，造成的结果就是，你在 C 中定义的某些字段将不可用（截止目前，没有一个文档说明什么不被支持）。

让我们用一个实际的例子来说明这个被文档遗忘的 C 类型：

```c
//header.h
union TestUnion {
    int i;
    float f;
    unsigned char asChar[4];
} testUnion;
```

在这里我们定义一个`TestUnion`类型，还有一个相关的`testUnion`联合体变量，一共有 4 字节的内存，其中每一个字段代表不同的视角，在 C 语言中，我们可以访问`testUnion`变量，这个变量可以是整形，浮点数和 char 字符串。

由于在 Swift 中，没有类似的数据结构与联合体对应，所以这种类似将在 Swift 中被视作一个*结构体*：

```swift
strideof(TestUnion)  // 4 bytes

testUnion.i = 33
testUnion.f  // 4.624285e-44
testUnion.i  // 33
testUnion.asChar // (33, 0, 0, 0)

testUnion.f = 1234567
testUnion.f  // 1234567
testUnion.i  // 1234613304
testUnion.asChar // (56, 180, 150, 73)
```

正如我们对联合体期望那样，上面第一行代码验证这个类型的确只占 4 个字节的内存长度。接下来的代码，修改其中一个字段，然后验证包含在其他字段中得值是否同时被更新。但是为什么当我们设置`testUnion`的整型字段为 33 时，我们获取对应的 float 字段的值却为 4.624285e-44？

这就跟联合体如何工作有关了。你可以把一个联合体想象为一个字节包，根据每个字段组成的格式化规则进行读写，在上面的例子中，我们设置的 4 个字节的内存区域，与 Int32（32）的字节内容组成是相同的，然后我们读取这4个字节的内存区域，解释成为的字节模式是一个 IEEE 的浮点数。

我们使用一个有用的(但是危险的)`unsafeBitCast`函数来验证上面的解释:

```swift
var fv:Float32 = unsafeBitCast(Int32(33), Float.self)   // 4.624285e-44
```

以上代码的作用，与使用联合体的浮点类型，访问一个包含Int32（33）的字节内存做得事情一样。赋值给了一个浮点类型，并且没有做任何的转换和内存安全检查。

到目前为止我们已经学习了联合体的行为，那么我们能在 Swift 中手动实现一个类似的结构体吗？

即使没有去查看源代码，我们也可以猜到 TestUnion 只是一个简单的结构体，只有4个字节的内存数据块（是那种形式的并不重要），我们只能访问其中的计算属性，这些计算属性把所有的转换细节封装在了 set/get 方法中了。

<a name="the_size_of_things"></a>
### 关于长度的那些事

在 Swift 中，你可以使用`sizeof`函数获取特定类型（原生的和组合的）的数据长度，就像你在 C 语言中使用`sizeof`操作符一样。Swift 同时还提供了一个`sizeOfValue`函数，返回一个类型给定值的数据长度。

但是 C 语言中 sizeof 返回值包含了附加填充保证内存对齐，而 Swift 中的函数只是返回变量的数据长度，不管究竟是如何在内存中存储的，然而这在大多数情况与我们的期望背道相驰。

我想你应该可以猜到， Swift 同时也提供了 2 个附加的函数，正确地得到变量或者类型的长度，并且计算包括用于对齐需要的额外空间，大多数情况下，你应该习惯替换之前的一些函数而使用`strideof` 和 `strideOfValue` 方法，让我们通过一个例子来看看 `sizeof` 和 `strideof` 返回的区别：

```swift
print(strideof(CChar))  // 1 byte

struct Struct1{
    let anInt8:Int64
    let anInt:Int16
    let b:Bool
}

print(sizeof(Struct1))    // 11 (8+2+1) byte
print(strideof(Struct1))  // 16 (8+4+4) byte
```

同时当计算额外的空间时，需要遵守处理器架构的对齐规则，不同的处理器架构下，`strideof` 和 `sizeof` 之间返回的值会有所不同，一个附加的工具函数`alignof`可供使用。


<a name="null_nil_0"></a>
### Null, nil 和 0

幸运的是， Swift 没有提供一个额外的常量来表示 null 值，你只能使用 Swift 的`nil`, 不管指定的变量或者参数的类型是什么。

在后面谈到指针时，`nil` 作为参数传递将会自动被转换成一个 null 指针。

<a name="macros"></a>
## 宏定义

简单的 C 宏定义会转换成 Swift 中得全局常量，与 C 中的常量有点类似：

```c
#define MY_CONSTANT 42
```

将被转换成：

```swift
let MY_CONSTANT = 42
```

更加复杂的宏定义和预处理指令会彻底被 Swift 忽略摒弃。

Swift 也提供了一个简单的条件式编译声明方式，指明某些具体的代码片段只能在特定的操作系统，架构或版本的 Swift 中使用。

```swift
#if arch(arm) && os(Linux) && swift(>=2.2)
    import Glibc
#elseif !arch(i386)
    import Darwin
#else
    import Darwin
#endif

puts("Hello!")
```

在这个例子中，我们根据不同的编译环境，ARM Linux 或者其他环境，决定需要导入的标准 C 库，用于在不同的环境中编译和使用。

这些用来定制编译行为的可用函数是：`os()`(可用值： *OSX*, *iOS*, *watchOS*, *tvOS*, *Linux*),`arch()` (可用值: *x86_64*, *arm*, *arm64*, *i386*) 和 `swift()` (要求参数值指定大于等于某个版本号)。这些函数可以结合一些基本的逻辑与运算符一起使用，构建更加复杂的规则：**&&, ||, !**。

尽管你可能对此不太了解，你只要记住在 OSX 中应该导入 *Darwin*（或者其中某个依赖它的框架）到你的项目中就可以了，用于获取 libc 的函数， 而在 Linux 的平台上，你应该导入 *Glibc*。

<a name="working_with_pointers"></a>
## 指针操作

指针被自动的转换为不同类型的`UnsafePointer<Memory>`对象，对象取决于指针指向值的特征：


| **C 指针**             |               **Swift 类型**               |
| -------------------- | :--------------------------------------: |
| int *                |       UnsafeMutablePointer<Int32>        |
| const int *          |           UnsafePointer<Int32>           |
| NSDate**             | AutoreleasingUnsafeMutablePointer<NSDate> |
| struct UnknownType * |              COpaquePointer              |

通用的规则是，可变的指针变量指向可变的变量，在第三个示例中，指向对象指针的指针被转换为`AutoreleasingUnsafeMutablePointer`。

然而，如果指向的类型没有完全定义或不能在 Swift 中表示，这种指针将会被转换为`COpaquePointer`（在 Swift 3.0 中，将会简化为`OpaquePointer`），一种没有类型的指针，特别是只包含一些位(bits)的结构体。`COpaquePointer`指向的值不能被直接访问，指针变量首先需要转换才能使用。

 `UnsafeMutablePointer` 类型会自动转换为 `UnsafePointer<Type>` （比如当你传入一个可变的指针到一个需要不可变指针的函数中时），反过来转换的话，将会出现编译错误。一个指向不可变值的指针，不能被转换成一个指向可变值的指针，在这种情况下，Swift 会保证最小的安全性。

类名称带有unsafe字眼代表了我们如何去访问内容，但是指向的对象的生命周期是怎么样的，我们应该如何处理，难道是通过 ARC 吗？

我们已经知道，Swift 使用 ARC 来管理引用类型的生命周期（一些结构体和枚举类型包含引用类型时，也会被管理起来。）并且跟踪宿主，那么 UnsafePointers 的行为是通过一些特有的方式进行的吗？

答案是否定的，如果`UnsafePointer<Type>`结构体指向的是一个引用类型（一个类的对象）或者包含一些被跟踪的引用，那么`UnsafePointer<Type>`结构体将被跟踪。你应该知道这些事实，这会有助于去理解一些奇怪的事情，在我们后面讨论内存分配的时候会遇到。

现在我们已经知道指针是如何转换的，另外还有2个事情要说明一下：指针如何解引去获取或者修改指向的值，以及我们如何能获取一个指向新的或者已经存在的 Swift 变量的指针。

一旦你得到一个非空的`UnsafePointer<Memory>`变量时，直接使用`memory`属性获取或者修改指向的值(校对者注：目前 Swift3 中已改为`pointee` 解引取值)：

```swift
var anInt:Int = myIntPointer.memory   //UnsafePointer<Int> --> Int

myIntPointer.memory = 42

myIntPointer[0] = 43
```

你也可以访问同类型指针序列中的特定元素，就像你在 C 语言中使用数组下标那样，每次累加索引值，移动到序列中下一个`strideof(Memory)`长度的元素位置。

另外一方面，如果你获取一个变量的 `UnsafePointer` 指针，然后将其作为参数传递给函数，*只有在这种情况下*，

使用 `&` 操作符能够简单地将 **inout** 参数传递到函数中：

```swift
let i = 42
functionThatNeedsAPointer(&i)
```


考虑到操作符不能运用在那些描述过的函数调用上下文之外的转换，如果你需要获取一个指针变量做进一步的计算（例如指针类型转换）， Swift 提供了 2 个工具函数 `withUnsafePointer` 和 `withUnsafeMutablePointer` ：

```swift
withUnsafePointer(&i, { (ptr: UnsafePointer<Int>) -> Void in
    var vptr= UnsafePointer<Void>(ptr)  
    functionThatNeedsAVoidPointer(vptr)
})

let r = withUnsafePointer(&i, { (ptr: UnsafePointer<Int>) -> Int in
    var vptr = UnsafePointer<Void>(ptr)
    return functionThatNeedsAVoidPointerAndReturnsInt(vptr)
})
```

这个函数创建了一个给定变量的指针对象，把它传入给一个闭包，闭包使用它然后返回一个值。在闭包作用域里面，指针能够保证一直有效，可以认为只能在闭包的上下文中使用，不能返回给外部的作用域。

这种方式使得访问变量可能引发的不安全性被限制在一个定义良好的闭包作用域中。在上面的例子中，我们在传递这个参数给函数之前，把整型指针转换为了void指针。要感谢`UnsafePointer`类的构造函数可以直接做这种指针之间的转换。

接下来让我们简单看看之前的 `COpaquePointer` ， ，关于`COpaquePointer`，没有特别的地方，它可以很容易地转换成一个给定类型的指针，然后使用 `memory` 属性来访问值，就像其他的UnsafePointer一样。

```swift
// ptr is an untyped COpaquePointer

var iptr: UnsafePointer<Int>(ptr)
print(iptr.memory)
```

现在让我们回到本文开头定义的那个字符数组上来，根据我们目前掌握的知识点，知道一个 `CChar`的元组可以自动转换成一个指向`CChar`序列的指针，这样可以轻松地把这个元组转换成字符串：

```swift
let namestr = withUnsafePointer(&name, { (ptr) -> String? in
    let charPtr = UnsafeMutablePointer<CChar>(ptr)
    return String.fromCString(charPtr)
})
print(namestr!) //IA#AString
```

我们可以使用其他方式获得一个指向典型 Swift 数组的指针，然后调用某个方法将其转换成 `UnsafeBufferPointer `:

```swift
let array: [Int8] = [ 65, 66, 67, 0 ]
puts(array)  // ABC
array.withUnsafeBufferPointer { (ptr: UnsafeBufferPointer<Int8>) in
    puts(ptr.baseAddress + 1) //BC
}
```

请注意`UnsafeBufferPointer `可以使用`baseAddress `属性，这个属性包含了缓冲区的基本地址。

还有另外一个类型的指针我们还没有讨论：函数指针。从 Swift 2.0开始，C 函数指针被导入为闭包，使用一个特殊的属性标记`@convention(c)`，表示这个闭包遵从 C 调用约定，我们将在接下来的某个[章节](https://www.uraimo.com/2016/04/07/swift-and-c-everything-you-need-to-know/#working-with-functions)解释其具体的含义。

请暂时忽略具体的实现细节，你只需了解函数指针的基本知识：每导入一个 C 函数，如果需要将函数指针作为参数传入时，会使用一个内置定义的闭包，或者一个 Swift 函数引用（就像其他指针一样，*nil* 也是允许的）作为参数。

<a name="allocating_memory"></a>
### 内存分配

到现在为止，我们仅使用指针指向已经存在的 Swift 对象，但是并没有手动分配过内存。在这个章节中，我们将会学习如何在 Swift 中使用推荐的方式进行内存分配，或者就如我们在 C 语言中所做的那样，使用`malloc`系列函数完成内存分配（可能在一些特定情况下非常有用）。

在开始之前，我们需要意识到 UnsafePointers 和古老的 C 指针一样，在它们的生命周期中存在 3 种可能的状态：

* *未分配的*：没有预留的内存分配给指针
* *已分配的*：指针指向一个有效的已分配的内存地址，但是值没有被初始化。
* *已初始化*：指针指向已分配和已初始化的内存地址。

指针将根据我们具体的操作在这 3 个状态之间进行转换。

大多数情况下，推荐你使用 UnsafePointer 类提供处理指针的方法分配一个新的对象，然后获取指向这个实例的指针，并进行初始化操作，一旦使用完毕，清空它的内容并释放它指向的内存。

让我们看看一个基本的例子：

```swift
var ptr = UnsafeMutablePointer<CChar>.alloc(10)

ptr.initializeFrom([CChar](count: 10, repeatedValue: 0))

// 对对象进行一些操作
ptr[3] = 42

ptr.destroy() //清理

ptr.dealloc(10) //释放内存
```

这里我们使用`alloc(num: Int)`分配长度为 10 的 CChars (UInt8) 内存块，这等同于调用 `malloc` 方法分配指定长度的内存，然后将内容转换成我们需要的特定类型。前一种方法会避免更少的错误，因为我们不用去手动指定总体长度。

一旦`UnsafeMutablePointer `被分配一块内存后，我们必须初始化这个可变的对象，使用`initialize(value: Memory)`和`initializeFrom(value: SequenceType)`方法指定初始内容。当操作对象完毕，我们想释放分配的内存资源，首先会使用`destroy `清空内容，然后调用`dealloc(num: Int)`方法释放指针。

必须指出，Swift 运行时不负责清空内容和释放指针，因此为一个变量分配内存之后，一旦使用完毕，你还要肩负起释放内存的责任。

让我们看看另外一个例子，这次指针指向是一个复杂的 Swift 值类型：

```swift
var ptr = UnsafeMutablePointer<String>.alloc(1)
sptr.initialize("Test String")

print(sptr[0])
print(sptr.memory)

ptr.destroy()
ptr.dealloc(1)
```

包括分配/初始化和清理/析构化 2 个阶段的系列操作，对于值类型和引用类型来说是一样的。但是如果你仔细研究，你会发现对于相同的值类型（比如整型，浮点数或者一些简单结构体），初始化过程并非必须，你可以通过`memory` 属性或者下标来进行初始化。

但是这种方式不适用指针指向一个类，或某些特定的结构体和枚举的情况。必须进行初始化操作，这是为什么呢？

当你使用上面提及的方式修改内存内容，从内存管理角度来说，有关这种行为背后的原因和发生时有关的。让我们来看一个不需要手动初始化内存的代码片段，倘若我们在没有初始化 UnsafePointer 情况下改变了指针指向的内存，会引发崩溃。

```swift
struct MyStruct1{
    var int1:Int
    var int2:Int
}

var s1ptr = UnsafeMutablePointer<MyStruct1>.alloc(5)

s1ptr[0] = MyStruct1(int1: 1, int2: 2)
s1ptr[1] = MyStruct1(int1: 1, int2: 2) // 似乎不应该是这样，但是这能够正常工作

s1ptr.destroy()
s1ptr.dealloc(5)
```

这里没有问题，可以使用，让我们看看其他例子：

```swift
class TestClass{
    var aField:Int = 0
}

struct MyStruct2{
    var int1:Int
    var int2:Int
    var tc:TestClass // 这个字段是引用类型
}

var s2ptr = UnsafeMutablePointer<MyStruct2>.alloc(5)
s2ptr.initializeFrom([MyStruct2(int1: 1, int2: 2, tc: TestClass()),   
                      MyStruct2(int1: 1, int2: 2, tc: TestClass())]) // 删除这行初始化代码将引发崩溃

s2ptr[0] = MyStruct2(int1: 1, int2: 2, tc: TestClass())
s2ptr[1] = MyStruct2(int1: 1, int2: 2, tc: TestClass())

s2ptr.destroy()
s2ptr.dealloc(5)
```

这段代码的作用已在前面的[指针操作](#working_with_pointers)章节进行了相关解释，`MyStruct2`包含一个引用类型，所以它的生命周期交由 ARC 管理。当我们修改其中一个指向的内存模块值的时候，Swift 运行时将试图释放之前存在的对象，由于这个对象没有被初始化，内存存在垃圾，你的应用将会崩溃。

请牢记这一点，从安全的角度来讲，最受欢迎的初始化手段是使用`initialize `分配完成内存后，直接设置变量的初始值。

另外一个方法来自与本节最开始的一个提示，导入标准 C 库（Darwin 或者 Linux 下的 Glibc），然后使用**malloc**系列函数：

```swift
var ptr = UnsafeMutablePointer<CChar>(malloc(10*strideof(CChar)))

ptr[0] = 11
ptr[1] = 12

free(ptr)
```

你可以看到，我们并没有使用之前推荐的方法来初始化实例，那是因为我们在最近的一节中注明了，类似 CChar 和一些基本结构体，更适合使用这种方式。

接下来让我们看看两个附加的例子来讲解两个常用的函数：`memcpy` 和 `mmap`：

```swift
var val = [CChar](count: 10, repeatedValue: 1)
var buf = [CChar](count: val.count, repeatedValue: 0)

memcpy(&buf, &val, buf.count*strideof(CChar))
buf // [1,1,1,1,1,1,1,1,1,1]

let ptr = UnsafeMutablePointer<Int>(mmap(nil, 
                                        Int(getpagesize()), 
                                        PROT_READ | PROT_WRITE, 
                                        MAP_ANON | MAP_PRIVATE, 
                                        -1, 
                                        0))

ptr[0] = 3

munmap(ptr, Int(getpagesize()))
```

这段代码和你使用 C 语言做的类似，请注意你可以使用`getpagesize()`轻松地获取内存页的大小。

第一个例子展示我们可以使用`memcpy`来设置内存，第二个例子展示了一个真实的用例，提供一个可选的内存分配方法，在这里我们映射了一个新的内存页，但是我们只是映射了一个特定的内存区域或者说一个特定的文件指针，在这案例中，我们可以不用初始化直接访问这里之前存在的内容。

让我们接下来看看来自[SwiftyGPIO](https://github.com/uraimo/SwiftyGPIO)中真实的案例， 在这里我[映射了一个内存区域](https://github.com/uraimo/SwiftyGPIO/blob/master/Sources/SwiftyGPIO.swift#L191), 包含了树莓派的数字 GPIO 的注册，将会被用到贯穿到整个库的读取和写入值的情况。

```swift
// BCM2708_PERI_BASE = 0x20000000
// GPIO_BASE = BCM2708_PERI_BASE + 0x200000 /* GPIO controller */
// BLOCK_SIZE = 4*1024

private func initIO(id: Int){
    let mem_fd = open("/dev/mem", O_RDWR|O_SYNC)
    guard (mem_fd > 0) else {
        print("Can't open /dev/mem")
        abort()
    }

    let gpio_map = mmap(
        nil,
        BLOCK_SIZE,           // Map length
        PROT_READ|PROT_WRITE, // Enable read/write
        MAP_SHARED,           // Shared with other processes
        mem_fd,               // File to map
        GPIO_BASE             // Offset to GPIO peripheral
        )

    close(mem_fd)

    let gpioBasePointer = UnsafeMutablePointer<Int>(gpio_map)
    if (gpioBasePointer.memory == -1) {    //MAP_FAILED not available, but its value is (void*)-1
        print("mmap error: " + String(gpioBasePointer))
        abort()
    }
    
    gpioGetPointer = gpioBasePointer.advancedBy(13)
    gpioSetPointer = gpioBasePointer.advancedBy(7)
    gpioClearPointer = gpioBasePointer.advancedBy(10) 

    inited = true
}
```

当映射从 `0x20200000 ` 开始的 4KB 区域后，我们获得三个感兴趣的寄存器地址，之后可以通过内存属性来读取或者写入这些值了。

<a name="pointer_arithmetic"></a>
### 指针计算

使用指针运算来移动序列或者获取一个复杂变量特定成员的引用，在 C 语言中非常常见，我们可以在 Swift 做到吗？

当然可以，`UnsafePointer `和它的可变变量，提供了一些方便的方法，允许像 C 语言那样对指针使用增加或者修改的计算操作：
`successor()`, `predecessor()`, `advancedBy(positions:Int)` 和 `distanceTo(target:UnsafePointer<T>)`。

```swift
var aptr = UnsafeMutablePointer<CChar>.alloc(5)
aptr.initializeFrom([33,34,35,36,37])

print(aptr.successor().memory) // 34
print(aptr.advancedBy(3).memory) // 36
print(aptr.advancedBy(3).predecessor().memory) // 35

print(aptr.distanceTo(aptr.advancedBy(3))) // 3

aptr.destroy()
aptr.dealloc(5)
```

但是说老实话，即使我提前展示了这些方法，并且这些是我推荐给你使用的方法，但是还是可以增加或者减少一个 UnsafePointer(不是很 Swift 化)，来得到指针从而获得序列中的其他元素：

```swift
print((aptr+1).memory) // 34
print((aptr+3).memory) // 36
print(((aptr+3)-1).memory) // 35
```

> 从 [GitHub](https://github.com/uraimo/Swift-Playgrounds/tree/swift2)或者[zipped](https://www.uraimo.com/archives/2016-04-07-Swift-And-C.zip)获取 Swift/C 混合编码的 playground。

<a name="working_with_strings"></a>
## 字符串操作

我们现在已经知道，当一个 C 函数有一个 char 指针的参数时，这个参数将在 Swift 被转换成`UnsafePointer<Int8>`, 但是自从 Swift 可以自动地将字符串转换 UTF8 缓存的指针后，你也可以使用字符串作为指针调用这些函数，而不需要提前手动进行转换。

另外，如果你在调用一个需要 char 指针的函数之前，需要对这个指针进行附加的操作，Swift 的字符串提供了`withCString `方法，传入一个 UTF8 字符缓存给一个闭包，这个闭包返回一个可选值。

```swift
puts("Hey! I was a Swift string!") // 传入 Swift 字符串到 C 函数中

var testString = "AAAAA"

testString.withCString { (ptr: UnsafePointer<Int8>) -> Void in
    // Do something with ptr
    functionThatExpectsAConstCharPointer(ptr)
}
```

可以直接把一个 C 字符串转换成一个 Swift 字符串，只需要使用 String 静态方法`fromCString`，需要注意的是，C 字符串必须有**空终止字符串**。(译者注：字符串以"\0"结束)。

```swift
let swiftString = String.fromCString(aCString)
```

如果你想在 Swift 中植入一些 C 代码，用来处理字符串，比如处理用户输入，你可能有需求比较字符串中每个字符和一个单独的 ASCII码或者一个ASCII返回，这些操作，能在把字符串设计为结构体的 Swift 代码中实现吗？

答案是肯定的，但是我不在这里对 Swift 的字符串展开深入的探讨，如果你想学到更多关于 Swift 是结构体的知识点，请查看[Ole Begemann](http://oleb.net/blog/2014/07/swift-strings/)和[Andy Bargh](http://andybargh.com/unicode/)的文章获取更多的知识。

下面看一个例子，我们定义了一个函数，判断一个字符串是否只由基本可以打印的 ASCII 字符组成，这样我们可以在 C 的代码中使用这个字符串：

```swift
func isPrintable(text:String)->Bool{
    for scalar in text.unicodeScalars {
        let charCode = scalar.value
        guard (charCode>31)&&(charCode<127) else {
            return false // Unprintable character
        }
    }
    return true
}
```

在 C 中，字符整型值和一个 ASCII 组成的字符串中的每个字符之间的比较，换到 Swift 代码中并没有改变很多，是使用的每个字符串的 unicode 值进行的比较。需要注意的是。需要明确的是，这个方法只能在字符串是由单个标量单位支持时候有用，不是通用的。

那么在字符和他们的数字 ascii 值之间如何进行转换呢？

为了转换一个数字为对应的`字符`或者`字符串`时，我们首先要把它转换成`UnicodeScalar`，然后更加紧凑的方式是使用`UInt8 `提供的特定的构造函数：

```swift
let c = Character(UnicodeScalar(70))   // "F"

let s = String(UnicodeScalar(70))      // "F"

let asciiForF = UInt8(ascii:"F")       // 70
```

上面例子中的 guard 语句可以改成`UInt8(ascii:)`增加可读性。

<a name="working_with_functions"></a>
## 函数操作

在字符串一节我们可以看到，Swift 自动将作为参数的 C 函数指针变成闭包，但是有一个主要的缺点是，闭包被用作 C 函数指针参数时，*不能捕获任何在上下文外的值*。

为了对此进行约束，这种类型的闭包（这种闭包是从 C 函数指针转换而来），被自动的加上一个特定特定类型属性`@convention(c)`, 在 [Swift 语言参考](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Attributes.html#//apple_ref/doc/uid/TP40014097-CH35-ID347)中类型属性章节中有详细描述，表示调用时候闭包必须遵从的约定，可能的值有：`c`，`objc` 和 `swift`。

另外存在一个可选的方案来解决这个限制，在 Chris Eidhof 的[这篇文章](http://chris.eidhof.nl/posts/swift-c-interop.html)中可以看到，使用一个基于代码块(block-based)函数，如果你是在一个基于 Darwin 的系统上调用一个函数就会有一个代码块的变量，传入一个保持环境的对象到函数中，同时遵守了常见的 C 模式。

接下来我们简要说说可变参数函数。

Swift 不支持传统的 C 可变参数函数，可以肯定的是，在你第一次试图调用类似于`printf`之类的可变参数函数时，Swift 将在编译时就报错。如果你真的需要调用它们，唯一可行的方案是创建一个 C 的包裹函数，限制参数的数量或者使用*va_list*（Swift 支持）来间接接受多个参数。

所以，即使`printf`不能工作，但是`vprintf `或者其他支持`va_list`的函数可以在 Swift 中工作。

为了把数组参数或者一个可变的 Swift 参数列表转换为`va_list`指针，每一个参数必须实现`CVarArgType `，然后你只需要调用`withVaList `来获取`CVaListPointer `，这个指针指向你的参数列表(`getVaList `也可以用但是文档推荐尽量不使用它)。让我们看看一个使用`vprintf`的例子：

```swift
withVaList(["a", "b", "c"]) { ptr -> Void in
    vprintf("Three strings: %s, %s, %s\n", ptr)
}
```

<a name="unmanaged"></a>
### Unmanaged

我们已经或多或少了解有关指针的知识点，但仍然不可避免存在一些我们已知却无法处理的事项。

如果我们把一个 Swift 引用对象作为参数，传递给一个在回调中返回结果的函数中，会怎么样呢？我们能保证，在切换上下文时，Swift 对象仍然在哪里，而 ARC 没有释放它吗？答案是不能，我们不能做假设，这个对象仍然存在在哪里。

使用`Unmanaged `，使用一个带有一些有趣的工具方法的类，来解决上面我们提到的情况。带有*Unmanaged*你可以改变对象的引用计数，在你需要它的时候转换为`COpaquePointer `。

让我们来看一个实际的案例，这里有一个前面我们描述有这个特性的 C 函数：

```c
// cstuff.c
void aCFunctionWithContext(void* ctx, void (*function)(void* ctx)){
    sleep(3);
    function(ctx);
}
```

然后使用 Swift 代码来调用它：

```swift
class AClass : CustomStringConvertible {
    
    var aProperty:Int=0

    var description: String {
        return "A \(self.dynamicType) with property \(self.aProperty)"
    }
}

var value = AClass()

let unmanaged = Unmanaged.passRetained(value)
let uptr = unmanaged.toOpaque()
let vptr = UnsafeMutablePointer<Void>(uptr)

aCFunctionWithContext(vptr){ (p:UnsafeMutablePointer<Void>) -> Void in
    var c = Unmanaged<AClass>.fromOpaque(COpaquePointer(p)).takeUnretainedValue()
    c.aProperty = 2
    print(c) //A AClass with property 2
}
```

使用`passRetained `和`passUnretained `方法，`Unmanaged `保持了一个给定的对象，对应的增加或者不增加它的引用计数。

因为回调需要一个 void 指针，我们首先使用`toOpaque()`获取`COpaquePointer `，然后把它转换为`UnsafeMutablePointer<Void>`。

在回调中，我们做了相反的转换，获取到指向原始类的引用，然后修改它的值。

我们从未管理的对象提取出类，我们可以使用`takeRetainedValue `或者`takeUnretainedValue `，使用上面描述的相似的手法，对应地减少或者取消未修改的值的引用计数。

在这个例子中，我们没有减少引用计数，所以即使跳出了闭包的范围，这个类也不会被释放。这个类将通过未管理的实例中进行手动释放。

这只是一个简单的，或许不是最好的案例，用来表示 Unmanaged 可以解决的一系列问题，想要获取更多的Unmanaged信息，请查看[NSHipster](http://nshipster.com/unmanaged/)的文章。

<a name="working_with_files"></a>
## 文件操作

在一些平台上，我们可以直接使用标准 C 语言库中的函数处理文件，让我们看看一些读取文件的例子吧：

```swift
let fd = fopen("aFile.txt", "w")
fwrite("Hello Swift!", 12, 1, fd)

let res = fclose(file)
if res != 0 {
    print(strerror(errno))
}

let fd = fopen("aFile.txt", "r")
var array = [Int8](count: 13, repeatedValue: 0)
fread(&array, 12, 1, fd)
fclose(fd)

let str = String.fromCString(array)
print(str) // Hello Swift!
```

从上面的代码你可以看到，关于文件访问没有什么奇怪的或者复杂的操作，这段代码和你使用 C 语言编码是差不多的。需要注意的是我们可以完全获取错误信息和使用相关的函数。

<a name="bitwise_operations"></a>
## 位操作

当你和 C 进行互调时候，有很大的可能会进行一些位操作，我推荐一篇之前写的[文章](https://www.uraimo.com/2016/02/05/Dealing-With-Bit-Sets-In-Swift/)，覆盖到了这方面你想了解的知识点。

<a name="swift_and_c_mixed_projects"></a>
## Swift 和 C 的混合项目

Swift 项目可以使用一个桥接的头文件来访问 C 库， 这个做法与使用 Objective-C 库是类似的。

但是这种方法不能用在框架项目中，所以我们采用一个更通用的替代方法，不过需要一些简单的配置。我们将创建一个 LLVM 模块，其中包含一些我们要导入到 Swift 的 C 代码。

假设我们已经在 Swift 项目中添加了 C 代码的源文件：

```c
//  CExample.c
#include "CExample.h"
#include <stdio.h>

void printStuff(){
    printf("Printing something!\n");
}

void giveMeUnsafeMutablePointer(int* param){ }
void giveMeUnsafePointer(const int * param){ }
```

和对应的头文件：

```c
//  CExample.h
#ifndef CExample_h
#define CExample_h

#include <stdio.h>
#define IAMADEFINE 42

void printStuff();
void giveMeUnsafeMutablePointer(int* param);
void giveMeUnsafePointer(const int * param);

typedef struct {
    char name[5];
    int value;
} MyStruct;

char name[] = "IAmAString";
char* anotherName = "IAmAStringToo";

#endif /* CExample_h */
```

为了区分 C 源代码和其他代码，我们在项目根目录中建立了* CExample*文件夹，把 C 代码文件放到里面。

我们必须在这个目录下创建一个*module.map*文件，然后这个文件定义了我们导出的 C 模块和对应的 C 头文件。

```c
module CExample [system] {
    header "CExample.h"
    export *
}
```

你可以看到，我们导出了头文件定义的所有内容，其实模块可以在我们需要的时候部分导出。

此外，这个例子中实际的库文件源码已经包含在项目中了，但是如果你想导入一个在系统中存在的库到 Swift 中的话，你只需要创建一个*module.map*（不需要在源码的目录下创建），然后指定头文件或者系统的头文件。只是你需要在 modulemap 文件中使用`link libname`指令指定这个库的头文件名和具体的库的关联关系(和你手动使用 *-llibname* 一样去链接这个库)。然后你也可以在一个*module.map*中定义多个模块。

想学习更多的关于 LLVM 模块和所有选项的信息，请查看[官方文档](http://clang.llvm.org/docs/Modules.html)。

最后一步是把模块目录添加到编译器的查询路径中。你需要做的是，打开项目属性配置项，在 **Swift Compiler - Search Paths**下的**Import Paths** 中添加模块路径（*${SRCROOT}/CExample*）

然后就这样，我们可以导入这个 C 模块到 Swift 代码中，然后使用其中的函数了：

```swift
import CExample

printStuff()
print(IAMADEFINE) //42

giveMeUnsafePointer(UnsafePointer<Int32>(bitPattern: 1))
giveMeUnsafeMutablePointer(UnsafeMutablePointer<Int32>(bitPattern: 1))

let ms = MyStruct(name: (0, 0, 0, 0, 0), value: 1)
print(ms)

print(name) // (97, 115, 100, 100, 97, 115, 100, 0)
//print(String.fromCString(name)!) // Cannot convert it

print(anotherName) //0xXXXXXX pointer address
print(String.fromCString(anotherName)!) //IAmAStringToo
```

<a name="closing_thoughts"></a>
## 结束语

我希望这篇文章至少能够给你带来心中对于探索 Swift 和 C 交互这个未知世界的一些光亮，但是我也不是期望能够把你在项目过程中遇到的问题都解决掉。

你也会发现，想把事情按照预期的方向进行，你需要多做一些实验。在下个版本的 Swift 中（译者注：指 Swift 3.0），与 C 的互调会变得更强。（在 Swift 2.0 才引入的 UnsafePointer 和相关的函数，在这之前，和 C 的互调有一些困难）

用一个提示作为结束，关于  Swift Package Manager 和支持 Swift/C 混编项目，自动生成 modulemaps 来支持导入 C 模块的一个 pr 在昨天进行了合并操作，阅读[这篇文章](http://ankit.im/swift/2016/04/06/compiling-and-interpolating-C-using-swift-package-manager/)可以看到它如何进行工作。
