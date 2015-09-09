title: "如何在 Swift 中使用 CommonCrypto 类进行加密(I)"
date: 2015-09-06 20:00:00
tags: [Swift]
categories: [digitalleaves]
permalink: commoncrypto-in-swift

---
原文链接=http://digitalleaves.com/blog/2015/08/commoncrypto-in-swift
作者=Ignacio Nieto Carvajal
原文日期=2015/08/10
译者=CMB
校对=numbbbbb
定稿=shanks


![](/img/articles/commoncrypto-in-swift/34909577.jpg)

现在，许多开发者已经不需要在 App 中进行加密处理。即使你在远程服务器上使用了 REST API，通常情况下使用 HTTPS 就可以解决大多数的安全通信问题，剩下的问题可以使用苹果提供的“保护模式”和硬件/软件加密组合方式来解决。然而在很多情况下，你还是需要对通信或文件进行加密。也许你正在把一个现有的涉及到文件/信息加密的方案移植到 iOS 上，也许你在制作一个保密性要求极高的App，或者你只是想提高数据的安全级别（这是一件好事）。

<!--more-->

无论是哪种情况，（在iOS和OS X系统中）Cocoa 都选择`CommonCrypto`来完成任务。然而`CommonCrypto`的 API 使用的仍然是老旧的 C 风格（C-Style）。这种 API 已经过时了，在 Swift 中用它们非常别扭。此外，在 Swift 中用强类型属性处理`CCCrypt`中不同类型的数据（对称式加密框架的主要加密/解密功能）很不优雅。我们先来看一下`CCCrypt`的定义：

```objectivec
CCCrypt(op: CCOperation, alg: CCAlgorithm, 
	options: CCOptions, 
	key: UnsafePointer<Void>, 
	keyLength: Int, 
	iv: UnsafePointer<Void>, 
	dataIn: UnsafePointer<Void>, 
	dataInLength: Int, 
	dataOut: UnsafeMutablePointer<Void>, 
	dataOutAvailable: Int, 
	dataOutMoved: UnsafeMutablePointer<Int>)
```

再来看看 Objective-C（更准确来说是 C 版本的）函数声明：

```objectivec
CCCryptorStatus CCCrypt(
	CCOperation op,          // operation: kCCEncrypt or kCCDecrypt
	CCAlgorithm alg,         // algorithm: kCCAlgorithmAES128... 
	CCOptions options,       // operation: kCCOptionPKCS7Padding...
	const void *key,         // key
	size_t keyLength,        // key length
	const void *iv,          // initialization vector (optional)
	const void *dataIn,      // input data
	size_t dataInLength,     // input data length
	void *dataOut,           // output data buffer
	size_t dataOutAvailable, // output data length available
	size_t *dataOutMoved)    // real output data length generated
```

在 Objective-C 中，可以简单地使用预定义常量（比如“kCCAlgorithm3DES”）来定义这些参数，然后传入不同的数组和大小，完全不必担心它们的确切类型（给`size_t`参数传入`int`变量，或者给`void*`参数传入`char*`变量）。这不是最好的做法，但确实可以完成任务（只需要进行一些类型转换）。

但是 Swift 剔除了 Objective-C 中属于 C 的部分，因此我们需要做一些准备工作才能在 Swift 和 Cocoa 中使用`CommonCrypto`。

## 操作（Operation）、算法（Algorithm）和选项（Options）

在 App 中对称编码是最简单的一种发送和接收加密数据的方法。这种方法只有一个密钥，它用于加密和解密操作（非对称加密则不同，它通常使用一对公－私密钥）。对称密码有许多不同的算法，所有的算法都可以有不同的设置。三个主要概念是：操作（加密/解密）、算法（DES，AES，RC4……）和设置，对应 CommonCrypto 的 CCOperation、CCAgorithm 和 CCOptions。

`CCOperation`、`CCAgorithm`和`CCOptions`本质上就是`uint32_t`（一个占32位存储的`unsigned int`），所以我们可以通过 `CommonCrypto`常量来构造它们：

```swift
let operation = CCOperation(kCCEncrypt)
let algorithm = CCAlgorithm(kCCAlgorithmAES)
let options = CCOptions(kCCOptionPKCS7Padding | kCCOptionECBMode)
```

## Unsafe 指针

