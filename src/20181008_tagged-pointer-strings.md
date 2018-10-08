title:Tagged Pointer 字符串
date:2018-10-08
tags: [iOS 开发, Objective-C]
categories: [Mike Ash]
permalink: tagged-pointer-strings
keywords: tagged pointer, NSString, NSTaggedPointerString 
custom_title: Tagged Pointer 字符串 
description: Tagged pointer 是一项用于提高性能并减少内存使用的有趣技术，本文探讨了 NSString 中应用 tagged pointer 的实现原理。

---
原文链接=https://www.mikeash.com/pyblog/friday-qa-2015-07-31-tagged-pointer-strings.html
作者=Mike Ash
原文日期=2015-07-31
译者=jojotov
校对=Forelax,冬瓜
定稿=Forelax

<!--此处开始正文-->

Tagged pointer 是一项用于提高性能并减少内存使用的有趣技术。在 OS X 10.10 中，`NSString` 也开始使用了 tagged pointer 技术，今天我会在 Ken Ferry 的提议下，窥探其工作原理。

<!--more-->

## 概述

对象存储在内存中的时候是内存对齐的，因此他们的地址总是单个指针大小的倍数，在实际中通常是 16 的倍数。对象的指针通常是以一个完整的 64 位整型的结构进行存储，不过由于内存对齐的，指针中一些位总会为零。

Tagged pointer 技术受益于此，通过让这些位不再为 0，赋予了对象指针一些特殊意义。在苹果的 64 位 Objective-C 实现当中，对象指针的最低有效位设置为 1 的时候 (也就是说，它是一个奇数) ，此指针被认为是 tagged pointer。此时，最低有效位前面的 3 位不再被当作 isa 指针的地址，而是用于表示一个特殊的 tagged class 表的索引值。这个索引值可以用来查找 tagged pointer 所对应的类。剩余的 60 位则会被直接使用。

来看一个对上述理论的简单应用：当我们创建一个 `NSNumber` 对象时，如果它适合于 tagged pointer 技术，那么这个对象将不再是一个真正的 `NSNumber` 对象——它的指针会自动转换为 tagged pointer 指针，并且最低位会被设置为 1；接下来的 3 位会设为 `NSNumber` 所对应的 tagged class 在一个全局表中的索引；而剩余的 60 位会用作保存其数值 —— 比如一个能用 60 位表示的整型值。

对于外部而言，这样的一个指针与其他任何对象的指针看起来都是一样的。它能像其他对象一样响应消息，因为 `objc_msgSend` 知道它是一个 tagged pointer 类型的指针。假如你要向它发送 `integerValue` 的消息，OC 运行时会帮助我们从它存储数据的 60 位中拿出数据并返回。

尽管为了对外统一，运行时做了很多额外工作，但最终你节省了一次内存的初始化，一次指针的间接访问，并且也不会有任何关于引用计数的操作 —— 因为没有内存需要被释放。对于一些经常使用的类来说，这能带来显著的性能提升。

`NSString` 看起来不太适用于 tagged pointer 技术，因为它的长度是可变的，而且可能会远远超出 tagged pointer 所能存储的范围。但话虽如此，一个 tagged pointer 的类是可以和普通的类共存的 —— 某些值使用 tagged pointer，另外一些值使用普通指针。例如，对于 `NSNumber` 来说，一个大于 2^60 - 1 的整型超出了 tagged pointer 所能存储的范围，那么它就需要存储为一个在内存中初始化的普通 `NSNumber` 对象。

`NSString` 亦是如此。假如某些字符串可以保存为 60 位以内的二进制数据，它会创建为 tagged pointer，而其他字符串会保存为普通的对象。据此我们可以假设，如果小的字符串经常被使用且达到一定的使用量时，它会获得可观的性能。在真实的代码中会有如此效果吗？显然苹果给出了肯定的答案 —— 如果没有实际效果，他们不会尝试去实现它。

## 可能的实现

在窥探苹果的实现之前，我们先花点时间思考一下可能的实现方案。基本准则很简单：把最低位设为 1，然后把后面的几位设为合适的 tagged class 索引，最后把剩下的位设为任意值。此时最大的问题是如何利用剩余的 60 位 —— 我们要尽可能最大化这 60 位的价值。

Cocoa 框架中的字符串在某种概念上其实是一个 Unicode 码位的序列。Unicode 包含了 1,112,064 个有效码位，所以一个码位需要用 21 位来表示。也就是说，我们可以在 60 位的长度中放入两个 Unicode 码位，这样还剩下 18 位没有使用。我们可以利用这 18 位中其中几位来表示字符串的长度。因此，这样的一个 tagged pointer  字符串可能会包含零个、一个或者两个 Unicode 码位。但问题是，最多只能包含两个码位好像并不太实用。

