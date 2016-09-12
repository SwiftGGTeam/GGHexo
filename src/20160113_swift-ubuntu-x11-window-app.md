title: "Swift包管理器：在Linux上创建和使用X11包"
date: 2016-01-13
tags: [Swift 进阶]
categories: [APPVENTURE]
permalink: swift-ubuntu-x11-window-app

---
原文链接=http://appventure.me/2015/12/08/swift-ubuntu-x11-window-app/
作者=Benedikt Terhechte
原文日期=2015-12-08
译者=小锅
校对=Prayer
定稿=

<!--此处开始正文-->

现在 Swift 已经开源了，应该有很多感兴趣的用户已经在他们的 Linux 系统上安装把玩过了。然而，目前的 Foundation 框架还在紧锣密鼓地开发中，所以如果你想开发出比命令行更复杂一点的程序，就得链接已有的 Linux 库，如 GTK, Cairo 或者 libpng 以开发出图形界面的程序。

<!--more-->

我刚刚实现了一个简单的 Swift 程序，这个程序链接了 Unix 中最基本的 UI 类库<sup>1</sup> —— `X11`。在这个简短的教程中，我会向你展示如果完成一个简单的 X11 应用程序，然后你就可以利用这些知识去链接到其它的类库。

在开发的过程中，我们也会使用到新的 Swift 包管理器来为 X11 类库创建一个简单并且可重用的包。

下面是程序运行后的截图<sup>2</sup>：

![](/img/articles/swift-ubuntu-x11-window-app/screenshot.png1452647719.9257545)

## Swift 包管理器

