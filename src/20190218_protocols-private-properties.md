title: "协议中的私有属性"
date: 2019-02-18
tags: [协议]
categories: [Olivier Halligon,Swift]
permalink: protocols-private-properties
keywords: Swift，协议
custom_title: Swift 协议中的私有属性
description: 通过另一种方式来控制协议中属性和方法的访问权限

---
原文链接=http://alisoftware.github.io/swift/protocols/2018/09/02/protocols-private-properties/
作者=Olivier Halligon
原文日期=2018-09-02
译者=灰s
校对=numbbbbb,小铁匠Linus
定稿=Forelax

<!--此处开始正文-->

在 Swift 中，协议不能对其声明的属性进行指定的访问控制。如果协议中列出了某个属性，则必须使遵守协议的类型显式声明这些属性。  

不过有些时候，尽管你会在协议中声明一些属性，但你是要利用这些属性来提供你的实现，并不希望这些属性在类型的外部被使用。让我们看看如何解决这个问题。 

<!--more-->
 
## 一个简单的例子

假设你需要创建一个专门的对象来管理你的视图控制器（ViewControllers）导航，比如一个协调器（Coordinator）。  

每个协调器都有一个根控制器 `UINavigationController`，并共享一些通用的功能，比如在它上面推进（push）和弹出（pop）其他 ViewController。所以最初它看起来可能是这样 <a href="#foot1" id="1"><sup>[1]</sup></a>：  

```swift
// Coordinator.swift

protocol Coordinator {
  var navigationController: UINavigationController { get }
  var childCoordinator: Coordinator? { get set }

  func push(viewController: UIViewController, animated: Bool)
  func present(childViewController: UIViewController, animated: Bool)
  func pop(animated: Bool)
}

extension Coordinator {
  func push(viewController: UIViewController, animated: Bool = true) {
    self.navigationController.pushViewController(viewController, animated: animated)
  }
  func present(childCoordinator: Coordinator, animated: Bool) {
    self.navigationController.present(childCoordinator.navigationController, animated: animated) { [weak self] in
      self?.childCoordinator = childCoordinator
    }
  }
  func pop(animated: Bool = true) {
    if let childCoordinator = self.childCoordinator {
      self.dismissViewController(animated: animated) { [weak self] in
        self?.childCoordinator = nil
      }
    } else {
      self.navigationController.popViewController(animated: animated)
    }
  }
}
```

当我们想要声明一个新的 `Coordinator` 对象时，会像这样做：

```swift
// MainCoordinator.swift

class MainCoordinator: Coordinator {
  let navigationController: UINavigationController = UINavigationController()
  var childCoordinator: Coordinator?

  func showTutorialPage1() {
    let vc = makeTutorialPage(1, coordinator: self)
    self.push(viewController: vc)
  }
  func showTutorialPage2() {
    let vc = makeTutorialPage(2, coordinator: self)
    self.push(viewController: vc)
  }

  private func makeTutorialPage(_ num: Int, coordinator: Coordinator) -> UIViewController { … }
}
```

## 问题：泄漏实现细节

这个解决方案在 `protocol` 的可见性上有两个问题：  

- 每当我们想要声明一个新的 `Coordinator` 对象，都必须显式的声明一个 `let navigationController: UINavigationController` 属性和一个 `var childCoordinator: Coordinator?` 属性。**虽然，在遵守协议的类型现实中，我们并没有显式的使用他们** - 但它们就在那里，因为我们需要它们作为默认的实现来供 `protocol Coordinator` 正常工作。  
- 我们必须声明的这两个属性具有与 `MainCoordinator` 相同的可见性（在本例中为隐式 `internal（内部）` 访问控制级别），因为这是 `protocol Coordinator` 的必备条件。这使得它们对外部可见，就像在编码时可以使用 `MainCoordinator`。  

所以问题是我们每次都要声明一些属性——即使它只是一些实现细节，而且这些实现细节会通过外部接口被泄漏，从而允许类的访问者做一些本不应该被允许的事，例如：  

```swift
let mainCoord = MainCoordinator()
// 访问者不应该被允许直接访问 navigationController ，但是他们可以
mainCoord.navigationController.dismissViewController(animated: true)
// 他们也不应该被允许做这样的事情
mainCoord.childCoordinator = mainCoord
```

也许你会认为，既然我们不希望它们是可见的，那么可以直接在第一段代码的 `protocol` 中不声明这两个属性。但是如果我们这样做，将无法通过 `extension Coordinator` 来提供默认的实现，因为默认的实现需要这两个属性存在以便它们的代码被编译。  

