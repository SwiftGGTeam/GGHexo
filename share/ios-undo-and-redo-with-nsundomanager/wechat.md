使用 NSUndoManager 来进行撤销和重做"

> 作者：Tomasz Szulc，[原文链接](http://szulctomasz.com/ios-undo-and-redo-with-nsundomanager/)，原文日期：2015-09-13
> 译者：[Yake](http://blog.csdn.net/yake_099)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[CMB](https://github.com/chenmingbiao)
  









在相当长的一段时间内 NSUndoManager 对我来说都是一个很神秘的东西。我想学习使用它，但是一直没有时间。一直到今天，我写了一个简单的应用，这个应用创建了一个可以移动的矩形，并且还可以修改矩形的属性，例如背景色或者圆角。



你可以在[这儿](https://github.com/tomkowz/undo-manager-practice)获取到示例应用
[这儿](https://youtu.be/3Pk85X8bugk)是一段小视频，你可以看看这个示例应用是怎么工作的。

![Screen-Shot-2015-09-13-at-17.24.19.png](https://swift.gg/img/articles/ios-undo-and-redo-with-nsundomanager/Screen-Shot-2015-09-13-at-17.24.19.png1447290433.4454885)


## NSUndoManager

`NSUndoManager`允许记录用户执行的操作并且反转这类操作。

当你调用一个可以改变一些东西的方法或者是执行一个改变属性值的动作（例如 setter 方法）时，你可以注册这个操作来进行撤销。

一个撤销操作包含了接收消息的对象，发送消息以及参数 - 通常你会传入原始值。

`NSUndoManager`实例支持重做操作，所以才能逆转操作。你可以认为这个管理器拥有两个栈。实际上，它管理两个栈，`undo`(撤销)栈和`redo`（重做）栈 - 对应`NSUndoManager`的私有属性`_undoStack`和`_redoStack`，里面存储着一些操作。

注册`undo`操作时，它会被添加到`undo`栈中。当调用`undo()`方法时管理器就会进行撤销，执行栈中的操作并把这个操作移动到`redo`栈中，这样你就可以重做它。当你拥有多个`undo`操作时，按照逆序来撤销和重做这些操作。你肯定不会将操作直接注册到`redo`栈中，实际上这根本无法实现。

你可以为`undo`操作设置一个级别，这指的是一个管理器可以在它的栈中存储多少`undo`操作。如果添加的`undo`操作数量超过了这个级别，最早加入的那个操作将会从栈中移除。

你可以通过`canUndo`和`canRedo`来检查`undo`和`redo`栈的状态。这些状态很重要，你可能会基于这些栈的状态来更新 UI。

假设你已经设置了`undo`操作的级别并且`redo`栈中还有一个操作，如果`undo`操作超过了这个级别，那你就需要使用`canUndo`和`canRedo`来检测可用性。之所以要这样做，是因为在这种情况下`NSUndoManager`将会移除`redo`操作，因为它是历史操作中最新的`undo`操作。（校对注：这里确实很绕，大家可以类比一下编辑器的撤销和重做操作，如果你在撤销之后进行了新的改动，那之前撤销过的操作其实已经无法再被重做了，因此可以被直接删掉，从而把更多的空间留给`undo`操作。）

## 注册`undo`操作

API提供了两种注册操作的方法。

第一种是使用`registerUndoWithTarget(_:selector:object:)`方法：

    
    func registerUndoAddFigure(figure: FigureView) {
        undoManager.registerUndoWithTarget(self, selector: Selector(“removeFigure:”), object: figure)
        undoManager.setActionName(“Add Figure”)
    }

第二种撤销方法是基于`NSInvocation`。你可以使用`prepareWithInvocationTarget(_:)`方法来注册此类操作。

    
    func registerUndoAddFigure(figure: FigureView) {
        undoManager.prepareWithInvocationTarget(self).removeFigure(figure)
        undoManager.setActionName("Add Figure")
    }

你将会得到一个`NSUndoManagerProxy`类型对象，可以用它调用任何方法（但是只能调用目标对象遵守的那些协议方法，否则应用会抛出运行时异常）。注册之后代理对象将会在内部创建`NSInvocation`对象来记录你的操作，这个对象会在传入的目标对象执行`undo`操作时被调用。

值得强调的是，在注册过程中目标对象没有被持有，需要你去管理它。如果`undo`操作被调用而目标对象已经被销毁，就会产生运行时异常。

当对象将要被销毁时你需要调用`removeAllActionsWithTarget(_:)`来移除与目标对象相关联的一些操作，或者调用`removeAllActions()`来移除`undo`和`redo`栈中所有的操作

## 将操作分组

分组操作是一件很有用的事情。默认情况下操作是通过事件进行分组的。这就意味着操作将会通过每一轮运行时循环来分组。你可以关闭自动分组，调用`beginUndoGrouping()`和`endUndoGrouping()`方法来手动操作分组。

## 命名并显示操作

`NSUndoManager`支持存储操作的名称。你可以调用`setActionName(_:)`方法来为操作命名。管理器已经包含`Undo`和`Redo`这两个单词的多语言版本，可以使用 API 直接获取对应语言的`Undo/Redo`字符串。

下面这个方法来自示例应用，每一个新的`undo`操作被注册或者`undo``redo`操作被执行之后，将会更新`undo`和`redo`按钮。

    
    private func updateUndoAndRedoButtons() {
        undoButton.enabled = undoManager.canUndo == true
        if undoManager.canUndo {
            undoButton.setTitle(undoManager.undoMenuTitleForUndoActionName(undoManager.undoActionName), forState: .Normal)
        } else {
            undoButton.setTitle(undoManager.undoMenuItemTitle, forState: .Normal)
        }
        
        redoButton.enabled = undoManager.canRedo == true
        if undoManager.canRedo {
            redoButton.setTitle(undoManager.redoMenuTitleForUndoActionName(undoManager.redoActionName), forState: .Normal)
        } else {
            redoButton.setTitle(undoManager.redoMenuItemTitle, forState: .Normal)
        }
    }

## 通知

管理器有几个你可以观察的通知类型。在示例应用中我关注的是`NSUndoManagerDidUndoChangeNotification`和`NSUndoManagerDidRedoChangeNotification`。为了让应用完美运行，我可能需要观察所有`will`或者`did`类型的通知，因为操作可能要执行一段时间，并且一部分代码可能是异步的。在这些情况下应用要正确展示 UI 就需要使用这些通知来刷新`Undo`和`Redo`按钮。

## 上下文

应用在不同的上下文中可能有不同的管理器。示例应用在不同的上下文中用了两个管理器。

第一个上下文是块展板，展板用来展示矩形并且可以在上面移动这个矩形。在这个展板上下文中可能发生的操作就是添加、移动或者移除一个矩形。

第二个上下文是这个矩形自己。你可以改变它的颜色和圆角。我决定追踪展板的背景色以及圆角，忽略掉它在展板中的位置。

这样你就可以添加一个矩形，移动它，改变它的颜色和圆角，使用`undo`来撤销移动操作但是不会撤销掉背景色和圆角的改变。你所使用的上下文数量取决于你的应用是怎么样的。

## 响应链

每一个`UIView`对象继承自`UIResponder`类型，这个类定义了响应对象的接口并且处理事件。

`UIResponder`类声明了`undoManager`属性。当应用接收到`undo`事件，`UIResponder`搭建起响应者链并通过`undoManager`返回一个`NSUndoManager`类型的对象来找到这个响应者。找到的第一个响应者将被用来处理`undo`或者`redo`操作。

为了使用响应者链你需要重载`canBecomeFirstResponder()`属性并且设置返回值为`true`，然后通过调用`becomeFirstResponder()`方法使持有`undoManager`的对象成为第一响应者。如果你已经正确设置好了一切，可以执行一个摇晃手势，应用会出现一个警告框询问你是否要执行`undo`操作。


![图片二.png](https://swift.gg/img/articles/ios-undo-and-redo-with-nsundomanager/undo-event.png1447290437.6564598)


## 示例代码

当我写这个示例代码的时候我注意自己花费了很多时间去考虑“具有唯一目的”的方法。当你需要支持撤销和重做操作时这其实很重要，因为你调用那些方法就是出于特定的目的。

下面的示例代码来自那个示例应用，它展示了在展板中的添加，移除以及移动操作都是怎么实现的。下面是所有与`undo manager`相关的代码：

    
    /// MARK: Actions on Figures
    func addFigure(figure: FigureView) {
        registerUndoAddFigure(figure)
        
        boardView.addSubview(figure)
        figures.append(figure)
        
        updateUndoAndRedoButtons()
    }
     
    func removeFigure(figure: FigureView) {
        registerUndoRemoveFigure(figure)
        
        figure.removeFromSuperview()
        if let index = figures.indexOf(figure) {
            figures.removeAtIndex(index)
        }
    }
     
    func moveFigure(figure: FigureView, center: CGPoint) {
        registerUndoMoveFigure(figure)
        figure.center = center
    }
     
    /// MARK: Undo Manager
    override func canBecomeFirstResponder() -> Bool {
        return true
    }
     
    private var _undoManager = NSUndoManager()
    override var undoManager: NSUndoManager {
        return _undoManager
    }
     
    private func observeUndoManager() {
        NSNotificationCenter.defaultCenter().addObserver(self, selector: Selector("updateUndoAndRedoButtons"), name: NSUndoManagerDidUndoChangeNotification, object: undoManager)
        NSNotificationCenter.defaultCenter().addObserver(self, selector: Selector("updateUndoAndRedoButtons"), name: NSUndoManagerDidRedoChangeNotification, object: undoManager)
    }
     
    @objc private func updateUndoAndRedoButtons() {
        undoButton.enabled = undoManager.canUndo == true
        if undoManager.canUndo {
            undoButton.setTitle(undoManager.undoMenuTitleForUndoActionName(undoManager.undoActionName), forState: .Normal)
        } else {
            undoButton.setTitle(undoManager.undoMenuItemTitle, forState: .Normal)
        }
        
        redoButton.enabled = undoManager.canRedo == true
        if undoManager.canRedo {
            redoButton.setTitle(undoManager.redoMenuTitleForUndoActionName(undoManager.redoActionName), forState: .Normal)
        } else {
            redoButton.setTitle(undoManager.redoMenuItemTitle, forState: .Normal)
        }
    }
     
    /// MARK: Undo Manager Actions
    func registerUndoAddFigure(figure: FigureView) {
        undoManager.prepareWithInvocationTarget(self).removeFigure(figure)
        undoManager.setActionName("Add Figure")
    }
     
    func registerUndoRemoveFigure(figure: FigureView) {
        undoManager.prepareWithInvocationTarget(self).addFigure(figure)
        undoManager.setActionName("Remove Figure")
    }
     
    func registerUndoMoveFigure(figure: FigureView) {
        undoManager.prepareWithInvocationTarget(self).moveFigure(figure, center: figure.center)
        undoManager.setActionName("Move to \(figure.center)")
    }

我创建了一些`undo`相关的简单方法。这样做效果很好，注册`undo`操作的逻辑和操作本身的逻辑相分离，代码精简为一句函数调用。

我决定放弃使用`registerUndoWithTarget(_:selector:object:)`方法，因为`Selector`是一个字符串，这样做很危险。而`prepareWithInvocationTarget(_:)`看起来更好一些，既安全又便于使用。

不过，当你需要设置属性时可能要用带`Selector`的方法。

你需要直接调用想要记录的方法，但是这样做不能设置属性（因为只能调用方法）。有两种解决方法：第一种是添加类似`setPropertyName(_:)`的方法，第二种是使用`registerUndoWithTarget(_:selector:object:)`方法并将`Selector`设置为`setPropertyName:`，作为参数传入。

## 结论

`NSUndoManager`是一种强大的机制，我们可以简单地向应用中加入`undo`和`redo`方法。它需要你谨慎地设计应用的结构，因为你需要使用“具有唯一目的性”的方法来将用户的操作设置为`undo`或者是`redo`。但是总体来说这是个好事，不是吗？这会改善代码设计。


> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。