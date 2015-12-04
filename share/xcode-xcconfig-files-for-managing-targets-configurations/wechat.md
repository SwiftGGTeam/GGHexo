Xcode:用于管理多个 target 配置的 XCConfig 文件

> 作者：Tomasz Szulc，[原文链接](http://szulctomasz.com/xcode-xcconfig-files-for-managing-targets-configurations/)，原文日期：2015-11-14
> 译者：[小袋子](http://daizi.me)；校对：[千叶知风](http://weibo.com/xiaoxxiao)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  







让我们来看看 XCConfig 文件如何才能在多个拥有不同配置的 target 中良好地工作。

今天我本计划学习一些新东西，因此我搜索了 [mozilla/firefox-ios](https://github.com/mozilla/firefox-ios) 库（译者：这是在火狐浏览器在 github 的一个开源项目）的相关信息，接着我发现他们会在项目中使用大量的配置文件。



我曾经在几个项目中使用过 XCConfig ，但是我并没有在现在开发的项目中使用它。因为这个项目有多个不同配置的 target，因此我开始思考如何才能有效且简单地管理这些 target 。

### 用例

这个项目现在已经被我的团队接手了。客户的团队先开发了大约半年的时间，最后决定将项目完全外包出去。这个项目一个麻烦的事就是 target 有不同的配置，因此如何更好地解决，是个棘手的问题。

项目由十个应用 target 组成，2个总的 target 做些业务，以及一个测试 target 。每一个 target 使用不同的尾部和不同的 “api keys”，以及其他像用于 hockeyapp（HockeyApp 是一个用来分发你的程序并收集应用的崩溃报告的收集框架，类似友盟） token 的键（key）。每一个 target 有自己的预处理宏，如：“TARGET_A”, “TARGET_B”等...（虚构的名字）。然后，token，api keys，后端的 url 被存储在 plist 文件中。因此很自然需要一些类来封装这个文件，并且有语法分析程序以及可以提供给我们适当的键。这个类有超过200行的代码，对我来说仅仅阅读这些数据就要花费很多时间。

因此，我想或许可以使用 XCConfig 文件来简化和替代，而不是使用语法分析程序和十个个预处理宏（一个 target）去决定从 plist 文件应该返回什么值。你可以在下面找到我的解决方案。可能不是最好的方案，但是此刻应该是最好的。如果你有更好的方案，我很愿意去拜读 :)

### 概述

核心思想是使用一些有层级的配置文件。第一层是用于存储最普通的数据，第二层用于区分 debug 和 release 模式，最后一层用于关联特殊 target 的设置。

![](http://szulctomasz.com/wp-content/uploads/2015/11/diagram_1.png)

### Common.xcconfig

这个文件存储着类似应用名称，应用版本，bundle version，以及其他 debug和 release target 中通用的常见配置。

    
    //
    //  Common.xcconfig
    //  <truncated>
    //
    
    APP_NAME = App
    APP_VERSION = 1.6
    APP_BUNDLE_ID = 153

考虑到为十个 target 改变相应的应用版本和 bundle 可能会消耗很多时间。其他的选项可能会创建聚合的 target ，这样可以在每次 Cmd+B的时候更新Info-plist 文件，但是我会避免这样的情况并且让项目不会比现在更复杂。

### Common.debug 和 Common.release

这个文件能够存储可用于 debug 和 release target 的最常用配置。文件包含 Common.xcconfig 并且能够重写它的变量。例如：你可以通过重写一个变量，轻易地把每个 debug target 的应用名称改为 “App Debug” 。对于存储常见的用于开发和发行版本 target 的 API Key，这里也是很好的地方。

**提示：使用通用配置文件和 CocoaPods**

如果你使用 CocoaPods，你应该相应地在你的配置文件之一中包括（include）Pods.debug.xcconfig 或者 Pods.release.xcconfig。我推荐先在项目信息标签中设置你的配置文件然后执行 `pod install` 去让 Pod 项目重新配置。在安装之后，你应该及时地把 Pod 配置文件中的其中一个包括（include）到你自己的文件中去。

    
    Error:
    [!] CocoaPods did not set the base configuration of your project because your project already has a custom config set. In order for CocoaPods integration to work at all, please either set the base configurations of the target TARGET_NAME to Pods/Target Support Files/Pods/Pods.debug.xcconfig or include the Pods/Target Support Files/Pods/Pods.debug.xcconfig in your build configuration.

    //
    //  Common.debug.xcconfig
    //  <truncated>
    //
    
    #include "Common.xcconfig"
    #include "Pods/Target Support Files/Pods/Pods.debug.xcconfig"
    
    APP_NAME = App Debug
    API_KEY_A = API_KEY_HERE
    API_KEY_B = API_KEY_HERE

### PerTarget.xcconfig

我确实不需要在这个层级使用 debug/release 配置文件（因为项目中的其他遗留问题），所以我只是用包括适当的 Common.debug.xcconfig 或者 Common.release.xcconfig 的 PerTarget.xcconfig 文件。但是最好应该有 debug 和 release 配置文件。在这个层级，你可以配置关联到特殊 target 的东西。

    swif
    //
    //  Develop.xcconfig
    //  <truncated>
    //
    
    #include "Common.debug.xcconfig"
    
    BACKEND_URL = http:\/\/develop.api.szulctomasz.com
    SOME_KEY_A = VALUE_HERE
    SOME_KEY_B = VALUE_HERE

### 访问变量

所有的配置文件被存储了。现在是时候去使用他们了。像我例子中有这么多的 target，我可以把 Info.plist 文件的数量减少到只有1个，由于所有的不同的地方都已经在 xcconfig 文件中了，所以这一个文件可以替代多个文件。

你可以看到在你通过这些配置文件构建应用之后，有一些值出现在项目的 Build Setting 的 “User-Defined” 部分。

如果你想要使用配置文件中的变量，例如，在一个target的 Info.plist 文件中，你需要使用这种写法：`$(VARIABLE)`。使用这种方式，你可以设置 “Bundle Identifier” , “Bundle name” , “Bundle version” 以及其他你想要配置的事项。

在代码中访问其他变量看起来有点不一样，我发现最简单的方法就是在 Info.plist 中创建附加的区域，通过使用相同的变量名称和使用上述的写法去设置值。这样你就可以在你的代码中读到这些值。

    
    if let dictionary = NSBundle.mainBundle().infoDictionary {
        let appName = dictionary["APP_NAME"] as! String
        let appVersion = dictionary["APP_VERSION"] as! String
        let appBuildVersion = dictionary["APP_BUILD_VERSION"] as! String
        print("\(appName) \(appVersion) (\(appBuildVersion))")
    
        let backend = (dictionary["BACKEND_URL"] as! String).stringByReplacingOccurrencesOfString("\\", withString: "")
        print("backend: \(backend)")
    }

这里是 [tomkowz/demo-xcconfig](https://github.com/tomkowz/demo-xcconfig) 的代码，从里面你可以看到一些使用 xcconfig 文件的例子。

### 总结

Xcode 配置文件给出了配置 target 的简易方式，并且支持方便地维护项目配置。在我用例中，可以很棒地切换到这些文件，因为现在维护项目配置和我没有使用这个解决方案之前比起来简单了很多。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。