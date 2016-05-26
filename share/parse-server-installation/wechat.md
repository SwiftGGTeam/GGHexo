如何将 Parse 服务器迁移到 Heroku 或 AWS "

> 作者：AppCoda，[原文链接](http://www.appcoda.com/parse-server-installation/)，原文日期：2016-04-16
> 译者：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[Channe](undefined)
  









我之前写过这篇文章 [***Migrating a parse database to a self-host MongoDB instance***](http://www.appcoda.com/parse-server-migration/)，在这次的春季辅导教程中，我们看一下如何将 parse 服务器迁移到 Heroku 或 Amazon Web Service。

对于还不了解 [Parse 之死](http://blog.parse.com/announcements/moving-on/)的人来说，这意味着服务器（处理数据、与数据库互动、发送接收请求等待）需要迁移到其他地方了。Parse，后端即服务（BaaS），为开发者提供服务器和数据库的服务。然而，Parse 已在一月份关闭，官方建议，在 2017 年 1 月 28 日彻底停止服务之前，请迁移 Parse 应用。Parse 官方建议你先迁移数据库，然后在迁移服务器。本教程假定你已经完成了数据库的迁移，正如我们在上篇教程[第一部分](http://www.appcoda.com/parse-server-migration/)中所做的。



幸运的是，[parse-server](https://github.com/ParsePlatform/parse-server)（GitHub 项目，由 Facebook 开源，『伟大的』 Parse 统治者）可以部署在大部分的云服务上。在本节教程里，我们会讲述如何将 parse-server 部署到Salesforce 旗下知名的云服务供应商 Heroku。在本篇文章的最后部分，我们会演示如何部署到 Amazon Web Services（AWS）上，世界上很多知名的 App 都在使用 AWS 的服务。

## 准备开始

首先到 [Heroku.com](https://www.heroku.com) 网站注册一个帐号。为了演示 demo，我选择了免费方案。你根据自己的需要，选择合适的方案，比如付费方案。你可以在[这里](https://www.heroku.com/pricing)看到所有的付费方案。

部署到 Heroku 有两种方法可供选择。第一种是点击 Deploy to Heroku 按钮，然后出现一步接一步的提示流程，因为 Parse 已经在 Heroku 的服务器上设置过 parse-server 了，对非 JavaScript 程序员来说，这可能是最简单的方法了。如果你熟悉 git 和命令行，请使用克隆应用然后用命令行完成。话虽如此，但是你不能一辈子都避免使用命令行。不管你选择那种方式，都会涉及到命令行的。

### 方法 1：使用 Heroku 按钮

![](http://swift.gg/img/articles/parse-server-installation/68747470733a2f2f7777772e6865726f6b7563646e2e636f6d2f6465706c6f792f627574746f6e2e706e671463640618.590661)

点击上面的按钮，创建一个新的 heroku 应用，你会看到类似下方图片的界面：

![](http://www.appcoda.com/wp-content/uploads/2016/03/Screen-Shot-2016-03-28-at-8.25.45-PM-1024x554.png)

设置向导出现，让你输入应用名称（全部小写且不允许有空格）。

接下来，选择 runtime 选项。如果你住在美国，选择 United States（美国），其他地方，选择 Europe（欧洲）。runtime 选项，就是你希望你的应用部署在哪个地方。考虑到性能和速度，最好将应用服务器部署在离你较近的地方。

![](http://www.appcoda.com/wp-content/uploads/2016/03/Screen-Shot-2016-03-28-at-8.40.20-PM-1024x550.png)

接下来更新配置，填写 Parse 账户里对应的密钥（或者生成新的密钥，如果你不是迁移现存应用的话，这点以后再说）。安装路径为 `/parse`。

当你填完所有的字段后，点击 deploy 按钮，暂时先空着 MongoLab（也就做 mLab）开发。

![](http://www.appcoda.com/wp-content/uploads/2016/03/Screen-Shot-2016-03-28-at-8.40.25-PM-1024x555.png)
可能需要你输入你的信用卡。

### 方法 2：克隆 Heroku 应用
parse-server 是开源项目，可以在 [GitHub](https://github.com/ParsePlatform/parse-server) 上下载。如果你选择的是命令行而不是点击 Heroku 按钮，那么继续下方的操作。开始前，先打开终端（Terminal），使用下方的命令来克隆应用：

    bash
    cd ~
    cd Desktop
     
    git clone https://github.com/ParsePlatform/parse-server-example.git
    git add .
    git init
    git commit -m "Initial Commit"

![](http://www.appcoda.com/wp-content/uploads/2016/03/Screen-Shot-2016-03-26-at-2.16.06-PM-1024x640.png)
现在，你已经成功地将 parse-server 克隆到桌面了。

## 修改数据库的 URI

不管你在上面选择了哪个方式，现在你的应用在一定程度上已经设置过了。如果你使用是方法 1，你需要在你电脑里复制一份本地代码副本，首先用下列命令行（也会将 App 克隆到电脑桌面）。

 > 注意：下方的选项适用于选择了方法 1 的人

    bash
    $ heroku login 
     
    $ cd ~/Desktop
    $ heroku git:clone -a your-app-name
    $ cd your-app-name
     
    $ git add .
    $ git commit -am "make it better"
    $ git push heroku master

登录后，需要输入认证（之后会详细说明，不过现在只需要输入 Heroku 帐号的邮箱和密码，密码不会出现在屏幕上）。

现在，打开你最喜欢的文本编辑器（我比较喜欢 Sublime Text），打开新克隆的库（repository）（对于新手来说，你可以直接将整个文件夹拖到 sublime text 图标上，然后 sublime text 会自动打开文件，或者使用顶部菜单的 File -> Open）。
 
![](http://www.appcoda.com/wp-content/uploads/2016/03/Screen-Shot-2016-03-26-at-2.21.02-PM-1024x640.png)

现在，我们需要打开 `index.js` 文件，修改 API 变量。注意第 14-23 行。

![](http://www.appcoda.com/wp-content/uploads/2016/03/Screen-Shot-2016-03-26-at-2.21.02-PM-1-1024x265.png)

从第 14 行开始，我们需要修改 `databaseURL` 参数。使用在本教程第一部分生成的路径来替换参数。我会使用下面的 url，不过你必须用你自己的 url 来替换。

    mongodb://admin:mypassword@ds017678.mlab.com:17678/appcoda-test

接下来，我们需要填写 `appId` 和 `masterKey` 参数。如果你是在迁移一个已经存在的应用，到 [parse.com](https://parse.com) 上找到对应的数据。如果这是你第一次使用 parse-server 创建一个新工程，你可以生成随机的字母数字密钥。

在 parse.com 网站上登录你的 Parse 帐号，找到 Settings（设置），选择 Security & Keys。复制粘贴你的 Application ID（复制这个应用，不要复制成其他应用的）和 Master Key。下面的图片可供你参考（我的密钥出于安全考虑遮挡）。

![](http://www.appcoda.com/wp-content/uploads/2016/03/Untitled-1024x610.png)

 > 注意：如果你选的是方法 1，那已经设置了你的密钥，你可以直接跳过这一步。即使如此，我还是建议你看一下，这样你能对 parse-server 的工作机制有更深入的理解。
 
在 `index.js` 文件里替换上你刚刚复制来的新密钥，你也可以添加 `clientKey` 作为一个参数，从 Parse 中获取。
 
最后，记住保存你的操作，快捷键 Command+S（Mac 电脑上）。

如果你不是迁移应用，那么使用随机生成器（例如 random.org 或其他类似的东西）来生成字母数字密钥。

接下来，部署 Heroku。

## 将 Parse 服务器部署到 Heroku

首先在电脑上[安装 Heroku 工具条](https://toolbelt.heroku.com)，从链接中可以找到官方安装指南。安装完成后，在终端（Terminal）中输入下列命令行：

    bash
    heroku login

接下来输入登录 Heroku 信息，注意当你输入密码的时候，密码不会出现在屏幕上。

如果你选择的是方法 1，就没有必要用下面的命令行创建一个 Heroku 应用了。如果你选择的是方法 2，确保输入下列命令行来创建一个 Heroku 应用。

    bash
    heroku create

Heroku 会给你创建一个应用，现在提交修改内容，代码如下：

    bash
    git add .
    git init
    git commit -m "Updated api config"
    git push heroku master

现在，你已经成功部署了 Heroku！如果你遇到任何错误，请在下方的评论栏中留言，我将尽力帮助你。

## 设置 Heroku 的环境变量

接下来，我们需要设置 Heroku 的环境变量，回到终端（Terminal），输入下列命令（使用你的 MongoDB 实例中的 URI，我们之前介绍过）。

    bash
    heroku config:set DATABASE_URI=mongodb://admin:mypassword@ds017678.mlab.com:17678/appcoda-test

回到 Heroku 网页上，点击你的应用，在 Settings tab 页下，点击 `reveal config variables`。

![](http://www.appcoda.com/wp-content/uploads/2016/03/Untitled-1-1024x610.png)

现在你应该可以看到 Heroku 的 config Variables 里有了 database URI。

恭喜你！你的 parse-server 已经成功地部署到了 Heroku。唯一的问题是：**还没有连接到你的 iOS 应用上**。

## 定位 Parse 服务器的 URL

为了能够将你的应用连接到新的 parse-server，首先要从 Heroku 应用设置里定位托管地址（hosting url）。

![](http://www.appcoda.com/wp-content/uploads/2016/03/heroku-domain-1024x547.png)

回到 `index.js` ，找到第 27 行，注意找 `moutPath` 变量是 `/parse`。

![](http://www.appcoda.com/wp-content/uploads/2016/03/parse-mount.png)

这个变量表示 parse 在 Heroku 服务器上的地址。目前来说，地址是 `/parse`。所以，可以在 yourapp.herokuapp.com/parse（改成你自己的域名） 中访问 parse-server。

## 设置 iOS 应用

现在，我们已经正确地配置和部署了服务器，是时候来设置 iOS 应用设置选项了，让 iOS 应用连接到新的 parse 服务器上。

在 Xcode 里，打开应用，选择 `appdelegate.swift` 文件，删除你以前的 app key 和 client key（然后写上你自己的密钥和服务器的 url）。

把下面这段代码删掉：

    
    Parse.setApplicationId(“xxxxxxxxxxxxxxxxxxxxxxxx”, clientKey: “xxxxxxxxxxxxxxxxxxxxxxxx”)

替换成：

    
    let config = ParseClientConfiguration(block: {
       (ParseMutableClientConfiguration) -> Void in
       ParseMutableClientConfiguration.applicationId = "xxxxxxxxxxxxxxxxxxxxxxxx";
       ParseMutableClientConfiguration.clientKey = "xxxxxxxxxxxxxxxxxxxxxxxx";
       ParseMutableClientConfiguration.server = "xxxxxxxxxxxxxxxxxxxxxxxx.com/parse";
    });
     
    Parse.initializeWithConfiguration(config);

完成操作后，点击 Run 按钮，测试一下应用。正常情况下应用会和迁移以前一样运行。如果你使用云代码，可能需要修改一下代码，来适应新的 parse 服务器环境。我们会在下一个教程中涉及这个话题。另外，在下一个教程里，我们还会介绍在服务器里托管 Parse 的 dashboard。不过现在而言，你可以继续使用 parse.com 的 dashboard，直到官方彻底关闭服务，也就是 2017 年的一月。

恭喜！你已经成功地在 Heroku 上部署了 parse-server。

## 将 Parse 服务器部署到 AWS

 > 注意：如果你已经将 parse-server 部署到了 Heroku 上，那么就不需要再部署到 AWS 上了，毕竟你的服务器只能使用一个云服务。这部分主要是用来参考。如果你不想使用 Heroku，想使用 AWS，可以继续阅读下面的章节。我会假设你已经阅读过上面 Heroku 部分的教程内容，如果出现同样的设置内容，我不会赘述。
 
Amazon Web Services（AWS）是全球知名的云服务提供商，为科技界许多知名的大型公司提供云服务。实际上，很多大型科技公司都在使用 AWS 的服务，例如苹果公司的 iCloud，Hulu，AirBnb，Lyft，Adobe，Slack （这些都是国外知名的科技公司）等等，这些只是使用 AWS 云存储服务的众多公司中一小部分。

那么，为什么我先介绍 Heroku 呢？不同于 AWS 的是，Heroku 更容易设置。对于大部分的设置，你可以直接进行无需输入账单信息。AWS 则不一样，设置方法比较复杂。为了演示如何部署到 AWS 上，我们将使用另外一个部署按钮和设置向导，来让所有的工作简单流畅。

再次强调一下，如果你已经将应用部署到了 Heroku，而且对 Heroku 的服务比较满意，你可以直接跳过这部分了。然而，如果你对如何部署到 AWS 上感兴趣，那么让我们开始吧！

第一件事，到 [AWS](http://https//aws.amazon.com/) 上注册一个 AWS 帐号，需要提供你的付款信息，这样才能使用免费方案。

完成后，点击下方的按钮，创建一个新的 AWS 应用，AWS 提供一组云服务工具，每个工具都有自己的独特的功能，在本节教程中，我们使用 Elastic Beanstalk（和 Elastic Cloud Compute Engine 或简称 EC2 紧密相关）。

![](http://swift.gg/img/articles/parse-server-installation/687474703a2f2f64302e6177737374617469632e636f6d2f70726f647563742d6d61726b6574696e672f456c61737469632532304265616e7374616c6b2f6465706c6f792d746f2d6177732e706e671463640618.7692928)

 > **什么是 Elastic Beanstalk ？**
 > 根据 Amazon 上的简介，Elastic Beanstalk 是一个易于使用的，用于部署和扩展网页应用和服务，适用的语言有 Java、.NET、PHP、Node.js、Python、Ruby、Go、Docker，例如 Apache、Nginx、Passenger 和 IIS。

 > 是不是很炫酷？或许吧，总而言之，我们将使用这个服务来设置和运行我们的 parse 服务器。如果你想了解更多有关 Elastic Beanstalk 的信息，请参考[官方网页](https://aws.amazon.com/elasticbeanstalk/)。

点击按钮后，会出现一个增加应用名称的界面，如下图。

![](http://www.appcoda.com/wp-content/uploads/2016/03/Screen-Shot-2016-03-28-at-9.07.56-PM-1024x497.png)

下一步，确保你的设置如下图，然后继续。

![](http://www.appcoda.com/wp-content/uploads/2016/03/YATjJlc.png)

在接下来的界面里使用正确的密钥上传 parse 设置，parse 装在 /parse 下。

![](http://www.appcoda.com/wp-content/uploads/2016/03/EdcNda3-1024x340.png)

现在，点击 upload and deploy 按钮，完成最后一步。不出意外应用已经正确设置在 AWS 上了。

当你设置 iOS 应用时，确保你已经定位了 AWS 的 URL，可以在 elastic beanstalk 里找到（如下图）。

![](http://www.appcoda.com/wp-content/uploads/2016/03/OjyvPdc-1024x144.png)

恭喜！你成功将 parse 服务器部署到了 AWS 上！剩下需要做的事情就是用适当的密钥和新的服务器 url 来设置 iOS 应用（后缀 /parse）。

## 结束

在本节教程中，我们深入了解了部署 parse 服务器的过程，估计现在你对部署过程已经掌握的比较牢固了。

注意，有些细节本文没有讨论。如果你使用的是云代码，你可能需要做一些改动才能正常运行。另外，你可能还需要一个 Parse dashboard 的替代品。幸运的是，Parse 团队已经将 [dashboard 开源了](http://blog.parse.com/announcements/introducing-the-parse-server-dashboard/)，并提供了详尽的云代码更新指南。在之后的教程中，我们会详细讨论这些内容。不过现在，你首先要将应用部署到 Heroku 或 AWS 上！

你觉得本教程怎么样？请留下评论，分享你的想法。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。