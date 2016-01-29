tvOS 入门：开发你的第一个 tvOS 应用"

> 作者：gregg mojica，[原文链接](http://www.appcoda.com/tvos-introduction/)，原文日期：2015-11-02
> 译者：[pmst](http://www.jianshu.com/users/596f2ba91ce9/latest_articles)；校对：[numbbbbb](https://github.com/numbbbbb)；定稿：[numbbbbb](https://github.com/numbbbbb)
  








上月在旧金山举办的苹果发布会中,苹果公司发布了第四代苹果电视。然而，此次更新不同于以往任何版本，苹果新电视将允许用户从 App Store 下载应用和游戏。

这样的声明无疑给开发者打了一剂鸡血。新苹果电视中，位于 Cupertino(译者注:苹果电脑的全球总公司所在地，位于美国旧金山)的巨人介绍了一个新的操作系统，有别于 iOS 系统，新系统名为 tvOS。tvOS 基于 iOS 开发，有少许改动。 我们将使用通用框架和你最喜欢编程语言(当然是 Swift 喽，毫无疑问！)来编写几个简单应用，初步了解 tvOS。



![image](http://www.appcoda.com/wp-content/uploads/2015/10/IMG_3302-1024x683.jpg)


## 了解 tvOS


tvOS 基于 iOS 系统开发而成。你使用的许多框架可能都适用于 tvOS。然而，苹果删除了几个 iOS 框架，使得 tvOS 独一无二 (最有名的就是 WebKit)。

苹果支持两种类型的 tvOS 应用程序。第一个是传统的应用程序-这类应用程序会打包代码和图片等等资源。这基本上与 iOS 或 OS X 应用程序一样。tvOS 新增对**client-server(客户端-服务器)**应用的支持，即第二种类型。**client-server**应用程序简单地把服务器请求和网络开发过程集中到应用中来。换句话说，这些应用可以同常见的数据库，服务器等交互。例如，如果你使用 Node.js(一款基于 Chrome V8 引擎开发的 JavaScript 框架)实现了后端，接着你可以考虑使用**client-server**技术，使它更易于管理应用程序(即我们的客户端)和后端(又称之为服务器)。**client-server**应用程序可以直接与 JavaScript 进行交互。然而，由于这些应用程序比较特别，在本教程中我们将不讨论**client-server**应用程序，重点介绍传统应用的开发。

请将这些概念牢记于心，开始我们的教程!


## 必备条件

在本教程中，我假设你已经了解常见的 iOS 框架、术语和网络知识。 我将在整个教程中使用 storyboard 进行讲解，希望你知道如何使用 storyboard。同样，我不会对 storyboard 中一些常见的操作做详细深入地讲解(例如改变背景颜色，修改对象尺寸等等)。如果你对 storyboard 还不太了解或者还只是个 iOS 的初学者，我建议你去 AppCoda 教程网站先学习下，再回过头来学习本教程。

开发环境为 Xcode7.1 以上。当然最好还是在苹果电视真机上进行调试(译者表示呵呵)，当然模拟器也足够了。


## 创建一个新的 tvOS 工程

为了开发 tvOS 应用，你必须在你的 Mac 上安装 Xcode7.1。Xcode7.1 内置了 tvOS SDK,除此之外还有 iOS9.1 以及 Swift2.1。

启动 Xcode,创建一个新工程，选中一个新的 tvOS 应用。在右侧面板，选中击 Single View Application 并点击 next。

![image2](http://www.appcoda.com/wp-content/uploads/2015/10/Screen-Shot-2015-10-31-at-11.07.02-PM-1024x732.png)

接着为新应用命名。对于第一个应用来说，我们习惯以一个 Hello World App 作为教程的开始。命名该工程为 HelloWorld，接着点击创建并选择项目存储位置。


## Hello, tvOS

由于 tvOS 继承自 iOS，许多你熟悉的 iOS 开发基本概念在 tvOS 中都适用。

在你的 Main.storyboard 文件中，添加一个 button，将 title 修改为“Click Me!”，接着在其下方添加一个标签 label,如下所示：

![image3](http://www.appcoda.com/wp-content/uploads/2015/10/Screen-Shot-2015-10-31-at-11.26.45-PM-1024x558.png)

注意到 tvOS 中的按钮与 iOS 的按钮稍有不同。此外，当你添加多个按钮时，苹果已经允许用户在按钮间无缝切换，比如向右，向左，向上或向下滑动。开发者只需要在 storyboard 中为按钮布局来利用该特性(稍后详述)。

和 iOS 一样，我们通过 control-drag 标签(label)和按钮(button)来创建 IBOutlet 以及 IBAction。这里分别命名 outlet 为 myLabel，IBAction 为 buttonPressed。

![](http://www.appcoda.com/wp-content/uploads/2015/10/Screen-Shot-2015-10-31-at-11.32.31-PM-1024x647.png)


在 buttonPressed 动作中，请键入如下代码行:

    
    self.myLabel.text = "Hello,World"

你应该很熟悉这行代码了。如果你不熟悉，上述代码实现了点击按钮，为标签(label)的 text 字段赋值"Hello,World"字符串值。

请在模拟器中运行应用。


你可能想要通过鼠标来点击按钮，但与模拟器中的 iOS 应用不同，苹果电视未配备触摸屏，仅仅依靠一个遥控器罢了。因此，单击Hardware >Show Apple TV Remote 或者 Command + Shift + R 快捷键显示遥控器。通过遥控器实现按钮的点击，你的第一个 tvOS 应用就此完成了！
![](http://www.appcoda.com/wp-content/uploads/2015/10/Screen-Shot-2015-10-31-at-11.58.52-PM-1024x575.png)


## 猜谜游戏 App

接下来,我们将使用现有的 tvOS 知识开发一款简单的猜谜应用。这将是一个非常基本的猜谜应用(只有一个问题),这个迷你项目主要是像你展示按钮和遥控器之间是如何交互的。在接下来的项目中，我们将探索更多有关控制 tvOS 的知识。

再次启动 Xcode，依葫芦画瓢创建一个新的 tvOS 项目。不过请重新命名项目名称。

模仿我下面的布局做一些 storyboard 的基础操作。

![](http://www.appcoda.com/wp-content/uploads/2015/10/Screen-Shot-2015-11-01-at-12.14.40-AM-1024x564.png)

如果你不确定我是如何实现的，下面是我使用的组件的列表:

1. 4 个 UIButton，尺寸为 960 X 325
2. 1 个 UILabel，尺寸为 1400 X 120


接着为 4 个按钮添加 text 并更改它们的背景颜色，均在 storyboard 完成(任何 iOS 应用都可以这么实现)。

![](http://www.appcoda.com/wp-content/uploads/2015/10/Screen-Shot-2015-11-01-at-12.21.16-AM-1024x564.png)

像以前一样,让我们将这些按钮绑定到代码中。为了代码简洁和易于理解,我将创建 4 个 IBAction(虽然这并不一定是最优雅的解决方案,但它是最简单的)。

将这些按钮逐一连接到 ViewController.swift 文件中(通过拖拉方式创建 IBAction)，暂且命名为 :button0Tapped、button1Tapped、button2Tapped 和 button3Tapped，你可以随时修改这些名称。

上面图片中显示的 label 内容是询问加州的首府是哪个。给出四个选项供你选择(有关加州首都的知识)，答案是 Sacramento。其中 button1Pressed 动作响应 Sacramento 按钮的点击事件。

根据点击的按钮,我们想向用户显示一个警告信息,告知他们选择了正确还是错误的按钮。接着我们创建一个名为 showAlert 的函数来处理这件事,让我们的代码 DRY(DRY 是 Don't Repeat YourSelf 的缩写，对于软件工程师来说这是惯例用法，确保代码可重用性和可维护性)。

    
    func showAlert(status: String, title:String) { // 1
            let alertController = UIAlertController(title: status, message: title, preferredStyle: .Alert) // 2
            let cancelAction = UIAlertAction(title: "Cancel", style: .Cancel) { (action) in //3 
            }
            alertController.addAction(cancelAction)
            
            let ok = UIAlertAction(title: "OK", style: .Default) { (action) in
            } // 4
            alertController.addAction(ok)
            
            self.presentViewController(alertController, animated: true) { // 5
            }
        }

上述函数接受两个参数，一个是用户的输入状态(表面他们回答问题的正确或者错误)，以及警告提示框中要显示的信息或者标题。


第二行创建并初始化一个新的 UIAlertController 对象。第三和第四行代码为 alert 警告框添加一个 cancel 取消按钮和 ok 确认按钮，第五行代码用于呈现这些内容。

如果你不确定这段代码是如何工作的,我强烈建议你先看看[UIAlertController](http://www.appcoda.com/uialertcontroller-swift-closures-enum/)教程,这里提供了有关该类的详细信息。

现在，请在不同的 IBActions 中调用这个方法。

    
    @IBAction func button0Tapped(sender: AnyObject) {
            showAlert("Wrong!", title: "Bummer, you got it wrong!")
    }
    // 这是唯一正确的
    @IBAction func button1Tapped(sender: AnyObject) {
        showAlert("Correct!", title: "Whoo! That is the correct response")
    }
    @IBAction func button2Tapped(sender: AnyObject) {
        showAlert("Wrong!", title: "Bummer, you got it wrong!")
    }
    @IBAction func button3Tapped(sender: AnyObject) {
        showAlert("Wrong!", title: "Bummer, you got it wrong!")
    }

正如你所看到的，仅在 button1Tapped 函数中传入“Correct”的标题，剩下都传入“Wrong”。

你的代码应该看起来和下面的代码一样。

    
    import UIKit
     
    class ViewController: UIViewController {
     
        override func viewDidLoad() {
            super.viewDidLoad()
            // Do any additional setup after loading the view, typically from a nib.
        }
     
        override func didReceiveMemoryWarning() {
            super.didReceiveMemoryWarning()
            // Dispose of any resources that can be recreated.
        }
     
        @IBAction func button0Tapped(sender: AnyObject) {
            showAlert("Wrong!", title: "Bummer, you got it wrong!")
        }
        @IBAction func button1Tapped(sender: AnyObject) {
            showAlert("Correct!", title: "Whoo! That is the correct response")
        }
        @IBAction func button2Tapped(sender: AnyObject) {
            showAlert("Wrong!", title: "Bummer, you got it wrong!")
        }
        @IBAction func button3Tapped(sender: AnyObject) {
            showAlert("Wrong!", title: "Bummer, you got it wrong!")
        }
        
        func showAlert(status: String, title:String) {
            let alertController = UIAlertController(title: status, message: title, preferredStyle: .Alert)
            
            let cancelAction = UIAlertAction(title: "Cancel", style: .Cancel) { (action) in
            
            }
            alertController.addAction(cancelAction)
            
            let ok = UIAlertAction(title: "OK", style: .Default) { (action) in
            }
            alertController.addAction(ok)
            
            self.presentViewController(alertController, animated: true) {
            }
        }
    }

在模拟器中运行你的应用。如果一切顺利，你应当会看到类似下面的截图。

单机遥控器，选中 Cupertino 选项

![](http://www.appcoda.com/wp-content/uploads/2015/10/Screen-Shot-2015-11-01-at-12.49.37-AM-1024x552.png)

你应该看到弹出一个 UIAlertController。

![](http://www.appcoda.com/wp-content/uploads/2015/10/Screen-Shot-2015-11-01-at-12.49.27-AM-1024x557.png)

不幸的是，模拟器并不支持 swiping，因此你可能需要在真机中测试成功的 alert 警告框。不过，你可以在模拟器(遥控)中通过按住 option 键 swipe 选项。在 Apple TV 真机中，你能够在所有按钮中无缝切换。

![](http://www.appcoda.com/wp-content/uploads/2015/10/Screen-Shot-2015-11-01-at-12.53.00-AM-1024x575.png)

恭喜！ 你已经完成了第二个项目。

## 在 tvOS 中使用 TableViews

在 iOS 操作系统中，苹果大量使用 tableview。事实上，苹果在许多自家应用(包括信息、联系人等)都使用了它。随着 watchOS SDK 的发布，tableview 可用于 Apple Watch 开发。自然地，新的苹果电视和 tvOS 同样支持这个流行的 API。

依葫芦画瓢创建一个新的工程项目，命名为 TableViewPractice。

和先前创建的工程一样，Xcode 默认自动生成 ViewController.swift 文件。请在文件的第 11 行代码处添加如下声明(译者注:就是让 ViewController 遵循两个 tableView 的协议)：

    
    UITableViewDataSource, UITableViewDelegate

第 11 行的代码应该看起来这样:

    
    class ViewController: UIViewController, UITableViewDataSource, UITableViewDelegate {

由于 Swift 是一门注重安全的语言，编译器会报告说没有遵循 UITableView 的 Datasource 和 Delegate 协议。我们会很快解决这个问题。

接着在 storyboard 中添加一个 tableView 视图并拖拽到 ViewController 文件中生成一个 IBOutlet，将其命名为 tableView。同时在这个 IBOutlet 声明下方新增一个数组。

    
    var dataArray = ["San Francisco", "San Diego", "Los Angeles", "San Jose", "Mountain View", "Sacramento"]

数组囊括了所有我们要在 tableView 显示的元素。

现在请在v iewDidLoad 方法的下方添加如下代码：

    
    // section数量
    func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        return 1
    }
    // 每个section的cell数量    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return self.dataArray.count
    }
    // 填充每个cell的内容    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = UITableViewCell(style: .Subtitle, reuseIdentifier: nil)
            
        cell.textLabel?.text = "\(self.dataArray[indexPath.row])"
        cell.detailTextLabel?.text = "Hello from sub title \(indexPath.row + 1)"
            
        return cell
    }

你可能发现了，tvOS 中的 tableview 和 iOS 中的 tableView 非常相似。在上面的代码片段中，我们告诉 tableview 有多少行(rows),多少个部分(section)，以及每个单元格要显示的内容。

在 viewDidLoad 方法中，确保你把 tableview 的 delegate 和 datasource 设置为自身 self。

    
    self.tableView.dataSource = self
    self.tableView.delegate = self

在模拟器中运行应用。

不出意外，你应该看到一个 tableview 出现在界面中。

![](http://www.appcoda.com/wp-content/uploads/2015/10/Screen-Shot-2015-11-01-at-9.21.21-AM-1024x567.png)

现在，我们将在 tableView 的右侧添加一个按钮(UIButton)。在模拟或者真机上构建并运行，Whoo
！我们现在可以在按钮和 tableview 之间无缝切换了。


## 创建一个天气 App

在下一个小项目中，我们将开发一个简单的天气应用程序，显示当前的天气预报。在这个项目中，我们将使用非常稳定的天气 API：**forecast.io**，它为包括 Dark Sky 在内许多 iOS 应用提供 API 支持。

首先你需要在 developer.forecast.io 注册一个开发者账号。我们只是测试，免费的 API 调用(1000 次/天)应该足够使用了。

注意下面 url:
https://api.forecast.io/forecast/d3250bf407f0579c8355cd39cdd4f9e1/37.7833,122.4167

**forecast/**之后的一串数字(即 d3250bf40...)是 API Key 键值(千万不要将项目的 API Key 透露给别人)；紧跟着 API Key 字符串后的是你想要解析天气数据位置的经度和纬度坐标。我选择 San Francisco，但是你可以通过简单修改经纬坐标值来显示其他地方的天气。

倘若在浏览器中打开该链接，你将注意到反馈数据为 JSON 格式。这是一个 Get请求。在 HTTP 世界中，GET 用于获取和下载数据。

为了理解数据并将其显示到应用中,我们需要解析它。解析 JSON 在 Swift 中一直是一个热议话题。目前有各种各样的 JSON 解析库，诸如 SwiftyJSON、Alamofire 等。它们都是很棒的资源，我强烈建议你先看看。然而，在本教程中我们将使用 NSJSONSerialization，一个 iOS 内置的类。首先，打开 ViewController.swift 文件。`didRecieveMemory`警告函数在本项目中没有存在的意义，所以删除它吧！

现在，在 ViewDidLoad 中键入如下代码:

    
    if let url = NSURL(string: "https://api.forecast.io/forecast/d3250bf407f0579c8355cd39cdd4f9e1/37.7833,122.4167") { }

这里我们使用可选类型声明一个 url 变量。

NSJSONSerialization 需要传入 NSData 进行解析。

    
    if let data = NSData(contentsOfURL: url){ }

接着，在上面 data 花括号作用域中键入如下代码：

    
    do {
          let parsed = try NSJSONSerialization.JSONObjectWithData(data, options: NSJSONReadingOptions.AllowFragments) // 1
                        
         let newDict = parsed as? NSDictionary // 2
         print(newDict!["currently"]!["summary"])
       }
    catch let error as NSError {
         print("A JSON parsing error occurred, here are the details:\n \(error)") // 3
    }

我们把 NSJSONSerialization 对象包裹在 do-catch 语句中。你可能对 do 语句不太了解，这是 Swift 2 中的新特性。Do-Catch 语句是一个新的改进性错误处理机制。Do-Catch 语句的使用方式如下：

    
    do {
        try expression // 不是必要的内容
        statements
    } catch pattern 1 {
        statements
    } catch pattern 2 where condition {
        statements
    }

在第一行代码中，我们设定了一个 NSJSONSerialization 对象，并传入 data 对象。注意，对象(parsed)在使用之前必须先转换成一个 NSDictionary 字典。

接着，在第二行代码中，我们指定一个名为 newDict 的变量并使用`as`关键字将其转换 NSDictionary。

最后，在第三行代码中，我们捕获任何错误并打印到终端中。

你的整个 ViewController 文件应该类似于下面的代码。

    
    import UIKit
     
    class ViewController: UIViewController {
     
        override func viewDidLoad() {
            super.viewDidLoad()
            
            if let url = NSURL(string: "https://api.forecast.io/forecast/d3250bf407f0579c8355cd39cdd4f9e1/37.7833,122.4167") {
                if let data = NSData(contentsOfURL: url){
                    do {
                        let parsed = try NSJSONSerialization.JSONObjectWithData(data, options: NSJSONReadingOptions.AllowFragments)
                        
                        let newDict = parsed as? NSDictionary
                        print(newDict!["currently"]!["summary"])
                    }
                    catch let error as NSError {
                        print("A JSON parsithng error occurred, here are the details:\n \(error)")
                    }
                }
            }
        }
    }

检查终端输出。你应该看到一个包裹了值的可选类型(你得到的值应该稍有不同，会根据不同的地理位置和天气来显示)。

![](http://www.appcoda.com/wp-content/uploads/2015/10/Screen-Shot-2015-11-01-at-11.21.02-AM1.png)

现在我们将一些 UILabel 链接到应用中。拖拽两个 UILabel，一个叫 currentTemp，另一个叫 currentSummary。仔细看下 forecast 的 API，你会注意到它返回当前天气温度以及天气的概况(当然还有其他数据)。

![](http://www.appcoda.com/wp-content/uploads/2015/10/Screen-Shot-2015-11-01-at-12.26.11-PM-1024x565.png)

在 newDict 变量下面放置如下代码：

    
    self.currentTemp.text = "\(newDict!["currently"]!["temperature"]!!)"
    self.currentSummary.text = "\(newDict!["currently"]!["summary"]!!)"

代码实现了获取天气数据并正确显示到界面。每一行语句最后都使用了双重叹号符号(!!)，用于强制解包 JSON 数据(否则它将被包裹到 Optional 中)。

在模拟器中构建并运行。

![](http://www.appcoda.com/wp-content/uploads/2015/10/Screen-Shot-2015-11-01-at-11.41.44-AM-1024x549.png)

干的不错！你已经完成了天气预报项目！

## 其他 tvOS 特性

我们只不过接触了点 tvOS 的皮毛。正如你所知道的，tvOS 建立在各种 iOS API 之上。但是，许多框架已经从 tvOS 中移除了。完整列表请看这篇[文章](https://developer.apple.com/library/prerelease/tvos/releasenotes/General/tvOS90APIDiffs/)。

除此之外，tvOS 的基础是焦点事件(按钮、单元格、标签等在选中状态时会凸显出来，此时为聚焦状态)。幸运的是，系统自动处理大多数聚焦事件。只要你使用了 storyboard，默认会自动聚焦。你可以在谷歌中找到一些聚焦[API](https://www.google.com/search?sourceid=chrome-psyapi2&ion=1&espv=2&ie=UTF-8&q=tvOS%20focus&oq=tvOS%20focus&aqs=chrome..69i57j0l4j69i60.2140j0j7)。

正如教程开始所提到的，苹果支持 client-server 应用。这些应用使用 TVML、TVJS 以及 TVMLKit，它们的基础是当下最为流行的 web 技术(HTML、JavaScript 等)。

当前需要考虑的最大挑战是创建的 tvOS 应用中，SDK 并不支持数据持久化存储。这是和 iOS 不同，你不能保存任何大小超过 1MB 的照片、图标等内容。因此你必须配备一个后端服务，如 CloudKit、Parse、iCloud 等。建议你先了解下 tvOS 中对资源的需求(之前我写的[App 瘦包教程](http://www.appcoda.com/app-thinning/))。此外，应用大小限制在 200MB 以内。

显然，tvOS 应用中有太多限制条件，我们需要多加小心。


### 总结

在本教程中我们大致了解了 tvOS 以及它的各种特性。通过四个例子项目我们看到了 tvOS 的强大之处，当然还有局限性。tvOS 与 iOS 共享许多相似之处，但一些iOS框架却已经被移除了。

[这里](https://www.dropbox.com/sh/83i9ahb3nabc698/AAAJ00LBMDEnbJWPy2gF3Iyza?dl=0)提供了完整的项目文件。

在项目一中，我们实现了一个 hello，world 应用程序；随后项目二中实现了简单的猜谜游戏应用，向你展示聚焦引擎；项目三详细介绍了在 tvOS 中如何使用 tableView；最后，我们结合已有知识在项目四中构建了一个简单的天气应用程序，可以从互联网上下载天气数据。

苹果的 tvOS 应用商店于上周推出，授权世界各地的开发者分享他们的作品。

你将作为见证者，看到 tvOS 和新的苹果电视永久性地改变 TV 行业！
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。