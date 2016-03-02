在 WordPress 中使用 GitHub README 标签"

> 作者：Joe，[原文链接](http://dev.iachieved.it/iachievedit/github-readme-badges-in-wordpress)，原文日期：2016-01-24
> 译者：[小袋子](http://daizi.me)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[Cee](https://github.com/Cee)
  










GitHub 上的很多框架和包都在他们的 README 文件中使用「badges（标签）」记录 repository 的不同属性。例如：

- 一个 repository 的 Travis 构建（译者注：Travis CI 是开源持续集成构建项目）是否通过
- 一个 release 版本代码的下载次数 
- 代码支持的平台（为苹果设备开发时尤其有用）

![Badges!](http://swift.gg/img/articles/github-readme-badges-in-wordpress/githubbadges.png1456881015.7654293)


自 2014 年 6 月初次发布以来，[Swift 编程语言](https://en.wikipedia.org/wiki/Swift_%28programming_language%29)已经经历过了一系列的改变和版本。每一个发行版本都包含了破坏性的改变。从这篇文章开始，我已经开始使用标签去指明文章所兼容的 Swift 版本。

### 添加标签

你可以在 WordPress 文章中通过两种技术使用标签。获取标签最好的方式是使用内联图片，使之看起来像——好吧，就是像标签。你也可以自己创建图片或者使用类似 [Shields.io](http://shields.io/) 的服务去链接标签。不管什么方式，如果要在你的页面展示标签，那就必须使用`<img/>`。Shields.io 链接标签的例子如下：

    html
    <img src="https://img.shields.io/badge/Swift-2.2-orange.svg?style=flat" alt="Swift 2.2" />

这会生成这样的标签：![Swift 2.2](https://img.shields.io/badge/Swift-2.2-orange.svg?style=flat)

此外你还可以使用 Markdown 语法（和 GitHub 的 README.md 文件那样）。如果要在 WordPress 中使用 Markdown，你需要安装 [Jetpack](https://wordpress.org/plugins/jetpack/) 插件，然后激活它的 Markdown 组件。激活 Markdown 组件之后，创建一篇新的文章，在文章中输入下面的内容：

    markdown
    ![Swift 2.2](https://img.shields.io/badge/Swift-2.2-orange.svg?style=flat)

这使用了 [Markdown 的图片语法](https://daringfireball.net/projects/markdown/syntax#img)，可以显示出这样的标签：![Swift 2.2](https://img.shields.io/badge/Swift-2.2-orange.svg?style=flat)

### Shields.io

Shields.io 的设计理念是「标签即服务」。换句话说，你无需创建自己的标签，Shields.io 会为你创建标签。大多数的 Shields.io 标签在语义上和「某个东西」的状态捆绑在一起。例如，URL：`https://img.shields.io/github/downloads/atom/atom/total.svg` 生成的标签会显示 [Atom](https://github.com/atom/atom) 程序被下载的次数。Shields.io 首先会访问 GitHub 接口获取到真实的下载数量，然后返回生成的图片。

上述 Swift 例子中使用了这个 Shields.io URL：
`https://img.shields.io/badge/<SUBJECT>-<STATUS>-<COLOR>.svg`。我们通过提供如下几个选项使用它：

- SUBJECT 为 Swift 
- STATUS 为 2.2 
- COLOR 为 orange

用 orange 的原因：它是 Swift 的代表色。

### 小结

我强烈推荐每个 Swift 博主都用标签（或者一些等同的形式）来声明 Swift 语言的版本，就像我们的例子那样。为什么要这样做？举个例子，C 风格的循环在 Swift 2.2 中是废弃状态，在 3.0 中使用会产生错误。如果某个人看到你的 2.2 版本的文章并试图使用 3.0 的编译器运行代码，那他们就会知道，有些代码可能不兼容。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。