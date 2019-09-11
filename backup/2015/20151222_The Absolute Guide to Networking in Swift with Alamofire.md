title: "如何在 Swift 中使用 Alamofire 进行网络编程"
date: 2015-12-22
tags: [Swift 进阶]
categories: [AppCoda]
permalink: alamofire-beginner-guide

---
原文链接=http://www.appcoda.com/alamofire-beginner-guide/
作者=gregg mojica
原文日期=2015-11-30
译者=小铁匠Linus
校对=Cee
定稿=numbbbbb

<!--此处开始正文-->

2014 年 6 月 Apple 发布 Swift 以来，如何在 Swift 中进行网络编程一直成为程序猿们关注的焦点。甚至就连 Swift 的作者之一 Chris Lattner 也发推说过，在 Swift 中解析 JSON 还有很长的路要走。因此，许多人开始寻求替代方案。在 Swift 中虽然有处理 JSON 解析的内建类，但是对开发者来说并不是很友好。幸运的是，Alamofire 出现了。Alamofire 是一个可以帮助我们解析 JSON 的强力网络库，它由 Objective-C 中同类网络库 AFNetworking 的作者编写。

在这个又臭又长、近乎 3500 多词（译者注：in English；定稿注：这是作者原话，不是译者观点）的教程中，我们将探讨一系列广泛的网络基本话题，并建立一个假日待办应用。

