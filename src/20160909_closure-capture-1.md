title: "闭包捕获语义第一弹：一网打尽！"
date: 2016-09-09
tags: [Swift]
categories: [Crunchy Development]
permalink: closure-capture-1
keywords: swift闭包捕获
custom_title: Swift 闭包捕获系列一：闭包是如何捕获变量的
description: Swift 的闭包也有着不同的捕获语义，本文介绍的就是 Swift 闭包是如何工作来捕获变量的实现过程。

---
原文链接=http://alisoftware.github.io/swift/closures/2016/07/25/closure-capture-1/
作者=Olivier Halligon
原文日期=2016-07-25
译者=walkingway
校对=小锅
定稿=CMB

<!--此处开始正文-->

尽管现在已经是 ARC 的天下了，但对于程序员来说理解内存管理和对象的生命周期依然是一门必修课。对于在 Swift 当中广泛应用的闭包就是其中一个特殊的例子，与 Objc 的闭包相比，Swift 的闭包也有着不同的捕获语义。下面让我们看看闭包是如何工作的。

<!--more-->

## 介绍

在 Swift 中，闭包捕获他们所引用的变量：虽然这些变量在闭包之外声明，但只要在闭包内使用都会默认被闭包保留引用（retain），这是为了确保闭包执行时，这些变量还活着（译者注：没有被提前释放）。

在文章接下来的部分，我们来定义一个简单的 `Pokemon`（口袋妖怪）类：

```swift
class Pokemon: CustomDebugStringConvertible {
  let name: String
  init(name: String) {
    self.name = name
  }
  var debugDescription: String { return "<Pokemon \(name)>" }
  deinit { print("\(self) escaped!") }
}
```

接下来声明一个简单的函数，他接受一个闭包作为参数，然后在一段时间后执行这个闭包（使用 GCD）。下面的例子展示了闭包是如何捕获外部变量的。

```swift
func delay(seconds: NSTimeInterval, closure: ()->()) {
  let time = dispatch_time(DISPATCH_TIME_NOW, Int64(seconds * Double(NSEC_PER_SEC)))
  dispatch_after(time, dispatch_get_main_queue()) {
    print("🕑")
    closure()
  }
}
```

> 在 Swift 3 中，上面的函数应该变成下面这种形式：

```swift
func delay(seconds: Int, closure: ()->()) {
  let time = DispatchTime.now() + .seconds(seconds)
  DispatchQueue.main.after(when: time) {
    print("🕑")
    closure()
  }
}
```

## 默认的捕获语义

现在，先从一个简单的例子开始：

```swift
func demo1() {
  let pokemon = Pokemon(name: "Mewtwo")
  print("before closure: \(pokemon)")
  delay(1) {
    print("inside closure: \(pokemon)")
  }
  print("bye")
}
```

这个例子看上去很简单，但它有趣的地方在于闭包的运行被推迟了 1 秒钟，所以当 demo1() 函数执行完毕后，闭包才开始执行；并且 1 秒后当闭包被执行的时候 `Pokemon` 实例依然存活着。

```
before closure: <Pokemon Mewtwo>
bye
🕑
inside closure: <Pokemon Mewtwo>
<Pokemon Mewtwo> escaped!
```

这是因为闭包捕获（强引用）了 `pokemon` 变量：编译器发现在闭包内部引用了 `pokemon` 变量，它会自动捕获该变量（默认是强引用），所以 `pokemon` 的生命周期与闭包自身是一致的。

因此，闭包有点像精灵球 😆，只要你持有着~~精灵球~~闭包，`pokemon` 变量也就会在那里，不过一旦~~精灵球~~闭包被释放，引用的 `pokemon` 也会被释放。

在这个例子中，一旦 GCD 执行完毕，闭包就会被释放，所以 `pokemon` 的 `deinit` 方法也会被调用。

> 如果 Swift 没有自动捕获 pokemon 变量，这就意味着当执行到 demo1 函数结尾时，pokemon 变量将会脱离作用域，随后当闭包执行时，pokemon 就已经不存在了...这可能会导致程序崩溃。
> 幸亏 Swift 足够聪明，闭包会自动为我们捕获 `pokemon`。接下来我们会学习在必要时如何弱捕获（弱引用）这些变量。

## 被捕获的变量在执行时才取值

有一点值得注意的是 **Swift 在闭包执行时才会取出捕获变量的值**[^1]。我们可以认为它之前捕获的是变量的引用（或指针）。

这里有一个有趣的例子：

```swift
func demo2() {
  var pokemon = Pokemon(name: "Pikachu")
  print("before closure: \(pokemon)")
  delay(1) {
    print("inside closure: \(pokemon)")
  }
  pokemon = Pokemon(name: "Mewtwo")
  print("after closure: \(pokemon)")
}
```

