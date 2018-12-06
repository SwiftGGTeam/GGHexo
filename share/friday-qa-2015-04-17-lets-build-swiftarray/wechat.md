让我们构建一个Swift.Array"

> 作者：Mike Ash，[原文链接](https://www.mikeash.com/pyblog/friday-qa-2015-04-17-lets-build-swiftarray.html)，原文日期：2015-04-17
> 译者：[灰s](https://github.com/dzyding)；校对：[numbbbbb](http://numbbbbb.com/)，[Forelax](http://forelax.space)；定稿：[Forelax](http://forelax.space)
  










Swift 1.2 现已经作为 Xcode 6.3 的一部分而发布，在新的 API 中有一个允许我们使用值类型建立高效的数据结构，比如 Swift 标准库中的 `Array` 类型。今天，我们将重新现实 `Array` 的核心功能。



## 值类型和引用类型

在我们开始之前，快速的复习一下值类型和引用类型。在 objc 以及大部分其他面向对象的语言中，我们所使用对象的指针或者引用都属于 **引用类型**。你可以把一个对象的引用赋值给一个变量：

    objc
        MyClass *a = ...;
现在你可以将这个变量的值复制给另一个变量：

    objc
        MyClass *b = a;

现在 a 和 b 都指向同一个对象。如果这个对象是可变的，那么对其中一个变量的改变同样会发生在另一个变量上。

**值类型** 就是类似 Objective-C 中 `int` 这样的存在。使用值类型，变量包含的是真实的值，并不是值的引用。当你用 = 给另一个变量赋值，是将值的拷贝副本赋值给了另一个变量。比如：

    objc
        int a = 42;
        int b = a;
        b++;
现在，b 的值是 43，但是 a 依然是 42。  

在 Swift 中，`class` 属于引用类型，`struct` 属于值类型。  
如果你使用 = 将一个 `class` 实例的引用赋值给另一个变量，你将得到这个实例的一个新引用。对这个实例的修改对每一个引用可见。  
如果你使用 = 将一个 `struct` 实例的引用赋值给另一个变量，你将得到这个实例的一个副本，与原始数据相互独立。  

与大多数语言不同，Swift 标准库中的数组和字典都是值类型。比如：

    
        var a = [1, 2, 3]
        var b = a
        b.append(4)

在大部分语言中，这段代码（或者等效的代码）运行以后， a 和 b 将都是一个指向数组 `[1, 2, 3, 4]` 的引用。但是在 Swift 中，a 是指向数组 `[1, 2, 3]` 的引用，b 是指向数组 `[1, 2, 3, 4]` 的引用。

## 值类型的实现

如果你的对象拥有的属性是固定的，在 Swift 中把它申明成值类型是很简单的：只需要把所有的属性放入一个 `struct` 中即可。比如，如果你需要一个 2D 的 `Point` 值类型，你可以简单的申明一个 `struct` 包含 x 和 y ：

    
        struct Point {
            var x: Int
            var y: Int
        }

很快的，你就申明了一个值类型。但是如何实现类似 `Array` 这样的值类型呢？你无法把数组里面所有数据放入 `struct` 的申明中，因为在写代码的过程中你无法预料你将会在数组中放多少数据。你可以创建一个指针指向所有的数据：

    
        struct Array<T> {
            var ptr: UnsafeMutablePointer<T>
        }

同时，你需要在该 `struct` 每次**分配**和**销毁**的时候进行一些特殊操作。  

- 在分配的过程中，你需要把包含的数据拷贝一份放到一个新的内存地址，这时新的 `struct` 就不会和原数据共享同一份数据了。  
- 在销毁的过程中，`ptr` 指针也需要正常销毁。  

在 Swift 中不允许对 `struct` 的分配和销毁过程进行自定义。

销毁操作可以使用一个 `class` 实现，它提供了 `deinit`。同时可以在这里对指针进行销毁。`class` 并不是值类型，但是我们可以将 `class` 作为一个内部属性提供给 `struct` 使用，并把数组作为 `struct` 暴露给外部接口。看起来就像这样：

    
        class ArrayImpl<T> {
            var ptr: UnsafeMutablePointer<T>
    
            deinit {
                ptr.destroy(...)
                ptr.dealloc(...)
            }
        }
    
        struct Array<T> {
            var impl: ArrayImpl<T>
        }

这时在 `Array` 中申明的方法，它的实际操作都是在 `ArrayImpl` 上进行的。

到这里就可以结束了吗？尽管我们使用的是 `struct`， 但是使用的依旧是引用类型。如果将这个 `struct` 拷贝一份，我们将获得一个新的 `struct`，持有的仍然是之前的 `ArrayImpl`。由于我们无法自定义 `struct` 的分配过程，所以没有办法同样把 `ArrayImpl` 也拷贝一份。  

这个问题的解决方法是放弃在分配的过程中进行拷贝，而是在 `ArrayImpl` 发生改变的时候进行拷贝。关键在于，就算一个拷贝副本与原始数据共享一个引用，但是只要这个引用的数据不发生改变，值类型的语义就依旧成立。只有当这个共享数据的值发生改变时，值类型和引用类型才有了明显的区别。  

比如，在实现 `append` 方法的时候你可以先对 `ArrayImpl` 进行 `copy` (假设 `ArrayImpl` 的实现中有一个 `copy` 方法，那么将 `impl` 引用改为原始值的 `copy`)：  

    
        mutating func append(value: T) {
            impl = impl.copy()
            impl.append(value)
        }

这样 Array 就是一个值类型了。尽管 a 和 b 在刚赋值完时仍然共享同一个 `impl` 引用 ，但是任何会改变 `impl` 的方法都将对其进行一次 `copy`，因此保留了不共享数据的错觉。  

现在可以正常工作了，但是效率却非常低。比如：  

    
        var a: [Int] = []
        for i in 0..<1000 {
            a.append(i)
        }

尽管使用者无法看到它，但是它将在循环的每次迭代中复制内存中的数据，然后立即销毁之前的数据内存。如何才能优化它呢？

## isUniquelyReferenced

这是一个 Swift 1.2 中新引入的 API。它漂亮的实现了它字面上的意思。赋予它一个对象的引用然后它将告诉你这个引用是否为独立的。具体来说，当这个对象有且仅有一个强引用时，就会返回 `true`。  

我们猜测这个 API 会检查对象的引用计数，并且在引用计数为 1 的时候返回 `true` 。那 Swift 为什么不直接提供一个接口来查询引用计数呢？可能在实现上这个接口不太好做，并且引用计数属于比较容易被滥用的信息，所以 Swift 提供了这个封装过的，更加安全的接口。

使用这个 API，之前对 `append` 方法的实现将可以改成只有在需要的时候才对内存中的数据进行复制: 

    
        mutating func append(value: T) {
            if !isUniquelyReferencedNonObjc(&impl) {
                impl = impl.copy()
            }
            impl.append(value)
        } 

这个 API 实际上是一组三个方法中的一个。存在于 Xcode 自带的 Swift 标准库中:  

    
        func isUniquelyReferenced<T : NonObjectiveCBase>(inout object: T) -> Bool
        func isUniquelyReferencedNonObjC<T>(inout object: T?) -> Bool
        func isUniquelyReferencedNonObjC<T>(inout object: T) -> Bool

这些方法只能作用在纯 Swift class 中，并不支持 @objc 类型。第一个方法必须确保 T 为 `NonObjectiveCBase` 的子类。另外两个方法对参数的类型并不做要求，只是当类型为 @objc 时直接返回 false。  

我无法让我的代码以 `NonObjectiveCBase` 类型来编译，所以使用了 `isUniquelyReferencedNonObjC` 来代替。从功能上来说，它们并没有区别。  

> 译者注：
> 文章中所阐述的 `isUniquelyReferencedNonObjC` API 已经在 Swift 3.1 的时候被替换为 `isKnownUniquelyReferenced`
> 详情可以参考 swift-evolution 中的这条 [建议](https://github.com/apple/swift-evolution/blob/master/proposals/0125-remove-nonobjectivecbase.md)

## ArrayImpl

让我们开始实现 Swift.Array，首先从 `ArrayImpl` 开始，然后才是 `Array`。  

在这里我并不会重新实现 `Array` 完整的 API，只是实现满足其正常运行的基本功能，并展示它涉及的原理。  

`ArrayImpl` 有三个属性：指针，数组元素的总数，以及已申请内存空间中的剩余容量。只有指针和元素的总数是必须的，但是相比申请更多的内存空间，实时监控剩余容量并按需申请，我们可以避免一大笔昂贵的内存重新分配。下面是类开始的部分：

    
        class ArrayImpl<T> {
            var space: Int
            var count: Int
            var ptr: UnsafeMutablePointer<T>
在 `init` 方法中需要一个计数和一个指针，然后将指针所指向的内容复制到新的对象。方法提供了默认值 0 和 nil ，所以 `init` 可以在不传入任何参数的情况下被用来创建一个拥有空数组的实例：  

    
            init(count: Int = 0, ptr: UnsafeMutablePointer<T> = nil) {
                self.count = count
                self.space = count
                
                self.ptr = UnsafeMutablePointer<T>.alloc(count)
                self.ptr.initializeFrom(ptr, count: count)
            }  

`initializeFrom` 方法可以将数据复制到新的指针。注意区分 `UnsafeMutablePointer` 处于不同赋值方式之间的不同，这对于确保它们正常工作以及避免崩溃十分重要。不同之处在于数据内存是否被处理为初始化或未初始化。在调用 `alloc` 时，生成的指针处于未初始化的状态，并且可能被垃圾数据填满。一个简单的赋值，例如 `ptr.memory = ...` ，此时是不合法的，因为赋值操作将会在复制新的值之前析构已经存在的值。如果是类似 `int` 这样的基础数据类型将没什么问题，但是如果你操作的是一个复杂数据类型它将崩溃。在这里 `initializeFrom` 将目标指针视为未初始化的内存，而这正是它的本质。  

接下来是一个改变过的 `append` 方法。它做的第一件事是检查指针是否需要重新分配。如果没有剩余的空间可用，我们需要一块新的内存：

    
            func append(obj: T) {
                if space == count {
                    // 在新的内存分配中，我们将申请两倍的容量，并且最小值为 16 :
                    let newSpace = max(space * 2, 16)
                    let newPtr = UnsafeMutablePointer<T>.alloc(newSpace)
                    // 从旧的内存中将数据拷贝到新的地址
                    newPtr.moveInitializeFrom(ptr, count: count)
                    /*
                    这是另一种赋值，它不仅把目的指针看做是未初始化的，并且会把数据源销毁。  
                    它节省了我们单独写代码来销毁旧内存的操作，同时可能更加高效。  
                    随着数据的移动完成，旧指针将可以被释放，新的数据将被赋值给类的属性：
                    */
                    ptr.dealloc(space)
                    ptr = newPtr
                    space = newSpace
                }
                // 现在我们确信有足够的空间，所以可以把新的值放在内存的最后面并且递增 count 属性的值:
                (ptr + count).initialize(obj)
                count++
            }
改变过的 `remove` 方法将更为简洁，因为没有必要重新分配内存。首先，他将在移除一个值之前先将其销毁：  

> 译者注：
> 这里的 # 号不用理会，在早期的 Swift 版本中它表示内外参数同名）**

    
            func remove(# index: Int) {
                (ptr + index).destroy()
                // moveInitializeFrom 方法负责将所有在被移除元素之后的元素往前挪一个位置
                (ptr + index).moveInitializeFrom(ptr + index + 1, count: count - index - 1)
                // 递减 count 属性的值来体现这次删除操作
                count--
            }

我们同样需要一个 `copy` 方法来确保当需要的时候可以从数据内存中复制一份。实际关于复制的代码存在于 `init` 方法中，所以我们只需要创建一个实例也就相当于执行了一次复制：

    
            func copy() -> ArrayImpl<T> {
                return ArrayImpl<T>(count: count, ptr: ptr)
            }

这样，我们就基本上完成了所有的事情。我们只需要确保在它自己将要被销毁，调用 `deinit` 方法之后销毁所有数组中的元素并释放指针：

    
            deinit {
                ptr.destroy(count)
                ptr.dealloc(space)
            }
        }

让我们把它移到 `Array struct`。它唯一的属性就是一个 `ArrayImpl`。

    
        struct Array<T>: SequenceType {
            var impl: ArrayImpl<T> = ArrayImpl<T>()
所有 `mutating` 类型的方法都将以检查 `impl` 是不是独立的引用为开始，并在不是的时候进行复制操作。将把它封装成一个函数提供给其他的方法使用：

    
            mutating func ensureUnique() {
                if !isUniquelyReferencedNonObjC(&impl) {
                    impl = impl.copy()
                }
            }

`append` 方法现在只调用了 `ensureUnique` 方法，然后调用 `ArrayImpl` 的 `append` 方法：

    
            mutating func append(value: T) {
                ensureUnique()
                impl.append(value)
            }

`remove` 方法也是一样：

    
            mutating func remove(# index: Int) {
                ensureUnique()
                impl.remove(index: index)
            }

`count` 属性直接通过 `ArrayImpl's` 来返回：

    
            var count: Int {
                return impl.count
            }

下标操作直接通过底层指针来进行访问。如果我们是在写真实的代码，在这里我们会需要进行一个范围的检查（`remove` 方法中也是），但是在这个例子中我们将它省略了：

    
            subscript(index: Int) -> T {
                get {
                    return impl.ptr[index]
                }
                mutating set {
                    ensureUnique()
                    impl.ptr[index] = newValue
                }
            }

最后，`Array` 遵循 `SequenceType` 协议以支持 `for in` 循环。其必须实现 `Generator typealias` 和 `generate` 方法。内置的 `GeneratorOf` 类型使其很容易实现。`GeneratorOf` 使用一个代码块确保在其每次被访问的时候返回集合中的下一个元素，或者当到达结尾的时候返回 `nil`，并创造一个 `GeneratorType` 来封装该代码块：  

    
            typealias Generator = GeneratorOf<T>

`generate` 方法从 0 开始递增直到运行至结尾，然后开始返回 `nil`：

    
            func generate() -> Generator {
                var index = 0
                return GeneratorOf<T>({
                    if index < self.count {
                        return self[index++]
                    } else {
                        return nil
                    }
                })
            }
        }

这就是它的全部！

## Array

我们的 `Array` 是一个符合 `CollectionType` 协议的通用 `struct`：

    
        struct Array<T>: CollectionType {

它唯一拥有的属性是一个底层 `ArrayImpl` 的引用：

    
            private var impl: ArrayImpl<T> = ArrayImpl<T>()

任何一个方法如果会改变这个数组必须先检查这个 `impl` 是否为一个独立的引用，并在它不是的时候进行复制。这个功能被封装成一个私有的方法提供给其他的方法使用：

    
            private mutating func ensureUnique() {
                if !isUniquelyReferencedNonObjC(&impl) {
                    impl = impl.copy()
                }
            }

`append` 方法会使用 `ensureUnique` 然后调用 `impl` 中的 `append`：

    
            mutating func append(value: T) {
                ensureUnique()
                impl.append(value)
            }

`remove` 的实现基本是相同的：

    
            mutating func remove(# index: Int) {
                ensureUnique()
                impl.remove(index: index)
            }

`count` 属性是一个计算性属性，它将直接通过 `impl` 来调用：

    
            var count: Int {
                return impl.count
            }

下标操作将直接通过 `impl` 来修改底层的数据存储。通常这种直接从类的外部进行访问的方式是一个坏主意，但是 `Array` 和 `ArrayImpl` 联系的太过紧密，所以看起来并不是很糟糕。`subscript` 中 `set` 的部分会改变数组，所以需要使用 `ensureUnique` 来保持值语义：

    
            subscript(index: Int) -> T {
                get {
                    return impl.ptr[index]
                }
                mutating set {
                    ensureUnique()
                    impl.ptr[index] = newValue
                }
            }

`CollectionType` 协议需要一个 `Index typealias`。对于 `Array` 来说，这个索引类型就是 `Int`：

    
        typealias Index = Int

它同时也需要一些属性来提供一个开始和结束的索引。对于 `Array` 俩说，开始的索引为 0 ，结束的索引就是数组中元素的个数：

    
            var startIndex: Index {
                return 0
            }
        
            var endIndex: Index {
                return count
            }

`CollectionType` 协议包含 `SequenceType` 协议，它使得对象可以被用于 `for/in` 循环。它的工作原理是让序列提供一个生成器，该生成器是一个可以返回序列中连续元素的对象。生成器的类型由采用协议的类型来定义。`Array` 中采用的是 `GeneratorOf`，它是一个简单的封装用来支持使用一个闭包创建生成器：

    
            typealias Generator = GeneratorOf<T>

`generate` 方法将会返回一个生成器。它使用 `GeneratorOf` 并且提供一个闭包来递增下标，直到下标到达数组的结尾。通过在闭包的外面声明一个 `index`，使它在调用中被捕获，并且它的值持续存在：

    
            func generate() -> Generator {
                var index = 0
                return GeneratorOf<T>{
                    if index < self.count {
                        return self[index++]
                    } else {
                        return nil
                    }
                }
            }
        }

这样就完成了 `Array` 的实现。

## 完整的实现和测试代码

这里提供了完整的实现，附加一些测试来确保所有的这些正常运行，我放在了 GitHub 上面：  

[https://gist.github.com/mikeash/63a791f2aec3318c7c5c](https://gist.github.com/mikeash/63a791f2aec3318c7c5c)

## 结语

在 Swift 1.2 中添加的 `isUniquelyReferenced` 是一个广受好评的改变，它让我们可以实现很多真正有趣的值类型，包括对标准库中值类型集合的复制。  

今天就到这里。下次再来找乐趣，功能，以及有趣的功能。如果你有感兴趣的主题，请发给我们！邮箱地址：mike@mikeash.com。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。