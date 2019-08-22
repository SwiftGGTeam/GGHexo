title: "Swift 关键字"
date: 2019-08-22
tags: [Swift]
categories: [swiftjectivec]
permalink: Swift-Keywords
keywords: swift，keywords
custom_title:"Swift 关键字"

---

原文链接=https://www.swiftjectivec.com/swift-keywords-v-3-0-1/
作者=Jordan Morgan
原文日期=2017-02-11
译者=郑一一
校对=numbbbbb,colourful987
定稿=Pancf

<!--此处开始正文-->

有句话之前我提过，今天还想再说一次。那就是打铁还需自身硬。对于自身能力的严格要求，可以帮助实现我们所有梦寐以求的东西。

说起来可能有些消极，知识毕竟是永远学不完的。不论如何，今天 [我们先来学习一下 Swift 中的每一个关键字](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/LexicalStructure.html)（V3.0.1），在介绍每个关键字的时候，同时会附带一段代码加以说明。

在这些关键字之中，会有你熟悉或者不熟悉的部分。但为了最好的阅读和学习体验，我把它们全部列出来了。文章篇幅有些长，你准备好了么？

让我们现在就开始吧。

<!--more-->

## 声明式关键字

**associatedtype**：在协议中，定义一个类型的占位符名称。直到协议被实现，该占位符才会被指定具体的类型。

```swift
protocol Entertainment  
{  
    associatedtype MediaType  
}

class Foo : Entertainment  
{  
    typealias MediaType = String //可以指定任意类型
}
```

**class**：通用、灵活的结构体，是程序的基础组成部分。与 struct 类似，不同之处在于：

* 允许一个类继承另一个类的特性。
* 类型转换，允许在运行时检查和指定一个类的实际类型。
* 析构方法允许类的实例释放所有资源。
* 引用计数允许多个引用指向一个实例。

```swift
class Person  
{  
    var name:String  
    var age:Int  
    var gender:String  
}
```

**deinit**：当一个类的实例即将被销毁时，会调用这个方法。

```swift
class Person  
{  
    var name:String  
    var age:Int  
    var gender:String

    deinit  
    {  
        //从堆中释放，并释放的资源
    }  
}
```

**enum**：定义了包含一组有关联的值的类型，并可以以一种类型安全的方式使用这些值。在 Swift 中，枚举是一等类型，拥有在其它语言中只有 class 才会支持的特性。

```swift
enum Gender  
{  
    case male  
    case female  
}
```

**extension**：允许给已有的类、结构体、枚举、协议类型，添加新功能。

```swift
class Person  
{  
    var name:String = ""  
    var age:Int = 0  
    var gender:String = ""  
}

extension Person  
{  
    func printInfo()  
    {  
        print("My name is \(name), I'm \(age) years old and I'm a \(gender).")  
    }  
}
```

**fileprivate**：访问控制权限，只允许在定义源文件中访问。

```swift
class Person  
{  
    fileprivate var jobTitle:String = ""  
}

extension Person  
{
    //当 extension 和 class 在同一个文件中时，允许访问
    func printJobTitle()  
    {  
        print("My job is (jobTitle)")  
    }  
}
```

**func**：包含用于执行特定任务的代码块。

```swift
func addNumbers(num1:Int, num2:Int) -> Int  
{  
    return num1+num2  
}
```

**import**：引入一个以独立单元构建的框架或者应用。

```swift
import UIKit

//可以使用 UIKit 框架下的所有代码
class Foo {}
```

**init**：类、结构体、枚举的实例的初始化准备过程。

```swift
class Person
{  
    init()  
    {  
        //设置默认值，实例准备被使用
    }  
}
```

**inout**：将一个值传入函数，并可以被函数修改，然后将值传回到调用处，来替换初始值。适用于引用类型和值类型。

