使用 Swift 检查 API 可用性


> [原文链接](http://useyourloaf.com/blog/checking-api-availability-with-swift.html)
> 原文日期：2015/08/24

> 译者：[天才175](http://weibo.com/u/2916092907)
> 校对：[numbbbbb](https://github.com/numbbbbb)
> 定稿：[小锅](http://www.swiftyper.com/)

Swift 2 做了一些改进，能够更简单、更安全地检查 API 可否用于特定的 iOS 版本。

## Objective-C 方法概述

在看 Swift 之前，我们先来简单地概述一下在 Objective-C 中，我们是如何来查看 SDK 的可用性的。



### 检查类/框架的可用性

就像所有重大发布一样，iOS 9 的发布推出了许多新的框架。如果要部署在 iOS9 以下的系统上，你需要以**弱连接**的方式使用那些新框架，并且将在**运行时**检查类的可用性。比如，我们想使用 iOS9 上的新的 Contacts 框架，但是也要在其不可用的时候能退回到 iOS8 上较老的 address book 框架:

```objectivec
if ([CNContactStore class]) {
  CNContactStore *store = [CNContactStore new];
  //...
} else {
  // Fallback to old framework
}
```
### 检查方法的可用性

使用`respondsToSelector`来检查框架中是否添加有该方法。比如，iOS9 在 Core Location 中引入了 allowsBackgroundLocationUpdates 属性：

```objectivec
CLLocationManager *manager = [CLLocationManager new];
if ([manager respondsToSelector:@selector(setAllowsBackgroundLocationUpdates:)]) {
  // 在 iOS 8 中不可用
  manager.allowsBackgroundLocationUpdates = YES;
}
```
### 陷阱

这种检查可用性的方式很难维护，也不像它们看起来那样安全。思考一下，如果我们要检测一个符号(symbol)的可用性，这个符号(symbol)在以前 Apple 版本中是私有的，但现在是公有的了，会发生什么呢。比如，在iOS9中有`UIFontTextStyleCallout`在内的几个新的文本样式。想要使用 iOS9 中的这种样式，你可以试着用上面的方式检查一下，本来预计在iOS8中应该是空值：

```objectivec
if (UIFontTextStyleCallout) {
  textLabel.font = [UIFont preferredFontForTextStyle:UIFontTextStyleCallout];
}
```
不幸的是，这种方式并不像期待中那样有效。结果会显示这种符号在 iOS8 中存在，只是并不是公共声明的。使用私有的方法或值会导致无法预测的结果，这并不是我们想要的。

## Swift 2 方法

Swift 中这些可用性检查是内置的，而且是在**编译时**检查。这意味着，当我们使用的 API 在部署目标系统不可用时，Xcode 能及时告诉我们。比如，如果我试着在 iOS8 中使用`CNContactStore`，Xcode 会提示做出如下修改：

```swift
if #available(iOS 9.0, *) {
  let store = CNContactStore()
} else {
  // 回滚到旧的版本
}
```

你可以使用同样的方法代替之前我们使用的`respondsToSelector`来进行检查：

```swift
let manager = CLLocationManager()
if #available(iOS 9.0, *) {
  manager.allowsBackgroundLocationUpdates = true
}
```

###可用性条件

`#available`条件中包含了一些平台（`ios`,`OSX`,`watchOS`）和版本。比如，一些代码只能运行在 iOS9 或者 OS X 10.10 中：

```swift
if #available(iOS 9, OSX 10.10, *) {
  // 在 iOS 9, OS X 10.10 中执行的代码
}
```
你总是需要最后的那个 `*` 通配符来包含其他未指定的平台，尽管你的 App 并不针对它们。

你可以通过以下方式来提高代码的可读性。如果你的代码中有判断语句，你可以通过在`guard`语句中使用`#available`，从而能在函数中快速返回：

```swift
private func somethingNew() {
  guard #available(iOS 9, *) else { return }

  // do something on iOS 9
  let store = CNContactStore()
  let predicate = CNContact.predicateForContactsMatchingName("Zakroff")
  let keys = [CNContactGivenNameKey, CNContactFamilyNameKey]
  ...
}
```
如果你需要一个函数或类只在某些条件下可用, 使用`@available`关键字：

```swift
@available(iOS 9.0, *)
private func checkContact() {
  let store = CNContactStore()
  // ...
}
```
## 编译时安全

最后，我们再来看这个问题。有些属性在 iOS 9 中是公有的，但是在 iOS 8 中是私有的。如果我们在 iOS 8 中设置 iOS 9 特有的字体，会导致一个编译时错误：

```swift
label.font = UIFont.preferredFontForTextStyle(UIFontTextStyleCallout)
> 'UIFontTextStyleCallout' is only available on iOS 9.0 or newer
```
Swift 可以依据平台版本轻松进行检测并退回到一个合理的默认值：

```swift
if #available(iOS 9.0, *) {
  label.font = UIFont.preferredFontForTextStyle(UIFontTextStyleCallout)
} else {
  label.font = UIFont.preferredFontForTextStyle(UIFontTextStyleBody)
}
```