你可能希望 Swift 允许在协议中申明这些属性为 `fileprivate`，但是在 Swift 4 中，你不能在 `protocols` 中使用任何访问控制的关键字。  

所以我们如何才能解决这个“既要提供用到这个属性的默认实现，有不让这些属性对外暴露”的问题呢？

## 一个解决方案

实现这一点的一个技巧是将这些属性隐藏在中间对象中，并在该对象中将对应的属性声明为 `fileprivate`。  

通过这种方式，尽管我们依旧在对应类型的公共接口中声明了属性，但是接口的访问者却不能访问该对象的内部属性。而我们对于协议的默认实现却能够访问它们 —— 只要它们在同一个文件中被声明就行了（因为它们是 `fileprivate` ）。  

看起来就像这样：  

```swift
// Coordinator.swift

class CoordinatorComponents {
  fileprivate let navigationController: UINavigationController = UINavigationController()
  fileprivate var childCoordinator: Coordinator? = nil
}

protocol Coordinator: AnyObject {
  var coordinatorComponents: CoordinatorComponents { get }

  func push(viewController: UIViewController, animated: Bool)
  func present(childCoordinator: Coordinator, animated: Bool)
  func pop(animated: Bool)
}

extension Coordinator {
  func push(viewController: UIViewController, animated: Bool = true) {
    self.coordinatorComponents.navigationController.pushViewController(viewController, animated: animated)
  }
  func present(childCoordinator: Coordinator, animated: Bool = true) {
    let childVC = childCoordinator.coordinatorComponents.navigationController
    self.coordinatorComponents.navigationController.present(childVC, animated: animated) { [weak self] in
      self?.coordinatorComponents.childCoordinator = childCoordinator // retain the child strongly
    }
  }
  func pop(animated: Bool = true) {
    let privateAPI = self.coordinatorComponents
    if privateAPI.childCoordinator != nil {
      privateAPI.navigationController.dismiss(animated: animated) { [weak privateAPI] in
        privateAPI?.childCoordinator = nil
      }
    } else {
      privateAPI.navigationController.popViewController(animated: animated)
    }
  }
}
```  

现在，遵守协议的 `MainCoordinator` 类型：  

- 仅需要声明一个 `let coordinatorComponents = CoordinatorComponents() ` 属性，并不用知道 `CoordinatorComponents` 类型的内部有些什么（隐藏了实现细节）。  
- 在 `MainCoordinator.swift` 文件中，不能访问 `coordinatorComponents` 的任何属性，因为它们被声明为 `fileprivate`。  

```swift
public class MainCoordinator: Coordinator {
  let coordinatorComponents = CoordinatorComponents()

  func showTutorialPage1() {
    let vc = makeTutorialPage(1, coordinator: self)
    self.push(viewController: vc)
  }
  func showTutorialPage2() {
    let vc = makeTutorialPage(2, coordinator: self)
    self.push(viewController: vc)
  }

  private func makeTutorialPage(_ num: Int, coordinator: Coordinator) -> UIViewController { … }
}
```

当然，你仍然需要在遵守协议的类型中声明 `let coordinatorComponents` 来提供存储，这个声明必须是可见的（不能是 `private`），因为这是遵守 `protocol Coordinator` 所要求的一部分。但是：  

- 只需要声明 1 个属性，取代之前的 2 个（在更复杂的情况下会有更多）。  
- 更重要的是，即使它可以从遵守协议的类型的实现中访问，也可以从外部接口访问，你却不能对它做任何事情。  

当然，你仍然可以访问 `myMainCoordinator.coordinatorComponents`，但是不能使用它做任何事情，因为它所有的属性都是 `fileprivate` ！  

## 结论

Swift 可能无法提供你想要的所有功能。你可能希望有朝一日 `protocols` 允许对它声明需要的属性和方法使用访问控制关键字，或者通过某种方式将它们在公共 API 中隐藏。  

但与此同时，掌握这些技巧和变通方法可以使你的公共 API 更好、更安全，避免泄露实现细节或者访问在实现之外不应该被修改的属性，同时仍然使用 [Mixin pattern](http://alisoftware.github.io/swift/protocol/2015/11/08/mixins-over-inheritance/) 并提供默认实现。  

---

<a id="foot1" href="#1"><sup>[1]</sup></a>.这是一个简化的例子；不要将注意力集中在 Coordinator 的实现 - 它不是这个例子的重点，更应该关注的是需要在协议中声明公开可访问的属性。