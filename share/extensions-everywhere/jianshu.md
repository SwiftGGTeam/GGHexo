每一点进步都是快乐：无处不在的扩展"

> 作者：Russ Bishop，[原文链接](http://www.russbishop.net/take-delight-in-small-joys)，原文日期：2018-11-08
> 译者：俊东；校对：[numbbbbb](http://numbbbbb.com/)，[WAMaker](https://github.com/WAMaker)；定稿：[Pancf](https://github.com/Pancf)
  









这篇文章记录了我所收获的小惊喜。在 Swift 中写扩展让人感觉非常自然。

我认为 `UnsafeMutableRawBufferPointer.baseAddress` 是可选项这回事非常不合理。在实践中它会使代码变得丑陋。我也不喜欢在分配时指定对齐方式；在大多数平台上，合理的默认值都是 `Int.bitWidth / 8`。

通过扩展，我们可以很容易地解决这些问题。这样的解决方案能像标准库一样自然地使用。


首先，我们需要在调试版本中进行简单的健全性检查，以确保不会产生无意义的对齐计算。这里提一个有关正整数的小技巧：一个 2 的 n 次幂数只有一个比特位是有值的。减去 1 时就是把后面的所有比特位设置为 1，如 8（`0b1000`）- 1 得到 7（`0b0111`）。这两个数字没有共同的位，因此按位取与应该产生零。由于这规律在零上无效，所以需要单独检查。

    
    extension BinaryInteger {
        var isPositivePowerOf2: Bool {
            @inline(__always)
            get {
                return (self & (self - 1)) == 0 && self != 0
            }
        }
    }

让 allocate 方法默认使用自然整数宽度对齐。设置对齐参数可能有点多余，不过它几乎能处理我们想要存储在缓冲区中的任何数据。虽然断言仅在调试环境中有效，但这已经够应付我们的使用；已知 Swift 支持的平台上这个断言都会是 true。

    
    extension UnsafeMutableRawBufferPointer {
        static func allocate(byteCount: Int) -> UnsafeMutableRawBufferPointer {
            let alignment = Int.bitWidth / 8
            assert(alignment.isPositivePowerOf2, "expected power of two")
            return self.allocate(byteCount: byteCount, alignment: alignment)
        }
    }

最后再提一个点，我们可以添加一个隐式强制解包的 `base` 属性。

    
    extension UnsafeMutableRawBufferPointer {
        var base: UnsafeMutableRawPointer {
            return baseAddress!
        }
    }
    extension UnsafeRawBufferPointer {
        var base: UnsafeRawPointer {
            return baseAddress!
        }
    }

一切如此简单。

> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。