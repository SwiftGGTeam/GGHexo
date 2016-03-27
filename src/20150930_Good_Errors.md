title: "好的错误处理原则"
date: 2015-09-30 09:00:00
tags: [Swift 入门]
categories: [Erica Sadun]
permalink: good-errors-swiftlang
---
原文链接=http://ericasadun.com/2015/09/02/good-errors-swiftlang/
作者=Erica Sadun
原文日期=2015-09-02
译者=小袋子
校对=shanks
定稿=shanks
发布时间=2015-09-30T09:00:00


为了处理错误，我们可以抛出一些遵循 `ErrorType` 协议的实例。最简单的例子，创建一个 `struct` 并且抛出错误，就像如下示例：

```
public struct SomethingWentWrong : ErrorType {}
...something happens...
throw SomethingWentWrong()
```
<!--more-->

在所有可能的描述里，你的错误信息阅读起来不应该像随机的幸运纸片那样杂乱无章，而应该是像建设性指针那样，能够解释你的失败。应避免出现下列的写法：

```
public enum SomethingWentWrongError: ErrorType {
    case YouWillFindNewLove
    case AClosedMouthGathersNoFeet
    case CynicsAreFrustratedOptimists
    case IfEverythingIsComingYourWayYouAreInTheWrongLane
}
```

优秀的错误处理机制应该更易于我们在特定语境中理解错误：

 - 逻辑清晰。一个优秀的错误信息应该表明问题是什么，问题的起因是什么，问题的源头在哪里，以及如何解决这个问题。我们可以从 `Foundation` 里面的错误处理获取灵感，并在你的错误反馈中提供错误原因和恢复方法。
 
 - 保持精准。 当你的错误返回一个错误点时，错误信息越具体，使用你代码的程序员就越有可能使用这个具体的信息修复他们的代码，或者在运行代码时找到变通的办法。
 
 -  整合细节。`Swift` 错误机制允许我们创建结构体，关联值，并且提供了错误产生位置和产生原因的重要上下文信息。因此我们应该创建更多有关错误的详尽信息。
 
 - 语义清楚。不要单纯为了让错误信息简短就去限制错误信息的字数。正确的写法: `Unable to access uninitialized data store`；错误的写法: `Uninitialized`。同时，应该正确界定正在处理错误的问题说明，避免出现不必要的冗余描述。
   
 - 添加支持。当你加入 API 和 文档的引用后, 可以进一步帮助你解释上下文和支持的恢复方法。使用链接和片段是很好的方式，但是全文档说明就没必要了。允许使用像快速帮助这样的特性去适当地理解这段代码的作用，而不是试图去篡改他们。
 
 - 避免使用术语。特别是当你的错误，可能在超出你正在运行的上下文环境下产生时。因此，推荐选择简单且更加通俗的语言，而不是专业的术语名称。
 
 - 措辞应优雅礼貌。在错误信息中不应该羞辱你的同伴，你的管理者，或者那些和你一起努力奋斗开发 `API` 的人。此外，应减少错误信息中幽默的写法，幽默的效果并不大，一个自嘲意味的错误信息有可能成为将来某个时刻的隐患。
 
 > 译者注：以苹果开发的角度来说，异常处理可以细分成对于「错误（`error`）」和「异常（`exception`）」两类情况的处理，前者是可以预见到发生可能性的、可以恢复的非致命错误，比如找不到指定位置的文件或者网络忽然断开之类；后者则是无法预见通常也不可恢复的致命错误，比如磁盘坏了、内存没了之类。本文中的异常处理应是错误（`error`）处理。





