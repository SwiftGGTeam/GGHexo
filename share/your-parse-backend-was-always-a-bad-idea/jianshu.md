使用 Parse 是一个糟糕的主意"

> 作者：Jameson Quave，[原文链接](http://jamesonquave.com/blog/your-parse-backend-was-always-a-bad-idea/)，原文日期：2016-2-2
> 译者：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  









不知道你是否听说，Facebook 要关闭 Parse 了。Parse 是一个后端云服务（BaaS），前不久刚刚被 Facebook 收购。很多开发者感到有些失望，甚至感觉被 Facebook 背叛，我在推特发了这张 Parse 被关闭前网站首页截屏图片，它能说明一切：

[图片链接](https://t.co/ctoxrvTLYx)
— Jameson Quave (@jquave) [January 29, 2016](https://twitter.com/jquave/status/692910323850985472)

不用我在这里额外强调，他们都在网站上说了。成千上万的开发者***信任***我们。可以从类似的描述中明白，为什么开发者觉得他们遭到了背叛。在明知 Facebook 会任意地关闭某项技术服务的情况下，还会有人使用 React Native、React JS、HHVM、Relay 等 Facebook 提供的技术服务吗？



确实，这些项目都是开源项目，开源社区可以接手，但是开源项目需要维护，而大公司的支持能够给项目带来更多好处。Facebook 的行为已经向我们证明，我们不能相信 Facebook。凡是与 Facebook 的 API 接口打过交道的人，或者处理过第三方社交媒体 API 接口的人，都不会对这个结论感到惊讶，我会在以后详细说说这一点。但是现在让我先暂时改变一下话题，来讨论一下另外一个大麻烦：Twitter……和更重要的[Twitter Fabric](https://get.fabric.io)，拥有 Crashlytics（应用崩溃报告服务商），整合了很多由[Felixt Krause](https://github.com/KrauseFx)实现的令人惊艳的工作成果。

但是要理解 Twitter 在过去是如何对待开发者社区，我认为我们应该先说一说 Meerkat 应用。我保证之后会继续讨论 Parse 和 Facebook，Meerkat 的故事也是发生在同样的背景下，所以稍稍忍耐一下吧。

## Meerkat

先介绍一下背景：我住在德克萨斯州的 Austin，这意味着在每年我都能在 SXSW 看到接下来将变成大公司的初创公司。Twitter、Foursquare、GameSalad，甚至连 Four-Hour Work Week 都是 SXSW 孵化的项目。这都是一些成功项目，每年有无数天真的创业者来到 Austin 展示他们的项目，希望能够获得投资。在 2015 年，赢家是一个名为 Meerkat 的项目。

![](https://swift.gg/img/articles/your-parse-backend-was-always-a-bad-idea/12401463538621.8656638)

Meerkat 是一个实时流媒体直播的 P2P 平台，用户可以用 iPhone 直接把流媒体视频展示给其他用户观看，这在 SXSW 掀起了一场[风暴](http://www.theverge.com/2015/3/17/8234769/how-meerkat-conquered-all-at-sxsw)。去年只要你在 Austin 走走，经过 SXSW，到处都能看到 Meerkat 的 T 恤衫，每一个人都在现场直播音乐、SXSW 的课程、午饭或者任何人们正在做的事情。突然间，Meerkat 停止了服务，原因是：

***随着 Meerkat 的下载量持续攀升，Twitter 在发出通知的[两个小时](http://www.fastcompany.com/3043716/sxsw/twitter-only-gave-meerkat-2-hours-notice-before-cutting-access-to-the-social-graph)后，就关闭了 Meerkat 访问 Twitter 的接口。***

如果你熟悉 iOS 应用商店审核过程，也许你就能意识到问题所在了。即使 Meerkat 的人能够重新写他们的应用代码，来不去使用 Twitter 的 API 接口，他们也无法在 2 小时内把最新的 App 更新到苹果应用商店中，实际上，需要至少 3 周的时间才能更新上去。

我实际上并没有感到惊讶，但是好多人不理解 Twitter 为什么要做这样的事情，Twitter 是否违反了 API 条款？属于违法行为吗？

实际上，没有违反条款，也没有违法……

Twitter 关闭了 Meerkat，因为 Twitter 自己开发了一个应用叫 Periscope，是 Meerkat 的竞争对手，我拒绝给出链接。

于是就发生了 Twitter 上一度[要求给予开发者信任](https://gigaom.com/2014/09/30/twitter-to-developers-seriously-this-time-you-can-totally-trust-us-not-to-ambush-you/)的事情，唉……

## Parse

看，我就说我们会回到 Parse 这个话题上来的咩~

Twitter 和 Facebook 就像是社交网络硬币的两面，对我来说，信任哪一方结果都是一样的。我当我想知道某个科技公司在将来如何前进时，我总会重复这句咒语：“跟着金钱走”，这咒语也能告诉你大公司在将来如何会如何表现，尤其是上市公司（TWTR 和 FB 都是上市公司）。美国上市公司在季度财务报表上需要对股东负责，为了有个好看的季度财报，有时甚至不惜损害客户或者合作伙伴的利益。当我看到 Parse 的免费使用范围如何巨大时，我特别担心。在我看来，99% 的应用甚至更多应用都不会达到付费要求的，即使到达了付费要求，也只需付出一点点钱。当 Parse 成为开发者的工具，特别是作为后端服务商时，Facebook 在赚不到钱的情景下做这件事情的动机是什么呢？我相信答案十分明显，***那就是 Facebook 想要你的数据，结果发现这些数据不值钱***。所以他们决定不再花费时间在 Parse 上了，免费使用 Parse 的众多开发者们没有给 Facebook 带来利润，所以他们做出关闭 Parse 的决定，用 Facebook 自己的话来说就是：

**Parse 曾经帮助过无数的开发者创建出优秀的手机应用，对此我们非常骄傲，但是我们需要把资源放到其他地方上了。**

翻译过来就是：“你们没有给我们带来足够的钱”

Facebook 和 Twitter、Google 一样，从广告中获得收益，特别是 Google，作为世界上最有价值的公司，超过了苹果公司。事实上，在众多平台中，唯有苹果公司的主要利润来源不是广告，其他都靠广告。

## 跟着金钱走

今早我发表了这么一条推特：

人们问我有哪些方式可以代替 Parse，如果你不编写自己的服务器代码，你的后台就永远处于危险之中。— Jameson Quave (@jquave) [February 2, 2016](https://twitter.com/jquave/status/694516340300713984)

这是真的，你真不能盲目信任这些社交媒体公司的服务作为自己的后端。你要根据“跟着金钱走”原则来找当事人的动机，如果他们动机不是给你提供服务赚取利润，那么估计这个公司也不会坚持太久。如果你是初创企业的 CEO，这也是做出商业决策的一个好方法。当你和任何人合作时，你必须确认他们的资金动机和你相似，不然你们之间永远都无法有效连接合作。这个理论也使用与雇员、联合创业者、合伙人和平台供应商等等。

## Facebook 的 API

早期使用 Facebook 的 API 时，你能轻易获取用户的联系人，结果导致了很多人都会收到 Facebook 游戏的垃圾邮件和信息，也造就了开心农场这样的成功游戏。但是 Facebook 觉得自己不喜欢这样，不再提供获取联系人的接口，这样就给很多应用造成了伤害，Zynga 的股票应声下跌。说真的，看看 Facebook 对 Zynga 的股票造成了哪些伤害：
![](https://swift.gg/img/articles/your-parse-backend-was-always-a-bad-idea/12401463538623.3903446)

如果你的主营业务是 App，***那么你的后端是非常重要的业务资产，你必须能够自己控制***。类似 Salesforce 的云计算公司几乎花了十年的时间才变成大型公司，甚至是在今天，大部分还在使用现场托管软件。原因就是运行良好的业务必须要有自己的关键系统。虽然这样做需要支付系统维护费用和初始部署的费用，但是如果你不能控制核心业务，那就只能把核心业务交给那些不靠谱的人，他们幻想能从你们的数据库中淘出点什么东西提供给广告商。你想让这些人来控制你的服务器吗？你信任 Facebook、Twitter、Google 吗？

## 创建你自己的该死的后端

你想要你的应用有一个稳定的后端，那么唯一的方法就是你自己创建一个。我知道这样听起来很难，不过如果你用 Ruby on Rails 或者 NodeJS 来创建一个简单的 API 来连接应用的话，难度也不是很大。说白了，Parse 后端基于 javascript，和 NodeJS 在表达上还是有一些相似的地方，使用节点模块传送 API，用 MongoDB 数据库作为后台。如果对你来说这听起来很困难，你只需花费几个小说去网上阅读一下教程即可，你就会意识到完全由你自己来做也不麻烦。实在不行，你还可以雇佣[我的公司](https://docs.google.com/spreadsheet/viewform?formkey=dGZFNjEyYXo2UDM0YlVQeGNQR2ZGMUE6MQ#gid=0)来帮你做这件事情。

如果你打算让某个平台来创建你的后端，你要确保能够拿到源代码，以及加载到任何服务器上所属的一切工具。Docker 能够包含 App 所有需要的所有的环境，而类似 Heroku 的服务能够让你轻松的部署 Rails 应用。

有趣的一件事情：在我这些博客快要写到 95% 的时候，在使用 Twitter embeds 功能时，它极具讽刺性地毁掉了所有的格式，我不得不重新调整所有的格式。^_^
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。