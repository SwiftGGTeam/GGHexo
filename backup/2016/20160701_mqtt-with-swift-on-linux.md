title: "Linux 下使用 Swift MQTT"
date: 2016-07-01
tags: [Swift 进阶]
categories: [iAchieved.it]
permalink: mqtt-with-swift-on-linux
keywords: swift mqtt,linux mqtt
custom_title: 
description: 这是一篇关于服务器端的 swift 开发教程，将一个开源的客户端 MQTT 库应用在 Swift 应用里面。

---
原文链接=http://dev.iachieved.it/iachievedit/mqtt-with-swift-on-linux/
作者=Joe
原文日期=2016-06-12
译者=shanks
校对=CMB
定稿=Cee

<!--此处开始正文-->
> 原文图片链接全部失效，因此本文图片无法显示。

![](https://img.shields.io/badge/Swift-3.0-orange.svg?style=flat) ![](https://img.shields.io/badge/OS-Linux-blue.svg?style=flat)

在过去几年的时间里，我一直从事[物联网](https://en.wikipedia.org/wiki/Internet_of_things)（Internet of Things，IoT）软件的开发项目。在这段时间里面，我学到了不少关于和云端通信传感以及遥感的协议方案。在物联网领域最通用的方案是 [MQTT](http://mqtt.org/) ，一个轻量级的协议，用于发布消息给**频道**，同时提供对**频道**的订阅功能。这种模式通常被称为[「发布──订阅」模式](https://en.wikipedia.org/wiki/Publish–subscribe_pattern)。 

除了在做物联网和 MQTT 的工作以外，我对 Swift 语言充满了兴趣，特别是在 Swift 开源，进入了服务器端领域，能够在 Linux 下运行以后。自然地，可以把这些领域的知识连接在一起，开始使用 Swift 来实现一个 [MQTT 的客户端](https://github.com/emqtt/CocoaMQTT)。我们把这个基于 Swift 3.0 和 Linux 平台的 MQTT 客户端的 iOS 实现开放出来了。这个例子说明，实际上， Swift 已经同时进军了服务器端和物联网领域。

在我们开始之前，做一个免责声明：目前基于 Linux 下的 Swift 3.0 版本还处于开发者预览版阶段。从[这里](http://dev.iachieved.it/iachievedit/introducing-swift-3-0/)可以获取到在 Ubuntu 14.04 和 15.10 下使用 Swift 3.0 的信息。或者，如果你有一台如 BeagleBone Black 等基于 armv7 的设备，可以尝试使用 Swift 3.0 版本下的 [ARM port](http://dev.iachieved.it/iachievedit/swift-3-0-on-a-beaglebone-black/)。

<!--more-->


### 实例应用

我的第一个想法是创建一个牛逼的 BeagleBone MQTT 客户端，读取 ADC 的输入，然后把数据发送给代理网关，输入来自于微芯片 [`MCP9700`](http://ww1.microchip.com/downloads/en/DeviceDoc/21942e.pdf) 温度传感 IC。传感 IC 的最大输出电压是 5.5V，我知道的是，一个电压分压器保证输入电压在 1.8V 以下，供应给 BeagleBone。我做了一个分压器的草图，请查收！

![](http://swiftgg-main.b0.upaiyun.com/img/mqtt-with-swift-on-linux-2.png)

不幸的是，当我们测试标准匹配的传感 IC 时，在靠近 IC 封装附近的地方，着火了。[Icarus](https://en.wikipedia.org/wiki/Icarus) 项目因此终止了。我们替代的例子没那么激进了，但是起到了使用 Swift 来创建一个 MQTT 客户端的作用，但是已经无关比赛了。

### MQTT

我们的应用基于一个开源的客户端 MQTT 库（必须是开源的！）来做的，我们简单的把这个库命名为 MQTT, 发布到了 [GitHub](https://github.com/iachievedit/MQTT) 上。这个库可以被用在 Swift 应用里面，你可以使用以下代码来创建 Swift 应用：

```bash
mkdir PubSysTemp
cd PubSysTemp
swift package init --type executable
```

运行 `swift package init --type executable` 后会给你一个 Swift 的项目文件夹（可以 npm init），在这里你可以按照你的想法自定义内容。我们将会编辑 Package.swift 来添加对 MQTT 库的依赖：

```swift
import PackageDescription
let package = Package(
  name: "PubSysTemp",
  dependencies:[
    .Package(url:"https://github.com/iachievedit/MQTT", majorVersion:0, minor:1)
  ]
)
```

#### MQTT 客户端代理

MQTT 库的设计，会让你创建一个客户端类，继承 `MQTT` 和 `MQTTDelegate` ，一个非常基础的实现就像以下代码那样：

```swift
import Foundation
import MQTT

class Client:MQTT, MQTTDelegate {
  
  init(clientId:String) {
    super.init(clientId:clientId)
    super.delegate = self
  }
  
  func mqtt(mqtt: MQTT, didConnect host: String, port: Int) {
  }
  
  func mqtt(mqtt: MQTT, didConnectAck ack: MQTTConnAck) {
  }
  
  func mqtt(mqtt: MQTT, didPublishMessage message: MQTTMessage, id: UInt16) {
  }
  
  func mqtt(mqtt: MQTT, didPublishAck id: UInt16) {
  }
  
  func mqtt(mqtt: MQTT, didReceiveMessage message: MQTTMessage, id: UInt16 ) {
  }
  
  func mqtt(mqtt: MQTT, didSubscribeTopic topic: String) {
  }
  
  func mqtt(mqtt: MQTT, didUnsubscribeTopic topic: String) {
  }
  
  func mqttDidPing(mqtt: MQTT) {
  }
  
  func mqttDidReceivePong(mqtt: MQTT) {
  }
  
  func mqttDidDisconnect(mqtt: MQTT, withError err: NSError?) {
  }
}
```

当 MQTT 客户端进行连接，发布一条消息或者订阅一个频道时候，你应该可以猜到，以上代码中的代理方法会被调用。客户端可以按照你的要求对代理方法进行具体的实现。在我们的例子中，我们将实现 `mqttDidDisconnect` 方法：

```swift
func mqttDidDisconnect(mqtt: MQTT, withError err: NSError?) {
  NSNotificationCenter.defaultCenter().postNotificationName("DisconnectedNotification",object:nil)
}
```

在之前的文章中，我提到过如何灵活地提交一个通知，然后也描述了接收方如何处理这个通知。`DisconnectedNotification` 会在我们的 `main.swift` 出现。


#### main.swift

接下来我们来看看 `main.swift`，里面将初始化基于 MQTT 的客户端，需要的最基础的设置如下代码所示：

```swift
let client = Client(clientId:"a-client-id")
client.host = "broker.hivemq.com"
client.connect()
client.publish(topic:"/my/topic", withString:"my string")
```

我们想让客户端更加健壮一些，所以我们加入了连接断开后的自动重连机制，做法如下：

```swift
NSNotificationCenter.defaultCenter().addObserverForName("DisconnectedNotification",
                                                            object:nil, queue:nil){_ in
  guard client.connect() else {
    print("Unable to connect to broker")
    exit(-1)
  }
}
```

在这里，大家有可能觉得在连接到代理网关（broker）失败的时候，我们不需要 `exit` 函数。我们能做的就是设置一个计时器，然后重新广播我们的 `DisconnectedNotification`。在下面的代码中会详细讲到这种做法。

我们应该推送一些有用的东西给代理网关，所以我们就初始化一个 `NSTimer` ，每 10 秒钟唤醒一次，得到 CPU 的温度，然后提交这个信息。

```swift
let reportInterval    = 10
let reportTemperature = NSTimer.scheduledTimer(NSTimeInterval(reportInterval), repeats:true){_ in
  if let cpuTemperature = CPU().temperature {
  _ = client.publish(topic:"/(client.clientId)/cpu/temperature/value", withString:String(cpuTemperature))
  }
}
reportTemperature.fire()
NSRunLoop.currentRunLoop().addTimer(reportTemperature, forMode:NSDefaultRunLoopMode)
NSRunLoop.currentRunLoop().run()
```

需要注意的是，我们设置好了计时器以后，接着就调用了 `fire()` 函数（在第一次提交时候我们没有等 10 秒）。另外，我们提交的频道名称是 `/<i>clientid</i>/cpu/temperature/value` ，这是一个 MQTT 频道命名的规范的示例，像此名称一样。当你深入设计一个物联网应用时候，你会发觉，这种命名方式将会变得异常重要。

#### 得到 CPU 的温度

我喜欢在 Linux 下工作，Linux 的一些健康状况可以在 `/sys` 和 `/proc` 下查看。不幸的是，当你在与硬件打交道的时候，你不得不频繁地剪裁你的代码运行到指定的硬件上。比如，在我的 x86 服务器上，获取 CPU 的温度要通过读取 `/sys/class/hwmon/hwmon0/temp1_input` 。在 BeagleBoard X15 又是读取 `/sys/class/hwmon/hwmon1/temp1_input` 。这让人纠结。

我们不会现在就去写一些通配的代码，但是你应该可以采用这个例子满足你自己系统的需要：

```swift
struct CPU {
  var temperature:Double? {
    get {
      let BUFSIZE = 16
      let pp      = popen("cat /sys/class/hwmon/hwmon0/temp1_input", "r")
      var buf     = [CChar](repeating:0, count:BUFSIZE)
      guard fgets(&buf, Int32(BUFSIZE), pp) != nil else {
        pclose(pp)
        return nil
      }
      pclose(pp)

      let s = String(String(cString:buf).characters.dropLast())
      if let t = Double(s) {
        return t/1000
      } else {
        return nil
      }
    }
  }
}
```

### 整合到一起

现在让我们把所有这些整合到一起，编译出一个可以运行的 MQTT 客户端，提交 CPU 温度到 `broker.hivemq.com` ，作为奖励，我们提供一个页面，把 CPU 温度用仪表器形式显示出来。

有 3 个文件用于生成我们的客户端：

* Client.swift
* CPU.swift
* main.swift

所有文件都应该放到 `Sources` 文件夹中，让我们看看它们各自完整的实现：

#### Client

`Client.swift`

```swift
import swiftlog
import Foundation
import MQTT

class Client:MQTT, MQTTDelegate {

  init(clientId:String) {
    super.init(clientId:clientId)
    super.delegate = self
  }

  func mqtt(mqtt: MQTT, didConnect host: String, port: Int) {
    SLogInfo("MQTT client has connected to \(host):\(port)")
    NSNotificationCenter.defaultCenter().postNotificationName("ConnectedNotification",
                                                              object:nil)
  }

  func mqtt(mqtt: MQTT, didConnectAck ack: MQTTConnAck) {
    ENTRY_LOG()
  }

  func mqtt(mqtt: MQTT, didPublishMessage message: MQTTMessage, id: UInt16) {
    ENTRY_LOG()
  }

  func mqtt(mqtt: MQTT, didPublishAck id: UInt16) {
    ENTRY_LOG()
  }

  func mqtt(mqtt: MQTT, didReceiveMessage message: MQTTMessage, id: UInt16 ) {
    ENTRY_LOG()
  }

  func mqtt(mqtt: MQTT, didSubscribeTopic topic: String) {
    ENTRY_LOG()
  }

  func mqtt(mqtt: MQTT, didUnsubscribeTopic topic: String) {
    ENTRY_LOG()
  }

  func mqttDidPing(mqtt: MQTT) {
    ENTRY_LOG()
  }

  func mqttDidReceivePong(mqtt: MQTT) {
    ENTRY_LOG()
  }

  func mqttDidDisconnect(mqtt: MQTT, withError err: NSError?) {
    SLogInfo("Disconnected from broker")
    NSNotificationCenter.defaultCenter().postNotificationName("DisconnectedNotification",object:nil)
  }
}
```

#### CPU

`CPU.swift`

```swift
import Glibc

struct CPU {
  var temperature:Double? {
    get {
      let BUFSIZE = 16
      let pp      = popen("cat /sys/class/hwmon/hwmon0/temp1_input", "r")
      var buf     = [CChar](repeating:0, count:BUFSIZE)
      guard fgets(&buf, Int32(BUFSIZE), pp) != nil else {
        pclose(pp)
        return nil
      }
      pclose(pp)

      let s = String(String(cString:buf).characters.dropLast())
      if let t = Double(s) {
        return t/1000
      } else {
        return nil
      }
    }
  }
}
```

#### main

`main.swift` 看起来有点复杂，但是实际上很简单。主要做的事情是，等待通知的到来，然后根据通知设置计时器，让我们的客户端运行起来。举个例子，如果我们没有建立一个 MQTT 连接，没有任何东西会被推送。一旦连接建立以后，将会设置一个 10 秒的计时器，在保持连接的条件下，将会更新温度。

```swift
import swiftlog
import Glibc
import Foundation

slogLevel = .Info // Change to .Verbose to get real chatty

slogToFile(atPath:"/tmp/pubSysTemp.log")

let BUFSIZE = 128
var buffer  = [CChar](repeating:0, count:BUFSIZE)
guard gethostname(&buffer, BUFSIZE) == 0 else {
  SLogError("Unable to obtain hostname")
  exit(-1)
}

let client = Client(clientId:String(cString:buffer))
client.host = "broker.hivemq.com"
client.keepAlive = 10

let nc = NSNotificationCenter.defaultCenter()
var reportTemperature:NSTimer?

_ = nc.addObserverForName("DisconnectedNotification", object:nil, queue:nil){_ in
  SLogInfo("Connecting to broker")

  reportTemperature?.invalidate()
  if !client.connect() {
    SLogError("Unable to connect to broker.hivemq.com, retrying in 30 seconds")
    let retryInterval     = 30
    let retryTimer        = NSTimer.scheduledTimer(NSTimeInterval(retryInterval),
                                                   repeats:false){ _ in
      nc.postNotificationName("DisconnectedNotification", object:nil)
    }
    NSRunLoop.currentRunLoop().addTimer(retryTimer, forMode:NSDefaultRunLoopMode)
  }
}

_ = nc.addObserverForName("ConnectedNotification", object:nil, queue:nil) {_ in

  let reportInterval    = 10
  reportTemperature = NSTimer.scheduledTimer(NSTimeInterval(reportInterval),
                                                 repeats:true){_ in

    if client.connState == .CONNECTED {
      if let cpuTemperature = CPU().temperature {
        _ = client.publish(topic:"/\(client.clientId)/cpu/temperature/value",
                           withString:String(cpuTemperature))
        SLogInfo("Published temperature to \(cpuTemperature)")
      } else {
        SLogError("Unable to obtain CPU temperature")
      }
    } else {
      SLogError("MQTT client is not connected")
    }
  }
                                                                           
  NSRunLoop.currentRunLoop().addTimer(reportTemperature!, forMode:NSDefaultRunLoopMode)

}

nc.postNotificationName("DisconnectedNotification", object:nil) // Kick the connection

let heartbeat = NSTimer.scheduledTimer(NSTimeInterval(30), repeats:true){_ in return}
NSRunLoop.currentRunLoop().addTimer(heartbeat, forMode:NSDefaultRunLoopMode)
NSRunLoop.currentRunLoop().run()
```

需要注意的是，我们使用的是一个心跳计时器，如果没有请求源或者计时器的附加，循环会退出，所以我们使用了一个简单的重复计时器来保证心跳的正常运行，这样，循环也能运行。

`Package.swift` 应该是这样的：

```
import PackageDescription

let package = Package(
  name: "PubSysTemp",
  dependencies:[
    .Package(url:"https://github.com/iachievedit/MQTT", majorVersion:0, minor:1)
  ]
)
```

你可以在 [GitHub](https://github.com/iachievedit/PubSysTemp) 上拿到我们的代码，使用 `swift build` 编译然后运行程序：

```bash
# git clone https://github.com/iachievedit/PubSysTemp
# cd PubSysTemp
# swift build
# .build/debug/PubSysTemp
```

注意：代码是基于 Swift 3.0 版本编写的，你可以在我们的[这篇文章](http://dev.iachieved.it/iachievedit/introducing-swift-3-0/)中获取 Linux 下使用 Swift 3.0 的信息。

### 代理网关究竟做了什么事情？

可以把 MQTT 的代理网关理解成 `NSNotificationCenter` ，在 iOS 里面，一个典型的场景是，通过 `NSNotificationCenter.defaultCenter()` 获取一个引用，然后向它发送一个消息。当一个命名的消息发送时，你注册的消息中心将会接收到一条消息。

你需要和代理网关进行通信来使用 MQTT，如果你想编译一个物联网的网关，你可以使用 [`Mosquitto`](http://mosquitto.org/) 或者 [`HiveMQ`](http://mosquitto.org/) 来运行你自己的代理网关。如果你只是想写一个 MQTT 的教程，你可以去使用一些公共的代理网关，比如 `test.mosquitto.org` 或者 `broker.hivemq.com`，比你自建更好（就像我们做的那样！）。

在我们上面的例子中，我们写了一个 MQTT 客户端，用来推送数据。那么订阅数据呢？这也属于 MQTT 客户端的事情。在我们的例子中，我们使用一个非常不错的 [温度度量插件](https://github.com/jpmens/tempgauge)来增强我们的[温度显示](http://dev.iachieved.it/mqttgauge/)。

![](http://swiftgg-main.b0.upaiyun.com/img/mqtt-with-swift-on-linux-3.png)

这里需要强调的是，温度度量实际上是一个基于 javascript 的 MQTT 客户端，订阅来自 `broker.hivemq.com`，`/darthvader/cpu/temperature/value` 频道的推送消息。（`darthvader` 是我们客户端的名称）

### 下一步计划

对于 [MQTT 库](https://github.com/iachievedit/MQTT)，我们还做了更多的事情。2016.6.11的时候，连接和推送成功了，但是订阅频道是另外一则故事。我们将在下篇专题中放送。

对于服务器端的 Swift 开发，这仅仅是一个开始，诸如 [Zewo](http://www.zewo.io/) 的组织正在辛劳的开发一些库，用于在 Linux 下使用 Swift 编写服务器端软件。事实上，我们的 MQTT 库使用了 Zewo 的 [VeniceX](https://github.com/VeniceX/TCP) TCP组件，用于我们的网络 IO。时间会证明，我也肯定认为 Swift 将会有一个广阔的未来，不仅仅限于 iOS 开发。