title: "Swift 的可选型枚举"
date: 2018-05-17
tags: [Swift]
categories: [KHANLOU]
permalink: enums-and-optionals
keywords: 
custom_title: 
description: 

---
原文链接=http://khanlou.com/2018/04/enums-and-optionals/
作者=Soroush Khanlou
原文日期=2018-04-11
译者=ennisk
校对=numbbbbb
定稿=CMB

<!--此处开始正文-->

去年我写了一篇关于[在类中添加普通可选型属性使扩展功能变得更简单](http://khanlou.com/2017/03/that-one-optional-property/)的文章，但是从长远来看会对代码库造成一定的损害，本文接上一篇内容。

假设你正在设计 App 中的认证流程，而且知道这个流程不是简单的线性执行代码，所以想写一些测试代码。

<!--more-->

首先列举出流程中的每一步：

```swift
enum AuthFlowStep {
    case collectUsernameAndPassword
    case findFriends
    case uploadAvatar
}
```

然后，将所有复杂的逻辑放入到一个函数中，该函数接收当前步骤和当前状态，返回流程中的下一个步骤。

```swift
func stepAfter(_ currentStep: AuthFlowStep, context: UserState) -> AuthFlowStep
```

这应该很容易测试，到目前为止一切正常。

但是，在认真思考逻辑之后，你会发现有时候不能返回 `AuthFlowStep` 。一旦用户提交了所有认证需要的数据，你就需要想个办法表示流程已经结束了。在这个函数中，你需要返回一个特殊值。所以要怎么做呢？很简单，把返回类型改为可选值即可：

```swift
func stepAfter(_ currentStep: AuthFlowStep, context: UserState) -> AuthFlowStep?
```

这个方法可以解决问题，你可以在 [coordinator](http://khanlou.com/2015/10/coordinators-redux/) 中调用这个函数，继续实现你的功能：

```swift
func finished(flowStep: AuthFlowStep, state: UserState, from vc: SomeViewController) {
	let nextState = stepAfter(flowStep, context: state)
```

由于 `nextState` 是可选值，所以最直接的想法就是用 `guard` 方法把它变成非可选值。

```swift
guard let nextState = stepAfter(flowStep, context: state) else {
  self.parentCoordinator.authFlowFinished(on: self)
}
  switch nextState {
  case .collectUsernameAndPassword:
		//build and present next view controller
```

但是我总觉得这里的写法有点问题。阅读 [Olivier 的模式匹配指南](http://alisoftware.github.io/swift/pattern-matching/2016/04/24/pattern-matching-3/#syntactic-sugar-on-optionals) 之后，我发现可以在 `switch` 语句中同时处理可选值和枚举值：

```swift
func finished(flowStep: AuthFlowStep, state: UserState, from viewController: SomeViewController) {
	let nextState = stepAfter(flowStep, context: state) // Optional<AuthFlowStep>
	switch nextState {
	case nil:
		self.parentCoordinator.authFlowFinished(on: self)
	case .collectUsernameAndPassword?:
		//build and present next view controller
```

代码里的那个问号可以匹配枚举的可选值。这种写法确实更好，但还是有点不对劲。既然我已经用了 `switch`，为什么还要做解包操作？`nil` 在这个上下文中又代表着什么？

如果你认真读过这篇文章的标题，或许已经猜到了我下面要做什么。我们先来看看可选值的定义。在底层代码中，它和 `AuthFlowState` 一样是个枚举：

```swift
enum Optional<Wrapped> {
	case some(Wrapped)
	case none
}
```

把枚举转换成可选类型时，实际上只是向枚举中添加了一个新值。既然我们能直接控制 `AuthFlowStep`，直接给它添加一个新值就能实现同样的效果。

```swift
enum AuthFlowStep {
    case collectUsernameAndPassword
    case findFriends
    case uploadAvatar
    case finished
}
```

现在我们可以从函数返回值类型中删掉 `?` 了。

```swift
func stepAfter(_ currentStep: AuthFlowStep, context: UserState) -> AuthFlowStep
```

我们的 `switch` 语句现在可以直接处理所有步骤，不需要对 `nil` 做特殊处理。

为什么这样更好？有几个原因：

首先，现在 `nil` 对应的情况有了具体的名字。以前，使用该函数的用户可能不清楚函数返回 `nil` 意味着什么。他们要么去阅读文档求助，要么直接阅读函数代码，分析什么时候会返回 `nil` 。

第二，简单才是王道，不需要先用 `guard` 解包再用 `switch` 判断，也不需要用 `swtich` 语句处理两层枚举，一层枚举更容易处理。

最后，代码更加健壮。`return nil` 应该留给真正异常情况。下一个开发者可能需要在某些特殊情况发生时退出函数，他想都没想就写了个 `return nil`。这时 `nil` 就具备了两种含义，你的代码无法正确处理。

当你把特殊情况添加到枚举中时，需要想好到底使用什么名字。你有很多选择，挑一个最合适的：`.unknow`，`.none`，`.finished`，`.initial`，`.notFound`，`.default`，`.nothing`，`.unspecified` 等等（需要注意，如果你有一个 case 匹配的是 `.none`，并且匹配的值是可选值，那么 `Option.none` 和 `YourEnum.none` 都会引起歧义，所以不要在匹配可选值的时候使用 `.none` 去表示你自己的状态）。

这篇文章介绍的是流程状态，但我觉得这种模式也同样适用其他情况 — 如果你想把一个枚举改成可选值，最好先停下来想一想，是否可以给枚举加一个新值来表示特殊情况。

感谢 [Bryan Irace](https://irace.me/) 提出的反馈和示例代码。