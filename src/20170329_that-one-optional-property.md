title: "一个可选型的属性"
date: 2017-03-29
tags: [Swift 进阶]
categories: [KHANLOU]
permalink: that-one-optional-property
keywords: 
custom_title: 
description: 

---
原文链接=http://khanlou.com/2017/03/that-one-optional-property/
作者=Ole Begemann
原文日期=2017/3/6
译者=Cwift
校对=walkingway
定稿=CMB

<!--此处开始正文-->

有时候为了新增一个功能，会去修改你的 `ViewController` 。但代码总是环环相扣的，你会发现在 `ViewController` 中引入一个可选型的属性时，在某些情况下该属性会被赋值，而在另一些情况下它不会被赋值。

我认为大多数情况下，这种方案是有缺陷的。原因有几点。首先，当一个类含有未使用的可选型属性时，这个类中描述身份的语义会变弱。换句话说，添加可选型属性会模糊 [类型的基本语义](http://khanlou.com/2017/01/the-underlying-structure/) 。第二，可选型的属性不带任何语义。如果该属性的值是 `nil` ，那么当前对象处于什么状态呢？如果别人只是粗略浏览你的代码，并不能搞清楚什么情况下属性会是 `nil` ，或者如果属性是 `nil` 的话对对象本身有什么影响。第三，代码会继续发生变异。一个可选型的属性会变成两个，然后变成三个，等你发现的时候已经掉坑里了。在某个值还是 `nil` 的时候你想要表达出该值当前必须存在的意愿，仅靠普通的可选型是办不到的。

在我见过的代码库中，我发现有两种原因可能会致使你在 `ViewController` 中添加一个可选型的属性。我会对这些情况进行探索，提出有针对性的更好的解决方案。

<!--more-->

首先，当你使用某个 `ViewController` 时，它的内部有一些对象或者数据不是每次都会用到，这可能会导致你定义一个有问题的可选型属性。
比如，某些情况下你点击了推送消息打开了一个 `ViewController` 。它需要展示推送中携带的特殊消息。最简单的解决方式就是添加一个可选型的字符串属性：

```swift
class LocationViewController: UIViewController {

	//...
	
	var notificationMessage: String?
	
	//...
}
```

`ViewController` 上的其他代码根据该消息是否存在来确定视图该如何分配，如何布局等等。属性的可选型身份所体现的含义不仅仅局限于该字符串是否存在。它对 `ViewController` 和 `View` 层的其余部分都有影响。

更重要的是，该字符串现在不再代表一个字符串是否存在 —— 它现在表示 `ViewController` 的呈现样式或模式。那么该字符串是在推送通知的上下文中创建的，还是通过正常浏览创建的呢？你只能勉强从这个属性上寻找答案！

想要解决这个问题，必须使这种模式完全显化。一旦某个对象成为 `ViewController` 中的一等公民，它对 `ViewController` 的影响将更加明显。

```swift
class LocationViewController: UIViewController {

	//...
	
	enum Mode {
		case fromNotification(message: String)
		case normal
	}
	
	var mode: Mode
	
	//...
}
```

正如 Sandi Metz 所说，[代码的行为不具有特殊性](https://www.youtube.com/watch?v=OMPfEXIlTVE)。一个开发者观念中的——有时候——我——这样——使用的可选型属性，代码不会承认这个属性为 `nil` 的情况也有意义，更何况是要承认它自带特殊性。使用枚举，特殊性就可以被代码重组并格式化。

注意新定义的枚举与 `Optional` 枚举的定义格式非常相似。

```swift
enum Optional<Wrapped> {
	case some(Wrapped)
	case none
}
```

不过，二者之间有一些非常有价值的区别。

首先，语义。`some` 和 `none` 是抽象的；`normal` 和 `fromNotification` 具有与字面值相关的意义。代码的读者会感谢你的。

其次，可扩展性。此时如果向 `ViewController` 中添加另一种模式，我们有更好的方式完整地描述它。如果新模式永远不能与前两种模式重叠，我们可以在枚举中新增一个 `case` ，并关联必要的类型。如果该新模式可以与当前的两种模式相重叠，则它可以成为一个新的枚举或者一个新的属性。这样做使得对象的状态更加易于描述。这两种选择都好于向对象中添加一个描述新模式的可选型属性。

第三点，还是可扩展性。因为 `LaunchViewController.Mode` 是一等公民，所以可以向其中添加函数和计算属性。例如，保存通知消息的 Label 高度可能取决于消息的长度。因此，我们可以把这段代码移动到枚举的定义中：

```swift
extension Mode {
	var notificationLabelHeight: CGFloat {
		switch self {
		case .normal: return 0
		case .fromNotification(let message): return message.size().height
		}
	}
}
```

把数据迁移到更强大的类型中，你只需编写极少的代码便能从前沿的特性中获益。

使用可选型属性的第二个原因是第一个原因的子集。在某些情况下，可选型的属性不用来表示 `ViewController` 的不同模式，它表示的是代码的时间维度。因为当前还没有获得该值，所以无法初始化对应的属性。常见的例子是通过网络请求数据，或者对系统资源进行耗时的异步检索。

```swift
class UserViewController: UIViewController {
	
	//...
	
	// 会被异步加载
	var user: User?
	
	//...
	
}
```

如果以数组的形式返回数据那么则不需要写成可选型。因为可以用空数组表示数据不存在的状态，不过即便不使用可选型这个问题也依旧存在。每次我想要给 `TableViewController` 设置一个空状态都感到难以下手，这足以说明该问题的严重程度。

由于第二个问题是第一个问题的子集，所以可以用相同的方式解决它，使用枚举：

```swift
enum LoadingState<Wrapped> {
	case initial
	case loading
	case loaded(Wrapped)
	case error(Error)
}
```

虽然这个方案可以奏效，但是有更好的抽象模型来管理异步状态。一个当前不存在，但是会在未来某个时刻被赋值的值正适合使用 `Promise` 来表示。`Promise` 有几个优点，具体的情况取决于你的应用情景。

首先，`Promise` 允许突变，但只有一次机会，并且只能从挂起状态突变。一旦 `Promise` 发生突变（状态变为“完成”），它就不能再改变了。（如果你需要可以多次更新的对象，使用 `Signal` 或者 `Observable` 都可以。）这意味着你可以拥有类似 `let` 的语义，但管理的仍旧是异步的数据。

其次，`Promise` 可以添加闭包，当发生赋值时该闭包会执行。假设属性的类型仍然是一个简单的可选型，那这些添加的闭包就相当于属性观察器 `didSet` 中的代码。不过 `Promise` 的闭包更加强大，因为你可以添加多个，并且你可以在类的任何地方添加它们。这之后，当 `Promise` 被赋值后进入完成状态，此时闭包中的代码会立即执行。

最后，如果有必要，`Promise` 也可以处理错误。对于某些类型的异步数据，这一点很重要，现在你可以免费得到这些功能。

如果你正在用 [我编写的 `Promise` 库](https://github.com/khanlou/Promise) ，你可以使用无参的构造器创建一个挂起状态的 `Promise`，稍后调用 `fulfill` 方法来完成它。

当遇到可选型的属性时，它可能会揭示之前未察觉到的代码问题。当你发现自己正在向一个 `ViewController` 添加一个可选型的参数时，不妨扪心自问，这个可选型是什么意思？有没有更好的方式来表示这个数据？