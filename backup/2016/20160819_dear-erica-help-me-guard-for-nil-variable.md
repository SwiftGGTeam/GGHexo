title: "[swift]亲爱的 Erica,请帮我 guard 变量的值为空的情况"
date: 2016-08-19
tags: [swift]
categories: [Erica Sadun]
permalink: dear-erica-help-me-guard-for-nil-variable
keywords: swift guard语句
custom_title: 
description: 怎么在 Swift 中使用 guard 语句检测一个特定的变量是否为空呢，本文就来探讨这个问题。

---
原文链接=http://ericasadun.com/2016/07/07/dear-erica-help-me-guard-for-nil-variable/
作者=Erica Sadun
原文日期=2016-07-07
译者=粉红星云
校对=aaaron7
定稿=千叶知风

<!--此处开始正文-->

你好,
我想知道针对下面这个在 Swift 中出现的特定情况是否有更优雅的解决方法 -- 假设你想要在继续执行后续的代码前，检测一个特定的变量是否为空；通常是会做相反的事情(检测变量是否为有值)。我一般是这么写的：

```
guard thing == nil else {
   if let thing = thing {
      doSomething(withThing: thing)
    }
   return
}
```

有没有一个更好的方式来实现呢？我是可以使用 if 语句,但是我喜欢 guard 语句确保验证不通过不执行下面代码。逻辑上如果强制解包也可以,但是。。。(耸肩)

<!--more-->

-- Rob

你好，Rob，的确是有简单的多的方法。你用了 if 语句的使用方式套在 guard 中，这样也违背了这个语法的本意 -- 使用 guard 来解包 “thing” 这个变量,失败了就不再执行下面的内容。如果你的 guard 语句的 “else” 下的大括号内容，显著地比一两行要多得多，那你应该是用错了这个语法了。

下面是正确的使用方式：

```
guard let thing = thing else { return } // 在变量不能被解包的时候退出
doSomething(with: thing) // thing 这个变量现在已经解包了
```

这个代码遵循了Swift一个常见的模式：使用 guard 映射一个可选变量的值。用guard 映射变量让你可以在当前代码块使用相同的变量名( “thing” )。在通过了 guard 语句的时候，你的变量已经解包了，可以直接使用，不用再检验其值不为nil。

避免强制解包是对的。给自己一个挑战，来确保你代码中的每一个 “!” 都是可行的。
