在 Swift 中实现字典"

> 作者：Soroush Khanlou，[原文链接](http://khanlou.com/2016/07/implementing-dictionary-in-swift/)，原文日期：2016-07-05
> 译者：jseanj；校对：[Prayer](http://www.futantan.com)；定稿：[shanks](http://codebuild.me/)
  









虽然 Swift 原生的字典类型实现得[很复杂](http://ankit.im/swift/2016/01/20/exploring-swift-dictionary-implementation/)（毫无疑问是为了性能），但是我们可以利用 Swift 提供的工具写出漂亮简洁的实现。我们从一个简单的实现开始，并且逐步添加功能。



我们简要看一下字典的工作原理：它通过任意类型的关键字来设置和获取值。这些值常常存储在一个数组中，当然也可以存储在树型结构中。由于我还不太清楚以树作为字典存储结构的工作原理，所以这篇文章中我们主要探索一个由数组存储值的字典。

由于我们字典中的值是由数组存储，所以我们需要将给定的关键字转换成整数，然后让这个整数落在数组范围内。这两个方法一个是哈希函数，一个是取模操作。通过哈希函数，我们可以将关键字（通常是字符串，也可以是遵循 `Hashable` 协议的任意类型）转换成一个数值，然后根据数组的长度，通过取模操作我们会得到一个固定位置(consistent slot)来设置和获取值。

> 译者注: 这里的 consistent slot 是指，字典的 key，通过这种 Hash 和取模运算，每次都会得到相同的数值，从而确保相同的 key 值，每次取得的 value 总是保持一致性。

我从 `Mike Ash` 的文章 [让我们构建 NSMutableDictionary](https://www.mikeash.com/pyblog/friday-qa-2012-03-16-lets-build-nsmutabledictionary.html)  获取了一些灵感，特别是重新计算数组容量的规则。

让我们开始吧。我们知道 `Key` 和 `Value` 都应该支持泛型，而且 `Key` 必须遵循 `Hashable` 协议。遵循 `Hashable` 协议的也一定同时遵循 `Equatable` 协议。(译者注，`Hashable` 协议继承自 `Equatable` 协议)

    
    struct Dictionary<Key, Value where Key: Hashable> {
        private var storage = //some Array...
        
        subscript(key: Key) -> Value? {
            get {
    	        return nil
            }
            set {
            }
        }
    }

这是我们类型的基本结构。我们知道我们的数组必须是支持泛型的，但是还不知道具体的值是什么。由于两个不同的关键字经过哈希和取模操作后可能会指向数组的同一个位置，这样就会造成冲突，因此每个占位对象需要支持存储多个值。现在让来我们设计 `Placeholder`：

    
    struct Placeholder<Key, Value where Key: Hashable> {
        var values: [(Key, Value)] = []
    }

这个对象存储很多经过哈希和取模操作后指向字典同一位置的键和值。如果我们很好的设计了字典，那么每个 `Placeholder` 包含的键值对将不会超过一个，但是超过一个的情况也会发生。一个比较好的实现是用一个链表来存储 `Placeholder` 的属性 `values`。我将留作一个练习给读者。

现在我们大体知道了 `Placeholder` 是什么样的，接下来我们看看我们的存储器是什么样的。

    
    private var storage = Array(count: 8, repeatedValue: Placeholder<Key, Value>())

初始时我们给数组一个随机的大小。最好选择 2 的整数幂，因为对 2 的幂取模要比其他数更快。除非我们实现如何重新计算数组容量，否则取多大都没有关系。`Array(count:repeatedValue:)` 构造方法使得数组中的每个位置都有一个可以添加值的占位对象。

为了设置字典的值，我们需要对键进行哈希（然后取绝对值，因为哈希有时会返回负值），然后根据数组大小进行取模操作。

    
    set {
        let position = abs(key.hashValue) % storage.count
        //...
    }

在真正给字典添加值之前，我们需要 
a）确保新值(newValue)不为 nil  
b）找到在 `position` 位置的占位对象  
c）将键和值添加到占位对象中。

    
    set {
        guard let value = newValue else { return }
        let position = abs(key.hashValue) % storage.count
        storage[position].values.append((key, value))
    }

这就是基本满足我们需求的设置方法的实现。（我忽略掉了一些小的细节，比如当你试着对同一个键设置两次时会发生什么。我们很快会处理这种情况。）

取值的过程相当简单。对键进行哈希，取绝对值，取模操作，然后我们获取了在那个位置上的占位对象。我将会把从占位对象中获取值的过程交给占位对象自己去做。

    
    get {
        let position = abs(key.hashValue) % storage.count
        return storage[position].firstValue(matchingKey: key)
    }

真正神奇的是在下面这个方法。我们需要找到第一个包含那个键的键值对。在 Swift 3 中我们可以使用 `SequenceType` 协议中的 `first(where:)` 方法来实现，但目前我们使用普通的写法 `lazy.filter( /* block */ ).first` 来获取键值对。

    
    func firstValue(matchingKey key: Key) -> Value? {
        let matchingKeyValuePair = values.lazy.filter({ $0.0 == key }).first
        //...
    }

一旦我们拿到表示键值对的元组，我们就可以直接调用 `.1` 获取对应的值。

    
    func firstValue(matchingKey key: Key) -> Value? {
        return values.lazy.filter({ $0.0 == key }).first?.1
    }

这几乎是 `Dictionary` 的基本实现了。23 行 Swift 代码。所有代码在这个 [gist](https://gist.github.com/khanlou/f01475a2ece9facb8e1cbc97288b4ac8) 中。

还有几个有意思的事情还没有实现。首先，需要有惰性求值的 `generate()`，这样的话 `Dictionary` 就遵循 `SequenceType` 协议了。

> 译者注: 遵循 `SequenceType` 协议之后，就可以使用 `for (key, value) in` 的方式来遍历字典了

    
    extension Dictionary: SequenceType {
        typealias Generator = IndexingGenerator<[(Key, Value)]>
        func generate() -> Dictionary.Generator {
            return storage.flatMap({ $0.values }).generate()
        }
    }

接下来是删除键。首先，从占位对象中删除：

    
    extension Placeholder {
        mutating func removeValue(key key: Key) {
            values = values.filter({ $0.0 != key })
        }
    }

然后从字典中删除

    
    extension Dictionary {
    	mutating func remove(key key: Key) {
    	    let position = abs(key.hashValue) % storage.count
    	    storage[position].removeValue(key: key)
    	}
    }

在设置新值时先调用 `remove(key:)`。这样确保同一个键不会映射到不同的值上。

最后，我们来看看如何重新计算数组容量。当字典包含非常多对象时，它的实际存储结构需要调整自身大小，可以把“非常多对象”看成一个大于2/3或者3/4的负载系数（对象数量除以数组长度）。我选择 0.7。

    
    extension Dictionary {
    	private let maxLoadFactor = 0.7
    	
    	private var size: Int {
    		return storage.count
    	}
    	
    	var count: Int {
    		return storage.flatMap({ $0.values }).count
    	}
    	
    	var currentLoadFactor: Double {
    		return Double(count) / Double(size)
    	}
    }

（`count` 的实现还是懒求值。理想情况下，`Dictionary` 会记录有多少对象被添加和被删除，但实际上很难记录）

    
    mutating func resizeIfNeeded() {
        if currentLoadFactor > maxLoadFactor {
            //resize storage
        }
    }

这就是 Swift 的值语法非常奇怪的地方。`Mike Ash` 在 [构建NSMutableDictionary](https://www.mikeash.com/pyblog/friday-qa-2012-03-16-lets-build-nsmutabledictionary.html) 文章中，创建了一个固定大小的字典，并且把它封装成一个可变大小的字典。当需要调整大小时，他创建一个新的固定大小的字典（大小加倍），然后手动的把所有元素拷贝到新的字典当中。

在 Swift 中我们不必如此。Swift 中的结构体对象赋值给一个变量会进行一次完整拷贝。

    
    let oldDictionary = self
    //...

一旦我们拷贝完字典，我们可以重置 `storage` 变量为原先数组大小的两倍。（大小加倍确保数组大小仍然是2的幂。）

    
    //...
    storage = Array<Placeholder<Key, Value>>(count: size*2, repeatedValue: Placeholder<Key, Value>())
    //...

一旦设置完成，字典会变成空的，我们必须把 `oldDictionary` 的所有值拷贝到当前字典中：

    
    //...
    for (key, value) in oldDictionary {
    	self[key] = value
    }

这是完整的 `resizeIfNeeded` 函数：

    
    mutating func resizeIfNeeded() {
        if Double(count) / Double(size) > maxLoadFactor {
            let oldDictionary = self
            storage = Array<Placeholder<Key, Value>>(count: size*2, repeatedValue: Placeholder<Key, Value>())
            for (key, value) in oldDictionary {
                self[key] = value
            }
        }
    }

在 Swift 的结构体中，`self` 可以访问当前类型的值和函数，但是它也是可变的。你可以对它设置新值，拷贝它，或者就把它当成另一个变量的引用。

[两周前](http://khanlou.com/2016/06/falsiness-in-swift/) 我开玩笑说 Swift 是比 Objective-C ，Ruby 或者 Python 更动态的语言。因为你可以改变它的错误行为，但是这里有另一种情况，即你可以在 Swift 中修改一些在 Objective-C 中不能修改的东西：`self` 本身的引用。我们本可以在该方法中这样写 `self = Dictionary(size: size*2)`，这在 Swift 是绝对有效的。对于那些觉得对象标识是最重要的面向对象开发者而言，这非常奇怪。

包含排序，删除，调整数组大小的完整的实现可以在 [gist](https://gist.github.com/khanlou/9168759b202bf35b461d6091ab062e89) 中找到。除了 `count/generate()` 懒求值的实现，我非常喜欢这个小工程的表达方式。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。