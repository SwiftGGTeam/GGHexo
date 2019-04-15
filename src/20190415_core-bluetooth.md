title: "在 iOS 11 中使用 Core Bluetooth"
date: 2019-04-15
tags: [教程]
categories: [appcoda]
permalink: core-bluetooth
keywords: 蓝牙，Core Bluetooth Framework
custom_title: Core Bluetooth 教程
description: 详细描述了使用 Core Bluetooth 的全流程。包括注册成为 Bluetooth SIG 的会员，以及 GATT 规范的查阅。

---
原文链接=https://appcoda.com/core-bluetooth/
作者=Andrew Jaffee
原文日期=2018-04-17
译者=灰s
校对=Cee,numbbbbb
定稿=Forelax

<!--此处开始正文-->

作为 iOS 开发，我们十分清楚人们都喜欢互通性。我们喜欢通过无线设备与其他人进行沟通这一点是显而易见的。最近，我们开始希望能够与那些曾经被认为是独立的普通设备进行*通信*。我们开始喜欢，甚至是期望，部分无线设备可以收集并且分析自己的数据（通常称为“可穿戴设备”）。许多设备已经成为我们生活里的一部分，还为还有一个专门的术语来描述它：“Internet of Things” 或者 “IoT”（物联网）。现在地球上有数十亿的无线通讯设备。在这篇教程中，我们将聚焦 IoT 其中的一部分：蓝牙。  

