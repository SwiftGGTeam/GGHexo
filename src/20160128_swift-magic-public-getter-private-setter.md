title: "Swift 魔法：公开 Getter，隐藏 Setter"
date: 2016-01-28
tags: [Natasha The Robot]
categories: [Swift 进阶]
permalink: swift-magic-public-getter-private-setter
keywords: swift getter,swift setter
custom_title: 
description: 在Swift中有属性需要在外部读并只能在内部进行的话，只需公开Getter同时隐藏Setter就可以了。

---
原文链接=https://www.natashatherobot.com/swift-magic-public-getter-private-setter/
作者=Gabriel Theodoropoulos
原文日期=2016-1-11
译者=saitjr
校对=小锅
定稿=千叶知风

<!--此处开始正文-->

在我之前发布的文章 [构造器注入(Constructor Injection)](https://www.natashatherobot.com/swift-dependency-injection-with-a-custom-initializer/) 中，有这样的案例：在 `struct` 中有一个属性，这属性需要在外部读，并只能在内部进行写。当时的实现方式是：

<!--more-->

``` swift
struct Counter {
    // `count` 在这里必须是一个 var 
    // 但我并不想将 `count` 设为公开的，
    // 所以加了 private 定为私有的
    private var count: Int
    
    // 现在就只能通过这种方式在外部访问 `count` 了
    func getCount() {
        return count
    }
}
```

这种方式并不优雅，但却是我唯一能想到的解决方案。幸运的是，现在我找到了一个更好的方式！

Twitter 上 [@mipstian](https://twitter.com/mipstian/status/685489964403003393) 指出可以通过设置私有的 Setter 方法来达到效果，就像这样：

``` swift
struct Counter {
    // 现在就只有setter是private的了！
    private(set) var count: Int
}
```

对当前案例来说，将 `Counter` 设置为模块内公开(也就是internal)。但如果你是要做 SDK，你可以像下面这样公开 Getter ，同时隐藏 Setter：

``` swift
public struct Counter {
    // 现在就只有setter是private的了！
    public private(set) var count: Int
}
```

我也不知道我怎么就错过了这个知识（可能是因为我一直都尽量使用 `let` 的原因），但我真的很庆幸最终我还是知道了这个超赞的 Swift 特性。

--

以上全文完，但是作为一个走心的翻译组，我们发现我们还翻译过其它类似的文章，以下链接可以供参考：

[Swift：带有私有设置方法的公有属性](http://swift.gg/2016/01/11/public-properties-with-private-setters/)