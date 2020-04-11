## URL 处理的问题

> 已经全部手工处理，有一些原文图片已经失效，都在文章开头做了标记。

主要以下几个问题：

### 问题一：文件与官网 url 不符合

- 描述：Markdown 里的 image url 和实际 SwiftGG 官网文章里的 url 不符。
- 举例：主要表现为 Markdown 的 image url 为：`/img/articles/3d-touch-tutorial/3dtouch-intro.jpg1500171554.09` 然而网站里是 Appcoda 的 url `http://www.appcoda.com/wp-content/uploads/2015/11/3dtouch-intro.jpg`
- 范围：主要集中在 2015 年的文章里。
- 解决措施：不作处理。

- 发现问题的文件：

1. https://swift.gg/2015/11/19/3d-touch-tutorial/ 3D Touch介绍：电子秤App与快捷操作.md

   1. /img/articles/3d-touch-tutorial/3dtouch-intro.jpg1500171554.09
   2. https://swift.gg/img/articles/3d-touch-tutorial/3dtouch-intro.jpg1500171554.09
   3. http://www.appcoda.com/wp-content/uploads/2015/11/3dtouch-intro.jpg
2. https://swift.gg/2015/12/03/expandable-table-view/ GGHexo/backup/2015/20151203_expandable-table-view.md
   1. http://www.appcoda.com/wp-content/uploads/2015/09/expandable-uitableview.jpg
3. https://swift.gg/2015/12/22/alamofire-beginner-guide/ GGHexo/backup/2015/20151222_The Absolute Guide to Networking in Swift with Alamofire.md
   1. http://www.appcoda.com/wp-content/uploads/2015/11/thangiving-app-coda-20151-1024x768.png
4. https://swift.gg/2015/12/08/building-a-todo-app-using-realm-and-swift/
   1. http://www.appcoda.com/wp-content/uploads/2015/10/realm-db-1024x683.jpg
5. https://swift.gg/2015/11/25/tvos-introduction/ GGHexo/backup/2015/20151125_tvos-introduction.md
   1. http://www.appcoda.com/wp-content/uploads/2015/10/IMG_3302-1024x683.jpg
6. https://swift.gg/2015/12/14/a-beginners-guide-to-nsdate-in-swift/ GGHexo/backup/2015/20151214_a-beginners-guide-to-nsdate-in-swift.md
   1. http://www.appcoda.com/wp-content/uploads/2015/09/nsdate-featured.jpg

### 问题二：原图片挂了

- 描述：Markdown 文件里的图片 url 本身就挂了
- 举例：主要表现为托管在又拍云上的图片：`http://swiftgg-main.b0.upaiyun.com/img/building-ios-interfaces-subclassing-views-11.jpg` 。个别为原博客链接：`http://dev.iachieved.it/iachievedit/wp-content/uploads/2016/04/cleverTapCredentials.png`
- 范围：主要集中在 2015、2016 年的文章里。
- 解决措施：不作处理。

- 发现问题的文件：

1. https://swift.gg/2015/12/10/reduce-all-the-things/  GGHexo/backup/2015/20151210_reduce-all-the-things.md
      1. http://7xiol9.com1.z0.glb.clouddn.com/pic测试结果.png
      2. http://7xiol9.com1.z0.glb.clouddn.com/pic%E6%B5%8B%E8%AF%95%E7%BB%93%E6%9E%9C.png
2. https://swift.gg/2015/08/28/swift_when_the_functional_approach_is_not_right/ GGHexo/backup/2015/20150828_swift-when-the-functional-approach-is-not-right.md
      1. /img/articles/swift_when_the_functional_approach_is_not_right/MyPlayground_playground1.png
      2. https://swift.gg/img/articles/swift_when_the_functional_approach_is_not_right/MyPlayground_playground1.png
3. GGHexo/backup/2016/20160816_building-ios-interfaces-subclassing-views.md
      1. http://swiftgg-main.b0.upaiyun.com/img/building-ios-interfaces-subclassing-views-11.jpg
4. GGHexo/backup/2016/20160928_transformative-streams.md
      1. http://swiftgg-main.b0.upaiyun.com/image/transformative-streams-2.png
5. GGHexo/backup/2016/20160628_adding-siri-to-ios-10-apps-in-swift-tutorial.md
      1. http://swiftgg-main.b0.upaiyun.com/img/adding-siri-to-ios-10-apps-in-swift-tutorial-1.png
6. GGHexo/backup/2016/20161021_service-agnostic-mobile-analytics.md
      1. http://dev.iachieved.it/iachievedit/wp-content/uploads/2016/04/cleverTapCredentials.png
7. GGHexo/backup/2016/20160714_xcode-8-create-an-animated-imessage-sticker.md
8. GGHexo/backup/2016/20160701_mqtt-with-swift-on-linux.md
9. GGHexo/backup/2016/20160803_swift-prettify-your-print-statements-pt-1.md
10. GGHexo/treasure/20160708_using-rxswift-in-practice.md
      1. http://o9m6k9jl7.bkt.clouddn.com/result_1.png "登录例子"
      2. http://o9m6k9jl7.bkt.clouddn.com/result_1.png%20%22%E7%99%BB%E5%BD%95%E4%BE%8B%E5%AD%90%22

### 问题三：src 里面的 svg 挂掉

- 举例：svg 格式的图片全部失效：`/img/articles/nshipster-bundles-and-packages/packages-and-bundles-diagram-a604d818c7decc7430fffc8642f0743728d2f6be4dfae15b274a599655cd3e40.svg1563524952.9887984` 官网依旧失效。
- 范围：只发生在 src 今年的文章中，就只有两篇。
- 解决措施：只加了 `https://swift.gg` 的头，并没有做其他处理。
- 发现问题的文件：

1. GGHexo/src/20190115_nshipster-language-server-protocol.md
2. GGHexo/src/20190719_nshipster-bundles-and-packages.md

### 其他问题：本身已转义不需要转义

这种文件就人工跳过了。只发生在 natashatherobot.com 这家的文章里，有两个文件：

1. GGHexo/backup/2016/20160809_magical-view-rotation-with-stackview.md
   1. https://www.natashatherobot.com/wp-content/uploads/Main_storyboard_%E2%80%94_Edited_and_Glass-768x399.png
2. GGHexo/backup/2016/20160810_button-animation-stackview.md
   1. https://www.natashatherobot.com/wp-content/uploads/Main_storyboard_%E2%80%94_Edited_and_MyPlayground_playground-1024x444.png

## 总结

- `treasure`：有一个（GGHexo/treasure/20160525.md）又拍云原图片失效，有一个（GGHexo/treasure/20160708_using-rxswift-in-practice.md）clouddn.com 存储的原图片失效。
- `backup/2015`：问题一问题二都有不少
- `backup/2016`：问题一问题二都有不少
- `backup/2017`：没问题
- `backup/2018`：没问题
- `src`：只有两个例子是 svg 失效。

其他大部分为加 https://swift.gg 头就行了。很少的需要 url encode。

