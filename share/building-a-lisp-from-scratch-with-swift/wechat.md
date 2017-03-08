使用 Swift 从头构建 LISP 解释器"

> 作者：uraimo，[原文链接](https://www.uraimo.com/2017/02/05/building-a-lisp-from-scratch-with-swift/)，原文日期：2017-02-05
> 译者：[pmst](http://www.jianshu.com/users/596f2ba91ce9/latest_articles)；校对：[Yake](http://blog.csdn.net/yake_099)；定稿：[CMB](https://github.com/chenmingbiao)
    









有人建议我写一个小型语言解释器，如果是 LISP 那就更完美了。作为一名程序员，这是你职业生涯必须经历的事情之一，也是一次让你大开眼界的经历：你会对日常工作中的工具产生新的见解，那些令人望而生畏的概念也会被慢慢掀开神秘的面纱。

本文中，我们基于 1978 年 John McCarthy 发表的 [A Micro-Manual For Lisp - Not The Whole Thruth](https://www.uraimo.com/files/MicroManual-LISP.pdf)  文章，实现一个小型 LISP 解释器，麻雀虽小但五脏俱全，这里主要利用 Swift 框架来对一些包含 LISP 符号表达式的字符串解释。

我们最终会使用解释器来构建一个简单的 REPL (Read-Eval-Print-Loop) 程序，它将交互地执行语句并打印出求值结果。我们还实现了探究解释器的一个 Playground 。

本文将手把手教你直至完成属于你的 LISP 解释器，这将是一次难忘的周末计划。选择跟着一起实现或只是阅读介绍取决于你的心情，当然你也可以参考本文的实现，构建你独有的解释器。

下图显示了我们将要建造的总体设计：
![](https://www.uraimo.com/imgs/lisp.png)



第一个功能块( 读取阶段 Read Phase)的作用是读取一些包含代码的文本，并在后续两个阶段过程中通过输入程序的内部表示将文本生成一个语法树。

第一阶段，词法分析程序（Lexer）将输入文本分离成词法单元 Token（从文本的角度来说，就是程序的构建块），接着语法剖析程式（Parser）接受这些词法单元生成一个[抽象语法树(Abstract Syntax Tree AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree)，也就是源代码的分层表示。

一旦有了抽象语法树，我们就能够对表达式求值，然后打印输出到用户的屏幕上。

> 文本介绍的解释器封装库和 playground 测试代码已经上传到 [GitHub](https://github.com/uraimo/SwiftyLISP)。


**目录：**
* [LISP Basics](https://www.uraimo.com/2017/02/05/building-a-lisp-from-scratch-with-swift/#lisp-basics)
* [Building the interpreter](https://www.uraimo.com/2017/02/05/building-a-lisp-from-scratch-with-swift/#building-the-interpreter)
* [Lexer and Parser](https://www.uraimo.com/2017/02/05/building-a-lisp-from-scratch-with-swift/#lexer-and-parser)
* [Evaluation and Default Global Environment](https://www.uraimo.com/2017/02/05/building-a-lisp-from-scratch-with-swift/#evaluation-and-default-global-environment)
* [SwiftyLisp REPL](https://www.uraimo.com/2017/02/05/building-a-lisp-from-scratch-with-swift/#swiftylisp-repl)
* [Conclusion](https://www.uraimo.com/2017/02/05/building-a-lisp-from-scratch-with-swift/#conclusion)

## LISP 基础知识

让我们简要回顾下将要实现的 LISP 解释器基础知识，McCarthy 的[文章](https://www.uraimo.com/files/MicroManual-LISP.pdf)基本涵盖了该语言所有的定义。

首先，如果你不熟悉 LISP，首字母缩略词源自 LISt 处理程序，这是描述 LISP 家族语言一个很好的方式。它们的基本数据结构是列表，之后你的程序也将基于列表执行操作。

你应该已经猜到我为何使用"家族"这一术语，McCarthy 定义的 LISP 当前存在很多变种或方言，从传统语言如 Racket 到 Clojure 之类的语言，它们建立在不同技术之上（Java虚拟机以及 Java 的 runtime)，并且能够通过其不同的范例使用 LISP 提供的功能来扩展底层平台。

这里我们要实现的是一个最小的 LISP 解释器，它包含了一些有用的基本元素。

LISP 解释器其实就是对那些以[符号表达式](https://en.wikipedia.org/wiki/S-expression)递归数据结构的一个评估程序，呈现形式有原子和列表(Atom & List)。原子是一些简单的字母数字字符，具有不同的含义，而列表（也称为复合形式）是其他符号表达式的序列，以括号形式表示一个值序列。

LISP 中还有另外一种形式存在，这种特殊的形式有别于其他的符号表达式，区别在于对子表达式的求值规则不同。

为了表示程序将要处理的数据，我们将再次使用相同的符号表达式数据类型，最后使用相同的数据结构来表示源代码和所使用的数据。

但是什么是抽象语法树呢？语法上有效的程序包括一系列的符号表达式，即一系列嵌套列表，所以当源代码转换为抽象语法树，我们将再次使用一个能够存储列表的数据结构来建模我们的程序。

像 LISP 这样的语言，文本表示（通常指源代码）与其抽象语法树具有相同的结构，称之为[同像性](https://zh.wikipedia.org/wiki/同像性)(homoiconic)，它是元编程的基本特性之一，程序具有以相同语言修改本身或其他程序的能力，较之非同像性语言(大多数你知道，包括 Swift )要简单的多。你可以在运行时将代码当作数据来修改或者变换，而不使用复杂的机制。

如果你整篇阅读了 McCarthy 的文章，会发现可以让 LISP 自解释构建一个 LISP 解释器，称之为“Meta Circular Evaluator”，就只是几行代码而已。我们即将建立的 Swift 解释器将完成同样的事情，递归地评估这些符号表达式，并产生另一个符号表达式作为结果。

让我们看一个使用符号表达式表达的 LISP 例程：

    
    (COUNT (QUOTE (A B C) ) 42)

上述例程中，`COUNT`，`QUOTE`，`A`，`B`，`C`，`42` 都是原子（暂时忽略它们的意义），每个括号中的序列是一个列表。注意列表如何包含任何类型的符号表达式，甚至包括子列表。

我们的解释器如何对这些表达式求值呢？

评估这个表达式将使用称之为 [polish notation](https://en.wikipedia.org/wiki/Polish_notation) 的表达式，其中每个列表将被视为一个操作，随后是其需要应用的操作数，例如对两个数求和可以用 `(+ 1 2)` 表示。

上面例程中，操作者/函数 `COUNT` 将被应用到操作数/参数 `(QUOTE (A B C))` 和 `42`。

你一定注意到在我们的语言定义中，原子是没有类型的，我们只有单一类型的原子，而常见类型如整数、布尔值和字符串是不可用的。LISP 没有 Swift 语言中复杂的类型系统。

手册定义了一系列执行基本操作的原子，并描述了一旦包含它们的列表所产生的值。在下表中，e 将表示通用的符号表达式，而 L 表示列表。

| **原子** | **使用形式**                         | **描述**                                   |
| ------ | -------------------------------- | ---------------------------------------- |
| Quote  | (quote e1)                       | 返回子表达式，例如(quote A) = A                   |
| Car    | (car l)                          | 返回第一个非空自列表，例如 (car (quote (A B C))) = A  |
| Cdr    | (cdr l)                          | 返回除去第一个元素后，所有剩余元素构成的子列表，例如(cdr (quote (A B C))) = (B C) |
| Cons   | (cons e l)                       | 组合第一个元素和子列表中的元素成一个新列表，例如 (cons (quote A) (quote (B C))) = (A B C) |
| Equal  | (equal e1 e2)                    | 如果两个符号表达式递归相等，则返回一个名为 true 的原子，如果它们不为空，则返回空的 list()（同时用作 nil 和 false 值）。例如： (equal (car (quote (A B))) = (quote A)) |
| Atom   | (atom e)                         | 如果符号表达式是原子或空列表（如果它是一个列表），则返回 true。(atom A)= true |
| Cond   | (cond (p1 e1) (p2 e2) … (pn en)) | p 条件表达式不等于空列表则返回其第一个 e 表达式。 `cond` 可以构造一些语法稍微复杂的条件表达式。 例如  (cond ((atom (quote A)) (quote B)) ((quote true) (quote C) = B |
| List   | (list e1 e2 … en)                | 返回所有给定表达式的列表，与将递归应用于表达式序列相同。             |

上述包含了评估这些表达式的规则集。

如果仔细观察，你会注意到 `cond `与其他的有些不同，因为它根据它包含的子列表有条件地评估它的主体。 这是我们第一个特殊形式的例子，我们将在实现评估器时特别注意这个细节。

现在让我们看看这些操作符的另一类，即能够定义函数的操作符:


| **原子** | **使用形式**                        | **描述**                                   |
| ------ | ------------------------------- | ---------------------------------------- |
| Lambda | ( (lambda (v1 … vn) e) p1 … pn) | 定义具有主体e的lambda表达式，描述使用一系列环境变量的匿名函数v。将使用提供的参数作为变量的值来评估此函数。 例如  `(cond ((atom (quote A)) (quote B)) ((quote true) (quote C) = B` |
| Defun  | (defun (v1 ... vn) e)           | 定义 lambda 表达式并将其注册在当前上下文中，以便在需要时使用。 我们可以像这样 `(defun cadr (X) (car (cdr x)))`定义一个函数，然后在另一个表达式中调用它：`(cadr (quote (A B C D)))`. |

McCarthy 的论文描述了一个额外的操作，可以用来定义局部标记 lambda 表达式，但我们不会实现它，当我们需要类似的东西，会使用 _defun_ 替代。

## 构建解释器

现在我们简单过完一遍论文的内容了，是时候开始讨论解释器的实现了。

在本节中，我们会对组成解释器的每个功能模块进行详细的分析，完整代码请前往 [Gitbub](https://github.com/uraimo/SwiftyLISP) 仓库地址下载。

第一个需要思考的问题是：符号表达式是如何在内部解释中呈现的，又是如何定义结构化的抽象语法树。这是一个重要的方面，因为良好的结构简化了计算过程。

### 为符号表达式创建模型

最显而易见的方式是使用递归枚举为符号表达式创建模型：

    
    public enum SExpr{
        case Atom(String)
        case List([SExpr])
    }

一般情况下声明递归的枚举需要加上 `indirect` 关键字，但是在本例中， `List` 的关联值(数组类型)扮演着一个容器角色，因此无须添加该关键字。这个枚举定义已经能满足我们对符号表达式定义的要求。

现在让我们为这个枚举添加一些其他的东西，我们需要理解两个表达式怎么算相等，以及一个打印方法。为了达到这两个目的，我们需要实现 `Equatable` 和 `CustomStringConvertible`两个协议。

    
    extension SExpr : Equatable {
        public static func ==(lhs: SExpr, rhs: SExpr) -> Bool{
            switch(lhs,rhs){
            case let (.Atom(l),.Atom(r)):
                return l==r
            case let (.List(l),.List(r)):
                guard l.count == r.count else {return false}
                for (idx,el) in l.enumerated() {
                    if el != r[idx] {
                        return false
                    }
                }
                return true
            default:
                return false
            }
        }
    }
    
    extension SExpr : CustomStringConvertible{
        public var description: String {
            switch self{
            case let .Atom(value):
                return "\(value) "
            case let .List(subxexprs):
                var res = "("
                for expr in subxexprs{
                    res += "\(expr) "
                }
                res += ")"
                return res
            }
        }
    }

这两个函数递归遍历符号表达式结构，触发对自己的调用（使用等式运算符或将 `SExpr` 转换为字符串）来发挥他们的作用。

现在请回忆下之前定义的数据结构，然后思考 RERL 图中的每个组件应该如何实现。

![](https://www.uraimo.com/imgs/lisp.png)

### 词法分析器和语法分析器

在 _Read_ 阶段，将源代码翻译为抽象语法树过程可分为两个阶段，每个过程由专门的组件负责：词法分析器 _Lexer_ 和语法分析器 _Parser_。

词法分析器或分词器的主要职责是对包含源代码的文本输入块进行[词法分析](https://en.wikipedia.org/wiki/Lexical_analysis)。

词法分析器能够考虑上下文，将一系列字符分解成具有意义的 _lexeme_ 或 _token_ 。Token 可以是语言关键字，如`if`，运算符 `=` 或各种标识符（例如变量名）和字面量。

由于我们的语言的[词法语法](https://en.wikipedia.org/wiki/Lexical_grammar)，有效标记的定义是非常简单的，词法分析器/分词器也是如此。 Lexer 将只识别由空格或括号分隔的字符串标记。

让我们向 SExpr 添加一个 `read()` 方法来将字符串转换为我们的枚举表达式，并开始讨论分词阶段的处理方式。

    
    extension SExpr {
        
        /**
         读取 LISP 字符串表达式并将其转换为具有层级结构的 S-Expression
         */
        public static func read(_ sexpr:String) -> SExpr{
            
            enum Token{
                case pOpen,pClose,textBlock(String)
            }
            
            /**
             将字符串分解为一系列词法单元
             
             - Parameter sexpr: 字符串类型的表达式
             - Returns: 词法单元数组
             */
            func tokenize(_ sexpr:String) -> [Token] {
                var res = [Token]()
                var tmpText = ""
                
                for c in sexpr.characters {
                    switch c {
                    case "(":
                        if tmpText != "" {
                            res.append(.textBlock(tmpText))
                            tmpText = ""
                        }
                        res.append(.pOpen)
                    case ")":
                        if tmpText != "" {
                            res.append(.textBlock(tmpText))
                            tmpText = ""
                        }
                        res.append(.pClose)
                    case " ":
                        if tmpText != "" {
                            res.append(.textBlock(tmpText))
                            tmpText = ""
                        }
                    default:
                        tmpText.append(c)
                    }
                }
                return res
            }      
            
            // 语法解析代码预留
            // ...
            
            // 读取阶段: tokenize -> parse -> result
            let tokens = tokenize(sexpr)
            let res = parse(tokens)
            return res.subexpr ?? .List([])  
        }
    
    }

`tokenize` 方法将遍历输入字符串的所有字符，将不透明（从语法的角度）字符串转换为 `Token` 枚举中定义的一系列值。 可能的值是：_pOpen_（用于开括号），_pClose_（用于右括号）和 _textBlock_（用于每个其他字符串，表示一个原子）。 一切都很直接，因为没有特殊的规则能够造成内容读取无效。

下一阶段依靠[语法分析器](https://en.wikipedia.org/wiki/Parsing#Computer_languages)执行。

语法分析器的目的是将一系列 `token` 转换为抽象语法树形式表示我们的源代码，有利于检查语法错误，并且易于评估（如果我们正在构建一个编译器而不是解释器，则可以加入优化和编译模块）。

我们将实现一个非常简单的[ Top-down 语法解析器](https://en.wikipedia.org/wiki/Top-down_parsing)，它将提取 `token` 数组按照自然语序构建抽象语法树。如果你计划构建一个语法更复杂的分析器，可能需要参考一些更复杂的，如[向下递归解析器(易上手)](https://en.wikipedia.org/wiki/Recursive_descent_parser) 或 [LL Parser](https://en.wikipedia.org/wiki/LL_parser)。

但是对于具有复杂语法的语言，语法分析器通常使用解析器生成器（例如 ANTLR，最近引入了对 Swift 的支持）生成，因此你必须在 DSL 中描述语法，而不是手动编写解析器。

语法分析器肯定会比词法分析器更复杂，但是，由于这种语言很简单，它将是一个非常小而简单的分析器。

    
    extension SExpr {
        
        /**
         Read a LISP string and convert it to a hierarchical S-Expression
         */
        public static func read(_ sexpr:String) -> SExpr{
            
            // Tokenizer
            // ...
            
            func appendTo(list: SExpr?, node:SExpr) -> SExpr {
                var list = list
                
                if list != nil, case var .List(elements) = list! {
                    elements.append(node)
                    list = .List(elements)
                }else{
                    list = node
                }
                return list!
            }  
    
            /**
             Parses a series of tokens to obtain a hierachical S-Expression
             
             - Parameter tokens: Tokens to parse
             - Parameter node: Parent S-Expression if available
             
             - Returns: Tuple with remaning tokens and resulting S-Expression
             */
            func parse(_ tokens: [Token], node: SExpr? = nil) -> (remaining:[Token], subexpr:SExpr?) {
                var tokens = tokens
                var node = node
                
                var i = 0
                repeat {
                    let t = tokens[i]
                    
                    switch t {
                    case .pOpen:
                        //new sexpr
                        let (tr,n) = parse( Array(tokens[(i+1)..<tokens.count]), node: .List([]))
                        assert(n != nil) //Cannot be nil
                        
                        (tokens, i) = (tr, 0)
                        node = appendTo(list: node, node: n!)
                        
                        if tokens.count != 0 {
                            continue
                        }else{
                            break
                        }
                    case .pClose:
                        //close sexpr
                        return (Array(tokens[(i+1)..<tokens.count]), node)
                    case let .textBlock(value):
                        node = appendTo(list: node, node: .Atom(value))
                    }
                    
                    i += 1
                }while(tokens.count > 0)
                
                return ([],node)
            }
            
            let tokens = tokenize(sexpr)
            let res = parse(tokens)
            return res.subexpr ?? .List([])
        }
    }
词法分析器使用 `.pOpen` 和 `.pClose` 将列表分割成 `token` 元素,`parse(tokens：node :)` 方法进行遍历并将每个其他 `token` 转换为原子。

注意，递归地执行解析，每个嵌套调用接收 `token` 数组等待解析，并且父列表将包含在下一递归步骤期间解析的值（从根表达式的 _nil_ 开始）。 当执行到右括号时，列表被认为是完整的，并且将解析的剩余 `token` 一起返回给调用者。

在这些函数之后，你可以看到 `read()` 方法的实际主体，它执行这一系列中的每个步骤并返回顶层形式或在错误情况下返回一个空列表（我们在上一节中看到的两者都返回 false）。

    
            let tokens = tokenize(sexpr)
            let res = parse(tokens)
            return res.subexpr ?? .List([])
        }
    }

现在我们有一个可用的 Read 模块，让我们添加一些东西到 `SExpr` 枚举中，这将允许我们直接从字符串字面量获得一个表达式，而不通过实现 `ExpressibleByStringLiteral` 协议手动调用 `read（）`方法：

    
    extension SExpr : ExpressibleByStringLiteral,
                      ExpressibleByUnicodeScalarLiteral,
                      ExpressibleByExtendedGraphemeClusterLiteral {
        
        public init(stringLiteral value: String){
            self = SExpr.read(value)
        }
        
        public init(extendedGraphemeClusterLiteral value: String){
            self.init(stringLiteral: value)
        }
        
        public init(unicodeScalarLiteral value: String){
            self.init(stringLiteral: value)
        }
        
    }
这样我们就可以直接从字符串中读取程序：

    
    let expr: SExpr = "(cond ((atom (quote A)) (quote B)) ((quote true) (quote C)))"
    
    print(expr)
    print(expr.eval()!)  //B

### 评估和默认全局环境

评估阶段将比我们目前所看到的更复杂，`eval()` 函数将递归地评估抽象语法树，并返回符号表达式求值结果。

首先，让我们总结下所有这门语言所定义的基本操作符，它们被定义在一个名为 `defaultEnvironment` 的私有字典中，它将关联到每个操作符原子，由 `(SExpr, [SExpr]?, [SExpr]?)->SExpr` 类型的函数来实现它。

这些函数将使用包含原始列表（函数名和参数）的 `SExpr` 参数，计算并返回一个 `SExpr` 作为结果。 这两个可选数组作为第二和第三个参数将包含一个变量列表及其值，并将用于通过 `defun` 和 `lamdba` 定义用户定义的函数，在所有其他情况下，它们将只是 `nil`。 当我们看到这些操作符时我们再回头看。

为了跟踪基本内置操作符，`Builtin` 枚举已经用一个函数声明，该函数标识哪些操作符不需要子表达式求值。像 `quote`（存在唯一的目的是禁用子表达式求值）这种操作符属于特殊形式，其他还有 `cond` 或 `lambda` 定义运算符，将在内部处理子表达式的求值。

    
    /// Basic builtins
    fileprivate enum Builtins:String{
        case quote,car,cdr,cons,equal,atom,cond,lambda,defun,list,
             println,eval
        
        /**
         True if the given parameter stop evaluation of sub-expressions.
         Sub expressions will be evaluated lazily by the operator.
         
         - Parameter atom: Stringified atom
         - Returns: True if the atom is the quote operator
         */
        public static func mustSkip(_ atom: String) -> Bool {
            return  (atom == Builtins.quote.rawValue) ||
                    (atom == Builtins.cond.rawValue) ||
                    (atom == Builtins.defun.rawValue) ||
                    (atom == Builtins.lambda.rawValue)
        }
    }

所有 `defaultEnvironment` 函数都以简单的检查开始，以验证是否已提供最小数量的参数，然后继续构建返回结果。

让我们来看看其中的一些，完整项目的工程你可以看[这里](https://github.com/uraimo/SwiftyLISP)。

    
    /// Global default builtin functions environment
    ///
    /// Contains definitions for: quote,car,cdr,cons,equal,atom,cond,lambda,label,defun.
    private var defaultEnvironment: [String: (SExpr, [SExpr]?, [SExpr]?)->SExpr] = {
        
        var env = [String: (SExpr, [SExpr]?, [SExpr]?)->SExpr]()
    
        env[Builtins.quote.rawValue] = { params,locals,values in
            guard case let .List(parameters) = params, parameters.count == 2 else {return .List([])}
            return parameters[1]
        }
        env[Builtins.cdr.rawValue] = { params,locals,values in
            guard case let .List(parameters) = params, parameters.count == 2 else {return .List([])}
            
            guard case let .List(elements) = parameters[1], elements.count > 1 else {return .List([])}
            
            return .List(Array(elements.dropFirst(1)))
        }
        env[Builtins.equal.rawValue] = {params,locals,values in
            guard case let .List(elements) = params, elements.count == 3 else {return .List([])}
            
            var me = env[Builtins.equal.rawValue]!
            
            switch (elements[1].eval(with: locals,for: values)!,elements[2].eval(with: locals,for: values)!) {
            case (.Atom(let elLeft),.Atom(let elRight)):
                return elLeft == elRight ? .Atom("true") : .List([])
            case (.List(let elLeft),.List(let elRight)):
                guard elLeft.count == elRight.count else {return .List([])}
                for (idx,el) in elLeft.enumerated() {
                    let testeq:[SExpr] = [.Atom("Equal"),el,elRight[idx]]
                    if me(.List(testeq),locals,values) != SExpr.Atom("true") {
                        return .List([])
                    }
                }
                return .Atom("true")
            default:
                return .List([])
            }
        }
        env[Builtins.atom.rawValue] = { params,locals,values in
            guard case let .List(parameters) = params, parameters.count == 2 else {return .List([])}
            
            switch parameters[1].eval(with: locals,for: values)! {
            case .Atom:
                return .Atom("true")
            default:
                return .List([])
            }
        }
        // ...
        
        return env
    }()

虽然像 `quote` 或 `cdr` 这样的函数只是操作参数列表来构建输出列表，但是其他的函数像 `equals` 实现了一个更复杂的逻辑（在这种情况下，它执行递归等式检查）。 为了保持源代码可读的教学目的，错误检查被保持到最小，额外的参数被忽略，当出现错误时，返回空列表。

对于像条件 `cond` 这样的特殊形式，需要对评估进行不同的处理。

条件运算符对于实现递归是至关重要的，因为只有这种语句，我们才能决定是否停止递归或继续进行另一次迭代。

    
    env[Builtins.cond.rawValue] = { params,locals,values in
        guard case let .List(parameters) = params, parameters.count > 1 else {return .List([])}
        
        for el in parameters.dropFirst(1) {
            guard case let .List(c) = el, c.count == 2 else {return .List([])}
            
            if c[0].eval(with: locals,for: values) != .List([]) {
                let res = c[1].eval(with: locals,for: values)
                return res!
            }
        }
        return .List([])
    }

`cond` 的实现方式：一旦列表第一个包含 `cond` 原子的元素被删除了，遍历列表直至找到一个子列表，其中第一个成员是一个值不同于空列表的表单（这意味着 `false`，前面我们已经看到了），一旦找到它，评估子列表的第二个成员并返回它。 使用这种评估，我们只评估我们实际需要什么，当评估递归函数时，我们不遵循这些函数的主体包含的无限序列的嵌套递归调用。

在这些默认函数中，`defun` 和 `lambda` 操作符允许创建用户定义的函数，然后在一个名为 `localContext` 的全局访问字典中注册：

    
    /// Local environment for locally defined functions
    public var localContext = [String: (SExpr, [SExpr]?, [SExpr]?)->SExpr]()

让我们看看 `defun`（ `lambda` 的实现基本和它一致）是如何实现的。

    
    env[Builtins.defun.rawValue] =  { params,locals,values in
        guard case let .List(parameters) = params, parameters.count == 4 else {return .List([])}
        
        guard case let .Atom(lname) = parameters[1] else {return .List([])}
        guard case let .List(vars) = parameters[2] else {return .List([])}
        
        let lambda = parameters[3]
        
        let f: (SExpr, [SExpr]?, [SExpr]?)->SExpr = { params,locals,values in
            guard case var .List(p) = params else {return .List([])}
            p = Array(p.dropFirst(1))
            
            // Replace parameters in the lambda with values
            if let result = lambda.eval(with:vars, for:p){
                return result
            }else{
                return .List([])
            }
        }
        
        localContext[lname] = f
        return .List([])
    }

此函数需要一个包含四个符号表达式的列表，一个用于操作符名称，一个用于名称（这将是一个简单的原子），最后两个用于变量列表和 `lambda` 主体。 因此，一旦我们将每个组件存储在一个常量中（注意，空列表再次用作错误值），我们在 `localContext` 中定义和注册一个类型为 `(SExpr，[SExpr]?，[SExpr]?)-> SExpr` 的函数，将会看到，当评估器在表达式中找到它时，会被 `eval()` 调用。

在调用期间，这个匿名函数将使用当前参数来评估 `lambda` 的主体，替换原始变量列表中包含的变量，并返回结果。

为了更好地理解这里发生了什么，让我们来看看 `eval()`函数：

    
    public enum SExpr{
        case Atom(String)
        case List([SExpr])
        
        /**
         Evaluates this SExpression with the given functions environment
         
         - Parameter environment: A set of named functions or the default environment
         - Returns: the resulting SExpression after evaluation
         */
        public func eval(with locals: [SExpr]? = nil, for values: [SExpr]? = nil) -> SExpr?{
            var node = self
            
            switch node {
            case .Atom:
                return evaluateVariable(node, with:locals, for:values)
            case var .List(elements):
                var skip = false
                
                if elements.count > 1, case let .Atom(value) = elements[0] {
                    skip = Builtins.mustSkip(value)
                }
                
                // Evaluate all subexpressions
                if !skip {
                    elements = elements.map{
                        return $0.eval(with:locals, for:values)!
                    }
                }
                node = .List(elements)
                
                // Obtain a a reference to the function represented by the first atom and apply it, local definitions shadow global ones
                if elements.count > 0, case let .Atom(value) = elements[0], let f = localContext[value] ?? defaultEnvironment[value] {
                    let r = f(node,locals,values)
                    return r
                }
                
                return node
            }
        }
        
        private func evaluateVariable(_ v: SExpr, with locals: [SExpr]?, for values: [SExpr]?) -> SExpr {
            guard let locals = locals, let values = values else {return v}
            
            if locals.contains(v) {
                // The current atom is a variable, replace it with its value
                return values[locals.index(of: v)!]
            }else{
                // Not a variable, just return it
                return v
            }
        }
        
    }

评估期遍历抽象语法树，根据可评估的类型形式执行不同的操作

当遇到一个原子时，可以试着把它当做具有局部变量的当前上下文的变量（最初由 `defun` 或 `lambda` 设置，并在调用之间传播）进行解析，但大多数时候它只是返回原子。

这是在执行用户定义lambda的变量替换的地方，我们简单地使用 `evaluateVariable` 验证每个原子的名称是否存在于变量的数组中，如果是，我们用具有相同索引的原子替换值数组中的原子。

在评估列表或复合形式时，我们需要更多的考虑。

我们将首先尝试递归地评估当前列表中的所有子表达式，但前提是当前运算符不需要处理此评估本身。如上所述，在这个简单的 LISP 解释器中只有 `quote`，特殊形式和 `lambda` 定义运算符这三类。

一旦子表达式求值完毕，就应该将运算符应用于其操作数，该操作符在 `localContext` 中执行查找于运算符原子具有相同名称的lambda，然后在 `defaultEnvironment` 中找。顺序很重要，因为我们希望能够使用那些手动定义的新函数来隐藏默认定义。

如果存在具有该名称的lambda，则调用该函数，并将结果返回到递归计算的上一步。

这就结束了对基本解释器的描述，整件事情需要大概400行代码。

## SwiftyLisp REPL

现在是时候实现 REPL 了，但是它花费不了太长时间，解释器具有我们需要的所有基本功能。

我们将从终端读取一行，将其转换为 `SExpr`，对其进行评估并打印结果，这要归功于 `CustomStringConvertible` 协议。

    
    import SwiftyLisp
    
    var exit = false
    
    while(!exit){
        print(">>>", terminator:" ")
        let input = readLine(strippingNewline: true)
        exit = (input=="exit") ? true : false
        
        if !exit {
            let e = SExpr.read(input!)
            print(e.eval()!)
        }
    }

REPL 已经上传到 GitHub 另外一个[仓库](https://github.com/uraimo/SwiftyLISP-REPL)。

## 总结

本文介绍了一个最小 LISP 解释器，介绍普通解释器的基本构建块，而不考虑语言。

如果你以前从来没有这样做过，第一眼可能看起来令人畏惧，但我想要传达的意思是：这只不过是一个具有一定工作量的项目，但是每个人都能够完成。

查看 Github 上的[完整项目](https://github.com/uraimo/SwiftyLISP)，并在评论中告诉我，如果你想阅读更多关于解释器和编译器的话！

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。