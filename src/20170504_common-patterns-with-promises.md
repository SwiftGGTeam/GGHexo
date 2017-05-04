title: "Promise 的几种通用模式"
date: 2017-05-04
tags: [iOS 开发]
categories: [KHANLOU]
permalink: common-patterns-with-promises
keywords: 
custom_title: 
description: 

---
原文链接=http://khanlou.com/2016/08/common-patterns-with-promises/
作者=Soroush Khanlou
原文日期=2016/8/8
译者=Cwift
校对=Crystal Sun
定稿=CMB

<!--此处开始正文-->

> 译者注：英文原文发布时间较早，故原文代码中的 Swift 版本较旧，但是作者已将 GitHub 上的 [Promise 示例代码](https://github.com/khanlou/Promise)更新到了最新 Swift 版本，所以译者在翻译本文时，将文章里的代码按照 GitHub 上的示例代码进行了替换，更新成了最新版本的 Swift 代码。

上周，我写了一篇[介绍 Promise 的文章](http://swift.gg/2017/03/27/promises-in-swift/)，Promise 是处理异步操作的高阶模块。只需要使用 `fulfill()`、`reject()` 和 `then()` 等函数，就可以简单自由地构建大量的功能。本文会展示我在 Promise 方面的一些探索。

<!--more-->

### Promise.all

`Promise.all` 是其中的典型，它保存所有异步回调的值。这个静态函数的作用是等待所有的 Promise 执行 fulfill（履行） ，一旦全部执行完毕，`Promise.all` 会使用所有履行后的值组成的数组对自己执行 fulfill。例如，你可能想在代码中对数组中的每个元素打点以捕获某个 API 的完成状态。使用 `map` 和 `Promise.all` 很容易实现：

```swift
let userPromises = users.map({ user in
	APIClient.followUser(user)
})
Promise.all(userPromises).then({
	//所有的用户都已经执行了 follow！
}).catch({ error in
	//其中一个 API 失败了。
})
```

要使用 `Promise.all`，需要首先创建一个新的 Promise，它代表所有 Promise 的组合状态，如果参数中的数组为空，可以立即执行 fulfill。

```swift
public static func all<T>(_ promises: [Promise<T>]) -> Promise<[T]> {
    return Promise<[T]>(work: { fulfill, reject in
        guard !promises.isEmpty else { fulfill([]); return }
			
    })
}
```

在这个 Promise 内部，遍历每个子 Promise，并分别为它们添加成功和失败的处理流程。一旦有子 Promise 执行失败了，就可以拒绝高阶的 Promise。

```swift
for promise in promises {
    promise.then({ value in

    }).catch({ error in
        reject(error)
    })
}
```

只有当所有的 Promise 都执行成功，才可以 `fulfill` 高阶的 Promise。检查一下以确保没有一个 Promise 被拒绝或者挂起，使用一点点 `flatMap` 的魔法，就可以对 Promise 的组合执行 fulfill 操作了。完整的方法如下：

```swift
public static func all<T>(_ promises: [Promise<T>]) -> Promise<[T]> {
        return Promise<[T]>(work: { fulfill, reject in
            guard !promises.isEmpty else { fulfill([]); return }
            for promise in promises {
                promise.then({ value in
                    if !promises.contains(where: { $0.isRejected || $0.isPending }) {
                        fulfill(promises.flatMap({ $0.value }))
                    }
                }).catch({ error in
                    reject(error)
                })
            }
        })
    }
```

请注意，Promise 只能履行或者拒绝一次。如果第二次调用 `fulfill` 或者 `reject`，不会对 Promise 的状态造成任何影响。

因为 Promise 是状态机，它保存了与完成度有关的重要状态。它是一种不同于 `NSOperation` 的方法。虽然 `NSOperation` 拥有一个完成回调以及操作的状态，但它不能保存得到的值，你需要自己去管理。

`NSOperation` 还持有线程模型以及优先级顺序相关的数据，而 Promise 对代码 *如何* 完成不做任何保证，只设置 *完成后*  需要执行的代码。Promise 类的定义足以证明。它唯一的实例变量是 `state`，状态包括挂起、履行或者拒绝（以及对应的数据），此外还有一个回调数组。（它还包含了一个隔离队列，但那不是真正的状态。）

### delay

有一种很有用的 Promise 可以延迟执行自己的操作。

```swift
public static func delay(_ delay: TimeInterval) -> Promise<()> {
    return Promise<()>(work: { fulfill, reject in
        DispatchQueue.main.asyncAfter(deadline: .now() + delay, execute: {
            fulfill(())
        })
    })
}
```

在方法内部，可以使用 `usleep` 或者其他方法来实现延迟，不过 `asyncAfter` 方法足够简单。当构建其他有趣的 Promise 时，这个延迟 Promise 会很有用。

### timeout

接下来，使用 `delay` 来构建 `timeout`。该 Promise 如果超过一定时间就会被拒绝。

```swift
public static func timeout<T>(_ timeout: TimeInterval) -> Promise<T> {
    return Promise<T>(work: { fulfill, reject in
        delay(timeout).then({ _ in
            reject(NSError(domain: "com.khanlou.Promise", code: -1111, userInfo: [ NSLocalizedDescriptionKey: "Timed out" ]))
        })
    })
}
```

这个 Promise 自身没有太多用处，但它可以帮助我们构建一些其他功能的 Promise。

### race

`Promise.race` 是 `Promise.all` 的小伙伴，它不需要等待所有的子 Promise 完成，它只履行或者拒绝第一个完成的 Promise。

```swift
public static func race<T>(_ promises: [Promise<T>]) -> Promise<T> {
    return Promise<T>(work: { fulfill, reject in
        guard !promises.isEmpty else { fatalError() }
        for promise in promises {
            promise.then(fulfill, reject)
        }
    })
}
```

因为 Promise 只能被执行或拒绝一次，所以当移除了 `.pending` 的状态后，在外部对 Promise 调用 `fulfill` 或者 `reject` 不会产生任何影响。

有了这个函数，使用 `timeout` 和 `Promise.race` 可以创建一个新的 Promise，针对成功、失败或者超过了规定时间三种情况。把它定义在 `Promise` 的扩展中。

```swift
public func addTimeout(_ timeout: TimeInterval) -> Promise<Value> {
    return Promise.race(Array([self, Promise<Value>.timeout(timeout)]))
}
```

可以在正常的 Promise 链中使用它，像下面这样：

```swift
APIClient
    .getUsers()
    .addTimeout(0.5)
    .then({
    	//在 0.5 秒内获取了用户数据
    })
    .catch({ error in
    	//也许是超时引发的错误，也许是网络错误
    })
```

这是我喜欢 Promise 的原因之一，它们的可组合性使得我们可以轻松地创建各种行为。通常需要保证 Promise 在 *某个时刻* 被履行或者拒绝，但是 timeout 函数允许我们用常规的方式来修正这种行为。

### recover

`recover` 是另一个有用的函数。它可以捕获一个错误，然后轻松地恢复状态，同时不会弄乱其余的 Promise 链。
我们很清楚这个函数的形式：它应该接受一个函数，该函数中接受错误并返回新的 Promise。recover 方法也应该返回一个 Promise 以便继续链接 Promise 链。

```swift
extension Promise {
    public func recover(_ recovery: @escaping (Error) throws -> Promise<Value>) -> Promise<Value> {
    
    }
}
```

在方法体中，需要返回一个新的 Promise，如果当前的 Promise（`self`）执行成功，需要把成功状态转移给新的 Promise。

```swift
public func recover(_ recovery: @escaping (Error) throws -> Promise<Value>) -> Promise<Value> {
    return Promise(work: { fulfill, reject in
        self.then(fulfill).catch({ error in
        
        })
    })
}
```

然而，`catch` 是另一回事了。如果 Promise 执行失败，应该调用提供的 `recovery` 函数。该函数会返回一个新的 Promise。无论 recovery 中的 Promise 执行成功与否，都要把结果返回给新的 Promise。

```swift
//...
do {
    try recovery(error).then(fulfill, reject)
} catch (let error) {
    reject(error)
}
//...
```

完整的方法如下：

```swift
public func recover(_ recovery: @escaping (Error) throws -> Promise<Value>) -> Promise<Value> {
    return Promise(work: { fulfill, reject in
        self.then(fulfill).catch({ error in
            do {
                try recovery(error).then(fulfill, reject)
            } catch (let error) {
                reject(error)
            }
        })
    })
}
```

有了这个新的函数就可以从错误中恢复。例如，如果网络没有加载我们期望的数据，可以从缓存中加载数据：

```swift
APIClient.getUsers()
    .recover({ error in 
        return cache.getUsers()
    }).then({ user in
    	//更新 UI
    }).catch({ error in
    	//错误处理
    })
```

### retry

重试是我们可以添加的另一个功能。若要重试，需要指定重试的次数以及一个能够创建 Promise 的函数，该 Promise 包含了重试要执行的操作（所以这个 Promise 会被重复创建很多次）。

```swift
public static func retry<T>(count: Int, delay: TimeInterval, generate: @escaping () -> Promise<T>) -> Promise<T> {
    if count <= 0 {
        return generate()
    }
    return Promise<T>(work: { fulfill, reject in
        generate().recover({ error in
            return self.delay(delay).then({
                return retry(count: count-1, delay: delay, generate: generate)
            })
        }).then(fulfill).catch(reject)
    })
}
```

* 如果数量不足 1，直接生成 Promise 并返回。
* 否则，创建一个包含了需要重试的 Promise 的新的 Promise，如果失败了，在 `delay` 时间之后恢复到之前的状态并重试，不过此时的重试次数减为 `count - 1`。

基于之前编写的 `delay` 和 `recover` 函数构建了重试的函数。

在上面的这些例子中，轻量且可组合的部分组合在一起，就得到了简单优雅的解决方案。所有的这些行为都是建立在 Promise 核心代码所提供的简单的 `.then` 和 `catch` 函数上的。通过格式化完成闭包的样式，可以解决诸如超时、恢复、重试以及其他可以通过简单可重用的方式解决的问题。这些例子仍然需要一些测试和验证，我会在未来一段时间内慢慢地添加到 [GitHub 仓库](https://github.com/khanlou/Promise) 中。