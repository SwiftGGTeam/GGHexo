# GGHexo
打造国内第一的swift译文站  

## 使用流程  

安装Hexo  

    npm install hexo-cli -g

clone项目

    git clone git@github.com:SwiftGGTeam/GGHexo.git

拉取子项目

    cd GGHexo
    git submodule init
    git submodule update

安装依赖  

    npm install

---

`TAG: 以下每次重复`

将要修改的子项目切换到master分支

    cd source
    git checkout master
    git pull

在`/src`下创建`新文章名字.md`文件，进行编辑即可。

发布前需要:

1. **修改文章头**并**生成最终文章**，参考下下节。
2. **提取图片**，参考下一节内容。
3. 生成静态页面`hexo g`

在本地环境预览

    hexo s

打开[`http://localhost:4000`](http://localhost:4000)预览效果

将生成的`html`部署到服务器

    hexo d

将文章`md`文件推送到`SwiftGGTeam/source`

    (source)目录下
    git add *
    git commit -m ''
    git push

更新`GGHexo`将其指向最新的`source`

    (GGHexo)目录下
    git add -u
    git commit -m "update submodule to lastest commit id"
    git push

## 自动提取图片

在项目根目录下执行`python 2-extractImgs.py`或者`python 3-extractImgs.py`，取决于你的 Python 版本。

脚本会自动遍历`_posts`下的文章，提取其中的图片地址并下载到`jacman/source/img/articles`中对应文章的目录，然后更新文章中的图片链接。

注意：
- 文章头部必须包含`permalink`
- 图片链接必须正确

以上两条如果违反会直接报错，请根据错误信息修改对应文章，然后再次执行即可。

执行完毕之后，继续执行`hexo g`。

## md文件头示例

```
title: "Swift 函数式编程实践"
date: 2015-09-04
tags: [Swift]
categories: [harlan kellaway]
permalink: swift-functional-programming-intro

---
原文链接=http://harlankellaway.com/blog/2015/08/10/swift-functional-programming-intro/
作者=harlan kellaway
原文日期=2015/08/10
译者=shanks,mmoaay
校对=numbbbbb
定稿=小锅

正文......
```

title是标题，date是发布日期，tag是标签，categories是分类（我们填写来源网站名），permalink是最终生成的URL。

下面的应该不用解释了，需要注意的是文字要写对，比如“链接”不要写成“连接”。

译者、校对和定稿都支持多人，用英文逗号分隔即可。

修改好头部之后，在项目根目录下执行`babel-node generatePosts.js`就会在`_posts`中生成最终文件。

## 统计

统计脚本是`generateStat.js`，使用 ES6 语法编写，执行方法：
- 首先安装`babel`：`npm install babel -g`
- 接着`cd ...`切换到项目根目录
- 然后执行`babel-node generateStat.js`，会自动生成`source/stat`下的`md`文件

执行完毕后用`hexo`生成页面并部署即可。

## 运营版本生成

由于在各个网站发文章都需要修改文章，因此编写脚本自动生成。

目前运营目标：
- 简书
- 微信公众号
- CSDN（发邮件给txy，不需要生成）
- CSDN 极客头条（直接投稿链接，不需要生成）

通用处理：
- 去掉头部 hexo 信息
- 去掉原文链接
- 去掉尾部二维码
- 图片链接换成完整 URL
- 去掉`<!--more-->`标签
- 第一行加文章名称，方便复制到微信和简书的标题栏，使用的时候删除本行

简书特殊要求：
- 第二行加引用，引流到公众号

微信公众号特殊要求：
- 第二行加原文链接，方便复制到原文输入框，使用的时候删除本行

使用：
- `npm install mkdirp`
- `npm install babel -g`
- `cd ...`进入项目根目录
- `babel-node generateShareMD.js`

生成好的文章在`share`目录下，每篇文章一个文件夹，用`permalink`命名文件夹，用运营目标命名具体的`md`文件

## 其他信息
### google分析
ID：UA-66150920-1
