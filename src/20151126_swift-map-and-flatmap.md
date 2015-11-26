title: "Swift：map 和 flatMap 基础入门"
date: 2015-11-26
tags: [Thomas Hanning]
categories: [Swift 入门]
permalink: swift-map-and-flatmap

---
原文链接=http://www.thomashanning.com/swift-map-and-flatmap/
作者=Thomas Hanning
原文日期=2015-11-16
译者=pmst
校对=千叶知风
定稿=千叶知风

<!--此处开始正文-->

借助于 map和flapMap 函数能够很轻易地将数组转换成另外一个新数组。

<!--more-->


# Map

`map`函数能够被数组调用，它接受一个闭包作为参数，作用于数组中的每个元素。闭包返回一个变换后的元素，接着将所有这些变换后的元素组成一个新的数组。


这听起来有些复杂，但它是相当简单的。想象你拥有一个string类型的数组:

```swift
let testArray = ["test1","test1234","","test56"]
```

`map`函数的闭包接收一个字符串(类型为`string`)作为参数，原因在于我们调用函数处理的数组元素类型为`String`。本例中，我们想要返回一个整型数组，逐个对应字符串元素成员的字符长度。因此闭包的返回类型为`Int?`.

```swift
let anotherArray = testArray.map { (string:String) -> Int? in
     
     let length = string.characters.count
     
     guard length > 0 else {
         return nil
     }
 
     return string.characters.count
}
 
print(anotherArray) //[Optional(5), Optional(8), nil, Optional(6)]
```

# FlatMap

`flatMap`很像`map`函数，但是它摒弃了那些值为`nil`的元素。

```swift
let anotherArray2 = testArray.flatMap { (string:String) -> Int? in
 
     let length = string.characters.count
 
     guard length > 0 else {
          return nil
     }
 
     return string.characters.count
}
 
print(anotherArray2) //[5, 8, 6]
```

另外一个与`map`函数不同之处在于：倘若元素值不为nil情况下，`flapMap`函数能够将可选类型(`optional`)转换为非可选类型(`non-optionals`)。

# 引用

Image:@ Fly_dragonfly / shutterstock.com