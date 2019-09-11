title: "SwiftSyntax"
date: 2019-01-25
tags:  [Swift, NSHipster]
categories: [Swift, NSHipster]
permalink: nshipster-swiftsyntax

---

原文链接=https://nshipster.com/swiftsyntax/
作者=Mattt
原文日期=2018-10-22
译者=jojotov
校对=numbbbbb,Yousanflics,pmst
定稿=Forelax

<!--此处开始正文-->

[SwiftSyntax](https://github.com/apple/swift-syntax) 是一个可以分析、生成以及转换 Swift 源代码的 Swift 库。它是基于 [libSyntax](https://github.com/apple/swift/tree/master/lib/Syntax) 库开发的，并于 [2017 年 8 月](https://github.com/apple/swift-syntax/commit/909d336aefacdcbdd45ec6130471644c1ae929f5) 从 Swift 语言的主仓库中分离出来，单独建立了一个仓库。

<!--more-->

总的来说，这些库都是为了给结构化编辑（structured editing）提供安全、正确且直观的工具。关于结构化编辑，在 [thusly](https://github.com/apple/swift/blob/master/lib/Syntax/README.md#swift-syntax-and-structured-editing-library) 中有具体的描述:

> 什么是结构化编辑？结构化编辑是一种编辑的策略，它对源代码的*结构*更加敏感，而源代码的表示（例如字符或者字节）则没那么重要。这可以细化为以下几个部分：替换标识符，将对全局方法的调用转为对方法的调用，或者根据已定的规则识别并格式化整个源文件。

在写这篇文章时，SwiftSyntax 仍处于在开发中并进行 API 调整的阶段。不过目前你已经可以使用它对 Swift 代码进行一些编程工作。

目前，[Swift Migrator](https://github.com/apple/swift/tree/master/lib/Migrator) 已经在使用 SwiftSyntax 了，并且在对内和对外层面上，对 SwiftSyntax 的接入也在不断地努力着。

## SwiftSyntax 如何工作？

为了明白 SwiftSyntax 如何工作，我们首先要回头看看 Swift 编译器的架构：

![](https://swift.gg/img/articles/nshipster-swiftsyntax/swift-compilation-diagram-8af7d0078f72cdaa8f50430e608f15a9d4214f5772439d2fd6904bb5a8a53c60.png1548390462.3512783)

Swift 编译器的主要职责是把 Swift 代码转换为可执行的机器代码。整个过程可以划分为几个离散的步骤，一开始，[语法分析器](https://github.com/apple/swift/tree/master/lib/Parse) 会生成一个抽象语法树（AST）。之后，语义分析器会进行工作并生成一个通过类型检查的 AST。至此步骤，代码会降级到 [Swift 中间层语言](https://github.com/apple/swift/blob/master/docs/SIL.rst)；随后 SIL 会继续转换并优化自身，降级为 [LLVM IR](http://llvm.org/docs/LangRef.html)，并最终编译为机器代码。

对于我们的讨论来说，最重要的关键点是 SwiftSyntax 的操作目标是编译过程第一步所生成的 AST。但也由于这样，SwiftSyntax 无法告知你任何关于代码的语义或类型信息。

与 SwiftSyntax 相反，一些如 [SourceKit](https://github.com/apple/swift/tree/master/tools/SourceKit) 之类的工具，操作的目标为更容易理解的 Swift 代码。这可以帮助此类工具实现一些编辑器相关的特性，例如代码补全或者文件之间的跳转。虽然 SwiftSyntax 不能像 SourceKit 一样实现跳转或者补全的功能，但在语法层面上也有很多应用场景，例如代码格式化和语法高亮。

### 揭秘 AST

抽象语法树在抽象层面上比较难以理解。因此我们先生成一个示例来一睹其貌。

留意一下如下的一行 Swift 代码，它声明了一个名为 `one()` 的函数，函数返回值为 `1`：

```swift
func one() -> Int { return 1 }
```

在命令行中对此文件运行 `swiftc` 命令并传入 `-frontend -emit-syntax` 参数：

```shell
$ xcrun swiftc -frontend -emit-syntax ./One.swift
```

运行的结果为一串 JSON 格式的 AST。当你用 JSON 格式来展示时，AST 的结构会表现的更加清晰：

```json
{
    "kind": "SourceFile",
    "layout": [{
        "kind": "CodeBlockItemList",
        "layout": [{
            "kind": "CodeBlockItem",
            "layout": [{
                "kind": "FunctionDecl",
                "layout": [null, null, {
                    "tokenKind": {
                        "kind": "kw_func"
                    },
                    "leadingTrivia": [],
                    "trailingTrivia": [{
                        "kind": "Space",
                        "value": 1
                    }],
                    "presence": "Present"
                }, {
                    "tokenKind": {
                        "kind": "identifier",
                        "text": "one"
                    },
                    "leadingTrivia": [],
                    "trailingTrivia": [],
                    "presence": "Present"
                }, ...
```

Python 中的 `json.tool` 模块提供了便捷地格式化 JSON 的能力。且几乎所有的 macOS 系统都已经集成了此模块，因此每个人都可以使用它。举个例子，你可以使用如下的命令对编译的输出结果使用 `json.tool` 格式化：

```shell
$ xcrun swiftc -frontend -emit-syntax ./One.swift | python -m json.tool
```

在最外层，可以看到 `SourceFile`，它由 `CodeBlockItemList` 以及 `CodeBlockItemList` 内部的 `CodeBlockItem` 这几个部分组成。对于这个示例来说，仅有一个 `CodeBlockItem` 对应函数的定义（`FunctionDecl`），其自身包含了几个子组件如函数签名、参数闭包和返回闭包。

术语 trivia 用于描述任何没有实际语法意义的东西，例如空格。每个标记符（Token）可以有一个或多个行前和行尾的 trivia。例如，在返回的闭包（`-> Int`）中的 `Int` 后的空格可以用如下的行尾 trivia 表示：


```JSON
{
  "kind": "Space",
  "value": 1
}
```

### 处理文件系统限制

SwiftSyntax 通过代理系统的 `swiftc` 调用来生成抽象语法树。但是，这也限制了代码必须放在某个文件才能进行处理，而我们却经常需要对以字符串表示的代码进行处理。

为了解决这个限制，其中一种办法是把代码写入一个临时文件并传入到编译器中。

[我们曾经尝试过写入临时文件](https://nshipster.com/nstemporarydirectory/)，但目前，有更好的 API 可以帮助我们完成这项工作，它由  [Swift Package Manager](https://github.com/apple/swift-package-manager) 本身提供。在你的 `Package.swift` 文件中，添加如下的包依赖关系，并把 `Utility` 依赖添加到正确的 target 中：

```swift
.package(url: "https://github.com/apple/swift-package-manager.git", from: "0.3.0"),
```

现在，你可以像下面这样引入 `Basic` 模块并使用 `TemporaryFile` API：

```swift
import Basic
import Foundation

let code: String

let tempfile = try TemporaryFile(deleteOnClose: true)
defer { tempfile.fileHandle.closeFile() }
tempfile.fileHandle.write(code.data(using: .utf8)!)

let url = URL(fileURLWithPath: tempfile.path.asString)
let sourceFile = try SyntaxTreeParser.parse(url)
```

## 我们可以用 SwiftSyntax 做什么

现在我们对 SwiftSyntax 如何工作已经有了足够的理解，是时候讨论一下几个使用它的方式了！

### 编写 Swift 代码：地狱模式

我们第一个想到，但却是最没有实际意义的 SwiftSyntax 用例就是让编写 Swift 代码的难度提升几个数量级。

利用 SwiftSyntax 中的 `SyntaxFactory` APIs，我们可以生成完整的 Swift 代码。不幸的是，编写这样的代码并不像闲庭散步般轻松。

留意一下如下的示例代码：

```swift
import SwiftSyntax

let structKeyword = SyntaxFactory.makeStructKeyword(trailingTrivia: .spaces(1))

let identifier = SyntaxFactory.makeIdentifier("Example", trailingTrivia: .spaces(1))

let leftBrace = SyntaxFactory.makeLeftBraceToken()
let rightBrace = SyntaxFactory.makeRightBraceToken(leadingTrivia: .newlines(1))
let members = MemberDeclBlockSyntax { builder in
    builder.useLeftBrace(leftBrace)
    builder.useRightBrace(rightBrace)
}

let structureDeclaration = StructDeclSyntax { builder in
    builder.useStructKeyword(structKeyword)
    builder.useIdentifier(identifier)
    builder.useMembers(members)
}

print(structureDeclaration)
```

*唷。*那最后这段代码让我们得到了什么呢？

```Swift
struct Example {
}
```

*令人窒息的操作。*

这绝不是为了取代 [GYB](https://nshipster.com/swift-gyb/) 来用于每天的代码生成。（事实上，[libSyntax](https://github.com/apple/swift/blob/master/lib/Syntax/SyntaxKind.cpp.gyb) 和 [SwiftSyntax](https://github.com/apple/swift-syntax/blob/master/Sources/SwiftSyntax/SyntaxKind.swift.gyb) 都使用了 `gyb` 来生成接口。

但这个接口在某些特殊的问题上却格外有用。例如，你或许会使用 SwiftSyntax 来实现一个 Swift 编译器的 [模糊测试](https://en.wikipedia.org/wiki/Fuzzing)，使用它可以随机生成一个表面有效却实际上非常复杂的程序，以此来进行压力测试。

## 重写 Swift 代码

[在 SwiftSyntax 的 README 中有一个示例](https://github.com/apple/swift-syntax#example) 展示了如何编写一个程序来遍历源文件中的整型并把他们的值加 1。

通过这个，你应该已经推断得出如何使用它来创建一个典型的 `swift-format` 工具。

但现在，我们先考虑一个相当*没有*效率——并且可能在万圣节（🎃）这种需要捣蛋的场景才合适的用例，源代码重写：

```swift
import SwiftSyntax

public class ZalgoRewriter: SyntaxRewriter {
    public override func visit(_ token: TokenSyntax) -> Syntax {
        guard case let .stringLiteral(text) = token.tokenKind else {
            return token
        }

        return token.withKind(.stringLiteral(zalgo(text)))
    }
}
```

[`zalgo`](https://gist.github.com/mattt/b46ab5027f1ee6ab1a45583a41240033) 函数是用来做什么的？可能不知道会更好……

不管怎样，在你的源代码中运行这个重写器，可以把所有的文本字符串转换为像下面一样的效果：

```swift
// Before 👋😄
print("Hello, world!")

// After 🦑😵
print("H͞͏̟̂ͩel̵ͬ͆͜ĺ͎̪̣͠ơ̡̼͓̋͝, w͎̽̇ͪ͢ǒ̩͔̲̕͝r̷̡̠͓̉͂l̘̳̆ͯ̊d!")
```

*鬼魅一般，对吧？*

## 高亮 Swift 代码

让我们用一个真正实用的东西来总结我们对 SwiftSyntax 的探究：一个 Swift 语法高亮工具。

从语法高亮工具的意义上来说，它可以把源代码按某种方式格式化为显示更为友好的 HTML。

[NSHipster 通过 Jekyll 搭建](https://github.com/NSHipster/nshipster.com)，并使用了 Ruby 的库 [Rouge](https://github.com/jneen/rouge) 来渲染你在每篇文章中看到的示例代码。尽管如此，由于 Swift 的复杂语法和过快迭代，渲染出来的 HTML 并不是 100% 正确。

不同于 [处理一堆麻烦的正则表达式](https://github.com/jneen/rouge/blob/master/lib/rouge/lexers/swift.rb)，我们可以构造一个 [语法高亮器](https://github.com/NSHipster/SwiftSyntaxHighlighter) 来放大 SwiftSyntax 对语言的理解的优势。

根据这个核心目的，实现的方法可以很直接：实现一个 `SyntaxRewriter` 的子类并重写 `visit(_:)` 方法，这个方法会在遍历源文件的每个标识符时被调用。通过判断每种不同的标识符类型，你可以把相应的可高亮标识符映射为 HTML 标记。

例如，数字文本可以用类名是 `m` 开头的 `<span>` 元素来表示（`mf` 表示浮点型，`mi` 表示整型）。如下是对应的在 `SyntaxRewriter` 子类中的代码：

```Swift
import SwiftSyntax

class SwiftSyntaxHighlighter: SyntaxRewriter {
    var html: String = ""

    override func visit(_ token: TokenSyntax) -> Syntax {
        switch token.tokenKind {
        // ...
        case .floatingLiteral(let string):
            html += "<span class=\"mf\">\(string)</span>"
        case .integerLiteral(let string):
            if string.hasPrefix("0b") {
                html += "<span class=\"mb\">\(string)</span>"
            } else if string.hasPrefix("0o") {
                html += "<span class=\"mo\">\(string)</span>"
            } else if string.hasPrefix("0x") {
                html += "<span class=\"mh\">\(string)</span>"
            } else {
                html += "<span class=\"mi\">\(string)</span>"
            }
        // ...
        default:
            break
        }

        return token
    }
}
```

尽管 `SyntaxRewritere` 针对每一种不同类型的语法元素，都已经实现了 `visit(:)` 方法，但我发现使用一个 `switch` 语句可以更简单地处理所有工作。（在 `default` 分支中打印出无法处理的标记符，可以更好地帮助我们找到那些没有处理的情况）。这不是最优雅的实现，但鉴于我对 SwiftSyntax 不足的理解，这是个较好的开端。

不管怎样，在几个小时的开发工作后，我已经可以在 Swift 大量的语法特性中，生成出比较理想的渲染过的输出。

![](https://swift.gg/img/articles/nshipster-swiftsyntax/swiftsyntaxhightlighter-example-output-829aa64ab4bdf73a2e3070aab017e21e3db37ca0ee35079f0e89e22594806df0.png1548390462.5352607)

这个项目需要一个库和命令行工具的支持。快去 [尝试一下 ](https://github.com/NSHipster/SwiftSyntaxHighlighter)然后让我知道你的想法吧！