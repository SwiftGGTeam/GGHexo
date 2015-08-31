Swift面试题及答案
> 更多优秀译文请关注我们的微信公众号：learnSwift

> 原文链接：[Swift Interview Questions and Answers](http://www.raywenderlich.com/110982/swift-interview-questions-answers) 
> 原文日期：2015/08/25

> 译者：[lfb_CD](http://weibo.com/lfbWb)
> 校对：[lfb_CD](http://weibo.com/lfbWb)
> 定稿：[lfb_CD](http://weibo.com/lfbWb)

####写在前面的话：
译文中有许多链接和代码是我为方便读者阅读添加的---我可是一名有情怀的译者

***

虽然swift才发布不到一年的时间，但它已经成为最流行的开发语言之一了。
事实上，Swift，是一种复杂的语言，同时面向对象和面向函数，并且它仍然还在不断推出新的版本。

Swift有很多东西，但是你怎么能测试你学了多少？在这篇文章中，raywenderlich.com团队和我一起列了一个列表-有关swift的面试问题。
你可以用这些问题来测试面试者的Swift知识，或者测试你自己的！如果你不知道答案，不要担心，每一个问题都有一个答案。



#### 问题分成了两部分：
1.笔试题目(Written questions)：可以通过电子邮件来进行编程测试，需要写一些代码。
2.口头提问(Verbal questions)：可以很好的在电话或面对面的面试中询问，适用于口头回答。

另外，每部分都分为三个等级：
* 初级：适合初学者阅读，已经读过一两本有关Swift的书籍，并已经在自己的应用程序使用了Swift。
* 中级：适合某些对语言有浓厚兴趣的人，阅读过很多有关Swift的博客文章，并想进一步进行尝试。
* 高级：适合顶尖的-专注同时享受在程序语言里探索，挑战自己，并使用尖端技术的人。

如果你想试着回答这些问题，建议你打开Playground。所有答案都已经在Xcode 7 Beta 6中测试过。
准备好了吗？Buckle up（系好安全带？），开始了！

###### 注：特别感谢团队成员 Warren Burton, Greg Heo, Mikael Konutgan, Tim Mitra, Luke Parham, Rui Peres, and Ray Wenderlich 

## Written Questions（书面的问题）

### Beginners（初学者）
你好，padowan（应该是指学徒，也就是我们。。）。我将开始检测你的基本知识。
#### 问题#1-Swift 1.0 or later
想有一个更好的方式来写这里的循环范围？

```
for var i = 0; i < 5; i++ {
	print("Hello!")
}
```

>##### 答案： 
```
for i in 0...4 {
  print("Hello!")
}
```
Swift实现了二元操作符、闭区间操作符(...)和半闭区间操作符(..<)。第一个的范围(...)包括所有的值。例如，下面包含所有的整数，从0到4：
 ```
 0...4
 ```
半闭区间操作符(..<)不包含最后一个元素。以下产生相同的0至4整数的结果：
```
0..<5
```

#### 问题#2-Swift 1.0 or later
思考如下代码：

```
struct Tutorial {
  var difficulty: Int = 1
}
var tutorial1 = Tutorial()
var tutorial2 = tutorial1
tutorial2.difficulty = 2
```
tutorial1.difficulty和tutorial2.difficulty的值是什么呢？如果是一个类，又是什么呢？为什么？
>##### 答案：  
tutorial1.difficulty is 1, 
tutorial2.difficulty is 2.
Swift的struct是值类型，它们被复制的是值，而不是引用。下面的代码是创建一份tutorial1的拷贝并将其分配到tutorial2：
```
var tutorial2 = tutorial1
```
从这段代码开始，对tutorial2任何改变都不会影响到tutorial1。
如果Tutorial是类，tutorial1.difficulty和tutorial2.difficulty都会是2。Swift的类是引用类型。对tutorial1属性的任何变化会反映到tutorial2，反之亦然。

#### 问题#3-Swift 1.0 or later
view1是用var声明的，而view2是用let声明的。这里的区别是什么，最后一行又可以编译通过么？

```
import UIKit
var view1 = UIView()
view1.alpha = 0.5
let view2 = UIView()
view2.alpha = 0.5 // Will this line compile?
```
>##### 答案： 
view1是一个变量，可以被重新分配到一个新的UIView的实例。用let你只可以赋值一次，所以这段的代码不能编译通过：
```
view2 = view1 // Error: view2 is immutable
```
但是，UIView是一个类的引用，所以你可以改变View2属性（这意味着最后一行可以编译通过）：
```
let view2 = UIView()
view2.alpha = 0.5 // Yes!
```

#### 问题#4-Swift 1.0 or later
下面这段代码将数组按字母进行了排序，看起来很复杂，请尽可能的简化它。
```
let animals = ["fish", "cat", "chicken", "dog"]
let sortedAnimals = animals.sort { (one: String, two: String) -> Bool in
  return one < two
}
```

>##### 答案：
先简化参数。类型推导系统可以自动计算出闭包中的参数类型，所以我们可以去掉参数：
```
let sortedAnimals = animals.sort { (one, two) -> Bool in return one < two }
```
返回值的类型也可以被推断，所以扔掉它：
```
let sortedAnimals = animals.sort { (one, two) in return one < two }
```
符号$i可以代替参数名称：
```
let sortedAnimals = animals.sort { return $0 < $1 }
```
在单语句闭包中，返回关键字可以省略。最后一个语句的返回值就是闭包的返回值：
```
let sortedAnimals = animals.sort { $0 < $1 }
```
这已经很简单了，但还不够，不要停！
对于字符串，有一个比较函数定义如下：
```
func <(lhs: String, rhs: String) -> Bool
```
这个小功能使你的代码更整洁：
```
let sortedAnimals = animals.sort(<)
```
注意，这里的每一步都是能编译和输出相同的结果的，并且你做了一个字符的闭包！

#### 问题#5-Swift 1.0 or later
这段代码创建了2个类、Address和Person，并且创建了2个实例来表示Ray和Brian。

```
class Address {
  var fullAddress: String
  var city: String 
  init(fullAddress: String, city: String) {
    self.fullAddress = fullAddress
    self.city = city
  }
}
class Person {
  var name: String
  var address: Address
  init(name: String, address: Address) {
    self.name = name
    self.address = address
  }
}
var headquarters = Address(fullAddress: "123 Tutorial Street", city: "Appletown")
var ray = Person(name: "Ray", address: headquarters)
var brian = Person(name: "Brian", address: headquarters)
```
假设brian搬到街对面的新大楼，所以你更新了他的地址：

```
brian.address.fullAddress = "148 Tutorial Street"
```
但是，仔细想一下这儿有什么问题，发生了什么？这是怎么回事？

>##### 答案： 
Ray的address.fullAddress也跟着改变了！Address是一个类，并且具有引用的语义。headquarters是同一个实例，无论您访问它通过Ray或Brian，改变headquarters的Address将改变它的两个。
解决方案是重新分配给Brian一个新的Address，或设置Address为struct而不是class。

### Intermediate（中级）
现在，开始挑战困难点的问题。你准备好了吗？
#### 问题#1-Swift 2.0 or later
思考下列代码：

```
var optional1: String? = nil
var optional2: String? = .None
```
nil和.None有什么区别？optional1和optional1变量有何不同？

>##### 答案：
其实没有区别。Optional.None（.None是缩写）是初始化一个可选变量(没有值)的正确写法，而不只是语法糖.None。
下面的验证代码的输出是true：
```
nil == .None // On Swift 1.x this doesn't compile. You need Optional<Int>.None
```
请牢记，在底层下，optional是枚举类型：
```
enum Optional<T> {
  case None
  case Some(T)
}
```

#### 问题#2-Swift 1.0 or later
这是温度计的模型，一个class和一个struct：

```
public class ThermometerClass {
  private(set) var temperature: Double = 0.0
  public func registerTemperature(temperature: Double) {
    self.temperature = temperature
  }
}
let thermometerClass = ThermometerClass()
thermometerClass.registerTemperature(56.0)
public struct ThermometerStruct {
  private(set) var temperature: Double = 0.0
  public mutating func registerTemperature(temperature: Double) {
    self.temperature = temperature
  }
} 
let thermometerStruct = ThermometerStruct()
thermometerStruct.registerTemperature(56.0)
```
这段代码编译出错，请问哪里错了？为什么错了？

###提示：仔细阅读并思考一下，在Playground上测试它。
>##### 答案： 
编译器会在最后一行报错。正确的thermometerstruct声明与变异函数来改变其内部的温度变化，但编译器报错是因为registertemperature创建实例是通过let的，因此它是不变的。
在结构体中，函数改变内部状态必须得是可变数据类型，即用var声明的。

#### 问题#3-Swift 1.0 or later
下面这段代码会print出什么？为什么？

```
var thing = "cars"
let closure = { [thing] in
  print("I love \\(thing)")
}
thing = "airplanes"
closure()
```
>##### 答案：
它会打印“I love cars”。当闭包被声明的时候，capture list（捕获列表？）会创建一份拷贝，所以capture(捕获)的值不会改变，即使将一个新值赋值给一个。
如果在闭包中省略了capture list（捕获列表？），则编译器将使用一个引用而不是复制。在这种情况下，当被调用时该变量的任何变化都会产生变化。如下面的代码所示：
看不太懂就直接看代码吧= =
```
var thing = "cars"
let closure = {    
  print("I love \\(thing)")
}
thing = "airplanes"
closure() // Prints "I love airplanes"
```

#### 问题#4-Swift 2.0 or later
这里有一个全局函数来计算数组中 “值是唯一” 的数目：

```
func countUniques<T: Comparable>(array: Array<T>) -> Int {
  let sorted = array.sort(<)
  let initial: (T?, Int) = (.None, 0)
  let reduced = sorted.reduce(initial) { ($1, $0.0 == $1 ? $0.1 : $0.1 + 1) }
  return reduced.1
}
```

你可以这样使用这个方法：

```
countUniques([1, 2, 3, 3]) // result is 3
```
请把这个函数重写为数组的扩展方法，使得你可以按照下面代码那样使用：

```
[1, 2, 3, 3].countUniques() // should print 3
```

>##### 答案： 
在Swift2.0中，泛型可以通过强制类型约束来进行扩展。如果泛型不满足约束，则该扩展既不可见也不可访问。
```
extension Array where Element: Comparable {
  func countUniques() -> Int {
    let sorted = sort(<)
    let initial: (Element?, Int) = (.None, 0)
    let reduced = sorted.reduce(initial) { ($1, $0.0 == $1 ? $0.1 : $0.1 + 1) }
    return reduced.1
  }
}
```
注意新方法只有在当前的数据类型实现了Comparable的协议时才可用。比如，如果你这样调用的话编译器会报错：
```
import UIKit
let a = [UIView(), UIView()]
a.countUniques() // compiler error here because UIView doesn't implement Comparable
```

#### 问题#5-Swift 2.0 or later

这里有一个函数来计算给定的两个double的可选数据类型的除法。在执行除法之前，需要满足三个条件：

* dividend不为空
* divisor不为空
* divisor不为0

```
func divide(dividend: Double?, by divisor: Double?) -> Double? {
  if dividend == .None {
    return .None
  }
  if divisor == .None {
    return .None
  }
  if divisor == 0 {
    return .None
  }
  return dividend! / divisor!
}
```
代码虽然能工作，但有2个问题：

* 它的条件可以guard语句
* 它使用了强制拆包(那个!)不安全

请使用guard语句改进这个函数，避免使用强制拆包。


>##### 答案： 
如果条件不符合，新的guard语句在Swift2.0提供了返回值。检查条件是非常有用的，因为它提供了一个清晰的方式表达方式--如果不需要对语句进行嵌套的话。这里就是一个例子：
```
guard dividend != .None else { return .None }
```
也可以结合可选数据类型，使得访问变量在guard检查之后：
```
guard let dividend = dividend else { return .None }
```
所以divide函数可以这样写：
```
func divide(dividend: Double?, by divisor: Double?) -> Double? {
  guard let dividend = dividend else { return .None }
  guard let divisor = divisor else { return .None }
  guard divisor != 0 else { return .None }
  return dividend / divisor
}
```
另外，你还可以合并guard语句，使函数看起来更简单：
```
func divide(dividend: Double?, by divisor: Double?) -> Double? {
  guard let dividend = dividend, divisor = divisor where divisor != 0 else { return .None }
  return dividend / divisor
}
```


### Advanced（高级）
#### 问题#1-Swift 1.0 or later
思考下面的结构体，一个温度计的模型：

```
public struct Thermometer {
  public var temperature: Double
  public init(temperature: Double) {
    self.temperature = temperature
  }
}
```
创建一个实例，可以很容易地使用这个代码：

```
var t: Thermometer = Thermometer(temperature:56.8)
```

但它有更好地初始化方式：

```
var thermometer: Thermometer = 56.8
```
怎么实现？

>##### 答案：
Swift定义了下面的协议，使用赋值操作符将一个类型的类型进行初始化：
* NilLiteralConvertible
* BooleanLiteralConvertible
* IntegerLiteralConvertible
* FloatLiteralConvertible
* UnicodeScalarLiteralConvertible
* ExtendedGraphemeClusterLiteralConvertible
* StringLiteralConvertible
* ArrayLiteralConvertible
* DictionaryLiteralConvertible
采用相应的协议，提供一个公共的初始化方法用来实现特定类型的文字初始化。在Thermometer下，实现FloatLiteralConvertible协议如下：
```
extension Thermometer : FloatLiteralConvertible {
  public init(floatLiteral value: FloatLiteralType) {
    self.init(temperature: value)
  }
}
```
现在你可以用一个简单的浮点数据来创建一个实例。 
```
var thermometer: Thermometer = 56.8
```

#### 问题#2-Swift 1.0 or later
Swift拥有一组预定义的运算符，执行不同类型的操作，例如算术或逻辑。它还允许创建自定义操作，一元或二元。

按照以下要求自定义并实现一个 ^^ 幂运算符：

* 以两个整数作为参数
* 返回第一个参数与第二个参数的幂运算
* 不用考虑潜在溢出错误


>##### 答案： 
创建一个新的自定义操作符需要两步：声明和实现。
这部分我不太会翻译，是关于自定义操作符的，这里有Swift的相关资料（http://www.yiibai.com/swift/custom_operators.html）
这是声明：
```
infix operator ^^ { associativity left precedence 155 }
```
实现的代码如下：
```
import Foundation
func ^^(lhs: Int, rhs: Int) -> Int {
  let l = Double(lhs)
  let r = Double(rhs)
  let p = pow(l, r)
  return Int(p)
}
```

请注意，它没有考虑溢出情况；如果操作产生的结果不能用int代表。比如大于int.max，会发生运行时错误。

#### 问题#3-Swift 1.0 or later
你能用这样的原始值来定义一个枚举吗？为什么？

```
enum Edges : (Double, Double) {
  case TopLeft = (0.0, 0.0)
  case TopRight = (1.0, 0.0)
  case BottomLeft = (0.0, 1.0)
  case BottomRight = (1.0, 1.0)
}
```

>##### 答案：
不能。一个原始值类型必须：
*  符合合理的协议
*  从下列任一个类型中转换的：
	* Int
	* String
	* Character

>在上面的代码中，原始类型是一个元组，是不符合条件的。

#### 问题#4-Swift 1.0 or later
考虑下面的代码定义的Pizza结构体和Pizza协议，以及扩展，包含有makemargherita()默认实现的一个方法：

```
struct Pizza {
  let ingredients: [String]
}
protocol Pizzeria {
  func makePizza(ingredients: [String]) -> Pizza
  func makeMargherita() -> Pizza
}
extension Pizzeria {
  func makeMargherita() -> Pizza {
    return makePizza(["tomato", "mozzarella"])
  }
}
```
现在餐厅Lombardis 的定义如下：

```
struct Lombardis: Pizzeria {
  func makePizza(ingredients: [String]) -> Pizza {
    return Pizza(ingredients: ingredients)
  }
  func makeMargherita() -> Pizza {
    return makePizza(["tomato", "basil", "mozzarella"])
  }
}
```
下面的代码创建两个Lombardis的实例。哪一个会成功调用margherita做出basil（一种面）？

```
let lombardis1: Pizzeria = Lombardis()
let lombardis2: Lombardis = Lombardis()
lombardis1.makeMargherita()
lombardis2.makeMargherita()
```
>##### 答案： 
都能。Pizzeria协议声明makemargherita()方法提供了一个默认的实现。该方法是在lombardis实现重写。在这两种情况下声明的方法，在运行时都能正确执行。
如果协议没有声明makemargherita()方法，但在扩展中还提供了一个默认的实现呢？
```
protocol Pizzeria {
  func makePizza(ingredients: [String]) -> Pizza
} 
extension Pizzeria {
  func makeMargherita() -> Pizza {
    return makePizza(["tomato", "mozzarella"])
  }
}
```
在这种情况下，只有lombardis2做出Pizza，而lombardis1没有做出Pizza，因为lombardis1会去使用在扩展中定义的makeMargherita方法方法。它没有声明makeMargherita方法，就不会去调用结构体里面的那个makeMargherita方法。

#### 问题#5-Swift 2.0 or later
以下代码编译时有错误。你能发现哪里出错了么，为什么会发生错误？

```
struct Kitten {
} 
func showKitten(kitten: Kitten?) {
  guard let k = kitten else {
    print("There is no kitten")
  }
  print(k)
}
```
Hint: There are three ways to fix it.

>##### 答案：
else里面需要退出路径，使用return，或者抛出一个异常或声明这是一个@noreturn的方法。最简单的解决方案是添加返回语句。
```
func showKitten(kitten: Kitten?) {
  guard let k = kitten else {
    print("There is no kitten")
    return
  }
  print(k)
}
```
添加抛出异常的方法。
```
enum KittenError: ErrorType {
  case NoKitten
}
struct Kitten {
}
func showKitten(kitten: Kitten?) throws {
  guard let k = kitten else {
    print("There is no kitten")
    throw KittenError.NoKitten
  }
  print(k)
}
try showKitten(nil)
```
最后一个方法，调用fatalerror()方法，表明这是一个@noreturn方法。
```
struct Kitten {
} 
func showKitten(kitten: Kitten?) {
  guard let k = kitten else {
    print("There is no kitten")
    fatalError()
  }
  print(k)
}
```

# Verbal questions 口头的提问

到达这一步你已经很优秀了，但是你还不能自称为绝地武士（意思是还不能认为自己很厉害了）任何人都只要够努力都可以解决上面那些代码，但是你如何处理下面这些不断出现的理论知识和实践问题呢
回答这些问题仍然需要你在Playground里实际操作

## 初级

### Question #1 - Swift 1.0 or later
什么是可选数据类型？它解决了什么问题？
>#### 答案：
可选数据类型是用来表示一个数据类型缺少具体值。在Objective-C中,只有引用类型才允许没有具体值，用的是`nil`来表示。比如`float`数据类型没有这样的特性

>Swift用可选数据类型扩展了值类型和引用数据类型。可选数据类型任何时候都允许拥有具体值或者为`nil`

### Question #2 - Swift 1.0 or later
什么时候使用结构体，我们什么时候又应该使用类呢？

>#### 答案：
>有一个正在进行的讨论，关于过度使用类超过结构体这究竟是好还是坏。 
> 函数式编程倾向于多使用值数据类型，而面向对象编程更倾向于使用类。
> 在Swift中，类和结构体有很多不同的特性。可以得出下面这样一份总结：

>* 类支持继承，结构体不行
>* 类是引用类型，结构体是值类型
>
我们并没有一个规则来判定使用哪一个是最好。一般的建议是在能够达到你目标的前提下且使用到的代价最小(结构体比类更加占用内存空间)。除非你需要用到继承或者是引用的语法，否则那就采用结构体。

>更多关于类和结构体的细节问题请查阅这篇文章：
[detailed post on the matter.](https://www.mikeash.com/pyblog/friday-qa-2015-07-17-when-to-use-swift-structs-and-classes.html)(我们还在翻译中..)

注意：在运行时，结构体比类具有更高性能的因为结构体的方法调用是静态绑定的，而类的方法调用是在运行时动态解析。这是另一个很好的理由来使用结构体，而不是使用类。


### Question #3 - Swift 1.0 or later
什么是泛型，它们又解决了什么问题？
>#### 答案：
泛型是用来使代码能安全工作。在Swift中，泛型可以在函数数据类型和普通数据类型中使用，例如类、结构体或枚举。

>泛型解决了代码复用的问题。有一种常见的情况，你有一个方法，需要一个类型的参数，你为了适应另一种类型的参数还得重新再写一遍这个方法。
比如，在下面的代码中，第二个方法是第一个方法的“克隆体”：
>
>```
func areIntEqual(x: Int, _ y: Int) -> Bool {
  return x == y
}
func areStringsEqual(x: String, _ y: String) -> Bool {
  return x == y
}
areStringsEqual("ray", "ray") // true
areIntEqual(1, 1) // true
```
>一个Objective-C开发者可能会采用`NSObject`来解决问题：
>
```
import Foundation
func areTheyEqual(x: NSObject, _ y: NSObject) -> Bool {
  return x == y
}
areTheyEqual("ray", "ray") // true
areTheyEqual(1, 1) // true
```
>这段代码能达到了目的，但是编译的时候并不安全。它允许一个字符串和一个整型数据进行比较：
>
```
areTheyEqual(1, "ray")
```
程序可能不会崩溃，但是允许一个字符串和一个整型数据进行比较可能不会得到想要的结果。
采用泛型的话，你可以将上面两个方法合并为一个，并同时还保证了数据类型安全。这是实现代码：
>
```
func areTheyEqual<T: Equatable>(x: T, _ y: T) -> Bool {
  return x == y
}
areTheyEqual("ray", "ray")
areTheyEqual(1, 1)
```

### Question #4 - Swift 1.0 or later
偶尔你也会不可避免地使用隐式可选类型。那请问什么时候我们需要这么做？为什么需要这么做？
>#### 答案：
>最常见的情况是：

>>1. 不为nil的才能初始化它的值。一个典型的例子是一个界面生成器的出口(Interface Builder outlet)，它总是在它的本体初始化后初始化。在这种情况下，如果它在界面构建器(Interface Builder)中正确地配置了，就能够保证在使用前outlet不为nil的。
>>
>>2.为解决强引用循环问题（不知道循环引用是什么的可以看我们翻译的Swift官方文档[自动引用计数篇](http://wiki.jikexueyuan.com/project/swift/chapter2/16_Automatic_Reference_Counting.html)）。当2个实例互相引用时，就需要一个不为nil的引用指向另一个实例。引用的一边可以修饰为unowned，另一边使用隐式可选类型，便可解决循环引用问题。
>>为方便大家理解我贴段代码上来(原文是没用的)

>>```
class Customer {
    let name: String
    var card: CreditCard?
    init(name: String) {
        self.name = name
    }
    deinit { print("\(name) is being deinitialized") }
}
class CreditCard {
    let number: UInt64
    unowned let customer: Customer
    init(number: UInt64, customer: Customer) {
        self.number = number
        self.customer = customer
    }
    deinit { print("Card #\(number) is being deinitialized") }
}
```

>理解得不太清楚可以点开上面链接查看

小贴士：尽量不要使用隐式可选类型。使用它们会增加运行时崩溃的几率。在某些情况下，出现崩溃也许是程序员需要这么做，这里也有一个更好的方法来达到同样的效果，例如，使用fatalerror()。

### Question #5 - Swift 1.0 or later
你知道有哪些解包的方式？它们是否是安全解包的？
>#### 答案：
>ps：下面代码为译者本人为方便读者阅读而添加，如还有不理解的地方可以根据关键字搜索相关文档
>
>
>* 强制用!展开 -- 操作不安全
>* 声明隐式可选类型变量		--	在许多情况下是不安全的
> 
>	```
(var implicitlyUnwrappedString: String!)
```
>* optional binding	--	安全
>
>	```
var count: Int?
count = 100
if let validCount = count {
    "count is " + String(validCount)    //count is 100
} else {
    "nil"
}
```
>* 新的Swift2 guard声明	--	安全
>* 自判断链接--安全
>
>	```
if let roomCount = john.residence?.numberOfRooms {
    println("John's residence has \(roomCount) room(s).")
} else {
    println("Unable to retrieve the number of rooms.")
}
```
>* nil -- 安全

## 中级

渐渐地你挑战了这里。也许你之前问题解决得很好，但是让我们看看你是否能很好地通过下面这些问题。

### Question #1 - Swift 1.0 or later
Swift是一种面向对象的语言还是一种面向函数的语言？
>#### 答案：
Swift是一种混合语言，同时支持这两种范式。

>它实现了三种面向对象的基本原则
>
* 封装
* 继承
* 多态
>
当Swift作为一种面向函数的语言来理解时，会有不同却相似的方式来定义它。
其中一种是较为常见的维基百科上的："…a programming paradigm [...] that treats computation as the evaluation of mathematical functions and avoids changing-state and mutable data."
“……编程范式[……]，将数学函数作为一种值，不需要考虑其中的状态变化和数据变化。”

>你要觉得Swift是一个门成熟的面向函数的编程语言是比较牵强的，但它确实也具有很多面向函数编程的基本要素。

### Question #2 - Swift 1.0 or later
下列哪些特性是Swift含有的？

1. 泛型类
2. 泛型结构
3. 泛型接口

>#### 答案：
>* Swift中包括了上述的1和2。泛型可以在类，结构体，枚举全局方法或者普通方法中使用。
>* 3用typealias实现了。它本身不是一个泛型类型，它是一个占位符名称。它通常被称为关联类型，当一个协议声明时使用。如果有不明白的可查看[喵神的文章](http://swifter.tips/typealias/)

### Question #3 - Swift 1.0 or later
在Objective-C语言中，常量可以被定义如下：

```
const int number = 0;
```
这是Swift对应的代码:

```
let number = 0
```
请问它们有什么区别么？如果有，你能解释下它们之间的区别么？
>#### 答案：
`const` 是一个变量在编译时初始化的值或着是在编译时解决初始化的。
>
`let`声明的常数是在运行的时候创建，它最终可以被初始化为静态或者动态的表达式。注意它的值只能被分配一次。

### Question #4 - Swift 1.0 or later
Swift声明一个静态属性或静态函数可以使用static来修饰。这是一个结构体的例子：

```
struct Sun {
  static func illuminate() {}
}
```
对于类，可以使用static或class来修饰。他们可以达到同样的目标，但实际上他们是不同的。你能解释他们有什么不同吗？
>#### 答案：
使用static声明的一个静态属性或者方法并不可被覆盖override(子类覆盖父类的方法)。
使用class就可以覆盖。
>
当用在类里的时候，static相当于class final
比如在下面这段代码中你如果覆盖`illuminate()`编译器就会报错
>
```
class Star {
  class func spin() {}
  static func illuminate() {}
}
class Sun : Star {
  override class func spin() {
    super.spin()
  }
  override static func illuminate() { // error: class method overrides a 'final' class method
    super.illuminate()
  }
}
```

### Question #5 - Swift 1.0 or later
可以使用扩展添加存储属性吗？

>#### 答案：
no，这是不可能的。扩展可以为已经存在的数据类型添加新的行为，但是不允许改变类型本身或它的接口。
如果您添加了存储的属性，您需要额外的内存来存储新的值。扩展不能完成这样的任务。

##高级
噢，孩子，你是个聪明的人，对吗？那就一步一步向上攀爬吧。

### Question #1 - Swift 1.2 or later
在Swift1.2中，你可以解释一下声明一个枚举类型的泛型的问题么？

以一个含有两个泛型参数`T`和`V`的枚举`Either`为例，用`T`作为`Left`的相关值类型，`V`作为`Right`的相关值类型：

```
enum Either<T, V> {
  case Left(T)
  case Right(V)
}
```
小贴士：检查这种情况应该在一个Xcode中的项目中，不是在Playground上。还得注意，这个问题是Swift 1.2相关的，所以你需要Xcode 6.4。

>#### 答案：
编译失败的错误消息：
>
```
unimplemented IR generation feature non-fixed multi-payload enum layout
```
出现的问题是，不能确定`T`需要的内存大小。分配内存大小时取决于`T`本身的数据类型，枚举需要一个可知的固定大小的值类型。
>
最常用的解决方法是把泛型用引用类型进行包装，一般起名为`Box`，代码如下：
>
```
class Box<T> {
  let value: T
  init(_ value: T) {
    self.value = value
  }
} 
enum Either<T, V> {
  case Left(Box<T>)
  case Right(Box<V>)
}
```
这个问题只在Swift 1.0或者以上出现，但是2.0已经解决了。

### Question #2 - Swift 1.0 or later
闭包是值类型还是引用类型的？
>#### 答案：
闭包是引用类型。如果一个闭包被分配给一个变量，该变量被复制到另一个变量，它们实际是引用的相同一个闭包并且它里面的参数列表也同样会被复制。

### Question #3 - Swift 1.0 or later
`UInt`数据类型用于存储整数。它实现了从一个带符号的整数转化为`UInt`的初始化方式：

```
init(_ value: Int)
```
然而，如果您提供了一个负值，例如下面的代码会产生一个编译错误：

```
let myNegative = UInt(-1)
```
我们知道负数在内部是使用补码表示，你怎么才能把一个负数的`Int`转化为`UInt`，同时保持它在内存中的表示形式？

>#### 答案：
这儿有一个初始化的方式：
>
```
UInt(bitPattern: Int)
```

### Question #4 - Swift 1.0 or later
你能描述一下你用Swift时遇到的循环引用么？你是怎么解决的？
>#### 答案：
循环引用是指两个实例彼此强引用,导致内存泄漏,因为两个实例都不会被收回。原因是只要有一个强引用，实例就不会被回收。你可以通过 `weak` 或者 `unowned` 引用 替换其中一个强引用，从而打破强引用循环
>
想了解更多可以查看我们翻译的Swift官方文档里的有关章节[自动引用计数篇](http://wiki.jikexueyuan.com/project/swift/chapter2/16_Automatic_Reference_Counting.html)

### Question #5 - Swift 2.0 or later
Swift2.0增添了一个新关键字实现递归枚举。这里有一个枚举包含一个`Node`,`Node`有两个的相关的值类型，`T`和`List`:

```
enum List<T> {
    case Node(T, List<T>)
}
```
请问那个可以实现递归枚举的关键字是什么？
>#### 答案：
>
`indirect`
>
代码如下：
>
```
enum List<T> {
    indirect case Cons(T, List<T>)
}
```

# 之后的方向？
恭喜你看到了文章末尾，如果你确实不太清楚那些答案，希望你也不要感到沮丧！

其中的一些问题很复杂,Swift是一个非常丰富、且富有表现力的语言。我们还有很多需要学。此外,苹果不断改善Swift与添加新的功能,所以非常有可能还存在一些非常好用的但是我们并不知道的(言外之意就是让我们多研究)。

To get to know Swift or build upon what you already know, be sure to check out our in-depth, tutorial-rich book, [Swift by Tutorials](http://www.raywenderlich.com/store/swift-by-tutorials), or sign up for our hands-on tutorial conference [RWDevCon](http://www.rwdevcon.com/)!


当然，最根本的资料当然还是由苹果公司写撰写的[The Swift Programming Language](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/) (ps：肯定还有我们翻译的[Swift中文版](http://wiki.jikexueyuan.com/project/swift/)撒！)

最后,使用一门语言才是学习语言最好的方式。只需要你在Playground上写写或在一个真正的项目使用Swift。Swift几乎可以与objective-c无缝地混合,所以建立一个你已经非常熟悉的现有项目是一个很好的方法来学习Swift的来龙去脉。

感谢您的阅读和解决以上这些问题所做出的努力!你也可以在评论中留下你的问题或者一些你的发现。我也不介意你提出一些你项目中遇到的问题。我们可以互相学习。咱们论坛上见！

***
第一次翻译这么长的文章，也许会有翻译错误的地方，大家可以在评论中帮忙指出。

