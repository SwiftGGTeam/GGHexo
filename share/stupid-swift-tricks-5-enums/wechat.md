Swift 傻瓜技巧：自定义枚举的映射关系"

> 作者：Wooji Juice，[原文链接](http://www.wooji-juice.com/blog/stupid-swift-tricks-5-enums.html)，原文日期：2016-04-08
> 译者：[Lanford3_3](http://lanfordcai.github.io)；校对：[shanks](http://codebuild.me/)；定稿：[CMB](https://github.com/chenmingbiao)
  









在 iOS 平台的 app 中，有种列表设计非常常见: 一个 table view, 里面是一个项目列表，每个项目只有一行简单的文字，对于被选中的项目，后面会有一个对勾。

当然，往往有着许多更好的方式来实现这种列表的功能，特别是在你的 app 中 UI 处于核心地位的时候。但是，用户们熟悉这种列表的展示方式，比如 App 中的设置页面，使用这种列表来表现是非常实用的。实际上，iOS 系统的设置页面也随处可见这种列表。让我们来为这篇文章找个案例--点开系统的设置，在其中点击信息一栏，然后点击保留信息，之后你就可以选择信息保留的时限：“30 天”，“一年” 或是 “永久”。



有时候选项是动态的（比如说，选择默认日历，里面的选项取决于用户创建了哪些日历），但是大部分时候，包括保留信息这个例子，选项列表是固定的，从代码的角度考虑，这些设置可以用一个枚举（enum）很好地表示出来：

    
    enum KeepMessagesOptions: Int
    {
        case For30Days, For1Year, Forever
    }

通过让这个枚举基于 `Int` 类型，枚举中的每一项都会和一个索引关联起来（0 对应 `For30Days`，1 对应 `For1Year`，2 对应 `Forever`），这样的话，你就能将 `NSIndexPath.row` 和枚举互相转换了。

但是，为了存储设置项，你还需要一些别的东西：一个 永久的 ID, 和索引区分开来。为什么呢？让我们假设下次升级的时候你决定加入更多的时间间隔：

    
    enum KeepMessagesOptions: Int
    {
        case For30Days, For6Months, For1Year, Forever
    }

如果之前一个 iOS 9 的用户选择了永久保存他的信息，而你也用了 index(2) 去存储他的设置，问题就产生了--现在这个索引对应的是 `For1Year`，所以用户可能会失去许多他本想保留下来的信息，这样很不好。

当然，你更不能用屏幕上显示的那些名称来存储设置，因为这些名称 a）（国际化时）要翻译成别的语言 b) 有可能有拼写错误，并在之后得到了修正（这样修正前和修正后的项目就无法对应起来了），或是发生一些类似的其他情况。通常来说，你永远都不该使用用户界面上的那些字符串来做设置的存储。所以你需要一些特殊的、机器能读取的 ID 来做这事儿。

这个问题显而易见，为什么我要一再强调呢？因为不得不费心神去处理这事儿，确实让人觉得很烦躁。 

在 Objective-C 以及 C/C++ 中，枚举只是一个略漂亮的定义整数的方式。 所以，为了做一个 UI 给用户进行选项的选择，你需要定义两个字符串列表来表示这些选项（一个是给机器读取用的 ID 列表，一个是本地化的给人类阅读的名称列表），做一个 table view controller 来展示这些选项，每次你使用它的时候，传入人类可理解的字符串, 定义一些 API 来处理结果，每次读写设置项目的时候，你都需要处理所有索引、机器可读取的 ID 和供人类阅读的名称之间的转换。

这并不难。但这很乏味。

### 一种更好的方式

在 Swift 中，枚举能做的事多了不少。让我们快速地定义一个协议：

    
    protocol PickableEnum
    {
        var displayName: String { get }
        var permanentID: String { get }
        static var allValues: [Self] { get }
        static func fromPermanentID(id: String) -> Self?
    }

这样一来，写一个常见的，能从任何 `PickableEnum` 中进行选项选择的 view controller 会变得相当简单了。 加到 [Futures](https://en.wikipedia.org/wiki/Futures_and_promises) 中，你就能像下面这样轻松使用它:

    
    @IBAction func showChoicesForKeepMessage()
    {
        // 假设我们已经从别的地方拿到了 currentValue
        EnumPickerController.pickFromEnum(currentValue, from: self).onSuccess
        {
            newValue in
            // 处理 newValue, 把 newValue.permanentID 存到 NSUserDefaults 的什么地方去
        }
    
    }

这看起来相当不错，但是枚举们本身怎样了呢--我们是否只是在枚举们实现 `PickableEnum` 这个协议中的方法时，把所有要做的额外工作都写在里面了呢？不 -- 枚举们由协议拓展（protocol extension）来实现：

    
    extension PickableEnum where Self: RawRepresentable, Self.RawValue == Int
    {
        var displayName: String
        {
            return Localised("\(self.dynamicType).\(self)")
        }
        
        var permanentID: String
        {
            return String(self)
        }
        
        static var allValues: [Self]
        {
            var result: [Self] = []
            var value = 0
            while let item = Self(rawValue: value)
            {
                result.append(item)
                value += 1
            }
            return result
        }
        
        static func fromPermanentID(id: String) -> Self?
        {
            return allValues.indexOf { $0.permanentID == id }.flatMap { self.init(rawValue: $0) }
        }
    }

这些只用写一次，现在对于协议的所有要求，我们都有了合理的默认实现。所以我们所要做的一切就是让我们的枚举遵循协议：

    
    enum KeepMessagesOptions: Int, PickableEnum
    {
        case For30Days, For6Months, For1Year, Forever
    }

当然，你也可以（对协议）使用你自己的实现。比如说，如果你需要兼容 `NSUserDefaults` 中已有的设置的 ID, 你可以这样做：

    
    enum KeepMessagesOptions: Int, PickableEnum
    {
        case For30Days, For6Months, For1Year, Forever
        var permanentID: String { return ["30d", "6m", "1y", "forever"][rawValue] }
    }

但你也不是非得这么做。

另外，对于供人阅读的字符串，把他们加到本地化字符串文件(localised strings file), 用枚举类型和枚举的 case 作为 key, 你所需要做的就是这样：

在 Localized.strings 中：

    "KeepMessagesOptions.For30Days" = "For 30 Days";
    // etc

（我做了个假设，上面的那个 `Localised()` 是一个函数，它使用标准的 cocoa 本地化步骤，从 main bundle 中寻找适当的文本。为什么不用 `NSLocalizedString()` 呢？因为那只是用于静态的字符串，当你构造字符串（就像我们这儿所做的），运行 `genstrings` 或是类似的其他方法时，很可能给你带来麻烦。）

### 其他方法以及补充说明

另一种可能的方法是，使用基于 `String` 而非 `Int` 的枚举。 这样做的好处在于，你能够使用默认的 `init(rawValue:)` 方法以及 `rawValue` 成员变量来转换 ID 和 case，如果你通过拓展标准库中的 `RawRepresentable` 协议来实现 `PickableEnum` 协议，那么协议也可以缩减为仅剩 `allValues` 和 `displayName`。

    
    protocol PickableEnum: RawRepresentable
    {
    	var displayName: String { get }
    	static var allValues: [Self] { get }
    }

理论看起来比较简单，但是在实践中，你必须给枚举的 case 做索引来和 table view 的行进行相互转换。你还必须根据 case 手动地定义 `allValues` 数组。如果你发现你总是在做这事儿，也许使用一个基于 `String` 的枚举会更好。或者说，在将来，即使是对于基于非整形类型的枚举，Swift 也可能提供一种方法来自动地访问一个枚举中所有可能的 case（至少对于没有关联数据的枚举来说）。毕竟编译器掌握了相关信息[^1]。

但在我的例子中，我还是坚持用基于整形的枚举，这是出于另外一个原因：当我需要用到 [Ferrite](http://www.wooji-juice.com/products/ferrite/) 的音频引擎（用 Objective-C++ 写的，[之前已经提到过](http://www.wooji-juice.com/blog/stupid-swift-tricks-4.html)）中的值时，基于整形的枚举会让我更加容易对这些值进行处理。

另外一个小小的原因：我上面给出的是最简单的定义，但是在实践中，我发现如果 `allValues` 返回的不是一个实例数组，而是一个元组数组，比如说 `[(name: String, id: String)]`，将会非常有用。这是 view controller 真正需要的数据，并且减少了泛型适配所有类型的副作用 -- 它只需要处理已知的类型。这点或许对你有价值。

噢，这还有另外一点……实际上，我们并不一定要用枚举来做这事儿。还记得不，最开始的时候我说了有时候列表是基于用户提供的数据的，并不是一个固定的集合？你可以构建自己的结构体来遵循 `PickableEnum`，你的 view controller (或者是其他你使用的组件，也许是……`UIPickableView`？）也能够很好地接受他。而且幸运的是，你不用去写一堆重复的代码。

[^1]: 就像你使用 `switch` 语句时，它知道你都有哪些 case

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。