title: "为 Apple TV 开发 tvOS App Part 1"
date: 2015-09-14 09:00:00
tags: [Jameson Quave]
categories: [Swift 入门,Apple TV 开发]
permalink: developing-tvos-apps-for-apple-tv-with-swift

---
原文链接=http://jamesonquave.com/blog/developing-tvos-apps-for-apple-tv-with-swift/
作者=Jameson Quave
原文日期=2015/09/09
译者=ray16897188
校对=numbbbbb
定稿=shanks


![](http://jamesonquave.com/blog/wp-content/uploads/tvOS.png)

<!--more-->

教程结束时，我们会做出这样一个应用：
![你更喜欢哪个艺术家？](http://jamesonquave.com/tutImg/tvOSArtists.png)

## 开始

在我们开始之前你需要安装 Xcode 7.1 beta 版，可以从这里下载：[下载Xcode 7.1 Beta](https://developer.apple.com/xcode/download/)
注意：下载 Xcode 7.1 Beta 需要有一个苹果开发者账号，由于目前 Xcode 是预发行版，以后正式发布的时候可能会有变化。

安装的时候要注意，如果你重命名 Xcode 7.1 应用，会遇到一个已知 bug。一定有人会这么做，所以提前说明……别这么做，否则你的 tvOS 模拟器会崩溃。

同时要注意，虽然支持优胜美地 (Yosemite)，但是在该操作系统上，功能会受限。推荐用 OSX 10.11 El Capitan 或更新的系统。El Capitan beta 可以在[这里](https://developer.apple.com/osx/download/)下载。

下面我们来介绍一些 tvOS 相关的定义。

### *TVMLKit*
TVMLKit 是 Apple 设计的一个新框架，能在使用 Swift 或 Objective-C 实现应用逻辑的同时使用 Javascript 和 XML 开发更炫酷的用户界面。

### *TVML*
TVML 是"TV Markup Language"（TV 标记语言）的缩写，基本上是一些 XML 语句，用于实现基于C/S（client-server，客户端-服务端）架构的 tvOS 应用布局。布局界面时，我们会用到一些 Apple 提供的 TVML 模板创建我们的 UI，然后用 TVJS 写交互脚本。

### *TVJS*
我能告诉你的是，TVJS 就是你（可能已经）熟悉的 JavaScript。 

### *Hello World*

我们从一个基本的 hello world 程序开始。就 Apple TV 而言，我们可以只把`"Hello World"`输出到控制台上。这也许是个不错的开始，但更好的选择是使用 Apple TV 的一些 TVMLKit 元素在屏幕上创建一个模板。

首先，打开 Xcode 7.1 并创建一个新项目。你可以看到一个模板列表，我们在左侧选择*CHANGE tvOS*，然后再选*Single View Application*模板。

这样就会根据 tvOS 模板创建一些默认文件和一个简单的 Swift 入口点，对一会儿创建 UI 很有帮助。

### *建立 TVJS 主文件*

在 C/S 架构的 tvOS 应用中，服务端本质上就是 TVML 和 JavaScript 文件以及和它们相关的所有数据。JavaScript 文件会装载 TVML 并把页面（page）放入视图栈中。可以从另一个角度理解：JavaScript 文件就像 TVML 文件的路由器或是控制器（controller），而 TVML 文件本质上是若干视图（views）。

### *拉开序幕*

首先我们要修改应用的`AppDelegate.swift`文件。第一步是让我们的应用遵循`TVApplicationControllerDelegate`协议。该协议定义在 TVMLKit 框架中，所以需要导入它。更新`AppDelegate.swift`文件，如下所示：

```swift
import TVMLKit

class AppDelegate: UIResponder,
UIApplicationDelegate,
TVApplicationControllerDelegate {

....
```

此协议包含四个 tvOS 实现`AppDelegate`后会调用的函数，用于给我们的应用发送 tvOS 生命周期通知。现在我们无需操心这些，但在后面的教程中我们会对它们进行深入研究。目前只要像上面的代码那样把协议加进去就够了。

下一步，我们要添加一些代码，让 JS 文件起作用。由于是 beta 版，我们还需要自己完成这些工作。我相信在 Xcode 的后续版本中这一步会变成一个模板。

在程序里`didFinishLaunchingWithOptions`这个函数中我们要完成一些步骤。它们对所有应用来说都是一样的，所以你可以直接复制这段代码：

```swift
// 在一个可选属性中保存对 appController 的引用
var appController: TVApplicationController?
 
func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {
  self.window = UIWindow(frame:UIScreen.mainScreen().bounds)
 
  let appControllerContext = TVApplicationControllerContext()
 
  let jsFilePath = NSURL(string: "http://localhost:8000/main.js")
  let javascriptURL = jsFilePath!
 
  appControllerContext.javaScriptApplicationURL = javascriptURL
  if let options = launchOptions
  {
    for (kind, value) in options
    {
      if let kindStr = kind as? String
      {
        appControllerContext.launchOptions[kindStr] = value
      }
    }
  }
 
  self.appController = TVApplicationController(context: appControllerContext, window: self.window, delegate: self)
 
  return true
}
```

简单说说这段代码干了什么：它拿到了一个`TVApplicationControllerContext`引用，这个*Context*只是为我们的`AppDelegate`类提供了一些启动数据，然后给了我们一个能调整和修改启动过程的接口。接着把 URL 传给待会儿要运行的`main.js`文件，并将`appController`的路径设置成这个 URL。

现在就要添加我们的 JavaScript 文件了，点击 File > New，然后在 iOS tab 下面选择 Other > Empty file。将这个文件命名为`main.js`。

用同样方法创建一个`hello.tvml`文件。

在`main.js`文件中添加一些简单的 JavaScript 代码，用来装载`hello.tvml`文件：

```javascript
function getDocument(url) {
  var templateXHR = new XMLHttpRequest();
  templateXHR.responseType = "document";
  templateXHR.addEventListener("load", function() {pushDoc(templateXHR.responseXML);}, false);
  templateXHR.open("GET", url, true);
  templateXHR.send();
  return templateXHR;
}
 
function pushDoc(document) {
  navigationDocument.pushDocument(document);
}
 
App.onLaunch = function(options) {
  var templateURL = 'http://localhost:8000/hello.tvml';
  getDocument(templateURL);
}
 
App.onExit = function() {
  console.log('App finished');
}
```

现在在`hello.tvml`文件中添加：

```xml
<document>
  <alertTemplate>
      <title>Hello tvOS!</title>
  </alertTemplate>
</document>
```

TVML 文件是 UI 的实际内容。文档（document）必须用模板编写，否则现在的代码运行时会崩溃。这个 TVML 文件只是包含了一个简单的模板和一个单元素的标题。

在编写这些代码时我发现一个问题：本地无法引用这些文件，文件必须放在一个 web 服务器上。所以最简单的解决方案是找到你刚创建 TVML 和 JS 文件的位置，并在命令行中敲进如下指令：

## 启动服务端

```
python -m SimpleHTTPServer 8000
```

这条指令用 Mac OS 内建的 python 解释器开启了一个端口号为 8000 的 web 服务器，可以用它来托管本地文件。如果在命令行中，执行了上面给出的代码，那么现在按一下 Xcode 的 play 按钮就能启动 tvOS 模拟器了。还有一个要注意的事情：这是一个不够安全的 HTTP 请求，在 iOS 9 中会被默认的应用传输安全机制拦截。为了能够按之前的方法来使用本地主机，我们需要在`Info.plist`文件中添加一个`key`。

### 允许直接加载（Allows Arbitrary Loads）

选择`Info.plist`文件然后按加号(+)来创建一条新记录。在列表中选择"App Transport Security Settings"并按 return 建。这将创建一个新的字典条目，展开它，在这行上按加号(+)添加一个子行。接着选中"Allows Arbitrary Loads"并将其设为`true`。都设好了之后我们就能用模拟器运行应用了。

### 添加按钮

在本例中你看到的实际上是一个被 Apple 称作`alertTemplate`的模板。你还能嵌入一些基本控件，比如在模板中添加文字和按钮。试着添加一些按钮吧：

```xml
<document>
    <alertTemplate>
        <title>Hello tvOS!</title>
        <button>
            <text>A Button</text>
        </button>
        <button>
            <text>A Second Button</text>
        </button>
    </alertTemplate>
</document>
```

这里我们只加了子按钮（child button）元素，每个子按钮都有它自己的子文本（child text）元素。这段代码在 tvOS 模拟器上全屏显示`alert`和两个按钮。如果你自学能力很强，[苹果的官方文档](https://developer.apple.com/library/prerelease/tvos/documentation/LanguagesUtilities/Conceptual/ATV_Template_Guide/TextboxTemplate.html#//apple_ref/doc/uid/TP40015064-CH2-SW8)中列出了你能使用的所有模板和控件。否则的话请跟紧我，订阅我的博客，之后我会教你开发一个完整的应用。

## 继续学习

学习本教程的[第二部分](http://jamesonquave.com/blog/developing-tvos-apps-for-apple-tv-part-2/)：为应用添加交互事件。

如果你想在新文章发布时收到通知，请[订阅我的 newsletter](http://eepurl.com/WKj4n)。

刚开始学习难免会遇到问题，如果你卡住了，别犹豫，在 twitter 上联系我[@jquave](http://twitter.com/jquave)。