实际上，`NSString` API 使用了 UTF-16 实现，并非原始的 Unicode 码位。UTF-16 把 Unicode 表示为一个包含多个 16 位数值的序列。在基本多语言平面（Basic Multilingual Plane，BMP）中的字符，也就是那些最常用的字符，会使用一个 16 位的值表示。同时，那些超过 65,535 的码位会使用两个 16 位 (也就是 32 位) 的值来表示。因此，我们可以在 60 位的长度中放入三个 16 位的值，剩余的 12 位同样用于表示长度。也就是说，我们可以放入 0 至 3 个 UTF-16 编码的字符 —— 严格来说是最多三个 BMP 中的字符，或者最多一个 BMP 之上平面的字符加一个 BMP 平面之下的字符。不过最多三个字符，我们还是会很受限。

在应用中的大多数字符串都是 ASCII。即使这个应用本地化为一种非 ASCII 的语言，字符串也不只是单纯地在 UI 层用作展示 —— 字符串会用于 URL 的组成、文件扩展名、对象的键、属性列表的值等等。UTF-8 是一种兼容 ASCII 的编码，它会把每个 ASCII 字符编码为单个字节，并且对其他 Unicode 码位使用最多四个字节进行编码。这样，我们能在 60 位中放入最多 7 个字节，剩下 4 位表示长度。因此，根据不同的字符格式，我们的 tagged pointer 字符串可以包含最多 7 个 ASCII 字符，或者更少量的非 ASCII 字符。

如果我们针对 ASCII 优化一下，或许我们能完全抛弃对所有 Unicode 都支持的想法 —— 那些非 ASCII 的字符都使用真正的字符串对象来保存。ASCII 是一种 7 位的编码方式。因此，假设我们只给每个字符分配 7 位的空间呢？那么我们能在可利用的 60 位空间中保存最多 8 个 ASCII 字符，剩余 4 位表示长度。现在，我们的方案听上去开始具有一定的可行性了 —— 在应用中应该有不少字符串是纯正的 ASCII 并且仅包含 8 个或更少的字符。

让我们的思维放飞一点，完整的 ASCII 范围中包含了许多并不常用的东西。比如其中有一大堆控制字符和非常用符号。而字母和数字才是我们最常用的。我们能把它压缩成只有 6 位吗？

6 位可以表示 64 个可能的值。ASCII 字母表中有 26 个英文字母。如果把大写字母也算上的话一共有 52 个字母。再加上 0-9 的数字，一共有 62 个。现在还有两个空余的位置，我们可以把它们留给空格和句号。这样应该会有很多的字符串只包含上述的字符。如果一个字符只需要 6 位，那么我们可以在 60 位空间中保存最多 10 个字符！不过别高兴太早，我们现在没有多余的位置来表示长度了！因此，我们可以选择这 60 位保存 9 个字符和 1 个长度，或者我们去掉上面的 64 个值之一 (我投票给空格)，然后用一个 6 位的 `0` 表示少于 10 个字符的字符串的结束位。(译者注：去掉 64 个字符集合中的一个，然后加入一个结束符，当遇到结束符的时候就表示字符串结束，长度为结束符的位置，否则长度刚好为 10。)

如果只使用 5 位呢？这好像有点天方夜谭。但实际上，应该有很大一部分的字符串只包含小写字母。5 位可以表示 32 个可能的值。如果我们把整个小写字母表考虑进来，那么还剩下 6 个位置，可以分配给一些常用的大写字母、符号和数字。如果你觉得这些除小写字母外的情况更为常见，你甚至可以去掉一些不常用的小写字母，比如字母 `q`。每个字符只使用 5 位的话，那么我们可以存放 11 个字符并且还能有存放长度的空间，或者我们保存 12 个字符，并采用结束符的方案表示长度。

让我们的思维再飞远一点。每个字符只使用 5 位似乎已经是在字母表长度固定的前提下的最优解了。不过你可以使用一些变长的编码，例如 Huffman 编码。这样的话，对于一个常见的字母 `e`，可以使用比字母 `q` 更少的位表示。也就是说，假设你的字符串全都是 `e`，那字符串的每个字符最少可以只用 1 位表示。但这样的代价是你的代码会变得更加复杂，且性能或许较差。

苹果到底是采用哪种方案的呢？我们现在来一探究竟。

## Tagged Pointer 字符串实践

下面的代码创建了一个 tagged pointer 字符串并打印了它的指针：

