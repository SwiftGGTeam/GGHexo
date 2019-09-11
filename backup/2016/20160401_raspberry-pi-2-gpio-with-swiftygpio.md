title: "树莓派2 GPIO 和 SwiftyGPIO"
date: 2016-04-01
tags: [Swift 进阶]
categories: [iAchieved.it]
permalink: raspberry-pi-2-gpio-with-swiftygpio
keywords: 树莓派2 gpio,raspberry pi 2 gpio,SwiftyGPIO
custom_title: 
description: Swift 开源后发展很快，现在用 SwiftyGPIO 库都能和 ARM 设备上的 GPIO 接口进行交互了。

---
原文链接=http://dev.iachieved.it/iachievedit/raspberry-pi-2-gpio-with-swiftygpio/
作者=Joe
原文日期=2016-02-08
译者=Crystal Sun
校对=numbbbbb
定稿=littledogboy

<!--此处开始正文-->

和全球的开源项目开发者一起工作非常有趣并且可以从中获得很多经验。随着计算机设备和宽带成本逐渐降低，给全世界的人带来了新技术，来自不同文化、不同背景的开发者们走到一起努力合作，共同创造了不起的成就。

自从苹果去年开源 Swift 编程语言以来，热心人们已经[创建了 Ubuntu 安装包](http://dev.iachieved.it/iachievedit/ubuntu-packages-for-open-source-swift/)，[移植到 ARM 设备上如 Raspberry Pi 2](http://www.housedillon.com/?p=2287)，创建了[网页开发框架](http://dev.iachieved.it/iachievedit/building-rest-apis-with-zewo/)，而现在[Umberto Raimondi](https://www.uraimo.com) 发布了 [SwiftyGPIO](https://github.com/uraimo/SwiftyGPIO),一个 Swift 库，能够和 ARM 设备（如 Raspberry Pi 和 BeagleBone Black）上的 GPIO 接口进行交互。

<!--more-->

[SwiftyGPIO README](https://github.com/uraimo/SwiftyGPIO/blob/master/README.md) 详细解释了如何使用模块。正如 Umberto 所说，Swift Package Manager 目前还不能在 ARM 上使用（我曾经尝试进行编译，不过有时候发生抢占），所以我们还是下载 `SwiftyGPIO.swift` 文件，通过 wget 和 swiftc  来进行编译，将所有的东西连起来。

## Rock Chalk 加油

去年，我参与过[使用 Xcode 开发 Arduino 项目](http://dev.iachieved.it/iachievedit/getting-started-with-arduino-and-xcode/)，写过一些关于 LED 灯闪烁的代码。这次我们在 Raspberry Pi 2 上用 Swift 语言再实现一次。

如果你打算尝试一下，我们需要：

* 一个 Raspberry Pi 2
* 一对 LED 灯
* 连接用的电线
* [把 Swift 安装到你的 Pi 2 上](http://dev.iachieved.it/iachievedit/open-source-swift-on-raspberry-pi-2/)

我们会用到 GPIO4 针脚 和 GPIO27针脚，因为这两个在 Pi 2 GPIO 数据头中靠的很近。

下面是 main.swift 文件，能够让两个 LED 灯来回闪烁。

```swift
import Glibc
 
let gpios = SwiftyGPIO.getGPIOsForBoard(.RaspberryPiPlus2Zero)
 
// GPIO4 and GPIO27
let leds = [gpios[.P4]!, gpios[.P27]!]
 
// Initialize our GPIOs
for led in leds {
  led.direction = .OUT
  led.value     = 0
}
 
// Blink
while true {
  for led in leds {
    led.value = 1
    sleep(1)
    led.value = 0
  }
}
```

直到 SwiftPM for ARM 被修复之前，为了能够完成编译成功运行这段代码，我们需要这样做：

```swift
# wget https://raw.githubusercontent.com/uraimo/SwiftyGPIO/master/Sources/SwiftyGPIO.swift
# swiftc main.swift SwiftyGPIO.swift
# ./main
```

正确连接 LED 灯后，这两个灯会来回闪烁！

![闪烁 闪烁](https://swift.gg/img/articles/raspberry-pi-2-gpio-with-swiftygpio/SwiftLEDs.png1459473018.7848978)

## 选择颜色

我有一个闲置的 [Linrose Tricolor](http://www.amazon.com/Linrose-B4361H1-Green-Amber-Tricolor/dp/B008K1SWEC) LED 灯，我打算物尽其用。在这段示例代码中，我们已经写了一条命令行程序，允许你设置 LED 灯的颜色（或者关灯）。我在代码中用 //1, //2 标注出来了。

```swift
import Glibc
 
// 1
let gpiodefs = SwiftyGPIO.getGPIOsForBoard(.RaspberryPiPlus2Zero)
 
// 2
enum GPIOState:Int {
case Off = 0
case On 
}
 
// 3
struct LedColor {
 static let Off    = (GPIOState.Off, GPIOState.Off) 
 static let Green  = (GPIOState.On,  GPIOState.Off)
 static let Orange = (GPIOState.On,  GPIOState.On)
 static let Red    = (GPIOState.Off, GPIOState.On)
}
 
// 4
let gpios = [gpiodefs[.P4]!, gpiodefs[.P27]!]
for gpio in gpios {
  gpio.direction = .OUT
  gpio.value     = GPIOState.Off.rawValue
}
 
// 5
func setLedColor(color:(GPIOState,GPIOState), gpios:[GPIO]) {
  gpios[0].value = color.0.rawValue
  gpios[1].value = color.1.rawValue
}
 
// 6
guard Process.arguments.count == 2 else {
  print("Usage:  ./main off|green|orange|red")
  exit(0)
}
 
let color = Process.arguments[1]
 
// 7
switch color {
  case "off":
    setLedColor(LedColor.Off, gpios:gpios)
  case "green":
    setLedColor(LedColor.Green, gpios:gpios)
  case "orange":
    setLedColor(LedColor.Orange, gpios:gpios)
  case "red":
    setLedColor(LedColor.Red, gpios:gpios)
  default:
    print("Invalid color")
}
```

1. SwiftGPIO 为比较流行的板子提供了封装好的 GPIO。在我们的例子中，我们用的是 Raspberry Pi 2。
2. 纯粹就是描述 GPIO 状态的语法，比如 On 或者 Off。如果我们删掉这部分，估计整个代码看起来会整洁一些。
3. LedColor 是个结构体，定义 off, Green, Ogrange 和 Red。
4. 三色 LED 灯有两个正极接口，我们将其中一个接口连接到 GPIO4 上，另外一个连接到 GPIO27 上，应用启动后会先将接口方向设置为 .OUT 和 OFF。然后，因为我们用枚举创建的 GPIOState ,所以我们应该用 .rawValue 。
5. setLedColor 方法通过一个元组(GPIOState,GPIOState)和 一个数组 [GPIO] 把 一对儿 GPIO 接口设置为肯定状态。 
6. 我们的应用只有一个参数，所以 guard 方法中只有两个，一个是应用名字，另外一个是颜色。
7. 使用 switch 语句来转换颜色，通过调用 setLedColor 来设置颜色。

## 结束语

[SwiftyGPIO](https://github.com/uraimo/SwiftyGPIO) 这个 API 能让你在 ARM 板子上用 Swift 使用 GPIO 。随着 Swift 语言的日新月异、与时俱进，Swift 俨然已进军制造业，很有可能成为单板计算机开发项目的不二选择。