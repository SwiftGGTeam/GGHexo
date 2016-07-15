Swift 范的 CGRect、CGSize 和 CGPoint"

> 作者：Andyy Hope，[原文链接](https://medium.com/swift-programming/swift-cgrect-cgsize-cgpoint-5f4196da9cf8#.xyzjottei)，原文日期：2016/02/03
> 译者：[saitjr](http://www.saitjr.com)；校对：[Channe](http://www.jianshu.com/users/7a07113a6597/latest_articles)；定稿：[aaaron7](http://www.jianshu.com/users/9efd08855d3a/)
  









从我决定拥抱 Swift 到现在已经 8 个月了。这几个月中，我一边学习着如何避免写出 Objective-C 风格的 Swift 代码，一边真正开始使用这门新语言。

不过最近我才发现，我的 CGGeometry 系列里结构体写法还不是 Swift 风格。

    
    CGRect, CGSize, CGPoint



## C 语法 —— 披着羊皮的狼

我相信下面这种写法，很多 Swift 开发者都会中枪，让我看见你们的双手！

    
    let rect  = CGRectMake(0, 0, 100, 100)
    let point = CGPointMake(0, 0)
    let size  = CGSizeMake(100, 100)

好了，手放下吧。别担心，这没什么好害羞的。

这样写是不对的，它很不 Swift 范。虽然它并不影响程序本身，但是它看起来更有点 Objective-C 范，或者... Java 范。

iOS 或 OS X 开发者能轻易说出这段代码的含义。这些语句早已烂熟于心，他们根本不会去纠结 CGGeometry 结构体的这些参数代表什么。

Swift 在很多方面对初学者都很友好，无论你是刚接触 Swift，还是刚接触编程。如果让初学者看上面的代码，他可能完全不知道那些数字的含义。所以，让我们来看看正确的 Swift 姿势吧：

    
    let rect  = CGRect(x: 0, y: 0, width: 100, height: 100)
    let size  = CGSize(width: 100, height: 100)
    let point = CGPoint(x: 0, y: 0)

每个参数前面都有了参数描述，这一点描述，就已经能让我们在第一眼明白代码含义了。除此之外，这种 CGGeometry 结构体构造器还有一个好处：传入的参数不仅可以是 `CGFloat` 类型，也可以是 `Int` 和 `Double`。

## Zero

    
    let rect  = CGRectZero
    let size  = CGSizeZero
    let point = CGPointZero

看上面这段代码，你很有可能还在这样写，对吧？

我们也应该将这种写法替换成 Swift 风格。别怕，只是多了一个字符而已。你能猜到怎么写吗？

    
    let rect  = CGRect.zero
    let size  = CGSize.zero
    let point = CGPoint.zero

这样写代码也更为清晰，Xcode 会将 `.` 前后部分分开高亮，`.zero` 会更亮一点（当然这取决于你的 Xcode 主题）。

## 取值

    
    CGRect frame   = CGRectMake(0, 0, 100, 100)
    CGFloat width  = CGRectGetWidth(frame)
    CGFloat height = CGRectGetHeight(frame)
    CGFloat maxX   = CGRectGetMaxX(frame)
    CGFloat maxY   = CGRectGetMaxY(frame)

如果你依然是个合格的 Objective-C 公民，那么你会采用以上方式去取 rect 中特定的值。但是...为什么我们不直接去访问这个变量呢？

    
    CGFloat width  = frame.size.width
    CGFloat height = frame.size.height

>   你的程序应该避免直接读写 `CGRect` 中的值，取而代之的是，采用对应的函数来处理相关参数。
>
>   — Apple, CGGeometry Reference Documentation

这可能就是你不直接访问的原因吧，不过没关系，Swift 提供了简单的点语法访问来取代之前不那么完美的 API。

    
    let frame  = CGRect(x: 0, y: 0, width: 100, height: 100)
    let width  = frame.width
    let height = frame.height
    let maxX   = frame.maxX
    let maxY   = frame.maxY

我还在 Swift playground 中列举了很多相关细节，链接在文末。

## 可变

    
    let frame = CGRect(x: 0, y: 0, width: 100, height: 100)
    let view  = UIView(frame: frame)
    view.frame.origin.x += 10

现在，你不仅可以直接修改 `frame` 中某一个变量的值，并且你也可以直接对 `frame` 包含的 `origin` 与 `size` 结构体重新赋值：

    
    let view = UIView(frame: .zero)
    view.frame.size   = CGSize(width: 10, height: 10)
    view.frame.origin = CGPoint(x: 10, y: 10)

这特性就足以让我们放弃使用 Objective-C 了。也终于不用为了修改 `CGRect` 的某一个值，而去创建一个全新的结构体了。作为 Objective-C 开发者，我不得不写了快两年这样的代码去修改 `frame` ：

    objective-c
    CGRect frame = CGRectMake(0, 0, 100, 100);
    UIView *view = [[UIView alloc] initWithFrame: frame];
    CGRect newFrame = view.frame;
    newFrame.size.width = view.frame.origin.x + 10;
    view.frame = newFrame;

不知道你怎样想，反正这样的代码真的令我抓狂。先将 `view` 的 `frame` 赋值给 `newFrame`，然后再修改 `newFrame`，最后重新赋给 `view.frame`。够了，谢谢你全家，我再也不想这样写了。

## 别忘了

以上的这些写法也同样适用于 UIKit 的其他部分结构体：

    
    UIEdgeInsets 
    
    var edgeInsets = UIEdgeInsets(top: 10, left: 10, bottom: 10, right: 10)
    edgeInsets.top += 10
    
    UIOffset
    
    var offset = UIOffset(horizontal: 10, vertical: 10)
    offset.vertical += 10

[文章代码](https://github.com/andyyhope/Blog_CGGeometry)可在 GitHub 上找到。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。