title: "如何在 iOS 中实现一个可展开的 Table View"
date: 2015-12-03
tags: [Swift 入门]
categories: [AppCoda] 
permalink: expandable-table-view

---
原文链接=http://www.appcoda.com/expandable-table-view/
作者=AppCoda
原文日期=2015-11-16
译者=pmst
校对=numbbbbb
定稿=numbbbbb

<!--此处开始正文-->

几乎所有的应用程序都有一个共同的特点：允许用户在多个视图控制器之间导航和协同工作。这些视图控制器应用非常广泛，例如简单显示某些形式的信息到屏幕上，或从用户处收集复杂的输入数据。为了实现一款应用的不同功能，经常需要创建新的视图控制器，且多数任务比较艰巨。不过，倘若你利用`expandable tableviews`（之后统一译为可展开的 tableview ） ，我们就能避免创建新的视图控制器（以及相关的界面和 storyboard）。

<!--more-->

顾名思义，可展开的 tableview “允许”其单元格展开和折叠，显示和隐藏那些始终可见的单元格下的其他单元格。当需要收集简单数据或向用户显示请求信息时，创建可展开的 tableview 是一个不错的选择。通过这种方式，我们无需再创建新的视图控制器，只需给定几种选项供用户抉择（只能选其一）。例如，利用可展开的 tableview ，你可以显示和隐藏用于收集数据的表格选项，而不再需要其他额外的视图控制器。

![](/img/articles/expandable-table-view/expandable-uitableview.jpg1500171563.33)

是否应该使用可展开的 tableview 取决于你所开发的应用程序的性质。应用程序的外观和体验通常来说不需要考虑，我们可以继承 `UITableViewCell` 并自定义单元格的 UI，还可以创建额外的 xib 文件。总之，它仅仅和需求有关。


本教程中，我将向你展示一种简单但实用的可展开 `tableview` 创建方式。注意，实现 tableview 展开功能并不是只有本文介绍的这种方法。大部分实现都要考虑应用的具体需求，但我旨在提供一个相对通用的可以在大多数情况下重用的方法。好了，下面我们来看看本文要实现什么应用。

### 关于演示应用

我们将看到如何创建并使用一个可展开的 tableview ，我们会用一个包含 tableview 的视图控制器来实现整个应用。首先，我们来制作一个表单供用户输入数据，该 tableview 包含以下三个部分：

1. 个人信息（ Personal ）
2. 爱好（ Preferences ）
3. 工作经验（ Work Experience ）


每个 section 包含一些可展开的单元格，用于触发显示或隐藏当前 section 中其他单元格。每个 section 的顶级单元格（用于展开和折叠其他单元格）具体描述如下：

“Personal” section 内容如下：

1. *Full name*：显示用户的全名，当点击展开时，显示两个可用的子单元格用于键入 first name 以及 last name。
2. *Data of birth*：显示用户的出生日期。当展开该单元格时，提供一个日期选择视图（`date pickerview`）供用户选择日期，以及一个提交按钮将所选日期显示到对应的顶级单元格中。
3. *Martial status*：显示用户是已婚还是单身。展开时，提供一个开关控件（switch control）用于设置用户婚姻状态。

“Preferences” section 内容如下：

1. *Favorite sport*：我们的表单还应要求用户选择最喜欢的运动,选中后显示在该单元格中。当该单元格呈展开状态时,出现四个运动条目可供选择,当其中一个子条目选中后，单元格自动折叠。
2. *Favorite color*：基本和上面一致，这里我们将显示三个不同的颜色条目供用户选择。

“Work Experience” section 内容如下：

1. *Level*：当点击展开这个顶级单元格时，显示另外一个包含滑动控件（slider control）的单元格，要求用户指定一个大概的工作经验水平。值的范围限定在 [0,10] 之间，以整型数据保存。

下面的动画图形展示了我们将要实现的内容：

![gif](/img/articles/expandable-table-view/t45_7_expand_collapse.gif1500171563.68)

