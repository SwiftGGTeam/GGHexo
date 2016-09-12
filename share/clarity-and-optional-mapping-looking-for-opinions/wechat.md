是否应该使用可选映射？"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2015/12/27/clarity-and-optional-mapping-looking-for-opinions/)，原文日期：2015-12-27
> 译者：[Cee](https://github.com/Cee)；校对：[靛青K](http://blog.dianqk.org/)；定稿：[numbbbbb](http://numbbbbb.com/)
  









在 Swift-Evolution 中有个关于如何简洁地用一个可选值作为 key 获取字典的 value 的讨论：

    
    let dict: [SomeType: ...] = ...
    let key: SomeType? = someCall()
    let value = dictionary[key] but only if key is non-nil



Dave Abrahams 指出，标准的查询格式应该是这样的：

    
    // if let value = key.map({ dict[$0] }) {...} // 错误！
    if let value = key.flatMap({dict[$0]}) {...} // 感谢 @oisdk
    // 这个 gist (https://gist.github.com/oisdk/4c40958d341952fde5af) 指出了 map 和 flatMap 的区别

这种方法使用了可选映射（Optional mapping）（译者注：关于 map 和 flatMap 的区别，可以参考之前的文章：[Swift：map 和 flatMap 基础入门](http://swift.gg/2015/11/26/swift-map-and-flatmap/)，返回一个非可选类型，即是 `.Some(...)` 而不是 `.None`。这很简单并且使用了一个单独的绑定状态的查询。

当我为写法简单而鼓掌时，我不禁想到下面多步的做法（更加复杂）相对来说可能会在效率上有所损失：

    
    if let key = key, value = dict[key] {...}

这个复合的 if-let 语句先将可选键值绑定，再在第二个小句中去进行查找对应值。和之前使用可选映射的功能并无区别，但是意义上更加清晰了。至少对我而言是这样的。

不过正如 [Kevin Ballard](http://www.twitter.com/Eridius) 指出的那样，这种做法也有不好之处，就是它绑定了另外一个变量。这个例子里 `key` 已经作为变量所定义，但是如果改变了调用的方法，那么请看下面的这个例子：

    
    if let key = foo(), value = dict[key] { ... }

这就影射出之前例子中没有显现出来的变量问题了。如果像这样定义，会导致 if 语句执行内部的闭包中的命名冲突。这种情形可能很难发生，但是可选映射中就不会发生这种问题：

    
    // if let value = foo().map({dict[$0]}) { ... } // 错误！
    if let value = foo().flatMap({dict[$0]}) { ... } // 再次感谢 @oisdk

即使这样，我还是觉得两步的方式胜在了可读性上。函数式链式调用会变得更加复杂，而且在现实情况中也会因为实际问题让代码使用更多符号、变得冗长。代码看上去变得优雅却很难发现问题。

对于我来说，我会问自己下面这几个问题：

- 可选映射的方法能让我写出更高效的代码吗？*略微有点*
- 可选映射能够有效避免可能发生的错误吗？*有可能，但是也可能带来问题*
- 可选映射能够更好地表达编程的思路吗？*对于我来说不，但是有可能让那些理解「映射」和「可选值」的人来说是*
- 使用可选映射维护代码能变简单吗？*我不这么认为*

这就是我的想法。你怎么看？
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。