```objc
NSString *a = @"a";
NSString *b = [[a mutableCopy] copy];
NSLog(@"%p %p %@", a, b, object_getClass(b));
```

这里 `mutableCopy` 和 `copy` 的操作可能会让人费解，但它却是必须的。其中有两个原因：首先，尽管一个像 `@"a"` 这样的字符串可以被存储为 tagged pointer 字符串，但如果是常量字符串的话，那么它永远不会存储为 tagged pointer 字符串。常量字符串必须保证能够兼容不同的操作系统版本，但 tagged pointer 字符串的内部细节却不保证能兼容。如果只是苹果的运行时代码所生成的 tagged pointer，它不会有任何问题。但如果像常量字符串一样，编译器把它们嵌入在二进制文件中时，就可能会发生崩溃的问题。因此，我们需要对常量字符串进行 `copy` 操作来拿到一个 tagged pointer。

必须进行 `mutableCopy` 操作的原因是，`NSString` 对我们来说十分的 “聪明” ，它能知道一个对不可变字符串的 `copy` 其实是一个毫无意义的操作，并返回原来的字符串作为 `copy` 操作后的值。因为常量字符串是不可变的，所以 `[a copy]` 的返回值其实与 `a` 是一样的。不过，`mutableCopy` 会强制进行真正的拷贝操作（深拷贝），然后对这样一个深拷贝后的结果再进行一次不可变拷贝操作后，足以让系统返回给我们一个 tagger pointer 字符串。

> 译者注：`[a mutableCopy]` 会在运行时创建一个可变字符串（深拷贝），因此避免了上面原因一中关于常量字符串的情况。但由于 `mutableCopy` 后的对象是一个可变对象，不可能为 tagged pointer，因此需要再对此可变副本进行一次 `copy` 操作。这次 `copy` 会在运行时返回一个新的不可变副本（深拷贝），避免了上面原因二中对常量字符串拷贝返回原值的情况（浅拷贝），进而保证了最后返回的对象是经过运行时创建出来的（tagged pointer 对象只会在运行时创建）。

注意，你一定不可以在自己的代码中依赖这些细节！`NSString` 的代码返回一个 tagged pointer 给你的情况并不是一成不变的，如果你编写的代码不知怎么地依赖于此，那它最终可能会导致崩溃。幸好，正常且合理的代码不会有任何问题 —— 让你可以幸福地忽略所有 tagged 相关的东西。

上面的代码在我的电脑上打印如下：

```
0x10ba41038 0x6115 NSTaggedPointerString
```

首先，你可以看到原始的指针 —— 一个用来表示对象指针的整数。第二个值为 `copy` 后的指针，它非常清晰地表示出 tagged pointer 的特性：首先，它是一个奇数，也就是说它不会是一个有效的对象指针（内存对齐的关系）。同时，它是一个很小的数。在 64 位 Mac 系统的地址空间中，一开始的 4GB 是没有任何映射且不能建立映射的空页。因此，这个属于空页的地址也很好地证明了它不可能是一个对象指针。

我们可以从 `0x6115` 这个值推断出什么呢？首先我们可以知道最低的 4 位是 tagged pointer 机制本身的一部分。最低的十六进制数字 `5` 在二进制中为 `0101`。最低位的 `1` 表明了它是一个 tagged pointer。剩下的 3 位表明了它的 tagged class —— 在这个例子中是 `010`，表明了 tagged pointer 字符串类的索引值为 `2`。不过这些信息并不能提供给我们什么有用的东西。

而上面例子中十六进制地址的 `61` 则很值得我们探讨一番。在十六进制中，`61` 刚好为字母 a 的 ASCII 编码。还记得这个指针所指向的值吗 —— 正好就是字母 a！看起来这里直接使用了 ASCII 编码的值，真是个方便而又合适的选择！

接下来打印出的类名明显地表明了它的类是什么，并且也提供了一个非常不错的切入点，来让我们深入其真实源码一探此特性的本质实现。我们很快会进入这一阶段，不过在此之前先做点额外的检查。

这里通过一个循环构造出 `abcdef...` 的字符串，同时把属于 tagged pointer 的字符串指针一个接一个地打印出来。

```objc
NSMutableString *mutable = [NSMutableString string];
NSString *immutable;
char c = 'a';
do {
    [mutable appendFormat: @"%c", c++];
    immutable = [mutable copy];
    NSLog(@"0x%016lx %@ %@", immutable, immutable, object_getClass(immutable));
} while(((uintptr_t)immutable & 1) == 1);
```

第一次迭代的打印结果为：

```
0x0000000000006115 a NSTaggedPointerString
```

