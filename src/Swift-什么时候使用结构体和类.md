title: "Swift：什么时候使用结构体和类"
date: 2015-8-14
tags: [Swift 进阶]
categories: [mikeash.com]
permalink: friday-qa-2015-07-17-when-to-use-swift-structs-and-classes

---
原文链接=https://www.mikeash.com/pyblog/friday-qa-2015-07-17-when-to-use-swift-structs-and-classes.html
作者=Mike Ash
原文日期=2015-07-17
译者=Yake
校对=千叶知风
定稿=numbbbbb

<!--此处开始正文-->

在Swift的世界中一个一直被持续不断讨论话题就是什么时候使用结构体什么时候使用类。我想我今天要贡献一些自己的想法。

<!--more-->

## 值 VS 引用

答案其实很简单：当你需要值语义（值语义是指一个对象被系统标准的复制方式复制之后，与被复制的对象之间毫无关系，彼此独立改变且互不影响）的时候使用结构体，当你需要引用语义（引用语义是指一个对象被系统标准的复制方式复制后，与被复制的对象之间依然共享底层资源，对其中一个的改变都将影响到另外一个）的时候使用类。就是这样！

欢迎下周再来。。。

等等！

怎么了？

这没有回答这个问题

什么意思？就是这样的啊！

是的，但是。。。

但是什么？

什么是值语义和引用语义呢？

哦，这个啊。也许我接下来应该讲讲这个。

并且他们怎么和结构体和类相关联的呢？

好的。

所有的问题都归结于数据和数据被存储在什么地方。我们通常将数据存在在局部变量、参数、属性以及全局变量中。从根本上说有两种不同的方法将数据存储在所有这些地方。

值语义中，数据直接存在于被存储的位置。引用语义中，数据存在于别的地方，而存储的位置中存储着一个对数据的引用。当你获取数据的时候这种差别可能不那么明显。而当你拷贝那块存储区域时这种不同就会显现出来。值语义中，你会获的原数据的一个新拷贝，而引用语义下，你会获的同样数据的引用的一个新拷贝。

这真的很抽象。让我们来看一个例子，暂时把 Swift 的这个问题从你脑海中移除，让我们来看一个 Objective-C 的例子：

``` objectivec
@interface SomeClass : NSObject 
@property int number;
@end
@implementation SomeClass
@end

struct SomeStruct {
    int number;
};

SomeClass *reference = [[SomeClass alloc] init];
reference.number = 42;
SomeClass *reference2 = reference;
reference.number = 43;
NSLog(@"The number in reference2 is %d", reference2.number);

struct SomeStruct value = {};
value.number = 42;
struct SomeStruct value2 = value;
value.number = 43;
NSLog(@"The number in value2 is %d", value2.number);\
```

打印结果：

``` objectivec
The number in reference2 is 43
The number in value2 is 42
```

为什么会有这样的差异呢？

代码`SomeClass *reference = [[SomeClass alloc] init]`在内存中创建了一个新的`SomeClass`类型的实例，然后将这个实例对象的引用赋值给变量。代码`reference2 = reference`是将刚刚这个实例对象的引用赋值给一个新的变量。现在两个变量都指向了同一个对象，而`reference.number = 43`修改存储在那个实例对象的`number`属性的值。所以当打印对象的`number`属性值时，结果是`43`。

代码`struct SomeStruct value = {}`创建了`SomeStruct`的一个实例并赋值给变量。代码`value2 = value`是拷贝那个实例对象的数据给第二个变量。每个变量都包含了一块独立的数据。代码`value.number = 43`只修改了`value`变量中的数据，所以当打印`value2`的`number`时结果仍然是`42`。

这个例子对应的 Swift 代码如下：

``` swift
class SomeClass {
    var number: Int = 0
}

struct SomeStruct {
    var number: Int = 0
}

var reference = SomeClass()
reference.number = 42
var reference2 = reference
reference.number = 43
print("The number in reference2 is \(reference2.number)")

var value = SomeStruct()
value.number = 42
var value2 = value
value.number = 43
print("The number in value2 is \(value2.number)")
```

和之前的打印结果一样：

``` swift
The number in reference2 is 43
The number in value2 is 42
```

## 值类型的体验

值类型其实并不是一个新的概念，但是对于很多人来说他们觉得这是新概念。为什么呢？

大多数 Objective-C 代码中结构体并不是很常用。我们通常通过`CGRect`或者`CGPoint`以及其他类似结构的形式接触他们，但是一般不会创建我们自己的结构体。其中的一个原因是他们其实并不是那么实用。想要用 Objective-C 语言将一个对象的引用正确地存储在一个结构体中真的是一件很困难的事情，尤其是在使用 ARC 的情况下。

