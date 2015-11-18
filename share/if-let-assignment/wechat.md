If-Let 赋值运算符

> 作者：Weston Hanners，[原文链接](http://www.alloc-init.com/2015/10/if-let-assignment/)，原文日期：2015-10-29
> 译者：[pmst](http://www.jianshu.com/users/596f2ba91ce9/latest_articles)；校对：[千叶知风](http://weibo.com/xiaoxxiao)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  









(AKA：你希望使用一个自定义操作符)

有多少次你是以这种匹配模式实现的呢？



    
    if let value = someOptionalValue as? String {
      self.value = value
    }

我一直使用这种方式进行JSON数据解析或者NSCoding的实现。但我觉得这对于Swift来说有点啰嗦，坚信肯定存在某种更好的方式。

[NSHipster](http://nshipster.com/swift-operators/)提出自定义逻辑或赋值运算符(`||=`)，这看起来很不错。不管怎样，它似乎还未为泛型实现(作者:如果这里我理解错了，请告诉我).我想我可以先试一试...

    
    infix operator ||= { associativity right precedence 90 }
    
    // 译者注: 测试只有加上<T>才能正常运行
    func ||= <T>(inout left: T, right: T?) {
        if let right = right {
            left = right
        }
    }

实际上它能够很好地工作，我将原代码简化如下:

    
    self.value ||= someOptionalValue as? String
或许这有点微不足道，但是当你需要连续处理一系列任务时，这节省了大量代码，变得更具可读性。

还有件事...我依然尝试去弄清楚这是怎么回事，但我最终定义了第二个方法用于可选类型赋值。而唯一的不同是现在左侧参数类型为`T?`

    
    func ||= <T>(inout left: T?, right: T?) { // The left param is now Optional
        if let right = right {
            left = right
        }
    }
    
    var someOptionalString: String?
    
    someOptionalString ||= newValue // Will assign when newValue is not optional

如果你有兴趣看看这个，请点击[Playground](http://www.alloc-init.com/wp-content/uploads/2015/10/if-let-operator.playground.zip)下载。

温馨提示: 文章测试环境是Swift2.0。

**更新日志 11/01/2015:**

twitter上有人提醒我: ruby中`||=`等价于`left = left || right`，与我想要实现的`left = right || left`不同。我对这种用法不是很了解，为了避免混淆，我可能使用另外一个操作符`?=`替代。

    
    infix operator ?= { associativity right precedence 90 }
    
    func ?=<T>(inout left: T, right: T?) {
        if let value = right {
            left = value
        }
    }
    
    func ?=<T>(inout left: T?, right: T?) {
        if let value = right {
            left = value
        }
    }



> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。