这验证了上文的所写的。需要注意的是，现在我们把包含空位 0 的指针完整地打印出来，可以让每次迭代的打印结果对比更加清晰。

现在对比一下第二次迭代的打印结果：

```
0x0000000000626125 ab NSTaggedPointerString
```

可以看到最低 4 位没有发生任何变化，这也在我们意料之中。这个十六进制的数字 `5` 会一直保持不变，总是表明它是一个 `NSTaggedPointerString` 类型的 tagged pointer。

而原来的 `61` 也保持原来的位置，不过现在它前面出现了 `62`。显而易见，`62` 是字母 b 的 ASCII 编码，因此我们可以知道当前的编码方式是使用 ASCII 的 8 位编码。而在最低位之前的 4 位由 `1` 变成了 `2`，由此我们可以想到它或许表示了字符串的长度。接下来的迭代确认了这个猜想：

```
0x0000000063626135 abc NSTaggedPointerString
0x0000006463626145 abcd NSTaggedPointerString
0x0000656463626155 abcde NSTaggedPointerString
0x0066656463626165 abcdef NSTaggedPointerString
0x6766656463626175 abcdefg NSTaggedPointerString
```

按理来说，由于 tagged pointer 的空位已经填满了，迭代应该也到此为止。可事实的确如此吗？并不是！

```
0x0022038a01169585 abcdefgh NSTaggedPointerString
0x0880e28045a54195 abcdefghi NSTaggedPointerString
0x00007fd275800030 abcdefghij __NSCFString
```

循环中的代码继续执行下去，直到两次迭代后才终止。表示长度的区间继续保持增长，但指针剩余的部分却显得杂乱无章。到底是发生了什么呢？让我们深入其实现代码来一探究竟。

## 刨根问底

`NSTaggedPointer` 类存在于 CoreFoundation 库中。似乎把它放在 Foundation 中会更加合理一点，但实际上现在苹果许多核心的 Objective-C 类都被移到了 CoreFoundation 当中，因为苹果慢慢地放弃了把  CoreFoundation 变成一个独立实体的想法。

先来看看 `-[NSTaggedPointerString length]` 的实现：

```
push       rbp
mov        rbp, rsp
shr        rdi, 0x4
and        rdi, 0xf
mov        rax, rdi
pop        rbp
ret
```

Hopper 工具为我们提供了这个简易的反编译版本：


```objc
unsigned long long -[NSTaggedPointerString length](void * self, void * _cmd) {
    rax = self >> 0x4 & 0xf;
    return rax;
}
```

简单来说，提取出 4 至 7 位的值并返回它们便可以得到字符串的长度。这证实了我们上文中所观察到的 —— 在最低位的十六进制 `5` 前面的 4 位表示了字符串的长度。 

`NSString` 子类中另一个原始方法是 `characterAtIndex:`。由于其汇编代码太长，我会直接跳过并给出 Hopper 反编译出的可读性较高的版本：

```objc
   unsigned short -[NSTaggedPointerString characterAtIndex:](void * self, void * _cmd, unsigned long long arg2) {
        rsi = _cmd;
        rdi = self;
        r13 = arg2
        r8 = ___stack_chk_guard;
        var_30 = *r8;
        r12 = rdi >> 0x4 & 0xf;
        if (r12 >= 0x8) {
                rbx = rdi >> 0x8;
                rcx = "eilotrm.apdnsIc ufkMShjTRxgC4013bDNvwyUL2O856P-B79AFKEWV_zGJ/HYX";
                rdx = r12;
                if (r12 < 0xa) {
                        do {
                                *(int8_t *)(rbp + rdx + 0xffffffffffffffbf) = *(int8_t *)((rbx & 0x3f) + rcx);
                                rdx = rdx - 0x1;
                                rbx = rbx >> 0x6;
                        } while (rdx != 0x0);
                }
                else {
                        do {
                                *(int8_t *)(rbp + rdx + 0xffffffffffffffbf) = *(int8_t *)((rbx & 0x1f) + rcx);
                                rdx = rdx - 0x1;
                                rbx = rbx >> 0x5;
                        } while (rdx != 0x0);
                }
        }
        if (r12 <= r13) {
                rbx = r8;
                ___CFExceptionProem(rdi, rsi);
                [NSException raise:@"NSRangeException" format:@"%@: Index %lu out of bounds; string length %lu"];
                r8 = rbx;
        }
        rax = *(int8_t *)(rbp + r13 + 0xffffffffffffffc0) & 0xff;
        if (*r8 != var_30) {
                rax = __stack_chk_fail();
        }
        return rax;
    }
```

