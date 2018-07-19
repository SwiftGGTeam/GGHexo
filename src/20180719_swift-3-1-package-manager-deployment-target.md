title: "Swift Package Manager 重写 macOS 部署目标"
date: 2018-07-19
tags: [iOS 开发]
categories: [Ole Begemann]
permalink: swift-3-1-package-manager-deployment-target
keywords: 
custom_title: 
description: 

---
原文链接=https://oleb.net/blog/2017/04/swift-3-1-package-manager-deployment-target/
作者=Ole Begemann
原文日期=2017-04-07
译者=EyreFree
校对=liberalism,Firecrest
定稿=CMB

<!--此处开始正文-->

Swift 3.1 修复了 [Swift Package Manager](https://swift.org/package-manager/) 无法重写 MacOS 部署目标的 Bug。

当你在 macOS 上执行 `swift build` 命令时，包管理器目前（Swift 3.0 和 3.1）会将部署目标硬编码为 macOS 10.10 ¹  现已证明是命令参数的一个 [Bug](https://bugs.swift.org/browse/SR-2535) 引起的 Swift 3.0 中无法重写部署目标这个问题。

<!--more-->

因此，你不能轻松编译用到了最新 API 的代码 ²  举个栗子，假设有一个非常简单的包，只包含几行代码在一个源文件中。这个程序用到了 macOS 10.12 引入的新的 [单位和测量类型](https://oleb.net/blog/2016/07/measurements-and-units/) 来将一个值从以 km/h 转换为 m/s ：

```swift
// main.swift
import Foundation

let kph = Measurement(value: 100,
    unit: UnitSpeed.kilometersPerHour)
let mps = kph.converted(to: .metersPerSecond)
print("\(kph) is \(mps)")
```

在 macOS（Swift 3.0 或 3.1）上用 `swift build` 命令编译上面这段代码会报错，因为这段代码用到的 API 在 macOS 10.10 上不可用：

```bash
$ swift build
Compile Swift Module 'Units' (1 sources)
main.swift:3:11: error: 'Measurement' is only available on OS X 10.12 or newer
let kph = Measurement(value: 100,
          ^
main.swift:3:11: note: add 'if #available' version check
let kph = Measurement(value: 100,
          ^
...
<unknown>:0: error: build had 1 command failures
error: exit(1): /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swift-build-tool -f .build/debug.yaml
```

在 Swift 3.1 中，你可以在命令行中修改部署目标，如下所示：

```bash
$ swift build -Xswiftc "-target" \
    -Xswiftc "x86_64-apple-macosx10.12"
Compile Swift Module 'Units' (1 sources)
Linking ./.build/debug/Units
```

现在，你可以正常执行之前的这段代码了：

```bash
$ .build/debug/Units
100.0 km/h is 27.7778 m/s
```

## 结论

除了部署目标，另一个常见的自定义编译设置例子是传递一个 `DEBUG` 标志给编译器，所以可以在你的代码中使用 `#if DEBUG/#endif` 代码段作为标志传递给编译器，从而来判断是否处于 Debug 模式 - 当前包管理器并没有在 Debug 构建模式下自动完成这些工作。你可以通过 `swift build -Xswiftc "-D" -Xswiftc "DEBUG"` 命令实现这一目的。

这仍然不够理想 - 你在每次执行 `swift build` 或 `swift test` 命令时都需要手动输入命令行参数 - 但至少这是可行的。

对于包管理器来说能够在包配置清单中指定自定义编译设置是 [Swift 4 路线图](https://lists.swift.org/pipermail/swift-evolution-announce/2017-January/000307.html)的一部分。我猜我们很快就会看到一个和这一特性有关的 [Swift 发展提案](https://apple.github.io/swift-evolution/)。

---

1. 你可以通过添加如下代码段到你的 `main.swift` 文件然后编译并执行对应包的方式来验证这一点：

```swift
#if os(macOS)
     print("macOS deployment target:", __MAC_OS_X_VERSION_MIN_REQUIRED)
#endif
```

如果在 macOS 执行，将会打印：

```bash
macOS deployment target: 101000
```

2. 你必须把所有依赖新 API 的代码用 `if #available(macOS 10.12, iOS 10.0, tvOS 10.0, watchOS 3.0, *) { ... }` 或类似的 block 进行包裹。

