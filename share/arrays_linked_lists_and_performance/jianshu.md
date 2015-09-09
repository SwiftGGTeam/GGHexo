Swift 中数组和链表的性能

> 作者：airspeedvelocity，[原文链接](http://airspeedvelocity.net/2015/08/03/arrays-linked-lists-and-performance/)，原文日期：2015/08/03
> 译者：[mmoaay](http://blog.csdn.net/mmoaay)；校对：[shanks](http://codebuild.me/)；定稿：[numbbbbb](https://github.com/numbbbbb)
  







> 病人：医生医生，我一啪啪就蛋疼
> 医生：那就别啪

我在[Twitter](https://twitter.com/AirspeedSwift/status/627469657264553984)上说过：

> 使用 `reduce` 构建数组虽然有趣，但有使性能减半的风险。

很多人觉得这句话很奇怪，这让我非常惊讶。相当一部分人建议将 `reduce` 改成不做数组拷贝（我*不认为*这样是可行的）。也有建议说需要对 `+` 运算符做优化，让它不做拷贝操作（我同样不认为这样做很简单，而且很快我们就会意识到这一点）。

> 其他人建议我除非文档有提到，不然就不需要在意这些细枝末节的问题（而我认为这是在编写代码时必须注意的——说什么“只有在文档告诉我这里有问题时我才注意”就好像“只有单元测试结果显示不正确时我才编写正确代码”一样。）



而其他的反馈中，有一部分与我[之前发的链表那篇文章](http://airspeedvelocity.net/2015/07/26/linked-lists-enums-value-types-and-identity/)有关，为什么去实现一个已经过时的数据结构？我们已经有数组了，它的存在还有什么意义？

所以，你就知道为什么我有时候会特别提到这不只是一个关于 Mac 和 iOS 编程的博客？这当然不是一个只关于 Mac 和 iOS 编程的博客！不要因为我偶然觉得一个包含枚举类型的链表有趣你就把它放到你的 app 里。因为我会对随之而来的性能问题产生兴趣，而你不会。尽管如此，我觉得链表的例子非常有意思，而且值得实现和把玩，它有可能会提升数组 `reduce` 方法的性能。甚至在某些（少见的）场景下对实际编码有用。

> 同时我认为 Swift 的一些额外特性很有趣：比如它的枚举可以灵活的在对象和具体方法中自由选择，以及“默认安全”。这些都促使它成为一门非常好的计算机教学类语言。[这本书](http://amzn.to/1JZzydR) 未来的版本可能就会用 Swift 作为实现语言。

言归正传——有时你会用 `reduce` 来构建一个数组（字典或者集合）。下面是使用 `reduce` 实现的 `map`：

```swift
extension SequenceType {
   func mapUsingReduce<T>(transform: Generator.Element->T) -> [T] {
        return reduce([]) { $0 + [transform($1)] }
    }
}
```

作为对比，可以创建可变数组然后使用 `for` 循环：

```swift
extension SequenceType {
   func mapUsingFor<T>(transform: Generator.Element->T) -> [T] {
        var result: [T] = []
        for x in self { result.append(transform(x)) }
        return result
    }
}
```

不同点在于， `+` 运算每次都会拷贝不断变长的数组。拷贝数组消耗的时间是线性的。也就是说，遍历整个数组时，随着数组长度的增长，消耗总时间成二次幂增长。

![](http://swift.gghttp://img.blog.csdn.net/20150822155020448) 

尽管如此，正常来说人们都不会去重新实现 `map` 函数：你看到的会是这样一些技巧：告诉你先去重或者根据词频建立字典。但是最本质的问题仍然存在。

但是这个和链表又有什么关系？因为你可以利用 [上次链表的代码](https://gist.github.com/airspeedswift/7e233e723e458b1eacfe) 来实现 `reduce` 版本的 `map`，就像下面这样：

```swift
extension SequenceType {
    func mapToList<T>(transform: Generator.Element->T) -> List<T> {
        return reduce(List()) { $0.cons(transform($1)) }.reverse()
    }
}
```

结果就是这个版本的性能竟然只有数组版本的一半（因为 `reverse` 这一步），以至于你的老师都会怀疑你是在测试结果上作弊，而不是实验产生的结果：

![](http://swift.gghttp://img.blog.csdn.net/20150822202048317)

得到这个结果的原因是链表是连续的——旧的链表和新连接的链表之间永远都是用节点相连。所以不需要拷贝。但是代价是只能从头部增加链表的长度（所以才需要 `reverse`），而且链表必须保持不变。所以就算链表只有一个引用，也需要先拷贝再对它进行修改。这和 `Array` 是有区别的， `Array` 可以检测它的缓冲区何时被单独访问，这样就可以直接修改，不需要拷贝。使用链表还有其他的代价——统计链表节点的个数所需要的时间是统计数组元素个数时间的两倍，因为遍历链表时的间接寻址方式是需要消耗时间的。

所以数组在 `+` 操作时做完全拷贝的问题到底能不能解决？在考虑这个问题之前，我们先来看一个写时拷贝数组能有什么帮助。Mike Ash 的 [一篇牛x博文](https://www.mikeash.com/pyblog/friday-qa-2015-04-17-lets-build-swiftarray.html) 已经实现了一个写时拷贝数组，所以我们稍作改变，使用标准库中的 `ManagedBuffer` 类来实现写时拷贝数组。

# ManagedBuffer

`ManagedBuffer` 是一个可继承的用于简化分配/释放内存操作和堆上内存管理的类。它是泛型，有 `Value` 和 `Element` 这两个独立占位符。`Element` 是存储元素的类型，在创建实例时被动态分配。`Value` 则是附加信息的类型——比如，如果要实现数组，你需要存储元素的个数，因为在内存释放之前需要把元素销毁掉。访问元素需要使用 `withUnsafeMutablePointerToElements`，而访问 `value` 则可以通过一个简单的非安全方法，或者直接使用 `.value` 属性。

下面的代码实现了一个极简的自销毁数组缓冲区：

```swift
private class MyArrayBuffer<Element>: ManagedBuffer<Int,Element> {
    deinit {
        self.withUnsafeMutablePointerToElements { elems->Void in
            elems.destroy(self.value)
        }
    }
}
```

这样一来， `MyArrayBuffer` 存储的元素仍然是泛型， 但是我们把 `ManagedBuffer` 的 `Value` 设置为 `Int`， 用来保存缓冲区元素的个数（有一点要铭记于心，我们会分配比数组中元素更多的空间，用来避免频繁的重分配操作）。

当缓冲区被析构时，`MyArrayBuffer.deinit` 会在 `ManagedBuffer.deinit` 之前调用，`ManagedBuffer.deinit` 会释放内存。这样的话 `MyArrayBuffer` 就有机会销毁其所有对象。如果 `Element` 不单单是一个被动的结构体，销毁对象就非常有必要——比如，如果数组里面包含了其他写时拷贝类型，销毁它们会触发它们去释放自身的内存。

现在我们可以建立一个数组类型的结构体，这个结构体使用一个私有的缓冲区来进行存储：

```swift
public struct MyArray<Element> {
    private var _buf: MyArrayBuffer<Element>

    public init() {
        _buf = MyArrayBuffer<Element>.create(8) { _ in 0 } as! MyArrayBuffer<Element>
    }
}
```

我们不直接使用 `MyArrayBuffer` 的 `init` —— 而使用 `ManagedBuffer` 的类方法。因为这个方法的返回值是父类，我们需要将其向下强制转换为正确的类型。

然后我们让 `MyArray` 支持集合操作：

```swift
extension MyArray: CollectionType {
    public var startIndex: Int { return 0 }
    public var endIndex: Int { return _buf.value }

    public subscript(idx: Int) -> Element {
        guard idx < self.endIndex else { fatalError("Array index out of range") }
        return _buf.withUnsafeMutablePointerToElements { $0[idx] }
    }
}
```

接着，我们需要为缓冲区添加两个相当相似的方法，一个用来拷贝内存，另一个用来调整内存大小。拷贝方法会在检测到共享存储时调用，调整大小方法则会在需要更多内存时调用：

```swift
extension MyArrayBuffer {
    func clone() -> MyArrayBuffer<Element> {
        return self.withUnsafeMutablePointerToElements { oldElems->MyArrayBuffer<Element> in
            return MyArrayBuffer<Element>.create(self.allocatedElementCount) { newBuf in
                newBuf.withUnsafeMutablePointerToElements { newElems->Void in
                    newElems.initializeFrom(oldElems, count: self.value)
                }
                return self.value
            } as! MyArrayBuffer<Element>
        }
    }

    func resize(newSize: Int) -> MyArrayBuffer<Element> {
        return self.withUnsafeMutablePointerToElements { oldElems->MyArrayBuffer<Element> in
            let elementCount = self.value
            return MyArrayBuffer<Element>.create(newSize) { newBuf in
                newBuf.withUnsafeMutablePointerToElements { newElems->Void in
                    newElems.moveInitializeFrom(oldElems, count: elementCount)
                }
                self.value = 0
                return elementCount
            } as! MyArrayBuffer<Element>
        }
    }
}
```

同时构建和填充缓冲区是有些苛刻的——首先我们需要获得指向已存在元素的非安全指针，然后调用 `create`，这个方法拥有的闭包会接收一个只构建了一部分的对象（比如，分配了内存但是没有初始化），这个对象随后需要调用 `newBuf.withUnsafeMutablePointerToElements` 来把内存从旧的缓冲区拷贝到新的缓冲区。

这两个方法最主要的不同点是 `clone` 不会改变旧的缓冲区中的元素，而只是把新的拷贝加载到新的缓冲区。 `resize` 则会把元素从旧的内存移动到新的内存（通过  `UnsafeMutablePointer` 的 `moveInitializeFrom` 方法），然后更新旧的缓冲区，告诉它已经不需要管理任何元素——不然，它会试图在 `deinit` 时销毁它们。

最后，我们给 `MyArray` 添加一个 `append` 和 `extend` 方法：

```swift
extension MyArray {
    public mutating func append(x: Element) {
        if !isUniquelyReferencedNonObjC(&_buf) {
            _buf = _buf.clone()
        }

        if _buf.allocatedElementCount == count {
            _buf = _buf.resize(count*2)
        }

        _buf.withUnsafeMutablePointers { (val, elems)->Void in
            (elems + val.memory++).initialize(x)
        }
    }

    public mutating func extend<S: SequenceType where S.Generator.Element == Element>(seq: S) {
        for x in seq { self.append(x) }
    }
}
```

这只是一段样例代码。事实上，你可能会把唯一性判断代码和调整大小代码单独抽出来，这样你就可以在下标集和其他稍微有变化的方法中重用。我懒得写，所以就把他们都塞在 `append` 方法里面了。此外，有可能的话你应该为 `append` 保留足够的空间让它进行扩展，这样就可以防止在同时共享且空间太小时缓冲区被加倍。但是所有这些对于我们的伟大蓝图都没有太大影响。

好了，下面就到操作符了。首先， `+=` ，赋值操作符，它的左值是 `inout` 的，使用右值对左侧进行扩展：

```swift
func +=<Element, S: SequenceType where S.Generator.Element == Element>
  (inout lhs: MyArray<Element>, rhs: S) {
    lhs.extend(rhs)
}
```

最后是 `+` 操作符。我们可以根据 `+=` 操作符的方式来实现它。这个操作符传入两个不可变的数组，然后将它们合并成一个新的数组。它依赖于写时拷贝动作来为左值创建一个可变拷贝，然后使用右值进行扩展：

```swift
func +<Element, S: SequenceType where S.Generator.Element == Element>
  (lhs: MyArray<Element>, rhs: S) -> MyArray<Element> {
    var result = lhs
    result += rhs
    return result
}
```

事实上你可以在 `lhs` 变量之前使用 `var` 标识符来进一步缩短代码：

```swift
func +<Element, S: SequenceType where S.Generator.Element == Element>
  (var lhs: MyArray<Element>, rhs: S) -> MyArray<Element> {
    lhs += rhs
    return lhs
}
```

之所以有第二个版本是因为有人说 `reduce` 的实现中应该为累加参数添加 `var` 标识符。而这和我们对 `lhs` 的修改类似： `var` 所做的事情只是声明传入的参数是可变的。它仍然是拷贝——它不是以某种方式传递过来原值的引用。

# + 操作符可以优化吗？

现在我们有了一个完全可用的写时拷贝数组的雏形，你可以对它做 `append` 操作，它也实现了 `+` 操作符。这也就意味着我们可以用它来重写 `reduce` 版的 `map` 方法：

```swift
func mapUsingMyReduce<T>(transform: Generator.Element->T) -> MyArray<T> {
    return reduce([]) { $0 + [transform($1)] }
}

func mapUsingMyFor<T>(transform: Generator.Element->T) -> MyArray<T> {
    var result = MyArray<T>()
    for x in self { result.append(transform(x)) }
    return result
}
```

如果你用图表对性能进行记录，你会发现这两段代码和使用数组实现的方式的表现完全类似。

所以，现在的情况是我们拥有一个完全受我们自己控制的实现，我们可以改变 `+` 操作符然后让它不做拷贝么？我不认为我们做到了。

来看一个更简单的例子：

```swift
var a = MyArray<Int>()
a.extend(0..<3)
let b = a + [6,7,8]
```

我们可以改变这段代码让它不做拷贝么？很明显我们不能。 `b` 必须是一个新的数组拷贝，目的是不影响 `a`。即使我们在创建 `b` 之后不对 `a` 做任何修改， `+` 操作符的实现也是没有办法知道这些的。也许*编译器*会知道，然后根据情况进行优化，但是 `+` 方法是不可能知道的。

检查唯一引用也无济于事。`a` 仍然存在，所以 `lhs` 不可能是缓冲区的唯一持有者。

`reduce` 方法也没什么不同，下面是一种可能的实现：

```swift
extension SequenceType {
    func myReduce<T>(initial: T, combine: (T,Generator.Element)->T) -> T {
        var result = initial
        for x in self {
            result = combine(result,x)
        }
        return result
    }
}
```

假设这里的 `combine` 是 `{ $0 + [transform($1)] }`，你会发现 `+` 操作符同样不知道我们直接将结果赋值给了 `result` 变量。检查代码我们就知道，如果有可能的话把右侧的内容添加到左侧的内容中是可行的（理论上来说是的，因为尽管数组是以不可变值传递，但是它的缓冲区是一个类，这样它就有了引用语义，从而可以被改变）。但是 `+` 操作符单通过它的位置是不可能知道这点的。它只是明确的知道左侧内容的拷贝不是缓冲区唯一的持有者，还有另外一个持有者—— `reduce` 也持有 `result` 的一份拷贝——而且马上就要将其摒弃然后使用新的结果来替换它，但是这都是在 `+` 操作执行*之后*。

还有一线希望就是如果每个数组刚好是它们自己的分片（然而并不是——而是有一个叫 `ArraySlice` 的东西，它需要额外的开销来把分片的起始和结束点记录到父数组中）。如果它们是的话，也许它们就可以被修改成允许其中一个、也只能是一个数组在做 `append` 操作时被其他数组忽略。但是这通常会增加数组的开销，而我们的目的是快——你肯定不会为了这种情况就让它们变慢吧。

也许有一种非常聪明的办法可以解决所有的问题，可能需要编译器的帮助也可能不需要。但尽管如此这仍然不是一个很好的主意。`+` 操作符语义是创建一个新数组。而想让它在某种非常特定情况下隐式的修改一个已经存在的数组显然不是正确的解决方案。如果你愿意，可以把 `var` 封装在一个小的泛型方法中，就好像它不存在一样。这样可以在提高代码效率的同时让代码更优雅。

