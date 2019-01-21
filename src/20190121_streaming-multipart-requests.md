title: "以流的形式执行 Multipart 请求"
date: 2019-01-21
tags: [Swift][Objective-C][iOS开发]
categories: [Khanlou]
permalink: streaming-multipart-requests
keywords: multipart request，stream
custom_title:"以流的形式执行 Multipart 请求"

---

原文链接=http://khanlou.com/2018/11/streaming-multipart-requests/
作者=Soroush Khanlou
原文日期=2018-11-14
译者=郑一一
校对=numbbbbb,pmst
定稿=Forelax

<!--此处开始正文-->

Foundation 框架中的 URL 类提供了非常全面的功能，此后还在 iOS 7 中新增了 URLSession 类。尽管如此，基础库中仍然缺少 multipart 文件上传的功能。

<!--more-->

## 什么是 multipart 请求？

Multipart 编码实际上就是在网络中上传大型文件的方法。在浏览器中，有时候你会选择一个文件作为表单提交内容的一部分。这个文件便是以 multipart 请求的方式实现上传的。

乍一看，multipart 请求和一般请求差不多。不同之处是 multipart 请求额外为 `HTTP` 请求体指定了唯一编码。同 JSON 编码（`{"key": "value"}`）或者 URL 字符编码 (`key=value`) 相比，multipart 编码干的事略微有所不同。因为 multipart 请求体实际上只是一串字节流，接收端实体在解析数据时，需要知道字节流中各个部分之间的界限。所以 multipart 请求需要使用 "boundaries" 来解决这个问题。在请求首部的 `Content-Type` 中，可以定义 boundary：

```
Accept: application/json
Content-Type: multipart/form-data; boundary=khanlou.comNczcJGcxe
```

Boundary 的具体内容并不重要，唯一需要注意的是：在请求体中，boundary 是不能重复出现（这样才能体现 boundary 的作用）。你可以使用 UUID 作为 boundary。

请求的每一部分可以是普通数据（比如图片）或者元数据（一般是文本，对应一个名字，组成一个键值对）。如果数据是图片的话，那它看起来应该是这样的：

```
--<boundary>
Content-Disposition: form-data; name=<name>; filename=<filename.jpg>
Content-Type: image/jpeg

<image data>
```

如果是普通文本，则是这样：

```
--<boundary>
Content-Disposition: form-data; name=<name>
Content-Type: text/plain

<some text>
```

请求结尾会有一个带着两个连字符的 boundary，`--<boundary>--`。（此处需要注意，所有新行必须是回车换行。）

