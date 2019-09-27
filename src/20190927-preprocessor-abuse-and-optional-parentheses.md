title: "宏定义与可选括号"
date: 2019-09-27
tags: [iOS,macro]
categories: [Mike Ash]
permalink: preprocessor-abuse-and-optional-parentheses
keywords: macro
description: Objective-C 中 C 语言宏定义扩展

---

原文链接=https://www.mikeash.com/pyblog/friday-qa-2015-03-20-preprocessor-abuse-and-optional-parentheses.html
作者=Mike Ash 
原文日期=2015-03-20 
译者=俊东 
校对=numbbbbb,Nemocdz
定稿=Pancf
<!--此处开始正文-->
前几天我遇到了一个有趣的问题：如何编写一个 C 语言预处理器的宏，删除包围实参的括号？

今天的文章，将为大家分享我的解决方案。
<!--more-->
## 起源

C 语言预处理器是一个相当盲目的文本替换引擎，它并不理解 C 代码，更不用说 Objective-C 了。它的工作原理还算不错，可以应付大部分情况，但偶尔也会出现判断失误。

这里举个典型的例子：

```objc
XCTAssertEqualObjects(someArray, @[ @"one", @"two" ], @"Array is not as expected");
```

这会无法编译，并且会出现非常古怪的错误提示。预处理器查找分隔宏参数的逗号时，没能将数组结构 `@ [...]` 中的东西理解为一个单一的元素。结果代码尝试比较 `someArray` 和 `@[@"one"`。断言失败消息 `@"two"]` 和 `@"Array is not as expected"` 是另外的实参。这些半成品部分用于 `XCTAssertEqualObjects` 的宏扩展中，生成的代码当然错得离谱。

要解决这个问题也很容易：添加括号就行。预编译器不能识别 `[]`，但它*确实*知道 `()` 并且能够理解应该忽略里面的逗号。下面的代码就能正常运行：

```objc
XCTAssertEqualObjects(someArray, (@[ @"one", @"two" ]), @"Array is not as expected");
```

在 C 语言的许多场景下，你添加多余的括号也不会有任何区别。宏扩展开之后，生成的代码虽然在数组文字周围有括号，但没有异常。你可以写搞笑的多层括号表达式，编译器会愉快地帮你解析到最里面一层：

```objc
NSLog(@"%d",((((((((((42)))))))))));
```

甚至将 `NSLog` 这样处理也行：

```objc
((((((((((NSLog))))))))))(@"%d",42);
```

在 C 中有一个地方你不能随意添加括号：类型（types）。例如：

```objc
int f(void); // 合法
(int) f(void); // 不合法
```

什么时候会发生这种情况呢？这种情况并不常见，但如果你有一个使用类型的宏，并且类型包含的逗号不在括号内，则会出现这种情况。宏可以做很多事情，当一个类型遵循多个协议时，在 Objective-C 中可能出现一些类型带有未加括号的逗号;当使用带有多个模板参数的模板化类型时，在 C++ 中也可能出现。举个例子，这有一个简单的宏，创建从字典中提供静态类型值的 `getter`：

```objc
#define GETTER(type,name) \
	- (type)name { \
		return [_dictionary objectForKey: @#name]; \
	}
```

你能这样使用它：

```objc
@implementation SomeClass {
	NSDictionary *_dictionary;
}

GETTER(NSView *,view)
GETTER(NSString *,name)
GETTER(id<NSCopying>,someCopyableThing)
```

到目前为止没问题。现在假设我们想要创建一个遵循*两个*协议的类型：

```objc
GETTER(id<NSCopying,NSCoding>,someCopyableAndCodeableThing)
```

哎呀！宏不起作用了。而且添加括号也无济于事：

```objc
GETTER((id<NSCopying,NSCoding>),someCopyableAndCodeableThing)
```

这会产生非法代码。这时我们需要一个删除可选括号的 UNPAREN 宏。将 `GETTER` 宏重写：

```
#define GETTER(type,name) \
	- (UNPAREN(type))name { \
		return [_dictionary objectForKey: @#name]; \
	}
```

我们该怎么做呢？

## 必须的括号

删除括号很容易：

```objc
#define UNPAREN(...) __VA_ARGS__
#define GETTER(type,name) \
	- (UNPAREN type)name { \
		return [_dictionary objectForKey: @#name]; \
	}
```

虽然看上去很扯，但这的确能运行。预编译器将 `type` 扩展为 `(id <NSCopying，NSCoding>)`，生成 `UNPAREN (id<NSCopying, NSCoding>)`。然后它会将 `UNPAREN` 宏扩展为 `id <NSCopying，NSCoding>`。括号，消失！

但是，之前使用的 `GETTER` 失败了。例如，`GETTER(NSView *，view)` 在宏扩展中生成 `UNPAREN NSView *`。不会进一步扩展就直接提供给编译器。结果自然会报编译器错误，因为 `UNPAREN NSView *` 是无法编译的。这虽然可以通过编写 `GETTER((NSView *)，view)` 来解决，但是被迫添加这些括号很烦人。这样的结果可不是我们想要的。

## 宏不能被重载

我立刻想到了如何摆脱剩余的 `UNPAREN`。当你想要一个标识符消失时，你可以使用一个空的 `#define`，如下所示：

```objc
#define UNPAREN
```

有了这个，`a UNPAREN b` 的序列变为 `a b`。完美解决问题！但是，如果已经存在带参数的另一个定义，则预处理器会拒绝此操作。即使预处理器可能选择其中一个，它也不会同时存在两种形式。如果可行的话，这能有效解决我们的问题，但可惜的是并不允许：

