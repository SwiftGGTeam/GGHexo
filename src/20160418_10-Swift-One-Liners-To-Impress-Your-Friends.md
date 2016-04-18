title: "Swift 中 10 个震惊小伙伴的单行代码"
date: 2016-04-18 9:00:00
tags: [Swift]
categories: [uraimo]
permalink: 10-Swift-One-Liners-To-Impress-Your-Friends
keywords: swift函数式编程,swift单行代码
custom_title: 
description: Swift 中函数式编程的单行代码你见过哪些呢，下面就来介绍下 10 个不错的 Swift 单行代码。

---
原文链接=https://www.uraimo.com/2016/01/06/10-Swift-One-Liners-To-Impress-Your-Friends/
作者=uraimo
原文日期=2016-01-06
译者=bestswifter
校对=numbbbbb
定稿=小锅

<!--此处开始正文-->

几年前，函数式编程的复兴正值巅峰，一篇介绍 [Scala 中 10 个单行函数式代码](https://mkaz.github.io/2011/05/31/10-scala-one-liners-to-impress-your-friends/)的博文在网上走红。很快地，一系列使用其他语言实现这些单行代码的文章也随之出现，比如 [Haskell](http://blog.fogus.me/2011/06/03/10-haskell-one-liners-to-impress-your-friends/)，[Ruby](http://programmingzen.com/2011/06/02/10-ruby-one-liners-to-impress-your-friends/)，[Groovy](http://arturoherrero.com/10-groovy-one-liners-to-impress-your-friends/)，[Clojure](http://freegeek.in/blog/2011/06/10-clojure-one-liners/)，[Python](http://codeblog.dhananjaynene.com/2011/06/10-python-one-liners-to-impress-your-friends/)，[C#](https://gist.github.com/1004837)，[F#](http://willwhim.wordpress.com/2011/06/02/fsharp-one-liners-to-impress-your-friends/)，[CoffeeScript](http://ricardo.cc/2011/06/02/10-CoffeeScript-One-Liners-to-Impress-Your-Friends.html)。

我们永远无法得知有多少人在社交聚会中对这些单行代码留下了深刻的印象，但根据我的猜测，越复杂的例子越能激励我们学习更多函数式编程的知识，至少对外行人来说是这样。

通过使用单行代码完成同样的 10 个练习，我们来看看 Swift 和其他语言之间的较量。在这个过程中，你也许还能学到一些有趣的东西（参见 #6 和 #10）。

<!--more-->

> 你可以从 [GitHub](https://github.com/uraimo/Swift-Playgrounds) 或 [zipped](https://github.com/uraimo/Swift-Playgrounds/raw/master/archives/2016-01-6-Swift-One-Liners-Playground.playground.zip) 上下载本文的 playground。

## #1 将数组中每个元素的值乘以 2

第一个例子中没什么干货，[我们都知道](https://www.uraimo.com/2015/10/08/Swift2-map-flatmap-demystified/)只要使用 `map `函数就可以简单地解决问题：

```swift
(1...1024).map{$0 * 2}
```

## #2 求一组数字的和

这个问题可以通过使用 `reduce` 方法和加号运算符解决，这是因为加号运算符实际上也是一个函数。不过这个解法是非常显而易见的，待会儿我们会看到 `reduce` 方法更具有创造力的使用。

```swift
(1...1024).reduce(0,combine: +)
```

## #3 证明字符串中含有某个单词

我们使用 `filter ` 方法判断一条推文中是否至少含有一个被选中的关键字：

```swift
let words = ["Swift","iOS","cocoa","OSX","tvOS"]
let tweet = "This is an example tweet larking about Swift"

let valid = !words.filter({tweet.containsString($0)}).isEmpty
valid //true
```

*更新*： [@oisdk](https://twitter.com/oisdk) 建议这样写会更好：

```swift
words.contains(tweet.containsString)
```

这种写法更加简练。另外，也可以这样写：

```swift
tweet.characters
  .split(" ")
  .lazy
  .map(String.init)
  .contains(Set(words).contains)
```

## #4 读取一个文件

和其他语言不同，Swift 不能使用内建的函数读取文件，并把每一行存放到数组中。不过我们可以结合 `split` 和 `map` 方法写一段简短的代码，这样就无需使用 `for` 循环：

```swift
let path = NSBundle.mainBundle().pathForResource("test", ofType: "txt")

let lines = try? String(contentsOfFile: path!).characters.split{$0 == "\n"}.map(String.init)
if let lines=lines {
    lines[0] // O! for a Muse of fire, that would ascend
    lines[1] // The brightest heaven of invention!
    lines[2] // A kingdom for a stage, princes to act
    lines[3] // And monarchs to behold the swelling scene.
}
```

最后一步使用 `map` 函数和字符串的构造方法，将数组中的每个元素从字符数组（characters）转换为字符串。

## #5 祝你生日快乐

这段代码会将“祝你生日快乐”这首歌的歌词输出到控制台中，它在一段区间内简单的使用了 `map` 函数，同时也用到了三元运算符。

```swift
let name = "uraimo"
(1...4).forEach{print("Happy Birthday " + (($0 == 3) ? "dear \(name)":"to You"))}
```

## #6 数组过滤

假设我们需要使用一个给定的过滤函数将一个序列（sequence）分割为两部分。很多语言除了有常规的 `map`，`flatMap`，`reduce`，`filter` 等函数外，还有一个 `partitionBy ` 函数恰好可以完成这个需求。正如你所知，Swift 没有类似的函数（我们不想在这里使用 *NSArray* 中的函数，并通过 *NSPredicate* 实现过滤功能）。

所以，我们可以通过拓展 `SequenceType`，并为它添加 `partitionBy ` 函数来解决这个问题。我们使用这个函数将整数数组分割为两部分：

```swift
extension SequenceType{
    typealias Element = Self.Generator.Element
    
    func partitionBy(fu: (Element)->Bool)->([Element],[Element]){
        var first=[Element]()
        var second=[Element]()
        for el in self {
            if fu(el) {
                first.append(el)
            }else{
                second.append(el)
            }
        }
        return (first,second)
    }
}

let part = [82, 58, 76, 49, 88, 90].partitionBy{$0 < 60}
part // ([58, 49], [82, 76, 88, 90])
```

实际上，这不是单行代码，而且使用了命令式的解法。能不能使用 `filter` 对它略作改进呢？

```swift
extension SequenceType{
    
    func anotherPartitionBy(fu: (Self.Generator.Element)->Bool)->([Self.Generator.Element],[Self.Generator.Element]){
        return (self.filter(fu),self.filter({!fu($0)}))
    }
}

let part2 = [82, 58, 76, 49, 88, 90].anotherPartitionBy{$0 < 60}
part2 // ([58, 49], [82, 76, 88, 90])
```
<!--enclosing function 这边不太理解-->

这种解法略好一些，但是他遍历了序列两次。而且为了用单行代码实现，我们删除了闭合函数，这会导致很多重复的内容（过滤函数和数组会在两处被用到）。

能不能只用单个数据流就对原来的序列进行转换，把两个部分分别存入一个元组中呢？答案是是可以的，使用 `reduce` 方法：

```swift
var part3 = [82, 58, 76, 49, 88, 90].reduce( ([],[]), combine: {
	(a:([Int],[Int]),n:Int) -> ([Int],[Int]) in
	(n<60) ? (a.0+[n],a.1) : (a.0,a.1+[n]) 
})
part3 // ([58, 49], [82, 76, 88, 90])
```

这里我们创建了一个用于保存结果的元组，它包含两个部分。然后依次取出原来序列中的元素，根据过滤结果将它放到第一个或第二个部分中。

我们终于用真正的单行代码解决了这个问题。不过有一点需要注意，我们使用 `append` 方法来构造两个部分的数组，所以这实际上比前两种实现慢一些。

## #7 获取并解析 XML 格式的网络服务

上述的某些语言不需要依赖外部的库，而且默认有不止一种方案可以处理 XML 格式的数据（比如 Scala 自身就可以将 XML 解析成对象，尽管实现方法比较笨拙），但是 （Swift 的）Foundation 库仅提供了 SAX 解析器，叫做 NSXMLParser。你也许已经猜到了：我们不打算使用这个。

在这种情况下，我们可以选择一些开源的库。这些库有的用 C 实现，有的用 Objective-C 实现，还有的是纯 Swift 实现。

这次，我们打算使用纯 Swift 实现的库：[AEXML](https://github.com/tadija/AEXML)：

```swift
let xmlDoc = try? AEXMLDocument(xmlData: NSData(contentsOfURL: NSURL(string:"https://www.ibiblio.org/xml/examples/shakespeare/hen_v.xml")!)!)

if let xmlDoc=xmlDoc {
    var prologue = xmlDoc.root.children[6]["PROLOGUE"]["SPEECH"]
    prologue.children[1].stringValue // Now all the youth of England are on fire,
    prologue.children[2].stringValue // And silken dalliance in the wardrobe lies:
    prologue.children[3].stringValue // Now thrive the armourers, and honour's thought
    prologue.children[4].stringValue // Reigns solely in the breast of every man:
    prologue.children[5].stringValue // They sell the pasture now to buy the horse,
}
```

## #8 找到数组中最小（或最大）的元素

我们有多种方式求出 sequence 中的最大和最小值，其中一种方式是使用 `minElement` 和 `maxElement` 函数：

```swift
//Find the minimum of an array of Ints
[10,-22,753,55,137,-1,-279,1034,77].sort().first
[10,-22,753,55,137,-1,-279,1034,77].reduce(Int.max, combine: min)
[10,-22,753,55,137,-1,-279,1034,77].minElement()

//Find the maximum of an array of Ints
[10,-22,753,55,137,-1,-279,1034,77].sort().last
[10,-22,753,55,137,-1,-279,1034,77].reduce(Int.min, combine: max)
[10,-22,753,55,137,-1,-279,1034,77].maxElement()
```

## #9 并行处理

某些语言支持用简单透明的方式允许对序列的并行处理，比如使用 `map` 和 `flatMap` 这样的函数。这使用了底层的线程池，可以加速多个依次执行但又彼此独立的操作。

Swift 还不具备这样的特性，但我们可以用 GCD 实现：

<http://moreindirection.blogspot.it/2015/07/gcd-and-parallel-collections-in-swift.html>

### #10 埃拉托色尼选筛法

古老而优秀的埃拉托色尼选筛法被用于找到所有小于给定的上限 n 的质数。

首先将所有小于 n 的整数都放入一个序列（sequence）中，这个算法会移除每个数字的倍数，直到剩下的所有数字都是质数。为了加快执行速度，我们其实不必检查每一个数字的倍数，当检查到 n 的平方根时就可以停止。

基于以上定义，最初的实现可能是这样的：

```swift
var n = 50
var primes = Set(2...n)

(2...Int(sqrt(Double(n)))).forEach{primes.subtractInPlace((2*$0).stride(through:n, by:$0))}
primes.sort()
```

在外层的区间里，我们遍历每一个需要检查的数字。对于每一个数字，我们使用 `stride(through:Int by:Int)` 函数计算出由它的倍数构成的序列。最初，我们用所有 2 到 n 的整数构造了一个集合（Set），然后从集合中减掉每一个生成的序列中的元素。

不过正如你所见，为了真正的删除掉这些倍数，我们使用了一个外部的可变集合，这会带来副作用。

我们总是应该尝试消除副作用，所以我们先计算所有的子序列，然后调用 `flatMap` 方法将其中所有的元素展开，存放到单个数组中，最后再从原始的集合中删除这些整数。

```swift
var sameprimes = Set(2...n)

sameprimes.subtractInPlace((2...Int(sqrt(Double(n))))
						   .flatMap{ (2*$0).stride(through:n, by:$0)})
sameprimes.sort()
```

这种写法更加清楚，它也是 [使用 *flatMap* 展开嵌套数组](https://www.uraimo.com/2015/10/08/Swift2-map-flatmap-demystified/) 这篇文章很好的一个例子。

## #11 福利：使用析构交换元组中的值

既然是福利，自然并非每个人都知道这一点。和其他具有元组类型的语言一样，Swift 的元组可以被用来交换两个变量的值，代码很简洁：

```swift
var a=1,b=2

(a,b) = (b,a)
a //2
b //1
```

以上就是全部内容，正如我们预料的那样，Swift 和其他语言一样富有表现力。

你还有其他用 Swift 实现的有趣的单行代码想与我们分享么？如果有，[请让我知道](https://twitter.com/uraimo)

*感谢* [@oisdk](https://twitter.com/oisdk) 审核这篇文章。

如果你想发表评论，请在 [Twitter](http://www.twitter.com/uraimo) 上和我联系。