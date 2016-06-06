模式匹配第四弹：if case，guard case，for case

> 作者：Olivier Halligon，[原文链接](http://alisoftware.github.io/swift/pattern-matching/2016/05/16/pattern-matching-4/)，原文日期：2016-05-16
> 译者：[walkingway](http://chengway.in/)；校对：[Cee](https://github.com/Cee)；定稿：[numbbbbb](http://numbbbbb.com/)
  










现在我们来重新回顾下前三弹模式匹配的各种语法 [第一弹](http://swift.gg/2016/04/26/pattern-matching-1/)，[第二弹](http://swift.gg/2016/04/27/pattern-matching-2/)，[第三弹](http://swift.gg/2016/04/28/pattern-matching-3/)，第四弹是本系列的最后一篇文章，本章会教大家使用 `if case let`，`for case where` 等一些高级语法，让我们拭目以待吧！

本篇文章会结合本系列前三篇文章提到的语法，然后将它们应用在一些更先进表达式中。



> 这篇文章是模式匹配系列文章的最后一部分，你可以在这里阅读所有内容：[第一弹](http://swift.gg/2016/04/26/pattern-matching-1/)，[第二弹](http://swift.gg/2016/04/27/pattern-matching-2/)，[第三弹](http://swift.gg/2016/04/28/pattern-matching-3/)，[第四弹](http://swift.gg/2016/06/06/pattern-matching-4/)

## if case let

语句 `case let x = y` 模式允许你检查 `y` 是否能匹配 `x`。

而 `if case let x = y { … }` 严格等同于 `switch y { case let x: … }`：当你只想与一条 case 匹配时，这种更紧凑的语法尤其有用。有多个 case 时更适合使用 `switch`。

例如，我们有一个与之前文章类似的枚举数组：

    
    enum Media {
      case Book(title: String, author: String, year: Int)
      case Movie(title: String, director: String, year: Int)
      case WebSite(urlString: String)
    }

然后我们可以这样写：

    
    let m = Media.Movie(title: "Captain America: Civil War", director: "Russo Brothers", year: 2016)
    
    if case let Media.Movie(title, _, _) = m {
      print("This is a movie named \(title)")
    }

改用 switch 后更冗长的版本：

    
    switch m {
      case let Media.Movie(title, _, _):
        print("This is a movie named \(title)")
      default: () // do nothing, but this is mandatory as all switch in Swift must be exhaustive
    }

## if case let where

我们当然还可以将 `if case let` 和 `where` 从句组合在一起用：

    
    if case let Media.Movie(_, _, year) = m where year < 1888 {
      print("Something seems wrong: the movie's year is before the first movie ever made.")
    }

这种方式可以组合成一个相当强大的表达式，而改用 `switch` 实现可能会变得非常复杂，需要写很多行代码来检测那一个特定的 case。

## guard case let

当然，`guard case let` 类似于 `if case let`，你可以使用 `guard case let` 和 `guard case let … where …` 来确保匹配一个模式或一个条件，而当无法匹配模式或满足条件时就退出。

    
    enum NetworkResponse {
      case Response(NSURLResponse, NSData)
      case Error(NSError)
    }
    
    func processRequestResponse(response: NetworkResponse) {
      guard case let .Response(urlResp, data) = response,
        let httpResp = urlResp as? NSHTTPURLResponse
        where 200..<300 ~= httpResp.statusCode else {
          print("Invalid response, can't process")
          return
      }
      print("Processing \(data.length) bytes…")
      /* … */
    }

## for case

将 `for` 和 `case` 组合在一起也能让你有条件地遍历一个集合对象。使用 `for case …` 语义上类似于 `for` 循环，而且将它整个循环体封装在了 `if case` 的结构之中：它只会遍历、处理那些模式匹配了的元素。 

    
    let mediaList: [Media] = [
      .Book(title: "Harry Potter and the Philosopher's Stone", author: "J.K. Rowling", year: 1997),
      .Movie(title: "Harry Potter and the Philosopher's Stone", director: "Chris Columbus", year: 2001),
      .Book(title: "Harry Potter and the Chamber of Secrets", author: "J.K. Rowling", year: 1999),
      .Movie(title: "Harry Potter and the Chamber of Secrets", director: "Chris Columbus", year: 2002),
      .Book(title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", year: 1999),
      .Movie(title: "Harry Potter and the Prisoner of Azkaban", director: "Alfonso Cuarón", year: 2004),
      .Movie(title: "J.K. Rowling: A Year in the Life", director: "James Runcie", year: 2007),
      .WebSite(urlString: "https://en.wikipedia.org/wiki/List_of_Harry_Potter-related_topics")
    ]
    
    print("Movies only:")
    for case let Media.Movie(title, _, year) in mediaList {
      print(" - \(title) (\(year))")
    }
      
    /* Output:
    Movies only:
     - Harry Potter and the Philosopher's Stone (2001)
     - Harry Potter and the Chamber of Secrets (2002)
     - Harry Potter and the Prisoner of Azkaban (2004)
     - J.K. Rowling: A Year in the Life (2007)
    */

## for case where

为 `for case` 增加一个 `where` 从句，能使其变得更加强大：

    
    print("Movies by C. Columbus only:")
    for case let Media.Movie(title, director, year) in mediaList where director == "Chris Columbus" {
      print(" - \(title) (\(year))")
    }
    
    /* Output:
    Movies by C. Columbus only:
     - Harry Potter and the Philosopher's Stone (2001)
     - Harry Potter and the Chamber of Secrets (2002)
    */

💡注意：使用 `for … where` 而不带 `case` 模式匹配依然是符合 Swift 语法规则的。比如你这样写也是 OK 的： 

    
    for m in listOfMovies where m.year > 2000 { … }

这里没有使用模式匹配（没有 case 或 ~=），因此有点超出了本系列的主题范围，但是这种写法是完全有效的，而且这种构造也非常有用---特别是避免了将一个巨大的判断逻辑 `if` 结构（或是一个 `guard … else { continue }`）封装在 `for` 的循环体内。

## 将它们组合起来使用

现在我们终于要迎来这系列文章的大结局了：把我们之前所学从头到尾串联起来（包括一些我们在之前章节学习到的类似 `x?` 这种语法糖）：

    
    extension Media {
      var title: String? {
        switch self {
        case let .Book(title, _, _): return title
        case let .Movie(title, _, _): return title
        default: return nil
        }
      }
      var kind: String {
        /* Remember part 1 where we said we can omit the `(…)` 
        associated values in the `case` if we don't care about any of them? */
        switch self {
        case .Book: return "Book"
        case .Movie: return "Movie"
        case .WebSite: return "Web Site"
        }
      }
    }
    
    print("All mediums with a title starting with 'Harry Potter'")
    for case let (title?, kind) in mediaList.map({ ($0.title, $0.kind) })
      where title.hasPrefix("Harry Potter") {
        print(" - [\(kind)] \(title)")
    }

上面的代码可能看上去有点复杂，我们先拆分一下：

- 使用 `map` 函数将 `Array<Media>` 类型的数组 `mediaList` 转换成一个包含元组 `[(String?, String)]` 的数组，而其中的元组包含两个元素：第一个是标题（String? 类型），第二个是元素的种类（String 类型）
- 它只当 title? 匹配时整个表达式才会匹配──还记得第三弹的那个语法糖吗：「当 switch 处理一个可选值 `x?` 时，你可以识别问号标记的可选值」，因此这里的 `title?` 相当于 `.Some(title)`，它是不会匹配 title 为 nil 的情况的（译者注：至于为什么要写成 title? 上一弹也有说明：因为后面与之匹配的是一个可选值（`mediaList.map(...)` 的 title），匹配类型要一致，否则会报错。）──因此匹配的结果是剔除所有 `$0.title` 为 `nil` 的 `media`（也就是 title 为 `Optional.None`）──最终剩下的 media 中不包括 `WebSite` 类型，因为它没有 `title`。
- 然后再进一步去遍历 media，判断他们的 `title` 是否满足 `title.hasPrefix("Harry Potter")` 条件

最后这段代码将遍历每一个 medium，筛选出那些以 “Harry Potter” 开头的，在这一过程中将丢弃那些没有标题的，比如 WebSite，还有那些标题不以 "Harry Potter" 开头的 medium，这也包括作者 J.K.罗琳的记录片。

最终的输出结果如下，只有和 Harry Potter 相关的书籍和电影：

    
    All medium with a title starting with 'Harry Potter'
     - [Book] Harry Potter and the Philosopher's Stone
     - [Movie] Harry Potter and the Philosopher's Stone
     - [Book] Harry Potter and the Chamber of Secrets
     - [Movie] Harry Potter and the Chamber of Secrets
     - [Book] Harry Potter and the Prisoner of Azkaban
     - [Movie] Harry Potter and the Prisoner of Azkaban

如果不使用模式匹配、where 从句、或是前面提到的各种语法糖，代码写出来可能是这样的：

    
    print("All mediums with a title and starting with 'Harry Potter'")
    for media in mediaList {
      guard let title = media.title else {
        continue
      }
      guard title.hasPrefix("Harry Potter") else {
        continue
      }
      print(" - [\(media.kind)] \(title)")
    }

有些人可能觉得这种写法可读性更好，但你无法否认 `for case let (title?, kind) in … where …` 确实强大，<del>可以在小伙伴面前装个逼</del>，而且可以将循环 + 模式匹配 + `where` 从句组合起来是使用 ✨。

## 结论

「模式匹配」系列文章到此就全部结束了，希望你能喜欢它，并真正学到了一些有趣的东西 😉。

下一篇文章我将聚焦 Swift 的设计模式与架构，而不再是语言本身的语法了。

💡 如果关于 Swift 你有什么特别想要从我这里了解到的，请不要犹豫，直接在 [Twitter](https://twitter.com/aligatr) 上联系我吧，我的下一篇文章的灵感很可能就来自于你们的建议。

> 模式匹配和参数的顺序颠倒会导致语法错误。为了方便记忆，想像一下 `switch` 中 `case let Media.Movie(…)` 的顺序，他们是一致的。这样你就知道应该是 `if case let Media.Movie(…) = m` ，而不是 `if case let m = Media.Movie(…)`，后者是完全不会编译的。和 switch 中所做的一样，将 `case` 和模式（`(Media.Movie(title, _, _)`）放在一起，而不是与变量（`m`）在一起。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。