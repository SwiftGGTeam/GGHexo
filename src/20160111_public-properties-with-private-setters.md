title: "Swift：带有私有设置方法的公有属性"
date: 2016-01-11
tags: [Swift 入门]
categories: [Thomas Hanning]
permalink: public-properties-with-private-setters
---

原文链接=http://www.thomashanning.com/public-properties-with-private-setters/
作者=Thomas Hanning
原文日期=2015-12-24
译者=小袋子
校对=lfb_CD
定稿=Cee


<!--此处开始正文-->

Swift 可以很方便地创建带有私有设置方法的公有属性。这可以让你的代码更加安全和简洁。

<!--more-->

### 封装

封装从根本上意味着类的信息和状态应该对外部类隐藏，只有类自身可以操作。因此，所有的 bug 和 逻辑错误更加不可能发生了。

通常你会使用 `setter` 以及 `getter` 来达到封装的目的。然而，有时候你根本不想对外提供类中的设置方法。对于这样的情况，你可以使用带有私有设置方法的属性。

### 例子

假设我们想要创建一个代表圆的类，那么圆的半径应该是可以改变的。而且，该圆的面积和直径应该可以从圆的实例中获取，而这两个属性不应该被类本身以外所更改。出于性能考虑，面积和直径也应该只计算一次。

所以这个圆类应该是这样的：

```swift
class Circle {

    private var area: Double = 0
    private var diameter: Double = 0

    var radius: Double {
        didSet {
            calculateFigures()
        }
    }

    init(radius:Double) {
        self.radius = radius
        calculateFigures()
    }

    private func calculateFigures() {
        area = M_PI * radius * radius
        diameter = 2 * M_PI * radius
    }

    func getArea() -> Double {
        return area
    }

    func getDiameter() -> Double {
        return diameter
    } 
}
```

现在所有的需求都满足啦。然而，Swift 提供了一种更好的方式，可以使得这段代码更加简洁。

### 带有私有设置方法的属性

通过在属性前面使用 `private(set)` ，属性就被设置为默认访问等级的 `getter` 方法，但是 `setter` 方法是私有的。所以我们可以去掉两个 `getter` 方法：

```swift
class Circle {

    private(set) var area: Double = 0
    private(set) var diameter: Double = 0

    var radius: Double {
        didSet {
            calculateFigures()
        }
    }

    init(radius:Double) {
        self.radius = radius
        calculateFigures()
    }

    private func calculateFigures() {
        area = M_PI * radius * radius
        diameter = 2 * M_PI * radius
    }
}
```

当然也可以为属性设置公有的 `getter` 方法：

```swift
public class Circle {

    public private(set) var area: Double = 0
    public private(set) var diameter: Double = 0

    public var radius: Double {
        didSet {
            calculateFigures()
        }
    }

    public init(radius:Double) {
        self.radius = radius
        calculateFigures()
    }

    private func calculateFigures() {
        area = M_PI * radius * radius
        diameter = 2 * M_PI * radius
    }
}
```

## 对象

在这个例子中，属性只是 `Double` 值。然而，如果是一个对象，可以通过使用对象的某个方法来操作！使用私有设置方法只允许设置一个全新的对象，在使用过程中应铭记这一点。