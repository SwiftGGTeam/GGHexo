Swift 2.0 中使用 try? 关键字"

> 作者：Natasha，[原文链接](http://natashatherobot.com/swift-2-0-try/)，原文日期：2015/08/26
> 译者：[小铁匠Linus](http://weibo.com/linusling)；校对：[lfb_CD](http://weibo.com/lfbWb)；定稿：[numbbbbb](https://github.com/numbbbbb)
  







Xcode 7 Beta 6 发布时，我一下子就被下面这三个特性迷住了：

>![](http://swift.gg/img/articles/swift-2-lets-try/1.png)



___

>![](http://swift.gg/img/articles/swift-2-lets-try/2.png)

___

>![](http://swift.gg/img/articles/swift-2-lets-try/3.png)

还有一件事我没有发到推特上：我对 Swift 最大的改动——`try?`关键字——很不理解。

![](http://swift.gg/img/articles/swift-2-lets-try/Screen-Shot-2015-08-26-at-4.48.03-AM.png)

>Swift 新增一个关键字`try?`。`try?`会试图执行一个可能会抛出异常的操作。如果成功抛出异常，执行的结果就会包裹在可选值(optional)里；如果抛出异常失败(比如：已经在处理 error)，那么执行的结果就是`nil`，而且没有 error。`try?`配合`if let`和`guard`一起使用效果更佳。

>    >func produceGizmoUsingTechnology() throws -> Gizmo {...}
    >func produceGizmoUsingMagic() throws -> Gizmo {...}
    >
    >if let result = try? produceGizmoUsingTechnology() {return result}
    >if let result = try? produceGizmoUsingMagic() {return result}
    >print("warning: failed to produce a Gizmo in any way")
    >return nil
    >
>值得注意的是，`try?`总是给已经在求值的结果类型又增添一层Optional。如果一个方法正常返回的类型是`Int?`，那么使用`try?`调用这个方法就会返回`Int??`或者`Optional<Optional<Int>>`。(21692467)

我昨天发给[@allonsykraken](https://twitter.com/allonsykraken)一些代码，然后他用`try?`漂亮地重构了那些代码。这帮我深深的理解了`try?`的重要性，所以我把这些代码共享出来。

## 用 try 解析 JSON

这里的用例就是 ... 看 ↑ ，没错就是 Json 解析。以下的代码是我为一个简单的代办 app 写的：

    
    struct TodoListParser {
        
        enum Error: ErrorType {
            case InvalidJSON
        }
        
        func parse(fromData data: NSData) throws -> TodoList {
            
            // Notice the need to use try here
            guard let jsonDict = try NSJSONSerialization.JSONObjectWithData(data, options: .AllowFragments) as? [String : AnyObject] else {
                throw Error.InvalidJSON
            }
            
            guard let todoListDict = jsonDict["todos"] as? [[String : AnyObject]] else {
                throw Error.InvalidJSON
            }
            
            let todoItems = todoListDict.flatMap { TodoItemParser().parse(fromData: $0) }
            
            return TodoList(items: todoItems)
        }
    }

### Issue 1: 出乎意料的异常

首先，可以注意到`NSJSONSerialization.JSONObjectWithData`这个类方法抛出 error。之前这个问题我一直不理解。我认为如果抛出 error 时只会从`guard`语句跳到`else`的代码块中，然后用我准备好的错误处理代码去处理。然而事情并非我想的那样。`JSONObjectWithData`会抛出自己的 error，然后在进入`else`代码块之前退出当前方法。

为了处理这个问题，我用`do-catch`把之前需要处理的语句包裹起来，像这样：

    func parse(fromData data: NSData) throws -> TodoList {
        
        do {
        guard let jsonDict = try NSJSONSerialization.JSONObjectWithData(data, options: .AllowFragments) as? [String : AnyObject] else {
        throw Error.InvalidJSON
        }
        
        guard let todoListDict = jsonDict["todos"] as? [[String : AnyObject]] else {
        throw Error.InvalidJSON
        }
        
        let todoItems = todoListDict.flatMap { TodoItemParser().parse(fromData: $0) }
        
        return TodoList(items: todoItems)
        
        } catch {
            throw Error.InvalidJSON
        }
    }

### Issue 2: 重复的抛出异常

现在出现了另外一个问题。`jsonDict`和`todoListDict`两者的赋值报出了相同的错，如果两者都没有成功解包，就会报错`Error.InvalidJSON`。为了解决这个问题，我把两个`guard`语句合并成一个。这虽然跟`try`没什么关系，但是我还是想提一下，是因为我还是习惯用`guard`语句。修改后的代码如下：

    
    func parse(fromData data: NSData) throws -> TodoList {
            
            do {
                guard let jsonDict = try NSJSONSerialization.JSONObjectWithData(data, options: .AllowFragments) as? [String : AnyObject],
                    // todoListDict is now moved up here
                    todoListDict = jsonDict["todos"] as? [[String : AnyObject]] else {
                    throw Error.InvalidJSON
                }
                
                let todoItems = todoListDict.flatMap { TodoItemParser().parse(fromData: $0) }
                
                return TodoList(items: todoItems)
                
            } catch {
                throw Error.InvalidJSON
            }

现在让我们来比较一下这个版本和`try?`的版本：

## 用 try? 解析 JSON

`try?`才是真正我一开始想要的处理过程：当有 error 要抛出的时候，会进到`else`代码块中：

    
    struct TodoListParser {
        
        enum Error: ErrorType {
            case InvalidJSON
        }
        
        func parse(fromData data: NSData) throws -> TodoList {
            
            guard let jsonDict = try? NSJSONSerialization.JSONObjectWithData(data, options: .AllowFragments) as? [String : AnyObject],
                // Notice the extra question mark here!
                todoListDict = jsonDict?["todos"] as? [[String : AnyObject]] else {
                    throw Error.InvalidJSON
            }
            
            let todoItems = todoListDict.flatMap { TodoItemParser().parse(fromData: $0) }
            
            return TodoList(items: todoItems)
            
        }
    }

代码中唯一的不足(呵呵，双关！)就是返回的值是一个有两层的可选值。`guard let`对其中的一层可选值进行了解包，所以对`todoListDict`进行赋值的时候，只需要再进行一层解包即可。

注意：我自己仍然处在学习`try?`的过程中，所以如果你有什么意见，一定要在下面留言。我会虚心接受的 :)

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。