title: 化零为整：Reduce 详解
date: 2015-12-10
tags: [Benedikt Terhechte]
categories: [Swift 入门]
permalink: reduce-all-the-things

---

原文链接=http://appventure.me/2015/11/30/reduce-all-the-things/
作者=Benedikt Terhechte
原文日期=2015-11-30
译者=pmst
校对=Cee
定稿=千叶知风
发布时间=2015-12-10T09:00:00

<!--此处开始正文-->

即使早在 Swift 正式发布之前，iOS / Cocoa 开发者都可以使用诸如 ObjectiveSugar 或者 ReactiveCocoa 第三方库，实现类似 `map`、`flatMap` 或 `filter` 等函数式编程的构建。而在 Swift 中，这些家伙（`map` 等几个函数）已经入驻成为「头等公民」了。比起标准的 `for` 循环，使用函数式编程有很多优势。它们通常能够更好地表达你的意图，减少代码的行数，以及使用链式结构构建复杂的逻辑，更显清爽。

<!--more-->

本文中，我将介绍附加于 Swift 中的一个非常酷的函数：「Reduce」。相对于 `map` / `filter` 函数，`reduce` 有时不失为一个更好的解决方案。

### 一个简单的问题

思考这么一个问题：你从 JSON 中获取到一个 persons 列表，意图计算所有来自 California 的居民的平均年龄。需要解析的数据如下所示：

```swift
let persons: [[String: AnyObject]] = [["name": "Carl Saxon", "city": "New York, NY", "age": 44],
 ["name": "Travis Downing", "city": "El Segundo, CA", "age": 34],
 ["name": "Liz Parker", "city": "San Francisco, CA", "age": 32],
 ["name": "John Newden", "city": "New Jersey, NY", "age": 21],
 ["name": "Hector Simons", "city": "San Diego, CA", "age": 37],
 ["name": "Brian Neo", "age": 27]] //注意这家伙没有 city 键值
```

注意最后一个记录，它遗漏了问题中 person 的居住地 city 。对于这些情况，默默忽略即可...

本例中，我们期望的结果是那三位来自 California 的居民。让我们尝试在 Swift 中使用 `flatMap` 和 `filter` 来实现这个任务。使用 `flatMap` 函数替代 `map` 函数的原因在于前者能够忽略可选值为 nil 的情况。例如 `flatMap([0,nil,1,2,nil])` 的结果是 `[0,1,2]`。处理那些没有 city 属性的情况这会非常有用。

```swift
func infoFromState(state state: String, persons: [[String: AnyObject]]) 
     -> Int {
	   // 先进行 flatMap 后进行 filter 筛选
     // $0["city"] 是一个可选值，对于那些没有 city 属性的项返回 nil
     // componentsSeparatedByString 处理键值，例如 "New York, NY" 
     // 最后返回的 ["New York","NY"]，last 取到最后的 NY
    return persons.flatMap( { $0["city"]?.componentsSeparatedByString(", ").last })
	   .filter({$0 == state})
	   .count
}
infoFromState(state: "CA", persons: persons)
//#+RESULTS:
//: 3
```

这非常简单。

不过，现在来思考另外一个难题：你想要获悉居住在 California 的人口数，接着计算他们的平均年龄。如果我们想要在上面函数的基础上尝试做修改，立马会发现难度不小。解决方法倒是有几种，不过大都看起来不适用函数式结构解决方案。倒是通过循环的方式能简单的解决这个问题。

这时候我们要琢磨为啥不适用了，原因很简单：数据的形式（Shape）改变了。而 `map`、`flatMap` 和 `filter` 函数能够始终保持数据形式的相似性。数组传入，数组返回。当然数组的元素个数和内容可以改变，不过始终是数组形式（Array-shape）。但是，上面所描述的问题要求我们最后转换成的结果是个结构体（Struct），或者说是以元组（Tuple）的形式包含**一个整型平均值（平均年龄）**和**一个整型总和（人口数）**。

