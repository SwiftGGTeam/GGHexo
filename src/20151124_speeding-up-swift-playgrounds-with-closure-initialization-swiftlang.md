title: "如何使用闭包初始化来加速 Swift 的 playground"
date: 2015-11-24
tags: [Swift 入门]
categories: [Erica Sadun]
permalink: speeding-up-swift-playgrounds-with-closure-initialization-swiftlang

---
原文链接=http://ericasadun.com/2015/11/15/speeding-up-swift-playgrounds-with-closure-initialization-swiftlang/
作者=Erica Sadun
原文日期=2015-11-15
译者=JackAlan
校对=小铁匠Linus
定稿=千叶知风

<!--此处开始正文-->

Swift 的 Playground 可能会莫名其妙地变慢，尤其当你使用 SpriteKit 或 SceneKit 时。尽可能的把代码迁移到外部资源文件中，可以优化编译并获得更好的运行时速度。

<!--more-->

这种方法的最大问题在于，你会因此失去在 Playground 中的线性流 `linear flow`。模块编译不支持修改变量的顶层指令。比如，你有类似如下的代码：

```swift
public let lightNode = SCNNode()
lightNode.light = SCNLight()
lightNode.light!.type = SCNLightTypeOmni
lightNode.position = SCNVector3(x: 0, y: 10, z: 10)
scnscene.rootNode.addChildNode(lightNode)
```

(我很抱歉使用强制解包，但是这是来自苹果的示例代码。)

你不能将这些代码直接移到一个模块文件中，因为你使用的是顶级调用，这些代码不会在外部 Swift 文件中被编译。你可能会把这些代码放在一个函数里，来作为一种变通的方法，例如：

```swift
internal func setupLightNode() -> SCNNode {
let theLight = SCNNode()
theLight.light = SCNLight()
theLight.light!.type = SCNLightTypeOmni
theLight.position = SCNVector3(x: 0, y: 10, z: 10)
scnscene.rootNode.addChildNode(theLight)
return theLight
}
```

然后你可以在声明后调用该函数：

```swift
let lightNode = setupLightNode()
```

这挫爆了，这种方式创建了一个不必要的额外函数，而且它强制让你在一个新的实例被声明前去处理这个实例。

闭包提供了一种更吸引人、相对轻量的解决方案。正如下面你将看到的样例。在这里，将初始化的代码打包在一个单独的组中，执行并最终返回完全初始化的实例。

```swift
// create and add a light to the scene
public let lightNode: SCNNode = {
  let theLight = SCNNode()
  theLight.light = SCNLight()
  theLight.light!.type = SCNLightTypeOmni
  theLight.position = SCNVector3(x: 0, y: 10, z: 10)
  scnscene.rootNode.addChildNode(theLight)
  return theLight
}()
```

这种方法使你可以使用单独的语句来创建和初始化一个对象，保留你在 Playground 中声明的流动性和可读性，而且运行的会更快一点。

这个[视频](https://vid.me/BrPC)包含了这次 lightNode 的代码与其他设置操作。在点击 Playground 的 “运行” 按钮后，只花了 3-4 秒，而不像此前的数分钟。这种加速方法对于建立以 SpriteKit 和 SceneKit 为元素的原型，在部署到实际的应用前，变得更有实际意义。

**更新**：如下是另外一种可以建立类实例的方法：

```swift
infix operator •-> {}

// prepare class instance
func •-> <T>(object: T, f: (T) -> Void) -> T {
  f(object)
  return object
}

class MyClass {var (x, y, z) = ("x", "y", "z")}
let myInstance = MyClass() •-> {
 $0.x = "NewX"
 $0.y = "NewY"
}
```

不知你意下如何？