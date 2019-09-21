浅谈 Swift 中的泛型"

> 作者：Thomas Hanning，[原文链接](http://www.thomashanning.com/swift-generics/)，原文日期：2015-09-09
> 译者：[pmst](http://www.jianshu.com/users/596f2ba91ce9/latest_articles)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[shanks](http://codebuild.me/)
  









`Objective-C`缺乏一个重要特性:不支持**泛型**。幸运地是，`Swift`拥有这一特性。**泛型**允许你声明的函数、类以及结构体支持不同的数据类型。



## 提出问题

优秀的泛型使用案例中，最常见的例子当属对**栈(Stack)**的操作。栈作为容器有两种操作:一.**压入(Push)**操作添加项到容器中;二.**弹出(Pop)**操作将最近添加项从容器移除。首先我们用非泛型方式设计**栈**。最后代码如下所示:     

    
    class IntStack{
      // 采用数组作为容器保存数据 类型为Int
      private var stackItems:[Int] = []
      // 入栈操作 即Push 添加最新数据到容器最顶部
      func pushItem(item:Int){
        stackItems.append(item)    
      }
      // 出栈操作 即Pop 将容器最顶部数据移除
      func popItem()->Int?{
        let lastItem = stackItems.last
        stackItems.removeLast()
        return lastItem
      }
    }

该栈能够处理**Int**类型数据。这看起来不错，但是倘若要建立一个能够处理`String`类型的**栈**，我们又该如何实现呢？我们需要替换所有`Int`为`String`，不过这显然是一个糟糕的解决方法。此外另外一种方法乍看之下灰常不错，如下:     

    
    class AnyObjectStack{
      // 采用数组作为容器保存数据 类型为AnyObject
      private var stackItems:[AnyObject] = []
      // 入栈操作 即Push 添加最新数据到容器最顶部
      func pushItem(item:AnyObject){
        stackItems.append(item)    
      }
      // 出栈操作 即Pop 将容器最顶部数据移除
      func popItem()->AnyObject?{
        let lastItem = stackItems.last
        stackItems.removeLast()
        return lastItem
      }    
    }

此处，我们合理地使用`AnyObject`类型，那么现在能够将`String`类型数据压入到栈中了，对么？不过这种情况下我们就失去了数据类型的安全，并且每当我们对栈进行操作时,都需要进行一系列繁琐的类型转换(`casting`操作,使用`as`来进行类型转换)。



### 解决方案

参照泛型的特性，我们能够定义一个泛型类型，这看起来像一个占位符。使用泛型后的示例代码如下:     



    
    class Stack<T> {
    
      private var stackItems: [T] = []  
    
      func pushItem(item:T) {
        stackItems.append(item)
      }  
      
      func popItem() -> T? {
        let lastItem = stackItems.last
        stackItems.removeLast()
        return lastItem
      }
    
    }

泛型定义方式:由一对尖括号(`<>`)包裹，命名方式通常为大写字母开头(这里我们命名为`T`)。在初始化阶段，我们通过明确的类型(这里为`Int`)来定义参数,之后编译器将所有的泛型`T`替换成`Int`类型:

    
    // 指定了泛型T 就是 Int 
    // 编译器会替换所有T为Int
    let aStack = Stack<Int>()
    
    aStack.pushItem(10)
    if let lastItem = aStack.popItem() {
      print("last item: \(lastItem)")
    }

如此实现的栈，最大优势在于能够匹配任何类型。  



### 类型约束

这里存在一个缺点:尽管泛型能够代表任何类型，我们对它的操作也是比较有局限性的。仅仅是比较两个泛型都是不支持的，请看如下代码:

    
    class Stack<T> {
    
      private var stackItems: [T] = []
    
      func pushItem(item:T) {
        stackItems.append(item)
      }
    
      func popItem() -> T? {
        let lastItem = stackItems.last
        stackItems.removeLast()
        return lastItem
      }
    
      func isItemInStack(item:T) -> Bool {
        var found = false
        for stackItem in stackItems {
          if stackItem == item { //编译报错!!!!!!!!!!
            found = true
          }
        }
        return found
      }
    }

注意到函数`isItemInSatck(item:T)`中，我们得到了一个编译错误，因为两个参数没有实现`Equtable`协议的话，类型值是不能进行比较的。实际上我们可以为泛型增加约束条件来解决这个问题。在本例中，通过对第一行进行修改，我们让泛型`T`遵循`Equatable`协议:      



    
    class Stack<T:Equatable> {
    
      private var stackItems: [T] = []
    
      func pushItem(item:T) {
        .append(item)
      }
    
      func popItem() -> T? {
        let lastItem = stackItems.last
        stackItems.removeLast()
        return lastItem
      }
    
      func isItemInStack(item:T) -> Bool {
        var found = false
        for stackItem in stackItems {
          if stackItem == item {
            ound = true
          }
        }
        return found
      }
    }



### 总结

就像众多其他编程语言一样，你也能够在`Swift`中利用泛型这一特性。倘若你想要写一个库，泛型是非常好用的特性。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。Person]) -> Bool

