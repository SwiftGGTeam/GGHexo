title: "将可选类型转换为错误抛出"
date: 2016-10-31
tags: [Swift]
categories: [Erica Sadun]
permalink: converting-optionals-to-thrown-errors
keywords: 
custom_title: 
description: 

---
原文链接=http://ericasadun.com/2016/10/07/converting-optionals-to-thrown-errors/
作者=Erica Sadun
原文日期=2016-10-07
译者=wiilen
校对=Cee
定稿=CMB

<!--此处开始正文-->

Soroush Khanlou 曾写道：「很多时候我希望可选类型并不存在，“结果” 就只是 “结果”」。

他给了个例子：

```swift
struct NilError: Error { }

func throwable<T>( _ block: @autoclosure() -> T?) throws -> T {
    guard let result: T = block() else {
        throw NilError()
    }
    return result
}

let image = try throwable(UIImage(data: imageData))
```

<!--more-->

我对它进行了一些改进：

```swift
// 灵感来自 Soroush Khanlou

public enum Throws {
    public struct NilError: Error, CustomStringConvertible {
        public var description: String { return _description }
        public init(file: String, line: Int) {
            _description = "Nil returned at "
                + (file as NSString).lastPathComponent + ":\(line)"
        }
        private let _description: String
    }
    
    public static func this<T>(
        file: String = #file, line: Int = #line,
        block: () -> T?) throws -> T
    {
        guard let result = block() 
            else { throw NilError(file: file, line: line) }
        return result
    }
}

do {
    let imageData = Data()
    let image = try Throws.this { NSImage(data: imageData) }
} catch { print(error) }
```

两者之间最明显的差别在于我的错误是「Nil return at playground13.swift：24」这种格式的，不过我也正在测试不同的风格，并以此来添加一些信息：

* 不使用 ``autoclosure``。为延迟计算（lazy evaluation）保留 autoclosure。苹果官方文档中有这样的描述：「当计算被延迟时，在上下文和函数的命名中应有明确说明。」
* 不使用全局独立函数。将全局函数放入类型中，使之称为静态成员。
* 嵌套的错误声明。错误属于特定的类型。
* 自定义描述。错误应能给你更多提示，而不是只显示一个名字。
* 在声明了多行的复杂构造器之后使用 Allman 风格。
* 后期的私有属性声明。我从标准库上开了条分支，正给这个想法造轮子。

各位有什么想法吗？

更新：Loic 给出了另一种实现，给了我一些启发：

```swift
public struct NilError: Error, CustomStringConvertible {
    public var description: String { return _description }
    public init(file: String, line: Int) {
        _description = "Nil returned at "
            + (file as NSString).lastPathComponent + ":\(line)"
    }
    private let _description: String
}

extension Optional {
    public func unwrap(file: String = #file, line: Int = #line) throws -> Wrapped {
        guard let unwrapped = self else { throw NilError(file: file, line: line) }
        return unwrapped
    }
}

do {
    let imageData = Data()
    let image = try NSImage(data: imageData).unwrap()
} catch { print(error) }
```