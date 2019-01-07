title: "Swift 傻瓜技巧 #6：有动画或无动画"
date: 2019-01-07
tags: [Swift, 教程]
categories: [Wooji Juice]
permalink: stupid-swift-tricks-6-animations

---
原文链接=http://www.wooji-juice.com/blog/stupid-swift-tricks-6-animations.html
作者=Wooji Juice
原文日期=2018-11-14
译者=石榴
校对=numbbbbb,Cee
定稿=Forelax

<!--此处开始正文-->

流畅的动画一开始就被认为是 iOS 应用的特点之一。这不仅归功于系统提供的在 App 间共享的动画引擎（从而让 App 即便在执行一些繁重任务时也能让动画流畅执行），还归功于系统提供的非常方便的动画 API：

```swift
// 无动画
doStuff()
// 有动画
UIView.animate(withDuration: 1) { doStuff() }
```
只需要将你的代码放进 block（闭包）中，就可以让它们拥有流畅的缓入缓出的动画效果。

然而，如果你使用过这套系统，你可能会遇到一些问题。这个系统可以完美地处理简单的情况，比如让一个东西淡入、淡出，或改变它的颜色，但在更复杂的情况下，这种方法就会开始出现问题。

<!--more-->

例如下面这个例子，你想要淡出一个元素，然后删除它。`UIView` 支持这种操作：
```swift
UIView.animate(withDuration: 1, animations:
{
	someting.alpha = 0
}, completion:
{
	something.removeFormSuperView()
})
```
但你只能把所有东西都写在 `completion` block 里时才会工作。在大型项目中，我们需要把复杂的任务拆解成小的方法。但问题就在这些方法中，像在上个例子中的 `doStuff()`，我们无法在 `completion` block 中添加代码。

我们也无法得知动画有多长（甚至都不知道有没有动画），所以如果我们没有办法简单地和动画时间之间同步（如在 [一个音频编辑软件](http://www.wooji-juice.com/products/ferrite/) 中让进度条同步前进）。

总的来说，我们无法获知关于动画的*信息*，他们仅仅是执行代码，进行或不进行动画，并不会受我们控制。

如果我们在视图中添加带有 Auto Layout 的新元素，事情就会变得更复杂：你需要小心地调用 `UIView.performWithoutAnimation { }`，否则新出现的视图就会从 `(x: 0, y: 0, w: 0, h: 0)` 瞬移到它们的目标位置。

## 视图属性 Animator
很长时间以来，我一直在改变代码中动画的写法。最开始我写了我自己的 `AnimationContext` 类来协助，后来苹果提供了他们功能相同的 `UIViewPropertyAnimator`，现在我会在所有可能的地方使用它。

一般来说，我发现最有效的方法是写一个「可动画」的方法并显式接受一个 animator 参数：
```swift
func doStuff(with animator: UIViewPropertyAnimator? = nil)
{
	// ...
}
```
之后我就可以直接调用 `doStuff()` 不添加动画并完成任务，或调用 `doStuff(with: UIViewPropertyAnimator(duration: 1, curve: .easeInOut))` 或加其他的参数去完成任务并添加动画。

（实际情况中，上述方法通常会被称作 `reflectCurrentState()` 或其他特定领域的名字；该方法执行所有必要的修改，并将视图与最新的数据同步。该方法一般不会被本视图以外的代码调用，而是被视图自己调用，然后会根据需要继续调用其他内部方法，或将 animator 传给其他内部方法。不过这不在本文的讨论范围内。）

`doStuff()` 可以像之前一样，带有或不带有动画执行一个任务。但现在它带有了更多信息：它知道自己是否执行动画；它可以读取 animator 的 `duration` 属性（如果有的话）。他可以调用 animator 的 `addAnimation` 来明确地指定哪些代码需要动画，并直接执行不需要动画的代码；他可以调用 `addCompletion` 来处理 `removeFromSuperView()` 或其他方法。

以上都是相比于之前改进的地方，但也不是没有问题。尤其是它开始变得有点啰嗦：
1. `doStuff(with: ...)` 需要写入一个很长的 `UIViewPropertyAnimator` 构造函数。不是很理想，不过跟下面比起来不算什么：
2. 在 `doStuff()` 内部，需要检查 `UIViewPropertyAnimator` 是否存在并调整代码。

我们不能简单的依赖 optional chaining（可选链式调用)（如 `animator?.addcompletion { something.removeFromSuperview() }`），因为如果 animator 是 `nil` 会导致 block 中的代码被直接跳过，然而无论有没有动画，我们都希望该视图在父视图中被移除。

