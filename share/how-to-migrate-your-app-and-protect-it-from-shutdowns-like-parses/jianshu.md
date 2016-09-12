如何从 Parse 手中拯救你的应用"

> 作者：Reinder de Vries，[原文链接](http://jamesonquave.com/blog/how-to-migrate-your-app-and-protect-it-from-shutdowns-like-parses/)，原文日期：2016-01-09
> 译者：[pucca601](http://weibo.com/601pucca)；校对：[靛青K](http://blog.dianqk.org/)；定稿：[numbbbbb](http://numbbbbb.com/)
  









编者注：这篇文章是由 Reinder de Vries 撰写，一个在 [LearnAppMaking.com](https://learnappmaking.com/) 的独立应用开发者。

## 喔不！ Parse 即将关闭...你打算怎么办呢？

今年 1 月 28 号，Parse 宣布它将会关闭自己的服务。他们正在慢慢减少已提供的“后端服务”，打算在 2017 年 11 月 28 日全面撤出该服务。

对于从 2011 年开始就依赖该服务的超过 500,000 的开发者来说这真是个坏消息。正如 Jameson 在他的[博客帖子](http://jamesonquave.com/blog/your-parse-backend-was-always-a-bad-idea/)中指出的一样，开发者们感觉被他们的信任背叛了。



Parse 在 2013 年被 Facebook 以八千五百万美元收购，但现在“五巨头”之首冷血地切断了对开发者们应用的支撑服务。

在 2013 年，收购 Parse 其实有不小的风险，但是当时 Facebook 需要在移动市场立足，所以不得不买。Facebook 最新的收益报表显示，2016 年 Q4 的移动广告相比 2014 和 2015 年增长 52%，这表明他们已经在移动市场站稳了脚跟。

Amazon、Microsoft 和 Google 的云服务竞争越来越激烈，你可能觉得 Facebook 不再需要 Parse 。从商业的角度我是十分赞同的，但从开发者视角这是一个糟糕的决定。

真的是这样吗？

## 对开发者来说， Parse 的关闭是一个机会

在我做应用之前，我一直在开发网站。不计其数的网站。我学会了所有必备技能：HTML、CSS、JavaScript、PHP 和 MySQL。我的代码质量和优雅程度在当时会让你起鸡皮疙瘩，但是通过不断地试错，我最终掌握了输出高质量网站的技术。

年复一年，我时不时会开发一个 web 应用来保持技艺与时俱进。有许多更新更先进的工具出现，我在工作中也可以应用它们。我从 jQuery 迁移到 Angular 再到 React，期间接触了太多 JavaScript 框架，见证包管理工具以及 GitHub（SourceForge，还有谁？）的出现，还有 PHP 4 到 PHP 5 再到 PHP 5.6 以及即将来临的 PHP 7。我的 MySQL 表格撑爆了，所以我切换到 Elasticsearch 和 Mongo。

不久前我想要自动化时讯邮件注册和 TestFlight 的测试邀请。如果你订阅时讯并且确认了订阅，这个自动化流程会自动将你加入 TestFlight 的测试组。我对 FastLane 工具以及它的 boarding 组件有一定了解，这个图形化 boarding 组件的 HTML 页面一定有一个我能劫持的 POST URL 入口点。实际上，我会从我的表格中抓取订阅者的邮箱地址并将其放入 boarding 表格。Boarding 会完成剩下的事情，比如将订阅者添加到 TestFlight 的测试组。

这里只有一个问题： boarding 表格有 CSRF 保护，这意味着它需要每个请求里包含一个独一无二的令牌。这些令牌是服务端生成的，在我的自动化流程里没法获取它们。

我能访问 boarding 的源代码，所以理论上我可以让 CSRF 保护失效，从而解决这个问题。只有一点要先声明：源代码是 Ruby 写的，但是我在有生之年没有看过一行 Ruby 代码（好吧，也许有一行），更不用提写了。

多亏我有大量后端编程经验，我不害怕上手一门不熟悉的技术。经年累月的反复试验和犯错让我对 web 如何运作有深入的了解。我没有羞于接触这个一无所知的技术，相反，我挖得很深入。

我翻阅了各种没有见过的库，以及它们相比之下很奇怪的名字（这算个事儿吗？）后，终于找到了管理 CSRF 保护特性的文件。最终我发现，关掉这个特性相当于将 controller 置空。

## 后端黑盒

几乎每一个成功的应用多少都会使用一种后端服务来连接用户，将用户数据在服务器上持久化。

很多我遇到和指导过的开发者对后端编程缺乏扎实的理解。他们在极其简单的 Dashboard 上设置 Parse 的配置项，写一个查询语句，然后就认为数据“就在那里”。谁会想要知道云端发生了什么呢？

我常常将 Parse 解释为“应用的电子表格”。这是事实：Parse 为你的应用提供了后台服务，它的 Dashboard 和 Google Spreadsheets 一样简单。你甚至不需要写查询数据的语句，相反，你可以使用下面这样简单的方法：

    
    PFQuery(className: "Tweet").whereKey("user", currentUser);

这或许也是 Parse 的错。它们的 `PFQueryTableViewController` 用起来实在太简单，但是也相当危险：它直接将后端代码与你应用的 view controller（已经是个 ViewModel）关联了。即使你想从 Parse 转到 Firebase，因为你的代码和后端紧密耦合，你不得不在迁移之前重写整个应用。

Parse 的 PFObject 类内置了映射，所以你可以像使用原生的 Swift String 对象一样直接使用字符串数据， Parse SDK 会在内部将这些数据转化成可以在互联网上输送的数据。如果你在面向用户的代码中使用了 PFObject 实例，那么未来要替换一套新的“后端即服务” SDK 会很难。

如果你要从头构建一个自己的后端，你需要知道例如 true（一个布尔值）在编码为 JSON 的时候会转化为 `true` (一个字符串)。如果那个 JSON 数据抵达你的 app，你需要处理的是一个 `String` 实例而不是你期望的 `Bool` 类型。虽然 Swift 有一个难以置信的类型系统，但是 if let 可选类型绑定状态判断机制（optional binding statement）无法处理不匹配的类型——它并不能解决这个问题！

所以 Parse 的关闭对你有什么好处？这是又一次开始试验的好机会，你可以深入挖掘后端黑盒，保护你的代码不再遇到类似的事情。

## 三种应对方法

下次你要开发应用时，请将下面这三个方法记在脑子里。你可以用它们保护你自己（的业务）以防 Parse 关闭这样的事情再次发生。不要 100% 信任一个对你应用持续发展和成功至关重要的第三方服务提供商。

### 1. 列出一个替代品清单

Parse 有几个相似的提供商，比如 Firebase。可能在 Parse 关闭之前你都没听说过 Firebase。

最酷的事是：大多数这类服务知道你正在寻找它们。如果你 Google “parse shutdown(译者注：Parse 关闭)” 或者 “parse migration(译者注：Parse 迁移)”，你会正中许多高度相关的 Google AdWords 广告，叫你迁移至它们服务的广告。千万别这么做！

相反，你应该列一个替代品清单。尽量熟悉外面的东西。列一个你需要依赖的服务商以及替代品清单，以防万一。就像超级市场会有备用牛奶供应商的清单以防他们主要的供应商破产，你也应该拥有一份和你有业务往来的公司清单。

当然，你还可以对清单上的替代供应商做一些和你相关的技术和 SDK 研究。我之前完全没听说过 OneSignal，直到我开始寻找一个替代 Urban Airship 的免费推送供应商，因为我觉得 Urban Airship 的费用太贵了。

### 2. 解耦你的代码

虽然你已经听了一万遍：Model-View-Controller（译者注：模型－视图－控制器）还是有道理的。我们正渐渐习惯 Model-View-Whatever（译者注：模型－视图－任何东西），但是 MVC 的理念其实是：你的 Controller 不能配置 View，你的 View 不应该操纵一个 Model。

Cocoa Touch 框架让人很难不使用 MVVM（Model-View-ViewModel），但是这不意味着你要将你的 Model 代码与 View Controller 代码紧耦合。

在编程理论中我们有两条原则：耦合与封装。使用两个紧耦合类意味着 ClassA 作出了很多关于 ClassB 内部功能的假设。

想象一辆车和一位司机。司机坐在车里的前方位置，因为驾驶杆是与引擎直接相连的，如果司机突然坐到车后方来驾驶呢？这样肯定行不通。当然，类似这样的情况在现实生活里永远不会发生，但是这种情况在你的代码里一直存在。

应对紧耦合的一个保护措施就是封装。这意味着每一个类有着一个严格定义的方法集合，比如 `speedUp()` 和 `steerLeft()`。通过依赖可燃的引擎，你只需要让司机调用 `speedUp()`，而不是让司机将更多的汽油注入燃烧室。用这种方式司机不需要知道有关引擎如何工作的复杂知识，只需要调用一个他知道安全的方法就能实现了。

当这种引擎被一个电动的不带燃烧室的引擎所替代，你也不需要修改司机的代码：他依赖一个暴露的 `speedUp()` 方法，而不是依赖 `injectGasMixture()` 、 `gasMixture` 和 `sparkTimer`（译者注：注射混合汽油，混合汽油，电火花计时器）。

如果你觉得解耦和封装难以理解，就将它们看作职责吧。谁的职责是驾驶？司机。谁的职责是使汽车向前移动？引擎。

当你正在编写一个有后端能力的应用时，要清楚地定义组件以及组件的职责。创建一个在后端代码和前端代码之间只起媒介作用的中间件。前端代码基于你自己的类构建，就像 Car，后端代码处理你用到的后端 SDK 并且使用类似 PFObject 的类。

中间件的工作是沟通前端和后端。假使你的后端代码过时，你可以替换中间件的代码让它使用新的后端 SDK，无需重写前端代码。

### 3. 使用 Adapter Pattern（适配器模式）

第三种也是最后一种方法是减少代码耦合。Adapter Pattern（适配器模式），比互联网自身还要老，是一个面向对象编程的模式。这是一套编程设计规则，可以用它来将两个不相容的类变得相容。

这类似于构造一个“ wrapper（封装器）”，不只是暴露资源接口（像是封装一个 REST API ），它还会在两个不相容接口间制定一套规则。在很多编程语言里这些规则叫接口（JAVA 和 PHP），在 Swift 和 Objective-C 中它们叫 protocols（协议）。

你一定知道 Swift 的范型，对吗？如果有个东西游起来和叫起来像一只鸭子，那么它一定是只鸭子。Adapter Pattern（适配器模式）也有类似机制。要让 ClassA 和 ClassB 解除耦合，你需要构造一个 ClassA 的适配器，而不是直接在 ClassA 里调用 ClassB。

这个适配器类包含有关 ClassA 如何工作的复杂知识。适配器类也遵循一个协议。这个协议说：“你可以确定我有 X，Y 和 Z 方法”。

ClassB 不知道 ClassA。它只知道它想要一个遵循适配器协议的实例。它不在乎这个实例是不是个鸭子，只要它游起来叫起来像个鸭子就行了。

使用适配器有什么好处？假设你原来的 ClassA 代码废弃了，你只需要找另一个类（例如另一个 Parse 的替代品）并且为这个类写一个适配器。只要这个适配器遵循协议，也就是你之前制定的规则，ClassB 依旧能够工作。

事实上，你可以写一个带有下面这个签名的方法的适配器（`MyTwitterAdapter`）：

    
    class MyTwitterAdapter:AnyTwitterServiceProtocol
    {
        func getTweetsWithUser(user:User, withPage page:Int = 0)
        {
            ...

协议（`AnyTwitterServiceProtocol`）包含了与上面一模一样的方法签名，但是它没有任何逻辑或者方法实现，只是定义了规则。

    
    protocol AnyTwitterServiceProtocol
    {
        func getTweetsWithUser(user:User, withPage page:Int = 0);
        ...

前端代码（`MyTweetsViewController`）有一个未定义类型的变量 twitter，这个工厂方法可以保证当你更换适配器的时候你只需要替换类的名字一次（或两次）。

如果你将 twitter 类型严格定义为 `MyTwitterAdapter`，你的代码中可能还有很多耦合处。这样的话，如果你要将适配器替换为一个新的适配器，还是需要更新大量代码。

一旦你设立了这段检查机制，就可以测试这个你正在工作的实例 twitter 是否遵循 `AnyTwitterServiceProtocol` 。

    
    if let _twitter = twitter as? AnyTwitterServiceProtocol
    {
        // Yes, it conforms
    }

你的前端代码再也不用关心 `twitter` 是否是 `Car`、`FooBar` 或 `Facebook` 类型，只要它遵循了 `AnyTwitterServiceProtocol` 就行。它只想知道这个实例是否有一个方法叫 `getTweetsWithUser:withPage:`。

注：假设你真的需要严格定义 twitter 的类型，可以使用协议作为类型，这样你也能使用泛型。

## 接下来怎么做？

现在你已经学会了怎么改善业务代码、怎么处理你依赖的供应商以及保护你的代码，我想你已经明白怎么应对类似的危机了。

你是不是正要转到 Firebase ？你应该知道 Firebase 属于“五巨头”中的 Google。虽然 Parse 关闭不意味着 Firebase 也会关闭，但依赖一个新的供应商会让你的应用和之前一样脆弱，除非你想办法保护你的代码。

学习后端编程是一个好办法。Parse 已经发布了一个优秀的替代产品，Parse Server，你可以在其上运行你自己的服务器（只要它可以运行 NodeJS 和 MongoDB）。在下面的文章中我会向你展示如何将一个简单的应用（包括 Heroku 和 MongoLab）从 Parse 迁移至 Parse Server。

继续阅读：[指南： 如何将一个简单的应用（包括 Heroku 和 MongoLab）从 Parse 迁移至 Parse Server](https://learnappmaking.com/how-to-migrate-parse-app-parse-server-heroku-mongolab/)

另一个相对容易的练习是将你的推送通知部署到两个服务中，不要把鸡蛋放在一个篮子里。实现推送服务供应商的客户端 SDK 相对来说比较容易，通常你只需要发送唯一的 ID 并建立一个段。

使用 Adapter Pattern（适配器模式）去创建一个统一的接口，供你的前端使用。通过定义一个协议将实际的适配器从前端代码解耦。挑选一个备用的推送通知服务供应商（比如 Urban Airship, Mixpanel, Pusher 或 PushOver），写一个备用的适配器。确保这个适配器遵循这个协议，然后模拟一下服务崩溃，看看如何重新部署适配器。那么，你的问题解决了吗？

## 结论

不要害怕深入黑盒。写你自己的后端 REST API 是个好办法，放手去做，你会学到很多东西。

你知道 Crashlytics 属于 Twitter 吗？任何服务都可能会关闭……搞清楚 Crashlytics 为你做了什么，以及它的工作原理。这是建立一个稳定可靠并且能一直赚钱的业务的唯一途径。

*接下来，你要自己走进兔子洞了。*

## 关于作者

Reinder de Vries 是一个独立应用开发者，他在 [LearnAppMaking.com](LearnAppMaking.com) 上教有志向的开发者以及市场营销者如何构建他们的应用。他已经开发了 50 多个应用，他的代码被全世界成千上万的用户使用。不写代码的时候，他喜欢浓缩咖啡（strong espresso）和旅行。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。