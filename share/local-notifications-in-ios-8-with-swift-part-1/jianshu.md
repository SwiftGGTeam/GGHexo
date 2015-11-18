如何在 iOS 8 中使用 Swift 实现本地通知(上)

> 作者：Jason Newell，[原文链接](http://jamesonquave.com/blog/local-notifications-in-ios-8-with-swift-part-1/)，原文日期：2015/03/04
> 译者：[小铁匠Linus](http://weibo.com/linusling)；校对：[shanks](http://codebuild.me/)；定稿：[numbbbbb](https://github.com/numbbbbb)
  









> 本教程代码基于 Xcode 6.2 写成。

当你的应用在后台运行时，可以简单地使用本地通知把信息呈现给用户。它可以允许你显示 提醒、播放提示音和数字角标（badge）。本地通知可以被以下的事件触发：计划好的时间点或者用户进入和离开某个地理区域。在本教程中，我们会构建一个简单的待办列表应用(to-do list app)，并探索一下 UILocalNotification  提供的一些功能和技巧。



首先，我们在 Xcode 建立一个 single view application，命名为`LocalNotificationsTutorial`。记得选择 Swift 作为编程语言。如下图。

![](http://swift.gg/img/articles/local-notifications-in-ios-8-with-swift-part-1/Screen-Shot-2015-01-30-at-10.15.42-PM.png1444269932.883674)

在开始写代码之前，我们要先设置好视图控制器和视图，这是必要步骤。我会介绍一些使用 Interface Builder 的基本知识，如果你想要跳过这个步骤，可以在[这里](https://github.com/jasonbnewell/LocalNotificationTutorials/tree/part1_simplified)下载设置好的应用源代码，然后直接跳到[这里](#scheduling)开始探索。

## 配置视图

我们最终完成的应用在导航控制器（navigation controller）下会有两个视图：根视图是一个显示按时间排序的待办列表，其中每个待办项会显示截止日期(deadline)，另一个视图用来添加待办项，如下图所示：

<div style="max-width:300px;">
![](http://swift.gg/img/articles/local-notifications-in-ios-8-with-swift-part-1/iOS-Simulator-Screen-Shot-Feb-4-2015-10.26.58-PM.png1444269933.474555)![](http://swift.gg/img/articles/local-notifications-in-ios-8-with-swift-part-1/iOS-Simulator-Screen-Shot-Feb-1-2015-11.43.36-PM.png1444269933.761498)
</div>

## 创建视图控制器

在开始使用 IB（Interface Builder）之前，我们要先生成两个视图控制器。在项目管理器（project navigator）里按下 Ctrl+左键或者在项目组(project group)上点击右键，然后选择“New File”。如图：

![](http://swift.gg/img/articles/local-notifications-in-ios-8-with-swift-part-1/Screen-Shot-2015-01-30-at-10.29.29-PM.png1444269934.173416)

接下来，选择“Cocoa Touch Class”，创建一个名为`TodoTableViewController`的 `UITableViewController`子类。注意，选择 Swift 作为编程语言，不要创建 XIB 文件。这是根视图控制器，用来显示待办列表。

我们同样需要创建一个添加待办项的视图控制器。重复前面的过程，创建一个名为  `TodoSchedulingViewController`的`UIViewController`子类。

## 设置 Navigation

我们已经把视图控制器建好了，现在要把这些视图控制器与工程的 storyboard 关联起来。点选“Main.storyboard”，然后删除自带的根视图控制器以及“ViewController.swift”文件。我们用不上这些了。

从 Xcode 右下角的对象库（object library）里拖出一个导航控制器，放到目前空无一物的 storyboard 中。因为我们删除了根视图，所以需要把 Storyboard 入口点（Entry Point）重新指向导航控制器，使其成为新的根视图。

![](http://swift.gg/img/articles/local-notifications-in-ios-8-with-swift-part-1/Screen-Shot-2015-01-30-at-11.11.26-PM.png1444269934.560338)

点选导航控制器的根视图(table view)，然后在 identity inspector 中把 custom class 设置为 TodoTableViewController，如图。

![](http://swift.gg/img/articles/local-notifications-in-ios-8-with-swift-part-1/Screen-Shot-2015-01-30-at-11.22.17-PM.png1444269934.80329)

因为我们需要为每个待办项显示截止日期，所以，我们点选表格视图（table view）的唯一一个 prototype cell，切换到 attributes inspector，然后设置 cell 的样式为`Subtitle`。同时，cell 需要一个复用标识（ reuse identifier），这样我们才可以在代码中引用它。我们会使用“todoCell”来标记 cell。

![](http://swift.gg/img/articles/local-notifications-in-ios-8-with-swift-part-1/Screen-Shot-2015-01-30-at-11.39.00-PM.png1444269935.048241)

还是在 attributes inspector 界面，把一个导航项（navigation item）拖到表格视图上，命名为“Todo List”，再拖拽一个菜单栏按钮（bar button item）上去，把标识设置为“Add”。

接下来，我们来设置添加待办项的视图。把一个试图控制器拖拽到 storyboard 里。同样，把 custom class 设置为`TodoSchedulingViewController`。

Ctrl+左键或直接右键点击“Add”按钮，按住“action”并拖拽到新的视图，然后选择“show”，如图。至此，我们的导航已经连接起来了。

![](http://swift.gg/img/articles/local-notifications-in-ios-8-with-swift-part-1/Screen-Shot-2015-01-31-at-12.03.33-AM.png1444269935.291192)

现在需要拖拽三个控件到视图上：一个文本框（占位符设置成`Title`）、一个日期选择器（date picker）和一个按钮(标题设置为`Save`)。将这三个控件居中显示，然后点选“add missing constraints”(位于 Xcode 右下角的三角形图标，如图)。这样添加约束后可以适配各种屏幕大小，而不会出现显示不全或排列不齐的问题。

![](http://swift.gg/img/articles/local-notifications-in-ios-8-with-swift-part-1/Screen-Shot-2015-01-31-at-12.25.08-AM.png1444269935.534143)

## 将控件与代码连结起来

我们的视图和导航已经布局完毕，现在需要将前面提到的三个控件以 IBOutlet 的形式与`TodoSchedulingViewController.swift`连接起来。这样我们就能在代码中访问这些控件以及控件的属性值。有很多方法可以实现，下面介绍比较简单的一种：点击 Xcode 右上角的 Assistant editor，接着 Ctrl+左键或直接右键点击需要联结的控件，拖拽“New Referencing Outlet”圆圈到`TodoSchedulingViewController`类中，如图。

![](http://swift.gg/img/articles/local-notifications-in-ios-8-with-swift-part-1/Screen-Shot-2015-01-31-at-12.45.14-AM.png1444269936.025045)

用相同的方法处理文本框和日期选择器，分别命名为`titleField`和`deadlinePicker`。

    
    @IBOutlet weak var titleField: UITextField!
    @IBOutlet weak var deadlinePicker: UIDatePicker!

最后一步是将 save 按钮连接至一个 IBAction （一个事件处理函数）。Ctrl+左键或直接右键点击按钮，拖拽“Touch Up Inside”圆圈到代码中去，将`action`命名为“savePressed”并设置`sender`类型为`UIButton`（其它控件不会触发这个 action，所以在此可以指定具体的类型）。

    
    @IBAction func savePressed(sender: UIButton) {
    }

到目前为止，所有视图和导航都设置好了。在模拟器里运行一下程序，并在不同模拟器的设备上试一下，你会发现，添加约束后控件显示都很正常。

从现在开始，再也不需要使用 Interface Builder 了，下面我们开始写代码。

<a href="#scheduling"></a>

## 注册通知的设置

从 iOS 8 起，如果要在应用中发送通知就要先注册通知。否则，我们设置的通知也不会被触发。切换到工程的应用委托（Application Delegate）文件（`AppDelegate.swift`），将下面的代码添加到`application:didFinishLaunchingWithOptions`方法中。

    
    application.registerUserNotificationSettings(UIUserNotificationSettings(forTypes: .Alert | .Badge | .Sound, categories: nil))  // types are UIUserNotificationType members

在第一次运行这个应用的时候，会提示用户授权应用程序触发通知的权限。如果用户授予权限，我们就能够做通知的计划了，通知包括显示一条横幅，播放一个声音，以及更新应用图标上的角标数字。(这部分内容会在本教程中的第二部分展示)。

<div style="max-width:300px;">
![](http://swift.gg/img/articles/local-notifications-in-ios-8-with-swift-part-1/iOS-Simulator-Screen-Shot-Feb-3-2015-2.56.37-PM.png1444269936.363977)
</div>

## 对应用建模

像我们这个这么简单的应用，所有的逻辑内容都可以在之前建立的视图控制器中进行处理，但是我们还是花一些时间来将待办列表管理逻辑和展示逻辑分离开来。

我选择将待办项以结构体的形式独立出来。点击“File -> New -> File”，然后选择“Swift File”并命名为`odoItem`。每个待办项都有一个标题和截止日期，所以我们把对应的属性建好，代码如下。

    
    struct TodoItem {
      var title: String
      var deadline: NSDate
    }

每个待办项都要保存在磁盘中，防止应用结束后数据丢失。`UILocalNotification`的实例有个`userInfo`属性（`[NSObject : AnyObject]?`），我们可以使用它来保存类似标题的数据，但是在以下情况中我们不能只靠它来存储数据。因为一旦某条本地通知被触发了，它就会被认为已经过期而被丢弃，我们就没有办法再取到这条本地通知了。所以，我们需要使用另外的方法来存储待办项，而且还要把在磁盘存储的待办项与本地通知关联起来。我们使用 universally unique identifier（UUID）来解决这个问题。

    
    struct TodoItem {
      var title: String
      var deadline: NSDate
      var UUID: String
     
      init(deadline: NSDate, title: String, UUID: String) {
        self.deadline = deadline
        self.title = title
        self.UUID = UUID
      }
    }

因为我们需要将过期的待办项显示为红色，所以添加一个计算只读属性返回待办项是否已过期。

    
    var isOverdue: Bool {
      return (NSDate().compare(self.deadline) == NSComparisonResult.OrderedDescending) // 截止日期比现在要早
    }

## 存储待办项(设置通知)

我们需要一个类来表示列表中的待办项以及处理存储的操作。建立一个新的叫`TodoList`的 Swift 文件。

因为我们这个应用只有一个待办项列表，所以可以在整个应用中使用单例。

    
    class TodoList {
      class var sharedInstance : TodoList {
        struct Static {
          static let instance : TodoList = TodoList()
        }
        return Static.instance
      }
    }

这种在 Swift 中实现单例的方法是社区公认的，我们也可以借鉴到自己的工程里。如果你对它很好奇，可以去[StackOverflow](http://stackoverflow.com/questions/24024549/dispatch-once-singleton-model-in-swift/24147830#24147830)看看具体怎么实现以及为什么要这样做。

[NSUserDefaults](https://developer.apple.com/library/mac/documentation/Cocoa/Reference/Foundation/Classes/NSUserDefaults_Class/index.html)提供了一种存储待办项的简单方法。接下来的代码展示了如何将待办项以字典形式（以 UUID 为键）存储到`standard user defaults`中，并创建对应的本地通知。

    
    private let ITEMS_KEY = "todoItems"
     
    func addItem(item: TodoItem) { 
      var todoDictionary = NSUserDefaults.standardUserDefaults().dictionaryForKey(ITEMS_KEY) ?? Dictionary() 
      todoDictionary[item.UUID] = ["deadline": item.deadline, "title": item.title, "UUID": item.UUID] 
      NSUserDefaults.standardUserDefaults().setObject(todoDictionary, forKey: ITEMS_KEY) 
      var notification = UILocalNotification()
      notification.alertBody = "Todo Item \"\(item.title)\" Is Overdue" 
      notification.alertAction = "open" 
      notification.fireDate = item.deadline 
      notification.soundName = UILocalNotificationDefaultSoundName 
      notification.userInfo = ["UUID": item.UUID, ] 
      notification.category = "TODO_CATEGORY"
      UIApplication.sharedApplication().scheduleLocalNotification(notification)
    }

值得注意的是，我们只是在通知触发的时候播放默认的提示音。当然你也可以自己提供音频文件来代替默认的提示音，但是时长不能超过30秒钟。如果超过了30秒系统将使用默认音。

我们已经完成了如何创建一个待办项列表，是时候来实现`TodoSchedulingViewController`中的`savePressed:`方法了。

    
    @IBAction func savePressed(sender: UIButton) {
        let todoItem = TodoItem(deadline: deadlinePicker.date, title: titleField.text, UUID: NSUUID().UUIDString)
        TodoList.sharedInstance.addItem(todoItem) // schedule a local notification to persist this item
        self.navigationController?.popToRootViewControllerAnimated(true) // return to list view
    }

需要注意的是，因为这是一个新的待办项，所以要传递一个新的 UUID 作为键。

模拟器里运行应用后，创建一个一分钟后触发的待办项，然后回到主屏或锁定屏幕(Shift+CMD+H 或 CMD+L)等着通知触发。通知不会在恰好一分钟的时候触发（主要由于日期选择器里隐含着一个“秒”值），但是你肯定会在一分钟内看到通知。

<div style="max-width:300px;">
![](http://swift.gg/img/articles/local-notifications-in-ios-8-with-swift-part-1/iOS-Simulator-Screen-Shot-Feb-3-2015-4.29.05-PM.png1444269936.703909)![](http://swift.gg/img/articles/local-notifications-in-ios-8-with-swift-part-1/iOS-Simulator-Screen-Shot-Feb-3-2015-4.33.13-PM.png1444269937.094831)
</div>

## 通知数量上限为 64 个

值得注意的是，本地通知最多可以保留 64 个。如果超过 64 个，系统只会保留最近的 64 个通知，而将其余的删除掉。

如果已经存在 64 个通知，我们可以通过禁止创建新的待办项来避免上面的情况出现。

`TodoTableViewController`里可以这样写：

    
    var todoItems: [TodoItem] = []
     
    func refreshList() {
        todoItems = TodoList.sharedInstance.allItems()
        if (todoItems.count >= 64) {
            self.navigationItem.rightBarButtonItem!.enabled = false
         }
        tableView.reloadData()
    }

## 取回待办项

待办项以字典数组的形式存储，这样外部类就不用关心具体的细节。我们的`TodoList`类要提供一个公共的函数以便查询返回待办项的列表。

    
    func allItems() -> [TodoItem] {
      var todoDictionary = NSUserDefaults.standardUserDefaults().dictionaryForKey(ITEMS_KEY) ?? [:]
      let items = Array(todoDictionary.values)
      return items.map({TodoItem(deadline: $0["deadline"] as! NSDate, title: $0["title"] as! String, UUID: $0["UUID"] as! String!)}).sorted({(left: TodoItem, right:TodoItem) -> Bool in
        (left.deadline.compare(right.deadline) == .OrderedAscending)
    }

这个函数从外存取回待办项数组，并转换成以`TodoItem`实例为元素的数组，其中用闭包实现并按时间先后顺序排序。具体如何使用`map`以及排序函数已经超出了本教程的范围，你可以在 Swift language guide 的[闭包](https://developer.apple.com/library/mac/documentation/Swift/Conceptual/Swift_Programming_Language/Closures.html#//apple_ref/doc/uid/TP40014097-CH11-ID94)部分查询更多的信息。

现在我们可以在`TodoTableViewController`里显示待办项列表了，代码如下。

    
    class TodoTableViewController: UITableViewController {
      var todoItems: [TodoItem] = []
      override func viewDidLoad() {
        super.viewDidLoad()
      }
     
      override func viewWillAppear(animated: Bool) {
        super.viewWillAppear(animated)
        refreshList()
      }
     
      func refreshList() {
        todoItems = TodoList.sharedInstance.allItems()
     
        if (todoItems.count >= 64) {
          self.navigationItem.rightBarButtonItem!.enabled = false
        }
        tableView.reloadData()
      }
     
      override func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        return 1
      }
     
      override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return todoItems.count
      }
     
      override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("todoCell", forIndexPath: indexPath) as! UITableViewCell
        let todoItem = todoItems[indexPath.row] as TodoItem
        cell.textLabel?.text = todoItem.title as String!
        if (todoItem.isOverdue) {
          cell.detailTextLabel?.textColor = UIColor.redColor()
        } else {
          cell.detailTextLabel?.textColor = UIColor.blackColor()dequeueReusableCellWithIdentifier:indexPath:
        }
     
        let dateFormatter = NSDateFormatter()
        dateFormatter.dateFormat = "'Due' MMM dd 'at' h:mm a"
        cell.detailTextLabel?.text = dateFormatter.stringFromDate(todoItem.deadline)
        return cell
      }
    }

我们这个待办列表现在能按时间顺序显示待办项，如果过期的话会以红色显示时间。

<div style="max-width:300px;">
![](http://swift.gg/img/articles/local-notifications-in-ios-8-with-swift-part-1/iOS-Simulator-Screen-Shot-Feb-4-2015-10.26.58-PM.png1444269933.474555)
</div>

这里我们仍有两个问题需要解决。当通知触发（或待办项过期）的时候，用户目前还不能在应用处于前台时得到任何可视化的反馈。另一个问题是，应用恢复到前台时，待办列表不能自动刷新，即过期的待办项不能显示红色。接下来，让我们来解决这个两个问题。

`TodoTableViewController`里这样写：

    
    override func viewDidLoad() {
      super.viewDidLoad()
      NSNotificationCenter.defaultCenter().addObserver(self, selector: "refreshList", name: "TodoListShouldRefresh", object: nil)
    }

`AppDelegate`里这样写：

    
    func application(application: UIApplication, didReceiveLocalNotification notification: UILocalNotification) {
      NSNotificationCenter.defaultCenter().postNotificationName("TodoListShouldRefresh", object: self)
    }
    
    func applicationDidBecomeActive(application: UIApplication) {      
      NSNotificationCenter.defaultCenter().postNotificationName("TodoListShouldRefresh", object: self)
    }

值得注意的是，虽然同样有“notification”这个单词，但是`NSNotificationCenter`跟`UILocalNotification`一点关系都没有。使用`NSNotificationCenter`的目的是为了在应用中实现[观察者模式](http://en.wikipedia.org/wiki/Observer_pattern)。

我们把`TodoTableViewController`作为“TodoListShouldRefresh”通知的一个观察者。不管什么时候调用了`postNotificationName`方法，`reloadData`方法都会被调用。

## 完成待办项（取消通知）

我们的应用如果不能清空已经完成的待办项，用起来就会不爽。最简单的办法就是可以删除已经完成的待办项。那么，我们就需要为`TodoList`添加一些功能。

    
    func removeItem(item: TodoItem) {
      for notification in UIApplication.sharedApplication().scheduledLocalNotifications as! [UILocalNotification] {
        if (notification.userInfo!["UUID"] as! String == item.UUID) {
          UIApplication.sharedApplication().cancelLocalNotification(notification)
          break
        }
      }
     
      if var todoItems = NSUserDefaults.standardUserDefaults().dictionaryForKey(ITEMS_KEY) {
        todoItems.removeValueForKey(item.UUID)
        NSUserDefaults.standardUserDefaults().setObject(todoItems, forKey: ITEMS_KEY)
      }
    }

需要注意的是，传递一个已经存在的通知给`scheduleLocalNotification:`方法会导致重复。如果你想要能让用户修改已经存在的通知，那么就需要在设置新的之前取消旧的那个。

现在我们来通过左滑待办项的 cell 并点“Complete”，来实现删除待办项的功能。

`TodoTableViewController`里这样写：

    
    override func tableView(tableView: UITableView, canEditRowAtIndexPath indexPath: NSIndexPath) -> Bool {
      return true
    }
    override func tableView(tableView: UITableView, commitEditingStyle editingStyle: UITableViewCellEditingStyle, forRowAtIndexPath indexPath: NSIndexPath) {
      if editingStyle == .Delete {
        var item = todoItems.removeAtIndex(indexPath.row)
        tableView.deleteRowsAtIndexPaths([indexPath], withRowAnimation: .Fade)
        TodoList.sharedInstance.removeItem(item)
        self.navigationItem.rightBarButtonItem!.enabled = true
      }
    }

<div style="max-width:300px;">
![](http://swift.gg/img/articles/local-notifications-in-ios-8-with-swift-part-1/iOS-Simulator-Screen-Shot-Feb-4-2015-10.26.58-PM.png1444269933.474555)
</div>

## 总结

我们现在这个应用已经实现了设置和取消本地通知，播放提示音和自定义信息显示。源代码可以在[这里](https://github.com/jasonbnewell/LocalNotificationTutorials/tree/part1_simplified)下载。

下集教程内容会在这一集的基础上添加以下功能：应用图标角标显示、通知动作和不开启应用触发通知的新特性。

欲知详情如何，请看下回分解。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。