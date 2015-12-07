title: iOS：选择 Realm 而不是 CoreData
date: 2015-12-08
tags: [Tomasz Szulc]
categories: [Swift 入门]
permalink: ios-realm-instead-of-coredata

---

原文链接=http://szulctomasz.com/ios-realm-instead-of-coredata/
作者=Tomasz Szulc
原文日期=2015-11-29
译者=Cee
校对=千叶知风
定稿=千叶知风
发布时间=2015-12-08T09:00:00

<!--此处开始正文-->

# iOS：选择 Realm 而不是 CoreData

> 我已在网上多次看到「Realm」这个词。我甚至曾在十月时有机会参加由 Swift 用户组组织的 Realm 聚会。最终，我有机会用上了 Realm 这个框架。
> 
<!--more-->

## 案例

现在我正在节食。我需要减一些体重因为在加利福尼亚的时候胖了好多 – 好吃的食物实在是太多了:)！我浏览了一下 iTunes Store 中的那些能够追踪喝水记录的应用，但是在我看来这些应用要么看上去很糟糕，要么交互实在是很烂。我想：如果我决定做一个应用，岂不是一箭双雕吗 – 我又能写一个我想要的应用，又能选择使用 Realm 而不是 Core Data。所以我开工了。

你知道当我看完文档、开始使用 Realm 框架的第一感觉是什么吗？**哇，这简直真是太棒了！这些开发的家伙做的简直超棒！**

**免责声明：**接下来所写的仅仅只覆盖了 Realm 框架中最基本的一部分。我建议你们接下来可以去阅读[官方文档](https://realm.io/docs/swift/latest/)来获取更多的信息。在这儿我并不想向你们展示关于 Realm 框架的全部内容，因为这篇文章不可能像文档一样又臭又长，并且我自己也会避免这样的问题发生。官方的文档非常的棒，你在开工前可以先读一下它。

我的这个案例并不是很复杂而是非常简单的。整个 app 只有两个抽象模型（Model）类： `Day` 和 `DrinkLogEntry` 。此外，这个 app 也需要这些功能：添加、更新、筛选和排序存储的数据。正如我所说这是个简单的 app 。接下来我会呈现 app 中的一些代码片段。

## 抽象模型（Model）

Realm 中没有像 xcdatamodel-like 这样的文件。抽象模型仅仅是继承自 `Object` 类的文件。

```swift
/**
 表示了用户一天的生活。 Day 这个类的信息包含用户所喝的水和他们的每天喝水的目标。
*/
class Day: Object {
    
    dynamic var identifier: String!
    
    /// 表示一天的开始的时间戳（UTC+0 时区）
    dynamic var timestamp: NSTimeInterval = 0
    
    /// 用户所喝的水的量（毫升）
    dynamic var waterDrank: Float = 0
    
    /// 用户每天喝水的目标（毫升）
    dynamic var dailyGoal: Float = 0 // ml
    
    var drinkLogs = List<DrinkLogEntry>()
    
    convenience init(timestamp: NSTimeInterval) {
        self.init()
        self.timestamp = timestamp
        self.identifier = Day.convertTimestampIntoIdentifier(timestamp)
    }
    
    override class func primaryKey() -> String? {
        return "identifier"
    }
    
    override class func indexedProperties() -> [String] {
        return ["identifier"]
    }
    
    class func convertTimestampIntoIdentifier(timestamp: NSTimeInterval) -> String {
        return String(format: "%.0f", arguments: [timestamp])
    }
}
```

所有前有 `dynamic` 关键字的属性都会被转化成数据抽象层的一部分。Realm 也支持关系型数据。在这个例子中 Day 这个类中存在 drinkLogs 的一对多关系。一对一的关系就仅是类中的特定属性了。

Realm 也支持从 Core Data 中迁移数据。当你需要迁移的时候，可以定义一个闭包并且执行它，然后你就能顺利地执行迁移属性的所有步骤了（译者注：[如何从 Core Data 迁移到 Realm](https://realm.io/news/migrating-from-core-data-to-realm/)）。

## 索引属性（Indexed properties）和主键（Primary keys）

Realm 框架有很多 Core Data 中没有的新特性（也有可能是我没找到，或者说我就是想提一下这点😊）。第一点就是「索引属性」了。你可以定义需要被索引的属性集合。当属性个数比较小的时候，搜索会变得很快。这有助于性能的提升。

接下来不得不提一下「主键」。你可以定义抽象模型中的一个属性作为它的主键。这能保证更加有效地更新数据以及保证数据的唯一性。

在我使用的这个例子中，主键和索引属性将作为「标识符」，被用于搜索和更新数据。

数据中也可以有被忽略的属性，那些属性将不被持久化保存。

## 创建、更新并写入数据

你可以使用未被持久化过的抽象模型，而且这些数据可以被持久化时，你可以将它们写入 Realm 中。比起 Core Data，这就是我为什么喜欢 Realm 更多一点 – 因为它能够很好地解决一些临时数据的问题。

```swift
let day = Day(timestamp: timestamp)
day.dailyGoal = MenuSettings().dailyGoal
```

为了能够写入 Realm 或者从 Realm 中读取，你需要创建 `Realm` 实例：

```swift
let realm = try! Realm()
```

这是如何将数据添加到数据库的方法：

```swift
try! realm.write {
    realm.add(day)
}
```

我特别喜欢 Realm 中更新数据的方式。我们假设一下有一部分数据是从网络上下载的，并且他们被映射过而且已经加进了数据库。在数据库中已经存在的数据仅需要更新而不是再次添加。

```swift
func fetchAll(completion: [Day] -> Void) {
    /**
     假设请求返回了 JSON 并且数据已经映射到了抽象数据层的 Day 类型。
          
     创建的数据还没有存入数据库 Realm 中。
     数据的标识符是相等的时间戳。
     */
    let day1 = Day(timestamp: 0)
    let day2 = Day(timestamp: 86400)
    let day3 = Day(timestamp: 172800)
    
    completion([day1, day2, day3])
}
 
func sync() {
    fetchAll { (days) -> Void in
        let realm = try! Realm()
        try! realm.write {
            /// 如果有相同的标识符，那么它将会被更新。
            realm.add(days, update: true)
        }
    }
}
```

这是一种比手动查询带有相同标识符然后更新值域更好的方法。

如果更新的参数被置为 false，那么新的数据将具有和在数据库中存在的数据相同的主键。异常会被抛出。

还有其他一些方法来更新数据，在这篇文章中我就不涉及了。

这是如何得到所有 Day 类型数据的方法：

```swift
let days = realm.objects(Day.self)
```

筛选数据也很简单：

```swift
realm.objects(Day.self).filter("identifier == %@", dayIdentifier)
```

按照时间戳升序排列这些数据：

```swift
let days = realm.objects(Day.self).sorted("timestamp", ascending: true)
```

当你每次执行 `object()`、`sorted()` 和 `filter()` 后均会得到一个 `Results<T>` 类型的数据。这能让你对结果进行额外的筛选排序等操作 - 这功能非常的强大而且非常好使。

## 小结

在下一个有更加复杂的数据模型的 app 中**我还会使用** Realm 吗？答案是**肯定**的。因为整个框架使用起来非常的简单、集成起来非常的快速，而且 Realm 提供了非常多而且强大的功能特性。

P.S. 这个 app 正在等待过审 :)

2015/12/06更新
这个应用上架了 - [Water Intake](https://itunes.apple.com/pl/app/water-intake-drink-more-water/id1062053347?mt=8)