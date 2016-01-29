title: "Swift 中的结构体与 NSCoding"
date: 2015-8-27
tags: [Swift and Painless]
categories: [Swift 入门]
permalink: nscoding_and_swift_structs

---
原文链接=http://swiftandpainless.com/nscoding-and-swift-structs/
作者=Dominik Hauser
原文日期=2015/08/19
译者=小锅
校对=Yake
定稿=Yake

正如大家所知，Swift 中的结构体不遵守 `NSCoding` 协议。`NSCoding` 只适用于继承自 `NSObject` 的类。 可是结构体在 Swift 中的地位与使用频率都非常高，因此，我们需要一个能将结构体的实例归档和解档的方法。

<!--more-->

[Janie](https://twitter.com/redqueencoder) 写过在 Sonoplot 工作时，他们团队对此的[解决方法](http://redqueencoder.com/property-lists-and-user-defaults-in-swift/)。

简而言之，他们定义了一个拥有两个方法的协议：一个方法可以从结构体当中获得一个 `NSDictionary`，另一个方法可以使用 `NSDictionary` 来初始化一个结构体。接着，再使用 `NSKeyedArchiver` 对这个 `NSDictionary` 进行序列化。这个方案的优雅之处在于，只要遵守了这个协议的结构体都可以进行序列化。

我最近灵光一闪，想到了另一种解决方案。尽管我已经实现了这种方案，并且使用它开发过几个小项目，但是我还是不确定这是不是一个好的方案。这个方法的优雅程度无法与上面提到的方法相提并论。然而我还是将它写出来，让读者自己来进行判断。

假设我们有一个 person 结构体：

```swift
struct Person {
  let firstName: String
  let lastName: String
}
```

我们不能使这个结构体遵守 `NSCoding` 协议，但是我们可以在结构体当中增加一个类的定义，使这个类来遵守 `NSCoding` 协议：

```swift
extension Person {
  class HelperClass: NSObject, NSCoding {
    
    var person: Person?
    
    init(person: Person) {
      self.person = person
      super.init()
    }
    
    class func path() -> String {
      let documentsPath = NSSearchPathForDirectoriesInDomains(NSSearchPathDirectory.DocumentDirectory, NSSearchPathDomainMask.UserDomainMask, true).first
      let path = documentsPath?.stringByAppendingString("/Person")
      return path!
    }
    
    required init?(coder aDecoder: NSCoder) {
      guard let firstName = aDecoder.decodeObjectForKey("firstName") as? String else { person = nil; super.init(); return nil }
      guard let laseName = aDecoder.decodeObjectForKey("lastName") as? String else { person = nil; super.init(); return nil }
      
      person = Person(firstName: firstName, lastName: laseName)
      
      super.init()
    }
    
    func encodeWithCoder(aCoder: NSCoder) {
      aCoder.encodeObject(person!.firstName, forKey: "firstName")
      aCoder.encodeObject(person!.lastName, forKey: "lastName")
    }
  }
}
```

发生了什么呢？我们在 Person 结构体当中增加了一个类，并使它遵守了 `NSCoding` 协议，这也意味着这个类需要实现 `init?(coder aDecoder: NSCoder)` 和 `encodeWithCoder(aCoder: NSCoder)` 方法。这个类拥有一个类型为 `Person` 的属性，并且在 `encodeWithCoder(aCoder: NSCoder)` 方法中将这个结构体实例的值都进行了归档，同时在 `init?(coder aDecoder: NSCoder)` 中进行解档，并创建了一个新的 person 实例。

接下来要做的事就是向 Person 结构体的定义中增加归档和解档的方法：

```swift
struct Person {
  let firstName: String
  let lastName: String
  
  static func encode(person: Person) {
    let personClassObject = HelperClass(person: person)
    
    NSKeyedArchiver.archiveRootObject(personClassObject, toFile: HelperClass.path())
  }
  
  static func decode() -> Person? {
    let personClassObject = NSKeyedUnarchiver.unarchiveObjectWithFile(HelperClass.path()) as? HelperClass

    return personClassObject?.person
  }
}
```

在这段代码中，我们创建了一个`HelperClass`对象来帮助进行归档和解档。

这个结构体的使用方法应该是这样的：

```swift
let me = Person(firstName: "Dominik", lastName: "Hauser")
    
Person.encode(me)
    
let myClone = Person.decode()
    
firstNameLabel.text = myClone?.firstName
lastNameLabel.text = myClone?.lastName
```

你可以在 [github](https://github.com/dasdom/EncodeExperiments) 上找到完整的代码。

如果你觉得这篇文章不错，请[猛戳这里](http://swiftandpainless.com/feed)对我的博客进行订阅。
