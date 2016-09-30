使用 iOS 10 的 Speech 框架构建语音转文本应用"

> 作者：SAHAND EDRISIAN，[原文链接](http://www.appcoda.com/siri-speech-framework/)，原文日期：2016-08-09
> 译者：[ckitakishi](undefined)；校对：[mmoaay](http://mmoaay.photo/)；定稿：[CMB](https://github.com/chenmingbiao)
  









在 2016 年的 WWDC 上，Apple 介绍了一个十分有用的语音识别 API，那就是 Speech 框架。事实上，Siri 的语音识别正是由 Speech Kit 提供支持。就目前来说，可用的语音识别框架并非没有，但是它们要么太贵，要么不够好。在本教程中，我将会向你演示如何使用 Speech Kit 来创建一个像 Siri 一样的应用来进行语音到文本的转换。



## 应用界面设计

> 事前准备: Xcode 8 beta 版和一台运行 iOS 10 beta 版的设备.
   
首先，让我们来创建一个 iOS Single View Application 工程，并将其命名为 *SpeechToTextDemo*。然后在 `Main.storyboard` 上添加 `UILabel`、`UITextView` 和 `UIButton` 各一个。

此时 storyboard 应该看起来像这样：

[](https://www.appcoda.com/wp-content/uploads/2016/08/speechkit-demo-1-1240x723.png)

下一步，在 `ViewController.swift` 文件中为 `UITextView` 和 `UIButton` 定义 outlet 变量，将 `UITextView` 命名为 “textView”，`UIButton` 命名为 “microphoneButton” 之后，再创建一个空 action 方法来监听麦克风按钮 (microphoneButton) 的点击事件：

    
    @IBAction func microphoneTapped(_ sender: AnyObject) {
     
    }

如果你不想从头开始，也可以[下载初始工程](https://github.com/appcoda/SpeechToTextDemo/raw/master/SiriDemoStarter.zip)，然后跟随教程继续对它进行完善。

## 使用 Speech 框架

要使用 Speech 框架，第一件要做的事自然是引入这个框架，并遵循 `SFSpeechRecognizerDelegate` 协议。所以，我们先引入该框架，然后将它的协议添加到 `ViewController.swift` 类中。此时 `ViewController.swift` 应该是这样的：

    
    import UIKit
    import Speech
     
    class ViewController: UIViewController, SFSpeechRecognizerDelegate {
        
        
        @IBOutlet weak var textView: UITextView!
        @IBOutlet weak var microphoneButton: UIButton!
        
        override func viewDidLoad() {
            super.viewDidLoad()
            
        }
     
        @IBAction func microphoneTapped(_ sender: AnyObject) {
     
        }
     
    }

## 用户权限

在使用 Speech 框架进行语音识别之前，你必须先请求用户许可，原因是识别不仅发生在 iOS 设备本地，还需要依赖 Apple 的服务器。具体来说，所有音频数据都会被传输到苹果后台进行处理。因此需要获取用户的权限。

我们将在 `ViewDidLoad` 方法中处理授权。其中包括用户必须允许应用使用的音频输入和语音识别权限。首先，声明一个名为 `speechRecognizer` 的变量：

    
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale.init(identifier: "en-US"))  //1

然后将 `ViewDidLoad` 方法修改为下面这样：

    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        microphoneButton.isEnabled = false  //2
        
        speechRecognizer.delegate = self  //3
        
        SFSpeechRecognizer.requestAuthorization { (authStatus) in  //4
            
            var isButtonEnabled = false
            
            switch authStatus {  //5
            case .authorized:
                isButtonEnabled = true
                
            case .denied:
                isButtonEnabled = false
                print("User denied access to speech recognition")
                
            case .restricted:
                isButtonEnabled = false
                print("Speech recognition restricted on this device")
                
            case .notDetermined:
                isButtonEnabled = false
                print("Speech recognition not yet authorized")
            }
            
            OperationQueue.main.addOperation() {
                self.microphoneButton.isEnabled = isButtonEnabled
            }
        }
    }

1. 第一步，创建一个区域标志符 (locale identifier) 为 `en-US` 的 `SFSpeechRecognizer` 实例，这时候语音识别就会知道用户录入的语种。简单说，这就是语音识别的处理对象。
2. 在语音识别被激活之前，默认设置麦克风按钮为禁用状态。
3. 然后，将语音识别的 delegate 设置为 `ViewController` 中的 `self`。
4. 之后，就到了请求语音识别权限的阶段了，这时我们通过调用 `SFSpeechRecognizer.requestAuthorization` 来达到目的。
5. 最后，检查验证状态，如果得到了授权，则启用麦克风按钮。否则，打印错误信息，继续禁用麦克风按钮。

你可能会认为，现在我们启动应用将会看到一个授权提示框，很遗憾你错了。运行应用带来的是崩溃。你可能会想问，这是为什么？

## 提供授权信息

Apple 要求应用为所有请求的权限提供自定义消息，对于语音权限的情况，我们必须为两个行为请求授权：

1. 麦克风的使用 
2. 语音的识别

要自定义消息，你需要在 `info.plist` 文件中定义这些消息。

让我们打开 `info.plist` 文件的源代码。方法是在 `info.plist` 上点击右键。然后选择 Open As > Source Code。最后，复制下面的 XML 代码并将它们插入到 `</dict>` 标签前。

    xml
    <key>NSMicrophoneUsageDescription</key>  <string>Your microphone will be used to record your speech when you press the &quot;Start Recording&quot; button.</string>
     
    <key>NSSpeechRecognitionUsageDescription</key>  <string>Speech recognition will be used to determine which words you speak into this device&apos;s microphone.</string>

好了，现在你已经将两个 key 添加到 `info.plist` 中了：

- `NSMicrophoneUsageDescription` – 音频输入授权请求的自定义信息。注意，音频输入授权请求只发生在用户点击麦克风按钮的时候。
- `NSSpeechRecognitionUsageDescription` – 语音识别授权请求的自定义信息。

你可以随意修改这些记录的值。一切就绪，现在可以运行程序了，不出意外的话，编译并运行应用不会报任何错。

[](https://www.appcoda.com/wp-content/uploads/2016/08/speech-kit-2.png)

> **注意：**如果工程完成之后你没有看到音频输入授权请求的话，首先务必确认你是否正在模拟器上运行应用。iOS 模拟器并不会连接 Mac 的麦克风。

## 处理语音识别

现在用户授权已经完成了，让我们一鼓作气，接着来实现语音识别。首先，在 `ViewController` 中定义下述对象：

    
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()

1. recognitionRequest 对象用于处理语音识别请求，为语音识别提供音频输入。
2. recognitionTask 可以将识别请求的结果返回给你，它带来了极大的便利，必要时，可以取消或停止任务。
3. 最后的 audioEngine 是音频引擎。它的存在使得你能够进行音频输入。

接下来，让我们创建一个名为 `startRecording()` 的新函数：

    
    func startRecording() {
        
        if recognitionTask != nil {
            recognitionTask?.cancel()
            recognitionTask = nil
        }
        
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(AVAudioSessionCategoryRecord)
            try audioSession.setMode(AVAudioSessionModeMeasurement)
            try audioSession.setActive(true, with: .notifyOthersOnDeactivation)
        } catch {
            print("audioSession properties weren't set because of an error.")
        }
        
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        
        guard let inputNode = audioEngine.inputNode else {
            fatalError("Audio engine has no input node")
        }
        
        guard let recognitionRequest = recognitionRequest else {
            fatalError("Unable to create an SFSpeechAudioBufferRecognitionRequest object")
        }
        
        recognitionRequest.shouldReportPartialResults = true
        
        recognitionTask = speechRecognizer.recognitionTask(with: recognitionRequest, resultHandler: { (result, error) in 
            
            var isFinal = false
            
            if result != nil {
                
                self.textView.text = result?.bestTranscription.formattedString
                isFinal = (result?.isFinal)!
            }
            
            if error != nil || isFinal {
                self.audioEngine.stop()
                inputNode.removeTap(onBus: 0)
                
                self.recognitionRequest = nil
                self.recognitionTask = nil
                
                self.microphoneButton.isEnabled = true
            }
        })
        
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { (buffer, when) in
            self.recognitionRequest?.append(buffer)
        }
        
        audioEngine.prepare()
        
        do {
            try audioEngine.start()
        } catch {
            print("audioEngine couldn't start because of an error.")
        }
        
        textView.text = "Say something, I'm listening!"
        
    }

上述函数被调用的时机是开始录音按钮被按下的瞬间。它的主要功能是启动语音识别并开始监听麦克风。让我们来逐行剖析一下这段代码：

1. **3-6 行** – 检查 `recognitionTask` 的运行状态，如果正在运行，取消任务。
2. **8-15 行** – 创建一个 `AVAudioSession` 对象为音频录制做准备。这里我们将录音分类设置为 Record，模式设为 Measurement，然后启动。注意，设置这些属性有可能会抛出异常，因此你必须将其置于 try catch 语句中。
3. **17 行** – 实例化 `recognitionResquest`。创建 `SFSpeechAudioBufferRecognitionRequest` 对象，然后我们就可以利用它将音频数据传输到 Apple 的服务器。
4. **19-21 行** – 检查 `audioEngine` (你的设备)是否支持音频输入以录音。如果不支持，报一个 fatal error。
5. **23-25 行** – 检查 `recognitionRequest` 对象是否已被实例化，并且值不为 `nil`。
6. **27 行** – 告诉 `recognitionRequest` 不要等到录音完成才发送请求，而是在用户说话时一部分一部分发送语音识别数据。
7. **29 行** – 在调用 `speechRecognizer` 的 `recognitionTask` 函数时开始识别。该函数有一个完成回调函数，每次识别引擎收到输入时都会调用它，在修改当前识别结果，亦或是取消或停止时，返回一个最终记录。
8. **31 行** – 定义一个 boolean 变量来表示识别是否已结束。
9. **35 行** – 倘若结果非空，则设置 textView.text 属性为结果中的最佳记录。同时若为最终结果，将 `isFinal` 置为 true。
10. **39-47 行** – 如果请求没有错误或已经收到最终结果，停止 `audioEngine` (音频输入)，`recognitionRequest` 和 `recognitionTask`。同时，将开始录音按钮的状态切换为可用。
11. **50-53 行** – 向 `recognitionRequest` 添加一个音频输入。值得留意的是，在 `recognitionTask` 启动后再添加音频输入**完全没有问题**。Speech 框架会在添加了音频输入之后立即开始识别任务。
12. **55 行** – 将 `audioEngine` 设为准备就绪状态，并启动引擎。

## 触发语音识别

在创建语音识别任务时，我们首先得确保语音识别的可用性，因此，需要向 `ViewController` 添加一个 delegate 方法。如果语音识别不可用，或是改变了状态，应随之设置 `microphoneButton.enable` 属性。针对这个方案，我们实现了 `SFSpeechRecognizerDelegate` 协议的 `availabilityDidChange` 方法。详细实现如下所示：

    
    func speechRecognizer(_ speechRecognizer: SFSpeechRecognizer, availabilityDidChange available: Bool) {
        if available {
            microphoneButton.isEnabled = true
        } else {
            microphoneButton.isEnabled = false
        }
    }

这个方法会在按钮的可用性改变时被调用。如果语音识别可用，录音按钮也将被启用。

最后，我们还需要更新一下 `microphoneTapped(sender:)` 方法：

    
    @IBAction func microphoneTapped(_ sender: AnyObject) {
        if audioEngine.isRunning {
            audioEngine.stop()
            recognitionRequest?.endAudio()
            microphoneButton.isEnabled = false
            microphoneButton.setTitle("Start Recording", for: .normal)
        } else {
            startRecording()
            microphoneButton.setTitle("Stop Recording", for: .normal)
        }
    }

这个函数的用途是检查 `audioEngine` 是否在运行。如果正在运行，停止 `audioEngine`，终止 `recognitionRequest` 的音频输入，禁用 `microphoneButton`，并将按钮的文字改为“开始录音”。

若 `audioEngine` 正在工作，则应用应该调用 `startRecording()`，以及设置按钮的文字为“停止录音”。

太棒了！一切就绪，可以准备测试一下应用了。首先将该应用布署到一台 iOS 10 的设备上，然后点击“开始录制”按钮。来吧，说点什么试试！

[](http://www.appcoda.com/wp-content/uploads/2016/08/speech-kit-3-1240x737.png)

**注意：**

1. Apple 对每台设备的识别有限制。详情未知，不过你可以尝试联系 Apple 获得更多信息。
2. Apple 对每个应用的识别也有限制。
3. 如果你总是遭遇限制，务必联系 Apple，他们或许可以解决这个问题。
4. 语音识别会消耗不少电量和流量。
5. 语音识别每次只能持续大概一分钟。

## 总结

在本教程中，我们讲解了如何利用 Apple 向开发者开放的新语音 API 来识别语音并将其转换为文本，你应该对这些 API 的优点深有体会并能够合理使用了吧。Speech 框架使用的语音识别框架与 Siri 相同。该 API 虽小，但功能十分强大，为开发者创造像是获取音频文件记录一样震撼的东西提供了极大的便利。

我强烈推荐看一看 [WWDC 2016 的 session 509](https://developer.apple.com/videos/play/wwdc2016/509/)，你可以从中获取更多信息。我希望你会喜欢这篇文章，更重要的是，能在探索这个全新 API 的过程中感受到乐趣。

作为参考，你可以访问 Github 来查看[完整项目](https://github.com/appcoda/SpeechToTextDemo)。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。