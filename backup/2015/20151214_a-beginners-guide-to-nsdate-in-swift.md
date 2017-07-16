title: "Swift 的 NSDate 初学者指南"
date: 2015-12-14 09:00:00
tags: [Swift 进阶]
categories: [AppCoda]
permalink: a-beginners-guide-to-nsdate-in-swift

---
原文链接=http://www.appcoda.com/nsdate/
作者=gabriel theodoropoulos
原文日期=2015-10-18
译者=ray16897188
校对=numbbbbb
定稿=Cee

<!--此处开始正文-->

如果问我在做过的所有项目中做的最多的事情，那处理日期绝对是榜上有名（译注：本文中的「日期」是指代 NSDate 对象，同时包含「日（date）」 和「时（time）」这两个元素）。毋庸置疑，无论工作量是多是少，开发者迟早需要「玩」一下 NSDate 类，去按某种方式处理一下日期。从简单的将一个日期转换成一个字符串到对日期做计算，总会有一个不变的事实：开发者必须在 iOS 编程中学会这个知识点。这并不难掌握，而且可以为以后更重要任务节省时间。在新手看来，对日期的操作很麻烦；然而事实并非如此。你需要做的就是掌握它。

<!--more-->

在应用中对日期（*NSDate*）对象最常见的操作就是把它转换成一个字符串对象，这样就可以用正确的格式把它展示给用户。反向操作也很常见：把字符串转换成日期对象。然而日期的操作并不只有这些。下面是一个简单的列表，列出了除上述操作之外可以对日期进行的其他操作：

- 日期之间的比较。
- 计算未来或者过去的日期，很简单：用一个参考日期（比如当前日期）加上或者减去一段时间（天、月、年等等）。
- 计算不同日期之间的差值（比如算出两个特定日期之间的时间间隔有多久）。
- 将一个日期按其*组成元素（components）*做分解，并对每个部分做分别访问（天、月等等）。

上面列出的所有内容，包括日期和字符串之间的相互转换，都是这篇教程要讨论的主题。在接下来的各个小节中，你会发现只要你知道该用什么工具以及如何使用它们，你就能随心所欲的对日期进行操作。

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/nsdate-featured.jpg1500171572.63)

下面的链接清单里有很多重要的文章，供参考。如果需要深入了解某些特定知识点，别忘了点击访问一下：

