title: "Core NFC 指南 - iOS 设备中的 NFC"
date: 2017-09-25
tags: [Swift 进阶]
categories: [Jameson Quave]
permalink: core-nfc-tutorial-for-nfc-on-ios-devices
keywords: 
custom_title: 
description: 

---
原文链接=http://jamesonquave.com/blog/core-nfc-tutorial-for-nfc-on-ios-devices/
作者=Jameson Quave
原文日期=2017-06-06
译者=冬瓜
校对=Forelax
定稿=CMB

<!--此处开始正文-->

在 iOS 11 发布后，开发者们首次可以在 iPhone7 或者更高的设备上调用 NFC 读取相关的接口。这些接口可以用于传递身份信息或者是用于实现类似门禁、地铁闸机这种功能的数据交换应用。

在 iOS 11 中，这项技术被称作 Core NFC，下面我将在教程中使用 Swift 4 来讨论如何使用它。

![](/img/articles/core-nfc-tutorial-for-nfc-on-ios-devices/nfc2.pngzoom=2&w=5841512890761.307122)

<!--more-->

<iframe width="560" height="315" src="https://www.youtube.com/embed/SD6Rm4cGyko" frameborder="0" allowfullscreen></iframe>

由于 Core NFC 目前权限为只读状态，非接触式支付功能是不被开放的，但是仍旧有一些能够使用 Core NFC 读取能力的~~使用~~场景。下面我们来讲述一下。

使用 NFC 的第一步是在 Apple Developer Center 中通过 App ID 来启用它。创建一个新的 App ID，并启用 "NFC Tag Reading" 这个功能。


![](/img/articles/core-nfc-tutorial-for-nfc-on-ios-devices/entitlement.pngzoom=2&w=5841512890761.528886)


这之后，我建议专门为这个 App ID 创建一个 development/distribution provisioning profile 文件，这样当你尝试构建 App 的时候，NFC 读取功能将会自动加入。

接下来，你需要在 Xcode 项目中的 projectName.entitlements 中为的工程添加授权。你需要右键点击该文件并选择"Open As Source Code"，显示如图所示：

```xml
<key>com.apple.developer.nfc.readersession.formats</key>
<array>
  <string>NDEF</string>
</array>
```

如果没有 entitlements 文件，可以在项目中手动创建并把他加到工程的 build settings 中。在 "Build Settings" 下点击 "Coding Signing Entitlements" 选项并加入 entitlements 文件的相对路径。本例中是 "CoreNFC-Tutorial/CoreNFC-Tutorial.entitlements" ，因为我的工程文件在 "CoreNFC-Tutorial" 子目录下。

然后，需要为 Xcode 项目增加 usage string。打开 Info.plist 文件，增加 "Privacy - NFC Scan Usage Description" 这个键值。当用户使用 NFC 时，这个键值填写的内容会作为通知消息展示给用户，所以我们最好写一些有用的信息，比如可以填写 “NFC is needed to unlock doors.”。

接下来，在代码中引入 `CoreNFC` 模块。

```swift
import CoreNFC
```

备注：Core NFC 在 iOS 的模拟器上不可用， 即便是导入模块也会编译失败。因此 Core NFC 相关代码只能真机调试。

这里我创建了一个 `NFCHelper.swift` 文件，并将所有 NFC 相关的 API 调用封装成一个 NFCHelper 类。在 `init` 方法中我创建了一个会话 ，Core NFC 需要使用 `NFCNDEFReaderSession` 这个 class 来监听 NFC 设备，从而完成通信。（注意 `NFCReaderSession` 是一个抽象类，不能直接使用）

```swift
class NFCHelper {
  init() {
    let session =
      NFCNDEFReaderSession(delegate: self,
                           queue: nil,
                           invalidateAfterFirstRead: true)
    session.begin()
  }
}
```

以上代码中我们创建了一个会话，并且为 `Dispatch Queue` 这个参数传递了一个 nil 值。这样可以使得 `NFCNDEFReaderSession` 自动创建一个串行 Dispatch Queue。

创建会话的时候，我们也要为 `NFCDEFReaderSession` 设置代理对象。这里我使用 `NFCHelper` class 来作为代理，所以我们需要遵守 `NFCNDEFReaderSessionDelegate` 协议。这个协议是基于 `NSObjectProtocol` 协议的，所以我们需要继承 `NSObject`（译者注：NSObject 协议在 Swift 中的名称为 NSObjectProtocol）。`NFCNDEFReaderSessionDelegate` 有两个必须实现的代理方法：

```swift
func readerSession(_ session: NFCNDEFReaderSession, didInvalidateWithError error: Error)
 
func readerSession(_ session: NFCNDEFReaderSession, didDetectNDEFs messages: [NFCNDEFMessage])
```

当 NFC 的会话获取到验证错误，或是 NFC 的感应被触发时，这两个回调方法就会被调用。我们对回调信息的处理方式取决于我们 App 的使用场景，但是所有能够获取到的信息都可以通过 `didDetectNDEFs` 回调方法中的 `messages` 变量得到。在一开始，你可以通过遍历并打印 `messages` 中的元素来了解这些信息的内容。每个元素均是 `NFCDEFPayload` 对象，并且每一个对象都会包括 `identifier`、`payload`、`type` 和 `typeNameFormat` 这些属性。