Swift 抽象出 Unsafe 指针来对应 C 语言的指针(C-Pointers)。Swift 试图把所有的指针和 C 风格的内存管理器都抽象出来。通常来说你不需要使用它们，除非你需要使用旧式(old-style)API(比如`CommonCrypto`)。如果你真的如此不幸，那就需要学习如何处理它们：

在 Swift 中有两种类型的指针：`UnsafePointers`和`UnsafeMutablePointers`类型。第一个用于常量寄存器，内存空间上的指针是恒定不变的；第二个用于可变的内存空间。对应到 C 语言，`UnsafePointer`类型是`const type *`缓冲类型，`UnsafeMutablePointer`是`type *`缓冲类型（这里的"缓冲"一词只是过去习惯的叫法）。指针的具体类型写在声明之后的`<>`中，所以如果你想去声明一个`void *`类型的指针，需要写成：`UnsafeMutablePointer<Void>`。如果要声明`const unsigned char *`缓冲类型的指针，你需要使用：`UnsafePointer<UInt8>`。虽然苹果确实提供了纯 C 类型到 Swift 类型的转换，但是一定要注意，`CChar`、`CInt`、`CUnsignedLongLong`…这样的类型不能直接用在`UnsafePointers`中，需要使用原生的 Swift 类型。这就出现一个问题，到底什么时候能用这些类型呢？我们需要深入一下 Swift 的类型定义：

```swift
typealias CShort = Int16
typealias CSignedChar = Int8
typealias CUnsignedChar = UInt8
typealias CUnsignedInt = UInt32
typealias CUnsignedLong = UInt
typealias CUnsignedLongLong = UInt64
typealias CUnsignedShort = UInt16
```

值得庆幸的是我们不需要实现`UnsafePointers`和`UnsafeMutablePointers`类型的内存管理（只要你使用的是类似`NSData`这样的 Cocoa 对象）。Swift 会自动管理（和桥接）它们。如果你需要加密/解密数据并把密钥存到`NSData`中，那就可以调用`data.bytes`或者`data.mutableBytes`来获取对应的`UnsafePointer`和`UnsafeMutablePointer`指针。

另一种得到`UnsafePointer`变量的方式是`&`。处理输出变量时(需要内存的地址)就是通过`&`符号得到`Int`类型的`Unsafe(Mutable)Pointer<Int>`。我们可以在`CCCrypt`中使用这种方法把`Int`变量地址传给最后一个参数：`dataOutMoved`。注意：`let`定义的变量对应`UnsafePointer<Type>`类型，`var`变量对应`UnsafeMutablePointer<Type>`类型。

现在，我们已经拥有了调用`CCCrypt`所需的所有元素。

## 桥接

`CommonCrypto`还没有兼容 Swift，所以为了使用它，我们需要通过头文件导入 Objective-C 形式的`CommonCrypto`。


```swift
#import <CommonCrypto/CommonCrypto.h>
```

## SymmetricCryptor 类

最近我需要做对称加密的项目，为了更容易的加密和解密数据，我建了一个`SymmetricCryptor`类（不要在意这个可怕的名字）。它可以把数据转换成恰当的`CommonCrypto`类型中。你可以使用它来方便的加密或解密数据。

```swift
let sc = SymmetricCryptor(algorithm: .AES128, options: CCOptions(kCCOptionPKCS7Padding))
cypher.setRandomIV()
do { 
	let cypherText = try sc.crypt(string: clearText, key: key) 
} catch { 
	print("Error while encrypting: \(error)") 
}
```

`CommonCrypto`提供了多种算法和设置，不过我只想解决最常见的加密问题，因此简化了配置。比如说，使用 RC4 的时候，你可以使用 40 或者 128 位的密钥（对应的常量是 RC4_40 和 RC4_128）。同理，AES 也有一些常用的常量（128b、256b……）。因此我定义了一个名为`SymmetricCryptorAlgorithm`的枚举变量，里面定了许多常见的配置（比如 AES 256），不仅包含算法，还包含很多其他信息，比如密钥长度和块大小。

在`SymmetricCryptor`的 [GitHub 页面](https://github.com/DigitalLeaves/CommonCrypto-in-Swift)中，你可以看到一个对称加密/解密示例，它展示了如何简单地实现对称加密/解密。

![](/img/articles/commoncrypto-in-swift/36052539.jpg)

我会继续介绍非对称加密技术和公私密钥对，如果感兴趣请继续关注我。

<center>![给译者打赏](/img/QRCode/CMB.jpg)</center>