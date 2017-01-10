title: "单例中静态属性的额外作用"
date: 2017-01-10
tags: [Swift]
categories: [Erica Sadun]
permalink: dear-erica-singletons-and-property-observers
keywords: 单例, 静态属性
custom_title: 
description: 

---
原文链接=http://ericasadun.com/2017/01/05/dear-erica-singletons-and-property-observers/
作者=Erica Sadun
原文日期=2017-01-05
译者=星夜暮晨
校对=Crystal Sun
定稿=CMB

<!--此处开始正文-->

[Laptopmini](https://github.com/Laptopmini) 给我留言道：「是否可以为单例 (singleton) 的共享实例 (shared instance) 定义一个 `get` 闭包呢？我现在正在编写一个网络 socket 管理器，我希望在每次调用 `connect()` 的时候都能够匹配到这个实例」。

<!--more-->

一个基本的 Swift 单例如下所示：

```swift
public final class Singleton {
    public static let shared = Singleton()
    private init() { }
}
```

这种设计模式创建了一个类，这个类只有一个可访问的共享实例。此外这个类被标记为 `final`，其构造器的访问域为 `private`，以确保这个类型不能被继承，也不能通过 `shared` 之外的方法被实例化。

为了给大家介绍「静态属性的额外作用 (side effect)」，我们创建一个间接访问此单例的静态属性，然后向 `getter` 方法中添加自定义的行为：

```swift
public final class Singleton {
    private static let _shared = Singleton()
    private init() { }
    
    public static var shared: Singleton {
        get {
            print("side effects here")
            connect() // 举个栗子
            return _shared
        }
    }
}
```

这样写也行，不过这段代码还可以更为精简。对只读属性而言，完全可以移除 `get` 语法。直接将自定义行为移到最顶层的 `var` 闭包单重，如以下修改所示：

```swift
public final class Singleton {
    private static let _shared = Singleton()
    private init() { }
    
    public static var shared: Singleton {
        print("side effects here")
        connect() // 举个栗子
        return _shared
    }
}
```

来快速总结一下：

* 对于单例而言，请使用引用类型；
* 将单例类型标记为 `final`，其实例标记为 `public`，构造器标记为 `private`；
* 在命名的时候，尽量使用更符合 Swift 风格的 `shared`，而不是 Objective-C 风格的 `sharedInstance`；
* 如果在获取单例的时候还需要引入其他的额外作用，那么可以创建一个静态的只读属性；
* 对于只读属性而言，`get` 语法可以移除以达到精简的效果。

如果大家对这段代码有其他的改进或者建议，就和以前一样，在评论中留言评论，或者在 tweet 上私信我。

Rob N 在这里说得非常好：

> 「[@ericasadun](https://twitter.com/ericasadun) 这篇文章很好，但是我对其中的用例有些顾虑。也就是说 `self.websocket` 与 `Websocket.shared` 相比，它们的行为可能是大相径庭的，即便它们都是同一个对象。
> —— Rob Napier (@cocoaphony) [2017年1月5日](https://twitter.com/cocoaphony/status/817104066429980672)」