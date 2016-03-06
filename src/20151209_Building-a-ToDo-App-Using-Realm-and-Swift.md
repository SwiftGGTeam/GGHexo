title: 使用 Realm 和 Swift 创建 ToDo 应用
date: 2015-12-08
tags: [Swift 进阶]
categories: [AppCoda]
permalink: building-a-todo-app-using-realm-and-swift

---

原文链接=http://www.appcoda.com/realm-database-swift/
作者=Hossam Ghareeb
原文日期=2015-10-28
译者=Prayer
校对=Cee
定稿=千叶知风

<!--此处开始正文-->

智能手机的快速发展的同时，涌现出了很多对开发者友好的开发工具。这些工具不仅使得开发变得更加简单和容易，同时也保证了性能和产品质量。如今想要在 App Store 中占据一席之地，并非易事。而且想要使得应用易于扩展就更加困难了。当你成功获得百万量级的用户时，应用中的每一个细节都不能放过，并且需要在很短的时间完成对细节的打磨。所以和数据库打交道，是很多开发者都会面临的一个问题。<!--more-->相信我们每个人都会因为数据库引起的各种问题而头疼不已，对于数据库，我想如今我们只有两种选择：[SQLite](http://www.appcoda.com/sqlite-database-ios-app-tutorial/) 和 [Core Data](http://www.appcoda.com/introduction-to-core-data/)。我是 Core Data 的忠实粉丝，它对记录（records）的处理和持久化数据的能力非常强大，但是我意识到，在开发应用的过程中，我在 Core Data 上浪费了太多的时间。最近，我无意中发现了 Realm，一个可以替代 SQLite 和 Core Data 的更好的解决方案。

![](http://www.appcoda.com/wp-content/uploads/2015/10/realm-db-1024x683.jpg)

<!--more-->

## Realm 是什么？

Realm 是一个跨平台的移动终端数据库，支持 iOS（Swift 和 Objective-C 语言都支持）和 Android。Realm 的目的就是提供比 SQLite 和 Core Data 更好更快的数据库支持。它不仅仅是更好和更快，而且更加易于使用，短短几行代码就可以完成很多操作。Realm 完全免费，你可以随意使用它。Realm 是为移动设备而生的，因为在过去的十年中，移动终端的数据库技术没有任何的革新。现在如果和移动终端的数据库打交道，你只有一种选择，使用 SQLite 或者是底层封装了 SQLite 的技术比如 Core Data。Realm 的目的是更加易用，它并不是一个建立在 SQLite 之上的 ORM，而是一个基于自己的持久化引擎，简单并且快速的面向对象移动数据库。

## 为什么选择 Realm？

[Realm](https://realm.io/cn/)拥有令人难以置信的速度并且使用起来非常简单，你会发现，无论是想完成数据库的读还是写操作，都只需要短短的几行代码。下面我会列出它的所有优势，并说明为什么 Realm 是你在移动应用上数据库的不二选择：

- **安装简单**：在下一个章节 — 如何使用 Realm 中你会了解到，安装 Realm 会比你想象的更为简单。使用简单的 Cocoapods 命令，你就可以完成所有的安装工作。

- **速度更快**：使用 Realm 库操作数据库的速度非常快。它比 SQLite 和 CoreData 都更加快速，[这里](https://realm.io/news/introducing-realm/#fast)有它们之间的比较指标作为证据。

- **跨平台**：Realm 的数据库文件是跨平台的，可以在 iOS 和 Android 间共享。无论你是使用 Java、Objective-C 或者 Swift，都可以使用相同的抽象模型访问。

- **易于扩展**：如果你的移动应用需要处理大量的用户数据记录，数据库的可扩展性就显得十分重要。在开始着手开发应用之前，这一点就应该被考虑在内。Realm 提供很好的可扩展性，在操作大量的数据时，速度也非常之快。选择使用 Realm 可以为你的应用带来更快的速度和更加流畅的用户体验。

- **规范的文档和很好的支持**：Realm 提供了丰富的大量条理清晰、易于阅读的文档。如果你有任何的问题，你也可以通过 Twitter、Github 或 Stackoverflow 来获得帮助。

- **可信任**：Realm 已经被大量的初创公司和大公司用于它们的移动应用中，像 Pinterest、Dubsmash 和 Hipmunk。

- **免费**：除了以上这些极好的优点以外，它还是完！全！免！费！的！

## 让我们开始动手吧

让我们开始学习 Realm，使用它来构建一个简单的使用 Swift 语言的 iPhone 应用。所完成的 demo 程序是一个简单的 Todo 应用。用户可以增加任务清单，每个任务清单都能够包含多个任务。任务拥有名称、备注、到期日期，可以添加图片，并且拥有一个布尔值来表示该任务是否已经完成。在开始创建 Xcode 项目之前，我们需要先配置好 Xcode，安装使用 Realm 所需的工具。

## 环境要求

请注意需要满足下列要求

- iOS 8 及更高的版本，OS X 10.9 及更高的版本
- Xcode 6.3 及更高版本
- Realm 有两个发行版，一个针对 Swift 2.0，另一个针对 Swift 1.2。我们推荐您使用 Swift 2.0 的版本。当然你也可以使用针对 Swift 1.2 的版本，但是以后这个版本 Realm 不会再进行更新支持，所以为了保险起见，使用 Swift 2.0 对应的版本，是个更好的选择。

## 配置 Xcode 和所需的工具

在开始配置 Xcode 项目之前，请确保运行环境已经正确安装了 CocoaPods，我们将使用它来为项目安装 Realm。如果对 [CocoaPods](https://cocoapods.org/) 不熟悉，你可以查看在线的教程，这些教程的材料足够让你明白如何开始使用它。

现在，使用 `Single View Application` 项目模板创建一个 Xcode 工程，命名为 `RealmTasks` 或者其他你喜欢的名字。请确保选择 Swift 作为开发语言。之后在终端中进入到该工程目录，使用如下命令来初始化 CocoaPods：

```bash
pod init 
```

然后使用 Xcode 打开生成的 Podfile 文件，在 target 之后，添加 `pod 'RealmSwift'`，修改完之后，应该是下面这个样子：

![](http://www.appcoda.com/wp-content/uploads/2015/10/realm-podfile-1024x430.png)

下面运行 `pod install` 命令来把 Realm 下载安装到项目中。完成之后，你会在你的工程文件目录发现一个新生成的 Xcode 工作空间。请确保打开 **RealmTasks.xcworkspace** 而不是 xcodeproj。打开工作空间后，你会看到像下面这样的情形：

![](http://www.appcoda.com/wp-content/uploads/2015/10/realm-pod-folder-1024x446.png)

现在就可以在 Xcode 中使用 Realm 啦，但是我们将安装下面的小工具来让使用 Realm 的过程更加容易。

## 在 Xcode 中安装 Realm 插件

Realm 开发团队提供了一个生成 Realm 模型非常有用的插件。为了安装这个插件，我们要使用 [Alcatraz](http://alcatraz.io/)。如果你不知道 Alcatraz 是什么的话，这里解释一下，它是一个简单有用的开源包管理工具，它可以让你无需任何配置，自动地为 Xcode 安装插件、文件模板和颜色主题。为了安装 Alcatraz，你只需将以下代码复制到终端中执行，之后重启 Xcode：

```bash
curl -fsSL https://raw.githubusercontent.com/supermarin/Alcatraz/master/Scripts/install.sh | sh
```

然后在 Xcode 中，选择 `Window` -> `Package Manager`，如下图：

![](http://www.appcoda.com/wp-content/uploads/2015/10/realm-package-manager-1024x334.png)

然后在弹出的窗口中，你可以选择安装你喜欢的插件或者文件模板，在搜索框中你可以搜索你喜欢的插件、配色。在搜索框输入「Realm」，在出现的结果中选择「RealmPlugin」，点击 `Install` 按钮

![](http://www.appcoda.com/wp-content/uploads/2015/10/realm-plugin-1024x996.png)

## Realm 浏览器

给大家介绍的最后一个工具是 Realm 浏览器。这个浏览器可以帮助你阅读和编辑你的 `.realm` 数据库文件。这些文件在应用程序中被创建，在数据库表中保存了所有的数据实体（entities）、属性（attributes）和记录（records）。之前我们说过，这些数据库文件可以在像 iOS 和 Android 这样不同的平台间共享。想要下载最新版本的 Realm 浏览器，请访问 [iTunes store](https://itunes.apple.com/app/realm-browser/id1007457278)。打开 Realm 浏览器，选择 `Tools` -> `Generate demo database`。它会帮你生成 realm 数据库测试文件，你可以使用该浏览器打开和编辑它的内容。当你打开的时候，你会看到像下面的内容：

![](http://www.appcoda.com/wp-content/uploads/2015/10/browser.png)

正如你所见，在 RealmTestClass1 中，它拥有 1000 条记录，显示了多种不同的参数类型（即「列」）。我们会在下节介绍支持的属性类型。

现在，Realm 的所有准备工作都已就绪，那我们开始动手吧！

## 数据模型类

好戏才刚刚开始。首先我们来创建模型类或者说我们的数据库。为了创建 Realm 数据模型类，你只需要简单地新建一个普通的 Swift 类继承自 Object 就可以了。因为 Realm 数据模型类的基类是 Object，所以 Object 的子类都可以扩展为 Realm 的模型类。一旦创建类后，就可以添加属性了。Realm 支持以下多种数据类型：

– Int，Int8，Int16，Int32 和 Int64
– Boolean
– Float
– String
– NSDate
– NSData
– 继承自 Object 的类 => 作为一对一关系（Used for One-to-one relations）
– List<Object> => 作为一对多关系（Used for one-to-many relations）

Realm 中的 List 可以包含多个 Object 实例，参考上面 demo 数据库的截图，最后一列表示在其他数据表中的存在的一组引用。在和 Realm 模型类打交道的时候，使用的方式和其他 Swift 类一样。例如，你可以添加方法或者遵循指定的协议。

多说无益，来看代码 😂

现在让我们使用之前在 Xcode 中安装的 Realm 插件来新建一个 Realm 类。打开 Xcode，新建文件，在右边的侧边栏选择 Realm：

![](http://www.appcoda.com/wp-content/uploads/2015/10/realm_model.png)

然后选择 Swift 语言，类名我们输入 Task。会得到如下结果：

![](http://www.appcoda.com/wp-content/uploads/2015/10/Task_swift.png)

现在，可以向 Task 数据模型中添加属性了。

## 属性

我们需要在数据模型中添加需要的属性。该例子中，Task 需要有 name（String），createdAt（NSDate)），notes（String），和 isCompleted（Bool）这些属性。添加这些之后，代码应该像下面这样子：

```swift
class Task: Object {
    
  dynamic var name = ""
  dynamic var createdAt = NSDate()
  dynamic var notes = ""
  dynamic var isCompleted = false

// 声明让 Realm 忽略的属性（Realm 将不持有这些属性）
    
//  override static func ignoredProperties() -> [String] {
//    return []
//  }
}
```

我们已经为 Task 模型类添加了属性，所有的属性前面都加了 `dynamic var` 前缀，这使得属性可以被数据库读写。

接下来，我们要创建 TaskList 模型类，用来存储 Task 实例：

```swift
class TaskList: Object {
    
  dynamic var name = ""
  dynamic var createdAt = NSDate()
  let tasks = List<Task>()
    
// 声明让 Realm 忽略的属性（Realm 将不持有这些属性）
    
//  override static func ignoredProperties() -> [String] {
//    return []
//  }
}
```

TaskList 模型类拥有 name，createAt 和一个包含 Task 的 List 属性。需要注意的是：

1. List<Object> 用来表示一对多的关系：一个 TaskList 中拥有多个 Task。
2. List 和 Array 在使用上非常相似，所用的方法和访问数据的方式（索引和下标）都相同。正如你所见的一样，List 后标明了数据类型，所包含的所有对象都应该是相同类型的。
3. List<T> 是泛型，这也是为什么我们没有在声明前面加上 dynamic 的原因，因为在 Objective-C 运行时无法表示泛型属性。

就像在之前实现中你看到的一对多关系那样，在 Realm 中创建数据关系非常简单。在使用一对一的关系时，我们不使用 List<T> 而是使用 Object 类型，来看下面的例子：

```swift
class Person: Object{
  dynamic var name = ""
}
 
class Car: Object{
  dynamic var owner:Person?
}
```

上面的例子中，owner 属性表示 Car 和 Person 之间的一对一数据关系。

现在基本的数据模型都已经创建好了。接下来我们会通过创建一个 ToDo 应用的过程，来讨论 Realm。首先，[从这里下载 app](https://github.com/hossamghareeb/realmtasks) 并且一窥究竟。在 Xcode 7 或更高的版本中运行，就像下面这样：

![](http://www.appcoda.com/wp-content/uploads/2015/10/realm-todo-list-app-1024x661.png)

在项目中，我添加了两个视图控制器：TasksViewController 和 TaskListViewController。第一个视图控制器用来显示单个 task，第二个视图控制器用来显示所有的 TaskList。在 list 视图中，点击 + 按钮来添加一个任务清单。选择一个任务清单将会详情视图。你可以在这里添加多个 task。

了解了 demo 的大体思路之后，现在让我们来看看如何向 Realm 数据库中添加一个新的任务清单。为了实现这个功能，需要如下处理：

1. 创建 TaskList 实例对象，并将其保存到 Realm 数据库中。
2. 向数据库中查询 list 数据，并更新 UI。

为了在 Realm 中保存数据，你只需要实例化继承自 Object 的数据模型类，然后将对象写入到 Realm 中，下面是示例代码：

```swift
let taskListA = TaskList()
taskListA.name = "Wishlist"
        
let wish1 = Task()
wish1.name = "iPhone6s"
wish1.notes = "64 GB, Gold"
        
let wish2 = Task(value: ["name": "Game Console", "notes": "Playstation 4, 1 TB"])
let wish3 = Task(value: ["Car", NSDate(), "Auto R8", false])
 
taskListA.tasks.appendContentsOf([wish1, wish2, wish3])
```

通过实例化 TaskList 类，我们创建了一个任务清单，之后设置了它的属性。随后我们创建了 3 个 Task 类型的对象（即 wish1，wish2 和 wish3）。这里我们演示了创建 Realm 对象的三种途径：

1. wish1 的实例化方式：简单的实例化 Realm 类，然后设置属性。
2. wish2 的实例化方式：传入一个字典，字典中的 key 为属性名，值为要设置的值。
3. wish3 的实例化方式：使用数组传入的方式。数组中值的顺序需要和模型类中的声明顺序一致。

### 嵌套对象

在 Realm 中还可以是使用嵌套的方式来创建对象。在一对一关系和一对多关系的时候，你可以使用这种方式，这时候，一个类型对象的初始化需要一个 Object 或多个另一个类型的对象 List<Object>。面临这种情况的时候，你可以选择上面的第二或者第三种方法，使用一个字典或者一个数组来表示一个对象。下面是嵌套对象的一个例子：

```swift
let taskListB = TaskList(value: ["MoviesList", NSDate(), [["The Martian", NSDate(), "", false], ["The Maze Runner", NSDate(), "", true]]])
```

在上面的代码中，我们创建了一个电影清单，并设置了清单名称、创建时间和清单内容，清单内容包括多个 task。每个 task 使用数组的方式来创建，例如 `["The Maze Runner", NSDate(), "", true]` 表示一个 task，内容分别对应了名称、创建时间、备注和是否已经完成。

## 使用 Realm 持久化对象

现在你应该知道了如何在 Realm 中创建和使用对象，但是为了能够在应用程序重新启动的时候使用这些数据，需要使用写事务将它们持久化到 Realm 的数据库中。当使用 Realm 来持久化数据的时候，只要这些对象已经存储成功，你可以在任何线程中获取这些对象。一个 Realm 实例表示一个 Realm 数据库。可以像下面一样实例化它：

```swift
let uiRealm = try! Realm()
```

我们常常将上面这行代码写在 `AppDelegate.swift` 文件的顶端（译者注：类之外，全局变量），这样就可以在整个项目中获得该对象的引用。之后便可以很方便地调用它的读和写方法：

```swift
uiRealm.write { () -> Void in
  uiRealm.add([taskListA, taskListB])
}
```

首先，uiRealm 对象已经在 AppDelegate 中创建，在整个 app 中都可以使用。Realm 对象在每个线程中都应该只被创建一次，因为它不是线程安全的，不能在不同的线程中共享。如果你想要在另一个线程中执行写操作，那么就需要创建一个新的 Realm 对象。我将这个实例命名为 `uiRealm`，就是因为它应该只在 UI 线程中被使用。

现在让我们回到我们的 app 中，我们需要在用户点击 Create 按钮的时候保存任务列表。在 `TasksViewController` 的 `displayAlertToAddTask `方法中，我们有一个 `createAction` 对象：

```swift
let createAction = UIAlertAction(title: doneTitle, style: UIAlertActionStyle.Default) { (action) -> Void in
    
    let taskName = alertController.textFields?.first?.text
    
    if updatedTask != nil{
        // update mode
        uiRealm.write({ () -> Void in
            updatedTask.name = taskName!
            self.readTasksAndUpateUI()
        })
    }
    else{
        
        let newTask = Task()
        newTask.name = taskName!
        
        uiRealm.write({ () -> Void in
            
            self.selectedList.tasks.append(newTask)
            self.readTasksAndUpateUI()
        })
    }
 
}
```

在上面的代码中，我们从 TextField 中获取到任务名称，调用 Realm 的写方法来保存任务列表。

*请注意，当你同时进行多个写操作的时候，他们会相互阻塞，阻塞住他们所运行的线程。所以应当考虑在 UI 之外的线程中来进行操作。另外需要注意的是，在进行写事务的时候，读操作并不会造成阻塞。这非常有用，尤其是当你在后台进行写操作的时候，用户可能会在不同界面切换，而这时候可以进行读操作。*

## 检索数据

现在你已经学会了如何在 Realm 中写数据，下面我们来看看如何检索数据。在 Realm 中检索数据的方式非常直观。Realm 提供了很多选项来过滤出你想要的数据。在 Realm 中进行查找操作的时候，它将会返回一个 Results 对象。可以把 Results 简单地当做是 Swift 的数组，因为它们的接口非常类似。

当得到 Results 实例的时候，这代表你已经从磁盘中直接获取到了数据。对这些数据的任何操作（使用事务）将会影响到磁盘上的数据。在 Realm 中来检索数据，只需要调用对象的方法，并将类名作为参数传进去。让我们看看如何使用这种方式来读取 TaskLists 并更新 UI：

我们在 `TasksListsViewController` 中定义了该属性：

```swift
var lists : Results<TaskList>!
```

然后实现了 `readTasksAndUpdateUI` 方法：

```swift
func readTasksAndUpdateUI(){
    
    lists = uiRealm.objects(TaskList)
    self.taskListsTableView.setEditing(false, animated: true)
    self.taskListsTableView.reloadData()
}
```

在 `tableView(_:cellForRowAtIndexPath:_)` 方法中，我们将显示列表的名称，还有每个列表内的任务个数：

```swift
func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell{
    
    let cell = tableView.dequeueReusableCellWithIdentifier("listCell")
    
    let list = lists[indexPath.row]
    
    cell?.textLabel?.text = list.name
    cell?.detailTextLabel?.text = "\(list.tasks.count) Tasks"
    return cell!
}
```

代码逻辑非常直观吧。最后需要做的就是在 `viewWillAppear` 中调用 `readTasksAndUpdateUI` 方法，来确保总是显示数据更新之后的视图。

```swift 
override func viewWillAppear(animated: Bool) {
    readTasksAndUpdateUI()
}
```

上面展示了如何使用 Realm 来进行任务列表的读写操作。接下来，我们来看看如何进行数据更新和删除操作。在开始之前，先来看看项目模板中的修改和删除部分的相关代码。

首先在 `TaskListsViewController` 中，我们用一个布尔值 `isEditingMode` 来表示是在正常状态还是编辑状态：

```swift
var isEditingMode = false
```

当 Edit 按钮被点击的时候，将会调用 `didClickOnEditButton` 方法：

```swift
@IBAction func didClickOnEditButton(sender: UIBarButtonItem) {
    isEditingMode = !isEditingMode
    self.taskListsTableView.setEditing(isEditingMode, animated: true)
}
```

这个方法会使用 table view 的 `setEditing` 方法来启用或禁用 UITableView 的编辑模式。在表格视图中，默认的编辑操作是删除，但是从 iOS 8.0 开始，增加了一个 `editActionsForRowAtIndexPath` 方法来自定义一些操作，这些操作在在用户滑动表格 cell 的时候出现。

我们将使用该方法来添加两个功能 — 删除和编辑，代码如下：

```swift
func tableView(tableView: UITableView, editActionsForRowAtIndexPath indexPath: NSIndexPath) -> [UITableViewRowAction]? {
    let deleteAction = UITableViewRowAction(style: UITableViewRowActionStyle.Destructive, title: "Delete") { (deleteAction, indexPath) -> Void in
        
        //这里开始是删除
        
        let listToBeDeleted = self.lists[indexPath.row]
        uiRealm.write({ () -> Void in
            uiRealm.delete(listToBeDeleted)
            self.readTasksAndUpdateUI()
        })
    }
    let editAction = UITableViewRowAction(style: UITableViewRowActionStyle.Normal, title: "Edit") { (editAction, indexPath) -> Void in
        
        // 这里开始是编辑
        let listToBeUpdated = self.lists[indexPath.row]
        self.displayAlertToAddTaskList(listToBeUpdated)
        
    }
    return [deleteAction, editAction]
}
```

这里我们使用 `UITableViewRowAction` 添加了两个操作，方法中定义了操作的 `style`，`title` 和 `handler`。当在滑动 cell 或者以其他方式进入编辑模式的时候，会像下面这样：

![](http://www.appcoda.com/wp-content/uploads/2015/10/edit-mode-576x1024.png)

以上就是在进行删除和更新操作时候的 UI 代码逻辑。

## 删除对象

想要从 Realm 数据库中删除对象或者数据，你只需要调用 Realm 对象的 `delete` 方法，同时将该对象作为参数传入。当然，这些操作会在写事务中完成。来看一下下面的代码的工作方式，我们从 Realm 数据库中删除了一个任务列表：

```swift
let listToBeDeleted = self.lists[indexPath.row]
uiRealm.write({ () -> Void in
           uiRealm.delete(listToBeDeleted)
           self.readTasksAndUpdateUI()
    })
```

在删除之后，我们调用了 `readTasksAndUpdateUI` 方法来读取数据并更新 UI。

除了删除单个数据，在 Realm 中，还有一个方法叫做 `deleteAll`，它允许你删除数据库中所有 class 的所有数据。如果你想为当前用户持久化数据，但是在他退出登录的时候抹掉所有的相关数据，这个方法将会十分有用。

```swift
uiRealm.write({ () -> Void in
    uiRealm.deleteAll()
})
```

## 更新 Objects

在 Realm 中有多种方式可以来更新 object，但是这些方法都应该在写事务中完成。下面我们来看一些更新对象的方式。

### 使用属性（Property）

你可以通过直接在 Realm 的写闭包中设置属性的值来更新数据。例如，在 `TasksViewController` 中，我们可以简单地设置属性值来更新任务的状态信息：

```swift
uiRealm.write({ () -> Void in
    task.isCompleted = true
})
```

### 使用主键（Primary Key）

Realm 支持将某个 string 或 int 类型的属性设置为主键。当使用 `add()` 方法来创建 Realm 对象时，如果有相同主键的对象存在，就会更新这个对象的值。下面是示例代码：

```swift
let user = User()
user.firstName = "John"
user.lastName = "Smith"
user.email = "example@example.com"
user.id = 1
// 更新 id 是 1 的用户
realm.write {
            realm.add(user, update: true)
        }
```

这里的 id 属性为主键。如果 id 为 1 的用户存在，Realm 会更新相应的对象。如果不存在，Realm 将会把该对象存入数据库中。

### 使用 KVC（Key-Value Coding）

如果你是 iOS 开发的老手，那么对 Key-Value Coding 肯定不会陌生。Realm 的类型，像是 Object、Results 和 List，都可以使用 Key-Value Coding。该特性可以帮助你在运行时设置或更新属性值。另外一个在 List 和 Results 中支持 KVC 的好处是，可以在无需遍历每个对象的情况下，批量更新对象数据。这么说你可能不是很理解，我们来看个例子：

```swift
let tasks = uiRealm.objects(Task)
uiRealm.write { () -> Void in
    tasks.setValue(true, forKeyPath: "isCompleted")
}
```

在上面的代码中，使用查询语句来请求所有的 Task 对象，之后将所有得到的对象的 `isCompleted` 属性设置为 true。可以看出，将 Realm 中的所有 tasks 标记为已完成，仅仅只用了一行代码。

让我们回过头来看看我们的 ToDo 应用。如果仔细观察 `displayAlertToAddTaskList` 方法，你会看到如下代码片段：

```swift
  // 更新状态
 uiRealm.write({ () -> Void in
           updatedList.name = listName!
           self.readTasksAndUpdateUI()
 })
```

当用户遍历列表名称的时候，上面的代码会被调用。通过设置 name 属性的方式，就更新了数据库中的内容。

## 显示任务项

我们已经一起看过了 `TaskListViewController` 的绝大部分代码。现在让我们打开 `TasksViewController` 来看看，这个视图控制器用来显示任务清单中的任务项。视图控制器拥有一个 UITableView, 该视图有两个 section：完成的任务和未完成的任务。在 `TasksViewController` 中，有如下属性：

```swift
var selectedList : TaskList!
var openTasks : Results<Task>!
var completedTasks : Results<Task>!
```

`selectedList` 用来存储 `TaskListsViewController` 传递过来的选中的任务列表。为了将完成和未完成的任务分开，声明了两个属性，`openTasks` 和 `completedTasks`。为了过滤出不同的任务完成状态，我们将使用 Realm 的方法 `filter()`。在解释该函数如何工作之前，让我们先来看看如何在代码中使用它：

```swift
func readTasksAndUpateUI(){
    
    completedTasks = self.selectedList.tasks.filter("isCompleted = true")
    openTasks = self.selectedList.tasks.filter("isCompleted = false")
    
    self.tasksTableView.reloadData()
}
```

在上面的方法中，我们使用 `filter` 方法来过滤 `results`。Realm 提供了 `filter()` 方法来过滤数据。该方法可以被 List、Result 和 Object 对象调用。方法会返回过满足滤条件参数的特定对象。你可以把 `filter` 当做 `NSPredicate`。基本上来说，你可以认为这两者差不多。就像上面的代码一样，你同样可以使用 string 作为参数创建一个 `NSPredicate` 对象，并把它作为参数传给 `filter` 方法。

让我们来看另外一个例子：

```swift
// 使用断言字符串
var redCars = realm.objects(Car).filter("color = 'red' AND name BEGINSWITH 'BMW'")
 
// 使用 NSPredicate
let aPredicate = NSPredicate(format: "color = %@ AND name BEGINSWITH %@", "red", "BMW")
redCars = realm.objects(Car).filter(aPredicate)
```

在上面的代码中，我们使用 `filter` 方法来过滤 `color` 为 red，并且 `name` 以 "BMW" 开头的对象。第一行代码使用 string 作为参数来进行过滤。另外，你也可以使用 NSPredicate 获得同样的效果。下面的表格总结了 filter 方法的大部分常用操作：

![](http://www.appcoda.com/wp-content/uploads/2015/10/realm-database-info-1024x675.png)

## 排序

既然我们谈到了 Realm 数据库的基本操作，在本教程结束之前，我还想给大家介绍另外一个特性。排序功能，这是 Realm 提供了另一个特别有用的特性。对于 List 和 Result 对象，你可以调用方法 `sorted（「排序标准」）` 来将一组数据进行排序。让我们来看看如何在任务列表中使用该方法让任务列表以字母表或者创建时间先后顺序排序。首先，在 UI 中，我们增加了一个 segment control，将会根据选择的情况来进行对应的排序。

![](http://www.appcoda.com/wp-content/uploads/2015/10/Simulator-Screen-Shot-Oct-24-2015-8.47.06-PM-576x1024.png)

根据不同的选择来进行排序，代码逻辑如下：

```swift
@IBAction func didSelectSortCriteria(sender: UISegmentedControl) {
        
        if sender.selectedSegmentIndex == 0{
            
            // 按 A-Z 排序
            self.lists = self.lists.sorted("name")
        }
        else{
            // 按日期排序
            self.lists = self.lists.sorted("createdAt", ascending:false)
        }
        self.taskListsTableView.reloadData()
    }
```

## 总结

Realm 是一个非常简单易用，直观的本地数据库解决方案。Realm 提供了很好的可扩展性，只用很少的几行代码就可完成操作。对于大部分的应用甚至是游戏来说，我觉得如果需要使用数据库的话，Realm 值得尝试。

## 下一步？

学习了本教程，你应该可以在项目中使用 Realm 来进行增删改查等基本的操作。Realm 还具有一些高阶特性，值得深入学习。最好的学习资料就是 Realm 网站的官方文档，Realm 的小伙伴把文档写得非常赞！

如果想要教程 ToDo 应用的的完整代码，你可以在[这里下载](https://github.com/hossamghareeb/realmtasks)。

如果对代码有任何的问题，都欢迎留言反馈，我们会很乐意帮助到您。