我们稍微整理一下：前三行中，Hopper 让我们知道了寄存器分别存放了哪些参数。我们马上着手把 `rsi` 替换成 `_cmd`，然后把 `rdi` 替换成 `self`。`arg2` 实际上是 `index` 参数，因此我们把所有 `r13` 的调用替换成 `index`。接下来，由于 `__stack_chk` 其实是一个用来加强防御性的东西，且它与函数的实际作用没有多大关联，我们可以暂时忽略掉它。现在整理过后的代码看起来大概是这个样子的：

```objc
    unsigned short -[NSTaggedPointerString characterAtIndex:](void * self, void * _cmd, unsigned long long index) {
        r12 = self >> 0x4 & 0xf;
        if (r12 >= 0x8) {
                rbx = self >> 0x8;
                rcx = "eilotrm.apdnsIc ufkMShjTRxgC4013bDNvwyUL2O856P-B79AFKEWV_zGJ/HYX";
                rdx = r12;
                if (r12 < 0xa) {
                        do {
                                *(int8_t *)(rbp + rdx + 0xffffffffffffffbf) = *(int8_t *)((rbx & 0x3f) + rcx);
                                rdx = rdx - 0x1;
                                rbx = rbx >> 0x6;
                        } while (rdx != 0x0);
                }
                else {
                        do {
                                *(int8_t *)(rbp + rdx + 0xffffffffffffffbf) = *(int8_t *)((rbx & 0x1f) + rcx);
                                rdx = rdx - 0x1;
                                rbx = rbx >> 0x5;
                        } while (rdx != 0x0);
                }
        }
        if (r12 <= index) {
                rbx = r8;
                ___CFExceptionProem(self, _cmd);
                [NSException raise:@"NSRangeException" format:@"%@: Index %lu out of bounds; string length %lu"];
                r8 = rbx;
        }
        rax = *(int8_t *)(rbp + index + 0xffffffffffffffc0) & 0xff;
        return rax;
    }
```

注意第一个 `if` 语句之前的这行代码：

```objc
r12 = self >> 0x4 & 0xf
```

我们可以发现，这正是我们前面所看到的 `-length` 实现代码。既然如此，那我们就把 `r12` 全部替换成 `length`：

```objc
    unsigned short -[NSTaggedPointerString characterAtIndex:](void * self, void * _cmd, unsigned long long index) {
        length = self >> 0x4 & 0xf;
        if (length >= 0x8) {
                rbx = self >> 0x8;
                rcx = "eilotrm.apdnsIc ufkMShjTRxgC4013bDNvwyUL2O856P-B79AFKEWV_zGJ/HYX";
                rdx = length;
                if (length < 0xa) {
                        do {
                                *(int8_t *)(rbp + rdx + 0xffffffffffffffbf) = *(int8_t *)((rbx & 0x3f) + rcx);
                                rdx = rdx - 0x1;
                                rbx = rbx >> 0x6;
                        } while (rdx != 0x0);
                }
                else {
                        do {
                                *(int8_t *)(rbp + rdx + 0xffffffffffffffbf) = *(int8_t *)((rbx & 0x1f) + rcx);
                                rdx = rdx - 0x1;
                                rbx = rbx >> 0x5;
                        } while (rdx != 0x0);
                }
        }
        if (length <= index) {
                rbx = r8;
                ___CFExceptionProem(self, _cmd);
                [NSException raise:@"NSRangeException" format:@"%@: Index %lu out of bounds; string length %lu"];
                r8 = rbx;
        }
        rax = *(int8_t *)(rbp + index + 0xffffffffffffffc0) & 0xff;
        return rax;
    }
```

现在来看 `if` 语句内部的代码，第一行把 `self` 右移了 8 位。这 8 位是保存了 tagged pointer 的指示符以及字符串长度。而右移操作后得到的值，我们可以推测它就是其真正的数据。因此我们把 `rbx` 替换为 `stringData` 来让代码更加清晰可读一点。下一行把一个类似查找表的东西赋值给 `rcx`，因此我们也把 `rcx` 替换成 `table`。最后，`rdx` 拿到了值的长度的一份拷贝。看起来它后面会作为光标来使用，因此我们再把 `rdx` 替换为 `cursor`。现在我们的代码是这样的：

