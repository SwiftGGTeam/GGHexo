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

创建文章

    hexo new "新文章的名字"

在`source/_posts`下生成`新文章名字.md`文件，进行编辑即可。

发布前需要先提取图片再生成页面，参考下一节内容。

发布前需要修改文章头，参考下下节。

生成静态页面

    hexo g

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
title: "Swift 中的结构体与 NSCoding"  
date: 2015-8-27
tags: [Swift]
categories: [Swift and Painless]
permalink: nscoding_and_swift_structs

---
> 原文连接：[NSCoding And Swift Structs](http://swiftandpainless.com/nscoding-and-swift-structs/?utm_campaign=Swift%2BSandbox&utm_medium=web&utm_source=Swift_Sandbox_3)
> 译者：[小锅](http://www.swiftyper.com)

正文......
```

title是标题，date是发布日期，tag是标签，categories是分类（我们填写来源网站名），permalink是最终生成的URL。

## 统计

统计脚本是`generateStat.js`，使用 ES6 语法编写，执行方法：
- 首先安装`babel`：`npm install babel -g`
- 接着命令行切换到项目根目录
- 然后执行`babel-node generateStat.js`

执行完毕后用`hexo`生成页面并部署即可。

## 其他信息
### google分析
ID：UA-66150920-1