你能猜猜打印的结果吗？答案如下：

```
before closure: <Pokemon Pikachu>
<Pokemon Pikachu> escaped!
after closure: <Pokemon Mewtwo>
🕑
inside closure: <Pokemon Mewtwo>
<Pokemon Mewtwo> escaped!
```

请注意我们在创建完闭包之后修改了 `pokemon` 对象，闭包延迟一秒后执行（虽然此时已经脱离了 `demo2()` 函数的作用域），我们打印的结果是新的 `pokemon` 对象，而不是旧的！这是因为 Swift 默认捕获的是变量的引用。

具体的细节为：首先初始化一个值为 Pikachu 的 `pokemon` 对象，接着修改该对象的值为 Mewtwo（译者注：创建了新对象），之前值为 Pikachu 的对象由于没有其他变量强引用，所以会被释放。接着闭包等待一秒钟执行，打印捕获 pokemon 变量（引用）的内容。

这个特性对于值类型也是一样的，关于这一点或许会有些奇怪，比如下面例子中的 `Int` 类型：

```swift
func demo3() {
  var value = 42
  print("before closure: \(value)")
  delay(1) {
    print("inside closure: \(value)")
  }
  value = 1337
  print("after closure: \(value)")
}
```

打印结果：

```swift
before closure: 42
after closure: 1337
🕑
inside closure: 1337
```

你没看错，闭包打印了新的整型变量值---尽管整型变量是值类型！---因为它捕获了变量的引用，而不是变量自身的内容！

## 你可以修改闭包中捕获的变量

如果捕获的是变量 `var`（而不是常量 `let`），你也可以**在闭包中**[^2]修改它的值。

```swift
func demo4() {
  var value = 42
  print("before closure: \(value)")
  delay(1) {
    print("inside closure 1, before change: \(value)")
    value = 1337
    print("inside closure 1, after change: \(value)")
  }
  delay(2) {
    print("inside closure 2: \(value)")
  }
}
```

代码的打印结果如下：

```
before closure: 42
🕑
inside closure 1, before change: 42
inside closure 1, after change: 1337
🕑
inside closure 2: 1337
```

变量 `value` 的值在闭包内部被修改了（尽管它已经被捕获了，但并不等同于一个常量拷贝，它依然保持着对原变量的引用）。接着第二个闭包执行时打印的就是这个新值了，此刻第一个闭包已经执行完毕并释放了所有的引用，而且 `value` 变量也脱离了 `demo4()` 函数的作用域。

## 捕获一个变量作为一个常量拷贝

如果想要在闭包**创建时**捕获变量的值，而不是在闭包执行时才去获取变量的值，你可以使用 **捕获列表**

捕获列表写在闭包的方括号之间，紧跟闭包的左括号（并且在闭包的参数或返回类型之前）[^3]

在创建闭包时捕获变量的值（而不是变量的引用），你可以使用 `[localVar = varToCapture]` 捕获列表。看上去像这样：

```swift
func demo5() {
  var value = 42
  print("before closure: \(value)")
  delay(1) { [constValue = value] in
    print("inside closure: \(constValue)")
  }
  value = 1337
  print("after closure: \(value)")
}
```

打印结果：

```
before closure: 42
after closure: 1337
🕑
inside closure: 42
```

与上面的 `demo3()` 比较，这次闭包打印的是变量创建时的值，而不是后来赋的新值 1337，即使整个闭包的执行是在对变量重新赋值之后。

这就是 `[constValue = value]` 在闭包中所做的事情：在闭包创建时捕获变量 value 的内容 --- 而不是变量的引用。

## 回到 Pokemon 上

正如我们上面所看到的：如果一个变量是引用类型---就像我们的 Pokemon 类，闭包并没有真正（强引用）捕获变量的引用，而是捕获了一个针对原始实例 pokemon 的拷贝：

```swift
func demo6() {
  var pokemon = Pokemon(name: "Pikachu")
  print("before closure: \(pokemon)")
  delay(1) { [pokemonCopy = pokemon] in
    print("inside closure: \(pokemonCopy)")
  }
  pokemon = Pokemon(name: "Mewtwo")
  print("after closure: \(pokemon)")
}
```

这类似创建了一个中间变量指向同一个 pokemon，然后捕获了这个中间变量：

```swift
func demo6_equivalent() {
  var pokemon = Pokemon(name: "Pikachu")
  print("before closure: \(pokemon)")
  // here we create an intermediate variable to hold the instance 
  // pointed by the variable at that point in the code:
  let pokemonCopy = pokemon
  delay(1) {
    print("inside closure: \(pokemonCopy)")
  }
  pokemon = Pokemon(name: "Mewtwo")
  print("after closure: \(pokemon)")
}
```

