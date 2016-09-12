title: "如何使用 iOS 9 的 Core Spotlight 框架"
date: 2016-08-30
tags: [iOS 开发]
categories: [AppCoda]
permalink: core-spotlight-framework
keywords: ios corespotlight,ios9 spotlight搜索,ios 9 应用内搜索
custom_title: 
description: 怎么实现 iOS 9 应用内搜索呢，本文就来教你使用 iOS 9 的 CoreSpotlight 框架来帮助你建立起你的应用中的索引。

---
原文链接=http://www.appcoda.com/core-spotlight-framework/
作者=AppCoda
原文日期=2015-12-22
译者=BigbigChai
校对=walkingway
定稿=CMB

<!--此处开始正文-->
 
每一代 iOS 都会为全球的开发者们带来新鲜的“小玩意儿”和对现有技术进行提升。显然，最新的 iOS 9 也不例外，开发者们拥有了全新的框架和 APIs 以方便调用、这可以显著地提升应用程序的水平。Core Spotlight 框架就是其中之一，它包含了许多优秀 APIs，开发者可以很方便地应用在工程中。

Core Spotlight（CS）框架属于一个更大的 API 集合 Search APIs，它让开发者们可以地将应用变得更容易被发现，以及访问起来更加便利。这在以前的 iOS 版本里是不可想象的。Search APIs 让用户和应用之间的联系更加紧密。用户可以更迅速地访问应用，同时应用也能更主动及时地响应用户。除 Core Spotlight 以外，iOS 9 其他新的搜索功能还包括（仅供参考）：

1. *NSUserActivity* 类的新方法和属性（负责保存应用的状态以便稍后恢复）。
2. *web markup* 让网页的内容在设备上可被搜索。
3. *universal links* 允许从网页内容里的链接直接打开应用。

我们不会在这篇文章里讨论以上三项，但会详细地介绍 Core Spotlight 框架。但开始之前，我们先来搞清楚这个框架的用途。

