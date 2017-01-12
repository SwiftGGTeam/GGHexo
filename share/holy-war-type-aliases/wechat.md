Swift 圣战：类型别名"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2017/01/09/holy-war-type-aliases/)，原文日期：2017-01-09
> 译者：[星夜暮晨](http://www.jianshu.com/users/ef1058d2d851)；校对：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；定稿：[CMB](https://github.com/chenmingbiao)
  







 

Kyle Cardoza 留言给我：*「Erica，当您必须处理指向不同类型的 `OpaquePointer` 值时，为 `OpaquePointer` 建立一个别名是否是糟糕的代码风格呢？我觉得类型别名让代码读起来更舒服……」*。

使用类型别名来创建「假型 (pseudotypes)」(而通常类型别名只会重复表述一个类型)，可以用来整齐地组织代码。我赞成任何可以强化语义表述和加强可读性的方案。由于 `OpaquePointer` 并不是泛型，因此我们没办法像 `Array<Int>` 或者 `Set<String>` 那样来封装类型的信息。



    
    // 两者的类型都是 `OpaquePointer`，因此没有办法能具体区分这两者
    let p1 = OpaquePointer(unsafeMutableRawPtr1)
    let p2 = OpaquePointer(unsafeMutableRawPtr2)

构建便利类型别名 (convenience typealias) 可以强调出结构相同、但用法不同的类型之间的区别。这可以区分每个使用点的具体类型，并且提供了内置的「类型评论 (type commentary)」。

    
    typealias OpaqueType1Pointer = OpaquePointer
    typealias OpaqueType2Pointer = OpaquePointer
    
    let p1: OpaqueType1Pointer = OpaquePointer(rawPtr1)
    let p2: OpaqueType2Pointer = OpaquePointer(rawPtr2)

然而，您可能还会考虑其他的替代方案。如果您打算减少一些类型安全增强方面的开销，那么可以考虑引入一个简单的值类型，将 `OpaquePointer` 封装起来，就能够使用特定类型的构造器来完成构造了。这里有一个非常粗略的示例：

    
    struct SometypeWrapper {
      let opaque: OpaquePointer
      init(value: Sometype) {
        opaque = OpaquePointer(Unmanaged.passRetained(value).toOpaque())
      }
    }

你怎么看？类型别名是一个好的选择吗？或者是一个糟糕的做法呢？还是需要构建一个封装呢？请告知您的看法，可以在留言区评论，或者给我发 tweet。

*感谢 Mike Ash 的帮助*。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。