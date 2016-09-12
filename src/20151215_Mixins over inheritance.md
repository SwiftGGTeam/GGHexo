title: "Mixins 比继承更好"
date: 2015-12-15 10:30:00
tags: [Swift 进阶]
categories: [Crunchy Development]
permalink: mixins-over-inheritance

---
原文链接=http://alisoftware.github.io/swift/protocol/2015/11/08/mixins-over-inheritance/
作者=Olivier Halligon
原文日期=2015-11-08
译者=ray16897188
校对=Cee
定稿=千叶知风

<!--此处开始正文-->

译者注：[Mixin](https://en.wikipedia.org/wiki/Mixin) 和 [Trait](https://en.wikipedia.org/wiki/Trait_\(computer_programming\) 是面向对象编程语言中的术语，本文中作者并未明确指出两者之间的区别。这两个单词在本译文中也不做翻译。

从面向对象的编程语言的角度来说，继承（Inheritence）总被用来在多个类之间共享代码。但这并不总是一个最佳的解决方案，而且它本身还有些问题。在今天写的这篇文章中，我们会看到 Swift 中的协议扩展（Protocol Extensions），并将其以「Mixins」的形式去使用是怎样解决这个问题的。

<!--more-->

> 你可以从这里下载[包含本篇文章所有代码的 Swift Playground](http://alisoftware.github.io/assets/Mixins.playground.zip)。

### 继承本身存在的问题

假设你有个 app，里面有很多包含相同行为的 `UIViewController` 类，例如它们都有汉堡菜单。你当然不想在 app 中的每一个 View Controller 里都反复实现这个汉堡菜单的逻辑（例如设置 `leftBarButtonItem` 按钮，点击这个按钮时打开或者关闭这个菜单，等等）。

解决方案很简单，你只需要创建一个负责实现所有特定行为、而且是 `UIViewController` 的子类 `CommonViewController`。然后让你所有的 ViewController 都直接继承 `CommonViewController` 而不是 `UIViewController` 就可以了，没错吧？通过使用这种方式，这些类都继承了父类的方法，且具有了相同的行为，你也不用每次重复实现这些东西了。

```swift
class CommonViewController: UIViewController {
  func setupBurgerMenu() { … }
  func onBurgerMenuTapped() { … }
  var burgerMenuIsOpen: Bool {
    didSet { … }
  }
}

class MyViewController: CommonViewController {
  func viewDidLoad() {
    super.viewDidLoad()
    setupBurgerMenu()
  }
}
```

但在随后的开发阶段，你会意识到自己需要一个 `UITableViewController` 或者一个 `UICollectionViewController`……晕死，`CommonViewController` 不能用了，因为它是继承自 `UIViewController` 而不是 `UITableViewController`！

你会怎么做，是实现和 `CommonViewController` 一样的事情却继承于 `UITableViewController` 的 `CommonTableViewController` 吗？这会产生很多重复的代码，而且是个十分糟糕的设计哦。

### 组合（Composition）是救命稻草

诚然，解决这个问题，有句具有代表性并且正确的话是这么说的：

> 多用组合，少用继承。

这意味着我们不使用继承的方式，而是让我们的 `UIViewController` 包含一些提供相应行为的内部类（Inner class）。

在这个例子中，我们可以假定 `BurgerMenuManager` 类能提供创建汉堡菜单图标、以及与这些图标交互逻辑的所有必要的方法。那些各式各样的 `UIViewController` 就会有一个 `BurgerMenuManager` 类型的*属性*，可以用来与汉堡餐单做交互。

```swift
class BurgerMenuManager {
  func setupBurgerMenu() { … }
  func onBurgerMenuTapped() { burgerMenuIsOpen = !burgerMenuisOpen }
  func burgerMenuIsOpen: Bool { didSet { … } }
}

class MyViewController: UIViewController {
  var menuManager: BurgerMenuManager()
  func viewDidLoad() {
    super.viewDidLoad()
    menuManager.setupBurgerMenu()
  }
}

class MyOtherViewController: UITableViewController {
  var menuManager: BurgerMenuManager()
  func viewDidLoad() {
    super.viewDidLoad()
    menuManager.setupBurgerMenu()
  }  
}
```

然而你能看出来这种解决方案会变得很臃肿。每次你都得去明确引用那个中间对象 `menuManager`。
 
### 多继承（Multiple inheritance）

继承的另一个问题就是很多面向对象的编程语言都不支持*多继承*（这儿有个很好的解释，是关于[菱形缺陷（Diamond problem）](https://en.wikipedia.org/wiki/Multiple_inheritance#The_diamond_problem)的）。

这就意味着一个类不能继承自多个父类。

假如说你要创建一些科幻小说中的人物的对象模型。显然，你得展现出 `DocEmmettBrown`，`DoctorWho`，`TimeLord`，`IronMan` 还有 `Superman` 的能力……这些角色的相互关系是什么？有些能时间旅行，有些能空间穿越，还有些两种能力都会；有些能飞，而有些不能飞；有些是人类，而有些不是……

`IronMan` 和 `Superman` 这个两个类都能飞，于是我们就会设想有个 `Flyer` 类能提供一个实现 `fly()` 的方法。但是 `IronMan` 和 `DocEmmettBrown` 都是人类，我们还会设想要有个 `Human` 父类；而 `Superman` 和 `TimeLord` 又得是 `Alien` 的子类。哦，等会儿…… 那 `IronMan` 得同时继承 `Flyer` 和 `Human` 两个类吗？这在 Swift 中是不可能的实现的（在很多其他的面向对象的语言中也不能这么实现）。

我们应该从所有父类中选择出符合子类属性最好的一个么？但是假如我们让 `IronMan` 继承 `Human`，那么怎么去实现 `fly()` 这个方法？很显然我们不能在 `Human` 这个类中实现，因为并不是每个人都会飞，但是 `Superman` 却需要这个方法，然而我们并不想重复写两次。

所以，我们在这里会使用组合（Composition）方法，让 `var flyingEngine: Flyer` 成为 `Superman` 类中的一个属性。

但是调用时你必须写成 `superman.flyingEngine.fly()` 而不是优雅地写成 `superman.fly()`。

### Mixins & Traits

![生生不息，Mixin 繁荣](/img/articles/mixins-over-inheritance/12401450145416.541825)

Mixins 和 Traits 的概念<sup id="fnref1"><a href="#fn1" rel="footnote">1</a></sup>由此引入。
- 通过继承，你定义你的类是什么。例如每条 `Dog` 都*是*一个 `Animal`。
- 通过 Traits，你定义你的类*能做什么*。例如每个 `Animal` 都*能* `eat()`，但是人类也可以吃，而且[异世奇人（Doctor Who）也能吃鱼条和蛋挞](https://www.youtube.com/watch?v=Oo2RKAHu-kI)，甚至即使是位 Gallifreyan（既不是人类也不是动物）。

使用 Traits，重要的不是「是什么」，而是能「做什么」。

> 继承描述了一个对象是什么，而 Traits 描述了这个对象能做什么。

最棒的事情就是一个类可以选用多个 `Traits` 来做多个事情，而这个类还只是一种事物（只从一个父类继承）。

那么如何应用到 Swift 中呢？

### 有默认实现的协议

Swift 2.0 中定义一个`协议（Protocol）`的时候，还可以使用这个协议的`扩展（Extension）`给它的部分或是所有的方法做默认实现。看上去是这样的：

```swift
protocol Flyer {
  func fly()
}

extension Flyer {
  func fly() {
    print("I believe I can flyyyyy ♬")
  }
}
```

有了上面的代码，当你创建一个遵从 `Flyer` 协议的类或者是结构体时，就能很顺利地获得 `fly()` 方法！

这只是一个*默认的实现方式*。因此你可以在需要的时候不受约束地重新定义这个方法；如果不重新定义的话，会使用你默认的那个方法。

```swift 
class SuperMan: Flyer {
  // 这里我们没有实现 fly() 方法，因此能够听到 Clark 唱歌
}

class IronMan: Flyer {
  // 如果需要我们也可以给出单独的实现
  func fly() {
    thrusters.start()
  }
}  
```

对于很多事情来说，协议的默认实现这个特性非常的有用。其中一种自然就是如你所想的那样，把「Traits」概念引入到了 Swift 中。

### 一种身份，多种能力

Traits 很赞的一点就是它们并不依赖于使用到它们的对象本身的身份。Traits 并不关心类是什么，亦或是类是从哪里继承的：Traits 仅仅在类上定义了一些函数。

这就解决了我们的问题：异世奇人（Doctor Who）可以既是一位时间旅行者，同时还是一个外星人；而爱默·布朗博士（Dr Emmett Brown）既是一位时间旅行者，同时还属于人类；钢铁侠（Iron Man）是一个能飞的人，而超人（Superman）是一个能飞的外星人。

> 你是什么并不限制你能够做什么

现在我们利用 Traits 的优点来实现一下我们的模板类。

首先定义不同的 Traits：

```swift
protocol Flyer {
  func fly()
}
protocol TimeTraveler {
  var currentDate: NSDate { get set }
  mutating func travelTo(date: NSDate)
}
```

随后给它们一些默认的实现：

```swift
extension Flyer {
  func fly() {
    print("I believe I can flyyyyy ♬")
  }
}

extension TimeTraveler {
  mutating func travelTo(date: NSDate) {
    currentDate = date
  }
}
```

在这点上，我们还是用继承去定义我们英雄角色的身份（他们是什么），先定义一些父类：

```swift
class Character {
  var name: String
  init(name: String) {
    self.name = name
  }
}

class Human: Character {
  var countryOfOrigin: String?
  init(name: String, countryOfOrigin: String? = nil) {
    self.countryOfOrigin = countryOfOrigin
    super.init(name: name)
  }
}

class Alien: Character {
  let species: String
  init(name: String, species: String) {
    self.species = species
    super.init(name: name)
  }
}
```

现在我们就能通过他们的身份（通过继承）和能力（Traits/协议遵循）来定义英雄角色了：

```swift
class TimeLord: Alien, TimeTraveler {
  var currentDate = NSDate()
  init() {
    super.init(name: "I'm the Doctor", species: "Gallifreyan")
  }
}

class DocEmmettBrown: Human, TimeTraveler {
  var currentDate = NSDate()
  init() {
    super.init(name: "Emmett Brown", countryOfOrigin: "USA")
  }
}

class Superman: Alien, Flyer {
  init() {
    super.init(name: "Clark Kent", species: "Kryptonian")
  }
}

class IronMan: Human, Flyer {
  init() {
    super.init(name: "Tony Stark", countryOfOrigin: "USA")
  }
}
```

现在 `Superman` 和 `IronMan` 都使用了相同的 `fly()` 实现，即使他们分别继承自不同的父类（一个继承自 `Alien`，另一个继承自 `Human`）。而且这两位博士都知道怎么做时间旅行了，即使一个是人类，另外一个来自 Gallifrey 星。

```swift
let tony = IronMan()
tony.fly() // 输出 "I believe I can flyyyyy ♬"
tony.name  // 返回 "Tony Stark"

let clark = Superman()
clark.fly() // 输出 "I believe I can flyyyyy ♬"
clark.species  // 返回 "Kryptonian"

var docBrown = DocEmmettBrown()
docBrown.travelTo(NSDate(timeIntervalSince1970: 499161600))
docBrown.name // "Emmett Brown"
docBrown.countryOfOrigin // "USA"
docBrown.currentDate // Oct 26, 1985, 9:00 AM

var doctorWho = TimeLord()
doctorWho.travelTo(NSDate(timeIntervalSince1970: 1303484520))
doctorWho.species // "Gallifreyan"
doctorWho.currentDate // Apr 22, 2011, 5:02 PM
```

### 时空大冒险

现在我们引入一个新的空间穿越的能力/trait：

```swift
protocol SpaceTraveler {
  func travelTo(location: String)
}
```

并给它一个默认的实现：

```swift
extension SpaceTraveler {
  func travelTo(location: String) {
    print("Let's go to \(location)!")
  }
}
```

我们可以使用 Swift 的`扩展（Extension）`方式**让现有的一个类遵循一个协议**，把这些能力加到我们定义的角色身上去。如果忽略掉钢铁侠之前跑到纽约城上面随后短暂飞到太空中去的那次情景，那只有博士和超人是真正能做空间穿越的：

```swift
extension TimeLord: SpaceTraveler {}
extension Superman: SpaceTraveler {}
```

![天哪！](/img/articles/mixins-over-inheritance/great-scott.gif1450145417.1893744)

没错，这就是给已有类添加能力/trait 仅需的步骤！就这样，他们可以 `travelTo()` 任何的地方了！很简洁，是吧？

```swift
doctorWho.travelTo("Trenzalore") // prints "Let's go to Trenzalore!"
```

### 邀请更多的人来参加这场聚会！

现在我们再让更多的人加入进来吧：

```swift
// 来吧，Pond！
let amy = Human(name: "Amelia Pond", countryOfOrigin: "UK")
// 该死，她是一个时间和空间旅行者，但是却不是 TimeLord！

class Astraunaut: Human, SpaceTraveler {}
let neilArmstrong = Astraunaut(name: "Neil Armstrong", countryOfOrigin: "USA")
let laika = Astraunaut(name: "Laïka", countryOfOrigin: "Russia")
// 等等，Leïka 是一只狗，不是吗？

class MilleniumFalconPilot: Human, SpaceTraveler {}
let hanSolo = MilleniumFalconPilot(name: "Han Solo")
let chewbacca = MilleniumFalconPilot(name: "Chewie")
// 等等，MilleniumFalconPilot 不该定义成「人类」吧！

class Spock: Alien, SpaceTraveler {
  init() {
    super.init(name: "Spock", species: "Vulcan")
    // 并不是 100% 正确
  }
}
```
Huston，我们有麻烦了（译注：原文 "Huston, we have a problem here"，是星际迷航中的梗）。Laika 不是一个人，Chewie 也不是，Spock 算半个人、半个瓦肯（Vulcan）人，所以上面的代码定义错的离谱！

你看出来什么问题了么？我们又一次被继承摆了一道，理所应当地认为 `Human` 和 `Alien `是身份。在这里一些类必须属于某种类型，或是必须继承自某个父类，而实际情况中不总是这样，尤其对科幻故事来说。

这也是为什么要在 Swift 中使用协议，以及协议的默认扩展。这能够帮助我们把因使用继承而强加到类上的这些限制移除。

如果 `Human` 和 `Alien` 不是`类`而是`协议`，那就会有很多的好处：
- 我们可以定义一个 `MilleniumFalconPilot` 类型，不必让它是一个 `Human` ，这样就可以让 Chewie 驾驶它了；
- 我们可以把 Laïka 定义成一个 `Astronaut`，即使她不是人类；
- 我们可以将 `Spock` 定义成 `Human` 和 `Alien` 的结合体；
- 我们甚至可以在这个例子中完全摒弃继承，并将我们的类型从`类（Classes）`转换成`结构体（Structs）`。`结构体`不支持继承，但可以遵循你想要遵循的协议，想遵循多少协议就能遵循多少协议！

### 无处不在的协议！
因此，我们的一个解决方案是彻底弃用继承，将所有的东西都变成协议。毕竟我们不在乎我们的角色*是什么*，能够定义英雄本身的是他们拥有的*能力*！

![终结掉继承！](/img/articles/mixins-over-inheritance/12401450145417.8855546)

我在这里附上了一个[可下载的 Swift Playground 文件](http://alisoftware.github.io/assets/Mixins.playground.zip)，包含这篇文章里的所有代码，并在 Playground 的第二页放上了一个全部用协议和结构体的解决方案，完全不用继承。快去看看吧！

这当然并不意味着你必须不惜一切代价放弃对继承的使用（别听那个 Dalek 讲太多，机器人毕竟没感情的😉）。继承依然有用，而且依然有意义——很符合逻辑的一个说法就是 `UILabel` 是 `UIView` 的一个*子类*。但我们提供的方法能让你能感受到 Mixins 和协议带给你的不同体验。

### 小结

实践 Swift 的时候，你会意识到它实质上是一个面向协议的语言（Protocols-Oriented language），而且在 Swift 中使用协议和在 Objective-C 中使用相比更加常见和有效。毕竟，那些类似于 `Equatable`，`CustomStringConvertible` 的协议以及 Swift 标准库中其它所有以 `-able` 结尾的协议都可以被看做是 Mixins！

有了 Swift 的协议和协议的默认实现，你就能实现 Mixins 和 Traits，而且你还可以实现类似于抽象类<sup id="fnref2"><a href="#fn2" rel="footnote">2</a></sup>以及更多的一些东西，这让你的代码变得更加灵活。

Mixins 和 Traits 的方式可以让你描述你的类型**能够做什么**，而不是描述**它们是什么**。更重要的是，它们能够为你的类型增加各种能力。这就像购物那样，**无论你的类是从哪个父类继承的（如果有），你都能为它们选择你想要它们具有的那些能力**。

回到第一个例子，你可以创建一个 `BurgerMenuManager 协议`且该协议有一个默认实现，然后可以简单地将 View Controllers（不论是 `UIViewController`，`UITableViewController` 还是其他的类）都遵循这个协议，它们都能自动获得 `BurgerMenuManager` 所具有的能力和特性，你也根本不用去为父类 `UIViewController` 操心！

![我不想离开](/img/articles/mixins-over-inheritance/i-dont-wanna-go.gif1450145418.0677123)

关于协议扩展还有很多要说的，我还想在文章中继续告诉你关于它更多的事情，因为它能够通过很多方式提高你的代码质量。嘿，但是，这篇文章已经挺长的了，同时也为以后的博客文章留一些空间吧，希望你到时还会再来看！

与此同时，生生不息，繁荣昌盛，杰罗尼莫（译注：跳伞时老兵鼓励新兵的一句话）！

---

<a id="fn1" href="#fnref1" rev="footnote">1.我不会深入去讲 Mixin 和 Traits 这两个概念之间的区别。由于这两个词的意思很接近，为简单起见，在本篇文章中它俩可以互相替换使用。</a>
<a id="fn2" href="#fnref2" rev="footnote">2.在以后的博文中会作为一个专题去讲解。</a>