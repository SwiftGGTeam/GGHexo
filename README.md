# GGHexo
打造国内第一的swift译文站  

## 使用流程  

安装Hexo  

    npm install hexo-cli -g

clone项目

    git clone git@github.com:SwiftGGTeam/GGHexo.git

拉取theme子项目

    cd GGHexo
    git submodule init
    git submodule update

安装依赖  

    npm install

创建文章

    hexo new "新文章的名字"

在`source/_posts`下生成`新文章名字.md`文件，进行编辑即可。

生成静态页面

    hexo g

在本地环境预览

    hexo s

打开[`http://localhost:4000`](http://localhost:4000)预览效果

将生成的`html`部署到服务器

    hexo d

将文章推送到github

    git add *
    git commit -m ''
    git push
