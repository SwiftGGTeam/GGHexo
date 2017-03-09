结构体与 NSCoding"

> 作者：Soroush Khanlou，[原文链接](http://khanlou.com/2016/10/structs-and-nscoding/)，原文日期：2016-10-25
> 译者：[wiilen](http://www.jianshu.com/users/b7978363eb99/latest_articles)；校对：[Cwift](http://weibo.com/277195544)；定稿：[CMB](https://github.com/chenmingbiao)
  









要使用 `NSCoding`，必须遵循 `NSObjectProtocol` 这个类协议，因此结构体无法使用。如果我们想对某些数据进行编码，最简单的方式是将它们作为一个类来实现，并且继承自 `NSObject`。

我找到了一种优雅的方式来将结构体包在 `NSCoding` 的容器中，存储时也不会让人觉得小题大做。用 `Coordinate` 举个例子：



    
    struct Coordinate: JSONInitializable {
        let latitude: Double
        let longitude: Double
            
        init(latitude: Double, longitude: Double) {
            self.latitude = latitude
            self.longitude = longitude
        }
    }

这是一个简单的类型，带有两个常量属性。接下来我将创建一个遵循 `NSCoding` 协议的类，并将 `Coordinate` 包在其中：

    
    class EncodableCoordinate: NSObject, NSCoding {
        
        var coordinate: Coordinate?
        
        init(coordinate: Coordinate?) {
            self.coordinate = coordinate
        }
        
        required init?(coder decoder: NSCoder) {
            guard
                let latitude = decoder.decodeObject(forKey: "latitude") as? Double,
                let longitude = decoder.decodeObject(forKey: "longitude") as? Double
                else { return nil }
            coordinate = Coordinate(latitude: latitude, longitude: longitude)
        }
        
        func encode(with encoder: NSCoder) {
            encoder.encode(coordinate?.latitude, forKey: "latitude")
            encoder.encode(coordinate?.longitude, forKey: "longitude")
        }
    }

把以上的逻辑放在另一个类型中是合情合理的，这样可以更严格地适用单一职责原则（single responsibility principle）。聪明的读者在阅读上面的类时，会发现 `EncodableCoordinate` 类中的 `coordinate` 这一属性是 Optional 的，但也可以不这样实现。我们可以使对应的构造器接收一个非 Optional 的 `Coordiante` 参数（或使用可失败构造器），而 `init(coder:)` 构造器原本就是可失败的，现在如果能得到一个 `EncodableCoordinate` 类的实例，可以保证该实例中总有 `coordinate`。

然而由于 `NSCoder` 工作方式的特殊性，当编码 `Double` 类型（以及其他基本类型）时，这些类型的数据无法使用 `decodeObject(forKey:)` 方法来进行解码（这样做会返回 `Any?` ），而是需要使用它们专属的方法，对 `Double` 来说，则是 `decodeDouble(forKey:)`。不幸的是，这些专属方法不会返回 Optional，在找不到 key 或碰到其他类型的错误时会返回 `0.0`。因此，我选择将 `coordinate` 属性实现为 Optional，并作为 Optional 来编码，从而在使用 `decodeObject(forKey:)` 方法来进行解码时，能获取 `Double?` 类型的对象，并添加一些额外的安全性。

从现在开始，我们可以创建 `EncodableCoordinate` 的实例，用它来编解码 `Coordinate` 对象，并通过 `NSKeyedArchiver` 写入磁盘：

    
    let encodable = EncodableCoordinate(coordinate: coordinate)
    let data = NSKeyedArchiver.archiveRootObject(encodable, toFile: somePath)

存储时每次都创建一个额外的对象未免太麻烦了，并且我也希望将这种方法和 `SKCache`（来源于 [Cache Me If You Can](http://khanlou.com/2015/07/cache-me-if-you-can/) 这篇文章）一起使用，如果我能规范编码器与被编码对象之间的关系，也许就能避免每次都创建一个 `NSCoding` 容器。

想要做到这一点，先添加两个协议：

    
    protocol Encoded {
        associatedtype Encoder: NSCoding
        
        var encoder: Encoder { get }
    }
    
    protocol Encodable {
        associatedtype Value
        
        var value: Value? { get }
    }

并让两个类对应遵守这两个协议：

    
    extension EncodableCoordinate: Encodable {
        var value: Coordinate? {
            return coordinate
        }
    }
    
    extension Coordinate: Encoded {
        var encoder: EncodableCoordinate {
            return EncodableCoordinate(coordinate: self)
        }
    }

实现了以上内容之后，类型系统就知道如何在这些对象对之间进行值的转换了。

    
    class Cache<T: Encoded> where T.Encoder: Encodable, T.Encoder.Value == T {
    	//...
    }

对上文中提到的 `SKCache` 对象进行了升级之后，它现在更具通用性，可以在符合 `Encoded` 协议的类型中使用了。同时它也约束了该类型的编码器的 `value` 对象类型必须是该类型本身，使得两个类型之间可以进行双向转换。

最后需要完善的一部分是该类型的 `save` 与 `fetch` 方法。`save` 包括了获取 `encoder`（真正遵守 `NSCoding` 协议的对象），并将其存到某个路径中：

    
    func save(object: T) {
       NSKeyedArchiver.archiveRootObject(object.encoder, toFile: path)
    }

`fetch` 则包括了一些微小的编译器工作。我们需要将解档对象的类型转换为 `T.Encodable`，即编码器的类型，然后获取它的值，并动态将其类型转换回 `T`。

    
    func fetchObject() -> T? {
        let fetchedEncoder = NSKeyedUnarchiver.unarchiveObject(withFile: storagePath)
        let typedEncoder = fetchedEncoder as? T.Encoder
        return typedEncoder?.value as T?
    }

现在，要使用这个 cache，只需要实例化一个对象并指定其类型为 `Coordinate`：

    
    let cache = Cache<Coordinate>(name: "coordinateCache")

生成了该对象之后，我们就可以透明地存取 coordinate 结构体了：

    
    cache.save(object: coordinate)

使用以上方法，我们可以通过 `NSCoding` 来编码结构体，遵守单一职责原则，并加强了类型安全。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。