```swift
func dangerousOp(_ error:inout NSError?)  
{  
    error = NSError(domain: "", code: 0, userInfo: ["":""])  
}

var potentialError:NSError?
dangerousOp(&potentialError)

//代码运行到这里，potentialError 不再是 nil，而是已经被初始化
```

**internal**：访问控制权限，允许同一个模块下的所有源文件访问，如果在不同模块下则不允许访问。

```swift
class Person  
{  
    internal var jobTitle:String = ""  
}

let aPerson = Person()  
aPerson.jobTitle = "This can set anywhere in the application"
```

**let**：定义一个不可变的变量。

```swift
let constantString = "This cannot be mutated going forward"
```

**open**：访问控制权限，允许在定义的模块外也可以访问源文件里的所有类，并进行子类化。对于类成员，允许在定义的模块之外访问和重写。

```swift
open var foo:String? //这个属性允许在 app 内或 app 外重写和访问。在开发框架的时候，会应用到这个访问修饰符。
```

**operator**：特殊符号，用于检查、修改、组合值。

```swift
//一元运算符 "-"，改变值的符号
let foo = 5  
let anotherFoo = -foo //anotherFoo 等于 -5

//二元运算符 "+" 将两个值相加
let box = 5 + 3

//逻辑运算符 "&&" 将两个布尔值进行组合运算
if didPassCheckOne && didPassCheckTwo

//三元运算符需要使用三个值
let isLegalDrinkingAgeInUS:Bool = age >= 21 ? true : false
```

**private**：访问控制权限，只允许实体在定义的类以及相同源文件内的 extension 中访问。

```swift
class Person  
{  
    private var jobTitle:String = ""  
}

// 当 extension 和 class 不在同一个源文件时
extension Person  
{
    // 无法编译通过，只有在同一个源文件下才可以访问
    func printJobTitle()  
    {  
        print("My job is (jobTitle)")  
    }  
}
```

**protocol**：定义了一组方法、属性或其它要求，用于满足特定任务和一系列功能。

```swift
protocol Blog  
{  
    var wordCount:Int { get set }  
    func printReaderStats()  
}

class TTIDGPost : Blog  
{  
    var wordCount:Int

    init(wordCount:Int)  
    {  
        self.wordCount = wordCount  
    }

    func printReaderStats()  
    {  
        //打印 post 的数据  
    }  
}
```

**public**：访问控制权限，允许在定义的模块外也可以访问源文件里的所有类，但只有在同一个模块内可以进行子类化。对于类成员，允许在同个模块下访问和重写。

```swift
public var foo:String? //只允许在 app 内重写和访问。
```

**static**：用于定义类方法，在类型本身进行调用。此外还可以定义静态成员。

```swift
class Person  
{  
    var jobTitle:String?

    static func assignRandomName(_ aPerson:Person)  
    {  
        aPerson.jobTitle = "Some random job"  
    }  
}

let somePerson = Person()  
Person.assignRandomName(somePerson)  
//somePerson.jobTitle 的值是 "Some random job"
```

**struct**：通用、灵活的结构体，是程序的基础组成部分，并提供了默认初始化方法。与 class 不同，当 struct 在代码中被传递时，是被拷贝的，并不使用引用计数。除此之外，struct 没有下面的这些功能：

* 使用继承。
* 运行时的类型转换。
* 使用析构方法。

```swift
struct Person  
{  
    var name:String  
    var age:Int  
    var gender:String  
}
```

**subscript**：访问集合、列表、序列中成员元素的快捷方式。

```swift
var postMetrics = ["Likes":422, "ReadPercentage":0.58, "Views":3409]  
let postLikes = postMetrics["Likes"]
```

**typealias**：给代码中已经存在的类，取别名。

```swift
typealias JSONDictionary = [String: AnyObject]

func parseJSON(_ deserializedData:JSONDictionary){}
```

**var**：定义可变变量。

```swift
var mutableString = ""  
mutableString = "Mutated"
```

## 语句中的关键词