```swift
func readerSession(_ session: NFCNDEFReaderSession, didDetectNDEFs messages: [NFCNDEFMessage]) {
  print("Did detect NDEFs.")
  // 遍历 messages 数组中所有元素
  for message in messages {
    for record in message.records {
      print(record.identifier)
      print(record.payload)
      print(record.type)
      print(record.typeNameFormat)
    }
  }
}
```

我们了解了这些属性的含义之后，就可以将其集成在前端 App 中，这里我针对我的应用创建了一个专门的回调方法，你应该也会做类似的事情，这里我增加了一个回调的属性，便于我的前端页面用这个属性来做进一步的展示：

当我从 NFC 获得一个有效信号或是一个错误的时候，会调用这个回调：

```swift
class NFCHelper: NSObject, NFCNDEFReaderSessionDelegate {
  ...
  var onNFCResult: ((Bool, String) -> ())?
  ...
}
```

另外我还实现了把创建会话的方法封装到了一个新的方法中，这样我就可以通过 `ViewController` 中的一个 button 点击触发来创建一个新的会话。关于 `NFCHelper.swift` 的最终代码如下：

```swift
//
//  NFCHelper.swift
//  CoreNFC-Tutorial
//
//  Created by Jameson Quave on 6/6/17.
//  Copyright © 2017 Jameson Quave. All rights reserved.
//
 
import Foundation
import CoreNFC
 
class NFCHelper: NSObject, NFCNDEFReaderSessionDelegate {
 
  var onNFCResult: ((Bool, String) -> ())?
 
  func restartSession() {
    let session =
    NFCNDEFReaderSession(delegate: self,
                       queue: nil,
                       invalidateAfterFirstRead: true)
    session.begin()
  }
  // MARK: NFCNDEFReaderSessionDelegate
  func readerSession(_ session: NFCNDEFReaderSession, didInvalidateWithError error: Error) {
    guard let onNFCResult = onNFCResult else {
      return
    }
    onNFCResult(false, error.localizedDescription)
  }
  func readerSession(_ session: NFCNDEFReaderSession, didDetectNDEFs messages: [NFCNDEFMessage]) {
    guard let onNFCResult = onNFCResult else {
      return
    }
    for message in messages {
      for record in message.records {
        if(record.payload.count > 0) {
          if let payloadString = String.init(data: record.payload, encoding: .utf8) {
              onNFCResult(true, payloadString)
          }
        }
      }
    }
  }
 
}
```

另外我还搭建了一个简易的 UI 视图来展示这个类的用法：

```swift
//
//  ViewController.swift
//  CoreNFC-Tutorial
//
//  Created by Jameson Quave on 6/6/17.
//  Copyright © 2017 Jameson Quave. All rights reserved.
//
 
import UIKit
 
class ViewController: UIViewController {
  var helper: NFCHelper?
  var payloadLabel: UILabel!
  var payloadText = ""
  override func viewDidLoad() {
    super.viewDidLoad()
    // 增加检测按钮
    let button = UIButton(type: .system)
    button.setTitle("Read NFC", for: .normal)
    button.titleLabel?.font = UIFont(name: "Helvetica", size: 28.0)
    button.isEnabled = true
    button.addTarget(self, action: #selector(didTapReadNFC), for: .touchUpInside)
    button.frame = CGRect(x: 60, y: 200, width: self.view.bounds.width - 120, height: 80)
    self.view.addSubview(button)
    // 添加一个 Label 来显示状态
    payloadLabel = UILabel(frame: button.frame.offsetBy(dx: 0, dy: 220))
    payloadLabel.text = "Press Read to see payload data."
    payloadLabel.numberOfLines = 100
    self.view.addSubview(payloadLabel)
  }
  // 当 NFCHelper 已经处理过或者通信失败时调用
  func onNFCResult(success: Bool, message: String) {
    if success {
      payloadText = "\(payloadText)\n\(message)"
    }
    else {
      payloadText = "\(payloadText)\n\(message)"
    }
    // 在主线程中更新 UI 
    DispatchQueue.main.async {
      self.payloadLabel.text = self.payloadText
    }
 
  }
  // 当用户点击 NFC 读取按钮时调用
  @objc func didTapReadNFC() {
    if helper == nil {
      helper = NFCHelper()
      helper?.onNFCResult = self.onNFCResult(success:message:)
    }
    payloadText = ""
    helper?.restartSession()
  }
}
```

有了以上的基本框架，你就可以结合你具体的需求来为你的 APP 添砖加瓦了。无论是识别客人身份、检测 Amiibo 状态（译者注：[Amiibo](https://zh.wikipedia.org/wiki/Amiibo) 是任天堂推出的基于 NFC 的玩偶），甚至是完成支付，Apple 推出的 Core NFC API 终于为这些新设备提供了完成各类 NFC 功能的可能性。如果你在开发任何集成了 NFC 功能的产品，欢迎发邮件到<a href="jquave@gmail.com">jquave@gmail.com</a>和我交流。

[完整源码](https://github.com/jquave/TagReader)

[视频教程](https://www.youtube.com/watch?v=SD6Rm4cGyko&feature=youtu.be)