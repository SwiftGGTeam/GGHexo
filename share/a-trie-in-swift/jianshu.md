如何在 Swift 中使用字典树
> 更多优秀译文请关注我们的微信公众号：learnSwift

> 原文链接：[A Trie in Swift](https://bigonotetaking.wordpress.com/2015/08/11/a-trie-in-swift/?utm_campaign=Swift%2BSandbox&utm_medium=web&utm_source=Swift_Sandbox_2)
> 原文日期：2015/08/11

> 译者：[小铁匠Linus](http://weibo.com/linusling)
> 校对：[numbbbbb](https://github.com/numbbbbb)
> 定稿：[numbbbbb](https://github.com/numbbbbb)

(此文中的代码都可以在[这里](https://github.com/oisdk/SwiftTrie)下载)  
如果上 Google 搜“酷酷的数据结构”，你首先会看到[这个](http://stackoverflow.com/questions/500607/what-are-the-lesser-known-but-useful-data-structures)结果。其中主要是 stackoverflow 上的一个问题：“哪些是我们很少知道但是很有用的数据结构？”。而点赞最多的答案，就是本期主题：字典树。我读了一下，发现了很多酷酷的东西都是关于字典树的用途(同时发现我也是那种会去 Google 搜“酷酷的数据结构”的人，哈哈)。然后我就打开 playground，开始写这篇文章。  



字典树是一种前缀树。它是一种递归的数据结构：每个字典树包含子字典树，子字典树通过前缀来辨认。 

字典树这种数据结构不仅广泛使用，而且也有一些有用的应用。它也有类似 Set 一样的操作，比如插入和查找都是`O(n)`复杂度，其中`n`是查找序列的长度。目前，Set是哈希化(hashable)和元素无序化的最好方式。但是，如果要查找的序列中元素是哈希化的，那么字典树就很适合。(有一点要注意：Set 本身是哈希化的，所以，假如需要保存的序列是无序的话，那么 Set 的集合会更合适)

![A trie for keys “A”, “to”, “tea”, “ted”, “ten”, “i”, “in”, and “inn”.](http://swift.gg/img/articles/a-trie-in-swift/1092px-Trie_example.svg.png)

在 Swift 中，我们可以让字典树包含一系列的前缀和子字典树来实现。
代码如下：  

```swift
public struct Trie<Element : Hashable> {
  private var children: [Element:Trie<Element>]
}
```

我们定义的结构可以递归，因为我不是直接在字典树里保存字典树——我们保存的是引用子字典树的字典类型。在这个字典中，把前缀当作键。那么我们怎么初始化呢？可以像列表那样使用生成器的分解属性。  

```swift
extension Trie {
  private init<G : GeneratorType where G.Element == Element>(var gen: G) {
    if let head = gen.next() {
      children = [head:Trie(gen:gen)]
    } else {
      children = [:]
    }
  }
  public init
    <S : SequenceType where S.Generator.Element == Element>
    (_ seq: S) {
      self.init(gen: seq.generate())
  }
}
```

这还远远不够。我们不仅需要保存一个序列，还需要`insert`操作：  

```swift
extension Trie {
  private mutating func insert
    <G : GeneratorType where G.Element == Element>
    (var gen: G) {
      if let head = gen.next() {
        children[head]?.insert(gen) ?? {children[head] = Trie(gen: gen)}()
      }
  }
  public mutating func insert
    <S : SequenceType where S.Generator.Element == Element>
    (seq: S) {
      insert(seq.generate())
  }
}
```

上面有一行代码看起来很奇怪：  

```swift
children[head]?.insert(gen) ?? {children[head] = Trie(gen: gen)}()
```

老实说，我自己也不太喜欢这样的写法。你可以调用可选链的可变方法(mutating methods)。在这个例子中调用时，可选值是由字典查找返回的：如果我们进行插入操作时这个值存在，我们就会修改这个值。

如果不存在，就需要处理这个添加动作。我们可以尝试着把子字典树抽取出来，像这样：  

```swift
if let head = gen.next() {
  if var child = children[head] {
    child.insert(gen)
  } else {
    children[head] = Trie(gen: gen)
  }
}
```

但是，代码中的子字典树只是我们想要修改的真正的子字典树的拷贝。我们之后会把它放回字典中——虽然现在看起来可能这是在做无用功。  

我们都知道，那些看起来没有返回值的函数，其实会返回特殊的值，叫做`Void`或`()`。本文中，`()?` (或者 `Optional<Void>`)也属于这类。我们不关心`void`本身，很明显，我们只关心是不是`nil`。因此，我们可以这样做：  

```swift
if let _ = children[head]?.insert(gen) { return }
children[head] = Trie(gen: gen)
```

或者使用`guard`：  

```swift
guard let _ = children[head]?.insert(gen) else { children[head] = Trie(gen: gen) }
```
不过我认为用`nil coalescing`运算符可能更好，省去`let`或`_`对理解的干扰。 

感觉字典树这个数据结构并不按常理出牌。一开始，可以直接用变异方法更简单的返回字典树。此外，因为基本上每个方法都包含整个字典树，所以惰性加载几乎是不可能的。(如果谁可以想出一个有效的方法实现惰性加载，请告诉我。)  

字典树中最重要的`contains`函数是这样的：  

```swift
extension Trie {
  private func contains
    <G : GeneratorType where G.Element == Element>
    (var gen: G) -> Bool {
      return gen.next().map{self.children[$0]?.contains(gen) ?? false} ?? true
  }
  public func contains
    <S : SequenceType where S.Generator.Element == Element>
    (seq: S) -> Bool {
      return contains(seq.generate())
  }
}
```

这里使用了很多生成器。如果生成器是空的(`gen.next()`返回`nil`)，那么字典树就包含序列，因为我们只有当前的元素。`map()`从生成器中寻找下一个元素并返回。如果返回的是`nil`，字典树就不包含这个序列。最后，返回是否包含其余生成器的子字典树，有就是`true`，没有就是`false`。举个栗子：  

```swift
var jo = Trie([1, 2, 3])
jo.insert([4, 5, 6])
jo.insert([7, 8, 9])
 
jo.contains([4, 5, 6]) // true
jo.contains([2, 1, 3]) // false
```

这里有个小问题。`contains`方法不能像我们想象那样执行以下代码： 
 
```swift
jo.contains([1, 2]) // true
```
因为只要生成器里没有数据，就都返回`true`，所以字典树就“包含”了每个已经被插入的序列的前缀。这并不是我们想要的。一种解决方案是：只有在最后一个字典树没有子节点的时候返回`true`。修改后如下： 
 
```swift
extension Trie {
  private func contains
    <G : GeneratorType where G.Element == Element>
    (var gen: G) -> Bool {
      return gen.next().map{self.children[$0]?.contains(gen) ?? false} ?? children.isEmpty
  }
}
```

但是这好像并没有用。如果我们调用`jo.insert([1, 2])`会怎么样呢？我们发现返回值是`false`，字典树并没有包含`[1, 2]`。  

针对这种情况，我们需要一个额外的布尔变量，用这个变量来标记字典树是否在序列的末端。  

```swift
public struct Trie<Element : Hashable> {
  private var children: [Element:Trie<Element>]
  private var endHere : Bool
}
```

我们也需要修改我们的`insert`和`init`方法，以便生成器返回`nil`时，`endHere`被初始化为`true`。  

```swift
extension Trie {
  private init<G : GeneratorType where G.Element == Element>(var gen: G) {
    if let head = gen.next() {
      (children, endHere) = ([head:Trie(gen:gen)], false)
    } else {
      (children, endHere) = ([:], true)
    }
  }
}
 
extension Trie {
  private mutating func insert
    <G : GeneratorType where G.Element == Element>
    (var gen: G) {
      if let head = gen.next() {
        children[head]?.insert(gen) ?? {children[head] = Trie(gen: gen)}()
      } else {
        endHere = true
      }
  }
}
```

同时，`contains`方法返回`endHere`变量，而不再是`true`。  

```swift
public extension Trie {
  private func contains
    <G : GeneratorType where G.Element == Element>
    (var gen: G) -> Bool {
      return gen.next().map{self.children[$0]?.contains(gen) ?? false} ?? endHere
  }
}
```

我们在优化`contains`方法时，用`guard`可以增加代码可读性：  

```swift
public extension Trie {
  private func contains<
    G : GeneratorType where G.Element == Element
    >(var gen: G) -> Bool {
      guard let head = gen.next() else { return endHere }
      return children[head]?.contains(gen) ?? false
  }
}
```

Chris Eidhof给了我如下建议：

>*This is how Swift 2 improves our Functional Data Structures chapter in [@FunctionalSwift](https://twitter.com/FunctionalSwift) : [pic.twitter.com/LgwCBm7zA6](http://t.co/LgwCBm7zA6)
— Chris Eidhof (@chriseidhof) [August 6, 2015](https://twitter.com/chriseidhof/status/629215881843884032)*

(显然，这是他的[Functional Programming in Swift](http://www.objc.io/books/fpinswift/)中的字典树实现。我没看过，现在准备去看。如果[Advanced Swift](http://www.objc.io/books/advanced-swift/)可以超过前者，那肯定很有意思。)  

我们希望字典树能像 Set 那样使用所有的并集、交集方法。而`insert`、`init` 和`contains`方法已经实现了，还有`remove`方法没有实现。 

`remove`方法看上去有点难度。你可能会在序列的末端删除，然后把`endHere`从`true`改成`false`，其实这没有什么卵用。我的意思是你还是会在删除操作后保存相同的信息。而你真正需要的操作是删除不再使用的分支。  

说起来这个事情有点复杂。你仅仅找到想要删除的，然后就把所有的子节点删除了。你不能这样做，因为这可能会删除其他的入口点( entries )。你也不能删除只有一个子节点的字典树，因为子节点可能会随后延伸开去，或许也将包含你想要删除的序列的前缀。  

至关重要的是，所有关于能不能删除给定入口的信息都来自字典树的子节点。所以，我决定用递归调用变异方法来实现，并且这个方法会返回一个重要的值。在这种情况下，这个重要的值是一个布尔类型的，它表示这个字典树能不能被删除。因为我使用的是私有方法做生成器，公有包装方法来处理序列，所以我会在公共方法中返回布尔类型表示能不能被删除。

让我们继续：  

```swift
private mutating func remove<
  G : GeneratorType where G.Element == Element
  >(var g: G) -> Bool { 
```

到目前为止，这跟其他方法没什么区别。接着，处理生成器的头部：  

```swift
if let head = g.next() {
```

这个`if`代码块里是具体的逻辑步骤，我们先跳过它来处理`g.next()`返回`nil`时的情况：  

```swift
private mutating func remove<
  G : GeneratorType where G.Element == Element
  >(var g: G) -> Bool {
    if let head = g.next() {...}
    endHere = false
    return children.isEmpty
}
```

到这里就结束删除序列的操作了。这意味着现在不管在哪棵字典树都应该把`endHere`设为`false`。对于字典树的使用者来说，从现在开始，如果再给
`contains`方法传入那个序列作为参数的话，就会返回`false`。  

然而，如果可以删除数据本身，就会返回`children.isEmpty`的值。如果当前字典树没有子节点，那么就是可以删除了的。  
现在再回到`if`代码块里具体的实现：  

```swift
guard children[head]?.remove(g) == true else { return false }
children.removeValueForKey(head)
return !endHere && children.isEmpty
```

调用`remove`来删除子字典树对应的`head`。`guard`语句会有两种情况返回false：一种情况是`children`没有包含`head`，另一种是要被删除的sequence已经不在当前的字典树中了。因为没有成功删除或变异，这个方法将返回`false`。  

如果`children`包含了`head`，但是返回还是`false`的话，这表示它的子节点是不可删除的，所以才会返回`false`。否则，会成功删除(`children.removeValueForKey(head)`)。  

接着，字典树通过`return !endHere && children.isEmpty`会知道自己是不是可以删除的。如果`endHere`等于`true`的话，表示已经在 sequence 末端了，那就是不可删除的；如果没有子节点就是可删除的。完整的方法如下：  

```swift
extension Trie {
  private mutating func remove<
    G : GeneratorType where G.Element == Element
    >(var g: G) -> Bool { // Return value signifies whether or not it can be removed
      if let head = g.next() {
        guard children[head]?.remove(g) == true else { return false }
        children.removeValueForKey(head)
        return !endHere && children.isEmpty
      }
      endHere = false
      return children.isEmpty
  }
  public mutating func remove<
    S : SequenceType where S.Generator.Element == Element
    >(seq: S) {
      remove(seq.generate())
  }
}
```

这代码又丑又长，用`count`属性来简化一下吧：  

```
extension Trie {
  public var count: Int {
    return children.values.reduce(endHere ? 1 : 0) { $0 + $1.count }
  }
}
```

通过`count`属性记录`endHere`有多少次`true`。如果当前的字典树到末端了，`count`就加一`(endHere ? 1 : 0)`，同时也加到所有孩子节点的总和里。  

接下来处理`SequenceType`。[Getting tree-like structures to conform to `SequenceType` is a bit of a pain](http://airspeedvelocity.net/2015/07/22/a-persistent-tree-using-indirect-enums-in-swift/)文章里觉得树形结构要遵照`SequenceType`有点头疼的原因主要是因为递归。如果用线性(非递归)表示会很 easy：  

```swift
extension Trie {
  public var contents: [[Element]] {
    return children.flatMap {
      (head: Element, child: Trie<Element>) -> [[Element]] in
      child.contents.map { [head] + $0 } + (child.endHere ? [[head]] : [])
    }
  }
}
```

然后，这当然也可以作为字典树的生成方法。这个看上去有点不合适，就好像仅仅通过遍历的方式就把一种数据结构转换成了另一种数据结构。而我们真正需要的是按需生成每个元素。  

然而，有时候需要手写一些虽然用手写很不 nice 的代码，而且还要用一些 trick (比如：闭包)。无论如何，看代码吧：  

```swift
public struct TrieGenerator<Element : Hashable> : GeneratorType {
  private var children: DictionaryGenerator<Element, Trie<Element>>
  private var curHead : Element?
  private var curEnd  : Bool = false
  private var innerGen: (() -> [Element]?)?
  private mutating func update() {
    guard let (head, child) = children.next() else { innerGen = nil; return }
    curHead = head
    var g = child.generate()
    innerGen = {g.next()}
    curEnd = child.endHere
  }
  public mutating func next() -> [Element]? {
    for ; innerGen != nil; update() {
      if let next = innerGen!() {
        return [curHead!] + next
      } else if curEnd {
        curEnd = false
        return [curHead!]
      }
    }
    return nil
  }
  private init(_ from: Trie<Element>) {
    children = from.children.generate()
    update()
  }
}
```

这里跟之前使用的`lazy flatMap`逻辑类似。  

playground 版的代码可以在[这里](https://github.com/oisdk/SwiftTrie)下载，SwiftSequence 里有一些测试，代码在[这里](https://github.com/oisdk/SwiftSequence)。


