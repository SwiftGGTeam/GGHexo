title: "使用 Swift 3.0 操控日期"
date: 2017-01-19
tags: [iOS 开发]
categories: [iAchieved.it]
permalink: handling-dates-with-swift-3-0
keywords: 日期,Swift 3
custom_title: 
description: 本文展示如何在 Swift 3 中操控日期并和 Swift 2 作对比

---
原文链接=http://dev.iachieved.it/iachievedit/handling-dates-with-swift-3-0/
作者=Joe
原文日期=2016-09-20
译者=Cwift
校对=walkingway
定稿=CMB

<!--此处开始正文-->

当你在想要 [大规模重命名](https://developer.apple.com/videos/play/wwdc2016/403/) 时，一个附带的挑战就是要确保所有相关的文档都必须同步更新。比如，截至到 2016 年 9 月 20 日，[DateFormatter](https://developer.apple.com/reference/foundation/nsdateformatter) 的文档依旧没有与版本统一，引用的是 Swift 2.3 风格的 API（译者注：现在是 2017年，文档依旧没有更新...）。随着时间的推移，这些疏漏毫无疑问都会被纠正，这里是一些使用 `Date` 以及 `DateFormatter` 实现的日期格式化的示例。

<!--more-->

官方文档中当前的示例如下：

```swift
let dateFormatter = DateFormatter()
dateFormatter.dateStyle = .mediumStyle
dateFormatter.timeStyle = .noStyle
 
let date = Date(timeIntervalSinceReferenceDate: 118800)
 
// US English Locale (en_US)
dateFormatter.locale = Locale(localeIdentifier: "en_US")
NSLog("%@", dateFormatter.stringFromDate(date)) // Jan 2, 2001
 
// French Locale (fr_FR)
dateFormatter.locale = Locale(localeIdentifier: "fr_FR")
NSLog("%@", dateFormatter.stringFromDate(date)) // 2 janv. 2001
 
// Japanese Locale (ja_JP)
dateFormatter.locale = Locale(localeIdentifier: "ja_JP")
NSLog("%@", dateFormatter.stringFromDate(date)) // 2001/01/02
```

在 Swift 3.0 中变为：

```swift
let dateFormatter = DateFormatter()
dateFormatter.dateStyle = .medium
dateFormatter.timeStyle = .none
```

注意 `.mediumStyle` 被简化为 `.medium`。这种简化符合规则，我们知道类型是 `DateFormatter.Style` 所以没有理由重复 Style 一词。使用 `.none` 替换 `.noStyle` 也是同理。

现在看看设置格式化器的环境时发生的改动：

```swift
// US English Locale (en_US)
dateFormatter.locale = Locale(identifier: "en_US")
print(dateFormatter.string(from:date)) // Jan 2, 2001
 
// French Locale (fr_FR)
dateFormatter.locale = Locale(identifier: "fr_FR")
print(dateFormatter.string(from:date)) // 2 janv. 2001
 
// Japanese Locale (ja_JP)
dateFormatter.locale = Locale(identifier: "ja_JP")
print(dateFormatter.string(from:date)) // 2001/01/02
```

再一次，我们看到了从 `Locale(localeIdentifier:)` 到 `Locale(identifier:)` 的简化。减少了类型名及其引用。类似地，`DateFormatter` 的 `stringFromDate` 方法已经被简化为 `string(from:)`，完整的方法签名是 `string(from:Date)`。理解这种模式了吗？

继续用一个 `String` 描述的信息生成一个 `Date` 对象，苹果的文档展示了这样的示例：

```swift
let RFC3339DateFormatter = DateFormatter()
RFC3339DateFormatter.locale = Locale(localeIdentifier: "en_US_POSIX")
RFC3339DateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZZZZZ"
RFC3339DateFormatter.timeZone = TimeZone(forSecondsFromGMT: 0)
 
let string = "1996-12-19T16:39:57-08:00"
let date = RFC3339DateFormatter.dateFromString(string)
```

为了减少啰嗦和不必要的词汇，得到了下面的写法：

```swift
let RFC3339DateFormatter = DateFormatter()
RFC3339DateFormatter.locale = Locale(identifier: "en_US_POSIX")
RFC3339DateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZZZZZ"
RFC3339DateFormatter.timeZone = TimeZone(secondsFromGMT: 0)
 
let string = "1996-12-19T16:39:57-08:00"
let date = RFC3339DateFormatter.date(from:string)
```

`TimeZone` 构造器中删除了无关的三个字符（for），而且正如期望， `dateFromString` 方法变成了 `date(from:)`。

## 经验法则

从 Swift 2 转换到 Swift 3 时，一个通用法则是：去除多余的单词。如果你之前习惯了写 `formatter.timeStyle = .fullStyle`，现在你要习惯 `formatter.timeStyle = .full` 的写法。如果你看到了 `someTypeFromAnotherType()` 这样的写法，它可能已经被替换为 `someType(from:AnotherType)`。说一下我的体验，在使用 Swift 3 几个月时间后，再回到 Swift 2 会感觉命名过于冗长，这还是在我喜欢这种详细自说明语言风格的前提下。不过一旦你学会了 Swift，你会拥抱海明威而避开托尔斯泰。

愉快地 Swift 吧！
