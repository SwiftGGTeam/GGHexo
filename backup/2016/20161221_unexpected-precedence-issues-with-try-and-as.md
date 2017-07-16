title: "try? 与 as? 之间的优先级问题"
date: 2016-12-21
tags: [Swift]
categories: [Erica Sadun]
permalink: unexpected-precedence-issues-with-try-and-as
keywords: 优先级,try?,as?
description: try? 比 as? 的优先级低导致了将它们结合起来使用的时候会遇到不少的问题，快来看一看解决方案吧！

---
原文链接=http://ericasadun.com/2016/12/15/unexpected-precedence-issues-with-try-and-as/
作者=Erica Sadun
原文日期=2016-12-15
译者=星夜暮晨
校对=Crystal Sun
定稿=CMB

<!--此处开始正文-->

Tim Vermeulen 最近在 Swift Evolution 列表上，写到 `try?` 的优先级非常地出人意料：

```swift
if let int = try? mightReturnInt() as? Int {
  print(int) // => Optional(3)
}
```

<!--more-->

具体来说，他发现 `try?` 的优先级比 `as?` 的优先级低，所以需要添加括号，才能够获取正确的结果。

```swift
if let int = (try? mightReturnInt()) as? Int {
  print(int) // => 3
}
```

此外，他还发现在既会返回可空值、又会抛出错误的情形下，也存在类似的问题：

```swift
if let int = try? mightReturnInt() {
  print(int) // => Optional(3)
}

if let int = (try? mightReturnInt()) ?? nil {
  print(int) // => 3
}
```

对于 `if let item = item as? T` 而言，是可以自动对可空值进行提取的，但是似乎目前却没有应用到 `try?` 当中。如果遇到这种情况，请考虑如示例所示，添加括号或者使用空合运算符 (nil coalescing) 来解决这个问题。

如果您觉得这种既有可空值又有错误抛出的情形太「罕见」的话，那么可以想一想文件系统请求，可能会抛出一个错误「目录不可读」，也可能会在指定文件不存在的时候返回 `nil`。尽管这种情况比较少见，但是将 `try?` 和 `as?` 结合起来使用的情形还是有可能出现的。
