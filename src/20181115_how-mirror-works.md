title: "Mirror 的工作原理"
date: 2018-11-15
tags: [Swift]
categories: [Mike Ash, Swift]
permalink: how-mirror-works
keywords: swift, mirror

---
原文链接=https://swift.org/blog/how-mirror-works/
作者=Mike Ash
原文日期=2018-09-26
译者=Nemocdz
校对=numbbbbb,小铁匠Linus
定稿=Forelax

<!--此处开始正文-->

尽管 Swift 重心在强调静态类型上，但它同时支持丰富的元数据类型。元数据类型允许代码在运行时检查和操作任意值。这个功能通过 `Mirror` API 暴露给 Swift 开发者。大家可能会感到困惑，在 Swift 这种如此强调静态类型的语言里，`Mirror` 这样的特性是怎么工作的？让我们一起来通过这篇文章了解一下。

<!--more-->

## 事先声明

这里介绍的东西都是内部实现的细节。这些代码的版本是写下文章时的版本，代码可能会随着版本改变。元数据会随着 ABI 稳定的到来而变得稳定和可靠，但在到来那时也会容易发生变化。大家在写日常的 Swift 代码时，不要依赖这里讲的一切。如果你想做比 `Mirror` 所提供的方式更复杂的反射，这里会给你一些思路。但在 ABI 的稳定前，还需要保持相关变化的关注。如果你想使用 `Mirror` 本身，这篇文章会提供一些好的思路去做接入和适配。不过再次提醒，这些东西可能会随着版本而改变。

## 接口

`Mirror(reflecting:)` 初始化方法可以接受任意值，返回结果是一个提供该值子元素集合 `Children` 的相关信息的实例。一个 `Child` 由可选的标签和值构成。可以在编译期且不用知道任何类型信息情况下，在 `Child` 的值上用 `Mirror` 去遍历整个对象的层级视图。

`Mirror` 允许类型用遵循 `CustomReflectable` 协议的方式提供一个自定义的表示方式。这给那些想表示得比内建形式更友好的类型提供一种有效的方法。 比如 `Array` 类型遵守 `CustomReflectable` 协议并且暴露其中的元素为无标签的 `Children`。`Dictionary` 使用这种方法暴露其中的键值对为带标签的 `Children`。

对于其他类型，`Mirror` 用魔法去返回一个基于其中的实际子元素的 `Children` 集合。对于结构体和类，`Children` 为其中储存的属性值。对于元组，`Children` 为元组的子元素。枚举则是枚举的 case 和其关联的值（如果有的话）。

这些神奇的魔法是怎么工作的呢？让我们一起来了解一下。

## 代码结构

