在 Swift 2 中用 @NSManaged 标记自动生成方法"

> 作者：Tomasz Szulc，[原文链接](http://szulctomasz.com/swift-2-nsmanaged-for-methods/)，原文日期：2015/08/06
> 译者：[mmoaay](http://mmoaay.photo/)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[shanks](http://codebuild.me/)
  








> Xcode 7 beta 5 中的 Swift 2 拥有另外一个特性：当使用一对多关系时我们可以用 `@NSManaged` 来声明自动生成方法。

这个技巧非常有用。假设你有一个 `Library` 和多个 `Book` 实体对象。且 `Library` 和 `books` 是一对多的关系。那么使用最新的 Xcode 和 `@NSManaged` 就可以在 `Library` 实体对象内（手动）声明自动生成方法。



就像下面这样：

    
    class Library: NSManagedObject {
     
        @NSManaged func addBooksObject(book: Book)
        @NSManaged func removeBooksObject(book: Book)
        @NSManaged func addBooks(books: Set<Book>)
        @NSManaged func removeBooks(books: Set<Book>)
    }

天哪，这种实现方式竟然如此优雅！就在几天前我还不得不从零开始写这些方法。

但我发现一个问题。我们的确可以像这样声明方法，但是问题的关键是如何在任意位置生成它们并放入到 *Entity+CoreDataProperties.swift* 文件中？生成 Objective-C 子类时这些方法都会继承，甚至在 Swift 项目中也是如此。然而，生成 Swift 语言时——这些方法竟然不见了！详情参见 [rdar://22177139](http://www.openradar.me/22177139) 。

下面的代码是 Objective-C 生成的实体类

    objectivec
    
    @interface Library (CoreDataGeneratedAccessors)
     
    - (void)addBooksObject:(Book *)value;
    - (void)removeBooksObject:(Book *)value;
    - (void)addBooks:(NSSet<Book *> *)values;
    - (void)removeBooks:(NSSet<Book *> *)values;
     
    @end

如果你将关系标记为有序，就需要手动声明更多方法

    objectivec
    - (void)insertObject:(Book *)value inBooksAtIndex:(NSUInteger)idx;
    - (void)removeObjectFromBooksAtIndex:(NSUInteger)idx;
    - (void)insertBooks:(NSArray<Book *> *)value atIndexes:(NSIndexSet *)indexes;
    - (void)removeBooksAtIndexes:(NSIndexSet *)indexes;
    - (void)replaceObjectInBooksAtIndex:(NSUInteger)idx withObject:(Book *)value;
    - (void)replaceBooksAtIndexes:(NSIndexSet *)indexes withBooks:(NSArray<Book *> *)values;
    - (void)addBooksObject:(Book *)value;
    - (void)removeBooksObject:(Book *)value;
    - (void)addBooks:(NSOrderedSet<Book *> *)values;
    - (void)removeBooks:(NSOrderedSet<Book *> *)values;

这样写好麻烦啊……希望他们尽快修复这个问题 :)

另一个等待 Apple 修复的问题是：有序的一对多关系及其自动生成的方法。这个问题存在已久。但不知道是否有对应的错误报告。我认为该问题来源于：当在代码中使用 Core Data ，并且首次释放该功能时。假设我们想给 `Library` 添加一些 `Book`


    
    let ctx = self.managedObjectContext
    let library = NSEntityDescription.insertNewObjectForEntityForName("Library", inManagedObjectContext: ctx) as! Library
    let book1 = NSEntityDescription.insertNewObjectForEntityForName("Book", inManagedObjectContext: ctx) as! Book
    library.addBooksObject(book1)

结果是根本运行不起来。

    
    2015-08-06 23:14:18.541 NewNSManagedExample[54727:3677632] *** Terminating app due to uncaught exception 'NSInvalidArgumentException', reason: '*** -[NSSet intersectsSet:]: set argument is not an NSSet'
    *** First throw call stack:
    (
    	0   CoreFoundation                      0x00ea83b4 __exceptionPreprocess + 180
    	1   libobjc.A.dylib                     0x005cde02 objc_exception_throw + 50
    	2   CoreFoundation                      0x00dfc574 -[NSSet intersectsSet:] + 260
    	3   Foundation                          0x00214756 NSKeyValueWillChangeBySetMutation + 153
    	4   Foundation                          0x0017c4c7 NSKeyValueWillChange + 394
    	5   Foundation                          0x0021466a -[NSObject(NSKeyValueObserverNotification) willChangeValueForKey:withSetMutation:usingObjects:] + 630
    	6   CoreData                            0x00a981c6 _sharedIMPL_addObjectToSet_core + 182
    	7   CoreData                            0x00a99189 __generateAccessor_block_invoke_2 + 41
    	8   NewNSManagedExample                 0x000f0e80 _TFC19NewNSManagedExample11AppDelegate11applicationfS0_FTCSo13UIApplication29didFinishLaunchingWithOptionsGSqGVSs10DictionaryCSo8NSObjectPSs9AnyObject____Sb + 720
    	9   NewNSManagedExample                 0x000f10c7 _TToFC19NewNSManagedExample11AppDelegate11applicationfS0_FTCSo13UIApplication29didFinishLaunchingWithOptionsGSqGVSs10DictionaryCSo8NSObjectPSs9AnyObject____Sb + 199
    	10  UIKit                               0x0122e1c6 -[UIApplication _handleDelegateCallbacksWithOptions:isSuspended:restoreState:] + 337
    	11  UIKit                               0x0122f56c -[UIApplication _callInitializationDelegatesForMainScene:transitionContext:] + 3727
    	12  UIKit                               0x01236929 -[UIApplication _runWithMainScene:transitionContext:completion:] + 1976
    	13  UIKit                               0x01259af6 __84-[UIApplication _handleApplicationActivationWithScene:transitionContext:completion:]_block_invoke3142 + 68
    	14  UIKit                               0x012336a6 -[UIApplication workspaceDidEndTransaction:] + 163
    	15  FrontBoardServices                  0x03ff9ccc __37-[FBSWorkspace clientEndTransaction:]_block_invoke_2 + 71
    	16  FrontBoardServices                  0x03ff97a3 __40-[FBSWorkspace _performDelegateCallOut:]_block_invoke + 54
    	17  FrontBoardServices                  0x040171cb -[FBSSerialQueue _performNext] + 184
    	18  FrontBoardServices                  0x04017602 -[FBSSerialQueue _performNextFromRunLoopSource] + 52
    	19  FrontBoardServices                  0x040168fe FBSSerialQueueRunLoopSourceHandler + 33
    	20  CoreFoundation                      0x00dc27af __CFRUNLOOP_IS_CALLING_OUT_TO_A_SOURCE0_PERFORM_FUNCTION__ + 15
    	21  CoreFoundation                      0x00db843b __CFRunLoopDoSources0 + 523
    	22  CoreFoundation                      0x00db7858 __CFRunLoopRun + 1032
    	23  CoreFoundation                      0x00db7196 CFRunLoopRunSpecific + 470
    	24  CoreFoundation                      0x00db6fab CFRunLoopRunInMode + 123
    	25  UIKit                               0x01232f8f -[UIApplication _run] + 540
    	26  UIKit                               0x01238724 UIApplicationMain + 160
    	27  NewNSManagedExample                 0x000f24dc main + 140
    	28  libdyld.dylib                       0x039afa21 start + 1
    )
    libc++abi.dylib: terminating with uncaught exception of type NSException

这个问题唯一的解决办法就是重新实现那些方法。
详情参见[rdar://22177512](http://www.openradar.me/22177512)——希望他们早日修复这个问题。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。