# SwiftGG 翻译组新成员指南

欢迎加入 SwiftGG 翻译组！我们是一个非常自由开放活泼的团队，相信你在这里会收获很多。

## SwiftGG 简介

![SwiftGG 简介](http://static.zybuluo.com/numbbbbb/vf1qkyzl8g681s9mkdsey3j0/SwiftGG%E5%9B%BE.png)

SwiftGG 成立于 2015.8.18，前身是[《The Swift Programming Language》](https://github.com/numbbbbb/the-swift-programming-language-in-chinese/)翻译团队，文档完成之后出于兴趣组成了翻译组。

SwiftGG 翻译组的原则是**只翻译作者授权的内容，绝不侵权**。每篇译文都会进行校对和定稿，尽量提高翻译质量。每个工作日我们都会发布一篇译文，将 Swift 领域世界最新的信息传递给国内开发者。

经过一年发展，目前 SwiftGG 在做的事可以分为两个方向，一个是“翻译组”，一个是“T 社区”。翻译组主要翻译文章、图书和视频字幕，努力做国内最好的 Swift 翻译。[T 社区](http://t.swift.gg)是一个线上+线下的邀请制社区，目前已经在北京、上海、成都、杭州四个城市开始组织技术沙龙，每月一次，不收费，不营利，专心做高质量的技术交流。

新人加入翻译组之后，可以选择自己感兴趣的方向，如果有更好的发展建议也可以和大家一起讨论。

## 新人指南

> 请仔细阅读下面的内容，以便之后和其他人更好地配合。团队本身没有什么条条框框，但是既然和其他人合作，就不要因为自己的疏忽给其他人造成不必要的麻烦。

加入 QQ 群之后，**第一件事**是改名，可以改成 GitHub 上的 ID，也可以改成你喜欢的名称。

为了规范翻译流程、方便大家协作，我们使用了一些工具，本文会介绍工具的使用方法。

目前我们使用的是 Bearychat、Tower 和 GitHub，Tower 用来记录文章的状态，Bearychat 用来监控新文章和聊天，GitHub 用来存放代码和网站的静态页面。

## Tower

**第二件事**是加入 Tower。

Tower 加入流程：
- [点击链接](https://tower.im/join?t=2ece2e39a4aef51ed6d79d2515748f2f)
- 填写信息
- 在群里喊一声，让大家通过申请

Tower 有微信版和移动端 APP，可以自行下载。

![](https://raw.githubusercontent.com/SwiftGGTeam/GGHexo/master/guide-imgs/1.png)

进入 Tower 之后，可以看到分为`任务`、`讨论`、`文件`和`文档`四个部分，下面分别介绍。

### 任务

![](https://raw.githubusercontent.com/SwiftGGTeam/GGHexo/master/guide-imgs/2.png)

任务是核心部分，进入之后可以看到有多个列表，下面简单介绍列表的作用：
- `备选文章`：这里的文章是其他成员筛选出来的优秀文章，可以认领翻译。如果要认领，把任务指派给自己，然后把任务用鼠标拖动到右侧的`翻译中`列表
- `翻译中`：这里是正在翻译中的文章，翻译完毕之后请把 markdown 文件上传到任务的附件中，然后把任务拖动到右侧的`等待校对`列表，然后在群里喊一声，告诉大家可以去校对
- `等待校对`：这里是已经翻译好的文章，需要进行校对。校对的时候可以下载 md 文件，校对完毕后需要把最新的 md 文件上传到任务附件中，然后把任务拖动到右侧的`等待定稿`列表中
- `等待定稿`：这里是已经校对完毕的文章，需要进行最后的定稿。校定稿的时候可以下载 md 文件，定稿完毕后需要把最新的 md 文件上传到任务附件中，然后把任务拖动到右侧的`等待豆腐添加 SEO`列表中
- `等待豆腐添加 SEO`：豆腐会添加 SEO 相关内容，然后拖入 `等待发布` 列表
- `等待发布`：这里是已经审核完毕的文章，等待发布到网站。发布操作目前由@numbbbbb 和@shanksyang 执行，发布完毕之后在任务前打勾，表示任务完成

### 讨论

讨论部分主要是大家在任务下方的回复，一般不用看。里吧有一个`优秀网站`列表，可以参考。

### 文件

目前用处不大，里面有一个`珍贵截图`文件夹，如果有和翻译组相关的珍贵截图（比如你的文章上首页）可以发上来，当做纪念。

### 文档

这里有一篇核心思想，讲述我们的想法和目的，可以参考。

## Bearychat

**第三件事**是加入 Bearychat。

Bearychat 加入流程：
- 在群里@numbbbbb，告诉他你的邮箱
- 收到邮件后加入

Bearychat 有移动端 APP，可以自行下载。

加入之后，可以看到左上角有四个讨论组：

![](https://raw.githubusercontent.com/SwiftGGTeam/GGHexo/master/guide-imgs/3.png)

`#所有人`是聊天用的，里面有 Tower 机器人，Tower 有操作的时候会自动发通知，比如：

![](https://raw.githubusercontent.com/SwiftGGTeam/GGHexo/master/guide-imgs/4.png)

`#运营通知`是运营用的，里面有微博机器人，之后还会添加其他机器人，感兴趣的话可以加入。

`#来源站`是核心功能，我们监控了多个国外的博客和网站，脚本放在阿里云的服务器上。一旦网站更新，文章和链接就会被发送到这个讨论组，因此可以加入这个讨论组，及时发现新文章。

`#检测重复`用来检测你要翻译的文章是否重复，使用的时候直接在讨论组发言即可，机器人会自动检测你的命令并返回结果。

目前支持两条命令：`/add url`和`/check url`，把`url`替换成文章地址，注意命令和`url`之间有一个空格。

`/add url`命令会添加新链接，当你把新文章放入 Tower 的时候，需要在这里添加链接，添加完毕会看到这样的结果：

![](https://raw.githubusercontent.com/SwiftGGTeam/GGHexo/master/guide-imgs/6.png)

`/check url`命令会检测链接是否已经存在，当你发现一篇新文章准备翻译的时候，需要先检测文章是否已经存在。如果文章存在会看到如下结果：

![](https://raw.githubusercontent.com/SwiftGGTeam/GGHexo/master/guide-imgs/7.png)

这表示这篇文章已经添加过，是重复文章，不要再加入 Tower，否则可能导致重复翻译。

如果文章不存在，会看到如下结果：

![](https://raw.githubusercontent.com/SwiftGGTeam/GGHexo/master/guide-imgs/8.png)

> 注意：支持一定程度的模糊查询，不过尽量保证`url`完整。

> Bearychat 使用技巧：可以对每个讨论组进行设置，比如把`#所有人`的普通通知关掉，只有@才会提醒。`#来源站`的通知不应该关掉，因为这里没有闲聊，只会在有新文章的时候提醒。

## GitHub

我们在 GitHub 上有组织，**第四件事**就是在群里喊一声，提供你的 GitHub ID，让其他人拉你加入组织。组织里面是网站相关的所有代码。

## 名字、链接和二维码

翻译好的文章会加入译者的名字和链接：

![](https://raw.githubusercontent.com/SwiftGGTeam/GGHexo/master/guide-imgs/5.png)

所以，**第五件事**是发给@numbbbbb你的名字和链接。具体的文本可以自己定，不一定是真名。

## 申请邮箱

翻译组有专用的邮箱，如果你想要，找@numbbbbb申请，比如 z@swift.gg。


## 内容排版指南

> 本指南转自`LeanCloud`的文案指南。

> 推荐阅读[Cee 的排版指南](https://speakerdeck.com/cee/guan-yu-pai-ban)

- 英文与非标点的中文之间需要有一个空格，如「使用 Swift 开发移动应用」而不是「使用Swift开发移动应用」。
- 数字与非标点的中文之间需要有一个空格，如「这段代码有 5 个函数」而不是「这段代码有5个函数」。
- 尽可能使用中文数词，特别是当前后都是中文时。上面的例子写为「这段代码有五个函数」会更好。
- 数字与单位之间需要有一个空格，如「5 GB」而不是「5GB」。
- 注意特殊名词的大小写：Android、iOS、iPhone、Google、Apple，无论是否在句首都应该以同样的方式写。

## Done！

你已经完成了新手任务，下面去 Tower 中领取一篇文章并开始翻译吧！

加油！
