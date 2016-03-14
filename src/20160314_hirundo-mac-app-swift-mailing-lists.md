title: "Hirundo：在 OS X 上轻松获取 Swift 邮件列表"
date: 2016-03-14
tags: [Swift 邮件列表]
categories: [APPVENTURE]
permalink: hirundo-mac-app-swift-mailing-lists
keywords: swift邮件列表
custom_title: 
description: 邮件列表能让你更好的理解Swift的理念和特性，那么如何在在 OS X 上轻松获取 Swift 邮件列表呢，来看看本文吧。

---

原文链接=http://appventure.me/2016/02/02/hirundo-mac-app-swift-mailing-lists/
作者=BENEDIKT TERHECHTE
原文日期=2016-02-02
译者=CoderAFI
校对=Cee
定稿=天才175

<!--此处开始正文-->

如果你对 Swift 感兴趣，邮件列表是一个特棒的资源。像 [Swift-Evolution](https://lists.swift.org/mailman/listinfo/swift-evolution) 邮件列表里就讨论了很多关于语言未来的发展方向和走势的内容。订阅它肯定会帮助你很好的理解 Swift 的设计理念和新特性。[Swift-Dev](https://lists.swift.org/mailman/listinfo/swift-dev) 邮件列表是从另一个方面阐述 Swift 内部的工作原理。如果你对这些不感兴趣，另外还有一个 [Swift-Users](https://lists.swift.org/mailman/listinfo/swift-users) 邮件列表是专门帮助你来解决 Swift 开发中遇到的问题的。
<!--more-->

订阅这些邮件列表不仅有用而且会让你受益匪浅。但是，订阅它们有一些小麻烦：

- Web 归档内容不容易访问
- 订阅列表后还需要在单独的邮箱或者邮箱列表应用中进行绑定
- 不能看到订阅之前发布的内容
- 许多有用的功能（例如书签、免打扰等）无法使用

这些都困扰了我。我非常希望订阅这些专题，所以我希望有一个更好的界面工具来展示这些内容。因此圣诞节过后我便开始开发一款应用程序来解决上述问题。

### **介绍** Hirundo

![Hirundo](http://appventure.me/img-content/hirundo-title@2x.png)

![Screenshot](https://stylemac.com/hirundo/gallery/teaser1-full@2x.png)

Hirundo 最终就是长上面这样的（当然是用 Swift 写的）。这是个拉丁语，意思就是燕子或者雨燕，所以我觉得这个名字非常酷。我也给它专门制作了一个网站[stylemac.com/hirundo](https://stylemac.com/hirundo/)。

由于还有一些 bug 没有修复完毕，所以这款应用目前还是 beta 版。能实现当前这些功能并将它发布出来已经让我欣喜若狂。当前支持的功能列表如下：

- 同时订阅多个 Swift 邮件列表
- 查看并搜索列表中的所有内容
- 搜索所有邮件详情内容
- 针对某些内容开启免打扰模式
- 如果你订阅了邮箱列表想回复时，Hirundo 会打开邮箱应用并设置好发送的头信息
- 根据你喜欢的作者筛选消息
- 更多纬度的排序方式
- 可以合并和展开消息
- 添加消息书签，制作消息文件夹方便以后阅读
- 回复主题或者发起主题讨论

**[不下载试一试嘛！(‘∀’●)♡](https://stylemac.com/hirundo)**

### 构建

开发一款应用程序比我预期的时间要长很多。起初，我天真地认为，实现这款应用程序没有技术局限。于是在没有充分认识到困难的情况下就开始开发，结果在开发过程中遇到最大的问题就是用普通的 REST API 的方式无法获取到 Swift 邮件列表数据。获取数据只能通过以下两种方式：

### 解析 HTML 归档

用这种方式有几个缺点。这需要**非常多**的 `HTTP` 请求，对服务器进行抓取也非常慢。这些 `HTML` 页面在语法上很难做到正确的进行解析。更糟糕的是，无法把相关内容关联起来形成消息树。

### 解析邮件归档

我采用的是第二种方法。所有的归档内容都是 Unix 下 `mbox` 格式的，因此内容解析起来还是比较容易的。而且也包含了构建消息专题所必需的信息。最终我决定用 [MailCore 2](https://github.com/MailCore/mailcore2) 来解析这些 `mbox` 格式的邮件，这样我就没必要自己实现一个 [RFC2822](https://tools.ietf.org/html/rfc2822) 解析器了。但是 [Pipermail](https://en.wikipedia.org/wiki/GNU_Mailman)<sup>1</sup>产生的 mbox 格式跟 RFC2822 还是有一些细微的区别，所以我们做了一些处理，让 MailCore 库能进行解析。这样，消息最终便可以获取、解析、转换，最终利用 Core Data 来进行存储。

### 实时内容更新

当使用这款应用程序一段时间后，我意识到最新的消息邮件列表归档信息无法实时更新。实际上，这些压缩的归档内容一天只生成一次。这样当你看到这些讨论内容时，内容其实已经过时了。我意识到我需要寻找下技术方案来解决这个问题。已经证实 `HTML` 是无法解决这个问题的。目前来看唯一的解决途径就是我自己来缓存这些实时消息。

下一步就是搭建一套可以获取订阅邮件的 `smtp` 邮箱服务（这比我预期花了更多的时间），并且该服务器能把邮件转换成 `mbox` 的格式。最终我采用了一个小型 web 服务器来缓存邮件文件。当官方的邮件列表归档更新时，服务器的缓存也会删除<sup>2</sup>。如果你运行了 [Little Snitch](https://www.obdev.at/products/littlesnitch/index.html)，你就会看到 Hirundo 会从 **`hirundo-lists.stylemac.com`** 服务器上下载数据。

### 回复邮件或者新建讨论

当你点击**回复**或者**新建一个讨论**时，Hirundo 会使用 `mailto:` 这个 Scheme 打开默认的邮箱应用程序并且创建一封设置好头信息的新邮件。OS X 的 **Mail.app** 并不是采用强制的邮箱头（`In-Reply-To`）而是采用了一种可选的邮箱头（`References`）。如果适配了系统的邮箱应用，发出去的邮件在 Pipermail（即邮件列表） 上却很不友好，所以这并不是一个很好的解决方案。其他的邮件客户端（例如 Thunderbird）就不存在这样的问题。将来更好的解决办法就是直接通过 Hirundo 来直接发送回复邮件。

### 开发界面

前面的技术难点都攻克了，我就可以开发应用程序的界面了。为了能使用 WWDC 上最新发布的前沿技术，我决定让应用程序只支持 10.11 El Capitan。事与愿违，由于一些起初的设计并不像我想象的那么好，所以我还没有完成 1.0 版，就就决定要重构该项目。

### Mac 应用程序开发

在开发这个项目的过程中，我写了一些有意思的教程。接下来的文章内容我会介绍如何用 Hirundo 的代码来开发一些示例性的 Mac 应用程序。目前用 Swift 开发 OS X 应用程序的资料还不多，我希望能填补这一空白。

---

1. 官方 Swift 列表采用的邮箱软件
2. 有些消息如果卡的时间比较准，可能就会存在晚一天删除的概率。

