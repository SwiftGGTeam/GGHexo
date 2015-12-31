在团队开发中使用 CocoaPods 的小技巧"

> 作者：Natasha The Robot，[原文链接](http://natashatherobot.com/cocoapods-on-a-team/)，原文日期：2015-12-18
> 译者：[JackAlan](http://ijack.pw/)；校对：[Cee](https://github.com/Cee)；定稿：[千叶知风](http://weibo.com/xiaoxxiao)
  









在我工作的一个团队中，我们有很多关于安装 CocoaPods 的问题。团队成员拥有不同的 `cocoapods gem` 的安装版本，并且当有人运行 `pod install` 时，会将事情搞得一团糟。

我们最终不得不委托一人安装 CocoaPods，并且把工程推到 GitHub 上以供我们使用。这显然是不够灵活的，并且对于我们团队或者是委托人来说都不是一个很满意的解决方式。



我跟 [@NeoNacho](https://twitter.com/NeoNacho) 提到了这个问题，他是 CocoaPods 的核心贡献者，并且他提供了我们急需的那个解决方案。使用 `Gemfile`！

你可以在 `Gemfile` 中指定 `cocoapods gem` 的使用版本。

    ruby
    source 'https://rubygems.org'
    
    gem 'cocoapods', '0.39.0'

（译者注：在大天朝还是换成 `source 'https://ruby.taobao.org'` 这个吧。）

当你更新了 Gemfile 文件并且自动安装了正确版本的 gem 后，确保团队的每个成员都运行一次 `bundle install` 这条命令。

此后，只需要运行 `bundle exec pod install` 这条命令来安装新的 CocoaPods——这将会确保通过你在的 Gemfile 中指定 `cocoapods gem` 的版本后，`pods` 仍可以被正确的安装。

感谢 [@NeoNacho](https://twitter.com/NeoNacho) 提供的小技巧。

**更新**：获取更多如何在项目中使用 `Gemfile` 的信息，请参阅 [Cocoapods Guide on Using a Gemfile](https://guides.cocoapods.org/using/a-gemfile.html)。感谢 [@orta](https://twitter.com/orta/status/677972879988932608)！
> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。