title: "集合视图重排教程"
date: 2015-10-21 09:00:00
tags: [ioscreator]
categories: [Swift 入门]
permalink: reordering-collection-view-cells-tutorial

---
原文链接=http://www.ioscreator.com/tutorials/reordering-collection-view-cells-tutorial
作者=ioscreator
原文日期=2015-09-17
译者=pmst
校对=靛青K
定稿=千叶知风
发布时间=2015-10-21T09:00:00



<!--此处开始正文-->

iOS 9 介绍了 Collection View 单元格的重新排序新特性。该特性默认开启，用户可以通过长按单元格的进行重新排序，调整其在视图中的位置。而我们要做的仅仅只是更新数据源模型。本教程中，我们将显示一些包含字母的单元格并对其进行重新排序。本教程部署于 iOS 9 和 Xcode 7。

<!--more-->

打开 Xcode 并创建一个**Single View Application** ；Product Name 为 **IOS9ReorderingCollectionViewTutorial** ；紧接着在 Organization Name 和 Organization Identidier 两个输入框中填写你惯用的信息；开发语言选 **Swift** 同时确保设备为 **iPhone** 。

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f92da8e4b0de8da1ae0379/1442393513684/?format=1500w)

选中 Main.StoryBoard 文件，删除已有的视图控制器；从对象库中（译者注：Object Library ，快捷键 control+option+command+3 ）拖拽一个 CollectionView Controller 到 Storyboard 中；选中拖入的视图控制器，在 Xcode 上方菜单栏依次选择`Editor -> Embed in -> Navagation Controller`插入一个 Navigation Controller ；确保选中新插入的导航控制器后，打开属性设置面板（译者注：Attribute Inspector ,快捷键 option+command+4 ），勾选 View Controller 部分中的`is Initial View Controller`复选框。

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f934ffe4b00ec16bd68a6a/1442395391987/?format=750w)


双击 Collection View Controller 中的导航栏，将标题改为“Alphabet”。选中 Collection View 后打开尺寸设置面板中（译者：Size Inspector ，快捷键 option+command+5 ）。将 Collection View 部分中的宽高设置为 100 。

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f95101e4b04ad8ee1cd256/1442402561778/?format=750w)

选中 Collection View Controller 中的单元格，前往属性设置面板（译者注：Attributes inspector ，快捷键 option+command+4 ），将单元格的背景色设为绿色。

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f93e5ae4b06db7a90df4e2/1442397787097/?format=750w)

前往属性设置面板，将 Collection Reusable View 部分中的 Identifier 设为“Cell”

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f96abde4b0653425070bc2/1442409151133/?format=750w)

从对象库中拖拽一个 Label 放置到单元格中。双击该 Label ，输入字母“A”。到目前为止，storyboard 内容如下:

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f951d8e4b02fa04907d59d/1442402777111/CellSize.png?format=2500w)

既然我们已经将视图控制器从 Storyboard 中移除了，那么 ViewController.swift 文件一并删除了吧。添加一个新文件到项目中，选择 File -> New File -> iOS -> Source -> Cocoa Touch Class 点击 Next 跳转下一步，为这个类命名**AlphabetViewController** ，设为 UICollectionViewController 的子类。

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f95286e4b0b275dd9ac08c/1442402951860/?format=1500w)

接下来，为 Collection View Cell 创建一个类。添加一个新文件到项目中，选择 File -> New File -> iOS -> Source -> Cocoa Touch Class 点击 Next 跳转下一步，为这个类命名 **AlphabetCell** ，设为 UICollectionViewCell 的子类。

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f95411e4b0f293fc9a9bf2/1442403346633/?format=1500w)

这些新创建的类需要和 storyboard 中的对象关联起来。为此，请选中 Storyboard 中的 Collection View Controller ，切换到 Identity Inspector 面板（译者注：快捷键 option+command+3 ），更改自定义类为 AlphabetViewController 。

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f95505e4b091a208942c68/1442403590704/?format=750w)

依葫芦画瓢，选中 Storyboard 中的 Collection View Cell 并转到 Identity Inspector 面板，更改自定义类为 AlphabetCell 。

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f95545e4b06db7a90e307a/1442403653655/?format=750w)

点击 Assistant Editor 按钮（译者注：快捷键 option+command+enter ），确保 **AlphabetCell.swift** 文件呈现在右侧面板。选中单元 Cell 中的 Label ,按住 Ctrl 键拖线至 **AlphabetCell** 类中创建以下 Outlet 接口:

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f96b2fe4b09fd61949154b/1442409263872/?format=750w)

前往 **AlphabetViewController.swift** 文件，在 viewDidLoad 方法中，删除以下行:

```swift
self.collectionView!.registerClass(UICollectionViewCell.self, forCellWithReuseIdentifier: reuseIdentifier)
```

由于早前已在视图构建器中设置了重用标识符，因此这里不再需要。此外新增一个属性变量用于存储字母表。

```swift
var characterArray = [String]()
```

修改**viewDidLoad**方法中的内容:

```swift
override func viewDidLoad() {
    super.viewDidLoad()

    let str:String = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"//原文最后一个字符是X 不知道是不是作者笔误
    
    for i in str.characters{
        characterArray.append(String(i))
    }
}
```

上面方法中将字母表中的每个单词都分配到 characterArray 数组当中。接着，更改以下三个预定义的 Collection View 代理方法中的内容:


```swift
override func numberOfSectionsInCollectionView(collectionView: UICollectionView) -> Int {
      // 1
      // Return the number of sections
      return 1
  }


  override func collectionView(collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
      // 2 Return the number of items in the section
      return characterArray.count
  }

  override func collectionView(collectionView: UICollectionView, cellForItemAtIndexPath indexPath: NSIndexPath) -> UICollectionViewCell {
      // 3
      let cell = collectionView.dequeueReusableCellWithReuseIdentifier("Cell", forIndexPath: indexPath) as! AlphabetCell
  
      // Configure the cell
      cell.alphabetLabel.text = characterArray[indexPath.row]
  
      return cell
  }
```   


1. Collection View 仅包含一个 section
2. Collection View 中的每个 section 包含 26 个 item
3. 每一个 Cell 单元格的内容为字母表中的一个字母。


当重新调整单元格位置时，内容也要随之而改变。我们可以在 **CollectionView:moveItemAtIndexPath:toIndexPath** 方法中实现。

```swift
override func collectionView(collectionView: UICollectionView, moveItemAtIndexPath sourceIndexPath: NSIndexPath,toIndexPath destinationIndexPath: NSIndexPath) {
        // swap values if sorce and destination
        let temp = characterArray[sourceIndexPath.row]
        characterArray[sourceIndexPath.row] = characterArray[destinationIndexPath.row]
        characterArray[destinationIndexPath.row] = temp
    }
```

> 校对注：这里我们可以使用元组的特性完成值的交换`(characterArray[sourceIndexPath.row], characterArray[destinationIndexPath.row]) = (characterArray[destinationIndexPath.row], characterArray[sourceIndexPath.row])`

构建并运行项目，长按某个单元格后拖动调整它的位置。

![](http://static1.squarespace.com/static/52428a0ae4b0c4a5c2a2cede/t/55f9de9de4b0fc783fa1c343/1442438814578/?format=1500w)


你可以从[github](https://github.com/ioscreator/ioscreator)上下载 IOS9ReorderingCollectionViewTutorial 的源代码。