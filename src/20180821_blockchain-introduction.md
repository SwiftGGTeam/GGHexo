title: "构建第一个 Swift 区块链应用"
date: 2018-08-21
tags: [Swift,区块链]
categories: [AppCoda]
permalink: blockchain-introduction
keywords: [区块链]
custom_title:
description: 构建第一个 Swift 区块链应用

---
原文链接=https://appcoda.com/blockchain-introduction/
作者=Sai Kambampati
原文日期=2018-05-31
译者=小袋子
校对=liberalism,numbbbbb
定稿=CMB

<!--此处开始正文-->

区块链作为一项革命性的技术，开始受到越来越多追捧。为什么呢？因为区块链是许多加密数字货币的底层技术，比如：比特币（BTC），以太坊（ETH）以及莱特币（LTC）。区块链具体是如何工作的？本篇教程会涵盖所有区块链相关的知识，还会教你如何构建 Swift 区块链。下面让我们开始吧！

<!--more-->

### 区块链的工作原理

顾名思义，区块链是一条由不同区块连接组成的链。每一个块包含三个信息：数据、哈希（hash）、以及前置区块的哈希。

**1、数据** – 由于应用场景不同，存储在区块中的数据由区块链的类型决定。例如，在比特币区块链中，存储的数据是交易信息：转账金额和交易双方的信息。

**2、哈希** – 你可以将哈希看做数字指纹，用来唯一标识一个区块及其数据。哈希的重要之处在于它是一个独特的字母数字代码，通常是 64 个字符。当一个区块被创建时，哈希也随之创建。当一个区块被修改，哈希也随之修改。因此，当你想要查看在区块上所做的任何变更时，哈希就显得非常重要。

**3、前置区块的哈希** – 通过存储前置区块的哈希，你可以还原每个区块连接成区块链的过程！这使得区块链安全性特别高。

我们来看下这张图片：

