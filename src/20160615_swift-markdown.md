title: "在 Xcode 中使用 Markdown 生成 Swift 代码文档"
date: 2016-06-15
tags: [Swift]
categories: [AppCoda]
permalink: swift-markdown
keywords: xcode7 markdown,swift markdown
custom_title: 
description: 在 Xcode 7 中可以使用 Markdown 语法来写 Swift 代码文档，那么具体要怎么生成呢。

---
原文链接=http://www.appcoda.com/swift-markdown/
作者=Gabriel Theodoropoulos
原文日期=2016-05-12
译者=小铁匠Linus
校对=Channe
定稿=numbbbbb

<!--此处开始正文-->

在 Xcode 7 的所有功能中，有一个很特别：它给编写代码文档提供了一个更好的方法。随着 Xcode 7 的更新，开发者可以使用 **Markdown** 语法书写富文本格式的代码文档，而且可以结合特定的关键词来指明特殊部分（如参数，函数返回结果等）。作为新支持的 Markdown 文档样式，它具有以下几点优势：文本样式的自定义程度更高，更加灵活，当然也更有趣。然而，如果你仍然对原来的文本样式感兴趣的话，也可以看以前那篇[教程](http://www.appcoda.com/documenting-source-code-in-xcode/)。

<!--more-->

对每个开发者来说，代码文档是开发中非常重要的一件事。即使它看上去会拖慢开发进度，但实际上它是开发中不可或缺的一部分。我不反对给每个属性、函数、类、结构体等书写正确且全面的文档，但这并不是一件容易的事。不过，你可以通过以下几点来编写适当的文档：

* 描述各个属性、函数和类的真正用途。此外，最好能在需要注意的地方高亮函数的具体使用情况、用例或需求。

* 高亮函数的输入和输出（参数和返回值）。

* 为了几个月后再打开项目还能清晰地记得每个函数做了什么，每个属性是为了什么。

* 当你把代码共享或做成 lib 时，一定要让其他开发者能轻松地理解怎么使用你的代码。

* 使用工具制作具有专业外观的使用手册（比如：使用 Jazzy）。

你在 Xcode 里写的代码文档能被预览，也可以用以下的三种方法访问：

* 按住  Option/Alt 键点击属性名、方法名或类名等，会弹出快速预览（Quick Look preview）。

* 光标移动到属性名、方法名或类名上，打开快速帮助（Quick Help Inspector）进行查看。

* 使用第三方工具可以产生使用手册。比如，Jazzy 就是这样一款工具，我们稍后会讲到。通过使用它，可以在你工程的文件夹里生成一个集成了所有你写的代码文档的网页。

代码文档不是很死板的东西；它可以根据各自实体（属性、方法、类、结构、枚举）的修改而改变。如果你没有在实现一个新的实体时添加文档的话，那么几乎可以肯定，你永远不会去添加文档了。因此，试着养成一个这样的习惯：在合适的时间点去书写代码文档，并在新的实体实现后能花时间去更新文档。

## Markdown 基础语法

为了能更好地使用新的文档样式，对 Markdown 语法有一个基本的认识是很重要的。如果已经对这部分有充分的了解的话，可以跳过这一章，直接看下一章。你可以在网络上找到关于 Markdown 的很多信息，比如[这里](https://daringfireball.net/projects/markdown/syntax)还有[这里](https://confluence.atlassian.com/bitbucketserver/markdown-syntax-guide-776639995.html)都能找到。

尽管你能找到关于 Markdown 语法的其他资源，但是我觉得至少要讲一下基础语法。我的目的当然不是要提供一整个 Markdown 使用指南，只是为了呈现特定语法的常见用法。

因此，你大概知道（可能现在才知道）Markdown 语法是由*特殊字符*来格式化文本、添加资源（链接和图片）以及添加文本块（有序或无序列表，代码块等）。虽然这些字符很容易记住，但是还是需要经常上网查查或看看下面列出来的。有必要在这里说一下，如果你习惯了 Markdown 语法（其实很容易就做到了），然后通过使用合适的编辑器就可以生成不同格式的文档了，例如：HTML 页面、PDF 文档等等。说到 HTML 页面，Markdown 支持内联 HTML，也就是说，你可以直接把 HTML 标签写到文本里，这些标签都会被渲染。然而，使用 HTML 并不是 Markdown 的本质，因此我们还是回到 Markdown 自己的语法吧。

以下列出了最常用的 Markdown 语法：

* \#text\#：文本标题，相当于 HTML 中的 \<H1\> 标签。两个 \# 则对应 \<H2\> 标签，以此类推，直到 \<h6\> 标签。末尾的 \# 可以省略。
* \*\*text\*\*：使文本具有**加粗**的效果。
* \*text\*：使文本具有*斜体*的效果。
* \* text：使文本成为一个无序列表的元素，值得注意的是，有个 * 后面需要有一个空格。同样，可以使用 + 或 - 实现这个的功能。
* 1. text：使文本成为一个有序列表的元素。
* \[linked text](http://some-url.com)：使文本成为可以点击的超链接。
* \> text：创建一个块引用。
* 使用 4 个空格或 1 个 tab 来缩进所写的代码块，等价于 HTML 中的 \<pre\>\</pre\> 标签。可以继续使用 4 个空格或 1 个 tab 来添加另一个缩进。
* 如果不想使用空格或 tab 的话，可以使用 \` 。比如， \`var myProperty\` 会显示成 `var myProperty`。
* 另一种创建代码块的方法是添加 4 个 \`，并从下一行开始写具体的代码，最后添加 4 个 \` 表示结束。
* 反斜杠修饰 Markdown 的特殊字符就可以避免 Markdown 语法的解析了。比如， `\**this\**` 就不会产生加粗的效果。

以上这些是 Markdown 语法中比较重要的部分。虽然，Markdown 语法中还有很多额外的细节可以深究。但是，以上提供的这些已经足够你开始使用 Markdown 了。

如果你发现 Markdown 还蛮有意思的话，你可以下载一个编辑器具体尝试一下。使用编辑器，你可以实时地看到你所写的文本在转化成 HTML 后的效果。

> 关于编辑器：你可以尝试以下这些 Markdown 编辑器：[StackEdit](https://stackedit.io/)，[Typora](https://www.typora.io/)，[Macdown](http://macdown.uranusjr.com/)，[Focused](https://71squared.com/focused) 和 [Ulysses](http://www.ulyssesapp.com/)。

## 使用 Markdown

在编写任何 Swift 中实体的文档时，有些规则是一定要遵守的。你可以为属性（变量和常量）、方法、函数、类、结构体、枚举、协议、扩展和其他代码结构或实体编写代码文档。针对实体的每个文档块都要写在定义或头文件前面，且以 **3 个斜线（///）**或以下面的形式开头：

```
/**

*/
```

虽然 // 也被视为注释，但是这种语法会被 Xcode 忽略，而不产生对应的代码文档。你可以在各种代码块中使用 // 来注释，但是正如我上一句说的，这并不会产生对应的代码文档。（译者注：老外就是这么啰嗦，怪我咯～）

让我们来看一个简单的例子熟悉一下 Markdown 语法吧。在下面的代码块中，我们为一个属性添加了一行可以产生代码文档的注释。我建议你可以打开 Xcode 中 *Playground* 来试试本文中提到的所有例子。(校对注：为了保持和截图一致，下面的注释没有翻译)

```
/// This is an **awesome** documentation line for a really *useful* variable.
var someVar = "This is a variable"
```

以上写的代码文档会在 Xcode 中呈现以下效果：

![](http://www.appcoda.com/wp-content/uploads/2016/05/t52_1_quickhelp1.png)

值得注意的是，单词 “awesome” 是加粗的，而 “useful” 是斜体的。前一个是由 ** 包含，后一个则由 * 包含产生的。

让我们来对函数来做另一个例子：

```
/**
    It calculates and returns the outcome of the division of the two parameters.

    ## Important Notes ##
    1. Both parameters are **double** numbers.
    2. For a proper result the second parameter *must be other than 0*.
    3. If the second parameter is 0 then the function will return nil.

*/
func performDivision（number1: Double, number2: Double） -> Double! {
    if number2 != 0 {
        return number1 / number2
    }
    else {
        return nil
    }
}
```

拷贝以上代码到 playground 中，再按住 Option 键点击函数名，就会弹出一个快速帮助（Quick Help），如下图：

![](http://www.appcoda.com/wp-content/uploads/2016/05/t52_2_quickhelp2.png)

这里我们使用了两个新的 Markdown 元素，**标题**和**有序列表**。同时，也有加粗和斜体的文本。可以看到的是，简简单单地使用了 Markdown 语法中的特殊字符就可以生成如此复杂的富文本代码文档。以下是快速帮助栏（Quick Help Inspector）的截图：

![](http://www.appcoda.com/wp-content/uploads/2016/05/t52_3_help_inspector1.png)

下面例子中，我们为函数添加一个代码文档中的代码块。值得注意的是，除了创建了一个代码块，我们还用\` 标记了内联函数的名称。

```
/**
    It doubles the value given as a parameter.

    ### Usage Example: ###
    ````
    let single = 5
    let double = doubleValue（single）
    print（double）
    ````

    * Use the `doubleValue（_:）` function to get the double value of any number.
    * Only ***Int*** properties are allowed.
*/
func doubleValue（value: Int） -> Int {
    return value * 2
}
```

以下是最终效果：

![](http://www.appcoda.com/wp-content/uploads/2016/05/t52_4_quickhelp3.png)

最后，让我们来为枚举添加代码文档，并在其他函数中使用。这个例子中有趣的是每个枚举类型的代码文档：

```
/**
    My own alignment options.

    ````
    case Left
    case Center
    case Right
    ````
*/
enum AlignmentOptions {
    /// It aligns the text on the Left side.
    case Left

    /// It aligns the text on the Center.
    case Center

    /// It aligns the text on the Right side.
    case Right
}


func doSomething（） {
    var alignmentOption: AlignmentOptions!

    alignmentOption = AlignmentOptions.Left
}
```

现在，当你使用到这个枚举时，Xcode 就会显示之前你写的对应的代码文档：

![](http://www.appcoda.com/wp-content/uploads/2016/05/t52_5_quickhelp4.png)

## 使用关键字

使用 Markdown 语法只是为 Swift 代码添加代码文档的一个好处。显而易见，富文本格式很强大，可以展示精美的文档内容，但是下面要介绍另一个很厉害的**关键字**。

当你使用关键字时，Xcode 会在渲染代码文档时自动应用对应的文本格式（其他第三方库也是这么做的）。关键字可以很方便地指出代码结构中常见的部分，然后区分出来。举个例子，有很多关键字可以高亮方法的参数、返回值、类的作者或方法的版本。这个关键字的列表还挺长的，然而并不是每个关键字都会频繁使用，有些基本没人用。不过大多数常见的关键字最好还是记在脑子里，至于其它的可以在需要时再去查。

正如上面说的，是时候通过几个简单的例子来说明关键字的用法了。首先来说一下，方法或函数中接收的参数吧：

```
/**
    This is an extremely complicated method that concatenates the first and last name and produces the full name.

    - Parameter firstname: The first part of the full name.
    - Parameter lastname: The last part of the fullname.
*/
func createFullName（firstname: String, lastname: String) {
    let fullname = "\（firstname） \（lastname）"
    print（fullname）
}
```

以上代码会显示成这样：

![](http://www.appcoda.com/wp-content/uploads/2016/05/t52_6_keywords1.png)

值得注意的是关键字前的 - 号以及与关键字中间的空格。后面跟随的是具体的参数名。你必须对所有的参数都书写对应的描述文字。

现在让我们修改一下上面的函数，将这个函数返回一个字符串而不只是打印出来。为了实现这个，我们添加了一个可以描述函数返回值的关键字：

```
/**
    This is an extremely complicated method that concatenates the first and last name and produces the full name.

    - Parameter firstname: The first part of the full name.
    - Parameter lastname: The last part of the fullname.
    - Returns: The full name as a string value.
*/
func createFullName（firstname: String, lastname: String) -> String {
    return "\（firstname） \（lastname）"
}
```

显示结果是这样的：

![](http://www.appcoda.com/wp-content/uploads/2016/05/t52_7_keywords2.png)

以上这两个关键字（*Parameter* 和 *Returns*）是会用的比较频繁的。接下来的这个函数实现了与上一个函数完全相反的功能，将全名拆分成姓和名：

```
/**
    Another complicated function.
    
    - Parameter fullname: The fullname that will be broken into its parts.
    - Returns: A *tuple* with the first and last name.

    - Remark:
        There's a counterpart function that concatenates the first and last name into a full name.

    - SeeAlso:  `createFullName（_:lastname:）`

*/
func breakFullName（fullname: String) -> （firstname: String, lastname: String) {
    let fullnameInPieces = fullname.componentsSeparatedByString（" "）
    return （fullnameInPieces[0], fullnameInPieces[1]）
}
```

上面新出现的两个关键字是 *Remark* 和 *SeeAlso*。通过使用 *Remark*，你可以高亮你想要引起读者注意的地方。关键字 *SeeAlso* 可以引用代码的其它部分（比如，我们这个例子中是引用了前一个函数）或提供一个 URL。Xcode 中的快速帮助（Quick Help）会显示如下：

![](http://www.appcoda.com/wp-content/uploads/2016/05/t52_8_keywords3.png)

试着想象一下，上面的这个函数会分享给其他开发者使用。你肯定希望所有使用这个函数的人都能知道：参数 `fullname` 不能是空的，且姓和名要包含在全名里，并以空格分隔，这样函数才能正确调用。为了实现这个，你需要使用另外两个关键字 *Precondition* 和 *Requires*。让我们来对应的更新下上面的那个函数：

```
/**
    Another complicated function.

    - Parameter fullname: The fullname that will be broken into its parts.
    - Returns: A *tuple* with the first and last name.

    - Remark:
        There's a counterpart function that concatenates the first and last name into a full name.

    - SeeAlso:  `createFullName（_:lastname:）`

    - Precondition: `fullname` should not be nil.
    - Requires: Both first and last name should be parts of the full name, separated with a *space character*.

*/
func breakFullName（fullname: String) -> （firstname: String, lastname: String) {
    let fullnameInPieces = fullname.componentsSeparatedByString（" "）
    return （fullnameInPieces[0], fullnameInPieces[1]）
}
```

![](http://www.appcoda.com/wp-content/uploads/2016/05/t52_9_keywords4.png)

展望未来，你可能会乐意记下未来计划的变更：

```
- Todo: Support middle name in the next version.
```

你甚至可以在写代码文档时，添加 *warnings*、 *version*、*author* 和 *notes*：

```
/**
    Another complicated function.

    - Parameter fullname: The fullname that will be broken into its parts.
    - Returns: A *tuple* with the first and last name.

    - Remark:
        There's a counterpart function that concatenates the first and last name into a full name.

    - SeeAlso:  `createFullName（_:lastname:）`

    - Precondition: `fullname` should not be nil.
    - Requires: Both first and last name should be parts of the full name, separated with a *space character*.

    - Todo: Support middle name in the next version.

    - Warning: A wonderful **crash** will be the result of a `nil` argument.

    - Version: 1.1

    - Author: Myself Only

    - Note: Too much documentation for such a small function.
 */