事实上，使用捕获列表完全等同于上述代码的行为...除了中间变量 `pokemonCopy` 属于闭包的局部变量，只能在闭包内部访问。 

相比 `demo2()` 直接使用 `pokemon`，`demo6()` 则使用了 `[pokemonCopy = pokemon] in …`，`demo6()` 输出如下：

```
before closure: <Pokemon Pikachu>
after closure: <Pokemon Mewtwo>
<Pokemon Mewtwo> escaped!
🕑
inside closure: <Pokemon Pikachu>
<Pokemon Pikachu> escaped!
```

以下是详细过程：

+ 皮卡丘（Pikachu）被创造。
+ 接着闭包捕获了 Pikachu 的拷贝（这里实际上是捕获了 pokemon 变量的值）。
+ 所以当我们紧接着为 pokemon 变量赋新值 “Mewtwo” 后，“Pikachu” 还没有被释放，依然被闭包所保留。
+ 当我们离开 `demo6` 函数的作用域，Mewtwo 就被释放了，在方法内部 pokemon 变量自身只被一个强引用所保持，离开作用域强引用也就消失了。
+ 稍后闭包执行时，打印了 `"Pikachu"`，这是因为在闭包创建时，捕获列表就捕获了 **Pokemon**。
+ 最后 GCD 释放了闭包，由此可以证明闭包保持了口袋妖怪皮卡丘（Pikachu pokemon）的引用。

与此刚好相反，我们来分析下 `demo2` 的代码：

+ 皮卡丘（Pikachu）被创造。
+ 闭包只捕获了 `pokemon` 变量的**引用**，而不是捕获其所包含的值 **Pickachu**
+ 所以当 pokemon 随后被分配了一个新值 `"Mewtwo"`，此时没有任何对象的强引用指向 Pikachu，它也会立即被释放。
+ 因此闭包稍后执行打印的结果也是 **Mewtwo**
+ 在闭包执行完毕后 GCD 会释放闭包，此时 Mewtwo pokemon 会随闭包一起被释放。

## 知识点整合

上面的知识点都掌握了吗？我承认，确实有点多...

下面是一个人为设计的例子，它包含了闭包创建时就对变量取值---归功于捕获列表，以及先捕获变量的引用，而真正的取值放到闭包执行时这两种情形：

```swift
func demo7() {
  var pokemon = Pokemon(name: "Mew")
  print("➡️ Initial pokemon is \(pokemon)")

  delay(1) { [capturedPokemon = pokemon] in
    print("closure 1 — pokemon captured at creation time: \(capturedPokemon)")
    print("closure 1 — variable evaluated at execution time: \(pokemon)")
    pokemon = Pokemon(name: "Pikachu")
    print("closure 1 - pokemon has been now set to \(pokemon)")
  }

  pokemon = Pokemon(name: "Mewtwo")
  print("🔄 pokemon changed to \(pokemon)")

  delay(2) { [capturedPokemon = pokemon] in
    print("closure 2 — pokemon captured at creation time: \(capturedPokemon)")
    print("closure 2 — variable evaluated at execution time: \(pokemon)")
    pokemon = Pokemon(name: "Charizard")
    print("closure 2 - value has been now set to \(pokemon)")
  }
}
```

能猜猜打印结果是什么吗？可能有点难猜，不过这是一个很好的练习，通过自己判断打印结果来测试你是否掌握了今天的课程...