- [NSDate](https://developer.apple.com/library/mac/documentation/Cocoa/Reference/Foundation/Classes/NSDate_Class/)
- [NSDateFormetter](https://developer.apple.com/library/prerelease/mac/documentation/Cocoa/Reference/Foundation/Classes/NSDateFormatter_Class/index.html)
- [NSDateComponents](https://developer.apple.com/library/mac/documentation/Cocoa/Reference/Foundation/Classes/NSDateComponents_Class/)
- [NSDateComponentFormatter](https://developer.apple.com/library/watchos/documentation/Foundation/Reference/NSDateComponentsFormatter_class/index.html)
- [NSCalendar](https://developer.apple.com/library/mac/documentation/Cocoa/Reference/Foundation/Classes/NSCalendar_Class/)

### 关于 Demo App

嗯，这个教程我们不使用 demo 应用（是的，你没看错）。取而代之，我们这次用一个 *Playground* 来展示你将要看到的所有例子。我是特意这么做的，因为我的目的是给你提供丰富的、能更好的展示出关于 *NSDate* 方方面面的代码。

你可以下载并在 Xcode 中打开[这个写好的 playground 文件](https://www.dropbox.com/s/s54ko81l5mvxg5s/PlayingWithDates.playground.zip?dl=0)，但我还是强烈建议你新建一个 Playground 文件，并测试下面章节中的每一个新代码段。这样会让你更容易的去理解每个示例是如何工作的，除此之外你还可以修改代码，实时观察你的修改会如何影响生成的结果。

我给你的 playground 文件名是 *PlayingWithDates*，里面包含了所有的代码。你自己的文件可以用相同的文件名，或者换一个，都无所谓。

### 基本概念

在我们开始查看日期相关的技术细节并思考能用它们做什么之前，先要确保每个人都已经掌握一些基本概念，这很重要。先从一个最简单的开始：*NSDate* 对象。从程序角度来说这种对象包含了对*日（date）*和*时（time）*两者的描述，所以它不仅仅可以帮我们处理「日」，还可以帮我们处理「时」。对于 *NSDate* 对象本身来说是没有*格式（formatting）*这个概念的；和其他类中的所有属性一样，可以把日和时看做是*属性（properties）*。只有在将一个日期对象转换成一个字符串时，格式这个概念才会派上用场，下面的内容里我们会看到很多关于这个的细节。通常来讲，记住你所需要的就是 *NSDate* 这个类，无论你只关心「日」、「时」或者两者。

接下来我们会遇到的另一个类是 *NSDateComponents*。可以把这个类看做 *NSDate* 的「姊妹」类，因为这个类给开发者提供了一些极为有用的特性和操作。这个类的第一个要点是它可以将「日」部分或者「时」部分作为一个单独的属性显示出来，所以我们可以直接访问「日」或者「时」，然后在其他的任务中使用（比如对「日」或「时」的计算）。例如，一个 *NSDateComponents* 实例中的天和月在下面的代码中表示为 *day* 和 *month* 属性：

```swift
let dateComponents = NSDateComponents()
let day = dateComponents.day
let month = dateComponents.month
```

就这么简单。当然访问日期元素并将该日期的值传递给一个 *NSDateComponents* 对象需要先做一些强制转换，这些我们之后再讨论。

除上所述之外，*NSDateComponents* 这个类在用于计算未来或者过去的日期时也非常有用。当你想得到一个在某个特定日期之后或之前的那个日期时，你要做的就是加上或者减去合适的那一部分，最终就能转换成一个新的日期。另外 *NSDateComponents* 也适合计算日期之间的差值。现在无需深入研究这两个内容，我们一会儿会看到细节。

对于 *NSCalendar* 类，虽然它不会派上大用场，而且我们仅需要用它来实现 *NSDate* 和 *NSDateComponents* 相互转换，但它在我们的日期游戏中也是重要的一员。关于它所支持的特性，本文不会再进行介绍。将日期从 *NSDate* 转换成 *NSDateComponents*（或者反过来）的任务属于 *NSCalendar* 类，按照惯例，做转换需要一个特定的 c alendar（日历）对象。实际上系统在做任何转换之前都需要知道要用一个怎样的 calendar 对象，从而才可能给出正确的结果（别忘了满世界有太多不同的 calendar 对象，转换出来的「天」、「月」等值会千差万别）。你可以读一些和 calendar 有关的文章（参考简介里的链接），而在这里为图简便，我们会用 *NSCalendar* 的类方法 *currentCalendar()* 来得到用户设置中指定的 calendar。

此外，在下一节中我们会使用一个特别好的工具，它就是 *NSDateFormatter* 类。它能够实现 *NSDate* 对象到字符串、以及字符串到 *NSDate* 对象的转换。它还可以使用预定义的*日期样式（date styles）*来给最终的日期字符串制定格式，或是通过给出期望格式的*描述*来实现高度格式样式定制。下面会有一些相关的例子，其中一些例子示范了双向转换。一个 *NSDateFormatter* 对象同样也支持本地化（localization）；我们所需要的就是给它提供一个有效的 *NSLocale* 对象，基于该给定的位置（locale）设置最终转换出的对象就会正确显示出来。 

还有个类似的 *NSDateComponentsFormatter* 类，它可以将「日」和「时」部分作为输入，输出人类可读的、有特定格式的日期字符串。对此这个类包含了很多方法（methods），在此教程的最后一部分我们会看见其中几个；我们只讨论在教程的例子中用到的那些知识点。

上面已经说了那么多，我们可以开始编程了，具体学习上面提到的每个类的用法。再说一次，建议你创建一个新的 playground 文件，然后把我介绍的每一条都试一下。没有什么学习方法比亲手做更有效果。

### NSDate 和 String 之间的转换

首先，我们使用 *NSDate* 获得当前日期，并将它赋给一个常量以便访问。和其他一些语言所要求的不同，获得当前的日期并不需要调用类似 *now()* 或者 *today()* 的特殊方法。你所要做的就是初始化一个 *NSDate* 对象：

```swift
let currentDate = NSDate()
```

在 Xcode 的 playground 里敲入上面的语句，你会看到：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058093.7960339)

注意我们会在下面的代码中多次使用到上面的这个值。现在初始化一个 *NSDateFormatter* 对象。它用来在 dates 和 strings 之间做转换。如下：

```swift
let dateFormatter = NSDateFormatter()
```

除非是有其他明确的设定，否则 *dateFormatter* 会默认采用设备中的位置（locale）设置。尽管系统并不要求你去手动设置当前的位置，但如果需要的话你可以这么做：

```swift
dateFormatter.locale = NSLocale.currentLocale()
```

设一个不同的位置很容易：你仅需要知道与位置（locale）相匹配的*位置标识符（locale identifier）*是什么，然后指定给 locale 属性即可：

```swift
dateFormatter.locale = NSLocale(localeIdentifier: "el_GR")
dateFormatter.locale = NSLocale(localeIdentifier: "fr_FR")
```

这两行代码展示了如何给 date formatter 去设置一个不同的位置（例子里分别是希腊和法国地区）。当然设置多个位置的值没有意义，因为能起作用的仅仅是最后一个。你是不是想知道 locale 是怎么影响日期和字符串之间的转换的呢？过会儿你就会得到答案。

### 用 Date formatter styles 为输出结果设置格式

把一个日期对象（*NSDate*）转换成一个字符串之前，你需要「告诉」date formatter 你要得到的字符串结果的格式是怎样的。这里有两种方法。第一种是使用预定义的 *date formatter styles*，第二种是使用某些特定的*分类符（specifier）*来手动指定最终输出结果的格式。

先用第一种方法，我们需要使用 *NSDateFormatterStyle enum*。这个枚举类型的每一个枚举值都代表一种不同的格式样式类型。第一个样式是 *FullStyle*，下面的图片是使用它的效果：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058094.232729)

下面是上面代码的文本，想复制的话随意：

```swift
dateFormatter.dateStyle = NSDateFormatterStyle.FullStyle
var convertedDate = dateFormatter.stringFromDate(currentDate)
```

除了日期样式（date style）之外，上面两行代码中的 *stringFromDate:* 方法也同等重要，这个方法实现了真正的转换。当谈及转换时，我们实际上说的是这个方法，其余的只不过是自定义结果格式过程中所需的一些步骤。如果你想要在你的项目里做日期的转换，那么这个方法对你来说肯定非常方便。

好，来看下一个样式，*Long Style*：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058094.629814)

文本形式的代码：

```swift
dateFormatter.dateStyle = NSDateFormatterStyle.LongStyle
convertedDate = dateFormatter.stringFromDate(currentDate)
```

可以看到这种类型的样式中不包含星期几（和 Full Style 相比而言）。下面是 *Medium Style*：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058094.9355278)

```swift
dateFormatter.dateStyle = NSDateFormatterStyle.MediumStyle
convertedDate = dateFormatter.stringFromDate(currentDate)
```

最后是 *Short Style*：

```swift
dateFormatter.dateStyle = NSDateFormatterStyle.ShortStyle
convertedDate = dateFormatter.stringFromDate(currentDate)
```

现在你已经知道可用的 date formatter styles 都是什么了，你可以根据项目需求去使用它们。每种样式的设置都会产生出一个不同的结果，可能其中有一种会适合你。

之前我说过 date formatter 的 locale 可以被设置成非默认值。现在我们已经看到如何使用 date formatter styles 做转换，我们再来看看不同的 locale 值如何改变初始日期的字符串转换结果。下面的例子中我会使用 Full Style，以及前面提到的两个 locale identifier（希腊和法国）。

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058095.0969288)

我想现在 locale 能做什么你已经很清楚了，好好使用它吧。

### 使用 Date format specifier

上面的 date formatter style 足以应对多数情况，但是我们无法通过修改这些格式来获得不同于预设格式的结果。这种情况下我们还有另一个选择，一个能设置*自定义 date format* 的能力，这个自定义的 date format 能够正确描述你理想中的 date formatter 对象的的格式样式。一般来说设置一个自定义的 date format 对以下两种情况很适用：当 date formatter style 实现不了你所期望的输出结果的样式时（显然），还有当你需要把一个复杂的日期字符串（比如“Thu, 08 Oct 2015 09:22:33 GMT”）转换成一个日期对象时。

为了正确的设置一个 date format，一定要用一组*分类符（specifier）* 。Specifier 不过是一些简单的字符，这些字符对 date formatter 对象来说有着特定的意义。在我给你具体的例子之前，先列出来一些在接下来的代码中会使用到的format specifier：

- EEEE：表示星期几（如 Monday）。使用 1-3 个字母表示周几的缩略写法。
- MMMM：月份的全写（如 October）。使用 1-3 个字母表示月份的缩略写法。
- dd：表示一个月里面日期的数字（如 09 或 15）。
- yyyy：4 个数字表示的年（如 2015）。
- HH：2 个数字表示的小时（如 08 或 19）。
- mm：2 个数字表示的分钟（如 05 或者 54）。
- ss：2 个数字表示的秒。
- zzz：3 个字母表示的时区（如 GMT）。
- GGG：BC 或者 AD。

如果想查看 date format specifiers 的参考内容，建议访问[官方技术规范](http://unicode.org/reports/tr35/tr35-6.html#Date_Format_Patterns)，你可以找到上面给出的 specifier 的使用方法，以及那些没有列出的 specifier。

继续我们的例子，看一下 format specifier 具体怎么用。这回我们把当前日期转换成一个字符串，显示成具有星期名称、月的全写，日期数字和年份的格式：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058095.2924576)

```swift
dateFormatter.dateFormat = "EEEE, MMMM dd, yyyy"
convertedDate = dateFormatter.stringFromDate(currentDate)
```

我想怎么用自定义的 date format 已经不需要额外的讲解了，用法十分简单。再来一个例子，转换一下时间：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058095.4972548)