为了保证正确的行为，你的代码会类似这个样子：
```swift
func doStuff(with animator: UIViewPropertyAnimator? = nil)
{
	if let animator = animator
	{
		_ in something.removeFromSuperview()
	}
	else
	{
		something.removeFromSuperview()
	}
}
```
Objective-C 爱好者即使瞧不起 Optional（可选）也笑不出来 -- 使用 Objective-C 也不会改善这种情况：
```objc
- (void) doStuffWithAnimator: (nullable UIViewPropertyAnimator *) animator
{
	if (animator != nil)
	{
		[animator addCompletion: ^(UIViewAnimatingPosition position)
		{
			[something removeFromSuperview];
		}];
	}
	else
	{
		[something removeFromSuperView];
	}
}
```
一旦你在生产环境中想使用这样的代码，你最终会写出更杂乱、更难于阅读和维护的代码。

幸运的是，我们可以进一步的改进这段代码。

## Optional 不是 `Nil` 的另一个叫法

改进这段代码的诀窍就在于，`UIViewPropertyAnimator` 在这里是 Optional，关键点就在于 Optional 在 Swift 中的意义。

有的时候人们会抱怨 Swift 的 Optional 非常烦人，因为在 Objective-C 中（Objective-C 中使用 `nil` 指针来替代 Swift 中的 Optional）你可以直接对指针调用方法。

Objective-C 不会抱怨指针是不是 `nil`：如果指针非空，方法会直接被调用；如果是空指针，调用会被无声地忽略掉，不用程序员做其他的事情。

我不同意这个意见。在 Swift 中，在你知道你在做什么的情况下，你只需要加一个 `?`，并不是一个很大的负担。但是由于有了 Swift 的 Optional，我们可以做更多事情。

因为在 Swift 中，Optional 是一个“真实的东西”，而不是“缺少的东西”。无论一个 Optional 的值是什么，就算是 `nil`，它也是一个枚举值，你可以对它调用方法，调用的方法也会被执行。[讲真的，Swift 的枚举超级好用！](http://www.wooji-juice.com/blog/stupid-swift-tricks-5-enums)

（有趣的是，在 Objective-C 类中对 Swift 的 `nil` 的底层表示*就是*空指针，所以它们的效率还是很高的。但是语法层面，它们非常的不同。我们会在接下来利用这个性质。）

因为在 Swift 中，你可以对几乎所有类型添加拓展，不仅仅是 Objective-C 类。你可以：
```swift
extension Optional where Wrapped == UIViewPropertyAnimator
{
    @discardableResult
    func addCompletion(_ block: @escaping (UIViewAnimatingPosition)->()) -> Optional<UIViewPropertyAnimator>
    {
        if let animator = self
        {
            animator.addCompletion(block)
        }
        else
        {
            block(.end)
        }
        return self
    }
}
```
这段代码将难看的代码移动到了 Optional 的库中（但只针对 `UIViewPropertyAnimator`）。现在，你的视图可以：
```swift
func doStuff(with animator: UIViewPropertyAnimator? = nil)
{
	animator.addCompletion { _ in something.removeFromSuperview() }
}
```
现在回调函数总会被执行，无论有没有 animator。

（注意 `animator` 和 `addCompletion` 之间没有 `?`）

如果有 animator，block 中的代码会在动画完成时被调用；如果没有 animator，block 中的代码会被立即调用，因为 `nil` Optional 仍然是 Optional，拥有所有 Optional 的方法，当然也包括我们刚刚添加的方法 -- 而不是一个吞下所有的滚落到它表面的方法调用的黑洞。

我还有类似的拓展方法来执行总是需要被执行的任务，有些是动画的一部分，或其他的立即执行的代码：如果我想让一个元素缓入，我会在把元素放入视图之前将 alpha 值设置成 0，然后调用 `animator.perform { something.alpha = 1 }` 来保证它无论有没有动画都会变得可见。

与 Optional 无关，我还在 `UIViewPropertyAnimator` 中添加了一些静态方法来生成一些常见的动画，如：`static func spring(...)`、`static func linear(...)`。Swift 的名称解析方法决定了你可以写出更简洁的代码，如：`doStuff(with: .spring(duration: 1))`。

当然，以上只是一些小的代码技巧，而不是重新构想代码或应用结构。但是随着项目的复杂度增加，像这种小的改进也会叠加起来，帮助我们对抗不断增加的复杂度，维持大型项目的可控性。谢谢你，Swift。[Thwift](https://www.youtube.com/watch?v=9jtU9BbReQk).