对于这种类型的问题，我们可以使用 `reduce` 来救场。

### Reduce

Reduce 是 `map`、`flatMap` 或 `filter` 的一种扩展的形式（译者注：后三个函数能干嘛，reduce 就能用另外一种方式实现）。**Reduce** 的基础思想是将一个序列转换为一个不同类型的数据，期间通过一个**累加器（Accumulator）**来持续记录递增状态。为了实现这个方法，我们会向 reduce 方法中传入一个用于处理序列中每个元素的**结合（Combinator）**闭包 / 函数 / 方法。这听起来有点复杂，不过通过几个例子练手，你就会发现这相当简单。

它是 `SequenceType` 中的一个方法，看起来是这样的（简化版本）：

```swift
func reduce<T>(initial: T, combine: (T, Self.Generator.Element) -> T) -> T
```

此刻，我们拥有一个初始值（Initial value）以及一个闭包（返回值类型和初始值类型一致）。函数最后的返回值同样和初始值类型一致，为 `T`。

假设我们现在要实现一个 reduce 操作 — 对一个整数列表值做累加运算，方案如下：

```swift
func combinator(accumulator: Int, current: Int) -> Int {
   return accumulator + current
}
[1, 2, 3].reduce(0, combine: combinator)
// 执行步骤如下
combinator(0, 1) { return 0 + 1 } = 1
combinator(1, 2) { return 1 + 2 } = 3
combinator(3, 3) { return 3 + 3 } = 6
= 6
```

`[1, 2, 3]` 中的每个元素都将调用一次**结合（Combinator）**函数进行处理。同时我们使用**累加器（Accumulator）**变量实时记录递增状态（递增并非是指加法），这里是一个整型值。

