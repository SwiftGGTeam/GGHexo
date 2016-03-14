title: "函数和方法命名规范"
date: 2015-11-12 09:00:00
tags: [Swift 入门]
categories: [Erica Sadun]
permalink: naming-methods-and-functions

---
原文链接=http://ericasadun.com/2015/08/31/naming-methods-and-functions/
作者=Erica Sadun
原文日期=2015-08-31
译者=天才175
校对=numbbbbb
定稿=numbbbbb

请各位随意批判。同时请看[这里](https://realm.io/news/swift-summit-swifty-methods-clarity-brevity/)和[这里](http://radex.io/swift/methods/)。

**简单明了**。根据上下文给动词和介词加上名词。请使用`removeObject(object, atIndex: index)`，而不是`remove(object, at: index)`。不要为了过度的简洁而影响清晰准确性。

<!--more-->

**避免缩写**。使用`printError(myError)`而不是`printErr(myErr)`以及`setBackgroundImage(myImage)`而不是`setBGImage(myImg)`。虽然苹果提供了一系列“可接受”的缩写，但是请不要在 Swift 中使用像 max 和 min 这样的缩写。

**避免歧义**。考虑一下函数或者方法的命名是否存在多种解释。举个栗子，在`displayName`中，display 是名词还是动词呢？如果命名不清晰的话，请重新命名来消除混淆。

**保持一致性**。在你的应用和库中使用相同的术语来描述概念。避免在一个方法里使用`fetchBezierElements()`，却在另外一个里使用`listPathComponents()`。

**不要引用类型关键字**。避免命名中出现 struct、enum、class、instance 以及 object。请使用`buildDeckofCards()`而不是`buildDeckofCardsStruct()`。

**方法命名使用小写**。虽然大多数开发者使用小写命名全局函数，但你可以大写，这并不是什么罪过。虽然这种函数命名过时了，但大写的函数名却能立刻将函数与方法区别开来。有一段时间我也改变过想法，但是最终还是决定奋起抗争，使用小写。这种做法曾经和命名空间一样普及，但是突然间就销声匿迹了。就像一百万个喊着大写的人突然沉默。

**省略"get"**。获取状态信息的函数应该描述他们要返回的东西。请使用`extendedExecutionIsEnabled()`或`isExtendedExecutionEnabled()`而不是`getExtendedExecutionIsEnabled()`。通过参数返回数据的函数例外。

**使用标签描述参数**。建议结合函数名和标签来描述函数本身，这样创建出来的会是包括介词（with、of、between 等等）的描述符。你会"construct color with red, green, and blue"（译者注：使用红绿蓝构建颜色），测试"length of string"（译者注：字符串的长度），或者"test equality between x and y"（译者注：判断 x 和 y 是否相等）。

好的函数名和标签可以告诉人们如何使用函数。结果会是自文档化，不用依靠记忆或查找来确定需要传入的参数。请使用`withTag:`而不是`tag:`。

**使用介词，避免"and"**。`And` 是 Apple 特别声称要避免的一个词。避免使用"view and position"，使用"view, position"。 

如果你必须使用`and`，请确保一组参数有语义联系，如使用"red, green and blue"构建颜色。哪怕之后调整了关键字，也显然不可能中断这些项的联系。在这种情况下，即使是代码洁癖患者也不会认为你的代码有问题。

Apple 支持使用 and 的一个例子是在一个方法中描述两种截然不同的动作，比如`openFile(withApplication:, andDeactivate:)`。

**在基于类型的名字后面加上`value` **。请使用`toIntValue`而不是`toInt`，以及`withCGRectValue`而不是`withCGRect`。

**使用美国标准短语**。由于这些词是由 Apple 提供的，请使用 initialize 而不是 initialise 以及 color 而不是 colour。

**有疑惑，找 Apple**。使用相似的概念搜索 Apple API 接口并模仿其方法签名。尽量参考 Objective-C  命名，因为 Swift 中的 Apple API 并没有全部通过人工审查。自动转换过来的 API 可能并不是一个好例子。