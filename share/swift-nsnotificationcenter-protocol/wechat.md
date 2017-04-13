Swift: NotificationCenter 协议"

> 作者：Arthur Knopper，[原文链接](https://medium.com/swift-programming/swift-nsnotificationcenter-protocol-c527e67d93a1#.4zto25k8j)，原文日期：2016-06-01
> 译者：[TonyHan](undefined)；校对：[walkingway](http://chengway.in/)；定稿：[CMB](https://github.com/chenmingbiao)
  









## 让观察者模式变得更美好

OSX 已经有至少 17 年的历史，而 `NotificationCenter` 在其第一次版本发布就已经存在，并且一直是苹果开发者常用的工具。对于不了解的人来说，NotificationCenter 是基于 *观察者模式* 的概念，也是软件设计模式中行为型模式的一部分。



#### 观察者模式

观察者模式由 [Gang of Four](https://en.wikipedia.org/wiki/Design_Patterns) 在 90 年代中期提出并一直存在，是一种比较容易理解的设计模式。首先，会存在一个被称之为观察目标的对象；这个对象维护一个包含观察者的列表，并将状态的变化通知给这些观察者。

举个真实的例子。你所在的城市有一家繁忙的咖啡店。不少顾客在排队买咖啡，咖啡师会询问顾客的姓名，并将其写在杯子上，以便分清楚咖啡是谁点的；然后让顾客礼貌地等待其名字被叫。每制作完一杯咖啡，咖啡师会叫出杯子上所写的名字，从而让顾客愉快地取到自己所点的咖啡。

在这种情况下，咖啡师是观察目标，购买咖啡的顾客是观察者，而咖啡是状态的变化，因为咖啡从一个空杯变成了满满一杯含咖啡因的美味。

## NotificationCenter的问题

对于写代码的我们，观察者模式毫无疑问是一种有很多用途的伟大模式。但同时不得不承认，我从来不是它的狂热粉丝，并非因为缺乏一些好的理由：

#### 保证观察对象的一致性

如果一个项目中没有强制性的标准，那么实现和向观察者发送通知的方式可能就会多种多样。例如混乱的通知名称：

    
    class Barista {
        let notification = "coffeeMadeNotification"
    }
    class Trainee {
        let coffeeMadeNotificationName = "Coffee Made"
    }

#### 避免通知名称冲突

如果开发者随意给通知起名，那么两个不同的观察对象则可能拥有相同的通知名，于是无论这两者谁发出一个采用此名字的通知，错误的观察者便可能会收到此通知。

假设咖啡店里有两个咖啡师，如果每个咖啡师都用相同的通知名，顾客便会收到毫无意义的通知，甚至更糟的是，会收到一杯含有大豆印度茶并且不含咖啡因的香草拿铁而不是一杯拿铁咖啡。

    
    class Barista {
        static let coffeeMadeNotification = "coffeeMadeNotification"
    }
    class Trainee : Barista { }
    ...
    NotificationCenter.default.
        .postNotificationName(Trainee.coffeeMadeNotification)

#### 使用字符串作为名称的通知

我会避免使用字符串类型的通知，你也应该如此，因为这样只会产出容易出错的代码。永远不要相信人们避免拼写错误或在没有自动补全功能环境下编程的能力。

    
    NSNotificationCenter.defaultCenter()
        .postNotificationName("coffeeMadNotfication")

#### 替代方案

更多的时候，我会尽可能使用代理模式来代替观察者模式。代理模式与观察者模式非常相似，但并不是一对多的关系，代理模式是一对一的关系。虽然代理模式也有自己的一些问题和限制，但它避免了我上面列出的问题，所以在我看来这种模式是更可靠的选择。不过今天并不会深入探讨这些问题。

## 通知协议

    
    protocol Notifier { }

我们可以设计一个协议来解决上面列出的所有问题，于是接下来挨个研究下这些问题，然后实现一个更 Swift 化的、有统一变化的 `NSNotificationCenter` 实现。

#### 保证观察对象的一致性

协议非常有用，因为想要遵守某个协议，就必须强制符合其规范。所以针对于这个协议，我们将给它设置一个`关联类型`：

    
    protocol Notifier {
        associatedType Notification: RawRepresentable
    }

从现在开始，如果在项目中的类或结构体想要发布通知，那就应该遵守 `Notifier` 协议，并提供遵守 `RawRepresentable` 协议的关联类型。

    
    class Barista : Notifier {
        enum Notification : String {
            case makingCoffee
            case coffeeMade
        }
    }

在 Swift 中，由于枚举也可以遵守 `RawRepresentable` 协议，所以可以使用一个 `String` 类型的枚举，并命名相应的通知。

    
    let coffeeMade = Barista.Notification.coffeeMade.rawValue
    NSNotificationCenter.defaultCenter()
        .postNotificationName(coffeeMade)

#### 避免通知名称冲突

同样，枚举在这方面也起了很大作用，因为它可以让我们避免重复定义。如果我们创建了多个 `makeCoffee` 的枚举，编译器将提示错误。然而，这并不能解决具有不同类或结构但具有相同枚举名称的问题。

    
    let baristaNotification = Barista.Notification.coffeeMade.rawValue
    let traineeNotification = Trainee.Notification.coffeeMade.rawValue
    // baristaNotification: coffeeMade
    // traineeNotification: coffeeMade

如上所见，需要为这些通知创建一个唯一的命名空间，来保证通知名称之间没有任何冲突。使用对应的对象名称是一种很好的解决方案，因为编译器不允许类或结构体具有相同的名称。

    
    let baristaNotification = 
        "\(Barista).\(Barista.Notification.coffeeMade.rawValue)"
    let traineeNotification =
        "\(Trainee).\(Trainee.Notification.coffeeMade.rawValue)"
    // baristaNotification: Barista.coffeeMade
    // traineeNotification: Trainee.coffeeMade

到目前为止都很顺利，但是现在我们的实现方案到了一个左右为难的境地。一方面，我们解决了命名空间重复的问题，但另一方面我们的代码看起来像是一坨垃圾。的确，虽然已经实现了一些统一性，但是如果没有任何保护措施来防止我们自己和协作的开发人员忘记添加命名空间，那么这个方案是毫无意义的吧？

## 通知实现

对你来说幸运的是，我自己已经考虑到这一点，并避免了上述的糟糕情况。我们将进一步扩展我们的协议，并在 NSNotificationCenter 功能调用方面添加一些很友好的符合 [Swift API 指南](https://swift.org/documentation/api-design-guidelines/)的、特定类型的语法糖。

#### 通知名称

    
    Barista.coffeeMade

我们通常希望使用自己的通知命名空间和名称，因此会创建一个以 **通知** 枚举为参数的函数，这个函数会在我们发出通知和移除观察者时返回安全的通知名称。这个函数也是 **私有** 的，因为我们并不希望外部的代码访问此功能，而是由自己和同事强制地遵守 **通知** 协议，从而具备了本来实现不了的优点。

<script src="https://gist.github.com/andyyhope/d5881fcdbbac3ba7d7050496d2801603.js"></script>

#### 添加观察者

    
    Barista.addObserver(customer, selector: .coffeeMadeNotification, notification: .coffeeMade)

从现在开始，如果我们给一个观察对象添加观察者，就必须直接告知这个类。通过这样的方式，我们的代码阅读和编写的时候就显得更易懂，因为能够明确知道观察者正在监听这个观察对象的通知。

> 注意：如果觉得 `.coffeeMadeNotfication` 选择器参数很比较陌生，我建议阅读下我之前的一篇文章：[选择器语法糖](https://medium.com/swift-programming/swift-selector-syntax-sugar-81c8a8b10df3#.otcg9vgde)。

<script src="https://gist.github.com/andyyhope/86081df3eface923793e58bd6dc9d15c.js"></script>

#### 发送通知

    
    Barista.postNotification(.coffeeMade)

这很蠢吧？可不是嘛！不过现在发通知就好多了。通过避免使用 `NSNotificationCenter.defaultCenter()` 的冗长的方式调用，同时为 `object` 和 `userInfo` 设置了 `nil` 默认值，因此调用发送通知的方法变得相当的简介。我们也能够确认，当前通知不会与其他类发生冲突，因为通知的名称是由遵守协议对象类的名字拼接而成的。

<script src="https://gist.github.com/andyyhope/2d07ea00eb69f0c5652f7796043c9104.js"></script>

#### 移除通知

    
    Barista.removeObserver(customer, notification: .coffeeMade)

跟 `addObserver` 的 API 一样，只需要告知这个类把某个 `Notification` 的观察者从其观察者列表中移除即可。

<script src="https://gist.github.com/andyyhope/f397afd8bb16143828cc29a41f46031d.js"></script>

#### 其他

通知协议还具有更多的功能，它能利用可变参数的特性，通过一行代码和实例函数来注销多个通知，但考虑到这篇帖子的本意，我并没有实现这个功能，因为这并不符合我们最初的需求。本文中没有列出的代码都在文章的底部的示例代码中。

## 示例代码

目前为止，我们已经将 `NSNotificationCenter` 封装到 `Notifier` 扩展中，并且解决了项目协作中可能出现的忘记附加命名空间的问题，同时让代码看起来更优雅。不相信么？那就亲自来查看一下：

<script src="https://gist.github.com/andyyhope/ec73810237fbf2a1a641c22e4015fe8e.js"></script>

通过观察对象对观察者列表的管理，我们已经消除了所有常见的与 `NSNotificationCenter` 使用相关的歧义。所以从现在开始，如果观察者想要注册或者停止接收通知，那么就必须通知观察对象并修改其观察者列表。

跟之前一样，为了防止暂时无法使用 Xcode 的情况，我在 GitHub 上提供了一个 [playgrounds](https://github.com/andyyhope/Blog_NSNotificationCenterProtocol)，您可以下载下来，同时还有一个 [Gist](https://gist.github.com/andyyhope/74002ec4b8f63547ac47eaadd807483a)。

如果你喜欢这篇文章的内容，可以查看我其他的[文章](https://medium.com/@AndyyHope)。如果想与我联系，我很乐意收到您的 Twitter 信息或者在 [Twitter](https://twitter.com/AndyyHope) 上关注我。我同时也在澳大利亚墨尔本举办 [Playgrounds Conference](http://www.playgroundscon.com/)，期待在下一次活动中与你相见。


> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。