在实际开始开发我们的 X11 应用之前，需要先[定义一个 Swift 包](https://github.com/apple/swift-package-manager)用来定义链接到 X11 类库。一旦完成这个步骤，之后我们就可以将这个包分发给其它开发者，或者在别的项目中进行重用。我们必须将定义一个包和使用一个包区分开来。让我们先从定义开始，然后再学习如何使用。

## 定义一个包

新建一个目录用来保存我们的包。由于我们需要链接到 C 语言的库，[我遵循了 Swift 包管理器文档的指南，为包名加上一个 C 的前缀](https://github.com/apple/swift-package-manager/blob/master/Documentation/SystemModules.md)，将包命名为 `CX11.swift`

```bash
mkdir CX11.swift	
```

对我们来说，我们不想写任何的 Swift 包装（wrapper）代码，而是要直接对已有的 C 语言 API 进行链接。要链接到 C 语言类库和头文件需要通过 `module.modulemap` 文件，这个文件里包含了帮助 Swift 编译器来进行正确的链接操作的必要指令信息。[可以在这里获取 modulemap 的语法文档](http://clang.llvm.org/docs/Modules.html)。创建一个 module map 文件，并且对其进行编辑（你可以自行选择编辑器，在这里我使用了 `nano`）：

```bash
touch CX11.swift/module.modulemap
nano CX11.swift/module.modulemap
```

X11 是一个包含了很多功能的大型类库。你可以在 `/usr/include/X11` 目录下查看到它的内容。在我们的示例中，我们不需要包含所有的头文件，相对地，我们只需要用到其中的两个: `Xlib.h` 和 `X.h`。对于其它的类库，你可能需要包含更多的头文件。在下面的内容在我会提到如何用一种简便方法来包含某个目录下的全部头文件。除了包含的头文件，我们还需要告诉 Swift 链接哪一个库。可以使用 `link` 关键字来完成。我们的 `modulemap` 文件看起来应该是这样的：

```swift
module CX11 [system] {
  module Xlib {
	  header "/usr/include/X11/Xlib.h"
  }
  module X {
	  header "/usr/include/X11/X.h"
  }
  link "X11"
}
```

我们将所创建的模块(module)命名为 `CX11`，并且我们创建了两个子模块(submodules)。一个是 Xlib，另一个是 X。每一个子模块定义了它需要导入的头文件。最后我们使用 `link` 语句来链接到 libx11 类库。

但是如果我们想链接到不止一个头文件呢？Module maps 允许我们定义一个 umbrella 头文件或指定一个 umbrella 目录。

**Umbrella Header** 这是一个头文件，里面包含了引用(通过 `#include`)其它头文件的指令。一个好的示例是  `<Cocoa/Cocoa.h>` 或 `<Foundation/Foundation.h>` 还有 `<gtk/gtk.h>`。使用 Umbrella 关键字来定义 Umbrella 头：

```swift
umbrella header "/usr/include/gtk/gtk.h"
```

**Umbrella Directory** 有时候你有一个头文件目录但是并没有一个 umbrella header。在这种情况下，你可以告诉 Swift 直接到该目录下查找头文件：

```swift
umbrella "/usr/include/X11/"
```

除了 modulemap 文件，我们还需要一个 **Package.swift** 文件，否则我们的构建将会失败。但是这个文件可以是空的：

```bash
touch CX11.swift/Package.swift
```

Swift 包管理器使用了 Git 和 Git Tags 来对包进行管理。所以我们还需要为我们的包创建一个 Git 仓库，添加所有的文件，然后打上一个版本标签。这是相当容易的：

```bash
cd CX11.swift
git init
git add .
git commit -m "Initial Import"
git tag 1.0.0
cd ..
```

上述命令首先切换到目录中，创建一个 Git 仓库，添加所有的文件到仓库中，提交，最后为这个提交添加一个版本标记(`1.0.0`)。

就是这些，我们的包已经定义完成了，那我们应该如何来使用呢？

## 包的使用

要使用一个包，我们要先定义一个 `Package.swift` 文件，这个文件可以告诉 Swift 需要导入哪些包到我们的项目中。但是首先得为我们的项目创建一个目录。

```bash
mkdir swift-x11
touch swift-x11/Package.swift
touch swift-x11/main.swift
```

需要注意的是（针对这个特定的示例程序）需要将 `swift-x` 目录与 `CX11.swift` 放到同一个目录：

```bash
ls -l
CX11.swift
swift-x11
```

在真正着手开始写 Swift 代码与 X11 进行交互之前，我们需要告诉 `swift-x11` 项目如何导入 `CX11` 包。在 `swift-x11/Package.swift`中输入这些代码，我会在下面具体解释这些代码的意思：

```swift
import PackageDescription

let package = Package(
  dependencies: [
    .Package(url: "../CX11.swift", majorVersion: 1)
  ]
)
```

这些代码的意思是告诉 Swift 要到 `../CX11.swift` 目录中查找包。

`url`(正如它的名字所代表的)不需要是一个本地的url，[我已经将我的 CX11.swift 上传到了 GitHub](https://github.com/terhechte/CX11.swift)，你也可以在 url 中直接使用 GitHub 的链接：

```bash
import PackageDescription

let package = Package(
  dependencies: [
    .Package(url: "https://github.com/terhechte/CX11.swift.git", majorVersion: 1)
  ]
)
```

## 使用X11

现在我们已经定义好了 X11 包，并且包管理器也配置完毕，现在就开始动手用 Swift 写第一个 X11 程序吧。

这里有一个问题我没办法解决，那就是定义在 X11 头文件中的宏并没有导入到 Swift 当中。`Xlib.h` 文件当中定义了很多类似下面这样的宏：

```c
#define RootWindow(dpy, src) (ScreenOfDisplay(dpy, src)->root)
#define ScreenOfDisplay(dpy, scr)(&((_XPrivDisplay)dpy)->screens[scr])
```

因为这些宏都没有被导入，所以我决定将宏所定义的完整代码都写出来。以下所有的代码都是写在 `main.swift` 文件当中的。[你也可以在 GitHub 上找到最终完成版](https://github.com/terhechte/swift-x11-example)。请注意，这是一个简单并且内存不安全的示例程序。这仅仅是为了展示如果在 Linux 下使用 C 语言类库。同时，我的 X11 知识也十分有限。我在 Linux 下使用 X11 编程已经是 10 年前的事情了，我已经忘了大半，因此下面的代码解释中可能存在错误。如果你发现了错误，[尽管在这个仓库中向我提交一个PR :)](https://github.com/terhechte/appventure-blog/tree/master/resources/posts/2015-12-08-swift-ubuntu-x11-window-app.org)

我们先从导入前面定义的 `CX11` 类库开始：

```swift
import CX11.Xlib
import CX11.X
```

## 配置

在这之后，我们需要定义一些变量。

* 我们需要一个 X11 显示(大致来讲就是与 X11 服务器的连接)，这个变量命名为 `d`。
* 我们需要为创建的 X11 窗口(window)提示一个占位符，这个变量命名为 `w`。
* 我们还需要为 X11 服务器开辟一些内存用于存储 X11 输入事件，这个变量命名为 `e`。
* 我们还需要保存要在窗口上显示的文本，这个变量命名为 `msg`。
* 我们需要一个位置用来储存当前的 X11 屏幕(一个 X11 显示可以拥有多个屏幕)，这个变量命名为 `s`。
* 最后，我们需要一个指针指向 X11 的根窗口，这个根窗口保存了其它的窗口，这个变量命名为 `rootWindow`。

```swift
// X11 Display
var d: _XPrivDisplay

// 我们将要创建的 window
var w: Window

// X11 产生的事件
var e = UnsafeMutablePointer<_XEvent>.alloc(1)

// 要显示的文本内容
var msg = "Hello Swift World"

// 指向当前 X11 Screen 的指针
var s: UnsafeMutablePointer<Screen>
```

变量定义好之后，我们需要打开到 X11 服务器的连接。但是，由于用户有可能在没有安装 X11 服务器(比如，控制台模式)的机器上运行这个应用程序，所以我们需要判断这个连接是否成功：

```swift
d = XOpenDisplay(nil)
if d == nil {
	fatalError("cannot open display")
}
```

在成功打开连接之后，我们要获取当前的默认显示屏以及当前的根窗口。由于 `RootWindow` 宏不可用<sup>4</sup>，所以我们直接获取 `C 结构体` 的内存区域。然而，因为当前的屏幕 `s` 是一个 `UnsafeMutablePointer`，我们需要增加一个 `memory` 属性来获得 `root` 实例。

```swift
// Get the default screen
s = XDefaultScreenOfDisplay(d)

// And the current root window on that screen
let rootWindow = s.memory.root
```

## 创建一个窗口

现在我们有了创建窗口以及将其显示在屏幕中的所有东西。我们将[使用 `XCreateSimpleWindow` 函数来完成](http://linux.die.net/man/3/xcreatesimplewindow)。这个函数接受如下的参数：

```c
XCreateSimpleWindow(Display *display, Window parent, int x, int y, 
  unsigned int width, unsigned int height, unsigned int border_width, 
  unsigned long border, unsigned long background);
```

`border` 和 `background` 是颜色(color)值。为了避免手动创建颜色，我们简单地传入当前屏幕定义好的默认黑色和白色引用。这里需要再次用到 `.memory` 属性。

```swift
// Create our window
w = XCreateSimpleWindow(d, rootWindow, 10, 10, 200, 100, 1, 
  s.memory.black_pixel, s.memory.white_pixel)
```

这段代码会在 `rootWindow` 的 10/10 位位置创建一个宽度 200 和高度 100 的新窗口。边框会是黑色，而背景将会是白色。

## 输入事件

当然，我们还需要接受从 Xserver 上传来的输入事件。在这个例子中，我们需要知道窗口何时被显示，此时我们可以在上面进行绘制，我们还需要知道用户按下特定键退出程序的事件。第一个是 `Expose` 事件，第二个是 `KeyPress` 事件。[接受事件需要通过 `XselectInput` 函数来注册事件掩码来完成](http://tronche.com/gui/x/xlib/event-handling/XSelectInput.html)：

```c
XSelectInput(d, w, ExposureMask | KeyPressMask)
```

窗口创建完成之后，我们就可以显示它了。[这是通过 `XMapWindow` 函数来实现的](http://tronche.com/gui/x/xlib/window/XMapWindow.html)：

```c
XMapWindow(d, w)
```

## 事件循环（Event Loop）

最后，我们需要在窗口的显示期间启动事件循环。在这里，我用一个 `while` 循环来不断地使用 `XNextEvent` 函数以获取新的 X11 事件。接着，我们对事件进行判断，以确定其是否为 `Expose` 以及 `KeyPress` 事件<sup>5</sup>。我们通过 `swift` 语句来进行判断：

```swift
loop: while true {

  // Wait for the next event
  XNextEvent(d, e)

  switch e.memory.type {
    // The window has to be drawn
    case Expose:
    // draw a small black rectangle
    XFillRectangle(d, w, s.memory.default_gc, 20, 20, 10, 10) 
    // draw the text
    XDrawString(d, w, s.memory.default_gc, 10, 70, msg, Int32(msg.characters.count)) 

    // The user did press a key
    case KeyPress:
    break loop

    // We never signed up for this event
    default: fatalError("Unknown Event")

  }
}
```

这里的 `e` 事件结构体还是一个 `UnsafeMutablePointer`，所以我们还是需要通过 `memory` 属性来获得真实的结构体。`Expose` 事件表明现在窗口已经可见，所以我们需要对进行重绘。这里的绘制十分简单：使用 `XFillRectangle` 来绘制一个小的黑块，以及 `XDrawString` 来将已初始化的 `msg` 文本绘制到窗口的 10, 70 位置。我不是很清楚 X11 是接受 unicode 还是 ascii 编码，所以 `Int32(msg.characters.count)` 可能是错的，但是在这个例子当中它可以正常运行。

另一个事件，`KeyPress` 一旦在用户按下一个键的时候跳出外层的 `while` 循环并退出程序。

## 运行

要运行这个程序，只需要 check out 仓库(最好在Linux上进行)并且在目录中运行如下命令：

```bash
swift build
```

这个命令会 clone `CX11.swift` 包，并且在 `.build/debug` 目录中构建出二进制文件。

通过如下的命令来运行：

```bash
.build/debug/swift-x11-example
```

这将会执行二进制文件，一个小小的 X11 窗口将会出现在你的桌面上：

![](/img/articles/swift-ubuntu-x11-window-app/screenshot.png1452647719.9257545)

## 总结

这是一个相当的简单的示例，展示了如何在 Linux 下使用 Swift 写一个 X11 应用程序。当然，这些知识同样适用地链接到其它类库的不同类型的应用程序。这个教程同时也通过使用一个简单的 `X11` 包阐述了 Swift 包管理器是如何工作的。

[完整的 X11 应用程序代码可以在这里找到。](https://github.com/terhechte/swift-x11-example)
[完成的 X11 包代码可以在这里找到。](https://github.com/terhechte/CX11.swift)

1. 我一开始使用的是 GTK3, 但是没办法让它运行起来
2. 十分壮观，不是么 :)
3. "我们希望社区采用的约定是为这种模块加上 C 的前缀然后与Swift模块一样使用驼峰命名。这样就可以为其它更加'Swifty'的纯C接口的包装函数使用如JPEG这样的命名"
4. 参见上面的解释，我没办法找出具体的原因
5. 我们仅注册过这两个事件


