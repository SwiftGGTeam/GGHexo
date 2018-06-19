Objective-C Runtime 中内存释放的并发问题"

> 作者：Mike Ash，[原文链接](https://www.mikeash.com/pyblog/friday-qa-2015-05-29-concurrent-memory-deallocation-in-the-objective-c-runtime.html)，原文日期：2015-06-05
> 译者：[阳仔](https://github.com/YangGao1991)；校对：[numbbbbb](http://numbbbbb.com/)，[liberalism](https://weibo.com/1743643682/profile?topnav=1&wvr=6)；定稿：[CMB](https://github.com/chenmingbiao)
  









Objective-C Runtime 是绝大多数 Mac 和 iOS 程序代码的核心。Runtime 的核心就是 `objc_msgSend` 函数，这个函数最关键的就是方法缓存。我在这篇文章中将会阐述一下，Apple 是如何在不影响性能的情况下，以线程安全的方式来重新分配缓存大小、释放方法缓存。



### 消息传递的概念

`objc_msgSend` 会查找被调用的方法的实现，然后去执行。从概念上讲，查找方法的过程如下：

    Objective-C
        IMP lookUp(id obj, SEL selector) {
            Class c = object_getClass(obj);
    
            while(c) {
                for(int i = 0; i < c->numMethods; i++) {
                    Method m = c->methods[i];
                    if(m.selector == selector) {
                        return m.imp;
                    }
                }
    
                c = c->superclass;
            }
    
            return _objc_msgForward;
        }

考虑到源码的版权，一些变量名做了修改。如果你想看看真实的实现代码，可以查看 Objective-C runtime 的[开源代码](http://www.opensource.apple.com/source/objc4/)。

### 方法缓存

绝大部分 Objective-C 的代码都用到了消息传递。如果每一次消息传递都需要进行一次完整查找的话，速度将会非常慢。

解决方法是建立方法的缓存。每个类持有一个哈希表，将方法名映射到方法的实现。这个哈希表需要尽可能地提高读取效率，`objc_msgSend` 函数使用精心构造的汇编代码来快速实现这个哈希表的查询。这样，在有缓存的情况下，一条消息的传递只需要几纳秒的时间。虽然每条消息第一次被传递的时候还是很慢，但这之后，就会变得很快。

我们所说的“缓存”，通常来说是指为了加快多次访问最近使用过的资源的速度，而开辟的一块有限大小的区域。例如，你可能会把从网络上下载的图片缓存起来，那么接下来的一段时间，如果再需要使用到这些图片的话，就不需要再去从网络下载了。尽管如此，你也不会希望缓存占用太多的内存空间。所以你可能会限制缓存图片的最大数量。当缓存的图片达到最大数量后，每次缓存新的图片，就会把最旧的那个从缓存中去掉。

这对于大部分问题来说是一个不错的做法，但它也可能导致性能上的损耗。比如，你设定图片缓存最多缓存 40 张图片，但在某种情况下，你的应用需要一直循环使用 41 张图片，这时你会发现缓存完全不起作用！

对于我们自己的应用，可以通过测试，调整缓存的大小来避免出现这种情况，但 Objective-C 的 runtime 并不能这样做。方法缓存对性能来说非常重要，并且每个方法的缓存占用的空间都很小，因此，runtime 并不会对缓存空间的大小进行限制，而是会在需要时随时扩大缓存空间，来缓存所有发送过的消息。

请注意，runtime 的方法缓存有时确实是会刷新的。比如当将新的代码加载到进程时，或者修改了一个类的方法列表时，可能会导致某些缓存的数据失效。这时，相应的旧的缓存数据就会被删除，并重新写入新的缓存数据。

### 改变缓存大小，销毁，以及线程问题

改变缓存大小，从概念上来说比较简单，比如这样：

    c
        bucket_t *newCache = malloc(newSize);
        copyEntries(newCache, class->cache);
        free(class->cache);
        class->cache = newCache;

实际上，Objective-C runtime 在这个基础上又对代码进行了精简：旧的缓存数据并没有被复制到新的缓存空间中！毕竟，这只是一块缓存空间而已，并没有要求一定要保留其中的数据。在消息发送的时候，新的数据自然又会被缓存下来。因此，事实上，代码是这样：

    c
        free(class->cache);
        class->cache = malloc(newSize);

如果只讲单线程，需要做的就是这么多了，这篇文章到这也可以结束了。但是，Objective-C runtime 肯定要支持多线程操作，这就意味着所有的代码必须保证线程安全。每一个类的缓存数据都可能会被多个线程同时操作，因此，这里的代码必须谨慎处理，才能满足线程安全的条件。

像上面的写法自然不行。在释放了旧的缓存空间，并且还没有正确赋值新开辟的空间的这段“窗口时间”中，另一个线程就可能访问到非法的地址，这会导致其访问到垃圾数据。此外，如果那块内存没有进行映射的话，就会造成闪退。

我们如何解决这个问题？典型的做法是使用线程锁，就像这样：

    c
        lock(class->lock);
        free(class->cache);
        class->cache = malloc(newSize);
        unlock(class->lock);

所有访问都必须由锁控制，包括读操作。这样就意味着，`objc_msgSend` 方法可能需要获取线程锁，访问缓存空间，然后释放锁。考虑到缓存的查找本身只会占用几纳秒的时间，每次获取、释放锁会增加很多时间的损耗，对性能的影响太大了。

我们也可以尝试用另外的方法去解决“窗口时间”，比如先分配和赋值新的内存空间，再销毁旧的：

    c
        bucket_t *oldCache = class->cache;
        class->cache = malloc(newSize);
        free(oldCache);

这也许有点用，但并没有解决问题。另一个线程也可能先获取到旧缓存的指针，然后在访问内存前被系统中断。然后，旧的缓存被销毁后，另外的线程又重新启动，这就导致了和前面一样的问题。

如果我们加一个延迟呢？比如说：

    c
        bucket_t *oldCache = class->cache;
        class->cache = malloc(newSize);
        after(5 /* seconds */, ^{
            free(oldCache);
        });

这似乎是可行的，但还是可以想到一种情况，就是一个线程刚好被中断足够久，以至于五秒的延迟结束了才重新启动。虽然这样的情况及其罕见，但并不是毫无可能。

如果不是设置一个固定的延迟时间，而是确定等到“窗口时间”结束呢。我们可以给 `objc_msgSend` 函数增加一个计数器，就像这样：

    c
        gInMsgSend++;
        lookUpCache(class->cache);
        gInMsgSend--;

正确的线程安全的做法需要对计数器使用原子性，以及使用内存屏障，来保证互相依赖的缓存的读取/存储正确进行。这里我们假设计数器已经满足这些条件。

有了计数器，重新分配缓存的代码就会像这样：

    c
        bucket_t *oldCache = class->cache;
        class->cache = malloc(newSize);
        while(gInMsgSend)
            ; // spin
        free(oldCache);

注意，我们并不需要阻塞 `objc_msgSend` 执行，就能让这段代码正确工作。在给缓存的指针重新赋值后，一旦某一时刻，确认没有方法在调用 `objc_msgSend` 了，就可以将旧的缓存空间释放。另一个线程有可能会在旧缓存空间被释放的时候调用 `objc_msgSend` ，但这个新的调用不会访问到旧的缓存的指针，因此是安全的。

然而，轮询操作效率较低，且不优雅。事实上，释放旧的缓存空间并不是十分要紧的一件事。内存能够正确释放当然是好的，但晚点再释放也没有什么大不了的。因此，我们可以不使用轮询，而是持有一份未释放的缓存的记录表。每次需要释放缓存时，就清空所有待释放的缓存：

    c
        bucket_t *oldCache = class->cache;
        class->cache = malloc(newSize);
    
        append(gOldCachesList, oldCache);
        if(!gInMsgSend) {
            for(cache in gOldCachesList) {
                free(cache);
            }
            gOldCachesList.clear();
        }

如果一条消息正在传递的话，那这里并不会立刻清空旧的缓存。但没关系，当下次时机来临时，比如消息传递结束或未来的某个时间点，这些过期的缓存都会被清空。

这个版本已经很接近 Objective-C runtime 的源码了。

### 零消耗的标志位

消息传递中的两部分存在着明显的不同。`objc_msgSend` 可能每秒钟需要运行数百万次，因此速度必须足够快，最好单次调用只消耗几纳秒的时间。然而，重新分配缓存却是个比较不频繁的操作，而且随着应用的持续运行，该操作也会变得越来越少。一旦应用达到一个稳定状态，不再加载新的代码，不再修改消息列表，这时缓存也就达到了它们所需的最大容量，再也不需要重新分配缓存了。在这之前，可能会发生成百上千次的缓存的重新分配，但相比于 `objc_msgSend` 来说，调用次数还是很少，因此对性能的要求也很低。

因此，应当尽可能少的去干预消息传递的过程，尽管这样会让缓存释放的过程变慢。如果在 `objc_msgSend` 阶段能减少一个 CPU 周期，那么即使每次缓存释放操作都会消耗一百万个 CPU 周期，那也能极大提高效率。

这么说来，哪怕设置一个全局的计数器，性能损耗的代价还是太高。那意味着 `objc_msgSend` 过程中需要增加两次内存访问，从而增加很多性能开销。而需要使用原子性以及内存屏障只会让这变得更糟。幸运的是，Objective-C runtime 能够将 `objc_msgSend` 的性能损耗降到零，代价是会让缓存释放的过程变得慢很多。

在上面的代码中，我们设置全局计数器的目的是追踪是否有线程处于消息传递的过程中。事实上，线程本身知道自己正在运行什么代码：程序计数器。这是一个记录当前指令的内存地址的 CPU 寄存器。我们可以用它来代替全局的计数器，来检查每个线程是否处于 `objc_msgSend` 当中。如果所有线程都不处于 `objc_msgSend` 中，那么旧的缓存就可以被安全释放。这种方法的实现如下：

    c
        BOOL ThreadsInMsgSend(void) {
            for(thread in GetAllThreads()) {
                uintptr_t pc = thread.GetPC();
                if(pc >= objc_msgSend_startAddress && pc <= objc_msgSend_endAddress) {
                    return YES;
                }
            }
            return NO;
        }
    
        bucket_t *oldCache = class->cache;
        class->cache = malloc(newSize);
    
        append(gOldCachesList, oldCache);
        if(!ThreadsInMsgSend()) {
            for(cache in gOldCachesList) {
                free(cache);
            }
            gOldCachesList.clear();
        }

`objc_msgSend` 并不需要额外做任何事情，它可以不用考虑设置标志位，直接访问缓存：

    c
        lookUpCache(class->cache);

缓存释放的代码效率很低，因为它需要检查进程中所有线程的状态。但这样 `objc_msgSend` 可以做到与单线程环境中同样高的效率，这是一个值得付出的代价。这就是 Apple 的 runtime 源码实现方式。

### 真实代码

具体的实现可以查看 runtime 源码 [objc-cache.mm](https://opensource.apple.com/source/objc4/objc4-646/runtime/objc-cache.mm) 中的 `_collecting_in_critical` 函数。

需要使用程序计数器的入口和出口位置被储存在全局变量中：

    c
        OBJC_EXPORT uintptr_t objc_entryPoints[];
        OBJC_EXPORT uintptr_t objc_exitPoints[];

事实上，`objc_msgSend` 有多种实现方式（比如返回 struct 类型），内部的 `cache_getImp` 也会直接访问缓存。这些都需要在缓存释放的时候被检查。

`_collecting_in_critical` 函数没有入参，返回一个 `int` 类型，被当做一个布尔类型的标志位，指明是否有线程处于关键的函数中：

    c
        static int _collecting_in_critical(void)
        {

我会跳过该函数中不重要的部分，只介绍最关键的部分。如果你想阅读完整代码，可以查看 [opensource.apple.com](https://opensource.apple.com/source/objc4/objc4-646/runtime/objc-cache.mm)。

获取线程信息的 API 处于 mach 层。`task_threads` 能够获取到指定任务（进程在 mach 中的表示）中的所有线程，这里用它来获取当前进程中的线程：

    c
            ret = task_threads(mach_task_self(), &threads, &number);

函数会在 `threads` 中保存 `thread_t` 数组，在 `number` 中保存线程的数量。然后会遍历所有线程：

    c
            for (count = 0; count < number; count++)
            {

获取一个线程的程序计数器是在另外一个单独的函数中：

    c
                pc = _get_pc_for_thread (threads[count]);

然后，程序会遍历所有的入口和出口，并逐个进行判断：

    c
                for (region = 0; objc_entryPoints[region] != 0; region++)
                {
                    if ((pc >= objc_entryPoints[region]) &&
                        (pc <= objc_exitPoints[region])) 
                    {
                        result = TRUE;
                        goto done;
                    }
                }
            }

遍历结束后，将结果返回给调用者：

    c
            return result;
        }

`_get_pc_for_thread` 函数是怎么工作的呢？它只是简单地调用 `thread_get_state` 函数来获得目标线程的寄存器状态。之所以要放到一个单独的函数中，是因为寄存器状态的结构体是与具体架构相关的，不同架构都有不同的寄存器。也就是说，这个函数需要对每个支持的架构有一套单独的实现，尽管这些实现差别不大。下面是 x86-64 下的实现：

    c
        static uintptr_t _get_pc_for_thread(thread_t thread)
        {
            x86_thread_state64_t            state;
            unsigned int count = x86_THREAD_STATE64_COUNT;
            kern_return_t okay = thread_get_state (thread, x86_THREAD_STATE64, (thread_state_t)&state, &count);
            return (okay == KERN_SUCCESS) ? state.__rip : PC_SENTINEL;
        }

rip 是 x86-64 下程序计数器的寄存器名字。“R”代表“register”，“IP”代表“instruction pointer”。

上面所说的入口和出口的代码位置，与其函数一同定义在汇编文件中：

    c
        .private_extern _objc_entryPoints
        _objc_entryPoints:
            .quad   _cache_getImp
            .quad   _objc_msgSend
            .quad   _objc_msgSend_fpret
            .quad   _objc_msgSend_fp2ret
            .quad   _objc_msgSend_stret
            .quad   _objc_msgSendSuper
            .quad   _objc_msgSendSuper_stret
            .quad   _objc_msgSendSuper2
            .quad   _objc_msgSendSuper2_stret
            .quad   0
    
        .private_extern _objc_exitPoints
        _objc_exitPoints:
            .quad   LExit_cache_getImp
            .quad   LExit_objc_msgSend
            .quad   LExit_objc_msgSend_fpret
            .quad   LExit_objc_msgSend_fp2ret
            .quad   LExit_objc_msgSend_stret
            .quad   LExit_objc_msgSendSuper
            .quad   LExit_objc_msgSendSuper_stret
            .quad   LExit_objc_msgSendSuper2
            .quad   LExit_objc_msgSendSuper2_stret
            .quad   0

`_collecting_in_critical` 的用法和上面我们假设的例子很相似。它在释放缓存之前被调用。事实上，runtime 有两种工作模式：一种是如果其他线程正在调用相关函数的话，就把垃圾内存的清理工作留到下一次调用；另一种是一直轮询，直到确认没有线程正在调用，然后再进行销毁：

    c
        // Synchronize collection with objc_msgSend and other cache readers
        if (!collectALot) {
            if (_collecting_in_critical ()) {
                // objc_msgSend (or other cache reader) is currently looking in
                // the cache and might still be using some garbage.
                if (PrintCaches) {
                    _objc_inform ("CACHES: not collecting; "
                                  "objc_msgSend in progress");
                }
                return;
            }
        } 
        else {
            // No excuses.
            while (_collecting_in_critical()) 
                ;
        }
    
        // free garbage here

第一种将垃圾内存留到下一次调用时清理的模式，是在正常的重新分配缓存大小时采用；第二种始终清理垃圾内存的模式，是在需要刷新所有类的所有缓存时使用，因为这样往往会产生大量的垃圾内存。以我阅读代码来看，这种情况只会在开启一项日志调试功能时发生。日志调试会将所有的消息发送记录到文件中，消息缓存会影响这一日志，因此需要全部刷新。

### 总结

性能和线程安全经常会互相冲突。不同部分的代码对同一块内存的访问方式往往不同，也就允许我们以更加有效率的方式来实现线程安全。方式之一是用一个全局标志位或者计数器来指明对内存的改动操作是否安全。在 Objective-C runtime 中，Apple 更进一步，使用了各个线程的程序计数器来判断线程是否正在进行不安全的操作。这是一个很专业的案例，这种做法想要用到其他地方也不是很有用，但研究它的原理本身就是一件很有意思的事情。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。