Alert Controller 中实现可编辑文本字输入框教程

> 作者：Arthur Knopper，[原文链接](http://www.ioscreator.com/tutorials/editable-text-field-alert-controller-tutorial)，原文日期：2015-12-21
> 译者：[pmst](http://www.jianshu.com/users/596f2ba91ce9/latest_articles)；校对：[Cee](https://github.com/Cee)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  










UIAlertController 类不仅用于呈现警告弹窗，还能够提供 Text Fields 来获取文本信息输入。本教程演示了从用户处获取账号和密码，并打印到终端中。此教程开发环境为 Xcode 7.2 以及 iOS 9。

打开X code，创建一个 Single View Application。输入项目名称：**IOS9TextFieldAlertControllerTutorial**，接着填写你独有的 Organization Name 以及 Organization Identifier。选择语言为 Swift 并确保设备为 iPhone 。



![](https://swift.gg/img/articles/editable-text-field-alert-controller-tutorial/format=1500w1451868017.9978042)

前往 Storyboard。从 Object Library（译者注：快捷键 Command + Option + Control + 3） 中拖拽一个按钮（UIButton）到主视图中。双击按钮设置 title 名为 「Log in」。此刻保持按钮为选中状态，按下 Ctrl 键，使用鼠标左键拖拽一条线到主视图上方，弹出黑色信息框，使用 Shift 键选中「Vertical Spacing to Top Layout Guide」和「Center Horizontally in Container」两个选项。

![](https://swift.gg/img/articles/editable-text-field-alert-controller-tutorial/1451868018.5434368)

Storyboard 应该是这个样子的。

![](https://swift.gg/img/articles/editable-text-field-alert-controller-tutorial/format=1500w1451868018.9260972)

（译者注：也许你的界面呈现了黄色约束警告，你需要使用 Command + Option + = 快捷键来更新下。）

选中 Assistant Editor ，确保 **ViewControllers.swift** 可见。选中按钮使用 Ctrl + 左键拖拽方式创建如下 Action。

![](https://swift.gg/img/articles/editable-text-field-alert-controller-tutorial/format=750w1451868019.366837)

在 **ViewController** 类中实现 **login** 方法：

    
    @IBAction func login(sender: AnyObject) {
        // 1.
        var usernameTextField: UITextField?
        var passwordTextField: UITextField?
        
        // 2.  
        let alertController = UIAlertController(
          title: "Log in",
          message: "Please enter your credentials",
          preferredStyle: UIAlertControllerStyle.Alert)
        
        // 3.  
        let loginAction = UIAlertAction(
          title: "Log in", style: UIAlertActionStyle.Default) {
            (action) -> Void in
            
              if let username = usernameTextField?.text {
                print(" Username = \(username)")
              } else {
                print("No Username entered")
              }
            
              if let password = passwordTextField?.text {
                print("Password = \(password)")
              } else {
                print("No password entered")
              }
        }
        
        // 4.
        alertController.addTextFieldWithConfigurationHandler {
          (txtUsername) -> Void in
            usernameTextField = txtUsername
            usernameTextField!.placeholder = "<Your username here>"
        }
        
        alertController.addTextFieldWithConfigurationHandler {
          (txtPassword) -> Void in
            passwordTextField = txtPassword
            passwordTextField!.secureTextEntry = true
            passwordTextField!.placeholder = "<Your password here>"
        }
        
        // 5.
        alertController.addAction(loginAction)
        self.presentViewController(alertController, animated: true, completion: nil)
      }

  1. 创建两个可选类型的 UITextField 变量用于警告弹窗。
  2. 创建一个 Alert 样式的 AlertController。
  3. 创建一个 Alert Action，闭包体中执行如下行为：将 textField 输入的信息打印到终端中。
  4. addTextFieldWithConfigurationHandler 方法用于添加文本输入框（text input fields），闭包接收 Text Filed 作为参数变量。
  5. 将登录动作添加到 AlertController 中，同时呈现该控制器。

**构建并运行**该工程，点击 Login 按钮，填充 AlertController 中的 username 和 password 字段。输入内容随之打印到终端中。

![](https://swift.gg/img/articles/editable-text-field-alert-controller-tutorial/format=1500w1451868019.8416817)

你可以前往 ioscreator 的 GitHub 仓库下载 [IOS9TextFieldAlertControllerTutorial](https://github.com/ioscreator/ioscreator) 源代码。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。