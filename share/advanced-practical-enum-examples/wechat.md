Swift 中枚举高级用法及实践"

> 作者：Benedikt Terhechte，[原文链接](http://appventure.me/2015/10/17/advanced-practical-enum-examples/)，原文日期：2015-10-17
> 译者：[小锅](http://www.swiftyper.com)，[pmst](http://www.jianshu.com/users/596f2ba91ce9/latest_articles)；校对：[shanks](http://codebuild.me/)；定稿：[shanks](http://codebuild.me/)
  









> 译者注：作为一个走心且有逼格的翻译组，我们对本篇文章中的代码都进行了验证，并且写了将代码分为上下两篇做成了 playground，代码中有详尽的注释。可以到[这个github地址上进行下载](https://github.com/colourful987/Topic_Demo/tree/master/Advanced%20%26%20Practical%20Enum%20usage%20in%20Swift)，这个代码由翻译组的另一位小伙伴 [ppt](http://blog.csdn.net/colouful987) 提供。

本文是一篇详细且具有实战意义的教程，涵盖几乎所有枚举(`Enum`)知识点，为你解答`Swift`中枚举的应用场合以及使用方法。



和[switch语句](http://appventure.me/2015/08/20/swift-pattern-matching-in-detail/)类似，`Swift`中的枚举乍看之下更像是`C`语言中枚举的进阶版本，即允许你定义一种类型，用于表示普通事情中某种用例。不过深入挖掘之后，凭借`Swift`背后特别的设计理念，相比较`C`语言枚举来说其在实际场景中的应用更为广泛。特别是作为强大的工具，`Swift`中的枚举能够清晰表达代码的意图。

本文中，我们将首先了解基础语法和使用枚举的可能性，接着通过实战教你如何以及何时使用枚举。最后我们还会大致了解下`Swift`标准库中枚举是如何被使用的。

正式开始学习之前，先给出枚举的定义。之后我们将回过头再来讨论它。

> 枚举声明的类型是囊括可能状态的有限集，且可以具有附加值。通过内嵌(*nesting*),方法(*method*),关联值(*associated values*)和模式匹配(*pattern matching*),枚举可以分层次地定义任何有组织的数据。

## 深入理解(Diving In)

简要概述如何定义和使用枚举。

### 定义基本的枚举类型(Defining Basic Enums)

试想我们正在开发一款游戏，玩家能够朝四个方向移动。所以喽，玩家的运动轨迹受到了限制。显然，我们能够使用枚举来表述这一情况:

    
    enum Movement{
    	case Left
    	case Right
    	case Top
    	case Bottom
    }

紧接着，你可以使用[多种模式匹配结构](http://appventure.me/2015/08/20/swift-pattern-matching-in-detail/)获取到`Movement`的枚举值，或者按照特定情况执行操作:

    
    let aMovement = Movement.Left
    
    // switch 分情况处理
    switch aMovement{
    case .Left: print("left")
    default:()
    }
    
    // 明确的case情况
    if case .Left = aMovement{
        print("left")
    }
    
    if aMovement == .Left { print("left") }

案例中，我们无须明确指出`enum`的实际名称(即`case Move.Left:print("Left")`)。因为类型检查器能够自动为此进行类型推算。这对于那些**UIKit**以及**AppKit**中错综复杂的枚举是灰常有用的。

### 枚举值(Enum Values)

当然，你可能想要为`enum`中每个`case`分配一个值。这相当有用，比如枚举自身实际与某事或某物挂钩时，往往这些东西又需要使用不同类型来表述。在`C`语言中，你只能为枚举`case`分配整型值，而`Swift`则提供了更多的灵活性。

    
    // 映射到整型
    enum Movement: Int {
        case Left = 0
        case Right = 1
        case Top = 2
        case Bottom = 3
    }
    
    // 同样你可以与字符串一一对应
    enum House: String {
        case Baratheon = "Ours is the Fury"
        case Greyjoy = "We Do Not Sow"
        case Martell = "Unbowed, Unbent, Unbroken"
        case Stark = "Winter is Coming"
        case Tully = "Family, Duty, Honor"
        case Tyrell = "Growing Strong"
    }
    
    // 或者float double都可以(同时注意枚举中的花式unicode)
    enum Constants: Double {
        case π = 3.14159
        case e = 2.71828
        case φ = 1.61803398874
        case λ = 1.30357
    }

对于`String`和`Int`类型来说，你甚至可以忽略为枚举中的`case`赋值，`Swift`编译器也能正常工作。

    
    // Mercury = 1, Venus = 2, ... Neptune = 8
    enum Planet: Int {
        case Mercury = 1, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune
    }
    
    // North = "North", ... West = "West"
    // 译者注: 这个是swift2.0新增语法
    enum CompassPoint: String {
        case North, South, East, West
    }

`Swift`枚举中支持以下四种关联值类型:

* 整型(Integer)
* 浮点数(Float Point)
* 字符串(String)
* 布尔类型(Boolean)

因此你无法[<sup>1<sup>](#c1)为枚举分配诸如`CGPoint`类型的值。

倘若你想要读取枚举的值，可以通过`rawValue`属性来实现:

    
    let bestHouse = House.Stark
    print(bestHouse.rawValue)
    // prints "Winter is coming"

不过某种情形下，你可能想要通过一个已有的`raw value`来创建一个`enum case`。这种情况下，枚举提供了一个指定构造方法:

    
    enum Movement: Int {
        case Left = 0
        case Right = 1
        case Top = 2
        case Bottom = 3
    }
    // 创建一个movement.Right 用例,其raw value值为1
    let rightMovement = Movement(rawValue: 1)

倘若使用`rawValue`构造器，切记它是一个可失败构造器([failable initializer](https://developer.apple.com/library/prerelease/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Declarations.html#//apple_ref/doc/uid/TP40014097-CH34-ID376))。换言之，构造方法返回值为[可选类型值](http://appventure.me/2014/06/13/swift-optionals-made-simple/),因为有时候传入的值可能与任意一个`case`都不匹配。比如`Movement(rawValue:42)`。

如果你想要以底层 C 二进制编码形式呈现某物或某事，使得更具可读性，这是一个非常有用的功能。例如，可以看一下[BSD kqeue library](https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man2/kqueue.2.html)中的**VNode Flags**标志位的编码方式:

    
    enum VNodeFlags : UInt32 {
        case Delete = 0x00000001
        case Write = 0x00000002
        case Extended = 0x00000004
        case Attrib = 0x00000008
        case Link = 0x00000010
        case Rename = 0x00000020
        case Revoke = 0x00000040
        case None = 0x00000080
    }

如此便可以使你的**Delete**或**Write**用例声明一目了然，稍后一旦需要，只需将**raw value**传入 C 函数中即可。

### 嵌套枚举(Nesting Enums)

如果你有特定子类型的需求，可以对`enum`进行嵌套。这样就允许你为实际的`enum`中包含其他明确信息的`enum`。以**RPG**游戏中的每个角色为例，每个角色能够拥有武器，因此所有角色都可以获取同一个武器集合。而游戏中的其他实例则无法获取这些武器(比如食人魔,它们仅使用棍棒)。

    
    enum Character {
      enum Weapon {
        case Bow
        case Sword
        case Lance
        case Dagger
      }
      enum Helmet {
        case Wooden
        case Iron
        case Diamond
      }
      case Thief
      case Warrior
      case Knight
    }

现在，你可以通过层级结构来描述角色允许访问的项目条。

    
    let character = Character.Thief
    let weapon = Character.Weapon.Bow
    let helmet = Character.Helmet.Iron

### 包含枚举(Containing Enums)

同样地，你也能够在`structs`或`classes`中内嵌枚举。接着上面的例子:

    
    struct Character {
       enum CharacterType {
        case Thief
        case Warrior
        case Knight
      }
      enum Weapon {
        case Bow
        case Sword
        case Lance
        case Dagger
      }
      let type: CharacterType
      let weapon: Weapon
    }
    
    let warrior = Character(type: .Warrior, weapon: .Sword)

同样地，这也将有助于我们将相关的信息集中在一个位置。

### 关联值(Associated Value)

关联值是将额外信息附加到`enum case`中的一种极好的方式。打个比方，你正在开发一款交易引擎，可能存在**买**和**卖**两种不同的交易类型。除此之外每手交易还要制定明确的股票名称和交易数量:

#### 简单例程(Simple Example)

    
    enum Trade {
        case Buy
        case Sell
    }
    func trade(tradeType: Trade, stock: String, amount: Int) {}
然而股票的价值和数量显然从属于交易，让他们作为独立的参数显得模棱两可。你可能已经想到要往`struct`中内嵌一个枚举了，不过关联值提供了一种更清爽的解决方案：

    
    enum Trade {
        case Buy(stock: String, amount: Int)
        case Sell(stock: String, amount: Int)
    }
    func trade(type: Trade) {}

#### 模式匹配(Pattern Mathching)

如果你想要访问这些值，[模式匹配](http://appventure.me/2015/08/20/swift-pattern-matching-in-detail/)再次救场:

    
    let trade = Trade.Buy(stock: "APPL", amount: 500)
    if case let Trade.Buy(stock, amount) = trade {
        print("buy \(amount) of \(stock)")
    }

#### 标签(Labels)

关联值不需要附加标签的声明:

    
    enum Trade {
       case Buy(String, Int)
       case Sell(String, Int)
    }
倘若你添加了，那么，每当创建枚举用例时，你都需要将这些标签标示出来。

#### 元组参数(Tuple as Arguments)

更重要的是,`Swift`内部相关信息其实是一个元组,所以你可以像下面这样做:

    
    let tp = (stock: "TSLA", amount: 100)
    let trade = Trade.Sell(tp)
    
    if case let Trade.Sell(stock, amount) = trade {
        print("buy \(amount) of \(stock)")
    }
    // Prints: "buy 100 of TSLA"

语法允许您将元组当作一个简单的数据结构,稍后元组将自动转换到高级类型，就比如`enum case`。想象一个应用程序可以让用户来配置电脑:

    
    typealias Config = (RAM: Int, CPU: String, GPU: String)
    
    // Each of these takes a config and returns an updated config
    func selectRAM(_ config: Config) -> Config {return (RAM: 32, CPU: config.CPU, GPU: config.GPU)}
    func selectCPU(_ config: Config) -> Config {return (RAM: config.RAM, CPU: "3.2GHZ", GPU: config.GPU)}
    func selectGPU(_ config: Config) -> Config {return (RAM: config.RAM, CPU: "3.2GHZ", GPU: "NVidia")}
    
    enum Desktop {
       case Cube(Config)
       case Tower(Config)
       case Rack(Config)
    }
    
    let aTower = Desktop.Tower(selectGPU(selectCPU(selectRAM((0, "", "") as Config))))

配置的每个步骤均通过递交元组到`enum`中进行内容更新。倘若我们从**函数式编程**[<sup>2<sup>](#c2)中获得启发，这将变得更好。

    
    infix operator <^> { associativity left }
    
    func <^>(a: Config, f: (Config) -> Config) -> Config { 
        return f(a)
    }

最后，我们可以将不同配置步骤串联起来。这在配置步骤繁多的情况下相当有用。

    
    let config = (0, "", "") <^> selectRAM  <^> selectCPU <^> selectGPU
    let aCube = Desktop.Cube(config)

#### 使用案例(Use Case Example)

关联值可以以多种方式使用。常言道：一码胜千言, 下面就上几段简单的示例代码，这几段代码没有特定的顺序。

    
    // 拥有不同值的用例
    enum UserAction {
      case OpenURL(url: NSURL)
      case SwitchProcess(processId: UInt32)
      case Restart(time: NSDate?, intoCommandLine: Bool)
    }
    
    // 假设你在实现一个功能强大的编辑器，这个编辑器允许多重选择，
    // 正如 Sublime Text : https://www.youtube.com/watch?v=i2SVJa2EGIw
    enum Selection {
      case None
      case Single(Range<Int>)
      case Multiple([Range<Int>])
    }
    
    // 或者映射不同的标识码
    enum Barcode {
        case UPCA(numberSystem: Int, manufacturer: Int, product: Int, check: Int)
        case QRCode(productCode: String)
    }
    
    // 又或者假设你在封装一个 C 语言库，正如 Kqeue BSD/Darwin 通知系统:
    // https://www.freebsd.org/cgi/man.cgi?query=kqueue&sektion=2
    enum KqueueEvent {
        case UserEvent(identifier: UInt, fflags: [UInt32], data: Int)
        case ReadFD(fd: UInt, data: Int)
        case WriteFD(fd: UInt, data: Int)
        case VnodeFD(fd: UInt, fflags: [UInt32], data: Int)
        case ErrorEvent(code: UInt, message: String)
    }
    
    // 最后, 一个 RPG 游戏中的所有可穿戴装备可以使用一个枚举来进行映射，
    // 可以为一个装备增加重量和持久两个属性
    // 现在可以仅用一行代码来增加一个"钻石"属性，如此一来我们便可以增加几件新的镶嵌钻石的可穿戴装备
    enum Wearable {
        enum Weight: Int {
    	case Light = 1
    	case Mid = 4
    	case Heavy = 10
        }
        enum Armor: Int {
    	case Light = 2
    	case Strong = 8
    	case Heavy = 20
        }
        case Helmet(weight: Weight, armor: Armor)
        case Breastplate(weight: Weight, armor: Armor)
        case Shield(weight: Weight, armor: Armor)
    }
    let woodenHelmet = Wearable.Helmet(weight: .Light, armor: .Light)

### 方法和属性(Methods and properties)

你也可以在`enum`中像这样定义方法:

    
    enum Wearable {
        enum Weight: Int {
            case Light = 1
        }
        enum Armor: Int {
    	    case Light = 2
        }
        case Helmet(weight: Weight, armor: Armor)
            func attributes() -> (weight: Int, armor: Int) {
           switch self {
    	         case .Helmet(let w, let a): return (weight: w.rawValue * 2, armor: w.rawValue * 4)
           }
        }
    }
    let woodenHelmetProps = Wearable.Helmet(weight: .Light, armor: .Light).attributes()
    print (woodenHelmetProps)
    // prints "(2, 4)"

枚举中的方法为每一个`enum case`而“生”。所以倘若想要在特定情况执行特定代码的话，你需要分支处理或采用`switch`语句来明确正确的代码路径。

    
    enum Device { 
        case iPad, iPhone, AppleTV, AppleWatch 
        func introduced() -> String {
           switch self {
    	     case AppleTV: return "\(self) was introduced 2006"
    	     case iPhone: return "\(self) was introduced 2007"
    	     case iPad: return "\(self) was introduced 2010"
    	     case AppleWatch: return "\(self) was introduced 2014"
           }
        }
    }
    print (Device.iPhone.introduced())
    // prints: "iPhone was introduced 2007"

#### 属性(Properties)

尽管增加一个存储属性到枚举中不被允许，但你依然能够创建计算属性。当然，计算属性的内容都是建立在枚举值下或者枚举关联值得到的。

    
    enum Device {
      case iPad, iPhone
      var year: Int {
        switch self {
    	    case iPhone: return 2007
    	    case iPad: return 2010
         }
      }
    }

#### 静态方法(Static Methods)

你也能够为枚举创建一些静态方法(`static methods`)。换言之通过一个非枚举类型来创建一个枚举。在这个示例中,我们需要考虑用户有时将苹果设备叫错的情况(比如AppleWatch叫成iWatch)，需要返回一个合适的名称。

    
    enum Device { 
        case AppleWatch 
        static func fromSlang(term: String) -> Device? {
          if term == "iWatch" {
    	  return .AppleWatch
          }
          return nil
        }
    }
    print (Device.fromSlang("iWatch"))


#### 可变方法(Mutating Methods)

方法可以声明为`mutating`。这样就允许改变隐藏参数`self`的`case`值了[<sup>3<sup>](#c3)。

    
    enum TriStateSwitch {
        case Off, Low, High
        mutating func next() {
    	switch self {
    	case Off:
    	    self = Low
    	case Low:
    	    self = High
    	case High:
    	    self = Off
    	}
        }
    }
    var ovenLight = TriStateSwitch.Low
    ovenLight.next()
    // ovenLight 现在等于.On
    ovenLight.next()
    // ovenLight 现在等于.Off
### 小结(To Recap)

至此，我们已经大致了解了Swift中枚举语法的基本用例。在开始迈向进阶之路之前，让我们重新审视文章开篇给出的定义，看看现在是否变得更清晰了。

>枚举声明的类型是囊括可能状态的有限集，且可以具有附加值。通过内嵌(*nesting*),方法(*method*),关联值(*associated values*)和模式匹配(*pattern matching*),枚举可以分层次地定义任何有组织的数据。

现在我们已经对这个定义更加清晰了。确实，如果我们添加关联值和嵌套，`enum`就看起来就像一个封闭的、简化的`struct`。相比较`struct`，前者优势体现在能够为分类与层次结构编码。

    
    // Struct Example
    struct Point { let x: Int, let y: Int }
    struct Rect { let x: Int, let y: Int, let width: Int, let height: Int }
    
    // Enum Example
    enum GeometricEntity {
       case Point(x: Int, y: Int)
       case Rect(x: Int, y: Int, width: Int, height: Int)
    }

方法和静态方法的添加允许我们为`enum`附加功能，这意味着无须依靠额外函数就能实现[<sup>4<sup>](#c4)。

    
    // C-Like example
    enum Trade {
       case Buy
       case Sell
    }
    func order(trade: Trade)
    
    // Swift Enum example
    enum Trade {
       case Buy
       case Sell
       func order()
    }


## 枚举进阶(Advanced Enum Usage）
### 协议(Protocols)

我已经提及了`structs`和`enums`之间的相似性。除了附加方法的能力之外，`Swift`也允许你在枚举中使用**协议(Protocols)**和**协议扩展(Protocol Extension)**。

`Swift`协议定义一个接口或类型以供其他数据结构来遵循。`enum`当然也不例外。我们先从`Swift`标准库中的一个例子开始.

`CustomStringConvertible`是一个以打印为目的的自定义格式化输出的类型。

    
    protocol CustomStringConvertible {
      var description: String { get }
    }

该协议只有一个要求，即一个只读(`getter`)类型的字符串(`String`类型)。我们可以很容易为`enum`实现这个协议。

    
    enum Trade: CustomStringConvertible {
       case Buy, Sell
       var description: String {
           switch self {
    	   case Buy: return "We're buying something"
    	   case Sell: return "We're selling something"
           }
       }
    }
    
    let action = Trade.Buy
    print("this action is \(action)")
    // prints: this action is We're buying something


一些协议的实现可能需要根据内部状态来相应处理要求。例如定义一个管理银行账号的协议。

    
    protocol AccountCompatible {
      var remainingFunds: Int { get }
      mutating func addFunds(amount: Int) throws
      mutating func removeFunds(amount: Int) throws
    }

你也许会简单地拿`struct`实现这个协议，但是考虑应用的上下文，`enum`是一个更明智的处理方法。不过你无法添加一个存储属性到`enum`中，就像`var remainingFuns:Int`。那么你会如何构造呢？答案灰常简单，你可以使用关联值完美解决:

    
    enum Account {
      case Empty
      case Funds(remaining: Int)
    
      enum Error: ErrorType {
        case Overdraft(amount: Int)
      }
    
      var remainingFunds: Int {
        switch self {
        case Empty: return 0
        case Funds(let remaining): return remaining
        }
      }
    }

为了保持代码清爽，我们可以在`enum`的协议扩展(`protocl extension`)中定义必须的协议函数:

    
    extension Account: AccountCompatible {
    
      mutating func addFunds(amount: Int) throws {
        var newAmount = amount
        if case let .Funds(remaining) = self {
          newAmount += remaining
        }
        if newAmount < 0 {
          throw Error.Overdraft(amount: -newAmount)
        } else if newAmount == 0 {
          self = .Empty
        } else {
          self = .Funds(remaining: newAmount)
        }
      }
    
      mutating func removeFunds(amount: Int) throws {
        try self.addFunds(amount * -1)
      }
    
    }
    var account = Account.Funds(remaining: 20)
    print("add: ", try? account.addFunds(10))
    print ("remove 1: ", try? account.removeFunds(15))
    print ("remove 2: ", try? account.removeFunds(55))
    // prints:
    // : add:  Optional(())
    // : remove 1:  Optional(())
    // : remove 2:  nil

正如你所看见的，我们通过将值存储到`enum cases`中实现了协议所有要求项。如此做法还有一个妙不可言的地方:现在整个代码基础上你只需要一个模式匹配就能测试空账号输入的情况。你不需要关心剩余资金是否等于零。

同时，我们也在**账号(Accout)**中内嵌了一个遵循`ErrorType`协议的枚举，这样我们就可以使用`Swift2.0`语法来进行错误处理了。这里给出更详细的[使用案例](http://appventure.me/2015/10/17/advanced-practical-enum-examples/#errortype)教程。


### 扩展(Extensions)

正如刚才所见，枚举也可以进行扩展。最明显的用例就是将枚举的`case`和`method`分离，这样阅读你的代码能够简单快速地消化掉`enum`内容，紧接着转移到方法定义:

    
    enum Entities {
        case Soldier(x: Int, y: Int)
        case Tank(x: Int, y: Int)
        case Player(x: Int, y: Int)
    }

现在，我们为`enum`扩展方法:

    
    extension Entities {
       mutating func move(dist: CGVector) {}
       mutating func attack() {}
    }

你同样可以通过写一个扩展来遵循一个特定的协议:

    
    extension Entities: CustomStringConvertible {
      var description: String {
        switch self {
           case let .Soldier(x, y): return "\(x), \(y)"
           case let .Tank(x, y): return "\(x), \(y)"
           case let .Player(x, y): return "\(x), \(y)"
        }
      }
    }
### 枚举泛型(Generic Enums)

枚举也支持泛型参数定义。你可以使用它们以适应枚举中的关联值。就拿直接来自`Swift`标准库中的简单例子来说，即`Optional`类型。你主要可能通过以下几种方式使用它:可选链(`optional chaining(?)`)、`if-let`可选绑定、`guard let`、或`switch`，但是从语法角度来说你也可以这么使用`Optional`:

    
    let aValue = Optional<Int>.Some(5)
    let noValue = Optional<Int>.None
    if noValue == Optional.None { print("No value") }

这是`Optional`最直接的用例，并未使用任何语法糖，但是不可否认`Swift`中语法糖的加入使得你的工作更简单。如果你观察上面的实例代码，你恐怕已经猜到`Optional`内部实现是这样的[<sup>5<sup>](#c5):

    
    // Simplified implementation of Swift's Optional
    enum MyOptional<T> {
      case Some(T)
      case None
    }

这里有啥特别呢？注意枚举的关联值采用泛型参数`T`作为自身类型，这样可选类型构造任何你想要的返回值。

枚举可以拥有多个泛型参数。就拿熟知的`Either`类为例，它并非是`Swift`标准库中的一部分，而是实现于众多开源库以及
其他函数式编程语言，比如**Haskell**或**F#**。设计想法是这样的:相比较仅仅返回一个值或没有值(née Optional)，你更期望返回一个成功值或者一些反馈信息(比如错误值)。

    
    // The well-known either type is, of course, an enum that allows you to return either
    // value one (say, a successful value) or value two (say an error) from a function
    enum Either<T1, T2> {
      case Left(T1)
      case Right(T2)
    }
最后，`Swift`中所有在`class`和`struct`中奏效的类型约束，在`enum`中同样适用。

    
    // Totally nonsensical example. A bag that is either full (has an array with contents)
    // or empty.
    enum Bag<T: SequenceType where T.Generator.Element==Equatable> {
      case Empty
      case Full(contents: T)
    }

### 递归 / 间接(Indirect)类型

间接类型是 Swift 2.0 新增的一个类型。 它们允许将枚举中一个 case 的关联值再次定义为枚举。举个例子，假设我们想定义一个文件系统，用来表示文件以及包含文件的目录。如果将*文件*和*目录*定义为枚举的 case，则*目录* case 的关联值应该再包含一个*文件*的数组作为它的关联值。因为这是一个递归的操作，编译器需要对此进行一个特殊的准备。Swift 文档中是这么写的：
> 枚举和 case 可以被标记为间接的(indrect)，这意味它们的关联值是被间接保存的，这允许我们定义递归的数据结构。

所以，如果我们要定义 `FileNode` 的枚举，它应该会是这样的：

    
    enum FileNode {
      case File(name: String)
      indirect case Folder(name: String, files: [FileNode])
    }

此处的 `indrect` 关键字告诉编译器间接地处理这个枚举的 case。也可以对整个枚举类型使用这个关键字。[作为例子，我们来定义一个二叉树](http://airspeedvelocity.net/2015/07/22/a-persistent-tree-using-indirect-enums-in-swift/):

    
    indirect enum Tree<Element: Comparable> {
        case Empty
        case Node(Tree<Element>,Element,Tree<Element>)
    }

这是一个很强大的特性，可以让我们用非常简洁的方式来定义一个有着复杂关联的数据结构。

### 使用自定义类型作为枚举的值

如果我们忽略关联值，则枚举的值就只能是整型，浮点型，字符串和布尔类型。如果想要支持别的类型，则可以通过实现 `StringLiteralConvertible` 协议来完成，这可以让我们通过对字符串的序列化和反序列化来使枚举支持自定义类型。

作为一个例子，假设我们要定义一个枚举来保存不同的 iOS 设备的屏幕尺寸：

    
    enum Devices: CGSize {
       case iPhone3GS = CGSize(width: 320, height: 480)
       case iPhone5 = CGSize(width: 320, height: 568)
       case iPhone6 = CGSize(width: 375, height: 667)
       case iPhone6Plus = CGSize(width: 414, height: 736)
    }

然而，这段代码不能通过编译。因为 CGPoint 并不是一个常量，不能用来定义枚举的值。我们需要为想要支持的自定义类型增加一个扩展，让其实现 `StringLiteralConvertible` 协议。这个协议要求我们实现三个*构造方法*，这三个方法都需要使用一个`String`类型的参数，并且我们需要将这个字符串转换成我们需要的类型(此处是`CGSize`)。

    
    extension CGSize: StringLiteralConvertible {
        public init(stringLiteral value: String) {
    	let size = CGSizeFromString(value)
    	self.init(width: size.width, height: size.height)
        }
    
        public init(extendedGraphemeClusterLiteral value: String) {
    	let size = CGSizeFromString(value)
    	self.init(width: size.width, height: size.height)
        }
    
        public init(unicodeScalarLiteral value: String) {
    	let size = CGSizeFromString(value)
    	self.init(width: size.width, height: size.height)
        }
    }

现在就可以来实现我们需要的枚举了，不过这里有一个缺点：初始化的值必须写成字符串形式，因为这就是我们定义的枚举需要接受的类型(记住，我们实现了 StringLiteralConvertible，因此**String**可以转化成`CGSize`类型)

    
    enum Devices: CGSize {
       case iPhone3GS = "{320, 480}"
       case iPhone5 = "{320, 568}"
       case iPhone6 = "{375, 667}"
       case iPhone6Plus = "{414, 736}"
    }

终于，我们可以使用 CGPoint 类型的枚举了。需要注意的是，当要获取真实的 CGPoint 的值的时候，我们需要访问枚举的是 `rawValue` 属性。

    
    let a = Devices.iPhone5
    let b = a.rawValue
    print("the phone size string is \(a), width is \(b.width), height is \(b.height)")
    // prints : the phone size string is iPhone5, width is 320.0, height is 568.0

使用字符串序列化的形式，会让使用自定义类型的枚举比较困难，然而在某些特定的情况下，这也会给我们增加不少便利(比较使用**NSColor** / **UIColor**的时候)。不仅如此，我们完全可以对自己定义的类型使用这个方法。

### 对枚举的关联值进行比较

在通常情况下，枚举是很容易进行相等性判断的。一个简单的 `enum T { case a, b }` 实现默认支持相等性判断 `T.a == T.b, T.b != T.a`

然而，一旦我们为枚举增加了关联值，Swift 就没有办法正确地为两个枚举进行相等性判断，需要我们自己实现 `==` 运行符。这并不是很困难：

    
    enum Trade {
        case Buy(stock: String, amount: Int)
        case Sell(stock: String, amount: Int)
    }
    func ==(lhs: Trade, rhs: Trade) -> Bool {
       switch (lhs, rhs) {
         case let (.Buy(stock1, amount1), .Buy(stock2, amount2))
    	   where stock1 == stock2 && amount1 == amount2:
    	   return true
         case let (.Sell(stock1, amount1), .Sell(stock2, amount2))
    	   where stock1 == stock2 && amount1 == amount2:
    	   return true
         default: return false
       }
    }

正如我们所见，我们通过 switch 语句对两个枚举的 case 进行判断，并且只有当它们的 case 是匹配的时候(比如 Buy 和 Buy)才对它们的真实关联值进行判断。

### 自定义构造方法

在 **静态方法** 一节当中我们已经提到它们可以作为从不同数据构造枚举的方便形式。在之前的例子里也展示过，对出版社经常误用的苹果设备名返回正确的名字：

    
    enum Device { 
        case AppleWatch 
        static func fromSlang(term: String) -> Device? {
          if term == "iWatch" {
    	  return .AppleWatch
          }
          return nil
        }
    }

我们也可以使用自定义构造方法来替换静态方法。枚举与结构体和类的构造方法最大的不同在于，枚举的构造方法需要将隐式的 `self`  属性设置为正确的 case。

    
    enum Device { 
        case AppleWatch 
        init?(term: String) {
          if term == "iWatch" {
    	  self = .AppleWatch
          }
          return nil
        }
    }

在这个例子中，我们使用了可失败(failable)的构造方法。但是，普通的构造方法也可以工作得很好：

    
    enum NumberCategory {
       case Small
       case Medium
       case Big
       case Huge
       init(number n: Int) {
    	if n < 10000 { self = .Small }
    	else if n < 1000000 { self = .Medium }
    	else if n < 100000000 { self = .Big }
    	else { self = .Huge }
       }
    }
    let aNumber = NumberCategory(number: 100)
    print(aNumber)
    // prints: "Small"

### 对枚举的 case 进行迭代

一个特别经常被问到的问题就是如何对枚举中的 case 进行迭代。可惜的是，枚举并没有遵守`SequenceType`协议，因此没有一个官方的做法来对其进行迭代。取决于枚举的类型，对其进行迭代可能也简单，也有可能很困难。在[StackOverflow](http://stackoverflow.com/questions/24007461/how-to-enumerate-an-enum-with-string-type)上有一个很好的讨论贴。贴子里面讨论到的不同情况太多了，如果只在这里摘取一些会有片面性，而如果将全部情况都列出来，则会太多。

### 对 Objective-C 的支持

基于整型的枚举，如 `enum Bit: Int { case Zero = 0; case One = 1 }` 可以通过 `@objc` 标识来将其桥接到 Objective-C 当中。然而，一旦使用整型之外的类型(如 `String`)或者开始使用**关联值**，我们就无法在 Objective-C 当中使用这些枚举了。

有一个名为[_ObjectiveCBridgeable的隐藏协议](http://nshint.io/blog/2015/10/07/easy-cast-with-_ObjectiveCBridgeable/?utm_campaign=Swift%252BSandbox&utm_medium=email&utm_source=Swift_Sandbox_11)，可以让规范我们以定义合适的方法，如此一来，Swift 便可以正确地将枚举转成 Objective-C 类型，但我猜这个协议被隐藏起来一定是有原因的。然而，从理论上来讲，这个协议还是允许我们将枚举(包括其实枚举值)正确地桥接到 Objective-C 当中。

但是，我们并不一定非要使用上面提到的这个方法。为枚举添加两个方法，使用 `@objc` 定义一个替代类型，如此一来我们便可以自由地将枚举进行转换了，并且这种方式不需要遵守私有协议：

    
    enum Trade {
        case Buy(stock: String, amount: Int)
        case Sell(stock: String, amount: Int)
    }
    
    // 这个类型也可以定义在 Objective-C 的代码中
    @objc class OTrade: NSObject {
        var type: Int
        var stock: String
        var amount: Int
        init(type: Int, stock: String, amount: Int) {
    	self.type = type
    	self.stock = stock
    	self.amount = amount
        }
    }
    
    extension Trade  {
    
        func toObjc() -> OTrade {
    	switch self {
    	case let .Buy(stock, amount):
    	    return OTrade(type: 0, stock: stock, amount: amount)
    	case let .Sell(stock, amount):
    	    return OTrade(type: 1, stock: stock, amount: amount)
    	}
        }
    
        static func fromObjc(source: OTrade) -> Trade? {
    	switch (source.type) {
    	case 0: return Trade.Buy(stock: source.stock, amount: source.amount)
    	case 1: return Trade.Sell(stock: source.stock, amount: source.amount)
    	default: return nil
    	}
        }
    }

这个方法有一个的缺点，我们需要将枚举映射为 Objective-C 中的 `NSObject` 基础类型(我们也可以直接使用 `NSDictionary`)，但是，当我们碰到一些确实**需要**在 Objective-C 当中获取有关联值的枚举时，这是一个可以使用的方法。

### 枚举底层

Erica Sadun 写过一篇很流弊的[关于枚举底层的博客](http://ericasadun.com/2015/07/12/swift-enumerations-or-how-to-annoy-tom/)，涉及到枚举底层的方方面面。在生产代码中绝不应该使用到这些东西，但是学习一下还是相当有趣的。在这里，我准备只提到那篇博客中一条，如果想了解更多，请移步到原文：
> 枚举通常都是一个字节长度。[...]如果你真的很傻很天真，你当然可以定义一个有成百上千个 case 的枚举，在这种情况下，取决于最少所需要的比特数，枚举可能占据两个字节或者更多。

## Swift 标准库中的枚举

在我们准备继续探索枚举在项目中的不同用例之前，先看一下在 Swift 标准库当中是如何使用枚举可能会更诱人，所以现在让我们先来看看。

- [Bit](https://developer.apple.com/library/watchos/documentation/Swift/Reference/Swift_Bit_Enumeration/index.html#//apple_ref/swift/enum/s:OSs3Bit) 这个枚举有两个值，**One** 和 **Zero**。它被作为 `CollectionOfOne<T>` 中的 `Index` 类型。
- [FloatingPointClassification](https://developer.apple.com/library/watchos/documentation/Swift/Reference/Swift_FloatingPointClassification_Enumeration/index.html#//apple_ref/swift/enumelt/FloatingPointClassification/s:FOSs27FloatingPointClassification12SignalingNaNFMS_S_) 这个枚举定义了一系列 IEEE 754 可能的类别，比如 `NegativeInfinity`, `PositiveZero` 或 `SignalingNaN`。
- [Mirror.AncestorRepresentation](https://developer.apple.com/library/watchos/documentation/Swift/Reference/Swift_Mirror-AncestorRepresentation_Enumeration/index.html#//apple_ref/swift/enum/s:OVSs6Mirror22AncestorRepresentation) 和 [Mirror.DisplayStyle](https://developer.apple.com/library/watchos/documentation/Swift/Reference/Swift_Mirror-DisplayStyle_Enumeration/index.html#//apple_ref/swift/enum/s:OVSs6Mirror12DisplayStyle) 这两个枚举被用在 Swift 反射 API 的上下文当中。
- [Optional](https://developer.apple.com/library/watchos/documentation/Swift/Reference/Swift_Optional_Enumeration/index.html#//apple_ref/swift/enum/s:Sq) 这个就不用多说了
- [Process](https://developer.apple.com/library/watchos/documentation/Swift/Reference/Swift_Process_Enumeration/index.html#//apple_ref/swift/enum/s:OSs7Process) 这个枚举包含了当前进程的命令行参数(`Process.argc`, `Process.arguments`)。这是一个相当有趣的枚举类型，因为在 Swift 1.0 当中，它是被作为一个结构体来实现的。

## 实践用例

我们已经在前面几个小节当中看过了许多有用的枚举类型。包括 `Optional`，`Either`, `FileNode` 还有二叉树。然而，还存在很多场合，使用枚举要胜过使用结构体和类。一般来讲，如果问题可以被分解为有限的不同类别，则使用枚举应该就是正确的选择。即使只有两种 case，这也是一个使用枚举的完美场景，正如 Optional 和 Either 类型所展示的。

以下列举了一些枚举类型在实战中的使用示例，可以用来点燃你的创造力。

### 错误处理

说到枚举的实践使用，当然少不了在 Swift 2.0 当中新推出的错误处理。标记为可抛出的函数可以抛出任何遵守了 `ErrorType` 空协议的类型。正如 Swift 官方文档中所写的：
> Swift 的枚举特别适用于构建一组相关的错误状态，可以通过关联值来为其增加额外的附加信息。

作为一个示例，我们来看下流行的[JSON解析框架 Argo](https://github.com/thoughtbot/Argo)。当 JSON 解析失败的时候，它有可能是以下两种主要原因：

1. JSON 数据缺少某些最终模型所需要的键(比如你的模型有一个 `username` 的属性，但是 JSON 中缺少了)
2. 存在类型不匹配，比如说 `username` 需要的是 String 类型，而 JSON 中包含的是 `NSNull`[<sup>6</sup>](#c6)。

除此之外，Argo 还为不包含在上述两个类别中的错误提供了自定义错误。它们的 `ErrorType` 枚举是类似这样的：

    
    enum DecodeError: ErrorType {
      case TypeMismatch(expected: String, actual: String)
      case MissingKey(String)
      case Custom(String)
    }

所有的 case 都有一个关联值用来包含关于错误的附加信息。

一个更加通用的用于完整 HTTP / REST API 错误处理的`ErrorType`应该是类似这样的：

    
    enum APIError : ErrorType {
        // Can't connect to the server (maybe offline?)
        case ConnectionError(error: NSError)
        // The server responded with a non 200 status code
        case ServerError(statusCode: Int, error: NSError)
        // We got no data (0 bytes) back from the server
        case NoDataError
        // The server response can't be converted from JSON to a Dictionary
        case JSONSerializationError(error: ErrorType)
        // The Argo decoding Failed
        case JSONMappingError(converstionError: DecodeError)
    }

这个 `ErrorType` 实现了完整的 REST 程序栈解析有可能出现的错误，包含了所有在解析结构体与类时会出现的错误。

如果你看得够仔细，会发现在`JSONMappingError`中，我们将**Argo**中的`DecodeError`封装到了我们的`APIError`类型当中，因为我们会用 Argo 来作实际的 JSON 解析。

更多关于`ErrorType`以及此种枚举类型的示例可以参看[官方文档](https://developer.apple.com/library/prerelease/ios/documentation/Swift/Conceptual/Swift_Programming_Language/ErrorHandling.html)。

### 观察者模式

在 Swift 当中，有许多方法来构建观察模式。如果使用 `@objc` 兼容标记，则我们可以使用 `NSNotificationCenter` 或者 **KVO**。即使不用这个标记，`didSet`语法也可以很容易地实现简单的观察模式。在这里可以使用枚举，它可以使被观察者的变化更加清晰明了。设想我们要对一个集合进行观察。如果我们稍微思考一下就会发现这只有几种可能的情况：一个或多个项被插入，一个或多个项被删除，一个或多个项被更新。这听起来就是枚举可以完成的工作：

    
    enum Change {
         case Insertion(items: [Item])
         case Deletion(items: [Item])
         case Update(items: [Item])
    }

之后，观察对象就可以使用一个很简洁的方式来获取已经发生的事情的详细信息。这也可以通过为其增加 **oldValue** 和 **newValue** 的简单方法来扩展它的功能。


### 状态码

如果我们正在使用一个外部系统，而这个系统使用了状态码(或者错误码)来传递错误信息，类似 HTTP 状态码，这种情况下枚举就是一种很明显并且很好的方式来对信息进行封装[<sup>7</sup>](#c7) 。

    
    enum HttpError: String {
      case Code400 = "Bad Request"
      case Code401 = "Unauthorized"
      case Code402 = "Payment Required"
      case Code403 = "Forbidden"
      case Code404 = "Not Found"
    }
### 结果类型映射(Map Result Types)

枚举也经常被用于将 JSON 解析后的结果映射成 Swift 的原生类型。这里有一个简短的例子：

    
    enum JSON {
        case JSONString(Swift.String)
        case JSONNumber(Double)
        case JSONObject([String : JSONValue])
        case JSONArray([JSONValue])
        case JSONBool(Bool)
        case JSONNull
    }

类似地，如果我们解析了其它的东西，也可以使用这种方式将解析结果转化我们 Swift 的类型。
 
### UIKit 标识

枚举可以用来将字符串类型的重用标识或者 storyboard 标识映射为类型系统可以进行检查的类型。假设我们有一个拥有很多原型 Cell 的 UITableView：

    
    enum CellType: String {
        case ButtonValueCell = "ButtonValueCell"
        case UnitEditCell = "UnitEditCell"
        case LabelCell = "LabelCell"
        case ResultLabelCell = "ResultLabelCell"
    }

### 单位

单位以及单位转换是另一个使用枚举的绝佳场合。可以将单位及其对应的转换率映射起来，然后添加方法来对单位进行自动的转换。以下是一个相当简单的示例：

    
    enum Liquid: Float {
      case ml = 1.0
      case l = 1000.0
      func convert(amount amount: Float, to: Liquid) -> Float {
          if self.rawValue < to.rawValue {
    	 return (self.rawValue / to.rawValue) * amount
          } else {
    	 return (self.rawValue * to.rawValue) * amount
          }
      }
    }
    // Convert liters to milliliters
    print (Liquid.l.convert(amount: 5, to: Liquid.ml))

另一个示例是货币的转换。以及数学符号(比如角度与弧度)也可以从中受益。

### 游戏

游戏也是枚举中的另一个相当好的用例，屏幕上的大多数实体都属于一个特定种族的类型(敌人，障碍，纹理，...)。相对于本地的 iOS 或者 Mac 应用，游戏更像是一个白板。即开发游戏我们可以使用全新的对象以及全新的关联创造一个全新的世界，而 iOS 或者 OSX 需要使用预定义的 UIButtons，UITableViews，UITableViewCells 或者 NSStackView.

不仅如此，由于枚举可以遵守协议，我们可以利用协议扩展和基于协议的编程为不同为游戏定义的枚举增加功能。这里是一个用来展示这种层级的的简短示例：

    
    enum FlyingBeast { case Dragon, Hippogriff, Gargoyle }
    enum Horde { case Ork, Troll }
    enum Player { case Mage, Warrior, Barbarian }
    enum NPC { case Vendor, Blacksmith }
    enum Element { case Tree, Fence, Stone }
    
    protocol Hurtable {}
    protocol Killable {}
    protocol Flying {}
    protocol Attacking {}
    protocol Obstacle {}
    
    extension FlyingBeast: Hurtable, Killable, Flying, Attacking {}
    extension Horde: Hurtable, Killable, Attacking {}
    extension Player: Hurtable, Obstacle {}
    extension NPC: Hurtable {}
    extension Element: Obstacle {}


### 字符串类型化

在一个稍微大一点的 Xcode 项目中，我们很快就会有一大堆通过字符串来访问的资源。在前面的小节中，我们已经提过重用标识和 storyboard 的标识，但是除了这两样，还存在很多资源：图像，Segues，Nibs，字体以及其它资源。通常情况下，这些资源都可以分成不同的集合。如果是这样的话，一个类型化的字符串会是一个让编译器帮我们进行类型检查的好方法。

    
    enum DetailViewImages: String {
      case Background = "bg1.png"
      case Sidebar = "sbg.png"
      case ActionButton1 = "btn1_1.png"
      case ActionButton2 = "btn2_1.png"
    }

对于 iOS 开发者，[R.swift](https://github.com/mac-cain13/R.swift)这个第三方库可以为以上提到的情况自动生成结构体。但是有些时候你可能需要有更多的控制(或者你可能是一个Mac开发者[<sup>8</sup>](#c8))。


### API 端点

Rest API 是枚举的绝佳用例。它们都是分组的，它们都是有限的 API 集合，并且它们也可能会有附加的查询或者命名的参数，而这可以使用关联值来实现。

这里有个 [Instagram API](https://instagram.com/developer/endpoints/media/) 的简化版：

    
    enum Instagram {
      enum Media {
        case Popular
        case Shortcode(id: String)
        case Search(lat: Float, min_timestamp: Int, lng: Float, max_timestamp: Int, distance: Int)
      }
      enum Users {
        case User(id: String)
        case Feed
        case Recent(id: String)
      }
    }

[Ash Furrow的**Moya**框架](https://github.com/Moya/Moya)就是基本这个思想，使用枚举对 rest 端点进行映射。

### 链表

Airspeed Velocity有一篇[极好的文章](http://airspeedvelocity.net/tag/swift/)说明了如何使用枚举来实现一个链表。那篇文章中的大多数代码都超出了枚举的知识，并涉及到了大量其它有趣的主题[<sup>9</sup>](#c9)，但是，链表最基本的定义是类似这样的(我对其进行了一些简化)：

    
    enum List {
        case End
        indirect case Node(Int, next: List)
    }

每一个节点(Node) case 都指向了下一个 case， 通过使用枚举而非其它类型，我们可以避免使用一个可选的 next 类型以用来表示链表的结束。

Airspeed Velocity 还写过一篇超赞的博客，关于如何使用 Swift 的间接枚举类型来实现红黑树，所以如果你已经阅读过关于链表的博客，你可能想继续阅读[这篇关于红黑树的博客](http://airspeedvelocity.net/2015/07/22/a-persistent-tree-using-indirect-enums-in-swift/)。

### 设置字典(Setting Dictionaries)

这是 Erica Sadun 提出的[非常非常机智的解决方案](http://ericasadun.com/2015/10/19/sets-vs-dictionaries-smackdown-in-swiftlang/?utm_campaign=Swift%252BSandbox&utm_medium=email&utm_source=Swift_Sandbox_12)。简单来讲，就是任何我们需要用一个属性的字典来对一个项进行设置的时候，都应该使用一系列有关联值的枚举来替代。使用这方法，类型检查系统可以确保配置的值都是正确的类型。

[关于更多的细节，以及合适的例子，可以阅读下她的文章](http://ericasadun.com/2015/10/19/sets-vs-dictionaries-smackdown-in-swiftlang/?utm_campaign=Swift%252BSandbox&utm_medium=email&utm_source=Swift_Sandbox_12)。


## 局限

与之前类似，我将会用一系列枚举的局限性来结束本篇文章。

### 提取关联值

David Owens写过一篇[文章](http://owensd.io/2015/09/15/associated-enum-cases-as-types.html)，他觉得当前的关联值提取方式是很笨重的。我墙裂推荐你去看一下他的原文，在这里我对它的要旨进行下说明：为了从一个枚举中获取关联值，我们必须使用模式匹配。然而，关联值就是关联在特定枚举 case 的高效元组。而元组是可以使用更简单的方式来获取它内部值，即 `.keyword 或者 .0`。

    
    // Enums
    enum Ex { case Mode(ab: Int, cd: Int) }
    if case Ex.Mode(let ab, let cd) = Ex.Mode(ab: 4, cd: 5) {
        print(ab)
    }
    // vs tuples:
    let tp = (ab: 4, cd: 5)
    print(tp.ab)

如果你也同样觉得我们应该使用相同的方法来对枚举进行解构(deconstruct)，这里有个 rdar: [rdar://22704262](http://openradar.me/22704262) (译者注：一开始我不明白 rdar 是啥意思，后来我 google 了下，如果你也有兴趣，也可以自己去搜索一下)

### 相等性

拥有关联值的枚举没有遵守 `equatable` 协议。这是一个遗憾，因为它为很多事情增加了不必要的复杂和麻烦。深层的原因可能是因为关联值的底层使用是使用了元组，而元组并没有遵守 `equatable` 协议。然而，对于限定的 case 子集，如果这些关联值的类型都遵守了 `equatable` 类型，我认为编译器应该默认为其生成 `equatable` 扩展。

    
    // Int 和 String 是可判等的, 所以 Mode 应该也是可判等的
    enum Ex { case Mode(ab: Int, cd: String) }
    
    // Swift 应该能够自动生成这个函数
    func == (lhs: Ex.Mode, rhs: Ex.Mode) -> Bool {
        switch (lhs, rhs) {
           case (.Mode(let a, let b), .Mode(let c, let d)):
    	   return a == c && b == d
           default:
    	   return false
        }
    }

### 元组(Tuples)

最大的问题就是对[元组的支持](http://appventure.me/2015/07/19/tuples-swift-advanced-usage-best-practices/)。我喜欢使用元组，它们可以使很多事情变得更简单，但是他们目前还处于无文档状态并且在很多场合都无法使用。在枚举当中，我们无法使用元组作为枚举的值：

    
    enum Devices: (intro: Int, name: String) {
      case iPhone = (intro: 2007, name: "iPhone")
      case AppleTV = (intro: 2006, name: "Apple TV")
      case AppleWatch = (intro: 2014, name: "Apple Watch")
    }

这似乎看起来并不是一个最好的示例，但是我们一旦开始使用枚举，就会经常陷入到需要用到类似上面这个示例的情形中。

### 迭代枚举的所有case

这个我们已经在前面讨论过了。目前还没有一个很好的方法来获得枚举中的所有 case 的集合以使我们可以对其进行迭代。

### 默认关联值

另一个会碰到的事是枚举的关联值总是类型，但是我们却无法为这些类型指定默认值。假设有这样一种情况:

    
    enum Characters {
      case Mage(health: Int = 70, magic: Int = 100, strength: Int = 30)
      case Warrior(health: Int = 100, magic: Int = 0, strength: Int = 100)
      case Neophyte(health: Int = 50, magic: Int = 20, strength: Int = 80)
    }

我们依然可以使用不同的值创建新的 case，但是角色的默认设置依然会被映射。

## 变化

### 10/26/2015

* 增加局限性示例(相等性 & 获取关联值)
* 增加 Erica Sadun 的关联枚举示例

### 10/22/2015

* 合并[来自 #6 @mabidakun](https://github.com/terhechte/appventure-blog/pull/6)的PR
* 增加枚举底层的链接
* 将帐号示例拆分为两个更容易理解的片段。

### 10/21/2015

* 合并[来自 #4 @blixt](https://github.com/terhechte/appventure-blog/pull/4)和[#2 @kandelvijayavolare](https://github.com/terhechte/appventure-blog/pull/2)和[#3 @sriniram](https://github.com/terhechte/appventure-blog/pull/3)以及[#5 @SixFiveSoftware](https://github.com/terhechte/appventure-blog/pull/5)的PR
* 为帐号示例添加调用代码
* 增加 `ErrorType` 示例


## 解释
<a name="c1"></a>

* 1、可以使用一些小技术来达到这个目的，具体的请参照下面的文章内容
<a name="c2"></a>

* 2、为了演示的缘故，这个示例的实现经过的简化。在真实的开发中，应该使用可选类型以及反向顺序的参数。可以参考一下现在十分流行的函数式编程库，如 [Swiftz](https://github.com/typelift/Swiftz) 和 [Dollar](https://github.com/ankurp/Dollar.swift)
<a name="c3"></a>

* 3、这个示例直接采用了[Swift 官方文档的示例](https://developer.apple.com/library/prerelease/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Methods.html#//apple_ref/doc/uid/TP40014097-CH15-ID234)
<a name="c4"></a>

* 4、经常使得他们定义的位置很难被发现
<a name="c5"></a>

* 5、这是一个简化版的，当然，Swift 为我们加了很多的语法糖
<a name="c6"></a>

* 6、如果你在应用中使用过 JSON，应该也曾经碰到过这个问题
<a name="c6"></a>

* 7、顺便一提，不能直接使用数字做为枚举 case 的名称，因此直接使用 400 是不行的
<a name="c8"></a>

* 8、虽然如此，不过支持 Mac 版的 R.swift 好像就快推出了
<a name="c9"></a>

* 9、这句话可以解释为: 打开链接，并开始阅读文章














> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。