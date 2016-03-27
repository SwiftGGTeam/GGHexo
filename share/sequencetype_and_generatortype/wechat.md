如何用 Swift 实现序列和生成器"

> 作者：Raj Kandathi，[原文链接](http://rajkandathi.com/swift-sequencetype-generatortype/)，原文日期：2015-08-15
> 译者：[pmst](http://www.jianshu.com/users/596f2ba91ce9/latest_articles)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[shanks](http://codebuild.me/)
  







> 注：作者连续写了两篇文章，我们将译文合并到了一起

# 上篇

我们习惯于使用for-in语句来遍历集合，比如数组/字典。

举例来说:

    
    let library = ["The Swift Programming Language", "The Pragmatic Programmer", "Clean Code", "Refactoring"]
    for book in library {
        println(book)
    }

我们把图书馆内容封装到一个数组当中；接着，视图层(UI layer)将从数据层(data layer)中获取一个图书馆对象。正如上面代码所示，图书馆对象是一个集合(这里为数组)，支持用`for-in`语句遍历整个馆内藏书。



数据层(data layer)中的图书馆对象声明如下:

    
    // 为书本声明一个类，类内容包括:书名，出版日期
    class Book{
      let title:String,yearPublished:Int
    ​
      //初始化方法
      init(title:String,yearPublished:Int){
        self.title = title
        self.yearPublished = yearPublished
      }
    }
    ​
    // 为图书馆声明一个类，类内容包括:书本(类型为数组)
    class Library{
      // 图书馆中所有书本
      var books = [Book]()  
    ​
      // 图书馆中的书本数目
      var numberOfBooks:Int{
        return self.books.count
      }
    ​
      // 初始化方法
      init(books:[Book]){
        self.books = books
      }
    }
    // 实例化书本1 书本2 书本3 书本4  
    let book1 = Book(title: "The Swift Programming Language", yearPublished: 2014)
    let book2 = Book(title: "The Pragmatic Programmer", yearPublished: 1999)
    let book3 = Book(title: "Clean Code", yearPublished: 2008)
    let book4 = Book(title: "Refactoring", yearPublished: 1999)
    ​
    // 实例化一个图书馆对象 包含以上四本书
    let library = Library(books: [book1, book2, book3, book4])


 
为了使图书馆实例支持循环(即支持使用 for-in语句)，需要实现SequenceType协议。在Swift中，SequenceType协议定义如下:      

    
    // 译者注: Swift 自带的协议。因此读者只需知道该协议需要实现什么内容即可
    protocol SequenceType:_Sequence_Type{
        typealias Generator : GeneratorType
        func generate()->Generator
    }

其中`generate`方法非常关键，方法返回的类型为`GeneratorType`(译者注:同样是一个协议)。因此我们还需要实现`GeneratorType`协议，它的定义如下:      



    
    // 译者注: Swift 自带的协议。因此读者只需知道该协议需要实现什么内容即可
    protocol GeneratorType{
        typealias Element
        mutating func next()->Element?
    }

换言之，我们还需要实现`next()`方法，用于遍历整个图书馆书本。接下来创建一个类，命名为`LibarayGenerator`，它需要遵循并实现`GeneratorType`协议，代码如下:

    
    class LibarayGenerator:GeneratorType{
      var currentIndex = 0
      let library:Library
    ​
      //这是一个associated type,设置Element的别名为Book 类
      typealias Element = Book
    ​
      init(library:Library){
        self.library = library
      }
    ​
      // 译者注：
      // 实现GeneratorType 协议中指定的方法
      // 每次调用 返回图书馆中的一本书。
      // 实际上就是从书本数组中返回一个书本元素。
      // 假如没有更多书本可供输出 返会nil
      func next() -> Self.Element? {
        if (currentIndex < self.library.numberOfBooks){
          return self.library.books[currentIndex++]
        }
        return nil
      }
    }

现在我们拥有了一个`generator`(这里指`LibarayGenerator`类)。让我们继续实现`SequenceType`协议以及`generate()`方法。如下是一个已经实现`SequenceType`协议的类`LibrarySequence`:     

    
    class LibrarySequence:SequenceType{
      typealias Generator = LibarayGenerator
      var library:Library
    ​
      init(library:Library){
        self.library = library
      }
    ​
      func generate() -> Generator {
        return LibarayGenerator(library: self.library)
      }
    }

`LibrarySequence`类中的构造器方法传入的`library`对象，还用于创建一个`LibraryGenerator`实例。一旦我们实例化了一个`LibrarySequence`对象，就能够使用`for-in`语句遍历整个图书馆中的藏书了，代码如下:   

    
    let book1 = Book(title: "The Swift Programming Language", yearPublished: 2014)
    let book2 = Book(title: "The Pragmatic Programmer", yearPublished: 1999)
    let book3 = Book(title: "Clean Code", yearPublished: 2008)
    let book4 = Book(title: "Refactoring", yearPublished: 1999)
    ​
    let library = Library(books: [book1, book2, book3, book4])
    ​
    let librarySequence = LibrarySequence(library: library)
    for book in librarySequence {
      println(book.title)
    }

不难发现`LibraryGenerator`和`LibrarySequence`类中存在大量冗余代码，我将在下面一篇文章中重构这两个类，尽可能地精简代码。

# 下篇

>原文链接：[Swift – SequenceType & GeneratorType with GeneratorOf](http://rajkandathi.com/swift-sequencetype-generatortype-with-generatorof/)，原文日期：2015/08/22

在前一篇文章中，我们自定义了一个集合，并通过实现 SequenceTyp e以及 GeneratorType 两个协议，对集合内元素进行 for-in 循环遍历。前文例程中存在大量冗余代码。因此本文中，我们将讨论如何重构示例达到代码精简的目的。

上文中的最终实现代码:     

    
    // 译者注：
    // 声明了图书馆类
    class Library {
        var books = [Book]()
        var numberOfBooks: Int {
            return self.books.count
        }
    ​
        init(books: [Book]) {
            self.books = books
        }
    }
    ​
    // 声明了图书馆 Generator 遵循了 GeneratorType 协议
    // 使得每一次调用next()方法都会返回馆中的一本书
    // 倘若没有 则返回nil 
    class LibraryGenerator: GeneratorType {
        var currentIndex = 0
        let library: Library
        typealias Element = Book
    ​
        init(library: Library) {
            self.library = library
        }
    ​
        func next() -> Element? {
            if (currentIndex < self.library.numberOfBooks) {
                return self.library.books[currentIndex++]
            }
            return nil
        }
    }
    ​
    // 声明图书馆 Sequence 遵循了 SequenceType 协议 
    class LibrarySequence: SequenceType {
        typealias Generator = LibraryGenerator
        var library: Library
    ​
        init(library: Library) {
            self.library = library
        }
    ​
        func generate() -> Generator {
            return LibraryGenerator(library: self.library)
        }
    }
    ​
    let book1 = Book(title: "The Swift Programming Language", yearPublished: 2014)
    let book2 = Book(title: "The Pragmatic Programmer", yearPublished: 1999)
    let book3 = Book(title: "Clean Code", yearPublished: 2008)
    let book4 = Book(title: "Refactoring", yearPublished: 1999)
    ​
    let library = Library(books: [book1, book2, book3, book4])
    let librarySequence = LibrarySequence(library: library)
    // 由于实现了 SequenceType 协议 就能够使用 for-in 语句进行遍历了
    for book in librarySequence {
        print(book.title)
    }

其中，`LibraryGenerator` 和 `LibrarySequence` 类有如下代码是冗余的:     

-两者的构造方法相同，均接受一个类型为 `Library` 的参数。


-两者均包含一个 `library` 变量。

在我们开始重构代码之前，先看看 Swift 中自带的结构体 `GeneratorOf` 是如何声明的。     

    
    struct GeneratorOf<T> : GeneratorType, SequenceType {
        init(_ nextElement: () -> T?)
        init<G : GeneratorType where T == T>(_ base: G)
        mutating func next() -> T?
        func generate() -> GeneratorOf<T>
    }

`GeneratorOf` 结构体实现了 `GeneratorType` 协议，以及一个接收 `next()` 闭包参数的构造器方法,其中 `next()` 闭包参数还用于之后 `GeneratorType` 协议的实现。利用 `GeneratorOf` 结构体，我们能够摒弃`LibraryGenerator` 类，仅保留 `LibrarySquence` 就能实现原先要求。最后改良后的 `LibrarySeqence` 类代码如下:     

    
    class LibrarySequence: SequenceType {
        var library: Library
        var currentIndex = 0
    ​
        init(library: Library) {
            self.library = library
        }
    ​
        func generate() -> GeneratorOf<Book> {
            let next: () -> Book? = {
                if (self.currentIndex < self.library.numberOfBooks) {
                    return self.library.books[self.currentIndex++]
                }
                return nil
    ​
            }
            return GeneratorOf<Book>(next)
        }
    }

我觉得将 `Library`类和 `LibrarySequence` 类单独分离出去也没有任何必要。因此对上面代码进行精简:

-将 `library:Library` 替换成 `var books = [Book]()`。
-`LibrarySequence`类中的构造方法 `init(library:Library)` 更改为 `init(books: [Book]){self.books = books}`。
-将 `generate()` 方法中的 `library.numberOfBooks替换为books.count`。
-最后重命名 `LibrarySequence` 类为 `Library`。

精简后的`Library`类声明代码如下:

    
    class Library: SequenceType {
        var currentIndex = 0
        var books = [Book]()
    ​
        init(books: [Book]) {
            self.books = books
        }
    ​
        func generate() -> GeneratorOf<Book> {
            let next: () -> Book? = {
                if (self.currentIndex < self.books.count) {
                    return self.books[self.currentIndex++]
                }
                return nil
    ​
            }
            return GeneratorOf<Book>(next)
        }
    }

至此，我们能够通过使用如下代码来遍历整个图书馆。     

    
    let book1 = Book(title: "The Swift Programming Language", yearPublished: 2014)
    let book2 = Book(title: "The Pragmatic Programmer", yearPublished: 1999)
    let book3 = Book(title: "Clean Code", yearPublished: 2008)
    let book4 = Book(title: "Refactoring", yearPublished: 1999)
    ​
    let library = Library(books: [book1, book2, book3, book4])
    ​
    for book in library {
        print(book.title)
    }
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。