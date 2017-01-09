在 iOS 的 SQLite 数据库中应用 FMDB 库"

> 作者：Gabriel Theodoropoulos，[原文链接](http://www.appcoda.com/fmdb-sqlite-database/)，原文日期：2016-10-16
> 译者：[Cwift](http://weibo.com/277195544)；校对：[walkingway](http://chengway.in/)；定稿：[CMB](https://github.com/chenmingbiao)
  









在一款应用中，操作数据库和处理数据通常都是一个重要而且关键的部分。几个月前我所写的一篇文章曾经谈到过这个话题，那篇文章讲解了如何使用 [SwiftyDB](https://www.appcoda.com/swiftydb/) 来管理 SQLite 数据库。我今天再来探讨数据库的话题，不过这次我要介绍另一个你可能已经知道的库：[FMDB](https://github.com/ccgus/fmdb)。



这两个库的目标是相同的：处理 SQLite 数据库，并有效地管理你的应用中的数据。然而，二者在使用方式上存在差异。SwifytDB 提供了一个高级的编程 API，隐藏了所有的 SQL 细节以及幕后的其他高级操作，而 FMDB 通过更低级的 API 为用户提供了细粒度的数据处理方式。它同样“隐藏”了程序在幕后与 SQLite 数据库连接和通信的细节，毕竟这些东西很无聊；大多数程序员想要的是编写自定义的查询以及对数据执行操作。但是一般来说，评价一个东西优于另一个东西是分情况的，并且总是取决于应用的类型和目的。所以，它们都是伟大的工具，并且可以完美满足我们的需要。

现在把注意力全部集中到 FMDB 上来，它实际上是一个 SQLite 的包装器，这意味着可以让我们在更高的抽象层访问 SQLite 特性，我们不必处理链接方面的东西以及实际的数据库读写操作。对开发人员来说，使用自己的 SQL 知识并编写自己的 SQL 查询，而不必编写自己的 SQLite 管理器，这是最好的选择。它有 Objective-C 和 Swift 版本，并且由于将它集成到项目中非常快，并不会影响开发进度。

接下来，我们将实现一个小型的示例应用，通过其中的一些简单示例展示 FMDB 库的用法。我们将通过编程方式创建一个新的数据库，这会接触到所有的常规数据操作：插入、更新、删除和选择。更多的有关信息，我鼓励你查看原始的 [Github](https://github.com/ccgus/fmdb) 页面。当然，因为我将要讨论的是一个数据库相关的主题，假设你有一定的 SQL 语言基础，不然需要先去熟悉它，然后再继续。

无论如何，如果你是一个和我一样的数据库爱好者，那只需跟上我的脚步，下面将看到一些有趣的东西！

## 示例应用预览

在这个教程中，我们的示例应用将显示一个电影列表，电影的详细信息可以在一个新的视图控制器中展示（是的，我知道，之前使用过电影作样本数据，但是 [IMDB](http://www.imdb.com) 的数据资源的质量实在是太高了）。除了详细信息，我们还可以将电影标记为 *已观看*，并标注 *喜欢* 的程度（范围从 0 到 3）。

![](http://www.appcoda.com/wp-content/uploads/2016/10/fmdb-demo-app-1240x714.png)

电影的数据将存储在 SQLite 数据库中，当然了我们会使用 FMDB 库管理它们。电影的初始数据将通过已经准备好的制表符分隔文件（.tsv）插入到数据库中。 我们关注的是重点数据库，因此我已经准备好了一个[初始工程](https://raw.githubusercontent.com/appcoda/FMDBDemo/master/Starter_Project.zip)，在继续之前你可以前去获取。在这个初始项目中，你会发现项目中已经做好了默认的应用程序实现，以及原始的 .tsv 文件，我们将使用它来获取电影的初始数据。

有关示例应用的更多细节，我首先要说的是，它是一个基于导航的应用程序，有两个视图控制器：第一个名为 *MoviesViewController*，包含一个 tableview，我们将在其中展示每个电影的标题和一张海报图片（共有二十部电影）。为了演示记录，电影图像不做本地存储; 在运行时，当需要显示列表时，异步获取这些图片。我们稍后会看到。点击一个电影的 Cell，会展示名为 *MovieDetailsViewController* 的第二个视图控制器。每部电影需要展示的详细信息如下：

* 图片
* 标题——它会被设计为一个按钮，点击后会在 Safari 中打开 IMDB 中该电影的网页
* 分类
* 年代

除此之外，我们还有一个开关，用于指示是否观看过了某部电影，以及一个步进器，用以增加或减少对某部电影的喜欢数。更新后的电影详情将显式存储到数据库中。

另外，在 *MoviesViewController.swift* 文件中，你还将找到一个名为 **MovieInfo** 的结构体。它的属性与我们将在数据库中维护的表的字段相匹配，程序中 *MovieInfo* 类型的对象将用来表示电影。我不会在这里讨论数据库和我们的工作，因为很快就会接触到所有细节。再次提醒，我们会见到所有可完成的操作：数据库的创建（以编程的方式），数据插入、更新、删除和选择。我们将保持形式上的简单，但是我们所展示的所有情况都可以在更大的规模上应用。

因此，一旦你下载了初始项目并且已经开始独自摸索了，那么请继续阅读。我们首先将 FMDB 库加到初始工程中，稍后我们将看到每个数据库操作是如何实现和工作的。此外，我们将看到一些可以使你的开发者生活变轻松的最佳实践。

## 在你的 Swift 工程中集成 FMDB

在项目中集成 FMDB 库最常用的方法是用 CocoaPods 进行安装，具体的步骤请参考[这里](https://github.com/ccgus/fmdb)。然而，尤其是对 Swift 项目来说，下载库的 zip 文件，然后把特定的文件添加到项目中的方式更加快捷。你会被要求添加一个桥接头文件，因为 FMDB 库是用 Objective-C 编写的，桥接文件是两种语言一起工作所必需的。

让我们来看一些细节。首先在浏览器中打开我上面给你提供的链接。在靠近右上角的地方有一个标题为 “**Clone or download**” 的绿色按钮。点击它，你会看到另一个写着 “**Download ZIP**” 的按钮。点击它，库的 zip 文件就会被下载到你的电脑中。

![](http://www.appcoda.com/wp-content/uploads/2016/10/t56_3_download_button.png)

当你打开了 zip 文件并将其解压后，在 Find 中打开 fmdb-master / src / fmdb 目录。找到的文件就是你需要添加到初始工程中的文件。这里体现了一个分组的思想，首先在项目导航目录中为这些文件创建一个新的分组，这样你就可以把它们与项目的其它文件分开。选择它们（目录中还有一个.plist文件，但真的不需要它），然后拖拽到 Xcode 的项目导航目录中。

![](http://www.appcoda.com/wp-content/uploads/2016/10/t56_4_drag_drop_files.png)

当把文件添加到工程中之后，Xcode 会询问是否创建一个桥接头文件。

![](http://www.appcoda.com/wp-content/uploads/2016/10/t56_6_create_bridging_header.png)

如果不想手动创建头文件就选择接受。 一个新的文件将被添加到项目，名为 FMDBTut-Bridging-Header.h。 打开它并写下面这行：

    #import "FMDB.h"

现在，在整个 Swift 项目中都可以使用 FMDB 中的类了，让我们准备开始吧。

## 创建一个数据库

使用数据库几乎总是涉及相同的通用操作：建立数据库的连接，加载或修改存储的数据，最后关闭连接。在项目中的任何类中都可以做到，如我们所了解的，在需要的地方，FMDB 中的类总是可用的。但是在我看来，这不是一个好策略，如果数据库相关的代码遍布整个项目，可能会对未来的更新或调试带来麻烦。 我一直都喜欢的方法是创建一个类，并执行以下操作：

1. 通过 FMDB 的 API 处理程序与数据库的通信——这样不必编写多个代码来检查实际的数据库文件是否真的存在，或者数据库是否开启了。
2. 实现数据库的相关方法——将根据自身的需要创建特定的自定义方法来操作数据，其他类如果想要操作数据就需要调用这些方法。

正如你所理解的，我们将创建一种基于 FMDB 的更高级别的数据库 API，但是它完全是按照我们的应用的目的设计的。为了提高这个类运作的灵活性，我们把它设计成一个*单例*，当需要使用它时，将能够直接使用，而不用创建它的新实例（新对象）。关于单例，可以查阅[这个链接](https://en.wikipedia.org/wiki/Singleton_pattern)，如果有需要的话你也可以在网上快速研究一下。

现在让我们把理论付诸实践，回到初始项目中。首先为数据库管理器（database manager）创建一个新类（在 Xcode 中，打开 **File** 目录 > **New** > **File...** > **Cocoa Touch Class**）。当 Xcode 要求你提供一个名称时，请设置为 DBManager，并确保你将其设置为 NSObject 的子类。创建完新文件之后请继续阅读。

现在打开 DBManager 类，增加下面这行代码构造一个单例：

    
    static let shared: DBManager = DBManager()

我强烈建议你去阅读 Swift 中单例的相关资料，并了解上面的代码如何满足我们的需求。从现在开始，任何情况下，我们只需要写诸如 `DBManager.shared.Do_Something()` 这样的代码，单例就会起作用了。不需要初始化类的新实例（但是如果你有强烈的愿望，你仍然可以这样做）。

除了上述的步骤，我们还需要为应用声明三个更重要的属性：

1. 数据库文件名——不是必须将其作为属性，但从可复用的角度考量建议将其作为属性。
2. 数据库文件的路径
3. 一个将在真实数据库上执行访问和操作的 **FMDatabase** 对象（来自 FMDB 库）。

开始了：

    
    let databaseFileName = "database.sqlite"
     
    var pathToDatabase: String!
     
    var database: FMDatabase!

嘿，等一下！我们缺少了一个类中必需的 `init()` 方法：

    
    override init() {
        super.init()
     
        let documentsDirectory = (NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)[0] as NSString) as String
        pathToDatabase = documentsDirectory.appending("/\(databaseFileName)")
    }

显然，`init()` 方法不为空；构造器最适合承担这样的工作：指定应用程序的文档目录的路径，并组成数据库文件的路径。

让我们在一个新的自定义方法中创建数据库，将调用 `createDatabase()` 这个方法（还有什么？）。该方法将返回一个 Bool 值，指示数据库是否已成功创建。虽然现在来看作用不是很明显，后面你会更好地理解返回值的目的，我提前透露一下，我们会将一些初始数据插入数据库，但只有确认数据库已经真正创建了才会执行这个操作。数据库创建和初始数据插入是两个动作，在应用程序第一次启动的时候这两个动作各自执行一次。

现在来看看如何创建实际的数据库文件：

    
    func createDatabase() -> Bool {
        var created = false
     
        if !FileManager.default.fileExists(atPath: pathToDatabase) {
            database = FMDatabase(path: pathToDatabase!)
     
        }
     
        return created
    }

这里有两个地方值得注意：

1. 无论下一步是什么，只有数据库不存在的时候才会创建它。这很重要，因为我们不想重复创建数据库文件并销毁原始数据库。
2. 这行代码 ：`database = FMDatabase(path: pathToDatabase!)` 正在创建由构造器的参数指定的数据库文件，并且只在文件没有找到的情况下创建（实际上是我们刻意为之）。但是这个过程中没有建立连接，我们只知道这行代码执行完之后，可以使用 `database` 属性来访问我们的数据库。

不要介意 `created` 标志位，我们会在正确的时机设置它的值。回到我们的新方法中，确保数据库已创建后我们继续，打开它：

    
    func createDatabase() -> Bool {
        var created = false
     
        if !FileManager.default.fileExists(atPath: pathToDatabase) {
            database = FMDatabase(path: pathToDatabase!)
     
            if database != nil {
                // 打开数据库
                if database.open() {
     
                }
                else {
                    print("Could not open the database.")
                }
            }
        }
     
        return created
    }

`database.open()` 是上面的关键代码行，因为只有在打开数据库后才能对数据库数据进行操作。后面，我们将以类似的方式关闭数据库（与数据库的真实连接）。

在数据库中创建一张*表*。为简单起见先不创建其他表。该表（我们命名为电影）的属性与 *MovieInfo* 结构体的属性相同，你只需在 Xcode 中打开 *MoviesViewController.swift* 文件就能看到该结构体。为了方便起见，我接下来只给出查询（query）语句（你还可以在其中查看字段及其数据类型）：

    
    let createMoviesTableQuery = "create table movies (movieID integer primary key autoincrement not null, title text not null, category text not null, year integer not null, movieURL text, coverURL text not null, watched bool not null default 0, likes integer not null)"
下面这行代码将执行上面的查询操作，它将在数据库上创建新表：

    
    database.executeUpdate(createMoviesTableQuery, values: nil)

`executeUpdate(...) `方法用于可以修改数据库的所有查询（换句话说，非选择(Select)查询）。方法的第二个参数接受一组值，封装我们可能想要与查询一起传递的信息，但现在不需要使用它。 稍后会看到。上面的代码会触发 Xcode 的错误提醒，因为如果发生错误该方法可能会抛出（throw）异常。所以需要调整最后一行代码：

    
    do {
        try database.executeUpdate(createMoviesTableQuery, values: nil)
        created = true
    }
    catch {
        print("Could not create table.")
        print(error.localizedDescription)
    }

可以看到，在 `do` 语句的方法体中，只有在表成功创建之后，`created` 标志位才变为 `true`。接下来我会给你一个 `createDatabase()` 方法。注意不管前面出了什么问题，我们都会在 catch 语句的后面关闭数据库：

    
    func createDatabase() -> Bool {
        var created = false
     
        if !FileManager.default.fileExists(atPath: pathToDatabase) {
            database = FMDatabase(path: pathToDatabase!)
     
            if database != nil {
                // Open the database.
                if database.open() {
                    let createMoviesTableQuery = "create table movies (movieID integer primary key autoincrement not null, title text not null, category text not null, year integer not null, movieURL text, coverURL text not null, watched bool not null default 0, likes integer not null)"
     
                    do {
                        try database.executeUpdate(createMoviesTableQuery, values: nil)
                        created = true
                    }
                    catch {
                        print("Could not create table.")
                        print(error.localizedDescription)
                    }
     
                    // 最后关闭数据库
                    database.close()
                }
                else {
                    print("Could not open the database.")
                }
            }
        }
     
        return created
    }

## 一些最佳实践

在继续之前，我想介绍几个最佳实践，它们将使我们的生活更轻松，并让我们远离将来可能出现的潜在麻烦。因为示例工程是一个小型的工程，对数据库的操作会非常有限，所以我在这里展示的操作对示例工程来说可能不是必要的。但是，如果你正在处理大项目，那么接下来的内容真的值得你坚持下去，因为它会帮你节省足够多的时间，它会阻止你重复写相同的代码，还能防止你犯排版的错误。

所以，让我们开始做一些让生活更轻松的事情，这将节省我们开发大型项目花费的时间。每当想要建立数据库的连接以便检索数据或执行任意种类的更新操作（插入，更新，删除）时，我们必须遵循特定的步骤：确保数据库对象已经初始化，如果没有就去初始化它，然后使用 `open()` 方法打开数据库，如果一切都正常再开始进行真正的工作。每当需要对数据库做一些操作时，都必须重复这些步骤，现在想想无论何时只要打开数据库都得做这些检查以及执行可选的操作，这是多么的无聊、抗生产和耗时啊。想变得聪明一点，为什么不创建一个方法执行以上所有的操作，所以当我们需要它的时候只需要调用这方法（只是一行代码），而不是执行上面的所有操作？

我们在 DBManager 类中创建一个这样的方法，如下：

    
    func openDatabase() -> Bool {
        if database == nil {
            if FileManager.default.fileExists(atPath: pathToDatabase) {
                database = FMDatabase(path: pathToDatabase)
            }
        }
     
        if database != nil {
            if database.open() {
                return true
            }
        }
     
        return false
    }

该方法首先会检查数据库对象是否已经被初始化，然后会再次检查它是否仍然是 nil。然后，它尝试打开数据库。 该方法的返回值是 `Bool` 类型的。当它为真时，表示数据库已成功打开，否则表示数据库文件不存在，或者发生了其他的错误导致数据库无法打开。一般来说，如果方法返回 true，那么代表我们已经准备使用的数据库（`database` 对象）设置了一个处理程序，最重要的是，通过实现该方法，当需要打开数据库的时候不必每次都重复上面的代码。你可以随意扩展上面的实现，如果你需要的话添加更多的条件、检查或者错误消息。

在上一部分中，我们组成了一个 SQL 查询，创建 *movies* 表：

    
    let createMoviesTableQuery = "create table movies (movieID integer primary key autoincrement not null, title text not null, category text not null, year integer not null, movieURL text, coverURL text not null, watched bool not null default 0, likes integer not null)"

这个查询没问题，但接下来写的每个后续查询都有潜在的风险。危险在于字段的名称，我们必须在每个将要创建的查询中写入的名称文字。如果继续这样做，那么可能会输入一个或多个字段的名称，这会引起错误。 例如，如果我们不够仔细，很容易错误地输入 “movieId” 而不是 “movieID” 或者输入了 “movieurl” 而不是 “movieURL”。如果有多张表的多个查询的话，按照统计学理论这种错误是一定会发生的。好吧，没有什么大不了，因为迟早你会发现这个（些）问题，但为什么要浪费时间呢？有一个很好的方法来避免这种风险，那就是用常量属性分配字段名（所有的表，在我们的例子中只有一个表）。 来看看这种情形中该怎么做：

在 *DBManager* 类的头部增加下列代码：

    
    let field_MovieID = "movieID"
    let field_MovieTitle = "title"
    let field_MovieCategory = "category"
    let field_MovieYear = "year"
    let field_MovieURL = "movieURL"
    let field_MovieCoverURL = "coverURL"
    let field_MovieWatched = "watched"
    let field_MovieLikes = "likes"

我添加了“field”前缀，以便在 Xcode 中输入时很容易找到所需的字段。如果你开始输入“field”，Xcode 将自动把所有包含该术语的属性提示给你，你很容易找到感兴趣的字段名称。每个名称的第二部分实际上是关于每个字段的简短描述。你甚至可以提升它的语义，把每个属性的表名称加进去：

    
    let field_Movies_MovieID = "movieID"

这不是必需的，因为我们只有一个表，但是如果有多个表，遵循上面的命名约定会有很大的作用。
通过将字段名分配给常量的方式，我们不需要再手动输入任何字段名，因为在全局使用了常量，可以确保不会存在拼写错误。如果更新查询，新的样式如下：

    
    let createMoviesTableQuery = "create table movies (\(field_MovieID) integer primary key autoincrement not null, \(field_MovieTitle) text not null, \(field_MovieCategory) text not null, \(field_MovieYear) integer not null, \(field_MovieURL) text, \(field_MovieCoverURL) text not null, \(field_MovieWatched) bool not null default 0, \(field_MovieLikes) integer not null)"
不是一定要在你的项目中使用上述的两种做法。我只是建议和推荐它们，但是否要使用完全取决于你，如果你坚持用传统的方式写东西，或者你甚至找到另一个更好的方式提升它们，那就用你自己的方式。但是在示例工程中我会使用这种写法。既然提到了，那就开搞吧！

## 插入记录

在这部分中，我们将一些初始数据插入到数据库中，数据源是已经存在于初始项目中的 movies.tsv 文件（只需要放在项目导航目录中）。这个文件中包含二十部电影的数据，其中的电影记录由字符“\ r \ n”（不带引号）分隔。标签字符（“\ t”）分隔单个电影内部的数据，该格式将使我们的解析工作变很容易。 数据的顺序如下：

* 电影标题
* 分类 
* 年代
* 电影 URL
* 电影封面的 URL（电影图片的地址，通常是封面的地址）

对于表中存在的其余字段，这里没有数据，我们只插入一些默认值。
在 *DBManager* 类中，我们将实现一个新方法，为完成所有的工作。首先使用上一部分中实现的方法，所以只需要一行代码就可以打开数据库：

    
    func insertMovieData() {
        // 打开数据库
        if openDatabase() {
     
        }
    }

我们要遵循的逻辑如下：

1. 首先，找到“movies.tsv”文件，把它的内容加载到一个 String 类型的对象中。
2. 然后将根据 / r / n 子串的位置来截断原字符串从而分离出电影数据，会得到一个字符串数组（`[String]`）。 数组的每个位置保存单个影片数据的字符串。
3. 接下来，使用一个循环，遍历所有的电影，并逐个获取它们，我们使用类似上面的方式截断每个电影字符串，但这一次基于 tab 字符（“\ t”）。这会生成一个新的数组，数组的每个位置上保存每部电影的不同数据项。这些数据会在后面用来组成我们想要的插入查询。

从第一步开始，让我们得到“movies.tsv”文件的路径，然后将它的内容加载到一个字符串对象中：

    
    if let pathToMoviesFile = Bundle.main.path(forResource: "movies", ofType: "tsv") {
        do {
            let moviesFileContents = try String(contentsOfFile: pathToMoviesFile)
    
        }
        catch {
            print(error.localizedDescription)
        }
    }

通过一个文件的内容创建的字符串可能会抛出异常，所以必须使用 `do-catch` 语句。 现在让我们继续第二步，将字符串的内容拆分成基于“\ r \ n”字符的字符串数组：

    
    let moviesData = moviesFileContents.components(separatedBy: "\r\n")

第三步，写一个 `for` 循环，把每个电影的数据拆分成数组。注意，在循环之前，首先要初始化另一个字符串（取名为 `Query`），一会会使用它来编写插入命令。

    
    var query = ""
    for movie in moviesData {
        let movieParts = movie.components(separatedBy: "\t")
     
        if movieParts.count == 5 {
            let movieTitle = movieParts[0]
            let movieCategory = movieParts[1]
            let movieYear = movieParts[2]
            let movieURL = movieParts[3]
            let movieCoverURL = movieParts[4]
     
        }
    }

在上面的 `if` 语句的中，我们将构造插入查询。正如你将在下面的代码片段中看到的那样，每个查询以一个分号（;）结束，原因很简单：我们想立即执行多个查询，SQLite 将基于 ;  符号区分每个查询。注意另外两件事：首先，我使用之前创建的常量值表示字段名称。其次，注意查询字符串中的单引号“'”。 如果省略任意必须的 ‘ 符号，可能会引发问题。

    
    query += "insert into movies (\(field_MovieID), \(field_MovieTitle), \(field_MovieCategory), \(field_MovieYear), \(field_MovieURL), \(field_MovieCoverURL), \(field_MovieWatched), \(field_MovieLikes)) values (null, '\(movieTitle)', '\(movieCategory)', \(movieYear), '\(movieURL)', '\(movieCoverURL)', 0, 0);"

现在我们给最后的两个字段指定了一些默认值。 稍后将通过执行更新查询更改它们。到 `for` 循环结束时，`query` 字符串将包含所有要执行的插入查询（这里总共20个查询）。使用 FMDB 一次执行多个语句很容易，因为我们所要做的就是通过 `database` 对象调用 `executeStatements(_:)` 方法：

    
    if !database.executeStatements(query) {
        print("Failed to insert initial data into the database.")
        print(database.lastError(), database.lastErrorMessage())
    }

上面所示的 `lastError()` 和 `lastErrorMessage()` 只有在插入失败时才会真正起作用。这两个方法报告遇到的问题以及大多数问题的出处，以便你可以轻松地解决问题。当然，这个代码段需要写在循环之后。

有一件事情可能听起来不重要，但是不要忘记（我重复一遍，不要忘记）关闭与数据库的连接，为此我们添加一个 `database.close()` 命令以完成这段代码。下面是完整的 `insertMovieData()` 方法：

    
    func insertMovieData() {
        if openDatabase() {
            if let pathToMoviesFile = Bundle.main.path(forResource: "movies", ofType: "tsv") {
                do {
                    let moviesFileContents = try String(contentsOfFile: pathToMoviesFile)
     
                    let moviesData = moviesFileContents.components(separatedBy: "\r\n")
     
                    var query = ""
                    for movie in moviesData {
                        let movieParts = movie.components(separatedBy: "\t")
     
                        if movieParts.count == 5 {
                            let movieTitle = movieParts[0]
                            let movieCategory = movieParts[1]
                            let movieYear = movieParts[2]
                            let movieURL = movieParts[3]
                            let movieCoverURL = movieParts[4]
     
                            query += "insert into movies (\(field_MovieID), \(field_MovieTitle), \(field_MovieCategory), \(field_MovieYear), \(field_MovieURL), \(field_MovieCoverURL), \(field_MovieWatched), \(field_MovieLikes)) values (null, '\(movieTitle)', '\(movieCategory)', \(movieYear), '\(movieURL)', '\(movieCoverURL)', 0, 0);"
                        }
                    }
     
                    if !database.executeStatements(query) {
                        print("Failed to insert initial data into the database.")
                        print(database.lastError(), database.lastErrorMessage())
                    }
                }
                catch {
                    print(error.localizedDescription)
                }
            }
     
            database.close()
        }
    }

即使我对“movies.tsv”文件中数据的处理方式予以足够的重视，并以一种可以在代码中轻松使用的方式对其进行转换，但是我们主题的其他方面才是重点：如何创建多个查询（记住使用 ; 符号分隔它们），以及如何批量执行它们。那才是 FMDB 的功能，也是这部分的主题。

在结束本节的工作之前，还有最后一件事; 必须调用我们的新方法创建数据库并将初始数据插入数据库。打开 *AppDelegate.swift* 文件，找到 `applicationDidBecomeActive(_:)` 委托（delegate）方法。增加下面两行代码：

    
    func applicationDidBecomeActive(_ application: UIApplication) {
        if DBManager.shared.createDatabase() {
            DBManager.shared.insertMovieData()
        }
    }

## 加载数据

在 *MoviesViewController* 类中，有一个已经完成了基本实现的 tableview，它在“等待”我们完成全部的实现，所以可以在它上面展示从数据库加载的电影信息。这个 tableview 的数据源是一个名为 `movies` 的数组，它是 *MovieInfo* 对象的集合。你可以在 *MoviesViewController.swift* 文件中找到结构体 *MovieInfo* 的定义，其包含了数据库中 *movies* 表的程序化表示，每个对象描述一部电影。了解了这些之后，我们在这个章节的目的是从数据库加载现有的电影，并指定 *MovieInfo* 对象中的细节，然后使用这些对象来填充 tableview 中的数据。

再次回到 *DBManager* 类中，这次最重要的目标是了解如何在 FMDB 中执行 *SELECT* 查询，我们将自定义一个新的方法，在方法体中加载电影数据：

    
    func loadMovies() -> [MovieInfo]! {
     
    }

返回值是一个 *MovieInfo* 对象的集合，我们需要在 *MoviesViewController* 中使用这个集合。下面来实现该方法，声明一个本地数组来存储从数据库加载的结果，并打开数据库：

    
    func loadMovies() -> [MovieInfo]! {
        var movies: [MovieInfo]!
     
        if openDatabase() {
     
        }
     
        return movies
    }
下一步是创建 SQL 查询，告诉数据库要加载哪些数据：

    
    let query = "select * from movies order by \(field_MovieYear) asc"

查询的执行如下：

    
    do {
        let results = try database.executeQuery(query, values: nil)
    }
    catch {
        print(error.localizedDescription)
    }

*FMDatabase* 对象的 `executeQuery(...)` 方法有两个参数：查询字符串，以及需要与查询一起传递的值的数组。如果没有值，传入 nil 就行了。这个方法返回一个 *FMResultSet*  对象（FMDB 中的类），包含了检索到的数据，我们将在稍后看到访问返回数据的方法。

使用上面的查询，要求 FMDB 基于发布年份按照升序的方式获取所有的电影。这里只演示了一个简单的查询，你可以根据需要创建更高级的查询。看看另一个稍微复杂些的查询，加载特定类别的电影，依旧按照年份排列，但是这次按照降序排列：

    
    let query = "select * from movies where \(field_MovieCategory)=? order by \(field_MovieYear) desc"

相信你已经看到了，查询本身并未指定 where 子句的类别名称。相反，我们在查询中设置一个占位符，采用如下所示的方式提供实际值（我们要求 FMDB 仅加载属于“犯罪”类别的电影）：

    
    let results = try database.executeQuery(query, values: ["Crime"])

另一个示例，加载发布年份大于指定年份的特定类别的所有电影数据，按照 ID 值按降序排序：

    
    let query = "select * from movies where \(field_MovieCategory)=? and \(field_MovieYear)>? order by \(field_MovieID) desc"

上面的查询语句期望获得两个参数：

    
    let results = try database.executeQuery(query, values: ["Crime", 1990])

如上所示，创建或执行查询一点都不难，你仍然可以随意创建自己的查询并且在其上做更多的实验。
让我们继续，合理利用返回的数据。 在下面的代码段中，使用一个 `while` 循环来遍历所有返回的记录。用每一次循环得到的值初始化一个新的 *MovieInfo* 对象，把对象加到 `movies` 数组中，并最终创建显示到 tableview 的数据集合。

    
    while results.next() {
        let movie = MovieInfo(movieID: Int(results.int(forColumn: field_MovieID)),
                              title: results.string(forColumn: field_MovieTitle),
                              category: results.string(forColumn: field_MovieCategory),
                              year: Int(results.int(forColumn: field_MovieYear)),
                              movieURL: results.string(forColumn: field_MovieURL),
                              coverURL: results.string(forColumn: field_MovieCoverURL),
                              watched: results.bool(forColumn: field_MovieWatched),
                              likes: Int(results.int(forColumn: field_MovieLikes))
        )
     
        if movies == nil {
            movies = [MovieInfo]()
        }
     
        movies.append(movie)
    }

在上述代码中有一个重要的并且强制性的要求，不管你期望获取多个还是单个数据它总是适用的：每次必须调用 `results.next()` 方法。当有多个记录时与 `while` 语句一起使用; 对于单条记录结果，可以使用 `if` 语句：

    
    if results.next() {
     
    }

你应该记住的另一个细节是：每个 `movie` 对象使用 *MovieInfo* 结构体的默认构造器进行初始化。这是行得通的，因为我们要求查询中检索的每个记录都返回所有字段（`select * from movies ...`）。然而，如果你决定要获得所有字段的一个子集（例如，`select (field_MovieTitle), (field_MovieCoverURL) from movies where ...`），上述初始化程序将无法工作，应用程序会崩溃。这是因为任何 `results.XXX(forColumn:)` 方法试图获取未加载字段的数据时找到的是 nil 而不是真实的值。所以，当你处理结果时，观察并且牢记从数据库中加载的字段，这会使你摆脱困扰。

现在让我们看看在这部分中创建的方法：

    
    func loadMovies() -> [MovieInfo]! {
        var movies: [MovieInfo]!
     
        if openDatabase() {
            let query = "select * from movies order by \(field_MovieYear) asc"
     
            do {
                print(database)
                let results = try database.executeQuery(query, values: nil)
     
                while results.next() {
                    let movie = MovieInfo(movieID: Int(results.int(forColumn: field_MovieID)),
                                          title: results.string(forColumn: field_MovieTitle),
                                          category: results.string(forColumn: field_MovieCategory),
                                          year: Int(results.int(forColumn: field_MovieYear)),
                                          movieURL: results.string(forColumn: field_MovieURL),
                                          coverURL: results.string(forColumn: field_MovieCoverURL),
                                          watched: results.bool(forColumn: field_MovieWatched),
                                          likes: Int(results.int(forColumn: field_MovieLikes))
                    )
     
                    if movies == nil {
                        movies = [MovieInfo]()
                    }
     
                    movies.append(movie)
                }
            }
            catch {
                print(error.localizedDescription)
            }
     
            database.close()
        }
     
        return movies
    }

我们使用它来填充 tableview 上的电影数据。打开 *MoviesViewController.swift* 文件，实现 `viewWillAppear(_:)` 方法。在其中添加以下两行代码，使用上述方法加载电影数据，并触发 tableview 上的重新加载：

    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
     
        movies = DBManager.shared.loadMovies()
        tblMovies.reloadData()
    }

但是，我们必须在 `tableView(_:, cellForRowAt indexPath:)` 方法中指定每个单元格（Cell）的内容。由于这不是本主题的重要部分，所以我直接给出完整的实现：

    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "cell", for: indexPath)
     
        let currentMovie = movies[indexPath.row]
     
        cell.textLabel?.text = currentMovie.title
        cell.imageView?.contentMode = UIViewContentMode.scaleAspectFit
     
        (URLSession(configuration: URLSessionConfiguration.default)).dataTask(with: URL(string: currentMovie.coverURL)!, completionHandler: { (imageData, response, error) in
            if let data = imageData {
                DispatchQueue.main.async {
                    cell.imageView?.image = UIImage(data: data)
                    cell.layoutSubviews()
                }
            }
        }).resume()
     
        return cell
    }

每部电影的图片以异步方式下载，并在其数据可用时显示在单元格上。我希望 *URLSession* 块不会让你迷惑; 写在多行它会是这样的：

    
    let sessionConfiguration = URLSessionConfiguration.default
    let session = URLSession(configuration: URLSessionConfiguration.default)
    let task = session.dataTask(with: URL(string: currentMovie.coverURL)!) { (imageData, response, error) in
        if let data = imageData {
            DispatchQueue.main.async {
                cell.imageView?.image = UIImage(data: data)
                cell.layoutSubviews()
            }
        }
    }
    task.resume()

无论如何，现在你第一次可以运行应用程序了。 首次启动时将创建数据库，并将初始数据插入其中。接下来，数据将被加载，电影将显示在 tableview 上，就像下面的截图所示：

![](http://www.appcoda.com/wp-content/uploads/2016/10/t56_1_movies_list.png)

## 更新

当我们点击表格视图中单元格的时候，需要应用程序来展示电影的细节，这意味着要展示 *MovieDetailsViewController*，并用所选电影的细节填充这个页面。最简单的方法是将选中的 *MovieInfo* 对象传递给 *MovieDetailsViewController*，但是我们会使用不同的方法。传递电影 ID，然后从数据库中加载电影信息。 稍后我会解释这样做的目的。

我们首先更新即将展示 *MovieDetailsViewController* 的 Segue 的准备（prepare）方法，所以仍需打开 *MoviesViewController.swift* 文件。它有一个初始实现，所以只需做如下更新（在 `if` 语句中添加两行）：

    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        if let identifier = segue.identifier {
            if identifier == "idSegueMovieDetails" {
                let movieDetailsViewController = segue.destination as! MovieDetailsViewController
                movieDetailsViewController.movieID = movies[selectedMovieIndex].movieID
            }
        }
    }

`selectedMovieIndex` 属性的值在下面所示的 tableview 的方法中获取，这个方法在初始工程中已经实现了。

    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        selectedMovieIndex = indexPath.row
        performSegue(withIdentifier: "idSegueMovieDetails", sender: nil)
    }

另外，*MovieDetailsViewController* 中有一个名为 `movieID` 的属性，所以上面的代码可以顺利运行。

现在我们将所选电影的 ID 传递给下一个视图控制器，需要编写一个新方法来加载该 ID 指定的电影数据。方法用到的数据库相关的操作，之前都已经见过了。不过会有一个区别：通常你会期望这个方法返回一个 *MovieInfo* 对象。好吧，不要这样做，我们会返回一个完成处理器（completion handler）将获取到的数据传递回 *MovieDetailsViewController* 类，而不是返回一个值，这才是我的目的：向你展示从数据库获取数据时如何使用完成处理器而不是返回值。

打开 *DBManager.swift* 文件，看看新方法的标题行：

    
    func loadMovie(withID ID: Int, completionHandler: (_ movieInfo: MovieInfo?) -> Void) {
     
    }

如你所见，这里有两个参数：第一个是我们要加载的电影的 ID。第二个参数是完成处理器，它又有一个参数，把加载到的电影作为一个 *MovieInfo* 类型的对象传入。现在先忽略方法的实现，你马上就能看到具体实现。你看到的东西之前都有讨论：

    
    func loadMovie(withID ID: Int, completionHandler: (_ movieInfo: MovieInfo?) -> Void) {
        var movieInfo: MovieInfo!
     
        if openDatabase() {
            let query = "select * from movies where \(field_MovieID)=?"
     
            do {
                let results = try database.executeQuery(query, values: [ID])
     
                if results.next() {
                    movieInfo = MovieInfo(movieID: Int(results.int(forColumn: field_MovieID)),
                                          title: results.string(forColumn: field_MovieTitle),
                                          category: results.string(forColumn: field_MovieCategory),
                                          year: Int(results.int(forColumn: field_MovieYear)),
                                          movieURL: results.string(forColumn: field_MovieURL),
                                          coverURL: results.string(forColumn: field_MovieCoverURL),
                                          watched: results.bool(forColumn: field_MovieWatched),
                                          likes: Int(results.int(forColumn: field_MovieLikes))
                    )
     
                }
                else {
                    print(database.lastError())
                }
            }
            catch {
                print(error.localizedDescription)
            }
     
            database.close()
        }
     
        completionHandler(movieInfo)
    }

在方法末尾，我们调用了完成处理器，传入了 `movieInfo` 对象，无论该对象已经初始化成功还是因为某种错误而返回了 nil。

现在打开 *MovieDetailsViewController.swift* 文件，直接在 `viewWillAppear(_:)` 方法中调用上面的方法：

    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
     
        if let id = movieID {
            DBManager.shared.loadMovie(withID: id, completionHandler: { (movie) in
                DispatchQueue.main.async {
                    if movie != nil {
                        self.movieInfo = movie
                        self.setValuesToViews()
                    }
                }
            })
        }
    }

这里要提到两件事：首先，完成处理器中的 `movie` 对象被分配给（已声明的）`movieInfo` 属性，因此可以在整个类中使用获取到的值。第二，使用主线程（`DispatchQueue.main`），因为 `setValuesToViews()` 方法将更新 UI，更新 UI 应该总是在主线程上进行。如果上面的结果是成功的，并且正确地获取电影信息，则电影的详情将被填充到适当的视图中。现在你可以尝试这个功能，运行应用程序并选择一部电影：

![](http://www.appcoda.com/wp-content/uploads/2016/10/t56_2_movie_details.png)

但是这还不够。我们希望能够更新数据库以及特定电影的数据，并跟踪观看状态（是否观看了该电影），并根据我们的喜欢程度给电影评分。这很容易实现，因为只需要在 *DBManager* 类中编写一个新方法执行更新。回到 *DBManager.swift* 文件中，添加下面的方法：

    
    func updateMovie(withID ID: Int, watched: Bool, likes: Int) {
        if openDatabase() {
            let query = "update movies set \(field_MovieWatched)=?, \(field_MovieLikes)=? where \(field_MovieID)=?"
     
            do {
                try database.executeUpdate(query, values: [watched, likes, ID])
            }
            catch {
                print(error.localizedDescription)
            }
     
            database.close()
        }
    }

方法接受三个参数：我们要更新的电影 ID，指示电影是否已被观看的 Bool 值，以及给打电影的喜欢个数。参照前面讨论的内容很容易创建该查询。有趣的部分是 `executeUpdate(...)` 方法，在我们创建数据库的时候已经见过这个方法了。对数据库执行任何类型的更改时都必须使用这个方法，换句话说，你需要在执行 Select 之外的操作时使用它。该方法的第二个参数是一个 Any 类型的数组，它与将要执行的查询语句一起传递。

或者，我们可以返回 Bool 值以指示更新是否成功，不过在本示例中并不关心。但如果我们处理更关键的数据，这将是一个重要的补充。

现在回到 *MovieDetailsViewController.swift* 文件中，使用上面的方法。找到 `saveChanges(_:)` 方法，添加下面的内容：

    
    @IBAction func saveChanges(_ sender: AnyObject) {
        DBManager.shared.updateMovie(withID: movieInfo.movieID, watched: movieInfo.watched, likes: movieInfo.likes)
     
        _ = self.navigationController?.popViewController(animated: true)
    }

添加了上面的代码之后，每次我们点击保存按钮时应用程序都会更新电影的观看状态和喜欢数量，然后程序将返回到 *MoviesViewController* 中。

## 删除记录

到目前为止，我们已经了解了如何以编程的方式创建数据库，如何执行批处理语句，如何加载数据以及如何更新。还有一件事仍在期望中，那就是如何删除现有记录。我们会简单处理，允许通过向左侧滑动单元格来删除电影，滑动后会出现常见的红色“删除”按钮。

在实现这个功能之前，最后一次来到 *DBManager* 类中。我们的任务是实现一个新的方法，删除选择的电影的记录。你将再次看到 *FMDatabase* 类的 `executeUpdate(...)` 方法被用于执行将要创建的查询。不浪费时间了，看看新方法的实现：

    
    func deleteMovie(withID ID: Int) -> Bool {
        var deleted = false
     
        if openDatabase() {
            let query = "delete from movies where \(field_MovieID)=?"
     
            do {
                try database.executeUpdate(query, values: [ID])
                deleted = true
            }
            catch {
                print(error.localizedDescription)
            }
     
            database.close()
        }
     
        return deleted
    }

这个方法返回一个 Bool 值，以指示删除是否成功，除此之外这里没有什么值得讨论的新东西。我们需要这个 Bool 值，因为必须更新 tableview 的数据源（`movies` 数组）以及 tableview，接下来会看到。

接下来，打开 `MoviesViewController `，然后实现下列 tableview 方法：

    
    func tableView(_ tableView: UITableView, commit editingStyle: UITableViewCellEditingStyle, forRowAt indexPath: IndexPath) {
        if editingStyle == .delete {
     
        }
    }

以上代码将启用红色删除按钮，当我们从右到左滑动单元格式时，按钮会出现。通过调用 `deleteMovie(_:)` 方法完成 `if` 语句的功能，如果方法执行成功，将从 `movies` 数组中删除匹配的 *MovieInfo* 对象。最后，重新加载 tableview，使对应的电影单元格消失：

    
    func tableView(_ tableView: UITableView, commit editingStyle: UITableViewCellEditingStyle, forRowAt indexPath: IndexPath) {
        if editingStyle == .delete {
            if DBManager.shared.deleteMovie(withID: movies[indexPath.row].movieID) {
                movies.remove(at: indexPath.row)
                tblMovies.reloadData()
            }
        }
    }

现在你可以再次运行应用程序，并尝试删除一部电影。 数据库将通过删除你选择的电影进行更新，从现在开始不管你何时运行程序，这部电影都不会再出现。

![](http://www.appcoda.com/wp-content/uploads/2016/10/t56_7_delete_movie.png)

## 结论

如果你熟悉 SQL 查询，并且喜欢这篇文章中所示的数据库处理方式，那么 FMDB 是一款适合你的工具。它很容易集成到你的项目中，并且它就像你平时所处理的类和方法一样易用，最重要的是它可以使你摆脱建立数据库连接然后再去“会话”的繁琐工序。FMDB 中必须遵循的规则很少，最重要的一点是，你必须在任何操作前后打开和关闭数据库。

虽然在我们的示例中数据库中只有一个表，但是在多个表中应用所学的内容一样很容易。除此之外，我还想提一点。在项目开始时以编程方式创建数据库，但这不是唯一的方法。你可以使用 SQLite 管理器创建数据库，并以简单和图形化的方式指定表及其字段，然后将数据库文件放在应用程序包（bundle）中。但是，如果你计划通过应用程序更改数据库，则必须将该管理器复制到 documents 目录中。 这完全取决于你如何创建数据库，我只是不得不提到这个选项。

关于 FMDB 库，还有更多高级的东西，这里没有涉及。但是，谈论这些事情将会超出这个话题的初衷，可能将来会讨论这个问题。所以，现在你需要做的是尝试一下 FMDB，看看它是否适合你。我真的希望你在这里读到的内容能提供尽可能多的帮助。最后，非常感谢作者 Gus Mueller，不要忘了访问 FMDB 的 [GitHub 主页](https://github.com/ccgus/fmdb)。你会发现更多的阅读内容，也可能解决你所遇到的问题。请享用！

作为参考，您可以在 GitHub 上查看[完整的项目](https://github.com/appcoda/FMDBDemo)。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。