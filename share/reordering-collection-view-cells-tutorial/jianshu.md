集合视图重排教程"

> 作者：ioscreator，[原文链接](http://www.ioscreator.com/tutorials/reordering-collection-view-cells-tutorial)，原文日期：2015-09-17
> 译者：[pmst](http://www.jianshu.com/users/596f2ba91ce9/latest_articles)；校对：[靛青K](http://blog.dianqk.org/)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  










iOS 9 介绍了 Collection View 单元格的重新排序新特性。该特性默认开启，用户可以通过长按单元格的进行重新排序，调整其在视图中的位置。而我们要做的仅仅只是更新数据源模型。本教程中，我们将显示一些包含字母的单元格并对其进行重新排序。本教程部署于 iOS 9 和 Xcode 7。



打开 Xcode 并创建一个**Single View Application** ；Product Name 为 **IOS9ReorderingCollectionViewTutorial** ；紧接着在 Organization Name 和 Organization Identidier 两个输入框中填写你惯用的信息；开发语言选 **Swift** 同时确保设备为 **iPhone** 。

![](https://swift.gg/img/articles/reordering-collection-view-cells-tutorial/format=1500w1445389581.348031)

选中 Main.StoryBoard 文件，删除已有的视图控制器；从对象库中（译者注：Object Library ，快捷键 control+option+command+3 ）拖拽一个 CollectionView Controller 到 Storyboard 中；选中拖入的视图控制器，在 Xcode 上方菜单栏依次选择`Editor -> Embed in -> Navagation Controller`插入一个 Navigation Controller ；确保选中新插入的导航控制器后，打开属性设置面板（译者注：Attribute Inspector ,快捷键 option+command+4 ），勾选 View Controller 部分中的`is Initial View Controller`复选框。

![](https://swift.gg/img/articles/reordering-collection-view-cells-tutorial/format=750w1445389582.5906994)


双击 Collection View Controller 中的导航栏，将标题改为“Alphabet”。选中 Collection View 后打开尺寸设置面板中（译者：Size Inspector ，快捷键 option+command+5 ）。将 Collection View 部分中的宽高设置为 100 。

![](https://swift.gg/img/articles/reordering-collection-view-cells-tutorial/format=750w1445389583.365586)

选中 Collection View Controller 中的单元格，前往属性设置面板（译者注：Attributes inspector ，快捷键 option+command+4 ），将单元格的背景色设为绿色。

![](https://swift.gg/img/articles/reordering-collection-view-cells-tutorial/format=750w1445389583.9036288)

前往属性设置面板，将 Collection Reusable View 部分中的 Identifier 设为“Cell”

![](https://swift.gg/img/articles/reordering-collection-view-cells-tutorial/format=750w1445389584.315881)

从对象库中拖拽一个 Label 放置到单元格中。双击该 Label ，输入字母“A”。到目前为止，storyboard 内容如下:

![](https://swift.gg/img/articles/reordering-collection-view-cells-tutorial/CellSize.pngformat=2500w1445389584.655853)

既然我们已经将视图控制器从 Storyboard 中移除了，那么 ViewController.swift 文件一并删除了吧。添加一个新文件到项目中，选择 File -> New File -> iOS -> Source -> Cocoa Touch Class 点击 Next 跳转下一步，为这个类命名**AlphabetViewController** ，设为 UICollectionViewController 的子类。

![](https://swift.gg/img/articles/reordering-collection-view-cells-tutorial/format=1500w1445389586.0430875)

接下来，为 Collection View Cell 创建一个类。添加一个新文件到项目中，选择 File -> New File -> iOS -> Source -> Cocoa Touch Class 点击 Next 跳转下一步，为这个类命名 **AlphabetCell** ，设为 UICollectionViewCell 的子类。

![](https://swift.gg/img/articles/reordering-collection-view-cells-tutorial/format=1500w1445389586.6271925)

这些新创建的类需要和 storyboard 中的对象关联起来。为此，请选中 Storyboard 中的 Collection View Controller ，切换到 Identity Inspector 面板（译者注：快捷键 option+command+3 ），更改自定义类为 AlphabetViewController 。

![](https://swift.gg/img/articles/reordering-collection-view-cells-tutorial/format=750w1445389587.3706524)

依葫芦画瓢，选中 Storyboard 中的 Collection View Cell 并转到 Identity Inspector 面板，更改自定义类为 AlphabetCell 。

![](https://swift.gg/img/articles/reordering-collection-view-cells-tutorial/format=750w1445389587.6798098)

点击 Assistant Editor 按钮（译者注：快捷键 option+command+enter ），确保 **AlphabetCell.swift** 文件呈现在右侧面板。选中单元 Cell 中的 Label ,按住 Ctrl 键拖线至 **AlphabetCell** 类中创建以下 Outlet 接口:

![](https://swift.gg/img/articles/reordering-collection-view-cells-tutorial/format=750w1445389588.152526)

前往 **AlphabetViewController.swift** 文件，在 viewDidLoad 方法中，删除以下行:

    
    self.collectionView!.registerClass(UICollectionViewCell.self, forCellWithReuseIdentifier: reuseIdentifier)

由于早前已在视图构建器中设置了重用标识符，因此这里不再需要。此外新增一个属性变量用于存储字母表。

    
    var characterArray = [String]()

修改**viewDidLoad**方法中的内容:

    
    override func viewDidLoad() {
        super.viewDidLoad()
    
        let str:String = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"//原文最后一个字符是X 不知道是不是作者笔误
        
        for i in str.characters{
            characterArray.append(String(i))
        }
    }

上面方法中将字母表中的每个单词都分配到 characterArray 数组当中。接着，更改以下三个预定义的 Collection View 代理方法中的内容:


    
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


1. Collection View 仅包含一个 section
2. Collection View 中的每个 section 包含 26 个 item
3. 每一个 Cell 单元格的内容为字母表中的一个字母。


当重新调整单元格位置时，内容也要随之而改变。我们可以在 **CollectionView:moveItemAtIndexPath:toIndexPath** 方法中实现。

    
    override func collectionView(collectionView: UICollectionView, moveItemAtIndexPath sourceIndexPath: NSIndexPath,toIndexPath destinationIndexPath: NSIndexPath) {
            // swap values if sorce and destination
            let temp = characterArray[sourceIndexPath.row]
            characterArray[sourceIndexPath.row] = characterArray[destinationIndexPath.row]
            characterArray[destinationIndexPath.row] = temp
        }

> 校对注：这里我们可以使用元组的特性完成值的交换`(characterArray[sourceIndexPath.row], characterArray[destinationIndexPath.row]) = (characterArray[destinationIndexPath.row], characterArray[sourceIndexPath.row])`

构建并运行项目，长按某个单元格后拖动调整它的位置。

![](https://swift.gg/img/articles/reordering-collection-view-cells-tutorial/format=1500w1445389588.5267599)


你可以从[github](https://github.com/ioscreator/ioscreator)上下载 IOS9ReorderingCollectionViewTutorial 的源代码。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。