Swift GYB 简易教程"

> 作者：Umberto Raimondi，[原文链接](https://www.uraimo.com/2016/02/09/a-short-swift-gyb-tutorial/)，原文日期：2016-2-9
> 译者：ahfepj；校对：[numbbbbb](http://numbbbbb.com/)；定稿：[小铁匠Linus](http://linusling.com)
  









GYB（模板生成）[是一个 Swift 内部使用的工具](https://github.com/apple/swift/blob/master/utils/gyb.py)，可以用模板生成源文件。

如果你有多个结构体/类/枚举在共享同一个通用的结构，并且你不想维护那些相同的代码，就可以用 GYB。如果你经常需要给不同的对象写一些相似的方法或者属性，那你的维护工作（由于粗心的复制/粘贴导致的错误）就可以全部交给 GYB。这个工具在 [Swift 代码库](https://github.com/apple/swift/search?utf8=%E2%9C%93&q=filename%3A*.gyb&type=Code) 中广泛使用，很容易就可以将它应用到你的项目中。

作为一个勤奋的荷兰猪（校对注：原文 guinea-pig，也可译为豚鼠）（据我所知，目前唯一使用 GYB 的项目是 [Swift-JNI](https://github.com/SwiftAndroid/swift-jni)，该项目是安卓的 Swift 移植项目的一部分）我在一个用于简化 Swift 位运算的库 [Bitter](https://github.com/uraimo/Bitter) 中广泛使用了 GYB，在这个库里我写了很多相似的代码来扩展固定长度的 Swift 整型变量。

有了这个工具，我就不需要手工输入所有代码。我只需定义一个模板，就可以用 GYB 工具创建十个扩展。

让我们来看看如何使用 GYB。



## GYB 引擎元素

使用 GYB 模板引擎相当简单，但是需要一点 Python 知识。模板是由这些元素组成：

- 用 Python 来控制语句流，每行代码由 **%** 开始（空格会被忽略），如你所想，每行代码也由 **%** 结束，语句可以嵌套。

- 不以 **%** 开头的语句被视为文本，会被直接输出。


- **${VARIABLE_NAME}** 形式的元素会被 **VARIABLE__NAME** 的值替换。

- 字符 **%** 和 **$** 分别用 **%%** 和 **$$** 表示。

- Python 代码块可以添加到模板中，用 **%{** 和 **}%** 括起来，代码块外的缩进会被剥离，使你的 Python 代码不会受到影响。

让我们用这几个简单的规则来做一个例子，拿 [Bitter 的模板](https://github.com/uraimo/Bitter/blob/master/Templates/Bitter.swift.gyb) 来说，用 `allOne` 为所有固定长度的整形变量添加一个计算属性，就会返回一个由带有 `allOne` 的位模式初始化后得到的整型变量/无符号整形变量:

    
    %{
      intTypes = [8,16,32,64]
    }%
    
    % for intType in intTypes:
        % for sign in ['','U']:
    
    /// Extension that adds a few additional functionalities to ${sign}Int${intType}
    extension 
    ${sign}Int${intType} {
    
            /// Returns a ${sign}Int${intType} with all ones
            %if sign == '':
        public static var allOnes:Int${intType}{return Int${intType}(bitPattern: UInt${intType}.max)}
            %else:
        public static var allOnes:UInt${intType}{return UInt${intType}.max}
            %end
    
    }
        %end
    %end

有了 Python 代码块，我们就可以在 Swift 中建立一个固定长度整型数组，然后遍历它并使用内部循环来处理有符号和无符号整数。然后，我们可以根据`符号`变量的值输出两个不同的代码片段。如果标识变量为空（有符号整数）就输出第一个代码段，如果不为空（无符号整数），就输出第二个代码段。

在这个例子中，我们用到了简单的 if/else 语句和 foreach 语句，我们也可以使用一切在 Python 中合法的语句，比如 elif 或者 for 的变体。

执行 GYB，会得到 8 个扩展，对应到每一个固定长度整型变量，范围从 Int8/Uint8 到 Int64/Uint64。

## 生成源代码

你可以从 Swift 仓库下载 GYB：

    
    wget https://github.com/apple/swift/raw/master/utils/gyb
    wget https://github.com/apple/swift/raw/master/utils/gyb.py
    chmod +x gyb

通过如下方式解析模板：

    bash
    ./gyb --line-directive '' -o ../Sources/Bitter/Bitter.swift Bitter.swift.gyb

    -o选项指定输出文件，最后一个文件名指定包含模板的文件的名称。

若     --line-directive ''参数为缺省，GYB 输出会增加调试信息，在原始模板中每一部分的输出描述元素会被执行。

当你在调试自己写的模板时，调试信息会很有用。一旦模板完成之后，可以禁用调试的注释，让输出清爽一些。


要评论？在 [Twitter](https://twitter.com/uraimo) 上戳我。
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。