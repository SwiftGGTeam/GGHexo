title:拓展 Swift 应用领域
date:2018-10-04
tags: [Swift]
categories: [Swift]
permalink: expanding-swifts-reach

---

原文链接=http://appventure.me/2018/05/03/expanding-swifts-reach/
作者=terhechte
原文日期=2018-05-03
译者=BigLuo
校对=Cee,numbbbbb
定稿=Forelax

<!--此处开始正文-->

我想大家应该都会同意 Swift 是一门优秀的语言，很好的处理了那些简单与复杂的问题。理论上讲，它将会成为重要的编程语言之一。目前，Swift 的使用仅限于苹果开发领域（外加少量服务端 Swift 以及近期宣布的 [Swift 版本的 Tensorflow](https://www.tensorflow.org/community/swift)）。

>“My goal for Swift has always been and still is total world domination. It’s a modest goal”
>
>“我一直期待着 Swift 统治世界，这是一个谦虚的目标。”
>
>- Chris Lattner

随着新的泛型特性在 Swift 4.1 中推出以及 [ABI 在 Swift 5 中逐渐稳定](https://swift.org/abi-stability/)，Swift 似乎逐渐具备了跳出苹果开发领域的条件。本文我会讨论一个我知道的问题，它阻碍着 Swift 广泛的应用，准确的讲，与其它问题一样，该问题也正在被开发社区着手解决。

<!--more-->

我会简单介绍 Swift 在这个领域的**竞争力**。就像 C++ 一样，其它编程语言也渴望成为一个跨平台的通用的语言。通过比较 Swift 和其他语言处理相同问题上的方式，可以让我们该如何改进 Swift。

## 系统包管理

Swift 拥有一个非常健康的开源社区，拥有大量杰出、精心编写且实用的开发框架。但是，这些开发框架多为 iOS（macOS 相对少很多）UI 库，这让 Swift 受限在这个开发领域。这里有很多 UI 动画库、UI 布局库、含有 UI 元素的框架、UI 协作库和 JSON 解析库。因为缺少 UIKit/AppKit，它们中的大部分无法在 Linux 上运行。当然，这里也有一些类似于 [Vapor](https://vapor.codes/) 或 [Kitura](http://kitura.io/) 的 Web 框架，致力于在 Web 开发领域推广使用 Swift 语言。

然而，与大众观点不同，在 Linux 平台上，很多公司不仅在 Web 服务端，也在 Linux 的其它方面做了大量的工作。先简单举个例子，有些编程语言可以管理系统，掌控系统权限，并且提供相应的开发工具和库。这些内容虽然和 iOS 或者 macOS 应用开发没有相关联，但是对于系统或者 Web 开发来说极其重要。比如，数据库权限、系统文件管理、进程管理、日志分析与收集、容器管理、部署工具、甚至区块链工具。

随着 Swift 4.1 的发布，在 [Hacker News 上有一个讨论这门语言的帖子](https://news.ycombinator.com/item?id=16710895)。我完整通读多次后，觉得回复很有趣。让我感触最深的是下面的评论：

>“相比 Go 和 Rust 在系统支持和库的量级方面，Swift 的系列库只有一小点儿......如果我们列出其它编程语言在已发布的应用、数据库后端方面库的贡献，Swift 的数量基本可以忽略不计”

让我们来看看这些竞争对手。

## 竞争者

在最近几年，编程语言领域出现了几个新的有力的竞争者。当然，你也许并不同意这些语言是 Swift 的合格竞争者。这里仅根据我个人的感觉列举出几个编程语言，排名不分先后。

这些看法可能并不准确。请不要因为你是某个语言的粉丝，并认为我的说法存在错误，就把他们分享到 Twitter。我只是一个有着某些观点的普通人，而这些观点确实含有一些错误。相反，我们可以利用这些精力来追问问题原由，并改善或解决问题本身。

### Go

Go 的发布时间比 Swift 早很多，它多用于开发系统工具，却很少在图形界面中使用。Go 不支持现代语言特性，如标签联合、泛型，或函数式编程。但它易上手，速度快，并使用了垃圾回收器，生成的二进制文件使得其内存消耗非常低。当然，垃圾回收器也使得 Go 在嵌入式开发和使用 Webassembly 变得有点棘手。

Go 良好的性能，语言的简单性和低内存占用率催生出了大量的系统工具和库。如：Grafana、Kubernetes、CoreOS-etcd、Go-Ethereum、CockroachDB、Hub、Terraform 等等。[通过这个列表，我们可以看到一个问题的多种解法](https://github.com/avelino/awesome-go)。

简言之，如果你想做基于系统层面的开发，你能找到几乎所有你想要的依赖包。

### Kotlin

Kotlin 像是 Android 版本下的 Swift，但其底层却完全不同。基于 JVM 的 Kotlin 使得它必须大量使用引用类型，就像 Go 的垃圾回收器使其在嵌入式系统的开发成为一个挑战。然而，[Kotlin-Native 的出现让它在未来有了更多的可能性](https://kotlinlang.org/docs/reference/native-overview.html)。Kotlin-Native 是基于 LLVM 构建的，支持嵌入式平台开发、Webassembly 等。Kotlin 也能被编译成 Javascript，Kotlin-Native 甚至可用于构建 iOS 应用的框架。

Kotlin 也可能会成为未来的一个主流语言，但和有着相同问题的 Swift 一样，其发展遇到了类似的阻碍。几乎所有可用的开源库集中在 Android 开发领域。而 Kotlin-Native 解决的是一个纯粹 JVM 语言所面临的问题。我不知道一个易于执行且轻量级的 Kotlin-Native 要如何实现（相比于 C++ 或 Swift，尤其是在嵌入式开发、复杂系统开发、或 Webassembly）。

### Rust

Rust 是一个有趣的语言。事实上它是如此的有趣，我花了几个月的时间慢慢的学习它。这门语言的很多方面与 Swift 相似，但比 Swift 更难（这里我们暂不做讨论，该部分内容将以主题的形式发布在博客）。似乎这两种语言一开始就是采用完全相反的设计思路；Swift 作为一个易学的语言起初是一些容易上手的特性，慢慢的添加复杂的特性。Rust 起初作为一门复杂的语言，它正在慢慢的增添一些更简单的抽象对象或更好的错误调试信息来让初学者容易上手。两种语言语法类似，这点我并不惊讶，直到未来的突然某天，我意识到两门语言在某些简单和复杂特性上有着高度的相似性。然而，目前而言，在你经历一段复杂学习体验的后，便会发现 Rust 背后有提供了一些非常诱人的特性。

相对于 Swift，Rust 提供了更好的跨平台特性和一个虽难于处理但更高效的内存管理策略（比如在对象的生命周期和所有权方面），[幸运的是，Rust 的一部分内存管理的优点未来也会在 Swift 上出现](https://github.com/apple/swift/blob/master/docs/OwnershipManifesto.md)，同时它也支持 [Webassembly](https://rust-lang-nursery.github.io/rust-wasm/)（你可以用 Rust 写一个前端 App），也提供了很好的基础库让开发者能够快速的构建新项目，虽然它没有提供像 Go 一样数量级的高质量项目，但它也提供了一些有潜力的项目（CoreUtils，RedoxOS，TikV，Vagga，Servo，Parity）。但更重要的，现在已经有大量的 Rust 第三方库供你选择。[你可以来看看看下这个列表。](https://github.com/rust-unofficial/awesome-rust)

### 其他语言

这里还有像 D，Nim、Chrystal、Elixir、TypeScript 等语言，当然也包括 C++ 自身。

## 我们看到了什么

目前 Swift 在系统包管理领域有短板，这也是一个先有鸡还有先有蛋的问题。

> “因为没有足够多的系统包，导致那些对 Swift 感兴趣的开发者在开发简单 Demo 应用时数据库处理不方便，从而对 Swift 失去兴趣，对 Swift 失去兴趣的开发者更不愿意去改善包管理了。”

对我而言，我们需要改进我们的系统包/库。如果我们能用 Swift 写出 Kubernets 之类的东西，那一定很棒。为了实现这个项目，我们需要一套好的基础库用于一般性的系统开发。下面我列出了基础的功能库和相关三方服务（此外，下面列出的功能，已经存在部分，不需要我们重复造轮子）。

* 认证
* 缓存
* 并发
* 云服务
* 命令行参数解析
* 命令行 UI
* 命令行编辑器
* 压缩
* 计算（例如：BLAS）
* 加密
* 数据库
* 数据处理
* 数据结构
* 数据可视化
* 日期和时间
* 分布式系统
* 电子邮件
* 编码和解码
* 文件系统
* 图像处理
* 机器学习
* 解析
* 文本处理
* 虚拟化

我认为，让 Swift 成为一门通用的语言，能够在非苹果操作系统上运行，Swift 需要提供一个健壮的、跨平台的包管理系统。

## 你能做些什么？

### 写库

在你决定写 JSON 解析器，动画库、自定义的开关按钮，或者抽象的集合视图/表格视图的代码之前，考虑写一个跨平台的系统库。如果你不知道怎么做，你可以去看看 Go 和 Rust 提供的那些已有的库。

### 重写现有 C 库

对于某些场景，Swift 的确提供了库，但那些库底层仍然是 C 的实现。虽然那样也搞定了问题，但在混合的过程中引入了 C 这门不安全的语言，在那些要求绝对安全的执行案例中，我们必须要为此做特别处理。当然，如果你想不到你想要写什么，可以用纯 Swift 实现一个你使用过的东西。这也是一个好机会，学习更多的 C 的同时进而爱上 Swift。

### 关心 Linux

我最近用 Vapor 写了一个小应用，需要为它添加几个依赖库（比如：时间计数器）但大部分的现有的库只支持 iOS/macOS。 假如你有处理跨平台（由于没有 UIKit/AppKit 的依赖）的经验，可以尝试在 Linux 上测试编译 Swift。

这比听上去更简单。这里有一个可用的 [Swift 4.1 版本的 docker 镜像](https://hub.docker.com/r/ibmcom/swift-ubuntu/tags/)，你可以直接运行它来测试你的代码，或者选择通过 [Virtualbox](https://www.virtualbox.org/) 虚拟机来运行它。

### Swift 包管理的支持

如果你已经有了一个库，除了支持 CocoaPods 和 Carthage 外，请尝试支持 Swift Package Manager。

### 运行在 Foundation 库上

另一件依旧困难的事情是 Swift 在 Linux 的 [Foundation 库](https://github.com/apple/swift-corelibs-foundation) 是基于 iOS/macOS Foundation 库的二次实现，因此依旧存在些没有实现的特性和（特别棘手）bugs。这意味着也许你写在 Mac 上面的代码在 Xcode 中跑的很好，但由于 Linux Foundation 库的 bug，它运行在 Linux 上时可能会崩溃。为了拓展 Swift 的应用领域，让 Linux 上面的 Fundation 库代码变得更加健壮是一个很好的目标。

最简单的开始方式是去 [Swift Jira](https://bugs.swift.org/secure/Dashboard.jspa) 的首页搜索 Foundation bugs。

### 帮助改进 Foundation 库

如果你没有时间或者对在 Swift Foundation 上的工作内容不感兴趣。你也可以在 Linux 上使用或者测试 Foundation 库，并且提交 bug 报告。只要有越来越多的人使用它，它也将变得更加稳定。

### 帮助改善 Linux 编辑体验

Linux 用户没有 Xcode，所以他们使用 Atom、Emacs、Vim 或 VSCode。这里已经有多个项目来让这些编辑器支持 Swift 语言编辑。但我们也许能够改进它们。如果你有空闲时间，用你喜欢的编辑器参与到这些项目中来，进行测试提交问题或解决这些问题。

### 参加在 San Jose 举办的 Try Swift 大会

如果你恰好在 San Jose 参加今年的 WWDC。这是一个很好的学习机会。 你会遇见一些有趣的人，[尝试参加在 San Jose 举办的 Try Swift 大会](https://www.tryswift.co/events/2018/sanjose/)。 

>“你有机会为 Swift 做出贡献。加入一个 Swift 开源贡献者小组，讨论有关 Swift 开源项目的最新消息，然后在社区导师的帮助下为 Swift Evolution 做出自己贡献！”

[你可以查阅这个链接](https://www.tryswift.co/events/2018/sanjose/)

### 举手之劳

在过去的一年半里，我没有太多时间做任何关于开源的工作，因为我一直忙于自己的（闭源）项目，但我真想再次为 Swift 开源代码贡献。我真的很喜欢 Swift，这是一个很棒的语言，帮助它成功的那些日子，是我曾感到最美妙的时光，如果你有同样的感觉，请分享这篇文章。

[如果对文章内容有想法的话，欢迎来 Twitter 上一起讨论](https://twitter.com/terhechte)
