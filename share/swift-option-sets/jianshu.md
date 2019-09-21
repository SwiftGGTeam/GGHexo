升级 CMake 使 Swift 的构建过程更加愉悦"

> 作者：Joe，[原文链接](http://dev.iachieved.it/iachievedit/upgrading-cmake-for-a-happier-swift-build/)，原文日期：2016/06/30
> 译者：[EyreFree](undefined)；校对：[walkingway](http://chengway.in/)；定稿：[CMB](https://github.com/chenmingbiao)
  









![](https://swift.gg/img/articles/swift-option-sets/swift-og-1.png1512890761.873188)

开源 Swift 已经有一些更新来利用新版本的 [CMake](https://cmake.org/) **在 Linux 上构建 Swift**。需要指出的是，Ubuntu 14.04 (2.8.12.2) 自带的默认版 cmake 不再胜任这项工作。

让我们把 Ubuntu 14.04 的 CMake 升级到 3.4.3，[开发者表示](https://lists.swift.org/pipermail/swift-dev/Week-of-Mon-20160627/002299.html)该版本可以满足需求。

当通过源代码安装软件时，通常会有一个构建区在 `/usr/local/src` 和一个存档区（所以可以跟踪我构建的版本）在 `/usr/local/archive`：

使用 root 账户或者用 sudo 方式执行：

    bash
    # cd /usr/local/archive
    # wget https://cmake.org/files/v3.4/cmake-3.4.3.tar.gz
    # cd ../src/
    # tar -xzvf ../archive/cmake-3.4.3.tar.gz

接下来，进行配置并且构建：

    bash
    # cd cmake-3.4.3
    # ./configure --prefix=/usr/local
    ...
    CMake has bootstrapped.  Now run make.
    # make

最后，`make install` 会将 cmake 和它的关联设置安装到 `/usr/local` 目录下。

    bash
    # make install
    # which cmake
    # cmake --version
    cmake version 3.4.3
    
    CMake suite maintained and supported by Kitware (kitware.com/cmake).

以上就是全部过程。构建愉快！

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。eveloper.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/ClassesAndStructures.html#//apple_ref/doc/uid/TP40014097-CH13-ID82)来遵从 [`OptionSet`](https://developer.apple.com/reference/swift/optionset) 协议，以引入选项集合，而非[枚举（`enum`）](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/Enumerations.html#//apple_ref/doc/uid/TP40014097-CH12-ID145)。为什么这样处理呢？当枚举成员互斥的时候，比如说，一次只有一个选项可以被选择的情况下，枚举是非常好的。但是和 C 不同，在 Swift 中，你无法把多个枚举成员组合成一个值，而 C 中的枚举对编译器来说就是整型，可以接受任意整数值。

和 C 中一样，Swift 中的选项集合结构体使用了高效的位域来表示，但是这个结构体本身表现为一个集合，它的成员则为被选择的选项。这允许你使用标准的[集合运算](https://en.wikipedia.org/wiki/Set_(mathematics)#Basic_operations)来维护位域，比如使用 [contains](https://developer.apple.com/reference/swift/optionset/1641006-contains) 来检验集合中是否有某个成员，或者是用 [union](https://developer.apple.com/reference/swift/optionset/1641498-union) 来组合两个位域。另外，由于 `OptionSet` 继承于 [`ExpressibleByArrayLiteral`](https://developer.apple.com/reference/swift/expressiblebyarrayliteral)，你可以使用数组字面量来生成一个选项集合。

    
    let options: NSString.CompareOptions = [.caseInsensitive, .backwards]
    options.contains(.backwards)          // → true
    options.contains(.regularExpression)  // → false
    options.union([.diacriticInsensitive]).rawValue  :// → 133 (= 1 + 4 + 128)

### 遵从 `OptionSet`

如何创建你自己的选项集合类型呢？仅有的要求是，一个类型为整型的原始值（`rawValue`）和一个初始化构造器。对于结构体来说，Swift 通常都会自动提供一个逐一成员构造器（memberwise initializer），所以你并不需要自己写一个。`rawValue` 是位域底层的存储单元。每个选项都应该是静态的常量，并使用适当的值初始化了其位域。

    
    struct Sports: OptionSet {
        let rawValue: Int
    
        static let running = Sports(rawValue: 1)
        static let cycling = Sports(rawValue: 2)
        static let swimming = Sports(rawValue: 4)
        static let fencing = Sports(rawValue: 8)
        static let shooting = Sports(rawValue: 32)
        static let horseJumping = Sports(rawValue: 512)
    }

现在，你可以创建选项集合了，就像这样：

    
    let triathlon: Sports = [.swimming, .cycling, .running]
    triathlon.contains(.swimming)  // → true
    triathlon.contains(.fencing)   // → false
需要注意的是，编译器并没有自动把 2 的整数次幂按照升序赋给你的选项——这些工作应该由你来做，你需要正确地赋值，使得每个选项代表 `rawValue` 中的其中一个位。如果你给选项赋予了连续的整数（1，2，3，...），就会导致无法分辨出 `.swimming`（值为 3）和 `[.running, .cycling]`（值为 1 + 2）。

手动赋值的好处有两个：a. 更直观易懂；b. 能够完全掌控每个选项的值。这也允许你提供额外的属性来对常用的选项进行组合：

    
    extension Sports {
        static let modernPentathlon: Sports =
            [.swimming, .fencing, .horseJumping, .shooting, .running]
    }
    
    let commonEvents = triathlon.intersection(.modernPentathlon)
    commonEvents.contains(.swimming)    // → true
    commonEvents.contains(.cycling)     // → false

### 选项集合并不是集合类型

遵从 `OptionSet` 并不意味着遵从 [`Sequence`](https://developer.apple.com/reference/swift/sequence) 和 [`Collection`](https://developer.apple.com/reference/swift/collection) 协议，所以你无法使用 `count` 来确定集合中有几个元素，也无法使用 `for` 循环来遍历选择的选项。从根本上说，一个选项集合仅仅是简单的整数值。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。