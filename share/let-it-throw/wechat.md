如何在 Swift 中进行错误处理"

> 作者：Olivier Halligon，[原文链接](http://alisoftware.github.io/swift/error/2015/12/17/let-it-throw/)，原文日期：2015-12-17
> 译者：[JackAlan](http://ijack.pw/)；校对：[靛青K](http://blog.dianqk.org/)；定稿：[Channe](http://www.jianshu.com/users/7a07113a6597/latest_articles)
  









今天的文章讲解如何在 Swift 中进行错误处理。

说实话，为了配合这个冬季❄️☃️，我取了一个有趣的文章标题。

> 译者注：原文标题为 Let it throw, Let it throw! 是模仿冰雪奇缘的主题曲 Let it go ，并且文章的副标题也在模仿冰雪奇缘的经典台词。



### Objective-C 以及对应的 NSError

还记得 Objective-C 吗？那时<sup><a href="#fn:nshipster">1</a></sup>，官方的方法是通过传入一个 `NSError*` 的引用进行错误处理。

    Objective-C
    NSError* error;
    BOOL ok = [string writeToFile:path 
                       atomically:YES
                         encoding:NSUTF8StringEncoding
                            error:&error];
    if (!ok) {
      NSLog(@“发生了一个错误: %@", error);
    }

那简直是太痛苦了。以至于许多人不想甚至是懒得去检查错误，只是简单的在那里传一个 `NULL` 。这是很不负责且不安全的行为。

### 抛出一个错误

![](http://alisoftware.github.io/assets/frozen-throw-man.jpg)

Swift 2.0 以后，苹果决定采用一种不同的方式进行错误处理：使用 `throw` <sup><a href="#fn:not-exception">2</a></sup>。

使用 `throw` 非常的简单：

- 如果你想创建一个可能出错的函数，用 throws 标记在它的签名处；
- 如果需要的话，可以在函数中使用 `throw someError` ；
- 在调用的地方，你必须明确的在能抛出错误<sup><a href="#fn:why-try">3</a></sup>的方法的前面使用 `try` ;
- 可以使用 `do { … } catch { … }` 这样的结构用来捕获并处理错误。

看起来像这样：

    
    // 定义一个可以抛错误的方法…
    func someFunctionWhichCanFail(param: Int) throws -> String {
      ...
      if (param > 0) {
    	return "somestring"
      }
      else {
    	throw NSError(domain: "MyDomain", code: 500, userInfo: nil)
      }
    }
    
    // … 然后调用这个方法
    do {
      let result: String = try someFunctionWhichCanFail(-2)
      print("success! \(result)")
    }
    catch {
      print("Oops: \(error)")
    }

### 错误再也阻挡不了我了

![](http://alisoftware.github.io/assets/frozen-failure.jpg)

你可以看到 `someFunctionWitchCanFail` 返回了一个普通的 `String` ，当一切正常的情况下， `String` 也是其返回值的类型。先考虑最简单的情况(在 `do { … }` 中的)，“通常情况下”可以很方便的调用这个函数去处理没有错误发生的情况。

唯一的这些方法可能会出错的提醒就是`try`关键字，编译器强制让你把 `try` 添加到方法调用的位置的前面，否则就像是调用一个无抛出错误的方法。然后，只需要在一个单独的地方(在 `catch` 里)写错误处理的代码。

要注意的是你可以在 `do` 代码段中写多于一行的代码(并且 `try` 可以调用不止一个抛错误的方法)。如果一切顺利的话，将会像预期的那样执行那些方法，但是一旦方法出错就会跳出 `do` 代码段，进入 `catch` 处。对于那些有很多潜在错误的大段代码来说，你可以在一个单一的错误路径中处理所有的错误，这也是非常方便的。

### NSError 有点挫了

![](http://alisoftware.github.io/assets/frozen-fixer-upper.jpg)

OK，在这个例子下，我们仍然得用 `NSError` 处理错误，这有点痛苦。用 `==` 来比较域和错误代码，以及制作一个域和常量代码的列表，只是为了知道我们得到了什么错误以及如何正确的处理。。。哎哟。

但是我们可以解决这个问题！如果用[Enums as Constants](http://alisoftware.github.io/swift/enum/constants/2015/07/19/enums-as-constants/)这篇文章里的知识：用 `enum` 替代 errors，将会怎样？

好吧，有一个好消息，那就是苹果提供了新的错误处理模式。事实上，当一个函数抛出错误时，它可以抛出任何遵从 `ErrorType` 的错误。 `NSError` 是其中的类型之一，但是你也可以自己搞一个，苹果也推荐这么做。

最适合 `ErrorType` 类型的就是 `enum` 了，如果有需要的话，甚至二者之间可以有关联值。比如：

    
    enum KristoffError : ErrorType {
      case ClumsyWayHeWalks
      case GrumpyWayHeTalks
      case PearShapedSquareShapedWeirdnessOfHisFeet
      case NotWashedSince(days: Int)
    }

现在你就可以在一个函数里使用 `throw KristoffError.NotWashedSince(days: 3)`来抛出错误，然后在调用的地方使用 `catch KristoffError.NotWashedSince(let days)`来处理这些错误：

    
    func loveKristoff() throws -> Void {
      guard daysSinceLastShower == 0 else {
    	throw KristoffError.NotWashedSince(days: daysSinceLastShower)
      }
      ...
    }
    
    do {
      try loveKristoff()
    }
    catch KristoffError.NotWashedSince(let days) {
      print("Ewww, he hasn't had a shower since \(days) days!")
    }
    catch {
      // 所有其他类型的错误
      print("I prefer we stay friends")
    }

相比此前，这种方式更容易的捕获错误！

这也让错误拥有了清晰的名字、常量以及关联值。再也没有复杂的 `userInfo` 了，在 enum 中你可以清楚地看到值的关联，就像如上例子中的 `days`，并且它只对特定的类型有效(不会对 `ClumsyWayHeWalks` 中的 `days` 关联值有效)。

### 根本拿不回来

![](http://alisoftware.github.io/assets/frozen-cant-hold-it-back.jpg)

当你调用一个正在抛出错误的函数时，抛出的错误就会被调用函数中的 `do...catch` 捕获。但是如果错误没有被捕获，它就会被传递到上一层。比如：

    
    func doFail() throws -> Void { throw … }
    
    func test() {
      do {
    	try doTheActualCall()
      } catch {
    	print("Oops")
      }
    }
    func doTheActualCall() throws {
      try doFail()
    }

这里，当 `doFail` 被调用时，潜在的错误没有被 `doTheActualCall` 捕获(没有 `do...catch` 来捕获它)，所以它就被传递到 `test()` 函数。由于 `doTheActualCall` 没有捕获任何错误，所以它必须被标记为 `throws` ：即使它不能通过自己抛出错误，但仍能传递。它自己不能处理错误，必须抛出到更高层。

另一方面，`test()` 在内部捕获所有的错误，所以，即使它调用一个抛出函数(`try doTheActualCall()`)，这个函数抛出的所有的错误都会在 `do...catch` 块中被捕获。函数 `test()` 本身不抛出错误，所以调用者也不要知道其内部行为。

### 隐藏，不要让他们知道

![](http://alisoftware.github.io/assets/frozen-conceal-dont-feel.jpg)

你现在可能很好奇，如何知道方法到底抛出哪种错误。的确，被 `throws` 标记的函数到底能抛出哪种 `ErrorType`？它能抛出 `KristoffErrors` 、`JSONErrors` 或者其他类型吗？我到底需要捕获哪种呢？

好吧，这的确是个问题。目前，由于一些二进制接口以及弹性问题（resilience concerns）<sup><a href="#fn:resilience">4</a></sup>，这还是不可能的。唯一的方式就是用你代码的文档。

但这也是一件好事。比如说，假如你用了两个库，`MyLibA`中函数 `funcA` 会抛出 `MyLibAError` 错误，`MyLibB`中函数 `funcB` 会抛出 `MyLibBError` 错误。

然后你可能想创建你自己的库 `MyLibC` ，封装之前的两个库，用函数 `funcC()` 调用 ` MyLibA.funcA()` 和 `MyLibB.funcB()`。所以，函数 `funcC` 的结果可能会抛出 `MyLibAError` 或者 `MyLibBError`。而且，如果你添加了另一个抽象层，这就变得很糟糕了，会有更多的错误类型被抛出。如果我不得不把它们都列出来，并且调用的地方需要把它们全部捕获，这将会造成一堆冗长的签名和 `catch` 代码。

### 别让他们进来，别让他们看见

![](http://alisoftware.github.io/assets/frozen-dont-let-them-in.jpg)

基于上面的原因，也为了防止你的内部错误超出你的库的作用域，以及为了限制那些必须由用户处理的错误类型的数量，我建议把错误类型的作用域限制在每个抽象层次。

在如上的例子中，你应该抛出 `MyLibCErrors` 取而代之，而不是让 `funcC` 直接传递 `MyLibAErrors` 和 `MyLibBErrors`。我的建议有如下的两个原因，都是和抽象相关的:

1. 你的用户不应该需要知道你在内部使用哪个库。如果将来的某天，你决定改变你的实现：使用 `SomeOtherPopularLibA` 替代`MyLibA`，显然这个库不会抛出相同的错误，你自己的 `MyLibC` 框架的调用者不需要知道或关心。这就是抽象应该干的事。
2. 调用者不应该需要处理所有的错误。当然你可以捕获那些错误中的一些并且在内部处理：把 `MyLibA` 抛出的所有错误都暴露给用户是没有意义的，比如一个 `FrameworkConfigurationError` 错误表明你误用了 `MyLibA` 框架并且忘了调用它的 `setup()` 方法，或者是任何不应该由用户做的事情，因为用户根本无能为力。这种错误是你的错误，而不是别人的。

所以，取而代之，你的 `funcC` 应该很可能捕获所有 `MyLibAErrors` 和 `MyLibBErrors`，封装它们为 `MyLibCErrors` 替代。这样的话，你的框架的使用者不需要知道你在内部使用了什么。你可以在任何时候改变你的内部实现和使用的库，并且你只需要给用户暴露那些他们可能需要关注的错误。

### 其他资料分享 <a href="#fn:ref">5</a>

![](http://alisoftware.github.io/assets/frozen-sandwiches.jpg)

> 译者注：原标题为 `We finish each others sandwiches`，是在模仿冰雪奇缘中王子和公主的对话，表示和其他博主以及读者的一种亲近的关系。

`throw` 话题和 Swift 2.0 的错误处理模型还有很多东西可讲，我本可以讲一些关于 `try?` 和 `try!`，或者关于高阶函数中的 `rethrows` 关键字。

这里没有时间对每个话题面面俱到了，那会使得我的文章非常长。但是别人有趣的文章将会帮你探索 Swift 错误处理的世界，包括但不限于：

- [Throw that don’t throw](http://robnapier.net/throw-what-dont-throw) and [Re…throws?](http://robnapier.net/re-throws) by Rob Napier
- [Error Handling](https://littlebitesofcocoa.com/108-error-handling) by Little Bites of Cocoa
- [What we learned from rewriting our robotic control software in Swift](http://www.sunsetlakesoftware.com/2015/11/03/what-we-learned-rewriting-our-robotic-control-software-swift), by Brad Larson
- ... (别犹豫了，快去评论区分享更多链接吧！)

![](http://alisoftware.github.io/assets/frozen-olaf-holidays.jpg)

---

<a name="fn:nshipster"></a>
1. 更多关于在 Objective-C 中错误处理的信息，可以参考这篇文章：[NSError](http://nshipster.com/nserror/)。今天的文章是关于 Swift 中的新方式的，所以别在旧事物上花费太多的时间。  
<a name="fn:not-exception"></a>
2. 尽管它叫 throw ，但是 `throw` 不是像 Java 或者 C++ 甚至 OC 中的 throw exception。但是使用的方式非常相似，苹果决定保留相同的措辞，所以习惯于 exceptions 的人会感到非常自然。  
<a name="fn:why-try"></a>
3. 这是编译器强制的，其目的是让你意识到这个函数可能出错，你必须处理潜在的错误。
<a name="fn:resilience"></a>
4. Swift 2.0 还不支持 typed throws，但是[这里](https://lists.swift.org/pipermail/swift-evolution/2015-December/000076.html)有一个关于添加这个特性的讨论，Chris Lattner 解释了 Swift 2 不支持的原因，以及为什么我们需要 Swift 3.0 的弹性模型以获得这个特性。  
<a name="#fn:ref"></a>
5. 好了，我保证这是我最后一次可耻使用 *Frozen*(《冰雪奇缘》) 标题了。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。