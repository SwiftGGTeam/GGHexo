title: "Swift3 指导手册：基础篇"
date: 2017-01-11
tags: [Swift 3]
categories: [JamesonQuave.com]
permalink: swift-3-tutorial-fundamentals
keywords: Swift3.0,基础
custom_title: 
description: Swift3.0的基础教程

---
原文链接=http://jamesonquave.com/blog/swift-3-tutorial-fundamentals/
作者=Jameson Quave
原文日期=2016-08-29
译者=与狼同行
校对=walkingway
定稿=CMB

<!--此处开始正文-->

在 Swift 3 指导手册中，我们将聚焦如何帮助初学者从一个完完全全的新手到基本掌握 Swift 。这里会使用 Swift 3 来教学。我们编写这个指导的初衷是因为市面上的很多指导手册都已过时了，因此它就不适合仅仅以“ Swift3 有哪些新功能”来行文。我们找了几位有多门语言的编程经验的人士，来教你 Swift 语言的独特性以及如何用好它。

<!--more-->

## 变量和常量

任何 Swift 中的变量要么不变的，要么是可变的。这句话可不要和 `Int`、 `Float` 这些变量类型混淆。变量和常量仅仅是一种视角来描绘持有的值是可修改的(即可变性)，亦或是不能修改的(即不可变性)。
要定义一个常量，使用 `let` 关键字。

举例来说：

```swift
let name = "Jameson"
```

如果你想改变 `name` 的值，会发现没有办法做到，然后 Swift 在编译时会抛出一个错误。

```swift
let name = "Jameson"
name = "Bob"
error: cannot assign to value: 'name' is a 'let' constant
name = "Bob"
~~~~ ^
```

要解决它，我们可以使用 `var` 关键字，来定义一个可以修改的变量：

```swift
var name = "Jameson"
name = "Bob"
```

这次代码就不会报错了。

一般来说，你应该默认去使用 `let` 关键字，除非知道需要使用到 `var` 关键字。这样的方式将会从根本上增加代码的安全性。如果当你定义了常量，之后要去修改它时，你会得到错误提示，可以到那个时候再决定是不是应该使用 `var` 关键字。或者如错误是给你的提示，应该重新去思考当前的逻辑流。一般来说，不可变性优于可变性，它可以帮助开发者少犯错误，并且更容易编写代码。

## 基础类型

在 Swift 中，一个类型被声明的写法是通过声明一个变量，然后紧跟一个冒号，然后是类型名称。例如我们声明一个整型，在 Swift 中类型是 `Int` ，那么你可以如下写法：

```swift
let age: Int = 5
```

相似的，你可以声明一个字符串类型：

```swift
let name: String = "Jameson"
```

Swift 支持类型推断，可以不写具体的类型信息。然后让编译器根据它的初始值来推断它是什么类型的。

```swift
let age = 5
let name = "Jameson"
```

age 和 name 的类型仍然是 Int 和 String ，但是这次我们跳过了类型声明，因为很显然，5 是 Int 类型，而 "Jameson" 是一个字符串。

记住， let 关键字仅仅使值变得不可变。如果我们预测这个 age 的值是可变的，而 name 不是可变的，那么我们应该这么写:

```swift
var age = 5
let name = "Jameson"
```

现在如果要更新 age 的值，可以这么做：

```swift
var age = 5
let name = "Jameson"
age = 25
print(age)
25
```

## 使用字符串

用 `print` 打印命令或者 `String` 的字符串总是很方便。例如，我想要打印一个包含变量 `age` 和变量 `name` 的语句，可以在两个 `String` 变量之间用 `+` 操作符。

```swift
let age = "15"
let name = "Robb"
 
let sentence = name + " is " + age
print(sentence)
Robb is 15
```

