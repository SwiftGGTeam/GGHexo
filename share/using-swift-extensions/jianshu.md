“错误”的使用 Swift 中的 Extension"

> 作者：Natasha，[原文链接](https://www.natashatherobot.com/using-swift-extensions/)，原文日期：2016-03-29
> 译者：[bestswifter](http://bestswifter.com)；校对：[shanks](http://codebuild.me/)；定稿：[Channe](undefined)
  









别人一看到我的 Swift 代码，立刻就会问我为什么如此频繁的使用 extension。这是前几天在我写的另一篇文章中收到的评论：

![](http://swift.gg/img/articles/using-swift-extensions/Screen-Shot-2016-03-29-at-9.30.16-AM-1024x160.png1463365519.9019809)

我大量使用 extension 的主要目的是为了提高代码可读性。以下是我喜欢使用 extension 的场景，尽管 extension 并非是为这些场景设计的。



### 私有的辅助函数

在 Objective-C 中，我们有 .h 文件和 .m 文件。同时管理这两个文件（以及在工程中有双倍的文件）是一件很麻烦的事情，好在我们只要快速浏览 .h 文件就可以知道这个类对外暴露的 API，而内部的信息则被保存在 .m 文件中。在 Swift 中，我们只有一个文件。

为了一眼就看出一个 Swift 类的公开方法（可以被外部访问的方法），我把内部实现都写在一个私有的 extension 中，比如这样：

    
    // 这样可以一眼看出来，这个结构体中，那些部分可以被外部调用
    struct TodoItemViewModel {    
        let item: TodoItem
        let indexPath: NSIndexPath
        
        var delegate: ImageWithTextCellDelegate {
            return TodoItemDelegate(item: item)
        }
        
        var attributedText: NSAttributedString {
            // the itemContent logic is in the private extension
            // keeping this code clean and easy to glance at
            return itemContent
        }
    }
    
    
    // 把所有内部逻辑和外部访问的 API 区隔开来
    // MARK: 私有的属性和方法
    private extension TodoItemViewModel {
        
        static var spaceBetweenInlineImages: NSAttributedString {
            return NSAttributedString(string: "   ")
        }
        
        var itemContent: NSAttributedString {
            let text = NSMutableAttributedString(string: item.content, attributes: [NSFontAttributeName : SmoresFont.regularFontOfSize(17.0)])
            
            if let dueDate = item.dueDate {
                appendDueDate(dueDate, toText: text)
            }
            
            for assignee in item.assignees {
                appendAvatar(ofUser: assignee, toText: text)
            }
            
            return text
        }
        
        func appendDueDate(dueDate: NSDate, toText text: NSMutableAttributedString) {
            
            if let calendarView = CalendarIconView.viewFromNib() {
                calendarView.configure(withDate: dueDate)
                
                if let calendarImage = UIImage.imageFromView(calendarView) {
                    appendImage(calendarImage, toText: text)
                }
            }
        }
        
        func appendAvatar(ofUser user: User, toText text: NSMutableAttributedString) {
            if let avatarImage = user.avatar {
                appendImage(avatarImage, toText: text)
            } else {
                appendDefaultAvatar(ofUser: user, toText: text)
                downloadAvatarImage(forResource: user.avatarResource)
            }
        }
        
        func downloadAvatarImage(forResource resource: Resource?) {
            if let resource = resource {
                KingfisherManager.sharedManager.retrieveImageWithResource(resource,
                    optionsInfo: nil,
                    progressBlock: nil)
                    { image, error, cacheType, imageURL in
                        if let _ = image {
                            dispatch_async(dispatch_get_main_queue()) {
                                NSNotificationCenter.defaultCenter().postNotificationName(TodoItemViewModel.viewModelViewUpdatedNotification, object: self.indexPath)
                            }
                        }
                }
            }
        }
        
        func appendDefaultAvatar(ofUser user: User, toText text: NSMutableAttributedString) {
            if let defaultAvatar = user.defaultAvatar {
                appendImage(defaultAvatar, toText: text)
            }
        }
        
        func appendImage(image: UIImage, toText text: NSMutableAttributedString) {
            text.appendAttributedString(TodoItemViewModel.spaceBetweenInlineImages)
            let attachment = NSTextAttachment()
            attachment.image = image
            let yOffsetForImage = -7.0 as CGFloat
            attachment.bounds = CGRectMake(0.0, yOffsetForImage, image.size.width, image.size.height)
            let imageString = NSAttributedString(attachment: attachment)
            text.appendAttributedString(imageString)
        }
    }

注意，在上面这个例子中，属性字符串的计算逻辑非常复杂。如果把它写在结构体的主体部分中，我就无法一眼看出这个结构体中哪个部分是重要的（也就是 Objective-C 中写在 .h 文件中的代码）。在这个例子中，使用 extension 使我的代码结构变得更加清晰整洁。

这样一个很长的 extension 也为日后重构代码打下了良好的基础。我们有可能把这段逻辑抽取到一个单独的结构体中，尤其是当这个属性字符串可能在别的地方被用到时。但在编程时把这段代码放在私有的 extension 里面是一个良好的开始。

### 分组

我最初开始使用 extension 的真正原因是在 Swift 刚诞生时，无法使用 pragma 标记（译注：Objective-C 中的 #pragma mark）。是的，这就是我在 Swift 刚诞生时想做的第一件事。我使用 pragma 来分割 Objective-C 代码，所以当我开始写 Swift 代码时，我**需要**它。

所以我在 WWDC Swift 实验室时询问苹果工程师如何在 Swift 中使用 pragma 标记。和我交流的那位工程师建议我[使用 extension 来替代 pragma 标记](http://stackoverflow.com/questions/24017316/pragma-mark-in-swift/24069206#24069206)。于是我就开始这么做了，并且立刻爱上了使用 extension。

尽管 pragma 标记（Swift 中的 //MARK）很好用，但我们很容易忘记给一段新的代码加上 MARK 标记，尤其是你处在一个具有不同代码风格的小组中时。这往往会导致若干个无关函数被放在了同一个组中，或者某个函数处于错误的位置。所以如果有一组函数应该写在一起，我倾向于把他们放到一个 extension 中。

一般我会用一个 extension 存放 ViewController 或者 AppDelegate 中所有初始化 UI 的函数，比如：

    
    private extension AppDelegate {
        
        func configureAppStyling() {
            styleNavigationBar()
            styleBarButtons()
        }
        
        func styleNavigationBar() {
            UINavigationBar.appearance().barTintColor = ColorPalette.ThemeColor
            UINavigationBar.appearance().tintColor = ColorPalette.TintColor
            
            UINavigationBar.appearance().titleTextAttributes = [
                NSFontAttributeName : SmoresFont.boldFontOfSize(19.0),
                NSForegroundColorAttributeName : UIColor.blackColor()
            ]
        }
        
        func styleBarButtons() {
            let barButtonTextAttributes = [
                NSFontAttributeName : SmoresFont.regularFontOfSize(17.0),
                NSForegroundColorAttributeName : ColorPalette.TintColor
            ]
            UIBarButtonItem.appearance().setTitleTextAttributes(barButtonTextAttributes, forState: .Normal)
        }
    }

或者把所有和通知相关的逻辑放到一起：

    
    extension TodoListViewController {
        
        // 初始化时候调用
        func addNotificationObservers() {
            NSNotificationCenter.defaultCenter().addObserver(self, selector: Selector("onViewModelUpdate:"), name: TodoItemViewModel.viewModelViewUpdatedNotification, object: nil)
            NSNotificationCenter.defaultCenter().addObserver(self, selector: Selector("onTodoItemUpdate:"), name: TodoItemDelegate.todoItemUpdatedNotification, object: nil)
        }
        
        func onViewModelUpdate(notification: NSNotification) {
            if let indexPath = notification.object as? NSIndexPath {
                tableView.reloadRowsAtIndexPaths([indexPath], withRowAnimation: .None)
            }
        }
        
        func onTodoItemUpdate(notification: NSNotification) {
            if let itemObject = notification.object as? ValueWrapper<TodoItem> {
                let updatedItem = itemObject.value
                let updatedTodoList = dataSource.listFromUpdatedItem(updatedItem)
                dataSource = TodoListDataSource(todoList: updatedTodoList)
            }
        }
    }

### 遵守协议

这是一种特殊的分组，我会把所有用来实现某个协议的方法放到一个 extension 中。在 Objective-C 中，我习惯使用 pragma 标记。不过我喜欢 extension 更加彻底的分割和更好的可读性：

    
    struct TodoItemViewModel {
        static let viewModelViewUpdatedNotification = "viewModelViewUpdatedNotification"
        
        let item: TodoItem
        let indexPath: NSIndexPath
        
        var delegate: ImageWithTextCellDelegate {
            return TodoItemDelegate(item: item)
        }
        
        var attributedText: NSAttributedString {
            return itemContent
        }
    }
    
    // 遵循 ImageWithTextCellDataSource 协议实现
    extension TodoItemViewModel: ImageWithTextCellDataSource {
        
        var imageName: String {
            return item.completed ? "checkboxChecked" : "checkbox"
        }
        
        var attributedText: NSAttributedString {
            return itemContent
        }
    }

这种方法同样非常适用于分割 UITableViewDataSource 和 UITableViewDelegate 的代码：

    
    // MARK: 表格视图数据源
    extension TodoListViewController: UITableViewDataSource {
        
        func numberOfSectionsInTableView(tableView: UITableView) -> Int {
            return dataSource.sections.count
        }
        
        func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
            return dataSource.numberOfItemsInSection(section)
        }
        
        func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
            let cell = tableView.dequeueReusableCellWithIdentifier(String.fromClass(ImageWithTextTableViewCell), forIndexPath: indexPath) as! ImageWithTextTableViewCell
            let viewModel = dataSource.viewModelForCell(atIndexPath: indexPath)
            cell.configure(withDataSource: viewModel, delegate: viewModel.delegate)
            return cell
        }
    }
    
    // MARK: 表格视图代理
    extension TodoListViewController: UITableViewDelegate {
        
        // MARK: 响应列选择
        func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
            performSegueWithIdentifier(todoItemSegueIdentifier, sender: self)
        }
        
        // MARK: 头部视图填充
        func tableView(tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
            if dataSource.sections[section] == TodoListDataSource.Section.DoneItems {
                let view = UIView()
                view.backgroundColor = ColorPalette.SectionSeparatorColor
                return view
            }
            return nil
        }
        
        func tableView(tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
            if dataSource.sections[section] == TodoListDataSource.Section.DoneItems {
                return 1.0
            }
            
            return 0.0
        }
        
        // MARK: 删除操作处理
        func tableView(tableView: UITableView, canEditRowAtIndexPath indexPath: NSIndexPath) -> Bool {
            return true
        }
        
        func tableView(tableView: UITableView, editActionsForRowAtIndexPath indexPath: NSIndexPath) -> [UITableViewRowAction]?  {
    
            let deleteAction = UITableViewRowAction(style: .Destructive, title: "Delete") { [weak self] action , indexPath in
                if let updatedTodoList = self?.dataSource.listFromDeletedIndexPath(indexPath) {
                    self?.dataSource = TodoListDataSource(todoList: updatedTodoList)
                }
            }
            
            return [deleteAction]
        }
    }

### 模型（Model）

这是一种我在使用 Objective-C 操作 Core Data 时就喜欢采用的方法。由于模型发生变化时，Xcode 会生成相应的模型，所以函数和其他的东西都是写在 extension 或者 category 里面的。

在 Swift 中，我尽可能多的尝试使用结构体，但我依然喜欢使用 extension 将 Model 的属性和基于属性的计算分割开来。这使 Model 的代码更容易阅读：

    
    struct User {
        let id: Int
        let name: String
        let avatarResource: Resource?
    }
    
    extension User {
        
        var avatar: UIImage? {
            if let resource = avatarResource {
                if let avatarImage = ImageCache.defaultCache.retrieveImageInDiskCacheForKey(resource.cacheKey) {
                    let imageSize = CGSize(width: 27, height: 27)
                    let resizedImage = Toucan(image: avatarImage).resize(imageSize, fitMode: Toucan.Resize.FitMode.Scale).image
                    return Toucan.Mask.maskImageWithEllipse(resizedImage)
                }
            }
            return nil
        }
        
        var defaultAvatar: UIImage? {
            if let defaultImageView = DefaultImageView.viewFromNib() {
                defaultImageView.configure(withLetters: initials)
                if let defaultImage = UIImage.imageFromView(defaultImageView) {
                    return Toucan.Mask.maskImageWithEllipse(defaultImage)
                }
            }
            
            return nil
        }
        
        var initials: String {
            var initials = ""
            
            let nameComponents = name.componentsSeparatedByCharactersInSet(.whitespaceAndNewlineCharacterSet())
            
            // 得到第一个单词的第一个字母
            if let firstName = nameComponents.first, let firstCharacter = firstName.characters.first {
                initials.append(firstCharacter)
            }
            
            // 得到最后一个单词的第一个字母
            if nameComponents.count > 1 {
                if let lastName = nameComponents.last, let firstCharacter = lastName.characters.first {
                    initials.append(firstCharacter)
                }
            }
            
            return initials
        }
    }

### 长话短说（TL;DR）

尽管这些用法可能不那么“传统”，但 Swift 中 extension 的简单使用，可以让代码质量更高，更具可读性。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。