```swift
dateFormatter.dateFormat = "HH:mm:ss"
convertedDate = dateFormatter.stringFromDate(currentDate)
```

到现在为止我们看到的所有转换都是从 *NSDate* 对象变成一个有特定格式的字符串。相反的操作也很有意思，之前关于 date formatter styles 和 format specifiers 的也同样适用。把有既定格式的字符串转换成一个 *NSDate* 对象的关键是要对 date formatter 的 *dateFormat* 属性做出正确设置，然后调用 *dateFromString:* 方法。我们再看几个例子：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058095.7241263)

```swift
var dateAsString = "24-12-2015 23:59"
dateFormatter.dateFormat = "dd-MM-yyyy HH:mm"
var newDate = dateFormatter.dateFromString(dateAsString)
```

再看一个更复杂的字符串，还包含了时区：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058095.9686637)

```swift
dateAsString = "Thu, 08 Oct 2015 09:22:33 GMT"
dateFormatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss zzz"
newDate = dateFormatter.dateFromString(dateAsString)
```

注意一下时间（09:22）是如何通过简单的、在日期字符串中引入了一个时区而发生改变的（变成了 12:22）。这里没有任何实际上的变化，仅仅是我所在的时区（EFT）的时间在 GMT 时区中的表示，基于上面的代码，根据你自己的情况自由发挥吧。

