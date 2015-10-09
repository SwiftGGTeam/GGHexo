Swift 编程思想，第二部分：数组的 Map 方法

> 作者：Olivier Halligon，[原文链接](http://alisoftware.github.io/swift/2015/09/20/thinking-in-swift-2/)，原文日期：2015-09-20
> 译者：[我偏笑](http://blog.csdn.net/nsnirvana)；校对：[pmst](http://www.jianshu.com/users/596f2ba91ce9/latest_articles)；定稿：[shanks](http://codebuild.me/)
  








在[本系列的第一篇文章](http://alisoftware.github.io/swift/2015/09/06/thinking-in-swift-1/)中，介绍了如何避免对可选类型强制解包以及拯救“小马”🐴 。在第二部分中，我们将会精简前文代码来让它看起来更有"雨燕风"(*Swift-er* : Swift编程语言风格)，同时向你介绍 `map()` 和 `flatMap()` 方法。



>今天这篇文章我们将要讨论数组的 `map()` 和 `flatMap()` 方法。

# 前情提要[<sup>1</sup>](thinking-in-swift-2/#note1)

友情提示: 以下为[前文](http://alisoftware.github.io/swift/2015/09/06/thinking-in-swift-1/)留下的代码:

``` 
class ListItem {
    var icon: UIImage?
    var title: String = ""
    var url: NSURL!

    static func listItemsFromJSONData(jsonData: NSData?) -> [ListItem] {
        guard let nonNilJsonData = jsonData,
            let json = try? NSJSONSerialization.JSONObjectWithData(nonNilJsonData, options: []),
            let jsonItems = json as? Array<NSDictionary>
            else {
                // 倘若JSON序列化失败，或者转换类型失败
                // 返回一个空数组结果
                return []
        }

        var items = [ListItem]()
        for itemDesc in jsonItems {
            let item = ListItem()
            if let icon = itemDesc["icon"] as? String {
                item.icon = UIImage(named: icon)
            }
            if let title = itemDesc["title"] as? String {
                item.title = title
            }
            if let urlString = itemDesc["url"] as? String, let url = NSURL(string: urlString) {
                item.url = url
            }
            items.append(item)
        }
        return items
    }
}
```

本文的目标是使用更多“雨燕风”的模式和语法，使得代码看起来更棒并且简洁。

# map()方法介绍

`map()` 是 `Array` 提供的方法，通过接收一个函数作为传入参数，对数组中每个元素进行函数变换得到新的结果值。这样只需要提供`X->Y`的映射关系，就能将数组`[X]`变换到新数组`[Y]`，而无需创建一个临时可变数组(注:即上面代码中的`items`变量)。

本例中，我们不再像之前一样用 `for` 来做循环，而是对 `jsonItems`(*JSON*数据:存储于类型为字典的数组中)使用 `map()` 方法，并传入一个变换函数(闭包)，将每个 `NSDictionary` 类型数组元素转换成我们所需的 `ListItem` 实例：



``` 
return jsonItems.map { (itemDesc: NSDictionary) -> ListItem in
    let item = ListItem()
    if let icon = itemDesc["icon"] as? String {
        item.icon = UIImage(named: icon)
    }
    if let title = itemDesc["title"] as? String {
        item.title = title
    }
    if let urlString = itemDesc["url"] as? String, let url = NSURL(string: urlString) {
        item.url = url
    }
    return item
}
```

这看起来只是个很小的改动，但是它让我们专注于怎样把 `NSDictionary` 转化成 `ListItem`，毕竟这是解决问题的核心。更为重要的是，避免了像在 ObjC 里做的那样，新建一个中间数组。我们应该尽可能地避免这种情况发生。

### 错误数据

目前代码还存在一个问题：即便输入的数据是不可用的，我们依然创建了一个 `ListItem` 实例(并返回添加到结果数组`jsonItems`当中)。所以，倘若某些 `NSDictionary`是无效的，最终的输出数组中，就会添加一些毫无意义的`ListItem()`空实例。
更重要的是，我们仍在杀死一些小马 🐴 。当我们使用`NSURL!`时，代码允许我们创建那些没有 `NSURL` 的 `ListItem()` 实例（我们没有一个有效的`url`键值，所以访问`item.url`不起作用），当我们访问无效的`NSURL!`时，程序将会崩溃。


为了解决这个问题，我们对变换函数稍加修改，当输入值无效时，返回一个值为`nil`的`ListItem`，这比返回一个错误或无内容的`ListItem`更为合适。



``` 
return jsonItems.map { (itemDesc: NSDictionary) -> ListItem? in
    guard …/* condition for valid data */… else { return nil }
    let realValidItem = ListItem()
    … /* fill the ListItem with the values */
    return realValidItem
}

```

但是如果 `jsonItems.map` 里面传入的函数参数类型为 `NSDictionary -> ListItem?`，最后我们得到的是一个 `[ListItem?]` 数组，那些原来是不可用 `NSDictionary` 的位置就被我们替换成了 `nil`。比原来要好一些了，但还不够。

# 使用flatMap()

这个时候就轮到 `flatMap()` 来救场了。

`flatMap()` 与 `map()` 相似，但 `flatMap()` 用的是 `T->U?` 变换而不是 `T->U` 转化，而且倘若变换后的数组元素值为 `nil`[<sup>2</sup>](thinking-in-swift-1/#note2)，则不会被添加到最后的结果数组里面。

从语法上，你可以这么理解，`flatMap` 就是先使用 `map`处理数组，接着将结果数组“压平”（顾名思义)，也就是从输出数组里剔除值为`nil`的元素。

通过`flatMap`方法改写后的实例代码如下:

``` 
return jsonItems.flatMap { (itemDesc: NSDictionary) -> ListItem? in
    guard let title = itemDesc["title"] as? String,
        let urlString = itemDesc["url"] as? String,
        let url = NSURL(string: urlString)
        else { return nil }
    let li = ListItem()
    if let icon = itemDesc["icon"] as? String {
        li.icon = UIImage(named: icon)
    }
    li.title = title
    li.url = url
    return li
}

```

现在我们只返回所有键都存在[<sup>3</sup>](/thinking-in-swift-1/#note3)并有效的 `ListItem`对象（保证 `NSURL`不为`nil`）。否则执行`guard`语句，返回`nil`值通知`flatMap`不要将这些无效元素添加到返回结果数组中。

这样做就更好更安全了，对吧？，我们解决了数据异常的问题，当有错误输入时候，避免了无效的`ListItem`项添加到数组当中。

# 结论

我们仍然有很多工作要做，但是今天就先做这些吧（让我们为本系列文章的下一篇准备一下材料！）

在这篇文章里面，我们学到了怎么用`map`或者`flatMap`来替换掉`for`循环，确保即便输入数据是不可用的的情况下，输出数组也不会出问题。这确实已经算是很大的进步了。

在下一篇文章里，将介绍如何用结构体(`struct`)重写`ListItem`类有助于探索 `map` 和 `flatMap` 的其它用法 -- 尤其是在处理 `Optionals` 的时候。

同时，希望你花点时间来深入了解一下 `map()` 和 `flatMap()` 在数组上的应用，我知道你第一次学的时候可能觉得它们很复杂，但是一旦你学会了，你什么时候都会想用它们。

![](http://swift.gg/img/articles/thinking-in-swift-2/map-everywhere.jpg1444352409.5202105)


[1](#note1): 请脑补一些作秀节目的用词

[2](#note2): `flatMap`还有其他一些作用。比如把一个二维数组变换为一维数组，比如，[[T]] -> [T]。但是在这里，我们只需要关注在如何使用 T->U? 的变换把 [T] 变成 [U]。

[3](#note3): 注意到我们的代码中，允许`NSDictionary`没有`icon`键，这意味着我们认为一个`ListItem`可以不需要有任何`icon`。但是其他键是必须的。