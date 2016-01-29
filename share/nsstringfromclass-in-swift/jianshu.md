优雅的 NSStringFromClass 替代方案"

> 作者：Natasha The Robot，[原文链接](https://www.natashatherobot.com/nsstringfromclass-in-swift/)，原文日期：2016-01-14
> 译者：[saitjr](http://www.brighttj.com)；校对：[千叶知风](http://weibo.com/xiaoxxiao)；定稿：[Cee](https://github.com/Cee)
  










使用 Swift 过程中，我意识到的第一个问题就是没有 `NSStringFromClass` 的替代方案。在自定义 `TableViewCell` 时，我喜欢用类名作为 cell 的 identifier，然后在重用队列中，通过 `NSStringFromClass` 来获得 identifier，从而避免拼写错误。

然而，在 Swift 中，我不得不写一个丑陋的 extension 来达到这一目的。（[参考 StackOverflow 的回答](http://stackoverflow.com/questions/24107658/get-a-user-readable-version-of-the-class-name-in-swift-in-objc-nsstringfromclas)）


    
    public extension NSObject{
        public class var nameOfClass: String{
            return NSStringFromClass(self).componentsSeparatedByString(".").last!
        }
    
        public var nameOfClass: String{
            return NSStringFromClass(self.dynamicType).componentsSeparatedByString(".").last!
        }
    }

不知道以下写法是什么时候出现的，但我确实在 [@aligatr](http://alisoftware.github.io/swift/generics/2016/01/06/generic-tableviewcells/) 发表的文章中看到了：

    
    // This now works!!!
    String(MyTableViewCell)

为确保这个方案可行，我在自己的工程中试了试，没想到真的成功了！！

![](http://swift.gg/img/articles/nsstringfromclass-in-swift/Screen-Shot-2016-01-15-at-9.12.02-AM.png1454009116.0360203)

    
    // BlueTableViewController
        override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
    
            // 从重用队列中取出 cell!!!
            let cell = tableView.dequeueReusableCellWithIdentifier(String(BlueTableViewCell), forIndexPath: indexPath)
    
            return cell
        }

超级赞赞赞，我终于可以删掉丑陋的 extension 了。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。