上面的动画中可以看到 tableview 展开时显示了各式各样的单元格。所有这些都能在[初始项目](https://www.dropbox.com/s/37qu76zlzg8yg8p/ExpandableTableStarter.zip?dl=0)中找到，项目中已经预先做好了一些准备工作。所有自定义单元格均采用 xib 文件设计，指定它们的 Custom Class 为自定义 CustomCell 类，继承自 `UITableViewCell`: 


![img1](/img/articles/expandable-table-view/t45_2_custom_class.png1500171564.1)

项目中你可以找到以下单元格的 xib 文件：

![img2](/img/articles/expandable-table-view/t45_3_cell_list.png1500171564.55)

它们的文件名已经表明了每一个单元格的用途，你也可以对它们做深入探究。

除了单元格之外，你还可以找到一些已经实现的代码。尽管它们非常重要，完成了演示应用程序的功能，但是那些代码并不包含本教程的核心部分，所以我选择直接跳过，只是提供实现代码。教程中我们感兴趣的代码将随着章节学习逐步添加进来。

好了，现在你已经知道我们的最终目标是什么了，是时候去创建一个可展开的 tableview 了。


### 描述单元格

本教程中，我向你展示的所有有关可展开 tableview 的实现和技术都遵循一个单一和简单的思想：描述应用中每个单元格的细节。通过这种方式，你就可以知晓哪些单元格是可展开的、哪些是可见的、每一个单元格中的标签值是什么等等。确切来说，整体思想如下：为每一个单元格分配一组描述信息、描述属性或特定的值，接着向应用提供这些描述来正确显示每一个单元格。

对于这个演示应用程序，我创建和使用的所有属性都显示在下面列表中。注意，你可以新增属性，也可以修改现有项。不管怎样，最重要的是你能统筹全局，这样你才能够执行所有你需要的改动。属性列表如下：

* isExpandable：这是一个布尔类型值，表明单元格是否允许被展开。它在本教程中是一个相当重要的属性值。
* isExpanded：依旧是一个布尔类型值，指示一个可展开的单元格的当前状态（展开或折叠）。顶级单元格默认是折叠的，因此所有顶级单元格的初始值均将设置为`NO`。
* isVisible：顾名思义，指示单元格是否可见。它将在之后起到举足轻重的作用，我们将根据该属性在 tableview 中显示合适的单元格。
* value：这个属性对于保存 UI 控件的值（例如婚姻状况中的`switch`控件的状态值）相当有用。不是所有的单元格都有这样的控件,所以它们中的绝大部分的 value 属性值为空。
* primaryTitle：用于显示单元格主标题标签（main title label）中的文本内容，还包含一些应该显示在单元格中的实际值。
* secondaryTitle：用于显示单元格子标题标签（subtitle lable）或二级标签的文本内容，
* cellIdentifier：自定义单元格的标识符所匹配的当前描述。通过使用 cellIdentifier，应用程序不仅能够出列合适的单元格（tableview 中的 dequeue 方法），而且可以根据显示的单元格来确定应该执行的 action ，以及指定每个单元格的高度。
* additionalRows：它包含的附加行总数，即那些当单元格展开式需要显示的额外行数。

我们将使用上文介绍的属性集合来描述 tableview 中的每一个单元格。在应用层面我们只需一个属性列表（plist）文件即可实现，简单易用。在 plist 文件中，我们将为所有单元格正确地填充上述属性的值，这样从应用角度来说，我们最终只要一份完整的技术描述，无需编写一行代码。这是不是灰常棒呢？

通常来说，我们会在项目中创建一个新的属性列表文件，接着开始往里面填充适当的数据。但这里无需自己动手，我已经为你提供了[.plist](https://www.dropbox.com/s/8bjwn3k1e84xkmw/CellDescriptor.plist.zip?dl=0)文件。所以，你只需下载并将它添加到启动项目即可。为所有单元格设置属性非常麻烦并且毫无意义，那些填充缺省值的复制粘贴行为只可能会让你感觉疲劳和枯燥。不过，我们还是需要介绍一下 plist 文件内容：

首先，你下载的文件名应该为 `CellDescriptor.plist`（希望没有错）。基础结构（请见下图中的 Root 键名）是一个数组，其中每个条目项分别对应 tableview 中所呈现的 section。这意味着 plist 文件包含三个条目项，和 tableview 中显示的 section 数目保持一致。

每个 section 中包含的条目项同样是一个数组（类型为字典），分别用于描述当前 section 中的每一个单元格。实际上，我们采用字典形式对上述属性进行分组，每一个字典匹配一个单独的单元格描述。下面是属性列表文件的一个示例：

![img3](/img/articles/expandable-table-view/t45_4_plist_sample.png1500171564.94)

现在是最佳时机，抽点时间出来，透彻地理解下所有我们将要显示到 tableview 中的单元格描述属性以及相关值。显然，通过使用单元格描述，能够帮助我们明显减少创建和管理可展开单元格的代码，此外我们无需告知应用关于这些单元格的状态（例如，哪些单元格是可扩展的，它是否允许特定单元格进行展开，在代码中确定单元格是否可见等等这些问题）。所有这些信息已经存储在你刚刚下载的属性列表文件之中。


### 加载单元格描述

终于可以开始编写代码了，尽管我们描述单元格的方式（即 plist 文件）节省了大量时间，但依旧需要向项目中添加代码。现在单元格的描述属性列表文件已经处于项目之中,我们首先要做的就是以编程方式把它的内容加载到一个数组中。这个数组将在下一小节作为 tableview 的数据源（datasource）。

首先，请打开项目中 ViewController.swift 文件，在类顶部声明如下属性：

```swift
var cellDescriptors: NSMutableArray!
```

该数组将包含所有单元格字典类型的描述，从属性列表文件加载得到。

接着，让我们实现一个自定义函数，用于实现加载文件内容到数组中。我们为该函数命名为 `loadCellDescription()`：

```swift
func loadCellDescriptors() {
    if let path = NSBundle.mainBundle().pathForResource("CellDescriptor", ofType: "plist") {
        cellDescriptors = NSMutableArray(contentsOfFile: path)
    }
}
```

我们这里的实现方法相当简单：首先我们确保属性列表文件在 bundle 中的路径是有效的，接着我们加载文件内容并初始化 `cellDescriptors` 数组。

下一步我们将调用上述方法，在视图将要显示之前、tableview 配置之后调用函数（我们希望先对 tableview 进行配置，然后在它上面显示数据）。

```swift
override func viewWillAppear(animated: Bool) {
    super.viewWillAppear(animated)
    // 先配置tableview
    configureTableView()
    
    // 后加载数据
    loadCellDescriptors()
}
```

如果你在上面代码最后一行键入`print(cellDescriptors)`命令，运行应用，你将看到命令控制台处打印了 plist 文件的所有内容。这意味着它们已经成功被加载到内存中了。

![img4](/img/articles/expandable-table-view/t45_5_console_plist.png1500171565.32)

按照惯例，我们本节的任务应该到此结束，但恰恰相反；我们将继续下去，接下来的部分至关重要。到目前为止，你已经发现（特别是打印 `CellDescriptor.plist` 文件内容之后），当应用程序启动之后并不是所有单元格都是可见的（译者注： plist 文件中单元格的 Visible 属性，有些为 YES，有些则为 NO）。实际上，我们不能知晓它们究竟是否将同时可见，因为只有当每次用户要求时，它们才进行展开或折叠。

从编程角度来说，这意味着每个单元格的行索引值（row index）不允许为常量（一般我们处理单元格时，都喜欢使用`IndexPath.row`这种编程方式），所以我们不能通过单元格行号遍历数据源数组（cellDescriptors）并显示单元格。解决方式如下：仅提供可见的单元格行索引值。任何尝试显示描述中标记为不可见的单元格都会出错，当然还会导致其他异常应用行为。

所以，为此我们将要实现一个新函数`getIndicesOfVisibleRows()`。它的名字已经说明了它的作用: 它仅获取那些已经标记为可见的单元格。在我们继续执行之前，请再次回到类的顶部，新增如下声明：

```swift
var visibleRowsPerSection = [[Int]]()
```

该二维数组将用于存储每个 section 中可见的单元格行索引值（一维用作 section,另一维用作 rows）。

现在，让我们来看新函数的实现。你可能已经猜到，我们将检查所有单元格的描述信息，接着将那些“isVisible”属性值为`YES`的单元格索引值添加到二维数组中。很显然，我们不得不通过一个嵌套循环来处理，但是它用起来不难。这里是函数实现:

```swift
func getIndicesOfVisibleRows() {
    visibleRowsPerSection.removeAll()
    
    // 遍历单元格描述数组
    for currentSectionCells in cellDescriptors {
        // 暂存每个 section 中，isVisible = true 的行号
        var visibleRows = [Int]()
 
        for row in 0...((currentSectionCells as! [[String: AnyObject]]).count - 1) {
            // 检查每个单元格的isVisible属性是否为true
            if currentSectionCells[row]["isVisible"] as! Bool == true {
                visibleRows.append(row)
            }
        }
        // 将所有标记为可见的单元格行号保存到该数组中
        // 首次加载描述文件后 该数组值为 [[0, 3, 5], [0, 5], [0]]
        visibleRowsPerSection.append(visibleRows)
    }
}
```

请注意，函数一开始需要清空`visibleRowsPerSection`数组中之前的所有内容，否则后续调用该函数我们将最终得到错误的数据。除此之外，实现方式非常简单，所以我不会过多介绍细节。

首次调用上述函数位置应该在从文件加载单元格描述信息操作之后（我们将在之后再次调用它）。因此，重新审视我们在这一部分中实现的第一个函数，我们修改如下:

```swift
func loadCellDescriptors() {
    if let path = NSBundle.mainBundle().pathForResource("CellDescriptor", ofType: "plist") {
        cellDescriptors = NSMutableArray(contentsOfFile: path)
        getIndicesOfVisibleRows()
        tblExpandable.reloadData()
    }
}
```

尽管 tableview 目前还不能正常使用（要知道还未实现 Datasource 方法！），但我们提前调用`reloadData()`进行 tableview 重载，确保应用程序启动后，能够正确显示单元格内容。


### 显示单元格

别忘了每一次应用程序启动时都要加载单元格描述，下面我们准备处理和显示这些单元格。本小节中，我们首先创建另一个新函数，在 `cellDescriptors` 数组中查找并返回适当的单元格描述信息。如你即将在下面代码片段中看到的一样，从 `visibleRowsPerSection` 数组中获取数据（即可见行的索引值）是新函数工作的先决条件。

```swift
func getCellDescriptorForIndexPath(indexPath: NSIndexPath) -> [String: AnyObject] {
    // 步骤一：
    let indexOfVisibleRow = visibleRowsPerSection[indexPath.section][indexPath.row]
    // 步骤二：
    let cellDescriptor = cellDescriptors[indexPath.section][indexOfVisibleRow] as! [String: AnyObject]
    return cellDescriptor
}
```

上述函数接受某个单元格的路径索引值（`NSIndexPath`），且该单元格此刻是 tableview 的处理项；函数返回值为一个字典，包含匹配单元格的所有属性。函数内部实现的首要任务在给定路径索引值（即 index path）的条件下，找到匹配的可见行的索引值,这一步很简单，只需要传入每个单元格的 section 和 row 即可（请见步骤一）。到目前为止，我们还未接触到 tableview 的代理方法，对上述内容也一知半解，但是我可以提前给你打个“预防针”：每个 section 的 row 总数将与每个 section 中的可见单元格数目保持一致。这意味着，上述实现中任意一个 indexPath.row 值（译者注：section是固定的），在 visibleRowsPerSection 数组中都能找到一个可见单元格的索引值与之匹配。

通过每个单元格的行索引值，我们可以从 `cellDescriptors` 数组中“提取”到单元格描述信息（字典类型）。请注意提取过程中，数组的第二个维度值为 `indexOfVisibleRow`，而不是 `indexPath.row`。倘若使用第二个将导致返回错误数据。

我们再次构建了一个非常有用的函数，事实证明在之后的开发中非常好用。现在我们开始实现 `viewController` 类中的已存在的 tableview 方法。首先，我们需要指定 tableview 的 section 数量。

```swift
func numberOfSectionsInTableView(tableView: UITableView) -> Int {
    if cellDescriptors != nil {
        return cellDescriptors.count
    }
    else {
        return 0
    }
}
```

你要知道我们不能忽视 `cellDescriptors` 数组为`nil`的情况。当数组已经初始化完毕且填充了单元格描述信息，我们返回数组的元素个数。

接着，我们指定每个 section 的行数。正如我之前所说的，行数和可见单元格数量保持一致，所以我们可以仅用一行代码返回该信息。

```swift
func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return visibleRowsPerSection[section].count
}
```

之后，确定 tableview 中每个 section 的标题：

```swift
func tableView(tableView: UITableView, titleForHeaderInSection section: Int) -> String? {
    switch section {
    case 0:
        return "Personal"
 
    case 1:
        return "Preferences"
 
    default:
        return "Work Experience"
    }
}
```

接着，是时候指定每一行的高度了：

```swift
func tableView(tableView: UITableView, heightForRowAtIndexPath indexPath: NSIndexPath) -> CGFloat {
    let currentCellDescriptor = getCellDescriptorForIndexPath(indexPath)
 
    switch currentCellDescriptor["cellIdentifier"] as! String {
    case "idCellNormal":
        return 60.0
    case "idCellDatePicker":
        return 270.0
    default:
        return 44.0
    }
}
```

这里我需要强调一些东西：这部分中我们首次调用早前实现的 `getCellDescriptorForIndexPath:`函数。我们需要获得正确的单元格描述信息，紧接着有必要取得“cellIdentifier”属性，只有依靠它的值才能指定行高。你可以在每个 xib 文件中检查每种类型的单元格行高（就是如下所示的行高）。

最后是显示实际的单元格。起初，每个单元格必须被 `dequeued`:

```swift
func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
    let currentCellDescriptor = getCellDescriptorForIndexPath(indexPath)
 
    // 每个单元格都是通过出列得到
    let cell = tableView.dequeueReusableCellWithIdentifier(currentCellDescriptor["cellIdentifier"] as! String, forIndexPath: indexPath) as! CustomCell
 
    return cell
}
```

再次，我们传入当前路径索引值获得正确的单元格描述。通过使用"cellIdentifier"属性出列一个正确的单元格，这样我们能够对每个单元格的特殊处理作进一步的深入探讨（译者注：说白了就是根据 cellIdentifier 标识符对单元格做分支处理）。

```swift
func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
    let currentCellDescriptor = getCellDescriptorForIndexPath(indexPath)
    let cell = tableView.dequeueReusableCellWithIdentifier(currentCellDescriptor["cellIdentifier"] as! String, forIndexPath: indexPath) as! CustomCell
 
    if currentCellDescriptor["cellIdentifier"] as! String == "idCellNormal" {
        if let primaryTitle = currentCellDescriptor["primaryTitle"] {
            cell.textLabel?.text = primaryTitle as? String
        }
 
        if let secondaryTitle = currentCellDescriptor["secondaryTitle"] {
            cell.detailTextLabel?.text = secondaryTitle as? String
        }
    }
    else if currentCellDescriptor["cellIdentifier"] as! String == "idCellTextfield" {
        cell.textField.placeholder = currentCellDescriptor["primaryTitle"] as? String
    }
    else if currentCellDescriptor["cellIdentifier"] as! String == "idCellSwitch" {
        cell.lblSwitchLabel.text = currentCellDescriptor["primaryTitle"] as? String
 
        let value = currentCellDescriptor["value"] as? String
        cell.swMaritalStatus.on = (value == "true") ? true : false
    }
    else if currentCellDescriptor["cellIdentifier"] as! String == "idCellValuePicker" {
        cell.textLabel?.text = currentCellDescriptor["primaryTitle"] as? String
    }
    else if currentCellDescriptor["cellIdentifier"] as! String == "idCellSlider" {
        let value = currentCellDescriptor["value"] as! String
        cell.slExperienceLevel.value = (value as NSString).floatValue
    }
 
    return cell
}
```

对于普通的单元格来说，我们仅需要设置 textLabel 标签的文本值为 primaryTitle，以及设置 detailTextLabel 标签的文本值为 secondaryTitle即可。在我们的演示应用中，使用 idCellNormal 标示符的单元格实际上就是顶级单元格（ top-level cells）,点击可展开和折叠内容。

对于那些包含 textfiled 的单元格，我们仅需将它的占位符值（placeholder value）设置为单元格描述信息中的 primaryTitle 即可。

对于那些包含 switch 控件的单元格，我们需要做两件事：首先指定 switch 控件前面的显示文本内容（示例中是常量，你可以通过修改 CellDescriptor.plist 文件改变它），其次我们需要为 switch 控件设置合适的状态，根据描述信息来决定“on”还是“off”。注意之后我们将有可能改变该值。

这里还有一些标识符为“idCellValuePicker”的单元格，这些单元格旨在提供一个选项列表。当点击选中某个选项时，父单元格会自动折叠当前内容。此时父单元格的文本标签值设置为选中值。

最后，有单元格包含了 slider 控件。这里我们从 currentCellDescriptor 字典中获取到当前值，将其转换为 float 类型的数字，再赋值给 slider 控件，这样它在可视情况下总能呈现正确的值。稍后我们会改变这个值，以及更新相应的单元格描述。

而那些没有添加上述几种情况标识符的单元格，在本演示应用中不会起任何作用。但是，倘若你想以不同的方式处理它们,可以随意修改代码并添加任何缺失的部分。

现在你可以运行应用，看看目前的成果。期望不要过高，因为你仅仅看到的只是顶级单元格内容。别忘了我们还未启用展开功能，所以当你点击它们时什么都不会出现。然而，不要气馁，正如你所看到的，到目前为止我们一切进展顺利。

![](/img/articles/expandable-table-view/t45_6_top_level_cells.png1500171565.73)




### 展开和折叠

我猜想本节内容你可能期盼已久了，毕竟这是本教程实际目的所在。下面我们将通过每次点击顶级单元格控制展开和折叠，以及按要求显示或隐藏正确的子单元格。

首先，我们需要知道点击行的索引值（记住，不是实际的 indexPath.row,而是可见单元格中的行索引值），我们会首先将它分配给一个局部变量，如下 tableview 代理方法中所示：

```swift
func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
    let indexOfTappedRow = visibleRowsPerSection[indexPath.section][indexPath.row]
}
```

虽然实现单元格展开和折叠的代码量不大，但是我们还是会逐步深入，这样你能理解每个步骤的作用。现在我们获取到了点击行的实际索引值，我们必须检查 cellDescriptors 数组中该单元格是否允许展开。如果它允许展开，且当前处于折叠状态时，我们将指示（我们将使用一个 flag 标志位）这个单元格必须展开，反之这个单元格必须折叠：

```swift
func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
    let indexOfTappedRow = visibleRowsPerSection[indexPath.section][indexPath.row]
 
    if cellDescriptors[indexPath.section][indexOfTappedRow]["isExpandable"] as! Bool == true {
        var shouldExpandAndShowSubRows = false
        if cellDescriptors[indexPath.section][indexOfTappedRow]["isExpanded"] as! Bool == false {
            // In this case the cell should expand.
            shouldExpandAndShowSubRows = true
        }
    }
}
```

一旦上面的 flag 标志位设置为相应值，指示当前单元格的展开状态，这时候我们有责任将标志位值保存到单元格描述集合中，即更新 cellDescriptors 数组。我们要为选中的单元格更新 “isExpanded” 属性
，这样在随后的点击中它都能正常运行（当它处于展开时点击折叠，当折叠时点击展开）。

```swift
func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
    let indexOfTappedRow = visibleRowsPerSection[indexPath.section][indexPath.row]
 
    if cellDescriptors[indexPath.section][indexOfTappedRow]["isExpandable"] as! Bool == true {
        var shouldExpandAndShowSubRows = false
        if cellDescriptors[indexPath.section][indexOfTappedRow]["isExpanded"] as! Bool == false {
            shouldExpandAndShowSubRows = true
        }
 
        cellDescriptors[indexPath.section][indexOfTappedRow].setValue(shouldExpandAndShowSubRows, forKey: "isExpanded")
    }
}
```

此刻，这里还有一个相当重要的细节不容我们忽视：如果你还记得，前文中指定了一个名为“isVisible”的属性表明单元格的显示状态，就存在于单元格的描述中。该属性必须随着上文 flag 值改变而改变，所以当单元格展开时，显示其他附加的不可见行，反之当单元格折叠时，隐藏那些附加行。实际上，通过更改该属性的值我们实现了单元格展开和折叠的效果。所以一旦点击了顶级单元格，需要立即更新附加单元格的信息，以下是修改后的代码片段：

```swift
func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
    let indexOfTappedRow = visibleRowsPerSection[indexPath.section][indexPath.row]
 
    if cellDescriptors[indexPath.section][indexOfTappedRow]["isExpandable"] as! Bool == true {
        var shouldExpandAndShowSubRows = false
        if cellDescriptors[indexPath.section][indexOfTappedRow]["isExpanded"] as! Bool == false {
            shouldExpandAndShowSubRows = true
        }
 
        cellDescriptors[indexPath.section][indexOfTappedRow].setValue(shouldExpandAndShowSubRows, forKey: "isExpanded")
 
        for i in (indexOfTappedRow + 1)...(indexOfTappedRow + (cellDescriptors[indexPath.section][indexOfTappedRow]["additionalRows"] as! Int)) {
            cellDescriptors[indexPath.section][i].setValue(shouldExpandAndShowSubRows, forKey: "isVisible")
        }
    }
}
```

我们距离追寻已久的功能实现仅一步之遥，但是我们首先必须关注一个更重要的事情：在上面代码片段中，我们仅改变了一些单元格的“isVisible”属性值，这意味着所有可见行的总数也随之改变了。所以，在我们重载 tableview 之前，我们必须重新向应用询问可见行的索引值：

```swift
func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
    let indexOfTappedRow = visibleRowsPerSection[indexPath.section][indexPath.row]
 
    if cellDescriptors[indexPath.section][indexOfTappedRow]["isExpandable"] as! Bool == true {
        var shouldExpandAndShowSubRows = false
        if cellDescriptors[indexPath.section][indexOfTappedRow]["isExpanded"] as! Bool == false {
            shouldExpandAndShowSubRows = true
        }
 
        cellDescriptors[indexPath.section][indexOfTappedRow].setValue(shouldExpandAndShowSubRows, forKey: "isExpanded")
 
        for i in (indexOfTappedRow + 1)...(indexOfTappedRow + (cellDescriptors[indexPath.section][indexOfTappedRow]["additionalRows"] as! Int)) {
            cellDescriptors[indexPath.section][i].setValue(shouldExpandAndShowSubRows, forKey: "isVisible")
        }
    }
 
    getIndicesOfVisibleRows()
    tblExpandable.reloadSections(NSIndexSet(index: indexPath.section), withRowAnimation: UITableViewRowAnimation.Fade)
}
```

正如你看见的那样，我仅对属于点击单元格的 section 部分进行动画重载，倘若你不喜欢这种方式的话，可以自己来实现。

现在快启动应用试试。点击顶级单元格进行展开和折叠，和子单元格互动下，尽管啥都不会发生，但是结果看起来相当棒！


![](/img/articles/expandable-table-view/t45_7_expand_collapse.gif1500171566.17)


### 取值

从现在开始，我们将把注意力完全集中在处理数据输入以及用户与子单元格内的控件的交互上。首先我们将为那些标识符为 “idCellValuePicker” 的单元格实现逻辑事务，处理点击事件。在我们的演示应用中，这些单元格都属于 tableview 中的 “Preferences” 部分，罗列最喜欢的运动和颜色选项内容。即使早前已经提及过，但是我觉得还是有必要重新让你回忆下，再次重申：当你点击选择某个选项后，相应的顶级单元格应该随之折叠（隐藏那些选项），并将选中的值显示到顶级单元格中。
。

我之所以选择处理这种类型的单元格为先，原因在于我可以继续在上部分的 tableview 代理方法中进行工作。方法中，我们将添加一个 `else` 分支处理 non-expandable 单元格的情况，接着检查点击单元格的标识符。如果标识符为“idCellValuePicker”，这就是我们感兴趣的单元格。


```swift
func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
    let indexOfTappedRow = visibleRowsPerSection[indexPath.section][indexPath.row]
 
    if cellDescriptors[indexPath.section][indexOfTappedRow]["isExpandable"] as! Bool == true {
        ...
    }
    else {
        if cellDescriptors[indexPath.section][indexOfTappedRow]["cellIdentifier"] as! String == "idCellValuePicker" {
 
        }
    }
 
    getIndicesOfVisibleRows()
    tblExpandable.reloadSections(NSIndexSet(index: indexPath.section), withRowAnimation: UITableViewRowAnimation.Fade)
}
```

在 `if` 分支内，我们将执行四种不同的任务：

1. 首先，我们需要找到顶级单元格的行索引值，即你点击选中的单元格的“父母”。事实上，我们采用自下而上（即从点击选中的单元格开始向上遍历）的方式对单元格描述数组执行一次搜索，首个属性`isExpandable = true`的单元格就是我们想要的家伙。
2. 接着，将顶级单元格中的 textLabel 标签值设置为选中单元格的值。
3. 然后，设置顶级单元格的 isExpanded 等于 false ，即折叠状态。
4. 最后，标记顶级单元格下的所有子单元格为不可见状态。

现在代码如下：

```swift
func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
    let indexOfTappedRow = visibleRowsPerSection[indexPath.section][indexPath.row]
 
    if cellDescriptors[indexPath.section][indexOfTappedRow]["isExpandable"] as! Bool == true {
        ...
    }
    else {
        if cellDescriptors[indexPath.section][indexOfTappedRow]["cellIdentifier"] as! String == "idCellValuePicker" {
            var indexOfParentCell: Int!
            
            // 任务一
            for var i=indexOfTappedRow - 1; i>=0; --i {
                if cellDescriptors[indexPath.section][i]["isExpandable"] as! Bool == true {
                    indexOfParentCell = i
                    break
                }
            }
            // 任务二
            cellDescriptors[indexPath.section][indexOfParentCell].setValue((tblExpandable.cellForRowAtIndexPath(indexPath) as! CustomCell).textLabel?.text, forKey: "primaryTitle")
            
            // 任务三
            cellDescriptors[indexPath.section][indexOfParentCell].setValue(false, forKey: "isExpanded")
    
            // 任务四
            for i in (indexOfParentCell + 1)...(indexOfParentCell + (cellDescriptors[indexPath.section][indexOfParentCell]["additionalRows"] as! Int)) {
                cellDescriptors[indexPath.section][i].setValue(false, forKey: "isVisible")
            }
        }
    }
 
    getIndicesOfVisibleRows()
    tblExpandable.reloadSections(NSIndexSet(index: indexPath.section), withRowAnimation: UITableViewRowAnimation.Fade)
}
```

我们再次修改了单元格中的“isVisible”属性，所有可见行的数量也随之改变。显然调用上述代码中的最后两个函数是非常有必要的。

现在如果你运行应用，实现效果如下：

![](/img/articles/expandable-table-view/t45_8_select_preferences.gif1500171566.55)


### Responding to Other User Actions（求翻译）

打开 CustomCell.swift 文件，找到 CustomCellDelegate 的协议声明，其中定义了一系列需要的协议方法。通过在 ViewController 类中实现它们，我们将设法使应用程序响应所有缺省的用户操作。

让我们再次回到 ViewController.swift 文件，首先我们需要遵循该协议。定位到类的头部声明行，添加如下内容：

```swift
class ViewController: UIViewController, UITableViewDelegate, UITableViewDataSource, CustomCellDelegate
```

接着，在 `tableView:cellForRowAtIndexPath:` 函数中，我们必须将每个自定义单元格的代理设置为 ViewController 类（即 self）。定位到那里，就在`return cell` 的上方添加一行代码：

```swift
func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
    ...
 
    // 设置代理
    cell.delegate = self
 
    return cell
}
```

干得不错，现在我们开始实现代理方法。首先，我们将 date picker 控件中选中的日期显示到相应顶级单元格中：

```swift
func dateWasSelected(selectedDateString: String) {
    let dateCellSection = 0
    let dateCellRow = 3
 
    cellDescriptors[dateCellSection][dateCellRow].setValue(selectedDateString, forKey: "primaryTitle")
    tblExpandable.reloadData()
}
```

一旦我们指定了正确的 section 和 row, 直接赋值字符串类型的日期值。注意该字符串是代委托方法中的一个参数。

接着，我们处理有关 switch 控件的事务。当 switch 控件值改变时，我们需要做两件事：首先，将顶级单元格内容设置为结果值（“Single” 或 “Married”），接着更新 cellDescriptor 数组中的 switch 控件值，这样每次 tableview 刷新时它都拥有正确的状态。下面的代码片段中，你会注意我们首次根据 switch 控件状态来确定适当的值，接着将它们赋值给相应属性：

```swift
func maritalStatusSwitchChangedState(isOn: Bool) {
    let maritalSwitchCellSection = 0
    let maritalSwitchCellRow = 6
 
    let valueToStore = (isOn) ? "true" : "false"
    let valueToDisplay = (isOn) ? "Married" : "Single"
 
    cellDescriptors[maritalSwitchCellSection][maritalSwitchCellRow].setValue(valueToStore, forKey: "value")
    cellDescriptors[maritalSwitchCellSection][maritalSwitchCellRow - 1].setValue(valueToDisplay, forKey: "primaryTitle")
    tblExpandable.reloadData()
}
```

接下来是包含了 textField 控件的单元格。此处一旦有 first name 或 last name 输入，我们会动态组合成 full name。出于需要，我们将获取到包含 textField 控件单元格的行索引值，这样就能为 full name 设置给定值了（first name + last name）。最后我们更新顶级单元格内的显示本文内容（full name）和刷新 tableview 。

```swift
func textfieldTextWasChanged(newText: String, parentCell: CustomCell) {
    let parentCellIndexPath = tblExpandable.indexPathForCell(parentCell)
 
    let currentFullname = cellDescriptors[0][0]["primaryTitle"] as! String
    let fullnameParts = currentFullname.componentsSeparatedByString(" ")
 
    var newFullname = ""
 
    if parentCellIndexPath?.row == 1 {
        if fullnameParts.count == 2 {
            newFullname = "\(newText) \(fullnameParts[1])"
        }
        else {
            newFullname = newText
        }
    }
    else {
        newFullname = "\(fullnameParts[0]) \(newText)"
    }
 
    cellDescriptors[0][0].setValue(newFullname, forKey: "primaryTitle")
    tblExpandable.reloadData()
}
```

最后在 “Work Experience” 部分中，我们处理那些内含 slider 控件的单元格。当用户改变 slider 控件值的同时，我们需要做两件事：
首先将顶级单元格中的文本标签内容设置为新的 slider 控件值，接着将 slider 控件值保存到对应的单元格描述中，这样即使刷新 tableview 后，它始终是最新数据。

```swift
func sliderDidChangeValue(newSliderValue: String) {
    cellDescriptors[2][0].setValue(newSliderValue, forKey: "primaryTitle")
    cellDescriptors[2][1].setValue(newSliderValue, forKey: "value")
 
    tblExpandable.reloadSections(NSIndexSet(index: 2), withRowAnimation: UITableViewRowAnimation.None)
}
```

最后的缺省代码添加完毕，运行应用。

### 总结

正如一开始我所说的，创建一个可展开的 tableview 有时真的很有用，它可以将你从麻烦中拯救出来，无须再为应用各部分创建一个新的视图控制器。本教程的前部分中，我向你介绍了一种创建可展开的 tableview 的方法，其主要特点是所有单元格的描述都存放在属性列表文件（plist 文件）中。教程中，我向你展示了如何在显示、展开和选中单元格情况下，编写代码处理单元格描述列表；另外，我还向你提供了一种方式来直接更新用户输入的数据。尽管演示应用中的伪造表格在实际应用开发中所有作为，但想要作为一个完整的组件之前，你还需要实现一些功能（比如，把表单描述列表保存到文件中）。不过，这已经超出了我们的教学范畴；一开始我们只想要实现一个可展开的 tableview ，随心所欲地显示或隐藏单元格，最终也得以实现。我确信你会找到本教程
的价值。通过已有的代码，你肯定能在此基础上改进，并根据需求使用它。现在留点时间给你；玩得开心，切记学无止境！

**参考：** [完整项目代码下载地址.](https://github.com/appcoda/expandable-table-view)
