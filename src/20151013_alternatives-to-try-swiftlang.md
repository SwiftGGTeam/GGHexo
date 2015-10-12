title: "try? 的替代实现"
date: 2015-10-13 09:00:00
tags: [Erica Sadun]
categories: [Swift 进阶]
permalink: alternatives-to-try-swiftlang

---
原文链接=http://ericasadun.com/2015/09/03/alternatives-to-try-swiftlang/
作者=Erica Sadun
原文日期=2015-09-03
译者=我偏笑
校对=shanks
定稿=千叶知风
发布时间=2015-10-13T09:00:00

`try？` 语法的优点在于你不必把可能会抛出错误的函数写在一个 `do-catch` 代码块当中。如果你使用了 `try?`，该函数的返回值就会是一个可选类型：成功返回 `.Some`，失败则返回 `.None`。你可以配合着 `if-let` 或者 `guard` 语句来使用 `try?` 语法。
<!--more-->
`try?` 语法的不足则在于它对错误的简化，让你难以了解到错误是什么以及错误发生的时间。这可不是件好事。

但你可以试着自己写出 `try?` 的替代方法。比如实现一个简单的枚举`Result`：

    enum Result<T> {
        case Value(T)
        case Error(ErrorType)
    }

就像上面的代码写的那样，我喜欢分成 `Value` 和 `Error` 而不是 `err` 和 `ok` ，枚举的不同状态可以按你自己的喜好来命名。

然后你可以写个函数来执行 `do-catch` 语句，然后把执行结果包含在上面定义的枚举中返回。

	func tryit<T>(block: () throws -> T) -> Result<T> {
    	do {
        	let value = try block()
        	return Result.Value(value)
    	} catch {return Result.Error(error)}
	}

实际上我也不太喜欢 tryit 这个名字，你可以你喜欢的名字代替。

这个函数的调用有点啰嗦。原来的写法是：

	let result = try myFailableCoinToss()

新的写法是：

~~`let result = tryit{try myFailableCoinToss()}`~~ *感谢bigonotetaker指出错误*
`let result = tryit(myFailableCoinToss)`

读者glessard提供给我一个很棒的替代方式，建议我给`Result`添加一个初始化方法而不是用 tryit：

	enum Result<T> {
    	case Value(T)
    	case Error(ErrorType)
    
    	init(_ block: () throws -> T) {
        	do {
            	let value = try block()
            	self = Result.Value(value)
        	} catch {
            	self = Result.Error(error)
        	}
    	}
	}

然后你直接这么调用就行了：

	let result = Result(myFailableCoinToss)

你需要用 `if-let` 和 `guard` 之外的语句来拆包你的返回值，可以用 `switch`：

~~let result = tryit{try myFailableCoinToss()}~~
	let result = tryit(myFailableCoinToss)
	switch result {
	case .Value(let value): print("Success:", value)
	case .Error(let error): print("Failure:", error)
	}

或者直接用模式匹配：

	if case .Value(let value) = result {
    	print("Success:", value)
	} else if case .Error(let error) = result {
   		print("Failure:", error)
	}

你也可以添加一些退出作用域的代码来模仿 `guard`，这的确可行，但是代码太难看了。

	enum Result<T> {
    	case Value(T)
    	case Error(ErrorType)
    
    	func unwrap() throws -> T {
        	if case .Value(let value) = self {return value}
        	throw "Unable to unwrap result"
    	}
    
    	func handleError(errorHandler: ErrorType -> Void) -> Bool {
        	if case .Error(let error) = self {
            	errorHandler(error)
            	return true
        	}
        	return false
    	}
	}

	func tryit<T>(block: () throws -> T) -> Result<T> {
    	do {
        	let value = try block()
        	return Result.Value(value)
    	} catch {return Result.Error(error)}
	}
	
	~~let result = tryit{try myFailableCoinToss()}~~
	let result = tryit(myFailableCoinToss)

	// guard error
	if result.handleError({
    	error in
    	print("Error is \(error)")
	}) {fatalError()} // leave scope on true

	// force try for success case
	let unwrappedResult = try! result.unwrap()

	// result is now usable at top level scope
	print("Result is \(unwrappedResult)")

这还有另外一种更像 `try?` 的方式，但是需要打印了所有产生的错误信息。

	func tryit<T>(block: () throws -> T) -> Optional<T>{
    	do {
        	return try block()
    	} catch {
        	print(error)
        	return nil
    	}
	}

这种替代 `try?` 的方法不仅拥有了 `if-let` 和 `guard` 的语句特性，还能返回错误。你可以用之前`Result`调用的方式使用它：

~~`let result = tryit{try myFailableCoinToss()}`~~
`let result = tryit(myFailableCoinToss)`

你仍然不能基于错误类型和错误细节来制定错误处理策略，但是这种实现方式也不像 `try?` 那样把错误信息完全丢弃掉了。

你也可以修改`tryit`函数，让它也能接受做错误处理的`block`，但因为会有两个闭包，这个函数就会变得相当臃肿。我尝试过几种不同的实现方式，但都做的不太好，就不在这分享出来了。最大的问题是，就算你把做错误处理的`block`传给`tryit`了，你也不能像 `guard`语句那样退出作用域，而且也没有这样的`guard`的替代形式能接受`try?`的错误来作退出作用域`block`的参数。

我觉得我最后实现的应该类似于下面的这种形式，在顶层作用域中执行条件赋值，并采用  `guard` 语句的方式来替代普通的 `try`：

	guard let result = try!! myFailableCoinToss() else {error in ...}

之所以这么做是因为我们想知道我们的程序到底会不会出错，如果不出错的话，直接就能得到返回值了。

	let result = try myFailableCoinToss()

在当前的状态下，如果要用 `try` （而且又需要进行错误处理的话），你就必须得用 `do-catch` 或者像`Result`枚举之类的变通方法。

非常感谢[Mike Ash](http://mikeash.com/)的帮忙！