到这里你已经基本上看到了为实现日期和字符串之间的转换你所需要的所有知识点。你可以敲敲自己的代码，试试你在上面所看到的那些，深入感受一下这些东西是如何工作的。

### 使用 NSDateComponents

很多时候你需要在项目里拆分一个日期对象，然后从中获得特定组成元素的值。例如你可能会从一个日期对象中获取它的日和月的值，或者从时间中获得小时和分钟的值。此种情况下你需要用到的工具就是 *NSDateComponents* 这个类。

*NSDateComponents* 类通常和 *NSCalendar* 类相结合来使用。具体点说，*NSCalendar* 方法实现了真正的从 *NSDate* 到 *NSDateComponents* 对象的转换；以及我们待会儿会看到的，从日期的组成元素到日期对象的转换。记好了这一点，这一节中我们首先要做的就是获取当前的 calendar，把它赋给一个常量以便访问：

```swift
let calendar = NSCalendar.currentCalendar()
```

现在我们看一个典型例子，一个 *NSDate* 对象是怎样被转换成一个 *NSDateComponents* 对象，之后我会做些讲解：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058096.3074582)

```swift
let dateComponents = calendar.components([NSCalendarUnit.Day, NSCalendarUnit.Month, NSCalendarUnit.Year, NSCalendarUnit.WeekOfYear, NSCalendarUnit.Hour, NSCalendarUnit.Minute, NSCalendarUnit.Second, NSCalendarUnit.Nanosecond], fromDate: currentDate)

print("day = \(dateComponents.day)", "month = \(dateComponents.month)", "year = \(dateComponents.year)", "week of year = \(dateComponents.weekOfYear)", "hour = \(dateComponents.hour)", "minute = \(dateComponents.minute)", "second = \(dateComponents.second)", "nanosecond = \(dateComponents.nanosecond)" , separator: ", ", terminator: "")
```

