在 Swift 结构体中使用 Mutating 函数的最佳时机"

> 作者：NatashaTheRobot，[原文链接](https://www.natashatherobot.com/when-to-use-mutating-functions-in-swift-structs/)，原文日期：2016-1-13
> 译者：[walkingway](http://chengway.in/)；校对：[Cee](https://github.com/Cee)；定稿：[numbbbbb](http://numbbbbb.com/)
  









我认为关于 Swift 最棒的一个特性就是：在这门语言构建的工程中可以使用大量的不可变对象。这种特性使我们的代码更加清晰，也更加安全（如果你还对此存疑，强烈推荐观看这篇[演讲](https://realm.io/news/andy-matuschak-controlling-complexity/)）。

但当我们真正需要去改变数据时，又该怎么处理呢？


### 函数方式

举个例子，假如有一个井字棋的游戏棋盘，我需要修改棋盘上各个点的状态：

    
    struct Position {
        let coordinate: Coordinate
        let state: State
        
        enum State: Int {
            case X, O, Empty
        }
    }
     
    struct Board {
        
        let positions: [Position]
     
        // 需要添加一个函数来更新位置
        // 从空棋盘到 X 或 O 
    }

我们采取[函数式编程](https://www.natashatherobot.com/functional-programming-in-swift/)的方式，可以很轻松地得到一个新棋盘！

    
    struct Board {
        
        let positionsMatrix: [[Position]]
        
        init() {
           // 初始化一个初始棋盘
        }
     
        // 函数式的实现方式
        func boardWithNewPosition(position: Position) -> Board {
            var positions = positionsMatrix
            let row = position.coordinate.row.rawValue
            let column = position.coordinate.column.rawValue
            positions[row][column] = position
            return Board(positionsMatrix: positions)
        }
    }

我更喜欢函数式编程是因为这种方式没有副作用，将变量统统改为常量，测试起来也是相当容易！

    
    class BoardTests: XCTestCase {
     
        func testBoardWithNewPosition() {
            let board = Board()
            let coordinate = Coordinate(row: .Middle, column: .Middle)
            
            let initialPosition = board[coordinate]
            XCTAssertEqual(initialPosition.state, Position.State.Empty)
            
            let newPosition = Position(coordinate: coordinate, state: .X)
            let newBoard = board.boardWithNewPosition(newPosition)
            XCTAssertEqual(newBoard[coordinate], newPosition)
        }
    }

但是，我们还有更好的解决方案！

### 使用 Mutating 关键字

让我们来跟踪一下每个用户下井字棋获胜的次数，首先创建一个计数器：

    
    struct Counter {
        let count: Int
        
        init(count: Int = 0) {
            self.count = count
        }
        
        // 需要一个方法来增加计数
    }

当然，我们也可以通过函数式编程的方式来实现这个计数器：

    
    struct Counter {
        let count: Int
        
        init(count: Int = 0) {
            self.count = count
        }
        
        // 函数式的实现方式
        func counterByIncrementing() -> Counter {
            let newCount = count + 1
            return Counter(count: newCount)
        }
    }

如果你尝试去实现此函数，应该这样写：

    
    var counter = Counter()
    counter = counter.counterByIncrementing()

最终你会发现相当**晦涩难懂**！所以这里我更推荐使用 `mutating` 关键字而不是函数式编程：

    
    struct Counter {
        // 现在这个 count 改为变量了 :/
        var count: Int
        
        init(count: Int = 0) {
            self.count = count
        }
        
        // 使用 mutating 关键字来实现修改 count 
        mutating func increment() {
            count += 1
        }
    }

虽然我不喜欢 `increment` 函数中的副作用，但为了更好的可读性，这点牺牲是值得的。

    
    var counter = Counter()
    counter.increment()

让我们再进一步，通过使用 [private setter](https://www.natashatherobot.com/swift-magic-public-getter-private-setter/) 阻止了从外部修改 count 变量，从而将潜在危险降到最低：

    
    struct Counter {
        // 将 setter 方法设为私有, 
        // 这样只有 increment 函数能够修改它!
        private(set) var count: Int
        
        init(count: Int = 0) {
            self.count = count
        }
        
        // 使用 mutating 关键字来实现修改 count 
        mutating func increment() {
            count += 1
        }
    }

### 结论

当我面临要选择 `mutating` 关键字还是函数式编程时，通常我都会选择函数式编程，但这一些都是有前提的，那就是：**不能牺牲可读性**！

为你的接口编写测试是一种很好的习惯，可以用来检验你的函数方法是否满足预期。如果你觉得接口写起来很怪异、不直观，那就去换一种方式去实现吧！最后别忘了用私有 `setter` 设置你的内部变量哦！
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。