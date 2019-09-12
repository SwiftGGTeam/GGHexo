千呼万唤始出来☑️：SwiftWebUI"

> 作者：The Always Right Institute，[原文链接](http://www.alwaysrightinstitute.com/swiftwebui/)，原文日期：2019-06-30
> 译者：[Ji4n1ng](https://github.com/Ji4n1ng)；校对：[numbbbbb](http://numbbbbb.com/)，[WAMaker](https://github.com/WAMaker)；定稿：[Pancf](https://github.com/Pancf)
  ---










六月初，Apple 在 [WWDC 2019](https://developer.apple.com/wwdc19/) 上发布了 [SwiftUI](https://developer.apple.com/xcode/swiftui/)。SwiftUI 是一个“跨平台的”、“声明式”框架，用于构建 tvOS、macOS、watchOS 和 iOS 上的用户界面。[SwiftWebUI](https://github.com/SwiftWebUI/SwiftWebUI) 则将它带到了 Web 平台上✔️。



**免责声明**：这是一个玩具项目！不要用于生产。使用 SwiftWebUI 是为了了解更多关于 SwiftUI 本身及其内部工作原理的信息。

## SwiftWebUI

那么究竟什么是 [SwiftWebUI](https://github.com/SwiftWebUI/SwiftWebUI)？它允许你编写可以在 Web 浏览器中显示的 SwiftUI 的 [视图](https://developer.apple.com/documentation/swiftui/view)：

    
    import SwiftWebUI
    
    struct MainPage: View {
      @State var counter = 0
      
      func countUp() { counter += 1 }
      
      var body: some View {
        VStack {
          Text("🥑🍞 #\(counter)")
            .padding(.all)
            .background(.green, cornerRadius: 12)
            .foregroundColor(.white)
            .tapAction(self.countUp)
        }
      }
    }

结果是：

![](http://www.alwaysrightinstitute.com/images/swiftwebui/AvocadoCounter/AvocadoCounter.gif)

与其他一些工作不同，SwiftWebUI 不仅仅是将 SwiftUI 视图渲染为 HTML，而且还在浏览器和 Swift 服务器中托管的代码之间建立了一个连接，这样就可以实现各种交互功能——按钮、选择器、步进器、列表、导航等，这些都可以做到！

换句话说：[SwiftWebUI](https://github.com/SwiftWebUI/SwiftWebUI) 是针对浏览器的 SwiftUI API（很多部分但不是所有）的一种实现。

再次进行**免责声明**：这是一个玩具项目！不要用于生产。使用 SwiftWebUI 是为了了解更多关于 SwiftUI 本身及其内部工作原理的信息。

## 学习一次，随处使用

SwiftUI 的既定目标不是“[编写一次，随处运行](https://en.wikipedia.org/wiki/Write_once,_run_anywhere)”，而是“[学习一次，随处使用](https://developer.apple.com/videos/play/wwdc2019/216)”。不要期望在 iOS 上开发了一个漂亮的 SwiftUI 应用程序，然后将它的代码放入 SwiftWebUI 项目中，并让它在浏览器中呈现完全相同的内容。这不是我们的重点。

关键是能够重用 SwiftUI 的原理并使其在不同平台之间共享。在这种情况下，SwiftWebUI 就达到目的了✔️。

但是先让我们深入了解一下细节，并编写一个简单的 SwiftWebUI 应用程序。本着“学习一次，随处使用”的精神，首先观看这两个 WWDC 演讲：[介绍 SwiftUI](https://developer.apple.com/videos/play/wwdc2019/204/) 和 [SwiftUI 要点](https://developer.apple.com/videos/play/wwdc2019/216)。本文不会过多的深入数据流有关的内容，但这篇演讲同样推荐观看（这些概念在 SwiftWebUI 中被广泛支持）：[SwiftUI 中的数据流](https://developer.apple.com/videos/play/wwdc2019/226)。

## 要求

到目前为止，SwiftWebUI 需要安装 [macOS Catalina](https://www.apple.com/macos/catalina-preview/) 来运行（“Swift ABI”🤦‍♀️）。幸运的是，将 [Catalina 安装在单独的 APFS 卷](https://support.apple.com/en-us/HT208891) 上非常容易。并且需要安装 [Xcode 11](https://developer.apple.com/xcode/) 才能获得在 SwiftUI 中大量使用的 Swift 5.1 新功能。明白了吗？很好！

> Linux 呢？这个项目确实准备在 Linux 上运行，但尚未完成。唯一还没完成的事情是对 [Combine PassthroughSubject](https://developer.apple.com/documentation/combine/passthroughsubject) 的简单实现以及围绕它的一些基础设施。准备：[NoCombine](https://github.com/SwiftWebUI/SwiftWebUI/blob/master/Sources/SwiftWebUI/Misc/NoCombine.swift)。欢迎来提 PR！

> Mojave 呢？有一个可以在 Mojave 和 Xcode 11 上运行的办法。你需要创建一个 iOS 13 模拟器项目并在其中运行整个项目。

## 开始第一个应用程序

### 创建 SwiftWebUI 项目

启动 Xcode 11，选择“File > New > Project…”或按 Cmd-Shift-N：

![](http://www.alwaysrightinstitute.com/images/swiftwebui/ProjectSetup/1-new-project.png)

选择“macOS / Command Line Tool”项目模板:

![](http://www.alwaysrightinstitute.com/images/swiftwebui/ProjectSetup/2-new-cmdline-tool.png)

给它取个好听的名字，用“AvocadoToast”吧：

![](http://www.alwaysrightinstitute.com/images/swiftwebui/ProjectSetup/3-swift-project-name.png)

然后，添加 [SwiftWebUI](https://github.com/SwiftWebUI/SwiftWebUI) 作为 Swift Package Manager 的依赖项。该选项隐藏在“File / Swift Packages”菜单中：

![](http://www.alwaysrightinstitute.com/images/swiftwebui/ProjectSetup/4-add-pkg-dep.png)

输入 `https://github.com/SwiftWebUI/SwiftWebUI.git` 作为包的 URL：

![](http://www.alwaysrightinstitute.com/images/swiftwebui/ProjectSetup/5-add-swui-dep-large.png)

使用“Branch” `master` 选项，以便于总能获得最新和最好的版本（也可以使用修订版或 `develop` 分支）:

![](http://www.alwaysrightinstitute.com/images/swiftwebui/ProjectSetup/6-branch-select-large.png)

最后，将 SwiftWebUI 库添加到你的工具的 `target` 中:

![](http://www.alwaysrightinstitute.com/images/swiftwebui/ProjectSetup/7-target-select-large.png)

这就完成了创建。你现在有了一个可以导入 SwiftWebUI 的工具项目。（Xcode 可能需要一些时间来获取和构建依赖。）

### SwiftWebUI Hello World

让我们开始使用 SwiftWebUI。打开 `main.swift` 文件，将其内容替换为：

    
    import SwiftWebUI
    
    SwiftWebUI.serve(Text("Holy Cow!"))

在 Xcode 中编译并运行该应用程序，打开 Safari，然后访问 [`http://localhost:1337/`](http://localhost:1337/)：

![](http://www.alwaysrightinstitute.com/images/swiftwebui/HolyCow/holycow.png)

这里发生了什么：首先导入 SwiftWebUI 模块（不要意外导入 macOS SwiftUI 😀）。

然后我们调用了 `SwiftWebUI.serve`，它要么接受一个返回视图的闭包，要么就直接是一个视图——如下所示：一个 [`Text`](https://developer.apple.com/documentation/swiftui/text) 视图（也称为“UILabel”，它可以显示纯文本或格式化的文本）。

#### 幕后发生的事情

在内部，[`serve`](https://github.com/SwiftWebUI/SwiftWebUI/blob/master/Sources/SwiftWebUI/ViewHosting/Serve.swift#L66) 函数创建一个非常简单的 [SwiftNIO](https://github.com/apple/swift-nio) HTTP 服务器，它将会监听 1337 端口。当浏览器访问该服务器时，它会创建一个 [session](https://github.com/SwiftWebUI/SwiftWebUI/blob/master/Sources/SwiftWebUI/ViewHosting/NIOHostingSession.swift)（会话）并将（Text）视图传递给该会话。

最后，SwiftWebUI 在服务器上根据这个视图来创建一个“Shadow DOM”，将其渲染为 HTML 并将结果发送到浏览器。“Shadow DOM”（和状态对象保持在一起）存储在会话中。

> 这是 SwiftWebUI 应用程序与 watchOS 或 iOS SwiftUI 应用程序之间的区别。单个 SwiftWebUI 应用程序为一组用户提供服务，而不仅仅是一个用户。

### 添加一些交互

第一步，更好地组织代码。在项目中创建一个新的 Swift 文件，并将其命名为 `MainPage.swift`。然后向其中添加一个简单的 SwiftUI 视图的定义：

    
    import SwiftWebUI
    
    struct MainPage: View {
      
      var body: some View {
        Text("Holy Cow!")
      }
    }

修改 `main.swift` 来让 SwiftWebUI 作用于我们的定制视图:

    
    SwiftWebUI.serve(MainPage())

现在，可以把 `main.swift` 放到一边，在自定义视图中完成所有工作。添加一些交互：

    
    struct MainPage: View {
      @State var counter = 3
      
      func countUp() { counter += 1 }
      
      var body: some View {
        Text("Count is: \(counter)")
          .tapAction(self.countUp)
      }
    }

[`视图`](https://developer.apple.com/documentation/swiftui/view) 有了一个名为 counter 的持久 [状态](https://developer.apple.com/documentation/swiftui/state) 变量（不知道这是什么？再看一下 SwiftUI 的介绍）。还有一个可以使计数器加一的小函数。

然后，使用 SwiftUI [`tapAction`](https://developer.apple.com/documentation/swiftui/text/3086357-tapaction) 修饰符将事件处理程序附加到 `Text`。最后，在标签中显示当前值：

![](http://www.alwaysrightinstitute.com/images/swiftwebui/HolyCow/ClickCounter.gif)

🧙*魔法*🧙

#### 幕后发生的事情

这是如何运作的？当浏览器访问端点时，SwiftWebUI 在其中创建了会话和“Shadow DOM”。然后将描述视图的 HTML 发送到浏览器。`tapAction` 通过向 HTML 添加 `onclick` 处理程序来工作。SwiftWebUI 还向浏览器发送 JavaScript（少量，没有大的 JavaScript 框架！），处理点击并将其转发到 Swift 服务器。

然后 SwiftUI 的魔法开始生效。SwiftWebUI 将 click 事件与“Shadow DOM”中的事件处理程序相关联，并调用 `countUp` 函数。该函数通过修改 `counter` [`状态`](https://developer.apple.com/documentation/swiftui/state) 变量，使视图的渲染无效。SwiftWebUI 开始工作，并对“Shadow DOM”中的变更进行差异比较。然后将这些变更发送回浏览器。

> “变更”作为 JSON 数组发送，页面中的小型 JavaScript 可以处理这些数组。如果整个子树发生了变化（例如，如果用户导航到一个全新的视图），则变更可以是应用于 `innerHTML` 或 `outerHTML` 的更大的 HTML 片段。
>
> 但通常情况下，这些变更都很小，例如 `添加类`，`设置 HTML 属性` 等（即浏览器 DOM 修改）。

## 🥑🍞 Avocado Toast

太好了，基础的部分可以正常工作了。让我们引入更多的交互。以下是基于 [SwiftUI 要点](https://developer.apple.com/videos/play/wwdc2019/216) 演讲中演示 SwiftUI 的“Avocado Toast App”。没看过吗？你应该看看，讲的是美味的吐司。

> HTML / CSS 样式不漂亮也不完美。你知道，我们不是网页设计师，而且需要帮助。欢迎来提交 PR！

想要跳过细节，观看应用程序的 GIF 并在 GitHub 上下载：[🥑🍞](http://www.alwaysrightinstitute.com/swiftwebui/#the--finished-app)。

### 🥑🍞订单

谈话从这（~6:00）开始，可以将这些代码添加到新的 `OrderForm.swift` 文件中：

    
    struct Order {
      var includeSalt            = false
      var includeRedPepperFlakes = false
      var quantity               = 0
    }
    struct OrderForm: View {
      @State private var order = Order()
      
      func submitOrder() {}
      
      var body: some View {
        VStack {
          Text("Avocado Toast").font(.title)
          
          Toggle(isOn: $order.includeSalt) {
            Text("Include Salt")
          }
          Toggle(isOn: $order.includeRedPepperFlakes) {
            Text("Include Red Pepper Flakes")
          }
          Stepper(value: $order.quantity, in: 1...10) {
            Text("Quantity: \(order.quantity)")
          }
          
          Button(action: submitOrder) {
            Text("Order")
          }
        }
      }
    }

在 `main.swift` 中直接用 `SwiftWebUI.serve()` 测试新的 `OrderForm` 视图。

这就是浏览器中的样子：

![](http://www.alwaysrightinstitute.com/images/swiftwebui/AvocadoOrder/orderit.gif)

> [SemanticUI](https://semantic-ui.com/) 用于在 SwiftWebUI 中设置一些样式。SemanticUI 并不是必须的，这里只是用它的控件来美化界面。
>
> 注意：仅使用 CSS 和字体，而不是 JavaScript 组件。

### 幕间休息：一些 SwiftUI 布局

在 [SwiftUI 要点](https://developer.apple.com/videos/play/wwdc2019/216) 演讲的 16:00 左右，他们将介绍 SwiftUI 布局和视图修改器排序：

    
    var body: some View {
      HStack {
        Text("🥑🍞")
          .background(.green, cornerRadius: 12)
          .padding(.all)
        
        Text(" => ")
        
        Text("🥑🍞")
          .padding(.all)
          .background(.green, cornerRadius: 12)
      }
    }

结果如下，请注意修饰符的排序是如何相关的：

![](http://www.alwaysrightinstitute.com/images/swiftwebui/AvocadoLayout.png)

> SwiftWebUI 尝试复制常见的 SwiftUI 布局，但还没有完全成功。毕竟它必须处理浏览器提供的布局系统。需要帮助，欢迎弹性盒布局相关的专家！

### 🥑🍞订单历史

回到应用程序，演讲（~19:50）介绍了 [列表](https://developer.apple.com/documentation/swiftui/list) 视图，用于显示 Avocado toast 订单历史记录。这就是它在 Web 上的外观：

![](http://www.alwaysrightinstitute.com/images/swiftwebui/OrderHistory/OrderHistory1.png)

`列表` 视图遍历已完成订单的数组，并为每个订单创建一个子视图（`OrderCell`），并传入列表中的当前项。

这是我们使用的代码：

    
    struct OrderHistory: View {
      let previousOrders : [ CompletedOrder ]
      
      var body: some View {
        List(previousOrders) { order in
          OrderCell(order: order)
        }
      }
    }
    
    struct OrderCell: View {
      let order : CompletedOrder
      
      var body: some View {
        HStack {
          VStack(alignment: .leading) {
            Text(order.summary)
            Text(order.purchaseDate)
              .font(.subheadline)
              .foregroundColor(.secondary)
          }
          Spacer()
          if order.includeSalt {
            SaltIcon()
          }
          else {}
          if order.includeRedPepperFlakes {
            RedPepperFlakesIcon()
          }
          else {}
        }
      }
    }
    
    struct SaltIcon: View {
      let body = Text("🧂")
    }
    struct RedPepperFlakesIcon: View {
      let body = Text("🌶")
    }
    
    // Model
    
    struct CompletedOrder: Identifiable {
      var id           : Int
      var summary      : String
      var purchaseDate : String
      var includeSalt            = false
      var includeRedPepperFlakes = false
    }

> SwiftWebUI 列表视图效率很低，它总是呈现整个子集合。没有单元格重用，什么都没有😎。在一个网络应用程序中有各种各样的方法来处理这个问题，例如使用分页或更多客户端逻辑。

你不必手动输入演讲中的样本数据，我们为你提供了这些数据：

    
    let previousOrders : [ CompletedOrder ] = [
      .init(id:  1, summary: "Rye with Almond Butter",  purchaseDate: "2019-05-30"),
      .init(id:  2, summary: "Multi-Grain with Hummus", purchaseDate: "2019-06-02",
            includeRedPepperFlakes: true),
      .init(id:  3, summary: "Sourdough with Chutney",  purchaseDate: "2019-06-08",
            includeSalt: true, includeRedPepperFlakes: true),
      .init(id:  4, summary: "Rye with Peanut Butter",  purchaseDate: "2019-06-09"),
      .init(id:  5, summary: "Wheat with Tapenade",     purchaseDate: "2019-06-12"),
      .init(id:  6, summary: "Sourdough with Vegemite", purchaseDate: "2019-06-14",
            includeSalt: true),
      .init(id:  7, summary: "Wheat with Féroce",       purchaseDate: "2019-06-31"),
      .init(id:  8, summary: "Rhy with Honey",          purchaseDate: "2019-07-03"),
      .init(id:  9, summary: "Multigrain Toast",        purchaseDate: "2019-07-04",
            includeSalt: true),
      .init(id: 10, summary: "Sourdough with Chutney",  purchaseDate: "2019-07-06")
    ]

### 🥑🍞涂抹酱选择器

选择器控件以及如何将它与枚举一起使用将在（~43:00）进行演示。首先是各种吐司选项的枚举：

    
    enum AvocadoStyle {
      case sliced, mashed
    }
    
    enum BreadType: CaseIterable, Hashable, Identifiable {
      case wheat, white, rhy
      
      var name: String { return "\(self)".capitalized }
    }
    
    enum Spread: CaseIterable, Hashable, Identifiable {
      case none, almondButter, peanutButter, honey
      case almou, tapenade, hummus, mayonnaise
      case kyopolou, adjvar, pindjur
      case vegemite, chutney, cannedCheese, feroce
      case kartoffelkase, tartarSauce
    
      var name: String {
        return "\(self)".map { $0.isUppercase ? " \($0)" : "\($0)" }
               .joined().capitalized
      }
    }

可以将这些代码添加到 `Order` 结构体中：

    
    struct Order {
      var includeSalt            = false
      var includeRedPepperFlakes = false
      var quantity               = 0
      var avocadoStyle           = AvocadoStyle.sliced
      var spread                 = Spread.none
      var breadType              = BreadType.wheat
    }

然后使用不同的选择器类型来显示它们。如何循环枚举值非常简单：

    
    Form {
      Section(header: Text("Avocado Toast").font(.title)) {
        Picker(selection: $order.breadType, label: Text("Bread")) {
          ForEach(BreadType.allCases) { breadType in
            Text(breadType.name).tag(breadType)
          }
        }
        .pickerStyle(.radioGroup)
        
        Picker(selection: $order.avocadoStyle, label: Text("Avocado")) {
          Text("Sliced").tag(AvocadoStyle.sliced)
          Text("Mashed").tag(AvocadoStyle.mashed)
        }
        .pickerStyle(.radioGroup)
        
        Picker(selection: $order.spread, label: Text("Spread")) {
          ForEach(Spread.allCases) { spread in
            Text(spread.name).tag(spread) // there is no .name?!
          }
        }
      }
    }

结果是：

![](http://www.alwaysrightinstitute.com/images/swiftwebui/AvocadoOrder/picker.png)

> 同样，这需要一些对 CSS 的热爱来让它看起来更好看…

### 完成后的🥑🍞应用

不，我们与原版略有不同，也没有真正完成应用。它看起来并不那么棒，但毕竟只是一个演示示例😎。

![](http://www.alwaysrightinstitute.com/images/swiftwebui/AvocadoOrder/AvocadoToast.gif)

完成后的应用程序可在GitHub：[AvocadoToast](https://github.com/SwiftWebUI/AvocadoToast) 上获取。

## HTML 和 SemanticUI

[`UIViewRepresentable`](https://developer.apple.com/documentation/swiftui/uiviewrepresentable) 在 SwiftWebUI 中对应的实现，是直接使用原始 HTML。

它提供了两种变体，一种是 HTML 按原样输出字符串，另一种是通过 HTML 转义内容：

    
    struct MyHTMLView: View {
      var body: some View {
        VStack {
          HTML("<blink>Blinken Lights</blink>")
          HTML("42 > 1337", escape: true)
        }
      }
    }

使用这个原语，基本上可以构建所需的任何 HTML。

还有一种更高级的用法是 HTMLContainer，SwiftWebUI 内部也用到了它。例如，这是步进器控件的实现：

    
    var body: some View {
      HStack {
        HTMLContainer(classes: [ "ui", "icon", "buttons", "small" ]) {
          Button(self.decrement) {
            HTMLContainer("i", classes: [ "minus", "icon" ], body: {EmptyView()})
          }
          Button(self.increment) {
            HTMLContainer("i", classes: [ "plus", "icon" ], body: {EmptyView()})
          }
        }
        label
      }
    }

HTMLContainer 是“响应式的”，即如果类、样式或属性发生变化，它将触发（emit）常规 DOM 变更（而不是重新渲染整个内容）。

### SemanticUI

SwiftWebUI 还附带了一些预先设置的 [SemanticUI](https://semantic-ui.com/) 控件：

    
    VStack {
      SUILabel(Image(systemName: "mail")) { Text("42") }
      HStack {
        SUILabel(Image(...)) { Text("Joe") } ...
      }
      HStack {
        SUILabel(Image(...)) { Text("Joe") } ...
      }
      HStack {
        SUILabel(Image(...), Color("blue"), 
                 detail: Text("Friend")) 
        {
          Text("Veronika")
        } ...
      }
    }

……渲染为如下内容：

![](http://www.alwaysrightinstitute.com/images/swiftwebui/SemanticUI/labels.png)

> 请注意，SwiftWebUI 还支持一些 SFSymbols 图像名称（通过 `Image(systemName:)` 来使用）。这些都得到了 SemanticUI [对 Font Awesome 的支持](https://semantic-ui.com/elements/icon.html)。

还有 `SUISegment`，`SUIFlag` 和 `SUICARD`：

    
    SUICards {
      SUICard(Image.unsplash(size: UXSize(width: 200, height: 200),
                             "Zebra", "Animal"),
              Text("Some Zebra"),
              meta: Text("Roaming the world since 1976"))
      {
        Text("A striped animal.")
      }
      SUICard(Image.unsplash(size: UXSize(width: 200, height: 200),
                             "Cow", "Animal"),
              Text("Some Cow"),
              meta: Text("Milk it"))
      {
        Text("Holy cow!.")
      }
    }

……渲染为这些内容：

![](http://www.alwaysrightinstitute.com/images/swiftwebui/SemanticUI/cards.png)

添加此类视图非常简单，也非常有趣。可以使用 ~~WOComponent~~ 的 SwiftUI 视图来快速构建相当复杂和美观的布局。

> `Image.unsplash` 根据 `http://source.unsplash.com` 上运行的 Unsplash API 来构建图像的查询。只需给它一些查询词、大小和可选范围。
>
> 注意：有时，特定的 Unsplash 服务似乎有点慢且不可靠。

# 总结

这就是我们的演示示例。我们希望你能喜欢！但要再次进行**免责声明**：这是一个玩具项目！不要用于生产。使用 SwiftWebUI 是为了了解更多关于 SwiftUI 本身及其内部工作原理的信息。

我们认为它是一个很好的玩具，可能也是一个有价值的工具，以便于更多地了解 SwiftUI 的内部工作原理。

## 技术随记

这些只是关于该技术的各个方面的一些笔记。可以跳过，这个不是那么的有趣😎。

### 问题

SwiftWebUI 有很多问题，有些是在 GitHub 上提出的：[Issues](https://github.com/SwiftWebUI/SwiftWebUI/issues)。欢迎来提更多问题。

相当多的 HTML 布局的东西有问题（例如 `ScrollView` 并不总是滚动的），还有一些像 Shapes 这样的正在讨论方案的功能也有问题（可能通过 SVG 和 CSS 很容易做到）。

哦，还有一个例子是 If-ViewBuilder 不能正常工作。不明白为什么：

    
    var body: some View {
      VStack {
        if a > b {
          SomeView()
        }
        // currently need an empty else: `else {}` to make it compile.
      }
    }

需要帮忙！欢迎来提交 PR！

### 与原来的 SwiftUI 相比

本文的实现非常简单且效率低下。在现实情况下，必须以更高的速率来处理状态修改事件，以 60Hz 的帧速率做所有的动画等等。

我们侧重于使基本操作正确，例如状态和绑定如何工作，视图如何以及何时更新等等。很可能本文的实现在某些方面并不正确，可能是因为 Apple 忘了将原始资源作为 Xcode 11 的一部分发送给我们。

### WebSockets

我们目前使用 AJAX 将浏览器连接到服务器。使用 WebSockets 有多种优势：

- 保证了事件的顺序（AJAX 请求可能不同步到达）
- 非用户发起的服务器端 DOM 更新（定时器、推送）
- 会话超时指示器

这会让实现一个聊天客户端的演示示例变得非常容易。

添加 WebSockets 实际上非常简单，因为事件已经作为 JSON 发送了。我们只需要客户端和服务器端的垫片（shims）。所有这些都已经在 [swift-nio-irc-webclient](https://github.com/NozeIO/swift-nio-irc-webclient) 中试用过了，只需要移植一下。

### SPA

SwiftWebUI 的当前版本是一个连接到有状态后端服务器的 SPA（单页面应用程序）。

还有其他方法可以做到这一点，例如，当用户通过正常的链接遍历应用程序时，保持树的状态。又名 WebObjects。;-)

一般来说，最好能更好地控制 DOM ID 生成、链接生成以及路由等等。这和 [SwiftObjects](http://swiftobjects.org/) 所提供的方式类似。

但是最终用户将不得不放弃很多本可以“学习一次，随处使用”的功能，因为 SwiftUI 操作处理程序通常是围绕着捕捉任意状态的事实来构建的。

我们将会期待基于 Swift 的服务器端框架提出什么更好的东西来👽。

### WASM

一旦我们找到合适的 Swift WASM（WebAssembly），SwiftWebUI 就会更有用处。期待 WASM！

### WebIDs

有些像 `ForEach` 这样的 SwiftUI 视图需要 `Identifiable` 对象，其中的 `id` 可以是任何 `Hashable`。这在 DOM 中不太好，因为我们需要基于字符串的 ID 来识别节点。

这是通过将 ID 映射到全局映射中的字符串来解决的。这在技术上是无界的（一个类引用的特定问题）。

总结：对于 web 代码，最好使用字符串或整型来标识个体。

### 表单

表单需要做得更好：[Issue](https://github.com/SwiftWebUI/SwiftWebUI/issues/10)。

SemanticUI 有一些很好的表单布局，我们可能参照这些布局重写子树。有待商榷。

## 面向 Swift 的 WebObjects 6

花了点时间在文章中嵌入了下面这个可点击的 Twitter 控件。（译者注：由于某些原因，这里没办法像原文一样嵌入 Twitter 控件，只能放链接。）

[https://twitter.com/helje5/status/1137092138104233987/photo/1?ref_src=twsrc%5Etfw%7Ctwcamp%5Etweetembed%7Ctwterm%5E1137092138104233987&ref_url=http%3A%2F%2Fwww.alwaysrightinstitute.com%2Fswiftwebui%2F](https://twitter.com/helje5/status/1137092138104233987/photo/1?ref_src=twsrc^tfw|twcamp^tweetembed|twterm^1137092138104233987&ref_url=http%3A%2F%2Fwww.alwaysrightinstitute.com%2Fswiftwebui%2F)

苹果确实给了我们一个“Swift 风格”的 WebObjects 6！

下一篇：直面 Web 和一些 Swift 化的 EOF（又名 CoreData 又名 ZeeQL）。

## 链接

- GitHub：[SwiftWebUI](https://github.com/SwiftWebUI/SwiftWebUI)
- SwiftUI
  - [介绍 SwiftUI](https://developer.apple.com/videos/play/wwdc2019/204/)（204）
  - [SwiftUI 要点](https://developer.apple.com/videos/play/wwdc2019/216) （216）
  - [SwiftUI 中的数据流](https://developer.apple.com/videos/play/wwdc2019/226)（226）
  - [SwiftUI 框架 API](https://developer.apple.com/documentation/swiftui)
- [SwiftObjects](http://swiftobjects.org/)
- SemanticUI
  - [Font Awesome](https://fontawesome.com/)
  - [SemanticUI Swift](https://github.com/SwiftWebResources/SemanticUI-Swift)
- [SwiftNIO](https://github.com/apple/swift-nio)

## 联系方式

嘿，我们希望你能喜欢这篇文章，并且也希望得到你的反馈！

Twitter（任何一个都可以）：[@helje5](https://twitter.com/helje5)，[@ar_institute](https://twitter.com/ar_institute)。

电子邮件：wrong@alwaysrightinstitute.com

Slack：在 SwiftDE、swift-server、noze、ios-developers 上找到我们。

*写于 2019 年 6 月 30 日*

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。