改用另外一个方式来拼接 `String`，可以不使用 `+` 操作符，而是在将每一个变量放进一组括号中，并在变量前使用 `\` 反斜杠。

```swift
let sentence = "\(name) is \(age)"
print(sentence)
Robb is 15
```

现在也可以看到同样的效果，但是它更容易阅读和组合。

也许你注意到了， `age` 现在是一个 `String` 类型因为它现在是 "15" 而不是 15，没有了引号。这是因为如果一个字符串和一个整型组合， `Int` 类型将不会自动转型为 `String` 类型，这在组合前是非常重要的一步。

这样的话，以下代码会产生错误。

```swift
let age = 15
let name = "Robb"
 
let sentence = name + " is " + age
print(sentence)
Error: Binary operator '+' cannot be applied to operands of type 'String' and 'Int'
```

因此我们所要做的就是将 `age` 变成一个 `String` 类型的。可以通过强制转型来做到，使用 `String` 的初始化方法，传入一个 `Int` 类型的值作为参数值。

```swift
let age = 15
let name = "Robb"
 
let stringAge = String(age)
 
let sentence = name + " is " + stringAge
print(sentence)
Robb is 15
```

我们创建了一个新的变量叫做 `stringAge` 。然后使用了类型转换，因为字符串插值操作会单独的分析每一个表达式，同样获取到圆括号内的内容。

```swift
let age = 15
let name = "Robb"
 
let sentence = name + " is " + String(age)
print(sentence)
print("\(name) enjoys being \(String(age))")
Robb is 15
Robb enjoys being
15
```

## 可选类型

Swift 中有可选类型的概念。一个可选类型是一个可以为 `nil`、`null` 或者是没有被设置值的变量。一般来说，你可以认为大部分其他编程语言的任何变量都是一个可选类型。一个变量的可选性通过在类型声明时的类型名称后面加上问号符号 ？ 来声明。 因此继续上面的例子，我们知道 `age` 和 `name` 总是会被设置，于是我们也许该添加另外一个可能为 `nil` 的变量。我们来拿 `favoriteColor` 来做一个例子。许多人都会有最爱的颜色，但可能对一部分人来说却没有，或者我们不知道别人的那些数据。因此我们会把它声明为可选类型，并且不对它进行赋值。

```swift
var favoriteColor: String?
```

在对可选类型的声明中如果不进行赋值，那么它就是 `nil` 的。你可以使用 print 函数来对它进行打印来证实这个观点。

```swift
var favoriteColor: String?
print(favoriteColor)
nil
```

我们之后将对 `favoriteColor` 进行赋值，然后发现它不再是 `nil` 的。

```swift
var favoriteColor: String?
favoriteColor = "Blue"
print(favoriteColor)
Optional("Blue")
```

我们发现结果不是 `"Blue"` ，而是 `Optional("Blue")` 。那是因为实际值仍然包裹在可选类型之中。
你可以认为可选类型就像一个生日礼物，像礼物盒外面那层精美的包装纸，拆开他们之后，也许里面什么都没有。这对某些过生日的人真是个残忍的礼物，不过这确实真的会发生。也许礼物盒中确实会有真的礼物，可也得拆开并且实际去看才知道，现在它只是一个没有被拆开，躺在我们手中的一个盒子。

如果我们想知道里面是什么，需要马上拆开礼物，对可选类型来说也是一样，当传递和使用它们时，实际我们只是在和一个也许有值的容器在打交道。就像礼物一样，可选类型在被使用之前必须被解包。

Swift 中声明一个可选类型可以不赋值，编译也会通过。但是如果我们声明这些变量时不加上可选类型的符号，那么就会报错。

```swift
var favoriteColor = "Blue"
favoriteColor = nil
error: nil cannot be assigned to type 'String'
```

同样，非可选类型在声明的时候也不能被赋值为 `nil`。

```swift
var favoriteColor: String
error: variables must have an initial value
```

## 解包

我们现在知道可选类型是什么了，它们可以使变量可以为空，也知道与其说它们是值不如说是一个容器。因此，在项目中要访问可选类型中的内容时，我们该怎么做？

第一，最普遍的方式是使用可选类型绑定，在可选绑定中，你可以在一个 if 语句中把可选类型的值赋给一个新的值。如果可选类型包含一个值，那个新的变量就会被成功设置，并且跟随 `if` 语句的代码闭包也会成功执行。
来看例子，这里将声明两个可选类型，一个叫做 favoriteAnimal ，它被设置值为 Fox ，而另外一个是 favoriteSong 我们并没有对它进行赋值。

```swift
var favoriteAnimal: String?
var favoriteSong: String?
 
