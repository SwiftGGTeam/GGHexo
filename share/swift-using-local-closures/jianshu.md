Swift：使用本地闭包

> 作者：Thomas Hanning，[原文链接](http://www.thomashanning.com/swift-using-local-closures/)，原文日期：2015-10-22
> 译者：[小锅](http://www.swiftyper.com/)；校对：[千叶知风](http://weibo.com/xiaoxxiao)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  









闭包一般是用来作为函数的参数。不过某些情况下，使用本地闭包也是十分方便的。


假设有一个 `ViewController`，里面包含了两种 GUI 模式：

    
    enum GUIMode {
    	case Mode1
    	case Mode2
    }



对于每一种 GUI 模式，我们都需要对三个 label 设置某些属性：

    
    var guiMode: GUIMode = .Mode1 {
        didSet {              
            switch guiMode {
            case .Mode1:
                label1.text = "1"
                label1.textColor = UIColor.redColor()
                label1.font = UIFont(name: "HelveticaNeue", size: 10)
                    
                label2.text = "2"
                label2.textColor = UIColor.blueColor()
                label2.font = UIFont(name: "HelveticaNeue", size: 12)
                    
                label3.text = "3"
                label3.textColor = UIColor.yellowColor()
                label3.font = UIFont(name: "HelveticaNeue", size: 11)
                    
            case .Mode2:
                label1.text = "4"
                label1.textColor = UIColor.yellowColor()
                label1.font = UIFont(name: "HelveticaNeue", size: 11)
                    
                label2.text = "5"
                label2.textColor = UIColor.blueColor()
                label2.font = UIFont(name: "HelveticaNeue", size: 9)
                    
                label3.text = "6"
                label3.textColor = UIColor.brownColor()
                label3.font = UIFont(name: "HelveticaNeue", size: 10)
            }           
        }
    }

这里有很多重复的代码。你可以创建一个函数，在函数里对一个 label 的属性进行设置，但是这个函数我们基本不会在别的地方再次使用。因此，在这种情况下使用闭包就是一个相当不错的解决方案：

    
    var guiMode: GUIMode = .Mode1 {
        didSet {      
            let styleLabel: (label:UILabel,text:String,color:UIColor,size:CGFloat) -> () = { (label,text,color,size) in
                label.text = text
                label.textColor = color
                label.font = UIFont(name: "HelveticaNeue", size:size)
            }
                            
            switch guiMode {
            case .Mode1:
                styleLabel(label: label1, text: "1", color: UIColor.redColor(), size:10)
                styleLabel(label: label2, text: "2", color: UIColor.blueColor(), size:12)
                styleLabel(label: label3, text: "3", color: UIColor.yellowColor(), size:11)
            case .Mode2:
                styleLabel(label: label1, text: "4", color: UIColor.yellowColor(), size:11)
                styleLabel(label: label2, text: "5", color: UIColor.blackColor(), size:9)
                styleLabel(label: label3, text: "6", color: UIColor.brownColor(), size:10)
            }
        }
    }

这样一来，代码就少了很多，看起来也更加简洁了。