**break**：终止程序中循环的执行，比如 if 语句、switch 语句。

```swift
for idx in 0...3  
{  
    if idx % 2 == 0  
    {  
        //当 idx 等于偶数时，退出 for 循环  
        break  
    }  
}
```

**case**：该语句在 switch 语句中列出，在每个分支可以进行模式匹配。

```swift
let box = 1

switch box  
{  
    case 0:  
    print("Box equals 0")  
    case 1:  
    print("Box equals 1")  
    default:  
    print("Box doesn't equal 0 or 1")  
}
```

**continue**：用于终止循环的当前迭代，并进入下一次迭代，而不会停止整个循环的执行。

```swift
for idx in 0...3  
{  
    if idx % 2 == 0  
    {  
        //直接开始循环的下一次迭代
        continue  
    }

    print("This code never fires on even numbers")  
}
```

**default**：用于涵盖在 switch 语句中，所有未明确列出的枚举成员。

```swift
let box = 1

switch box  
{  
    case 0:  
    print("Box equals 0")  
    case 1:  
    print("Box equals 1")  
    default:  
    print("Covers any scenario that doesn't get addressed above.")  
}
```

**defer**：用于在程序离开当前作用域之前，执行一段代码。

```swift
func cleanUpIO()  
{  
    defer  
    {  
        print("This is called right before exiting scope")  
    }


    //关闭文件流等。  
}
```

**do**：用于表示处理错误代码段的开始。

```swift
do  
{  
    try expression  
    //语句
}  
catch someError ex  
{  
    //处理错误
}
```

**else**：与 if 语句结合使用。当条件为 true，执行一段代码。当条件为 false，执行另一段代码。

```swift
if val > 1  
{  
    print("val is greater than 1")  
}  
else  
{  
    print("val is not greater than 1")  
}
```

**fallthrough**：显式地允许从当前 case 跳转到下一个相邻 case 继续执行代码。

```swift
let box = 1

switch box  
{  
    case 0:  
    print("Box equals 0")  
    fallthrough  
    case 1:  
    print("Box equals 0 or 1")  
    default:  
    print("Box doesn't equal 0 or 1")  
}
```

**for**：在序列上迭代，比如一组特定范围内的数字，数组中的元素，字符串中的字符。\*与关键字 in 成对使用。

```swift
for _ in 0..<3 { print ("This prints 3 times") }
```

**guard**：当有一个以上的条件不满足要求时，将离开当前作用域。同时还提供解包可选类型的功能。

```swift
private func printRecordFromLastName(userLastName: String?)
{  
    guard let name = userLastName, name != "Null" else  
    {  
        //userLastName = "Null"，需要提前退出
        return  
    }

    //继续执行代码
    print(dataStore.findByLastName(name))  
}
```

**if**：当条件满足时，执行代码。

```swift
if 1 > 2  
{  
    print("This will never execute")  
}
```

**in**：在序列上迭代，比如一组特定范围内的数字，数组中的元素，字符串中的字符。\*与关键字 key 搭配使用。

```swift
for _ in 0..<3 { print ("This prints 3 times") }
```

**repeat**：在使用循环的判断条件之前，先执行一次循环中的代码。

```swift
repeat  
{  
    print("Always executes at least once before the condition is considered")  
}  
while 1 > 2
```

**return**：立刻终止当前上下文，离开当前作用域，此外在返回时可以额外携带一个值。

```swift
func doNothing()  
{  
    return //直接离开当前上下文

    let anInt = 0  
    print("This never prints (anInt)")  
}
```

和

```swift
func returnName() -> String?  
{  
    return self.userName //离开，并返回 userName 的值
}
```

**switch**：将给定的值与分支进行比较。执行第一个模式匹配成功的分支代码。

```swift
let box = 1

switch box  
{  
    case 0:  
    print("Box equals 0")  
    fallthrough  
    case 1:  
    print("Box equals 0 or 1")  
    default:  
    print("Box doesn't equal 0 or 1")  
}
```

