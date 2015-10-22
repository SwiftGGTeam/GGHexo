title: "Swift编程思想第三部分：结构体和类"
date: 2015-10-20 09:00:00
tags: [Crunchy Development]
categories: [Swift 进阶]
permalink: thinking-in-swift-3

---
原文链接=http://alisoftware.github.io/swift/2015/10/03/thinking-in-swift-3/
作者=Olivier Halligon
原文日期=2015-10-03
译者=ray16897188
校对=pmst
定稿=小锅
发布时间=2015-10-20T09:00:00

系列文章地址：

* [Swift 编程思想，第一部分：拯救小马](http://swift.gg/2015/09/29/thinking-in-swift-1/)
* [Swift 编程思想，第二部分：数组的 Map 方法](http://swift.gg/2015/10/09/thinking-in-swift-2/)

继续说咱的"Swift编程思想系列"，今天我们将会做一些小小的改动，使用 `struct（结构体）` 来使代码得到进一步的简化。

<!--more-->

### 前面的内容
在[这个系列之前的一篇文章里](http://alisoftware.github.io/swift/2015/09/20/thinking-in-swift-2/)我们学到了对数组(arrays)使用 `map` 和 `flatMap`，消除了中间变量(intermediate variables)形式的状态性(statefulness)，并使用了一些函数式编程<sup>1<sup>。

下面是我们之前收工时的代码，贴在这里回顾一下：
```swift
class ListItem {
    var icon: UIImage?
    var title: String = ""
    var url: NSURL!

    static func listItemsFromJSONData(jsonData: NSData?) -> [ListItem] {
        guard let nonNilJsonData = jsonData,
            let json = try? NSJSONSerialization.JSONObjectWithData(nonNilJsonData, options: []),
            let jsonItems = json as? Array<NSDictionary>
            else {
                return []
        }

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
    }
}
```
今天我们将对例子进行相当简单的改动，使得代码更加精简以及显得"雨燕风"(Swift-er)。

###Struct相比Class

正如上面代码所示，首先考虑使用类(`class`)是Swift初学者经常犯的一个错误。不过这可以理解，因为在ObjC中我们满世界的用class。

使用`class`不是什么原则性错误。在Swift中当然也可以继续用。但是`Swift`的结构体(`struct`)比它 C 前身的结构体要强大很多：它们不再只是存储一系列的值。

Swift的结构体(`structs`)和类(`Class`)具有相同的功能 - 除了继承 - 结构体是**值类型(value-types)** (所以每一次变量赋值都是通过值拷贝的形式，与`Int`类型很相像)，而类属于**引用类型(reference-types)**，以引用方式传递而非值拷贝，这和Objective-C(以及OC中无处不在的难看的`*`，也代表着引用)中一样。

我不会在这里展开长篇论述，讨论结构体、值类型和类、引用类型相比较孰胜孰劣：我还是直接强烈建议你看一下[Andy Matuschak对此话题的精彩论述](https://realm.io/news/andy-matuschak-controlling-complexity/)。我不需要自己再解释了，Andy说的比我好。

### 把我们的class转换成struct
在我们的例子中，使用一个结构体看起来更为合适，因为它保存了一些值，并且并不会要对它们做什么改变(更适合拷贝而非引用)。案例中，我们把它用作一个菜单栏的数据源，一旦创建就不再对其更改，所以这也是使用结构体更为合理的一个场景。

还有，这里把`class`迁移成`struct`的另一个优势是，如果`struct`没有定义适合一个构造器，则它会生成一个默认的隐式构造器：所以我们可以非常容易的用默认构造器`ListItem(icon: …, title: …, url: …)`去创建一个`ListItem`。

最后一项要点是，由于在之前的文章中我们消除了数据损坏的问题，有问题的`ListItem`就不会被创建出来了，我们就可以把`title`的默认值`""`消除掉，但更重要的是我们就能把`NSURL!`转换成`NSURL!`去**[拯救最后一匹小马](http://alisoftware.github.io/swift/2015/09/06/thinking-in-swift-1/)**🐴<sup>2<sup>。

转换之后的代码如下：
```swift
struct ListItem {
    var icon: UIImage?
    var title: String
    var url: NSURL

    static func listItemsFromJSONData(jsonData: NSData?) -> [ListItem] {
        guard let nonNilJsonData = jsonData,
            let json = try? NSJSONSerialization.JSONObjectWithData(nonNilJsonData, options: []),
            let jsonItems = json as? Array<NSDictionary> else { return [] }

        return jsonItems.flatMap { (itemDesc: NSDictionary) -> ListItem? in
            guard let title = itemDesc["title"] as? String,
                let urlString = itemDesc["url"] as? String,
                let url = NSURL(string: urlString)
                else { return nil }
            let iconName = itemDesc["icon"] as? String
            let icon = UIImage(named: iconName ?? "")
            return ListItem(icon: icon, title: title, url: url)
        }
    }
}
```

现在当一切都就绪之后，我们只在最后一步创建才创建出`ListItem`实例，如果你不提供任何`init`方法的话`struct`会提供一个默认的`init`方法为它自己的参数段传值。用`class`的版本可以做相同的事，但是用`class`的话我们得自己声明`init`。

### 联合操作符(Coalescing operator)
上面的例子中我还用了一个新的小技巧，使用`??`操作符让`iconName`在是`nil`的时候给出一个默认值。

`??`操作符和ObjC的`opt ?: val`表达式很像，了解它的人都知道：`opt ?? val`如果在`opt`非空的时候返回它的值，如果是`nil`的话会返回`val`。这意味着如果`opt`是`T?`类型，`val`则必须是`T`类型，整个表达式的结果也会是`T`类型。

那么这里的`iconName ?? ""`会允许我们在`iconName`为`nil`的时候使用一个空字符`""`的图片名称，于是这里会有一个`nil`的`UIImage`，并且`icon`也会是`nil`。

⚠️注意⚠️：将一个为`nil`的`iconName`和一个`nil`的`UIImage`作为结果来处理，这并**不是**最佳的、最简洁的做法。实际上使用一个假的`""`名字来获得一个空图片看起来有点儿难看，还有点儿欺骗的意味。但是这是给你展示`??`操作符存在感的一个场合...嘿，我们还是为本系列文章的下一篇保留一些好东西吧(剧透：又涉及到了`flatMap`)。

###结论
今天就到这里了。

在第3部分中我们没做太多事情，仅仅就是把`class`换成了`struct`。我甚至没讲哪怕一点儿关于两者之间的区别(然而即使我最近特别忙，有段时间没在blog上发东西了，我还是不想你为新文章等待太久)。

但是我们最终丢弃掉`NSURL!`，将最后一匹小马拯救🎉。在我下一篇文章发布出来前，看一下[Andy关于《和值类型交朋友》的超棒讨论](https://realm.io/news/andy-matuschak-controlling-complexity/)，你还是有很多东西要去学的。

我承诺在发布第4部分之前不会让你等太久，第4部分又涉及到`map`和`flatMap`，但这一次是基于`Optionals`。

----

1. 没错，上篇文章中你确实做了一些函数式编程...你自己可能甚至都没有意识到。

=======
title: "Swift编程思想第三部分：结构体和类"
date: 2015-10-20 09:00:00
tags: [Erica Sadun]
categories: [Swift 进阶]
permalink: thinking-in-swift-3

---
原文链接=http://alisoftware.github.io/swift/2015/10/03/thinking-in-swift-3/
作者=Olivier Halligon
原文日期=2015-10-03
译者=ray16897188
校对=pmst
定稿=小锅
发布时间=2015-10-20T09:00:00

继续说咱的"Swift编程思想系列"，今天我们将会做一些小小的改动，使用 `struct（结构体）` 来使代码得到进一步的简化。

### 前面的内容
在[这个系列之前的一篇文章里](http://alisoftware.github.io/swift/2015/09/20/thinking-in-swift-2/)我们学到了对数组(arrays)使用 `map` 和 `flatMap`，消除了中间变量(intermediate variables)形式的状态性(statefulness)，并使用了一些函数式编程<sup>1<sup>。

下面是我们之前收工时的代码，贴在这里回顾一下：
```swift
class ListItem {
    var icon: UIImage?
    var title: String = ""
    var url: NSURL!

    static func listItemsFromJSONData(jsonData: NSData?) -> [ListItem] {
        guard let nonNilJsonData = jsonData,
            let json = try? NSJSONSerialization.JSONObjectWithData(nonNilJsonData, options: []),
            let jsonItems = json as? Array<NSDictionary>
            else {
                return []
        }

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
    }
}
```
今天我们将对例子进行相当简单的改动，使得代码更加精简以及显得"雨燕风"(Swift-er)。

###Struct相比Class

正如上面代码所示，首先考虑使用类(`class`)是Swift初学者经常犯的一个错误。不过这可以理解，因为在ObjC中我们满世界的用class。

使用`class`不是什么原则性错误。在Swift中当然也可以继续用。但是`Swift`的结构体(`struct`)比它 C 前身的结构体要强大很多：它们不再只是存储一系列的值。

Swift的结构体(`structs`)和类(`Class`)具有相同的功能 - 除了继承 - 结构体是**值类型(value-types)** (所以每一次变量赋值都是通过值拷贝的形式，与`Int`类型很相像)，而类属于**引用类型(reference-types)**，以引用方式传递而非值拷贝，这和Objective-C(以及OC中无处不在的难看的`*`，也代表着引用)中一样。

我不会在这里展开长篇论述，讨论结构体、值类型和类、引用类型相比较孰胜孰劣：我还是直接强烈建议你看一下[Andy Matuschak对此话题的精彩论述](https://realm.io/news/andy-matuschak-controlling-complexity/)。我不需要自己再解释了，Andy说的比我好。

### 把我们的class转换成struct
在我们的例子中，使用一个结构体看起来更为合适，因为它保存了一些值，并且并不会要对它们做什么改变(更适合拷贝而非引用)。案例中，我们把它用作一个菜单栏的数据源，一旦创建就不再对其更改，所以这也是使用结构体更为合理的一个场景。

还有，这里把`class`迁移成`struct`的另一个优势是，如果`struct`没有定义适合一个构造器，则它会生成一个默认的隐式构造器：所以我们可以非常容易的用默认构造器`ListItem(icon: …, title: …, url: …)`去创建一个`ListItem`。

最后一项要点是，由于在之前的文章中我们消除了数据损坏的问题，有问题的`ListItem`就不会被创建出来了，我们就可以把`title`的默认值`""`消除掉，但更重要的是我们就能把`NSURL!`转换成`NSURL!`去**[拯救最后一匹小马](http://alisoftware.github.io/swift/2015/09/06/thinking-in-swift-1/)**🐴<sup>2<sup>。

转换之后的代码如下：
```swift
struct ListItem {
    var icon: UIImage?
    var title: String
    var url: NSURL

    static func listItemsFromJSONData(jsonData: NSData?) -> [ListItem] {
        guard let nonNilJsonData = jsonData,
            let json = try? NSJSONSerialization.JSONObjectWithData(nonNilJsonData, options: []),
            let jsonItems = json as? Array<NSDictionary> else { return [] }

        return jsonItems.flatMap { (itemDesc: NSDictionary) -> ListItem? in
            guard let title = itemDesc["title"] as? String,
                let urlString = itemDesc["url"] as? String,
                let url = NSURL(string: urlString)
                else { return nil }
            let iconName = itemDesc["icon"] as? String
            let icon = UIImage(named: iconName ?? "")
            return ListItem(icon: icon, title: title, url: url)
        }
    }
}
```

现在当一切都就绪之后，我们只在最后一步创建才创建出`ListItem`实例，如果你不提供任何`init`方法的话`struct`会提供一个默认的`init`方法为它自己的参数段传值。用`class`的版本可以做相同的事，但是用`class`的话我们得自己声明`init`。

### 联合操作符(Coalescing operator)
上面的例子中我还用了一个新的小技巧，使用`??`操作符让`iconName`在是`nil`的时候给出一个默认值。

`??`操作符和ObjC的`opt ?: val`表达式很像，了解它的人都知道：`opt ?? val`如果在`opt`非空的时候返回它的值，如果是`nil`的话会返回`val`。这意味着如果`opt`是`T?`类型，`val`则必须是`T`类型，整个表达式的结果也会是`T`类型。

那么这里的`iconName ?? ""`会允许我们在`iconName`为`nil`的时候使用一个空字符`""`的图片名称，于是这里会有一个`nil`的`UIImage`，并且`icon`也会是`nil`。

⚠️注意⚠️：将一个为`nil`的`iconName`和一个`nil`的`UIImage`作为结果来处理，这并**不是**最佳的、最简洁的做法。实际上使用一个假的`""`名字来获得一个空图片看起来有点儿难看，还有点儿欺骗的意味。但是这是给你展示`??`操作符存在感的一个场合...嘿，我们还是为本系列文章的下一篇保留一些好东西吧(剧透：又涉及到了`flatMap`)。

###结论
今天就到这里了。

在第3部分中我们没做太多事情，仅仅就是把`class`换成了`struct`。我甚至没讲哪怕一点儿关于两者之间的区别(然而即使我最近特别忙，有段时间没在blog上发东西了，我还是不想你为新文章等待太久)。

但是我们最终丢弃掉`NSURL!`，将最后一匹小马拯救🎉。在我下一篇文章发布出来前，看一下[Andy关于《和值类型交朋友》的超棒讨论](https://realm.io/news/andy-matuschak-controlling-complexity/)，你还是有很多东西要去学的。

我承诺在发布第4部分之前不会让你等太久，第4部分又涉及到`map`和`flatMap`，但这一次是基于`Optionals`。

----

1. 没错，上篇文章中你确实做了一些函数式编程...你自己可能甚至都没有意识到。
2. `NSURL!`一直纠缠我到现在已经有段时间了，其实我就是太懒了，没去为`ListItem`类写一个正确的`init`方法。因为知道我迟早会把它弄掉，所以处理它之前我没想收拾那段代码样本。我们拯救最后一匹小马仅仅是时间问题。