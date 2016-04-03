title: "使用UISearchController自定义搜索栏"
date: 2015-09-11 20:00:02
tags: [Swift 进阶]
categories: [AppCoda]
permalink: custom_search_bar_tutorial

---
原文链接=http://www.appcoda.com/custom-search-bar-tutorial/
作者=AppCoda
原文日期=2015-08-27
译者=saitjr
校对=numbbbbb
定稿=shanks


很多应用都需要*搜索功能*并把结果展示在`UITableView`中。毋庸置疑，很多开发者都遇到过这种开发需求。通常的做法都是直接使用 iOS SDK 中自带的控件。iOS 8 以前，苹果提供了一个用于具有搜索功能的控制器`UISearchDisplayController`。使用这个控制器，结合`UISearchBar`，能更方便的在应用中添加搜索特性。然而，这些都已成为历史。

iOS 8 到来以后，这种实现方式发生了改变。首先，`UISearchDisplayController`被弃用，即使他可以在 IB(Interface Builder) 界面中使用。而现在，出现了一个新的控制器`UISearchController`，但它却没有在 IB(Interface Builder) 中显示。相反，需要编码来进行初始化并配置，其实这很简单，接下来的文章中将会介绍到。

<!--more-->

![](http://www.appcoda.com/wp-content/uploads/2015/08/custom-search-bar-featured.jpg)

除了上面提到的内容， 在 `UITableView` 中搜索数据源还有一点比较有趣。iOS SDK 给搜索栏提供了一个默认外观，并且这个外观能适合绝大多数的界面样式。然而，当 UI 界面高度自定义时，自带的搜索栏样式可能就不太能符合整个 App 的界面风格了。这种情况下，为避免搜索栏特别扎眼，就必须要自定义了。

所以，上面说了那么多，是时候开始教程的正文了。我写这篇教程主要有两个目的：第一个目的是演示在 iOS 8 中，如何使用默认搜索栏风格的 `UISearchController` 来搜索、过滤数据。即使在 IB 中没有 `UISearchController`，我们也能使用很简单的代码来对它进行配置。第二个目的是展示如何重写搜索栏的样式，从来使它更加契合 App 设计风格。正如你接下来所看到的，我们需要继承 `UISearchController` 与 `UISearchBar` 类，但需要添加的代码却很简单。我们将会使用非常普通的方法来对子类进行实现，这样就可以在你的项目中重用了。

到此，介绍部分就要结束了，接下来先看看 Demo 的细节，然后实现它。

## Demo App 预览

下面的两张图是Demo的最终效果：

![](http://www.appcoda.com/wp-content/uploads/2015/08/search-bar-demo-app.png)

第一张图，是`UISearchController`的默认搜索栏。第二张图，是自定义的搜索栏。接下来将会介绍到两种搜索栏的实现，但在此之前，还需要介绍下这个项目。

和往常一样，可以先[下载](https://www.dropbox.com/s/3aq54d8evd5ypoc/CustomSearchBarStarter.zip?dl=0)这个示例项目。下载下来后，使用 Xcode 打开，可以先看一下工程目录。介于最终效果比较简单，所以文件并不是太多。在 StroryBoard 中有一个 `tableView`，它将用于展示数据、搜索栏和搜索结果。除此之外，在 `ViewController` 类中有少量的 `tableView delegate` 与 `dataSource` 方法的实现。

在这个案例中，我们的数据源是全世界所有国家的名称。在工程中，可以找到一个名为 `countries.txt` 的文件，我们需要做的就是将这个文件加载到程序中，存入数组并使用。国家列表文件来源于这个[网站](http://www.countries-list.info/)。

接下来的所有操作，都可以分为以下三个步骤：

1. 我们需要加载数据，这样可以在之后方面调用；
2. 我们将使用 `UISearchController` 来实现默认的搜索功能；
3. 我们将继承并自定义搜索控制器与搜索栏的风格。

接下来，我们一起来细化每一个步骤吧。

## 加载并显示样本数据

我们首先加载 `countries.txt` 文件并将它放入数组，这样 `tableView` 便有了数据源。接着，需要将整个国家列表展示出来。当完成这一步以后，我们就可以将注意力放在实现两种搜索方法设计上了。

在加载内容到数组里之前，先要在 `ViewController` 类中声明一些属性，接着便可以直接使用这些属性了。在 `ViewController.swift` 文件中添加以下三行：

``` swift
var dataArray = [String]()
var filteredArray = [String]()
var shouldShowSearchResults = false
```

我来解释一下上面的代码。`dataArray` 数组包含的内容就是要显示在 `tableView` 上的国家列表。要记住，这个数组只在没有搜索操作的时候作为 `dataSource`。当开始搜索时，`filteredArray` 将会作为 `dataSource`，里面只包含了符合搜索条件的国家名称。具体由哪个数组来作为 tableView 的 dataSource，将由 `shouldShowSearchResults` 这个属性来指定。

现在，让我们把 `countries.txt` 文件中的数据加载到 `dataArray` 数组中，这样就能在tableView中使用了。在初始项目中，有一个对 tableView 简单的实现，接下来要继续对它进行完善。需要添加一个新的方法`loadListOfCountries()`。具体做法是：首先需要将 `countries.txt` 文件中的内容加载到一个字符串中，然后按照换行符将字符串拆分为数组。最终得到的数组将作为 tableView 的原始数据。来看一下代码：

``` swift
func loadListOfCountries() {
    // 得到国家列表文件的路径
    let pathToFile = NSBundle.mainBundle().pathForResource("countries", ofType: "txt")

    if let path = pathToFile {
        // 得到文件内容，加载到一个字符串中
        let countriesString = String(contentsOfFile: path, encoding: NSUTF8StringEncoding, error: nil)!

        // 通过换行符分割，得到国家列表，存到数组中
        dataArray = countriesString.componentsSeparatedByString("\n")

        // 刷新tableView
        tblSearchResults.reloadData()
    }
}
```

然后，在 `viewDidLoad()` 方法中调用。

``` swift
override func viewDidLoad() {
    ...

    loadListOfCountries()
}
```

我们现在需要更新几个与 tableView 相关的方法，tableView的显示行数，应该取决于当前使用的是哪一个数组：

``` swift
func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    if shouldShowSearchResults {
        return filteredArray.count
    }
    else {
        return dataArray.count
    }
}
```

接着，指定单元行的内容：

``` swift
func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
    var cell = tableView.dequeueReusableCellWithIdentifier("idCell", forIndexPath: indexPath) as! UITableViewCell

    if shouldShowSearchResults {
        cell.textLabel?.text = filteredArray[indexPath.row]
    }
    else {
        cell.textLabel?.text = dataArray[indexPath.row]
    }

    return cell
}
```

现在运行程序就可以看到国家列表显示在了 `tableView` 上。目前为止，我们还没有做一些比较新、比较难的操作，接下来让我们来配置搜索控制器并显示默认的搜索栏。

![](http://www.appcoda.com/wp-content/uploads/2015/08/t41_3_countries_list.png)

## 配置 `UISearchController`

为了能使用 `UISearchController` 在 `tableView` 中运行搜索功能，还有必要添加一个属性。所以，在 `ViewController` 类的顶部添加一下代码：

``` swift
var searchController: UISearchController!
```

为实现效果，需要添加一个名为 `configureSearchController()` 的自定义方法。在这个方法中，要初始化刚才定义的属性并给它配置一些属性。事实上，搜索控制器就是有一些特殊属性的视图控制器。

其中一个属性就是 `searchBar`，它相当于显示在 `tableView` 顶部的搜索栏。还有一些属性会在接下来的方法中进行设置。搜索栏并不会自动显示在 `tableView` 上，所以我们需要手动进行设置，接下来也会讲到。 除此之外，搜索控制器和搜索栏还有很多属性可以配置。详细信息可以查看在[这里](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UISearchDisplayController_Class/)和[这里](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UISearchBar_Class/)。

接下来，让我们从一个新方法开始，一步一步的进行配置。首先，初始化 `searchController`：

``` swift
func configureSearchController() {
    searchController = UISearchController(searchResultsController: nil)
}
```

这里有个重要的细节：Demo 中用来显示搜索结果的 `tableView` 和搜索控制器在同一个视图控制器中。但是在一些情况下，用于展示搜索结果的视图控制器和正在执行搜索的控制器是不同的，并且搜索控制器必须以某种方式知道这个情况。唯一的方式就是通过上面说的初始化方法。当传参是`nil`时，搜索控制器知道存在另一个视图控制器来处理和显示搜索的结果。任何其他情况下，展示搜索结果的控制器和用于搜索的控制器是不同的。

我们有两种方式来实现在键入搜索词时，将搜索结果显示到 `tableView` 上。第一种方式是用 `search bar` 代理，第二种方式是将 `ViewController` 类作为 `searchResultsUpdater` 的代理。我们将会在自定义搜索栏的时候使用到第一种方法，所以现在先介绍第二种。既然如此，我们需要让 `ViewController` 类遵循 `UIResultsUpdating` 协议。这个协议是 iOS 8 更新的，具体描述为：基于键入的搜索词，更新搜索结果。这个协议只有一个代理方法需要实现，但我们等会在弄。现在先遵循一下这个协议：

``` swift
class ViewController: UIViewController, UITableViewDelegate, UITableViewDataSource, UISearchResultsUpdating
```

再次回到 `configureSearchController()` 方法，添加一句代码，这样就离成功又近了一步：

``` swift
func configureSearchController() {
    ...

    searchController.searchResultsUpdater = self
}
```

除此之外，你也可以看看根据需要，设置一些其他的属性。比如，下面这个属性设为 `true`，那么开始输入时，背景就会变暗。

``` swift
func configureSearchController() {
    ...

    searchController.dimsBackgroundDuringPresentation = true
}
```

通常情况下，当搜索控制器与显示结果的 `tableView` 在同一个视图控制器中时，是不会将背景变暗的，所以，还是把上面的 `dimsBackgroundDuringPresentation` 属性设为 `false` 吧。

现在来配置一下搜索栏，给它添加一个 `placeholder`：

``` swift
func configureSearchController() {
    ...

    searchController.searchBar.placeholder = "Search here..."
}
```

除此之外，再设置一下搜索栏的代理，等下就可以使用代理方法了：

``` swift
func configureSearchController() {
    ...

    searchController.searchBar.delegate = self
}
```

然后，这里有一个比较取巧的方式来设置搜索栏的大小：

``` swift
func configureSearchController() {
    ...

    searchController.searchBar.sizeToFit()
}
```

想要让搜索栏显示出来，还必须加上下面这句代码：

``` swift
func configureSearchController() {
    ...

    tblSearchResults.tableHeaderView = searchController.searchBar
}
```

到此，整个`configureSearchController()`方法中的代码如下：

``` swift
func configureSearchController() {
    // 初始化搜索控制器，并且进行最小化的配置
    searchController = UISearchController(searchResultsController: nil)
    searchController.searchResultsUpdater = self
    searchController.dimsBackgroundDuringPresentation = false
    searchController.searchBar.placeholder = "Search here..."
    searchController.searchBar.delegate = self
    searchController.searchBar.sizeToFit()

    // 放置 搜索条在 tableView的头部视图中
    tblSearchResults.tableHeaderView = searchController.searchBar
}
```

现在，到 `ViewController` 类的顶部，遵循 `UISearchBarDelegate` 协议：

``` swift
class ViewController: UIViewController, UITableViewDelegate, UITableViewDataSource, UISearchResultsUpdating, UISearchBarDelegate
```

接着，在 `viewDidLoad()` 中调用 `configureSearchController()` 方法：

``` swift
override func viewDidLoad() {
    ...

    configureSearchController()
}
```

以上就是想要使用 `UISearchController` 将搜索栏显示在 `tableView` 上的全部代码。现在我们可以处理搜索结果了。现在不要去管 Xcode 报的错，我们将缺失的代理方法实现以后，错误就会消失。

## 处理搜索结果

现在来处理搜索和显示结果操作吧。这一步分为两个部分。首先，当在搜索栏键入关键字或者键盘上的搜索按钮被点击时，能够将搜索结果返回。对于边输入边搜索这个功能，并不强制实现。如果你愿意，也可以在输入时，跳过返回结果这个步骤。但是，点击搜索按钮时，显示搜索结果这个是必须要实现的，否则搜索栏就变得毫无意义了。在这两种情况下，`filteredArray` 都将是 `tableView` 的 `dataSource`，在没有进行搜索时，`filteredArray` 应该是上一次的搜索结果。

我们已经使用 `shouldShowSearchResults` 属性来判断应该用哪一个数组作为 `dataSource` 了，但目前为止，还没有代码修改过 `shouldShowSearchResults` 的值。那么现在来完成它，它的值取决于是否在进行搜索操作。

根据这个逻辑，我们先来实现 `UISearchBarDelegate` 的两个代理方法。正如你所看到的，在这两个方法中，我们对 `shouldShowSearchResults` 的值进行了修改，并且刷新了 `tableView`：

``` swift
func searchBarTextDidBeginEditing(searchBar: UISearchBar) {
    shouldShowSearchResults = true
    tblSearchResults.reloadData()
}


func searchBarCancelButtonClicked(searchBar: UISearchBar) {
    shouldShowSearchResults = false
    tblSearchResults.reloadData()
}
```

第一个方法会在搜索开始时，将 `filteredArray` 作为 `dataSource`。同理，第二个方法会在取消搜索按钮按下时，将 `dataArray` 作为 `dataSource`。

接下来，实现另一个代理方法，它将会显示搜索结果，并且会在搜索按钮按下时，取消搜索框的第一响应。注意，下面的这个 `if` 条件在不想要边输入边搜索的时候很有用。

``` swift
func searchBarSearchButtonClicked(searchBar: UISearchBar) {
    if !shouldShowSearchResults {
        shouldShowSearchResults = true
        tblSearchResults.reloadData()
    }

    searchController.searchBar.resignFirstResponder()
}
```

正如写在代理方法中的条件判断一样，给 `shouldShowSearchResults` 正确的值并且刷新 `tableView`，就能每次都在视图控制器中显示正确的数据了。

上面的每一步都很完美，但还是缺少一个重要的步骤。目前为止，我们都还没有和 `filteredArray` 打过交道，所以上面的代码并不能得到我们想要的结果。在上一节中，我们遵循了 `UISearchResultsUpdating` 协议，那时我说，这个协议中只有一个方法需要实现。那好，现在我们来看一下这个方法。我们将在这个方法中，根据输入的关键字，来把原始数据过滤一下，把符合条件的数据，放入 `filteredArray` 数组：

``` swift
func updateSearchResultsForSearchController(searchController: UISearchController) {
    let searchString = searchController.searchBar.text

    // 根据用户输入过滤数据到 filteredArray
    filteredArray = dataArray.filter({ (country) -> Bool in
        let countryText: NSString = country

        return (countryText.rangeOfString(searchString, options: NSStringCompareOptions.CaseInsensitiveSearch).location) != NSNotFound
    })

    // 刷新 tableView
    tblSearchResults.reloadData()
}
```

让我们深入了解下这个方法都干了啥。首先，我们将输入的关键字赋给了一个字符串常量 `searchString`。其实可以不用专门拿中间量来接收的，但是这样更方便。

上面这个方法的核心，就是使用 `filter` 方法来过滤 `dataArray` 的操作。它的功能就像 `filter` 这个名字一样，它根据在闭包中写的过滤条件来过滤原始数据，然后将满足条件的数据添加到 `filteredArray` 中。每个国家字符串都作为闭包的参数传入，参数名为`country`。接着，将`country`转为了类型是`NSString`的常量`countryText`。这个操作是为了保证接下来调用`NSString`的`rangeOfString()`方法时不会出现类型错误。`rangeOfString()`方法能查找关键字（`searchString`）是否在当前国家字符串中（译者注：如，“斯”是否在“俄罗斯”中），如果能找到，则返回关键字所在的范围（`NSRange`）。如果关键字不在当前国家字符串中，那么会返回 `NSNotFound`。因为闭包的返回值是 `Bool`类型，所以我们需要做的就是将 `rangeOfString()` 的返回值和 `NSNotFound` 做对比。

在最后，刷新 `tableView`，这样就能显示过滤后的国家列表了。我所提供的只是万千解决方案中的一种，你也可以对上面的代码进行精炼和修改。

现在运行程序来测试下功能。键入一个国家名称，可以看到 `tableView` 及时的进行了刷新。测试下搜索和取消按钮，观察 App 的响应。最后，尝试修改一下之前写的代码，这样更有助于理解。

到此，教程的第一部分就结束了。在接下来这个部分中，你将看到如何重写搜索控制器和搜索栏的样式，如何通过自定义来让他们更加符合 App 的 UI 风格。

![](http://www.appcoda.com/wp-content/uploads/2015/08/t41_1_default_search_sample.png)

## 自定义搜索栏

其实要自定义搜索控制器和搜索栏很简单，你只需要继承 `UISearchController` 和 `UISearchBar`，然后写入想要的自定义方法和逻辑就可以了。其实，这个步骤在每次需要重写 iOS SDK 时都要经历，所以接下来介绍的步骤以前都做过。

我们的自定义操作将从继承 `UISearchBar` 开始。接下来，会把这个自定义的搜索栏用到搜索控制器的子类上。最后，要在 `ViewController` 类中使用这两个自定义类。

首先，在 Xcode 创建新文件，步骤是`File` >` New `>` File`…，在左侧的菜单中，选择 `iOS` >` Source` 分类的 `Cocoa Touch Class`。接着，将 `Subclass of` 内容设置为 `UISearchBar`，类名设置为 `CustomSearchBar`：

![](http://www.appcoda.com/wp-content/uploads/2015/08/t41_4_custom_search_bar_class.png)

结束创建，并选中打开这个文件。我们开始写自定义初始化方法。在初始化方法中，定义接下来自定义搜索栏和搜索输入框所需的 `frame`，`font`和 `text color`。在此之前，先定义以下两个属性：

``` swift
var preferredFont: UIFont!
var preferredTextColor: UIColor!
```

下面是自定义初始化方法：

``` swift
init(frame: CGRect, font: UIFont, textColor: UIColor) {
    super.init(frame: frame)

    self.frame = frame
    preferredFont = font
    preferredTextColor = textColor

}
```

正如你所看到的，上面的代码先给搜索栏设置了 `frame`，用定义的属性接收了 `font` 与 `textColor`，这两个属性会在之后使用到。

接下来，用下面一行代码来设置搜索栏的风格：

``` swift
searchBarStyle = UISearchBarStyle.Prominent
```

这句话使搜索栏有半透明效果，而搜索输入框不透明。但这还不够，我们需要将搜索栏和输入框都设置为不透明的，所以可能需要设置颜色让配色看起来更协调。因此，先添加以下代码：

``` swift
translucent = false
```

添加上面两句代码后，现在初始化方法变成了：

``` swift
init(frame: CGRect, font: UIFont, textColor: UIColor) {
    super.init(frame: frame)

    self.frame = frame
    preferredFont = font
    preferredTextColor = textColor

    searchBarStyle = UISearchBarStyle.Prominent
    translucent = false
}
```

注意：搜索栏并不只由一个控件组成，相反，它实际上它有一个 `UIView` 类型的子视图，在这个视图中，有两个相当重要的子视图：一个是搜索输入框（是 `UITextField` 的子类），还有一个是搜索输入框的背景视图。为了更清晰的了解它，我们打印一下它的子视图：

``` swift
println(subviews[0].subviews)
```

控制台上会显示：

![](http://www.appcoda.com/wp-content/uploads/2015/08/t41_5_search_bar_subviews.png)

除了刚才的自定义初始方法以外，还需要添加一个初始化方法：

``` swift
required init(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
}
```

根据刚才的注意事项，我们需要拿到真正的搜索输入框（就是搜索框中的 `textfield` ）。先添加下面这个方法，它将会返回输入框在搜索框所以子视图中的下标：

``` swift
func indexOfSearchFieldInSubviews() -> Int! {
    var index: Int!
    let searchBarView = subviews[0] as! UIView

    for var i=0; i<searchBarView.subviews.count; ++i {
        if searchBarView.subviews[i].isKindOfClass(UITextField) {
            index = i
            break
        }
    }

    return index
}
```

有了上面这个方法，我们就可以通过重写本类中的 `drawRect()` 方法来自定义了。在这里，我们有两个非常明确的任务：第一个是获取到输入框并把它改成需要的样子，第二个是给搜索栏画一条自定义的底部线条。

具体需要对输入框进行如下修改：

1. 修改一下 `frame` ，让它比搜索栏小一点；
2. 设置自定义的字体；
3. 设置字体颜色；
4. 修改背景颜色。这是为了让他更契合搜索栏的主题色，这会在下一部分中介绍到。通过这样的手段，可以让搜索栏和输入框的风格更统一（可以在项目概述的地方看到最终效果）。

把这些内容转换成代码：

``` swift
override func drawRect(rect: CGRect) {
    // 获取搜索栏子视图中搜索输入框的下标
    if let index = indexOfSearchFieldInSubviews() {
        // 获取搜索输入框
        let searchField: UITextField = (subviews[0] as! UIView).subviews[index] as! UITextField

        // 设置 frame
        searchField.frame = CGRectMake(5.0, 5.0, frame.size.width - 10.0, frame.size.height - 10.0)

        // 设置字体和文字颜色
        searchField.font = preferredFont
        searchField.textColor = preferredTextColor

        // 设置背景颜色
        searchField.backgroundColor = barTintColor
    }

    super.drawRect(rect)
}
```

这里也用到了我们之前实现的自定义方法 `indexOfSearchFieldInSubviews()`。

最后，给搜索栏底部画一条线。现在，有两件事需要做：第一就是要根据绘出的线创建一条*贝塞尔路径*，第二就是要根据*贝塞尔路径*创建一个 `CAShapeLayer` 的实例，并给他设置颜色与线宽。最终，这个 `layer` 将作为搜索栏的子 `layer`。实现如下：

``` swift
override func drawRect(rect: CGRect) {
    ...

    var startPoint = CGPointMake(0.0, frame.size.height)
    var endPoint = CGPointMake(frame.size.width, frame.size.height)
    var path = UIBezierPath()
    path.moveToPoint(startPoint)
    path.addLineToPoint(endPoint)

    var shapeLayer = CAShapeLayer()
    shapeLayer.path = path.CGPath
    shapeLayer.strokeColor = preferredTextColor.CGColor
    shapeLayer.lineWidth = 2.5

    layer.addSublayer(shapeLayer)

    super.drawRect(rect)
}
```

当然，你也可以根据喜好或需求来修改线的颜色和线宽。在任何情况下，你都能方便的修改这些属性。

现在，自定义的搜索栏就搞定了。因为还缺少搜索控制器，所以暂时还不能看到效果，不过在下一节就会实现了。在这一节中，重要就是如何正确的去自定义搜索栏，让它和你的App更加和谐。

## 自定义搜索控制器

我们的自定义搜索控制器将会是 `UISearchController` 的子类，操作步骤也和上一节差不多。创建文件的步骤都一样，只是要注意 `Subclass` 要改为 `UISearchController`，类名是 `CustomSearchController`:

![](http://www.appcoda.com/wp-content/uploads/2015/08/t41_6_custom_search_controller_class.png)

创建完以后，在工程目录里面选中这个类，在开头添加自定义搜索栏的属性：

``` swift
var customSearchBar: CustomSearchBar!
```

接下来，依然需要添加自定义初始化方法。这个方法有五个参数：

1. 用于显示搜索结果的视图控制器；
2. 搜索栏的 `frame`；
3. 搜索输入框的字体；
4. 搜索输入框的字体颜色；
5. 搜索栏的主题色

代码如下：

``` swift
init(searchResultsController: UIViewController!, searchBarFrame: CGRect, searchBarFont: UIFont, searchBarTextColor: UIColor, searchBarTintColor: UIColor) {
    super.init(searchResultsController: searchResultsController)

    configureSearchBar(searchBarFrame, font: searchBarFont, textColor: searchBarTextColor, bgColor: searchBarTintColor)
}
```

这里的 `configureSearchBar()` 方法，会在后面进行实现。从方法名可以看出，我们会在这个方法中，对搜索栏进行一些配置。

在实现这个方法之前，还需要添加两个必要的初始化方法：

``` swift
override init(nibName nibNameOrNil: String?, bundle nibBundleOrNil: NSBundle?) {
    super.init(nibName: nibNameOrNil, bundle: nibBundleOrNil)
}

required init(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
}
```

现在可以实现配置搜索栏的方法了，方法很简单：

``` swift
func configureSearchBar(frame: CGRect, font: UIFont, textColor: UIColor, bgColor: UIColor) {
    customSearchBar = CustomSearchBar(frame: frame, font: font , textColor: textColor)

    customSearchBar.barTintColor = bgColor
    customSearchBar.tintColor = textColor
    customSearchBar.showsBookmarkButton = false
    customSearchBar.showsCancelButton = true
}
```

上面的第一行代码，利用了搜索栏的自定义初始化方法实例化了一个自定义搜索栏。接下来的事情就简单多了：给自定义搜索栏设置主题色（`barTintColor`）和它元素的主题色（`tintColor`）。接着，我们不显示 bookmark 按钮，而显示取消按钮。当然，这些属性都可以根据自己需求来设置。

现在，自定义搜索控制器就搞定了，即使还没有遵守搜索栏的 `UISearchBarDelegate` 协议。这个会在下一个部分中实现。然而，现在已经可以使用这两个自定义类了。

回到`ViewController`类，在顶部添加以下属性：

``` swift
var customSearchController: CustomSearchController!
```

接下来，用一个超级简单额方法来初始化自定义的搜索控制器，并且给它设置`frame`，`font`和`color`，代码如下：

``` swift
func configureCustomSearchController() {
    customSearchController = CustomSearchController(searchResultsController: self, searchBarFrame: CGRectMake(0.0, 0.0, tblSearchResults.frame.size.width, 50.0), searchBarFont: UIFont(name: "Futura", size: 16.0)!, searchBarTextColor: UIColor.orangeColor(), searchBarTintColor: UIColor.blackColor())

    customSearchController.customSearchBar.placeholder = "Search in this awesome bar..."
    tblSearchResults.tableHeaderView = customSearchController.customSearchBar
}
```

通过上面的方法，就可以给自定义搜索栏设置响应的参数。接着，再给搜索框添加 `placeholder`。最后，把搜索栏显示到 `tableView` 的 `header` 上。

现在，在 `viewDidLoad()` 方法中，还要做两件事：调用刚刚实现的 `configureCustomSearchController()`，并注释 `configureSearchController()` 方法，防止系统默认搜索栏再显示。

``` swift
override func viewDidLoad() {
    ...

    // configureSearchController()

    configureCustomSearchController()
}
```

在这个时候，自定义控制器还达不到想要的要求，因为搜索操作还没加上去。这个问题会在下一节中解决。不过现在已经可以看到自定义搜索控制器的效果了。

![](http://www.appcoda.com/wp-content/uploads/2015/08/t41_7_custom_search_bar.png)

## 给自定义搜索控制器添加搜索操作

把搜索控制器设置为搜索栏的代理，这就意味着，和搜索相关的方法实现都会放在 `CustomSearchController` 类中。然后，自定义一个协议，让 `ViewController` 类遵循并实现代理方法。这样就在 `ViewController` 中处理搜索结果了，就像上一个部分中，使用系统默认的搜索逻辑一样。

接下来，按照上面逻辑进行实现。首先， 打开 `CustomSearchController.swift` 文件，找到 `configureSearchBar()` 方法，添加以下代码：

``` swift
func configureSearchBar(frame: CGRect, font: UIFont, textColor: UIColor, bgColor: UIColor) {
    ...

    customSearchBar.delegate = self
}
```

将 `CustomSearchController` 设置为搜索栏的代理，先在 `CustomSearchController` 顶部遵循 `UISearchBarDelegate`，

``` swift
class CustomSearchController: UISearchController, UISearchBarDelegate
```

接着，创建自定义协议，并添加几个代理方法（下面这段代码要添加在 `CustomSearchController` 类之前）：

``` swift
protocol CustomSearchControllerDelegate {
    func didStartSearching()

    func didTapOnSearchButton()

    func didTapOnCancelButton()

    func didChangeSearchText(searchText: String)
}
```

代理方法的功能就不多做解释了，完全的见名知意。在 `CustomSearchController` 类中，定义 `delegate` 属性：

``` swift
var customDelegate: CustomSearchControllerDelegate!
```

这时，我们就可以添加搜索栏协议剩下的代理方法了，然后这些方法中，调用响应的 `CustomSearchControllerDelegate` 代理方法。

首先，当搜索框开始编辑时：

``` swift
func searchBarTextDidBeginEditing(searchBar: UISearchBar) {
    customDelegate.didStartSearching()
}
```

当键盘上的搜索按钮点击时：

``` swift
func searchBarSearchButtonClicked(searchBar: UISearchBar) {
    customSearchBar.resignFirstResponder()
    customDelegate.didTapOnSearchButton()
}
```

当搜索栏上的取消按钮点击时：

``` swift
func searchBarSearchButtonClicked(searchBar: UISearchBar) {
    customSearchBar.resignFirstResponder()
    customDelegate.didTapOnSearchButton()
}
```

最后，当搜索关键字变化时：

``` swift
func searchBar(searchBar: UISearchBar, textDidChange searchText: String) {
    customDelegate.didChangeSearchText(searchText)
}
```

以上的这些方法，会在搜索开始、结束和关键字改变时告诉 `ViewController`。现在，打开 `ViewController.swift` 文件，在 `configureCustomSearchController()` 方法中添加下面这行代码：

``` swift
func configureCustomSearchController() {
    ...

    customSearchController.customDelegate = self
}
```

别忘了在类头部遵循 `CustomSearchControllerDelegate` 协议，这样实现的代理方法才有效：

``` swift
class ViewController: UIViewController, UITableViewDelegate, UITableViewDataSource, UISearchResultsUpdating, UISearchBarDelegate, CustomSearchControllerDelegate
```

最后，让我们来实现 `CustomSearchControllerDelegate` 的代理方法，这和普通的搜索控制器的处理差不多，代码如下：

开始搜索时：

``` swift
func didStartSearching() {
    shouldShowSearchResults = true
    tblSearchResults.reloadData()
}
```

点击搜索按钮时：

``` swift
func didTapOnSearchButton() {
    if !shouldShowSearchResults {
        shouldShowSearchResults = true
        tblSearchResults.reloadData()
    }
}
```

点击取消按钮时：

``` swift
func didTapOnCancelButton() {
    shouldShowSearchResults = false
    tblSearchResults.reloadData()
}
```

搜索关键字改变时：

``` swift
func didChangeSearchText(searchText: String) {
    // 根据用户输入过滤数据到 filteredArray
    filteredArray = dataArray.filter({ (country) -> Bool in
        let countryText: NSString = country

        return (countryText.rangeOfString(searchText, options: NSStringCompareOptions.CaseInsensitiveSearch).location) != NSNotFound
    })

    // 刷新 tableview
    tblSearchResults.reloadData()
}
```

到此，整个 App 的功能就已经完全 ok 了，并且使用的是自定义的搜索控制器。运行看下效果：

![](http://www.appcoda.com/wp-content/uploads/2015/08/custom_search_bar.png)

## 总结

再快速浏览一遍上面的实现流程，不管是使用 iOS 8 提供的 `UISearchController`，还是自定义搜索栏和搜索控制器，都还比较容易理解。得到的结论都是一样的：我们可以很完美的在自己的 App 使用搜索功能。如果你的 App 对 UI 的要求不是很严格，那么可以选用默认的搜索栏样式，如果需要自定义的样式，那也可以搞定，反正已经知道该怎么做了。是时候结束了，希望这篇教程能在需要的时候帮到你。

完整的 Xcode 代码可以在[这里](https://www.dropbox.com/s/cl454ot0876hjax/CustomSearchBarFinal.zip?dl=0)下载。
