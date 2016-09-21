整理单个 if 条件的使用方法"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2016/08/05/cleaning-up-single-if-case-use/)，原文日期：2016-08-05
> 译者：[粉红星云](http://www.jianshu.com/users/f4d4f97d8b90/latest_articles)；校对：[千叶知风](http://weibo.com/xiaoxxiao)；定稿：[CMB](https://github.com/chenmingbiao)
  









发现自己有一个编程习惯，正在努力让自己戒掉，这个习惯是像下面这样的：

    
     switch something {
     把一些复杂的绑定值定义到 case 中 case:
     // ...用绑定值做一些事
     default: break
    }


 
这里有个真实的例子：

    
    enum Tree<T> {
        case empty
        indirect case node(value: T, left: Tree<T>, right: Tree<T>)
     
        func show(indent: Int = 0) {
            switch self {
            case let .node(value: value, left: left, right: right):
                print(String(repeating: " " as Character, count: indent), value)
                right.show(indent: indent + 4)
                left.show(indent: indent + 4)
            default: break
            }
        }
    }

我尝试打破这个模式是因为有个更简单的方式来实现，那就是用 `if case` 来代替 `switch`。只有一种 case 需要考虑，默认情况下不需要做任何操作。

经过重构后，产生了下面简化后的代码，使所有的绑定和与 `.node` 相关的行为产生关联，来被压缩放置到一起。

    
    enum Tree<T> {
        case empty
        indirect case node(value: T, left: Tree<T>, right: Tree<T>)
     
        func show(indent: Int = 0) {
            if case let .node(value: v, left: l, right: r) = self {
                print(String(repeating: " " as Character, count: indent), v)
                r.show(indent: indent + 4)
                l.show(indent: indent + 4)
             }
    }

在很多情况下，我通常会鼓励自己使用 `switch` 或是 `guard`，而不是 `if` 来明确我的意图并增加可读性，但是在这个例子上最好还是用回经典的 if 吧。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。