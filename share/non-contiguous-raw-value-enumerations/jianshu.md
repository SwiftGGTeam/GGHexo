枚举的非连续原始值"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2017/01/30/non-contiguous-raw-value-enumerations/)，原文日期：2017-01-30
> 译者：[星夜暮晨](http://www.jianshu.com/users/ef1058d2d851)；校对：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；定稿：[CMB](https://github.com/chenmingbiao)
  









[Brennan Stehling](https://github.com/brennanMKE) 近来发现了一个我一直不知道的 Swift 神奇特性。众所周知，可以创建一个这样的原始值 (raw value) 枚举：即每个枚举成员的原始值皆可以自动递增。



    
    enum MyEnumeration: Int {
       case one = 1, two, three, four
    }
    
    MyEnumeration.three.rawValue // 3

此外我们还可以手动编排原始值枚举的值：

    
    enum MyEnumeration: Int {
        case one = 1, three = 3, five = 5
    }

然而， 我并不知道可以在同个枚举声明中将两者[混搭起来](https://gist.github.com/brennanMKE/482452bb9ac5f578907f413902753eec)！（虽然，对于有标准规定的数值而言，不应该写类似下面示例的代码）

    
    enum HTTPStatusCode: Int {
        // 100 Informational
        case continue = 100
        case switchingProtocols
        case processing
        // 200 Success
        case OK = 200
        case created
        case accepted
        case nonAuthoritativeInformation
    }
    
    HTTPStatusCode.accepted.rawValue // 202

这个特性是不是很酷啊？

我可能会将此方法应用于带有偏移量的值当中（例如「从 1 开始」），此外这个值本身也不应存有既定语义。正如 Kristina Thai [所言](http://twitter.com/kristinathai/status/827563234320216068)，跳过有意义的值并不能改善可读性，也不便我们进行语义检查。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。