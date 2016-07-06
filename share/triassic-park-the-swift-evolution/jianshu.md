三叠纪公园：Swift 的进化史"

> 作者：Natasha The Robot，[原文链接](http://ericasadun.com/2016/04/15/triassic-park-the-swift-evolution/)，原文日期：2016-04-15
> 译者：[Cee](https://github.com/Cee)；校对：[Channe](undefined)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  










# 三叠纪公园：Swift 的进化史

### 最新被接受的

[SE-0048](https://github.com/apple/swift-evolution/blob/master/proposals/0048-generic-typealias.md)：**泛型别名**在定义中引进了类型的参数，例如：

    
    typealias StringDictionary<T> = Dictionary<String, T>
    typealias DictionaryOfStrings<T : Hashable> = Dictionary<T, String>
    typealias IntFunction<T> = (T) -> Int
    typealias Vec3<T> = (T, T, T)
    typealias BackwardTriple<T1,T2,T3> = (T3, T2, T1)

为类型重新声明别名时有一些限制条件。例如在存放字符串的词典中，主键必须实现 hashable 协议才能够使用。Swift 的编译器会在不满足限制条件时提供一些反馈：

    
    typealias DictionaryOfStrings<T> = Dictionary<T, String>
    // error: type 'T' does not conform to protocol 'Hashable'

干得漂亮。



[SE-0049](https://github.com/apple/swift-evolution/blob/master/proposals/0049-noescape-autoclosure-type-attrs.md)：**将 @noescape 和 @autoclosure 关键字作为类型属性**，这也遵循了之前的一个[提议](https://github.com/apple/swift-evolution/blob/master/proposals/0049-noescape-autoclosure-type-attrs.md)，把描述类型特征的东西变成类型的一部分。

    
    func f(fn : @noescape () -> ()) {}     // 类型属性
    func f2(a : @autoclosure () -> ()) {}  // 类型属性

[SE-0036](https://github.com/apple/swift-evolution/blob/master/proposals/0036-enum-dot.md)：**为枚举实例中的成员命名前部添加点（`.`）标记**，这使得之前可以不通过点表示法访问枚举判断的例外情况成为了不可能。也就统一了实例访问静态成员变量的方式。

[SE-0062](https://github.com/apple/swift-evolution/blob/master/proposals/0062-objc-keypaths.md)：**使用 Objective-C 中的键值路径**，通过编译器检查键值路径表达式的合法性来提高了代码（对于 KVC 和 KVO 来说）的安全性和可靠性。新的 `#keyPath()` 表达式能够在编译时扩展为一个键值路径的字符串常量，编译器就可以检查它的合法性了。

>  `#keyPath` 表达式相比于 Objective-C 形式的 key-path 字符串，程序员不再需要手动输入并检查暴露给 Objective-C 的键值路径。

[SE-0064](https://github.com/apple/swift-evolution/blob/master/proposals/0064-property-selectors.md)：**使用 Objective-C 中 selector 来获取属性的 getter 和 setter 方法**，这基于 [SE-0022](https://github.com/apple/swift-evolution/blob/master/proposals/0022-objc-selectors.md) 进行了扩展，为 `#selector` 表达式扩展了对属性方法的支持。 

    
    let firstNameGetter = #selector(getter: Person.firstName)
    let firstNameSetter = #selector(setter: Person.firstName)

[SE-0057](https://github.com/apple/swift-evolution/blob/master/proposals/0057-importing-objc-generics.md)：**引入 Objective-C 中的轻量级泛型**，这使得在 Swift 中使用 ObjC 中新的参数类型（译者注：比如 `MySet<NSValue *> *`）成为了可能。

> Cocoa 和 Cocoa Touch 为了提高静态类型安全和可读性，包含了大量的 Objective-C 轻量级泛型参数的 API。然而在由于类型参数在导入到 Swift 中会丢失，事实上在 Swift 中这么做会没有 Objective-C 中*那么*安全

这个提议让 ObjC 类中参数类型的工作方式类似于 Swift 的泛型语法。

[SE-0063](https://github.com/apple/swift-evolution/blob/master/proposals/0063-swiftpm-system-module-search-paths.md)：**Swift 包管理器系统模块搜索路径**让 Swift 能够更好地支持除了 /usr/lib 和 /usr/local/lib 外 C 函数库的引用。它为 brew 和 apt-get 提供了支持，并且引入了 `pkgConfigName` 入口，使得编译器能够在 Swift 包管理器中 `.pc` 文件外搜寻其他路径。

### 推迟的

[SE-0058](https://github.com/apple/swift-evolution/blob/master/proposals/0058-objectivecbridgeable.md)，**允许 Swift 类型提供自定义的 Objective-C 表现形式**被[推迟](http://article.gmane.org/gmane.comp.lang.swift.evolution/14419)到 Swift 3 之后。这个提案提出了一个`ObjectiveCBridgeable`协议，允许 Swift 类型转换成一个独立的 `@objc` 类型，从而控制其在 Objective-C 中的表现形式。这可以让库作者开发真正原生的 Swift API，同时让它支持 Objective-C：

> 确实，允许库作者把自己的类型（像 Foundation 那样）从 Objective-C 桥接到 Swift 非常重要。然而，目前我们没有信心把 `_ObjectiveCBridgeable` 开放出来。在当前阶段，就像协议名暗示的那样，这个协议的目的是把 Objective-C 对象类型桥接到 Swift。未来我们想实现其他平台的桥接，包括 C++ 值类型和其他对象系统，比如 COM、GObject、JVM 和 CLR。目前还没有确定具体的实现方式，可能是扩展现有机制，可能是针对每种类型创建新协议。这个领域还需要探索，所以目前还无法开放这个 API。

### 正在进行审核的

- 16/3/31 - 16/4/5：[SE-0056：允许在 `guard` 中使用尾闭包](https://github.com/apple/swift-evolution/blob/master/proposals/0056-trailing-closures-in-guard.md)
- 16/3/31 - 16/4/5：[SE-0059：更新 API 命名规范，对应重写 set 接口](https://github.com/apple/swift-evolution/blob/master/proposals/0059-updated-set-apis.md)（可以参见[之前的文章](http://ericasadun.com/2016/04/13/stop-the-madness-and-fix-the-swift-api-guidelines/)）
- 16/4/7 - 16/4/13：[SE-0063：Swift 包管理器系统模块搜索路径](https://github.com/apple/swift-evolution/blob/master/proposals/0063-swiftpm-system-module-search-paths.md)
- 16/4/10 - 16/4/18：[SE-0065：为集合和下标打造的新模型](https://github.com/apple/swift-evolution/blob/master/proposals/0065-collections-move-indices.md)

### 等待审核的

- [SE-0012：为公共库 API 添加 `@noescape`](https://github.com/apple/swift-evolution/blob/master/proposals/0012-add-noescape-to-public-library-api.md)
- [SE-0017：使用 `UnsafePointer` 替代 `Unmanaged`](https://github.com/apple/swift-evolution/blob/master/proposals/0017-convert-unmanaged-to-use-unsafepointer.md)
- [SE-0025：限制访问权限](https://github.com/apple/swift-evolution/blob/master/proposals/0025-scoped-access-level.md)
- [SE-0032：为 `SequenceType` 增加 `find` 方法](https://github.com/apple/swift-evolution/blob/master/proposals/0032-sequencetype-find.md)
- [SE-0041：为转换更新协议命名约定](https://github.com/apple/swift-evolution/blob/master/proposals/0041-conversion-protocol-conventions.md)
- [SE-0030：属性行为](https://github.com/apple/swift-evolution/blob/master/proposals/0030-property-behavior-decls.md)
- [SE-0045：为 stdlib 增加 scan、takeWhile、dropWhile 和 iterate](https://github.com/apple/swift-evolution/blob/master/proposals/0045-scan-takewhile-dropwhile.md) （整个 SE-0045 所**聚焦的内容**在[这](http://ericasadun.com/2016/04/12/proposal-spotlight-se-0045-add-scan-takewhile-dropwhile-and-iterate-to-the-stdlib/)。）
- [SE-0052：改变在 IteratorType 内的 post-nil 保证](https://github.com/apple/swift-evolution/blob/master/proposals/0052-iterator-post-nil-guarantee.md)
- [SE-0060：强制使用参数的默认顺序](https://github.com/apple/swift-evolution/blob/master/proposals/0060-defaulted-parameter-order.md)
- [SE-0061：为 autoreleasepool() 添加泛型结果和错误处理](https://github.com/apple/swift-evolution/blob/master/proposals/0061-autoreleasepool-signature.md)
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。