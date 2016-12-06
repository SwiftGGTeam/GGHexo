title: "亮剑吧！枚举哈希值及选项集"
date: 2016-12-06
tags: [Swift 进阶]
categories: [Erica Sadun]
permalink: holy-war-enum-hash-values-and-option-sets
keywords: swift枚举
custom_title: 
description: 怎么将包含字符串值的 JSON 数组转换为枚举集呢，这是否取决于 hashValue 的实现细节呢，本文尝试通过哈希值来引导选项集的创建消除潜在的错误。

---
原文链接=http://ericasadun.com/2016/11/07/holy-war-enum-hash-values-and-option-sets/
作者=Russ Bishop
原文日期=2016-11-07
译者=星夜暮晨
校对=walkingway
定稿=CMB

<!--此处开始正文-->
 
最近几天，我在 Swift 用户列表中参与了一个讨论，主题是怎样才能更好滴将包含字符串值的 JSON 数组转换为枚举集 (Enumeration Set)。我半开玩笑地建议：这些字符串值应该被转换到基于字符串的枚举当中，然后这些值的 `hashValues` 将用于设置标志位（flags）。

当然，我很快（并且理所应当）被质疑道：『最终的解决方案是否应该取决于 `hashValue` 的实现细节』—— 很显然不应该。但是随着我思考的深入，我猜想是否可以通过哈希值来引导选项集 (Option Sets) 的创建，从而消除潜在的错误呢？

<!--more-->

我的意思是假设有这样一个枚举：

```swift
private enum LaundryFlags: String { 
  case lowWater, lowHeat, gentleCycle, tumbleDry
}
```

我们可以使用枚举值来生成选项集，因为我们知道每个 `hashValue` 都不会发生重叠，这使得编译器可以自行选择实现的细节，而不用人工干涉：

```swift
public static let lowWater = LaundryOptions(rawValue: 
	1 << LaundryFlags.lowWater.hashValue)
```

这个方法让我们可以从字符串中构建选项集，而无需关注具体的原始值 (Raw Value)。无论编译器如何计算，最终的结果都是一致的：

```swift
// 基于字符串的初始化操作
public init(strings: [String]) {
  let set: LaundryOptions = strings
  	.flatMap({ LaundryFlags(rawValue: $0) }) // 转换为枚举
  	.map({ 1 << $0.hashValue }) // 转换为 Int，即标志值
  	.flatMap({ LaundryOptions(rawValue: $0) }) // 转换为选项集
  	.reduce([]) { $0.union($1) } // 联结
  _rawValue = set.rawValue
}
```

不过这种做法也有限制。我们无法使用枚举来表示如下所示的复合便利成员 (Compound Convenience Members)：

```swift
public static let energyStar: LaundryOptions = [.lowWater, .lowHeat]
public static let gentleStar: LaundryOptions = energyStar.union(gentleCycle)
```

此外，我们可以很容易地实现 `CustomStringConvertible` 协议，即便原始值枚举无法显示它们的成员，并且也无法使用哈希值来进行初始化。如下面这段代码所示，生成一个延迟成员 (Lazy Member) 字典并不困难。我们可以将这个实现变为样板代码 (Boiler Plate)，然后将您的案例清单 (Case List) 复制/粘贴到这个数组当中：

```swift
static var memberDict: Dictionary<Int, String> = 
    [lowWater, lowHeat, gentleCycle, tumbleDry]
    .reduce([:]) {
        var dict = $0
        dict[$1.hashValue] = "\($1)" 
        return dict
	}
```

通过位运算，我们便可以从选项集当中规约 (Reduce) 出这个字典：

```swift
public var description: String {
    let members = LaundryFlags.memberDict.reduce([]) {
        return (rawValue & 1 << $1.key) != 0
            ? $0 + [$1.value] : $0
    }
    return members.joined(separator: ", ")
}
```

所以让我们亮剑吧：考虑到这个方法是多么地简单可靠，那我还能继续遵循『原始值枚举以及它们的哈希值**从不使用实现细节**』的约定么？

完整的 gist 代码可[在此查看](https://gist.github.com/erica/59e64778bf59877122b1c3ee79e118fa)。