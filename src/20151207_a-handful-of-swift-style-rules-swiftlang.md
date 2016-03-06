title: "几个 Swift 代码规范"
date: 2015-12-07
tags: [Swift 进阶]
categories: [Erica Sadun]
permalink: a-handful-of-swift-style-rules-swiftlang

---
原文链接=http://ericasadun.com/2015/11/17/a-handful-of-swift-style-rules-swiftlang/
作者=Erica Sadun
原文日期=2015-11-17
译者=mmoaay
校对=lfb_CD
定稿=shanks


我们需要经常带着新问题来重新审视一下以前的代码规范。

<!--more-->

**[Kevin](http://twitter.com/Eridius) 提供的一套规范**：“如果尾部的闭包参数是函数式的就用圆括号。如果是程序式的就用花括号。”

```
myCollection.map({blah}).filter({blah}).etc
myCollection.forEach {} // 或者 
dispatch_after(when, queue) {}
```

样式一致性与闭包是否有返回值相关。目前存在的争议是我们是否应该在尾部花括号的左边留空格。

**`self` 的使用规范**：“当[编译器可以自动推断](http://ericasadun.com/2015/04/21/swift-occams-code-razor/)成员类型时，你就可以在使用隐式成员表达式时省略 `self`。但无论何时，只要一个方法调用会反射到一个实例，就要使用 `self`。“

仔细考虑下面 `for` 循环语句中的 `where` 分支。`contains` 方法就是在没有明确对象的情况下调用的。那是谁做了 `contains` 操作呢? 因为方法参数中没有传入容器对象，所以这个对象只能是调用这个方法的实例。

```
for (flagLessOne, string) in strings.enumerate() 
    where contains(
        Features(rawValue: 1<<(flagLessOne + 1))) {
    nameArray.append(string)
}
```

完全合格的调用明确指出了原本模糊不清的对象，同时极大滴提高了代码的可读性：

```
for (flagLessOne, string) in strings.enumerate() 
    where self.contains(
        Features(rawValue: 1<<(flagLessOne + 1))) {
    nameArray.append(string)
}
```

**条件级联绑定的规范**：“除非你做的是 `var` 和 `let` 混合的条件绑定，只用一个 `if let` 或者 `if var` 就可以了，需要的话可以自由添加空格。“

不要使用下面的方式：

```
if let x = x, let y = y, let z = z {blah}
```

使用这种：

```
if let x = x, y = y, z = z {blah}
```

省略多余的 `let` 关键字可以让级联绑定更加简洁，而且 Xcode 会帮你对这些代码的格式进行很好的调整：

```
if let
    x = x,
    y = y,
    z = z {
    ...blah...
}
```

尽管级联绑定避免了 pre-Swift 2 中的“鞭尸金字塔(pyramids of doom)“，但它们又导致了“恐怖便秘块(constipated blocks of horror)“的问题。这种问题主要出现在下面两种情况：

 - 存在大量的串行绑定，再加上空行和注释时（就像下面的代码）
 - 使用了一系列 `guard` 语句时。

```
if let
    // 以字典的方式访问 JSON 
    json = json as? NSDictionary,

    // 检查结果数组
    resultsList = json["results"] as? NSArray,

    // 提取第一项
    results = resultsList.firstObject as? NSDictionary,

    // 提取名字和价格
    name = results["trackName"] as? String, 
    price = results["price"] as? NSNumber {

    // ... blah blah ...
  }
```

**模式匹配关键字的规范**：“如果都是绑定，那就要把绑定组合起来。”

通过把关键字移动到元组外面的方式来把多模式匹配绑定组合起来。将下面的代码：

```
if case (let x?, let y?) = myOptionalTuple {
    print(x, y)
}
```

替换为：

```
if case let (x?, y?) = myOptionalTuple {
    print(x, y)
}
```

**`isEmpty` 的使用规范**：“如果你在检测一个集合元素的个数，你可能就是在犯错。”用 `isEmpty` 替换 `count == 0`。

**`void` 的使用规范**：“使用 `void` 返回类型，而不是 `()`。”下面是一个返回 `-> Void` 而不是 `-> ()` 的方法。

```
func doThis() -> Void 
func notThis() -> ()
```

**`!` 的使用规范**：“每当你在 Swift 中用惊叹号的时候，一只小猫就会死。”尽可能的避免使用强制转换和强制解包。

**创建集合的规范**：“使用显式类型和空集合。”类型在赋值操作符的左边，空实例在赋值操作符的右边。

把下面的代码：

```
var x = [String: Int]() // 以及
var y = [Double]()
var z = Set<String>()
var mySet = MyOptionSet()
```

替换为：

```
var x: [String: Int] = [:]
var y: [Double] = []
var z: Set<String> = []
var mySet: MyOptionSet = []
```

[引用](https://twitter.com/_jackhl/status/646723367576276992)

“[Mike Ash](http://mikeash.com/)”的冒号规范：“右侧加上空格，而左侧不需要。”Or no soup for you!

应该使用：

```
[key: value] // 以及
struct Foo: MyProtocol
```

而不是：

```
[key : value]
struct Foo : MyProtocol
```

**从 Objective-C 过来的规范**：

 - 不要在 if 和 switch 条件两边或者 return 关键词上加 Objective-C 样式的圆括号。
 - 为所有常量使用“骆驼拼写法”，如 allTheConstants 而不是 ALL_CAPS
 - 用 Swift 的构造器替代传统的，例如：用 `CGPoint(x: 1, y:1)` 替代 `CGPointMake(1, 1)`
 - 避免使用行尾分号，尽管这样是可以编译通过的。但是它们会让你的代码看起来很糟糕，而且用起来体验也很差。

**更新**

当然，这不是说说而已，我已经在代码中进行了实践：

![这里写图片描述](/img/articles/a-handful-of-swift-style-rules-swiftlang/Screen-Shot-2015-11-18-at-10.31.13-AM.png1449449055.5795417)

github [代码地址](https://github.com/erica/testlint)