![](http://www.appcoda.com/wp-content/uploads/2015/12/core-spotlight-framework.jpg)

[Core Spotlight 框架](https://developer.apple.com/library/ios/documentation/CoreSpotlight/Reference/CoreSpotlight_Framework/)让应用里的数据在 Spotlight *可搜索*，然后把与应用相关的搜索结果与系统返回的其他结果一同展示出来。这令人印象深刻并具有革命性，因为这是用户首次可以搜索到除 Apple 官方应用外、任意应用中的数据，然后与之进行交互。用户可以与自定义应用的相关搜索结果进行交互的意思是：不但在搜索结果项被选中时会自动启动应用，而且开发者们也能引导用户跳转到特定视图控制器，用来展示 Spotlight 中被选择的数据。

从开发者的角度看来，集成 Core Spotlight 框架和使用它的 API 并不复杂。正如本教程随后会介绍的那样，只需要几行代码就能搞定。整个过程的重点在于开发者需要“请求” iOS 去索引他们应用里的数据，并且这些数据必须预先以特定的方式来表示。

鉴于这是一篇关于 Core Spotlight 框架的教程，我不打算在简介部分过于详细。如果你有兴趣学习如何实现一些我个人觉得非常棒的功能，那么请继续阅读。我相信，当你读完之后，就能很轻松地让你的应用支持 Spotlight 搜索。

<!--more-->

## 关于示例应用

为了深入剖析本节主题的细节部分，我们还是一如既往的借助实例应用来研究。在本教程，我们的应用会展示一系列的数据，这些数据能在设备（或者模拟器）的 Spotlight 中搜索到。尽管这只是一个大的蓝图，但再补充一下应用程序的细节也是很必要的。

我们的示例应用展示了一些*电影*及相关信息，例如简介、导演、演员、评价，等等。所有的电影数据会展示在 tableView 里，当点击某一行时，被选中电影的详情会展示在一个新的视图控制器里。没有更复杂的功能了，这种功能和数据就足以让我们了解 Core Spotlight API 是如何工作的。再补充一点，我们数据的来源是 [IMDB](http://www.imdb.com/)，我是从这里获取示例数据的。

你可以先看看下面的动图，大致对这个示例应用有个初步印象

![](http://www.appcoda.com/wp-content/uploads/2015/12/t46_1_app_working-compressor.gif)

这个教程里我们有两个目标： 最首要的是在 Spotlight 中能搜索到应用的所有电影数据。这样，当用户搜索关键词时，应用中涉及到该电影相关的数据会展示出来。设置这些关键词也是稍后的工作之一，因为定义它们（关键词）也是我们的职责。

点击搜索的电影结果，会启动应用，接着我们来完成第二个目标。如果什么都不做，就会加载默认的视图控制器并呈现给用户，在我们的例子里就是那个包含了电影列表的 tableview。但是我们想要兼顾用户体验的话，这并不是一种好的设计；更好的方案是我们的应用应该在 Spotlight 中展示选中电影的详细信息，而这正是我们最终要实现的。总而言之，我们不仅要在 Spotlight 中可以搜索电影数据，还要把相关搜索结果所对应的电影详情展现出来。通过下面示例的学习，你基本就懂了。

![](http://www.appcoda.com/wp-content/uploads/2015/12/t46_2_final_sample-compressor.gif)

为了立即可以开始工作，你可以先[下载初始工程](https://www.dropbox.com/s/2oge5z8q7u4r11m/SpotItStarter.zip?dl=0)。在这个工程里，主要包含以下几部分：

* UI 部分以及所有必要的 IBOutlet 属性已经设置完成。
* 实现了基本的 tableView 
* 所有的电影数据、以及每部电影的封面（一共5张）都存放在 a.plist 文件里。

假如你对 plist 文件里面每部电影包含的信息类型感兴趣，下面的截图能清晰地说明一切：

![](http://www.appcoda.com/wp-content/uploads/2015/12/t46_3_movie_plist_sample.png)

在深入了解 Core Spotlight API 的细节之前，我们会执行两个明确的任务：

1. 加载电影数据并展示在 tableView 里。
2. 在详情视图控制器里展示被选中电影的数据。

尽管在初始项目里实现以上任务能让你更快地开始本文主题的学习，但我并没有这么做，原因很简单：我坚信，通过对 demo 应用的极其数据内容的探索会让你更直观地明白特定数据是如何在 Spotlight 里被搜索的。不过不用担心，准备工作都不多且都能快速完成。

## 加载和展示示例数据

好的，让我们开始吧！假设现在你已经下载了初始工程并查看了包含电影数据的 plist 文件。在 *MoviesData.plist* 文件里，你会看到总共五项在 IMDB 网站里随机选取的示例电影数据。我们的第一个目标是把 .plist 文件里的数据加载到一个数组里，然后展示在 tableView 里。

直接进入代码部分，打开最主要的 *ViewController.swift* 文件，并在类的顶部声明一个属性：

```swift
var moviesInfo: NSMutableArray!
```

所有的电影都会加载到这个数组里，每一部电影都会以键值对字典的形式与 .plist 文件相对应。

我们先来写一个简单的自定义方法来加载数据。正如下面所展示的，首先确保了 .plist 文件的存在，然后就可以用该文件的内容来初始化数组。

```swift
func loadMoviesInfo() {
    if let path = NSBundle.mainBundle().pathForResource("MoviesData", ofType: "plist") {
        moviesInfo = NSMutableArray(contentsOfFile: path)
    }
}
```

接着，我们要在 *viewDidLoad()* 里调用这个方法。要确保在 *configureTableView()* 方法之前调用它，即要按照以下代码片段的展示：

```swift
override func viewDidLoad() {
    super.viewDidLoad()
 
    // 从文件里加载电影数据。
    loadMoviesInfo()
 
    configureTableView()
    navigationItem.title = "Movies"
}
```

我们本可以直接在 *viewDidLoad()* 方法里面加载文件内容，而无需创建自定义方法。但是我喜欢整齐的代码，即使对于这么简单的一个小功能，创建一个自定义方法还是好很多。

我们既然知道了应用会在每次启动时加载电影数据，就可以继续修改当前 tableView 的实现让它展示我们的电影。这里并没有太多需要做的：我们会根据电影数量定义 tableView 行数，然后把适合的数据展示在 Cell 里。

先从行数开始，很明显行数需要与电影数目相等。然而，我们首先要确保有电影可以展示，不然当数组没有加载到文件内容时应用会崩溃。

```swift
func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    if moviesInfo != nil {
        return moviesInfo.count
    }
    return 0
}
```

最后，让我们显示电影数据。出于演示的目的，在起始项目里你能找到一个 *UITableViewCell* 的子类 *MovieSummaryCell*，还有与其对应的 *.xib* 文件代表了单个电影 Cell：
![](http://www.appcoda.com/wp-content/uploads/2015/12/t46_4_custom_cell_ib.png)

这样的 Cell 展示了每部电影的图片、标题、简介、以及评分。所有的 UI 控制器都有相对应的 IBOutlet 属性，你可以在 *MovieSummaryCell.swift* 文件里找到它们：

```swift
@IBOutlet weak var imgMovieImage: UIImageView!
 
@IBOutlet weak var lblTitle: UILabel!
 
@IBOutlet weak var lblDescription: UILabel!
 
@IBOutlet weak var lblRating: UILabel!
```

以上的命名方式表明了每个属性的功能，搞清楚后，我们利用它们来展示电影的详情。回到 *ViewController.swift* 文件，按照下面的代码片段更新 tableView 方法：

```swift
func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
    let cell = tableView.dequeueReusableCellWithIdentifier("idCellMovieSummary", forIndexPath: indexPath) as! MovieSummaryCell
 
    let currentMovieInfo = moviesInfo[indexPath.row] as! [String: String]
 
    cell.lblTitle.text = currentMovieInfo["Title"]!
    cell.lblDescription.text = currentMovieInfo["Description"]!
    cell.lblRating.text = currentMovieInfo["Rating"]!
    cell.imgMovieImage.image = UIImage(named: currentMovieInfo["Image"]!)
 
    return cell
}
```

*currentMovieInfo* 字典并不是必须的，但它可以让代码变得更加简单。

现在能如你所愿地第一次尝试运行这个应用了。可以看到一些电影详情在 tableView 中罗列出来。到现在为止都是大家很熟悉的步骤，下面让我们直接开始第二个准备步骤：展示所选电影的详情信息。

## 展示数据详情信息

我们在 *ViewController* 类的 tableView 里选中电影的详情，将通过 *MovieDetailsViewController* 类来展示，对应的场景在 Interface Builder 里已经写好，所以现在有两个任务： 从 *ViewController* 里传递对应的电影字典到这个类里，然后把字典里的值传递到适当的 UI 控制器里，而这些 IBOutlet 属性都已经被声明并且正确地连线了。

说到字典，让我们在 *MovieDetailsViewController* 类的顶部做出以下声明：

```swift
var movieInfo: [String: String]!
```

先暂时回到 *ViewController.swift*，看看当一行电影数据被点击的时候，我们需要做些什么。这时需要了解被选中行的索引，以便从 *movieInfo* 数组中选择恰当的字典，并在 Segue（名为 *idSegueShowMovieDetails*）执行的时候传递给下一个视图控制器。从 tableView 的代理方法里获取索引很简单，但我们仍需要一个自定义属性来保存它。因此在 *ViewController* 类的顶部我们需要声明：

```swift
var selectedMovieIndex: Int!
```
然后，我们需要按照以下方法处理 tableView 的行选择：

```swift
func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
    selectedMovieIndex = indexPath.row
performSegueWithIdentifier("idSegueShowMovieDetails", sender: self)
```

在这儿，我们做两件非常简单的事情：首先，把选中的行索引保存在自定义的属性里，然后执行展示电影详情的 Segue。然而这还不够，因为还没有从 *moviesInfo* 数组里选择合适的电影字典，而且也还没把任何数据传递给 *MovieDetailsViewController* 类。那么我们需要做些什么呢？ 那就是重写 *prepareForSegue:sender:* 方法并完成上述功能。

```swift
oerride func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
    if let identifier = segue.identifier {
        if identifier == "idSegueShowMovieDetails" {
            let movieDetailsViewController = segue.destinationViewController as! MovieDetailsViewController
            movieDetailsViewController.movieInfo = moviesInfo[selectedMovieIndex] as! [String : String]
        }
    }
}
```

足够简单了吧。我们只是通过这个 Segue 的 *destinationViewController* 属性获得 *MovieDetailsViewController* 实例，然后把对应的电影字典赋值给在本部分最开始声明的*movieInfo* 属性。

现在，重新打开 *MovieDetailsViewController.swift* 文件，其中只有一个自定义方法。通过该该方法，将 *movieInfo* 字典中的值分配给相应的 UI 控制器，至此我们的工作就结束了。以下是一个简单的实现，我就不详述了：

```swift
func populateMovieInfo() {
    lblTitle.text = movieInfo["Title"]!
    lblCategory.text = movieInfo["Category"]!
    lblDescription.text = movieInfo["Description"]!
    lblDirector.text = movieInfo["Director"]!
    lblStars.text = movieInfo["Stars"]!
    lblRating.text = movieInfo["Rating"]!
    imgMovieImage.image = UIImage(named: movieInfo["Image"]!)
}
```

最后，让我们在 *viewWillAppear:* 方法里调用以上方法：

```swift
override func viewWillAppear(animated: Bool) {
    ...

    if movieInfo != nil {
        populateMovieInfo()
    }
}
```

这部分就结束了。你可以再运行一下，然后在 tableView 里选择某电影的时候查看一下电影的详情。

## 为 Spotlight 索引数据

使用 iOS 9 的 Core Spotlight 框架让任何应用的数据都能通过 Spotlight 搜索到。要做到这一点，关键在于请求 Core Spotlight API *索引*我们的数据，以便用户可以搜索到。但无论是我们的应用还是 CS API 都无法判断数据的类型。因为准备数据并把数据以特定格式提供给 API 是我们的职责。

再解释一下，我们希望能在 Spotlight 中搜索到的所有数据都必须表现为 *CSSearchableItem* 对象，然后组织成数组形式提供给 CS API 索引。单个 *CSSearchableItem* 对象包括一组属性，它可以让 iOS 完全掌握被搜索项的细节，类似于哪部分数据应该在搜索时展示（例如，电影的名字、它的图片和描述信息），还有哪些关键词会触发包含相关数据的应用在 Spotlight 里出现。单个可被搜索的项目的所有属性都会展示在一个 *CSSearchableItemAttributeSet* 对象里，它提供了许多属性让我们用于赋值。作为参考，我提供了[官方文档链接](https://developer.apple.com/library/prerelease/ios/documentation/CoreSpotlight/Reference/CSSearchableItemAttributeSet_Class/index.html)便于你查看所有可用的属性。

Spotlight 索引数据是最后一步。正常情况下涉及以下步骤（包括索引）：

1. 为每个数据片段设置属性，例如一部电影（CSSearchableItemAttributeSet 对象）。
2. 利用上一步获得的属性为每个数据片段初始化一个可搜索项目（CSSearchableItem 对象）。
3. 把所有可搜索项添加到一个数组里。
4. 利用以上数组为 Spotlight 索引数据。

我们来按步骤执行，为了实现目标，需要在 *ViewController.swift* 文件里创建一个名为 *setupSearchableContent()* 的自定义方法。在实现本部分内容后，你会发现想要搜索全部的数据并不是一件难事。但是，我们不打算一步登天，也不准备一次性把所有的实现都告诉你们；而是把代码分段，以便你们理解。别担心，这并不复杂。

在我们实现新方法之前，需要先导入两个框架：

```swift
import CoreSpotlight
import MobileCoreServices
```

让我们开始定义新方法，首先声明一个数组，待会用来收集可被搜索的项目：

```swift
func setupSearchableContent() {
    var searchableItems = [CSSearchableItem]()
 
}
```

现在我们能在循环里读取每一部电影：

```swift
func setupSearchableContent() {
    var searchableItems = [CSSearchableItem]()
 
    for i in 0...(moviesInfo.count - 1) {
        let movie = moviesInfo[i] as! [String: String]
    }
}
```

我们会为每部电影创建一个 *CSSearchableItemAttributeSet* 对象，然后设置相应的属性，这样在 Spotlight 搜索时就会展示相关的结果。在示例中，我们会指定电影标题、简介和图片这部分数据展示给用户。

```swift
func setupSearchableContent() {
    var searchableItems = [CSSearchableItem]()
 
    for i in 0...(moviesInfo.count - 1) {
        let movie = moviesInfo[i] as! [String: String]
 
        let searchableItemAttributeSet = CSSearchableItemAttributeSet(itemContentType: kUTTypeText as String)
 
        // 设置标题.
        searchableItemAttributeSet.title = movie["Title"]!
 
        // 设置电影封面.
        let imagePathParts = movie["Image"]!.componentsSeparatedByString(".")
        searchableItemAttributeSet.thumbnailURL = NSBundle.mainBundle().URLForResource(imagePathParts[0], withExtension: imagePathParts[1])
 
        // 设置简介.
        searchableItemAttributeSet.contentDescription = movie["Description"]!
    }
}
```

留意在以上代码片段里我们是如何为电影图片这个属性进行赋值的。有两种方式：一是指定图片的 URL，二是把图片作为 NSData 对象。对我们来说，最简单的方式就是为提供所有电影图片文件的 URL，众所周知这些图片就存在于应用 bundle 里。然而，这种方式需要把每个图片文件名分成实际名字和扩展名，因此我们利用 String 类的 *componentsSeparatedByString:* 方法来实现分割操作，剩下的就很简单了。

现在是时候设置一波关键词了，这样就能通过 Spotlight 搜索到 App 中的相关数据了。在指定关键词之前要考虑清楚，因为你的决定会影响 App 在 Spotlight 里的搜索结果、这对用户也很重要。在本例中，我们会把电影所属的类别及其评星数设置为关键词。

```swift
func setupSearchableContent() {
    var searchableItems = [CSSearchableItem]()
 
    for i in 0...(moviesInfo.count - 1) {
        ...
 
        var keywords = [String]()
        let movieCategories = movie["Category"]!.componentsSeparatedByString(", ")
        for movieCategory in movieCategories {
            keywords.append(movieCategory)
        }
 
        let stars = movie["Stars"]!.componentsSeparatedByString(", ")
        for star in stars {
            keywords.append(star)
        }
 
        searchableItemAttributeSet.keywords = keywords
    }
}
```

要知道电影的分类在 *MoviesData.plist* 文件中用一段字符串表示，每部电影之间用逗号分隔。因此很有必要把这段字符串所代表的电影类比分隔出来，然后存在 *movieCategories* 数组里方便访问。接着使用内循环把每个值添加到 *keywords* 数组。对于评星数，我们也执行完全相同的步骤，再次把一个包含所有电影评星数的字符串分隔为许多独立的部分，最后添加到关键词数组。

需要注意的是最后一行；我们为每部电影的属性集合设置了关键词。如果漏了这一行，那么 Spotlight 就不会展示任何关于这个应用的搜索结果。
现在我们已经为 Spotlight 设置了属性和关键词，是时候初始化一个可搜索项目并添加到 *searchableItems* 数组了：

```swift
func setupSearchableContent() {
    var searchableItems = [CSSearchableItem]()
 
    for i in 0...(moviesInfo.count - 1) {
        ...
 
        let searchableItem = CSSearchableItem(uniqueIdentifier: "com.appcoda.SpotIt.\(i)", domainIdentifier: "movies", attributeSet: searchableItemAttributeSet)
 
        searchableItems.append(searchableItem)
    }
}
```

以上的初始化方法接收三个参数：

* *uniqueIdentifier*: 这个参数唯一地标识了当前在 Spotlight 的可搜索项目。你可以用你喜欢的方式编写这个标识符，但是要注意一个细节：在这个示例里我们添加了当前电影的索引作为标识符，因为稍后会展示与索引值相匹配的电影详情。总体来说，在标识符中包含一个指向某些数据的索引是个好主意，这些数据将会用于详情展示。你稍后会更好地了解电影索引的作用。
* *domainIdentifier*: 使用这个参数把可搜索项目组成集合。
* *attributeSet* 这是我们刚刚用于赋值的属性集合对象。

最后，新的可搜索项目被加到 *searchableItems* 数组里。

我们最后需要执行的步骤是使用 Core Spotlight API 索引这些项目。通过 *for* 循环来实现：

```swift
func setupSearchableContent() {
    ...
    
    CSSearchableIndex.defaultSearchableIndex().indexSearchableItems(searchableItems) { (error) -> Void in
        if error != nil {
            print(error?.localizedDescription)
        }
    }
}
```

上面的方法已经功能齐全了，就等调用了。我们会在 *viewDidLoad()* 方法里调用它：

```swift
override func viewDidLoad() {
    ...

    setupSearchableContent()
}
```
 
我们现在已经准备好首次使用 Spotlight 搜索电影了。运行应用，退出，然后在 Spotlight 使用之前定义好的任意关键词。你会看见搜索结果展现在眼前。点击任意搜索结果，会自动启动相关应用。

![](http://www.appcoda.com/wp-content/uploads/2015/12/t46_5_first_search-compressor.gif)

## 实现定点着陆

虽然通过 Spotlight 可以搜索到我们应用中的电影数据这一点令人印象深刻，但还是能更上一层楼。目前，点击搜索结果，会跳转到应用首页 *ViewController* 界面。但是我们的目标是让它直接跳转到电影详情的视图控制器，并展示所选择电影的相关信息。

虽然听起来比较复杂，但其实相当容易。针对我们这个示例应用则更简单了。因为我们已经完成了绝大部分的基础工作，可以很容易地实现展示选中电影的详情页面。

这里的主要工作是重写一个 UIKit 方法 *restoreUserActivityState:*，来处理在 Spotlight 被选中的搜索结果。当我们最终想要实现的是，从可搜索的项目标识符中取出该电影在 *moviesInfo* 数组里的索引值（如果你记得的话，我们在之前的部分动态地创建了这个标识符）。

该方法接受一个 *NSUserActivity* 对象作为参数。这个对象有一个名为 *userInfo* 的字典属性，其中包括了在 Spotlight 中被选中的可搜索项目的标识符。我们通过标识符在 *moviesInfo* 数组里获取该电影的索引值，然后展示详情视图控制器。就这些。

来看看具体实现：

```swift
override func restoreUserActivityState(activity: NSUserActivity) {
    if activity.activityType == CSSearchableItemActionType {
        if let userInfo = activity.userInfo {
            let selectedMovie = userInfo[CSSearchableItemActivityIdentifier] as! String
            selectedMovieIndex = Int(selectedMovie.componentsSeparatedByString(".").last!)
            performSegueWithIdentifier("idSegueShowMovieDetails", sender: self)
        }
    }
}
```

如你所见，首先检查 *activity type* 和 *CSSearchableItemActionType* 是必要的。坦白地讲，这么做并不重要，但假设应用需要处理多个 *NSUserActivity* 对象，那么你就别忘了做这件事（例如，在 iOS 8 首次出现的 *Handoff* 特性利用了 *NSUserActivity* 类）。这个标识符是一个储存在 *userInfo* 字典里的字符串值。得到这个字符串之后，我们会把它根据点符号（dot symbol）分成不同部分，然后获取最后一部分，这是被选中的电影在电影集合里的索引。剩下的就很简单了：给 *selectedMovieIndex* 属性赋值然后执行 Segue。剩下的任务就交给我们之前的实现了。

现在打开 *AppDelegate.swift* 文件。我们需要添加一个新的代理方法。每一次与应用相关的搜索结果在 Spotlight 里被选中的时候，这个方法都会被调用，我们只需调用上面实现的方法，传递 user activity 对象即可。来看看具体实现：

```swift
func application(application: UIApplication, continueUserActivity userActivity: NSUserActivity, restorationHandler: ([AnyObject]?) -> Void) -> Bool {
    let viewController = (window?.rootViewController as! UINavigationController).viewControllers[0] as! ViewController
    viewController.restoreUserActivityState(userActivity)
 
    return true
}
```

在以上代码片段里，在恢复用户活动状态前，我们首先通过 *window* 属性获取到 *ViewController* 视图控制器。你还可以利用 *NSNotificationCenter* 和发送自定义通知来实现，这样你需要在 *ViewController* 类里处理通知。显然第一种方案更为直观。

这就是全部内容了！我们的示例应用已经完成，那么再运行一次看看在 Spotlight 里搜索电影时会发生什么吧。
![](http://www.appcoda.com/wp-content/uploads/2015/12/t46_2_final_sample-compressor.gif)

## 总结

iOS 9 最新的搜索 API 对于开发者而言前景广阔，因为这些 API 能大幅提高应用的曝光度、也更容易被用户访问。在本教程里，我们涉及了索引应用数据的所有步骤，最终在 Spotlight 搜索时能发现这些数据。也说明了应用该如何处理选中的搜索结果，并展现特定的数据给用户。在实现这些特性一定能大幅提升用户体验，因此你应该认真地考虑在现有的和将来的项目中添加这些特性。我们又到了说再见的时候，希望这篇文章对你有帮助！祝开心!

作为参考，你可以[下载完整项目](https://github.com/appcoda/CoreSpotlightDemo)