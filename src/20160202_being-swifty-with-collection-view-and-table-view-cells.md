title: "更加 Swift 化的 Collection View 和 Table View Cells"
date: 2016-02-02 09:00:00
tags: [Jameson Quave]
categories: [Swift 进阶]
permalink: being-swifty-with-collection-view-and-table-view-cells
keywords: collectionview使用,tableviewcell
custom_title: 
description: 想知道Swift化tableView和collectionView是什么样子的吗，只要用使用枚举的case情况做标识就能搞定哦。

---
原文链接=http://jamesonquave.com/blog/being-swifty-with-collection-view-and-table-view-cells/
作者=Jameson Quave
原文日期=2015-12-28
译者=CMB
校对=Cee
定稿=千叶知风
发布时间=2016-02-02T09:00:00

<!--此处开始正文-->

这是一个常见的场景：你有一个 tableView 或者一个 collectionView，并且里面含有大量不同种类的内容。你想做到基于不同种类的内容而展示不一样的 `cell` ，而且这些 `cell` 都混合在同一个部件里（原谅我站在艺术的角度去设计），它看起来就如下图所示：
<!--more-->

![](http://i4.tietuku.com/53092553e2ff9f43.png) 

在 Objective-C 中，最典型就是使用 NSArray 来记录 collectionView 的数据源，然后通过对比每个数据源的类型后再对 cell 进行操作，现在看来这种方式是特别不方便的。

```objective-c
- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {

    UICollectionViewCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:@"identifier" forIndexPath:indexPath];
 
    id record = self.records[indexPath.row];
 
    if([record isKindOfClass:[PlaythroughItem class]]) {
        // ...
    }
    else if([record isKindOfClass:[ReviewItem class]]) {
        // ...
    }
    else if([record isKindOfClass:[TrailerItem class]]) {
        // ...
    }
 
    return cell;
}
```
*战栗吧*

这并不是种类型安全的方法，尽管我们在 Objective-C 中这么使用这段代码已经不足为奇了。在 Swift 中，有更加好的替换方式去解决上述问题，那就是使用枚举的 case 情况来为不同类型的项做标识，然后通过这些 case 就可以找到我们所需要的项。让我们看看下面的例子。

### 例子

这是一个我正在写的休闲娱乐类 App 中需要一些不同新闻类型的 `cell` 的代码：

```swift
enum NewsItem {
  case Trailer(index: Int)
  case Review(index: Int)
  case Playthrough(index: Int)
}
```

索引仅仅是用来记录数据在数据库中*位置*的方法。我们采取这种索引的方法来标识所需数据在 collectionView 中位置的展示。对于特定视频，我们就不需要其所关联的所有数据了，所需要的信息仅需要在 collectionView 中的 cell 点击之后才去通过索引获取。

我们有一个简单的 collectionView，它里面含有三个自定义的 `cell` 。我使用 `NewsFeed.swift` 文件作为这个新闻 collectionView 的主要数据源。我特别感兴趣的是 `cellForItemAtIndexPath` 方法，通过 `NewsItem` 枚举来区分 `record` 的类型，从而产生相对应的 `cell`：

```swift
func collectionView(collectionView: UICollectionView, cellForItemAtIndexPath indexPath: NSIndexPath) -> UICollectionViewCell {

    let record = records[indexPath.row]
 
    switch(record) {
 
    case .Playthrough(let index): 
        let cell = collectionView.dequeueReusableCellWithReuseIdentifier("PlaythroughCell", forIndexPath: indexPath) as! PlaythroughCollectionViewCell
        let playthrough = MediaDB.playthroughAtIndex(index)
        cell.titleLabel.text = playthrough.title
        cell.lengthLabel.text = playthrough.length.prettyTime
        return cell
 
    case .Review(let index):
        let cell = collectionView.dequeueReusableCellWithReuseIdentifier("ReviewCell", forIndexPath: indexPath) as! ReviewCollectionViewCell
        let review = MediaDB.reviewAtIndex(index)
        cell.ratingLabel.text = "\(review.rating) out of 10"
        cell.titleLabel.text = review.title
        return cell
 
    case .Trailer(let index):
        let cell = collectionView.dequeueReusableCellWithReuseIdentifier("TrailerCell", forIndexPath: indexPath) as! TrailerCollectionViewCell
        let trailer = MediaDB.trailerAtIndex(index)
        cell.titleLabel.text = trailer.title
        cell.lengthLabel.text = trailer.length.prettyTime
        return cell
    }
}
```

上面的代码可以清晰看出，`record` 可以表示为 `NewsItem` 枚举里三个 case 中任意一个：

```swift
enum NewsItem {
  case Trailer(index: Int)
  case Review(index: Int)
  case Playthrough(index: Int)
}
```

当我们想在 collectionView 中展示一个 `cell` 的时候，我们可以通过相关的索引值去找到数据库中所对应的那一项。

这段代码让我觉得很不舒服。有许多重复代码，尤其是 switch 显得非常笨重，在每个 case 中都做了太多事情。

但是，如果我创建了一个可以用在 collectionView cell 上的处理任何数据源的协议呢？鉴于每个视图（view）都并不相同，所以我不希望这个协议在模型（model）中使用。但我可以在特定的 collectionView cell 的子类上使用它。

所以，我创建了一个叫做 `NewsCellPresentable` 协议，这个协议被自定义的 collectionView cell 所扩展：

```swift
protocol NewsCellPresentable {
    func configureForIndex(index: Int)
}
 
extension PlaythroughCollectionViewCell: NewsCellPresentable {
    func configureForIndex(index: Int) {
        let playthrough = MediaDB.playthroughAtIndex(index)
        self.titleLabel.text = playthrough.title
        self.lengthLabel.text = playthrough.length.prettyTime
    }
}
extension ReviewCollectionViewCell: NewsCellPresentable {
    func configureForIndex(index: Int) {
        let review = MediaDB.reviewAtIndex(index)
        self.titleLabel.text = review.title
        self.ratingLabel.text = "\(review.rating) out of 10"
    }
}
extension TrailerCollectionViewCell: NewsCellPresentable {
    func configureForIndex(index: Int) {
        let trailer = MediaDB.trailerAtIndex(index)
        self.titleLabel.text = trailer.title
        self.lengthLabel.text = trailer.length.prettyTime
    }
}
```

这样写看起来已经很简洁明了了。现在我们回到 `cellForItemAtIndexPath` 方法中对代码进行修改，修改后如下所示：

```swift
func collectionView(collectionView: UICollectionView, cellForItemAtIndexPath indexPath: NSIndexPath) -> UICollectionViewCell {
    let record = records[indexPath.row]
 
    var cell: NewsCellPresentable
    switch(record) {
 
    case .Playthrough(let index):
        cell = collectionView.dequeueReusableCellWithReuseIdentifier("PlaythroughCell", forIndexPath: indexPath) as! PlaythroughCollectionViewCell
        cell.configureForIndex(index)
 
    case .Review(let index):
        cell = collectionView.dequeueReusableCellWithReuseIdentifier("ReviewCell", forIndexPath: indexPath) as! ReviewCollectionViewCell
        cell.configureForIndex(index)
 
    case .Trailer(let index):
        cell = collectionView.dequeueReusableCellWithReuseIdentifier("TrailerCell", forIndexPath: indexPath) as! TrailerCollectionViewCell
        cell.configureForIndex(index)
    }
 
    return (cell as! MediaCollectionViewCell)
}
```

你觉得这种方法怎么样？这是一种更为简洁的方法吗？如果你有其它不同的实现方法，可以直接在文章下面留言给我，或者在 Twitter 上留言给我，我的用户名是 [@jquave](https://twitter.com/jquave)，希望可以一起交流学习。

### 附言

如果你没有数据库底层代码，但又想写出和我例子一样的实例，你可以参照下列代码：

```swift
class MediaDB {
    class func titleForRecord(index: Int) -> String {
        return "Title!!"
    }
    class func trailerAtIndex(index: Int) -> Trailer {
        return Trailer()
    }
    class func reviewAtIndex(index: Int) -> Review {
        return Review()
    }
    class func playthroughAtIndex(index: Int) -> Playthrough {
        return Playthrough()
    }
}
 
struct Trailer {
    let title = "Trailer Title"
    let length = 190
}
 
struct Review {
    let title = "Review Title"
    let rating = 4
}
 
struct Playthrough {
    let title = "Playthrough Title"
    let length = 9365
}
 
 
enum NewsItem {
    case Trailer(index: Int)
    case Review(index: Int)
    case Playthrough(index: Int)
}
```

就个人而言，在写后端服务和接口之前，我总会做静态值的存根。这样会使得项目更容易迭代。