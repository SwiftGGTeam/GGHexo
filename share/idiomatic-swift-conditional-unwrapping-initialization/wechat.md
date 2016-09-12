地道的 Swift：解包引导的初始化过程"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2016/08/04/idiomatic-swift-conditional-unwrapping-initialization/)，原文日期：2016/08/04
> 译者：[Cwift](http://blog.csdn.net/cg1991130)；校对：[Cee](https://github.com/Cee)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  










在 Swift-Users 上，丹问到：

> 最近我在做下面这样的东西：

    
    let dobString: String
    if let dob = dob {
        dobString = serverDateFormatter.stringFromDate(dob)
    }
    else {
        dobString = ""
    }

> 有没有更好更地道的写法能够实现同样的功能呢？



我猜 `serverDateFormatter` 是 `NSDateFormatter` 的一个实例。如果是这样的话，丹想要做的东西像下面这样表述可能会更好：

    
    let dobString: String = {
        guard let dob = dob else { return "" }
        return serverDateFormatter.string(from: dob)
    }()

我认为这样表述会清晰很多，`dobString` 只被提到了一次。（如果他使用的不是 `NSDateFormatter` 并且需要一个二级的解包，guard let 语句就需要第二个闭包来对 `stringFromDate` 返回的结果执行可选绑定。）

**更新**：蒂姆·维穆伦 写了一个更棒的单行代码：

    
    let dobString = dob.flatMap(serverDateFormatter.stringFromDate) ?? ""

我敢肯定这里使用 `map` 和 `flatMap` 均可，不过前者节省了四个字符。（译者注：这里所说的「均可」，是在 serverDateFormatter 不会返回可选型的前提下。）

你有更好的解决方案吗？把它抛到评论里、发到推特上或者添加到 Swift-Users 的邮件列表中吧。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。