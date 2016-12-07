title: "基于点阵图来构建 Bezier 路径"
date: 2016-12-07
tags: [iOS 开发]
categories: [Erica Sadun]
permalink: building-a-bezier-path-from-a-bitmap
keywords: bezier曲线,点阵图,bitmap
custom_title: iOS 绘制贝塞尔曲线
description: 本文描述了如何基于点阵图来构建贝塞尔曲线路径的方法，可以很方便地实现类似 PaintCode 的相关功能。

---
原文链接=http://ericasadun.com/2013/03/15/building-a-bezier-path-from-a-bitmap/
作者=Erica Sadun
原文日期=2013-03-15
译者=星夜暮晨
校对=Crystal Sun
定稿=CMB

<!--此处开始正文-->

![](http://ericasadun.com/wp-content/uploads/2013/03/3j3zywg-300x180.png)

我现在正在努力地编写那本关于 UIKit / Quartz 的书，书中描述了很多使用 Bezier 路径绘图的案例。今天，在进行了一天忙碌的写作之后，我现在决定好好休息、放松一下。

因此我登上了 IRC (Internet Relay Chat)，在那里我遇到了一个很有意思的挑战。它是以 Clarus the dog cow 的形式出现的（译者注：一只像牛的狗，这个卡通形象由苹果传奇图形设计师 SusanKare 设计，在早期的 Mac 系统中，用来显示打印页面的朝向）。这只狗狗是以点阵图 (bitmap) 的形式出现的，通常情况下将其转换为 `UIImage` 并不是一件很容易的事。当然我觉得，应该有一种通用的方法能够将其转换为可重复使用的路径。

<!--more-->

而今，受到[我对 PaintCode 的评论](http://www.tuaw.com/2013/03/15/devjuice-paintcode-offers-new-photoshop-import-iap/)的启示，我决定创建一个通用的「点阵图→Bezier 路径」方法来解决这个问题。我最终将会得到一个扩展类 (Category)，能够将字节转换为易于绘制的 `UIBezierPath`。

```objective-c
@implementation UIBezierPath (BitmapExtension)
+ (UIBezierPath *) pathFromBitmap: (NSData *) data size: (CGSize) size
{
    Byte *bytes = (Byte *) data.bytes;
    CFIndex height = size.height;
    CFIndex width = size.width;

    if (height * width != data.length)
    {
        NSLog(@"Error: size does not match data's available bytes");
        return nil;
    }

    UIBezierPath *bezierPath = [UIBezierPath bezierPath];
    for (CFIndex y = 0; y < height; y++)
    {
        for (CFIndex x = 0; x < width; x++)
        {
            CFIndex index = y * width + x;
            if (bytes[index] != 0)
            {
                UIBezierPath *path = [UIBezierPath bezierPathWithRect:CGRectMake(x, y, 1, 1)];
                [bezierPath appendPath:path];
            }
        }
    }

    return bezierPath;
}
```

> *译者注*
>
> 评论中有人提问：如何将这个点阵图转换为 `NSData` 对象呢？
>
> Clarus 的点阵图代码可以在这里找到：[https://gist.github.com/erica/5224282](https://gist.github.com/erica/5224282)