上面第一行代码用的方法是 *NSCalendar* 类的 *components(_:fromDate:)* 。该方法接受两个参数：第二个参数是原日期对象，我们要从中获得它的组成元素。但有意思是第一个参数，该方法要求第一个参数是一个元素为 *NSCalendarUnit* 属性的数组，这些属性对要从日期对象中抽取出的元素做出了描述。

*NSCalendarUnit* 是一个结构体，你可以从[这里](https://developer.apple.com/library/mac/documentation/Cocoa/Reference/Foundation/Classes/NSCalendar_Class/#//apple_ref/swift/struct/c:@E@NSCalendarUnit)看到所有可用的属性。上面的例子中，在你看到的代码段截图中给定的这些 calendar unit 值返回如下构成部分：

- Day
- Month
- Year
- Week of year
- Hour
- Minute
- Second
- Nanosecond

注意到在第一个参数数组中那些没有列出的 calendar unit（日历单元）在调用方法之后是不可用的。例如由于我们没有将 *NSCalendarUnit.TimeZone* 这个单元包括进去，所以在剩下获取到的元素中是访问不到时区（timezone）的（比如用 *print(dateComponents.timezone)*）。这么做的话会得到一个运行时错误。如果你需要额外的部分，你就必须再调用一次该方法，指定你想要的额外的calendar units。

从 date components 转换到日期对象也很容易。这回不会涉及到对 calendar unit 的使用。所需要的就是初始化一个新的*NSDateComponents*对象，然后明确指定出所有需要的components元素（当然是根据你app的需要），然后调用 *NSCalendar* 类的 *dateFromComponents* 方法实现转换。来看一下：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058096.656447)

```swift
let components = NSDateComponents()
components.day = 5
components.month = 01
components.year = 2016
components.hour = 19
components.minute = 30
newDate = calendar.dateFromComponents(components)
```

前面的部分我们看过一个在把某特定格式的字符串转换成一个日期对象时使用了 timezone 的例子。如果你足够好奇想看看对一个日期对象设置不同 timezone 的结果，我们就将上面的代码稍稍扩展一下，看看 timezone 的多种取值：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058715.7602158)

```swift
components.timeZone = NSTimeZone(abbreviation: "GMT")
newDate = calendar.dateFromComponents(components)
 
components.timeZone = NSTimeZone(abbreviation: "CST")
newDate = calendar.dateFromComponents(components)
 
components.timeZone = NSTimeZone(abbreviation: "CET")
newDate = calendar.dateFromComponents(components)
```

GMT = 格林威治标准时间
CST = 中国标准时间
CET = 欧洲中部时间

你可以在[这里](http://www.timeanddate.com/time/zones/)找到所有 timezone 的缩写，还有一些很棒的在线工具。

现在你也知道如何去处理 *NSDateComponents* 对象了，那么咱们继续来研究另一个有意思的东西。

### 比较日期和时间

处理日期的另外一个常见情况是需要对两个日期对象进行比较，判断哪一个代表着更早或者更晚，甚至比较这两个是否为同一日期。概括来说我在下面会告诉你三种不同的比较日期对象的方式，但我不希望让你有种哪个是最好或者最坏的观点。很明显这取决于你在你的应用中想要干什么，而每种方式和其他两种都有些不同，哪种方法对你帮助最有效就选哪种。

在比较日期对象的方法给出之前，我们先创建两个日期对象，在本节的例子中使用。首先设定日期格式（date formatter 的 *dateFormat* 属性），然后把两个日期格式的字符串转换成两个日期对象：

```swift
dateFormatter.dateFormat = "MMM dd, yyyy zzz"
dateAsString = "Oct 08, 2015 GMT"
var date1 = dateFormatter.dateFromString(dateAsString)!
 
dateAsString = "Oct 10, 2015 GMT"
var date2 = dateFormatter.dateFromString(dateAsString)!
```

先看看用来比较日期的第一个方式。如果你想要比较两个日期中比较早的那一个，那么 *NSDate* 类会给你提供较大帮助，它分别提供了两个方法，*earlierDate:* 和 *laterDate:*。这两个方法的语法很简单：

*date1.earlierDate(date2)*

原理如下：

- 如果 *date1* 对象比 *date2* 更早，那么上面的方法会返回 *date1* 的值。
- 如果 *date2* 对象比 *date1* 更早，那么上面的方法会返回 *date2* 的值。
- 如果两者相等，则返回 *date1*。

同样道理也使用于 *laterDate:* 方法。

现在来看我们的例子，使用我们之前创建的那两个日期对象。下面的两条指令分别使用了刚才提到的那两个方法，为我们显示出更早的和更晚的日期：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058154.212341)

