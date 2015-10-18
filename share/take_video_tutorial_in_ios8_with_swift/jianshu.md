iOS 8 中使用 Swift 录制视频教程

> 作者：Arthur Knopper，[原文链接](http://www.ioscreator.com/tutorials/take-video-tutorial-ios8-swift)，原文日期：2015/07/09
> 译者：[lfb_CD](http://weibo.com/lfbWb)；校对：[numbbbbb](https://github.com/numbbbbb)；定稿：[shanks](http://codebuild.me/)
  







苹果公司提供了`UIimagePickerController`-这是一个使用 iOS 设备内置的摄像头来拍摄视频的可视化界面。在此教程中，我们将拍摄一段保存到手机相册的视频。教程运行在 iOS 8.4 和 Xcode 6.4 下。

打开 Xcode 并创建一个`new Single View Application`,项目名称为`IOS8SwiftTakeVideoPlayerTutorial`，接着填上你的`Organization Name`和`Organization Identifier`，选择 Swift 语言，在设备一栏只选择 iPhone。

![](http://swift.gg/img/articles/take_video_tutorial_in_ios8_with_swift/format=750w1444269945.511148)



打开`Storyboard`，然后在主视图中拖入两个按钮，并分别设置两个`button`的`title`为`Take Video`和`View Library`。之后你的故事板内容应该像下面这样：

![](http://swift.gg/img/articles/take_video_tutorial_in_ios8_with_swift/format=750w1444269945.693111)

按住 `Control`键 并选中两个按钮，点击故事板右下角的`Resolve Auto Layout Issues`按钮(就是右下角那个三角形按钮),选择`Add Missing Constraints`

![](http://swift.gg/img/articles/take_video_tutorial_in_ios8_with_swift/format=500w1444269945.953059)

打开`Assistant Editor`(关联面板)，并确保`ViewController.swift`文件是打开着的。按住 `Control`键，把第一个按钮拖出到`ViewController.swift`文件中，并创建下面的`Action`

![](http://swift.gg/img/articles/take_video_tutorial_in_ios8_with_swift/format=300w1444269946.244001)

按住 `Control`键，把第二个按钮拖出到`ViewController.swift`文件，并创建下面的`Action`

![](http://swift.gg/img/articles/take_video_tutorial_in_ios8_with_swift/format=300w1444269946.314987)

打开`ViewController.swfit`文件，并在文件顶部添加下面代码：

    
    import MobileCoreServices
    import AssetsLibrary

修改`ViewController`类的声明：

    
    class ViewController: UIViewController, UINavigationControllerDelegate, UIImagePickerControllerDelegate {

`ViewController`类中需要实现`UIImagePickerController`的代理方法。实现`takeVideo`方法：

    
    @IBAction func takeVideo(sender: AnyObject) {
        // 1 Check if project runs on a device with camera available
        if UIImagePickerController.isSourceTypeAvailable(.Camera) {
            // 2 Present UIImagePickerController to take video
            controller.sourceType = .Camera
            controller.mediaTypes = [kUTTypeMovie as! String]
            controller.delegate = self
            controller.videoMaximumDuration = 10.0
            presentViewController(controller, 
            	animated: true, completion: nil)
         }
         else {
            println("Camera is not available")
         }
    }

1. `isSourceTypeAvailable`用来检测设备是否支持拍摄视频。
2. `ImagePickerController`的数据可以是`Camera`或`Movie`(图片和视频)两种类型。视频的`maximum`(拍摄视频的最长时间)长度设置为10秒。
 
实现 `viewLibrary`方法：

    
    @IBAction func viewLibrary(sender: AnyObject) {
        // Display Photo Library
        controller.sourceType = 
        UIImagePickerControllerSourceType.PhotoLibrary
        controller.mediaTypes = [kUTTypeMovie as! String]
        controller.delegate = self  
        presentViewController(controller, 
        	animated: true, completion: nil)
        } 
 
点击按钮就会打开相册。如果`mediaType`没有被设置为视频类型，那么视频文件就不会显示，只会显示图片资源。下面实现`UIImagePickerControllerDelegate`：


    
    func imagePickerController(picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [NSObject: AnyObject]) {
        // 1    
        let mediaType:AnyObject? = info[UIImagePickerControllerMediaType]
            
        if let type:AnyObject = mediaType {
            if type is String {
                let stringType = type as! String
                    if stringType == kUTTypeMovie as! String {
                        let urlOfVideo = info[UIImagePickerControllerMediaURL] as? NSURL
                            if let url = urlOfVideo {
                                // 2  
                                assetsLibrary.writeVideoAtPathToSavedPhotosAlbum(url,
                                    completionBlock: {(url: NSURL!, error: NSError!) in
                                        if let theError = error{
                                            println("Error saving video = \(theError)")
                                        }
                                        else {
                                            println("no errors happened")
                                        }
                                    })
                            }
                    } 
            }
        }
        // 3
        picker.dismissViewControllerAnimated(true, completion: nil)
    }

`imagePickerController(_:didFinishPickingMediaWithInfo:)`方法告诉代理，用户选择了一段视频。`info`参数包含了选中的视频的`URL`数据

1. 字典数据类型的`info`的`mediatype`参数可用于检测参数是否是`movie`类型。如果是就提取视频的`URL`
2. `writeVideoAtPathToSavedPhotosAlbum`方法会把视频保存到手机相册中
3. 让`ViewController`视图消失


实现`imagePickerControllerDidCancel`方法：


    
    func imagePickerControllerDidCancel(picker: UIImagePickerController) {
            picker.dismissViewControllerAnimated(true, completion: nil)
    }

当用户点击`Cancel`按钮时，`View Controller`视图就会消失掉。如果模拟器没有视频文件，请在真实的设备上编译并运行这个项目。选择”Take Video“拍摄一段视频并选择”Use Video“，接着选择”View Library“，视频就会保存到手机相册中了。

![](http://swift.gg/img/articles/take_video_tutorial_in_ios8_with_swift/TakeVideo-Device.pngformat=750w1444269946.386972)

你可以在[Github](https://github.com/ioscreator/ioscreator)上下载`IOS8SwiftTakeVideoPlayerTutorial`的代码