以上就是关于 multipart 请求的所有内容，并不是特别复杂。事实上，当在写第一个有关 multipart 编码的客户端实现时，我有些抵触阅读 multipart/form-data 的 [RFC](https://tools.ietf.org/html/rfc7578)。可是在开始阅读之后，我对这个协议的理解更深了。整个文档可读性很强，很轻易就能直达知识的源头。

我在开源的 [Backchannel SDK](https://github.com/backchannel/BackchannelSDK-iOS) 实现了上述功能。[`BAKUploadAttachmentRequest`](https://github.com/backchannel/BackchannelSDK-iOS/blob/master/Source/Image%20Chooser/BAKUploadAttachmentRequest.m) 和 [`BAKMultipartRequestBuilder`](https://github.com/backchannel/BackchannelSDK-iOS/blob/master/Source/Image%20Chooser/BAKMultipartRequestBuilder.m) 类包含了处理 mulitipart 的方法。在这个项目中，仅仅包含了处理单个文件的情况，并且没有包括元数据。但是作为范例，依旧很好地展示了 mulitipart 请求是如何构建的。可以通过添加额外的实现代码，来支持元数据和多文件的功能。

无论是使用一个请求上传多个文件，还是多个请求分别对应上传一个文件，来实现多文件上传功能，都会碰到一个问题。这个问题就是，如果你尝试一次性上传很多文件的话，app 将会闪退。这是因为使用 [该版本的代码](https://github.com/backchannel/BackchannelSDK-iOS/blob/master/Source/Image%20Chooser/BAKMultipartRequestBuilder.m#L66-L70)，加载的数据会直接进入内存，在内存暴涨的情况下，即使使用当下性能最强的旗舰手机也会有闪退发生。

## 将硬盘中数据以流的形式读取

最常见的解决方法是将硬盘中的数据以流的形式读取出来。其核心思想是文件的字节数据会一直保存在硬盘里，直到被读取并发往网络。内存中只保留了很小一部分的镜像数据。

目前，我想出两种方法可以解决这个问题。第一个方法，把 multipart 请求体中的所有数据写到硬盘的一个新文件中，并使用 URLSession 的 `uploadTask(with request: URLRequest, fromFile fileURL: URL)` 方法将文件转化为流。这个方法可以奏效，但我并不想为每一个请求新建一个新文件保存到硬盘中。因为这意味着在请求发出后，还需要删除这个文件。

第二种方法是将内存和硬盘的数据合并在一起，并通过统一的接口向网络输出数据。

如果你觉得第二种方法听起来像是 [类簇](http://khanlou.com/2015/10/clustering/)，恭喜你，完全正确。很多常用 Cocoa 类都允许创建子类，并实现一些父类方法，使其和父类表现一致。回想一下 `NSArray` 的 `-count` 属性和 `-objectAtIndex:` 方法。因为 `NSArray` 的所有其它方法都是基于 `-count` 属性和 `-objectAtIndex:` 方法实现的，你可以非常轻易地创建优化版本的 `NSArray` 子类。

你可以创建一个 `NSData` 子类，它无需真正从硬盘读取数据，而只是创建一个指针直接指向硬盘中的数据。这样做的好处是是不需要把数据载入内存中进行读取。这种方法称为内存映射，基于 Unix 方法 `mmap`。你可以通过 `.mappedIfSafe` 或者 `alwaysMapped` 选项，来使用 `NSData` 的这项特性。因为 `NSData` 是一个类簇，我们将创建一个 `ConcatenatedData` 子类（就像 `FlattenCollection` 在 Swift 中的工作方式），该子类会将多个 `NSData` 对象视作一个连续的 `NSData`。完成创建以后，我们就做好所有准备来解决这个问题啦。

通过查看 `NSData` 所有原生方法，可以发现，需要实现的是 `-count` 和 `-bytes`。实现 `-count` 并不难，我们可以把所有 `NSData` 对象的大小相加得到；但在实现 `-bytes` 时则会有个问题。 `-bytes` 需要返回一个指向一段连续缓冲区的指针，而目前我们并没有这个指针。

在基础库中，提供了 `NSInputStream` 类用于处理不连续的数据。非常幸运，`NSInputStream` 同样是一个类簇。我们可以创建一个子类，将多条流合并。在使用子类时，感觉上就像是一条流。通过使用 `+inputStreamWithData:` 和 `+inputStreamWithURL:` 方法，可以轻易地创建一条输入流，用来代表硬盘中的文件和内存中的数据（比如 boundaries）。

通过阅读最好的第三方网络库源代码，你会发现 [AFNetworking](https://github.com/AFNetworking/AFNetworking) 采用了[这种方法](https://github.com/AFNetworking/AFNetworking/blob/009e3bb6673edc183c4f2baf552ad7cccba94d58/AFNetworking/AFURLRequestSerialization.m#L896-L927)。（[Alamofire](https://github.com/Alamofire/Alamofire)，Swift 版本的 AFNetworking，则采用了第一种方法，[将数据全部加载到内存中](https://github.com/Alamofire/Alamofire/blob/ff16ce9e87aeb0ee1f30b28789db1fff01e8fb02/Source/MultipartFormData.swift#L432-L455)，但如果数据量太大，就会写到硬盘的一个文件中。）

## 将所有部分拼接起来

你可以在 [这里](https://gist.github.com/khanlou/8cc2e3cb23ec8d03b1fc187f5922e244) 看看我的串行输入流的实现（是用 Objective-C 实现的，以后我可能还会写一个 Swift 版本的）。

通过 `SKSerialInputStream` 类，可以将流组合在一起。下面展示了前缀和后缀属性：

```swift
extension MultipartComponent {
    var prefixData: Data {
        let string = """
        \(self.boundary)
        Content-Disposition: form-data; name="\(self.name); filename="\(self.filename)"
        """
        return string.data(using: .utf8)
    }
    
    var postfixData: Data {
        return "\r\n".data(using: .utf8)
    }
}
```

将元数据和文件的 `dataStream` 组合在一起，得到一条输入流：

```swift
extension MultipartComponent {
    var inputStream: NSInputStream {
        
        let streams = [
            NSInputStream(data: prefixData),
            self.fileDataStream,
            NSInputStream(data: postfixData),
        ]
    
        return SKSerialInputStream(inputStreams: streams)
    }
}
```

创建好每一部分输入流之后，就可以把所有流组合在一起，得到一条完整输入流。此外，在请求结尾还需要添加一个 boundary：

```swift
extension RequestBuilder {
    var bodyInputStream: NSInputStream {
        let stream = parts
            .map({ $0.inputStream })
            + [NSInputStream(data: "--\(self.boundary)--".data(using: .utf8))]
    
        return SKSerialInputStream(inputStreams: streams)
    }
}
```

最后，将 `bodyInputStream` 赋值给 URL 请求的 `httpBodyStream` 属性：

```swift
let urlRequest = URLRequest(url: url)

urlRequest.httpBodyStream = requestBuilder.bodyInputStream;
```

注意，`httpBodyStream` 和 `httpBody` 两个属性是互斥的——两个属性不会同时生效。设置 `httpBodyStream` 会使得 `Data` 版本 `httpBody` 失效，反之亦然。

流文件上传的关键是能够将多条输入流合并成一条流。`SKSerialInputStream` 类完成了整个工作。尽管说子类化 `NSInputStream` 有一些困难，可一旦解决这个问题，我们就离成功不远啦。

## 子类化过程中需要注意的问题

子类化 `NSInputStream` 的过程不会太轻松，甚至可以说很困难。你必须实现 9 个方法。其中的 7 个方法，父类只有一些微不足道的默认实现。而在文档中只提到了 9 个方法中的 3 个，所以你还得实现 6 个 `NSStream` （`NSInputStream` 的父类）的方法，其中有 2 个是 run loop 方法，并允许空实现。在这之前，你还需要额外 [实现 3 个私有方法](http://blog.bjhomer.com/2011/04/subclassing-nsinputstream.html)，不过现在不必实现了。此外，还需要定义 3 个`只读`属性：`streamStatus`，`streamError`，`delegate`。

在处理完上述子类化相关的细节后，接下来的挑战是创建一个 `NSInputStream` 子类，其行为应该和 API 使用者所期望的保持一致。然而，这个类状态的重度耦合是不容易被人发现的。

有一些状态需要保证行为一致。举个例子，`hasBytesAvailable` 是不同于其它状态的，但还是存在细微的联系。在我最近发现的一个 bug 里，`hasBytesAvailable` 属性会返回 `self.currentIndex != self.inputStreams.count`，但是这会造成一个 bug，流会一直处于开启的状态，并最终造成请求超时。修复这个 bug 的办法是改为返回 `YES`，但我一直没有找到这个 bug 的根源所在。

另外一个状态 `streamStatus`，存在许多可能的值，其中比较重要的两个值是 `NSStreamStatusOpen` 和 `NSStreamStatusClosed`。

最后一个比较有意思的状态是字节数，从 `read` 方法中返回值。这个属性除了会返回正整型数之外，还会返回 -1，-1 代表有错误产生，需要进一步检查非空属性 `streamError` 来获取更多信息。字节数还可以返回 0，根据文档描述，这是标明流结尾的另外一种方式。

文档并不会告诉你哪些状态的组合是有意义的。比如说流产生一个 `streamError`，但状态却是 `NSStreamStatusClosed`，而不是 `NSStreamStatusError`，在这种情况下是否会有问题？想要管理好所有的状态非常难，不过到最后终究还是能解决的。

对于 `SKSerialStream` 类，是否可以在所有情况下都能正常工作，我还不是特别有信心。但看起来，`SKSerialStream` 通过使用 URLSession 能很好地支持上传 multipart 数据。如果你在使用这份代码的时候发现任何问题，请务必联系我，我们可以一起不断优化这个类。