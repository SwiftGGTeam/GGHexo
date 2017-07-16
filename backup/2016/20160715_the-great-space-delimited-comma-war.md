title: "伟大的空格分割符之争"
date: 2016-07-15 10:00:00
tags: [Swift]
categories: [Erica Sadun]
permalink: the-great-space-delimited-comma-war
keywords: 空格分隔符,orthography正字法
custom_title: 
description: 我们在写代码的时候是不是经常忽视空格分隔符呢，本文就来举个例子说明下美丽的 orthography 正字法留白。

---
原文链接=http://ericasadun.com/2016/05/02/the-great-space-delimited-comma-war/
作者=Erica Sadun
原文日期=2016-05-02
译者=Crystal Sun
校对=numbbbbb
定稿=Cee

<!--此处开始正文-->

今天下午发生了一场激烈的争论：

```swift
func foo<T: protocol<A,B>>(x: T)
```

对比

```swift
func foo<T: protocol<A, B>>(x: T)
```

很明显，后者赢了。为什么？因为符合正字法（orthography）的规则（定稿注：来源于希腊语中的正确（Ortho）和书写方式（Graphia），表示通用的社会性的文字表示规范。这里指约定俗成的代码规范。留白是一种美）。

<!--more-->

Strunk [写过](http://www.bartleby.com/141/strunk5.html)：「忽略无用的单词」，他可没写「忽略无用的字符」。空格分隔符（space-delimited comma）在两个相关元素之间提供了语义分隔，遵循了数学中的语义约定。

空格分隔符适应自然语言的习惯，眼睛在阅读内容时会把每个语法元素都看做独立的实体。对阅读代码的人来言，它相当于是一个停顿符，让人分辨出这是两个元素（在这里是两个协议）。

如果没有这个停顿，两个协议就不易区分，尤其是协议外面还有尖括号和参数类型。使用空格能写出更易读的代码，因此它赢了。

空格分隔符对所有人都有好处，哪怕他们是加拿大人。（校对注：这里在调侃加拿大人。加拿大人通常不用牛津逗号。）