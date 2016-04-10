title: "Swift:什么时候不适合使用函数式方法"
date: 2015-8-28
tags: [Swift 入门]
categories: [Natasha The Robot]
permalink: swift_when_the_functional_approach_is_not_right

---
原文链接=http://natashatherobot.com/swift-when-the-functional-approach-is-not-right/
作者=Natasha
原文日期=2015-07-24
译者=天才175
校对=numbbbbb
定稿=numbbbbb

<!--此处开始正文-->

昨天，我在代码库中找到一段我所认为的极具 Swift 风格的代码。

```swift
var minionImages = [UIImage]()
for i in 1...7 {
    if let minionImage = UIImage(named: "minionIcon-\(i)") {
        minionImages.append(minionImage)
    }
}
```

这真是使用函数式编程进行重构的绝佳机会，哦吼吼！我可以做函数式编程了！！！是的，我非常激动。

<!--more-->

那么，明显的解决方案是在这儿使用 map：

```swift
let minionImagesMapped = (1...7)
    .map { UIImage(named: "minionIcon-\($0)") }
```

我对自己感到很满意，这段代码只有一行。但这样做无法满足之前的一个必要条件 - 我需要`[UIImage]`数组，但是这段代码返回的是可选类型`[UIImage?]`数组。

所以我 google 了下，为了得到非可选类型的`UIImages`数组，可以使用如下方法：

```swift
let minionImagesFiltered = (1...7)
    .map { UIImage(named: "minionIcon-\($0)") }
    .filter { $0 != nil}
    .map { $0! }
```

这样的确有用，但是我并不开森。这段代码又长又拙笨，而且我讨厌强制解包可选类型，虽然这里不会出错。不过这都是小事，主要的原因是这样看起来并不像原生for循环那样简单有效。如下图所示：

![](/img/articles/swift_when_the_functional_approach_is_not_right/MyPlayground_playground1.png)

可能这样做是错的，但是我最后还是选择了`for`循环。我的结论是：在 Swift 中偶尔使用`for`循环是可以的。当然我可能遗漏了一些东西，如果有，请在评论中告诉我！

## 升级

由于有些童鞋在下面的评论中以及[Twitter](https://twitter.com/NatashaTheRobot/status/624609007043391488)上指出，可以在这里使用 Swift 2.0 的`flatMap`，我进行了修改：

```swift
let minionImagesFlattened = (1...7).flatMap { UIImage(named: "minionIcon-\($0)") }
```

在这里，我不得不诚实的说，每次看到`flatMap`时，我都无法完全理解它做了什么或是怎么做的。它并不像`map`以及`filter`那样自然。我不懂它在这儿是怎么做的，所以必须要去搜索一下。

由此，我再次得出结论：使用`flatmap`不能提高代码可读性。如果那些对 Swift 和函数式编程了解不多的人看到这段代码，他们能理解发生了神马吗？相反，我可以确定，每个人只需看一眼就能够理解for循环。
