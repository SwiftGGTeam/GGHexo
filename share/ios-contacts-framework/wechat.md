初识 iOS 9 中新的联系人框架"

> 作者：gabriel theodoropoulos，[原文链接](http://www.appcoda.com/ios-contacts-framework/)，原文日期：2015-09-29
> 译者：[BridgeQ](http://wxgbridgeq.github.io/)，[ 星夜暮晨](undefined)；校对：[小铁匠Linus](http://weibo.com/linusling)；定稿：[]()
  









同每一代 iOS 系统版本的更新一样，最新发布的 iOS 9 为用户和开发者带来了许多新特性以及原有功能的改善。在这个版本中，我们不仅看到了很多首次推出的 API，还可以看到许多针对原有框架和类库的更新。此外，一些旧版本的 API 被标记为 `deprecated`（校对注：意为新版本已被弃用），而使用了更好的 API 来替代。iOS 9 中，新的 *Contacts framework* （联系人框架）是最好的例子了，它是来代替原有 *[AddressBook framework](http://www.appcoda.com/ios-programming-import-contact-address-book/)* 的。该框架更加符合技术潮流且简单易用。



过去使用过 *AddressBook* API 的开发者经常会抱怨这个旧有的联系人框架非常难用，大家普遍认为它不易理解而且很难管理，对开发者菜鸟来说更是如此。然而，这些都已成为历史，全新的联系人框架非常简单易用，通过它你可以很容易地查找、创建和更新联系人信息，开发时间被极大地减少，扩展更新也可以很快地实现。


<center>
![](http://www.appcoda.com/wp-content/uploads/2015/09/contacts-framework.jpg)
</center>


在接下来的部分中，我们将重点介绍 *`Contacts framework`* 中最主要的内容。如果需要更多的技术细节，你可以去苹果的官方文档中查找，或者观看 [WWDC 2015 session 223 video](https://developer.apple.com/videos/play/wwdc2015-223/) 来学习。

首先，我们来谈论一件非常重要的事情，那就是用户隐私。用户总是在被询问是否允许应用程序访问他们的联系人数据，如果被允许，应用就可以自由地同联系人数据库进行交互，而如果用户禁止访问，那么应用必须尊重用户的选择，即无法同联系人数据进行任何交互。稍后，我们会谈论用户隐私的更多细节，我们将看到如何通过程序的手段来处理所有可能的情况。此外，要记住用户总是有资格在手机设置的选项中更改应用的授权状态，所以在你想要执行与联系人数据相关的任务前，总应该检查你的应用是否允许访问联系人数据。

联系人数据的主要来源是设备内置的数据库。然而，新的联系人框架不仅可以检索这个数据库，实际上，它还可以对别的来源进行数据的检索，比如通过你的 iCloud 账户（当然是在你已经连接了 iCloud 账户的情况下），并且返回检索到的联系人结果。这是非常有用的，因为你不需要单独再进行某个来源的检索，你一次就能够检索所有数据，并且可以随意管理。

新的联系人框架包括了许多不同功能的类，所有类都非常重要，但其中使用最多的一个是 *`CNContactStore`*，它代表联系人数据库，并且提供了大量的操作方法，比如查询、保存、更新联系人记录、授权检查、授权请求等。 *`CNContact`* 表示一条联系人记录，并且它的内部属性都是不可变的，如果你想要创建或者更新一条已经存在的联系人记录，你应该使用它的可变版本 *`CNMutableContact`*。值得注意的是，当你使用联系人框架时，尤其是进行联系人查找时，你应该总是在后台执行。如果一条联系人记录的查找花费较长的时间并且在主线程执行的话，你的应用会无法响应，这会使应用的用户体验非常糟糕。

当导入联系人数据到应用中时，几乎不需要导入所有的联系人属性。在所有联系人框架允许的搜索范围中检索所有已存在的联系人数据，是一个非常费资源的操作，你应该尽量避免这样去做，除非你确定你真的需要使用所有的联系人数据。可喜的是，新联系人框架提供了仅检索部分结果的方式，即检索一个联系人的部分属性。比如说，你可以只查找联系人的姓、名、家庭邮件地址和家庭电话号码，而撇开所有那些你不需要的数据。

除了通过编程的方式来使用联系人框架，它还提供了一些默认的用户界面（UI），可以让你的应用以直观可视的方式访问联系人数据。默认提供的用户界面跟手机自带联系人应用几乎一样，也就是说同样有一个联系人选择控制器（*contact picker view controller*）用来选择联系人和联系人属性，一个联系人视图控制器用来展示联系人的详细信息并且处理某些操作（例如，拨打电话）。

上面所有这些方面我们都将在本教程的后续部分详细介绍。再次声明，你可以通过官方文档来学习所有这些方面的详细内容。接下来，我们先来看一下示例程序是什么样子，然后我们开始学习使用新的联系人框架中的各种类，你会发现新的联系人框架非常易用而且有趣。

## 示例应用简介

我试图在本篇教程的示例应用中，尽可能给大家全面地展示这个新框架的功能。实际上，在以下部分我将会给大家展示：

1. 检查应用是否准许访问联系人，并且如何请求授权。
2. 使用三种不同的方式检索联系人。其中一种方式将会涉及 Picker View Controller 的使用。
3. 访问检索到的联系人属性，并调整为适当的显示格式。
4. 使用默认的 *Contacts* UI 来实现选择、查看以及编辑联系人。
5. 创建一个新的联系人。

我将这个示例应用命名为 *Birthdays*，因为其目的就是展示所有联系人生日信息。同时，还会显示联系人的全名、头像（如果有的话）以及*家庭* email 地址。虽然在理想情况下，这个应用的主要功能应该是进行生日提醒，不过我们并不会处理诸如通知、发送短信之类的事情。

这个应用是基于导航栏设计的，包含了以下几个部分：

*ViewController* 是应用启动时的默认展示界面。它将会展示我在上面所提及的所有信息，包括导入的联系人，提供检索联系人的选项（右边的导航栏按钮）、创建新的联系人（左边的导航栏按钮）以及通过单击单元格来查看联系人的具体信息：

<center>
![默认展示界面](http://www.appcoda.com/wp-content/uploads/2015/09/t43_1_display_records.png)
</center>

联系人详情将会通过内置的联系人视图控制器进行展示。你会在后面看到，这个控制器既可以展示所有的联系人信息，也可以只显示你感兴趣的内容。

在接下来的内容中，检索联系人将会是一个非常有意思的部分。我会为大家展示三种进行检索的方法，我将使用三种不同的思路：

1. 第一种方法，我们将通过填写联系人姓名（或者姓名的一部分），点击键盘上的返回按钮，然后应用就会检索所有匹配该姓名的联系人。
2. 在下面这个截图中您可以看到，屏幕中央有一个选择器视图。我们将会用它来寻找所有生日满足对应月份要求的联系人，月份可以在这个选择器中进行选择，通过点击右上角的 "Done" 导航栏按钮，还会显示检索进度。
3. 我们将使用框架所提供的默认选择器视图控制器，来直接查看和检索联系人。值得注意的是，这个控制器可以自定义可用的联系人，此外其显示风格也可以自定义。大家会在后面部分看到如何操作。

<center>
![](http://www.appcoda.com/wp-content/uploads/2015/09/t43_2_fetch_contacts.png)
</center>

这个就是选择器视图控制器，其中只显示了有生日记录的联系人：

<center>
![](http://www.appcoda.com/wp-content/uploads/2015/09/t43_3_picker_view_controller.png)
</center>


我们这个应用的最后一个部分就是创建新联系人了。这个任务相当简单，为了简单起见，我们使用下面的这个视图控制器来输入我们要创建的联系人姓名、家庭 email 地址以及生日（我们不处理头像，这玩意儿对于我们的示例来说并不重要）。

<center>
![](http://www.appcoda.com/wp-content/uploads/2015/09/t43_4_create_contact.png)
</center>


这个示例应用所使用的数据（作为例子的联系人信息）都是 iPhone 模拟器默认数据库中所包含的。这些联系人信息对我们来说就已经足够了。当然，您也可以使用自己设备中的联系人信息，或者给模拟器中添加新的联系人。默认情况下模拟器所提供的联系人是没有头像的，但是你可以从照片库中简单地为联系人添加头像。

一如往常，您可以[下载这个起始项目](https://www.dropbox.com/s/4cgjzsmvexyclv2/ContactFrameworkStarter.zip?dl=0)，因为我们接下来所做的工作将从它开始。一旦您下载完成，您可以打开这个项目然后浏览一下其中我添加的那些代码。当您觉得准备好的时候，就可以继续阅读下一个部分了。

## Contact Store 类

我们在处理联系人的时候，经常使用的一个基础类就是 *`CNContactStore`* 类。这个类实际上代表了设备中所拥有的联系人数据库，它负责管理应用和实际数据库之间的数据交互操作。具体而言，它负责处理诸如检索、保存、更新联系人以及组记录(group records)之类的工作。简而言之，在使用联系人信息的时候，这个类是绝大多数我们所能做的任务的起始点，并且我们将会在下面要写的代码中看到它。

此外，我在概述中也提及了，用户隐私是 iOS 中重要的组成部分，因此在使用的时候千万要小心。众所周知，用户可以准许或者禁止第三方应用访问他们的联系人信息，因此确保您的应用在任何时候都准许显示与任务有关的联系人信息就变得至关重要。使用 *`CNContactStore`* 类，您可以检查您应用*当前的认证状态*，然后根据实际情况进行相应的处理。要记住，每当用户在查看设置的时候，都很有可能禁止应用访问他们的联系人信息，即使他们在应用初次启动的时候同意了这个请求，因此*在执行任务前一定要确保您有权限执行*，然后根据实际情况进行相应的处理。如果不这样做的话，往往会导致极差的用户体验，这也是您应当极力避免的。在本教程的这部分里，我们会认真考虑示例应用的认证状态。我们接下来将要做的，就是让你能够在项目中随意使用它。

您将会发现，Contact Store 类很擅长处理下面的情形（和其他方式相比）：

* 检索联系人
* 创建（保存）新联系人，以及更新联系人信息
* 使用 Contact Picker 视图控制器来选择联系人

要时刻记住，在整个类中我们只需要初始化一个 *`CNContactStore`* 对象，并使用它即可。另一方面，虽然我们可以在需要的时候创建一个新的 *`CNContactStore`* 对象，但是由于这个类代表了代码中的联系人数据库，那么为什么还要创建多个数据库的实例呢？因此，让我们从打开 *`AppDelegate.swift`* 文件开始吧，声明并初始化一个 *`CNContactStore`* 属性。在类的顶部添加以下代码：

    
    var contactStore = CNContactStore()

当然，在类的顶部导入下面这个框架也是必要的：

    
    import Contacts

好的！现在，在我们处理应用认证状态以及所有相关操作之前，让我们先写两个简便的辅助方法。注意这两个方法并不是必须的，没有它们我们仍能够很好地工作。不过，实现这些有特定功能的方法将会带来极大的便利。

因此，第一个方法会让其他类访问应用委托 (AppDelegate) 变得更容易些。正常情况下，为了访问应用委托我们需要使用下面这条语句：

    
    UIApplication.sharedApplication().delegate as! AppDelegate

然而，我个人觉得，每次获取应用委托的时候都要写上面这段代码，实在是太烦人了。我们为什么不写一个类方法呢？

    
    class func getAppDelegate() -> AppDelegate {
        return UIApplication.sharedApplication().delegate as! AppDelegate
    }

通过这个方法，我们可以以一个非常简单的方式来访问应用委托中的所有属性和方法。例如，我们可以从项目中的任意一个类中使用下面这行代码访问 `contectStore` 属性。

    
    AppDelegate.getAppDelegate().contactStore

第二个加在 `AppDelegate.swift` 文件中的辅助方法将会显示一个带有消息的警告控制器（alert controller），我们每次使用它的时候只需要提供一个参数即可。实现起来并不复杂，但是我们在这里做了一点小小的特殊动作；警告控制器必须通过视图控制器来进行显示，然而应用委托中并没有视图控制器的存在。要解决这个问题，我们首先必须要找到当前显示在应用窗口上的*顶层视图控制器*，然后在这个视图控制器中显示警告控制器。我们可以这么做：

    
    func showMessage(message: String) {
        let alertController = UIAlertController(title: "Birthdays", message: message, preferredStyle: UIAlertControllerStyle.Alert)
     
        let dismissAction = UIAlertAction(title: "OK", style: UIAlertActionStyle.Default) { (action) -> Void in
        }
     
        alertController.addAction(dismissAction)
     
        let pushedViewControllers = (self.window?.rootViewController as! UINavigationController).viewControllers
        let presentedViewController = pushedViewControllers[pushedViewControllers.count - 1]
     
        presentedViewController.presentViewController(alertController, animated: true, completion: nil)
    }

现在，我们要做的就是重点了，我们来处理应用的认证状态。该状态是通过 *`CNAuthorizationStatus`* 枚举来表示的，这个枚举属于 *`CNContactStore`* 类。它包含了下列四个枚举值：

1. `NotDetermined`：这个状态说明用户暂未决定是否允许访问联系人数据库。当应用第一次安装在设备上时将处于此状态。
2. `Restricted`：这个状态说明应用不仅不能够访问联系人数据，并且用户也不能在设置中改变这个状态。这个状态是某些被激活的限制所导致的（比如说家长控制）。
3. `Denied`：这个状态说明用户不允许应用访问联系人数据。这个状态只能够被用户改变。
4. `Authorized`：这个状态是所有应用都希望拥有的，这表明应用能够自由访问联系人数据库，然后根据联系人数据来处理某些任务。

有一点在这需要说明清楚：应用安装之后，当且仅当用户第一次尝试执行涉及联系人数据（比如说检索联系人）的操作时，iOS 才会显示一个预定义的警告控制器，询问用户是否给应用授权：

<center>
![](http://www.appcoda.com/wp-content/uploads/2015/09/t43_5_ask_authorization_alert.png)
</center>


如果用户准许授权，那么万事大吉。然而，如果用户禁止授权的话，那么应用就不能够获取联系人数据了，自然也没法做任何操作了。在我们的示例应用中，对于这个特殊的情况，我们会展示一个自定义的警告消息（使用我们此前定义的函数），告知用户他必须在设置中准许我们的应用访问联系人数据。我们在一个新的函数中处理这个状况，接下来我们会对其进行实现。显然，在这个函数中我们会尽可能考虑到所有的认证状态。我们先来看看函数吧，然后对其进行简短的分析：

    
    func requestForAccess(completionHandler: (accessGranted: Bool) -> Void) {
        let authorizationStatus = CNContactStore.authorizationStatusForEntityType(CNEntityType.Contacts)
     
        switch authorizationStatus {
        case .Authorized:
            completionHandler(accessGranted: true)
     
        case .Denied, .NotDetermined:
            self.contactStore.requestAccessForEntityType(CNEntityType.Contacts, completionHandler: { (access, accessError) -> Void in
                if access {
                    completionHandler(accessGranted: access)
                }
                else {
                    if authorizationStatus == CNAuthorizationStatus.Denied {
                        dispatch_async(dispatch_get_main_queue(), { () -> Void in
                            let message = "\(accessError!.localizedDescription)\n\nPlease allow the app to access your contacts through the Settings."
                            self.showMessage(message)
                        })
                    }
                }
            })
     
        default:
            completionHandler(accessGranted: false)
        }
    }

观察上面这个函数，你会发现它包含了一个 *completionHandler* 闭包，当应用准许访问联系人的时候通过传递一个 true 值来调用，不可访问的时候传递一个 false 值。某些状况非常简单，比如说 `Authorized` 或者 `Restricted`，通过 completionHandler 中传递的值可以很清楚的知道其操作。然而，有趣的是，这里 `Denied` 和 `NotDetermined` 状态的处理竟然是相同的，它们都会调用 `requestAccessForEntityType:completionHandler`，因此应用会请求授权。我之前提到的自定义消息只会在 `Denied` 状态下显示。

值得注意的是，  `requestAccessForEntityType:completionHandler:` 以及 `authorizationStatusForEntityType:` 这两个方法都需要一个 `CNEntityType` 参数。这是一个枚举值，它其中只包含了一个名为 `Contacts` 的值。这个枚举实际上指定了我们需要请求访问的实体。

从下一节开始，上面这个函数将会被多次使用。每次我们执行涉及到联系人数据的操作时，我们都会使用这个函数，我们要确定联系人数据是否准许访问，当然还要处理每个可能的情况，以避免产生差的用户体验。我们暂时没有发现问题，因为我们准备了一些可重用的代码，能够让我们接下来的工作更为便利。

## 使用断言（Predicates）来检索联系人

正如我在概览一节阐述过的，我们打算实现三种不同的方式来检索联系人数据。其中之一是通过在文本框中填写我们想要检索的联系人全名或部分名字（无论是姓还是名），然后向联系人框架请求结果。这就是我们即将开始的操作，实现此功能的核心函数是 [`unifiedContactsMatchingPredicate:keysToFetch:error:`](https://developer.apple.com/library/prerelease/ios/documentation/Contacts/Reference/CNContactStore_Class/index.html#//apple_ref/occ/instm/CNContactStore/unifiedContactsMatchingPredicate:keysToFetch:error:)。

这个函数作为 `CNContactStore` 类的一部分，接受两个重要的参数：

1. Predicate：为了得到返回结果而用以检索的 `NSPredicate` 对象。需要特别注意的是，这里只接受从 `CNContact` 类中得到的断言，而不接受您自己创建的通用断言（[看这里](https://developer.apple.com/library/prerelease/ios/documentation/Contacts/Reference/CNContact_Class/index.html#//apple_ref/doc/uid/TP40015273-CH1-DontLinkElementID_56)）。在 `CNContact` 类中所有支持的断言函数中，有一个名为 `predicateForContactsMatchingName:` 的函数，我们将会使用它来生成断言。
2. keysToFetch：通过设定此参数，您可以指定您想要检索的*部分联系人数据*。这是一个描述需要检索的联系人（`CNContact` 对象）属性的字符串数组。框架提供了[预定义的常量字符串值](https://developer.apple.com/library/prerelease/ios/documentation/Contacts/Reference/CNContact_Class/index.html#//apple_ref/doc/constant_group/Metadata_Keys)，可以用作关键词来使用。

值得注意的是，这个方法可能会抛出*异常*，因此它必须要在 `do-catch` 声明中使用 `try` 关键字来进行修饰。然后在语句的 `catch` 模块中对错误情况进行处理。

`unifiedContactsMatchingPredicate:keysToFetch:error:` 函数的结果包含了匹配给定断言的 `CNContact` 对象的一个数组，或者当错误发生的时候返回 nil。

将上面的内容牢记在心，现在就可以开始实现代码了。现在打开 `AddContactViewController.swift` 文件，然后直接来到打开的类上方。在这里也要导入联系人框架，如果没有它，我们就没法做事了：

    
    import Contacts

我们现在前往 `textFieldShouldReturn:` 委托方法中。一开始我们会用上之前在应用委托中创建的最后一个函数，并且检查应用是否有权限读取联系人，以便继续：

    
    func textFieldShouldReturn(textField: UITextField) -> Bool {
        AppDelegate.getAppDelegate().requestForAccess { (accessGranted) -> Void in
            if accessGranted {
     
            }
        }
     
        return true
    }

在准许访问的情况下，为了匹配联系人，我们要准备好将进行检索的断言和关键词。除此之外，我们还将声明两个变量：一个用于存储结果的数组（如果有结果的话），以及如果没有检索到匹配联系人或者检索请求失败的时候，用以存储自定义消息的字符串变量。

    
    func textFieldShouldReturn(textField: UITextField) -> Bool {
        AppDelegate.getAppDelegate().requestForAccess { (accessGranted) -> Void in
            if accessGranted {
                let predicate = CNContact.predicateForContactsMatchingName(self.txtLastName.text!)
                let keys = [CNContactGivenNameKey, CNContactFamilyNameKey, CNContactEmailAddressesKey, CNContactBirthdayKey]
                var contacts = [CNContact]()
                var message: String!
     
            }
        }
     
        return true
    }

仔细观察我们是如何声明断言和关键词组的，随后我们继续。在下一步中，我们使用 *try* 关键字来检索联系人数据，如果该操作成功的话，那么查询结果就会写入到我们此前初始化的 *contacts* 数组当中。如果没有找到联系人或者检索失败的话，我们就会设定一个即将用来展示的自定义消息；通过这几个操作我们对这个函数的实现操作就即将完成了：

    
    func textFieldShouldReturn(textField: UITextField) -> Bool {
        AppDelegate.getAppDelegate().requestForAccess { (accessGranted) -> Void in
            if accessGranted {
                let predicate = CNContact.predicateForContactsMatchingName(self.txtLastName.text!)
                let keys = [CNContactGivenNameKey, CNContactFamilyNameKey, CNContactEmailAddressesKey, CNContactBirthdayKey, CNContactImageDataKey]
                var contacts = [CNContact]()
                var message: String!
     
                let contactsStore = AppDelegate.getAppDelegate().contactStore
                do {
                    contacts = try contactsStore.unifiedContactsMatchingPredicate(predicate, keysToFetch: keys)
     
                    if contacts.count == 0 {
                        message = "No contacts were found matching the given name."
                    }
                }
                catch {
                    message = "Unable to fetch contacts."
                }
     
     
                if message != nil {
                    dispatch_async(dispatch_get_main_queue(), { () -> Void in
                        AppDelegate.getAppDelegate().showMessage(message)
                    })
                }
                else {
     
                }
            }
        }
     
        return true
    }

如你所见，我们现在遗留了一个 `else` 语句暂未处理，我们之后会回来补全这个遗漏的代码的。这里最重要的是观察我们是如何根据给定名字匹配联系人数据的，并且是如何处理非预期状况的。

## 展示检索到的联系人

最好的情况就是，我们的检索请求成功地返回了匹配到的联系人信息，接着将他们显示在 `ViewController` 类的表视图（tableview）中，这就很有必要了。然而，我们的第一步还是要让 `ViewController` 类也得到检索到的联系人信息，因为我们的所有检索操作都是在 `AddContactViewController` 中发生的。最好也是最简单的方法就是，使用众所周知的协议委托模式（Delegation pattern）。那么，让我们朝着这个方向进行吧，继续给我们的示例应用添砖加瓦。

在 *AddContactViewController.swift* 文件的类上方，创建如下所示的协议，这个协议只有一个委托方法：

    
    protocol AddContactViewControllerDelegate {
        func didFetchContacts(contacts: [CNContact])
    }

通过使用上面这个委托方法，我们不仅可以让 *ViewController* 类知晓检索到的联系人信息，还可以把它传递给新检索到的联系人。

接着，在 `AddContactViewController` 类中添加下面这个委托声明：

    
    var delegate: AddContactViewControllerDelegate!

还记得吗，我们在上一节中的 `textFieldShouldReturn:` 方法中遗留了一个 `else` 没有实现，现在是时候添加缺失的东西了。实际上，缺失的代码只有两行而已：第一行是调用上面声明的委托方法，第二行则是通过导航控制器栈来推出视图控制器。

    
    func textFieldShouldReturn(textField: UITextField) -> Bool {
        AppDelegate.getAppDelegate().requestForAccess { (accessGranted) -> Void in
            if accessGranted {
                ...
     
                if message != nil {
                    ...
                }
                else {
                    dispatch_async(dispatch_get_main_queue(), { () -> Void in
                        self.delegate.didFetchContacts(contacts)
                        self.navigationController?.popViewControllerAnimated(true)
                    })
                }
            }
        }
     
        return true
    }

如您所见，当我们处理 UI 的时候一直都使用主线程。这是一个非常重要的细节，您应当牢记于心，否则的话 UI 就很有可能不会及时进行更新，应用也有可能出现一些无法预料的奇怪行为。

这时候我们就可以前往 *ViewController.swift* 文件来处理检索到的结果了。一开始，我们也需要在这个类中导入 Contacts 框架：

    
    import Contacts

接下来，我们需要实现我们新的自定义协议，因此我们需要在类的头部添加这个协议名：

    
    class ViewController: UIViewController, UITableViewDelegate, UITableViewDataSource, AddContactViewControllerDelegate

现在，是时候来声明一个 `CNContact` 对象的数组了。这个数组将会存储所有从检索请求返回的联系人数据，它甚至还是表视图的数据源。因此，在 `ViewController` 类的顶端添加以下代码：

    
    var contacts = [CNContact]()

除此之外，我们还需要更新接下来将要进行展示的表视图的行数：

    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return contacts.count
    }

在我们实现我们先前声明的委托方法之前，我们需要让 *ViewController* 类成为 `AddContactViewControllerDelegate` 协议的委托。这会在 `prepareForSegue:` 函数中实现：

    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        if let identifier = segue.identifier {
            if identifier == "idSegueAddContact" {
                let addContactViewController = segue.destinationViewController as! AddContactViewController
                addContactViewController.delegate = self
            }
        }
    }

最后，我们必须要实现我们自定义的委托方法。在委托方法中，我们将依次获取所有返回的联系人数据，然后将它们添加到 `contacts` 数组中即可。当然，我们会重新加载表视图，以便让其显示新的联系人。

    
    func didFetchContacts(contacts: [CNContact]) {
        for contact in contacts {
            self.contacts.append(contact)
        }
     
        tblContacts.reloadData()
    }

现在让我们来显示这些联系人信息吧！对于每个单元格（cell）来说，我们都要显示联系人的姓和名，如果存在的话则还要显示联系人的生日、头像以及家庭 email。具体的实现你会在下面的代码中看到，我们将会修改很多东西，不过这足够让你理解联系人属性是如何被访问的了：

    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("idCellContactBirthday") as! ContactBirthdayCell
     
        let currentContact = contacts[indexPath.row]
     
        cell.lblFullname.text = "\(currentContact.givenName) \(currentContact.familyName)"
     
     
        // 设置生日信息
        if let birthday = currentContact.birthday {
            cell.lblBirthday.text = "\(birthday.year)-\(birthday.month)-\(birthday.day)"
        }
        else {
            cell.lblBirthday.text = "Not available birthday data"
        }
     
     
        // 设置联系人头像
        if let imageData = currentContact.imageData {
            cell.imgContactImage.image = UIImage(data: imageData)
        }
     
     
        // 设置联系人的家庭 email 地址
        var homeEmailAddress: String!
        for emailAddress in currentContact.emailAddresses {
            if emailAddress.label == CNLabelHome {
                homeEmailAddress = emailAddress.value as! String
                break
            }
        }
     
        if homeEmailAddress != nil {
            cell.lblEmail.text = homeEmailAddress
        }
        else {
            cell.lblEmail.text = "Not available home email"
        }
     
     
        return cell
    }

让我们来通览一遍上面的实现。首先，我们将姓和名连接起来，将其赋给了 “lblFullname” 标签。接下来，我还会为你展示另一种实现方式，不过现在我们就这么做。接着，我们设置生日信息。如果生日数据存在的话，我们就通过最简单的方式将其展示出来。注意到这只是一个临时方法 (temporary approach)，之后我们会用正确的方式来处理这个出生日期。同样，你必须知道生日数据并不是一个 `NSDate` 对象，其实，它是一个 `NSDateComponents` 对象，它可以转换为 `NSDate` 后再转换为 `String`。

接下来我们要设置的是图片数据。如果不存在的话，你唯一能在这看到的就只是 `imgContactImage` 图片视图的背景颜色了，这个颜色是我在自定义的单元格 xib 文件中设定好的。

最后，我们要设置的就是家庭 email 地址了。你可以注意到的是，我们使用循环来遍历了所有的 email 地址，直到我们找到所需要的那个为止。这是因为联系人所拥有的 `emailAddresses` 属性包含了*被标记为值 (CNLabeledValue) 对象所拥有的全部 email 地址*。最后，如果家庭 email 地址找到的话，我们就将其分别赋值给对应的标签，否则的话我们就将其设置为上面你所看到的消息。

如果你现在运行这个应用的话，输入您想要选择的联系人名称，上面的实现或许可用，也可能不起作用。再次尝试的话应用会崩溃掉，但是你不必担心。我们之后会修复这个问题。我故意没有给你上面方法的完整实现，因为上面的方法更容易展示应用是如何工作的。

## 重新检索联系人

这个应用可能会崩溃的原因在于，当你请求联系人数据的时候，它可能并没有检索到所有的值。为此，`CNContact` 类包含了一个名为 `isKeyAvailable:` 的方法，必须要在访问任何联系人属性之前使用。比如说，在我们视图显示生日、头像以及 email 地址之前，我们应该添加如下检查：

    
    if currentContact.isKeyAvailable(CNContactBirthdayKey) {
        ...
    }
     
    if currentContact.isKeyAvailable(CNContactImageDataKey) {
        ...
    }
     
    if currentContact.isKeyAvailable(CNContactEmailAddressesKey) {
        ...
    }

如果没有对应的关键词的话，那么必须要采取合适的操作来*重新检索*联系人数据，然后尝试再次显示。这就是我们在这所要做的，明确来说我们要在 *ViewController* 类中创建一个新的函数。然而，在此之前，我们需要通过添加 `isKeyAvailable:`  方法来修复联系人详情的显示问题。实际上，我们创建一个条件来检查所有的不可用关键词即可，而不是为上面所提到的属性使用三个不同的条件语句，并且如果有关键词缺失的话，我们就调用下面将要实现的这个函数，以便让其重新检索联系人数据。我故意没有包含进联系人名字的关键词，因此我们可以在下一个部分看到更多内容。

    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("idCellContactBirthday") as! ContactBirthdayCell
     
        let currentContact = contacts[indexPath.row]
     
        cell.lblFullname.text = "\(currentContact.givenName) \(currentContact.familyName)"
     
        if !currentContact.isKeyAvailable(CNContactBirthdayKey) || !currentContact.isKeyAvailable(CNContactImageDataKey) ||  !currentContact.isKeyAvailable(CNContactEmailAddressesKey) {
            refetchContact(contact: currentContact, atIndexPath: indexPath)
        }
        else {
            // Set the birthday info.
            if let birthday = currentContact.birthday {
                cell.lblBirthday.text = "\(birthday.year)-\(birthday.month)-\(birthday.day)"
            }
            else {
                cell.lblBirthday.text = "Not available birthday data"
            }
     
            // Set the contact image.
            if let imageData = currentContact.imageData {
                cell.imgContactImage.image = UIImage(data: imageData)
            }
     
            // Set the contact's work email address.
            var homeEmailAddress: String!
            for emailAddress in currentContact.emailAddresses {
                if emailAddress.label == CNLabelHome {
                    homeEmailAddress = emailAddress.value as! String
                    break
                }
            }
     
            if homeEmailAddress != nil {
                cell.lblEmail.text = homeEmailAddress
            }
            else {
                cell.lblEmail.text = "Not available home email"
            }
        }
     
        return cell
    }

上面调用的 `refetchContact:atIndexPath: ` 函数是我们现在要实现的。此外，我觉得我们添加的那行条件语句非常明确，因此你能轻易理解其逻辑。注意到做完这个改动之后，应用就不再会发生崩溃了，即使返回的结果中出现了不可用的关键词。

现在，让我们看看这个新函数吧：

    
    func refetchContact(contact contact: CNContact, atIndexPath indexPath: NSIndexPath) {
        AppDelegate.getAppDelegate().requestForAccess { (accessGranted) -> Void in
            if accessGranted {
                let keys = [CNContactGivenNameKey, CNContactFamilyNameKey, CNContactEmailAddressesKey, CNContactBirthdayKey, CNContactImageDataKey]
     
                do {
                    let contactRefetched = try AppDelegate.getAppDelegate().contactStore.unifiedContactWithIdentifier(contact.identifier, keysToFetch: keys)
                    self.contacts[indexPath.row] = contactRefetched
     
                    dispatch_async(dispatch_get_main_queue(), { () -> Void in
                        self.tblContacts.reloadRowsAtIndexPaths([indexPath], withRowAnimation: UITableViewRowAnimation.Automatic)
                    })
                }
                catch {
                    print("Unable to refetch the contact: \(contact)", separator: "", terminator: "\n")
                }
            }
        }
    }

首先，我们会检查应用是否有权限访问联系人数据库。接着，我们会指定想要检索的特定结果关键词，接着我们尝试为给定的联系人重新进行数据检索。注意到这个时候我们使用了一个新的方法来执行检索操作，也就是 `unifiedContactWithIdentifier:keysToFetch:`。这个方法的功能是重新检索一个通过标识符参数值所指定的联系人数据。一旦结果得到返回，我们将会将位于 *contacts* 数组中的旧联系人对象替换为新的。最后，我们就重新加载表视图的特定行即可。

这时候你可以自己重新运行一遍应用。重新检索联系人数据是一项您最好经常执行的任务，以防止某些数据发生丢失，这样你就可以确保应用不会为用户带来出乎意料的“惊喜”。

## 输出格式化

目前为止，在单元格上显示每个联系人的生日信息之前，我们并没有对其进行正确的格式化操作。我们只是简单的连接并展示这些生日属性而已，但是现在我们已经完成了前面的事情，是时候来处理它了。

我们通过在 *ViewController* 类中创建新的自定义函数来解决这个问题。在其中，我们会使用 `NSDateFormatter` 对象将日期转换为一个本地化的字符串，但首先，我们需要将日期组件 (date components，日期的每个部分) 转换为 `NSDate` 对象。让我们来看看这个新函数：

    
    func getDateStringFromComponents(dateComponents: NSDateComponents) -> String! {
        if let date = NSCalendar.currentCalendar().dateFromComponents(dateComponents) {
            let dateFormatter = NSDateFormatter()
            dateFormatter.locale = NSLocale.currentLocale()
            dateFormatter.dateStyle = NSDateFormatterStyle.MediumStyle
            let dateString = dateFormatter.stringFromDate(date)
     
            return dateString
        }
     
        return nil
    }

上面这个方法的参数是一个被 `NSDateComponents` 对象（在我们的例子中是出生日期）所表示的日期。返回值自然是一个字符串。为了将 `dateComponents` 对象转换为 `NSDate` 对象，只需要添加一行代码即可。我们使用 `NSCalendar` 来进行转换，以及使用将会初始化的日期格式化器 (date formatter) 对日期对象进行处理。将这个日期格式化器的区域设置为当前设备的区域，这是一个非常有必要的操作，只有这样才能够取得本地化的日期描述信息。最后，我们要设置日期的样式（不要太长，也不要太短），再执行最后的转换即可。最终，转换过的值将返回给调用者。

现在，让我们来完善出生日期的显示吧。其实，只需要调用上面这个方法即可：

    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        ...
     
        if !currentContact.isKeyAvailable(CNContactBirthdayKey) || !currentContact.isKeyAvailable(CNContactImageDataKey) ||  !currentContact.isKeyAvailable(CNContactEmailAddressesKey) {
            refetchContact(contact: currentContact, atIndexPath: indexPath)
        }
        else {
            // 设置生日信息
            if let birthday = currentContact.birthday {
                cell.lblBirthday.text = getDateStringFromComponents(birthday)
            }
            ...
        }
     
        return cell
     
    }

非常好，现在出生日期的显示就更加高大上了。

现在让我们来看看一些关于姓名显示的有趣东西吧。`CNContact` 类提供了一个内置的格式化器，用以帮助我们轻松格式化两类数据：联系人的全名 ([CNContactFormatter](https://developer.apple.com/library/prerelease/ios/documentation/Contacts/Reference/CNContactFormatter_Class/index.html#//apple_ref/occ/cl/CNContactFormatter)) 以及地址 ([CNPostalAddressFormatter](https://developer.apple.com/library/prerelease/ios/documentation/Contacts/Reference/CNPostalAddressFormatter_Class/index.html#//apple_ref/occ/cl/CNPostalAddressFormatter))。这里我们将使用第一种，因此，联系人的全名会被 Contacts 框架自动格式化。

首先，我们先回到最后一次修改联系人的方法，如下所示：

    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("idCellContactBirthday") as! ContactBirthdayCell
     
        let currentContact = contacts[indexPath.row]
     
        cell.lblFullname.text = CNContactFormatter.stringFromContact(currentContact, style: .FullName)
     
        ...
     
        return cell
     
    }

如你所见，`cell.lblFullname.text = “(currentContact.givenName) (currentContact.familyName)”` 这行语句被下面这行替代了：

    
    cell.lblFullname.text = CNContactFormatter.stringFromContact(currentContact, style: .FullName)

显然，我们不再需要将联系人的姓与名连接起来而作为全名。`CNContactFormatter` 已经替我们完成了这项工作，同时它还提供了一个本地化字符串（取决于设备的本地化设置，通过合适的次序来设置名字部分）。

然而，上面这行代码还是会导致一些问题，因为联系人格式化器需要访问所有与联系人名字相关联的关键词，即使这些关键词我们并没有在检索的关键词数组中。不过，我们也没有必要一个一个地将它们全部写出来。所有相关的关键词都可以通过*关键词描述符 (key descriptor)* 所指定，这个描述符被用来替代关键词数组中的单一关键词。

为了说明得更具体一些，前往 *AddContactViewController* 文件的 `textFieldShouldReturn:` 方法。在那里，将这行代码：

    
    let keys = [CNContactGivenNameKey, CNContactFamilyNameKey, CNContactEmailAddressesKey, CNContactBirthdayKey, CNContactImageDataKey]

替换为下面这行使用关键词描述符的代码：

    
    let keys = [CNContactFormatter.descriptorForRequiredKeysForStyle(CNContactFormatterStyle.FullName), CNContactEmailAddressesKey, CNContactBirthdayKey, CNContactImageDataKey]

正如上面所示，描述符格式化的方式是非常明确的。除此之外，其他的关键词都保持不变。

上面的变化也必须在 `refetchContact:` 方法（在 `ViewController` 类中）进行。你所需要做的就是将 `keys` 数组定义替换为上面的那行代码，所以放手向前吧：

    
    func refetchContact(contact contact: CNContact, atIndexPath indexPath: NSIndexPath) {
        AppDelegate.getAppDelegate().requestForAccess { (accessGranted) -> Void in
            if accessGranted {
                let keys = [CNContactFormatter.descriptorForRequiredKeysForStyle(CNContactFormatterStyle.FullName), CNContactEmailAddressesKey, CNContactBirthdayKey, CNContactImageDataKey]
     
                ...
            }
        }
    }

至此，我们已经给代码做完了所有与格式化相关的修改了。当然，你仍然可以使用单个关键词来检索单个名字，不过这得取决于你的具体需求了。

## 使用自定义过滤器检索联系人

我在此教程中提到的首要事情之一就是，如何使用断言来检索联系人。我们使用 Contacts 框架中的断言来匹配给定名字的联系人，但是你是否记得，通常情况下这个方法有一个缺点。我们必须使用框架内置的断言，而我们无法对其进行自定义。那么问题来了，我们如何实现自定义的过滤器来检索联系人呢？

对我们的示例应用来说，问题可以变得更为具体一些，比如，如何才能基于联系人的生日来检索呢？在 `AddContactViewController` 类中有一个用于展示所有月份的选择器视图，因此现在我们所想做的是，选择一个月份，然后单击“完成”按钮，最后就可以获得所有出生月份和所选月份相同的记录了。

好吧，正如你所猜想的，的确是有一个办法可以“应用”自定义的过滤器，但是会使整个过程比使用断言还麻烦。通常情况下，我们所看到的方法是基于 `CNContectStore` 类中的 [enumerateContactsWithFetchRequest(_:usingBlock)](https://developer.apple.com/library/prerelease/ios/documentation/Contacts/Reference/CNContactStore_Class/index.html#//apple_ref/occ/instm/CNContactStore/enumerateContactsWithFetchRequest:error:usingBlock:) 方法，这也是苹果针对这种情况而建议使用的。这个方法将会检索所有的联系人，因此自定义的查询标准 (criteria) 能够在代码块 (闭包) 中设置，比如说比较属性值或者使用其他自定义的逻辑，并在最后获得你所需要的联系人信息。

在我们的例子中，我们将要检查两个东西：首先，我们必须要确保每个联系人的生日都已被设定，这样可以避免任何可能出现的崩溃。其次，我们只要比较生日月份和在选择器视图中所选月份即可，如果有匹配的，就将这个联系人放到数组当中。这个做法十分简单，因为生日是 `NSDateComponents` 对象，因此我们能够直接访问其月份。此外，剩下的操作也十分简单。我们将看到的所有操作已经在之前的部分展示过了，并且我也进行了介绍。接下来，我们会在 `AddContactViewController` 类的 `performDoneItemTap` 自定义方法中写下这些新代码，这样就可以在视图控制器中的“完成”按钮被按下的时候就基于所选月份来检索联系人了。

代码在此：

    
    func performDoneItemTap() {
        AppDelegate.getAppDelegate().requestForAccess { (accessGranted) -> Void in
            if accessGranted {
                var contacts = [CNContact]()
     
                let keys = [CNContactFormatter.descriptorForRequiredKeysForStyle(CNContactFormatterStyle.FullName), CNContactEmailAddressesKey, CNContactBirthdayKey, CNContactImageDataKey]
     
                do {
                    let contactStore = AppDelegate.getAppDelegate().contactStore
                    try contactStore.enumerateContactsWithFetchRequest(CNContactFetchRequest(keysToFetch: keys)) { (contact, pointer) -> Void in
     
                        if contact.birthday != nil && contact.birthday!.month == self.currentlySelectedMonthIndex {
                            contacts.append(contact)
                        }
                    }
     
                    dispatch_async(dispatch_get_main_queue(), { () -> Void in
                        self.delegate.didFetchContacts(contacts)
                        self.navigationController?.popViewControllerAnimated(true)
                    })
                }
                catch let error as NSError {
                    print(error.description, separator: "", terminator: "\n")
                }
            }
        }
    }

如你所见，检索完成后我们调用了委托，这样 `ViewController` 类中的表视图就会根据新的联系人数据进行更新了，接下来我们推出这个视图控制器。上面这些代码对你来说在很多方面都十分有用，因为你所需要做的，就是只改变一下位于上述代码块中的过滤器规则条件即可。

## 联系人选择器视图控制器（Contact Picker View Controller）

目前，我们所完成的所有联系人管理操作都完全是基于代码的，然而我们的故事还没有结束。Contacts 框架直接提供了视图控制器 (UI)，可以以可视化的方式来访问联系人，并立即与它们进行交互。所提供的视图控制器和“通讯录”应用中的控制器十分相像，因此你可以借此得到用于选择一个或多个联系人的选择器控制器，一个用于查看联系人详情的视图控制器，以及一个可以编辑信息的表单。在选择联系人的时候，重写默认的控制器行为也是允许的，此外还有委托方法可以让你处理结果。

在这一部分，我们将设置这个选择器视图控制器，并在应用的选择器视图控制器中选择和导入联系人。我们无需准备太多其他的东西，不过定制程度将取决于每个应用的需求。Contacts 框架允许设置三个可选的断言，从而让你自定义所显示的联系人信息：

1. `predicateForEnablingContact`：这可能是你最常用的断言了。通过它，你可以指定在选择器控制器中可用的联系人。比如说，你可以通过它来完成联系人的过滤，因此只有那些拥有可用生日的联系人才能够在选择器中显示出来。
2. `predicateForSelectionOfContact`：通过它，你可以决定选择器视图控制器在被选择的时候，应该在何种情况下返回所选的联系人；以及何时应该为显示详情视图控制器而添额外的选择。
3. `predicateForSelectionOfProperty`：通过它，你可以指定某个属性的默认行为是否可以被执行（比如说当点击电话号码时会执行电话呼叫操作），或者所按下的属性是否应该被返回。

这里我们所打算使用的只是第一个断言，打开选择器视图控制器，只允许显示有生日信息的联系人信息。另外两个断言的使用也不难，但是我们这里暂时用不着它们；如果需要参考的话，我建议您分别查看断言的[文档](https://developer.apple.com/library/prerelease/ios/documentation/ContactsUI/Reference/ContactsUI_Framework/index.html#//apple_ref/doc/uid/TP40016207)。

再次回到我们的应用中，打开 *AddContactViewController.swift* 文件。首先，到文件的顶端，导入 `ContactsUI` 框架。

    
    import ContactsUI

接着，实现 `CNContactPickerDelegate` 协议，因此我们可以处理返回的联系人：

    
    class AddContactViewController: UIViewController, UITextFieldDelegate, UIPickerViewDelegate, CNContactPickerDelegate

从现在开始，我们的工作都将在 `showContacts:` 这个 IBAction 方法中进行。这个方法会启用位于 `AddContactViewController` 底端的按钮。让我们来看看具体的实现：

    
    @IBAction func showContacts(sender: AnyObject) {
        let contactPickerViewController = CNContactPickerViewController()
     
        contactPickerViewController.predicateForEnablingContact = NSPredicate(format: "birthday != nil")
     
        contactPickerViewController.delegate = self
     
        presentViewController(contactPickerViewController, animated: true, completion: nil)
    }

是不是非常简单！在这个示例应用中我们不需要在单击联系人时显示详情页面。不过如果需要的话，很容易使用这些属性来展示详情。你所需要做的就是将一个包含所需关键词的数组赋值给一个名为 `displayedPropertyKeys` 属性。比如说，如果我们打算在应用中展示详情信息的话，我们就会在显示选择器视图控制器之前增加一行代码：

    
    contactPickerViewController.displayedPropertyKeys = [CNContactGivenNameKey, CNContactFamilyNameKey, CNContactEmailAddressesKey, CNContactBirthdayKey, CNContactImageDataKey]

几分钟前，我们实现了 `CNContactPickerDelegate` 协议，现在是时候来实现一个必须实现（required）的委托方法了。在方法中，我们会获取所选择联系人，然后通过我们自己的代理方法将其发回给 `ViewController` 类当中。

    
    func contactPicker(picker: CNContactPickerViewController, didSelectContact contact: CNContact) {
        delegate.didFetchContacts([contact])
        navigationController?.popViewControllerAnimated(true)
    }

假设你显示了联系人的详情信息，然后你想处理返回的属性，你需要使用 `contactPicker:didSelectContactProperty:` 委托方法。我们在这里不对其进行实现，因为我们不需要它。你可以在[这里](https://developer.apple.com/library/prerelease/ios/documentation/ContactsUI/Reference/CNContactPickerDelegate_Protocol/index.html#//apple_ref/occ/intfm/CNContactPickerDelegate/contactPicker:didSelectContactProperty:)找到所有委托方法的集合。

应用现在可以继续测试了。这时候按下 “Open contacts to select” 按钮来显示选择器视图控制器。你会注意到没有可用生日的联系人是不会显示出来的。选择其中一个联系人，然后你就会看到它出现在了 `ViewController` 的表视图当中。

<center>
![](http://www.appcoda.com/wp-content/uploads/2015/09/t43_3_picker_view_controller.png)
</center>


## 联系人视图控制器

到目前为止，我们已经实现了三种不同的方法以允许我们检索联系人并将其添加到应用中来。然而，只在表视图中显示联系人信息并不是一个很好的主意。我们想要更丰富的展现形式，那就是在一个新的视图控制器中显示所选联系人的详情信息。实际上，我们不需要创建一个自定义的控制器，我们会使用由 Contacts 框架所提供的联系人视图控制器。通过它我们不仅能查看联系人数据，还能够对其进行编辑。当然，通过 [CNContactViewController](https://developer.apple.com/library/prerelease/ios/documentation/ContactsUI/Reference/CNContactViewController_Class/index.html) 类我们可以轻易获得它。

让我们回到 *ViewController.swift* 文件中来，然后处理一下用户单击联系人时所发生的情况。然而，在我们显示 `CNContactViewController` 实例之前，我们需要确保所选联系人的详情信息中所有关键词都可用。即便我们在展示每个单元格的时候检查了所有可用的关键词，即便我们在需要的时候重新检索了联系人，但是当用户单击此行单元格的速度比重新检索操作的速度更快的时候，一切就都不好说了。因此，我们必须要处理点东西。

之前，我们使用 `CNContact` 类中的 `isKeyAvailable:` 方法来检查某个检索到的联系人中关键词的可用性。除了这个方法外，`CNContact` 还提供了另一种名为 `areKeysAvailable:` 的方法，我们可以用其来确保联系人视图控制器所需要的所有关键词都已存在。这个方法只接收一个参数，也就是一个包含关键词或者关键词描述符的数组 (和我们用来检索联系人时多次使用的关键词数组类似)。就 `CNContactViewController` 而言，虽然我们必须要设置 `CNContactViewController.descriptorForRequiredKeys()`的特定值作为参数数组的唯一元素。假设关键词都可用的话，我们将会显示联系人视图控制器。如果不可用的话，我们就用之前的方法，使用 `descriptorForRequiredKeys()` 来重新检索联系人，从而指定所需要检索的关键词。

此外，我们在整个示例应用中用来检索联系人数据的 `keys` 数组就会再次变得简单易用。不仅可以如我刚刚所述的那样检查可用性，还可以指定*在联系人视图控制器中应该显示何种属性*。你可以在下面的实现中看到它是如何使用的。注意，要记住如果你省略了这个属性，那么所有既有的联系人属性 (并不只是我们想显示的) 都将在联系人视图控制器中显示出来。

上面说了这么多，我们现在还是来看看这些代码吧：

    
    func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        let selectedContact = contacts[indexPath.row]
     
        let keys = [CNContactFormatter.descriptorForRequiredKeysForStyle(CNContactFormatterStyle.FullName), CNContactEmailAddressesKey, CNContactBirthdayKey, CNContactImageDataKey]
     
        if selectedContact.areKeysAvailable([CNContactViewController.descriptorForRequiredKeys()]) {
            let contactViewController = CNContactViewController(forContact: selectedContact)
            contactViewController.contactStore = AppDelegate.getAppDelegate().contactStore
            contactViewController.displayedPropertyKeys = keys
            navigationController?.pushViewController(contactViewController, animated: true)
        }
        else {
            AppDelegate.getAppDelegate().requestForAccess({ (accessGranted) -> Void in
                if accessGranted {
                    do {
                        let contactRefetched = try AppDelegate.getAppDelegate().contactStore.unifiedContactWithIdentifier(selectedContact.identifier, keysToFetch: [CNContactViewController.descriptorForRequiredKeys()])
     
                        dispatch_async(dispatch_get_main_queue(), { () -> Void in
                            let contactViewController = CNContactViewController(forContact: contactRefetched)
                            contactViewController.contactStore = AppDelegate.getAppDelegate().contactStore
                            contactViewController.displayedPropertyKeys = keys
                            self.navigationController?.pushViewController(contactViewController, animated: true)
                        })
                    }
                    catch {
                        print("Unable to refetch the selected contact.", separator: "", terminator: "\n")
                    }
                }
            })
        }
    }

在上面的代码片段中，你可以看到我们通过使用联系人视图控制器实例的 `displayedPropertyKeys` 属性，指定了我们想要展示的属性。另一个值得提及的细节就是，我们通过 `contactStore` 属性给联系人视图控制器提供了我们的*联系人存储*实例。如果应用中没有 `CNContactStore` 实例的话这个设置就不是必要的，因为 `CNContactsViewController` 会自行创建一个新的存储器。剩余的部分我们之前已经讨论过了。作为最后一步，不要忘记在文件头部导入下面这个框架：

    
    import ContactsUI

## 新建并保存一个新联系人

到目前为止，我们已经见识了许多关于 Contacts 框架中的新东西了。然而，仍然有一个我们没有讨论的部分，那就是如何通过代码创建一个新的联系人并将其保存到数据库中。因此，正如你所理解的，本教程的最后一个部分我们将要谈论这个话题。我不会详细说明如何更新一个既有记录，因为这个操作和我们在这里将要看到的十分相似，因此我将这个操作完全留给你，你可以自己找一下这两个操作之间的差异。

除了代表单个联系人及其所有属性的 `CNContact` 类之外，Contacts 框架还提供了一个名为 `CNMutableContact` 的类。如它的名字所言，这个类和 `CNContact` 十分相似，它允许我们为联系人的属性赋予新值，因此就可以通过它来创建一个新的联系人或者更新一个既有的联系人。实际的保存 (以及更新) 操作将在我们所周知的联系人存储类 (`CNContactStore`) 中处理，但是这是创建新联系人的最后一步。你可以在下面看到额外的具体信息。

通常情况下，使用 `CNMutableContact` 类来设置某个联系人的属性值包含了一系列与获取它们时完全相反的操作。进一步来说，对于简单的属性而言，直接分配一个单独的值即可 (比如说名)，特殊的属性需要特殊对待。例如：

* 当设置某个联系人的出生日期的时候，必须创建一个 `NSDateComponents` 对象并将其赋给对应的属性
* 当设置联系人头像的时候，必须要赋给一个 `NSData` 对象
* 当设置 email 地址的时候，必须给每个单独的 email 地址创建一个 `CNLabeledValue` 对象，然后所有的地址对象都应该放到一个数组中赋值给 `emailAddresses` 属性。

上面的仅仅只是一些例子。当然还有很多联系人属性需要谨慎对待，不过无论如何，接下来你会看到这些操作并不是很困难。

回到我们的示例应用中来，这时候我们要切换到 *CreateContactViewController.swift* 文件。在这个文件中，你会找到一个空的名为 `createContact()` 的自定义函数，这是我们所有工作将要进行的地方。简单而言，我们将创建一个 `CNMutableContact` 类的实例，然后设置我们感兴趣的所有属性值，最后我们将这个新纪录存储到数据库中。让我们来看一看实现：

    
    func createContact() {
        let newContact = CNMutableContact()
     
        newContact.givenName = txtFirstname.text!
        newContact.familyName = txtLastname.text!
     
        let homeEmail = CNLabeledValue(label: CNLabelHome, value: txtHomeEmail.text!)
        newContact.emailAddresses = [homeEmail]
     
        let birthdayComponents = NSCalendar.currentCalendar().components([NSCalendarUnit.Year, NSCalendarUnit.Month, NSCalendarUnit.Day], fromDate: datePicker.date)
        newContact.birthday = birthdayComponents
     
        do {
            let saveRequest = CNSaveRequest()
            saveRequest.addContact(newContact, toContainerWithIdentifier: nil)
            try AppDelegate.getAppDelegate().contactStore.executeSaveRequest(saveRequest)
     
            navigationController?.popViewControllerAnimated(true)
        }
        catch {
            AppDelegate.getAppDelegate().showMessage("Unable to save the new contact.")
        }
    }

我们从头来看这些操作，第一步是初始化一个 `CNMutableContact` 对象，这个对象将在后面一直使用。很明显设置姓、名属性是一个非常简单的操作。接下来的家庭 email 地址必须创建为一个 `CNLabeledValue` 对象，这也是上面代码所展示的。一旦新的 email 地址创建之后，就会作为 email 地址数组的一部分添加到 `emailAddresses` 属性当中。在我们的这个例子中，我们没有其他的地址。最后，我们基于用户所挑选的日期，为这个新联系人制定了出生日期。如上面的代码所示，使用 `NSCalendar` 类并从 `NSDate` 对象创建一个 `NSDateComponents` 对象是非常容易的。注意到日历对象 (年、月、日) 是如何合并的，借此它们产生了我们最终所想要的值。

这个代码片段中最有趣的部分就是保存新联系人的方式了。你可以注意到，首先是创建一个 `CNSaveRequest` 对象，接着向其中添加新的联系人对象。到这里并没有任何实际的存储操作被执行。这个操作而是发生在下一行代码中，也就是调用联系人存储实例中的 `executeSaveRequest:` 方法的时候。

假设新联系人无法保存的话，那么就会给用户弹出一个带有消息的警示框。

现在运行这个应用，使用 *ViewController* 左上角的按钮来创建一个新的联系人。保存你的记录，然后前去使用我们在之前部分实现的检索方法将其检索出来。

<center>
![](http://www.appcoda.com/wp-content/uploads/2015/09/t43_4_create_contact.png)
</center>


**重要提示：**我在写这篇教程的时候注意到一个问题，在我的测试中，也就是创建一个新的记录并将其保存到联系人数据库的时候，通过应用访问联系人详情信息（通过点击联系人所在的行单元格）并不可用。而且会在控制台出现以下信息：

*CNUI ERROR] error calling service – Couldn’t communicate with a helper application.*

在网上我并不能找到任何可用的帮助，我只好就此罢休，将其作为 BUG 报告给了苹果。要牢牢记住，在测试应用的时候，要避免创建一个新的联系人。

## 总结

在本教程的结尾，我希望我已经讲清楚新的 Contacts 框架的易用性了。如果你过去曾经使用过 AddressBook API，那么你会发现在使用 Contacts 联系人的时候一切都发生了巨大的变化。你可以尽情地把玩这个示例应用，对其进行修改，以及按照你的意愿对其进行扩展。这个应用仍有提升的空间，但是千万不要忘记了用户隐私协议，并且你必须要尊重用户关于是否准许应用访问联系人的选择。不要错过了官方文档，你会在那里发现更有意思的东西。我希望你能够享受本篇教程，并能发现其中有用的知识。下次我们再见，希望你拥有美好、积极的一天！

作为参考，你可以[在这里下载完整的 Xcode 项目](https://www.dropbox.com/s/3pxzqd5u712ntkc/ContactsFrameworkFinal.zip?dl=0)。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。