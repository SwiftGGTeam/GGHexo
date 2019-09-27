Swift: 带有关联类型的协议是什么样的？"

> 作者：Natasha The Robot，[原文链接](https://www.natashatherobot.com/swift-what-are-protocols-with-associated-types/)，原文日期：2016-07-28
> 译者：jseanj；校对：[saitjr](http://www.saitjr.com)；定稿：[CMB](https://github.com/chenmingbiao)
  









最近我做了一个关于带有关联类型的协议（PATs, Protocols with Associated Types）的[演讲](http://www.slideshare.net/natashatherobot/practical-protocols-with-associated-types)，我本来还觉得观众对这个已经耳熟能详了，但事实却相反。

很多人并不知道 PATs 是什么——这我应该预料到的，因为我自学就用了一段时间。因此我想当面讲解下，尤其是这些东西比较难理解，而且我也没能找到很好的解释。

Gwendolyn Weston 在东京 [try! Swift 大会](http://www.tryswiftnyc.com/)上给出的解释对我很有帮助（[视频在这](https://realm.io/news/tryswift-gwendolyn-weston-type-erasure/)）。因此文中的示例是受她的演讲启发。Pokemon 将会出现...



### 在 PATs 之前

目前我在 Pokemon Go 中是 9 级，我听说（感谢我的私人教练 [@ayanonagon](https://twitter.com/ayanonagon)）所有的 Pokemon 有一些共同的特征，比如攻击能力。

对于从 Objective-C 或者其他面向对象语言迁移过来的人来说，使用一个具有所有共同功能的 Pokemon 子类是吸引人的。由于每一个 Pokemon 具有不同的攻击能力——光、水或者火等等——我们可以在我们的子类中使用泛型。

    
    // 我们必须确保泛型 Power 有初始化方法
    protocol Initializable {
        init()
    }
     
    // Pokemon 子类
    // 每一个 Pokemon 有一个不同的 Power, 
    // 因此 Power 是泛型
    class Pokemon<Power: Initializable> {
        
        func attack() -> Power {
            return Power()
        }
    }

此时，我们有不同的 Power 类型：

    
    struct 🌧: Initializable { // 实现 }
    struct 🌩: Initializable { // 实现 }
    struct 🔥: Initializable { // 实现 }

现在，其他的 Pokemon 可以从我们的 Pokemon 基类继承，然后他们自动的包含了攻击方法！

    
    class Pikachu: Pokemon<🌩> {}
    class Vaporeon: Pokemon<🌧> {}
     
    let pikachu = Pikachu()
    pikachu.attack() // 🌩
     
    let vaporeon = Vaporeon()
    vaporeon.attack() // 🌧

问题是我们使用的是继承。如果你看了 Dave Abrahams 在 WWDC 上的 [Swift 中面向协议编程](https://developer.apple.com/videos/play/wwdc2015/408/)，你现在的脑海里看到的应该是 Crusty 的脸...

使用继承的问题是虽然刚开始的意图是好的，但最终随着意外的发生事情会变得越来越糟（比如 Pokemon Eggs 不能攻击）。为了大家更好的理解，我强烈推荐大家读读 Matthijs Hollemans 的 [Mixins and Traits in Swift 2.0](http://matthijshollemans.com/2015/07/22/mixins-and-traits-in-swift-2/)。

毕竟，就像 Dave Abrahams 所说的，Swift 是一门面向协议的语言，所以我们需要改变面向对象的思维模式。

### 你好，PATs

让我们用 PATs 来代替继承！相比于继承所有东西，我们可以创建一个专注于 Pokemon 攻击能力的协议。记住，由于每一个 Pokemon 有不同的 Power，因此我们需要把它变成泛型。

    
    protocol PowerTrait {
        // 就是这样！关联类型只是协议中表示泛型的一种语法
        associatedtype Power: Initializable
        
        func attack() -> Power
    }
     
    extension PowerTrait {
        // 通过协议扩展，我们现在有一个默认的攻击方法 
        func attack() -> Power {
            return Power()
        }
    }

现在，每一个遵循 PowerTrait 协议的 Pokemon 不必继承就会具有攻击能力了。

    
    struct Pikachu: PowerTrait {
        // 由于我们使用的是默认的攻击方法，就像在继承时我们指定了泛型一样，我们也必须指定关联类型的类型
        // 注意，这仍然被称为 typealias，但是在 Swift 的未来版本中会变成 associatedtype
        associatedtype Power = 🌩
    }
    let pikachu = Pikachu()
    pikachu.attack() //🌩
     
    struct Vaporeon: PowerTrait {
        // 当 attack 方法被重写后，
        // 基于方法标识，🌧 会被推断为关联类型
        func attack() -> 🌧 {
            // 自定义的攻击逻辑
            return 🌧()
        }
    }
    let vaporeon = Vaporeon()
    vaporeon.attack() //🌧

### 总结

就是这样！带有关联类型的协议对于支持泛型的协议是一个新奇的术语。通过使用 PATs 这样强有力的工具我们获得了优雅的组合而不是糟糕的继承。

为了更多的了解 PATs 的限制以及更深入的学习，我强烈推荐 Alexis Gallagher 的[演讲](https://www.youtube.com/watch?v=XWoNjiSPqI8)。

玩得愉快。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。