```swift
// Comparing dates - Method #1
print("Earlier date is: \(date1.earlierDate(date2))")
print("Later date is: \(date1.laterDate(date2))")
```

第二种比较两个 *NSDate* 对象的方式使用的是 *NSDate* 类的 *compare:* 方法，以及 *NSComparisonResult* 枚举类型。看下面的例子就会明白我的意思，但是我先提一下这种方式的语法和我上面例子中的很像。比较日期所得的结果是和所有的可能值作比较，用这种方式可以很容易的判断出两个日期是否相等、哪一个更早或者更晚。不说了，下面的代码已经足够明了：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058154.3666584)

Playground 中的结果如下：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058154.5087793)

可复制的代码：

```swift
// Comparing dates - Method #2
if date1.compare(date2) == NSComparisonResult.OrderedDescending {
    print("Date1 is Later than Date2")
}
else if date1.compare(date2) == NSComparisonResult.OrderedAscending {
    print("Date1 is Earlier than Date2")
}
else if date1.compare(date2) == NSComparisonResult.OrderedSame {
    print("Same dates")
}
```

比较两个日期对象的第三种方式多少有些不同，因为这种方式引入了对 *time intervals* 的使用。实际上这种方式很简单，它做的就是获得自每个日期以来的时间间隔（每个日期和*现在*的时间间隔），然后做比较：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058154.791958)
```swift
// Comparing dates - Method #3
if date1.timeIntervalSinceReferenceDate > date2.timeIntervalSinceReferenceDate {
    print("Date1 is Later than Date2")
}
else if date1.timeIntervalSinceReferenceDate <  date2.timeIntervalSinceReferenceDate {
    print("Date1 is Earlier than Date2")
}
else {
    print("Same dates")
}
```

上面的代码也可以应用到对时间的比较。下面我给你最后一个例子，而这次 *date1* 和 *date2* 对象包含了对时间的表示。我再次使用 *earlierDate:* 方法，但另外还有一个，*idEqualToDate:*，很明显，看名字就知道它是干什么的：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058155.0071487)

```swift
// Comparing time.
dateFormatter.dateFormat = "HH:mm:ss zzz"
dateAsString = "14:28:16 GMT"
date1 = dateFormatter.dateFromString(dateAsString)!
 
dateAsString = "19:53:12 GMT"
date2 = dateFormatter.dateFromString(dateAsString)!
 
if date1.earlierDate(date2) == date1 {
    if date1.isEqualToDate(date2) {
        print("Same time")
    }
    else {
        print("\(date1) is earlier than \(date2)")
    }
}
else {
    print("\(date2) is earlier than \(date1)")
}
```

如果看到上面代码中「2000-01-01」这个日期之后你感觉好奇或疑惑的话，不用担心。*NSDate* 如果在没有给定任何特定日期来做转换的情况下会默认将其添加，它不会影响到这个日期中其他的元素（例子中其他的元素是时间）。

好了，到这里你也会怎么对日期做比较了。

### 计算出未来或过去的日期

处理日期另一个有趣的方面就是计算出一个将来或者过去的日期。我们之前看到的那些用法在这里会变得很方便，比如 *NSCalendarUnit* 结构体，或者 *NSDateComponents* 类。实际上，我会给你展示两种不同的计算出其他日期的方式，第一种使用的就是 *NSCalendar* 类和 *NSCalendarUnit* 结构体，第二种使用的是 *NSDateComponents* 类。最后我会给出第三种方式，但是一般情况我不推荐使用（到那部分我会解释为什么）。

一开始我们先记一下当前日期（是我写这篇教程的日期），它会被用作我们的参考日期：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058155.1251872)

现在假设我们想把当前日期加上两个月零五天，实际上还是写下来比较好：

```swift
let monthsToAdd = 2
let daysToAdd = 5
```

我们现在就可以看一下第一种方式了，来得到想要的新日期吧。先给代码，马上解释：

