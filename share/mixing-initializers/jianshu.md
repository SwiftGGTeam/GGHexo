混合构造器"

> 作者：Russ Bishop，[原文链接](http://www.russbishop.net/mixing-initializers)，原文日期：2016-11-09
> 译者：Cyan；校对：[小铁匠Linus](http://linusling.com)；定稿：[CMB](https://github.com/chenmingbiao)
  









今天的内容非常简单，但是有些内容会让人产生困扰，通常出现在 extensions 的上下文或者和 `RawRepresentable` 的枚举值打交道的时候。



## 无法委托给可失败的构造器

比如说你有个带有可失败构造器的类型。现在你想扩展这个类型让他支持反序列化 JSON 数据。当 JSON 解析失败的时候抛出一个友好且详细的错误，并且你希望发生任何错误的时候都能够抛出来，不管是 JSON 解析还是可失败初始化器中的错误，如果我们能抛出异常的话那是很好的。

    
    struct FizzFail {
        init?(string: String) { /* magic */ }
        init(json: JsonValue) throws {
            // 解析 json
            guard let string = json.string else { throw JsonError.invalidJson }
            // 错误：不可失败的构造器无法委托给可失败的构造器
            if self.init(string: string) == nil {
                throw JsonError.missingValue
            }
        }
    }

这里有两个问题。首先是我们不能委托给可失败构造器。当有人尝试传递一个不合法的 JSON 数据时（这是不常见的对吧？），编译器会帮助我们将这个构造器转换到一个可失败的构造器，或者是插入一个不安全的解包类型，然后会终止掉。

其次，即便我们可以检查可失败构造器的结果，但没有语法可以这样做。`self` 在可失败构造器的上下文中只是一个可选值。

针对这个情况有三种解决方案：

1.如果拥有对应的类型，可以将实际初始化的代码移到一个私有的可抛出异常的构造器里面，然后公开的构造器都委托它来进行初始化。在可失败构造器里面使用 `try?` 来忽略错误。

    
    struct Fizz {
        private init(value: String) throws { /* magic */ }
        init(json: JsonValue) throws {
            guard let string = json.string else {
                throw JsonError.invalidJson
            }
            try self.init(value: string)
        }
        init?(string: String) {
            try? self.init(value: string)
        }
    }

2.如果不拥有类型并且它是一个值类型，你可以对 `self` 重新赋值。这会导致额外的声明和分配，但是代码看起来会更清晰。

    
    extension FizzFail {
        init(json: JsonValue) throws {
            // 解析 json
            guard let string = json.string,
            let value = type(of: self).init(string: string) else {
                throw JsonError.invalidJson
            }
            self = value
        }
    }

3.如果不拥有类型并且它是一个引用类型，那么你必须使用一个静态方法来解决，因为你没有更好的选择了。

## 原始值

上面的技巧同样适用于含有原始值（RawValue）的枚举值。即使你拥有类型，你也不拥有自动生成的构造器，所以只能对 `self` 重新赋值：

    
    enum Buzz: String {
        case wat = "wat"
        case other = "other"
    
        private enum ConstructionError: Error {
            case invalidConstruction
        }
    
        init(string: String) {
            if let value = type(of: self).init(rawValue: string) {
                self = value
            } else {
                self = .other
            }
        }
    }

## 结束语

我在 30 分钟里写完了这篇文章是为了让你知道，其实我的博客还在维护，最后谢谢你读完。

[Russ Bishop](http://russbishop.net/bio)
这个博客仅代表我个人的观点，并没有得到我的雇主的认可。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。