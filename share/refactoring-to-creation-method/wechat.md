《重构与模式》 Swift 版之创建方法"

> 作者：Natasha The Robot，[原文链接](https://www.natashatherobot.com/refactoring-to-creation-method/)，原文日期：2016-05-27
> 译者：[Crystal Sun](http://www.jianshu.com/users/7a2d2cc38444/latest_articles)；校对：[Cee](https://github.com/Cee)；定稿：[Channe](undefined)
  









正如上个月在几个会议上我[所讲的那样](https://www.natashatherobot.com/speaking/)，[《重构与模式》](https://book.douban.com/subject/20393327/) 这本书被多次提及，特别是在我喜欢的研讨会上。最终我还是读了一小部分（至少是在 WWDC 大会发布后的疯狂情绪高涨之前），并且我希望能够通过将书中的模式（pattern）记录下来，以供将来参考。我还发现，通过把书中的 Java 代码翻译成 Swift，我能更好地记住这些知识点。



第一个模式就是**创建方法**。

### 重构之前

先假设你有一个 model，比如是借款，并且里面有一些不同的初始化构造器（initializer）。在这个例子中，每个初始化构造器都有存在的理由——每个初始化构造器代表了对应了不同的借款类型：

    
    struct Loan {
        let commitment: NSDecimalNumber
        let riskRating: Float
        let maturity: Int
        let expiry: NSDate?
        let capitalStrategy: String?
        let outstanding: NSDecimalNumber?
        
        init(commitment: NSDecimalNumber, riskRating: Float, maturity: Int, expiry: NSDate?, capitalStrategy: String?, outstanding: NSDecimalNumber?) {
            self.commitment = commitment
            self.riskRating = riskRating
            self.maturity = maturity
            self.expiry = expiry
            self.capitalStrategy = capitalStrategy
            self.outstanding = outstanding
        }
        
        init(commitment: NSDecimalNumber, riskRating: Float, maturity: Int) {
            self.init(commitment: commitment, riskRating: riskRating, maturity: maturity, expiry: nil, capitalStrategy: nil, outstanding: nil)
        }
        
        init(commitment: NSDecimalNumber, riskRating: Float, maturity: Int, expiry: NSDate) {
            self.init(commitment: commitment, riskRating: riskRating, maturity: maturity, expiry: expiry, capitalStrategy: nil, outstanding: nil)
        }
        
        init(commitment: NSDecimalNumber, outstanding: NSDecimalNumber, riskRating: Float, maturity: Int, expiry: NSDate) {
            self.init(commitment: commitment, riskRating: riskRating, maturity: maturity, expiry: expiry, capitalStrategy: nil, outstanding: outstanding)
        }
        
        init(capitalStrategy: String, commitment: NSDecimalNumber, riskRating: Float, maturity: Int, expiry: NSDate) {
            self.init(commitment: commitment, riskRating: riskRating, maturity: maturity, expiry: expiry, capitalStrategy: capitalStrategy, outstanding: nil)
        }
        
        init(capitalStrategy: String, commitment: NSDecimalNumber, outstanding: NSDecimalNumber, riskRating: Float, maturity: Int, expiry: NSDate) {
            self.init(commitment: commitment, riskRating: riskRating, maturity: maturity, expiry: expiry, capitalStrategy: capitalStrategy, outstanding: outstanding)
        }
    }

看看这代码，你会完全没有思路（除非你知道所有的借贷类型），不知道该用哪个初始化构造器。当然了，一些刚刚接触这代码的新人可能还对项目的业务不是很清楚，所以他们可能会用错初始化构造器，甚至会对这些初始化构造器的作用意图感到疑惑。

是时候来重构了！

### 重构之后

用创建方法（Creator Method）重构后的代码如下：

    
    struct Loan {
        let commitment: NSDecimalNumber
        let riskRating: Float
        let maturity: Int
        let expiry: NSDate?
        let capitalStrategy: String?
        let outstanding: NSDecimalNumber?
        
    	 // 原来的初始化构造器（initializer）现在可以是私有的
        private init(commitment: NSDecimalNumber, riskRating: Float, maturity: Int, expiry: NSDate?, capitalStrategy: String?, outstanding: NSDecimalNumber?) {
            self.commitment = commitment
            self.riskRating = riskRating
            self.maturity = maturity
            self.expiry = expiry
            self.capitalStrategy = capitalStrategy
            self.outstanding = outstanding
        }
        
        static func createTermLoan(commitment: NSDecimalNumber, riskRating: Float, maturity: Int) -> Loan {
            return Loan(commitment: commitment, riskRating: riskRating, maturity: maturity, expiry: nil, capitalStrategy: nil, outstanding: nil)
        }
        
        static func createTermLoan(capitalStrategy: String, commitment: NSDecimalNumber, outstanding: NSDecimalNumber, riskRating: Float, maturity: Int, expiry: NSDate) -> Loan {
            return Loan(commitment: commitment, riskRating: riskRating, maturity: maturity, expiry: expiry, capitalStrategy: capitalStrategy, outstanding: outstanding)
        }
        
        static func createRevolverLoan(commitment: NSDecimalNumber, outstanding: NSDecimalNumber, riskRating: Float, maturity: Int, expiry: NSDate) -> Loan {
            return Loan(commitment: commitment, riskRating: riskRating, maturity: maturity, expiry: expiry, capitalStrategy: nil, outstanding: outstanding)
        }
        
        static func createRevolverLoan(capitalStrategy: String, commitment: NSDecimalNumber, riskRating: Float, maturity: Int, expiry: NSDate) -> Loan {
            return Loan(commitment: commitment, riskRating: riskRating, maturity: maturity, expiry: expiry, capitalStrategy: capitalStrategy, outstanding: nil)
        }
        
        static func createRCTL(commitment: NSDecimalNumber, riskRating: Float, maturity: Int, expiry: NSDate) -> Loan {
            return Loan(commitment: commitment, riskRating: riskRating, maturity: maturity, expiry: expiry, capitalStrategy: nil, outstanding: nil)
        }
    }

注意到重构后的代码多么漂亮了吗！当你初始化一个借贷的 model 时，你知道它的作用了。

虽然我一般不会在类里使用这么多的初始化构造器，而且有时在 Swift 中可以根据不同的实际情况使用更好的方法来解决问题（比如使用枚举）。不过如果我想让我的代码更具可读性、变得更加简洁，我一定会考虑重构成这种模式。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。