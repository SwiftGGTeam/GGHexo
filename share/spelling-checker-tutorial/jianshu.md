拼写检查教程"

> 作者：Arthur Knopper，[原文链接](https://www.ioscreator.com/tutorials/spelling-checker-tutorial)，原文日期：2015-12-22
> 译者：[钟颖Cyan](undefined)；校对：[Cwift](http://weibo.com/277195544)；定稿：[CMB](https://github.com/chenmingbiao)
  









> 译者注：由于原文日期较早，文章代码已更新为新版本。

UITextChecker 对象可以用来对一个字符串进行拼写检查，在这篇教程里面我们将在一个 Table View 里面展示一些单词。当单词被选中的时候，会被进行拼写检查，拼写正确的背景将会变成绿色，否则将会变成红色。本教程在 Xcode 7.2 和 iOS 9 环境下进行。



打开 Xcode 并创建一个新的 Single View Application。用 **IOS9SpellingCheckerTutorial** 作为项目的名字，然后根据你的习惯填写 Organization Name 和 Organization Identifier。选择 Swift 作为开发语言，并且确保 Devices 为仅 iPhone。

![image](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5677d8939cadb68edf52f7f0/1450694803758/?format=1500w)

从 **Storyboard** 中把 View Controller 删掉并拖拽一个 Navigation Controller 到空画布中，当初始 View Controller 被删除时项目的入口就不存在了。选择 Navigation Controller 然后打开 Attribute Inspector，在 View Controller 这个区域里面勾选 "Is Initial View Controller"。

![image](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5677d920cbced60a2378e3f2/1450694945116/?format=750w)

双击 Table View Controller 的 Navigation Bar 然后把标题设置成 "Choose the right spelling"。选择 Table View Cell 后打开 Attribute Inspector，在 Table View Cell 这个区域把 Identifier 设置成 *"cell"*。

![image](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5677d9b4d8af102d24e0d8b0/1450695092590/?format=750w)

Storyboard 看起来像是这样：

![image](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5677da2e1115e0704eb30102/1450695215429/?format=2500w)

因为删除了 View Controller 从 Storyboard，所以可以同时删掉 ViewController.swift 文件。在项目中添加一个新的文件，选择 iOS->Source->Cocoa Touch Class，把它命名成 **TableViewController** 并继承自 UITableViewController。

![image](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5677da89d82d5eb8caa29132/1450695305683/?format=1500w)

打开 **TableViewController.swift** 文件并添加下面的成员

    
    let words = ["devalopment", "development","devellopment"]

这个数组里面的字符串将会被展示到 Table View 上面。下一步，修改预定义的代理方法：

    
     override func numberOfSections(in tableView: UITableView) -> Int {
            return 1;
        }
        
        override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
            return words.count
        }
        
        override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
            let cell = tableView.dequeueReusableCell(withIdentifier: "cell", for: indexPath)
    
            // 配置 cell...
            cell.textLabel?.text = words[indexPath.row]
            cell.textLabel?.backgroundColor = UIColor.clear
            return cell
        }

通过单词数组来展示 Table View，有一个区域，一共三行。cell 的背景色设置成透明色，因为在之后 cell 的背景色将会改变。当用户选中列表中的一行时，代理方法 `tableView(_:didSelectRowAt:)` 将会被调用：

    
        override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
            let cell = tableView.cellForRow(at: indexPath)!
            if wordIsSpelledCorrect(word: (cell.textLabel?.text)!) {
                cell.backgroundColor = UIColor.green
            } else {
                cell.backgroundColor = UIColor.red
            }
            
            tableView.reloadData()
        }

Table View Cell 将会被来自单词数组里面的单词初始化。如果单词拼写正确，cell 的背景色将变成绿色，否则将会变成红色。实际拼写检查的代码将会在 `wordIsSpelledCorrect` 方法里面实现：

    
    func wordIsSpelledCorrect(word: String) -> Bool {
        let checker = UITextChecker()
        let range = NSMakeRange(0, word.characters.count)
        let wordRange = checker.rangeOfMisspelledWord(in: word, range: range, startingAt: 0, wrap: false, language: "en")    
        return wordRange.location == NSNotFound
    }

**UITextChecker** 类可以用来检测一个字符串是否拼写正确，检测范围是整个单词。`rangeOfMisspelledWordInString` 方法用来检查拼写错误的范围。如果一个单词拼写正确的话，返回范围的 `location` 将会是 `NSNotFound` ，所以返回值是 `true`，否则的话返回 `false`。

**编译并运行**项目，选择列表的一行，如果拼写正确的话背景色会变成绿色，否则的话会变成红色。

![image](https://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/5677f3dd841abad6a8597af1/1450701789627/?format=1500w)

你可以在 ioscreator 的 [GitHub](https://github.com/ioscreator/ioscreator) 仓库里面找到 **IOS9SpellingCheckerTutorial** 的源码。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。