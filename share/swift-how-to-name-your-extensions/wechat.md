如何为您的扩展取个好听的名字"

> 作者：Natasha，[原文链接](http://natashatherobot.com/swift-how-to-name-your-extensions/)，原文日期：2015-07-26
> 译者：[SergioChan](https://github.com/SergioChan)；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[numbbbbb](http://numbbbbb.com/)
  









发布于 2015 年 7 月 26 日

在 Swift 编程中，最吸引我的就是能在文件中创建多个扩展。这使得我可以把互相关联的方法放在一起。比如每次我向控制器添加一个新协议时，就可以把这个协议的方法放在同一个扩展中。同理，TableView 相关的私有样式初始化方法或者私有 cell 初始化方法都可以放入各自的扩展中。

美中不足的是，我们无法给扩展命名，只能使用`//MARK:`来标识各个扩展的位置。直到有一天，我向[@allonsykraken](https://twitter.com/allonsykraken)提出了这个问题，他告诉我一种简单的实现方法——使用`typealias`!



    
    
    import UIKit
    
    class ViewController: UIViewController {
    
        @IBOutlet weak var tableView: UITableView!
        
        override func viewDidLoad() {
            super.viewDidLoad()
            
            styleNavigationBar()
        }
    }
    
    private typealias TableViewDataSource = ViewController
    extension TableViewDataSource: UITableViewDataSource {
        
        func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
            return 5
        }
        
        func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
            let cell = tableView.dequeueReusableCellWithIdentifier("identifier", forIndexPath: indexPath)
            return cell
        }
    }
    
    private typealias TableViewDelegate = ViewController
    extension TableViewDelegate: UITableViewDelegate {
        
        func tableView(tableView: UITableView, heightForRowAtIndexPath indexPath: NSIndexPath) -> CGFloat {
            return 64.0
        }
    }
    
    private typealias ViewStylingHelpers = ViewController
    private extension ViewStylingHelpers {
        
        func styleNavigationBar() {
            // style navigation bar here
        }
    }

看完之后我的第一个问题是 - 在 Xcode 的导航栏里如何显示？不用担心，它们都会显示出来！

![image](http://swift.gg/img/articles/swift-how-to-name-your-extensions/Screen_Shot_2015-07-26_at_4_43_29_AM-1024x331.png1453208420.3375514)

你觉得这种方式如何？我需要你们帮我做出选择——使用`typealias`还是`MARK:`。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。