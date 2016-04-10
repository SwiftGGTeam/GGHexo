Xcode7 中用 Swift 做单元测试"

> 作者：Maxime Defauw，[原文链接](http://www.appcoda.com/unit-testing-swift/)，原文日期：2016-02-29
> 译者：[ray](undefined)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[way](undefined)
  









每个 iOS 程序员都要时不时的为他们的 app 做 debug。除非你是那种超级大牛，否则你肯定体验过查了无数个小时的 bug 最后才发现那仅仅是个简单的语法错误时那种油然而生的绝望感。或者更糟：你根本就没发现那些 bug。无论你是编程新手，还是开发过很多 app 的老司机，例行的写写单元测试会让你的代码更可靠，更安全，更容易 debug！



你很走运，Xcode 7 和 Swift 支持单元测试。尽管单元测试不保证（有了它你就会写出）绝对没有 bug 的 app，它还是一种能让你验证每段代码是否如期工作，并让 debug 过程更加便利。

正如其名，在单元测试中你要为某段代码单元创建一些小规模的、针对其某个特性的测试，然后确保每个代码单元都能通过这些测试。如果通过的话，它的旁边会出现一个绿色小标志，而如果因故测试不通过， Xcode 会把该测试标记为 "failed"。这就提示你去查看代码，找出失败原因。

### 演示项目概览

首先下载这个我为你准备的 [starting project](https://github.com/appcoda/SwiftUnitTestDemo/blob/master/PercentageCalculatorStarter.zip?raw=true)。一个短小精悍的 app：它会对一个给定的数字和百分比做一个乘法计算。（比如80的10%是8。）

这个 PercentageCalculator 项目非常简单。你唯一需要关注的就是 ViewController.swift 这个文件。里面的代码都标记了注释，很容易理解。

有 5 个 IBOutlets：每一个都对应了屏幕上一个 UIElement，除 title（标题）之外，还有 2 个 slider 对应 2 个 IBActions。每个 IBAction 的方法名都精确描述了其用途及将要执行的操作。当一个 slider 值改变时，其对应着的百分比或数字的值也会随之改变。

还有两个简单的函数 “updateLabels()” 和 “percentage()” 做了符合期待的事情：当一个 slider 改变时第一个函数更新 label，第二个函数获取两个浮点数并返回百分比的计算结果。

在模拟器中运行 app。刚开始一切看起来都很正常。但当你开始改变数字时就会发现计算结果有问题。为找到 bug，我们将代码分割成不同的单元，然后分别做测试，看看每个是否都如期运行。这不会解决 bug，但能缩小你的查找范围。

![](http://swift.gg/img/articles/unit-testing-swift/12401458696016.8096743)

我创建项目的时候，默认情况下会勾选创建一个 test 文件的选项（如果你想要手动加一个的话，在 iOS Source 下面选择 select File > New > File > Unit Test Case Class）。我们的例子中 test 文件已经被 Xcode 自动创建出来，可以在项目导航栏中 “PercentageCalculatorTests” 文件夹中找到它。

![](http://swift.gg/img/articles/unit-testing-swift/12401458696017.9022791)

在 `PercentageCalculatorTests.swift` 文件中，`PercentageCalculatorTests` 类里面已经为我们创建好了 4 个方法。其中 2 个是测试方法（test methods）的例子，你可以删掉它们（它俩都以 `test` 关键字开头，并且它们左边的竖条中都有个方块形图标，名字也都以 “...Example” 结尾，所以你可以通过这些辨识出来它们是测试方法）。另外两个方法，`setUp()` 和 `tearDown()` 是特殊的样板方法（boilerplate methods），它们分别在每个测试方法被执行之前，和每个测试方法被执行之后被执行。

## 开始写单元测试吧

现在是时候写你的第一个单元测试函数了！本教程我们只测试 `ViewController` 类，需要在 `PercentageCalculatorTests` 中添加一个它的实例。

    
    class PercentageCalculatorTests: XCTestCase {
        var vc: ViewController!
        
        override func setUp() {
            super.setUp()
            // 这里写setup的代码。本class里每个测试函数被调用之前该方法都会被先调用。
        }
        
        override func tearDown() {
            // 这里写teardown的代码。本class里每个测试函数被调用之后该方法都会被调用。
            super.tearDown()
        }
        
    }

`PercentageCalculatorTests` 是一个 `XCTestCase` 的子类，后者被打包在 XCTest 框架中。每一个 `XCTestCase` 子类的实例都负责对你项目的某个特定部分做测试，比如对一个特性做测试。

在 setup 方法中实例化一个 `vc`。这样对每一个测试方法你都会得到一个“全新的” `ViewController` 实例，因为在每个测试方法执行前 `setUp()` 都会被调用一次。把 `setUp()` 方法修改如下：

    
    override func setUp() {
        super.setUp()
     
        let storyboard = UIStoryboard(name: "Main", bundle: NSBundle.mainBundle())
        vc = storyboard.instantiateInitialViewController() as! ViewController
    }

现在你应该记得所有的测试方法的名字都要以 `test` 关键字开头，否则 Xcode 不会识别。添加一个新的 `testPercentageCalculator()` 测试方法，来验证一下 `ViewController` 中的 `percentage()` 工作是否正常。

    
    func testPercentageCalculator() {
    }

单元测试中你要去检查某段代码是否如你所愿的那样工作。待测试的代码段一般都只有几行，典型情况是你只需要测试一个方法或者一个函数。单元测试是这样去做的：你给某个代码单元一个输入值，让这个值过一遍这段代码，然后检查一下输出的值是否和预期的一样。

![](http://swift.gg/img/articles/unit-testing-swift/12401458696018.1332314)

与“我们期望的那个值”做比较的这部分由 `XCTAssert` 函数来处理。最简单的 `XCTAssert` 函数是`XCTAssert(expression: BooleanType)`。这个函数要求一个布尔表达式（类似于 `5>3`，`8.90 == 8.90`或者 `true` 这种），随后如果表达式为真则让测试通过，否则认为测试失败。

尝试一下！首先给 `testPercentageCalculator()` 方法加添加下面一行。然后把光标移到方法名左边侧栏的那个方块图标上，停下光标之后方块图标变成了一个执行光标，点击一下就开始了测试。

    
    func testPercentageCalculator() {
            XCTAssert(true)
    }

如果一切顺利，则测试通过，方法左边会出现一个绿色检测标。

![](http://swift.gg/img/articles/unit-testing-swift/12401458696018.2352629)

### 验证百分比计算

现在来真的：测试 `percentage()` 方法！用 `ViewController` 的一个实例 - `vc` 属性来调用这个方法。给这个方法两个浮点数，比如 50 和 50，然后把结果存储到常量 `p` 中。这个例子中 `p` 应该是 25（50 的 50% 是 25）。然后用 `XCTAssert(p == 25)` 检测一下是不是这样，执行测试方法。把 `testPercentageCalculator()` 改成这样：

    
    func testPercentageCalculator() {
            // 应该是25
            let p = vc.percentage(50, 50)
            XCTAssert(p == 25)
    }

测试成功了，这意味着 `ViewController` 的 `percentage()` 函数工作正常，我们应该在其他的地方继续寻找 bug。也许 bug 在 `updateLabels()` 里面？

### 验证Labels

现在添加一个新的测试方法 `testLabelValuesShowedProperly()` 来验证一下 label 能不能正确的显示 text。和之前一样，调用 ViewController 的一个方法 - 这回是 `updateLabels()` - 然后看看每个标签的 `text` 属性和我们期望的那个 text 是否相同。

注意到你要给 `XCTAssert` 函数传一个新的参数：一个 string 类型的消息。这对我们这次要对多个值做检查（调用三次 XCTAssert ）来完成测试而言就会很方便。如果测试失败，这条消息就会指名我们具体是哪里错了。

    
    func testLabelValuesShowedProperly() {
            vc.updateLabels(Float(80.0), Float(50.0), Float(40.0))
            
            // labels应该显示80, 50 and 40
            XCTAssert(vc.numberLabel.text == "80.0", "numberLabel doesn't show the right text")
            XCTAssert(vc.percentageLabel.text == "50.0%", "percentageLabel doesn't show the right text")
            XCTAssert(vc.resultLabel.text == "40.0", "resultLabel doesn't show the right text")
    }

你尝试执行这个测试方法时，会收到编译器的错误提示：`numberLabel`，`percentageLabel` 和 `resultsLabel` 是 `nil`。怎么回事呢？

我是在 storyboard 文件中创建了这些 labels 的，因此只有当 view 被加载之后（loaded）它们才会被初始化，然而由于对单元测试来说 `loadView()` 方法不会被触发，所以这些 labels 没有被创建，只能是 `nil`。一种可能的方法是通过调用 `vc.loadView()` 来解决，但是 Apple 在它的文档中并不推荐你这么做，因为当已经被加载的对象又被加载一次的话可能会引起内存泄露。

正确的方法是你应该先访问一下 `vc` 的 `view` 这个属性，这会让 `vc` 反过来触发所有相应的方法，不仅仅包括 `loadView()`。把 `testLabelValuesShowedProperly()` 改成这样：

    
    func testLabelValuesShowedProperly() {
            let _ = vc.view
            vc.updateLabels(Float(80.0), Float(50.0), Float(40.0))
            
            // labels应该显示80, 50 and 40
            XCTAssert(vc.numberLabel.text == "80.0", "numberLabel doesn't show the right text")
            XCTAssert(vc.percentageLabel.text == "50.0%", "percentageLabel doesn't show the right text")
            XCTAssert(vc.resultLabel.text == "40.0", "resultLabel doesn't show the right text")
    }

注意到下划线（_）忽略了常量的名字。因为我们实际上并不需要用到这个 view。加下划线就是告诉编译器“你假装访问一下这个 view，把相应的方法触发就行。”

执行测试。（如果想一并执行我们test类的所有测试，你还可以点击 “class PercentageCalculatorTests” 旁边的那个方块）。

![](http://swift.gg/img/articles/unit-testing-swift/12401458696018.3580859)

###我们来修Bug

如你所见，测试失败了！我们给 XCTAssert 方法传入的错误细节消息帮助我们快速识别出引起 bug 的可能原因。这次测试告诉我们 resultsLabel 没有显示出正确的文本，所以我们进到 ViewController 里看看对这些 label 的 text 值是在那里被设置的。仔细看了 `ViewController.swift` 的 `updateLabels()` 代码之后，我们发现了 bug 的原因：

    
    self.resultLabel.text = "\(rV + 10)"

应该是：

    
    self.resultLabel.text = "\(rV)"

更新代码之后再运行一次测试，一切都应该正常了！

### 结论

本篇教程中你学到了 Xcode 中的单元测试的相关内容，以及它怎样能够帮你找到代码中的 bug。除了预防 bug 之外，单元测试还可以用来做性能测试和异步测试。还可能让你感兴趣的是UI测试，你可以录制下你在 app 上做出的动作来测试你的 app 在实际使用情景下是如何表现的。如果听起来觉得感兴趣，那一定要看看这个讲 UI 测试的 [WWDC视频](https://developer.apple.com/videos/play/wwdc2015-406/)。

项目的最终版本可以在 [Github上下载](https://github.com/appcoda/SwiftUnitTestDemo)。

如果你有关于 UI 测试的任何问题，或者学习本教程中遇到了困难，请在评论中点我！

作者介绍：Maxime Defauw 是一个有经验的程序员，在 App Store 和 Google Play store 上发布过多个 app。他今年 16 岁，居住在比利时。最近他在 San Francisco 举行的 WWDC15 上获得了 Apple 的奖学金。Max 熟练掌握 Objective-C，C，C#，现在是 Swift。不码代码的时候他一般在曲棍球场或者高尔夫球场上。在 Twitter 上 [@MaximeDefauw](http://twitter.com/MaximeDefauw) 粉他。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。