```objc
    unsigned short -[NSTaggedPointerString characterAtIndex:](void * self, void * _cmd, unsigned long long index) {
        length = self >> 0x4 & 0xf;
        if (length >= 0x8) {
                stringData = self >> 0x8;
                table = "eilotrm.apdnsIc ufkMShjTRxgC4013bDNvwyUL2O856P-B79AFKEWV_zGJ/HYX";
                cursor = length;
                if (length < 0xa) {
                        do {
                                *(int8_t *)(rbp + cursor + 0xffffffffffffffbf) = *(int8_t *)((stringData & 0x3f) + table);
                                cursor = cursor - 0x1;
                                stringData = stringData >> 0x6;
                        } while (cursor != 0x0);
                }
                else {
                        do {
                                *(int8_t *)(rbp + cursor + 0xffffffffffffffbf) = *(int8_t *)((stringData & 0x1f) + table);
                                cursor = cursor - 0x1;
                                stringData = stringData >> 0x5;
                        } while (cursor != 0x0);
                }
        }
        if (length <= index) {
                rbx = r8;
                ___CFExceptionProem(self, _cmd);
                [NSException raise:@"NSRangeException" format:@"%@: Index %lu out of bounds; string length %lu"];
                r8 = rbx;
        }
        rax = *(int8_t *)(rbp + index + 0xffffffffffffffc0) & 0xff;
        return rax;
    }
```

现在，代码基本上已经完全符号化了，不过还有一个寄存器名称仍然存在：`rbp`。它实际上是帧指针。因此，编译器其实做了一些很 tricky 的事情 —— 直接通过帧指针进行了索引操作。二进制补码中有一条原理： “所有东西最终都是无符号整型” ，因此为了让变量减去 65，我们可以将其与 `0xffffffffffffffbf` 常量相加。接下来，它又减去了 64（倒数第二行代码）。这两个值大概都是分配在栈上的局部变量。仔细看的话，你会发现这段代码非常奇怪 —— 有一条路径是只进行了读操作而没有进行任何的写操作。这到底是怎么回事呢？

原因其实是 Hopper 忘记了对另一个 if 条件判断的 `else` 分支进行反编译。相对应的汇编代码看起来是这样的：

```
mov        rax, rdi
shr        rax, 0x8
mov        qword [ss:rbp+var_40], rax
```

`var_40` 便是在 Hopper 反编译版本中的偏移量 `64`（`40` 刚好是 `64` 的十六进制表示）。我们暂且把这个位置的指针称为 `buffer`。这样一来，上面代码中遗漏分支的 C 语言代码看起来是这样的：

```c
*(uint64_t *)buffer = self >> 8
```

现在把这段代码插入原本的代码中，并替换掉其他位置的 `rbp` 为 `buffer`。最后，为了能提醒自己，我们在函数开始的位置再补上一行 `buffer` 的声明语句：

```objc
    unsigned short -[NSTaggedPointerString characterAtIndex:](void * self, void * _cmd, unsigned long long index) {
        int8_t buffer[11];
        length = self >> 0x4 & 0xf;
        if (length >= 0x8) {
                stringData = self >> 0x8;
                table = "eilotrm.apdnsIc ufkMShjTRxgC4013bDNvwyUL2O856P-B79AFKEWV_zGJ/HYX";
                cursor = length;
                if (length < 0xa) {
                        do {
                                *(int8_t *)(buffer + cursor - 1) = *(int8_t *)((stringData & 0x3f) + table);
                                cursor = cursor - 0x1;
                                stringData = stringData >> 0x6;
                        } while (cursor != 0x0);
                }
                else {
                        do {
                                *(int8_t *)(buffer + cursor - 1) = *(int8_t *)((stringData & 0x1f) + table);
                                cursor = cursor - 0x1;
                                stringData = stringData >> 0x5;
                        } while (cursor != 0x0);
                }
        } else {
            *(uint64_t *)buffer = self >> 8;
        }
        if (length <= index) {
                rbx = r8;
                ___CFExceptionProem(self, _cmd);
                [NSException raise:@"NSRangeException" format:@"%@: Index %lu out of bounds; string length %lu"];
                r8 = rbx;
        }
        rax = *(int8_t *)(buffer + index) & 0xff;
        return rax;
    }
```

现在代码看起来好了很多。不过那些疯狂的指针操作语句实在是太难看懂了，而它们仅仅是一些数组的索引操作。我们来简化一下：

