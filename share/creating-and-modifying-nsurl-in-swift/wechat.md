在 Swift 应用里构造和修改 NSURL"

> 作者：Nick Hanan，[原文链接](http://www.codingexplorer.com/creating-and-modifying-nsurl-in-swift/)，原文日期：2016-03-17
> 译者：[BigbigChai](https://github.com/chaiyixiao)；校对：[walkingway](http://chengway.in/)；定稿：[CMB](https://github.com/chenmingbiao)
  









许多应用程序都有访问文件的需求。也许是应用 bundle 或文件系统的文件，又或许是网上的资源。在代码里需要调用某些方法来指向这些文件。对于 Apple 平台而言，基本上只有两个选择：使用 String 或 NSURL。

使用过地址栏或任何终端的话，Swift 字符串将是一个非常容易理解的选择。我的意思是，所有的文本都是在地址栏的，对吧？Cocoa 和 Cocoa Touch SDK 中一些较旧的 API 都接收 NSURL 和字符串（通常在这些 API 中称为“路径”）作为参数，但是都越来越朝着只使用 NSURL 的方向发展。和 String 路径相比，NSURL 有许多优点，最明显的是可以访问 URL 各个部分的属性，而不必另外编写代码来从路径的字符串解析出这些组件。

请继续关注如何在 Swift 应用程序中学习创建和使用 NSURL。



## 在 Swift 中创建 NSURL

在 Swift 中，有几个构造器和工厂方法可以用于创建 NSURL，但是我只打算说明其中比较有用的一部分。

#### init?(string URLString: String)

这是最普通，也许也是最常用的方法。这需要 Swift 字符串版本的 URL，并将其转换为 NSURL 对象。 这个构造器允许失败，因为不是所有字符串都能生成合法的 URL。有一些字符无法在 URL 中使用，因此需要使用 % 编码，它的出现表示了可以在 URL 中发送的编码。我个人最常见的是 ％20，”空格“字符。这个构造器只接收有效的字符，它不会另外做 % 编码。因此，如果任何无法转换为合法 URL 的内容或字符串出现时，该构造器将返回 nil。

    
    	let NSHipster = NSURL(string: "http://nshipster.com/")                  //returns a valid URL
    	let invalidURL = NSURL(string: "www.example.com/This is a sentence");   //Returns nil

这实际上是以下构造器的便利构造器。

#### init?(string URLString: String, relativeToURL baseURL: NSURL?)

这是允许定制的构造器。类似上一个构造器，它也是可失败的，接收类似的 URL Swift 字符串，同时也接受一个可选的 baseURL 对象（本身也是 NSURL）。如果 baseURL 为空，则完全使用 URLString 创建 URL，这也许就是第一个构造器的内在实现。

    
    let NSHipsterTwo = NSURL(string: "http://nshipster.com/", relativeToURL: nil)   //Returns valid NSHipster URL
    let article = NSURL(string: "ios9/", relativeToURL: NSHipster)

#### init(fileURLWithPath path: String, isDirectory isDir: Bool)

这类似于上面的构造器，只是用于指向本地文件或目录。我不确定为什么本地文件需要一个特殊版本，但我猜测它进行了一些优化（至少是以文件 scheme 开头，而不是 http 之类）。有另一个版本没有 isDirectory 参数，但已知路径是否目录的话，头文件建议使用这个方法。也许因为另一个版本将需要再执行检查，而这一个方法让用户提供了答案，能省下检查的步骤。

#### public init(fileURLWithPath path: String, isDirectory isDir: Bool, relativeToURL baseURL: NSURL?)

这是 iOS 9 中新增的方法。与上个方法类似，只是还加了 relativeToURL 参数。类似之前的构造器，这将返回一个NSURL，并将路径附加到 baseURL 后。如果有一个目录内的几个文件，有需求对这些文件进行迭代的时候，就可以利用这个方法了。可以提供文件所在的目录作为 baseURL，然后只需使用文件名作为 Swift 字符串路径创建 URL。

## 将 URL 转换回 Swift 字符串

有时候，特别是在处理较旧的 API 或要向用户展示时，需要将 NSURL 转换回 Swift 字符串。好在 NSURL 提供了一个简单的只读属性 absoluteString 来获取字符串。 NSURL 对象只需调用该属性就能获得：

    
    let articleString = article?.absoluteString
    //ArticleString now contains: "http://nshipster.com/ios9/"

在这种情况，接收了之前使用 relativeToURL 版本的构造器定义的 article 常量，从 scheme 直到结尾（在这种情况下是一个路径）把它解析成一个完整的 URL。如果一个 URL 包含文件扩展名（file extension），查询（query）和片段（fragment），也会把它们解析出来。可失败的构造器返回了原来的 article 对象，因此仍然有那个表示 Swift 可选链的问号。

## 修改 NSURL 

这些函数都是基于被调用的 NSURL 返回一个新的、根据需求修改过的 NSURL。他们*不*改变被调用的NSURL。

#### func URLByAppendingPathComponent(pathComponent: String, isDirectory: Bool) -\> NSURL

这个方法给 URL 添加更多的路径组件，例如说你要添加一个文件到当前目录（存储在调用的 NSURL）。跟其他一些构造器一样，它有另一个没有 isDirectory 参数的版本。但如果能明确它是否为目录的话，建议使用这一个。因为这能省去用来确定是否目录的元数据检查。

#### var URLByDeletingLastPathComponent: NSURL? {get}

此属性将返回一个新的、删除了最后一个路径组件的 NSURL。这只修改 URL 的路径组件，URL 的其他组件（例如域名）不受影响。我们可以这样写：

    
    //articleTwo now contains "http://nshipster.com/ios9/"
     
    let deletePathComp = articleTwo?.URLByDeletingLastPathComponent
    //deletePathComp now contains "http://nshipster.com/"

没有路径信息的话，结果可能会变得有点诡异。为了好玩，我链式调用了几个URLByDeletingLastPathComponent，但最后只是在后面附加了“../”，类似命令行（cd ..）返回上一个目录。

还有几个修改方法和属性，但这些可能是最常用的了。

## Conclusion

#### All code in this post was tested in Xcode 7.3.1.

如果你好奇 URL 格式规范的细节，可以查看 Apple 的 NSURL 类型参考在处理 URL 部分提到的 RFC 文档。初始化 URL 时使用的字符串必须符合 [RFC 2396](https://tools.ietf.org/html/rfc2396)，并且 URL 本身根据 [RFC 1738](https://tools.ietf.org/html/rfc1738) 和 [RFC 1808](https://tools.ietf.org/html/rfc1808) 进行解析。这些规范内容很多，但你能找到所有可能关于 URL，URI 等的信息。

NSURL 中还有很多其他的属性。如果你想要一个完全解析的 NSURL，baseURL，主机（host），查询（query），片段（fragment）等，你可以查看 Apple 的 NSURL 类型参考。但对我个人而言，主要使用了 absoluteString，偶尔也会用到 pathExtension。

希望这篇文章对你有帮助。如果有，请在 Twitter 或任何社交媒体上分享这个帖子，每次分享都有裨益。当然，如果有任何问题，也请在[联系页面](http://www.codingexplorer.com/contact/) 或 Twitter [@CodingExplorer](https://twitter.com/CodingExplorer) 上联系我，我会尽量解答的。谢谢！

## 参考来源

* [NSURL 类型参考 -- Apple](https://developer.apple.com/library/ios/documentation/Cocoa/Reference/Foundation/Classes/NSURL_Class/)


> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。