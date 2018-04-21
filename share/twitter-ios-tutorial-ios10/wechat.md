Twitter iOS 教程"

> 作者：Arthur Knopper，[原文链接](https://www.ioscreator.com/tutorials/twitter-ios-tutorial-ios10)，原文日期：2017/03/14
> 译者：[imiem](undefined)；校对：[pmst](http://www.jianshu.com/users/596f2ba91ce9/latest_articles)；定稿：[mmoaay](http://www.jianshu.com/u/2d46948e84e3)
  








Social Framework 使在 App 中使用社交分享成为可能。本教程中我们将从图库中选取一张图片，然后在 Twitter 中分享一个带图片的推文。本教程使用 Xcode 8.2.1 和 iOS 10.2。



打开 Xcode，创建一个 Single View Application。
![](http://swift.gg/img/articles/twitter-ios-tutorial-ios10/single-view-xcode-templateformat=750w1523791017.6382737)

Product Name 命名为 **IOS10TwitterTutorial**，填写自己的 Organization Name 和 Organization Identifier。Language 选择 Swift, 并确保 Devices 只选择了 iPhone。

![](http://swift.gg/img/articles/twitter-ios-tutorial-ios10/format=750w1523791017.6963322)

转到 Storyboard，拖拽一个 Image View 到主页面上。选中 Image View 跳转到属性选项卡。在 View 部分使用 "Aspect Fit" 模式。

![](http://swift.gg/img/articles/twitter-ios-tutorial-ios10/format=300w1523791017.7377508)

这种模式会使图片自适应 Image View。下一步，在页面的 Image View 下方添加两个 Button 按钮。title 分别设为 "Choose Image" 和 "Tweet"。

选中 Image View，点击 Storyboard 右下角 Auto Layout 的 Pin 按钮，填写下方的值，点击 Add 4 Constraints 按钮。

![](http://swift.gg/img/articles/twitter-ios-tutorial-ios10/format=300w1523791017.786322)

按住 Cmd 键选中 "Choose Image" 和 "Tweet" 按钮。点击 Storyboard 右下角的 Align 按钮然后选择 "Horizontally in Container"。点击 "Add 2 Constraints" 按钮添加约束。

![](http://swift.gg/img/articles/twitter-ios-tutorial-ios10/format=300w1523791017.8271823)

选中 "Choose Image" 按钮，点击 Storyboard 右下方的 Auto Layout 的 Pin 按钮，选中左边的线，点击 Add 1 Constraint 按钮添加约束。

![](http://swift.gg/img/articles/twitter-ios-tutorial-ios10/format=300w1523791017.870292)

选中 "Tweet" 按钮，点击 Storyboard 右下方的 Auto Layout 的 Pin 按钮，选中右边的线，点击 Add 1 Constraint 按钮添加约束。

![](http://swift.gg/img/articles/twitter-ios-tutorial-ios10/format=300w1523791017.91299)

Storyboard 看起来应如下图：

![](http://swift.gg/img/articles/twitter-ios-tutorial-ios10/format=300w1523791017.956209)

点击 Assistant Editor，确保 ViewController.swift 文件内容可见。接着选中 Image View ，按住 Ctrl 键鼠标左键拖拽一条线到  ViewController 类中，创建如下 Outlet 。

![](http://swift.gg/img/articles/twitter-ios-tutorial-ios10/format=300w1523791017.964874)

同上，选中 Choose Image 按钮，按住 Ctrl 键拖拽到 ViewController 类中，创建如下 Action。

![](http://swift.gg/img/articles/twitter-ios-tutorial-ios10/format=300w1523791018.0067496)

选中 Tweet 按钮，按住 Ctrl 键拖拽到 ViewController 类中，创建如下 Action。

![](http://swift.gg/img/articles/twitter-ios-tutorial-ios10/format=300w1523791018.0520294)

要想使用 Social framework，首先要将其导入到工程中。添加如下代码到 ViewController.swift 文件中。

    
    import Social

ViewController 访问图库需要遵循 UINavigtionControllerDelegate 和 UiImagePickerControllerDelegate 协议。将声明 ViewController 的代码改为：

    
    class ViewController: UIViewController, UINavigationControllerDelegate, UIImagePickerControllerDelegate {

在类中添加如下属性

    
    var pickerController: UIImagePickerController = UIImagePickerController()

下一步，实现 chooseImagePressed 方法

    
    @IBAction func chooseImagePressed(_ sender: Any) {
            
        // 1
        pickerController.delegate = self
        pickerController.sourceType = UIImagePickerControllerSourceType.photoLibrary
            
        // 2
        self.present(pickerController, animated: true, completion: nil)
    }

1. 将 View Controller 设为代理，同时设置图库的 sourceType。
2. 呈现图片选择视图控制器。

下一步，实现 tweetButtonPressed 方法来创建分享页。

    
    @IBAction func tweetButtonPressed(_ sender: Any) {
            
        // 1
        if SLComposeViewController.isAvailable(forServiceType: SLServiceTypeTwitter) {
                
            // 2
            let tweetSheet = SLComposeViewController(forServiceType: SLServiceTypeTwitter)
                
            // 3
            if let tweetSheet = tweetSheet {
                tweetSheet.setInitialText("Look at this nice picture!")
                tweetSheet.add(imageView.image)
                    
                // 4
                self.present(tweetSheet, animated: true, completion: nil)
            }
        } else {
                
            // 5
            print("error")
        }
    }

我们来看一下这个方法

1. 检查这个设备上是否有 twitter 账户。
2. 创建 SLComposeViewController 对象，该对象用于显示推文界面和全部的功能。
3. 在推文发布页面添加初始化文本和选中的图片。
4. 显示推文发布页面。
5. 如果没有 twitter 账户，在控制台打印一条信息。

最后，实现 `imagePickerController:didFinishPickingMediaWithInfo` 方法。这里指定图库中的照片到 image view 上。

    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
        imageView.image = info[UIImagePickerControllerOriginalImage] as? UIImage
            
        self.dismiss(animated: true, completion: nil)
    }

要想获得图库权限，必须要在 Info.plist 中添加一个键值（key）。打开 Info.plist 点击 + 添加如下键值。

![](http://swift.gg/img/articles/twitter-ios-tutorial-ios10/format=750w1523791018.0618207)

正常运行前，需要在 iOS 模拟器的设置中创建 Twitter 账号。

构建和运行工程。这个应用会请求访问图库的权限，点击允许。下一步，点击 "Choose Image"  按钮在图库中选择一张图片。下一步，点击 "Tweet" 按钮创建和发布推文。

![](http://swift.gg/img/articles/twitter-ios-tutorial-ios10/format=500w1523791018.070653)

可以从 [github](https://github.com/ioscreator/ioscreator) 上下载 IOS10TwitterTutorial 教程的源代码。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。