## 问题

我们已经厌烦了活在一个处理类型的世界里，不得不为每个我们想要查找的数组类型创建新的方法。终究这给我们带来了大量的技术负债。由于现代软件难以置信的复杂性，像你我这样的开发者需要使用更好地实践，更好的技术，更好的方法，用我们的神经元最大程度的控制这种混乱。据估计 Window 7 包含大约 4 千万行代码而 macOS 10.4 (Tiger) 包含大约 8.5 千万行代码，预估像这样的系统潜在行为次数都是不可能的。

## 泛型的解决之道

（再次紧记学习泛型的目的，我们依旧假设 Swift 的数组类型的内置的函数，`index` 和  `contains` ，不存在。）

让我们先尝试写这样一个 Swift 函数，判断 Swift 的标准类型（例如 `String`，`Integer`，`Float` 或 `Double`）的一个特定实例是否存在于这个 Swift 标准类型的数组中。怎么做呢？

让我们切换到 Swift 泛型，特别是泛型函数，类型参数，类型约束以及 `Equatable` 协议。在没有定义任何术语前，我写了一些代码，思考一下你看到的。

    
    func exists<T: Equatable>(item: T, inArray: [T]) -> Bool
    {
        var index:Int = 0
        var found = false
        
        while (index < inArray.count && found == false)
        {
            if item == inArray[index]
            {
                found = true
            }
            else
            {
                index = index + 1
            }
        }
        
        if found
        {
            return true
        }
        else
        {
            return false
        }
    }

让我们测试下我新写的泛型方法

    
    let myFriends:[String] = ["John", "Dave", "Jim"]
     
    let isOneOfMyFriends = exists(item: "Dave", inArray: myFriends)
    // returns true
     
    let isOneOfMyFriends1 = exists(item: "Laura", inArray: myFriends)
    // returns false
     
    let myNumbers:[Int] = [1,2,3,4,5,6]
     
    let isOneOfMyNumbers = exists(item: 3, inArray: myNumbers)
    // returns true
     
    let isOneOfMyNumbers1 = exists(item: 0, inArray: myNumbers)
    // returns false
     
    let myNumbersFloat:[Float] = [1.0,2.0,3.0,4.0,5.0,6.0,]
     
    let isOneOfMyFloatNumbers = exists(item: 3.0000, inArray: myNumbersFloat)
    // returns true

我新写 exists 方法是一个泛型函数，这个方法“能正常工作在任何参数类型上”，此外，让我们看看它的函数签名。

    
    func exists<T: Equatable >(item: T, inArray: [T]) -> Bool

