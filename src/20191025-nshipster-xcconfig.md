title: "Xcode Build 配置文件"
date: 2019-10-25
tags: [Swift, NSHipster]
categories: [Swift, NSHipster]
permalink: nshipster-xcconfig

---
原文链接=https://nshipster.com/xcconfig/
作者=Mattt
原文日期=2019-05-13
译者=雨谨
校对=numbbbbb,WAMaker
定稿=Pancf

<!--此处开始正文-->

软件开发最佳实践 [规定了](https://12factor.net/config) 配置与代码的严格分离。然而，苹果平台上的开发人员常常难以将这些指导原则与 Xcode 繁重的项目工作流程结合起来。

了解每个项目设置的功能以及它们之间如何交互，是一项需要多年磨练的技能。但 Xcode 将大部分的这类信息都都深埋在其图形化界面中，这对我们没有任何好处。

导航到项目编辑器的 "Build Settings" tab，你会看到分布在 project、target 和 configuration 上的 _数百条_ Build Setting（构建配置） —— _更别说其他六个 tab 了!_

![](https://nshipster.com/assets/xcconfig-project-build-settings--light-f7043782f0b56d637bec89eefa0d37939b38ef33f55c293e326d3fecbc06df49.png)

幸运的是，有一个更好的办法，不必点击迷宫般的 tab 和箭头，就可以管理所有的配置。

这一周，我们将向你展示如何在 Xcode 之外，通过修改基于文本的 `xcconfig` 文件，让你的项目更加紧凑、易懂、强大。

---

[Xcode Build 配置文件](https://help.apple.com/xcode/mac/8.3/#/dev745c5c974)，即大家所熟知的 `xcconfig` 文件，允许我们在不使用 Xcode 的情况下声明和管理 APP 的 Build Setting。它们是纯文本，这意味着它们对代码管理系统更加友好，而且可以被任意编辑器修改。

从根本上说，每个配置文件都由一系列键值对组成，其语法如下:

```
<#BUILD_SETTING_NAME#> = <#value#>
```

例如，你可以使用下面这样的 `SWIFT_VERSION` Build Setting，指定项目的 Swift 语言版本：

```
SWIFT_VERSION = 5.0
```

> 根据 [<abbr title="Portable Operating System Interface">POSIX</abbr> 标准](http://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap08.html#tag_08)，环境变量的名字由全大写字母、数字和下划线（`_`）组成 —— 经典例子就是 `SCREAMING_SNAKE_CASE` 🐍🗯。

---

乍一看，`xcconfig` 文件与 `.env` 文件有惊人的相似之处，它们的语法都很简单，都以换行分隔。但是，Xcode Build 配置文件的内容比表面上看到的要多。_看哪!_

### 保留现有值

要追加新内容，而不是替换现有定义时，可以像这样使用 `$(inherited)` 变量:

```
<#BUILD_SETTING_NAME#> = $(inherited)<#additional value#>
```

这么做通常是为了搭建一些值的列表，比如编译器的 framework 头文件的搜索路径(`FRAMEWORK_SEARCH_PATHS`):

```
FRAMEWORK_SEARCH_PATHS = $(inherited) $(PROJECT_DIR)
```

Xcode 按下面的顺序对 `inherited` 进行赋值（优先级从低到高）：

- 平台默认值（Platform Defaults）
- Xcode 项目文件的 Build Setting（Xcode Project File Build Settings）
- Xcode 项目的 xcconfig 文件（xcconfig File for the Xcode Project）
- Active Target 的 Build Setting（Active Target Build Settings）
- Active Target 的 xcconfig 文件（xcconfig File for the Active Target）

> 空格用于分隔字符串和路径列表中的项。指定包含空格的项时，必须用引号(`"`)括起来。

### 引用其他值

你可以按照下面的语法，通过其他设置的名字引用它们的值：

```
<#BUILD_SETTING_NAME#> = $(<#ANOTHER_BUILD_SETTING_NAME#>)
```

这种引用既可以用于根据现有值定义新变量，也可以用于以内联方式动态构建新值。

```
OBJROOT = $(SYMROOT)
CONFIGURATION_BUILD_DIR = $(BUILD_DIR)/$(CONFIGURATION)-$(PLATFORM_NAME)
```

### 条件约束

使用以下语法，你可以按 SDK（`sdk`）、架构（`arch`）和 / 或配置（`config`）对 Build Setting 进行条件约束：

```
<#BUILD_SETTING_NAME#>[sdk=<#sdk#>] = <#value for specified sdk#>
<#BUILD_SETTING_NAME#>[arch=<#architecture#>] = <#value for specified architecture#>
<#BUILD_SETTING_NAME#>[config=<#configuration#>] = <#value for specified configuration#>
```

如果需要在同一 Build Setting 的多个定义之间进行选择，编译器将根据条件约束进行解析。

```
<#BUILD_SETTING_NAME#>[sdk=<#sdk#>][arch=<#architecture#>] = <#value for specified sdk and architectures#>
<#BUILD_SETTING_NAME#>[sdk=*][arch=<#architecture#>] = <#value for all other sdks with specified architecture#>
```

例如，你可以使用下面这条 Build Setting 指定仅编译 active architecture，从而提升本地 Build 的速度。

```
ONLY_ACTIVE_ARCH[config=Debug][sdk=*][arch=*] = YES
```

### 引用其他配置文件中的设置

跟 `C` 语言的 `#include` 指令一样，Build 配置文件也可以使用这种语法来引用其他配置文件中的设置。

```
#include "<#path/to/File.xcconfig#>"
```

正如我们将在本文后面看到的，你可以利用这一点，以非常强大的方式搭建起 Build Setting 的级联列表。

> 正常来说，当遇到一个无法解析的 `#include` 指令时，编译器会报错。但是 `xcconfig` 文件同时也支持 `#include?` 指令，在该指令下，若文件无法找到，编译器不会报错。

> 根据文件是否存在而改变编译时行为的情况并不多；毕竟，Build 最好是可预见的。但是你可以把它用在可选的开发工具上，比如 [Reveal](https://revealapp.com/) 需要以下的配置：

> ```
> # Reveal.xcconfig
> OTHER_LDFLAGS = $(inherited) -weak_framework RevealServer
> FRAMEWORK_SEARCH_PATHS = $(inherited) /Applications/Reveal.app/Contents/SharedSupport/iOS-Libraries
> ```

## 创建 Build 配置文件

要创建 Build 配置文件，请选择 "File > New File..." 菜单项（<kbd>⌘</kbd><kbd>N</kbd>），下拉到 "Other" 部分，选中 Configuration Settings File 模板。将它保存到你的项目目录，并确保它在你期望的 target 上。

![](https://nshipster.com/assets/xcconfig-new-file--light-1569134f8ecaeaee6640f28e544443da0136ff72b00f9343126147934ac134d4.png)

创建好 `xcconfig` 文件后，你就可以将它分配给对应 target 的一个或多个 Build 配置。

![](https://nshipster.com/assets/xcconfig-project-configurations--light-a82440e27f27e3b139ab51c7317780c6b4a017dfcc56532972da5d521f1f0988.png)

---

现在我们已经介绍了 Xcode Build 配置文件使用的基础知识，那么让我们来看几个示例，看看如何使用它们来管理 development、stage 和 production 环境。

---

## 为内部版本提供自定义的 APP 名称和图标

开发 iOS 应用程序时，通常需要在模拟器和测试设备上安装各种内部版本（同时也会安装应用程序商店的最新版本，以供参考）。

使用 `xcconfig` 文件，你可以轻松地为每个配置分配一个不同的名称和 APP 图标。

```
// Development.xcconfig
PRODUCT_NAME = $(inherited) α
ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon-Alpha

---

// Staging.xcconfig
PRODUCT_NAME = $(inherited) β
ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon-Beta
```

## 管理不同环境下的常量

如果你的后端开发人员也遵循前面提到的 [12 Factor App](https://12factor.net/config) 理论，那么他们将为 development、stage 和 production 环境提供单独的接口。

iOS 上最常见的环境管理方式可能就是使用条件编译语句 + `DEBUG` 这样的 Build Setting 了。

```swift
import Foundation

#if DEBUG
let apiBaseURL = URL(string: "https://api.example.dev")!
let apiKey = "9e053b0285394378cf3259ed86cd7504"
#else
let apiBaseURL = URL(string: "https://api.example.com")!
let apiKey = "4571047960318d233d64028363dfa771"
#endif
```

这只是完成了任务，但是与代码 / 配置分离的标准相冲突。

另一个方案是将这些与环境相关的值放到它们该待的地方 —— `xcconfig` 文件中。

```
// Development.xcconfig
API_BASE_URL = api.example.dev
API_KEY = 9e053b0285394378cf3259ed86cd7504

---

// Production.xcconfig
API_BASE_URL = api.example.com
API_KEY = 4571047960318d233d64028363dfa771
```

> 不幸的是，`xcconfig` 将所有 `//` 都当成注释分隔符，不管它们是否包括在引号中。如果你用反斜线 `\/\/` 进行转义，那么这些反斜线也将被直接展示出现，使用时必须从结果中移除。在指定每个环境的 URL 常量时，这尤其不方便。

> 如果不想处理这种麻烦的事情，你可以在 `xcconfig` 中忽略 scheme，然后在代码中添加 `https://`。_（你是在使用 https……对吧？）_

然而，要以编程方式获取这些值，我们还需要一个额外的步骤:

### 在 Swift 中访问 Build Setting

由 Xcode 项目文件、`xcconfig` 文件和环境变量定义的 Build Setting 只在 Build 时可用。当你运行一个已经编译的 APP 时，所有相关的上下文都是不可见的。_（谢天谢地！）_

但是等一下——你不记得之前在其他 tab 中看到过一些 Build Setting 吗？Info，是吗？

实际上，Info tab 只是 target 的 `Info.plist` 文件的一个马甲。Build 时，这个 `Info.plist` 文件会根据 Build Setting 的配置进行编译，然后复制到最终 APP 的 [bundle](https://nshipster.com/bundles-and-packages/) 中。因此，添加 `$(API_BASE_URL)` 和 `$(API_KEY)` 的引用后，你可以通过 Foundation `Bundle` API 的 `infoDictionary` 属性访问这些值。完美！

![](https://nshipster.com/assets/xcconfig-project-info-plist--light-5561d8abf4dca9722875ff1f62b5975c3361f5ea3dfd584b655f3da7d3ceb94b.png)

按照这种方法，我们可以做如下工作：

```swift
import Foundation

enum Configuration {
    static func value<T>(for key: String) -> T {
        guard let value = Bundle.main.infoDictionary?[key] as? T else {
            fatalError("Invalid or missing Info.plist key: \(key)")
        }

        return value
    }
}

enum API {
    static var baseURL: URL {
        return URL(string: "https://" + Configuration.value(for: "API_BASE_URL"))!
    }

    static var key: String {
        return Configuration.value(for: "API_KEY")
    }
}
```

从调用的角度考虑，我们发现这种方法与我们的最佳实践完美地在结合一起 —— 没有出现一个硬编码的常量!

```swift
let url = URL(string: path, relativeTo: API.baseURL)!
var request = URLRequest(url: url)
request.httpMethod = method
request.addValue(API.key, forHTTPHeaderField: "X-API-KEY")
```

> 不要把私密的东西写在代码中。相反，应该将它们安全地存储在密码管理器或类似的东西中。

> 为了防止你的私密被泄漏到 GitHub 上，请将下列配置添加到你的 `.gitignore` 文件中（根据需要）：

> ```
> # .gitignore
> Development.xcconfig
> Staging.xcconfig
> Production.xcconfig
> ```

> 一些开发人员喜欢使用包含了所需 key 的占位符文件（例如 Development.sample.xcconfig）代替这些文件。拉取代码时，开发人员再将该文件复制到非占位符位置，并相应地填充它。

---

---

Xcode 项目是庞大、脆弱的和不透明的。它们是团队成员合作时摩擦的来源，也常常是工作的累赘。

幸运的是，`xcconfig` 文件很好地解决了这些痛点。将配置从 Xcode 移到 `xcconfig` 文件带来了很多好处，可以让你的项目与 Xcode 的细节保持一定距离，不受苹果公司的掣肘。
