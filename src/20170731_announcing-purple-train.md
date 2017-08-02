title: "关于 Purple Train 的说明"
date: 2017-07-31
tags: [iOS 开发]
categories: [Thoughtbot]
permalink: announcing-purple-train
keywords: Purple Train
custom_title: 关于 Purple Train 的说明
description: 关于 Purple Train 的说明

---
原文链接=https://robots.thoughtbot.com/announcing-purple-train
作者=Ian C. Anderson
原文日期=2017-1-9
译者=Tuccuay
校对=way
定稿=shanks

<!--此处开始正文-->

我一直想开发一个 iOS 应用，现在我可以很高兴的告诉大家，在许多同事的帮助下终于在今年完成了 [Purple Train](https://purpletrainapp.com/)。

![](/img/articles/announcing-purple-train/TujwAPQD6B8G2RoVixXA_purple-train-iphone-app-f7b427aaec509ee65069d07f2e809152.png1501462197.36)

<!--more-->

## 需求

Purple Train 为了解决一个简单的问题：我关心的下一趟 MBTA 通勤火车什么时候出发？市场上几个类似的 app 都感觉不太好用。我只想很快速的打开它并得到想要的信息，然后返回。

## 方案

如果你想从一个固定的「家」和波士顿之间通勤，这个应用能为你提供一个简单而有效的界面：选择你家附近的车站，然后就能离开看到往返于波士顿之间的列车。如果有快车不在选择的车站停车，它将会被自动过滤掉以免带来不必要的干扰。

## 技术

### 前端

在开始开发 app 之前，有不少人讲过 React Native 的优点，所以我尝试了一下。我感兴趣的原因并不是因为能使用 JavaScript 开发，而是因为它能够进行 [跨平台开发](https://robots.thoughtbot.com/rapid-cross-platform-mobile-development-with-react-native)。我已经很熟悉使用 React 和 Redux 进行函数式响应式编程。所以想在 Purple Train 上尝试一下看看它带来多大生产力的提升。

[Cole Townsend](https://twitter.com/twnsndco) 在完成 app 的初期设计工作的时候觉得非常舒服，他使用 React Native 的 [StyleSheet](https://facebook.github.io/react-native/docs/stylesheet.html) 来实现这些设计。

基本功能在 iOS 上正常运行之后，[Justin Kenyon](https://twitter.com/kenyonj) 和我花了半天时间把它移植到 Android。让我们感到高兴的是这个过程很简单，并且整个 app 中没有针对某个特定平台的兼容代码，在所有的工作中只用到了 React Native 和几个第三方库。

感谢 [Blake Williams](https://twitter.com/blakewilliams__), [Justin Kenyon](https://twitter.com/kenyonj), [Derek Prior](https://twitter.com/derekprior), and [Mike Borsare](https://twitter.com/mborsare) 所做的前端工作！

### 后端

这个 app 的后端是一个 Elixir Phoenix 应用，用于缓存 [MBTA’s Realtime API](http://realtime.mbta.com/portal) 的响应并且能够返回针对移动应用优化过的更精简的 JSON。

这个 Phoenix 使用 Elixir 提供的 [Agent](http://elixir-lang.org/getting-started/mix-otp/agent.html) 模块存储来自 MBTA API 的响应。这让我们有了一个非常迅速的内存缓存，使得后端能够快速响应。

后端还有一些可以过滤掉用户不关心的车次（比如已经离开用户所在车站或者不停靠用户所在站点的快车）的功能。这使得前端的工作更方便并且保持较小的 JSON 响应，这也有助于提升移动设备的性能。

感谢 [Derek Prior](https://twitter.com/derekprior) 和 [Josh Clayton](https://twitter.com/joshuaclayton) 编写并优化的后端！

## 小贴士

Web 开发工程师和设计师都可以立即开始使用 React Native。他们对 JavaScript 语言、Cmd + R 或者 Live Reloading 重新加载的工作流、函数式响应式编程和样式表都已经很熟悉了。

尽管使用 JavaScript 还可能存在很多问题，但这种熟悉的方式提供的生产力让 React Native 成为许多跨平台 app 选择。

## Elm Native

我们喜欢这个工作流，也喜欢这些概念，还熟悉这些语言。但是相比起 Swift 和 Kotlin 这些原生的编译型语言来说，则少了一些安全性和重构的便利性。

我们如何才能有一个高效的工作流，而不会遇到 JavaScript 错误，比如 undefined is not a function？如果使用 [Elm](http://elm-lang.org/) 语言可以让我们更自信地说代码是正确的吗？

幸运的是 Purple Train 是个很简单的 app，这让它能够很好地成为试验新技术的测试平台，请持续关注我们是如何使用 [elm-native-ui](https://github.com/ohanhi/elm-native-ui) 将 Purple Train 迁移到 [Elm](http://elm-lang.org/) 的！

## 参考

- [Purple Train](https://purpletrainapp.com/) 主页
- 阅读 [Rapid cross-platform mobile development with React Native](https://robots.thoughtbot.com/rapid-cross-platform-mobile-development-with-react-native)
- 收听 [Bikeshed Podcast episode about Purple Train](http://bikeshed.fm/86)