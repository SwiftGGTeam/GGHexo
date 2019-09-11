Swift 中的集合（Set）"

> 作者：Thomas Hanning，[原文链接](http://www.thomashanning.com/sets-in-swift/)，原文日期：2018-09-06
> 译者：[rsenjoyer](https://github.com/rsenjoyer)；校对：[numbbbbb](http://numbbbbb.com/)，[pmst](http://www.jianshu.com/users/596f2ba91ce9/latest_articles)；定稿：[Forelax](http://forelax.space)
  










集合（Set）是 Swift 集合类型（collection types）之一，集合用来存储类型相同且没有确定顺序唯一的值。你可以将集合想象成一盒台球：它们在颜色和数量上独一无二，但在盒内是无序的。

![](https://swift.gg/img/articles/Sets-in-Swift/billiard.jpg1562643187.9223473)



*提示：这篇文章使用的是 Swift 4 和 Xcode 10*

## 创建集合

创建一个集合非常简单：

    
    let setA: Set<String> = ["a","b","c"]

在这个例子中，创建一个 `String` 类型的集合，命名为 `setA`。它存储着 `a`、`b`、`c` 三个值。与数组相比，集合内元素是无序的。通过编译器的类型推导功能，你也可以像如下方式创建集合：

    
    let setB: Set = ["a","b","c"]
同样也可以使用集合的构造器：

    
    let setC = Set(["a","b","c"])

跟数组一样，如果使用 `let` 来定义一个集合，它就是不可变的。使用 `var`定义的是一个可变集合。

    
    var setD = Set(["a","b"])

稍后我们将了解更多有关可变集合的信息。

## 访问集合中的元素

你可以使用循环来访问集合中的元素：

    
    for value in setA {
         print(value)
    }

注意：每次运行代码时，循环中值的顺序可能不同。从表面来看，它们像是随机返回一样。

## 集合分析

首先，你可以检查集合是否为空：

    
    print(setA.isEmpty)

也可以获取集合中元素的个数：

    
    print(setA.count)

上面的操作对数组同样有效，对集合而言，更加普遍的问题是判断集合中是否包含某个元素。为此，你可以使用 `contains` 方法：

    
    print(setA.contains("a"))

## 从集合中添加和删除元素

你可以向可变集合里面添加和删除元素:

    
    setD.insert("c")
    setD.remove("a")
由于集合元素的唯一性，因此只能将同一个元素添加到集合中一次。可以多次使用相同的值调用 `insert` 方法，但集合不会改变。

    
    var setE: Set = [1,2,3,4]
     
    setE.insert(5)
    setE.insert(5)
    setE.insert(5)
     
    print(setE) //[4,5,1,2,3]
和前面所说的一样，上面代码每次执行时输出的顺序可能不同，因为集合元素无序。

## 集合比较

集合间能进行比较。显然，可以比较两个集合是否相等：

    
    let setA: = [“a”, “b”, “c”]
    let setB: = [“a”, “b”, “c”]
     
    if setA == setB {
         print(“the sets are equal”)
    }
这种情况下，集合是相等的。

比较两个集合的大小是没有明确的定义，但可以检查一个集合是否是另一个集合的子集：

    
    let intSetA: Set = [1,2,3,4,5,6,7,8,9,0]
    let intSetB: Set = [1,2,3]
    intSetB.isSubset(of: intSetA) //true
也可以检查集合是否是另一个集合的真子集。这种情况就是该集合是另一个集合的子集但不想等。

    
    let intSetA: Set = [1,2,3,4,5,6,7,8,9,0]
    let intSetB: Set = [1,2,3,4,5,6,7,8,9,0]
    let intSetC: Set = [3,4,5]
     
    intSetB.isSubset(of: intSetA) //true
    intSetB.isStrictSubset(of: intSetA) //false
    intSetC.isSubset(of: intSetA) // true
    intSetC.isStrictSubset(of: intSetA) //true

与之相对的概念就是超集：

    
    let intSetA: Set = [1,2,3,4,5,6,7,8,9,0]
    let intSetC: Set = [3,4,5]
    intSetA.isSuperset(of: intSetC) //true
    intSetA.isStrictSuperset(of: intSetC) //true
如果两个集合没有相同的元素，那么就说这两个集合不相交

    
    let intSetA: Set = [1,2,3,4,5,6,7,8,9,0]
    let intSetC: Set = [3,4,5]
    let intSetD: Set = [13,14,15]
     
    intSetA.isDisjoint(with: intSetC) //false
    intSetA.isDisjoint(with: intSetD) //true

## 集合结合

你可以将两个集合合并成为一个新集合，新的集合中包含两个集合中所有的元素：

    
    let stringSetA: Set = ["a","b","c"]
    let stringSetB: Set = ["c","d","e"]
    
    let unionSetAB = stringSetA.union(stringSetB)
    print(unionSetAB) //["d", "b", "c", "a", "e"]

另一方面，交集就是仅包含两个集合中共同的元素：

    
    let stringSetA: Set = ["a","b","c"]
    let stringSetB: Set = ["c","d","e"]
     
    let intersectionAB = stringSetA.intersection(stringSetB)
    print(intersectionAB) //[“c”]

## 自定义集合元素类型

你可以在集合中存储自定义的类型。这种类型可以是类或者结构体。为了能正常使用集合，该类型必须遵循 `hashable` 协议。

    
    class Movie: Hashable {
     
         var title: String
         var year: Int
     
         init(title: String, year: Int) {
              self.title = title
              self.year = year
         }
     
         static func == (lhs: Movie, rhs: Movie) -> Bool {
              return lhs.title == rhs.title &&
              lhs.year == rhs.year
         }
     
         var hashValue: Int {
              return title.hashValue ^ year.hashValue
         }
     
    }
     
    let terminator = Movie(title: "Terminator", year: 1980)
    let backToTheFuture = Movie(title: "Back to the Future", year: 1985)
     
    let movieSetA: Set = [terminator,backToTheFuture]
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。