为什么 guard 比 if 好

> 作者：Natasha，[原文链接](http://natashatherobot.com/swift-guard-better-than-if/)，原文日期：2015/07/16
> 译者：[靛青K](http://www.dianqk.org/)；校对：[numbbbbb](https://github.com/numbbbbb)；定稿：[numbbbbb](https://github.com/numbbbbb)
  








Swift 2.0 带来了令人激动的`guard`语句。但很多人还是不太理解`guard`的意义，特别是和 Swift 2.0 之前的简单`if`语句相比较。    

这是个有意思的问题，所以到底为什么`guard`就是比`if`要好呢？让我们来好好分析一下……    



## 示例代码   

这里我们使用另一篇博文 [错误处理](http://natashatherobot.com/swift-2-error-handling/) 中的例子，一个带有姓名和年龄的简单表格。在开始之前我们先来看下这个例子。    

这次我们要关注`viewModel`部分，特别是`createPerson()`方法：    

    
    struct Person {
        let name: String
        var age: Int
    }
    
    struct PersonViewModel {
        var name: String?
        var age: String?
        
        enum InputError: ErrorType {
            case InputMissing
            case AgeIncorrect
        }
        
        func createPerson() throws -> Person {
            guard let age = age, let name = name
                where name.characters.count > 0 && age.characters.count > 0 else {
                    throw InputError.InputMissing
            }
            
            guard let ageFormatted = Int(age) else {
                throw InputError.AgeIncorrect
            }
            
            return Person(name: name, age: ageFormatted)
        }
    }     

下面介绍在`createPerson()`方法中使用`guard`的好处：    

## 鞭尸金字塔    

下面是一个很经典的例子－－让人想鞭尸的 Swift 金字塔。这个是使用`if`语句写出来的`createPerson()`方法：    

    
        func createPersonNoGuard() -> Person? {
            if let age = age, let name = name
                where name.characters.count > 0 && age.characters.count > 0
            {
                if let ageFormatted = Int(age) {
                    return Person(name: name, age: ageFormatted)
                } else {
                    return nil
                }
            } else {
                return nil
            }
        }     

当然了，鞭尸金字塔在 Swift 1.2 中可以使用一行代码处理可选值，这样会好一点，但一点也不优美，并且很难一眼就明白这个方法的含义（其实就是创建了一个 Person 的实例）。    

和上面的 guard 实现相比，使用 guard 可以很容易地看到 Person 实例的返回值，这样就能明白这个方法的主要目的是什么。

## 返回可选值    

使用`if`语句编写`createPerson()`时，我们需要限制返回值的情况。    

我的理解是需要返回一个 **optional Person** （这个 Person 实例可能有也可能没有）。在调用这个方法的时候就要加上一层鞭尸金字塔来处理返回的结果：    

    
    let personViewModel = PersonViewModel(name: "Taylor Swift", age: "25")
    
    if let person = personViewModel.createPersonNoGuard() {
        // DO SOMETHING IN ANOTHER PYRAMID OF DOOM HERE
    }     

但如果你想让这个方法更完善一些，就需要加入错误提示，返回错误时告诉使用者表格信息不完整。这时，你需要将代码改成这样：    

    
        enum PersonResult {
            case Success(Person)
            case Failure(errorText: String)
        }
        
        func createPersonNoGuard() -> PersonResult {
            if let age = age, let name = name
                where name.characters.count > 0 && age.characters.count > 0
            {
                if let ageFormatted = Int(age) {
                    let person = Person(name: name, age: ageFormatted)
                    return PersonResult.Success(person)
                } else {
                    return PersonResult.Failure(errorText: "The age is invalid!")
                }
            } else {
                return PersonResult.Failure(errorText: "Information is Missing!")
            }
        }    

这种 Haskell 形式的返回枚举值的解决方法还不错，但这里**返回了一个 PersonResult，而不是 Person**，这就意味着你可以忽视返回的错误结果。    

    
    if case .Success(let person) = personResult {
        print("Success! Person created")
    }
    // Error case not addressed     

现在我们有了新的 guard 语句，这就意味着**返回值一定是一个 Person 对象**，并且编译器会要求你必须处理返回错误的情况：     

<center>
![](http://swift.gg/img/articles/swift-guard-better-than-if/Screen-Shot-2015-07-16-at-5.47.01-AM.png)
</center>     

所以在使用 guard 的时候，需要用这样的语法捕捉错误信息：     

    
    do {
        let person = try personViewModel.createPerson()
        print("Success! Person created. \(person)")
    } catch PersonViewModel.InputError.InputMissing {
        print("Input missing!")
    } catch PersonViewModel.InputError.AgeIncorrect {
        print("Age Incorrect!")
    } catch {
        print("Something went wrong, please try again!")
    }    

## Happy-Path 编程    

最后，最有意思的是，和其他编程语法（中类似 if 和 guard 的语句）相比，使用 guard 会强迫你编写 happy-path，如果出错会提前退出，从而必须处理可能发生的错误。这让我想到了幽冥的 [Railway Oriented Programming](http://fsharpforfunandprofit.com/rop/) 话题。     

<center>
![](http://swift.gg/img/articles/swift-guard-better-than-if/Recipe_Railway_Transparent.png)
</center>    

你会持续编写正确的代码，程序一旦运行出错就会提前退出。这是一种非常优美的处理代码的方式，没有任何复杂的函数语法。看下面这段代码，你能立即发现 happy-path ：     

    
        func createPerson() throws -> Person {
            guard let age = age, let name = name
                where name.characters.count > 0 && age.characters.count > 0
                else {
                    throw InputError.InputMissing
            }
            
            guard let ageFormatted = Int(age) else {
                throw InputError.AgeIncorrect
            }
            
            return Person(name: name, age: ageFormatted)
        }     

guard 还有什么重要的特性呢，请在评论中告诉我！
