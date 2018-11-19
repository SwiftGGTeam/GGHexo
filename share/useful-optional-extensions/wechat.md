实用的可选项（Optional）扩展"

> 作者：terhechte，[原文链接](https://appventure.me/2018/01/10/optional-extensions/)，原文日期：2018-01-10
> 译者：[rsenjoyer](https://github.com/rsenjoyer)；校对：[numbbbbb](http://numbbbbb.com/)，[Yousanflics](http://blog.yousanflics.com.cn)；定稿：[Forelax](http://forelax.space)
  









可选值（Optional）是 Swift 语言最基础的内容。我想每个人都同意它带来了巨大的福音，因为它迫使开发者妥善处理边缘情况。可选值的语言特性能让发者在开发阶段发现并处理整个类别的 bug。

然而，Swift 标准库中可选值的 API 相当的有限。如果忽略 `customMirror` 和 `debugDescription` 属性，[Swift 文档](https://developer.apple.com/documentation/swift/optional#topics) 仅仅列出了几个方法/属性：

    
    var unsafelyUnwrapped: Wrapped { get } 
    func map<U>(_ transform: (Wrapped) throws -> U) rethrows -> U? 
    func flatMap<U>(_ transform: (Wrapped) throws -> U?) rethrows -> U?


即使方法如此少，可选值仍然非常有用，这是因为 Swift 在语法上通过 [可选链](https://appventure.me/2014/06/13/swift-optionals-made-simple/)、[模式匹配](https://appventure.me/2015/08/20/swift-pattern-matching-in-detail/)、`if let` 或 `guard let` 等功能来弥补它。但在某些情况下，可选值容易造成多分支条件。有时，一个非常简洁的方法通常允许你用一行代码表达某个概念，而不是用多行组合的 `if let` 语句。

我筛选了 Github 上的 Swift 项目以及 Rust、Scala 或 C＃ 等其他语言的可选实现，目的是为 Optional 找一些有用的补充。以下 14 个可选扩展，我将分类逐一解释，同时给每个类别举几个例子。最后，我将编写一个更复杂的示例，它同时使用多个可选扩展。

## 判空（Emptiness）

    
    extension Optional {
        /// 可选值为空的时候返回 true
        var isNone: Bool {
            switch self {
            case .none:
                return true
            case .some:
                return false
            }
        }
    
        /// 可选值非空返回 true
        var isSome: Bool {
            return !isNone
        }
    }
这是对可选类型最基础的补充。我很喜欢这些补充，因为它们将可选项为空的概念从代码中移除了。在使用的细节上， 使用 `optional.isSome` 比 `if optional == nil` 更简洁明了。

    
    // 使用前
    guard leftButton != nil, rightButton != nil else { fatalError("Missing Interface Builder connections") }
    
    // 使用后
    guard leftButton.isSome, rightButton.isSome else { fatalError("Missing Interface Builder connections") }

## 或（Or）

    
    
    extension Optional {
        /// 返回可选值或默认值
        /// - 参数: 如果可选值为空，将会默认值
        func or(_ default: Wrapped) -> Wrapped {
    	    return self ?? `default`
        }
    
        /// 返回可选值或 `else` 表达式返回的值
        /// 例如. optional.or(else: print("Arrr"))
        func or(else: @autoclosure () -> Wrapped) -> Wrapped {
    	    return self ?? `else`()
        }
    
        /// 返回可选值或者 `else` 闭包返回的值
        // 例如. optional.or(else: { 
        /// ... do a lot of stuff
        /// })
        func or(else: () -> Wrapped) -> Wrapped {
    	    return self ?? `else`()
        }
    
        /// 当可选值不为空时，返回可选值
        /// 如果为空，抛出异常
        func or(throw exception: Error) throws -> Wrapped {
            guard let unwrapped = self else { throw exception }
            return unwrapped
        }
    }
    
    extension Optional where Wrapped == Error {
        /// 当可选值不为空时，执行 `else`
        func or(_ else: (Error) -> Void) {
    	guard let error = self else { return }
    	`else`(error)
        }
    }
`isNone / isSome` 的另一个抽象概念是能够指定当变量不成立的时需要执行的指令。这能让我们避免编写 `if` 或 `guard` 分支，而是将逻辑封装为一个易于理解的方法。

这个概念非常的有用，它可在四个不同功能中被定义。

## 默认值（Default Value）

第一个扩展方法是返回可选值或者默认值：

    
    let optional: Int? = nil
    print(optional.or(10)) // 打印 10

## 默认闭包（Default Closure）

默认闭包和默认值非常的相似，但它允许从闭包中返回默认值。

    
    let optional: Int? = nil
    optional.or(else: secretValue * 32)
由于使用了 `@autoclosure` 参数, 我们实际上使用的是默认闭包。使用默认值将会自动转换为返回值的闭包。然而，我倾向于将两个实现单独分开，因为它可以让用户用更加复杂的逻辑编写闭包。

    
    let cachedUserCount: Int? = nil
    ...
    return cachedUserCount.or(else: {
       let db = database()
       db.prefetch()
       guard db.failures.isEmpty else { return 0 }
       return db.amountOfUsers
    })
当你对一个为空的可选值赋值的时候，使用 `or` 就是一个不错的选择。

    
    if databaseController == nil {
      databaseController = DatabaseController(config: config)
    }
上面的代码可以写的更加优雅: 

    
    databaseController = databaseController.or(DatabaseController(config: config)

## 抛出异常（Throw an error）

这也是一个非常有用的补充，因为它将 Swift 中可选值与错误处理连接起来。根据项目中的代码，方法或函数通过返回一个为空的可选值（例如访问字典中不存在的键）时，抛出错误来表述这一无效的行为。将两者连接起来能够使代码更加清晰：

    
    
    func buildCar() throws -> Car {
      let tires = try machine1.createTires()
      let windows = try machine2.createWindows()
      guard let motor = externalMachine.deliverMotor() else {
        throw MachineError.motor
      }
      let trunk = try machine3.createTrunk()
      if let car = manufacturer.buildCar(tires, windows,  motor, trunk) {
        return car
      } else {
        throw MachineError.manufacturer
      }
    }
在这个例子中，我们通过调用内部及外部代码共同构建汽车对象，外部代码（`external_machine` 和 `manufacturer`）选择使用可选值而不是错误处理。这使得代码变得很复杂，我们可使用 `or(throw:)` 使函数可读性更高。

    
    
    func build_car() throws -> Car {
      let tires = try machine1.createTires()
      let windows = try machine2.createWindows()
      let motor = try externalMachine.deliverMotor().or(throw: MachineError.motor)
      let trunk = try machine3.createTrunk()
      return try manufacturer.buildCar(tires, windows,  motor, trunk).or(throw: MachineError.manufacturer)
    }

## 错误处理（Handling Errors）

当代码中包含 [Stijn Willems 在 Github](https://github.com/doozMen) 自由函数，上面抛出异常部分的代码变更加有用。感谢 Stijn Willems 的建议。

    
    func should(_ do: () throws -> Void) -> Error? {
        do {
    		try `do`()
    		return nil
        } catch let error {
    		return error
        }
    }
这个自由函数（可选的，可将它当做一个可选项的类方法）使用 `do {} catch {}` 块并返回一个错误。当且仅当 `do` 代码块捕捉到异常。以下面 Swift 代码为例：

    
    do {
      try throwingFunction()
    } catch let error {
      print(error)
    }
这是 Swift 中错误处理的基本原则之一，但它不够简单明了。使用上面的提供的函数，你可以使代码变得足够简单。

    
    should { try throwingFunction) }.or(print($0))
我觉得在很多情况下，这样进行错误处理效果更好。

## 变换（Map）

正如上面所见，`map` 和 `flatMap` 是 Swift 标准库在可选项上面提供的的全部方法。然而，在多数情况下，也可以对它们稍微改进使得更加通用。这有两个扩展 `map` 允许定义一个默认值，类似于上面 `or` 的实现方式：

    
    extension Optional {
        /// 可选值变换返回，如果可选值为空，则返回默认值
        /// - 参数 fn: 映射值的闭包
        /// - 参数 default: 可选值为空时，将作为返回值
        func map<T>(_ fn: (Wrapped) throws -> T, default: T) rethrows -> T {
    	    return try map(fn) ?? `default`
        }
    
        /// 可选值变换返回，如果可选值为空，则调用 `else` 闭包
        /// - 参数 fn: 映射值的闭包
        /// - 参数 else: The function to call if the optional is empty
        func map<T>(_ fn: (Wrapped) throws -> T, else: () throws -> T) rethrows -> T {
    	    return try map(fn) ?? `else`()
        }
    }

第一个方法允许你将可选值 `map` 成一个新的类型 `T`. 如果可选值为空，你可以提供一个 `T` 类型的默认值：

    
    let optional1: String? = "appventure"
    let optional2: String? = nil
    
    // 使用前
    print(optional1.map({ $0.count }) ?? 0)
    print(optional2.map({ $0.count }) ?? 0)
    
    // 使用后 
    print(optional1.map({ $0.count }, default: 0)) // prints 10
    print(optional2.map({ $0.count }, default: 0)) // prints 0

这里改动很小，我们再也不需要使用 `??` 操作符，取而代之的是更能表达意图的 `default` 值。

第二个方法也与第一个很相似，主要区别在于它接受（再次）返回 `T` 类型的闭包，而不是使用一个默认值。这里有个简单的例子：

    
    let optional: String? = nil
    print(optional.map({ $0.count }, else: { "default".count })

## 组合可选项（Combining Optionals）

这个类别包含了四个函数，允许你定义多个可选项之间的关系。

    
    extension Optional {
        ///  当可选值不为空时，解包并返回参数 `optional`
        func and<B>(_ optional: B?) -> B? {
    		guard self != nil else { return nil }
    	    return optional
        }
    
        /// 解包可选值，当可选值不为空时，执行 `then` 闭包，并返回执行结果
        /// 允许你将多个可选项连接在一起
        func and<T>(then: (Wrapped) throws -> T?) rethrows -> T? {
    		guard let unwrapped = self else { return nil }
    	    return try then(unwrapped)
        }
    
        /// 将当前可选值与其他可选值组合在一起
        /// 当且仅当两个可选值都不为空时组合成功，否则返回空
        func zip2<A>(with other: Optional<A>) -> (Wrapped, A)? {
    		guard let first = self, let second = other else { return nil }
    	    return (first, second)
        }
    
        /// 将当前可选值与其他可选值组合在一起
        /// 当且仅当三个可选值都不为空时组合成功，否则返回空
        func zip3<A, B>(with other: Optional<A>, another: Optional<B>) -> (Wrapped, A, B)? {
    		guard let first = self,
    	      	let second = other,
    	      	let third = another else { return nil }
    		return (first, second, third)
        }
    }
上面的四个函数都以传入可选值当做参数，最终都返回一个可选值，然而，他们的实现方式完全不同。

## 依赖（Dependencies）

若一个可选值的解包仅作为另一可选值解包的前提，`and<B>(_ optional)` 就显得非常使用：

    
    // 使用前
    if user != nil, let account = userAccount() ...
    
    // 使用后
    if let account = user.and(userAccount()) ...
在上面的例子中，我们对 `user` 的具体内容不感兴趣，但是要求在调用 `userAccount` 函数前保证它非空。虽然这种关系也可以使用 `user != nil`，但我觉得 `and` 使它们的意图更加清晰。

## 链式调用（Chaining）

`and<T>(then:)` 是另一个非常有用的函数, 它将多个可选项链接起来，以便将可选项 `A` 的解包值当做可选项 `B` 的输入。我们从一个简单的例子开始：

    
    protocol UserDatabase {
      func current() -> User?
      func spouse(of user: User) -> User?
      func father(of user: User) -> User?
      func childrenCount(of user: User) -> Int
    }
    
    let database: UserDatabase = ...
    
    // 思考如下关系该如何表达：
    // Man -> Spouse -> Father -> Father -> Spouse -> children
    
    // 使用前
    let childrenCount: Int
    if let user = database.current(), 
       let father1 = database.father(user),
       let father2 = database.father(father1),
       let spouse = database.spouse(father2),
       let children = database.childrenCount(father2) {
      childrenCount = children
    } else {
      childrenCount = 0
    }
    
    // 使用后
    let children = database.current().and(then: { database.spouse($0) })
         .and(then: { database.father($0) })
         .and(then: { database.spouse($0) })
         .and(then: { database.childrenCount($0) })
         .or(0)

使用 `and(then)` 函数对代码有很大的提升。首先，你没必要声明临时变量名（user, father1, father2, spouse, children），其次，代码更加的简洁。而且，使用 `or(0)` 比 `let childrenCount` 可读性更好。

最后，原来的 Swift 代码很容易导致逻辑错误。也许你还没有注意到，但示例中存在一个 bug。在写那样的代码时，就很容易地引入复制粘贴错误。你观察到了么？

是的，`children` 属性应该由调用 `database.childrenCount(spouse)` 创建，但我写成了 `database.childrenCount(father2)`。很难发现这样的错误。使用 `and(then:)` 就容易发现这个错误，因为它使用的是变量 `$0`。

## 组合（Zipping）
这是现有 Swift 概念的另一个扩展，`zip` 可以组合多个可选值，它们一起解包成功或解包失败。在上面的代码片段中，我提供了 `zip2` 与 `zip3` 函数，但你也可以命名为 `zip22`（好吧，也许对合理性和编译速度有一点点影响）。

    
    // 正常示例
    func buildProduct() -> Product? {
      if let var1 = machine1.makeSomething(),
        let var2 = machine2.makeAnotherThing(),
        let var3 = machine3.createThing() {
        return finalMachine.produce(var1, var2, var3)
      } else {
        return nil
      }
    }
    
    // 使用扩展
    func buildProduct() -> Product? {
      return machine1.makeSomething()
         .zip3(machine2.makeAnotherThing(), machine3.createThing())
         .map { finalMachine.produce($0.1, $0.2, $0.3) }
    }
代码量更少，代码更清晰，更优雅。然而，也存一个缺点，就是更复杂了。读者必须了解并理解 `zip` 才能完全掌握它。

## On

    
    extension Optional {
        /// 当可选值不为空时，执行 `some` 闭包
        func on(some: () throws -> Void) rethrows {
    	if self != nil { try some() }
        }
    
        /// 当可选值为空时，执行 `none` 闭包
        func on(none: () throws -> Void) rethrows {
    	if self == nil { try none() }
        }
    }
不论可选值是否为空，上面两个扩展都允许你执行一些额外的操作。与上面讨论过的方法相反，这两个方法忽略可选值。`on(some:)` 会在可选值不为空的时候执行闭包 `some`，但是闭包 `some` 不会获取可选项的值。

    
    /// 如果用户不存在将登出
    self.user.on(none: { AppCoordinator.shared.logout() })
    
    /// 当用户不为空时，连接网络
    self.user.on(some: { AppCoordinator.shared.unlock() })

## Various
    
    extension Optional {
        /// 可选值不为空且可选值满足 `predicate` 条件才返回，否则返回 `nil`
        func filter(_ predicate: (Wrapped) -> Bool) -> Wrapped? {
    		guard let unwrapped = self,
    	    	predicate(unwrapped) else { return nil }
    		return self
        }
    
        /// 可选值不为空时返回，否则 crash
        func expect(_ message: String) -> Wrapped {
            guard let value = self else { fatalError(message) }
            return value
        }
    }
### 过滤（Filter）
这个方法类似于一个守护者一样，只有可选值满足 `predicate` 条件时才进行解包。比如说，我们希望所有的老用户都升级为高级账户，以便与我们保持更长久的联系。

    
    // 仅会影响 id < 1000 的用户
    // 正常写法
    if let aUser = user, user.id < 1000 { aUser.upgradeToPremium() }
    
    // 使用 `filter`
    user.filter({ $0.id < 1000 })?.upgradeToPremium()
在这里，`user.filter` 使用起来更加自然。此外，它的实现类似于 Swift 集合中的功能。

### 期望（Expect）

这是我最喜欢的功能之一。这是我从 `Rush` 语言中借鉴而来的。我试图避免强行解包代码库中的任何东西。类似于隐式解包可选项。

然而，当在项目中使用可视化界面构建 UI 时，下面的这种方式很常见：

    
    func updateLabel() {
      guard let label = valueLabel else {
        fatalError("valueLabel not connected in IB")
      }
      label.text = state.title
    }

显然，另一种方式是强制解包 `label`, 这么做可能会造成应用程序崩溃类似于 `fatalError`。 然而，我必须插入 `!`, 当造成程序崩溃后，`!` 并不能给明确的错误信息。在这里，使用上面实现的 `expect` 函数就是一个更好的选择：

    
    func updateLabel() {
      valueLabel.expect("valueLabel not connected in IB").text = state.title
    }

## 示例（Example）

至此我们已经实现了一系列非常有用的可选项扩展。我将会给出个综合示例，以便更好的了解如何组合使用这些扩展。首先，我们需要先说明一下这个示例，原谅我使用这个不太恰当的例子：

假如你是为 80 年代的软件商工作。每个月都有很多的人为你编写应用软件和游戏。你需要追踪销售量，你从会计那里收到一个 XML 文件，你需要进行解析并将结果存入到数据库中（如果在 80 年代就有 Swift 语言 以及 XML，这将是多么奇妙）。你的软件系统有一个XML解析器和一个数据库（当然都是用6502 ASM编写的），它们实现了以下协议：

    
    protocol XMLImportNode {
        func firstChild(with tag: String) -> XMLImportNode?
        func children(with tag: String) -> [XMLImportNode]
        func attribute(with name: String) -> String?
    }
    
    typealias DatabaseUser = String
    typealias DatabaseSoftware = String
    protocol Database {
        func user(for id: String) throws -> DatabaseUser
        func software(for id: String) throws -> DatabaseSoftware
        func insertSoftware(user: DatabaseUser, name: String, id: String, type: String, amount: Int) throws
        func updateSoftware(software: DatabaseSoftware, amount: Int) throws
    }
XML 文件可能看起来像这样：

    xml
    <users>
     <user name="" id="158">
      <software>
       <package type="game" name="Maniac Mansion" id="4332" amount="30" />
       <package type="game" name="Doom" id="1337" amount="50" />
       <package type="game" name="Warcraft 2" id="1000" amount="10" />
      </software>
     </user>
    </users>
解析 XML 的代码如下：

    
    enum ParseError: Error {
        case msg(String)
    }
    
    func parseGamesFromXML(from root: XMLImportNode, into database: Database) throws {
        guard let users = root.firstChild(with: "users")?.children(with: "user") else {
    	throw ParseError.msg("No Users")
        }
        for user in users {
    	guard let software = user.firstChild(with: "software")?
    		.children(with: "package"),
    	    let userId = user.attribute(with: "id"),
    	    let dbUser = try? database.user(for: userId)
    	    else { throw ParseError.msg("Invalid User") }
    	for package in software {
    	    guard let type = package.attribute(with: "type"),
    	    type == "game",
    	    let name = package.attribute(with: "name"),
    	    let softwareId = package.attribute(with: "id"),
    	    let amountString = package.attribute(with: "amount")
    	    else { throw ParseError.msg("Invalid Package") }
    	    if let existing = try? database.software(for: softwareId) {
    		try database.updateSoftware(software: existing, 
    					      amount: Int(amountString) ?? 0)
    	    } else {
    		try database.insertSoftware(user: dbUser, name: name, 
    					      id: softwareId, 
    					    type: type, 
    					  amount: Int(amountString) ?? 0)
    	    }
    	}
        }
    }
让我们运用下上面学到的内容：

    
    func parseGamesFromXML(from root: XMLImportNode, into database: Database) throws {
        for user in try root.firstChild(with: "users")
    		    .or(throw: ParseError.msg("No Users")).children(with: "user") {
    	let dbUser = try user.attribute(with: "id")
    		    .and(then: { try? database.user(for: $0) })
    		    .or(throw: ParseError.msg("Invalid User"))
    	for package in (user.firstChild(with: "software")?
    		    .children(with: "package")).or([]) {
    	    guard (package.attribute(with: "type")).filter({ $0 == "game" }).isSome
    		else { continue }
    	    try package.attribute(with: "name")
    		.zip3(with: package.attribute(with: "id"), 
    		   another: package.attribute(with: "amount"))
    		.map({ (tuple) -> Void in
    		    switch try? database.software(for: tuple.1) {
    		    case let e?: try database.updateSoftware(software: e, 
    							       amount: Int(tuple.2).or(0))
    		    default: try database.insertSoftware(user: dbUser, name: tuple.0, 
    							   id: tuple.1, type: "game", 
    						       amount: Int(tuple.2).or(0))
    		    }
    		}, or: { throw ParseError.msg("Invalid Package") })
    	}
        }
    }
如果我们对比下，至少会有两点映入眼帘：

1. 代码量更少
2. 代码看起来更复杂了


在组合使用可选扩展时，我故意造成一种过载状态。其中的一部分使用很恰当，但是另一部分却不那么合适。然而，使用扩展的关键不在于过度依赖（正如我上面做的那样），而在于这些扩展是否使语义更加清晰明了。比较上面的两个实现方式，
在第二个实现中，考虑下是使用 Swift 本身提供的功能好还是使用可选扩展更佳。

这就是本文的全部内容，感谢阅读！
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。