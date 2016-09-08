title: "答疑：能在 setter 方法中调用父类么？"
date: 2016-09-08
tags: [Swift]
categories: [Erica Sadun]
permalink: questions-can-you-call-super-in-a-setter
keywords: setter方法
custom_title: 
description: Swift setter 方法能调用到父类吗，这个问题的答案是肯定的，子类会自动把字符串转化成小写，然后再调用父类的赋值过程。

---
原文链接=http://ericasadun.com/2016/08/08/questions-can-you-call-super-in-a-setter/
作者=Erica Sadun
原文日期=2016/08/08
译者=Cwift
校对=Cee
定稿=CMB

<!--此处开始正文-->

k 给我留言：*「能在 setter 方法中调用父类么？比如在赋新值时复写 setter，而是调用其父类的方法？」*

答案是当然可以。请看示例：

```swift
class Foo {
    var value: String
    init(value: String) { self.value = value }
}

class SubFoo: Foo {
    override var value: String {
        get { return super.value }
        set { super.value = newValue.lowercased()
        }
    }
}
```

<!--more-->

`SubFoo` 类和 `Foo` 类的功能相似，只不过在赋值时新值会被转化成小写（虽然没有把转化操作放在初始化时进行）。因此当你新建一个子类的实例并且给它赋值一个大小写混合的字符串时，子类会自动把字符串转化成小写，然后再调用父类的赋值过程。

```swift
let a = Foo(value: "Hello World")
let b = SubFoo(value: "Hello World")
debugPrint(a.value, b.value) // "Hello World", "Hello World"
b.value = "Hello Sailor"
debugPrint(a.value, b.value) // "Hello World", "hello sailor"
```

我不确定这个特性是否会带来非常多的应用场景，不过我认为绝对是有可能的。
