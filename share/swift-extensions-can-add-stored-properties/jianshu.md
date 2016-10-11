Swift 扩展「可以」添加存储属性"

> 作者：Tikitu de Jager，[原文链接](https://medium.com/@ttikitu/swift-extensions-can-add-stored-properties-92db66bce6cd#.js5g1kawe)，原文日期：2015-10-31
> 译者：[Darren](https://github.com/Harman-darrenchen)；校对：[Cee](https://github.com/Cee)；定稿：[CMB](https://github.com/chenmingbiao)
  









好吧，其实我标题党了：Swift 扩展[只能添加计算属性](https://developer.apple.com/library/prerelease/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Extensions.html#//apple_ref/doc/uid/TP40014097-CH24-ID152)。然而如果你愿意用 [Objective-C 的关联对象](http://nshipster.cn/associated-objects/)，你可以在 Swift 中做一些同样有趣的事。有很多的模板可供选择，然而如果你用这些[太过显然的方式](http://stackoverflow.com/a/25428409/323083)，你也就牺牲了类型安全。我们可以做得更好吗？



当然可以。这里就是一些这样的函数，使用 Swift 类型推断的黑魔法，使你在类或协议扩展中写类型安全的非 Optional 计算属性时，就像存储属性一样。

    
    import Foundation
    func associatedObject<ValueType: AnyObject>(
            base: AnyObject, 
            key: UnsafePointer<UInt8>, 
            initialiser: () -> ValueType) 
            -> ValueType {
        if let associated = objc_getAssociatedObject(base, key) 
            as? ValueType { return associated }
        let associated = initialiser()
        objc_setAssociatedObject(base, key, associated, 
                                 .OBJC_ASSOCIATION_RETAIN)
        return associated
    }
    func associateObject<ValueType: AnyObject>(
            base: AnyObject, 
            key: UnsafePointer<UInt8>, 
            value: ValueType) {
        objc_setAssociatedObject(base, key, value, 
                                 .OBJC_ASSOCIATION_RETAIN)
    }

函数就那么长。你可以这样使用它们：

    
    class Miller {} // 这是我们要扩展的类
    class Cat { // 每个磨坊主都有一只猫
        var name = “Puss”
    }
    private var catKey: UInt8 = 0 // 我们还是需要这样的模板
    extension Miller {
        var cat: Cat { // cat「实际上」是一个存储属性
            get { 
                return associatedObject(self, key: &catKey) 
                    { return Cat() } // 设置变量的初始值
            }
            set { associateObject(self, key: &catKey, value: newValue) }
        }
    }

如果你在家可以跟着练习的话，你可以在 playground 中敲下下面几行代码，来确保它能正常工作。

    
    let grumpy = Miller()
    grumpy.cat.name // 显示 Puss
    grumpy.cat.name = “Hephaestos”
    grumpy.cat.name // 显示 Hephaestos

就这么简单！

---

致谢：这个实现至少一半来自于 [Eric-Paul Lecluse](http://epologee.com/)。他在扩展中使用了关联对象，我把这个模式提出来作为一个可重用的类，然后我们一起把这个类修改成了你看到的那两个方法。代码是我写的，如果其中有任何错误，都是我的锅。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。