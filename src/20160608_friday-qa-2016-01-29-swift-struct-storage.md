title: "Friday Q&A 2016-01-29: Swift 的结构体存储"
date: 2015-06-08
tags: [Swift 进阶]
categories: [Mike Ash]
permalink: friday-qa-2016-01-29-swift-struct-storage
keywords: swift结构体
custom_title: 
description: Swift 结构体存储在哪里你知道吗，本文就来说下 Swift 结构体的工作原理。

---
原文链接=https://www.mikeash.com/pyblog/friday-qa-2016-01-29-swift-struct-storage.html
作者=Mike Ash
原文日期=2016-01-29
译者=ray16897188
校对=Channe
定稿=千叶知风

<!--此处开始正文-->

Swift 的类对大多数刚接触编程语言的人来说是很容易理解的，它们和其他语言中的类十分类似。无论你是从 Objective-C、Java 还是 Ruby 过来的，在 Swift 中对于类的使用并无太大区别。而 Swift 中的结构体就是另外一回事儿了，它们有点儿像类，但是它们是值类型，还没有继承，另外我总是听到这个什么 copy-on-write（写入时复制）的说法。那么 Swift 中的结构体是存在哪里？它们是怎么个工作原理？今天我们来仔细研究一下如何在内存中保存和操作结构体。

<!--more-->

#### 简单的结构体
我建了一个有两个文件的程序来探究一下结构体在内存中是怎样存储的。对这个测试程序采用 optimizations enabled 选项编译，并取消 whole-module optimization 选项。此测试是让一个文件调用一个文件，这就会防止编译器将所有东西都内联，从而让我们能更清楚的看明白东西都存在哪儿，以及数据在函数间如何传递。

从创建一个三个元素的结构体开始：

```Swift
    struct ExampleInts {
        var x: Int
        var y: Int
        var z: Int
    }
```

又写了三个函数，都是各自接收一个结构体的实例，然后分别返回该实例的一个字段（field）：

```swift
func getX(parameter: ExampleInts) -> Int {
        return parameter.x
    }

func getY(parameter: ExampleInts) -> Int {
        return parameter.y
    }

func getZ(parameter: ExampleInts) -> Int {
        return parameter.z
    }
```

在另一个文件中创建了一个结构体实例，然后调用所有的 get 函数：

```swift
    func testGets() {
        let s = ExampleInts(x: 1, y: 2, z: 3)
        getX(s)
        getY(s)
        getZ(s)
    }
```

针对 getX，编译器生成了如下代码：

```
    pushq   %rbp
    movq    %rsp, %rbp

    movq    %rdi, %rax

    popq    %rbp
    retq
```

