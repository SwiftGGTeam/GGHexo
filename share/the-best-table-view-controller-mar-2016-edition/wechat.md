TableViewController 的最佳实践"

> 作者：Dominik Hauser，[原文链接](http://swiftandpainless.com/the-best-table-view-controller-mar-2016-edition/)，原文日期：2016-03-28
> 译者：[Doye](undefined)；校对：[way](undefined)；定稿：[shanks](http://codebuild.me/)
  









在阅读 [obc.io关于轻量级的viewConroller相关讨论](https://www.objc.io/issues/1-view-controllers/lighter-view-controllers/)之后，每隔几个月我都会反思怎样做才是TableviewController 的最佳实践，我曾经尝试过几种不同的方法包括把 datasource 和 delefate 放到一个独立的类中或者使用 MVVM 架构来对 Cell 进行定制。

本篇是在 2016 年我对这个问题的思索，而且我对这个方案十分满意，方案涉及到了泛型，协议，和值类型。


最主要的一部分是 TableviewController 的基类，它管理着模型数据存储的数组，还需要注册 Cell 类和实现 tableView 所需要的 datasoure 相关的函数。

我们的类定义如下：

    
    import UIKit
    
    class TableViewController<T, Cell: UITableViewCell where Cell: Configurable>: UITableViewController {
    
    }

这个我们设计的基类是一个 **UITableViewController** 的子类，形参 *Cell** 是一个遵循 **Configurable** 协议的 **UITableViewCell**，这个协议十分简单：

    
    import Foundation
    
    protocol Configurable {
      func config(withItem item: Any)
    }

这个 Cell 将会在 **TableViewController** 中注册然后塞进队列，对于这个 Cell 的 identifier 我们可以有一个私有属性的对应：

然后我们需要一个数组来存储要在 table View 中要展示的数据：

    
    var data = [T]() {
      didSet {
        tableView.reloadData()
        if tableView.numberOfRowsInSection(0) > 0 {
          tableView.scrollToRowAtIndexPath(NSIndexPath(forRow: 0,inSection: 0),
                                           atScrollPosition: .Top,
                                           animated: true)
        }
      }
    }

无论数据什么时候被更新，在列表视图中的 **reloadData()** 方法会被调用，而且整个列表视图将上滑至顶部，下面我们定义初始化方法：

    
    init() { super.init(nibName: nil, bundle: nil) }
在 **viewDidLoad()** 之中我们对于 TableView 进行设置：

    
    override func viewDidLoad() {
      super.viewDidLoad()
      tableView.registerClass(Cell.self, forCellReuseIdentifier: cellIdentifier)
      tableView.rowHeight = UITableViewAutomaticDimension
      tableView.estimatedRowHeight = 60
    }
剩下的就是对 **UITableViewDataSource** 进行补全：

    
    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
      return data.count
    }
    
    override func tableView(tableView: UITableView,
                            cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
      let cell = tableView.dequeueReusableCellWithIdentifier(cellIdentifier,
                                                             forIndexPath: indexPath) as! Cell
      cell.config(withItem: data[indexPath.row])
      return cell
    }
这里一个需要注意的部分是 **cell.config(withItem: data[indexPath.row])** 这意味着 cell 将负责其内部各种控件展示的内容的填充。

这里是完整的基类的代码：

    
    import UIKit
    
    class TableViewController<T, Cell: UITableViewCell where Cell: Configurable>: UITableViewController {
      
      private let cellIdentifier = String(Cell)
      var data = [T]() {
        didSet {
          tableView.reloadData()
          if tableView.numberOfRowsInSection(0) > 0 {
            tableView.scrollToRowAtIndexPath(NSIndexPath(forRow: 0,inSection: 0),
                                             atScrollPosition: .Top,
                                             animated: true)
          }
        }
      }
      
      init() { super.init(nibName: nil, bundle: nil) }
      
      override func viewDidLoad() {
        super.viewDidLoad()
        tableView.registerClass(Cell.self, forCellReuseIdentifier: cellIdentifier)
        tableView.rowHeight = UITableViewAutomaticDimension
        tableView.estimatedRowHeight = 60
      }
      
      // MARK: - Table view data source
      override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return data.count
      }
      
      override func tableView(tableView: UITableView,
                              cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier(cellIdentifier,
                                                               forIndexPath: indexPath) as! Cell
        cell.config(withItem: data[indexPath.row])
        return cell
      }
    }
我们可以利用这个基类来定义一个 TableViewController 来实现让用户输入一个字符串对于 Github 的用户来进行匹配查找：

    
    class UserSearchTableViewController<T: protocol<DictCreatable, LabelsPresentable, UserProtocol>>: TableViewController<T, TwoLabelCell>, UISearchBarDelegate {
    
      var searchString: String? {
        didSet {
          guard let searchString = searchString where searchString.characters.count > 0 else { return }
          let fetch = APIClient<T>().fetchUsers(forSearchString: searchString)
          fetch { (items, error) -> Void in
            guard let theItems = items else { return }
            self.data = theItems.map { $0 }
          }
        }
      }
      
      override func viewDidLoad() {
        super.viewDidLoad()
        
        title = "User"
        
        let searchBar = UISearchBar(frame: CGRect(x: 0, y: 0, width: view.frame.size.width, height: 40))
        searchBar.placeholder = "Github username"
        searchBar.delegate = self
        tableView.tableHeaderView = searchBar
      }
      
      func searchBarSearchButtonClicked(searchBar: UISearchBar) {
        searchBar.resignFirstResponder()
        searchString = searchBar.text
      }
      
      override func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        let next = RepositoriesTableViewController<Repository>()
        next.username = self.data[indexPath.row].name
        navigationController?.pushViewController(next, animated: true)
        
      }
    }
