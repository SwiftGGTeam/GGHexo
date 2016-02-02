title: "如何使用 OAuth 2.0 将 LinkedIn 集成入 iOS 应用"
date: 2016-02-03 09:00:00
tags: [AppCoda]
categories: [iOS 开发]
permalink: linkedin-sign-in
keywords: linkedin sign in,oauth2.0
custom_title: 
description: 想知道怎么让LinkedIn授权iOS应用并根据API调用相应操作吗，使用OAuth2.0就能轻易搞定哦。

---
原文链接=http://www.appcoda.com/linkedin-sign-in/
作者=Gabriel Theodoropoulos
原文日期=2016-1-3
译者=小铁匠Linus
校对=千叶知风
定稿=小锅
发布时间=2016-02-03T09:00:00

<!--此处开始正文-->

从很久以前开始，社交网络就成为了我们每天生活的一部分了。同时，社交网络也是我们程序员生活的一部分，绝大多数的应用都对进行了集成，用于接收和发送用户的信息。在大多数情况下，用户都被要求能在应用中绑定每个社交网络，并且授权该应用能代表用户发起*请求*。有很多这样的社交网络，比如 Facebook 和 Twitter 是使用比较频繁的。另外，iOS 也对 Facebook 和 Twitter 有内置的支持。但是，对于大多数其他的社交网络来说，开发者必须要配置一下才能成功地使得应用授权每个社交网络，并能代表用户发起请求。本教程中，我们将针对 **LinkedIn** 这样的一个社交网络演示如何使应用获得授权，并能与服务器传递受保护数据。
<!--more-->

有两种方式可以针对 LinkedIn 授权 iOS 应用并根据 API 调用相应操作。第一种是使用 LinkedIn 支持的 **OAuth 2.0** 协议。第二种可行的方式是使用 LinkedIn 提供的 iOS SDK，这种方式和其他第三方的 SDK 一样，要集成到工程并配置完毕才能使用。

在本教程中，我们只会关注第一种方法，也就是说，我们会使用 LinkedIn 和 OAuth 2.0 指南让用户在应用（不仅仅是 iOS 的应用）中登录，并授权以提供与服务器的数据传递。LinkedIn iOS SDK 也是一个很好的选择，但是我坚持使用 OAuth 是出于以下几点原因：

1. 老实说，我是被以下这种方式的交互给吸引的：在授权成功后，直接与服务器通过 REST API 调用来交互。

2. 关于 Linnked In iOS SDK 的使用，在 LinkedIn 已经有了很详细的教程，我不确定再写一篇相同主题的教程会有什么好处。

3. 在我看来，使用 LinkedIn iOS SDK 时会有一个缺点：必须在设备上安装 LinkedIn 的官方应用，否则不能登录和进行授权。这样在需要获取用户帐户信息，而用户不想仅仅为了登录而安装 LinkedIn 官方应用时，就会产生问题。

