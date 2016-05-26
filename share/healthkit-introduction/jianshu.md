用 HealthKit 来开发一个健身 App"

> 作者：AppCoda，[原文链接](http://www.appcoda.com/healthkit-introduction/)，原文日期：2016-03-22
> 译者：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[Cee](https://github.com/Cee)
  









看新闻我们也知道，比起历史上任何一个时刻，健身和健康在今天都更加重要。说起来也挺好笑的，我似乎记得几天前新闻也在说同样的事情，也许是因为年纪越来越大的缘故，我更需要健康和健身。不管怎么说，这是一个热门话题。随着技术的不断进步，手机应用和硬件在世界范围内都变得流行起来，这些都给日益流行的健身健康话题加入了新的元素。

HealthKit 是苹果公司的重要桥梁，把追踪的重要的健康数据同有健康意识的科技消费者、运动迷、平常使用 iPhone 的人连接了起来。这很酷，用户可以很容易的就追踪衡量一段时间内的健身和健康数据，除了意识到的好处之外，我们看到图标中向上走的曲线，就能给我们极大的鼓励，激励我们继续运动。



正如我们能想象到的，在管理健康信息时，数据安全成为非常重要的因素。HealthKit 对于所有的 HealthKit 信息有绝对的控制权，会直接传递到用户手中。用户可以准许或者拒绝任何 App 获取他们的健康数据的请求。

对于开发者来说，我们需要请求许可方能读取或者写入 HealthKit 数据。实际上，我们需要特别声明一下，我们想影响获取具体哪些数据。另外，任何使用 HealthKit 的 App 必须要包含一份 Privacy Policy（隐私协议），这样用户在进行信息交易时会觉得更舒服一些。

### 关于走路一小时（OneHourWalker） 

今天，我们要创建一个非常有趣的 App，既能读取 HealthKit 中的信息，也能写入新的数据。看一下 OneHourWalker 的外表吧：

![](http://www.appcoda.com/wp-content/uploads/2016/03/screenshots.png)

OneHourWalker 是一个健身 App，能够跟踪用户在一个小时内走路或跑步的距离。用户可以把距离分享到 HealthKit，这样就能在健康应用中查看。我知道，整整一个小时听起来确实有点吓人，至少对我而言是这样。因此，用户可以提前结束健身，此时仍然可以分享距离。

所以，听起来只需要把数据写入 HealthKit 即可。不过我们要读取的数据是什么？

好问题！我喜欢在树林里的小路上漫步。我常常穿越一些枝杈纵横的区域。因为我是八尺大汉，这会带来一些问题。我们的解决方案是：我们会从 HealthKit 中读取用户的身高，然后显示到 Label 控件上。这样会比较友好地提示用户，帮他避免不适合运动的区域。

下面是 OneHourWalker 的[初始工程](https://raw.githubusercontent.com/appcoda/OneHourWalker/master/OneHourWalker.zip)，下载然后运行，看起来好像 App 可以运行。计时器和定位系统都已经在运行了，所以我们只需要将注意力放在使用 HealthKit 上，注意一下，六十分钟后，计时器和定位系统就会自动停止。

### 启用 HealthKit

第一步就是在应用中开启 HealthKit 功能，在 Project Navigator 中，选中 OneHourWalker，然后点击 Targets 下方的 OneHourWalker。接着，在屏幕上方的 tab 栏中点击 Capabilities。

![](http://www.appcoda.com/wp-content/uploads/2016/03/capabilities.png)

在 Capabilities 底部把 `HealthKit` 设置为 On。这会把 HealthKit entitlement 添加到 App ID 中、把 HealthKit key 添加到 info plist 文件中、把 HealthKit entitlement 添加到资格文件中、连接 `HealthKit.framework`。就是这么简单。

### 开始写代码吧

找到 `TimerViewController.swift`，下面我们给 OneHourWalker 添加 HealthKit。首先我们创建一个 HealthKitManager 实例。

    
    import UIKit
    import CoreLocation
    import HealthKit
    
    class TimerViewController: UIViewController, CLLocationManagerDelegate {
    
        @IBOutlet weak var timerLabel: UILabel!
        @IBOutlet weak var milesLabel: UILabel!
        @IBOutlet weak var heightLabel: UILabel!
        
        var zeroTime = NSTimeInterval()
        var timer : NSTimer = NSTimer()
        
        let locationManager = CLLocationManager()
        var startLocation: CLLocation!
        var lastLocation: CLLocation!
        var distanceTraveled = 0.0
        
        let healthManager:HealthKitManager = HealthKitManager()

`HealthKitManager.swift` 里包含了所有和 HealthKit 有关的操作。里面有一些重要的方法，稍后我们会实现它。

正如开头介绍的那样，我们需要获取用户的授权，从而读取和写入他们的健康数据。在 `ViewDidLoad()`中获取授权：

    
        override func viewDidLoad() {
            super.viewDidLoad()
    
            locationManager.requestWhenInUseAuthorization();
            
            if CLLocationManager.locationServicesEnabled(){
                locationManager.delegate = self
                locationManager.desiredAccuracy = kCLLocationAccuracyBest
            }
            else {
                print("Need to Enable Location");
            }
            
            // 不向用户请求许可就无法获取用户的 HealthKit 数据
            getHealthKitPermission()
        }

`getHealthKitPermission()` 方法会调用 manager 的 `authorizeHealthKit()` 方法。如果一切顺利，我们可以调用 `setHeight()` 方法，稍后我们会介绍这个方法。

    
        func getHealthKitPermission() {
            // 在 HealthKitManager.swift 文件里寻找授权情况。
            healthManager.authorizeHealthKit { (authorized,  error) -> Void in
                if authorized {
                    
                    // 获得然后设置用户的高度
                    self.setHeight()
                } else {
                    if error != nil {
                        print(error)
                    }
                    print("Permission denied.")
                }
            }
        }

在 `HealthKitManager.swift` 文件中创建 `authorizeHealthKit()` 方法。除此之外，我们还需要创建 HealthKit store，将 App 连接到 HealthKit 数据。

    
        let healthKitStore: HKHealthStore = HKHealthStore()
        
        func authorizeHealthKit(completion: ((success: Bool, error: NSError!) -> Void)!) {
            
            // 声明我们想从 HealthKit 里读取的健康数据的类型
            let healthDataToRead = Set(arrayLiteral: HKObjectType.quantityTypeForIdentifier(HKQuantityTypeIdentifierHeight)!)
            
            // 声明我们想写入 HealthKit 的数据的类型
            let healthDataToWrite = Set(arrayLiteral: HKObjectType.quantityTypeForIdentifier(HKQuantityTypeIdentifierDistanceWalkingRunning)!)
            
            // 以防万一 OneHourWalker 在 iPad 中打开
            if !HKHealthStore.isHealthDataAvailable() {
                print("Can't access HealthKit.")
            }
            
            // 请求可以读取和写入数据的权限
            healthKitStore.requestAuthorizationToShareTypes(healthDataToWrite, readTypes: healthDataToRead) { (success, error) -> Void in
                if( completion != nil ) {
                    completion(success:success, error:error)
                }
            }
        }

当我们请求授权获取用户健康数据时，需要特别表明我们只是想读取和写入数据。对于这个应用来说，我们想读取用户的身高，从而帮助他们避免撞到树枝。我们期望 HealthKit 提供一个 HKObject 实体，我们可以把它转换成可读性更高的身高值。此外，我们还需要申请写入权限，从而把用户步行和跑步的距离写入 HKObject 实体。

我们会在处理完 iPad 屏幕适配之后发起权限请求。

我们在 `HealthKitManager.swift` 文件中创建 `getHeight()` 方法，从 HealthKit 中读取用户的高度数据。

    
        func getHeight(sampleType: HKSampleType , completion: ((HKSample!, NSError!) -> Void)!) {
            
            // 创建断言，以查询高度
            let distantPastHeight = NSDate.distantPast() as NSDate
            let currentDate = NSDate()
            let lastHeightPredicate = HKQuery.predicateForSamplesWithStartDate(distantPastHeight, endDate: currentDate, options: .None)
            
            // 获得最近的高度值
            let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)
    
            // 从 HealthKit 里获取最近的高度值
            let heightQuery = HKSampleQuery(sampleType: sampleType, predicate: lastHeightPredicate, limit: 1, sortDescriptors: [sortDescriptor]) { (sampleQuery, results, error ) -> Void in
                    
                    if let queryError = error {
                        completion(nil, queryError)
                        return
                    }
    
                    // 把第一个 HKQuantitySample 作为最近的高度值
                    let lastHeight = results!.first
                
                    if completion != nil {
                        completion(lastHeight, nil)
                    }
            }
            
            // 是时候执行查询了
            self.healthKitStore.executeQuery(heightQuery)
        }

查询身高数据的第一步是创建一个断言，用它定义时间参数。我们会获取一段时间内的所有身高信息。当然，这会返回一个数组。我们只想要最近的身高，所以我们对数据排序，让数据中最新的数据排在最前面。

在创建查询的过程中，我们把数组的长度限制为一。处理完可能出现的错误之后，我们把第一个也是唯一一个 item 作为 lastHeight 的结果。接着，调用 getHeight() 的回调函数。最后，执行我们的查询操作。

回到 `TimerViewController.swift`，在用户授权完成之后，用户开始使用 App 之前，需要在 `getHealthKitPermission()` 中调用 `setHeight()`。

    
    var height: HKQuantitySample?

首先，我们需要给 HKQuantitySample 实例声明一个高度变量。

    
        func setHeight() {
    
            // 创建高度 HKSample。
            let heightSample = HKSampleType.quantityTypeForIdentifier(HKQuantityTypeIdentifierHeight)
            
            // 调用 HealthKitManager 的 getSample() 方法，来获取用户的高度。
            self.healthManager.getHeight(heightSample!, completion: { (userHeight, error) -> Void in
                
                if( error != nil ) {
                    print("Error: \(error.localizedDescription)")
                    return
                }
                
                var heightString = ""
                
                self.height = userHeight as? HKQuantitySample
                
                // 把高度转换成用户本地的计量单位。
                if let meters = self.height?.quantity.doubleValueForUnit(HKUnit.meterUnit()) {
                    let formatHeight = NSLengthFormatter()
                    formatHeight.forPersonHeightUse = true
                    heightString = formatHeight.stringFromMeters(meters)
                }
                
                // 设置 label 显示用户的高度。
                dispatch_async(dispatch_get_main_queue(), { () -> Void in
                    self.heightLabel.text = heightString
                })
            })
            
        }

在 `share()` 方法之前创建 `setHeigth()` 方法。我们请求的身高数据会返回一个 `HKQuantity`，它的 identifier 是 `HKQuantityTypeIdentifierHeight`。

接着，我们调用 manager 中的 `getHeight()` 方法。有了身高数据，我们需要将它转换成合适的字符串，展示到我们的 Label 控件中。照例，我们要考虑所有可能的错误。

现在，用户能够打开 App，查看他们的身高，将身高记录到健康应用中，开始计时，然后追踪跑步或者走路的距离。下一步就是处理写入数据，让用户可以记录所有的健身数据。

用户完成运动之后（无论是整整一小时还是不到一小时），他/她会点击 Share 按钮，将他们的距离发送给 Health 应用。所以我们在 `share()` 方法中调用 `HealthKitManager.swift` 里的 `saveDistance()` 方法，这样数据和日期都能被归档，明天用户可以试着去挑战他/她自己的记录！

    
        @IBAction func share(sender: AnyObject) {
            healthManager.saveDistance(distanceTraveled, date: NSDate())
        }

回到 manager，我们创建 `saveDistance()` 方法，首先，我们需要让 HealthKit 知道我们想写入跑步距离和走路步数，接着，我们将计量单位换成英里并赋值给实体。HealthKit 的 `saveObject()` 方法将会写入用户的健康数据。

    
        
        func saveDistance(distanceRecorded: Double, date: NSDate ) {
                    
            // 设置跑步距离或走路步数的数量的类型
            let distanceType = HKQuantityType.quantityTypeForIdentifier(HKQuantityTypeIdentifierDistanceWalkingRunning)
            
            // 把计量单位设置成英里
            let distanceQuantity = HKQuantity(unit: HKUnit.mileUnit(), doubleValue: distanceRecorded)
    
            // 设置正式的 Quantity Sample。
            let distance = HKQuantitySample(type: distanceType!, quantity: distanceQuantity, startDate: date, endDate: date)
            
            // 保存距离数量，把健康数据写入 HealthKit
            healthKitStore.saveObject(distance, withCompletion: { (success, error) -> Void in
                if( error != nil ) {
                    print(error)
                } else {
                    print("The distance has been recorded! Better go check!")
                }
            })
        }

打开健康应用，记录的数据会包含在 Walking + Running Distance 里。我们可以查看具体的记录：Health Data tab > Fitness > Walking + Running Distance > Show All Data。我们的数据就在这清单里。点击任意一行就会看到我们的图标（目前还空着）。再次点击这一行，就会出现所有的详细信息。

![](http://www.appcoda.com/wp-content/uploads/2016/03/details.png)

有了 OneHourWalker，我们就可以为全世界 iOS 用户的健康贡献我们的力量。然而，这仅仅是一个开始。HealthKit 有无限可能。

当然，让用户查看所有追踪信息非常有用，人们可以对比每天、每周或者任意时间的数据，从而给自己动力。但是真正有价值的是，开发者可以用无数种新的、有创造力的、有趣的方式来获取数据。

此外，HealthKit 应用的测试会非常有趣！

这里是我们最终版本的 [OneHourWalker](https://github.com/appcoda/OneHourWalker)。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。