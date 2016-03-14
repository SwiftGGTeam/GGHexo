title: "写给初学者的 Swift 教程 Part 1"
date: 2015-11-13 09:00:00
tags: [Swift 入门]
categories: [Thomas Hanning]
permalink: swift-tutorial-for-beginners-part-1

---
原文链接=http://www.thomashanning.com/swift-tutorial-for-beginners-part-1/
作者=Thomas Hanning
原文日期=2015-10-29
译者=小铁匠Linus
校对=千叶知风
定稿=numbbbbb
发布时间=

<!--此处开始正文-->

Swift 是苹果官方新推出的编程语言，它可以为 iOS、 watchOS、 tvOS 和 Mac OS 开发应用。在本教程中，你将会学到所有的基础操作。

<!--more-->

## 你将在这个“Swift 初学者教程”中学到些什么呢？

本教程包含了以下这些话题：

* 下载 Xcode
* Playgrounds
* Hello World!
* 变量
* 常量
* 类型标注
* 条件语句
* 循环语句
* 可选类型
* 函数

将会有更多内容出现在“写给初学者的 Swift 教程”系列中。

本教程源码下载: [来自小铁匠的代码](https://github.com/kevin833752/MyTranslationPlaygrounds/tree/master/Swift_Tutorial_For_Beginners_Part_1.playground)
## 下载 Xcode

成为 Swift 大牛的第一步当然是下载 Xcode 啦。你可以直接从 App Store 里下载。Xcode 是苹果官方的 IDE 工具，它可以为 iOS、 watchOS、 tvOS 和 Mac OS 这些平台开发应用。

## Playgrounds

你会把大部分编程的时间花在具体项目上。但是，Xcode 有一个非常有趣的特性，可以给初学者和大牛带来巨大帮助，它就是 Playgrounds。你可以在 Playground 里写 Swift 代码，写完就直接能看到执行的结果。因此，如果你想要学一些新特性或试验一些新功能，可以打开 Playground 直接编写，不用像在工程里那样先编译再执行。

如果你正在写一个项目，那也可以同时打开一个 Playground，你可以在 Playground 里快速试验一些小功能。

言归正传，讲讲如何使用 Playground。第一步打开 Xcode，接着在欢迎界面点击“Get started with a playground”。如果你没有看到这个欢迎界面，可以按 File -> New -> Playground 这样的路径打开 Playground。指定 Playground 的文件名和保存位置之后，你就可以开始写代码啦。

## Hello World!

在大多数的编程书籍中，都把打印“Hello World!”作为第一个项目。我们也不会打破这个传统的，哈哈。

因此，我们在 playground 里写下如下代码：

```swift
print("Hello World!")
```

输完这行代码，你就可以在 playground 的右边看到输出的结果。

![](/img/articles/swift-tutorial-for-beginners-part-1/Screen-Shot-2015-10-03-at-18.26.55-1024x636.png1447379896.6408916)

恭喜，你已经成功编写了第一个 Swift 程序！

## 变量

在打印出第一句代码后，我们可以开始真正的编程啦。你需要从变量开始。变量可以存储一个值，比如数字或字符串。可以使用`var`关键字来定义变量：

```swift
var aNumber = 5
```

这样，我们就有了一个叫`aNumber`的变量，它的值为 5。接着，我们可以尝试着改变这个变量的值：

```swift
aNumber = 10
```

我们也可以把一个数学表示式的结果存到这个变量里：

```swift
aNumber = 5 + 6
```

当然也可以把变量的值打印出来，这需要用到特殊的术语，如下：

```swift
print("The number is equal \(aNumber)")
```

变量可以有不同的类型。你可以为变量指定类型，比如字符串、浮点数或者布尔值：

```swift
var aString = "A String"
var aDoble = 13.3
var aBool = true
```

但是，一旦你给变量赋了某一类型的值之后，就只能为变量赋相同类型的值了：

```swift
aBool = "A String" //编译错误
```

编译器是一段可以把你写的代码翻译成机器码的程序。如果你写了一段编译器不能理解或者违反编程规则的代码，编译器就会报错。

## 常量

顾名思义，变量的值是可以改变的，而常量的值在第一次赋值后就不能修改了。对于常量，你可以使用关键字`let`来定义：

```swift
let aConstantNumber = 10
```

如果你尝试修改一个常量的值，就会报错：

```swift
aConstantNumber = 10 //编译出错
```

那为什么还要有常量呢？因为，有时候并不希望一个值在第一次赋值后被修改，比如，在指定一个人的姓名后，就不希望这个值被再次修改。

## 类型标注

我们已经知道，变量在第一次赋值之后会确定类型。当然，我们也可以在赋值时直接指定变量或常量的类型：

```swift
let aNumber: Int = 10
```

这个代码的结果和之前的是一样的，但是现在这段代码更加容易读懂。第一眼就知道这个变量的类型是`Int`。当然， 除了`Int`，还有许多其他的类型：

```swift
var aString: String = "A String"
var aDouble: Double = 13.3
var aBool: Bool = true
```

## 条件语句

一个程序如果总是做相同的事情，这很无聊。因此，出现了所谓的条件语句来控制程序的流向。比如，你想要根据计算的结果有不同的输出。能控制程序流向的，也是最普遍的条件语句是`if`条件语句，举例如下：

```swift
var number1 = 5
var number2 = 10
 
if number1 < number2 {
    print("number1 is smaller than number2")
}
```

在这段示例代码中，我们通过`if`条件语句来判断`number1`是否小于`number2`。如果满足这个条件的话，程序就会执行到大括号括起来的 if 代码块里。你也可以在代码块里添加你想要执行的代码。

另外，你还可以在`if`条件判断返回`false`的代码块里写相应代码：

```swift
var number1 = 5
var number2 = 10
 
if number1 < number2 {
    print("number1 is smaller than number2")
} else {
    print("number1 is not smaller than number2")
}
```

当然，你可以写多个`if`条件语句：

```swift
if number1 < number2 {
    print("number1 is smaller than number2")
} else if number2 < number1 {
    print("number2 is than number2")
} else {
    print("number1 is equal number2")
}
```

Swift 里另外一种条件语句是`switch`条件语句。`switch`语句的形式就是把某个值与一个或若干个值作比较，例子如下：

```swift
switch name {
case "Mick":
    print("The name is Mick")
case "John":
    print("The name is John")
default:
    print("The name is neither Mick nor John")
}
```

`switch`关键字后写上需要匹配的值`name`。然后，每个`case`后跟上可能匹配的值。如果`name`匹配了某一个值，对应`case`里的代码将被执行；否则，继续进行匹配。假如没有一个值能够匹配，就会执行`default`后的代码。对于初学者来说，知道`switch`条件语句有很多可能匹配的值就足够了。

## 循环

除了条件语句意外，还有一个控制程序流的重要结构：循环。循环的作用主要是能多次执行代码块里的代码。Swift 有三种循环的类型：while 循环, repeat-while 循环和 for 循环.

### while 循环

下面的例子使用了 while 循环：

```swift
var i = 0

while (i < 10) {
    print("Hello World")
    i = i + 1
}
```

while 循环以`while`关键字开始，在`while`关键字后跟上判断条件。如果条件为 true，会重复运行代码块里的一系列代码，比如本例子里的循环打印"Hello World"十次。如果没有修改变量`i`的值，循环将一直进行下去。

### repeat-while 循环

repeat-while 循环和 while 循环很相似。但是，不再像 while 循环那样先判断循环条件，例子如下：

```swift
var i = 10
 
repeat {
    print("Hello World")
    i = i + 1
} while (i < 10)
```

为什么要使用repeat-while 循环而不是 while 循环？repeat-while 循环和 while 循环的主要区别是在判断循环条件之前，先执行一次循环的代码块。

```swift
var i = 11
 
repeat {
    print("Hello World")
    i = i + 1
} while (i < 10)
```

上面这个例子中，尽管判断条件永远是 false，但是还是会打印一次“Hello World”。因此，有时候需要先判断，而有时候不想要先判断，这就要根据具体的情况决定到底使用哪种循环。

### for 循环

for 循环很好用，它可以对一个集合里面的每个元素执行一系列语句。同时，也有好几种遍历的方式，先来看一个例子：

```swift
for i in 1...10 {
    print("This iteration number \(i)")
}
```

如果像上面的例子一样使用三个点号（闭区间操作符）的话，最后一个数字（10）也会被包含。此外，也可以像下面的例子一样使用：

```swift
for i in 1..<10 {
    print("This iteration number \(i)")
}
```

在上面这个例子中，最后一个数字（10）不会被包含进去。另外，还有一种方式可以写 for 循环，就是标准 C 样式的 for 循环：

```swift
for var i = 1; i <= 10; i++ {
    print("This iteration number \(i)")
}
```

这个循环会执行十次。分号将循环的定义分为 3 个部分：首先，循环首次启动时，变量会被初始化，并赋一个起始值；其次，条件判断表达式被调用，如果表达式调用结果为true，则会执行大括号内部的代码；最后，执行所有语句之后，执行递增表达式，在本例中，变量`i`每次增加 1。其中，`i++`等同于`i = i + 1`。

## 可选类型

可选类型是 Swift 里很特殊的新特性，它非常重要，因此我们在一开始就要介绍它。试想一下，一个变量有可能没有值，比如，一个变量用来存储一个人的 middle name，那某人没有 middle name 的话该怎么表示呢？我们很自然的能想到赋值一个空字符串：

```swift
var middleName: String = ""
```

然而，如果我们让`middleName`成为可选类型，我们就可以为变量指定表示“这里没有值”的`nil`。可选类型的定义是在类型后面跟上问号：

```swift
var middleName: String? = nil
```

可选类型的变量可以有非空的值。但是，如果你像普通变量那样访问可选类型的变量，就会编译出错：

```swift
var anotherName: String = middleName //编译出错
```

你可以通过解包来访问，使用感叹号进行解包：

```swift
var anotherName: String = middleName!
```

值得注意的是，如果你对一个非`nil`的值进行解包，可以得到具体的值；否则，就会在运行时报错，因为不能对`nil`进行解包。

因此，最好在使用可选类型变量前先判断是否是`nil`，使用所谓的可选绑定（optional binding）就可以搞定了：

```swift
var middleName: String? = "John"
var anotherName: String = "Michael"
 
if let name = middleName {
    anotherName = name
}
```

一开始，这段代码可能看起来会有点奇怪，实际上很简单，意思也很明确：如果`middleName`等于`nil`的话，对应的代码块就不会执行。如果`middleName`不等于`nil`的话，变量`name`就会获得`middleName`的值，对应的代码块就会被执行。在代码块里，`name`就不再是可选变量了，因此可以给其他变量赋值。

## 函数

你可能经常会遇到，一些代码可以应用于许多不同的情况。而函数就是用来完成特定任务的独立的代码块，并且当函数需要执行的时候，这个名字会被用于“调用”函数。先从简单打印“Hello World”的函数开始吧：

```swift
func printHelloWorld() {
    print("Hello World!")
}
```

事实上，你把上面那段代码写到 playground 里，界面右边是没有输出的。如果你通过下面的方式调用这个函数的话，就会有对应的输出了：

```swift
func printHelloWorld() {
    print("Hello World!")
}
 
printHelloWorld()
```

如果你调用这个函数两次的话，你会看到界面右边会出现两次输出：

```swift
func printHelloWorld() {
    print("Hello World!")
}
 
printHelloWorld()
printHelloWorld()
```

你也可以给函数传递额外的信息，即传递参数。每个参数都需要指定参数名和类型，然后你就可以在函数里访问这些参数的值了：

```swift
func printANumber(number:Int) {
    print("The number is \(number)")
}
```

现在，你就可以像下面的方式调用有参数的函数了：

```swift
func printANumber(number:Int) {
    print("The number is \(number)")
}
 
printANumber(5)
```

本例中，对应的输出就是：“The number is 5”。

你甚至可以指定多个参数。然后，你在调用函数时，除了不需要写第一个参数的参数名之外，其他参数都需要写参数名：

```swift
func printNumbers(number1:Int, number2:Int, number3:Int) {
    print("The number are \(number1), \(number2), \(number3)")
}
 
printNumbers(5, number2:10, number3:15)
```

另外，函数最重要的一点就是返回值。如果需要函数有返回值，你就要指定返回值的类型，同时，返回值由`return`关键字返回。

举个例子：你需要写一个函数，实现返回两个数字中更大者的功能。大体代码如下：

```swift
func maxOfNumbers(number1: Int, number2: Int) -> Int {
    if number1 < number2 {
        return number2
    } else {
        return number1
    }
}
 
maxOfNumbers(5, number2: 10)
```

输出结果为 10。

## 接下来该干什么

现在已经基本熟悉 Swift 中大部分的基本语法了。这对之后的学习是个很重要的基础。接下来可以自己动手在 Playground 里试着写一些小功能，也可以看看关于本文知识点的其他文章：

* [该使用 Objective-C 还是 Swift？](http://www.thomashanning.com/should-you-use-objective-c-or-swift/)
* [Swift 中的常量](http://www.thomashanning.com/constants-in-swift/)
* [Swift 中的可选类型](http://www.thomashanning.com/optionals-in-swift/)

在本系列的后续部分，我们会讨论更多关于 Swift 的新特性。请继续关注!