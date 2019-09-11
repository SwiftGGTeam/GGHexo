title: "Swift 编程思想，第一部分：拯救小马"
date: 2015-09-29 09:00:00
tags: [Swift 进阶]
categories: [Crunchy Development]
permalink: thinking-in-swift-1

---
原文链接=http://alisoftware.github.io/swift/2015/09/06/thinking-in-swift-1/
作者=Olivier Halligon
原文日期=2015-09-06
译者=ray16897188
校对=shanks
定稿=千叶知风
发布时间=2015-09-29T09:00:00

<!--此处开始正文-->

我常看见 Swift 的新手尝试着把它们的 ObjC 代码翻译成 Swift。但是开始用 Swift 写代码的时候最难的事情并不是语法，而是思维方式的转变，去用那些 ObjC 里并没有的 Swift 新概念。

<!--more-->

在这一系列的文章中，我们会拿一个 ObjC 代码做例子，然后在把它转成 Swift 代码的全程中引入越来越多的对新概念的讲解。

>*本文的第一部分内容：可选类型（optionals），强制拆包可选类型，小马，`if let`，`guard`和 🍰。*

## ObjC代码 ##
假设你想创建一个条目列表（比如过会儿要显示在一个`TableView`里）- 每个条目都有一个图标，标题和网址 - 这些条目都通过一个`JSON`初始化。下面是`ObjC`代码的实现：

```Swift
@interface ListItem : NSObject
@property(strong) UIImage* icon;
@property(strong) NSString* title;
@property(strong) NSURL* url;
@end

@implementation ListItem
+(NSArray*)listItemsFromJSONData:(NSData*)jsonData { 
    NSArray* itemsDescriptors = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:nil];

    NSMutableArray* items = [NSMutableArray new]; 
    for (NSDictionary* itemDesc in itemsDescriptors) { 
        ListItem* item = [ListItem new];    
        item.icon = [UIImage imageNamed:itemDesc[@"icon"]]; 
        item.title = itemDesc[@"title"]; 
        item.url = [NSURL URLWithString:itemDesc[@"title"]]; 
        [items addObject:item]; 
    } 
    return [items copy];
}
@end
```

OK，多么标准的 ObjC 代码啊。

## 直译成Swift ##
想象一下有多少 Swift 的新手会把这段代码翻译成这样：

```Swift
class ListItem {
    var icon: UIImage?
    var title: String = ""
    var url: NSURL!

    static func listItemsFromJSONData(jsonData: NSData?) -> NSArray {
        let jsonItems: NSArray = try! NSJSONSerialization.JSONObjectWithData(jsonData!, options: []) as! NSArray
        let items: NSMutableArray = NSMutableArray()
        for itemDesc in jsonItems {
            let item: ListItem = ListItem()
            item.icon = UIImage(named: itemDesc["icon"] as! String)
            item.title = itemDesc["title"] as! String
            item.url = NSURL(string: itemDesc["url"] as! String)!
            items.addObject(item)
        }
        return items.copy() as! NSArray
    }
}
```
对 Swift 稍有经验的人应该会看出来这里面有很多代码异味。Swift 的专家读到这段代码之后就很可能心脏病突发而全部挂掉了。

## 哪里做错了？ ##
上面例子中第一个看起来像代码异味的地方就是一个 Swift 新手经常犯的坏毛病：到处使用隐式解析可选类型（`value!`），强制转型（`value as! String`）和强制使用try（`try!`）。

**可选类型是你的朋友**：它们很棒，因为它们能迫使你去思考你的值什么时候是`nil`，以及在这种情形下你该做什么。比如"如果没有图标的话我该显示什么呢？在我的 TableViewCell 里我该用一个占位符（placeholder）么？或者用另外一个完全不同的 cell 模板？"。

这些就是我们在 ObjC 中经常忘了考虑进去的用例，但是 Swift 帮助我们去记住它们，所以**当值是`nil`的时候把它们强制拆包导致程序崩溃，把可选类型这个高级特性扔在一边不用**，是很可惜的。

>你**绝不应该**对一个值进行强制拆包，除非你真的知道你在干什么。记住，每次你加一个`!`去取悦编译器的时候，你就屠杀了一匹小马🐴。

可悲的是，Xcode是鼓励犯这种错误的，因为error提示到："value of optional type ‘NSArray?’ not unwrapped. Did you mean to use`!`or`?`?" ，修改提示建议...你在最后面加一个`!`✖。噢，Xcode，你是有多菜啊。

## 我们来拯救这些小马吧 ##

那么我们该怎样去避开使用这些无处不在的糟糕的`!`呢？这儿有一些技巧：