favoriteAnimal = "Fox"
```

现在我们使用可选绑定来看一看编程变量是否都有值，我们可以打印出包含它们值的语句。首先先来检查一下 favoriteAnimal。

```swift
if let unwrappedFavoriteAnimal = favoriteAnimal {
    print("Favorite animal is: " + unwrappedFavoriteAnimal)
}
Favorite animal is: Fox
```

当没有被设置值时，仅仅会触发 `else` 语句，或者如果连 `else` 语句都没有，那么什么都不会触发。

```swift
if let unwrappedFavoriteSong = favoriteSong {
    print("Favorite song is: " + unwrappedFavoriteSong)
}
else {
    print("I don't know what your favorite song is!")
}
I don't know what your favorite song is!
```

如果我们要解包多个可选类型，并且对它们进行逻辑处理，首先要检查它们：

```swift
var favoriteAnimal: String?
var favoriteSong: String?
 
favoriteAnimal = "Fox"
favoriteSong = "Shake it Off"
 
if let unwrappedFavoriteSong = favoriteSong {
    if let unwrappedFavoriteAnimal = favoriteAnimal {
        print(unwrappedFavoriteSong + " " + unwrappedFavoriteAnimal)
    }
}
```

这看上去非常杂乱，因此 Swift 提供一种简便方式来一次解包多个变量：

```swift
var favoriteAnimal: String?
var favoriteSong: String?
 
favoriteAnimal = "Fox"
favoriteSong = "Shake it Off"
 