同时，你会从本教程中学到：如何使用和解析 JSON、如何自定义服务器端、如何使用 [Heroku](https://www.heroku.com/) 和 [MongoLab](https://mongolab.com/) 等工具、HTTP 的工作原理（包括 GET，POST 和 DELETE 请求）、如何使用 git 和终端（terminal）以及如何使用 Cocoapods。如果你觉得上面提到的内容太多了，那就对了，拿一杯咖啡，就让我们开始吧。

<!--more-->

![](https://www.appcoda.com/wp-content/uploads/2015/11/thangiving-app-coda-20151-1024x768.png)

哦，AppCoda 的所有作者祝大家节日开心！😊

注意：本教程是一个进阶教程，涵盖了很多东西。而且，我假设你已经对 iOS 和 Swift 有了很坚实的了解。文章中诸如 tableviews， autolayout，delegate 等话题都不会深入的解释原理。你如果不熟悉这些内容，可以先去学习我们推出的[优秀课程](http://www.appcoda.com/ios-programming-course/)，然后再回来看本教程。

## 开始

为了实现本教程要实现的功能，我已用 Node.js 写了一个服务器后端。这里需要给那些对它不熟悉的人解释一下，Node.js 是一个基于 Javascript、运行在 Google Chrome 的 V8 引擎中的运行时环境。长话短说，总之它是一个特别可靠、速度特别快、特别厉害的东西，哈哈。

为了搞定这个后端，我同时也使用了 Restify 和 MongoDB。MongoDB 是在 Web 开发人员中很流行的一个 no-SQL 数据库。我们可以使用 MongoDB 存储所有数据。

我刚开始使用 Node 时，完全不知道这些东西是怎么运行的，我看到的其他博客也没有解释 Node 到底是怎么工作的。因此，尽管这是个 iOS 的博客，但我还是要介绍一下 Javascript 和 Node 服务器的工作原理。

我搜遍了网络，都没有一个详细的教程引导你创建一个 API 与 iOS 应用程序交互的步骤，直到本文出现。

## 遇见 Node.js

像我之前说的那样，Node.js 是一个很强大的服务器端开发技术，它建立在 Chrome 的运行时环境上。因此，它是高度异步和非阻塞的（如果你不知道我说的是什么意思，其实很简单，大概就是：使用主线程或者应用的主要部分不会被阻塞）。多线程是一种可以防止延迟且能提高项目效率的编程技术。你可以把应用想象成一条高速公路，如果只有一条通道，却有 20 辆车要通过，那么他们就很有可能会堵车。如果一条高速公路有三条包含出入口的通道，那么堵车的可能性就很小。多线程就可以这样来理解。在一个多线程的环境里，代码执行在不同的线程就可以避免应用阻塞，从而防止程序崩溃。

![](http://www.appcoda.com/wp-content/uploads/2015/11/1436439824nodejs-logo.png)

Node 是由 Joyent 开发并维持的，Joyent 是一家位于旧金山的云计算公司。

如果你仍然不清楚所有这些是怎么运行的，想想后端具体干了些什么吧。下面是后端完成的工作：

1. 后端提供了 API 路由（我们现在正在为当前的应用构建 API，就和网络上其他的 API 一样，其中包括了我们在之前的 [tvOS 教程](http://www.appcoda.com/tvos-introduction/)中使用的 [forecast.io](http://forecast.io/) API）。
2. MongoDB 用来保存所有数据。当你想要 POST 一条新消息时，我们需要找个地方来存储这条消息。在本教程中，我们把这些数据存储到 MongoDB 数据库中。
3. 创建一个功能完整的 REST API，它遵循 REST 协议。

我们的 MongoDB 放在 MongoLab 的主机上，Node 服务器放在 Heroku 上。Heroku 由 Salesforce 提供支持，可以作为 Node、Rails、Python 等应用的主机服务商。MongoLab 也是一家可以当 MongoDB 主机的服务商。

## HTTP 请求介绍

在我们开始写代码之前，你应该了解 HTTP 请求以及如何在我们的应用里使用。

* GET 请求 - GET 请求会查询我们的数据库，然后获取内容。GET 请求可以获取一个、多个或全部的内容。事实上，每次你访问 [google.com](http://google.com/) 或浏览你的 Facebook/Twitter 主页，你都会发起 GET 请求（可能你之前都不知道这个东西）！

* POST 请求 - POST 请求会发送数据到服务器，然后保存这个数据。举个例子，当你在 Facebook 或 Twitter 上写好文字，然后按 Post/Tweet 按钮的时候，你就发起了 POST 请求。

* UPDATE 请求 - UPDATE 请求可以让你修改已经存在的内容。当你编辑一条 Facebook 消息时，其实使用到了 UPDATE 请求。

* DELETE 请求 - DELETE 请求会删除对应的内容。当你按了删除按钮删除 Facebook 或 Twitter 消息的时候，其实是调用了 DELETE 请求。

以上这四个请求类型是基于 REST 协议的。Internet 能运行就是由这些请求组成的。你可能也听说过 CRUD 这个缩写词，CRUD 是由 **C**reate，**R**ead，**U**pdate 和 **D**elete 的首字母组成的。很显然，这些单词就和 POST，GET，UPDATE 和 DELETE 是一一对应的。

帅气！现在我们已经对 HTTP 协议有一定的理解了，我们可以进入到这次教程的核心部分了。

## 配置必要的工具

在我们使用 MongoLab 或 Heroku 之前，我们应该要确保 Node.js 能正常使用。

打开 [Node.js官网](https://nodejs.org/en/)，按照教程下载 Node 到你的电脑上。

然后，到 [npm 官网](https://docs.npmjs.com/getting-started/installing-node)下载 npm。

为了正确配置我们的后端，需要分别在 Heroku 和 MongoLab 上注册帐号。我们先从 MongoLab 开始吧，去 [MongoLab 官网](https://mongolab.com/home)注册帐号。

![](https://www.appcoda.com/wp-content/uploads/2015/11/Untitled-1024x640.png)

确保选择的是 single-node（免费），填上你数据库的名字。我这边取名为 *alamofire-db*（以 db 为后缀表示是一个数据库，这是比较普遍的命名规范）。

![](https://www.appcoda.com/wp-content/uploads/2015/11/Untitled2-1024x640.png)

接下来，登录你的数据库，定位好 MongoDB 数据库的 URI。

![](https://www.appcoda.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-26-at-2.35.58-PM-1024x328.png)

然后添加一个新的数据库帐号，输入用户名和密码。不要忘记密码。

![](https://www.appcoda.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-26-at-2.38.15-PM-1024x478.png)

现在返回到你设置 URI 的页面，修改成新的地址。比如：

```
mongodb://<dbuser>:<dbpassword>@ds057954.mongolab.com:57954/alamofire-db
```

替换成：

```
mongodb://gregg:test@ds057954.mongolab.com:57954/alamofire-db
```

MongoLab 搞定！

现在去 [Heroku.com](http://heroku.com/)，免费注册后，打开 [heroku toolbelt 页面](https://toolbelt.heroku.com/)。

按照教程成功安装后，打开终端并登录 heroku。如果你之前从未使用过终端，不用担心。本教程会多次使用终端，这样你最终就会对终端的使用有一个清晰的认识。

一旦你在终端上登录 heroku，就可以使用 cd 命令（cd 代表改变目录）进到对应目录，将之前从 dropbox 下载的工程文件夹移动进去。

![](https://www.appcoda.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-26-at-3.03.13-PM-2.png)

按下回车键就可以执行这行命令了。干的不错，现在我们可以用 **git** **提交（Push）**东西到 heroku 了。

在终端中键入以下命令：

```bash
git init
git add .
git commit -m "First Commit"
```

这三行命令，初始化了一个仓库（repository，简写为 repo），并添加了当前目录下的所有文件到这个仓库，最终提交并保存。

git 是一款很流行的版本控制软件。

现在你可以看到，终端里应该和下图的内容差不多：

![](https://www.appcoda.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-26-at-3.09.42-PM-2.png)

因为你之前已经成功安装了 heroku toolbelt，所以你现在可以在终端里键入 *heroku login*，并输入帐号密码。敲回车后继续，如果帐号密码没问题的话，你的 Email 会以蓝绿色高亮显示。

现在，键入 **heroku create** 来创建一个新的 heroku 应用。Heroku 会创建一个新的带有域名的应用给你。比如，我的就是 https://whispering-plains-1537.herokuapp.com/。

![](https://www.appcoda.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-26-at-3.50.39-PM-2.png)

现在，键入 **git push heroku master** 来把你新建的应用发送到 heroku。

如果一切顺利的话，会显示如下图（其中的某一些设置可能会不同）。

![](https://www.appcoda.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-26-at-5.06.08-PM-2.png)

## 使用 Node.js, Express, MongoLab & Mongoose

让我们从下载示例工程开始，[链接在这里](https://www.dropbox.com/sh/hvvneknq4hh7ntw/AAARljJGt3OLLjQRmIMxDsIHa?dl=0)。打开你最喜欢的文本编辑器（我这边用的是 Sublime Text 2；可以在[这里](http://sublimetext.com/)下载免费版，如果你支持的话也可以购买），然后继续。

Javascript 在很大程度上是和 Swift 很相似的。我们之后会使用 express 和 mongoose 两个著名 node 包。请确保你已经在系统上安装 npm 和 node 包管理器。

Express 是 [Node.js](http://nodejs.org/) 中的一个「快速、强大而又轻量级」的网络框架，它可以轻松解决路由（Route）问题。你问什么是路由？路由就是你与网络交互的方式。每次你打开 google.com 的时候，其实你访问的是根主页，即 google.com/。假如你访问 google.com/hello，那就是另外一个路由了。我们接下来将要定义一个能访问我们数据库的路由。

![](https://www.appcoda.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-26-at-5.11.44-PM-2-1024x576.png)

你可以从 expressjs.org 官网上学习更多关于 express 的知识。

下面是示例代码：

```javascript
var express = require('express'); // 1
var app = express(); // 2
// 当一个 GET 请求访问主页的时候，会返回 hello world
app.get('/', function(req, res) { // 3
  res.send('hello world'); // 4
});
```

第一行代码设置了一个叫 express 的变量。第二行代码，把 express 初始化后赋值给一个叫 app 的变量。在第三行代码，app 这个变量代表了 express 环境，调用它的 get() 方法（形式类似 Swift）。当一个用户访问 / 根主页的时候，就会显示「hello world」。这是 express 作为路由的一个例子。如果需要更多信息，可以访问 [express 官网](http://expressjs.com/guide/routing.html)查看。

现在，我们已经配置好了 mongo 数据库的环境，接下来让我们来使用 cURL 请求测试一下功能。cURL 是一款命令行程序，它可以发送 HTTP 请求。我们将会先使用 cURL 做一下实验，然后再迁移到 Alamofire 去。

## JavaScript 介绍

### 模型

打开你的文本编辑器（再说一下，我用的是 Sublime），同时打开 app.js 文件。正如你看到的，应用被分割成了一个 model 和路由文件（就是你刚打开的 app.js 文件）。model 文件可以建立模式（schema）或数据库结构。让我们先来简单看看这个文件吧。

```javascript
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
var TodoSchema  = new Schema(
    {
  name: String
});
 
mongoose.model('employees', TodoSchema);
```

我们可以使用 mongoose，它是一个用在应用与 mongo 之间作为接口的 npm 包。我起初在构建一个雇工跟踪应用，并把 model 命名为 employee，但是可能会随时修改这个 model。我保留着它，是因为这个教程的接下来部分可能会用到。

![](https://www.appcoda.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-27-at-12.48.53-AM-1024x640.png)

Mongoose 能很方便的提供与 mongoLab 的 heroku node 应用连接并提供相应的接口。这的确非常方便。

### 路由

路由文件里存的是我们将会*输出*到 app.js 文件的内容。不用太担心这个输出——它是 node 中一个比较先进的特性，也超出了本教程的范围。

![](https://www.appcoda.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-27-at-12.53.18-AM-1024x640.png)

注意第 26 行的 *newTodo*。正如你可能猜到的，这行代码创建了一个新的 todo。

```javascript
var emp = new Todo(req.body);
 
    emp.save(function(err){
        if (err) {
            res.send('Error occurred');
            return console.log(err);
        }
        res.send(emp);
});
```

我们把 Todo 对象（在第四行定义了一个与 mongoose 连接的对象）赋值给一个叫 emp 的变量，并设置 req.body（req 代表请求，它会发送给我们数据，同时，res 代表回复，它会返回我们的要返回的东西）。

随意浏览一下文件中剩下的方法。

### 就像粘稠的胶水——App.js

现在回到 app.js 文件，这里是整个应用的主要部分。接下来列出来一些这个文件里的重点部分（译者注：对照下图看）：

* 第 13 行代码建立 express 应用
* 第 15 - 22 行代码配置该应用
* 第 33 行代码使用 mongoose 将应用连接到 mongoLab 数据库
* 第 35 行代码建立连接
* 第 41 - 45 行代码建立应用的路由文件并连接到 /routes/todo.js 文件
* 第 48 行代码创建服务器

![](https://www.appcoda.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-27-at-12.59.54-AM-1024x640.png)

以上这些，能让你了解到一些 Javascript 应用的基本运作知识。但是，毕竟这篇教程不是主讲 Javascript 的，我不会继续深究。当然，我还是鼓励你们去研究一下 express 和 mongoose。

## 使用 cURL

在我们的 node 应用开启状态下，我们可以执行一些 cURL 请求来做测试。一旦我们做完测试，就可以迁移到 Alamofire 上去了。

### GET 请求

在终端里执行下面的代码（记得将 url 修改成你自己对应的 heroku url）。

```bash
curl -i -H "Accept: application/json" "https://rocky-meadow-1164.herokuapp.com/todo"
```

命令行中的 -i 和 -H 参数表示我们将要接收什么东西。我们会接收 JSON 并将 JSON url 追加到请求的末尾。

![](https://www.appcoda.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-26-at-6.00.45-PM-2.png)

你应该能看到有数据返回了。和下图差不多。

![](https://www.appcoda.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-26-at-6.00.49-PM-2.png)

正如你看到的，返回的数据就是我们想要得到的。如果你已经将 url 替换成你自己的，你可能什么也看不到，因为你的 mongodb 里现在还没数据。

### POST 请求

加入你想要加一些数据到数据库里，你需要的就是下面的 POST 命令。

```bash
curl -H "Content-Type: application/json" -X POST -d '{"name":"Buy Presents"}' https://rocky-meadow-1164.herokuapp.com/todo
```

![](https://www.appcoda.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-26-at-6.05.01-PM-2.png)

然后，你使用之前讲过的 GET 请求，就可以看到你刚才添加的「Buy Presents」的内容了。

![](https://www.appcoda.com/wp-content/uploads/2015/11/s.png)

### DELETE 请求

```bash
curl -X DELETE 'https://rocky-meadow-1164.herokuapp.com/todo/5657901fee93910900cc54ed'
```

![](https://www.appcoda.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-26-at-8.21.40-PM-2.png)

很棒！这里我们不会讲 PUT 请求，因为在这个应用里暂时还用不上。但是它和其他的请求使用起来差不多。

## 使用 Alamofire 设置 iOS 应用

![](https://www.appcoda.com/wp-content/uploads/2015/11/alamofire.png)

让我们从新建一个名叫 TodoApp 的 Xcode 工程开始吧。因为假期就要到来，我们应该有一种方式来跟踪这件事情。幸运的是，我们有 node 应用来帮忙。

你可以手动安装 Alamofire（通过拖拽源文件到对应工程的方法），但是我们选择使用 Cocoapods。Cocoapods 是一款为 iOS 工程提供依赖管理的工具。在使用 Cocoapods 的时候，开发者可以轻松的添加框架或第三方类库。如果你之前没有使用 Cocoapods，强烈推荐你去使用。

接下来，在终端里运行以下命令可以确保你在接下来的步骤后成功安装 Cocoapods。

``` bash
$ gem install cocoapods
```

然后，通过 cd 命令进入你工程所在的目录，键入以下命令。

```bash
vim Podfile
```

Vim 是一款系统自带的命令行编辑器，与 Sublime Text 或 TextMate 类似。我们现在要新建一个 Podfile 的文件，Cocoapods 每次都会去这个文件里查询是否需要更新工程的 pod（包括各种的依赖）。

![](https://www.appcoda.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-26-at-8.32.03-PM-2.png)

在 Podfile 这个文件里键入如下内容：

```ruby
source 'https://github.com/CocoaPods/Specs.git'
 
platform :ios, '8.0'
 
use_frameworks!
 
pod 'Alamofire', '~> 3.0'
```

然后，按 ESC 键，并输入 `:wq`，再敲回车。其中，wq 表示保存并退出。

我们现在已经成功创建 Podfile 并且保存了，为了安装 CocoaPods，在终端里输入以下命令：

```bash
pod install
```

敲了回车后，如果一切都设置好的话，大概会呈现下图显示的内容。

![](https://www.appcoda.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-26-at-8.38.01-PM-2.png)

这时候，你可以看到命令行里要求你关闭当前打开的 Xcode 并且以后都用 .xcworkspace 为后缀的文件来打开工程。

下面这个命令能够非常方便地打开当前目录的 finder 界面。到此为止我们在 Terminal 中的操作就那么多，看上去一天之内有那么多就够了！

```bash
open .
```

打开 ViewController.swift，让我们继续吧。

### Alamofire GET 请求

在打开的 ViewController.swift 里，输入以下代码来导入 Alamofire：

```swift
import Alamofire
```

在 viewDidLoad() 方法里键入以下代码来使用 Alamofire。

```swift
Alamofire.request(.GET, "https://rocky-meadow-1164.herokuapp.com/todo") .responseJSON { response in // 1
      print(response.request)  // original URL request
      print(response.response) // URL response
      print(response.data)     // server data
      print(response.result)   // result of response serialization

      if let JSON = response.result.value {
         print("JSON: \(JSON)")
        }
}
```

在第一行代码中，我们声明了一个 GET 请求，并且传入了一个我们需要的 URL。运行当前的应用，看看返回的是什么。如果一切都设置正确的话，你会看到返回的是 JSON 数据。

现在，打开 Main.storyboard，添加一个 tableview 到 view controller，并将视图控制器嵌入到 navigation controller。你的 storyboard 现在看起来应该跟我的一样，如下图（值得注意的是，现在返回的 JSON 数据还只是显示在控制台上，我们要将其显示出来。）。

![](https://www.appcoda.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-26-at-9.38.31-PM-2-1024x576.png)

将以下代码复制并粘帖到你的 ViewController.swift 文件里。

```swift
import UIKit
import Alamofire
class ViewController: UIViewController {
 
    @IBOutlet weak var tableView: UITableView!
    var jsonArray:NSMutableArray?
    var newArray: Array<String> = []
 
    override func viewDidLoad() {
        super.viewDidLoad()
        
        Alamofire.request(.GET, "https://rocky-meadow-1164.herokuapp.com/todo") .responseJSON { response in
                print(response.request)  // original URL request
                print(response.response) // URL response
                print(response.data)     // server data
                print(response.result)   // result of response serialization

                if let JSON = response.result.value {
                    self.jsonArray = JSON as? NSMutableArray
                    for item in self.jsonArray! {
                        print(item["name"]!)
                        let string = item["name"]!
                        print("String is \(string!)")

                        self.newArray.append(string! as! String)
                    }

                    print("New array is \(self.newArray)")

                    self.tableView.reloadData()
                }
        }



        // Do any additional setup after loading the view, typically from a nib.
    }
}
```

我初始化了两个数组 jsonArray 和 newArray，用 for 循环遍历了返回数据的那个 jsonArray，将其中的每个数据保存到 newArray 中。

![](https://www.appcoda.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-26-at-10.08.34-PM-2.png)

我使用 POST cURL 请求在数据库里多添加了一些数据。用法类似，不再赘述。

你可以试试下面代码演示的 GET 请求的极致精简写法。

```swift
Alamofire.request(.GET, "https://rocky-meadow-1164.herokuapp.com/todo").responseJSON { response in debugPrint(response) }
```

接下来，在文件顶部的 UIViewController 定义后面添加 UITableViewDelegate 和 UITableViewDataSource，并在 viewDidLoad() 方法里键入如下代码：

```swift
self.tableView.dataSource = self
self.tableView.delegate = self
```

最后，添加 UITableView 的 delegate 方法。

```swift
func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return self.newArray.count
}

func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
    let cell = tableView.dequeueReusableCellWithIdentifier("Cell", forIndexPath: indexPath) as UITableViewCell

    cell.textLabel?.text = self.newArray[indexPath.row]
    return cell
}

override func didReceiveMemoryWarning() {
    super.didReceiveMemoryWarning()
    // Dispose of any resources that can be recreated.
}
```

![](https://www.appcoda.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-26-at-10.16.39-PM-2-1024x576.png)

正如你看到的，我们的 tableview 已经成功显示数据了。

现在我们来添加一个按钮，用来添加数据到列表中。首先，先在 storyboard 里添加一个叫 AddViewController 的类，并用 segue 的方式连接起来。你的 storyboard 应该和下图差不多。

![](https://www.appcoda.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-26-at-11.34.59-PM-2-1024x576.png)

### Alamofire POST 请求

在你的 AddViewController.swift 文件里，为 textfield 建立一个 IBOutlet（命名为 textView），为 Save 按钮建立一个 IBAction。在 Save 按钮代码中键入如下代码：

```swift
Alamofire.request(.POST, "https://rocky-meadow-1164.herokuapp.com/todo", parameters: ["name": self.textView.text!])

self.navigationController!.popViewControllerAnimated(true)
```

如你所见，Alamofire 大大简化了发送 POST 请求的过程。

接下来，我们来对 ViewController.swift 文件进行重构，确保我们在保存数据后能及时更新列表。删除 viewDidLoad() 方法里 GET Alamofire 的代码，用以下的 downloadAndUpdate 方法代替。

```swift
func downloadAndUpdate() {
        Alamofire.request(.GET, "https://rocky-meadow-1164.herokuapp.com/todo") .responseJSON { response in
            print(response.request)  // original URL request
            print(response.response) // URL response
            print(response.data)     // server data
            print(response.result)   // result of response serialization

            if let JSON = response.result.value {
                self.jsonArray = JSON as? NSMutableArray
                for item in self.jsonArray! {
                    print(item["name"]!)
                    let string = item["name"]!
                    print("String is \(string!)")

                    self.newArray.append(string! as! String)
                }
                print("New array is \(self.newArray)")
                self.tableView.reloadData()
            }
        }

    }
```

现在，在 viewWillAppear() 方法里调用这个方法，如下。

```swift
override func viewWillAppear(animated: Bool) {
   self.downloadAndUpdate()
}
```

如果你再次编译并运行这个应用，就会发现每次添加新的 todo 后都会重新加载。这是为什么呢？

这就关系到 view controller 的生命周期，这里我简单介绍一下。viewDidLoad() 会在 view 初始化后并且所有控件都结束加载后被调用。问题出现了，当你从已经加载的 ViewController 上加载另外一个 view（比如 AppViewController）时，viewDidLoad 方法不会被调用（之前已经初始化过）。viewWillAppear 方法会在每次 view 在屏幕上显示时调用。因为我们需要在再次显示 ViewController.swift 时候显示，所以这个方法刚好可用。

### Alamofire DELETE 请求

现在在刚才的 newArray 下面添加一个 IDArray。

```swift
var IDArray: Array<String> = []
```

接下来，更新 downloadAndUpdate 方法的相应部分，代码如下。

```swift
self.newArray.removeAll() // NEW
self.IDArray.removeAll() // NEW

Alamofire.request(.GET, "https://rocky-meadow-1164.herokuapp.com/todo") .responseJSON { response in
            print(response.request)  // original URL request
            print(response.response) // URL response
            print(response.data)     // server data
            print(response.result)   // result of response serialization

            if let JSON = response.result.value {
                self.jsonArray = JSON as? NSMutableArray
                for item in self.jsonArray! {
                    print(item["name"]!)
                    let string = item["name"]!
                    let ID = item["_id"]! // NEW

                    self.newArray.append(string! as! String)
                    self.IDArray.append(ID! as! String) // NEW
                }
                print("New array is \(self.newArray)")
                self.tableView.reloadData()
            }
        }
```

两行带有 NEW 注释的代码是新添加的。从代码的本质上来说，我们在循环中获得对应的 ID 并保存到数组 IDArray 中。同样，我们也需要将不需要的数据从列表中删除并重置。

添加 commitEditingStyle 方法，以调用 DELETE 请求来删除对应的不需要数据。

```swift
func tableView(tableView: UITableView, commitEditingStyle editingStyle: UITableViewCellEditingStyle, forRowAtIndexPath indexPath: NSIndexPath) {
        if editingStyle == .Delete {
            print("ID is \(self.IDArray[indexPath.row])")

            Alamofire.request(.DELETE, "https://rocky-meadow-1164.herokuapp.com/todo/\(self.IDArray[indexPath.row])")
            self.downloadAndUpdate()
            
        } else if editingStyle == .Insert {
            // Create a new instance of the appropriate class, insert it into the array, and add a new row to the table view
        }
    }
```

正如你看到的，以上代码遵循了我们应用的 API，即通过传入 /todo/ID 来调用 DELETE 请求删除对应的数据。

同时，我们用比较简单的 Alamofire 方法来调用 DELETE 请求并删除了对应的数据。

至此，你现在已经拥有了一个功能完备的 todo 应用了。因此，让我们来总结一下本次教程吧。

## 小结

本教程探索了很多东西。从 Javascript 的 node 到 express，从 MongoDB 到 cURL，从终端到 Cocoapods，以及最后的 Alamofire，我们深入了解了 REST API 的创建过程和网络的工作流程。你通过本次教程应该已经坚实的掌握了以下内容：

* 构建 API
* 部署 API
* 写客户端应用
* 使用 HTTP 请求
* 使用 Cocoapods
* 使用 cURL
* 使用 node 和 MongoDB/Express
* 使用 Express 做路由
* 使用 Alamofire

这真是一个大教程，我感谢你坚持和我走到这里。所有的源代码可以在[这里](https://www.dropbox.com/sh/axho3cgfvinz9lc/AADXjhAPwATsbZBA-z9mVLn4a?dl=0)下载，其中包含了 node 应用和 iOS 应用。

有任何问题和想法都可以在教程下面留言评论。下次见！