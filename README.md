# GGHexo

master deploy status:![master branch](https://travis-ci.org/SwiftGGTeam/GGHexo.svg?branch=master)

stage deploy status:![stage branch](https://travis-ci.org/SwiftGGTeam/GGHexo.svg?branch=stage)

打造国内第一的 Swift 译文站。

## 使用流程

clone 项目

    git clone git@github.com:SwiftGGTeam/GGHexo.git

拉取子项目

    cd GGHexo
    git submodule init
    git submodule update

安装依赖  

    (npm install -g yarn)
    yarn install

本地查看效果 

```shell
# src 下没有新添加的文章时
yarn run hexo s
# src 下有自己新添加的文章
./preDeploy.sh local
```

## 翻译提交流程

1. 在 github 网页使用 [create new file](https://github.com/SwiftGGTeam/GGHexo/new/stage/src) 在 src 目录下创建要翻译的文章，文件命名请用以下格式：`20170903_swift-weekly-brief-75.md`，其中`swift-weekly-brief-75`对应md文件中permalink字段。内容格式按照 `书写规范以及 demo`下的例子来。然后创建 PR。
2. 提交 PR 申请合入到 stage 分支，并根据大家的 comment 进行修改。
3. PR 合入 stage 后，触发 travis build，将网站部署到 [stage 环境](http://pages.swift.gg)，部署在 swiftggteam.github.io 这个项目的 master 分支下)，可以通过 readme 顶部的 status image 来查看状态，也可以通过 [commits](https://github.com/SwiftGGTeam/GGHexo/commits/stage) 页面下的每个 commit 后面的对勾来查看构建状态。
4. 在 stage 环境确认无误后，将 stage 合入到 master 分支，随后 travis ci 会将静态资源部署到 swiftggteam.github.io 项目的 aliyun-pages 分支，aliyun 部署的 crontab 脚本隔一段时间会拉取 aliyun-pages 分支的静态资源。travis.ci 同时还会将自动生成的其他平台运营用的 md 文件提交到 master 分支。
5. 如果本次提交不包含网站相关的变更，比如 readme.md 的变更，可以在提交的最后一个 commit 中加入 `[skip ci]`，详情参考 [Skipping a build](https://docs.travis-ci.com/user/customizing-the-build#Skipping-a-build)

## 自动化部署做的一些事

###  自动提取图片（暂停使用）

**暂时停用。之前服务器在香港，可以下载转存一些无法直接访问的图片。目前服务器在北京阿里云，和用户直接加载原图片 URL 没有区别。**

在项目根目录下执行 `python 2-extractImgs.py` 或者 `python 3-extractImgs.py`，取决于你的 Python 版本。

脚本会自动遍历 `_posts` 下的文章，提取其中的图片地址并下载到`jacman/source/img/articles`中对应文章的目录，然后更新文章中的图片链接。

注意：

- 文章头部必须包含 `permalink`
- 图片链接必须正确

以上两条如果违反会直接报错，请根据错误信息修改对应文章，然后再次执行即可。

### 文件头修改

项目根目录下执行 `babel-node generatePosts.js` 就会在 `_posts` 中生成最终文件。主要做了两件事：

1. 把作者原文日期等内容换成统一的头部，以及添加来源尾部
2. 过滤掉一些没有授权的文章

#### md 文件头示例

```
title: "Swift 函数式编程实践"
date: 2015-09-04
tags: [Swift]
categories: [harlan kellaway]
permalink: swift-functional-programming-intro

---
原文链接=http://harlankellaway.com/blog/2015/08/10/swift-functional-programming-intro/
作者=harlan kellaway
原文日期=2015-08-10
译者=shanks,mmoaay
校对=numbbbbb
定稿=小锅

正文......
```

title 是标题，date 是发布日期，tag 是标签，categories 是分类（我们填写来源网站名），permalink 是最终生成的 URL。

下面的应该不用解释了，需要注意的是文字要写对，比如“链接”不要写成“连接”。

译者、校对和定稿都支持多人，用英文逗号分隔即可。

### 统计

统计脚本是 `generateStat.js`，使用 ES6 语法编写，执行方法：

执行 `babel-node generateStat.js`，会自动生成 `source/stat` 下的 `md` 文件

### 运营版本生成

由于在各个网站发文章都需要修改文章，因此编写脚本自动生成。

目前运营目标：

- 简书
- 微信公众号
- CSDN（发邮件给 txy，不需要生成）
- CSDN 极客头条（直接投稿链接，不需要生成）

通用处理：

- 去掉头部 hexo 信息
- 去掉原文链接
- 去掉尾部二维码
- 图片链接换成完整 URL
- 第一行加文章名称，方便复制到微信和简书的标题栏，使用的时候删除本行

简书特殊要求：

- 第二行加引用，引流到公众号

微信公众号特殊要求：

- 第二行加原文链接，方便复制到原文输入框，使用的时候删除本行

使用：

`babel-node generateShareMD.js`

生成好的文章在 `share` 目录下，每篇文章一个文件夹，用 `permalink` 命名文件夹，用运营目标命名具体的 `md` 文件

## 其他信息

### google 分析

ID：UA-66150920-1
