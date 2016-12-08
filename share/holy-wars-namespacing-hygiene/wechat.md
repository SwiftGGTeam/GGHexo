Swift 圣战：干净的命名空间"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2016/11/17/holy-wars-namespacing-hygiene/)，原文日期：2016-11-17
> 译者：[星夜暮晨](http://www.jianshu.com/users/ef1058d2d851)；校对：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；定稿：[CMB](https://github.com/chenmingbiao)
  









[sssilver](https://github.com/sssilver) 留言说：*「我发现我司的代码普遍都是这种情况：每个类都包含了一堆的静态方法。我问同事为什么不直接编写方法，他们回答说是不想污染命名空间。在类似 Rust 之类的语言当中，所有内容都位于模块内部。那么在 Swift 当中常见的做法是如何呢？」*



Swift 偏好于使用命名空间将函数及常量独立出来。这同样适用于模块内部的 API，您可以很轻易地获取常见的命名空间。如果您想要让命名空间保持干净、集中的话，那么通常而言，将内容限制在类型和协议当中是挺不错的选择。

这种做法使得 Swift 较以前的版本而言，更倾向于使用层次结构。Swift 更适合：

* 将常量放置到适合的类型当中，以完成命名空间的构建；
* 将函数放置到它们所需要服务的类型或者协议当中，可以使用静态方法，或者将首个参数移除然后将这个函数改造为一个实例方法；
* 添加子类型，而不是将所有东西都集中在父类型当中，这会污染命名空间。子类型使得父类以及其嵌套类型 (nested type) 在相互引用的时候减少引用的复杂度，因此 `Shape.Triangle` 以及 `Shape.Circle` 都可以很清楚地明白对方的作用；
* 将只会被一个方法调用的函数嵌入到这个方法当中，而不是创建另一个只用于服务相同对象的方法；
* 将运算符实现代码移到它们所作用的类型当中，这样便可以减少全局命名空间当中所实现的运算符数目。

此前您很可能创建了如下锁匙的公共常量和函数，现在最好是将它们合并到既有类型或者工具 (utility) 类型当中：

    
    public let π = CGFloat(Double.pi) // 不建议
    public let τ = π * 2.0 // 不建议
    
    public func halt() { // 不建议
        PlaygroundPage.current.finishExecution()
    }
    
    extension CGFloat { 
        /// 存放 π 常量，建议
        public static let (pi, π) = (CGFloat(Double.pi), CGFloat(Double.pi))
     
        /// 存放 τ 常量，建议
        public static let (tau, τ) = (2 * pi, 2 * pi)
    }
    
    extension PlaygroundPage {
        // 这看起来好看不少
        public static func halt() {
            current.finishExecution()
        }
    }

将全局量作为静态成员嵌入到类型当中，使得命名空间更加干净、Swift 化，并且还让性能开销降到最低。只要条件允许，您应该尽量去扩展苹果所提供的类型 (例如 `CGFloat` 以及 `PlaygroundPage` )，而不是创建新的类型 (例如 `MathConstants` 或者 `PlaygroundRuntimeSupport`)。

与此同时，不要强行将常量和函数放到并不适合的类当中。如果您必须要创建一个新的类型来生成一个新的命名空间，那么请使用不包含枚举值的枚举，这将保证这个类型无法被构造出来。

在文章发布之后，我可能还会有新的思路，所以如果我遗漏了些什么，请联系我，我会及时地更新这篇文章。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。