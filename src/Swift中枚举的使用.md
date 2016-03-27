title: "Swift 中枚举的使用"  
date: 2015-09-11
tags: [Swift 入门]  
categories: [Raj Kandathi]  
permalink: understanding-enums-using-swift

---
原文链接=http://rajkandathi.com/understanding-enums-using-swift/
作者=Raj Kandathi
原文日期=2015-08-31
译者=小铁匠Linus
校对=Prayer
定稿=shanks


枚举是用来表示值的“类型”，其中这些值之间是类似的。假如现在有个应用叫`MyFamily`，你每次打开这个应用它都会展示你家庭中的成员以及成员之间的关系。现在，家庭中每个成员跟你就只有那么几种关系(值)。这种关系可以用枚举类型的`FamilyRelationshipType`来表示。

这个`FamilyRelationshipType`在本质上是一种全新的数据类型。

<!--more-->

```swift
enum FamilyRelationshipType {
    case GrandFather
    case GrandMother
    case Father
    case Mother
    case Brother
    case Sister
    case Son
    case Daughter
}
```

虽然可能还有其他的成员关系，我们暂时只关注上面列出的这些。像上面写的那样，我们构建了一个新的叫`FamilyRelationshipType`的类型之后，我们就能在应用里使用它了。每次添加一个家庭成员到应用中去时，我们需要指定该成员与其他成员的关系。这个过程的代码大致如下：

```swift
struct FamilyMember {
    var name: String
    var relationshipType: FamilyRelationshipType
   
    init(name: String, relationshipType: FamilyRelationshipType) {
        self.name = name
        self.relationshipType = relationshipType
    }
}

let sister = FamilyMember(name: "Jacky", relationshipType: FamilyRelationshipType.Sister)
let brother = FamilyMember(name: "Jack", relationshipType: FamilyRelationshipType.Brother)
```

我们需要将上述的成员数据通过网络传输到远程的数据库里保存起来。然而，服务器端或远程数据库并不知道`GrandFather`到底代表什么意思，它们不认识自定义的数据类型，只认识已知的数据类型，比如`Int`类型的 1、2、3 或者`String`类型的 "GrandFather" 和 "GrandMother" 等。因此，我们需要把上面的枚举类型用应用和服务器端(数据库)双方都能识别的数据类型表示出来。在`Swift`中是使用`rawValue`来表示枚举类型的具体值。默认情况下，`rawValue`会在枚举类型的定义中按自上向下的顺序从 0、1、2 这样每次递增 1。当然，我们也可以自己指定每个枚举类型的`rawValue`，代码如下：

```swift
enum FamilyRelationshipType: Int {
    case GrandFather = 400
    case GrandMother = 500
    case Father = 600
    case Mother = 700
    case Brother = 800
    case Sister = 900
    case Son = 1000
    case Daugther = 1100
}
```

枚举类型用的最多的地方是在`Switch`条件语句。举个例子，你要给每个家庭成员赠送礼物，并且有个`giftFor`函数会根据对方关系的不同来为你推荐不同的礼物。这个推荐礼物的函数如下：

```swift
static func giftFor(member: FamilyMember) -> String {
    switch (member.relationshipType) {
    case .GrandFather:
        return "Book"
    case .GrandMother:
        return "Sweater"
    case .Father:
        return "Shirt"
    case .Mother:
        return "Flowers"
    default:
        return "Choclates"
    }
}
```

Swift 中也可以把每个枚举与它的值联合起来。这些联合值(associated values)只可以在`Switch`语句里使用枚举时访问。它完全不同于之前的`rawValue`，它不能通过`.`来读取。这样讲可能有点抽象，回到`giftFor`函数，现在需要根据家庭成员的年龄大小来决定具体的礼物，使用联合值的枚举可以这样来定义：

```swift
enum FamilyRelationshipType {
    case GrandFather(age: Int)
    case GrandMother(age: Int)
    case Father(age: Int)
    case Mother(age: Int)
    case Husband(age: Int)
    case Wife(age: Int)
    case Brother(age: Int)
    case Sister(age: Int)
    case Son(age: Int)
    case Daugther(age: Int)
}
```

`giftFor`函数代码如下。其中，我们可以在`giftFor`函数中使用`let`或`var`修饰家庭成员的年龄，并决定推荐什么礼物。为了更容易理解，我把`FamilyMember`结构体也加进来了。

```swift
struct FamilyMember {
    var name: String
    var relationshipType: FamilyRelationshipType
   
    init(name: String, relationshipType: FamilyRelationshipType) {
        self.name = name
        self.relationshipType = relationshipType
    }
   
    static func giftFor(member: FamilyMember) -> String {
        switch (member.relationshipType) {
        case .Brother(let age):
            if age > 10 {
                return "video games"
            } else {
                return "toys"
            }
        case .GrandFather:
            return "Book"
        case .GrandMother:
            return "Sweater"
        case .Father:
            return "Shirt"
        case .Mother:
            return "Flowers"
        default:
            return "Choclates"
        }
    }
}
```

最后，说一下`Swift`中枚举最酷的地方，就是在枚举中可以有方法，也可以使用构造器。`giftFor`函数其实可以从`FamilyMember`结构内移到`FamilyRelationType`枚举中去，因为该方法是基于成员关系及其联合值的。对上面的代码进行重构(我同时把函数`giftFor`也改名为`gift`)后，最终的代码如下：

```swift
enum FamilyRelationshipType {
    case GrandFather(age: Int)
    case GrandMother(age: Int)
    case Father(age: Int)
    case Mother(age: Int)
    case Husband(age: Int)
    case Wife(age: Int)
    case Brother(age: Int)
    case Sister(age: Int)
    case Son(age: Int)
    case Daugther(age: Int)
   
    func gift() -> String {
        switch(self) {
        case .Brother(let age):
            if age > 10 {
                return "video games"
            } else {
                return "toys"
            }
        case .GrandFather:
            return "Book"
        case .GrandMother:
            return "Sweater"
        case .Father:
            return "Shirt"
        case .Mother:
            return "Flowers"
        default:
            return "Choclates"
        }
    }
}

struct FamilyMember {
    var name: String
    var relationshipType: FamilyRelationshipType
   
    init(name: String, relationshipType: FamilyRelationshipType) {
        self.name = name
        self.relationshipType = relationshipType
    }
}
```

在我的下一篇文章中，我将简单分析枚举的其他例子，并将重点放在如何将 Objective-C 中的枚举重构为 Swift 的枚举。
