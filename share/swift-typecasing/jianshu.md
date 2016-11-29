Swift：类型转换"

> 作者：Andyy Hope，[原文链接](https://medium.com/swift-programming/swift-typecasing-3cd156c323e#.pr49wtu54)，原文日期：2016-08-17
> 译者：[Cwift](http://weibo.com/277195544)；校对：[冬瓜](http://www.desgard.com/)；定稿：[CMB](https://github.com/chenmingbiao)
  









每隔一段时间，你都会遇到一些像独角兽一般前沿的情况，迫使你挑战你在当前的时代与领域内所积累的一切知识。而就在刚才我成为了这种情况的受害者。

> 在汉语中，“危机”一词由两个字符组成，
一个代表危险，另一个代表机会。
—  约翰·肯尼迪

援引自五十年代末最知名的美国人之一，三十五年后另一个美国人延续了这个话题：

> Crisi-tunity! 
— 荷马·辛普森

（译者注：分别截取了英文单词 crisis（危险）的前半部分和 opportunity（机会）的后半部分）



## 危险

之前我有一个机会对我负责的应用中的一个 API 的响应进行回顾、重新建模以及代码重构，它接受一个 JSON 类型的数据结构作为参数，其中包含有一个数组类型，混合存储了不同类型的模型。混合存储的原因是这些模型要在一个 `UITableView` 中的同一个 `section` 中按照时间顺序展示。这就使得把数据保存在两个单独的数组中然后再组合的方案行不通。
为了简化这个问题，我模拟了一个假的但却更有趣的 API 响应来展示这个难题：

    "characters" : [
        {
            type: "hero",
            name: "Jake",
            power: "Shapeshift"
        },
        {
            type: "hero",
            name: "Finn",
            power: "Grass sword"
        },
        {
            type: "princess",
            name: "Lumpy Space Princess",
            kingdom: "Lumpy Space"
        },
        {
            type: "civilian",
            name: "BMO"
        },
        {
            type: "princess",
            name: "Princess Bubblegum",
            kingdom: "Candy"
        }
    ]

如你所见，这些对象在某些方面是相似的，但是又包含了一些其他对象没有的属性。让我们来看看一些可能的解决方案。

## 类和继承

    class Character {
        type: String
        name: String
    }
    class Hero : Character {
        power: String
    }
    class Princess : Character {
        kingdom: String
    }
    class Civilian : Character { 
    }
    ...
    struct Model {
        characters: [Character]
    }

这是一个完全有效的方案，但是用起来会令人感到沮丧，因为每当我们需要访问那些模型特有的属性时，我们都不得不进行类型检查并且把对象转换成特定的类型。

    
    // 类型检测
    if model.characters[indexPath.row] is Hero {
        print(model.characters[indexPath.row].name)
    }
    // 类型检测及转换
    if let hero = model.characters[indexPath.row] as? Hero {
        print(hero.power)
    }

## 结构体与协议

    
    protocol Character {
        var type: String { get set }
        var name: String { get set }
    }
    struct Hero : Character {
        power: String
    }
    struct Princess : Character {
        kingdom: String
    }
    struct Civilian : Character { 
    }
    ...
    struct Model {
        characters: [Character]
    }

因为使用了结构体，所以可以从系统层面优化性能，但是使用结构体仍旧与使用超类 *非常* 相似。因为我们没有使用协议的任何优势，目前的情况确实也没有什么能利用上的，为了访问类型的特定属性我们仍需有条件地进行类型判断和类型转换。

    
    // Type checking
    if model.characters[indexPath.row] is Hero {
        print(model.characters[indexPath.row].name)
    }
    // Type checking and Typecasting
    if let hero = model.characters[indexPath.row] as? Hero {
        print(hero.power)
    }

## 类型转换

现在你可能认为我非常鄙视类型转换，但是我没有。只不过在 *这种* 情况中，类型转换有可能向我们的代码中引入意料之外的副作用。如果向 API 中引入新的**类型**呢？依照我们对响应的解析，它可能什么都不做，也可能做一些事情。当我们编写代码时，我们应该保证代码总是有意义的，因为 Swift的设计原则是安全性优于其他考虑。

    {
        type: "king"
        name: "Ice King"
        power: "Frost"
    }

## 机会

我们现在面对的情况是：常规的尝试最终得到了相同的结果，所以我们被迫在知识的集合之外进行思考，那么不妨让想法大胆一点或者转换一下……*不同的思路* ？
如何创建一个强类型的对象数组，并且访问它们的属性时不需要类型转换？

## 枚举

    enum Character {
        case hero, princess, civilian
    }

因为一个 `switch` 语句必须是完备的，所以使用枚举可以有效地清除代码中的副作用。不过只有枚举还不够，我们需要再进一步。

## 关联类型

    enum Character {
        case hero(Hero) 
        case princess(Princess)
        case civilian(Civilian)
    }
    ...
    switch characters[indexPath.row] {
        case .hero(let hero):
            print(hero.power)
        case .princess(let princess):
            print(princess.kingdom)
        case .civilian(let civilian):
            print(civilian.name)
    }

再见了，类型转换...你好，类型转换™®©！
现在我们消除了那些只有所有类型转换都失败时才会暴露的潜在问题，实施了严格的类型验证，这会引导我们写出有意料之中的代码。

## 原始值

    
    enum Character : String { // Error
        case hero(Hero) 
        case princess(Princess)
        case civilian(Civilian)
    }

你可能已经注意到了，上例中的 `Character` 枚举不能遵守 `RawRepresentable` 协议，这是因为一个枚举在拥有关联类型的同时不能再遵守 `RawRepresentable` 协议，两者是互斥的。

## 初始化

    
    init

所以如果我们不能通过原始值初始化，我们只能定义自己的构造器，因为原本的原始值初始化方式全部是由 `RawRepresentable`  协议来完成的，它提供了一个构造器以及一个供我们访问的 `rawValue`。

## 枚举类型

    
    enum Character {
        private enum Type : String {
            case hero, princess, civilian
            static let key = "type"
        }
    }

一个枚举，在另一个枚举内部...这是一个枚举嵌套。

> 我们需要更深入...
哇，嗯，好吧谢谢再见

（译者注：原文用了一个诙谐的组合词 kthxbai 表示 OK, thank you, goodbye）

在我们使用构造器之前必须预设类型，最好的办法是使用枚举，因为当我们尝试初始化一个对象时，如果出现传入的 `rawValue` 不匹配枚举的任何一个 `case` 的情况，我们需要让本次初始化过程失败。用我们的 JSON 数据格式为例，它有 `key` 关键字来校验类型，但是不必每次都使用这个关键字。在 JSON 对象中你只需要一个唯一的属性用来校验你想要建模的类型即可。

## 允许失败的构造器

如果 `Type` 枚举使用 `rawValue` 的初始化方式失败了，那么会引起 `Character` 对象的初始化失败。我们将为关联类型中的每一个成员定义一个相似的允许失败的构造器，因为 Swift 的编译器不允许我们使用一个没有值的枚举对象，除非该值被声明为可选型。

    
    // 枚举字符
    init?(json: [String : AnyObject]) {
        guard let 
            string = json[Type.key] as? String,
            type = Type(rawValue: string)
            else { return nil }
        switch type {
            case .hero:
                guard let hero = Hero(json: json) 
                else { return nil }
                
                self = .hero(hero)
     
            case .princess:
                guard let princess = Princess(json: json) 
                else { return nil }
                self = .princess(princess)      
            case .civilian:
                guard let civilian = Civilian(json: json) 
                else { return nil }
                self = .civilian(civilian)
        }
    }

## 解析

    
    // 初始化
    if let characters = json["characters"] as? [[String : AnyObject]] {
        self.characters = characters.flatMap { Character(json: $0) }
    }

当我们解析 JSON 数据的时候，因为 `Character` 枚举使用了允许失败的构造器，必须删除数组中的 `nil` 值，所以这里使用了 `flatMap` 方法，这样我们的数组就只包含那些非空的值了。

## 类型转换

    
    switch model.characters[indexPath.row] {
        case .hero(let hero):
            print(hero.power)
        
        case .princess(let princess):
            print(princess.kingdom)
        
        case .civilian(let civilian):
            print(civilian.name)
    }

现在你已经掌握这个技巧了，我们让自己的代码风格从意料之外的变成了意料之中的，并且在这个过程中学到了新的东西。在此之前，我们还不得不使用由 `Any`、`AnyObject` 或者其他一些通用的可继承或者可组合的模型所组成的数组，在使用这样的数组前需要进行类型检查和类型转换。

## 福利：使用模糊匹配进行类型转换

    
    if case

假设我们有一个函数需要传入一个参数值，该参数是 `Character ` 类型的，我们只关心在某一个特定的情况下的处理方案。在这种情况下使用 `switch` 可能被视为过度使用，因为相关的语法很多并且需要处理所有其他的情况：

    
    func printPower(character: Character) {
        switch character {
            case .hero(let hero):
                print(hero.power)
            default: 
                break
    }

我们可以使用模式匹配作为替代，并通过使用 `if` 或 `guard` 语句缩短我们的代码，使其更加简洁：

    
    func printPower(character: Character) {
        if case .hero(let hero) = character {
            print(hero.power)
        }
    }

像往常一样，我在 GitHub 上为你提供了一个 [playgrounds](https://github.com/andyyhope/Blog_Typecasing)，同时，如果你手边没有 Xcode 的话，请查阅这个 [Gist](https://gist.github.com/andyyhope/e6ac7e77858515fb731b13545aa90992)。
如果你喜欢今天阅读的内容，你可以查看我的其他文章，如果你打算在自己的项目中使用这种方式，请给我发一条 tweet，或者在 [Twitter](https://twitter.com/AndyyHope) 上关注我，这会让我感到很开心。

另外，九月份的时候我会在 [try! Swift NYC](http://www.tryswiftnyc.com) 上发言，到时候会有一帮非常了不起的家伙们到场。非常希望能在那看到你，如果你看到我，记得来打个招呼！

## 公告

我是一个在 Swift 方面比较沉闷的人，但是社区是一个精彩的地方，我真的想为社区的成长贡献力量。我已经决定 2 月 23、24 日在墨尔本举办一个会议，我称之为 **Playgrounds**。另外，我们有一个 CFP 开放到 11 月 4 日，所以下手要快了！

详情参见 [www.PlaygroundsCon.com ](http://www.playgroundscon.com)，或者在 Twitter 上关注我们：[@PlaygroundsCon](https://twitter.com/playgroundscon)。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。