![区块链](https://appcoda.com/wp-content/uploads/2018/05/blockchain-explained.png)

你可以看到，每一个区块包含数据（图片中没有指明）、哈希以及前置区块的哈希。例如，黄色区块包含自身的哈希：H7s6，以及红色区块的哈希：8SD9。这样它们就构成了一条相互连接的链。现在，假如有一个黑客准备恶意篡改红色的区块。请记住，每当块以任何方式被篡改时，该区块的哈希都会改变！当下一个区块检查并发现前置哈希不一致时，黑客将无法访问它，因为他与前置区块的联系被切断了（译者注：即如果黑客想要要篡改一个区块的话，就需要把这个区块后面的所有区块都要改掉，而这个工作量是很难实现的）。

这使得区块链特别安全，几乎不可能回滚或者篡改任何数据。虽然哈希为保密和隐私提供了巨大的保障，但是还有两个更加安全妥当的措施让区块链更加安全：工作量证明（Proof-of-Work）以及智能合约（Smart Contracts）。本文我不会深入讲解，你可以[在这里](https://hackernoon.com/what-on-earth-is-a-smart-contract-2c82e5d89d26)了解更多相关知识。

区块链最后一个保证自身安全性的方式是基于其定位。和大多数存储在服务器和数据库的数据不同，区块链使用的是点对点（P2P）网络。P2P 是一种允许任何人加入的网络，并且该网络上的数据会分发给每一个接收者。

每当有人加入这个网络，他们就会获得一份区块链的完整拷贝。每当有人新建一个区块，就会广播给全网。在将该块添加到链之前，节点会通过几个复杂的程序确定该块是否被篡改。这样，所有人、所有地方都可以使用这个信息。如果你是 *HBO 美剧硅谷* 的粉丝，对此应该不会感到陌生。在该剧中，主演（Richard）使用一种相似的技术创造了新型互联网（译者注：有趣的是剧中还发行了区块链数字货币 PiedPaperCoin，感兴趣的童鞋可以刷一下这部剧）。

因为每个人都有区块链或者节点的一份拷贝，他们可以达成一种共识并决定哪部分区块是有效的。因此，如果你想要攻击某个区块，你必须同时攻击网络上 50% 以上的区块（译者：51% 攻击），使得你的区块可以追上并替换原区块链。所以区块链或许是过去十年所创造的最安全的技术之一。

### 关于示例程序

现在你已经对区块链的原理有了初步的认识，那么我们就开始写示例程序吧！你可以在这里下载[原始项目](https://github.com/appcoda/BlockchainDemo/raw/master/BlockchainStarter.zip)。

如你所见，我们有两个比特币钱包。第一个账户 1065 有 500 BTC，而第二个账户 0217 没有 BTC。我们通过 send 按钮可以发送比特币到另外的账户。为了赚取 BTC，我们可以点击 Mine 按钮，可以获得 50 BTC 的奖励。我们主要工作是查看控制台输出，观察两个账户间的交易过程。

![这里写图片描述](https://appcoda.com/wp-content/uploads/2018/05/blockchain-2.png)

在左侧导航栏可以看到两个很重要的类：`Block` 和 `Blockchain`。目前这两个类都是空实现，我会带着你们在这两个类中写入相关逻辑。下面让我们开始吧！

![这里写图片描述](https://appcoda.com/wp-content/uploads/2018/05/blockchain-3.png)

### 在 Swift 中定义区块

首先打开 `Block.swift` 并添加定义区块的代码。在此之前，我们需要定义区块是什么。前面我们曾定义过，区块是由三部分组成：哈希、实际记录的数据以及前置区块的哈希。当我们想要构建我们的区块链时，我们必须知道该区块是第一个还是第二个。我们可以很容易地在 Swift 的类中做如下定义：

```swift
var hash: String!
var data: String!
var previousHash: String!
var index: Int!
```

现在需要添加最重要的代码。我曾提过区块在被修改的情况下，哈希也会随之变化，这是区块链如此安全的特性之一。因此我们需要创建一个函数去生成哈希，该哈希由随机字母和数字组成。这个函数只需要几行代码：

```swift
func generateHash() -> String {
    return NSUUID().uuidString.replacingOccurrences(of: "-", with: "")
}
```

`NSUUID` 是一个代表通用唯一值的对象，并且可以桥接成 UUID。它可以快速地生成 32 个字符串。本函数生成一个 UUID，删除其中的连接符，然后返回一个 `String`，最后将结果作为区块的哈希。`Block.swift` 现在就像下面：

![这里写图片描述](https://appcoda.com/wp-content/uploads/2018/05/blockchain-4.png)

现在我们已经定义好了 `Block` 类，下面来定义 Blockchain 类，首先切换到 `Blockchain.swift` 。

### 在 Swift 中定义区块链

和之前一样，首先分析区块链的基本原理。用非常基础的术语来说，区块链只是由一连串的区块连接而成，也可以说是一个由多个条目组成的列表。这是不是听起来很熟悉呢？其实这就是数组的定义！而且这个数组是由区块组成的！接下来添加以下代码：

```swift
var chain = [Block]()
```

```
快速提示： 这个方法可以应用于计算机科学世界里的任何事物。如果你遇到大难题，可以尝试把它分解成若干个小问题，以此来建立起解决问题的方法，正如我们解决在 Swift 中如何添加区块和区块链的问题。
```

你会注意到数组里面是我们前面定义的 `Block` 类，这就是区块链所需要的所有变量。为了完成功能，我们还需要在类中添加两个函数。请尝试着根据我之前教过的方法解答这个问题。

> 区块链中的两个主要函数是什么？

我希望你能认真思考并回答这个问题！实际上，区块链的两个主要功能是创建创世区块（最初的始块），以及在其结尾添加新的区块。当然现在我不打算实现分叉区块链和添加智能合约的功能，但你必须了解这两个是基本功能！将以下代码添加到 `Blockchain.swift`：

```swift
func createGenesisBlock(data:String) {
    let genesisBlock = Block()
    genesisBlock.hash = genesisBlock.generateHash()
    genesisBlock.data = data
    genesisBlock.previousHash = "0000"
    genesisBlock.index = 0
    chain.append(genesisBlock)
}

func createBlock(data:String) {
    let newBlock = Block()
    newBlock.hash = newBlock.generateHash()
    newBlock.data = data
    newBlock.previousHash = chain[chain.count-1].hash
    newBlock.index = chain.count
    chain.append(newBlock)
}
```

1、我们添加的第一个函数的作用是创建创世区块。为此，我们创建了一个以区块数据为入参的函数。然后定义了一个类型为 `Block` 的变量 `genesisBlock`，它拥有此前在 `Block.swift` 中定义的所有变量和函数。我们将 `generateHash()` 赋值给哈希，将输入的 `data` 参数赋值给数据。由于这是第一个区块，我们将前置区块的哈希设为 0000，这样我们就可以知道这是起始区块。最后我们将 `index` 设为 0，并将这个区块加入到区块链中。

2、我们创建的第二个函数适用于 `genesisBlock` 之后的所有区块，并且能创建剩余的区块。你会注意到它与第一个函数非常相似。唯一的区别是，我们将 `previousHash` 的值设置为前一个区块的哈希值，并将 `index` 设置为它在区块链中的位置。就这样，区块链已经定义好了！你的代码应该看起来跟下图一样！

![这里写图片描述](https://appcoda.com/wp-content/uploads/2018/05/blockchain-5.png)

### 钱包后端

现在切换到 `ViewController.swift`，我们会发现所有的 outlet 都已经连接好了。我们只需要处理交易，并将其输出到控制台。

然而在此之前，我们需要稍微研究一下比特币的区块链。比特币是由一个总账户产生的，我们将这个账号的编号称为 0000。当你挖到一个 BTC，意味着你解决了数学问题，因此会发行一定数量的比特币作为奖励。这提供了一个发币的高明方法，并且可以激励更多人去挖矿。在我们的应用，让我们把挖矿奖励设为 100 BTC。首先，在视图控制器中添加所需的变量：

```swift
let firstAccount = 1065
let secondAccount = 0217
let bitcoinChain = Blockchain()
let reward = 100
var accounts: [String: Int] = ["0000": 10000000]
let invalidAlert = UIAlertController(title: "Invalid Transaction", message: "Please check the details of your transaction as we were unable to process this.", preferredStyle: .alert)
```

首先定义号码为 1065 和 0217 的两个账号。然后添加一个名为 `bitcoinChain` 的变量作为我们的区块链，并将 `reward` 设为 100。我们需要一个主帐户作为所有比特币的来源：即创世帐户 0000。里面有 1000 万个比特币。你可以把这个账户想象成一个银行，所有因奖励产生的 100 个比特币都经此发放到合法账户中。我们还定义了一个提醒弹窗，每当交易无法完成时就会弹出。

现在，让我们来编写几个运行时需要的通用函数。你能猜出是什么函数吗？

1、第一个函数是用来处理交易的。我们需要确保交易双方的账户，能够接收或扣除正确的金额，并将这些信息记录到我们的区块链中。

2、下一个函数是在控制台中打印整个记录 —— 它将显示每个区块及其中的数据。

3、最后一个是用于验证区块链是否有效的函数，通过校验下一个区块的 `previousHash` 和上一个区块 `hash` 是否匹配。由于我们不会演示任何黑客方法，因此在我们的示例程序中，区块链是永远有效的。


### 交易函数

下面是一个通用的交易函数，请在我们定义的变量下方输入以下代码：

```swift
func transaction(from: String, to: String, amount: Int, type: String) {
    // 1
    if accounts[from] == nil {
        self.present(invalidAlert, animated: true, completion: nil)
        return
    } else if accounts[from]!-amount < 0 {
        self.present(invalidAlert, animated: true, completion: nil)
        return
    } else {
        accounts.updateValue(accounts[from]!-amount, forKey: from)
    }
    
    // 2
    if accounts[to] == nil {
        accounts.updateValue(amount, forKey: to)
    } else {
        accounts.updateValue(accounts[to]!+amount, forKey: to)
    }
    
    // 3
    if type == "genesis" {
        bitcoinChain.createGenesisBlock(data: "From: \(from); To: \(to); Amount: \(amount)BTC")
    } else if type == "normal" {
        bitcoinChain.createBlock(data: "From: \(from); To: \(to); Amount: \(amount)BTC")
    }
}
```

代码量看起来好像很大，但主要是定义了每个交易需要遵循的一些规则。一开始是函数的四个参数：
`to`，`from`，`amount`，`type`。前三个参数不需要再解释了，而 `Type` 主要用于定义交易的类型。总共有两个类型：正常类型（normal） 和创世类型（genesis）。正常类型的交易会发生在账户 1065 和 2017 之间，而创世类型将会涉及到账户 0000。

1、第一个 `if-else` 条件语句处理转出账户的信息。如果账户不存在或者余额不足，将会提示交易不合法并返回。

2、第二个 `if-else` 条件语句处理转入账户的信息。如果账户不存在，则创建新账户并转入相应的比特币。反之，则向该账户转入正确数量的比特币。

3、最后一个 `if-else` 条件语句处理交易类型。如果类型是创世类型，则添加一个创世区块，否则创建一个新的区块存储数据。

### 打印函数

为了确保交易正确执行，在每个交易结束后，我们希望拿到所有交易的清单。以下是我们在交易函数下方的代码，用来打印相关信息：

```swift
func chainState() {
    for i in 0...bitcoinChain.chain.count-1 {
        print("\tBlock: \(bitcoinChain.chain[i].index!)\n\tHash: \(bitcoinChain.chain[i].hash!)\n\tPreviousHash: \(bitcoinChain.chain[i].previousHash!)\n\tData: \(bitcoinChain.chain[i].data!)")
    }
    redLabel.text = "Balance: \(accounts[String(describing: firstAccount)]!) BTC"
    blueLabel.text = "Balance: \(accounts[String(describing: secondAccount)]!) BTC"
    print(accounts)
    print(chainValidity())
}
```

这是一个简单的循环语句，遍历 `bitcoinChain` 中的所有区块，并打印区块号码，哈希，前置哈希，以及存储的数据。同时我们更新了界面中的标签（label），这样就可以显示账户中正确的 BTC 数量。最后，打印所有的账户（应该是 3 个），并校验区块链的有效性。

现在你应该会在函数的最后一行发现一个错误。这是由于我们还没有实现 `chainValidity()` 函数，让我们马上开始吧。

### 有效性函数

判断一个链是否有效的标准是：前置区块的哈希与当前区块所表示的是否匹配。我们可以再次用循环语句来遍历所有的区块：

```swift
func chainValidity() -> String {
    var isChainValid = true
    for i in 1...bitcoinChain.chain.count-1 {
        if bitcoinChain.chain[i].previousHash != bitcoinChain.chain[i-1].hash {
            isChainValid = false
        }
    }
    return "Chain is valid: \(isChainValid)\n"
}
```

和之前一样，我们遍历了 `bitcoinChain` 中的所有区块，并检查了前置区块的 `hash` 是否与当前区块的 `previousHash` 一致。

就酱！我们已经将定义了所有需要的函数！你的 `ViewController.swift` 应该如下图一样：

![这里写图片描述](https://appcoda.com/wp-content/uploads/2018/05/blockchain-6.png)

收尾工作就是连接按钮和函数啦。让我们马上开始最后的部分吧！

### 让一切关联起来

当我们的应用第一次启动时，需要创世账户 0000 发送 50 BTC 到我们的第一个账户。再从第一个账户转账 10 BTC 到第二个账户，这只需要寥寥三行代码。最后 `viewDidLoad` 中的代码如下：

```swift
override func viewDidLoad() {
    super.viewDidLoad()
    transaction(from: "0000", to: "\(firstAccount)", amount: 50, type: "genesis")
    transaction(from: "\(firstAccount)", to: "\(secondAccount)", amount: 10, type: "normal")
    chainState()
    self.invalidAlert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
}
```
我们使用已定义好的函数转账，并调用 `chainState()` 函数。最后，我们还在 `invalidAlert` 中添加了一个标题为 OK 的 `UIAlertAction`。

现在让我们来实现剩下的四个函数：`ReMeNe()`、`BrimeMeNe()`、`ReSdEnter()`和`BuLeScript()`。

### 挖矿函数

挖矿函数特别简单，只需要三行代码。添加以下代码：

```swift
@IBAction func redMine(_ sender: Any) {
    transaction(from: "0000", to: "\(firstAccount)", amount: 100, type: "normal")
    print("New block mined by: \(firstAccount)")
    chainState()
}
    
@IBAction func blueMine(_ sender: Any) {
    transaction(from: "0000", to: "\(secondAccount)", amount: 100, type: "normal")
    print("New block mined by: \(secondAccount)")
    chainState()
}
```

在第一个挖矿函数中，我们使用交易函数从创世账户发送了 100 BTC 到第一个账户。我们打印了挖矿的区块，然后打印了区块链的状态。同样地，在 `blueMine` 函数中，我们转给了第二个账户 100 BTC。

### 发送函数

发送函数和挖矿函数略微相似：

```swift
@IBAction func redSend(_ sender: Any) {
    if redAmount.text == "" {
        present(invalidAlert, animated: true, completion: nil)
    } else {
        transaction(from: "\(firstAccount)", to: "\(secondAccount)", amount: Int(redAmount.text!)!, type: "normal")
        print("\(redAmount.text!) BTC sent from \(firstAccount) to \(secondAccount)")
        chainState()
        redAmount.text = ""
    }
}
    
@IBAction func blueSend(_ sender: Any) {
    if blueAmount.text == "" {
        present(invalidAlert, animated: true, completion: nil)
    } else {
        transaction(from: "\(secondAccount)", to: "\(firstAccount)", amount: Int(blueAmount.text!)!, type: "normal")
        print("\(blueAmount.text!) BTC sent from \(secondAccount) to \(firstAccount)")
        chainState()
        blueAmount.text = ""
    }
}
```

首先，我们检查 `redAmount` 或者 `blueAmount` 的文本值是否为空。如果为空，则弹出无效交易的提示框。如果不为空，则继续下一步。我们使用交易函数从第一个账户转账到第二个账户（或者反向转账），金额为输入的数量。我们打印转账金额，并调用 `chainState()` 方法。最后，清空文本框。

就酱，工作完成！请检查你的代码是否和图中一致：

![这里写图片描述](https://appcoda.com/wp-content/uploads/2018/05/blockchain-7.png)

现在运行应用并测试一下。从前端看，这就像一个正常的交易应用，但是运行在屏幕背后的可是区块链啊！请尝试使用应用将 BTC 从一个帐户转移到另一个帐户，随意测试，尽情把玩吧！

### 结论

在这个教程中，你已经学会了如何使用 Swift 创建区块链，并且创建了你自己的比特币交易系统。请注意，真正加密货币的后端，和我们上面的实现完全不一样，因为它需要用智能合约实现分布式，而本例仅用于学习。

在这个示例中，我们将区块链技术应用于加密货币，然而你能想到区块链的其他应用场景吗？请留言分享给大家！希望你能学到更多新东西！

为了参考，你可以从 GitHub 下载[完整的示例](https://github.com/appcoda/BlockchainDemo)。
