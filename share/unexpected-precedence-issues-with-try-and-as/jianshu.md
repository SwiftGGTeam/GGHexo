try? 与 as? 之间的优先级问题"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2016/12/15/unexpected-precedence-issues-with-try-and-as/)，原文日期：2016-12-15
> 译者：[星夜暮晨](http://www.jianshu.com/users/ef1058d2d851)；校对：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；定稿：[CMB](https://github.com/chenmingbiao)
  









Tim Vermeulen 最近在 Swift Evolution 列表上，写到 `try?` 的优先级非常地出人意料：

    
    if let int = try? mightReturnInt() as? Int {
      print(int) // => Optional(3)
    }



具体来说，他发现 `try?` 的优先级比 `as?` 的优先级低，所以需要添加括号，才能够获取正确的结果。

    
    if let int = (try? mightReturnInt()) as? Int {
      print(int) // => 3
    }

此外，他还发现在既会返回可空值、又会抛出错误的情形下，也存在类似的问题：

    
    if let int = try? mightReturnInt() {
      print(int) // => Optional(3)
    }
    
    if let int = (try? mightReturnInt()) ?? nil {
      print(int) // => 3
    }

对于 `if let item = item as? T` 而言，是可以自动对可空值进行提取的，但是似乎目前却没有应用到 `try?` 当中。如果遇到这种情况，请考虑如示例所示，添加括号或者使用空合运算符 (nil coalescing) 来解决这个问题。

如果您觉得这种既有可空值又有错误抛出的情形太「罕见」的话，那么可以想一想文件系统请求，可能会抛出一个错误「目录不可读」，也可能会在指定文件不存在的时候返回 `nil`。尽管这种情况比较少见，但是将 `try?` 和 `as?` 结合起来使用的情形还是有可能出现的。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。