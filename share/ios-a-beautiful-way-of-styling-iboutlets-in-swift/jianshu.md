Swift 小贴士: 优雅地设置 IBOutlets"

> 作者：Natasha，[原文链接](http://natashatherobot.com/ios-a-beautiful-way-of-styling-iboutlets-in-swift/)，原文日期：2015/07/29
> 译者：[Channe](undefined)；校对：[numbbbbb](https://github.com/numbbbbb)；定稿：[小锅](http://www.jianshu.com/users/3b40e55ec6d5/latest_articles)
  







早上我看到[@jesse_squires](https://twitter.com/jesse_squires/)发了个好推:

> [#Swift](https://twitter.com/hashtag/Swift?src=hash)小贴士: 在`IBOutlets`的`didSet`中设置视图,而不是将代码塞满`viewDidLoad`。这样更清晰，同样只被调用一次.
>
> -- Jesse Squires (@jesse_squires) 2015 年 7 月 29 日。

设置 App 界面元素的颜色、字体和辅助功能总是很痛苦。理想情况下，storyboard 能搞定，但是 storyboard 中的颜色管理相当糟糕(可以用[Xcode调色板](http://natashatherobot.com/xcode-color-palette/)缓解这种痛苦)。更糟糕的是，比之更高级的辅助功能选项并不能在 storyboard 中设置。

因此我个人更喜欢在代码中设置，这样在重新设计 App 时更容易看到所有颜色/字体/辅助功能等的变化. 我经常看到 Jesse 说的那种超长 viewDidLoad 方法，我试图把它们提取到一个或多个私有扩展中：

    
    import UIKit
    
    class ViewController: UIViewController {
    
        @IBOutlet weak var myLabel: UILabel!
        @IBOutlet weak var myOtherLabel: UILabel!
        @IBOutlet weak var myButton: UIButton!
        
        override func viewDidLoad() {
            super.viewDidLoad()
            
            // 提取到私有方法中,让viewDidLoad更短
            configureStyling()
        }
    }
    
    // MARK: 界面样式
    private extension ViewController {
        
        func configureStyling() {
            myLabel.textColor = UIColor.purpleColor()
            myOtherLabel.textColor = UIColor.yellowColor()
            myButton.tintColor = UIColor.magentaColor()
        }
    }

然而,我真的很喜欢 Jesse 方案的可读性和简洁性:

    
    import UIKit
    
    class ViewController: UIViewController {
    
        @IBOutlet weak var myLabel: UILabel! {
            didSet {
                myLabel.textColor = UIColor.purpleColor()
            }
        }
        
        @IBOutlet weak var myOtherLabel: UILabel! {
            didSet {
                myOtherLabel.textColor = UIColor.yellowColor()
            }
        }
        
        @IBOutlet weak var myButton: UIButton! {
            didSet {
                myButton.tintColor = UIColor.magentaColor()
            }
        }
        
        override func viewDidLoad() {
            super.viewDidLoad()
        }
    }

是时候去重构代码了!

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。