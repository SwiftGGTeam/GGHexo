Swift 的 falsiness"

> 作者：Soroush Khanlou，[原文链接](http://khanlou.com/2016/06/falsiness-in-swift/)，原文日期：2016-06-21
> 译者：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；校对：[千叶知风](http://weibo.com/xiaoxxiao)；定稿：[CMB](https://github.com/chenmingbiao)
  










在 Python 中，零和 `None`，以及空列表、字典和字符串，都有 falsy 值。 如果有 falsy 值，意味着可以它在 if 语句中使用，且可以使用 else。 例如，在 Python 中：

    python
    if []:
    	# will not be evaluated
    else:
    	# will be evaluated
    	
    if 0: 
    	# will not be evaluated
    else:
    	# will be evaluated



而在 Swift 中，只有真正的布尔值才可以用在 if 语句里。 nil、空数组，或者其他类型的值出现在在 if 语句中会导致编译失败：

    
    if Array<String>() {
    // error: type 'Array<String>' does not conform to protocol 'BooleanType'

Python 和 Swift 都具有一致性，这是好事。在 Swift 里，只有布尔值可以作为 if 语句的判断条件。而在 Python 中，每个集合类型、整数、nil 值（`None`）和布尔都可以作为 if 语句的判断条件。一致性看起来似乎简单，直到你注意到其他语言有多糟糕。

JavaScript 才是真正的垃圾秀。 `false`、`null` 和 `undefined` 是 falsy，这或多或少还能忍受。但是 `0` 和 `“”` 也是 falsy，即使 `[]` 和 `{}` 是 truthy。 （还有不要尝试解释 [JavaScript 的相等行为](https://dorey.github.io/JavaScript-Equality-Table/)。

虽然我很爱 Objective-C，但它仍然是不具有一致性的语言。 `nil`，`NO`，`false` 和 `0` 是 falsy，而 `@ []`，`@ {}`，`@ 0` 和 `@NO` 是 truthy。 Ruby 在这方面是最好的，只允许 `nil` 和 `false` 是 falsy。比起 Ruby，我更喜欢 Swift 的绝对严格。

一致性虽好，但效用更重要。Swift 的 falsiness 规则虽然好，不过还是 Python 的规则实用。

我有两个证据可以证明，为什么 Python 的规则比 Swift 的（以及几乎所有其他语言的）更实用。

第一个证据是 Rails 的 `ActiveSupport` 里的 `present?` 方法。我之前写过 `present?` 的方法，见[这里](http://khanlou.com/2014/05/smalltalky-control-structures/) 。简而言之，可规避 Ruby 运行时唯一不可变的 falsiness。每个对象都可以规定如果 `#present?`.`nil` 不存在，包括空数组和字符串。可以给对象重写 `present?`，如果有自定义集合或空对象。这样会导致你的代码这样：

    
    if myObject.present? {
    	
    } else {
    
    }

重写 Ruby 顽固的 falsiness。 ActiveSupport 只是单纯有用，这也是为什么调用 `.present?` （和 `.blank?` ）总是散布在 Rails 的代码库里。

第二个证据是，Swift 在条件句中处理可选值时是多么尴尬。 留意一下想在代码中检查一个东西是 empty 还是 nil ，得进行多少操作。而这种检查对我而言非常常见。例如，UITextField 的 text 属性是可选的，如果想检查 text 是否存在，就要进行类似尴尬的操作了：

    
    if let text = textField.text where !text.isEmpty {
    	// we have some text
    } else {
    	// the string is either empty or nil
    }

如果这样的代码都让你不觉得尴尬，那来尝试颠倒条件。 我会等你哒。 （提示：不能只删除 not 运算符）

很快，你会专门为字符串添加 `Optional` [方法](https://twitter.com/mliberatore/status/702209186839527426)：

    
    protocol TextContaining {
        var isEmpty: Bool { get}
    }
    
    extension String: TextContaining { }
    
    extension Optional where Wrapped: TextContaining {
        var isEmpty: Bool {
            switch self {
            case let .Some(value):
                return value.isEmpty
            case .None:
                return true
            }
        }
    }

你不必这样生活！ 你值得拥有美好的事情！（比如  Python 的 falsiness）。

不像我提到的其他语言，Swift 是一个高度动态的语言。 允许添加代码来更改编译器的 falsiness 行为。

这是 `BooleanType`  的文档：

> 符合布尔型协议的类型可以用于条件语句（if，while，C-style for）和其他逻辑值上下文（例如，guard 语句）。

是的的的的的。

Swift 只有三个类型符合 BooleanType 类型， Bool，DarwinBoolean和ObjCBool。 不建议将此集合扩展为包含表示多个简单布尔值的类型。

Swift 只有三个类型符合 BooleanType 类型， Bool，DarwinBoolean和ObjCBool。 不建议将此集合扩展为包含表示多个简单布尔值的类型。

对不起，Chris Lattner，我要放手一搏了：

    
    extension String: BooleanType {
        public var boolValue: Bool {
            return !self.isEmpty
        }
    }

完成了！现在我们可以在条件语句中使用字符串了，代码如期编译成功：

    
    if "" {
    	// this code will not be executed
    } else {
    	// this code will be executed	
    }

可以对 `Dictionary` 和 `Array` 做同样的事情。对可选值来说，我们应该检查一下 `Wrapped` 类型是否遵循 `BooleanType` ：

    
    extension Optional: BooleanType {
        public var boolValue: Bool {
            switch self {
            case .None:
                return false
            case .Some(let wrapped):
                if let booleanable = wrapped as? BooleanType {
                    return booleanable.boolValue
                }
                return true
            }
        }
    }

现在，如果有个拆包的布尔值，实现效果会如你所愿，不会抛出编译报错，不需要在处理奇怪的 `optionalBool ?? true` 了。

最大的问题是“我应该在生产代码中这样做吗？”。答案是...也许可以吧。如果你在写一个开源库，可能被其他的开发者使用，那绝对不要这样做。如果是在自己写的 App 里添加这样的代码，那不要牵扯任何第三方代码，不然会编译不过的。Swift 是强类型的语言，甚至无法编译 `myArray == false` 这样的代码。

我觉得 Swift 这样做非常棒：建构在一个个小的可组合的块（比如 BooleanType）上，标准库可以在语言中进行自定义（像是 ArrayLiteralConvention 这样的类型都遵循相似的模式）。令人惊讶的是，没有一个“动态”语言允许这种基本语言结构的突变。同时，我不得不决定是否要在所有的地方进行这样的尝试。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。