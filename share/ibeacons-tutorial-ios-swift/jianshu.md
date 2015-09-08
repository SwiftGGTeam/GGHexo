iBeacons iOS 和 Swift 教程

> 原文链接：[iBeacons Tutorial with iOS and Swift](http://www.raywenderlich.com/101891/ibeacons-tutorial-ios-swift)
> 原文日期：2015/08/07
> 
> 译者：[SergioChan](https://github.com/SergioChan)
> 校对：[numbbbbb](https://github.com/numbbbbb)
> 定稿：[shanks](http://codebuild.me)




> 升级提示：这篇教程已经由 Adrian Strahan 更新到支持 iOS8、Swift 1.2 和 Xcode6.3。[原始文章](http://www.raywenderlich.com/66584/ios7-ibeacons-tutorial)由 Tutorial Team 成员[Chris Wagner](http://www.raywenderlich.com/u/cwagdev)所写。

你有没有想过有一天你可以在一个类似购物商场或者棒球场这么巨大的建筑中通过手机找到你所在的位置？

当然可以，GPS 可以告诉你具体位置，但是要想在这些钢筋混凝土建筑中获得精确的 GPS 信号可不是件容易的事。你需要通过建筑内部的某种设施来精确定位你的设备的物理坐标。



![使用 Core Location 和 iBeacons 追踪手机位置！](http://swift.gg/img/articles/ibeacons-tutorial-ios-swift/iBeacons-250x250.png)

来看看 [iBeacon](http://en.wikipedia.org/wiki/IBeacon) 吧！在本教程中你将会创建一个应用程序，它可以关联 `iBeacon` 发射器并且在你的手机离开发射器范围的时候收到通知。在实际使用中，你可以将 `iBeacon` 发射器放置在任何你觉得重要的东西上—手提电脑包，钱包，甚至你猫咪的项圈上，通过这个应用程序来追踪。一旦你的设备离开了这些发射器的有效范围，应用程序就能检测到变化并通知你。

如果想跟着教程动手做，你需要一台 iOS 真机和一个 `iBeacon` 设备。如果你没有 `iBeacon` 但是有另一个 iOS 设备， 也可以把它当做一个`iBeacon`来用，往下读吧！

## 如何开始

其实有很多的 `iBeacon` 设备，[谷歌搜索](https://www.google.com/search?client=safari&rls=en&q=ibeacon+hardware&ie=UTF-8&oe=UTF-8)里可以找到很多信息。苹果介绍 iBeacon 时宣称任意 iOS 设备都可以当做一个 `iBeacon` 使用。下面是可以当做 `iBeacon` 使用的设备列表：

-     iPhone 4s 或更新的设备
-     第三代 iPad 或更新的设备
-     iPad Mini 或更新的设备
-     第五代 iPod touch 或更新的设备

> 小贴士：如果你没有 iBeacon 发射器但是有另一台iOS设备并且支持 iBeacons，可以遵照章节22—*What’s new in Core Location of [iOS 7 by Tutorials](http://www.raywenderlich.com/?page_id=48020)* 去创建一个模拟 `iBeacon` 功能的应用程序并把它当做 iBeacon 发射器使用。

`iBeacon` 其实就是一个低功耗蓝牙设备，通过一种特定的数据结构来广播信息。这些结构的介绍超出了这篇教程的范畴，重要的是知道 iOS 可以监听 `iBeacon` 发出的三种值，分别是 `UUID`、 `major` 和 `minor`。

`UUID` 是 *universally unique identifier* 的首字母缩写，这是一个 128 位的值，通常以 16 进制字符串来显示，例如：`B558CBDA-4472-4211-A350-FF1196FFE8C8`。在 `iBeacon` 应用中，`UUID`通常用来标识顶层身份。

主值（major）和副值（minor）则在`UUID`的基础上提供了更细粒度的划分。这两个值都是 16 位无符号整数，他们可以唯一标识每个 `iBeacon` ，甚至可以区分那些`UUID`相同的设备。

比方说，你有很多个百货商场，这些商场中的 `iBeacon` 设备可以拥有相同的`UUID`。虽然所有设备都有相同的`UUID`，但是每个商场都会有它自己的主值，商场中的每个商店都会有一个副值。这样你的应用程序就可以根据其中的一个 `iBeacon` 设备定位到你在迈阿密，佛罗里达分店的鞋店。

## ForgetMeNot(勿忘我)新手项目

这个新手项目的名称叫做“ForgetMeNot(勿忘我)”。你可以在[这里](http://cdn1.raywenderlich.com/wp-content/uploads/2015/04/ForgetMeNot-Swift-starter-project2.zip)下载到源代码，它包括了一个支持增删元素的 `TableView` 界面。每个元素表示一个`iBeacon`发射器，在现实世界中，你可以将它们理解成那些你想监控的物体。

编译和运行应用程序，你会看到一个空的列表，什么也没有。点击右上方的 + 按钮来添加一个物品，如下图所示：

![初次运行](http://swift.gg/img/articles/ibeacons-tutorial-ios-swift/firstlaunch.png)

要添加一个物品，只需要输入物品的名称和`iBeacon`所对应的值。你可以在`iBeacon`的文档中找到它的`UUID`，尝试添加一下，或者随意输入一些占位值：

![添加一个物品](http://swift.gg/img/articles/ibeacons-tutorial-ios-swift/additem.png)

点击 `Save` 回到物品列表，你会看到一个位置未知的物品：

![已添加物品的列表](http://swift.gg/img/articles/ibeacons-tutorial-ios-swift/itemadded.png)

你可以根据自己的需要来添加更多的物品，也可以滑动删除已经添加的物品。`NSUserDefaults`会持久化存储列表中的物品，所以重新打开应用程序也不会丢失这些数据。

表面上看什么事都没发生，其实大多数有趣的东西都隐藏在界面背后！这个应用程序里最独特的地方就是用来表示列表中的物品的`Item`模型类。

在 Xcode 中打开`Item.swift`。这个类映射了界面上所显示的属性，并且遵守`NSCoding`协议，这样这个类可以实现序列化和反序列化，并且可以进行持久化存储。

现在再来看看`AddItemViewController.swift`。这是一个用来添加新物品的控制器。它是个简单的`UITableViewController`，除此之外还做了一些用户输入的合法性验证来保证用户输入的名称和`UUID`是合法的。

页面右上方的`Save`按钮会在`nameTextField`和`uuidTextField`都满足合法性验证条件的时候变成可点击的状态。

现在你已经熟悉了这个项目，可以开始加入`iBeacons`啦！

## Core Location 授权

你的设备不会自动监听其他的 `iBeacon` 设备，需要进行设置。`CLBeaconRegion` 这个类代表一个 `iBeacon`，`CL`前缀表示这是 `Core Location` 框架的一部分。

因为 `iBeacon` 是通过蓝牙来进行数据传输的，因此它和 `Core Location` 有关乍一看很奇怪，但是仔细想想就会明白，`iBeacon`提供的是高精度的定位信息，而较低精度的定位信息则需要通过 GPS 来获取。如果你把一个 iOS 设备当做 `iBeacon` 使用，那就必须使用 `Core Bluetooth` 框架进行平衡，但是当你使用真正的 `iBeacon` 设备时，只需要掌握 `Core Location` 就够了。

好了，接下来开始做第一件事：让 `Item` 适用于 `CLBeaconRegion`。

打开 `Item.swift`，在文件的头部加上如下引用：

```swift
import CoreLocation
```

接下来，修改一下 `majorValue` 和 `minorValue` 的定义，如下所示：

```swift
let majorValue: CLBeaconMajorValue
let minorValue: CLBeaconMinorValue
 
init(name: String, uuid: NSUUID, 
		majorValue: CLBeaconMajorValue, 
		minorValue: CLBeaconMinorValue) {
  self.name = name
  self.uuid = uuid
  self.majorValue = majorValue
  self.minorValue = minorValue
}
```

`CLBeaconMajorValue` 和 `CLBeaconMinorValue` 都是 `UInt16` 的别名，在 `CoreLocation` 框架中分别用来表示 `major` 和 `minor` 值。

尽管他们底层的数据类型一样，使用不同的命名能够增强可读性，同时能够增强安全性 —— 因为你不会轻易的弄混他们。

继续！打开 `ItemsViewController.swift`，同样在文件头部引用 `CoreLocation`：

```swift
import CoreLocation
```

然后将下面的属性添加到 `ItemsViewController`：

```swift
let locationManager = CLLocationManager()
```

这个 `CLLocationManager` 实例会成为 `CoreLocation` 的入口。

接下来，用下面的方法替换掉你的 `viewDidLoad()`：

```swift
override func viewDidLoad() {
  super.viewDidLoad()
 
  locationManager.requestAlwaysAuthorization()
 
  loadItems()
}
```

调用 `requestAlwaysAuthorization()` 将会提示用户授权访问位置服务 —— 当然如果他们已经授权，系统的提示就不会出现。`Always（始终）` 和 `When in Use（使用应用程序期间）` 是 iOS 8 中位置服务权限的新形式。如果用户给应用程序授权了 `Always（始终）` ，那无论是前台还是后台运行，应用程序都调用任何可用的位置服务。

由于这篇教程将会使用 `iBeacon` 的区域监听功能，你需要选择 `Always（始终）` ，这样我们才可以在任何时候监听到设备的事件。

iOS 8 要求你在 `Info.plist` 中设置一个字符串作为获取用户位置信息的时候展示给用户的提示信息。如果你没有设置这个，位置服务不会生效，编译器甚至都不会发出警告。

打开 `Info.plist` 并点击 `Information Property List` 这一行上的 + 来添加一项。

![image](http://swift.gg/img/articles/ibeacons-tutorial-ios-swift/plistwithoutentry.png)

不幸的是，你需要添加的键并不在预先定义好的下拉列表里，所以需要手动输入键的名称。将这个键命名为 `NSLocationAlwaysUsageDescription` 并且保证它的类型是 `String`。接着，写上你需要从用户那里获取位置信息的原因，比方说： “ForgetMeNot would like to teach you how to use iBeacons!”。

![image](http://swift.gg/img/articles/ibeacons-tutorial-ios-swift/plistwithentry.png)

编译运行你的应用程序，你将会看到一个获取位置信息的提示信息：

![允许获取位置信息](http://swift.gg/img/articles/ibeacons-tutorial-ios-swift/allowlocation-281x500.jpg)

选择同意，这样程序就可以追踪你的 `iBeacon` 的位置啦。

## 监听你的 `iBeacon`

现在你的应用程序已经拥有了必要的位置信息获得权限，是时候去找到这些设备了！在 `ItemsViewController.swift` 的底部添加如下的类扩展：

```swift
// MARK: - CLLocationManagerDelegate
 
extension ItemsViewController: CLLocationManagerDelegate {
}
```

这将声明 `ItemsViewController` 遵守 `CLLocationManagerDelegate` 协议。你可以在这个扩展中添加委托方法的实现，这样就可以很好地把他们组织到一起。

接下来，在 `viewDidLoad()` 的结尾加上下面这行：

```swift
locationManager.delegate = self
```

这会将 `CLLocationManager` 的委托指向 `self`，从而接收委托方法的回调。

现在你拥有了一个 `CLLocationManager` 实例，可以使用 `CLBeaconRegion` 来让应用程序监听指定区域啦！如果注册了一个需要监听的区域，无论程序是否启动这些区域都一直存在。这样即使你的程序没有运行，也可以监听区域边界的触发事件。

列表中的 `iBeacon` 设备对应的是 `items` 数组中的 `Item` 模型。`CLLocationManager` 需要传入 `CLBeaconRegion` 实例。

在 `ItemsViewController.swift` 中的 `ItemsViewController` 类中创建下述方法：

```swift
func beaconRegionWithItem(item:Item) -> CLBeaconRegion {
  let beaconRegion = CLBeaconRegion(proximityUUID: item.uuid,
                                            major: item.majorValue,
                                            minor: item.minorValue,
                                       identifier: item.name)
  return beaconRegion
}
```

这会用输入的 `Item` 对象创建一个新的 `CLBeaconRegion` 实例。

可以看到这些类在结构上很相似，因此可以直接创建 `CLBeaconRegion` 实例 —— 它有对应的 `UUID` 、 `major value` 和 `minor value` 属性。

现在你需要一个方法来监听设备。接下来在 `ItemsViewController` 中添加下述方法：

```swift
func startMonitoringItem(item: Item) {
  let beaconRegion = beaconRegionWithItem(item)
  locationManager.startMonitoringForRegion(beaconRegion)
  locationManager.startRangingBeaconsInRegion(beaconRegion)
}
```

这个方法需要传入一个 `Item` 的实例，通过刚才定义的方法生成一个 `CLBeaconRegion` 实例，然后让 `locationManager` 开始监听给定的区域，并且在这个区域内搜索 `iBeacon`。

搜索是在指定区域发现 `iBeacon` 设备并确定距离的过程。当一个 iOS 设备收到来自 `iBeacon` 设备的传输信息时，能够较为精确的计算出从 `iBeacon` 到 iOS 设备的距离。这个距离（在发送消息的 `iBeacon` 和接收消息的设备之间的距离）被分类成3种不同的范围：

* `Immediate` 只有几厘米
* `Near` 几米以内
* `Far` 10米以上

> 小贴士：`Far`，`Near`，`Immediate` 三种范围的确切距离并没有明确的在文档中给出，但是这个[ StackOverflow 的提问](http://stackoverflow.com/questions/19007306/what-are-the-nominal-distances-for-ibeacon-far-near-and-immediate)对这些距离的确切值提供了一个大致的范围。

默认情况下，无论你的应用是否在运行，监控程序都会在区域有物体进入和离开的时候通知你。搜索的不同之处是可以在应用运行的状态下监听物体在区域中的距离。

你还需要在删除设备时停止对它的区域的监听，在 `ItemsViewController` 中添加下面的方法：

```swift
func stopMonitoringItem(item: Item) {
  let beaconRegion = beaconRegionWithItem(item)
  locationManager.stopMonitoringForRegion(beaconRegion)
  locationManager.stopRangingBeaconsInRegion(beaconRegion)
}
```

上述方法只是反转了 `startMonitoringItem(_:)` 产生的结果并且让 `CLLocationManager` 停止监听和搜索操作。

现在你已经完成了开始和结束的方法，是时候让他们发挥作用了！开始监听最合适的时机自然是用户向列表中添加新设备时。

看一看 `ItemsViewController.swift` 中的 `saveItem(_:)` 方法，这个 `unwind segue` 会在用户点击 `AddItemViewController` 中的保存按钮的时候被调用并且创建一个新的 `Item` 对象。找到方法中对 `persistItems()` 的调用，在这个调用前加上这行代码：

```swift
startMonitoringItem(newItem)
```

这将会在用户保存一个新的 `item` 时开始监听。同理，当应用程序启动的时候，程序会从 `NSUserDefaults` 加载持久化存储的数据，这也意味着你需要在启动的时候调用开始监听的方法。

在 `ItemsViewController.swift` 中找到 `loadItems()` 这个方法然后在内部的 `for` 循环中添加这行代码：

```swift
startMonitoringItem(item)
```

这能保证每一个 `item` 都被监听到。

现在我们要处理删除 `item` 的操作。找到 `tableView(_:commitEditingStyle:forRowAtIndexPath:)` 然后在 `itemToRemove` 的声明之后添加这行代码：

```swift
stopMonitoringItem(itemToRemove)
```

这个 `tableview` 的委托方法会在用户删除任意一行时被调用。现有的代码处理了模型和界面的删除操作，你刚刚添加的那行代码也会使你的程序停止监听这个 `item`。

到现在为止，你已经实现了很多东西！你的程序现在已经能够对指定的 `iBeacon` 设备启动和停止监听了。

现在，你可以编译运行一下程序。但是你会发现，即使 `iBeacon` 设备在应用程序的监听范围内，程序也不会响应任何事件，下面我们来解决这个问题！

## 响应 `iBeacon` 的发现事件

你的 `location manager` 已经在监听 `iBeacon` 设备，下面需要实现一些 `CLLocationManagerDelegate` 方法来响应监听事件。

首要任务是添加一些错误处理，因为你正在处理设备的硬件特性，如果没有详细的错误提示，监听或者搜索失败的时候你根本无从知晓。

在你刚才定义的 `CLLocationManagerDelegate` 委托的类扩展中添加下述两个方法：

```swift
func locationManager(manager: CLLocationManager!, 
monitoringDidFailForRegion region: CLRegion!, 
withError error: NSError!) {
  println("Failed monitoring region: \(error.description)")
}
 
func locationManager(manager: CLLocationManager!, 
didFailWithError error: NSError!) {
  println("Location manager failed: \(error.description)")
}
```

这两个方法会打印出监听 `iBeacons` 时可能出现的错误。

当然，如果一切顺利，你永远也不会看到这两个方法的输出。然而，一旦发生了错误，打印出来的错误信息会非常有用。

下一步我们需要实时显示 `iBeacon` 设备的距离。在 `CLLocationManagerDelegate` 类扩展中添加下述这个方法，它暂时没有返回值：

```swift
func locationManager(manager: CLLocationManager!, didRangeBeacons beacons: [AnyObject]!, inRegion region: CLBeaconRegion!) {
  if let beacons = beacons as? [CLBeacon] {
    for beacon in beacons {
      for item in items {
        // TODO: Determine if item is equal to ranged beacon
      }
    }
  }
}
```

这个委托方法会在 `iBeacon` 设备进入监听范围、离开监听范围或者监听范围改变时被调用。

你的程序会通过这个委托方法提供的 `iBeacon` 数组来更新列表中的数据并且显示它们的距离。你需要先遍历 `beacons` 数组再遍历你的 `items` 数组，从而找到对应的模型。之后我们会回来处理 `TODO`。

进入 `Item.swift`，在 `Item` 类中添加下述属性：

```swift
dynamic var lastSeenBeacon: CLBeacon?
```

这个属性保存了指定 `item` 最后对应的 `CLBeacon` 实例，这会被用来显示距离信息。这个属性有一个 `dynamic` 修饰符，这样你才能在接下来的教程中为其添加一个 `KVO`。

现在在文件底部添加这个函数，重载等式操作符，记得要添加在类的定义之外：

```swift
func ==(item: Item, beacon: CLBeacon) -> Bool {
  return ((beacon.proximityUUID.UUIDString == item.uuid.UUIDString)
    && (Int(beacon.major) == Int(item.majorValue))
    && (Int(beacon.minor) == Int(item.minorValue)))
}
```

这个等式方法会比较一个 `CLBeacon` 实例和一个 `Item` 实例是否相等 —— 这意味着三个主要的属性都相等。在这种情况下，如果一个 `CLBeacon` 实例和一个 `Item` 实例的 `UUID`、 `major value` 和 `minor value` 都相等，这两者就是相等的。

现在你需要通过调用上面的方法来完成搜索的委托方法。打开 `ItemsViewController.swift`，找到 `locationManager(_:didRangeBeacons:inRegion:)`。用下述代码替换掉 `for` 循环中的 `TODO` 注释：

```swift
if item == beacon {
  item.lastSeenBeacon = beacon
}
```

匹配到一个 `item` 对应的 `iBeacon` 设备时设置它的 `lastSeenBeacon`。因为你重载了等式运算符，寻找 `item` 和 `iBeacon` 的对应关系变得非常简单！

现在，是时候使用这个属性来显示搜索到的 `iBeacon` 的距离了。

进入 `ItemCell.swift`，在 `item` 的属性观察器 `didSet` 方法开头添加下述代码：

```swift
item?.addObserver(self, forKeyPath: "lastSeenBeacon", options: .New, context: nil)
```

当你为每一个 `cell` 设置 `item` 时，你同时也添加了一个对 `lastSeenBeacon` 属性的观察器。对应的，你需要移除 `cell` 中已有 `item` 的观察器，这也是 `KVO` 模式的要求。在 `didSet` 后添加一个 `willSet` 属性观察器。确保它仍然在 `item` 属性中。

```swift
willSet {
  if let thisItem = item {
    thisItem.removeObserver(self, forKeyPath: "lastSeenBeacon")
  }
}
```

这能保证只有一个属性正在被观察。

你还需要在 `cell` 被释放时移除观察器。在 `ItemCell.swift` 中的 `ItemCell` 类中添加下述释放方法：

```swift
deinit {
  item?.removeObserver(self, forKeyPath: "lastSeenBeacon")
}
```

现在你已经实现了属性的观察，可以添加一些逻辑来处理 `iBeacon` 的距离变化事件。

每个 `CLBeacon` 实例都有一个名为 `proximity` 的属性，这是一个枚举类型，值为 `Far` 、`Near` 、`Immediate` 和 `Unknown`。

在 `ItemCell.swift` 中，引用 `CoreLocation`：

```swift
import CoreLocation
```

接下来，在 `ItemCell` 类中添加下述方法：

```swift
func nameForProximity(proximity: CLProximity) -> String {
  switch proximity {
  case .Unknown:
    return "Unknown"
  case .Immediate:
    return "Immediate"
  case .Near:
    return "Near"
  case .Far:
    return "Far"
  }
}
```

这会根据 `proximity` 返回一个我们能看懂的字符串，下面会用到它。

现在添加下述方法：

```swift
override func observeValueForKeyPath(keyPath: String, 
ofObject object: AnyObject, 
change: [NSObject : AnyObject], 
context: UnsafeMutablePointer<Void>) {
  if let anItem = object as? Item 
  where anItem == item && keyPath == "lastSeenBeacon" {
    let proximity = nameForProximity(anItem.lastSeenBeacon!.proximity)
    let accuracy = String(format: "%.2f", 
    anItem.lastSeenBeacon!.accuracy)
    detailTextLabel!.text = "Location: \(proximity) (approx. \(accuracy)m)"
  }
}
```

每次 `lastSeenBeacon` 的值变化时都会调用这个方法，它会把 `cell` 的 `detailTextLabel.text` 属性设置为 `CLBeacon` 的感知距离和大致的精度。

后面的那个值也许会因为电子干扰产生波动，即使你的设备和 `iBeacon` 设备都没有移动，也可能会变化，所以用它来计算 `iBeacon` 的精确位置并不可靠。

现在确保你的 `iBeacon` 设备已经添加到程序中，移动设备来改变他们之间的距离。你会看到标签的内容会随着你的移动更新，就像下面这样：

![image](http://swift.gg/img/articles/ibeacons-tutorial-ios-swift/itemnear.jpg)

你可能会发现这个感知距离和精度完全受 `iBeacon` 所在的物理位置影响。如果 `iBeacon` 被放在包或是一个盒子里， 它的信号可能就被屏蔽了 —— 因为它是一个非常低功率的设备，信号很容易被削弱。

在设计程序时牢记这一点 —— 当然，放置 `iBeacon` 设备时也需要注意。

## 通知

到这里看起来我们已经做得足够好了：你有了一个 `iBeacon` 设备列表并且可以实时监听它们和你的距离。但这并不是终极目标。应用程序没有运行时，你仍然需要时刻准备着通知用户，以防他们忘了自己的电脑包或者一不留神丢了猫，甚至更糟——猫带着电脑包跑了！:]

![image](http://swift.gg/img/articles/ibeacons-tutorial-ios-swift/zorro-ibeacon.jpg)

他们看起来很天真对不对？

你可能已经注意到，我们只用很少的代码就实现了 `iBeacon` 的基本功能，添加一个通知功能同样很简单！

进入 `AppDelegate.swift`，添加下述引用：

```swift
import CoreLocation
```

接下来，使 `AppDelegate` 类遵守 `CLLocationManagerDelegate` 协议，在 `AppDelegate.swift` 底部添加下述代码(在右大括号下方)：

```swift
// MARK: - CLLocationManagerDelegate
extension AppDelegate: CLLocationManagerDelegate {
}
```

像之前一样，你需要初始化 `location manager` 并且设置它的委托。

为 `Appdelegate` 类添加一个新的 `locationManager` 属性，并用一个 `CLLocationManager` 实例来初始化它：

```swift
let locationManager = CLLocationManager()
```

然后在 `application(_:didFinishLaunchingWithOptions:)` 的开始处添加下述声明：

```swift
locationManager.delegate = self
```

回想一下，之前我们用 `startMonitoringForRegion(_:)` 来添加并监听区域，它们在应用程序中可以被所有 `location manager` 共享。当一个区域的边界被触发时，`Core Location` 会唤醒你的程序，我们只需完成最后一步：响应这个事件。

还记得刚才你在 `AppDelegate.swift` 中添加的类扩展吗？在里面添加下述方法： 

```swift
func locationManager(manager: CLLocationManager!, didExitRegion region: CLRegion!) {
  if let beaconRegion = region as? CLBeaconRegion {
    var notification = UILocalNotification()
    notification.alertBody = "Are you forgetting something?"
    notification.soundName = "Default"
    UIApplication.sharedApplication().presentLocalNotificationNow(notification)
  }
}
```

`location manager` 会在你离开一个区域时调用上面的方法，这也是你的应用程序有趣的一点。你不需要在靠近笔记本电脑包时收到通知 —— 只有你离开它太远的时候才会。

这里你需要检查 `region` 是否是一个 `CLBeaconRegion` 类的实例，因为它也有可能是 `CLCircularRegion` 的实例 —— 那表示你在监听地理位置区域。检查完毕后发送一个本地的通知，内容为“你是不是遗忘了什么？”。

在 iOS 8 和之后的版本里，无论是本地还是远程推送，应用程序都需要注册想要传递的通知类型。这样系统就可以让用户来选择接受的通知类型。如果相应的通知的类型在你的应用程序中没有被注册，即使你在通知里声明了通知类型，系统也不会显示数量角标和提示信息，也不会有新通知的提示音。

在 `application(_:didFinishLaunchingWithOptions:)` 开头添加下述代码：

```swift
let notificationType:UIUserNotificationType = 
UIUserNotificationType.Sound | UIUserNotificationType.Alert
let notificationSettings = UIUserNotificationSettings(
forTypes: notificationType, 
categories: nil)
UIApplication.sharedApplication().
registerUserNotificationSettings(notificationSettings)
```

这里只是简单地进行声明，当应用收到新通知时，系统会显示提示消息并播放提示音。

编译运行你的程序，确保程序里有至少一个已注册的 `iBeacon` 设备，然后按下 `Home` 键让程序在后台运行。这是一个现实生活中的场景，特别是当你正在使用其他程序（比如 Ray Wenderlich 的教学应用 :]）或者做其他事情时，你需要应用程序主动提醒你。现在拿走你的 `iBeacon`，一旦离得足够远，你就会看到弹出来的通知：

![image](http://swift.gg/img/articles/ibeacons-tutorial-ios-swift/notification.jpg)

> 小贴士：文档中并没有说，但是苹果会延迟离开区域的通知。这也许是故意的，这样你的应用程序就不会收到一大堆推送，特别是当你正在区域的边缘来回移动或者 `iBeacon` 设备的信号时断时续的时候。根据我的经验来看，离开区域的通知通常会在 `iBeacon` 设备离开区域差不多一分钟之后出现。

## 我还需要做什么？

无法绑定 `iBeacon` 设备？你可以[在这里](http://cdn3.raywenderlich.com/wp-content/uploads/2015/04/ForgetMeNot-Swift-final-project2.zip)下载最终的工程，这里面有你在这个教程里需要完成的所有东西。

你现在有了一个非常有用的应用程序，可以用它来帮你监控那些容易丢的物品。只需要一点点的想象力和高超的编程技巧，你就可以为这个程序添加许多超级有用的功能：

* 告知用户哪一个设备离开了区域
* 重复发送通知，确保用户看到了通知
* 当`iBeacon`设备回到区域中的时候通知用户

这篇教程只展示了 `iBeacon` 的冰山一角。

`iBeacon` 不仅仅局限于自定义的应用程序，你可以把他们当成 Passbook 的通行证来使用。比方说，如果你运营着一个电影院，你可以将你的电影票以 Passbook 的通行证的形式卖出去。当你的老顾客们走过一个带有 `iBeacon` 设备的收票员的时候，他们的应用程序就会自动的把票显示在他们的手机上了！

如果你关于这篇教程还有任何问题或者评论，或者你对于 `iBeacon` 的使用有什么屌炸天的想法， 请随意的加入下面的讨论吧！