关于 OAuth 2.0 协议，没有什么可以多说的，你可以移步到该协议的[官方网站](http://oauth.net/2/)查看详情。简而言之，为了成功登录并授权，在本教程中我们会使用以下的步骤：

* 我们会在 [LinkedIn 开发者网站](https://developer.linkedin.com/)创建一个应用。同时，我们会得到 *Client ID* 和 *Client Secret*，这两个值会在后面的步骤中用的到。

* 我们会在 webview 中让用户登录 LinkedIn 账号。

* 通过上一步，添加一些必要数据后，让 LinkedIn 服务器返回一个*授权码*。

* 我们会交换授权码以获得 *access token*。

access token 是我们在使用 OAuth 时真正需要的。使用一个有效的 token，我们可以向 LinkedIn 服务器发起授权请求，并通过 get 或 post 请求获取用户的信息。

在我们行动之前，请确保你对 OAuth 2.0 的运行有一个基本的了解，和它的流程是什么。如果可以的话，建议看看其他资源以获得更多帮助（比如[这里](https://en.wikipedia.org/wiki/OAuth)，[这里](https://www.digitalocean.com/community/tutorials/an-introduction-to-oauth-2)还有[这里](http://tools.ietf.org/html/rfc6749)）。

说完了上面这些，让我们继续本教程的演示应用程序，然后直接过渡到实际的实现。我真的希望接下来我们要做的可以对你有些帮助。

LinkedIn 官方文档有以下这些链接可以作为参考：

* [关于 OAuth 2.0 ](https://developer.linkedin.com/docs/oauth2)

* [如何用 LinkedIn 登录](https://developer.linkedin.com/docs/signin-with-linkedin)

## 演示应用总览

我们将要实现的演示应用是由两个视图控制器构成的。第一个视图控制器（默认的 *ViewController* 类）里会有三个按钮：

1. 一个叫 **LinkedIn Sign In** 的按钮，用来初始化登录以及授权过程。

2. 一个叫 **Get my profile URL** 的按钮，使用 access token 发起授权请求后获得 profile URL。

3. 一个会显示 profile URL 的按钮，当点击它的时候会跳转到 Safari 打开相应的网页。

默认情况下，只有第一个按钮可以被点击。实际上，只要没有获取到 access token，它都是可以被点击的。在任何其他情况下，第一个按钮不能点击的时候，第二个按钮就可以被点击了。第三个按钮是隐藏的，但是当使用第二个按钮获取到 profile URL 的时候，第三个按钮就会显示出来了。

![](http://www.appcoda.com/wp-content/uploads/2015/12/view-controller-signin.png)

第二个视图控制器会包含一个 webview。我们可以使用 webview 来登录 LinkedIn 的帐号，并完成认证授权成功。这个视图控制器会在获取到授权所需的 access token 后就会消失（dismiss）。

![](http://www.appcoda.com/wp-content/uploads/2015/12/t47_2_user_sign_in.png)

与通常一样，我们不从头开始做项目，可以从[这里](https://www.dropbox.com/s/q7hjsbf51y1l6ok/LinkedInSignInStarter.zip?dl=0)下载一个初始的工程，然后在这个工程上开始。

我们会将注意力主要集中在如何获得 access token 上。我们也会根据 OAuth 2.0 协议和 LinkedIn 指南上的内容一步步操作。一旦我们获取到了 access token，就可以使用它来向 LinkedIn 请求授权了。一旦授权成功，我们就可以在 Safari 里通过我上面谈到的第三个按钮显示用户信息了。

在开始行动之前，确保你下载了之前的初始工程。如果没问题的话，就可以继续下去了。

## LinkedIn 开发者网站 - 创建一个应用

在我们的演示应用中，实现 OAuth 2.0 登录的第一步就是在 LinkedIn 开发者网站上创建一个应用。我们需要先访问[这个链接](https://www.linkedin.com/developer/apps) 如果你还未登录 LinkedIn 的话，网站会提示你要先进行登录。

*值得注意的是，如果你使用 Safari，并且在以下步骤中遇到任何问题，那就换另一个浏览器试试。我使用的是 Chrome 浏览器。*

点击网页的 **My Applications** 区域，然后你会看到一个叫 **Create Application** 的黄色按钮，点击它就可以创建我们之后要在 iOS APP 中进行连接的应用。

![](http://www.appcoda.com/wp-content/uploads/2015/12/t47_3_create_app_button.png)

接下来出现的表单中的每一项都必须填写。不用担心它需要你填写的公司名字或应用 logo，提交一些假数据即可。接着勾选“已阅读使用条款”，点击提交按钮。每一项带有红色星星的都必须填写，否则是不能继续下去的。下图是个例子：

![](http://www.appcoda.com/wp-content/uploads/2015/12/t47_4_create_new_app.png)

下一个界面就是我们需要的了：

![](http://www.appcoda.com/wp-content/uploads/2015/12/t47_5_app_settings.png)

正如你在上面的截图看到的，我们可以在这里找到我们需要的 *Client ID 和 Client Secret*。先不要关闭当前页面，我们下一步还要用到。同时，可以看看菜单选项窗口的左侧中其他的各种应用设置。

在这里有一个非常重要的任务(除了简单地访问客户端密钥外)，那就是把 **Authorized Redirect URLs** 这个表单给填上。当客户端应用尝试刷新已经存在的 access token 时，就需要 Authorized Redirect URL，且用户不需要再像一开始那样在网页浏览器里登录帐号。OAuth 会根据该 URL 自动重定向客户端应用。对于一个正常的登录操作来说，当我们在获取授权码和 access token 时，重定向的 URL 会在应用和服务器之间交换。不管怎样，这个 URL 必须存在并在之后和服务器端进行交换。

重定向的 URL 不需要是真实存在的 URL。它可以是任何以“https://”开头的值。我在这里设置的值如下，你也可以设置你想要的 URL：

```
https://com.appcoda.linkedin.oauth/oauth
```

*假如你使用的 URL 不是上面这个，那么，不要忘记在接下来的代码段里替换成你使用的 URL。*

一旦 authorized redirect URL 在 OAuth 2.0 中填写完毕，请务必点击 **Add** 按钮以添加到当前的应用中。

![](http://www.appcoda.com/wp-content/uploads/2015/12/t47_6_authorized_redirect_url.png)

同时，不要忘记点击屏幕下方的 **Update** 按钮。

关于默认的应用权限，本教程只是勾选了 “basic profile” 选项。当然，你也可以勾选更多的权限，或者在完成演示应用后再看看是否有需要添加的权限。值得注意的是，如果权限改变之后，用户必须重新登录来授权这些新的权限。

## 初始化授权过程

现在回到 Xcode 中的工程，我们将要实现 OAuth 2.0。在开始之前，打开 *WebViewController.swift* 文件。在该文件的最上面，你会发现两个变量分别叫 *linkedInKey* 和 *linkedInSecret*。你必须将应用的 Client ID 和 Client Secret 分别赋值给这两个变量（从 LinkedIn 开发者网站上复制拷贝即可）。

![](http://www.appcoda.com/wp-content/uploads/2015/12/t47_7_assigned_keys.png)

这一步的主要目的是通过加载 webview 获得*授权码*。Interface Builder 里的 *WebViewController* 自带一个 webview，因此我们可以直接在 *WebViewController* 的类中写相应的操作了。获取授权码的请求**必须**包含以下这些参数：

* **response_type**：填上 **code** 即可。
* **client_id**：LinkedIn 开发者网站上可以拿到的 Client ID，也就是已经在 *linkedInKey* 变量里保存的。
* **redirect_uri**：上一部分设置的重定向 URL 就填在这里。请确保复制粘帖没有出错。
* **state**：一个独一无二的字符串，避免跨站请求伪造（[cross-site request forgery (CSRF)](https://en.wikipedia.org/wiki/Cross-site_request_forgery)）。
* **scope**：应用请求的权限列表。

回到代码上来，在 `WebViewController` 类中创建一个用来发送请求的方法，并将其命名为 `startAuthorization()`。接着，将前面说到的请求参数都在这个方法中指定好，代码如下：

```swift
func startAuthorization() {
    // 指定响应类型应该是 "code".
    let responseType = "code"
 
    // 设置重定向 URL。增加的百分比 escape characthers 是必要的。
    let redirectURL = "https://com.appcoda.linkedin.oauth/oauth".stringByAddingPercentEncodingWithAllowedCharacters(NSCharacterSet.alphanumericCharacterSet())!
 
    // 创建一个基于时间间隔的随机字符串 (它将是这样的 linkedin12345679).
    let state = "linkedin\(Int(NSDate().timeIntervalSince1970))"
 
    // 设置首选的范围。
    let scope = "r_basicprofile"
}
```

值得注意的是，这里我们为 `redirectURL` 变量赋值了 authorized redirect URL 的值，同时，我们也用 *percent encoding characters* 来替换其中的特殊字符。这意味着，

```swift
https://com.appcoda.linkedin.oauth/oauth
```

会被转化成这样：

```swift
https%3A%2F%2Fcom.appcoda.linkedin.oauth%2oauth
```

(关于 URL-encoding 详情可见[这里](http://www.w3schools.com/tags/ref_urlencode.asp))

接下来，`state` 变量必须是一个独一无二的，且不容易被猜到的字符串。上面的代码中，我们把 “linkedin” 字符串和*当前时间戳（自 1970 年以来的时间间隔）的整数部分结合起来*，以确保这个值是唯一的。另外一种方式就是产生随机的字符追加到 `state` 变量后，如果你想这样做的话也是可行的。

最后，`scope` 变量会保存 “r_basicprofile”，这个字符串与我们在 LinkedIn 开发者网站上设置的权限相同。一旦你修改了应用的权限，确保这个字符串与[官方文档](https://developer.linkedin.com/docs/oauth2#permissions)中描述权限的内容相同。

我们下一步要做的就是 `compose` 这个 authorization URL。值得注意的是，`https://www.linkedin.com/uas/oauth2/authorization` 这个 URL 是必须要在请求中使用的，在之前代码中赋值给了 `authorizationEndPoint` 属性。

再看一下之前的代码：

```swift
func startAuthorization() {
    ...
 
    // 创建授权的 URL 字符串.
    var authorizationURL = "\(authorizationEndPoint)?"
    authorizationURL += "response_type=\(responseType)&"
    authorizationURL += "client_id=\(linkedInKey)&"
    authorizationURL += "redirect_uri=\(redirectURL)&"
    authorizationURL += "state=\(state)&"
    authorizationURL += "scope=\(scope)"
 
    print(authorizationURL)
}
```

其中，添加了 `print` 语句，可以在控制台看看最终构成的请求是什么样的。

最后，就是在我们的 webview 里加载这个请求。如果前面这些属性都设置正确的话，用户就能在 webview 里进行登录了；否则的话，LinkedIn 就会返回错误信息，并且无法继续下去了。因此，确保你把 Client Key 、Secret 和 authorized redirect URL 都设置正确。

在 webview 中加载请求，只需要几行代码：

```swift
func startAuthorization() {
    ...
 
    // 创建一个 URL 请求和负载的 web 视图。
    let request = NSURLRequest(URL: NSURL(string: authorizationURL)!)
    webView.loadRequest(request)
}
```

在结束这一部分之前，我们必须调用上面的这个应该发生在 `viewDidLoad(_: )` 中的方法：

```swift
override func viewDidLoad() {
    ...
 
    startAuthorization()
}
```

这时候，你就可以试着运行一下这个应用来测试了。如果你都设置正确的话，你就能看到以下的界面了：

![](http://www.appcoda.com/wp-content/uploads/2015/12/t47_2_user_sign_in.png)

这时候还不要登录你的 LinkedIn 帐号，因为我们还没有一些操作没有完成。尽管如此，假如你看到登录界面，然后获取了授权码，并成功登录的话，LinkedIn 会跳回浏览器（也就是我们的 web view）。

下图是我们在控制台打印的 `authorizationURL` 变量的值：

![](http://www.appcoda.com/wp-content/uploads/2015/12/t47_8_authorization_request.png)

## 获取授权码

我们可以通过 `webView(:shouldStartLoadWithRequest:navigationType)` 方法实现加载之前已经准备好的请求。在该方法中，我们可以“抓取”到 LinkedIn 的 response，并从中提取授权码。

实际上，一个包含授权码的 response 大概是以下这样的：

```
http://com.appcoda.linkedin.oauth/oauth?code=AQSetQ252oOM237XeXvUreC1tgnjR-VC1djehRxEUbyZ-sS11vYe0r0JyRbe9PGois7Xf42g91cnUOE5mAEKU1jpjogEUNynRswyjg2I3JG_pffOClk&state=linkedin1450703646
```

这也就意味着，我们需要将这个字符串分割开来，并获取其中 “code” 的值。两件事情要注意：第一，我们必须确定该方法中的 URL 是我们需要的，第二，我们必须确定 response 中有授权码。下面是代码：

```swift
func webView(webView: UIWebView, shouldStartLoadWithRequest request: NSURLRequest, navigationType: UIWebViewNavigationType) -> Bool {
    let url = request.URL!
    print(url)
 
    if url.host == "com.appcoda.linkedin.oauth" {
        if url.absoluteString.rangeOfString("code") != nil {
 
        }
    }
 
    return true
}
```

首先，我们通过 `request` 参数获取 URL。接着，我们先检查了 URL 的 `host` 属性是否为 LinkedIn 的。假如是我们需要的话，接着确保 URL 中包含 “code” 单词，如果没有授权码的话就会返回 nil。

将字符串分割开来并不困难。为了简单化，我们把任务分成了两步：

```swift
func webView(webView: UIWebView, shouldStartLoadWithRequest request: NSURLRequest, navigationType: UIWebViewNavigationType) -> Bool {
    let url = request.URL!
    print(url)
 
    if url.host == "com.appcoda.linkedin.oauth" {
        if url.absoluteString.rangeOfString("code") != nil {
            // 提取授权 code。
            let urlParts = url.absoluteString.componentsSeparatedByString("?")
            let code = urlParts[1].componentsSeparatedByString("=")[1]
 
            requestForAccessToken(code)
        }
    }
 
    return true
}
```

除了新添加的两行代码，你也可以看到另外调用了一个叫 `requestForAccessToken(_: )` 的方法。这个一个新的自定义方法，它将在下一部分内容中进行实现。在该方法的调用中，我们会通过授权码获取 access token。

正如你看到的，我们现在离使用 OAuth 2.0 获取 access token 只有一步之遥了。到目前为止，我们已经创建了获取授权码的请求，授权过程中允许用户登录，并最终提取授权码。

如果你想在现阶段运行应用的话，只要将 `requestForAccessToken(_: )` 这行代码注释掉就可以成功运行了。在你需要添加打印命令时不要犹豫，这样你就能很清楚的知道每一步发生了什么。

## 请求 access token

目前为止，所有与 LinkedIn 的通讯都是通过 web view 实现的。从现在开始，我们将只使用 RESTful 请求（POST 和 GET 请求）来通讯。准确点说，我们会使用一个 POST 请求获取 access token，再使用一个 GET 请求访问用户信息。

是时候讲讲上一部分提到的 `requestForAccessToken()` 方法了。我们会在该方法中执行三个不同的任务：

1. 准备 POST 请求的参数。

2. 初始化并配置好一个可变的 URL 请求对象（`NSMutableURLRequest`）。

3. 实例化 `NSURLSession` 对象，并执行一个 data task request。假如我们获取到了正确的 response，我们也会将 access token 添加到 UserDefaults 的字典中。

## 准备 POST 请求的参数

与获取授权码的准备过程类似，我们也需要一些特定的参数来请求 access token。这些参数有：

* **grant_type**：填写 `authorization_code` 即可。

* **code**：上一部分获取到的授权码。

* **redirect_uri**：我们之前就谈论过的 authorized redirection URL。

* **client_id**：Client Key 的值。

* **client_secret**：Client Secret 的值。

上一部分我们获取到的授权码是由方法的输入参数给定的。我们先来指定 “grant_type” 和 “redirect_uri” 参数：

```swift
func requestForAccessToken(authorizationCode: String) {
    let grantType = "authorization_code"
 
    let redirectURL = "https://com.appcoda.linkedin.oauth/oauth".stringByAddingPercentEncodingWithAllowedCharacters(NSCharacterSet.alphanumericCharacterSet())!
}
```

其他所有参数都是“已知的”，将它们组合成一个字符串：

```swift
func requestForAccessToken(authorizationCode: String) {
    ...
 
    // 设置 POST 参数。
    var postParams = "grant_type=\(grantType)&"
    postParams += "code=\(authorizationCode)&"
    postParams += "redirect_uri=\(redirectURL)&"
    postParams += "client_id=\(linkedInKey)&"
    postParams += "client_secret=\(linkedInSecret)"
}
```

如果你之前使用过 `NSMutableURLRequest` 类来执行 POST 请求，那么你就知道 POST 请求的参数不能是字符串的；而必须将它们转换成 `NSData` 对象并赋值给请求的 `HTTPBody`（我们之后会谈到）。因此，让我们来转换 `postParams` 吧：

```swift
func requestForAccessToken(authorizationCode: String) {
    ...
 
    // 转换 POST 参数 为一个 NSData 对象.
    let postData = postParams.dataUsingEncoding(NSUTF8StringEncoding)
}
```

## 配置 URL 请求对象

准备好 POST 参数之后，我们可以初始化并配置 `NSMutableURLRequest` 对象了。使用 URL 获取 [access token](https://www.linkedin.com/uas/oauth2/accessToken) 时，`NSMutableURLRequest` 对象的初始化就会发生了，且获取到的 access token 会赋值给 `accessTokenEndPoint` 属性。

```swift
func requestForAccessToken(authorizationCode: String) {
    ...    
 
    // 使用 access token endpoint URL string 初始化一个可变的 URL 请求对象
    let request = NSMutableURLRequest(URL: NSURL(string: accessTokenEndPoint)!)
}
```

接下来，是时候构建我们想要的 `request` 对象了，同时也要传入 POST 参数：

```swift
func requestForAccessToken(authorizationCode: String) {
    ...
 
    // 标明我们将要发起的请求类型为 POST 请求
    request.HTTPMethod = "POST"
 
    // 将之前创建的 postData 对象设置给 HTTP body 
    request.HTTPBody = postData
}
```

根据 LinkedIn 的文档，请求的 `Content-Type` 应该被设置成使用 `application/x-www-form-urlencoded` 的值：

```swift
func requestForAccessToken(authorizationCode: String) {
    ...
 
    // 为请求添加 HTTP header
    request.addValue("application/x-www-form-urlencoded;", forHTTPHeaderField: "Content-Type")
}
```

就这样，请求对象的设置就完成了。

## 执行请求

我们会使用 `NSURLSession` 类的实例来执行获取 access token 的请求。我们会发起一个 *data task request*，并在完成处理器（completion handler）里处理 LinkedIn 服务器发回的 response：

```swift
func requestForAccessToken(authorizationCode: String) {
    ...
 
    // 初始化 NSURLSession 对象
    let session = NSURLSession(configuration: NSURLSessionConfiguration.defaultSessionConfiguration())
 
    // 发起请求
    let task: NSURLSessionDataTask = session.dataTaskWithRequest(request) { (data, response, error) -> Void in
 
    }
 
    task.resume()
}
```

如果请求成功的话，LinkedIn 服务器就会返回包含 access token 的 JSON 数据。因此，我们的任务就是将获取到的 JSON 数据转换成 `dictionary` 对象，并提取出 access token。当然，只有在 HTTP 状态码返回 200 时，才意味着是一个成功的请求。

```swift
func requestForAccessToken(authorizationCode: String) {    
    ...
 
    // 发起请求
    let task: NSURLSessionDataTask = session.dataTaskWithRequest(request) { (data, response, error) -> Void in
        // 获取请求的 HTTP 状态码
        let statusCode = (response as! NSHTTPURLResponse).statusCode
 
        if statusCode == 200 {
            // 将 JSON 数据转换成字典
            do {
                let dataDictionary = try NSJSONSerialization.JSONObjectWithData(data!, options: NSJSONReadingOptions.MutableContainers)
 
                let accessToken = dataDictionary["access_token"] as! String
            }
            catch {
                print("Could not convert JSON data into a dictionary.")
            }
        }
    }
 
    task.resume()
}
```

值得注意的是，整个过程包含在 `do-catch` 语句里，因为从 Swift 2.0 开始该语句支持抛出异常（没有 error 参数）了。在我们的演示应用中，我们不需要考虑异常的情况，因此我们只需要在控制台显示一条消息即可。假如都正常运行的话，我们会将 JSON 数据（闭包中的 `data` 参数）转换成字典（`dataDictionary` 对象），接着我们就能直接访问 access token了。

接下来干什么呢？简单地将其保存在 UserDefaults 字典中，并 dismiss 视图控制器：

```swift
func requestForAccessToken(authorizationCode: String) {    
    ...
 
    // 发起请求
    let task: NSURLSessionDataTask = session.dataTaskWithRequest(request) { (data, response, error) -> Void in
        // 获取请求的 HTTP 状态码
        let statusCode = (response as! NSHTTPURLResponse).statusCode
 
        if statusCode == 200 {
            // 将 JSON 数据转换成字典
            do {
                ...
 
                NSUserDefaults.standardUserDefaults().setObject(accessToken, forKey: "LIAccessToken")
                NSUserDefaults.standardUserDefaults().synchronize()
 
                dispatch_async(dispatch_get_main_queue(), { () -> Void in
                    self.dismissViewControllerAnimated(true, completion: nil)
                })                
            }
            catch {
                print("Could not convert JSON data into a dictionary.")
            }
        }
    }
 
    task.resume()
}
```

值得注意的是，在主线程中视图控制器已经被 dismiss 了。任何 UI 相关的操作都必须在应用的主线程进行，而不是在后台（background），这是必须牢记的。如上面的闭包（closures）是在后台执行的。

我们最终的目的已经完成了。我们设法获得 access token 来“解锁”几个 API 特性。

## 获取用户信息 URL

我们会通过访问用户信息 URL（我们会在 Safari 中打开）来展示 access token 的简单用法。但是，在我们动手之前，我们先来讨论一下其它的东西。如下图所示，当你开启应用时，你会看到以下两个按钮：

![](http://www.appcoda.com/wp-content/uploads/2015/12/view-controller-signin.png)

默认情况下，**LinkedIn Sign In** 按钮是可点击的，**Get my profile URL** 按钮是禁用的。既然我们已经获得了 access token，那么第二个按钮就需要是可用的，并使得第一个按钮不可用。我们该怎么实现这个功能呢？

一种方法是可以使用委托模式，通过委托方法我们可以通知 `ViewController` 类 access token 已经被获取了，所以让第二个按钮启用。另外一种方法是从 `WebViewController` 类里 post 自定义的通知(`NSNotification`)，并在 `ViewController` 里观察。这两种方法都能很好的实现这个功能，但是还有第三种方法：我们在 `ViewController` 里检查 UserDefaults 字典中是否存在 access token，如果存在的话，我们将禁用登录按钮，并让第二个按钮可用。否则的话，我们就让界面保留成上图那样子。

我们会在 `ViewController` 类中创建一个方法用来检查。值得注意的是，还有第三个按钮（`btnOpenProfile` IBOutlet 属性），它默认是隐藏的。当我们获取到用户信息 URL 时，它就会可见了，因为我们会将 URL 字符串设置成它的标题（我们过会会聊到）。

现在，让我们来定义这个行方法：

```swift
func checkForExistingAccessToken() {
    if NSUserDefaults.standardUserDefaults().objectForKey("LIAccessToken") != nil {
        btnSignIn.enabled = false
        btnGetProfileInfo.enabled = true
    }
}
```

我们会在 `viewWillAppear(_: )` 中调用这个方法：

```swift
override func viewWillAppear(animated: Bool) {
    super.viewWillAppear(animated)
 
    checkForExistingAccessToken()
}
```

从现在开始，这个应用已经能在 `ViewController` 界面中正常启用和禁用两个按钮了。

现在，让我们将注意力关注到 `getProfileInfo(_: )` 这个 IBAction 方法。**Get my profile URL** 按钮被点击时，这个方法会被调用。这时，我们会使用 access token 向 LinkedIn 服务器发起一个 GET 请求来获取用户信息 URL。这一步的操作与之前准备发起请求获取 access token 类似。

因此，让我们从请求的 URL 字符串入手吧。值得注意的是，如果你不知道你需要什么 URL 或 参数，你就应该去官方文档的指南里去寻找。

```swift
@IBAction func getProfileInfo(sender: AnyObject) {
    if let accessToken = NSUserDefaults.standardUserDefaults().objectForKey("LIAccessToken") {
        // 为 targetURLString 赋值用户信息对应的 URL 字符串
        let targetURLString = "https://api.linkedin.com/v1/people/~:(public-profile-url)?format=json"
    }
}
```

值得注意的是，我们再次检查 access token 是否真的存在，将其作为一个额外的措施。通过使用 `if-let` 语句，将其赋值给 `accessToken` 常量。而且，以上的 URL 就会保存用户信息 URL。不要忘记在发起任何请求之前都要向用户申请权限。在我们的例子中，我们只是请求基本的信息。

我们接着创建一个 `NSMutableURLRequest` 对象，我们将设置“GET”作为所需的 HTTP 方法。另外，我们还要指定 HTTP header，即是 access token。

```swift
@IBAction func getProfileInfo(sender: AnyObject) {
    if let accessToken = NSUserDefaults.standardUserDefaults().objectForKey("LIAccessToken") {
        ...
 
        // 初始化一个可变的 URL 请求对象
        let request = NSMutableURLRequest(URL: NSURL(string: targetURLString)!)
 
        // 标明我们将要发起的请求类型为 GET 请求 
        request.HTTPMethod = "GET"
 
        // 为 HTTP header 添加 access token
        request.addValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")        
    }
}
```

最后，再次使用 `NSURLSession` 和 `NSURLSessionDataTask` 这两个类：

```swift
@IBAction func getProfileInfo(sender: AnyObject) {
    if let accessToken = NSUserDefaults.standardUserDefaults().objectForKey("LIAccessToken") {
        ...
 
        // 初始化 NSURLSession 对象
        let session = NSURLSession(configuration: NSURLSessionConfiguration.defaultSessionConfiguration())
 
        // 发起请求
        let task: NSURLSessionDataTask = session.dataTaskWithRequest(request) { (data, response, error) -> Void in
 
        }
 
        task.resume()
    }
}
```

如果请求成功（HTTP 状态码 ＝ 200）的话，那么闭包中的 `data` 参数会包含服务器返回的 JSON 数据。正如我们之前实现的，我们必须将 JSON 数据转换成字典，并最终获取用户信息 URL 字符串。

```swift
@IBAction func getProfileInfo(sender: AnyObject) {
    if let accessToken = NSUserDefaults.standardUserDefaults().objectForKey("LIAccessToken") {
        ...
 
        // 发起请求
        let task: NSURLSessionDataTask = session.dataTaskWithRequest(request) { (data, response, error) -> Void in
            // 获取请求的 HTTP 状态码
            let statusCode = (response as! NSHTTPURLResponse).statusCode
 
            if statusCode == 200 {
                // 将 JSON 数据转换成字典
                do {
                    let dataDictionary = try NSJSONSerialization.JSONObjectWithData(data!, options: NSJSONReadingOptions.MutableContainers)
 
                    let profileURLString = dataDictionary["publicProfileUrl"] as! String
                }
                catch {
                    print("Could not convert JSON data into a dictionary.")
                }
            }
        }
 
        task.resume()
    }
}
```

我们会将 `profileURLString` 变量的值设置为 `btnOpenProfile` 按钮的标题，且按钮变得可见。记得我们现在在后台线程进行操作，因此我们要切回到主线程：

```swift
@IBAction func getProfileInfo(sender: AnyObject) {
    if let accessToken = NSUserDefaults.standardUserDefaults().objectForKey("LIAccessToken") {
        ...
 
        // 发起请求
        let task: NSURLSessionDataTask = session.dataTaskWithRequest(request) { (data, response, error) -> Void in
            // 获取请求的 HTTP 状态码
            let statusCode = (response as! NSHTTPURLResponse).statusCode
 
            if statusCode == 200 {
                // 将 JSON 数据转换成字典
                do {
                    ...
 
                    dispatch_async(dispatch_get_main_queue(), { () -> Void in
                        self.btnOpenProfile.setTitle(profileURLString, forState: UIControlState.Normal)
                        self.btnOpenProfile.hidden = false
 
                    })
                }
                catch {
                    print("Could not convert JSON data into a dictionary.")
                }
            }
        }
 
        task.resume()
    }
}
```

点击 **Get my profile URL** 按钮后，成功获取 access token 后，就会在第三个按钮上显示 URL。

![](http://www.appcoda.com/wp-content/uploads/2015/12/t47_9_get_profile_url.png)

## Safari 中显示页面

我们已经通过 access token 和 LinkedIn API 获取到了用户信息 URL，现在是时候验证它是否正确了。因为我们将 URL 设置为按钮的标题了，所以最快的验证方法就是点击按钮来打开 URL 对应的页面。这个实现也是很简单的，所以我就不细讲了，直接上代码：

```swift
@IBAction func openProfileInSafari(sender: AnyObject) {
    let profileURL = NSURL(string: btnOpenProfile.titleForState(UIControlState.Normal)!)
    UIApplication.sharedApplication().openURL(profileURL!)
}
```

以上的最后一行代码会打开 Safari，并加载和显示对应页面。

![](http://www.appcoda.com/wp-content/uploads/2015/12/t47_10_open_profile.png)

## 总结

你可能已经注意到了，本教程已经到了尾声，但是我还没有讲如何废除（revoke）和刷新（refresh）access token。有几个原因要讲一下：尽管废除 access token 也是很重要的，但是 LinkedIn 并没有提供相应的 API。因此，一旦你想让你的应用停止发起授权请求时，最好是从你的存储（数据库，用户默认等）里直接删除 access token。还有，一个 access token 的有效期是 60 天（这是我在写这篇文章时官方文档里的说法）。LinkedIn 建议在过期前刷新 access token，而且刷新的过程也只是重新验证和授权。如果 access token 当前是有效的话，用户不需要重复登录，所有一切操作都会发生在后台，且 access token 也会被自动刷新，有效期为新的 60 天。然而，在一般情况下，上面这种方式主要适用于 web 应用，而不是 iOS 应用中。后台自动刷新的基本先决条件是用户已经登录了他们的 LinkedIn 账号，很显然这对于嵌套在应用内 webview 并不适用。因此，假如 access token 快过期了，你就需要让用户再次登录了。更多的信息可以看看[这里“Refresh your Access Tokens”部分](https://developer.linkedin.com/docs/oauth2)。

就讲这么多了。我希望你能从本教程中获得一些帮助，并最终设法让你也能完成 LinkedIn 的授权请求。

你可以从 GitHub 上下载[完整的 Xcode 项目](https://github.com/appcoda/LinkedInSignInDemo)供参考。