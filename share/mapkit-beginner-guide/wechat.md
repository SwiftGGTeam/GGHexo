MapKit 使用介绍：大头针和图形渲染"

> 作者：PRANJAL SATIJA，[原文链接](http://www.appcoda.com/mapkit-beginner-guide/)，原文日期：2016-11-13
> 译者：TonyHan；校对：[Cwift](http://weibo.com/277195544)；定稿：[CMB](https://github.com/chenmingbiao)
  









最近 APP 中的地图功能变得越来越流行了。从优步到 Instagram ，再到我的新应用 **[peek](http://getpeeking.com/)** ，地图功能在各种 APP 中都能见到。虽然地图很常见，但是往地图功能添加一些更复杂的功能还是有点挑战的。在这篇文章中，咱们就讨论下在 MapKit 中的大头针和图形渲染，MapKit 是苹果 iOS 系统中的地图库。你在 iOS 系统中看到的许多地图都依赖 MapKit 的强大支撑——当然包括苹果内置地图 APP！MapKit 是一个功能强大、稳定的、健壮的地图库。当然它也很易用，让我们开始吧！



## 准备工作

开始之前，请先下载**[实例程序](https://github.com/appcoda/MapKitDemo/raw/master/MapKitDemoStarter.zip)**。打开之后你会发现这些文件：

- `Places.plist`：这是存储我们要渲染的坐标信息的配置文件。
- `Places.swift`：这个 swift 文件加载 `Places.plist` 文件中的数据并暴露给其他代码。
- `Main.storyboard`：这是我们应用使用的主 storyboard 。里面是一个带有地图视图的视图控制器。我已经搭建好界面和约束了。
- `ViewController.swift`：这是用于控制地图的试图控制器。我已经创建好一个连线来连接 storyboard 中的地图视图。

![](http://www.appcoda.com/wp-content/uploads/2016/11/showing-user-location-1240x775.png)

在构建运行应用之前，还有一件事情需要做：导入 `MapKit.framework` 到我们项目中，这样才能使用 MapKit。有两种方式：一种是手动添加依赖库。点击项目导航中的 *MapKit starter* ，向下滚动到 *Linked Frameworks and Libraries* ：

![](http://www.appcoda.com/wp-content/uploads/2016/11/embedded-binaries-1240x296.png)

点击加号图标添加 `MapKit.framework`。如果 *Embedded Binaries* 中没有自动添加，则在此处也要点击加号添加。

或者，你可以去 *Capabilities* 界面将 *Maps* 选项设置为 `ON`。

![](http://www.appcoda.com/wp-content/uploads/2016/11/mapkit-capabilities-1240x366.png)

现在我们已经准备完毕！编译并运行应用看看会效果！你将会看到 `MKMapView` 占据了整个屏幕。默认情况下，地图视图支持放大、旋转、滚动以及 3D 模式。它还显示有趣的地点，并在主要城市以 3D 显示建筑物。相当酷吧！这篇文章中我们将使用这个地图，泡杯咖啡坐下来，一起进行这项工作吧！

## 用户坐标展示

首先，将用户的坐标展示到地图上是很重要的，这样用户就可以对其所在位置周围的建筑有所感知。很幸运，用 MapKit 很容易做到这一点。打开 Storyboard，选择我们的地图，勾选 User Location 这一项：

![](http://www.appcoda.com/wp-content/uploads/2016/11/showing-user-location-1240x775.png)

如果你想通过代码实现，把下面这一行放到控制器中的 `viewDidLoad` 方法中：

    
    mapView?.showsUserLocation = true

在达到目标前还有几步要完成。现在，MapKit 将会展示用户的位置，但我们还没有申请用户授权。我们来完成这个。

打开 `ViewController.swift` 并且添加一个方法 `requestLocationAccess()`：

    
    func requestLocationAccess() {
        let status = CLLocationManager.authorizationStatus()
        
        switch status {
        case .authorizedAlways, .authorizedWhenInUse:
            return
            
        case .denied, .restricted:
            print("location access denied")
            
        default:
            locationManager.requestWhenInUseAuthorization()
        }
    }

这个方法实现一个简单的目标：检查用户是否授权使用位置并作出响应。如果用户已经授权过，那直接返回，不再有其他操作。如果用户拒绝或限制位置信息使用，则会输出错误信息。否则，我们在应用中会向用户申请使用位置信息。

最后一件事。找到 `Info.plist` 文件。增加一个类型为 `String` 的键 `NSLocationWhenInUseUsageDescription`，然后设置值为 `MapKit starter needs your location so that you can see it on a map.`。通过这个可以告诉用户我们为什么要去请求使用位置信息，从而让用户更倾向于同意访问。从 iOS 8 开始，系统**要求**我们必须添加这段字符信息。

![](http://www.appcoda.com/wp-content/uploads/2016/11/privacy-plist-1240x317.png)

还有一步！在 `ViewController.swift` 中重写 `viewDidLoad()` 方法并调用 `requestLocationAccess()` 方法：

    
    override func viewDidLoad() {
        requestLocationAccess()
    }

再一次编译并运行应用。你会得到一个获取用户信息的提示。点击接受，然后看着吧。现在会显示出你所在的位置。MapKit 会随着用户位置的移动而自动更新坐标。

如果你在用模拟器测试应用，你可以点击调试区域的位置按钮，Xcode 提供了一系列位置信息来模拟用户的位置。

![](http://www.appcoda.com/wp-content/uploads/2016/11/simulate-user-location.png)

现在让我们试试显示更牛逼的内容吧。

## 展示自定义大头针

我们已经知道如何展示用户的坐标了，但是现在，我们需要展示用我们的自己的图片自定义的大头针样式。打开 `Places.plist` 文件，查看其内容。你能看到一个简短的城市列表。由于只是个例子，我们并没有准备太多数据。

    html
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
    <array>
        <dict>
            <key>title</key>
            <string>New York</string>
            <key>description</key>
            <string>Welcome to New York City!</string>
            <key>latitude</key>
            <real>40.7128</real>
            <key>longitude</key>
            <real>-74.0059</real>
        </dict>
        <dict>
            <key>title</key>
            <string>San Francisco</string>
            <key>description</key>
            <string>Welcome to San Francisco!</string>
            <key>latitude</key>
            <real>37.7749</real>
            <key>longitude</key>
            <real>-122.4194</real>
        </dict>
        <dict>
            <key>title</key>
            <string>Los Angeles</string>
            <key>description</key>
            <string>Welcome to Los Angeles!</string>
            <key>latitude</key>
            <real>34.0522</real>
            <key>longitude</key>
            <real>-118.2437</real>
        </dict>
    </array>
    </plist>

列表里有纽约、旧金山和洛杉矶及其经纬度坐标。虽然有关配置文件的知识已经超出了本篇教程的范围，但是你可以在[这篇文章](https://www.appcoda.com/enhance-your-simple-table-app-with-property-list/)里找到关于 `.plist` 配置文件的内容。

打开 `Places.swift` 文件，你会看到一个静态方法，用来获取 `Places.plist` 文件中的所有地点。你不用关心实现，你只需要去调用 `Place.getPlaces()` 方法，便可以返回 `Places.plist` 中的所有地点。让我们在 `ViewController` 中添加一个属性，用来保存所有已加载的地点信息：

    
    let places = Place.getPlaces()

确保 `ViewController.swift` 中的代码如下：

    
    import UIKit
    import MapKit
     
    class ViewController: UIViewController {
        @IBOutlet var mapView: MKMapView?
        let locationManager = CLLocationManager()
        
        let places = Place.getPlaces()
     
        override func viewDidLoad() {
            requestLocationAccess()
        }
        
        func requestLocationAccess() {
            let status = CLLocationManager.authorizationStatus()
            
            switch status {
            case .authorizedAlways, .authorizedWhenInUse:
                return
                
            case .denied, .restricted:
                print("location access denied")
                
            default:
                locationManager.requestWhenInUseAuthorization()
            }
        }
    }

现在，让我们看看关键的地方。下面是在 `MKMapView` 上添加大头针的基本流程：

1. 创建遵从 `MKAnnotation` 协议的对象，扩展已存在的对象也可以。
2. 通过 `addAnnotation(_:)` 在一个 `MKMapView` 实例中添加大头针对象。
3. 创建遵从 `MKMapViewDelegate` 协议的对象并指定其代理为我们的地图视图。
4. 实现 `mapView(_: viewFor:)` 方法，为 `MapKit` 提供需要渲染的大头针视图。

下面我们会实现上面的四个步骤。

## 创建遵从 `MKAnnotation` 协议的对象

`MKAnnotation` 协议定义在 `MapKit` 中，用来给 `MapKit` 提供数据。我们来实现 `MKAnnotation` 协议的要求：

    
    var title: String?
    var subtitle: String?
    var location: CLLocationCoordinate2D

> 任何用来保存或展示大头针的自定义对象都可以通过遵守 MKAnnotation 协议从而使用相关的功能。随后每个对象都会作为地图上大头针的数据源，提供关键的信息，比如大头针在地图上的位置。

如你所料，我们扩展 `Place` 类并遵从 `MKAnnotation` 协议。在 `Place.swift` 中导入 MapKit 并添加 `MKAnnotation` 协议：

    
    extension Place: MKAnnotation { }

编译并运行，啥东西也没有。这是正常的。同时，我们的 `Place` 类也已满足 `MKAnnotation` 的所有的要求。

很好。让我们接着做下一步。

## 向地图视图添加大头针

这步不难。我们只需要告诉 `mapView` 我们已经加载的每一个地点即可。在 `ViewController.swift` 中添加一个方法。命名为 `addAnnotations()`：

    
    func addAnnotations() {
        mapView?.delegate = self
        mapView?.addAnnotations(places)
    }

这并不复杂。将地图视图的代理设置成 `self`。然后，我们将地点大头针添加到地图上。简单吧！继续之前记得在 `viewDidLoad()` 中调用 `addAnnotations()` 方法。

## 遵守 MKMapViewDelegate 协议

接下来我们需要创建一个遵守 `MKMapViewDelegate` 协议的对象。跟 `MKAnnotation` 协议一样，我们需要扩展一个类来实现。如果你之前用过 `UITableView`，那这跟使用 `UITableViewDelegate` 和 `UITableViewDataSource` 相似。我们使用 `ViewController` 的扩展来实现 `MKMapViewDelegate` 协议：

    
    extension ViewController: MKMapViewDelegate {
        func mapView(_ mapView: MKMapView, viewFor annotation: MKAnnotation) -> MKAnnotationView? {
            
        }
    }

上面的代码扩展了 `ViewController` 类，并且添加了向每个大头针返回相应视图的方法。让我们继续：

    
    func mapView(_ mapView: MKMapView, viewFor annotation: MKAnnotation) -> MKAnnotationView? {
        if annotation is MKUserLocation {
            return nil
        }
        
        else {
            let annotationView = mapView.dequeueReusableAnnotationView(withIdentifier: "annotationView") ?? MKAnnotationView()
            annotationView.image = UIImage(named: "place icon")
            return annotationView
        }
    }

很简单是吧？首先我们检查一下大头针是否展示在了用户位置上。如果是，我们不用返回自定义大头针，因为我们希望和往常一样来展示用户的位置。如果没有的话，我们新建一个大头针，我们通过 **[复用队列
](https://en.wiktionary.org/wiki/dequeuing)** 来创建一个新的大头针。这样我们就能有效的复用大头针视图。然后，我们设置大头针视图上的图片（在 `Assets.xcassets` 中使用的图片）。最后，我们返回大头针视图。

## 审查代码

看下 `ViewController.swift` 文件。如果你按照步骤做完，那代码应该是这样的：

    
    import UIKit
    import MapKit
     
    class ViewController: UIViewController {
        @IBOutlet var mapView: MKMapView?
        
        let locationManager = CLLocationManager()
        
        let places = Place.getPlaces()
        
        override func viewDidLoad() {
            requestLocationAccess()
            addAnnotations()
        }
        
        func requestLocationAccess() {
            let status = CLLocationManager.authorizationStatus()
            
            switch status {
            case .authorizedAlways, .authorizedWhenInUse:
                return
                
            case .denied, .restricted:
                print("location access denied")
                
            default:
                locationManager.requestWhenInUseAuthorization()
            }
        }
        
        func addAnnotations() {
            mapView?.delegate = self
            mapView?.addAnnotations(places)
        }
    }
     
    extension ViewController: MKMapViewDelegate {
        func mapView(_ mapView: MKMapView, viewFor annotation: MKAnnotation) -> MKAnnotationView? {
            if annotation is MKUserLocation {
                return nil
            }
                
            else {
                let annotationView = mapView.dequeueReusableAnnotationView(withIdentifier: "annotationView") ?? MKAnnotationView()
                annotationView.image = UIImage(named: "place icon")
                return annotationView
            }
        }
    }

运行应用，你会发现地图中有三个大头针分别对应 `Place.plist` 文件中指定的地点。

![](http://www.appcoda.com/wp-content/uploads/2016/11/mapkit-annotations-1240x739.png)

如果没成功，请往前查看是否遗漏了某一步。如果需要帮助请随时留言。现在我们已经掌握了向 `MKMapView` 添加了大头针的技巧。**[peek](http://getpeeking.com/)** 中就是用这样的方式向用户展示事件发生的位置。大多数带地图功能的应用都使用这个技术来向用户展示指定的地点。

现在我们来看看如何添加图层渲染。

## 展示图层渲染

目前为止，我们已经学会如何展示自定义的大头针以便标注出地图上的地点。接下来我们来学习在地图上绘出图形。例如，我们可能会在每个地点周围画出半径 100 米圆。为了实现这点，我们需要做两件事：

1.在我们的地图上添加遮罩。
2.为每个遮罩指定渲染器，让 MapKit 去渲染这些图层。

## 添加遮罩

首先，需要告诉 MapKit 我们想在地图上展示遮罩。修改 `addAnnotations()`，如下：

    
    func addAnnotations() {
        mapView?.delegate = self
        mapView?.addAnnotations(places)
     
        let overlays = places.map { MKCircle(center: $0.coordinate, radius: 100) }
        mapView?.addOverlays(overlays)
    }

前两行很相似，后面两行代码是新的。我们使用 `map` —— Swift 的集合操作函数，来生成一个基于我们的地点的 `MKCircle` 对象数组。如果你对 `map` 感到陌生，可以理解为 `for` 循环。但是你可以一行代码实现。

接下来，通过 `mapView?.addOverlays(_:)` 添加遮罩。跟添加大头针类似。

## 渲染遮罩

添加遮罩还不够。你只有渲染并设置可见，MapKit 才会去显示这些遮罩。我们对每个地点添加了圆形的遮罩，对应地要对遮罩进行渲染。在 `ViewController` 扩展中添加 `mapView(_: rendererFor:)` 方法：

    
    func mapView(_ mapView: MKMapView, rendererFor overlay: MKOverlay) -> MKOverlayRenderer {
        let renderer = MKCircleRenderer(overlay: overlay)
        renderer.fillColor = UIColor.black.withAlphaComponent(0.5)
        renderer.strokeColor = UIColor.blue
        renderer.lineWidth = 2
        return renderer
    }

正如名字所显示的，这个方法允许我们返回 `MKOverlayRenderer` ，为每个遮罩提供合适的渲染。MapKit 对于圆形的渲染有一个类，叫做 `MKCircleRenderer`。我们创建一个渲染器，并且设置成想要的外观，并将其返回， MapKit 就可以使用渲染器了。

现在你可以再次测试应用。放大纽约、旧金山或洛杉矶，能看到圆形的遮罩。

![](http://www.appcoda.com/wp-content/uploads/2016/11/mapkit-shape-render-1240x740.jpg)

## 总结

通过这篇文章我们学到了很多关于大头针和图形渲染的知识。用这些知识武装自己，你应该能够开发一个带有优雅地图的应用了吧！有啥问题随时都可以评论。

另外，你可以从 [GitHub 上下载 Xcode 项目](https://github.com/appcoda/MapKitDemo)来参考。




> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。