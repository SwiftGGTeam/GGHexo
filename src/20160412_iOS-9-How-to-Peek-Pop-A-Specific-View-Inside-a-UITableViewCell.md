title: "iOS9：预览特定的 UITableViewCell 视图"
date: 2016-04-12
tags: [Swift 入门] 
categories: [Natasha The Robot]
permalink: peek-pop-view-inside-tableviewcell
keywords: uitableviewcell,ios9 uitableview
custom_title: 
description: 怎么在 iOS9 里面预览到特定的 UITableViewCell 视图呢，本文就来实际操作下如何实现。

---
原文链接=https://www.natashatherobot.com/peek-pop-view-inside-tableviewcell/
作者=Natasha
原文日期=2016-02-13
译者=Prayer
校对=小锅
定稿=shanks

<!--此处开始正文-->

在过去的几天中，我一直忙于开发 [try! Swift 会议的官方 App](https://github.com/NatashaTheRobot/trySwiftApp)（只剩两周半的时间了，我的天哪😱）！项目中一大亮点就是，我要实现在 app 中使用 3D Touch 来支持演讲者和展示的内容的弹窗预览（Peek & Pop）。幸运的是，[@allonsykraken](https://twitter.com/allonsykraken)的博文[Peek & Pop Spirit Guide](http://krakendev.io/peek-pop/)让这个任务完成起来比较简单，为 table view 主视图添加 3D Touch 仅仅花费了几分钟时间就搞定了。

<!--more-->

<center>
![1.gif](http://swiftgg-main.b0.upaiyun.com/img/peek-pop-view-inside-tableviewcell-1.gif)
</center>

然而，在 Q&A 模块中遇到了一些问题。我希望在 cell 中特定的视图上——**演讲者的图片**——来使用 peek & pop，而不是像其他模块那样，在整个 cell 上使用。

<center>
![2.gif](http://swiftgg-main.b0.upaiyun.com/img/peek-pop-view-inside-tableviewcell-2.gif)
</center>

因为这个花费了很长时间才解决，所以我想把它记录下来。（在阅读本文之前，请先阅读[Peek & Pop Spirit Guide](http://krakendev.io/peek-pop/)）

## 问题所在

为了能够使用 Peak & Pop 功能，我们需要遵循 **UIViewControllerPreviewingDelegate** 协议——这个协议会告知我们用户使用 3D Touch 功能点击了哪儿，并且在这里返回相应的 ViewController 实例。

因为我的这些图片存在于 cell 中，需要能够区别出用户使用 3D Touch 点击了哪个演讲者的图片，这里我让 cell 遵循 UIViewControllerPreviewingDelegate：

```swift
// QASessionTableViewCell
// QASessionTableViewCell here: https://github.com/NatashaTheRobot/trySwiftApp/blob/master/trySwift/QASessionTableViewCell.swift
 
protocol QASessionSpeakerPopDelegate: class {
    // view controller 将遵循该协议，来正确的设置导航视图
    func onCommitViewController(viewController: UIViewController)
}
 
extension QASessionTableViewCell: UIViewControllerPreviewingDelegate {
    
    // UIViewControllerPreviewingDelegate conformance
    func previewingContext(previewingContext: UIViewControllerPreviewing, viewControllerForLocation location: CGPoint) -> UIViewController? {
        
        let viewsTo3DTouch = [speaker1ImageView, speaker2ImageView, speaker3ImageView]
        
        for (index, view) in viewsTo3DTouch.enumerate() where touchedView(view, location: location) {
            if let speaker = qaSession?.speakers[index] {
                // 返回显示 peek & pop 功能所需要的控制器
                return viewControllerForSpeaker(speaker)
            }
        }
        
        return nil
    }
    
    func previewingContext(previewingContext: UIViewControllerPreviewing, commitViewController viewControllerToCommit: UIViewController)
    {
        // 如果用户选择 pop 出视图，我们需要跳转到相应的视图控制器
        // 在设置 cell 的时候，delegate 将会被赋值
        delegate?.onCommitViewController(viewControllerToCommit)
    }
    
    // helper methods
    private func touchedView(view: UIView, location: CGPoint) -> Bool {
        let locationInView = view.convertPoint(location, fromView: contentView)
        return CGRectContainsPoint(view.bounds, locationInView)
    }
    
    private func viewControllerForSpeaker(speaker: Speaker) -> UIViewController {
        let speakerDetailVC = SpeakerDetailViewController()
        speakerDetailVC.speaker = speaker
        return speakerDetailVC
    }
}
 
// QASessionsTableViewController
// 全部的代码地址: https://github.com/NatashaTheRobot/trySwiftApp/blob/master/trySwift/QASessionsTableViewController.swift
extension QASessionsTableViewController: QASessionSpeakerPopDelegate {
 
    // 当视图 pop 出来的时候，view controller 负责处理跳转
    func onCommitViewController(viewController: UIViewController) {
        navigationController?.pushViewController(viewController, animated: true)
    }
}
```

问题在于，想要使用 Peek & Pop 功能，我们需要使用 **registerForPreviewingWithDelegate** 来注册视图和设置代理，但是 registerForPreviewingWithDelegate 是 UIViewController 中的方法，所以我们不能够在 cell 的代码中注册视图！

## 解决办法

问题的关键在于，我们现在需要 view controller 中 **注册每一个 cell**（而不是像 Schedule 或 Speaker 模块那样直接注册整个 table view）

```swift
// QASessionsTableViewController
 
class QASessionsTableViewController: UITableViewController {
    // 代码有删减
    // 全部的代码地址: https://github.com/NatashaTheRobot/trySwiftApp/blob/master/trySwift/QASessionsTableViewController.swift
    
    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier(String(QASessionTableViewCell), forIndexPath: indexPath) as! QASessionTableViewCell
        
        let qaSession = dataSource.qaSessions[indexPath.section]
        cell.configure(withQASession: qaSession, delegate: self)
        
        // 这是见证奇迹的时刻
        // 我们需要注册每一个 cell
        if traitCollection.forceTouchCapability == .Available {
            registerForPreviewingWithDelegate(cell, sourceView: cell.contentView)
        }
        
        return cell
    }
 
}
```

## 更新

[@davedelong 指出](https://twitter.com/davedelong/status/698527490428383232)**在 cell 中创建添加到 navigation 中的控制器看起来不是一个明智的选择。** 我完全同意他的观点！但是写代码的时候在 deadline 的压迫下，我没有想到更好的实现方式。幸运的是，[@davedelong 提出了一种更好的解决办法](https://twitter.com/NatashaTheRobot/status/698530746449817600)，通过这种方式，可以让这些代码保留在应有的 view controller 中！

下面的代码经过了一些重构，希望你能够 get 到其中的精髓！

```swift
// QASessionsTableViewController
 
class QASessionsTableViewController: UITableViewController {
 
    var dataSource: QASessionDataSourceProtocol!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // other setup here
 
        // 只需要为 force touch 注册整个 table view
        // 不需要分别注册单个的 cell
        if traitCollection.forceTouchCapability == .Available {
            registerForPreviewingWithDelegate(self, sourceView: tableView)
        }
    }
 
    // 代码有删减
}
 
// MARK: Force Touch on Speaker Images
extension QASessionsTableViewController: UIViewControllerPreviewingDelegate {
    
    func previewingContext(previewingContext: UIViewControllerPreviewing, viewControllerForLocation location: CGPoint) -> UIViewController? {
        if let indexPath = tableView.indexPathForRowAtPoint(location) {
 
            let cell = tableView.cellForRowAtIndexPath(indexPath) as! QASessionTableViewCell
            
            let viewsTo3DTouch = [cell.speaker1ImageView, cell.speaker2ImageView, cell.speaker3ImageView]
            for (index, view) in viewsTo3DTouch.enumerate() where touchedView(view, location: location) {
                
                // 只将图片清晰地显示，其他内容将会变得模糊
                // 需要将 image view 的坐标转化为在 table view 坐标系中的坐标 
                // 如果你有更好的坐标转换方式，请告诉我！
                let viewRectInTableView = tableView.convertRect(view.frame, fromCoordinateSpace: view.superview!)
                previewingContext.sourceRect = viewRectInTableView
                
                // 设置需要显示的 view controller
                let qaSession = dataSource.qaSessions[indexPath.section]
                let speaker = qaSession.speakers[index]
                return viewControllerForSpeaker(speaker)
            }
        }
        return nil
    }
    
    func previewingContext(previewingContext: UIViewControllerPreviewing, commitViewController viewControllerToCommit: UIViewController) {
        navigationController?.pushViewController(viewControllerToCommit, animated: true)
    }
    
    private func touchedView(view: UIView, location: CGPoint) -> Bool {
        let locationInView = view.convertPoint(location, fromView: tableView)
        return CGRectContainsPoint(view.bounds, locationInView)
    }
    
    private func viewControllerForSpeaker(speaker: Speaker) -> UIViewController {
        let speakerDetailVC = SpeakerDetailViewController()
        speakerDetailVC.speaker = speaker
        return speakerDetailVC
    }
 
}
```

下面是效果图——请注意，选中的图片之外的内容才会变得模糊！

<center>
![3.gif](http://swiftgg-main.b0.upaiyun.com/img/peek-pop-view-inside-tableviewcell-3.gif)
</center>

## 结论

所以在某个特定的视图上使用 3D Touch 功能并非难事！一般来说，实现 3D Touch 非常简单和有趣。我强烈推荐您在 app 中添加 3D Touch 的功能。

<center>
![peak and pop all the things](https://www.natashatherobot.com/wp-content/uploads/peekpop.jpg)
</center>
