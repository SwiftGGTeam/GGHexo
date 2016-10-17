title: "使用 Swift 3.0 操作 MySQL 数据库"
date: 2016-10-17
tags: [Swift 进阶]
categories: [iAchievedit]
permalink: working-with-mysql-databases-using-swift-3-0
keywords: Linux
custom_title: 
description: 

---
原文链接=http://dev.iachieved.it/iachievedit/working-with-mysql-databases-using-swift-3-0
作者=Joe
原文日期=2016-09-24
译者=shanks
校对=walkingway
定稿=CMB

<!--此处开始正文-->

如果你阅读过本主其他的 Swift 文章，你会发现我们是 Swift 服务器端开发的忠实拥护者。
今天我们将继续研究这个主题，使用 Vapor 封装的 [MySQL wrapper](https://github.com/vapor/mysql) 来操作 MySQL 数据库。

**说明**：这并不是一篇介绍 MySQL 或 SQL 的文章，如果你对数据库还不熟悉，网上有大量的教程可供学习。本篇我们将焦聚在 Linux 上使用 Swift 3.0 来操作 MySQL 数据库。

<!--more-->

## 开始

在这篇教程中，我们采用 Ubuntu 16.04 系统和 MySQL 5.7。MySQL 5.7 引入了一系列的新特性。其中一个就是提供了更加高效的存储 JSON 数据的能力，同时提供了查询 JSON 数据内部的能力。稍后如果 MySQL 5.7 成为了 Ubuntu 16.04 上默认的 MySQL 版本以后，我们将使用 Ubuntu 16.04 作为我们的操作系统。

如果你还没有安装 Swift， 你可以使用 apt-get 方式来安装。参见这篇[文章](http://dev.iachieved.it/iachievedit/swift-3-0-for-ubuntu-16-04-xenial-xerus/)的说明安装。2016 年 9 月底，苹果也开始在 Ubuntu16.04 上编译 Swift 的镜像。请查看 [Swift.org](https://swift.org/download/#releases) 获取更多的信息。

## 创建数据库

我们把数据库命名为 `swift_test`, 分配的用户是 `swift`， 密码是 `swiftpass`，如果你熟悉 MySQL，你应该知道需要执行 `GRANT ALL ON swift_test.*` 进行授权。
下面是这部分的命令：

```
# sudo mysql
...
mysql> create user swift;
Query OK, 0 rows affected (0.00 sec)

mysql> create database swift_test;
Query OK, 1 row affected (0.00 sec)

mysql> grant all on swift_test.* to 'swift'@'localhost' identified by 'swiftpass';
Query OK, 0 rows affected, 1 warning (0.00 sec)

mysql> flush privileges;
Query OK, 0 rows affected (0.00 sec)

mysql> quit
Bye
```

### 创建 Swift 包

现在开始正式进行编码，首先创建一个包：

```
# mkdir swift_mysql
# swift package init --type executable
```
编写 Package.swift 文件：

```swift
import PackageDescription

let package = Package(
    name: "swift_mysql",
    dependencies:[
      .Package(url:"https://github.com/vapor/mysql", majorVersion:1)
    ]
)
```
第二步，我们使用一些辅助的工具代码来生成一些随机的数据，填充到数据库中。
在 Sources 目录下添加 utils.swift 文件并在里面添加以下内容：

```swift
import Glibc

class Random {
  static let initialize:Void = {
    srandom(UInt32(time(nil)))
    return ()
  }()
}

func randomString(ofLength length:Int) -> String {
  Random.initialize
  let charactersString = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let charactersArray:[Character] = Array(charactersString.characters)
  
  var string = ""
  for _ in 0..<length {
    string.append(charactersArray[Int(random()) % charactersArray.count])
  }
               
  return string
}

func randomInt() -> Int {
  Random.initialize
  return Int(random() % 10000)
}
```

## Vapor MySQL

接下来是真正的代码，我们的 main.swift 文件使用了 Vapor MySQL 模块。

### 连接数据库
添加以下代码到 `Sources/main.swift` 中：

```swift
import Glibc
import MySQL

var mysql:Database
do {
  mysql = try Database(host:"localhost",
                       user:"swift",
                       password:"swiftpass",
                       database:"swift_test")
  try mysql.execute("SELECT @@version")
} catch {
  print("Unable to connect to MySQL:  \(error)")
  exit(-1)
}
```

以上代码设置数据库并且处理 mysql。构造器 `Database(host:String, user:String, password:String, database:String)` 一目了然。
语句 `try mysql.execute("SELECT @@version”)` 是用来测试保证我们连接正确，并成功连接到了数据库。如果 do 代码块运行无错误，接下来就可以开始操作数据库了！

### 整型和字符串

所有对 MySQL 的调用都将通过 `execute(_:String)` 方法。需要注意的是该方法和一些抽象 API 的方法不同，比如 `.create(table:String, ...)` 或者 `.insert(table:String, …`。`execute` 获取原始的 SQL 语句并传给 MySQL 连接器。

```swift
do {
  try mysql.execute("DROP TABLE IF EXISTS foo")
  try mysql.execute("CREATE TABLE foo (bar INT(4), baz VARCHAR(16))")

  for i in 1...10 {
    let int    = randomInt()
    let string = randomString(ofLength:16)
    try mysql.execute("INSERT INTO foo VALUES (\(int), '\(string)')")
  }

  // Query
  let results = try mysql.execute("SELECT * FROM foo")
  for result in results {
    if let bar = result["bar"]?.int,
       let baz = result["baz"]?.string {
      print("\(bar)\t\(baz)")
    }
  }
} catch {
  print("Error:  \(error)")
  exit(-1)
}
```

查询结果也是使用的 `execute(_:String)` 方法。但是返回的结果是一个 `[String:Node]` 字典。字典的 key 对应着数据库的列名。

`Node` 类型是 Vapor 中的数据结构，用于转化为不同的类型。你可以从[这里](https://github.com/vapor/node)获取更多的信息。使用 `Node` 类型来表达 MySQL 可以方便的转换成对应的 Swift 类型。比如：`let bar = result["bar"]?.int` 给我们一个整型。

### 继续

接着我们来看一些更复杂的例子，比如创建一个表，包含了 MySQL 的 DATE， POINT 和 JSON 数据类型。我们的表名叫 `samples`。

```swift
do {
  try mysql.execute("DROP TABLE IF EXISTS samples")
  try mysql.execute("CREATE TABLE samples (id INT PRIMARY KEY AUTO_INCREMENT, created_at DATETIME, location POINT, reading JSON)")

  // ... Date
  // ... Point
  // ... Sample
  // ... Insert
  // ... Query
} catch {
  print("Error:  \(error)")
  exit(-1)
}
```

要插入一个日期到数据库中，需要正确的 SQL 语句：

```swift
// ... Date
let now              = Date()
let formatter        = DateFormatter()
formatter.dateFormat = "yyyy-MM-dd HH:mm:ss" // MySQL will accept this format
let created_at       = formatter.string(from:date)
```

接下来使用 Swift 元组来创建一个 `POINT`：

```swift
// ... Point
let location = (37.20262, -112.98785) // latitude, longitude
```

最后，我们来处理 MySQL 5.7 中新的 JSON 数据类型，此外我们使用了 [Jay](http://dev.iachieved.it/iachievedit/working-with-mysql-databases-using-swift-3-0/?utm_source=rss&utm_medium=rss) 包来快速将一个 Swift 字典 `[String:Any]` 转换为 JSON 格式的字符串。

```swift
// ... Sample
  let sample:[String:Any] = [
    "heading":90,
    "gps":[
      "latitude":37.20262,
      "longitude":-112.98785
    ],
    "speed":82,
    "temperature":200
  ]
```

提示：你不需要显式在 Package.swift 中声明对 Jay 的依赖，因为在 MySQL 的包中已经包含了这个依赖。
接下来我们把 JSON 数据转换为 String，用来拼凑 MySQL 语句。

```swift
let sampleData = try Jay(formatting:.minified).dataFromJson(any:sample) // [UInt8]
let sampleJSON = String(data:Data(sampleData), encoding:.utf8)

```

这样我们就有了 date， point 和 JSON 字符串（sample) 了， 现在添加数据到 sample 表中：

```swift
// ... Insert
let stmt = "INSERT INTO samples (created_at, location, sample) VALUES ('\(created_at)', POINT\(point), '\(sampleJSON)')"
try mysql.execute(stmt)
```

请注意我们在处理 POINT 时候，使用了一些技巧。在对  \(point) 展开为字符串 (37.20262, -112.98785) 后，完整的字符串是 POINT(37.20262, -112.98785)，这是 MySQL 所需要的数据，整个语句的字符串如下：

```
INSERT INTO samples (created_at, location, sample) VALUES ('2016-09-21 22:28:44', POINT(37.202620000000003, -112.98784999999999), '{"gps":{"latitude":37.20262,"longitude":-112.98785},"heading":90,"speed":82,"temperature":200}')
```

### 获取结果

警告：在写这篇文章的时候(2016-09-22), Vapor MySQL 1.0.0 有一个 bug：在读取 POINT 数据类型时会 crash 掉，所以不得不在下面代码中加入 do 代码块，然后不使用 select 语句。
我们在 Vapor MySQL 中记录了这个 issue，等这个 issue 修复以后，我们将更新文章。

在下面的例子中，我们将使用 MySQL 5.7 中引入对 JSON 数据内部的查询特性，使用  SELECT … WHERE 查询 JSON 数据。在这里查询的是 samples 表中 JSON 数据类型 sample
中、speed 字段大于 80 的数据。

```
// ... 查询
  let results = try mysql.execute("SELECT created_at,sample FROM samples where JSON_EXTRACT(sample, '$.speed') > 80") 
  for result in results {
    if let sample      = result["sample"]?.object,
       let speed       = sample["speed"]?.int,
       let temperature = sample["temperature"]?.int,
       let created_at  = result["created_at"]?.string {
      print("Time:\(created_at)\tSpeed:\(speed)\tTemperature:\(temperature)")
    }
  }
```

这里做一些说明。JSON_EXTRACT 函数是用来 返回从 JSON 文档中的数据，根据传入的路径参数选择文档中满足条件的数据。在本例中，我们解包了列 sample 中的 speed 值。

为了循环处理结果，我们使用了 for result in results 语句，接着使用 if let 语句验证结果数据。首先使用 `let sample = result["sample"]?.object` 获取一个字典，对应 MySQL 中的 JSON 文档，这是一句关键的代码！Vapor MySQL 库并没有返回一个 String，而 String 还需进行 JSON 的解析。这个解析工作库已经帮你做了，所以你可以直接使用 sample 字典啦。

剩下的 let 语句给了我们 speed，temperature 和 created_at。注意 created_at 在 MySQL 中是 DATETIME 类型，我们读取它为字符串。为了在 Swift 中转换成 Date 类型，需要使用 .date(from:String) 方法加一个 DateFormatter 来做类型转换。

### 获取代码

如果你想直接运行代码，请到 [github](https://github.com/iachievedit/swift_mysql) 上下载我们的代码。
在任何地方使用 `swift build` 进行编译，运行可执行代码，不要忘了你还需要拥有一个数据库，用户名并且授权通过。
