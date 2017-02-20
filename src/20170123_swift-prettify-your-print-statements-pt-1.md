title: "Swift：漂亮的 print() Pt.1"
date: 2017-01-23
tags: [Swift 入门]
categories: [medium.com]
permalink: swift-prettify-your-print-statements-pt-1
keywords: 
custom_title: 
description: 

---
原文链接=https://medium.com/swift-programming/swift-prettify-your-print-statements-pt-1-64832bb7fafa#.4g1f5sp1d  
作者=Andyy Hope  
原文日期=2016-04-06  
译者=SketchK  
校对=Crystal Sun  
定稿=CMB

<!--此处开始正文-->

时尚日志，由你做主

自从 Swift 的 beta 版本诞生后，社区里那些富有探索精神的开发者就迫不及待地在 Swift 的学海中遨游，他们不遗余力地去探索 Swift 的潜力，同时交流分享他们从中得到的经验。

此前，在 Twitter 上搜索 Swift，大部分都充斥着关于 Taylor Swift 的搜索结果，以至于我无法从中列举出有用的信息，但搞笑的是，没人知道为什么时至今日，Twitter 上检索到的信息仍是 Taylor Swift（呵呵……）。另一件人们普遍提及到的 Swift 特性便是：Swift 代码现在可以对 Emoji 表情进行处理。

<!--more-->

```swift
func combinedWeatherConditions(lhs: Int, _ rhs: Int) -> Int {
    return lhs + rhs
}
let 🌨 = -10, 🌤 = 10, 💧 = 0
if combinedWeatherConditions(🌨, 🌤) == 💧 {
    print(“😔 — No 🏂 Today.”)
}
```

> “我完全是因为 emoji 这个功能而开始使用 Swift”
> 
> ——没有人，从来就没人这么做

这是一个很新颖的功能，或者说是增强点，但是你不大会将这些 emoji 添加到你的代码甚至打印语句中。既然说到了打印语句，就不得不说一下，相比较 `NSLog` 而言，新的 `print` 调试语句在功能上做了很人性化的简化。

## NSLog
作为初级调试的主力，NSLog 简单易用，如果想查明某个值或者在 runtime 中通知开发者某些事件，NSLog 绝对是第一选择，可以打印出你所关心的任意信息或任意对象。但在我看来，默认的 NSLog 信息里面包含了太多的无用信息：

```
2016–04–02 09:15:25.660 Blog_Print[13053:3567169] Hello, cruel world. Why don’t you love me? Whyyy!!!
```

不要误会我，我认为原本负责 NSLog 的工程师的本意是将其打造成一个优秀的日志输出工具，其格式可细分为： 

```
[Date stamp] [Time stamp] [Project name] [Process ID: Thread ID] [Message]
```

但是，对于大多数类型的输出日志来说，这些信息实在太多了。日期，时间戳，线程和进程的标识符占距了大量空间，尤其在你恰巧把控制台放在 Xcode 底部中间且靠右的地方时，由于控制台的空间非常有限，就显得这些信息更长了。 

## print
精简 NSLog 输出的理由无须再说了，而我们想要的就是让它剔除冗余的内容，只展现出最原始的信息。

```
Hello, beautiful world! I love you.
```

但或许，或许有那么一点，我们把它弄的太简单了... 我知道你在想什么，但请暂且忍耐一下，让我把话说完。

> “这个家伙刚才抱怨 NSLog 打印的太多了，现在又嫌它打印的太少了？呵呵呵... 这样的家伙实在是太难伺候了。”
> —— 你

就像穿衣打扮一样，不同的服装适合不同的场合或目的。就好比你不会在雪地里穿短裤和背心玩耍，对不对？

打印本身并不应该有任何不同，有时你需要打印日期，有时需要打印 API 的调用情况，有时你只希望自己的日志内容能突出显示，相信我，你一定需要这个功能。这也是我们要讨论的关键。

如果在项目中使用了一些第三方库，就会注意到它们在控制台中增加了大量的无用垃圾信息，太多垃圾信息了，Wall-E 都郁闷了（译者注：《机器人总动员》中的机器人 walle，负责清理分装地球上的垃圾废品）。嗯，我就在说你呢，Urban Airship。（译者注： Urban Airship 是一个第三方库）

## emoji 是永远都不嫌多

刚才我说了 emoji 是一个非常新颖的功能，不仅如此，它还一个非常实用的功能。在打印语句中加入 Emojis 极大的改善了调试过程，在分析控制台的输出内容时减少相应的认知负荷。

> **温馨提示:** 
> 在 maxOS 系统的任意文本框中按下 **Ctrl + Cmd + Space** 就会弹出 emoji .

![](https://cdn-images-1.medium.com/max/1600/1*32Y_9OrQhKOMU6FjnCpMLQ.jpeg)

### Strings

```swift
let string = "Emojis are life"
print("🔹 " + string)
// 🔹 Emojis are life
```

### NSDate

```swift
let date = NSDate()
print("🕒 " + String(date))
// 🕒 2016-04-02 00:14:18 +0000
```

### NSURL

```swift
let url = NSURL(string: "http://www.andyyhope.com")
print("🌏 " + String(url))
// 🌏 http://www.andyyhope.com
```

### NSError

```swift
NSError
let userInfo = [NSLocalizedDescriptionKey: "File not found"]
let error = NSError(domain: "Domain", code: 404, userInfo: userInfo)
print(“❗️ “ + “\(error.code): “ + error.localizedDescription)
// ❗️ 404: File not found
```

### AnyObject

```swift
AnyObject
let anyObject = UIColor.redColor()
print("◽️ " + String(anyObject))
// ◽️ UIDeviceRGBColorSpace 1 0 0 1
```

### 跟同事开个玩笑

```swift
let joke = "What is this... A center for ANTS?!"
print("🏫🐜 " + joke)
// 🏫🐜 What is this... A center for ANTS?!
```

![](https://cdn-images-1.medium.com/max/1600/1*jg0ZyJOF0qzttmjl24hLgw.jpeg)

在 iOS 9.1 中已经有 184 个 emoji 表情可供使用，emoji 数量样子还会继续增加。在众多的 emoji 中，总有一款适合你的日志输出。 

## 实现它
不要误会我，实现上面的东西实在是有点......如果我还继续给你说这点东西的话，估计我马上就能收到 Hoover 公司的勒令停止通知函（cease and desist letters）了。把一个不是 string 类型的东西包裹在 String 中，还要匹配合适的 emoji ，这几乎不可能实现，如果你要找的不在"不常用"的部分里。

我感觉系统貌似能感知你要寻找哪个 emoji 表情，然后把它藏在第五维度的空间里好让你永远找不到，真让人抓狂。

> 似乎便便的 emoji 表情没有了？还是它一直就没有来着？ —— 你
> 
> 等等，它在这！我发誓我刚才找过这里啊！...什么人生啊这都是？ —— 你 （十分钟之后）

不管怎样，这篇文章示范了使用 emoji 可以带来的效率上的提升，通过这种方式可以区分不同类型的信息，在阅读的时候减少不必要的认知负担。

如果你愿意继续听下去的话，我会在第二和第三篇文章里讨论如何合理的实现现在说的这些东西，同时我也会讲一些如何让 emoji 输出日志更整洁、有用的小技巧。