使用键路径访问字典"

> 作者：Ole Begemann，[原文链接](https://oleb.net/blog/2017/01/dictionary-key-paths/)，原文日期：2017-01-09
> 译者：[Cwift](http://weibo.com/277195544)；校对：[walkingway](http://chengway.in/)；定稿：[CMB](https://github.com/chenmingbiao)
  









在 [Swift Talk episode 31](https://talk.objc.io/episodes/S01E31-mutating-untyped-dictionaries) 上，Chris 和 Florian 展示了一种针对 Swift 中可变的嵌套异构字典的解决方案，这种字典是 [String:Any] 类型的。这是一个有趣的讨论，我鼓励你看看原视频或者阅读这篇优秀的文字记录。

我为准备这期对话节目做了点微小的贡献，不过围绕这个问题所进行的一些实验代码视频并没有提到，所以我想在这里展示给你。



## 一个异构字典

让我们从一个有着多层嵌套结构的异构字典入手。当你从一个 Web 服务器获取一个 JSON 数据或者从一个 plist 文件中加载初始化数据时，可能经常遇到这种结构的数据：

    
    var dict: [String: Any] = [
        "language": "de",
        "translator": "Erika Fuchs",
        "translations": [
            "characters": [
                "Scrooge McDuck": "Dagobert",
                "Huey": "Tick",
                "Dewey": "Trick",
                "Louie": "Track",
                "Gyro Gearloose": "Daniel Düsentrieb",
            ],
            "places": [
                "Duckburg": "Entenhausen",
                "Money Bin": "Geldspeicher",
            ]
        ]
    ]

Florian 和 Chris 的解决方案允许你使用下面的语法来访问（以及修改）数组中嵌套的值：

    
    dict[jsonDict: "translations"]?[jsonDict: "characters"]?[string: "Gyro Gearloose"]
    // → "Daniel Düsentrieb"

## 使用键路径作为字典的下标

我想要引入一个类似于 Cocoa 中 KVC 使用的键路径的语法。结果看起来应该像这样：

    
    dict[keyPath: "translations.characters.Gyro Gearloose"]
    // → "Daniel Düsentrieb"

我们不能使用 Swift 中现有的 [#keyPath 结构](https://github.com/apple/swift-evolution/blob/master/proposals/0062-objc-keypaths.md)，因为它会在编译时检查键路径所引用的属性是否存在，这不可能应用到字典中。

### KeyPath 类型

让我们用一个新的类型来表示键路径。它使用路径分段的数组来保存键路径，并且有一个便捷方法可以分离当前的首路径，稍后我们就会用到。

    
    struct KeyPath {
        var segments: [String]
    
        var isEmpty: Bool { return segments.isEmpty }
        var path: String {
            return segments.joined(separator: ".")
        }
    
        /// 分离首路径并且
        /// 返回一组值，包含分离出的首路径以及余下的键路径
        /// 如果键路径没有值的话返回nil。
        func headAndTail() -> (head: String, tail: KeyPath)? {
            guard !isEmpty else { return nil }
            var tail = segments
            let head = tail.removeFirst()
            return (head, KeyPath(segments: tail))
        }
    }

将这个功能添加到一个自定义的类型中不是绝对必要的；毕竟，我们在处理[字符串类型](http://wiki.c2.com/?StringlyTyped)的数据，所以这个方案中没有增加太多的类型安全方面的保护。提取字符串解析的代码很方便，所以不必在字典的下标中处理它。

说到解析，我们需要一个构造器，它接受一个键路径并且将其转换为内部使用的数组的表示形式：

    
    import Foundation
    
    ///使用 "this.is.a.keypath" 这种格式的字符串初始化一个 KeyPath
    extension KeyPath {
        init(_ string: String) {
            segments = string.components(separatedBy: ".")
        }
    }

下一步是遵守 [ExpressibleByStringLiteral](https://developer.apple.com/reference/swift/expressiblebystringliteral) 协议。这样我们就可以使用一个诸如 “this.is.a.key.path” 这种纯粹的字符串字面量来创建一个键路径了。这个协议包含了三个必须实现的构造器，所有的构造器都代理给我们刚刚定义的那个构造器：

    
    extension KeyPath: ExpressibleByStringLiteral {
        init(stringLiteral value: String) {
            self.init(value)
        }
        init(unicodeScalarLiteral value: String) {
            self.init(value)
        }
        init(extendedGraphemeClusterLiteral value: String) {
            self.init(value)
        }
    }

### 字典下标

现在，该给[字典](https://developer.apple.com/reference/swift/dictionary)写一个扩展了。键路径只对键为字符串的字典有意义。不幸的是，在扩展包含泛型参数的对象时，Swift 3.0 不支持在扩展时选择泛型的具体类型，例如这样的格式：` extension Dictionary where Key == String`。不过这个特性[已经实现了](https://bugs.swift.org/browse/SR-1009)，并将成为 Swift 3.1 中的一部分。

在此之前，我们可以定义一个虚拟的协议，然后让 `String` 遵守这个协议，以便绕过这个限制：

    
    //因为 Swift 3.0 不支持根据具体类型进行扩展 (extension Dictionary where Key == String)
    //所以这样做是必须的。
    protocol StringProtocol {
        init(string s: String)
    }
    
    extension String: StringProtocol {
        init(string s: String) {
            self = s
        }
    }

现在可以用 `where Key: StringProtocol` 来限制扩展了。我们将向 `Dictionary` 中新增一个下标，传入一个 `KeyPath`，返回一个可选型的 `Any`。下标需要一个 getter 和一个 setter，因为我们想要通过键路径来修改字典的值：

    
    extension Dictionary where Key: StringProtocol {
        subscript(keyPath keyPath: KeyPath) -> Any? {
            get {
                // ...
            }
            set {
                // ...
            }
        }
    }

下面是 getter 的实现方式：

    
    extension Dictionary where Key: StringProtocol {
        subscript(keyPath keyPath: KeyPath) -> Any? {
            get {
                switch keyPath.headAndTail() {
                case nil:
                    // 键路径为空。
                    return nil
                case let (head, remainingKeyPath)? where remainingKeyPath.isEmpty:
                    // 到达了路径的尾部。
                    let key = Key(string: head)
                    return self[key]
                case let (head, remainingKeyPath)?:
                    // 键路径有一个尾部，我们需要遍历。
                    let key = Key(string: head)
                    switch self[key] {
                    case let nestedDict as [Key: Any]:
                        // 嵌套的下一层是一个字典
                        // 用剩下的路径作为下标继续取值
                        return nestedDict[keyPath: remainingKeyPath]
                    default:
                        // 嵌套的下一层不是字典
                        // 键路径无效，中止。
                        return nil
                    }
                }
            }
            // ...

它需要处理四种情况：
1. 如果键路径是空的，返回 `nil`。这种情况只有当我们处理空的键路径的时候才会发生。
2. 如果键路径只有一个路径段，使用基础的[字典下标](https://developer.apple.com/reference/swift/dictionary/1540848-subscript)返回该键所对应的值（如果键不存在则返回 `nil`）。
3. 如果键路径上的路径段超过一个，检查是否存在可以继续遍历的嵌套字典。如果存在，使用剩余的路径段递归调用下标。
4. 如果没有嵌套字典，则键路径的格式错误。返回 `nil`。

setter 具有类似的结构：

    
    extension Dictionary where Key: StringProtocol {
        subscript(keyPath keyPath: KeyPath) -> Any? {
            // ...
            set {
                switch keyPath.headAndTail() {
                case nil:
                    // 键路径为空。
                    return
                case let (head, remainingKeyPath)? where remainingKeyPath.isEmpty:
                    // 直达键路径的末尾。
                    let key = Key(string: head)
                    self[key] = newValue as? Value
                case let (head, remainingKeyPath)?:
                    let key = Key(string: head)
                    let value = self[key]
                    switch value {
                    case var nestedDict as [Key: Any]:
                        // 键路径的尾部需要遍历
                        nestedDict[keyPath: remainingKeyPath] = newValue
                        self[key] = nestedDict as? Value
                    default:
                        // 无效的键路径
                        return
                    }
                }
            }
        }
    }

用到的代码相当的多，但它们被很好地安置到了扩展当中。并且调用时的格式读起来非常优雅，这才是最重要的。

> 你的目标是让每个 API 清晰地表达出它们的用处。
> —— [Swift API 设计指南](https://swift.org/documentation/api-design-guidelines/)

这有一个例子：

    
    dict[keyPath: "translations.characters.Gyro Gearloose"]
    // → "Daniel Düsentrieb"
    dict[keyPath: "translations.characters.Magica De Spell"] = "Gundel Gaukeley"
    dict[keyPath: "translations.characters.Magica De Spell"]
    // → "Gundel Gaukeley"
我们可以访问值以及分配新的值。

### 可变的方法

下标返回的类型是 `Any?`。这意味着在对返回值做任何有用的操作之前，你总是要先把它转换成特定类型。这与值类型为 `Any` 的异构字典的默认下标没有区别。

正如 Chris  和 Florian 在[视频中所展示的那样](https://talk.objc.io/episodes/S01E31-mutating-untyped-dictionaries)，一个很有意义的问题是*改变*字典中的值（不是分配一个新的值）变得非常困难，因为你不能通过转换类型来改变值。下面的两行代码都不能通过编译：

    
    // error: value of type 'Any' has no member 'append'
    dict[keyPath: "translations.characters.Scrooge McDuck"]?.append(" Duck")
    
    // error: cannot use mutating member on immutable value of type 'String'
    (dict[keyPath: "translations.characters.Scrooge McDuck"] as? String)?.append(" Duck")

想让这样的代码可以运行，我们需要一个返回 `String?` 的下标。最好的办法是让下标变成泛型的，但是[下标不支持泛型](https://bugs.swift.org/browse/SR-115)。另一个最佳方案是为我们想要支持的类型添加各自参数标签的下标。实现部分可以转发到现有的下标，缺点是必须手动添加每一个需要的类型。以下是字符串和字典的两种下标：

    
    extension Dictionary where Key: StringProtocol {
        subscript(string keyPath: KeyPath) -> String? {
            get { return self[keyPath: keyPath] as? String }
            set { self[keyPath: keyPath] = newValue }
        }
    
        subscript(dict keyPath: KeyPath) -> [Key: Any]? {
            get { return self[keyPath: keyPath] as? [Key: Any] }
            set { self[keyPath: keyPath] = newValue }
        }
    }

现在下面的代码可以运行了：

    
    dict[string: "translations.characters.Scrooge McDuck"]?.append(" Duck")
    dict[keyPath: "translations.characters.Scrooge McDuck"]
    // → "Dagobert Duck"
    
    dict[dict: "translations.places"]?.removeAll()
    dict[keyPath: "translations.places"]
    // → [:]

## 结论

如果你经常使用弱类型的异构字典，应该质疑你的数据模型。大多数情况下，将这些数据转换成一个自定义的结构体或者枚举，同时让其满足你的域模型并且提供更多的类型安全，这可能是一个更好的主意。

然而，在罕见的情况下，使用一个完整的数据结构可能会矫枉过正，我真的很喜欢这里提出的方法的灵活性和可读性。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。