很多其他的语言根本没有类似`struct`这样的类型。很多认为“一切皆对象”的语言如 Python、JavaScript 等也都只有引用类型。如果你是从那样的语言转而学习 Swift 的，这个概念对你来说可能会更陌生。

但是别急！有一种情况是几乎所有的语言都使用值类型：数字！下面的例子就连刚开始学习编程几周的程序员都不会觉得陌生，我们先抛开语言：

``` swift
var x = 42
var x2 = x
x++
print("x=\(x) x2=\(x2)")
// prints: x=43 x2=42
```

这对我们来说是那么的明显和自然以至于我们根本没有觉察到他表现得有些不同，但是它就那样展现在我们面前。只要你在编程你就在跟值类型打交道，虽然有可能你没有意识到！

很多语言实际上把数字作为引用类型来实现，因为他们坚持“一切皆对象”的哲学。不管怎样，他们是不可变类型，而值类型和不可变引用类型之间的区别很难察觉。他们表现得跟值类型很像，即使他们不是像值类型那样实现的。

这是关于理解值类型和引用类型的相当大的一部分内容。就语言的语义来说，只有在数据被改变的时候他们的差异才会有影响。但是如果你的数据是不可变的，那么值类型和引用类型的差别就不存在了，至少问题就转向性能而不是语法了。

这甚至出现在了 Objective-C 中的标记指针（tagged pointers）中。就像标记指针中那样，一个对象存储在一个指针的值中，这是个值类型。拷贝存储区域就拷贝了对象。这个差别不明显，因为 Objective-C 库很小心地只在不可变类型中加入了标记指针。一些`NSNumbers`对象是引用类型，另外一些则是值类型，但是这并没有什么差别。

## 做出选择

现在我们知道值类型是怎么工作的了，你怎么选择你自己的数据类型呢？

从根本上讲这两者的区别就是当你在他们身上使用等号的时候发生了什么。值类型被拷贝，而引用类型只是获得另外一个引用。

因此当决定使用哪种数据类型时根本上要问的问题就是：拷贝这个类型有意义吗？你想方便地使用拷贝操作并且会频繁使用吗？

先让我们来看一些比较极端的，明显的例子。`Integer`明显是可以被拷贝的，他们应该是值类型的。网络套接字明显不能被拷贝，他们应该是引用类型。`point`中的`x`,`y`是可以拷贝的，他们应该是值类型。一个代表着磁盘的控制器明显不能被拷贝，他们应该是引用类型。

有些类型可以被拷贝但是你不想拷贝一直发生。这就表明他们应该是引用类型的。例如，屏幕中的一个按钮在概念上是应该能被拷贝的。但是拷贝的按钮跟原始的那个并不完全一样。你点击拷贝的按钮并不会触发原始的那个。拷贝的按钮也不会占据原始按钮在屏幕中的位置。那就意味着你的`button`应该是引用类型的。

`View`和`window controllers`就是一个类似的例子。他们可能是可拷贝的，这是极为有可能的，但是你几乎永远都不想那么做，所以他们应该是引用类型的。

模型类会怎么样呢？你可能有一个`User`类型来代表你系统的用户，或者一个`Crime`类型代表一个`User`的动作。这肯定是可拷贝的，所以他们应该是值类型的。然而，你可能想将程序中某个地方用户的操作更新到到程序的另外一个地方使其可见。这意味着你的用户应该被某个引用类型的`user controller`进行管理。

集合是个有趣的例子。他们包含了数组，字典还有字符串。他们是可拷贝的吗？很明显是。你想让拷贝成为一项便捷又频繁的操作吗？那就不是很明确了。

大多数语言对这个问题说“no”并把他们的集合设定为引用类型。这在  Objective-C、Java、Python、JavaScript 以及任何我能想到的语言中都是这样的(一个主要的例外就是 C++ 中的 STL 集合类型，但是 C++ 是语言界的奇葩，它总是表现得跟大家不一样)。

Swift 对此说“yes”，那也就意味着`Array`,`Dictionary`和`String`都是结构体而不是类。当他们被赋值以及作为参数被传递的时候都会被拷贝。如果拷贝的代价很小的话这绝对是明智的决定，而这也正是 Swift 很努力要做到的。

## 嵌套类型

当嵌套值和引用类型的时候有四种不同的组合。只这其中的一种就会让你的生活变的很有趣。

如果你有一个引用类型嵌套了另外一个引用类型，没有什么特别的事会发生。像通常那样，任何一个指向内部或者外部值的指针都能操纵他指向的对象。只要其中一个引用操纵值使其改变，其他引用指向的值也就跟着变了。

