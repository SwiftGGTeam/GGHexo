为你的 Swift Packages 命名"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2016/02/08/naming-your-swift-packages/)，原文日期：2016-02-08
> 译者：[Cee](https://github.com/Cee)；校对：[小锅](http://www.swiftyper.com)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  









于是乎，在整理我大量 Swift 代码中的一小部分时，我决定利用一下 Swift Package Manager 的优势，将其中的一下推到 GitHub 上。这些都是[我](https://github.com/erica/SwiftUtility)！[做](https://github.com/erica/SwiftCollections)！[的](https://github.com/erica/SwiftString)！


在此之后，我突然意识到我的命名太糟糕了。我本应该用一种更加符合逻辑、可读性好的方式去命名。

包（Package）命名需要简洁易懂。是的，同样它们也需要避免重名情况的发生，因为当你有个叫做 SwiftString 的包时，可能 Bob、Jane、Harry 都会有同样名称的这个包。命名冲突是不可避免的。

再比如你的 `SwiftString.doSomethingMeaningfulWithAString()` 方法会和其他人的 `SwiftString.doSomethingMeaningfulWithAString()` 难以分辨。这时，也没有内置的解决办法来告诉我如何处理模块间的命名冲突。

今后的一种解决思路是提供命名空间（namespace）。例如，包声明的格式可能会加上 Origin 字段：

    
    import PackageDescription
    
    let package = Package(
        name: "SwiftString"
        origin: "com.sadun"
    )

有了这个，你可以通过使用命名空间来避免冲突：

    
    import com.sadun.SwiftString
    import com.LeeJason.SwiftString

以及：

    
    com.sadun.SwiftString.doSomethingMeaningfulWithAString()

众所周知，这样会在你只需要引入一到两个包的时候变得复杂一些，但是这样却能够很好地避免了引用上的歧义。

现在，虽然这些都还没有被公开认可，同时也没有官方的 SPM 包，但是你要知道我们的这些自我组织的包即将要登上历史舞台了。确保以一种清晰明了的方法来使用多个、可能在命名上有冲突的包将会是一件好事情。

从现在开始，使用 `SadunSwiftString` 而不是 `SwiftString` 来避免这些问题吧。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。