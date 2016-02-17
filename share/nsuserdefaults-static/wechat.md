静态类型的 NSUserDefaults"

> 作者：Radek Pietruszewski，[原文链接](http://radex.io/swift/nsuserdefaults/static/)，原文日期：2015-08-31
> 译者：[walkingway](http://chengway.in/)；校对：[Cee](https://github.com/Cee)；定稿：[小锅](http://www.jianshu.com/users/3b40e55ec6d5/latest_articles)
  









一年前，在 Swift 推出不久后，我观察到许多 iOS 开发者仍然以 Objective-C 的开发习惯来写 Swift。而在我眼中，Swift 是一门全新的语言，有别于 Objective-C 的语法、设计哲学乃至发展潜力，因此我们更应探索出一条属于 Swift 独有风格的发展道路。我在之前的文章 [Swifty methods](http://radex.io/swift/methods) 中已经探讨过在 Swift 中如何清晰、明确地对方法进行命名，随后我开始连载 *Swifty API* 系列文章，同时将这一想法付诸实践，探索如何设计更加简单易用的接口 API。


在该系列（*Swifty API*）第一篇[文章](http://radex.io/swift/nsuserdefaults/)中，我们对 `NSUserDefaults` API 进行了改造：

    
    NSUserDefaults.standardUserDefaults().stringForKey("color")
    NSUserDefaults.standardUserDefaults().setObject("red", forKey: "color")

改造之后看上去像这样：

    
    Defaults["color"].string
    Defaults["color"] = "red"

相较之前的 get 和 set 方法，改造后的结果更加简单明了，同时也修正了一致性问题，使其更符合 Swift 的使用风格。这看上去是相当大的改进。

但是，随着我对 Swift 深入学习，以及真正在项目中使用这些由我亲手缔造的 API 后，我才意识到这些 API 离真正的原生 Swift 风格还有相当大的差距。在之前的 API 设计中，我从 Ruby 和 Swift 的语法中汲取灵感来构建自己的 API，这一点虽然值得肯定，但是我们并没有将其真正提升到语义学的高度。仅仅是在外表裹了层 Swift 风格的外衣，而内部机制仍然是以 Objective-C 的形式在运作。

### 缺点

「API 不是那么 Swift 化」，听上去并不是一个让我们从头开始的好理由，虽然相似的 API 更容易学习，但我们不想这么教条。我们不仅仅想要设计出来的 API 看上去更加 Swift 化，还希望能在 Swift 的运行机制下*更好地工作*。这样看来，我们之前设计的 `NSUserDefaults` 存在一些小问题：

假设你有一个关于用户喜好颜色的设置选项：

    
    Defaults["color"] = "red"
    // App 中的其他一处：
    Defaults["colour"].string // => nil

啊哦，一旦不小心把键名（key name）写错了，就会出现 Bug :(

同理我们放一个 `date` 对象到 `defaults` 中：

    
    Defaults["deadline"] = NSDate.distantFuture()
    Defaults["deadline"].data // => nil

这一次在 `getter` 方法中把 `date` 拼错成了 `data`，结果是 `nil`，又获得 bug 一枚。你或许认为这种情况并不会经常发生，但为什么每次我们要对取回（`getter`）的对象指定类型呢？这确实有点烦人。

再来一个例子（这个例子我们在赋值的时候就错了，取回的结果当然是 `nil`）：

    
    Defaults["deadline"] = NSData()
    Defaults["deadline"].date // => nil

显然我们想要「现在的时间」的日期而不是一个「空的data值」！

最后观察下面的代码：

    
    Defaults["magic"] = 3.14
    Defaults["magic"] += 10
    Defaults["magic"] // => 13

在第一篇文章中，我们重新定义了 `+=`，使其能够在我的新 API 下正常工作，但这儿有个缺陷：只能从传递进来的参数进行类型推断（`Int` or `Double`）。也就是说如果你参数传一个整数（`Int`）10，运算后的结果是 13.14（`Double`）类型，但最终返回的结果还是会以上一次传入的参数类型为基准，决定最终的返回值。这个例子最后返回值为 13，砍掉了小数部分，显然是个 bug。

你又或许认为以上都是纯理论问题，在真实世界里并不会发生。先别着急下结论，仔细想想，这些拼错变量名、方法名和传递一个错误类型的参数其实都可以归为同一类型的 bug，而这些 bug 在日常开发中是常有之事。如果你正在使用一门需要编译的静态类型语言，那么你更应该依赖编译器给你的反馈而不是事后去测试，更重要的是，花费精力在编译期进行检查也会在将来给你带来丰厚的红利，这不仅仅是在首次写代码时才能享受这种编译器检查带来的好处，在之后的重构中，你也能减少很多不必要的 bug。这里提供一些小[建议](https://twitter.com/radexp/status/636625249019281409)，可以让未来的你免受 bug 之苦。

### 静态类型的力量

导致这些问题的根源在于：没有定义关于 user defaults 的静态结构。

在早先的设计中，我意识到这个问题，于是将各种类型封装在了 `NSUserDefaults` 内部的 `Proxy` 对象中。调用时你可以通过下标（subscript）获得一个 `Proxy` 对象，然后再通过 Proxy 提供的访问方法来实现特定类型的访问。

    
    Defaults["color"].string
    Defaults["launchCount"].int

采用上面这种方式，比你自己实现 `getter` 方法或手动对 `AnyObject` 类型转换要好很多。

但这是一个 hack，并不算真正的解决方案。为了对 API 实现真正意义上的改进，我们需要收集有关 user default keys 的信息，之后提供给编译器。

现在回想下那位长者传授给我们的人生经验。通常不变的常量字符串，为了避免拼写错误，会在一开始就以 `string keys` 的形式定义，随后使用时编译器也会自动补全：

    
    let colorKey = "color"

让我们带上类型信息：

    
    class DefaultsKey<ValueType> {
        let key: String
        
        init(_ key: String) {
            self.key = key
        }
    }
    
    let colorKey = DefaultsKey<String?>("color")

我们将 key name 封装在一个对象中，并且将值类型植入到泛型参数中。现在我们可以定义一个新的 `NSUserDefaults` 下标，用来接收这些 keys：

    
    extension NSUserDefaults {
        subscript(key: DefaultsKey<String?>) -> String? {
            get { return stringForKey(key.key) }
            set { setObject(newValue, forKey: key.key) }
        }
    }

这里是结果：

    
    let key = DefaultsKey<String?>("color")
    Defaults[key] = "green"
    Defaults[key] // => "green", typed as String?

没错，就这么简单，语法和功能稍后再来完善。我们通过这个小技巧，修复了许多问题。比如没办法再轻易拼错 key name 了，因为他只能定义一次。也不能随便就赋值一个不匹配的类型了，因为你这么做编译器会报错。最后也不必写 `.string`，因为编译器已经知道我们想要的类型了。

此外，我们或许应该使用泛型来定义 `NSUserDefaults` 的下标（`subscripts`），而不是手动输入所有需要的类型。不过想法总是美好的,现实却是残酷的，Swift 的编译器目前还不支持泛型下标。(╯‵□′)╯︵┻━┻ 方括号可能看上去还不错，别再纠结语法了，我们让 setting 和 getting 方法更加泛型化就好了。

等等，你还没有见识过下标 `subscripts` 的能耐！

### 令人振奋的下标

考虑下面这种写法：

    
    var array = [1, 2, 3]
    array.first! += 10

完全不能通过编译！我们尝试对数组内部的整数进行加法操作，但这对于 Swift 来说是做不到的。整数具有值语义，是不可变的。当他们从某些地方返回时，你不能直接去修改他们的值，这是因为他们并不存在于表达式之外，仅算是瞬时状态下的一份拷贝罢了。

改换变量来做就没问题：

    
    var number = 1
    number += 10

注意，*实际*并没有真正意义上改变 1 这个整数，而只是修改了变量，为其分配了一个新值而已。

再来看看下面这段代码：

    
    var array = [1, 2, 3]
    array[0] += 10
    array // => [11, 2, 3]
结果终于*如你所愿了*，不是吗？这和你想象中的一样，可是为什么这么做就可以了呢？

观察一下，在 Swift 中，下标和里面的值类型似乎也合作地非常愉快。我们可以通过下标来修改数组里的值，是因为他在内部实现了 `getter` 和 `setter` 方法。编译器层面所做的工作是将 `array[0] += 10` 重写为 `array[0] = array[0] + 10`。如果你只实现了 `getter` 下标 `subscript`，而没有实现 `setter`，是不会正常工作的。

这不仅仅是*数组（Array）*特有的黑魔法，这是下标（subscript）语义精心设计后的结果，我们可以在自己实现的 `subscripts` 免费获得这种特性，比如我们还可以这么玩：

    
    Defaults[launchCountKey]++
    Defaults[volumeKey] -= 0.1
    Defaults[favoriteColorsKey].append("green")
    Defaults[stringKey] += "… can easily be extended!"

有意思吧，要知道在 API 1.0 版本，我们仅仅模仿字典那样使用下标，并没有利用上面介绍的这种语义。

我们还添加了一些 `+=`、`++` 这样的操作符，但是这种行为比较危险，主要依赖于编译器的魔法实现。在这里我们通过将类型信息封装在 key 中，然后定义了 `subscript` 的 `getter` 和 `setter` 方法，现在整个世界看上去运转正常。

### 捷径

在老版本 API 设计中，使用字符串 key 的好处在于你可以按需使用，而不用去创建任何中间对象。

而在目前改进的新版本中，每次使用前都要创建**键对象**（`key object`）好像没什么道理，况且这会带来可怕的重复以及抵消掉静态类型带来的好处。所以让我们再想想如何能够更好地组织 `defaults keys`：

一种解决方案就是在类层级（class level）定义这些 keys：

    
    class Foo {
        struct Keys {
            static let color = DefaultsKey<String>("color")
            static let counter = DefaultsKey<Int>("counter")
        }
        
        func fooify() {
            let color = Defaults[Keys.color]
            let counter = Defaults[Keys.counter]
        }
    }

这似乎已经是 Swift 关于字符型 keys 的标准实践了。

另一种解决方案是利用 Swift 的[隐式成员表达式](http://ericasadun.com/2015/04/21/swift-occams-code-razor/)，此功能的最常见用途是枚举。当一个方法需要一个枚举类型 `Direction` 作为参数，你可以传递 `.Right`。编译器能够推断出真正的参数类型  `Direction.Right`。这里有个冷知识：这种特性（隐式成员表达式）同样适用于方法参数是静态成员类型的情形，例如你可以在一个需要 `CGRect` 类型做参数的方法中，使用 `.zeroRect` 来代替 `CGRect.zeroRect`。

事实上，我们可以通过把键定义为 `DefaultsKey` 上的静态常量来做相同的事情。好啦，差不多了，最后为了消除编译器上的限制，我们需要一个稍微不同的定义：

    
    class DefaultsKeys {}
    class DefaultsKey<ValueType>: DefaultsKeys { ... }
    
    extension DefaultsKeys {
        static let color = DefaultsKey<String>("color")
    }

试一下效果，哇，不错哦！

    
    Defaults[.color] = "red"

是不是很炫酷？站在调用者的角度，现在比之前用传统[字符串的方式](http://c2.com/cgi/wiki?StringlyTyped)显得不再那么[冗余](http://radex.io/swift/methods/)，开发者的代码量*减少*了，读起来也更直观。有没有感到很兴奋，如果我告诉你这一切都是免费获得的，你会不会更开心。

（这项技术的一个缺陷就是没有命名空间机制，在大工程中还是老实采用键结构体 `Keys struct` 的方式更好一些。）

## 可选值难题

在前一版设计的 API 中，我们让所有的 getters 都返回可选值，不过我不大喜欢 `NSUserDefaults` 处理不同类型时缺乏一致性，对于字符串，缺失值将返回 `nil`，但是对于数字和布尔值，你将会得到 `0` 和 `false`。

我很快意识到这种方式缺点是太冗长。大多数时候我们并不关心 `nil` 的情形，只希望在这种情况下得到一个默认值，仅此而已。而每次我们通过下标（subscripts）获得一个可选值后，都要先解封包做判断，再决定返回解包值还是预设的默认值。

Oleg Kokhtenko 针对这个问题提出了[解决方案](https://github.com/radex/SwiftyUserDefaults/pull/19)，除了标准的可选返回值的 `getter` 方法，我们还添加了一组 `getter` 方法，这些方法都以标志性的 `-Value` 结尾，并且结果为 `nil` 时会返回默认值代替，这样类型更加明确：

    
    Defaults["color"].stringValue            // 默认得到""
    Defaults["launchCount"].intValue         // 默认得到0
    Defaults["loggingEnabled"].boolValue     // 默认得到false
    Defaults["lastPaths"].arrayValue         // 默认得到[]
    Defaults["credentials"].dictionaryValue  // 默认得到[:]
    Defaults["hotkey"].dataValue             // 默认得到NSData()

我们可以在静态类型体制下做同样的事情，下面为 optional 和非 optional 类型各提供一个 `subscript` 变体。

    
    extension NSUserDefaults {
        subscript(key: DefaultsKey<NSData?>) -> NSData? {
            get { return dataForKey(key.key) }
            set { setObject(newValue, forKey: key.key) }
        }
    
        subscript(key: DefaultsKey<NSData>) -> NSData {
            get { return dataForKey(key.key) ?? NSData() }
            set { setObject(newValue, forKey: key.key) }
        }
    }

我喜欢这么做，因为这样就不用依赖协定约定（`type` 和 `typeValue`），将空值转换为各种类型的默认值。而是使用已经在 user defaults key 中定义好的类型，剩下的工作就交给编译器吧。

### 更多的类型

我通过添加这些类型的下标来扩大支持的类型范围：`String`，`Int`，`Double`，`Bool`，`NSData`，`[AnyObject]`，`[String: AnyObject]`，`NSString`，`NSArray`，`NSDictionary`（还包含他们的可选变体，注意 `NSDate?`，`NSURL?`，`AnyObject?` 没有对应的非可选部分，因为这些类型的默认值没有意义）。

还要注意一点，字符串（strings）、字典（dictionaries）和数组（arrays）同时存在于 Swift 基本库和 Cocoa Foundation 框架中。而我们优先考虑 Swift 原生类型，但这些类型并不具备他们在 Cocoa 框架中的一些能力，不过如果真正需要，我会让事情简单一些。

提到数组，为什么把我们只限制没有类型化的数组？因为在大多数情况下，`user defaults`  中存储的数组里面的元素都是同一类型的，比如 `String`，`Int`，`NSData`。

因为不能定义泛型下标，我们来创建一对泛型 `helper` 方法：

    
    extension NSUserDefaults {
        func getArray<T>(key: DefaultsKey<[T]>) -> [T] {
            return arrayForKey(key.key) as? [T] ?? []
        }
        
        func getArray<T>(key: DefaultsKey<[T]?>) -> [T]? {
            return arrayForKey(key.key) as? [T]
        }
    }

复制、粘贴，然后参照下面这段代码改写所有我们感兴趣的类型：

    
    extension NSUserDefaults {
        subscript(key: DefaultsKey<[String]?>) -> [String]? {
            get { return getArray(key) }
            set { set(key, newValue) }
        }
    }

现在可以这样调用：

    
    let key = DefaultsKey<[String]>("colors")
    Defaults[key].append("red")
    let red = Defaults[key][0]

我们通过数组下标返回一个 `String`，然后为其添加了一个字符串，整个验证过程发生在了编译期（编译器会对进行的操作进行类型检查），这样做更加安全便捷。

### 归档

`NSUserDefaults` 还有一个缺点是支持的类型并不多，如果我们想存储自定义的类型，通用的解决办法是用 `NSKeyedArchiver` 来序列化你的自定义对象。

接下来我们努力把世界变得更美好一点，类似于 `getArray` 的 helper 方法，我定义了 `archive()` 和 `unarchive()` 的泛型方法，这样我就能很容易地设计一段下标代码来处理各种自定义类型（前提是这些类型遵循 NSCoding 协议）。

    
    extension NSUserDefaults {
        subscript(key: DefaultsKey<NSColor?>) -> NSColor? {
            get { return unarchive(key) }
            set { archive(key, newValue) }
        }
    }
    
    extension DefaultsKeys {
        static let color = DefaultsKey<NSColor?>("color")
    }
    
    Defaults[.color] // => nil
    Defaults[.color] = NSColor.whiteColor()
    Defaults[.color] // => w 1.0, a 1.0
    Defaults[.color]?.whiteComponent // => 1.0

（译者注：`NSColor` 遵循 `NSSecureCoding` 协议，而该协议继承自 `NSCoding`）

看上去并不十分完美，但我们仅用了几行代码就让 `NSUserDefaults` 很好地支持了自定义类型。

### 结果和结论

万事俱备，下面有请我们新的 API 登场：

    
    // 提前定义键名
    extension DefaultsKeys {
        static let username = DefaultsKey<String?>("username")
        static let launchCount = DefaultsKey<Int>("launchCount")
        static let libraries = DefaultsKey<[String]>("libraries")
        static let color = DefaultsKey<NSColor?>("color")
    }
    
    // 使用点语法来获取 user defaults
    Defaults[.username]
    
    // 使用非可选的键来获取默认值而非可选值
    Defaults[.launchCount] // Int, 默认值是0
    
    // 就地更新 value 的值
    Defaults[.launchCount]++
    Defaults[.volume] += 0.1
    Defaults[.strings] += "… can easily be extended!"
    
    // 使用和修改数组类型
    Defaults[.libraries].append("SwiftyUserDefaults")
    Defaults[.libraries][0] += " 2.0"
    
    // 方便地使用序列化的自定义类型
    Defaults[.color] = NSColor.whiteColor()
    Defaults[.color]?.whiteComponent // => 1.0

#### Swift 中使用起来不再痛苦的静态类型

希望你已经看到这种静态类型带来的好处，我们只付出了很小的代价，包括提前定义 `DefaultsKey`，遵从 Swift 的类型系统。而作为回报，编译器向我们献上一份大礼：

+ 编译期检查（键名，读、写的类型检查）
+ 键名（key names）自动补全
+ 类型推断——不必在末尾输入 `.string` 或手动对 `AnyObject` 进行类型转换
+ 我们可以直接操作 user defaults 里面的值，而不需要通过中间步骤或魔法运算符
+ 一致性——抛开怪异的 keys，`Defaults` 看上去更像是一个定义了类型的字典

这里还有一个潜在优势：可以自动享受到今后 Swift 的发展红利。

真正的 Swift 的 API 也利用了静态类型特性，这里不是要教条主义，条条大路通罗马，肯定还有其他的最佳解决方案。但当你决定回到 Objective-C 或 JavaScript 的编码习惯时，重新考虑一下**静态类型**所带来的好处，还要明白一点，这种静态类型不是你前辈所熟悉的*静态类型*，Swift 丰富的类型系统允许你创造出极具表现力和易用的 API，而实现这一切的开销却可以忽略不计。

#### 试试看

一如既往，我将以上所有的探索整理成了一个库，放在 [GitHub](https://github.com/radex/SwiftyUserDefaults/) 上，如果感兴趣，可以采取下面的方式引用：

    ruby
    # with CocoaPods:
    pod 'SwiftyUserDefaults'
    
    # with Carthage:
    github "radex/SwiftyUserDefaults"

同样也鼓励你去试用我改造的另一个 Swifty API（[NSTimer](http://radex.io/swift/nstimer)），关于如何清晰命名请看我这篇文章 [Swifty methods](http://radex.io/swift/methods)。

最后如果你对本文有什么好的想法或建议，请务必联系我 [Twitter](https://twitter.com/radexp) 或提出 [issue](https://github.com/radex/SwiftyUserDefaults/issues)
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。