我们看到 **[那个](https://docs.Swift.org/Swift-book/LanguageGuide/Generics.html)** 函数使用一个占位符类型名字(名叫 `T`, 在这个案例)而不是真正的类型名（比如：`Int`，`Stirng`，或 `Double`）占位符类型名没有指定 `T` 必须是什么，但他说明了 `[item]` 和 `[inArray]` 必须是相同的类型 `T` 无论 `T` 代表什么，每当 [`exists(_:_:)`] 函数被调用时，真实的类型用于替代 `T` 被确定下来。

**这个 exists 函数中的占位符类型 `T` 被称为类型参数**：

> [它](https://developer.apple.com/library/content/documentation/Swift/Conceptual/SwiftProgrammingLanguage/Generics.html)指定和命名了占位符的类型，直接写在函数名称的后面，在一对尖括号之间(比如 <T>)。
>
> 一旦你指定一个类型参数你可以用它来定义函数参数的类型(比如：[`item`] and [`inArray`] [`exists(_:_:)` 函数)或者作为函数返回值的类型，在任何条件下，当函数被调用的时候类型参数会被真实类型替代。

为了强化我们目前已经学到的，下面是一个 Swift 函数，该函数能够找到存储在数组中任何类型实例的索引。

    
    func find<T: Equatable>(item: T, inArray: [T]) -> Int?
    {
        var index:Int = 0
        var found = false
        
        while (index < inArray.count && found == false)
        {
            if item == inArray[index]
            {
                found = true
            }
            else
            {
                index = index + 1
            }
        }
        
        if found
        {
            return index
        }
        else
        {
            return nil
        }
    }

让我们测试下它

    
    let myFriends:[String] = ["John", "Dave", "Jim", "Arthur", "Lancelot"]
     
    let findIndexOfFriend = find(item: "John", inArray: myFriends)
    // returns 0
     
    let findIndexOfFriend1 = find(item: "Arthur", inArray: myFriends)
    // returns 3
     
    let findIndexOfFriend2 = find(item: "Guinevere", inArray: myFriends)
    // returns nil

## 关于 `Equatable` 协议

exists 函数中 `<T: Equatable >` 标注是什么呢？它叫做类型约束，它规定了"那个类型参数必须继承自一个具体的类，或者遵守一个特定的协议或是协议组合。我指定了 exists 函数参数，`item: T` 和 `inArray: [T]`, 必须是类型 `T`, 而类型 `T` 必须遵守协议 `Equatable` 协议，为什么是这样的呢?

所有的 Swift 内置类型已经被构建支持 `Equatable` 协议。来自 [Apple docs](https://developer.apple.com/documentation/ Swift / Equatable):  “遵守 `Equatable` 协议的类型进行相等比较，使用等于运算符(`==`)判断相等，或者使用不等运算符(`!=`)判断不等”。这就是为什么我的泛型函数 "exists" 能够在 Swift 的类型（如 `String`，`Integer`，`Float` 和 `Double`）上正常工作。所有这些类型都定义了 `==` 和 `!=` 运算符。 


## 自定义类型和泛型

假如我声明了一个新的类叫做 “BasicPerson” 如下所示。我能用我的 exists" 函数来找出在数组中是否有 "BasicPerson" 类的一个实例的类型么？不行！为什么不行？看看下面这个代码，我们接下来讨论它：

    
    class BasicPerson
    {
        var name: String
        var weight: Int
        var sex: String
        
        init(weight: Int, name: String, sex: String)
        {
            self.name = name
            self.weight = weight
            self.sex = sex
        }
    }
     
    let Jim = BasicPerson(weight: 180, name: "Jim Patterson", sex: "M")
    let Sam = BasicPerson(weight: 120, name: "Sam Patterson", sex: "F")
    let Sara = BasicPerson(weight: 115, name: "Sara Lewis", sex: "F")
     
    let basicPersons = [Jim, Sam, Sara]
     
    let isSamABasicPerson = exists(item: Sam, inArray: basicPersons)

看到最后一行，因为它有一个编译错误：

    
    error: in argument type '[BasicPerson]', 'BasicPerson' does not conform to expected type 'Equatable'
    let isSamABasicPerson = exists(item: Sam, inArray: basicPersons)

![](https://swift.gg/img/articles/swift-generics/68747470733a2f2f617070636f64612e636f6d2f77702d636f6e74656e742f75706c6f6164732f323031382f30322f73776966742d342d67656e65726963732d312e706e671535431541.3460808)

这很糟糕了， 在 "BasicPerson" 类型的数组里面，你不能使用 Swift 数组的内建函数 `index` 和 `contains`。(你必须定义一个闭包，每当你想使用那两个方法 blah,blah,blah… 这个我就不提了。)

再次回到问题，为什么报错？

因为 "BasicPerson" 类没有遵守 `Equeatable` 协议(这是一个提示，请看下文咯)

## 遵守 `Equatable` 协议

为了允许我的 "BasicPerson" 类是可以使用我的 "exists" 和 "find" 泛型方法，所有我需要做的是：

* 让类遵守 `Equatable` 协议
* 重载类实例的 `==` 操作符

注意[这个](https://developer.apple.com/documentation/ Swift / Equatable )"Swift 标准库为所有遵循 `Euqatable` 协议的类型提供了不等于(!=) 操作符的实现。通过调用自定义的 `==` 函数获取它的取反结果。

如果你对操作符重载不熟悉，我建议你阅读这些主题，链接在[这里](https://developer.apple.com/library/content/documentation/Swift/Conceptual/SwiftProgrammingLanguage/AdvancedOperators.html)和[这里的](https://www.appcoda.com/operator-overloading-Swift).相信我，你会想知道操作符重载的。

> 提示：我重命名 "BasicPerson" 类为 "Person" 让他们在相同的 Swift Playground 文件能共存，接着我们来到 "Person" 类。

我将实现 `==` 操作符，所以它能比较 "Person" 类不同实例间的 "name", "weight", 和 "sex" 属性。如果两个 "Person" 类的实例有相同的的三个属性。则他们是相等的。如果有一个属性不同，则他们是不相等的(!=)。这就是为什么我的 "Person" 类遵守了 `Equatable` 协议：

    
    lass Person: Equatable 
    {
        var name:String
        var weight:Int
        var sex:String
        
        init(weight: Int, name: String, sex: String)
        {
            self.name = name
            self.weight = weight
            self.sex = sex
        }
        
        static func == (lhs: Person, rhs: Person) -> Bool
        {
            if lhs.weight == rhs.weight &&
                lhs.name == rhs.name &&
                lhs.sex == rhs.sex
            {
                return true
            }
            else
            {
                return false
            }
        }
    }

注意上面的 `==` 重载方法，这需要让 "Person" 遵守 `Equatable` 协议。注意 `==` 重载方法中的 `lhs` 和 `rhs` 参数。这是通用的，当重载操作符时，代码中等号两边的对象应该与参数中的物理位置一致，如：

    
    lhs == rhs
    left-hand side == right-hand side

## 它实用吗？

如果你跟随着我的指南，你能创建像我写的 "exists" 和 "find" 泛型函数用于任何你创建的新类型，如类或者结构体。让你自定义的类和结构体集合类型遵守 `Equatable` 协议，像 Swift 里面 `Array` 中的内置函数 `index` 和 `contains`。他们确实有用：

    
    let Joe = Person(weight: 180, name: "Joe Patterson", sex: "M")
    let Pam = Person(weight: 120, name: "Pam Patterson", sex: "F")
    let Sue = Person(weight: 115, name: "Sue Lewis", sex: "F")
    let Jeb = Person(weight: 180, name: "Jeb Patterson", sex: "M")
    let Bob = Person(weight: 200, name: "Bob Smith", sex: "M")
     
    let myPeople:Array = [Joe, Pam, Sue, Jeb]
     
    let indexOfOneOfMyPeople = find(item: Jeb, inArray: myPeople)
    // returns 3 from custom generic function
    // 返回 3 源自自定义泛型函数
     
    let indexOfOneOfMyPeople1 = myPeople.index(of: Jeb)
    // returns 3 from built-in Swift member function
    // 返回 3 源自 Swift 内建成员函数
     
    let isSueOneOfMyPeople = exists(item: Sue, inArray: myPeople)
    // returns true from custom generic function
    // 返回 true 源自自定义泛型函数
     
    let isSueOneOfMyPeople1 = myPeople.contains(Sue)
    // returns true from built-in Swift member function
    // 返回 true 源自 Swift 内建成员函数
     
    let indexOfBob = find(item: Bob, inArray: myPeople)
    // returns nil from custom generic function
    // 返回 nil 源自自定义泛型函数
     
    let indexOfBob1 = myPeople.index(of: Bob)
    // returns nil from built-in Swift member function
    // 返回 nil 源自 Swift 内建成员函数
     
    let isBobOneOfMyPeople1 = exists(item: Bob, inArray: myPeople)
    // returns false from custom generic function
    // 返回 false 源自自定义泛型函数
     
    let isBobOneOfMyPeople2 = myPeople.contains(Bob)
    // returns false from built-in Swift member function
    // 返回 false 源自 Swift 内建成员函数
     
    if Joe == Pam
    {
        print("they're equal")
    }
    else
    {
        print("they're not equal")
    }
    // returns "they're not equal"

## 扩展阅读

苹果提示关于 `Equatable` 协议的更多好处：

> Adding  Equatable  conformance to your custom types means that you can use more convenient APIs when searching for particular instances in a collection.  Equatable  is also the base protocol for the Hashable and Comparable protocols, which allow more uses of your custom type, such as constructing sets or sorting the elements of a collection.

> 让你的自定义类型遵循 Equatable 协议意味着你可以使用许多系统提供的 API 来让你在一个集合里面查找特定一个实例变得更加方便。
>
> Equatable 协议也是 Hashable 协议和 Comparable 协议的基础协议。这允许你使用更多的自定义类型，比如构建集合或者排序集合中的元素。

比如，如果你遵守了 `comparable` 协议，你能重载和使用 `<`，`>`，`<=` 和 `>=` 操作符，这真的很 Cool。

## 须知

想一下我们的 "Person" 类，假如我们有一些类似下文所示的实例：

    
    let Joe = Person(weight: 180, name: "Joe Patterson", sex: "M")
    let Pam = Person(weight: 120, name: "Pam Patterson", sex: "F")
    let Sue = Person(weight: 115, name: "Sue Lewis", sex: "F")
    let Jeb = Person(weight: 180, name: "Jeb Patterson", sex: "M")
    let Bob = Person(weight: 200, name: "Bob Smith", sex: "M")
    let Jan = Person(weight: 115, name: "Sue Lewis", sex: "F")
     
    if Jan == Sue
    {
        print("they're equal")
    }
    else
    {
        print("they're not equal")
    }
    // returns "they're equal" for 2 different objects
    // 返回 "they're equal" 对于两个不同的对象

看最后一行，因为这些 "Person" 对象中 "Jan" 和 "Sue" 对象是绝对相等的。即使他们是两个不同的实例对象。你的软件好坏仅仅取决于你的设计。在数据库的术语体系里， "Person" 类集合中，你会需要一个"主键" — 或许在类的设计中，可以添加一个索引变量。比如一个社会安全码、或者你熟知的其他的唯一值来保证 "Person" 类实例在集合 (`Array`) 中的唯一性，当然啦，你也可以使用 `===` 操作符。

享用吧！

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。