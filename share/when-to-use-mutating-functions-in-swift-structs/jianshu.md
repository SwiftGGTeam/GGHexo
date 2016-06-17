Swift 结构体何时使用变异函数"

> 作者：Natasha，[原文链接](https://www.natashatherobot.com/when-to-use-mutating-functions-in-swift-structs/)，原文日期：2016/01/13
> 译者：[bestswifter](http://bestswifter.com)；校对：[saitjr](http://www.saitjr.com)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  









Swift 最棒的特点之一就是它内置了对整体结构的不可变性的支持，这使得我们的代码更加整洁、安全（关于这个话题，如果还没看过[这篇文章](https://realm.io/news/andy-matuschak-controlling-complexity/)，那么强烈推荐给你）。

不过，真的需要用到可变性时，你应该怎么做呢？



## 函数式做法

举个例子，我有一个井字棋棋盘，现在需要改变棋盘上某个位置的状态：

    
    struct Position {
        let coordinate: Coordinate
        let state: State
        
        enum State: Int {
            case X, O, Empty
        }
    }
    
    struct Board {
        
        let positions: [Position]
    
        // 需要添加一个函数来更新这个位置的状态
        // 状态从 Empty 改为 X 或者 0
    }

如果完全采用[函数式编程的做法](https://www.natashatherobot.com/functional-programming-in-swift/)，你只需要简单的返回一个新的棋盘即可：

    
    struct Board {
        
        let positionsMatrix: [[Position]]
        
        init() {
           // 初始化一个空棋盘的逻辑
        }
    
        // 函数式编程的做法
        func boardWithNewPosition(position: Position) -> Board {
            var positions = positionsMatrix
            let row = position.coordinate.row.rawValue
            let column = position.coordinate.column.rawValue
            positions[row][column] = position
            return Board(positionsMatrix: positions)
        }
    }

我更倾向于使用这种函数式的做法，因为它不会有任何副作用。变量可以继续保持不可变状态，当然，这样也非常易于测试！

    
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

不过这种做法并非在所有场景下都是最佳选择。

## 使用 Mutating 关键字

假设我需要统计每个用户赢了多少局井字棋，那么我创建了一个 Counter：

    
    struct Counter {
        let count: Int
        
        init(count: Int = 0) {
            self.count = count
        }
        
        // 需要实现一个增加计数的方法
    }

我依然可以选择函数式的做法：

    
    struct Counter {
        let count: Int
        
        init(count: Int = 0) {
            self.count = count
        }
        
        // 函数式做法
        func counterByIncrementing() -> Counter {
            let newCount = count + 1
            return Counter(count: newCount)
        }
    }

不过，如果你真的尝试了使用这个函数来增加计数，代码会是这样：

    
    var counter = Counter()
    counter = counter.counterByIncrementing()

这种写法不够直观，可读性也不高。所以在这种场景下，我更倾向于使用 `mutating` 关键字：

    
    struct Counter {
        // 这个变量现在得声明成 var
        var count: Int
        
        init(count: Int = 0) {
            self.count = count
        }
        
        // 使用 mutating 关键字的做法
        mutating func increment() {
            count += 1
        }
    }

我不喜欢这个函数带来的副作用，但是相对于可读性的提升而言，这样做是值得的：

    
    var counter = Counter()
    counter.increment()

更进一步来说，通过[使用私有 setter 方法](https://www.natashatherobot.com/swift-magic-public-getter-private-setter/)可以确保 `count` 变量不会被外部修改（因为它现在被声明为变量了）。这样，使用变异方法和变量所带来的负面影响可以被降到最低。

## 总结

在选择使用 `mutating` 关键字和函数式编程时，我倾向于后者，但前提是**不会以牺牲可读性为代价**。

写测试是一种很好的检查接口的方法，它可以判断你的函数式编程是否真的有意义。如果你觉得代码比较奇怪而且不够直观，那么就换成 mutating 方法吧。只要记得使用变量的私有 setter 方法就行了。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。数方法是否满足预期。如果你觉得接口写起来很怪异、不直观，那就去换一种方式去实现吧！最后别忘了用私有 `setter` 设置你的内部变量哦！
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。