**where**：要求关联类型必须遵守特定协议，或者类型参数和关联类型必须保持一致。也可以用于在 case 中提供额外条件，用于满足控制表达式。

> where 从句可以应用于多种场景。以下例子指明了 where 的主要应用场景，泛型中的模式匹配。

```swift
protocol Nameable  
{  
    var name:String {get set}  
}

func createdFormattedName(_ namedEntity:T) -> String where T:Equatable  
{  
    //只有当实体同时遵守 Nameable 和 Equatable 协议的时候，才允许调用这个函数
    return "This things name is " + namedEntity.name  
}
```

和

```swift
for i in 0…3 where i % 2 == 0  
{  
    print(i) //打印 0 和 2  
}
```

**while**：循环执行特定的一段语句，直到条件不满足时，停止循环。

```swift
while foo != bar  
{  
    print("Keeps going until the foo == bar")  
}
```

## 表达式和类型中的关键字

**Any**：用于表示任意类型的实例，包括函数类型。

```swift
var anything = [Any]()

anything.append("Any Swift type can be added")  
anything.append(0)  
anything.append({(foo: String) -> String in "Passed in (foo)"})
```

**as**：类型转换运算符，用于尝试将值转成其它类型。

```swift
var anything = [Any]()

anything.append("Any Swift type can be added")  
anything.append(0)  
anything.append({(foo: String) -> String in "Passed in (foo)" })

let intInstance = anything[1] as? Int
```

或者

```swift
var anything = [Any]()

anything.append("Any Swift type can be added")  
anything.append(0)  
anything.append({(foo: String) -> String in "Passed in (foo)" })

for thing in anything  
{  
    switch thing  
    {  
        case 0 as Int:  
        print("It's zero and an Int type")  
        case let someInt as Int:  
        print("It's an Int that's not zero but (someInt)")  
        default:  
        print("Who knows what it is")  
    }  
}
```

