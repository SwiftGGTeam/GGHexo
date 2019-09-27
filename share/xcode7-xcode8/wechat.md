同时兼容 Xcode7 和 Xcode8"

> 作者：radex.io，[原文链接](http://radex.io/xcode7-xcode8/)，原文日期：2016-07-28
> 译者：ckitakishi；校对：[Channe](http://www.jianshu.com/users/7a07113a6597/latest_articles)；定稿：[CMB](https://github.com/chenmingbiao)
  









作为一名 iOS 开发者，你一定对 iOS 10 带来的新特性感到无比兴奋，并迫不及待地想要在应用中实践。虽然你想*马上*就动手以便第一时间就能“上车”。但 iOS 10 正式上线却是几个月以后的事情，在那之前，你不得不保持每几周就为应用发布一个新版本的频率。这个情况听起来是不是跟你现在的处境很像呢？

当然，目前你还不能用 Xcode 8 来编译需要发布的应用——因为它无法通过 App Store 的验证。所以你需要把项目拆分成两个分支，稳定分支和 iOS 10 开发分支……

而不可避免地是，这烂透了。如果只是暂时在分支上做一点某个特性的开发并无伤大雅。但是随着整个代码库的改变，主分支的演进，持续好几个月来维护这样一个庞大的分支的时候，你就会渐渐遇到一些不可描述的合并之痛。我的意思是，你尝试过处理 `.xcodeproj` 文件的合并冲突么？

这篇文章的目的就是告诉你如何彻底避免使用分支。对于大部分应用而言，只用一个工程文件就同时支持 iOS 9（Xcode 7）和 iOS 10（Xcode 8）是完全可能的。而且即使你不得不使用分支，这些小技巧也可以帮助你减少两个分支之间的差异，从而更舒服地对它们进行同步。



## 你用的是 Swift 2.3

我先说明一点：

我们都为 Swift 3 的到来而兴奋。它很棒，但是如果你正在读这篇文章，*请别用它*（或者说暂时别）。虽然它足够好，但是在代码层面上存在的不兼容，比一年前的 Swift 2 还要严重得多。而且一旦应用存在对第三方 Swift 库的依赖，就得等这些库都升级到 Swift 3，它才可以跟着升级。

而好消息是，史无前例地，Xcode 8 支持*两个*版本的 Swift：2.3 和 3.0。

为了防止你因错过了发布会而不太了解现状，我想再说一遍，除了*少数的* API 有所调整（之后会详细介绍）以外，Xcode 7 中的 Swift 2.2 和 Swift 2.3 基本是一致的。

所以！为了保持兼容性，我们还是用 Swift 2.3 来进行开发。

## Xcode 的设置

说这么多你应该已经很明白了。现在让我来告诉你如何设置 Xcode 项目，让它可以在这两个版本上运行。

### Swift 版本

![](http://radex.io/assets/2016/xcode7-xcode8/BuildSettings.png)

首先，在 Xcode 7 中打开你的项目，选中项目设置页的 Build settings  选项，然后点击 “+“ 来增加一个 User-Defined 设置项：

    
    “SWIFT_VERSION” = “2.3”

这个选项是 Xcode 8 新增的，因此，即使它表示该项目使用 Swift 2.3，Xcode 7（*实际上*它并没有 Swift 2.3）也会完全忽略这个设置并继续使用 Swift 2.2 来进行构建。

### Framework provisioning

Framework provisioning 的工作方式在 Xcode 8 上稍有不同 —— 如果是模拟器，它们会按原样继续编译，而对于真机会构建失败。

要解决这个问题，可以像设置 `SWIFT_VERSION` 时所做的一样，遍历 Build Settings 中所有的 Framework targets 并增加如下选项：

    
    “PROVISIONING_PROFILE_SPECIFIER” = “ABCDEFGHIJ/“

你需要把 “ABCDEFGHIJ“ 替换成你的团队 ID（你可以在 [Apple Developer Portal](https://developer.apple.com/account/#/membership/)中找到它），然后保留最后的斜杠。

这实际上就是告诉 Xcode 8 “嘿，我是来自这个团队的，你注意下 codesign，好吗？“，然后 Xcode 7 仍然会忽略这个设置，这样就万事大吉了。

### Interface Builder

浏览所有 `.xib` 和 `.storyboard` 文件，打开右侧边栏，选中第一个选项（File inspector），然后找到 “Opens in“ 设置项。

显示的内容很可能是 “Default (7.0)“，将它修改为 “Xcode 7.0“。这样就可以保证即使你是在 Xcode 8 中操作这个文件，也只能做一些可以向后兼容 Xcode 7 的变动。

再次提醒一定要注意在 Xcode 8 中对 XIB 所做的改动。因为它会添加一些 Xcode 版本相关的数据（不能确定的是应用上传到 App Store 之后这些数据是否会被移除掉），而且某些时候它还会尝试把文件回滚到只支持 Xcode 8 的格式（这是个 bug）。可能的话，尽可能避免在 Xcode 8 中操作 interface 文件，如果实在没办法，务必要仔细 review diff，并且只提交你需要的那几行。

### SDK 版本

确保项目所有构建目标的 “Base SDK“ 设置项都已被设置为了 “Latest iOS“。（大部分情况下默认设置就是这样的，但是还是要再次确认下。）这样一来，Xcode 7 就会针对 iOS 9 来进行编译，但是你可以在 Xcode 8 中打开同样的项目并使用 iOS 10 的新特性。

### CocoaPods 设置

如果你正在使用 CocoaPods，你同样也需要更新 Pods 项目的设置，以保证其 Swift 和 provisioning 的设置是正确的。

不过你可以通过在 `Podfile` 文件中添加如下 post-install 钩子脚本来代替手动设置：

    
    post_install do |installer|
      installer.pods_project.build_configurations.each do |config|
        # Configure Pod targets for Xcode 8 compatibility
        config.build_settings['SWIFT_VERSION'] = '2.3'
        config.build_settings['PROVISIONING_PROFILE_SPECIFIER'] = 'ABCDEFGHIJ/'
        config.build_settings['ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES'] = 'NO'
      end
    end

同样，记得把 `ABCDEFGHIJ` 替换成你的团队 ID。然后运行 `pod install` 来重新生成 Pods 项目。

（如果发现这个 Pod 不兼容 Swift 2.3，那么你需要为 Xcode 8 单独拉一个不同的分支， 这是由 Igor Palaguta 提供的[一个解决方案](https://twitter.com/radexp/status/760197303047168000)）

### 在 Xcode 8 中打开

好了，就是现在：在 Xcode 8 中打开这个项目。第一次打开的时候你会被大量的请求轰炸。

Xcode 会催促你升级到新版本的 Swift。忽略。

Xcode 还会建议更新项目的设置为 “推荐设置“，同样忽略。

记住，我们已经对项目做了设置，让它可以在两个版本下都可以编译通过。所以现在我们要做的是尽量少做改动，从而保证同时兼容。更重要的是，因为我们发布到 App Store 的文件是同一个，所以我们不希望 `.xcodeproj` 文件中包含任何 Xcode 8 相关的数据。

## 处理 Swift 2.3 的差异

就像我之前说过的，Swift 2.3 和 Swift 2.2 是相同的*语言*。然而，iOS 10 SDK 的 *frameworks* 已经更新了一些 Swift 的注释。我不是在谈论[大规模重命名](https://developer.apple.com/videos/play/wwdc2016/403/)（那只适用于 Swift 3.0）—— 不过，Swift 2.3 中许多 API 的名字，类型和可选性还是稍有一些变化的。

### 条件编译

考虑到你可能会忽略这一点， Swift 2.2 就[引入](https://github.com/apple/swift-evolution/blob/master/proposals/0020-if-swift-version.md)了编译预处理宏。用法很简单：

    
    #if swift(>=2.3)
    // this compiles on Xcode 8 / Swift 2.3 / iOS 10
    #else
    // this compiles on Xcode 7 / Swift 2.2 / iOS 9
    #endif

太棒了！一个文件，没有分支，同时兼容两个版本的 Xcode 。

有两个需要注意的事项：

 - ` #if swift(<2.3)` 这种写法是不存在的，只有 >=。如果要表达相反的意思，你可以写 `#if !swift(>=2.3)`。（如果需要的话你还可以使用 `#else` 和 `#elseif`）。
 - 不用于 C 预处理器，`#if` 和 `#else` 之间必须是有效的 Swift 代码。例如，你不能只改变函数签名而不改变函数体。（对于这点后面会有相应的处理方案）


### 可选性的变化

Swift 2.3 中很多签名都把不必要的可选性都去掉了，而有些（比如很多 `NSURL` 的属性）现在 *变成* 了可选值。

你当然也可以用条件编译来处理这个问题，比如：

    
    #if swift(>=2.3)
    let specifier = url.resourceSpecifier ?? ""
    #else
    let specifier = url.resourceSpecifier
    #endif

但是下面的方法可能会小有帮助：

    
    func optionalize<T>(x: T?) -> T? {
        return x
    }

我知道这有点难理解。也许你看过结果之后就会容易得多了：

    
    let specifier = optionalize(url.resourceSpecifier) ?? "" // 适用于两个版本！

这样就发挥了可选值的封装优势，从而避免在调用的时候写恶心的条件编译代码了。`optionalize()` 方法做的事情就是把任何传进去的值转换成可选值，除非传入的已经是可选值的情况，在这种情况下，它就把参数直接返回。这样一来，不管 `url.resourceSpecifier` 是（Xcode 8）不是（Xcode 7）可选值，“optionalized“版本永远是一样的。

（更深入地说：在 Swift 里面， `Foo` 可以被理解为 `Foo?` 的子类，因为你可以在不丢失信息的情况下把任何一个 `Foo` 类型的值封装成可选值。编译器一旦知道这点，它就允许传入一个非可选值来代替可选值参数 —— 将 `Foo` 封装到 `Foo?`。）

### 用别名来拯救签名的变化

Swift 2.3 中，一些方法（特别是在 macOS 的 SDK 中）修改了它们的参数类型。

比如，之前 `NSWindow` 的构造方法是这样的：

    
    init(contentRect: NSRect, styleMask: Int, backing: NSBackingStoreType, defer: Bool)

现在变成了这样：

    
    init(contentRect: NSRect, styleMask: NSWindowStyleMask, backing: NSBackingStoreType, defer: Bool)

注意看 `styleMask` 的类型。之前它是一个 Int 松散类型（以全局常量方式输入的选项），但是在 Xcode 8 中，它以更合理的 `OptionSetType` 类型输入。

不幸的是你不能条件编译函数体相同，而函数签名不同的两个版本。不过别担心，你可以通过条件编译给类型起别名的方式来解决这个问题！

    
    #if !swift(>=2.3)
    typealias NSWindowStyleMask = Int
    #endif

这样你就可以像 Swift 2.3 一样在方法签名中使用 `NSWindowStyleMask` 了。对于 Swift 2.2 而言，这个类型并不存在，`NSWindowStyleMask` 只是 `Int` 的一个别名，类型检查器仍然可以完美工作。

### 非正式 vs 正式协议

Swift 2.3 把一些之前的[非正式协议](https://developer.apple.com/library/ios/documentation/General/Conceptual/DevPedia-CocoaCore/Protocol.html) 改成了正式协议。

比如，要实现一个 `CALayer` 代理，你只需要继承 `NSObject` 就可以了，不需要声明它符合 `CALayerDelegate` 协议。事实上，这个协议在 Xcode 7 中根本就不存在，只是现在有了。

同样，直接对类声明那行代码做条件编译是不可行的。但是你可以通过在 Swift 2.2 中声明虚协议的方式来解决这个问题，就像下面这样：

    
    #if !swift(>=2.3)
    private protocol CALayerDelegate {}
    #endif
    
    class MyView: NSView, CALayerDelegate { . . . }

（[Joe Groff 指出](https://twitter.com/jckarter/status/758856922070065153)，你也可以为 `CALayerDelegate` 起一个叫做 `Any` 的别名 —— 同样的结果，但是没什么开销。）

## 构建 iOS 10 的特性

至此，你的项目可以同时在 Xcode 7 和 Xcode 8 上进行编译，不需要建立任何分支，这简直太棒了！

现在就是构建 iOS 10 特性的时候了，因为已经有了上面所说的各种提示和小技巧，所以这件事情会变得非常简单。但是，还是有一些需要注意的事情：

 1. 只用 `@available(iOS 10, *)` 和 `if #available(iOS 10, *)` 是不够的。首先，不要在发布的应用中编译任何 iOS 10 的代码，因为这样比较安全。更为重要的原因是，编译器需要检查这些代码，从而保证 API 的使用是安全的，这样就需要注意被调用的 API 是存在的。如果你使用了 iOS 9 的 SDK 中不存在的方法或者类型，那么你的代码就无法在 Xcode 7 中通过编译。
 2. 你需要把所有 iOS 10 专用的代码封装在 `#if swift(>=2.3)` 中（目前你可以认为 Swift 2.3 和 iOS 10 是相等的）。
 3. 大部分时候，你会*同时*需要条件编译（这样你就不会在 Xcode 7 中编译那些不可用的代码） 和 `@available/#available`（用来通过 Xcode 8 的安全检查）。
 4. 如果需要处理 iOS 10 独有的特性，最简单的方式就是把相关代码抽离到单独的文件中 —— 这样一来你就可以把整个文件的内容都包含在一个 `#if swift…` 判断中（在 Xcode 7 中这个文件还是可能会被编译器处理，但是里面的内容都会被忽略。）

## 应用扩展

但问题是，你可能想要在 iOS 10 上为你的应用添加一些新的扩展，而不是仅仅给应用本身添加更多的代码。

这就很棘手了。我们可以条件编译我们的代码，但是没有“条件目标“这种东西。

好消息是，只要 Xcode 7 无需实际地编译这些目标，它就不会向你抱怨什么。（是的，它可能会发出警告，告诉你项目包含一个目标，用于配置将应用部署到一个比基础 SDK 版本更高的 iOS 上，它会发布到一个比 base SDK 版本更高的 iOS 版本上，但是这不是什么大问题。）

所以方法就是：在每个地方都保留构建目标和它的代码，但是有选择地从应用构建目标 build phases 标签页的 “Target Dependencies“ 和 “Embed App Extensions“ 选项中移除它们。

如何做到这一点呢？我想到的最佳方式是默认禁用构建设置中的应用扩展，从而兼容 Xcode 7。然后只有在使用 Xcode 8的时候，才暂时重新添加这些扩展，并且任何时候都不提交这些变动。

如果每次都手动做，听起来太反复无常了（更别说与 CI 和自动化构建的不兼容），别担心，我帮你写了[一个脚本](https://github.com/radex/configure_extensions)！

安装：

    
    sudo gem install configure_extensions

在提交 Xcode 项目的任何变化之前，从应用的构建目标中移除 iOS 10 专用的应用扩展：

    
    configure_extensions remove MyApp.xcodeproj MyAppTarget NotificationsUI Intents

然后在 Xcode 8 中使用时，把它们添加回来：

    
    configure_extensions add MyApp.xcodeproj MyAppTarget NotificationsUI Intents

你可以把这个放到你的 `script/` 文件夹中，然后可以把它加到 Xcode 构建的预处理中，也可以加到 Git 的预提交 hook 上，或者集成到 CI 和自动化构建系统中。（更多信息请参照 [GitHub](https://github.com/radex/configure_extensions)）

关于 iOS 10 应用扩展需要注意的最后一点：Xcode 给这些扩展建立的模板是基于 Swift 3 的，而不是 Swift 2.3 的代码。所以一定要注意把应用扩展的 “Use Legacy Swift Language Version“ 构建选项设置为 “Yes“，然后把代码用 Swift 2.3 重写。

## 到了 9 月

到了 9 月份，iOS 10 就出来了，那个时候我们需要去掉对 Xcode 7 的支持并清理项目！

我给你准备了一个确认清单（记得加入书签，以备日后参考）：

 - 移除所有 Swift 2.2 的代码和不必要的 `#if swift(>=2.3)` 检查
 - 移除所有过渡处理，比如对 `optionalize()` 的使用，临时定义的别名，或是创建的虚协议
 - 移除 `configure_extensions` 脚本，然后把增加了新应用扩展支持的项目设置提交到代码库
 - 如果你使用了 CocoaPods，把它更新，然后移除之前我们添加到 Podfile 中 `post_install` hook（9月份以后基本就用不上了）
 - 更新为 Xcode 推荐的项目设置（在侧边栏中选中项目，然后在菜单中选择：Editor → Validate Settings…）
 - 考虑把 provisioning 设置升级，使用新的 `PROVISIONING_PROFILE_SPECIFIER`
 - 回滚所有的 `.xib` 和 `.storyboard` 的文件，使用默认设置 “Opens in: Latest Xcode (8.0)“。
 - 确保你依赖的所有 Swift 库都已经升级到了 Swift 3。如果没有，可以考虑自己对 Swift 3 移植做出贡献
 - 上面的步骤都搞定之后，就可以把应用更新到 Swift 3 了！找到 Edit → Convert → To Current Swift Syntax…，选择所有的构建目标（记住，你需要一次全部转换好），review 一下 diff，测试，然后提交！
 - 如果你尚未完成这些步骤，不妨考虑移除对 iOS 8 的支持——这样一来你就可以告别更多的 `@available` 检查和其他的条件语句。

祝好运！

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。