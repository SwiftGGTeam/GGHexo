Swift 运算符重载简介"

> 作者：COSMIN PUPĂZĂ，[原文链接](http://www.appcoda.com/operator-overloading-swift/)，原文日期：2016-03-29
> 译者：[zltunes](http://zltunes.com)；校对：[shanks](http://codebuild.me/)；定稿：[小锅](http://www.swiftyper.com)
  









在任何一门计算机编程语言中，运算符重载都是非常强大的特性之一，因此苹果决定为 Swift 也提供这一机制。然而，"能力越强责任越大"。利用运算符重载你很容易实现一些奇怪的场景，例如用减法运算符实现两数相加，或者用乘法运算符实现两数相除，但这显然都不是你希望出现的。

好了，闲话少叙 —— 让我们看看运算符重载究竟是怎么一回事。

<!-- more -->

## 挑战
这一小节的任务很简单：扩展乘法运算符的标准功能，使其适用于字符串。你将会用到字符串拼接运算符，想象一下这种用法：

    "abc" * 5 = "abc" + "abc" + "abc" + "abc" + "abc" = "abcabcabcabcabc"

正式编码之前，思考一下应该怎么做，分几步来实现。我的做法是这样的：

- 定义变量 `result` 并进行初始化 —— 默认字符串。
- 从 2 开始循环，一直到待拼接的字符串数目终止，每次迭代只做一件事 —— 把字符串拼接到 `result` 末尾。
- 打印 `result`。

算法大致就是这样，接下来让我们付诸实践。

## 基本运算符重载
![](http://www.appcoda.com/wp-content/uploads/2016/03/learn-operator-overloading-1.png)
启动 Xcode 并新建一个 playground 文件。删除原有代码，添加乘法运算符的函数原型：

    func *(lhs: String, rhs: Int) -> String {
     
    }

函数有两个参数 —— 左操作数是 `String` 类型，右操作数是 `Int` 类型，函数返回类型为 `String` 。
函数体内应该完成三件事。首先，定义 `result` 变量并初始化为函数的 `String` 参数 —— 这是一个变量，稍后会修改它的值。

    var result = lhs

接下来使用 `for in` 控制流语句及闭区间运行符从 2 开始循环，直到函数的 `Int` 参数时为止：

    for _ in 2...rhs {
     
    }

注意：这里使用了 `_` 作为通配符，因为我们希望忽略序列的具体值 —— 关于循环的更多说明可以[看这里](https://cosminpupaza.wordpress.com/2015/12/04/for-vs-while-a-beginners-approach/)。

循环体内只有一个任务 —— 更新 `result`：

    result += lhs

注意：你也可以按如下方式来写 —— 上边这种写法更短，是因为用了加法复合运算符。

    result = result + lhs

最后返回 result：

    return result

现在我们直接使用运算符：

    let u = "abc"
    let v = u * 5

搞定了！只是还有一个问题 —— 你只能将其用于字符串，那其它类型的数据怎么办？我们使用范型运算符来完善。

## 泛型运算符
![](http://www.appcoda.com/wp-content/uploads/2016/03/generic-operators.png)
泛型默认是不支持运算符的，所以需要协议来支持。向 playground 中添加协议原型：

    protocol Type {
     
    }

现在向协议中添加加法复合运算符函数的原型：

    func +=(inout lhs: Self, rhs: Self)

函数拥有左右操作数，并且都设置为 `Self` 类型 —— 这是一种巧妙的方式，说明二者的类型都是实现了该协议的类。左操作数标记为`inout`，因为它的值是要被修改并且最后被函数返回的。

或者，你也可以定义加法运算符的函数原型：

    func +(lhs: Self, rhs: Self) -> Self

函数拥有 `Self` 类型的左右操作数，并且加法运算的返回结果也是 `Self` 。这种情况下就不需要使用 `inout` 参数了。

接下来，为 `String` , `Int` , `Double` , `Float` 等实现了 `Type` 协议的类型创建扩展。

    extension String: Type {}
    extension Int: Type {}
    extension Double: Type {}
    extension Float: Type {}

注意：这些扩展的实现是空的，因为你并不打算为默认类型添加任何东西，仅仅是要让他们遵循 `Type` 协议。

现在向 playground 中添加乘法操作符函数原型：

    func *<T: Type>(lhs: T, rhs: Int) -> T {
     
    }

函数有两个参数，左操作数是 `T` 类型，右操作数是 `Int` 类型，函数返回类型为 `T` 。利用类型约束使 `T` 类型遵循 `Type` 协议，这样它就可以使用加法复合运算符了。

注意：你可以使用 `where` 关键字定义类型约束——尽管上边的方法更简短：

    func *<T where T: Type>(lhs: T, rhs: Int) -> T

函数的实现跟之前一样：

    var result = lhs
     
    for _ in 2...rhs {
     
        result += lhs
        
    }
     
    return result

注意：可以使用加法操作符替代，但要确保它的函数原型添加到了协议中。
测试一下：

    let x = "abc"
    let y = x * 5
     
    let a = 2
    let b = a * 5
     
    let c = 3.14
    let d = c * 5
     
    let e: Float = 4.56
    let f = e * 5

搞定了！不过有一个问题：你使用的是标准乘法运算符，这个可能造成歧义。如果换成其它运算符会更好。接下来我们试着用自定义运算符解决这个问题。

## 自定义运算符
![](http://www.appcoda.com/wp-content/uploads/2016/03/custom-operators.png)

首先添加下面一行到 playground：

    infix operator ** {associativity left precedence 150}

一步一步解释：
- 自定义乘法运算符的名称是 **。
- 类型是 `中缀运算符(infix)` 因为它有两个操作数。
- 运算顺序从左至右，因此是左结合。
- 优先级设置为 150 —— 与标准乘法运算符相同，因为它是高优先级运算符。

注意：关于运算符优先级和结合性的更多说明可以看[这里](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/AdvancedOperators.html)。

自定义运算符的函数原型与标准运算符类似 —— 只有函数名不同：

    func **<T: Type>(lhs: T, rhs: Int) -> T {
     
    }

函数实现跟之前完全一样：

    var result = lhs
     
    for _ in 2...rhs {
     
        result += lhs
        
    }
     
    return result

测试一下：

    let g = "abc"
    let h = g ** 5
     
    let i = 2
    let j = i ** 5
     
    let k = 3.14
    let l = k ** 5
     
    let m: Float = 4.56
    let n = m ** 5

搞定了！还有一个问题——运算符的复合类型还没有定义，接下来我们解决这个问题：

## 复合运算符

![](http://www.appcoda.com/wp-content/uploads/2016/03/compound-operators.png)
复合运算符的类型、优先级和结合性和之前一样 —— 只有名称不同：

    infix operator **= {associativity left precedence 150}

接着向 playground 添加复合运算符的函数原型：

    func **=<T: Type>(inout lhs: T, rhs: Int) {
     
    }

函数没有返回类型，因为左操作数被标记为  `inout` 。
函数体只做一件事 —— 运用之前的自定义运算符返回乘法结果：

    lhs = lhs ** rhs

测试一下：

    var o = "abc"
    o **= 5
     
    var q = 2
    q **= 5
     
    var s = 3.14
    s **= 5
     
    var w: Float = 4.56
    w **= 5

搞定了！这已经是最简版本了！

## 总结
如果谨慎地使用运算符重载，它便能够发挥强大的功能 —— 我希望你能在自己的项目中找到合适使用的方法。
作为参考，这里有一个[完整版的 Playground](https://github.com/appcoda/operator-overloading-swift)，我已经在 Xcode 7.3 用 Swift 2.2 测试过了。

如果你对本教程或者运算符重载有什么看法的话可以给我留言。
>致谢：连环画是在 MakeBeliefsComix.com 制作的。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。