用模式匹配解析 URL

> 作者：Olivier Halligon，[原文链接](http://alisoftware.github.io/swift/pattern-matching/2015/08/23/urls-and-pattern-matching/)，原文日期：2015/08/23
> 译者：[靛青K](http://www.dianqk.org/)；校对：[numbbbbb](https://github.com/numbbbbb)；定稿：[shanks](http://codebuild.me/)
  









今天的目标是用代码处理链接 `http://mywebsite.org/customers/:cid/orders/:oid`，从中提取出订单号（#oid）和顾客 ID（#cid） 。  

我们将要使用一种简单快捷的方式来实现 -- 模式匹配和变量绑定。 

   

## 思考过程

首先想到的解决方法是把 URL 以"/"分割成若干路径部分，然后使用 `switch` 语句进行模式匹配 -- 匹配**每一个**路径部分存入一个元组中，这样我们就可以使用变量绑定获取 URL 中的变量部分。   

代码的大致架构如下：    

```swift
// path 是 [String] 类型，包含 URL 中分割的各个部分
// 比如 ["customer","5","order","12"]
switch (path[0], path[1], path[2], path[3]) {
  case ("customer", let cid, "order", let oid):
    print("Customer #\(cid), Order #\(oid)")
  default:
    print("Invalid request")
}
```    

## 问题

最初我们有一个 `NSURL`，要把它转换成 `Array` （稍后介绍实现方式）。但是不能同时使用模式匹配和变量绑定来提取顾客和订单 ID（`switch path { case ["customer", let cid]: … }`这种写法不能执行）。因此我们需要使用元组（`case ("customer", let cid)`）。

然而，我们不能把大小不定的可变数组转换成一个元组，因为元组的类型是由内部元素的数量和类型决定的。当然我们可以创建不同的 `switch` 语句，匹配不同长度的元组…但是这样会使代码看起来非常混乱：   

```swift
func parse(path: [String]) -> String? {
    switch path.count {
    case 1:
        switch path[0] {
        case "products":  return "List of products"
        case "customers": return "List of customers"
        default: return nil
        }
    case 2:
        switch (path[0], path[1]) {
        case ("products", let pid):  return "Product #\(pid)"
        case ("customers", let cid): return "Customer #\(cid)"
        default: return nil
        }
    case 3:
        switch (path[0], path[1], path[2]) {
        case ("customers", let cid, "orders"):
            return "List of orders for customer #\(cid)"
        default: return nil
        }
        // ...
    default: return nil
    }
}
```    

这样的写法十分恶心并且十分冗长。没错，我们不想选择这种方法。那么到底该怎么提取呢？   

### 使用固定长度的元组   

我们是否可以使用固定长度的元组，然后用`nil`来填充空位？当然，用这种方法来存储应用的数据一点都不优雅，但只在 `switch` 中使用是可行的，这样就可以使用固定长度的元组方便地处理各种情况。   

但如何构造这样一个元组呢？当然，你可以使用 `switch`：    

```swift
switch path.count {
    case 0: return (nil, nil, nil)
    case 1: return (path[0], nil, nil)
    case 2: return (path[0], path[1], nil)
    default: return (path[0], path[1], path[2])
}
```   

还可以全部写在一行，不过这样很难阅读：   

```swift
return (path.count <= 0 ? nil : path[0], path.count <= 1 ? nil : path[1], path.count <= 2 ? nil : path[2], …)
```   

如果使用这种方式，当有7到8个分割路径数时，代码就会变得很长…而且这还只是构造元组，我们还没有进行任何模式匹配！   

这种方式很不优雅，而且根本无法满足我们的需求。   

## 使用生成器(Generator)  

下面介绍另一种技巧：使用生成器（Generator）。

如果你不知道 Swift 标准库中的 `Generator` 是什么，没关系，非常简单。`Generator` 基本和 C++ 中的迭代方法一样。它是一个对象，`next()` 方法会返回被迭代序列中的下一个值，当迭代到结尾时返回 `nil`。   

那么如何用它来建立我们的元组？很简单！每个 `SequenceType`（特别是`array`）都有一个生成器，我们只需要对每个值调用 `next()` 方法就可以建立元组。如果这个数组比较短，它将用 `nil` 填充最后几个值：    

```swift
let path : [String] = …
// 获取遍历数组用的生成器
var g = path.generate() // 注意：由于我们要使用 g.next()，必须声明为变量。（译者注：因为每次调用 g 都会绑定到下一个值）
let tuple = (g.next(), g.next(), g.next(), g.next())
```   

妥妥的！如果`path`只有两个值，比如`["a","b"]`，那 `tuple`（元组）就将是`("a","b",nil,nil)`。`switch` 再也不需要依赖 `path.count`。

## 完整的解决方案！   

现在，无论路径中有多少个组件，我们都可以使用一个非常简单的 `switch` 来进行解析 URL。

我们使用一个枚举来表示所有可能出现的请求，并用关联值来保存变量参数:    

```Swift
enum Request {
    case ProductsList                         // "/products"
    case Product(productID: Int)              // "/products/:pid"
    case CustomersList                        // "/customers"
    case Customer(customerID: Int)            // "/customers/:cid"
    case OrdersList(customerID: Int)          // "/customers/:cid/orders"
    case Order(customerID: Int, orderID: Int) // "/customers/:cid/orders/:oid"
}
```    

使用之前的技巧，我们就可以用一个代表路径的 `[String]` 和一个单独的`switch`语句来创建一个`Request`实例。当然，初始化是最佳方案，但它有可能失败，因为分割的路径可能无法和期望的路径相匹配，比如 ID 的值无法转换成 `Int` 值（我们可以用 `guard` 语句来捕捉这些潜在的转换错误，正常情况下不会出现这种错误）。    

这样我们就得到了初始化代码<sup>[[1]](#fn1) [[2]](#fn2) [[3]](#fn3)</sup>：    

```swift
extension Request {
    init?(path: [String]) {
        var g = path.generate() // use a generator to build our tuple
        switch (g.next(), g.next(), g.next(), g.next(), g.next()) {
        case ("products"?, nil, _, _, _):
            self = .ProductsList
        case ("products"?, let spid?, nil, _, _):
            guard let pid = Int(spid) else { return nil }
            self = .Product(productID: pid)
        case ("customers"?, nil, _, _, _):
            self = .CustomersList
        case ("customers"?, let scid?, nil, _, _):
            guard let cid = Int(scid) else { return nil }
            self = .Customer(customerID: cid)
        case ("customers"?, let scid?, "orders"?, nil, _):
            guard let cid = Int(scid) else { return nil }
            self = .OrdersList(customerID: cid)
        case ("customers"?, let scid?, "orders"?, let soid?, nil):
            guard let cid = Int(scid), oid = Int(soid) else { return nil }
            self = .Order(customerID: cid, orderID: oid)
        default: return nil
        }
    }
}
```     

## 收尾   

如果我们想完整的完成这个练习，最后需要做的一件事就是从 URL 
中解析出组件数组并传入 `Request(path:…)` 初始化方法。    

我们用 `NSURLComponents` 把 `URL` 分成 `host`、`path` 等等。然后用 `NSString.pathComponents` 将路径分割成目录数组。另外：   

* 我们想去掉开头的 `/` 。它肯定会出现在绝对路径中，我们不想在 `switch` 中的每个 `case` 里都对它进行匹配。
* 如果结尾有 `/`，我们也要把它去掉。在本例中，我们希望类似`/customers/5`和`/customers/5/`的 URL 都解析成`.Customer(customerID: 5)`。

```swift
import Foundation

func parse(url: NSURL) -> Request? {
    if let comps = NSURLComponents(URL: url, resolvingAgainstBaseURL: false),
        let path = comps.path where comps.host == "mywebsite.org"
    {
        let pathComps = (path as NSString).pathComponents
        if pathComps.first == "/" {
            var canonicalComps = pathComps.dropFirst()
            if canonicalComps.last == "/" {
                // 如果有url以 "/" 结尾，那么就需要丢掉它
                canonicalComps = canonicalComps.dropLast()
            }
            return Request(path: Array(canonicalComps))
        }
    }
    return nil
}

if let url = NSURL(string: "http://mywebsite.org/customers/12/orders"),
    let req = parse(url) {
    print(req) // 输出: OrdersList(12)
}
```    

完成!


<a name="fn1"></a>
1. 你可以看到代码中我用了问号符号，比如模式匹配的 `cases` 中的`"product"?`。那是因为我们的元组中包含可选的`String?`元素，并且模式匹配将会匹配元组相同类型，所以我们的`case`中的参数必须是可选的。我也会使用`let spid?`来保证`spid`变量不会绑定`nil`。提醒一点，`x?`是 Swift 2.0 的语法糖，相当于 `.Some(x)`。        
<a name="fn2"></a>
2. 我的元组（有五个值）的长度比我要处理的路径最大长度大 1 。这样通过确保`let soid?`的非空值接下来都是`nil`，从而保证了 `/customers/:cid/orders/:oid/foo/bar`不会 `return .Order(customerID: …, orderID: …)`，这就代表了路径的终点。         
<a name="fn3"></a>
3. 我使用 `_` 填充第一个 `nil` 后面的那些组件，因为我一点也不关心他们的值：考虑到我建立的元组的方法，我知道他们只能是 `nil` ，所以为什么还要管他们呢？当然在这里，你可以使用 `nil` 作为值代替这里的 `_`，但我觉得现在这样的代码更简单整洁。      