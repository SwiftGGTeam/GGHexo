title: "你应该把 Objective-C 的代码转为 Swift 吗？"
date: 2015-11-30
tags: [Thomas Hanning]
categories: [Swift 入门]
permalink: should-you-migrate-objective-c-code-to-swift

---
原文链接=http://www.thomashanning.com/should-you-migrate-objective-c-code-to-swift/
作者=Thomas Hanning
原文日期=2015-11-23
译者=王亚珂
校对=千叶知风
定稿=千叶知风

<!--此处开始正文-->

# 你应该把 `Objective-C` 的代码转为 `Swift` 吗？

未来是 `swift` 的，但是这就意味着你需要把 `Objective-C` 的代码都转为 `Swift` 吗？

<!--more-->

## 选择一：不转代码坚持使用 `Objective-C`

乍一看这似乎是最简单的方法了。既然你已经有了一个 `Objective-C` 编写的项目，继续用OC写下去肯定不是问题。不过。这会产生一些问题：

未来可能不会有很多优秀的 `Objective-C` 开发者，因为会有许多 `iOS` 开发者将注意力放在了 `Swift` 上面。如果你的项目依赖于其他的开发者，未来你想要继续维持纯粹的 `Objective-C` 的项目恐怕不是一件容易的事儿。

但是即使你自己可以维护一个项目，这种方法也有害处。如果你没有 `Swift` 方面的实践，你可能会错失许多苹果通过 `iOS SDK` 引入的最新的开发技术。如果你想跟得上时代的步伐，你不得不学习 `Swift` 。

## 选择二：将 `Objective-C` 的代码转为 `Swift`

这是最激进的一种方法。但是想要将一个完整的项目从 `Objective-C` 转为 `Swift` 意味着要写一个新的项目了。虽然 `Objective-C` 与 `Swift` 有很好的互操作性，但是他们的编程规范是完全不同的。所以如果你想要将 `Objective-C` 转为 `Swift` ，使用错误的编程范式是很危险的。

你还需要投入大量的时间和金钱。所以如果你不打算重写你的项目，这个方法就有点太夸张了。

## 选择三：将新的代码用 `Swift` 来写

这是一种不错的折中办法。由于 `Objective-C` 与 `Swift` 之间的互用性很好，你可以用 `Swift` 来创建你新的类并让它们与你已有的 `Objective-C` 的代码交互。

使用这种方法你可以将你的项目一步步转为 `Swift` 而不需要投入过多的时间和金钱。更多的是这对于学习的过程也是很好的。与其重写一个完整的项目，不如将注意力集中在应用的某些部分。

并且这个方法的风险也小得多。如果采取这种方法你可能会发现自己一点儿都不喜欢 `Swift` （尽管不太可能会发生这种情况），你完全可以再回到 `Objective-C` 并且不会损失过多的时间和金钱。

## 结论

虽然有些情况下值得你将 `Objective-C` 的代码转为 `Swift` ，但最好的折中的办法就是将新代码用 `Swift` 来写并与你旧的 `Objective-C` 的代码进行交互。

参考：[Should You Use Objective-C or Swift?](http://www.thomashanning.com/should-you-use-objective-c-or-swift/)