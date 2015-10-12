Swift 2.0 中的面向协议的MVVM

> 作者：Natasha，[原文链接](http://natashatherobot.com/swift-2-0-protocol-oriented-mvvm/)，原文日期：2015/08/17
> 译者：[小铁匠Linus](http://weibo.com/linusling)；校对：[Channe](undefined)；定稿：[小锅](http://www.swiftyper.com/)
  







自从令人兴奋的[Swift 面向协议编程 WWDC 讲座](https://developer.apple.com/videos/wwdc/2015/?id=408)发布，我就在思考协议的用法。但是现实中，我并没有使用过它们。我仍在消化面向协议编程的含义，之后就可以在代码中用面向协议编程模式替换面向过程编程模式了。

一个庞大的案例涌上心头：`MVVM` ! 我之前用过 `MVVM`，如果你想要具体了解，可以看我之前发表的[关于 MVVM 的博客](http://natashatherobot.com/swift-mvvm-optionals/)。不过面向协议的内容都在本篇文章。



接下来我会用一个简单的例子来说明。现在有一个设置界面，其中只有一个设置：开启、关闭Minion Mode，当然你也可以推广到有许多设置的情况：

![](http://swift.gg/img/articles/swift-2-0-protocol-oriented-mvvm/Simulator-Screen-Shot-Aug-17-2015-8.26.21-AM.png1444269944.206409)

## 视图单元格

一个拥有`label`和`switch`按钮的`cell`是很通用的。你可以把相同的 `cell` 运用在不同的地方，比如放在登录界面的 Remember Me 设置中。因此，你想让这个视图通用化。

### 复杂的配置方法

通常，我会在 `cell` 中使用配置(`configure`)方法来追踪在应用程序不同部分的所有可能用到这个 `cell` 的设置。这个方法大概是这样的：

    
    class SwitchWithTextTableViewCell: UITableViewCell {
        
        @IBOutlet private weak var label: UILabel!
        @IBOutlet private weak var switchToggle: UISwitch!
        
        typealias onSwitchToggleHandlerType = (switchOn: Bool) -> Void
        private var onSwitchToggleHandler: onSwitchToggleHandlerType?
        
        override func awakeFromNib() {
            super.awakeFromNib()
        }
        
        func configure(withTitle title: String,
            switchOn: Bool,
            onSwitchToggleHandler: onSwitchToggleHandlerType? = nil)
        {
            label.text = title
            switchToggle.on = switchOn
            
            self.onSwitchToggleHandler = onSwitchToggleHandler
        }
        
        @IBAction func onSwitchToggle(sender: UISwitch) {
            onSwitchToggleHandler?(switchOn: sender.on)
        }
    }

使用 Swift 的默认参数，可以非常方便的，在不修改其他地方代码的情况下，添加额外的设置。举个例子，当设计师需要你将 switch 按钮的颜色改成不同颜色时，可以像下面这样添加一个默认的参数：

    
    func configure(withTitle title: String,
        switchOn: Bool,
        switchColor: UIColor = .purpleColor(),
        onSwitchToggleHandler: onSwitchToggleHandlerType? = nil) {
        label.text = title
        switchToggle.on = switchOn
        // color option added!
        switchToggle.onTintColor = switchColor
        
        self.onSwitchToggleHandler = onSwitchToggleHandler
    }

在这个案例中，这样写好像没什么大不了的，但是在现实中，这个配置(configure)方法会随着时间的增长和需求的增加变得又长又复杂。这就是需要酷酷的面向协议编程方式出场的地方了。

### 面向协议的实现方式

    
    protocol SwitchWithTextCellProtocol {
        var title: String { get }
        var switchOn: Bool { get }
        
        func onSwitchTogleOn(on: Bool)
    }
    
    class SwitchWithTextTableViewCell: UITableViewCell {
    
        @IBOutlet private weak var label: UILabel!
        @IBOutlet private weak var switchToggle: UISwitch!
    
        private var delegate: SwitchWithTextCellProtocol?
        
        override func awakeFromNib() {
            super.awakeFromNib()
        }
        
        func configure(withDelegate delegate: SwitchWithTextCellProtocol) {
            self.delegate = delegate
            
            label.text = delegate.title
            switchToggle.on = delegate.switchOn
        }
    
        @IBAction func onSwitchToggle(sender: UISwitch) {
            delegate?.onSwitchTogleOn(sender.on)
        }
    }

当设计师又过来想要添加修改默认颜色的方法时，协议扩展就可以发挥神奇的作用了。

    
    extension SwitchWithTextCellProtocol {
        
        // 这里设置默认颜色
        func switchColor() -> UIColor {
            return .purpleColor()
        }
    }
    
    class SwitchWithTextTableViewCell: UITableViewCell {
        
        // 省略部分同上
    
        func configure(withDelegate delegate: SwitchWithTextCellProtocol) {
            self.delegate = delegate
            
            label.text = delegate.title
            switchToggle.on = delegate.switchOn
            // 颜色选项被添加
            switchToggle.onTintColor = delegate.switchColor()
        }
    }

协议扩展实现了默认 `switch` 颜色的选项，所以任何实现这个协议或不关心设置颜色的不要担心。只有新的 `cell` 可以设置一次不同的 `switch` 颜色。

### ViewModel

现在，剩下的部分就很简单了。我需要为 `Minion Mode` 设置一个 `ViewModel`：

    swuft
    import UIKit
    
    struct MinionModeViewModel: SwitchWithTextCellProtocol {
        var title = "Minion Mode!!!"
        var switchOn = true
        
        func onSwitchTogleOn(on: Bool) {
            if on {
                print("The Minions are here to stay!")
            } else {
                print("The Minions went out to play!")
            }
        }
        
        func switchColor() -> UIColor {
            return .yellowColor()
        }
    }

### ViewController

最后一步就是把 `ViewModel` 传递给在 `ViewController` 中设置的 `cell`：

    
    import UIKit
    
    class SettingsViewController: UITableViewController {
    
        enum Setting: Int {
            case MinionMode
            // other settings here
        }
        
        override func viewDidLoad() {
            super.viewDidLoad()
        }
    
        // MARK: - Table view data source
    
        override func tableView(tableView: UITableView,
            numberOfRowsInSection section: Int) -> Int
        {
            return 1
        }
    
        override func tableView(tableView: UITableView,
            cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell
        {
            if let setting = Setting(rawValue: indexPath.row) {
                switch setting {
                case .MinionMode:
                    let cell = tableView.dequeueReusableCellWithIdentifier("SwitchWithTextTableViewCell", forIndexPath: indexPath) as! SwitchWithTextTableViewCell
                    
                    // this is where the magic happens!
                    cell.configure(withDelegate: MinionModeViewModel())
                    return cell
                }
            }
            
            return tableView.dequeueReusableCellWithIdentifier("defaultCell", forIndexPath: indexPath)
        }
    
    }

伴随着协议扩展的使用，面向协议编程开始变得有意义起来，而且我也希望找出可以多使用它的方式来。你可以在[这里](https://github.com/NatashaTheRobot/ProtocolOrientedMVVMExperimentSwift)下载到所有的代码例子。

## 更新: 分割cell的数据源协议和委托协议

在原文的评论里，Marc Baldwin 建议把 `cell` 的数据源和 `delegate` 分割成两个协议，就像 `UITableView` 那样，我喜欢这样的主意。接下来就是修改后的版本：

### View Cell

cell 有两个协议，两者都可以配置(configure)：

    
    import UIKit
    
    protocol SwitchWithTextCellDataSource {
        var title: String { get }
        var switchOn: Bool { get }
    }
    
    protocol SwitchWithTextCellDelegate {
        func onSwitchTogleOn(on: Bool)
        
        var switchColor: UIColor { get }
        var textColor: UIColor { get }
        var font: UIFont { get }
    }
    
    extension SwitchWithTextCellDelegate {
        
        var switchColor: UIColor {
            return .purpleColor()
        }
        
        var textColor: UIColor {
            return .blackColor()
        }
        
        var font: UIFont {
            return .systemFontOfSize(17)
        }
    }
    
    class SwitchWithTextTableViewCell: UITableViewCell {
    
        @IBOutlet private weak var label: UILabel!
        @IBOutlet private weak var switchToggle: UISwitch!
    
        private var dataSource: SwitchWithTextCellDataSource?
        private var delegate: SwitchWithTextCellDelegate?
        
        override func awakeFromNib() {
            super.awakeFromNib()
        }
        
        func configure(withDataSource dataSource: SwitchWithTextCellDataSource, delegate: SwitchWithTextCellDelegate?) {
            self.dataSource = dataSource
            self.delegate = delegate
            
            label.text = dataSource.title
            switchToggle.on = dataSource.switchOn
            // color option added!
            switchToggle.onTintColor = delegate?.switchColor
        }
    
        @IBAction func onSwitchToggle(sender: UISwitch) {
            delegate?.onSwitchTogleOn(sender.on)
        }
    }

### ViewModel

现在可以在扩展里把数据源和`delegate`逻辑分开了：

    
    import UIKit
    
    struct MinionModeViewModel: SwitchWithTextCellDataSource {
        var title = "Minion Mode!!!"
        var switchOn = true
    }
    
    extension MinionModeViewModel: SwitchWithTextCellDelegate {
        
        func onSwitchTogleOn(on: Bool) {
            if on {
                print("The Minions are here to stay!")
            } else {
                print("The Minions went out to play!")
            }
        }
        
        var switchColor: UIColor {
            return .yellowColor()
        }
    }

### ViewController

这部分不太好理解 -`ViewController`会传入两次`viewModel`：

    
    override func tableView(tableView: UITableView,
            cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
            if let setting = Setting(rawValue: indexPath.row) {
                switch setting {
                case .MinionMode:
                    let cell = tableView.dequeueReusableCellWithIdentifier("SwitchWithTextTableViewCell", forIndexPath: indexPath) as! SwitchWithTextTableViewCell
                    
                    // 发生魔法的地方
                    let viewModel = MinionModeViewModel()
                    cell.configure(withDataSource: viewModel, delegate: viewModel)
                    return cell
                }
            }
            
            return tableView.dequeueReusableCellWithIdentifier("defaultCell", forIndexPath: indexPath)
        }

我更新示例代码，在[我的Github里](https://github.com/NatashaTheRobot/ProtocolOrientedMVVMExperimentSwift)。
