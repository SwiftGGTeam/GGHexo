title: "为 Apple TV 开发 tvOS App Part 2"
date: 2015-09-15 09:30:00
tags: [Jameson Quave]
categories: [Swift 入门,Apple TV 开发]
permalink: developing-tvos-apps-for-apple-tv-part-2
---
原文链接=http://jamesonquave.com/blog/developing-tvos-apps-for-apple-tv-part-2/
作者=Jameson Quave
原文日期=2015/09/10
译者=ray16897188
校对=千叶知风
定稿=shanks
发布时间=2015-09-15T09:20:00

<!--此处开始正文-->

本文是 tvOS 教程的第二部分。如果你还没看过[第一部分](http://jamesonquave.com/blog/developing-tvos-apps-for-apple-tv-with-swift/)([译文链接](http://swift.gg/2015/09/14/developing-tvos-apps-for-apple-tv-with-swift/))，我建议你先看那篇。
<!--more-->

## 增加交互事件

在第一部分中我们创建了一个简单的 TVML `document`，里面有几个按钮。这个`document`看起来是这样的：

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

这是一个带按钮的警告（alert）界面，目前这些按钮没有任何作用。这段代码直接硬编码了具体内容，更好的方式是使用代码生成 XML，在 JS 中很容易实现。我们在`main.js`文件中添加一个新函数，把上面的代码封装成一个更简单的警告界面，它只包含一个 OK 按钮。

```javascript
function alert(str) {
	var alertXMLString = `<?xml version="1.0" encoding="UTF-8" ?>
	<document>
		<alertTemplate>
			<title>Hey Listen!</title>
			<description>${str}</description>
			<button>
				<text>OK</text>
		</button>
	</alertTemplate>
</document>`
var parser = new DOMParser();
var alertDOMElement = parser.parseFromString(alertXMLString, "application/xml");
navigationDocument.presentModal(alertDOMElement);
}
```

这里创建了一个`alertXMLString`字符串，它表示的是包含一个按钮的简单警告界面所对应的 TVML。`description`节点比较特殊，我们使用 TVJS 的内嵌字符串语法`${variable}`来插入`str`的值。

接下来，创建一个新的`DOMParser`对象，把这个字符串转换成一个实际的 XML DOM 元素。

最后，我们用`navigationDocument`的`presentModal`方法展示一个模态框，内容就是上一步的 DOM 元素。`navigationDocument`是一个全局变量，它永远指向 XML 文档的根节点。

现在，删除`onLaunch`函数中之前的代码，直接调用刚才创建的函数……

```javascript
App.onLaunch = function(options) {
	alert("Hello!");
}
```

![Hello 警告](http://jamesonquave.com/tutImg/tvOShelloAlert.png)

运行应用，你会看到一个炫酷的"Hello!" tvOS 警告。但是点击 OK 没有任何反应。我们该怎么处理像触摸之类的事件呢？

通常来说，在 JavaScript 和 TVML 的世界中，你需要给 DOM 元素添加一个事件监听器（event listener）。举个例子，我们可以给`alert`函数添加第二个参数，把 OK 按钮触发`select`事件时需要调用的函数作为参数传入。下面我们就加入这个名为`doneCallback`的参数：

```javascript
alertDOMElement.addEventListener("select", function() { doneCallback }, false);
```

更新后的完整函数如下：

```javascript
function alert(str, doneCallback) {
	var alertXMLString = `<?xml version="1.0" encoding="UTF-8" ?>
	<document>
		<alertTemplate>
			<title>Hey Listen!</title>
			<description>${str}</description>
			<button>
				<text>OK</text>
			</button>
		</alertTemplate>
</document>`
var parser = new DOMParser();
var alertDOMElement = parser.parseFromString(alertXMLString, "application/xml");
alertDOMElement.addEventListener("select", doneCallback, false);
navigationDocument.presentModal(alertDOMElement);
}
```

现在我们可以修改之前的`onLaunch`函数，添加一个回调函数来显示一个 TVML 页面。在此之前，我们需要再添加一个`getDocumentContents`函数，它会在页面加载完毕之后调用回调函数。这个回调函数只有一个参数，用来接收 XMLHttpRequest 对象的响应内容。这样我们就可以轻松地加载多种 TVML 文件。

```javscript
function getDocumentContents(url, loadCallback) {
	var templateXHR = new XMLHttpRequest();
	templateXHR.responseType = "document";
	templateXHR.addEventListener("load", function() { loadCallback(templateXHR) }, false);
	templateXHR.open("GET", url, true);
	templateXHR.send();
	return templateXHR;
}
```

代码和之前定义的`getDocument`方法几乎一样，区别是这里是异步操作，而且不会在界面上显示任何内容。

有个这个函数，我们就能执行下面的调用，当 OK 按钮被点击时替换屏幕上的警告内容。

```javascript
App.onLaunch = function(options) {
    alert("Hello!", function() {
      var helloDocument = getDocumentContents("http://localhost:8000/hello.tvml", function(xhr) {
        navigationDocument.dismissModal();
        navigationDocument.pushDocument(xhr.responseXML);
      });
    });
}
```

我们使用`stackTemplate`模板来改写`hello.tvml`文件，这样界面会更有趣。`stackTemplate`非常适合用来展示一组包含标题和图片的列表内容。下面是本例用到的内容：

```xml
<document>
    <stackTemplate>
        <banner>
            <title>Which Artist Do You Prefer?</title>
        </banner>
        <collectionList>
            <shelf>
                <section>
                    <lockup>
                        <img src="http://localhost:8000/nina.png" width="256" height="256" />
                        <title>Nina Simone</title>
                    </lockup>
                    <lockup>
                        <img src="http://localhost:8000/coltrane.png" width="256" height="256" />
                        <title>John Coltrane</title>
                    </lockup>
                </section>
            </shelf>
        </collectionList>
    </stackTemplate>
</document>
```

这基本上就是`stackTemplate`的布局方式，`banner`是顶部的横幅内容，`collectionList`包含许多`shelf`对象，而`shelf`对象则包含许多`section`对象，`section`对象又包含许多`lockup`对象，最后这个才真正包含我们的图片和标题。在本例中我向目录中添加了一些图片，它们是`nina.png`和`coltrane.png`。

![你更喜欢哪个艺术家？](http://jamesonquave.com/tutImg/tvOSArtists.png)

[在Twitter上follow原作者](http://twitter.com/jquave)