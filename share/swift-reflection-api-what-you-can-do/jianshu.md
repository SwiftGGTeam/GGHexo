Swift 反射 API 及用法"

> 作者：Benedikt Terhechte，[原文链接](http://appventure.me/2015/10/24/swift-reflection-api-what-you-can-do/)，原文日期：2015-10-24
> 译者：[mmoaay](http://www.jianshu.com/u/2d46948e84e3)；校对：[千叶知风](http://weibo.com/xiaoxxiao)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  









尽管 Swift 一直在强调强类型、编译时安全和静态调度，但它的标准库仍然提供了反射机制。可能你已经在很多博客文章或者类似[Tuples](http://design.featherless.software/enumerating-tuple-values-swift/?utm_campaign=Swift%252BSandbox&utm_medium=email&utm_source=Swift_Sandbox_12)、[Midi Packets](http://design.featherless.software/enumerate-messages-midipacket-swift-reflection/) 和 [Core Data](https://github.com/terhechte/corevalue) 的项目中见过它。也许你刚好对在项目中使用反射机制感兴趣，或者你想更好的了解反射可以应用的领域，那这篇文章就正是你需要的。文章的内容是基于我在德国法兰克福 Macoun会议上的一次演讲，它对 Swift 的反射 API 做了一个概述。



# API 概述

理解这个主题最好的方式就是看 API，看它都提供了什么功能。

## `Mirror`

Swift 的反射机制是基于一个叫 **Mirror** 的 `struct` 来实现的。你为具体的 `subject` 创建一个 `Mirror`，然后就可以通过它查询这个对象 `subject` 。

在我们创建 `Mirror` 之前，我们先创建一个可以让我们当做对象来使用的简单数据结构。

    
    import Foundation.NSURL // [译者注]此处应该为import Foundation
    
    public class Store {
        let storesToDisk: Bool = true
    }
    public class BookmarkStore: Store {
        let itemCount: Int = 10
    }
    public struct Bookmark {
       enum Group {
          case Tech
          case News
       }
       private let store = {
           return BookmarkStore()
       }()
       let title: String?
       let url: NSURL
       let keywords: [String]
       let group: Group
    }
    
    let aBookmark = Bookmark(title: "Appventure", url: NSURL(string: "appventure.me")!, keywords: ["Swift", "iOS", "OSX"], group: .Tech)

## 创建一个 `Mirror` 

创建 `Mirror` 最简单的方式就是使用 `reflecting` 构造器：

    
    public init(reflecting subject: Any)

然后在 `aBookmark` `struct` 上使用它：

    
    let aMirror = Mirror(reflecting: aBookmark)
    print(aMirror)
    // 输出 : Mirror for Bookmark

这段代码创建了 `Bookmark 的 Mirror`。正如你所见，对象的类型是 `Any`。这是 Swift 中最通用的类型。Swift 中的任何东西至少都是 `Any` 类型的[1](#1)。这样一来 `mirror` 就可以兼容 `struct`, `class`, `enum`, `Tuple`, `Array`, `Dictionary`, `set` 等。

`Mirror` 结构体还有另外三个构造器，然而这三个都是在你需要自定义 `mirror` 这种情况下使用的。我们会在接下来[讨论自定义 `mirror` 时详细讲解这些额外的构造器](#custom_mirrors)。

## `Mirror` 中都有什么？

`Mirror struct` 中包含几个 `types` 来帮助确定你想查询的信息。

第一个是 `DisplayStyle` `enum`，它会告诉你对象的类型：

    
    public enum DisplayStyle {
        case Struct
        case Class
        case Enum
        case Tuple
        case Optional
        case Collection
        case Dictionary
        case Set
    }

这些都是反射 API 的辅助类型。正如之前我们知道的，反射只要求对象是 `Any` 类型，而且Swift 标准库中还有很多类型为 `Any` 的东西没有被列举在上面的 `DisplayStyle` `enum` 中。如果试图反射它们中间的某一个又会发生什么呢？比如 `closure`。

    
    let closure = { (a: Int) -> Int in return a * 2 }
    let aMirror = Mirror(reflecting: closure)

在这种情况下，这里你会得到一个 `mirror`，但是 `DisplayStyle` 为 `nil` [2](#2)

也有提供给 `Mirror` 的子节点使用的 `typealias`：

    
    public typealias Child = (label: String?, value: Any)

所以每个 `Child` 都包含一个可选的 `label` 和 `Any` 类型的 `value`。为什么 `label` 是 `Optional` 的？如果你仔细考虑下，其实这是非常有意义的，并不是所有支持反射的数据结构都包含有名字的子节点。 `struct` 会以属性的名字做为 `label`，但是 `Collection` 只有下标，没有名字。`Tuple` 同样也可能没有给它们的条目指定名字。

接下来是 `AncestorRepresentation` `enum` [3](#3)：

    
    public enum AncestorRepresentation {
        /// 为所有 ancestor class 生成默认 mirror。
        case Generated
        /// 使用最近的 ancestor 的 customMirror() 实现来给它创建一个 mirror。    
        case Customized(() -> Mirror)
        /// 禁用所有 ancestor class 的行为。Mirror 的 superclassMirror() 返回值为 nil。
        case Suppressed
    }

这个 `enum` 用来定义被反射的对象的父类应该如何被反射。也就是说，这只应用于 `class` 类型的对象。默认情况（正如你所见）下 Swift 会为每个父类生成额外的 `mirror`。然而，如果你需要做更复杂的操作，你可以使用 `AncestorRepresentation enum` 来定义父类被反射的细节。[我们会在下面的内容中进一步研究这个](#custom_mirrors)。

## 如何使用一个 `Mirror`

现在我们有了给 `Bookmark` 类型的对象`aBookmark` 做反射的实例变量 `aMirror`。可以用它来做什么呢？

下面列举了 `Mirror` 可用的属性 / 方法：

 - `let children: Children`：对象的子节点。
 - `displayStyle: Mirror.DisplayStyle?`：对象的展示风格
 - `let subjectType: Any.Type`：对象的类型
 - `func superclassMirror() -> Mirror?`：对象父类的 `mirror`

下面我们会分别对它们进行解析。

### `displayStyle`

很简单，它会返回 `DisplayStyle` `enum` 的其中一种情况。如果你想要对某种不支持的类型进行反射，你会得到一个空的 `Optional` 值（这个之前解释过）。

    
    print (aMirror.displayStyle)
    // 输出: Optional(Swift.Mirror.DisplayStyle.Struct)
    // [译者注]此处输出：Optional(Struct)

### `children`

这会返回一个包含了对象所有的子节点的 `AnyForwardCollection<Child>`。这些子节点不单单限于 `Array` 或者 `Dictionary` 中的条目。诸如 `struct` 或者 `class` 中所有的属性也是由 `AnyForwardCollection<Child>` 这个属性返回的子节点。`AnyForwardCollection` 协议意味着这是一个支持遍历的 `Collection` 类型。

    
    for case let (label?, value) in aMirror.children {
        print (label, value)
    }
    //输出:
    //: store main.BookmarkStore
    //: title Optional("Appventure")
    //: url appventure.me
    //: keywords ["Swift", "iOS", "OSX"]
    //: group Tech

### `SubjectType`

这是对象的类型：

    
    print(aMirror.subjectType)
    //输出 : Bookmark
    print(Mirror(reflecting: 5).subjectType)
    //输出 : Int
    print(Mirror(reflecting: "test").subjectType)
    //输出 : String
    print(Mirror(reflecting: NSNull()).subjectType)
    //输出 : NSNull

然而，Swift 的文档中有下面一句话：

> "当 `self` 是另外一个 `mirror` 的 `superclassMirror()` 时，这个类型和对象的动态类型可能会不一样。"

### `SuperclassMirror`

这是我们对象父类的 `mirror`。如果这个对象不是一个类，它会是一个空的 `Optional` 值。如果对象的类型是基于类的，你会得到一个新的 `Mirror`：

    
    // 试试 struct
    print(Mirror(reflecting: aBookmark).superclassMirror())
    // 输出: nil
    // 试试 class
    print(Mirror(reflecting: aBookmark.store).superclassMirror())
    // 输出: Optional(Mirror for Store)

# 实例

## `Struct` 转 `Core Data`

假设我们在一个叫 **Books Bunny** 的新兴高科技公司工作，我们以浏览器插件的方式提供了一个人工智能，它可以自动分析用户访问的所有网站，然后把相关页面自动保存到书签中。

现在是 2016 年，Swift 已经开源，所以我们的后台服务端肯定是用 Swift 编写。因为在我们的系统中同时有数以百万计的网站访问活动，我们想用 `struct` 来存储用户访问网站的分析数据。不过，如果我们 AI 认定某个页面的数据是需要保存到书签中的话，我们需要使用 `CoreData` 来把这个类型的对象保存到数据库中。

现在我们不想为每个新建的 `struct` 单独写自定义的 `Core Data` 序列化代码。而是想以一种更优雅的方式来开发，从而可以让将来的所有 `struct` 都可以利用这种方式来做序列化。

那么我们该怎么做呢？

## 一个协议

记住，我们有一个 `struct`，它需要自动转换为 `NSManagedObject` （**Core Data**）。

如果我们想要支持不同的 `struct` 甚至类型，我们可以用协议来实现，然后确保我们需要的类型符合这个协议。所以我们假想的协议应该有哪些功能呢？

 - 第一，协议应该允许自定义我们想要创建的**Core Data 实体**的名字
 - 第二，协议需要提供一种方式来告诉它如何转换为 `NSManagedObject`。

我们的 `protocol`（协议） 看起来是下面这个样子的：

    
    protocol StructDecoder {
        // 我们 Core Data 实体的名字
        static var EntityName: String { get }
        // 返回包含我们属性集的 NSManagedObject
        func toCoreData(context: NSManagedObjectContext) throws -> NSManagedObject //[译者注]使用 NSManagedObjectContext 需要 import CoreData
    }

`toCoreData` 方法使用了 Swift 2.0 新的异常处理来抛出错误，如果转换失败，会有几种错误情况，这些情况都在下面的 `ErrorType` `enum` 进行了列举：

    
    enum SerializationError: ErrorType {
        // 我们只支持 struct
        case StructRequired
        // 实体在 Core Data 模型中不存在
        case UnknownEntity(name: String)
        // 给定的类型不能保存在 core data 中
        case UnsupportedSubType(label: String?)
    }

上面列举了三种转换时需要注意的错误情况。第一种情况是我们试图把它应用到非 `struct` 的对象上。第二种情况是我们想要创建的 `entity` 在 Core Data 模型中不存在。第三种情况是我们想要把一些不能存储在 Core Data 中的东西保存到 Core Data 中（即 `enum`）。

让我们创建一个 `struct` 然后为其增加协议一致性：

## `Bookmark struct`

    
    struct Bookmark {
       let title: String
       let url: NSURL
       let pagerank: Int
       let created: NSDate
    }

接下来，我们要实现 `toCoreData` 方法。

## 协议扩展

当然我们可以为每个 `struct` 都写新的 `toCoreData` 方法，但是工作量很大，因为 `struct` 不支持继承，所以我们不能使用基类的方式。不过我们可以使用 `protocol extension` 来扩展这个方法到所有相符合的 `struct`：

    
    extension StructDecoder {
        func toCoreData(context: NSManagedObjectContext) throws -> NSManagedObject {
        }
    }

因为扩展已经被应用到相符合的 `struct`，这个方法就可以在 `struct` 的上下文中被调用。因此，在协议中，`self` 指的是我们想分析的 `struct`。

所以，我们需要做的第一步就是创建一个可以写入我们 `Bookmark struct` 值的`NSManagedObject`。我们该怎么做呢？

## 一点 `Core Data`

`Core Data` 有点啰嗦，所以如果需要创建一个对象，我们需要如下的步骤：

 1. 获得我们需要创建的实体的名字（字符串）
 2. 获取 `NSManagedObjectContext`，然后为我们的实体创建 `NSEntityDescription`
 3. 利用这些信息创建 `NSManagedObject`。

实现代码如下：

    
    // 获取 Core Data 实体的名字
    let entityName = self.dynamicType.EntityName
    
    // 创建实体描述
    // 实体可能不存在, 所以我们使用 'guard let' 来判断，如果实体
    // 在我们的 core data 模型中不存在的话，我们就抛出错误 
    guard let desc = NSEntityDescription.entityForName(entityName, inManagedObjectContext: context)
        else { throw UnknownEntity(name: entityName) } // [译者注] UnknownEntity 为 SerializationError.UnknownEntity
    
    // 创建 NSManagedObject
    let managedObject = NSManagedObject(entity: desc, insertIntoManagedObjectContext: context)

## 实现反射

下一步，我们想使用反射 API 来读取 `bookmark` 对象的属性然后把它写入到 `NSManagedObject` 实例中。

    
    // 创建 Mirror
    let mirror = Mirror(reflecting: self)
    
    // 确保我们是在分析一个 struct
    guard mirror.displayStyle == .Struct else { throw SerializationError.StructRequired }

我们通过测试 `displayStyle` 属性的方式来确保这是一个 `struct`。

所以现在我们有了一个可以让我们读取属性的 `Mirror`，也有了一个可以用来设置属性的 `NSManagedObject`。因为 `mirror` 提供了读取所有 `children` 的方式，所以我们可以遍历它们并保存它们的值。方式如下：

    
    for case let (label?, value) in mirror.children {
        managedObject.setValue(value, forKey: label)
    }

太棒了！但是，如果我们试图编译它，它会失败。原因是 `setValueForKey` 需要一个 `AnyObject?` 类型的对象，而我们的 `children` 属性只返回一个 `(String?, Any)` 类型的 `tuple`。也就是说 `value` 是 `Any` 类型但是我们需要 `AnyObject` 类型的。为了解决这个问题，我们要测试 `value` 的  `AnyObject` 协议一致性。这也意味着如果得到的属性的类型不符合 `AnyObject` 协议（比如 `enum`)，我们就可以抛出一个错误。

    
    let mirror = Mirror(reflecting: self)
    
    guard mirror.displayStyle == .Struct 
      else { throw SerializationError.StructRequired }
    
    for case let (label?, anyValue) in mirror.children {
        if let value = anyValue as? AnyObject {
    	managedObject.setValue(child, forKey: label) // [译者注] 正确代码为：managedObject.setValue(value, forKey: label)
        } else {
    	throw SerializationError.UnsupportedSubType(label: label)
        }
    }

现在，只有在 `child` 是 `AnyObject` 类型的时候我们才会调用 `setValueForKey` 方法。

然后唯一剩下的事情就是返回 `NSManagedObject`。完整的代码如下：

    
    extension StructDecoder {
        func toCoreData(context: NSManagedObjectContext) throws -> NSManagedObject {
    	let entityName = self.dynamicType.EntityName
    
    	// 创建实体描述
    	guard let desc = NSEntityDescription.entityForName(entityName, inManagedObjectContext: context)
    	    else { throw UnknownEntity(name: entityName) } // [译者注] UnknownEntity 为 SerializationError.UnknownEntity
    
    	// 创建 NSManagedObject
    	let managedObject = NSManagedObject(entity: desc, insertIntoManagedObjectContext: context)
    
    	// 创建一个 Mirror
    	let mirror = Mirror(reflecting: self)
    
    	// 确保我们是在分析一个 struct
    	guard mirror.displayStyle == .Struct else { throw SerializationError.StructRequired }
    
    	for case let (label?, anyValue) in mirror.children {
    	    if let value = anyValue as? AnyObject {
    		managedObject.setValue(child, forKey: label) // [译者注] 正确代码为：managedObject.setValue(value, forKey: label)
    	    } else {
    		throw SerializationError.UnsupportedSubType(label: label)
    	    }
    	}
    
    	return managedObject
        }
    }

搞定，我们现在已经把 `struct` 转换为 `NSManagedObject` 了。

# 性能

那么，速度如何呢？这个方法可以在生产中应用么？我做了一些测试：

    
    创建 2000 个 NSManagedObject
    原生: 0.062 seconds
    反射: 0.207 seconds

这里的原生是指创建一个 `NSManagedObject`，然后通过 `setValueForKey` 设置属性值。如果你在 `Core Data` 内创建一个 `NSManagedObject` 子类然后把值直接设置到属性上（没有了动态 `setValueForKey` 的开销），速度可能更快。

所以正如你所见，使用反射使创建 `NSManagedObject` 的性能下降了**3.5倍**。当你在数量有限的项目上使用这个方法，或者你不关心处理速度时，这是没问题的。但是当你需要反射大量的 `struct` 时，这个方法可能会大大降低你 app 的性能。

<a name="custom_mirrors">
# 自定义 `Mirror`

我们之前已经讨论过，创建 `Mirror` 还有其他的选项。这些选项是非常有用的，比如，你想自己定义 `mirror` 中**对象**的哪些部分是可访问的。对于这种情况 `Mirror Struct` 提供了其他的构造器。

## `Collection` 

第一个特殊 `init` 是为 `Collection` 量身定做的：

    
    public init<T, C : CollectionType where C.Generator.Element == Child>
      (_ subject: T, children: C, 
       displayStyle: Mirror.DisplayStyle? = default, 
       ancestorRepresentation: Mirror.AncestorRepresentation = default)

与之前的 `init(reflecting:)` 相比，这个构造器允许我们定义更多反射处理的细节。

 - 它只对 `Collection` 有效
 - 我们可以设定被反射的对象**以及**对象的 `children` （`Collection` 的内容）

## `class` 或者 `struct`

第二个可以在 `class` 或者 `struct` 上使用。

    
    public init<T>(_ subject: T, 
      children: DictionaryLiteral<String, Any>, 
      displayStyle: Mirror.DisplayStyle? = default, 
      ancestorRepresentation: Mirror.AncestorRepresentation = default)

有意思的是，这里是由你指定对象的 `children` （即属性），指定的方式是通过一个 `DictionaryLiteral`，它有点像字典，可以直接用作函数参数。如果我们为 `Bookmark struct` 实现这个构造器，它看起来是这样的：

    
    extension Bookmark: CustomReflectable {
        func customMirror() -> Mirror { // [译者注] 此处应该为 public func customMirror() -> Mirror {
    	let children = DictionaryLiteral<String, Any>(dictionaryLiteral: 
    	("title", self.title), ("pagerank", self.pagerank), 
    	("url", self.url), ("created", self.created), 
    	("keywords", self.keywords), ("group", self.group))
    
    	return Mirror.init(Bookmark.self, children: children, 
    	    displayStyle: Mirror.DisplayStyle.Struct, 
    	    ancestorRepresentation:.Suppressed)
        }
    }

如果现在我们做另外一个性能测试，会发现性能甚至略微有所提升：

    
    创建 2000 个 NSManagedObject
    原生: 0.062 seconds
    反射: 0.207 seconds
    反射: 0.203 seconds

但这个工作几乎没有任何价值，因为它与我们之前反射 `struct` 成员变量的初衷是相违背的。

# 用例

所以留下来让我们思考的问题是什么呢？好的反射用例又是什么呢？很显然，如果你在很多 `NSManagedObject` 上使用反射，它会大大降低你代码的性能。同时如果只有一个或者两个 `struct`，根据自己掌握的`struct` 领域的知识编写一个序列化的方法会更容易，更高性能且更不容易让人困惑。

而本文展示反射技巧可以当你在有很多复杂的 `struct` ，且偶尔想对它们中的一部分进行存储时使用。

例子如下：

 - 设置收藏夹
 - 收藏书签
 - 加星
 - 记住上一次选择
 - 在重新启动时存储AST打开的项目
 - 在特殊处理时做临时存储

当然除此之外，反射当然还有其他的使用场景：

 - 遍历 `tuples`
 - 对类做分析
 - 运行时分析对象的一致性
 - 自动生成详细日志 / 调试信息（即外部生成对象）

# 讨论

反射 API 主要做为 `Playground` 的一个工具。符合反射 API 的对象可以很轻松滴就在 `Playground` 的侧边栏中以分层的方式展示出来。因此，尽管它的性能不是最优的，在 `Playground` 之外仍然有很多有趣的应用场景，这些应用场景我们在**用例**章节中都讲解过。

# 更多信息

反射 API 的源文件注释非常详细，我强烈建议每个人都去看看。

同时，GitHub 上的 [CoreValue](http://github.com/terhechte/corevalue) 项目展示了关于这个技术更详尽的实现，它可以让你很轻松滴把 `struct` 编码成 `CoreData`，或者把 `CoreData` 解码成  `struct`。

<a name="1">1、实际上，`Any` 是一个空的协议，所有的东西都隐式滴符合这个协议。
<a name="2">2、更确切地说，是一个空的可选类型。
<a name="3">3、我对注释稍微做了简化。


本文对应代码地址：[下载](https://github.com/mmoaay/MBPlayGroundForSwiftGG/tree/master/SwiftReflectionAPIPlayground.playground)
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。