接下来，我们重新实现那些函数式编程的「伙伴」（自己来写 map、flatMap 和 filter 函数）。简便起见，所有这些方法都是对 `Int` 或 `Optional<Int>` 进行操作的；换言之，我们此刻不考虑泛型。另外牢记下面的实现只是为了展示 `reduce` 的实现过程。原生的 Swift 实现相比较下面 reduce 的版本，速度要快很多[1](#1)。不过，Reduce 能在不同的问题中表现得很好，之后会进一步地详述。

### Map

```swift
// 重新定义一个 map 函数
func rmap(elements: [Int], transform: (Int) -> Int) -> [Int] {
    return elements.reduce([Int](), combine: { (var acc: [Int], obj: Int) -> [Int] in
       acc.append(transform(obj))
       return acc
    })
}
print(rmap([1, 2, 3, 4], transform: { $0 * 2}))
// [2, 4, 6, 8]
```

这个例子能够很好地帮助你理解 `reduce` 的基础知识。

* 首先，elements 序列调用 reduce 方法：`elements.reduce...`。
* 然后，我们传入初始值给累加器（Accumulator），即一个 Int 类型空数组（`[Int]()`）。
* 接着，我们传入 `combinator` 闭包，它接收两个参数：第一个参数为 accumulator，即 `acc: [Int]`；第二个参数为从序列中取得的当前对象 `obj: Int`（译者注：对序列进行遍历，每次取到其中的一个对象 obj）。
* `combinator` 闭包体中的实现代码非常简单。我们对 obj 做变换处理，然后添加到累加器 accumulator 中。最后返回 accumulator 对象。

相比较调用 `map` 方法，这种实现代码看起来有点冗余。的确如此！但是，上面这个版本相当详细地解释了 `reduce` 方法是怎么工作的。我们可以对此进行简化。

```swift
func rmap(elements: [Int], transform: (Int) -> Int) -> [Int] {
	// $0 表示第一个传入参数，$1 表示第二个传入参数，依次类推...
    return elements.reduce([Int](), combine: {$0 + [transform($1)]})
}
print(rmap([1, 2, 3, 4], transform: { $0 * 2}))
// [2, 4, 6, 8]
```

依旧能够正常运行。这个版本都有哪些不同呢？实际上，我们使用了 Swift 中的小技巧，`+` 运算符能够对两个序列进行加法操作。因此 `[0, 1, 2] + [transform(4)]` 表达式将左序列和右序列进行相加，其中右序列由转换后的元素构成。

这里有个地方需要引起注意：`[0, 1, 2] + [4]` 执行速度要慢于 `[0, 1, 2].append(4)`。倘若你正在处理庞大的列表，应取代集合 + 集合的方式，转而使用一个可变的 accumulator 变量进行递增：

```swift
func rmap(elements: [Int], transform: (Int) -> Int) -> [Int] {
    return elements.reduce([Int](), combine: { (var ac: [Int], b: Int) -> [Int] in 
	// 作者提倡使用这种，因为执行速度更快
	ac.append(transform(b))
	return ac
    })
}
```

为了进一步加深对 `reduce` 的理解，我们将继续重新实现 `flatMap` 和 `filter` 方法。

```swift
func rflatMap(elements: [Int], transform: (Int) -> Int?) -> [Int] {
    return elements.reduce([Int](), 
       combine: { guard let m = transform($1) else { return $0 } 
		  return $0 + [m]})
}
print(rflatMap([1, 3, 4], transform: { guard $0 != 3 else { return nil }; return $0 * 2}))
// [2, 8]
```

这里 rflatMap 和 rmap 主要差异在于，前者增加了一个 `guard` 表达式确保可选类型始终有值（换言之，摒弃那些 nil 的情况）。

### Filter

```swift
func rFilter(elements: [Int], filter: (Int) -> Bool) -> [Int] {
    return elements.reduce([Int](), 
       combine: { guard filter($1) else { return $0 } 
		  return $0 + [$1]})
}
print(rFilter([1, 3, 4, 6], filter: { $0 % 2 == 0}))
// [4, 6]
```

依旧难度不大。我们再次使用 guard 表达式确保满足筛选条件。

到目前为止，`reduce` 方法看起来更像是 `map` 或 `filter` 的复杂版本，除此之外然并卵。不过，所结合的内容不需要是一个数组，它可以是其他任何类型。这使得我们依靠一种简单的方式，就可以轻松地实现各种 reduction 操作。

### Reduce 范例

首先介绍我最喜欢的数组元素求和范例：

```swift
// 初始值 initial 为 0，每次遍历数组元素，执行 + 操作
[0, 1, 2, 3, 4].reduce(0, combine: +)
// 10
```

仅传入 `+` 作为一个 `combinator` 函数是有效的，它仅仅是对 `lhs（Left-hand side，等式左侧）` 和 `rhs（Right-hand side，等式右侧）` 做加法处理，最后返回结果值，这完全满足 `reduce` 函数的要求。

另外一个范例：通过一组数字计算他们的乘积：

```swift
// 初始值 initial 为 1，每次遍历数组元素，执行 * 操作
[1, 2, 3, 4].reduce(1, combine: *)
// 24
```

甚至我们可以反转数组：

```swift
// $0 指累加器（accumulator），$1 指遍历数组得到的一个元素
[1, 2, 3, 4, 5].reduce([Int](), combine: { [$1] + $0 })
// 5, 4, 3, 2, 1
```

最后，来点有难度的任务。我们想要基于某个标准对列表做划分（Partition）处理：

```swift
// 为元组定义个别名，此外 Acc 也是闭包传入的 accumulator 的类型
typealias Acc = (l: [Int], r: [Int])
func partition(lst: [Int], criteria: (Int) -> Bool) -> Acc {
   return lst.reduce((l: [Int](), r: [Int]()), combine: { (ac: Acc, o: Int) -> Acc in 
      if criteria(o) {
	return (l: ac.l + [o], r: ac.r)
      } else {
	return (r: ac.r + [o], l: ac.l)
      }
   })
}
partition([1, 2, 3, 4, 5, 6, 7, 8, 9], criteria: { $0 % 2 == 0 })
//: ([2, 4, 6, 8], [1, 3, 5, 7, 9])
```

上面实现中最有意思的莫过于我们使用 `tuple` 作为 accumulator。你会渐渐发现，一旦你尝试将 `reduce` 进入到日常工作流中，`tuple` 是一个不错的选择，它能够将数据与 reduce 操作快速挂钩起来。

### 执行效率对比：Reduce vs. 链式结构 

`reduce` 除了较强的灵活性之外，还具有另一个优势：通常情况下，`map` 和 `filter` 所组成的链式结构会引入性能上的问题，因为它们需要多次遍历你的集合才能最终得到结果值，这种操作往往伴随着性能损失，比如以下代码：

```swift
[0, 1, 2, 3, 4].map({ $0 + 3}).filter({ $0 % 2 == 0}).reduce(0, combine: +)
```

除了毫无意义之外，它还浪费了 CPU 周期。初始序列（即 [0, 1, 2, 3, 4]）被重复访问了三次之多。首先是 map，接着 filter，最后对数组内容求和。其实，所有这一切操作我们能够使用 `reduce` 完全替换实现，极大提高执行效率：

```swift
// 这里只需要遍历 1 次序列足矣
[0, 1, 2, 3, 4].reduce(0, combine: { (ac: Int, r: Int) -> Int in 
   if (r + 3) % 2 == 0 {
     return ac + r + 3
   } else {
     return ac
   }
})
```

这里给出一个快速的基准运行测试，使用以上两个版本以及 for-loop 方式对一个容量为 100000 的列表做处理操作：

```swift
// for-loop 版本
var ux = 0
for i in Array(0...100000) {
    if (i + 3) % 2 == 0 {
	ux += (i + 3)
    }
}
```

![测试结果](http://7xiol9.com1.z0.glb.clouddn.com/pic测试结果.png)

正如你所看见的，`reduce` 版本的执行效率和 `for-loop` 操作非常相近，且是链式操作的一半时间。

不过，在某些情况中，链式操作是优于 `reduce` 的。思考如下范例：

```swift
Array(0...100000).map({ $0 + 3}).reverse().prefix(3)
// 0.027 Seconds
```

```swift
Array(0...100000).reduce([], combine: { (var ac: [Int], r: Int) -> [Int] in
    ac.insert(r + 3, atIndex: 0)
    return ac
}).prefix(3)
// 2.927 Seconds
```

这里，注意到使用链式操作花费 0.027s，这与 reduce 操作的 2.927s 形成了鲜明的反差，这究竟是怎么回事呢？[2](#2)

Reddit 网站的搜索结果指出，从 reduce 的语义上来说，传入闭包的参数（如果可变的话，即 mutated），会对底层序列的每个元素都产生一份 copy 。在我们的案例中，这意味着 **accumulator** 参数 `ac` 将为 0…100000 范围内的每个元素都执行一次复制操作。有关对此更好、更详细的解释请看这篇 [Airspeedvelocity](http://airspeedvelocity.net/2015/08/03/arrays-linked-lists-and-performance/) 博客文章。

因此，当我们试图使用 `reduce` 来替换掉一组操作时，请时刻保持清醒，问问自己：reduction 在问题中的情形下是否确实是最合适的方式。

现在，可以回到我们的初始问题：计算人口总数和平均年龄。请试着用 `reduce` 来解决吧。

### 再一次尝试来写 infoFromState 函数

```swift
func infoFromState(state state: String, persons: [[String: AnyObject]]) 
      -> (count: Int, age: Float) {

      // 在函数内定义别名让函数更加简洁
      typealias Acc = (count: Int, age: Float)

      // reduce 结果暂存为临时的变量
      let u = persons.reduce((count: 0, age: 0.0)) {
	  (ac: Acc, p) -> Acc in

	  // 获取地区和年龄
	  guard let personState = (p["city"] as? String)?.componentsSeparatedByString(", ").last,
		personAge = p["age"] as? Int

	    // 确保选出来的是来自正确的洲
	    where personState == state

	    // 如果缺失年龄或者地区，又或者上者比较结果不等，返回
	    else { return ac }

	  // 最终累加计算人数和年龄
	  return (count: ac.count + 1, age: ac.age + Float(personAge))
      }

  // 我们的结果就是上面的人数和除以人数后的平均年龄
  return (age: u.age / Float(u.count), count: u.count)
}
print(infoFromState(state: "CA", persons: persons))
// prints: (count: 3, age: 34.3333)
```

和早前的范例一样，我们再次使用了 `tuple` 作为 accumulator 记录状态值。除此之外，代码读起来简明易懂。

同时，我们在函数体中定义了一个别名 **Acc**：`typealias Acc = (count: Int, age: Float)`，起到了简化类型注释的作用。

### 总结

本文是对 `reduce` 方法的一个简短概述。倘若你不想将过多函数式方法通过链式结构串联起来调用，**亦或**是数据的输出形式与传入数据的形式不一致时，reduce 就相当有用了。最后，我将向你展示通过使用 reduce 的各种范例来结束本文，希望能为你带来些许灵感。

### 更多范例

以下范例展示了 `reduce` 的其他使用案例。请记住例子只作为展示教学使用，即它们更多地强调 reduce 的使用方式，而非为你的代码库提供通用的解决方法。大多数范例都可以通过其他更好、更快的方式来编写（即通过 extension 或 generics）。并且这些实现方式已经在许多 Swift 库中都有实现，诸如 [SwiftSequence](https://github.com/oisdk/SwiftSequence) 以及 [Dollar.swift](https://github.com/ankurp/Dollar.swift)

### Minimum

返回列表中的最小项。显然，`[1, 5, 2, 9, 4].minElement()` 方法更胜一筹。

```swift
// 初始值为 Int.max，传入闭包为 min：求两个数的最小值
// min 闭包传入两个参数：1. 初始值 2. 遍历列表时的当前元素
// 倘若当前元素小于初始值，初始值就会替换成当前元素
// 示意写法： initial = min(initial, elem)
[1, 5, 2, 9, 4].reduce(Int.max, combine: min)
```

### Unique

剔除列表中重复的元素。当然，最好的解决方式是使用`集合（Set）`。

```swift
[1, 2, 5, 1, 7].reduce([], combine: { (a: [Int], b: Int) -> [Int] in
if a.contains(b) {
   return a
} else {
   return a + [b]
}
})
// prints: 1, 2, 5, 7
```

### Group By

遍历整个列表，通过一个鉴别函数对列表中元素进行分组，将分组后的列表作为结果值返回。问题中的鉴别函数返回值类型需要遵循 `Hashable` 协议，这样我们才能拥有不同的键值。此外保留元素的排序，而组内元素排序则不一定被保留下来。

```swift
func groupby<T, H: Hashable>(items: [T], f: (T) -> H) -> [H: [T]] {
   return items.reduce([:], combine: { (var ac: [H: [T]], o: T) -> [H: [T]] in 
	   // o 为遍历序列的当前元素
       let h = f(o) // 通过 f 函数得到 o 对应的键值
       if var c = ac[h] { // 说明 o 对应的键值已经存在，只需要更新键值对应的数组元素即可
	   c.append(o)
	   ac.updateValue(c, forKey: h)
       } else { // 说明 o 对应的键值不存在，需要为字典新增一个键值，对应值为 [o]
	   ac.updateValue([o], forKey: h)
       }
       return ac
   })
}
print(groupby([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], f: { $0 % 3 }))
// prints: [2: [2, 5, 8, 11], 0: [3, 6, 9, 12], 1: [1, 4, 7, 10]]
print(groupby(["Carl", "Cozy", "Bethlehem", "Belem", "Brand", "Zara"], f: { $0.characters.first! }))
// prints: ["C" : ["Carl" , "Cozy"] , "B" : ["Bethlehem" , "Belem" , "Brand"] , "Z" : ["Zara"]]
```

### Interpose

函数给定一个 `items` 数组，每隔 `count` 个元素插入 `element` 元素，返回结果值。下面的实现确保了 element 仅在中间插入，而不会添加到数组尾部。

```swift
func interpose<T>(items: [T], element: T, count: Int = 1) -> [T] {
   // cur 为当前遍历元素的索引值 cnt 为计数器，当值等于 count 时又重新置 1
   typealias Acc = (ac: [T], cur: Int, cnt: Int)
   return items.reduce((ac: [], cur: 0, cnt: 1), combine: { (a: Acc, o: T) -> Acc in 
       switch a {
	  // 此时遍历的当前元素为序列中的最后一个元素
	  case let (ac, cur, _) where (cur+1) == items.count: return (ac + [o], 0, 0)
	  // 满足插入条件
	  case let (ac, cur, c) where c == count:
	     return (ac + [o, element], cur + 1, 1)
	  // 执行下一步
	  case let (ac, cur, c):
	     return (ac + [o], cur + 1, c + 1)
       }
   }).ac
}
print(interpose([1, 2, 3, 4, 5], element: 9))
// : [1, 9, 2, 9, 3, 9, 4, 9, 5]
print(interpose([1, 2, 3, 4, 5], element: 9, count: 2))
// : [1, 2, 9, 3, 4, 9, 5]
```

### Interdig

该函数允许你有选择从两个序列中挑选元素合并成为一个新序列返回。

```swift
func interdig<T>(list1: [T], list2: [T]) -> [T] {
   // Zip2Sequence 返回 [(list1, list2)] 是一个数组，类型为元组
   // 也就解释了为什么 combinator 闭包的类型是 (ac: [T], o: (T, T)) -> [T]
   return Zip2Sequence(list1, list2).reduce([], combine: { (ac: [T], o: (T, T)) -> [T] in 
	return ac + [o.0, o.1]
   })
}
print(interdig([1, 3, 5], list2: [2, 4, 6]))
// : [1, 2, 3, 4, 5, 6]
```

### Chunk

该函数返回原数组分解成长度为 `n` 后的多个数组：

```swift
func chunk<T>(list: [T], length: Int) -> [[T]] {
   typealias Acc = (stack: [[T]], cur: [T], cnt: Int)
   let l = list.reduce((stack: [], cur: [], cnt: 0), combine: { (ac: Acc, o: T) -> Acc in
      if ac.cnt == length {
	  return (stack: ac.stack + [ac.cur], cur: [o], cnt: 1)
      } else {
	  return (stack: ac.stack, cur: ac.cur + [o], cnt: ac.cnt + 1)
      }
   })
   return l.stack + [l.cur]
}
print(chunk([1, 2, 3, 4, 5, 6, 7], length: 2))
// : [[1, 2], [3, 4], [5, 6], [7]]
```

函数中使用一个更为复杂的 `accumulator`，包含了 stack、current list 以及 count 。

译者注：有关 Reduce 底层实现，请看[这篇文章](http://www.jianshu.com/p/06c90c0470b2)。

2015/12/01 改动：

1. 修复 `rFlatMap` 类型签名
2. 为代码范例新增注解
3. 修复了变量属性为 lazy 时执行效率不一致的问题

---

<a name="1">1、这么做的原因来看[这篇博文](http://airspeedvelocity.net/2015/08/03/arrays-linked-lists-and-performance/)。
<a name="2">2、这篇文章的早期版本中，我错误地认为 Swift 的懒惰特性是造成这种差异的罪魁祸首。[感谢 Reddit 的这个讨论指出了我的错误](https://www.reddit.com/r/swift/comments/3uv1hy/reduce_all_the_things_alternatives_to_mapfilter/)。