准备好迎接 3.0 API 变化"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2016/04/08/preparing-for-3-0-api-pruning/)，原文日期：2016-04-08
> 译者：[zltunes](http://zltunes.com)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[numbbbbb](http://numbbbbb.com/)
  







据 Chris Lattner 所说，即将发布的 Swift 3 将在我们熟悉的 Cocoa 和 CocoaTouch 上做出重大改变。

> 在 Swift 3 中, `.blackColor()` 变成了 `.black()`。

这一变化包含在将 Objective-C API 转化成 Swift 的提案 [SE-0005](https://github.com/apple/swift-evolution/blob/master/proposals/0005-objective-c-name-translation.md) 中。由于属性名结尾的单词和属性类型已经包含了足够的信息，因此可以删掉 `Color`：

    
    class func darkGrayColor() -> UIColor
    // 因此
    foregroundColor = .darkGrayColor()
    // 变成了
    foregroundColor = .darkGray()



我简单总结了几条简化规则。记住，如果以下规则（进行简化）产生了一个不合法的结果（空的`selector`、`Swift`关键字等），那就不必遵循该规则。

**简化 #1**：去除相同类型成员前边的类型名称：

    
    let c = myColor.colorWithAlphaComponent(0.5)
    // 变为
    let c = myColor.withAlphaComponent(0.5)

**简化 #2**：如果类型名后是 *by* + <del>现在分词</del> 动名词 形式，则将 "by" 一同去掉。

    
    let img = myImage.imageByApplyingOrientation(o)
    // 变为
    let img = myImage.applyingOrientation(o)

**简化 #3**：当方法选择器中含有类型名并满足以下情况时，去掉类型名称：

| 尾部位于： | 需精简部分： | 
| --- | --- | 
| 引入参数的选择器|参数类型名|
| 属性名称|属性类型名|
| 无参方法名|返回类型名|

    
    documentForURL(_ url: NSURL)
    var parentContext: NSManagedObjectContext?
    class func darkGrayColor() -> UIColor
    // 变为
    documentFor(_ url: NSURL)
    var parent: NSManagedObjectContext?
    class func darkGray() -> UIColor

**简化 #4**：去掉方法名中动词后的类型名：

    
    myVC.dismissViewControllerAnimated(...)
    // 变为
    myVC.dismissAnimated(...)
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。