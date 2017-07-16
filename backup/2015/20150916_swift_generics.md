title: "浅谈 Swift 中的泛型"
date: 2015-09-16
tags: [Swift 入门]
categories: [Thomas Hanning]
permalink: swift-generics

---
原文链接=http://www.thomashanning.com/swift-generics/
作者=Thomas Hanning
原文日期=2015-09-09
译者=pmst
校对=numbbbbb
定稿=shanks

<!--此处开始正文-->

`Objective-C`缺乏一个重要特性:不支持**泛型**。幸运地是，`Swift`拥有这一特性。**泛型**允许你声明的函数、类以及结构体支持不同的数据类型。

<!--more-->

## 提出问题

优秀的泛型使用案例中，最常见的例子当属对**栈(Stack)**的操作。栈作为容器有两种操作:一.**压入(Push)**操作添加项到容器中;二.**弹出(Pop)**操作将最近添加项从容器移除。首先我们用非泛型方式设计**栈**。最后代码如下所示:     

```swift
class IntStack{
  // 采用数组作为容器保存数据 类型为Int
  private var stackItems:[Int] = []
  // 入栈操作 即Push 添加最新数据到容器最顶部
  func pushItem(item:Int){
    stackItems.append(item)    
  }
  // 出栈操作 即Pop 将容器最顶部数据移除
  func popItem()->Int?{
    let lastItem = stackItems.last
    stackItems.removeLast()
    return lastItem
  }
}
```

该栈能够处理**Int**类型数据。这看起来不错，但是倘若要建立一个能够处理`String`类型的**栈**，我们又该如何实现呢？我们需要替换所有`Int`为`String`，不过这显然是一个糟糕的解决方法。此外另外一种方法乍看之下灰常不错，如下:     

```swift
class AnyObjectStack{
  // 采用数组作为容器保存数据 类型为AnyObject
  private var stackItems:[AnyObject] = []
  // 入栈操作 即Push 添加最新数据到容器最顶部
  func pushItem(item:AnyObject){
    stackItems.append(item)    
  }
  // 出栈操作 即Pop 将容器最顶部数据移除
  func popItem()->AnyObject?{
    let lastItem = stackItems.last
    stackItems.removeLast()
    return lastItem
  }    
}
```

此处，我们合理地使用`AnyObject`类型，那么现在能够将`String`类型数据压入到栈中了，对么？不过这种情况下我们就失去了数据类型的安全，并且每当我们对栈进行操作时,都需要进行一系列繁琐的类型转换(`casting`操作,使用`as`来进行类型转换)。

### 解决方案

参照泛型的特性，我们能够定义一个泛型类型，这看起来像一个占位符。使用泛型后的示例代码如下:     

```swift
class Stack<T> {

  private var stackItems: [T] = []  

  func pushItem(item:T) {
    stackItems.append(item)
  }  
  
  func popItem() -> T? {
    let lastItem = stackItems.last
    stackItems.removeLast()
    return lastItem
  }

}
```

泛型定义方式:由一对尖括号(`<>`)包裹，命名方式通常为大写字母开头(这里我们命名为`T`)。在初始化阶段，我们通过明确的类型(这里为`Int`)来定义参数,之后编译器将所有的泛型`T`替换成`Int`类型:

```swift
// 指定了泛型T 就是 Int 
// 编译器会替换所有T为Int
let aStack = Stack<Int>()

aStack.pushItem(10)
if let lastItem = aStack.popItem() {
  print("last item: \(lastItem)")
}
```

如此实现的栈，最大优势在于能够匹配任何类型。  

### 类型约束

这里存在一个缺点:尽管泛型能够代表任何类型，我们对它的操作也是比较有局限性的。仅仅是比较两个泛型都是不支持的，请看如下代码:

```swift
class Stack<T> {

  private var stackItems: [T] = []

  func pushItem(item:T) {
    stackItems.append(item)
  }

  func popItem() -> T? {
    let lastItem = stackItems.last
    stackItems.removeLast()
    return lastItem
  }

  func isItemInStack(item:T) -> Bool {
    var found = false
    for stackItem in stackItems {
      if stackItem == item { //编译报错!!!!!!!!!!
        found = true
      }
    }
    return found
  }
}
```

注意到函数`isItemInSatck(item:T)`中，我们得到了一个编译错误，因为两个参数没有实现`Equtable`协议的话，类型值是不能进行比较的。实际上我们可以为泛型增加约束条件来解决这个问题。在本例中，通过对第一行进行修改，我们让泛型`T`遵循`Equatable`协议:      

```swift
class Stack<T:Equatable> {

  private var stackItems: [T] = []

  func pushItem(item:T) {
    .append(item)
  }

  func popItem() -> T? {
    let lastItem = stackItems.last
    stackItems.removeLast()
    return lastItem
  }

  func isItemInStack(item:T) -> Bool {
    var found = false
    for stackItem in stackItems {
      if stackItem == item {
        ound = true
      }
    }
    return found
  }
}
```

### 总结

就像众多其他编程语言一样，你也能够在`Swift`中利用泛型这一特性。倘若你想要写一个库，泛型是非常好用的特性。
