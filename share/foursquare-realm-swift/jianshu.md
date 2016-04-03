如何使用 Swift、Foursquare API 及 Realm 构建一款 Coffee Shop 应用"

> 作者：reinder de vries，[原文链接](http://www.appcoda.com/foursquare-realm-swift/)，原文日期：2015-11-23
> 译者：[小铁匠Linus](http://linusling.com)；校对：[saitjr](http://www.saitjr.com)；定稿：[numbbbbb](http://numbbbbb.com/)
  










我们经常说，程序员喝进去的是咖啡，吐出来的是代码。让我们换一个角度去思考，来做一个显示附近咖啡店的 App。

这篇文章中，用到了以下技能：

- Swift，Xcode 和 Interface Builder（Auto Layout, Constraints 和 Storyboards）
- Realm，一种本地存储方案，轻量级的 Core Data
- 使用 Foursquare 和 Das Quadrat 库访问 REST API
- CocoaPods 和 Geolocation

这个 App 可以检测当前用户的 500 平方米的范围，并从 Foursquare 拿到附近咖啡店的地理信息。我们将使用 map view（`MKMapView`）和一个 table view（`UITableView`）来展示数据。当然，还要使用 Realm 来过滤数据，并使用闭包来对数据进行排序。



![](http://www.appcoda.com/wp-content/uploads/2015/11/foursquare-api.jpg)

你可以从 GitHub [reinderdevries/CoffeeGuide](https://github.com/reinderdevries/CoffeeGuide) 上下载所有源代码和 Xcode 项目。

让我们开始码代码吧！

## 设置 Xcode

第一步，创建工程。打开 Xcode，选择 File -> New -> Project...

在分类中，选择 iOS -> Application -> Single View Application，然后填写一下信息：

- Product Name：Coffee
- Organisation Name：随便写一个
- Organisation Identifier：也随便写一个，使用的格式如：com.mycompanyname
- Language：Swift（当然是 Swift 了）
- Devices：iPhone
- 取消 Core Data，勾选 Unit Tests 和 UI Tests

选择工程的存储路径，不用勾选 create a local Git repository。

接着创建 Podfile。在项目名称上（工程目录选项卡）点击右键，选择 New File ... 如下图所示，选择 iOS -> Other -> Empty。

![](http://www.appcoda.com/wp-content/uploads/2015/11/coffee_2.png)

文件命名为 Podfile（不要文件扩展名）并**确保**它和 .xcodeproj 文件在同一级目录下！还要勾选 Target 栏里的 Coffee 选框。

![](http://www.appcoda.com/wp-content/uploads/2015/11/coffee_3.png)

然后复制下面的代码到 Podfile里：（译者注：以下是原文的代码，但是有个地方错了：`useframeworks!` 要改为 `use_frameworks!` ）

    ruby
    source 'https://github.com/CocoaPods/Specs.git'
    platform :ios, '8.0'
    useframeworks!
    
    pod 'QuadratTouch', '>= 1.0'
    pod 'RealmSwift'

项目集成了两个第三方类库：Realm 和 Das Quadrat（一个  Foursquare REST API 的 Swift 库）。

然后，退出工程并关闭 Xcode（最好完全关闭）。打开 OS X 终端，cd 到你的工程目录下。详细步骤如下：

1. 打开终端
2. 键入`cd `（c-d-空格）
3. 打开文件夹
4. 定位到你工程目录的那个文件夹，但是不要点进去
5. 把文件夹拖到终端里
6. 这样，工程的绝对路径会显示在 `cd `的后面
7. 回车
8. 这样，就进入正确的工程目录了

现在，在终端里输入：

    ruby
    pod install

稍等一会，会出现几行信息，这表示 Cocoapods 已按照之前设置的要求把需要的第三方库装进 Xcode 了，同时，我们的工程已经变成 workspace （编辑模式）了。

这步完成后，找到新生成的 .xcworkspace 文件并将其打开。以后都用它打开工程。

注意：如果打开 workspace 以后发现工程目录里面是空的，那就重新用 .xcodeproj 文件打开工程。然后关闭它，也关闭 workspace，然后再重新用 .xcworkspace 打开工程。这样应该就没什么问题了。

好了，这就是 Xcode 所需的全部设置。如果每个步骤都设置正确，那么现在工程目录中会有两个 Project。Pods 的 project 中包含 Realm 和 Das Quadrat 的库文件。

## 在 Storyboards 中构建 UI 元素

这个 App 的 UI 极其简单，一共就两个 UI 控件：map view 和 table view 。

Xcode 已经为你完成了大部分工作， Single View Application 模板包含了一个 `Main.storyboard`，它是程序入口。

接下来，配置 map view ，步骤如下：

1.  打开 `Main.storyboard` 
2.  在 Xcode 右下部分的 Object Library 里，找到 Map Kit View （`MKMapKitView`）
3.  把它拖到 View Controller 里面，左上角顶格，宽度和 View Controller 一样，高度是 View Controller 的一半。（译者注：其实是 View Controller 的 View ，大家能理解就好）
4.  接着，再从 Object Library 里找到 Table View （`UITableView`），并把它拖到 View Controller 里面，宽度与 View Controller 一样，高度填满屏幕的剩余部分。

然后，给两个 View 设置右边距约束。首先，选中 map view ，点击 Pin 按钮（编辑区右下角的倒数第二个按钮，看起来像星球大战里面的战机…（译者注：感觉作者也被自己的比喻无语到了...））

点击以后，会有一个弹出框，操作步骤如下：

1. 取消 Constrain to margins 的选中状态
2. 选中左、上、右的线，选中后会变成红色的高亮状态
3. 每条线旁边都有一个输入框，确保输入框中的值都是 0
4. 最后，点击 Add 3 constraints 按钮

![](http://www.appcoda.com/wp-content/uploads/2015/11/coffee_5.png)

接着，也给 table view 添加约束。步骤和之前一样，但是 table view 添加的是 左、下、右三个约束。同样需要注意 Constrain to margins 是未选中状态，然后点击 Add 3 constraints 按钮。

现在已经给两个 View 添加了以下这些约束：各自上下边距的约束，宽度和父容器相同。还差最后一个步骤，需要确保两个 View 的高度各占父容器的一半。

你可以通过给约束设置一个倍数来达到效果，但是以下是一个更简单的方法：

1. 同时选中 table view 和 map view（按住 Command 键并选中两者）
2. 点击 Pin 按钮
3. 选中 Equal Heights 选框
4. 点击 Add 1 constraint 按钮

OK，这个时候 Xcode 可能会有报错，别担心，照下面的步骤来解决：

1. 选中 map view，点击 Pin 按钮
2. 取消 Constrain to margins，选中下边距约束，并在输入框中键入0
3. 点击 Add 1 constraint

现在，红色的线（报错）消失了，但是有可能会出现黄色的线（警告）。意思是说，展示的 frame 可能和添加的约束不一致。其实这个时候所有的约束都加了，只是 Interface Builder 没有正确显示更新而已。

解决方式：在 Document Outline 中，点击有小箭头的黄色按钮。

点击黄色的小箭头以后，会跳到一个新的界面。然后，在新的界面中点击黄色的三角形 -> Update frames -> Fix misplacement 。如果还有黄色三角，重复上一个步骤。有可能，更新后的 frame 不是你想要的，所以添加约束的时候就一定要注意，一定要添加对。（译者注：作者这里解决警告的方式太麻烦了，其实可以在 Document Outline 中选中 View ，点击 Pin 按钮右边的 Resolve Auto Layout Issues 按钮，然后选择下面的那个 Update frames 就行了）。

在添加约束的过程中很容易出错，最简单的解决方式是，在 Document Outline 中删除所有约束，重新来一遍。（译者注：同样，选中要删除约束的 View ，点击 Resolve Auto Layout Issues ，点击 Clear Constraints 就行。植入硬广一则：@saitjr 的[Autolayout 案例讲解](http://www.saitjr.com/ios/ios-autolayout-demo.html)）

![](http://www.appcoda.com/wp-content/uploads/2015/11/coffee_7.png)

## 构建 App 并解决错误

在开发过程中，应该时不时跑一下程序，这样可以及时发现错误并解决。

在有了一定的开发经验以后，写一点代码就运行程序的现象会越来越少。但如果你是新手，那就尽量将开发步骤细分，每改动一点，就跑起来看看效果。这样就可以将代码错误定位到最小范围。

运行程序有两个快捷键：Command + B 或者 Command + R。前者是编译，后者是编译并运行。在 Xcode 的左上角可以选择 iPhone 型号和版本。这里也可以选择使用真机测试，那需要加入苹果开发者计划。

刚好我们的程序有个错误，来看一下怎么解决。运行程序，先找到控制台（在 Xcode 底部窗口的右栏）。如图：

![](http://www.appcoda.com/wp-content/uploads/2015/11/coffee_8.png)

如果没找到底栏，可以在 Xcode 右上角打开底栏，然后点击底栏右边的按钮，打开右栏。（译者注：一图胜千言，如上图）

然后控制台上可以看到如下错误：

    ruby
    2015-11-04 14:37:56.353 Coffee[85299:6341066] *** Terminating app due to uncaught exception 'NSInvalidUnarchiveOperationException', reason: 'Could not instantiate class named MKMapView'
        *** First throw call stack:
        (
            0   CoreFoundation                      0x0000000109fdff65 exceptionPreprocess + 165

苦逼的是，控制台显示的错误信息太复杂，而且，有些时候甚至连错误信息都没有显示。大多数运行时错误由以下三种组成：异常信息、崩溃原因和堆栈信息。

以上三个信息可以帮助你定位错误。举个例子，你可以通过异常信息找到抛出异常的代码段。堆栈信息显示的是报错前程序调用的类与方法。这个过程一般被称为回溯，可追溯到报错的代码。

现在来看看错误信息，其实很好理解：

    ruby
    Could not instantiate class named MKMapView

咦，`MKMapView` 看起来很眼熟吧。对，刚刚才在 Interface Builder 里面见过，拖到界面上半部分的那个 View 就是。报错中出现的 “instantiate” 是实例化的意思，这是一个术语。错误含义是：编译器（Xcode 中，把代码转成二进制目标文件的工具）不能创建一个 `MKMapView` 给你。简单点理解就是：创建 map view 失败了。

其实，99%的错误信息都不告诉你怎么去解决问题，它们只是告诉你这里出错，却连错误原因都没写。

你能做的就两点：

1.  甩手不做了，剧终；
2.  去 Google （度娘就算了，对英文支持太差）

把错误信息复制下来，去 Google 吧，搜索结果一般是这样的：

![](http://www.appcoda.com/wp-content/uploads/2015/11/google-search.png)

点击第一个链接就行，这是个 Stack Overflow 的链接（一个专为程序员设计的问答网站）。这网站上的问题几乎涵盖了所有的编程语言，而且都解决得相当完美。

在 StackOverFlow 上解求问题的答案，你应该按照以下步骤：

1.  查看问题是否有答案，如果没有，就到 Google 里继续找。如果有些问题还没有答案，你也可以去回答。
2.  回到我们的问题上来，撇开标题不看，答案通常隐藏在下面的评论当中。
3.  找到被采纳的回答（回答下面有绿色的对勾），然后看看下面的评论（评论通常比回答有效）。左边的数字，是这个回答收到的赞。有时候被采用的回答不是最好的，所以也要留意评论和其他回答。
4.  找到解决方案以后，不要盲目的照着做，要知其所以然。初学时，这可能会耗费大量时间，但是这些都是知识储备，以后肯定能派上用场。几乎每个程序员都有他们的知识缺口，这会削弱他们的技能。假如你能做到既知道错误出现原因，又能有效避免，那么你就是世上前 1% 的程序员了。

那这个问题的原因到底是什么呢？其实是 `MapKit.framework` 没有导入到工程里面。看框架名字就知道， `MKMapView` 是被包含在这个外部框架里的。即使我们还没有直接显式的去调用 map view ，但也必须要导入框架到我们的工程里。

如果你通读了 StackOverflow 的解决方案，你会发现报错这种错的原因有很多。

根据以下步骤来解决我们的问题：

1.  在 Xcode 左导航栏上点击项目配置（左栏顶部蓝色的那一栏）
2.  选择 Build Phases 选项卡
3.  点击 Link Binary With Libraries ，展开列表
4.  点击下面的 +- 按钮，会出来一个弹出框（这里选 + ）
5.  搜索 mapkit 
6.  最后，双击 `MapKit.framework`

这样就把一个库导入到了工程中。

![](http://www.appcoda.com/wp-content/uploads/2015/11/coffee_10.png)

## 处理地理位置

现在的工程没有报错了，接下来来看看下一个需求：地理位置。我们需要将用户的位置标记在 map view 上。

首先，需要将 Storyboard 中的 map view 和代码关联。在创建工程的时候，Xcode 就自动生成了 `ViewController.swift` 文件。这也是 Storyboard 中的 view controller 所关联的文件。

下面来做一个小测试，看看文件是否成功关联：

1.  打开 `ViewController.swift` 文件，看到 `class` 开头的那一行。这是在类的定义。包含的信息有：类名、父类、遵循的协议。在这个类中，类名是 `ViewController`。
2.  打开 `Main.storyboard` 文件，在 Document Outline 中，找到顶上的一栏，这里应该标注的是 `View Controller Scene`。
3.  在右上角点击 Identity Inpector （左起第三个按钮）
4.  检查 Class 那一栏写得什么

这样，就完成了 `ViewController` 与 Storyboard 的关联检查，如果你今后在 Storyboard 中创建了其他 view controller ，也可以在 Storyboard 中设置类名来进行关联。

## 建立 Map View Outlet

现在，你已经知道 Storyboard 和代码是有关联的了，让我们为 Map View 添加 Outlet 吧。在你用自己的代码扩展 Map View 之前，需要将 Map View 的实例连接起来。

打开 `ViewController.swift` ，在第一个 `{` 下面添加以下代码：

    
    @IBOutlet var mapView:MKMapView?

这行代码含义如下：

-   在 Swift 中，使用变量前需要先定义。在变量定义的同时，也可以进行初始化。在上面的代码中，并没有进行初始化，默认是 `nil` （空）。
-   上面代码给 `ViewController` 类的对象声明了一个实例属性，并且该属性在该类的每个实例对象中，都是唯一的。与实例属性相对的是类属性，类属性在每个实例对象中都是相同的。
-   属性名称为 `mapView` ，类型为 `MKMapView` 。`MKMapView` 是 `MapKit` 框架里的一个类。
-   `@IBOutlet` 告诉 Xcode 这个属性将会作为 outlet 。outlet 会与 Storyboard (或 xib) 中的 UI 元素相关联。
-   `var` 表示这个属性是可变的，与之相对的是 `let` ，表示常量，不可变。（译者注：可参照 `NSMutableArray ` 与 `NSArray `）
-   关于 `?` 标识，是表明变量是个可选类型。这是 Swift 的一大特点，表示对象可以是 `nil` （空），与之相对的是 non-nil 。 可选类型提高了程序的安全性和可读性，之后也会用到很多可选类型。
-   为什么这行代码要放在这（class 的大括号内的顶部）呢？这表示变量的作用域是当前类。还有一种作用域是方法作用域，即在方法中定义的变量，只在当前方法中可用，当然，如果是全局作用域（全局变量），那就是在全局都可用了。

是不是觉得变量、属性有点搞不清楚？变量就是用来存储数据的；而属性，它其实也是一个变量，但是他属于一个类。同时，属性分为两种：实例属性和类属性。

是不是觉得类、实例、类型有点搞不清楚？类就是具有同种属性的对象，它可以创建该对象的很多副本。类创建后的一个个副本就是实例。这里所说的“类型”其实是有歧义的，你可以想象成和“类”差不多的东西。

是不是觉得定义（声明）、初始化、实例有点搞不清楚？OK，首先，定义（声明）：即告诉编译器，要用的变量的名称与类型。初始化：给变量一个初始值。初始值可以写在声明之后，如果没有赋值，那默认为 `nil` 。实例：表示这个变量是一个实例（类的“副本”）。严格意义上来讲，应该解释为该变量是一个实例化对象。

好了，现在回到项目中来。这时，Xcode 应该会在当前行报错，错误信息是：

    ruby
    Use of undeclared type MKMapView

这是因为 `MapKit` 还没有导入到当前文件。因此，在类定义的上面，引入 `UIKit` 代码的下面，添加这句话：

    
    import MapKit

现在，来关联一下 outlet：

1.  打开 `Main.Storyboard` 。
2.  显示 Document Outline，点击 View Controller Scene 。
3.  打开左边栏的 Connections Inspector 。
4.  在列表中找到 `mapView` 属性。（译者注：如果没找到，也可以通过 Show the Assistant editor 直接在代码中关联）
5.  然后，把这个属性右边的小圆点拖拽到编辑器上的 map view 中。

![](http://www.appcoda.com/wp-content/uploads/2015/11/coffee_11.png)

## 添加第一个方法

OK，现在来做下 map view 的相关实现。在 `ViewController` 类中添加以下代码：

    
    override func viewWillAppear(animated: Bool)
    {
        super.viewWillAppear(animated)
    
        if let mapView = self.mapView
        {
            mapView.delegate = self
        }
    }

你是不是在问添加到哪里？你想放哪放哪，只要在类的大括号结束前就行，就是这么任性。

所有方法都必须在类作用域之内。类作用域即类定义之后的 `{` 到与之匹配的 `}` 之间。

你可以说这是平衡之美，每个 `{` 都有与之对应的 `}` 。同时，程序员也会使用缩进来突出作用域层级。一般来说，使用的是 1 个 tab 或 4 个空格来进行缩进。

![](http://www.appcoda.com/wp-content/uploads/2015/11/coffee_12.png)

下面来解释下刚才写的方法：

-   方法，是类中的一块代码整体。这些代码相对独立，并实现某些特定的功能。方法能在当前类中调用，也可以在当前工程的其他地方被调用。
-   这个方法叫 `viewWillAppear`，带一个参数。这个参数是一个变量，在方法被调用的时候会传进来的。参数作用域在整个方法范围内。在父类调用的 `viewWillAppear` 方法中，参数名为 `animated` ，类型为 `Bool` （布尔值，真或假）。
-   所有方法都以 `func` 关键字开头，这是 `function` 的缩写。在这个例子中，`viewWillAppear` 是重写的父类方法，所以要加上 `override` 关键字。将父类的同名方法实现并替换成当前类的实现。父类与重写概念都属于面向对象编程范式范畴（ Object Oriented Programming ）。这个概念在本文中不做讲解。
-   该方法的主体：先将可选绑定的 `self.mapView` 赋值给了常量 `mapView` 。使用可选绑定可以验证可选变量是否为 `nil` 。如果有值，`if` 中的代码才会执行。同时，常量 `mapView` 只在 `if` 作用域内有效。
-   在 `if` 条件语句中，将 `mapView` 的 `delegate` 属性设置给当前类 `self` 。换句话说，当 `self.mapView` 不为 `nil` 的时候，`mapView` 的 `delegate` 就是 `self` 。再简单点说：如果当前类实例不为空，那就是 `mapView` 的 `delegate` （译者注：这里作者解释了N多遍，代码胜千言...）。之后还会用到其他 `delegate`。

完成 `delegate` 的设置之后，Xcode 又报错了。告诉我们，`self` 不能作为 `delegate`，因为当前类 `ViewController` 没有遵循  `MKMapViewDelegate` 。现在进行修正：

改一下类定义的那行代码：

    
    class ViewController: UIViewController, MKMapViewDelegate

## 获取用户地理位置

现在 map view 已经配置好了，你可以将注意力集中在获取地理位置上了。

在 `ViewController` 类中，添加以下两个属性：

    
    var locationManager:CLLocationManager?
    let distanceSpan:Double = 500

第一个属性 `locationManager` 是类型为 `CLLocationManager` 的变量。这是一个可选类型，所以它的值可以是 `nil` 。第二个属性是个类型为 `Double` 的常量，值为 500 。`Double` 即双精度浮点数类型（有效位长度是 `Float` 的两倍）。

现在，给当前类添加下面这个方法。可以将代码插入到 `viewWillAppear` 的下面。

    
    override func viewDidAppear(animated: Bool)
    {
        if locationManager == nil {
            locationManager = CLLocationManager()
    
            locationManager!.delegate = self
            locationManager!.desiredAccuracy = kCLLocationAccuracyBestForNavigation
            locationManager!.requestAlwaysAuthorization()
            locationManager!.distanceFilter = 50 // Don't send location updates with a distance smaller than 50 meters between them
            locationManager!.startUpdatingLocation()
        }
    }

Whoah，这段代码是啥意思？

1.  首先，用 `if` 条件语句判断 `locationManager` 变量的值是否为空。
2.  然后，实例化 `CLLocationManager` ，并赋值给 `locationManager`。换句话说：`locationManager` 变量指向的就是 `CLLocationManager` 的实例对象。 location manager 对象能用来获取用户地址。
3.  接着，我们给 `locationManager` 设置了一些属性。将 delegate 设为当前类，并设置了 GPS 精度。还调用了 `requestAlwaysAuthorization()` 方法，这个方法在 app 中弹出提示框，提示用户 app 会用到 GPS ，并征得用户授权。
4.  最后，调用 `startUpdatingLocation` 方法，location manager 就会开始轮询 GPS 坐标，并将最新的坐标通过代理方法传回。如果实现了代理方法，我们就能拿到用户的地理位置信息了。

你是否注意到 `locationManager` 代码后面的感叹号？这是因为 `locationManager` 是可选值，所以有可能是 `nil` 。当我们要访问这个变量时，就需要先解包，确保非空。根据这个访问约定，解包有两种方式：

-   **可选绑定**。使用 `if let definitiveValue = optionalValue { …` 这样的结构（译者注：关于 `if let` 的使用，可以参考 SwiftGG 翻译组的另一篇文章：[if-let赋值运算符](http://swift.gg/2015/11/06/if-let-assignment/)）
-   **强制解包**。使用感叹号，如 `optionalValue!`。

在写第一个方法的时候，我们用的就是可选绑定的方式。当可选变量不为 `nil` 时，使用 `if let` 来定义一个新的变量。

强制解包不是一个很好的方案。要在需要解包的变量后面加上感叹号，那么它就会从可选状态 “强制转换” 为不可选状态。不幸的是，当你强制解包一个值为 `nil` 的可选变量时，程序会直接崩溃。 

所以不能对值为 `nil` 的可选变量强制解包。在上面的代码中，强制解包就不存在这个问题。为什么呢？因为在强制解包之前，我们先将 `CLLocationManager` 的实例变量赋给了 `locationManager` ，所以可以保证 `locationManager` 不是 `nil`。

OK，回到代码部分。当我们添加了上面方法以后，Xcode 又报错了...让我们继续来解决问题吧！

错误之处：我们想让 `self` 作为 `locationManager` 的委托（ `delegate` ），但是并没有遵循相应的协议。在类定义的地方，添加以下代码来遵循协议：

    
    class ViewController: UIViewController, MKMapViewDelegate, CLLocationManagerDelegate

OK，给 `ViewController` 类添加以下代理方法。放在上一个方法的后面就行。（译者注：添加的这个方法已经被弃用了。取而代之的是 `func locationManager(manager: CLLocationManager, didUpdateLocations locations: [CLLocation])` 方法。）

    
    func locationManager(manager: CLLocationManager, didUpdateToLocation newLocation: CLLocation, fromLocation oldLocation: CLLocation) {
        if let mapView = self.mapView {
            let region = MKCoordinateRegionMakeWithDistance(newLocation.coordinate, distanceSpan, distanceSpan)
            mapView.setRegion(region, animated: true)
        }
    }

这个方法又在做什么呢？

-   首先，方法名是 `locationManager:didUpdateToLocation:fromLocation` 。这个方法使用了命名参数，说明他的方法名会随着参数名的不同而不同（变量在方法内部）。简言之，这个方法有三个参数：调用该方法的 location manager，最新的 GPS 坐标，上一次的 GPS 坐标。
-   在方法内部，先使用可选绑定对 `self.mapView` 解包。当 `self.mapView` 不为 `nil` 时，`mapView` 变量就是它解包以后的值，然后执行 `if` 条件中的对应语句。
-   在 `if` 语句中，根据新的 GPS 坐标与之前定义的 `distanceSpan` 两个值，计算得到 `region` 值。这句代码创建了一个以 `newLocation` 为中心，500 * 500 的一个矩形区域（500 就是 `distanceSpan` 的值）。
-   最后，调用 map view 的 `setRegion` 方法。`animation` 参数设为 `true` ，这样 `region` 改变就会有动画。换句话说：地图可能会有平移或缩放操作，所以要保证他每次都能显示 500 * 500 的区域。

最后一件事，为了让用户同意地理位置授权，你需要在 Xcode 中设置一个特别的授权请求。这个请求要用一句话涵盖为什么要获取用户地理位置。iPhone 会在申请授权时，弹框显示这句话（即在调用 `requestAlwaysAuthorization()` 方法时）。

配置请求的步骤如下：

1.  在工程目录中打开 `info.plist` 文件。
2.  右键点击列表，选择 Add Row。
3.  在 key 列，填入 `NSLocationAlwaysUsageDescription` 。
4.  在 type 列，将类型改为 `String`。
5.  在 value 列，填入 `We need to get your location!` （译者注：这个 value 就是申请授权并弹框时，显示给用户的文本）

![](http://www.appcoda.com/wp-content/uploads/2015/11/info-plist.png)

## 运行程序

现在，让我们运行一下程序。确保你选择了相应的 iPhone Simulator，运行快捷键 Command - R 。第一次运行 App ，会弹出是否允许获取地理位置的授权框，选择 Allow，如下图。

![](http://www.appcoda.com/wp-content/uploads/2015/11/coffee_14.png)

当我们点击了 Allow 以后，map view 好像并没有更新位置。这是因为模拟器没有 GPS ，所以...我们需要模拟一下：

当 app 在模拟器上跑起来以后，在以下两种方式中，选择一种进行配置：

-   iPhone Simulator: Debug -> Location -> Apple.
-   Xcode: Debug -> Simulate Location -> [随便选一个]

当你选择了一个地理位置后，map view 就会定位到对应位置，并缩放到合适的大小。（译者注：可能定位这一步会有点慢，map 半天没有更新或没有图像出来，等等就好了）

搞定了吗？完美！

## 从 Foursquare 上读取地理信息

你以为到这一步就完了吗？其实并没有，还会有更有趣的事情！我们还需要使用 Das Quadrat 来读取 Foursquare 上的数据，然后用 Realm 将数据存入本地。

在使用 Foursquare 的 API 之前，首先需要到开发者中心注册这个 app 。这个步骤很简单。（译者注：如果只是练习，没必要去注册，直接使用作者提供的 Client ID 和 Client Secret 即可）

-   首先，确保你有一个 Foursquare 账号，没有可以去注册一个：[foursquare.com](https://foursquare.com/)。
-   然后，进入 [developer.foursquare.com](https://developer.foursquare.com/)，点击顶部蓝色菜单栏中的 My Apps 。
-   接着，点击右边绿色的 new app 按钮。
-   接着，填写以下信息：
    -   App Name： Coffee
    -   Download / Welcome page URL: http://example.com
-   最后，点击保存

保存以后，网页自动跳转到了你创建的 app 页面。记录下 Client ID 和 Client Secret ，之后会用到。（译者注：作者提供的 Client ID 和 Client Secret 在后面的代码里有提供）

![](http://www.appcoda.com/wp-content/uploads/2015/11/coffee_15.png)

## 构建 Foursquare API 连接

OK，下面开始连接 Foursquare API 。这里我们会用到单例模式。我们要做的部分用单例模式简直是完美。

单例是一个类的实例，它在整个 app 生命周期中，只允许有一份拷贝。所以你不能去创建第二个实例。为什么要使用单例呢？虽然单例的使用饱受争议，但是它有一个明显的优势：可以避免对外部资源发起并发连接。

设想一下。如果对网站同时发起两个请求，并且他们会写入同一个特定的文件，会发送什么呢？这样就很有可能读到脏数据，除非网站知道这两个请求发起的先后顺序。

而单例就能确保只有 app 的一部分能访问外部资源。在单例中，有很多种实现方式能保证没有请求冲突存在。将请求加入队列并添加依赖就是其中一种解决方案。这又是一个很大的主题，本文不进行讲解。

不扯了，继续实现：

-   在工程目录中，右键点击 Coffee 文件夹。
-   选择 New File。
-   选择 iOS -> Source 中的 Swift File ，点击继续。
-   文件命名为 `CoffeeAPI.swift` ，确认 target 中的 Coffee 是选中状态，选择和其他 swift 文件统计目录，点击 Create ，保存文件。

Whoah，新文件里面空空如也！让我们来加点料吧。在 import 代码的后面，添加以下代码：

    
    import QuadratTouch
    import MapKit
    import RealmSwift

然后，添加：

    
    struct API {
        struct notifications {
            static let venuesUpdated = "venues updated"
        }
    }

代码很简洁对吧。首先，你正确地引入了一些需要的库（Quadrat, MapKit, Realm），然后使用 `struct` 创建了一个名为 `venuesUpdated` 的静态常量。之后，通过以下方式访问该变量：

    
    API.notifications.venuesUpdated

接着，键入：

    
    class CoffeeAPI
    {
        static let sharedInstance = CoffeeAPI()
        var session:Session?
    }

以上代码的作用：

-   告诉 Xcode 编译器，当前类名为 `CoffeeAPI` 。这是一个单独的 Swift 类，没有继承 `NSObject`。
-   声明一个静态常量 `sharedInstance` ，类型为 `CoffeeAPI` 。这个 `sharedInstance` 只有 `CoffeeAPI` 类才能访问，并且在 app 启动的时候就已经被初始化了。
-   声明一个类型为 `Session?` 的可选变量 `session` （该类型包含在 `Das Quadrat` 中）。

之后，我们访问 Coffee API 单例的方式都将是 `CoffeeAPI.sharedInstance` 。你可以在任何地方，通过这种方式访问单例，并且，访问的都是同一个对象，这也正是单例的一大特点。

接着，需要写一个构造器。给当前类添加以下代码：

    
    init()
    {
        // Initialize the Foursquare client
        let client = Client(clientID: "...", clientSecret: "...", redirectURL: "")
    
        let configuration = Configuration(client:client)
        Session.setupSharedSessionWithConfiguration(configuration)
    
        self.session = Session.sharedSession()
    }

构造器是一个会在类实例化的时候调用的方法。这也是实例化时，系统自动调用的第一个方法。

还记得之前在 Foursquare 开发者网站上复制的  Client ID 和 Client Secret 吗？粘贴到下面代码中。可以先不填 `redirectURL` 参数。向下面这样：

    
    let client = Client(clientID: "X4I3CFADAN4MEB2TEVYUZSQ4SHSTXSZL34VNP4CJHSJGLKPV", clientSecret: "EDOLJK3AGCOQDRKVT2GK5E4GECU42UJUCGGWLTUFNEF1ZXHB", redirectURL: "")

OK，继续。复制下面的代码，粘贴在 `CoffeeAPI` 类外面（即最后的大括弧的后面）。

    
    extension CLLocation
    {
        func parameters() -> Parameters
        {
            let ll      = "\(self.coordinate.latitude),\(self.coordinate.longitude)"
            let llAcc   = "\(self.horizontalAccuracy)"
            let alt     = "\(self.altitude)"
            let altAcc  = "\(self.verticalAccuracy)"
            let parameters = [
                Parameter.ll:ll,
                Parameter.llAcc:llAcc,
                Parameter.alt:alt,
                Parameter.altAcc:altAcc
            ]
            return parameters
        }
    }

这又是什么呢？这是一个 `extension` ，可以给当前类扩展其他的方法（译者注：关于 `extension` 的知识点，可以查看 SwiftGG 翻译组的其他文章：[扩展基础知识](http://wiki.jikexueyuan.com/project/swift/chapter2/21_Extensions.html)。延伸到程序结构设计方面，还有进阶的 [Mixins 比继承更好](http://swift.gg/2015/12/15/mixins-over-inheritance/)）。无需创建新的类，就可以给 `CLLocation` 类扩展一个名为 `parameters()` 的方法。每次使用 `CLLocation` 的实例时，这个 `extension` 就会被加载，你可以通过实例来调用 `parameters` 方法，即使这个方法没包含在原生的 `MapKit` 中。

注意：不要混淆 Swift 中 `extension` 和编程术语 `extend` 。前者是给基类添加新的方法，后者意思是父类与子类间的继承关系。

`parameter` 方法返回一个 `Parameters` 的实例对象。`Parameters` 是一个字典，里面包含了一些参数信息（ GPS 坐标和精度）。（译者注：`Parameters` 是在 `Session.swift` 中定义的 `typealias`，完整定义为：`public typealias Parameters = [String:String]` ）。

## 给 Foursquare 发送请求

接下来，让我们从 Foursquare 获取数据吧。Foursquare 内部有一个 HTTP REST API 可以返回 JSON 数据。幸运的是，我们不需要知道这些，因为 Das Quadrat 库已经帮我们搞定了一切。

从 Foursquare 请求数据就和调用 `session` 里的属性一样简单，同时请求数据使用的是该属性里很多方法中的一个。这个方法返回一个 `Task` 的实例对象，即异步后台任务的引用。我们可以用闭包的形式实现，代码大致如下：

    
    let searchTask = session.venues.search(parameters)
        {
            (result) -> Void in
    
            // Do something with "result"
        }

`session` 里的地理属性包含了与 Foursquare API 通讯的所有 venues 信息。你提供的这个 search 方法是带有参数（上段代码中的 parameters ）的，还有第二个闭包作为参数，该闭包会在 search 方法完成后执行。同时，该方法会返回一个耗时的后台 `Task` 引用。你可以在任务完成之前用它来停止，或着在你代码的其他地方用它检查进度。

OK，现在来看看下面这个方法。复制并粘贴到你的代码里，即放在初始构造函数的后面，但在 CoffeeAPI 这个类的右括号前面。接下来，我们会看到这个方法的用途。

    
    func getCoffeeShopsWithLocation(location:CLLocation)
    {
        if let session = self.session
        {
            var parameters = location.parameters()
            parameters += [Parameter.categoryId: "4bf58dd8d48988d1e0931735"]
            parameters += [Parameter.radius: "2000"]
            parameters += [Parameter.limit: "50"]
    
            // Start a "search", i.e. an async call to Foursquare that should return venue data
            let searchTask = session.venues.search(parameters)
                {
                    (result) -> Void in
    
                    if let response = result.response
                    {
                        if let venues = response["venues"] as? [[String: AnyObject]]
                        {
                            autoreleasepool
                                {
                                    let realm = try! Realm()
                                    realm.beginWrite()
    
                                    for venue:[String: AnyObject] in venues
                                    {
                                        let venueObject:Venue = Venue()
    
                                        if let id = venue["id"] as? String
                                        {
                                            venueObject.id = id
                                        }
    
                                        if let name = venue["name"] as? String
                                        {
                                            venueObject.name = name
                                        }
    
                                        if  let location = venue["location"] as? [String: AnyObject]
                                        {
                                            if let longitude = location["lng"] as? Float
                                            {
                                                venueObject.longitude = longitude
                                            }
    
                                            if let latitude = location["lat"] as? Float
                                            {
                                                venueObject.latitude = latitude
                                            }
    
                                            if let formattedAddress = location["formattedAddress"] as? [String]
                                            {
                                                venueObject.address = formattedAddress.joinWithSeparator(" ")
                                            }
                                        }
    
                                        realm.add(venueObject, update: true)
                                    }
    
                                    do {
                                        try realm.commitWrite()
                                        print("Committing write...")
                                    }
                                    catch (let e)
                                    {
                                        print("Y U NO REALM ? \(e)")
                                    }
                            }
    
                            NSNotificationCenter.defaultCenter().postNotificationName(API.notifications.venuesUpdated, object: nil, userInfo: nil)
                        }
                    }
            }
    
            searchTask.start()
        }
    }

这么多代码，你能从里面分辨出它完成的 5 个主要的任务吗？

1.  配置并启动 API 请求。
2.  使用闭包实现请求的 Completion handler。
3.  解析请求返回的数据，并开启 Realm 事务来处理。
4.  使用 for-in 循环遍历所有的地理数据。
5.  在 Completion handler 的最后发送通知。

接下来，让我们一行行的来解释一下：

### 设置请求的准备动作

首先，使用可选绑定检查 `self.session` 是否为空。如果非空的话，常量 `session` 会被赋值解包后的值。

接着，`location` 的 `parameters()` 方法被调用。你问这个 `location` 是从哪里来的？你可以看下 `getCoffeeShopsWithLocation` 方法后面的那个参数。每次你调用这个方法，你也必须传入一个 `location` 参数，并检查传入的参数是不是你之前写的。

最后，我们添加了一个新的数据项到 `parameters` 字典。该数据项使用 `Parameter.categoryId` 作为 key ，字符串 `4bf58dd8d48988d1e0931735 ` 作为 value 。这个字符串就是之前 Foursquare 上 `Coffeeshops` 目录的编号，因此，没什么特殊的。

### 配置请求

接着，让我们来配置真正的请求。获取 `session` 的 `venues` ，并开始搜寻这个 `venues` 。该方法有两个参数：你刚才创建的 `parameters` 字典和闭包。现在使用的闭包的形式叫尾随闭包（ trailing closure ）。它作为该方法的最后一个参数，没有采用圆括号括起来的形式，而是将它写在方法外部并用大括号括起来。这是个很耗时的方法，因此，我们并没有让它自动开始执行，而是在本方法的末尾再执行。

### 书写闭包

接着，我们进到闭包里去看看。值得注意的一点是，尽管这些代码看上去连续的，但是它们不会一个一个按你看到的顺序执行。该闭包会在搜寻任务完成后执行。当数据从 HTTP API 返回到应用中时，代码会从 `let searchTask … ` 这行执行到 `searchTask.start()` 这行，接着会跳到 `if let response = …` 这行。

闭包的格式是这样的：`(result) -> Void in` 。 `result` 作为闭包里的参数是可以拿到值的，并且该闭包没有返回值（ `Void` ）。这一点和普通的方法有点相似。

### 解析数据

接着，我们使用了 `if` 可选绑定：

-   如果 `result.response` 非空，就将其赋值给常量 `response ` ，并继续执行 `if` 条件内的语句。
-   如果 `response[“venues”]` 非空，并且可以转换成 `[[String: AnyObject]]` 类型。

这个类型转换可以确保我们拿到的是正确的类型。如果转换失败，即可选绑定失败，就不会执行 `if` 条件内的语句。这个方法有一石二鸟的效果：检查对应的值是否为空，同时尝试将数据转换成合适的类型。

你能说一下 `venues` 的类型是什么吗？首先它是一个数组，每个元素是字典类型，每个字典是以 `String` 类型为 key ， `AnyObject` 类型为 value 。

### 自动释放内存

接着，我们开启了一个自动释放池。自动释放池本身就是一个很大的话题。你知道 iPhone 是如果进行内存管理的吗？

本质上来说，内存里的对象在没有被使用时，会在某个时间点从内存里被移除。有点类似垃圾回收，但还是有点区别的。当自动释放池里的一个变量被释放时，这个变量就和这个自动释放池紧紧联系在一起了。当这个自动释放池自己要被释放时，在内的所有变量的内存也会一起被释放。这个有点像，对内存释放的批处理。

为什么要这么做呢？因为，可以通过创建自己的自动释放池，来帮助 iPhone 系统管理内存。我们在处理数以百计的地理对象时，如果没有放在自己的自动释放池里，内存就会被未释放的内存拥塞了。而，能释放这些内存的时间点是在该方法结束的时候。因此，你在冒着用光内存的风险操作（自动释放的机理导致不会立马释放无用的内存）。使用自己创建的自动释放池，你就可以影响内存释放的时间点并能避免被内存不足困扰。（译者注：ARC 下，在方法内创建的临时变量，系统都会自动加上 `__strong` 修饰符，并在出该变量作用域时，进行 `release` 。所以，一般在处理有大量的临时变量的方法时，会自己加上 `autoreleasepool` ，提前释放已经不用的临时变量，及时释放内存。）

### 开启 Realm

接着，你用 `let realm = try! Realm()` 这样一行代码初始化了一个 Realm 对象。你在从 Realm 获取数据之前肯定需要有一个 Realm 对象。 `try!` 关键字是 Swift 的一种错误处理。用了这个关键字，我们其实声明了：当前不会处理来自 Realm 的错误。虽然这样的做法对生产环境来说并不推荐，但是可以让我们的代码变得相当简单。

### 开启事务处理

接下来，调用 Realm 实例方法 `beginWrite` 。其实这代码开启了一个事务。让我们先来谈谈效率的问题。以下哪种方式更高效：

-   创建一个文件指针，打开文件，写入 1x 数据到文件里，关闭文件，再重复之前的步骤直到写入 50x 数据。
-   创建一个文件指针，打开文件，写入 50x 数据到文件里，关闭文件。

确切地说，当然是后者更高效。和其他数据库系统一样， Realm 也是把数据存储在文本文件里的。文件处理就意味着：操作系统（ operation system ， OS ）需要打开着文件，赋予程序写入权限，并让程序可以一个字节一个字节的向文件里写入数据。

你需要使用打开一次文件，一次写入 50 个 Realm 对象的方式，而不是一次次的写入文件。因为，每个对象之间非常相似，它们可以被连续地写入。这种方式更快一点，其实这就是事务。

为了完整性，如果事务中的一次写入失败了，那么所有的写入都会失败。这种机制其实来源于银行和账户：如果你写入了 50 个事务到一个分类账簿，而其中的一个（比如，账上没有钱）被证明是错误的，但是你又不能找出来。你必须阻止这种“污染”整个账簿的行为。这时候使用事务就再好不过了，成功都写入，失败都回滚，这样的方式也能减少数据出错的风险。

### 遍历地理数据

OK，现在来看看 for-in 循环。你已经可选绑定上面创建了 `venues` 变量。在 for-in 循环遍历整个数组时，每次循环里都是数组中的一个元素：`venue`。

首先，创建了一个 `Venue` 类型的 `venueObject` 变量。这行代码暂时会报错，因为现在还没有一个类叫 `Venue` 。你等会就会添加这个类的，因此先放一边吧。

接着，一系列的可选绑定来了。每个可选绑定都尝试去访问 `venue ` 的键值对（ key-value pair ），同时尝试将其转换成合适的类型。举个例子，当 `venue ` 包含一个键 `id` ，并尝试转换成 `String` 类型，假如成功的话，会将 `venueObject` 的 `id` 属性赋值给它。

`location` 的可选绑定看上去复杂一点，但是其实一点也不复杂。仔细看，你会发现 `lat` 、 `lng` 、 `formattedAddress` 这些都是`location` 的一部分 key （并不是 `venue` 的）。它们其实在数据结构中是属于同一层的。

接下来，是 for-in 循环最后一行代码：`realm.add(venueObject, update: true)` 。这行代码会把 `venueObject` 添加到 Realm，并写入到数据库（仍然是以事务的形式写入）。方法中的第二个参数 `update` 表示：当对应传入的对象已经存在，就用新数据覆盖掉之前写入的数据。之后，你会发现每个 `Venue` 对象都有一个唯一的编号，所以 Realm 可以根据编号知道对象已经存在。

### 错误处理

OK，现在 Realm 已经将事务中所有要写入的数据保存起来了，接下来将尝试写入到 Realm 数据库。这一步当然也有可能出错了。庆幸的是，这里可以使用 Swift 的错误处理机制。步骤如下：

1.  尝试执行可能出错的操作。
2.  如果出错，就抛出错误。
3.  操作的调用者抓住对应错误。
4.  进行错误处理。

在大多数语言里，这种机制以 try-catch 闻名，但是 Swift 称它为 do-catch （同时，也将 do-while 重命名为 repeat-while ）。你的代码大概是这样子的：

    
    do {
        try realm.commitWrite()
        print("Committing write...")
    }
    catch (let e)
    {
        print("Y U NO REALM ? \(e)")
    }

`realm.commitWrite()` 这行代码就是在尝试执行可能出错的操作。同时，这行代码前面写了 `try` 。回到你之前写 `try!` 的地方，`try!` 会摒弃错误。（译者注：`try!` 表示禁用错误传递，如果抛出错误，那么程序崩溃。一般用于，你知道这个步骤不会出错的情况。关于错误处理，可以看 SwiftGG 翻译组翻译的 Swift 官方文档：[错误处理](http://wiki.jikexueyuan.com/project/swift/chapter2/18_Error_Handling.html)）。

当在 `do { }` 代码块里产生错误的时候， `catch` 代码块就会执行。它只有一个参数，`let e`，它会包含异常的具体信息。在后面的代码块里，我们将具体的错误信息打印出来。当程序运行过程中出现错误了，打印的信息就会告诉我们错误到底是由什么异常引起的。

这里的这个错误处理是很基础的。设想一下，一个错误处理很完善的系统，不仅仅需要抓住出错信息，还要对错误信息进行一下处理。举个例子，当你写数据到文件，而磁盘满了的时候，你就需要弹窗让用户知道磁盘已经满了。在较早版本的 Swift 中，处理错误比现在更艰难，而且如果你不处理得当，程序就崩溃了。

Swift 的错误处理或多或少还是加强了。你要不处理错误，要不摒弃掉错误，但是不管怎么样也不能忽视错误。处理错误可以让你的代码更健壮，因此，养成多使用 do-catch 处理错误的习惯，而不是使用 `try!` 来摒弃错误。

OK，该方法中还有最后两行代码，第一行如下：

    
    NSNotificationCenter.defaultCenter().postNotificationName(API.notifications.venuesUpdated, object: nil, userInfo: nil)

这行代码会给整个应用中监听它的地方发送一个通知。这实际上是应用中的通知机制，可以高效的将事件传递到应用中的不同位置。考虑到你刚从 Foursquare 获取到新数据，你可能要去更新显示数据的 table view ，也可能要更新代码的其他部分。通知是完成这个操作最好的方式了。

请牢记，通知会一直保留在发送它的那个线程上。如果你在主线程外（比如，发送通知的线程）更新你的 UI ，你的应用就会崩溃并抛出错误。

注意到这行代码里的硬编码 `API.notifications.venuesUpdated` 了吗？本来我们可以写成 `"venuesUpdated"` 的字符串， 而不是 `API.notifications.venuesUpdated`。使用硬编码的编译时常量能让你的代码更安全。如果你出错，编译器会报错。但是，如果你使用字符串的方式，拼写错 `"venuesUpdated"` ，编译器就不会报错了。

最后，闭包外的这行代码：

    
    searchTask.start()

再次注意，这行代码会在 `let searchTask …` 后执行，且和上面一大段闭包是独立的。这行代码到底是干什么的呢？现在，我们已经设置好请求，配置好所有需要的参数，这行代码就是让这个搜寻任务启动起来。

Das Quadrat 发送一条消息到 Foursquare ，等待数据的返回，然后就执行了处理数据的闭包。懂了吧？

暂时把这些代码放一边，因为接下来我们要写 `Venue` 对象了。

## 编写 Realm Venue 对象

你知道 Realm 酷在什么地方吗？它整个代码结构是很简短的。本质上来说，你只需要一个类文件就可以写 Realm 了。你创建了一系列的实例对象，把它们写到 Realm 文件中，然后 BAM！你已经完成了你自己的本地数据库。

Realm 有一系列很赞的特性，比如排序、过滤以及支持 Swift 数据类型。你再也不需要在 table view 里使用 Core Data 的 `NSFetchedResultsController` 来加载成千上万的对象。Realm 也有它自己的数据浏览器。

OK，接下来该写 Realm Venue 对象了。步骤如下：

-   右击 Xcode 中 Project Navigator 的 Coffee 这个文件夹。
-   点击 `New File …` ，从 iOS -> Source 目录选择 Swift 文件，并点击 `Next` 。
-   将新建的文件命名为 `Venue.swift` ，并确保选中了 Coffee 这个 target 。
-   最后，点击 `Create` 完成创建。

好吧，又是一个无内容的文件。这个文件将会包含 Realm 的 Venue 对象的代码。

首先导入正确的库。在 Foundation 的导入代码添加如下代码：

    
    import RealmSwift
    import MapKit

接着，键入如下代码：

    
    class Venue: Object
    {
    
    }

这就为 Venue 新建了一个类。其中，这个冒号表示当前类继承自 `Object` 类。这其实是面向对象编程（ Object Oriented Programming ）中父类和子类之间的继承关系。此处代码就是将 `Venue` 类继承自 `Object` 类。

简单来说，作为一个子类会自动将父类的所有方法和属性拷贝到自己的类中。值得注意的是，这和我们之前使用的 `extension` 是不一样的，它是为现有的类添加新的方法，而没有创建一个独立的新类。

接着，将以下代码拷贝到该类中，记得要添加在大括号的范围内：

    
    dynamic var id:String = ""
    dynamic var name:String = ""
    
    dynamic var latitude:Float = 0
    dynamic var longitude:Float = 0
    
    dynamic var address:String = ""

这些句子是什么意思呢？就是为这个类添加了 5 个属性。你可以像使用 `CoffeeAPI` 的代码那样，使用这些属性为类实例添加数据。

属性中的 `dynamic` 关键字可以确保该属性能被 Objective-C 运行时访问。这本身是另外一个主题，但是我们先假设 Swift 的代码和 Objective-C 代码在各自的 “沙盒” 里运行。在 Swift 2.0 之前，所有的 Swift 代码都是运行在 Objective-C 运行时里，但是现在 Swift 已经有自己的运行时了。我们用 `dynamic` 关键字修饰属性，就可以让 Objective-C 运行时访问到这个属性，因为 Realm 需要在内部用到该属性。

每个属性都是 `String` 或  `Float` 类型。 Realm 本身支持一些变量类型，包括 `NSData` 、`NSDate` 、`Int` 、`Float` 、`String` 等等。

接下来，在 `address` 属性下面添加以下代码：

    
    var coordinate:CLLocation {
        return CLLocation(latitude: Double(latitude), longitude: Double(longitude));
    }

这个属性的值要计算后才会有。它不能保存到 Realm 里，因为它的类型没有包含在 Realm 本身支持的类型中。这个属性保存的是表达式的结果值。它就像一个方法，但是接着它就可以用属性来访问了。以上属性返回的是一个 `CLLocation` 实例对象，它有 `latitude` 和 `longitude` 两个属性。

这种使用方法很便利，因为我们只需要访问 `venueObject.coordinate` 就能获得对应类型的实例，而不用我们自己创建。

OK，接下来，粘贴以下代码到最后的代码块下面：

    
    override static func primaryKey() -> String?
    {
        return "id";
    }

这是一个新出现的方法，它重写了父类 `Object` 的方法。这个自定义方法可以返回一个 Realm 的主键（ primary key ）。主键就是唯一标识。每个 Realm 数据库中的对象有且仅有一个唯一的值作为主键，就像一个村庄里的房子必须有且仅有一个唯一的地址一样。

Realm 会用主键去区分一个个不同的对象，并确定当前这个对象是否唯一。

该方法的返回值类型为 String，因此我们就可以返回主键对应的属性名或者返回 `nil`（不使用主键的情况）。

Realm 对象的属性（比如，`id` 和 `name`）类似于电子表格里的列。方法返回的主键返回值即是每一列的名字，其实就是 `id` 。

现在，我们需要按 Command-B 来编译当前应用，并确保没有报错。我们没必要运行当前的应用，因为我们没有改变前端的展示代码。取而代之的是，我们只要检查编译应用时候是否有报错。如果你这时候去查看 `CoffeeAPI.swift` 文件，之前关于 `venueObject` 的错误已经不存在了。

## 在 Map View 中展示地理数据

OK，现在让我们来处理下载下来的数据吧。你将要把它们放入之前创建的 map view 里以注释（annotation）的形式展示。

首先，切换到 `ViewController.swift` 文件。检查用来在 map view 上显示用户位置的代码。

接着，在文件的最上部，添加如下的导入语句：

    
    import RealmSwift

接着，在类的最上部，添加以下这些属性：

    
    var lastLocation:CLLocation?
    var venues:Results?

你需要 RealmSwift 库来支持你使用 Realm，并且你需要这两个属性分别处理位置和地理数据。

接下来，定位到文件中的 `locationManager:didUpdateToLocation:fromLocation` 方法。在该方法的右大括号后面，粘贴以下代码：

    
    func refreshVenues(location: CLLocation?, getDataFromFoursquare:Bool = false)
    {
        if location != nil
        {
            lastLocation = location
        }
    
        if let location = lastLocation
        {
            if getDataFromFoursquare == true
            {
                CoffeeAPI.sharedInstance.getCoffeeShopsWithLocation(location)
            }
    
            let realm = try! Realm()
    
            venues = realm.objects(Venue)
    
            for venue in venues!
            {
                let annotation = CoffeeAnnotation(title: venue.name, subtitle: venue.address, coordinate: CLLocationCoordinate2D(latitude: Double(venue.latitude), longitude: Double(venue.longitude)))
    
                mapView?.addAnnotation(annotation)
            }
        }
    }

Whoah，好长的方法，它是怎么执行的呢？

让我们从 `location` 的两行判断语句说起吧。第一行检查了 `location` 是否非空，第二行使用可选绑定检查了 `lastLocation` 属性是否非空。

虽然这两行代码看上去很相似，但是其实干的事情是不同的。让我们退一步想想。检查以下陈述是否是真实的：

-   应用中的所有位置数据都来源于 `locationManager:didUpdateToLocation:fromLocation` 方法。即，该方法是唯一一个能获取到 `CLLocation` 实例（数据来自 GPS 硬件数据）的地方。
-   `refreshVenues` 方法需要一个位置作为参数，该参数可能为空。
-   `refreshVenues` 方法可能会在没有可用的位置时被调用。比如，在代码里，一个与位置数据方法没有联系的地方就调用 `refreshVenues` 方法。

最后一句陈述很重要。其实也很简单：因为我们不一定要在获取到最新地理位置（`locationManager:didUpdateToLocation:fromLocation` ）时，才进行位置保存，所以，我们需要将保存位置的功能单独封装出来（封装为 `refreshVenues` 方法）。

因此，每次调用 `refreshVenues` 方法时，如果 `lastLocation` 属性非空的话，我们会将 `location` 参数保存起来。然后，我们会用可选绑定检查 `lastLocation` 是否为空。`if` 语句只会在有值的时候执行，因此我们可以 100% 确定 `if` 语句里的代码块肯定会包含一个有效的 GPS 位置信息！

当然，前提是 `refreshVenues` 方法确实获取到了位置数据。你肯定要确保它是非空的。如果你还是不太理解的话，可以重新读一下上一段内容。这样的代码非常优雅，而且这样的编码还可以确保你的应用数据是安全的且仍然是解耦的。

OK，`refreshVenues` 方法里的下一行代码讲了什么呢？该代码块里使用了 `CoffeeAPI` 单例来从 `Foursquare` 请求数据：

    
    if getDataFromFoursquare == true
    {
        CoffeeAPI.sharedInstance.getCoffeeShopsWithLocation(location)
    }

这段代码只会在 `getDataFromFoursquare` 这个变量为 `true` 的时候执行。这是一种简单的使用 CoffeeAPI 请求数据方式。你要事先监听 CoffeeAPI 里的通知，才能在获取数据完成的时候，得到状态的更新。我们会在稍后实现该功能。

在请求数据之后，是以下代码：

    
    let realm = try! Realm()
    venues = realm.objects(Venue)

这些代码看上去是不重要的，但是代码的主体却是在这几句上。首先，实例化 `Realm` 。然后，所有从 `Realm` 获取来的 `Venue` 类的对象都保存到 `venues` 这个属性里。该属性的类型是 `Results?`，该类型是以 `Venue` 实例为元素的数组。

最后，for-in 循环遍历 `venues`，并将每个元素以注释（annotation）的样式添加到 map view 里。这段代码很可能会报出错误，但我们将会解决掉它的。

## 创建注释（Annotation）类

创建注释类，需要以下步骤：

1.  右击 Coffee 文件夹，选择 `New File …` 。
2.  从 iOS -> Source 目录里选择 Swift 文件并点击 `Next` 。
3.  将该 Swift 文件命名为 `CoffeeAnnotation`，并点击 `Create` 。

然后，将以下代码粘贴到该文件里：

    
    import MapKit
    
    class CoffeeAnnotation: NSObject, MKAnnotation
    {
        let title:String?
        let subtitle:String?
        let coordinate: CLLocationCoordinate2D
    
        init(title: String?, subtitle:String?, coordinate: CLLocationCoordinate2D)
        {
            self.title = title
            self.subtitle = subtitle
            self.coordinate = coordinate
    
            super.init()
        }    
    }

这些代码很简单：

-   你新建了一个名叫 `CoffeeAnnotation` 的类，它继承自 `NSObject` 且遵循 `MKAnnotation` 协议。最后遵循协议的这个部分很重要，要想使用注释，必须要遵循这个 `MKAnnotation` 协议。
-   接着，创建了一大串属性。这些属性是由协议决定的，是类的一部分。
-   最后，还创建了构造器方法。该方法初始化了类的属性。

切换回 `ViewController.swift` 文件，是不是发现原来 `CoffeeAnnotation` 那里的错误已经消失了？

接下来，添加以下的方法到 `ViewController` 这个类中。这个方法可以确保添加到地图的注释能被显示出来。

    
    func mapView(mapView: MKMapView, viewForAnnotation annotation: MKAnnotation) -> MKAnnotationView?
    {
        if annotation.isKindOfClass(MKUserLocation)
        {
            return nil
        }
    
        var view = mapView.dequeueReusableAnnotationViewWithIdentifier("annotationIdentifier")
    
        if view == nil
        {
           view = MKPinAnnotationView(annotation: annotation, reuseIdentifier: "annotationIdentifier")
        }
    
        view?.canShowCallout = true
    
        return view
    }

类似于 table view，map view 也用可重用的实例来让地图上的 `pin` 显示更平滑。以上代码大概是以以下的步骤展开：

-   首先，检查 `annotation` 是不是用户的当前位置。
-   接着，在重用队列中取出 `pin` （并赋值给 `view` 变量）。
-   然后，如果没有 `pin` 在重用队列中，就创建一个新的。
-   接着，设置 `pin` 允许显示 callout（一块小小的用来显示信息的简介）。
-   最后，返回 `view` 。

值得注意的是，这方法是代理模式的一部分。你之前设置了 `map view` 的代理为 `self`。因此，当 `map view` 准备显示 `pin` 时，都会调用代理中的 `mapView:viewForAnnotation:` 方法，应用才能执行到你刚定义的代码。

代理是一种很不错的自定义代码的方式，它不用重载整个类。

## 回应地理数据的通知

好的，现在让我们把这一切都整理一下。在之前，我们在 `ViewController.swift` 的 `viewDidLoad` 方法里添加了以下这行代码：

    
    NSNotificationCenter.defaultCenter().addObserver(self, selector: Selector("onVenuesUpdated:"), name: API.notifications.venuesUpdated, object: nil)

这行代码会告诉通知中心（ notification center ），`self`（当前类）正在监听名为 `API.notifications.venuesUpdated` 的通知。当发出通知的时候，`ViewController` 类的 `onVenuesUpdated:` 方法就会被调用。

添加以下方法到 `ViewController` 类里：

    
    func onVenuesUpdated(notification:NSNotification)
    {
        refreshVenues(nil)
    }

看看这里到底发生了什么吧：

-   当从 Foursquare 接收到返回的位置数据时，`refreshVenues` 方法就会被调用。
-   该方法没有包含位置数据，也没有提供 `getDataFromFoursquare` 参数。如果没有传入参数，就默认是 `false`，因此没有向 `Foursquare` 请求数据。如果传入参数，那么就会再次发起请求，请求结束又会调用该方法，这样就会导致死循环。
-   本质上来说，从 `Foursquare` 返回的数据会触发相应方法，从而将注释画到 map view 上去。

关于代码，还有一个很重要的部分。添加如下代码到 `locationManager:didUpdateToLocation:fromLocation:` 方法里。

    
    refreshVenues(newLocation, getDataFromFoursquare: true)

这行添加后大概是这样子的：

    
    if let mapView = self.mapView
    {
        let region = MKCoordinateRegionMakeWithDistance(newLocation.coordinate, distanceSpan, distanceSpan)
        mapView.setRegion(region, animated: true)
    
        refreshVenues(newLocation, getDataFromFoursquare: true)
    }

这些代码是怎么回事呢？简单来说：调用 `refreshVenues` 方法获取用户的 GPS 位置。同时，也用 API 向 Foursquare 请求数据。本质上来说，用户每次移动到新的位置都会向 Foursquare 请求数据。由于设置了间隔 50m 就更新，并且注册了通知，所以地图能正常更新。

运行应用并验证一下。是不是很酷？

![](http://www.appcoda.com/wp-content/uploads/2015/11/coffee_16.png)

## 在 Table View 里显示地理数据

现在，map view 已经能正常显示了。接着我们将会把同样的地理数据显示到 table view 中。实现起来也是很简单直接的。

首先，添加实例属性和 outlet 到 `ViewController`。在 `mapView` 属性下面添加如下的定义：

    
    @IBOutlet var tableView:UITableView?

接着，切换到 `Main.storyboard` ，选中 View Controller Scene。将 table view 与 IBOutlet 关联。

与以 `self.mapView` 可选绑定相同的方法，添加如下的代码到 `ViewController.swift` 的  `viewWillAppear:` 方法里。

    
    if let tableView = self.tableView
    {
        tableView.delegate = self
        tableView.dataSource = self
    }

并将当前的类遵循以下的协议：

    
    UITableViewDataSource, UITableViewDelegate

接着，再添加两个代理中的方法：

    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int
    {
        return venues?.count ?? 0
    }
    
    func numberOfSectionsInTableView(tableView: UITableView) -> Int
    {
        return 1
    }

这两个方法是 table view delegate 协议中方法的一部分。第一个方法确定了 table view 有多少个 cell，而第二个方法确定了 table view 有多少个 section。注意到代码中的 `??` 了吗？它是空和运算符（nil-coalescing operator）（译者注：如果对空和运算符有什么不理解的话，可以查看[中文版官方文档](http://wiki.jikexueyuan.com/project/swift/chapter2/02_Basic_Operators.html#nil_coalescing_operator)的说明）。即，如果 `venues` 是空的话，使用 0 作为默认值。

接着，添加以下方法到 `ViewController` 类：

    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell
    {
        var cell = tableView.dequeueReusableCellWithIdentifier("cellIdentifier");
    
        if cell == nil
        {
            cell = UITableViewCell(style: UITableViewCellStyle.Subtitle, reuseIdentifier: "cellIdentifier")
        }
    
        if let venue = venues?[indexPath.row]
        {
            cell!.textLabel?.text = venue.name
            cell!.detailTextLabel?.text = venue.address
        }
    
        return cell!
    }

大部分都是易懂的代码。大致步骤如下：

-   从重用队列中取出一个 cell。
-   如果没有 cell 存在，就以 `Subtitle` 的样式创建一个新的 cell 。
-   如果 `venues` 数组的第 `indexPath.row` 个元素存在，就赋值给常量 `venue` 。使用该数据去填充 cell 的 `textLabel` 和 `detailTextLabel` 。
-   返回 cell 。

和 map view 的类似， 当 table view 需要一个 table cell 的时候，就会调用 `tableView:cellForRowAtIndexPath:` 方法。你可以使用该方法来自定义你的 table view cell。这比写个子类简单多了。

接下来，是 table view 的最后一个方法。把一些方法添加到 `ViewController` 类中：

    
    func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath)
    {
        if let venue = venues?[indexPath.row]
        {
            let region = MKCoordinateRegionMakeWithDistance(CLLocationCoordinate2D(latitude: Double(venue.latitude), longitude: Double(venue.longitude)), distanceSpan, distanceSpan)
                mapView?.setRegion(region, animated: true)
        }
    }

当用户点击 cell 时，就会调用这个代理方法。代码的内容是比较简单的：当 `venues` 数组的第 `indexPath.row` 个元素存在时，使用它去填充该数据项所在区域的 map view。换句话说，把点击的项显示到 map view 的中心。

现在唯一剩下的事情就是，当通知事件发生时，及时地刷新 table view 数据。当数据更新时，你就想要把它们显示出来。

在第二个 `if` 条件判断的末尾，添加以下这行代码到 `refreshVenues:` 方法。定位到 `if let location = lastLocation` 这行代码，在该语句的有括号后面，添加如下代码：

    
    tableView?.reloadData()

OK，现在检查一下应用能否运行。使用 Command-R 编译并运行后验证结果。如果所有的设置都正确的话，地理数据会在 table view 中显示出来。

![](http://www.appcoda.com/wp-content/uploads/2015/11/coffee_17.png)

## 基于位置过滤地理数据

OK，现在有个奇怪的现象，即 table view 显示了所有的数据。如果你在应用中点击过日本，然后点了旧金山，仍然会将日本的咖啡店显示在 table view 里。

我们当然不想要这样。因此，让我们使用一些 Realm 的小魔法只让准确的数据显示。

首先，把 `ViewController` 类中的 `venues` 属性改变一下。不再使用 `Results?`，而是设置为：

    
    var venues:[Venue]?

两者之间的区别，只是类型不同而已。之前那种是包含 `Venue` 对象的 `Results` 实例。它是 Realm 的一部分。而第二种新的类型是 `Venue` 实例的数组。

最大的区别是懒加载。Realm 在加载需要使用的数据时很高效，比如你的代码访问 Realm 数据。不幸的是，Realm 并不支持对属性计算后排序的特性。因此，我们需要加载所有从 Realm 获取的数据，并执行自己定义的过滤操作。通常你会使用 Realm 来处理数据检索（使用延迟加载），并给它一个过滤器。这次暂不考虑使用这种方法。

OK，还记得这两行代码吗？

    
    let realm = try! Realm()
    venues = realm.objects(Venue)

用以下的代码段来代替以上两行代码：

    
    let (start, stop) = calculateCoordinatesWithRegion(location)
    
    let predicate = NSPredicate(format: "latitude < %f AND latitude > %f AND longitude > %f AND longitude < %f", start.latitude, stop.latitude, start.longitude, stop.longitude)
    
    let realm = try! Realm()
    
    venues = realm.objects(Venue).filter(predicate).sort {
         location.distanceFromLocation($0.coordinate) <; location.distanceFromLocation($1.coordinate)
    }

接着，在 `ViewController` 类里添加一下方法。

    
    func calculateCoordinatesWithRegion(location:CLLocation) -> (CLLocationCoordinate2D, CLLocationCoordinate2D)
    {
        let region = MKCoordinateRegionMakeWithDistance(location.coordinate, distanceSpan, distanceSpan)
    
        var start:CLLocationCoordinate2D = CLLocationCoordinate2D()
        var stop:CLLocationCoordinate2D = CLLocationCoordinate2D()
    
        start.latitude  = region.center.latitude  + (region.span.latitudeDelta  / 2.0)
        start.longitude = region.center.longitude - (region.span.longitudeDelta / 2.0)
        stop.latitude   = region.center.latitude  - (region.span.latitudeDelta  / 2.0)
        stop.longitude  = region.center.longitude + (region.span.longitudeDelta / 2.0)
    
        return (start, stop)
    }

OK，这方法也没什么特别的。只是一些基本的数学计算，把 `CLLocation` 实例基于区域的距离转换成左上和右下两个坐标。

第一行代码创建了基于位置和距离的区域。接着，设置好位置和它们的经纬度。这些值是根据中心的坐标计算出来的。最后，该方法返回一个元组：两个有序的变量。

可以把任意顺序的类型组合成元组（译者注：如果对元组有什么不理解的话，可以查看[中文版官方文档](http://wiki.jikexueyuan.com/project/swift/chapter2/01_The_Basics.html#tuples)的相应说明）。圆括号里的变量有特定的顺序，且是不可变的数组。

OK，回到我们的过滤器代码（译者注：位于上上段代码）。让我们一行一行来解读。

-   首先，创建了两个常量，`start` 和 `stop`。它们是 `calculateCoordinatesWithRegion:` 方法的返回结果。该方法返回的是一个元组，由 `start` 和 `stop` 组成。`calculateCoordinatesWithRegion:` 方法的功能就是返回当前用户的地理位置。
-   接着，创建了一个 `predicate` 变量。`NSPredicate` 是一个过滤器，它可以适用于数组，序列（译者注：也可以理解为元组）等等。`predicate` 变量定义了一个范围，`venues`数组里的 GPS 坐标必须落在该范围内。它主要是用于过滤 Realm 的数据（下一行代码会过滤）。值得注意的是，该 `predicate` 变量假设 GPS 数据是平面的，虽然地球明显是球体的。现在暂时这样假设是没事的，但是当你在南极点或北极点附近使用本应用去寻找咖啡店时就会出问题。
-   接下来，让我们来剖析一下 `realm` 对象获取数据的那部分内容。所有方法都是有关联的，也就意味着每次方法调用都用到了前一个方法调用的结果。
    -   首先，创建了一个 `realm` 变量来保存 Realm 的引用对象。
    -   接着，`Venue` 的所有对象都被懒加载：`objects(Venue)`。
    -   接着，过滤器（ `predicate` ）来过滤这些对象。Realm 可以快速的处理过滤，而且它并不是所有的对象都过滤，而只是过滤能访问到的对象。
    -   接着，调用 Swift 本地的排序算法。这里的 `sort` 并不是 Realm 的那部分，Realm 的排序算法叫`sorted`。换句话说，这部分没用上 Realm。该排序算法会访问所有的 Realm 对象，也就意味着它们都会被加载进内存，这里也没用上 Realm 的懒加载特性。该排序算法只有一个参数：一个确定两个无序对象顺序的闭包。通过返回 `true` 或 `false`，来标识闭包里两个对象比较后的关系。在上面那段代码里，前后顺序是基于离用户位置的距离的。这也是坐标属性派上用场的地方。其中，`$0` 和 `$1` 是两个无序对象的缩写。从根本上来说，该方法将地理数据以用户位置距离远近进行排序（距离越近，排在越前面）。

就说到这里吧。以上是的代码量比较大，但是效率很高。 Realm 优化的特性，方法链（method chaining）以及 Swift 本地的排序算法可以让一大票地理数据按特定的顺序保存。而且，还有一个很炫酷的事情：随着你的移动，它会随时更新。

就这样了！用 Command-R 来看看应用的效果吧。干的漂亮！

![](http://www.appcoda.com/wp-content/uploads/2015/11/coffee_18.png)

注意：不幸的是，当你在 Xcode 里模拟 GPS 坐标时，从 Foursquare 获取的数据可能会少的可怜。假如你想要获得更多数据的话，你可以去除 CoffeeAPI 中硬编码的部分，或者把地点模拟到有更多咖啡店的位置。

你对本教程有什么想法呢？留下你的留言和想法吧。

最后再安利一波。你可以从 GitHub [reinderdevries/CoffeeGuide](https://github.com/reinderdevries/CoffeeGuide) 上下载所有源代码和 Xcode 项目。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。