```objc
#define UNPAREN(...) __VA_ARGS__
#define UNPAREN
#define GETTER(type,name) \
	- (UNPAREN type)name { \
		return [_dictionary objectForKey: @#name]; \
	}
```

这无法通过预处理器，它会由于 `UNPAREN` 的重复 `#define` 而报错。不过，它引导我们走上了成功的道路。现在的瓶颈是怎么找出一种方法来实现相同的效果，而不会使两个宏具有相同的名称。

## 关键

最终目标是让 `UNPAREN(x)` 和 `UNPAREN((x))` 结果都是 `x`。朝着这个目标迈出的第一步是制作一些宏，其中传递 `x` 和 `(x)` 产生相同的输出，即使它并不确定 `x` 是什么。这可以通过将宏名称放在宏扩展中来实现，如下所示：

```objc
#define EXTRACT(...) EXTRACT __VA_ARGS__
```

现在如果你写 `EXTRACT(x)`，结果是 `EXTRACT x`。当然，如果你写 `EXTRACT x`，结果也是 `EXTRACT x`，就像没有宏扩展的情况。这仍然给我们留下一个 `EXTRACT`。虽然不能用 `#define` 直接解决，但这已经进步了。

## 标识符粘合

预处理器有一个操作符 `##`，它将两个标识符粘合在一起。例如，`a ## b` 变为 `ab`。这可以用于从片段构造标识符，但也可以用于调用宏。例如：

```objc
#define AA 1
#define AB 2
#define A(x) A ## x
```

从这里可以看到，`A(A)` 产生 `1`，`A(B)` 产生 `2`。

让我们将这个运算符与上面的 `EXTRACT` 宏结合起来，尝试生成一个 `UNPAREN` 宏。由于 `EXTRACT(...)` 使用前缀 `EXTRACT` 生成实参，因此我们可以使用标识符粘合来生成以 `EXTRACT` 结尾的其他标记。如果我们 `#define` 那个新标记为空，那就搞定了。

这是一个以 `EXTRACT` 结尾的宏，它不会产生任何结果：

```objc
#define NOTHING_EXTRACT
```

这是对 `UNPAREN` 宏的尝试，它将所有内容放在一起：

```objc
#define UNPAREN(x) NOTHING_ ## EXTRACT x
```

不幸的是，这并不能实现我们的目标。问题在操作顺序上。如果我们写 `UNPAREN((int))`，我们将会得到：

```objc
UNPAREN((int))
NOTHING_ ## EXTRACT (int)
NOTHING_EXTRACT (int)
(int)
```

标示符粘合太早起作用，`EXTRACT` 宏永远不会有机会扩展开。

可以使用间接的方式强制预处理器用不同的顺序判断事件。我们可以制作一个 `PASTE` 宏，而不是直接使用 `##`：

```objc
#define PASTE(x,...) x ## __VA_ARGS__
```

然后我们将根据它编写 `UNPAREN`：

```objc
#define UNPAREN(x)  PASTE(NOTHING_,EXTRACT x)
```

这*仍然*不起作用。情况如下：

```objc
UNPAREN((int))
PASTE(NOTHING_,EXTRACT (int))
NOTHING_ ## EXTRACT (int)
NOTHING_EXTRACT (int)
(int)
```

但更接近我们的目标了。序列 `EXTRACT(int)` 显然没有触发标示符粘合操作符。我们必须让预处理器在它看到 `##` 之前解析它。可以通过另一种方式间接强制解析它。让我们定义一个只包装 `PASTE` 的 `EVALUATING_PASTE` 宏：

```objc
#define EVALUATING_PASTE(x,...) PASTE(x,__VA_ARGS__)
```

现在让我们用*它*写 `UNPAREN`：

```objc
#define UNPAREN(x) EVALUATING_PASTE(NOTHING_,EXTRACT x)
```

这是展开之后：

```objc    
UNPAREN((int))
EVALUATING_PASTE(NOTHING_,EXTRACT (int))
PASTE(NOTHING_,EXTRACT int)
NOTHING_ ## EXTRACT int
NOTHING_EXTRACT int
int
```

即使没有额外加括号也能正常运行，因为额外的赋值并没有影响：

```objc
UNPAREN(int)
EVALUATING_PASTE(NOTHING_,EXTRACT int)
PASTE(NOTHING_,EXTRACT int)
NOTHING_ ## EXTRACT int
NOTHING_EXTRACT int
int
```

成功了！我们现在编写 `GETTER` 时可以不需要围绕类型的括号了：

```objc
#define GETTER(type,name) \
	- (UNPAREN(type))name { \
		return [_dictionary objectForKey: @#name]; \
	}
```

## 奖励宏
在选择一些宏来证明这个结构时，我构建了一个很好的 `dispatch_once` 宏来制作延迟初始化的常量。实现如下：

```objc
#define ONCE(type,name,...) \
	UNPAREN(type) name() { \
		static UNPAREN(type) static_ ## name; \
		static dispatch_once_t predicate; \
		dispatch_once(&predicate,^{ \
			static_ ## name = ({ __VA_ARGS__; }); \
		}); \
		return static_ ## name; \
	}
```

使用案例：

```objc
ONCE(NSSet *,AllowedFileTypes,[NSSet setWithArray:@[ @"mp3",@"m4a",@"aiff" ]])
```

然后，你可以调用 `AllowedFileTypes()` 来获取集合，并根据需要高效创建集合。如果类型不巧包括括号，添加括号就能运行。

## 结论

仅仅写这个宏，我就发现了很多艰涩的知识。我希望接触这些知识也不会影响你的思维。请谨慎使用这些知识。

今天就这样。以后还会有更多令人兴奋的探索，可能比这还要再不可思议。在此之前，如果你对此主题有任何建议，请发送给 [我们](mike@mikeash.com)！
