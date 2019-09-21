Elm Native UI in Production"

> 作者：Josh Steiner，[原文链接](https://robots.thoughtbot.com/elm-native-ui-in-production)，原文日期：2016-03-01
> 译者：[muhlenXi](http://muhlenxi.com/)；校对：[Yousanflics](http://blog.yousanflics.com.cn)，[aaaron7](http://www.jianshu.com/users/9efd08855d3a/)；定稿：[CMB](https://github.com/chenmingbiao)
  









在 11 月份，thoughtbot 发布了一个叫 [Purple Train](https://purpletrainapp.com/) 的 APP ，该 APP 是用 [React Native](https://thoughtbot.com/services/react) 实现的， `React Native` 一直被用于快速构建跨平台的 APP 。由于 `Reactive Natice` 对传统移动开发的许多改进，使我们更加喜欢它，比如声明性 API、更快的开发周期、对 Web 开发和设计师来说更友好和跨平台等。但是 `React Native` 并不是对每个 APP 都非常合适，它虽然适合大多数的 APP ，但仍然有一个主要的缺陷：`JavaScript` 。

`JavaScript` 作为一门语言它一直在改进，它有一个显著优点就是无所不在，然而，它也以 [奇怪的行为](https://www.destroyallsoftware.com/talks/wat) 和弱类型系统（读作 `aggressive type coercion` ）而闻名。



### Elm Native UI

开始说 [Elm Native UI](https://github.com/ohanhi/elm-native-ui) - 一个提供 `React Native` 组件编译功能的 `Elm` 库。如果你听过 `Elm` ，你可能知道 [amazing error message](http://elm-lang.org/blog/compiler-errors-for-humans) 和听说 [zero runtime errors](https://www.pivotaltracker.com/blog/Elm-pivotal-tracker/) 的主张。`Elm` 的安全性来自于它的 `pure function（纯函数）` 和强大的静态类型，这也使得 `Elm` 的代码更容易验证。

在发布 `Purple Train` 的 `React Native` 版本的时候，我们偶然发现了 `Elm Native UI` 。它在 GitHUb 的 repo 中清楚的声明了，“不要用于生产环境中”，但我想要把它加入测试，我从一些简单 feature 开始，不断拓宽边界。该 APP 很快就接近 `React Native APP` 相同的特点。在 12 月份，虽然库不成熟，但是它的开发环境是极其出色的，于是我们决定创建一个 Purple Train 的试验版本，在我们完成剩下的功能后将第一个 `Elm Native UI APP` 发布到生产环境中。

### React vs Elm

用 `React` 和 `Elm` 开发的差异是很明显的，在 `React` 中，当开发一个功能时，你必须充分考虑每一步，如果你忘记了某一步，很少的提示会告诉你你错过什么并且 `React` 需要花一些时间来追踪和考虑如何将这些部分连接起来。

在 `Elm` 中，你可以根据编译器友好的错误提示来持续做一些简单的改变直到程序调通。你不需要担心在功能开发中途离开，因为当你回来的时候，编译器会提醒你接下来做什么。此外，你可以简单快速的在整个代码库中进行全面更改但是却没有任何程序崩溃。用 `Elm` 编程就如同和一个厉害的 robot 一起编程一样。 

`React` 取决于开发者不要犯错误，尽管有像 `eslint` 这样的静态分析工具可以帮助您，但是对于像 `JavaScript` 这样的动态语言的帮助是有限的，当你犯错误时，在开发模式下，你可能会看到用 “Red Screens of Death” 显示的运行时错误。

![](https://swift.gg/img/articles/elm-native-ui-in-production/UMpL2QIqQFutYXmAJikX_react-native-red-screen-of-death.png1525918443.8166037)

Elm 另一方面依赖编译器来捕获 bug，我很高兴的说，在 `Purple Train` 运行期间，我没有碰到一个 Red Screen of Death<sup>[1]</sup>。

### Not Ready for Prime Time

尽管到目前为止 `Elm Native UI` 的体验非常棒，但是 `Elm Native UI` 至今还没有为大多数生产环境的 APP 做好准备。它仍然缺少关键功能，如图片绑定和简单的设定过程 - 当前过程实现这些仍然颇具挑战。目前 thoughtbot 在为 `Elm Native UI` 在一些重要方面的应用而努力。如果你还有疑问，你可以访问 [elmlang Slack](http://elmlang.herokuapp.com/)  的 `#elm-native-ui` 频道。

---------

1、这并不完全正确。我遇到了 Red Screens of Death ，是当我为 `Elm Native UI` 库开发新功能时，而不是为 `Purple Train` 写新功能的时候。假定 `Elm Native UI` 中的 `JavaScript` 是没有 bug ，我希望这对于其他 APP 也是这样。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。