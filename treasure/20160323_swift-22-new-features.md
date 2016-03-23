title: "Swift 2.2 的新特性"
date: 2016-03-23 12:00:00
tags: [Swift 2.2]
categories: [原创文章]
permalink: swift-22-new-features
---

作者：[walkingway](http://chengway.in/)

Swift 2.2 随着 iOS 9.3 一同闪亮登场，相较于 Swift 2.1， 2.2 版本做出了许多调整，从其调整方向上我们也能一窥 Swift 3.0 的影子，以下内容主要来自于苹果 Swift 官方 [Blog](https://swift.org/blog/swift-2-2-released/)，接下来就让我们进入正题，一睹 Swift 2.2 的庐山真面目：

<!--more-->
## 允许更多的关键字来做参数标签

[SE-0001: Allow (most) keywords as argument labels](https://github.com/apple/swift-evolution/blob/master/proposals/0001-keywords-as-argument-labels.md)

参数标签是 Swift 中非常 cool 的一个特性，我们可以这么写：

```swift
for i in 1.stride(to: 9, by: 2) {
    print(i)
}
```

这个函数很简单，由 1 开始，每次加 2，返回一系列的值，最后的结果要小于 9：

```
1 3 5 7
```

上面的函数如果参数前没有 `to` 或 `by` 标签，即 `stride(9, 2)` 那么代码将失去自解释性，别人也很难猜到这些参数的实际用途。

又假设我们要获取集合中某个值对应的索引，可以声明如下方法：

```swift
indexOf(value, in: collection)
```

但是注意在 Swift 2.2 之前的版本，上面这种写法 Xcode 会报错，因为 in 是一个关键字，想要使用这些关键字必须加上单引号：

```swift
indexOf(value, `in`: collection)
```

以前我们定义新的 API 的时候，通常也要避免与这些关键字撞车，比如用 `within` 代替 `in`。在我们导入 Objective-C APIs 的时候通常会碰到这些问题：

```swift
event.touchesMatching([.Began, .Moved], `in`: view)
NSXPCInterface(`protocol`: SomeProtocolType.Protocol)
```
而在 Swift 2.2，我们开放了除 `inout`, `var` 和 `let` 以外所有的关键字，现在他们都可以作为参数 label 来使用了（而不用加单引号）关于语法的影响主要注意以下三方面：

1. 函数调用中的关键字可以随意使用了，不会产生什么歧义，因为方法调用时 ":" 总是伴随着参数标签出现。
2. 函数/子类化/初始化 声明：除 `inout`, `var` 和 `let` 这三个关键字之外，使用其他关键字没有什么歧义，因为这些关键字后面总是跟随着 `‘:’` 或 `‘_’` 比如：
    
    ```swift
    func touchesMatching(phase: NSTouchPhase, in view: NSView?) -> Set<NSTouch>
    ```
    假如你想在函数声明中使用 `inout`, `var` 和 `let` 做为参数名的话，还是要加单引号

    ```swift
    func addParameter(name: String, `inout`: Bool)
    ```
3. 如果在函数类型中这三个关键字（`inout`，`var`，`let`）出现的话，是不需要加单引号的，这是因为在这种情况下参数名后总是跟着 ‘:’
    
    ```swift
    (NSTouchPhase, in: NSView?) -> Set<NSTouch>
    (String, inout: Bool) -> Void
    ```

## 元组对象可以进行比较操作了

[SE-0015: Tuple comparison operators](https://github.com/apple/swift-evolution/blob/master/proposals/0015-tuple-comparison-operators.md)

元组是以逗号分割的值列表：

```swift
let developer = ("Numbbbbb", "Shanks")
let designer = ("Cee", "Sai")
```

以前想要比较两个元组，我们需要自己重载操作符

```swift
func ==  (t1: (T, T), t2: (T, T)) -> Bool {
    return t1.0 == t2.0 && t1.1 == t2.1
}
```

抛开每次都要写这一坨无趣的代码不说，而且只能比较包含两个元素的元组。不过在 Swift 2.2 中，我们可以直接比较两个元组了

```swift
let developer = ("Numbbbbb", "Shanks")
let designer = ("Cee", "Sai")

if developer == designer {
    print("Matching tuples!")
} else {
    print("Non-matching tuples!")
}
```

Swift 2.2 允许不超过 6 个元素的元组之间进行比较，限制元组的元素个数主要有两个原因：

+ 每一次比较都需要在基本库中添加额外的代码
+ 元组的元素过多并不是一种好的编程风格，考虑用结构体代替

可以尝试下面两个元组比较

```swift
let developer = ("Numbbbbb", 23)
let designer = ("Cee", "Sai")
```
不出意外地报错了：

![](http://ww2.sinaimg.cn/large/61b207a9jw1f261udwkn2j20sl0lwgz5.jpg)

我们重点关注下结尾的部分：

```
note: overloads for '==' exist with these partially matching parameter lists: ......
((A, B), (A, B)), ((A, B, C), (A, B, C)), ((A, B, C, D), (A, B, C, D)), 
((A, B, C, D, E), (A, B, C, D, E)), ((A, B, C, D, E, F), (A, B, C, D, E, F))
```
Swift 内部函数确实逐字比较了元组的元素，直到 (A, B, C, D, E, F)，没有超过 6 个元素。

## 为 AnySequence.init 增加约束条件

[SE-0014: Constraining AnySequence.init](https://github.com/apple/swift-evolution/blob/master/proposals/0014-constrained-AnySequence.md)

AnySequence 表示一个无类型的序列，他遵循 `SequenceType` 协议，而该协议拥有一个关联类型 `associatedtype SubSequence` ，而有时候我们需要 `SubSequence` 也要满足 `SequenceType` 协议

假如我们有一个 _SequenceBox

```swift
internal class _SequenceBox<S : SequenceType>
    : _AnySequenceBox<S.Generator.Element> { ... }
```
为了确保 SubSequence 满足 SequenceType，要做如下限定：

```swift
internal class _SequenceBox<
  S : SequenceType
  where
    S.SubSequence : SequenceType,
    S.SubSequence.Generator.Element == S.Generator.Element,
    S.SubSequence.SubSequence == S.SubSequence
> : _AnySequenceBox<S.Generator.Element> { ... }
```
反过来，他也会影响 `AnySequence.init` 做一些限定：

修改前的 `AnySequence.init`：

```swift
public struct AnySequence<Element> : SequenceType {
  public init<
    S: SequenceType
    where
      S.Generator.Element == Element
  >(_ base: S) { ... }
}
```
修改后的 `AnySequence.init`：

```swift
public struct AnySequence<Element> : SequenceType {
  public init<
    S: SequenceType
    where
      S.Generator.Element == Element,
      S.SubSequence : SequenceType,
      S.SubSequence.Generator.Element == Element,
      S.SubSequence.SubSequence == S.SubSequence
  >(_ base: S) { ... }
}
```

事实上，这些约束应该被应用到 `SequenceType` 协议自身上（尽管就目前来看是不太可能了），同我们预期的那样每个 `SequenceType` 实现都已经自我满足。

## 在声明相关类型时用 associatedtype 来替换 typealias

[SE-0011: Replace typealias keyword with associatedtype for associated type declarations](https://github.com/apple/swift-evolution/blob/master/proposals/0011-replace-typealias-associated.md)

在 Swift 2.2 以前的版本中关键字 `typealias` 可以用来声明两种类型

1. 类型别名（为已存在的类型起一个别名）
2. 关联类型（作为占位符类型成为协议的一部分）

以上两种声明应该使用不同的关键字，为此我们为关联类型准备了新的关键字 `associatedtype`，因此在 Swift 2.2 中 `typealias` 只能用做类型别名的声明，所以协议中使用的关联类型只能用 `associatedtype`，如果用了 `typealias` 就会报错：

```swift
protocol Prot {
    associatedtype Container : SequenceType
    typealias Element = Container.Generator.Element // error: cannot declare type alias inside protocol, use protocol extension instead
}
```
应将 `typealias` 移到 extension 中去

```swift
protocol Prot {
    associatedtype Container : SequenceType
}
extension Prot {
    typealias Element = Container.Generator.Element
}
```

## 命名函数时带上参数标签

[SE-0021: Naming Functions with Argument Labels](https://github.com/apple/swift-evolution/blob/master/proposals/0021-generalized-naming.md)

因为在 Swift 中，函数是一等公民，所以函数可以赋值给变量，当做普通值传递。为此我们需要一个函数类型来对该变量做限定。通常我们会使用函数名作为主要类型部分，但是有许多基本名字相同的函数，仅仅是参数或参数标签不同而已，比如 `UIView`：

```swift
extension UIView {
  func insertSubview(view: UIView, at index: Int)
  func insertSubview(view: UIView, aboveSubview siblingSubview: UIView)
  func insertSubview(view: UIView, belowSubview siblingSubview: UIView)
}
```

我们调用时也是通过参数标签来区分不同的方法：

```swift
someView.insertSubview(view, at: 3)
someView.insertSubview(view, aboveSubview: otherView)
someView.insertSubview(view, belowSubview: otherView)
```
但是，当我们创建一个函数的引用时，就会产生一个歧义，即无法确定调用的是 UIView 的哪个方法

```swift
let fn = someView.insertSubview // ambiguous: could be any of the three methods
```
我们可以使用类型注解来消除歧义

```swift
let fn: (UIView, Int) = someView.insertSubview    // ok: uses insertSubview(_:at:)
let fn: (UIView, UIView) = someView.insertSubview // error: still ambiguous!
```

但是上面的代码后者因为 (UIView, UIView) 存在两个方法（aboveSubview 和 belowSubview），所以还是存在歧义，只能用闭包的方式来指名传递的方法：

```swift
let fn: (UIView, UIView) = { view, otherView in
  button.insertSubview(view, aboveSubview: otherView)
}
```
这样做法太乏味了，Swift 2.2 现在允许我们将函数命名为：函数名 + 参数标签的组合来消除歧义：

```swift
let fn = someView.insertSubview(_:at:)
let fn1 = someView.insertSubview(_:aboveSubview:)
```

同样的语法也可以用做初始化的引用：

```swift
let buttonFactory = UIButton.init(type:)
```

为指定的方法生成一个 Objective-C 选择器：

```swift
let getter = Selector(NSDictionary.insertSubview(_:aboveSubview:)) // produces insertSubview:aboveSubview:.

```

## 引用 Objective-C 的选择器方法

[SE-0022: Referencing the Objective-C selector of a method](https://github.com/apple/swift-evolution/blob/master/proposals/0022-objc-selectors.md)

在 Swift 2，Objective-C selectors 通常会根据其字面值写成字符串常量，比如 `"insertSubview:aboveSubview:"` 这样比较容易出错，例如下面的：

```swift
navigationItem.rightBarButtonItem = UIBarButtonItem(title: "Tap!", style: .Plain, target: self, action: "buttonTaped")
```

如果你眼神够好，会发现我把 `buttonTapped` 写成了 `buttonTaped`，但 Xcode 也不会给我报错。这一切在 Swift 2.2 终于得到解决，字符串作为 selector 被 deprecated 了，今后该这么写 `#selector(buttonTapped)`，这样发生拼写错误，也能及时得到编译器的提醒。

即使在纯 Swift 环境中（完全与 Objective-C 完全无关），我们也可以通过 **#selector(Swift 方法名)** 的方式来实现 Swift 的 selector

```swift
control.sendAction(#selector(MyApplication.doSomething), to: target, forEvent: event)

extension MyApplication {
  @objc(jumpUpAndDown:)
  func doSomething(sender: AnyObject?) { … }
}
```
创建一个 Selector 的引用

```swift
let sel = #selector(UIView.insertSubview(_:at:)) // produces the Selector "insertSubview:atIndex:"
```

## 编译期 Swift 的版本检查

[SE-0020: Swift Language Version Build Configuration](https://github.com/apple/swift-evolution/blob/master/proposals/0020-if-swift-version.md)

在大部分时候，随着 Swift 版本更新语法也会有较大调整，但是第三方类库的维护者们希望他们的库能够同时兼容不同版本的 Swift，目前可行的办法是同时维护多个分支来支持不同版本的语言。

Swift 2.2 提供了新的选项使你将同一个版本的 Swift 代码集中在同一个文件中，而编译器会在编译时选择具体的 Swift 版本来执行

```swift
#if swift(>=2.2)
print("Running Swift 2.2 or later")
#else
print("Running Swift 2.1 or earlier")
#endif
```

类似于现存的 `#if os()` 构建选项，这个选项决定了编译器随后生成的代码，如果你使用的是 Swift 2.2，那么第二个 `print()` 将不会被看到。

## 其它一些特性

苹果 Swift 官方 Blog 没有提到的 Swift 2.2 一些新特性

### ++ 和 -- 将被取消

Swift 2.2 正式将 `++` 和 `--` **deprecates** 掉了，意味着虽然在 Swift 2.2 版本还能工作，但编译器会给你一个警告。但在 3.0 版本会被完全移除。

你可以使用 += 1 和 -= 1 来替代，至于为什么要将其移除，有这么几个解释：

1. 写 ++ 并不比 +=1 能节省多少时间
2. ++ 对学 Swift 没有任何帮助，+= 至少可读性更好
3. 传统 C styel for 循环中的 -- 也被 deprecated 了

### 传统 C 风格的 for 循环被干掉了

也就是说下面这种写法在 2.2 的版本被 **deprecates** 了

```swift
for var i = 1; i <= 10; i += 1 {
    print("\(i) SwiftGG awesome")
}
```

以后要这么写了：

```swift
for i in 1...10 {
    print("\(i) SwiftGG awesome")
}
```

如果想要创建一个由大到小的范围，你按照下面的写法编译或许没问题，但运行时会崩溃

```swift
for i in 10...1 {
    print("\(i) SwiftGG awesome")
}
```

应当这么写：

```swift
for i in (1...10).reverse() {
    print("\(i) SwiftGG awesome")
}
```

另一种选择是使用标准的快速枚举来遍历数组

```swift
var array = Array(1...10)

for number in array {
    print("\(number) green bottles")
}
```
### 数组和其他一些 slice types 现在有 removeFirst() 方法了

Swift 2.2 终于为我们带来了 removeFirst() 方法，该方法将从数组中移除第一个元素，然后返回给我们，可以试验一下

```swift
var array = Array(1...5)
array.removeFirst()

for number in array {
    print("the \(number) bird")
}
```

>使用 `removeLast()` 时要注意，如果是空数组，会崩溃，因此可以用 `popLast()` 来替代，该方法会处理空数组的情形（返回 nil）

### 元组 splat 语法被废除了

们可以用下面的方式定义一个函数，在 Swift 2.2 之前可以有两种方式调用

```swift
func foo(a : Int, b : Int) {}
```
第一种我们经常使用，为函数的每个参数都传递相对应的值

```swift
foo(42, b : 17)
```

或者我们可以利用一个大部分开发者都不那么熟悉的特性（tuple splat）来调用 

```swift
let x = (1, b: 2)
foo(x)
```

后者这种语法糖实在没什么实际意义，在 Swift 2.2 被 deprecated，将在未来的版本移除。

### var 参数被废除了

var 参数提供的益处微乎其微，而且容易让人与 inout 混淆，因此在 Swift 2.2 中被移除了。

举个例子 sayHello() 函数使用了 var 参数：

```swift
func sayHello(var name: String, repeat repeatCount: Int) {
    name = name.uppercaseString

    for _ in 0 ..< repeatCount {
        print(name)
    }
}

sayHello("numbbbbb", repeat: 5)
```

结果是 **NUMBBBBB** 将会被打印 5 遍，这是因为参数 name 经 var 修饰后成为变量，然后执行 `uppercaseString` 方法转换为大写，如果没有 `var` 关键字，name 是常量，执行 `uppercaseString` 会失败。

var 和 inout 之间的差异非常微妙：

+ 使用 var，让你可以在函数内部修改参数
+ 使用 inout，甚至可以让你的改变延续到函数结束后

我们可以在 Swift 2.2 中这么写：

```swift
func sayHello(name: String, repeat repeatCount: Int) {
    let upperName = name.uppercaseString

    for _ in 0 ..< repeatCount {
        print(upperName)
    }
}

sayHello("numbbbbb ", repeat: 5)
```

### 重命名 debug 标识符：#line, #function, #file

在 Swift 2.1 和之前的版本，使用 `__FILE__`, `__LINE__`, `__COLUMN__`, 和 `__FUNCTION__` 标识符，在编译时会被替换为文件名、行号、列号和函数名。

而在 Swift 2.2 这些旧的标识符被更新为 `#file`, `#line`, `#column` 和 `#function`，如果你之前使用过 Swift 2.0 的 `#available` 来检查 iOS 版本，正如官方所说 **#** 意味这编译器这里要执行替换逻辑。

下面在 `printGreeting()` 函数中演示了新旧两种 debug 标识符：

```swift
func sayHello(name: String, repeat repeatCount: Int) {
    // old - deprecated!
    print("This is on line \(__LINE__) of \(__FUNCTION__)")

    // new - shiny!
    print("This is on line \(#line) of \(#function)")

    let upperName = name.uppercaseString

    for _ in 0 ..< repeatCount {
        print(upperName)
    }
}

sayHello("numbbbbb", repeat: 5)
```