title: "Friday Q&A 2015-11-20：协变与逆变"
date: 2015-12-24
tags: [Mike Ash]
categories: [Swift 进阶]
permalink: friday-qa-2015-11-20-covariance-and-contravariance

---
原文链接=https://mikeash.com/pyblog/friday-qa-2015-11-20-covariance-and-contravariance.html
作者=Mike Ash
原文日期=2015-11-20
译者=Cee
校对=千叶知风
定稿=numbbbbb
发布时间=2015-12-24T09:00:00

<!--此处开始正文-->

在现代的编程语言中，子类型（Subtypes）和超类型（Supertypes）已经成为了非常常见的一部分了。协变（Convariance）和逆变（Contravariance）则能告诉我们什么时候使用子类型或超类型会优于原来使用的类型。这在我们使用的大多数编程语言中非常的常见，但是很多开发者仍然对这些概念感到模糊不清。今天我们就来详细讨论一下。

<!--more-->

### 子类型（Subtypes）和超类型（Supertypes）

我们都知道子类（Subclass）是什么。当你创建一个子类的时候，你就在创建一个子类型。用一个经典的例子来讲，就是用 `Animal` 的子类去创建一只 `Cat`：

```swift
    class Animal {
        ...
    }

    class Cat: Animal {
        ...
    }
```

这让 `Cat` 成为了 `Animal` 的子类型，也就意味着所有的 `Cat` 都是 `Animal`。但并不意味着所有的 `Animal` 都是 `Cat`。

子类型通常能够替代超类型。很明显懂一点编程知识的任何程序员都知道，在 Swift 中，下面的代码的第一行能够正常的运行，然而第二行则不能：

```swift
    let animal: Animal = Cat()
    let cat: Cat = Animal()
```

对于函数类型也是适用的：

```swift
    func animalF() -> Animal {
        return Animal()
    }

    func catF() -> Cat {
        return Cat()
    }

    let returnsAnimal: () -> Animal = catF
    let returnsCat: () -> Cat = animalF
```

这些在 Objective-C 下也能实现，只不过要用 block，而且语法上会显得比较丑。所以我坚定地使用 Swift。

注意，以下的代码是有问题的：

```swift
    func catCatF(inCat: Cat) -> Cat {
        return inCat
    }

    let animalAnimal: Animal -> Animal = catCatF
```

很困惑，不是吗？不用担心，整篇文章就是为了彻底了解为什么第一个版本是可行而第二个版本是不可行的。除此之外，我们在探索的过程中还会了解很多非常有用的东西。

### 重写（Override）方法

类似的事情在重写方法中也能正确地执行，想象一下有这样一个类：

```swift
    class Person {
        func purchaseAnimal() -> Animal
    }
```

现在我们建立它的子类，然后重写父类的方法，并改变返回值的类型：

```swift
    class CrazyCatLady: Person {
        override func purchaseAnimal() -> Cat
    }
```

这样做对吗？对。为什么呢？

