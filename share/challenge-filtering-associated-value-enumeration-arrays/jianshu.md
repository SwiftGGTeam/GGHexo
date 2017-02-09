等你来战：筛选枚举数组的关联值"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2017/01/31/challenge-filtering-associated-value-enumeration-arrays/)，原文日期：2017-01-31
> 译者：[星夜暮晨](http://www.jianshu.com/users/ef1058d2d851)；校对：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；定稿：[CMB](https://github.com/chenmingbiao)
  









本挑战由 Mike Ash 提供，如下所示，假设有这样一个枚举：

    
    enum Enum {
        case foo(Int)
        case bar(String)
        case qux(Int)
    }

这些枚举还组成了的一个数组：

    
    let items: [Enum] = [.foo(1), .bar("hi"), .foo(2)]

需要对数组进行筛选 (filter)，挑选并创建只包含某种枚举值 (case) 的新数组。麻烦的是，Swift 没有一种类似  `==` 或 `~=` 的操作符，可以让我们忽略枚举的关联值：

    
    // 不起作用
    let filtered = items.filter({ $0 == .foo })

那么应该怎么办呢？



### 第一次尝试

这是第一次尝试。代码尽管很丑，但是能用：

    
    let filtered = items.filter({ 
        switch $0 { case .foo: return true; default: return false } })

Evan Dekhayser [更偏好于 `if-case`](http://twitter.com/ERDekhayser/status/826508221418504194)：

    
    let filtered = items.filter({ 
        if case .foo = $0 { return true }; return false })

当然，这里也可以使用 `guard`：

    
    let filteredy = items.filter({ 
        guard case .foo = $0 else { return false }; return true })

### 第二次尝试

尽管同样丑陋，由于节省了几个字符，这段代码看起来要稍微简短一些。不过代码所需的执行步骤远比第一次尝试所的执行步骤要多：

    
    let filtered = items.filter({ 
        for case .foo in [$0] { return true }; return false })

还是很糟糕。

### 第三次尝试

我个人非常厌恶这个方法，因为我必须要分别为每个枚举值实现一个对应的属性。这简直就是车祸现场：

    
    extension Enum {
        var isFoo: Bool {
            switch self { case .foo: return true; default: return false }
        }
    }
    let filtered = items.filter({ $0.isFoo })

### 第四次尝试

这种做法比较恶心，因为它需要占位符来填充 `rhs` 的值，即便这个值从来没被用过。哦对了，这里就无法传递下划线 (`_`) 了：

    
    extension Enum {
        static func ~= (lhs: Enum, rhs: Enum) -> Bool {
            let lhsCase = Array(Mirror(reflecting: lhs).children)
            let rhsCase = Array(Mirror(reflecting: rhs).children)
            return lhsCase[0].0 == rhsCase[0].0
        }
    }
    let filtered = items.filter({ $0 ~= .foo(0) })

### 第五次尝试

接着我突然灵光一现，我们还可以使用反射 (reflection) 呀！如果不给关联值枚举提供特定值，它就会返回一个 `(T) -> Enum` 的函数。我写了很多很多，直到我突然意识到枚举的 *名称* 并没有保留在其反射当中：

    
    import Foundation
    
    extension Enum {
        var caseName: String {
            return "\(Array(Mirror(reflecting: self).children)[0].0!)"
        }
        
        static func ~= <T>(lhs: Enum, rhs: (T) -> Enum) -> Bool {
            let lhsCase = lhs.caseName
            let prefixString = "Mirror for (\(T.self)) -> "
            let typeOffset = prefixString.characters.count
            let typeString = "\(Mirror(reflecting: rhs).description)"
            let rhsCase = typeString.substring(from: typeString.index(typeString.startIndex, offsetBy: typeOffset))
            return true
        }
    }

没错……非常难看，此外，还毫无作用。

### 征集解决方案

我没有深入钻研这个问题，我决定把这个问题作为一个公开的挑战。您是否能想出一个简洁、易读、不怎么可怕（或许我应该说「更优雅」，但拜托，让我任性一下）的方法来实现这个功能呢？我相当怀疑我的第一次尝试可能是最好的，如果这是真的，我会非常难过。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。