```objc
   unsigned short -[NSTaggedPointerString characterAtIndex:](void * self, void * _cmd, unsigned long long index) {
        int8_t buffer[11];
        length = self >> 0x4 & 0xf;
        if (length >= 0x8) {
                stringData = self >> 0x8;
                table = "eilotrm.apdnsIc ufkMShjTRxgC4013bDNvwyUL2O856P-B79AFKEWV_zGJ/HYX";
                cursor = length;
                if (length < 0xa) {
                        do {
                                buffer[cursor - 1] = table[stringData & 0x3f];
                                cursor = cursor - 0x1;
                                stringData = stringData >> 0x6;
                        } while (cursor != 0x0);
                }
                else {
                        do {
                                buffer[cursor - 1] = table[stringData & 0x1f];
                                cursor = cursor - 0x1;
                                stringData = stringData >> 0x5;
                        } while (cursor != 0x0);
                }
        } else {
            *(uint64_t *)buffer = self >> 8;
        }
        if (length <= index) {
                rbx = r8;
                ___CFExceptionProem(self, _cmd);
                [NSException raise:@"NSRangeException" format:@"%@: Index %lu out of bounds; string length %lu"];
                r8 = rbx;
        }
        rax = buffer[index];
        return rax;
    }

```

现在，我们能看出些端倪了。

首先可以看到基于长度的不同，会有三种不同的情况。长度小于 8 的情况下，会执行到刚刚我们补充的遗漏分支 —— 单纯地把 `self` 的值按位移动后赋给 `buffer`。这是简单 ASCII 的情况。在此情况下，`index` 只作为 `self` 的索引值来取出给定字节，并随后返回给调用方。由于 ASCII 字符的值在指定范围内可以匹配 Unicode 码位。因此不需要额外的操作便可以返回正确结果。我们在上文曾猜测这种情况下（长度小于 8）会直接存放 ASCII 码，这也验证了我们的猜想。

那么在长度大于或等于 8 的情况下会怎么样呢？如果字符串长度等于 8 或大于 8 且小于 10，那么会执行一段循环代码：首先取出 `stringData` 的最低 6 位，然后作为 `table` 的索引并取出相应的值，再拷贝到 `buffer` 中。接下来，会把 `stringData` 右移 6 位然后重复上面的操作直到遍历完整个字符串。这段代码其实是一种 6 位编码方式 —— 通过原始 6 位数据在 `table` 中的索引进行编码。`buffer` 中会构建出一个临时的字符串，然后最后的索引操作（上面函数中倒数第二行）会取出其需要的字符。

当如果长度大于 10 呢？可以看到其代码和长度在 8 到 10 的情况下基本一致，除了现在一次只处理 5 位而不是 6 位数据。这是一种更加紧凑的编码方式，可以让 tagged pointer 字符串最多能够保存 11 个字符，不过它使用的字母表仅包含 32 个值（仅使用了 `table` 的前半部分）。

因此，我们可以得到 tagged pointer 字符串的结构大致为：

1. 长度在 0 到 7 范围内时，直接保存原始的 8 位字符。
2. 长度为 8 或者 9时， 保存 6 位编码后的字符，编码使用的字母表为 `"eilotrm.apdnsIc ufkMShjTRxgC4013bDNvwyUL2O856P-B79AFKEWV_zGJ/HYX"`。 
3. 长度大于 10 时，保存 5 位编码后的字符，编码使用的字母表为 `"eilotrm.apdnsIc ufkMShjTRxgC4013"`。 

现在我们来对比一下前面生成的数据：

```
0x0000000000006115 a NSTaggedPointerString
0x0000000000626125 ab NSTaggedPointerString
0x0000000063626135 abc NSTaggedPointerString
0x0000006463626145 abcd NSTaggedPointerString
0x0000656463626155 abcde NSTaggedPointerString
0x0066656463626165 abcdef NSTaggedPointerString
0x6766656463626175 abcdefg NSTaggedPointerString
0x0022038a01169585 abcdefgh NSTaggedPointerString
0x0880e28045a54195 abcdefghi NSTaggedPointerString
0x00007fbad9512010 abcdefghij __NSCFString
```

`0x0022038a01169585` 的二进制表达式去掉了字符串后面的 8 位，并把剩余的位分成了 6 位为单位的块：

```
001000 100000 001110 001010 000000 010001 011010 010101
```

以这些数值作为 `table` 的索引，我们的确可以拼出 `"abcdefgh"`。同样的，`0x0880e28045a54195` 的二进制表达式也有类似的规则：

```
001000 100000 001110 001010 000000 010001 011010 010101 000001
```

可以看到它与上面的字符串基本一致，只是在最后多出了字符 `i`。

但是后面的字符串却不符合我们的预测。在这之后，按理来说本应会切换为 5 位编码方式进行存储，且在两个字符串之后才会终止。但事实却是，在长度等于 10 的时候 tagged pointer 字符串就已经停止了工作，并转为创建真正的字符串对象，为什么会这样？

原因是 5 位编码方式中使用的字母表过于受限，因此没有包含字母 `b`！相对于 5 位编码方式使用的字母表中 32 个 “神圣” 的字符而言，`b` 这个字母的普遍程度肯定还不够，以至于未能取得其中的一席之地。既然如此，我们换成从 `c` 开始的字符串再尝试一次，打印结果如下：

