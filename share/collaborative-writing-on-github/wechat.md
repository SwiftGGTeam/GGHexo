在 GitHub 上进行协同写作"

> 作者：Ole Begemann，[原文链接](http://oleb.net/blog/2016/02/collaborative-writing-on-github/)，原文日期：2016-02-29
> 译者：[赵磊](undefined)；校对：[冬瓜](https://desgard.com/)；定稿：[Cee](https://github.com/Cee)
  









过去的一年里我参与过几个多人协同写作的项目：编辑了两篇 [objc.io 期刊](https://www.objc.io/issues/)，同时还担任 [Core Data](https://www.objc.io/books/core-data/) 和 [Advanced Swift](https://www.objc.io/books/advanced-swift/) 两本书的技术评审。我想和大家分享一些经验。



### 过程

编辑书目的过程是这样的：作者用 [Markdown](http://daringfireball.net/projects/markdown/) 格式编写章节并直接 push 到 [GitHub](https://github.com/) 的私有仓库。之后我会把我编辑的内容和一些注释或疑问提交并发起 pull request。对于首次审查后章节的变动，作者会开启新的 pull requests 并在 merge 之前允许我继续 push 改动或注释。

总的来说，这种工作方式是行得通的。实际的协同写作过程如果借助 [Google Docs](https://www.google.com/docs/about/) 或者 [Quip](https://quip.com/)<sup id="fnref:1"><a href="#fn:1">1</a></sup>等工具可以让工作可能更简单，但在一个文件系统的目录<sup id="fnref:2"><a href="#fn:2">2</a></sup>中所有内容都采用纯文本文件形式，对于自动化构建过程是很有用的。例如 Chris 和 Florian 写了脚本去检d查样本代码中的编译错误、找出断掉的链接、并生成最终的 PDF。

### GitHub

一旦你在目录中放置了文本文件，使用 GitHub 提交 issue 或 pull request 就是自然而然的选择了，因为几乎我们社区的每个人都已经在使用它了。这种工作方式虽然很有效，但仍有一些地方值得改进。

#### diff 查看器

GitHub 的 diff 查看器是按行判断的。这对代码来说没问题，但对于一行（其实应该是一段）很长的文章来说就有问题了。diff 查看器并不总能突出一些小的改动（比如某人添加了一个逗号或改了一个错别字），这使得我们很难看出文章有什么变化。通常我会使用 [Kaleidoscope](http://www.kaleidoscopeapp.com/) 在本地进行 diff 操作，因为在「高亮细节变动」方面 Kaleidoscope 表现更佳。凭这一点，Kaleidoscope 成为了我刚需的工具。 

#### 给每个人 push 权限

给予每个人对仓库的 push 权限，在一个 pull request 中进行协作是最有效的的。在 objc.io 项目中我们犯了个错误 —— 没有给外部作者 push 权限，他们只得 fork 仓库来提交 pull request。反过来，编辑们对 fork 之后的仓库也没有 push 权限，结果导致每个小的改动（诸如修改错别字或变换格式）在合并 pull request 之前都只能由作者完成。如果每个人都对主仓库有 push 权限的话就不会有这种问题了。

#### 对当前版本文件进行注释

不幸的是，在 GitHub 上对某个特定文件当前版本的某一行添加注释是不怎么容易的。首先你必须找到更新这一行的最近一次 commit（使用 Blame），然后对那次 commit 添加注释。此方法只有当你的注释恰好添加在那次 commit 的变化上时有意义。然而实际情况却不同，因为一段话通常由多行组成。

我能够理解 GitHub 这么做的缘由（例如，当 GitHub 找不到提交 commit 用户的时候，谁会收到评论的提醒），但如果我能为 GitHub 添加一个新功能的话，一定会添加这个功能。

直观的解决方案是开启一个新的 issue，拷贝你想添加注释的段落，但这种做法既繁琐又失去了上下文联系。

另一种可行方案是为注释做标记 —— 加上 `TODO[名字]` 前缀 —— 直接添加到文件中相关段落的下面。这样的话会有一些开放的建议添加到上下文并且不会在讨论过程中丢失。之后你可以写个脚本列出所有遗留的 TODO 条目。另一个脚本则在编撰最新版本前将它们罗列出来。

### 其他工具

据我所知，使用 GitHub 来组织 objc.io 的文章和书本的决定是很早就确定的 —— 不是因某一章节从众多选择中脱颖而出，而是因为这些是业务中经常性问题，并且每个撰稿人都很熟悉。

市面上有很多专业的协同写作服务，并且大部分都方便初学者使用，即使你的合作人或编辑人员不是开发者。以下是我收集到的（不算多）：

- [Penflip](https://www.penflip.com/)（我喜欢这个因为它也使用了 Git 管理）
- [Draft](https://draftin.com/)
- [Typewrite](https://typewrite.io/)
- [Poetica](https://poetica.com/)
- [Authorea](https://www.authorea.com/)

这些工具中的有些会比 GitHub 拥有更好的协同写作体验。然而在没有深入使用之前，我很难对它们进行评估 —— 你可以叫上你志同道合的朋友，立一个项目，干上几个礼拜。当然，我还没有这么做，所以无法评估。

----

<a href="#fnref:1">1：事实上，根据作者需求，objc.io 的文章有时会从 Google Docs 启动。初稿完成后我们会复制粘贴到 MarkDown 文件，这份文件将作为后续变化的副本。</a>
<a href="#fnref:2">2：如果你使用 Git 或任何其它分布式版本控制系统，这份目录还包括整个改动历史。</a>
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。