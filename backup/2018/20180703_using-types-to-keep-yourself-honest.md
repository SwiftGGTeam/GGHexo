title: "使用类型来让你自己更可靠"
date: 2018-07-03
tags: [Swift]
categories: [machinethink]
permalink: using-types-to-keep-yourself-honest
keywords: 
custom_title: 
description: 

---
原文链接=http://machinethink.net/blog/using-types-to-keep-yourself-honest/
作者=MATTHIJS HOLLEMANS
原文日期=2016-03-25
译者=TonyHan
校对=Yousanflics
定稿=CMB

<!--此处开始正文-->

这篇文章展示了如何利用 Swift 的类型系统来使你的程序更具表现力和健壮性。

在最近一周左右的时间里，我一直在倒腾 Swift 的机器学习算法。我们可以通过使用矩阵来简洁有效地实现这些算法。

如果你忘记了线性代数，那只需将矩阵看作数字表格。

当提到 “M 是一个 4 乘 3 的矩阵”，意思是指 M 是一个 4 行 3 列的数字表格。关于矩阵你就需要了解这些（译者注:即可将其看作是表格），就可以理解本文后面的讲解。

<!--more-->

下面是一个 4×3 矩阵的例子：

![Matrix](https://swift.gg/img/articles/using-types-to-keep-yourself-honest/Matrix.png1530582060.2468634)

下面写代码创建一个 `矩阵结构体`：

```swift
struct Matrix {
  let rows: Int
  let columns: Int
  ...
}
```

经常需要对矩阵的操作是将它们相乘，因此我创建了一个函数：

```swift
func multiply(m1: Matrix, _ m2: Matrix) -> Matrix {
  // bunch of math...
}
```

这一切可能看起来很简单，但是还有些让我很烦的东西。

即便 m1 和 m2 都是 Matrix 对象，但是实际上它们可能具有不同数量的行和列。这可能是一个问题。

例如，使用矩阵乘法，两个矩阵的大小必须以特定方式匹配。

![MatrixMultiplication](https://swift.gg/img/articles/using-types-to-keep-yourself-honest/MatrixMultiplication.png1530582060.3889682)

第一个矩阵中的列数必须与第二个矩阵中的行数相同。如果第一个矩阵的大小为 `U × V`，则第二个矩阵的大小必须为 `V × W`。这就是数学上规定的。

结果是大小为 `U × W` 的新矩阵。如果矩阵的大小不匹配这种特定的方式，我们就不能将它们相乘。

例如，以下将工作正常：

```swift
let A = Matrix(rows: 4, columns: 3)
let B = Matrix(rows: 3, columns: 2)
let C = multiply(A, B)                // gives a 4×2 matrix
```

> 注意：在数学中，矩阵通常用大写表示，我在这里遵循变量名称的惯例。

由于 `A.columns == B.rows`，因此可以将 `A` 与 `B` 进行乘法。相反地，以下就不是有效的操作：

```swift
let D = multiply(B, A)
```

矩阵 `B` 中的列数与矩阵 `A` 中的行数不匹配。也就是 `B.columns！= A.rows`。从数学定义来说，矩阵B和A相乘没有任何意义。

目前，捕捉这些错误的唯一方法是在运行时触发断言：

```swift
func multiply(m1: Matrix, _ m2: Matrix) -> Matrix {
  // do the matrices have the correct sizes?
  precondition(m1.columns == m2.rows)
  
  // bunch of math...
}
```

这样做当然可以，但我并不喜欢。Swift 静态类型的重点在于编译器可以在编译期间发现尽可能多的编程错误。如果我们可以使编译器也捕获这种错误，这就会很棒。

事实证明是可以的！在本文中，我将探讨如何使用 Swift 的类型系统来避免这样的错误。

## 不太好的实现

解决这个问题的比较原始的方法是为不同大小的矩阵创建不同的结构体：

```swift
let A = Matrix_4x3()
let B = Matrix_3x2()
```

但是，还需要一个将这些特定类型作为参数的 `multiply()` 方法：

```swift
func multiply(m1: Matrix_4x3, _ m2: Matrix_3x2) -> Matrix_4x2
```

这似乎有点傻，导致了很多重复的代码。

更糟糕的是，编译时可能并不知道矩阵的大小。在机器学习问题中，我们经常需要从文件中加载数据集，但并不会提前知道有多少行。

所以这不是一个可行的解决方案。然而，为不同大小的矩阵声明不同类型的思路还是有希望的...

## 通用的解决方案

我们希望将矩阵的维度以某种方式并入 Matrix 的类型，而不需要任何矩阵代码，如 `multiply()` 知道其具体大小。

定义以下 Matrix：

```swift
struct Matrix<R,C> {
  let rows: Int
  let columns: Int
  ...
}
```

它现在有两个通用参数 `R` 和 `C`，其中 `R` 表示行数，`C` 表示列数。

我们可以这样定义 `multiply()`：

```swift
func multiply<U,V,W>(m1: Matrix<U,V>, _ m2: Matrix<V,W>) -> Matrix<U,W> {
  // bunch of math...
  return Matrix(rows: m1.rows, columns: m2.columns)
}
```

请注意获取矩阵乘法规则的方法：大小为 `U × V` 的矩阵乘以大小为 `V × W` 的矩阵，得到 `U × W` 大小的新矩阵。

下面是如何使用新的 `Matrix` 的例子：

```swift
struct NumExamples {}
struct NumFeatures {}
struct OneDimensional {}

let A = Matrix<NumExamples, NumFeatures>(rows: 20, columns: 10)
let B = Matrix<NumFeatures, OneDimensional>(rows: 10, columns: 1)
```

我们创建了三种新的类型 - 名为 `NumExamples` ，`NumFeatures` 和 `OneDimensional` —— 来表示矩阵的可能维数。注意我如何给出这些类型的描述性名称，从而更容易展现出它们的用途。

`NumExamples` 和 `NumFeatures` 的名称来自机器学习，因为我将在其中使用这些矩阵。`NumExamples` 是数据集中的对象数目，`NumFeatures` 是每个示例的属性数。(当然，如果你要使用这些矩阵来做别的事情，你可以使用不同的名字。）

`OneDimensional` 意指矩阵 `B` 只有一列。在线性代数中，我们称之为列向量而不是矩阵。为了使我们的代码更清晰，如果我们可以这样写：

```swift
typealias ColumnVector<Rows> = Matrix<Rows, OneDimensional>
typealias RowVector<Columns> = Matrix<OneDimensional, Columns>
```

类型别名会将 `ColumnVector` 和 `RowVector` 标记成 `Matrix` 的特殊情况。但不幸的是，Swift 2.2 中不支持这种语法。即将发布(**原文日期=2016/03/25**)的 [Swift 3.0](https://github.com/apple/swift-evolution/blob/master/proposals/0048-generic-typealias.md) 中可能会支持。

不管怎样让我们回到本例中。当你写下代码：

```swift
let C = multiply(A, B)
```

它便会按照预期给出了一个新的 20×1矩阵。然而，与之前不同的是，无效的乘法尝试会导致编译器错误：

```swift
let D = multiply(B, A)

// error: cannot convert value of type 'Matrix<NumFeatures, OneDimensional>'
// to expected argument type 'Matrix<_, _>'
```

错误消息有点模糊，但是使用 Swift 的类型系统来捕获这种错误是极好的。而不是在运行时崩溃应用程序，现在不可能将两个不具有正确维度的矩阵相乘。现在已经实现禁止将两个不具有正确维度的矩阵相乘，避免了在运行时崩溃。

果真如此么？我们仍然可以骗过编译器：

```swift
let A = Matrix<NumExamples, NumFeatures>(rows: 20, columns: 10)
let B = Matrix<NumFeatures, OneDimensional>(rows: 500, columns: 1)
```

通过将 `B` 的行数改为 500，我们仍然处于与之前相同的情况。现在 `multiply(A, B)` 不再有效。

只有这些额外的类型是不够的...我们需要确保类型 `NumFeatures` 无论它在哪里使用，总会以某种方式引用相同的数字。

## 使用协议弥补

我们可以像这样做：

```swift
struct NumExamples { let size = 20 }
struct NumFeatures { let size = 10 }
```

但是运行时这些维度的大小便被固定了。请记住，我们希望能够在运行时设置矩阵大小，例如通过从文件读取数据集——而且我们可能不知道该文件中有多少数据。对矩阵大小进行硬编码不是一种好办法。

相反，让我们定义一个新协议：

```swift
protocol Dimension {
  static var size: Int { get set }
}
```

于是 `Matrix` 变成了：

```swift
struct Matrix<R: Dimension, C: Dimension> {
  let rows: Int
  let columns: Int

  init() {
    self.rows = R.size
    self.columns = C.size
  }
}
```

注意，`init(rows:columns:)` 方法已经被去掉。矩阵的大小直接由泛型 `R` 和 `C` 决定。

最后一步是使我们的维度类型符合新协议：

```swift
struct NumExamples: Dimension { static var size = 20 }
struct NumFeatures: Dimension { static var size = 10 }
struct OneDimensional: Dimension { static var size = 1 }
```

然后可以如下实现 `multiply()`：

```swift
func multiply<U: Dimension, V: Dimension, W: Dimension>
             (m1: Matrix<U,V>, _ m2: Matrix<V,W>) -> Matrix<U,W> {
  // bunch of math...
  return Matrix<U,W>()
}
```

现在，矩阵 m1 和 m2 不可能不匹配。编译器根本不会接受这种情况。

```swift
let A = Matrix<NumExamples, NumFeatures>()
let B = Matrix<NumFeatures, OneDimensional>()

let C = multiply(A, B)   // yay!

let D = multiply(B, A)   // compiler error
```

这样就不会出现无意的错误。当然，你仍然可以通过这样做来欺骗系统：

```swift
let A = Matrix<NumExamples, NumFeatures>()
NumFeatures.size = 500
let B = Matrix<NumFeatures, OneDimensional>()
```

即便 Swift 的类型系统也无法阻止出于恶意的行为。（也许在 `multiply()` 中保留 `precondition()` 是明智的。）

顺便说一句，你实际上需要有改变 `NumFeatures.size` 的能力。但你使用时应该多加小心。正如直到我们运行该程序才能知道它特定大小，它也没有理由会一直保持不变。例如，你可能需要使用相同的流程来处理不同大小的多个数据集。

当然，你可以使用矩阵来做更多事情，而不仅仅是乘以它们。以下是这些维度类型用处的另一个示例：

```swift
func processData<M: Dimension, N: Dimension>
                (X: Matrix<M, N>, _ y: Matrix<M, OneDimensional>) 
                -> Matrix<OneDimensional, N> {
  // do impressive stuff...
}

let X = Matrix<NumExamples, NumFeatures>()
let y = Matrix<NumExamples, OneDimensional>()
processData(X, y)
```

该函数采用矩阵 `X` 和列向量 `y` ，并对它们进行一些处理。例如，可能会训练学习系统。这里的约束是 `X` 和 `y` 必须具有相同的行数。多亏了我们的维度类型，编译器可以强制执行该约束。

## 结论

我们使用类型来更好地告诉编译器我们的程序正在做什么。这有助于编译器捕获错误。