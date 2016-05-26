MVVM 不是那么好"

> 作者：Soroush Khanlou，[原文链接](http://khanlou.com/2015/12/mvvm-is-not-very-good/)，原文日期：2015-12-17
> 译者：[zltunes](http://zltunes.com)；校对：[Channe](undefined)；定稿：[shanks](http://codebuild.me/)
  









我写过许多关于让 `ViewController` 变得更轻量的文章，`Model-View-ViewModel` 是一种常用的可以实现该目的的设计模式。我觉得 MVVM 是一种反人类的设计模式，它使架构更加混乱而非清晰。`View Model`的命名很糟糕，它只是架构优化的权宜之计。对我们来说放弃这一模式反而更好。



### MVVM 命名很糟糕
名称是很重要的。一个理想的名称能够有效地传达出对象是干什么的，扮演什么角色以及怎么使用它。`View Model`这一名称则没有发挥任何作用。

在我看来，`View Model`这个十分抽象的名称实际上指的是两个截然不同的设计模式。

`View Model`的第一种含义是 `model for the view`（视图的模型）。这是一个愚蠢的对象（严格来讲 Swift 中叫`struct`），用来传递给某个视图去填充它的子视图。它不应该包含任何逻辑或方法。类似于`UILabel`需要一个字符串，`UIImageView` 需要一张图像，`ProfileView`需要一个`ProfileViewModel`。该对象直接传递给`ProfileView`，它允许你的子视图是私有的而非暴露给外界，这是很有用的一点。我更喜欢把这种设计模式叫做`view data`，因为它把自己从`view model`的另一种定义的包袱中除去了。

`View model`另一种含义是介于模型和视图控制器之间的一种模糊、抽象的对象。负责将数据传递给表示层，有时候也作为网络和数据库通道，或者表单验证以及其他类似的任务。这种“万金油”式的对象可以为你的控制器减压，但往往最后会成为一个新的“下水道”，什么任务都往里面堆。

### MVVM 引进太多职责
命名不够具体，导致这个类的任务无休止地增长。到底哪些任务应该交给`view model`？没有人知道，好像什么都能交给它。

让我们看一些例子。

- [这里](https://medium.com/@ramshandilya/lets-discuss-mvvm-for-ios-a7960c2f04c7)将网络请求放入`view model`，并建议你添加验证和表示的逻辑。
- [这里](https://www.objc.io/issues/13-architecture/mvvm/)只展示了如何将表示逻辑放到`view model`中，并提出为什么不把它命名为`Presenter`的问题。
- [这里](http://cocoasamurai.blogspot.com/2013/03/basic-mvvm-with-reactivecocoa.html)讲到用`view model`上传数据并绑定到`ReactiveCocoa`。
- [这里](http://www.sprynthesis.com/2014/12/06/reactivecocoa-mvvm-introduction/)用`view model`进行验证和获取数据。
- [这里](http://www.teehanlax.com/blog/model-view-viewmodel-for-ios/)明确建议你在`view model`中放入“其他代码”:

> view model 非常适合干这些事：验证逻辑、用户输入、视图展示逻辑、网络请求以及其他代码。

没有人知道`view model`到底是什么意思，所以无法就“哪些功能交给 view model”达成一致。它本身概念过于抽象。这些作者对一个 `Validator` 类、`Presenter` 类或者 `Fetcher` 类该做什么是没有异议的，这些名字都起得很好，能准确传达出对应类扮演的角色。

给用途截然不同的对象起同一个名字只能给读者造成困惑。如果我们不能就`view model`的功能达成一致，为什么要给他们起这个名字？

这种看法面临着一个[类似的挑战](http://khanlou.com/2014/11/a-controller-by-any-other-name/)，我们发现`controller`这个名称同样太宽泛，无法包含一系列确切的任务。

你自己的类叫什么名字完全由你决定，选个好听的就是了！

### MVVM 不改变你的架构

`view model` 并不能从根本上改变你的应用程序的架构。这两张图有什么不同（[原图](https://www.objc.io/issues/13-architecture/mvvm/)）？
<center>
![](http://khanlou.com/wp-content/uploads/2015/12/mvvm1-16d81619.png)
</center>
<center>
![](http://khanlou.com/wp-content/uploads/2015/12/mvvm-b27768df.png)
</center>

不需要利用先进的图片理论你也能看出这两张图几乎是一样的。

我能想到的 MVVM 模式最大的好处就是它把“下水道”从苹果自带的 `view controoller`类转移到了`view model`这一自定义的对象。`view controller`只需要专注于视图生命周期事件即可，变得很简洁。尽管如此，还是有“下水道”存在，仅仅是转移了而已。

由于`view model`只是给 app 添加的一层定义简陋的模块，仍无法解决复杂性的问题。如果你为了避免`view controller`过于臃肿而创建了`view model`，那么当你的代码规模加倍的时候会发生什么？也许我们可以加一个`controller-model`层。

`view model`方案不能大规模扩张。对于它想解决的问题来说只能做到缓解而无法完全避免。我们需要一个更佳的方案，比如可以尝试随着一个对象的增大不断去分解它，像细胞进行有丝分裂一样。`View model`只是权宜之计。

### 其他社区也曾面临该问题

几年前 Rails 社区也曾遇到这种问题，他们也想出了解决方案，我们可以从中获得一些启示。首先他们有臃肿的`controller`以及几乎没什么内容的`model`。这种情况下很难进行测试，所以把所有的逻辑代码分解到`model`中，最终`controller`变得很简洁，`model`变得臃肿。复杂的`model`依赖于`ActiveRecord`和数据库，依旧难以测试，仍需要继续分割成更小的部分。

[ 7 Patterns to Refactor Fat ActiveRecord Models ](http://blog.codeclimate.com/blog/2012/10/17/7-ways-to-decompose-fat-activerecord-models/)这篇博客受到[8 Patterns to Help You Destroy Massive View Controller](http://khanlou.com/2014/09/8-patterns-to-help-you-destroy-massive-view-controller/)的影响，是这一系列想法下的产物。总而言之你仍需要将那些恼人的东西分割成小的单元，“转移下水道”的做法仅是缓解之计。

`view model`是一种完全无法应对现代编程挑战的做法，命名糟糕，对自己包含的功能不明确，最终面临和`controller`一样的问题。它只是对复杂情形的权宜之计，如果我们不去避免这种做法，很快又会面临同样的问题。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。