我将说明蓝牙技术背后的基本概念，以及：  

 - 展示如何精通蓝牙方向的软件开发，从而为你提供巨大的职业机遇  
 - 提醒你必须去确认在发布一个使用蓝牙技术的应用时是否需要通过“资格审查”  
 - 给你提供 Apple 的[***Core Bluetooth***](https://developer.apple.com/documentation/corebluetooth) 框架概述 ([**也可以参阅这里**](https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/AboutCoreBluetooth/Introduction.html#//apple_ref/doc/uid/TP40013257-CH1-SW1))  
 - 最后，带领你使用 Swift 4 并通过 *Core Bluetooth* 和一个蓝牙设备来开发一款用于监控心率的 iOS 应用程序

> 提示：注意跟随阅读文章中包含的超链接。对于开发者这是重要的资料，它确保你完全理解蓝牙的工作方式以及苹果是如何支持蓝牙这种技术的。

<!--more-->

## 蓝牙 - 一项迅速发展的技术

在一篇文章中不可能说清楚如何为整个物联网开发软件，但实际上，对所有这些无线设备进行数据分析是很有启发性的 - 实际上是很不可思议的。连接着的东西无处不在并且可以预测这个小东西的增长速度将是惊人的。如果你观察一下我们今天讨论的内容，在“短程段”中，使用如蓝牙和无线网的技术，然后添加上“广域类别”中，使用如电话的技术（比如: CDMA），[**你将看到**](https://www.ericsson.com/en/mobility-report/internet-of-things-forecast) ~ 2014 年的 125 亿设备迅速增加到 2022 年预计的 300 亿。  

蓝牙是一种短距离无线通讯技术的标准化规范。[**Bluetooth Special Interest Group（蓝牙技术联盟）**](https://www.bluetooth.com/zh-cn) 管理和保护这种短程无线技术背后的研发、发展还有知识产权。SIG 确保关于蓝牙的制造商，开发者和销售者他们的硬件和软件都是基于标准化规范。  

根据 Bluetooth SIG 报道，[**“今年有将近 40 亿台设备使用蓝牙进行连接。连接手机，平板电脑，个人电脑，或者彼此。”**](https://www.bluetooth.com/bluetooth-technology)。一家对短程通讯技术进行深度投资的公司 Ellisys 对此表示认同，并 [**“预估 2018 年将有近 40 亿台新的蓝牙设备上市”**](https://globenewswire.com/news-release/2018/02/22/1379920/0/en/Ellisys-Increases-Support-for-Bluetooth-Mesh-Networking-on-Protocol-Solutions.html)。请记住，*仅在今年*就有 40 亿*新*蓝牙设备上市。  

根据这个趋势，一家收集“市场和消费数据”的公司 Statista 认为全球的蓝牙设备 [**将从 2012 年的 35 亿增长到 2018 年预估的 100 亿**](https://www.statista.com/statistics/283638/installed-base-forecast-bluetooth-enabled-devices-2012-2018/)。

## 对于你的职业生涯，蓝牙意味着什么

Dogtown Media 有限责任公司，一家 iOS 端“物联网蓝牙应用”精品开发商，该公司声称 [**“根据麦肯锡全球研究所（McKinsey Global Institute）的专家预测，在未来 9 年内，物联网将对全球经济产生超过 6 万亿美元的影响”**](http://www.dogtownmedia.com/app-development-services/internet-of-things-bluetooth-app-development/) 。这对于像你我这样的 iOS 开发意味着什么？Dogtown 说 [**“未来几年，对那些有远见的初创企业和创业者来说，将是令人兴奋的、多产的，而且非常有利可图的。”**](http://www.dogtownmedia.com/app-development-services/internet-of-things-bluetooth-app-development/)   
翻译：作为一个有前瞻性或者想创业的青年，应该学习使用蓝牙来进行应用程序的开发，因为在这个迅速扩大的市场，你的下个任务或者岗位有很大可能需要这个技能。  

**免责声明**：  

 > - *我与 Dogtown Media, LLC 之间没有任何的从属关系。在搜索到这篇文章的期间，我发现了这家公司的网站，看到他们专门从事 iOS 端的蓝牙开发。*  
 > - *我是 Bluetooth SIG 的一名 “Adopter” 级别成员。*  

## 在提交你使用 Core Bluetooth 开发的应用程序被审核之前

在蓝牙技术刚展露头角之际，我经常看到开发者们找一些参考资料，然后立即投入到涉及无线设备的应用开发中，并提交蓝牙应用到 Apple 的 AppStore 中。我想说：别那么快，伙计。  

Bluetooth SIG 规定，[**“所有使用蓝牙技术的产品必须完成 Bluetooth Qualification Process（蓝牙资格审核）。”**](https://www.bluetooth.com/develop-with-bluetooth/qualification-listing) 我听到有人说，“市面上有太多基于蓝牙的应用；没有人会注意到我的”。呃，并不是这样。蓝牙技术有 [**版权，专利，并且授权**](https://www.bluetooth.com/about-us/governing-documents) 给应用开发者。如果你想让你的应用程序被聚焦并且展示你集成了蓝牙技术的事实，请记住：  

> *Bluetooth* 商标 - 包括 BLUETOOTH 文字商标，图形商标（符文 B 和椭圆形设计），还有组合商标（蓝牙文字商标和设计）- 这些都被 Bluetooth SIG 所拥有。只有 Bluetooth SIG 的成员并且拥有对应资格和申报过的产品才可以展示，相关功能或者使用任何商标。为了保护这些商标，Bluetooth SIG 管理了一套执行程序，监控市场并进行审核，以确保会员使用商标的行为符合蓝牙品牌指南，并确保最终发布的产品与已通过资格审查程序的商品和服务相对应。

来看一下 Bluetooth SIG 的 [**资质 FAQ**](https://www.bluetooth.com/develop-with-bluetooth/qualification-listing)：

> 如果我没有给我的产品申请相应的资质会怎么样?  
>
> 如果你没有给你的产品申请相应的资质，你将成为执法行动的对象。请阅读这里的 [**更新策略**](https://www.bluetooth.com/develop-with-bluetooth/qualification-listing)，其中我们概述了升级计划。如果没有采取纠正措施，您的 Bluetooth SIG 会员资质可能被暂停或撤销。

别傻了，别去冒险。最重要的一点是，我们所有人都应该努力追求最高的诚信和诚实，在应该给予信任的时候给予信任，并促进遵守标准，使协同工作成为规范，而不是例外。数千个人贡献了数千个小时的工作和数百万美元用于发展蓝牙的标准和 [**多项专利**](http://www.ipwatchdog.com/2015/05/10/evolution-of-technology-bluetooth-the-once-and-future-king/id=57473/)，从而创造了一套明显有用的知识财产。

## 别让我吓着你

人们常常被「商标」、「专利」、「版权」、「资质」、「会员」、等严厉的词语所吓倒，尤其是 “强制执行。”不要开始担心使用蓝牙进行开发的事。*加入 Bluetooth SIG！它是免费的！* [**点击这里**](https://www.bluetooth.com/develop-with-bluetooth/join)，然后：

> 首先成为一个 Adopter 级别的会员。使用蓝牙技术开发一款产品，会员资格是必须的，Adopter 级别会员拥有以下这些福利：  
> • 根据 [**Bluetooth Patent/Copyright License Agreement（蓝牙专利/版权许可协议）**](https://www.bluetooth.com/~/media/downloads/pcla%20esign%20version%20version%2011.ashx?la=en) 使用蓝牙技术生产产品的许可  
> • 根据 [**Bluetooth Trademark License Agreement（蓝牙商标许可协议）**](https://www.bluetooth.com/~/media/files/membership/btla.ashx?la=en) 在符合条件的产品上使用蓝牙商标的许可  
> • 能够与数以万计的 Bluetooth SIG 成员建立网络，并在各种各样的行业中合作 — 从芯片制造商到应用程序的开发者，设备制造商和服务提供商  
> • 能够参加 [**SIG 专家组、研究小组和工作组中的子小组**](https://www.bluetooth.com/specifications/working-groups/working-groups-committees)  
> • 访问诸如 Profile Tuning Suite（PTS）之类的工具，提供协议和协同测试……

## 成为 Bluetooth SIG 的一员

成为 SIG 的一员 [**会包含很多好处**](https://www.bluetooth.com/develop-with-bluetooth/build)。你可以免费使用教育工具包、培训视频、网络研讨会、开发人员论坛、开发人员支持服务、白皮书、产品测试工具，并帮助确保您的应用程序满足国际监管要求（主要是关于 [**射频排放**](https://www.fda.gov/MedicalDevices/DigitalHealth/WirelessMedicalDevices/default.htm)）。  

你只要成为会员就会得到一些曝光。我的公司是它的一个成员，所以在 Bluetooth SIG’s Member Directory 中可以 [**被看到**](https://www.bluetooth.com/develop-with-bluetooth/join/member-directory?q=microIT%20Infrastructure,%20LLC)：  
![](https://appcoda.com/wp-content/uploads/2018/04/membership.png)  

一旦你开发了一款应用，使其通过 SIG 认证，并获得 Apple App Store 的许可，那么你的产品同时也会被 SIG 公开上市，这时你将获得更多的曝光。  

## 对应用程序进行资格认证既简单又便宜

当你对自己基于 Core Bluetooth 开发的应用程序感到满意，并准备将其提交到 Apple App Store 进行审核，请停下，然后前往 Bluetooth SIG 的网页对你的应用程序进行 [**认证**](https://www.bluetooth.com/develop-with-bluetooth/qualification-listing)。SIG 将为您提供一个整洁的 [**“Launch Studio”**](https://launchstudio.bluetooth.com/)，它是您用来完成 Bluetooth Qualification Process 的在线工具。”  

对于大多数应用程序，比如我将在本教程中介绍的 “GATT - based Profile Client（app），”认证和上市的费用是 100 美元。花一些精力来确保您的代码符合 Bluetooth 规范和做一些测试，将是非常值得的。最后，可以给你的应用程序印上蓝牙的商标。这个 [**商标**](https://www.bluetooth.com/develop-with-bluetooth/marketing-branding) “在全球范围内都是可识别的，消费者认知度高达92%。”  

请不要担心 100 美元的问题。你更有可能获得一份拥有丰厚薪水或者时薪的工作，并为公司处理这些蓝牙的合规问题。

## 理解 Core Bluetooth

大多数情况下，使用蓝牙设备是非常简单的。开发与蓝牙通讯的软件却有可能非常复杂。这就是为什么 Apple 创造了 [***Core Bluetooth*** **框架**](https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/CoreBluetoothOverview/CoreBluetoothOverview.html#//apple_ref/doc/uid/TP40013257-CH2-SW1)：  

> Core Bluetooth 框架让您的 iOS 和 Mac 应用程序与蓝牙低能耗设备通信。例如，您的应用程序可以发现、搜索低能量的外围设备还有与之交互，比如心率监视器、数字恒温器，甚至其他 iOS 设备。  

> 该框架是蓝牙 4.0 规范中关于使用低能耗设备的抽象。就是说，它为你，也就是开发者，隐藏了规范中很多底层的细节，使你更容易开发与低能耗设备进行交互的应用程序。因为该框架是基于标准规范的，所有规范中的很多概念和术语被采用了……  

请注意是“低能量设备”。当使用 *Core Bluetooth* 我们并不是处理如无线扬声器这样的经典蓝牙设备。与这类设备的通讯会很快的耗尽电池能量。*Core Bluetooth* 是针对“Bluetooth Low Energy”（BLE）的 API，也称为“Bluetooth 4.0”。BLE 使用的电力要少得多，因为它的设计目的是通信少量的数据。BLE 设备的一个很好的例子是心率监测器（HRM）。它几乎每秒钟只发送几个字节的数据。这就是为什么人们可以带着一个 HRM 或者带着他们的 iPhone 跑一个小时，记录跑步期间心率的变化，而看不到电池电量的巨大消耗。注意，随着本文的进行，像 BLE 这种首字母缩略词的数量正在增加。  

为了我们能够一起流畅的讨论 *Core Bluetooth* 你需要学习一个新的词汇表。  

分别从 [**客户端/服务端和生产者/消费者模型**](https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/CoreBluetoothOverview/CoreBluetoothOverview.html#//apple_ref/doc/uid/TP40013257-CH2-SW17) 的角度考虑 BLE 协议。  
![](https://appcoda.com/wp-content/uploads/2018/04/central-peripheral.png)  

## The Peripheral（外围设备）

*外围设备*是硬件/软件的一部分，就像 HRM。大多数 HRM 设备搜集或/和计算数据，如每分钟心跳、HRM 的电池电量水平、以及所谓的“RR-Interval”。设备传输这些数据到另一个需要它们的实体或实体组。外围设备是*服务者*和*生产者*。市场上比较流行的 HRM 有 [**Wahoo TICKR，**](https://www.wahoofitness.com/devices/heart-rate-monitors/wahoo-tickr-heart-rate-strap)[**Polar H7，**](https://www.polar.com/us-en/products/accessories/h10_heart_rate_sensor)和 [**Scosche Rhythm+**](https://www.scosche.com/rhythm-plus-heart-rate-monitor-armband)。  
![](https://appcoda.com/wp-content/uploads/2018/04/heart-rate-monitor-device.png)  

我将通过编写连接到这三种设备的 Swift 4 代码来展示 BLE 等标准的重要性。  

***Core Bluetooth 视角***  

来自 [**苹果的文档**](https://developer.apple.com/documentation/corebluetooth/cbperipheraldelegate)：  

> CBPeripheralDelegate  
>  
> [`CBPeripheral`](https://developer.apple.com/documentation/corebluetooth/cbperipheral) 对象的代理必须遵守 [`CBPeripheralDelegate`](https://developer.apple.com/documentation/corebluetooth/cbperipheraldelegate) 协议。代理使用这个协议的方法来对一个远程外围设备的服务和属性，进行发现、探索、还有交互方面的监控。这个协议里面没有必须遵守的方法。  

## The Central（中央设备）

*中央设备*是硬件/软件的一部分，就像 iPhone、iPad、MacBook、
iMac 等。这些设备可以使用应用程序扫描像 HRM 这样的蓝牙外围设备。中央设备是一个*客户*以及 *消费者*。它们与 HRM 是连通的，所以它们可以使用从外围设备中取出的像每分钟心跳、电池的电量水平、还有“RR-Interval”这样的数据。中央设备接收这些数据，可以对数据执行增值计算，或者只是通过用户界面显示数据，或者是存储数据以供将来分析、展示，或者是聚合和数据分析（就像统计分析需要足够的数据来确定重要的和有意义的趋势），或其他类似的操作。  

***Core Bluetooth 视角***  

来自 [**苹果的文档**](https://developer.apple.com/documentation/corebluetooth/cbcentralmanagerdelegate)：  
> [`CBCentralManagerDelegate`](https://developer.apple.com/documentation/corebluetooth/cbcentralmanagerdelegate) 协议定义了方法，[`CBCentralManager`](https://developer.apple.com/documentation/corebluetooth/cbcentralmanager) 对象的代理必须遵守它。协议中的可选方法允许代理来监控对外围设备的发现、连接、还有检索。唯一必须实现的方法表明中央设备的可用性，并且当中央设备的状态发生更新时被调用。

## 通过广播找到外围设备

如果你的 iPhone 或 iPad 找不到这些外设从而不能连接到它们，那么 HRM 之类的外设就没什么用了。因此，它们不断通过无线频段发送着数据的小片段（包），说着类似这样的话：“嘿，我是 Scosche Rhythm+ 心率检测器；我能提供类似我的穿戴者每分钟心率的功能；我能提供类似我的电池电量水平的信息。”当一个对心率感兴趣的*中央设备*通过*扫描*找到了这个*外围设备*，中央设备将连接到它并且它会停止广播。  

你可能已经使用过 iPhone -> *设置* -> *蓝牙* 来开启或关闭蓝牙（包括传统的和 BLE）。当切换到开启，你可以看到你的 iPhone 扫描设备并与它们建立连接，就像下面我所截的两张图，搜索，并且将我的 iPhone 连接到一个 Scosche Rhythm+ HRM：  
![](https://appcoda.com/wp-content/uploads/2018/04/bluetooth-found-ryhthm.png)  

依照 [**苹果**](https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/CoreBluetoothOverview/CoreBluetoothOverview.html#//apple_ref/doc/uid/TP40013257-CH2-SW17) 的说法：  

> 外围设备以广播包的形式广播一些数据。一个广播包是一个相对较小的数据束，其中可能包含外围设备所能提供的有用信息，比如外围设备的名字还有主要功能。例如，数字恒温器可能会广播它能提供房间的当前温度。在 BLE 中，广播是外围设备展示其存在的主要方式。另一方面，中央设备可以扫描和监听任何外围设备，只要这些设备的广播信息是它感兴趣的……  

在这篇教程中，过一会我会向你展示怎样使用 Swift 4 来编码进行外围设备的扫描并连接它们。

## 外围设备的各种服务

服务可能不是你认为的那样。服务*描述*外围设备提供的主要特性或功能。但它并不是一种具体的测量方法，如每分钟心跳数，而是一种描述从外围设备可以得到的与心脏相关的测量方法的分类。  

依照 [**苹果**](https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/CoreBluetoothOverview/CoreBluetoothOverview.html#//apple_ref/doc/uid/TP40013257-CH2-SW17) 的说法：  
> 服务是一个数据和相关行为的集合，用于实现设备（或设备的一部分）的功能或特性。比如，心率检测器的一项服务可能是公开来自监测器的心率传感器的心率数据。

具体定义一个蓝牙“服务”，我们应该看看 Bluetooth SIG 的 [**“GATT Services（服务）”**](https://www.bluetooth.com/specifications/gatt/services) 列表，这里 GATT 代表 [**“Generic Attributes（通用属性）”**](https://www.bluetooth.com/specifications/gatt)。  

向下滚动服务 [**列表**](https://www.bluetooth.com/specifications/gatt/services)，直到你在 **Name（名字）** 列中看到 “Heart Rate”。注意， **Uniform Type Identifier (统一类型标识符)** 对应的是 “org.bluetooth.service.heart_rate”，**Assigned Number（指定编码）** 则是 0x180D。请注意在后面的代码中我们将使用 0x180D 这个值。  

点击 [**“Heart Rate（心率）”**](https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.heart_rate.xml)，你将打开一个网页，上面用粗体字写着 **Name: Heart Rate**。请注意 **Summary（摘要）** ，“HEART RATE Service（心率服务）公开心率和其他与心率传感器相关的数据，用于健身应用。”向下滚动页面就会发现 **Heart Rate** *service* 本身并不会提供每分钟跳动的实际心率。这个服务是一个其他数据片段的集合，它们被称为 *characteristics（特征）*。最后，你会得到一个特征来提供重要数据：心率。  

***Core Bluetooth 视角***  

来自 [**苹果的文档**](https://developer.apple.com/documentation/corebluetooth/cbservice)：  
> [`CBService`](https://developer.apple.com/documentation/corebluetooth/cbservice) 和它的子类 [`CBMutableService`](https://developer.apple.com/documentation/corebluetooth/cbmutableservice) 代表一个外围设备的服务 - 为实现设备（或设备的一部分）的功能或特性而收集的数据和相关行为。`CBService` 对象特指远程外围设备（使用 [`CBPeripheral`](https://developer.apple.com/documentation/corebluetooth/cbperipheral) 对象来表示）的服务。服务组可能是主要的，也有可能是次要的，可能会包含一个特征组的代码，也有可能会包含一个服务组（代表其他的服务组）。  

## 外围设备服务的特征

外围设备的服务常常被分解成更细化但相关的信息。特征通常是我们找到重要信息、真实*数据*的地方。再次查看 [**苹果**](https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/CoreBluetoothOverview/CoreBluetoothOverview.html#//apple_ref/doc/uid/TP40013257-CH2-SW17) 的说明：  
> 服务本身是由特征或包含的服务（这里指别的服务）组成。特征更详细的提供了外围设备的服务信息。例如，刚才描述的心率服务，可能包含一个描述设备的心率传感器所在目标身体位置的特征和另一个传递心率测量数据的特征。  

让我们继续使用 HRM 作为例子。请返回那个用粗体字写着 **Name: Heart Rate（名字：心率）** 的 [**界面**](https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.heart_rate.xml)。向下滚动直到你看到 **Service Characteristics（服务特征）**。那是一个包含大量元数据（*关于*信息的数据）的大表格。请找到 **Heart Rate Measurement（心率测量）** 并点击 [**org.bluetooth.characteristic.heart_rate_measurement**](https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.heart_rate_measurement.xml) 然后审查。稍后我会对这个界面进行解释。  

***Core Bluetooth 视角***  
来自 [**苹果的文档**](https://developer.apple.com/documentation/corebluetooth/cbcharacteristic)： 
> [`CBCharacteristic`](https://developer.apple.com/documentation/corebluetooth/cbcharacteristic) 和它的子类 [`CBMutableCharacteristic`](https://developer.apple.com/documentation/corebluetooth/cbmutablecharacteristic) 代表关于外围设备服务的详细信息。`CBCharacteristic` 对象特指远程外围设备（远程外围设备使用 `CBPeripheral` 对象表示）服务的特征。一个特征包含一个单一的值以及任意个描述符来描述这个值。特征的属性描述了如何使用这个特征的值以及如何访问这些描述符。


## GATT 规范
当你使用 *Core Bluetooth* 开发一款需要与蓝牙外围设备交互的应用程序时，你首先应该前往 Bluetooth SIG 的首页。  

让我们一起回顾我曾经的经历，那会我在开发一个应用程序，用 HRM 做了各种各样非常好玩的功能。查看 [**GATT Specifications（GATT 技术指标）**](https://www.bluetooth.com/specifications/gatt) 部分，然后在 [**GATT Services（GATT 服务）**](https://www.bluetooth.com/specifications/gatt/services) 下面找到你需要的外围设备服务。  

在本文介绍的 HRM 示例中，首先在 [**GATT Services（GATT 服务）**](https://www.bluetooth.com/specifications/gatt/services) 界面的 **Name（名字）** 列中找到 “Heart Rate”（也就是一个超链接）项。点击 [**“Heart Rate（心率）”**](https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.heart_rate.xml) 链接并且查看完整的网站。请记住 **Assigned Number（分配符）**（0x180D）然后滑动到底部的 **Service Characteristics（服务特征）** 表。仔细的查看表格并且找到有兴趣的特征。  

在这个例子中，阅读 **Heart Rate Measurement（心率测量）** 和 **Body Sensor Location（传感器所在身体部位）** 分区，然后点击各自的详细链接，[**org.bluetooth.characteristic.heart_rate_measurement**](https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.heart_rate_measurement.xml) 和 [**org.bluetooth.characteristic.body_sensor_location**](https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.body_sensor_location.xml)。  

在 **Heart Rate Measurement（心率测量）** 以及 **Body Sensor Location（传感器所在身体部位）** 界面中，分别记住它们的 **Assigned Number（分配符）**，（0x2A37）和（0x2A38），然后查看界面中的所有信息，以便了解将被发送到该 HRM 应用程序中的蓝牙编码数据结构该如何解译。编写代码时必须把蓝牙编码数据转换成人类可读的格式。  

随着本教程的深入，我将向你介绍更多细节，特别是当我向你展示，我用来与 BLE HRM 通信的应用程序代码。  

如果你 [**加入**](https://www.bluetooth.com/develop-with-bluetooth/join) Bluetooth SIG ，你可以获得更多关于使用服务和特征进行编程的详细信息。  

## 编写 Core Bluetooth 代码
在这次讨论中，我将假设你了解 iOS 应用程序开发的基础知识，包括 Swift 编程语言和 Xcode *Single View App*（单视图应用程序）模板。测试应用程序的用户界面（UI），包括 Auto Layout（自动布局），代码如下所示，非常简单。  

我将用一系列步骤来描述代码 — 这些步骤在下面的代码中*同样*会被解释。因此，在阅读本节中的步骤时，请参阅下面代码中对应的步骤。整个过程基本上是线性的。请记住，其中一些步骤表示回调 — 正在调用的委托方法。  

在编写应用程序时，我会将 [***Core Bluetooth***](https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/AboutCoreBluetooth/Introduction.html#//apple_ref/doc/uid/TP40013257-CH1-SW1) 组件分解成协议或类 — 例如，将核心功能从 UI 中分离出来。但这段代码的目的是向您展示 *Core Bluetooth* 如何在最少的干扰下工作。我的注释很简单，而且有实际意义。在一个页面中你只会看到重要部分。  

## 示例应用程序样式
针对这篇文章我所开发的应用程序 UI 极其简单。当应用程序被启动，它开始扫描并尝试匹配一个 HRM。扫描的过程通过 `UIActivityIndicatorView` 类在屏幕上显示并旋转来表明。当没有匹配上任一 HRM 时，通过一个红色正方形的 `UIView` 来表明。一旦发现一个 HRM 并初步链接，`UIActivityIndicatorView` 停止旋转并隐藏，并且红色 `UIView` 转变为绿色。当 HRM 完全链接并被访问，我会显示 HRM 的品牌型号和穿戴者放置在身体上的预定位置。此时我会开始读取并且显示穿戴者每分钟的心率，大约每秒更新。大多数 HRM 都是每秒发送一次每分钟心率值。我人为地设计了一个心率数字的脉冲动画让应用看起来更有吸引力，但是你看到的是我*真实*的心率。当 HRM 断开链接，我清空所有的信息文本，将正方形 `UIView` 转变为红色，显示 `UIActivityIndicatorView` 并开始旋转，同时再次开始扫描 HRM。  

以下是我的应用程序在与三个不同品牌的 HRM 匹配运行时的样式 — Scosche Rhythm+，Wahoo TICKR，还有Polar H7：  

![](https://appcoda.com/wp-content/uploads/2018/04/hrm-demo-1024x433.png)  

Rhythm+ 使用红外光“看”我的静脉以确定心率。TICKR 和 H7 使用电极检测告诉我心跳的电脉冲。

## 逐步了解我的代码
你可以在下一段找到完整的源代码。在这里，我将向你介绍实现步骤。  

**Step 0.00 ：** 我必须导入 `CoreBluetooth` 框架。  

**Step 0.0 ：** 指定 GATT 中的 **Assigned Numbers（分配符）** 为常量。我这样做让蓝牙规范的标识符更具可读性和可维护性，针对 [**“心率”**](https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.heart_rate.xml) 服务，其 [**“心率测量”**](https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.heart_rate_measurement.xml) 特征，还有其 [**“身体传感器位置”**](https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.body_sensor_location.xml) 特征。  

**Step 0.1 ：** 创建一个 `UIViewController` 的子类 `HeartRateMonitorViewController`。使 `HeartRateMonitorViewController` 遵守 [`**CBCentralManagerDelegate**`](https://developer.apple.com/documentation/corebluetooth/cbcentralmanagerdelegate) 和 [`**CBPeripheralDelegate**`](https://developer.apple.com/documentation/corebluetooth/cbperipheraldelegate) 协议。我使用协议和委托的设计模式，正如我在 AppCoda 文章中 [**这里**](https://appcoda.com/protocol-oriented-programming/) 还有 [**这里**](https://appcoda.com/swift-delegate/) 分别描述的那样。我们将实现来自两个协议的方法。我们将调用一些 *Core Bluetooth* 的方法，一些方法将由 *Core Bluetooth* 为我们调用，以响应我们自己的调用。  

**Step 0.2 ：** 我们在 `HeartRateMonitorViewController` 类中定义实例变量，它们代表 `CBCentralManager` 和 `CBPeripheral` 类，所以它们在应用程序的生命周期内都是*持续存在*的。  

**Step 1 ：** 我们为进程在后台创建一个并发队列。我希望 *Core Bluetooth* 的运行发生在后台。我希望 UI 保持响应。说不定，在一个更复杂的应用程序中，HRM 可能会运行数小时，为用户收集心率数据。用户可能希望使用其他应用程序特性，例如，修改应用程序设置，或者，如果用户正在跑步，并且希望使用 `Core Location` 来跟踪跑步的路线。因此，在心率数据正在收集和显示的同时，用户可以收集和/或查看他们的地理位置。  

**Step 2 ：** 创建用于扫描、连接、管理和从外围设备收集数据的控制中心。这是*必要*的一步。缺少了控制中心 *Core Bluetooth* 将无法工作。另一个必要的：由于 `HeartRateMonitorViewController` 采用了 `CBCentralManagerDelegate`，我们将 `centralManager` 的委托属性设置成 `HeartRateMonitorViewController`（`self`）。同时我们还为控制中心指定了 `DispatchQueue`。  

**Step 3.1 ：** `centralManagerDidUpdateState` 方法的调用基于设备的蓝牙状态。理想情况下，我们应该考虑一个场景，在该场景中，用户无意（或故意）在 `Settings（设置）` 应用程序中关闭蓝牙。我们*只能*在蓝牙为 `.poweredOn` 状态时才能扫描外围设备。  

**Step 3.2 ：** 控制中心应该扫描感兴趣的外围设备，但*前提*是设备（如iPhone）开启了蓝牙。还记得上面标题为“通过广播找到外围设备”的部分吗？我们就是这样处理这个调用的。我们的监听*只*针对正在广播 [**心率**](https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.heart_rate.xml) 服务（0x180D）的 HRM。我们可以通过添加特定服务的 `CBUUIDs` 到 `serviceUUIDs` 数组参数（标记为 `withServices`），从而达到监听并且连接更多外围设备的目的。例如，在一些健康相关的应用程序中，我们可以监听并连接到 HRM *和*血压监测器或者 BPM（尽管我们需要再创建一个 `CBPeripheral` 类的实例变量）。注意，如果我们做了这个调用：  

```swift
centralManager?.scanForPeripherals(withServices: nil)
```

我们可以监听范围内*所有*蓝牙设备的广播。在一些蓝牙功能类的应用程序中它可能有用。  

**Step 4.1 ：** 找到这个应用程序可以连接哪些*感兴趣的*外围设备（HRM）。这个 `didDiscover` 方法告诉我们，在扫描时，控制中心已经发现了正在广播的 HRM。  

**Step 4.2 ：** 我们*必须*在类的实例变量中保存刚刚发现的外围设备的引用，它将持续存在。如果我们仅仅只是使用了一个局部变量，我们会倒霉的。  

**Step 4.3 ：** 因为 `HeartRateMonitorViewController` 采用了 `CBPeripheralDelegate` 协议，所以 `peripheralHeartRateMonitor` 对象必须将它的 `delegate` 属性设置为 `HeartRateMonitorViewController`（`self`）。  

**Step 5 ：** 我们在 `didDiscover` 中告诉控制中心停止扫描以便保护电池寿命。当已经连接的 HRM 或外围设备断开连接时，我们可以再次开启扫描。  

**Step 6 ：** 此时还在 `didDiscover` 中，我们连接到被发现的感兴趣的外围设备，一个 HRM。  

**Step 7 ：** `didConnect` 方法*仅仅*“当成功与一个外围设备连接时调用。”请注意“成功”这个词。如果你发现一个外围设备但不能连接，那么你需要进行一些调试。请注意我更新了 UI 用来显示我连接了那个外围设备，并表明我已经停止扫描，以及其他一些事情。  

**Step 8 ：** 此时还在 `didConnect` 方法中，我们在外围设备上寻找感兴趣的服务。具体来说，我们希望找到 [**Heart Rate（心率）**](https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.heart_rate.xml)（0x180D）服务。  

**Step 9 ：** 当 `didDiscoverServices` 方法被调用的时候，说明在我们所连接的外围设备上发现了 [**“Heart Rate（心率）”**](https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.heart_rate.xml) 服务。请记住我们需要寻找感兴趣的*特征*。这里我对 **Heart Rate（心率）** 服务的所有特征进行了一次循环以找到我接下来要用的那个。如果你前往 Bluetooth SIG 网页中 [**“Heart Rate（心率）”**](https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.heart_rate.xml) 服务对应的页面，滚动到下面标记为 **Service Characteristics（服务特征）** 的分区，就可以查看那三个可用的特征。  

**Step 10 ：** `didDiscoverCharacteristicsFor service` 方法证明我们已经发现了感兴趣的服务中所有的特征。  

**Step 11 ：** 首先，我订阅了一个通知 - “read” - 关于感兴趣的 **Body Sensor Location（传感器所在身体部位）** 特征。前往 [**“Heart Rate（心率）”**](https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.heart_rate.xml) 服务的页面，你会发现这个特征被标记为“Read Mandatory。”调用 `peripheral.readValue` 将会引起 `peripheral:didUpdateValueForCharacteristic:error:` 方法稍后被调用，所以我可以将这个特征解析成人类语言。其次，我订阅了一个定期通知 — “notify” — 关于感兴趣的 **Heart Rate Measurement（心率测量）** 特征。前往 [**“Heart Rate（心率）”**](https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.heart_rate.xml) 服务的页面，你会发现这个特征被标记为“Notify Mandatory。”调用 `peripheral.setNotifyValue` 将会引起 `peripheral:didUpdateValueForCharacteristic:error:` 方法稍后被调用，并且是几乎*每一秒钟*触发一次，所以我可以将这个特征解析成人类语言。  

**Step 12 ：** 因为我对特征 **Body Sensor Location（传感器所在身体部位）** （0x2A38）订阅了读取值，并且对特征 **Heart Rate Measurement（心率测量）** （0x2A37）订阅了定期获取通知，所以如果它们发送值或者定期更新，我将分别获得这两个二进制值。  

**Step 13 ：** 将 BLE **Heart Rate Measurement（心率测量）** 的数据解译成人们可读的格式。前往 GATT 规范的 [**页面**](https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.heart_rate_measurement.xml) 找到这个特征。第一个字节是关于其余数据的元数据 (**标记**)。规范告诉我看第一个字节的最低有效位，**Heart Rate Value Format bit（心率值的标识位）**。如果是 0（zero），每分钟的心跳数将以 `UINT8` 格式在第二字节。我从来没有遇到过一个 HRM 使用第二个字节以外的任何字节，我在这里演示的三个 HRM 也不例外。这就是为什么我忽略了 **Heart Rate Value Format bit（心率值的标识位）** 值为 1（one）的用例。我看过所有被提到的实现，但从来没有能够测试这些实现。对于我无法重现的情况，我不会发表任何看法。  

**Step 14 ：** 将 BLE **Body Sensor Location（传感器所在身体部位）** 的数据解译成人们可读的格式。前往 GATT 规范的 [**页面**](https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.body_sensor_location.xml) 找到这个特征。这个特征非常简单。将值 1、2、3、4、5、6 或 7 存储在 8 位中。形成的文本字符串与这些值以解译为目的的展示是一样的。  

**Step 15 ：** 当一个外围设备从控制中心断开时，采取适当的行动。我更新我的 UI 以及……  

**Step 16 ：** 开始扫描，为了发现一个正在广播 **Heart Rate（心率）** 服务（0x180D）的外围设备。  

## 我的源代码
这里是对于我们刚刚所讨论的实现，完整的源代码：
```swift
import UIKit

// STEP 0.00: 必须导入 CoreBluetooth framework
import CoreBluetooth

// STEP 0.0: 指定 GATT 中的 "Assigned Numbers" 为常量，这样它们会拥有更好的可读性和可维护性

// MARK: - Core Bluetooth 服务 ID
let BLE_Heart_Rate_Service_CBUUID = CBUUID(string: "0x180D")

// MARK: - Core Bluetooth 特征 ID
let BLE_Heart_Rate_Measurement_Characteristic_CBUUID = CBUUID(string: "0x2A37")
let BLE_Body_Sensor_Location_Characteristic_CBUUID = CBUUID(string: "0x2A38")

// STEP 0.1: 这个类同时采用了控制中心和外围设备的委托协议，所以必须遵守这些协议的要求
class HeartRateMonitorViewController: UIViewController, CBCentralManagerDelegate, CBPeripheralDelegate {
    
    // MARK: - Core Bluetooth 类的成员变量
    
    // STEP 0.2: 分别创建 CBCentralManager 和 CBPeripheral 的实例变量
    // 所以它们在应用程序的生命周期里持续存在
    var centralManager: CBCentralManager?
    var peripheralHeartRateMonitor: CBPeripheral?
    
    // MARK: - UI outlets / 成员变量
    
    @IBOutlet weak var connectingActivityIndicator: UIActivityIndicatorView!
    @IBOutlet weak var connectionStatusView: UIView!
    @IBOutlet weak var brandNameTextField: UITextField!
    @IBOutlet weak var sensorLocationTextField: UITextField!
    @IBOutlet weak var beatsPerMinuteLabel: UILabel!
    @IBOutlet weak var bluetoothOffLabel: UILabel!
    
    // 设置 HealthKit 
    let healthKitInterface = HealthKitInterface()
    
    // MARK: - UIViewController delegate
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // 在视图加载完成以后，通常是通过一个 nib，做所有附加的设置。
        
        // 最初，我们在进行扫描并且没有产生连接
        connectingActivityIndicator.backgroundColor = UIColor.white
        connectingActivityIndicator.startAnimating()
        connectionStatusView.backgroundColor = UIColor.red
        brandNameTextField.text = "----"
        sensorLocationTextField.text = "----"
        beatsPerMinuteLabel.text = "---"
        // 以防 Bluetooth 被关闭
        bluetoothOffLabel.alpha = 0.0
        
        // STEP 1: 为控制中心在后台创建一个并发队列
        let centralQueue: DispatchQueue = DispatchQueue(label: "com.iosbrain.centralQueueName", attributes: .concurrent)
        // STEP 2: 创建用于扫描、连接、管理和从外围设备收集数据的控制中心。
        centralManager = CBCentralManager(delegate: self, queue: centralQueue)
        
        // 从 HKHealthStore 读取心率数据
        // healthKitInterface.readHeartRateData()
        
        // 从 HKHealthStore 读取性别类型
        // healthKitInterface.readGenderType()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // 处理任何可以重新创建的资源
    }
    
    // MARK: - CBCentralManagerDelegate methods

    // STEP 3.1: 这个方法的调用基于设备的蓝牙状态； 
    // 仅在 Bluetooth 为 .poweredOn 时才可以扫描外围设备
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        
        switch central.state {
        
        case .unknown:
            print("Bluetooth status is UNKNOWN")
            bluetoothOffLabel.alpha = 1.0
        case .resetting:
            print("Bluetooth status is RESETTING")
            bluetoothOffLabel.alpha = 1.0
        case .unsupported:
            print("Bluetooth status is UNSUPPORTED")
            bluetoothOffLabel.alpha = 1.0
        case .unauthorized:
            print("Bluetooth status is UNAUTHORIZED")
            bluetoothOffLabel.alpha = 1.0
        case .poweredOff:
            print("Bluetooth status is POWERED OFF")
            bluetoothOffLabel.alpha = 1.0
        case .poweredOn:
            print("Bluetooth status is POWERED ON")
            
            DispatchQueue.main.async { () -> Void in
                self.bluetoothOffLabel.alpha = 0.0
                self.connectingActivityIndicator.startAnimating()
            }
            
            // STEP 3.2: 扫描我们感兴趣的外围设备
            centralManager?.scanForPeripherals(withServices: [BLE_Heart_Rate_Service_CBUUID])
            
        } // END switch
        
    } // END func centralManagerDidUpdateState
    
    // STEP 4.1: 找到这个应用程序可以连接哪些感兴趣的外围设备
    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
        
        print(peripheral.name!)
        decodePeripheralState(peripheralState: peripheral.state)
        // STEP 4.2: 必须储存一个外围设备的引用到类的实例变量中
        peripheralHeartRateMonitor = peripheral
        // STEP 4.3: 因为 HeartRateMonitorViewController 采用了 CBPeripheralDelegate 协议，
        // 所以 peripheralHeartRateMonitor 必须设置他的 
        // delegate 属性为 HeartRateMonitorViewController (self)
        peripheralHeartRateMonitor?.delegate = self
        
        // STEP 5: 停止扫描以保护电池的寿命；当断开链接的时候再次扫描。
        centralManager?.stopScan()
        
        // STEP 6: 与已经发现的，感兴趣的外围设备建立连接
        centralManager?.connect(peripheralHeartRateMonitor!)
        
    } // END func centralManager(... didDiscover peripheral
    
    // STEP 7: “当一个与外围设备的连接被成功创建时调用。”
    // 只有当我们知道与外围设备的连接建立成功之后才能前往下一步
    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        
        DispatchQueue.main.async { () -> Void in
            
            self.brandNameTextField.text = peripheral.name!
            self.connectionStatusView.backgroundColor = UIColor.green
            self.beatsPerMinuteLabel.text = "---"
            self.sensorLocationTextField.text = "----"
            self.connectingActivityIndicator.stopAnimating()
            
        }
        
        // STEP 8: 在外围设备上寻找感兴趣的服务
        peripheralHeartRateMonitor?.discoverServices([BLE_Heart_Rate_Service_CBUUID])

    } // END func centralManager(... didConnect peripheral
    
    // STEP 15: 当一个外围设备断开连接，使用适当的方法
    func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        
        // print("Disconnected!")
        
        DispatchQueue.main.async { () -> Void in
            
            self.brandNameTextField.text = "----"
            self.connectionStatusView.backgroundColor = UIColor.red
            self.beatsPerMinuteLabel.text = "---"
            self.sensorLocationTextField.text = "----"
            self.connectingActivityIndicator.startAnimating()
            
        }
        
        // STEP 16: 在这个用例中，开始扫描相同或其他的外设，只要它们是 HRM，就可以重新联机
        centralManager?.scanForPeripherals(withServices: [BLE_Heart_Rate_Service_CBUUID])
        
    } // END func centralManager(... didDisconnectPeripheral peripheral

    // MARK: - CBPeripheralDelegate methods
    
    func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        
        for service in peripheral.services! {
            
            if service.uuid == BLE_Heart_Rate_Service_CBUUID {
                
                print("Service: \(service)")
                
                // STEP 9: 在感兴趣的服务中寻找感兴趣的特征
                peripheral.discoverCharacteristics(nil, for: service)
                
            }
            
        }
        
    } // END func peripheral(... didDiscoverServices
    
    // STEP 10: 从感兴趣的服务中，确认我们所发现感兴趣的特征
    func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
        
        for characteristic in service.characteristics! {
            print(characteristic)
            
            if characteristic.uuid == BLE_Body_Sensor_Location_Characteristic_CBUUID {
                
                // STEP 11: 订阅关于感兴趣特征的单次通知；
                // “当你使用这个方法去读取特征的值时，外围设备将会调用…… 
                // peripheral:didUpdateValueForCharacteristic:error:”
                //
                // Read    Mandatory
                //
                peripheral.readValue(for: characteristic)
                
            }

            if characteristic.uuid == BLE_Heart_Rate_Measurement_Characteristic_CBUUID {

                // STEP 11: 订阅关于感兴趣特征的持续通知；
                // “当你启用特征值的通知时，外围设备调用……
                // peripheral(_:didUpdateValueFor:error:)” 
                //
                // Notify    Mandatory
                //
                peripheral.setNotifyValue(true, for: characteristic)
                
            }
            
        } // END for
        
    } // END func peripheral(... didDiscoverCharacteristicsFor service
    
    // STEP 12: 每当一个特征值定期更新或者发布一次时，我们都会收到通知；
    // 阅读并解译我们订阅的特征值
    func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
        
        if characteristic.uuid == BLE_Heart_Rate_Measurement_Characteristic_CBUUID {
            
            // STEP 13: 通常我们需要将 BLE 的数据解析成人类可读的格式
            let heartRate = deriveBeatsPerMinute(using: characteristic)
            
            DispatchQueue.main.async { () -> Void in
                
                UIView.animate(withDuration: 1.0, animations: {
                    self.beatsPerMinuteLabel.alpha = 1.0
                    self.beatsPerMinuteLabel.text = String(heartRate)
                }, completion: { (true) in
                    self.beatsPerMinuteLabel.alpha = 0.0
                })
                
            } // END DispatchQueue.main.async...

        } // END if characteristic.uuid ==...
        
        if characteristic.uuid == BLE_Body_Sensor_Location_Characteristic_CBUUID {
            
            // STEP 14: 通常我们需要将 BLE 的数据解析成人类可读的格式
            let sensorLocation = readSensorLocation(using: characteristic)

            DispatchQueue.main.async { () -> Void in
                self.sensorLocationTextField.text = sensorLocation
            }
        } // END if characteristic.uuid ==...
        
    } // END func peripheral(... didUpdateValueFor characteristic
    
    // MARK: - Utilities
    
    func deriveBeatsPerMinute(using heartRateMeasurementCharacteristic: CBCharacteristic) -> Int {
        
        let heartRateValue = heartRateMeasurementCharacteristic.value!
        // 转换为无符号 8 位整数数组
        let buffer = [UInt8](heartRateValue)

        // UInt8: “一个 8 位无符号整数类型。”
        
        // 在缓冲区的第一个字节（8 位）是标记（元数据，用于管理包中其余部分）；
        // 如果最低有效位（LSB）是 0，心率（bpm）则是 UInt8 格式，
        // 如果 LSB 是 1，BPM 则是 UInt16
        if ((buffer[0] &amp; 0x01) == 0) {
            // 第二个字节：“心率的格式被设置为 UINT8”
            print("BPM is UInt8")
            // 将心率写入 HKHealthStore
            // healthKitInterface.writeHeartRateData(heartRate: Int(buffer[1]))
            return Int(buffer[1])
        } else { // 我从来没有看到过这个用例，所以我把它留给理论学家去争论
            // 第二个和第三个字节：“心率的格式被设置为 UINT16”
            print("BPM is UInt16")
            return -1
        }
        
    } // END func deriveBeatsPerMinute
    
    func readSensorLocation(using sensorLocationCharacteristic: CBCharacteristic) -> String {
        
        let sensorLocationValue = sensorLocationCharacteristic.value!
        //  转换为无符号 8 位整数数组
        let buffer = [UInt8](sensorLocationValue)
        var sensorLocation = ""
        
        // 只看 8 位
        if buffer[0] == 1
        {
            sensorLocation = "Chest"
        }
        else if buffer[0] == 2
        {
            sensorLocation = "Wrist"
        }
        else
        {
            sensorLocation = "N/A"
        }
        
        return sensorLocation
        
    } // END func readSensorLocation
    
    func decodePeripheralState(peripheralState: CBPeripheralState) {
        
        switch peripheralState {
            case .disconnected:
                print("Peripheral state: disconnected")
            case .connected:
                print("Peripheral state: connected")
            case .connecting:
                print("Peripheral state: connecting")
            case .disconnecting:
                print("Peripheral state: disconnecting")
        }
        
    } // END func decodePeripheralState(peripheralState

} // END class HeartRateMonitorViewController
```

## 总结
我希望你喜欢这篇教程。买或者借一个 BLE 设备，然后使用我的代码或自己编写代码来连接它。遵循教程中所有我提供的超链接并且阅读它们。查阅 Bluetooth SIG 的 [**网页**](https://www.bluetooth.com/) 以及苹果的 [***Core Bluetooth***](https://developer.apple.com/documentation/corebluetooth)（[**这里**](https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/AboutCoreBluetooth/Introduction.html#//apple_ref/doc/uid/TP40013257-CH1-SW1) 也可以看到）框架文档，你一定可以对蓝牙技术有一个概览。  

感谢阅读。记得享受你的工作。不要忘记，当你的简历上面有蓝牙的经验将是你的职业生涯的一大亮点。  

作为参考，你可以 [**在 GitHub 上面查看完整的源代码**](https://github.com/appcoda/HealthKit-and-Bluetooth-HRM)。