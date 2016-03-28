用 Swift 来写命令行程序"

> 作者：Joe，[原文链接](http://dev.iachieved.it/iachievedit/command-line-utilities-in-swift/)，原文日期：2015-12-28
> 译者：[aaaron7](http://www.jianshu.com/users/9efd08855d3a/)；校对：[Cee](https://github.com/Cee)；定稿：[littledogboy](undefined)
  









这是探索 Swift 写 Linux 程序的系列文章中的一篇。

在上一个例子中，我们通过组合使用 `popen` 和 `wget` 命令来调用[自然语言翻译服务](http://mymemory.translated.net/doc/spec.php)，来实现像 [Google 翻译](https://translate.google.com/)那样的翻译功能。本文的程序会基于之前我们已经完成的工作来进行。但与之前每次执行都只能翻译一句话所不同的是，这次我们要实现一个具备交互功能的 `shell` 程序，来翻译在控制台输入的每一句话。像下面的截图一样：

![Translate all the things!](http://swift.gg/img/articles/command-line-utilities-in-swift/swifty_006.png1459126515.640598)



翻译程序会显示它接受什么语言（源语言）以及翻译的目标语言。比如：

- `en->es` 英语翻译为西班牙语
- `es->it` 西班牙语翻译为意大利语
- `it->ru` 意大利语翻译为俄罗斯语

翻译程序默认是 `en->es`，并提供了两个命令：`to` 和 `from` 来实现语言的切换。比如，输入 `to es` 将会把翻译的目标语言设置为西班牙语。输入 `quit` 可以退出程序。

如果用户输入的字符串不是命令的话，翻译程序会把输入逐字地发送到翻译的 web 服务。然后把返回的结果打印出来。

### 需要注意的几点

如果你是系统或者运维程序员，并且以前也没接触过 Swift 的话，下面是一些你在代码里需要注意的事情。我想你会发现 Swift 为两种类型的工程师都提供了很多有用的特性，并且会成为 Linux 开发体系中一股很受欢迎的新力量。

- `let variable = value` 常量赋值
- [元组（tuples）](https://www.weheartswift.com/tuples-enums/)
- `switch-case` 支持字符串
- `switch-case` 使用时必须包含所有情况（逻辑完备性）
- 计算型[属性](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Properties.html)
- `import Glibc` 可以导入标准的 C 函数
- `guard` [语句](http://www.codingexplorer.com/the-guard-statement-in-swift-2/)
- 可以使用 `NSThread` 和 `NSNotificationCenter` 这些苹果的 Foundation 框架中的类。
- 在不同的线程或不同的对象里通过发送消息来触发特定代码的执行

### 程序设计

我们的翻译程序可以拆分成一个主程序、两个类以及一个 `globals.swift` 文件。如果你打算跟着做，那你应该使用 [Swift 的包管理器](http://dev.iachieved.it/iachievedit/introducing-the-swift-package-manager/)，然后调整你的目录结构为下面这样：

    translator/Sources/main.swift
              /Sources/CommandInterpreter.swift
              /Sources/...
              /Package.swift
              
              
`main.swift` 文件是 Swift 应用程序的入口并且应该是唯一一个包含可执行代码的文件（在这里，像「变量赋值」，或者「声明一个类」不属于「可执行的代码」）。

`main.swift`：

    
    import Foundation
    import Glibc
     
    let interpreter = CommandInterpreter()
    let translator  = Translator()
     
    // Listen for events to translate
    nc.addObserverForName(INPUT_NOTIFICATION, object:nil, queue:nil) {
      (_) in
      let tc = translationCommand
      translator.translate(tc.text, from:tc.from, to:tc.to){
        translation, error in
        guard error == nil && translation != nil else {
          print("Translation failure:  \(error!.code)")
          return
        }
        print(translation!)
      }
    }
     
    interpreter.start()
     
    select(0, nil, nil, nil, nil)

上面的代码表示我们的程序不接受命令行参数。具体的流程说明：

1. 分别创建 `CommandInterpreter` 和 `Translator` 类的实例
2. 为 `InputNotification` 通知添加观察者（这里用到的常量 `INPUT_NOTIFICATION` 常量定义在 `globals.swift`）
3. 添加当收到通知的时候要执行的代码
4. 调用 `Interpreter` 类实例的 `start` 方法
5. 调用 `select` 来实现当程序有其他线程在运行的时候，锁定主线程。（译注：也就是防止主线程提前结束）

### CommandInterpreter 类

`CommandInterpreter` 类主要负责从终端读入输入的字符串，并且分析输入的类型并分别进行处理。考虑到你可能刚接触 Swift，我在代码里对涉及到语言特性的地方进行了注释。

    
    // Import statements
    import Foundation
    import Glibc
     
    // Enumerations
    enum CommandType {
    case None
    case Translate
    case SetFrom
    case SetTo
    case Quit
    }
     
    // Structs
    struct Command {
      var type:CommandType
      var data:String
    }
     
    // Classes
    class CommandInterpreter {
     
      // Read-only computed property
      var prompt:String {
        return "\(translationCommand.from)->\(translationCommand.to)"
      }
     
      // Class constant
      let delim:Character = "\n"
     
      init() {
      }
     
      func start() {
        let readThread = NSThread(){
          var input:String    = ""
          
          print("To set input language, type 'from LANG'")
          print("To set output language, type 'to LANG'")
          print("Type 'quit' to exit")
          self.displayPrompt()
     
          while true {
            let c = Character(UnicodeScalar(UInt32(fgetc(stdin))))
            if c == self.delim {
              let command = self.parseInput(input)
              self.doCommand(command)
              input = "" // Clear input
              self.displayPrompt()
            } else {
              input.append(c)
            }
          }
        }
        
        readThread.start()
      }
     
      func displayPrompt() {
        print("\(self.prompt):  ", terminator:"")
      }
     
      func parseInput(input:String) -> Command {
        var commandType:CommandType
        var commandData:String = ""
        
        // Splitting a string
        let tokens = input.characters.split{$0 == " "}.map(String.init)
     
        // guard statement to validate that there are tokens
        guard tokens.count > 0 else {
          return Command(type:CommandType.None, data:"")
        }
     
        switch tokens[0] {
        case "quit":
          commandType = .Quit
        case "from":
          commandType = .SetFrom
          commandData = tokens[1]
        case "to":
          commandType = .SetTo
          commandData = tokens[1]
        default:
          commandType = .Translate
          commandData = input
        }
        return Command(type:commandType,data:commandData)
      }
     
      func doCommand(command:Command) {
        switch command.type {
        case .Quit:
          exit(0)
        case .SetFrom:
          translationCommand.from = command.data
        case .SetTo:
          translationCommand.to   = command.data
        case .Translate:
          translationCommand.text = command.data
          nc.postNotificationName(INPUT_NOTIFICATION, object:nil)   
        case .None:
          break
        }
      }
    }

`CommandInterpreter` 类的实现逻辑非常直观。当 `start` 函数被调用的时候，通过 `NSThread` 来创建一个线程，线程中再通过 block`fgetc` 的回调参数 `stdin` 来获取终端的输入。当遇到换行符 `RETURN`（用户按了回车）后，输入的字符串会被解析并映射成一个 `Command` 对象。然后传递给 `doCommand` 函数进行剩下的处理。

我们的 `doCommand` 函数就是一个简单的 `switch-case` 语句。对于 `.Quit` 命令则就简单调用 `exit(0)` 来终止程序。`.SetFrom` 和 `.SetTo` 命令的功能是显而易见的。当遇到 `.Translate` 命令时，Foundation 的消息系统就派上用场了。`doCommand` 函数自己并不完成任何的翻译功能，它只是简单的*发送*一个应用程序级别的消息，也就是 `InputNotification`。任何监听这个消息的代码都会被调用（比如我们之前的主线程）：

    
    // Listen for events to translate
    nc.addObserverForName(INPUT_NOTIFICATION, object:nil, queue:nil) {
      (_) in
      let tc = translationCommand
      translator.translate(tc.text, from:tc.from, to:tc.to){
        translation, error in
        guard error == nil && translation != nil else {
          print("Translation failure:  \(error!.code)")
          return
        }
        print(translation!)
      }
    }

我在[这篇文章](http://dev.iachieved.it/iachievedit/foundation-on-linux/)中提到，在对 `NSNotification` 的 `userInfo` 字典做类型转换时会有一个 SILGen 的闪退 crash，在这里我们用一个叫做 `translationCommand` 的全局变量来绕过这个 crash。在这段代码里：

1. 为了代码的简洁，把 `translationCommand` 的内容赋值给 `tc`
2. 调用 `Translator` 对象的 `translate` 方法，并传入相关的参数
3. 实现翻译完成后的回调
4. 用一个 Swift 漂亮的 `guard` 语句来检测是否有错并返回
5. 打印出翻译的文本

### Translator

`Translator` 类最开始是在[这篇文章](http://dev.iachieved.it/iachievedit/more-swift-on-linux/)中介绍的，我们在这里直接重用：

    
    import Glibc
    import Foundation
    import CcURL
    import CJSONC
     
    class Translator {
     
      let BUFSIZE = 1024
     
      init() {
      }
     
      func translate(text:String, from:String, to:String,
                            completion:(translation:String?, error:NSError?) -> Void) {
     
        let curl = curl_easy_init()
     
        guard curl != nil else {
          completion(translation:nil,
                     error:NSError(domain:"translator", code:1, userInfo:nil))
          return
        }
     
        let escapedText = curl_easy_escape(curl, text, Int32(strlen(text)))
     
        guard escapedText != nil else {
          completion(translation:nil,
                     error:NSError(domain:"translator", code:2, userInfo:nil))
          return
        }
        
        let langPair = from + "%7c" + to
        let wgetCommand = "wget -qO- http://api.mymemory.translated.net/get\\?q\\=" + String.fromCString(escapedText)! + "\\&langpair\\=" + langPair
        
        let pp      = popen(wgetCommand, "r")
        var buf     = [CChar](count:BUFSIZE, repeatedValue:CChar(0))
        
        var response:String = ""
        while fgets(&buf, Int32(BUFSIZE), pp) != nil {
          response = response + String.fromCString(buf)!
        }
        
        let translation = getTranslatedText(response)
     
        guard translation.error == nil else {
          completion(translation:nil, error:translation.error)
          return
        }
     
        completion(translation:translation.translation, error:nil)
      }
     
      private func getTranslatedText(jsonString:String) -> (error:NSError?, translation:String?) {
     
        let obj = json_tokener_parse(jsonString)
     
        guard obj != nil else {
          return (NSError(domain:"translator", code:3, userInfo:nil),
                 nil)
        }
     
        let responseData = json_object_object_get(obj, "responseData")
     
        guard responseData != nil else {
          return (NSError(domain:"translator", code:3, userInfo:nil),
                  nil)
        }
     
        let translatedTextObj = json_object_object_get(responseData,
                                                       "translatedText")
     
        guard translatedTextObj != nil else {
          return (NSError(domain:"translator", code:3, userInfo:nil),
                  nil)
        }
     
        let translatedTextStr = json_object_get_string(translatedTextObj)
     
        return (nil, String.fromCString(translatedTextStr)!)
               
      }
     
    }

### 整合各个部分

要把上面介绍的组件结合到一起，我们还需要创建额外的两个文件：`globals.swift` 和 `Package.swift`。

`globals.swift`：

    
    import Foundation
     
    let INPUT_NOTIFICATION   = "InputNotification"
    let nc = NSNotificationCenter.defaultCenter()
     
    struct TranslationCommand {
      var from:String
      var to:String
      var text:String
    }
     
    var translationCommand:TranslationCommand = TranslationCommand(from:"en",
                                                                   to:"es",
                                                                   text:"")

`Package.swift`：

    
    import PackageDescription
     
    let package = Package(
      name:  "translator",
      dependencies: [
        .Package(url:  "https://github.com/iachievedit/CJSONC", majorVersion: 1),
        .Package(url:  "https://github.com/PureSwift/CcURL", majorVersion: 1)
      ]
    )

如果一切都配置正确的话，最后执行 `swift build`，一个极具特色的翻译程序就完成了。

	swift build
	Cloning https://github.com/iachievedit/CJSONC
	Using version 1.0.0 of package CJSONC
	Cloning https://github.com/PureSwift/CcURL
	Using version 1.0.0 of package CcURL
	Compiling Swift Module 'translator' (4 sources)
	Linking Executable:  .build/debug/translator
	

如果你打算从现成的代码开始学习，可以从 [Github](https://github.com/iachievedit/moreswift) 上获取本站的代码，然后找到 `cmdline_translator` 目录。

### 试试自己动手

现在的翻译程序还有很多可以优化的地方。下面是一个你可以尝试的列表：

- 接受命令行参数来设置默认的源语言和目标语言
- 接受命令行参数来实现非交互模式
- 添加 `swap` 命令来交换源语言和目标语言
- 添加 `help` 命令
- 整合 `from` 命令和 `to` 命令。实现一行可以同时设置两者， 比如 `from en to es`
- 现在当输入 `from` 命令和 `to` 命令时，没有同时输入对应的语言时会崩溃，修复这个BUG
- 实现对转义符 `\` 的处理，实现程序的“命令”也可以被翻译（比如退出命令：quit）
- 通过 `localizedDescription` 对错误提示添加本地化的支持
- 在 `Translator` 类中实现但有错误发生时，通过 `throws` 来处理异常

### 结束语

我从来不掩饰我是一个狂热的 Swift 爱好者，我坚信它很可能既能像 Perl、Python 和 Ruby 这样语言一样出色的完成运维工作，也能像 C、C++ 和 Java 一样出色的完成系统编程的任务。我知道现在和那些个单文件脚本语言相比，Swift 比较蛋疼的一点就是必须得编译成二进制文件。我真诚的希望这一点能够改善，这样我就能不再关注语言层面的东西而是去做一些新，酷酷的东西。一些朋友已经在 Swift 的邮件列表中讨论这一点，具体可以看[这个帖子](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20151207/000983.html)。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。