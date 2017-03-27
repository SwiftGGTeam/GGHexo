Swift 中的 Promise"

> 作者：Soroush Khanlou，[原文链接](http://khanlou.com/2016/08/promises-in-swift/)，原文日期：2016-08-01
> 译者：[Cwift](http://weibo.com/277195544)；校对：[walkingway](http://chengway.in/)；定稿：[CMB](https://github.com/chenmingbiao)
  









Promise 是一种链接异步任务的方式。通常来说，异步任务会在异步操作完成时执行回调闭包（有时候要准备两个闭包，一个代表成功，一个代表失败）。要执行多个异步操作，必须将第二个异步操作放在第一个异步操作的完成闭包中执行：

    
    APIClient.fetchCurrentUser(success: { currentUser in
    	APIClient.fetchFollowers(user: currentUser, success: { followers in
    		//现在你得到了一个 followers 数组
    	}, failure: { error in
    		// 错误处理
    	})
    }, failure: { error in
    	// 错误处理
    })

**Promise** 的作用是格式化完成闭包，简化链式异步调用的形式。如果系统能够分辨成功和失败，那么组合这些异步操作就变得容易很多。比如，编写具有下列功能的可重用代码：

* 使用尾闭包执行一系列依赖关系的异步操作
* 通过一个完成闭包同时执行多个独立的异步操作
* 多个异步操作竞争，返回第一个完成的值
* 重试异步操作
* 为异步操作设置超时时间



上面的代码转换为 Promise 样式如下：

    
    APIClient.fetchCurrentUser().then({ currentUser in
    	return APIClient.fetchFollowers(user: currentUser)
    }).then({ followers in
    	// you now have an array of followers
    )}.onFailure({ error in
    	// hooray, a single failure block!
    })

（你可能注意到了，Promise 是将嵌套/缩进样式的代码变成一个层级的代码：Promise 是一个 [monad](http://khanlou.com/2015/09/what-the-heck-is-a-monad/)。）

Promise 在 JavaScript 社区中反响热烈。因为 Node.js 的设计中包含了非常多异步操作，即便是简单的任务也需要用到链式的异步回调。即便只有三、四个这样的操作，代码会变得笨重。Promise 终结了提心吊胆写回调的日子，Promise 已经写进了 JavaScript ES6 的规范。[这篇博客](http://www.mattgreer.org/articles/promises-in-wicked-detail/)介绍了 JavaScript Promise 的运作机制。

JavaScript Promise 实现的一个亮点是它有一个非常明确的规范，称为 A+，你可以在 [promisejs.org](https://www.promisejs.org) 查看详情。这意味着依赖 JavaScript 的弱类型系统，多个 Promise 的实现可以融合，彼此之间可以互相操作。只要你的 Promise 中的 `then` 函数定义符合规范，它就可以和其他库中的 Promise 连接。这太棒了。

当我在编写 [Backchannel](https://backchannel.io)（一个 Node 项目） 的 API 时，我逐渐爱上了 Promise。A+ 规范有一个非常好的 API，不使用 monad 中那个命名简单且易于理解的 `then` 方法（在  A+ 规范中被重构为 `flatMap` 和 `map`）。不过这个 API 不适合每个人（我完全能理解你为什么更喜欢显性的功能名称），但我真的很喜欢它，并开始在 Swift 中实现一个类似的库。

你可以在 [Github](https://github.com/khanlou/Promise) 上找个这个库。编写的过程很具有启发性，我想分享一些学习过程中的人生经验。

## 魔幻的枚举

没错，大家都知道。枚举非常棒。因为 Promise 本质上是状态机，所以枚举用在这里非常合适。[JavaScript Promise 实现的参考](https://www.promisejs.org/implementing/)如下所示：

    javascript
    var PENDING = 0;
    var FULFILLED = 1;
    var REJECTED = 2;
    
    function Promise() {
      // 保存 PENDING, FULFILLED 或者 REJECTED 的状态
      var state = PENDING;
    
      // 当出现 FULFILLED 或 REJECTED 状态时保存值或者错误
    var value = null;
    
      //保存被 .then 或者 .done 函数触发的成功 & 失败的处理操作
      var handlers = [];
    }

我想找不到比 Swift 的枚举实现更完美的例子了。以下是 Swift 中的实现：

    
    enum State<Value> {
        case pending
        case fulfilled(value: Value)
        case rejected(error: ErrorType)
    }
    
    final class Promise<Value> {    
        private var state: State<Value>
        private var callbacks: [Callback<Value>] = []
    }

> 译者注：原文的 case 名为首字母大写，根据当前版本改为了首字母小写。

外部数据依赖于 Promise 的具体状态，所以被封装到对应 case 的关联值中。当 Promise 处于 `.pending` 状态时，任何外部数据都没有意义，枚举在类型系统中表达出的语义是不可思议的。

我唯一要批判的是泛型不能被嵌套进其他类型中，并且这个缺陷在 [Swift 3 中不会更改](https://bugs.swift.org/browse/SR-985)。

## 类型系统很不错

创建一个新的 JavaScript Promise 时，可以使用便捷构造器：

    javascript
    var promise = new Promise(function(resolve, reject) {
    	someAsyncRequest(function(error, result) {
    		if (error) {
    			reject(error);
    		}
    		resolve(result);
    	});
    });

你传入了一个包含两个其他函数的函数，主要有两个功能：第一个函数参数对应 Promise 操作成功的情况，第二个对应了失败的情况。这两个函数的顺序很重要。因为 JavaScript 不是类型安全的，如果你在上面的第一行代码中写错了顺序，写成了 `reject, resolve`（我不想承认我也经常这么写），你很容易就向 `resolve` 函数中引入了错误。另一方面，Swift 是类型安全的，这意味着 `reject` 函数的类型是 `(ErrorType) -> Void)`，该函数不会被成功的结果所接受。所以妈妈再也不用担心我会弄乱 `reject` 和 `resolve` 函数的顺序了。

## 太多的类型可能会令人沮丧

我的 `Promise` 的类型中使用了泛型 `Value`，这是它的内部值类型。意味着你可以通过类型推断而不用指定具体的类型。

    
    let promise = Promise(value: "initialValue") // a fulfilled Promise<String>

因为 Promise 经常被链式调用，依靠类型推断来确定类型将会特别有用。必须向链中的每个步骤添加明确的类型是件令人沮丧的事，最终的样式也不是很有 Swift 的风格。

我的第一个解决方案是对 `Error` 也使用泛型。这种严格性使得每次创建一个已经履行的 Promise 都需要指定错误的类型。

    
    let promise = Promise<String, APIError>(value: "initialValue")

这使得一行简单的代码增加了很多不必要的包袱，所以我删除了指定错误类型的功能。

不幸的是，删除显式的错误类型意味着我不得不失去一个小小的类型系统的优势。假设你使用了一个叫 `NoError` 的空枚举，它有效地表达出 Promise 不能失败的语义。因为空的枚举不能被初始化，所以 Promise 不能进入到 rejected 的状态，这是个心痛的损失，但我认为这是值得的，因为这样在其他上下文中使用 Promise 变得更简单。我希望能在实践中使用这个类，以便深入体会并思考不设置错误类型否是个明智的决定。

补充一点，Swift 的泛型宣言包含 [“默认的泛型参数”](https://github.com/apple/swift/blob/c39da37525255d3bc141038ff567b4aca57d316e/docs/GenericsManifesto.md#default-generic-arguments)，这是解决当前问题的好办法：你可以指定它默认遵守协议 `ErrorType`（译者注：Swift 3.0 以后已经改为 Error 了），如果有人传入具体的类型，该类型必须遵守该协议。

## 函数式编程中的方法难以理解

Promise 的类型是一个 monad，也就是说你可以对它调用 `flatMap`。传递给 `flatMap` 的函数会返回一个新的 Promise，返回的 Promise 的状态将成为该调用链的状态。

不过，`flatMap` 的函数名是绝对不能忽视的。它无法使用一种易读的方式表达函数中发生的事情。这是我喜欢 A+ 规范的 Promise API 的原因之一。JavaScript 中的 `then` 函数被重载为 `flatMap` 函数（为调用链返回一个新的 Promise）和 `map` 函数（为调用链中的下一个 Promise 返回一个新值）。`then` 只意味着“下一步做这件事”，而不知道下一件事情的工作原理。

## 测试是个好习惯

一旦我写了一个类的基本实现，我会写几个测试。我积累了一些 XCTest 中的 `expectationWithDescription` 和 `waitForExpectationsWithTimeout` 的经验，这两个 API 非常好用。

和 [cookbook 项目](http://khanlou.com/2016/04/horse_cookbooks/)类似，对 Promise 类进行全方位的测试很有必要。和往常一样，编写测试时需要一些前期准备工作，但这些成本完全值得。当我重构和清理这段代码时，测试捕获了非常多错误。Promise 的实现是非常脆弱的，代码执行顺序的微小细节都会微妙地改变类的行为。使用测试套件是个证实重构前后一致性的好办法。

## 线程很棘手

因为 Promise 的本命是处理线程和异步，所以 Promise 需要是一个线程安全的类。为了使线程安全，它的实例变量需要从同一个队列中访问。这比我预期的要困难的多。即便我已经胸有成竹了，依旧有好几个地方搞砸了。

其中有两项测试尤其的脆弱，每运行 5-10 次，测试组件就会失败。不稳定的测试是最脆弱的，你想象一下，一个宇宙射线，在正确的时刻击中了你电脑的 RAM ，导致测试失败。

其中一个不稳定的测试导致了一个 `EXC_BAD_ACCESS`，这非常令人困惑，因为我无法想象如何用 Swift 的方式访问坏内存。我花费了一些时间，终于得到了一份日志消息，表明这是一个线程问题。我在不同的线程中向同一个数组中添加数据。我更正了访问实例变量的代码，以便能够正确使用派发队列的代码，现在不稳定测试变的可靠了。

你可以在 [Github](https://github.com/khanlou/Promise) 上找到对应的代码。我还没有把它打造成一个带有 `public` 声明和 podspec 的完整库，我想要先在一个真正的 app 中使用它，观察一下情况。

Promise 看上去复杂又神奇，它的实现流程几乎都依赖于 `then` 函数的实现。一旦我得到一个可运行的实现版本，我就可以编写测试去反对它，这些测试促使我慢慢重构代码，找到副作用引起的 bug。


> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。