如果你有一个值类型嵌套了另外一个值类型，这就会有效地使值所占的内存区域变大。内部值是外部值的一部分。如果你把外部值放到一块新的存储空间里，所有的值包括内部值都会被拷贝。如果你把内部值放进一块新的存储空间中，只有内部值会被拷贝。

一个引用类型嵌套了一个值类型会有效扩大这个引用类型所占内存区域。任何指向外部值的指针都可以操纵一切，包括嵌套的内部值。内部值的任何改变对于引用外部值的指针来说都是可见的。如果你把内部值放进一块新的存储区，就会在那块存储区拷贝一份新的值。

一个值类型嵌套一个引用类型就没有那么简单了。你可以有效地打破值语义而不被察觉。这可能是好的也可能是坏的，取决于你怎么做。当你把一个引用类型嵌套进一个值类型中，外部值被放进一块新的内存区域时就会被拷贝，但是拷贝的对象仍然指向原始的那个嵌套对象。下面是一个举例：

``` swift
class Inner {
    var value = 42
}

struct Outer {
    var value = 42
    var inner = Inner()
}

var outer = Outer()
var outer2 = outer
outer.value = 43
outer.inner.value = 43
print("outer2.value=\(outer2.value) outer2.inner.value=\(outer2.inner.value)”)
```

打印结果如下：

``` swift
outer2.value=42 outer2.inner.value=43
```



尽管`outer2`获取了`value`的一份拷贝，它只拷贝了`inner`的引用，因此两个结构体就共用了同一个`inner`对象。这样一来当改变`outer.inner.value`的值也会影响`outer2.inner.value`的值。哎呀！

这个行为会很有用。当你小心使用，你创建的结构体就具有写时拷贝功能（只有当你执行`outer2.value = 43`时才会真正的产生一个副本，否则`outer2`与`outer`仍指向共同的资源），这种高效的值语义的实现不会使数据拷贝得到处都是。Swift 中的集合就是这么做的，你也可以自己创建一个这样的类型。想要了解更多请看[让我们构建Swift数组](https://www.mikeash.com/pyblog/friday-qa-2015-04-17-lets-build-swiftarray.html).

这也可能会很危险。例如，我们正在创建一个`Person`对象。这是一个模型类所以明显是可拷贝的，所以它可以是结构体。按照通常的做法，你把Person类的name设置为NSString类型

``` swift
struct Person {
    var name: NSString
}
```

然后你创建两个`Person`对象，并且分不同的部分创建名字：

``` swift
let name = NSMutableString()
name.appendString("Bob")
name.appendString(" ")
name.appendString("Josephsonson")
let bob = Person(name: name)

name.appendString(", Jr.")
let bobjr = Person(name: name)
```

打印这两个名字：

``` swift
print(bob.name)
print(bobjr.name)
```

打印结果：

``` swift
Bob Josephsonson, Jr.
Bob Josephsonson, Jr.
```

哎呀！

发生了什么？不像 Swift 的`String`类型，`NSString`是一个引用类型。它是不可变的，但是他有一个可变的子类，`NSMutableString`。当`bob`被创建时，它创建了一个对`name`中持有的字符串的引用。接下来当那个字符串被改变时，这个改变通过`bob`是可见的。注意这有效地改变了`bob`，即使它是存储在`let`语句中的常量类型。但是它没有真的改变`bob`,只是改变了`bob`所引用的一个值，但由于那个值是`bob`的数据中的一部分，从语感上讲，这看起来像是改变了`bob`。

这种事在 Objective-C 中一直都在发生。每一位有些经验的 Objective-C 程序员都会有这样的习惯，在所有地方都采用保护性的`copy`来修饰属性。由于`NSString`实际上可能是`NSMutableString`类型，你将属性设置为`copy`，或者在你自己的初始化方法中写具体的`copy`实现，来避免一些问题的产生。这同样适用于可变的集合类型。

在 Swift 中，在这儿的结论就更简单了：使用值类型而不是引用类型。在这个例子中，将`name`作为`String`类型。那么你就不用担心不经意间产生的共享引用了。

## 结论

无论什么时候只要你移动一个值类型，它都会被拷贝，而引用类型只是产生了对同样的底层对象的一个新的引用。那也就意味着引用类型的改变对所有其他的引用都是可见的，而改变值类型只影响你改变的那块内存区域。当选择使用哪种类型时，考虑你的类型是否适合被拷贝，当类型从本质上来说是可拷贝时倾向使用值类型。最后，记住如果你在值类型中嵌入引用类型，不小心的话就会出错！