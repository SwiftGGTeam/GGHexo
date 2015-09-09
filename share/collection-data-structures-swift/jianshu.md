Swift 集合数据结构性能分析

> 作者：Ellen Shapiro，[原文链接](http://www.raywenderlich.com/79850/collection-data-structures-swift)，原文日期：2015/04/21
> 译者：[Yake](http://blog.csdn.net/yake_099)；校对：[shanks](http://codebuild.me/)；定稿：[numbbbbb](https://github.com/numbbbbb)
  








假设你有一个需要处理许多数据的应用。你会把数据放在哪儿？如何高效地组织并处理数据呢？

如果你的项目只处理一个数字，可以把它存在一个变量中。如果有两个数字你就要用两个变量。
如果有 1000 个数字、10000 个字符串或者终极模因库呢（能立刻找到一个完美的模因多爽啊）？在这些情况下，你将会需要一种基本的集合类数据结构。幸运的是，这篇教程会告诉你该怎么做。



下面是这篇教程的结构：

* 复习什么是数据结构并学习大 O 符号。这是用来描述不同的数据结构性能的标准工具。
* 下一步：衡量数组、字典和集合这些 Cocoa 开发中最基本的数据结构的性能。同时本文也会介绍一些基础的性能测试的方法。
* 继续学习，你将会比较成熟的 Cocoa 数据结构与对应的纯 Swift 结构的性能。
* 最后，简要地复习一下 Cocoa 中提供的一些相关类型。我们来看看你平时非常熟悉的数据结构有什么你不知道的东西。

![你觉得这些数据结构性能如何？](http://swift.gg/img/articles/collection-data-structures-swift/data-structures-square-250x250.png)


## 开始

深入探索 iOS 中的数据结构之前，需要复习一下它们是什么，以及怎么测量它们的性能。

有许多集合类数据结构类型，每个类型都会用一个特定的方法组织并获取数据集合。集合类型可能会使一些操作变得十分高效，例如添加新的数据、查找最小的数据以及保证不会重复添加数据。

没有集合数据类型，你将会陷入试图管理每个数据的困境中。集合能够让你：
* 将所有的数据作为一个实体来处理
* 给它们设置一些结构
* 高效地插入、删除和检索数据

### 什么是大 O 标记

大 O，说的是字母 O，而不是数字 0。这个符号用来描述在某种数据结构上执行某种操作的效率。有很多种衡量效率的方法：你可以衡量这种数据结构消耗了多少内存、在最坏的情况下消耗的时间、它花费的平均时间是多少等等。

在这篇教程中，你将会统计操作的平均时长。

通常，数据量增加不会使操作变快。大多数情况下是相反的，但有时候变化很小甚至没有差别。大 O 标记用来精确地描述这种情况。你能用一个具体的函数来表示运行时间和数据量的关系。

大 O 标记被写作`O(与 n 相关的函数)`，括号中的`n`就表示数据结构中数据的数量，而`与 n 相关的函数`则大约表示操作将要消耗的时间。

“大约”，确实有点讽刺，但是它有特定的含义：当`n`非常大时函数的渐进值。假设`n`是很大很大的数，当你将参数从`n`修改为`n + 1`时，考虑一些操作的性能会怎样变化。

> 注意：这些都是算法复杂度分析中的一部分，如果你想深入探索的话，就多读些计算机科学类的书籍。这样你会掌握一些分析复杂度的数学方法、不同效率之间的微小差异、关于未知机器模型的更细化公式的假设以及许多你能想到或想不到的有趣的东西。

常见的大 O 性能测量如下（性能由高到低）：

* **O(1)(常数时间)**：无论数据结构中有多少数据，这个函数都调用同样次数的操作。这是**最理想的性能**。
* **O(log n)(对数)**: 这个函数调用的操作次数随着数据结构中的数据量对数级增长。这已经是**很好的性能**了，因为相比较数据结构中的数据的数量它的增长速度要慢得多。
* **O(n)（线性）**：函数调用的操作次数随着数据结构的数据量线性增长。这是比较好的性能，但是如果数据集合较大就不合适了。
* **O(n (log n))**：这个函数调用的操作次数是由数据结构中的数据量的对数乘以数据结构中的数据量。可以预见的是，这是现实中对性能的最低容忍度。较大的数据结构会执行更多的操作，对于数据量较小的数据结构来说增长是较为合理的。
* **O(n²)（平方）**：这个函数调用操作的次数是数据量的平方 - 这算是比较差的性能中最好的一个。哪怕你处理的数据集很小，它也会很快变慢。
* **O(2^n)（指数）**：函数调用的操作次数与数据量是`2`的`n`次方的关系。这会导致很差的性能并很快就变得特别慢。
* **O(n!) (阶乘)**：函数调用的操作次数与数据量之间是阶乘的关系。实际上，这是性能最差的情况。例如，在一个有 100 个数据的结构中，操作次数是一个长度为`158`的数字。

下面是一个更直观的性能图。当集合中的数据量从`1`变化至`25`时，性能会如何变化：

![图片](http://swift.gg/img/articles/collection-data-structures-swift/Screen-Shot-2014-09-14-at-11.54.21-AM-700x460.png)

你有没有发现你几乎看不到绿色的`O(log n)`线？因为在这个范围内它几乎与理想的`O(1)`重合。那太好了！另一方面，`O(n!)`和`O(2^n)`标记的操作性能下降得特别快，当集合中数据超过`10`操作的数量就开始飙升。
是的！正如图表中清楚展示的，你处理的数据越多，选择正确的数据结构就越重要。

现在你已经知道怎么比较基于某种数据结构的数据操作的性能了。下面我们来复习一下 iOS 中最常用的三种数据类型以及它们在理论和实践中是如何发挥作用的。

## 常见 iOS 数据结构

iOS 中三种最常用的数据结构是数组、字典和集合。首先你要考虑它们在理论上和基础类型的区别，然后需要测试 iOS 中对应的实现类的性能。

对于这三种主要结构的类型来说，iOS 提供了多种具体的类来支持抽象的结构。除了在 Swift 和 Objective-C 中旧的 Foundation 框架中的数据结构，现在又有了新的仅支持 Swift 版本的数据结构。

Foundation 中的数据结构已经存在了很久，即使数据量很大，创建速度也很快。然而，Swift 中的数据结构查询速度更快。如何选择取决于你需要的操作类型。

### 数组

数组就是以一定顺序排列的一组数据，你可以通过索引来获取每一个数据元素，索引代表数据在排列中的位置。当你在数组变量名称后面的括号中写上索引时，这就叫做下标。

在 Swift 中，如果你用`let`将数组作为常量来定义，它们就是不可变的，如果用 `var` 定义为变量它们就是可变的。

作为对比，Foundation 框架中的 `NSArray` 默认是不可变类型，如果你想在数组创建之后添加、删除或者修改数据，必须使用可变类 `NSMuatbleArray`。

`NSArray` 是异构的，意味着它可以包含不同类型的 Cocoa 对象。 Swift 数组是同构的，意味着每一个 Swift 数组都只包含一种类型的对象。

不过，你仍然可以将一个类型定义为 `AnyObject` 类型，这样 Swift 数组就可以存储可变的 Cocoa 对象类型。

### 期望性能、数组使用指南

使用数组来存储变量的一个首要原因是顺序很重要。例如，你会通过名或者姓来排列联系人、按日期写一个计划列表或者任何需要通过某种顺序来查找和展示数据的场景。

苹果的文档在[CFArray header](http://www.opensource.apple.com/source/CF/CF-550.13/CFArray.h)一篇中阐明了三种关键操作的期望性能：

* 在数组中通过一个特定的索引获取值的时间复杂度最坏是`O(log n)`，但通常应该是`O(1)`。
* 搜索一个未知索引的对象的时间复杂度最坏是`O(n (log n))`，但一般应该是`O(n)`。
* 插入或者删除一个对象最坏的时间复杂度是`O(n (log n))`，但经常是`O(1)`。

这些保证了数组基本上和你在计算机教材或者是 C 语言中学到的那样，总是一段连续内存中的数据序列，是一种“理想型”数组。

这点对你理解文档很有帮助。

下面这些可以帮助你更好地理解文档中的期望性能：

* 当你已经知道一个数据在哪儿并且需要查找时，那应该是很快的。
* 如果你不知道某个数据在哪儿，你可能需要将数组从头到尾遍历一遍，查找的过程可能会比较慢。
* 如果你知道要把某个数据添加到哪里或者从哪儿删除，那不是很困难，虽然后来你可能需要调整数组的剩余部分，那得花费些时间。

这些期望与现实是一致的吗？继续往下看：

### 示例 App 测试结果

从这篇教程中下载[示例项目](http://cdn1.raywenderlich.com/wp-content/uploads/2014/11/DataStructures_Swift_1_22.zip)并在 Xcode 中打开。里面有些方法可以创建或/和测试数组，并且展示给你执行每个任务消耗的时间。

需要注意的是：在应用中，测试配置会自动将优化选项设置成和发布配置一样的选项。这样当你测试 app 时，能获得和真实环境一样的优化选项。

你需要至少`1000`个数据才可以用示例 app 进行测试。编译运行时，滑块会被设置到`1000`。点击`Create Array and Test`按钮就会开始测试：

![](http://swift.gg/img/articles/collection-data-structures-swift/2015-04-21-19.50.12-281x500.png)

将滑块向右拖动直到数据达到`10000000`，再次按下`Create Array and Test`按钮，看看这个明显增大的数组的创建时间与刚才有什么不同：

![](http://swift.gg/img/articles/collection-data-structures-swift/2015-04-21-19.51.44-281x500.png)

这些测试是在 Xcode6.3（Swift 1.2）、iOS 8.3 和 iPhone 6 模拟器上运行的。在数据增加了`10000`倍的情况下，创建数组花费的时间只增加了`714`倍。

`O(n)`函数意味着增加`10000`倍数据会导致时间增加`10000`倍，`O(log n)`函数意味着增加`10000`倍的数据会增加`4`倍时间。这个例子中的性能介于`O(log n)`和`O(n)`之间，非常棒。

这个操作最初很费时，在这篇教程的第一版中，代码运行在 Xcode6.0 Gold Master 版(Swift 1.0)、iOS 8 Gold Master 版和 iPhone 5 上，测试消耗了相当长的时间：

![图图1](http://swift.gg/img/articles/collection-data-structures-swift/IMG_5140-281x500.png)


![图图2](http://swift.gg/img/articles/collection-data-structures-swift/IMG_5139-281x500.png)


在这个例子中，数据量增加了约`106.5`倍，增加了约`1417`倍的时间。

如果要实现`O(n)`的性能，`106.5`倍的数据预期消耗时间应该是`3.7`秒。而以`O(n log n)`增长，预期消耗时间是`33.5`秒。以`O(n²)`增长，预期消耗时间`395`秒。

在这个例子中，Swift 中`Array`的创建时间大约在`O(n log n)`和`O(n²)`之间。如你所见，当数据增加数十倍时时间会增加很多。

这个性能不容乐观。不过，更新至 Swift1.2 之后，你创建多大的数组都没有问题！

那么`NSMutableArray`呢？你仍然可以在 Swift 中调用`Foundation`中的类而不需要使用`Objective-C`，你会发现还有一个 Swift 类`NSArrayManipulator`遵守同样的协议`ArrayManipulator`。

正因如此，你可以轻松地把`NSMutableArray`替换成 Swift 中的数组。项目代码很简单，尝试修改一行代码来对比`NSMuatbleArray`的性能。

打开`ArrayViewController.swift`文件并将第 27 行由：

```swift
let arrayManipulator: ArrayManipulator = SwiftArrayManipulator()
```

修改为：

```swift
let arrayManipulator: ArrayManipulator = NSArrayManipulator()
```

再次编译运行，点击`Create Array and Test`测试创建`1000`个数据的`NSMutableArray`数组：

![](http://swift.gg/img/articles/collection-data-structures-swift/2015-04-21-20.20.34.png)

然后再次修改数据为`10000000`：

![](http://swift.gg/img/articles/collection-data-structures-swift/2015-04-21-20.20.45.png)

创建操作原始的性能不如 Swift 1.2 中的好 - 可能是因为需要来回操作`NSArray`中和它们对应的 Swift 的类型对象。

不管怎样，你创建一个数组只需要一次 - 但是需要经常执行的是其他一些操作例如查找、添加或者是移除对象。

如果继续深入下去，比如使用 Xcode 6 中的一些性能测试方法分别调用每个方法 50 次，就会看出一些端倪：

* 创建一个 Swift 数组和`NSArray`数组消耗相同的时间 - 介于`O(log n)`和`O(n)`之间。如果数据量在`5000`到`25000`之间，Swift 比`Foundation`多消耗大约三倍的时间 - 但是都低于`0.02`秒。
* 在 Swift 中向一个数组结构对象的开始或者是中间添加数据，相对`Foundation`（大约在`O(1)`左右）慢很多。向 Swift 数组的尾部添加数据（时间少于`O(1)`）实际上比向`NSArray`的尾部添加数据（多于`O(1)`）要快。
* 在`Foundation`和 Swift 数组结构中移除对象操作的性能表现很相似：从起始位置、中间或者尾部移除一个对象时间大约在`O(log n)`和`O(n)`之间。从数组的开头移除数据这一操作在 Swift 中性能略差，但是时间差异是毫秒级的。
* 通过索引查找消耗的时间在 Swift 数组以及`NSArray`中以相同的速率增长。当数组很大时，通过索引查找 Swift 数组消耗的时间相比`NSMutableArray`类型的对象快将近`10`倍。

> 注意：你可以使用[iPhone 6 性能测试](http://cdn4.raywenderlich.com/wp-content/uploads/2014/11/performance-test-iPhone-6-iOS-8.3-Swift-1.2.numbers.zip)程序来生成每个方法运行`50`次的结果（环境：Xcode 6.3、Swift 1.2、iOS 8.3、iPhone 6）。你也可以尝试运行应用中的其他测试，看看每运行`10`次的平均结果，以及它们在你手机上是如何运行的。

### 字典

![](http://swift.gg/img/articles/collection-data-structures-swift/Screen-Shot-2014-08-12-at-7.48.28-PM-414x320.png)


字典是一种不需要特定的顺序且数据都与唯一的键相联系的储值方式。你可以使用键来存储或者是查询一个值。

字典也使用下标语法。当你写`dictionary["hello"]`，就会得到与键`hello`对应的值。

像数组一样，在 Swift 中你如果用`let`来声明字典它就是个常量，如果用`var`
来声明它就是可变的。在`Foundation`框架中也有对应的`NSDictionary`和`NSMutableDictionary`类型供你使用。

与 Swift 数组相似的另外一个特征就是字典也是强类型的（即对于程序里的每一个变量，在使用前必须声明类型，赋值的时候也必须与变量的类型相同），你必须有已知类型的键值对。`NSDictionary`类型的对象可以使用任何`NSObject`的子类对象作为`key`，可以存储任意类型的对象为值。

当你调用某个接收或者返回字典类型的 Cocoa API 时，就会获得。在 Swift 中，这个类型的形式是`[NSObject: AnyObject]`。也就是说这个类型必须以`NSObject`的子类作为键，值可以是任何兼容 Swift 的对象。

### 什么时候使用字典

当你要存储的数据没有特定顺序但是在某种意义上有关联时，字典是最好的选择。

下面我们来学习字典以及这篇教程中其他的数据结构是如何工作的，首先通过`File…\New\Playground`创建一个`Playground`，并把它命名为`DataStructures`。

例如，你需要存储一个数据结构，它们包含了你所有的朋友以及它们的猫的名字，这样就可以通过你朋友的名字查找它们的猫的名字。你再也不需要为了拉近关系去记住那些猫的名字。

首先，你需要存储朋友和猫的字典：

```swift
let cats = [ "Ellen" : "Chaplin", "Lilia" : "George Michael", "Rose" : "Friend", "Bettina" : "Pai Mei"]
```

由于 Swift 有类型推断机制，上述类型被定义为 [String: String] - 键值均为字符串类型的字典。

现在尝试在里面获取数据：

```swift
cats["Ellen"] //返回可选类型，值为Chaplin
cats["Steve"] //返回 nil
```

注意字典中的下标语法返回一个可选类型。如果字典中不包含某个特定键的值，可选类型为`nil`；如果包含那个键对应的值，你就可以将其解包来获取值。

这样一来，使用`if let`可选类型解包语法从字典中获取值就是个很不错的办法：

```swift
if let ellensCat = cats["Ellen"] {
	println("Ellen's cat is named \(ellensCat).")
} else {
	println("Ellen's cat's name not found!")
}
```

由于确实存在`‘Ellen’`对应的值，你的`playground`中会打印`‘Ellen’s cat is named Chaplin’`。

### 期望性能

苹果再一次在 Cocoa 的[CFDictionary.h](http://opensource.apple.com/source/headerdoc/headerdoc-8.5.10/ExampleHeaders/CFDictionary.h)头文件中提到了字典的期望性能：

1. 从字典中获取值的时间复杂度最坏是`O(n)`，但一般应该是`O(1)`。
2. 插入和删除数据的时间复杂度最坏是`O(n²)`，但由于顶层的优化通常更接近`O(1)`。

这些没有数组中的性能那么好。由于存储键值对比有序数组更复杂，所以性能不那么好预测。

### 示例程序测试结果

`DictionaryManipulator`是跟`ArrayManipulator`类似的一个协议，它可以测试字典。你可以用它测试 Swift 的`Dictionary`和`NSMutableDictionary`在执行相同的操作时的性能。

为了比较 Swift 和 Cocoa 字典，你可以使用与上述数组的测试程序相似的步骤。编译运行 app，选择底部的`Dictionary`标签。

运行几个测试程序 - 你会发现创建一个字典比创建数组消耗的时间要长得多。如果你把数据滑块滑到`10000000`，可能会收到内存警告甚至内存溢出崩溃！

回到 Xcode 中，打开`DictionaryViewController.swift`文件并找到`dictionaryManipulator`属性：

```swift
let dictionaryManipulator: DictionaryManipulator = SwiftDictionaryManipulator()
```

用下面的代码替换它：

```swift
let dictionaryManipulator: DictionaryManipulator = NSDictionaryManipulator()
```

现在应用底层将会使用`NSDictionary`。再次编译运行 app，多进行几次测试。如果你是在 Swift 1.2 上运行，结果应该和本文一致中：

* 在时间消耗上，创建 Swift 字典比创建`NSMutableDictionaries`要慢得多 - 但性能都以`O(n)`的速率下降。
* 向 Swift 字典中添加数据的速度比向`NSMutableDictionaries` 类型的对象中添加数据大约快`3`倍，并且性能如苹果的文档所说，最好情况下能达到`O(1)`。
* Swift 和`Foundation`的字典都能以大约`O(1)`的速率进行查找。不像 Swift 数组，字典并不比`Foundation`中的字典性能要好，但是它们非常得接近。

现在，进入 iOS 中最后一个主要的数据结构：集合！

### 集合

集合是一种存储无序的，值唯一的数据结构。当你向一个集合中添加同样的数据时，数据不会被添加。这里的“同样地”即满足方法`isEqual()`。

Swift 在 1.2 版本中添加了对原生`Set`类型的支持 - 早期的 Swift 版本，你只能获取`Foundation`框架下的`NSSet`类型。Swift 集合中的元素必须拥有相同的类型。

注意，就像数组和字典那样，对于一个原生的 Swift 集合来说，如果你用`let`关键字进行声明它就是常量，如果用`var`声明就是可变的。在`Foundation`方面，也都有`NSSet`和`NSMutableSet`供你使用。

### 什么时候使用集合

当数据的唯一性很重要而顺序无所谓时可以使用集合。例如，如果你想从八个名字的数组中随机选出四个名字并且没有重复时，你会选择什么呢？

在`Playground`中输入下面的代码：

```swift
let names = ["John", "Paul", "George", "Ringo", "Mick", "Keith", "Charlie", "Ronnie"]
var stringSet = Set<String>() // 1
var loopsCount = 0
while stringSet.count < 4 {
    let randomNumber = arc4random_uniform(UInt32(count(names))) //2
    let randomName = names[Int(randomNumber)] //3
    println(randomName) //4
    stringSet.insert(randomName) //5
    ++loopsCount //6
}
 
//7
println("Loops: " + loopsCount.description + ", Set contents: " + stringSet.description)
```

在这一小段代码中，你做了这些事：

1. 初始化集合，这样你就可以在里面添加数据。
2. 在`0`和名字的个数中间选一个随机值。
3. 获取所选数字为索引对应的名字。
4. 打印出选择的名字。
5. 将选择的名字添加至可变的集合。记住，如果名字已经在集合里面了，集合就不会变化，因为集合不会存储重复的数据。
6. `loop`计数器一直在增加，这样你就可以看到循环执行了多少次。
7. 一旦循环结束，打印`loop`计数器的值和可变集合中的内容。

在这个例子中我们使用了一个随机数字生成器，你每次都能获取到一个不同的结果。下面的示例是写这篇教程时的其中一次运行结果：

```swift
John
Ringo
John
Ronnie
Ronnie
George
Loops: 6, Set contents: ["Ronnie", "John", "Ringo", "George"]
```

在这儿，为了得到唯一的名字循环执行了`6`次。它分别选择了`Ronnie`和`John`两次,但是只在集合中添加了一次。

当你在`playground`中写下这个循环时，会注意到它一遍一遍地执行，每次循环都会得到一个不同的数字。每次运行都至少有四次循环，因此集合中必须有四个数据才能跳出循环。

现在你已经看到了一个较小的集合是怎样工作的，下面我们来看看存储较大数据量的集合的性能。

### 示例应用测试结果

不像数组和字典，苹果没有概括集合性能的大概的预期（Swift 集合文档中对几个方法的性能有预期描述，但是没有`NSMutableSet`对应的预期），所以在这里你只需要观察实际情况中的性能。

Swift 1.2 版本的示例项目在`SetViewController`类中有`NSSetManipulator`和`SwiftSetManipulator`对象，这与`Array`和`Dictionary`的视图控制器中的配置类似，并且也可以以同样地方式进行替换。

在这两种情况下，如果你追求纯粹的速度，使用`Set`可能不能令你满意。`Set`和`NSSet`相较于`Array`和`NSMutableArray`，你会发现集合的时间要慢得多 - 这就是检查每一个数据在数据结构中是否唯一所付出的代价。

进一步的测试显示由于 Swift 的集合相对于数组和字典来说，处理数据花费的时间更多，因此性能以及执行大多数操作所消耗的时间都与`NSSet`非常的相似：创建、移除以及查找操作对于·`Foundation`和 Swift 来说消耗的时间几乎是相同的。

在 Swift 和`Foundation`中创建一个集合类型的对象消耗时间大约都以`O(n)`增长 - 这与预期相符，因为集合中的每一个数据被添加进来之前都要检查是否与已有数据相等。

在 Swift 和`Foundation`中删除和查找操作的性能大约是`O(1)`。这种情况是很稳定的，因为集合结构使用哈希值来检查是否相等，而哈希值可以以某个顺序进行计算和存储。这就使得查找操作明显比数组中的查找要快。

`NSMutableSet`和 Swift 原生的`Set`在性能上的主要差异在于添加对象的操作。

总之，向一个`NSSet`中添加对象时间复杂度约为`O(1)`，而在 Swift 的`Set`结构下可能高于`O(n)`了。

Swift 才出生不久，已经在集合类数据结构的性能方面有了很大的提升，相信之后会继续提高。

## 鲜为人知的`Foundation`数据结构

数组、字典和集合肩负着数据处理的重任。然而，Cocoa 提供了许多了解的人很少甚至不被欣赏的集合类型。如果字典、数组、集合都不能胜任某个功能，那么你可以试试这些是否管用。

### NSCache

使用`NSCache`与使用`NSMutableDictionary`类似 - 通过键来添加和获取值。区别在于`NSCache`是用来暂时存储一些你总是可以重新计算和生成的东西。如果可用内存降低，`NSCache`可能会移除一些对象。它们是线程安全的，但是苹果的文档提示：

> 如果缓存被要求释放内存，它就会自动执行异步的更新操作。

从根本上说，`NSCache`和`NSMutableDictionary`很像，除了`NSCache`可以在你的代码没有做任何事情的时候从另一个线程中移除一些对象。这对于管理缓存所使用的内存来说是很好的，但是如果你试图使用一个突然消失的对象，那么就会出问题了。


`NSCache`对键采取弱引用而不是强引用。

### NSCountedSet

`NSCountedSet`可以检测到你向某个集合中添加某个对象操作执行的次数。它继承自`NSMutableSet`，所以如果你再次向集合中添加同样的对象，集合中也只会有一个那样的对象。

不管怎样，在一个`NSCountedSet`类型的对象中，集合记录下对象被添加了多少次。你可以通过`countForObject()`查看某个对象被添加的次数。

注意当你调用`NSMutableSet`的`count`属性时，它只返回唯一对象的数量，而不是所有被添加到集合中的元素的数量。

例如，在你的`playground`中，使用之前`NSMutableSet`测试中创建的名字数组，将每个名字都向`NSCountedSet`对象中添加两次。

```swift
let countedMutable = NSCountedSet()
for name in names {
    countedMutable.addObject(name)
    countedMutable.addObject(name)
}
```

然后，打印集合，看看“Ringo”被添加了多少次：

```swift
let ringos = countedMutable.countForObject("Ringo")
println("Counted Mutable set: \(countedMutable)) with count for Ringo: \(ringos)")
```

你的打印结果应该是：

```
Counted Mutable set: {(
    George,
    John,
    Ronnie,
    Mick,
    Keith,
    Charlie,
    Paul,
    Ringo
)}) with count for Ringo: 2
```

注意集合中元素的顺序可能不同，但是你应该看到“Ringo”在名字列表中出现了一次，即使它被添加了两次。

### NSOrderedSet

`NSOrderedSet`以及它对应的可变类型`NSMutableOrderedSet`，是一种允许你以特定顺序存储一组不重复的对象的数据结构。
"特定顺序" - 天哪，这听起来很像数组对不对？苹果简单总结了你为什么要使用`NSOrderedSet`而不是数组：

> 当元素顺序以及测试某个元素是否存在于集合中的性能很重要时，你可以使用有序的集合作为数组的备选项。

因此，当你需要存储一组有序又不能重复的数据时使用`NSOrderedSet`是最好的。

>注意：由于`NSCountedSet`继承自`NSMutableSet`，因此`NSOrderedSet`也继承自`NSObject`。这个例子很好地表明了苹果命名一个类是基于它们的功能，而不一定是基于它们在底层是如何工作的。

### NSHashTable 和 NSMapTable

`NSHashTable`是另外一种与集合类似的数据结构，但是与`NSMutableSet`有几处关键的不同之处。

你可以使用任意指针类型而不仅仅是对象来搭建一个`NSHashTable`类型对象，所以可以向`NSHashTable`中添加结构体和非对象类型的数据。你也可以使用`NSHashTableOptions`枚举值来设置内存管理和相等的条件等。

`NSMapTable`是一种类字典的数据结构，但是在内存管理方面与`NSHashTable`有着相似的行为。

像`NSCache`那样，`NSMapTable`对键是弱引用。然而，不管什么时候键被释放它都能够自动删除与那个键对应的数据。这些选项都可以在`NSMapTableOptions`枚举值中进行设置。

### NSIndexSet

`NSIndexSet`是一个不可变集合，用来存储唯一的无符号整数，来表示数组的索引值。

如果你有一个包含十个数据的数组，而你只需要使用其中某几个固定位置的数据，就可以将索引存储在`NSIndexSet`对象中，并使用`NSArray`的`objectsAtIndexes`来直接获取对象：

```swift
let items : NSArray = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]
 
let indexSet = NSMutableIndexSet()
indexSet.addIndex(3)
indexSet.addIndex(8)
indexSet.addIndex(9)
 
items.objectsAtIndexes(indexSet) // returns ["four", "nine", "ten"]
```

你所指定的某个“数据”现在是一个数组了，Swift 数组没有对应的方法可以通过`NSIndexSet`或者别的什么类来获取多个数据。

`NSIndexSet`保留了`NSSet`中只允许某个值出现一次的特性。因此，你不能用它来存储任意一组数据，除非这组数据没有重复值。

有了`NSIndexSet`，你就可以将索引按一定的顺序存储，这比仅仅存储一个整数数组效率更高。

### 小测试

已经学到了这里，下面这个小测试是关于你想用哪种数据结构来存储某种类型的数据的，你可以通过小测试来巩固记忆。

为了做下面的测试，假设你有一个可以在图书馆展示数据的应用程序。

> Q:你会用什么来创建图书馆中所有作者的列表？

答案：集合！它会自动移除重复的数据，也就是说你可以任意输入作者的名字，多少次都可以，但是你只会有一次录入 - 除非你输错了作者的名字！

> Q:你怎么按字母排序的方式存储一个多产作者的所有作品的标题？

答案：用数组！这种情况下你有许多相似的数据对象（所有的标题都是字符串类型的），并且它们有顺序（标题必须按照字母顺序排列），这绝对是使用数组的最佳场景。

> Q:你怎样存储每个作者最受欢迎的作品？

答案：字典！如果你使用作者的名字作为键，使用作者最受欢迎的作品为值，你可以以下面的方式获取这个作者最受欢迎的作品：

```swift
mostPopularBooks["Gillian Flynn"] //Returns "Gone Girl"
```
 
### 扩展阅读

我想特别感谢我的一个同事[Chris Wagner](http://www.raywenderlich.com/about#cwagner)，在我们接触到 Swift 之前他写了这篇教程的 OC 版本，为了可以使用他的笔记和示例项目，把那篇教程也放在这里。

我也要感谢苹果公司的 Swift 团队 - 尽管在原生的数据结构方面还有很大的提升空间，我已经很享受用 Swift 编码和测试了。一段时间内我可能还会使用`Foundation`下的数据结构，但也可能开发一些 Swift 小插件。

不管怎样，如果你想学习更多 iOS 的数据结构，这儿有一些很棒的资源：
* [NSHipster](http://nshipster.com/)是一个很棒的资源，可以让你去探索Cocoa的包括数据结构在内的一些鲜为人知的API。
* [PSPDFKit](http://pspdfkit.com/)公司的Peter Steinberger的最著名的关于Foundation 数据结构的[excellent article in ObjC.io issue 7](http://www.objc.io/issue-7/collections.html)。
* 前任UIKit工程师Andy Matuschak的一篇关于 Swift 中基于结构的数据结构的文章[article in ObjC.io issue 16](http://www.objc.io/issue-16/swift-classes-vs-structs.html)。
* [AirspeedVelocity](http://airspeedvelocity.net/)，一个研究Swift本质特征的博客 - 由于在标题中引用了Monty Python的台词而获得了加分（Monty Python 1975年有一个电影 叫 Monty Python and the Holy Grail，里面有一个角色叫bridgekeeper ，他有一句台词：What... is the air-speed velocity of an unladen swallow? ）。
* 一篇很棒的文章[deep dive into the internals of NSMutableArray](http://ciechanowski.me/blog/2014/03/05/exposing-NSMutableArray/)深入研究了`NSMutableArray`，以及修改`NSMutableArray`中的数据对内存的影响。
* 一篇关于[NSArray and CFArray performance changes with extremely large data sets](http://ridiculousfish.com/blog/posts/array.html)很棒的研究。这篇文章进一步证明了苹果对类的命名并不是基于类在后台的行为，而是它们于开发者的行为。
* 如果你想学习更多的算法复杂度分析[Introduction to Algorithms](http://mitpress.mit.edu/books/introduction-algorithms)会教你比你在实际应用中可能了解到的还要多的内容，但能使你顺利通过工作面试。

如果你想仔细分析呈现在这篇文章中的数据，你可以自己下载[the numbers spreadsheet used to track all the testing runs with Swift 1.2](http://cdn4.raywenderlich.com/wp-content/uploads/2014/11/performance-test-iPhone-6-iOS-8.3-Swift-1.2.numbers.zip)分析数据。

更多问题或者想进一步分析数据的话，在下面尽情地留言吧！