**catch**：如果在 do 中抛出一个错误，catch 会尝试进行匹配，并决定如何处理错误。[\*我写的一篇 Swift 错误处理的博客节选](https://swiftjectivec.com/swift-error-handling)。

```swift
do  
{  
    try haveAWeekend(4)  
}  
catch WeekendError.Overtime(let hoursWorked)  
{  
    print("You worked (hoursWorked) more than you should have")  
}  
catch WeekendError.WorkAllWeekend  
{  
    print("You worked 48 hours :-0")  
}  
catch  
{  
    print("Gulping the weekend exception")  
}
```

**false**：Swift 用于表示布尔值的两个常量值之一，true 的相反值。

```swift
let alwaysFalse = false  
let alwaysTrue = true

if alwaysFalse { print("Won't print, alwaysFalse is false 😉")}
```

**is**：类型检查运算符，用于确定实例是否为某个子类类型。

```swift
class Person {}  
class Programmer : Person {}  
class Nurse : Person {}

let people = [Programmer(), Nurse()]

for aPerson in people  
{  
    if aPerson is Programmer  
    {  
        print("This person is a dev")  
    }  
    else if aPerson is Nurse  
    {  
        print("This person is a nurse")  
    }  
}
```

**nil**：在 Swift 中表示任意类型的无状态值。

> 与 Objective-C 中的 nil 不同，Objective-C 中的 nil 表示指向不存在对象的指针。

```swift
class Person{}  
struct Place{}

//任何 Swift 类型或实例可以为 nil
var statelessPerson:Person? = nil  
var statelessPlace:Place? = nil  
var statelessInt:Int? = nil  
var statelessString:String? = nil
```

**rethrows**：指明当前函数只有当参数抛出 error 时，才会抛出 error。

```swift
func networkCall(onComplete:() throws -> Void) rethrows  
{  
    do  
    {  
        try onComplete()  
    }  
    catch  
    {  
        throw SomeError.error  
    }  
}
```

**super**：在子类中，暴露父类的方法、属性、下标。

```swift
class Person  
{  
    func printName()  
    {  
        print("Printing a name. ")  
    }  
}

class Programmer : Person  
{  
    override func printName()  
    {  
        super.printName()  
        print("Hello World!")  
    }  
}

let aDev = Programmer()  
aDev.printName() //打印 Printing a name. Hello World!
```

**self**：任何类型的实例都拥有的隐式属性，等同于实例本身。此外还可以用于区分函数参数和成员属性名称相同的情况。

```swift
class Person  
{  
    func printSelf()  
    {  
        print("This is me: (self)")  
    }  
}

let aPerson = Person()  
aPerson.printSelf() //打印 "This is me: Person"
```

**Self**：在协议中，表示遵守当前协议的实体类型。

```swift
protocol Printable  
{  
    func printTypeTwice(otherMe:Self)  
}

struct Foo : Printable  
{  
    func printTypeTwice(otherMe: Foo)  
    {  
        print("I am me plus (otherMe)")  
    }  
}

let aFoo = Foo()  
let anotherFoo = Foo()

aFoo.printTypeTwice(otherMe: anotherFoo) //打印 I am me plus Foo()
```

**throw**：用于在当前上下文，显式抛出 error。

```swift
enum WeekendError: Error  
{  
    case Overtime  
    case WorkAllWeekend  
}

func workOvertime () throws  
{  
    throw WeekendError.Overtime  
}
```

**throws**：指明在一个函数、方法、初始化方法中可能会抛出 error。

```swift
enum WeekendError: Error  
{  
    case Overtime  
    case WorkAllWeekend  
}

func workOvertime () throws  
{  
    throw WeekendError.Overtime  
}

//"throws" 表明在调用方法时，需要使用 try，try?，try!
try workOvertime()
```

**true**：Swift 用于表示布尔值的两个常量值之一，表示为真。

```swift
let alwaysFalse = false  
let alwaysTrue = true

if alwaysTrue { print("Always prints")}
```

**try**：表明接着调用的函数可能会抛出 error。有三种不同的使用方式：try，try?， try!。

```swift
let aResult = try dangerousFunction() //处理 error，或者继续传递 error  
let aResult = try! dangerousFunction() //程序可能会闪退  
if let aResult = try? dangerousFunction() //解包可选类型。
```

## 模式中的关键字

**_**：用于匹配或省略任意值的通配符。

```swift
for _ in 0..<3  
{  
    print("Just loop 3 times, index has no meaning")  
}
```

另外一种用法：

```swift
let _ = Singleton() //忽略不使用的变量
```

## 以#开头的关键字

**#available**：基于平台参数，通过 **if**，**while**，**guard** 语句的条件，在运行时检查 API 的可用性。

```swift
if #available(iOS 10, *)  
{  
    print("iOS 10 APIs are available")  
}
```

**#colorLiteral**：在 playground 中使用的字面表达式，用于创建颜色选取器，选取后赋值给变量。

```swift
let aColor = #colorLiteral //创建颜色选取器
```

**#column**：一种特殊的字面量表达式，用于获取字面量表示式的起始列数。

```swift
class Person  
{  
    func printInfo()  
    {  
        print("Some person info - on column (#column)")
    }  
}

let aPerson = Person()  
aPerson.printInfo() //Some person info - on column 53
```

**#else**：条件编译控制语句，用于控制程序在不同条件下执行不同代码。与 **#if** 语句结合使用。当条件为 true，执行对应代码。当条件为 false，执行另一段代码。

```swift
#if os(iOS)  
print("Compiled for an iOS device")  
#else  
print("Not on an iOS device")  
#endif
```

**#elseif**：条件编译控制语句，用于控制程序在不同条件下执行代码。与 **#if** 语句结合使用。当条件为 true，执行对应代码。

```swift
#if os(iOS)  
print("Compiled for an iOS device")  
#elseif os(macOS)  
print("Compiled on a mac computer")  
#endif
```

**#endif**：条件编译控制语句，用于控制程序在不同条件下执行代码。用于表明条件编译代码的结尾。

```swift
#if os(iOS)  
print("Compiled for an iOS device")  
#endif
```

**#file**：特殊字面量表达式，返回当前代码所在源文件的名称。

```swift
class Person  
{  
    func printInfo()  
    {  
        print("Some person info - inside file (#file)")
    }  
}

let aPerson = Person()  
aPerson.printInfo() //Some person info - inside file /*代码所在 playground 文件路径*/
```

**#fileReference**：playground 字面量语法，用于创建文件选取器，选取并返回 NSURL 实例。

```swift
let fontFilePath = #fileReference //创建文件选取器
```

**#function**：特殊字面量表达式，返回函数名称。在方法中，返回方法名。在属性的 getter 或者 setter 中，返回属性名。在特殊的成员中，比如 init 或 subscript 中，返回关键字名称。在文件的最顶层时，返回当前所在模块名称。

```swift
class Person  
{  
    func printInfo()  
    {  
        print("Some person info - inside function (#function)")
    }  
}

let aPerson = Person()  
aPerson.printInfo() //Some person info - inside function printInfo()
```

**#if**：条件编译控制语句，用于控制程序在不同条件下编译代码。通过判断条件，决定是否执行代码。

```swift
#if os(iOS)  
print("Compiled for an iOS device")  
#endif
```

**#imageLiteral**：playground 字面量语法，创建图片选取器，选择并返回 UIImage 实例。

```swift
let anImage = #imageLiteral //在 playground 文件中选取图片
```

**#line**：特殊字面量表达式，用于获取当前代码的行数。

```swift
class Person  
{  
    func printInfo()  
    {  
        print("Some person info - on line number (#line)")
    }  
}

let aPerson = Person()  
aPerson.printInfo() //Some person info - on line number 5
```

**#selector**：用于创建 Objective-C selector 的表达式，可以静态检查方法是否存在，并暴露给 Objective-C。

```swift
//静态检查，确保 doAnObjCMethod 方法存在  
control.sendAction(#selector(doAnObjCMethod), to: target, forEvent: event)
```

**#sourceLocation**：行控制语句，可以指定与原先完全不同的行数和源文件名。通常在 Swift 诊断、debug 时使用。

```swift
#sourceLocation(file:"foo.swift", line:6)

//打印新值
print(#file)  
print(#line)

//重置行数和文件名
#sourceLocation()

print(#file)  
print(#line)
```

## 特定上下文中的关键字

> 这些关键字，在处于对应上下文之外时，可以用作标识符。

**associativity**：指明同一优先级的运算符，在缺少大括号的情况，按什么顺序结合。使用 **left**、**right**、**none**。

```swift
infix operator ~ { associativity right precedence 140 }  
4 ~ 8
```

**convenience**：次等的便利构造器，最后会调用指定构造器初始化实例。

```swift
class Person  
{  
    var name:String

    init(_ name:String)  
    {  
        self.name = name  
    }

    convenience init()  
    {  
        self.init("No Name")  
    }  
}

let me = Person()  
print(me.name)//打印 "No Name"
```

**dynamic**：指明编译器不会对类成员或者函数的方法进行内联或虚拟化。这意味着对这个成员的访问是使用 Objective-C 运行时进行动态派发的（代替静态调用）。

```swift
class Person  
{  
    //隐式指明含有 "objc" 属性
    //这对依赖于 Objc-C 黑魔法的库或者框架非常有用
    //比如 KVO、KVC、Swizzling
    dynamic var name:String?  
}
```

**didSet**：属性观察者，当值存储到属性后马上调用。

```swift
var data = [1,2,3]  
{  
    didSet  
    {  
        tableView.reloadData()  
    }  
}
```

**final**：防止方法、属性、下标被重写。

```swift
final class Person {}  
class Programmer : Person {} //编译错误
```

**get**：返回成员的值。还可以用在计算型属性上，间接获取其它属性的值。

```swift
class Person  
{  
    var name:String  
    {  
        get { return self.name }  
        set { self.name = newValue}  
    }

    var indirectSetName:String  
    {  
        get  
        {  
            if let aFullTitle = self.fullTitle  
            {  
                return aFullTitle  
            }  
            return ""  
        }

        set (newTitle)  
        {  
            //如果没有定义 newTitle，可以使用 newValue
            self.fullTitle = "(self.name) :(newTitle)"  
        }
    }  
}
```

**infix**：指明一个用于两个值之间的运算符。如果一个全新的全局运算符被定义为 infix，还需要指定优先级。

```swift
let twoIntsAdded = 2 + 3
```

**indirect**：指明在枚举类型中，存在成员使用相同枚举类型的实例作为关联值的情况。

```swift
indirect enum Entertainment  
{  
    case eventType(String)  
    case oneEvent(Entertainment)  
    case twoEvents(Entertainment, Entertainment)  
}

let dinner = Entertainment.eventType("Dinner")  
let movie = Entertainment.eventType("Movie")

let dateNight = Entertainment.twoEvents(dinner, movie)
```

**lazy**：指明属性的初始值，直到第一次被使用时，才进行初始化。

```swift
class Person  
{  
    lazy var personalityTraits = {  
        //昂贵的数据库开销  
        return ["Nice", "Funny"]  
    }()  
}
let aPerson = Person()  
aPerson.personalityTraits //当 personalityTraits 首次被访问时，数据库才开始工作
```

**left**：指明运算符的结合性是从左到右。在没有使用大括号时，可以用于正确判断同一优先级运算符的执行顺序。

```swift
//"-" 运算符的结合性是从左到右
10-2-4 //根据结合性，可以看做 (10-2) - 4
```

**mutating**：允许在方法中修改结构体或者枚举实例的属性值。

```swift
struct Person  
{  
    var job = ""

    mutating func assignJob(newJob:String)  
    {  
        self = Person(job: newJob)  
    }  
}

var aPerson = Person()  
aPerson.job //""

aPerson.assignJob(newJob: "iOS Engineer at Buffer")  
aPerson.job //iOS Engineer at Buffer
```

**none**：是一个没有结合性的运算符。不允许这样的运算符相邻出现。

```swift
//"<" 是非结合性的运算符
1 < 2 < 3 //编译失败
```

**nonmutating**：指明成员的 setter 方法不会修改实例的值，但可能会有其它后果。

```swift
enum Paygrade  
{  
    case Junior, Middle, Senior, Master

    var experiencePay:String?  
    {  
        get  
        {  
            database.payForGrade(String(describing:self))  
        }

        nonmutating set  
        {  
            if let newPay = newValue  
            {  
                database.editPayForGrade(String(describing:self), newSalary:newPay)  
            }  
        }  
    }  
}

let currentPay = Paygrade.Middle

//将 Middle pay 更新为 45k, 但不会修改 experiencePay 值
currentPay.experiencePay = "$45,000"
```

**optional**：用于指明协议中的可选方法。遵守该协议的实体类可以不实现这个方法。

```swift
@objc protocol Foo  
{  
    func requiredFunction()  
    @objc optional func optionalFunction()  
}

class Person : Foo  
{  
    func requiredFunction()  
    {  
        print("Conformance is now valid")  
    }  
}
```

**override**：指明子类会提供自定义实现，覆盖父类的实例方法、类型方法、实例属性、类型属性、下标。如果没有实现，则会直接继承自父类。

```swift
class Person  
{  
    func printInfo()  
    {  
        print("I'm just a person!")  
    }  
}

class Programmer : Person  
{  
    override func printInfo()  
    {  
        print("I'm a person who is a dev!")  
    }  
}

let aPerson = Person()  
let aDev = Programmer()

aPerson.printInfo() //打印 I'm just a person!  
aDev.printInfo() //打印 I'm a person who is a dev!
```

**postfix**：位于值后面的运算符。

```swift
var optionalStr:String? = "Optional"  
print(optionalStr!)
```

**precedence**：指明某个运算符的优先级高于别的运算符，从而被优先使用。

```swift
infix operator ~ { associativity right precedence 140 }  
4 ~ 8
```

**prefix**：位于值前面的运算符。

```swift
var anInt = 2  
anInt = -anInt //anInt 等于 -2
```

**required**：确保编译器会检查该类的所有子类，全部实现了指定的构造器方法。

```swift
class Person  
{  
    var name:String?

    required init(_ name:String)  
    {  
        self.name = name  
    }  
}

class Programmer : Person  
{  
    //如果不实现这个方法，编译不会通过
    required init(_ name: String)  
    {  
        super.init(name)  
    }  
}
```

**right**：指明运算符的结合性是从右到左的。在没有使用大括号时，可以用于正确判断同一优先级运算符的顺序。

```swift
//"??" 运算符结合性是从右到左
var box:Int?  
var sol:Int? = 2

let foo:Int = box ?? sol ?? 0 //Foo 等于 2
```

**set**：通过获取的新值来设置成员的值。同样可以用于计算型属性来间接设置其它属性。如果计算型属性的 setter 没有定义新值的名称，可以使用默认的 newValue。

```swift
class Person  
{  
    var name:String  
    {  
        get { return self.name }  
        set { self.name = newValue}  
    }

    var indirectSetName:String  
    {  
        get  
        {  
            if let aFullTitle = self.fullTitle  
            {  
                return aFullTitle  
            }  
            return ""  
        }

        set (newTitle)  
        {  
            //如果没有定义 newTitle，可以使用 newValue
            self.fullTitle = "(self.name) :(newTitle)"  
        }  
    }  
}
```

**Type**：表示任意类型的类型，包括类类型、结构类型、枚举类型、协议类型。

```swift
class Person {}  
class Programmer : Person {}

let aDev:Programmer.Type = Programmer.self
```

**unowned**：让循环引用中的实例 A 不要强引用实例 B。前提条件是实例 B 的生命周期要长于 A 实例。

```swift
class Person  
{  
    var occupation:Job?  
}

//当 Person 实例不存在时，job 也不会存在。job 的生命周期取决于持有它的 Person。
class Job  
{  
    unowned let employee:Person

    init(with employee:Person)  
    {  
        self.employee = employee  
    }  
}
```

**weak**：允许循环引用中的实例 A 弱引用实例 B ，而不是强引用。实例 B 的生命周期更短，并会被先释放。

```swift
class Person  
{  
    var residence:House?  
}

class House  
{  
    weak var occupant:Person?  
}

var me:Person? = Person()  
var myHome:House? = House()

me!.residence = myHome  
myHome!.occupant = me

me = nil  
myHome!.occupant // myHome 等于 nil
```

**willSet**：属性观察者，在值存储到属性之前调用。

```swift
class Person  
{  
    var name:String?  
    {  
        willSet(newValue) {print("I've got a new name, it's (newValue)!")}  
    }  
}

let aPerson = Person()  
aPerson.name = "Jordan" //在赋值之前，打印 "I've got a new name, it's Jordan!"
```

## 总结
哇噢！

这真是一次有趣的创作。我学会了好多在写之前没想到的东西。但我认为这里的诀窍并不是要把它记住，而是把它当做一份可以用于测验的定义清单。

相反地，我建议你把这份清单放在手边，并时不时地回顾一下。如果你能这样做的话，下一次在不同场景下需要使用特定的关键字，你肯定就能马上回想起来并使用它啦。

下回再见咯。
