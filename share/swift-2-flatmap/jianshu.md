Swift 2.0: 理解 flatMap

> 作者：Natasha，[原文链接](http://natashatherobot.com/swift-2-flatmap/)，原文日期：2015/07/26
> 译者：[SergioChan](https://github.com/SergioChan)；校对：[numbbbbb](https://github.com/numbbbbb)；定稿：[numbbbbb](https://github.com/numbbbbb)
  







发布于 2015 年 7 月 26 日

上周我写了一篇[博文](http://natashatherobot.com/swift-when-the-functional-approach-is-not-right/)，介绍如何创建一个非可选类型的有序图片数组。

我在寻找最佳解决方案时，也考虑过`flatMap`。但是老实说，我并不是很了解`flatMap`，也不知道如何使用。一位同事告诉我一种解决方案，需要用到两个`flatMap`，看起来十分复杂。



之后，在[博文的评论](http://natashatherobot.com/swift-when-the-functional-approach-is-not-right/)和[Twitter](https://twitter.com/NatashaTheRobot/status/624609007043391488)上发生了激烈讨论，我发现其实使用`flatMap`可以轻松地解决问题：

```swift
let minionImagesFlattened = (1...7).flatMap { UIImage(named: "minionIcon-\($0)") }
```

下面我会按照自己的理解介绍`flatMap`。别忘了我也是刚学的，所以我肯定不是`flatMap`专家！

## 简单的例子

我对`flatMap`的理解十分基础，这是我最初的想法：

```swift
let nestedArray = [[1,2,3], [4,5,6]]

let flattenedArray = nestedArray.flatMap { $0 }
flattenedArray // [1, 2, 3, 4, 5, 6]
```

## 转换元素😡

写上面的例子时，我想做一件无比简单的事情 —— 把每个元素乘以 2，就像`map`一样。但是结果是这样的：

![image](http://swift.gg/img/articles/swift-2-flatmap/Screen-Shot-2015-07-26-at-5.50.07-AM.png)

无论我在`flatMap`的闭包里做什么，都没有任何作用😢。于是我四处谷歌，幸运地撞见了一篇之前就看过但是却没有认真阅读的文章：[@sketchyTech](https://twitter.com/sketchyTech)的博文[What do map() and flatMap() really do?](http://sketchytech.blogspot.com/2015/06/swift-what-do-map-and-flatmap-really-do.html)。去读一读吧，里面有很多关于`flatMap`的实用内容！

下面我要介绍文章中最关键的部分：在`flatMap`中 $0 指的是数组中的数组！我竟然没想到！所以如果你想把数组中的元素全部乘以某个数字，需要再深入一层使用`map`：

```swift
let nestedArray = [[1,2,3], [4,5,6]]

let multipliedFlattenedArray = nestedArray.flatMap { $0.map { $0 * 2 } }
multipliedFlattenedArray // [2, 4, 6, 8, 10, 12]
```

这是用名称替代 $0 的写法，更容易理解：

```swift
let nestedArray = [[1,2,3], [4,5,6]]

let multipliedFlattenedArray = nestedArray.flatMap { array in
    array.map { element in
        element * 2 }
}
multipliedFlattenedArray // [2, 4, 6, 8, 10, 12]
```

## flatMap + 可选类型

因为我想用`flatMap`来处理嵌套数组，所以花了很大功夫学习如何在最初的问题中使用它：

```swift
let minionImagesFlattened = (1...7).flatMap { UIImage(named: "minionIcon-\($0)") }
```

但是很明显，`flatMap`处理可选类型的方式比较特殊：

> [@NatashaTheRobot](https://twitter.com/NatashaTheRobot) 新的`flatMap`基本就是一个`map`，但是删除了`nil`值。换句话说，它会返回 [T]，而不是 [T?]。
> 
> — Dave DeLong (@davedelong)[7月 25, 2015](https://twitter.com/davedelong/status/624995473489682432)

当我看到`flatMap`的方法定义时，一切真相大白：

```swift
extension SequenceType {

    /// Return an `Array` containing concatenated results of mapping `transform`
    /// over `self`.
    func flatMap<S : SequenceType>(@noescape transform: (Self.Generator.Element) -> S) -> [S.Generator.Element]
}

extension SequenceType {

    /// Return an `Array` containing the non-nil results of mapping `transform`
    /// over `self`.
    func flatMap<T>(@noescape transform: (Self.Generator.Element) -> T?) -> [T]
}
```

换句话说，为了处理可选类型，`flatMap`被重载过。它会接受一个可选类型的数组并返回一个拆包过的且没有`nil`值的可选类型组成的数组。

```swift
let optionalInts: [Int?] = [1, 2, nil, 4, nil, 5]

let ints = optionalInts.flatMap { $0 }
ints // [1, 2, 4, 5] - this is an [Int]
```

很棒，而且也很方便~但是这怎么和上面展开嵌套数组的例子关联起来呢？为什么要使用`flatMap`？我看过的最合理的解释是 Lars-Jørgen Kristiansen 的评论：

![image](http://swift.gg/img/articles/swift-2-flatmap/Screen-Shot-2015-07-26-at-6.45.20-AM.png)

他认为`flatMap`是在处理一个容器而不是数组，这样可以更好地理解它。

我只是掌握了`flatMap`的冰山一角，但我觉得这是个不错的开始。祝大家学习 Swift 2.0 快乐！

