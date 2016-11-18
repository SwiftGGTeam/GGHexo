切片职责"

> 作者：Soroush Khanlou，[原文链接](http://khanlou.com/2016/10/slicing/)，原文日期：2016-10-13
> 译者：[Cwift](http://blog.csdn.net/cg1991130)；校对：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  









重构是一个持续性的过程。然而，在频繁的重构过程中还需要保证开发的功能可用。如果不能保证，代码就不能被定期部署，这会使得你的代码与团队中其他人的代码保持同步变得更加困难。

即便如此，有一些重构难度额外大。在某些特定的情况中，单例的特性会使其与很多不同的对象耦合，很难从工程中把单例删掉。

许多单例，特别是那些[命名很差劲的单例](http://khanlou.com/2014/11/a-controller-by-any-other-name/)，会逐渐积累无关的行为、数据以及任务，只是因为向单例中增加这些比向其他对象中添加容易很多。

如果想拆分一个影响深远的单例，或者想测试使用单例的代码，就会有很多工作要做。你想用更小、更好的对象慢慢地替换掉单例的引用，但是在完全完成之前不能删除单例本身，因为还有其他的对象依赖它。

最糟糕的是，不能将单例的行为和方法提取到另一个对象中，因为它们依赖于单例内部的共享状态。换句话说，如果单例没有任何共享状态，你可以在每次调用时创建一个新的实例，问题就立马解决了。

有一个单例，包含了许多不同的职责和一堆共享的状态，应用中很多部分都在使用此单例。如何才能在不删除单例代码的情况下解除应用对这个单例的依赖？



需要一种新的方法来引用单例：将单例的海量职责拆分成不同的片段，这些片段将以单例中的（view）来表示，而不是对单例本身的结构进行实际变更。这个片段的行为和数据可以用协议来表示。

想象一下这种单例在一个虚拟的购物应用中：

    class SessionController {
    
    	static let sharedController: SessionController
    
    	var currentUser: User
    	
    	var cart: Cart
    	
    	func addItemToCart(item: Item) { }
    	
    	var fetchedItems: [Item]
    	
    	var availableItems: [Item]
    	
    	func fetchAvailableItems() { }
    }

这个单例至少有三种职责。我们想要拆解它，但是代码库中有数十个类引用了这个对象的属性和方法。如果为每一『片』职责定义一个协议，就可以开始拆分它了。

    protocol CurrentUserProvider {
    	var currentUser: User { get }
    }
    
    protocol CurrentCart {
    	var cart: Cart { get }
    	
    	func addItemToCart(item: Item)
    }
    
    protocol ItemFetcher {
    	var fetchedItems: [Item] { get }
    	
    	var availableItems: [Item] { get }
    	
    	func fetchAvailableItems()
    }
`SessionController` 可以遵守下面这些协议，无需任何额外的工作：

    class SessionController: CurrentUserProvider, CurrentCart, ItemFetcher {
    	//...

得益于 Swift 的协议扩展，我们可以将任何纯粹依赖于协议的功能转移到协议扩展中。举个例子，`availableItems` 可能是数组 `fetchedItems` 中 `status` 属性为 `.available` 的元素集合。我们可以把它从单例中移到具体的协议中：

    extension ItemFetcher {
    	var availableItems: [Item] {
    		return fetchedItems.filter({ $0.status == .available })
    	}
    }

通过这种做法，我们开始给单例瘦身，提取不相关的细节。

有了这些协议，就可以在应用中使用了。第一步是找到所有用到单例的地方，把单例提取成一个实例变量：

    class ItemListViewController {
    	let sessionController = SessionController.sharedController
    	
    	//...
    }

接下来可以把它的类型改成具体的协议类型：

    class ItemListViewController {
    	let itemFetcher: ItemFetcher = SessionController.sharedController
    	
    	//...
    }

现在这个类从技术上来说仍旧可以访问单例，以受限制的方式访问，很明显这个类只需要使用单例的 `ItemFetcher` 切片。还没完呢，下一步，使用 `ItemFetcher` 初始化这个类：

    let itemFetcher: ItemFetcher
    
    init(itemFetcher: ItemFetcher) {
        self.itemFetcher = itemFetcher
        super.init(nibName: nil, bundle: nil)
    }

现在，这个类不知道初始化时使用的 `ItemFetcher` 是什么类型的。可以是这个单例，但是也可以是别的类型！这被称为[依赖注入](http://irace.me/di)。它允许我们向视图、控制器和其他对象中注入备用的依赖，这将让这些对象的测试变得更加容易。必须更新整个程序中该视图控制器的初始化方式，使用新的构造器。

理想状态下，试图控制器的初始化只在[协调器](http://khanlou.com/2015/10/coordinators-redux/)内部完成，所以应减少传入的单例的数量。如果不使用协调器，那么有可能导航控制器中第四个视图控制的任何依赖都需要经过前三个视图控制器的传递。这很不理想。

现在，该处理最困难的部分了：必须在程序中所有引用了单例的地方重复这个操作。这是一个乏味的过程，一旦你弄清楚了各种任务和协议之后，就剩下死记硬背了。（一个提示：如果有一个 `CurrentUserProvider`，可能需要一个单独的 `MutableCurrentUserProvider`。只需要从当前用户读取数据的对象也不需要具有写入的权限。）

一旦改变了对单例的所有引用，就拔掉了单例很多的牙齿了。可以删除单例的静态单例访问器属性，然后视图控制器和其他对象将只能使用向它们中传入遵守协议的对象了。

从这里开始，你有几个选择。现在可以轻松地把单例分解成所有轻量级任务。

* 你可以把 `ItemFetcher` 定义为类而不是协议，然后把所有代码从 `SessionController` 中转移到新的 `ItemFetcher` 类中，然后传入类替代单例。
* 你可以将 `ItemFetcher` 保留为协议，然后创建一个名为 `ConcreteItemFetcher` 的类，然后把单例中的代码添加到该类中。这个方案给了你更多的选项，可以注入遵守 `ItemFetcher` 协议的其他对象，适合做单元测试、屏幕截图测试、演示一个应用以及其他用途。工作量会更大，但是同时也更加灵活。

通过在单例上创建职责的“切片”，你可以将单例拆解成任务组件，同时不改变单例本身的结构。可以使用依赖注入让对象只能得到希望它们使用的东西。最后，可以使单例不再具有单例的访问器，然后在优良代码的美好日落中自由骑行。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。