![](http://alisoftware.github.io/assets/pokemon-drumroll.gif)

下面是打印结果，你猜对了吗？

```
➡️ Initial pokemon is <Pokemon Mew>
🔄 pokemon changed to <Pokemon Mewtwo>
🕑
closure 1 — pokemon captured at creation time: <Pokemon Mew>
closure 1 — variable evaluated at execution time: <Pokemon Mewtwo>
closure 1 - pokemon has been now set to <Pokemon Pikachu>
<Pokemon Mew> escaped!
🕑
closure 2 — pokemon captured at creation time: <Pokemon Mewtwo>
closure 2 — variable evaluated at execution time: <Pokemon Pikachu>
<Pokemon Pikachu> escaped!
closure 2 - value has been now set to <Pokemon Charizard>
<Pokemon Mewtwo> escaped!
<Pokemon Charizard> escaped!
```

所以，到底发生了什么？稍微有点复杂，让我给大家来逐步解释一下：

1. 把 ➡️ `pokemon` 一开始设置为 `Mew`
2. 创建闭包 1 并且它的新本地变量 `capturedPokemon` 捕获了 `pokemon` 的值（此刻 `pokemon` 的值为 `New`，并且闭包也捕获了 `pokemon` 变量的引用，`capturedPokemon` 和 `pokemeon` 都会在闭包代码中使用）
3. 🔄 然后将 `pokemon` 修改为 `Mewtwo`
4. 创建闭包 2，它的新本地变量 `capturedPokemon` 捕获了 `pokemon` 的值（此刻 `pokemon` 的值为 `Mewtwo`，并且闭包也捕获了 `pokemon` 变量的引用，`capturedPokemon` 和 `pokemeon` 都会在闭包代码中使用）
5. 此刻，`demo7()` 函数已经执行完毕了
6. 一秒钟后，GCD 执行第一个闭包
    
  + 它的打印结果为 `Mew`，即第二步创建闭包时捕获在 `capturedPokemon` 变量中的值
  + 它也会根据所捕获 `pokemon` 的引用，找出变量的当前值，它目前为 `Mewtwo`（至少是在第五步离开 `demo7()` 函数前的值）
  + 然后将变量 `pokemon` 的值改为 `Pikachu`（再次强调，闭包捕获的是变量 `pokemon` 的引用，所以 demo7() 函数中的 `pokemon` 变量与闭包中进行赋值操作的 `pokemon` 变量具有同的引用）
  + 当闭包执行完毕被 GCD 释放后，没有对象在强引用 `Mew` 了，因此会释放掉。但是第二个闭包的 `capturedPokemon` 依然捕获着 `Mewtwo`，并且第二个闭包也捕获了 `pokemon` 变量的引用，此刻它的值为 `Pikachu`

7. 🕑 又过了一秒钟，GCD 开始执行第二个闭包
  
  + 它的打印结果为 `Mewtwo`，即步骤四第二个闭包创建时捕获在 `capturedPokemon` 变量中的值
  + 它也会根据所捕获 `pokemon` 的引用，找出变量的当前值，它目前为 `Pikachu`（因为在第一个闭包中已经修改了它）
  + 最后，将 `pokemon` 变量设置为 `Charizard`，由于 Pikachu 小精灵只被 `pokemon` 变量强引用，而此时 `pokemon` 已不再指向它了，所以也会立即被释放。
  + 当闭包执行完毕被 GCD 释放后，本地变量 `capturedPokemon` 脱离了作用域，所以 `Mewtwo` 会被释放，同时指向 `pokemon` 变量的强引用也会消失，小精灵 `Charizard` 也会被释放
 
## 总结

是不是感觉有点烧脑？这很正常，闭包捕获语义有时候会比较复杂，尤其类似最后那个例子。我们要记住下面几个关键点：

+ 在 Swift 闭包中使用的所有外部变量，闭包会自动捕获这些变量的引用
+ 在闭包**执行时**，**会根据这些变量引用得到所对应的具体值**
+ 因为我们捕获的是变量的引用（而不是变量自身的值），**所以你可以在闭包内部修改变量的值**（当然变量要声明为 `var`，而不能是 `let`）
+ **你可以在闭包创建时获取变量中的值**，然后把它存储到本地常量中，而不是捕获变量的引用。我们可以使用带中括号的捕获列表来实现。

今天的课程就先学到这里，或许有些难以理解。不要犹豫，[打开你的 Playground 尝试测试、修改、运行这些代码](http://alisoftware.github.io/assets/Closure-Capture.playground.zip)，直到你彻底理解了其中的原理。

一旦你理解了以上内容，就可以期待我的下一篇文章了，接下来我会讨论捕获弱变量（weakly）来避免循环引用，以及闭包中的 `[weak self]` 和 `[unowned self]` 意味着什么。

> 感谢 [@merowing](https://twitter.com/merowing_) 和我在 Slack 上针对所有的闭包语义所做的讨论，包括在闭包执行时才对捕获变量取值的事实。大家感兴趣的话，可以访问他的 [blog](http://merowing.info/) 😉

1. 对于熟悉 Objective-C 的同学已经注意到 Swift 的行为和 Objective-C 的默认闭包语义不同，而是有些类似于 Objective-C 中的变量带一个 __block 修饰符。

2. 与 ObjC 的默认行为不同...更像是在 Objective-C 中使用 `__block`。

3. 注意即使在我们的例子中仅捕获了一个变量，在捕获列表中你可以列出不止一个捕获的变量，这就是为什么称它为列表（lists）的原因。并且即使没有显式地写出闭包参数列表，你依然要将 `in` 关键字放置于捕获列表的后面，和闭包正文分隔开来。