```swift
var calculatedDate = NSCalendar.currentCalendar().dateByAddingUnit(NSCalendarUnit.Month, value: monthsToAdd, toDate: currentDate, options: NSCalendarOptions.init(rawValue: 0))
calculatedDate = NSCalendar.currentCalendar().dateByAddingUnit(NSCalendarUnit.Day, value: daysToAdd, toDate: calculatedDate!, options: NSCalendarOptions.init(rawValue: 0))
```

如你所见，这里用到的方法是 *NSCalendar* 类的 *dateByAddingUnit:value:toDate:options:* 方法。这个方法的任务就是给一个现有的日期加上一个特定的 calendar unit（由第一个参数指定），并将这个加法的结果做为一个新的日期返回。我们开始想的是在当前日期的基础上同时加两个不同的 calendar unit，但很显然这不现实。所以这里问题的关键是就要连续的调用该方法，每次设置其中的一个 calendar unit，从而得到最终结果。

下面是每次叠加之后 playground 显示的结果：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058716.3939843)

上面的方式不错，但是仅限于你要加的只有 1~2 个 calendar units，否则你得连续多次调用上面那个方法才行。

当需要叠加更多的 units 时，第二个，也是更倾向的方式是使用 *NSDateComponents* 这个类。为了演示，我们不会再引入其他的组成元素，除上面已经定好的月和日之外。在这儿要做的事情很简单：首先初始化一个新的 *NSDateComponents* 对象，并给它设置之前定好的月和日。然后调用 *NSCalendar* 类的另一个叫做 *dateByAddingComponents:toDate:options:* 的方法，我们会立即得到一个新的 *NSDate* 对象，这个新对象即代表了最终想要的日期。

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058158.1788666)

```swift
let newDateComponents = NSDateComponents()
newDateComponents.month = monthsToAdd
newDateComponents.day = daysToAdd

calculatedDate = NSCalendar.currentCalendar().dateByAddingComponents(newDateComponents, toDate: currentDate, options: NSCalendarOptions.init(rawValue: 0))
```

注意到上面的两个代码段中，我都没给这两个新介绍方法的最后一个参数做任何设置。而如果你想对这个可设选项了解更多的话，就去参考[ *NSCalendar* 类的官方文档](https://developer.apple.com/library/mac/documentation/Cocoa/Reference/Foundation/Classes/NSCalendar_Class/)。

第三种计算另一个日期方式不推荐对时间跨度大的情况使用，因为由于闰秒，闰年，夏令时等等会导致这种方式产生出错误结果。该方式的想法是给当前日期加上一个特定的时间间隔。我们会使用 *NSDate* 类的 *dateByAddingTimeInterval:* 方法来实现这个目的。下面的例子中我们算出来一个相当于是 1.5 小时的时间间隔，然后把它加到当前日期上：

```swift
let hoursToAddInSeconds: NSTimeInterval = 90 * 60
calculatedDate = currentDate.dateByAddingTimeInterval(hoursToAddInSeconds)
```

再强调一下，要做任何类型的日期计算的话，还是使用前两种方式更安全。但这还是取决于你，选择你更喜欢的那一种。

上面的三个例子都是给当前日期加上某些个组成元素。那现在用同样方式给当前日期减去几天，算出来那个过去的日期该怎么做？

下面的代码示范了该怎么做。首先给当前日期加上一个特定天数的*负*值，这就可以得到一个属于过去的日期了。然后把结果转换成一个有适当格式的字符串，最后的结果...很有意思：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058716.4647555)

```swift
let numberOfDays = -5684718
calculatedDate = NSCalendar.currentCalendar().dateByAddingUnit(NSCalendarUnit.Day, value: numberOfDays, toDate: currentDate, options: NSCalendarOptions.init(rawValue: 0))
 
dateFormatter.dateFormat = "EEEE, MMM dd, yyyy GGG"
dateAsString = dateFormatter.stringFromDate(calculatedDate!)
```

以上所有的小代码段示例可以完全给你讲明白怎样通过给某个参考日期加上或正或负的 calendar unit 来算出一个新的日期。自己随便扩展一下上面的代码吧，写下你自己的代码，你就会对这些技巧更加熟悉。

### 计算出日期的差值

和标题的意思一样，这节讲的是计算出两个日期之间的差值，它是在你编程生涯中某个时间肯定要做的一个任务，显然需要做不止一次。在这（教程的最后）一部分，我会告诉你计算出两个 *NSDate* 对象之间差值的三种方式，你可以根据需要选出最适合你的那一种。

开始之前先定义两个 *NSDate* 对象：