```
0x0000000000006315 c NSTaggedPointerString
0x0000000000646325 cd NSTaggedPointerString
0x0000000065646335 cde NSTaggedPointerString
0x0000006665646345 cdef NSTaggedPointerString
0x0000676665646355 cdefg NSTaggedPointerString
0x0068676665646365 cdefgh NSTaggedPointerString
0x6968676665646375 cdefghi NSTaggedPointerString
0x0038a01169505685 cdefghij NSTaggedPointerString
0x0e28045a54159295 cdefghijk NSTaggedPointerString
0x01ca047550da42a5 cdefghijkl NSTaggedPointerString
0x39408eaa1b4846b5 cdefghijklm NSTaggedPointerString
0x00007fbd6a511760 cdefghijklmn __NSCFString
```

现在，我们获得了一直到长度为 11 的所有 tagged pointer 字符串。最后两个 tagged pointer 字符串的二进制表示如下：

```
01110 01010 00000 10001 11010 10101 00001 10110 10010 00010
01110 01010 00000 10001 11010 10101 00001 10110 10010 00010 00110
```

正是我们预期的 5 位编码。


## 构造 Tagged Pointer 字符串

既然我们现在知道了 tagged pointer 字符串是如何编码的，那么我就不再深入地探究其构造方法的实现了。构造的代码在一个名为 `__CFStringCreateImmutableFunnel3` 的私有函数内。这个巨大的函数包含了所有可能的情况。你可以在 [opensource.apple.com](https://opensource.apple.com) 中提供的 CoreFoundation 开源版本中找到此函数，不过别高兴太早：开源版本并没有包含关于 tagged pointer 字符串的代码实现。

构造 tagged pointer 字符串的代码实际上是我们上面看到的代码的相反版本。如果 tagged pointer 字符串能够容下原始字符串的长度和内容，那么就会开始一点一点地构造 —— 包含 ASCII 字符、6 位或者 5 位编码的字符。其中会有一个相反的查找表。上文代码中看到的字符常量的查找表是一个名为 `sixBitToCharLookup` 的全局变量，在 `Funnel3` 函数中有一个与之相对应的 `sixBitToCharLookup` 变量。


## 奇怪的查找表

完整的 6 位编码查找表如下：

```
eilotrm.apdnsIc ufkMShjTRxgC4013bDNvwyUL2O856P-B79AFKEWV_zGJ/HYX
```

可能大家都会很自然地问一个问题：为什么它的顺序如此奇怪？

因为这个表同时提供给 6 位编码和 5 位编码使用，这就是为什么它和普通的英语字母表有同样的顺序。那些使用频率非常高的字符位于表的前半段，而那些使用频率没那么高的字符串就会放在后半段。这在最大程度上保证了稍长的字符串能够使用 5 位编码。

虽然如此，假如我们把查找表对半分，每一半中的顺序仿佛显得无关紧要。对半分后的表按理来说可以按照英语字母表的顺序进行排序，但事实却并非如此。

查找表开头位置的几个字母似乎是按照其在英语中出现的频率排序的。英语中最常见的字母是 E，其实是 T，接下来依次为 A、O、I、N 和 S。E 确实位于表的开头，且剩下的几个字母也的确都位于靠近开头的位置。看起来这张查找表的确是按照使用频率进行排序的。至于其为什么体现出和英语的差异性，大概是因为在 Cocoa 应用中的短字符串并不是随机选自英文散文，而是一些较为特别的语言。

我猜测苹果原本打算使用一种更为巧妙的变长编码方式，或许会基于一种 [Huffman 编码](https://en.wikipedia.org/wiki/Huffman_coding)。但最后发现其实现难度太大，或者性价比并没有想象中高，甚至是因为时间不允许的原因。因此他们决定退而求其次，使用一种更容易实现的版本，也就是我们上文中所看到的编码方式 —— 针对不同长度的字符串使用不同的定长编码方式（每个字符 8 位、6 位或 5 位）。这个奇怪的查找表也许是基于被遗弃的变长编码方式而构建的，同时也便于日后决定再次启用变长编码方式。虽然这些纯属猜测，但至少我感觉事实便是如此。

## 总结

Tagged pointer 是一种非常酷的技术。虽然应用到字符串上面并不常见，但很清楚的是，苹果肯定从中受益良多，不然也不会对它倾注如此多精力和想法。能够看到这两种技术融合在一起的效果，以及它们如何对有限的存储空间物尽其用，实在是有趣至极。