[Liskov 替换原则](https://en.wikipedia.org/wiki/Liskov_substitution_principle)被用于指导何时该使用子类。简明扼要的来说，它指出任何子类的实例总是能够替代父类的实例。比如你有一个 `Animal`，你就能用 `Cat` 替代它；你也总是能够用 `CrazyCatLady` 替代 `Person`。

下面是使用 `Person` 作为例子写的一段代码，接下来会有解释来解释清楚：

```swift
    let person: Person = getAPerson()
    let animal: Animal = person.purchaseAnimal()
    animal.pet()
```

想象一下当 `getAPerson` 返回一位 `CrazyCatLady`。整段代码还可行吗？`CrazyCatLady.purchaseAnimal` 会返回一只 `Cat`。这个实例被放入了 `animal` 中。`Cat` 是 `Animal` 的一种，所以它也能够做 `Animal` 能够做的事情，包括 `pet` 方法。类似，`CrazyCatLady` 返回的 `Cat` 也是有效的。

我们这时把 `pet` 函数放入 `Person` 类中，所以我们能够知道一个人所养的特定的动物：

```swift
    class Person {
        func purchaseAnimal() -> Animal
        func pet(animal: Animal)
    }
```

自然，`CrazyCatLady` 只拥有宠物猫：

```swift
    class CrazyCatLady: Person {
        override func purchaseAnimal() -> Cat
        override func pet(animal: Cat)
    }
```

现在这样对吗？*不对！*

为了理解为什么不对，我们来看一下使用这个方法的代码片段：

```swift
    let person: Person = getAPerson()
    let animal: Animal = getAnAnimal()
    person.pet(animal)
```

假设 `getAPerson` 方法返回了一位 `CrazyCatLady`，第一行非常的正确：

```swift
    let person: Person = getAPerson()
```

如果 `getAnAnimal` 方法返回了一只 `Dog`，它也是 `Animal` 的子类但是和 `Cat` 有截然不同的表现。接下来的一行看上去也非常的正确：

```swift
    let animal: Animal = getAnAnimal()
```

接下来我们的 `person` 变量中有一位 `CrazyCatLady`，以及在 `animal` 变量中有一只 `Dog`，然后执行了这一行：

```swift
    person.pet(animal)
```

爆炸了噜！`CrazyCatLady` 的 `pet` 方法期望参数是一只 `Cat`。对于这只 `Dog` 就显得无计可施。这个方法也有可能会访问其他的属性或者调用其他 `Dog` 类所不具备的方法。

这段代码原本是完全正确的。首先它得到 `Person` 和 `Animal`，然后调用 `Person` 中的方法让人拥有这个 `Animal`。上面的问题在于我们把 `CrazyCatLady.pet` 方法的参数类型变成了 `Cat`。这破坏了 Liskov 替换原则：此时的 `CrazyCatLady` 并不能在任意的地方替代 `Person` 的使用。

感谢编译器给我们留了一手。它明白使用子类型用于重写方法的参数类型是不正确的，会拒绝编译这个代码。

那在重写方法时使用不同的类型究竟对不对呢？对！事实上，你需要*超类型（Supertype）*。举一个例子，假设 `Animal` 是 `Thing` 的子类，那么当我们重写 `pet` 方法时，参数类型变为 `Thing`：

```swift
    override func pet(thing: Thing)
```

这保证了可替换性。如果是一个 `Person`，那么这个方法所传进来的参数类型始终是 `Animal`，这是 `Thing` 的一种。

有个重要的规则来了：函数的返回值可以换成原类型的*子类型*，在层级上*降*了一级；反之函数的参数可以换成原类型的*超类型*，在层级上*升*了一级。

### 单独的函数（Standalone functions）

这种子类型和超类型的关系我们已经在类上面了解得很清楚了。它能够通过类与类之间的层级关系直接推出。那么如果是单独的函数关系呢？

```swift
    let f1: A -> B = ...
    let f2: C -> D = f1
```

这种关系什么时候是对的，什么时候又是错的呢？

这可以被看做是 Liskov 替换原则的一种精简版本。 事实上，你可以把函数想象成是非常小的（mini-objects）、只有一个方法的对象。当你有两个不同的对象类型时，怎么做才能够让这两个对象也遵循我们的原则呢？只有当原对象类型是后者类型的子类型就可以了。那什么时候函数是另一个函数的子类型呢？正如上面所见，当前者的参数是后者的超类型并且返回值是后者的子类型即可。

把这个方法应用在这儿，上面的代码当 `A` 是 `C` 的超类型且 `B` 是 `D` 的子类型时可以正常的执行。用具体的例子来说：

```swift
    let f1: Animal -> Animal = ...
    let f2: Cat -> Thing = f1
```

参数和返回值的类型朝着相反的方向移动。可能不是你所想的那样，但是这就是能让函数正确执行的唯一方法。

这又是一个重要的规则：一个函数若是另外一个函数的子类型，那么它的参数是原函数参数的*超类型*，返回值是原函数返回值的*子类型*（译者注：又叫做 [Robustness 原则](http://www.wikiwand.com/en/Robustness_principle)）。

### 属性（Property）

如果是只读的属性那就很简单。子类的属性必须是父类属性的子类型。只读的属性本质上是一个不接收参数而返回成员值的函数，所以上述的规则依旧适用。

可读可写的属性其实也非常的简单。子类的属性必须和父类的属性类型相同。一个可读可写的属性其实由一对函数组成。`Getter` 是一个不接收参数而返回成员值的函数，`Setter` 则是一个需要传入一个参数但无需返回值的函数。看下面的例子：

```swift
    var animal: Animal
    // 这等价于：
    func getAnimal() -> Animal
    func setAnimal(animal: Animal)
```

正如我们之前得到的结论一样，函数的参数和返回值需要各自向上和向下改变一级。然而参数和返回值的类型却是固定的，所以它们的类型都不能被改变：

```swift
    // 注意到 animal 的类型是 Animal
    // 这样不对（向下）
    override func getAnimal() -> Cat
    override func setAnimal(animal: Cat)

    // 这样也不对（向上）
    override func getAnimal() -> Thing
    override func setAnimal(animal: Thing)
```

### 泛型（Generics）

那如果是泛型呢？给定泛型类型的参数，什么时候又是正确的呢？

```swift
    let var1: SomeType<A> = ...
    let var2: SomeType<B> = var1
```

理论上来说，这要看泛型参数是如何使用的。一个泛型类型参数本身并不做什么事情，但是它会被用作于属性的类型、函数方法的参数类型和返回类型。

如果泛型参数仅仅被用作函数返回值的类型和只读属性身上，那么 `B` 需要是 `A` 的超类型：

```swift
    let var1: SomeType<Cat> = ...
    let var2: SomeType<Animal> = var1
```

如果泛型参数仅被用作于函数方法的参数类型，那么 `B` 需要是 `A` 的子类型：

```swift
    let var1: SomeType<Animal> = ...
    let var2: SomeType<Cat> = var1
```

如果泛型参数在上述提到的两方面都被使用了，那么当且仅当 `A` 和 `B` 是相同类型的时候才是有效的。这也同样适用于当泛型参数作为可读可写属性的情况。

这就是理论部分，看上去有些复杂但其实很简短。与此同时，Swift 寻求到了其简便的解决之道。对于两个需要相互匹配的泛型类型，Swift 要求它们的泛型参数的类型也需要相同。子类型和超类型都是不被允许的，尽管理论上可行。

Objective-C 事实上比 Swift 更好一些。一个在 Objective-C 中的泛型参数可以在声明时增加 `__covariant` 关键字来表示它能够接受子类型，而在声明时增加 `__contravariant` 关键字来表示它能够接受超类型。这在 `NSArray` 和其他的类的接口中有所体现：

```objective-c
    @interface NSArray<__covariant ObjectType> : NSObject ...
```

### 协变和逆变（Convariance and Contravariance）

那些细心的读者会注意到：在标题中提到的两个词至今为止我通篇未提。现在我们既然了解了这些概念，那就来谈一下这几个专业术语。

*协变（Convariance）*指可接受子类型。重写只读的属性是「协变的」。

*逆变（Contravariance）*指可接受超类型。重写方法中的参数是「逆变的」。

*不变（Invariance）*指既不接受子类型，又不接受超类型。Swift 中泛型是「不变的」。

*双向协变（Bivariate）*指既接受子类型，又接受超类型。我想不到在 Objective-C 或 Swift 中的任何例子。

你会发现这种专业术语非常难记。那就对了，因为这并不重要。只要你懂得子类型、超类型，以及什么时候在特定位置适用一个类的子类或者超类就够了。在需要用到术语的时候看一下就够了。

### 小结

协变和逆变决定了在特定位置该怎样使用子类型或超类型。通常出现在重写方法以及改变传入参数或者返回值类型的地方。这种情况下我们已经知道返回值必须是原来的子类型，而参数是原来的超类型。整个指导我们这么做的原则就叫做 Liskov 替换原则，意思是任何子类的实例总是能够使用在父类的实例所使用的地方。子类型和超类型就是从这条原则中衍生出来。

今天就到这儿了。记得回来探索更多有趣的事情；或者说就来探索有趣的事情。「更多」可能在这不适用，因为协变这件事并不是那么的令人激动。无论如何，我们的 Friday Q&A 都会听从读者的建议，所以有什么更高的建议或者文章的话，记得[给我们写信](mailto:mike@mikeash.com)！

---

译者注：

1. Swift 中的泛型的确是「不变的（Invariance）」，但是 Swift 标准库中的 Collection 类型通常情况下是「协变的（Convariance）」。举个例子：

```swift
import UIKit 

class Thing<T> { // 亦可以使用结构体 struct 声明
    var thing: T 
    init(_ thing: T) { self.thing = thing } 
} 
var foo: Thing<UIView> = Thing(UIView()) 
var bar: Thing<UIButton> = Thing(UIButton()) 
foo = bar // 报错：error: cannot assign value of type 'Thing<UIButton>' to type 'Thing<UIView>' 

// Array 则不会报错 

var views: Array<UIView> = [UIView()] 
var buttons: Array<UIButton> = [UIButton()] 
views = buttons
```

2. Swift 中的 Protocol 不支持这里的类型改变。如果某个协议是继承自另外一个协议而且尝试着「重写」父协议的方法，Swift 会把它当做是另外一个方法。举个例子：

```swift
class Thing {} 
class Animal: Thing {} 
class Cat: Animal {} 

protocol SuperP { 
    func f(animal: Animal) -> Animal 
} 

protocol SubP1: SuperP { 
    func f(thing: Thing) -> Cat 
} 

protocol SubP2: SuperP { 
    func f(cat: Cat) -> Thing 
} 

class ImplementsSubP1: SubP1 { 
    func f(thing: Thing) -> Cat { 
        return Cat() 
    } 
} 

class ImplementsSubP2: SubP2 { 
    func f(cat: Cat) -> Thing { 
        return Thing() 
    } 
} 
// ImplementSubP1 和 ImplementSubP2 将不被认为遵循了 SuperP 的协议
```