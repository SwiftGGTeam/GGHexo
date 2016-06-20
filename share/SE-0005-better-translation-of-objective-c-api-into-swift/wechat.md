SE-0005 更好的把 Objective-C APIs 转换成 Swift 版本"


> 译者：[泊学](https://www.boxueio.com)

## 提交 review 前必读

做为下面三份文档的一部分，它们的内容是彼此关联的：

* [SE-0023 API设计指南](https://github.com/apple/swift-evolution/blob/master/proposals/0023-api-guidelines.md)
* [SE-0006 在标准库中应用设计指南](https://github.com/apple/swift-evolution/blob/master/proposals/0006-apply-api-guidelines-to-the-standard-library.md)
* [SE-0005 更好的把Objective-C APIs转换成Swift版本](https://github.com/apple/swift-evolution/blob/master/proposals/0005-objective-c-name-translation.md)

这三份文档的内容是相互关联的（例如：标准库中一个 API 的调整和某个 API guideline 是对应的，或根据某条设计指南制定的 Clang importer 规则，等等）。正因为存在这些内容交叉，为了保证讨论是可维护的，我们希望你：

* **在提交 review 之前，对以上三份文档中的全部内容，有一个基本的了解**；
* **在提交以上三个文档的 review 时，请参照每个文档的 review 声明**。在你提交 review 时，如果文档间交叉引用有助于帮你阐述观点，你应该包含它们（这也是被提倡的做法）。



## 简介

这份提议描述了我们如何改进 Swift 的 `Clang Importer`，它有两个功能：首先，把 C 和 Objective-C 的 APIs 映射成 Swift 版本；其次，翻译 Objective-C 中的函数、类型、方法和属性等的名字，让它们满足[API设计指南](https://github.com/apple/swift-evolution/blob/master/proposals/0023-api-guidelines.md)中的要求，这些要求，是我们在设计Swift 3时，建立的原则。

我们的方法专注于 Objective-C 版本的 [Cocoa 编码指南](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/CodingGuidelines/CodingGuidelines.html)和 Swift 版本的 [API 设计指南](https://github.com/apple/swift-evolution/blob/master/proposals/0023-api-guidelines.md)之间的差异。使用一些简单的语言学分析方法，协助我们把 Objective-C 中的名字自动转换成更加 Swift “原汁原味”的名字。

转换的结果，可以在 [Swift 3 API Guidelines Review](https://github.com/apple/swift-3-api-guidelines-review) 这个 repository 中查看。这个 repository 中包含了用 [Swift 2](https://github.com/apple/swift-3-api-guidelines-review/tree/swift-2) 和 [Swift 3](https://github.com/apple/swift-3-api-guidelines-review/tree/swift-3) 编写的Objective-C APIs 项目，以及一些已经迁移到 Swift 3 版本的示例代码。你也可以通过[对比这两个分支](https://github.com/apple/swift-3-api-guidelines-review/compare/swift-2...swift-3)来查看所有的改动。

## 动机

Objective-C 版本的 [Cocoa 编码指南](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/CodingGuidelines/CodingGuidelines.html) 为使用 Objective-C 创建简单、一致的 API 提供了完整的框架。但是 Swift 是一门不同的编程语言，特别是，它是一门支持类型推导、泛型编程和重载等语言特性的强类型语言。于是，基于 Objective-C 编写的 APIs 搭配上Swift就有点儿水土不服，这些 API 在 Swift 里用起来显得很啰嗦。例如：

    
    let content = 
        listItemView.text.stringByTrimmingCharactersInSet(
            NSCharacterSet.whitespaceAndNewlineCharacterSet())

这明显是一个 Objective-C 风格的函数调用。如果我们用 Swift 编写，结果看上去应该是这样的：

    
    let content = 
        listItemView.text.trimming(.whitespaceAndNewlines)

这显然是更遵循 [Swift API 设计指南](https://github.com/apple/swift-evolution/blob/master/proposals/0023-api-guidelines.md) 中的用法，特别是，我们忽略掉了那些编译器已经能强制约束我们使用的类型名称（例如：view，string, character set等）。这份提议的目的，就是让从 Objective-C 引入 API 更加“Swift原汁原味”，让 Swift 开发者在使用 Objective API 时，有和使用 Swift “原生代码”更为一致的开发体验。

这份提议中的解决方案对 Objective-C 框架（例如：Cocoa 和 Cocoa Touch）和任何可以在“Swift 混合项目”中使用的 Objective-C API 是相同的。要说明的是，[Swift 核心库](https://swift.org/core-libraries/)重新实现了 Objective-C 框架中的 API，所以，对这些 API（名称的）的改动都会在 Swift 3 核心库的实现中体现出来。

## 提议的解决方案

提议的解决方案引入了一种定义 Objective-C [Cocoa 编码指南](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/CodingGuidelines/CodingGuidelines.html)和[ Swift API设计指南](https://github.com/apple/swift-evolution/blob/master/proposals/0023-api-guidelines.md)区别的方式，这种方式可以帮助我们通过设置一系列规则，参照 Cocoa 编码指南以及 Objective-C 中既定的习俗，把前者变换成后者。这是对用Clang importer进行名称翻译的一种启发式扩展。例如：把 Objective-C 中的全局`enum`常量变成Swift中的cases（这要去掉Objective-C为全局enum常量名设置的前缀）以及把 Objective-C 中的工厂方法（例如：`+[NSNumber numberWithBool:]`）映射成 Swift 中的初始化方法（`NSNumber(bool: true)`）。

这份提议中描述的启发式方法需要通过覆盖大量的Objective-C API进行迭代、调校和试验，以确保它最终可以正常工作。但是，它仍旧是不可能完美工作的，一定会有一些API，经过“翻译”之后，会导致其不如原来表意清晰。因此，我们的目标是确保绝大多数的Objective C API都可以在翻译之后更加的Swift原汁原味。并且允许Objective-C API的作者对于那些不满意的翻译，在Objective-C头文件中，通过API注释说明问题。

这份提议的解决方案对Clang importer引入了以下这些改变：

1. **泛化`swift_name`属性的应用范围**：Clang的`swift_name`现在只能用于重命名`enum`的cases以及工厂方法。当它被引入到Swift后，它应该被泛化成允许重命名任意的C或Objective-C的语言元素，以方便C或Objective-C API的作者更好的调校重命名的过程。
2. **去掉冗余的类型名称**：Objective-C Cocoa编码指南要求方法声明中要带有每一个参数的描述。当这个描述重申了参数的类型时，方法的名字就违背了Swift编码指南中关于“忽略不需要的字符”的设计要求。因此，执行翻译时，我们应该去掉那些描述类型的部分。
3. **添加默认参数**：如果Objective-C API的声明强烈暗示参数需要参数默认值，应该为这样的API在引入Swift时，添加参数默认值。例如，一个表示选项集合的参数，可以被设置成\[\]。
4. **为第一个参数添加label**：如果方法的第一个参数有默认值，[应该为这个参数设置一个参数label](https://swift.org/documentation/api-design-guidelines#first-argument-label)。
5. **给Bool语义的属性添加“is”前缀**：[Bool属性应该在读取的时候，表达断言的语义](https://swift.org/documentation/api-design-guidelines#boolean-assertions)，但是Objective-C Cocoa编码指南中，[禁止在属性名中使用单词“is”](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/CodingGuidelines/Articles/NamingIvarsAndTypes.html#//apple_ref/doc/uid/20001284-BAJGIIJE)。因此，当引入这样的属性时，为它们添加“is”前缀。
6. **表达值语义的名字，首字母小写**：在Swift API设计指南中，要求对“非类型声明（non-type declarations）”使用小写字母。包括，`enum`中的`case`以及属性或函数的声明。因此，引入Objective-C中没有前缀的值时，让这些名字的首字母小写（例如：一个叫做`URLHandler`的属性应该变成`urlHandler`）。
7. **让实现`compare(_:) -> NSComparisonResult`的类遵从Comparable protocol**：在Objective-C中，类对象的比较结果，都是通过“排序”的方式判断的（注：例如`NSOrderedDescending`和`NSOrderedAscending`）。导入过程中，通过让这些类遵从`Comparable` protocol，可以让比较操作的实现更正规（注：通过`Comparable`提供的运算符方法）。

为了感受下这些转换规则带来的实际效果，看下`UIBezierPath`从Swift 2：

    
    class UIBezierPath : NSObject, NSCopying, NSCoding {
        convenience init(ovalInRect: CGRect)
        func moveToPoint(_: CGPoint)
        func addLineToPoint(_: CGPoint)
        func addCurveToPoint(_: CGPoint, 
            controlPoint1: CGPoint, controlPoint2: CGPoint)
        func addQuadCurveToPoint(_: CGPoint, 
            controlPoint: CGPoint)
        func appendPath(_: UIBezierPath)
        func bezierPathByReversingPath() -> UIBezierPath
        func applyTransform(_: CGAffineTransform)
        var empty: Bool { get }
        func containsPoint(_: CGPoint) -> Bool
        func fillWithBlendMode(_: CGBlendMode, alpha: CGFloat)
        func strokeWithBlendMode(_: CGBlendMode, alpha: CGFloat)
        func copyWithZone(_: NSZone) -> AnyObject
        func encodeWithCoder(_: NSCoder)
    }

移植到Swift 3后的变化：

    
    class UIBezierPath : NSObject, NSCopying, NSCoding {
        convenience init(ovalIn rect: CGRect)
        func move(to point: CGPoint)
        func addLine(to point: CGPoint)
        func addCurve(to endPoint: CGPoint, 
            controlPoint1 controlPoint1: CGPoint, 
            controlPoint2 controlPoint2: CGPoint)
        func addQuadCurve(to endPoint: CGPoint, 
              controlPoint controlPoint: CGPoint)
        func append(_ bezierPath: UIBezierPath)
        func reversing() -> UIBezierPath
        func apply(_ transform: CGAffineTransform)
        var isEmpty: Bool { get }
        func contains(_ point: CGPoint) -> Bool
        func fill(_ blendMode: CGBlendMode, alpha alpha: CGFloat)
        func stroke(_ blendMode: CGBlendMode, alpha alpha: CGFloat)
        func copy(with zone: NSZone = nil) -> AnyObject
        func encode(with aCoder: NSCoder)
    }

可以看到，在Swift 3版本里，原来API里很多描述类型信息的部分都被去掉了。转换后的结果，更接近Swift API设计指南中的要求。现在，Swift开发者可以通过类似`foo.copy()`这样的方式，拷贝任何遵从`NSCopying`的对象，而不用再像原来`foo.copyWithZone(nil)`这样的方式。

<A name="implementation-experience"></A>
## 实现过程

这份提议的一个试验性实现在 Swift main repository 中。Swift 编译器提供了一些开关帮助我们查看按照这份提议中的描述，被引入的 Objective-C API 以及 Swift 代码自身的转换结果（例如，通过 utils/omit-needless-words.py 脚本）。这些开关是：

* `--enable-omit-needless-words`：这个开关启用了对Clang importer绝大多数的改动（上一节中提到的 1，2，4，5）。它主要适合用来打印在 Master 和 [Swift 2.2](https://github.com/apple/swift/tree/swift-2.2-branch) 分支上，Swift 对Objective-C 模块提供的接口。在 [Swift 3 API Guidelines分支](https://github.com/apple/swift/tree/swift-3-api-guidelines) 上，它默认是开启的；
* `--enable-infer-default-arguments`：这个开关启用了 Clang importer 中，对参数默认值的干涉（上一节的 3）；
* `--swift-migration`：仅在 [Swift 2.2 分支](https://github.com/apple/swift/tree/swift-2.2-branch)上才有的开关，这个选项通过添加 "Fix-Its"，执行把名称从 Swift 2 迁移到 Swift 3 的基本转换。通过和其它编译器开关（例如：-fixit-code，-fixit-all）以及一个收集和应用 “Fix-Its” 的脚本（utils/apply-fixit-edits.py）一起使用，这个开关为我们提供的基础迁移工作可以帮助我们了解 Swift 代码在各种声明和调用场景里，按照这份提议被转换后的样子；

为了使用转换后的名称，真正编译 Swift 3 代码，可以使用 [Swift 3 API Guidelines](https://github.com/apple/swift/tree/swift-3-api-guidelines) 分支。编译器默认启用了上述功能并带有随之一起改动的标准库。

## 设计细节

这部分描述了上述改变规则中第 2-5 条的试验性实现细节。真正的实现在 Swift 代码树中，主要是 [lib/Basic/StringExtras.cpp](https://github.com/apple/swift/blob/master/lib/Basic/StringExtras.cpp) 中的 `omitNeedlessWords` 函数。

接下来的描述，和参与名称翻译的 Objective-C API 紧密相关。例如：`startWithQueue:compeltionHandler:` 是个有两个selector 片段的方法，`startWithQueue` 和 `completionHandler`。这个 selector 翻译成 Swift 版本应该是`startWithQueue(_:completionHandler:)`。

### 去掉冗余的名称

Objective-C API 中经常会包含参数或返回值的类型名称，它们应该在 Swift API 中统统被去掉。下面的这些规则，用于识别并且去掉这些表示类型名称的单词。\[[详见 API 设计原则之忽略不需要的单词]\]。

#### 定义类型名称

匹配的过程是在老版本 Swift API 的 selector 片段里，搜索特定的**类型名称**后缀，这些类型名称定义如下：

* 对于绝大部分 Objective-C 类型来说，类型名称就是忽略 `nullable` 之后，Swift 引入的名称，例如：

Objective-C type  | Type name
----------------- | -------------
float             | Float
nullable NSString | String
UIDocument        | UIDocument
nullable UIDocument | UIDocument
NSInteger         | NSInteger
UIUInteger        | NSUInteger
CGFloat           | CGFloat

* 当 Objective-C 类型是一个 block 时，Swift 中的类型名称是 `Block`；
* 当 Objective-C 的类型是一个函数指针或引用时，Swift中的类型名称是 `Function`；
* 当 Objective-C 的类型是一个除 `NSInteger`、`NSUInteger` 或 `CGFloat` 之外的 typedef 时，Swift 中的类型名称则是这些typedef实际代表的类型的名称。例如，Objective-C 中的类型是 `UILayoutPriority`，实际上它是一个 `float` 类型的 typedef，我们将（在老版本的 Swift API 里）尝试匹配字符串 `Float`。\[详见 API 设计原则之为弱类型提供信息补偿\]。

#### 匹配类型名称

为了在 selector 片段中删除冗余的类型信息，我们需要在 selector 中匹配包含上述类型信息的字符串。

全部匹配都是由以下两个基本规则来管理的：

* **在单词开始和结束的边界进行匹配**：无论是 selector 片段内部，还是类型名称，单词边界位置都是一个字符串的开始或结束，以及每一个大写字母前面。把每一个大写字母作为单词边界可以让我们匹配到“大写字母缩略词”，而无需单独维护一个特殊的缩略词或前缀列表；

例如，下面的 `URL` 是匹配的：

    
    func documentForURL(_: NSURL) -> NSDocument?

但是，下面的 View，由于在单词中间，它是不能被匹配的。

    
    var thumbnailPreview : UIView  // not matched

* **匹配的字符扩展到类型名称的结尾**：因为我们支持匹配一个类型名称的后缀，因此：

    
    func constraintEqualToAnchor(anchor: NSLayoutAnchor) -> NSLayoutConstraint?

可以被简化成：

    
    func constraintEqualTo(anchor: NSLayoutAnchor) -> NSLayoutConstraint?

基于以上两个原则，我们可以执行以下一系列的匹配过程：

* **基本匹配**：

    * selector 片段中的字串匹配类型名称的字串，例如：`appendString` 中的 `String` 匹配 `NSString` 中的 `String`：`func appendString(_:  NSString)`；
    * Selector 片段中的 `Index` 匹配类型名称中的 `Int`，例如：`func characterAtIndex(_: Int) -> unichar`；
    
* **集合相关匹配（Collection matches）**：
    * Selector 片段中的 `Indexes` 或 `Indices` 匹配类型名称中的 `IndexSet`，例如：`func removeObjectsAtIndexes(_: NSIndexSet)`；
    * 如果 selector 片段中的复数名词的单数形式匹配集合中元素的类型，那么 selector 中的复数名词匹配集合类型名称，例如：`func arrangeObjects(_: [AnyObject]) -> [AnyObject]`

**特殊后缀匹配**：

* 在 selector 片段中，用一个空字符串后缀匹配类型名称中的 `Type` 或 `_t`，例如：

    
    // 注：用一个空字符串匹配到了Type，因此SaveOperation加上
    // 空字符串就匹配了SaveOperationType，
    // 于是Selector中的SaveOperation的部分就可以删除了。
    func writableTypesForSaveOperation(
        _: NSSaveOperationType) -> [String]
    // 注：用一个空字符串匹配到了Type。
    func objectForKey(_: KeyType) -> AnyObject
    // 注：用一个空字符串匹配到了_t。
    func startWithQueue(_: dispatch_queue_t, 
        completionHandler: MKMapSnapshotCompletionhandler)

    * selector片段中的空字符串可以匹配类型名称中“数字+D”形式的后缀，例如：

    
    // Coordinate+空字符串匹配到了2D
    func pointForCoordinate(_: CLLocationCoordinate2D) -> NSPoint

<A name="pruning-restrictions"></A>
#### 名称限制约束
**(译者注：删除类型名称时的限制)**

如果在删除 selector 名称时违背了以下任何限制，那么删除行为将不会进行：

* **不要删光所有的 selector**；
* **不要把 selector 的第一个片段转换成 Swift 关键字**：

在 Swift 里，Objective-C 方法中的第一个 selector 片段会变成**构建一个方法名称的基础**或者**一个属性的名字**。

它们之中的任何一种，都不能是 Swift 关键字，否则，用户就需要使用反引号来使用它们。

例如，下面的用法是合理的：

    
    extension NSParagraphStyle {
        class func defaultParagraphStyle() -> NSParagraphStyle
    }
    let defaultStyle = 
        NSParagraphStyle.defaultParagraphStyle()  // OK

如果我们删掉 `ParagraphStyle`，用起来就会很糟糕：

    
    extension NSParagraphStyle {
        class func `default`() -> NSParagraphStyle
    }
    let defaultStyle = 
        NSParagraphStyle.`default`()    // Awkward

Objective-C方法名中的其它selector片段，会变成Swift方法的参数label，这个label是允许使用Swift关键字的，例如：

    
    receiver.handle(someMessage, for: somebody)  // OK

* **不要把方法名称转换成 “get”，“Set”，“with”, “for” 或 “using”**，用这些单词形成的方法名称表意非常空洞；
* **不要删除方法名称中那些介绍参数的后缀，除非这个后缀前面直接连接一个介词、动词或动名词**：

这种启发式转换帮助我们避免破坏那些介绍参数的名词短语。直接删掉名词短语后缀通常不会带来我们预期的表意结果。例如：

    
    func setTextColor(_: UIColor)
    ...
    button.setTextColor(.red())  // clear

如果我们删掉方法名中的`Color`，只剩下`Text`，调用方法时表达的语意就会让人困惑：

    
    func setText(_: UIColor)
    ...
    button.setText(.red())      // appears to be setting the text!

* **如果方法的名字匹配它所在的类型中的一个属性，不要转换方法名**：

这种启发式转换使我们可以避免让那些修改类属性的方法转换出过于泛泛的名字，例如：

    
    var gestureRecognizers: [UIGestureRecognizer]
    func addGestureRecognizer(_: UIGestureRecognizer)

如果我们删掉方法中的 `GestureRecognizer`，只留下 `add`，对于一个实际上是在修改 `gesturerecognizers` 属性的方法来说，这个名字明显太泛泛了。

    
    var gestureRecognizers: [UIGestureRecognizer]
    func add(_: UIGestureRecognizer) // should indicate that we're adding to the property

#### 删除类型名称的步骤

我们按照下面的步骤删除冗余的名字：

1. **删除头部的结果类型信息**。特别是，当以下情形的时候：

    * 当方法返回一个自身所在的类型时；
    * 并且这个类型的名称匹配方法中第一个 selector 片段；
    * 匹配到的名词后面，紧跟一个介词；
    
    就可以删除掉这个匹配。
    
    通常，匹配以上这些条件的属性和方法，它们都用于把自身类型变成其它某种等价形式的值。
    
    例如：
    
        
        extension NSColor {
          func colorWithAlphaComponent(_: CGFloat) -> NSColor
        }
        let translucentForeground = 
            foregroundColor.colorWithAlphaComponent(0.5)
    
    可以被简化成：
    
        
        extension NSColor {
            func withAlphaComponent(_: CGFloat) -> NSColor
        }
        let translucentForeground = 
            foregroundColor.withAlphaComponent(0.5)

2. **删掉多余的介词By**。特别是，当以下情形的时候：

    * 在第一步中删掉了开始的名词之后；
    * 方法名称中，剩余的部分用 `By` +动名词的形式；
    
    就可以删掉多余的 `By` 了。
    
    这种启发式方法可以让我们使用类似`a = b.frobnicating(c)`的方法调用形式。例如：
    
        
        extension NSString {
            func stringByApplyingTransform(_: NSString, 
                reverse: Bool) -> NSString?
        }
        let sanitizedInput = 
            rawInput.stringByApplyingTransform(
                NSStringTransformToXMLHex, reverse: false)
    
    就可以通过第一步和第二步，被简化成：
    
        
        extension NSString {
            func applyingTransform(
                _: NSString, reverse: Bool
            ) -> NString?
        }
        
        let sanitizedInput = 
            rawInput.applyingTransform(NSStringTransformToXMLHex, 
                reverse: false)

3. **在方法签名的最后一个 selector 片段中，删除任何匹配到的类型名称**。特别是以下类型：

    方法名称的尾部是 | 删除匹配到的
    --------------- | ------------
    用于介绍参数的selector片段 | 参数类型名称
    一个属性名称 | 属性的类型名称
    一个不带参数的方法 | 返回值的类型名称
    
    例如，下面这些情况：
    
        
        extension NSDocumentController {
            func documentForURL(
                _ url: NSURL) -> NSDocument? // parameter introducer
        }
        extension NSManagedObjectContext {
            var parentContext: NSManagedObjectContext?  // property
        }
        extension UIColor {
            class func darkGrayColor() -> UIColor  // zero-argument method
        }
        ...
        
        myDocument = self.documentForURL(locationOfFile)
        if self.managedObjectContext.parentContext != changedContext { 
            return 
        }
        
        foregroundColor = .darkGrayColor()
    
    可以被简化成：
    
        
        extension NSDocumentController {
            func documentFor(_ url: NSURL) -> NSDocument?
        }
        extension NSManagedObjectContext {
            var parent : NSManagedObjectContext?
        }
        extension UIColor {
            class func darkGray() -> UIColor
        }
        ...
        myDocument = self.documentFor(locationOfFile)
        if self.managedObjectContext.parent != changedContext { 
            return 
        }
        foregroundColor = .darkGray()

4. **只要匹配到的类型名称前面直接连接动词，即便这个类型名称在方法名中间也可以删掉它**，例如：

        
        extension UIViewController {
            func dismissViewControllerAnimated(
                flag: Bool, 
                completion: (() -> Void)? = nil)
        }
    
    可以被简化成：
    
        
        extension UIViewController {
            func dismissAnimated(
                flag: Bool, 
                completion: (() -> Void)? = nil)
        }

##### 为什么删除一定要按照顺序执行呢？

下面的简化过程有些在方法名称的第一个selector片段中匹配，有些在方法名称的结尾匹配。当[名称限制约束](#pruning-restrictions)阻止我们从开始和结尾进行删除时，从头部开始删除名称可以保持方法家族的一致性，例如，对于 `NSFontDescriptor` 来说：

    
    func fontDescriptorWithSymbolicTraits(
        _: NSFontSymbolicTraits) -> NSFontDescriptor
    func fontDescriptorWithSize(
        _: CGFloat) -> UIFontDescriptor
    func fontDescriptorWithMatrix(
        _: CGAffineTransform) ->  UIFontDescriptor
    ...

按照头部匹配规则，它们可以变成这样：

    
    func withSymbolicTraits(
        _: UIFontDescriptorSymbolicTraits) ->  UIFontDescriptor
    func withSize(
        _: CGFloat) -> UIFontDescriptor
    func withMatrix(
        _: CGAffineTransform) -> UIFontDescriptor
    ...

如果我们坚持从尾部进行删除，删掉第一个方法中的 `SymbolicTraits` 之后，我们就无法再继续删除头部的 `fontDescriptor` 了，因为这违背了我们在[名称限制约束](#pruning-restrictions)中定义的原则，只留下一个 `with` 表意是不够的。

    
    func fontDescriptorWith(
        _: NSFontSymbolicTraits) -> NSFontDescriptor // inconsistent
    func withSize(_: CGFloat) -> UIFontDescriptor
    func withMatrix(_: CGAffineTransform) -> UIFontDescriptor
    ...

> 注：这样一来，我们就破坏了原来家族方法的名称一致性。

#### 添加参数默认值

出了那些只有一个参数的 setter 方法之外，在以下情况时，应该给参数添加默认值：

* 让**可以为空的 trailing closure 参数**值为`nil`；
* 让**可以为空的 `NSZone` 参数**默认为 `nil`。Zones几乎不在Swift中使用，它们应该总是为 `nil` 的；
* 让**参数名中带有 "Options" 字样的参数**值默认为 `[]`，表示空的选项集合；
* 和选项、属性或信息有关的 NSDictionary 参数，默认值为`[:]`；

把这些规则集合起来，这个启发式方法可以把下面的代码：

    
    rootViewController.presentViewController(
         alert, animated: true, completion: nil)
        
    UIView.animateWithDuration(0.2, delay: 0.0, 
        options: [], 
        animations: { self.logo.alpha = 0.0 }) {
        _ in self.logo.hidden = true 
    }

变成这个样子：

    
    rootViewController.present(alert, animated: true)
    
    UIView.animateWithDuration(0.2, delay: 0.0, 
        animations: { self.logo.alpha = 0.0 }) { 
        _ in self.logo.hidden = true 
    }

#### 为第一个参数添加label

如果方法名称中第一个 selector 片段中包含一个介词，**就把这个 selector 片段从最后一个介词处分开**，把这个 selector 中，这个介词后面的部分变成第一个参数的 label。

除了为大量 API 的第一个参数添加 label 之外，当第一个参数有默认值时，这种启发式方法还能消除方法被调用时，方法名称表达的模糊语义。例如：

    
    extension UIBezierPath {
        func enumerateObjectsWith(
            _: NSEnumerationOptions = [], 
            using: (AnyObject, UnsafeMutablePointer) -> Void)
    }
    
    array.enumerateObjectsWith(.Reverse) { // OK
       // ..
    }
    
    array.enumerateObjectsWith() { // ?? With what?
       // ..
    }

变成：

    
    extension NSArray {
        func enumerateObjects(
          options _: NSEnumerationOptions = [], 
          using: (AnyObject, UnsafeMutablePointer) -> Void)
    }
    
    array.enumerateObjects(options: .Reverse) { // OK
       // ..
    }
    
    array.enumerateObjects() { // OK
       // ..
    }

#### 为 Bool 语义的属性添加 “is” 前缀

在 Objective-C 里，表达 Bool 语义的属性，使用对应的 getter 方法作为这个属性在 Swift 中的名字。例如：

    objective-c
    @interface NSBezierPath : NSObject
    @property (readonly,getter=isEmpty) BOOL empty;

会变成：

    
    extension NSBezierPath {
      var isEmpty: Bool
    }
    
    if path.isEmpty { ... }

### 实现比较方法时遵从的准则

现如今，为了实现对象比较，例如对 `NSDate` 来说，开发者经常会扩展 `NSDate` 让它遵从 `Comparable` 或使用 `NSDate` 的`compare(_:) -> NSComparisonResult` 方法。在这些场景里，对 `NSDate` 使用表操作符会有效提高代码可读性，例如 `someDate < today` 要比 `someDate.comare(today) == .OrderedAscending` 要清晰的多。由于转换过程可以确定一个类是否实现了 Objective-C 中的比较方法，所有实现了这个方法的类都可以按照遵从 `Comparable` protocol 的方式引入。

不仅仅是 `NSDate`，Foundation 中的一些其它类也会被这个改变影响，例如：

    
    func compare(other: NSDate) -> NSComparisonResult
    func compare(decimalNumber: NSNumber) -> NSComparisonResult
    func compare(otherObject: NSIndexPath) -> NSComparisonResult
    func compare(string: String) -> NSComparisonResult
    func compare(otherNumber: NSNumber) -> NSComparisonResult

### 对已有代码的影响

这份提议中的改变为使用 Objective-C 框架的已有的 Swift 代码引入了大量破坏性改变（breaking change）。以至于，我们需要一个迁移工具把 Swift 2 代码迁移到 Swift 3。在[实现过程](#implementation-experience)中描述的 `-swift3-migration` 开关为这样的转换工具提供了基本信息。另外，编译器需要为那些引用了旧版本 Objective-C 名称的Swift代码提供良好的错误信息（带有修改建议），除此之外，还应该提供一个辅助的通过旧版本名称进行查询的机制。

### 声明

为了最终形成 [Swift API 设计指南](https://swift.org/documentation/api-design-guidelines)，这份自动名称转换提议由Dmitri Hrybenko, Ted Kremenek, Chris Lattner, Alex Migicovsky, Max Moiseev, Ali Ozer和Tony Parker开发。


补充添加进来的comparable部分之前由 [Chris Amanse](https://github.com/chrisamanse) 提交到了 [core-libraries](https://swift.org/core-libraries/) 邮件列表中。Philippe Hausler 进行 review 之后，添加到了这份提议中。