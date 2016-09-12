title: "如何在 iOS 8 中使用 Swift 实现本地通知（下）"
date: 2015-09-18 20:00:00
tags: [Swift 进阶]
categories: [JamesonQuave.com]
permalink: local-notifications-in-ios-8-with-swift-part-2

---
原文链接=http://jamesonquave.com/blog/local-notifications-in-ios-8-with-swift-part-2/
作者=Jason Newell
原文日期=2015-03-04
译者=小铁匠Linus
校对=shanks
定稿=numbbbbb

<!--此处开始正文-->

> 本文代码是基于 Xcode 6.2 写的。

在上集中，我们已经构建了一个简单的待办列表应用（to-do list app），这个应用可以在待办项过期时通过本地通知提醒用户。现在，我们要在之前的基础上添加以下功能：应用图标角标上显示过期待办项的数量、通知动作的支持和在不开启应用的情况下编辑和完成待办项。

你可以在[这里](https://github.com/jasonbnewell/LocalNotificationTutorials/tree/part1_simplified)下载上一集的源代码。

<!--more-->

## 为应用图标添加角标（Badge）

值得注意的是，我们不通过本地通知也可以为应用图标添加角标。AppDelegate 中的 applicationWillResignActive: 方法是可以实现这个功能的。在用户返回主屏幕的时候，看到应用图标时候，会触发这个方法。

```swift
func applicationWillResignActive(application: UIApplication) {
  var todoItems: [TodoItem] = TodoList.sharedInstance.allItems()
  var overdueItems = todoItems.filter({ (todoItem) -> Bool in
    return todoItem.deadline.compare(NSDate()) != .OrderedDescending
  })
  UIApplication.sharedApplication().applicationIconBadgeNumber = overdueItems.count
}
```
<div style="max-width:300px;">
![](/img/articles/local-notifications-in-ios-8-with-swift-part-2/iOS-Simulator-Screen-Shot-Feb-4-2015-10.31.14-PM.png1444269937.440762)![](/img/articles/local-notifications-in-ios-8-with-swift-part-2/iOS-Simulator-Screen-Shot-Feb-4-2015-11.51.25-PM.png1444269937.731704)
</div>

虽然可行，但是并不能在待办项过期时自动更新角标的值。因为我们不能简单的在通知触发的时候增加角标的值，因此，我们可以为本地通知预设一个“applicationIconBadgeNumber”的属性值。接下来，我们在 TodoList 中写一个为每个通知设置相关角标值的方法。

```swift
func setBadgeNumbers() {
  var notifications = UIApplication.sharedApplication().scheduledLocalNotifications as! [UILocalNotification]
  var todoItems: [TodoItem] = self.allItems()
  for notification in notifications {
    var overdueItems = todoItems.filter({ (todoItem) -> Bool in
      return (todoItem.deadline.compare(notification.fireDate!) != .OrderedDescending)
    })
    UIApplication.sharedApplication().cancelLocalNotification(notification) 
    notification.applicationIconBadgeNumber = overdueItems.count
    UIApplication.sharedApplication().scheduleLocalNotification(notification)
  }
}
```

虽然没有办法去更新已经计划好时间的通知，但是可以通过删除当前通知然后重新设置的方式来达到同样的效果。

`applicationIconBadgeNumber`这个属性可以接受的最大值是 2,147,483,647（`NSIntegerMax`），超过 5 位数的数字就会在图标上被截断，如图所示。而且，设置为零或负数是不会产生效果的。

<div style="max-width:300px;">
![](/img/articles/local-notifications-in-ios-8-with-swift-part-2/Screen-Shot-2015-02-04-at-11.38.14-PM.png1444269938.072636)![](/img/articles/local-notifications-in-ios-8-with-swift-part-2/Screen-Shot-2015-02-04-at-11.38.14-PM.png1444269938.072636)
</div>


我们只是需要在待办列表发生变化的时候调用这个方法。将下面这段代码添加到 TodoList 中的`addItem:`和`removeItem:`两个方法之后。

```swift
self.setBadgeNumbers()
```

这样，当一个通知被触发的时候，角标的值会被自动更新。

## 如何让通知反复触发

`UILocalNotificaiton`实例有个属性，叫`repeatInterval`，可以让通知以一个固定的时长反复触发。这种方法可以很好的避免通知数量 64 的这个上限，而且一个重复的通知只会被计算一次。

不幸的是，在我们的应用中，只能在`repeatInterval`和`applicationIconBadgeNumber`中选择一个。角标值会在每次通知被触发的时候更新。较旧的通知可能会被新的通知终结，而且恰好新的通知是重复的通知（一个重复的通知只会被计算一次），即导致角标的值会比预计的小。我们可以设置两个通知，一个是重复的通知会显示提醒和播放提示音，另一个是非重复的通知会更新角标值，会发现测试的结果角标值只有预想的一半。

重复通知的最大局限是重复的间隔（repeatInterval）不接受自定义值。你必须提供一个`NSCalendarUnit`值，例如`HourCalendarUnit`或`DayCalendarUnit`。假如，如果你希望设置的通知每 30 分钟触发一次，那么可以通过设置两个通知（两者之间间隔 30 分钟，并都以一小时重复触发）来解决。当然了，如果你希望是每 31 分钟触发一次，那就没办法了。

## 后台执行通知动作

iOS 8 引进了一个很有用的新特性：通知动作（notification actions），它可以让通知由用户来触发，甚至用户没有打开应用都可以触发。让我们来实现这个功能吧：从通知横幅上直接完成或等会提醒待办项。

<div style="max-width:300px;">
![](/img/articles/local-notifications-in-ios-8-with-swift-part-2/iOS-Simulator-Screen-Shot-Feb-6-2015-12.43.34-AM.png1444269938.316587)![](/img/articles/local-notifications-in-ios-8-with-swift-part-2/iOS-Simulator-Screen-Shot-Feb-6-2015-12.43.37-AM.png1444269938.705509)
</div>

`AppDelegate`文件里可以这样写：

```swift
func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {
  let completeAction = UIMutableUserNotificationAction()
  completeAction.identifier = "COMPLETE_TODO"
  completeAction.title = "Complete"
  completeAction.activationMode = .Background
  completeAction.authenticationRequired = false
  completeAction.destructive = true
  let remindAction = UIMutableUserNotificationAction()
  remindAction.identifier = "REMIND"
  remindAction.title = "Remind in 30 minutes"
  remindAction.activationMode = .Background
  remindAction.destructive = fal  
  let todoCategory = UIMutableUserNotificationCategory()
  todoCategory.identifier = "TODO_CATEGORY"
  todoCategory.setActions([remindAction, completeAction], forContext: .Default)
  todoCategory.setActions([completeAction, remindAction], forContext: .Minimal)
  application.registerUserNotificationSettings(UIUserNotificationSettings(forTypes: .Alert | .Badge | .Sou  categories: NSSet(array: [todoCategory])))
  return true
}
```

值得注意的是，上面的代码中我们调用了`todoCategory.setActions()`两次，分别设置了动作上下文（action contexts）。如果通知是以横幅（banner）的形式显示，那么通知动作会以迷你形式（minimal context）显示出来。如果通知是以（默认的）提示（alert） 形式显示，通知动作会显示至少 4 个操作。如下图。

<div style="max-width:300px;">
![](/img/articles/local-notifications-in-ios-8-with-swift-part-2/iOS-Simulator-Screen-Shot-Feb-6-2015-12.41.20-AM.png1444269939.116427)![](/img/articles/local-notifications-in-ios-8-with-swift-part-2/iOS-Simulator-Screen-Shot-Feb-6-2015-12.06.33-AM.png1444269939.455359)
</div>

我们传递到`setActions:`方法里的通知动作的顺序会一一对应的呈现在 UI 里，但是很奇怪的是，迷你形式里通知动作的顺序是以从右向左排列的方式显示的。

下面的代码是为了确保通知的`category`是为 TodoList 的`addItem:`方法设置的。

```swift
notification.category = "TODO_CATEGORY"
```

到此，我们已经可以用`removeItem:`方法来实现完成待办项，现在我们需要在 TodoList 里实现过会提醒的功能。

```swift
func scheduleReminderforItem(item: TodoItem) {
  var notification = UILocalNotification()
  notification.alertBody = "Reminder: Todo Item \"\(item.title)\" Is Overdue"
  notification.alertAction = "open"
  notification.fireDate = NSDate().dateByAddingTimeInterval(30 * 60)
  notification.soundName = UILocalNotificationDefaultSoundName
  notification.userInfo = ["title": item.title, "UUID": item.UUID]
  notification.category = "TODO_CATEGOR  
  UIApplication.sharedApplication().scheduleLocalNotification(notification)
}
```

值得注意的是，我们并没有修改待办项的到期日期（或者试着取消原来的通知，虽然已经被自动删除）。现在，回到`AppDelegate`里，实现`actions:`里的处理。

```swift
func application(application: UIApplication, handleActionWithIdentifier identifier: String?, forLocalNotification notification: UILocalNotification, completionHandler: () -> Void) {
  var item = TodoItem(deadline: notification.fireDate!, title: notification.userInfo!["title"] as String, UU  notification.userInfo!["UUID"] as String!)
  switch (identifier!) {
      case "COMPLETE_TODO":
      TodoList.sharedInstance.removeItem(item)
  case "REMIND":
      TodoList.sharedInstance.scheduleReminderforItem(item)
  default:
      println("Error: unexpected notification action identifier!")
  }
  completionHandler()
}
```

终于可以试着运行这个应用了（为了测试方便，建议将`dateByAddingTimeInterval:`设置一个较小的值）。
<div style="max-width:300px;">
![](/img/articles/local-notifications-in-ios-8-with-swift-part-2/iOS-Simulator-Screen-Shot-Feb-6-2015-1.25.36-AM.png1444269939.847281)
</div>
我们讨论了所有的非地理上（注：上一集讲到的用户进入和离开某个地理区域时，可以触发本地通知的功能）的 UILocalNotification 功能，现在已经有一个功能较全的待办项应用了，所以本系列教程到此结束。你可以在[这里](https://github.com/jasonbnewell/LocalNotificationTutorials/tree/part2_simplified)下载工程的源代码。
