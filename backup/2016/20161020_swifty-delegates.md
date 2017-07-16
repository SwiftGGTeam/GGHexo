title: "Swift 中代理方法的命名方式"
date: 2016-10-20
tags: [Swift]
categories: [KHANLOU]
permalink: swifty-delegates
keywords: 
custom_title: 
description: 

---
原文链接=http://khanlou.com/2016/09/swifty-delegates/
作者=Soroush Khanlou
原文日期=2016-09-27
译者=saitjr
校对=CMB
定稿=CMB

<!--此处开始正文-->

可以说 Swift 是 Objective-C 的后继之人，毕竟也算是师出同门。但是他们语法看来不像，用起来也不像，给人的感觉也不一样。有些在 Objective-C 上用得好端端的案例，在 Swift 上却看起来怪怪的，如方法命名。在 Objective-C 中，方法名尽量完整：

```objective-c
[string dataUsingEncoding:NSUTF8StringEncoding];
```

在 Swift 2.2 中，这样调用看着就没那么优雅：

```swift
string.dataUsingEncoding(NSUTF8StringEncoding)
```

在 Swift 3 中，这个方法看起来就顺眼多了：

```swift
string.data(using: .utf8)
```

所以，像 Swift 3 中这样的命名方式，才是 Swift 的正确姿势。而 Objective-C 的方式也只适用于 Objective-C。我觉得[这篇文章](http://inaka.net/blog/2016/09/16/function-naming-in-swift-3/)应该能帮你在新世界中修炼你的方法命名习惯。

<!-- more -->

无论是三方框架，还是平时开发中编写的代码，都应该更新为更为 Swift 的方式。下面，我将着重说一下代理的命名。

Swift 中代理的理解和 Objective-C 并不完全相同。Objective-C 偏向于 “发送者” 与 “接收者”。Apple 的 Objective-C 文档也倾向于这种方式。比如 `UIResponder` 的 `isFirstResponder` 方法，文档上是这样解释的：

> Returns a Boolean value indicating whether the receiver is the first responder.
>
> 返回一个接收者是否是第一响应者的标识（布尔值）。

所以，在设置 target-action 的时候，参数名理所当然的称为 `sender`：

```objective-c
- (void)buttonTapped:(UIButton *)sender {
```

代理方法的定义规则和这个类似：在 Objective-C 中，代理方法的第一个参数总是发送者。让我们来看看为什么会这样：如果你（接收者，即实现代理方法的对象）是多个相同类型对象的代理，那么你需要这个参数来进行区分。所以代理方法提供了第一个参数，方便分别处理。（译注：例如多个 `UITextField` 的 `delegate` 都是 `self` 的时候，就需要进行区分是哪个 `UITextField` 调用的代理方法）。

下面我会用到 [Backchannel SDK](https://github.com/backchannel/BackchannelSDK-iOS) 中的例子，为了简单起见，我简化了一些类名。

这个 SDK 中代理方法分为两大类。第一类是事件触发的代理：

```objective-c
- (void)messageFormDidTapCancel:(BAKMessageForm *)messageForm;
```

在 Swift 中，翻译为：

```swift
func messageFormDidTapCancel(_ messageForm: BAKMessageForm)
```

这要放在 Swift 3 中就不那么顺眼了。在 Swift 3 中，应该去调冗余部分（`messageFrom` 重复了），并且第一个参数应该有别名，而不应该用下划线代替。

第二类是事件触发，并且还带有部分数据的代理方法。对于这类，我举了以下两个例子：

```objective-c
- (void)messageForm:(BAKMessageForm *)messageForm didTapPostWithDraft:(BAKDraft *)draft;
- (void)messageForm:(BAKMessageForm *)messageForm didTapAttachment:(BAKAttachment *)attachment;
```

在 Swift 中，翻译为：

```swift
func messageForm(_ messageForm: BAKMessageForm, didTapPostWithDraft draft: BAKDraft)
func messageForm(_ messageForm: BAKMessageForm, didTapAttachment attachment: BAKAttachment)
```

简直辣眼睛。为啥两个方法都叫 `messageFrom`？并且这个方法开头的名词也不合常理：一般建议名词是方法返回的对象类型（比如 `NSString` 的 `data(using:)`，就是返回的 `Data`）。但是这个例子中，却并不需要返回任何 “message form”。这里指的 “message form”其实应该是第一个参数的名字，真是个令人纠结的方法名。

其实这两种类型的代理方法，都可以通过将“sender”移到行末，把动词提到最前来解决命名的问题。对于第一个例子来说，是 sender 想告诉代理点击取消事件（`didTapCancel`），而不是 `messageFormDidTapCancel`，所以应该改为：

```swift
func didTapCancel(messageForm: BAKMessageForm)
```

这样看起来好多了。事件的名称被提在了最前作为方法名，能很直观的看出方法的作用。我觉得，最好再将介词作为参数别名，这样调用的时候就更优雅了：

```swift
func didTapCancel(on messageForm: BAKMessageForm)
```

目前我还没找到关于介词的使用规范。不过我会在不同情况下，选择使用“on”，“for”，“with”，“in”。用户是点击在表单“上”的，所以我觉得这里用“on”比较合适。

接下来再来看看，代理方法有数据返回的情况。将动词提到最前，选择合适的介词就能有效解决这个问题了。

之前是：

```swift
func messageForm(_ messageForm: BAKMessageForm, didTapPostWithDraft draft: BAKDraft)
```

而更 Swift 化的是：

```swift
func didTapPost(with draft: BAKDraft, on messageForm: BAKMessageForm)
```

和

```swift
func didTap(attachment: BAKAttachment, on messageForm: BAKMessageForm)
```

这种命名规则只是我归纳出来的，并没有经过他人印证，但我觉得这要比现在代理方法命名的规则要好得多。之后，我可能还会自己的 Swift 代理方法中使用这种规则。

下面列举了 `UITableView` 的 delegate 与 data source 方法，以及这些方法在未来可能的样子：

```swift
func numberOfSections(in tableView: UITableView) -> Int
```

`numberOfSections` 遵循了前文提到的规则，看起来很优雅。

但其余的方法看起来就不那么好了：

```swift
func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int
func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell
func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath)
```

更为漂亮的命名是：

```swift
func numberOfRows(inSection section: Int, in tableView: UITableView) -> Int
func cellForRow(at indexPath: IndexPath, in tableView: UITableView) -> UITableViewCell
func didSelectRow(at indexPath: IndexPath, in tableView: UITableView)
```