func breakFullName（fullname: String) -> （firstname: String, lastname: String) {
    let fullnameInPieces = fullname.componentsSeparatedByString（" "）
    return （fullnameInPieces[0], fullnameInPieces[1]）
}
```

以下是显示结果：

![](http://www.appcoda.com/wp-content/uploads/2016/05/t52_10_keywords5.png)

看了上面这么多例子，你应该能理解关键字的详细程度完全是由你确定的。代码中重要的部分（比如，上面拿来举例子的函数）要有具体的代码文档，而次要的部分只写基本的文档即可。

Apple 提供了一个所有代码文档中可能用到的关键字页面，你如果点了下面提到的超链接，你可以看到每个关键字采用 Markdown 语法的具体使用指南。走过路过，不要错过了，[进去瞧一瞧](https://developer.apple.com/library/ios/documentation/Xcode/Reference/xcode_markup_formatting_ref/MarkupFunctionality.html#//apple_ref/doc/uid/TP40016497-CH54-SW1)。

## 使用 Jazzy 产生代码文档

[Jazzy](https://github.com/realm/jazzy) 是一款可以为 Swift 和 Objective-C 代码产生具有 Apple 风格的代码文档工具。事实上，Jazzy 会为你创建一个链接所有代码文档的独立网页。它是一款命令行工具，但还是很容易使用的。

我并不打算介绍 Jazzy 的具体使用方法；只需要访问它的 [GitHub 页面](https://github.com/realm/jazzy)，你就能找到所有你想要的信息了，包括使用要求和安装方法。安装过程真的很简单，你所有要做的如下：

1. 打开“终端”
2. 输入“sudo gem install jazzy”
3. 输入密码
4. 等待

为了方便你尝试使用 Jazzy，我已经准备好了一个工程，你可以在[这里](https://github.com/appcoda/SwiftDocSample)下载。这个工程很简单，它就是基于之前提到的例子写的，即组合姓和名成全名以及全名分割成姓和名。

![](http://www.appcoda.com/wp-content/uploads/2016/05/t52_11_app_sample.png)

在这个工程里，我已经添加了和之前例子中类似的代码文档。即使这个工程只是为了演示，但是不管是用在什么场合，它不仅能支持类、方法和属性，还能支持结构体、枚举、扩展、协议等等。

假设你现在已经下载了那个工程，让我们来看看 Jazzy 到底是怎么用的。一开始，使用 `cd` 命令将目录切换到工程对应的目录：

```
cd path_to_project_folder
```

简单地输入 `Jazzy` 然后敲回车等着，然而，这样并不能将类或其他没有标注为 *public* 的结构写入代码文档。因此，如果你想要包含所有的实体，就输入一下：

```
jazzy --min-acl internal
```

另外，如果你用的不是 Swift 的最新版本，发现使用 Jazzy 后没有效果的话，你可以通过以下命令来指定你的 Xcode 支持的 Swift 版本：

```
jazzy --swift-version 2.1.1 --min-acl internal
```

我强烈建议你输入 `jazzy -help` 看看所有你使用 Jazzy 时可能使用到的参数。当然，你完全可以根据自己的喜好来得到最终的结果。

以下是你生成代码文档页面时会看到的：

![](http://www.appcoda.com/wp-content/uploads/2016/05/t52_13_terminal_jazzy.png)

默认输出的文件夹位于工程的根目录（你也可以更改输出路径），叫 *docs*。

使用 Finder 进入到对应路径，在浏览器中打开 *index.html*。你立即就会发现，默认生成的页面风格和 Apple 官方文档是非常相似的。在页面里到处点击看看，看看具体显示的代码文档。接下来，就尝试在你自己的工程中使用吧。

![](http://www.appcoda.com/wp-content/uploads/2016/05/t52_15_jazzy_results.png)

## 总结

为代码写文档是一件必要且重要的事，但是开发者往往因为缺乏时间而放弃了。当项目临近交付时间或在短短时间内还有很多 bug 要修复，这就很难有机会为项目的每一个部分写出合适的文档。然而，我希望通过这篇文档，你可以意识到代码文档的重要性，并试着尽量写一下代码文档。你不需要写下所有的细节，但你至少要为代码中的重要部分增加高亮，方便其他开发者或以后你自己继续在这个代码基础上进行修改。因此，你不要忘了还有一款专业的代码文档生成工具 Jazzy 可以使用。也许这可以成为你写代码文档的动力吧！