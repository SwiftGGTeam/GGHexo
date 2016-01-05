使用 unwind segue 而不是 delegate 模式传递回调数据"

> 作者：Tomasz Szulc，[原文链接](http://szulctomasz.com/ios-passing-data-back-using-unwind-segue-instead-of-delegate-pattern/)，原文日期：2015-12-6
> 译者：[靛青K](http://www.dianqk.org/)；校对：[Channe](undefined)；定稿：[Cee](https://github.com/Cee)
  









> 这是一个不使用 delegate 模式传递回调数据的好方法。

我今天注意到这个小技巧，值得和你分享一下。



通常当我们创建一个视图控制器作为 picker 时，它会从屏幕的底部出现，覆盖在当前页面上，并且仅只占屏幕的一部分。当选择一个值后，就通过 delegate 模式返回回来。代码大概就像这样：

    
    class ViewController: UIViewController, AnimalPickerViewControllerDelegate {
    
        @IBOutlet var label: UILabel!
        
        override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
            if segue.identifier == "ShowAnimalPicker" {
                let pickerVC = segue.destinationViewController as! AnimalPickerViewController
                pickerVC.delegate = self
            }
        }
        
        func animalPicker(picker: AnimalPickerViewController, didSelectAnimal animal: String) {
            label.text = animal
        }
    }

    
    protocol AnimalPickerViewControllerDelegate: class {
        func animalPicker(picker: AnimalPickerViewController, didSelectAnimal animal: String)
    }
    
    class AnimalPickerViewController: UIViewController {
        
        weak var delegate: AnimalPickerViewControllerDelegate?
    
        @IBAction func dogButtonPressed(sender: AnyObject) {
            selectAnimal("Dog")
        }
        
        @IBAction func catButtonPressed(sender: AnyObject) {
            selectAnimal("Cat")
        }
        
        @IBAction func snakeButtonPressed(sender: AnyObject) {
            selectAnimal("Snake")
        }
        
        private func selectAnimal(animal: String) {
            delegate?.animalPicker(self, didSelectAnimal: animal)
            dismissViewControllerAnimated(true, completion: nil)
        }
    }

于是就像你看到的，我使用了 segue 去弹出这个 picker 视图控制器，但我使用了 delegate 模式获取返回的数据值。

今天我认识到在这种情况下，使用 unwind segue 更合适。我没有必要使用 delegate 模式。并且代码是这个样子：

    
    class ViewController: UIViewController {
    
        @IBOutlet var label: UILabel!
        
        @IBAction func performUnwindSegue(segue: UIStoryboardSegue) {
            if segue.identifier == AnimalPickerViewController.UnwindSegue {
                label.text = (segue.sourceViewController as! AnimalPickerViewController).selectedAnimal
            }
        }
    }

    
    class AnimalPickerViewController: UIViewController {
        static let UnwindSegue = "UnwindAnimalPicker"
        
        private(set) var selectedAnimal: String!
        
        @IBAction func dogButtonPressed(sender: AnyObject) {
            selectAnimal("Dog")
        }
        
        @IBAction func catButtonPressed(sender: AnyObject) {
            selectAnimal("Cat")
        }
        
        @IBAction func snakeButtonPressed(sender: AnyObject) {
            selectAnimal("Snake")
        }
        
        private func selectAnimal(animal: String) {
            selectedAnimal = animal
            performSegueWithIdentifier(AnimalPickerViewController.UnwindSegue, sender: nil)
        }

是不是更好一些？对于我来说，在这种特别的情况时，的确更好。希望对你有一些帮助！

（译者注：关于 Unwind Segue 的使用，需要注意的几点。我们最好先将下面的代码写上：

    
    @IBAction func performUnwindSegue(segue: UIStoryboardSegue) {
        if segue.identifier == AnimalPickerViewController.UnwindSegue {
            label.text = (segue.sourceViewController as! AnimalPickerViewController).selectedAnimal
        }
    }

这样我们再从 button 等控件拉向 exit 时才会有效果。至于 identifier 是设置在刚刚拉向 exit 的 segue（unwind segue）。我补写了本文的 [demo](http://github.com/DianQK/StudyUnwindSegue)，如果你还有什么困惑可以直接看这个 demo。）
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。