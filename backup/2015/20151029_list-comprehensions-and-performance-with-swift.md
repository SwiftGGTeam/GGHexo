title: "用 Swift 进行列表解析及其性能问题"
date: 2015-10-29 09:00:00
tags: [Swift 进阶]
categories: [JamesonQuave.com]
permalink: list-comprehensions-and-performance-with-swift
---
原文链接=http://jamesonquave.com/blog/list-comprehensions-and-performance-with-swift/
作者=Veronica Ray
原文日期=2015-08-15
译者=riven
校对=numbbbbb
定稿=小铁匠Linus

<!--此处开始正文-->

>本文写于 2015.8.15 适用于 Xcode 6 和 Swift 1.2

列表解析可以让你用更简洁的方式来创建列表。尽管列表解析没有在 Swift 的语言指南中提及，但你也可以在 Swift 中实现类似列表解析的一些操作。

<!--more-->

如果你想创建一个对元素求平方的列表，像这样:

``` swift
var squares = [Int]()
for x in 1..<10 {
    squares.append(x*x)
}
```

在 Python 中，使用列表解析是这样的：

``` python
squares = [x**2 for x in range(10)]
```

在 Swift 中，你可以这样做：

``` swift
let squares = Array(map(1..<10) { $0 * $0 })
```

对列表中所有元素进行求和你可以这样做：

``` swift
var sum = 0
for square in squares {
    sum = sum + square
}
```

或者使用 reduce 函数

``` swift
let sum = squares.reduce(0, { $0 + $1 })
```

对于其它语言中的列表解析，你可以使用任意的序列或者集合作为输入，而不仅仅是一个区间值。

[你可以使用 map/reduce/filter/stride 函数创建你想要的列表类型](http://stackoverflow.com/questions/24003584/list-comprehension-in-swift)

列表解析的两个主要优点是让代码变的更简洁和生成更快的二进制码。

我刚刚模拟的列表解析看起来很简洁吧。但我很好奇是否它也能产生更快的二进制码。

[这篇文章](https://medium.com/swift-programming/secret-of-swift-performance-fcc5d2a437a8) 介绍了如何使用 Hopper 来分析 Swift 的汇编代码，Hopper 是一个 OS X 和 Linux 反编译程序。 你可以免费使用 Hopper ，不需要付任何费用。

没有使用列表解析的代码片段和模拟列表解析的代码片段都产生了同样的汇编代码.

![The assembly code from Hopper](https://swift.gg/img/articles/list-comprehensions-and-performance-with-swift/asm.png1446426438.2465854)

因为两个代码片段产生的汇编代码是一样的，所以我可以认为它们的执行时间是一样的。我们可以使用 XCTest 来测试我们程序的执行时间并证明这一点。

测试没有使用列表解析的代码片段

``` swift
func testNoListComprehensionPerformance() {
    self.measureBlock() {
        var squares = [Int]()
        for x in 1...5 {
            squares.append(x)
        }
    }
}
```

相关的输出是：

Test Case '-[speedTestTests.speedTestTests testNoListComprehensionPerformance]' started.

:0: Test Case '-[speedTestTests.speedTestTests testNoListComprehensionPerformance]' measured [Time, seconds] average: 0.000, relative standard deviation: 236.965%, values: [0.000154, 0.000005, 0.000004, 0.000004, 0.000004, 0.000004, 0.000004, 0.000004, 0.000004, 0.000004], performanceMetricID:com.apple.XCTPerformanceMetric_WallClockTime, baselineName: "", baselineAverage: , maxPercentRegression: 10.000%, maxPercentRelativeStandardDeviation: 10.000%, maxRegression: 0.100, maxStandardDeviation: 0.100

Test Case '-[speedTestTests.speedTestTests testNoListComprehensionPerformance]' passed (0.262 seconds).

测试模拟列表解析的代码片段

Test Case '-[speedTestTests.speedTestTests testSortaListComprehensionPerformance]' started.

:0: Test Case '-[speedTestTests.speedTestTests testSortaListComprehensionPerformance]' measured [Time, seconds] average: 0.000, relative standard deviation: 160.077%, values: [0.000045, 0.000005, 0.000004, 0.000003, 0.000003, 0.000003, 0.000003, 0.000004, 0.000003, 0.000003], performanceMetricID:com.apple.XCTPerformanceMetric_WallClockTime, baselineName: "", baselineAverage: , maxPercentRegression: 10.000%, maxPercentRelativeStandardDeviation: 10.000%, maxRegression: 0.100, maxStandardDeviation: 0.100

Test Case '-[speedTestTests.speedTestTests testSortaListComprehensionPerformance]' passed (0.255 seconds).

------

**他们平均只相差 0.007 秒**

------

我见过最酷的列表解析的应用便是拼写检查。Airspeed Velocity 针对 [Peter Norvig 的  Python 版本的拼写检查](http://norvig.com/spell-correct.html)，[改写了一个 Swift 版本](http://airspeedvelocity.net/2015/05/02/spelling/)。

在 Swift 中使用类列表解析的操作的主要优点就是简洁性。 [Paul Graham 写了一大篇关于在编程语言中简洁是多么重要的文章。](http://www.paulgraham.com/power.html) 因为每个程序员每天只能写一定行数的代码，如果你以同样数量的代码行数完成更多功能，那你每天便可以完成更多的工作任务。这种力量也会让你重新思考编写什么样的程序是可能的。在一些更繁琐的语言中，这个拼写检查的例子可能就是一个巨大的项目。我喜欢像拼写检查这种充满技术复杂性和神秘感的事物，并且在 Swift 中可以只用几行代码便能解决。