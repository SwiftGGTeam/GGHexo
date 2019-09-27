在 GitHub 上创建一个 Swift 包：其实一点也不简单"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2015/12/27/creating-a-swift-package-on-github-not-as-easy-as-i-thought/)，原文日期：2015-12-27
> 译者：DianQK；校对：[Cee](https://github.com/Cee)；定稿：[numbbbbb](http://numbbbbb.com/)
  










我觉得我不需要再介绍 Git 了，大家应该已经很熟悉了。

### Package.swift

我认为[建立一个 git 仓库](https://github.com/erica/SwiftString)来使用包管理工具不需要学什么新东西。毕竟使用一个包仅仅是意味着贴一行代码到一个 app 包中，不是吗？

我创建了一个 `Package.swift` 文件，我想我只需要编译就能用。

    
    import PackageDescription
    let package = Package (
        name: "myutility",
        dependencies: [
    	.Package(url: "https://github.com/erica/SwiftString.git",
                     majorVersion: 1),
        ]
    )

然而我失败了。



### Git 标签

当我硬着头皮去学习 git 标签后，才发现它并不会在创建后自动推送到 GitHub 上。事实上，直到我最终克隆了一个仓库并且运行了一下 `git tag` 命令，发现什么都没有输出时，我才发现了这个问题。

    bash
    % git tag
    %

这就是为什么我一直尝试编译一个简单的测试 app，结局却总是 `swift-build: The dependency graph could not be satisfied`（早期的 Swift 编译是 satisfed）。

### 添加标签

你可以使用 git tag 添加标签，例如：

    bash
    % git tag -a 1.0.0 -m "Version 1.0.0"

你可以使用不带参数的 git tag 查看所有标签：

    bash
    % git tag
    % 1.0.0

也可以显示标签名字（以及附加的信息）：

    bash
    git tag -n
    1.0.0 Version 1.0.0

这些标签不会被自动上传到 GitHub ，除非你推送它们：

    bash
    % git push --tags
    Counting objects: 1, done.
    Writing objects: 100% (1/1), 176 bytes | 0 bytes/s, done.
    Total 1 (delta 0), reused 0 (delta 0)
    To https://github.com/erica/SwiftString.git
     * [new tag] 1.0.0 -> 1.0.0

现在，那些依赖于 tag 版本的仓库终于能正常工作了！

[Kevin B](http://www.twitter.com/Eridius) 补充到：`git push --tags`将会推送你所有的标签。所以如果你只想推送一个，需要明确指定出来，例如，`git push origin v1.0.0`

### 阅读标签

进入你的包文件夹，就可以在终端中阅读标签。你可以看到，每一个文件结尾都包含标签数字。

    bash
    % ls
    % ./ ../ SwiftString-1.0.1/

如果你点进这个包的文件夹，你会看到完整的克隆仓库，包括全部的 .git 文件。你同样可以在这里查看标签和与其关联的信息：

    bash
    % cd SwiftString-1.0.0/
    % ls
    ./		.git/		Makefile	README.md
    ../		.gitignore	Package.swift	Sources/
    % git tag -n
    1.0.0           Version 1.0.0
    %

希望这篇文章对大家有帮助，解决这个问题浪费了我一天的时间。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。