if let unwrappedFavoriteSong = favoriteSong,
    let unwrappedFavoriteAnimal = favoriteAnimal {
    print(unwrappedFavoriteSong + " " + unwrappedFavoriteAnimal)
}
```

## 集合类

Swift 有好几种集合类型，最常用的是数组、集合、字典。

### 数组

我们首先来看一下数组的例子。

```swift
let starks: [String] = ["Eddard", "Catelyn", "Robb", "Sansa"]
```

这里我们定义了一个基本的 `Array` 类型，它是字符串数组类型 `[String]`。
这个方括号暗示了它是一个存放字符串对象的数组，而不是一个字符串类型。一般来说，Swift 可以通过检测所赋的初值进行类型推断。

```swift
let starks = ["Robb", "Sansa", "Arya", "Jon"]
```

我们可以有多种方式访问数组中的元素，比如通过 `Int` 类型的下标，或者调用各种集合类型的方法。

```swift
let starks = ["Robb", "Sansa", "Arya", "Jon"]
print( starks[0] )
print( starks[2] )
print( starks.first! )
Robb
Arya
Robb
```

你应该发现数组是以 0 为下标开始的，因此数组中的第一个元素 `"Robb"` 可以通过 `stack[0]` 来访问。
另外，可能你会发现使用 first 方法返回的是一个可选值。而下标访问器返回的并不是一个可选值。如果访问数组中没有出现的下标，程序将会在运行时报错。因此在通过下标访问时检查数组的长度：

```swift
if starks.count >= 4 {
    print( starks[3] )
}
```

有几种方式可以自动的检查这个类型，但是因为一些性能原因它不会默认去做。

### 哈希类型/字典

字典可以存储键值对，键的典型类型是字符串类型，但它也可以是 Swift 中的其他各种类型。在下面这个例子中，我们会创建一个基本字典，以字符串为键，整型为值。

```swift
let ages = ["Robb": 15, "Sansa": 12, "Arya": 10, "Jon": 15]
```

我们可以访问这些值通过 `String` 的键

```swift
print( ages["Arya"]! )
print( ages["Jon"]! )
10
15
```

要注意的是，我们解包这些值只是因为它们是可选值,它们有可能为 `nil`

使用可选绑定来解包字典中的值是较安全的，特别是你认为这些值很有可能为 `nil` 时

```swift
if let aryasAge = ages["Arya"] {
    print("Arya is \(aryasAge) years old")
}
Arya is 10 years old
```

我们也可以把数组存储在字典中，或者把字典存储在数组中，或者把他们混合使用。

```swift
let families = [
    "Stark": ["Robb": 15, "Sansa": 12, "Arya": 10, "Jon": 15],
    "Baratheon": ["Joffrey": 13, "Tommen": 8]
]
let tommensAge = families["Baratheon"]!["Tommen"]!
print("Tommen is \(tommensAge) years old")
Tommen is 8 years old
```

这个 houses 的类型将会是 `[String: [String: Int]]`
另外一个角度也可以说，这是一个字符串为键，以 `[String: Int]` 为值的一个字典。

### 集合

Swift3 中的集合和数组很相似，但集合的值是唯一的和无序的。

初始化一个集合看起来就像初始化一个数组，唯一不同的是类型：

```swift
let colors: Set<String> = ["Blue", "Red", "Orange", "Blue"]
```

代码创建了一个字符串的集合。大于和小于符号 `"<"">"` 暗示 Swift 中的泛型类型，你可能注意到了 `"Blue"` 在列表中出现了两次，但是如果我们把颜色打印出来，马上就会发现：

```swift
let colors: Set<String> = ["Blue", "Red", "Orange", "Blue"]
print(colors)
```

```
["Orange", "Red", "Blue"]
```

你也许还注意到了顺序也不一致了，因为集合不会维持特定的顺序。

我们无法像访问数组下标一样的方式去访问集合。但是可以用集合中内置的方法来增加或者删除元素，可以通过 `contains` 方法来查看是否集合中包含了该元素。

```swift
var colors: Set<String> = ["Blue", "Red", "Orange", "Blue"]
colors.insert("Black")
colors.insert("Black")
colors.remove("Red")
print(colors)
print(colors.contains("Black"))
print(colors.contains("Red"))
```

```swift
["Black", "Orange", "Blue"]
true
false
```

构造集合对象最常见的方式就是罗列哪些元素应该纳入列表，哪些元素应该被排除。

这里还有许多方法我还没有提到，我建议你去阅读一下苹果的官方文档关于这三种集合类型，这样就会对它们更了解。

## 元组

元组并不是一种集合，而应该说是用一个标识符来表示多个不同变量。

```swift
let fullName = ("Jameson", "Quave")
```

`(String, String)` 是一个元组类型，我们可以使用点语法来访问每一个元组的成员，看看下面的情况：

```swift
let fullName = ("Jameson", "Quave")
print(fullName.1)
print(fullName.0)
```

```swift
Quave
Jameson
```

元组也可以用一个新的多个变量名来构造：

```swift
let (first, last) = ("Jameson", "Quave")
print(first)
```

```
Jameson
```

由于我们没有用到 last name，可以忽略那个值通过使用下划线 _ ，并且仍然构造 first name。

```swift
let (first, _) = ("Jameson", "Quave")
print(first)
```

```
Jameson
```

当你在使用方法时想返回多个返回值时，元组会很有用。

## 控制流

Swift 的控制流比起其他语言要优雅，我们先从 `if` 和 `else` 语句这些基本层面着手：

```swift
if 10 > 5 {
  print("10 is greater than 5.")
}
else {
    print("10 is not greater than five.")
}
```

```swift
10 is greater than 5
```

你也可以用括号来包裹 `if` 语句的条件：

```swift
if (10 > 5) {
...
```

Swift 也支持 `switch` 语句，在编译期的时候检查你是否已经覆盖了所有的可能条件，如果你没有覆盖所有的条件，你得加上 `defualt:case` 来处理一些没有考虑到的情况：

```swift
let name = "Jameson"
switch(name) {
case "Joe":
  print("Name is Joe")
case "Jameson":
  print("This is Jameson")
default:
  print("I don't know of this person!")
}
```

```
This is Jameson
```

由于此处 name 的值是 `"This is Jameson"`。我们匹配到了第二个条件，然后执行下面这行。

```swift
print("This is Jameson")
```

如果我们把名称设置为一些之前没有出现在列举情况的东西时，比如 `"Jason"` ，`switch` 将会自动落入默认的情况：

```swift
let name = "Jason"
switch(name) {
case "Joe":
  print("Name is Joe")
case "Jameson":
  print("This is Jameson")
default:
  print("I don't know of this person!")
}
```

```
I don't know of this person!
```

## 循环和集合类型

Swift3 不再支持你过去所使用的 C 风格的循环，取而代之的是使用枚举和 `for-each` 风格的循环，语法是 for element in array 

```swift
let names = ["Robb", "Sansa", "Arya", "Jon"]
 
for name in names {
    print("Name: \(name)")
}
```

```
Name: Robb
Name: Sansa
Name: Arya
Name: Jon
```

如果你想要循环整个数组，这个写法就很棒，没有 C 风格的数组，如果我们循环遍历一系列数字呢？Swift 中的 `Range` 和 `Stride` 给出了答案，如果想要打印到 10 里面3的倍数，可以使用 Range 通过使用语法 1...10 表示从 1 到 10 。然后我们打印每一个数字，那些数字都被 `%` 符号除以 3 ，并且检查它们的余数是不是都是0。

```swift
for i in 1...10 {
    if i % 3 == 0 {
        print(i)
    }
}
```

```
3
6
9
```

另外一种方式是通过 `stride` 每隔三个元素访问一次。`stride` 可以用很多方法来创建，但是最常见的是  `stride(from: , to:, by:)`，`from value` 就是跨步访问的起初值，然后 `by` 是每隔多少跨步值才能访问到 `to` 值。听起来有点绕，让我们来看实际的代码：

```swift
let byThrees = stride(from: 3, to: 10, by: 3)
for n in byThrees {
    print(n)
}
```

```
3
6
9
```

从英语来看十分好读，你也可以说你从 3 数到 10 每隔3个数。这里我们创造 `stride` 并且用一个变量 byThrees 来存储他们的值，但是也可以直接在循环中使用它们。

```swift
for n in stride(from: 3, to: 10, by: 3) {
    print(n)
}
```

```
3
6
9
```

集合都有一个 `indices` 属性用于循环中使用，它会返回一个集合的下标数组，非常适合访问或者过滤集合中某些元素的情况。这里回到我们的名称集合的例子，如果想要前三个名称，可以这样写：

```swift
let names = ["Robb", "Sansa", "Arya", "Jon"]
for nameIndex in names.indices {
    if(nameIndex < 3) {
        print(names[nameIndex])
    }
}
```

```
Robb, Sansa, Arya
```

在集合中还有枚举的方法，它允许你通过遍历下标和值：

```swift
let names = ["Robb", "Sansa", "Arya", "Jon"]
for (index, name) in names.enumerated() {
    print("\(index): \(name)")
}
```

```
0: Robb
1: Sansa
2: Arya
3: Jon
```

在 Swift3 中还有很多方式来遍历对象，但他们通常不是很常用。

也许你已经发现我们的循环中同时给两个变量赋值，index 和 name。它们被用逗号分隔并被括号括起来，表示我们从 `enumerated()` 返回的两个被命名的变量。

本篇文章快速总结了一下 Swift 3 中手册中比较基础的部分，下一章，我将带领你们在真是项目中去演练我们所学到的知识，做到活学活用。