查看一下汇编的[备忘单](https://en.wikipedia.org/wiki/X86_calling_conventions#System_V_AMD64_ABI)，知道参数是按顺序被传进寄存器 rdi、rsi、rdx、rcx、r8 和 r9 中，然后返回值被存放在 rax 中。这里前两个指令只是函数序言（function prologue），而后两个是函数尾声（function epilogue）。真正做的工作就是 `movq %rdi, %rax`：提取第一个参数并将其返回。再看一下 getY：

```
    pushq   %rbp
    movq    %rsp, %rbp

    movq    %rsi, %rax

    popq    %rbp
    retq
```

基本一样，只不过它返回的是第二个参数。那 getZ 呢？

```
    pushq   %rbp
    movq    %rsp, %rbp

    movq    %rdx, %rax

    popq    %rbp
    retq
```

还是，基本都一样，但返回的是第三个参数。从这我们可以看出来每个单独的结构体元素都是被看做独立的参数，被单独的传递进函数中。在接收端挑出某个元素，仅仅就是选择它所在的相应的寄存器。

在调用点验证一下。下面是 testGets 的编译器生成码：

```
    pushq   %rbp
    movq    %rsp, %rbp

    movl    $1, %edi
    movl    $2, %esi
    movl    $3, %edx
    callq   __TF4main4getXFVS_11ExampleIntsSi

    movl    $1, %edi
    movl    $2, %esi
    movl    $3, %edx
    callq   __TF4main4getYFVS_11ExampleIntsSi

    movl    $1, %edi
    movl    $2, %esi
    movl    $3, %edx
    popq    %rbp
    jmp __TF4main4getZFVS_11ExampleIntsSi
```

可以看出这个结构体实例的是直接在组建于参数寄存器上的。（edi、esi 和 edx 寄存器分别是 rdi、rsi 和 rdx 对应的低 32 bit 带宽版本。）这样甚至不用在调用途中操心值的额外存储，只需每次调用时重建这个结构体的实例就好了。因为编译器明确的知道寄存器中的内容，这就可以大大的改变 Swift 的代码编写方式。注意到对 getZ 的调用和对 getX、getY 的调用有些许不同：由于它是该函数中的最后一部分，编译器以尾调用（tail call）的形式将其生成，清空本地调用栈帧（local call frame），然后让 getZ 直接返回到 testGets 函数被调用的地方。

再让我们看一下当编译器不知道结构体的内容时会生成怎样的代码。下面是这个 test 函数的变体，从其他的地方获得结构体的实例：

```swift
    func testGets2() {
        let s = getExampleInts()
        getX(s)
        getY(s)
        getZ(s)
    }
```

getExampleInts 创建了一个结构体实例然后将其返回，但这个函数是在另一个文件中，所以优化 testGets2 的时候编译器是不知道发生了什么情况的。函数如下：

```swift
    func getExampleInts() -> ExampleInts {
        return ExampleInts(x: 1, y: 2, z: 3)
    }
```

当编译器不知道结构体的内容时 testGets2 会生成怎样的代码呢？

```
    pushq   %rbp
    movq    %rsp, %rbp

    pushq   %r15
    pushq   %r14
    pushq   %rbx
    pushq   %rax

    callq   __TF4main14getExampleIntsFT_VS_11ExampleInts
    movq    %rax, %rbx
    movq    %rdx, %r14
    movq    %rcx, %r15

    movq    %rbx, %rdi
    movq    %r14, %rsi
    movq    %r15, %rdx
    callq   __TF4main4getXFVS_11ExampleIntsSi

    movq    %rbx, %rdi
    movq    %r14, %rsi
    movq    %r15, %rdx
    callq   __TF4main4getYFVS_11ExampleIntsSi

    movq    %rbx, %rdi
    movq    %r14, %rsi
    movq    %r15, %rdx

    addq    $8, %rsp
    popq    %rbx
    popq    %r14
    popq    %r15
    popq    %rbp
    jmp __TF4main4getZFVS_11ExampleIntsSi
```

由于编译器不能在每个阶段都直接将相应的值重现，它就得把这些值存起来。结构体的三个元素被放到 rbx、r14 和 r15 寄存器中，并在每次调用时从这些寄存器里将值加载到参数寄存器中。调用者会保存这三个寄存器，就是说在调用过程中它们存的值会被持有。然后和之前一样，编译器也对 getZ 生成了尾调用，以及一些更昂贵的预先清理。

函数的开始部分调用了 getExampleInts 并从 rax、rdx 和 rcx 中加载了其中的值。显然结构体的值是从这些寄存器里返回的，看看 getExampleInts 函数来确认下：

```
    pushq   %rbp
    movl    $1, %edi
    movl    $2, %esi
    movl    $3, %edx
    popq    %rbp
    jmp __TFV4main11ExampleIntsCfMS0_FT1xSi1ySi1zSi_S0_
```

这代码把值 1、2 和 3 放进参数寄存器中，然后调用结构体的构造器。下面是构造器的生成码：

```
    pushq   %rbp
    movq    %rsp, %rbp

    movq    %rdx, %rcx
    movq    %rdi, %rax
    movq    %rsi, %rdx

    popq    %rbp
    retq
```

够清楚了，它向 rax、rdx 和 rcx 中返回三个值。[备忘单](https://en.wikipedia.org/wiki/X86_calling_conventions#System_V_AMD64_ABI)并未提及往多个寄存器中返回多个值。那[官方的PDF呢](http://x86-64.org/documentation/abi.pdf)？里面说到了可以往 rax 和 rdx 中返回两个值，却没说可以给 rcx 返回第三个值。而上面的代码还是很明确的。新语言有趣的地方就在这儿，它不一定非按老规矩来。要是和C语言联调就得按传统规范，但是 Swift 和 Swift 之间的调用就可以玩新路子了。

那 inout 参数呢？如果它是像我们在 C 中所熟悉的那样，结构体就会被安置在内存中，然后传过去一个指针。下面是两个 test 函数（当然是在两个不同文件里的）：

```swift
    func testInout() {
        var s = getExampleInts()
        totalInout(&s)
    }

    func totalInout(inout parameter: ExampleInts) -> Int {
        return parameter.x + parameter.y + parameter.z
    }
```

下面是 testInout 的生成码：

```
    pushq   %rbp
    movq    %rsp, %rbp
    subq    $32, %rsp

    callq   __TF4main14getExampleIntsFT_VS_11ExampleInts

    movq    %rax, -24(%rbp)
    movq    %rdx, -16(%rbp)
    movq    %rcx, -8(%rbp)
    leaq    -24(%rbp), %rdi
    callq   __TF4main10totalInoutFRVS_11ExampleIntsSi

    addq    $32, %rsp
    popq    %rbp
    retq
```

函数序言中先创建了一个 32 字节的堆栈帧，再调用 getExampleInts，而后的调用把结果的值分别存在偏移量为 -24、-16 和 -8 的栈槽（stack slots）中。随即计算出指向偏移为 -24 的指针，将其加载到 rdi 参数寄存器中后调用 totalInout。下面是这个函数的生成码：

```
    pushq   %rbp
    movq    %rsp, %rbp
    movq    (%rdi), %rax
    addq    8(%rdi), %rax
    jo  LBB4_3
    addq    16(%rdi), %rax
    jo  LBB4_3
    popq    %rbp
    retq
    LBB4_3:
    ud2
```

以上是从传递进来的参数加载偏移量所对应的值，合并之后将结果返回到 rax 中。jo 指令做溢出检查。如果有任一 addq 指令引起溢出，jo 指令会跳转到 ud2 指令，将程序终结。

可以看出这正是我们所想的那样：把一个结构体传递给一个 inout 参数时，该结构体被置进连续的内存中，随后得到一个指向该内存的地址。

#### 大结构体
如果我们处理的是一些更大的结构体，大到寄存器不再适合了的话会怎样呢？下面是一个有十个元素的结构体：

```swift
    struct TenInts {
        var elements = (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
    }
```

而这面是一个 get 函数，创建一该结构体的实例并将其返回。为防止内联它被放在另一个文件中：

```swift
    func getHuge() -> TenInts {
        return TenInts()
    }
```

一个获取该结构体中单个元素的函数：

```swift
    func getHugeElement(parameter: TenInts) -> Int {
        return parameter.elements.5
    }
```

最后是一个 test 函数：

```swift
    func testHuge() {
        let s = getHuge()
        getHugeElement(s)
    }
```

看下生成码，从 testHuge 开始：

```
    pushq   %rbp
    movq    %rsp, %rbp
    subq    $160, %rsp

    leaq    -80(%rbp), %rdi
    callq   __TF4main7getHugeFT_VS_7TenInts

    movups  -80(%rbp), %xmm0
    movups  -64(%rbp), %xmm1
    movups  -48(%rbp), %xmm2
    movups  -32(%rbp), %xmm3
    movups  -16(%rbp), %xmm4
    movups  %xmm0, -160(%rbp)
    movups  %xmm1, -144(%rbp)
    movups  %xmm2, -128(%rbp)
    movups  %xmm3, -112(%rbp)
    movups  %xmm4, -96(%rbp)

    leaq    -160(%rbp), %rdi
    callq   __TF4main14getHugeElementFVS_7TenIntsSi

    addq    $160, %rsp
    popq    %rbp
    retq
```

这段代码（除去函数序言和尾声）可以分成三部分。

第一部分计算出对这个堆栈帧有 -80 偏移量的地址，然后调用 getHuge，把计算出的地址传参给它。getHuge 函数在源代码里没有任何参数，但是用一个隐式参数返回较大的结构体并不罕见。调用处为返回值分配储存空间，而后给把一个指向该分配好的空间的指针传给隐藏参数。栈中的这块已分配空间告诉我们基本就是这样的。

第二部分将栈偏移-80的地方结构体复制到 -160 的地方。它将这个结构体加载到五个 xmm 寄存器中，每次加载十六字节的片段，然后把寄存器的内容放回到从 -160 开始的地方。我不大清楚为什么编译器要弄一个拷贝而不是直接用原始值。我怀疑优化器可能还是不够聪明，意识不到它根本就不需要用到拷贝。

第三部分计算出栈偏移 -160 的地址，然后调用 getHugeElement，传参给它计算出的地址。之前的三个元素的试验中传递的是寄存器中的值，而对于这个更大的结构体，传递的是指针。

其他函数的生成码确认了这点：结构体是以指针形式传进传出的，并存活在栈中。从 getHugeElement 开始：

```
    pushq   %rbp
    movq    %rsp, %rbp
    movq    40(%rdi), %rax
    popq    %rbp
    retq
```

加载了离传入参数 40 个偏移量的内容。每个元素为 8 字节，偏移量是 40 就是第 5 个元素，该函数返回这个值。

getHuge 函数：

```
    pushq   %rbp
    movq    %rsp, %rbp
    pushq   %rbx
    subq    $88, %rsp

    movq    %rdi, %rbx
    leaq    -88(%rbp), %rdi
    callq   __TFV4main7TenIntsCfMS0_FT_S0_

    movups  -88(%rbp), %xmm0
    movups  -72(%rbp), %xmm1
    movups  -56(%rbp), %xmm2
    movups  -40(%rbp), %xmm3
    movups  -24(%rbp), %xmm4
    movups  %xmm0, (%rbx)
    movups  %xmm1, 16(%rbx)
    movups  %xmm2, 32(%rbx)
    movups  %xmm3, 48(%rbx)
    movups  %xmm4, 64(%rbx)
    movq    %rbx, %rax

    addq    $88, %rsp
    popq    %rbx
    popq    %rbp
    retq
```

和上面的 testHuge 很像：分配栈空间，调用一个函数，这回是 TenInts 构造器函数，然后把返回值复制到它最终的地方：隐式参数传进来的指针所指向的地址。

都说到这儿了，看一下 TenInts 构造器吧：

```
    pushq   %rbp
    movq    %rsp, %rbp

    movq    $1, (%rdi)
    movq    $2, 8(%rdi)
    movq    $3, 16(%rdi)
    movq    $4, 24(%rdi)
    movq    $5, 32(%rdi)
    movq    $6, 40(%rdi)
    movq    $7, 48(%rdi)
    movq    $8, 56(%rdi)
    movq    $9, 64(%rdi)
    movq    $10, 72(%rdi)
    movq    %rdi, %rax

    popq    %rbp
    retq
```

类似于另一个函数，它也是用了一个指向新结构体的隐式指针作为参数，然后把从 1 到 10 这些值存储好，再返回。

创建这些test案例时我遇到过一个有意思的地方。这是一个 test 函数，调用了三次 getHugeElement：

```swift
    func testThreeHuge() {
        let s = getHuge()
        getHugeElement(s)
        getHugeElement(s)
        getHugeElement(s)
    }
```

其生成码如下：

```
    pushq   %rbp
    movq    %rsp, %rbp
    pushq   %r15
    pushq   %r14
    pushq   %r13
    pushq   %r12
    pushq   %rbx
    subq    $392, %rsp

    leaq    -120(%rbp), %rdi
    callq   __TF4main7getHugeFT_VS_7TenInts
    movq    -120(%rbp), %rbx
    movq    %rbx, -376(%rbp)
    movq    -112(%rbp), %r8
    movq    %r8, -384(%rbp)
    movq    -104(%rbp), %r9
    movq    %r9, -392(%rbp)
    movq    -96(%rbp), %r10
    movq    %r10, -400(%rbp)
    movq    -88(%rbp), %r11
    movq    %r11, -368(%rbp)
    movq    -80(%rbp), %rax
    movq    -72(%rbp), %rcx
    movq    %rcx, -408(%rbp)
    movq    -64(%rbp), %rdx
    movq    %rdx, -416(%rbp)
    movq    -56(%rbp), %rsi
    movq    %rsi, -424(%rbp)
    movq    -48(%rbp), %rdi

    movq    %rdi, -432(%rbp)
    movq    %rbx, -200(%rbp)
    movq    %rbx, %r14
    movq    %r8, -192(%rbp)
    movq    %r8, %r15
    movq    %r9, -184(%rbp)
    movq    %r9, %r12
    movq    %r10, -176(%rbp)
    movq    %r10, %r13
    movq    %r11, -168(%rbp)
    movq    %rax, -160(%rbp)
    movq    %rax, %rbx
    movq    %rcx, -152(%rbp)
    movq    %rdx, -144(%rbp)
    movq    %rsi, -136(%rbp)
    movq    %rdi, -128(%rbp)
    leaq    -200(%rbp), %rdi
    callq   __TF4main14getHugeElementFVS_7TenIntsSi

    movq    %r14, -280(%rbp)
    movq    %r15, -272(%rbp)
    movq    %r12, -264(%rbp)
    movq    %r13, -256(%rbp)
    movq    -368(%rbp), %rax
    movq    %rax, -248(%rbp)
    movq    %rbx, -240(%rbp)
    movq    -408(%rbp), %r14
    movq    %r14, -232(%rbp)
    movq    -416(%rbp), %r15
    movq    %r15, -224(%rbp)
    movq    -424(%rbp), %r12
    movq    %r12, -216(%rbp)
    movq    -432(%rbp), %r13
    movq    %r13, -208(%rbp)
    leaq    -280(%rbp), %rdi
    callq   __TF4main14getHugeElementFVS_7TenIntsSi

    movq    -376(%rbp), %rax
    movq    %rax, -360(%rbp)
    movq    -384(%rbp), %rax
    movq    %rax, -352(%rbp)
    movq    -392(%rbp), %rax
    movq    %rax, -344(%rbp)
    movq    -400(%rbp), %rax
    movq    %rax, -336(%rbp)
    movq    -368(%rbp), %rax
    movq    %rax, -328(%rbp)
    movq    %rbx, -320(%rbp)
    movq    %r14, -312(%rbp)
    movq    %r15, -304(%rbp)
    movq    %r12, -296(%rbp)
    movq    %r13, -288(%rbp)
    leaq    -360(%rbp), %rdi
    callq   __TF4main14getHugeElementFVS_7TenIntsSi

    addq    $392, %rsp
    popq    %rbx
    popq    %r12
    popq    %r13
    popq    %r14
    popq    %r15
    popq    %rbp
    retq
```

此函数的结构和前面的那个版本类似，调用 getHuge，复制结果，然后调用三次 getHugeElement。每次的调用都再次的复制该结构体，猜测是为了防止 getHugeElement 发生变动。发现真正有意思的是这些都是使用整型寄存器、每次只复制一个元素，而不是像 testHuge 函数那样每次往 xmm 寄存器中复制两个元素。我不确定是什么导致编译器在这里选择了整型寄存器，看起来用 xmm 寄存器一次复制两个元素是更有效率的，生成码也更简洁。

我还试验了非常大的结构体：

```swift
    struct HundredInts {
        var elements = (TenInts(), TenInts(), TenInts(), TenInts(), TenInts(), TenInts(), TenInts(), TenInts(), TenInts(), TenInts())
    }

    struct ThousandInts {
        var elements = (HundredInts(), HundredInts(), HundredInts(), HundredInts(), HundredInts(), HundredInts(), HundredInts(), HundredInts(), HundredInts(), HundredInts())
    }

    func getThousandInts() -> ThousandInts {
        return ThousandInts()
    }
```

getThousandInts 的生成码相当的疯狂：

```
    pushq   %rbp
    pushq   %rbx
    subq    $8008, %rsp

    movq    %rdi, %rbx
    leaq    -8008(%rbp), %rdi
    callq   __TFV4main12ThousandIntsCfMS0_FT_S0_
    movq    -8008(%rbp), %rax
    movq    %rax, (%rbx)
    movq    -8000(%rbp), %rax
    movq    %rax, 8(%rbx)
    movq    -7992(%rbp), %rax
    movq    %rax, 16(%rbx)
    movq    -7984(%rbp), %rax
    movq    %rax, 24(%rbx)
    movq    -7976(%rbp), %rax
    movq    %rax, 32(%rbx)
    movq    -7968(%rbp), %rax
    movq    %rax, 40(%rbx)
    movq    -7960(%rbp), %rax
    movq    %rax, 48(%rbx)
    movq    -7952(%rbp), %rax
    movq    %rax, 56(%rbx)
    movq    -7944(%rbp), %rax
    movq    %rax, 64(%rbx)
    movq    -7936(%rbp), %rax
    movq    %rax, 72(%rbx)
    ...
    movq    -104(%rbp), %rax
    movq    %rax, 7904(%rbx)
    movq    -96(%rbp), %rax
    movq    %rax, 7912(%rbx)
    movq    -88(%rbp), %rax
    movups  -80(%rbp), %xmm0
    movups  -64(%rbp), %xmm1
    movups  -48(%rbp), %xmm2
    movups  -32(%rbp), %xmm3
    movq    %rax, 7920(%rbx)
    movq    -16(%rbp), %rax
    movups  %xmm0, 7928(%rbx)
    movups  %xmm1, 7944(%rbx)
    movups  %xmm2, 7960(%rbx)
    movups  %xmm3, 7976(%rbx)
    movq    %rax, 7992(%rbx)
    movq    %rbx, %rax

    addq    $8008, %rsp
    popq    %rbx
    popq    %rbp
    retq
```

编译器为复制这个结构体生成了两千多条指令。这种情况下貌似调用 memcpy 函数非常合适，而我觉得为这种大的出奇的结构体做优化应该不是编译器团队现在的首要目标。

#### 类字段（Class Fields）
我们来看看当结构体的字段（struct fields）比整形复杂的多的情况下会发生什么。下面有个简单的类，然后包含了一个结构体：

```swift
    class ExampleClass {}
    struct ContainsClass {
        var x: Int
        var y: ExampleClass
        var z: Int
    }
```

这里是一堆试验的函数（分在两个不同文件中防止内联）：

```swift
    func testContainsClass() {
        let s = ContainsClass(x: 1, y: getExampleClass(), z: 3)
        getClassX(s)
        getClassY(s)
        getClassZ(s)
    }

    func getExampleClass() -> ExampleClass {
        return ExampleClass()
    }

    func getClassX(parameter: ContainsClass) -> Int {
        return parameter.x
    }

    func getClassY(parameter: ContainsClass) -> ExampleClass {
        return parameter.y
    }

    func getClassZ(parameter: ContainsClass) -> Int {
        return parameter.z
    }
```

从 getters 的生成码看起，首先是 getClassX：

```
    pushq   %rbp
    movq    %rsp, %rbp
    pushq   %rbx
    pushq   %rax

    movq    %rdi, %rbx
    movq    %rsi, %rdi
    callq   _swift_release
    movq    %rbx, %rax

    addq    $8, %rsp
    popq    %rbx
    popq    %rbp
    retq
```

三个结构体元素会被传递进前三个参数寄存器中，rdi、rsi 和 rdx。该函数想通过把 rdi 中的值移动到 rax 中再返回，但得先记录一下才行。看上去似乎是传入 rsi 的对象引用被持有了，在函数返回之前是必须被释放掉的。这段生成码把 rdi 搬进了一个安全的临时寄存器 rbx，然后将对象引用移动到 rdi，再调用 swift_release 将其释放。随后把 rbx 中的值移动到 rax 中，再从函数中返回。

getClassZ 也很类似，除了它是从 rdx，而不是 rdi 中获取值的：

```
    pushq   %rbp
    movq    %rsp, %rbp
    pushq   %rbx
    pushq   %rax

    movq    %rdx, %rbx
    movq    %rsi, %rdi
    callq   _swift_release
    movq    %rbx, %rax

    addq    $8, %rsp
    popq    %rbx
    popq    %rbp
    retq
```

getClassY 的生成码会是特殊的一个，因为它返回的是对象的引用而非一个整型：

```
    pushq   %rbp
    movq    %rsp, %rbp
    movq    %rsi, %rax
    popq    %rbp
    retq
```

十分简短！它从 rsi 中取值，该值为对象引用，然后放进 rax 再将其返回。这里就不需要记录，仅仅是数据的拖拽。显然值传进来的时候被持有，被返回的时候也被持有，所以这段代码是无需任何内存管理的。

到目前为止我们看到的对这个结构体的处理和前面的对那个有三个整型元素的结构体的处理没有太大区别，除了对象引用字段传递进来是被持有的，必须要由被调用者做释放处理。记着这一点，我们来看下 testContainsClass 的生成码：

```
    pushq   %rbp
    movq    %rsp, %rbp
    pushq   %r14
    pushq   %rbx

    callq   __TF4main15getExampleClassFT_CS_12ExampleClass
    movq    %rax, %rbx

    movq    %rbx, %rdi
    callq   _swift_retain
    movq    %rax, %r14
    movl    $1, %edi
    movl    $3, %edx
    movq    %rbx, %rsi
    callq   __TF4main9getClassXFVS_13ContainsClassSi

    movq    %r14, %rdi
    callq   _swift_retain
    movl    $1, %edi
    movl    $3, %edx
    movq    %rbx, %rsi
    callq   __TF4main9getClassYFVS_13ContainsClassCS_12ExampleClass
    movq    %rax, %rdi
    callq   _swift_release

    movl    $1, %edi
    movl    $3, %edx
    movq    %rbx, %rsi

    popq    %rbx
    popq    %r14
    popq    %rbp
    jmp __TF4main9getClassZFVS_13ContainsClassSi
```

这个函数做的第一件事就是调用 getExampleClass 来获得结构体中存储的 ExampleClass 实例，它得到返回的引用之后将其移动到 rbx 中以安全保留。

接下来调用了 getClassX，为此它得在参数寄存器中建立一个该结构体的拷贝。两个整型的字段是很容易的，而对象的字段就需要按照函数所期的那样被持有。这段代码对 rbx 中所存的值调用了 swift_retain，然后将其放入 rsi，再把 1 和 3 分别放入 rdi 和 rdx 中，构建出完整的结构体。最后，它调用了 getClassX。

调用 getClassY 也基本一样，然而 getClassY 返回的是一个需要被释放的对象，在调用之后这段代码将返回值移动至 rdi 中，调用 swift_release 来实线所要求的内存管理。

函数调用 getClassZ 作为其尾调用，所以这里的生成代码有些许不同。从 getExampleClass 得来的对象引用已被持有，所以它不需要为这个最后的调用而再被单独持有。代码将其放进 rsi 里，再把 1 和 3 分别放进 rdi 和 rdx 里，然后做清空栈，跳转到 getClassZ 做最后的调用。 
 
基本上说，与全是整型的那个结构体相比几乎没有变化。唯一的实质的不同就是复制一个带有对象的结构体时需要持有这个对象，销毁这个结构体时也需要释放掉这个对象。

#### 结论
Swift 中的结构体存储根本上讲还是比较简单，我们看到的这些也是从C语言中非常简单的结构体中延续过来的。一个结构体实例在很大程度上可以看做是一些独立值的松散集合，需要时这些值可以作为整体被操作。本地的结构体变量可能会被存储到栈中，其中的每个元素可能会被存到寄存器里，这取决于结构体的大小、寄存器对余下代码的利用以及编译器临时冒出的什么点子。小的结构体在寄存器中传递和返回，大的结构体通过引用传递和返回。结构体在传递和返回时会被复制，尽管你可以用结构体来实现写入时复制（copy-on-write）的数据类型，但是基本的语言框架还是会被复制，而且在选择复制的数据时多多少少有些盲目。

今天就到这儿吧。欢迎再回来阅读更多的精彩编程技术。Friday Q&A 是由读者想法驱动的，所以如果你等不及下一期，还有一些希望看到的讨论话题，就[发邮件过来吧](mike@mikeash.com)！

> 觉得这篇文章怎么样？我在买一本书，里面全是这样的文章。在 iBooks 上和 Kindle 上有售，加上一个可以直接下载的PDF和ePub格式。还有传统的纸质版本。[点击这里查看更多信息](https://www.mikeash.com/book.html)