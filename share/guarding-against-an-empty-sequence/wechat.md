防止序列为空"

> 作者：Erica Sadun，[原文链接](http://ericasadun.com/2016/05/11/guarding-against-an-empty-sequence/)，原文日期：2016-05-11
> 译者：pucca；校对：[wiilen](http://www.jianshu.com/users/b7978363eb99/latest_articles)；定稿：[CMB](https://github.com/chenmingbiao)
  









昨天在 Swift-Users 有人提问如何防止序列（sequence）为空。这个问题来源于如何在断言（predicate）中测试一个序列，由此引发的问题是如果序列为空，会返回 true 来满足断言。



我们先不考虑这种处理是否有问题（我认为这种处理是正确的，因为一个空序列里没有元素，对元素的断言也就不会失败），Jeremy Pereira 提出了一个相当巧妙的解决方案：

    
    func all(@noescape where predicate: Generator.Element throws -> Bool) rethrows -> Bool {
    	var count = 0
           for element in self {
    	    guard try predicate(element) else { return false }
    	    count += 1
           }
           return count > 0
    }

但从此讨论中延伸出的另一个大问题是“如何优雅地判断一个序列是否为空？”。我的方法是用缓冲区（buffer）并进行预处理。以下是我的第一次尝试，粗糙不堪，请不吝指教。

    
    public struct BufferedSequence<Base : SequenceType>:GeneratorType, SequenceType {
        
        internal var _base: Base
        internal var _generator: Base.Generator
        public var bufferedElement: Base.Generator.Element?
        
        public init(_ base: Base) {
            _base = base
            _generator = base.generate()
            bufferedElement = _generator.next()
        }
    
        public mutating func next() -> Base.Generator.Element? {
            defer {
                if bufferedElement != nil {
                    bufferedElement = _generator.next()
                }
            }
            return bufferedElement
        }
        
        public func isEmpty() -> Bool {
            return bufferedElement == nil
        }
    }

有趣的是，写这个小东西最难的不是如何进行预处理，而是将 Swift 3 的语法转换回 Swift 2.2，这样我就能在 playground 中进行混编了。

你的语法转换进行的怎样了？已经全部转换成 3 的语法了？还是坚守 2.2 写生产代码？

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。