- 使用可选绑定（optional binding）`if let x = optional { /* 使用 x */ }`
- 用`as?`替换掉`as!`,前者在转型失败的时候返回`nil`；你当然可以把它和`if let`结合使用
- 你也可以用`try?`替换掉`try!`，前者在表达式失败时返回`nil`[<sup>1</sup>](http://alisoftware.github.io/swift/2015/09/06/thinking-in-swift-1/#fn1)。

好了，来看看用了这些规则之后我们的代码[<sup>2</sup>](http://alisoftware.github.io/swift/2015/09/06/thinking-in-swift-1/#fn2)：

```Swift
class ListItem {
    var icon: UIImage?
    var title: String = ""
    var url: NSURL!

    static func listItemsFromJSONData(jsonData: NSData?) -> NSArray {
        if let nonNilJsonData = jsonData {
            if let jsonItems: NSArray = (try? NSJSONSerialization.JSONObjectWithData(nonNilJsonData, options: [])) as? NSArray {
                let items: NSMutableArray = NSMutableArray()
                for itemDesc in jsonItems {
                    let item: ListItem = ListItem()
                    if let icon = itemDesc["icon"] as? String {
                        item.icon = UIImage(named: icon)
                    }
                    if let title = itemDesc["title"] as? String {
                        item.title = title
                    }
                    if let urlString = itemDesc["url"] as? String {
                        if let url = NSURL(string: urlString) {
                           item.url = url
                        }
                    }
                    items.addObject(item)
                }
                return items.copy() as! NSArray
            }
        }
        return [] // In case something failed above
    }
}
```

## 判决的金字塔 ##
可悲的是，满世界的添加这些`if let`让我们的代码往右挪了好多，形成了臭名昭著的[判决金字塔](https://en.wikipedia.org/wiki/Pyramid_of_doom_(programming))（此处插段悲情音乐）。

Swift中有些机制能帮我们做简化：

- 将多个`if let`语句合并为一个：`if let x = opt1, y = opt2`
- 使用`guard`语句，在某个条件不满足的情况下能让我们尽早的从一个函数中跳出来，避免了再去运行函数体剩下的部分。

当类型能被推断出来的时候，我们再用此代码把这些变量类型去掉来消除冗余 - 比如简单的用`let items = NSMutableArray()` - 并利用`guard`语句再确保我们的json确实是一个`NSDictionary`对象的数组。最后，我们用一个更"Swift化"的返回类型`[ListItem]`替换掉ObjC的`NSArray`：

```Swift
class ListItem {
    var icon: UIImage?
    var title: String = ""
    var url: NSURL!

    static func listItemsFromJSONData(jsonData: NSData?) -> [ListItem] {
        guard let nonNilJsonData = jsonData,
            let json = try? NSJSONSerialization.JSONObjectWithData(nonNilJsonData, options: []),
            let jsonItems = json as? Array<NSDictionary>
            else {
                // If we failed to unserialize the JSON
                // or that JSON wasn't an Array of NSDictionaries,
                // then bail early with an empty array
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

`guard`语句真心很赞，因为它在函数的开始部分就把代码专注于检查输入是否有效，然后在代码剩下的部分中你就不用再为这些检查操心了。如果输入并非所想，我们就尽早跳出，帮助我们专注在那些我们期望的事情上。

## Swift难道不应该比ObjC更简洁么？ ##

![诱人的蛋糕子虚乌有！](https://swift.gg/img/articles/thinking-in-swift-1/the-cake-is-a-lie.png1444269942.805689)

嗯好吧，这代码好像是比它的 ObjC 版本更复杂。但是别愁，在即将到来的本文第二部分中我们会把它大幅度简化。

但更重要的是，这段代码比它 ObjC 的版本更加安全。实际上 ObjC 的代码**更短只是因为我们忘了去执行一大堆的安全测试**。即使我们的 ObjC 代码看起来蛮正常，**它还是会在一些情况中立即崩溃**，比如我们给它一个无效的 JSON，或者一个并不是由 string 类型的 dictionary的 array 构造出来的东西（比如创建 JSON 的那个人觉得"icon"这个 key 值对应的就是一个用来提示该条目是否有图标的 Boolean，而不是一个`String`...）。**在ObjC中我们仅仅是忘了去处理这些用例**，因为 ObjC 没有引导我们去考虑这些情况，而 Swift 会迫使我们去考虑。

所以 ObjC 代码当然更短：因为我们就是忘了去处理所有这些事情。如果你去不防止自己程序崩溃的话，把代码写的更短是很轻松的。开车的时候不留意路上的障碍当然轻松，但你就是这样把小马给撞死的。

## 结论 ##
Swift 是为了更高的安全性而设计。不要把所有东西都强制拆包而忽视了可选类型：当你在你的 Swift 代码中看见了一个`!`，你就应该总是要把它看做是一处代码异味，某些事情是要出错的。

在即将到来的本文第二部分中，我们会看到怎么让这个 Swift 代码更加简洁，并延续 Swift 的编程思想：将`for`循环和`if-let`搬走，替换成`map`和`flatmap`。

与此同时，安全驾驶，还有，没错，拯救小马！🐴

---
1. 注意这个`try?`默默的将`error`丢弃了：用它的时候你不会知道*为什么*代码出错的原因。所以通常来说如果可能的话用`do { try ... } catch { }`替换掉`try?`会更好。但是在我们的例子中，因为我们希望在 JSON 因某种原因序列化失败时返回一个空数组，这里用`try?`是 OK 的。[↩](http://alisoftware.github.io/swift/2015/09/06/thinking-in-swift-1/#fnref1)
2. 如你所见，我在代码的最后保留了一个`as!`(`items.copy() as! NSArray`)。有时~~杀死小马~~强制转型是 OK 的，如果你真的，真的知道返回的类型不是其他任何东西，就像这里的`mutableArray.copy()`。可是这种例外十分罕见，只有在你一开始的时候就认真思考过这个用例的情况下才可以接受（当心，如果那匹小马🐴死了，你将会受到良心的谴责）。[↩](http://alisoftware.github.io/swift/2015/09/06/thinking-in-swift-1/#fnref2)