title: "Swift：Selector 语法糖"
date: 2016-06-02
tags: [Swift 进阶]
categories: [Andyy Hope]
permalink: swift-selector-syntax-sugar
keywords: swift selector
custom_title: 
description: 在 Swift 这门很新的语言中有很多不错的编码风格，本文就来说下 Selector 语法糖吧。

---
原文链接=https://medium.com/swift-programming/swift-selector-syntax-sugar-81c8a8b10df3#.zc2lzkj76
作者=Andyy Hope
原文日期=2016-03-23
译者=saitjr
校对=numbbbbb
定稿=shanks

<!--此处开始正文-->

![](http://swiftgg-main.b0.upaiyun.com/img/swift-selector-syntax-sugar-1.jpeg)

Objective-C 已经出现好些年了。在这期间，开发者们遵循着各种代码风格，希望能提高可读性，为今后的版本迭代做准备。但是 Swift 不同。Swift 还是门很新的语言，没有专门的或者最广泛的编码风格可以遵循。所以很多时候我们需要自己去摸索。

幸运的是，在我最近一年的工作中，Swift 占到了 98.2%。在这期间，我学到了很多很棒的编码风格，今天就来分享一下。

<!--more-->

## Selectors

在 Swift 2.2 之前，selector 都需要传入字符串，并且没有自动补全。全凭手写确实容易出错。

```swift
let button = UIButton(type: .System)
button.addTarget(self, action: Selector(“buttonTapped:”), forControlEvents: .TouchUpInside)
...
func buttonTapped(sender: UIButton) { }
```

好的事件函数命名方法：对象名作为前缀，动作作为后缀。比如按钮（button）点击（tapped）事件命名为 `buttonTapped:`。此外，确保每次都给 sender 传入正确的类型参数。即使不需要这个参数，你也最好把它传进去，万一要用到呢。

下面是我推荐的事件函数命名：

```swift
func segmentedControlValueChanged(sender: UISegmentedControl) { }
func barButtonItemTapped(sender: UIBarButtonItem) { }
func keyboardWillShowNotification(notification: NSNotification) { }
```

## Swift 2.2 中的优化

在 Swift 2.2 中，selector 的写法更加安全了，但是还是很丑。此外，代码片段会散落在项目的各个地方，凌乱不堪。如果你用的是 MVC（Massive View Controller 😄）怎么办？如果同一个 selector 会被多次使用怎么办？

```swift
button.addTarget(self, action: #selector(ViewController.buttonTapped(_:)), forControlEvents: .TouchUpInside)
```

在浏览代码的时候，上面这句代码简直不忍直视，太长，可读性也很差。再脑补下你还要在很多地方使用它（复制粘贴…）。让我们来整合一下这些 selector，这样需要时可以直接引用，并且可以在同一个地方修改。

```swift
private struct Action {
    static let buttonTapped = 
        #selector(ViewController.buttonTapped(_:))
}
...
button.addTarget(self, action: Action.buttonTapped,       
    forControlEvents: .TouchUpInside)
```

简直棒棒哒。现在我们可以在同一个地方定义这些 selector。任何一个想要使用 selector 的对象都可以直接从 `Action` 结构体取出静态常量。我们不得不将这个结构体命名为 `Action`，因为 Selector 这个更好的名字已经被 `Selector` 占用了。

另一个明智的做法是保持静态常量和方法名的一致性，这样便于记忆，风格统一。

下面这个结构体声明为 `private` 是为了防止 Xcode 报声明冲突错误，这个结构体只能用于当前 `.swift` 文件。

我已经这样写了几个月了，一直都没遇到问题。但是今天早上我突然意识到，这种模式还能再优化一下，还能更优雅。既然能用 `Selector` extension，为什么还要用 `Action` 结构体呢？

```swift
private extension Selector {
    static let buttonTapped = 
        #selector(ViewController.buttonTapped(_:))
}
...
button.addTarget(self, action: .buttonTapped, 
    forControlEvents: .TouchUpInside)
```

简直完美！我们给 `Selector` 加了一个 extension，它包含了我们想要调用的 selector 的静态常量。

这样还可以利用 Swift 的类型推断。对象的 `action:` 参数需要 `Selector` 类型，我们使用的就是 `Selector` 的属性，因此可以省略 `Selector.` 前缀（之前 `Action` 必须写成 `Action.buttonTapped:`）。

就像你要给 view 设置颜色时候，省略掉 `UIColor.` 一样：

```swift
view.backgroundColor = .blackColor()
```

总之，希望你能喜欢这个 selector 语法糖。如果你想要在代码中使用，请在 Twitter 上@我一下，很希望能看到大家都在用这种方式。

[示例代码](https://github.com/andyyhope/Blog_SelectorSyntaxSugar)已经放在 GitHub 上了。

![](http://static.zybuluo.com/numbbbbb/7xrpuqjx55coutjtt89e41zd/swift-selector-syntax-sugar.png)

简直要上天了，没想到我的文章被 Chris Lattner [转发了](https://twitter.com/clattner_llvm/status/712678968697032705)👯👯👯。

非常感谢大家的喜爱、点赞、回复、转推。