反射的 API 有一部分是用 Swift 实现的，另一部分是用 C++ 实现的。Swift 更适合用在实现更 Swift 的接口，并让很多任务变得更简单。Swift 的运行时的底层是使用 C++ 实现的，但是在 Swift 中不能直接访问 C++ 的类，所以有一个 C 的连接层。反射的 Swift 实现在 [ReflectionMirror.swift](https://github.com/apple/swift/blob/master/stdlib/public/core/ReflectionMirror.swift)，C++ 实现在 [ReflectionMirror.mm](https://github.com/apple/swift/blob/master/stdlib/public/runtime/ReflectionMirror.mm)。

这两者通过一小组暴露给 Swift 的 C++ 函数进行通信的。与其使用 Swift 生成的 C 桥接层，不如将这些函数在 Swift 中直接声明成指定的自定义符号，而这些名字的 C++ 函数则专门实现为可以被 Swift 直接调用的方式。这两部分的代码可以在不关心桥接机制会在幕后如何处理传递值的情况下交互，但仍需要准确的知道 Swift 应该如何传递参数和返回值。除非你在使用需要它的运行时代码，否则别轻易尝试这些。

举个例子，让我们看下在 `ReflectionMirror.swift` 中的 `_getChildCount` 函数：

```swift
@_silgen_name("swift_reflectionMirror_count")
internal func _getChildCount<T>(_: T, type: Any.Type) -> Int
```

`@_silgen_name` 修饰符会通知 Swift 编译器将这个函数映射成 `swift_reflectionMirror_count` 符号，而不是 Swift 通常对应到的 `_getChildCount` 方法名修饰。需要注意的是，最前面的下划线表示这个修饰符是被保留在标准库中的。在 C++ 这边，这个函数是这样的：

```c++
SWIFT_CC(swift) SWIFT_RUNTIME_STDLIB_INTERFACE
intptr_t swift_reflectionMirror_count(OpaqueValue *value,
                                      const Metadata *type,
                                      const Metadata *T) {
```

`SWIFT_CC(swift)` 会告诉编译器这个函数使用的是 Swift 的调用约定，而不是 C/C++ 的。`SWIFT_RUNTIME_STDLIB_INTERFACE` 标记这是个函数，在 Swift 侧的一部分接口中，而且它还有标记为 `extern "C"` 的作用从而避免 C++ 的方法名修饰，并确保它在 Swift 侧会有预期的符号。同时，C++ 的参数会去特意匹配在 Swift 中声明的函数调用。当 Swift 调用 `_getChildCount` 时，C++ 会用包含的 Swift 值指针的 `value`，包含类型参数的 `type`，包含类型相应的范型 `<T>` 的 `T` 的函数参数来调用此函数。

`Mirror` 的在 Swift 和 C++ 之间的全部接口由以下函数组成：

```swift
@_silgen_name("swift_reflectionMirror_normalizedType")
internal func _getNormalizedType<T>(_: T, type: Any.Type) -> Any.Type

@_silgen_name("swift_reflectionMirror_count")
internal func _getChildCount<T>(_: T, type: Any.Type) -> Int

internal typealias NameFreeFunc = @convention(c) (UnsafePointer<CChar>?) -> Void

@_silgen_name("swift_reflectionMirror_subscript")
internal func _getChild<T>(
  of: T,
  type: Any.Type,
  index: Int,
  outName: UnsafeMutablePointer<UnsafePointer<CChar>?>,
  outFreeFunc: UnsafeMutablePointer<NameFreeFunc?>
) -> Any

// Returns 'c' (class), 'e' (enum), 's' (struct), 't' (tuple), or '\0' (none)
@_silgen_name("swift_reflectionMirror_displayStyle")
internal func _getDisplayStyle<T>(_: T) -> CChar

@_silgen_name("swift_reflectionMirror_quickLookObject")
internal func _getQuickLookObject<T>(_: T) -> AnyObject?

@_silgen_name("_swift_stdlib_NSObject_isKindOfClass")
internal func _isImpl(_ object: AnyObject, kindOf: AnyObject) -> Bool
```

## 神奇的动态派发

没有一种单一、通用的方式去获取任意类型中我们想要的信息。元组、结构、类和枚举都需要不同的代码去完成这些繁多的任务，比如说查找子元素的数量。其中还有一些更深、微妙的不同之处，比如对 Swift 和 Objective-C 的类的不同处理。

所有的这些函数因为需要不同类型的检查而需要派发不同的实现代码。这听起来有点像动态方法派发，除了选择哪种实现去调用比检查对象类型所使用的方法更复杂之外。这些反射代码尝试去简化使用包含 C++ 版本信息的接口的抽象基类，还有一大堆包含各种各样情况的子类进行 C++ 的动态派发。一个单独的函数会将一个 Swift 类型映射成一个其中的 C++ 类的实例。在一个实例上调用一个方法然后派发合适的实现。

映射的函数叫做 `call`，声明是这样的：

```c++
template<typename F>
auto call(OpaqueValue *passedValue, const Metadata *T, const Metadata *passedType,
          const F &f) -> decltype(f(nullptr))
```

`passedValue` 是实际需要传入的Swift的值的指针。`T` 是该值得静态类型，对应 Swift 中的范型参数 `<T>`。`passedType` 是被显式传递进 Swift 侧并且会实际应用在反射过程中的类型（这个类型和在使用 `Mirror` 作为父类的实例在实际运行时的对象类型不一样）。最后，`f` 参数会传递这个函数查找到的会被调用的实现的对象引用。然后这个函数会返回当这个 `f` 参数调用时的返回值，可以让使用者更方便的获得返回值。

`call` 的实现并没有想象中那么令人激动。主要是一个大型的 `switch` 声明和一些额外的代码去处理特殊的情况。重要的是它会用一个 `ReflectionMirrorImpl` 的子类实例去结束调用 `f`，然后会调用这个实例上的方法去让真正的工作完成。

这是 `ReflectionMirrorImpl`，接口的所有东西都要传入：

```c++
struct ReflectionMirrorImpl {
  const Metadata *type;
  OpaqueValue *value;

  virtual char displayStyle() = 0;
  virtual intptr_t count() = 0;
  virtual AnyReturn subscript(intptr_t index, const char **outName,
                              void (**outFreeFunc)(const char *)) = 0;
  virtual const char *enumCaseName() { return nullptr; }

#if SWIFT_OBJC_INTEROP
  virtual id quickLookObject() { return nil; }
#endif

  virtual ~ReflectionMirrorImpl() {}
};
```

作用在 Swift 和 C++ 组件之间的接口函数就会用 `call` 去调用相应的方法。比如，`swift_reflectionMirror_count` 是这样的：

```c++
SWIFT_CC(swift) SWIFT_RUNTIME_STDLIB_INTERFACE
intptr_t swift_reflectionMirror_count(OpaqueValue *value,
                                      const Metadata *type,
                                      const Metadata *T) {
  return call(value, T, type, [](ReflectionMirrorImpl *impl) {
    return impl->count();
  });
}
```

## 元组的反射

先看看元组的反射，应该是最简单的一种了，但还是做了不少工作。它一开始会返回 `'t'` 的显示样式来表明这是一个元组：

```c++
struct TupleImpl : ReflectionMirrorImpl {
  char displayStyle() {
    return 't';
  }
```

虽然用硬编码的常量看起来不是很常见，不过这样做可以完全在同一个地方给 C++ 和 Swift 这个值的引用，并且他们不需要使用桥接层进行交互，这还算是一个合理的选择。

接下来是 `count` 方法。此时我们知道 `type` 实际上是一个 `TupleTypeMetadata` 类型的指针而不仅仅是一个 `Metadata` 类型的指针。`TupleTypeMetadata` 有一个记录元组的元素数量的 `NumElements` 字段，然后这个方法就完成了：

```c++
intptr_t count() {
    auto *Tuple = static_cast<const TupleTypeMetadata *>(type);
    return Tuple->NumElements;
  }
```

`subscript` 方法会做更多一点的工作。它也从一样的的 `static_cast` 函数开始：

```c++
AnyReturn subscript(intptr_t i, const char **outName,
                      void (**outFreeFunc)(const char *)) {
    auto *Tuple = static_cast<const TupleTypeMetadata *>(type);
```

接下来，会有一个边界检查避免调用者请求了这个元组不存在的索引：

```c++
if (i < 0 || (size_t)i > Tuple->NumElements)
      swift::crash("Swift mirror subscript bounds check failure");
```

下标有两个作用：可以检索元素和对应的名字。对于一个结构体或者类来说，这个名字就是所储存的属性名。而对于元组来说，这个名字要么是该元素的元组标签，要么在没有标签的情况下就是一个类似 `.0` 的数值指示器。

标签以一个用空格做间隔的列表存储，放在元数据的 `Labels` 字段中。这段代码查找列表中的第 i 个字符串：

```c++
    // 确定是否有一个标签
    bool hasLabel = false;
    if (const char *labels = Tuple->Labels) {
      const char *space = strchr(labels, ' ');
      for (intptr_t j = 0; j != i && space; ++j) {
        labels = space + 1;
        space = strchr(labels, ' ');
      }

      // If we have a label, create it.
      if (labels && space && labels != space) {
        *outName = strndup(labels, space - labels);
        hasLabel = true;
      }
    }
```

如果在没有标签的情况下，创建一个合适的数值指示器作为名字：

```c++
    if (!hasLabel) {
      // The name is the stringized element number '.0'.
      char *str;
      asprintf(&str, ".%" PRIdPTR, i);
      *outName = str;
    }
```

因为要将 Swift 和 C++ 交叉使用，所以不能享受一些方便的特性比如自动内存管理。Swift 有 ARC，C++ 有 RALL， 但是这两种技术没办法兼容。`outFreeFunc` 允许 C++ 的代码提供一个函数给调用者用来释放返回的名字。标签需要使用 `free` 进行释放，所以设置给 `*outFreeFunc` 相应的值如下：

```c++
*outFreeFunc = [](const char *str) { free(const_cast<char *>(str)); };
```

值得注意的是名字，但令人惊讶的是，这个值检索起来很简单。`Tuple` 元数据包含了一个可以用索引去获取元素的相关信息的返回的函数：

```c++
auto &elt = Tuple->getElement(i);
```

`elt` 包含了一个偏移值，可以应用在元组值上，去获得元素的值指针：

```c++
    auto *bytes = reinterpret_cast<const char *>(value);
    auto *eltData = reinterpret_cast<const OpaqueValue *>(bytes + elt.Offset);
```

`elt` 还包含了元素的类型。可以通过类型和值的指针，去构造一个包括这个值新的 `Any` 对象。这个类型有可以分配内存并初始化包含给定类型的值的储存字段的函数指针。用这些函数拷贝值为 `Any` 类型的对象，然后返回 `Any` 给调用者。代码是这样的：

```c++
    Any result;

    result.Type = elt.Type;
    auto *opaqueValueAddr = result.Type->allocateBoxForExistentialIn(&result.Buffer);
    result.Type->vw_initializeWithCopy(opaqueValueAddr,
                                       const_cast<OpaqueValue *>(eltData));

    return AnyReturn(result);
  }
};
```

这就是元组的做法。

## swift_getFieldAt

在结构、类和枚举中查找元素目前来说相当复杂。造成这么复杂的主要原因是，这些类型和包含这些类型相关信息的字段的字段描述符之间缺少直接的引用关系。有一个叫 `swift_getField` 的帮助函数可以查找给定类型相应的字段描述符。一但我们添加了那个直接的引用，这整个函数应该就没啥作用了，但在同一时刻，它提供了运行时代码怎么能做到用语言的元数据去查找类型信息的一个有趣思路。

这个函数原型是这样的：

```c++
void swift::_swift_getFieldAt(
    const Metadata *base, unsigned index,
    std::function<void(llvm::StringRef name, FieldType fieldInfo)>
        callback) {
```

它会用类型去检查，用字段的索引去查找，还有一个会被在信息找到时回调。

首先就是获取类型的类型上下文描述，包含着更进一步将会被使用的类型的信息：

```c++
  auto *baseDesc = base->getTypeContextDescriptor();
  if (!baseDesc)
    return;
```

这个工作会分为两个部分。第一步查找类型的字段描述符。字段描述符包括所有有关这个类型的字段信息。一旦字段描述符可用，这个函数可以从描述符中查找所需要的信息。

从描述符中查找信息被封装成一个叫 `getFieldAt` 的帮助方法， 可以让各种各样地方的其它代码查找到合适的字段描述符。让我们看下这个查询过程。它从获取一个用来将符号还原器开始，将符号修饰过的类名还原为实际的类型引用：

```c++
  auto dem = getDemanglerForRuntimeTypeResolution();
```

会用缓存来加快多次的查找：

```c++
  auto &cache = FieldCache.get();
```

如果缓存中已经有字段描述符，调用 `getFieldAt` 来获得：

```c++
  if (auto Value = cache.FieldCache.find(base)) {
    getFieldAt(*Value->getDescription());
    return;
  }
```

为了让查找的代码更简单，有一个可以检查 `FieldDescriptor` 是否是被查找的那一个的帮助方法。如果描述符匹配，那么描述符放入缓存中，调用 `getFieldAt` ，然后返回成功给调用者。匹配的过程是复杂的，不过本质上归纳起来就是去匹配符号修饰的名字：

```c++
  auto isRequestedDescriptor = [&](const FieldDescriptor &descriptor) {
    assert(descriptor.hasMangledTypeName());
    auto mangledName = descriptor.getMangledTypeName(0);

    if (!_contextDescriptorMatchesMangling(baseDesc,
                                           dem.demangleType(mangledName)))
      return false;

    cache.FieldCache.getOrInsert(base, &descriptor);
    getFieldAt(descriptor);
    return true;
  };
```

字段描述符可用在运行时注册或在编译时放进二进制。这两个循环查找在匹配中所有已知的的字段描述符：

```c++
  for (auto &section : cache.DynamicSections.snapshot()) {
    for (const auto *descriptor : section) {
      if (isRequestedDescriptor(*descriptor))
        return;
    }
  }

  for (const auto &section : cache.StaticSections.snapshot()) {
    for (auto &descriptor : section) {
      if (isRequestedDescriptor(descriptor))
        return;
    }
  }
```

当发现没有匹配时，记录一个警告信息并且在回调返回一个空元组（仅仅为了给一个回调）：

```c++
  auto typeName = swift_getTypeName(base, /*qualified*/ true);
  warning(0, "SWIFT RUNTIME BUG: unable to find field metadata for type '%*s'\n",
             (int)typeName.length, typeName.data);
  callback("unknown",
           FieldType()
             .withType(TypeInfo(&METADATA_SYM(EMPTY_TUPLE_MANGLING), {}))
             .withIndirect(false)
             .withWeak(false));
}
```

值得注意的是字段描述符的查找过程。`getFieldAt` 帮助方法将字段描述符转化为名字和回调中返回的字段类型。开始它会从字段描述符中请求字段的引用：

```c++
  auto getFieldAt = [&](const FieldDescriptor &descriptor) {
    auto &field = descriptor.getFields()[index];
```

名字可以直接获得在这个引用中访问到：

```c++
    auto name = field.getFieldName(0);
```

如果这个字段实际上是一个枚举，那么就可能没有类型。先做这种检查，并执行回调：

```c++
    if (!field.hasMangledTypeName()) {
      callback(name, FieldType().withIndirect(field.isIndirectCase()));
      return;
    }
```

字段的引用将字段类型储存为一个符号修饰的名字。因为回调预期的是元数据的指针，所以符号修饰的名字必须被转化为一个真实的类型。`_getTypeByMangledName` 函数处理了大部分工作，不过需要调用者解决这个类型用的所有范型参数。这个工作需要将这个类型的所有范型的上下文抽离出来：

```c++
    std::vector<const ContextDescriptor *> descriptorPath;
    {
      const auto *parent = reinterpret_cast<
                              const ContextDescriptor *>(baseDesc);
      while (parent) {
        if (parent->isGeneric())
          descriptorPath.push_back(parent);

        parent = parent->Parent.get();
      }
    }
```

现在获得了符号修饰的名字和类型，将它们传入一个 Lambda 表达式来解决范型参数：

```c++
    auto typeName = field.getMangledTypeName(0);

    auto typeInfo = _getTypeByMangledName(
        typeName,
        [&](unsigned depth, unsigned index) -> const Metadata * {
```

如果请求的深度比描述符的路径大小还大，那么就会失败：

```c++
          if (depth >= descriptorPath.size())
            return nullptr;
```

除此之外，还有从字段的类型中获取范型参数。这需要将索引和深度转化为单独的扁平化的索引，通过遍历描述符的路径，在每个阶段添加范型参数的数量直到达到深度为止：

```c++
          unsigned currentDepth = 0;
          unsigned flatIndex = index;
          const ContextDescriptor *currentContext = descriptorPath.back();

          for (const auto *context : llvm::reverse(descriptorPath)) {
            if (currentDepth >= depth)
              break;

            flatIndex += context->getNumGenericParams();
            currentContext = context;
            ++currentDepth;
          }
```

如果索引比范型参数可达到的深度大，那么失败：

```c++
          if (index >= currentContext->getNumGenericParams())
            return nullptr;
```

除此之外，从基本类型中获得合适的范型参数：

```c++
          return base->getGenericArgs()[flatIndex];
        });
```

像之前那样，如果不能找到类型，就用空元组：

```c++
    if (typeInfo == nullptr) {
      typeInfo = TypeInfo(&METADATA_SYM(EMPTY_TUPLE_MANGLING), {});
      warning(0, "SWIFT RUNTIME BUG: unable to demangle type of field '%*s'. "
                 "mangled type name is '%*s'\n",
                 (int)name.size(), name.data(),
                 (int)typeName.size(), typeName.data());
    }
```

然后执行回调，无论找到了什么：

```c++
    callback(name, FieldType()
                       .withType(typeInfo)
                       .withIndirect(field.isIndirectCase())
                       .withWeak(typeInfo.isWeak()));

  };
```

这就是 `swift_getFieldAt`。我们带着这个帮助方法看看其他反射的实现。

## 结构体的反射

结构体的实现也是类似的，但稍微有点复杂。这是因为有些结构体类型不完全支持反射，查找名字和偏移值要花费更多力气，而且结构体可能包含需要反射代码去提取的弱引用。

首先是一个帮助方法去检查结构体是否完全支持反射。结构体元数据里储存这样一个可被访问的标志位。跟上面元组的代码类似，可以知道 `type` 实际上是一个 `StructMetadata` 指针，所以我们可以自由的传入：

```c++
struct StructImpl : ReflectionMirrorImpl {
  bool isReflectable() {
    const auto *Struct = static_cast<const StructMetadata *>(type);
    const auto &Description = Struct->getDescription();
    return Description->getTypeContextDescriptorFlags().isReflectable();
  }
```

结构体的显示样式是 s :

```c++
  char displayStyle() {
    return 's';
  }
```

子元素的数量是元数据给出的字段的数量，也可能是 0（如果这个类型实际上不能支持反射的话）：

```c++
  intptr_t count() {
    if (!isReflectable()) {
      return 0;
    }

    auto *Struct = static_cast<const StructMetadata *>(type);
    return Struct->getDescription()->NumFields;
  }
```

像之前那样，`subscript` 方法是比较复杂的部分。它开始也是类似的，做边界检查和查找偏移值：

```c++
  AnyReturn subscript(intptr_t i, const char **outName,
                      void (**outFreeFunc)(const char *)) {
    auto *Struct = static_cast<const StructMetadata *>(type);

    if (i < 0 || (size_t)i > Struct->getDescription()->NumFields)
      swift::crash("Swift mirror subscript bounds check failure");

    // Load the offset from its respective vector.
    auto fieldOffset = Struct->getFieldOffsets()[i];
```

从结构体字段中获取类型信息会更复杂一点。这项工作通过 `_swift_getFieldAt` 帮助方法进行：

```c++
    Any result;

    _swift_getFieldAt(type, i, [&](llvm::StringRef name, FieldType fieldInfo) {
```

一但它有字段信息，一切就会进行得和元组对应部分的代码类似。填写名字和计算字段储存的指针：

```c++
      *outName = name.data();
      *outFreeFunc = nullptr;

      auto *bytes = reinterpret_cast<char*>(value);
      auto *fieldData = reinterpret_cast<OpaqueValue *>(bytes + fieldOffset);
```

这里有一个额外的步骤去拷贝字段的值到 `Any` 类型的返回值来处理弱引用。`loadSpecialReferenceStorage` 方法处理这种情况。如果值没有被载入的话那么那个值用普通的储存，并且以普通的方式拷贝到返回值：

```c++
      bool didLoad = loadSpecialReferenceStorage(fieldData, fieldInfo, &result);
      if (!didLoad) {
        result.Type = fieldInfo.getType();
        auto *opaqueValueAddr = result.Type->allocateBoxForExistentialIn(&result.Buffer);
        result.Type->vw_initializeWithCopy(opaqueValueAddr,
                                           const_cast<OpaqueValue *>(fieldData));
      }
    });

    return AnyReturn(result);
  }
};
```

这些就是结构体值得注意的了。

## 类的反射

类和结构体很类似，在 `ClassImpl` 里的代码几乎是相同的。在操作 Objective-C 上有两点值得注意的不同之处。一个是 `quickLookObject` 的实现，会调起 Objective-C 的  `debugQuickLookObject`  方法的：

```c++
#if SWIFT_OBJC_INTEROP
id quickLookObject() {
  id object = [*reinterpret_cast<const id *>(value) retain];
  if ([object respondsToSelector:@selector(debugQuickLookObject)]) {
    id quickLookObject = [object debugQuickLookObject];
    [quickLookObject retain];
    [object release];
    return quickLookObject;
  }

  return object;
}
#endif
```

另一个是如果该类的父类是 Objective-C 的类，字段的偏移值需要在 Objective-C 运行时获得：

```c++
  uintptr_t fieldOffset;
  if (usesNativeSwiftReferenceCounting(Clas)) {
    fieldOffset = Clas->getFieldOffsets()[i];
  } else {
#if SWIFT_OBJC_INTEROP
    Ivar *ivars = class_copyIvarList((Class)Clas, nullptr);
    fieldOffset = ivar_getOffset(ivars[i]);
    free(ivars);
#else
    swift::crash("Object appears to be Objective-C, but no runtime.");
#endif
  }
```

## 枚举的反射

枚举有一些不同之处。`Mirror` 会考虑一个枚举实例最多只包含一个元素，枚举 case 名字作为标签，它的关联值作为值。没有关联值的 case 没有包含的元素。 举个例子：

```swift
enum Foo {
  case bar
  case baz(Int)
  case quux(String, String)
}
```

当 `Foo` 类型的值使用 mirror 时，mirror 会显示 `Foo.bar` 没有子元素，`Foo.baz` 有一个 `Int` 类型的元素，`Foo.quux` 有一个 `(String, String)` 类型的元素。相同的子标签和类型的类和结构体的值有着相同字段，但同一个类型的不同的枚举 case 不是这样的。关联的值也可能是间接的，所以需要一些特殊处理。

`enum` 的反射需要四部分核心的信息：case 的名字，tag（表示该值储存的枚举 case 的数字），payload 的类型，是否是间接的 payload。`getInfo` 方法获取这些值：

```c++
const char *getInfo(unsigned *tagPtr = nullptr,
                    const Metadata **payloadTypePtr = nullptr,
                    bool *indirectPtr = nullptr) {
```

tag 从请求元数据直接检索而来：

```c++
  unsigned tag = type->vw_getEnumTag(value);
```

其它信息用 `_swift_getFieldAt` 检索而来。将 tag 作为字段索引来调用，就会提供合适的信息：

```c++
  const Metadata *payloadType = nullptr;
  bool indirect = false;

  const char *caseName = nullptr;
  _swift_getFieldAt(type, tag, [&](llvm::StringRef name, FieldType info) {
    caseName = name.data();
    payloadType = info.getType();
    indirect = info.isIndirect();
  });
```

所有的值会返回给调用者：

```c++
  if (tagPtr)
    *tagPtr = tag;
  if (payloadTypePtr)
    *payloadTypePtr = payloadType;
  if (indirectPtr)
    *indirectPtr = indirect;

  return caseName;
}
```

（你可能会好奇：为什么只有 case 的名字是直接返回的，而其它的三个信息用指针返回？为什么不返回 tag 或者 payload 的类型？答案是：我真的不知道，可能在那个时机看起来是个好主意）

`count` 方法可以用 `getInfo` 方法去检索 payload 的类型，并返回 0 或 1 表示 payload 类型是否为 null：

```c++
intptr_t count() {
  if (!isReflectable()) {
    return 0;
  }

  const Metadata *payloadType;
  getInfo(nullptr, &payloadType, nullptr);
  return (payloadType != nullptr) ? 1 : 0;
}
```

`subscript `方法开始会获取所有有关这个值的信息：

```c++
AnyReturn subscript(intptr_t i, const char **outName,
                    void (**outFreeFunc)(const char *)) {
  unsigned tag;
  const Metadata *payloadType;
  bool indirect;

  auto *caseName = getInfo(&tag, &payloadType, &indirect);
```

实际的复制值需要更多的工作。为了处理间接的值，整个过程在一个额外的 box 中进行：

```c++
  const Metadata *boxType = (indirect ? &METADATA_SYM(Bo).base : payloadType);
  BoxPair pair = swift_allocBox(boxType);
```

间接的情况下，真实值要在 box 中取出：

```c++
  if (indirect) {
    const HeapObject *owner = *reinterpret_cast<HeapObject * const *>(value);
    value = swift_projectBox(const_cast<HeapObject *>(owner));
  }
```

现在一切都准备好了。给 case 名字设置子标签：

```c++
  *outName = caseName;
  *outFreeFunc = nullptr;
```

似曾相识的方式被用在将 payload 返回为 `Any` 类型的对象：

```c++
  Any result;

  result.Type = payloadType;
  auto *opaqueValueAddr = result.Type->allocateBoxForExistentialIn(&result.Buffer);
  result.Type->vw_initializeWithCopy(opaqueValueAddr,
                                     const_cast<OpaqueValue *>(value));

  swift_release(pair.object);
  return AnyReturn(result);
}
```

## 其余种类

文件中还有三种其他的实现，每种几乎都没做什么事情。`ObjCClassImpl` 处理 Objective-C 的类。它甚至不去尝试返回任何子元素，因为 Objective-C 在 ivars 的内容上允许太多种补救方案了。Objective-C 的类允许保持野指针一直存在，并需要单独的逻辑让实现不要去碰那个值。因为这样的值尝试作为 `Mirror` 子元素返回，会违反 Swift 的安全性保证。因为没有办法可靠地去告知应该如何处理如果值出了问题，所以代码避开处理整个这种情况。

`MetatypeImpl` 处理元类型。如果将 `Mirror` 用在实际的类型，比如这样用 `Mirror(reflecting:String.self)`，这时就会用到它。第一反应是，它会在这时提供一些有用的信息。但实际上它仅仅返回空，甚至没有去尝试获取任何东西。同样的，`OpaqueImpl` 处理不透明的类型并返回空。

## Swift 侧接口

在 Swift 侧，`Mirror` 调用在 C++ 侧实现的接口函数，去检索需要的信息，然后以更友好的方式去展现。这些会在 `Mirror` 的初始化器中完成：

```swift
internal init(internalReflecting subject: Any,
            subjectType: Any.Type? = nil,
            customAncestor: Mirror? = nil)
{
```

`subjectType` 是将要被反射 `subject` 的值的类型。这通常是值的运行时类型，但如果调用者用 `superclassMirror` 去找到上面的类的层级，它可以是父类。如果调用者不传 入`subjectType`，代码会问 C++ 侧的代码要 `subject` 的类型：

```swift
  let subjectType = subjectType ?? _getNormalizedType(subject, type: type(of: subject))
```

然后它就会获取子元素的数量，创建一个稍后获取每个子元素个体的集合来构建构建 `children` 对象：

```swift
  let childCount = _getChildCount(subject, type: subjectType)
  let children = (0 ..< childCount).lazy.map({
    getChild(of: subject, type: subjectType, index: $0)
  })
  self.children = Children(children)
```

`getChild` 函数是 C++ 的 `_getChild` 函数的简单封装，将标签名字中包含的 C 字符串转换成 Swift 字符串。

`Mirror` 有一个 `superclassMirror` 属性，会返回检查过类的层级结构里上一层的类的属性的 `Mirror` 对象。在内部，它有一个 `_makeSuperclassMirror` 属性保存着一个按需求构建父类的 `Mirror` 的闭包。闭包一开始会获取 `subjectType` 的父类。非类的类型和没有父类的类没有父类的 Mirror，所以他们会获取到 `nil`:

```swift
  self._makeSuperclassMirror = {
    guard let subjectClass = subjectType as? AnyClass,
          let superclass = _getSuperclass(subjectClass) else {
      return nil
    }
```

调用者可以用一个可作为父类 Mirror 直接返回的 `Mirror` 实例来指定自定义的祖先的表现：

```swift
    if let customAncestor = customAncestor {
      if superclass == customAncestor.subjectType {
        return customAncestor
      }
      if customAncestor._defaultDescendantRepresentation == .suppressed {
        return customAncestor
      }
    }
```

除此之外，给相同值返回一个将 `superclass` 作为 `subjectType` 的新 `Mirror`：

```swift
    return Mirror(internalReflecting: subject,
                  subjectType: superclass,
                  customAncestor: customAncestor)
  }
```

最后，它获取并解析显示的样式，并设置 `Mirror` 的剩下的属性：

```swift
    let rawDisplayStyle = _getDisplayStyle(subject)
    switch UnicodeScalar(Int(rawDisplayStyle)) {
    case "c": self.displayStyle = .class
    case "e": self.displayStyle = .enum
    case "s": self.displayStyle = .struct
    case "t": self.displayStyle = .tuple
    case "\0": self.displayStyle = nil
    default: preconditionFailure("Unknown raw display style '\(rawDisplayStyle)'")
    }
  
    self.subjectType = subjectType
    self._defaultDescendantRepresentation = .generated
  }
```

## 结论

Swift 丰富的元数据类型大多数在幕后存在，为像协议一致性检查和泛型类型解决这样的事提供支持。其中某些通过 `Mirror` 类 型暴露给用户，从而允许在运行时检查任意值。对于静态类型的 Swift 生态来说，这种方式一开始看起来有点奇怪和神秘，但根据已经存在的信息来看，它其实是个简单直接的应用。这个实现的探索旅程应该会帮助大家了解神秘之处，并在使用 `Mirror` 时可以意识到背后正在进行着什么。