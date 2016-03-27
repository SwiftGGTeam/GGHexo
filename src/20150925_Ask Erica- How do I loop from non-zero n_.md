title: "如何在 Swift 2.0 中实现从非零下标遍历数组"
date: 2015-09-25 09:00:00
tags: [Swift 进阶]
categories: [Erica Sadun]
permalink: ask-erica-how-do-i-loop-from-non-zero-n-swiftlang
---
原文链接=http://ericasadun.com/2015/09/01/ask-erica-how-do-i-loop-from-non-zero-n-swiftlang/
作者=Erica Sadun
原文日期=2015-09-01
译者=小铁匠Linus
校对=千叶知风
定稿=shanks
发布时间=2015-09-25T09:00:00

<!--此处开始正文-->

Mike T. 私信我，如何让 for 循环从下标 i (比如 5 )开始，而不是从 0 开始。

Swift 2.0 提供了一种像 C 语言那样的循环，代码如下：

```swift
for var index = 5; index < array.count; index++ {
  // do something with array[index]
}
```

也可以用区间运算符的方式实现相似的功能：

<!--more-->

```swift
for index in 5..<array.count {
 // do something with array[index]
}
```

甚至可以用`forEach`这样写：

```swift
(5..<array.count).forEach {
    // do something with array[$0]
}
```

你也可以截取数组中你需要使用的部分进行遍历，每次遍历时可以获取数组下标(本例中偏移量为 5，也可以看看[另一篇讲 slice enumeration 的文章](http://ericasadun.com/2015/09/01/beta-6-slice-indices-zero-and-what-beta-6-doesnt-change-swiftlang/))和对应的值。

```swift
for (index, value) in array[5..<array.count].enumerate() {
  // do something with (index + 5) and/or value
}
```

如果你想要更准确的计数，而不必每次都加上偏移量 5 的话，可以使用`zip`，例子如下：

```swift
let range = 5..<array.count
for (index, value) in zip(range, array[range]) {        
    // use index, value here
}
```
也可以调整`zip`方法，将其应用在`forEach`里：

```swift
let range = 5..<array.count
zip(range, array[range]).forEach {
    index, value in
    // use index, value here
}
```

当然，你也可以使用`map`来处理子区间的值。不像`forEach`，`map`会在闭包里返回一个新的值。

```swift
let results = array[range].map({
    // transform $0 and return new value
})
```

如果你不想遍历数组前 5 个元素，可以使用`dropFirst()`从剩余的元素开始遍历。下面这个例子没有使用下标，如果需要的话可以按前面提到的方法去获取。

```swift
for value in array.dropFirst(5) {
    // use value here
}
```

使用`removeFirst()`可以返回数组片(slice)第一个元素，然后该元素会从数组片中删除。接下来的代码段结合了`removeFirst()`和`dropFirst()`，首先去掉前5个元素，然后遍历数组剩余的元素。

```swift
var slice = array.dropFirst(5)
while !slice.isEmpty {
    let value = slice.removeFirst()
    // use value here
}
```

另外也有很多方式可以遍历数组，包括在需要的时候才去获取数组切片的值(使用`lazy`进行延迟加载)，但是以上提到的方法已经基本够用了。

感谢 [Mike Ash](http://mikeash.com/)，并且一定要去看看 [Nate Cook 的解决方案](https://gist.github.com/natecook1000/b6be8929451bb6f35ad4)。