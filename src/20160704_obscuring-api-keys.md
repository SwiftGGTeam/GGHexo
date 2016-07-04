title: "混淆 API 密钥"
date: 2016-07-04
tags: [Swift 进阶]
categories: [iAchievedit]
permalink: obscuring-api-keys
keywords: api密钥,ios 混淆私有api
custom_title: 
description: 本文是讲解怎么加密 API 密钥以及解密 API 密钥，以及思考 API 密钥的安全性问题。

---
原文链接=http://dev.iachieved.it/iachievedit/obscuring-api-keys
作者=Joe
原文日期=2016-04-16
译者=pucca601
校对=Cee
定稿=千叶知风

<!--此处开始正文-->

![](http://swiftgg-main.b0.upaiyun.com/img/obscuring-api-keys-1.jpg)

密钥，或者说「凭证」，是在使用 REST API 时难免会碰到的一件事情。当你注册了 [Amplitude](https://amplitude.com) 后，你会得到一个密钥用来唯一识别你的应用。若你使用的是 [Aeris Weather](http://www.aerisweather.com/) 的 API，会得到一个 ID 和密码。如果你要在 iOS 应用里调用这些 API，则需要把这些 API 密钥放在某处。在[之前的一篇文章](http://dev.iachieved.it/iachievedit/using-property-lists-for-api-keys-in-swift-applications/)中我们整理了如何在属性列表文件中放置 API 密钥。这篇教程中，我们将要加密这些 API 密钥并且关注如何在你的 app 中访问它们。

在我们开始之前，我想要谈谈安全问题。我不是一个安全领域的专家，你很可能也不是。这篇文章原本的标题是「加密 API 密钥」，但经过再三考虑，我重新将其命名为「混淆 API 密钥」。文章中没有一处对这种混淆方式不会被破解进行了保证，因为任何人真的想要盗取你的 API 密钥时一定会用各种手段获取到。混淆这种方式只能为盗取提高一点门槛。

<!--more-->

### 加密你的密钥

想要对我们的 API 密钥另加一层保护，我们需要用到 [Blowfish Cipher Feedback](https://www.schneier.com/academic/blowfish/)。使用这种加密方式你需要选择：

- 一串密钥
- 一个初始化矩阵

密钥至少有 8 个字符，至多 56 个字符。选择任意你喜欢的密钥：一个词组，亦或是混乱的字符。[初始化矩阵](https://en.wikipedia.org/wiki/Initialization_vector)应该是个随意的 8 字节矩阵。选择完密钥和初始化矩阵后，下载我们的 [Key Encrypter](http://dev.iachieved.it/downloads/keyencrypter.zip)。输入密钥和初始化矩阵字符串，以及你希望加密的 API 密钥。例如，我们要加密的 API 密钥是 6bbb3654679105f33cf8c491ed9b04df，密钥是 dontusethissecret，初始化矩阵是 decafbadbaddecaf。输入后点击 **Encrypt**。

![](http://swiftgg-main.b0.upaiyun.com/img/obscuring-api-keys-2.png)

点击后的输出结果是一串十六进制的字符串，一起的，当然，还有最初的密钥和初始化矩阵。

### 解密你的密钥

加密和解密的程序用了 Blowfish 的实现，源码在 [mbed TLS](https://tls.mbed.org/blowfish-source-code) 上。程序用 C 语言实现，在 Swift 中可以利用一个 bridging header 来使用这段程序。

我们的解密方法在 Swift 中看起来像这样：

```swift
func decrypt(message:[UInt8], key:String, iv:[UInt8]) -> String? {
  var context:mbedtls_blowfish_context = mbedtls_blowfish_context()
  let keybits = UInt32(key.characters.count*8)
  
  // 初始化 Blowfish context 和设置 key
  mbedtls_blowfish_init(&context)
  mbedtls_blowfish_setkey(&context, key, keybits)
 
  var decryptIV:[UInt8] = iv
  var ivOffset          = 0
  var output:[UInt8]    = [UInt8](count:message.count, repeatedValue:0)
 
  if mbedtls_blowfish_crypt_cfb64(&context,
                                MBEDTLS_BLOWFISH_DECRYPT,
                                message.count,
                                &ivOffset,
                                &decryptIV,
                                message,
                                &output) == 0 {
    return String(bytes: output, encoding: NSUTF8StringEncoding)
  } else {
    return nil
  }
}
```

现在的问题是，在你的代码中如何使用解密方法以及要将密钥和初始化矩阵该放在何处。这取决于你（还有多种方法可以做到）。只要记住不管你做什么，如果有人决心要破解你的加密信息，他们一定能想尽各种办法做到。这只是当从一台越狱的手机上解密和反编译 app 后，他们需要另外攻破的一道防线。

为了测试我们对生成的字符串的解密方法，下载这个 [iOS 例子](https://bitbucket.org/iachievedit/apikeysexample/downloads)，在 Xcode 里打开，然后运行。你需要对照一下原始的 API 密钥 6bbb3654679105f33cf8c491ed9b04df。

### 获取源代码

Mac 上的加密应用和解密 API 验证序列的代码可以在 Bitbucket 找到：

- [Key Encrypter](https://bitbucket.org/iachievedit/keyencrypter)
- [Sample iOS Decryption](https://bitbucket.org/iachievedit/apikeysexample)

您可以自定义修改你的加密程序；Blowfish CFB 仅仅是众多选项中的一种。

### 一些思考

老实说，发这篇文章我有些担忧。安全是一个吸引了很多注意力的话题，关注的开发者中有很多都有自己的态度。你会经常听到如下:

- 混淆方式不安全！
- 永远不要写你自己的加密程序！
- 如果你不知道自己在做什么就不要做！

等诸如此类的说辞。尽管与此同时我们被告知要更有安全意识并且在编写过程中保持这种意识。用来访问服务的 REST API 验证序列提供给每日开发者，而大多数文档掩盖了如何将其更安全地嵌入你的移动应用中。

最后，[Dexguard](https://www.guardsquare.com/dexguard) 的安卓版作者在 Stack Overflow 上总结了[一篇](http://stackoverflow.com/questions/14570989/best-practice-for-storing-private-api-keys-in-android?answertab=active#tab-top)关于如何恰当地存储 API 密钥的文章：

> 最终变成了经济学上的交易问题你必须做出选择：你的密钥有多重要，你能负担多少时间，负担多贵的软件，对序号感兴趣的黑客有多么复杂，他们愿意花费多少时间，延迟黑客获取密钥有多少价值，成功了的黑客多大程度会分发密钥，等等。类似密钥这样小的信息片段比整个应用更难防护。本质上来说，在客户端没有什么是不能破解的，然而你还是可以设置障碍。  – Eric LaFortune

当你要做出决策关于在你的移动应用上实行什么样的安全等级，这些都是很好的参考准则。某些时候你必须在你的密钥被发现的可能性与有些只要黑客想要就一定会失去的东西之前做个平衡之后，决定你要在你的应用代码里混淆 API 验证序列中投入多少时间精力。