在 Linux 中使用 Swift 进行 TCP Sockets 编程"

> 作者：Joe，[原文链接](http://dev.iachieved.it/iachievedit/tcp-sockets-with-swift-on-linux/)，原文日期：2016-01-03
> 译者：[shanks](http://codebuild.me/)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[Cee](https://github.com/Cee)
  









在远古时代，程序员们使用 [TCP/IP](https://en.wikipedia.org/wiki/Transmission_Control_Protocol) [套接字（sockets）](https://en.wikipedia.org/wiki/Network_socket)来编写客户端-服务器（client-server）应用。这事发生在黑暗时代 [HTTP](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol) 诞生之前。

当然，我只是开了个玩笑。HTTP 的出现给客户端-服务器（client-server）应用带来更多的变化，当然它也是 [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) 应用的基础。HTTP 带给我们的不仅是将数据在网络中打包传输，还包括一个一致认可的包协议架构（从某种程度上来讲，是一个在特定端口下使用的标准）。可以进行的动作有：GET，POST，PUT 等。HTTP 头部本身也使得 HTTP 协议对于开发客户端-服务器应用变得更加友好。



接下来，在栈的底层，字节和字符都会被你操作系统的套接字接口处理和传输。网络套接字编程的 API 已经很强大了，很多[教程](http://gnosis.cx/publish/programming/sockets.html)和[书籍](http://www.amazon.com/TCP-Illustrated-Protocols-Addison-Wesley-Professional/dp/0321336313)都和这个知识点有关。用 C 来处理 IP 网络目前看来很繁琐，但是一开始只能用它来做。之后我们使用 C++ 面向对象的思想来包装这些 API，从而使网络编程变得更加容易。接着，出现了苹果 Foundation 中的 `CFStream` 类，然后就是我们要用到的 `swiftysockets` API。


### Swiftychat

为了说明如何使用 Swift 来调用 TCP/IP 网络套接字，我们开发了 一个简单的聊天应用：Swiftychat。不过这只是一个很初级的应用，功能有限，不能在真实环境中使用。但是，它可以作为一个案例，让我们学习如何使用 Swift 来调用 TCP/IP 网络套接字发送和接收字符串。

#### swiftysockets

Swiftychat 需要用到 [swiftysockets](https://github.com/iachievedit/swiftysockets)，一个由 [Zewo 团队](https://github.com/zewo)基于 Swift 开发的 TCP/IP 套接字的包。但是由于包的限制，我们不得不首先安装一个 C 库──[Tide](https://github.com/iachievedit/Tide)。那么我们现在就搞起吧。

    bash
    $ git clone https://github.com/iachievedit/Tide
    Cloning into 'Tide'...
    ...
    $ cd Tide
    $ sudo make install
    clang -c Tide/tcp.c Tide/ip.c Tide/utils.c
    ar -rcs libtide.a *.o
    rm *.o
    mkdir -p tide/usr/local/lib
    mkdir -p tide/usr/local/include/tide
    cp Tide/tcp.h Tide/ip.h Tide/utils.h Tide/tide_swift.h tide/usr/local/include/tide
    # copy .a
    cp libtide.a tide/usr/local/lib/
    mkdir -p /usr/local
    cp -r tide/usr/local/* /usr/local/

小道消息称未来 [Swift 包管理会支持编译 C 库](https://github.com/ddunbar/swift-evolution/blob/master/proposals/NNNN-swiftpm-c-language-targets.md)，可以和你写的包一起进行编译。但是在这之前，我们必须安装 C 库。


安装好 Tide 以后，我们就可以在 Swiftychat 应用中愉快的使用 swiftysockets 了。

#### 开始编码！

`main.swift` 文件中的代码比较简单：创建一个 `ChatterServer` 并启动它。

    
    //main.swift
    if let server = ChatterServer() {
      server.start()
    }

可以看到，`main.swift` 相当简单，只做了一件事情，入侵……抱歉，我刚才跑偏了，这不是星球大战……

简洁的 `main.swift` 意味着我们所有的实现都在 `ChatterServer` 类中，代码如下：

    
    import swiftysockets
    import Foundation
    
    class ChatterServer {
    
      private let ip:IP?
      private let server:TCPServerSocket?
    
      init?() {
        do {
          self.ip     = try IP(port:5555)
          self.server = try TCPServerSocket(ip:self.ip!)
        } catch let error {
          print(error)
          return nil
        }
      }
    
      func start() {
        while true {
          do {
            let client = try server!.accept()
            self.addClient(client)
          } catch let error {
            print(error)
          }
        }
      }
    
      private var connectedClients:[TCPClientSocket] = []
      private var connectionCount = 0
      private func addClient(client:TCPClientSocket) {
        self.connectionCount += 1
        let handlerThread = NSThread(){
          let clientId = self.connectionCount
          
          print("Client \(clientId) connected")
          
          while true {
            do {
              if let s = try client.receiveString(untilDelimiter: "\n") {
                print("Received from client \(clientId):  \(s)", terminator:"")
                self.broadcastMessage(s, except:client)
              }
            } catch let error {
              print ("Client \(clientId) disconnected:  \(error)")
              self.removeClient(client)
              return
            }
          }
        }
        handlerThread.start()
        connectedClients.append(client)
      }
    
      private func removeClient(client:TCPClientSocket) {
        connectedClients = connectedClients.filter(){$0 !== client}
      }
    
      private func broadcastMessage(message:String, except:TCPClientSocket) {
        for client in connectedClients where client !== except {
          do {
            try client.sendString(message)
            try client.flush()
          } catch {
            // 
          }
        }
      }
    }

我们的服务器分解为以下几部分代码：

**1.** 初始化

我们使用可选的构造器 `init?`，这表示有可能返回 `nil`，因为调用 `swiftysockets` 中的 `IP` 和 `TCPServerSocket` 类有可能抛出错误。`IP` 类封装好了 `IP` 地址和端口，提供给 `TCPServerSocket` 类构造器一个 `IP` 类实例。如果初始化成功，我们就可以得到一个指定端口上的 `TCP` 套接字，为下一步的连接做好准备。

**2.** 主循环

我们不关心主循环的名字，你叫它 `startListening`、`start` 或者 `main` 都可以。主循环的任务是接收新的客户端连接，然后把它们加入到已连接的客户端列表中。`server!.accept()` 是一个阻塞方法，它会挂起并等待新连接到来。这是标准做法。

**3.** 客户端管理
 
`ChatterServer` 类剩余的部分包含了所有对于客户端管理的方法，包括一些变量和三个动作。

变量包括：

	* 一个包含已连接客户端的数组: `[TCPClientSocket]`
	* 连接计数用来处理客户端连接的标识符
	
同时有以下 3 个方法：

  * `addClient` 接收一个 `TCPClientSocket` 对象，增加连接计数，然后建立一个新的 `NSThread` 来独立处理当前获得的客户端连接。接收到新连接时，它会创建新的 `NSThread` 来处理它们。我们在后面会介绍 `NSThread` 的方法。当线程启动后，`addClient` 会把这个传入的 `TCPClientSocket` 实例加入已连接客户端列表的末尾。

  * `removeClient` 使用 `filter` 方法从已连接客户端列表删除指定的客户端连接。注意我们这里使用了 [`!==` 操作符](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/ClassesAndStructures.html)。

  * `broadcastMessage` 方法把我们的 `ChatterServer` 变成了一个聊天服务器。方法中使用 `where` 语句创建一个过滤后的数组，然后把一个客户端的消息广播给所有已连接的客户端。在这里，我们再次使用了 `!==` 操作符。

再回顾一下，线程是一个在主过程中单独的执行路径。服务器端创建一个单独的线程来处理每个连接的客户端。你可能会质疑，这样做是否合适？如果我们的服务器最终要处理成千上万的客户端请求，那我也认为这不是一个好的做法。但是对于这篇教学文章来说，我认为已经够啦。

让我们再看一眼线程代码：

    
    let handlerThread = NSThread(){
          let clientId = self.connectionCount
          
          print("Client \(clientId) connected")
          
          while true {
            do {
              if let s = try client.receiveString(untilDelimiter: "\n") {
                print("Received from client \(clientId):  \(s)", terminator:"")
                self.broadcastMessage(s, except:client)
              }
            } catch let error {
              print ("Client \(clientId) disconnected:  \(error)")
              self.removeClient(client)
              return
            }
          }
        }
        handlerThread.start()

客户端处理线程时会进入一个循环，等待 `TCPClientSocket` 中的 `receiveString` 方法获取客户端的输入。当服务器端接收到一个字符串后，服务器端会打印到终端，然后广播这个消息，如果 `try` 语句抛出了错误（断开连接），服务器端会删除这个客户端连接。

### 整合所有内容

我们的目标是使用 Swift 包管理来编译我们的应用，关于 `swiftpm` 的介绍，请查看我们的[相关教程](http://dev.iachieved.it/iachievedit/introducing-the-swift-package-manager/)。

以下是 `Package.swift` 的代码：

    
    import PackageDescription
    
    let package = Package(
      name:  "chatterserver",
      dependencies: [
        .Package(url:  "https://github.com/iachievedit/swiftysockets", majorVersion: 0),
      ]
    )

然后创建一个 `Sources` 文件夹，把 `main.swift` 和 `ChatterServer.swift` 放进去。

运行 `swift build`，它会下载和编译 2 个依赖的库（`Tide` 和 `swiftysockets`），接着就会编译我们的应用代码。如果编译成功，你就可以在 `.build/debug/` 目录下找到一个可执行的二进制文件：`chatterserver`。


#### 测试

我们的下一个教程将会编写一个简单使用的聊天客户端程序，在这里我们就使用 `nc`（[netcat](https://en.wikipedia.org/wiki/Netcat)）命令来测试我们的服务器。启动服务器，在另外一个终端窗口中输入 `nc localhost 5555`，你可以在服务器的终端窗口中看到 `Client 1 connected`。如果你用 CTRL-C 关掉客户端窗口，服务器端会打印一个断开连接信息，并且会打印出说明信息（比如：`Connection reset by peer`）。

下面进行更加真实的测试，我们将启用一个服务器端和三个客户端，见下图：

![](http://swift.gg/img/articles/tcp-sockets-with-swift-on-linux/Selection_007.png1456793714.7514606)

看图中左边的终端，我们的聊天服务器正在运行。右边终端有 3 个客户端，每一个都使用命令 `nc localhost 5555` 来启动。每个客户端连接服务器的时候，都会在服务器端打印出连接信息。

回想一下，我们的 `broadcastMessage` 方法中排除了广播的发起方，这样就避免了客户端收到自己发送的消息（仔细看 `where` 语句，你就知道我在说啥了）。

#### 下回分解

使用 `nc` 命令作为我们的客户端有点无聊。我们不能使用昵称，消息也没有结构可言，而且没有时间戳之类的信息。在上面的例子中，服务器端完全不知道我们传过来是啥。`swiftysockets` 有一个 `TCPClientSocket` 类，为啥我们不可以使用它去创建一个更加健壮的聊天客户端呢？

### 获取代码

我们将聊天服务器代码上传到了 [GitHub](https://github.com/iachievedit/swiftychatter) 上。这其中也包括目前暂时未实现的 `chatterclient` 项目。下载完成后，你可以在根目录下使用 `make` 指令编译服务器端和客户端。

**牢记**：你必须提前安装好 `libtide.a` 和对应的头文件，因为 `swiftysockets` 会用到它！
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。