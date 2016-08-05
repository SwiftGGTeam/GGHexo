午后问答：Swift 中的 guard case = 语法"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2016/03/15/afternoon-whoa-swifts-guard-case/)，原文日期：2016-03-15
> 译者：[walkingway](http://chengway.in/)；校对：[Cee](https://github.com/Cee)；定稿：[shanks](http://codebuild.me/)
  










布莱恩·卢比的提问：“在 Swift 2 中你如何看待 `guard case` 语法和 `~=` 表达式？” 让我来说的话，guard cases 真的适合带相关值的模式匹配吗？就像下面这样：



    
    enum Test {case a(Int), b(String)}
    
    let x = Test.a(2)
    let y = Test.b("Hello")
    
    guard case Test.a(let value) = x else {
        fatalError("shouldn't fire")
    }
    
    guard case Test.b(let value) = x else {
        fatalError("will fire")
    }

答案是否定的，布莱恩所谈论的是 `guard case indices = index else { return nil }`，它的用法如下：
 
    
    let foo = "abcdef".characters
    let bar = "abcdefghij".characters
    guard case foo.indices = foo.startIndex else {fatalError("won't fail")}
    guard case foo.indices = bar.endIndex.predecessor() else {fatalError("fails")}

在模式匹配中使用 `guard case` 来比较左右两边的值看上去很怪异，而使用 `~=` 就自然得多：

    
    guard indices ~= index else { return nil }

我针对 `guard case` 认真地思考了一会：

1. 恩，这很酷；
2. 但我一点也不喜欢它。

`guard case` 的可读性很糟糕。而且我不认为大部分的 Swift 开发者都知道或使用 `guard case` 进行匹配。在原则“一段代码被阅读的次数要远远超过编写的次数”（更不要提“最小惊讶原则”）的指导下，我会坚持使用操作符进行模式匹配，而不是 `guard case`。

不管你同意与否，都欢迎通过留言、推特、电子邮件的形式与我联系。并且谢谢布莱恩，我喜欢研究这样的问题。

Zachary Waldowski 在![推特](http://twitter.com/zwaldowski/status/709861893490515968)上说：“if/guard/for/while case 是内建的模式，而 ~= 本质上是一种实现细节 :/”。也许是这样，但我不认为这样就能写出漂亮的代码，或让代码变得更容易阅读。他最后回复到：“老实说，我无法明确给你一个答案；我觉得 `if case` 可读性更好，但同事却认为我疯了。”
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。