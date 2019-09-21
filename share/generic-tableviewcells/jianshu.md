使用泛型来优化 TableView Cells 的使用体验"

> 作者：Olivier Halligon，[原文链接](http://alisoftware.github.io/swift/generics/2016/01/06/generic-tableviewcells/)，原文日期：2016-01-06
> 译者：[walkingway](http://chengway.in/)；校对：[小锅](http://www.swiftyper.com)；定稿：[numbbbbb](http://numbbbbb.com/)
  









各位新年快乐🎇🎉🎊🎆! 2016 年第一篇博客我想分享一个非常有用的技巧，那就是向大家展示 Swift 泛型的强大，以及方便地使用泛型来处理 `UITableViewCells` 和 `UICollectionViewCells`。

<!--此处开始正文-->

## 介绍

我不喜欢使用字符串做标识符，我认为[使用常量](http://alisoftware.github.io/swift/enum/constants/2015/07/19/enums-as-constants/)要比字符串好很多。

但是，当涉及到 `UITableViewCell` 或 `UICollectionViewCell` 以及他们的重用标识符（`reuseIdentifiers`）时，我想采用一种更加魔幻的解决方案：『使用 Swift 的泛型 + [Mixins](http://swift.gg/2015/12/15/mixins-over-inheritance/) 的方式』，下面让我们摒住呼吸，见证奇迹的时刻。



## 魔法时刻

我的想法是在 `UITableViewCell`（或 `UICollectionViewCell`）的子类中将 `reuseIdentifier` 声明为一个静态常量，然后用它使这个 cell 的实例对外部透明化（即，不用显式地使用 `reuseIdentifer` 来实例化 cell）。

我们首先声明一个协议，以便于稍后能够[将其作为 Mixin](http://swift.gg/2015/12/15/mixins-over-inheritance/) 来使用：

    
    protocol Reusable: class {
      static var reuseIdentifier: String { get }
    }
    
    extension Reusable {
      static var reuseIdentifier: String {
      	 // 我喜欢使用类名来作为标识符
      	 // 所以这里可以用类名返回一个默认值
        return String(Self)
      }
    }

当我们使用**泛型**实现 `dequeueReusableCell(…)` 方法时，魔法出现了：

    
    func dequeueReusableCell<T: Reusable>(indexPath indexPath: NSIndexPath) -> T {
      return self.dequeueReusableCellWithIdentifier(T.reuseIdentifier, forIndexPath: indexPath) as! T
    }

得益于 Swift 的类型推断，**这个方法将使用调用点的上下文来推断 T 的实际类型**，因此这个类型可以被看做方法**实现中的『复古注入』(retro-injected)！**✨

    
    let cell = tableView.dequeueReusableCell(indexPath: indexPath) as MyCustomCell

> 注意观察 `reuseIdentifier` 在内部的使用方法...完全由编译器看到的**返回类型**决定！那就是我说的类型“复古注射(retro-injected)”，以及为什么我超😍它的原因

> 译者注：Swift 的类型在编译时刻就确定了，所以当你写下 `as MyCustomCell` 后，**cell** 的类型即泛型 **T** 的具体类型就确定了

很美妙不是吗？

![](https://swift.gg/img/articles/generic-tableviewcells/magic.gif1453861217.0830312)

## 更进一步

当然，除了 `dequeueReusableCellWithIdentifier` 之外，你同样可以把这个方法用在 `registerNib(_, forCellWithReuseIdentifier:)` 和 `UICollectionViewCells`，supplementary 视图上。

`UITableViewCells` 和 `UICollectionViewCells` 都能通过类名（`registerClass(_, forCellWithReuseIdentifier:)`） 或 nib（`registerNib(_, forCellWithReuseIdentifier:)`）的方式进行注册。如果存在 nib，我们将在协议中添加一个类型属性（`static var nib: UINib?`），然后使用这个 nib 注册 cell；如果 nib 不存在则使用类注册。

## 代码

这里是我在项目中实际使用的代码：

> [2016-01-20 修改]
> 
> 现在[可以在Github](https://github.com/AliSoftware/Reusable)上看到这个代码了！


    
    import UIKit
    
    protocol Reusable: class {
      static var reuseIdentifier: String { get }
      static var nib: UINib? { get }
    }
    
    extension Reusable {
      static var reuseIdentifier: String { return String(Self) }
      static var nib: UINib? { return nil }
    }
    
    extension UITableView {
      func registerReusableCell<T: UITableViewCell where T: Reusable>(_: T.Type) {
        if let nib = T.nib {
          self.registerNib(nib, forCellReuseIdentifier: T.reuseIdentifier)
        } else {
          self.registerClass(T.self, forCellReuseIdentifier: T.reuseIdentifier)
        }
      }
    
      func dequeueReusableCell<T: UITableViewCell where T: Reusable>(indexPath indexPath: NSIndexPath) -> T {
        return self.dequeueReusableCellWithIdentifier(T.reuseIdentifier, forIndexPath: indexPath) as! T
      }
    
      func registerReusableHeaderFooterView<T: UITableViewHeaderFooterView where T: Reusable>(_: T.Type) {
        if let nib = T.nib {
          self.registerNib(nib, forHeaderFooterViewReuseIdentifier: T.reuseIdentifier)
        } else {
          self.registerClass(T.self, forHeaderFooterViewReuseIdentifier: T.reuseIdentifier)
        }
      }
    
      func dequeueReusableHeaderFooterView<T: UITableViewHeaderFooterView where T: Reusable>() -> T? {
        return self.dequeueReusableHeaderFooterViewWithIdentifier(T.reuseIdentifier) as! T?
      }
    }
    
    extension UICollectionView {
      func registerReusableCell<T: UICollectionViewCell where T: Reusable>(_: T.Type) {
        if let nib = T.nib {
          self.registerNib(nib, forCellWithReuseIdentifier: T.reuseIdentifier)
        } else {
          self.registerClass(T.self, forCellWithReuseIdentifier: T.reuseIdentifier)
        }
      }
    
      func dequeueReusableCell<T: UICollectionViewCell where T: Reusable>(indexPath indexPath: NSIndexPath) -> T {
        return self.dequeueReusableCellWithReuseIdentifier(T.reuseIdentifier, forIndexPath: indexPath) as! T
      }
    
      func registerReusableSupplementaryView<T: Reusable>(elementKind: String, _: T.Type) {
        if let nib = T.nib {
          self.registerNib(nib, forSupplementaryViewOfKind: elementKind, withReuseIdentifier: T.reuseIdentifier)
        } else {
          self.registerClass(T.self, forSupplementaryViewOfKind: elementKind, withReuseIdentifier: T.reuseIdentifier)
        }
      }
    
      func dequeueReusableSupplementaryView<T: UICollectionViewCell where T: Reusable>(elementKind: String, indexPath: NSIndexPath) -> T {
        return self.dequeueReusableSupplementaryViewOfKind(elementKind, withReuseIdentifier: T.reuseIdentifier, forIndexPath: indexPath) as! T
      }
    }

## 示例用法

下面演示如何声明一个 `UITableViewCell` 的子类：

    
    class CodeBasedCustomCell: UITableViewCell, Reusable {
      // By default this cell will have a reuseIdentifier or "MyCustomCell"
      // unless you provide an alternative implementation of `var reuseIdentifier`
      // ...
    }
    
    class NibBasedCustomCell: UITableViewCell, Reusable {
      // Here we provide a nib for this cell class
      // (instead of relying of the protocol's default implementation)
      static var nib: UINib? {
        return UINib(nibName: String(NibBasedCustomCell.self), bundle: nil)
      }
      // ...
    }
然后在 `UITableViewDelegate`/`UITableViewDataSource` 中使用他们：

    
    class MyTableViewController: UITableViewController {
      override func viewDidLoad() {
        super.viewDidLoad()
        tableView.registerReusableCell(CodeBasedCustomCell.self) // This will register using the class without using a UINib
        tableView.registerReusableCell(NibBasedCustomCell.self) // This will register using NibBasedCustomCell.xib
      }
    
      override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell: UITableViewCell
        if indexPath.section == 0 {
          cell = tableView.dequeueReusableCell(indexPath: indexPath) as CodeBasedCustomCell
        } else {
          cell = tableView.dequeueReusableCell(indexPath: indexPath) as NibBasedCustomCell
        }
        return cell
      }
    }

## 另一种解决方案

有些人倾向于将 `Reusable` 协议拆分成两个不同的协议，用于区分基于 nib 创建与基于 class 创建的 cell：

    
    protocol Reusable: class {
      static var reuseIdentifier: String { get }
    }
    extension Reusable {
      static var reuseIdentifier: String { return String(Self) }
    }
    
    protocol NibReusable: Reusable {
      static var nib: UINib { get }
    }
    extension NibReusable {
      static var nib: UINib {
        return UINib(nibName: String(Self), bundle: nil)
      }
    }

这样基于 nib 创建的 cell 也能使用默认实现 —— 因此不用在子类中再重新实现一遍。

但是这也会迫使你在 `UITableView` 和 `UICollectionView`上添加更多的实现方法（每个协议中添加一个实现），所以嘛...这其中的平衡还要靠你自己来把握 ⚖😉

## 福利：现在你能通过 Cocoapods 使用这个库啦 🎉

> 2016-01-20 增加

以上代码和示例，我已经上传至 GitHub，并且通过 Swift Package 以及 [CocoaPod](https://cocoapods.org/pods/Reusable) 发布了，现在可以很方便地添加到你的工程中。

随时欢迎各种 PR 来共同改进这个项目 😉

--

最后希望你喜欢这一技巧，我们下次再见喽！🎉
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。