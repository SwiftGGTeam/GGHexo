请求定位权限"

> 作者：IOSCREATOR，[原文链接](https://www.ioscreator.com/tutorials/requesting-permissions-core-location-tutorial)，原文日期：2016-10-13
> 译者：[冬瓜](http://www.desgard.com/)；校对：[Cwift](http://weibo.com/277195544)；定稿：[CMB](https://github.com/chenmingbiao)
  









在 iOS 中用户的位置信息被视为个人隐私，所以在获取时需要向用户请求权限。本篇教程将讲述向用户请求该权限的步骤。开发环境为 Xcode 8 Beta，运行环境为 iOS 10。



打开 Xcode 然后创建一个新的单视图应用（Single View Application）。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57c47d26725e254fbeb982b9/1472494904978/?format=750w)

如图所示，点击 *Next*。将工程名命名为 **IOS10RequestingPermissionTutorial**，自行填写 *Organization Name* 和 *Organization Identifier*。选择 *Swift* 作为编程语言，适配设备选择 *iPhone*。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57c47d68d482e9e39df11e24/1472494967400/?format=750w)

编辑 *Storyboard*。将一个按钮控件拖入主视图。双击按钮视图编辑文字改为 "Get Location"。如下图所示：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57c48dfc20099edbe41a968e/1472499293327/?format=500w)

打开 Assistant Editor 并确保 **ViewController.swift** 文件可见。按住 Ctrl 键从按键控件拖拽到 ViewController 这个类中来创建一个 Action。

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57c48f97f7e0ab2bdc7f9d1d/1472499623179/?format=300w)

转到 ViewController.swift 文件并添加以下代码导入 Conre Location 框架。

    
    import CoreLocation

让 ViewController 遵循 CLLocationManagerDelegate 协议。并修改该类的定义：

    
    class ViewController: UIViewController, CLLocationManagerDelegate {}

增加以下属性：

    
    let locationMgr = CLLocationManager()

CLLocationManager 是原生的 GPS 坐标管理对象。接下来按照以下代码来实现 getMyLocation 方法：

    
    @IBAction func getLocation() {
       // 1 
       let status  = CLLocationManager.authorizationStatus()
       
       // 2
       if status == .notDetermined {
           locationMgr.requestWhenInUseAuthorization()
           return
       }
        
       // 3
       if status == .denied || status == .restricted {
            let alert = UIAlertController(title: "Location Services Disabled", message: "Please enable Location Services in Settings", preferredStyle: .alert)
            
            let okAction = UIAlertAction(title: "OK", style: .default, handler: nil)
            alert.addAction(okAction)
            
            present(alert, animated: true, completion: nil)
            return
       }
       
       // 4
       locationMgr.delegate = self
       locationMgr.startUpdatingLocation()
    }

1. authorizationStatus 对象将返回授权状态。
2. 保证 app 在前台运行时，当定位更新后获取定位。
3. 当定位服务被禁用时，用户将收到提示。
4. 确定代理对象为当前的 ViewController

然后实现 CLLocationManager 的代理方法。

    
    // 1
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        let currentLocation = locations.last!
        print("Current location: \(currentLocation)")
    }
    
    // 2
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Error \(error)")
    }

1. 当前位置坐标输出到控制台。
2. 当定位无法更新时输出错误原因。

要在 app 运行时请求 GPS 定位权限，需要在 info.plist 中设置新的属性键(Key)。单击鼠标右键选择添加行，并输入以下值：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57d6806744024343d1a0e33d/1473675371839/?format=750w)

在 Build 并运行工程时，app 会主动寻求定位授权：

![](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/57d6ad18d1758ef687420489/1473686818044/?format=300w)

点开控制台中的位置箭头，选择一个预定义的位置。控制台会打印当前的 GPS 定位。

    bash
    Current location: <+51.50998000,-0.13370000> +/- 5.00m (speed -1.00 mps / course -1.00) @ 9/12/16, 3:25:27 PM Central European Summer Time
    Current location: <+51.50998000,-0.13370000> +/- 5.00m (speed -1.00 mps / course -1.00) @ 9/12/16, 3:25:28 PM Central European Summer Time
    Current location: <+51.50998000,-0.13370000> +/- 5.00m (speed -1.00 mps / course -1.00) @ 9/12/16, 3:25:29 PM Central European Summer Time
    Current location: <+51.50998000,-0.13370000> +/- 5.00m (speed -1.00 mps / course -1.00) @ 9/12/16, 3:25:30 PM Central European Summer Time
    Current location: <+51.50998000,-0.13370000> +/- 5.00m (speed -1.00 mps / course -1.00) @ 9/12/16, 3:25:31 PM Central European Summer Time
    Current location: <+51.50998000,-0.13370000> +/- 5.00m (speed -1.00 mps / course -1.00) @ 9/12/16, 3:25:32 PM Central European Summer Time

你可以在 [Github](https://github.com/ioscreator/ioscreator) 上的 ioscreator 仓库中下载 **IOS10RequestingPermissionTutorial** 的源码。



> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。