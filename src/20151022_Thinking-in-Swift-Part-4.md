title: "Swift 编程思想，第四部分：map all the things!"
date: 2015-10-22 09:00:00
tags: [Swift 进阶]
categories: [Crunchy Development]
permalink: thinking-in-swift-4

---
原文链接=http://alisoftware.github.io/swift/2015/10/11/thinking-in-swift-4/
作者=Olivier Halligon
原文日期=2015-10-11
译者=ray16897188
校对=Prayer
定稿=numbbbbb

<!--此处开始正文-->

系列文章地址：

* [Swift 编程思想，第一部分：拯救小马](http://swift.gg/2015/09/29/thinking-in-swift-1/)
* [Swift 编程思想，第二部分：数组的 Map 方法](http://swift.gg/2015/10/09/thinking-in-swift-2/)
* [Swift编程思想第三部分：结构体和类](http://alisoftware.github.io/swift/2015/10/03/thinking-in-swift-3/)


[在本系列之前的文章中](http://swift.gg/2015/10/09/thinking-in-swift-2/)我们学到了如何使用`map`和`flatMap`来操作数组(arrays)。今天我们继续研究如何对可选类型(Optionals)以及很多其他类型使用`map`和`flatMap`。

<!--more-->

### 数组 vs. 可选类型
回顾一下，学完前面的文章后我们已经知道，`Array<T>`对应的`map()`和`flatMap()`函数签名是：

```swift
// 作用在Array<T>上的方法
    map( transform: T ->          U  ) -> Array<U>
flatMap( transform: T ->    Array<U> ) -> Array<U>
```

意思是你可以用一个给定的`transform: T->U`将一个元素类型是`T`的数组转换成一个元素类型是`U`的数组。对`Array<T>`调用`map( transform: T->U )`方法就会返回一个`Array<U>`，就这么简单。

嗯，不出意外，对于`Optional<T>`来说，`map()`和`flatMap()`的函数签名十分类似：

```swift
// 作用在Optional<T>上的方法
    map( transform: T ->          U  ) -> Optional<U>
flatMap( transform: T -> Optional<U> ) -> Optional<U>
```

是不是很像？

### 作用在可选类型上的 map()
那么`map`方法到底对`Optional<T>`类型(也叫做`T?`)做了什么？

其实很简单：和作用在`Array<T>`上的一样，`map`方法将`Optional<T>`中的内容取出来，用指定的`transform: T->U`方法做出转换，然后把结果包装成一个新的`Optional<U>`。

如果细想一下，这和`Array<T>.map`做的事情十分相似：这个方法对`Array<T>`(与之相应的是`Optional<T>`)中的每个元素使用`transform`函数转换，并将转换过的值封装在一个新的`Array<U>`中(与之相应的是`Optional<U>`)，作为结果返回。

### 回到我们的例子

那么这对我们一直在做的示例代码有什么帮助？

在[我们最新版代码中](http://alisoftware.github.io/swift/2015/10/03/thinking-in-swift-3/#converting-our-class-to-a-struct)，有一个`String?`类型的`itemDesc["icon"]`，我们当时想把它转换成一个`UIImage`；但是`UIImage(named:)`要求传入一个`String`型的参数，而不是`String?`型，所以我们需要在可选型中确实有值时(非`nil`)将内部的`String`值传入。

一种解决方案是使用可选绑定(Optional Binding)：

```swift
let icon: UIImage?
if let iconName = itemDesc["icon"] as? String {
  icon = UIImage(named: iconName)
} else {
  icon = nil
}
```

但是对于一个如此简单的操作来说代码量太大。

之前的一个例子中我们用了另外一种(很不优雅的)方式，使用`nil`-联合操作符`??`。

```swift
let iconName = itemDesc["icon"] as? String
let icon = UIImage(named: iconName ?? "")
```
这么做是可以，但是之所以能够成功，是因为当`iconName`是`nil`时，我们实际上是使用了`UIImage(named: "")`的初始化方法，这个初始化方法在传入空字符串时，会返回`nil`。但是这样的解决办法不是很好，因为我们是依赖于该初始化方法的特性（传入空字符串时，会返回`nil`）来实现的。

### 来用 map 吧

那么为什么不用`map`呢？本质上，我们是想要在`Optional<String>`不是`nil`的时候将其解包，把里面的值转换成一个`UIImage`对象然后把这个`UIImage`返回，这不就是一个绝佳的用例么？

试试看：

```swift
let iconName = itemDesc["icon"] as? String
item.icon = iconName.map { imageName in UIImage(named: imageName) }
```

等会儿.... 编译不通过。能猜出为什么吗？

### 哪儿有问题？

上面的代码中的问题是`UIImage(named: …)`也返回一个可选类型：如果对给定的`name`没有相应的图片，就不能创建出一个`UIImage`，所以这种情况下该初始化方法为*可失败的(failable)*，并返回`nil`，是完全合理的。

于是问题就在于我们给`map`的这个闭包用一个`String`作为参数而返回...一个`UIImage?`类型——因为图片的初始化方法是*可失败的*，会返回`nil`。再看一下`map`方法的签名，它想要的是一个`T->U`类型的闭包，这个闭包会返回一个`U?`类型。我们的例子中，`U`代表`UIImage?`的话，整个`map`表达式会返回一个`U?`类型，也就是...一个`UIImage??`类型...是的，一个双重可选类型，吓死宝宝了！

### flatMap() 来帮忙了

`flatMap()`与`map`类似，但是做的是一个`T->U?`的转换(不是`T->U`)，它把结果“扁平化(顾名思义)”成一个单重的可选类型。这恰恰就是我们所需要的！

```swift
let iconName = itemDesc["icon"] as? String
item.icon = iconName.flatMap { imageName in UIImage(named: imageName) }
```

实际中`flatMap`做了如下工作：

- 如果`iconName`是`nil`的话，它就直接返回`nil`(但返回类型还是`UIImage?`)
- 如果`iconName`不是`nil`，它就把`transform`作用到`iconName`的实际的值上，尝试用这个`String`创建一个`UIImage`并将结果返回——结果本身已经是一个`UIImage?`类型，因此如果`UIImage`初始化方法失败的话，返回结果就是`nil`。

简而言之，`item.icon`只会在`itemDesc["icon"] as? String`非空、并且`UIImage(named: imageName)`初始化方法成功的情况下才是一个非空值。

和使用`??`欺骗初始化方法相比，这么做更好，更地道。

### 把 init 当闭包来用

更进一步，由于现在 Xcode 7 可以通过类型的`.init`属性暴露该类型的构造器(constructors)，上面的代码还能写的更加紧凑。

这意味着`UIImage.init`本质上就已经是一个接收`String`并返回`UIImage?`的方法了，所以我们可以把它直接当成参数来调用`flatMap`，不用把它再包进一个闭包里！

```swift
let iconName = itemDesc["icon"] as? String
item.icon = iconName.flatMap(UIImage.init)
```

哇哦！太魔幻了！

![](/img/articles/thinking-in-swift-4/magic.gif1445562506.7864432)

好了，有人说这么写很难读懂，为了让代码更明了更清晰，在这里还是更喜欢用一个显式闭包。但是这只是关乎个人偏好，并且知道这么做可行也是好事。

### 最终的Swift代码
下面就是将本课所学应用到之前代码里的样子：

```swift
struct ListItem {
  var icon: UIImage?
  var title: String
  var url: NSURL
  
  static func listItemsFromJSONData(jsonData: NSData?) -> [ListItem] {
    guard let jsonData = jsonData,
      let json = try? NSJSONSerialization.JSONObjectWithData(jsonData, options: []),
      let jsonItems = json as? Array<NSDictionary> else { return [] }
    
    return jsonItems.flatMap { (itemDesc: NSDictionary) -> ListItem? in
      guard let title = itemDesc["title"] as? String,
        let urlString = itemDesc["url"] as? String,
        let url = NSURL(string: urlString)
        else { return nil }
      let iconName = itemDesc["icon"] as? String
      let icon = iconName.flatMap { UIImage(named: $0) }
      return ListItem(icon: icon, title: title, url: url)
    }
  }
}
```

### 回头看一眼我们的 ObjC 代码

花一点儿时间比较一下我们最终的 Swift 代码和[最开始的ObjC代码](http://alisoftware.github.io/swift/2015/09/06/thinking-in-swift-1/#the-objc-code)。我们着实改了很大一部分内容。

如果你仔细看一下 ObjC 和 Swift 代码，会发现 Swift 的代码量并不是那么少(ObjC 是 5+15 LoC<sup>1</sup>，对比 Swift 的 19 LoC)，但是**安全性高了太多**。

尤其是我们使用的`guard`，`try?`和`as?`会迫使我们去检查所有类型是否都如所期，ObjC 代码不会关心这些，因此可能崩溃💣💥。所以虽然代码量相当，但 ObjC 代码更危险。

### 结论

通过本系列文章，我希望你能够意识到：不要尝试将你的 ObjC 代码直译成 Swift。相反，你要去重新考虑一下你的代码，重新想象一下你的代码。从一个空白状态开始，脑中秉持着 Swift 的理念重写你的代码总会比你把 ObjC 代码直译过来要好。

我没说过这是件容易的事儿。当你已经习惯了用 ObjC 写代码，熟悉了它的模式和写代码的方式的话，做出思维上的改变会需要一些时间。但是这绝对有更多的好处。

---
以上就是 Swift 编程思想系列的最后一部分内容<sup>2</sup>。现在你要开始为新 Swift 项目发狂了，把 Swift 编程思想全部贯彻到你的脑海中。

祝用 Swift 编程愉快，并且...
![MAP 一切，FLATMAP 一切！](/img/articles/thinking-in-swift-4/map-all-the-things.jpg1445562507.5226758)

---
1. Lines of Codes，指有多少行代码
2. 我会马上发布一个收尾文章，留一个关于*Monads*的口风，并把这个系列真正完结。别愁，之后还有很多关于 Swift 的文章会陆续发布。