以上便是一个完整的 TableViewController，大部分的代码对于 searchBar 的展示和逻辑处理，是不是很简洁？

我们会这样来初始化 **UserSearchTableViewController**：

    
    let viewController = UserSearchTableViewController<User>()
最后，这里是 **TwoLabelCell** 我自己的实现

    
    import UIKit
    
    class TwoLabelCell: UITableViewCell, Configurable {
    
      let nameLabel: UILabel
      let descriptionLabel: UILabel
      
      override init(style: UITableViewCellStyle, reuseIdentifier: String?) {
        nameLabel = UILabel()
        nameLabel.font = UIFont.preferredFontForTextStyle(UIFontTextStyleHeadline)
        
        descriptionLabel = UILabel()
        descriptionLabel.font = UIFont.preferredFontForTextStyle(UIFontTextStyleSubheadline)
        descriptionLabel.numberOfLines = 2
        
        let stackView = UIStackView(arrangedSubviews: [nameLabel, descriptionLabel])
        stackView.translatesAutoresizingMaskIntoConstraints = false
        stackView.axis = .Vertical
        
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        
        addSubview(stackView)
        
        let views = ["stackView": stackView]
        var layoutConstraints = [NSLayoutConstraint]()
        layoutConstraints += NSLayoutConstraint.constraintsWithVisualFormat("|-[stackView]-|", options: [], metrics: nil, views: views)
        layoutConstraints += NSLayoutConstraint.constraintsWithVisualFormat("V:|-[stackView]-|", options: [], metrics: nil, views: views)
        NSLayoutConstraint.activateConstraints(layoutConstraints)
      }
      
      required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
      }
      
      func config(withItem item: Any) {
        guard let item = item as? LabelsPresentable else { return }
        let texts = item.texts
        if texts.count > 0 {
          nameLabel.text = texts[0]
        }
        if texts.count > 1 && texts[1].characters.count > 0 {
          descriptionLabel.text = texts[1]
        }
      }
    }

在[Github](https://github.com/dasdom/TableViewMarch2016)有源码还有另一个遵循类似架构的 TableViewController 实例


> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。