```swift
dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
dateAsString = "2015-10-08 14:25:37"
date1 = dateFormatter.dateFromString(dateAsString)!
 
dateAsString = "2018-03-05 08:14:19"
date2 = dateFormatter.dateFromString(dateAsString)!
```

有了上面的日期对象，我们再来看一下如何获取日期组成元素（date components）形式的日期差值（date difference ）。我们会再次用到 *NSCalendar* 类，还有它的一个之前我们没见过的方法。最后把日期组成元素打印出来看一下结果。很明显当有了它，这个代表了日期差值的元素之后，想怎么做都取决于你了。来看下示范：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058716.5368817)

```swift
var diffDateComponents = NSCalendar.currentCalendar().components([NSCalendarUnit.Year, NSCalendarUnit.Month, NSCalendarUnit.Day, NSCalendarUnit.Hour, NSCalendarUnit.Minute, NSCalendarUnit.Second], fromDate: date1, toDate: date2, options: NSCalendarOptions.init(rawValue: 0))
 
print("The difference between dates is: \(diffDateComponents.year) years, \(diffDateComponents.month) months, \(diffDateComponents.day) days, \(diffDateComponents.hour) hours, \(diffDateComponents.minute) minutes, \(diffDateComponents.second) seconds")
```

这种新方式就是使用 *components:fromDate:toDate:options:* 方法，同样它的第一个参数是一个 *NSCalendarUnit* 的数组。注意下如果第一个日期比第二个晚的话，返回值就会是负数。

在计算日期差值的另外两种方式中，我们会第一次用到 *NSDateComponentsFormatter* 类，这个类有很多方法，能自动做出差值计算，然后返回一个带有特定格式的字符串。先生成一个对象，并先指定它的一个属性：

```swift
let dateComponentsFormatter = NSDateComponentsFormatter()
dateComponentsFormatter.unitsStyle = NSDateComponentsFormatterUnitsStyle.Full
```

*unitsStyle* 属性告诉 *dateComponentsFormatter* 描述日期差值的那个字符串的格式应该是什么样的，显示出的日期组成元素应该是怎样的样式。比如用 *Full* 这个样式，星期几、月份等等就会显示成常规的全写（full-length）单词。而如果我们用了 *Abbreviated* 样式的话，则会显示这些信息的缩写。从[这里](https://developer.apple.com/library/prerelease/ios/documentation/Foundation/Reference/NSDateComponentsFormatter_class/index.html#//apple_ref/c/tdef/NSDateComponentsFormatterUnitsStyle)你能看到关于单元样式（units style）的全说明列表。

回到日期差值中来，这次我们要先算出两个日期之间的时间间隔。然后这个间隔本身会作为一个参数传递给 *NSDateComponentFormatter* 类的 *stringFromTimeInterval:* 方法，结果就会以一个格式化好了的字符串形式返回。

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058159.4423432)

```swift
let interval = date2.timeIntervalSinceDate(date1)
dateComponentsFormatter.stringFromTimeInterval(interval)
```

最后，在计算日期差值的最后一个方式中，两个日期需要作为参数传递给 *NSDateComponentsFormatter* 类的 *stringFromDate:toDate:* 方法。然而用这个方法之前需要先满足一个条件：*allowedUnits* 属性必须要设置一个 calendar unit，否则该方法会返回一个 nil。所以我们就「告诉」这个方法我们想要怎样的 unit，之后就等它给我们差值结果：

![](/img/articles/a-beginners-guide-to-nsdate-in-swift/12401450058716.6109412)

```swift
dateComponentsFormatter.allowedUnits = [NSCalendarUnit.Year, NSCalendarUnit.Month, NSCalendarUnit.Day, NSCalendarUnit.Hour, NSCalendarUnit.Minute, NSCalendarUnit.Second]
let autoFormattedDifference = dateComponentsFormatter.stringFromDate(date1, toDate: date2)
```

### 总结

简介部分中我说过，处理 *NSDate* 对象这件事在你项目中非常常见，而且肯定无法避免。不可否认它并不是程序员最喜欢讨论的话题，所以我就写了前面的那些，在小例子中告诉你其实处理日期是很容易的。这篇教程中 *NSDate* 的方方面面，以及其他相关的类都有一个共同目标：教你小巧高效的用法，两三行代码就让你把活儿搞定。希望这篇文章能给你做个指南，尤其如果你是一个新开发者。下篇文章出来之前，好好练习吧。