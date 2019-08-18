Sequence 带来的更多乐趣"

> 作者：Jameson Quave，[原文链接](http://ericasadun.com/2016/08/10/more-fun-with-sequences/)，原文日期：2016-08-10
> 译者：[Joy](http://www.jianshu.com/users/9c51a213b02e/latest_articles)；校对：[bestswifter](http://bestswifter.com)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  









我想要分享一段来自 Swift 开发者的简短对话，KS Sreeram 写到：

> 我试图通过下面几步，通过最少的数据复制，高效地创建一个字节数组
> 
> 1. 创建一个空的字节数组。
> 2. 在数组中预留充足的空间。
> 3. 使用可变指针去做数组的数据填充。
> 4. 只有数组被填充之后，才能知道它的实际大小。
> 5. 我想要设置数组的大小为它被填充的实际大小。
> 
> 我还没有找到任何有效的方法去完成最后一步。有办法去这么做吗？



Dave Abrahams’ 的回应：

> 创建一个序列（Sequence）来表示你想要填充的数据，例如：

    
    var a = [1, 2]
    
    // a.reserve(256) - swift 2.2
    
    a.reserveCapacity(256) // swift 3.0
    
    a += sequence(first: 3, next: {$0 < 1000 ? ($0 + 3) * 2 : nil})

> 有很多的方法去创建序列，但是重载的 `sequence()` 函数可能是最简单的方式。

悲催的:

> [@jckarter](https://twitter.com/jckarter) [@ericasadun](https://twitter.com/ericasadun)，不幸的是，Dave 的解决方案不适用于序列化代码，这代码并不适用于控制反转。
> —— KS  Sreeram (@kssreeram) [2016 年 8 月 10 日](https://twitter.com/kssreeram/status/763440392926662656)
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。