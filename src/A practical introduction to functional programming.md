title: "Swift 函数式编程实践"
date: 2015-09-04
tags: [Swift]
categories: [harlan kellaway]
permalink: swift-functional-programming-intro

---
原文链接=http://harlankellaway.com/blog/2015/08/10/swift-functional-programming-intro/
作者=harlan kellaway
原文日期=2015/08/10
译者=shanks
校对=numbbbbb
定稿=小锅

## 介绍

Swift 为 iOS 编程世界引入了一个新的范式：函数式范式。大多数 iOS 开发者之前都习惯了用 Objective-C 或者其他面向对象编程语言，函数式的编码和思考会变得有点烧脑(brain-addling)。
应该从那里开始学习呢？我找到了一些非常容易理解的例子 - 在[Mary Rose Cook](http://maryrosecook.com/)的 blog 中找到了一篇非常好的文章：[A practical introduction to functional programming](http://maryrosecook.com/blog/post/a-practical-introduction-to-functional-programming)，这篇文章很好，足够解答我的疑惑，而且这篇文章包含了很多示例代码，我们可以在此基础上加上函数式的补充。

<!--more-->

我们的这篇文章会重新审视 Cook 的例子，并把它们用 Swift 实现。所以在你阅读本篇文章之前，请首先阅读她的文章。这篇文章不仅创造了很多例子，对于新手来讲，它还清晰地解释了什么是函数式编程，我不会再重复这些概念。

> 当程序员们谈论函数式编程时，他们会提到很多叼炸天的"函数式"特性。。。但是请大家无视这些点。函数式代码只描述了一件事情：没有副作用。当前函数不依赖函数之外的数据，当前函数也不会改变函数之外的数据。所有其他的"函数式"特性都是从此特性扩展开的。请把此特性作为你学习函数式编程的指导思想。
> 
>  -Mary Rose Cook关于如何学习函数式编程的经验

### 案例 #1 - Increment

```swift
/* 函数式代码只描述了一件事情：没有副作用。 */

/// 非函数式的 ///

var a = 0

func incrementUnfunctional() -> () {
    a += 1
}

incrementUnfunctional()
print(a) // a = 1

/// 函数式的 ///

a = 0

func incrementFunctional(num: Int) -> Int {
    return num + 1
}

a = incrementFunctional(a)
print(a) // a = 1
```

这两个函数的区别在于如何增加变量 a - 函数`incrementUnfunctional `修改的是一个全局变量，而函数`incrementFunctional `是一个常规函数：获得一个数字，然后返回增加后的数字。这就是 Cook 提到的"没有副作用"：函数`incrementFunctional `没有影响自身之外的变量的状态。

## cook 的课程 #1：不要在列表中使用循环，使用`map`和`reduce`

任何一个深入研究函数式编程的程序员都会很快接触到`map`、`reduce`和`filter`函数。这几个函数非常强大，用于处理集合(collections)类型。下面我们来看`map`和`reduce`函数。

### 例子 #2 - Map 1

> `Map`函数接收一个函数和一个集合。`Map`会生成一个新的空集合，使用传入的函数处理集合中的每个元素并把返回值插入新集合，最后返回这个新集合。

```swift
/* 不要在列表中使用循环，使用 map 和 reduce。 */

// Map 例子 #1

let languages = ["Objective-C", "Java", "Smalltalk"]

let languageLengths = languages.map { language in count(language) } 

print(languageLengths) // [11, 4, 9]

let squares = [0, 1, 2, 3, 4].map { x in x * x }

print(squares) // [0, 1, 4, 9, 16]
```

正如例子展示的那样，`map`的确返回了一个新集合——在这个例子中是数组（array）——使用一个匿名函数处理原始集合中的每个元素，同时原始集合保持不变。

### 例子 #3 - Map 2

```swift
/* 不要在列表中使用循环，使用 map 和 reduce。 */

// Map 例子 #2

var languages = ["Objective-C", "Java", "Smalltalk"]
let newLanguages = ["Swift", "Haskell", "Erlang"]

/// 非函数式的 ///

for index in 0..<languages.count {
    languages[index] = randomElement(newLanguages)
}

print(languages) // e.g. ["Haskell", "Haskell", "Swift"]

/// 函数式的 ///

let randomLanguages = languages.map { _ in randomElement(newLanguages) }

print(randomLanguages) // e.g. ["Haskell", "Haskell", "Swift"]


// 辅助方法

func randomElement(array: [String]) -> String {
    let randomIndex = randomPositiveNumberUpTo(array.count)
    return array[randomIndex]
}

func randomPositiveNumberUpTo(upperBound: Int) -> Int {
    return Int(arc4random_uniform(UInt32(uppderBound)))
}
```

这里我们可以看到如何使用熟悉的方式得到一个随机的编程语言数组 - 还有我们的函数式的补充实现。


### 例子 #4 - Reduce 1

> Reduce函数接收一个函数和一个集合。返回一个合并了元素后创建的值。

```swift
/* 不要在列表中使用循环，使用 map 和 reduce。 */

// Reduce 例子 #1

let sum = [0, 1, 2, 3, 4].reduce(0, combine: { $0 + $1 })

print(sum) // 10
```

`Reduce`理解起来比`map`难一些。`Reduce`从一个初始值（上面的例子中，初始值是 0）开始积累一个值——在每一个集合元素上调用`combine`闭包并返回最后一个结果。

上面的例子使用了参数名称缩写——`$0`和`$1`——这可能不太好懂。下面是另外一种表达方式，功能相同：

```swift
/* 不要在列表中使用循环，使用map和reduce。 */

// Reduce 例子 #1 - 没有参数名称缩写

let numbers = [0, 1, 2, 3, 4]
let startingWith = 0

let sum = numbers.reduce(startingWith) {
    (runningSum, currentNumber) in
    
    runningSum + currentNumber
}

print(sum) // 10
```

我们从 0 开始，使用加法连接`runningSum`和我们数字集合中的当前值——最终完成求和。

### 例子 #5 - Reduce 2

`Reduce`不仅能用于数字集合——我们看看如何用它处理字符串集合。以下的函数会告诉我们，有多少个包含"hello"单词的短语：

```swift
/* 不要在列表中使用循环，使用 map 和 reduce。 */

// Reduce 例子 #2

let greetings = ["Hello, World", "Hello, Swift", "Later, Objective-C"]

/// 非函数式的 ///

var helloCount = 0

for greeting in greetings {
    if(string(greeting, contains:"hello")) {
        helloCount += 1
    }
}

print(helloCount) // 2

/// 函数式的 ///

let helloCountFunctional = greetings.reduce(0, combine: { $0 + ((string($1, contains:"hello")) ? 1 : 0) })

print(helloCountFunctional) // 2


// 协助代码

func string(str: String, #contains: String) -> Bool {
    return str.lowercaseString.rangeOfString(contains.lowercaseString) != nil
}
```

#### Swift 笔记：Map 和 Reduce

在 Swift 1.2 中，类似于`map`和`reduce`的函数在 Swift 库中是全局函数——所以你得使用这样的语法：`map([0, 1, 2, 3, 4], { x in x * x })`。Swift 2 提供了更加直观的语法，正如你在上面的例子看到的那样，可以在集合上直接调用`map`。这两种方法的功能相同！


## cook 的课程 #2 - 使用声明式（Imperative）编程，不要使用命令式（Declarative）

> 一个函数式版本的命令式代码将会是声明式的。这类代码描述的是要做什么，而不是如何做。。。把一段代码打包成一些函数，将会提高代码的声明性质。

Objective-C 开发者习惯使用命令式编程——这是一个编程范式，一系列的语句被用来修改状态。函数式编程是声明式编程中的一种形式——函数式编程的特征是使用函数来描述要做什么。

### 例子 #6 - Imperative 1

让我们看看 Cook 的例子，下面这段代码模拟了三个汽车的竞赛：

```swift
/*** 声明式编程，不是命令式 ***/

// Imperative vs. Declarative - 实例 #1

/// Imperative - 第一次尝试 ///

var time = 5
var carPositions = [1, 1, 1]

while(time > 0) {
    time -= 1
    
    print("\n")
    
    for index in 0..<carPositions.count {
        if(randomPositiveNumberUpTo(10) > 3) {
            carPositions[index] += 1
        }
        
        for _ in 0..<carPositions[index] {
            print("-")
        }
        
        print("\n")
    }
}

// Output:

-
--
--

--
--
---

---
--
---

----
---
----

----
----
-----
```

### 例子 #7 - Imperative 2

一个有经验的 Objective-C 开发者看到上面那些代码时，会马上意识到应该把上面的代码分解成更小的片段。

```swift
/*** 声明式的编码，而不是命令式的 ***/

// Imperative vs. Declarative - 例子 #2

/// Imperative - 第二次尝试 ///

var time = 5
var carPositions = [1, 1, 1]

while(time > 0) {
    runStepOfRace()
    draw()
}

// Helpers

func runStepOfRace() -> () {
    time -= 1
    moveCars()
}

func draw() {
    print("\n")
    
    for carPosition in carPositions {
        drawCar(carPosition)
    }
}

func moveCars() -> () {
    for index in 0..<carPositions.count {
        if(randomPositiveNumberUpTo(10) > 3) {
            carPositions[index] += 1
        }
    }
}

func drawCar(carPosition: Int) -> () {
    for _ in 0..<carPosition {
        print("-")
    }
    
    print("\n")
}
```

代码更加简洁了，但仍然不是函数式的——其中的每一个函数没有按照 Cook 教导我们的函数式实现的方式去做："[函数不能]依赖当前函数之外的数据，并且[不能]改变当前函数之外的数据"。

### 例子 #8 - Declarative

以下是一个函数式实现版本：

```swift
/*** 声明式编程，不是命令式 ***/

// Imperative vs. Declarative - 例子 #3

/// 声明式的 ///

typealias Time = Int
typealias Positions = [Int]
typealias State = (time: Time, positions: Positions)

let state: State = (time: 5, positions: [1, 1, 1])
race(state)

// 辅助函数

func race(state: State) -> () {
    draw(state)
    
    if(state.time > 1) {
        print("\n\n")
        race(runStepOfRace(state))
    }
}

func draw(state: State) -> () {
    let outputs = state.positions.map { position in outputCar(position) }
    
    print(join("\n", outputs))
}

func runStepOfRace(state: State) -> State {
    let newTime = state.time - 1
    let newPositions = moveCars(state.positions)
    
    return (newTime, newPositions)
}

func outputCar(carPosition: Int) -> String {
    let output = (0..<carPosition).map { _ in "-" }
    
    return join("", output)
}

func moveCars(positions: [Int]) -> [Int] {
    return positions.map { position in (randomPositiveNumberUpTo(10) > 
    3) ? position + 1 : position }
}
```

哇哦，好多代码啊。我建议你仔细研究下例子中的每个函数，然后你就会意识到到这就是我们想要的函数：既不依赖外部数据，也不会修改内部数据。

例子中另外一个保持整洁的细节是使用了自定义类型——通过`typealias`关键字——在编写代码时候会变得更加自然。我个人比较喜欢函数式编程的原因之一是，它会强行让我们仔细思考代码中使用的类型以及如何在函数里面操作这些类型。

## cook的课程 #3 - 使用管道。

> 在前面的章节中，一些命令式的循环重写为调用辅助函数的循环。在这个章节中，另外一种命令式的循环使用一种名叫管道的技术来重写。

### 例子 #9 - 不使用管道

我们先来一个典型的例子，对一组数据进行变换。在这个例子里面，有一个`bands`的数组，其中每个元素包含`name`和`country`。我们想要对这个`bands`集合进行两次变换：1、把`country`设置为`Canada` 2、把`name`改成大写。以下是我们第一次的实现：

```swift
/*** 使用管道 ***/

/// 非函数式的 ///

var bands: [ [String : String] ] = [
    ["name" : "sunset rubdown", "country" : "UK"],
    ["name" : "women", "country" : "Germany"],
    ["name" : "a silver mt. zion", "country" : "Spain"]
]

func formatBands(inout bands: [ [String : String] ]) -> () {
    var newBands: [ [String : String] ] = []
    
    for band in bands {
        var newBand: [String : String] = band
        newBand["country"] = "Canada"
        newBand["name"] = newBand["name"]!.capitalizedString
        
        newBands.append(newBand)
    }
    
    bands = newBands
}

formatBands(&bands)
print(bands) // [[country: Canada, name: Sunset Rubdown], [country: Canada, name: Women], [country: Canada, name: A Silver Mt. Zion]]
```

使用`inout`关键字已经说明我们没有使用函数式编程。

下面是另一种更具有表现力和灵活性的实现方式，同样能实现数据变换，并且不会把所有代码都塞到`formatBands `函数中：

`print(formattedBands(bands, [setCanadaAsCountry, capitalizeName]))`

我们应该如何实现呢？

### 例子 #10 - 函数式管道

```swift
/*** 使用管道 ***/

/// Functional - Example #1 ///

let bands: [ [String : String] ] = [
    ["name" : "sunset rubdown", "country" : "UK"],
    ["name" : "women", "country" : "Germany"],
    ["name" : "a silver mt. zion", "country" : "Spain"]
]

typealias BandProperty = String
typealias Band = [String : BandProperty]
typealias BandTransform = Band -> Band
typealias BandPropertyTransform = BandProperty -> BandProperty

let canada: BandPropertyTransform = { _ in return "Canada" }
let capitalize: BandPropertyTransform = { return $0.capitalizedString }

let setCanadaAsCountry: BandTransform = call(function: canada, onValueForKey: "country")
let capitalizeName: BandTransform = call(function: capitalize, onValueForKey: "name")

func formattedBands(bands: [Band], functions: [BandTransform]) -> [Band] {
    return bands.map {
        band in
        
        functions.reduce(band) {
            (currentBand, function) in
            
            function(currentBand)
        }
    }
}

print(formattedBands(bands, [setCanadaAsCountry, capitalizeName])) // [[country: Canada, name: Sunset Rubdown], [country: Canada, name: Women], [country: Canada, name: A Silver Mt. Zion]]

// 辅助函数

func call(#function: BandPropertyTransform, onValueForKey key: String) -> BandTransform {
    return {
        band in
        
        var newBand = band
        newBand[key] = function(band[key]!)
        return newBand
    }
}
```

请注意`canada`和`capitalize`函数；他们只是接受`BandProperty`（字符串）然后返回一个`BandProperty`（字符串）。

请注意查看`setCountryAsCanada`和`capitalizeName`函数；他们简单的接收`BandPropertyTransform`函数（比如`canada`和`capitalize`）并把它们应用到`Band`（字典）中的一个键值上（这里分别是"country"和"name"）。

使用上述所有函数时，都可以独立思考它们的作用。函数`formattedBands`在最后调用`BandTransform`数组中的函数来处理传入的`bands`数组。我们可以写任何数量的变换，然后把它们传入`formattedBands`，同时保持其他函数不变——这是一个非常强大的东东!

## 课外内容 - 函数组合

如果你已经看到这里了——那就继续来看另外一种合并转换的方法，Cook 的文章中没有介绍这种方法。

这种方法的灵感来自一本我最喜欢的关于 Swift 的图书：[Functional Programming in Swift](http://www.objc.io/books/fpinswift/),作者是来自[objc.io](http://www.objc.io/)的 Chris Eidhof、Florian Kugler 和 Wouter Swierstra。这本书的一个章节谈到了如何构建函数——我们可以把这个概念用到之前的代码中。

### 例子 #11 - 函数组合

```
/*** 使用管道 ***/

/// 函数式的 - 例子 #2 ///

let canada: BandPropertyTransform = { _ in return "Canada" }
let capitalize: BandPropertyTransform = { return $0.capitalizedString }

let setCanadaAsCountry: BandTransform = call(function: canada, onValueForKey: "country")
let capitalizeName: BandTransform = call(function: capitalize, onValueForKey: "name")

let myBandTransform = composeBandTransforms(setCanadaAsCountry, capitalizeName)
let formattedBands = bands.map { band in myBandTransform(band) }

print(formattedBands) // [[country: Canada, name: Sunset Rubdown], [country: Canada, name: Women], [country: Canada, name: A Silver Mt. Zion]]


// 辅助函数

func call(#function: BandPropertyTransform, onValueForKey key: String) -> BandTransform {
    return {
        band in
        
        var newBand = band
        newBand[key] = function(band[key]!)
        return newBand
    }
}

func composeBandTransforms(transform1: BandTransform, transform2: BandTransform) -> BandTransform {
    return {
        band in
        
        transform2(transform1(band))
    }
}
```

这和之前的代码看起来很像——但是使用了函数构建的概念来构造我们的变换，替换掉 Cook 的`map`和`reduce`方案。

## 结论

这篇文章可以用 Cook 的精彩总结来结尾：

> 函数式代码可以很好的与其他风格的代码共存……把列表的循环换成`map`和`reduce`。这点请参考车辆竞赛的例子。把代码拆分到函数中，使得这些函数更加函数式化。把一个过程的循环变成递归。这点请参考`bands`的例子。把一系列的操作变成管道。

Swift 不是一个纯函数式语言——你的函数式代码可以很好的与非函数式代码共存。

这篇文章的重点是教你如何把现有代码转换成函数式风格，并让你见识到函数式编程的威力。

本文所有例子的代码都放在了 Gists(译者注：请点击原文中例子的Gists链接)中，同时也放到了 GitHub 上：[https://github.com/hkellaway/swift-functional-intro](https://github.com/hkellaway/swift-functional-intro)

编码快乐!
