title: "Swift 惯用语法"
date: 2017-02-17
tags: [Swift]
categories: [Erica Sadun]
permalink: swift-idioms
keywords: Swift
custom_title: 
description: 

---
原文链接=http://ericasadun.com/2017/01/24/swift-idioms/
作者=Erica Sadun
原文日期=2017-01-24
译者=星夜暮晨
校对=Crystal Sun
定稿=CMB

<!--此处开始正文-->

久而久之，Swift 发展出一种别具一格的专用语法——即一组与其他语言相差甚远的基本惯用语法 (core idioms)。许多来自 Objective-C、Ruby、Java、Python 等等语言的开发者纷纷投向 Swift 的麾下。数日前，[Nicholas T Chambers](https://github.com/ntchambers) 让我帮他来磨练这门新习得的语言。他通过将 Ruby 代码移植为 Swift 的方式，来构建自己基本的编程技能。他所移植的[代码](http://find_common.rb/)是这样的：

<!--more-->

```ruby
def find_common(collection)
    sorted = {}
    most = [0,0]

    for item in collection do
        if not sorted.key? item then
            sorted[item] = 0
        end

        sorted[item] += 1

        if most[1] < sorted[item] then
            most[0] = item
            most[1] = sorted[item]
        end
    end

    return most
end
```

然后他所尝试改编而成的 [Swift 代码](https://gist.github.com/ntchambers/48a458726458f4d710d57fa962519898#file-find_common-swift)为：

```swift
func find_common(items: [Int]) -> [Int] {
    var sorted = [Int: Int]()
    var most = [0, 0]

    for item in items {
        if sorted[item] == nil {
            sorted[item] = 0
        }

        sorted[item]! += 1

        if most[1] < sorted[item]! {
            most[0] = item
            most[1] = sorted[item]!
        }
    }

    return most
}
```

除了一些强制解包的代码外，这两者之间几乎没有任何区别。我对 Ruby 并不是了如指掌，但是这两段代码感觉仍然还是 C 语言的风格，并且也一点都不函数化（是函数式编程领域的意思，而不是「无法工作」的意思）。

我知道 Ruby 支持类似 `reduce` 之类的操作，但是这里我们并没有看到。当我刚开始学习 Swift 的时候，我做的第一件事情就是将大篇大篇的 Ruby 函数式调用方法用 Swift 实现出来。当然时至今日，仍然有很多诸如 `select`、`reject`、`delete_if`、`keep_if` 之类的功能仍然等着我用 Playground 实现出来，感觉无穷无尽的样子。不过讲道理，这种做法非常适合学习 Swift。

下面就是经我建议之后重写的版本：

```swift
import Foundation

extension Array where Element: Hashable {
    /// Returns most popular member of the array
    ///
    /// - SeeAlso: https://en.wikipedia.org/wiki/Mode_(statistics)
    ///
    func mode() -> (item: Element?, count: Int) {
        let countedSet = NSCountedSet(array: self)
        let counts = countedSet.objectEnumerator()
            .map({ (item: $0 as? Element, count: countedSet.count(for: $0)) })
        return counts.reduce((item: nil, count: 0), {
            return ($0.count > $1.count) ? $0 : $1
        })
    }
    
}
```

就某些方面而言，这种重构显然是作弊了，因为我「借用」了 `NSCountedSet` 的帮助，不过我觉得用 Swift 来编程并不意味着我们必须要将 Foundation 拒之门外。在我看来，使用计数集 (counted set) 正是这段代码的任务所在：「*假设我们有一个类型随机的列表（尽管类型是相同的），列表当中的顺序是随机的。那么该如何找到这个列表当中出现次数最多的元素呢？*」。

下面是我关于重构的一些建议和想法：

* **充分利用各种库 (Leverage Libraries)**。在迁移到 Swift 的时候，您需要考虑 Foundation 以及 Swift Foundation 类型是否会让您的重构更加方便快捷。这里计数集便是一个很好的例子，因为它本身就可以自行完成全部的成员分组和计数。不过我希望能够拥有一个原生版本的计数集，这样就不用操心于令人疯狂的对象枚举 (`objectEnumerator`)，此外如果没有指定可哈希元素的时候，代码仍然可以通过编译的情况了。
* **拥抱泛型 (Embrace Generics)**。尝试挑战一下将示例中的列表换成随机类型。将列表硬编码 (hardcoding) 为 `Int`  并不是个好方法。因此，一旦您意识到要实现的功能需要用于多种类型的时候，请选择将泛型引入您的解决方案中。
* **必要时考虑使用协议 (Consider Protocols)**。计数集的原生版本不管怎么说也得是 `Hashable` 的，就如 Swift 原生的 `Set` 数据类型一样。这里我添加了一些限制条件，但是它编译和运行的结果和我们的预期并不一致。
* **活用函数式编程 (Live Functionally)**。所有类似「从列表中找寻某种类型的元素」的操作无不在明示着让我去使用函数式编程来解决。如果在对列表进行迭代的时候，需要用变量来存储中间状态的话，那么可以考虑使用 Swift 最基本的函数式调用操作：`map`/`reduce`/`filter`，从而消除冗余的显式状态 (explicit state)。
* **避免使用全局函数 (Avoid Global Functions)**。我觉得这段代码最好是用集合扩展的方式进行实现，而不是使用独立的函数。`mode` 函数基本上是对数组进行描述和操作的。这段代码实现将作为 `Array` 的一部分存在。我甚至觉得，我应该将其实现为一个属性，而不是一个函数，因为列表的 `mode` 功能应该是数组的本质所在 (intrinsic quality)。不过关于这一点，我还有些举棋不定。
* **别忘了编写测试以及文档 (Think Tests and Documents)**。在编写代码之前就考虑如何编写测试用例以及文档，这已经是 Swift 开发的核心所在。这里我添加了一些相关的文本标记。不过我还没有添加相关的测试。
* **使用良好的 Swift 语法规范 (Prefer Good Swiftsmanship)**。首先，在我对代码整体进行思考之前，我陷入了对语法细节的桎梏当中，比如说「使用条件绑定」以及「键入变量/尽可能使用字面量」等等。不过随着我花了大量的心思来思索之后，我对函数式编程的看法发生了改变，但是这并不意味着基本 Swift 语法规范就可以被忽略掉。

世间有很多事情既需要顾全大局，也需要深入细节 (A lot of this falls into the big picture little picture dichotomy)。在学习 Swift 的时候，您可能希望从细节开始学习：学习可空值的原理、学习如何正确的使用可空值、学习如何使用函数式编程等等，从而一直学习到如何创建测试、如何编写文档、如何利用协议和泛型。要学的东西实在是纷繁复杂，很难一步登天。

在*这些知识*的基础之上，又还有基本的 API 用法，这使得学习 Swift 变得更加困难。对于那些刚刚接触苹果开发的人而言，即便他们具备了现代编程语言的基础知识，但是要区分出 Swift 原生类型和 Cocoa 类型的区别并且掌握 Cocoa/Cocoa Touch API 都将是一个重大的挑战。

正因如此，用「更 Swift 化」的方式来编写代码，不仅意味着要使用约定的惯用语法，同时还意味着要记住和使用语言所处平台的相关特性。我希望计数集（以及其他 Cocoa Foundation 当中没被 Swift 原生化的类型）能够成为 Swift 的原生部分。